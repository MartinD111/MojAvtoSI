// Honeypot anti-bot. Forms render a hidden field (e.g. `website`) that humans
// never see/fill. If it arrives non-empty, the caller is a bot: we ban the IP in
// Redis for a while and reject. The global rate-limit hook checks `isBanned`
// first, so a tripped bot is cheaply blocked on every subsequent request too.
import type { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from './redis.js';

const HONEYPOT_FIELDS = ['website', 'company_url', '_hp']; // keep in sync with forms
const BAN_TTL_SECONDS = 24 * 60 * 60; // 24h
const banKey = (ip: string) => `ban:ip:${ip}`;

export async function isBanned(ip: string): Promise<boolean> {
  return (await redis.exists(banKey(ip))) === 1;
}

export async function banIp(ip: string, ttl = BAN_TTL_SECONDS) {
  await redis.set(banKey(ip), '1', { ex: ttl });
}

/** preHandler: if any honeypot field is filled, ban the IP and reject. */
export async function honeypotGuard(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const tripped = HONEYPOT_FIELDS.some((f) => {
    const v = body[f];
    return typeof v === 'string' && v.trim() !== '';
  });
  if (tripped) {
    await banIp(req.ip);
    // Respond like a normal validation failure — don't tell the bot it was caught.
    reply.code(400).send({ error: 'Neveljaven vnos', statusCode: 400 });
  }
}
