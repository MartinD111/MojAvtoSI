// ═══════════════════════════════════════════════════════════════════════════════
// Advanced Search — MojaNavtika (vessels & outboard engines)
// Self-contained controller for the boat search view (advanced-search.navtika.html).
// Kept separate from the car search so neither platform's logic interferes.
// ═══════════════════════════════════════════════════════════════════════════════
import { escHtml as escapeHtml } from '../utils/escHtml.js';
import { getListings } from '../services/listingService.js';
import { navigateTo } from '../router.js';
import { MAIN_CATEGORIES } from '../data/categories.js';
import { brandsFileFor } from '../data/brandFiles.js';
import { t } from '../core/i18n.js';
import { initCustomSelects, createCustomSelect } from '../utils/customSelect.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { getModelVariants } from '../utils/bodyType.js';
import { getApprovedProposalsForBrand } from '../services/adminService.js';
import { renderEquipmentChipsHtml } from '../data/equipment.js';

const ENGINE_CAT = 'izvenkrmni-motorji';

let vehicles = [];
let excludedVehicles = [];
const MAX_VEHICLES = 3;

// Per-category form state — saved when switching tabs, restored on return.
const _catState = {};

export function initAdvancedSearchPage() {
    initNavtikaSearchPage();
}

// Search target: 'oglasi' (normal listings) | 'drazbe' (auctions).
let searchMode = 'oglasi';

function renderSearchModePills() {
    const el = document.getElementById('searchTypePills');
    if (!el) return;
    el.style.display = 'flex';
    el.innerHTML = `
        <button type="button" class="search-type-pill ${searchMode === 'oglasi' ? 'active' : ''}" data-search-mode="oglasi">
            ⛵ ${t('search_mode_listings', 'Išči oglase')}
        </button>
        <button type="button" class="search-type-pill ${searchMode === 'drazbe' ? 'active' : ''}" data-search-mode="drazbe">
            🔨 ${t('search_mode_auctions', 'Išči dražbe')}
        </button>`;
    el.querySelectorAll('.search-type-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            searchMode = pill.dataset.searchMode;
            el.querySelectorAll('.search-type-pill').forEach(p => p.classList.toggle('active', p === pill));
        });
    });
}

export function initNavtikaSearchPage() {
    console.log('[NavtikaSearch] init');
    initCustomSelects();

    vehicles = [];
    excludedVehicles = [];

    const params = parseHashParams();
    searchMode = params.get('mode') === 'drazbe' ? 'drazbe' : 'oglasi';
    renderSearchModePills();
    const ctx = {
        cat: params.get('cat') || Object.values(MAIN_CATEGORIES)[0].slug,
        sub: params.get('sub') || '',
        najem: params.get('najem') || '',
        prodaja: params.get('prodaja') || '',
        vtype: params.get('vtype') || '',
    };

    // Initialize hidden inputs
    const hiddenNajem = document.getElementById('hiddenNajem');
    if (hiddenNajem) hiddenNajem.value = ctx.najem;
    const hiddenProdaja = document.getElementById('hiddenProdaja');
    if (hiddenProdaja) hiddenProdaja.value = ctx.prodaja;

    setupRentalToggle(ctx);
    renderCategoryTabs(ctx);
    populateEquipmentChips();
    applyCategory(ctx);
    bindAccordions();
    setupMultiVehicleSelector();
    bindForm(ctx);

    document.querySelectorAll('.js-format-number').forEach(i => setupNumericFormatter(i));
    if (window.lucide) window.lucide.createIcons();

    // Prefill numeric filters carried from the homepage simple search and, if any
    // were provided, run the search immediately so results show on arrival.
    prefillFromParams(params);
}

