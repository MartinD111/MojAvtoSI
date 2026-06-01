// ═══════════════════════════════════════════════════════════════════════════════
// Create Listing — Multi-step Controller — MojAvto.si
// ═══════════════════════════════════════════════════════════════════════════════

import { validateVinFormat, decodeVin } from '../services/vinService.js';
import { createListing } from '../services/listingService.js';
import { EQUIPMENT_GROUPS, getEquipmentForCategory } from '../data/equipment.js';
import { auth } from '../firebase.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initCustomSelects, createCustomSelect } from '../utils/customSelect.js';
import { fetchRawListingData } from '../utils/scraper.js';
import { parseListingWithGemini } from '../services/geminiService.js';
import { getCurrentUserDoc } from '../auth/auth.js';
import { t, getCurrentLang } from '../core/i18n.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { getModelBodyType } from '../utils/bodyType.js';

// ── Draft persistence ─────────────────────────────────────────────────────────
const DRAFT_KEY = 'cl_draft';

function saveDraft(state) {
    try {
        const toSave = { ...state };
        delete toSave._exteriorFiles; // Files can't be serialized
        delete toSave._exteriorUrls;
        delete toSave._interiorFiles;
        delete toSave._interiorUrls;
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
    } catch { /* quota exceeded — ignore */ }
}

function loadDraft() {
    try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function clearDraft() {
    sessionStorage.removeItem(DRAFT_KEY);
}

// Formatter functions removed in favor of import from inputFormatters.js
const formatNumberWithCommas = (n) => {
    if (n === null || n === undefined || n === '') return '';
    return new Intl.NumberFormat('en-US').format(parseInt(n.toString().replace(/\D/g, ''), 10) || 0);
};

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
    { id: 'entry', title: null },       // 0: entry mode
    { id: 'vin', title: null, condition: s => s.entryType === 'vin' },
    { id: 'category', title: 'cl_step_category', number: true },
    { id: 'basic', title: 'cl_step_basic', number: true },
    { id: 'technical', title: 'cl_step_technical', number: true },
    { id: 'equipment', title: 'cl_step_features', number: true },
    { id: 'media', title: 'cl_step_photos', number: true },
    { id: 'description', title: 'cl_step_description', number: true },
    { id: 'price', title: 'cl_step_price', number: true },
    { id: 'location', title: 'cl_step_location', number: true },
    { id: 'promotion', title: 'cl_step_visibility', number: true },
    { id: 'review', title: 'cl_step_review', number: true },
    { id: 'auth', title: 'cl_step_signin', condition: () => !auth.currentUser },
];

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
    currentStep: 0,
    entryType: null,
    vin: null,
    vinVerified: false,
    vinData: null,
    vinOverrides: {},
    category: 'avto',
    subcategory: '',
    bodyType: '',
    make: '', model: '', variant: '', year: '', mileageKm: '',
    color: '', colorType: 'solid', doorsCount: '', seatsCount: '',
    condition: 'Rabljeno', firstRegistration: '', previousOwnersCount: '',
    fuel: '', hybridType: null, transmission: '', driveType: '',
    engineCc: '', powerKw: '', co2: '', emissionClass: '',
    fuelL100kmCombined: '', fuelL100kmCity: '', fuelL100kmHighway: '',
    batteryKwh: '', rangeKm: '', towingKg: '', a2Eligible: false,
    equipment: [],
    exhaustBrand: '',
    exhaustType: '',
    _exteriorFiles: [],
    _exteriorUrls: [],
    _interiorFiles: [],
    _interiorUrls: [],
    coverIndex: 0,
    description: '',
    priceEur: '', priceNegotiable: false, priceInclVat: false, leaseAvailable: false, callForPrice: false, priceIsFinal: false,
    sellerType: 'private',
    sellerNote: '',
    businessHours: {},
    leasingConditions: '',
    location: { city: '', postalCode: '', region: '' },
    contact: { name: '', phone: '', showPhone: false, email: '' },
    promotionTier: 'free',
};

let brandModelData = null;

// ── Taxonomy auto-fill helpers (D-08 / D-09) ──────────────────────────────────
/**
 * Normalizes a variant entry (string or object) to { trim, ...specs } shape.
 * Local copy of admin.js normalizeTrimEntry — create-listing does not import from admin.
 */
function normalizeTrimEntryLocal(entry) {
    if (typeof entry === 'string') return { trim: entry };
    if (entry && typeof entry === 'object' && entry.trim) return entry;
    return { trim: String(entry ?? '') };
}

/**
 * Maps taxonomy fuel_type (English) to listing fFuel option values (Slovenian).
 */
const TAX_FUEL_MAP = {
    'Petrol':          'Petrol',
    'Diesel':          'Dizel',
    'Electric':        'Elektrika',
    'Hybrid':          'Hibrid',
    'Plug-in Hybrid':  'Hibrid',
    'LPG':             'LPG',
    'CNG':             'CNG',
    'Hydrogen':        'Vodik',
};

/**
 * Looks up the selected trim in brandModelData and fills state + live DOM fields
 * with tech specs from the matching variant object.
 *
 * Auto-fill rules (D-09):
 * - Only fills if variant is an object with specs (string variants do nothing)
 * - Sets state properties for fields that have values in the variant object
 * - Does NOT overwrite fields the user already manually changed this session
 *   (tracked via state._manualFields Set)
 * - Fires immediately on trim selection change
 */
function applyTrimAutoFill(selectedTrim, make, model) {
    if (!selectedTrim || !make || !model || !brandModelData) return;

    const modelData = brandModelData[make];
    if (!modelData) return;

    let variantsList;
    if (Array.isArray(modelData[model])) {
        variantsList = modelData[model];  // avto: direct array
    } else if (modelData[model] && Array.isArray(modelData[model].variants)) {
        variantsList = modelData[model].variants;  // moto/commercial
    } else {
        return;
    }

    const matched = variantsList.find(v => normalizeTrimEntryLocal(v).trim === selectedTrim);
    if (!matched || typeof matched === 'string') return;  // no specs to fill

    const specs = normalizeTrimEntryLocal(matched);
    const hasSpecs = Object.keys(specs).some(k => k !== 'trim' && specs[k] != null && specs[k] !== '');
    if (!hasSpecs) return;

    if (!state._autoFillFields) state._autoFillFields = new Set();

    // Helper: fill a state key and optionally a live DOM element, only if user hasn't manually changed it
    const fillField = (stateKey, value, domId) => {
        if (value == null || value === '') return;
        if (state._manualFields && state._manualFields.has(stateKey)) return;
        state[stateKey] = value;
        state._autoFillFields.add(stateKey);
        const el = domId ? document.getElementById(domId) : null;
        if (el) {
            el.value = value;
            el.classList.add('cl-autofilled');
        }
    };

    // Map taxonomy fuel_type → listing state.fuel
    if (specs.fuel_type) {
        const mappedFuel = TAX_FUEL_MAP[specs.fuel_type] || specs.fuel_type;
        fillField('fuel', mappedFuel, 'fFuel');

        const fuelEl = document.getElementById('fFuel');
        if (fuelEl && fuelEl.value) {
            const isEV = fuelEl.value === 'Elektrika';
            document.getElementById('elFields')?.classList.toggle('visible', isEV);
            document.getElementById('consumptionFields')?.classList.toggle('visible', !isEV && fuelEl.value !== '');
            document.getElementById('hybridFields')?.classList.toggle('visible', fuelEl.value === 'Hibrid');
        }
    }

    if (specs.engine_capacity_cc != null) fillField('engineCc', specs.engine_capacity_cc, 'fEngineCC');
    if (specs.fuel_consumption_city)     fillField('fuelL100kmCity',     specs.fuel_consumption_city,     'fConsCity');
    if (specs.fuel_consumption_highway)  fillField('fuelL100kmHighway',  specs.fuel_consumption_highway,  'fConsHighway');
    if (specs.fuel_consumption_combined) fillField('fuelL100kmCombined', specs.fuel_consumption_combined, 'fConsCombined');
    if (specs.electric_range_km)         fillField('rangeKm',            specs.electric_range_km,         'fRange');
    // Commercial: fuel_consumption maps to fuelL100kmCombined (closest listing field)
    if (specs.fuel_consumption)          fillField('fuelL100kmCombined', specs.fuel_consumption, 'fConsCombined');
}

// ── Body type (vrsta vozila) auto-fill ────────────────────────────────────────
/**
 * Auto-fills state.bodyType from the taxonomy when a model is selected, and
 * pre-selects the matching subcategory pill — unless the user has manually
 * changed the body type this session (tracked via state._bodyTypeManual).
 * If the taxonomy has no body_type for this model, nothing is overwritten so
 * the manual category selection remains the source of truth.
 */
function applyBodyTypeAutoFill(make, model) {
    if (state._bodyTypeManual) return;
    const canonical = getModelBodyType(brandModelData, make, model);
    if (!canonical) return;
    state.bodyType = canonical;
    state.subcategory = canonical;
    state._autoFillFields?.add?.('bodyType');
}

// ── Init ──────────────────────────────────────────────────────────────────────
export async function initCreateListingPage() {
    console.log('[CreateListing] init');

    // Load brands JSON in background
    fetch('json/brands_models_global.json')
        .then(r => r.json())
        .then(d => { brandModelData = d; })
        .catch(() => { });

    // Restore draft if available
    const saved = loadDraft();
    if (saved) {
        const restore = confirm('Najden je nedokončan oglas. Ali ga želite nadaljevati?');
        if (restore) {
            Object.assign(state, saved);
            state._exteriorFiles = [];
            state._exteriorUrls = [];
            state._interiorFiles = [];
            state._interiorUrls = [];
        } else {
            clearDraft();
        }
    }

    // Check if user is logged in to pre-set seller type
    if (auth.currentUser) {
        try {
            const userDoc = await getCurrentUserDoc();
            if (userDoc && userDoc.sellerType) {
                state.sellerType = userDoc.sellerType;
            }
        } catch (e) {
            console.error('[CreateListing] Fetch user profile failed:', e);
        }
    }

    renderCurrentStep();
}

// ── Active steps (filter by conditions) ──────────────────────────────────────
function getActiveSteps() {
    return STEPS.filter(s => !s.condition || s.condition(state));
}

function getNumberedSteps() {
    return getActiveSteps().filter(s => s.number);
}

function currentStepDef() {
    return getActiveSteps()[state.currentStep] || STEPS[0];
}

// ── Progress bar update ───────────────────────────────────────────────────────
function updateProgress() {
    const progress = document.getElementById('clProgress');
    const fill = document.getElementById('clProgressFill');
    const label = document.getElementById('clProgressLabel');
    if (!progress) return;

    const active = getActiveSteps();
    const numbered = active.filter(s => s.number);
    const def = currentStepDef();

    if (!def.number) {
        progress.style.display = 'none';
        return;
    }

    const idx = numbered.indexOf(def);
    const pct = numbered.length > 1 ? Math.round((idx / (numbered.length - 1)) * 100) : 100;

    progress.style.display = 'flex';
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `${t('cl_step_korak')} ${idx + 1} / ${numbered.length}`;
}

