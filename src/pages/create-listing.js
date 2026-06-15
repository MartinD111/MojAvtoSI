// ═══════════════════════════════════════════════════════════════════════════════
// Create Listing — Multi-step Controller — MojAvto.si
// ═══════════════════════════════════════════════════════════════════════════════

import { createListing, updateListing, getListingById } from '../services/listingService.js';
import { EQUIPMENT_GROUPS, getEquipmentForCategory } from '../data/equipment.js';
import { auth } from '../firebase.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initCustomSelects, createCustomSelect } from '../utils/customSelect.js';
import { getCurrentUserDoc } from '../auth/auth.js';
import { t, getCurrentLang } from '../core/i18n.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { getModelBodyType } from '../utils/bodyType.js';
import { VEHICLE_CATEGORIES, getPartGroups, getPartTypes, getPartTypeLabel } from '../data/partTypes.js';
import { getEquipmentGroups, getEquipmentTypes, getEquipmentTypeLabel, getEquipmentGroupLabel, EQUIPMENT_SIZES } from '../data/equipmentTypes.js';
import { PLATFORM } from '../config/platform.js';
import { scrollToTopOnMobile } from '../utils/viewport.js';
import { COUNTRIES, getRegions } from '../data/locationData.js';
import { AUCTION_PACKAGES } from '../services/auctionService.js';
import { contractWidgetHtml, mountContractWidget, isContractComplete } from '../utils/auctionContract.js';
import { openAiImportOverlay } from '../utils/aiListingImport.js';

// ── Draft persistence ─────────────────────────────────────────────────────────
const DRAFT_KEY = 'cl_draft';
const PHOTO_KEY = 'cl_draft_photos';

function encodeFilesToSession(extFiles, intFiles) {
    if (!extFiles.length && !intFiles.length) return;
    const encodeAll = (files) => Promise.all(files.map(f => new Promise(res => {
        const r = new FileReader();
        r.onload = e => res({ name: f.name, type: f.type, data: e.target.result });
        r.readAsDataURL(f);
    })));
    Promise.all([encodeAll(extFiles), encodeAll(intFiles)]).then(([ext, int]) => {
        try { sessionStorage.setItem(PHOTO_KEY, JSON.stringify({ ext, int })); } catch (_) {}
    });
}

function restoreFilesFromSession() {
    try {
        const raw = sessionStorage.getItem(PHOTO_KEY);
        if (!raw) return;
        sessionStorage.removeItem(PHOTO_KEY);
        const { ext, int } = JSON.parse(raw);
        const toFile = ({ name, type, data }) => {
            const arr = Uint8Array.from(atob(data.split(',')[1]), c => c.charCodeAt(0));
            return new File([arr], name, { type });
        };
        state._exteriorFiles = ext.map(toFile);
        state._interiorFiles = int.map(toFile);
    } catch (_) {}
}

function saveDraft(state) {
    try {
        const toSave = { ...state };
        delete toSave._exteriorFiles; // Files can't be serialized
        delete toSave._exteriorUrls;
        delete toSave._interiorFiles;
        delete toSave._interiorUrls;
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
        // Encode current File objects as base64 so they survive the auth redirect
        encodeFilesToSession(state._exteriorFiles, state._interiorFiles);
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
    sessionStorage.removeItem(PHOTO_KEY);
}

// Formatter functions removed in favor of import from inputFormatters.js
const formatNumberWithCommas = (n) => {
    if (n === null || n === undefined || n === '') return '';
    return new Intl.NumberFormat('sl-SI').format(parseInt(n.toString().replace(/\D/g, ''), 10) || 0);
};

// ── Step definitions ──────────────────────────────────────────────────────────
const isVehicleItem = s => (s.itemType || 'vehicle') === 'vehicle';
const isPartItem = s => s.itemType === 'part';
const isTireItem = s => s.itemType === 'tire';
const isOpremaItem = s => s.itemType === 'oprema';

const STEPS = [
    { id: 'typeSelect', title: null },  // 0: vehicle vs parts/tires
    { id: 'entry', title: null, condition: s => isVehicleItem(s) && !auth.currentUser },  // 1: entry mode (logged-out vehicles only)
    { id: 'category', title: 'cl_step_category', number: true },
    { id: 'basic', title: 'cl_step_basic', number: true, condition: isVehicleItem },
    { id: 'technical', title: 'cl_step_technical', number: true, condition: s => isVehicleItem(s) && (!isNavtika() || !vesselCfg().basicEngine) },
    { id: 'equipment', title: 'cl_step_features', number: true, condition: s => isVehicleItem(s) && (!isNavtika() || vesselCfg().equipmentStep !== false) },
    { id: 'partDetails', title: 'cl_step_part_details', number: true, condition: isPartItem },
    { id: 'tireDetails', title: 'cl_step_tire_details', number: true, condition: isTireItem },
    { id: 'opremaDetails', title: 'cl_step_oprema_details', number: true, condition: isOpremaItem },
    { id: 'media', title: 'cl_step_photos', number: true },
    { id: 'description', title: 'cl_step_description', number: true },
    // Auction setup — only for dražba. Package, starting price, seller contract.
    { id: 'auctionSetup', title: 'cl_step_auction', number: true, condition: s => s.entryType === 'auction' },
    { id: 'price', title: 'cl_step_price', number: true, condition: s => s.entryType !== 'auction' },
    { id: 'location', title: 'cl_step_location', number: true },
    // Promotion (visibility) tiers don't apply to auctions — package is chosen above.
    { id: 'promotion', title: 'cl_step_visibility', number: true, condition: s => s.entryType !== 'auction' },
    { id: 'review', title: 'cl_step_review', number: true },
    { id: 'auth', title: 'cl_step_signin', condition: () => !auth.currentUser },
];

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
    currentStep: 0,
    entryType: 'classic',           // 'classic' | 'auction' (dražba)
    // Auction (dražba) setup
    auctionPackageId: 'auctionFree', // 'auctionFree' (21 dni/brezplačno) | 'auction45d' (45 dni/2,99€)
    auctionType: 'regular',          // 'regular' | 'silent'
    auctionDurationWeeks: 3,
    startPriceEur: '',
    reservePriceEur: '',
    sellerContract: null,           // { type:'sign'|'print', signatureData:string|null }
    category: 'avto',
    subcategory: '',
    bodyType: '',
    // Item kind: 'vehicle' (default) | 'part' | 'tire'
    itemType: 'vehicle',
    vehicleCategory: '',
    // Parts
    partGroup: '', partType: '', partTypeLabel: '', oemNumber: '', brand: '',
    vehicleApplication: { make: '', model: '', yearFrom: '', yearTo: '' },
    // Moto equipment (itemType === 'oprema')
    equipmentGroup: '', equipmentType: '', equipmentTypeLabel: '', equipmentSize: '',
    // Tires
    tireSize: '', tireWidth: '', tireAspect: '', tireRim: '',
    tireSeason: '', treadDepthMm: '', dotYear: '', tireCount: '',
    make: '', model: '', variant: '', linija: '', year: '', mileageKm: '',
    color: '', colorType: 'solid', doorsCount: '', seatsCount: '',
    condition: 'Rabljeno', firstRegistration: '', previousOwnersCount: '',
    fuel: '', hybridType: null, transmission: '', driveType: '',
    engineCc: '', engineConfig: '', powerKw: '', co2: '', emissionClass: '',
    fuelL100kmCombined: '', fuelL100kmCity: '', fuelL100kmHighway: '',
    batteryKwh: '', rangeKm: '', batteryHealth: '', consumptionKwh100: '', towingKg: '', a2Eligible: false,
    // Navtika-specific fields
    engineHoursUsed: '', lengthM: '', beamM: '', draughtM: '',
    hullMaterial: '', engineCount: '1', driveSystem: '', maxSpeedKn: '',
    fuelTankL: '', waterTankL: '', cabins: '', berths: '',
    equipment: [],
    customEquipment: [],  // [{category, value}] — user-submitted, brand-specific
    _customLinija: '',    // raw text when user picks "+ Dodaj lastno linijo"
    // Navtika custom taxonomy (when not found in plovila JSON)
    _customMake: '',      // free-text brand for navtika
    _customModel: '',     // free-text model for navtika
    _customVrsta: '',     // free-text vessel type when not in category list
    exhaustBrand: '',
    exhaustType: '',
    _exteriorFiles: [],
    _exteriorUrls: [],
    _interiorFiles: [],
    _interiorUrls: [],
    coverIndex: 0,
    description: '',
    priceEur: '', salePriceEur: null, priceNegotiable: false, priceInclVat: false, leaseAvailable: false, callForPrice: false, priceIsFinal: false,
    // Sale vs rental (rental = charter on MojaNavtika). Drives rentalPricing.
    listingType: 'sale',
    rentalPricing: { perDay: '', perWeek: '', deposit: '', minDays: '' },
    sellerType: 'private',
    sellerNote: '',
    businessHours: {},
    leasingConditions: '',
    location: { country: '', region: '' },
    contact: { name: '', phone: '', showPhone: false, email: '' },
    promotionTier: 'free',
};

let brandModelData = null;
let editListingId = null; // set when wizard is opened via ?edit=<id>
const isNavtika = () => PLATFORM.id === 'navtika';

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
function parseSpecsFromTrimName(trimName) {
    const specs = {};
    if (!trimName) return specs;

    // 1. Parse engine capacity in cc from decimal liters (e.g., "1.6", "2.0")
    const literMatch = trimName.match(/\b([0-8]\.[0-9])(l|L)?\b/);
    if (literMatch) {
        const liters = parseFloat(literMatch[1]);
        if (liters >= 0.8 && liters <= 8.0) {
            specs.engine_capacity_cc = Math.round(liters * 1000);
        }
    } else {
        // Look for 3 or 4 digit numbers between 800 and 8000 representing cc directly
        const ccMatch = trimName.match(/\b([89][0-9]{2}|[1-7][0-9]{3})\b/);
        if (ccMatch) {
            specs.engine_capacity_cc = parseInt(ccMatch[1], 10);
        }
    }

    // 2. Parse fuel type from common abbreviations
    const lowerTrim = trimName.toLowerCase();
    const dieselKeywords = ['tdi', 'cdi', 'jtd', 'hdi', 'crdi', 'dci', 'ddis', 'tdci', 'dizel', 'diesel'];
    const petrolKeywords = ['tsi', 'tfsi', 'vti', 'gti', 'mpi', 'fsi', 't-gdi', 'tce', 'vtec', 'ts', 'bencin', 'petrol', 'gasoline'];
    const hybridKeywords = ['phev', 'hybrid', 'hibrid', 'e-hybrid', 'gte'];
    const electricKeywords = ['electric', 'električni', 'ev', 'plaid'];

    if (hybridKeywords.some(kw => new RegExp(`\\b${kw}\\b|${kw}`).test(lowerTrim))) {
        specs.fuel_type = 'Hybrid';
    } else if (electricKeywords.some(kw => new RegExp(`\\b${kw}\\b|${kw}`).test(lowerTrim))) {
        specs.fuel_type = 'Electric';
    } else if (dieselKeywords.some(kw => {
        if (kw === 'd') {
            return /\b\d{3}d\b|\bd\b/.test(lowerTrim) || lowerTrim.endsWith('d');
        }
        return new RegExp(`\\b${kw}\\b|${kw}`).test(lowerTrim);
    })) {
        specs.fuel_type = 'Diesel';
    } else if (petrolKeywords.some(kw => new RegExp(`\\b${kw}\\b|${kw}`).test(lowerTrim))) {
        specs.fuel_type = 'Petrol';
    }

    return specs;
}

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
    if (!matched) return;

    let specs = {};
    if (typeof matched === 'string') {
        specs = parseSpecsFromTrimName(matched);
    } else {
        specs = normalizeTrimEntryLocal(matched);
        // Fallback: parse missing specs from name
        const parsed = parseSpecsFromTrimName(specs.trim);
        if (!specs.fuel_type && parsed.fuel_type) specs.fuel_type = parsed.fuel_type;
        if (!specs.engine_capacity_cc && parsed.engine_capacity_cc) specs.engine_capacity_cc = parsed.engine_capacity_cc;
    }

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
            const wrap = el.closest('.cl-field');
            if (wrap && !wrap.querySelector('.cl-autofill-icon')) {
                const label = wrap.querySelector('.cl-label');
                const icon = document.createElement('span');
                icon.className = 'cl-autofill-icon';
                icon.innerHTML = '?';
                icon.title = t('cl_autofill_tooltip', 'Sistem je samodejno izpolnil ta podatek glede na izbran model. Če se podatek razlikuje, ga lahko spremenite.');
                if (label) label.appendChild(icon);
                else wrap.appendChild(icon);
            }
        }
    };

    // Map taxonomy fuel_type → listing state.fuel
    if (specs.fuel_type) {
        const mappedFuel = TAX_FUEL_MAP[specs.fuel_type] || specs.fuel_type;
        fillField('fuel', mappedFuel, 'fFuel');
        // Also fill the basic-step inline fuel selector if visible
        fillField('fuel', mappedFuel, 'fFuelBasic');

        const fuelEl = document.getElementById('fFuel');
        if (fuelEl && fuelEl.value) {
            const isEV = fuelEl.value === 'Elektrika';
            document.getElementById('elFields')?.classList.toggle('visible', isEV);
            document.getElementById('consumptionFields')?.classList.toggle('visible', !isEV && fuelEl.value !== '');
            document.getElementById('hybridFields')?.classList.toggle('visible', fuelEl.value === 'Hibrid');
        }
    }

    if (specs.engine_capacity_cc != null) {
        fillField('engineCc', specs.engine_capacity_cc, 'fEngineCC');
        // Also fill the basic-step inline CC input if visible
        fillField('engineCc', specs.engine_capacity_cc, 'fEngineCCBasic');
    }
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
    const el = document.getElementById('fBodyType');
    if (el) el.value = canonical;
}

// ── Hydrate state from an existing Firestore listing (edit mode) ──────────────
function hydrateStateFromListing(l) {
    // Reset to defaults first so stale state from a previous session doesn't bleed in
    Object.assign(state, {
        entryType: l.entryType || 'classic',
        itemType: l.itemType || 'vehicle',
        category: l.category || 'avto',
        subcategory: l.subcategory || '',
        bodyType: l.bodyType || '',
        vehicleCategory: l.vehicleCategory || '',
        // Vehicle basics
        make: l.make || '',
        model: l.model || '',
        variant: l.variant || '',
        linija: l.linija || '',
        year: l.year ? String(l.year) : '',
        mileageKm: l.mileageKm ?? (l.mileage ? String(l.mileage) : ''),
        color: l.color || '',
        colorType: l.colorType || 'solid',
        doorsCount: l.doorsCount ? String(l.doorsCount) : '',
        seatsCount: l.seatsCount ? String(l.seatsCount) : '',
        condition: l.condition || 'Rabljeno',
        firstRegistration: l.firstRegistration || '',
        previousOwnersCount: l.previousOwnersCount ? String(l.previousOwnersCount) : '',
        // Drivetrain
        fuel: l.fuel || '',
        hybridType: l.hybridType || null,
        transmission: l.transmission || '',
        driveType: l.driveType || '',
        engineCc: l.engineCc ? String(l.engineCc) : '',
        engineConfig: l.engineConfig || '',
        powerKw: l.powerKw ? String(l.powerKw) : '',
        co2: l.co2 ? String(l.co2) : '',
        emissionClass: l.emissionClass || '',
        fuelL100kmCombined: l.fuelL100kmCombined ? String(l.fuelL100kmCombined) : '',
        fuelL100kmCity: l.fuelL100kmCity ? String(l.fuelL100kmCity) : '',
        fuelL100kmHighway: l.fuelL100kmHighway ? String(l.fuelL100kmHighway) : '',
        batteryKwh: l.batteryKwh ? String(l.batteryKwh) : '',
        rangeKm: l.rangeKm ? String(l.rangeKm) : '',
        batteryHealth: l.batteryHealth ? String(l.batteryHealth) : '',
        consumptionKwh100: l.consumptionKwh100 ? String(l.consumptionKwh100) : '',
        towingKg: l.towingKg ? String(l.towingKg) : '',
        a2Eligible: l.a2Eligible || false,
        // Navtika
        engineHoursUsed: l.engineHoursUsed ? String(l.engineHoursUsed) : '',
        lengthM: l.lengthM ? String(l.lengthM) : '',
        beamM: l.beamM ? String(l.beamM) : '',
        draughtM: l.draughtM ? String(l.draughtM) : '',
        hullMaterial: l.hullMaterial || '',
        engineCount: l.engineCount ? String(l.engineCount) : '1',
        driveSystem: l.driveSystem || '',
        maxSpeedKn: l.maxSpeedKn ? String(l.maxSpeedKn) : '',
        fuelTankL: l.fuelTankL ? String(l.fuelTankL) : '',
        waterTankL: l.waterTankL ? String(l.waterTankL) : '',
        cabins: l.cabins ? String(l.cabins) : '',
        berths: l.berths ? String(l.berths) : '',
        // Parts
        partGroup: l.partGroup || '',
        partType: l.partType || '',
        oemNumber: l.oemNumber || '',
        brand: l.brand || '',
        vehicleApplication: l.vehicleApplication || { make: '', model: '', yearFrom: '', yearTo: '' },
        // Tires
        tireSize: l.tireSize || '',
        tireWidth: l.tireWidth ? String(l.tireWidth) : '',
        tireAspect: l.tireAspect ? String(l.tireAspect) : '',
        tireRim: l.tireRim ? String(l.tireRim) : '',
        tireSeason: l.tireSeason || '',
        treadDepthMm: l.treadDepthMm ? String(l.treadDepthMm) : '',
        // Equipment
        equipment: l.equipment || [],
        customEquipment: l.customEquipment || [],
        // Media — keep existing image URLs, no files (user must re-upload to change)
        _exteriorFiles: [],
        _exteriorUrls: Array.isArray(l.images?.exterior) ? [...l.images.exterior] : [],
        _interiorFiles: [],
        _interiorUrls: Array.isArray(l.images?.interior) ? [...l.images.interior] : [],
        coverIndex: l.coverIndex || 0,
        // Description
        description: l.description || '',
        // Price
        priceEur: l.priceEur ? String(l.priceEur) : (l.price ? String(l.price) : ''),
        salePriceEur: l.salePriceEur ? String(l.salePriceEur) : null,
        priceNegotiable: l.priceNegotiable || false,
        priceInclVat: l.priceInclVat || false,
        leaseAvailable: l.leaseAvailable || false,
        callForPrice: l.callForPrice || false,
        priceIsFinal: l.priceIsFinal || false,
        listingType: l.listingType || 'sale',
        isRental: l.isRental || false,
        rentalPricing: l.rentalPricing || { perDay: '', perWeek: '', deposit: '', minDays: '' },
        // Seller
        sellerType: l.sellerType || 'private',
        sellerNote: l.sellerNote || '',
        // Location
        location: l.location || { city: '', postalCode: '', region: '' },
        contact: l.contact || { name: '', phone: '', showPhone: false, email: '' },
        // Promotion — keep existing tier but don't change it via the wizard
        promotionTier: l.promotion?.tier || 'free',
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────
export async function initCreateListingPage() {
    console.log('[CreateListing] init');

    // Prevent browser auto-scroll when focusing inputs/selects inside the listing form
    document.addEventListener('focus', () => {
        const x = window.scrollX, y = window.scrollY;
        requestAnimationFrame(() => window.scrollTo(x, y));
    }, true);

    // Default category for the platform
    if (isNavtika() && state.category === 'avto') {
        state.category = 'colni';
    }

    // Load brands JSON in background (navtika uses plovila JSON)
    const brandsUrl = isNavtika() ? 'json/brands_models_plovila.json' : 'json/brands_models_global.json';
    fetch(brandsUrl)
        .then(r => r.json())
        .then(d => { brandModelData = d; })
        .catch(() => { });

    // Edit mode — detect ?edit=<listingId> in the hash
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const editId = hashParams.get('edit');
    if (editId) {
        editListingId = editId;
        try {
            const existing = await getListingById(editId);
            if (!existing) throw new Error('Listing not found');
            hydrateStateFromListing(existing);
        } catch (e) {
            console.error('[CreateListing] Failed to load listing for edit:', e);
            editListingId = null;
        }
        // Skip draft restore and jump straight to category step
        state.currentStep = getActiveSteps().findIndex(s => s.id === 'category');
        if (state.currentStep < 0) state.currentStep = 0;
        renderCurrentStep();
        return;
    }

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
        typeSelect: renderTypeSelectStep,
        entry: renderEntryStep,
        category: renderCategoryStep,
        basic: renderBasicStep,
        technical: renderTechnicalStep,
        equipment: renderEquipmentStep,
        partDetails: renderPartDetailsStep,
        tireDetails: renderTireDetailsStep,
        opremaDetails: renderOpremaDetailsStep,
        media: renderMediaStep,
        description: renderDescriptionStep,
        auctionSetup: renderAuctionSetupStep,
        price: renderPriceStep,
        location: renderLocationStep,
        promotion: renderPromotionStep,
        review: renderReviewStep,
        auth: renderAuthStep,
    };

    const fn = renderers[def.id];
    if (fn) fn();

    scrollToTopOnMobile();
    if (window.lucide) window.lucide.createIcons();
}

function goNext() {
    _reviewEditSection = null;
    saveDraft(state);
    const active = getActiveSteps();
    if (state.currentStep < active.length - 1) {
        state.currentStep++;
        renderCurrentStep();
    }
}

function goPrev() {
    _reviewEditSection = null;
    saveDraft(state);
    if (state.currentStep > 0) {
        state.currentStep--;
        renderCurrentStep();
    }
}

function jumpToStep(id) {
    _reviewEditSection = null;
    const active = getActiveSteps();
    const idx = active.findIndex(s => s.id === id);
    if (idx >= 0) {
        state.currentStep = idx;
        renderCurrentStep();
    }
}

// ── Step 0: Type selection (vehicle vs parts/tires) ───────────────────────────
// Listing-mode pills (navaden oglas / dražba). Auctions apply to vehicles &
// vessels only — choosing parts/tires forces entryType back to 'classic'.
function listingModePillsHtml() {
    const vLabel = isNavtika() ? t('cl_mode_listing_navtika', 'Navaden oglas') : t('cl_mode_listing', 'Navaden oglas');
    return `
        <div class="cl-mode-pills-wrap">
            <div class="cl-mode-pills" role="tablist" aria-label="${t('cl_mode_label', 'Vrsta objave')}">
                <button type="button" class="cl-mode-pill ${state.entryType !== 'auction' ? 'active' : ''}" data-mode="classic">
                    📄 ${vLabel}
                </button>
                <button type="button" class="cl-mode-pill ${state.entryType === 'auction' ? 'active' : ''}" data-mode="auction">
                    🔨 ${t('cl_mode_auction', 'Dražba')}
                </button>
            </div>
            <p class="cl-mode-hint">${state.entryType === 'auction'
                ? t('cl_mode_auction_hint', 'Dražba je brezplačna (21 dni). Opcijsko podaljšanje na 45 dni za 2,99 €. Provizija ob uspešni prodaji: 1 % (max. 5.000 €).')
                : t('cl_mode_listing_hint', 'Standardni oglas s fiksno ali pogajalno ceno.')}</p>
        </div>`;
}

function bindModePills() {
    document.querySelectorAll('.cl-mode-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            state.entryType = pill.dataset.mode === 'auction' ? 'auction' : 'classic';
            saveDraft(state);
            renderTypeSelectStep(); // re-render to refresh active pill + hint
        });
    });
}

