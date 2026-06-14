// Shared input constraints — the server's hard boundary. Mirrored on the
// frontend (src/lib/validation.js) for UX, but THIS is the authority: never
// trust client validation.
//
// Covers: max-length caps (anti-DoS / overflow), zero-emoji policy, and the
// bcrypt 72-byte password ceiling (Supabase Auth hashes with bcrypt, which
// silently truncates beyond 72 bytes — so a 200-char "password" is a footgun).
import { z } from 'zod';

// Emoji + pictographs + regional indicators (flags). Rejected everywhere a human
// types a name/title — keeps display names, business names, listing titles clean
// and prevents homoglyph/spoofing via emoji.
export const EMOJI_RE = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}]/u;

export const noEmoji = (msg = 'Emoji znaki niso dovoljeni') =>
  (v: string) => !EMOJI_RE.test(v) || msg;

/** A bounded, emoji-free, trimmed text field. */
export function boundedText(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !EMOJI_RE.test(v), { message: 'Emoji znaki niso dovoljeni' });
}

// ── Auth field constraints ───────────────────────────────────────────────────
// RFC 5321 caps an email address at 254 chars; cap hard to stop long-input DoS.
export const emailField = z.string().trim().toLowerCase().email().max(254);

// Login: only cap the upper bound (don't reveal policy / don't reject existing
// long passwords). 128 is well past bcrypt's effective 72 bytes but blocks abuse.
export const loginPasswordField = z.string().min(1).max(128);

// Signup: enforce real policy. Max 72 because bcrypt ignores bytes past that.
export const signupPasswordField = z
  .string()
  .min(8, 'Geslo mora imeti vsaj 8 znakov')
  .max(72, 'Geslo je lahko dolgo največ 72 znakov');

export const displayNameField = boundedText(2, 60);

// Limits, exported so the frontend and forms can reuse the exact numbers.
export const LIMITS = {
  email: 254,
  loginPassword: 128,
  signupPassword: 72,
  displayName: 60,
  message: 2000,
  listingTitle: 120,
  listingDescription: 5000,
} as const;
