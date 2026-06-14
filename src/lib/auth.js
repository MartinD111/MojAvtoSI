// Auth wrapper over Supabase Auth. Mirrors the shape the app already expects
// from the old Firebase auth helpers so call sites migrate with minimal churn.
//
// Security posture:
//  - User-enumeration protection: login always returns ONE generic error, never
//    "no such email" vs "wrong password". Password reset always reports success.
//  - Input bounds: email/password length-capped before hitting the network
//    (anti-DoS; bcrypt truncates passwords past 72 bytes so we cap signup there).
//  - Bot protection: an optional Turnstile captchaToken is passed to Supabase's
//    native captcha (enable it in dashboard → Auth → Attack Protection).
//  - Email verification + password reset are handled by Supabase — configure the
//    Slovenian templates + redirect URLs in the dashboard.
import { supabase } from './supabase.js';
import { LIMITS, clamp, validateSignupPassword } from './validation.js';

// Single generic message — must NOT distinguish "unknown email" from "bad
// password", or it becomes an account-enumeration oracle.
const GENERIC_AUTH_ERROR = 'Napačen e-naslov ali geslo.';

export async function registerWithEmail(email, password, displayName, { captchaToken } = {}) {
  const pwError = validateSignupPassword(password);
  if (pwError) throw new Error(pwError);

  const { data, error } = await supabase.auth.signUp({
    email: clamp(email, LIMITS.email).trim().toLowerCase(),
    password,
    options: {
      data: { display_name: displayName ? clamp(displayName, LIMITS.displayName) : undefined },
      ...(captchaToken ? { captchaToken } : {}),
    },
  });
  // With "Confirm email" ON, Supabase returns an obfuscated user for an existing
  // address (no enumeration). Surface a generic failure on any error.
  if (error) throw new Error('Registracija ni uspela. Preverite podatke in poskusite znova.');
  return data.user;
}

export async function loginWithEmail(email, password, { captchaToken } = {}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: clamp(email, LIMITS.email).trim().toLowerCase(),
    password: clamp(password, LIMITS.loginPassword),
    ...(captchaToken ? { options: { captchaToken } } : {}),
  });
  if (error) throw new Error(GENERIC_AUTH_ERROR); // never leak which field was wrong
  return data.user;
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw new Error('Prijava z Googlom ni uspela.');
  return data;
}

export async function sendPasswordReset(email, { captchaToken } = {}) {
  // Always behave the same whether or not the email exists — no enumeration.
  await supabase.auth
    .resetPasswordForEmail(clamp(email, LIMITS.email).trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/#/reset-password`,
      ...(captchaToken ? { captchaToken } : {}),
    })
    .catch(() => undefined);
  return { ok: true }; // generic success regardless of outcome
}

export async function logout() {
  await supabase.auth.signOut();
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
