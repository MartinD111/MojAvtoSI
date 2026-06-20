// Digital Service Book — Supabase data layer
// Requires a `service_records` table: id, vin, mechanic_id, data (jsonb), created_at

import { supabase } from '../lib/supabase.js';

export async function addServiceRecord(recordData) {
    const { vin, date, mileage, serviceType, description, mechanicId, mechanicName } = recordData;
    if (!vin) throw new Error('VIN je obvezen.');

    const { data, error } = await supabase.from('service_records').insert({
        vin: vin.trim().toUpperCase(),
        mechanic_id: mechanicId || null,
        data: {
            date: date || null,
            mileage: mileage ? Number(mileage) : null,
            serviceType: serviceType || 'drugo',
            description: description || '',
            mechanicName: mechanicName || '',
        },
    }).select('id').single();
    if (error) throw new Error(error.message);
    return data;
}

export async function getServiceHistoryByVin(vin) {
    if (!vin) return [];
    try {
        const { data, error } = await supabase
            .from('service_records')
            .select('*')
            .eq('vin', vin.trim().toUpperCase())
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(r => ({
            id: r.id,
            vin: r.vin,
            mechanicId: r.mechanic_id,
            createdAt: r.created_at,
            ...r.data,
        }));
    } catch (err) {
        console.error('[ServiceBook] getServiceHistoryByVin:', err);
        return [];
    }
}
