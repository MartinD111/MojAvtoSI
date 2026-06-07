// ═══════════════════════════════════════════════════════════════════════════════
// Admin Service — MojAvto.si
// All Firebase/Firestore operations for the admin panel
// Requires the logged-in user to have role: 'admin' in users/{uid}
// ═══════════════════════════════════════════════════════════════════════════════

import {
    collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
    query, orderBy, where, limit, serverTimestamp, writeBatch,
    getCountFromServer, startAfter,
} from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '../firebase.js';

// ── Admin guard ───────────────────────────────────────────────────────────────

export async function checkAdminRole(uid) {
    if (!uid) return false;
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return false;
        const data = snap.data();
        return data.role === 'admin' || data.role === 'moderator' || data.role === 'editor';
    } catch {
        return false;
    }
}

export async function getUserRole(uid) {
    if (!uid) return null;
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return 'user';
        return snap.data().role || 'user';
    } catch {
        return null;
    }
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export async function addAuditLog(adminUid, adminName, action, target, details = {}) {
    try {
        await addDoc(collection(db, 'auditLog'), {
            adminUid,
            adminName,
            action,
            target,
            details,
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.warn('[Admin] AuditLog write failed:', e);
    }
}

export async function getAuditLogs(limitN = 100) {
    const q = query(collection(db, 'auditLog'), orderBy('createdAt', 'desc'), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export async function getDashboardStats() {
    const [listingsSnap, usersSnap, brandsSnap] = await Promise.allSettled([
        getCountFromServer(collection(db, 'listings')),
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'brands')),
    ]);

    const totalListings = listingsSnap.status === 'fulfilled' ? listingsSnap.value.data().count : 0;
    const totalUsers = usersSnap.status === 'fulfilled' ? usersSnap.value.data().count : 0;
    const totalBrands = brandsSnap.status === 'fulfilled' ? brandsSnap.value.data().count : 0;

    // Pending listings
    let pendingCount = 0;
    let activeCount = 0;
    let revenueTotal = 0;
    try {
        const pendingQ = query(collection(db, 'listings'), where('status', '==', 'pending'));
        const pendingSnap = await getCountFromServer(pendingQ);
        pendingCount = pendingSnap.data().count;

        const activeQ = query(collection(db, 'listings'), where('status', '==', 'active'));
        const activeSnap = await getCountFromServer(activeQ);
        activeCount = activeSnap.data().count;
    } catch { /* rules might block count */ }

    // Recent listings for revenue estimate
    let recentListings = [];
    try {
        const recentQ = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(50));
        const recentSnap = await getDocs(recentQ);
        recentListings = recentSnap.docs.map(d => d.data());
        revenueTotal = recentListings
            .filter(l => l.promotion?.tier !== 'free' && l.promotion?.paidAmount)
            .reduce((sum, l) => sum + (l.promotion.paidAmount || 0), 0);
    } catch { /* ignore */ }

    // New listings today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newToday = recentListings.filter(l => {
        const ts = l.createdAt?.toDate?.();
        return ts && ts >= todayStart;
    }).length;

    return {
        totalListings,
        totalUsers,
        totalBrands,
        pendingCount,
        activeCount,
        revenueTotal,
        newToday,
    };
}

export async function getRecentListings(limitN = 10) {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Listings management ───────────────────────────────────────────────────────

export async function getAllListings(filters = {}, limitN = 50, lastDoc = null) {
    let constraints = [orderBy('createdAt', 'desc'), limit(limitN)];

    if (filters.status) {
        constraints.unshift(where('status', '==', filters.status));
    }
    if (filters.category) {
        constraints.unshift(where('category', '==', filters.category));
    }
    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'listings'), ...constraints);
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, _doc: d, ...d.data() }));
    return { docs, lastDoc: snap.docs[snap.docs.length - 1] || null };
}

