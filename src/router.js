// SPA Router — platform-aware (MojAvto / MojaNavtika)
import { supabase } from './lib/supabase.js';
import { fetchB2BProfile } from './core/b2bContext.js';
import { t, translatePage, i18nReady } from './core/i18n.js';
import { PLATFORM } from './config/platform.js';

// ── Route definitions ─────────────────────────────────────────────────────────
const routes = {
    '/': { view: 'home', protected: false, title: null },
    '/oglasi': { view: 'oglasi', protected: false, title: 'Oglasi' },
    '/iskanje': { view: 'advanced-search', protected: false, title: 'Iskanje' },
    '/oglas': { view: 'listing', protected: false, title: 'Oglas' },
    '/drazbe': { view: 'drazbe', protected: false, title: 'Dražbe' },
    '/drazba': { view: 'auction-listing', protected: false, title: 'Dražba' },
    '/gume-in-deli': { view: 'gume-in-deli', protected: false, title: 'Gume in deli' },
    '/katalog': { view: 'catalog-product', protected: false, title: 'Katalog' },
    '/prijava': { view: 'login', protected: false, title: 'Prijava' },
    '/registracija': { view: 'register', protected: false, title: 'Registracija' },
    '/dashboard': { view: 'dashboard', protected: true, title: 'Nadzorna plošča' },
    '/novi-oglas': { view: 'create-listing', protected: false, title: 'Oddaj oglas' },
    '/profil': { view: 'profile', protected: true, title: 'Moj profil' },
    '/garaža': { view: 'profile', protected: true, title: 'Moja garaža' },
    '/primerjava': { view: 'compare', protected: false, title: 'Primerjava vozil' },
    '/oceni-vrednost': { view: 'evaluate', protected: false, title: 'Oceni vrednost' },
    '/o-nas': { view: 'about', protected: false, title: 'O nas' },
    '/kontakt': { view: 'contact', protected: false, title: 'Kontakt' },
    '/faq': { view: 'faq', protected: false, title: 'Pogosta vprašanja' },
    '/pravno-obvestilo': { view: 'pravno-obvestilo', protected: false, title: 'Pravno obvestilo' },
    '/zasebnost': { view: 'zasebnost', protected: false, title: 'Zasebnost' },
    '/admin': { view: 'admin', protected: true, title: 'Admin' },
    '/zemljevid': { view: 'map', protected: false, title: 'Zemljevid' },
    '/poslovni-profil': { view: 'business-profile', protected: false, title: 'Poslovni profil' },
    '/booking': { view: 'booking', protected: false, title: 'Rezervacija' },
    '/servis/vnos': { view: 'service-entry', protected: true, title: 'Vnos servisa' },
    '/nastavitve-tco': { view: 'tco-settings', protected: true, title: 'Nastavitve stroškov' },

    // ── B2B Operating System ──
    '/b2b': { view: 'b2b-dashboard', protected: true, b2bOnly: true, title: 'B2B' },
    '/b2b/rezervacije': { view: 'b2b-reservations', protected: true, b2bOnly: true, title: 'B2B rezervacije' },
    '/b2b/storitve': { view: 'b2b-services', protected: true, b2bOnly: true, title: 'B2B storitve' },
    '/b2b/profil': { view: 'b2b-profile-editor', protected: true, b2bOnly: true, title: 'B2B profil' },
    '/b2b/zaloga': { view: 'b2b-inventory', protected: true, b2bOnly: true, title: 'B2B zaloga' },
    '/b2b/leads': { view: 'b2b-leads', protected: true, b2bOnly: true, title: 'B2B leadi' },
    '/b2b/delavnica': { view: 'b2b-workshop', protected: true, b2bOnly: true, title: 'B2B delavnica' },
    '/b2b/servis-vnos': { view: 'service-entry', protected: true, b2bOnly: true, title: 'Vnos servisa' },
    '/b2b/hotel-gum': { view: 'b2b-tire-hotel', protected: true, b2bOnly: true, title: 'Hotel gum' },
    '/b2b/bulk-import': { view: 'bulk-import', protected: true, b2bOnly: true, title: 'Uvoz oglasov' },
};

const PROTECTED_REDIRECT = '/prijava';
const APP = document.getElementById('app-container');

// Views that render entirely in JS (no matching /views/*.html file)
const JS_ONLY_VIEWS = new Set([
    'b2b-dashboard', 'b2b-reservations', 'b2b-services', 'b2b-profile-editor',
    'b2b-inventory', 'b2b-leads', 'b2b-workshop', 'b2b-tire-hotel',
    'tco-settings', 'bulk-import',
]);

// Views that ship a platform-specific variant (views/<view>.<platform>.html).
// An explicit allowlist is required because the SPA host returns index.html (HTTP
// 200) for missing files, so a probe fetch can't reliably detect a missing variant.
const PLATFORM_VIEW_VARIANTS = {
    navtika: new Set(['home', 'advanced-search', 'oglasi', 'drazbe', 'auction-listing']),
};

