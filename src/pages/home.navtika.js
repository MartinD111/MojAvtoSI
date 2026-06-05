// ═══════════════════════════════════════════════════════════════════════════════
// Home — MojaNavtika (vessel landing page)
// Rotating hero words (boat terms via lang overlay) + a simple search:
// vrsta plovila (category) · dolžina (length) · moč motorja (power).
// ═══════════════════════════════════════════════════════════════════════════════
import { getListings } from '../services/listingService.js';
import { MAIN_CATEGORIES } from '../data/categories.js';
import { t } from '../core/i18n.js';
import { initWordSlider } from './home.js';

export async function initNavtikaHomePage() {
    console.log('[NavtikaHome] init');

    fillCategorySelect();
    bindSearch();
    initWordSlider();

    try {
        const listings = await getListings();
        renderFeatured(listings);
        renderSponsored(listings);
    } catch (e) {
        console.error('[NavtikaHome] listings load failed', e);
    }

    if (window.lucide) window.lucide.createIcons();
}

// "Vrsta plovila" select = the platform's main categories.
function fillCategorySelect() {
    const sel = document.getElementById('nav-home-cat');
    if (!sel) return;
    sel.innerHTML = Object.values(MAIN_CATEGORIES)
        .map(c => `<option value="${c.slug}">${t(c.label)}</option>`).join('');
    const advLink = document.getElementById('navHomeAdvLink');
    sel.addEventListener('change', () => {
        if (advLink) advLink.href = `#/iskanje?cat=${encodeURIComponent(sel.value)}`;
    });
}

function bindSearch() {
    const form = document.getElementById('navtikaHomeSearch');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const cat = document.getElementById('nav-home-cat')?.value || 'colni';
        const lf = document.getElementById('nav-home-length-from')?.value || '';
        const lt = document.getElementById('nav-home-length-to')?.value || '';
        const pf = document.getElementById('nav-home-power-from')?.value || '';
        const pt = document.getElementById('nav-home-power-to')?.value || '';
        const params = new URLSearchParams({ cat });
        if (lf) params.set('lengthFrom', lf);
        if (lt) params.set('lengthTo', lt);
        if (pf) params.set('powerFrom', pf);
        if (pt) params.set('powerTo', pt);
        window.location.hash = `/iskanje?${params.toString()}`;
    });
}

// ── Sections ──────────────────────────────────────────────────────────────────
function renderFeatured(listings) {
    const section = document.getElementById('featured-section');
    const container = document.getElementById('featured-container');
    if (!container) return;
    const featured = listings.filter(l => l.isPremium || l.promotion?.tier === 'homepage' || l.promotion?.tier === 'sponsored');
    const list = (featured.length ? featured : listings).slice(0, 10);
    if (!list.length) return;
    if (section) section.style.display = '';
    container.innerHTML = list.map(card).join('');
    if (window.lucide) window.lucide.createIcons();
}

function renderSponsored(listings) {
    const track = document.getElementById('rotating-ads-container');
    if (!track) return;
    const list = listings.slice(0, 8);
    track.innerHTML = list.map(card).join('');
    if (window.lucide) window.lucide.createIcons();
}

function powerHp(l) {
    return l.powerHp || l.enginePowerHp || (l.enginePowerKw ? Math.round(l.enginePowerKw * 1.341) : (l.powerKw ? Math.round(l.powerKw * 1.341) : null));
}

function fmt(n) { return new Intl.NumberFormat('sl-SI').format(n); }

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function card(l) {
    const img = l.images?.exterior?.[0] || '/images/porsche.png';
    const price = l.isRental
        ? (l.rentalPricing?.perWeek ? `${fmt(l.rentalPricing.perWeek)} € / teden` : (l.price || '—'))
        : (l.price || (l.priceRaw ? `${fmt(l.priceRaw)} €` : '—'));
    const pills = [];
    if (l.lengthM) pills.push(`${l.lengthM} m`);
    const hp = powerHp(l); if (hp) pills.push(`${hp} KM`);
    if (l.year) pills.push(l.year);
    return `
    <a href="#/oglas?id=${encodeURIComponent(l.id)}" class="glass-card carousel-card" style="min-width:260px;max-width:280px;overflow:hidden;border-radius:1.25rem;text-decoration:none;color:inherit;display:flex;flex-direction:column;">
        <div style="position:relative;aspect-ratio:4/3;background:#e2e8f0;overflow:hidden;">
            <img src="${img}" alt="${esc(l.title || '')}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
            ${l.isRental ? `<span class="rental-badge" style="position:absolute;top:.6rem;left:.6rem;">Najem</span>` : ''}
        </div>
        <div style="padding:.85rem 1rem;display:flex;flex-direction:column;gap:.3rem;">
            <strong style="font-size:.95rem;">${esc(l.title || `${l.make} ${l.model}`)}</strong>
            <div style="display:flex;flex-wrap:wrap;gap:.3rem;">${pills.map(p => `<span class="adv-chip adv-chip-sm" style="font-size:.7rem;padding:.18rem .5rem;">${esc(String(p))}</span>`).join('')}</div>
            <strong style="color:var(--color-primary-start);">${esc(price)}</strong>
        </div>
    </a>`;
}
