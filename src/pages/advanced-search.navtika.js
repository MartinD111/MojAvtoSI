// ═══════════════════════════════════════════════════════════════════════════════
// Advanced Search — MojaNavtika (vessels & outboard engines)
// Self-contained controller for the boat search view (advanced-search.navtika.html).
// Kept separate from the car search so neither platform's logic interferes.
// ═══════════════════════════════════════════════════════════════════════════════
import { getListings } from '../services/listingService.js';
import { MAIN_CATEGORIES } from '../data/categories.js';
import { brandsFileFor } from '../data/brandFiles.js';
import { t } from '../core/i18n.js';
import { initCustomSelects, createCustomSelect } from '../utils/customSelect.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';

const ENGINE_CAT = 'izvenkrmni-motorji';

export function initAdvancedSearchPage() {
    initNavtikaSearchPage();
}

export function initNavtikaSearchPage() {
    console.log('[NavtikaSearch] init');
    initCustomSelects();

    const params = parseHashParams();
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
    applyCategory(ctx);
    bindAccordions();
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
    const hash = window.location.hash.slice(1) || '/';
    const q = hash.indexOf('?');
    return q === -1 ? new URLSearchParams() : new URLSearchParams(hash.slice(q + 1));
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
        <button type="button" class="tab-btn ${cat.slug === ctx.cat ? 'active' : ''}" data-cat="${cat.slug}" title="${t(cat.label)}">
            <i data-lucide="${cat.icon}"></i>
            <span class="hidden-md">${t(cat.label)}</span>
        </button>`).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ctx.cat = btn.dataset.cat;
            ctx.sub = '';
            ctx.vtype = '';
            applyCategory(ctx);
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
        if (isOprema) label.textContent = 'Vrsta opreme';
        else if (isEngine) label.textContent = 'Razred motorja';
        else label.textContent = 'Vrsta plovila';
    }

    // Render type grid
    const grid = document.getElementById('boatTypeGrid');
    if (grid) {
        const types = typesForCategory(ctx.cat);
        const icon = isOprema ? 'package' : (isEngine ? 'cog' : 'sailboat');
        grid.innerHTML = types.map(vt => `
            <button type="button" class="body-type-card" data-value="${vt.value}">
                <i data-lucide="${icon}"></i>
                <span>${t(vt.label)}</span>
            </button>`).join('');
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
    if (window.lucide) window.lucide.createIcons();
}

// ── Brand/model options ─────────────────────────────────────────────────────────
function loadBrands(catSlug) {
    const makeSel = document.getElementById('make');
    const modelSel = document.getElementById('model');
    if (!makeSel) return;
    fetch(brandsFileFor(catSlug))
        .then(r => r.ok ? r.json() : {})
        .then(data => {
            window._boatBrandData = data;
            makeSel.innerHTML = '<option value="">Znamka</option>';
            Object.keys(data).sort().forEach(b => {
                const o = document.createElement('option'); o.value = b; o.textContent = b; makeSel.appendChild(o);
            });
            if (modelSel) { modelSel.innerHTML = '<option value="">Model</option>'; modelSel.disabled = true; }
            createCustomSelect(makeSel);
            if (modelSel) createCustomSelect(modelSel);
        })
        .catch(() => {});

    makeSel.addEventListener('change', () => {
        const data = window._boatBrandData || {};
        const models = data[makeSel.value] ? Object.keys(data[makeSel.value]) : [];
        if (!modelSel) return;
        modelSel.innerHTML = '<option value="">Model</option>';
        models.sort().forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; modelSel.appendChild(o); });
        modelSel.disabled = models.length === 0;
        createCustomSelect(modelSel);
    });
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
        
        // Include common fields if they have a value
        const fieldsToMap = ['make', 'model', 'powerFrom', 'powerTo', 'engineHoursTo', 'berthsFrom', 'cabinsFrom', 'yearFrom', 'yearTo', 'priceTo', 'bodyType', 'najem', 'prodaja', 'engineMake'];
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
        window.location.hash = `/oglasi${paramStr ? '?' + paramStr : ''}`;
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
        make: form.querySelector('[name="make"]')?.value || '',
        model: form.querySelector('[name="model"]')?.value || '',
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
    if (f.make && l.make !== f.make) return false;
    if (f.model && l.model !== f.model) return false;

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



function fmt(n) {
    return new Intl.NumberFormat('sl-SI').format(n);
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
