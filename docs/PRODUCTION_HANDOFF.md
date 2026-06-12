# MojAvto.si / MojaNavtika.si — Full Production Handoff Document

**Date:** 2026-06-12  
**Prepared by:** Martin Dumanic (frontend) + Claude audit  
**Backend owner:** Aleksandar  
**Scope:** Everything identified during the full site audit as needing work before production launch, plus feature suggestions. Covers both portals (MojAvto.si and MojaNavtika.si — one codebase, `VITE_PLATFORM=avto|navtika`).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Completed Fixes (This Session)](#2-completed-fixes-this-session)
3. [Blockers — Must Fix Before Launch](#3-blockers--must-fix-before-launch)
4. [High Priority — Fix Before Public Beta](#4-high-priority--fix-before-public-beta)
5. [Backend Work (Aleksandar)](#5-backend-work-aleksandar)
6. [Category & Taxonomy Gaps](#6-category--taxonomy-gaps)
7. [UX Flow Issues by Feature](#7-ux-flow-issues-by-feature)
8. [Performance & Build](#8-performance--build)
9. [Security & Rules](#9-security--rules)
10. [Feature Suggestions](#10-feature-suggestions)
11. [File Map — Where Everything Lives](#11-file-map--where-everything-lives)

---

## 1. Architecture Overview

```
One codebase → two portals
  VITE_PLATFORM=avto    → MojAvto.si    (cars, moto, commercial, recreation)
  VITE_PLATFORM=navtika → MojaNavtika.si (boats, rental/charter)

Routing:        Hash-based SPA (#/oglas?id=...) via src/router.js
Page loading:   src/pageController.js lazy-imports per-page JS chunks
Auth:           Firebase Auth (email + Google) → Firestore users/{uid}
Database:       Firestore
Storage:        Firebase Storage (listing images, business assets)
Build:          Vite — per-page code splitting, ~1s build time
```

**Key config files:**
- `src/config/platform.js` — single source of truth for which portal is active
- `src/router.js` — all routes with auth/b2b guards
- `firestore.rules` — all Firestore security rules
- `storage.rules` — Firebase Storage rules

---

## 2. Completed Fixes (This Session)

These are already done in the codebase:

### 2.1 Liked Listings (Heart → Profile)
**Files changed:** `src/pages/profile.js`, `firestore.rules`

- Profile page now has a "❤️ Shranjeni oglasi" section that reads from `users/{uid}/favourites` via `getFavourites()`
- Each saved listing shows: image, title, EUR price, link to listing, and a "Odstrani" button
- Removing a favourite calls `removeFromFavourites()` and refreshes the list
- Added the missing Firestore rule for `users/{userId}/favourites/{listingId}` — without this rule, saves would silently fail in production

### 2.2 Currency: USD → EUR everywhere
**Files changed:** `src/services/listingService.js`, `src/utils/listingUtils.js`, `src/pages/dashboard.js`

- `listingService.formatPrice()` — was `currency: 'USD'`, now `currency: 'EUR'` with `sl-SI` locale
- `listingUtils.formatPrice()` — was `'$' + en-US`, now `sl-SI EUR`
- `listingUtils.getKmPill()` — was converting to miles, now shows km
- `listingUtils.formatMiles()` — renamed behaviour: now returns km string (kept function name for call-site compatibility)
- `dashboard.js` — listing cards and print sheet now use `priceEur ?? price` in EUR

### 2.3 Distance: Miles → km everywhere
**Files changed:** `src/pages/listing.js`, `src/pages/listing.navtika.js`, `src/pages/create-listing.js`, `src/services/listingService.js`, `src/utils/listingUtils.js`

- `listing.js` `fmtKm()` — removed the `en` branch that converted to miles; always `sl-SI` + km
- `listing.navtika.js` `fmtKm()` — same fix
- `create-listing.js` review step — mileage and EV range now always show km
- `listingService.formatMileage()` — now returns km instead of converting to miles

### 2.4 Navtika: Engine Hours Instead of km
**Files changed:** `src/pages/listing.navtika.js`

- Key info strip now shows `engineHoursUsed` as `X h` when present, falls back to km only for non-vessel navtika items
- Similar cards (related listings) apply the same logic
- Service history locale fixed from `en-US` to `sl-SI`

---

## 3. Blockers — Must Fix Before Launch

These will break the site or make it unusable for real users.

### 3.1 🔴 Missing Firestore Rules for B2B Collections
**Impact:** Entire B2B operating system fails silently in production — all reads/writes denied  
**Collections missing rules:** `businesses`, `inventory`, `leads`, `tire_storage`, `taxonomy_proposals`  
**File to edit:** `firestore.rules`

Rules to add:
```javascript
// Businesses (B2B profiles)
match /businesses/{userId} {
  allow read: if true;  // public business profiles
  allow write: if isSignedIn() && uid() == userId;
}

// Inventory (B2B vehicle stock)
match /inventory/{itemId} {
  allow read: if isSignedIn() && resource.data.ownerId == uid();
  allow create: if isSignedIn() && request.resource.data.ownerId == uid();
  allow update, delete: if isSignedIn() && resource.data.ownerId == uid();
}

// Leads (B2B customer enquiries)
match /leads/{leadId} {
  allow read: if isSignedIn() && resource.data.businessId == uid();
  allow create: if true;  // any visitor can submit a lead
  allow update: if isSignedIn() && resource.data.businessId == uid();
  allow delete: if isSignedIn() && resource.data.businessId == uid();
}

// Tire storage (vulcanizer hotel gum)
match /tire_storage/{itemId} {
  allow read: if isSignedIn() &&
    (resource.data.vulcanizerId == uid() || resource.data.customerId == uid());
  allow create: if isSignedIn() && request.resource.data.vulcanizerId == uid();
  allow update, delete: if isSignedIn() && resource.data.vulcanizerId == uid();
}

// Taxonomy proposals (user-submitted brands/models)
match /taxonomy_proposals/{proposalId} {
  allow read: if isModerator();
  allow create: if isSignedIn() && request.resource.data.submittedBy == uid();
  allow update: if isModerator();
  allow delete: if isAdmin();
}
```

Also add the `vehicles` subcollection rule (personal garage, different from `garages`):
```javascript
match /users/{userId}/vehicles/{vehicleId} {
  allow read, write: if isSignedIn() && uid() == userId;
}
```

---

### 3.2 🔴 Business Verification — No Admin UI or Service Function
**Impact:** Every business account is permanently stuck as `businessTier: 'unverified'` — bulk import, verified features, and any `isVerifiedBusiness()` gates are unreachable for all users  
**Files to create/edit:** `src/services/adminService.js`, `src/pages/admin.js`

**Backend (Aleksandar):** Add Cloud Function or allow admin SDK to flip `businessTier`.

**Frontend (Martin):** Add a "Businesses" section to the admin panel with:
- Table of all users where `sellerType === 'business'`
- Columns: company name, tax ID, registered date, current tier, roles
- Actions: "Verify" button (sets `businessTier: 'verified'`), "Reject" button, "Ban" button
- Filter by tier: `unverified | verified | suspended`

Service function to add in `adminService.js`:
```javascript
export async function adminSetBusinessTier(uid, tier) {
    // tier: 'unverified' | 'verified' | 'suspended'
    await updateDoc(doc(db, 'users', uid), {
        businessTier: tier,
        businessVerifiedAt: tier === 'verified' ? serverTimestamp() : null,
    });
    await addAuditLog(adminUid, adminName, 'set_business_tier', uid, { tier });
}
```

---

### 3.3 🔴 Password Reset — Route Does Not Exist
**Impact:** Login page links to `#/forgot-password` which is a 404. Users who forget their password have no recovery path.  
**Files to edit:** `src/router.js`, `src/auth/` (new file), `public/views/` (new HTML)

Steps:
1. Add route to `router.js`: `'/forgot-password': { view: 'forgot-password', protected: false }`
2. Add `public/views/forgot-password.html` with an email input form
3. Add `src/auth/forgot-password.js` that calls `sendPasswordResetEmail(auth, email)` from Firebase Auth
4. Add to `pageController.js`: `'forgot-password': () => import('./auth/forgot-password.js').then(...)`

---

### 3.4 🔴 No Email Verification After Registration
**Impact:** Anyone can register with a fake email and post listings. Required for basic trust and GDPR.  
**File to edit:** `src/auth/auth.js` — `registerWithEmail()` function

Add after `createUserWithEmailAndPassword`:
```javascript
await sendEmailVerification(cred.user);
```

Then gate listing creation: in `create-listing.js` check `auth.currentUser.emailVerified` before allowing publish, with a prompt to check email if not verified.

---

### 3.5 🔴 No Edit Listing Flow
**Impact:** Sellers can create and delete listings but cannot update them — broken UX for any seller who makes a typo or wants to change the price  
**Files to edit:** `src/pages/dashboard.js`, `src/pages/create-listing.js`

The service function `updateListing(listingId, updates)` exists in `listingService.js` — it just needs a UI.

Approach:
- Add "Uredi" button on each listing card in `dashboard.js`
- Clicking it navigates to `#/novi-oglas?edit=<listingId>`
- In `create-listing.js`, detect `?edit=` param on init, load the existing listing into `state` via `getListingById()`, and change the submit button from "Objavi" to "Shrani spremembe"
- On submit call `updateListing()` instead of `createListing()`
- Skip image re-upload if user didn't change photos (keep existing URLs)

---

## 4. High Priority — Fix Before Public Beta

### 4.1 🟠 Homepage Sponsored Carousel Bug
**Impact:** Listings with `promotion.tier === 'sponsored'` (the paid "🚀 Sponzorirano" tier) do NOT appear in the homepage carousel — only `homepage` tier does. The tiers are named the wrong way round from the user's perspective.

**File:** `src/pages/home.js`, line 87  
**Current code:**
```javascript
const sponsored = allListings.filter(l => l.isPremium);
```
`isPremium` is only set to `true` for `promotionTier === 'homepage'` — NOT for `sponsored`.

**Fix:**
```javascript
const sponsored = allListings.filter(l =>
    l.promotion?.tier === 'sponsored' || l.promotion?.tier === 'homepage' || l.isPremium
);
```

---

### 4.2 🟠 Boost Expiry Not Enforced
**Impact:** A seller pays for a 7-day boost — it runs forever. No revenue recurrence, no fairness.  
**Current state:** `promotion.expiresAt` is always written as `null`; nothing ever demotes a listing.

**Backend (Aleksandar):** Scheduled Cloud Function that runs daily:
```
query listings where promotion.tier != 'free' AND promotion.expiresAt < now()
→ update promotion.tier = 'free', promotion.activatedAt = null
```

**Frontend (Martin):** In `sortByPromotion()` in `listingService.js`, filter out expired boosts:
```javascript
const isActiveBoost = l => {
    if (!l.promotion || l.promotion.tier === 'free') return false;
    if (!l.promotion.expiresAt) return true; // no expiry set yet (legacy)
    const exp = l.promotion.expiresAt?.toMillis?.() || l.promotion.expiresAt;
    return exp > Date.now();
};
```

---

### 4.3 🟠 Mark-as-Sold Instead of Hard Delete
**Impact:** Sold listings disappear completely — no "Prodano" badge, no analytics on sell-through rate, no social proof ("X vehicles sold this month")  
**File:** `src/services/listingService.js` — `deleteListing()` currently ignores the `markAsSold` argument from dashboard

**Fix — `listingService.js`:**
```javascript
export async function deleteListing(listingId, action = 'removed') {
    const docRef = doc(db, 'listings', listingId);
    if (action === 'sold') {
        await updateDoc(docRef, { status: 'sold', soldAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } else {
        await deleteDoc(docRef);
    }
}
```

**Fix — listing cards/feed:** Filter out `status === 'sold'` from the live feed, but optionally show them with a "Prodano" badge on the seller's dashboard and their public profile.

---

### 4.4 🟠 Report Listing Button Missing
**Impact:** Users see spam/fraud listings with no way to flag them. The admin moderation queue will always be empty even though all the infrastructure (rules, `resolveReport()` in `adminService.js`) exists.

**File:** `src/pages/listing.js` — add a "Prijavi oglas" button near the contact section

```javascript
// In the listing page action buttons area:
<button id="lpReportBtn" class="lp-action-btn">
    <i data-lucide="flag"></i> Prijavi oglas
</button>
```

Wire it to write to Firestore:
```javascript
await addDoc(collection(db, 'reports'), {
    listingId: l.id,
    reporterId: auth.currentUser.uid,
    reason: selectedReason,  // show a small modal with options
    createdAt: serverTimestamp(),
    status: 'pending',
});
```

---

### 4.5 🟠 Pagination for Listings Feed
**Impact:** `getListings()` fetches the ENTIRE `listings` collection at once. At scale (thousands of listings) this is slow, expensive (Firestore reads), and will hit memory limits.

**File:** `src/services/listingService.js`

**Fix:** Add cursor-based pagination:
```javascript
export async function getListings(lastDoc = null, pageSize = 24) {
    let q = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
    );
    if (lastDoc) q = query(q, startAfter(lastDoc));
    const snapshot = await getDocs(q);
    return {
        listings: snapshot.docs.map(d => ({ id: d.id, ...d.data() })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize,
    };
}
```

Then add "Naloži več" / infinite scroll in `oglasi.js`.

---

### 4.6 🟠 SEO — Hash Routing Is Not Crawlable
**Impact:** Google cannot index individual listing pages (`#/oglas?id=...`). A classifieds site lives and dies by organic search — this is a fundamental SEO problem.

**Options (discuss with team):**
1. **Prerendering (recommended):** Use `vite-plugin-ssr` or deploy via Netlify/Vercel with prerender rules. Each listing page gets a static HTML snapshot for crawlers.
2. **History API routing:** Switch from hash (`#/`) to real URLs (`/oglas/ford-focus-2019`). Requires server-side catch-all redirect to `index.html`. Clean URLs also improve user trust and sharing.
3. **SSR:** Most work, but best long-term. Firebase Hosting + Cloud Functions can serve SSR.

Short-term minimum: Add `<meta name="robots" content="index, follow">` and a proper `sitemap.xml` with listing URLs.

---

### 4.7 🟠 Dashboard Reservations Use Mock Data
**Impact:** The dashboard "My bookings" section reads from `bookingData.js` (a local mock array), not Firestore. A user's dashboard shows fake bookings, and real bookings made through the B2B side never appear there.

**File:** `src/pages/dashboard.js` — `renderBookingsSection()` calls `getBookingsForUser()` which is a local mock function from `bookingData.js`

**Fix:** Replace with a real Firestore query:
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';
// ...
const q = query(collection(db, 'bookings'), where('userId', '==', userId), orderBy('date', 'desc'));
const snap = await getDocs(q);
const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

Also add the missing Firestore rule for `bookings` collection (currently has no rule — denied in production):
```javascript
match /bookings/{bookingId} {
  allow read: if isSignedIn() &&
    (resource.data.userId == uid() || resource.data.businessId == uid());
  allow create: if isSignedIn() && request.resource.data.userId == uid();
  allow update: if isSignedIn() &&
    (resource.data.userId == uid() || resource.data.businessId == uid());
  allow delete: if isSignedIn() && resource.data.userId == uid();
}
```

---

### 4.8 🟠 Photo Loss on Logged-Out Create Listing
**Impact:** A guest who fills out the listing wizard (including uploading photos), then gets sent to login, loses all their uploaded photos because `sessionStorage` can't serialize `File` objects.

**File:** `src/pages/create-listing.js` — `saveDraft()` explicitly deletes file references

**Fix:** After successful auth in the listing wizard's auth step, re-prompt for photo upload (show a notice: "Vaše fotografije niso bile shranjene — prosimo, naložite jih znova") rather than silently losing them.

Or better: require login before starting the wizard (the `protected: false` on `/novi-oglas` was intentional to reduce friction, but costs data loss).

---

## 5. Backend Work (Aleksandar)

All items below require server-side implementation. The frontend already has the data structures, service stubs, and `TODO(backend)` markers in place.

### 5.1 Payment Integration (Stripe or similar)
**Priority:** CRITICAL — no revenue without this  
**Frontend stubs ready in:** `src/pages/create-listing.js` (promotion step), `src/services/auctionService.js` (packages), `src/services/listingService.js` (promotion object)

What to implement:
- Stripe Checkout session creation (Cloud Function)
- Webhook handler: on `payment_intent.succeeded` → update `listings/{id}.promotion` or `auctions/{id}.paidAmount`
- For boost tiers: set `promotion.tier`, `promotion.activatedAt`, `promotion.expiresAt` (= now + plan days)
- For auction packages: confirm `auctions/{id}.paidAmount` and set `status: 'active'`
- Store payment record in `payments/{paymentId}` (rules already written — write is backend-only)

Pricing (as defined in frontend):
- Free listing: €0
- Featured (Homepage): price defined in i18n key `cl_price_featured`
- Sponsored: price defined in i18n key `cl_price_sponsored`
- Auction 3 weeks: €4.99
- Auction 6 weeks: €9.99

---

### 5.2 Auction Auto-Close + Winner Selection
**Priority:** HIGH — auctions currently only close via manual admin action  
**Docs:** `docs/AUCTIONS_HANDOFF.md` has full spec

What to implement:
- Scheduled Cloud Function triggered at `auctions/{id}.endsAt`
- Sets `status: 'ended'`, `winnerId: currentBidderId`
- Checks reserve price — if `currentBidEur < reservePriceEur`, set `status: 'reserve_not_met'`
- Sends email to winner and seller (see 5.3)
- Marks listing as `status: 'sold'` if reserve was met

---

### 5.3 Transactional Emails
**Priority:** HIGH  
**Suggested tool:** Firebase Extension "Trigger Email" (uses SendGrid/Mailgun) or a custom Cloud Function

Emails needed:
| Trigger | Recipients | Template |
|---|---|---|
| Auction outbid | Previous highest bidder | "Presegli so vašo ponudbo na dražbi za [X]" |
| Auction alert threshold | Subscribers with `thresholdEur` set | "Cena je dosegla vaš prag" |
| Auction ended (won) | Winner | "Čestitke — zmagali ste na dražbi" |
| Auction ended (seller) | Seller | "Vaša dražba se je zaključila — kontaktirajte zmagovalca" |
| New booking | Business + customer | "Nova rezervacija" |
| Booking confirmed | Customer | "Rezervacija potrjena" |
| Registration | New user | "Dobrodošli na MojAvto.si" |
| Password reset | User | Firebase built-in (just configure template) |

The `auctionAlerts` collection (with `email`, `criteria`, `notify` prefs) is already written. The Cloud Function just needs to query it and send.

---

### 5.4 Webscraping — Parts Catalog
**Docs:** `docs/WEBSCRAPING_HANDOFF.md` has full spec  
**Status:** Frontend catalog (`/gume-in-deli`) reads from `partsCatalog` collection. Admin panel has source allowlist (`scrapingSources`). Scraper not yet built.

Architecture reminder:
- Cloud Function (or Cloud Run) scrapes approved domains from `scrapingSources` where `approved == true`
- Writes product records to `partsCatalog` using Admin SDK (bypasses Firestore rules)
- Frontend `catalogService.js` reads and displays them with `getLowestPrice()` comparison

---

### 5.5 Business Verification Workflow
As described in §3.2 — the backend needs to handle the actual verification step. Minimum: admin can write `businessTier: 'verified'` to the user doc via the Admin SDK or directly from the admin panel (the frontend admin panel already has Firestore write access for admins via rules).

---

## 6. Category & Taxonomy Gaps

### 6.1 Gospodarska Vozila — Missing Vehicle Types
All commercial subcategories have `vehicleTypes: []` — no body-type filtering exists.

**Suggested additions:**
- `dostavna` (vans): Box van, Refrigerated, Dropside, Minibus, Tipper
- `tovorna` (trucks): Box truck, Flatbed, Tipper, Curtainsider, Tanker, Car transporter
- `avtobus`: City bus, Intercity, Minibus, School bus
- `tovorne_prikolice`: Box trailer, Flatbed, Tanker, Car trailer, Low-loader
- `gradbena`: Excavator, Bulldozer, Crane, Concrete mixer, Dumper
- `kmetijska`: Tractor, Combine harvester, Sprayer, Baler, Forage harvester
- `vilicarji`: Counterbalance, Reach truck, Order picker, Pallet truck

**File to edit:** `src/data/categories.avto.js` — add `vehicleTypes` arrays to each `gospodarska` subcategory

### 6.2 Gospodarska Vozila — Hours Instead of km
Commercial vehicles like excavators, agricultural machinery, and forklifts track engine hours, not km — same as boats.

**Fix needed in:**
- `src/pages/oglasi.js` — when `category === 'gospodarska'` and subcategory is one of `gradbena, kmetijska, vilicarji`, show `engineHoursUsed` instead of `mileageKm` in cards
- `src/pages/listing.js` — same logic in `fmtKm()` call — check category before deciding unit
- `src/pages/create-listing.js` — show "Ure motorja" input instead of "Prevoženi km" for these subcategories

### 6.3 Moto — ATV/UTV and Snowmobiles Have No Vehicle Types
`atv_utv` and `motorne_sani` subcategories have `vehicleTypes: []`.

**Suggested for ATV/UTV:** Quad/ATV, Side-by-Side (UTV), Buggy  
**Suggested for Snowmobiles:** Trail, Performance, Touring, Utility, Youth

### 6.4 Prosti Čas — Missing Rental Support
The `prosti_cas` category has `hasRentalToggle: true` but none of the subcategories have `searchType: 'najem'` variants. Only `moto_najem` under moto handles rental properly.

**Fix:** Add rental listing type support for `avtodom` and `pocitniiska_prikolica` — these are commonly rented in Slovenia.

### 6.5 Navtika — itemType Consistency
Avto categories infer `itemType` from context; navtika categories have an explicit `itemType` field on each subcategory. This is two mental models in the same codebase.

**Recommendation:** Backfill explicit `itemType` onto avto subcategories so both portals follow the same pattern. Low urgency but makes future maintenance easier.

### 6.6 Gume in Deli — Missing Navtika Parts in VEHICLE_CATEGORIES
`src/data/partTypes.js` defines `VEHICLE_CATEGORIES` as `[avto, moto, gospodarska, prosti-cas]` — no `navtika` entry. The navtika gume-in-deli page works around this by hardcoding navtika categories, but the shared `partTypes.js` filter doesn't know about them.

**Fix:** Add `{ value: 'navtika', label: 'Plovila', icon: 'sailboat' }` to `VEHICLE_CATEGORIES` and add a `navtika` branch to `PART_TAXONOMY` with relevant part groups (engine parts, electrical, safety, navigation, hull/deck).

---

## 7. UX Flow Issues by Feature

### 7.1 Registration
| Issue | File | Fix |
|---|---|---|
| No email verification | `src/auth/auth.js` | Call `sendEmailVerification()` after registration |
| No password reset route | `src/router.js` | Add `/forgot-password` route + page |
| Login page links to dead `#/forgot-password` | `public/views/login.html:43` | Fix once route exists |
| Slovenian tax ID not validated | `src/auth/register.js` | Validate DDV format (SI + 8 digits) |
| Min password is 6 chars | `src/auth/register.js:139` | Increase to 8 |

### 7.2 Create Listing
| Issue | File | Fix |
|---|---|---|
| No edit flow | `src/pages/dashboard.js`, `create-listing.js` | See §3.5 |
| Photos lost if user logs in mid-wizard | `src/pages/create-listing.js` | Re-prompt for photos after auth step |
| Promotion tier shows prices but charges nothing | `src/pages/create-listing.js:renderPromotionStep` | Wire to Stripe (backend) |
| Auction package charges nothing | `src/services/listingService.js:271` | Wire to Stripe (backend) |

### 7.3 Listing Page
| Issue | File | Fix |
|---|---|---|
| No "Prijavi oglas" button | `src/pages/listing.js` | Add report button + modal (see §4.4) |
| Contact reveal is plain `tel:`/`mailto:` | `src/pages/listing.js:914` | Add view-count tracking on reveal; consider auth gate |
| No "Prodano" badge | `src/pages/listing.js` | Handle `status === 'sold'` in render |

### 7.4 Dashboard (Private Users)
| Issue | File | Fix |
|---|---|---|
| No edit button on listings | `src/pages/dashboard.js` | Add (see §3.5) |
| Bookings show mock data | `src/pages/dashboard.js` | Connect to Firestore `bookings` collection (see §4.7) |
| "Sold" deletes listing instead of marking | `src/services/listingService.js` | See §4.3 |

### 7.5 Admin Center
| Issue | File | Fix |
|---|---|---|
| No "Businesses" section | `src/pages/admin.js` | Add business verification UI (see §3.2) |
| Taxonomy changes only download JSON | `src/pages/admin.js` | Decision needed: keep JSON or move to Firestore-backed taxonomy |
| Admin role must be bootstrapped manually | `firestore.rules`, `src/auth/auth.js` | Document the bootstrap step; consider a seed script |
| `navItem('drazbe', 'featured', ...)` uses wrong icon key | `src/pages/admin.js:109` | Change to `navItem('drazbe', 'gavel', 'Dražbe')` |

### 7.6 B2B Dashboard
| Issue | File | Fix |
|---|---|---|
| All B2B collections have no Firestore rules | `firestore.rules` | See §3.1 |
| `isVerifiedBusiness()` always returns false | `src/core/b2bContext.js` | Blocked until §3.2 is done |
| Tire hotel and workshop are UI-only stubs | Multiple B2B pages | Backend CRUD needed (Aleksandar) |

### 7.7 Auction Flow
| Issue | File | Fix |
|---|---|---|
| Auctions never auto-close | `src/services/auctionService.js` | Scheduled Cloud Function (see §5.2) |
| No outbid emails | `src/services/auctionService.js` | Email Cloud Function (see §5.3) |
| Payment is a stub | `src/services/listingService.js:271` | Stripe integration (see §5.1) |
| Reserve price only checked client-side | `firestore.rules` | Fine for now; authoritative check at close (backend) |

---

## 8. Performance & Build

### 8.1 Large Taxonomy JSON Files
| File | Size | Impact |
|---|---|---|
| `public/json/brands_models_moto.json` | 907 kB | Loads on create-listing + oglasi for moto category |
| `public/json/brands_models_global.json` | 436 kB | Loads on create-listing + oglasi for avto |

**Fix:** Ensure your hosting (Firebase Hosting / CDN) serves these with `Content-Encoding: gzip` or `br`. Firebase Hosting does this automatically. Verify in browser DevTools → Network tab.

Long-term: split by first letter of brand (A-F.json, G-M.json, etc.) and load on demand when user selects a brand initial.

### 8.2 External CDN Dependencies (fragile)
These are loaded via CDN in `index.html` and will break the site if the CDN is unavailable:
- `unpkg.com/lucide@latest` — **unpinned version**, breaking changes possible
- `leaflet@1.9.4` from unpkg
- `chart.js@4.4.3` from jsdelivr
- `xlsx@0.18.5` from jsdelivr

**Fix:** `npm install lucide leaflet chart.js xlsx` and import them as npm packages in the build. Remove the `<script>` tags from `index.html`. This also eliminates 4 extra HTTP requests on every page load.

Pin lucide immediately: change `lucide@latest` to `lucide@0.x.x` (check current version) to prevent surprise breakages.

### 8.3 Sample Data Shipped to Production
The following files contain hardcoded mock listings that are merged into every feed:
- `src/data/sampleListings.js` (24 kB, ~15 mock cars)
- `src/data/sampleBoats.js` (12 kB)
- `src/data/sampleAuctions.js` (17 kB)
- `src/data/sampleCatalog.js` (9 kB)
- `src/data/businesses.js` (32 kB — mock businesses shown on map)

**Before launch:** Gate all sample data behind a `isDevelopment()` check or remove entirely and replace with real data. In `listingService.js`, `SAMPLE_LISTINGS` is merged with real Firestore listings on every `getListings()` call.

```javascript
// listingService.js — add this guard
const SAMPLE_LISTINGS = import.meta.env.DEV
    ? (PLATFORM.id === 'navtika' ? [...sampleBoats, ...sampleAuctionBoats] : [...sampleCars, ...sampleAuctionCars])
    : [];
```

### 8.4 Console Logs in Production
**Count:** 77 `console.log` calls across `src/`  
**Fix:** Add to `vite.config.js`:
```javascript
build: {
    minify: 'terser',
    terserOptions: {
        compress: { drop_console: true }
    }
}
```
Or use `esbuild` drop: `esbuild: { drop: ['console'] }`.

### 8.5 Stale Files to Delete Before Launch
- `public/json/brands_models_global.json.bak` — old backup, ~436 kB, served publicly
- `public/json/brands_models_moto.json.bak` — same
- `patch.js`, `patch3.js` in project root — leftover migration scripts
- `scratch/` directory — if it exists and contains dev notes

---

## 9. Security & Rules

### 9.1 `searchLogs` — Guest Write is Too Open
**Current rule:**
```javascript
match /searchLogs/{logId} {
  allow create: if true;   // any guest can write
  allow update: if true;   // any guest can increment counter
}
```
A bot could write millions of search log documents, inflating Firestore bills.

**Fix:** Rate-limit by requiring auth, or move search analytics to a Cloud Function that validates and aggregates before writing.

### 9.2 `auctionAlerts` — Guest Create is Intentional But Needs Validation
The rule `allow create: if true` allows any email to be subscribed without verification. A malicious actor could subscribe thousands of emails to auction alerts.

**Fix:** Add reCAPTCHA to the newsletter widget, or move the subscription write to a Cloud Function that validates the email format and rate-limits by IP.

### 9.3 Users Collection — Public Read
All user documents are publicly readable (`allow read: if true`). User docs contain `phone`, `email`, `region`, `companyDetails`.

**Fix:** Either restrict to authenticated users only, or split sensitive fields into a private subcollection `users/{uid}/private/profile`.

### 9.4 Storage Rules — Business Assets Missing
`storage.rules` only covers `listings/{userId}/`. Business logos, cover images, and gallery (uploaded via `b2bService.uploadBusinessAsset()`) go to `businesses/{userId}/` which falls into the catch-all deny.

**Fix — `storage.rules`:**
```
match /businesses/{userId}/{allPaths=**} {
  allow read: if true;
  allow create, update: if request.auth != null
    && request.auth.uid == userId
    && request.resource.size < 10 * 1024 * 1024
    && request.resource.contentType.matches('image/.*');
  allow delete: if request.auth != null && request.auth.uid == userId;
}
```

### 9.5 GDPR / Privacy
- Search queries are logged to `searchLogs` for every search including guests — needs a consent notice
- Auction alert email capture (anyone can subscribe any email) — needs consent checkbox
- Contact reveal (`tel:`/`mailto:`) exposes seller phone/email — consider showing only after user clicks "Prikaži kontakt" with a view counter

---

## 10. Feature Suggestions

These are not bugs — they are improvements that would significantly increase engagement, retention, and revenue.

### 10.1 Saved Searches + Email Alerts (HIGH VALUE)
The `savedSearches` Firestore collection and rules exist. No UI uses it.

What to build:
- "Shrani iskanje" button on the search page — saves current URL params
- User sees saved searches in dashboard/profile
- Backend Cloud Function checks new listings against saved search criteria and emails matches

### 10.2 In-App Messaging (HIGH VALUE)
Currently sellers expose their phone/email directly. In-app messaging:
- Keeps users on platform
- Gives MojAvto.si a dataset on lead quality
- Enables spam prevention
- Enables seller response rate metrics

Architecture: `messages/{conversationId}/messages/{messageId}` subcollection, similar to how `auctions/{id}/bids/{bidId}` works.

### 10.3 Price History Chart on Listing Page
You already have `valuationScore.js` and price rating badges. Add a price history chart showing:
- How long the listing has been posted
- Price changes over time (if seller edits the price)

Store price change history in the listing doc as an array: `priceHistory: [{price, changedAt}]`.

### 10.4 VIN Decode
On the create-listing "basic info" step, add a VIN input field. Hit a VIN decode API (e.g., NHTSA free API for US, or a European equivalent) to auto-fill: make, model, year, fuel type, engine. Reduces friction for dealers doing bulk listings.

### 10.5 Seller Analytics Card
In the dashboard, surface the view stats that are already being tracked (`viewCount`, `viewDaily` on each listing):
- "Vaš oglas si je danes ogledalo X oseb"
- Sparkline chart of views last 7 days
- Compare to similar listings ("Vaš oglas prejema manj ogledov kot povprečje za to kategorijo")

### 10.6 Financing Calculator
The `leaseAvailable` and `leasingConditions` fields are collected but never displayed in a useful way.

Add a "Mesečni obrok" calculator on the listing page:
- Inputs: deposit (%), loan term (months), interest rate
- Output: estimated monthly payment
- Show as a collapsible card under the price

### 10.7 Dealer Storefronts
`business-profile.js` exists but shows only a static profile. Turn it into a full storefront:
- All active listings from that dealer in a grid
- Dealer stats: average response time, review score, years on platform
- "Pošlji povpraševanje" contact form

URL structure: `#/prodajalec/autohaus-maribor` (slug from company name)

### 10.8 Compare Tool Improvements
The compare feature (`/primerjava`) works but comparison items come only from localStorage. Improvements:
- Share comparison via URL (encode listing IDs in query params)
- Add TCO comparison (total cost of ownership) using `tcoEngine.js` which already exists
- Highlight best/worst value in each row

### 10.9 "Kolikšna je vrednost mojega vozila?" Landing Flow
`/oceni-vrednost` (evaluate) exists. Make it a proper lead generation funnel:
1. User enters make/model/year/km/condition
2. System shows estimated price range (from `valuationScore.js` + existing listings data)
3. CTA: "Prodajte ga takoj — objavi oglas brezplačno"
4. Pre-fill the create-listing wizard with the data they just entered

---

## 11. File Map — Where Everything Lives

| Feature | Frontend | Backend/Service | Rules |
|---|---|---|---|
| Registration | `src/auth/register.js`, `public/views/register.html` | `src/auth/auth.js` | `users/{userId}` |
| Login | `src/auth/login.js`, `public/views/login.html` | `src/auth/auth.js` | — |
| Password reset | ❌ MISSING | Firebase Auth built-in | — |
| Create listing | `src/pages/create-listing.js` | `src/services/listingService.js` | `listings/{listingId}` |
| Edit listing | ❌ MISSING UI | `listingService.updateListing()` exists | `listings/{listingId}` |
| Listings feed | `src/pages/oglasi.js` / `oglasi.navtika.js` | `listingService.getListings()` | `listings/{listingId}` |
| Search/filter | `src/pages/advanced-search.js` / `.navtika.js` | client-side filter | `listings/{listingId}` |
| Listing detail | `src/pages/listing.js` / `listing.navtika.js` | `listingService.getListingById()` | `listings/{listingId}` |
| Auctions board | `src/pages/drazbe.js` | `auctionService.getAuction()` | `auctions/{listingId}` |
| Auction detail | `src/pages/auction-listing.js` | `auctionService.placeBid()` | `auctions/{listingId}/bids/{bidId}` |
| Dashboard | `src/pages/dashboard.js` | `listingService.getUserListings()` | `listings/{listingId}` |
| Profile / Garage | `src/pages/profile.js` | `garageService.js` | `users/{uid}/vehicles/{id}`, `users/{uid}/favourites/{id}` |
| Liked listings | `src/pages/profile.js` ✅ ADDED | `garageService.getFavourites()` | `users/{uid}/favourites/{id}` ✅ ADDED |
| Admin panel | `src/pages/admin.js` | `src/services/adminService.js` | `auditLog`, `reports`, `siteConfig`, etc. |
| B2B dashboard | `src/pages/b2b-dashboard.js` | `src/services/b2bService.js` | ❌ MISSING for businesses/inventory/leads/tire_storage |
| B2B inventory | `src/pages/b2b-inventory.js` | `b2bService.listInventory()` | ❌ MISSING |
| B2B reservations | `src/pages/b2b-reservations.js` | `b2bService.listMyBookings()` | ❌ MISSING for bookings |
| B2B tire hotel | `src/pages/b2b-tire-hotel.js` | `b2bService.listTireStorage()` | `tire_orders/{orderId}` ✅ |
| Bulk import | `src/pages/bulk-import.js` | `listingService.createListing()` | `listings/{listingId}` |
| Gume in deli | `src/pages/gume-in-deli.js` | `catalogService.js` | `partsCatalog/{productId}` |
| Map / Book service | `src/pages/map.js`, `booking.js` | `bookingService.js` | ❌ MISSING for bookings |
| Business profile | `src/pages/business-profile.js` | `businessService.js` | `businesses/{userId}` ❌ MISSING |
| TCO | `src/components/TotalCostOfOwnership.jsx` | `src/services/tcoEngine.js` | — |
| Taxonomy | `src/data/categories.*.js`, `public/json/*.json` | `adminService.importTaxonomyRows()` | `taxonomy_proposals/{id}` ❌ MISSING |
| Platform config | `src/config/platform.js` | `vite.config.js` VITE_PLATFORM | — |

---

*This document covers the state of the codebase as of 2026-06-12. Update it as items are completed. For auction-specific backend details see `docs/AUCTIONS_HANDOFF.md`. For webscraping see `docs/WEBSCRAPING_HANDOFF.md`. For navtika deployment see `docs/DEPLOY_MOJANAVTIKA.md`.*