function renderTypeSelectStep() {
    if (isNavtika()) {
        setHtml(`
            <div class="cl-card">
                <h1 class="cl-step-title">${t('cl_type_select_title', 'Kaj želite objaviti?')}</h1>
                <p class="cl-step-sub">${t('cl_type_select_sub', 'Izberite vrsto oglasa.')}</p>
                ${listingModePillsHtml()}
                <div class="cl-entry-cards">
                    <div class="cl-entry-card" id="typeVehicle">
                        <span class="cl-entry-card-icon">⛵</span>
                        <p class="cl-entry-card-title">Plovilo</p>
                        <p class="cl-entry-card-desc">Čoln, jadrnica, jahta, gumenjak, jet-ski ipd.</p>
                    </div>
                    <div class="cl-entry-card ${state.entryType === 'auction' ? 'cl-entry-card--disabled' : ''}" id="typeParts">
                        <span class="cl-entry-card-icon">⚓</span>
                        <p class="cl-entry-card-title">Oprema / Motor</p>
                        <p class="cl-entry-card-desc">Izvenkrmni motorji, navigacija, varnostna oprema.</p>
                    </div>
                </div>
            </div>
        `);

        bindModePills();

        document.getElementById('typeVehicle').addEventListener('click', () => {
            state.itemType = 'vehicle';
            state.category = 'colni';
            goNext();
        });

        document.getElementById('typeParts').addEventListener('click', () => {
            if (state.entryType === 'auction') return; // parts can't be auctioned
            state.itemType = 'part';
            state.category = 'deli';
            state.vehicleCategory = 'colni';
            goNext();
        });
        return;
    }

    setHtml(`
        <div class="cl-card">
            <h1 class="cl-step-title">${t('cl_type_select_title', 'Kaj želite objaviti?')}</h1>
            <p class="cl-step-sub">${t('cl_type_select_sub', 'Izberite vrsto oglasa.')}</p>
            ${listingModePillsHtml()}
            <div class="cl-entry-cards">
                <div class="cl-entry-card" id="typeVehicle">
                    <span class="cl-entry-card-icon">🚗</span>
                    <p class="cl-entry-card-title">${t('cl_type_vehicle', 'Vozilo')}</p>
                    <p class="cl-entry-card-desc">${t('cl_type_vehicle_desc', 'Avto, motor, kombi, prikolica, ipd.')}</p>
                </div>
                <div class="cl-entry-card ${state.entryType === 'auction' ? 'cl-entry-card--disabled' : ''}" id="typeParts">
                    <span class="cl-entry-card-icon">🔧</span>
                    <p class="cl-entry-card-title">${t('cl_type_parts', 'Deli in gume')}</p>
                    <p class="cl-entry-card-desc">${t('cl_type_parts_desc', 'Nadomestni deli, pnevmatike, oprema.')}</p>
                </div>
            </div>

            <button type="button" class="cl-ai-launch ${state.entryType === 'auction' ? 'cl-ai-launch--disabled' : ''}" id="typeAiImport">
                <span class="cl-ai-launch-icon">✨</span>
                <span class="cl-ai-launch-text">
                    <span class="cl-ai-launch-title">${t('cl_ai_launch_title', 'Že imate oglas?')} <span class="cl-ai-badge">${t('cl_ai_badge', 'Eksperimentalno')}</span></span>
                    <span class="cl-ai-launch-desc">${t('cl_ai_launch_desc', 'Uvozite obstoječi oglas s pomočjo AI (ChatGPT / DeepSeek) — izpolnimo vse razen fotografij.')}</span>
                </span>
                <span class="cl-ai-launch-arrow">→</span>
            </button>
        </div>
    `);

    bindModePills();

    document.getElementById('typeVehicle').addEventListener('click', () => {
        state.itemType = 'vehicle';
        state.category = 'avto';
        goNext();
    });

    document.getElementById('typeParts').addEventListener('click', () => {
        if (state.entryType === 'auction') return; // parts can't be auctioned
        state.itemType = 'part';
        state.category = 'deli';
        goNext();
    });

    document.getElementById('typeAiImport').addEventListener('click', () => {
        if (state.entryType === 'auction') return; // AI import is for standard vehicle listings
        openAiImportOverlay({ onApply: applyAiImport });
    });
}

// ── AI import ("Že imate oglas?") ─────────────────────────────────────────────
// Receives a validated/sanitised partial from aiListingImport, overlays it onto
// state, and drops the user on the photo step (photos must be uploaded manually).
function applyAiImport(data, warnings) {
    // Force a standard vehicle listing regardless of the entry path.
    state.itemType = 'vehicle';
    state.entryType = 'classic';
    const proposedLinija = data._linijaProposed || '';
    delete data._linijaProposed;
    Object.assign(state, data);
    if (!Array.isArray(state.equipment)) state.equipment = [];
    if (!Array.isArray(state.customEquipment)) state.customEquipment = [];
    state._customLinija = '';

    const finish = (extraWarnings) => {
        const all = [...(warnings || []), ...(extraWarnings || [])];
        state._aiImported = true;
        state._aiImportWarnings = all.length ? all : null;
        saveDraft(state);
        jumpToStep('media');
    };

    // Resolve the AI-provided linija against the per-brand known lines. If it's a
    // known line we keep state.linija; otherwise it becomes a custom proposal that
    // flows into taxonomy_proposals (admin approval), same as a manual entry.
    if (proposedLinija && state.make) {
        fetch('json/vehicle_lines.json')
            .then(r => (r.ok ? r.json() : {}))
            .then(map => {
                const known = (map[state.make] || []);
                const match = known.find(l => l.toLowerCase() === proposedLinija.toLowerCase());
                if (match) { state.linija = match; finish(); }
                else {
                    state.linija = '';
                    state._customLinija = proposedLinija;
                    finish([`Linija «${proposedLinija}» še ni v sistemu — predlagana je v pregled uredništvu.`]);
                }
            })
            .catch(() => { state.linija = ''; state._customLinija = proposedLinija; finish(); });
        return;
    }
    finish();
}

