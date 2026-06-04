// Advanced Search page — MojAvto.si
// Category-aware: reads ?cat=, ?sub=, ?searchType=, ?vtype=, ?najem= from URL
import { getListings } from '../services/listingService.js';
import { resolveCategory, SEARCH_TYPE_OPTIONS } from '../data/categories.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { initCustomSelects, createCustomSelect } from '../utils/customSelect.js';
import { getModelBodyType, getModelVariants } from '../utils/bodyType.js';
import { COMMERCIAL_TAXONOMY, COMMERCIAL_BY_KEY } from '../data/commercialTaxonomy.js';
import {
    MOTO_STROKE_OPTIONS,
    MOTO_CYLINDER_OPTIONS,
    MOTO_LAYOUTS,
    COMMERCIAL_FUEL_MAP,
    getMotoVariants,
    computeMotoFacets,
    codeMatchesLayout,
} from '../data/searchRelevance.js';

export function initAdvancedSearchPage() {
    console.log('[AdvancedSearchPage] init');

    initCustomSelects();

    // Parse category params from current hash
    const params = parseHashParams();
    const catContext = {
        cat: params.get('cat') || '',
        sub: params.get('sub') || '',
        searchType: params.get('searchType') || '',
        vtype: params.get('vtype') || '',
        najem: params.get('najem') || '',
    };

    applyCategoryContext(catContext);
    bindAccordions();
    bindSearchLogic(catContext);
    bindHybridSubOptions();

    // Setup numeric formatters
    document.querySelectorAll('.js-format-number').forEach(input => setupNumericFormatter(input));

    if (window.lucide) window.lucide.createIcons();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Parse query params from hash URL
// ═══════════════════════════════════════════════════════════════════════════════
function parseHashParams() {
    const hash = window.location.hash.slice(1) || '/';
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return new URLSearchParams();
    return new URLSearchParams(hash.slice(qIndex + 1));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Apply category context to the page UI
// ═══════════════════════════════════════════════════════════════════════════════
function applyCategoryContext(ctx) {
    const tabs = document.getElementById('vehicleTypeTabs');
    const searchTypePills = document.getElementById('searchTypePills');

    // Set hidden fields
    const hiddenCat = document.getElementById('hiddenCat');
    if (hiddenCat) hiddenCat.value = ctx.cat;
    
    const hiddenSub = document.getElementById('hiddenSub');
    if (hiddenSub) hiddenSub.value = ctx.sub;
    
    const hiddenSearchType = document.getElementById('hiddenSearchType');
    if (hiddenSearchType) hiddenSearchType.value = ctx.searchType;
    
    const hiddenVType = document.getElementById('hiddenVType');
    if (hiddenVType) hiddenVType.value = ctx.vtype;
    
    const hiddenNajem = document.getElementById('hiddenNajem');
    if (hiddenNajem) hiddenNajem.value = ctx.najem;

    const resolved = ctx.cat ? resolveCategory(ctx.cat, ctx.sub) : null;

    // Title is now removed in Phase 3 cleanup


    // ── Tab selection ──
    // Map category slugs to tab data-tab values
    const tabMap = { 'avto': 'avto', 'moto': 'moto', 'gospodarska': 'gospodarska', 'prosti-cas': 'prosti-cas' };
    const tabBtns = tabs ? tabs.querySelectorAll('.tab-btn') : [];

    if (tabs && ctx.cat && tabMap[ctx.cat]) {
        // Auto-select the right tab
        tabBtns.forEach(btn => {
            const isTarget = btn.dataset.tab === tabMap[ctx.cat];
            btn.classList.toggle('active', isTarget);
        });
        // Show correct grid
        showGridForTab(tabMap[ctx.cat]);
    }

    // ── Search type pills removed (parts & tires sections no longer exist) ──
    if (searchTypePills) searchTypePills.style.display = 'none';

    // ── Pre-select vehicle type if specified ──
    if (ctx.vtype) {
        setTimeout(() => {
            const card = document.querySelector(`.body-type-card[data-value="${ctx.vtype}"]`);
            if (card) {
                card.classList.add('active');
                const bodyTypeHidden = document.getElementById('bodyTypeHidden');
                if (bodyTypeHidden) bodyTypeHidden.value = ctx.vtype;
            }
        }, 50);
    }

    // ── Restore remembered search state ──
    const rememberToggle = document.getElementById('rememberSearchToggle');
    const storageKey = `search_remember_${ctx.cat || 'all'}_${ctx.sub || 'all'}`;
    if (rememberToggle) {
        const wasRemembered = localStorage.getItem(storageKey) === 'true';
        rememberToggle.checked = wasRemembered;
        rememberToggle.addEventListener('change', () => {
            localStorage.setItem(storageKey, rememberToggle.checked);
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Show the correct body-type grid for a tab
// ═══════════════════════════════════════════════════════════════════════════════
function showGridForTab(tabKey) {
    const gridMap = {
        'avto': { id: 'grid-cars', display: 'flex' },
        'moto': { id: 'grid-motorbikes', display: 'block' },
        'gospodarska': { id: 'grid-commercial', display: 'block' },
        'prosti-cas': { id: 'grid-leisure', display: 'flex' },
    };
    Object.values(gridMap).forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = gridMap[tabKey];
    if (target) {
        const el = document.getElementById(target.id);
        if (el) el.style.display = target.display;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Accordions
// ═══════════════════════════════════════════════════════════════════════════════
function bindAccordions() {
    const triggers = document.querySelectorAll('.adv-acc-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const body = trigger.closest('.adv-accordion').querySelector('.adv-acc-body');
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            if (!isOpen) {
                triggers.forEach(o => {
                    const acc = o.closest('.adv-accordion');
                    if (o !== trigger && !acc.classList.contains('persistent-open')) {
                        o.setAttribute('aria-expanded', 'false');
                        const b = acc.querySelector('.adv-acc-body');
                        if (b) b.style.display = 'none';
                    }
                });
            }
            const ns = !isOpen;
            trigger.setAttribute('aria-expanded', String(ns));
            if (body) body.style.display = ns ? 'flex' : 'none';
        });
    });
    document.querySelectorAll('.remember-check').forEach(chk => {
        const cat = chk.getAttribute('data-category');
        if (localStorage.getItem(`remember_${cat}`) === 'true') chk.checked = true;
        chk.addEventListener('change', () => localStorage.setItem(`remember_${cat}`, chk.checked));
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main search logic
// ═══════════════════════════════════════════════════════════════════════════════
function bindSearchLogic(catContext) {
    const searchForm = document.getElementById("advancedSearchForm");
    const makeSelect = document.getElementById("make");
    const modelSelect = document.getElementById("model");
    const variantSelect = document.getElementById("variant");
    const addVehicleBtn = document.getElementById("addVehicleBtn");
    const excludeVehicleBtn = document.getElementById("excludeVehicleBtn");
    const vehicleCardsEl = document.getElementById("vehicleCards");
    const excludedVehicleCardsEl = document.getElementById("excludedVehicleCards");
    const excludedVehiclesSection = document.getElementById("excludedVehiclesSection");
    const brandLimitNote = document.getElementById("brandLimitNote");
    const tabBtns = document.querySelectorAll('.tabs-glass .tab-btn');
    const bodyTypeHidden = document.getElementById('bodyTypeHidden');
    const allBodyTypeCards = document.querySelectorAll('.body-type-card');
    const yearFromSelect = document.getElementById("year-from");
    const yearToSelect = document.getElementById("year-to");

    if (!searchForm || !makeSelect) return;

    let activeTab = catContext.cat || 'avto';
    let vehicles = [];
    let excludedVehicles = [];
    const MAX_VEHICLES = 3;

    // ── Dynamic Field Visibility ──
    function toggleVehicleSpecificFields(tab) {
        const carFields = document.querySelectorAll('.car-only-field');
        const motoFields = document.querySelectorAll('.moto-only-field');
        const accInterior = document.getElementById('acc-interior');

        if (tab === 'moto') {
            carFields.forEach(el => el.style.display = 'none');
            motoFields.forEach(el => {
                if (el.id === 'moto-equipment') el.style.display = 'block';
                else if (el.classList.contains('adv-grid-2')) el.style.display = 'grid';
                else el.style.display = 'block';
            });
            if (accInterior) accInterior.style.display = 'none';
        } else {
            carFields.forEach(el => {
                if (el.classList.contains('adv-accordion')) el.style.display = 'block';
                else if (el.classList.contains('adv-grid-2')) el.style.display = 'grid';
                else el.style.display = 'block';
            });
            motoFields.forEach(el => el.style.display = 'none');
            if (accInterior) accInterior.style.display = 'block';
        }
    }
    toggleVehicleSpecificFields(activeTab);

    // ── Cascading relevance ───────────────────────────────────────────────────
    // Narrows downstream filter options to what the upstream selection supports:
    //   • moto: brand/model → Takt, Valji, layout, Prenos moči (from JSON data)
    //   • gospodarska: vrsta → Vrsta goriva (from curated COMMERCIAL_FUEL_MAP)
    // Called on every selection change that can affect the available options.

    // Rebuild a <select>'s options to the allowed subset, preserving the current
    // value when it is still valid. The customSelect MutationObserver re-syncs the
    // visible dropdown automatically. Returns true if the selected value changed.
    function rebuildSelectOptions(selectEl, placeholder, optionDefs, allowedSet) {
        if (!selectEl) return false;
        const prev = selectEl.value;
        const shown = optionDefs.filter(o => !allowedSet || allowedSet.has(o.v));
        selectEl.innerHTML = `<option value="">${placeholder}</option>` +
            shown.map(o => `<option value="${o.v}">${o.l}</option>`).join('');
        const stillValid = prev && shown.some(o => o.v === prev);
        selectEl.value = stillValid ? prev : '';
        return prev !== selectEl.value;
    }

    // Show/hide the .adv-chip labels of a checkbox group based on allowed values.
    // Unchecks any chip that becomes hidden. allowedSet null = show all.
    function applyChipGroup(name, allowedSet) {
        let visibleCount = 0;
        document.querySelectorAll(`input[name="${name}"]`).forEach(inp => {
            const label = inp.closest('.adv-chip');
            if (!label) return;
            const ok = !allowedSet || allowedSet.has(inp.value);
            label.style.display = ok ? '' : 'none';
            if (ok) visibleCount++;
            else if (inp.checked) inp.checked = false;
        });
        return visibleCount;
    }

    // Rebuild the cylinder-layout <select> for the chosen cylinder count, narrowed
    // to the engine codes still possible given the other engine choices.
    function rebuildLayoutOptions(facets) {
        const cylSel = document.getElementById('moto-cylinders');
        const layoutSel = document.getElementById('moto-cylinder-layout');
        const layoutGroup = document.getElementById('cylinder-layout-group');
        if (!cylSel || !layoutSel || !layoutGroup) return;

        const base = MOTO_LAYOUTS[cylSel.value];
        if (!base) {
            layoutGroup.style.display = 'none';
            layoutSel.innerHTML = '';
            return;
        }
        const codes = facets && facets.engineCodes;
        let shown = (codes && codes.size)
            ? base.filter(o => [...codes].some(c => codeMatchesLayout(c, o.v)))
            : base;
        if (shown.length === 0) shown = base; // never strand the user with nothing

        const prev = layoutSel.value;
        layoutGroup.style.display = 'block';
        layoutSel.innerHTML = '<option value="">Vse konfiguracije</option>' +
            shown.map(o => `<option value="${o.v}">${o.l}</option>`).join('');
        layoutSel.value = (prev && shown.some(o => o.v === prev)) ? prev : '';
    }

    function applyRelevance() {
        // ── Moto engine cascade (faceted, data-driven) ──
        if (activeTab === 'moto') {
            const sels = [];
            if (makeSelect.value) sels.push({ make: makeSelect.value, model: modelSelect.value || '' });
            vehicles.forEach(v => sels.push({ make: v.make, model: v.model || '' }));
            const variants = getMotoVariants(window._brandModelData, sels);

            const strokeSel = document.querySelector('select[name="stroke"]');
            const cylSel = document.getElementById('moto-cylinders');
            const layoutSel = document.getElementById('moto-cylinder-layout');

            if (variants.length === 0) {
                // No brand/model picked → no constraint, show every option.
                rebuildSelectOptions(strokeSel, 'Vsi takti', MOTO_STROKE_OPTIONS, null);
                rebuildSelectOptions(cylSel, 'Valji', MOTO_CYLINDER_OPTIONS, null);
                rebuildLayoutOptions(null);
                applyChipGroup('motoDrivetrain', null);
            } else {
                // Current engine selections constrain each other (faceted).
                const cylVal = cylSel ? cylSel.value : '';
                // Only honour the layout if it belongs to the chosen cylinder count,
                // otherwise a stale value (e.g. V4 left over after switching to 2
                // cylinders) would wipe out every facet.
                const layoutVal = (layoutSel && cylVal && MOTO_LAYOUTS[cylVal]
                    && MOTO_LAYOUTS[cylVal].some(o => o.v === layoutSel.value))
                    ? layoutSel.value : '';
                const constraints = {
                    stroke: strokeSel ? strokeSel.value : '',
                    cylinders: cylVal,
                    layout: layoutVal,
                    drivetrains: Array.from(
                        document.querySelectorAll('input[name="motoDrivetrain"]:checked')
                    ).map(i => i.value),
                };
                const facets = computeMotoFacets(variants, constraints);
                rebuildSelectOptions(strokeSel, 'Vsi takti', MOTO_STROKE_OPTIONS, facets.strokes);
                rebuildSelectOptions(cylSel, 'Valji', MOTO_CYLINDER_OPTIONS, facets.cylinders);
                rebuildLayoutOptions(facets);
                applyChipGroup('motoDrivetrain', facets.drivetrains);
            }
        }

        // ── Commercial fuel cascade (curated) ──
        if (activeTab === 'gospodarska') {
            const hv = document.getElementById('hiddenVType');
            const vrsta = hv ? hv.value : '';
            const allowed = vrsta && COMMERCIAL_FUEL_MAP[vrsta]
                ? new Set(COMMERCIAL_FUEL_MAP[vrsta])
                : null;
            const visible = applyChipGroup('fuel', allowed);
            // Hide the whole "Vrsta goriva" group when the vrsta has no engine
            const fuelGroup = document.querySelector('input[name="fuel"]')?.closest('.adv-field-group');
            if (fuelGroup) fuelGroup.style.display = (allowed && visible === 0) ? 'none' : '';
        } else {
            // Any non-commercial tab: restore the full fuel list
            applyChipGroup('fuel', null);
            const fuelGroup = document.querySelector('input[name="fuel"]')?.closest('.adv-field-group');
            if (fuelGroup && activeTab !== 'moto') fuelGroup.style.display = '';
        }
    }

    // ── Dynamic Brand Data Loading ──
    function fetchBrandData(category) {
        let jsonFile = "json/brands_models_global.json";
        if (category === 'moto') jsonFile = "json/brands_models_moto.json";
        if (category === 'gospodarska') jsonFile = "json/brands_models_gospodarska.json";

        return fetch(jsonFile)
            .then(r => r.json())
            .then(data => {
                window._brandModelData = data;
                const prevMake = makeSelect.value;
                makeSelect.innerHTML = '<option value="">Znamka</option>';
                const sorted = Object.keys(data).sort();
                sorted.forEach(brand => {
                    const o1 = document.createElement("option"); o1.value = brand; o1.textContent = brand;
                    if (brand === prevMake) o1.selected = true;
                    makeSelect.appendChild(o1);
                });
                if (!data[prevMake]) {
                    modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
                    variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
                }
                return data;
            });
    }

    // ── Tabs ──
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Clear current makes & models selection
            vehicles = [];
            
            activeTab = btn.dataset.tab;
            showGridForTab(activeTab);
            toggleVehicleSpecificFields(activeTab);
            fetchBrandData(activeTab).then(applyRelevance);

            // Reset the search form to default
            searchForm.reset();
        });
    });

    // ── Exhaust Brand Tag Input ──
    const exhaustCheck      = document.getElementById('sport-exhaust-check');
    const exhaustTagsRow    = document.getElementById('exhaust-tags-row');
    const exhaustTagsList   = document.getElementById('exhaust-tags-list');
    const exhaustBrandSelect = document.getElementById('exhaust-brand-select');

    if (exhaustCheck && exhaustTagsRow && exhaustBrandSelect) {
        function addExhaustTag(brand) {
            if (!brand) return;
            if ([...exhaustTagsList.querySelectorAll('.exhaust-tag')].some(t => t.dataset.value === brand)) return;
            const tag = document.createElement('span');
            tag.className = 'adv-chip exhaust-tag';
            tag.dataset.value = brand;
            tag.style.cssText = 'display:inline-flex;align-items:center;gap:0.25rem;';
            const hidden = document.createElement('input');
            hidden.type = 'hidden'; hidden.name = 'exhaustBrand'; hidden.value = brand;
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button'; removeBtn.className = 'exhaust-tag-remove'; removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => { tag.remove(); updateLiveCount(); });
            tag.append(document.createTextNode(brand), removeBtn, hidden);
            exhaustTagsList.appendChild(tag);
            updateLiveCount();
        }

        fetch('json/exhaust_brands.json')
            .then(r => r.json())
            .then(brands => {
                brands.forEach(b => {
                    const o = document.createElement('option');
                    o.value = b; o.textContent = b;
                    exhaustBrandSelect.appendChild(o);
                });
                createCustomSelect(exhaustBrandSelect);
                // Size the container to fit-content instead of full-width
                const csc = exhaustBrandSelect.previousElementSibling;
                if (csc && csc.classList.contains('custom-select-container')) {
                    csc.style.cssText = 'width:auto; min-width:160px; position:relative;';
                }
                exhaustBrandSelect.addEventListener('change', () => {
                    const val = exhaustBrandSelect.value;
                    if (!val) return;
                    addExhaustTag(val);
                    // Reset select back to placeholder
                    exhaustBrandSelect.selectedIndex = 0;
                    const valueSpan = csc?.querySelector('.custom-select-value');
                    if (valueSpan) valueSpan.textContent = 'Znamka izpuha';
                });
            })
            .catch(() => {});

        exhaustCheck.addEventListener('change', () => {
            exhaustTagsRow.style.display = exhaustCheck.checked ? 'inline-flex' : 'none';
            if (!exhaustCheck.checked) exhaustTagsList.innerHTML = '';
            updateLiveCount();
        });
    }

    const cylindersSelect = document.getElementById('moto-cylinders');
    const layoutGroup = document.getElementById('cylinder-layout-group');
    const layoutSelect = document.getElementById('moto-cylinder-layout');
    if (cylindersSelect) {
        // Cylinders / layout / drivetrain all cross-filter each other, so re-run the
        // faceted relevance pass on any engine change (it rebuilds the layout list).
        cylindersSelect.addEventListener('change', () => { applyRelevance(); updateLiveCount(); });
        if (layoutSelect) layoutSelect.addEventListener('change', () => { applyRelevance(); updateLiveCount(); });
        const strokeSelect = document.querySelector('select[name="stroke"]');
        if (strokeSelect) strokeSelect.addEventListener('change', () => { applyRelevance(); updateLiveCount(); });
        document.querySelectorAll('input[name="motoDrivetrain"]').forEach(chk =>
            chk.addEventListener('change', () => { applyRelevance(); updateLiveCount(); }));

        // ── Dodaj / Odstrani buttons for cylinder filters ──
        // cylFilters: [{ cylinders, layout, label, key, exclude: bool }]
        let cylFilters = [];
        const cylChipsEl   = document.getElementById('cylFilterChips');
        const cylAddBtn    = document.getElementById('cylAddBtn');
        const cylRemoveBtn = document.getElementById('cylRemoveBtn');

        function buildCylEntry(exclude) {
            const cyl = cylindersSelect.value;
            if (!cyl) return null;
            const layout = layoutSelect ? layoutSelect.value : '';
            const cylLabel = cylindersSelect.options[cylindersSelect.selectedIndex]?.text || cyl;
            const layoutLabel = layout ? (layoutSelect.options[layoutSelect.selectedIndex]?.text || layout) : '';
            const label = layoutLabel ? `${cylLabel} · ${layoutLabel}` : cylLabel;
            const key = (exclude ? 'x|' : 'i|') + cyl + '|' + layout;
            if (cylFilters.some(f => f.key === key)) return null;
            return { cylinders: cyl, layout, label, key, exclude };
        }

        function resetCylDropdowns() {
            cylindersSelect.value = '';
            if (layoutGroup) layoutGroup.style.display = 'none';
            if (layoutSelect) layoutSelect.innerHTML = '';
        }

        function renderCylChips() {
            if (!cylChipsEl) return;
            cylChipsEl.innerHTML = '';
            cylFilters.forEach((f, i) => {
                const chip = document.createElement('span');
                chip.className = f.exclude ? 'cyl-filter-chip cyl-filter-chip-exclude' : 'cyl-filter-chip';
                const btn = document.createElement('button');
                btn.type = 'button'; btn.textContent = '×';
                btn.addEventListener('click', () => { cylFilters.splice(i, 1); renderCylChips(); updateLiveCount(); });
                chip.append(document.createTextNode(f.exclude ? '≠ ' + f.label : f.label), btn);
                cylChipsEl.appendChild(chip);
            });
        }

        if (cylAddBtn) {
            cylAddBtn.addEventListener('click', () => {
                const entry = buildCylEntry(false);
                if (!entry) return;
                cylFilters.push(entry);
                resetCylDropdowns();
                renderCylChips();
                updateLiveCount();
            });
        }

        if (cylRemoveBtn) {
            cylRemoveBtn.addEventListener('click', () => {
                const entry = buildCylEntry(true);
                if (!entry) return;
                cylFilters.push(entry);
                resetCylDropdowns();
                renderCylChips();
                updateLiveCount();
            });
        }

        // Expose cylFilters so matchesFilters can read them
        window._cylFilters = cylFilters;
    }

    // ── 6-axis IMU Logic ──
    const imuTrigger = document.getElementById('imu-trigger-checkbox');
    const imuSubs = document.querySelectorAll('.imu-sub');
    if (imuTrigger) {
        imuTrigger.addEventListener('change', () => {
            const isChecked = imuTrigger.checked;
            imuSubs.forEach(cb => {
                cb.checked = isChecked;
            });
            updateLiveCount();
        });
    }

    fetchBrandData(activeTab).then(applyRelevance);

    makeSelect.addEventListener("change", () => {
        const data = window._brandModelData;
        const val = makeSelect.value;
        modelSelect.innerHTML = '<option value="">Model</option>';
        variantSelect.innerHTML = '<option value="">Različica</option>';
        modelSelect.disabled = true; variantSelect.disabled = true;
        if (val && data && data[val]) {
            const models = data[val];
            const keys = typeof models === 'object' && !Array.isArray(models) ? Object.keys(models).sort() : (Array.isArray(models) ? models.sort() : []);
            keys.forEach(m => { const o = document.createElement("option"); o.value = m; o.textContent = m; modelSelect.appendChild(o); });
            if (keys.length) modelSelect.disabled = false;
        }
        applyRelevance();
    });

    modelSelect.addEventListener("change", () => {
        const data = window._brandModelData;
        const mk = makeSelect.value, md = modelSelect.value;
        variantSelect.innerHTML = '<option value="">Različica</option>';
        variantSelect.disabled = true;
        if (mk && md && data && data[mk]) {
            const variants = getModelVariants(data[mk][md]);
            variants.forEach(v => {
                const trim = typeof v === 'string' ? v : (v && v.trim) ? v.trim : '';
                if (!trim) return;
                const o = document.createElement("option"); o.value = trim; o.textContent = trim;
                variantSelect.appendChild(o);
            });
            if (variants.length) variantSelect.disabled = false;
        }
        // Auto-select the body-type card from the taxonomy (cars only)
        autoSelectBodyType(mk, md);
        // Model picked → narrow engine options to that model (moto)
        applyRelevance();
    });
    
    variantSelect.addEventListener("change", () => {
        const make = makeSelect.value;
        const model = modelSelect.value;
        const variant = variantSelect.value;
        if (make && model && variant) {
            if (addVehicleBtn) {
                addVehicleBtn.click();
            }
        }
    });

    // ── Auto-select the matching VRSTA VOZILA card when a known model is chosen ──
    function autoSelectBodyType(mk, md) {
        if (activeTab !== 'avto') return;
        const canonical = getModelBodyType(window._brandModelData, mk, md);
        if (!canonical) return; // unknown → leave the user's manual selection untouched
        const target = document.querySelector(`#grid-cars .body-type-card[data-value="${canonical}"]`);
        if (!target) return;
        allBodyTypeCards.forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        if (bodyTypeHidden) bodyTypeHidden.value = canonical;
        updateLiveCount();
    }

    function resetSelectors() {
        makeSelect.value = '';
        modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
        variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
        makeSelect.dispatchEvent(new Event('change'));
        modelSelect.dispatchEvent(new Event('change'));
        variantSelect.dispatchEvent(new Event('change'));
    }

    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            const make = makeSelect.value;
            if (!make) return;
            if (vehicles.length >= MAX_VEHICLES) return;
            const model = modelSelect.value || '';
            const variant = variantSelect.value || '';
            vehicles.push({ make, model, variant });
            resetSelectors();
            renderVehicleCards();
            applyRelevance();
            updateLiveCount();
        });
    }

    if (excludeVehicleBtn) {
        excludeVehicleBtn.addEventListener('click', () => {
            const make = makeSelect.value;
            if (!make) return;
            if (excludedVehicles.length >= MAX_VEHICLES) return;
            const model = modelSelect.value || '';
            const variant = variantSelect.value || '';
            excludedVehicles.push({ make, model, variant });
            resetSelectors();
            renderExcludedCards();
            updateLiveCount();
        });
    }

    function makeCardHTML(v, i, zone) {
        const parts = [v.make]; if (v.model) parts.push(v.model); if (v.variant) parts.push(v.variant);
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
                    updateLiveCount();
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
            updateLiveCount();
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
            updateLiveCount();
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
    }

    function renderExcludedCards() {
        if (!excludedVehicleCardsEl) return;
        excludedVehicleCardsEl.innerHTML = excludedVehicles.map((v, i) => makeCardHTML(v, i, 'exclude')).join('');
        excludedVehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => {
            excludedVehicles.splice(+btn.dataset.idx, 1);
            renderExcludedCards();
            updateLiveCount();
        }));
        bindCardDrag(excludedVehicleCardsEl);
        updateExcludedSectionVisibility();
        if (window.lucide) window.lucide.createIcons();
    }

    allBodyTypeCards.forEach(card => card.addEventListener('click', () => {
        if (card.dataset.group) return; // group cards are handled by their own selector
        card.classList.toggle('active');
        const activeValues = Array.from(allBodyTypeCards).filter(btn => btn.classList.contains('active')).map(btn => btn.getAttribute('data-value'));
        if (bodyTypeHidden) bodyTypeHidden.value = activeValues.join(',');
        updateLiveCount();
    }));

    // ── Moto 4/3-wheel group drill-down ──
    const motoGroupSelector = setupMotoGroupSelector({ bodyTypeHidden, onChange: () => updateLiveCount() });

    // ── Commercial (Gospodarska) two-level drill-down: Vrsta → Kategorije ──
    const hiddenVType = document.getElementById('hiddenVType');
    const commercialSelector = setupCommercialSelector({
        bodyTypeHidden,
        hiddenVType,
        onChange: () => { applyRelevance(); updateLiveCount(); },
    });
    // Pre-select a vrsta if the URL carried one (e.g. ?vtype=Kmetijska)
    if (activeTab === 'gospodarska' && catContext.vtype && COMMERCIAL_BY_KEY[catContext.vtype]) {
        commercialSelector.drillInto(catContext.vtype);
    }

    // ── Power Unit Toggle Logic ──
    let activePowerUnit = 'kw';
    const powerUnitToggle = document.getElementById('advPowerUnitToggle');
    const powerFromInput = document.getElementById('powerFromInput');
    const powerToInput = document.getElementById('powerToInput');
    const powerFromLabel = document.getElementById('powerFromLabel');
    const powerToLabel = document.getElementById('powerToLabel');

    if (powerUnitToggle && powerFromInput && powerToInput) {
        const btns = powerUnitToggle.querySelectorAll('.unit-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newUnit = btn.dataset.unit;
                if (newUnit === activePowerUnit) return;

                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Convert current values
                const valFrom = parseFloat(powerFromInput.value);
                const valTo = parseFloat(powerToInput.value);

                if (newUnit === 'km') {
                    // kW -> KM (multiply by 1.35962)
                    if (!isNaN(valFrom)) powerFromInput.value = Math.round(valFrom * 1.35962);
                    if (!isNaN(valTo)) powerToInput.value = Math.round(valTo * 1.35962);
                    
                    // Update Labels and placeholders
                    if (powerFromLabel) powerFromLabel.textContent = 'Moč motorja od (KM)';
                    if (powerToLabel) powerToLabel.textContent = 'Moč motorja do (KM)';
                    powerFromInput.placeholder = '0 KM';
                    powerToInput.placeholder = 'Brez omejitve';
                } else {
                    // KM -> kW (divide by 1.35962)
                    if (!isNaN(valFrom)) powerFromInput.value = Math.round(valFrom / 1.35962);
                    if (!isNaN(valTo)) powerToInput.value = Math.round(valTo / 1.35962);

                    // Update Labels and placeholders
                    if (powerFromLabel) powerFromLabel.textContent = 'Moč motorja od (kW)';
                    if (powerToLabel) powerToLabel.textContent = 'Moč motorja do (kW)';
                    powerFromInput.placeholder = '0 kW';
                    powerToInput.placeholder = 'Brez omejitve';
                }

                activePowerUnit = newUnit;
                updateLiveCount();
            });
        });
    }

    // ── A2 Izpit Toggle Logic ──
    const a2Toggle = document.getElementById('advA2Toggle');
    const a2Input = document.getElementById('a2EligibleInput');
    if (a2Toggle && a2Input) {
        a2Toggle.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                a2Toggle.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                a2Input.value = btn.dataset.a2 === 'yes' ? 'yes' : '';
                updateLiveCount();
            });
        });
    }

    const curYear = new Date().getFullYear();
    for (let y = curYear; y >= 1980; y--) {
        const o1 = document.createElement("option"); o1.value = y; o1.textContent = y; yearFromSelect.appendChild(o1);
        const o2 = document.createElement("option"); o2.value = y; o2.textContent = y; yearToSelect.appendChild(o2);
    }

    async function updateLiveCount() {
        try {
            const fd = new FormData(searchForm);
            const selectedBodyTypes = bodyTypeHidden ? (bodyTypeHidden.value ? bodyTypeHidden.value.split(',') : []) : [];
            
            let powerFromVal = parseFloat(fd.get('powerFrom')) || 0;
            let powerToVal = parseFloat(fd.get('powerTo')) || Infinity;
            if (activePowerUnit === 'km') {
                if (powerFromVal > 0) powerFromVal = Math.round(powerFromVal / 1.35962);
                if (powerToVal !== Infinity) powerToVal = Math.round(powerToVal / 1.35962);
            }

            const filters = {
                vehicles,
                excludedVehicles,
                make: fd.get('make') || '',
                model: fd.get('model') || '',
                variant: fd.get('variant') || '',
                bodyTypes: selectedBodyTypes,
                conditions: fd.getAll('condition'), damaged: fd.get('damaged'),
                fuels: fd.getAll('fuel').filter(Boolean), gears: fd.getAll('transmission').filter(Boolean), drivetrain: fd.getAll('drivetrain'),
                stroke: fd.get('stroke'), cylinders: fd.get('cylinders'), cylinderLayout: fd.get('cylinderLayout'),
                cylFilters: window._cylFilters || [],
                motoDrivetrain: fd.getAll('motoDrivetrain'),
                a2Eligible: fd.get('a2Eligible') || '',
                features: fd.getAll('features'),
                exhaustBrands: fd.getAll('exhaustBrand'),
                exhaustTypes: fd.getAll('exhaustType'),
                priceFrom: parseFormattedNumber(fd.get('priceFrom')), priceTo: parseFormattedNumber(fd.get('priceTo')) || Infinity,
                includeCallForPrice: fd.get('includeCallForPrice') === '1',
                yearFrom: Number(fd.get('yearFrom')) || 0, yearTo: Number(fd.get('yearTo')) || Infinity,
                mileageFrom: parseFormattedNumber(fd.get('mileageFrom')), mileageTo: parseFormattedNumber(fd.get('mileageTo')) || Infinity,
                powerFrom: powerFromVal, powerTo: powerToVal,
                cat: catContext.cat, sub: catContext.sub, searchType: catContext.searchType, vtype: catContext.vtype, najem: catContext.najem, activeTab
            };
            let all = await getListings();
            const count = all.filter(l => matchesFilters(l, filters)).length;
            const btn = document.getElementById("searchBtnText");
            if (btn) btn.textContent = `Show (${count}) listings`;
        } catch (e) { console.warn("Live count error:", e); }
    }

    searchForm.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', updateLiveCount);
        el.addEventListener('input', updateLiveCount);
    });
    setTimeout(updateLiveCount, 100);

    searchForm.addEventListener('reset', () => {
        setTimeout(() => {
            vehicles = [];
            excludedVehicles = [];
            renderVehicleCards();
            renderExcludedCards();
            makeSelect.value = '';
            modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;

            makeSelect.dispatchEvent(new Event('change'));
            modelSelect.dispatchEvent(new Event('change'));
            variantSelect.dispatchEvent(new Event('change'));

            if (exhaustTagsList) exhaustTagsList.innerHTML = '';
            if (exhaustTagsRow) exhaustTagsRow.style.display = 'none';

            allBodyTypeCards.forEach(c => c.classList.remove('active'));
            bodyTypeHidden.value = '';
            if (motoGroupSelector) motoGroupSelector.reset();
            if (commercialSelector) commercialSelector.reset();
            applyRelevance();
            updateLiveCount();
        }, 0);
    });

    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        // Set category to current active tab
        const params = new URLSearchParams();
        params.set('cat', activeTab);
        if (activeTab === catContext.cat) {
            if (catContext.sub) params.set('sub', catContext.sub);
            if (catContext.searchType) params.set('searchType', catContext.searchType);
            if (catContext.vtype) params.set('vtype', catContext.vtype);
            if (catContext.najem) params.set('najem', catContext.najem);
        }

        if (vehicles.length > 0) {
            params.set('vehicles', JSON.stringify(vehicles));
        } else {
            const make = makeSelect.value;
            const model = modelSelect.value;
            const variant = variantSelect.value;
            if (make) params.set('make', make);
            if (model) params.set('model', model);
            if (variant) params.set('variant', variant);
        }
        if (excludedVehicles.length > 0) {
            params.set('excludedVehicles', JSON.stringify(excludedVehicles));
        }

        // Collect selected body types
        const selectedBT = bodyTypeHidden.value;
        if (selectedBT) params.set('bodyTypes', selectedBT);

        const fd = new FormData(searchForm);

        // Price From/To
        const priceFrom = parseFormattedNumber(fd.get('priceFrom'));
        const priceTo = parseFormattedNumber(fd.get('priceTo'));
        if (priceFrom) params.set('priceFrom', priceFrom);
        if (priceTo) params.set('priceTo', priceTo);

        // Year From/To
        const yearFrom = fd.get('yearFrom');
        const yearTo = fd.get('yearTo');
        if (yearFrom) params.set('yearFrom', yearFrom);
        if (yearTo) params.set('yearTo', yearTo);

        // Mileage From/To
        const mileageFrom = parseFormattedNumber(fd.get('mileageFrom'));
        const mileageTo = parseFormattedNumber(fd.get('mileageTo'));
        if (mileageFrom) params.set('mileageFrom', mileageFrom);
        if (mileageTo) params.set('mileageTo', mileageTo);

        // Fuel
        const fuels = fd.getAll('fuel').filter(Boolean);
        if (fuels.length > 0) {
            params.set('fuel', fuels.join(','));
        }

        // Transmission
        const transmission = fd.get('transmission');
        if (transmission) {
            params.set('transmission', transmission);
        }

        // Moto: Prenos moči
        const motoDrivetrains = fd.getAll('motoDrivetrain').filter(Boolean);
        if (motoDrivetrains.length > 0) params.set('motoDrivetrain', motoDrivetrains.join(','));

        const paramStr = params.toString();
        window.location.hash = `/oglasi${paramStr ? '?' + paramStr : ''}`;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Filter matching logic — determines if a listing matches all active filters
