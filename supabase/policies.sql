-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security policies. Run AFTER schema.sql.
-- These replace the old firestore.rules. The service-role key (used by the API
-- for trusted operations) bypasses RLS; everything the browser does via the
-- anon key + user JWT is governed here.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper: is the current JWT an admin? (mirrors profiles.is_admin)
-- security definer + pinned search_path (#6).
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Enable RLS everywhere.
alter table public.profiles           enable row level security;
alter table public.businesses         enable row level security;
alter table public.listings           enable row level security;
alter table public.auctions           enable row level security;
alter table public.bids               enable row level security;
alter table public.inventory          enable row level security;
alter table public.leads              enable row level security;
alter table public.bookings           enable row level security;
alter table public.tire_storage       enable row level security;
alter table public.tire_orders        enable row level security;
alter table public.reviews            enable row level security;
alter table public.reports            enable row level security;
alter table public.taxonomy_proposals enable row level security;
alter table public.site_config         enable row level security;

create policy site_config_public_read on public.site_config for select using (true);
create policy site_config_admin_write on public.site_config for all
  using (public.is_admin()) with check (public.is_admin());

-- Public hero images uploaded from Admin > Nastavitve.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;
create policy site_assets_public_read on storage.objects for select
  using (bucket_id = 'site-assets');
create policy site_assets_admin_insert on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());
create policy site_assets_admin_delete on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());

-- ── profiles ─────────────────────────────────────────────────────────────────
create policy profiles_self_read   on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy profiles_self_update on public.profiles for update using (auth.uid() = id);

-- ── businesses: public read (storefronts), owner/admin write ─────────────────
create policy businesses_public_read on public.businesses for select using (true);
create policy businesses_owner_write on public.businesses for all
  using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

-- ── listings: public read of active; owner manages own ───────────────────────
create policy listings_public_read on public.listings for select
  using (status = 'active' or auth.uid() = owner_id or public.is_admin());
create policy listings_owner_insert on public.listings for insert with check (auth.uid() = owner_id);
create policy listings_owner_update on public.listings for update using (auth.uid() = owner_id or public.is_admin());
create policy listings_owner_delete on public.listings for delete using (auth.uid() = owner_id or public.is_admin());

-- ── auctions: public read; seller manages; bids via API/transaction only ─────
create policy auctions_public_read on public.auctions for select using (true);
create policy auctions_seller_write on public.auctions for all
  using (auth.uid() = seller_id or public.is_admin())
  with check (auth.uid() = seller_id or public.is_admin());

-- bids: anyone authed can read; insert own bid (seller-can't-bid enforced in API/trigger)
create policy bids_read   on public.bids for select using (true);
create policy bids_insert on public.bids for insert with check (auth.uid() = bidder_id);

-- ── provider-scoped B2B tables (inventory / leads / tire_storage) ────────────
create policy inventory_owner on public.inventory for all
  using (auth.uid() = provider_id or public.is_admin())
  with check (auth.uid() = provider_id or public.is_admin());

create policy tire_storage_owner on public.tire_storage for all
  using (auth.uid() = provider_id or public.is_admin())
  with check (auth.uid() = provider_id or public.is_admin());

-- leads: target provider reads/updates; any authed user may create a lead
create policy leads_provider_read on public.leads for select using (auth.uid() = provider_id or public.is_admin());
create policy leads_create        on public.leads for insert with check (auth.uid() = from_user);
create policy leads_provider_update on public.leads for update using (auth.uid() = provider_id or public.is_admin());

-- ── bookings: provider or the customer involved ──────────────────────────────
create policy bookings_party_read on public.bookings for select
  using (auth.uid() = provider_id or auth.uid() = customer_id or public.is_admin());
create policy bookings_create on public.bookings for insert
  with check (auth.uid() = customer_id or auth.uid() = provider_id);
create policy bookings_provider_update on public.bookings for update
  using (auth.uid() = provider_id or public.is_admin());

-- ── tire_orders: buyer or vulcanizer ─────────────────────────────────────────
create policy tire_orders_party_read on public.tire_orders for select
  using (auth.uid() = buyer_id or auth.uid() = vulcanizer_id or public.is_admin());
create policy tire_orders_buyer_create on public.tire_orders for insert with check (auth.uid() = buyer_id);
create policy tire_orders_vulcanizer_update on public.tire_orders for update
  using (auth.uid() = vulcanizer_id or public.is_admin());

-- ── reviews: public read, authed create own, author/admin delete ─────────────
create policy reviews_public_read on public.reviews for select using (true);
create policy reviews_create on public.reviews for insert with check (auth.uid() = author_id);
create policy reviews_delete on public.reviews for delete using (auth.uid() = author_id or public.is_admin());

-- ── reports: create by anyone authed; read/manage admin only ─────────────────
create policy reports_create on public.reports for insert with check (auth.uid() is not null);
create policy reports_admin  on public.reports for select using (public.is_admin());
create policy reports_admin_update on public.reports for update using (public.is_admin());

-- ── taxonomy_proposals: create by authed; manage admin only ──────────────────
create policy taxonomy_create on public.taxonomy_proposals for insert with check (auth.uid() is not null);
create policy taxonomy_admin  on public.taxonomy_proposals for all using (public.is_admin());
