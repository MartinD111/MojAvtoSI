// ═══════════════════════════════════════════════════════════════════════════════
// Admin Service — MojAvto.si (Supabase)
// All operations require the logged-in user to have is_admin = true in profiles.
// ═══════════════════════════════════════════════════════════════════════════════

import { supabase } from '../lib/supabase.js';

// ── Admin guard ───────────────────────────────────────────────────────────────

export async function checkAdminRole(uid) {
    if (!uid) return false;
    try {
        const { data } = await supabase.from('profiles').select('is_admin, prefs').eq('id', uid).single();
        return !!(data?.is_admin || data?.prefs?.role === 'admin' || data?.prefs?.role === 'moderator');
    } catch { return false; }
}

export async function getUserRole(uid) {
    if (!uid) return null;
    try {
        const { data } = await supabase.from('profiles').select('is_admin, prefs').eq('id', uid).single();
        if (!data) return 'user';
        if (data.is_admin) return 'admin';
        return data.prefs?.role || 'user';
    } catch { return null; }
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export async function addAuditLog(adminUid, adminName, action, target, details = {}) {
    try {
        await supabase.from('audit_log').insert({ admin_id: adminUid, admin_name: adminName, action, target, details });
    } catch (e) { console.warn('[Admin] AuditLog write failed:', e); }
}

export async function getAuditLogs(limitN = 100) {
    const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limitN);
    return data || [];
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export async function getDashboardStats() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const [{ count: totalListings }, { count: totalUsers }, recentResult] = await Promise.allSettled([
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('status, created_at, promotion').order('created_at', { ascending: false }).limit(50),
    ]).then(r => r.map(p => p.status === 'fulfilled' ? p.value : { count: 0, data: [] }));

    const recentListings = recentResult.data || [];
    const pendingCount = recentListings.filter(l => l.status === 'pending').length;
    const activeCount = recentListings.filter(l => l.status === 'active').length;
    const revenueTotal = recentListings.filter(l => l.promotion?.tier !== 'free' && l.promotion?.paidAmount).reduce((s, l) => s + (l.promotion.paidAmount || 0), 0);
    const newToday = recentListings.filter(l => l.created_at && new Date(l.created_at) >= todayStart).length;

    return { totalListings: totalListings || 0, totalUsers: totalUsers || 0, totalBrands: 0, pendingCount, activeCount, revenueTotal, newToday };
}

export async function getRecentListings(limitN = 10) {
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(limitN);
    return (data || []).map(r => ({ id: r.id, ...r.data, status: r.status, createdAt: { toMillis: () => new Date(r.created_at).getTime() } }));
}

// ── Listings management ───────────────────────────────────────────────────────

export async function getAllListings(filters = {}, limitN = 50, lastDoc = null) {
    const from = typeof lastDoc === 'number' ? lastDoc : 0;
    let q = supabase.from('listings').select('*').order('created_at', { ascending: false }).range(from, from + limitN - 1);
    if (filters.status) q = q.eq('status', filters.status);
    const { data } = await q;
    const docs = (data || []).map(r => ({ id: r.id, _doc: r, ...r.data, status: r.status, createdAt: { toMillis: () => new Date(r.created_at).getTime() } }));
    return { docs, lastDoc: from + docs.length };
}