// Carry length/power (and any range) filters from the home simple search.
function prefillFromParams(params) {
    const map = { lengthFrom: 'lengthFrom', lengthTo: 'lengthTo', powerFrom: 'powerFrom', powerTo: 'powerTo', engineMake: 'engineMake' };
    let any = false;
    for (const [param, field] of Object.entries(map)) {
        const val = params.get(param);
        if (val) {
            const input = document.querySelector(`#advancedSearchForm [name="${field}"]`);
            if (input) { input.value = val; any = true; }
        }
    }
    if (any) {
        document.getElementById('advancedSearchForm')
            ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
}

function parseHashParams() {
    return new URLSearchParams(window.location.search);
}

// ── Equipment chips — generated from equipment.js so the navtika search filter and
// the create-listing form stay in lockstep. All vessel categories share the same
// equipment groups, so we render once. The 'all' groups (garancija/drugo) carry
// car-oriented values, so they're skipped here. Field name 'extraEquipment' matches
// the filter (readFilters → f.extraEquipment).
function populateEquipmentChips() {
    const el = document.getElementById('boat-equipment-chips');
    if (!el || el.dataset.filled) return;
    el.innerHTML = renderEquipmentChipsHtml('colni', t, {
        name: 'extraEquipment',
        skipGroups: ['garancija', 'drugo'],
    });
    el.dataset.filled = '1';
    if (window.lucide) window.lucide.createIcons();
}

// ── Inline Prodaja / Najem toggle ───────────────────────────────────────────────
function setupRentalToggle(ctx) {
    const prodajaToggle = document.getElementById('searchProdajaToggle');
    const najemToggle = document.getElementById('searchNajemToggle');
    const hiddenNajem = document.getElementById('hiddenNajem');
    const hiddenProdaja = document.getElementById('hiddenProdaja');

    if (prodajaToggle && najemToggle) {
        if (ctx.prodaja !== '' || ctx.najem !== '') {
            prodajaToggle.checked = ctx.prodaja === '1';
            najemToggle.checked = ctx.najem === '1';
        } else {
            ctx.prodaja = prodajaToggle.checked ? '1' : '';
            ctx.najem = najemToggle.checked ? '1' : '';
        }
        if (hiddenNajem) hiddenNajem.value = ctx.najem;
        if (hiddenProdaja) hiddenProdaja.value = ctx.prodaja;

        const update = () => {
            ctx.prodaja = prodajaToggle.checked ? '1' : '';
            ctx.najem = najemToggle.checked ? '1' : '';
            if (hiddenNajem) hiddenNajem.value = ctx.najem;
            if (hiddenProdaja) hiddenProdaja.value = ctx.prodaja;
        };
        prodajaToggle.addEventListener('change', update);
        najemToggle.addEventListener('change', update);
    }
}

// Capture all form field values (excluding category/hidden fields) for state memory.
function snapshotForm() {
    const form = document.getElementById('advancedSearchForm');
    if (!form) return {};
    const snap = {};
    form.querySelectorAll('input:not([type=hidden]), select').forEach(el => {
        if (!el.name || el.name === 'cat') return;
        if (el.type === 'checkbox') snap[el.name] = el.checked;
        else snap[el.name] = el.value;
    });
    snap._vehicles = [...vehicles];
    snap._excludedVehicles = [...excludedVehicles];
    return snap;
}

// Restore a previously snapshotted form state.
function restoreForm(snap) {
    const form = document.getElementById('advancedSearchForm');
    if (!form || !snap) return;
    form.querySelectorAll('input:not([type=hidden]), select').forEach(el => {
        if (!el.name || el.name === 'cat' || !(el.name in snap)) return;
        if (el.type === 'checkbox') el.checked = snap[el.name];
        else el.value = snap[el.name];
    });
    if (snap._vehicles) { vehicles = snap._vehicles; }
    if (snap._excludedVehicles) { excludedVehicles = snap._excludedVehicles; }
}

// ── Category tabs (built from the platform taxonomy) ─────────────────────────────
function renderCategoryTabs(ctx) {
    const tabs = document.getElementById('boatCategoryTabs');
    if (!tabs) return;
    // When entering via "Oprema za plovila" pill, hide the boat-category nav entirely.
    const wrapper = tabs.closest('.home-tabs-container') || tabs.parentElement;
    if (ctx.cat === 'oprema') { if (wrapper) wrapper.style.display = 'none'; tabs.style.display = 'none'; return; }
    if (wrapper) wrapper.style.display = '';
    tabs.style.display = '';
    // 'oprema' must not appear as a tab alongside boat categories.
    const SEARCH_CATS = Object.values(MAIN_CATEGORIES).filter(c => c.slug !== 'oprema');
    tabs.innerHTML = SEARCH_CATS.map(cat => `
        <button type="button" class="tab-btn ${cat.slug === ctx.cat ? 'active' : ''}" data-cat="${cat.slug}" title="${t(cat.label)}" style="flex:1; justify-content:center;">
            <i data-lucide="${cat.icon}"></i>
            <span class="hidden-md">${t(cat.label)}</span>
        </button>`).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.cat === ctx.cat) return;
            // Save current form state for the outgoing category
            _catState[ctx.cat] = snapshotForm();
            tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ctx.cat = btn.dataset.cat;
            ctx.sub = '';
            ctx.vtype = '';
            applyCategory(ctx);
            // Restore saved state for the incoming category (after applyCategory populates the form)
            if (_catState[ctx.cat]) restoreForm(_catState[ctx.cat]);
        });
    });
}

// Collect vessel/engine types for the active main category (across subcategories).
function typesForCategory(catSlug) {
    const cat = Object.values(MAIN_CATEGORIES).find(c => c.slug === catSlug);
    if (!cat) return [];
    if (Array.isArray(cat.vehicleTypes)) return cat.vehicleTypes;          // flat (jet-ski)
    if (cat.subcategories) {
        return Object.values(cat.subcategories).flatMap(s => s.vehicleTypes || []);
    }
    return [];
}

