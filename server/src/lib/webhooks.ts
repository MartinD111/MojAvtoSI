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
