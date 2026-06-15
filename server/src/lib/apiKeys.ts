// B2B API keys (for dealer inventory-sync scripts). We NEVER store the raw key —
// only its SHA-256 hash, exactly like a password. On each request we hash the
// presented key and compare (constant-time) against the stored hash, so a DB
// leak doesn't expose usable keys, and there's no enumeration oracle.
//
// Keys are also pinnable to a dealer's static IP allow-list (verified by the
// caller before trusting the key).
import crypto from 'node:crypto';

const PREFIX = 'mav_'; // identifies our keys in logs without revealing them

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

/** Generate a new key: return the RAW key (shown once) + the hash to store. */
export function generateApiKey(): { raw: string; hash: string; last4: string } {
  const raw = PREFIX + crypto.randomBytes(24).toString('base64url');
  return { raw, hash: hashApiKey(raw), last4: raw.slice(-4) };
}

/** Constant-time compare of a presented key against a stored hash. */
export function verifyApiKey(presented: string, storedHash: string): boolean {
  const a = Buffer.from(hashApiKey(presented), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Is the caller IP within the dealer's configured allow-list (if any)? */
export function ipAllowed(ip: string, allowList: string[] | null | undefined): boolean {
  if (!allowList || allowList.length === 0) return true; // no restriction set
  return allowList.includes(ip);
}