// ── Step 1: Entry mode (vehicles only) ────────────────────────────────────────
function renderEntryStep() {
    const sellerToggleHtml = auth.currentUser
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
           </div>`;

    // Navtika: just seller type + manual entry
    if (isNavtika()) {
        setHtml(`
            <div class="cl-card">
                <h1 class="cl-step-title">Kako boste oddali oglas?</h1>
                <p class="cl-step-sub">Izberite vašo vlogo in začnite z ročnim vnosom podatkov.</p>
                <div class="cl-field" style="margin-bottom:1.5rem;">
                    <label class="cl-label">${t('cl_seller_type')}</label>
                    ${sellerToggleHtml}
                </div>
                <div class="cl-entry-cards">
                    <div class="cl-entry-card recommended" id="entryClassic">
                        <span class="cl-entry-card-icon">📋</span>
                        <p class="cl-entry-card-title">Ročni vnos</p>
                        <p class="cl-entry-card-desc">Izpolnite podatke o plovilu korak za korakom.</p>
                        <ul class="cl-entry-card-features">
                            <li>Vsa plovila in motorne čolne</li>
                            <li>Jadrnice, jahte, jet-ski</li>
                            <li>Vedno brezplačno</li>
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
            goNext();
        });
        return;
    }

    setHtml(`
        <div class="cl-card">
            <h1 class="cl-step-title">${t('cl_step_entry_title')}</h1>
            <p class="cl-step-sub">${t('cl_step_entry_sub')}</p>

            <div class="cl-field" style="margin-bottom:1.5rem;">
                <label class="cl-label">${t('cl_seller_type')}</label>
                ${sellerToggleHtml}
            </div>

            <div class="cl-entry-cards">
                <div class="cl-entry-card recommended" id="entryClassic">
                    <span class="cl-entry-card-icon">📋</span>
                    <p class="cl-entry-card-title">${t('cl_manual_entry')}</p>
                    <p class="cl-entry-card-desc">${t('cl_manual_entry_desc')}</p>
                    <ul class="cl-entry-card-features">
                        <li>${t('cl_manual_entry_older')}</li>
                        <li>${t('cl_manual_entry_imported')}</li>
                        <li>${t('cl_always_free')}</li>
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
        goNext();
    });
}

// ── Step 2: Category ──────────────────────────────────────────────────────────
const CATEGORIES_AVTO = [
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
    { id: 'deli', label: 'cl_cat_deli', icon: 'wrench', subs: [] }
];

const CATEGORIES_NAVTIKA = [
    {
        id: 'colni',
        label: 'cat_boats',
        icon: 'sailboat',
        subs: [
            { name: 'cat_motorboat', value: 'motorni-coln', icon: 'sailboat' },
            { name: 'cat_yachts', value: 'jahte', icon: 'ship' }
        ]
    },
    {
        id: 'jadrnice',
        label: 'cat_sailboats',
        icon: 'sailboat',
        subs: [
            { name: 'cat_sailboat', value: 'jadrnica', icon: 'sailboat' },
            { name: 'cat_catamaran', value: 'katamaran', icon: 'sailboat' }
        ]
    },
    {
        id: 'gumenjaki',
        label: 'cat_inflatables',
        icon: 'sailboat',
        subs: [
            { name: 'cat_rib', value: 'rib', icon: 'sailboat' },
            { name: 'cat_soft_inflatable', value: 'mehki-gumenjak', icon: 'sailboat' }
        ]
    },
    {
        id: 'jet-ski',
        label: 'cat_jet_ski',
        icon: 'waves',
        subs: [
            { name: 'vtype_pwc_runabout', value: 'SedeciJetSki', icon: 'waves' },
            { name: 'vtype_pwc_standup', value: 'StojeciJetSki', icon: 'waves' }
        ]
    },
    {
        id: 'izvenkrmni-motorji',
        label: 'cat_outboard_engines',
        icon: 'cog',
        subs: [
            { name: 'cat_engine_class', value: 'razred', icon: 'cog' }
        ]
    },
    { id: 'deli', label: 'cat_boat_equipment', icon: 'wrench', subs: [] }
];

const CATEGORIES = PLATFORM.id === 'navtika' ? CATEGORIES_NAVTIKA : CATEGORIES_AVTO;

// ── Per-vessel-type listing config (navtika) ──────────────────────────────────
// Keyed by state.category (the CATEGORIES_NAVTIKA ids — note hyphens). Drives which
// field groups / engine options the navtika Basic + Technical steps render, and
// whether the equipment step applies. See renderNavtikaBasicStep / *TechnicalStep.
//   hullComfort  : show "trup in udobje" (hull material, cabins/berths, beam/draught)
//   engineBrand  : show the "Znamka motorja" custom dropdown
//   equipmentStep: include the additional-equipment wizard step
//   engineTypes  : 'all' (incl. sail) | 'noSail' (drop "Brez motorja"/"Jadra")
//   driveSystem  : show the "Pogonski sistem" field
//   basicEngine  : show engine power/hours/type inside the Basic step (jet-ski)
//   motorProduct : the listing IS the engine (outboard motors) — no drive grouping
//   hullMaterials: 'inflatable' for a RIB-specific hull-material list
const VESSEL_TYPE_CONFIG = {
    'colni':              { hullComfort: true,  engineBrand: true,  equipmentStep: true,  engineTypes: 'noSail', driveSystem: true },
    'jadrnice':           { hullComfort: true,  engineBrand: true,  equipmentStep: true,  engineTypes: 'all',    driveSystem: true },
    'gumenjaki':          { hullComfort: true,  engineBrand: true,  equipmentStep: true,  engineTypes: 'noSail', driveSystem: true, hullMaterials: 'inflatable' },
    'jet-ski':            { hullComfort: false, engineBrand: false, equipmentStep: false, engineTypes: 'all',    driveSystem: true, basicEngine: true },
    'izvenkrmni-motorji': { hullComfort: false, engineBrand: false, equipmentStep: true,  engineTypes: 'all',    driveSystem: false, motorProduct: true },
};
const vesselCfg = () => VESSEL_TYPE_CONFIG[state.category] || VESSEL_TYPE_CONFIG['colni'];

function renderCategoryStep() {
    // Parts/tires path: skip the vehicle category grid, show only Del/Pnevmatika + vehicle family pickers
    if (state.itemType === 'part' || state.itemType === 'tire' || state.itemType === 'oprema') {
        setHtml(`
            <div class="cl-card">
                <h2 class="cl-step-title">${t('cl_parts_category_title', 'Vrsta dela ali pnevmatike')}</h2>
                <p class="cl-step-sub">${t('cl_parts_category_sub', 'Izberite tip in za katero vozilo je namenjeno.')}</p>
                <div id="subRow" class="cl-subcategory-row" style="margin-bottom:1.25rem;"></div>
                <div class="cl-nav">
                    <button class="cl-btn cl-btn--ghost" id="btnCatBack">${t('cl_back')}</button>
                    <button class="cl-btn cl-btn--primary" id="btnCatNext">${t('cl_continue')}</button>
                </div>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
        renderDeliConfig(document.getElementById('subRow'));
        document.getElementById('btnCatBack').addEventListener('click', goPrev);
        document.getElementById('btnCatNext').addEventListener('click', () => {
            if (!state.vehicleCategory) {
                return alert(t('cl_select_vehicle_cat_alert', 'Izberite za katero vrsto vozila je del/pnevmatika.'));
            }
            goNext();
        });
        return;
    }

    // Vehicle path: show category grid WITHOUT "deli"
    const catCards = CATEGORIES.filter(c => c.id !== 'deli').map(c => `
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
            state.itemType = 'vehicle';
            state.vehicleCategory = '';
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

    // Parts & tires: pick item type + which vehicle family it is for.
    if (state.category === 'deli') {
        renderDeliConfig(row);
        return;
    }

    // Body type is now selected in the basic step dropdown — hide pills here for vehicle path.
    row.innerHTML = '';
}

// ── Deli / Gume config (inside the category step) ─────────────────────────────
function renderDeliConfig(row) {
    const itemPill = (type, icon, label) => `
        <button class="cl-subcategory-pill ${state.itemType === type ? 'selected' : ''}" data-item="${type}">
            <i data-lucide="${icon}" class="cl-sub-icon"></i> ${label}
        </button>`;

    const vehiclePill = (vc) => `
        <button class="cl-subcategory-pill ${state.vehicleCategory === vc.value ? 'selected' : ''}" data-vehcat="${vc.value}">
            <i data-lucide="${vc.icon}" class="cl-sub-icon"></i> ${vc.label}
        </button>`;

    // Moto equipment (oprema) is moto-only; hide the "for which vehicle" row for it.
    const vehRowHidden = state.itemType === 'oprema';

    row.innerHTML = `
        <div style="width:100%;">
            <label class="cl-label" style="margin-bottom:0.5rem;display:block;">${t('cl_what_are_you_listing', 'Kaj objavljate?')}</label>
            <div class="cl-subcategory-row" id="deliItemRow" style="margin-bottom:1rem;">
                ${itemPill('part', 'wrench', t('cl_sub_del', 'Nadomestni del'))}
                ${itemPill('tire', 'disc-3', t('cl_sub_guma', 'Pnevmatika'))}
                ${itemPill('oprema', 'shield', t('cl_sub_oprema', 'Moto oprema'))}
            </div>
            <label class="cl-label" style="margin-bottom:0.5rem;display:block;${vehRowHidden ? 'display:none;' : ''}" id="deliVehLabel">${t('gd_choose_vehicle_cat', 'Za katero vozilo?')}</label>
            <div class="cl-subcategory-row" id="deliVehRow" style="${vehRowHidden ? 'display:none;' : ''}">
                ${VEHICLE_CATEGORIES.map(vehiclePill).join('')}
            </div>
        </div>`;

    if (window.lucide) window.lucide.createIcons({ scope: row });

    row.querySelectorAll('#deliItemRow .cl-subcategory-pill').forEach(p => {
        p.addEventListener('click', () => {
            row.querySelectorAll('#deliItemRow .cl-subcategory-pill').forEach(pp => pp.classList.remove('selected'));
            p.classList.add('selected');
            state.itemType = p.dataset.item;
            // Reset part-specific selections when switching kind
            state.partGroup = ''; state.partType = ''; state.partTypeLabel = '';
            state.equipmentGroup = ''; state.equipmentType = ''; state.equipmentTypeLabel = ''; state.equipmentSize = '';
            // Equipment is moto gear — pin the vehicle family and re-render to hide the veh row
            if (state.itemType === 'oprema') state.vehicleCategory = 'moto';
            renderDeliConfig(row);
        });
    });

    row.querySelectorAll('#deliVehRow .cl-subcategory-pill').forEach(p => {
        p.addEventListener('click', () => {
            row.querySelectorAll('#deliVehRow .cl-subcategory-pill').forEach(pp => pp.classList.remove('selected'));
            p.classList.add('selected');
            state.vehicleCategory = p.dataset.vehcat;
            // Part groups depend on vehicle family — reset on change
            state.partGroup = ''; state.partType = ''; state.partTypeLabel = '';
        });
    });
}

// ── Step: Part details ────────────────────────────────────────────────────────
function renderPartDetailsStep() {
    const nav = isNavtika();
    const groups = getPartGroups(state.vehicleCategory);
    const groupOpts = groups.map(g =>
        `<option value="${g.value}" ${state.partGroup === g.value ? 'selected' : ''}>${g.label}</option>`).join('');

    const typeOpts = (state.partGroup ? getPartTypes(state.vehicleCategory, state.partGroup) : [])
        .map(tp => `<option value="${tp.value}" ${state.partType === tp.value ? 'selected' : ''}>${tp.label}</option>`).join('');

    const brandPlaceholder = nav ? 'npr. Garmin, Yamaha, Musto' : 'npr. Bosch, Sachs';
    const oemPlaceholder = nav ? 'npr. 4XE-45728-00' : 'npr. 1K0615301AA';

    const compatibilityHtml = nav ? '' : `
            <div class="cl-label" style="margin:1.25rem 0 0.5rem;border-top:1px solid rgba(0,0,0,0.08);padding-top:1rem;font-weight:700;">${t('gd_compatibility', 'Združljivost (neobvezno)')}</div>
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_make', 'Znamka vozila')}</label>
                    <input class="cl-input" id="fAppMake" type="text" value="${escHtml(state.vehicleApplication?.make || '')}" placeholder="npr. Volkswagen" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_model', 'Model vozila')}</label>
                    <input class="cl-input" id="fAppModel" type="text" value="${escHtml(state.vehicleApplication?.model || '')}" placeholder="npr. Golf" />
                </div>
            </div>
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_year_from', 'Letnik od')}</label>
                    <input class="cl-input" id="fAppYearFrom" type="number" value="${escHtml(String(state.vehicleApplication?.yearFrom || ''))}" placeholder="npr. 2012" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_year_to', 'Letnik do')}</label>
                    <input class="cl-input" id="fAppYearTo" type="number" value="${escHtml(String(state.vehicleApplication?.yearTo || ''))}" placeholder="npr. 2020" />
                </div>
            </div>`;

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${nav ? 'Podatki o opremi' : t('cl_step_part_details', 'Podatki o delu')}</h2>
            <p class="cl-step-sub">${nav ? 'Opišite opremo ali motor, ki ga prodajate.' : t('cl_part_details_sub', 'Opišite del, ki ga prodajate.')}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('gd_part_group', 'Sklop')} <span class="req">*</span></label>
                    <select class="cl-select" id="fPartGroup">
                        <option value="">${t('cl_sel_part_group', 'Izberite sklop')}</option>
                        ${groupOpts}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${nav ? 'Vrsta opreme' : t('gd_part_type', 'Vrsta dela')} <span class="req">*</span></label>
                    <select class="cl-select" id="fPartType" ${state.partGroup ? '' : 'disabled'}>
                        <option value="">${t('cl_sel_part_type', 'Najprej izberite sklop')}</option>
                        ${typeOpts}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_condition', 'Stanje')} <span class="req">*</span></label>
                    <select class="cl-select" id="fPartCondition">
                        <option value="Rabljeno" ${state.condition === 'Rabljeno' ? 'selected' : ''}>${t('gd_condition_used', 'Rabljeno')}</option>
                        <option value="Novo" ${state.condition === 'Novo' ? 'selected' : ''}>${t('gd_condition_new', 'Novo')}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('gd_part_brand', 'Znamka / proizvajalec')}</label>
                    <input class="cl-input" id="fPartBrand" type="text" value="${escHtml(state.brand || '')}" placeholder="${brandPlaceholder}" />
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('gd_oem_number', 'OEM / kataloška številka')}</label>
                    <input class="cl-input" id="fOem" type="text" value="${escHtml(state.oemNumber || '')}" placeholder="${oemPlaceholder}" />
                </div>
            </div>

            ${compatibilityHtml}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnPartBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnPartNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    const groupSel = document.getElementById('fPartGroup');
    const typeSel = document.getElementById('fPartType');
    groupSel.addEventListener('change', () => {
        state.partGroup = groupSel.value;
        state.partType = '';
        state.partTypeLabel = '';
        const types = getPartTypes(state.vehicleCategory, state.partGroup);
        typeSel.innerHTML = `<option value="">${t('cl_sel_part_type', 'Izberite vrsto')}</option>` +
            types.map(tp => `<option value="${tp.value}">${tp.label}</option>`).join('');
        typeSel.disabled = !state.partGroup;
    });
    typeSel.addEventListener('change', () => {
        state.partType = typeSel.value;
        state.partTypeLabel = getPartTypeLabel(state.vehicleCategory, state.partGroup, typeSel.value);
    });

    document.getElementById('btnPartBack').addEventListener('click', goPrev);
    document.getElementById('btnPartNext').addEventListener('click', () => {
        state.partGroup = groupSel.value;
        state.partType = typeSel.value;
        state.partTypeLabel = getPartTypeLabel(state.vehicleCategory, state.partGroup, typeSel.value);
        state.condition = document.getElementById('fPartCondition').value;
        state.brand = document.getElementById('fPartBrand').value.trim();
        state.oemNumber = document.getElementById('fOem').value.trim();
        if (!nav) {
            state.vehicleApplication = {
                make: document.getElementById('fAppMake').value.trim(),
                model: document.getElementById('fAppModel').value.trim(),
                yearFrom: document.getElementById('fAppYearFrom').value.trim(),
                yearTo: document.getElementById('fAppYearTo').value.trim(),
            };
        }
        if (!state.partGroup || !state.partType) {
            return alert(nav ? 'Izberite sklop in vrsto opreme.' : t('cl_part_required_alert', 'Izberite sklop in vrsto dela.'));
        }
        goNext();
    });
}

// ── Step: Moto equipment details ──────────────────────────────────────────────
function renderOpremaDetailsStep() {
    const groups = getEquipmentGroups();
    const groupOpts = groups.map(g =>
        `<option value="${g.value}" ${state.equipmentGroup === g.value ? 'selected' : ''}>${g.label}</option>`).join('');

    const typeOpts = (state.equipmentGroup ? getEquipmentTypes(state.equipmentGroup) : [])
        .map(tp => `<option value="${tp.value}" ${state.equipmentType === tp.value ? 'selected' : ''}>${tp.label}</option>`).join('');

    const sizeOpts = EQUIPMENT_SIZES.map(s =>
        `<option value="${s}" ${state.equipmentSize === s ? 'selected' : ''}>${s}</option>`).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_step_oprema_details', 'Podatki o opremi')}</h2>
            <p class="cl-step-sub">${t('cl_oprema_details_sub', 'Opišite motoristično opremo, ki jo prodajate.')}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('gd_eq_group', 'Sklop opreme')} <span class="req">*</span></label>
                    <select class="cl-select" id="fEqGroup">
                        <option value="">${t('cl_sel_eq_group', 'Izberite sklop')}</option>
                        ${groupOpts}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('gd_eq_type', 'Vrsta')} <span class="req">*</span></label>
                    <select class="cl-select" id="fEqType" ${state.equipmentGroup ? '' : 'disabled'}>
                        <option value="">${t('cl_sel_eq_type', 'Najprej izberite sklop')}</option>
                        ${typeOpts}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('gd_part_brand', 'Znamka / proizvajalec')}</label>
                    <select class="cl-select" id="fEqBrand">
                        <option value="">${t('all_brands', 'Vse znamke')}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('gd_eq_size', 'Velikost')}</label>
                    <select class="cl-select" id="fEqSize">
                        <option value="">—</option>
                        ${sizeOpts}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_condition', 'Stanje')} <span class="req">*</span></label>
                    <select class="cl-select" id="fEqCondition">
                        <option value="Rabljeno" ${state.condition === 'Rabljeno' ? 'selected' : ''}>${t('gd_condition_used', 'Rabljeno')}</option>
                        <option value="Novo" ${state.condition === 'Novo' ? 'selected' : ''}>${t('gd_condition_new', 'Novo')}</option>
                    </select>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnEqBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnEqNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    const groupSel = document.getElementById('fEqGroup');
    const typeSel = document.getElementById('fEqType');
    groupSel.addEventListener('change', () => {
        state.equipmentGroup = groupSel.value;
        state.equipmentType = '';
        state.equipmentTypeLabel = '';
        const types = getEquipmentTypes(state.equipmentGroup);
        typeSel.innerHTML = `<option value="">${t('cl_sel_eq_type', 'Izberite vrsto')}</option>` +
            types.map(tp => `<option value="${tp.value}">${tp.label}</option>`).join('');
        typeSel.disabled = !state.equipmentGroup;
    });
    typeSel.addEventListener('change', () => {
        state.equipmentType = typeSel.value;
        state.equipmentTypeLabel = getEquipmentTypeLabel(state.equipmentGroup, typeSel.value);
    });

    // Brand dropdown — load from JSON (managed in admin center)
    fetch('json/equipment_brands.json')
        .then(r => r.json())
        .then(brands => {
            const sel = document.getElementById('fEqBrand');
            if (!sel) return;
            brands.forEach(b => {
                const o = document.createElement('option');
                o.value = b; o.textContent = b;
                if (b === state.brand) o.selected = true;
                sel.appendChild(o);
            });
            sel.value = state.brand || '';
        })
        .catch(() => {});

    document.getElementById('btnEqBack').addEventListener('click', goPrev);
    document.getElementById('btnEqNext').addEventListener('click', () => {
        state.equipmentGroup = groupSel.value;
        state.equipmentType = typeSel.value;
        state.equipmentTypeLabel = getEquipmentTypeLabel(state.equipmentGroup, typeSel.value);
        state.brand = document.getElementById('fEqBrand').value;
        state.equipmentSize = document.getElementById('fEqSize').value;
        state.condition = document.getElementById('fEqCondition').value;
        if (!state.equipmentGroup || !state.equipmentType) {
            return alert(t('cl_oprema_required_alert', 'Izberite sklop in vrsto opreme.'));
        }
        goNext();
    });
}

// ── Step: Tire details ────────────────────────────────────────────────────────
function renderTireDetailsStep() {
    const widths = []; for (let w = 125; w <= 355; w += 5) widths.push(w);
    const aspects = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
    const rims = []; for (let r = 10; r <= 24; r++) rims.push(r);
    const opt = (v, sel) => `<option value="${v}" ${String(sel) === String(v) ? 'selected' : ''}>${v}</option>`;

    const isUsed = state.condition !== 'Novo';

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_step_tire_details', 'Podatki o pnevmatiki')}</h2>
            <p class="cl-step-sub">${t('cl_tire_details_sub', 'Vnesite dimenzijo in lastnosti pnevmatik.')}</p>

            <label class="cl-label">${t('gd_tire_size', 'Dimenzija')} <span class="req">*</span></label>
            <div class="cl-row" style="align-items:flex-end;">
                <div class="cl-field">
                    <label class="cl-label" style="font-size:0.78rem;opacity:0.7;">${t('gd_tire_width', 'Širina')}</label>
                    <select class="cl-select" id="fTireWidth"><option value="">—</option>${widths.map(w => opt(w, state.tireWidth)).join('')}</select>
                </div>
                <div class="cl-field">
                    <label class="cl-label" style="font-size:0.78rem;opacity:0.7;">${t('gd_tire_aspect', 'Profil')}</label>
                    <select class="cl-select" id="fTireAspect"><option value="">—</option>${aspects.map(a => opt(a, state.tireAspect)).join('')}</select>
                </div>
                <div class="cl-field">
                    <label class="cl-label" style="font-size:0.78rem;opacity:0.7;">${t('gd_tire_rim', 'Premer (R)')}</label>
                    <select class="cl-select" id="fTireRim"><option value="">—</option>${rims.map(r => opt(r, state.tireRim)).join('')}</select>
                </div>
            </div>
            <p class="cl-step-sub" id="tireSizePreview" style="margin-top:-0.5rem;font-weight:700;">${state.tireSize || ''}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('gd_season', 'Sezona')} <span class="req">*</span></label>
                    <select class="cl-select" id="fTireSeason">
                        <option value="">${t('cl_sel_season', 'Izberite sezono')}</option>
                        <option value="letne" ${state.tireSeason === 'letne' ? 'selected' : ''}>${t('gd_season_summer', 'Letne')}</option>
                        <option value="zimske" ${state.tireSeason === 'zimske' ? 'selected' : ''}>${t('gd_season_winter', 'Zimske')}</option>
                        <option value="celoletne" ${state.tireSeason === 'celoletne' ? 'selected' : ''}>${t('gd_season_allseason', 'Celoletne')}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('gd_part_brand', 'Znamka')}</label>
                    <input class="cl-input" id="fTireBrand" type="text" value="${escHtml(state.brand || '')}" placeholder="npr. Michelin" />
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_condition', 'Stanje')} <span class="req">*</span></label>
                    <select class="cl-select" id="fTireCondition">
                        <option value="Rabljeno" ${state.condition === 'Rabljeno' ? 'selected' : ''}>${t('gd_condition_used', 'Rabljeno')}</option>
                        <option value="Novo" ${state.condition === 'Novo' ? 'selected' : ''}>${t('gd_condition_new', 'Novo')}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('gd_tire_count', 'Število kosov')}</label>
                    <select class="cl-select" id="fTireCount">
                        ${[1, 2, 4].map(n => `<option value="${n}" ${String(state.tireCount) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-row" id="usedTireRow" style="${isUsed ? '' : 'display:none;'}">
                <div class="cl-field">
                    <label class="cl-label">${t('gd_tread_depth', 'Globina profila (mm)')}</label>
                    <input class="cl-input" id="fTread" type="number" step="0.1" value="${escHtml(String(state.treadDepthMm || ''))}" placeholder="npr. 6.5" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('gd_dot_year', 'DOT leto')}</label>
                    <input class="cl-input" id="fDot" type="text" value="${escHtml(state.dotYear || '')}" placeholder="npr. 2021" />
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnTireBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnTireNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    const wSel = document.getElementById('fTireWidth');
    const aSel = document.getElementById('fTireAspect');
    const rSel = document.getElementById('fTireRim');
    const preview = document.getElementById('tireSizePreview');
    const updateSize = () => {
        if (wSel.value && aSel.value && rSel.value) {
            state.tireSize = `${wSel.value}/${aSel.value} R${rSel.value}`;
        } else {
            state.tireSize = '';
        }
        preview.textContent = state.tireSize;
    };
    [wSel, aSel, rSel].forEach(s => s.addEventListener('change', updateSize));

    document.getElementById('fTireCondition').addEventListener('change', (e) => {
        document.getElementById('usedTireRow').style.display = e.target.value === 'Novo' ? 'none' : '';
    });

    document.getElementById('btnTireBack').addEventListener('click', goPrev);
    document.getElementById('btnTireNext').addEventListener('click', () => {
        updateSize();
        state.tireWidth = wSel.value;
        state.tireAspect = aSel.value;
        state.tireRim = rSel.value;
        state.tireSeason = document.getElementById('fTireSeason').value;
        state.brand = document.getElementById('fTireBrand').value.trim();
        state.condition = document.getElementById('fTireCondition').value;
        state.tireCount = document.getElementById('fTireCount').value;
        state.treadDepthMm = document.getElementById('fTread')?.value || '';
        state.dotYear = document.getElementById('fDot')?.value || '';
        if (!state.tireSize) return alert(t('cl_tire_size_alert', 'Izberite širino, profil in premer pnevmatike.'));
        if (!state.tireSeason) return alert(t('cl_tire_season_alert', 'Izberite sezono pnevmatike.'));
        goNext();
    });
}

