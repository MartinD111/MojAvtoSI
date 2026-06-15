// ─────────────────────────────────────────────────────────────────────────────
// Central, validated environment config. Fail fast at boot if anything required
// is missing. Every external service reads its credentials from here — never
// from process.env directly elsewhere.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  // Comma-separated list of allowed browser origins (the two portals + localhost).
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,https://mojavto.si,https://mojanavtika.si'),

  // ── Supabase (DB + Auth) ──────────────────────────────────────────────
  SUPABASE_URL: z.string().url(),
  // Service-role key: server-only, bypasses RLS. NEVER ship to the browser.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Anon/public key — used only to verify user JWTs.
  SUPABASE_ANON_KEY: z.string().min(1),
  // JWT secret from Supabase project settings (for local token verification).
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),

  // ── Upstash Redis (rate limiting) ─────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // ── Cloudflare R2 (public images, S3-compatible) ──────────────────────
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  // Public CDN base URL fronting the bucket (custom domain via Cloudflare).
  R2_PUBLIC_BASE_URL: z.string().url(),

  // ── AWS S3 (private system storage: invoices, exports, backups) ────────
  AWS_REGION: z.string().default('eu-central-1'),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),

  // ── Typesense (search / filtering) ────────────────────────────────────
  TYPESENSE_HOST: z.string().min(1),
  TYPESENSE_PORT: z.coerce.number().default(443),
  TYPESENSE_PROTOCOL: z.enum(['http', 'https']).default('https'),
  TYPESENSE_ADMIN_API_KEY: z.string().min(1),
  // Scoped search-only key handed to the browser (read-only).
  TYPESENSE_SEARCH_ONLY_API_KEY: z.string().min(1),

  // ── Resend (transactional email) ──────────────────────────────────────
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_AVTO: z.string().default('MojAvto.si <info@mojavto.si>'),
  RESEND_FROM_NAVTIKA: z.string().default('MojaNavtika.si <info@mojanavtika.si>'),

  // ── Sentry (error tracking) ───────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),

  // ── PostHog (product analytics, server-side capture) ──────────────────
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().default('https://eu.i.posthog.com'),

  // ── Cloudflare Turnstile (anti-bot) ───────────────────────────────────
  // Secret key for server-side siteverify. Unset → verification disabled (dev).
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // ── Webhook signing secrets ───────────────────────────────────────────
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Invalid environment configuration:\n',
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
    process.exit(1);
  }
  return parsed.data;
}

export const env = load();
export type Env = z.infer<typeof schema>;

export const isProd = env.NODE_ENV === 'production';
export const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
