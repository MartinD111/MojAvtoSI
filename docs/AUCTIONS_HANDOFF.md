# Dražbe (Auctions) Backend — Handoff

> **Namen:** ob naslednjem pogovoru (ko se lotimo backenda) je tukaj zapisano točno KAJ je že
> zgrajeno na frontendu in KAJ je še potrebno za **delujoče dražbe** (samodejno zaprtje, e-pošta,
> plačila, varna validacija ponudb, čiščenje podpisov).

Datum: 2026-06-09 · Avtor konteksta: Claude (MojAvto.si)

---

## 0. POSODOBITEV 2026-06-15 — model AutoHub + strežniška logika

> Ta razdelek **nadgrajuje** vse spodaj. Ekonomika in tipi dražb so spremenjeni (zamenjava, ne
> dodatek), backend pa zdaj **obstaja** v `server/` (Supabase + Fastify + Stripe Connect) — ni več
> samo Firestore stub. Razdelki 1–4 spodaj so zgodovinski kontekst (stari Firestore model).

### 0.1 Poslovni model (AutoHub)
- **Trajanje**: 7 dni brezplačno (privzeto) ali 10 dni za **4,99 €**.
- **Obvezna prodaja** (pravno zavezujoča pogodba): doplačilo **49,99 €** — na voljo pri vseh tipih.
- **Gotovinsko plačilo ob prevzemu**: samo skupaj z obvezno prodajo; platforma ne sodeluje v denarnem toku za ceno vozila.
- **Kupčeva premija**: **3 % končne cene**, ki jo plača **kupec** (ne prodajalec) — plačilo za uporabo
  tehnične platforme, ne provizija za posredovanje. (Staro 1 % prodajalčevo provizijo smo **odstranili**.)
- **Tipi dražb**: `silent` (tiha, skrite ponudbe + skrita rezervna cena), `prebid` (pred-dražba → živa
  faza), `live` (živa). Stari `regular` → `live`.
- **Anti-sniping**: ponudba v zadnjih **2 min** podaljša dražbo za **2 min** (prej 3/5). Velja le v živi fazi.

### 0.2 Izvzetje iz sporov (A/B/C)
- **A — Pogodba o obvezni prodaji** (med kupcem in prodajalcem): AutoHub ni stranka, spori se rešujejo
  neposredno/po sodni poti. Generira jo `src/utils/auctionContract.js → buildAuctionContract()` v 3
  scenarijih (`informative` / `binding` / `cash`); klavzula o neodgovornosti (`AUTOHUB_DISCLAIMER_LINES`)
  je v **vseh**.
- **B — Pogoji uporabe**: AutoHub = tehnična platforma, ne pregleduje/verificira/jamči, ni stranka,
  3 % = plačilo za platformo. (Besedilo ToS je še TODO — pravni pregled.)
- **C — Denarni tok (escrow + 48 h)**: kupec plača (cena + 3 %) → drži se na platformi (escrow) → po
  **48 h** se cena samodejno sprosti prodajalcu, razen če kupec sproži uradni spor (zamrzne sprostitev).
  Platforma nikoli ne razsoja. Privzeto stanje = "denar gre prodajalcu".

### 0.3 Kaj je ZDAJ implementirano (server/ + supabase/)
- **Podatkovni model**: `supabase/auctions_autohub.sql` razširi `public.auctions` (auction_type,
  current_phase, reserve_price, binding_contract, cash_allowed, signature_required,
  buyer_premium_percent, listing_fee, duration_days, prebid_ends_at, escrow_release_at, sold, …),
  doda **`public.auction_payments`** (escrow knjiga) in `profiles.stripe_account_id`. **Zaženi zadnjega.**
- **F5 — strežniška validacija ponudb**: `place_bid(uuid, numeric)` (zamenja osnovnega iz `security.sql`)
  — row-lock `FOR UPDATE`, pravila po tipu, +2 min anti-snip, identiteta iz `auth.uid()`.
  Route: `POST /api/auctions/:id/bids` (`server/src/routes/auctions.ts`, kliče kot prijavljeni uporabnik).
- **F1 — samodejno zaprtje**: `server/src/jobs/closeAuctions.ts` (`runCloseDueAuctions`) — pre-bid→live
  prehod (+2 h), določitev zmagovalca po tipu (silent preveri rezervo), ustvari Stripe **PaymentIntent**
  (`application` na platformo; pri gotovini samo 3 % premija) in vrstico v `auction_payments`.