// ── Main render dispatcher ────────────────────────────────────────────────────
function renderCurrentStep() {
    const def = currentStepDef();
    updateProgress();

    const renderers = {
        entry: renderEntryStep,
        vin: renderVinStep,
        category: renderCategoryStep,
        basic: renderBasicStep,
        technical: renderTechnicalStep,
        equipment: renderEquipmentStep,
        media: renderMediaStep,
        description: renderDescriptionStep,
        price: renderPriceStep,
        location: renderLocationStep,
        promotion: renderPromotionStep,
        review: renderReviewStep,
        auth: renderAuthStep,
    };

    const fn = renderers[def.id];
    if (fn) fn();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
}

function goNext() {
    saveDraft(state);
    const active = getActiveSteps();
    if (state.currentStep < active.length - 1) {
        state.currentStep++;
        renderCurrentStep();
    }
}

function goPrev() {
    saveDraft(state);
    if (state.currentStep > 0) {
        state.currentStep--;
        renderCurrentStep();
    }
}

function jumpToStep(id) {
    const active = getActiveSteps();
    const idx = active.findIndex(s => s.id === id);
    if (idx >= 0) {
        state.currentStep = idx;
        renderCurrentStep();
    }
}

// ── Step 0: Entry mode ────────────────────────────────────────────────────────
function renderEntryStep() {
    setHtml(`
        <div class="cl-card">
            <h1 class="cl-step-title">${t('cl_step_entry_title')}</h1>
            <p class="cl-step-sub">${t('cl_step_entry_sub')}</p>

            <div class="cl-field" style="margin-bottom:1.5rem;">
                <label class="cl-label">${t('cl_seller_type')}</label>
                ${auth.currentUser
            ? `<div style="padding:0.75rem 1rem;background:rgba(255,255,255,0.4);backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,0.5);border-radius:12px;display:flex;align-items:center;gap:0.75rem;font-weight:600;">
                         ${state.sellerType === 'business' ? '🏢 ' + t('cl_business_dealership') : '👤 ' + t('cl_private_seller')}
                         <span style="font-size:0.75rem;color:#64748b;font-weight:400;margin-left:auto;">${t('cl_signed_in_as')} ${auth.currentUser.displayName || auth.currentUser.email}</span>
                       </div>`
            : `<div class="cl-seller-toggle">
                        <button class="cl-seller-btn ${state.sellerType === 'private' ? 'active' : ''}" data-type="private">
                            👤 ${t('cl_private_seller')}
                        </button>
                        <button class="cl-seller-btn ${state.sellerType === 'business' ? 'active' : ''}" data-type="business">
                            🏢 ${t('cl_business_dealership')}
                        </button>
                    </div>`
        }
            </div>

            <!-- Smart Import -->
            <div class="cl-smart-import" id="smartImportBox">
                <div class="cl-smart-import-header">
                    <i data-lucide="wand-2"></i>
                    <span>${t('cl_smart_import_title')}</span>
                    <span class="cl-smart-import-badge">AI</span>
                </div>
                <p class="cl-smart-import-hint">${t('cl_smart_import_hint')}</p>
                <div class="cl-smart-import-row">
                    <input id="importUrlInput" type="url" class="cl-input" placeholder="${t('cl_smart_import_placeholder')}">
                    <button id="btnSmartImport" class="cl-btn cl-btn--primary">${t('cl_import')}</button>
                </div>
                <div id="importLoader" style="display:none;" class="cl-smart-import-loader">
                    <i data-lucide="loader-2" class="cl-spin"></i>
                    <span id="importLoaderText">${t('cl_ai_analyzing')}</span>
                </div>
                <div id="importWarning" style="display:none;" class="cl-smart-import-warning">
                    ✅ ${t('cl_import_success')}
                </div>
                <div id="importError" style="display:none;" class="cl-smart-import-error"></div>
            </div>

            <div class="cl-entry-cards">
                <div class="cl-entry-card" id="entryClassic">
                    <span class="cl-entry-card-icon">📋</span>
                    <p class="cl-entry-card-title">${t('cl_manual_entry')}</p>
                    <p class="cl-entry-card-desc">${t('cl_manual_entry_desc')}</p>
                    <ul class="cl-entry-card-features">
                        <li>${t('cl_manual_entry_older')}</li>
                        <li>${t('cl_manual_entry_imported')}</li>
                        <li>${t('cl_always_free')}</li>
                    </ul>
                </div>
                <div class="cl-entry-card recommended" id="entryVin">
                    <span class="cl-entry-card-badge">${t('cl_recommended')}</span>
                    <span class="cl-entry-card-icon">🛡</span>
                    <p class="cl-entry-card-title">${t('cl_verified_entry')}</p>
                    <p class="cl-entry-card-desc">${t('cl_verified_entry_desc')}</p>
                    <ul class="cl-entry-card-features">
                        <li>${t('cl_higher_confidence')}</li>
                        <li>${t('cl_auto_fill')}</li>
                        <li>${t('cl_vehicle_history')}</li>
                    </ul>
                </div>
            </div>
        </div>
    `);

    document.querySelectorAll('.cl-seller-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cl-seller-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sellerType = btn.dataset.type;
        });
    });

    document.getElementById('entryClassic').addEventListener('click', () => {
        state.entryType = 'classic';
        state.vinVerified = false;
        goNext();
    });

    document.getElementById('entryVin').addEventListener('click', () => {
        state.entryType = 'vin';
        goNext();
    });

    document.getElementById('btnSmartImport')?.addEventListener('click', runSmartImport);
}

// ── Smart Import ──────────────────────────────────────────────────────────────
async function runSmartImport() {
    const urlInput = document.getElementById('importUrlInput');
    const loader = document.getElementById('importLoader');
    const loaderTxt = document.getElementById('importLoaderText');
    const warning = document.getElementById('importWarning');
    const errorEl = document.getElementById('importError');
    const btn = document.getElementById('btnSmartImport');

    const url = urlInput?.value?.trim();
    if (!url || !url.startsWith('http')) {
        showImportError(errorEl, t('cl_import_url_error'));
        return;
    }

    // UI: loading state
    btn.disabled = true;
    if (loader) loader.style.display = 'flex';
    if (warning) warning.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    try {
        // Step 1: fetch raw text via CORS proxy
        if (loaderTxt) loaderTxt.textContent = 'Pridobivam vsebino oglasa...';
        const rawText = await fetchRawListingData(url);

        // Step 2: collect allowed values from local data
        const allowedBrands = brandModelData ? Object.keys(brandModelData) : [];
        const allowedSlugs = EQUIPMENT_GROUPS.flatMap(g => g.items.map(i => i.value));

        // Step 3: send to Gemini
        if (loaderTxt) loaderTxt.textContent = 'AI is analyzing the listing...';
        const parsed = await parseListingWithGemini(rawText, allowedBrands, allowedSlugs);

        // Step 4: apply to state
        applyImportedData(parsed);

        // UI: success
        if (loader) loader.style.display = 'none';
        if (warning) warning.style.display = 'block';

    } catch (err) {
        console.error('[SmartImport]', err);
        if (loader) loader.style.display = 'none';
        showImportError(errorEl, t('cl_import_failed') + ' (' + err.message + ')');
    } finally {
        btn.disabled = false;
    }
}

function showImportError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
}

function applyImportedData(d) {
    if (!d || typeof d !== 'object') return;

    // Basic fields → state (steps will read from state when rendered)
    if (d.brand) state.make = d.brand;
    if (d.model) state.model = d.model;
    if (d.year) state.year = Number(d.year);
    if (d.mileage) state.mileageKm = Number(d.mileage);
    if (d.fuel) state.fuel = d.fuel;
    if (d.transmission) state.transmission = d.transmission;
    if (d.powerKw) state.powerKw = Number(d.powerKw);
    if (d.price) state.priceEur = Number(d.price);

    // Equipment — merge with existing selection
    if (Array.isArray(d.equipment) && d.equipment.length) {
        const existing = new Set(state.equipment);
        d.equipment.forEach(s => existing.add(s));
        state.equipment = [...existing];
    }

    // Mark state as imported so steps can highlight fields
    state._imported = d;

    saveDraft(state);
}

// ── Step 1: VIN input (conditional) ──────────────────────────────────────────
function renderVinStep() {
    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">🛡 ${t('cl_vin_title')}</h2>
            <p class="cl-step-sub">${t('cl_vin_sub')}</p>

            <div class="cl-field">
                <label class="cl-label">${t('cl_vin_label')} <span class="req">*</span></label>
                <div class="cl-vin-wrap">
                    <input class="cl-input" id="vinInput" type="text" maxlength="17"
                        placeholder="npr. WVWZZZ1KZ9W012345"
                        value="${state.vin || ''}" autocomplete="off" spellcheck="false" />
                    <button class="cl-btn cl-btn--primary" id="btnVerifyVin" disabled>
                        <i data-lucide="search"></i> ${t('cl_verify')}
                    </button>
                </div>
                <span id="vinError" style="color:#dc2626;font-size:0.8rem;display:none;"></span>
            </div>

            <div class="cl-vin-hint">
                <strong>${t('cl_vin_hint_title')}</strong><br>
                • ${t('cl_vin_hint_1')}<br>
                • ${t('cl_vin_hint_2')}<br>
                • ${t('cl_vin_hint_3')}
            </div>

            <div id="vinResultArea"></div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnVinBack">${t('cl_back')}</button>
            </div>
        </div>
    `);

    const input = document.getElementById('vinInput');
    const btn = document.getElementById('btnVerifyVin');
    const errEl = document.getElementById('vinError');

    input.addEventListener('input', () => {
        const val = input.value.trim().toUpperCase();
        input.value = val;
        const { valid, message } = validateVinFormat(val);
        btn.disabled = !valid;
        errEl.textContent = val.length > 0 && !valid ? message : '';
        errEl.style.display = (val.length > 0 && !valid) ? 'block' : 'none';
    });

    btn.addEventListener('click', () => runVinDecode(input.value.trim().toUpperCase()));
    document.getElementById('btnVinBack').addEventListener('click', goPrev);

    // If VIN already verified, show result immediately
    if (state.vinVerified && state.vinData) {
        renderVinResult(state.vin, state.vinData);
    }
}

async function runVinDecode(vin) {
    const area = document.getElementById('vinResultArea');
    const btn = document.getElementById('btnVerifyVin');
    btn.disabled = true;

    area.innerHTML = `
        <div class="cl-vin-loading" style="margin-top:1.5rem;">
            <div class="cl-vin-spinner"></div>
            <p class="cl-vin-loading-label">${t('cl_vin_verifying')}</p>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    const result = await decodeVin(vin);

    if (!result.success) {
        area.innerHTML = `
            <div class="cl-vin-error" style="margin-top:1.25rem;">
                <p>${t('cl_vin_not_found')}</p>
                <small>${result.message}</small>
            </div>
            <div class="cl-nav" style="margin-top:1rem;">
                <button class="cl-btn cl-btn--ghost" id="btnRetryVin">${t('cl_retry')}</button>
                <button class="cl-btn cl-btn--secondary" id="btnFallbackClassic">${t('cl_continue_without_vin')}</button>
            </div>`;
        document.getElementById('btnRetryVin')?.addEventListener('click', () => {
            area.innerHTML = '';
            btn.disabled = false;
        });
        document.getElementById('btnFallbackClassic')?.addEventListener('click', () => {
            state.entryType = 'classic';
            state.vinVerified = false;
            goNext();
        });
        btn.disabled = false;
        return;
    }

    state.vin = result.vin;
    state.vinData = result.data;
    state.vinVerified = true;

    // Pre-fill basic data from VIN
    if (result.data.make) state.make = result.data.make;
    if (result.data.model) state.model = result.data.model;
    if (result.data.year) state.year = result.data.year;
    if (result.data.engineType) state.fuel = mapVinFuel(result.data.engineType);
    if (result.data.powerKw) state.powerKw = result.data.powerKw;
    if (result.data.engineCc) state.engineCc = result.data.engineCc;

    renderVinResult(result.vin, result.data);
    btn.disabled = false;
    if (window.lucide) window.lucide.createIcons();
}

