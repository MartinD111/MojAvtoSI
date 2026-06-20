// b2bService.js — B2B operations (Supabase)
// All writes enforce provider_id == authenticated user's id.

import { supabase } from '../lib/supabase.js';
import { uploadImage } from '../lib/uploads.js';

// ── Guard helper ──────────────────────────────────────────────────────────────

async function requireProvider() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in required.');
    return user.id;
}

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS / PROFILE
// ════════════════════════════════════════════════════════════════════════════

export async function getMyBusiness() {
    const uid = await requireProvider();
    const { data } = await supabase.from('businesses').select('*').eq('id', uid).maybeSingle();
    return data ? { ...data } : null;
}

export async function saveMyBusiness(data) {
    const uid = await requireProvider();
    await supabase.from('businesses').upsert({ id: uid, provider_id: uid, ...data, updated_at: new Date().toISOString() }, { onConflict: 'id' });
}

export async function uploadBusinessAsset(file, kind /* 'logo'|'cover'|'gallery' */) {
    const uid = await requireProvider();
    return await uploadImage(file, { scope: kind === 'gallery' ? 'business-gallery' : 'business', ownerId: uid, kind });
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICES / PRICING — flat table with provider_id
// ════════════════════════════════════════════════════════════════════════════

export async function listServices() {
    const uid = await requireProvider();
    const { data } = await supabase.from('services').select('*').eq('provider_id', uid);
    return data || [];
}

export async function saveService(data) {
    const uid = await requireProvider();
    const payload = { ...data, provider_id: uid, updated_at: new Date().toISOString() };
    delete payload.id;

    if (data.id) {
        await supabase.from('services').update(payload).eq('id', data.id).eq('provider_id', uid);
        return data.id;
    }
    const { data: row, error } = await supabase.from('services').insert({ ...payload, created_at: new Date().toISOString() }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function deleteService(id) {
    const uid = await requireProvider();
    await supabase.from('services').delete().eq('id', id).eq('provider_id', uid);
}

// ════════════════════════════════════════════════════════════════════════════
// BOOKINGS — provider_id filter
// ════════════════════════════════════════════════════════════════════════════

export async function listMyBookings(filters = {}) {
    const uid = await requireProvider();
    let q = supabase.from('bookings').select('*').eq('provider_id', uid);
    if (filters.status) q = q.eq('status', filters.status);
    const { data } = await q;
    return (data || []).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function updateBookingStatus(id, status) {
    const uid = await requireProvider();
    const { data: row } = await supabase.from('bookings').select('provider_id').eq('id', id).single();
    if (!row || row.provider_id !== uid) throw new Error('Access denied.');
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function blockSlot(date, time, reason) {
    const uid = await requireProvider();
    await supabase.from('bookings').insert({ provider_id: uid, date, time, status: 'blocked', notes: reason || 'Blocked slot', created_at: new Date().toISOString() });
}

// ════════════════════════════════════════════════════════════════════════════
// INVENTORY — dealer
// ════════════════════════════════════════════════════════════════════════════

export async function listInventory(statusFilter) {
    const uid = await requireProvider();
    let q = supabase.from('inventory').select('*').eq('provider_id', uid);
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    return data || [];
}

export async function saveInventoryItem(data) {
    const uid = await requireProvider();
    const payload = { ...data, provider_id: uid, updated_at: new Date().toISOString() };
    delete payload.id;

    if (data.id) {
        const { data: existing } = await supabase.from('inventory').select('provider_id').eq('id', data.id).single();
        if (existing && existing.provider_id !== uid) throw new Error('Access denied.');
        await supabase.from('inventory').update(payload).eq('id', data.id);
        return data.id;
    }
    const { data: row, error } = await supabase.from('inventory').insert({ ...payload, status: data.status || 'draft', created_at: new Date().toISOString() }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function deleteInventoryItem(id) {
    const uid = await requireProvider();
    const { data: existing } = await supabase.from('inventory').select('provider_id').eq('id', id).single();
    if (existing && existing.provider_id !== uid) throw new Error('Access denied.');
    await supabase.from('inventory').delete().eq('id', id);
}

// ════════════════════════════════════════════════════════════════════════════
// LEADS — dealer CRM
// ════════════════════════════════════════════════════════════════════════════

export async function listLeads(statusFilter) {
    const uid = await requireProvider();
    let q = supabase.from('leads').select('*').eq('provider_id', uid).order('created_at', { ascending: false });
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    return data || [];
}

export async function updateLead(id, data) {
    const uid = await requireProvider();
    const { data: existing } = await supabase.from('leads').select('provider_id').eq('id', id).single();
    if (existing && existing.provider_id !== uid) throw new Error('Access denied.');
    await supabase.from('leads').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
}

// ════════════════════════════════════════════════════════════════════════════
// TIRE STORAGE — "hotel za gume"
// ════════════════════════════════════════════════════════════════════════════

export async function listTireStorage(statusFilter) {
    const uid = await requireProvider();
    let q = supabase.from('tire_storage').select('*').eq('provider_id', uid);
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    return data || [];
}

export async function saveTireStorage(data) {
    const uid = await requireProvider();
    const payload = { ...data, provider_id: uid, updated_at: new Date().toISOString() };
    delete payload.id;

    if (data.id) {
        const { data: existing } = await supabase.from('tire_storage').select('provider_id').eq('id', data.id).single();
        if (existing && existing.provider_id !== uid) throw new Error('Access denied.');
        await supabase.from('tire_storage').update(payload).eq('id', data.id);
        return data.id;
    }
    const { data: row, error } = await supabase.from('tire_storage').insert({ ...payload, status: data.status || 'stored', created_at: new Date().toISOString() }).select('id').single();
    if (error) throw new Error(error.message);
    return row.id;
}

export async function deleteTireStorageItem(id) {
    const uid = await requireProvider();
    const { data: existing } = await supabase.from('tire_storage').select('provider_id').eq('id', id).single();
    if (existing && existing.provider_id !== uid) throw new Error('Access denied.');
    await supabase.from('tire_storage').delete().eq('id', id);
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ════════════════════════════════════════════════════════════════════════════

export async function getDashboardStats() {
    const uid = await requireProvider();
    const [bookingsRes, servicesRes, inventoryRes, leadsRes] = await Promise.allSettled([
        supabase.from('bookings').select('status, total_price').eq('provider_id', uid),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('provider_id', uid),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('provider_id', uid),
        supabase.from('leads').select('status').eq('provider_id', uid),
    ]);

    const bookingsArr = bookingsRes.status === 'fulfilled' ? (bookingsRes.value.data || []) : [];
    const servicesCount = servicesRes.status === 'fulfilled' ? (servicesRes.value.count || 0) : 0;
    const inventoryCount = inventoryRes.status === 'fulfilled' ? (inventoryRes.value.count || 0) : 0;
    const leadsArr = leadsRes.status === 'fulfilled' ? (leadsRes.value.data || []) : [];

    return {
        bookings: {
            total: bookingsArr.length,
            pending: bookingsArr.filter(b => b.status === 'pending').length,
            confirmed: bookingsArr.filter(b => b.status === 'confirmed').length,
            completed: bookingsArr.filter(b => b.status === 'completed').length,
            revenue: bookingsArr.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
        },
        services: servicesCount,
        inventory: inventoryCount,
        leads: { total: leadsArr.length, new: leadsArr.filter(l => l.status === 'new').length },
    };
}

// ════════════════════════════════════════════════════════════════════════════
// TIRE ORDERS
// Flow: buyer submits → vulkanizer confirms → buyer books appointment
// ════════════════════════════════════════════════════════════════════════════

function addBusinessDays(startDate, days) {
    const d = new Date(startDate);
    let added = 0;
    while (added < days) {
        d.setDate(d.getDate() + 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) added++;
    }
    return d;
}

export async function submitTireOrder(tireData, vulcanizerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in required.');

    const estimatedDeliveryDate = addBusinessDays(new Date(), 3).toISOString().slice(0, 10);

    const { data: row, error } = await supabase.from('tire_orders').insert({
        vulcanizer_id: vulcanizerId,
        buyer_id: user.id,
        tire_data: {
            brand: tireData.tireBrand,
            model: tireData.tireModel,
            dimension: tireData.tireDim,
            quantity: tireData.quantity,
        },
        status: 'pending_confirmation',
        estimated_delivery_date: estimatedDeliveryDate,
        price_snapshot: tireData.price || null,
        current_price: tireData.price || null,
        booking_url: null,
        created_at: new Date().toISOString(),
    }).select('id').single();
    if (error) throw new Error(error.message);

    console.info(`[TireOrder] New order ${row.id} for tire shop ${vulcanizerId}.`);
    return { id: row.id, estimatedDeliveryDate };
}

export async function getTireOrder(tireOrderId) {
    const { data } = await supabase.from('tire_orders').select('*').eq('id', tireOrderId).maybeSingle();
    return data || null;
}

export async function listPendingTireOrders() {
    const uid = await requireProvider();
    const { data } = await supabase.from('tire_orders').select('*').eq('vulcanizer_id', uid).eq('status', 'pending_confirmation').order('created_at', { ascending: false });
    return data || [];
}

export async function confirmTireOrderReceival(tireOrderId) {
    const uid = await requireProvider();
    const { data: order } = await supabase.from('tire_orders').select('*').eq('id', tireOrderId).single();
    if (!order || order.vulcanizer_id !== uid) throw new Error('Access denied.');

    const bookingUrl = `${window.location.origin}/#/booking?businessId=${uid}&tireOrderId=${tireOrderId}`;
    await supabase.from('tire_orders').update({ status: 'confirmed', confirmed_at: new Date().toISOString(), booking_url: bookingUrl }).eq('id', tireOrderId);

    console.info(`[TireOrder] Order ${tireOrderId} confirmed. Booking URL: ${bookingUrl}`);
    return { bookingUrl };
}

export async function checkAndHandlePriceChange(tireOrderId, newPrice) {
    const uid = await requireProvider();
    const { data: order } = await supabase.from('tire_orders').select('*').eq('id', tireOrderId).single();
    if (!order || order.vulcanizer_id !== uid) throw new Error('Access denied.');

    if (order.price_snapshot !== newPrice) {
        await supabase.from('tire_orders').update({ status: 'price_changed', current_price: newPrice, updated_at: new Date().toISOString() }).eq('id', tireOrderId);
        console.info(`[TireOrder] Price changed for ${tireOrderId}: ${order.price_snapshot} → ${newPrice}`);
    }
}

export async function markTireOrderOrdered(tireOrderId) {
    await supabase.from('tire_orders').update({ status: 'ordered', ordered_at: new Date().toISOString() }).eq('id', tireOrderId);
}
