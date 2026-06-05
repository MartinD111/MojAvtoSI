# Deploy — MojAvto.si + MojaNavtika.si (multi-site, en Firebase projekt)

Oba portala se gradita iz iste kode prek `VITE_PLATFORM` in deployata kot dva
ločena Firebase Hosting sita znotraj **istega** projekta `mojavto-64b50`
(deljen Auth → isti račun deluje na obeh domenah).

## Enkratna nastavitev

1. **Ustvari drugi Hosting site** (prvi `mojavto-64b50` že obstaja):
   ```bash
   firebase hosting:sites:create mojanavtika
   ```
   Če izbereš drugo ime sita, posodobi `.firebaserc` → `targets.mojavto-64b50.hosting.navtika`.

2. **Poveži deploy targete** (ujema se z `.firebaserc`):
   ```bash
   firebase target:apply hosting avto    mojavto-64b50
   firebase target:apply hosting navtika mojanavtika
   ```

3. **Custom domeni** (Firebase Console → Hosting):
   - `mojavto.si`      → site `mojavto-64b50`
   - `mojanavtika.si`  → site `mojanavtika`

4. **Authorized domains za Auth** (Console → Authentication → Settings):
   dodaj `mojavto.si` in `mojanavtika.si` (deljen `authDomain` = mojavto-64b50.firebaseapp.com).

## Build & deploy

```bash
npm run build:all                      # zgradi dist-avto/ + dist-navtika/
firebase deploy --only hosting:avto
firebase deploy --only hosting:navtika
# ali oboje hkrati:
firebase deploy --only hosting
```

## Lokalni razvoj

```bash
npm run dev            # MojAvto    (VITE_PLATFORM=avto, privzeto)
npm run dev:navtika    # MojaNavtika (VITE_PLATFORM=navtika)
```

## Kako platforma deluje
- `src/config/platform.js` — edini vir resnice (brand, barve, podjetje, B2B vloge).
- `VITE_PLATFORM` (build-time, prek `cross-env`) izbere platformo; `vite.config.js`
  injicira vrednost in nastavi `outDir` `dist-<platform>`.
- Taksonomija: `categories.js` re-exporta `categories.avto.js` / `categories.navtika.js`.
- Jezik: `public/lang/sl.json` + overlay `public/lang/sl.navtika.json` (i18n ga zlije).
- View variante: router najprej poskusi `views/<view>.<platform>.html`, sicer skupni view.
