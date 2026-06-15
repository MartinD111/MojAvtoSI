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

-- ── Ad budget / credit wallet — atomic debit (race-safe) ─────────────────────
-- Prevents credit-exhaustion races: two simultaneous "promote" requests can't
-- both read the same balance and overspend. The debit locks the wallet row.
create table if not exists public.wallets (
  owner_id   uuid primary key references public.profiles(id) on delete cascade,
  balance    numeric(12,2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
alter table public.wallets enable row level security;
create policy wallets_owner_read on public.wallets for select
  using (auth.uid() = owner_id or public.is_admin());
-- No client write policy: balances change ONLY through debit/credit functions
-- (service role) — never a direct client UPDATE.

create table if not exists public.wallet_ledger (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  delta      numeric(12,2) not null,
  reason     text not null,
  ref        text,
  created_at timestamptz not null default now()
);
alter table public.wallet_ledger enable row level security;
create policy ledger_owner_read on public.wallet_ledger for select
  using (auth.uid() = owner_id or public.is_admin());

-- Atomically debit a wallet. Raises if insufficient funds. SECURITY DEFINER so
-- it can write the wallet the client cannot touch directly; pinned search_path.
create or replace function public.debit_wallet(p_owner uuid, p_amount numeric, p_reason text, p_ref text)
  returns numeric
  language plpgsql security definer set search_path = public, pg_temp as $$
declare
  w public.wallets;
begin
  if p_amount <= 0 then raise exception 'Znesek mora biti pozitiven'; end if;
  select * into w from public.wallets where owner_id = p_owner for update; -- row lock
  if not found then raise exception 'Denarnica ne obstaja'; end if;
  if w.balance < p_amount then raise exception 'Nezadostno stanje' using errcode = 'P0001'; end if;

  update public.wallets set balance = balance - p_amount, updated_at = now() where owner_id = p_owner;
  insert into public.wallet_ledger(owner_id, delta, reason, ref) values (p_owner, -p_amount, p_reason, p_ref);
  return w.balance - p_amount;
end;
$$;
revoke all on function public.debit_wallet(uuid, numeric, text, text) from public, anon, authenticated;
-- (Server calls this with the service role only.)

-- ── B2B API keys (hashed, never plaintext) + static-IP allow-list ─────────────
create table if not exists public.b2b_api_keys (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  key_hash    text not null unique,        -- SHA-256 hex of the raw key
  last4       text not null,
  ip_allowlist text[],                      -- null/empty = no restriction
  revoked     boolean not null default false,
  created_at  timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.b2b_api_keys enable row level security;
-- Owner can see metadata (never the hash is useful anyway); writes via server only.
create policy b2b_keys_owner_read on public.b2b_api_keys for select
  using (auth.uid() = owner_id or public.is_admin());
create index if not exists idx_b2b_keys_hash on public.b2b_api_keys(key_hash) where revoked = false;

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
