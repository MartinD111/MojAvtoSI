// Cloudflare Turnstile widget helper (browser). Renders the invisible/managed
// widget and resolves a one-time token to send with sensitive requests
// (contact-seller, lead forms) or to pass to Supabase Auth as `captchaToken`.
//
// No-op (resolves null) when VITE_TURNSTILE_SITE_KEY is unset, so dev works.
import { ENV } from './env.js';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
let scriptPromise = null;

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Render Turnstile into an element and resolve the token once solved.
 * @param {HTMLElement} el  container element
 * @returns {Promise<string|null>} token, or null if Turnstile is disabled
 */
export async function getTurnstileToken(el) {
  if (!ENV.turnstileSiteKey) return null;
  const turnstile = await loadScript();
  return new Promise((resolve) => {
    turnstile.render(el, {
      sitekey: ENV.turnstileSiteKey,
      callback: (token) => resolve(token),
      'error-callback': () => resolve(null),
    });
  });
}