// This is the core filtering engine used by both live count and results page.
// When category-specific brand/model data is added later, the vehicleType
// filter here will automatically only show matching vehicles.
// ═══════════════════════════════════════════════════════════════════════════════
function matchesFilters(l, filters) {
    // Parts & tires are listed separately under "Gume in deli" — never show them
    // in the regular vehicle search.
    if (l.itemType && l.itemType !== 'vehicle') return false;

    // Category-level filtering
    if (filters.activeTab) {
        const carCat = (l.category === 'motor' || l.category === 'moto') ? 'moto' : l.category;
        const filterCat = (filters.activeTab === 'motor' || filters.activeTab === 'moto') ? 'moto' : filters.activeTab;
        if (carCat && carCat !== filterCat) return false;
    }

    // Excluded vehicles (AND: listing must not match any excluded entry)
    if (filters.excludedVehicles && filters.excludedVehicles.length > 0) {
        const isExcluded = filters.excludedVehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant && l.title && !l.title.includes(v.variant)) return false;
            return true;
        });
        if (isExcluded) return false;
    }

    // Vehicle multi-match (OR between entries)
    if (filters.vehicles && filters.vehicles.length > 0) {
        const match = filters.vehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant && l.title && !l.title.includes(v.variant)) return false;
            return true;
        });
        if (!match) return false;
    } else {
        // Single vehicle matching
        if (filters.make && l.make !== filters.make) return false;
        if (filters.model && l.model !== filters.model) return false;
        if (filters.variant && l.title && !l.title.includes(filters.variant)) return false;
    }

    // Body Types (OR between tiles)
    if (filters.bodyTypes.length > 0) {
        const typeMatch = filters.bodyTypes.some(type => {
            if (type === 'Damaged') return l.isDamaged || l.condition === 'Poškodovano' || l.damaged === 'only';
            if (type === 'Oldtimer') return l.condition === 'Starodobnik' || (l.year && l.year < 1995);
            if (type === 'EVozila') return ['EMoto', 'ESkiro', 'EKolo'].includes(l.bodyType) || ['EMoto', 'ESkiro', 'EKolo'].includes(l.vehicleType);
            return l.bodyType === type || l.vehicleType === type;
        });
        if (!typeMatch) return false;
    }

    // Motorcycle Specifics
    if (filters.activeTab === 'moto') {
        const stroke = filters.stroke;
        const cylinders = filters.cylinders;
        const layout = filters.cylinderLayout;
        if (stroke && l.stroke !== stroke) return false;
        // Cylinder filter — cylFilters (multi, OR) takes priority over single dropdowns
        const cf = filters.cylFilters && filters.cylFilters.length > 0 ? filters.cylFilters : [];
        const includeFilters = cf.filter(f => !f.exclude);
        const excludeFilters = cf.filter(f => f.exclude);

        function cylMatch(f, l) {
            const cyl = f.cylinders; const lay = f.layout || '';
            if (cyl === 'Wankel') return (l.engine_type || l.engineType || l.stroke || '') === 'Wankel';
            if (l.cylinders !== cyl && String(l.cylinders) !== cyl) return false;
            if (lay) {
                const ec = l.engine_code || '';
                if (lay.endsWith('(vsi)')) {
                    const prefix = lay.replace(' (vsi)', '');
                    return ec === prefix || ec.startsWith(prefix + ' ');
                }
                return ec === lay;
            }
            return true;
        }

        // If no chip filters, fall back to single dropdown values
        if (includeFilters.length === 0 && cf.length === 0 && cylinders) {
            includeFilters.push({ cylinders, layout: layout || '' });
        }
        if (includeFilters.length > 0 && !includeFilters.some(f => cylMatch(f, l))) return false;
        if (excludeFilters.some(f => cylMatch(f, l))) return false;
        // Prenos moči (drivetrain) — OR between checked chips
        if (filters.motoDrivetrain && filters.motoDrivetrain.length > 0) {
            const dt = l.drivetrain || '';
            if (!filters.motoDrivetrain.includes(dt)) return false;
        }
        if (filters.a2Eligible === 'yes' && !l.a2Eligible) return false;
    }

    // Condition chips
    if (filters.conditions.length > 0 && !filters.conditions.includes(l.condition)) return false;

    // Damaged radio
    if (filters.damaged === 'only' && !l.isDamaged && l.damaged !== 'only') return false;
    if (filters.damaged === 'exclude' && (l.isDamaged || l.damaged === 'only')) return false;

    // Price, Year, Mileage
    const isCallForPrice = l.callForPrice || (!l.priceEur && !l.price);
    if (isCallForPrice) {
        if (!filters.includeCallForPrice) return false;
    } else {
        const price = l.priceEur || l.price || 0;
        if (price < filters.priceFrom || (filters.priceTo !== Infinity && price > filters.priceTo)) return false;
    }
    if (l.year < filters.yearFrom || (filters.yearTo !== Infinity && l.year > filters.yearTo)) return false;
    if (l.mileage < filters.mileageFrom || (filters.mileageTo !== Infinity && l.mileage > filters.mileageTo)) return false;

    // Power (kW) filter
    if (l.powerKw !== undefined) {
        if (l.powerKw < filters.powerFrom || (filters.powerTo !== Infinity && l.powerKw > filters.powerTo)) return false;
    } else if (filters.powerFrom > 0) {
        return false;
    }

    // Fuel, Transmission, Drivetrain
    if (filters.fuels.length > 0 && !filters.fuels.includes(l.fuel)) return false;
    if (filters.gears.length > 0 && !filters.gears.includes(l.transmission)) return false;
    if (filters.drivetrain.length > 0 && !filters.drivetrain.includes(l.drivetrain)) return false;

    // Features (Equipment)
    if (filters.features && filters.features.length > 0) {
        if (!l.features || !Array.isArray(l.features)) return false;
        // Listing must have ALL selected features
        const hasAll = filters.features.every(f => l.features.includes(f));
        if (!hasAll) return false;
    }

    // Exhaust sub-filters (only applied when SportExhaust is also selected)
    if (filters.features && filters.features.includes('SportExhaust')) {
        if (filters.exhaustBrands && filters.exhaustBrands.length > 0 && !filters.exhaustBrands.includes(l.exhaustBrand)) return false;
        if (filters.exhaustTypes && filters.exhaustTypes.length > 0 && !filters.exhaustTypes.includes(l.exhaustType)) return false;
    }

    // Rental filter
    if (filters.najem === '1' && !l.isRental) return false;

    return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Moto 4/3-wheel group selector — drill-down from group card into sub-types