function renderVinResult(vin, data) {
    const area = document.getElementById('vinResultArea');
    if (!area) return;

    const accidentText = () => {
        if (data.accidentCount === null) return { text: t('cl_ni_podatka'), cls: '' };
        if (data.accidentCount === 0) return { text: t('cl_ni_zabelezenih'), cls: 'clean' };
        return { text: t('cl_accidents_recorded').replace('{count}', data.accidentCount), cls: data.accidentSeverity === 'major' ? 'danger' : 'warn' };
    };

    const recall = data.hasOpenRecalls ? { text: t('cl_recalls_open'), cls: 'danger' } : { text: t('cl_recalls_none'), cls: 'clean' };
    const owners = data.previousOwners !== null ? data.previousOwners : '—';
    const acc = accidentText();
    const partialNote = data.partial ? `
        <div class="cl-vin-partial-note">
            ⚠ ${t('cl_partial_note')}
        </div>` : '';

    area.innerHTML = `
        <div class="cl-vin-result" style="margin-top:1.25rem;">
            <div class="cl-vin-result-header">
                <span class="cl-vin-badge"><i data-lucide="shield-check"></i> ${t('cl_vin_verified_badge')}</span>
                <span class="cl-vin-code">${vin}</span>
            </div>
            <div class="cl-vin-rows">
                <div class="cl-vin-row"><span class="cl-vin-row-icon">🏭</span><span class="cl-vin-row-label">${t('cl_make')}</span><span class="cl-vin-row-value">${data.make || '—'}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">🚗</span><span class="cl-vin-row-label">${t('cl_model')}</span><span class="cl-vin-row-value">${data.model || '—'}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">📅</span><span class="cl-vin-row-label">${t('cl_year')}</span><span class="cl-vin-row-value">${data.year || '—'}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">⚙️</span><span class="cl-vin-row-label">${t('cl_engine')}</span><span class="cl-vin-row-value">${data.engineType || '—'}${data.powerKw ? ' / ' + Math.round(data.powerKw * 1.34102) + ' ' + t('cl_hp') : ''}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">🌍</span><span class="cl-vin-row-label">${t('cl_country_origin')}</span><span class="cl-vin-row-value">${data.countryOfOrigin || '—'}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">👤</span><span class="cl-vin-row-label">${t('cl_prev_owners')}</span><span class="cl-vin-row-value">${owners}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">💥</span><span class="cl-vin-row-label">${t('cl_accidents')}</span><span class="cl-vin-row-value ${acc.cls}">${acc.text}</span></div>
                <div class="cl-vin-row"><span class="cl-vin-row-icon">🔔</span><span class="cl-vin-row-label">${t('cl_recalls')}</span><span class="cl-vin-row-value ${recall.cls}">${recall.text}</span></div>
            </div>
        </div>
        ${partialNote}
        <div class="cl-nav" style="margin-top:1.25rem;">
            <span></span>
            <button class="cl-btn cl-btn--primary" id="btnVinAccept">
                ${t('cl_accept_continue')}
            </button>
        </div>`;

    document.getElementById('btnVinAccept')?.addEventListener('click', () => {
        goNext();
    });

    if (window.lucide) window.lucide.createIcons();
}

function mapVinFuel(engineType) {
    const map = { 'Dizel': 'Dizel', 'Petrol': 'Petrol', 'Diesel': 'Dizel', 'Bencin': 'Petrol', 'Electric': 'Elektrika', 'Hybrid': 'Hibrid' };
    return map[engineType] || engineType;
}

// ── Step 2: Category ──────────────────────────────────────────────────────────
const CATEGORIES = [
    {
        id: 'avto',
        label: 'cl_cat_avto',
        icon: 'car',
        subs: [
            { name: 'cl_sub_limuzina', value: 'Limuzina', icon: 'car' },
            { name: 'cl_sub_suv', value: 'Terensko', icon: 'mountain' },
            { name: 'cl_sub_karavan', value: 'Karavan', icon: 'layout-template' },
            { name: 'cl_sub_kombilimuzina', value: 'Kombilimuzina', icon: 'car' },
            { name: 'cl_sub_kabriolet', value: 'Kabriolet', icon: 'sun' },
            { name: 'cl_sub_coupe', value: 'Coupe', icon: 'zap' },
            { name: 'cl_sub_enoprostorec', value: 'Enoprostorec', icon: 'users' },
            { name: 'cl_sub_pickup', value: 'Pick-up', icon: 'truck' },
            { name: 'cl_sub_oldtimer', value: 'Oldtimer', icon: 'history' }
        ]
    },
    {
        id: 'moto',
        label: 'cl_cat_moto',
        icon: 'bike',
        subs: [
            { name: 'cl_sub_motocikel', value: 'SportniMotor', icon: 'bike' },
            { name: 'cl_sub_sport_tourer', value: 'SportniTourer', icon: 'map-pin' },
            { name: 'cl_sub_adventure', value: 'Adventure', icon: 'mountain' },
            { name: 'cl_sub_skuter', value: 'Skuter', icon: 'car' },
            { name: 'cl_sub_enduro', value: 'Enduro', icon: 'mountain' },
            { name: 'cl_sub_chopper', value: 'Chopper', icon: 'wind' },
            { name: 'cl_sub_tourer', value: 'Tourer', icon: 'map' },
            { name: 'cl_sub_atv_utv', value: 'atv_utv', icon: 'maximize' },
            { name: 'cl_sub_emoto', value: 'EMoto', icon: 'zap' }
        ]
    },
    {
        id: 'gospodarska',
        label: 'cl_cat_gospodarska',
        icon: 'truck',
        subs: [
            { name: 'cl_sub_dostavna', icon: 'package' },
            { name: 'cl_sub_tovorna', icon: 'truck' },
            { name: 'cl_sub_avtobus', icon: 'users' },
            { name: 'cl_sub_prikolice', icon: 'link' }
        ]
    },
    {
        id: 'mehanizacija',
        label: 'cl_cat_mehanizacija',
        icon: 'tractor',
        subs: [
            { name: 'cl_sub_construction', icon: 'hammer' },
            { name: 'cl_sub_agricultural', icon: 'tractor' },
            { name: 'cl_sub_forklifts', icon: 'chevrons-up' },
            { name: 'cl_sub_municipal', icon: 'trash-2' }
        ]
    },
    {
        id: 'prosti-cas',
        label: 'cl_cat_prosti_cas',
        icon: 'palmtree',
        subs: [
            { name: 'cl_sub_avtodom', icon: 'home' },
            { name: 'cl_sub_pocitniska', icon: 'box' },
            { name: 'cl_sub_mobilna', icon: 'home' },
            { name: 'cl_sub_sotorska', icon: 'tent' }
        ]
    },
    { id: 'deli', label: 'cl_cat_deli', icon: 'wrench', subs: [] },
];

function renderCategoryStep() {
    const catCards = CATEGORIES.map(c => `
        <div class="cl-category-card ${state.category === c.id ? 'selected' : ''}" data-cat="${c.id}">
            <i data-lucide="${c.icon}"></i>
            <span>${t(c.label)}</span>
        </div>`).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_category_title')}</h2>
            <p class="cl-step-sub">${t('cl_category_sub')}</p>

            <div class="cl-category-grid">${catCards}</div>

            <div id="subRow" class="cl-subcategory-row" style="margin-bottom:1.25rem;"></div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnCatBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnCatNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();
    renderSubcategories();

    document.querySelectorAll('.cl-category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.cl-category-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.category = card.dataset.cat;
            state.subcategory = '';
            renderSubcategories();
        });
    });

    document.getElementById('btnCatBack').addEventListener('click', goPrev);
    document.getElementById('btnCatNext').addEventListener('click', () => {
        if (!state.category) return alert(t('cl_select_category_alert'));
        goNext();
    });
}

function renderSubcategories() {
    const row = document.getElementById('subRow');
    if (!row) return;
    const cat = CATEGORIES.find(c => c.id === state.category);
    if (!cat || cat.subs.length === 0) { row.innerHTML = ''; return; }

    row.innerHTML = cat.subs.map(s => `
        <button class="cl-subcategory-pill ${state.subcategory === (s.value || s.name) ? 'selected' : ''}" data-sub="${s.value || s.name}">
            <i data-lucide="${s.icon}" class="cl-sub-icon"></i>
            ${t(s.name)}
        </button>`).join('');

    if (window.lucide) window.lucide.createIcons({ scope: row });

    row.querySelectorAll('.cl-subcategory-pill').forEach(p => {
        p.addEventListener('click', () => {
            row.querySelectorAll('.cl-subcategory-pill').forEach(pp => pp.classList.remove('selected'));
            p.classList.add('selected');
            state.subcategory = p.dataset.sub;
            // For cars, the subcategory IS the body type — manual pick wins over taxonomy auto-fill
            if (state.category === 'avto') {
                state.bodyType = p.dataset.sub;
                state._bodyTypeManual = true;
            }
        });
    });
}

