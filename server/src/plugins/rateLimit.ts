// Rate limiting backed by Upstash Redis (distributed — works across multiple
// Fargate tasks, unlike in-memory limiting). A sliding window per client IP.
// Authenticated users are keyed by user id; everyone else by IP.
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../lib/redis.js';
import { isProd } from '../config/env.js';

// Global default limiter. Tighter per-route limiters can be created the same way
// and applied as a route preHandler (e.g. email/upload endpoints).
const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, '1 m'), // 120 req / minute / client
  analytics: true,
  prefix: 'rl:global',
});

export const writeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // mutations: 20 / minute
  prefix: 'rl:write',
});

// ── IP-keyed limiters (NOT account-keyed) ────────────────────────────────────
// Abuse-prone endpoints are throttled by IP so an attacker can't bypass the cap
// by spinning up many accounts. Sending/contact/lead flows use these.
export const ipEmailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 outbound messages / hour / IP
  prefix: 'rl:email-ip',
});

export const ipAuthLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 auth-ish attempts / 15 min / IP
  prefix: 'rl:auth-ip',
});

// (#9) Presigned-URL minting is especially abuse-prone (each call grants write
// access to object storage), so it gets its own VERY low per-IP ceiling.
export const ipUploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '1 m'), // 15 presign requests / minute / IP
  prefix: 'rl:upload-ip',
});

/**
 * Enforce a limiter keyed by client IP. Throws a 429 (statusCode set) on limit.
 * Always on (even in dev) so the IP throttle is testable; callers gate per-env.
 */
export async function enforceIpLimit(limiter: Ratelimit, ip: string) {
  const { success } = await limiter.limit(`ip:${ip}`);
  if (!success) {
    throw Object.assign(new Error('Preveč zahtevkov, poskusite kasneje'), { statusCode: 429 });
  }
}

function clientKey(req: { ip: string; user: { id: string } | null }) {
  return req.user?.id ?? req.ip;
}

const plugin: FastifyPluginAsync = async (app) => {
  // Skip rate limiting in non-prod so local dev isn't throttled.
  if (!isProd) return;

  app.addHook('onRequest', async (req, reply) => {
    if (req.url === '/healthz' || req.url === '/readyz') return;
    const { success, limit, remaining, reset } = await globalLimiter.limit(clientKey(req));
    reply.header('X-RateLimit-Limit', limit);
    reply.header('X-RateLimit-Remaining', remaining);
    reply.header('X-RateLimit-Reset', reset);
    if (!success) {
      reply.code(429).send({ error: 'Too many requests', statusCode: 429 });
    }
  });
};

export const rateLimitPlugin = fp(plugin, { name: 'rate-limit', dependencies: ['auth'] });
