// ═══════════════════════════════════════════════════════════════════════════════
// Gume in deli — parts & tires search — MojAvto.si
// Two data sources merged into one result grid:
//   1. Peer listings (rabljeni/novi deli & gume) posted by users — Firestore listings
//   2. Catalog products (price comparison "od X€") — partsCatalog / mock catalog
// A source toggle lets the user show Vse / Rabljeni oglasi / Cenik trgovin.
// ═══════════════════════════════════════════════════════════════════════════════

import { escHtml } from '../utils/escHtml.js';
import { t } from '../core/i18n.js';
import { getListings } from '../services/listingService.js';
import { getCatalogProducts, getLowestPrice } from '../services/catalogService.js';
import { VEHICLE_CATEGORIES, getPartGroups, getPartTypes } from '../data/partTypes.js';
import { getEquipmentGroups, getEquipmentTypes, getEquipmentTypeLabel, EQUIPMENT_SIZES } from '../data/equipmentTypes.js';
import { initCustomSelects } from '../utils/customSelect.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { PLATFORM } from '../config/platform.js';

const isNavtika = () => PLATFORM.id === 'navtika';

// ── Module state ──────────────────────────────────────────────────────────────
let state = {
    itemType: 'tire',          // 'tire' | 'part'
    vehicleCategory: 'avto',
    source: 'all',             // 'all' | 'peer' | 'catalog'
    filters: {},
};
let peerListings = [];
let catalogProducts = [];
let tireBrands = [];
let equipmentBrands = [];
let partsBrands = {};   // keyed by part group value

// ── Navtika equipment categories (for landing search UI) ──────────────────────
const NAV_EQUIPMENT_CATS = [
    { value: 'navigacija_elektronika', label: 'Navigacija', icon: 'navigation' },
    { value: 'varnost_resevanje',      label: 'Varnostna oprema', icon: 'life-buoy' },
    { value: 'sidrna_oprema',          label: 'Sidra in vrvi', icon: 'anchor' },
    { value: 'jadra_opalov',           label: 'Jadra', icon: 'wind' },
    { value: 'elektrika_akumulator',   label: 'Elektronika', icon: 'zap' },
    { value: 'privez_transport',       label: 'Prikolice za plovila', icon: 'truck' },
];

// ── Init ──────────────────────────────────────────────────────────────────────
export async function initGumeInDeliPage() {
    const root = document.getElementById('gd-root');
    if (!root) return;
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (isNavtika()) {
        state = { itemType: 'part', vehicleCategory: 'colni', source: 'all', filters: {} };
        renderNavtikaLanding(root);
        return;
    }

    state = { itemType: 'tire', vehicleCategory: 'avto', source: 'all', sort: 'recommended', filters: {} };

    // MojAvto uses one continuous search surface: useful results are visible
    // immediately and every control refines them in place.
    renderShell(root);
    initCustomSelects();
    bindChrome();

    const brandLoads = [
        fetch('/json/tire_brands.json').then(r => r.json()).then(d => { tireBrands = d || []; }).catch(() => {}),
        fetch('/json/equipment_brands.json').then(r => r.json()).then(d => { equipmentBrands = d || []; }).catch(() => {}),
        fetch('/json/parts_brands.json').then(r => r.json()).then(d => { partsBrands = d || {}; }).catch(() => {}),
    ];

    renderFilters();
    await Promise.all([loadData(), ...brandLoads]);
    renderFilters();
    applyAndRender();
}