function applyCategory(ctx) {
    document.getElementById('hiddenCat').value = ctx.cat;
    document.getElementById('hiddenNajem').value = ctx.najem || '';

    const isOprema = ctx.cat === 'oprema';
    const isEngine = ctx.cat === ENGINE_CAT;

    // Equipment page: hide boat/engine-specific field groups + rental toggle.
    document.querySelectorAll('.boat-only-field').forEach(el => {
        el.style.display = (isEngine || isOprema) ? 'none' : '';
    });
    document.querySelectorAll('.engine-only-field').forEach(el => {
        el.style.display = isEngine ? '' : 'none';
    });
    // Hide rental toggle on equipment (equipment is sale-only for now)
    const rentalToggle = document.getElementById('rentalModeToggle');
    if (rentalToggle) rentalToggle.style.display = isOprema ? 'none' : '';

    // Accordion title + icon
    const titleEl = document.getElementById('searchAccordionTitle');
    const iconEl = document.getElementById('searchAccordionIcon');
    if (titleEl) {
        if (isOprema) { titleEl.innerHTML = '<i data-lucide="package"></i> Oprema za plovila'; }
        else if (isEngine) { titleEl.innerHTML = '<i data-lucide="cog"></i> Izvenkrmni motorji'; }
        else { titleEl.innerHTML = '<i data-lucide="sailboat"></i> Osnovi podatki'; }
    }
    // Grid type label
    const label = document.getElementById('bodyTypeLabel');
    if (label) {
        if (ctx.cat === 'colni') label.textContent = 'Vrsta čolnov';
        else if (ctx.cat === 'jadrnice') label.textContent = 'Vrsta jadrnic';
        else if (ctx.cat === 'gumenjaki') label.textContent = 'Vrsta gumenjakov';
        else if (ctx.cat === 'jet-ski') label.textContent = 'Vrsta vodnih skuterjev';
        else if (isOprema) label.textContent = 'Vrsta opreme';
        else if (isEngine) label.textContent = 'Razred motorja';
        else label.textContent = 'Vrsta plovila';
    }

    // Render type grid
    const grid = document.getElementById('boatTypeGrid');
    if (grid) {
        const types = typesForCategory(ctx.cat);
        const icon = isOprema ? 'package' : (isEngine ? 'cog' : 'sailboat');
        grid.innerHTML = types.map(vt => {
            let iconHtml = `<i data-lucide="${icon}"></i>`;
            if (vt.icon) {
                if (vt.icon.startsWith('custom-svg:')) {
                    iconHtml = `<svg class="custom-v-icon"><use href="icons/vehicles-custom.svg${vt.icon.slice(11)}"></use></svg>`;
                } else if (vt.icon.startsWith('svg:')) {
                    iconHtml = `<svg class="custom-v-icon"><use href="icons/vehicles.svg${vt.icon.slice(4)}"></use></svg>`;
                }
            }
            return `
            <button type="button" class="body-type-card" data-value="${vt.value}">
                ${iconHtml}
                <span>${t(vt.label)}</span>
            </button>`;
        }).join('');
        const hidden = document.getElementById('bodyTypeHidden');
        if (hidden) hidden.value = '';
        grid.querySelectorAll('.body-type-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('active');
                const active = [...grid.querySelectorAll('.body-type-card.active')].map(c => c.dataset.value);
                if (hidden) hidden.value = active.join(',');
            });
        });
    }

    loadBrands(ctx.cat);
    loadEngineMakeDropdown();
    if (window.lucide) window.lucide.createIcons();
}

function loadEngineMakeDropdown() {
    const sel = document.getElementById('advEngineMake');
    if (!sel || sel.options.length > 1) return;
    fetch('/json/brands_models_izvenkrmni.json')
        .then(r => r.ok ? r.json() : {})
        .then(data => {
            Object.keys(data).sort((a, b) => a.localeCompare(b, 'sl')).forEach(brand => {
                const o = document.createElement('option');
                o.value = brand; o.textContent = brand;
                sel.appendChild(o);
            });
        })
        .catch(() => {});
}

