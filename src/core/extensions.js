// extensions.js — Plugin / Extension registry for B2B modules
// Lets dealer/mechanic/vulcanizer tools register themselves declaratively.

import { PLATFORM } from '../config/platform.js';
import { t } from '../core/i18n.js';

const _registry = new Map(); // id → extension definition

// Platform-specific display-name overrides. The B2B FEATURE SET stays identical
// across platforms — only a few vehicle-specific labels are reworded for vessels.
const NAME_OVERRIDES = {
    navtika: {
        'b2b-inventory': 'Zaloga plovil',
        'b2b-tire-hotel': 'Zimovanje / privez',
        'b2b-service-entry': 'Vnos servisa',
    },
};

function platformName(id, fallback) {
    return NAME_OVERRIDES[PLATFORM.id]?.[id] || fallback;
}

function getLocalizedExtensionName(id, fallback) {
    const isNavtika = PLATFORM.id === 'navtika';
    switch (id) {
        case 'b2b-dashboard': return t('b2b_nav_dashboard', 'Pregled');
        case 'b2b-reservations': return t('b2b_nav_reservations', 'Rezervacije');
        case 'b2b-services': return t('b2b_nav_services', 'Storitve in cenik');
        case 'b2b-profile': return t('b2b_nav_profile', 'Javni profil');
        case 'b2b-inventory': return isNavtika ? t('b2b_nav_inventory_navtika', 'Zaloga plovil') : t('b2b_nav_inventory', 'Zaloga vozil');
        case 'b2b-leads': return t('b2b_nav_leads', 'Povpraševanja (CRM)');
        case 'b2b-workshop': return t('b2b_nav_workshop', 'Delavnica');
        case 'b2b-service-entry': return isNavtika ? t('b2b_nav_service_entry_navtika', 'Vnos servisa') : t('b2b_nav_service_entry', 'VIN vnos servisa');
        case 'b2b-tire-hotel': return isNavtika ? t('b2b_nav_tire_hotel_navtika', 'Zimovanje / privez') : t('b2b_nav_tire_hotel', 'Hotel za gume');
        case 'b2b-bulk-import': return t('b2b_nav_bulk_import', 'Skupinski uvoz');
        case 'b2b-tuning': return t('b2b_nav_tuning', 'Tuning projekti');
        case 'b2b-detailing': return t('b2b_nav_detailing', 'Detajling termini');
        case 'b2b-carwash': return t('b2b_nav_carwash', 'Pranje termini');
        default: return fallback;
    }
}

/**
 * Register a new extension.
 * @param {{
 *   id: string,                 // unique ID
 *   name: string,               // display label
 *   role: 'dealer'|'mechanic'|'vulcanizer'|'any',
 *   icon: string,               // lucide icon name
 *   route: string,              // hash route e.g. '/b2b/inventory'
 *   description?: string,
 *   order?: number,
 *   external?: boolean          // true = opens in new tab / chrome extension
 * }} ext
 */
export function registerExtension(ext) {
    if (!ext?.id) throw new Error('Extension requires id');
    _registry.set(ext.id, { order: 100, ...ext });
}

export function getExtensionsForRoles(roles) {
    const all = [..._registry.values()];
    return all
        .filter(e => e.role === 'any' || roles.includes(e.role))
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
        .map(e => ({
            ...e,
            name: getLocalizedExtensionName(e.id, e.name)
        }));
}

export function getAllExtensions() {
    return [..._registry.values()].map(e => ({
        ...e,
        name: getLocalizedExtensionName(e.id, e.name)
    }));
}

// ── Default B2B extensions ────────────────────────────────────
// Registered once at app boot.
export function registerDefaultExtensions() {
    // Common — every business
    registerExtension({ id: 'b2b-dashboard', name: 'Pregled', icon: 'layout-dashboard', role: 'any', route: '/b2b', order: 0 });
    registerExtension({ id: 'b2b-reservations', name: 'Rezervacije', icon: 'calendar-check', role: 'any', route: '/b2b/rezervacije', order: 10 });
    registerExtension({ id: 'b2b-services', name: 'Storitve in cenik', icon: 'tags', role: 'any', route: '/b2b/storitve', order: 20 });
    registerExtension({ id: 'b2b-profile', name: 'Javni profil', icon: 'building-2', role: 'any', route: '/b2b/profil', order: 30 });

    // Dealer
    registerExtension({ id: 'b2b-inventory', name: platformName('b2b-inventory', 'Zaloga vozil'), icon: 'warehouse', role: 'dealer', route: '/b2b/zaloga', order: 40 });
    registerExtension({ id: 'b2b-leads', name: 'Povpraševanja (CRM)', icon: 'inbox', role: 'dealer', route: '/b2b/leads', order: 50 });

    // Mechanic
    registerExtension({ id: 'b2b-workshop', name: 'Delavnica', icon: 'wrench', role: 'mechanic', route: '/b2b/delavnica', order: 40 });
    registerExtension({ id: 'b2b-service-entry', name: platformName('b2b-service-entry', 'VIN vnos servisa'), icon: 'clipboard-list', role: 'mechanic', route: '/b2b/servis-vnos', order: 50 });

    // Vulcanizer
    registerExtension({ id: 'b2b-tire-hotel', name: platformName('b2b-tire-hotel', 'Hotel za gume'), icon: 'circle-dot', role: 'vulcanizer', route: '/b2b/hotel-gum', order: 40 });

    // Dealer — bulk import (verified business only; gated inside the page itself)
    registerExtension({ id: 'b2b-bulk-import', name: 'Skupinski uvoz', icon: 'file-json', role: 'dealer', route: '/b2b/bulk-import', order: 55 });

    // Tuner
    registerExtension({ id: 'b2b-tuning', name: 'Tuning projekti', icon: 'gauge', role: 'tuner', route: '/b2b/tuning', order: 40 });

    // Detailing
    registerExtension({ id: 'b2b-detailing', name: 'Detajling termini', icon: 'sparkles', role: 'detailing', route: '/b2b/detajling', order: 40 });

    // Carwash
    registerExtension({ id: 'b2b-carwash', name: 'Pranje termini', icon: 'droplets', role: 'carwash', route: '/b2b/pralnica', order: 40 });
}
