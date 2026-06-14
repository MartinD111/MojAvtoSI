// Explicit ownership / IDOR guard (#2). RLS is the primary defense, but every
// mutating route ALSO verifies in code that the caller's JWT id matches the
// record's owner column before acting — defense in depth, and it lets us return
// a clean 403/404 instead of relying on an RLS no-op.
import { supabaseAdmin } from './supabase.js';

/**
 * Throws 404 if the row doesn't exist, 403 if it isn't owned by `userId`.
 * Returns the row on success.
 */
export async function assertOwner(
  table: string,
  id: string,
  userId: string,
  ownerColumn = 'owner_id',
): Promise<Record<string, unknown>> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw Object.assign(new Error('Lookup failed'), { statusCode: 500 });
  if (!data) throw Object.assign(new Error('Ni najdeno'), { statusCode: 404 });
  if (data[ownerColumn] !== userId) {
    throw Object.assign(new Error('Dostop zavrnjen'), { statusCode: 403 });
  }
  return data;
}
