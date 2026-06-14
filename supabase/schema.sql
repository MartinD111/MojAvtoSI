-- ═══════════════════════════════════════════════════════════════════════════
-- MojAvto.si / MojaNavtika.si — Supabase (Postgres) schema
-- Maps the old Firestore collections to relational tables. Run this first, then
-- policies.sql. Idempotent-ish: uses IF NOT EXISTS where practical.
--
--   supabase db reset           # local
--   or paste into the SQL editor on the hosted project
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type platform_t   as enum ('avto', 'navtika');
exception when duplicate_object then null; end $$;
do $$ begin
  create type item_type_t  as enum ('vehicle', 'parts', 'auction', 'oprema');
exception when duplicate_object then null; end $$;
do $$ begin
  create type listing_status_t as enum ('draft', 'active', 'sold', 'expired', 'removed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type business_tier_t  as enum ('unverified', 'verified');
exception when duplicate_object then null; end $$;

-- ── shared updated_at trigger ────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ── profiles (1:1 with auth.users) ───────────────────────────────────────────
-- Supabase Auth owns auth.users (replaces Firebase Auth). App-level user data
-- lives here, keyed by the auth uid.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  phone        text,
  avatar_url   text,
  is_admin     boolean not null default false,
  -- notification / GDPR consent prefs (was `notify` / `auctionAlerts`)
  prefs        jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
-- security definer + EXPLICIT search_path (#6): without a pinned search_path a
-- definer function can be hijacked by a malicious schema/object on the caller's
-- path. Pin to public, pg_temp last.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── businesses (B2B: dealers, mechanics, vulcanizers / marinas) ──────────────
create table if not exists public.businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  platform      platform_t not null,
  name          text not null,
  role          text,                 -- dealer | mechanic | vulcanizer
  tier          business_tier_t not null default 'unverified',
  logo_url      text,
  cover_url     text,
  data          jsonb not null default '{}'::jsonb,  -- address, hours, contact, gallery
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_businesses_updated before update on public.businesses
  for each row execute function set_updated_at();
create index if not exists idx_businesses_owner on public.businesses(owner_id);

-- ── listings (core marketplace resource) ─────────────────────────────────────
create table if not exists public.listings (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  platform     platform_t not null,
  item_type    item_type_t not null default 'vehicle',
  title        text not null,
  description  text,
  brand        text,
  model        text,
  year         int,
  price        numeric(12,2),
  images       jsonb not null default '[]'::jsonb,  -- array of R2 public URLs
  data         jsonb not null default '{}'::jsonb,  -- category-specific specs
  status       listing_status_t not null default 'active',
  -- promotion/boost (was promotion.{tier,expiresAt}); webhook grants it
  promotion    jsonb,
  paid_amount  numeric(12,2),
  payment_ref  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_listings_updated before update on public.listings
  for each row execute function set_updated_at();
create index if not exists idx_listings_owner   on public.listings(owner_id);
create index if not exists idx_listings_browse  on public.listings(platform, status, created_at desc);

-- ── auctions ─────────────────────────────────────────────────────────────────
create table if not exists public.auctions (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references public.listings(id) on delete cascade,
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  platform      platform_t not null,
  starting_bid  numeric(12,2) not null default 0,
  current_bid   numeric(12,2) not null default 0,
  current_bidder uuid references public.profiles(id),
  status        text not null default 'open',  -- open | closed
  ends_at       timestamptz not null,
  winner_id     uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_auctions_updated before update on public.auctions
  for each row execute function set_updated_at();
create index if not exists idx_auctions_close on public.auctions(status, ends_at);

create table if not exists public.bids (
  id          uuid primary key default gen_random_uuid(),
  auction_id  uuid not null references public.auctions(id) on delete cascade,
  bidder_id   uuid not null references public.profiles(id) on delete cascade,
  amount      numeric(12,2) not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_bids_auction on public.bids(auction_id, created_at desc);

-- ── inventory (dealer stock) ─────────────────────────────────────────────────
create table if not exists public.inventory (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'draft',
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_inventory_updated before update on public.inventory
  for each row execute function set_updated_at();
create index if not exists idx_inventory_provider on public.inventory(provider_id, status);

-- ── leads (dealer CRM) ───────────────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  from_user   uuid references public.profiles(id),
  status      text not null default 'new',
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_leads_updated before update on public.leads
  for each row execute function set_updated_at();
create index if not exists idx_leads_provider on public.leads(provider_id, status);

-- ── bookings (service appointments) ──────────────────────────────────────────
create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid not null references public.profiles(id) on delete cascade,
  customer_id  uuid references public.profiles(id),
  date         date,
  time         text,
  status       text not null default 'pending', -- pending|confirmed|completed|blocked
  total_price  numeric(12,2),
  notes        text,
  data         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_bookings_updated before update on public.bookings
  for each row execute function set_updated_at();
create index if not exists idx_bookings_provider on public.bookings(provider_id, status);

-- ── tire_storage ("hotel za gume") ───────────────────────────────────────────
create table if not exists public.tire_storage (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'stored',
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_tire_storage_updated before update on public.tire_storage
  for each row execute function set_updated_at();
create index if not exists idx_tire_storage_provider on public.tire_storage(provider_id, status);

-- ── tire_orders (buyer → vulcanizer flow) ────────────────────────────────────
create table if not exists public.tire_orders (
  id            uuid primary key default gen_random_uuid(),
  vulcanizer_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id      uuid not null references public.profiles(id) on delete cascade,
  status        text not null default 'pending_confirmation',
  tire_data     jsonb not null default '{}'::jsonb,
  price_snapshot numeric(12,2),
  current_price  numeric(12,2),
  booking_url   text,
  estimated_delivery_date date,
  submitted_at  timestamptz not null default now(),
  confirmed_at  timestamptz,
  ordered_at    timestamptz,
  updated_at    timestamptz not null default now()
);
create trigger trg_tire_orders_updated before update on public.tire_orders
  for each row execute function set_updated_at();
create index if not exists idx_tire_orders_vulcanizer on public.tire_orders(vulcanizer_id, status);

-- ── reviews ──────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null,  -- 'business' | 'listing' | 'user'
  target_id   uuid not null,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_reviews_target on public.reviews(target_type, target_id);

-- ── reports (moderation) ─────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id   uuid not null,
  reason      text,
  status      text not null default 'open',
  created_at  timestamptz not null default now()
);

-- ── taxonomy_proposals (admin-reviewed user submissions) ─────────────────────
create table if not exists public.taxonomy_proposals (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references public.profiles(id) on delete set null,
  payload     jsonb not null default '{}'::jsonb,
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);