// ── Step 3: Basic data ────────────────────────────────────────────────────────
function renderBasicStep() {
    if (isNavtika()) return renderNavtikaBasicStep();

    const years = [];
    for (let y = new Date().getFullYear() + 1; y >= 1960; y--) years.push(y);

    const COLORS = ['Bela', 'Črna', 'Siva', 'Srebrna', 'Modra', 'Rdeča', 'Zelena', 'Rumena', 'Rjava', 'Oranžna', 'Vijolična', 'Zlata', 'Bronasta', 'Druga'];

    const yearOpts = years.map(y => `<option value="${y}" ${Number(state.year) === y ? 'selected' : ''}>${y}</option>`).join('');

    const categorySubs = CATEGORIES.find(c => c.id === state.category)?.subs || [];
    const bodyTypeOpts = categorySubs.map(s => {
        const val = s.value || s.name;
        return `<option value="${val}" ${state.bodyType === val ? 'selected' : ''}>${t(s.name)}</option>`;
    }).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_basic_title')}</h2>
            <p class="cl-step-sub">${t('cl_basic_sub')}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_make')} <span class="req">*</span></label>
                    <select class="cl-select" id="fMake">
                        <option value="">${t('cl_sel_make')}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_model')} <span class="req">*</span></label>
                    <select class="cl-select" id="fModel">
                        <option value="">${t('cl_sel_model_first')}</option>
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_year')} <span class="req">*</span></label>
                    <select class="cl-select" id="fYear">
                        <option value="">${t('cl_sel_year')}</option>${yearOpts}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_variant')}</label>
                    <select class="cl-select" id="fVariant">
                        <option value="">${t('cl_sel_trim')}</option>
                    </select>
                </div>
            </div>

            <div class="cl-row" id="fLinijaRow" style="display:none">
                <div class="cl-field" style="flex:1">
                    <label class="cl-label">${t('cl_label_line', 'Linija')}</label>
                    <select class="cl-select" id="fLinija">
                        <option value="">${t('cl_sel_line', '— Izberite linijo —')}</option>
                    </select>
                </div>
                <div class="cl-field" style="flex:1"></div>
            </div>
            <div id="fLinijaCustomRow" style="display:none">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_line_custom', 'Ime lastne linije')}</label>
                    <input class="cl-input" id="fLinijaCustom" type="text" maxlength="60"
                        placeholder="${t('cl_placeholder_line_custom', 'npr. S Line, GT-Line, Black Edition')}" autocomplete="off" />
                    <p class="cl-hint cl-hint--warn" style="margin-top:.4rem">
                        <strong>Pozor:</strong> Vnesite <em>samo ime linije</em> (npr. <em>Audi A6 S Tronic</em> je sprejemljivo, <em>Audi A6 Avant 2.0 TDI S tronic quattro panorama</em> ni). Oglasi z napačno vnesenimi linijami bodo odstranjeni.
                    </p>
                </div>
            </div>

            <div class="cl-row cl-autofill-row" id="fuelCcRow">
                <div class="cl-field" id="fFuelBasicWrap">
                    <label class="cl-label">${t('cl_label_fuel', 'Gorivo')} <span class="req">*</span></label>
                    <select class="cl-select" id="fFuelBasic">
                        <option value="">${t('cl_select', 'Izberite')}</option>
                        ${[
                            ['Petrol', t('cl_fuel_petrol', 'Bencin')],
                            ['Dizel', t('cl_fuel_diesel', 'Dizel')],
                            ['Hibrid', t('cl_fuel_hybrid', 'Hibrid')],
                            ['Elektrika', t('cl_fuel_electric', 'Elektrika')],
                            ['LPG', t('cl_fuel_lpg', 'LPG')],
                            ['CNG', t('cl_fuel_cng', 'CNG')],
                            ['Vodik', t('cl_fuel_hydrogen', 'Vodik')]
                        ].map(([v, l]) => `<option value="${v}" ${state.fuel === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field" id="fEngineCCBasicWrap">
                    <label class="cl-label">${t('cl_label_displacement', 'Prostornina motorja')} (cc)</label>
                    <div class="cl-input-wrap">
                        <input class="cl-input" id="fEngineCCBasic" type="number" min="0" max="15000"
                            value="${state.engineCc || ''}"
                            placeholder="${t('cl_placeholder_displacement', 'npr. 1998')}" />
                        <span class="cl-input-unit">cc</span>
                    </div>
                </div>
            </div>

            ${categorySubs.length > 0 ? `
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_body_type', 'Karoserija')} <span class="req">*</span></label>
                    <select class="cl-select" id="fBodyType">
                        <option value="">${t('cl_sel_body_type', 'Izberite karoserijo')}</option>
                        ${bodyTypeOpts}
                    </select>
                </div>
            </div>` : ''}

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
    const linijaSel = document.getElementById('fLinija');
    const linijaRow = document.getElementById('fLinijaRow');

    const linijaCustomRow = document.getElementById('fLinijaCustomRow');
    const linijaCustomInput = document.getElementById('fLinijaCustom');
    const LINIJA_CUSTOM_SENTINEL = '__custom__';

    let _clVehicleLines = null;
    function loadClVehicleLines() {
        if (_clVehicleLines) return Promise.resolve(_clVehicleLines);
        return fetch('json/vehicle_lines.json')
            .then(r => r.ok ? r.json() : {})
            .then(d => { _clVehicleLines = d; return d; })
            .catch(() => { _clVehicleLines = {}; return {}; });
    }

    function updateLinijaOptions(make) {
        if (!linijaSel || !linijaRow) return;
        linijaSel.innerHTML = `<option value="">${t('cl_sel_line', '— Izberite linijo —')}</option>`;
        linijaSel.value = '';
        if (linijaCustomRow) linijaCustomRow.style.display = 'none';
        const lines = (_clVehicleLines || {})[make] || [];
        // Always show the row — either with known lines or just the custom option
        lines.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l; opt.textContent = l;
            if (state.linija === l) opt.selected = true;
            linijaSel.appendChild(opt);
        });
        const customOpt = document.createElement('option');
        customOpt.value = LINIJA_CUSTOM_SENTINEL;
        customOpt.textContent = t('cl_line_add_custom', '+ Dodaj lastno linijo');
        linijaSel.appendChild(customOpt);
        linijaRow.style.display = '';
        // Restore custom value from state if set
        if (state._customLinija) {
            linijaSel.value = LINIJA_CUSTOM_SENTINEL;
            if (linijaCustomRow) linijaCustomRow.style.display = '';
            if (linijaCustomInput) linijaCustomInput.value = state._customLinija;
        }
    }

    loadClVehicleLines().then(() => updateLinijaOptions(state.make || ''));

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
            modelSel.disabled = false;
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
        state.linija = '';
        loadClVehicleLines().then(() => updateLinijaOptions(makeSel.value));
        updateModels();
    });

    modelSel.addEventListener('change', () => {
        state.model = modelSel.value;
        state.variant = '';
        updateVariants();
    });

    if (linijaSel) {
        linijaSel.addEventListener('change', () => {
            if (linijaSel.value === LINIJA_CUSTOM_SENTINEL) {
                state.linija = '';
                state._customLinija = linijaCustomInput ? linijaCustomInput.value.trim() : '';
                if (linijaCustomRow) linijaCustomRow.style.display = '';
                if (linijaCustomInput) linijaCustomInput.focus();
            } else {
                state.linija = linijaSel.value;
                state._customLinija = '';
                if (linijaCustomRow) linijaCustomRow.style.display = 'none';
            }
        });
    }
    if (linijaCustomInput) {
        linijaCustomInput.addEventListener('input', () => {
            state._customLinija = linijaCustomInput.value.trim();
            state.linija = '';
        });
    }

    variantSel.addEventListener('change', () => {
        state.variant = variantSel.value;
        applyTrimAutoFill(variantSel.value, makeSel.value, modelSel.value);
        // Show the fuel/cc row with a highlight after variant selection
        const fuelCcRow = document.getElementById('fuelCcRow');
        if (fuelCcRow && variantSel.value) {
            fuelCcRow.classList.add('cl-autofill-row--highlighted');
            setTimeout(() => fuelCcRow.classList.remove('cl-autofill-row--highlighted'), 2000);
        }
    });

    // Track manual edits to fFuelBasic and fEngineCCBasic
    document.getElementById('fFuelBasic')?.addEventListener('change', (e) => {
        state.fuel = e.target.value;
        if (!state._manualFields) state._manualFields = new Set();
        state._manualFields.add('fuel');
    });
    document.getElementById('fEngineCCBasic')?.addEventListener('input', (e) => {
        state.engineCc = e.target.value;
        if (!state._manualFields) state._manualFields = new Set();
        state._manualFields.add('engineCc');
    });

    updateModels(); // Initialize visibility

    document.getElementById('fBodyType')?.addEventListener('change', (e) => {
        state.bodyType = e.target.value;
        state.subcategory = e.target.value;
        state._bodyTypeManual = true;
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

        const bodyType = document.getElementById('fBodyType')?.value || '';

        if (!make) return alert(t('cl_err_make'));
        if (mileageRaw === '') return alert(t('cl_err_mileage'));
        if (!year) return alert(t('cl_err_year'));
        if (!firstRegMonth || !firstRegYear) return alert(t('cl_err_first_reg'));
        if (categorySubs.length > 0 && !bodyType) return alert(t('cl_err_body_type', 'Izberite karoserijo vozila.'));

        state.make = make;
        state.model = modelSel.value;
        state.variant = variantSel.value;
        state.linija = (linijaSel && linijaSel.value) || '';
        state.year = Number(year);
        state.mileageKm = mileage;
        state.color = document.getElementById('fColor').value;
        state.colorType = document.getElementById('fColorType').value;
        state.condition = document.getElementById('fCondition').value;
        state.doorsCount = document.getElementById('fDoors').value;
        state.seatsCount = document.getElementById('fSeats').value;
        state.firstRegistration = `${firstRegYear}-${firstRegMonth}`;
        state.previousOwnersCount = document.getElementById('fPrevOwners').value;
        if (bodyType) { state.bodyType = bodyType; state.subcategory = bodyType; }
        // Persist inline fuel & cc from basic step
        const fuelBasic = document.getElementById('fFuelBasic')?.value;
        const ccBasic = document.getElementById('fEngineCCBasic')?.value;
        if (fuelBasic) state.fuel = fuelBasic;
        if (ccBasic) state.engineCc = ccBasic;
        goNext();
    });
}

// ── Navtika validation helpers ────────────────────────────────────────────────
function markInvalid(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('cl-input--error', 'cl-select--error');
    const clear = () => { el.classList.remove('cl-input--error', 'cl-select--error'); };
    el.addEventListener('input', clear, { once: true });
    el.addEventListener('change', clear, { once: true });
}

function setupDecimalInput(el) {
    if (!el) return;
    el.addEventListener('input', () => {
        let v = el.value.replace(/[^0-9.,]/g, '');
        const dot = v.indexOf('.') !== -1 ? '.' : (v.indexOf(',') !== -1 ? ',' : null);
        if (dot) {
            const parts = v.split(/[.,]/);
            v = parts[0] + ',' + parts.slice(1).join('');
        }
        el.value = v;
    });
    el.addEventListener('keypress', e => {
        if (!/[\d.,]/.test(e.key)) e.preventDefault();
    });
}

function parseDecimalInput(val) {
    return parseFloat((val || '').replace(',', '.')) || '';
}

function blockWheelOnNumbers() {
    document.querySelectorAll('input[type="number"]').forEach(el => {
        el.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    });
}

// ── Step 3b: Basic data — Navtika (plovila) ───────────────────────────────────
function renderNavtikaBasicStep() {
    const cfg = vesselCfg();
    const years = [];
    for (let y = new Date().getFullYear() + 1; y >= 1960; y--) years.push(y);
    const yearOpts = years.map(y => `<option value="${y}" ${Number(state.year) === y ? 'selected' : ''}>${y}</option>`).join('');

    const HULL_MATERIALS = cfg.hullMaterials === 'inflatable'
        ? ['Guma (napihljivo)', 'PVC', 'Hypalon', 'Aluminij (RIB)', 'GRP (RIB)', 'Drugi']
        : ['GRP (Stekloplastika)', 'Aluminij', 'Les', 'Carbon', 'Jeklo', 'Guma (napihljivo)', 'Drugi'];
    const COLORS_BOAT = ['Bela', 'Modra', 'Siva', 'Črna', 'Rdeča', 'Zelena', 'Rumena', 'Oranžna', 'Druga'];

    // Jet-ski engine type list (shown in the Basic step, jet-ski specific).
    const JETSKI_ENGINE_TYPES = ['Bencin (4-taktni)', 'Bencin (2-taktni)', 'Električni'];

    const categorySubs = CATEGORIES.find(c => c.id === state.category)?.subs || [];
    const bodyTypeOpts = categorySubs.map(s => {
        const val = s.value || s.name;
        return `<option value="${val}" ${state.bodyType === val ? 'selected' : ''}>${t(s.name)}</option>`;
    }).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">Osnovni podatki plovila</h2>
            <p class="cl-step-sub">Vnesite osnovne tehnične podatke o plovilu.</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Znamka <span class="req">*</span></label>
                    <select class="cl-select" id="fMake">
                        <option value="">— Izberite znamko —</option>
                    </select>
                    <div id="fMakeCustomWrap" style="display:none;margin-top:.4rem">
                        <input class="cl-input" id="fMakeCustom" type="text" maxlength="60"
                            placeholder="Vnesite ime znamke" autocomplete="off"
                            value="${escHtml(state._customMake || '')}" />
                        <p class="cl-hint" style="margin-top:.25rem">Znamka bo predlagana za dodajanje v taksonomijo.</p>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Model</label>
                    <select class="cl-select" id="fModel" disabled>
                        <option value="">— Najprej izberite znamko —</option>
                    </select>
                    <div id="fModelCustomWrap" style="display:none;margin-top:.4rem">
                        <input class="cl-input" id="fModelCustom" type="text" maxlength="80"
                            placeholder="Vnesite ime modela" autocomplete="off"
                            value="${escHtml(state._customModel || '')}" />
                        <p class="cl-hint" style="margin-top:.25rem">Model bo predlagan za dodajanje v taksonomijo.</p>
                    </div>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Letnik <span class="req">*</span></label>
                    <select class="cl-select" id="fYear">
                        <option value="">— Letnik —</option>${yearOpts}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Dolžina plovila (m) <span class="req">*</span></label>
                    <input class="cl-input" id="fLength" type="text" inputmode="decimal"
                        value="${state.lengthM ? String(state.lengthM).replace('.', ',') : ''}" placeholder="npr. 8,5" />
                </div>
            </div>

            ${categorySubs.length > 0 ? `
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Vrsta plovila <span class="req">*</span></label>
                    <select class="cl-select" id="fBodyType">
                        <option value="">— Izberite vrsto —</option>
                        ${bodyTypeOpts}
                        <option value="__custom__">+ Vrsta ni na seznamu</option>
                    </select>
                    <div id="fBodyTypeCustomWrap" style="display:none;margin-top:.4rem">
                        <input class="cl-input" id="fBodyTypeCustom" type="text" maxlength="60"
                            placeholder="npr. Elektična jadrnica, Tender, Hišna ladja"
                            value="${escHtml(state._customVrsta || '')}" />
                        <p class="cl-hint" style="margin-top:.25rem">Vrsta bo predlagana za dodajanje v taksonomijo.</p>
                    </div>
                </div>
                <div class="cl-field"></div>
            </div>` : ''}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Ure motorja <span class="req">*</span></label>
                    <div class="cl-mileage-wrap">
                        <input class="cl-input" id="fEngineHours" type="text"
                            value="${state.engineHoursUsed ? formatNumberWithCommas(state.engineHoursUsed) : ''}"
                            placeholder="npr. 350" autocomplete="off" />
                        <span class="cl-mileage-unit">h</span>
                    </div>
                </div>
                ${cfg.hullComfort ? `
                <div class="cl-field">
                    <label class="cl-label">Material trupa</label>
                    <select class="cl-select" id="fHullMaterial">
                        <option value="">—</option>
                        ${HULL_MATERIALS.map(m => `<option value="${m}" ${state.hullMaterial === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>` : ''}
            </div>

            ${cfg.basicEngine ? `
            <div class="cl-row">
                <div class="cl-field">
                    <div class="cl-label-with-toggle">
                        <label class="cl-label">Moč motorja <span class="req">*</span></label>
                        <div class="cl-unit-toggle" id="powerUnitToggle">
                            <button type="button" class="cl-unit-btn active" data-unit="hp">KM</button>
                            <button type="button" class="cl-unit-btn" data-unit="kw">kW</button>
                        </div>
                    </div>
                    <div class="cl-input-wrap">
                        <input class="cl-input" id="fPower" type="number" min="0"
                            value="${state.powerKw ? Math.round(state.powerKw * 1.35962) : ''}" placeholder="npr. 130" />
                        <span class="cl-input-unit" id="powerUnitLabel">KM</span>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Tip motorja</label>
                    <select class="cl-select" id="fJetEngineType">
                        <option value="">—</option>
                        ${JETSKI_ENGINE_TYPES.map(et => `<option value="${et}" ${state.fuel === et ? 'selected' : ''}>${et}</option>`).join('')}
                    </select>
                </div>
            </div>` : ''}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Stanje <span class="req">*</span></label>
                    <select class="cl-select" id="fCondition">
                        ${[['Rabljeno','Rabljeno'],['Novo','Novo'],['Za dele','Za dele']].map(([v,l]) =>
                            `<option value="${v}" ${state.condition === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Barva trupa</label>
                    <select class="cl-select" id="fColor">
                        <option value="">—</option>
                        ${COLORS_BOAT.map(c => `<option value="${c}" ${state.color === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>

            ${cfg.hullComfort ? `
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Število kabin</label>
                    <select class="cl-select" id="fCabins">
                        <option value="">—</option>
                        ${[0,1,2,3,4,5,6].map(n => `<option value="${n}" ${String(state.cabins) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Število ležišč</label>
                    <select class="cl-select" id="fBerths">
                        <option value="">—</option>
                        ${[0,1,2,3,4,5,6,7,8,10,12].map(n => `<option value="${n}" ${String(state.berths) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Širina (m)</label>
                    <input class="cl-input" id="fBeam" type="text" inputmode="decimal"
                        value="${state.beamM ? String(state.beamM).replace('.', ',') : ''}" placeholder="npr. 3,2" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">Ugrez (m)</label>
                    <input class="cl-input" id="fDraught" type="text" inputmode="decimal"
                        value="${state.draughtM ? String(state.draughtM).replace('.', ',') : ''}" placeholder="npr. 1,8" />
                </div>
            </div>` : ''}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Leto prve registracije</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                        <select class="cl-select" id="fFirstRegMonth">
                            <option value="">Mesec</option>
                            ${[...Array(12)].map((_, i) => {
                                const m = (i + 1).toString().padStart(2, '0');
                                const cur = state.firstRegistration ? state.firstRegistration.split('-')[1] : '';
                                return `<option value="${m}" ${cur === m ? 'selected' : ''}>${m}.</option>`;
                            }).join('')}
                        </select>
                        <select class="cl-select" id="fFirstRegYear">
                            <option value="">Leto</option>${yearOpts}
                        </select>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Število prejšnjih lastnikov</label>
                    <select class="cl-select" id="fPrevOwners">
                        <option value="">—</option>
                        ${[['1st owner','1. lastnik'],['2nd owner','2. lastnik'],['3rd owner','3. lastnik'],['4th owner','4. lastnik'],['5 or more','5 ali več']].map(([v,l]) =>
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
    initCustomSelects();

    // Populate brands from plovila JSON
    const NAV_CUSTOM_SENTINEL = '__custom__';

    function showNavCustomMake(show) {
        const wrap = document.getElementById('fMakeCustomWrap');
        if (wrap) wrap.style.display = show ? '' : 'none';
        const modelSel = document.getElementById('fModel');
        const modelWrap = document.getElementById('fModelCustomWrap');
        if (show) {
            // When brand is custom, model must also be free-text
            if (modelSel) { modelSel.style.display = 'none'; modelSel.disabled = true; }
            if (modelWrap) modelWrap.style.display = '';
        } else {
            if (modelSel) modelSel.style.display = '';
            if (modelWrap) modelWrap.style.display = 'none';
        }
    }

    function showNavCustomModel(show) {
        const modelSel = document.getElementById('fModel');
        const wrap = document.getElementById('fModelCustomWrap');
        if (show) {
            if (modelSel) modelSel.style.display = 'none';
            if (wrap) wrap.style.display = '';
        } else {
            if (modelSel) modelSel.style.display = '';
            if (wrap) wrap.style.display = 'none';
        }
    }

    fetch('json/brands_models_plovila.json')
        .then(r => r.json())
        .then(data => {
            brandModelData = data;
            const makeSel = document.getElementById('fMake');
            const modelSel = document.getElementById('fModel');
            if (!makeSel) return;

            // Append known brands
            Object.keys(data).sort().forEach(b => {
                const opt = document.createElement('option');
                opt.value = b; opt.textContent = b;
                if (state.make === b) opt.selected = true;
                makeSel.appendChild(opt);
            });
            // "Not in list" option
            const notListedOpt = document.createElement('option');
            notListedOpt.value = NAV_CUSTOM_SENTINEL;
            notListedOpt.textContent = '+ Znamka ni na seznamu';
            makeSel.appendChild(notListedOpt);

            function populateModels(make) {
                if (!modelSel) return;
                modelSel.innerHTML = `<option value="">— Izberite model —</option>`;
                if (make && data[make]) {
                    Object.keys(data[make]).sort().forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m; opt.textContent = m;
                        if (state.model === m) opt.selected = true;
                        modelSel.appendChild(opt);
                    });
                    // "Not in list" for model too
                    const notM = document.createElement('option');
                    notM.value = NAV_CUSTOM_SENTINEL;
                    notM.textContent = '+ Model ni na seznamu';
                    modelSel.appendChild(notM);
                    modelSel.disabled = false;
                } else {
                    modelSel.disabled = true;
                }
            }

            // Restore state on initial render
            if (state._customMake) {
                makeSel.value = NAV_CUSTOM_SENTINEL;
                showNavCustomMake(true);
            } else if (state.make && data[state.make]) {
                populateModels(state.make);
                if (state._customModel) {
                    if (modelSel) modelSel.value = NAV_CUSTOM_SENTINEL;
                    showNavCustomModel(true);
                }
            }

            makeSel.addEventListener('change', () => {
                const val = makeSel.value;
                state._customMake = '';
                state._customModel = '';
                state.make = val === NAV_CUSTOM_SENTINEL ? '' : val;
                state.model = '';
                if (val === NAV_CUSTOM_SENTINEL) {
                    showNavCustomMake(true);
                } else {
                    showNavCustomMake(false);
                    populateModels(val);
                }
            });

            if (modelSel) {
                modelSel.addEventListener('change', () => {
                    const val = modelSel.value;
                    state._customModel = '';
                    if (val === NAV_CUSTOM_SENTINEL) {
                        state.model = '';
                        showNavCustomModel(true);
                    } else {
                        state.model = val;
                        showNavCustomModel(false);
                    }
                });
            }

            const makeCustomInput = document.getElementById('fMakeCustom');
            const modelCustomInput = document.getElementById('fModelCustom');
            if (makeCustomInput) makeCustomInput.addEventListener('input', () => { state._customMake = makeCustomInput.value.trim(); state.make = ''; });
            if (modelCustomInput) modelCustomInput.addEventListener('input', () => { state._customModel = modelCustomInput.value.trim(); state.model = ''; });
        })
        .catch(() => {
            // JSON unavailable — show free-text inputs directly
            showNavCustomMake(true);
        });

    // Vessel type custom entry
    const bodyTypeSel = document.getElementById('fBodyType');
    const bodyTypeCustomWrap = document.getElementById('fBodyTypeCustomWrap');
    const bodyTypeCustomInput = document.getElementById('fBodyTypeCustom');

    if (bodyTypeSel) {
        // Restore state
        if (state._customVrsta) {
            bodyTypeSel.value = NAV_CUSTOM_SENTINEL;
            if (bodyTypeCustomWrap) bodyTypeCustomWrap.style.display = '';
        }
        bodyTypeSel.addEventListener('change', () => {
            if (bodyTypeSel.value === NAV_CUSTOM_SENTINEL) {
                state.bodyType = '';
                state.subcategory = '';
                state._customVrsta = bodyTypeCustomInput ? bodyTypeCustomInput.value.trim() : '';
                if (bodyTypeCustomWrap) bodyTypeCustomWrap.style.display = '';
                if (bodyTypeCustomInput) bodyTypeCustomInput.focus();
            } else {
                state.bodyType = bodyTypeSel.value;
                state.subcategory = bodyTypeSel.value;
                state._customVrsta = '';
                if (bodyTypeCustomWrap) bodyTypeCustomWrap.style.display = 'none';
            }
        });
    }
    if (bodyTypeCustomInput) {
        bodyTypeCustomInput.addEventListener('input', () => {
            state._customVrsta = bodyTypeCustomInput.value.trim();
            state.bodyType = '';
            state.subcategory = '';
        });
    }

    const hoursInput = document.getElementById('fEngineHours');
    if (hoursInput) setupNumericFormatter(hoursInput);

    setupDecimalInput(document.getElementById('fLength'));
    setupDecimalInput(document.getElementById('fBeam'));
    setupDecimalInput(document.getElementById('fDraught'));
    blockWheelOnNumbers();

    // Jet-ski power unit toggle (KM ⇄ kW) — only present when cfg.basicEngine.
    const basicPowerUnit = wirePowerToggle('fPower', 'powerUnitToggle', 'powerUnitLabel');

    document.getElementById('btnBasicBack').addEventListener('click', goPrev);
    document.getElementById('btnBasicNext').addEventListener('click', () => {
        // Resolve effective make — either from dropdown or custom input
        const makeSel = document.getElementById('fMake');
        const makeCustom = (document.getElementById('fMakeCustom')?.value || '').trim();
        const modelCustom = (document.getElementById('fModelCustom')?.value || '').trim();
        const effectiveMake = makeCustom || (makeSel?.value !== '__custom__' ? (makeSel?.value || '') : '');
        const effectiveModel = modelCustom || state.model || '';

        const year = document.getElementById('fYear').value;
        const lengthRaw = document.getElementById('fLength').value;
        const hoursRaw = document.getElementById('fEngineHours').value;
        const hours = parseFormattedNumber(hoursRaw);

        const bodyTypeSel = document.getElementById('fBodyType');
        const bodyTypeCustom = (document.getElementById('fBodyTypeCustom')?.value || '').trim();
        const effectiveBodyType = bodyTypeCustom || (bodyTypeSel?.value !== '__custom__' ? (bodyTypeSel?.value || '') : '');

        let valid = true;
        if (!effectiveMake) {
            markInvalid(makeCustom !== undefined && document.getElementById('fMakeCustomWrap')?.style.display !== 'none' ? 'fMakeCustom' : 'fMake');
            valid = false;
        }
        if (!year) { markInvalid('fYear'); valid = false; }
        if (!lengthRaw) { markInvalid('fLength'); valid = false; }
        if (hoursRaw === '') { markInvalid('fEngineHours'); valid = false; }
        if (categorySubs.length > 0 && !effectiveBodyType) {
            markInvalid(bodyTypeCustom !== undefined && document.getElementById('fBodyTypeCustomWrap')?.style.display !== 'none' ? 'fBodyTypeCustom' : 'fBodyType');
            valid = false;
        }
        if (cfg.basicEngine) {
            const pv = parseFloat(document.getElementById('fPower')?.value || '');
            if (isNaN(pv) || pv <= 0) { markInvalid('fPower'); valid = false; }
        }
        if (!valid) return;

        // Persist custom taxonomy entries
        state._customMake = makeCustom;
        state._customModel = modelCustom;
        state._customVrsta = bodyTypeCustom;
        state.make = effectiveMake;
        state.model = effectiveModel;
        state.year = Number(year);
        state.lengthM = parseDecimalInput(lengthRaw);
        state.engineHoursUsed = hours;
        state.condition = document.getElementById('fCondition').value;
        state.color = document.getElementById('fColor').value;
        state.previousOwnersCount = document.getElementById('fPrevOwners').value;

        if (cfg.hullComfort) {
            state.hullMaterial = document.getElementById('fHullMaterial')?.value || '';
            state.cabins = document.getElementById('fCabins')?.value || '';
            state.berths = document.getElementById('fBerths')?.value || '';
            state.beamM = parseDecimalInput(document.getElementById('fBeam')?.value || '');
            state.draughtM = parseDecimalInput(document.getElementById('fDraught')?.value || '');
        } else {
            state.hullMaterial = ''; state.cabins = ''; state.berths = '';
            state.beamM = ''; state.draughtM = '';
        }

        if (cfg.basicEngine) {
            const pv = parseFloat(document.getElementById('fPower')?.value || '');
            state.powerKw = basicPowerUnit() === 'kw' ? pv : Math.round(pv / 1.35962);
            state.fuel = document.getElementById('fJetEngineType')?.value || '';
        }

        const frMonth = document.getElementById('fFirstRegMonth').value;
        const frYear = document.getElementById('fFirstRegYear').value;
        if (frMonth && frYear) state.firstRegistration = `${frYear}-${frMonth}`;

        if (effectiveBodyType) { state.bodyType = effectiveBodyType; state.subcategory = effectiveBodyType; }
        goNext();
    });
}

// Wire a KM ⇄ kW unit toggle for a power <input>. Returns a getter for the
// current unit ('hp' | 'kw'). Safe no-op when the toggle isn't in the DOM.
function wirePowerToggle(inputId, toggleId, labelId) {
    let unit = 'hp';
    const input = document.getElementById(inputId);
    const btns = document.querySelectorAll(`#${toggleId} .cl-unit-btn`);
    const label = document.getElementById(labelId);
    if (!input || !btns.length) return () => unit;
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newUnit = btn.dataset.unit;
            if (newUnit === unit) return;
            const val = parseFloat(input.value);
            if (!isNaN(val)) {
                input.value = newUnit === 'kw' ? Math.round(val / 1.35962) : Math.round(val * 1.35962);
            }
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            unit = newUnit;
            if (label) label.textContent = newUnit === 'hp' ? 'KM' : 'kW';
        });
    });
    return () => unit;
}

// ── Step 4: Technical ─────────────────────────────────────────────────────────
function renderTechnicalStep() {
    if (isNavtika()) return renderNavtikaTechnicalStep();

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

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_tech_title')}</h2>
            <p class="cl-step-sub">${t('cl_tech_sub')}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_fuel')} <span class="req">*</span></label>
                    <select class="cl-select" id="fFuel">
                        <option value="">${t('cl_select') || 'Select'}</option>
                        ${fuels.map(([v, l]) => `<option value="${v}" ${state.fuel === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
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
                    <label class="cl-label">${t('cl_label_engine_config', 'Konfiguracija motorja')}</label>
                    <select class="cl-select" id="fEngineConfig">
                        <option value="">—</option>
                        ${[
                            ['I3', 'I3 Trivaljnik'],
                            ['I4', 'I4 Štirivaljnik'],
                            ['V6', 'V6 Šestvaljnik'],
                            ['V8', 'V8 Osemvaljnik'],
                            ['V10', 'V10 Desetvaljnik'],
                            ['V12', 'V12 Dvanajstvaljnik'],
                            ['W12', 'W12 Dvanajstvaljnik'],
                            ['W16', 'W16 Šestnajstvaljnik'],
                            ['Electric', 'Električni motor'],
                        ].map(([v, l]) => `<option value="${v}" ${state.engineConfig === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="cl-field"></div>
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
                        <label class="cl-label">${t('cl_label_combined')} <span class="req">*</span></label>
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
                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">Zdravje baterije (%)</label>
                        <input class="cl-input" id="fBatteryHealth" type="number" min="0" max="100" value="${state.batteryHealth || ''}" placeholder="npr. 92" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Poraba (kWh/100 km)</label>
                        <input class="cl-input" id="fConsKwh" type="number" min="0" step="0.1" value="${state.consumptionKwh100 || ''}" placeholder="npr. 18.5" />
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
                <div class="cl-row" id="phevExtraFields" style="display:none;">
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_battery')}</label>
                        <input class="cl-input" id="fPhevBattery" type="number" min="0" value="${state.batteryKwh || ''}" placeholder="${t('cl_placeholder_battery')}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t('cl_label_range')}</label>
                        <input class="cl-input" id="fPhevRange" type="number" min="0" value="${state.rangeKm || ''}" placeholder="${t('cl_placeholder_range')}" />
                    </div>
                </div>
                <div class="cl-row" id="phevExtraFields2" style="display:none;">
                    <div class="cl-field">
                        <label class="cl-label">Zdravje baterije (%)</label>
                        <input class="cl-input" id="fPhevBatteryHealth" type="number" min="0" max="100" value="${state.batteryHealth || ''}" placeholder="npr. 92" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Poraba (kWh/100 km)</label>
                        <input class="cl-input" id="fPhevConsKwh" type="number" min="0" step="0.1" value="${state.consumptionKwh100 || ''}" placeholder="npr. 18.5" />
                    </div>
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
    const hybridTypeSel = document.getElementById('fHybridType');
    const updateConditionals = () => {
        const val = fuelSel.value;
        const isPhev = val === 'Hibrid' && hybridTypeSel?.value === 'PlugIn';
        document.getElementById('elFields')?.classList.toggle('visible', val === 'Elektrika');
        document.getElementById('hybridFields')?.classList.toggle('visible', val === 'Hibrid');
        document.getElementById('consumptionFields')?.classList.toggle('visible', val !== '' && val !== 'Elektrika');
        const phev1 = document.getElementById('phevExtraFields');
        const phev2 = document.getElementById('phevExtraFields2');
        if (phev1) phev1.style.display = isPhev ? '' : 'none';
        if (phev2) phev2.style.display = isPhev ? '' : 'none';
    };
    fuelSel.addEventListener('change', updateConditionals);
    hybridTypeSel?.addEventListener('change', updateConditionals);
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
            const wrap = el.closest('.cl-field');
            const icon = wrap ? wrap.querySelector('.cl-autofill-icon') : null;
            if (icon) icon.remove();
        });
    });

    // Restore visual styling for auto-filled fields
    if (state._autoFillFields) {
        techFields.forEach(([domId, stateKey]) => {
            if (state._autoFillFields.has(stateKey) && (!state._manualFields || !state._manualFields.has(stateKey))) {
                const el = document.getElementById(domId);
                if (el) {
                    el.classList.add('cl-autofilled');
                    const wrap = el.closest('.cl-field');
                    if (wrap && !wrap.querySelector('.cl-autofill-icon')) {
                        const label = wrap.querySelector('.cl-label');
                        const icon = document.createElement('span');
                        icon.className = 'cl-autofill-icon';
                        icon.innerHTML = '?';
                        icon.title = t('cl_autofill_tooltip', 'Sistem je samodejno izpolnil ta podatek glede na izbran model. Če se podatek razlikuje, ga lahko spremenite.');
                        if (label) label.appendChild(icon);
                        else wrap.appendChild(icon);
                    }
                }
            }
        });
    }

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

    // EV consumption auto-calc: battery / range * 100, shown as autofill icon
    const evConsTooltip = 'Izračunano iz kapacitete baterije in dosega. Vrednost lahko spremenite.';
    function recalcEvConsumption() {
        const batteryEl = document.getElementById('fBattery');
        const rangeEl   = document.getElementById('fRange');
        const consEl    = document.getElementById('fConsKwh');
        if (!batteryEl || !rangeEl || !consEl) return;
        const battery = parseFloat(batteryEl.value);
        const range   = parseFloat(rangeEl.value);
        if (!battery || !range || range === 0) return;
        if (consEl._manualKwh) return;
        const calc = Math.round((battery / range * 100) * 10) / 10;
        consEl.value = calc;
        const wrap = consEl.closest('.cl-field');
        if (wrap && !wrap.querySelector('.cl-autofill-icon')) {
            const label = wrap.querySelector('.cl-label');
            const icon = document.createElement('span');
            icon.className = 'cl-autofill-icon';
            icon.innerHTML = '?';
            icon.title = evConsTooltip;
            if (label) label.appendChild(icon);
        }
    }
    document.getElementById('fBattery')?.addEventListener('input', recalcEvConsumption);
    document.getElementById('fRange')?.addEventListener('input', recalcEvConsumption);
    document.getElementById('fConsKwh')?.addEventListener('input', function() {
        this._manualKwh = true;
        this.closest('.cl-field')?.querySelector('.cl-autofill-icon')?.remove();
    });

    // Combined l/100km auto-calc: average of city + highway
    function recalcCombinedConsumption() {
        const cityEl     = document.getElementById('fConsCity');
        const highwayEl  = document.getElementById('fConsHighway');
        const combinedEl = document.getElementById('fConsCombined');
        if (!cityEl || !highwayEl || !combinedEl) return;
        const city    = parseFloat(cityEl.value);
        const highway = parseFloat(highwayEl.value);
        if (!city || !highway) return;
        if (combinedEl._manualCombined) return;
        const calc = Math.round(((city + highway) / 2) * 10) / 10;
        combinedEl.value = calc;
        const wrap = combinedEl.closest('.cl-field');
        if (wrap && !wrap.querySelector('.cl-autofill-icon')) {
            const label = wrap.querySelector('.cl-label');
            const icon = document.createElement('span');
            icon.className = 'cl-autofill-icon';
            icon.innerHTML = '?';
            icon.title = 'Izračunano kot povprečje mestne in izvenmestne porabe. Vrednost lahko spremenite.';
            if (label) label.appendChild(icon);
        }
    }
    document.getElementById('fConsCity')?.addEventListener('input', recalcCombinedConsumption);
    document.getElementById('fConsHighway')?.addEventListener('input', recalcCombinedConsumption);
    document.getElementById('fConsCombined')?.addEventListener('input', function() {
        this._manualCombined = true;
        this.closest('.cl-field')?.querySelector('.cl-autofill-icon')?.remove();
    });

    document.getElementById('btnTechBack').addEventListener('click', goPrev);
    document.getElementById('btnTechNext').addEventListener('click', () => {
        const engineCc = document.getElementById('fEngineCC').value;
        const powerVal = parseFloat(powerInput.value);

        if (!fuelSel.value) return alert(t('cl_err_fuel'));
        if (!document.getElementById('fTransmission').value) return alert(t('cl_err_trans'));
        if (!engineCc) return alert(t('cl_err_displacement'));
        if (isNaN(powerVal)) return alert(t('cl_err_power'));
        const isEV = fuelSel.value === 'Elektrika';
        if (!isEV && !document.getElementById('fConsCombined')?.value) return alert(t('cl_err_consumption', 'Prosimo vnesite porabo goriva (kombinirana).'));

        state.fuel = fuelSel.value;
        state.transmission = document.getElementById('fTransmission').value;
        state.driveType = document.getElementById('fDrive').value;
        state.engineCc = engineCc;
        state.engineConfig = document.getElementById('fEngineConfig')?.value || '';
        state.powerKw = currentPowerUnit === 'kw' ? powerVal : Math.round(powerVal / 1.35962);
        state.co2 = document.getElementById('fCo2').value;
        state.emissionClass = document.getElementById('fEuro').value;
        state.towingKg = document.getElementById('fTow').value;
        state.fuelL100kmCombined = document.getElementById('fConsCombined')?.value || '';
        state.fuelL100kmCity = document.getElementById('fConsCity')?.value || '';
        state.fuelL100kmHighway = document.getElementById('fConsHighway')?.value || '';
        state.hybridType = document.getElementById('fHybridType')?.value || null;
        const isPhev = state.fuel === 'Hibrid' && state.hybridType === 'PlugIn';
        if (state.fuel === 'Elektrika') {
            state.batteryKwh = document.getElementById('fBattery')?.value || '';
            state.rangeKm = document.getElementById('fRange')?.value || '';
            state.batteryHealth = document.getElementById('fBatteryHealth')?.value || '';
            state.consumptionKwh100 = document.getElementById('fConsKwh')?.value || '';
        } else if (isPhev) {
            state.batteryKwh = document.getElementById('fPhevBattery')?.value || '';
            state.rangeKm = document.getElementById('fPhevRange')?.value || '';
            state.batteryHealth = document.getElementById('fPhevBatteryHealth')?.value || '';
            state.consumptionKwh100 = document.getElementById('fPhevConsKwh')?.value || '';
        } else {
            state.batteryKwh = '';
            state.rangeKm = '';
            state.batteryHealth = '';
            state.consumptionKwh100 = '';
        }
        goNext();
    });
}

// ── Step 4b: Technical — Navtika ──────────────────────────────────────────────
function renderNavtikaTechnicalStep() {
    const cfg = vesselCfg();
    let engineTypes = [
        ['Bencin', 'Bencin (bencinec)'],
        ['Dizel', 'Dizel'],
        ['Elektrika', 'Električni pogon'],
        ['Hibrid', 'Hibrid (benzin + električni)'],
        ['Brez motorja', 'Brez motorja (jadra)'],
    ];
    let driveSystems = [
        ['Izvenkrmni', 'Izvenkrmni (outboard)'],
        ['Notranji', 'Notranji (inboard)'],
        ['Stern Drive', 'Stern drive (volvo/mercruiser)'],
        ['Potisnik', 'Potisnik (pod trup)'],
        ['Električni', 'Električni motor'],
        ['Jadra', 'Samo jadra (brez motorja)'],
    ];
    // Drop the sail ("Brez motorja" / "Jadra") options for vessel types that
    // never sail (motorboats, RIBs).
    if (cfg.engineTypes === 'noSail') {
        engineTypes = engineTypes.filter(([v]) => v !== 'Brez motorja');
        driveSystems = driveSystems.filter(([v]) => v !== 'Jadra');
    }
    const engineCounts = ['1', '2', '3', '4'];

    const noEngine = state.fuel === 'Brez motorja';
    const showDrive = cfg.driveSystem !== false;
    const showBrand = !!cfg.engineBrand;

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${cfg.motorProduct ? 'Podatki izvenkrmnega motorja' : 'Tehnični podatki motorja'}</h2>
            <p class="cl-step-sub">${cfg.motorProduct ? 'Opišite izvenkrmni motor.' : 'Opišite pogonski sistem plovila.'}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Vrsta goriva / pogona <span class="req">*</span></label>
                    <select class="cl-select" id="fFuel">
                        <option value="">— Izberite —</option>
                        ${engineTypes.map(([v, l]) => `<option value="${v}" ${state.fuel === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                ${showDrive ? `
                <div class="cl-field">
                    <label class="cl-label">Pogonski sistem <span class="req">*</span></label>
                    <select class="cl-select" id="fDriveSystem">
                        <option value="">—</option>
                        ${driveSystems.map(([v, l]) => `<option value="${v}" ${state.driveSystem === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>` : ''}
            </div>

            ${showBrand ? `
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Znamka motorja</label>
                    <select class="cl-select" id="fEngineBrand">
                        <option value="">— Izberite znamko motorja —</option>
                    </select>
                </div>
            </div>` : ''}

            <div id="navMotorFields" style="${noEngine ? 'display:none;' : ''}">
                <div class="cl-row">
                    <div class="cl-field">
                        <div class="cl-label-with-toggle">
                            <label class="cl-label">Moč motorja <span class="req">*</span></label>
                            <div class="cl-unit-toggle" id="powerUnitToggle">
                                <button type="button" class="cl-unit-btn active" data-unit="hp">KM</button>
                                <button type="button" class="cl-unit-btn" data-unit="kw">kW</button>
                            </div>
                        </div>
                        <div class="cl-input-wrap">
                            <input class="cl-input" id="fPower" type="number" min="0"
                                value="${state.powerKw ? Math.round(state.powerKw * 1.35962) : ''}" placeholder="npr. 150" />
                            <span class="cl-input-unit" id="powerUnitLabel">KM</span>
                        </div>
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Prostornina motorja (cc)</label>
                        <input class="cl-input" id="fEngineCC" type="number" min="0"
                            value="${state.engineCc || ''}" placeholder="npr. 2700" />
                    </div>
                </div>

                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">Število motorjev <span class="req">*</span></label>
                        <select class="cl-select" id="fEngineCount">
                            ${engineCounts.map(n => `<option value="${n}" ${state.engineCount === n ? 'selected' : ''}>${n}</option>`).join('')}
                        </select>
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Kapaciteta rezervoarja (L) <span class="req">*</span></label>
                        <input class="cl-input" id="fFuelTank" type="number" min="0"
                            value="${state.fuelTankL || ''}" placeholder="npr. 200" />
                    </div>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Maks. hitrost (vozliči)</label>
                    <input class="cl-input" id="fMaxSpeed" type="number" min="0"
                        value="${state.maxSpeedKn || ''}" placeholder="npr. 28" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">Rezervoar za vodo (L)</label>
                    <input class="cl-input" id="fWaterTank" type="number" min="0"
                        value="${state.waterTankL || ''}" placeholder="npr. 150" />
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnTechBack">${t('cl_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnTechNext">${t('cl_continue')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();
    initCustomSelects();

    // Populate the engine-brand dropdown from the outboard-motor brand list.
    if (showBrand) {
        fetch('json/brands_models_izvenkrmni.json')
            .then(r => r.json())
            .then(data => {
                const sel = document.getElementById('fEngineBrand');
                if (!sel) return;
                Object.keys(data).sort((a, b) => a.localeCompare(b, 'en')).forEach(b => {
                    const opt = document.createElement('option');
                    opt.value = b; opt.textContent = b;
                    if (state.engineBrand === b) opt.selected = true;
                    sel.appendChild(opt);
                });
                createCustomSelect(sel);
            })
            .catch(() => { /* leave the empty select if the list is unavailable */ });
    }

    const fuelSel = document.getElementById('fFuel');
    const motorFields = document.getElementById('navMotorFields');
    fuelSel.addEventListener('change', () => {
        const noMot = fuelSel.value === 'Brez motorja';
        if (motorFields) motorFields.style.display = noMot ? 'none' : '';
    });

    // Power unit toggle (KM ⇄ kW)
    const techPowerUnit = wirePowerToggle('fPower', 'powerUnitToggle', 'powerUnitLabel');

    document.getElementById('btnTechBack').addEventListener('click', goPrev);
    document.getElementById('btnTechNext').addEventListener('click', () => {
        const noMot = fuelSel.value === 'Brez motorja';
        let valid = true;

        if (!fuelSel.value) { markInvalid('fFuel'); valid = false; }
        if (!noMot) {
            if (showDrive && !document.getElementById('fDriveSystem')?.value) { markInvalid('fDriveSystem'); valid = false; }
            const powerVal = parseFloat(document.getElementById('fPower')?.value || '');
            if (isNaN(powerVal) || powerVal <= 0) { markInvalid('fPower'); valid = false; }
            if (!document.getElementById('fFuelTank')?.value) { markInvalid('fFuelTank'); valid = false; }
        }
        if (!valid) return;

        state.fuel = fuelSel.value;
        state.driveSystem = showDrive ? (document.getElementById('fDriveSystem')?.value || '') : 'Izvenkrmni';
        state.engineBrand = showBrand ? (document.getElementById('fEngineBrand')?.value || '') : '';
        state.engineCount = document.getElementById('fEngineCount')?.value || '1';
        state.fuelTankL = document.getElementById('fFuelTank')?.value || '';
        state.maxSpeedKn = document.getElementById('fMaxSpeed').value;
        state.waterTankL = document.getElementById('fWaterTank').value;

        if (!noMot) {
            const powerVal = parseFloat(document.getElementById('fPower')?.value || '');
            state.powerKw = techPowerUnit() === 'kw' ? powerVal : Math.round(powerVal / 1.35962);
            state.engineCc = document.getElementById('fEngineCC')?.value || '';
        } else {
            state.powerKw = 0;
            state.engineCc = '';
        }

        goNext();
    });
}

// ── Step 5: Equipment ─────────────────────────────────────────────────────────
function renderEquipmentStep() {
    const groups = getEquipmentForCategory(state.category);
    const isMoto = state.category === 'moto';
    const showExhaustSub = isMoto && state.equipment.includes('SportExhaust');

    const groupHtml = groups.map(g => {
        const customInGroup = (state.customEquipment || []).filter(ce => ce.category === g.id);
        const customChips = customInGroup.map((ce, idx) => `
            <button type="button" class="cl-chip cl-chip--custom active"
                data-custom-idx="${idx}" data-custom-cat="${g.id}">${escHtmlEq(ce.value)} <span class="cl-chip-remove" data-remove-custom="${idx}" data-remove-cat="${g.id}">×</span></button>`).join('');
        return `
        <div class="cl-equipment-group" data-group-id="${g.id}">
            <p class="cl-equipment-group-title"><i data-lucide="${g.icon}"></i> ${t(g.label)}</p>
            <div class="cl-chips">
                ${g.items.map(item => `
                    <button type="button" class="cl-chip ${state.equipment.includes(item.value) ? 'active' : ''}"
                        data-val="${item.value}">${t(item.label)}</button>`).join('')}
                ${customChips}
            </div>
            <div class="cl-custom-eq-add" data-group="${g.id}" style="margin-top:.5rem">
                <button type="button" class="cl-btn-inline cl-btn-inline--add" data-open-custom="${g.id}">
                    + ${t('cl_eq_add_custom', 'Dodaj lastno opremo')}
                </button>
                <div class="cl-custom-eq-input" id="cl-custom-eq-${g.id}" style="display:none;margin-top:.5rem;display:none">
                    <input class="cl-input cl-input--sm" type="text" maxlength="80"
                        id="cl-custom-eq-val-${g.id}"
                        placeholder="${t('cl_eq_custom_placeholder', 'npr. Porsche Active Ride')}" />
                    <p class="cl-hint" style="margin:.25rem 0 .4rem">${t('cl_eq_custom_hint', 'Vnesite samo ime funkcije/opreme — bo shranjeno v taksonomijo za to znamko.')}</p>
                    <button type="button" class="cl-btn cl-btn--sm cl-btn--primary" data-confirm-custom="${g.id}">${t('cl_eq_custom_add', 'Dodaj')}</button>
                    <button type="button" class="cl-btn cl-btn--sm cl-btn--ghost" data-cancel-custom="${g.id}">${t('cl_cancel', 'Prekliči')}</button>
                </div>
            </div>
        </div>`;
    }).join('');

    function escHtmlEq(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

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

    // Custom equipment — per-group open/confirm/cancel/remove
    document.querySelectorAll('[data-open-custom]').forEach(btn => {
        btn.addEventListener('click', () => {
            const gid = btn.dataset.openCustom;
            const box = document.getElementById(`cl-custom-eq-${gid}`);
            if (box) { box.style.display = box.style.display === 'none' ? '' : 'none'; }
        });
    });

    document.querySelectorAll('[data-confirm-custom]').forEach(btn => {
        btn.addEventListener('click', () => {
            const gid = btn.dataset.confirmCustom;
            const input = document.getElementById(`cl-custom-eq-val-${gid}`);
            const val = input ? input.value.trim() : '';
            if (!val) return;
            if (!state.customEquipment) state.customEquipment = [];
            if (!state.customEquipment.some(ce => ce.category === gid && ce.value.toLowerCase() === val.toLowerCase())) {
                state.customEquipment = [...state.customEquipment, { category: gid, value: val }];
            }
            renderEquipmentStep();
        });
    });

    document.querySelectorAll('[data-cancel-custom]').forEach(btn => {
        btn.addEventListener('click', () => {
            const gid = btn.dataset.cancelCustom;
            const box = document.getElementById(`cl-custom-eq-${gid}`);
            if (box) box.style.display = 'none';
        });
    });

    document.querySelectorAll('[data-remove-cat]').forEach(span => {
        span.addEventListener('click', e => {
            e.stopPropagation();
            const cat = span.dataset.removeCat;
            const idx = Number(span.dataset.removeCustom);
            const inCat = (state.customEquipment || []).filter(ce => ce.category === cat);
            const toRemove = inCat[idx];
            if (toRemove) {
                state.customEquipment = state.customEquipment.filter(ce => ce !== toRemove);
            }
            renderEquipmentStep();
        });
    });

    document.getElementById('btnEqBack').addEventListener('click', goPrev);
    document.getElementById('btnEqNext').addEventListener('click', goNext);
}

// ── Step 6: Media ─────────────────────────────────────────────────────────────
let _mediaTab = 'exterior'; // 'exterior' | 'interior'

function renderMediaStep() {
    const photoNotice = state._photoLostNotice
        ? `<div style="background:#fef3c7;border:1.5px solid #f59e0b;border-radius:0.75rem;padding:0.75rem 1rem;margin-bottom:1.25rem;font-size:0.85rem;color:#92400e;display:flex;gap:0.5rem;align-items:flex-start;">
               <span style="flex-shrink:0;">⚠️</span>
               <span>Vaše fotografije niso bile shranjene med prijavo — prosimo, naložite jih znova.</span>
           </div>`
        : '';
    state._photoLostNotice = false;

    let aiNotice = '';
    if (state._aiImported) {
        const warnHtml = (state._aiImportWarnings || []).length
            ? `<ul style="margin:0.4rem 0 0;padding-left:1.1rem;">${state._aiImportWarnings.map(w => `<li>${escHtml(w)}</li>`).join('')}</ul>`
            : '';
        aiNotice = `<div style="background:#ecfdf5;border:1.5px solid #10b981;border-radius:0.75rem;padding:0.75rem 1rem;margin-bottom:1.25rem;font-size:0.85rem;color:#065f46;">
               <div style="display:flex;gap:0.5rem;align-items:flex-start;"><span style="flex-shrink:0;">✨</span>
               <span><strong>${escHtml(`${state.make} ${state.model}`.trim())}</strong> ${t('cl_ai_imported_ok', 'je bil uvožen. Preverite vse korake in dodajte fotografije.')}</span></div>
               ${warnHtml}
           </div>`;
        state._aiImported = false;
        state._aiImportWarnings = null;
    }

    setHtml(`
        <div class="cl-card">
            ${photoNotice}
            ${aiNotice}
            <h2 class="cl-step-title">${t('cl_media_title')}</h2>
            <p class="cl-step-sub">${t('cl_media_sub')}</p>

            <div class="cl-media-tabs">
                <button class="cl-media-tab ${_mediaTab === 'exterior' ? 'active' : ''}" data-tab="exterior">
                    ${isNavtika() ? '⛵' : '🚗'} ${isNavtika() ? 'Plovilo' : t('cl_media_exterior')}
                    <span class="cl-media-tab-count" id="extCount">${state._exteriorFiles.length}</span>
                </button>
                <button class="cl-media-tab ${_mediaTab === 'interior' ? 'active' : ''}" data-tab="interior">
                    ${isNavtika() ? '🛋️' : '🪑'} ${isNavtika() ? 'Kabina / Cockpit' : t('cl_media_interior')}
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

// ── Step: Auction setup (dražba only) ─────────────────────────────────────────
let _sellerContractGetter = null;

function renderAuctionSetupStep() {
    const packages = [
        {
            ...AUCTION_PACKAGES.auctionFree,
            label: t('cl_auction_pkg_free', 'Standardna (21 dni)'),
            desc: t('cl_auction_pkg_free_desc', 'Brezplačna objava. Plačate le provizijo ob prodaji.'),
            icon: '🔨',
        },
        {
            ...AUCTION_PACKAGES.auction45d,
            label: t('cl_auction_pkg_45d', 'Razširjena (45 dni)'),
            desc: t('cl_auction_pkg_45d_desc', 'Daljša vidljivost za večjo prodajno priložnost.'),
            icon: '⚡',
        },
    ];

    const pkgCards = packages.map(p => `
        <div class="cl-promo-card ${state.auctionPackageId === p.id ? 'selected' : ''}" data-pkg="${p.id}" data-days="${p.days}" data-weeks="${p.weeks}">
            <span class="cl-promo-icon">${p.icon}</span>
            <p class="cl-promo-name">${p.label}</p>
            <p class="cl-promo-price">${p.price === 0 ? t('cl_auction_free', 'Brezplačno') : p.price.toLocaleString('sl-SI', { minimumFractionDigits: 2 }) + ' €'}</p>
            <p class="cl-promo-desc">${p.desc}</p>
        </div>`).join('');

    const typeCards = [
        {
            id: 'regular',
            icon: '👁',
            label: t('cl_auction_type_regular', 'Odprta dražba'),
            desc: t('cl_auction_type_regular_desc', 'Vsi ponudniki vidijo trenutno najvišjo ponudbo v realnem času.'),
        },
        {
            id: 'silent',
            icon: '🔒',
            label: t('cl_auction_type_silent', 'Zaprta dražba'),
            desc: t('cl_auction_type_silent_desc', 'Ponudbeni zneski so skriti do zaključka. Vidno je le število ponudb.'),
        },
    ].map(tp => `
        <div class="cl-promo-card ${state.auctionType === tp.id ? 'selected' : ''}" data-type="${tp.id}">
            <span class="cl-promo-icon">${tp.icon}</span>
            <p class="cl-promo-name">${tp.label}</p>
            <p class="cl-promo-desc">${tp.desc}</p>
        </div>`).join('');

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_auction_title', 'Nastavitev dražbe')}</h2>
            <p class="cl-step-sub">${t('cl_auction_sub', 'Izberite trajanje, vrsto, začetno ceno in podpišite zavezo k prodaji.')}</p>

            <div class="cl-auction-policy-badge">
                <span>🛡</span>
                <span>${t('cl_auction_antisnip_badge', 'Zaščita pred sniperji: ponudba v zadnjih 3 minutah samodejno podaljša dražbo za 5 minut.')}</span>
            </div>

            <label class="cl-label" style="margin-top:1.25rem;">${t('cl_auction_package', 'Trajanje dražbe')} <span class="req">*</span></label>
            <div class="cl-promo-grid" id="clPkgGrid">${pkgCards}</div>

            <label class="cl-label" style="margin-top:1.25rem;">${t('cl_auction_type_label', 'Vrsta dražbe')} <span class="req">*</span></label>
            <div class="cl-promo-grid" id="clTypeGrid">${typeCards}</div>

            <div class="cl-field" style="margin-top:1.25rem;">
                <label class="cl-label">${t('cl_auction_start_price', 'Začetna cena')} <span class="req">*</span></label>
                <div class="cl-price-wrap">
                    <input class="cl-input" id="fStartPrice" type="text" inputmode="numeric"
                        value="${formatNumberWithCommas(state.startPriceEur)}" placeholder="0" autocomplete="off" />
                    <span class="cl-price-currency">€</span>
                </div>
                <span style="font-size:0.75rem;color:#94a3b8;">${t('cl_auction_start_price_hint', 'Izhodiščna cena, od katere se začne licitiranje.')}</span>
            </div>

            <div class="cl-field">
                <label class="cl-checkbox-label" style="margin-bottom:0.5rem;">
                    <input type="checkbox" id="fHasReserve" ${state.reservePriceEur ? 'checked' : ''} />
                    ${t('cl_auction_reserve_toggle', 'Dodaj minimalno ceno (reserve)')}
                </label>
                <div id="reserveWrap" style="display:${state.reservePriceEur ? 'flex' : 'none'};">
                    <div class="cl-price-wrap">
                        <input class="cl-input" id="fReserve" type="text" inputmode="numeric"
                            value="${formatNumberWithCommas(state.reservePriceEur || '')}" placeholder="0" autocomplete="off" />
                        <span class="cl-price-currency">€</span>
                    </div>
                </div>
            </div>

            <div class="cl-auction-fee-note">
                <span>💡</span>
                <span>${t('cl_auction_fee_note', 'Provizija ob uspešni prodaji: <strong>1 % končne cene</strong>, največ <strong>5.000 €</strong>. Plačate samo, če vozilo prodate.')}</span>
            </div>

            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />

            ${contractWidgetHtml({
                party: 'seller',
                title: t('cl_auction_seller_contract_title', 'Zaveza k prodaji'),
                body: t('cl_auction_seller_contract_body', 'S podpisom se zavezujete, da boste vozilo prodali kupcu po končni (zadnji) ponujeni ceni ob zaključku dražbe.'),
            })}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnAucBack">${t('cl_btn_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnAucNext">${t('cl_btn_continue')}</button>
            </div>
        </div>
    `);

    // Package selection
    document.querySelectorAll('#clPkgGrid .cl-promo-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#clPkgGrid .cl-promo-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.auctionPackageId = card.dataset.pkg;
            state.auctionDurationWeeks = Number(card.dataset.weeks);
        });
    });

    // Auction type selection
    document.querySelectorAll('#clTypeGrid .cl-promo-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#clTypeGrid .cl-promo-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.auctionType = card.dataset.type;
        });
    });

    const startInput = document.getElementById('fStartPrice');
    setupNumericFormatter(startInput);
    const reserveInput = document.getElementById('fReserve');
    setupNumericFormatter(reserveInput);

    document.getElementById('fHasReserve').addEventListener('change', (e) => {
        document.getElementById('reserveWrap').style.display = e.target.checked ? 'flex' : 'none';
        if (!e.target.checked) { state.reservePriceEur = ''; reserveInput.value = ''; }
    });

    // Seller contract widget
    const contractRoot = document.querySelector('.ac-contract');
    mountContractWidget(contractRoot, {
        title: 'Zaveza k prodaji na dražbi — MojAvto.si',
        fileName: 'zaveza-prodaja-drazba',
        lines: [
            'Prodajalec se s tem dokumentom zavezuje, da bo predmet dražbe (vozilo) prodal',
            'kupcu, ki ob zaključku dražbe odda najvišjo veljavno ponudbo, in sicer po tej',
            'končni ceni.',
            '',
            'Prodajalec potrjuje, da je navedena začetna cena resnična in zavezujoča.',
            '',
            'Ta dokument se hrani le do zaključka dražbe.',
        ],
    }).then(getter => { _sellerContractGetter = getter; });

    document.getElementById('btnAucBack').addEventListener('click', goPrev);
    document.getElementById('btnAucNext').addEventListener('click', () => {
        state.startPriceEur = parseFormattedNumber(startInput.value) || '';
        state.reservePriceEur = document.getElementById('fHasReserve').checked
            ? (parseFormattedNumber(reserveInput.value) || '') : '';

        if (!state.startPriceEur || Number(state.startPriceEur) <= 0) {
            alert(t('cl_auction_err_start_price', 'Vnesite veljavno začetno ceno.'));
            return;
        }
        const contract = _sellerContractGetter && _sellerContractGetter();
        if (!isContractComplete(contract)) {
            alert(t('cl_auction_err_contract', 'Podpišite zavezo k prodaji ali prenesite in potrdite PDF pogodbo.'));
            return;
        }
        state.sellerContract = { type: contract.type, signatureData: contract.signatureData || null };
        // Mirror starting price into priceEur so downstream review/cards work.
        state.priceEur = state.startPriceEur;
        goNext();
    });
}

// ── Step 8: Price ─────────────────────────────────────────────────────────────
function renderPriceStep() {
    const callForPrice = !!state.callForPrice;
    const showRental = PLATFORM.hasGlobalRentalToggle;
    const isRental = state.listingType === 'rental';
    const rp = state.rentalPricing || {};

    setHtml(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t('cl_price_title')}</h2>
            <p class="cl-step-sub">${t('cl_price_sub')}</p>

            ${showRental ? `
            <div class="cl-field">
                <label class="cl-label">${t('cl_listing_type', 'Vrsta oglasa')}</label>
                <div class="unit-toggle-pill" id="clListingTypeToggle" style="width:fit-content;">
                    <button type="button" class="unit-btn ${isRental ? '' : 'active'}" data-mode="sale">${t('cl_sale', 'Prodaja')}</button>
                    <button type="button" class="unit-btn ${isRental ? 'active' : ''}" data-mode="rental">${t('cl_rental', 'Najem')}</button>
                </div>
            </div>

            <div class="cl-field" id="rentalPricingWrap" style="display:${isRental ? 'block' : 'none'};">
                <label class="cl-label">${t('cl_rental_pricing', 'Cenik najema')}</label>
                <div class="cl-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentDay" type="text" value="${escHtml(rp.perDay ?? '')}" placeholder="${t('cl_rent_per_day', 'Cena / dan')}" autocomplete="off" /><span class="cl-price-currency">€</span></div>
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentWeek" type="text" value="${escHtml(rp.perWeek ?? '')}" placeholder="${t('cl_rent_per_week', 'Cena / teden')}" autocomplete="off" /><span class="cl-price-currency">€</span></div>
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentDeposit" type="text" value="${escHtml(rp.deposit ?? '')}" placeholder="${t('cl_rent_deposit', 'Varščina')}" autocomplete="off" /><span class="cl-price-currency">€</span></div>
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentMinDays" type="text" value="${escHtml(rp.minDays ?? '')}" placeholder="${t('cl_rent_min_days', 'Min. dni')}" autocomplete="off" /></div>
                </div>
            </div>
            ` : ''}

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

            <div class="cl-field" id="salePriceWrap" style="${callForPrice ? 'display:none;' : ''}">
                <label class="cl-checkbox-label" style="margin-bottom:0.5rem;">
                    <input type="checkbox" id="fHasSalePrice" ${state.salePriceEur ? 'checked' : ''} />
                    Dodaj znižano ceno (popust)
                </label>
                <div id="salePriceInputWrap" style="display:${state.salePriceEur ? 'flex' : 'none'}; flex-direction:column; gap:0.35rem;">
                    <div class="cl-price-wrap">
                        <input class="cl-input" id="fSalePrice" type="text"
                            value="${formatNumberWithCommas(state.salePriceEur || '')}" placeholder="0" autocomplete="off" />
                        <span class="cl-price-currency">€</span>
                    </div>
                    <span style="font-size:0.75rem;color:#94a3b8;">Znižana cena je prikazana na oglasu. Originalna cena je vidna samo pri podrobnem ogledu.</span>
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
        document.getElementById('salePriceWrap').style.display = e.target.checked ? 'none' : '';
    });

    document.getElementById('fHasSalePrice').addEventListener('change', e => {
        document.getElementById('salePriceInputWrap').style.display = e.target.checked ? 'flex' : 'none';
        if (!e.target.checked) state.salePriceEur = null;
    });

    // Sale / rental toggle (platforms with global rental toggle only)
    const listingTypeToggle = document.getElementById('clListingTypeToggle');
    if (listingTypeToggle) {
        listingTypeToggle.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                listingTypeToggle.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.listingType = btn.dataset.mode === 'rental' ? 'rental' : 'sale';
                const wrap = document.getElementById('rentalPricingWrap');
                if (wrap) wrap.style.display = state.listingType === 'rental' ? 'block' : 'none';
            });
        });
    }

    const priceInput = document.getElementById('fPrice');
    if (state._imported?.price) priceInput?.classList.add('imported-field');

    if (priceInput) {
        setupNumericFormatter(priceInput);
    }

    const salePriceInput = document.getElementById('fSalePrice');
    if (salePriceInput) {
        setupNumericFormatter(salePriceInput);
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

        const hasSalePrice = document.getElementById('fHasSalePrice').checked;
        if (hasSalePrice && !isCallForPrice) {
            const saleRaw = document.getElementById('fSalePrice').value;
            const salePrice = parseFormattedNumber(saleRaw);
            if (salePrice > 0 && salePrice < state.priceEur) {
                state.salePriceEur = salePrice;
            } else {
                state.salePriceEur = null;
                if (salePrice >= state.priceEur) alert('Znižana cena mora biti nižja od originalne cene.');
            }
        } else {
            state.salePriceEur = null;
        }

        state.priceNegotiable = document.getElementById('fNeg').checked;
        state.priceIsFinal = document.getElementById('fFinalPrice').checked;
        state.priceInclVat = document.getElementById('fVat').checked;

        // Capture rental pricing when in rental mode
        if (PLATFORM.hasGlobalRentalToggle && state.listingType === 'rental') {
            const num = id => parseFormattedNumber(document.getElementById(id)?.value || '') || '';
            state.rentalPricing = {
                perDay: num('fRentDay'),
                perWeek: num('fRentWeek'),
                deposit: num('fRentDeposit'),
                minDays: num('fRentMinDays'),
            };
        }

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
    const isBusiness = state.sellerType === 'business';
    const savedCountry = state.location?.country || '';
    const savedRegion = state.location?.region || '';

    const countryOptions = COUNTRIES.map(c =>
        `<option value="${c.code}" ${savedCountry === c.code ? 'selected' : ''}>${c.label}</option>`
    ).join('');

    const regionOptions = savedCountry
        ? getRegions(savedCountry).map(r =>
            `<option value="${r}" ${savedRegion === r ? 'selected' : ''}>${r}</option>`
          ).join('')
        : '';

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
                    <label class="cl-label">${t('cl_label_country')} <span class="req">*</span></label>
                    <select class="cl-select" id="fCountry">
                        <option value="">${t('cl_sel_country')}</option>
                        ${countryOptions}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t('cl_label_region')} <span class="req">*</span></label>
                    <select class="cl-select" id="fRegion" ${savedCountry ? '' : 'disabled'}>
                        <option value="">${t('cl_sel_region')}</option>
                        ${regionOptions}
                    </select>
                </div>
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

    // Country → region cascade
    const fCountry = document.getElementById('fCountry');
    const fRegion = document.getElementById('fRegion');
    fCountry.addEventListener('change', () => {
        const code = fCountry.value;
        fRegion.innerHTML = `<option value="">${t('cl_sel_region')}</option>`;
        if (code) {
            getRegions(code).forEach(r => {
                const o = document.createElement('option');
                o.value = r; o.textContent = r;
                fRegion.appendChild(o);
            });
            fRegion.disabled = false;
        } else {
            fRegion.disabled = true;
        }
    });

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
        const country = document.getElementById('fCountry').value;
        const region = document.getElementById('fRegion').value;
        const name = document.getElementById('fContactName').value.trim();
        if (!country) return alert(t('cl_err_country'));
        if (!region) return alert(t('cl_err_region'));
        if (!name) return alert(t('cl_err_contact_name'));

        state.location = { country, region };
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
// Inline-edit support: which review section is currently open as an editable form.
// null = all sections read-only. Set by the ✎ button, cleared on Save/Cancel.
let _reviewEditSection = null;