// ── Brand/model options ─────────────────────────────────────────────────────────
function loadBrands(catSlug) {
    const makeSel = document.getElementById('make');
    const modelSel = document.getElementById('model');
    const variantSel = document.getElementById('variant');
    if (!makeSel) return;
    fetch(brandsFileFor(catSlug))
        .then(r => r.ok ? r.json() : {})
        .then(async data => {
            window._boatBrandData = data;
            makeSel.innerHTML = '<option value="">Znamka</option>';
            Object.keys(data).sort().forEach(b => {
                const o = document.createElement('option'); o.value = b; o.textContent = b; makeSel.appendChild(o);
            });

            // Inject approved custom makes (proposals of type 'make' for this platform)
            try {
                const { supabase } = await import('../lib/supabase.js');
                const { data: proposals } = await supabase
                    .from('taxonomy_proposals')
                    .select('payload')
                    .eq('status', 'approved')
                    .contains('payload', { type: 'make' });
                (proposals || []).forEach(row => {
                    const brand = row.payload?.value;
                    if (brand && !data[brand]) {
                        const o = document.createElement('option');
                        o.value = brand; o.textContent = `${brand} ✦`;
                        o.dataset.customBrand = '1';
                        makeSel.appendChild(o);
                    }
                });
            } catch { /* non-fatal */ }

            if (modelSel) { modelSel.innerHTML = '<option value="">Model</option>'; modelSel.disabled = true; }
            if (variantSel) { variantSel.innerHTML = '<option value="">Različica</option>'; variantSel.disabled = true; }
            createCustomSelect(makeSel);
            if (modelSel) createCustomSelect(modelSel);
            if (variantSel) createCustomSelect(variantSel);
        })
        .catch(() => {});

    makeSel.addEventListener('change', async () => {
        const data = window._boatBrandData || {};
        const brand = makeSel.value;
        const models = data[brand] ? Object.keys(data[brand]) : [];
        if (modelSel) {
            modelSel.innerHTML = '<option value="">Model</option>';
            models.sort().forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; modelSel.appendChild(o); });

            // Inject approved custom models for this brand
            if (brand) {
                try {
                    const proposals = await getApprovedProposalsForBrand(brand);
                    proposals.filter(p => p.type === 'model').forEach(p => {
                        if (!models.includes(p.value)) {
                            const o = document.createElement('option');
                            o.value = p.value; o.textContent = `${p.value} ✦`;
                            modelSel.appendChild(o);
                        }
                    });
                } catch { /* non-fatal */ }
            }

            modelSel.disabled = modelSel.options.length <= 1;
            createCustomSelect(modelSel);
        }
        if (variantSel) {
            variantSel.innerHTML = '<option value="">Različica</option>';
            variantSel.disabled = true;
            createCustomSelect(variantSel);
        }
    });

    if (modelSel && variantSel) {
        modelSel.addEventListener('change', () => {
            const data = window._boatBrandData || {};
            const make = makeSel.value;
            const model = modelSel.value;
            variantSel.innerHTML = '<option value="">Različica</option>';
            variantSel.closest('.form-group')?.classList.remove('adv-hidden');

            const rawVariants = (make && model && data[make]?.[model]) ? getModelVariants(data[make][model]) : [];
            const variants = rawVariants.map(v => typeof v === 'object' ? v.trim : v).filter(Boolean).sort();

            if (variants.length === 1) {
                // Only one variant — auto-select it and hide the dropdown
                variantSel.innerHTML = `<option value="${variants[0]}">${variants[0]}</option>`;
                variantSel.value = variants[0];
                variantSel.disabled = false;
                variantSel.closest('.form-group')?.classList.add('adv-hidden');
                createCustomSelect(variantSel);
                variantSel.dispatchEvent(new Event('change'));
            } else {
                variants.forEach(v => {
                    const o = document.createElement('option');
                    o.value = v;
                    o.textContent = v;
                    variantSel.appendChild(o);
                });
                variantSel.disabled = variants.length === 0;
                createCustomSelect(variantSel);
            }
        });
    }
}

// ── Accordions (reuse the existing styling) ──────────────────────────────────────
function bindAccordions() {
    document.querySelectorAll('.adv-acc-trigger').forEach(trig => {
        trig.addEventListener('click', () => {
            const body = trig.closest('.adv-accordion')?.querySelector('.adv-acc-body');
            const open = trig.getAttribute('aria-expanded') === 'true';
            trig.setAttribute('aria-expanded', String(!open));
            if (body) body.style.display = open ? 'none' : 'flex';
        });
    });

    // Handle "Zapomni si" toggles
    document.querySelectorAll('.remember-check').forEach(chk => {
        if (chk.id === 'rentalToggleInput' || chk.id === 'searchProdajaToggle' || chk.id === 'searchNajemToggle') return; // skip rental/sale toggle
        const cat = chk.getAttribute('data-category');
        if (localStorage.getItem(`remember_${cat}`) === 'true') chk.checked = true;
        chk.addEventListener('change', () => localStorage.setItem(`remember_${cat}`, chk.checked));
    });
}

