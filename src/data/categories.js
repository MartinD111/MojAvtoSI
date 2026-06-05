// ═══════════════════════════════════════════════════════════════════════════════
// Category taxonomy — platform router.
// Re-exports the active platform's MAIN_CATEGORIES (avto vehicles / navtika vessels)
// and the shared, platform-agnostic helpers used across search, header and wizard.
// ═══════════════════════════════════════════════════════════════════════════════

import { PLATFORM } from '../config/platform.js';
import * as avto from './categories.avto.js';
import * as navtika from './categories.navtika.js';

const ACTIVE = PLATFORM.id === 'navtika' ? navtika : avto;

export const MAIN_CATEGORIES = ACTIVE.MAIN_CATEGORIES;
export const SEARCH_TYPE_OPTIONS = ACTIVE.SEARCH_TYPE_OPTIONS;

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: resolve a category path from URL params
// e.g. cat=moto&sub=motorno-kolo → { main: {...}, sub: {...} }
// ═══════════════════════════════════════════════════════════════════════════════
export function resolveCategory(catSlug, subSlug) {
    const main = Object.values(MAIN_CATEGORIES).find(c => c.slug === catSlug);
    if (!main) return null;
    if (!subSlug || !main.subcategories) return { main, sub: null };
    const sub = Object.values(main.subcategories).find(s => s.slug === subSlug);
    return { main, sub: sub || null };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: get all vehicle/vessel types for a subcategory (or a flat directSearch cat)
// ═══════════════════════════════════════════════════════════════════════════════
export function getVehicleTypes(catSlug, subSlug) {
    const resolved = resolveCategory(catSlug, subSlug);
    if (!resolved) return [];
    if (resolved.sub) return resolved.sub.vehicleTypes || [];
    // Flat categories (e.g. avto, navtika jet_ski) can carry vehicleTypes directly.
    return resolved.main.vehicleTypes || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: build URL hash for navigating to search with category context
// ═══════════════════════════════════════════════════════════════════════════════
export function buildSearchUrl(catSlug, subSlug, searchType, vehicleType, rental) {
    const params = new URLSearchParams();
    if (catSlug) params.set('cat', catSlug);
    if (subSlug) params.set('sub', subSlug);
    if (searchType) params.set('searchType', searchType);
    if (vehicleType) params.set('vtype', vehicleType);
    if (rental) params.set('najem', '1');
    return `#/iskanje?${params.toString()}`;
}
