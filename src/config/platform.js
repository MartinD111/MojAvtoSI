// ═══════════════════════════════════════════════════════════════════════════════
// Platform configuration — single source of truth for "which portal is this".
//
// Selected at BUILD TIME via VITE_PLATFORM (see vite.config.js → define()).
//   VITE_PLATFORM=avto    vite build   → MojAvto.si    (default)
//   VITE_PLATFORM=navtika vite build   → MojaNavtika.si
//
// Everything brand-, taxonomy- and content-specific reads from the active
// PLATFORM object so the same codebase produces both portals.
// ═══════════════════════════════════════════════════════════════════════════════

const PLATFORMS = {
    avto: {
        id: 'avto',
        brandName: 'AutoHub',
        brandMark: 'A',
        tld: '.si',
        domain: 'mojavto.si',
        siblingUrl: 'https://mojanavtika.si',
        siblingName: 'MojaNavtika.si',
        mainIcon: 'car',
        thumbFallback: '🚗',
        // Cars/moto/commercial/recreation — rental only inside specific subcategories
        hasGlobalRentalToggle: false,
        colors: {
            primaryStart: '#2563eb', // blue-600
            primaryEnd: '#4f46e5',   // indigo-600
            logoAccent: '#2563eb',
            cta: '#10b981',          // green login/CTA gradient start
            ctaEnd: '#059669',
        },
        company: {
            name: 'AMS Solutions d.o.o.',
            taxNo: '58144498',
            regNo: '7511744000',
            email: 'info@mojavto.si',
        },
        // B2B role labels (dealer/mechanic/vulcanizer roles defined in core/extensions.js)
        b2bRoleLabels: { dealer: 'Avtohiša', mechanic: 'Servis', vulcanizer: 'Vulkanizer', tuner: 'Tuning center', detailing: 'Avto detajling', carwash: 'Avtopralnica' },
    },

    navtika: {
        id: 'navtika',
        brandName: 'MojaNavtika',
        brandMark: 'N',
        tld: '.si',
        domain: 'mojanavtika.si',
        siblingUrl: 'https://mojavto.si',
        siblingName: 'MojAvto.si',
        mainIcon: 'sailboat',
        thumbFallback: '⛵',
        // Boats: charter/rental is first-class alongside sale → global toggle
        hasGlobalRentalToggle: true,
        colors: {
            primaryStart: '#0ea5e9', // sky-500 (gorgeous bright marine blue)
            primaryEnd: '#1d4ed8',   // blue-700 (deep classic ocean blue)
            logoAccent: '#0ea5e9',
            cta: '#10b981',
            ctaEnd: '#059669',
        },
        company: {
            name: 'AMS Solutions d.o.o.',
            taxNo: '58144498',
            regNo: '7511744000',
            email: 'info@mojanavtika.si',
        },
        b2bRoleLabels: { dealer: 'Prodajalec plovil', mechanic: 'Serviser plovil', vulcanizer: 'Marina / privez' },
    },
};

// Resolve the active platform id from the build-time env (default: avto).
const PLATFORM_ID = (import.meta.env.VITE_PLATFORM || 'avto');

/** The active platform configuration object. */
export const PLATFORM = PLATFORMS[PLATFORM_ID] || PLATFORMS.avto;

// Adjust siblingUrl for relative GitHub Pages deployments
if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages) {
        if (PLATFORM.id === 'avto') {
            PLATFORM.siblingUrl = './navtika/';
        } else {
            PLATFORM.siblingUrl = '../';
        }
    }
}

/** Returns the active platform id ('avto' | 'navtika'). */
export function getPlatform() {
    return PLATFORM.id;
}

/** Returns true when the active platform is MojaNavtika. */
export function isNavtika() {
    return PLATFORM.id === 'navtika';
}
