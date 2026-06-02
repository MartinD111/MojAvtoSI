# Webscraping Backend — Handoff

> **Namen tega dokumenta:** ob naslednjem pogovoru (ko se lotimo backenda) je tukaj zapisano
> točno KAJ je že zgrajeno na frontendu in KAJ je še potrebno za delujoč avtomatski zajem cen
> (ceneje.si-slog) za stran **Gume in deli**.

Datum: 2026-06-02 · Avtor konteksta: Claude (MojAvto.si)

---

## 1. Cilj

Avtomatsko polniti Firestore zbirko **`partsCatalog`** s ponudbami trgovin, tako da stran
`#/gume-in-deli` prikazuje **najnižjo ceno ("od X€")** in povezave do trgovin, kjer se izdelek kupi.
Zajemamo **samo** domene, ki so v zbirki **`scrapingSources`** označene z `approved == true`
(lastnik ima zanje pisno dovoljenje).

Trenutno (do backenda) se katalog polni z **mock podatki** (`src/data/sampleCatalog.js`) in
**ročno** preko admin sekcije *Katalog izdelkov*.

---

## 2. Kaj je ŽE zgrajeno na frontendu (ne spreminjati shem)

### Podatkovni model

**`partsCatalog/{id}`** — en dokument = en izdelek (del ali guma):
```js
{
  itemType: 'part' | 'tire',
  vehicleCategory: 'avto' | 'moto' | 'gospodarska' | 'prosti-cas',
  title: string,
  brand: string,
  imageUrl: string,
  attributes: {
    // tire:  size:'205/55 R16', width:205, aspect:55, rim:16, season:'letne'|'zimske'|'celoletne', loadIndex, speedRating
    // part:  partGroup:'zavore', partType:'ploscice', oemNumber, compatibility:[{make,model,yearFrom,yearTo}]
  },
  offers: [
    { shop:'Pnevmatike24', domain:'pnevmatike24.si', price:89, currency:'EUR',
      url:'https://...', inStock:true, lastSeenAt:<ts>, sourceId:'<scrapingSources id>' }
  ],
  lowestPrice: number,   // = min(offers[].price)  — PREDRAČUNANO ob zapisu
  offerCount: number,    // = offers.length        — PREDRAČUNANO ob zapisu
  status: 'active' | 'hidden',
  ingestSource: 'mock' | 'manual' | 'scraper',   // diskriminator izvora
  createdAt, updatedAt, lastAggregatedAt
}
```

**`scrapingSources/{id}`** — allowlist odobrenih domen:
```js
{
  domain: 'rezervni-deli.si',   // kanonični host (lowercase, brez http/www/poti)
  name: 'Rezervni Deli d.o.o.',
  baseUrl: 'https://www.rezervni-deli.si',
  category: 'deli' | 'gume' | 'oboje',
  approved: boolean,            // ← KLJUČNO: backend zajema samo approved == true
  permissionNote: string,       // dokazilo/opomba o dovoljenju
  robotsAllowed: boolean,
  status: 'active' | 'paused',
  lastScrapedAt: <ts|null>,
  lastScrapeStatus: 'ok' | 'error' | null,
  createdAt, updatedAt
}
```

### Datoteke (frontend + servis) — že obstajajo

| Datoteka | Vloga |
|---|---|
| `src/services/catalogService.js` | Javni read: `getCatalogProducts({itemType, vehicleCategory})`, `getCatalogProductById(id)`, `getLowestPrice(p)`. **Zliva** Firestore `partsCatalog` + mock `SAMPLE_CATALOG`. |
| `src/data/sampleCatalog.js` | MOCK izdelki (zamenjati/izprazniti, ko backend polni resnične). |
| `src/services/adminService.js` | CRUD: `getScrapingSources / createScrapingSource / updateScrapingSource / deleteScrapingSource / getApprovedScrapingDomains`, `getCatalogProductsAdmin / createCatalogProduct / updateCatalogProduct / deleteCatalogProduct`. `create/updateScrapingSource` že **normalizira domeno**; `create/updateCatalogProduct` že **predračuna `lowestPrice`/`offerCount`**. |
| `src/pages/admin.js` | Sekciji **Webscraping** (`renderWebscraping`) in **Katalog izdelkov** (`renderCatalog`) z modali + audit logom. |
| `src/pages/gume-in-deli.js` | Iskalnik — bere peer oglase (`getListings()`) + katalog (`getCatalogProducts`). |
| `src/pages/catalog-product.js` | Detajl izdelka — `od X€` + zunanje povezave (`rel="noopener nofollow sponsored"`). |
| `src/data/partTypes.js` | Taksonomija sklopov/vrst delov po vrsti vozila — backend naj se preslika na iste `partGroup`/`partType` ključe. |