// Option lists for inline edit selects (mirror the wizard's own step renderers).
const REVIEW_OPT = {
    condition: [
        ['Rabljeno', 'cl_condition_used'], ['Novo', 'cl_condition_new'],
        ['Razstavno vozilo', 'cl_condition_demo'], ['Starodobnik', 'cl_condition_classic'],
        ['Za dele', 'cl_condition_for_parts'],
    ],
    color: ['Bela', 'Črna', 'Siva', 'Srebrna', 'Modra', 'Rdeča', 'Zelena', 'Rumena', 'Rjava', 'Oranžna', 'Vijolična', 'Zlata', 'Bronasta', 'Druga'],
    fuel: [
        ['Petrol', 'cl_fuel_petrol'], ['Dizel', 'cl_fuel_diesel'], ['Hibrid', 'cl_fuel_hybrid'],
        ['Elektrika', 'cl_fuel_electric'], ['LPG', 'cl_fuel_lpg'], ['CNG', 'cl_fuel_cng'], ['Vodik', 'cl_fuel_hydrogen'],
    ],
    transmission: [['Ročni', 'cl_trans_manual'], ['Avtomatski', 'cl_trans_automatic'], ['Polavtomatski', 'cl_trans_semi']],
    drive: [['FWD (sprednji)', 'cl_drive_fwd'], ['RWD (zadnji)', 'cl_drive_rwd'], ['AWD / 4x4', 'cl_drive_awd']],
    emission: ['Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6d-temp'],
};

const reviewEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Build a <select> from a list of [value, i18nKey] pairs or plain strings.
function reviewSelect(id, current, opts, placeholder) {
    const optHtml = opts.map(o => {
        const [v, lbl] = Array.isArray(o) ? [o[0], t(o[1], o[0])] : [o, o];
        return `<option value="${reviewEsc(v)}" ${current === v ? 'selected' : ''}>${reviewEsc(lbl)}</option>`;
    }).join('');
    const ph = placeholder ? `<option value="">${reviewEsc(placeholder)}</option>` : '';
    return `<select class="cl-select cl-redit-input" id="${id}">${ph}${optHtml}</select>`;
}

function reviewField(label, inputHtml) {
    return `<div class="cl-redit-field"><label class="cl-redit-label">${reviewEsc(label)}</label>${inputHtml}</div>`;
}

function reviewTextInput(id, value, attrs = '') {
    return `<input class="cl-input cl-redit-input" id="${id}" value="${reviewEsc(value)}" ${attrs} />`;
}

// Returns the inline edit-form HTML for a given vehicle section, or '' if that
// section isn't inline-editable (falls back to jump-to-step).
function reviewEditFormHtml(stepId) {
    if (!isVehicleItem(state) || isNavtika()) return '';
    switch (stepId) {
        case 'category': {
            // Category itself stays fixed (changing it would invalidate the flow);
            // only the body-type subcategory is editable, scoped to that category.
            const catEntry = CATEGORIES_AVTO.find(c => c.id === state.category);
            const subOpts = (catEntry?.subs || []).map(s => [s.value, t(s.name, s.value)]);
            const catLabel = catEntry ? t(catEntry.label, state.category) : state.category;
            return `<div class="cl-redit-grid">
                ${reviewField(t('cl_section_category'), `<div class="cl-redit-static">${reviewEsc(catLabel)}</div>`)}
                ${reviewField(t('cl_label_subcategory', 'Podkategorija'), subOpts.length
                    ? reviewSelect('reSubcategory', state.subcategory, subOpts, t('cl_sel_body_type', 'Izberite'))
                    : reviewTextInput('reSubcategory', state.subcategory))}
            </div>`;
        }
        case 'basic':
            return `<div class="cl-redit-grid">
                ${reviewField(t('cl_label_make'), reviewTextInput('reMake', state.make))}
                ${reviewField(t('cl_label_model'), reviewTextInput('reModel', state.model))}
                ${reviewField(t('cl_label_year'), reviewTextInput('reYear', state.year, 'type="number" min="1900" max="2100"'))}
                ${reviewField(t('cl_label_mileage_review'), reviewTextInput('reMileage', state.mileageKm, 'type="number" min="0"'))}
                ${reviewField(t('cl_label_condition'), reviewSelect('reCondition', state.condition, REVIEW_OPT.condition))}
                ${reviewField(t('cl_label_color'), reviewSelect('reColor', state.color, REVIEW_OPT.color, t('cl_sel_color', 'Izberite barvo')))}
            </div>`;
        case 'technical':
            return `<div class="cl-redit-grid">
                ${reviewField(t('cl_label_fuel'), reviewSelect('reFuel', state.fuel, REVIEW_OPT.fuel, t('cl_sel_fuel', 'Izberite')))}
                ${reviewField(t('cl_label_transmission'), reviewSelect('reTransmission', state.transmission, REVIEW_OPT.transmission, t('cl_sel_transmission', 'Izberite')))}
                ${reviewField(t('cl_drive_label', 'Pogon'), reviewSelect('reDrive', state.driveType, REVIEW_OPT.drive, t('cl_sel_drive', 'Izberite')))}
                ${reviewField(t('cl_label_power_review', 'Moč (kW)'), reviewTextInput('rePowerKw', state.powerKw, 'type="number" min="0"'))}
                ${reviewField(t('cl_label_displacement_review', 'Prostornina (cc)'), reviewTextInput('reEngineCc', state.engineCc, 'type="number" min="0"'))}
                ${reviewField(t('cl_label_emissions'), reviewSelect('reEmission', state.emissionClass, REVIEW_OPT.emission, t('cl_sel_emission', '—')))}
                ${reviewField(t('cl_label_cons_combined', 'Poraba (komb.)'), reviewTextInput('reConsComb', state.fuelL100kmCombined, 'type="number" step="0.1" min="0"'))}
                ${reviewField(t('cl_label_cons_city', 'Poraba (mesto)'), reviewTextInput('reConsCity', state.fuelL100kmCity, 'type="number" step="0.1" min="0"'))}
                ${reviewField(t('cl_label_cons_highway', 'Poraba (avtocesta)'), reviewTextInput('reConsHwy', state.fuelL100kmHighway, 'type="number" step="0.1" min="0"'))}
                ${reviewField(t('cl_label_range_review', 'Doseg (km)'), reviewTextInput('reRange', state.rangeKm, 'type="number" min="0"'))}
            </div>`;
        case 'price':
            return `<div class="cl-redit-grid">
                ${reviewField(t('cl_section_price'), reviewTextInput('rePrice', state.priceEur, 'type="number" min="0"'))}
                ${reviewField(t('cl_label_negotiable'), `<label class="cl-redit-check"><input type="checkbox" id="reNegotiable" ${state.priceNegotiable ? 'checked' : ''}/> ${t('cl_val_yes')}</label>`)}
                ${reviewField(t('cl_label_call_for_price', 'Cena po dogovoru'), `<label class="cl-redit-check"><input type="checkbox" id="reCallForPrice" ${state.callForPrice ? 'checked' : ''}/> ${t('cl_val_yes')}</label>`)}
            </div>`;
        case 'location':
            return `<div class="cl-redit-grid">
                ${reviewField(t('cl_label_country'), reviewSelect('reCountry', state.location?.country || '', COUNTRIES.map(c => [c.code, c.label]), t('cl_sel_country', 'Izberite')))}
                ${reviewField(t('cl_label_region'), `<select class="cl-select cl-redit-input" id="reRegion"><option value="">${t('cl_sel_region', 'Izberite')}</option></select>`)}
                ${reviewField(t('cl_label_contact'), reviewTextInput('reContact', state.contact?.name || ''))}
            </div>`;
        case 'promotion':
            return `<div class="cl-redit-grid">
                ${reviewField(t('cl_label_tier'), reviewSelect('reTier', state.promotionTier, [['free', t('cl_tier_free')], ['homepage', t('cl_tier_featured')], ['sponsored', t('cl_tier_sponsored')]]))}
            </div>`;
        default:
            return '';
    }
}

