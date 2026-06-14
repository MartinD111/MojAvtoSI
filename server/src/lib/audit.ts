// Append-only audit trail (#16). Writes admin actions and deletions to
// private.audit_log via the service-role client. The table is INSERT-only at the
// DB level (see supabase/security.sql) — even a compromised app role cannot
// rewrite history; only the service role reads it.
import { supabaseAdmin } from './supabase.js';

export async function audit(entry: {
  actorId: string | null;
  action: string; // e.g. 'listing.delete', 'business.verify'
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.schema('private').from('audit_log').insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch {
    // Auditing must never break the request path; failures surface via Sentry
    // through the caller's normal error handling if they choose to await.
  }
}
