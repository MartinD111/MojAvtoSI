// ═══════════════════════════════════════════════════════════════════════════════
// Katalog izdelka — price-comparison product detail — MojAvto.si
// Shows the lowest price ("od X€") and a list of shop offers that link out to the
// external stores where the part/tire can be bought (ceneje.si style).
// ═══════════════════════════════════════════════════════════════════════════════

import { t } from '../core/i18n.js';
import { getCatalogProductById, getLowestPrice } from '../services/catalogService.js';

function getParam(name) {
    const qs = window.location.hash.split('?')[1] || '';
    return new URLSearchParams(qs).get(name);
}

export async function initCatalogProductPage() {
    const root = document.getElementById('catalog-root');
    if (!root) return;

    const id = getParam('id');
    if (!id) {
        root.innerHTML = errorBlock(t('gd_no_product', 'Izdelek ni najden.'));
        return;
    }

    root.innerHTML = `<div class="gd-loading" style="padding:4rem;text-align:center;">${t('gd_loading', 'Nalaganje…')}</div>`;

    let product;
    try {
        product = await getCatalogProductById(id);
    } catch (e) {
        console.error('[CatalogProduct] load failed', e);
        root.innerHTML = errorBlock(t('gd_no_product', 'Izdelek ni najden.'));
        return;
    }

    render(root, product);
}

function render(root, p) {
    const low = getLowestPrice(p);
    const a = p.attributes || {};
    const offers = [...(p.offers || [])].sort((x, y) => (x.price ?? Infinity) - (y.price ?? Infinity));

    const specs = p.itemType === 'tire'
        ? [
            [t('gd_tire_size', 'Dimenzija'), a.size],
            [t('gd_season', 'Sezona'), seasonLabel(a.season)],
            [t('gd_part_brand', 'Znamka'), p.brand],
            ['Indeks nosilnosti', a.loadIndex],
            ['Hitrostni razred', a.speedRating],
        ]
        : [
            [t('gd_part_brand', 'Znamka'), p.brand],
            [t('gd_oem_number', 'OEM številka'), a.oemNumber],
            [t('gd_compatibility', 'Združljivost'), (a.compatibility || []).map(c => `${c.make} ${c.model}`).join(', ')],
        ];

    const specRows = specs.filter(([, v]) => v).map(([l, v]) => `
        <div class="catalog-spec"><span>${l}</span><strong>${escHtml(String(v))}</strong></div>`).join('');

    const offerRows = offers.map(o => `
        <a class="catalog-offer" href="${escAttr(o.url)}" target="_blank" rel="noopener nofollow sponsored">
            <span class="catalog-offer-shop">
                <img class="catalog-offer-favicon" src="https://www.google.com/s2/favicons?domain=${escAttr(o.domain)}&sz=32" alt="" loading="lazy" />
                <span>
                    <strong>${escHtml(o.shop || o.domain)}</strong>
                    <small>${escHtml(o.domain)}${o.inStock === false ? ' · ' + t('gd_out_of_stock', 'Ni na zalogi') : ''}</small>
                </span>
            </span>
            <span class="catalog-offer-right">
                <span class="catalog-offer-price">${o.price != null ? fmtEur(o.price) : ''}</span>
                <span class="catalog-offer-cta">${t('gd_visit_shop', 'Obišči trgovino')} <i data-lucide="external-link"></i></span>
            </span>
        </a>`).join('');

    root.innerHTML = `
        <div class="catalog-detail">
            <a href="#/gume-in-deli" class="catalog-back"><i data-lucide="arrow-left"></i> ${t('gd_back_to_search', 'Nazaj na iskanje')}</a>

            <div class="catalog-detail-grid">
                <div class="catalog-detail-media glass-card">
                    ${p.imageUrl ? `<img src="${escAttr(p.imageUrl)}" alt="${escAttr(p.title || '')}" />`
            : `<i data-lucide="${p.itemType === 'tire' ? 'disc-3' : 'wrench'}"></i>`}
                </div>

                <div class="catalog-detail-info">
                    <h1 class="catalog-detail-title">${escHtml(p.title || '')}</h1>
                    ${low != null ? `<div class="catalog-detail-price">${t('gd_from_price', 'od {price}€').replace('{price}', fmtNum(low))}</div>` : ''}
                    <div class="catalog-detail-shops">${t('gd_shops_count', '{count} trgovin').replace('{count}', offers.length)}</div>
                    <div class="catalog-specs">${specRows}</div>
                </div>
            </div>

            <h2 class="catalog-offers-title">${t('gd_offers_title', 'Na voljo v trgovinah')}</h2>
            <div class="catalog-offers">${offerRows || `<p>${t('gd_no_offers', 'Trenutno ni ponudb.')}</p>`}</div>
            <p class="catalog-disclaimer">${t('gd_external_disclaimer', 'Cene in zaloga so informativne in se lahko razlikujejo od dejanskega stanja v trgovini.')}</p>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
}

function errorBlock(msg) {
    return `<div class="catalog-detail" style="text-align:center;padding:4rem 1rem;">
        <p style="font-size:1.1rem;color:#64748b;">${escHtml(msg)}</p>
        <a href="#/gume-in-deli" class="pill-btn primary" style="margin-top:1rem;display:inline-block;text-decoration:none;">${t('gd_back_to_search', 'Nazaj na iskanje')}</a>
    </div>`;
}

function seasonLabel(s) {
    return { letne: t('gd_season_summer', 'Letne'), zimske: t('gd_season_winter', 'Zimske'), celoletne: t('gd_season_allseason', 'Celoletne') }[s] || s || '';
}
function fmtNum(n) { return new Intl.NumberFormat('sl-SI').format(Math.round(n)); }
function fmtEur(n) { return fmtNum(n) + ' €'; }
function escHtml(str) { return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function escAttr(str) { return escHtml(str); }
