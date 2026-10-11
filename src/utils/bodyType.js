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

    // Moto types
    'sportnimotor': 'SportniMotor', 'sportnitourer': 'SportniTourer', 'adventure': 'Adventure',
    'nakedbike': 'NakedBike', 'enduro': 'Enduro', 'chopper': 'Chopper', 'tourer': 'Tourer',
    'supermoto': 'Supermoto', 'trial': 'Trial', 'cross': 'Cross', 'skuter': 'Skuter',
    'minimoto': 'Minimoto', 'cruiser': 'Cruiser', 'moped': 'Moped', 'motornesani': 'MotorneSani',
    'evozila': 'EVozila', 'atv': 'ATV', 'utv': 'UTV', 'trikolesnik': 'Trikolesnik', 'gocart': 'Gocart',

    // Prosti čas types
    'avtodom': 'Avtodom', 'pocitniiskaprikolica': 'PocitniiskaPrikolica', 'pocitniska prikolica': 'PocitniiskaPrikolica',
    'mobilnahisica': 'MobilnaHisica', 'mobilna hisica': 'MobilnaHisica',
    'snemljivbivalnik': 'SnemljivBivalnik', 'sotorskaprikolica': 'SotorskaPrikolica',

    // Commercial types
    'dostavna': 'Dostavna', 'tovorna': 'Tovorna', 'avtobusi': 'Avtobusi', 'prikolice': 'Prikolice',
    'kmetijska': 'Kmetijska', 'gradbena': 'Gradbena', 'vilicari': 'Vilicari', 'gozdarska': 'Gozdarska',
    'komunalna': 'Komunalna', 'ostalo': 'Ostalo'
};

/**
 * Normalizes a raw body_type string to a canonical value, or '' if unknown.
 */
export function normalizeBodyType(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return BODY_TYPE_MAP[raw.trim().toLowerCase()] || raw.trim();
}

/**
 * Reads the model-level body_type from a brands/models taxonomy object.
 * Checks .body_type, .type, .bodyType, .vehicleType across object or array forms.
 *
 * @param {Object} data  — the loaded brands_models_*.json object
 * @param {string} make
 * @param {string} model
 * @returns {string} canonical body type, or '' if unknown
 */
export function getModelBodyType(data, make, model) {
    if (!data || !make || !model) return '';
    const modelData = data[make];
    if (!modelData) return '';
    const entry = modelData[model];
    if (!entry) return '';
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        return normalizeBodyType(entry.body_type || entry.type || entry.bodyType || entry.vehicleType);
    }
    if (Array.isArray(entry)) {
        for (const item of entry) {
            if (item && typeof item === 'object') {
                const val = item.body_type || item.type || item.bodyType || item.vehicleType;
                if (val) {
                    const res = normalizeBodyType(val);
                    if (res) return res;
                }
            }
        }
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