export async function adminUpdateListingStatus(listingId, status, note = '') {
    await updateDoc(doc(db, 'listings', listingId), {
        status,
        moderationNote: note,
        moderatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function adminDeleteListing(listingId) {
    await deleteDoc(doc(db, 'listings', listingId));
}

export async function adminSetFeatured(listingId, tier, durationDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await updateDoc(doc(db, 'listings', listingId), {
        'promotion.tier': tier,
        'promotion.activatedAt': serverTimestamp(),
        'promotion.expiresAt': expiresAt,
        updatedAt: serverTimestamp(),
    });
}

// ── Users management ──────────────────────────────────────────────────────────

export async function getAllUsers(limitN = 100) {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function adminUpdateUserRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
}

export async function adminBanUser(uid, banned = true) {
    await updateDoc(doc(db, 'users', uid), {
        status: banned ? 'banned' : 'active',
        bannedAt: banned ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
    });
}

export async function getUserListingsCount(uid) {
    try {
        const q = query(collection(db, 'listings'), where('authorId', '==', uid));
        const snap = await getCountFromServer(q);
        return snap.data().count;
    } catch { return 0; }
}

// ── Taxonomy: Brands ──────────────────────────────────────────────────────────

export async function getBrands(categoryFilter = null) {
    let q;
    if (categoryFilter) {
        q = query(collection(db, 'brands'), where('category', '==', categoryFilter));
    } else {
        q = query(collection(db, 'brands'));
    }
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export async function createBrand(data) {
    const docRef = await addDoc(collection(db, 'brands'), {
        name: data.name.trim(),
        slug: data.slug || slugify(data.name),
        category: data.category || 'avto',
        logoUrl: data.logoUrl || '',
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateBrand(id, data) {
    await updateDoc(doc(db, 'brands', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteBrand(id) {
    await deleteDoc(doc(db, 'brands', id));
}

// ── Taxonomy: Models ──────────────────────────────────────────────────────────

export async function getModels(brandId = null) {
    let q;
    if (brandId) {
        q = query(collection(db, 'models'), where('brandId', '==', brandId));
    } else {
        q = query(collection(db, 'models'));
    }
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export async function createModel(data) {
    const docRef = await addDoc(collection(db, 'models'), {
        name: data.name.trim(),
        slug: data.slug || slugify(data.name),
        brandId: data.brandId,
        brandName: data.brandName || '',
        category: data.category || 'avto',
        subcategory: data.subcategory || '',
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateModel(id, data) {
    await updateDoc(doc(db, 'models', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteModel(id) {
    await deleteDoc(doc(db, 'models', id));
}

// ── Excel/Bulk import ─────────────────────────────────────────────────────────

const ALLOWED_FUEL_TYPES    = ['Petrol','Diesel','Electric','Hybrid','Plug-in Hybrid','LPG','CNG','Hydrogen','Steam'];
const ALLOWED_ENGINE_TYPES  = ['4-stroke','2-stroke','Electric','Rotary'];
const ALLOWED_ENGINE_CONFIGS = ['Single','Parallel Twin','V-Twin','Triple','Inline-4','Boxer','V4'];
// Moto (v2) allowed values — Slovenian, produced by the moto template/parser
const ALLOWED_MOTO_STROKE     = ['2T','4T','Električni','Wankel'];
const ALLOWED_MOTO_DRIVETRAIN = ['veriga','zobati jermen','jekleni jermen','kardan'];

/**
 * Validates tech spec fields from an import row per D-10.
 * Returns { valid: boolean, specs: object, errors: string[] }
 * specs contains only the fields that are present and valid.
 */
function validateTrimSpecs(row, rowLabel) {
    const errs = [];
    const specs = {};

    // ── Navtika branches: plovila (vessels) + izvenkrmni (outboard motors) ────
    const navCat = (row.category || '').toLowerCase();
    if (navCat === 'plovila') {
        // Vessels carry body-type (Vrsta), subcategory (Kategorija) + variant; no engine specs.
        if (row.vrsta)      specs.vrsta      = String(row.vrsta);
        if (row.kategorija) specs.kategorija = String(row.kategorija);
        return { valid: true, specs, errors: errs };
    }
    if (navCat === 'izvenkrmni') {
        // Outboard motors: horsepower (KM) integer 1–2000, or empty (electric).
        if (row.horsepower_km !== '' && row.horsepower_km != null) {
            const km = parseInt(row.horsepower_km, 10);
            if (isNaN(km) || km < 1 || km > 2000) {
                errs.push(`${rowLabel}: KM "${row.horsepower_km}" mora biti celo število 1–2000 (ali prazno)`);
            } else { specs.horsepower_km = km; }
        }
        return { valid: errs.length === 0, specs, errors: errs };
    }

    // ── Moto (v2) branch: SL fields produced by the moto template/parser ──────
    if ((row.category || '').toLowerCase() === 'moto') {
        if (row.displacement_cc !== '' && row.displacement_cc != null) {
            const cc = parseInt(row.displacement_cc, 10);
            if (isNaN(cc) || cc < 50 || cc > 3000) {
                errs.push(`${rowLabel}: prostornina "${row.displacement_cc}" mora biti celo število 50–3000 (ali prazno za električne)`);
            } else { specs.displacement_cc = cc; }
        }
        if (row.stroke) {
            if (!ALLOWED_MOTO_STROKE.includes(row.stroke)) errs.push(`${rowLabel}: takt "${row.stroke}" ni veljaven (${ALLOWED_MOTO_STROKE.join(', ')})`);
            else specs.stroke = row.stroke;
        }
        if (row.drivetrain) {
            if (!ALLOWED_MOTO_DRIVETRAIN.includes(row.drivetrain)) errs.push(`${rowLabel}: prenos moči "${row.drivetrain}" ni veljaven (${ALLOWED_MOTO_DRIVETRAIN.join(', ')})`);
            else specs.drivetrain = row.drivetrain;
        }
        if (row.engine_type)     specs.engine_type     = String(row.engine_type);        // friendly group
        if (row.engine_code)     specs.engine_code     = String(row.engine_code);        // raw code
        if (row.cylinders)       specs.cylinders       = String(row.cylinders);
        if (row.cylinder_layout) specs.cylinder_layout = String(row.cylinder_layout);
        if (row.sub_type)        specs.sub_type        = String(row.sub_type);
        return { valid: errs.length === 0, specs, errors: errs };
    }

    // engine_capacity_cc: integer 50–10000 or empty
    if (row.engine_capacity_cc !== '' && row.engine_capacity_cc != null) {
        const cc = parseInt(row.engine_capacity_cc, 10);
        if (isNaN(cc) || cc < 50 || cc > 10000) {
            errs.push(`${rowLabel}: engine_capacity_cc "${row.engine_capacity_cc}" must be integer 50–10000`);
        } else {
            specs.engine_capacity_cc = cc;
        }
    }

    // fuel_type: must be in allowed list or empty
    if (row.fuel_type) {
        if (!ALLOWED_FUEL_TYPES.includes(row.fuel_type)) {
            errs.push(`${rowLabel}: fuel_type "${row.fuel_type}" not in allowed list: ${ALLOWED_FUEL_TYPES.join(', ')}`);
        } else {
            specs.fuel_type = row.fuel_type;
        }
    }

    // fuel_consumption_*: float 0.1–99.9 or empty
    const parseConsumption = (val, label) => {
        if (val === '' || val == null) return null;
        const f = parseFloat(val);
        if (isNaN(f) || f < 0.1 || f > 99.9) {
            errs.push(`${rowLabel}: ${label} "${val}" must be float 0.1–99.9`);
            return undefined; // signal invalid
        }
        return f;
    };
    const city     = parseConsumption(row.fuel_consumption_city, 'fuel_consumption_city');
    const highway  = parseConsumption(row.fuel_consumption_highway, 'fuel_consumption_highway');
    const combined = parseConsumption(row.fuel_consumption_combined, 'fuel_consumption_combined');
    const consLegacy = parseConsumption(row.fuel_consumption, 'fuel_consumption');
    if (city     !== undefined && city     !== null) specs.fuel_consumption_city     = city;
    if (highway  !== undefined && highway  !== null) specs.fuel_consumption_highway  = highway;
    if (combined !== undefined && combined !== null) specs.fuel_consumption_combined = combined;
    if (consLegacy !== undefined && consLegacy !== null) specs.fuel_consumption = consLegacy;

    // electric_range_km: integer 1–2000 or empty
    if (row.electric_range_km !== '' && row.electric_range_km != null) {
        const range = parseInt(row.electric_range_km, 10);
        if (isNaN(range) || range < 1 || range > 2000) {
            errs.push(`${rowLabel}: electric_range_km "${row.electric_range_km}" must be integer 1–2000`);
        } else {
            specs.electric_range_km = range;
        }
    }

    // engine_type: must be in allowed list or empty
    if (row.engine_type) {
        if (!ALLOWED_ENGINE_TYPES.includes(row.engine_type)) {
            errs.push(`${rowLabel}: engine_type "${row.engine_type}" not in allowed list: ${ALLOWED_ENGINE_TYPES.join(', ')}`);
        } else {
            specs.engine_type = row.engine_type;
        }
    }

    // engine_configuration: must be in allowed list or empty
    if (row.engine_configuration) {
        if (!ALLOWED_ENGINE_CONFIGS.includes(row.engine_configuration)) {
            errs.push(`${rowLabel}: engine_configuration "${row.engine_configuration}" not in allowed list: ${ALLOWED_ENGINE_CONFIGS.join(', ')}`);
        } else {
            specs.engine_configuration = row.engine_configuration;
        }
    }

    // capacity (commercial): string, max 20 chars
    if (row.capacity) {
        if (String(row.capacity).length > 20) {
            errs.push(`${rowLabel}: capacity "${row.capacity}" exceeds 20 characters`);
        } else {
            specs.capacity = String(row.capacity);
        }
    }

    return { valid: errs.length === 0, specs, errors: errs };
}

/**
 * Import taxonomy rows from parsed Excel data.
 * rows: [{ category, brand, model, variant?, ...tech-spec fields }]
 * Returns { imported, skipped, errors }
 */
export async function importTaxonomyRows(rows, adminUid, adminName) {
    const report = { imported: 0, skipped: 0, errors: [] };

    // Load existing brands and models for dedup
    const existingBrands = await getBrands();
    const existingModels = await getModels();

    const brandMap = new Map(existingBrands.map(b => [normalize(b.name + '|' + b.category), b]));
    const modelMap = new Map(existingModels.map(m => [normalize(m.name + '|' + m.brandId), m]));

    // Load existing taxonomy_import_log variants for updates/merging
    const categories = [...new Set(rows.map(r => (r.category || 'avto').trim().toLowerCase()))];
    const logsMap = new Map();
    for (const c of categories) {
        try {
            const snap = await getDocs(query(collection(db, 'taxonomy_import_log'), where('category', '==', c)));
            snap.forEach(d => {
                const data = d.data();
                const key = normalize(c + '|' + data.brand + '|' + data.model + '|' + data.trim);
                logsMap.set(key, { id: d.id, ref: d.ref, specs: data.specs || {} });
            });
        } catch (err) {
            console.warn(`[Admin] Failed to load existing logs for category ${c}:`, err);
        }
    }

    let batch = writeBatch(db);
    let batchCount = 0;

    for (const row of rows) {
        try {
            const cat = (row.category || 'avto').trim().toLowerCase();
            const brandName = (row.brand || '').trim();
            const modelName = (row.model || '').trim();

            if (!brandName) { report.errors.push(`Vrstica brez znamke: ${JSON.stringify(row)}`); continue; }

            // Brand dedup
            const brandKey = normalize(brandName + '|' + cat);
            let brand = brandMap.get(brandKey);
            if (!brand) {
                const newBrandRef = doc(collection(db, 'brands'));
                batch.set(newBrandRef, {
                    name: brandName,
                    slug: slugify(brandName),
                    category: cat,
                    logoUrl: '',
                    createdAt: serverTimestamp(),
                });
                brand = { id: newBrandRef.id, name: brandName, category: cat };
                brandMap.set(brandKey, brand);
                batchCount++;
                report.imported++;
            }

            // Model dedup
            if (modelName) {
                const modelKey = normalize(modelName + '|' + brand.id);
                if (!modelMap.has(modelKey)) {
                    const newModelRef = doc(collection(db, 'models'));
                    batch.set(newModelRef, {
                        name: modelName,
                        slug: slugify(modelName),
                        brandId: brand.id,
                        brandName: brandName,
                        category: cat,
                        createdAt: serverTimestamp(),
                    });
                    modelMap.set(modelKey, { id: newModelRef.id });
                    batchCount++;
                    report.imported++;
                }
            }

            // Variant dedup + tech-spec validation + import-log write/update
            if (modelName && row.variant) {
                const trimName = String(row.variant).trim();
                if (trimName) {
                    const rowLabel = `${brandName} / ${modelName} / ${trimName}`;
                    const { valid, specs, errors: specErrors } = validateTrimSpecs(row, rowLabel);
                    specErrors.forEach(e => report.errors.push(e));

                    if (valid || Object.keys(specs).length === 0) {
                        const variantObj = { trim: trimName, ...specs };
                        const variantKey = normalize(cat + '|' + brandName + '|' + modelName + '|' + trimName);
                        
                        const existingLog = logsMap.get(variantKey);
                        if (existingLog) {
                            // Merge specs (specifically fuel_type and engine_capacity_cc)
                            const mergedSpecs = { ...existingLog.specs, ...variantObj };
                            const hasChanges = JSON.stringify(existingLog.specs) !== JSON.stringify(mergedSpecs);
                            if (hasChanges) {
                                batch.update(existingLog.ref, {
                                    specs: mergedSpecs,
                                    updatedAt: serverTimestamp(),
                                    updatedBy: adminUid,
                                });
                                existingLog.specs = mergedSpecs; // Update in-memory
                                batchCount++;
                                report.imported++;
                            } else {
                                report.skipped++;
                            }
                        } else {
                            // Log variant + specs to import audit collection
                            const variantRef = doc(collection(db, 'taxonomy_import_log'));
                            batch.set(variantRef, {
                                trim:       trimName,
                                brand:      brandName,
                                model:      modelName,
                                category:   cat,
                                specs:      variantObj,
                                importedAt: serverTimestamp(),
                                importedBy: adminUid,
                            });
                            logsMap.set(variantKey, { id: variantRef.id, ref: variantRef, specs: variantObj });
                            batchCount++;
                            report.imported++;
                        }
                    }
                }
            }

            // Firestore batch limit: 500 ops
            if (batchCount >= 490) {
                try {
                    await batch.commit();
                } finally {
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        } catch (e) {
            report.errors.push(`Napaka pri vrstici ${JSON.stringify(row)}: ${e.message}`);
        }
    }

    if (batchCount > 0) {
        await batch.commit();
    }

    await addAuditLog(adminUid, adminName, 'TAXONOMY_IMPORT', 'taxonomy', {
        imported: report.imported,
        skipped: report.skipped,
        errors: report.errors.length,
    });

    return report;
}

export async function clearCarTaxonomy(adminUid, adminName) {
    let batch = writeBatch(db);
    let count = 0;

    // 1. Delete brands where category == 'avto'
    const brandsSnap = await getDocs(query(collection(db, 'brands'), where('category', '==', 'avto')));
    for (const d of brandsSnap.docs) {
        batch.delete(d.ref);
        count++;
        if (count >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
        }
    }

    // 2. Delete models where category == 'avto'
    const modelsSnap = await getDocs(query(collection(db, 'models'), where('category', '==', 'avto')));
    for (const d of modelsSnap.docs) {
        batch.delete(d.ref);
        count++;
        if (count >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
        }
    }

    // 3. Delete taxonomy_import_log where category == 'avto'
    const logsSnap = await getDocs(query(collection(db, 'taxonomy_import_log'), where('category', '==', 'avto')));
    for (const d of logsSnap.docs) {
        batch.delete(d.ref);
        count++;
        if (count >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
        }
    }

    if (count > 0) {
        await batch.commit();
    }

    await addAuditLog(adminUid, adminName, 'TAXONOMY_CLEAR', 'taxonomy', { category: 'avto' });
}

// ── Reports / Moderation ──────────────────────────────────────────────────────

export async function getReports(status = null) {
    let q;
    if (status) {
        q = query(collection(db, 'reports'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(100));
    } else {
        q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(100));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function resolveReport(reportId, action, adminNote = '') {
    await updateDoc(doc(db, 'reports', reportId), {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        resolvedAt: serverTimestamp(),
        adminNote,
    });
}

// ── Site settings ─────────────────────────────────────────────────────────────

export async function getSiteSettings() {
    const snap = await getDoc(doc(db, 'siteConfig', 'main'));
    if (!snap.exists()) {
        return {
            packages: {
                free: { name: 'Brezplačni', price: 0, maxListings: 3, durationDays: 30 },
                premium: { name: 'Premium', price: 9.99, maxListings: 20, durationDays: 60 },
                dealer: { name: 'Dealer', price: 49.99, maxListings: 999, durationDays: 365 },
            },
            maxImagesPerListing: 20,
            listingAutoExpireDays: 90,
            featuredPricePerDay: 2.99,
            maintenanceMode: false,
            allowGuestListings: false,
        };
    }
    return snap.data();
}

export async function updateSiteSettings(data) {
    await updateDoc(doc(db, 'siteConfig', 'main'), { ...data, updatedAt: serverTimestamp() });
}

// ── SEO Management ────────────────────────────────────────────────────────────

export async function getSeoPages(limitN = 100) {
    const q = query(collection(db, 'seoPages'), orderBy('slug'), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function upsertSeoPage(slug, data) {
    const docRef = doc(db, 'seoPages', slug.replace(/\//g, '_'));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        await updateDoc(docRef, { ...data, slug, updatedAt: serverTimestamp() });
    } else {
        await updateDoc(docRef, { ...data, slug, createdAt: serverTimestamp() }).catch(() =>
            addDoc(collection(db, 'seoPages'), { ...data, slug, createdAt: serverTimestamp() })
        );
    }
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getTopBrands(limitN = 10) {
    // Count listings per brand
    const q = query(collection(db, 'listings'), where('status', '==', 'active'), limit(500));
    const snap = await getDocs(q);
    const brandCounts = {};
    snap.docs.forEach(d => {
        const make = d.data().make || 'Neznano';
        brandCounts[make] = (brandCounts[make] || 0) + 1;
    });
    return Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limitN)
        .map(([name, count]) => ({ name, count }));
}

export async function getListingsByDay(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const q = query(
        collection(db, 'listings'),
        where('createdAt', '>=', since),
        orderBy('createdAt', 'desc'),
        limit(500)
    );
    const snap = await getDocs(q);

    const byDay = {};
    snap.docs.forEach(d => {
        const date = d.data().createdAt?.toDate?.();
        if (!date) return;
        const key = date.toISOString().split('T')[0];
        byDay[key] = (byDay[key] || 0) + 1;
    });

    // Fill missing days with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        result.push({ date: key, count: byDay[key] || 0 });
    }
    return result;
}

export async function getSearchAnalytics(limitN = 20) {
    const q = query(collection(db, 'searchLogs'), orderBy('count', 'desc'), limit(limitN));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Webscraping: approved sources ─────────────────────────────────────────────
// The allowlist of shop domains the platform has permission to scrape. Only
// `approved: true` sources are ever scraped by the (future) backend crawler.

function canonicalDomain(input) {
    let s = String(input || '').trim().toLowerCase();
    s = s.replace(/^https?:\/\//, '').replace(/^www\./, '');
    s = s.split('/')[0].split('?')[0].split('#')[0];
    return s;
}

export async function getScrapingSources() {
    const snap = await getDocs(collection(db, 'scrapingSources'));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => (a.domain || '').localeCompare(b.domain || ''));
}

export async function createScrapingSource(data) {
    const docRef = await addDoc(collection(db, 'scrapingSources'), {
        domain: canonicalDomain(data.domain),
        name: (data.name || '').trim(),
        baseUrl: (data.baseUrl || '').trim(),
        category: data.category || 'oboje',        // 'deli' | 'gume' | 'oboje'
        approved: !!data.approved,
        permissionNote: (data.permissionNote || '').trim(),
        robotsAllowed: data.robotsAllowed !== false,
        status: data.status || 'active',           // 'active' | 'paused'
        lastScrapedAt: null,
        lastScrapeStatus: null,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateScrapingSource(id, data) {
    const updates = { ...data, updatedAt: serverTimestamp() };
    if (data.domain) updates.domain = canonicalDomain(data.domain);
    await updateDoc(doc(db, 'scrapingSources', id), updates);
}

export async function deleteScrapingSource(id) {
    await deleteDoc(doc(db, 'scrapingSources', id));
}

export async function getApprovedScrapingDomains() {
    const q = query(collection(db, 'scrapingSources'), where('approved', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().domain).filter(Boolean);
}

// ── Price-comparison catalog (partsCatalog) ───────────────────────────────────
// Manual ingestion path until the webscraping backend exists. Each product holds
// a denormalized `offers[]` array; lowestPrice/offerCount are precomputed here.

function computeOfferStats(offers = []) {
    const prices = offers.map(o => Number(o.price)).filter(n => !isNaN(n));
    return {
        lowestPrice: prices.length ? Math.min(...prices) : null,
        offerCount: offers.length,
    };
}

export async function getCatalogProductsAdmin() {
    const snap = await getDocs(collection(db, 'partsCatalog'));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
}

export async function createCatalogProduct(data) {
    const offers = Array.isArray(data.offers) ? data.offers : [];
    const stats = computeOfferStats(offers);
    const docRef = await addDoc(collection(db, 'partsCatalog'), {
        itemType: data.itemType || 'part',
        vehicleCategory: data.vehicleCategory || 'avto',
        title: (data.title || '').trim(),
        brand: (data.brand || '').trim(),
        imageUrl: data.imageUrl || '',
        attributes: data.attributes || {},
        offers,
        ...stats,
        status: data.status || 'active',
        ingestSource: 'manual',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCatalogProduct(id, data) {
    const updates = { ...data, updatedAt: serverTimestamp() };
    if (Array.isArray(data.offers)) Object.assign(updates, computeOfferStats(data.offers));
    await updateDoc(doc(db, 'partsCatalog', id), updates);
}

export async function deleteCatalogProduct(id) {
    await deleteDoc(doc(db, 'partsCatalog', id));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function normalize(str) {
    return str.toLowerCase().trim();
}
