// ═══════════════════════════════════════════════════════════════════════════════
// Advanced-search relevance engine — MojAvto.si
//
// Makes the advanced-search form cascade: an upstream choice (vehicle tab, brand,
// model, or commercial vrsta) constrains the options offered by the downstream
// filters, so only values that actually apply are shown.
//
// For moto the cascade is FACETED — every engine field (Takt, Valji, layout,
// Prenos moči) narrows based on what is still possible given the OTHER engine
// choices. So picking a V4 layout removes 2-takt from the stroke list, because no
// V4 in the data is 2-stroke.
//
// Two data sources drive this:
//   1. MOTO — derived live from public/json/brands_models_moto.json. Every variant
//      carries stroke / cylinders / engine_code / drivetrain.
//   2. GOSPODARSKA (cars + commercial) — the JSON has no per-vehicle engine/fuel
//      metadata, so the commercial fuel cascade uses the curated COMMERCIAL_FUEL_MAP
//      table below (vrsta → applicable fuels). Refine as the catalogue grows.
// ═══════════════════════════════════════════════════════════════════════════════

// Canonical option lists for the rebuildable moto <select>s. The relevance engine
// filters these down to the values that remain possible for the current selection.
export const MOTO_STROKE_OPTIONS = [
    { v: '2T', l: '2-taktni' },
    { v: '4T', l: '4-taktni' },
];

export const MOTO_CYLINDER_OPTIONS = [
    { v: '1', l: '1' },
    { v: '2', l: '2' },
    { v: '3', l: '3' },
    { v: '4', l: '4' },
    { v: '6', l: '6' },
    { v: 'Wankel', l: 'Wankel' },
];

// Cylinder-count → available engine layouts. Keyed by the cylinders <select> value.
// The relevance engine further filters these to the engine_codes present in the
// data for the current selection.
export const MOTO_LAYOUTS = {
    '1': [
        { v: 'I1', l: 'I1 Enovaljnik' },
    ],
    '2': [
        { v: 'I2',          l: 'I2 (vsi)' },
        { v: 'I2 270°',     l: 'I2 270°' },
        { v: 'I2 450°',     l: 'I2 450°' },
        { v: 'I2 180°',     l: 'I2 180°' },
        { v: 'I2 285°',     l: 'I2 285°' },
        { v: 'V2',          l: 'V2 (vsi)' },
        { v: 'V2 90°',      l: 'V2 90° L-twin' },
        { v: 'V2 60°',      l: 'V2 60°' },
        { v: 'V2 45°',      l: 'V2 45°' },
        { v: 'V2 75°',      l: 'V2 75°' },
        { v: 'V2 77°',      l: 'V2 77°' },
        { v: 'V2 72°',      l: 'V2 72°' },
        { v: 'V2 (prečno)', l: 'V2 prečno Bokser' },
        { v: 'B2',          l: 'B2 Bokser' },
    ],
    '3': [
        { v: 'I3',            l: 'I3 (vsi)' },
        { v: 'I3 (vzdolžni)', l: 'I3 vzdolžni' },
        { v: 'V3',            l: 'V3' },
    ],
    '4': [
        { v: 'I4',                l: 'I4 Vrstni' },
        { v: 'I4 Crossplane',     l: 'I4 Crossplane' },
        { v: 'I4 (Supercharged)', l: 'I4 Supercharged' },
        { v: 'V4',                l: 'V4 (vsi)' },
        { v: 'V4 90°',            l: 'V4 90°' },
        { v: 'V4 65°',            l: 'V4 65°' },
        { v: 'Kvadratni 4-valjni',l: 'Kvadratni 4-valjni' },
    ],
    '6': [
        { v: 'I6', l: 'I6 Vrstni šestvaljnik' },
        { v: 'B6', l: 'B6 Bokser šestvaljnik' },
    ],
};

// Curated vrsta → applicable fuel values. Fuel values must match the chip values
// used in advanced-search.html (Petrol, Dizel, Hibrid, Elektrika, EREV, LPG, CNG,
// Vodik, Etanol). An empty array means "no engine" (e.g. trailers) → hide fuel.
export const COMMERCIAL_FUEL_MAP = {
    Dostavna:         ['Dizel', 'Petrol', 'Elektrika', 'Hibrid', 'CNG', 'LPG'],
    Tovorna:          ['Dizel', 'Elektrika', 'Hibrid', 'Vodik', 'CNG'],
    TovornePrikolice: [], // prikolice have no engine
    Avtobus:          ['Dizel', 'Elektrika', 'Hibrid', 'CNG', 'Vodik'],
    Gradbena:         ['Dizel', 'Elektrika'],
    Kmetijska:        ['Dizel', 'Elektrika'],
    Gozdarska:        ['Dizel'],
    Komunalna:        ['Dizel', 'Elektrika', 'CNG', 'Hibrid'],
    Vilicarji:        ['Elektrika', 'Dizel', 'LPG', 'Vodik'],
    Interventna:      ['Dizel', 'Petrol', 'Elektrika', 'Hibrid'],
    Letaliska:        ['Dizel', 'Elektrika'],
    Kamnolom:         ['Dizel', 'Elektrika'],
    Zimska:           ['Dizel'],
};

