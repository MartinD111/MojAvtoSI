-- ═══════════════════════════════════════════════════════════════════════════
-- AutoHub auctions — schema extension
-- Run AFTER schema.sql. Idempotent (ADD COLUMN / CREATE TABLE IF NOT EXISTS).
--
-- Adds the AutoHub commercial model to public.auctions and introduces
-- public.auction_payments, the single source of truth for the escrow flow:
-- the buyer pays (price + 3 % premium) into the platform balance, which is held
-- and auto-released to the seller 48 h later UNLESS a dispute is opened. The
-- platform never arbitrates — see docs/AUCTIONS_HANDOFF.md §"izvzetje iz sporov".
-- ═══════════════════════════════════════════════════════════════════════════

-- ── auctions: AutoHub fields ─────────────────────────────────────────────────
-- NOTE on status: schema.sql seeds status default 'open'. The AutoHub backend
-- uses the lifecycle 'active' → 'ended' (with 'paused'/'cancelled'). Treat
-- 'open' as 'active' for legacy rows; the close job writes 'ended'.
alter table public.auctions
  add column if not exists auction_type        text    not null default 'live',   -- 'silent' | 'prebid' | 'live'
  add column if not exists current_phase       text,                               -- 'prebid' | 'live' | null
  add column if not exists reserve_price        numeric(12,2),                      -- silent-only, hidden
  add column if not exists binding_contract     boolean not null default false,     -- 49.99 € "Obvezna prodaja"
  add column if not exists cash_allowed         boolean not null default false,     -- gotovinsko plačilo ob prevzemu
  add column if not exists signature_required   boolean not null default false,     -- binding || cash
  add column if not exists buyer_premium_percent numeric(5,2) not null default 3,   -- 3 %
  add column if not exists listing_fee          numeric(12,2) not null default 0,   -- 0 | 4.99 | 49.99 | 54.98
  add column if not exists listing_fee_paid     boolean not null default false,
  add column if not exists duration_days        int     not null default 7,         -- 7 | 10
  add column if not exists prebid_ends_at       timestamptz,                        -- when pre-bid flips to live
  add column if not exists anti_snip_extensions int     not null default 0,
  -- settlement (filled at close + on the buyer's payment)
  add column if not exists sold                 boolean,
  add column if not exists final_price          numeric(12,2),
  add column if not exists buyer_premium        numeric(12,2),
  add column if not exists payment_intent_id    text,
  add column if not exists escrow_release_at    timestamptz,
  add column if not exists escrow_released       boolean not null default false,
  add column if not exists dispute_opened_at     timestamptz,
  add column if not exists ended_at              timestamptz;

-- Faceted browse: filter the board by type/binding/cash quickly.
create index if not exists idx_auctions_facets on public.auctions(platform, status, auction_type);
-- Escrow sweep: find payments due for release.
create index if not exists idx_auctions_escrow on public.auctions(escrow_released, escrow_release_at)
  where escrow_release_at is not null and escrow_released = false;

-- ── bids: mark proxy/auto-escalation rows ────────────────────────────────────
alter table public.bids
  add column if not exists is_proxy boolean not null default false;

-- ── auction_payments — escrow ledger ─────────────────────────────────────────
-- One row per buyer payment. The Stripe webhook is the ONLY writer that flips
-- status to 'paid' (idempotent on the Stripe event id). The release job flips
-- 'paid' → 'released' after escrow_release_at; a dispute flips it to 'disputed'
-- and freezes the auto-release.
create table if not exists public.auction_payments (
  id                 uuid primary key default gen_random_uuid(),
  auction_id         uuid not null references public.auctions(id) on delete cascade,
  buyer_id           uuid not null references public.profiles(id) on delete cascade,
  seller_id          uuid not null references public.profiles(id) on delete cascade,
  -- 'escrow' (price+premium held by platform) | 'premium_only' (cash sale: only the 3 %)
  flow               text not null default 'escrow',
  price_amount       numeric(12,2) not null default 0,   -- vehicle price (0 for premium_only display)
  premium_amount     numeric(12,2) not null default 0,   -- 3 % buyer's premium
  currency           text not null default 'eur',
  payment_intent_id  text unique,
  stripe_event_id    text unique,                        -- idempotency for the webhook
  status             text not null default 'pending',    -- pending|paid|released|refunded|disputed
  escrow_release_at  timestamptz,
  paid_at            timestamptz,
  released_at        timestamptz,
  dispute_opened_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_auction_payments_updated before update on public.auction_payments
  for each row execute function set_updated_at();
create index if not exists idx_auction_payments_auction on public.auction_payments(auction_id);
create index if not exists idx_auction_payments_release on public.auction_payments(status, escrow_release_at)
  where status = 'paid';

-- ── seller Stripe Connect account (destination for the price transfer) ───────
-- The 48 h escrow release transfers the vehicle price to this connected account;
-- the 3 % premium stays on the platform balance.
alter table public.profiles
  add column if not exists stripe_account_id text;       -- acct_... (Stripe Connect)

-- ── place_bid() — AutoHub server-authoritative bid (F5 anti-snip) ────────────
-- SUPERSEDES the basic place_bid() in security.sql. This file runs LAST (after the
-- AutoHub columns exist), so `create or replace` swaps in the type-aware version:
--   • silent  → sealed bid, floor = starting_bid (current top never leaks)
--   • live / pre-bid(live) → must beat current by the 50 EUR increment + anti-snip
--   • +2 min extension when a bid lands in the last 2 min of a LIVE phase
-- Bidder identity comes from auth.uid() (verified JWT), never a parameter. The row
-- is locked FOR UPDATE so concurrent bids can't race. Raises on any invalid bid
-- (the route maps that to 400). security definer + pinned search_path.
create or replace function public.place_bid(p_auction uuid, p_amount numeric)
  returns public.auctions
  language plpgsql security definer set search_path = public, pg_temp as $$
declare
  a        public.auctions;
  v_uid    uuid := auth.uid();
  v_min    numeric;
  v_live   boolean;
  v_now    timestamptz := now();
  v_window interval := interval '2 minutes';
  v_extend interval := interval '2 minutes';
  v_snipe  boolean;
begin
  if v_uid is null then raise exception 'Prijava je obvezna' using errcode = '28000'; end if;

  select * into a from public.auctions where id = p_auction for update;
  if not found then raise exception 'Dražba ne obstaja' using errcode = 'P0002'; end if;
  if a.seller_id = v_uid then raise exception 'Prodajalec ne more ponujati'; end if;
  if a.status not in ('active','open') or a.ends_at <= v_now then raise exception 'Dražba je zaprta'; end if;
  if p_amount <= 0 then raise exception 'Neveljaven znesek'; end if;

  v_live := (a.auction_type = 'live') or (a.auction_type = 'prebid' and a.current_phase = 'live');

  -- Silent: sealed bids, floor is the starting bid.
  if a.auction_type = 'silent' then
    if p_amount < a.starting_bid then raise exception 'Ponudba mora biti vsaj % EUR', a.starting_bid; end if;
    insert into public.bids(auction_id, bidder_id, amount, is_proxy) values (p_auction, v_uid, p_amount, false);
    if p_amount > coalesce(a.current_bid, 0) then
      update public.auctions set current_bid = p_amount, current_bidder = v_uid, updated_at = v_now
        where id = p_auction returning * into a;
    end if;
    return a;
  end if;

  -- Live / pre-bid public bidding: beat current by the 50 EUR increment.
  if coalesce(a.current_bid, 0) = 0 then v_min := a.starting_bid;
  else v_min := coalesce(a.current_bid, a.starting_bid) + 50; end if;
  if p_amount < v_min then raise exception 'Ponudba mora biti vsaj % EUR', v_min; end if;

  insert into public.bids(auction_id, bidder_id, amount, is_proxy) values (p_auction, v_uid, p_amount, false);

  v_snipe := v_live and (a.ends_at - v_now) < v_window;
  update public.auctions
     set current_bid = p_amount,
         current_bidder = v_uid,
         ends_at = case when v_snipe then a.ends_at + v_extend else a.ends_at end,
         anti_snip_extensions = anti_snip_extensions + (case when v_snipe then 1 else 0 end),
         updated_at = v_now
   where id = p_auction
  returning * into a;
  return a;
end;
$$;

-- Callable only by signed-in users (RLS still governs direct table access).
revoke all on function public.place_bid(uuid, numeric) from public, anon;
grant execute on function public.place_bid(uuid, numeric) to authenticated;
