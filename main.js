// Main entry point — platform-aware (MojAvto.si / MojaNavtika.si)
import { initI18n, translatePage } from './src/core/i18n.js';
import './src/router.js';
import './src/pageController.js';
import { onAuth } from './src/auth/auth.js';
import { initHeader } from './src/components/header.js';
import { bindB2BContext, onB2BChange } from './src/core/b2bContext.js';
import { registerDefaultExtensions } from './src/core/extensions.js';
import { PLATFORM } from './src/config/platform.js';
import './src/index.css';

// Apply platform brand colors + document title before first paint.
applyPlatformBranding();

// Restore saved theme before any render to avoid flash
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Initialize translations
await initI18n();

// Register B2B extension registry (once)
registerDefaultExtensions();

// Boot header (persists across route changes)
initHeader();

// Boot footer
fetch('views/footer.html')
    .then(r => r.text())
    .then(html => {
        const footerEl = document.getElementById('footer');
        if (footerEl) {
            footerEl.innerHTML = html;
            translatePage(footerEl);
            applyPlatformFooter(footerEl);
        }
    })
    .catch(err => console.error("Error loading footer:", err));


// Track auth state globally so views can use it
window.__authReady = new Promise(resolve => {
    onAuth(user => {
        window.__currentUser = user || null;
        // Bind/unbind B2B profile snapshot whenever auth changes
        bindB2BContext(user);
        resolve(user);
    });
});

// Keep <body> class in sync with B2B mode so CSS can adapt globally
onB2BChange(profile => {
    const isBiz = profile?.sellerType === 'business';
    document.body.classList.toggle('is-b2b', isBiz);
});

// ── Platform branding ──────────────────────────────────────────────────────────
// Override the brand color CSS variables and document title from the active
// PLATFORM. styles.css :root holds the MojAvto defaults; this re-points them so
// MojaNavtika renders its nautical palette without a separate stylesheet.
function applyPlatformBranding() {
    const root = document.documentElement;
    const c = PLATFORM.colors;
    root.style.setProperty('--color-primary-start', c.primaryStart);
    root.style.setProperty('--color-primary-end', c.primaryEnd);
    root.style.setProperty('--logo-accent', c.logoAccent);
    document.body?.classList.add(`platform-${PLATFORM.id}`);
    // Document title is also localized per-route by pageController; this is the
    // initial/default title before the first route resolves.
    document.title = `${PLATFORM.brandName}${PLATFORM.tld}`;
}

// Fill the brand-specific bits of the footer from the active PLATFORM.
function applyPlatformFooter(footerEl) {
    const set = (id, fn) => { const el = footerEl.querySelector('#' + id); if (el) fn(el); };
    set('footerLogo', el => { el.innerHTML = `${PLATFORM.brandName}<span class="logo-accent">${PLATFORM.tld}</span>`; });
    set('footerCompanyName', el => { el.textContent = PLATFORM.company.name; });
    set('footerTaxNo', el => { el.textContent = PLATFORM.company.taxNo; });
    set('footerRegNo', el => { el.textContent = PLATFORM.company.regNo; });
    set('footerEmail', el => { el.textContent = PLATFORM.company.email; el.href = `mailto:${PLATFORM.company.email}`; });
    set('footerCopyrightBrand', el => { el.textContent = `${PLATFORM.brandName}${PLATFORM.tld}`; });
    // Cross-promo link to the sibling portal (MojAvto ⇄ MojaNavtika).
    set('footerSibling', el => {
        el.href = PLATFORM.siblingUrl;
        el.textContent = `↗ ${PLATFORM.siblingName}`;
        el.style.display = '';
    });
}
