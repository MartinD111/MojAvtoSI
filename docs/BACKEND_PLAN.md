# MojAvto.si / MojaNavtika.si — Backend Implementation Plan

> ⚠️ **SUPERSEDED (2026-06) by [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md).**
> The project moved off the "100% Firebase serverless" approach below to a
> Supabase + AWS ECS Fargate + Cloudflare stack. This file is kept only for the
> still-relevant business logic (auction close, boost expiry, payments,
> transactional email) — re-implement those on the new stack, not on Firebase.

**Audience:** Aleksandar (backend)
**Goal:** Add the minimum backend needed to go to production, optimized for **lowest cost** and **lowest ops overhead**.

---

## 0. Architecture decision (read first)

We stay **100% Firebase serverless**. No Express, no VPS, no separate server.

The rule of thumb that keeps cost near zero:

1. **Anything that can be a Security Rule → is a rule** (free, no deploy of code).
2. **Anything Firebase Auth already does → use Auth** (email verification + password reset are free, including delivery).
3. **Cloud Functions only for the 3 things that genuinely can't run client-side:** payments, scheduled jobs, transactional email.
4. **Collapse functions** so we run as few invocations as possible.

**Stack:**
- Cloud Functions **2nd gen** (Cloud Run based), `minInstances: 0` → €0 when idle.
- **Blaze plan** required (Functions need it). Firestore/Hosting/Auth still run on free Spark quotas.
- **Stripe Checkout** (hosted) for payments → no PCI scope on us.
- **Resend** (3,000 emails/mo free) or **Brevo** (300/day free) for transactional email. *(Auth emails are separate and free.)*

**Expected cost at launch:** ~€0–5/month + Stripe's per-transaction fee (~1.5% EU cards). Scales with actual paid activity, not with traffic.

---

## 1. What's already done (no backend work needed)

- Firestore rules exist for: `listings`, `auctions`, `users`, `bookings`, `tire_orders`, `reports`, `reviews`, `partsCatalog`, `auctionAlerts`, etc.
- Auth scaffolding: private registration, Google sign-in, password strength meter.
- Auction `placeBid` runs in a Firestore transaction; rules enforce monotonic bids + seller-can't-bid.
- Payment **UI** exists (3 tiers + auction packages); records `paidAmount`/`paymentRef` as intent only.
- Admin center is comprehensive (moderation, users, taxonomy, reports).

---

## 2. Work items, in priority order

### ✅ A. Firestore rules for unprotected collections — **DO FIRST, zero cost**
**Problem:** `businesses`, `inventory`, `leads`, `tire_storage`, `taxonomy_proposals` have **no rules** → the catch-all `deny` blocks them → the entire B2B OS fails against a real DB.

**Task:** Add rule blocks. Suggested model:
- `businesses/{id}`: read = public (for storefront pages); write = owner (`request.auth.uid == resource.data.ownerUid`) or admin.
- `inventory/{id}`, `tire_storage/{id}`: read/write = owning business (verified) or admin.
- `leads/{id}`: create = any authed user (a lead to a business); read = target business or admin; no client update/delete.
- `taxonomy_proposals/{id}`: create = any authed user; read/update/delete = admin only.

**No functions. Just `firestore.rules` + deploy.**

---

### ✅ B. Auth emails + `/forgot-password` route — **free, mostly frontend**
**Problem:** `sendEmailVerification` never called; `/forgot-password` link is a 404.

**Task (frontend, no backend service):**
- Call `sendEmailVerification(user)` after `register`.
- Add `/forgot-password` route → form → `sendPasswordResetEmail(auth, email)`.
- Gate sensitive actions on `user.emailVerified` if desired.

Firebase Auth sends these emails itself for free. Customize templates in Firebase console → Authentication → Templates (set Slovenian copy + sender name).

---

### ⚙️ C. Scheduled maintenance function — **1 function, near-free**
**Problem:** auctions never auto-close; boosts never expire (`promotion.expiresAt` written as `null`, nothing demotes lapsed boosts).

