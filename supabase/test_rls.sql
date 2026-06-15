-- ═══════════════════════════════════════════════════════════════════════════
-- RLS regression test — run AFTER schema.sql + policies.sql + security.sql.
-- Idempotent and READ-ONLY: it asserts that Row Level Security is still enabled
-- and that every table has at least one policy. If a future migration
-- accidentally drops RLS or a policy, this RAISES and fails the deploy — it can
-- never itself drop anything.
--
--   supabase db execute --file supabase/test_rls.sql      # exits non-zero on failure
-- Run it as the last step of every migration in CI.
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare
  r record;
  missing_rls text[] := '{}';
  missing_pol text[] := '{}';
  -- Every table that MUST be RLS-protected. Add new tables here so a forgotten
  -- `enable row level security` is caught.
  required text[] := array[
    'profiles','businesses','listings','auctions','bids','inventory','leads',
    'bookings','tire_storage','tire_orders','reviews','reports',
    'taxonomy_proposals','wallets','wallet_ledger','b2b_api_keys'
  ];
  tname text;
begin
  foreach tname in array required loop
    -- 1) RLS enabled?
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = tname and c.relrowsecurity
    ) then
      missing_rls := missing_rls || tname;
    end if;
    -- 2) at least one policy?
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = tname
    ) then
      missing_pol := missing_pol || tname;
    end if;
  end loop;

  -- 3) the audit log must remain append-only (no UPDATE/DELETE policy).
  if exists (
    select 1 from pg_policies
    where schemaname = 'private' and tablename = 'audit_log'
      and cmd in ('UPDATE','DELETE')
  ) then
    raise exception 'SECURITY REGRESSION: private.audit_log has an UPDATE/DELETE policy (must be append-only)';
  end if;

  if array_length(missing_rls, 1) is not null then
    raise exception 'SECURITY REGRESSION: RLS disabled on: %', array_to_string(missing_rls, ', ');
  end if;
  if array_length(missing_pol, 1) is not null then
    raise exception 'SECURITY REGRESSION: no policies on: %', array_to_string(missing_pol, ', ');
  end if;

  raise notice 'RLS test passed: % tables protected with policies.', array_length(required, 1);
end $$;