// ── MojAvto: landing search UI (pick what you're looking for, then search) ──────
// Mirrors the navtika "Oprema za plovila" landing: vehicle category + item type +
// category tiles + brand/price filters. Clicking "Išči" transitions to the
// results shell (the advanced-filters view) that previously loaded immediately.
function renderMojAvtoLanding(root) {
    // Brand lists loaded lazily so dropdowns can populate after initial render.
    fetch('/json/tire_brands.json').then(r => r.json()).then(d => { tireBrands = d || []; refreshLandingBrand(); }).catch(() => {});
    fetch('/json/equipment_brands.json').then(r => r.json()).then(d => { equipmentBrands = d || []; refreshLandingBrand(); }).catch(() => {});
    fetch('/json/parts_brands.json').then(r => r.json()).then(d => { partsBrands = d || {}; refreshLandingBrand(); }).catch(() => {});

    const tileGroups = () => {
        if (state.itemType === 'tire') {
            return [
                { value: 'letne', label: 'Letne gume', icon: 'sun' },
                { value: 'zimske', label: 'Zimske gume', icon: 'snowflake' },
                { value: 'celoletne', label: 'Celoletne gume', icon: 'cloud-sun' },
            ];
        }
        if (state.itemType === 'oprema') {
            return getEquipmentGroups().map(g => ({ value: g.value, label: g.label, icon: g.icon || 'shield' }));
        }
        return getPartGroups(state.vehicleCategory).map(g => ({ value: g.value, label: g.label, icon: g.icon || 'wrench' }));
    };

    const brandList = () => {
        if (state.itemType === 'tire') return tireBrands;
        if (state.itemType === 'oprema') return equipmentBrands;
        // parts — use the group-specific list from parts_brands.json
        const group = state.filters.partGroup || '';
        return partsBrands[group] || [];
    };
    const brandIsSelect = () => true; // always a select; falls back to empty list → text input

    const vehTab = (vc) => `
        <button type="button" class="tab-btn ${state.vehicleCategory === vc.value ? 'active' : ''}" data-vehcat="${vc.value}" title="${vc.label}">
            <i data-lucide="${vc.icon}"></i>
            <span class="hidden-md">${vc.label}</span>
        </button>`;

    const itemBtn = (type, icon, label) => `
        <button type="button" class="gd-itemtype-btn ${state.itemType === type ? 'active' : ''}" data-item="${type}">
            <i data-lucide="${icon}"></i> <span>${label}</span>
        </button>`;

    const render = () => {
        const tilesLabel = state.itemType === 'tire'
            ? t('gd_season', 'Sezona')
            : state.itemType === 'oprema'
                ? t('gd_eq_group', 'Sklop opreme')
                : t('gd_part_group', 'Sklop');

        // Sub-type dropdown — shown when a tile is selected (for parts/oprema)
        const selectedGroup = state.itemType === 'oprema' ? state.filters.eqGroup : state.filters.partGroup;
        const subTypes = state.itemType === 'tire' ? []
            : state.itemType === 'oprema' ? (selectedGroup ? getEquipmentTypes(selectedGroup) : [])
            : (selectedGroup ? getPartTypes(state.vehicleCategory, selectedGroup) : []);
        const selectedSubType = state.itemType === 'oprema' ? state.filters.eqType : state.filters.partType;

        const subTypeHtml = subTypes.length > 0 ? `
            <div class="nh-row" id="gdLandSubTypeRow">
                <div class="nh-field">
                    <label>${t('gd_part_type', 'Vrsta')}</label>
                    <div class="pill-select-wrapper">
                        <select id="gdLandSubType" class="pill-input">
                            <option value="">Vse vrste</option>
                            ${subTypes.map(tp => `<option value="${escAttr(tp.value)}" ${selectedSubType === tp.value ? 'selected' : ''}>${escHtml(tp.label)}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>` : '';

        // Brand field — always a select dropdown
        const brands = brandList();
        const brandFieldHtml = `<div class="pill-select-wrapper">
                   <select id="gdLandBrand" class="pill-input" data-type="brand">
                       <option value="">${t('all_brands', 'Vse znamke')}</option>
                       ${brands.map(b => `<option value="${escAttr(b)}" ${state.filters.brand === b ? 'selected' : ''}>${escHtml(b)}</option>`).join('')}
                   </select>
               </div>`;

        root.innerHTML = `
        <div class="search-box-container" style="margin-top:2rem;margin-bottom:4rem;">
            <form id="gdLandForm" class="search-box compact glass-card main-search-card card-squircle">
                <style>
                    #gdLandForm .nh-row { display:flex; gap:1rem; align-items:flex-end; margin-bottom:1.25rem; flex-wrap:wrap; justify-content:center; }
                    #gdLandForm .nh-field { display:flex; flex-direction:column; gap:0.35rem; flex:1; min-width:140px; max-width:280px; }
                    #gdLandForm .nh-field label { font-size:0.78rem; font-weight:600; color:var(--text-muted,#64748b); letter-spacing:0.02em; text-align:center; width:100%; }
                    #gdLandForm .nh-section-label { font-size:0.78rem; font-weight:600; color:var(--text-muted,#64748b); letter-spacing:0.02em; text-align:center; margin-bottom:0.6rem; }
                    #gdLandForm .nh-actions { display:flex; gap:1rem; align-items:center; justify-content:center; margin-top:0.75rem; flex-wrap:wrap; }
                    #gdLandForm .nav-oprema-cat-grid { justify-content:center; }
                    #gdLandForm .gd-itemtype-toggle { justify-content:center; }
                    @media (max-width:600px) {
                        #gdLandForm .nh-row { flex-direction:column; align-items:stretch; }
                        #gdLandForm .pill-select-wrapper { width: 100% !important; }
                    }
                </style>

                <div style="display:flex;align-items:center;justify-content:center;gap:0.6rem;margin-bottom:1.25rem;">
                    <i data-lucide="wrench" style="width:20px;height:20px;color:var(--color-primary,#2563eb);flex-shrink:0;"></i>
                    <span style="font-size:1rem;font-weight:700;">${t('nav_parts', 'Gume in deli')}</span>
                </div>

                <!-- Vehicle category -->
                <div style="margin-bottom:1.25rem;">
                    <div class="glass-card rounded-pill tabs-glass" id="gdLandVehCat" style="width:fit-content; margin-inline:auto;">
                        ${VEHICLE_CATEGORIES.map(vehTab).join('')}
                    </div>
                </div>

                <!-- Item type -->
                <div style="display:flex;justify-content:center;margin-bottom:1.25rem;">
                    <div class="gd-itemtype-toggle" id="gdLandItemType">
                        ${itemBtn('tire', 'disc-3', t('gd_item_tires', 'Gume'))}
                        ${itemBtn('part', 'wrench', t('gd_item_parts', 'Deli'))}
                        ${state.vehicleCategory === 'moto' ? itemBtn('oprema', 'shield', t('cl_sub_oprema', 'Moto oprema')) : ''}
                    </div>
                </div>

                <!-- Category tiles -->
                <div style="margin-bottom:1.25rem;">
                    <div class="nh-section-label">${tilesLabel.toUpperCase()}</div>
                    <div id="gdLandTiles" style="display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center;max-width:600px;margin-inline:auto;">
                        ${tileGroups().map(c => `
                            <button type="button" class="nav-oprema-cat-btn ${isTileActive(c.value) ? 'active' : ''}" data-cat="${c.value}" style="flex:0 0 110px;min-width:110px;max-width:110px;">
                                <i data-lucide="${c.icon}" style="width:26px;height:26px;margin-bottom:0.3rem;"></i>
                                <span>${c.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Sub-type (appears when a tile is selected) -->
                ${subTypeHtml}

                <!-- Brand -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>${t('gd_part_brand', 'Znamka')}</label>
                        ${brandFieldHtml}
                    </div>
                </div>

                <!-- Price range -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>${t('gd_price_from', 'Cena od')} (€)</label>
                        <input type="number" id="gdLandPriceFrom" class="pill-input" placeholder="0 €" min="0" inputmode="numeric" value="${escAttr(state.filters.priceFrom || '')}">
                    </div>
                    <div class="nh-field">
                        <label>${t('gd_price_to', 'Cena do')} (€)</label>
                        <input type="number" id="gdLandPriceTo" class="pill-input" placeholder="${t('gd_no_limit', 'Brez omejitve')}" min="0" inputmode="numeric" value="${escAttr(state.filters.priceTo || '')}">
                    </div>
                </div>

                <!-- Actions -->
                <div class="nh-actions">
                    <button type="button" class="pill-btn secondary" id="gdLandReset" style="flex:1;min-width:140px;max-width:220px;justify-content:center;gap:0.4rem;">
                        <i data-lucide="refresh-cw" style="width:16px;height:16px;"></i> ${t('sidebar_reset', 'Ponastavi')}
                    </button>
                    <button type="button" class="pill-btn primary search-submit-btn" id="gdLandSearch" style="flex:1;min-width:140px;max-width:340px;justify-content:center;gap:0.5rem;">
                        <i data-lucide="search" style="width:16px;height:16px;"></i> ${t('gd_search', 'Išči')}
                    </button>
                </div>
            </form>
        </div>`;

        if (window.lucide) window.lucide.createIcons({ scope: root });
        initCustomSelects();
        bindLanding();
    };

    function isTileActive(value) {
        if (state.itemType === 'tire') return (state.filters.seasons || []).includes(value);
        if (state.itemType === 'oprema') return state.filters.eqGroup === value;
        return state.filters.partGroup === value;
    }

    function refreshLandingBrand() {
        const sel = document.getElementById('gdLandBrand');
        if (!sel || sel.tagName !== 'SELECT') return;
        sel.innerHTML = `<option value="">${t('all_brands', 'Vse znamke')}</option>` +
            brandList().map(b => `<option value="${escAttr(b)}" ${state.filters.brand === b ? 'selected' : ''}>${escHtml(b)}</option>`).join('');
    }

    function bindLanding() {
        // Vehicle category
        document.getElementById('gdLandVehCat')?.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-btn');
            if (!tab) return;
            state.vehicleCategory = tab.dataset.vehcat;
            if (state.itemType === 'oprema' && state.vehicleCategory !== 'moto') state.itemType = 'tire';
            state.filters = {};
            render();
        });

        // Item type
        document.getElementById('gdLandItemType')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.gd-itemtype-btn');
            if (!btn) return;
            state.itemType = btn.dataset.item;
            state.filters = {};
            render();
        });

        // Category tiles (multi-select for tire seasons, single for part/eq group)
        // Re-renders to show/hide sub-type dropdown for parts/oprema
        document.getElementById('gdLandTiles')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.nav-oprema-cat-btn');
            if (!btn) return;
            const val = btn.dataset.cat;
            if (state.itemType === 'tire') {
                const set = new Set(state.filters.seasons || []);
                set.has(val) ? set.delete(val) : set.add(val);
                state.filters.seasons = [...set];
                // Tire tiles are multi-select — just toggle the active class, no full re-render needed
                btn.classList.toggle('active');
            } else {
                const key = state.itemType === 'oprema' ? 'eqGroup' : 'partGroup';
                const subKey = state.itemType === 'oprema' ? 'eqType' : 'partType';
                const wasActive = btn.classList.contains('active');
                state.filters[key] = wasActive ? '' : val;
                state.filters[subKey] = '';
                // Re-render to show sub-type dropdown
                render();
            }
        });

        // Sub-type select (injected after tile selection)
        document.getElementById('gdLandSubType')?.addEventListener('change', (e) => {
            const key = state.itemType === 'oprema' ? 'eqType' : 'partType';
            state.filters[key] = e.target.value;
        });

        // Reset
        document.getElementById('gdLandReset')?.addEventListener('click', () => {
            state.filters = {};
            render();
        });

        // Search → results shell (advanced-filters view)
        document.getElementById('gdLandSearch')?.addEventListener('click', async () => {
            const brandEl = document.getElementById('gdLandBrand');
            if (brandEl) state.filters.brand = brandEl.value || '';
            const pf = parseInt(document.getElementById('gdLandPriceFrom')?.value) || 0;
            const pt = parseInt(document.getElementById('gdLandPriceTo')?.value) || 0;
            state.filters.priceFrom = pf > 0 ? String(pf) : '';
            state.filters.priceTo = pt > 0 ? String(pt) : '';

            renderShell(root);
            initCustomSelects();
            bindChrome();
            fetch('/json/tire_brands.json').then(r => r.json()).then(d => { tireBrands = d || []; renderFilters(); }).catch(() => {});
            fetch('/json/equipment_brands.json').then(r => r.json()).then(d => { equipmentBrands = d || []; renderFilters(); }).catch(() => {});
            await loadData();
            renderFilters();
            applyAndRender();
        });
    }

    render();
}

