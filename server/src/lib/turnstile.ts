// Cloudflare Turnstile server-side verification. Use on endpoints a bot could
// abuse (contact-seller, lead submission). Auth login/register use Supabase's
// NATIVE captcha integration instead (token passed to supabase-js) — see
// src/lib/auth.js — so they aren't verified here.
//
// No-op (returns true) when TURNSTILE_SECRET_KEY is unset, so local dev works.
import type { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true; // disabled (dev)
  if (!token) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false; // fail closed
  }
}

/** preHandler: rejects the request unless a valid Turnstile token is present. */
export async function requireTurnstile(req: FastifyRequest, reply: FastifyReply) {
  const token = (req.body as { turnstileToken?: string } | undefined)?.turnstileToken;
  const ok = await verifyTurnstile(token, req.ip);
  if (!ok) {
    reply.code(403).send({ error: 'Preverjanje (captcha) ni uspelo', statusCode: 403 });
  }
}
