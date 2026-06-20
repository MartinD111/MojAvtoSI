// Synchronous current-user accessor backed by the Supabase session cache.
// Mirrors the Firebase `auth.currentUser` pattern so call sites need minimal edits.
import { supabase } from './supabase.js';

let _user = null;

// Seed from the cached session in localStorage (resolves instantly, no network).
supabase.auth.getSession().then(({ data }) => { _user = data.session?.user ?? null; });

supabase.auth.onAuthStateChange((_event, session) => { _user = session?.user ?? null; });

/** Returns the cached auth user, or null before the session resolves. */
export function currentUser() { return _user; }