// ── Programmatic navigation ───────────────────────────────────────────────────
export function navigateTo(path) {
    const base = import.meta.env.BASE_URL;
    const targetPath = (base !== '/' && path.startsWith('/')) ? `${base.slice(0, -1)}${path}` : path;
    history.pushState({}, '', targetPath);
    router();
}
// Expose globally for inline onclick handlers in dynamically-generated HTML.
window.navigateTo = navigateTo;

// ── Page meta helpers ─────────────────────────────────────────────────────────
function applyRouteMeta(route) {
    const b = `${PLATFORM.brandName}${PLATFORM.tld}`;
    document.title = route.title ? `${route.title} — ${b}` : b;
}

// Called by page inits to set a data-driven title (e.g. listing title) and/or description.
export function setPageMeta(title, description) {
    const b = `${PLATFORM.brandName}${PLATFORM.tld}`;
    document.title = `${title} — ${b}`;
    if (description) {
        const el = document.querySelector('meta[name="description"]');
        if (el) el.setAttribute('content', description);
    }
}

// ── Load a view HTML into the main container ──────────────────────────────────
async function loadView(viewName) {
    try {
        if (JS_ONLY_VIEWS.has(viewName)) {
            // JS-only pages: clear container and let the page init render into it.
            APP.innerHTML = '';
        } else {
            const v = `?v=${new Date().getTime()}`;
            // Prefer a platform-specific view variant (e.g. advanced-search.navtika.html)
            // only when one is known to exist; otherwise load the shared view.
            const hasVariant = PLATFORM_VIEW_VARIANTS[PLATFORM.id]?.has(viewName);
            const file = hasVariant ? `${viewName}.${PLATFORM.id}` : viewName;
            const res = await fetch(`views/${file}.html${v}`);
            if (!res.ok) throw new Error(`View not found: ${viewName}`);
            
            let htmlText = await res.text();
            // Rewrite absolute paths inside dynamically-loaded view HTML to match base url
            const base = import.meta.env.BASE_URL;
            if (base !== '/') {
                const cleanBase = base.slice(0, -1);
                htmlText = htmlText
                    .replaceAll('href="/icons/', `href="${cleanBase}/icons/`)
                    .replaceAll('src="/images/', `src="${cleanBase}/images/`);
            }
            APP.innerHTML = htmlText;
        }
        // Translate the newly loaded content
        translatePage(APP);

        // Track the loaded path so filter-only param changes skip a full reload.
        _lastLoadedPath = decodeURIComponent(window.location.pathname);

        // Dispatch so page-specific scripts can init
        document.dispatchEvent(new CustomEvent('routeChanged', { detail: { view: viewName } }));
    } catch {
        APP.innerHTML = `<div class="error-page"><h1>404</h1><p>${t('error_404_msg', 'Page not found.')}</p><a href="/">← ${t('nav_home')}</a></div>`;
    }
}

// Track the last loaded path so same-path navigations (filter params) don't reload the view.
let _lastLoadedPath = null;

// ── Main router function ──────────────────────────────────────────────────────
async function router() {
    // Ensure translations (base + platform overlay) are ready before any view
    // renders, so translatePage never paints stale/base strings on first load.
    await i18nReady;

    const base = import.meta.env.BASE_URL;
    let path = decodeURIComponent(window.location.pathname);

    // Strip base path prefix to match routes (e.g. /MojAvtoSI/oglasi -> /oglasi)
    if (base !== '/' && path.startsWith(base)) {
        path = path.slice(base.length - 1);
    }

    // If only query params changed (same path already loaded), let the page
    // handle the update itself rather than reloading the whole view.
    if (path === _lastLoadedPath) {
        document.dispatchEvent(new CustomEvent('routeParamsChanged', { detail: { path, search: window.location.search } }));
        return;
    }

    // Restore site navbar if leaving admin
    document.getElementById('adm-hide-sitenav')?.remove();

    // Dispatch event to allow cleanup (e.g. unmounting React) before replacing content
    document.dispatchEvent(new CustomEvent('beforeRouteChange', { detail: { path } }));

    let route = routes[path];
    route = route || { view: '404', protected: false, title: null };

    applyRouteMeta(route);

    if (route.protected) {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        if (!user) {
            navigateTo(PROTECTED_REDIRECT);
        } else if (route.b2bOnly) {
            const profile = await fetchB2BProfile(user);
            if (profile?.sellerType !== 'business') {
                navigateTo('/dashboard');
            } else {
                await loadView(route.view);
            }
        } else if (route.view === 'dashboard') {
            const profile = await fetchB2BProfile(user);
            if (profile?.sellerType === 'business') {
                navigateTo('/b2b');
            } else {
                await loadView(route.view);
            }
        } else {
            await loadView(route.view);
        }
        return;
    } else {
        await loadView(route.view);
    }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener('popstate', router);
window.addEventListener('load', router);

// Force a full re-render of the current route (e.g. after a language switch),
// bypassing the same-path guard so JS-rendered views rebuild with new strings.
function reloadCurrentView() {
    _lastLoadedPath = null;
    return router();
}

export { router, reloadCurrentView };
