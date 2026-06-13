// ═══════════════════════════════════════════════════════════════════════════════
// Gume in deli — parts & tires search — MojAvto.si
// Two data sources merged into one result grid:
//   1. Peer listings (rabljeni/novi deli & gume) posted by users — Firestore listings
//   2. Catalog products (price comparison "od X€") — partsCatalog / mock catalog
// A source toggle lets the user show Vse / Rabljeni oglasi / Cenik trgovin.
// ═══════════════════════════════════════════════════════════════════════════════

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

    state = { itemType: 'tire', vehicleCategory: 'avto', source: 'all', filters: {} };
    renderShell(root);
    initCustomSelects();
    bindChrome();

    fetch('json/tire_brands.json').then(r => r.json()).then(d => { tireBrands = d || []; renderFilters(); }).catch(() => { });
    fetch('json/equipment_brands.json').then(r => r.json()).then(d => { equipmentBrands = d || []; renderFilters(); }).catch(() => { });

    await loadData();
    renderFilters();
    applyAndRender();
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
                            <select id="navBrand" class="pill-input">
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
    fetch('json/brands_models_plovila.json').then(r => r.json()).then(d => {
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
        fetch('json/equipment_brands.json').then(r => r.json()).then(d => { equipmentBrands = d || []; renderFilters(); }).catch(() => {});
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
function renderShell(root) {
    const itemBtn = (type, icon, label) => `
        <button type="button" class="gd-itemtype-btn ${state.itemType === type ? 'active' : ''}" data-item="${type}">
            <i data-lucide="${icon}"></i> <span>${label}</span>
        </button>`;

    const vehCard = (vc) => `
        <button type="button" class="tab-btn ${state.vehicleCategory === vc.value ? 'active' : ''}" data-vehcat="${vc.value}" title="${vc.label}">
            <i data-lucide="${vc.icon}"></i>
            <span class="hidden-md">${vc.label}</span>
        </button>`;

    const heroHtml = isNavtika()
        ? `<div class="gd-hero-container">
            <h1 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:0.5rem;">Oprema za plovila</h1>
            <p style="text-align:center;color:var(--text-secondary);margin-bottom:1.5rem;">Motorji, navigacija, varnostna oprema in dodatki za plovila.</p>
           </div>`
        : `<div class="gd-hero-container">
            <div class="glass-card rounded-pill tabs-glass" id="gdVehCat" style="width:fit-content; margin-inline:auto; margin-bottom:1.5rem;">
                ${VEHICLE_CATEGORIES.map(vehCard).join('')}
            </div>
            <div class="gd-itemtype-toggle" id="gdItemType">
                ${itemBtn('tire', 'disc-3', t('gd_item_tires', 'Gume'))}
                ${itemBtn('part', 'wrench', t('gd_item_parts', 'Deli'))}
                ${state.vehicleCategory === 'moto' ? itemBtn('oprema', 'shield', t('cl_sub_oprema', 'Moto oprema')) : ''}
            </div>
           </div>`;

    root.innerHTML = `
        ${heroHtml}

        <div class="oglasi-layout">
            <aside class="oglasi-sidebar">
                <button type="button" id="gdMobileFilterToggle" class="mobile-filter-toggle">
                    <span><i data-lucide="sliders-horizontal"></i> ${t('sidebar_filters_title', 'Filtri')}</span>
                    <i data-lucide="chevron-down" class="mft-chevron"></i>
                </button>
                <div class="oglasi-sidebar-card glass-card" id="gdFilters"></div>
            </aside>

            <main class="gd-main">
                <div class="gd-results-header">
                    <div class="gd-source-toggle" id="gdSource">
                        <button type="button" class="gd-source-btn active" data-source="all">${t('gd_source_all', 'Vse')}</button>
                        <button type="button" class="gd-source-btn" data-source="peer">${t('gd_source_peer', 'Rabljeni oglasi')}</button>
                        <button type="button" class="gd-source-btn" data-source="catalog">${t('gd_source_catalog', 'Cenik trgovin')}</button>
                    </div>
                    <span class="gd-count" id="gdCount"></span>
                </div>
                <div class="gd-results-grid" id="gdResults"></div>
            </main>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
}

function bindChrome() {
    // Item type toggle
    document.getElementById('gdItemType')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.gd-itemtype-btn');
        if (!btn) return;
        const type = btn.dataset.item;
        state.itemType = type;
        state.filters = {};

        document.querySelectorAll('#gdItemType .gd-itemtype-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderFilters();
        applyAndRender();
    });

    // Vehicle category tabs
    document.getElementById('gdVehCat')?.addEventListener('click', (e) => {
        const card = e.target.closest('.tab-btn');
        if (!card) return;
        state.vehicleCategory = card.dataset.vehcat;
        
        // Oprema is moto-only — drop back to tire when leaving the moto category
        if (state.itemType === 'oprema' && state.vehicleCategory !== 'moto') {
            state.itemType = 'tire';
        }
        
        // Part group/type are vehicle-specific — reset them
        state.filters = {};
        
        // Re-render shell to show/hide Moto Oprema button
        const root = document.getElementById('gd-root');
        renderShell(root);
        bindChrome();
        
        renderFilters();
        applyAndRender();
    });

    // Source toggle
    document.getElementById('gdSource')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.gd-source-btn');
        if (!btn) return;
        state.source = btn.dataset.source;
        document.querySelectorAll('#gdSource .gd-source-btn').forEach(b => b.classList.toggle('active', b === btn));
        applyAndRender();
    });

    // Mobile filter toggle
    document.getElementById('gdMobileFilterToggle')?.addEventListener('click', () => {
        document.getElementById('gdFilters')?.classList.toggle('open');
        document.getElementById('gdMobileFilterToggle')?.classList.toggle('open');
    });
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
            <select class="glass-select" id="fBrand">
                <option value="">${t('all_brands', 'Vse znamke')}</option>
                ${tireBrands.map(b => `<option value="${b}" ${f.brand === b ? 'selected' : ''}>${b}</option>`).join('')}
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
            <label class="gd-flabel">${t('gd_part_brand', 'Znamka / proizvajalec')}</label>
            <input type="text" class="pill-input" id="fBrandText" value="${escAttr(f.brand || '')}" placeholder="npr. Bosch" />
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
            <label class="gd-flabel">${t('gd_part_brand', 'Znamka / proizvajalec')}</label>
            <select class="glass-select" id="fEqBrand">
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
        renderFilters();
        applyAndRender();
    });
    box.querySelector('#fType')?.addEventListener('change', e => { f.partType = e.target.value; onChange(); });
    box.querySelector('#fBrandText')?.addEventListener('input', e => { f.brand = e.target.value; onChange(); });
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

function matchesPeer(l) {
    const f = state.filters;
    if (l.itemType !== state.itemType) return false;
    if ((l.vehicleCategory || l.category) !== state.vehicleCategory) return false;

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
function applyAndRender() {
    const grid = document.getElementById('gdResults');
    const countEl = document.getElementById('gdCount');
    if (!grid) return;

    const peers = (state.source === 'catalog') ? [] : peerListings.filter(matchesPeer);
    const cats = (state.source === 'peer') ? [] : catalogProducts.filter(matchesCatalog);

    const total = peers.length + cats.length;
    if (countEl) countEl.textContent = `${total} ${t('gd_results', 'zadetkov')}`;

    if (total === 0) {
        grid.innerHTML = `<div class="gd-empty"><i data-lucide="search-x"></i><p>${t('gd_no_results', 'Ni zadetkov.')}</p></div>`;
        if (window.lucide) window.lucide.createIcons({ scope: grid });
        return;
    }

    // Peer listings first (fresh user content), then catalog products.
    grid.innerHTML = peers.map(peerCard).join('') + cats.map(catalogCard).join('');
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
function escHtml(str) { return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function escAttr(str) { return escHtml(str); }