// ── Search ───────────────────────────────────────────────────────────────────────
function bindForm(ctx) {
    const form = document.getElementById('advancedSearchForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        
        const fd = new FormData(form);
        const params = new URLSearchParams();
        
        // Always include category if active
        if (ctx.cat) params.set('cat', ctx.cat);
        if (ctx.sub) params.set('sub', ctx.sub);
        
        if (vehicles.length > 0) {
            params.set('vehicles', JSON.stringify(vehicles));
        } else {
            const make = fd.get('make');
            const model = fd.get('model');
            const variant = fd.get('variant');
            if (make) params.set('make', make);
            if (model) params.set('model', model);
            if (variant) params.set('variant', variant);
        }
        if (excludedVehicles.length > 0) {
            params.set('excludedVehicles', JSON.stringify(excludedVehicles));
        }

        // Include other common fields if they have a value
        const fieldsToMap = ['powerFrom', 'powerTo', 'engineHoursTo', 'berthsFrom', 'cabinsFrom', 'yearFrom', 'yearTo', 'priceTo', 'bodyType', 'najem', 'prodaja', 'engineMake', 'engineType'];
        for (const field of fieldsToMap) {
            const val = fd.get(field);
            if (val) params.set(field, val);
        }

        const hull = fd.get('hull');
        if (hull) params.set('hull', hull);

        // Include array-based fields
        const extraEqs = fd.getAll('extraEquipment').filter(Boolean);
        if (extraEqs.length > 0) params.set('extraEquipment', extraEqs.join(','));

        // Include array-based fields
        const fuels = fd.getAll('fuel').filter(Boolean);
        if (fuels.length > 0) params.set('fuel', fuels.join(','));

        const engineMounts = fd.getAll('engineMount').filter(Boolean);
        if (engineMounts.length > 0) params.set('engineMount', engineMounts.join(','));

        const strokes = fd.getAll('stroke').filter(Boolean);
        if (strokes.length > 0) params.set('stroke', strokes.join(','));

        const shafts = fd.getAll('shaft').filter(Boolean);
        if (shafts.length > 0) params.set('shaft', shafts.join(','));

        const ces = fd.getAll('ce').filter(Boolean);
        if (ces.length > 0) params.set('ce', ces.join(','));

        const paramStr = params.toString();
        const target = searchMode === 'drazbe' ? '/drazbe' : '/oglasi';
        navigateTo(`${target}${paramStr ? '?' + paramStr : ''}`);
    });
}

function multi(form, name) {
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
}

function readFilters(ctx) {
    const form = document.getElementById('advancedSearchForm');
    const num = n => { const v = form.querySelector(`[name="${n}"]`)?.value; return v ? parseFormattedNumber(v) || Number(v) || null : null; };
    const bodyTypes = (document.getElementById('bodyTypeHidden')?.value || '').split(',').filter(Boolean);
    return {
        cat: ctx.cat,
        najem: document.getElementById('hiddenNajem')?.value || '',
        prodaja: document.getElementById('hiddenProdaja')?.value || '',
        vehicles,
        excludedVehicles,
        make: form.querySelector('[name="make"]')?.value || '',
        model: form.querySelector('[name="model"]')?.value || '',
        variant: form.querySelector('[name="variant"]')?.value || '',
        bodyTypes,
        priceFrom: num('priceFrom'), priceTo: num('priceTo'),
        yearFrom: num('yearFrom'), yearTo: num('yearTo'),
        lengthFrom: num('lengthFrom'), lengthTo: num('lengthTo'),
        powerFrom: num('powerFrom'), powerTo: num('powerTo'),
        engineHoursTo: num('engineHoursTo'),
        berthsFrom: num('berthsFrom'), cabinsFrom: num('cabinsFrom'),
        fuel: multi(form, 'fuel'),
        engineMount: multi(form, 'engineMount'),
        hull: multi(form, 'hull'),
        ce: multi(form, 'ce'),
        stroke: multi(form, 'stroke'),
        shaft: multi(form, 'shaft'),
        extraEquipment: multi(form, 'extraEquipment'),
        engineMake: form.querySelector('[name="engineMake"]')?.value || '',
    };
}

function powerHp(l) {
    return l.powerHp || l.enginePowerHp || (l.enginePowerKw ? Math.round(l.enginePowerKw * 1.341) : (l.powerKw ? Math.round(l.powerKw * 1.341) : null));
}

