// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE login form — reference implementation of the new auth flow so the real
// login page can be migrated off Firebase without integration guesswork.
//
// Demonstrates, end to end:
//   • Supabase login via src/lib/auth.js (generic error → no user enumeration)
//   • Cloudflare Turnstile token passed to Supabase as captchaToken
//   • Honeypot hidden field (bots fill it → server bans the IP)
//   • input maxLength caps from shared LIMITS
//   • safe post-login redirect (open-redirect protection)
//
// Usage:
//   import { mountLoginForm } from './examples/loginFormExample.js';
//   mountLoginForm(document.getElementById('login-root'));
// ─────────────────────────────────────────────────────────────────────────────
import { loginWithEmail, loginWithGoogle } from '../lib/auth.js';
import { getTurnstileToken } from '../lib/turnstile.js';
import { safeReturnTo } from '../lib/redirect.js';
import { LIMITS } from '../lib/validation.js';

export function mountLoginForm(container) {
  container.innerHTML = `
    <form class="login-form" novalidate autocomplete="on">
      <h2>Prijava</h2>
      <label>E-naslov
        <input name="email" type="email" maxlength="${LIMITS.email}" required autocomplete="email" />
      </label>
      <label>Geslo
        <input name="password" type="password" maxlength="${LIMITS.loginPassword}" required autocomplete="current-password" />
      </label>

      <!-- Honeypot: visually hidden, off-screen, not focusable. A human never
           fills this; a bot will. Keep the name in sync with the server's
           HONEYPOT_FIELDS ('website'). -->
      <div aria-hidden="true" style="position:absolute;left:-9999px;height:0;overflow:hidden">
        <label>Website<input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
      </div>

      <!-- Turnstile widget renders here (no-op if VITE_TURNSTILE_SITE_KEY unset) -->
      <div class="cf-turnstile-host"></div>

      <p class="form-error" role="alert" hidden></p>
      <button type="submit">Prijava</button>
      <button type="button" class="google-btn">Prijava z Googlom</button>
    </form>
  `;

  const form = container.querySelector('form');
  const errorEl = container.querySelector('.form-error');
  const submitBtn = form.querySelector('button[type="submit"]');
  const turnstileHost = form.querySelector('.cf-turnstile-host');

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    try {
      const fd = new FormData(form);

      // Client-side honeypot short-circuit (server also enforces + bans).
      if (String(fd.get('website') || '').trim() !== '') return;

      // Get a fresh Turnstile token (null when Turnstile is disabled in dev).
      const captchaToken = await getTurnstileToken(turnstileHost);

      await loginWithEmail(fd.get('email'), fd.get('password'), { captchaToken });

      // Safe redirect: only same-origin relative paths are honored.
      const params = new URLSearchParams(window.location.search);
      window.location.assign(safeReturnTo(params.get('returnTo'), '/'));
    } catch (err) {
      // auth.js already returns a single generic message (no enumeration).
      showError(err?.message || 'Napačen e-naslov ali geslo.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  form.querySelector('.google-btn').addEventListener('click', async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      showError(err?.message || 'Prijava z Googlom ni uspela.');
    }
  });
}
