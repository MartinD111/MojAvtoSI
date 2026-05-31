// Advanced Search page — MojAvto.si
// Category-aware: reads ?cat=, ?sub=, ?searchType=, ?vtype=, ?najem= from URL
import { getListings } from '../services/listingService.js';
import { resolveCategory, SEARCH_TYPE_OPTIONS } from '../data/categories.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { initCustomSelects } from '../utils/customSelect.js';

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
        'avto': 'grid-cars',
        'moto': 'grid-motorbikes',
        'gospodarska': 'grid-commercial',
        'prosti-cas': 'grid-leisure',
    };
    Object.values(gridMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const targetId = gridMap[tabKey];
    if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.style.display = 'grid';
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
    const vehicleCardsEl = document.getElementById("vehicleCards");
    const selectorRow = document.getElementById("brand-selector-row");
    const brandLimitNote = document.getElementById("brand-limit-note");
    
    const excludeSelect = document.getElementById("excludeMake");
    const excludeModelSelect = document.getElementById("excludeModel");
    const excludeVariantSelect = document.getElementById("excludeVariant");
    const addExcludeBtn = document.getElementById("addExcludeBtn");
    const toggleExcludeBtn = document.getElementById("toggleExcludeBtn");
    const excludeSection = document.getElementById("excludeSection");
    const excludeChipsEl = document.getElementById("excludeChips");

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
                makeSelect.innerHTML = '<option value="">Make</option>';
                if (excludeSelect) excludeSelect.innerHTML = '<option value="">Make</option>';
                const sorted = Object.keys(data).sort();
                sorted.forEach(brand => {
                    const o1 = document.createElement("option"); o1.value = brand; o1.textContent = brand;
                    if (brand === prevMake) o1.selected = true;
                    makeSelect.appendChild(o1);
                    if (excludeSelect) { const o2 = document.createElement("option"); o2.value = brand; o2.textContent = brand; excludeSelect.appendChild(o2); }
                });
                if (!data[prevMake]) {
                    modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
                    variantSelect.innerHTML = '<option value="">Trim</option>'; variantSelect.disabled = true;
                }
                return data;
            });
    }

    // ── Tabs ──
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            allBodyTypeCards.forEach(c => c.classList.remove('active'));
            bodyTypeHidden.value = '';
            activeTab = btn.dataset.tab;
            showGridForTab(activeTab);
            toggleVehicleSpecificFields(activeTab);
            fetchBrandData(activeTab);
            updateLiveCount();
        });
    });

    const cylindersSelect = document.getElementById('moto-cylinders');
    const layoutGroup = document.getElementById('cylinder-layout-group');
    const layoutSelect = document.getElementById('moto-cylinder-layout');
    if (cylindersSelect) {
        cylindersSelect.addEventListener('change', () => {
            const val = cylindersSelect.value;
            if (val === '1') {
                layoutGroup.style.display = 'block';
                layoutSelect.innerHTML = '<option value="">All configurations</option><option value="Single">Single Cylinder</option>';
            } else if (val === '2') {
                layoutGroup.style.display = 'block';
                layoutSelect.innerHTML = '<option value="">All configurations</option><option value="Parallel-twin">Parallel-twin (Inline)</option><option value="V-twin">V-twin</option><option value="Boxer">Flat-twin (Boxer)</option><option value="L-twin">L-twin</option>';
            } else if (val === '3') {
                layoutGroup.style.display = 'block';
                layoutSelect.innerHTML = '<option value="">All configurations</option><option value="Inline-three">Inline-three</option>';
            } else if (val === '4') {
                layoutGroup.style.display = 'block';
                layoutSelect.innerHTML = '<option value="">All configurations</option><option value="Inline-four">Inline-four</option><option value="V4">V4</option><option value="Boxer-four">Flat-four (Boxer)</option>';
            } else if (val === '6') {
                layoutGroup.style.display = 'block';
                layoutSelect.innerHTML = '<option value="">All configurations</option><option value="Inline-six">Inline-six</option><option value="Boxer-six">Flat-six (Boxer)</option>';
            } else {
                layoutGroup.style.display = 'none';
                layoutSelect.innerHTML = '';
            }
            updateLiveCount();
        });
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

    addVehicleBtn.addEventListener('click', () => {
        const make = makeSelect.value;
        if (!make) return;
        if (vehicles.length >= MAX_VEHICLES) return;
        const model = modelSelect.value || '';
        const variant = variantSelect.value || '';
        vehicles.push({ make, model, variant });
        makeSelect.value = '';
        modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
        variantSelect.innerHTML = '<option value="">Trim</option>'; variantSelect.disabled = true;
        renderVehicleCards();
        updateLiveCount();
    });

    function renderVehicleCards() {
        vehicleCardsEl.innerHTML = vehicles.map((v, i) => {
            const parts = [v.make]; if (v.model) parts.push(v.model); if (v.variant) parts.push(v.variant);
            return `<div class="vehicle-entry-card"><div class="vec-info">${parts.map(p => `<span>${p}</span>`).join('<span class="vec-sep">›</span>')}</div><button type="button" class="vec-remove" data-idx="${i}">&times;</button></div>`;
        }).join('');
        vehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => { vehicles.splice(+btn.dataset.idx, 1); renderVehicleCards(); updateLiveCount(); }));
        const atLimit = vehicles.length >= MAX_VEHICLES;
        if (selectorRow) selectorRow.style.display = atLimit ? 'none' : '';
        if (addVehicleBtn) addVehicleBtn.style.display = atLimit ? 'none' : '';
        if (brandLimitNote) brandLimitNote.textContent = atLimit ? 'Limit reached.' : vehicles.length > 0 ? `Added: ${vehicles.length}/${MAX_VEHICLES}` : '';
    }

    function renderExcludeChips() {
        excludeChipsEl.innerHTML = excludedVehicles.map((v, i) => {
            const parts = [v.make]; if (v.model) parts.push(v.model); if (v.variant) parts.push(v.variant);
            return `<div class="vehicle-entry-card" style="background:linear-gradient(135deg, #ef4444, #dc2626) !important; box-shadow:0 6px 15px rgba(239, 68, 68, 0.25);"><div class="vec-info">${parts.map(p => `<span>${p}</span>`).join('<span class="vec-sep">›</span>')}</div><button type="button" class="vec-remove" data-idx="${i}">&times;</button></div>`;
        }).join('');
        excludeChipsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => { excludedVehicles.splice(+btn.dataset.idx, 1); renderExcludeChips(); updateLiveCount(); }));
    }

    fetchBrandData(activeTab);

    makeSelect.addEventListener("change", () => {
        const data = window._brandModelData;
        const val = makeSelect.value;
        modelSelect.innerHTML = '<option value="">Model</option>';
        variantSelect.innerHTML = '<option value="">Trim</option>';
        modelSelect.disabled = true; variantSelect.disabled = true;
        if (val && data && data[val]) {
            const models = data[val];
            const keys = typeof models === 'object' && !Array.isArray(models) ? Object.keys(models).sort() : (Array.isArray(models) ? models.sort() : []);
            keys.forEach(m => { const o = document.createElement("option"); o.value = m; o.textContent = m; modelSelect.appendChild(o); });
            if (keys.length) modelSelect.disabled = false;
        }
    });

    modelSelect.addEventListener("change", () => {
        const data = window._brandModelData;
        const mk = makeSelect.value, md = modelSelect.value;
        variantSelect.innerHTML = '<option value="">Trim</option>';
        variantSelect.disabled = true;
        if (mk && md && data && data[mk] && data[mk][md] && Array.isArray(data[mk][md])) {
            data[mk][md].forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v; variantSelect.appendChild(o); });
            if (data[mk][md].length) variantSelect.disabled = false;
        }
    });

    if (excludeSelect) {
        excludeSelect.addEventListener("change", () => {
            const data = window._brandModelData;
            const mk = excludeSelect.value;
            excludeModelSelect.innerHTML = '<option value="">Model</option>';
            excludeVariantSelect.innerHTML = '<option value="">Trim</option>';
            excludeModelSelect.disabled = true; excludeVariantSelect.disabled = true;
            if (mk && data && data[mk]) {
                Object.keys(data[mk]).sort().forEach(m => {
                    const o = document.createElement("option"); o.value = m; o.textContent = m; excludeModelSelect.appendChild(o);
                });
                excludeModelSelect.disabled = false;
            }
        });
        excludeModelSelect.addEventListener("change", () => {
            const data = window._brandModelData;
            const mk = excludeSelect.value, md = excludeModelSelect.value;
            excludeVariantSelect.innerHTML = '<option value="">Trim</option>';
            excludeVariantSelect.disabled = true;
            if (mk && md && data && data[mk] && data[mk][md] && Array.isArray(data[mk][md])) {
                data[mk][md].forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v; excludeVariantSelect.appendChild(o); });
                if (data[mk][md].length) excludeVariantSelect.disabled = false;
            }
        });
        addExcludeBtn.addEventListener('click', () => {
            const make = excludeSelect.value; if (!make) return;
            const model = excludeModelSelect.value || '';
            const variant = excludeVariantSelect.value || '';
            excludedVehicles.push({ make, model, variant });
            excludeSelect.value = '';
            excludeModelSelect.innerHTML = '<option value="">Model</option>'; excludeModelSelect.disabled = true;
            excludeVariantSelect.innerHTML = '<option value="">Trim</option>'; excludeVariantSelect.disabled = true;
            renderExcludeChips(); updateLiveCount();
        });
    }

    if (toggleExcludeBtn && excludeSection) {
        toggleExcludeBtn.addEventListener('click', () => {
            const isHidden = excludeSection.style.display === 'none';
            excludeSection.style.display = isHidden ? 'flex' : 'none';
            toggleExcludeBtn.style.display = isHidden ? 'none' : 'flex';
        });
    }

    allBodyTypeCards.forEach(card => card.addEventListener('click', () => {
        card.classList.toggle('active');
        const activeValues = Array.from(allBodyTypeCards).filter(btn => btn.classList.contains('active')).map(btn => btn.getAttribute('data-value'));
        if (bodyTypeHidden) bodyTypeHidden.value = activeValues.join(',');
        updateLiveCount();
    }));

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
                vehicles, excludes: excludedVehicles, bodyTypes: selectedBodyTypes,
                conditions: fd.getAll('condition'), damaged: fd.get('damaged'),
                fuels: fd.getAll('fuel').filter(Boolean), gears: fd.getAll('transmission').filter(Boolean), drivetrain: fd.getAll('drivetrain'),
                stroke: fd.get('stroke'), cylinders: fd.get('cylinders'), cylinderLayout: fd.get('cylinderLayout'),
                features: fd.getAll('features'),
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
            vehicles = []; excludedVehicles = [];
            renderVehicleCards(); renderExcludeChips();
            makeSelect.value = '';
            modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Trim</option>'; variantSelect.disabled = true;
            if (excludeSelect) {
                excludeSelect.value = '';
                excludeModelSelect.innerHTML = '<option value="">Model</option>'; excludeModelSelect.disabled = true;
                excludeVariantSelect.innerHTML = '<option value="">Trim</option>'; excludeVariantSelect.disabled = true;
            }
            if (excludeSection) excludeSection.style.display = 'none';
            if (toggleExcludeBtn) toggleExcludeBtn.style.display = 'flex';
            allBodyTypeCards.forEach(c => c.classList.remove('active'));
            bodyTypeHidden.value = '';
            if (hybridSub) { hybridSub.classList.remove('visible'); hybridSub.querySelectorAll('input').forEach(c => c.checked = false); }
            updateLiveCount();
        }, 0);
    });

    searchForm.addEventListener("submit", e => {
        e.preventDefault();
        // Preserve category context in URL when navigating to results
        const params = new URLSearchParams();
        if (catContext.cat) params.set('cat', catContext.cat);
        if (catContext.sub) params.set('sub', catContext.sub);
        if (catContext.searchType) params.set('searchType', catContext.searchType);
        if (catContext.vtype) params.set('vtype', catContext.vtype);
        if (catContext.najem) params.set('najem', catContext.najem);
        params.set('tab', activeTab);

        // Collect selected body types
        const selectedBT = bodyTypeHidden.value;
        if (selectedBT) params.set('bodyTypes', selectedBT);

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
    // Category-level filtering
    if (filters.activeTab) {
        // Map tab to listing category if the listing has a category field
        // This allows filtering by main category once listings carry that metadata
        if (l.category && l.category !== filters.activeTab) return false;
    }

    // Vehicle multi-match (OR between entries)
    if (filters.vehicles.length > 0) {
        const match = filters.vehicles.some(v => {
            if (v.make && l.make !== v.make) return false;
            if (v.model && l.model !== v.model) return false;
            if (v.variant && l.title && !l.title.includes(v.variant)) return false;
            return true;
        });
        if (!match) return false;
    }

    // Excludes (Vehicles)
    if (filters.excludes && filters.excludes.length > 0) {
        const isExcluded = filters.excludes.some(v => {
            if (l.make !== v.make) return false;
            // If model is specified, it must match. If NO model specified, match entire make.
            if (v.model && l.model !== v.model) return false;
            // If variant is specified, it must be contained in the title.
            if (v.variant && l.title && !l.title.includes(v.variant)) return false;
            return true;
        });
        if (isExcluded) return false;
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
        if (cylinders) {
            // Count match
            if (l.cylinders !== cylinders && String(l.cylinders) !== cylinders && !String(l.cylinders).startsWith(cylinders)) return false;
            // Layout match (if selected)
            if (layout && l.cylinderLayout !== layout && !String(l.cylinders).includes(layout)) return false;
        }
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

    // Rental filter
    if (filters.najem === '1' && !l.isRental) return false;

    return true;
}

// Export for use by oglasi.js if needed
export { matchesFilters, parseHashParams };