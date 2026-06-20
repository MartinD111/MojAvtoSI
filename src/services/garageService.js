// Garage Service — MojAvto.si (Supabase)
// User vehicles and favourites are stored in profiles.prefs (jsonb).

import { supabase } from '../lib/supabase.js';

// ── Shared helpers ─────────────────────────────────────────────────────────────

async function getPrefs(uid) {
    const { data } = await supabase.from('profiles').select('prefs').eq('id', uid).single();
    return data?.prefs || {};
}

async function setPrefs(uid, prefs) {
    await supabase.from('profiles').upsert({ id: uid, prefs }, { onConflict: 'id' });
}

// ── Vehicles (personal garage) ─────────────────────────────────────────────────

export async function addVehicle(uid, vehicle) {
    const prefs = await getPrefs(uid);
    const vehicles = Array.isArray(prefs.vehicles) ? prefs.vehicles : [];
    const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    vehicles.unshift({ id, ...vehicle, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await setPrefs(uid, { ...prefs, vehicles });
    return id;
}

export async function getVehicles(uid) {
    const prefs = await getPrefs(uid);
    return Array.isArray(prefs.vehicles) ? prefs.vehicles : [];
}

export async function updateVehicle(uid, vehicleId, updates) {
    const prefs = await getPrefs(uid);
    const vehicles = (prefs.vehicles || []).map(v =>
        v.id === vehicleId ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
    );
    await setPrefs(uid, { ...prefs, vehicles });
}

export async function deleteVehicle(uid, vehicleId) {
    const prefs = await getPrefs(uid);
    const vehicles = (prefs.vehicles || []).filter(v => v.id !== vehicleId);
    await setPrefs(uid, { ...prefs, vehicles });
}

// ── Favourites (liked listings) ────────────────────────────────────────────────

export async function addToFavourites(uid, listing) {
    const prefs = await getPrefs(uid);
    const favourites = Array.isArray(prefs.favourites) ? prefs.favourites : [];
    if (favourites.find(f => f.listingId === listing.id)) return;
    favourites.unshift({
        listingId: listing.id,
        title: listing.title || '',
        price: listing.price || '',
        image: listing.images?.exterior?.[0] || listing.image || '',
        savedAt: new Date().toISOString(),
    });
    await setPrefs(uid, { ...prefs, favourites });
}

export async function removeFromFavourites(uid, listingId) {
    const prefs = await getPrefs(uid);
    const favourites = (prefs.favourites || []).filter(f => f.listingId !== listingId);
    await setPrefs(uid, { ...prefs, favourites });
}

export async function getFavourites(uid) {
    const prefs = await getPrefs(uid);
    return (prefs.favourites || []).sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
}

export async function isFavourite(uid, listingId) {
    const prefs = await getPrefs(uid);
    return (prefs.favourites || []).some(f => f.listingId === listingId);
}