// ── Navtika: landing search UI ────────────────────────────────────────────────
function renderNavtikaLanding(root) {
    let selectedCat = '';
    let navBrands = {};

    const curYear = new Date().getFullYear();
    const yearOpts = (placeholder) => `<option value="">${placeholder}</option>` +
        Array.from({length: curYear - 1979}, (_, i) => curYear - i)
            .map(y => `<option value="${y}">${y}</option>`).join('');

    const brandOpts = () =>
        `<option value="">Vse znamke</option>` +
        Object.keys(navBrands).sort().map(b => `<option value="${b}">${b}</option>`).join('');

    const modelOpts = (brand) => {
        if (!brand || !navBrands[brand]) return `<option value="">Vsi modeli</option>`;
        const models = Array.isArray(navBrands[brand]) ? navBrands[brand] : Object.keys(navBrands[brand]);
        return `<option value="">Vsi modeli</option>` + models.map(m => `<option value="${m}">${m}</option>`).join('');
    };

    root.innerHTML = `
        <div class="search-box-container" style="margin-top:2rem;margin-bottom:4rem;">
            <form id="navOpremaForm" class="search-box compact glass-card main-search-card card-squircle">
                <style>
                    #navOpremaForm .nh-row { display:flex; gap:1rem; align-items:flex-end; margin-bottom:1.25rem; flex-wrap:wrap; }
                    #navOpremaForm .nh-field { display:flex; flex-direction:column; gap:0.35rem; flex:1; min-width:140px; }
                    #navOpremaForm .nh-field label { font-size:0.78rem; font-weight:600; color:var(--text-muted,#64748b); letter-spacing:0.02em; text-align:center; width:100%; }
                    #navOpremaForm .nh-section-label { font-size:0.78rem; font-weight:600; color:var(--text-muted,#64748b); letter-spacing:0.02em; text-align:center; margin-bottom:0.6rem; }
                    #navOpremaForm .nh-actions { display:flex; gap:1rem; align-items:center; justify-content:center; margin-top:0.75rem; flex-wrap:wrap; }
                    #navOpremaForm .nav-oprema-cat-grid { justify-content:center; }
                    @media (max-width:600px) {
                        #navOpremaForm .nh-row { flex-direction:column; align-items:stretch; }
                        #navOpremaForm .pill-select-wrapper,
                        #navOpremaForm .pill-input-wrapper { width: 100% !important; }
                    }
                </style>

                <!-- Header: title only -->
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;">
                    <i data-lucide="anchor" style="width:20px;height:20px;color:var(--color-primary,#2563eb);flex-shrink:0;"></i>
                    <span style="font-size:1rem;font-weight:700;">Oprema za plovila</span>
                </div>

                <!-- Category tiles -->
                <div style="margin-bottom:1.25rem;">
                    <div class="nh-section-label">VRSTA OPREME</div>
                    <div class="nav-oprema-cat-grid" id="navCatGrid">
                        ${NAV_EQUIPMENT_CATS.map(c => `
                            <button type="button" class="nav-oprema-cat-btn" data-cat="${c.value}">
                                <i data-lucide="${c.icon}" style="width:26px;height:26px;margin-bottom:0.3rem;"></i>
                                <span>${c.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Row: Znamka + Model -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>Znamka</label>
                        <div class="pill-select-wrapper">
                            <select id="navBrand" class="pill-input" data-type="brand">
                                <option value="">Vse znamke</option>
                            </select>
                        </div>
                    </div>
                    <div class="nh-field">
                        <label>Model</label>
                        <div class="pill-select-wrapper">
                            <select id="navModel" class="pill-input" disabled>
                                <option value="">Vsi modeli</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Row: Cena od + Cena do (pill number inputs) -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>Cena od (€)</label>
                        <input type="number" id="navPriceFrom" class="pill-input" placeholder="0 €" min="0" inputmode="numeric">
                    </div>
                    <div class="nh-field">
                        <label>Cena do (€)</label>
                        <input type="number" id="navPriceTo" class="pill-input" placeholder="Brez omejitve" min="0" inputmode="numeric">
                    </div>
                </div>

                <!-- Row: Letnik od + Letnik do -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>Letnik od</label>
                        <div class="pill-select-wrapper">
                            <select id="navYearFrom" class="pill-input">
                                ${yearOpts('npr. 2010')}
                            </select>
                        </div>
                    </div>
                    <div class="nh-field">
                        <label>Letnik do</label>
                        <div class="pill-select-wrapper">
                            <select id="navYearTo" class="pill-input">
                                ${yearOpts('Vse')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="nh-actions">
                    <button type="reset" class="pill-btn secondary" style="flex:1;min-width:140px;max-width:220px;justify-content:center;gap:0.4rem;">
                        <i data-lucide="refresh-cw" style="width:16px;height:16px;"></i> Ponastavi
                    </button>
                    <button type="button" class="pill-btn primary search-submit-btn" id="navOpremaSearch" style="flex:1;min-width:140px;max-width:340px;justify-content:center;gap:0.5rem;">
                        <i data-lucide="search" style="width:16px;height:16px;"></i> Išči opremo
                    </button>
                </div>
            </form>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons({ scope: root });
    initCustomSelects();

    // Category tiles
    root.querySelectorAll('.nav-oprema-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');
            root.querySelectorAll('.nav-oprema-cat-btn').forEach(b => b.classList.remove('active'));
            if (!wasActive) btn.classList.add('active');
            selectedCat = btn.classList.contains('active') ? btn.dataset.cat : '';
        });
    });

    // Brand / model cascade
    fetch('/json/brands_models_plovila.json').then(r => r.json()).then(d => {
        navBrands = d || {};
        const brandSel = document.getElementById('navBrand');
        if (brandSel) brandSel.innerHTML = brandOpts();
    }).catch(() => {});

    document.getElementById('navBrand')?.addEventListener('change', e => {
        const modelSel = document.getElementById('navModel');
        if (!modelSel) return;
        modelSel.innerHTML = modelOpts(e.target.value);
        modelSel.disabled = !e.target.value;
    });

    // Reset clears category tiles too
    root.querySelector('form')?.addEventListener('reset', () => {
        setTimeout(() => {
            root.querySelectorAll('.nav-oprema-cat-btn').forEach(b => b.classList.remove('active'));
            selectedCat = '';
            const modelSel = document.getElementById('navModel');
            if (modelSel) { modelSel.innerHTML = '<option value="">Vsi modeli</option>'; modelSel.disabled = true; }
        }, 0);
    });

    // Search → results view
    document.getElementById('navOpremaSearch')?.addEventListener('click', async () => {
        const brand = document.getElementById('navBrand')?.value || '';
        const model = document.getElementById('navModel')?.value || '';
        const priceFrom = parseInt(document.getElementById('navPriceFrom')?.value) || 0;
        const priceTo = parseInt(document.getElementById('navPriceTo')?.value) || 0;
        const yearFrom = document.getElementById('navYearFrom')?.value || '';
        const yearTo = document.getElementById('navYearTo')?.value || '';
        const prodaja = document.getElementById('navProdajaToggle')?.checked;
        const najem = document.getElementById('navNajemToggle')?.checked;

        state.filters = {
            partGroup: selectedCat,
            brand,
            priceFrom: priceFrom > 0 ? priceFrom : '',
            priceTo: priceTo > 0 ? priceTo : '',
            yearFrom,
            yearTo,
            prodaja,
            najem,
        };

        renderShell(root);
        initCustomSelects();
        bindChrome();
        fetch('/json/equipment_brands.json').then(r => r.json()).then(d => { equipmentBrands = d || []; renderFilters(); }).catch(() => {});
        await loadData();
        renderFilters();
        applyAndRender();
    });
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadData() {
    const results = document.getElementById('gdResults');
    if (results) results.innerHTML = `<div class="gd-loading">${t('gd_loading', 'Nalaganje…')}</div>`;

    try {
        const [listings, catalog] = await Promise.all([
            getListings(),
            getCatalogProducts(),
        ]);
        peerListings = (listings || []).filter(l => l.itemType === 'part' || l.itemType === 'tire' || l.itemType === 'oprema');
        catalogProducts = catalog || [];
    } catch (e) {
        console.error('[GumeInDeli] data load failed', e);
        peerListings = [];
        catalogProducts = [];
    }
}



