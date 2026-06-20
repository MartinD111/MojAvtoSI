import { supabase } from '../lib/supabase.js';
import { api } from '../lib/apiClient.js';
import { uploadImages as uploadToR2 } from '../lib/uploads.js';
import { ALL_EQUIPMENT_VALUES } from '../data/equipment.js';
import { key as lsKey } from '../config/storageKeys.js';
import { createAuction, normalizeAuctionType } from './auctionService.js';
import { PLATFORM } from '../config/platform.js';

// ── Row normalizer ─────────────────────────────────────────────────────────────
// Flattens a Supabase listings row (with data jsonb) into the flat shape the
// rendering code expects (car.make, car.priceEur, car.images.exterior, etc.).
function normalizeListingRow(row) {
    const d = row.data || {};
    const ts = row.created_at ? new Date(row.created_at).getTime() : 0;
    const updTs = row.updated_at ? new Date(row.updated_at).getTime() : ts;
    return {
        ...d,
        // Indexed columns win over anything in data
        id: row.id,
        status: row.status,
        platform: row.platform,
        itemType: row.item_type ?? d.itemType ?? 'vehicle',
        title: row.title ?? d.title ?? '',
        description: row.description ?? d.description ?? '',
        make: row.brand ?? d.make ?? '',
        brand: row.brand ?? d.brand ?? d.make ?? '',
        model: row.model ?? d.model ?? '',
        year: row.year ?? d.year,
        priceEur: row.price ?? d.priceEur ?? 0,
        price: row.price ?? d.price ?? d.priceEur ?? 0,
        images: d.images?.exterior ? d.images : { exterior: Array.isArray(row.images) ? row.images : [], interior: [] },
        promotion: row.promotion ?? d.promotion ?? { tier: 'free' },
        createdAt: { toMillis: () => ts },
        updatedAt: { toMillis: () => updTs },
    };
}

// ── Image upload ──────────────────────────────────────────────────────────────
export async function uploadImages(files, userId) {
    return uploadToR2(files, { scope: 'listing', ownerId: userId });
}