**Task:** ONE 2nd-gen scheduled function, cron every 5 min:
```
exports.scheduledMaintenance = onSchedule("every 5 minutes", async () => {
  // 1. Auctions: query auctions where status==open && endsAt <= now
  //    → in a transaction: set status=closed, set winner = highest bid,
  //      write a "won" notification doc (picked up by email trigger, item E).
  // 2. Boosts: query listings where promotion.expiresAt <= now && promotion.tier != null
  //    → clear promotion (tier=null, isPremium=false).
});
```
~8,600 invocations/month → inside the free tier. 5-min granularity is fine for classifieds.
This is also the authoritative auction close — client bid validation stays as a UX guard only.

> Requires indexes on `auctions(status, endsAt)` and `listings(promotion.expiresAt)`. Add to `firestore.indexes.json`.

---

### ⚙️ D. Payments — Stripe Checkout + 1 webhook
**Problem:** selecting a paid tier charges nothing.

**Task:**
1. Frontend: on tier/package select → call a callable `createCheckoutSession(listingId, tier)` that returns a Stripe Checkout URL → redirect.
2. `createCheckoutSession` (callable function): creates a Stripe Checkout Session with the correct price (free / homepage 4,99 / sponsored 9,99 / auction packages), `metadata: { listingId, tier }`.
3. `stripeWebhook` (HTTP function): on `checkout.session.completed` → verify signature → set `listing.promotion = { tier, expiresAt: now + duration }` and `paidAmount`/`paymentRef`. **This is the only place that grants the boost.**

Stripe handles the card form (no PCI scope). Use **test mode** keys until launch. Store keys via `firebase functions:secrets`.

> **Frontend follow-up (separate, already noted in the prod report):** fix the `home.js` `sponsored`-vs-`isPremium` surfacing bug so a paid `sponsored` listing actually shows in the homepage carousel. The boost is worthless if it doesn't surface.

---

### ⚙️ E. Transactional emails — outbid / won / sold
**Problem:** `auctionAlerts` + `notify` prefs stored, but nothing sends mail.

**Task:** Firestore-triggered function on a `mail`/`notifications` collection (or use the **Trigger Email** Firebase Extension + Resend SMTP):
- Outbid: when a new higher bid lands, email the previous top bidder (respect `auctionAlerts`/`notify` prefs + GDPR consent).
- Won: written by the scheduled close (item C).
- Sold: when seller marks listing sold.

Keep volume low → Resend/Brevo free tier is plenty.

---

### 🔧 F. Business verification — admin-only, no real function
**Problem:** every B2B account stuck `unverified`; nothing flips `businessTier` to `verified`.

**Task:** Admin UI "Businesses" section with an Approve button. Either:
- write `businessTier='verified'` directly under an **admin-gated rule** (simplest), or
- a small callable `verifyBusiness(uid)` that checks admin custom claim then writes (cleaner audit trail).

No scheduled work, negligible cost.

---

## 3. Not backend — flagged so they don't get mis-assigned

- **Server-side pagination** for `getListings`: a client-side Firestore `query(limit/startAfter)` + index change. No function.
- **SEO prerendering**: a Hosting/build concern, handle in the SEO pass.
- **Webscraping parts catalog** (deferred): when built, use a scheduled **Cloud Run job** (long-running), not a Cloud Function. See `docs/WEBSCRAPING_HANDOFF.md`.

---

## 4. Deliverable checklist for Aleksandar

- [ ] **A.** Rules for `businesses`, `inventory`, `leads`, `tire_storage`, `taxonomy_proposals` + deploy
- [ ] **B.** `sendEmailVerification` on register + `/forgot-password` route + `sendPasswordResetEmail` (frontend) + Slovenian Auth templates
- [ ] Init `functions/` (2nd gen), upgrade project to Blaze, set Stripe + email secrets
- [ ] **C.** `scheduledMaintenance` (auction close + winner + boost expiry) + indexes
- [ ] **D.** `createCheckoutSession` (callable) + `stripeWebhook` (HTTP) + frontend redirect
- [ ] **E.** Email trigger for outbid / won / sold (Resend or Trigger Email extension)
- [ ] **F.** Admin business-verification UI + write path (rule or callable)

**Total new Cloud Functions: 3** (`scheduledMaintenance`, `createCheckoutSession`, `stripeWebhook`) + 1 email trigger. Everything else is rules or frontend.