// ── Shell ─────────────────────────────────────────────────────────────────────
function quickFiltersHtml() {
    const f = state.filters;

    if (state.itemType === 'tire') {
        const widths = []; for (let w = 125; w <= 355; w += 5) widths.push(w);
        const aspects = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
        const rims = []; for (let r = 10; r <= 24; r++) rims.push(r);
        const options = (items, selected) => items.map(value =>
            `<option value="${value}" ${String(selected) === String(value) ? 'selected' : ''}>${value}</option>`
        ).join('');

        return `
            <div class="gd-quick-group" aria-label="${t('gd_tire_size', 'Dimenzija pnevmatike')}">
                <span class="gd-quick-label">${t('gd_tire_size', 'Dimenzija')}</span>
                <select id="gdQuickWidth" class="gd-quick-select" data-no-search="true" aria-label="${t('gd_tire_width', 'Širina')}">
                    <option value="">${t('gd_tire_width', 'Širina')}</option>${options(widths, f.width)}
                </select>
                <span class="gd-size-separator">/</span>
                <select id="gdQuickAspect" class="gd-quick-select" data-no-search="true" aria-label="${t('gd_tire_aspect', 'Profil')}">
                    <option value="">${t('gd_tire_aspect', 'Profil')}</option>${options(aspects, f.aspect)}
                </select>
                <span class="gd-size-separator">R</span>
                <select id="gdQuickRim" class="gd-quick-select gd-quick-select--rim" data-no-search="true" aria-label="Premer">
                    <option value="">—</option>${options(rims, f.rim)}
                </select>
            </div>`;
    }

    const groups = state.itemType === 'oprema' ? getEquipmentGroups() : getPartGroups(state.vehicleCategory);
    const selected = state.itemType === 'oprema' ? f.eqGroup : f.partGroup;
    return `
        <label class="gd-quick-group gd-quick-group--category">
            <span class="gd-quick-label">${state.itemType === 'oprema' ? t('gd_eq_group', 'Sklop opreme') : t('gd_part_group', 'Sklop')}</span>
            <select id="gdQuickGroup" class="gd-quick-select">
                <option value="">${state.itemType === 'oprema' ? t('gd_eq_all_groups', 'Vsa oprema') : t('gd_all_groups', 'Vsi sklopi')}</option>
                ${groups.map(group => `<option value="${escAttr(group.value)}" ${selected === group.value ? 'selected' : ''}>${escHtml(group.label)}</option>`).join('')}
            </select>
        </label>`;
}