// ── Create listing ────────────────────────────────────────────────────────────
export async function createListing(draft, exteriorFiles, interiorFiles, user) {
    if (!user) throw new Error('Sign in is required to publish a listing.');

    const itemType = draft.itemType || 'vehicle';
    const navtikaCategories = ['colni', 'jadrnice', 'gumenjaki', 'jet-ski', 'izvenkrmni-motorji'];
    const isNavtikaListing = navtikaCategories.includes(draft.category);
    const requiredByType = {
        vehicle: isNavtikaListing ? ['priceEur', 'make', 'fuel', 'lengthM'] : ['priceEur', 'make', 'model', 'fuel'],
        part: ['priceEur', 'partType', 'vehicleCategory'],
        tire: ['priceEur', 'tireSize', 'tireSeason', 'vehicleCategory'],
        oprema: ['priceEur', 'equipmentType', 'vehicleCategory'],
    };
    const missing = (requiredByType[itemType] || requiredByType.vehicle).filter(k => !draft[k]);
    if (missing.length) throw new Error(`Missing key fields: ${missing.join(', ')}.`);

    const [exteriorUrls, interiorUrls] = await Promise.all([
        exteriorFiles.length > 0 ? uploadImages(exteriorFiles, user.id) : Promise.resolve([]),
        interiorFiles.length > 0 ? uploadImages(interiorFiles, user.id) : Promise.resolve([]),
    ]);

    const coverIndex = draft.coverIndex || 0;
    const allImageUrls = [...exteriorUrls, ...interiorUrls];

    // Build the title
    const title = itemType === 'tire'
        ? `${draft.brand || ''} ${draft.tireSize || ''}`.trim() || 'Pnevmatike'
        : itemType === 'part'
            ? `${draft.brand || ''} ${draft.partTypeLabel || draft.partType || ''}`.trim() || 'Avtodel'
            : itemType === 'oprema'
                ? `${draft.brand || ''} ${draft.equipmentTypeLabel || draft.equipmentType || ''}`.trim() || 'Moto oprema'
                : `${draft.make || ''} ${draft.model || ''} ${draft.variant || ''}`.trim();

    // All extra fields go into data — rendered via normalizeListingRow
    const data = {
        itemType,
        vehicleCategory: draft.vehicleCategory || (itemType === 'vehicle' ? (draft.category || 'avto') : ''),
        category: itemType === 'vehicle' ? (draft.category || 'avto') : (draft.vehicleCategory || 'avto'),
        subcategory: draft.subcategory || '',
        bodyType: draft.bodyType || draft.subcategory || '',
        listingType: draft.listingType === 'rental' ? 'rental' : 'sale',
        isRental: draft.listingType === 'rental',
        rentalPricing: draft.listingType === 'rental' ? {
            perDay: Number(draft.rentalPricing?.perDay) || null,
            perWeek: Number(draft.rentalPricing?.perWeek) || null,
            deposit: Number(draft.rentalPricing?.deposit) || null,
            minDays: Number(draft.rentalPricing?.minDays) || null,
        } : null,
        entryType: draft.entryType || 'classic',
        auctionDurationWeeks: draft.entryType === 'auction' ? (Number(draft.auctionDurationWeeks) || 1) : null,
        auctionType: draft.entryType === 'auction' ? normalizeAuctionType(draft.auctionType) : null,
        auctionBinding: draft.entryType === 'auction' ? !!draft.bindingContract : null,
        auctionCash: draft.entryType === 'auction' ? (!!draft.bindingContract && !!draft.cashAllowed) : null,
        startPriceEur: draft.entryType === 'auction' ? (Number(draft.startPriceEur) || Number(draft.priceEur) || 0) : null,
        endsAt: null,
        make: draft.make || '',
        model: draft.model || '',
        variant: draft.variant || '',
        linija: draft.linija || '',
        mileageKm: Number(draft.mileageKm) || 0,
        color: draft.color || '',
        colorType: draft.colorType || 'solid',
        doorsCount: Number(draft.doorsCount) || 0,
        seatsCount: Number(draft.seatsCount) || 0,
        condition: draft.condition || 'Used',
        firstRegistration: draft.firstRegistration || '',
        registeredUntil: draft.registeredUntil || '',
        customMake: draft._customMake ? draft._customMake.trim() : null,
        customModel: draft._customModel ? draft._customModel.trim() : null,
        customVrsta: draft._customVrsta ? draft._customVrsta.trim() : null,
        engineHoursUsed: draft.engineHoursUsed !== '' ? (Number(draft.engineHoursUsed) || 0) : null,
        lengthM: draft.lengthM ? Number(draft.lengthM) : null,
        beamM: draft.beamM ? Number(draft.beamM) : null,
        draughtM: draft.draughtM ? Number(draft.draughtM) : null,
        hullMaterial: draft.hullMaterial || '',
        engineCount: draft.engineCount ? Number(draft.engineCount) : null,
        driveSystem: draft.driveSystem || '',
        engineBrand: draft.engineBrand || '',
        maxSpeedKn: draft.maxSpeedKn ? Number(draft.maxSpeedKn) : null,
        fuelTankL: draft.fuelTankL ? Number(draft.fuelTankL) : null,
        waterTankL: draft.waterTankL ? Number(draft.waterTankL) : null,
        cabins: draft.cabins !== '' ? (Number(draft.cabins) || null) : null,
        berths: draft.berths !== '' ? (Number(draft.berths) || null) : null,
        fuel: draft.fuel || '',
        hybridType: draft.hybridType || null,
        transmission: draft.transmission || '',
        driveType: draft.driveType || '',
        engineCc: Number(draft.engineCc) || 0,
        engineConfig: draft.engineConfig || '',
        powerKw: Number(draft.powerKw) || 0,
        co2: Number(draft.co2) || 0,
        emissionClass: draft.emissionClass || '',
        fuelL100km: draft.fuelL100kmCombined ? Number(draft.fuelL100kmCombined) : null,
        fuelL100kmCity: draft.fuelL100kmCity ? Number(draft.fuelL100kmCity) : null,
        fuelL100kmHighway: draft.fuelL100kmHighway ? Number(draft.fuelL100kmHighway) : null,
        batteryKwh: draft.batteryKwh ? Number(draft.batteryKwh) : null,
        rangeKm: draft.rangeKm ? Number(draft.rangeKm) : null,
        towingKg: draft.towingKg ? Number(draft.towingKg) : null,
        partGroup: draft.partGroup || '',
        partType: draft.partType || '',
        oemNumber: draft.oemNumber || '',
        brand: draft.brand || '',
        vehicleApplication: draft.vehicleApplication ? {
            make: draft.vehicleApplication.make || '',
            model: draft.vehicleApplication.model || '',
            yearFrom: draft.vehicleApplication.yearFrom || null,
            yearTo: draft.vehicleApplication.yearTo || null,
        } : null,
        equipmentGroup: draft.equipmentGroup || '',
        equipmentType: draft.equipmentType || '',
        equipmentSize: draft.equipmentSize || '',
        tireSize: draft.tireSize || '',
        tireWidth: Number(draft.tireWidth) || null,
        tireAspect: Number(draft.tireAspect) || null,
        tireRim: Number(draft.tireRim) || null,
        tireSeason: draft.tireSeason || '',
        treadDepthMm: draft.treadDepthMm ? Number(draft.treadDepthMm) : null,
        dotYear: draft.dotYear || '',
        tireCount: Number(draft.tireCount) || null,
        equipment: Array.isArray(draft.equipment)
            ? draft.equipment.filter(v => v && ALL_EQUIPMENT_VALUES.includes(v))
            : [],
        customEquipment: Array.isArray(draft.customEquipment)
            ? draft.customEquipment.filter(ce => ce && ce.value && ce.category)
            : [],
        customLinija: draft._customLinija ? draft._customLinija.trim() : null,
        exhaustBrand: draft.exhaustBrand || null,
        exhaustType: draft.exhaustType || null,
        images: { exterior: exteriorUrls, interior: interiorUrls },
        coverIndex,
        priceEur: draft.entryType === 'auction'
            ? (Number(draft.startPriceEur) || Number(draft.priceEur) || 0)
            : (Number(draft.priceEur) || 0),
        salePriceEur: draft.salePriceEur ? Number(draft.salePriceEur) : null,
        callForPrice: draft.callForPrice || false,
        priceNegotiable: draft.priceNegotiable || false,
        priceInclVat: draft.priceInclVat || false,
        leaseAvailable: draft.leaseAvailable || false,
        sellerType: draft.sellerType || 'private',
        leasingConditions: draft.leasingConditions || '',
        location: {
            country: draft.location?.country || '',
            region: draft.location?.region || '',
            lat: draft.location?.lat || null,
            lng: draft.location?.lng || null,
        },
        contact: {
            name: draft.contact?.name || user.user_metadata?.display_name || '',
            phone: draft.contact?.phone || null,
            showPhone: draft.contact?.showPhone || false,
            email: draft.contact?.email || user.email || '',
        },
        promotion: { tier: draft.promotionTier || 'free', activatedAt: draft.promotionTier !== 'free' ? new Date().toISOString() : null, expiresAt: null, paidAmount: null, paymentRef: null },
        authorId: user.id,
        authorName: user.user_metadata?.display_name || 'User',
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        isPremium: draft.promotionTier === 'homepage',
        // Legacy compat fields
        mileage: Number(draft.mileageKm) || 0,
        power: Number(draft.powerKw) || 0,
    };

    const newListing = await api.post('/api/listings', {
        platform: PLATFORM.id,
        itemType,
        title,
        description: draft.description || '',
        brand: draft.make || draft.brand || '',
        model: draft.model || '',
        year: Number(draft.year) || new Date().getFullYear(),
        price: data.priceEur,
        images: allImageUrls,
        data,
    });

    const newId = newListing.id;

    // Auction sibling
    if (draft.entryType === 'auction') {
        const days = Number(draft.durationDays) === 10 ? 10 : 7;
        try {
            await createAuction(newId, {
                sellerId: user.id,
                startPriceEur: data.startPriceEur,
                durationDays: days,
                auctionType: draft.auctionType || 'live',
                reservePriceEur: draft.reservePriceEur ? Number(draft.reservePriceEur) : null,
                bindingContract: !!draft.bindingContract,
                cashAllowed: !!draft.cashAllowed,
                sellerContract: draft.sellerContract || null,
            });
            const endsAtMs = Date.now() + days * 24 * 60 * 60 * 1000;
            await supabase.from('listings').update({ data: { ...data, endsAt: new Date(endsAtMs).toISOString() } }).eq('id', newId);
        } catch (err) {
            console.error('[listingService] auction creation failed', err);
        }
    }

    // Taxonomy proposals (fire-and-forget)
    const proposals = [];
    const proposalBase = { author_id: user.id, status: 'pending' };
    if (data.customLinija && data.make) {
        proposals.push(supabase.from('taxonomy_proposals').insert({ ...proposalBase, payload: { type: 'linija', brand: data.make, value: data.customLinija, listingId: newId } }));
    }
    (data.customEquipment || []).forEach(ce => {
        if (!ce.value || !data.make) return;
        proposals.push(supabase.from('taxonomy_proposals').insert({ ...proposalBase, payload: { type: 'equipment', brand: data.make, category: ce.category, value: ce.value, listingId: newId } }));
    });
    if (data.customMake) proposals.push(supabase.from('taxonomy_proposals').insert({ ...proposalBase, payload: { type: 'make', brand: data.customMake, category: data.category, value: data.customMake, listingId: newId } }));
    if (data.customModel) proposals.push(supabase.from('taxonomy_proposals').insert({ ...proposalBase, payload: { type: 'model', brand: data.customMake || data.make, model: data.customModel, value: data.customModel, listingId: newId } }));
    if (data.customVrsta) proposals.push(supabase.from('taxonomy_proposals').insert({ ...proposalBase, payload: { type: 'vrsta', brand: data.customMake || data.make, value: data.customVrsta, listingId: newId } }));
    if (proposals.length) Promise.allSettled(proposals);

    return newId;
}