### Firestore varnostna pravila — že dodano (`firestore.rules`)
```
match /partsCatalog/{id}    { allow read: if true;  allow write: if isEditor(); }
match /scrapingSources/{id} { allow read, write: if isAdmin(); }
```
> Backend bo pisal preko **Admin SDK (service account)**, ki pravila obide — client ostane read-only na `partsCatalog`.

---

## 3. Kaj je ŠE POTREBNO (backend) — to gradimo naslednjič

### 3.1 Firebase Cloud Functions projekt (`functions/`)
- Inicializacija: `firebase init functions` (Node 20, ESM ali CJS).
- **Zahteva Firebase Blaze plan** (Functions + scheduler + odhodni network za fetch).
- Service account za Admin SDK (`firebase-admin`) — pisanje v `partsCatalog` obide pravila.

### 3.2 Dve funkciji
1. **Scheduled** — npr. `exports.scrapeCatalog = onSchedule('every 24 hours', …)`.
2. **Callable** — `exports.runScrapeNow = onCall(…)` za gumb "Zaženi zdaj" v admin Webscraping sekciji
   (gumb je treba še dodati v `renderWebscraping`, kliče funkcijo s `sourceId`).

### 3.3 Potek zajema (oba klica si delita kodo)
1. Preberi `scrapingSources` kjer `approved == true && status == 'active'`.
   (Helper `getApprovedScrapingDomains()` že obstaja na servisu — backend naj naredi enako poizvedbo.)
2. Za vsako domeno: preveri `robots.txt` / `robotsAllowed` + spoštuj `permissionNote`.
   **Zavrni vsako domeno, ki ni na allowlistu.**
3. Fetch + parse: **Cheerio** za statičen HTML; **Playwright/Puppeteer** (Cloud Run container) za JS-rendered strani.
4. **Per-domain adapter**: `functions/scrapers/<domain>.js` (en modul na trgovino, izbran po `domain`).
   Vsak adapter vrne normalizirano: `{ title, brand, attributes, price, url, inStock }`.
5. **Matching** na obstoječ `partsCatalog` izdelek:
   - gume: po `attributes.size` + `brand`,
   - deli: po `attributes.oemNumber` (ali `partGroup`+`partType`+`brand`).
   Če ni zadetka → ustvari nov izdelek.
6. **Upsert ponudbe** v `offers[]` po `domain` (zamenjaj obstoječo ponudbo iste domene), nato
   **predračunaj `lowestPrice` in `offerCount`**, nastavi `ingestSource:'scraper'`, `lastAggregatedAt`.
7. Posodobi vir: `scrapingSources/{id}.lastScrapedAt` + `lastScrapeStatus`.

### 3.4 Po vzpostavitvi
- Izprazni / onemogoči `src/data/sampleCatalog.js` (ali pusti kot demo fallback — `catalogService` ju zliva).
- Dodaj gumb "Zaženi zdaj" (callable `runScrapeNow`) v `renderWebscraping` tabelo (stolpec Akcije).
- (Opcijsko) Če `offers[]` na izdelek naraste, premakni na subzbirko `partsCatalog/{id}/offers`.

---

## 4. Kontrolni seznam za začetek naslednjega pogovora
- [ ] Potrdi Firebase Blaze plan je aktiven.
- [ ] `firebase init functions` + `firebase-admin`, `cheerio` (+ Playwright po potrebi).
- [ ] Napiši 1 adapter za prvo odobreno trgovino (npr. iz `scrapingSources`).
- [ ] Scheduled + callable funkcija z allowlist enforcementom.
- [ ] Test: en zajem zapiše/posodobi `partsCatalog`, frontend `#/gume-in-deli` pokaže "od X€" iz resničnih podatkov.
- [ ] Posodobi `firestore.indexes.json`, če bodo potrebni indeksi za poizvedbe kataloga.

**Pomembno:** frontend je agnostičen do izvora ponudb (`ingestSource`), zato backend ne zahteva
sprememb na frontendu — je "drop-in writer".