// ── Step 3: Basic data ────────────────────────────────────────────────────────
function renderBasicStep() {
    const years = [];
    for (let y = new Date().getFullYear() + 1; y >= 1960; y--) years.push(y);

    const isVin = state.vinVerified;

    function field(id, label, value, locked) {
        const lockBadge = locked
            ? `<span class="cl-field-badge cl-field-badge--locked"><i data-lucide="lock"></i> Verified (VIN)</span>`
            : '';
        return `
            <div class="cl-field ${locked ? 'cl-field--locked' : ''}">
                <label class="cl-label">${label} <span class="req">*</span></label>
                <input class="cl-input" id="${id}" type="text" value="${escHtml(String(value || ''))}" ${locked ? 'readonly' : ''} />
                ${lockBadge}
            </div>`;
    }

    const COLORS = ['Bela', 'Črna', 'Siva', 'Srebrna', 'Modra', 'Rdeča', 'Zelena', 'Rumena', 'Rjava', 'Oranžna', 'Vijolična', 'Zlata', 'Bronasta', 'Druga'];

    const makeLocked = isVin && !state.vinOverrides?.make;
    const modelLocked = isVin && !state.vinOverrides?.model;
    const yearLocked = isVin && !state.vinOverrides?.year;

    const yearOpts = years.map(y => `<option value="${y}" ${Number(state.year) === y ? 'selected' : ''}>${y}</option>`).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_basic_title')}</h2>
            <p class="cl-step-sub">${t('cl_basic_sub')}</p>

            <div class="cl-row">
                <div class="cl-field ${makeLocked ? 'cl-field--locked' : ''}">
                    <label class="cl-label">${t('cl_label_make')} <span class="req">*</span></label>
                    <select class="cl-select" id="fMake" ${makeLocked ? 'disabled' : ''}>
                        <option value="">${t('cl_sel_make')}</option>
                    </select>
                    ${makeLocked ? `<span class="cl-field-badge cl-field-badge--locked"><i data-lucide="lock"></i> ${t('cl_verified_vin')}</span>` : ''}
                </div>
                <div class="cl-field ${modelLocked ? 'cl-field--locked' : ''}">
                    <label class="cl-label">${t('cl_label_model')} <span class="req">*</span></label>
                    <select class="cl-select" id="fModel" ${modelLocked ? 'disabled' : ''}>
                        <option value="">${t('cl_sel_model_first')}</option>
                    </select>
                    ${modelLocked ? `<span class="cl-field-badge cl-field-badge--locked"><i data-lucide="lock"></i> ${t('cl_verified_vin')}</span>` : ''}
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field ${yearLocked ? 'cl-field--locked' : ''}">
                    <label class="cl-label">${t('cl_label_year')} <span class="req">*</span></label>
                    <select class="cl-select" id="fYear" ${yearLocked ? 'disabled' : ''}>
                        <option value="">${t('cl_sel_year')}</option>${yearOpts}
                    </select>
                    ${yearLocked ? `<span class="cl-field-badge cl-field-badge--locked"><i data-lucide="lock"></i> ${t('cl_verified_vin')}</span>` : ''}
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_variant')}</label>
                    <select class="cl-select" id="fVariant">
                        <option value="">${t('cl_sel_trim')}</option>
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_mileage')} <span class="req">*</span></label>
                    <div class="cl-mileage-wrap">
                        <input class="cl-input" id="fMileage" type="text"
                            value="${state.mileageKm ? formatNumberWithCommas(state.mileageKm) : ''}"
                            placeholder="${t('cl_placeholder_mileage')}" autocomplete="off" />
                        <span class="cl-mileage-unit">km</span>
                    </div>
                </div>

                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_color')}</label>
                    <select class="cl-select" id="fColor">
                        <option value="">${t('cl_sel_color') || 'Select color'}</option>
                        ${COLORS.map(c => `<option value="${c}" ${state.color === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_condition')} <span class="req">*</span></label>
                    <select class="cl-select" id="fCondition">
                        ${[
                            ['Rabljeno', t('cl_condition_used')],
                            ['Novo', t('cl_condition_new')],
                            ['Razstavno vozilo', t('cl_condition_demo')],
                            ['Starodobnik', t('cl_condition_classic')],
                            ['Za dele', t('cl_condition_for_parts')]
                        ].map(([v, l]) =>
                            `<option value="${v}" ${state.condition === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_paint')}</label>
                    <select class="cl-select" id="fColorType">
                        ${[
                            ['solid', t('cl_paint_solid')],
                            ['metallic', t('cl_paint_metallic')],
                            ['matte', t('cl_paint_matte')],
                            ['pearl', t('cl_paint_pearl')]
                        ].map(([v, l]) =>
                            `<option value="${v}" ${state.colorType === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_doors')}</label>
                    <select class="cl-select" id="fDoors">
                        <option value="">—</option>
                        ${[2, 3, 4, 5, 6].map(n => `<option value="${n}" ${Number(state.doorsCount) === n ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_seats')}</label>
                    <select class="cl-select" id="fSeats">
                        <option value="">—</option>
                        ${[2, 3, 4, 5, 6, 7, 8, 9].map(n => `<option value="${n}" ${Number(state.seatsCount) === n ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_first_reg')} <span class="req">*</span></label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <select class="cl-select" id="fFirstRegMonth">
                            <option value="">${t('cl_sel_month')}</option>
                            ${[...Array(12)].map((_, i) => {
                                const m = (i + 1).toString().padStart(2, '0');
                                const currentM = state.firstRegistration ? state.firstRegistration.split('-')[1] : '';
                                return `<option value="${m}" ${currentM === m ? 'selected' : ''}>${m}.</option>`;
                            }).join('')}
                        </select>
                        <select class="cl-select" id="fFirstRegYear">
                            <option value="">${t('cl_sel_year')}</option>
                            ${yearOpts}
                        </select>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_prev_owners')}</label>
                    <select class="cl-select" id="fPrevOwners">
                        <option value="">—</option>
                        ${[
                            ['1st owner', t('cl_owner_1')],
                            ['2nd owner', t('cl_owner_2')],
                            ['3rd owner', t('cl_owner_3')],
                            ['4th owner', t('cl_owner_4')],
                            ['5 or more', t('cl_owner_5plus')]
                        ].map(([v, l]) =>
                            `<option value="${v}" ${state.previousOwnersCount === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnBasicBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnBasicNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    const makeSel = document.getElementById('fMake');
    const modelSel = document.getElementById('fModel');
    const variantSel = document.getElementById('fVariant');

    // Highlight imported fields
    if (state._imported) {
        const imp = state._imported;
        if (imp.brand) makeSel?.classList.add('imported-field');
        if (imp.model) modelSel?.classList.add('imported-field');
        if (imp.year) document.getElementById('fYear')?.classList.add('imported-field');
        if (imp.mileage) document.getElementById('fMileage')?.classList.add('imported-field');
    }

    // Populate Brands
    if (brandModelData) {
        Object.keys(brandModelData).sort().forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            if (state.make === b) opt.selected = true;
            makeSel.appendChild(opt);
        });
    }

    function updateModels() {
        const make = makeSel.value;
        const currentModel = state.model;
        modelSel.innerHTML = `<option value="">${t('cl_sel_model')}</option>`;
        variantSel.innerHTML = `<option value="">${t('cl_sel_model_first')}</option>`;

        if (make && brandModelData && brandModelData[make]) {
            const models = brandModelData[make];
            const modelKeys = Array.isArray(models) ? models : Object.keys(models);
            modelKeys.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                if (currentModel === m) opt.selected = true;
                modelSel.appendChild(opt);
            });
            modelSel.disabled = false || modelLocked;
        } else {
            modelSel.disabled = true;
        }
        updateVariants();
    }

    function updateVariants() {
        const make = makeSel.value;
        const model = modelSel.value;
        const currentVariant = state.variant;
        variantSel.innerHTML = `<option value="">${t('cl_sel_trim')}</option>`;

        if (make && model && brandModelData && brandModelData[make]) {
            const models = brandModelData[make];
            if (!Array.isArray(models) && models[model]) {
                const variantsArr = Array.isArray(models[model])
                    ? models[model]
                    : (Array.isArray(models[model].variants) ? models[model].variants : []);
                variantsArr.forEach(v => {
                    const trim = normalizeTrimEntryLocal(v).trim;
                    const opt = document.createElement('option');
                    opt.value = trim;
                    opt.textContent = trim;
                    if (currentVariant === trim) opt.selected = true;
                    variantSel.appendChild(opt);
                });
                variantSel.disabled = false;
            } else {
                // If no specific variants, allow manual or show generic
                variantSel.innerHTML = `<option value="">${t('cl_no_variants')}</option>`;
                variantSel.disabled = false;
            }
        } else {
            variantSel.disabled = true;
        }

        // Auto-fill on initial render if variant already selected (e.g., draft restore)
        if (state.variant) {
            applyTrimAutoFill(state.variant, makeSel.value, modelSel.value);
        }
        // Body type (vrsta vozila) from taxonomy — runs on init + model change
        applyBodyTypeAutoFill(makeSel.value, modelSel.value);
    }

    makeSel.addEventListener('change', () => {
        state.make = makeSel.value;
        state.model = '';
        state.variant = '';
        updateModels();
    });

    modelSel.addEventListener('change', () => {
        state.model = modelSel.value;
        state.variant = '';
        updateVariants();
    });

    variantSel.addEventListener('change', () => {
        state.variant = variantSel.value;
        applyTrimAutoFill(variantSel.value, makeSel.value, modelSel.value);
    });

    updateModels(); // Initialize visibility

    // Unlock logic for VIN fields
    [makeSel, modelSel].forEach(el => {
        const field = el?.closest('.cl-field--locked');
        if (!field) return;
        el.addEventListener('focus', (e) => {
            // Since it's a select, we might need a custom way to handle "focus to unlock"
            // or just a button. For now, let's allow unlocking on click if it's disabled.
        }, true);
    });

    // Custom select initialization
    initCustomSelects();

    const mileageInput = document.getElementById('fMileage');
    if (mileageInput) {
        setupNumericFormatter(mileageInput);
        mileageInput.addEventListener('input', () => {
            const unit = document.querySelector('.cl-mileage-unit');
            if (unit) unit.style.opacity = mileageInput.value ? '1' : '0.4';
        });
    }

    document.getElementById('btnBasicBack').addEventListener('click', goPrev);
    document.getElementById('btnBasicNext').addEventListener('click', () => {
        const make = makeSel.value;
        const mileageRaw = document.getElementById('fMileage').value;
        const mileage = parseFormattedNumber(mileageRaw);
        const year = document.getElementById('fYear').value;
        const firstRegMonth = document.getElementById('fFirstRegMonth').value;
        const firstRegYear = document.getElementById('fFirstRegYear').value;

        if (!make) return alert(t('cl_err_make'));
        if (mileageRaw === '') return alert(t('cl_err_mileage'));
        if (!year) return alert(t('cl_err_year'));
        if (!firstRegMonth || !firstRegYear) return alert(t('cl_err_first_reg'));

        state.make = make;
        state.model = modelSel.value;
        state.variant = variantSel.value;
        state.year = Number(year);
        state.mileageKm = mileage;
        state.color = document.getElementById('fColor').value;
        state.colorType = document.getElementById('fColorType').value;
        state.condition = document.getElementById('fCondition').value;
        state.doorsCount = document.getElementById('fDoors').value;
        state.seatsCount = document.getElementById('fSeats').value;
        state.firstRegistration = `${firstRegYear}-${firstRegMonth}`;
        state.previousOwnersCount = document.getElementById('fPrevOwners').value;
        goNext();
    });
}

// ── Step 4: Technical ─────────────────────────────────────────────────────────
function renderTechnicalStep() {
    const fuels = [
        ['Petrol', t('cl_fuel_petrol')],
        ['Dizel', t('cl_fuel_diesel')],
        ['Hibrid', t('cl_fuel_hybrid')],
        ['Elektrika', t('cl_fuel_electric')],
        ['LPG', t('cl_fuel_lpg')],
        ['CNG', t('cl_fuel_cng')],
        ['Vodik', t('cl_fuel_hydrogen')]
    ];
    const transmissions = [
        ['Ročni', t('cl_trans_manual')],
        ['Avtomatski', t('cl_trans_automatic')],
        ['Polavtomatski', t('cl_trans_semi')]
    ];
    const drives = [
        ['FWD (sprednji)', t('cl_drive_fwd')],
        ['RWD (zadnji)', t('cl_drive_rwd')],
        ['AWD / 4x4', t('cl_drive_awd')]
    ];
    const euros = ['Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6d-temp'];

    const isVin = state.vinVerified;
    const fuelLocked = isVin && !state.vinOverrides?.fuel;

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_tech_title')}</h2>
            <p class="cl-step-sub">${t('cl_tech_sub')}</p>

            <div class="cl-row">
                <div class="cl-field ${fuelLocked ? 'cl-field--locked' : ''}">
                    <label class="cl-label">${t('cl_label_fuel')} <span class="req">*</span></label>
                    <select class="cl-select" id="fFuel" ${fuelLocked ? 'disabled' : ''}>
                        <option value="">${t('cl_select') || 'Select'}</option>
                        ${fuels.map(([v, l]) => `<option value="${v}" ${state.fuel === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                    ${fuelLocked ? `<span class="cl-field-badge cl-field-badge--locked"><i data-lucide="lock"></i> ${t('cl_verified_vin')}</span>` : ''}
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_transmission')} <span class="req">*</span></label>
                    <select class="cl-select" id="fTransmission">
                        <option value="">${t('cl_select') || 'Select'}</option>
                        ${transmissions.map(([v, l]) => `<option value="${v}" ${state.transmission === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_drive')}</label>
                    <select class="cl-select" id="fDrive">
                        <option value="">${t('cl_select') || 'Select'}</option>
                        ${drives.map(([v, l]) => `<option value="${v}" ${state.driveType === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_displacement')} <span class="req">*</span></label>
                    <input class="cl-input" id="fEngineCC" type="number" min="0" value="${state.engineCc || ''}" placeholder="${t('cl_placeholder_displacement')}" />
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <div class="cl-label-with-toggle">
                        <label class="cl-label">${t('cl_label_power')} <span class="req">*</span></label>
                        <div class="cl-unit-toggle" id="powerUnitToggle">
                            <button type="button" class="cl-unit-btn active" data-unit="hp">KM</button>
                            <button type="button" class="cl-unit-btn" data-unit="kw">kW</button>
                        </div>
                    </div>
                    <div class="cl-input-wrap">
                        <input class="cl-input" id="fPower" type="number" min="0" value="${state.powerKw ? Math.round(state.powerKw * 1.35962) : ''}" placeholder="${t('cl_placeholder_power')}" />
                        <span class="cl-input-unit" id="powerUnitLabel">KM</span>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_co2')}</label>
                    <input class="cl-input" id="fCo2" type="number" min="0" value="${state.co2 || ''}" placeholder="${t('cl_placeholder_co2')}" />
                </div>
            </div>

            ${state.category === 'moto' ? `
            <div class="cl-a2-row">
                <span class="cl-a2-label">Primerno za A2 izpit</span>
                <div class="cl-unit-toggle" id="a2EligibleToggle">
                    <button type="button" class="cl-unit-btn ${!state.a2Eligible ? 'active' : ''}" data-val="false">Ne</button>
                    <button type="button" class="cl-unit-btn ${state.a2Eligible ? 'active' : ''}" data-val="true">Da</button>
                </div>
            </div>` : ''}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_emission')}</label>
                    <select class="cl-select" id="fEuro">
                        <option value="">—</option>
                        ${euros.map(e => `<option value="${e}" ${state.emissionClass === e ? 'selected' : ''}>${e}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_towing')}</label>
                    <input class="cl-input" id="fTow" type="number" min="0" value="${state.towingKg || ''}" placeholder="${t('cl_placeholder_tow')}" />
                </div>
            </div>

            <!-- Consumption fields (only for non-electric) -->
            <div class="cl-conditional" id="consumptionFields">
                <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1rem 0;" />
                <p class="cl-label" style="font-weight:600;margin-bottom:0.75rem;">${t('cl_label_consumption')} (l/100km)</p>
                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_combined')}</label>
                        <input class="cl-input" id="fConsCombined" type="number" step="0.1" min="0" value="${state.fuelL100kmCombined || ''}" placeholder="${t('cl_placeholder_cons')}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_city')}</label>
                        <input class="cl-input" id="fConsCity" type="number" step="0.1" min="0" value="${state.fuelL100kmCity || ''}" placeholder="${t('cl_placeholder_cons')}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_highway')}</label>
                        <input class="cl-input" id="fConsHighway" type="number" step="0.1" min="0" value="${state.fuelL100kmHighway || ''}" placeholder="${t('cl_placeholder_cons')}" />
                    </div>
                </div>
            </div>

            <!-- Electric fields -->
            <div class="cl-conditional" id="elFields">
                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_battery')}</label>
                        <input class="cl-input" id="fBattery" type="number" min="0" value="${state.batteryKwh || ''}" placeholder="${t('cl_placeholder_battery')}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_range')}</label>
                        <input class="cl-input" id="fRange" type="number" min="0" value="${state.rangeKm || ''}" placeholder="${t('cl_placeholder_range')}" />
                    </div>
                </div>
            </div>

            <!-- Hybrid sub -->
            <div class="cl-conditional" id="hybridFields">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_hybrid_type')}</label>
                    <select class="cl-select" id="fHybridType">
                        <option value="">${t('cl_select') || 'Select'}</option>
                        ${[['PetrolHybrid', t('cl_hybrid_petrol')], ['DizelHibrid', t('cl_hybrid_diesel')], ['PlugIn', t('cl_hybrid_plugin')], ['MildHibrid', t('cl_hybrid_mild')]].map(([v, l]) =>
                            `<option value="${v}" ${state.hybridType === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnTechBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnTechNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    // Highlight imported fields in technical step
    if (state._imported) {
        const imp = state._imported;
        if (imp.fuel) document.getElementById('fFuel')?.classList.add('imported-field');
        if (imp.transmission) document.getElementById('fTransmission')?.classList.add('imported-field');
        if (imp.powerKw) document.getElementById('fPower')?.classList.add('imported-field');
    }

    const fuelSel = document.getElementById('fFuel');
    const updateConditionals = () => {
        const val = fuelSel.value;
        document.getElementById('elFields')?.classList.toggle('visible', val === 'Elektrika');
        document.getElementById('hybridFields')?.classList.toggle('visible', val === 'Hibrid');
        document.getElementById('consumptionFields')?.classList.toggle('visible', val !== '' && val !== 'Elektrika');
    };
    fuelSel.addEventListener('change', updateConditionals);
    updateConditionals();

    // Track manual edits — auto-fill (applyTrimAutoFill) will not overwrite fields the user edited
    const techFields = [
        ['fFuel', 'fuel'], ['fEngineCC', 'engineCc'],
        ['fConsCity', 'fuelL100kmCity'], ['fConsHighway', 'fuelL100kmHighway'],
        ['fConsCombined', 'fuelL100kmCombined'], ['fRange', 'rangeKm'],
    ];
    techFields.forEach(([domId, stateKey]) => {
        const el = document.getElementById(domId);
        if (!el) return;
        const evtName = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(evtName, () => {
            if (!state._manualFields) state._manualFields = new Set();
            state._manualFields.add(stateKey);
            el.classList.remove('cl-autofilled');
        });
    });

    initCustomSelects();

    // Power Toggle Logic
    let currentPowerUnit = 'hp';
    const powerInput = document.getElementById('fPower');
    const unitBtns = document.querySelectorAll('#powerUnitToggle .cl-unit-btn');
    const unitLabel = document.getElementById('powerUnitLabel');

    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newUnit = btn.dataset.unit;
            if (newUnit === currentPowerUnit) return;

            const val = parseFloat(powerInput.value);
            if (!isNaN(val)) {
                if (newUnit === 'kw') {
                    powerInput.value = Math.round(val / 1.35962);
                } else {
                    powerInput.value = Math.round(val * 1.35962);
                }
            }

            unitBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPowerUnit = newUnit;
            unitLabel.textContent = newUnit === 'hp' ? 'KM' : 'kW';
        });
    });

    // A2 toggle (moto only)
    const a2Toggle = document.getElementById('a2EligibleToggle');
    if (a2Toggle) {
        a2Toggle.querySelectorAll('.cl-unit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                a2Toggle.querySelectorAll('.cl-unit-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.a2Eligible = btn.dataset.val === 'true';
            });
        });
    }

    document.getElementById('btnTechBack').addEventListener('click', goPrev);
    document.getElementById('btnTechNext').addEventListener('click', () => {
        const engineCc = document.getElementById('fEngineCC').value;
        const powerVal = parseFloat(powerInput.value);

        if (!fuelSel.value) return alert(t('cl_err_fuel'));
        if (!document.getElementById('fTransmission').value) return alert(t('cl_err_trans'));
        if (!engineCc) return alert(t('cl_err_displacement'));
        if (isNaN(powerVal)) return alert(t('cl_err_power'));

        state.fuel = fuelSel.value;
        state.transmission = document.getElementById('fTransmission').value;
        state.driveType = document.getElementById('fDrive').value;
        state.engineCc = engineCc;
        state.powerKw = currentPowerUnit === 'kw' ? powerVal : Math.round(powerVal / 1.35962);
        state.co2 = document.getElementById('fCo2').value;
        state.emissionClass = document.getElementById('fEuro').value;
        state.towingKg = document.getElementById('fTow').value;
        state.fuelL100kmCombined = document.getElementById('fConsCombined')?.value || '';
        state.fuelL100kmCity = document.getElementById('fConsCity')?.value || '';
        state.fuelL100kmHighway = document.getElementById('fConsHighway')?.value || '';
        state.batteryKwh = document.getElementById('fBattery')?.value || '';
        state.rangeKm = document.getElementById('fRange')?.value || '';
        state.hybridType = document.getElementById('fHybridType')?.value || null;
        goNext();
    });
}

// ── Step 5: Equipment ─────────────────────────────────────────────────────────
function renderEquipmentStep() {
    const groups = getEquipmentForCategory(state.category);
    const isMoto = state.category === 'moto';
    const showExhaustSub = isMoto && state.equipment.includes('SportExhaust');

    const groupHtml = groups.map(g => `
        <div class="cl-equipment-group">
            <p class="cl-equipment-group-title"><i data-lucide="${g.icon}"></i> ${t(g.label)}</p>
            <div class="cl-chips">
                ${g.items.map(item => `
                    <button type="button" class="cl-chip ${state.equipment.includes(item.value) ? 'active' : ''}"
                        data-val="${item.value}">${t(item.label)}</button>`).join('')}
            </div>
        </div>`).join('');

    const exhaustSubHtml = isMoto ? `
        <div id="cl-exhaust-sub" style="${showExhaustSub ? '' : 'display:none;'}background:rgba(0,0,0,0.03);border-radius:1rem;padding:1rem 1.25rem;margin-bottom:1rem;">
            <p class="cl-equipment-group-title" style="margin-bottom:.75rem;"><i data-lucide="wind"></i> Podrobnosti izpuha</p>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;">
                <button type="button" class="cl-chip${state.exhaustType === '' ? ' active' : ''}" data-exhaust-type="">Vse vrste</button>
                <button type="button" class="cl-chip${state.exhaustType === 'slip-on' ? ' active' : ''}" data-exhaust-type="slip-on">Slip-on</button>
                <button type="button" class="cl-chip${state.exhaustType === 'full-system' ? ' active' : ''}" data-exhaust-type="full-system">Full System</button>
            </div>
            <select id="cl-exhaust-brand" class="cl-input" style="max-width:280px;">
                <option value="">Znamka izpuha (opcijsko)</option>
            </select>
        </div>` : '';

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_eq_title')}</h2>
            <p class="cl-step-sub">${t('cl_eq_sub')}</p>
            ${groupHtml}
            ${exhaustSubHtml}
            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnEqBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnEqNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    document.querySelectorAll('.cl-chip[data-val]').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = chip.dataset.val;
            if (state.equipment.includes(val)) {
                state.equipment = state.equipment.filter(v => v !== val);
                chip.classList.remove('active');
                if (val === 'SportExhaust') {
                    const sub = document.getElementById('cl-exhaust-sub');
                    if (sub) sub.style.display = 'none';
                    state.exhaustType = '';
                    state.exhaustBrand = '';
                }
            } else {
                state.equipment = [...state.equipment, val];
                chip.classList.add('active');
                if (val === 'SportExhaust') {
                    const sub = document.getElementById('cl-exhaust-sub');
                    if (sub) sub.style.display = '';
                }
            }
        });
    });

    // Exhaust type chips
    document.querySelectorAll('.cl-chip[data-exhaust-type]').forEach(chip => {
        chip.addEventListener('click', () => {
            state.exhaustType = chip.dataset.exhaustType;
            document.querySelectorAll('.cl-chip[data-exhaust-type]').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // Exhaust brand dropdown — load from JSON
    if (isMoto) {
        fetch('json/exhaust_brands.json')
            .then(r => r.json())
            .then(brands => {
                const sel = document.getElementById('cl-exhaust-brand');
                if (!sel) return;
                brands.forEach(b => {
                    const o = document.createElement('option');
                    o.value = b; o.textContent = b;
                    if (b === state.exhaustBrand) o.selected = true;
                    sel.appendChild(o);
                });
                sel.value = state.exhaustBrand || '';
                sel.addEventListener('change', () => { state.exhaustBrand = sel.value; });
            })
            .catch(() => {});
    }

    document.getElementById('btnEqBack').addEventListener('click', goPrev);
    document.getElementById('btnEqNext').addEventListener('click', goNext);
}

// ── Step 6: Media ─────────────────────────────────────────────────────────────
let _mediaTab = 'exterior'; // 'exterior' | 'interior'

function renderMediaStep() {
    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_media_title')}</h2>
            <p class="cl-step-sub">${t('cl_media_sub')}</p>

            <div class="cl-media-tabs">
                <button class="cl-media-tab ${_mediaTab === 'exterior' ? 'active' : ''}" data-tab="exterior">
                    🚗 ${t('cl_media_exterior')}
                    <span class="cl-media-tab-count" id="extCount">${state._exteriorFiles.length}</span>
                </button>
                <button class="cl-media-tab ${_mediaTab === 'interior' ? 'active' : ''}" data-tab="interior">
                    🪑 ${t('cl_media_interior')}
                    <span class="cl-media-tab-count" id="intCount">${state._interiorFiles.length}</span>
                </button>
            </div>

            <div class="cl-dropzone" id="dropzone">
                <div class="cl-dropzone-icon">📷</div>
                <p id="dropzoneLabel">${_mediaTab === 'exterior' ? t('cl_media_dz_ext') : t('cl_media_dz_int')}</p>
                <small>${t('cl_media_dz_sub')}</small>
                <input type="file" id="fileInput" multiple accept="image/*" style="display:none;" />
            </div>

            <div class="cl-thumb-grid" id="thumbGrid"></div>
            <p class="cl-thumb-hint" id="thumbHint" style="display:none;">
                ${_mediaTab === 'exterior' ? t('cl_media_hint_cover') : ''} ${t('cl_media_hint_remove')}
            </p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnMediaBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnMediaNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    bindMediaDropzone();
    renderThumbs();

    document.querySelectorAll('.cl-media-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            _mediaTab = btn.dataset.tab;
            renderMediaStep();
        });
    });

    document.getElementById('btnMediaBack').addEventListener('click', goPrev);
    document.getElementById('btnMediaNext').addEventListener('click', () => {
        if (state._exteriorFiles.length === 0) return alert(t('cl_err_min_photos'));
        goNext();
    });
}

function bindMediaDropzone() {
    const dz = document.getElementById('dropzone');
    const fi = document.getElementById('fileInput');

    dz.addEventListener('click', () => fi.click());
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
    fi.addEventListener('change', () => addFiles(fi.files));
}

function addFiles(fileList) {
    const isExterior = _mediaTab === 'exterior';
    const files = isExterior ? state._exteriorFiles : state._interiorFiles;
    const urls = isExterior ? state._exteriorUrls : state._interiorUrls;

    Array.from(fileList).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        if (file.size > 10 * 1024 * 1024) return alert(`${file.name} ${t('cl_err_file_size')}`);
        files.push(file);
        urls.push(URL.createObjectURL(file));
    });
    renderThumbs();
    // Update tab counts
    const extCount = document.getElementById('extCount');
    const intCount = document.getElementById('intCount');
    if (extCount) extCount.textContent = state._exteriorFiles.length;
    if (intCount) intCount.textContent = state._interiorFiles.length;
}

function renderThumbs() {
    const grid = document.getElementById('thumbGrid');
    const hint = document.getElementById('thumbHint');
    if (!grid) return;

    const isExterior = _mediaTab === 'exterior';
    const files = isExterior ? state._exteriorFiles : state._interiorFiles;
    const urls = isExterior ? state._exteriorUrls : state._interiorUrls;

    if (files.length === 0) {
        grid.innerHTML = '';
        if (hint) hint.style.display = 'none';
        return;
    }

    if (hint) hint.style.display = 'block';

    grid.innerHTML = urls.map((url, i) => `
        <div class="cl-thumb ${isExterior && i === state.coverIndex ? 'is-cover' : ''}" data-idx="${i}">
            <img src="${url}" alt="${t('cl_label_color') || 'Slika'} ${i + 1}" />
            ${isExterior && i === state.coverIndex ? `<span class="cl-thumb-cover-badge">${t('cl_media_cover_badge')}</span>` : ''}
            <button class="cl-thumb-remove" data-remove="${i}" title="${t('cl_btn_remove') || 'Odstrani'}">×</button>
        </div>`).join('');

    grid.querySelectorAll('.cl-thumb').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            if (e.target.closest('[data-remove]')) return;
            if (isExterior) {
                state.coverIndex = Number(thumb.dataset.idx);
                renderThumbs();
            }
        });
    });

    grid.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.remove);
            URL.revokeObjectURL(urls[idx]);
            files.splice(idx, 1);
            urls.splice(idx, 1);
            if (isExterior && state.coverIndex >= files.length) state.coverIndex = 0;
            renderThumbs();
            const extCount = document.getElementById('extCount');
            const intCount = document.getElementById('intCount');
            if (extCount) extCount.textContent = state._exteriorFiles.length;
            if (intCount) intCount.textContent = state._interiorFiles.length;
        });
    });
}

// ── Step 7: Description ───────────────────────────────────────────────────────
function renderDescriptionStep() {
    const isBusiness = state.sellerType === 'business';
    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_desc_title')}</h2>
            <p class="cl-step-sub">${t('cl_desc_sub')}</p>

            <div class="cl-field">
                <label class="cl-label">${t('cl_label_desc')}</label>
                <textarea class="cl-textarea" id="fDesc" maxlength="3000" placeholder="${t('cl_placeholder_desc')}">${escHtml(state.description || '')}</textarea>
                <span id="descCount" style="font-size:0.75rem;color:#94a3b8;text-align:right;">${(state.description || '').length} / 3000</span>
            </div>

            ${isBusiness ? `
            <p style="font-size:0.82rem;color:#92400e;padding:0.75rem 1rem;background:#fef3c7;border-radius:0.6rem;border:1px solid #fde68a;margin-bottom:0.75rem;">
                ${t('cl_desc_warn_business')}
            </p>` : ''}

            <p style="font-size:0.82rem;color:#64748b;padding:0.75rem 1rem;background:rgba(37,99,235,0.04);border-radius:0.6rem;border:1px solid rgba(37,99,235,0.1);">
                ${t('cl_desc_tip')}
            </p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnDescBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnDescNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    const ta = document.getElementById('fDesc');
    const cnt = document.getElementById('descCount');
    ta.addEventListener('input', () => { cnt.textContent = `${ta.value.length} / 3000`; });

    document.getElementById('btnDescBack').addEventListener('click', goPrev);
    document.getElementById('btnDescNext').addEventListener('click', () => {
        state.description = ta.value.trim();
        goNext();
    });
}

// ── Step 8: Price ─────────────────────────────────────────────────────────────
function renderPriceStep() {
    const callForPrice = !!state.callForPrice;

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_price_title')}</h2>
            <p class="cl-step-sub">${t('cl_price_sub')}</p>

            <div class="cl-checkboxes" style="margin-bottom:1rem;">
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fCallForPrice" ${callForPrice ? 'checked' : ''} />
                    ${t('cl_label_call_for_price')}
                </label>
            </div>

            <div class="cl-field" id="priceFieldWrap" style="${callForPrice ? 'display:none;' : ''}">
                <label class="cl-label">${t('cl_label_price')} <span class="req">*</span></label>
                <div class="cl-price-wrap">
                    <input class="cl-input" id="fPrice" type="text"
                        value="${formatNumberWithCommas(state.priceEur)}" placeholder="0" autocomplete="off" />
                    <span class="cl-price-currency">€</span>
                </div>
            </div>


            <div class="cl-checkboxes">
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fNeg" ${state.priceNegotiable ? 'checked' : ''} />
                    ${t('cl_label_negotiable')}
                </label>
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fFinalPrice" ${state.priceIsFinal ? 'checked' : ''} />
                    ${t('cl_label_final_price')}
                </label>
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fVat" ${state.priceInclVat ? 'checked' : ''} />
                    ${t('cl_label_vat')}
                </label>
                ${state.sellerType !== 'business' ? `
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fLease" ${state.leaseAvailable ? 'checked' : ''} />
                    ${t('cl_label_lease')}
                </label>` : ''}
            </div>

            ${state.sellerType === 'business' ? `
            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />
            <div class="cl-field">
                <label class="cl-label" style="font-weight:600;">${t('cl_financing_title')}</label>
                <p style="font-size:0.82rem;color:#64748b;margin:0 0 0.75rem;">${t('cl_financing_sub')}</p>
                <div class="cl-checkboxes" style="margin-bottom:0.75rem;">
                    <label class="cl-checkbox-label">
                        <input type="checkbox" id="fOffersLeasing" ${state.leasingConditions ? 'checked' : ''} />
                        ${t('cl_label_offers_leasing')}
                    </label>
                </div>
                <div id="leasingConditionsWrap" style="display:${state.leasingConditions ? 'block' : 'none'};">
                    <label class="cl-label">${t('cl_label_leasing_terms')}</label>
                    <textarea class="cl-textarea" id="fLeasingConditions" maxlength="1000"
                        placeholder="${t('cl_placeholder_leasing')}"
                        style="min-height:120px;">${escHtml(state.leasingConditions || '')}</textarea>
                    <span style="font-size:0.75rem;color:#94a3b8;text-align:right;display:block;" id="leasingCount">${(state.leasingConditions || '').length} / 1000</span>
                </div>
            </div>` : ''}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnPriceBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnPriceNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    document.getElementById('fCallForPrice').addEventListener('change', e => {
        document.getElementById('priceFieldWrap').style.display = e.target.checked ? 'none' : '';
    });

    const priceInput = document.getElementById('fPrice');
    if (state._imported?.price) priceInput?.classList.add('imported-field');

    if (priceInput) {
        setupNumericFormatter(priceInput);
    }

    // Toggle leasing conditions textarea visibility for business sellers
    const offersLeasingEl = document.getElementById('fOffersLeasing');
    if (offersLeasingEl) {
        offersLeasingEl.addEventListener('change', e => {
            document.getElementById('leasingConditionsWrap').style.display = e.target.checked ? 'block' : 'none';
        });
        const leasingTextarea = document.getElementById('fLeasingConditions');
        const leasingCount = document.getElementById('leasingCount');
        if (leasingTextarea && leasingCount) {
            leasingTextarea.addEventListener('input', () => {
                leasingCount.textContent = `${leasingTextarea.value.length} / 1000`;
            });
        }
    }

    document.getElementById('btnPriceBack').addEventListener('click', goPrev);
    document.getElementById('btnPriceNext').addEventListener('click', () => {
        const isCallForPrice = document.getElementById('fCallForPrice').checked;
        if (!isCallForPrice) {
            const priceRaw = document.getElementById('fPrice').value;
            const price = parseFormattedNumber(priceRaw);
            if (!price || price <= 0) return alert(t('cl_err_price'));
            state.priceEur = price;
        } else {
            state.priceEur = 0;
        }

        state.callForPrice = isCallForPrice;
        state.priceNegotiable = document.getElementById('fNeg').checked;
        state.priceIsFinal = document.getElementById('fFinalPrice').checked;
        state.priceInclVat = document.getElementById('fVat').checked;

        if (state.sellerType === 'business') {
            const offersLeasing = document.getElementById('fOffersLeasing')?.checked;
            state.leaseAvailable = offersLeasing || false;
            state.leasingConditions = offersLeasing
                ? (document.getElementById('fLeasingConditions')?.value.trim() || '')
                : '';
        } else {
            state.leaseAvailable = document.getElementById('fLease')?.checked || false;
            state.leasingConditions = '';
        }

        goNext();
    });
}

// ── Step 9: Location & contact ────────────────────────────────────────────────
function renderLocationStep() {
    const regions = ['Osrednjeslovenska', 'Gorenjska', 'Podravska', 'Savinjska', 'Dolenjska', 'Obalno-kraška', 'Koroška', 'Pomurska', 'Zasavska', 'Posavska', 'Primorsko-notranjska', 'Goriška'];
    const isBusiness = state.sellerType === 'business';

    const BH_DAYS = [
        { key: 'mon', label: t('cl_day_mon') },
        { key: 'tue', label: t('cl_day_tue') },
        { key: 'wed', label: t('cl_day_wed') },
        { key: 'thu', label: t('cl_day_thu') },
        { key: 'fri', label: t('cl_day_fri') },
        { key: 'sat', label: t('cl_day_sat') },
        { key: 'sun', label: t('cl_day_sun') },
    ];
    const bh = state.businessHours || {};

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_loc_title')}</h2>
            <p class="cl-step-sub">${t('cl_loc_sub')}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_city')} <span class="req">*</span></label>
                    <input class="cl-input" id="fCity" type="text" value="${escHtml(state.location?.city || '')}" placeholder="${t('cl_placeholder_city')}" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_postal')}</label>
                    <input class="cl-input" id="fPostal" type="text" value="${escHtml(state.location?.postalCode || '')}" placeholder="${t('cl_placeholder_postal')}" />
                </div>
            </div>

            <div class="cl-field">
                <label class="cl-label">${t('cl_label_region')}</label>
                <select class="cl-select" id="fRegion">
                    <option value="">${t('cl_sel_region')}</option>
                    ${regions.map(r => `<option value="${r}" ${state.location?.region === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>

            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />

            <div class="cl-field">
                <label class="cl-label">${t('cl_label_contact_name')} <span class="req">*</span></label>
                <input class="cl-input" id="fContactName" type="text" value="${escHtml(state.contact?.name || '')}" />
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_phone')}</label>
                    <input class="cl-input" id="fPhone" type="tel" value="${escHtml(state.contact?.phone || '')}" placeholder="+386 ..." />
                </div>
                <div class="cl-field" style="justify-content:flex-end;">
                    <label class="cl-checkbox-label" style="margin-top:1.6rem;">
                        <input type="checkbox" id="fShowPhone" ${state.contact?.showPhone ? 'checked' : ''} />
                        ${t('cl_label_show_phone')}
                    </label>
                </div>
            </div>

            ${!isBusiness ? `
            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />
            <div class="cl-field">
                <label class="cl-label">${t('cl_label_seller_note')} <span style="font-size:0.78rem;color:#94a3b8;">(${t('optional') || 'optional'})</span></label>
                <textarea class="cl-input" id="fSellerNote" rows="3" placeholder="${t('cl_placeholder_seller_note')}"
                    style="resize:vertical;">${escHtml(state.sellerNote || '')}</textarea>
                <span class="cl-hint">${t('cl_hint_seller_note')}</span>
            </div>` : ''}

            ${isBusiness ? `
            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />
            <div class="cl-field">
                <label class="cl-label">${t('cl_label_business_hours')} <span style="font-size:0.78rem;color:#94a3b8;">(${t('optional') || 'optional'})</span></label>
                <div class="cl-bh-grid" style="display:grid;gap:0.5rem;margin-top:0.5rem;">
                    ${BH_DAYS.map(d => `
                    <div class="cl-bh-row" style="display:grid;grid-template-columns:7rem 1fr 0.4rem 1fr auto;align-items:center;gap:0.5rem;">
                        <label class="cl-checkbox-label" style="margin:0;">
                            <input type="checkbox" class="bh-check" data-day="${d.key}" ${bh[d.key] ? 'checked' : ''} />
                            ${d.label}
                        </label>
                        <input class="cl-input" type="time" id="bh_${d.key}_from" value="${escHtml(bh[d.key]?.from || '08:00')}"
                            ${bh[d.key] ? '' : 'disabled'} style="padding:0.4rem;" />
                        <span style="text-align:center;color:#94a3b8;">–</span>
                        <input class="cl-input" type="time" id="bh_${d.key}_to" value="${escHtml(bh[d.key]?.to || '17:00')}"
                            ${bh[d.key] ? '' : 'disabled'} style="padding:0.4rem;" />
                        <span class="cl-bh-closed" id="bh_${d.key}_label"
                            style="font-size:0.75rem;color:#94a3b8;width:4rem;">${bh[d.key] ? '' : t('cl_label_closed')}</span>
                    </div>`).join('')}
                </div>
            </div>` : ''}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnLocBack">${t('cl_btn_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnLocNext">${t('cl_btn_continue')}</button>
            </div>
        </div>
    `);

    document.getElementById('btnLocBack').addEventListener('click', goPrev);
    initCustomSelects();
    if (window.lucide) window.lucide.createIcons();

    // Wire business hours checkboxes
    if (isBusiness) {
        document.querySelectorAll('.bh-check').forEach(cb => {
            cb.addEventListener('change', () => {
                const day = cb.dataset.day;
                const enabled = cb.checked;
                document.getElementById(`bh_${day}_from`).disabled = !enabled;
                document.getElementById(`bh_${day}_to`).disabled = !enabled;
                document.getElementById(`bh_${day}_label`).textContent = enabled ? '' : t('cl_label_closed');
            });
        });
    }

    document.getElementById('btnLocNext').addEventListener('click', () => {
        const city = document.getElementById('fCity').value.trim();
        const name = document.getElementById('fContactName').value.trim();
        if (!city) return alert(t('cl_err_city'));
        if (!name) return alert(t('cl_err_contact_name'));

        state.location = {
            city,
            postalCode: document.getElementById('fPostal').value.trim(),
            region: document.getElementById('fRegion').value,
        };
        state.contact = {
            name,
            phone: document.getElementById('fPhone').value.trim(),
            showPhone: document.getElementById('fShowPhone').checked,
            email: auth.currentUser?.email || '',
        };

        if (!isBusiness) {
            state.sellerNote = document.getElementById('fSellerNote')?.value.trim() || '';
        } else {
            const hours = {};
            BH_DAYS.forEach(d => {
                const cb = document.querySelector(`.bh-check[data-day="${d.key}"]`);
                if (cb?.checked) {
                    hours[d.key] = {
                        from: document.getElementById(`bh_${d.key}_from`).value || '08:00',
                        to: document.getElementById(`bh_${d.key}_to`).value || '17:00',
                    };
                }
            });
            state.businessHours = hours;
        }

        goNext();
    });
}

// ── Step 10: Promotion ────────────────────────────────────────────────────────
function renderPromotionStep() {
    const tiers = [
        {
            id: 'free', icon: '📋', name: t('cl_tier_free'), price: t('cl_price_free'),
            desc: t('cl_tier_free_desc'),
        },
        {
            id: 'homepage', icon: '⭐', name: t('cl_tier_featured'), price: t('cl_price_featured'),
            desc: t('cl_tier_featured_desc'),
        },
        {
            id: 'sponsored', icon: '🚀', name: t('cl_tier_sponsored'), price: t('cl_price_sponsored'),
            desc: t('cl_tier_sponsored_desc'),
        },
    ];

    const cards = tiers.map(t => `
        <div class="cl-promo-card ${state.promotionTier === t.id ? 'selected' : ''}" data-tier="${t.id}">
            <span class="cl-promo-icon">${t.icon}</span>
            <p class="cl-promo-name">${t.name}</p>
            <p class="cl-promo-price">${t.price}</p>
            <p class="cl-promo-desc">${t.desc}</p>
        </div>`).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_promo_title')}</h2>
            <p class="cl-step-sub">${t('cl_promo_sub')}</p>

            <div class="cl-promo-grid">${cards}</div>

            <p class="cl-promo-note">
                ${t('cl_promo_note')}
            </p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnPromoBack">${t('cl_btn_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnPromoNext">${t('cl_btn_continue')}</button>
            </div>
        </div>
    `);

    document.querySelectorAll('.cl-promo-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.cl-promo-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.promotionTier = card.dataset.tier;
        });
    });

    document.getElementById('btnPromoBack').addEventListener('click', goPrev);
    document.getElementById('btnPromoNext').addEventListener('click', goNext);
}

// ── Step 11: Review ───────────────────────────────────────────────────────────
function renderReviewStep() {
    const fmt = n => new Intl.NumberFormat(getCurrentLang() === 'sl' ? 'sl-SI' : 'en-US').format(n);
    const tierLabels = { free: t('cl_tier_free'), homepage: t('cl_tier_featured'), sponsored: t('cl_tier_sponsored') };

    const imgPreview = state._exteriorUrls.length > 0
        ? `<img src="${state._exteriorUrls[state.coverIndex]}" alt="Naslovna" style="width:100%;height:200px;object-fit:cover;border-radius:0.85rem;margin-bottom:1rem;" />`
        : '';

    function section(title, stepId, rows) {
        const items = rows.filter(([, v]) => v).map(([l, v]) => `
            <div class="cl-review-item">
                <span class="cl-review-item-label">${l}</span>
                <span class="cl-review-item-value">${escHtml(String(v))}</span>
            </div>`).join('');
        return `
            <div class="cl-review-section">
                <div class="cl-review-section-header">
                    <span class="cl-review-section-title">${title}</span>
                    <button class="cl-review-edit-btn" data-jump="${stepId}">✎ ${t('cl_btn_edit')}</button>
                </div>
                <div class="cl-review-grid">${items}</div>
            </div>`;
    }

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_review_title')}</h2>
            <p class="cl-step-sub">${t('cl_review_sub')}</p>

            ${imgPreview}
            <p style="font-size:0.8rem;color:#94a3b8;margin-bottom:1.5rem;">
                ${t('cl_review_media_count', { ext: state._exteriorFiles.length, int: state._interiorFiles.length })}
            </p>

            ${section(t('cl_section_category'), 'category', [
        [t('cl_section_category'), state.category],
        [t('cl_label_subcategory'), state.subcategory],
    ])}

            ${section(t('cl_section_basic'), 'basic', [
        [t('cl_label_make'), state.make],
        [t('cl_label_model'), state.model],
        [t('cl_label_year'), state.year],
        [t('cl_label_mileage_review'), state.mileageKm ? (getCurrentLang() === 'sl' ? fmt(state.mileageKm) + ' km' : fmt(Math.round(state.mileageKm * 0.621371)) + ' mi') : ''],
        [t('cl_label_condition'), state.condition],
        [t('cl_label_color'), state.color],
    ])}

            ${section(t('cl_section_technical'), 'technical', [
        [t('cl_label_fuel'), state.fuel],
        [t('cl_label_transmission'), state.transmission],
        [t('cl_label_power_review'), state.powerKw ? (getCurrentLang() === 'sl' ? state.powerKw + ' kW (' + Math.round(state.powerKw * 1.34102) + ' KM)' : Math.round(state.powerKw * 1.34102) + ' HP') : ''],
        [t('cl_label_displacement_review'), state.engineCc ? state.engineCc + ' cc' : ''],
        [t('cl_label_cons_combined'), state.fuelL100kmCombined ? (getCurrentLang() === 'sl' ? state.fuelL100kmCombined + ' l/100km' : Math.round(235.215 / state.fuelL100kmCombined) + ' MPG') : ''],
        [t('cl_label_cons_city'), state.fuelL100kmCity ? (getCurrentLang() === 'sl' ? state.fuelL100kmCity + ' l/100km' : Math.round(235.215 / state.fuelL100kmCity) + ' MPG') : ''],
        [t('cl_label_cons_highway'), state.fuelL100kmHighway ? (getCurrentLang() === 'sl' ? state.fuelL100kmHighway + ' l/100km' : Math.round(235.215 / state.fuelL100kmHighway) + ' MPG') : ''],
        [t('cl_label_range_review'), state.rangeKm ? (getCurrentLang() === 'sl' ? state.rangeKm + ' km' : Math.round(state.rangeKm * 0.621371) + ' mi') : ''],
        [t('cl_label_emissions'), state.emissionClass],
    ])}

            ${section(t('cl_section_price'), 'price', [
        [t('cl_section_price'), state.callForPrice ? t('cl_label_call_for_price') : (state.priceEur ? (getCurrentLang() === 'sl' ? fmt(state.priceEur) + ' €' : '$' + fmt(state.priceEur)) : '')],
        [t('cl_label_negotiable'), state.priceNegotiable ? t('cl_val_yes') : t('cl_val_no')],
    ])}

            ${section(t('cl_section_location'), 'location', [
        [t('cl_label_city'), state.location?.city],
        [t('cl_label_region'), state.location?.region],
        [t('cl_label_contact'), state.contact?.name],
    ])}

            ${section(t('cl_section_promotion'), 'promotion', [
        [t('cl_label_tier'), tierLabels[state.promotionTier] || state.promotionTier],
    ])}

            ${state.vinVerified ? `
            <div class="cl-review-section">
                <div class="cl-review-section-header">
                    <span class="cl-review-section-title">${t('cl_section_vin')}</span>
                </div>
                <p style="font-size:0.82rem;color:#1d4ed8;">${state.vin}</p>
            </div>` : ''}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnRevBack">${t('cl_btn_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnRevNext">${t('cl_btn_post')}</button>
            </div>
        </div>
    `);

    document.querySelectorAll('[data-jump]').forEach(btn => {
        btn.addEventListener('click', () => jumpToStep(btn.dataset.jump));
    });

    document.getElementById('btnRevBack').addEventListener('click', goPrev);
    document.getElementById('btnRevNext').addEventListener('click', () => {
        if (auth.currentUser) {
            submitListing(auth.currentUser);
        } else {
            goNext(); // go to auth step
        }
    });
}

// ── Step 12: Auth ─────────────────────────────────────────────────────────────
function renderAuthStep() {
    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_auth_title')}</h2>
            <p class="cl-step-sub">${t('cl_auth_sub')}</p>

            <div class="cl-auth-wrap">
                <div class="cl-auth-info">
                    ${t('cl_auth_info')}
                </div>

                <button class="cl-btn cl-btn--google" id="btnGoogle">
                    <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="" />
                    ${t('cl_btn_google')}
                </button>

                <div class="cl-or">${t('cl_auth_or')}</div>

                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_email')}</label>
                    <input class="cl-input" id="authEmail" type="email" placeholder="vas@email.com" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_password')}</label>
                    <input class="cl-input" id="authPassword" type="password" placeholder="••••••••" />
                </div>

                <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
                    <button class="cl-btn cl-btn--primary" id="btnLogin" style="flex:1;">${t('cl_btn_signin')}</button>
                    <button class="cl-btn cl-btn--secondary" id="btnRegister" style="flex:1;">${t('cl_btn_register')}</button>
                </div>

                <p id="authError" style="color:#dc2626;font-size:0.82rem;margin-top:0.75rem;display:none;"></p>
            </div>

            <div class="cl-nav" style="margin-top:1.25rem;">
                <button class="cl-btn cl-btn--ghost" id="btnAuthBack">${t('cl_btn_back')}</button>
            </div>
        </div>
    `);

    document.getElementById('btnAuthBack').addEventListener('click', goPrev);

    const showErr = msg => {
        const el = document.getElementById('authError');
        el.textContent = msg;
        el.style.display = 'block';
    };

    document.getElementById('btnGoogle').addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            await submitListing(result.user);
        } catch (e) { showErr(e.message); }
    });

    document.getElementById('btnLogin').addEventListener('click', async () => {
        try {
            const email = document.getElementById('authEmail').value;
            const pw = document.getElementById('authPassword').value;
            const result = await signInWithEmailAndPassword(auth, email, pw);
            await submitListing(result.user);
        } catch (e) { showErr(t('cl_err_signin') + e.message); }
    });

    document.getElementById('btnRegister').addEventListener('click', async () => {
        try {
            const email = document.getElementById('authEmail').value;
            const pw = document.getElementById('authPassword').value;
            const result = await createUserWithEmailAndPassword(auth, email, pw);
            await submitListing(result.user);
        } catch (e) { showErr(t('cl_err_register') + e.message); }
    });
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submitListing(user) {
    const container = document.getElementById('clStepContainer');
    container.innerHTML = `
        <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
            <div class="cl-vin-spinner" style="margin:0 auto 1.5rem;"></div>
            <h2 class="cl-step-title">${t('cl_submitting_title')}</h2>
            <p class="cl-step-sub">${t('cl_submitting_sub')}</p>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    try {
        const userDoc = await getCurrentUserDoc();
        if (userDoc && userDoc.sellerType) {
            state.sellerType = userDoc.sellerType;
        }
        const id = await createListing(state, state._exteriorFiles, state._interiorFiles, user);
        clearDraft();
        state._exteriorUrls.forEach(url => URL.revokeObjectURL(url));
        state._interiorUrls.forEach(url => URL.revokeObjectURL(url));

        container.innerHTML = `
            <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
                <h2 class="cl-step-title">${t('cl_success_title')}</h2>
                <p class="cl-step-sub">${t('cl_success_sub')}</p>
                <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem;">
                    <a href="#/oglas?id=${id}" class="cl-btn cl-btn--primary">${t('cl_btn_view_listing')}</a>
                    <a href="#/dashboard" class="cl-btn cl-btn--secondary">${t('cl_btn_my_listings')}</a>
                </div>
            </div>`;

        document.getElementById('clProgress').style.display = 'none';
    } catch (err) {
        console.error('[CreateListing] submit error:', err);
        container.innerHTML = `
            <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">❌</div>
                <h2 class="cl-step-title">${t('cl_error_title')}</h2>
                <p class="cl-step-sub">${escHtml(err.message)}</p>
                <button class="cl-btn cl-btn--primary" onclick="location.reload()">${t('cl_btn_retry')}</button>
            </div>`;
    }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function setHtml(html) {
    const el = document.getElementById('clStepContainer');
    if (el) el.innerHTML = html;
}

function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