// ── Update listing ────────────────────────────────────────────────────────────
export async function updateListing(listingId, updates) {
    // Merge partial updates into data jsonb
    const { data: row } = await supabase.from('listings').select('data').eq('id', listingId).single();
    const merged = { ...(row?.data || {}), ...updates };
    await supabase.from('listings').update({ data: merged, updated_at: new Date().toISOString() }).eq('id', listingId);
}

// ── View tracking ──────────────────────────────────────────────────────────────
const VIEW_TS_PREFIX = lsKey('views') + '_';
const VIEW_SESSION_PREFIX = lsKey('viewed') + '_';
const VIEW_RETENTION_MS = 90 * 86400000;

function isoDay(d) { return d.toISOString().slice(0, 10); }

function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

export async function recordListingView(listingId) {
    if (!listingId) return;
    const sessKey = VIEW_SESSION_PREFIX + listingId;
    let alreadyThisSession = false;
    try { alreadyThisSession = !!sessionStorage.getItem(sessKey); } catch {}
    if (alreadyThisSession) return;

    try {
        const key = VIEW_TS_PREFIX + listingId;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        arr.push(now);
        localStorage.setItem(key, JSON.stringify(arr.filter(t => t > now - VIEW_RETENTION_MS)));
        sessionStorage.setItem(sessKey, '1');
    } catch {}

    // Supabase counter for real listings (not sample)
    if (!listingId.startsWith('car-') && !listingId.startsWith('boat-')) {
        try {
            const today = isoDay(new Date());
            const { data: row } = await supabase.from('listings').select('data').eq('id', listingId).single();
            if (row) {
                const d = row.data || {};
                const viewDaily = { ...(d.viewDaily || {}), [today]: ((d.viewDaily?.[today] || 0) + 1) };
                await supabase.from('listings').update({
                    data: { ...d, viewCount: (d.viewCount || 0) + 1, viewDaily },
                }).eq('id', listingId);
            }
        } catch {}
    }
}