// Canonical engine configuration options for cars (code matches engine_config in JSON).
export const AVTO_ENGINE_CONFIG_OPTIONS = [
    { v: 'I3',      l: 'I3 Trivaljnik' },
    { v: 'I4',      l: 'I4 Štirivaljnik' },
    { v: 'V6',      l: 'V6 Šestvaljnik' },
    { v: 'V8',      l: 'V8 Osemvaljnik' },
    { v: 'V10',     l: 'V10 Desetvaljnik' },
    { v: 'V12',     l: 'V12 Dvanajstvaljnik' },
    { v: 'W12',     l: 'W12 Dvanajstvaljnik' },
    { v: 'W16',     l: 'W16 Šestnajstvaljnik' },
    { v: 'Electric', l: 'Električni motor' },
];

// Collect every avto trim variant for the current brand/model selections.
// selections: array of { make, model } — model '' means any model of that brand.
export function getAvtoVariants(data, selections) {
    if (!data || !Array.isArray(selections) || selections.length === 0) return [];
    const out = [];
    for (const sel of selections) {
        if (!sel || !sel.make) continue;
        const brand = data[sel.make];
        if (!brand) continue;
        const modelEntries = sel.model && brand[sel.model]
            ? [[sel.model, brand[sel.model]]]
            : Object.entries(brand);
        for (const [, trims] of modelEntries) {
            if (!Array.isArray(trims)) continue;
            for (const v of trims) {
                if (v && typeof v === 'object') out.push(v);
            }
        }
    }
    return out;
}

// Returns the set of engine_config values present in the given variants.
export function computeAvtoFacets(variants) {
    const engineConfigs = new Set();
    for (const v of variants) {
        if (v.engine_config) engineConfigs.add(v.engine_config);
    }
    return { engineConfigs };
}

// Normalised cylinder value for a variant (Wankel collapses to 'Wankel').
function cylinderOf(v) {
    if ((v.engine_type || '') === 'Wankel' || v.engine_code === 'Wankel') return 'Wankel';
    return v.cylinders != null && v.cylinders !== '' ? String(v.cylinders) : '';
}

// Tolerant match between one engine_code (e.g. 'V4 90°') and a layout option value
// (e.g. 'V4', 'V4 (vsi)', 'V4 90°').
export function codeMatchesLayout(code, layoutValue) {
    if (!code) return false;
    const base = layoutValue.replace(' (vsi)', '');
    if (code === layoutValue || code === base) return true;
    if (layoutValue.endsWith('(vsi)') && code.startsWith(base)) return true;
    if (code.startsWith(layoutValue)) return true;
    if (layoutValue.startsWith(code)) return true; // layout 'V4 90°' vs code 'V4'
    return false;
}

// Collect every moto variant object for the current selection(s).
// selections: array of { make, model } — model '' means "any model of this brand".
export function getMotoVariants(data, selections) {
    if (!data || !Array.isArray(selections) || selections.length === 0) return [];
    const out = [];
    for (const sel of selections) {
        if (!sel || !sel.make) continue;
        const brand = data[sel.make];
        if (!brand) continue;
        const modelEntries = sel.model && brand[sel.model]
            ? [[sel.model, brand[sel.model]]]
            : Object.entries(brand);
        for (const [, modelObj] of modelEntries) {
            const variants = modelObj && Array.isArray(modelObj.variants) ? modelObj.variants : [];
            for (const v of variants) {
                if (v && typeof v === 'object') out.push(v);
            }
        }
    }
    return out;
}

// Faceted availability: for each engine facet, the set of values that remain
// possible given the constraints on the OTHER facets. A facet's own constraint is
// ignored when computing its own set, so the currently-selected value is never
// filtered away.
//
// constraints: { stroke, cylinders, layout, drivetrains:[] } — any may be empty.
export function computeMotoFacets(variants, constraints) {
    const c = constraints || {};
    const dts = Array.isArray(c.drivetrains) ? c.drivetrains : [];
    const strokes = new Set();
    const cylinders = new Set();
    const drivetrains = new Set();
    const engineCodes = new Set();

    for (const v of variants) {
        const cyl = cylinderOf(v);
        const okStroke = !c.stroke || v.stroke === c.stroke;
        const okCyl = !c.cylinders || cyl === c.cylinders;
        const okLayout = !c.layout || codeMatchesLayout(v.engine_code, c.layout);
        const okDt = dts.length === 0 || dts.includes(v.drivetrain);

        if (okCyl && okLayout && okDt && v.stroke) strokes.add(v.stroke);
        if (okStroke && okLayout && okDt && cyl) cylinders.add(cyl);
        if (okStroke && okCyl && okDt && v.engine_code) engineCodes.add(v.engine_code);
        if (okStroke && okCyl && okLayout && v.drivetrain) drivetrains.add(v.drivetrain);
    }

    return { strokes, cylinders, drivetrains, engineCodes };
}
