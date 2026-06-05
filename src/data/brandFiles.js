// ═══════════════════════════════════════════════════════════════════════════════
// Resolve the brands/models JSON file for a given category, per platform.
// Centralized so the home search form and advanced search stay in sync.
//   avto:    avto→global, motor→moto, gospodarska→gospodarska
//   navtika: vessels→plovila, izvenkrmni_motorji→izvenkrmni
// ═══════════════════════════════════════════════════════════════════════════════

import { PLATFORM } from '../config/platform.js';

export function brandsFileFor(category) {
    if (PLATFORM.id === 'navtika') {
        if (category === 'izvenkrmni-motorji' || category === 'izvenkrmni_motorji') {
            return 'json/brands_models_izvenkrmni.json';
        }
        // colni, jadrnice, gumenjaki, jet-ski all share the vessel builders list
        return 'json/brands_models_plovila.json';
    }
    // avto platform
    if (category === 'motor' || category === 'moto') return 'json/brands_models_moto.json';
    if (category === 'gospodarska') return 'json/brands_models_gospodarska.json';
    return 'json/brands_models_global.json';
}