export const incrementViewCount = recordListingView;

export function getListingViewStats(listing) {
    const id = listing?.id || '';
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = now - 7 * 86400000;

    let local = [];
    try { local = JSON.parse(localStorage.getItem(VIEW_TS_PREFIX + id) || '[]'); } catch {}
    const localToday = local.filter(t => t >= todayStart.getTime()).length;
    const localWeek = local.filter(t => t >= weekStart).length;
    const localTotal = local.length;

    const daily = listing?.viewDaily && typeof listing.viewDaily === 'object' ? listing.viewDaily : null;
    if (daily) {
        const today = daily[isoDay(new Date())] || 0;
        let week = 0;
        for (let i = 0; i < 7; i++) week += daily[isoDay(new Date(now - i * 86400000))] || 0;
        return { today: Math.max(today, localToday), week: Math.max(week, localWeek), total: listing.viewCount || localTotal };
    }

    const h = hashString(id);
    const base = (typeof listing?.viewCount === 'number' && listing.viewCount > 40) ? listing.viewCount : 280 + (h % 2400);
    const weekBase = Math.round(base * (0.06 + (h % 60) / 1000));
    const todayBase = Math.max(1, Math.round(weekBase * (0.14 + (h % 40) / 200)));
    return { today: todayBase + localToday, week: weekBase + localWeek, total: base + localTotal };
}

