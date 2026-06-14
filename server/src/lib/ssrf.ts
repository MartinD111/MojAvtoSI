// SSRF protection for importing external photos by URL (#13). An attacker could
// otherwise point an "image URL" at internal infra (169.254.169.254 metadata,
// 10.x, localhost, the DB, etc.) and have OUR server fetch it. This validates the
// URL, resolves DNS, and refuses any private / link-local / loopback target —
// re-checking after each redirect (DNS-rebinding safe-ish).
import { lookup } from 'node:dns/promises';
import net from 'node:net';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_CONTENT = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number) as [number, number];
    if (a === 10 || a === 127 || a === 0) return true; // private / loopback / "this"
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  const v = ip.toLowerCase();
  return (
    v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || // ULA
    v.startsWith('fe80') || v.startsWith('::ffff:') // link-local / IPv4-mapped
  );
}

async function assertPublicHost(hostname: string) {
  // Reject if the host is already a private literal.
  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw Object.assign(new Error('Blocked address'), { statusCode: 400 });
  }
  const records = await lookup(hostname, { all: true });
  if (records.length === 0) throw Object.assign(new Error('Unresolvable host'), { statusCode: 400 });
  for (const r of records) {
    if (isPrivateIp(r.address)) {
      throw Object.assign(new Error('Blocked address'), { statusCode: 400 });
    }
  }
}

/**
 * Safely fetch a remote image. Enforces https, public host, max size, and an
 * allowed content-type. Returns the bytes + content type for re-upload to R2.
 */
export async function safeFetchImage(rawUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw Object.assign(new Error('Invalid URL'), { statusCode: 400 });
  }
  if (url.protocol !== 'https:') {
    throw Object.assign(new Error('Only https URLs are allowed'), { statusCode: 400 });
  }
  await assertPublicHost(url.hostname);

  // `redirect: 'manual'` — we don't auto-follow into a re-validation gap. If the
  // origin 3xx-redirects, reject; callers can re-submit the final URL.
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
  if (res.status >= 300 && res.status < 400) {
    throw Object.assign(new Error('Redirects are not allowed'), { statusCode: 400 });
  }
  if (!res.ok) throw Object.assign(new Error('Fetch failed'), { statusCode: 400 });

  const contentType = (res.headers.get('content-type') || '').split(';')[0]!.trim();
  if (!ALLOWED_CONTENT.has(contentType)) {
    throw Object.assign(new Error('Unsupported image type'), { statusCode: 400 });
  }
  const len = Number(res.headers.get('content-length') || 0);
  if (len > MAX_BYTES) throw Object.assign(new Error('Image too large'), { statusCode: 400 });

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw Object.assign(new Error('Image too large'), { statusCode: 400 });
  }
  return { buffer, contentType };
}
