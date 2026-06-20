// Authentication module — MojAvto.si (Supabase)
import { supabase } from '../lib/supabase.js';
import { PLATFORM } from '../config/platform.js';

// ── Create profile row after sign-up ──────────────────────────────────────────
async function ensureProfile(user, { displayName, region, isBusiness, companyName, taxId, address, roles } = {}) {
    await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: displayName || user.user_metadata?.display_name || '',
        prefs: {
            region: region || '',
            phone: '',
            sellerType: isBusiness ? 'business' : 'private',
            businessTier: isBusiness ? 'unverified' : null,
            businessRoles: isBusiness ? (roles || []) : [],
            membershipTier: 'free',
            membershipExpiry: null,
            averageRating: 0,
            reviewCount: 0,
        },
    }, { onConflict: 'id', ignoreDuplicates: true });

    if (isBusiness) {
        await supabase.from('businesses').insert({
            owner_id: user.id,
            platform: PLATFORM.id,
            name: companyName || displayName || '',
            role: (roles || [])[0] || 'dealer',
            tier: 'unverified',
            data: { companyName, taxId, address, roles },
        }).select().single();
    }
}

// ── Email / Password Registration ─────────────────────────────────────────────
export async function registerWithEmail({ fullname, email, password, region, isBusiness, companyName, taxId, address, roles }) {
    const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { display_name: fullname } },
    });
    if (error) throw new Error('Registracija ni uspela. Preverite podatke in poskusite znova.');
    const user = data.user;
    if (!user) throw new Error('Registracija ni uspela.');
    await ensureProfile(user, { displayName: fullname, region, isBusiness, companyName, taxId, address, roles });
    return user;
}

// ── Email / Password Login ────────────────────────────────────────────────────
export async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
    });
    if (error) throw new Error('Napačni podatki. Preverite e-naslov in geslo.');
    return data.user;
}

// ── Google Login ─────────────────────────────────────────────────────────────
export async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error('Prijava z Googlom ni uspela.');
    return data;
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout() {
    await supabase.auth.signOut();
}

// ── Auth state observer ───────────────────────────────────────────────────────
export function onAuth(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
    // Fire immediately with cached session
    supabase.auth.getSession().then(({ data: s }) => callback(s.session?.user ?? null));
    return () => data.subscription.unsubscribe();
}

// ── Get current user profile doc ─────────────────────────────────────────────
export async function getCurrentUserDoc() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!data) return null;
    return {
        id: data.id,
        uid: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.avatar_url || '',
        ...(data.prefs || {}),
    };
}
