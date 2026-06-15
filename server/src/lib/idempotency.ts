// Idempotency keys (Redis) — defends against form replay / double-submit and
// duplicate payment processing. The client sends an `Idempotency-Key` header (a
// UUID it generates once per logical action). The first request claims the key;
// duplicates within the TTL are rejected with 409.
//
// Also exposes a mutex helper for cache-stampede protection (single rebuilder).
import type { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from './redis.js';

const DEFAULT_TTL = 60 * 10; // 10 minutes

/**
 * Claim an idempotency key. Returns true if this is the FIRST time we've seen it
 * (proceed), false if it's a replay (reject).
 */
export async function claimIdempotencyKey(key: string, ttl = DEFAULT_TTL): Promise<boolean> {
  // SET key value NX EX ttl → only sets (returns OK) if not already present.
  const res = await redis.set(`idem:${key}`, '1', { nx: true, ex: ttl });
  return res === 'OK';
}

/** preHandler factory: enforce an `Idempotency-Key` header on a route. */
export function requireIdempotency(ttl = DEFAULT_TTL) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || key.length < 8 || key.length > 200) {
      return reply.code(400).send({ error: 'Idempotency-Key required', statusCode: 400 });
    }
    const first = await claimIdempotencyKey(key, ttl);
    if (!first) {
      reply.code(409).send({ error: 'Duplicate request', statusCode: 409 });
    }
  };
}

/**
 * Mutex for cache reconstruction (#thundering-herd). Only the holder rebuilds;
 * others should wait/retry. Returns a release fn, or null if the lock is held.
 */
export async function acquireLock(name: string, ttl = 30): Promise<(() => Promise<void>) | null> {
  const key = `lock:${name}`;
  const ok = await redis.set(key, '1', { nx: true, ex: ttl });
  if (ok !== 'OK') return null;
  return async () => {
    await redis.del(key);
  };
}