function renderShell(root) {
    const itemBtn = (type, icon, label) => `
        <button type="button" class="gd-itemtype-btn ${state.itemType === type ? 'active' : ''}" data-item="${type}">
            <i data-lucide="${icon}"></i> <span>${label}</span>
        </button>`;

    const heroHtml = isNavtika()
        ? `<div class="gd-hero-container">
            <h1 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:0.5rem;">Oprema za plovila</h1>
            <p style="text-align:center;color:var(--text-secondary);margin-bottom:1.5rem;">Motorji, navigacija, varnostna oprema in dodatki za plovila.</p>
           </div>`
        : `<section class="gd-search-hero glass-card">
            <div class="gd-search-heading">
                <div>
                    <span class="gd-eyebrow">MojAvto iskalnik</span>
                    <h1>${t('gd_title', 'Gume in deli')}</h1>
                    <p>${t('gd_subtitle', 'Poiščite pravi izdelek med oglasi in ponudbami trgovin.')}</p>
                </div>
                <a href="/novi-oglas" class="gd-sell-link"><i data-lucide="circle-plus"></i> Objavi oglas</a>
            </div>

            <div class="gd-search-input-wrap">
                <i data-lucide="search"></i>
                <input id="gdSearchQuery" type="search" autocomplete="off" value="${escAttr(state.filters.query || '')}"
                    placeholder="${state.itemType === 'tire' ? 'Išči znamko ali model pnevmatike' : 'Išči del, znamko ali OEM številko'}"
                    aria-label="Išči med gumami in deli">
                <button type="button" id="gdSearchClear" class="gd-search-clear ${state.filters.query ? 'visible' : ''}" aria-label="Počisti iskanje">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div class="gd-search-controls">
                <div class="gd-control-block">
                    <span class="gd-control-label">Za katero vozilo?</span>
                    <div class="gd-smart-field gd-smart-field--vehicle">
                        <i data-lucide="car"></i>
                        <select id="gdVehCatSelect" class="gd-vehicle-select" aria-label="Za katero vozilo?"><option value="">Izberite kategorijo</option>
                            ${VEHICLE_CATEGORIES.map(vc => `<option value="${vc.value}" ${state.vehicleCategory === vc.value ? 'selected' : ''}>${vc.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="gd-control-block">
                    <span class="gd-control-label">Kaj iščete?</span>
                    <div class="gd-itemtype-toggle" id="gdItemType">
                        ${itemBtn('tire', 'disc-3', t('gd_item_tires', 'Gume'))}
                        ${itemBtn('part', 'wrench', t('gd_item_parts', 'Deli'))}
                        ${state.vehicleCategory === 'moto' ? itemBtn('oprema', 'shield', t('cl_sub_oprema', 'Moto oprema')) : ''}
                    </div>
                </div>
                ${quickFiltersHtml()}
            </div>
           </section>`;

    root.innerHTML = `
        ${heroHtml}

        <div class="oglasi-layout">
            <aside class="oglasi-sidebar">
                <button type="button" id="gdMobileFilterToggle" class="mobile-filter-toggle">
                    <span><i data-lucide="sliders-horizontal"></i> ${t('sidebar_filters_title', 'Filtri')}</span>
                    <i data-lucide="chevron-down" class="mft-chevron"></i>
                </button>
                <div class="oglasi-sidebar-card glass-card" id="gdFilters"></div>
                <button type="button" class="gd-mobile-apply" id="gdMobileApply">Prikaži <span id="gdMobileCount">0</span> zadetkov</button>
            </aside>
            <button type="button" class="gd-filter-backdrop" id="gdFilterBackdrop" aria-label="Zapri filtre"></button>

            <main class="gd-main">
                <div class="gd-results-header">
                    <div class="gd-source-toggle" id="gdSource">
                        <button type="button" class="gd-source-btn ${state.source === 'all' ? 'active' : ''}" data-source="all">${t('gd_source_all', 'Vse')} <span id="gdSourceAllCount">0</span></button>
                        <button type="button" class="gd-source-btn ${state.source === 'peer' ? 'active' : ''}" data-source="peer">${t('all_listings', 'Oglasi')} <span id="gdSourcePeerCount">0</span></button>
                        <button type="button" class="gd-source-btn ${state.source === 'catalog' ? 'active' : ''}" data-source="catalog">${t('gd_source_catalog', 'Trgovine')} <span id="gdSourceCatalogCount">0</span></button>
                    </div>
                    <div class="gd-results-tools">
                        <span class="gd-count" id="gdCount"></span>
                        <label class="gd-sort-wrap">
                            <span class="sr-only">Razvrsti rezultate</span>
                            <select id="gdSort" class="gd-sort-select">
                                <option value="recommended" ${state.sort === 'recommended' ? 'selected' : ''}>Priporočeno</option>
                                <option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Najnižja cena</option>
                                <option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Najvišja cena</option>
                                <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>Najnovejše</option>
                            </select>
                            <i data-lucide="chevron-down"></i>
                        </label>
                    </div>
                </div>
                <div class="gd-active-filters" id="gdActiveFilters" aria-live="polite"></div>
                <div class="gd-results-grid" id="gdResults"></div>
            </main>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
}

function bindChrome() {
    let queryTimer;

    const refreshShell = () => {
        const root = document.getElementById('gd-root');
        renderShell(root);
        bindChrome();
        renderFilters();
        applyAndRender();
    };

    // Item type toggle
    document.getElementById('gdItemType')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.gd-itemtype-btn');
        if (!btn) return;
        const type = btn.dataset.item;
        state.itemType = type;
        state.filters = {};

        refreshShell();
    });

    // Vehicle category tabs
    document.getElementById('gdVehCatSelect')?.addEventListener('change', (e) => {
        if (!e.target.value) return;
        state.vehicleCategory = e.target.value;
        
        // Oprema is moto-only — drop back to tire when leaving the moto category
        if (state.itemType === 'oprema' && state.vehicleCategory !== 'moto') {
            state.itemType = 'tire';
        }
        
        // Part group/type are vehicle-specific — reset them
        state.filters = {};
        
        // Re-render shell to show/hide Moto Oprema button
        refreshShell();
    });

    // Source toggle
    document.getElementById('gdSource')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.gd-source-btn');
        if (!btn) return;
        state.source = btn.dataset.source;
        document.querySelectorAll('#gdSource .gd-source-btn').forEach(b => b.classList.toggle('active', b === btn));
        applyAndRender();
    });

    // Primary text search with a short debounce so typing remains calm.
    const queryInput = document.getElementById('gdSearchQuery');
    queryInput?.addEventListener('input', (e) => {
        state.filters.query = e.target.value;
        document.getElementById('gdSearchClear')?.classList.toggle('visible', Boolean(e.target.value));
        clearTimeout(queryTimer);
        queryTimer = setTimeout(applyAndRender, 160);
    });
    document.getElementById('gdSearchClear')?.addEventListener('click', () => {
        state.filters.query = '';
        if (queryInput) queryInput.value = '';
        document.getElementById('gdSearchClear')?.classList.remove('visible');
        queryInput?.focus();
        applyAndRender();
    });

    // Contextual quick filters mirror the detailed sidebar controls.
    const setQuick = (id, key) => document.getElementById(id)?.addEventListener('change', (e) => {
        state.filters[key] = e.target.value;
        renderFilters();
        applyAndRender();
    });
    setQuick('gdQuickWidth', 'width');
    setQuick('gdQuickAspect', 'aspect');
    setQuick('gdQuickRim', 'rim');
    document.getElementById('gdQuickGroup')?.addEventListener('change', (e) => {
        const key = state.itemType === 'oprema' ? 'eqGroup' : 'partGroup';
        state.filters[key] = e.target.value;
        state.filters[state.itemType === 'oprema' ? 'eqType' : 'partType'] = '';
        renderFilters();
        applyAndRender();
    });

    document.getElementById('gdSort')?.addEventListener('change', (e) => {
        state.sort = e.target.value;
        applyAndRender();
    });

    document.getElementById('gdActiveFilters')?.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-clear-filter]');
        if (!chip) return;
        clearFilterGroup(chip.dataset.clearFilter);
        refreshShell();
    });

    // Mobile filter toggle
    const closeMobileFilters = () => {
        document.getElementById('gdFilters')?.classList.remove('open');
        document.getElementById('gdMobileFilterToggle')?.classList.remove('open');
        document.getElementById('gdFilterBackdrop')?.classList.remove('open');
        document.body.classList.remove('gd-filters-open');
    };
    document.getElementById('gdMobileFilterToggle')?.addEventListener('click', () => {
        document.getElementById('gdFilters')?.classList.add('open');
        document.getElementById('gdMobileFilterToggle')?.classList.add('open');
        document.getElementById('gdFilterBackdrop')?.classList.add('open');
        document.body.classList.add('gd-filters-open');
    });
    document.getElementById('gdMobileApply')?.addEventListener('click', closeMobileFilters);
    document.getElementById('gdFilterBackdrop')?.addEventListener('click', closeMobileFilters);
}

// ── Filters sidebar (depends on item type) ────────────────────────────────────
function renderFilters() {
    const box = document.getElementById('gdFilters');
    if (!box) return;
    box.innerHTML = state.itemType === 'tire' ? tireFiltersHtml()
        : state.itemType === 'oprema' ? equipmentFiltersHtml()
        : partFiltersHtml();
    if (window.lucide) window.lucide.createIcons({ scope: box });
    initCustomSelects();
    box.querySelectorAll('.js-format-number').forEach(input => setupNumericFormatter(input));
    bindFilters();
}

function tireFiltersHtml() {
    const widths = []; for (let w = 125; w <= 355; w += 5) widths.push(w);
    const aspects = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
    const rims = []; for (let r = 10; r <= 24; r++) rims.push(r);
    const opt = (v, sel) => `<option value="${v}" ${String(sel) === String(v) ? 'selected' : ''}>${v}</option>`;
    const f = state.filters;

    return `
        <div class="gd-filter-header">
            <h3>${t('sidebar_filters_title', 'Filtri')}</h3>
            <button type="button" id="gdReset" class="gd-reset">${t('sidebar_reset', 'Počisti vse')}</button>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_tire_size', 'Dimenzija')}</label>
            <div class="gd-dim-row">
                <select class="glass-select" id="fW" data-no-search="true"><option value="">${t('gd_tire_width', 'Širina')}</option>${widths.map(w => opt(w, f.width)).join('')}</select>
                <select class="glass-select" id="fA" data-no-search="true"><option value="">${t('gd_tire_aspect', 'Profil')}</option>${aspects.map(a => opt(a, f.aspect)).join('')}</select>
                <select class="glass-select" id="fR" data-no-search="true"><option value="">R</option>${rims.map(r => opt(r, f.rim)).join('')}</select>
            </div>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_season', 'Sezona')}</label>
            <div class="adv-chip-group gd-chips">
                ${seasonChip('letne', t('gd_season_summer', 'Letne'))}
                ${seasonChip('zimske', t('gd_season_winter', 'Zimske'))}
                ${seasonChip('celoletne', t('gd_season_allseason', 'Celoletne'))}
            </div>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_part_brand', 'Znamka')}</label>
            <select class="glass-select" id="fBrand" data-type="brand">
                <option value="">${t('all_brands', 'Vse znamke')}</option>
                ${tireBrands.map(b => `<option value="${escAttr(b)}" ${f.brand === b ? 'selected' : ''}>${escHtml(b)}</option>`).join('')}
            </select>
        </div>

        ${priceRangeHtml(f)}
        ${conditionChipsHtml(f)}
    `;
}

