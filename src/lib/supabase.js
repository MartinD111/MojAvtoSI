// Browser Supabase client — replaces Firebase Auth + Firestore on the frontend.
// Uses the anon key; Row Level Security (supabase/policies.sql) enforces access.
// The session (JWT) is persisted in localStorage and auto-refreshed.
import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

export const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // OAuth (Google) + email-link redirects
  },
});

/** Current user's access token (for calling the API), or null. */
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Current user object, or null. */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
