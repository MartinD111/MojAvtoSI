// Open-redirect / phishing protection for `returnTo`-style params. Only same-app
// relative paths are allowed; any absolute URL (http://evil.com, //evil.com,
// scheme-relative, or with a backslash trick) is rejected → fall back to home.
//
// Use everywhere you read a redirect target from the URL/query (post-login, etc.).
export function safeReturnTo(value, fallback = '/') {
  if (typeof value !== 'string' || value === '') return fallback;
  // Must start with a single "/" and not "//" or "/\" (protocol-relative tricks).
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  // Reject anything that parses as an absolute URL with a host.
  try {
    const u = new URL(value, window.location.origin);
    if (u.origin !== window.location.origin) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