function partFiltersHtml() {
    const f = state.filters;
    const groups = getPartGroups(state.vehicleCategory);
    const groupOpts = groups.map(g => `<option value="${g.value}" ${f.partGroup === g.value ? 'selected' : ''}>${g.label}</option>`).join('');
    const types = f.partGroup ? getPartTypes(state.vehicleCategory, f.partGroup) : [];
    const typeOpts = types.map(tp => `<option value="${tp.value}" ${f.partType === tp.value ? 'selected' : ''}>${tp.label}</option>`).join('');
    // Without a selected group, expose the complete unique catalog. This keeps
    // the brand picker immediately useful while still narrowing to the relevant
    // manufacturers as soon as the user selects a part group.
    const partBrands = f.partGroup
        ? (partsBrands[f.partGroup] || [])
        : [...new Set(Object.values(partsBrands).flat())].sort((a, b) => a.localeCompare(b, 'sl'));

    return `
        <div class="gd-filter-header">
            <h3>${t('sidebar_filters_title', 'Filtri')}</h3>
            <button type="button" id="gdReset" class="gd-reset">${t('sidebar_reset', 'Počisti vse')}</button>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_part_group', 'Sklop')}</label>
            <select class="glass-select" id="fGroup">
                <option value="">${t('gd_all_groups', 'Vsi sklopi')}</option>
                ${groupOpts}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_part_type', 'Vrsta dela')}</label>
            <select class="glass-select" id="fType" ${f.partGroup ? '' : 'disabled'}>
                <option value="">${t('gd_all_types', 'Vse vrste')}</option>
                ${typeOpts}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel" for="fPartBrand">${t('gd_part_brand', 'Znamka / proizvajalec')}</label>
            <select class="glass-select" id="fPartBrand" data-type="brand">
                <option value="">${t('all_brands', 'Vse znamke')}</option>
                ${partBrands.map(b => `<option value="${escAttr(b)}" ${f.brand === b ? 'selected' : ''}>${escHtml(b)}</option>`).join('')}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_oem_number', 'OEM številka')}</label>
            <input type="text" class="pill-input" id="fOemText" value="${escAttr(f.oem || '')}" placeholder="npr. 0986494104" />
        </div>

        ${priceRangeHtml(f)}
        ${conditionChipsHtml(f)}
    `;
}

function equipmentFiltersHtml() {
    const f = state.filters;
    const groups = getEquipmentGroups();
    const groupOpts = groups.map(g => `<option value="${g.value}" ${f.eqGroup === g.value ? 'selected' : ''}>${g.label}</option>`).join('');
    const types = f.eqGroup ? getEquipmentTypes(f.eqGroup) : [];
    const typeOpts = types.map(tp => `<option value="${tp.value}" ${f.eqType === tp.value ? 'selected' : ''}>${tp.label}</option>`).join('');
    const sizeOpts = EQUIPMENT_SIZES.map(s => `<option value="${s}" ${f.eqSize === s ? 'selected' : ''}>${s}</option>`).join('');

    return `
        <div class="gd-filter-header">
            <h3>${t('sidebar_filters_title', 'Filtri')}</h3>
            <button type="button" id="gdReset" class="gd-reset">${t('sidebar_reset', 'Počisti vse')}</button>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_eq_group', 'Sklop opreme')}</label>
            <select class="glass-select" id="fEqGroup">
                <option value="">${t('gd_eq_all_groups', 'Vsi sklopi')}</option>
                ${groupOpts}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_eq_type', 'Vrsta')}</label>
            <select class="glass-select" id="fEqType" ${f.eqGroup ? '' : 'disabled'}>
                <option value="">${t('gd_eq_all_types', 'Vse vrste')}</option>
                ${typeOpts}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel" for="fEqBrand">${t('gd_part_brand', 'Znamka / proizvajalec')}</label>
            <select class="glass-select" id="fEqBrand" data-type="brand">
                <option value="">${t('all_brands', 'Vse znamke')}</option>
                ${equipmentBrands.map(b => `<option value="${escAttr(b)}" ${f.brand === b ? 'selected' : ''}>${escHtml(b)}</option>`).join('')}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_eq_size', 'Velikost')}</label>
            <select class="glass-select" id="fEqSize" data-no-search="true">
                <option value="">${t('gd_eq_all_sizes', 'Vse velikosti')}</option>
                ${sizeOpts}
            </select>
        </div>

        ${priceRangeHtml(f)}
        ${conditionChipsHtml(f)}
    `;
}

function seasonChip(value, label) {
    const on = (state.filters.seasons || []).includes(value);
    return `<label class="adv-chip ${on ? 'checked' : ''}"><input type="checkbox" name="season" value="${value}" ${on ? 'checked' : ''}> ${label}</label>`;
}

function priceRangeHtml(f) {
    return `
        <div class="gd-filter-group">
            <label class="gd-flabel">${t('gd_price', 'Cena (€)')}</label>
            <div class="gd-dim-row">
                <input type="text" class="pill-input js-format-number" id="fPriceFrom" value="${escAttr(f.priceFrom || '')}" placeholder="${t('gd_from', 'od')}" />
                <input type="text" class="pill-input js-format-number" id="fPriceTo" value="${escAttr(f.priceTo || '')}" placeholder="${t('gd_to', 'do')}" />
            </div>
        </div>`;
}

function conditionChipsHtml(f) {
    const used = (f.conditions || []).includes('Rabljeno');
    const isnew = (f.conditions || []).includes('Novo');
    return `
        <div class="gd-filter-group">
            <label class="gd-flabel">${t('cl_condition', 'Stanje')} <span class="gd-hint">(${t('gd_source_peer', 'Rabljeni oglasi')})</span></label>
            <div class="adv-chip-group gd-chips">
                <label class="adv-chip ${isnew ? 'checked' : ''}"><input type="checkbox" name="condition" value="Novo" ${isnew ? 'checked' : ''}> ${t('gd_condition_new', 'Novo')}</label>
                <label class="adv-chip ${used ? 'checked' : ''}"><input type="checkbox" name="condition" value="Rabljeno" ${used ? 'checked' : ''}> ${t('gd_condition_used', 'Rabljeno')}</label>
            </div>
        </div>`;
}

function bindFilters() {
    const box = document.getElementById('gdFilters');
    if (!box) return;
    const f = state.filters;

    const onChange = () => applyAndRender();

    // Tire dimension + brand
    box.querySelector('#fW')?.addEventListener('change', e => { f.width = e.target.value; onChange(); });
    box.querySelector('#fA')?.addEventListener('change', e => { f.aspect = e.target.value; onChange(); });
    box.querySelector('#fR')?.addEventListener('change', e => { f.rim = e.target.value; onChange(); });
    box.querySelector('#fBrand')?.addEventListener('change', e => { f.brand = e.target.value; onChange(); });

    // Part group/type
    box.querySelector('#fGroup')?.addEventListener('change', e => {
        f.partGroup = e.target.value;
        f.partType = '';
        f.brand = '';
        renderFilters();
        applyAndRender();
    });
    box.querySelector('#fType')?.addEventListener('change', e => { f.partType = e.target.value; onChange(); });
    box.querySelector('#fPartBrand')?.addEventListener('change', e => { f.brand = e.target.value; onChange(); });
    box.querySelector('#fOemText')?.addEventListener('input', e => { f.oem = e.target.value; onChange(); });

    // Equipment (oprema) group/type/brand/size
    box.querySelector('#fEqGroup')?.addEventListener('change', e => {
        f.eqGroup = e.target.value;
        f.eqType = '';
        renderFilters();
        applyAndRender();
    });
    box.querySelector('#fEqType')?.addEventListener('change', e => { f.eqType = e.target.value; onChange(); });
    box.querySelector('#fEqBrand')?.addEventListener('change', e => { f.brand = e.target.value; onChange(); });
    box.querySelector('#fEqSize')?.addEventListener('change', e => { f.eqSize = e.target.value; onChange(); });

    // Price
    box.querySelector('#fPriceFrom')?.addEventListener('input', e => { f.priceFrom = e.target.value; onChange(); });
    box.querySelector('#fPriceTo')?.addEventListener('input', e => { f.priceTo = e.target.value; onChange(); });

    // Season + condition chips
    box.querySelectorAll('input[name="season"]').forEach(cb => cb.addEventListener('change', () => {
        f.seasons = [...box.querySelectorAll('input[name="season"]:checked')].map(c => c.value);
        box.querySelectorAll('input[name="season"]').forEach(c => c.closest('.adv-chip').classList.toggle('checked', c.checked));
        onChange();
    }));
    box.querySelectorAll('input[name="condition"]').forEach(cb => cb.addEventListener('change', () => {
        f.conditions = [...box.querySelectorAll('input[name="condition"]:checked')].map(c => c.value);
        box.querySelectorAll('input[name="condition"]').forEach(c => c.closest('.adv-chip').classList.toggle('checked', c.checked));
        onChange();
    }));

    // Reset
    box.querySelector('#gdReset')?.addEventListener('click', () => {
        state.filters = {};
        renderFilters();
        applyAndRender();
    });
}