- **Escrow 48 h**: `server/src/jobs/releaseEscrow.ts` (`runReleaseDueEscrow`) — sprosti ceno na
  prodajalčev Connect račun (`stripe.transfers`), 3 % ostane platformi; preskoči sporne vrstice.
- **Stripe Connect**: `server/src/lib/stripe.ts` — `createAuctionPaymentIntent`, `releasePriceToSeller`,
  `createListingFeePaymentIntent` (vse v centih, idempotentni ključi).
- **Webhook**: `server/src/routes/webhooks.ts` — `payment_intent.succeeded` (kind=`auction` → status
  `paid` + začne 48 h okno; kind=`auction_listing_fee` → listing_fee_paid), `charge.dispute.created`
  (zamrzne escrow). Edini pisec statusa `paid` (idempotenten na Stripe event id).
- **Cron**: `POST /internal/cron/close-auctions` in `/internal/cron/release-escrow`, zaščiteni z
  `X-Cron-Secret` (env `CRON_SECRET`). Sproži ju zunanji razporejevalnik (EventBridge / Cloudflare cron).
- **Frontend**: model usklajen — `src/services/auctionService.js` (BUYER_PREMIUM_PCT, calcListingFee,
  normalizeAuctionType, resolveAuctionOutcome, advancePrebidPhase, 2 min anti-snip), create-listing korak
  (3 tipi, obvezna prodaja/gotovina, 7/10 dni, "Kmalu na voljo" značke), `/drazbe` filtri (tip/status/
  obvezna prodaja/gotovina) + značke na karticah, demo podatki v `src/data/sampleAuctions.js`.

### 0.4 Kaj še manjka (kredenciali + dokončanje migracije)
1. **Zagnati `supabase/auctions_autohub.sql`** na hosted projektu (za `schema→policies→security`).
2. **Stripe**: nastaviti `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`; onboarding prodajalcev v Stripe
   **Connect** (Express) → shraniti `profiles.stripe_account_id` (sicer escrow ostane "pending" do onboardinga).
3. **Razporejevalnik**: EventBridge/Cloudflare cron → POST na oba `/internal/cron/*` z `CRON_SECRET`
   (priporočeno na ~1 min za close, ~5 min za escrow).
4. **Frontend bidding migracija**: `auction-listing.js` še oddaja ponudbe prek Firestore; preklopiti na
   `POST /api/auctions/:id/bids` (in branje na Supabase realtime), ko bo migracija aktivna.
5. **E-pošta** (outbid / prag / kmalu konec / zmagovalec) prek Resend (F2 spodaj) — še TODO.
6. **Brisanje podpisov** ob zaprtju (zasebnost, F4) — še TODO.
7. **ToS besedilo** (razdelek B) — pravni pregled.

---

## 1. Stanje

Frontend dražb je **v celoti zgrajen** in deluje na obeh platformah (avto + navtika):

- **Postavitev dražbe** — v `create-listing` se izbere *Dražba* (paket 3 tedne / 4,99 € ali
  6 tednov / 9,99 €), začetna cena, neobvezna minimalna cena (reserve) in **podpis zaveze k prodaji**
  (podpis s prstom ali natisni & pošlji PDF).
- **Iskanje** — dva pilla *Išči oglase* / *Išči dražbe* na domači strani in na `#/iskanje`.
- **Seznam dražb** — `#/drazbe` (`src/pages/drazbe.js`) z odštevalnikom in trenutno ponudbo na karticah.
- **Stran dražbe** — `#/drazba?id=` (`src/pages/auction-listing.js`) — enak videz kot navadni oglas
  (uporablja `renderListing`), plus odštevalnik, graf cene, oddaja ponudbe + pogodba kupca, zgodovina
  ponudb (vse v živo prek `onSnapshot`).
- **Admin** — sekcija *Dražbe* (seznam, pavza/aktivacija, ročno zaprtje, ogled ponudb, newsletter prijave).

**Kar se ŠE NE zgodi (mock/stub — to je vaša naloga):**
1. Dražba se **ne zapre sama** ob izteku (`endsAt`) — zdaj jo zapre admin ročno.
2. **E-pošta se ne pošilja** (outbid, prag cene, kmalu konec, zmagovalec, newsletter).
3. **Plačilo paketa se ne zaračuna** (`paidAmount` je zabeležen, `paymentRef` ostane `null`).
4. Validacija ponudb je **best-effort na klientu + Firestore rules** — ni strežniško avtoritativna.
5. **Podpisi se ne brišejo** samodejno ob koncu dražbe (zahteva zasebnosti).

---

## 2. Podatkovni model (NE spreminjati shem)