export async function adminUpdateListingStatus(listingId, status, note = '') {
    const { data: row } = await supabase.from('listings').select('data').eq('id', listingId).single();
    await supabase.from('listings').update({
        status,
        data: { ...(row?.data || {}), moderationNote: note, moderatedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
    }).eq('id', listingId);
}

export async function adminDeleteListing(listingId) {
    await supabase.from('listings').delete().eq('id', listingId);
}

export async function adminSetFeatured(listingId, tier, durationDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    const { data: row } = await supabase.from('listings').select('promotion').eq('id', listingId).single();
    await supabase.from('listings').update({
        promotion: { ...(row?.promotion || {}), tier, activatedAt: new Date().toISOString(), expiresAt: expiresAt.toISOString() },
        updated_at: new Date().toISOString(),
    }).eq('id', listingId);
}

// ── Users management ──────────────────────────────────────────────────────────

export async function getAllUsers(limitN = 100) {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(limitN);
    return (data || []).map(r => ({ id: r.id, uid: r.id, email: r.email, displayName: r.display_name, ...r.prefs }));
}

export async function adminUpdateUserRole(uid, role) {
    const { data } = await supabase.from('profiles').select('prefs').eq('id', uid).single();
    await supabase.from('profiles').update({ prefs: { ...(data?.prefs || {}), role }, updated_at: new Date().toISOString() }).eq('id', uid);
}

export async function adminBanUser(uid, banned = true) {
    const { data } = await supabase.from('profiles').select('prefs').eq('id', uid).single();
    await supabase.from('profiles').update({ prefs: { ...(data?.prefs || {}), status: banned ? 'banned' : 'active', bannedAt: banned ? new Date().toISOString() : null } }).eq('id', uid);
}

export async function getUserListingsCount(uid) {
    try {
        const { count } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('owner_id', uid);
        return count || 0;
    } catch { return 0; }
}

// ── Taxonomy: Brands ──────────────────────────────────────────────────────────

export async function getBrands(categoryFilter = null) {
    let q = supabase.from('brands').select('*');
    if (categoryFilter) q = q.eq('category', categoryFilter);
    const { data } = await q;
    return (data || []).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export async function createBrand(data) {
    const { data: row, error } = await supabase.from('brands').insert({ name: data.name.trim(), slug: data.slug || slugify(data.name), category: data.category || 'avto', logo_url: data.logoUrl || '' }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function updateBrand(id, data) {
    await supabase.from('brands').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteBrand(id) {
    await supabase.from('brands').delete().eq('id', id);
}

// ── Taxonomy: Models ──────────────────────────────────────────────────────────

export async function getModels(brandId = null) {
    let q = supabase.from('models').select('*');
    if (brandId) q = q.eq('brand_id', brandId);
    const { data } = await q;
    return (data || []).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export async function createModel(data) {
    const { data: row, error } = await supabase.from('models').insert({ name: data.name.trim(), slug: data.slug || slugify(data.name), brand_id: data.brandId, brand_name: data.brandName || '', category: data.category || 'avto', subcategory: data.subcategory || '' }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function updateModel(id, data) {
    await supabase.from('models').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteModel(id) {
    await supabase.from('models').delete().eq('id', id);
}

// ── Excel/Bulk import ─────────────────────────────────────────────────────────

const ALLOWED_FUEL_TYPES    = ['Petrol','Diesel','Electric','Hybrid','Plug-in Hybrid','LPG','CNG','Hydrogen','Steam'];
const ALLOWED_ENGINE_TYPES  = ['4-stroke','2-stroke','Electric','Rotary'];
const ALLOWED_ENGINE_CONFIGS = ['Single','Parallel Twin','V-Twin','Triple','Inline-4','Boxer','V4'];
const ALLOWED_MOTO_STROKE     = ['2T','4T','Električni','Wankel'];
const ALLOWED_MOTO_DRIVETRAIN = ['veriga','zobati jermen','jekleni jermen','kardan'];

function validateTrimSpecs(row, rowLabel) {
    const errs = [];
    const specs = {};
    const navCat = (row.category || '').toLowerCase();
    if (navCat === 'plovila') {
        if (row.vrsta) specs.vrsta = String(row.vrsta);
        if (row.kategorija) specs.kategorija = String(row.kategorija);
        return { valid: true, specs, errors: errs };
    }
    if (navCat === 'izvenkrmni') {
        if (row.horsepower_km !== '' && row.horsepower_km != null) {
            const km = parseInt(row.horsepower_km, 10);
            if (isNaN(km) || km < 1 || km > 2000) errs.push(`${rowLabel}: KM "${row.horsepower_km}" mora biti celo število 1–2000 (ali prazno)`);
            else specs.horsepower_km = km;
        }
        return { valid: errs.length === 0, specs, errors: errs };
    }
    if ((row.category || '').toLowerCase() === 'moto') {
        if (row.displacement_cc !== '' && row.displacement_cc != null) {
            const cc = parseInt(row.displacement_cc, 10);
            if (isNaN(cc) || cc < 50 || cc > 3000) errs.push(`${rowLabel}: prostornina "${row.displacement_cc}" mora biti 50–3000`);
            else specs.displacement_cc = cc;
        }
        if (row.stroke) { if (!ALLOWED_MOTO_STROKE.includes(row.stroke)) errs.push(`${rowLabel}: takt "${row.stroke}" ni veljaven`); else specs.stroke = row.stroke; }
        if (row.drivetrain) { if (!ALLOWED_MOTO_DRIVETRAIN.includes(row.drivetrain)) errs.push(`${rowLabel}: prenos "${row.drivetrain}" ni veljaven`); else specs.drivetrain = row.drivetrain; }
        if (row.engine_type) specs.engine_type = String(row.engine_type);
        if (row.engine_code) specs.engine_code = String(row.engine_code);
        if (row.cylinders) specs.cylinders = String(row.cylinders);
        if (row.cylinder_layout) specs.cylinder_layout = String(row.cylinder_layout);
        if (row.sub_type) specs.sub_type = String(row.sub_type);
        return { valid: errs.length === 0, specs, errors: errs };
    }
    if (row.engine_capacity_cc !== '' && row.engine_capacity_cc != null) {
        const cc = parseInt(row.engine_capacity_cc, 10);
        if (isNaN(cc) || cc < 50 || cc > 10000) errs.push(`${rowLabel}: engine_capacity_cc must be 50–10000`);
        else specs.engine_capacity_cc = cc;
    }
    if (row.fuel_type) { if (!ALLOWED_FUEL_TYPES.includes(row.fuel_type)) errs.push(`${rowLabel}: fuel_type "${row.fuel_type}" not allowed`); else specs.fuel_type = row.fuel_type; }
    const parseC = (val, label) => { if (val === '' || val == null) return null; const f = parseFloat(val); if (isNaN(f) || f < 0.1 || f > 99.9) { errs.push(`${rowLabel}: ${label} must be 0.1–99.9`); return undefined; } return f; };
    ['fuel_consumption_city','fuel_consumption_highway','fuel_consumption_combined','fuel_consumption'].forEach(k => { const v = parseC(row[k], k); if (v !== undefined && v !== null) specs[k] = v; });
    if (row.electric_range_km !== '' && row.electric_range_km != null) { const r = parseInt(row.electric_range_km, 10); if (isNaN(r) || r < 1 || r > 2000) errs.push(`${rowLabel}: electric_range_km must be 1–2000`); else specs.electric_range_km = r; }
    if (row.engine_type) { if (!ALLOWED_ENGINE_TYPES.includes(row.engine_type)) errs.push(`${rowLabel}: engine_type not allowed`); else specs.engine_type = row.engine_type; }
    if (row.engine_configuration) { if (!ALLOWED_ENGINE_CONFIGS.includes(row.engine_configuration)) errs.push(`${rowLabel}: engine_configuration not allowed`); else specs.engine_configuration = row.engine_configuration; }
    if (row.capacity) { if (String(row.capacity).length > 20) errs.push(`${rowLabel}: capacity exceeds 20 chars`); else specs.capacity = String(row.capacity); }
    return { valid: errs.length === 0, specs, errors: errs };
}

export async function importTaxonomyRows(rows, adminUid, adminName) {
    const report = { imported: 0, skipped: 0, errors: [] };
    const existingBrands = await getBrands();
    const existingModels = await getModels();
    const brandMap = new Map(existingBrands.map(b => [normalize(b.name + '|' + b.category), b]));
    const modelMap = new Map(existingModels.map(m => [normalize(m.name + '|' + (m.brand_id || m.brandId)), m]));

    for (const row of rows) {
        try {
            const cat = (row.category || 'avto').trim().toLowerCase();
            const brandName = (row.brand || '').trim();
            const modelName = (row.model || '').trim();
            if (!brandName) { report.errors.push(`Vrstica brez znamke: ${JSON.stringify(row)}`); continue; }

            const brandKey = normalize(brandName + '|' + cat);
            let brand = brandMap.get(brandKey);
            if (!brand) {
                const id = await createBrand({ name: brandName, category: cat });
                brand = { id, name: brandName, category: cat };
                brandMap.set(brandKey, brand);
                report.imported++;
            }

            if (modelName) {
                const modelKey = normalize(modelName + '|' + brand.id);
                if (!modelMap.has(modelKey)) {
                    const id = await createModel({ name: modelName, brandId: brand.id, brandName, category: cat });
                    modelMap.set(modelKey, { id });
                    report.imported++;
                }
            }

            if (modelName && row.variant) {
                const trimName = String(row.variant).trim();
                if (trimName) {
                    const rowLabel = `${brandName} / ${modelName} / ${trimName}`;
                    const { valid, specs, errors: specErrors } = validateTrimSpecs(row, rowLabel);
                    specErrors.forEach(e => report.errors.push(e));
                    if (valid || Object.keys(specs).length === 0) {
                        const variantObj = { trim: trimName, brand: brandName, model: modelName, category: cat, ...specs };
                        const { data: existing } = await supabase.from('taxonomy_import_log').select('id, specs').eq('category', cat).eq('brand', brandName).eq('model', modelName).eq('trim', trimName).maybeSingle();
                        if (existing) {
                            const merged = { ...existing.specs, ...variantObj };
                            if (JSON.stringify(existing.specs) !== JSON.stringify(merged)) {
                                await supabase.from('taxonomy_import_log').update({ specs: merged, updated_at: new Date().toISOString(), updated_by: adminUid }).eq('id', existing.id);
                                report.imported++;
                            } else { report.skipped++; }
                        } else {
                            await supabase.from('taxonomy_import_log').insert({ ...variantObj, specs: variantObj, imported_by: adminUid });
                            report.imported++;
                        }
                    }
                }
            }
        } catch (e) { report.errors.push(`Napaka: ${e.message}`); }
    }
    await addAuditLog(adminUid, adminName, 'TAXONOMY_IMPORT', 'taxonomy', { imported: report.imported, skipped: report.skipped, errors: report.errors.length });
    return report;
}

export async function clearCarTaxonomy(adminUid, adminName) {
    await Promise.all([
        supabase.from('brands').delete().eq('category', 'avto'),
        supabase.from('models').delete().eq('category', 'avto'),
        supabase.from('taxonomy_import_log').delete().eq('category', 'avto'),
    ]);
    await addAuditLog(adminUid, adminName, 'TAXONOMY_CLEAR', 'taxonomy', { category: 'avto' });
}

// ── Reports / Moderation ──────────────────────────────────────────────────────

export async function getReports(status = null) {
    let q = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100);
    if (status) q = q.eq('status', status);
    const { data } = await q;
    return data || [];
}

export async function resolveReport(reportId, action, adminNote = '') {
    await supabase.from('reports').update({ status: action === 'dismiss' ? 'dismissed' : 'resolved', resolved_at: new Date().toISOString(), admin_note: adminNote }).eq('id', reportId);
}

// ── Site settings ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = { packages: { free: { name: 'Brezplačni', price: 0, maxListings: 3, durationDays: 30 }, premium: { name: 'Premium', price: 9.99, maxListings: 20, durationDays: 60 }, dealer: { name: 'Dealer', price: 49.99, maxListings: 999, durationDays: 365 } }, maxImagesPerListing: 20, listingAutoExpireDays: 90, featuredPricePerDay: 2.99, maintenanceMode: false, allowGuestListings: false };

export async function getSiteSettings() {
    const { data } = await supabase.from('site_config').select('*').eq('id', 'main').maybeSingle();
    return data?.settings || DEFAULT_SETTINGS;
}

export async function updateSiteSettings(settings) {
    await supabase.from('site_config').upsert({ id: 'main', settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });
}

// ── SEO Management ────────────────────────────────────────────────────────────

export async function getSeoPages(limitN = 100) {
    const { data } = await supabase.from('seo_pages').select('*').order('slug').limit(limitN);
    return data || [];
}

export async function upsertSeoPage(slug, pageData) {
    await supabase.from('seo_pages').upsert({ slug, ...pageData, updated_at: new Date().toISOString() }, { onConflict: 'slug' });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getTopBrands(limitN = 10) {
    const { data } = await supabase.from('listings').select('brand').eq('status', 'active').limit(500);
    const counts = {};
    (data || []).forEach(r => { const b = r.brand || 'Neznano'; counts[b] = (counts[b] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limitN).map(([name, count]) => ({ name, count }));
}

export async function getListingsByDay(days = 14) {
    const since = new Date(); since.setDate(since.getDate() - days);
    const { data } = await supabase.from('listings').select('created_at').gte('created_at', since.toISOString()).order('created_at', { ascending: false }).limit(500);
    const byDay = {};
    (data || []).forEach(r => { const key = r.created_at.slice(0, 10); byDay[key] = (byDay[key] || 0) + 1; });
    const result = [];
    for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); result.push({ date: key, count: byDay[key] || 0 }); }
    return result;
}

export async function getSearchAnalytics(limitN = 20) {
    const { data } = await supabase.from('search_logs').select('*').order('count', { ascending: false }).limit(limitN);
    return data || [];
}

// ── Webscraping: approved sources ─────────────────────────────────────────────

function canonicalDomain(input) {
    let s = String(input || '').trim().toLowerCase();
    s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0].split('#')[0];
    return s;
}

export async function getScrapingSources() {
    const { data } = await supabase.from('scraping_sources').select('*');
    return (data || []).sort((a, b) => (a.domain || '').localeCompare(b.domain || ''));
}

export async function createScrapingSource(data) {
    const { data: row, error } = await supabase.from('scraping_sources').insert({ domain: canonicalDomain(data.domain), name: (data.name || '').trim(), base_url: (data.baseUrl || '').trim(), category: data.category || 'oboje', approved: !!data.approved, permission_note: (data.permissionNote || '').trim(), robots_allowed: data.robotsAllowed !== false, status: data.status || 'active' }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function updateScrapingSource(id, data) {
    const updates = { ...data, updated_at: new Date().toISOString() };
    if (data.domain) updates.domain = canonicalDomain(data.domain);
    await supabase.from('scraping_sources').update(updates).eq('id', id);
}

export async function deleteScrapingSource(id) {
    await supabase.from('scraping_sources').delete().eq('id', id);
}

export async function getApprovedScrapingDomains() {
    const { data } = await supabase.from('scraping_sources').select('domain').eq('approved', true);
    return (data || []).map(r => r.domain).filter(Boolean);
}

// ── Price-comparison catalog ───────────────────────────────────────────────────

function computeOfferStats(offers = []) {
    const prices = offers.map(o => Number(o.price)).filter(n => !isNaN(n));
    return { lowestPrice: prices.length ? Math.min(...prices) : null, offerCount: offers.length };
}

export async function getCatalogProductsAdmin() {
    const { data } = await supabase.from('parts_catalog').select('*').order('updated_at', { ascending: false });
    return data || [];
}

export async function createCatalogProduct(data) {
    const offers = Array.isArray(data.offers) ? data.offers : [];
    const stats = computeOfferStats(offers);
    const { data: row, error } = await supabase.from('parts_catalog').insert({ item_type: data.itemType || 'part', vehicle_category: data.vehicleCategory || 'avto', title: (data.title || '').trim(), brand: (data.brand || '').trim(), image_url: data.imageUrl || '', attributes: data.attributes || {}, offers, ...stats, status: data.status || 'active', ingest_source: 'manual' }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function updateCatalogProduct(id, data) {
    const updates = { ...data, updated_at: new Date().toISOString() };
    if (Array.isArray(data.offers)) Object.assign(updates, computeOfferStats(data.offers));
    await supabase.from('parts_catalog').update(updates).eq('id', id);
}

export async function deleteCatalogProduct(id) {
    await supabase.from('parts_catalog').delete().eq('id', id);
}

// ── Taxonomy Proposals ────────────────────────────────────────────────────────

export async function submitTaxonomyProposal({ type, brand, model = null, category = null, value, submittedBy }) {
    const trimmed = value.trim();
    if (!trimmed || !brand) throw new Error('Manjka vrednost ali znamka.');
    const { data, error } = await supabase.from('taxonomy_proposals').insert({ author_id: submittedBy || null, status: 'pending', payload: { type, brand, model, category, value: trimmed } }).select('id').single();
    if (error) throw new Error(error.message);
    return data.id;
}

export async function getTaxonomyProposals({ status = null, type = null } = {}) {
    let q = supabase.from('taxonomy_proposals').select('*').order('created_at', { ascending: false }).limit(200);
    if (status) q = q.eq('status', status);
    const { data } = await q;
    return (data || []).map(r => ({ id: r.id, status: r.status, createdAt: r.created_at, ...r.payload }));
}

export async function approveTaxonomyProposal(id, editedValue = null) {
    const updates = { status: 'approved' };
    if (editedValue) {
        const { data } = await supabase.from('taxonomy_proposals').select('payload').eq('id', id).single();
        updates.payload = { ...(data?.payload || {}), value: editedValue.trim() };
    }
    await supabase.from('taxonomy_proposals').update(updates).eq('id', id);
}

export async function rejectTaxonomyProposal(id) {
    await supabase.from('taxonomy_proposals').update({ status: 'rejected' }).eq('id', id);
}

export async function getApprovedProposalsForBrand(brand) {
    if (!brand) return [];
    const { data } = await supabase.from('taxonomy_proposals').select('*').eq('status', 'approved').contains('payload', { brand });
    return (data || []).map(r => ({ id: r.id, ...r.payload }));
}

// ── Auctions ──────────────────────────────────────────────────────────────────

export async function getAdminAuctions() {
    const { data } = await supabase.from('auctions').select('*').order('created_at', { ascending: false }).limit(200);
    return data || [];
}

export async function getAdminAuctionBids(listingId) {
    const { data } = await supabase.from('bids').select('*').eq('auction_id', listingId).order('created_at', { ascending: false });
    return data || [];
}

export async function adminSetAuctionStatus(listingId, status) {
    await supabase.from('auctions').update({ status, updated_at: new Date().toISOString() }).eq('id', listingId);
}

export async function getAuctionAlertsAdmin() {
    const { data } = await supabase.from('auction_alerts').select('*').order('created_at', { ascending: false }).limit(500);
    return data || [];
}

export async function adminForceCloseAuction(listingId) {
    const { data } = await supabase.from('auctions').select('*').eq('id', listingId).single();
    if (!data) throw new Error('Dražba ne obstaja.');
    await supabase.from('auctions').update({
        status: 'ended',
        winner_id: data.current_bidder || null,
        data: { ...(data.data || {}), endedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
    }).eq('id', listingId);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalize(str) { return str.toLowerCase().trim(); }