// ── Matching ──────────────────────────────────────────────────────────────────
function num(v) { const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; }

function normalized(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function matchesQuery(values) {
    const terms = normalized(state.filters.query).trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const haystack = normalized(values.filter(Boolean).join(' '));
    return terms.every(term => haystack.includes(term));
}

function matchesPeer(l) {
    const f = state.filters;
    if (l.itemType !== state.itemType) return false;
    if ((l.vehicleCategory || l.category) !== state.vehicleCategory) return false;

    if (!matchesQuery([
        l.title, l.brand, l.oemNumber, l.tireSize, l.tireSeason,
        l.partGroup, l.partType, l.equipmentGroup, l.equipmentType,
        l.description,
    ])) return false;

    const price = num(l.priceEur ?? l.price);
    if (f.priceFrom && price != null && price < parseFormattedNumber(f.priceFrom)) return false;
    if (f.priceTo && price != null && price > parseFormattedNumber(f.priceTo)) return false;

    if (f.conditions && f.conditions.length && !f.conditions.includes(l.condition)) return false;

    if (state.itemType === 'tire') {
        if (f.width && String(l.tireWidth) !== String(f.width)) return false;
        if (f.aspect && String(l.tireAspect) !== String(f.aspect)) return false;
        if (f.rim && String(l.tireRim) !== String(f.rim)) return false;
        if (f.seasons && f.seasons.length && !f.seasons.includes(l.tireSeason)) return false;
        if (f.brand && !(l.brand || '').toLowerCase().includes(String(f.brand).toLowerCase())) return false;
    } else if (state.itemType === 'oprema') {
        if (f.eqGroup && l.equipmentGroup !== f.eqGroup) return false;
        if (f.eqType && l.equipmentType !== f.eqType) return false;
        if (f.eqSize && String(l.equipmentSize) !== String(f.eqSize)) return false;
        if (f.brand && !(l.brand || '').toLowerCase().includes(String(f.brand).toLowerCase())) return false;
    } else {
        if (f.partGroup && l.partGroup !== f.partGroup) return false;
        if (f.partType && l.partType !== f.partType) return false;
        if (f.brand && !(l.brand || '').toLowerCase().includes(String(f.brand).toLowerCase())) return false;
        if (f.oem && !(l.oemNumber || '').toLowerCase().includes(String(f.oem).toLowerCase())) return false;
    }
    return true;
}

function matchesCatalog(p) {
    const f = state.filters;
    if (p.itemType !== state.itemType) return false;
    if (p.vehicleCategory !== state.vehicleCategory) return false;

    const a = p.attributes || {};
    if (!matchesQuery([
        p.title, p.brand, a.oemNumber, a.size, a.season,
        a.partGroup, a.partType, a.equipmentGroup, a.equipmentType,
    ])) return false;

    const price = getLowestPrice(p);
    if (f.priceFrom && price != null && price < parseFormattedNumber(f.priceFrom)) return false;
    if (f.priceTo && price != null && price > parseFormattedNumber(f.priceTo)) return false;

    if (state.itemType === 'tire') {
        if (f.width && String(a.width) !== String(f.width)) return false;
        if (f.aspect && String(a.aspect) !== String(f.aspect)) return false;
        if (f.rim && String(a.rim) !== String(f.rim)) return false;
        if (f.seasons && f.seasons.length && !f.seasons.includes(a.season)) return false;
        if (f.brand && !(p.brand || '').toLowerCase().includes(String(f.brand).toLowerCase())) return false;
    } else if (state.itemType === 'oprema') {
        if (f.eqGroup && a.equipmentGroup !== f.eqGroup) return false;
        if (f.eqType && a.equipmentType !== f.eqType) return false;
        if (f.eqSize && String(a.equipmentSize) !== String(f.eqSize)) return false;
        if (f.brand && !(p.brand || '').toLowerCase().includes(String(f.brand).toLowerCase())) return false;
    } else {
        if (f.partGroup && a.partGroup !== f.partGroup) return false;
        if (f.partType && a.partType !== f.partType) return false;
        if (f.brand && !(p.brand || '').toLowerCase().includes(String(f.brand).toLowerCase())) return false;
        if (f.oem && !(a.oemNumber || '').toLowerCase().includes(String(f.oem).toLowerCase())) return false;
    }
    return true;
}

// ── Render results ────────────────────────────────────────────────────────────
function sortedResults(items, source) {
    const rows = [...items];
    if (state.sort === 'recommended') return rows;

    const price = item => source === 'catalog'
        ? (getLowestPrice(item) ?? Number.POSITIVE_INFINITY)
        : (num(item.priceEur ?? item.price) ?? Number.POSITIVE_INFINITY);
    const date = item => new Date(item.createdAt || item.updatedAt || item.created_at || item.updated_at || 0).getTime();

    if (state.sort === 'price-asc') rows.sort((a, b) => price(a) - price(b));
    if (state.sort === 'price-desc') rows.sort((a, b) => price(b) - price(a));
    if (state.sort === 'newest') rows.sort((a, b) => date(b) - date(a));
    return rows;
}

function activeFiltersHtml() {
    const f = state.filters;
    const chips = [];
    const add = (key, label) => { if (label) chips.push({ key, label }); };
    add('query', f.query ? `“${f.query.trim()}”` : '');
    if (f.width || f.aspect || f.rim) add('dimension', `${f.width || '…'} / ${f.aspect || '…'} R${f.rim || '…'}`);
    if (f.seasons?.length) add('seasons', f.seasons.map(seasonLabel).join(', '));
    add('brand', f.brand);
    add('oem', f.oem ? `OEM ${f.oem}` : '');
    if (f.partGroup) add('partGroup', getPartGroups(state.vehicleCategory).find(g => g.value === f.partGroup)?.label);
    if (f.partType) add('partType', getPartTypes(state.vehicleCategory, f.partGroup).find(tp => tp.value === f.partType)?.label);
    if (f.eqGroup) add('eqGroup', getEquipmentGroups().find(g => g.value === f.eqGroup)?.label);
    if (f.eqType) add('eqType', getEquipmentTypeLabel(f.eqGroup, f.eqType));
    add('eqSize', f.eqSize);
    if (f.priceFrom || f.priceTo) add('price', `${f.priceFrom ? `od ${f.priceFrom} €` : ''}${f.priceFrom && f.priceTo ? ' · ' : ''}${f.priceTo ? `do ${f.priceTo} €` : ''}`);
    if (f.conditions?.length) add('conditions', f.conditions.join(', '));

    return chips.map(chip => `
        <button type="button" class="gd-filter-chip" data-clear-filter="${chip.key}">
            ${escHtml(chip.label)} <i data-lucide="x"></i>
        </button>`).join('');
}

function clearFilterGroup(key) {
    const f = state.filters;
    if (key === 'dimension') {
        f.width = ''; f.aspect = ''; f.rim = '';
    } else if (key === 'price') {
        f.priceFrom = ''; f.priceTo = '';
    } else if (key === 'partGroup') {
        f.partGroup = ''; f.partType = '';
    } else if (key === 'eqGroup') {
        f.eqGroup = ''; f.eqType = '';
    } else if (key === 'seasons' || key === 'conditions') {
        f[key] = [];
    } else {
        f[key] = '';
    }
}

function applyAndRender() {
    const grid = document.getElementById('gdResults');
    const countEl = document.getElementById('gdCount');
    if (!grid) return;

    const allPeers = peerListings.filter(matchesPeer);
    const allCats = catalogProducts.filter(matchesCatalog);
    const peers = state.source === 'catalog' ? [] : sortedResults(allPeers, 'peer');
    const cats = state.source === 'peer' ? [] : sortedResults(allCats, 'catalog');

    const total = peers.length + cats.length;
    const quickValues = {
        gdQuickWidth: state.filters.width,
        gdQuickAspect: state.filters.aspect,
        gdQuickRim: state.filters.rim,
        gdQuickGroup: state.itemType === 'oprema' ? state.filters.eqGroup : state.filters.partGroup,
    };
    Object.entries(quickValues).forEach(([id, value]) => {
        const control = document.getElementById(id);
        if (control && control.value !== String(value || '')) control.value = value || '';
    });

    if (countEl) countEl.textContent = `${total} ${t('gd_results', 'zadetkov')}`;
    const setCount = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setCount('gdSourceAllCount', allPeers.length + allCats.length);
    setCount('gdSourcePeerCount', allPeers.length);
    setCount('gdSourceCatalogCount', allCats.length);
    setCount('gdMobileCount', total);

    const active = document.getElementById('gdActiveFilters');
    if (active) {
        active.innerHTML = activeFiltersHtml();
        if (window.lucide) window.lucide.createIcons({ scope: active });
    }

    if (total === 0) {
        grid.innerHTML = `<div class="gd-empty">
            <span class="gd-empty-icon"><i data-lucide="search-x"></i></span>
            <h3>${t('gd_no_results', 'Ni zadetkov')}</h3>
            <p>Poskusite s krajšim izrazom ali odstranite katerega od filtrov.</p>
            <button type="button" class="pill-btn secondary" id="gdEmptyReset">Počisti filtre</button>
        </div>`;
        document.getElementById('gdEmptyReset')?.addEventListener('click', () => {
            state.filters = {};
            const root = document.getElementById('gd-root');
            renderShell(root); bindChrome(); renderFilters(); applyAndRender();
        });
        if (window.lucide) window.lucide.createIcons({ scope: grid });
        return;
    }

    if (state.source === 'all' && peers.length && cats.length) {
        grid.innerHTML = `
            <section class="gd-result-section">
                <div class="gd-section-heading"><div><span class="gd-section-kicker">Iz skupnosti</span><h2>Oglasi</h2></div><span>${peers.length}</span></div>
                <div class="gd-result-section-grid">${peers.map(peerCard).join('')}</div>
            </section>
            <section class="gd-result-section">
                <div class="gd-section-heading"><div><span class="gd-section-kicker">Primerjava cen</span><h2>Ponudbe trgovin</h2></div><span>${cats.length}</span></div>
                <div class="gd-result-section-grid">${cats.map(catalogCard).join('')}</div>
            </section>`;
    } else {
        grid.innerHTML = peers.map(peerCard).join('') + cats.map(catalogCard).join('');
    }
    if (window.lucide) window.lucide.createIcons({ scope: grid });
}

function peerCard(l) {
    const img = l.images?.exterior?.[0] || '';
    const price = num(l.priceEur ?? l.price);
    const subtitle = l.itemType === 'tire'
        ? [l.tireSize, seasonLabel(l.tireSeason)].filter(Boolean).join(' · ')
        : l.itemType === 'oprema'
            ? [l.brand, getEquipmentTypeLabel(l.equipmentGroup, l.equipmentType), l.equipmentSize].filter(Boolean).join(' · ')
            : [l.brand, l.oemNumber].filter(Boolean).join(' · ');
    return `
        <a href="#/oglas?id=${encodeURIComponent(l.id)}" class="gd-card gd-card--peer">
            <div class="gd-card-img">
                ${img ? `<img src="${escAttr(img)}" alt="${escAttr(l.title || '')}" loading="lazy" />`
            : `<i data-lucide="${l.itemType === 'tire' ? 'disc-3' : l.itemType === 'oprema' ? 'shield' : 'wrench'}"></i>`}
                <span class="gd-badge gd-badge--peer">${l.condition || t('gd_source_peer', 'Oglas')}</span>
            </div>
            <div class="gd-card-body">
                <div class="gd-card-title">${escHtml(l.title || '')}</div>
                <div class="gd-card-sub">${escHtml(subtitle)}</div>
                <div class="gd-card-foot">
                    <span class="gd-card-price">${price != null ? fmtEur(price) : t('cl_label_call_for_price', 'Po dogovoru')}</span>
                    ${l.location?.region ? `<span class="gd-card-loc"><i data-lucide="map-pin"></i> ${escHtml(l.location.region)}</span>` : ''}
                </div>
            </div>
        </a>`;
}

function catalogCard(p) {
    const low = getLowestPrice(p);
    const a = p.attributes || {};
    const subtitle = p.itemType === 'tire'
        ? [a.size, seasonLabel(a.season)].filter(Boolean).join(' · ')
        : p.itemType === 'oprema'
            ? [p.brand, getEquipmentTypeLabel(a.equipmentGroup, a.equipmentType), a.equipmentSize].filter(Boolean).join(' · ')
            : [p.brand, a.oemNumber].filter(Boolean).join(' · ');
    return `
        <a href="#/katalog?id=${encodeURIComponent(p.id)}" class="gd-card gd-card--catalog">
            <div class="gd-card-img">
                ${p.imageUrl ? `<img src="${escAttr(p.imageUrl)}" alt="${escAttr(p.title || '')}" loading="lazy" />`
            : `<i data-lucide="${p.itemType === 'tire' ? 'disc-3' : p.itemType === 'oprema' ? 'shield' : 'wrench'}"></i>`}
                <span class="gd-badge gd-badge--catalog"><i data-lucide="store"></i> ${t('gd_source_catalog', 'Trgovine')}</span>
            </div>
            <div class="gd-card-body">
                <div class="gd-card-title">${escHtml(p.title || '')}</div>
                <div class="gd-card-sub">${escHtml(subtitle)}</div>
                <div class="gd-card-foot">
                    <span class="gd-card-price">${low != null ? t('gd_from_price', 'od {price}€').replace('{price}', fmtNum(low)) : ''}</span>
                    <span class="gd-card-shops">${t('gd_shops_count', '{count} trgovin').replace('{count}', p.offerCount || (p.offers || []).length)}</span>
                </div>
            </div>
        </a>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function seasonLabel(s) {
    return { letne: t('gd_season_summer', 'Letne'), zimske: t('gd_season_winter', 'Zimske'), celoletne: t('gd_season_allseason', 'Celoletne') }[s] || s || '';
}
function fmtNum(n) { return new Intl.NumberFormat('sl-SI').format(Math.round(n)); }
function fmtEur(n) { return fmtNum(n) + ' €'; }
const escAttr = escHtml;
