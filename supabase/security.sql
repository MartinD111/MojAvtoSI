-- ═══════════════════════════════════════════════════════════════════════════
-- Security hardening — run AFTER schema.sql and policies.sql.
-- Covers: concurrency-safe bidding (#12), append-only audit log (#16),
-- a non-exposed `private` schema (#14), and introspection lockdown notes.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── (#14) private schema — NOT exposed via the PostgREST API ──────────────────
-- Move sensitive/system tables here. Supabase only exposes schemas listed in
-- Dashboard → API → "Exposed schemas" (keep that = `public` only). Tables in
-- `private` are unreachable from the anon/authenticated REST surface; the server
-- reaches them with the service-role key.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

-- ── (#16) append-only audit trail ────────────────────────────────────────────
create table if not exists private.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  action      text not null,          -- 'listing.delete', 'business.verify', ...
  target_type text,
  target_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table private.audit_log enable row level security;

-- INSERT-only by design: there is NO update/delete policy and we revoke those
-- privileges outright, so the history can't be rewritten or erased — not even by
-- a compromised app role. The service role (server) bypasses RLS to read it.
revoke update, delete, truncate on private.audit_log from anon, authenticated;
-- (No CREATE POLICY for update/delete ⇒ those operations are denied under RLS.)

-- ── (#12) concurrency-safe bid placement ─────────────────────────────────────
-- Locks the auction row FOR UPDATE so two simultaneous bids can't both read the
-- same current_bid and race past each other (lost-update / double-spend).
create or replace function public.place_bid(p_auction uuid, p_amount numeric)
  returns public.auctions
  language plpgsql security definer set search_path = public, pg_temp as $$
declare
  a public.auctions;
begin
  -- Row lock: serializes concurrent bids on this auction.
  select * into a from public.auctions where id = p_auction for update;

  if not found then raise exception 'Dražba ne obstaja' using errcode = 'P0002'; end if;
  if a.status <> 'open' then raise exception 'Dražba je zaprta'; end if;
  if a.ends_at <= now() then raise exception 'Dražba se je iztekla'; end if;
  if a.seller_id = auth.uid() then raise exception 'Prodajalec ne more ponujati'; end if;
  if p_amount <= a.current_bid then raise exception 'Ponudba je prenizka'; end if;

  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction, auth.uid(), p_amount);

  update public.auctions
     set current_bid = p_amount, current_bidder = auth.uid(), updated_at = now()
   where id = p_auction
  returning * into a;

  return a;
end;
$$;

-- Callable only by signed-in users (RLS still governs direct table access).
revoke all on function public.place_bid(uuid, numeric) from public, anon;
grant execute on function public.place_bid(uuid, numeric) to authenticated;

-- ── Least-privilege defaults for future objects in public ────────────────────
-- New tables shouldn't silently become world-accessible; grant deliberately.
alter default privileges in schema public revoke all on tables from anon;

-- ── (#14) Introspection lockdown — apply in the DASHBOARD / config ───────────
-- Hosted Supabase (managed PostgREST): these are settings, not SQL —
--   • Dashboard → API → Exposed schemas: leave as `public` only (never `private`).
--   • Disable the auto OpenAPI/root spec so the schema isn't enumerable
--     (self-hosted: set PGRST_OPENAPI_MODE=disabled; managed: keep keys secret +
--     rely on Cloudflare to block OPTIONS/`/` probes — see infra/cloudflare-notes.md).
--   • Never expose the `postgres`/service role to the browser.