// After a section's edit form is mounted, wire any dynamic behaviour (region list).
function wireReviewEditForm(stepId) {
    if (stepId === 'location') {
        const countrySel = document.getElementById('reCountry');
        const regionSel = document.getElementById('reRegion');
        const fillRegions = (code) => {
            if (!regionSel) return;
            const regions = getRegions(code) || [];
            regionSel.innerHTML = `<option value="">${t('cl_sel_region', 'Izberite')}</option>` +
                regions.map(r => `<option value="${reviewEsc(r)}" ${state.location?.region === r ? 'selected' : ''}>${reviewEsc(r)}</option>`).join('');
        };
        fillRegions(state.location?.country || '');
        countrySel?.addEventListener('change', () => fillRegions(countrySel.value));
    }
}

// Read the inline form's inputs back into state. Returns false if validation fails.
function saveReviewEdit(stepId) {
    const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const checked = id => { const el = document.getElementById(id); return !!(el && el.checked); };
    switch (stepId) {
        case 'category':
            state.subcategory = val('reSubcategory');
            state.bodyType = state.subcategory;
            break;
        case 'basic':
            state.make = val('reMake');
            state.model = val('reModel');
            state.year = val('reYear');
            state.mileageKm = val('reMileage');
            state.condition = val('reCondition');
            state.color = val('reColor');
            break;
        case 'technical':
            state.fuel = val('reFuel');
            state.transmission = val('reTransmission');
            state.driveType = val('reDrive');
            state.powerKw = val('rePowerKw');
            state.engineCc = val('reEngineCc');
            state.emissionClass = val('reEmission');
            state.fuelL100kmCombined = val('reConsComb');
            state.fuelL100kmCity = val('reConsCity');
            state.fuelL100kmHighway = val('reConsHwy');
            state.rangeKm = val('reRange');
            break;
        case 'price':
            state.priceEur = val('rePrice');
            state.priceNegotiable = checked('reNegotiable');
            state.callForPrice = checked('reCallForPrice');
            break;
        case 'location':
            if (!state.location) state.location = {};
            state.location.country = val('reCountry');
            state.location.region = val('reRegion');
            if (!state.contact) state.contact = {};
            state.contact.name = val('reContact');
            break;
        case 'promotion':
            state.promotionTier = val('reTier') || 'free';
            break;
        case 'equipment':
            // Equipment is edited via live chip toggles that already mutate state.
            break;
    }
    saveDraft(state);
    return true;
}

// Equipment block for the review step — grouped known features + custom (pending)
// chips. Read-only by default; inline-editable (live chip toggles) when its ✎ is
// clicked. Always rendered for vehicles so the user can add equipment even when none
// is set yet.
function reviewEquipmentSection() {
    const eq = Array.isArray(state.equipment) ? state.equipment : [];
    const custom = Array.isArray(state.customEquipment) ? state.customEquipment : [];
    const esc = reviewEsc;
    const editing = _reviewEditSection === 'equipment';
    const total = eq.length + custom.length;

    if (!editing && total === 0) {
        // Nothing selected — still show the section with an Add affordance.
        return `
        <div class="cl-review-section">
            <div class="cl-review-section-header">
                <span class="cl-review-section-title">${t('cl_eq_title', 'Oprema in dodatki')}</span>
                <button class="cl-review-edit-btn" data-redit-open="equipment">✎ ${t('cl_btn_edit')}</button>
            </div>
            <div class="cl-review-eq-empty">${t('cl_eq_none', 'Ni izbrane opreme.')}</div>
        </div>`;
    }

    if (editing) {
        // Editable: every group's full item set as toggle chips + custom add/remove.
        const groups = getEquipmentForCategory(state.category);
        const groupBlocks = groups.map(g => {
            const chips = g.items.map(i => `
                <button type="button" class="cl-review-eq-chip cl-review-eq-chip--toggle ${eq.includes(i.value) ? 'active' : ''}" data-eq-toggle="${esc(i.value)}">${esc(t(i.label, i.value))}</button>`).join('');
            const customInGroup = custom.filter(ce => ce.category === g.id);
            const customChipsHtml = customInGroup.map(ce => `
                <span class="cl-review-eq-chip cl-review-eq-chip--custom active">${esc(ce.value)}<span class="cl-review-eq-remove" data-eq-custom-remove="${esc(ce.value)}" data-eq-custom-cat="${esc(g.id)}">×</span></span>`).join('');
            return `<div class="cl-review-eq-group">
                <span class="cl-review-eq-group-label"><i data-lucide="${g.icon}"></i> ${esc(t(g.label, g.id))}</span>
                <div class="cl-review-eq-chips">${chips}${customChipsHtml}
                    <button type="button" class="cl-review-eq-addcustom" data-eq-add-custom="${esc(g.id)}">+ ${t('cl_eq_add_custom', 'Dodaj lastno')}</button>
                </div>
            </div>`;
        }).join('');
        return `
        <div class="cl-review-section cl-review-section--editing">
            <div class="cl-review-section-header">
                <span class="cl-review-section-title">${t('cl_eq_title', 'Oprema in dodatki')} <span class="cl-review-eq-count">${total}</span></span>
            </div>
            <div class="cl-review-eq-body">${groupBlocks}</div>
            <div class="cl-redit-actions">
                <button class="cl-btn cl-btn--sm cl-btn--primary" data-redit-cancel>${t('cl_done', 'Končano')}</button>
            </div>
        </div>`;
    }

    // Read-only view.
    const groupBlocks = EQUIPMENT_GROUPS.map(g => {
        const items = g.items.filter(i => eq.includes(i.value));
        if (!items.length) return '';
        const chips = items.map(i => `<span class="cl-review-eq-chip">${esc(t(i.label, i.value))}</span>`).join('');
        return `<div class="cl-review-eq-group">
            <span class="cl-review-eq-group-label"><i data-lucide="${g.icon}"></i> ${esc(t(g.label, g.id))}</span>
            <div class="cl-review-eq-chips">${chips}</div>
        </div>`;
    }).filter(Boolean).join('');

    const customChips = custom.length
        ? `<div class="cl-review-eq-group">
            <span class="cl-review-eq-group-label"><i data-lucide="plus-circle"></i> ${t('cl_eq_custom_pending', 'Dodatna oprema (v pregledu)')}</span>
            <div class="cl-review-eq-chips">${custom.map(ce => `<span class="cl-review-eq-chip cl-review-eq-chip--custom">${esc(ce.value || '')}</span>`).join('')}</div>
        </div>`
        : '';

    return `
        <div class="cl-review-section">
            <div class="cl-review-section-header">
                <span class="cl-review-section-title">${t('cl_eq_title', 'Oprema in dodatki')} <span class="cl-review-eq-count">${total}</span></span>
                <button class="cl-review-edit-btn" data-redit-open="equipment">✎ ${t('cl_btn_edit')}</button>
            </div>
            <div class="cl-review-eq-body">${groupBlocks}${customChips}</div>
        </div>`;
}