// ═══════════════════════════════════════════════════════════════════════════════
function setupMotoGroupSelector({ bodyTypeHidden, onChange }) {
    const mainGrid = document.getElementById('motoMainGrid');
    const subGrid = document.getElementById('motoSubGrid');
    const header = document.getElementById('motoDrillHeader');
    const title = document.getElementById('motoDrillTitle');
    const backBtn = document.getElementById('motoBackBtn');
    const groupCard = document.querySelector('.moto-group-card[data-group="4in3kolesa"]');
    if (!mainGrid || !subGrid || !groupCard) return;

    const selected = new Set();

    function writeFilter() {
        if (!bodyTypeHidden) return;
        const existing = bodyTypeHidden.value
            ? bodyTypeHidden.value.split(',').filter(v => !['ATV','UTV','Trikolesnik','Gocart'].includes(v))
            : [];
        const combined = [...existing, ...selected];
        bodyTypeHidden.value = combined.join(',');
    }

    function showSub() {
        mainGrid.style.display = 'none';
        subGrid.style.display = 'grid';
        if (header) header.style.display = 'flex';
        if (title) title.textContent = '4 in 3 Kolesna motorna vozila';
        if (window.lucide) window.lucide.createIcons();
    }

    function showMain() {
        subGrid.style.display = 'none';
        mainGrid.style.display = 'grid';
        if (header) header.style.display = 'none';
        selected.clear();
        writeFilter();
        if (onChange) onChange();
    }

    groupCard.addEventListener('click', showSub);

    subGrid.querySelectorAll('.body-type-card').forEach(card => {
        card.addEventListener('click', () => {
            const val = card.dataset.value;
            if (selected.has(val)) { selected.delete(val); card.classList.remove('active'); }
            else { selected.add(val); card.classList.add('active'); }
            writeFilter();
            if (onChange) onChange();
        });
    });

    if (backBtn) backBtn.addEventListener('click', showMain);

    return { reset: showMain };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Commercial vehicle selector — two-level drill-down (Vrsta → Kategorije)
// Level 1 shows the vrsta cards. Clicking one drills down in place to that
// vrsta's kategorije, with a back button. Selecting kategorije toggles them as
// active filters; with none selected the vrsta itself is used as the filter.
// ═══════════════════════════════════════════════════════════════════════════════
function setupCommercialSelector({ bodyTypeHidden, hiddenVType, onChange }) {
    const grid = document.getElementById('commercialGrid');
    const header = document.getElementById('commercialDrillHeader');
    const title = document.getElementById('commercialDrillTitle');
    const backBtn = document.getElementById('commercialBackBtn');
    if (!grid) return { renderVrste() {}, drillInto() {}, reset() {} };

    let currentVrsta = null;
    const selected = new Set();

    function refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    function writeFilter() {
        if (!bodyTypeHidden) return;
        if (selected.size > 0) {
            bodyTypeHidden.value = [...selected].join(',');
        } else if (currentVrsta) {
            bodyTypeHidden.value = currentVrsta;
        } else {
            bodyTypeHidden.value = '';
        }
        if (hiddenVType) hiddenVType.value = currentVrsta || '';
    }

    function renderVrste() {
        currentVrsta = null;
        selected.clear();
        if (header) header.style.display = 'none';
        grid.innerHTML = COMMERCIAL_TAXONOMY.map(v => {
            const iconHtml = v.icon && v.icon.startsWith('svg:') 
                ? `<svg class="custom-v-icon"><use href="/icons/vehicles.svg${v.icon.slice(4)}"></use></svg>` 
                : `<i class="${v.icon}"></i>`;
            return `
            <button type="button" class="body-type-card commercial-vrsta-card" data-key="${v.key}">
                ${iconHtml}<span>${v.label}</span>
            </button>`;
        }).join('');
        grid.querySelectorAll('.commercial-vrsta-card').forEach(card => {
            card.addEventListener('click', () => drillInto(card.dataset.key));
        });
        writeFilter();
        refreshIcons();
    }

    function drillInto(key) {
        const vrsta = COMMERCIAL_BY_KEY[key];
        if (!vrsta) return;
        currentVrsta = key;
        selected.clear();
        if (header) header.style.display = 'flex';
        if (title) title.textContent = vrsta.label;
        grid.innerHTML = vrsta.categories.map(cat => {
            const iconHtml = vrsta.icon && vrsta.icon.startsWith('svg:') 
                ? `<svg class="custom-v-icon"><use href="/icons/vehicles.svg${vrsta.icon.slice(4)}"></use></svg>` 
                : `<i class="${vrsta.icon}"></i>`;
            return `
            <button type="button" class="body-type-card commercial-cat-card" data-value="${cat}">
                ${iconHtml}<span>${cat}</span>
            </button>`;
        }).join('');
        grid.querySelectorAll('.commercial-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const val = card.dataset.value;
                if (selected.has(val)) { selected.delete(val); card.classList.remove('active'); }
                else { selected.add(val); card.classList.add('active'); }
                writeFilter();
                if (onChange) onChange();
            });
        });
        writeFilter();
        if (onChange) onChange();
        refreshIcons();
    }

    if (backBtn) backBtn.addEventListener('click', () => {
        renderVrste();
        if (onChange) onChange();
    });

    renderVrste();

    return { renderVrste, drillInto, reset: renderVrste };
}

// ── Hybrid sub-option cascades ────────────────────────────────────────────────
function bindHybridSubOptions() {
    const hibridCheck = document.getElementById('fuelHibridCheck');
    const typeGroup   = document.getElementById('hybridTypeGroup');
    const engineGroup = document.getElementById('hybridEngineGroup');
    if (!hibridCheck || !typeGroup || !engineGroup) return;

    function updateEngineGroup() {
        const anyTypeChecked = [...typeGroup.querySelectorAll('.hybrid-type-check')].some(c => c.checked);
        engineGroup.style.display = anyTypeChecked ? 'block' : 'none';
        if (!anyTypeChecked) engineGroup.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
    }

    hibridCheck.addEventListener('change', () => {
        const show = hibridCheck.checked;
        typeGroup.style.display = show ? 'block' : 'none';
        if (!show) {
            typeGroup.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
            engineGroup.style.display = 'none';
            engineGroup.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
        }
    });

    typeGroup.querySelectorAll('.hybrid-type-check').forEach(c => c.addEventListener('change', updateEngineGroup));
}

// Export for use by oglasi.js if needed
export { matchesFilters, parseHashParams };