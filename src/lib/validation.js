// Frontend input constraints — mirror of server/src/lib/validation.ts. These are
// for UX (instant feedback, input maxLength); the SERVER is the real authority.
// Keep the numbers in sync with the server LIMITS.

// Emoji / pictographs / regional indicators / variation selectors / ZWJ.
export const EMOJI_RE = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}]/u;

export const LIMITS = {
  email: 254,
  loginPassword: 128, // upper cap only; bcrypt truncates at 72 bytes
  signupPassword: 72,
  displayName: 60,
  message: 2000,
  listingTitle: 120,
  listingDescription: 5000,
};

export function hasEmoji(value) {
  return EMOJI_RE.test(value || '');
}

/** Strip emoji from a string (use on input handlers for zero-emoji fields). */
export function stripEmoji(value) {
  return (value || '').replace(new RegExp(EMOJI_RE, 'gu'), '');
}

/** Truncate to a max length (defensive — pair with input maxLength attr). */
export function clamp(value, max) {
  return (value || '').slice(0, max);
}

/** Validate a signup password. Returns null if OK, else a message. */
export function validateSignupPassword(pw) {
  if (!pw || pw.length < 8) return 'Geslo mora imeti vsaj 8 znakov';
  if (pw.length > LIMITS.signupPassword) return 'Geslo je lahko dolgo največ 72 znakov';
  return null;
}