### `auctions/{listingId}` — eno na dražbeni oglas (doc id === listing id)
```js
{
  listingId, sellerId,
  status: 'active' | 'paused' | 'ended' | 'cancelled',
  startPriceEur, reservePriceEur,        // reserve je lahko null
  currentBidEur, currentBidderId,
  bidCount, bidderCount,
  durationWeeks, startsAt, endsAt,        // Firestore Timestamp
  sellerContract: { type:'sign'|'print', signatureData:<dataURL|null>, signedAt },
  packageId: 'auction3w'|'auction6w', paidAmount, paymentRef:null,  // plačilni stub
  priceSeries: [{ t:<ms>, amount, bidders }],   // denormalizirano za graf (max ~200)
  winnerId,
  createdAt, updatedAt
}
```

### `auctions/{listingId}/bids/{bidId}`
```js
{
  bidderId, bidderName, amountEur,
  contract: { type:'sign'|'print', signatureData:<dataURL|null>, signedAt },
  notify:   { onOutbid:boolean, thresholdEur:number|null },
  createdAt
}
```

### `auctionAlerts/{id}` — newsletter prijave
```js
{ email, criteria:{ interest, ... }, userId|null, active:true, createdAt }
```

### Listing doc (`listings/{id}`) dražbe ima dodatno
```js
{ entryType:'auction', auctionDurationWeeks, startPriceEur, endsAt, priceEur:<=startPrice> }
```

Frontend kode/funkcije: `src/services/auctionService.js` (createAuction, placeBid, subscribe*,
createAuctionAlert, forceCloseAuction), `src/services/adminService.js` (getAdminAuctions, …).

---

## 3. Cloud Functions, ki jih je treba zgraditi

> Funkcije pišejo prek **Admin SDK** (obidejo Firestore rules). Postaviti `functions/` mapo
> (zaenkrat je še ni — projekt je client-only). Firebase projekt: `mojavto-64b50`.

### F1 — `closeAuctionsScheduled` (scheduled, npr. vsako minuto)
Poišči `auctions` kjer `status=='active' && endsAt <= now`. Za vsako:
- nastavi `status='ended'`, `winnerId = currentBidderId`;
- (opcijsko) zapiši zmago v `users/{winnerId}` ali ločeno zbirko;
- sproži F2 (zmagovalec + prodajalec) in F4 (čiščenje podpisov).

### F2 — `auctionEmails` (Firestore trigger + scheduled)
SendGrid ali Firebase "Trigger Email" razširitev. E-pošte:
- **outbid** — ob `onWrite` na `bids`, prejšnjemu vodilnemu, če je imel `notify.onOutbid`;
- **prag cene** — komurkoli z `notify.thresholdEur` ko `currentBidEur >= threshold`;
- **kmalu konec** — scheduled, 24h in 1h pred `endsAt`, vsem ponudnikom;
- **zmagovalec / prodajalec** — ob zaprtju (iz F1);
- **newsletter** — digest novih dražb tistim v `auctionAlerts`, ki ustrezajo `criteria`.

### F3 — `auctionCheckout` (callable) + `stripeWebhook` (https)
Stripe za paket (3 tedne 4,99 € / 6 tednov 9,99 €). Ob plačilu zapiši v `payments/{id}` in
nastavi `auctions/{id}.paymentRef`. Po želji: dražbo objavi/aktiviraj šele po potrjenem plačilu.

### F4 — `pruneAuctionSignatures` (ob zaprtju / scheduled)
**Zahteva zasebnosti.** Ob koncu dražbe izprazni `sellerContract.signatureData` in vsem
`bids[].contract.signatureData` nastavi `null`. Hranimo le še `type` + `signedAt` kot dokazilo.

### F5 — (priporočeno) `validateBid` strežniško
Trenutno integriteto ponudb varujejo Firestore rules (nova ponudba mora preseči staro, bidCount+1).
Za zanesljivost premakni `placeBid` logiko v callable funkcijo z avtoritativno validacijo
(min. korak `MIN_BID_INCREMENT = 50 €`, čas, anti-sniping podaljšanje, ipd.).

---

## 4. Firestore rules — že dodano (za referenco)
`firestore.rules`: bloki `auctions/{id}`, `auctions/{id}/bids/{bid}`, `auctionAlerts/{id}`.
Indeks: `listings (entryType, status, endsAt)` v `firestore.indexes.json`.

Ko bo F5 (strežniška validacija) na mestu, **zaostri** update-rule na `auctions/{id}` tako, da
neposredne klientske posodobitve `currentBid*`/`bidCount` niso več dovoljene (samo Admin SDK).
