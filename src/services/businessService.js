// businessService.js — Business data access and filtering logic
// Prepared for Firebase Firestore integration (currently uses mock data)

import { mockBusinesses } from '../data/businesses.js';
import { mockBusinessesNavtika } from '../data/businesses.navtika.js';
import { PLATFORM } from '../config/platform.js';

// Active platform's business directory (car dealers vs marinas / boat sellers).
const BUSINESSES = PLATFORM.id === 'navtika' ? mockBusinessesNavtika : mockBusinesses;

// ── Cache ────────────────────────────────────────────────────
let _cache = null;

/**
 * Returns all businesses (cached after first call)
 * @returns {Object[]}
 */
export function getAllBusinesses() {
    if (!_cache) _cache = [...BUSINESSES];
    return _cache;
}

/**
 * Returns a single business by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getBusinessById(id) {
    return getAllBusinesses().find(b => b.id === id) || null;
}

/**
 * Haversine formula — distance between two lat/lng points in km
 * @param {number} lat1 @param {number} lng1
 * @param {number} lat2 @param {number} lng2
 * @returns {number} Distance in km
 */
export function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns businesses within radius km of userLocation
 * @param {{ lat: number, lng: number }} userLocation
 * @param {number} radiusKm
 * @returns {Object[]}
 */
export function getBusinessesNearby(userLocation, radiusKm) {
    if (!userLocation) return getAllBusinesses();
    return getAllBusinesses().filter(b => {
        const d = getDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        return d <= radiusKm;
    });
}

/**
 * Returns true if business has at least one of the given types
 * @param {Object} business
 * @param {string|string[]} types
 */
export function hasType(business, types) {
    const typeArr = Array.isArray(types) ? types : [types];
    return typeArr.some(t => business.businessTypes.includes(t));
}

/**
 * Main filter function — AND logic across categories, OR inside arrays
 * @param {Object[]} businesses
 * @param {Object} filters
 * @param {{ lat: number, lng: number }|null} userLocation
 * @returns {Object[]}
 */
export function filterBusinesses(businesses, filters, userLocation) {
    return businesses.filter(b => {
        // 1. Business type filter (OR within selected types)
        if (filters.types && filters.types.length > 0) {
            if (!hasType(b, filters.types)) return false;
        }

        // 2. Brand filter (OR within selected brands — checks both authorizedBrands and supportedBrands)
        if (filters.brands && filters.brands.length > 0) {
            const allBiz = [...b.authorizedBrands, ...b.supportedBrands];
            if (!filters.brands.some(brand => allBiz.includes(brand))) return false;
        }

        // 3. Authorized only
        if (filters.authorized && !b.verified) return false;

        // 4. Leasing
        if (filters.leasing && !b.offersLeasing) return false;

        // 5. Tyre storage / marina (wet berth)
        if (filters.tyreStorage && !b.offersTyreStorage) return false;

        // 5b. Dry storage / suha marina (navtika only)
        if (filters.dryStorage && !b.offersDryStorage) return false;

        // 6. Minimum rating
        if (filters.minRating > 0 && b.rating < filters.minRating) return false;

        // 7. Distance (only if userLocation available)
        if (userLocation && filters.radius > 0) {
            const d = getDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
            if (d > filters.radius) return false;
            b._distance = Math.round(d * 10) / 10; // attach distance for display
        }

        return true;
    });
}

/**
 * Get primary type color for markers and UI
 * @param {Object} business
 * @returns {{ color: string, label: string }}
 */
// Platform-specific business-type display labels.
const TYPE_LABELS = PLATFORM.id === 'navtika'
    ? { dealer: 'Prodajalec plovil', service: 'Servis plovil', vulcanizer: 'Marina / privez' }
    : { dealer: 'Avto hiša', service: 'Servis', vulcanizer: 'Vulkanizer', tuner: 'Tuning center', detailing: 'Avto detajling', carwash: 'Avtopralnica' };

export function getBusinessTypeInfo(business) {
    const types = business.businessTypes;
    if (types.length > 1) return { color: '#7c3aed', label: 'Večnamenski', markerClass: 'marker-multi' };
    switch (types[0]) {
        case 'dealer': return { color: '#2563eb', label: TYPE_LABELS.dealer, markerClass: 'marker-dealer' };
        case 'service': return { color: '#16a34a', label: TYPE_LABELS.service, markerClass: 'marker-service' };
        case 'vulcanizer': return { color: '#ea580c', label: TYPE_LABELS.vulcanizer, markerClass: 'marker-vulcanizer' };
        case 'tuner': return { color: '#9333ea', label: TYPE_LABELS.tuner, markerClass: 'marker-tuner' };
        case 'detailing': return { color: '#0891b2', label: TYPE_LABELS.detailing, markerClass: 'marker-detailing' };
        case 'carwash': return { color: '#0ea5e9', label: TYPE_LABELS.carwash, markerClass: 'marker-carwash' };
        default: return { color: '#64748b', label: 'Podjetje', markerClass: 'marker-other' };
    }
}

/**
 * Get all type labels for a business (for badge display)
 * @param {Object} business
 * @returns {string[]}
 */
export function getTypeLabels(business) {
    return business.businessTypes.map(t => TYPE_LABELS[t] || t);
}

/**
 * Sort businesses by distance (if available) or rating
 * @param {Object[]} businesses
 * @param {'distance'|'rating'|'name'} by
 */
export function sortBusinesses(businesses, by = 'distance') {
    return [...businesses].sort((a, b) => {
        if (by === 'distance') {
            if (a._distance != null && b._distance != null) return a._distance - b._distance;
            return b.rating - a.rating;
        }
        if (by === 'rating') return b.rating - a.rating;
        if (by === 'name') return a.name.localeCompare(b.name);
        return 0;
    });
}
