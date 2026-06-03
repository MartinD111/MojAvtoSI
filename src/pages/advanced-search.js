// Advanced Search page — MojAvto.si
// Category-aware: reads ?cat=, ?sub=, ?searchType=, ?vtype=, ?najem= from URL
import { getListings } from '../services/listingService.js';
import { resolveCategory, SEARCH_TYPE_OPTIONS } from '../data/categories.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { initCustomSelects } from '../utils/customSelect.js';
import { getModelBodyType, getModelVariants } from '../utils/bodyType.js';

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
    const brandLimitNote = document.getElementById("brandLimitNote");
    const tabBtns = document.querySelectorAll('.tabs-glass .tab-btn');
    const bodyTypeHidden = document.getElementById('bodyTypeHidden');
    const allBodyTypeCards = document.querySelectorAll('.body-type-card');
    const yearFromSelect = document.getElementById("year-from");
    const yearToSelect = document.getElementById("year-to");

    if (!searchForm || !makeSelect) return;

    let activeTab = catContext.cat || 'avto';
    let vehicles = [];
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
            fetchBrandData(activeTab);
            
            // Reset the search form to default
            searchForm.reset();
        });
    });

    // ── Exhaust Brand Sub-dropdown ──
    const exhaustCheck = document.getElementById('sport-exhaust-check');
    const exhaustSub   = document.getElementById('exhaust-brand-sub');
    const exhaustSelect = document.getElementById('exhaust-brand-select');
    if (exhaustCheck && exhaustSub && exhaustSelect) {
        fetch('json/exhaust_brands.json')
            .then(r => r.json())
            .then(brands => {
                brands.forEach(b => {
                    const o = document.createElement('option');
                    o.value = b; o.textContent = b;
                    exhaustSelect.appendChild(o);
                });
            })
            .catch(() => {});
        exhaustCheck.addEventListener('change', () => {
            exhaustSub.style.display = exhaustCheck.checked ? 'block' : 'none';
            if (!exhaustCheck.checked) exhaustSelect.value = '';
            updateLiveCount();
        });
        exhaustSelect.addEventListener('change', updateLiveCount);
    }

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

    fetchBrandData(activeTab);

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

    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            const make = makeSelect.value;
            if (!make) return;
            if (vehicles.length >= MAX_VEHICLES) return;
            const model = modelSelect.value || '';
            const variant = variantSelect.value || '';
            vehicles.push({ make, model, variant });
            makeSelect.value = '';
            modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
            
            // Dispatch dynamic change event for custom select triggers so they reset visually!
            makeSelect.dispatchEvent(new Event('change'));
            modelSelect.dispatchEvent(new Event('change'));
            variantSelect.dispatchEvent(new Event('change'));

            renderVehicleCards();
            updateLiveCount();
        });
    }

    function renderVehicleCards() {
        if (!vehicleCardsEl) return;
        vehicleCardsEl.innerHTML = vehicles.map((v, i) => {
            const parts = [v.make]; if (v.model) parts.push(v.model); if (v.variant) parts.push(v.variant);
            return `<div class="vehicle-entry-card"><div class="vec-info">${parts.map(p => `<span>${p}</span>`).join('<span class="vec-sep">›</span>')}</div><button type="button" class="vec-remove" data-idx="${i}">&times;</button></div>`;
        }).join('');
        
        vehicleCardsEl.querySelectorAll('.vec-remove').forEach(btn => btn.addEventListener('click', () => { 
            vehicles.splice(+btn.dataset.idx, 1); 
            renderVehicleCards(); 
            updateLiveCount(); 
        }));
        
        const atLimit = vehicles.length >= MAX_VEHICLES;
        if (addVehicleBtn) addVehicleBtn.style.display = atLimit ? 'none' : 'flex';
        if (brandLimitNote) brandLimitNote.textContent = atLimit ? 'Omejitev dosežena (3).' : vehicles.length > 0 ? `Dodano: ${vehicles.length}/${MAX_VEHICLES}` : '';
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
                make: fd.get('make') || '',
                model: fd.get('model') || '',
                variant: fd.get('variant') || '',
                bodyTypes: selectedBodyTypes,
                conditions: fd.getAll('condition'), damaged: fd.get('damaged'),
                fuels: fd.getAll('fuel').filter(Boolean), gears: fd.getAll('transmission').filter(Boolean), drivetrain: fd.getAll('drivetrain'),
                stroke: fd.get('stroke'), cylinders: fd.get('cylinders'), cylinderLayout: fd.get('cylinderLayout'),
                a2Eligible: fd.get('a2Eligible') || '',
                features: fd.getAll('features'),
                exhaustBrand: fd.get('exhaustBrand') || '',
                exhaustType: fd.get('exhaustType') || '',
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
            renderVehicleCards();
            makeSelect.value = '';
            modelSelect.innerHTML = '<option value="">Model</option>'; modelSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Različica</option>'; variantSelect.disabled = true;
            
            makeSelect.dispatchEvent(new Event('change'));
            modelSelect.dispatchEvent(new Event('change'));
            variantSelect.dispatchEvent(new Event('change'));
            
            allBodyTypeCards.forEach(c => c.classList.remove('active'));
            bodyTypeHidden.value = '';
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
        if (cylinders) {
            // Count match
            if (l.cylinders !== cylinders && String(l.cylinders) !== cylinders && !String(l.cylinders).startsWith(cylinders)) return false;
            // Layout match (if selected)
            if (layout && l.cylinderLayout !== layout && !String(l.cylinders).includes(layout)) return false;
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
        if (filters.exhaustBrand && l.exhaustBrand !== filters.exhaustBrand) return false;
        if (filters.exhaustType && l.exhaustType !== filters.exhaustType) return false;
    }

    // Rental filter
    if (filters.najem === '1' && !l.isRental) return false;

    return true;
}

// Export for use by oglasi.js if needed
export { matchesFilters, parseHashParams };