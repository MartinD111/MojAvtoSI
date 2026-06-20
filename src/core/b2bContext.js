// b2bContext.js — Global B2B mode detection + role gating
// Single source of truth for "am I a business user?" across the app.

import { supabase } from '../lib/supabase.js';
import { key as lsKey } from '../config/storageKeys.js';

const LS_KEY = lsKey('b2b_profile_cache');

let _profile = null;
let _channel = null;
const _listeners = new Set();

// ── Normalize Supabase profile row to the flat shape the app expects ──────────
function normalizeProfile(userId, row) {
    return { uid: userId, id: userId, email: row.email, displayName: row.display_name, ...row.prefs };
}

// ── Public API ────────────────────────────────────────────────────────────────
export function getB2BProfile() { return _profile; }

export function isBusiness() { return _profile?.sellerType === 'business'; }

export function hasRole(role) {
    if (!isBusiness()) return false;
    return (_profile.businessRoles || []).includes(role);
}

export function getRoles() { return _profile?.businessRoles || []; }

export function isVerifiedBusiness() { return isBusiness() && _profile.businessTier === 'verified'; }

export function onB2BChange(cb) {
    _listeners.add(cb);
    cb(_profile);
    return () => _listeners.delete(cb);
}

function _emit() {
    _listeners.forEach(cb => { try { cb(_profile); } catch (e) { console.warn('[b2b] listener error', e); } });
}

// ── Bind to auth ──────────────────────────────────────────────────────────────
export function bindB2BContext(user) {
    if (_channel) { supabase.removeChannel(_channel); _channel = null; }

    if (!user) {
        _profile = null;
        localStorage.removeItem(LS_KEY);
        _emit();
        return;
    }

    // Load cached profile for instant mode switch on page load
    try {
        const cached = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
        if (cached && cached.uid === user.id) { _profile = cached; _emit(); }
    } catch {}

    // Initial fetch
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (!data) { _profile = null; _emit(); return; }
        _profile = normalizeProfile(user.id, data);
        try { localStorage.setItem(LS_KEY, JSON.stringify(_profile)); } catch {}
        window.__currentUserProfile = _profile;
        _emit();
    });

    // Live subscription — keeps tier/role updates in sync
    _channel = supabase
        .channel(`profile-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            async () => {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (!data) { _profile = null; _emit(); return; }
                _profile = normalizeProfile(user.id, data);
                try { localStorage.setItem(LS_KEY, JSON.stringify(_profile)); } catch {}
                window.__currentUserProfile = _profile;
                _emit();
            })
        .subscribe();
}

// ── One-shot fetch (used during guarded routes) ───────────────────────────────
export async function fetchB2BProfile(user) {
    if (!user) return null;
    if (_profile && _profile.uid === user.id) return _profile;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!data) return null;
    _profile = normalizeProfile(user.id, data);
    window.__currentUserProfile = _profile;
    return _profile;
}
