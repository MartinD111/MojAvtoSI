// ═══════════════════════════════════════════════════════════════════════════════
// Catalog service — MojAvto.si
// Public read access to the price-comparison catalog (`partsCatalog`).
// Currently merges Firestore products with MOCK sample data so the UI works before
// the webscraping backend exists. See docs/WEBSCRAPING_HANDOFF.md.
// ═══════════════════════════════════════════════════════════════════════════════

import { supabase } from '../lib/supabase.js';
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js';

function lowest(product) {
    if (typeof product.lowestPrice === 'number') return product.lowestPrice;
    const prices = (product.offers || []).map(o => o.price).filter(n => typeof n === 'number');
    return prices.length ? Math.min(...prices) : null;
}

// ── Get catalog products (optionally filtered) ────────────────────────────────
export async function getCatalogProducts({ itemType, vehicleCategory } = {}) {
    let products = [];
    try {
        const { data } = await supabase.from('parts_catalog').select('*').neq('status', 'hidden');
        products = data || [];
    } catch (err) {
        console.warn('Could not fetch parts_catalog from Supabase, using sample catalog only.', err);
    }

    let all = [...products, ...(import.meta.env.DEV ? SAMPLE_CATALOG : [])].filter(p => p.status !== 'hidden');
    if (itemType) all = all.filter(p => (p.itemType ?? p.item_type) === itemType);
    if (vehicleCategory) all = all.filter(p => (p.vehicleCategory ?? p.vehicle_category) === vehicleCategory);

    return all.sort((a, b) => (lowest(a) ?? Infinity) - (lowest(b) ?? Infinity));
}

// ── Get a single catalog product ──────────────────────────────────────────────
export async function getCatalogProductById(id) {
    const sample = import.meta.env.DEV ? SAMPLE_CATALOG.find(p => p.id === id) : null;
    if (sample) return sample;

    const { data, error } = await supabase.from('parts_catalog').select('*').eq('id', id).single();
    if (error || !data) throw new Error('Catalog product does not exist.');
    return data;
}

export function getLowestPrice(product) {
    return lowest(product);
}
