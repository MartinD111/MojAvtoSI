# Dražbe (Auctions) Backend — Handoff

> **Namen:** ob naslednjem pogovoru (ko se lotimo backenda) je tukaj zapisano točno KAJ je že
> zgrajeno na frontendu in KAJ je še potrebno za **delujoče dražbe** (samodejno zaprtje, e-pošta,
> plačila, varna validacija ponudb, čiščenje podpisov).

Datum: 2026-06-09 · Avtor konteksta: Claude (MojAvto.si)

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