// ── Get all listings ──────────────────────────────────────────────────────────
export async function getListings() {
    let listings = [];
    try {
        const { data } = await supabase
            .from('listings')
            .select('*')
            .eq('platform', PLATFORM.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(48);
        listings = (data || []).map(normalizeListingRow);
    } catch (err) {
        console.warn('[getListings] Supabase error, using sample data only.', err);
    }
    return sortByPromotion([...listings, ...SAMPLE_LISTINGS]);
}

// ── Paginated listings ────────────────────────────────────────────────────────
// lastDoc is used as an offset cursor (number) for backwards compatibility with callers.
export async function getListingsPaged({ lastDoc = null, pageSize = 24 } = {}) {
    const from = typeof lastDoc === 'number' ? lastDoc : 0;
    const to = from + pageSize - 1;

    let snapshot = [];
    try {
        const { data } = await supabase
            .from('listings')
            .select('*')
            .eq('platform', PLATFORM.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(from, to);
        snapshot = data || [];
    } catch (err) {
        console.warn('[getListingsPaged] Supabase error, returning sample data fallback.', err);
        return { listings: sortByPromotion(from === 0 ? [...SAMPLE_LISTINGS] : []), lastDoc: null, hasMore: false };
    }

    const listings = snapshot.map(normalizeListingRow);
    return {
        listings: sortByPromotion(from === 0 ? [...listings, ...SAMPLE_LISTINGS] : listings),
        lastDoc: from + snapshot.length,
        hasMore: snapshot.length === pageSize,
    };
}

// ── Get user listings ─────────────────────────────────────────────────────────
export async function getUserListings(userId) {
    const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
    return (data || []).map(normalizeListingRow);
}

// ── Delete listing ────────────────────────────────────────────────────────────
export async function deleteListing(listingId, action = 'removed') {
    if (action === 'sold') {
        const { data: row } = await supabase.from('listings').select('data').eq('id', listingId).single();
        await supabase.from('listings').update({
            status: 'sold',
            data: { ...(row?.data || {}), soldAt: new Date().toISOString() },
            updated_at: new Date().toISOString(),
        }).eq('id', listingId);
    } else {
        await api.del(`/api/listings/${listingId}`);
    }
}

import { sampleCars } from '../data/sampleListings.js';
import { sampleBoats } from '../data/sampleBoats.js';
import { sampleAuctionCars, sampleAuctionBoats } from '../data/sampleAuctions.js';

// Active platform's demo/fallback listings — DEV only.
const SAMPLE_LISTINGS = import.meta.env.DEV
    ? (PLATFORM.id === 'navtika' ? [...sampleBoats, ...sampleAuctionBoats] : [...sampleCars, ...sampleAuctionCars])
    : [];

// ── Get single listing ────────────────────────────────────────────────────────
export async function getListingById(listingId) {
    const sample = SAMPLE_LISTINGS.find(c => c.id === listingId);
    if (sample) return sample;
    const row = await api.get(`/api/listings/${listingId}`, { auth: false });
    return normalizeListingRow(row);
}

// ── Promotion-aware sort ──────────────────────────────────────────────────────
const SPONSORED_MAX = 3;

function isActiveBoost(listing) {
    const tier = listing.promotion?.tier;
    if (!tier || tier === 'free') return false;
    const exp = listing.promotion?.expiresAt;
    if (!exp) return true;
    const ms = exp?.toMillis?.() ?? (typeof exp === 'number' ? exp : null) ?? (typeof exp === 'string' ? new Date(exp).getTime() : null);
    return ms === null || ms > Date.now();
}

export function sortByPromotion(listings) {
    const sponsored = listings.filter(l => l.promotion?.tier === 'sponsored' && isActiveBoost(l)).slice(0, SPONSORED_MAX);
    const rest = listings
        .filter(l => !(l.promotion?.tier === 'sponsored' && isActiveBoost(l)))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return [...sponsored, ...rest];
}

// ── Format helpers ────────────────────────────────────────────────────────────
export function formatPrice(val, callForPrice) {
    if (callForPrice) return 'Pokličite za ceno';
    let num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) return 'Pokličite za ceno';
    return new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
}

export function formatMileage(km) {
    return new Intl.NumberFormat('sl-SI').format(Math.round(Number(km))) + ' km';
}
