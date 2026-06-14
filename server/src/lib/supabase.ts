// Supabase clients.
//  - admin: service-role key, bypasses RLS. Use for trusted server operations.
//  - forUser(jwt): a client scoped to the caller's JWT so RLS policies apply.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

/**
 * Returns a Supabase client that acts AS the authenticated user, so Row Level
 * Security policies are enforced. Prefer this for anything touching user data.
 */
export function supabaseForUser(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
