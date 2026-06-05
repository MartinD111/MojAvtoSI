import {
    collection, addDoc, getDocs, doc, setDoc, updateDoc,
    query, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase.js';
import { ALL_EQUIPMENT_VALUES } from '../data/equipment.js';
import { key as lsKey } from '../config/storageKeys.js';

// ── Image upload ──────────────────────────────────────────────────────────────
export async function uploadImages(files, userId) {
    const urls = [];
    for (const file of files) {
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
        const fileRef = ref(storage, `listings/${userId}/${uniqueName}`);
        await uploadBytes(fileRef, file);
        urls.push(await getDownloadURL(fileRef));
    }
    return urls;
}

// ── Create listing ────────────────────────────────────────────────────────────
/**
 * Creates a new listing in Firestore.
 * @param {Object} draft          — full draft object from sessionStorage
 * @param {File[]} exteriorFiles  — exterior photo files
 * @param {File[]} interiorFiles  — interior photo files
 * @param {Object} user           — Firebase Auth user
 * @returns {Promise<string>} listing ID
 */
export async function createListing(draft, exteriorFiles, interiorFiles, user) {
    if (!user) throw new Error('Sign in is required to publish a listing.');

    const itemType = draft.itemType || 'vehicle';
    const navtikaCategories = ['colni', 'jadrnice', 'gumenjaki', 'jet-ski', 'izvenkrmni-motorji'];
    const isNavtikaListing = navtikaCategories.includes(draft.category);
    // Validation depends on the kind of item being listed.
    const requiredByType = {
        vehicle: isNavtikaListing ? ['priceEur', 'make', 'fuel', 'lengthM'] : ['priceEur', 'make', 'model', 'fuel'],
        part: ['priceEur', 'partType', 'vehicleCategory'],
        tire: ['priceEur', 'tireSize', 'tireSeason', 'vehicleCategory'],
        oprema: ['priceEur', 'equipmentType', 'vehicleCategory'],
    };
    const missing = (requiredByType[itemType] || requiredByType.vehicle).filter(k => !draft[k]);
    if (missing.length) throw new Error(`Missing key fields: ${missing.join(', ')}.`);

    const [exteriorUrls, interiorUrls] = await Promise.all([
        exteriorFiles.length > 0 ? uploadImages(exteriorFiles, user.uid) : Promise.resolve([]),
        interiorFiles.length > 0 ? uploadImages(interiorFiles, user.uid) : Promise.resolve([]),
    ]);

    // Cover is first image unless user explicitly set coverIndex
    const coverIndex = draft.coverIndex || 0;

    const listing = {
        // Identity
        authorId: user.uid,
        authorName: user.displayName || 'User',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,

        // Entry type
        entryType: draft.entryType || 'classic',
        vin: draft.vin || null,
        vinVerified: draft.vinVerified || false,
        vinDetails: draft.vinData ? { ...draft.vinData } : null,
        vinOverrides: draft.vinOverrides || {},

        // Item kind: 'vehicle' (default) | 'part' | 'tire' | 'oprema' | 'plovilo' | 'motor'
        itemType,
        // For parts/tires this records which vehicle family they are for.
        vehicleCategory: draft.vehicleCategory || (itemType === 'vehicle' ? (draft.category || 'avto') : ''),

        // Sale vs rental — first-class on platforms with a global rental toggle
        // (MojaNavtika charter). isRental kept as a denormalized boolean because
        // the search filter (advanced-search matchesFilters) reads it directly.
        listingType: draft.listingType === 'rental' ? 'rental' : 'sale',
        isRental: draft.listingType === 'rental',
        rentalPricing: draft.listingType === 'rental'
            ? {
                perDay: Number(draft.rentalPricing?.perDay) || null,
                perWeek: Number(draft.rentalPricing?.perWeek) || null,
                deposit: Number(draft.rentalPricing?.deposit) || null,
                minDays: Number(draft.rentalPricing?.minDays) || null,
            }
            : null,

        // Parts (itemType === 'part')
        partGroup: draft.partGroup || '',
        partType: draft.partType || '',
        oemNumber: draft.oemNumber || '',
        brand: draft.brand || '',
        vehicleApplication: draft.vehicleApplication
            ? {
                make: draft.vehicleApplication.make || '',
                model: draft.vehicleApplication.model || '',
                yearFrom: draft.vehicleApplication.yearFrom || null,
                yearTo: draft.vehicleApplication.yearTo || null,
            }
            : null,

        // Moto equipment (itemType === 'oprema')
        equipmentGroup: draft.equipmentGroup || '',
        equipmentType: draft.equipmentType || '',
        equipmentSize: draft.equipmentSize || '',

        // Tires (itemType === 'tire')
        tireSize: draft.tireSize || '',
        tireWidth: Number(draft.tireWidth) || null,
        tireAspect: Number(draft.tireAspect) || null,
        tireRim: Number(draft.tireRim) || null,
        tireSeason: draft.tireSeason || '',
        treadDepthMm: draft.treadDepthMm ? Number(draft.treadDepthMm) : null,
        dotYear: draft.dotYear || '',
        tireCount: Number(draft.tireCount) || null,

        // Category — for parts/tires we mirror the vehicle family so existing
        // card renderers and category gates keep working.
        category: itemType === 'vehicle' ? (draft.category || 'avto') : (draft.vehicleCategory || 'avto'),
        subcategory: draft.subcategory || '',
        // Vehicle body type (vrsta vozila) — canonical value; auto-filled from
        // taxonomy when available, else falls back to the manual subcategory pick.
        bodyType: draft.bodyType || draft.subcategory || '',

        // Basic
        make: draft.make || '',
        model: draft.model || '',
        variant: draft.variant || '',
        year: Number(draft.year) || new Date().getFullYear(),
        mileageKm: Number(draft.mileageKm) || 0,
        color: draft.color || '',
        colorType: draft.colorType || 'solid',
        doorsCount: Number(draft.doorsCount) || 0,
        seatsCount: Number(draft.seatsCount) || 0,
        condition: draft.condition || 'Used',
        firstRegistration: draft.firstRegistration || '',
        registeredUntil: draft.registeredUntil || '',

        // Navtika / vessel fields
        engineHoursUsed: draft.engineHoursUsed !== '' ? (Number(draft.engineHoursUsed) || 0) : null,
        lengthM: draft.lengthM ? Number(draft.lengthM) : null,
        beamM: draft.beamM ? Number(draft.beamM) : null,
        draughtM: draft.draughtM ? Number(draft.draughtM) : null,
        hullMaterial: draft.hullMaterial || '',
        engineCount: draft.engineCount ? Number(draft.engineCount) : null,
        driveSystem: draft.driveSystem || '',
        maxSpeedKn: draft.maxSpeedKn ? Number(draft.maxSpeedKn) : null,
        fuelTankL: draft.fuelTankL ? Number(draft.fuelTankL) : null,
        waterTankL: draft.waterTankL ? Number(draft.waterTankL) : null,
        cabins: draft.cabins !== '' ? (Number(draft.cabins) || null) : null,
        berths: draft.berths !== '' ? (Number(draft.berths) || null) : null,

        // Technical
        fuel: draft.fuel || '',
        hybridType: draft.hybridType || null,
        transmission: draft.transmission || '',
        driveType: draft.driveType || '',
        engineCc: Number(draft.engineCc) || 0,
        powerKw: Number(draft.powerKw) || 0,
        co2: Number(draft.co2) || 0,
        emissionClass: draft.emissionClass || '',
        fuelL100km: draft.fuelL100kmCombined ? Number(draft.fuelL100kmCombined) : null,
        fuelL100kmCity: draft.fuelL100kmCity ? Number(draft.fuelL100kmCity) : null,
        fuelL100kmHighway: draft.fuelL100kmHighway ? Number(draft.fuelL100kmHighway) : null,
        batteryKwh: draft.batteryKwh ? Number(draft.batteryKwh) : null,
        rangeKm: draft.rangeKm ? Number(draft.rangeKm) : null,
        towingKg: draft.towingKg ? Number(draft.towingKg) : null,

        // Equipment (array of feature value strings) — only allow known slugs
        equipment: Array.isArray(draft.equipment)
            ? draft.equipment.filter(v => v && ALL_EQUIPMENT_VALUES.includes(v))
            : [],

        // Exhaust details (moto only)
        exhaustBrand: draft.exhaustBrand || null,
        exhaustType: draft.exhaustType || null,

        // Media
        images: {
            exterior: exteriorUrls,
            interior: interiorUrls,
        },
        coverIndex,

        // Description
        description: draft.description || '',

        // Price
        priceEur: Number(draft.priceEur) || 0,
        salePriceEur: draft.salePriceEur ? Number(draft.salePriceEur) : null,
        callForPrice: draft.callForPrice || false,
        priceNegotiable: draft.priceNegotiable || false,
        priceInclVat: draft.priceInclVat || false,
        leaseAvailable: draft.leaseAvailable || false,
        sellerType: draft.sellerType || 'private',
        leasingConditions: draft.leasingConditions || '',

        // Location
        location: {
            city: draft.location?.city || '',
            zipCode: draft.location?.zipCode || '',
            state: draft.location?.state || '',
            lat: draft.location?.lat || null,
            lng: draft.location?.lng || null,
        },

        // Contact
        contact: {
            name: draft.contact?.name || user.displayName || '',
            phone: draft.contact?.phone || null,
            showPhone: draft.contact?.showPhone || false,
            email: draft.contact?.email || user.email || '',
        },

        // Promotion
        promotion: {
            tier: draft.promotionTier || 'free',
            activatedAt: draft.promotionTier !== 'free' ? serverTimestamp() : null,
            expiresAt: null,
            paidAmount: null,
            paymentRef: null,
        },

        // Legacy fields (backwards compatibility with existing listings)
        title: itemType === 'tire'
            ? `${draft.brand || ''} ${draft.tireSize || ''}`.trim() || 'Pnevmatike'
            : itemType === 'part'
                ? `${draft.brand || ''} ${draft.partTypeLabel || draft.partType || ''}`.trim() || 'Avtodel'
                : itemType === 'oprema'
                    ? `${draft.brand || ''} ${draft.equipmentTypeLabel || draft.equipmentType || ''}`.trim() || 'Moto oprema'
                    : `${draft.make || ''} ${draft.model || ''} ${draft.variant || ''}`.trim(),
        price: Number(draft.priceEur) || 0,
        mileage: Number(draft.mileageKm) || 0,
        power: Number(draft.powerKw) || 0,
        transmission: draft.transmission || '',
        isPremium: draft.promotionTier === 'homepage',
    };

    const newDoc = await addDoc(collection(db, 'listings'), listing);
    return newDoc.id;
}

// ── Update listing ────────────────────────────────────────────────────────────
export async function updateListing(listingId, updates) {
    const docRef = doc(db, 'listings', listingId);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

// ── View tracking ──────────────────────────────────────────────────────────────
// We track views on two levels:
//   • a per-browser timeline in localStorage (works for every listing, incl. the
//     demo sample cars that have no Firestore document), and
//   • Firestore counters for real listings — a running total plus a per-day map so
//     "today / this week / overall" can be derived without an analytics backend.
// One view is counted per listing per browser session (a "unique view").

const VIEW_TS_PREFIX = lsKey('views') + '_';        // localStorage timeline (array of ms timestamps)
const VIEW_SESSION_PREFIX = lsKey('viewed') + '_';  // sessionStorage dedup guard
const VIEW_RETENTION_MS = 90 * 86400000;        // prune local timeline after 90 days

function isoDay(d) {
    return d.toISOString().slice(0, 10);
}

function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

export async function recordListingView(listingId) {
    if (!listingId) return;

    const sessKey = VIEW_SESSION_PREFIX + listingId;
    let alreadyThisSession = false;
    try {
        alreadyThisSession = !!sessionStorage.getItem(sessKey);
    } catch { /* sessionStorage unavailable */ }

    if (alreadyThisSession) return;

    // Local timeline — synchronous so getListingViewStats() picks it up immediately.
    try {
        const key = VIEW_TS_PREFIX + listingId;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        arr.push(now);
        localStorage.setItem(key, JSON.stringify(arr.filter(t => t > now - VIEW_RETENTION_MS)));
        sessionStorage.setItem(sessKey, '1');
    } catch { /* storage unavailable — non-critical */ }

    // Firestore counters for real (non-sample) listings.
    if (!listingId.startsWith('car-')) {
        try {
            const today = isoDay(new Date());
            const docRef = doc(db, 'listings', listingId);
            await updateDoc(docRef, {
                viewCount: increment(1),
                [`viewDaily.${today}`]: increment(1),
            });
        } catch {
            // Non-critical, ignore errors
        }
    }
}

// Backwards-compatible alias.
export const incrementViewCount = recordListingView;

// Returns { today, week, total } for a listing. Prefers real Firestore per-day
// data when present; otherwise derives a stable seeded baseline (so demo listings
// look alive) and layers this browser's real views on top.
export function getListingViewStats(listing) {
    const id = listing?.id || '';
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = now - 7 * 86400000;

    let local = [];
    try {
        local = JSON.parse(localStorage.getItem(VIEW_TS_PREFIX + id) || '[]');
    } catch { /* ignore */ }
    const localToday = local.filter(t => t >= todayStart.getTime()).length;
    const localWeek = local.filter(t => t >= weekStart).length;
    const localTotal = local.length;

    // Real per-day Firestore data.
    const daily = listing?.viewDaily && typeof listing.viewDaily === 'object' ? listing.viewDaily : null;
    if (daily) {
        const today = daily[isoDay(new Date())] || 0;
        let week = 0;
        for (let i = 0; i < 7; i++) week += daily[isoDay(new Date(now - i * 86400000))] || 0;
        return {
            today: Math.max(today, localToday),
            week: Math.max(week, localWeek),
            total: listing.viewCount || localTotal,
        };
    }

    // Seeded baseline for demo listings / listings without per-day tracking.
    const h = hashString(id);
    const base = (typeof listing?.viewCount === 'number' && listing.viewCount > 40)
        ? listing.viewCount
        : 280 + (h % 2400);                                       // ~280–2680
    const weekBase = Math.round(base * (0.06 + (h % 60) / 1000));  // ~6–12% of total
    const todayBase = Math.max(1, Math.round(weekBase * (0.14 + (h % 40) / 200))); // ~14–34% of week
    return {
        today: todayBase + localToday,
        week: weekBase + localWeek,
        total: base + localTotal,
    };
}

// ── Get all listings (with promotion-aware sorting) ───────────────────────────
export async function getListings() {
    let listings = [];
    try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn("Could not fetch listings from Firestore, using only sample data.", err);
    }

    // Merge with the active platform's sample listings for demo purposes
    const allListings = [...listings, ...SAMPLE_LISTINGS];
    return sortByPromotion(allListings);
}

// ── Get user listings ─────────────────────────────────────────────────────────
export async function getUserListings(userId) {
    const { where } = await import('firebase/firestore');
    const q = query(collection(db, 'listings'), where('authorId', '==', userId));
    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return listings.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}

// ── Delete listing ────────────────────────────────────────────────────────────
export async function deleteListing(listingId) {
    const { deleteDoc, doc: docFn } = await import('firebase/firestore');
    await deleteDoc(docFn(db, 'listings', listingId));
}

import { sampleCars } from '../data/sampleListings.js';
import { sampleBoats } from '../data/sampleBoats.js';
import { PLATFORM } from '../config/platform.js';

// Active platform's demo/fallback listings.
const SAMPLE_LISTINGS = PLATFORM.id === 'navtika' ? sampleBoats : sampleCars;

// ── Get single listing ────────────────────────────────────────────────────────
export async function getListingById(listingId) {
    // Check sample listings first (for demo/development)
    const sample = SAMPLE_LISTINGS.find(c => c.id === listingId);
    if (sample) return sample;

    const { getDoc, doc: docFn } = await import('firebase/firestore');
    const docRef = docFn(db, 'listings', listingId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Listing does not exist.');
    return { id: snap.id, ...snap.data() };
}

// ── Promotion-aware sort ──────────────────────────────────────────────────────
const TIER_WEIGHT = { sponsored: 2, homepage: 1, free: 0 };
const SPONSORED_MAX = 3; // max sponsored cards shown at top

export function sortByPromotion(listings) {
    const sponsored = listings
        .filter(l => l.promotion?.tier === 'sponsored')
        .slice(0, SPONSORED_MAX);

    const rest = listings
        .filter(l => l.promotion?.tier !== 'sponsored')
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    return [...sponsored, ...rest];
}

// ── Format helpers ────────────────────────────────────────────────────────────
export function formatPrice(val, callForPrice) {
    if (callForPrice) return 'Call for price';

    // Handle strings, nulls, etc.
    let num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));

    if (isNaN(num) || num <= 0) return 'Call for price';

    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    }).format(num);
}

export function formatMileage(km) {
    const mi = Math.round(Number(km) * 0.621371);
    return new Intl.NumberFormat('en-US').format(mi) + ' mi';
}
