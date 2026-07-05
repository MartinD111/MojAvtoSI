// ═══════════════════════════════════════════════════════════════════════════════
// Category filter schema — MojAvto.si
//
// Single source of truth for "which advanced-search filters apply to which
// category / commercial vrsta". The advanced-search page, the results page and the
// create-listing form all resolve their field visibility and option narrowing
// through resolveFilterSpec() here, instead of scattering .car-only-field classes
// and ad-hoc special cases across the codebase.
//
// Follows the same category-tagging idea as equipment.js (getEquipmentForCategory).
// Fuel allow-lists are read from searchRelevance.js — values are NOT duplicated.
// ═══════════════════════════════════════════════════════════════════════════════

import { COMMERCIAL_FUEL_MAP } from './searchRelevance.js';

// Engine configurations (must match the engineConfig chip values in
// advanced-search.html and listing.engineConfig). Full list = passenger cars.
export const AVTO_ENGINE_CONFIGS = new Set([
    'I3', 'I4', 'I5', 'I6', 'V6', 'V8', 'V10', 'V12', 'W12', 'W16', 'Electric',
]);

// Leisure vehicles (avtodom / camper): drop supercar configs (W12/W16/V12); keep
// inline, V6/V8/V10 (Ford Triton V10 powered motorhomes for decades) + electric.
export const LEISURE_ENGINE_CONFIGS = new Set([
    'I3', 'I4', 'I5', 'I6', 'V6', 'V8', 'V10', 'Electric',
]);

// Fuel values leisure vehicles actually use (subset of the car fuel chips).
export const LEISURE_FUELS = new Set([
    'Dizel', 'Petrol', 'Elektrika', 'Hibrid', 'LPG', 'CNG',
]);

// Leisure body-type values that carry an engine (the rest are towed/static and
// have no motor at all → the whole engine accordion is hidden for them).
export const LEISURE_MOTORIZED = ['Avtodom', 'SnemljivBivalnik'];

// ── Commercial vrsta → odometer unit ──────────────────────────────────────────
// Machinery (bagri, traktorji, viličarji…) is measured in operating hours, not km.
// Road-going commercial vehicles keep km. Trailers have no engine/odometer.
// Keys match COMMERCIAL_BY_KEY / COMMERCIAL_TAXONOMY.
export const COMMERCIAL_ODOMETER = {
    Dostavna:         'km',
    Tovorna:          'km',
    TovornePrikolice: 'none', // prikolice: no engine, no odometer
    Avtobus:          'km',
    Gradbena:         'hours',
    Kmetijska:        'hours',
    Gozdarska:        'hours',
    Komunalna:        'km',
    Vilicarji:        'hours',
    Interventna:      'km',
    Letaliska:        'hours',
    Kamnolom:         'hours',
    Zimska:           'hours',
};

// ── Per search-tab base spec ──────────────────────────────────────────────────
// odometer:       'km' | 'hours' | 'none' | 'byVrsta' (commercial: resolved per vrsta)
// engineConfigs:  Set of allowed engineConfig values, or null = show all, 'none' = hide block
// fuels:          Set of allowed fuel values, null = all, 'byVrsta' = COMMERCIAL_FUEL_MAP,
//                 'motoFaceted' = driven by the moto JSON cascade (leave chips alone)
// showEngine:     whether the "Motor in pogon" accordion is meaningful at all
export const CATEGORY_FILTER_SPEC = {
    avto: {
        odometer: 'km',
        engineConfigs: null,
        fuels: null,
        showEngine: true,
    },
    moto: {
        odometer: 'km',
        engineConfigs: 'none',
        fuels: 'motoFaceted',
        showEngine: true,
    },
    gospodarska: {
        odometer: 'byVrsta',
        engineConfigs: 'none', // machinery has no car-style V-config filter
        fuels: 'byVrsta',
        showEngine: true,
    },
    'prosti-cas': {
        odometer: 'km',
        engineConfigs: LEISURE_ENGINE_CONFIGS,
        fuels: LEISURE_FUELS,
        showEngine: true, // further narrowed per body-type (towed/static → hidden)
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// resolveFilterSpec(activeTab, vrstaKey) → concrete, resolved spec
//   { odometer:'km'|'hours'|'none', engineConfigs:Set|null|'none',
//     fuels:Set|null|'motoFaceted', showEngine:bool }
// For the commercial tab, vrstaKey (e.g. 'Kmetijska') resolves odometer + fuels.
// ═══════════════════════════════════════════════════════════════════════════════
export function resolveFilterSpec(activeTab, vrstaKey) {
    const base = CATEGORY_FILTER_SPEC[activeTab] || CATEGORY_FILTER_SPEC.avto;
    const spec = { ...base };

    if (activeTab === 'gospodarska') {
        // Odometer: km / hours / none per selected vrsta (default km until a vrsta
        // is drilled into, so the km inputs stay usable on first render).
        spec.odometer = vrstaKey && COMMERCIAL_ODOMETER[vrstaKey]
            ? COMMERCIAL_ODOMETER[vrstaKey]
            : 'km';
        // Fuels: curated per vrsta (empty array → no engine → hide fuel + engine).
        if (vrstaKey && COMMERCIAL_FUEL_MAP[vrstaKey]) {
            const allowed = COMMERCIAL_FUEL_MAP[vrstaKey];
            spec.fuels = new Set(allowed);
            spec.showEngine = allowed.length > 0;
        } else {
            spec.fuels = null;
        }
    }

    return spec;
}

// True when this resolved spec measures usage in operating hours (machinery).
export const usesHours = (spec) => spec && spec.odometer === 'hours';
