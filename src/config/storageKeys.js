// ═══════════════════════════════════════════════════════════════════════════════
// Platform-scoped localStorage keys.
//
// Historically keys were hardcoded with a 'mojavto_' prefix. To keep MojAvto and
// MojaNavtika settings isolated (compare list, language, view mode, garage…) all
// keys now run through key() which prefixes with the active platform id.
//
//   key('compare')          → 'avto_compare'    | 'navtika_compare'
//   key('vehicles', userId) → 'avto_vehicles_<uid>'
//
// NOTE: the shared 'theme' key is intentionally NOT scoped — a single light/dark
// preference across both portals is the desired behaviour.
// ═══════════════════════════════════════════════════════════════════════════════

import { PLATFORM } from './platform.js';

/**
 * Build a platform-scoped localStorage key.
 * @param {string} name  base key name, e.g. 'compare', 'lang', 'vehicles'
 * @param {...string} parts  optional suffix parts (joined with '_'), e.g. a userId
 * @returns {string}
 */
export function key(name, ...parts) {
    const suffix = parts.filter(Boolean).join('_');
    return `${PLATFORM.id}_${name}${suffix ? '_' + suffix : ''}`;
}
