// ═══════════════════════════════════════════════════════════════════════════════
// Catalog service — MojAvto.si
// Public read access to the price-comparison catalog (`partsCatalog`).
// Currently merges Firestore products with MOCK sample data so the UI works before
// the webscraping backend exists. See docs/WEBSCRAPING_HANDOFF.md.
// ═══════════════════════════════════════════════════════════════════════════════

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
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
        const snap = await getDocs(collection(db, 'partsCatalog'));
        products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn('Could not fetch partsCatalog from Firestore, using sample catalog only.', err);
    }

    let all = [...products, ...SAMPLE_CATALOG].filter(p => p.status !== 'hidden');
    if (itemType) all = all.filter(p => p.itemType === itemType);
    if (vehicleCategory) all = all.filter(p => p.vehicleCategory === vehicleCategory);

    // Sort by lowest price ascending so the cheapest products surface first.
    return all.sort((a, b) => (lowest(a) ?? Infinity) - (lowest(b) ?? Infinity));
}

// ── Get a single catalog product ──────────────────────────────────────────────
export async function getCatalogProductById(id) {
    const sample = SAMPLE_CATALOG.find(p => p.id === id);
    if (sample) return sample;

    const snap = await getDoc(doc(db, 'partsCatalog', id));
    if (!snap.exists()) throw new Error('Catalog product does not exist.');
    return { id: snap.id, ...snap.data() };
}

export function getLowestPrice(product) {
    return lowest(product);
}