function matchesBoat(l, f) {
    // Only vessels/engines
    if (!['plovilo', 'motor'].includes(l.itemType)) return false;
    if (f.cat && l.category !== f.cat) return false;

    // Sale / rental
    const fNajem = f.najem === '1';
    const fProdaja = f.prodaja === '1';
    if (fNajem || fProdaja) {
        if (fNajem && !fProdaja && !l.isRental) return false;
        if (fProdaja && !fNajem && l.isRental) return false;
    } else {
        return false;
    }

    if (f.bodyTypes.length && !f.bodyTypes.includes(l.bodyType)) return false;

    // Excluded vehicles (AND: listing must not match any excluded entry)
    if (f.excludedVehicles && f.excludedVehicles.length > 0) {
        const isExcluded = f.excludedVehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant) {
                const varLower = v.variant.toLowerCase();
                const lVar = (l.variant || '').toLowerCase();
                const lTitle = (l.title || '').toLowerCase();
                const lSub = (l.subtitle || '').toLowerCase();
                if (!lVar.includes(varLower) && !lTitle.includes(varLower) && !lSub.includes(varLower)) return false;
            }
            return true;
        });
        if (isExcluded) return false;
    }

    // Vehicle multi-match (OR between entries)
    if (f.vehicles && f.vehicles.length > 0) {
        const match = f.vehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant) {
                const varLower = v.variant.toLowerCase();
                const lVar = (l.variant || '').toLowerCase();
                const lTitle = (l.title || '').toLowerCase();
                const lSub = (l.subtitle || '').toLowerCase();
                if (!lVar.includes(varLower) && !lTitle.includes(varLower) && !lSub.includes(varLower)) return false;
            }
            return true;
        });
        if (!match) return false;
    } else {
        // Single vehicle matching
        if (f.make && l.make !== f.make) return false;
        if (f.model && l.model !== f.model) return false;
        if (f.variant) {
            const varLower = f.variant.toLowerCase();
            const lVar = (l.variant || '').toLowerCase();
            const lTitle = (l.title || '').toLowerCase();
            const lSub = (l.subtitle || '').toLowerCase();
            if (!lVar.includes(varLower) && !lTitle.includes(varLower) && !lSub.includes(varLower)) return false;
        }
    }

    const price = l.priceRaw ?? l.priceEur ?? null;
    if (f.priceFrom && price != null && price < f.priceFrom) return false;
    if (f.priceTo && price != null && price > f.priceTo) return false;

    const year = Number(l.year) || null;
    if (f.yearFrom && year && year < f.yearFrom) return false;
    if (f.yearTo && year && year > f.yearTo) return false;

    if (f.lengthFrom && (l.lengthM || 0) < f.lengthFrom) return false;
    if (f.lengthTo && l.lengthM && l.lengthM > f.lengthTo) return false;

    const hp = powerHp(l);
    if (f.powerFrom && hp && hp < f.powerFrom) return false;
    if (f.powerTo && hp && hp > f.powerTo) return false;

    if (f.engineHoursTo && l.engineHours && l.engineHours > f.engineHoursTo) return false;
    if (f.berthsFrom && (l.berths || 0) < f.berthsFrom) return false;
    if (f.cabinsFrom && (l.cabins || 0) < f.cabinsFrom) return false;

    if (f.engineMake) {
        const query = f.engineMake.toLowerCase();
        const titleMatch = l.title && l.title.toLowerCase().includes(query);
        const subtitleMatch = l.subtitle && l.subtitle.toLowerCase().includes(query);
        const makeMatch = l.itemType === 'motor' && l.make && l.make.toLowerCase().includes(query);
        if (!titleMatch && !subtitleMatch && !makeMatch) return false;
    }

    if (f.fuel.length && !f.fuel.includes(l.fuel)) return false;
    if (f.engineMount.length && !f.engineMount.includes(l.engineMountType)) return false;
    if (f.hull.length && !f.hull.includes(l.hullMaterial)) return false;
    if (f.ce.length && !f.ce.includes(l.ceCategory)) return false;
    if (f.stroke.length && !f.stroke.includes(l.stroke)) return false;
    if (f.shaft.length && !f.shaft.includes(l.shaftLength)) return false;
    if (f.extraEquipment.length && (!l.equipment || !f.extraEquipment.every(eq => l.equipment.includes(eq)))) return false;

    return true;
}



