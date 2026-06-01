// ═══════════════════════════════════════════════════════════════════════════════
// Vehicle body type (vrsta vozila) — shared taxonomy helpers — MojAvto.si
// Used by create-listing (auto-fill on entry) and advanced-search (auto-select
// the body-type card when a model with a known body_type is chosen).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps a taxonomy body_type value (English or Slovenian, any case) to the
 * canonical Slovenian value used by the search filter + category subcategories.
 */
export const BODY_TYPE_MAP = {
    'limuzina': 'Limuzina', 'sedan': 'Limuzina', 'saloon': 'Limuzina', 'limousine': 'Limuzina',
    'kombilimuzina': 'Kombilimuzina', 'hatchback': 'Kombilimuzina', 'combi': 'Kombilimuzina',
    'karavan': 'Karavan', 'wagon': 'Karavan', 'estate': 'Karavan', 'touring': 'Karavan',
    'avant': 'Karavan', 'station wagon': 'Karavan', 'kombi': 'Karavan',
    'terensko': 'Terensko', 'suv': 'Terensko', 'crossover': 'Terensko', 'offroad': 'Terensko',
    'off-road': 'Terensko', 'gelandewagen': 'Terensko',
    'enoprostorec': 'Enoprostorec', 'minivan': 'Enoprostorec', 'mpv': 'Enoprostorec', 'van': 'Enoprostorec',
    'kabriolet': 'Kabriolet', 'convertible': 'Kabriolet', 'cabrio': 'Kabriolet',
    'cabriolet': 'Kabriolet', 'roadster': 'Kabriolet', 'spider': 'Kabriolet', 'spyder': 'Kabriolet',
    'coupe': 'Coupe', 'coupé': 'Coupe',
    'sportni': 'Sportni', 'sports': 'Sportni', 'sport': 'Sportni',
    'pick-up': 'Pick-up', 'pickup': 'Pick-up', 'pick up': 'Pick-up',
    'oldtimer': 'Oldtimer', 'classic': 'Oldtimer',
};

/**
 * Normalizes a raw body_type string to a canonical value, or '' if unknown.
 */
export function normalizeBodyType(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return BODY_TYPE_MAP[raw.trim().toLowerCase()] || '';
}

/**
 * Reads the model-level body_type from a brands/models taxonomy object.
 * Only object-form models ({ body_type, variants }) carry a body_type;
 * plain-array models return '' so callers fall back to manual selection.
 *
 * @param {Object} data  — the loaded brands_models_*.json object
 * @param {string} make
 * @param {string} model
 * @returns {string} canonical body type, or '' if unknown
 */
export function getModelBodyType(data, make, model) {
    if (!data || !make || !model) return '';
    const modelData = data[make];
    if (!modelData || Array.isArray(modelData)) return '';
    const entry = modelData[model];
    if (entry && !Array.isArray(entry) && typeof entry === 'object') {
        return normalizeBodyType(entry.body_type);
    }
    return '';
}

/**
 * Returns the variant list for a model regardless of taxonomy shape:
 * array-form models return themselves; object-form models return .variants.
 */
export function getModelVariants(entry) {
    if (Array.isArray(entry)) return entry;
    if (entry && typeof entry === 'object' && Array.isArray(entry.variants)) return entry.variants;
    return [];
}
