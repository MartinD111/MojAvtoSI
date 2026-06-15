// Webhook signature verification (#15). External async events (Resend delivery
// events, later Stripe payments) MUST be cryptographically verified before we
// act on them — otherwise anyone who knows the URL can forge "payment succeeded".
//
// Resend uses Svix-style signatures: an HMAC-SHA256 over `${id}.${timestamp}.${body}`
// keyed by the (base64) part of a `whsec_...` secret, compared in constant time.
import crypto from 'node:crypto';

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verify a Svix/Resend webhook.
 * @param secret  the `whsec_...` signing secret
 * @param headers svix-id / svix-timestamp / svix-signature
 * @param rawBody the EXACT received body bytes
 */
export function verifySvixSignature(
  secret: string,
  headers: { id?: string; timestamp?: string; signature?: string },
  rawBody: Buffer | string,
): boolean {
  const { id, timestamp, signature } = headers;
  if (!secret || !id || !timestamp || !signature) return false;

  // Reject stale events (replay protection): 5-minute tolerance.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signed = `${id}.${timestamp}.${typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', key).update(signed).digest('base64');

  // The header may carry multiple space-separated `v1,<sig>` entries.
  return signature
    .split(' ')
    .map((part) => part.split(',')[1] ?? part)
    .some((sig) => timingSafeEqual(sig, expected));
}

/**
 * Verify a Stripe webhook signature (the `Stripe-Signature` header). Same shape
 * as Stripe's SDK does internally: HMAC-SHA256 of `${t}.${body}` keyed by the
 * `whsec_...` endpoint secret, constant-time compared, with a replay window.
 * (Use this in the Stripe payments webhook when payments land — see
 * routes/webhooks.ts. Avoids pulling the full Stripe SDK just to verify.)
 */
export function verifyStripeSignature(
  secret: string,
  header: string | undefined,
  rawBody: Buffer | string,
  toleranceSeconds = 300,
): boolean {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((kv) => kv.split('=') as [string, string]),
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  return timingSafeEqual(v1, expected);
}