function renderReviewStep() {
    const fmt = n => new Intl.NumberFormat('sl-SI').format(n);
    const tierLabels = { free: t('cl_tier_free'), homepage: t('cl_tier_featured'), sponsored: t('cl_tier_sponsored') };

    const imgPreview = state._exteriorUrls.length > 0
        ? `<img src="${state._exteriorUrls[state.coverIndex]}" alt="Naslovna" style="width:100%;height:200px;object-fit:cover;border-radius:0.85rem;margin-bottom:1rem;" />`
        : '';

    function section(title, stepId, rows) {
        // Inline-editable sections (vehicle, non-navtika) render a form when active;
        // everything else keeps the jump-to-step ✎ button.
        const inlineForm = reviewEditFormHtml(stepId);
        const canInline = inlineForm !== '';

        if (canInline && _reviewEditSection === stepId) {
            return `
            <div class="cl-review-section cl-review-section--editing">
                <div class="cl-review-section-header">
                    <span class="cl-review-section-title">${title}</span>
                </div>
                ${inlineForm}
                <div class="cl-redit-actions">
                    <button class="cl-btn cl-btn--sm cl-btn--ghost" data-redit-cancel>${t('cl_cancel', 'Prekliči')}</button>
                    <button class="cl-btn cl-btn--sm cl-btn--primary" data-redit-save="${stepId}">${t('cl_save', 'Shrani')}</button>
                </div>
            </div>`;
        }

        const items = rows.filter(([, v]) => v).map(([l, v]) => `
            <div class="cl-review-item">
                <span class="cl-review-item-label">${l}</span>
                <span class="cl-review-item-value">${escHtml(String(v))}</span>
            </div>`).join('');
        const editBtn = canInline
            ? `<button class="cl-review-edit-btn" data-redit-open="${stepId}">✎ ${t('cl_btn_edit')}</button>`
            : `<button class="cl-review-edit-btn" data-jump="${stepId}">✎ ${t('cl_btn_edit')}</button>`;
        return `
            <div class="cl-review-section">
                <div class="cl-review-section-header">
                    <span class="cl-review-section-title">${title}</span>
                    ${editBtn}
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

            ${isVehicleItem(state) ? section(t('cl_section_category'), 'category', [
        [t('cl_section_category'), state.category],
        [t('cl_label_subcategory'), state.subcategory],
    ]) : section(t('cl_section_category'), 'category', [
        [t('cl_what_are_you_listing', 'Kaj objavljate?'), state.itemType === 'tire' ? t('cl_sub_guma', 'Pnevmatika') : state.itemType === 'oprema' ? t('cl_sub_oprema', 'Moto oprema') : t('cl_sub_del', 'Nadomestni del')],
        [t('gd_choose_vehicle_cat', 'Za katero vozilo?'), (VEHICLE_CATEGORIES.find(v => v.value === state.vehicleCategory) || {}).label],
    ])}

            ${isVehicleItem(state) ? section(t('cl_section_basic'), 'basic', isNavtika() ? [
        ['Znamka', state.make],
        ['Model', state.model],
        ['Letnik', state.year],
        ['Dolžina', state.lengthM ? state.lengthM + ' m' : ''],
        ['Ure motorja', state.engineHoursUsed !== '' ? fmt(state.engineHoursUsed) + ' h' : ''],
        ['Stanje', state.condition],
        ['Material trupa', state.hullMaterial],
        ['Barva', state.color],
        ['Kabine / Ležišča', (state.cabins || state.berths) ? `${state.cabins || '—'} / ${state.berths || '—'}` : ''],
    ] : [
        [t('cl_label_make'), state.make],
        [t('cl_label_model'), state.model],
        [t('cl_label_year'), state.year],
        [t('cl_label_mileage_review'), state.mileageKm ? fmt(state.mileageKm) + ' km' : ''],
        [t('cl_label_condition'), state.condition],
        [t('cl_label_color'), state.color],
    ]) : ''}

            ${isVehicleItem(state) ? section(t('cl_section_technical'), 'technical', isNavtika() ? [
        ['Gorivo / pogon', state.fuel],
        ['Pogonski sistem', state.driveSystem],
        ['Znamka motorja', state.engineBrand],
        ['Moč motorja', state.powerKw ? `${Math.round(state.powerKw * 1.34102)} KM (${state.powerKw} kW)` : ''],
        ['Prostornina', state.engineCc ? state.engineCc + ' cc' : ''],
        ['Število motorjev', state.engineCount],
        ['Kapaciteta rezervoarja', state.fuelTankL ? state.fuelTankL + ' L' : ''],
        ['Maks. hitrost', state.maxSpeedKn ? state.maxSpeedKn + ' vozličev' : ''],
    ] : [
        [t('cl_label_fuel'), state.fuel],
        [t('cl_label_transmission'), state.transmission],
        [t('cl_label_power_review'), state.powerKw ? (getCurrentLang() === 'sl' ? state.powerKw + ' kW (' + Math.round(state.powerKw * 1.34102) + ' KM)' : Math.round(state.powerKw * 1.34102) + ' HP') : ''],
        [t('cl_label_displacement_review'), state.engineCc ? state.engineCc + ' cc' : ''],
        [t('cl_label_cons_combined'), state.fuelL100kmCombined ? state.fuelL100kmCombined + ' L/100km' : ''],
        [t('cl_label_cons_city'), state.fuelL100kmCity ? state.fuelL100kmCity + ' L/100km' : ''],
        [t('cl_label_cons_highway'), state.fuelL100kmHighway ? state.fuelL100kmHighway + ' L/100km' : ''],
        [t('cl_label_range_review'), state.rangeKm ? state.rangeKm + ' km' : ''],
        [t('cl_label_emissions'), state.emissionClass],
    ]) : ''}

            ${isVehicleItem(state) ? reviewEquipmentSection() : ''}

            ${isPartItem(state) ? section(t('cl_step_part_details', 'Podatki o delu'), 'partDetails', [
        [t('gd_part_group', 'Sklop'), (getPartGroups(state.vehicleCategory).find(g => g.value === state.partGroup) || {}).label],
        [t('gd_part_type', 'Vrsta dela'), state.partTypeLabel || state.partType],
        [t('cl_condition', 'Stanje'), state.condition],
        [t('gd_part_brand', 'Znamka'), state.brand],
        [t('gd_oem_number', 'OEM'), state.oemNumber],
        [t('gd_compatibility', 'Združljivost'), [state.vehicleApplication?.make, state.vehicleApplication?.model].filter(Boolean).join(' ')],
    ]) : ''}

            ${isTireItem(state) ? section(t('cl_step_tire_details', 'Podatki o pnevmatiki'), 'tireDetails', [
        [t('gd_tire_size', 'Dimenzija'), state.tireSize],
        [t('gd_season', 'Sezona'), state.tireSeason],
        [t('gd_part_brand', 'Znamka'), state.brand],
        [t('cl_condition', 'Stanje'), state.condition],
        [t('gd_tire_count', 'Število kosov'), state.tireCount],
        [t('gd_tread_depth', 'Globina profila'), state.treadDepthMm ? state.treadDepthMm + ' mm' : ''],
        [t('gd_dot_year', 'DOT'), state.dotYear],
    ]) : ''}

            ${isOpremaItem(state) ? section(t('cl_step_oprema_details', 'Podatki o opremi'), 'opremaDetails', [
        [t('gd_eq_group', 'Sklop opreme'), getEquipmentGroupLabel(state.equipmentGroup)],
        [t('gd_eq_type', 'Vrsta'), state.equipmentTypeLabel || state.equipmentType],
        [t('gd_part_brand', 'Znamka'), state.brand],
        [t('gd_eq_size', 'Velikost'), state.equipmentSize],
        [t('cl_condition', 'Stanje'), state.condition],
    ]) : ''}

            ${state.entryType === 'auction' ? section(t('cl_auction_title', 'Dražba'), 'auctionSetup', [
        [t('cl_auction_start_price', 'Začetna cena'), state.startPriceEur ? fmt(state.startPriceEur) + ' €' : ''],
        [t('cl_auction_package', 'Trajanje'), (() => { const pkg = AUCTION_PACKAGES[state.auctionPackageId] || AUCTION_PACKAGES.auctionFree; return `${pkg.days} dni${pkg.price > 0 ? ' — ' + pkg.price.toLocaleString('sl-SI', { minimumFractionDigits: 2 }) + ' €' : ' — Brezplačno'}`; })()],
        [t('cl_auction_type_label', 'Vrsta dražbe'), state.auctionType === 'silent' ? '🔒 Zaprta' : '👁 Odprta'],
        [t('cl_auction_reserve_toggle', 'Minimalna cena'), state.reservePriceEur ? fmt(state.reservePriceEur) + ' €' : '—'],
        [t('cl_auction_seller_contract_title', 'Zaveza k prodaji'), state.sellerContract ? (state.sellerContract.type === 'sign' ? '✓ Podpisano' : '✓ PDF potrjen') : ''],
    ]) : section(t('cl_section_price'), 'price', [
        [t('cl_section_price'), state.callForPrice ? t('cl_label_call_for_price') : (state.priceEur ? (getCurrentLang() === 'sl' ? fmt(state.priceEur) + ' €' : '$' + fmt(state.priceEur)) : '')],
        [t('cl_label_negotiable'), state.priceNegotiable ? t('cl_val_yes') : t('cl_val_no')],
    ])}

            ${section(t('cl_section_location'), 'location', [
        [t('cl_label_country'), COUNTRIES.find(c => c.code === state.location?.country)?.label || state.location?.country],
        [t('cl_label_region'), state.location?.region],
        [t('cl_label_contact'), state.contact?.name],
    ])}

            ${state.entryType === 'auction' ? '' : section(t('cl_section_promotion'), 'promotion', [
        [t('cl_label_tier'), tierLabels[state.promotionTier] || state.promotionTier],
    ])}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnRevBack">${t('cl_btn_back')}</button>
                <button class="cl-btn cl-btn--primary" id="btnRevNext">${editListingId ? 'Shrani spremembe' : t('cl_btn_post')}</button>
            </div>
        </div>
    `);

    if (window.lucide) window.lucide.createIcons();

    document.querySelectorAll('[data-jump]').forEach(btn => {
        btn.addEventListener('click', () => jumpToStep(btn.dataset.jump));
    });

    // ── Inline review editing ──
    // Open a section's edit form (scrolls it into view after re-render).
    document.querySelectorAll('[data-redit-open]').forEach(btn => {
        btn.addEventListener('click', () => {
            _reviewEditSection = btn.dataset.reditOpen;
            renderReviewStep();
        });
    });
    // Cancel: discard the open form and re-render read-only.
    document.querySelectorAll('[data-redit-cancel]').forEach(btn => {
        btn.addEventListener('click', () => { _reviewEditSection = null; renderReviewStep(); });
    });
    // Save: write inputs back to state, then re-render read-only.
    document.querySelectorAll('[data-redit-save]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (saveReviewEdit(btn.dataset.reditSave) !== false) {
                _reviewEditSection = null;
                renderReviewStep();
            }
        });
    });

    // Wire any dynamic behaviour inside the currently-open form (e.g. region list).
    if (_reviewEditSection) wireReviewEditForm(_reviewEditSection);

    // Equipment inline editing — live chip toggles mutate state immediately.
    document.querySelectorAll('[data-eq-toggle]').forEach(chip => {
        chip.addEventListener('click', () => {
            const v = chip.dataset.eqToggle;
            if (!Array.isArray(state.equipment)) state.equipment = [];
            if (state.equipment.includes(v)) {
                state.equipment = state.equipment.filter(x => x !== v);
                chip.classList.remove('active');
            } else {
                state.equipment = [...state.equipment, v];
                chip.classList.add('active');
            }
            saveDraft(state);
            updateReviewEqCount();
        });
    });
    document.querySelectorAll('[data-eq-add-custom]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.eqAddCustom;
            const val = (window.prompt(t('cl_eq_custom_placeholder', 'Vnesite ime opreme')) || '').trim();
            if (!val) return;
            if (!Array.isArray(state.customEquipment)) state.customEquipment = [];
            if (!state.customEquipment.some(ce => ce.category === cat && ce.value.toLowerCase() === val.toLowerCase())) {
                state.customEquipment = [...state.customEquipment, { category: cat, value: val }];
                saveDraft(state);
            }
            renderReviewStep();
        });
    });
    document.querySelectorAll('[data-eq-custom-remove]').forEach(span => {
        span.addEventListener('click', e => {
            e.stopPropagation();
            const v = span.dataset.eqCustomRemove;
            const cat = span.dataset.eqCustomCat;
            state.customEquipment = (state.customEquipment || []).filter(ce => !(ce.category === cat && ce.value === v));
            saveDraft(state);
            renderReviewStep();
        });
    });

    // Keep the open section visible after a re-render triggered by an edit click.
    if (_reviewEditSection) {
        const openSection = document.querySelector('.cl-review-section--editing');
        openSection?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    document.getElementById('btnRevBack').addEventListener('click', goPrev);
    document.getElementById('btnRevNext').addEventListener('click', () => {
        if (auth.currentUser) {
            submitListing(auth.currentUser);
        } else {
            goNext(); // go to auth step
        }
    });
}

// Update the equipment count badge live during inline chip toggling.
function updateReviewEqCount() {
    const eq = Array.isArray(state.equipment) ? state.equipment : [];
    const custom = Array.isArray(state.customEquipment) ? state.customEquipment : [];
    document.querySelectorAll('.cl-review-eq-count').forEach(el => { el.textContent = String(eq.length + custom.length); });
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

    const hasPhotos = () =>
        state._exteriorFiles.length > 0 || state._exteriorUrls.length > 0;

    const afterAuth = async (user) => {
        restoreFilesFromSession();
        if (!hasPhotos()) {
            // Photos were lost when sessionStorage was saved — File objects can't be serialised.
            // Send the user back to the media step with an explanatory notice.
            state._photoLostNotice = true;
            jumpToStep('media');
            return;
        }
        await submitListing(user);
    };

    document.getElementById('btnGoogle').addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            await afterAuth(result.user);
        } catch (e) { showErr(e.message); }
    });

    document.getElementById('btnLogin').addEventListener('click', async () => {
        try {
            const email = document.getElementById('authEmail').value;
            const pw = document.getElementById('authPassword').value;
            const result = await signInWithEmailAndPassword(auth, email, pw);
            await afterAuth(result.user);
        } catch (e) { showErr(t('cl_err_signin') + e.message); }
    });

    document.getElementById('btnRegister').addEventListener('click', async () => {
        try {
            const email = document.getElementById('authEmail').value;
            const pw = document.getElementById('authPassword').value;
            const result = await createUserWithEmailAndPassword(auth, email, pw);
            await afterAuth(result.user);
        } catch (e) { showErr(t('cl_err_register') + e.message); }
    });
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submitListing(user) {
    const container = document.getElementById('clStepContainer');
    container.innerHTML = `
        <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
            <div class="cl-submit-spinner" style="margin:0 auto 1.5rem;"></div>
            <h2 class="cl-step-title">${t('cl_submitting_title')}</h2>
            <p class="cl-step-sub">${t('cl_submitting_sub')}</p>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    try {
        const userDoc = await getCurrentUserDoc();
        if (userDoc && userDoc.sellerType) {
            state.sellerType = userDoc.sellerType;
        }

        let listingId;
        const wasEditing = !!editListingId;

        if (editListingId) {
            // ── Edit mode: upload only new File objects, keep existing URLs ──
            const [newExtUrls, newIntUrls] = await Promise.all([
                state._exteriorFiles.length > 0
                    ? (await import('../services/listingService.js')).uploadImages(state._exteriorFiles, user.uid)
                    : Promise.resolve([]),
                state._interiorFiles.length > 0
                    ? (await import('../services/listingService.js')).uploadImages(state._interiorFiles, user.uid)
                    : Promise.resolve([]),
            ]);

            const exteriorUrls = [...state._exteriorUrls.filter(u => u.startsWith('http')), ...newExtUrls];
            const interiorUrls = [...state._interiorUrls.filter(u => u.startsWith('http')), ...newIntUrls];

            await updateListing(editListingId, {
                category: state.category,
                subcategory: state.subcategory,
                bodyType: state.bodyType,
                itemType: state.itemType,
                make: state.make,
                model: state.model,
                variant: state.variant,
                linija: state.linija,
                year: state.year ? Number(state.year) : null,
                mileageKm: state.mileageKm ? Number(state.mileageKm) : null,
                mileage: state.mileageKm ? Number(state.mileageKm) : null,
                color: state.color,
                colorType: state.colorType,
                doorsCount: state.doorsCount ? Number(state.doorsCount) : null,
                seatsCount: state.seatsCount ? Number(state.seatsCount) : null,
                condition: state.condition,
                firstRegistration: state.firstRegistration,
                previousOwnersCount: state.previousOwnersCount ? Number(state.previousOwnersCount) : null,
                fuel: state.fuel,
                hybridType: state.hybridType,
                transmission: state.transmission,
                driveType: state.driveType,
                engineCc: state.engineCc ? Number(state.engineCc) : null,
                powerKw: state.powerKw ? Number(state.powerKw) : null,
                power: state.powerKw ? Number(state.powerKw) : null,
                co2: state.co2 ? Number(state.co2) : null,
                emissionClass: state.emissionClass,
                fuelL100kmCombined: state.fuelL100kmCombined ? Number(state.fuelL100kmCombined) : null,
                batteryKwh: state.batteryKwh ? Number(state.batteryKwh) : null,
                rangeKm: state.rangeKm ? Number(state.rangeKm) : null,
                equipment: state.equipment,
                description: state.description,
                priceEur: Number(state.priceEur) || 0,
                price: Number(state.priceEur) || 0,
                salePriceEur: state.salePriceEur ? Number(state.salePriceEur) : null,
                priceNegotiable: state.priceNegotiable,
                priceInclVat: state.priceInclVat,
                callForPrice: state.callForPrice,
                listingType: state.listingType,
                isRental: state.isRental,
                location: state.location,
                contact: state.contact,
                sellerNote: state.sellerNote,
                images: { exterior: exteriorUrls, interior: interiorUrls },
                coverIndex: state.coverIndex,
                title: `${state.make || ''} ${state.model || ''} ${state.variant || ''}`.trim(),
            });

            listingId = editListingId;
            editListingId = null;
        } else {
            // ── Create mode ──
            listingId = await createListing(state, state._exteriorFiles, state._interiorFiles, user);
            clearDraft();
        }

        state._exteriorUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch {} });
        state._interiorUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch {} });

        container.innerHTML = `
            <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
                <h2 class="cl-step-title">${wasEditing ? 'Oglas posodobljen!' : t('cl_success_title')}</h2>
                <p class="cl-step-sub">${t('cl_success_sub')}</p>
                <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem;">
                    <a href="#/${state.entryType === 'auction' ? 'drazba' : 'oglas'}?id=${listingId}" class="cl-btn cl-btn--primary">${t('cl_btn_view_listing')}</a>
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
