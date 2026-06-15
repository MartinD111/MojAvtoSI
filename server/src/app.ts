// Builds and configures the Fastify instance. Kept separate from index.ts so it
// can be imported by tests without binding a port.
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rawBody from 'fastify-raw-body';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { env, corsOrigins, isProd } from './config/env.js';
import { authPlugin } from './plugins/auth.js';
import { rateLimitPlugin } from './plugins/rateLimit.js';
import { sentryErrorHandler } from './lib/sentry.js';
import { healthRoutes } from './routes/health.js';
import { uploadRoutes } from './routes/uploads.js';
import { searchRoutes } from './routes/search.js';
import { listingRoutes } from './routes/listings.js';
import { auctionRoutes } from './routes/auctions.js';
import { leadRoutes } from './routes/leads.js';
import { emailRoutes } from './routes/emails.js';
import { webhookRoutes } from './routes/webhooks.js';
import { internalRoutes } from './routes/internal.js';

// (#4) Secure defaults for any cookie we set. Sessions are Bearer-token based,
// but anything cookie-borne (CSRF token, SSR session) MUST carry these.
export const SECURE_COOKIE = {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict' as const,
  path: '/',
};

// (#11) Strict Content Security Policy. Allow-list only the origins we actually
// call. connect-src is derived from configured services so it stays in sync.
function buildCsp() {
  const supabase = env.SUPABASE_URL;
  const typesense = `${env.TYPESENSE_PROTOCOL}://${env.TYPESENSE_HOST}`;
  const posthog = env.POSTHOG_HOST;
  return {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"], // anti-clickjacking
      formAction: ["'self'"],
      scriptSrc: ["'self'", 'https://challenges.cloudflare.com'], // Turnstile
      frameSrc: ['https://challenges.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', env.R2_PUBLIC_BASE_URL, supabase],
      connectSrc: [
        "'self'",
        supabase,
        `wss://${supabase.replace(/^https?:\/\//, '')}`, // Supabase realtime
        typesense,
        posthog,
        'https://*.ingest.sentry.io',
        'https://*.ingest.de.sentry.io',
      ],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  };
}

export async function buildApp() {
  const app = Fastify({
    logger: isProd
      ? { level: 'info' }
      : { level: 'debug', transport: { target: 'pino-pretty' } },
    // Trust the ALB / Cloudflare proxy so req.ip is the real client IP.
    trustProxy: true,
    bodyLimit: 2 * 1024 * 1024, // 2 MB — uploads go direct to R2 via presigned URLs
  });

  // ── Security headers + CORS ──────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: buildCsp(),
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
  });
  await app.register(cors, { origin: corsOrigins, credentials: true });
  await app.register(cookie, { parseOptions: SECURE_COOKIE });

  // (#15) Raw body (opt-in per route) so webhook signatures verify over the exact
  // received bytes, not a re-serialized object.
  await app.register(rawBody, { field: 'rawBody', global: false, encoding: false });

  // ── Cross-cutting plugins ────────────────────────────────────────────
  // Order matters: auth decorates request.user, which the rate limiter keys on.
  await app.register(authPlugin);
  await app.register(rateLimitPlugin);

  // ── Routes ───────────────────────────────────────────────────────────
  await app.register(healthRoutes); // /healthz, /readyz — unprefixed for the ALB
  await app.register(webhookRoutes, { prefix: '/webhooks' }); // raw-body, signed
  await app.register(internalRoutes, { prefix: '/internal' }); // cron-secret guarded
  await app.register(
    async (api) => {
      await api.register(uploadRoutes);
      await api.register(searchRoutes);
      await api.register(listingRoutes);
      await api.register(auctionRoutes);
      await api.register(leadRoutes);
      await api.register(emailRoutes);
    },
    { prefix: '/api' },
  );

  // ── Error handling (#17) ─────────────────────────────────────────────
  // Validation → 400 with field issues. Everything else → generic message + an
  // error UUID the user can quote; the full error (incl. any DB detail / stack)
  // goes ONLY to Sentry + server logs, never to the client.
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Neveljaven vnos',
        statusCode: 400,
        issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }

    const status = (error as { statusCode?: number }).statusCode ?? 500;
    const message = error instanceof Error ? error.message : 'Napaka';
    if (status < 500) {
      // Expected client errors (401/403/404/429): safe message, no UUID noise.
      return reply.code(status).send({ error: message, statusCode: status });
    }

    const errorId = randomUUID();
    sentryErrorHandler(error, request, errorId);
    request.log.error({ err: error, errorId }, 'unhandled error');
    return reply.code(500).send({
      error: 'Prišlo je do napake. Navedite to kodo ob prijavi težave.',
      errorId,
      statusCode: 500,
    });
  });

  return app;
}