function setupMultiVehicleSelector() {
    const makeSelect = document.getElementById("make");
    const modelSelect = document.getElementById("model");
    const variantSelect = document.getElementById("variant");
    const addVehicleBtn = document.getElementById("addVehicleBtn");
    const excludeVehicleBtn = document.getElementById("excludeVehicleBtn");
    const vehicleCardsEl = document.getElementById("vehicleCards");
    const excludedVehicleCardsEl = document.getElementById("excludedVehicleCards");
    const excludedVehiclesSection = document.getElementById("excludedVehiclesSection");
    const brandLimitNote = document.getElementById("brandLimitNote");

    function resetSelectors() {
        if (!makeSelect) return;
        makeSelect.value = '';
        if (modelSelect) {
            modelSelect.innerHTML = '<option value="">Model</option>';
            modelSelect.disabled = true;
        }
        if (variantSelect) {
            variantSelect.innerHTML = '<option value="">Različica</option>';
            variantSelect.disabled = true;
        }
        makeSelect.dispatchEvent(new Event('change'));
        if (modelSelect) modelSelect.dispatchEvent(new Event('change'));
        if (variantSelect) variantSelect.dispatchEvent(new Event('change'));
    }

    if (variantSelect) {
        variantSelect.addEventListener('change', () => {
            const make = makeSelect?.value;
            const model = modelSelect?.value;
            const variant = variantSelect.value;
            if (make && model && variant && addVehicleBtn) {
                addVehicleBtn.click();
            }
        });
    }

    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            const make = makeSelect ? makeSelect.value : '';
            if (!make) return;
            if (vehicles.length >= MAX_VEHICLES) return;
            const model = (modelSelect && modelSelect.value) || '';
            const variant = (variantSelect && variantSelect.value) || '';
            vehicles.push({ make, model, variant });
            resetSelectors();
            renderVehicleCards();
        });
    }

    if (excludeVehicleBtn) {
        excludeVehicleBtn.addEventListener('click', () => {
            const make = makeSelect ? makeSelect.value : '';
            if (!make) return;
            if (excludedVehicles.length >= MAX_VEHICLES) return;
            const model = (modelSelect && modelSelect.value) || '';
            const variant = (variantSelect && variantSelect.value) || '';
            excludedVehicles.push({ make, model, variant });
            resetSelectors();
            renderExcludedCards();
        });
    }

    function makeCardHTML(v, i, zone) {
        const parts = [v.make];
        if (v.model) parts.push(v.model);
        if (v.variant && v.variant !== v.model) parts.push(v.variant);
        const cls = zone === 'exclude' ? 'vehicle-entry-card vec-excluded' : 'vehicle-entry-card';
        return `<div class="${cls}" draggable="true" data-idx="${i}" data-zone="${zone}">
            <div class="vec-info">${parts.map(p => `<span>${p}</span>`).join('<span class="vec-sep">›</span>')}</div>
            <button type="button" class="vec-remove" data-idx="${i}" data-zone="${zone}">&times;</button>
        </div>`;
    }

    // Touch-dragging variables
    let touchDragging = false;
    let touchStartTimeout = null;
    let touchDraggingCard = null;
    let touchStartData = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchClone = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    function handleTouchStart(e, card) {
        if (e.target.closest('.vec-remove')) return;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchDraggingCard = card;
        touchDragging = false;

        const cardRect = card.getBoundingClientRect();
        touchOffsetX = touch.clientX - cardRect.left;
        touchOffsetY = touch.clientY - cardRect.top;

        touchStartTimeout = setTimeout(() => {
            touchDragging = true;
            if (navigator.vibrate) navigator.vibrate(20);

            touchStartData = {
                idx: +card.dataset.idx,
                zone: card.dataset.zone
            };

            touchClone = card.cloneNode(true);
            touchClone.classList.add('vec-dragging-clone');
            Object.assign(touchClone.style, {
                position: 'fixed',
                left: `${cardRect.left}px`,
                top: `${cardRect.top}px`,
                width: `${cardRect.width}px`,
                height: `${cardRect.height}px`,
                opacity: '0.9',
                pointerEvents: 'none',
                zIndex: '9999',
                margin: '0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transform: 'scale(1.05)',
                transition: 'transform 0.1s ease',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            });
            document.body.appendChild(touchClone);
            card.classList.add('vec-dragging');
        }, 250);
    }

    function handleTouchMove(e) {
        if (!touchDraggingCard) return;
        const touch = e.touches[0];

        if (!touchDragging) {
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                clearTimeout(touchStartTimeout);
                touchDraggingCard = null;
            }
            return;
        }

        e.preventDefault();

        const x = touch.clientX - touchOffsetX;
        const y = touch.clientY - touchOffsetY;
        if (touchClone) {
            touchClone.style.left = `${x}px`;
            touchClone.style.top = `${y}px`;
        }

        const rectInclude = vehicleCardsEl ? vehicleCardsEl.getBoundingClientRect() : null;
        const rectExclude = excludedVehicleCardsEl ? excludedVehicleCardsEl.getBoundingClientRect() : null;
        const cx = touch.clientX;
        const cy = touch.clientY;

        if (rectInclude && cx >= rectInclude.left && cx <= rectInclude.right && cy >= rectInclude.top && cy <= rectInclude.bottom) {
            vehicleCardsEl.classList.add('vec-drag-over');
            if (excludedVehicleCardsEl) excludedVehicleCardsEl.classList.remove('vec-drag-over');
        } else if (rectExclude && cx >= rectExclude.left && cx <= rectExclude.right && cy >= rectExclude.top && cy <= rectExclude.bottom) {
            excludedVehicleCardsEl.classList.add('vec-drag-over');
            if (vehicleCardsEl) vehicleCardsEl.classList.remove('vec-drag-over');
        } else {
            if (vehicleCardsEl) vehicleCardsEl.classList.remove('vec-drag-over');
            if (excludedVehicleCardsEl) excludedVehicleCardsEl.classList.remove('vec-drag-over');
        }
    }

    function handleTouchEnd(e) {
        clearTimeout(touchStartTimeout);

        if (!touchDraggingCard) return;

        if (touchDragging) {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const cx = touch.clientX;
            const cy = touch.clientY;

            const rectInclude = vehicleCardsEl ? vehicleCardsEl.getBoundingClientRect() : null;
            const rectExclude = excludedVehicleCardsEl ? excludedVehicleCardsEl.getBoundingClientRect() : null;

            let targetZone = null;
            if (rectInclude && cx >= rectInclude.left && cx <= rectInclude.right && cy >= rectInclude.top && cy <= rectInclude.bottom) {
                targetZone = 'include';
            } else if (rectExclude && cx >= rectExclude.left && cx <= rectExclude.right && cy >= rectExclude.top && cy <= rectExclude.bottom) {
                targetZone = 'exclude';
            }

            if (touchClone) {
                touchClone.remove();
                touchClone = null;
            }
            touchDraggingCard.classList.remove('vec-dragging');

            if (vehicleCardsEl) vehicleCardsEl.classList.remove('vec-drag-over');
            if (excludedVehicleCardsEl) excludedVehicleCardsEl.classList.remove('vec-drag-over');

            if (targetZone && targetZone !== touchStartData.zone) {
                const { idx, zone: fromZone } = touchStartData;
                const srcArr = fromZone === 'include' ? vehicles : excludedVehicles;
                const dstArr = targetZone === 'include' ? vehicles : excludedVehicles;
                if (dstArr.length < MAX_VEHICLES) {
                    const [item] = srcArr.splice(idx, 1);
                    dstArr.push(item);
                    renderVehicleCards();
                    renderExcludedCards();
                }
            }
        }

        touchDraggingCard = null;
        touchDragging = false;
        touchStartData = null;
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    function bindCardDrag(el) {
        el.querySelectorAll('[draggable]').forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ idx: +card.dataset.idx, zone: card.dataset.zone }));
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => card.classList.add('vec-dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('vec-dragging'));

            card.addEventListener('touchstart', (e) => handleTouchStart(e, card), { passive: false });
        });
    }

    function setupDropZone(el, zone) {
        el.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; el.classList.add('vec-drag-over'); });
        el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('vec-drag-over'); });
        el.addEventListener('drop', e => {
            e.preventDefault();
            el.classList.remove('vec-drag-over');
            let data;
            try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
            const { idx, zone: fromZone } = data;
            if (fromZone === zone) return;
            const srcArr = fromZone === 'include' ? vehicles : excludedVehicles;
            const dstArr = zone === 'include' ? vehicles : excludedVehicles;
            if (dstArr.length >= MAX_VEHICLES) return;
            const [item] = srcArr.splice(idx, 1);
            dstArr.push(item);
            renderVehicleCards();
            renderExcludedCards();
        });
    }

    if (vehicleCardsEl) setupDropZone(vehicleCardsEl, 'include');
    if (excludedVehicleCardsEl) setupDropZone(excludedVehicleCardsEl, 'exclude');

    function renderVehicleCards() {
        if (!vehicleCardsEl) return;
        vehicleCardsEl.innerHTML = vehicles.map((v, i) => makeCardHTML(v, i, 'include')).join('');
        vehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => {
            vehicles.splice(+btn.dataset.idx, 1);
            renderVehicleCards();
        }));
        bindCardDrag(vehicleCardsEl);
        const atLimit = vehicles.length >= MAX_VEHICLES;
        if (addVehicleBtn) addVehicleBtn.style.display = atLimit ? 'none' : 'flex';
        if (brandLimitNote) brandLimitNote.textContent = atLimit ? 'Omejitev dosežena (3).' : vehicles.length > 0 ? `Dodano: ${vehicles.length}/${MAX_VEHICLES}` : '';
        updateExcludedSectionVisibility();
    }

    function updateExcludedSectionVisibility() {
        if (excludedVehiclesSection) {
            excludedVehiclesSection.style.display = (vehicles.length > 0 || excludedVehicles.length > 0) ? 'block' : 'none';
        }
        if (vehicleCardsEl) {
            vehicleCardsEl.classList.toggle('vec-drop-target-visible', vehicles.length === 0 && excludedVehicles.length > 0);
        }
    }

    function renderExcludedCards() {
        if (!excludedVehicleCardsEl) return;
        excludedVehicleCardsEl.innerHTML = excludedVehicles.map((v, i) => makeCardHTML(v, i, 'exclude')).join('');
        excludedVehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => {
            excludedVehicles.splice(+btn.dataset.idx, 1);
            renderExcludedCards();
        }));
        bindCardDrag(excludedVehicleCardsEl);
        updateExcludedSectionVisibility();
        if (window.lucide) window.lucide.createIcons();
    }

    renderVehicleCards();
    renderExcludedCards();
}

function fmt(n) {
    return new Intl.NumberFormat('sl-SI').format(n);
}

