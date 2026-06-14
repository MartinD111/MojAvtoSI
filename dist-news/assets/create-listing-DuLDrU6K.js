const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./listingService-B896QzBR.js","./listingService-CHYpX_DS.js","./preload-helper-kNaey6uv.js","./firebase-D04QZ5MM.js","./index.esm-DejIl58p.js","./platform-BvWcB7wr.js","./storageKeys-BraFEh3o.js","./sampleListings-CTAGWO7V.js"])))=>i.map(i=>d[i]);
import{t as e}from"./platform-BvWcB7wr.js";import{a as t,t as n}from"./i18n-BZd20ht-.js";import{f as r,l as i,n as a,p as o,u as s}from"./firebase-D04QZ5MM.js";import{t as c}from"./auth-4RmUyM8I.js";import{t as l}from"./preload-helper-kNaey6uv.js";import{C as u,S as d,d as f,i as p,p as m,t as h,x as g}from"./listingService-CHYpX_DS.js";import{n as _,t as v}from"./inputFormatters-DImaxELq.js";import{n as y,t as b}from"./customSelect-DV25eGXQ.js";import{n as x}from"./bodyType-D6Z4hc39.js";import{n as S,r as ee,t as te}from"./auctionContract-DoTArium.js";import{n as C}from"./viewport-DsxeKZ-2.js";import{a as w,c as ne,i as re,l as ie,n as ae,o as oe,r as se,s as ce,t as le}from"./equipmentTypes-8rzQ742n.js";import{n as ue,t as de}from"./locationData-Bn4s6MJf.js";var fe=[`Petrol`,`Dizel`,`Hibrid`,`Elektrika`,`LPG`,`CNG`,`Vodik`],pe={petrol:`Petrol`,bencin:`Petrol`,gasoline:`Petrol`,benzin:`Petrol`,diesel:`Dizel`,dizel:`Dizel`,tdi:`Dizel`,hdi:`Dizel`,hybrid:`Hibrid`,hibrid:`Hibrid`,phev:`Hibrid`,mhev:`Hibrid`,electric:`Elektrika`,elektrika:`Elektrika`,ev:`Elektrika`,bev:`Elektrika`,električni:`Elektrika`,lpg:`LPG`,avtoplin:`LPG`,plin:`LPG`,cng:`CNG`,metan:`CNG`,vodik:`Vodik`,hydrogen:`Vodik`},me=[`Ročni`,`Avtomatski`,`Polavtomatski`],he={manual:`Ročni`,ročni:`Ročni`,rocni:`Ročni`,automatic:`Avtomatski`,avtomatski:`Avtomatski`,auto:`Avtomatski`,dsg:`Avtomatski`,cvt:`Avtomatski`,tiptronic:`Avtomatski`,semi:`Polavtomatski`,polavtomatski:`Polavtomatski`,semiautomatic:`Polavtomatski`},ge=[`FWD (sprednji)`,`RWD (zadnji)`,`AWD / 4x4`],_e={fwd:`FWD (sprednji)`,sprednji:`FWD (sprednji)`,front:`FWD (sprednji)`,rwd:`RWD (zadnji)`,zadnji:`RWD (zadnji)`,rear:`RWD (zadnji)`,awd:`AWD / 4x4`,"4x4":`AWD / 4x4`,"4wd":`AWD / 4x4`,quattro:`AWD / 4x4`,štirikolesni:`AWD / 4x4`,stirikolesni:`AWD / 4x4`},ve=[`Rabljeno`,`Novo`,`Razstavno vozilo`,`Starodobnik`,`Za dele`],ye={used:`Rabljeno`,rabljeno:`Rabljeno`,new:`Novo`,novo:`Novo`,demo:`Razstavno vozilo`,razstavno:`Razstavno vozilo`,classic:`Starodobnik`,oldtimer:`Starodobnik`,starodobnik:`Starodobnik`,"za dele":`Za dele`,parts:`Za dele`,damaged:`Za dele`},be=[`solid`,`metallic`,`matte`,`pearl`],xe=[`Bela`,`Črna`,`Siva`,`Srebrna`,`Modra`,`Rdeča`,`Zelena`,`Rumena`,`Rjava`,`Oranžna`,`Vijolična`,`Zlata`,`Bronasta`,`Druga`],Se=[`Euro 4`,`Euro 5`,`Euro 6`,`Euro 6d`,`Euro 6d-temp`],Ce=[`I3`,`I4`,`V6`,`V8`,`V10`,`V12`,`W12`,`W16`,`Electric`],we={avto:{label:`Osebni avtomobil`,bodyTypes:[[`Limuzina`,`Limuzina`],[`Terensko`,`SUV / terensko`],[`Karavan`,`Karavan`],[`Kombilimuzina`,`Kombilimuzina (hatchback)`],[`Kabriolet`,`Kabriolet`],[`Coupe`,`Coupe`],[`Enoprostorec`,`Enoprostorec (van)`],[`Pick-up`,`Pick-up`],[`Oldtimer`,`Oldtimer / starodobnik`]]},moto:{label:`Motorno kolo`,bodyTypes:[[`SportniMotor`,`Športni motor`],[`SportniTourer`,`Športni tourer`],[`Adventure`,`Adventure / enduro cestni`],[`Skuter`,`Skuter`],[`Enduro`,`Enduro / cross`],[`Chopper`,`Chopper / cruiser`],[`Tourer`,`Tourer`],[`atv_utv`,`ATV / štirikolesnik`],[`EMoto`,`Električni motor`]]},gospodarska:{label:`Gospodarsko vozilo (kombi, tovornjak, prikolica)`,bodyTypes:[]},mehanizacija:{label:`Gradbena / kmetijska mehanizacija`,bodyTypes:[]},"prosti-cas":{label:`Prosti čas (avtodom, počitniška prikolica)`,bodyTypes:[]}},T=(e,t=200)=>e==null?``:String(e).trim().slice(0,t);function E(e){if(e==null||e===``)return null;let t=parseInt(String(e).replace(/[^\d.-]/g,``),10);return Number.isFinite(t)?t:null}function D(e){if(e==null||e===``)return null;let t=parseFloat(String(e).replace(`,`,`.`).replace(/[^\d.-]/g,``));return Number.isFinite(t)?t:null}function Te(e){if(typeof e==`boolean`)return e;let t=String(e).toLowerCase().trim();return t===`true`||t===`da`||t===`yes`||t===`1`}function O(e,t,n){if(e==null)return null;let r=String(e).trim();if(!r)return null;if(t.includes(r))return r;let i=r.toLowerCase();return t.find(e=>e.toLowerCase()===i)||(n&&n[i]?n[i]:null)}var Ee=new Map(g.map(e=>[e.toLowerCase(),e])),De=new Set(d.map(e=>e.id)),Oe=new Set(d.flatMap(e=>e.items.map(e=>String(t(e.label,e.value)).toLowerCase())));function ke(e){let t=[],n=[],r=String(e||``).trim();if(!r)return{ok:!1,errors:[`Prilepite JSON, ki vam ga je vrnil pomočnik AI.`],warnings:n};r=r.replace(/```[a-z]*\s*/gi,``).replace(/```/g,``).trim();let i=null;try{i=JSON.parse(r)}catch{let e=r.match(/\{[\s\S]*\}/);if(e)try{i=JSON.parse(e[0])}catch{}}if(!i||typeof i!=`object`||Array.isArray(i))return{ok:!1,errors:[`Besedila ni bilo mogoče prebrati kot JSON. Prilepite celoten odgovor pomočnika — od prvega « { » do zadnjega « } ».`],warnings:n};let a={},o=T(i.category).toLowerCase();we[o]||(o&&n.push(`Kategorija «${o}» ni prepoznana — nastavljena bo na «avto». Po potrebi jo popravite v čarovniku.`),o=`avto`),a.category=o;let s=O(i.bodyType||i.subcategory,we[o].bodyTypes.map(e=>e[0]));s?(a.bodyType=s,a.subcategory=s):i.bodyType&&n.push(`Karoserija «${T(i.bodyType)}» ni prepoznana — izberite jo ročno.`),a.make=T(i.make,60),a.model=T(i.model,80),a.variant=T(i.variant,80),a.linija=T(i.linija||i.line,60);let c=E(i.year),l=new Date().getFullYear()+1;c&&c>=1900&&c<=l?a.year=String(c):i.year&&n.push(`Letnik ni bil prepoznan — vnesite ga ročno.`);let u=E(i.mileageKm??i.mileage);u!=null&&u>=0&&(a.mileageKm=String(u));let d=O(i.color,xe);d?a.color=d:i.color&&n.push(`Barva «${T(i.color)}» ni v seznamu — izberite jo ročno.`),a.colorType=O(i.colorType,be)||`solid`,a.condition=O(i.condition,ve,ye)||`Rabljeno`;let f=E(i.doorsCount??i.doors);f&&f>=1&&f<=7&&(a.doorsCount=String(f));let p=E(i.seatsCount??i.seats);p&&p>=1&&p<=12&&(a.seatsCount=String(p));let m=T(i.firstRegistration);/^\d{4}-(0[1-9]|1[0-2])$/.test(m)?a.firstRegistration=m:/^\d{4}$/.test(m)?a.firstRegistration=`${m}-01`:m&&n.push(`Datum prve registracije ni v obliki LLLL-MM — vnesite ga ročno.`);let h=O(i.fuel,fe,pe);h&&(a.fuel=h),a.transmission=O(i.transmission,me,he)||``,a.driveType=O(i.driveType||i.drive,ge,_e)||``;let g=E(i.engineCc??i.engine_capacity_cc);g&&g>0&&g<2e4&&(a.engineCc=String(g)),a.engineConfig=O(i.engineConfig,Ce)||``;let _=E(i.powerKw);if(_&&_>0&&_<2e3)a.powerKw=String(_);else if(i.powerHp||i.powerKm){let e=E(i.powerHp??i.powerKm);e&&e>0&&(a.powerKw=String(Math.round(e/1.35962)),n.push(`Moč je bila podana v KM/HP in pretvorjena v kW — preverite jo.`))}let v=E(i.co2);v!=null&&v>=0&&(a.co2=String(v)),a.emissionClass=O(i.emissionClass,Se)||``;let y=D(i.fuelL100kmCombined);y!=null&&(a.fuelL100kmCombined=String(y));let b=D(i.fuelL100kmCity);b!=null&&(a.fuelL100kmCity=String(b));let x=D(i.fuelL100kmHighway);x!=null&&(a.fuelL100kmHighway=String(x));let S=D(i.batteryKwh);S!=null&&(a.batteryKwh=String(S));let ee=E(i.rangeKm);ee!=null&&(a.rangeKm=String(ee));let te=E(i.towingKg);if(te!=null&&(a.towingKg=String(te)),Array.isArray(i.equipment)){let e=[],t=0;for(let n of i.equipment){let r=Ee.get(String(n).trim().toLowerCase());r&&!e.includes(r)?e.push(r):n&&t++}a.equipment=e,t&&n.push(`${t} kos(ov) opreme ni bilo prepoznanih in so bili izpuščeni.`)}if(Array.isArray(i.customEquipment)){let e=[],t=0;for(let n of i.customEquipment){let r=``,i=``;n&&typeof n==`object`?(r=T(n.category,40).toLowerCase(),i=T(n.value||n.name||n.label,80)):i=T(n,80),i&&(Ee.has(i.toLowerCase())||(a.equipment||[]).length&&Oe.has(i.toLowerCase())||(De.has(r)||(r=`drugo`),e.some(e=>e.value.toLowerCase()===i.toLowerCase())||(e.push({category:r,value:i}),t++)))}e.length&&(a.customEquipment=e),t&&n.push(`${t} dodatnih lastnosti je predlaganih kot lastna oprema — po objavi jih pregleda uredništvo, preden se dodajo v taksonomijo.`)}let C=T(i.linija||i.line,60);C&&(a.linija=C,a._linijaProposed=C),a.description=T(i.description,5e3);let w=E(i.priceEur??i.price);return w&&w>0?a.priceEur=String(w):n.push(`Cena ni bila prepoznana — vnesli jo boste v koraku «Cena».`),i.priceNegotiable!=null&&(a.priceNegotiable=Te(i.priceNegotiable)),i.priceInclVat!=null&&(a.priceInclVat=Te(i.priceInclVat)),i.location&&typeof i.location==`object`&&(a.location={country:T(i.location.country,4),region:T(i.location.region,60)}),a.make||t.push(`Manjka znamka vozila («make»).`),a.model||t.push(`Manjka model vozila («model»).`),a.fuel||t.push(`Manjka ali ni prepoznano gorivo («fuel»: Petrol, Dizel, Hibrid, Elektrika, LPG, CNG ali Vodik).`),{ok:t.length===0,data:a,errors:t,warnings:n}}function Ae(){let e=[`avto`,`moto`,`all`],n=[];for(let r of d)if(r.categories.some(t=>e.includes(t))){n.push(`  [skupina id="${r.id}"] ${t(r.label,r.id)}`);for(let e of r.items)n.push(`    - "${t(e.label,e.value)}" → ${e.value}`)}return n.join(`
`)}function je(){let e=[`avto`,`moto`,`all`];return d.filter(t=>t.categories.some(t=>e.includes(t))).map(e=>`"${e.id}" (${t(e.label,e.id)})`).join(`, `)}function Me(){let e=[];for(let[t,n]of Object.entries(we)){if(!n.bodyTypes.length){e.push(`  category "${t}" (${n.label}): bodyType ni obvezen`);continue}e.push(`  category "${t}" (${n.label}):`);for(let[t,r]of n.bodyTypes)e.push(`    - ${r} → "${t}"`)}return e.join(`
`)}function Ne(){return`NAVODILO ZA PRETVORBO OGLASA V JSON ZA MOJAVTO.SI
==================================================================

Si pomočnik, ki MOJ obstoječi oglas za vozilo pretvori v strukturiran JSON,
ki ga bo spletna stran MojAvto.si samodejno uvozila. Spodaj ti bom prilepil
besedilo svojega oglasa. Tvoja naloga je iz njega izluščiti podatke in vrniti
IZKLJUČNO en sam veljaven JSON objekt — brez razlag, brez markdown ograj (\`\`\`),
brez besedila pred ali za objektom.

PRAVILA:
- Vrni SAMO podatke, ki jih v oglasu dejansko najdeš. Ničesar si ne izmišljuj.
  Če podatka ni, polje izpusti (ne ugibaj).
- Uporabi TOČNO imena polj in TOČNO dovoljene vrednosti, navedene spodaj.
- Znamko (make) in model napiši v polni, uradni obliki (npr. "Volkswagen",
  ne "VW"; "Mercedes-Benz", ne "Merc").
- Enote: prostornina v cm³ (cc), moč v kilovatih (kW, NE v KM/HP),
  prevoženi kilometri v km, poraba v L/100km.
- Datum prve registracije v obliki "LLLL-MM" (npr. "2018-05").
- "equipment" je seznam KOD (desni stolpec spodaj), ne opisov.
- Izlušči VSE podatke, ki so na voljo — preglej celoten oglas (osnovne podatke,
  tehnične podatke, opremo, opis in ceno) in zapolni čim več polj spodaj.

RAVNANJE Z NEZNANIMI LASTNOSTMI (zelo pomembno):
- Če v oglasu najdeš opremo/lastnost, ki NE ustreza nobeni kodi v spodnjem seznamu
  (npr. "Bang & Olufsen ozvočenje", "Night paket", "zračno vzmetenje zadaj"),
  je NE zavrzi. Dodaj jo v polje "customEquipment" kot objekt:
      { "category": "<id skupine>", "value": "<lepo slovensko ime>" }
  • "value" naj bo kratko, elegantno in slovnično pravilno slovensko poimenovanje
    (npr. "Premium ozvočenje Bang & Olufsen", "Paket Night", "Zračno vzmetenje").
  • "category" naj bo id najbolj ustrezne skupine, ena izmed:
    ${je()}.
  Te lastnosti bo uredništvo MojAvto.si pregledalo in po odobritvi dodalo v sistem.
- Če je v oglasu navedena LINIJA / paket opreme (npr. "M Sport", "S-Line",
  "AMG Line", "GT Line", "Elegance"), jo zapiši v polje "linija" kot lepo
  poimenovanje. Če zanjo ne obstaja koda, jo prav tako pregleda uredništvo.

OBVEZNA POLJA: make, model, fuel.

────────────────────────────────────────────────────────────────
DOVOLJENA POLJA IN VREDNOSTI
────────────────────────────────────────────────────────────────

category (vrsta vozila), ena izmed:
  "avto", "moto", "gospodarska", "mehanizacija", "prosti-cas"

bodyType (karoserija / vrsta) — odvisno od kategorije:
${Me()}

OSNOVNO:
  make            : besedilo (znamka, npr. "Audi")
  model           : besedilo (model, npr. "A4")
  variant         : besedilo (izvedba/motorizacija, npr. "2.0 TDI Sport")
  linija          : besedilo (paket/linija opreme, npr. "S-Line", "M Sport") — neobvezno
  year            : število (letnik, npr. 2019)
  firstRegistration: "LLLL-MM" (prva registracija)
  mileageKm       : število (prevoženi km)
  condition       : ena izmed → ${ve.map(e=>`"${e}"`).join(`, `)}
  color           : ena izmed → ${xe.map(e=>`"${e}"`).join(`, `)}
  colorType       : ena izmed → ${be.map(e=>`"${e}"`).join(`, `)} (solid=enobarvna, metallic=kovinska, matte=mat, pearl=biserna)
  doorsCount      : število vrat
  seatsCount      : število sedežev

TEHNIČNO:
  fuel            : ena izmed → ${fe.map(e=>`"${e}"`).join(`, `)}
  transmission    : ena izmed → ${me.map(e=>`"${e}"`).join(`, `)}  (Ročni=manual, Avtomatski=automatic)
  driveType       : ena izmed → ${ge.map(e=>`"${e}"`).join(`, `)}
  engineCc        : število (prostornina v cc)
  engineConfig    : ena izmed → ${Ce.map(e=>`"${e}"`).join(`, `)}
  powerKw         : število (moč v kW)
  co2             : število (g/km)
  emissionClass   : ena izmed → ${Se.map(e=>`"${e}"`).join(`, `)}
  fuelL100kmCombined / fuelL100kmCity / fuelL100kmHighway : število (poraba)
  batteryKwh      : število (kapaciteta baterije, samo elektrika/hibrid)
  rangeKm         : število (doseg na elektriko)
  towingKg        : število (vlečna teža)

OPIS IN CENA:
  description     : besedilo (prosti opis vozila iz oglasa)
  priceEur        : število (cena v EUR, brez simbola)
  priceNegotiable : true/false (cena po dogovoru)
  priceInclVat    : true/false (cena z DDV)

LOKACIJA (neobvezno):
  location        : { "region": "npr. Ljubljana" }

────────────────────────────────────────────────────────────────
OPREMA (equipment) — uporabi KODE iz desnega stolpca
────────────────────────────────────────────────────────────────
V oglasu poišči naštete lastnosti (varnost, udobje/notranjost, razsvetljava,
asistenti, multimedija ...) in vsako pretvori v ustrezno kodo. V "equipment"
vrni seznam teh kod (npr. ["ABS","Leather","HeatedSeats","Navigation"]).

Lastnosti, ki NE ustrezajo nobeni kodi, NE zavrzi — daj jih v "customEquipment"
(glej pravilo zgoraj), z lepim slovenskim imenom in id-jem skupine spodaj.

${Ae()}

customEquipment : seznam objektov { "category": "<id skupine>", "value": "<lepo ime>" }
  za lastnosti brez kode. Veljavni id-ji skupin: ${je()}.

────────────────────────────────────────────────────────────────
PRIMER IZHODA (oblika — vrednosti zgolj ponazoritvene)
────────────────────────────────────────────────────────────────
{
  "category": "avto",
  "bodyType": "Karavan",
  "make": "Volkswagen",
  "model": "Passat",
  "variant": "2.0 TDI Elegance",
  "linija": "Elegance",
  "year": 2020,
  "firstRegistration": "2020-03",
  "mileageKm": 145000,
  "condition": "Rabljeno",
  "color": "Siva",
  "colorType": "metallic",
  "doorsCount": 5,
  "seatsCount": 5,
  "fuel": "Dizel",
  "transmission": "Avtomatski",
  "driveType": "FWD (sprednji)",
  "engineCc": 1968,
  "powerKw": 110,
  "emissionClass": "Euro 6d",
  "fuelL100kmCombined": 5.4,
  "description": "Lepo ohranjen Passat, servisiran v pooblaščenem servisu ...",
  "priceEur": 18900,
  "priceNegotiable": true,
  "equipment": ["ABS","ESP","Navigation","Leather","HeatedSeats","LED","AdaptiveCruise","RearCamera"],
  "customEquipment": [
    { "category": "multimedija", "value": "Premium ozvočenje Harman Kardon" },
    { "category": "udobje", "value": "Paket Night" }
  ]
}

────────────────────────────────────────────────────────────────
SPODAJ PRILEPI BESEDILO SVOJEGA OGLASA:
────────────────────────────────────────────────────────────────
`}var Pe=e=>String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);function Fe({onApply:e}){document.getElementById(`aiiOverlay`)?.remove();let t=document.createElement(`div`);t.id=`aiiOverlay`,t.className=`aii-overlay`,t.innerHTML=`
        <div class="aii-modal" role="dialog" aria-modal="true" aria-labelledby="aiiTitle">
            <button class="aii-close" id="aiiClose" aria-label="Zapri">✕</button>

            <div class="aii-head">
                <span class="aii-badge">⚗︎ Eksperimentalno</span>
                <h2 class="aii-title" id="aiiTitle">Že imate oglas? Uvozite ga s pomočjo AI</h2>
                <p class="aii-sub">Imate to vozilo že objavljeno drugje? S pomočjo klepetalnega robota (ChatGPT ali DeepSeek) ga lahko pretvorite v naš oglas — izpolnimo vse razen fotografij.</p>
                <p class="aii-desktop">💻 Priporočamo uporabo na <strong>računalniku</strong>.</p>
            </div>

            <div class="aii-steps">
                <div class="aii-step">
                    <span class="aii-step-n">1</span>
                    <div>Odprite svoj obstoječi oglas, označite vse besedilo (<kbd>Ctrl</kbd>+<kbd>A</kbd>) in ga kopirajte.</div>
                </div>
                <div class="aii-step">
                    <span class="aii-step-n">2</span>
                    <div>
                        Prenesite naša navodila in jih skupaj z besedilom oglasa prilepite v klepetalnega robota.
                        <div class="aii-row">
                            <button class="aii-btn aii-btn--ghost" id="aiiDownload">⬇ Prenesi navodila (.txt)</button>
                            <a class="aii-link" href="https://chat.openai.com/" target="_blank" rel="noopener">ChatGPT ↗</a>
                            <a class="aii-link" href="https://chat.deepseek.com/" target="_blank" rel="noopener">DeepSeek ↗</a>
                        </div>
                    </div>
                </div>
                <div class="aii-step">
                    <span class="aii-step-n">3</span>
                    <div>Robot vrne <strong>JSON</strong>. Kopirajte celoten odgovor in ga prilepite spodaj.</div>
                </div>
            </div>

            <div class="aii-field">
                <label class="aii-label" for="aiiJson">Prilepite JSON pomočnika AI</label>
                <textarea id="aiiJson" class="aii-textarea" rows="8" placeholder='{ "make": "Volkswagen", "model": "Passat", ... }' spellcheck="false"></textarea>
            </div>

            <div id="aiiResult" class="aii-result" style="display:none;"></div>

            <label class="aii-disclaimer">
                <input type="checkbox" id="aiiConsent" />
                <span><strong>Objavljam svoj lastni oglas.</strong> Potrjujem, da sem lastnik oz. pooblaščeni prodajalec tega vozila in da sam odgovarjam za vsebino ter avtorske pravice (besedilo, fotografije). MojAvto.si ne odgovarja za uvožene podatke ali kršitve pravic tretjih oseb.</span>
            </label>

            <div class="aii-actions">
                <button class="aii-btn aii-btn--ghost" id="aiiCancel">Prekliči</button>
                <button class="aii-btn aii-btn--primary" id="aiiApply" disabled>Ustvari oglas iz podatkov</button>
            </div>
        </div>`,document.body.appendChild(t),document.body.style.overflow=`hidden`;let n=()=>{t.remove(),document.body.style.overflow=``},r=t.querySelector(`#aiiJson`),i=t.querySelector(`#aiiConsent`),a=t.querySelector(`#aiiApply`),o=t.querySelector(`#aiiResult`),s=()=>{a.disabled=!(i.checked&&r.value.trim().length>0)};r.addEventListener(`input`,s),i.addEventListener(`change`,s),t.querySelector(`#aiiClose`).addEventListener(`click`,n),t.querySelector(`#aiiCancel`).addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()}),document.addEventListener(`keydown`,function e(t){t.key===`Escape`&&(n(),document.removeEventListener(`keydown`,e))}),t.querySelector(`#aiiDownload`).addEventListener(`click`,()=>{let e=new Blob([Ne()],{type:`text/plain;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`MojAvto-navodila-AI.txt`,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(t),1e3)});let c=(e,t)=>{o.style.display=`block`,o.className=`aii-result aii-result--${e}`,o.innerHTML=t};a.addEventListener(`click`,()=>{let{ok:t,data:i,errors:a,warnings:o}=ke(r.value);if(!t){c(`err`,`<strong>Podatkov ni bilo mogoče uvoziti:</strong><ul>${a.map(e=>`<li>${Pe(e)}</li>`).join(``)}</ul>`);return}n(),e(i,o||[])})}var Ie=`cl_draft`;function k(e){try{let t={...e};delete t._exteriorFiles,delete t._exteriorUrls,delete t._interiorFiles,delete t._interiorUrls,sessionStorage.setItem(Ie,JSON.stringify(t))}catch{}}function Le(){try{let e=sessionStorage.getItem(Ie);return e?JSON.parse(e):null}catch{return null}}function Re(){sessionStorage.removeItem(Ie)}var A=e=>e==null||e===``?``:new Intl.NumberFormat(`sl-SI`).format(parseInt(e.toString().replace(/\D/g,``),10)||0),j=e=>(e.itemType||`vehicle`)===`vehicle`,ze=e=>e.itemType===`part`,Be=e=>e.itemType===`tire`,Ve=e=>e.itemType===`oprema`,He=[{id:`typeSelect`,title:null},{id:`entry`,title:null,condition:e=>j(e)&&!a.currentUser},{id:`category`,title:`cl_step_category`,number:!0},{id:`basic`,title:`cl_step_basic`,number:!0,condition:j},{id:`technical`,title:`cl_step_technical`,number:!0,condition:e=>j(e)&&(!F()||!B().basicEngine)},{id:`equipment`,title:`cl_step_features`,number:!0,condition:e=>j(e)&&(!F()||B().equipmentStep!==!1)},{id:`partDetails`,title:`cl_step_part_details`,number:!0,condition:ze},{id:`tireDetails`,title:`cl_step_tire_details`,number:!0,condition:Be},{id:`opremaDetails`,title:`cl_step_oprema_details`,number:!0,condition:Ve},{id:`media`,title:`cl_step_photos`,number:!0},{id:`description`,title:`cl_step_description`,number:!0},{id:`auctionSetup`,title:`cl_step_auction`,number:!0,condition:e=>e.entryType===`auction`},{id:`price`,title:`cl_step_price`,number:!0,condition:e=>e.entryType!==`auction`},{id:`location`,title:`cl_step_location`,number:!0},{id:`promotion`,title:`cl_step_visibility`,number:!0,condition:e=>e.entryType!==`auction`},{id:`review`,title:`cl_step_review`,number:!0},{id:`auth`,title:`cl_step_signin`,condition:()=>!a.currentUser}],M={currentStep:0,entryType:`classic`,auctionPackageId:`auction3w`,auctionDurationWeeks:3,startPriceEur:``,reservePriceEur:``,sellerContract:null,category:`avto`,subcategory:``,bodyType:``,itemType:`vehicle`,vehicleCategory:``,partGroup:``,partType:``,partTypeLabel:``,oemNumber:``,brand:``,vehicleApplication:{make:``,model:``,yearFrom:``,yearTo:``},equipmentGroup:``,equipmentType:``,equipmentTypeLabel:``,equipmentSize:``,tireSize:``,tireWidth:``,tireAspect:``,tireRim:``,tireSeason:``,treadDepthMm:``,dotYear:``,tireCount:``,make:``,model:``,variant:``,linija:``,year:``,mileageKm:``,color:``,colorType:`solid`,doorsCount:``,seatsCount:``,condition:`Rabljeno`,firstRegistration:``,previousOwnersCount:``,fuel:``,hybridType:null,transmission:``,driveType:``,engineCc:``,engineConfig:``,powerKw:``,co2:``,emissionClass:``,fuelL100kmCombined:``,fuelL100kmCity:``,fuelL100kmHighway:``,batteryKwh:``,rangeKm:``,batteryHealth:``,consumptionKwh100:``,towingKg:``,a2Eligible:!1,engineHoursUsed:``,lengthM:``,beamM:``,draughtM:``,hullMaterial:``,engineCount:`1`,driveSystem:``,maxSpeedKn:``,fuelTankL:``,waterTankL:``,cabins:``,berths:``,equipment:[],customEquipment:[],_customLinija:``,_customMake:``,_customModel:``,_customVrsta:``,exhaustBrand:``,exhaustType:``,_exteriorFiles:[],_exteriorUrls:[],_interiorFiles:[],_interiorUrls:[],coverIndex:0,description:``,priceEur:``,salePriceEur:null,priceNegotiable:!1,priceInclVat:!1,leaseAvailable:!1,callForPrice:!1,priceIsFinal:!1,listingType:`sale`,rentalPricing:{perDay:``,perWeek:``,deposit:``,minDays:``},sellerType:`private`,sellerNote:``,businessHours:{},leasingConditions:``,location:{country:``,region:``},contact:{name:``,phone:``,showPhone:!1,email:``},promotionTier:`free`},N=null,P=null,F=()=>e.id===`navtika`;function Ue(e){return typeof e==`string`?{trim:e}:e&&typeof e==`object`&&e.trim?e:{trim:String(e??``)}}var We={Petrol:`Petrol`,Diesel:`Dizel`,Electric:`Elektrika`,Hybrid:`Hibrid`,"Plug-in Hybrid":`Hibrid`,LPG:`LPG`,CNG:`CNG`,Hydrogen:`Vodik`};function Ge(e){let t={};if(!e)return t;let n=e.match(/\b([0-8]\.[0-9])(l|L)?\b/);if(n){let e=parseFloat(n[1]);e>=.8&&e<=8&&(t.engine_capacity_cc=Math.round(e*1e3))}else{let n=e.match(/\b([89][0-9]{2}|[1-7][0-9]{3})\b/);n&&(t.engine_capacity_cc=parseInt(n[1],10))}let r=e.toLowerCase();return[`phev`,`hybrid`,`hibrid`,`e-hybrid`,`gte`].some(e=>RegExp(`\\b${e}\\b|${e}`).test(r))?t.fuel_type=`Hybrid`:[`electric`,`električni`,`ev`,`plaid`].some(e=>RegExp(`\\b${e}\\b|${e}`).test(r))?t.fuel_type=`Electric`:[`tdi`,`cdi`,`jtd`,`hdi`,`crdi`,`dci`,`ddis`,`tdci`,`dizel`,`diesel`].some(e=>e===`d`?/\b\d{3}d\b|\bd\b/.test(r)||r.endsWith(`d`):RegExp(`\\b${e}\\b|${e}`).test(r))?t.fuel_type=`Diesel`:[`tsi`,`tfsi`,`vti`,`gti`,`mpi`,`fsi`,`t-gdi`,`tce`,`vtec`,`ts`,`bencin`,`petrol`,`gasoline`].some(e=>RegExp(`\\b${e}\\b|${e}`).test(r))&&(t.fuel_type=`Petrol`),t}function Ke(e,n,r){if(!e||!n||!r||!N)return;let i=N[n];if(!i)return;let a;if(Array.isArray(i[r]))a=i[r];else if(i[r]&&Array.isArray(i[r].variants))a=i[r].variants;else return;let o=a.find(t=>Ue(t).trim===e);if(!o)return;let s={};if(typeof o==`string`)s=Ge(o);else{s=Ue(o);let e=Ge(s.trim);!s.fuel_type&&e.fuel_type&&(s.fuel_type=e.fuel_type),!s.engine_capacity_cc&&e.engine_capacity_cc&&(s.engine_capacity_cc=e.engine_capacity_cc)}if(!Object.keys(s).some(e=>e!==`trim`&&s[e]!=null&&s[e]!==``))return;M._autoFillFields||=new Set;let c=(e,n,r)=>{if(n==null||n===``||M._manualFields&&M._manualFields.has(e))return;M[e]=n,M._autoFillFields.add(e);let i=r?document.getElementById(r):null;if(i){i.value=n,i.classList.add(`cl-autofilled`);let e=i.closest(`.cl-field`);if(e&&!e.querySelector(`.cl-autofill-icon`)){let n=e.querySelector(`.cl-label`),r=document.createElement(`span`);r.className=`cl-autofill-icon`,r.innerHTML=`?`,r.title=t(`cl_autofill_tooltip`,`Sistem je samodejno izpolnil ta podatek glede na izbran model. Če se podatek razlikuje, ga lahko spremenite.`),n?n.appendChild(r):e.appendChild(r)}}};if(s.fuel_type){let e=We[s.fuel_type]||s.fuel_type;c(`fuel`,e,`fFuel`),c(`fuel`,e,`fFuelBasic`);let t=document.getElementById(`fFuel`);if(t&&t.value){let e=t.value===`Elektrika`;document.getElementById(`elFields`)?.classList.toggle(`visible`,e),document.getElementById(`consumptionFields`)?.classList.toggle(`visible`,!e&&t.value!==``),document.getElementById(`hybridFields`)?.classList.toggle(`visible`,t.value===`Hibrid`)}}s.engine_capacity_cc!=null&&(c(`engineCc`,s.engine_capacity_cc,`fEngineCC`),c(`engineCc`,s.engine_capacity_cc,`fEngineCCBasic`)),s.fuel_consumption_city&&c(`fuelL100kmCity`,s.fuel_consumption_city,`fConsCity`),s.fuel_consumption_highway&&c(`fuelL100kmHighway`,s.fuel_consumption_highway,`fConsHighway`),s.fuel_consumption_combined&&c(`fuelL100kmCombined`,s.fuel_consumption_combined,`fConsCombined`),s.electric_range_km&&c(`rangeKm`,s.electric_range_km,`fRange`),s.fuel_consumption&&c(`fuelL100kmCombined`,s.fuel_consumption,`fConsCombined`)}function qe(e,t){if(M._bodyTypeManual)return;let n=x(N,e,t);if(!n)return;M.bodyType=n,M.subcategory=n,M._autoFillFields?.add?.(`bodyType`);let r=document.getElementById(`fBodyType`);r&&(r.value=n)}function Je(e){Object.assign(M,{entryType:e.entryType||`classic`,itemType:e.itemType||`vehicle`,category:e.category||`avto`,subcategory:e.subcategory||``,bodyType:e.bodyType||``,vehicleCategory:e.vehicleCategory||``,make:e.make||``,model:e.model||``,variant:e.variant||``,linija:e.linija||``,year:e.year?String(e.year):``,mileageKm:e.mileageKm??(e.mileage?String(e.mileage):``),color:e.color||``,colorType:e.colorType||`solid`,doorsCount:e.doorsCount?String(e.doorsCount):``,seatsCount:e.seatsCount?String(e.seatsCount):``,condition:e.condition||`Rabljeno`,firstRegistration:e.firstRegistration||``,previousOwnersCount:e.previousOwnersCount?String(e.previousOwnersCount):``,fuel:e.fuel||``,hybridType:e.hybridType||null,transmission:e.transmission||``,driveType:e.driveType||``,engineCc:e.engineCc?String(e.engineCc):``,engineConfig:e.engineConfig||``,powerKw:e.powerKw?String(e.powerKw):``,co2:e.co2?String(e.co2):``,emissionClass:e.emissionClass||``,fuelL100kmCombined:e.fuelL100kmCombined?String(e.fuelL100kmCombined):``,fuelL100kmCity:e.fuelL100kmCity?String(e.fuelL100kmCity):``,fuelL100kmHighway:e.fuelL100kmHighway?String(e.fuelL100kmHighway):``,batteryKwh:e.batteryKwh?String(e.batteryKwh):``,rangeKm:e.rangeKm?String(e.rangeKm):``,batteryHealth:e.batteryHealth?String(e.batteryHealth):``,consumptionKwh100:e.consumptionKwh100?String(e.consumptionKwh100):``,towingKg:e.towingKg?String(e.towingKg):``,a2Eligible:e.a2Eligible||!1,engineHoursUsed:e.engineHoursUsed?String(e.engineHoursUsed):``,lengthM:e.lengthM?String(e.lengthM):``,beamM:e.beamM?String(e.beamM):``,draughtM:e.draughtM?String(e.draughtM):``,hullMaterial:e.hullMaterial||``,engineCount:e.engineCount?String(e.engineCount):`1`,driveSystem:e.driveSystem||``,maxSpeedKn:e.maxSpeedKn?String(e.maxSpeedKn):``,fuelTankL:e.fuelTankL?String(e.fuelTankL):``,waterTankL:e.waterTankL?String(e.waterTankL):``,cabins:e.cabins?String(e.cabins):``,berths:e.berths?String(e.berths):``,partGroup:e.partGroup||``,partType:e.partType||``,oemNumber:e.oemNumber||``,brand:e.brand||``,vehicleApplication:e.vehicleApplication||{make:``,model:``,yearFrom:``,yearTo:``},tireSize:e.tireSize||``,tireWidth:e.tireWidth?String(e.tireWidth):``,tireAspect:e.tireAspect?String(e.tireAspect):``,tireRim:e.tireRim?String(e.tireRim):``,tireSeason:e.tireSeason||``,treadDepthMm:e.treadDepthMm?String(e.treadDepthMm):``,equipment:e.equipment||[],customEquipment:e.customEquipment||[],_exteriorFiles:[],_exteriorUrls:Array.isArray(e.images?.exterior)?[...e.images.exterior]:[],_interiorFiles:[],_interiorUrls:Array.isArray(e.images?.interior)?[...e.images.interior]:[],coverIndex:e.coverIndex||0,description:e.description||``,priceEur:e.priceEur?String(e.priceEur):e.price?String(e.price):``,salePriceEur:e.salePriceEur?String(e.salePriceEur):null,priceNegotiable:e.priceNegotiable||!1,priceInclVat:e.priceInclVat||!1,leaseAvailable:e.leaseAvailable||!1,callForPrice:e.callForPrice||!1,priceIsFinal:e.priceIsFinal||!1,listingType:e.listingType||`sale`,isRental:e.isRental||!1,rentalPricing:e.rentalPricing||{perDay:``,perWeek:``,deposit:``,minDays:``},sellerType:e.sellerType||`private`,sellerNote:e.sellerNote||``,location:e.location||{city:``,postalCode:``,region:``},contact:e.contact||{name:``,phone:``,showPhone:!1,email:``},promotionTier:e.promotion?.tier||`free`})}async function Ye(){console.log(`[CreateListing] init`),document.addEventListener(`focus`,()=>{let e=window.scrollX,t=window.scrollY;requestAnimationFrame(()=>window.scrollTo(e,t))},!0),F()&&M.category===`avto`&&(M.category=`colni`);let e=F()?`json/brands_models_plovila.json`:`json/brands_models_global.json`;fetch(e).then(e=>e.json()).then(e=>{N=e}).catch(()=>{});let t=new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`edit`);if(t){P=t;try{let e=await p(t);if(!e)throw Error(`Listing not found`);Je(e)}catch(e){console.error(`[CreateListing] Failed to load listing for edit:`,e),P=null}M.currentStep=I().findIndex(e=>e.id===`category`),M.currentStep<0&&(M.currentStep=0),L();return}let n=Le();if(n&&(confirm(`Najden je nedokončan oglas. Ali ga želite nadaljevati?`)?(Object.assign(M,n),M._exteriorFiles=[],M._exteriorUrls=[],M._interiorFiles=[],M._interiorUrls=[]):Re()),a.currentUser)try{let e=await c();e&&e.sellerType&&(M.sellerType=e.sellerType)}catch(e){console.error(`[CreateListing] Fetch user profile failed:`,e)}L()}function I(){return He.filter(e=>!e.condition||e.condition(M))}function Xe(){return I()[M.currentStep]||He[0]}function Ze(){let e=document.getElementById(`clProgress`),n=document.getElementById(`clProgressFill`),r=document.getElementById(`clProgressLabel`);if(!e)return;let i=I().filter(e=>e.number),a=Xe();if(!a.number){e.style.display=`none`;return}let o=i.indexOf(a),s=i.length>1?Math.round(o/(i.length-1)*100):100;e.style.display=`flex`,n&&(n.style.width=s+`%`),r&&(r.textContent=`${t(`cl_step_korak`)} ${o+1} / ${i.length}`)}function L(){let e=Xe();Ze();let t={typeSelect:tt,entry:rt,category:st,basic:ft,technical:vt,equipment:bt,partDetails:lt,tireDetails:dt,opremaDetails:ut,media:xt,description:wt,auctionSetup:Et,price:Dt,location:Ot,promotion:kt,review:Z,auth:Ft}[e.id];t&&t(),C(),window.lucide&&window.lucide.createIcons()}function R(){G=null,k(M);let e=I();M.currentStep<e.length-1&&(M.currentStep++,L())}function z(){G=null,k(M),M.currentStep>0&&(M.currentStep--,L())}function Qe(e){G=null;let t=I().findIndex(t=>t.id===e);t>=0&&(M.currentStep=t,L())}function $e(){let e=F()?t(`cl_mode_listing_navtika`,`Navaden oglas`):t(`cl_mode_listing`,`Navaden oglas`);return`
        <div class="cl-mode-pills-wrap">
            <div class="cl-mode-pills" role="tablist" aria-label="${t(`cl_mode_label`,`Vrsta objave`)}">
                <button type="button" class="cl-mode-pill ${M.entryType===`auction`?``:`active`}" data-mode="classic">
                    📄 ${e}
                </button>
                <button type="button" class="cl-mode-pill ${M.entryType===`auction`?`active`:``}" data-mode="auction">
                    🔨 ${t(`cl_mode_auction`,`Dražba`)}
                </button>
            </div>
            <p class="cl-mode-hint">${M.entryType===`auction`?t(`cl_mode_auction_hint`,`Dražba: 3 tedne 4,99 € ali 6 tednov 9,99 €. Na voljo le za vozila.`):t(`cl_mode_listing_hint`,`Standardni oglas s fiksno ali pogajalno ceno.`)}</p>
        </div>`}function et(){document.querySelectorAll(`.cl-mode-pill`).forEach(e=>{e.addEventListener(`click`,()=>{M.entryType=e.dataset.mode===`auction`?`auction`:`classic`,k(M),tt()})})}function tt(){if(F()){Q(`
            <div class="cl-card">
                <h1 class="cl-step-title">${t(`cl_type_select_title`,`Kaj želite objaviti?`)}</h1>
                <p class="cl-step-sub">${t(`cl_type_select_sub`,`Izberite vrsto oglasa.`)}</p>
                ${$e()}
                <div class="cl-entry-cards">
                    <div class="cl-entry-card" id="typeVehicle">
                        <span class="cl-entry-card-icon">⛵</span>
                        <p class="cl-entry-card-title">Plovilo</p>
                        <p class="cl-entry-card-desc">Čoln, jadrnica, jahta, gumenjak, jet-ski ipd.</p>
                    </div>
                    <div class="cl-entry-card ${M.entryType===`auction`?`cl-entry-card--disabled`:``}" id="typeParts">
                        <span class="cl-entry-card-icon">⚓</span>
                        <p class="cl-entry-card-title">Oprema / Motor</p>
                        <p class="cl-entry-card-desc">Izvenkrmni motorji, navigacija, varnostna oprema.</p>
                    </div>
                </div>
            </div>
        `),et(),document.getElementById(`typeVehicle`).addEventListener(`click`,()=>{M.itemType=`vehicle`,M.category=`colni`,R()}),document.getElementById(`typeParts`).addEventListener(`click`,()=>{M.entryType!==`auction`&&(M.itemType=`part`,M.category=`deli`,M.vehicleCategory=`colni`,R())});return}Q(`
        <div class="cl-card">
            <h1 class="cl-step-title">${t(`cl_type_select_title`,`Kaj želite objaviti?`)}</h1>
            <p class="cl-step-sub">${t(`cl_type_select_sub`,`Izberite vrsto oglasa.`)}</p>
            ${$e()}
            <div class="cl-entry-cards">
                <div class="cl-entry-card" id="typeVehicle">
                    <span class="cl-entry-card-icon">🚗</span>
                    <p class="cl-entry-card-title">${t(`cl_type_vehicle`,`Vozilo`)}</p>
                    <p class="cl-entry-card-desc">${t(`cl_type_vehicle_desc`,`Avto, motor, kombi, prikolica, ipd.`)}</p>
                </div>
                <div class="cl-entry-card ${M.entryType===`auction`?`cl-entry-card--disabled`:``}" id="typeParts">
                    <span class="cl-entry-card-icon">🔧</span>
                    <p class="cl-entry-card-title">${t(`cl_type_parts`,`Deli in gume`)}</p>
                    <p class="cl-entry-card-desc">${t(`cl_type_parts_desc`,`Nadomestni deli, pnevmatike, oprema.`)}</p>
                </div>
            </div>

            <button type="button" class="cl-ai-launch ${M.entryType===`auction`?`cl-ai-launch--disabled`:``}" id="typeAiImport">
                <span class="cl-ai-launch-icon">✨</span>
                <span class="cl-ai-launch-text">
                    <span class="cl-ai-launch-title">${t(`cl_ai_launch_title`,`Že imate oglas?`)} <span class="cl-ai-badge">${t(`cl_ai_badge`,`Eksperimentalno`)}</span></span>
                    <span class="cl-ai-launch-desc">${t(`cl_ai_launch_desc`,`Uvozite obstoječi oglas s pomočjo AI (ChatGPT / DeepSeek) — izpolnimo vse razen fotografij.`)}</span>
                </span>
                <span class="cl-ai-launch-arrow">→</span>
            </button>
        </div>
    `),et(),document.getElementById(`typeVehicle`).addEventListener(`click`,()=>{M.itemType=`vehicle`,M.category=`avto`,R()}),document.getElementById(`typeParts`).addEventListener(`click`,()=>{M.entryType!==`auction`&&(M.itemType=`part`,M.category=`deli`,R())}),document.getElementById(`typeAiImport`).addEventListener(`click`,()=>{M.entryType!==`auction`&&Fe({onApply:nt})})}function nt(e,t){M.itemType=`vehicle`,M.entryType=`classic`;let n=e._linijaProposed||``;delete e._linijaProposed,Object.assign(M,e),Array.isArray(M.equipment)||(M.equipment=[]),Array.isArray(M.customEquipment)||(M.customEquipment=[]),M._customLinija=``;let r=e=>{let n=[...t||[],...e||[]];M._aiImported=!0,M._aiImportWarnings=n.length?n:null,k(M),Qe(`media`)};if(n&&M.make){fetch(`json/vehicle_lines.json`).then(e=>e.ok?e.json():{}).then(e=>{let t=(e[M.make]||[]).find(e=>e.toLowerCase()===n.toLowerCase());t?(M.linija=t,r()):(M.linija=``,M._customLinija=n,r([`Linija «${n}» še ni v sistemu — predlagana je v pregled uredništvu.`]))}).catch(()=>{M.linija=``,M._customLinija=n,r()});return}r()}function rt(){let e=a.currentUser?`<div style="padding:0.75rem 1rem;background:rgba(255,255,255,0.4);backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,0.5);border-radius:12px;display:flex;align-items:center;gap:0.75rem;font-weight:600;">
                ${M.sellerType===`business`?`🏢 `+t(`cl_business_dealership`):`👤 `+t(`cl_private_seller`)}
                <span style="font-size:0.75rem;color:#64748b;font-weight:400;margin-left:auto;">${t(`cl_signed_in_as`)} ${a.currentUser.displayName||a.currentUser.email}</span>
           </div>`:`<div class="cl-seller-toggle">
                <button class="cl-seller-btn ${M.sellerType===`private`?`active`:``}" data-type="private">
                    👤 ${t(`cl_private_seller`)}
                </button>
                <button class="cl-seller-btn ${M.sellerType===`business`?`active`:``}" data-type="business">
                    🏢 ${t(`cl_business_dealership`)}
                </button>
           </div>`;if(F()){Q(`
            <div class="cl-card">
                <h1 class="cl-step-title">Kako boste oddali oglas?</h1>
                <p class="cl-step-sub">Izberite vašo vlogo in začnite z ročnim vnosom podatkov.</p>
                <div class="cl-field" style="margin-bottom:1.5rem;">
                    <label class="cl-label">${t(`cl_seller_type`)}</label>
                    ${e}
                </div>
                <div class="cl-entry-cards">
                    <div class="cl-entry-card recommended" id="entryClassic">
                        <span class="cl-entry-card-icon">📋</span>
                        <p class="cl-entry-card-title">Ročni vnos</p>
                        <p class="cl-entry-card-desc">Izpolnite podatke o plovilu korak za korakom.</p>
                        <ul class="cl-entry-card-features">
                            <li>Vsa plovila in motorne čolne</li>
                            <li>Jadrnice, jahte, jet-ski</li>
                            <li>Vedno brezplačno</li>
                        </ul>
                    </div>
                </div>
            </div>
        `),document.querySelectorAll(`.cl-seller-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.cl-seller-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),M.sellerType=e.dataset.type})}),document.getElementById(`entryClassic`).addEventListener(`click`,()=>{M.entryType=`classic`,R()});return}Q(`
        <div class="cl-card">
            <h1 class="cl-step-title">${t(`cl_step_entry_title`)}</h1>
            <p class="cl-step-sub">${t(`cl_step_entry_sub`)}</p>

            <div class="cl-field" style="margin-bottom:1.5rem;">
                <label class="cl-label">${t(`cl_seller_type`)}</label>
                ${e}
            </div>

            <div class="cl-entry-cards">
                <div class="cl-entry-card recommended" id="entryClassic">
                    <span class="cl-entry-card-icon">📋</span>
                    <p class="cl-entry-card-title">${t(`cl_manual_entry`)}</p>
                    <p class="cl-entry-card-desc">${t(`cl_manual_entry_desc`)}</p>
                    <ul class="cl-entry-card-features">
                        <li>${t(`cl_manual_entry_older`)}</li>
                        <li>${t(`cl_manual_entry_imported`)}</li>
                        <li>${t(`cl_always_free`)}</li>
                    </ul>
                </div>
            </div>
        </div>
    `),document.querySelectorAll(`.cl-seller-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.cl-seller-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),M.sellerType=e.dataset.type})}),document.getElementById(`entryClassic`).addEventListener(`click`,()=>{M.entryType=`classic`,R()})}var it=[{id:`avto`,label:`cl_cat_avto`,icon:`car`,subs:[{name:`cl_sub_limuzina`,value:`Limuzina`,icon:`car`},{name:`cl_sub_suv`,value:`Terensko`,icon:`mountain`},{name:`cl_sub_karavan`,value:`Karavan`,icon:`layout-template`},{name:`cl_sub_kombilimuzina`,value:`Kombilimuzina`,icon:`car`},{name:`cl_sub_kabriolet`,value:`Kabriolet`,icon:`sun`},{name:`cl_sub_coupe`,value:`Coupe`,icon:`zap`},{name:`cl_sub_enoprostorec`,value:`Enoprostorec`,icon:`users`},{name:`cl_sub_pickup`,value:`Pick-up`,icon:`truck`},{name:`cl_sub_oldtimer`,value:`Oldtimer`,icon:`history`}]},{id:`moto`,label:`cl_cat_moto`,icon:`bike`,subs:[{name:`cl_sub_motocikel`,value:`SportniMotor`,icon:`bike`},{name:`cl_sub_sport_tourer`,value:`SportniTourer`,icon:`map-pin`},{name:`cl_sub_adventure`,value:`Adventure`,icon:`mountain`},{name:`cl_sub_skuter`,value:`Skuter`,icon:`car`},{name:`cl_sub_enduro`,value:`Enduro`,icon:`mountain`},{name:`cl_sub_chopper`,value:`Chopper`,icon:`wind`},{name:`cl_sub_tourer`,value:`Tourer`,icon:`map`},{name:`cl_sub_atv_utv`,value:`atv_utv`,icon:`maximize`},{name:`cl_sub_emoto`,value:`EMoto`,icon:`zap`}]},{id:`gospodarska`,label:`cl_cat_gospodarska`,icon:`truck`,subs:[{name:`cl_sub_dostavna`,icon:`package`},{name:`cl_sub_tovorna`,icon:`truck`},{name:`cl_sub_avtobus`,icon:`users`},{name:`cl_sub_prikolice`,icon:`link`}]},{id:`mehanizacija`,label:`cl_cat_mehanizacija`,icon:`tractor`,subs:[{name:`cl_sub_construction`,icon:`hammer`},{name:`cl_sub_agricultural`,icon:`tractor`},{name:`cl_sub_forklifts`,icon:`chevrons-up`},{name:`cl_sub_municipal`,icon:`trash-2`}]},{id:`prosti-cas`,label:`cl_cat_prosti_cas`,icon:`palmtree`,subs:[{name:`cl_sub_avtodom`,icon:`home`},{name:`cl_sub_pocitniska`,icon:`box`},{name:`cl_sub_mobilna`,icon:`home`},{name:`cl_sub_sotorska`,icon:`tent`}]},{id:`deli`,label:`cl_cat_deli`,icon:`wrench`,subs:[]}],at=e.id===`navtika`?[{id:`colni`,label:`cat_boats`,icon:`sailboat`,subs:[{name:`cat_motorboat`,value:`motorni-coln`,icon:`sailboat`},{name:`cat_yachts`,value:`jahte`,icon:`ship`}]},{id:`jadrnice`,label:`cat_sailboats`,icon:`sailboat`,subs:[{name:`cat_sailboat`,value:`jadrnica`,icon:`sailboat`},{name:`cat_catamaran`,value:`katamaran`,icon:`sailboat`}]},{id:`gumenjaki`,label:`cat_inflatables`,icon:`sailboat`,subs:[{name:`cat_rib`,value:`rib`,icon:`sailboat`},{name:`cat_soft_inflatable`,value:`mehki-gumenjak`,icon:`sailboat`}]},{id:`jet-ski`,label:`cat_jet_ski`,icon:`waves`,subs:[{name:`vtype_pwc_runabout`,value:`SedeciJetSki`,icon:`waves`},{name:`vtype_pwc_standup`,value:`StojeciJetSki`,icon:`waves`}]},{id:`izvenkrmni-motorji`,label:`cat_outboard_engines`,icon:`cog`,subs:[{name:`cat_engine_class`,value:`razred`,icon:`cog`}]},{id:`deli`,label:`cat_boat_equipment`,icon:`wrench`,subs:[]}]:it,ot={colni:{hullComfort:!0,engineBrand:!0,equipmentStep:!0,engineTypes:`noSail`,driveSystem:!0},jadrnice:{hullComfort:!0,engineBrand:!0,equipmentStep:!0,engineTypes:`all`,driveSystem:!0},gumenjaki:{hullComfort:!0,engineBrand:!0,equipmentStep:!0,engineTypes:`noSail`,driveSystem:!0,hullMaterials:`inflatable`},"jet-ski":{hullComfort:!1,engineBrand:!1,equipmentStep:!1,engineTypes:`all`,driveSystem:!0,basicEngine:!0},"izvenkrmni-motorji":{hullComfort:!1,engineBrand:!1,equipmentStep:!0,engineTypes:`all`,driveSystem:!1,motorProduct:!0}},B=()=>ot[M.category]||ot.colni;function st(){if(M.itemType===`part`||M.itemType===`tire`||M.itemType===`oprema`){Q(`
            <div class="cl-card">
                <h2 class="cl-step-title">${t(`cl_parts_category_title`,`Vrsta dela ali pnevmatike`)}</h2>
                <p class="cl-step-sub">${t(`cl_parts_category_sub`,`Izberite tip in za katero vozilo je namenjeno.`)}</p>
                <div id="subRow" class="cl-subcategory-row" style="margin-bottom:1.25rem;"></div>
                <div class="cl-nav">
                    <button class="cl-btn cl-btn--ghost" id="btnCatBack">${t(`cl_back`)}</button>
                    <button class="cl-btn cl-btn--primary" id="btnCatNext">${t(`cl_continue`)}</button>
                </div>
            </div>
        `),window.lucide&&window.lucide.createIcons(),V(document.getElementById(`subRow`)),document.getElementById(`btnCatBack`).addEventListener(`click`,z),document.getElementById(`btnCatNext`).addEventListener(`click`,()=>{if(!M.vehicleCategory)return alert(t(`cl_select_vehicle_cat_alert`,`Izberite za katero vrsto vozila je del/pnevmatika.`));R()});return}let e=at.filter(e=>e.id!==`deli`).map(e=>`
        <div class="cl-category-card ${M.category===e.id?`selected`:``}" data-cat="${e.id}">
            <i data-lucide="${e.icon}"></i>
            <span>${t(e.label)}</span>
        </div>`).join(``);Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_category_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_category_sub`)}</p>

            <div class="cl-category-grid">${e}</div>

            <div id="subRow" class="cl-subcategory-row" style="margin-bottom:1.25rem;"></div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnCatBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnCatNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons(),ct(),document.querySelectorAll(`.cl-category-card`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.cl-category-card`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),M.category=e.dataset.cat,M.subcategory=``,M.itemType=`vehicle`,M.vehicleCategory=``,ct()})}),document.getElementById(`btnCatBack`).addEventListener(`click`,z),document.getElementById(`btnCatNext`).addEventListener(`click`,()=>{if(!M.category)return alert(t(`cl_select_category_alert`));R()})}function ct(){let e=document.getElementById(`subRow`);if(e){if(M.category===`deli`){V(e);return}e.innerHTML=``}}function V(e){let n=(e,t,n)=>`
        <button class="cl-subcategory-pill ${M.itemType===e?`selected`:``}" data-item="${e}">
            <i data-lucide="${t}" class="cl-sub-icon"></i> ${n}
        </button>`,r=e=>`
        <button class="cl-subcategory-pill ${M.vehicleCategory===e.value?`selected`:``}" data-vehcat="${e.value}">
            <i data-lucide="${e.icon}" class="cl-sub-icon"></i> ${e.label}
        </button>`,i=M.itemType===`oprema`;e.innerHTML=`
        <div style="width:100%;">
            <label class="cl-label" style="margin-bottom:0.5rem;display:block;">${t(`cl_what_are_you_listing`,`Kaj objavljate?`)}</label>
            <div class="cl-subcategory-row" id="deliItemRow" style="margin-bottom:1rem;">
                ${n(`part`,`wrench`,t(`cl_sub_del`,`Nadomestni del`))}
                ${n(`tire`,`disc-3`,t(`cl_sub_guma`,`Pnevmatika`))}
                ${n(`oprema`,`shield`,t(`cl_sub_oprema`,`Moto oprema`))}
            </div>
            <label class="cl-label" style="margin-bottom:0.5rem;display:block;${i?`display:none;`:``}" id="deliVehLabel">${t(`gd_choose_vehicle_cat`,`Za katero vozilo?`)}</label>
            <div class="cl-subcategory-row" id="deliVehRow" style="${i?`display:none;`:``}">
                ${oe.map(r).join(``)}
            </div>
        </div>`,window.lucide&&window.lucide.createIcons({scope:e}),e.querySelectorAll(`#deliItemRow .cl-subcategory-pill`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`#deliItemRow .cl-subcategory-pill`).forEach(e=>e.classList.remove(`selected`)),t.classList.add(`selected`),M.itemType=t.dataset.item,M.partGroup=``,M.partType=``,M.partTypeLabel=``,M.equipmentGroup=``,M.equipmentType=``,M.equipmentTypeLabel=``,M.equipmentSize=``,M.itemType===`oprema`&&(M.vehicleCategory=`moto`),V(e)})}),e.querySelectorAll(`#deliVehRow .cl-subcategory-pill`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`#deliVehRow .cl-subcategory-pill`).forEach(e=>e.classList.remove(`selected`)),t.classList.add(`selected`),M.vehicleCategory=t.dataset.vehcat,M.partGroup=``,M.partType=``,M.partTypeLabel=``})})}function lt(){let e=F(),n=ce(M.vehicleCategory).map(e=>`<option value="${e.value}" ${M.partGroup===e.value?`selected`:``}>${e.label}</option>`).join(``),r=(M.partGroup?ie(M.vehicleCategory,M.partGroup):[]).map(e=>`<option value="${e.value}" ${M.partType===e.value?`selected`:``}>${e.label}</option>`).join(``),i=e?`npr. Garmin, Yamaha, Musto`:`npr. Bosch, Sachs`,a=e?`npr. 4XE-45728-00`:`npr. 1K0615301AA`,o=e?``:`
            <div class="cl-label" style="margin:1.25rem 0 0.5rem;border-top:1px solid rgba(0,0,0,0.08);padding-top:1rem;font-weight:700;">${t(`gd_compatibility`,`Združljivost (neobvezno)`)}</div>
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_make`,`Znamka vozila`)}</label>
                    <input class="cl-input" id="fAppMake" type="text" value="${$(M.vehicleApplication?.make||``)}" placeholder="npr. Volkswagen" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_model`,`Model vozila`)}</label>
                    <input class="cl-input" id="fAppModel" type="text" value="${$(M.vehicleApplication?.model||``)}" placeholder="npr. Golf" />
                </div>
            </div>
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_year_from`,`Letnik od`)}</label>
                    <input class="cl-input" id="fAppYearFrom" type="number" value="${$(String(M.vehicleApplication?.yearFrom||``))}" placeholder="npr. 2012" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_year_to`,`Letnik do`)}</label>
                    <input class="cl-input" id="fAppYearTo" type="number" value="${$(String(M.vehicleApplication?.yearTo||``))}" placeholder="npr. 2020" />
                </div>
            </div>`;Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${e?`Podatki o opremi`:t(`cl_step_part_details`,`Podatki o delu`)}</h2>
            <p class="cl-step-sub">${e?`Opišite opremo ali motor, ki ga prodajate.`:t(`cl_part_details_sub`,`Opišite del, ki ga prodajate.`)}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_part_group`,`Sklop`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fPartGroup">
                        <option value="">${t(`cl_sel_part_group`,`Izberite sklop`)}</option>
                        ${n}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${e?`Vrsta opreme`:t(`gd_part_type`,`Vrsta dela`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fPartType" ${M.partGroup?``:`disabled`}>
                        <option value="">${t(`cl_sel_part_type`,`Najprej izberite sklop`)}</option>
                        ${r}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_condition`,`Stanje`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fPartCondition">
                        <option value="Rabljeno" ${M.condition===`Rabljeno`?`selected`:``}>${t(`gd_condition_used`,`Rabljeno`)}</option>
                        <option value="Novo" ${M.condition===`Novo`?`selected`:``}>${t(`gd_condition_new`,`Novo`)}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_part_brand`,`Znamka / proizvajalec`)}</label>
                    <input class="cl-input" id="fPartBrand" type="text" value="${$(M.brand||``)}" placeholder="${i}" />
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_oem_number`,`OEM / kataloška številka`)}</label>
                    <input class="cl-input" id="fOem" type="text" value="${$(M.oemNumber||``)}" placeholder="${a}" />
                </div>
            </div>

            ${o}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnPartBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnPartNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons();let s=document.getElementById(`fPartGroup`),c=document.getElementById(`fPartType`);s.addEventListener(`change`,()=>{M.partGroup=s.value,M.partType=``,M.partTypeLabel=``;let e=ie(M.vehicleCategory,M.partGroup);c.innerHTML=`<option value="">${t(`cl_sel_part_type`,`Izberite vrsto`)}</option>`+e.map(e=>`<option value="${e.value}">${e.label}</option>`).join(``),c.disabled=!M.partGroup}),c.addEventListener(`change`,()=>{M.partType=c.value,M.partTypeLabel=ne(M.vehicleCategory,M.partGroup,c.value)}),document.getElementById(`btnPartBack`).addEventListener(`click`,z),document.getElementById(`btnPartNext`).addEventListener(`click`,()=>{if(M.partGroup=s.value,M.partType=c.value,M.partTypeLabel=ne(M.vehicleCategory,M.partGroup,c.value),M.condition=document.getElementById(`fPartCondition`).value,M.brand=document.getElementById(`fPartBrand`).value.trim(),M.oemNumber=document.getElementById(`fOem`).value.trim(),e||(M.vehicleApplication={make:document.getElementById(`fAppMake`).value.trim(),model:document.getElementById(`fAppModel`).value.trim(),yearFrom:document.getElementById(`fAppYearFrom`).value.trim(),yearTo:document.getElementById(`fAppYearTo`).value.trim()}),!M.partGroup||!M.partType)return alert(e?`Izberite sklop in vrsto opreme.`:t(`cl_part_required_alert`,`Izberite sklop in vrsto dela.`));R()})}function ut(){let e=se().map(e=>`<option value="${e.value}" ${M.equipmentGroup===e.value?`selected`:``}>${e.label}</option>`).join(``),n=(M.equipmentGroup?w(M.equipmentGroup):[]).map(e=>`<option value="${e.value}" ${M.equipmentType===e.value?`selected`:``}>${e.label}</option>`).join(``),r=le.map(e=>`<option value="${e}" ${M.equipmentSize===e?`selected`:``}>${e}</option>`).join(``);Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_step_oprema_details`,`Podatki o opremi`)}</h2>
            <p class="cl-step-sub">${t(`cl_oprema_details_sub`,`Opišite motoristično opremo, ki jo prodajate.`)}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_eq_group`,`Sklop opreme`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fEqGroup">
                        <option value="">${t(`cl_sel_eq_group`,`Izberite sklop`)}</option>
                        ${e}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_eq_type`,`Vrsta`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fEqType" ${M.equipmentGroup?``:`disabled`}>
                        <option value="">${t(`cl_sel_eq_type`,`Najprej izberite sklop`)}</option>
                        ${n}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_part_brand`,`Znamka / proizvajalec`)}</label>
                    <select class="cl-select" id="fEqBrand">
                        <option value="">${t(`all_brands`,`Vse znamke`)}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_eq_size`,`Velikost`)}</label>
                    <select class="cl-select" id="fEqSize">
                        <option value="">—</option>
                        ${r}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_condition`,`Stanje`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fEqCondition">
                        <option value="Rabljeno" ${M.condition===`Rabljeno`?`selected`:``}>${t(`gd_condition_used`,`Rabljeno`)}</option>
                        <option value="Novo" ${M.condition===`Novo`?`selected`:``}>${t(`gd_condition_new`,`Novo`)}</option>
                    </select>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnEqBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnEqNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons();let i=document.getElementById(`fEqGroup`),a=document.getElementById(`fEqType`);i.addEventListener(`change`,()=>{M.equipmentGroup=i.value,M.equipmentType=``,M.equipmentTypeLabel=``;let e=w(M.equipmentGroup);a.innerHTML=`<option value="">${t(`cl_sel_eq_type`,`Izberite vrsto`)}</option>`+e.map(e=>`<option value="${e.value}">${e.label}</option>`).join(``),a.disabled=!M.equipmentGroup}),a.addEventListener(`change`,()=>{M.equipmentType=a.value,M.equipmentTypeLabel=re(M.equipmentGroup,a.value)}),fetch(`json/equipment_brands.json`).then(e=>e.json()).then(e=>{let t=document.getElementById(`fEqBrand`);t&&(e.forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=e,e===M.brand&&(n.selected=!0),t.appendChild(n)}),t.value=M.brand||``)}).catch(()=>{}),document.getElementById(`btnEqBack`).addEventListener(`click`,z),document.getElementById(`btnEqNext`).addEventListener(`click`,()=>{if(M.equipmentGroup=i.value,M.equipmentType=a.value,M.equipmentTypeLabel=re(M.equipmentGroup,a.value),M.brand=document.getElementById(`fEqBrand`).value,M.equipmentSize=document.getElementById(`fEqSize`).value,M.condition=document.getElementById(`fEqCondition`).value,!M.equipmentGroup||!M.equipmentType)return alert(t(`cl_oprema_required_alert`,`Izberite sklop in vrsto opreme.`));R()})}function dt(){let e=[];for(let t=125;t<=355;t+=5)e.push(t);let n=[25,30,35,40,45,50,55,60,65,70,75,80,85],r=[];for(let e=10;e<=24;e++)r.push(e);let i=(e,t)=>`<option value="${e}" ${String(t)===String(e)?`selected`:``}>${e}</option>`,a=M.condition!==`Novo`;Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_step_tire_details`,`Podatki o pnevmatiki`)}</h2>
            <p class="cl-step-sub">${t(`cl_tire_details_sub`,`Vnesite dimenzijo in lastnosti pnevmatik.`)}</p>

            <label class="cl-label">${t(`gd_tire_size`,`Dimenzija`)} <span class="req">*</span></label>
            <div class="cl-row" style="align-items:flex-end;">
                <div class="cl-field">
                    <label class="cl-label" style="font-size:0.78rem;opacity:0.7;">${t(`gd_tire_width`,`Širina`)}</label>
                    <select class="cl-select" id="fTireWidth"><option value="">—</option>${e.map(e=>i(e,M.tireWidth)).join(``)}</select>
                </div>
                <div class="cl-field">
                    <label class="cl-label" style="font-size:0.78rem;opacity:0.7;">${t(`gd_tire_aspect`,`Profil`)}</label>
                    <select class="cl-select" id="fTireAspect"><option value="">—</option>${n.map(e=>i(e,M.tireAspect)).join(``)}</select>
                </div>
                <div class="cl-field">
                    <label class="cl-label" style="font-size:0.78rem;opacity:0.7;">${t(`gd_tire_rim`,`Premer (R)`)}</label>
                    <select class="cl-select" id="fTireRim"><option value="">—</option>${r.map(e=>i(e,M.tireRim)).join(``)}</select>
                </div>
            </div>
            <p class="cl-step-sub" id="tireSizePreview" style="margin-top:-0.5rem;font-weight:700;">${M.tireSize||``}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_season`,`Sezona`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fTireSeason">
                        <option value="">${t(`cl_sel_season`,`Izberite sezono`)}</option>
                        <option value="letne" ${M.tireSeason===`letne`?`selected`:``}>${t(`gd_season_summer`,`Letne`)}</option>
                        <option value="zimske" ${M.tireSeason===`zimske`?`selected`:``}>${t(`gd_season_winter`,`Zimske`)}</option>
                        <option value="celoletne" ${M.tireSeason===`celoletne`?`selected`:``}>${t(`gd_season_allseason`,`Celoletne`)}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_part_brand`,`Znamka`)}</label>
                    <input class="cl-input" id="fTireBrand" type="text" value="${$(M.brand||``)}" placeholder="npr. Michelin" />
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_condition`,`Stanje`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fTireCondition">
                        <option value="Rabljeno" ${M.condition===`Rabljeno`?`selected`:``}>${t(`gd_condition_used`,`Rabljeno`)}</option>
                        <option value="Novo" ${M.condition===`Novo`?`selected`:``}>${t(`gd_condition_new`,`Novo`)}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_tire_count`,`Število kosov`)}</label>
                    <select class="cl-select" id="fTireCount">
                        ${[1,2,4].map(e=>`<option value="${e}" ${String(M.tireCount)===String(e)?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-row" id="usedTireRow" style="${a?``:`display:none;`}">
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_tread_depth`,`Globina profila (mm)`)}</label>
                    <input class="cl-input" id="fTread" type="number" step="0.1" value="${$(String(M.treadDepthMm||``))}" placeholder="npr. 6.5" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`gd_dot_year`,`DOT leto`)}</label>
                    <input class="cl-input" id="fDot" type="text" value="${$(M.dotYear||``)}" placeholder="npr. 2021" />
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnTireBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnTireNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons();let o=document.getElementById(`fTireWidth`),s=document.getElementById(`fTireAspect`),c=document.getElementById(`fTireRim`),l=document.getElementById(`tireSizePreview`),u=()=>{o.value&&s.value&&c.value?M.tireSize=`${o.value}/${s.value} R${c.value}`:M.tireSize=``,l.textContent=M.tireSize};[o,s,c].forEach(e=>e.addEventListener(`change`,u)),document.getElementById(`fTireCondition`).addEventListener(`change`,e=>{document.getElementById(`usedTireRow`).style.display=e.target.value===`Novo`?`none`:``}),document.getElementById(`btnTireBack`).addEventListener(`click`,z),document.getElementById(`btnTireNext`).addEventListener(`click`,()=>{if(u(),M.tireWidth=o.value,M.tireAspect=s.value,M.tireRim=c.value,M.tireSeason=document.getElementById(`fTireSeason`).value,M.brand=document.getElementById(`fTireBrand`).value.trim(),M.condition=document.getElementById(`fTireCondition`).value,M.tireCount=document.getElementById(`fTireCount`).value,M.treadDepthMm=document.getElementById(`fTread`)?.value||``,M.dotYear=document.getElementById(`fDot`)?.value||``,!M.tireSize)return alert(t(`cl_tire_size_alert`,`Izberite širino, profil in premer pnevmatike.`));if(!M.tireSeason)return alert(t(`cl_tire_season_alert`,`Izberite sezono pnevmatike.`));R()})}function ft(){if(F())return gt();let e=[];for(let t=new Date().getFullYear()+1;t>=1960;t--)e.push(t);let n=[`Bela`,`Črna`,`Siva`,`Srebrna`,`Modra`,`Rdeča`,`Zelena`,`Rumena`,`Rjava`,`Oranžna`,`Vijolična`,`Zlata`,`Bronasta`,`Druga`],r=e.map(e=>`<option value="${e}" ${Number(M.year)===e?`selected`:``}>${e}</option>`).join(``),i=at.find(e=>e.id===M.category)?.subs||[],a=i.map(e=>{let n=e.value||e.name;return`<option value="${n}" ${M.bodyType===n?`selected`:``}>${t(e.name)}</option>`}).join(``);Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_basic_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_basic_sub`)}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_make`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fMake">
                        <option value="">${t(`cl_sel_make`)}</option>
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_model`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fModel">
                        <option value="">${t(`cl_sel_model_first`)}</option>
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_year`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fYear">
                        <option value="">${t(`cl_sel_year`)}</option>${r}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_variant`)}</label>
                    <select class="cl-select" id="fVariant">
                        <option value="">${t(`cl_sel_trim`)}</option>
                    </select>
                </div>
            </div>

            <div class="cl-row" id="fLinijaRow" style="display:none">
                <div class="cl-field" style="flex:1">
                    <label class="cl-label">${t(`cl_label_line`,`Linija`)}</label>
                    <select class="cl-select" id="fLinija">
                        <option value="">${t(`cl_sel_line`,`— Izberite linijo —`)}</option>
                    </select>
                </div>
                <div class="cl-field" style="flex:1"></div>
            </div>
            <div id="fLinijaCustomRow" style="display:none">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_line_custom`,`Ime lastne linije`)}</label>
                    <input class="cl-input" id="fLinijaCustom" type="text" maxlength="60"
                        placeholder="${t(`cl_placeholder_line_custom`,`npr. S Line, GT-Line, Black Edition`)}" autocomplete="off" />
                    <p class="cl-hint cl-hint--warn" style="margin-top:.4rem">
                        <strong>Pozor:</strong> Vnesite <em>samo ime linije</em> (npr. <em>Audi A6 S Tronic</em> je sprejemljivo, <em>Audi A6 Avant 2.0 TDI S tronic quattro panorama</em> ni). Oglasi z napačno vnesenimi linijami bodo odstranjeni.
                    </p>
                </div>
            </div>

            <div class="cl-row cl-autofill-row" id="fuelCcRow">
                <div class="cl-field" id="fFuelBasicWrap">
                    <label class="cl-label">${t(`cl_label_fuel`,`Gorivo`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fFuelBasic">
                        <option value="">${t(`cl_select`,`Izberite`)}</option>
                        ${[[`Petrol`,t(`cl_fuel_petrol`,`Bencin`)],[`Dizel`,t(`cl_fuel_diesel`,`Dizel`)],[`Hibrid`,t(`cl_fuel_hybrid`,`Hibrid`)],[`Elektrika`,t(`cl_fuel_electric`,`Elektrika`)],[`LPG`,t(`cl_fuel_lpg`,`LPG`)],[`CNG`,t(`cl_fuel_cng`,`CNG`)],[`Vodik`,t(`cl_fuel_hydrogen`,`Vodik`)]].map(([e,t])=>`<option value="${e}" ${M.fuel===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field" id="fEngineCCBasicWrap">
                    <label class="cl-label">${t(`cl_label_displacement`,`Prostornina motorja`)} (cc)</label>
                    <div class="cl-input-wrap">
                        <input class="cl-input" id="fEngineCCBasic" type="number" min="0" max="15000"
                            value="${M.engineCc||``}"
                            placeholder="${t(`cl_placeholder_displacement`,`npr. 1998`)}" />
                        <span class="cl-input-unit">cc</span>
                    </div>
                </div>
            </div>

            ${i.length>0?`
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_body_type`,`Karoserija`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fBodyType">
                        <option value="">${t(`cl_sel_body_type`,`Izberite karoserijo`)}</option>
                        ${a}
                    </select>
                </div>
            </div>`:``}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_mileage`)} <span class="req">*</span></label>
                    <div class="cl-mileage-wrap">
                        <input class="cl-input" id="fMileage" type="text"
                            value="${M.mileageKm?A(M.mileageKm):``}"
                            placeholder="${t(`cl_placeholder_mileage`)}" autocomplete="off" />
                        <span class="cl-mileage-unit">km</span>
                    </div>
                </div>

                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_color`)}</label>
                    <select class="cl-select" id="fColor">
                        <option value="">${t(`cl_sel_color`)||`Select color`}</option>
                        ${n.map(e=>`<option value="${e}" ${M.color===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_condition`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fCondition">
                        ${[[`Rabljeno`,t(`cl_condition_used`)],[`Novo`,t(`cl_condition_new`)],[`Razstavno vozilo`,t(`cl_condition_demo`)],[`Starodobnik`,t(`cl_condition_classic`)],[`Za dele`,t(`cl_condition_for_parts`)]].map(([e,t])=>`<option value="${e}" ${M.condition===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_paint`)}</label>
                    <select class="cl-select" id="fColorType">
                        ${[[`solid`,t(`cl_paint_solid`)],[`metallic`,t(`cl_paint_metallic`)],[`matte`,t(`cl_paint_matte`)],[`pearl`,t(`cl_paint_pearl`)]].map(([e,t])=>`<option value="${e}" ${M.colorType===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_doors`)}</label>
                    <select class="cl-select" id="fDoors">
                        <option value="">—</option>
                        ${[2,3,4,5,6].map(e=>`<option value="${e}" ${Number(M.doorsCount)===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_seats`)}</label>
                    <select class="cl-select" id="fSeats">
                        <option value="">—</option>
                        ${[2,3,4,5,6,7,8,9].map(e=>`<option value="${e}" ${Number(M.seatsCount)===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_first_reg`)} <span class="req">*</span></label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <select class="cl-select" id="fFirstRegMonth">
                            <option value="">${t(`cl_sel_month`)}</option>
                            ${[...Array(12)].map((e,t)=>{let n=(t+1).toString().padStart(2,`0`);return`<option value="${n}" ${(M.firstRegistration?M.firstRegistration.split(`-`)[1]:``)===n?`selected`:``}>${n}.</option>`}).join(``)}
                        </select>
                        <select class="cl-select" id="fFirstRegYear">
                            <option value="">${t(`cl_sel_year`)}</option>
                            ${r}
                        </select>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_prev_owners`)}</label>
                    <select class="cl-select" id="fPrevOwners">
                        <option value="">—</option>
                        ${[[`1st owner`,t(`cl_owner_1`)],[`2nd owner`,t(`cl_owner_2`)],[`3rd owner`,t(`cl_owner_3`)],[`4th owner`,t(`cl_owner_4`)],[`5 or more`,t(`cl_owner_5plus`)]].map(([e,t])=>`<option value="${e}" ${M.previousOwnersCount===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnBasicBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnBasicNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons();let o=document.getElementById(`fMake`),s=document.getElementById(`fModel`),c=document.getElementById(`fVariant`),l=document.getElementById(`fLinija`),u=document.getElementById(`fLinijaRow`),d=document.getElementById(`fLinijaCustomRow`),f=document.getElementById(`fLinijaCustom`),p=`__custom__`,m=null;function h(){return m?Promise.resolve(m):fetch(`json/vehicle_lines.json`).then(e=>e.ok?e.json():{}).then(e=>(m=e,e)).catch(()=>(m={},{}))}function g(e){if(!l||!u)return;l.innerHTML=`<option value="">${t(`cl_sel_line`,`— Izberite linijo —`)}</option>`,l.value=``,d&&(d.style.display=`none`),((m||{})[e]||[]).forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,M.linija===e&&(t.selected=!0),l.appendChild(t)});let n=document.createElement(`option`);n.value=p,n.textContent=t(`cl_line_add_custom`,`+ Dodaj lastno linijo`),l.appendChild(n),u.style.display=``,M._customLinija&&(l.value=p,d&&(d.style.display=``),f&&(f.value=M._customLinija))}if(h().then(()=>g(M.make||``)),M._imported){let e=M._imported;e.brand&&o?.classList.add(`imported-field`),e.model&&s?.classList.add(`imported-field`),e.year&&document.getElementById(`fYear`)?.classList.add(`imported-field`),e.mileage&&document.getElementById(`fMileage`)?.classList.add(`imported-field`)}N&&Object.keys(N).sort().forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,M.make===e&&(t.selected=!0),o.appendChild(t)});function b(){let e=o.value,n=M.model;if(s.innerHTML=`<option value="">${t(`cl_sel_model`)}</option>`,c.innerHTML=`<option value="">${t(`cl_sel_model_first`)}</option>`,e&&N&&N[e]){let t=N[e];(Array.isArray(t)?t:Object.keys(t)).forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,n===e&&(t.selected=!0),s.appendChild(t)}),s.disabled=!1}else s.disabled=!0;x()}function x(){let e=o.value,n=s.value,r=M.variant;if(c.innerHTML=`<option value="">${t(`cl_sel_trim`)}</option>`,e&&n&&N&&N[e]){let i=N[e];!Array.isArray(i)&&i[n]?((Array.isArray(i[n])?i[n]:Array.isArray(i[n].variants)?i[n].variants:[]).forEach(e=>{let t=Ue(e).trim,n=document.createElement(`option`);n.value=t,n.textContent=t,r===t&&(n.selected=!0),c.appendChild(n)}),c.disabled=!1):(c.innerHTML=`<option value="">${t(`cl_no_variants`)}</option>`,c.disabled=!1)}else c.disabled=!0;M.variant&&Ke(M.variant,o.value,s.value),qe(o.value,s.value)}o.addEventListener(`change`,()=>{M.make=o.value,M.model=``,M.variant=``,M.linija=``,h().then(()=>g(o.value)),b()}),s.addEventListener(`change`,()=>{M.model=s.value,M.variant=``,x()}),l&&l.addEventListener(`change`,()=>{l.value===p?(M.linija=``,M._customLinija=f?f.value.trim():``,d&&(d.style.display=``),f&&f.focus()):(M.linija=l.value,M._customLinija=``,d&&(d.style.display=`none`))}),f&&f.addEventListener(`input`,()=>{M._customLinija=f.value.trim(),M.linija=``}),c.addEventListener(`change`,()=>{M.variant=c.value,Ke(c.value,o.value,s.value);let e=document.getElementById(`fuelCcRow`);e&&c.value&&(e.classList.add(`cl-autofill-row--highlighted`),setTimeout(()=>e.classList.remove(`cl-autofill-row--highlighted`),2e3))}),document.getElementById(`fFuelBasic`)?.addEventListener(`change`,e=>{M.fuel=e.target.value,M._manualFields||=new Set,M._manualFields.add(`fuel`)}),document.getElementById(`fEngineCCBasic`)?.addEventListener(`input`,e=>{M.engineCc=e.target.value,M._manualFields||=new Set,M._manualFields.add(`engineCc`)}),b(),document.getElementById(`fBodyType`)?.addEventListener(`change`,e=>{M.bodyType=e.target.value,M.subcategory=e.target.value,M._bodyTypeManual=!0}),y();let S=document.getElementById(`fMileage`);S&&(_(S),S.addEventListener(`input`,()=>{let e=document.querySelector(`.cl-mileage-unit`);e&&(e.style.opacity=S.value?`1`:`0.4`)})),document.getElementById(`btnBasicBack`).addEventListener(`click`,z),document.getElementById(`btnBasicNext`).addEventListener(`click`,()=>{let e=o.value,n=document.getElementById(`fMileage`).value,r=v(n),a=document.getElementById(`fYear`).value,u=document.getElementById(`fFirstRegMonth`).value,d=document.getElementById(`fFirstRegYear`).value,f=document.getElementById(`fBodyType`)?.value||``;if(!e)return alert(t(`cl_err_make`));if(n===``)return alert(t(`cl_err_mileage`));if(!a)return alert(t(`cl_err_year`));if(!u||!d)return alert(t(`cl_err_first_reg`));if(i.length>0&&!f)return alert(t(`cl_err_body_type`,`Izberite karoserijo vozila.`));M.make=e,M.model=s.value,M.variant=c.value,M.linija=l&&l.value||``,M.year=Number(a),M.mileageKm=r,M.color=document.getElementById(`fColor`).value,M.colorType=document.getElementById(`fColorType`).value,M.condition=document.getElementById(`fCondition`).value,M.doorsCount=document.getElementById(`fDoors`).value,M.seatsCount=document.getElementById(`fSeats`).value,M.firstRegistration=`${d}-${u}`,M.previousOwnersCount=document.getElementById(`fPrevOwners`).value,f&&(M.bodyType=f,M.subcategory=f);let p=document.getElementById(`fFuelBasic`)?.value,m=document.getElementById(`fEngineCCBasic`)?.value;p&&(M.fuel=p),m&&(M.engineCc=m),R()})}function H(e){let t=document.getElementById(e);if(!t)return;t.classList.add(`cl-input--error`,`cl-select--error`);let n=()=>{t.classList.remove(`cl-input--error`,`cl-select--error`)};t.addEventListener(`input`,n,{once:!0}),t.addEventListener(`change`,n,{once:!0})}function pt(e){e&&(e.addEventListener(`input`,()=>{let t=e.value.replace(/[^0-9.,]/g,``);if(t.indexOf(`.`)!==-1||t.indexOf(`,`)!==-1){let e=t.split(/[.,]/);t=e[0]+`,`+e.slice(1).join(``)}e.value=t}),e.addEventListener(`keypress`,e=>{/[\d.,]/.test(e.key)||e.preventDefault()}))}function mt(e){return parseFloat((e||``).replace(`,`,`.`))||``}function ht(){document.querySelectorAll(`input[type="number"]`).forEach(e=>{e.addEventListener(`wheel`,e=>e.preventDefault(),{passive:!1})})}function gt(){let e=B(),n=[];for(let e=new Date().getFullYear()+1;e>=1960;e--)n.push(e);let r=n.map(e=>`<option value="${e}" ${Number(M.year)===e?`selected`:``}>${e}</option>`).join(``),i=e.hullMaterials===`inflatable`?[`Guma (napihljivo)`,`PVC`,`Hypalon`,`Aluminij (RIB)`,`GRP (RIB)`,`Drugi`]:[`GRP (Stekloplastika)`,`Aluminij`,`Les`,`Carbon`,`Jeklo`,`Guma (napihljivo)`,`Drugi`],a=[`Bela`,`Modra`,`Siva`,`Črna`,`Rdeča`,`Zelena`,`Rumena`,`Oranžna`,`Druga`],o=[`Bencin (4-taktni)`,`Bencin (2-taktni)`,`Električni`],s=at.find(e=>e.id===M.category)?.subs||[],c=s.map(e=>{let n=e.value||e.name;return`<option value="${n}" ${M.bodyType===n?`selected`:``}>${t(e.name)}</option>`}).join(``);Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">Osnovni podatki plovila</h2>
            <p class="cl-step-sub">Vnesite osnovne tehnične podatke o plovilu.</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Znamka <span class="req">*</span></label>
                    <select class="cl-select" id="fMake">
                        <option value="">— Izberite znamko —</option>
                    </select>
                    <div id="fMakeCustomWrap" style="display:none;margin-top:.4rem">
                        <input class="cl-input" id="fMakeCustom" type="text" maxlength="60"
                            placeholder="Vnesite ime znamke" autocomplete="off"
                            value="${$(M._customMake||``)}" />
                        <p class="cl-hint" style="margin-top:.25rem">Znamka bo predlagana za dodajanje v taksonomijo.</p>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Model</label>
                    <select class="cl-select" id="fModel" disabled>
                        <option value="">— Najprej izberite znamko —</option>
                    </select>
                    <div id="fModelCustomWrap" style="display:none;margin-top:.4rem">
                        <input class="cl-input" id="fModelCustom" type="text" maxlength="80"
                            placeholder="Vnesite ime modela" autocomplete="off"
                            value="${$(M._customModel||``)}" />
                        <p class="cl-hint" style="margin-top:.25rem">Model bo predlagan za dodajanje v taksonomijo.</p>
                    </div>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Letnik <span class="req">*</span></label>
                    <select class="cl-select" id="fYear">
                        <option value="">— Letnik —</option>${r}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Dolžina plovila (m) <span class="req">*</span></label>
                    <input class="cl-input" id="fLength" type="text" inputmode="decimal"
                        value="${M.lengthM?String(M.lengthM).replace(`.`,`,`):``}" placeholder="npr. 8,5" />
                </div>
            </div>

            ${s.length>0?`
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Vrsta plovila <span class="req">*</span></label>
                    <select class="cl-select" id="fBodyType">
                        <option value="">— Izberite vrsto —</option>
                        ${c}
                        <option value="__custom__">+ Vrsta ni na seznamu</option>
                    </select>
                    <div id="fBodyTypeCustomWrap" style="display:none;margin-top:.4rem">
                        <input class="cl-input" id="fBodyTypeCustom" type="text" maxlength="60"
                            placeholder="npr. Elektična jadrnica, Tender, Hišna ladja"
                            value="${$(M._customVrsta||``)}" />
                        <p class="cl-hint" style="margin-top:.25rem">Vrsta bo predlagana za dodajanje v taksonomijo.</p>
                    </div>
                </div>
                <div class="cl-field"></div>
            </div>`:``}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Ure motorja <span class="req">*</span></label>
                    <div class="cl-mileage-wrap">
                        <input class="cl-input" id="fEngineHours" type="text"
                            value="${M.engineHoursUsed?A(M.engineHoursUsed):``}"
                            placeholder="npr. 350" autocomplete="off" />
                        <span class="cl-mileage-unit">h</span>
                    </div>
                </div>
                ${e.hullComfort?`
                <div class="cl-field">
                    <label class="cl-label">Material trupa</label>
                    <select class="cl-select" id="fHullMaterial">
                        <option value="">—</option>
                        ${i.map(e=>`<option value="${e}" ${M.hullMaterial===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>`:``}
            </div>

            ${e.basicEngine?`
            <div class="cl-row">
                <div class="cl-field">
                    <div class="cl-label-with-toggle">
                        <label class="cl-label">Moč motorja <span class="req">*</span></label>
                        <div class="cl-unit-toggle" id="powerUnitToggle">
                            <button type="button" class="cl-unit-btn active" data-unit="hp">KM</button>
                            <button type="button" class="cl-unit-btn" data-unit="kw">kW</button>
                        </div>
                    </div>
                    <div class="cl-input-wrap">
                        <input class="cl-input" id="fPower" type="number" min="0"
                            value="${M.powerKw?Math.round(M.powerKw*1.35962):``}" placeholder="npr. 130" />
                        <span class="cl-input-unit" id="powerUnitLabel">KM</span>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Tip motorja</label>
                    <select class="cl-select" id="fJetEngineType">
                        <option value="">—</option>
                        ${o.map(e=>`<option value="${e}" ${M.fuel===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
            </div>`:``}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Stanje <span class="req">*</span></label>
                    <select class="cl-select" id="fCondition">
                        ${[[`Rabljeno`,`Rabljeno`],[`Novo`,`Novo`],[`Za dele`,`Za dele`]].map(([e,t])=>`<option value="${e}" ${M.condition===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Barva trupa</label>
                    <select class="cl-select" id="fColor">
                        <option value="">—</option>
                        ${a.map(e=>`<option value="${e}" ${M.color===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
            </div>

            ${e.hullComfort?`
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Število kabin</label>
                    <select class="cl-select" id="fCabins">
                        <option value="">—</option>
                        ${[0,1,2,3,4,5,6].map(e=>`<option value="${e}" ${String(M.cabins)===String(e)?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Število ležišč</label>
                    <select class="cl-select" id="fBerths">
                        <option value="">—</option>
                        ${[0,1,2,3,4,5,6,7,8,10,12].map(e=>`<option value="${e}" ${String(M.berths)===String(e)?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Širina (m)</label>
                    <input class="cl-input" id="fBeam" type="text" inputmode="decimal"
                        value="${M.beamM?String(M.beamM).replace(`.`,`,`):``}" placeholder="npr. 3,2" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">Ugrez (m)</label>
                    <input class="cl-input" id="fDraught" type="text" inputmode="decimal"
                        value="${M.draughtM?String(M.draughtM).replace(`.`,`,`):``}" placeholder="npr. 1,8" />
                </div>
            </div>`:``}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Leto prve registracije</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                        <select class="cl-select" id="fFirstRegMonth">
                            <option value="">Mesec</option>
                            ${[...Array(12)].map((e,t)=>{let n=(t+1).toString().padStart(2,`0`);return`<option value="${n}" ${(M.firstRegistration?M.firstRegistration.split(`-`)[1]:``)===n?`selected`:``}>${n}.</option>`}).join(``)}
                        </select>
                        <select class="cl-select" id="fFirstRegYear">
                            <option value="">Leto</option>${r}
                        </select>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">Število prejšnjih lastnikov</label>
                    <select class="cl-select" id="fPrevOwners">
                        <option value="">—</option>
                        ${[[`1st owner`,`1. lastnik`],[`2nd owner`,`2. lastnik`],[`3rd owner`,`3. lastnik`],[`4th owner`,`4. lastnik`],[`5 or more`,`5 ali več`]].map(([e,t])=>`<option value="${e}" ${M.previousOwnersCount===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnBasicBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnBasicNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons(),y();let l=`__custom__`;function u(e){let t=document.getElementById(`fMakeCustomWrap`);t&&(t.style.display=e?``:`none`);let n=document.getElementById(`fModel`),r=document.getElementById(`fModelCustomWrap`);e?(n&&(n.style.display=`none`,n.disabled=!0),r&&(r.style.display=``)):(n&&(n.style.display=``),r&&(r.style.display=`none`))}function d(e){let t=document.getElementById(`fModel`),n=document.getElementById(`fModelCustomWrap`);e?(t&&(t.style.display=`none`),n&&(n.style.display=``)):(t&&(t.style.display=``),n&&(n.style.display=`none`))}fetch(`json/brands_models_plovila.json`).then(e=>e.json()).then(e=>{N=e;let t=document.getElementById(`fMake`),n=document.getElementById(`fModel`);if(!t)return;Object.keys(e).sort().forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=e,M.make===e&&(n.selected=!0),t.appendChild(n)});let r=document.createElement(`option`);r.value=l,r.textContent=`+ Znamka ni na seznamu`,t.appendChild(r);function i(t){if(n)if(n.innerHTML=`<option value="">— Izberite model —</option>`,t&&e[t]){Object.keys(e[t]).sort().forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,M.model===e&&(t.selected=!0),n.appendChild(t)});let r=document.createElement(`option`);r.value=l,r.textContent=`+ Model ni na seznamu`,n.appendChild(r),n.disabled=!1}else n.disabled=!0}M._customMake?(t.value=l,u(!0)):M.make&&e[M.make]&&(i(M.make),M._customModel&&(n&&(n.value=l),d(!0))),t.addEventListener(`change`,()=>{let e=t.value;M._customMake=``,M._customModel=``,M.make=e===l?``:e,M.model=``,e===l?u(!0):(u(!1),i(e))}),n&&n.addEventListener(`change`,()=>{let e=n.value;M._customModel=``,e===l?(M.model=``,d(!0)):(M.model=e,d(!1))});let a=document.getElementById(`fMakeCustom`),o=document.getElementById(`fModelCustom`);a&&a.addEventListener(`input`,()=>{M._customMake=a.value.trim(),M.make=``}),o&&o.addEventListener(`input`,()=>{M._customModel=o.value.trim(),M.model=``})}).catch(()=>{u(!0)});let f=document.getElementById(`fBodyType`),p=document.getElementById(`fBodyTypeCustomWrap`),m=document.getElementById(`fBodyTypeCustom`);f&&(M._customVrsta&&(f.value=l,p&&(p.style.display=``)),f.addEventListener(`change`,()=>{f.value===l?(M.bodyType=``,M.subcategory=``,M._customVrsta=m?m.value.trim():``,p&&(p.style.display=``),m&&m.focus()):(M.bodyType=f.value,M.subcategory=f.value,M._customVrsta=``,p&&(p.style.display=`none`))})),m&&m.addEventListener(`input`,()=>{M._customVrsta=m.value.trim(),M.bodyType=``,M.subcategory=``});let h=document.getElementById(`fEngineHours`);h&&_(h),pt(document.getElementById(`fLength`)),pt(document.getElementById(`fBeam`)),pt(document.getElementById(`fDraught`)),ht();let g=_t(`fPower`,`powerUnitToggle`,`powerUnitLabel`);document.getElementById(`btnBasicBack`).addEventListener(`click`,z),document.getElementById(`btnBasicNext`).addEventListener(`click`,()=>{let t=document.getElementById(`fMake`),n=(document.getElementById(`fMakeCustom`)?.value||``).trim(),r=(document.getElementById(`fModelCustom`)?.value||``).trim(),i=n||(t?.value===`__custom__`?``:t?.value||``),a=r||M.model||``,o=document.getElementById(`fYear`).value,c=document.getElementById(`fLength`).value,l=document.getElementById(`fEngineHours`).value,u=v(l),d=document.getElementById(`fBodyType`),f=(document.getElementById(`fBodyTypeCustom`)?.value||``).trim(),p=f||(d?.value===`__custom__`?``:d?.value||``),m=!0;if(i||(H(n!==void 0&&document.getElementById(`fMakeCustomWrap`)?.style.display!==`none`?`fMakeCustom`:`fMake`),m=!1),o||(H(`fYear`),m=!1),c||(H(`fLength`),m=!1),l===``&&(H(`fEngineHours`),m=!1),s.length>0&&!p&&(H(f!==void 0&&document.getElementById(`fBodyTypeCustomWrap`)?.style.display!==`none`?`fBodyTypeCustom`:`fBodyType`),m=!1),e.basicEngine){let e=parseFloat(document.getElementById(`fPower`)?.value||``);(isNaN(e)||e<=0)&&(H(`fPower`),m=!1)}if(!m)return;if(M._customMake=n,M._customModel=r,M._customVrsta=f,M.make=i,M.model=a,M.year=Number(o),M.lengthM=mt(c),M.engineHoursUsed=u,M.condition=document.getElementById(`fCondition`).value,M.color=document.getElementById(`fColor`).value,M.previousOwnersCount=document.getElementById(`fPrevOwners`).value,e.hullComfort?(M.hullMaterial=document.getElementById(`fHullMaterial`)?.value||``,M.cabins=document.getElementById(`fCabins`)?.value||``,M.berths=document.getElementById(`fBerths`)?.value||``,M.beamM=mt(document.getElementById(`fBeam`)?.value||``),M.draughtM=mt(document.getElementById(`fDraught`)?.value||``)):(M.hullMaterial=``,M.cabins=``,M.berths=``,M.beamM=``,M.draughtM=``),e.basicEngine){let e=parseFloat(document.getElementById(`fPower`)?.value||``);M.powerKw=g()===`kw`?e:Math.round(e/1.35962),M.fuel=document.getElementById(`fJetEngineType`)?.value||``}let h=document.getElementById(`fFirstRegMonth`).value,_=document.getElementById(`fFirstRegYear`).value;h&&_&&(M.firstRegistration=`${_}-${h}`),p&&(M.bodyType=p,M.subcategory=p),R()})}function _t(e,t,n){let r=`hp`,i=document.getElementById(e),a=document.querySelectorAll(`#${t} .cl-unit-btn`),o=document.getElementById(n);return!i||!a.length||a.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.unit;if(t===r)return;let n=parseFloat(i.value);isNaN(n)||(i.value=Math.round(t===`kw`?n/1.35962:n*1.35962)),a.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),r=t,o&&(o.textContent=t===`hp`?`KM`:`kW`)})}),()=>r}function vt(){if(F())return yt();let e=[[`Petrol`,t(`cl_fuel_petrol`)],[`Dizel`,t(`cl_fuel_diesel`)],[`Hibrid`,t(`cl_fuel_hybrid`)],[`Elektrika`,t(`cl_fuel_electric`)],[`LPG`,t(`cl_fuel_lpg`)],[`CNG`,t(`cl_fuel_cng`)],[`Vodik`,t(`cl_fuel_hydrogen`)]],n=[[`Ročni`,t(`cl_trans_manual`)],[`Avtomatski`,t(`cl_trans_automatic`)],[`Polavtomatski`,t(`cl_trans_semi`)]],r=[[`FWD (sprednji)`,t(`cl_drive_fwd`)],[`RWD (zadnji)`,t(`cl_drive_rwd`)],[`AWD / 4x4`,t(`cl_drive_awd`)]];if(Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_tech_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_tech_sub`)}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_fuel`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fFuel">
                        <option value="">${t(`cl_select`)||`Select`}</option>
                        ${e.map(([e,t])=>`<option value="${e}" ${M.fuel===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_transmission`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fTransmission">
                        <option value="">${t(`cl_select`)||`Select`}</option>
                        ${n.map(([e,t])=>`<option value="${e}" ${M.transmission===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_drive`)}</label>
                    <select class="cl-select" id="fDrive">
                        <option value="">${t(`cl_select`)||`Select`}</option>
                        ${r.map(([e,t])=>`<option value="${e}" ${M.driveType===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_displacement`)} <span class="req">*</span></label>
                    <input class="cl-input" id="fEngineCC" type="number" min="0" value="${M.engineCc||``}" placeholder="${t(`cl_placeholder_displacement`)}" />
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_engine_config`,`Konfiguracija motorja`)}</label>
                    <select class="cl-select" id="fEngineConfig">
                        <option value="">—</option>
                        ${[[`I3`,`I3 Trivaljnik`],[`I4`,`I4 Štirivaljnik`],[`V6`,`V6 Šestvaljnik`],[`V8`,`V8 Osemvaljnik`],[`V10`,`V10 Desetvaljnik`],[`V12`,`V12 Dvanajstvaljnik`],[`W12`,`W12 Dvanajstvaljnik`],[`W16`,`W16 Šestnajstvaljnik`],[`Electric`,`Električni motor`]].map(([e,t])=>`<option value="${e}" ${M.engineConfig===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field"></div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <div class="cl-label-with-toggle">
                        <label class="cl-label">${t(`cl_label_power`)} <span class="req">*</span></label>
                        <div class="cl-unit-toggle" id="powerUnitToggle">
                            <button type="button" class="cl-unit-btn active" data-unit="hp">KM</button>
                            <button type="button" class="cl-unit-btn" data-unit="kw">kW</button>
                        </div>
                    </div>
                    <div class="cl-input-wrap">
                        <input class="cl-input" id="fPower" type="number" min="0" value="${M.powerKw?Math.round(M.powerKw*1.35962):``}" placeholder="${t(`cl_placeholder_power`)}" />
                        <span class="cl-input-unit" id="powerUnitLabel">KM</span>
                    </div>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_co2`)}</label>
                    <input class="cl-input" id="fCo2" type="number" min="0" value="${M.co2||``}" placeholder="${t(`cl_placeholder_co2`)}" />
                </div>
            </div>

            ${M.category===`moto`?`
            <div class="cl-a2-row">
                <span class="cl-a2-label">Primerno za A2 izpit</span>
                <div class="cl-unit-toggle" id="a2EligibleToggle">
                    <button type="button" class="cl-unit-btn ${M.a2Eligible?``:`active`}" data-val="false">Ne</button>
                    <button type="button" class="cl-unit-btn ${M.a2Eligible?`active`:``}" data-val="true">Da</button>
                </div>
            </div>`:``}

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_emission`)}</label>
                    <select class="cl-select" id="fEuro">
                        <option value="">—</option>
                        ${[`Euro 4`,`Euro 5`,`Euro 6`,`Euro 6d`,`Euro 6d-temp`].map(e=>`<option value="${e}" ${M.emissionClass===e?`selected`:``}>${e}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_towing`)}</label>
                    <input class="cl-input" id="fTow" type="number" min="0" value="${M.towingKg||``}" placeholder="${t(`cl_placeholder_tow`)}" />
                </div>
            </div>

            <!-- Consumption fields (only for non-electric) -->
            <div class="cl-conditional" id="consumptionFields">
                <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1rem 0;" />
                <p class="cl-label" style="font-weight:600;margin-bottom:0.75rem;">${t(`cl_label_consumption`)} (l/100km)</p>
                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_combined`)} <span class="req">*</span></label>
                        <input class="cl-input" id="fConsCombined" type="number" step="0.1" min="0" value="${M.fuelL100kmCombined||``}" placeholder="${t(`cl_placeholder_cons`)}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_city`)}</label>
                        <input class="cl-input" id="fConsCity" type="number" step="0.1" min="0" value="${M.fuelL100kmCity||``}" placeholder="${t(`cl_placeholder_cons`)}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_highway`)}</label>
                        <input class="cl-input" id="fConsHighway" type="number" step="0.1" min="0" value="${M.fuelL100kmHighway||``}" placeholder="${t(`cl_placeholder_cons`)}" />
                    </div>
                </div>
            </div>

            <!-- Electric fields -->
            <div class="cl-conditional" id="elFields">
                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_battery`)}</label>
                        <input class="cl-input" id="fBattery" type="number" min="0" value="${M.batteryKwh||``}" placeholder="${t(`cl_placeholder_battery`)}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_range`)}</label>
                        <input class="cl-input" id="fRange" type="number" min="0" value="${M.rangeKm||``}" placeholder="${t(`cl_placeholder_range`)}" />
                    </div>
                </div>
                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">Zdravje baterije (%)</label>
                        <input class="cl-input" id="fBatteryHealth" type="number" min="0" max="100" value="${M.batteryHealth||``}" placeholder="npr. 92" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Poraba (kWh/100 km)</label>
                        <input class="cl-input" id="fConsKwh" type="number" min="0" step="0.1" value="${M.consumptionKwh100||``}" placeholder="npr. 18.5" />
                    </div>
                </div>
            </div>

            <!-- Hybrid sub -->
            <div class="cl-conditional" id="hybridFields">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_hybrid_type`)}</label>
                    <select class="cl-select" id="fHybridType">
                        <option value="">${t(`cl_select`)||`Select`}</option>
                        ${[[`PetrolHybrid`,t(`cl_hybrid_petrol`)],[`DizelHibrid`,t(`cl_hybrid_diesel`)],[`PlugIn`,t(`cl_hybrid_plugin`)],[`MildHibrid`,t(`cl_hybrid_mild`)]].map(([e,t])=>`<option value="${e}" ${M.hybridType===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                <div class="cl-row" id="phevExtraFields" style="display:none;">
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_battery`)}</label>
                        <input class="cl-input" id="fPhevBattery" type="number" min="0" value="${M.batteryKwh||``}" placeholder="${t(`cl_placeholder_battery`)}" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">${t(`cl_label_range`)}</label>
                        <input class="cl-input" id="fPhevRange" type="number" min="0" value="${M.rangeKm||``}" placeholder="${t(`cl_placeholder_range`)}" />
                    </div>
                </div>
                <div class="cl-row" id="phevExtraFields2" style="display:none;">
                    <div class="cl-field">
                        <label class="cl-label">Zdravje baterije (%)</label>
                        <input class="cl-input" id="fPhevBatteryHealth" type="number" min="0" max="100" value="${M.batteryHealth||``}" placeholder="npr. 92" />
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Poraba (kWh/100 km)</label>
                        <input class="cl-input" id="fPhevConsKwh" type="number" min="0" step="0.1" value="${M.consumptionKwh100||``}" placeholder="npr. 18.5" />
                    </div>
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnTechBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnTechNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons(),M._imported){let e=M._imported;e.fuel&&document.getElementById(`fFuel`)?.classList.add(`imported-field`),e.transmission&&document.getElementById(`fTransmission`)?.classList.add(`imported-field`),e.powerKw&&document.getElementById(`fPower`)?.classList.add(`imported-field`)}let i=document.getElementById(`fFuel`),a=document.getElementById(`fHybridType`),o=()=>{let e=i.value,t=e===`Hibrid`&&a?.value===`PlugIn`;document.getElementById(`elFields`)?.classList.toggle(`visible`,e===`Elektrika`),document.getElementById(`hybridFields`)?.classList.toggle(`visible`,e===`Hibrid`),document.getElementById(`consumptionFields`)?.classList.toggle(`visible`,e!==``&&e!==`Elektrika`);let n=document.getElementById(`phevExtraFields`),r=document.getElementById(`phevExtraFields2`);n&&(n.style.display=t?``:`none`),r&&(r.style.display=t?``:`none`)};i.addEventListener(`change`,o),a?.addEventListener(`change`,o),o();let s=[[`fFuel`,`fuel`],[`fEngineCC`,`engineCc`],[`fConsCity`,`fuelL100kmCity`],[`fConsHighway`,`fuelL100kmHighway`],[`fConsCombined`,`fuelL100kmCombined`],[`fRange`,`rangeKm`]];s.forEach(([e,t])=>{let n=document.getElementById(e);if(!n)return;let r=n.tagName===`SELECT`?`change`:`input`;n.addEventListener(r,()=>{M._manualFields||=new Set,M._manualFields.add(t),n.classList.remove(`cl-autofilled`);let e=n.closest(`.cl-field`),r=e?e.querySelector(`.cl-autofill-icon`):null;r&&r.remove()})}),M._autoFillFields&&s.forEach(([e,n])=>{if(M._autoFillFields.has(n)&&(!M._manualFields||!M._manualFields.has(n))){let n=document.getElementById(e);if(n){n.classList.add(`cl-autofilled`);let e=n.closest(`.cl-field`);if(e&&!e.querySelector(`.cl-autofill-icon`)){let n=e.querySelector(`.cl-label`),r=document.createElement(`span`);r.className=`cl-autofill-icon`,r.innerHTML=`?`,r.title=t(`cl_autofill_tooltip`,`Sistem je samodejno izpolnil ta podatek glede na izbran model. Če se podatek razlikuje, ga lahko spremenite.`),n?n.appendChild(r):e.appendChild(r)}}}}),y();let c=`hp`,l=document.getElementById(`fPower`),u=document.querySelectorAll(`#powerUnitToggle .cl-unit-btn`),d=document.getElementById(`powerUnitLabel`);u.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.unit;if(t===c)return;let n=parseFloat(l.value);isNaN(n)||(t===`kw`?l.value=Math.round(n/1.35962):l.value=Math.round(n*1.35962)),u.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),c=t,d.textContent=t===`hp`?`KM`:`kW`})});let f=document.getElementById(`a2EligibleToggle`);f&&f.querySelectorAll(`.cl-unit-btn`).forEach(e=>{e.addEventListener(`click`,()=>{f.querySelectorAll(`.cl-unit-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),M.a2Eligible=e.dataset.val===`true`})});function p(){let e=document.getElementById(`fBattery`),t=document.getElementById(`fRange`),n=document.getElementById(`fConsKwh`);if(!e||!t||!n)return;let r=parseFloat(e.value),i=parseFloat(t.value);if(!r||!i||i===0||n._manualKwh)return;n.value=Math.round(r/i*100*10)/10;let a=n.closest(`.cl-field`);if(a&&!a.querySelector(`.cl-autofill-icon`)){let e=a.querySelector(`.cl-label`),t=document.createElement(`span`);t.className=`cl-autofill-icon`,t.innerHTML=`?`,t.title=`Izračunano iz kapacitete baterije in dosega. Vrednost lahko spremenite.`,e&&e.appendChild(t)}}document.getElementById(`fBattery`)?.addEventListener(`input`,p),document.getElementById(`fRange`)?.addEventListener(`input`,p),document.getElementById(`fConsKwh`)?.addEventListener(`input`,function(){this._manualKwh=!0,this.closest(`.cl-field`)?.querySelector(`.cl-autofill-icon`)?.remove()});function m(){let e=document.getElementById(`fConsCity`),t=document.getElementById(`fConsHighway`),n=document.getElementById(`fConsCombined`);if(!e||!t||!n)return;let r=parseFloat(e.value),i=parseFloat(t.value);if(!r||!i||n._manualCombined)return;n.value=Math.round((r+i)/2*10)/10;let a=n.closest(`.cl-field`);if(a&&!a.querySelector(`.cl-autofill-icon`)){let e=a.querySelector(`.cl-label`),t=document.createElement(`span`);t.className=`cl-autofill-icon`,t.innerHTML=`?`,t.title=`Izračunano kot povprečje mestne in izvenmestne porabe. Vrednost lahko spremenite.`,e&&e.appendChild(t)}}document.getElementById(`fConsCity`)?.addEventListener(`input`,m),document.getElementById(`fConsHighway`)?.addEventListener(`input`,m),document.getElementById(`fConsCombined`)?.addEventListener(`input`,function(){this._manualCombined=!0,this.closest(`.cl-field`)?.querySelector(`.cl-autofill-icon`)?.remove()}),document.getElementById(`btnTechBack`).addEventListener(`click`,z),document.getElementById(`btnTechNext`).addEventListener(`click`,()=>{let e=document.getElementById(`fEngineCC`).value,n=parseFloat(l.value);if(!i.value)return alert(t(`cl_err_fuel`));if(!document.getElementById(`fTransmission`).value)return alert(t(`cl_err_trans`));if(!e)return alert(t(`cl_err_displacement`));if(isNaN(n))return alert(t(`cl_err_power`));if(i.value!==`Elektrika`&&!document.getElementById(`fConsCombined`)?.value)return alert(t(`cl_err_consumption`,`Prosimo vnesite porabo goriva (kombinirana).`));M.fuel=i.value,M.transmission=document.getElementById(`fTransmission`).value,M.driveType=document.getElementById(`fDrive`).value,M.engineCc=e,M.engineConfig=document.getElementById(`fEngineConfig`)?.value||``,M.powerKw=c===`kw`?n:Math.round(n/1.35962),M.co2=document.getElementById(`fCo2`).value,M.emissionClass=document.getElementById(`fEuro`).value,M.towingKg=document.getElementById(`fTow`).value,M.fuelL100kmCombined=document.getElementById(`fConsCombined`)?.value||``,M.fuelL100kmCity=document.getElementById(`fConsCity`)?.value||``,M.fuelL100kmHighway=document.getElementById(`fConsHighway`)?.value||``,M.hybridType=document.getElementById(`fHybridType`)?.value||null;let r=M.fuel===`Hibrid`&&M.hybridType===`PlugIn`;M.fuel===`Elektrika`?(M.batteryKwh=document.getElementById(`fBattery`)?.value||``,M.rangeKm=document.getElementById(`fRange`)?.value||``,M.batteryHealth=document.getElementById(`fBatteryHealth`)?.value||``,M.consumptionKwh100=document.getElementById(`fConsKwh`)?.value||``):r?(M.batteryKwh=document.getElementById(`fPhevBattery`)?.value||``,M.rangeKm=document.getElementById(`fPhevRange`)?.value||``,M.batteryHealth=document.getElementById(`fPhevBatteryHealth`)?.value||``,M.consumptionKwh100=document.getElementById(`fPhevConsKwh`)?.value||``):(M.batteryKwh=``,M.rangeKm=``,M.batteryHealth=``,M.consumptionKwh100=``),R()})}function yt(){let e=B(),n=[[`Bencin`,`Bencin (bencinec)`],[`Dizel`,`Dizel`],[`Elektrika`,`Električni pogon`],[`Hibrid`,`Hibrid (benzin + električni)`],[`Brez motorja`,`Brez motorja (jadra)`]],r=[[`Izvenkrmni`,`Izvenkrmni (outboard)`],[`Notranji`,`Notranji (inboard)`],[`Stern Drive`,`Stern drive (volvo/mercruiser)`],[`Potisnik`,`Potisnik (pod trup)`],[`Električni`,`Električni motor`],[`Jadra`,`Samo jadra (brez motorja)`]];e.engineTypes===`noSail`&&(n=n.filter(([e])=>e!==`Brez motorja`),r=r.filter(([e])=>e!==`Jadra`));let i=[`1`,`2`,`3`,`4`],a=M.fuel===`Brez motorja`,o=e.driveSystem!==!1,s=!!e.engineBrand;Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${e.motorProduct?`Podatki izvenkrmnega motorja`:`Tehnični podatki motorja`}</h2>
            <p class="cl-step-sub">${e.motorProduct?`Opišite izvenkrmni motor.`:`Opišite pogonski sistem plovila.`}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Vrsta goriva / pogona <span class="req">*</span></label>
                    <select class="cl-select" id="fFuel">
                        <option value="">— Izberite —</option>
                        ${n.map(([e,t])=>`<option value="${e}" ${M.fuel===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>
                ${o?`
                <div class="cl-field">
                    <label class="cl-label">Pogonski sistem <span class="req">*</span></label>
                    <select class="cl-select" id="fDriveSystem">
                        <option value="">—</option>
                        ${r.map(([e,t])=>`<option value="${e}" ${M.driveSystem===e?`selected`:``}>${t}</option>`).join(``)}
                    </select>
                </div>`:``}
            </div>

            ${s?`
            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Znamka motorja</label>
                    <select class="cl-select" id="fEngineBrand">
                        <option value="">— Izberite znamko motorja —</option>
                    </select>
                </div>
            </div>`:``}

            <div id="navMotorFields" style="${a?`display:none;`:``}">
                <div class="cl-row">
                    <div class="cl-field">
                        <div class="cl-label-with-toggle">
                            <label class="cl-label">Moč motorja <span class="req">*</span></label>
                            <div class="cl-unit-toggle" id="powerUnitToggle">
                                <button type="button" class="cl-unit-btn active" data-unit="hp">KM</button>
                                <button type="button" class="cl-unit-btn" data-unit="kw">kW</button>
                            </div>
                        </div>
                        <div class="cl-input-wrap">
                            <input class="cl-input" id="fPower" type="number" min="0"
                                value="${M.powerKw?Math.round(M.powerKw*1.35962):``}" placeholder="npr. 150" />
                            <span class="cl-input-unit" id="powerUnitLabel">KM</span>
                        </div>
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Prostornina motorja (cc)</label>
                        <input class="cl-input" id="fEngineCC" type="number" min="0"
                            value="${M.engineCc||``}" placeholder="npr. 2700" />
                    </div>
                </div>

                <div class="cl-row">
                    <div class="cl-field">
                        <label class="cl-label">Število motorjev <span class="req">*</span></label>
                        <select class="cl-select" id="fEngineCount">
                            ${i.map(e=>`<option value="${e}" ${M.engineCount===e?`selected`:``}>${e}</option>`).join(``)}
                        </select>
                    </div>
                    <div class="cl-field">
                        <label class="cl-label">Kapaciteta rezervoarja (L) <span class="req">*</span></label>
                        <input class="cl-input" id="fFuelTank" type="number" min="0"
                            value="${M.fuelTankL||``}" placeholder="npr. 200" />
                    </div>
                </div>
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">Maks. hitrost (vozliči)</label>
                    <input class="cl-input" id="fMaxSpeed" type="number" min="0"
                        value="${M.maxSpeedKn||``}" placeholder="npr. 28" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">Rezervoar za vodo (L)</label>
                    <input class="cl-input" id="fWaterTank" type="number" min="0"
                        value="${M.waterTankL||``}" placeholder="npr. 150" />
                </div>
            </div>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnTechBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnTechNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons(),y(),s&&fetch(`json/brands_models_izvenkrmni.json`).then(e=>e.json()).then(e=>{let t=document.getElementById(`fEngineBrand`);t&&(Object.keys(e).sort((e,t)=>e.localeCompare(t,`en`)).forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=e,M.engineBrand===e&&(n.selected=!0),t.appendChild(n)}),b(t))}).catch(()=>{});let c=document.getElementById(`fFuel`),l=document.getElementById(`navMotorFields`);c.addEventListener(`change`,()=>{let e=c.value===`Brez motorja`;l&&(l.style.display=e?`none`:``)});let u=_t(`fPower`,`powerUnitToggle`,`powerUnitLabel`);document.getElementById(`btnTechBack`).addEventListener(`click`,z),document.getElementById(`btnTechNext`).addEventListener(`click`,()=>{let e=c.value===`Brez motorja`,t=!0;if(c.value||(H(`fFuel`),t=!1),!e){o&&!document.getElementById(`fDriveSystem`)?.value&&(H(`fDriveSystem`),t=!1);let e=parseFloat(document.getElementById(`fPower`)?.value||``);(isNaN(e)||e<=0)&&(H(`fPower`),t=!1),document.getElementById(`fFuelTank`)?.value||(H(`fFuelTank`),t=!1)}if(t){if(M.fuel=c.value,M.driveSystem=o?document.getElementById(`fDriveSystem`)?.value||``:`Izvenkrmni`,M.engineBrand=s&&document.getElementById(`fEngineBrand`)?.value||``,M.engineCount=document.getElementById(`fEngineCount`)?.value||`1`,M.fuelTankL=document.getElementById(`fFuelTank`)?.value||``,M.maxSpeedKn=document.getElementById(`fMaxSpeed`).value,M.waterTankL=document.getElementById(`fWaterTank`).value,e)M.powerKw=0,M.engineCc=``;else{let e=parseFloat(document.getElementById(`fPower`)?.value||``);M.powerKw=u()===`kw`?e:Math.round(e/1.35962),M.engineCc=document.getElementById(`fEngineCC`)?.value||``}R()}})}function bt(){let e=u(M.category),n=M.category===`moto`,r=n&&M.equipment.includes(`SportExhaust`),i=e.map(e=>{let n=(M.customEquipment||[]).filter(t=>t.category===e.id).map((t,n)=>`
            <button type="button" class="cl-chip cl-chip--custom active"
                data-custom-idx="${n}" data-custom-cat="${e.id}">${a(t.value)} <span class="cl-chip-remove" data-remove-custom="${n}" data-remove-cat="${e.id}">×</span></button>`).join(``);return`
        <div class="cl-equipment-group" data-group-id="${e.id}">
            <p class="cl-equipment-group-title"><i data-lucide="${e.icon}"></i> ${t(e.label)}</p>
            <div class="cl-chips">
                ${e.items.map(e=>`
                    <button type="button" class="cl-chip ${M.equipment.includes(e.value)?`active`:``}"
                        data-val="${e.value}">${t(e.label)}</button>`).join(``)}
                ${n}
            </div>
            <div class="cl-custom-eq-add" data-group="${e.id}" style="margin-top:.5rem">
                <button type="button" class="cl-btn-inline cl-btn-inline--add" data-open-custom="${e.id}">
                    + ${t(`cl_eq_add_custom`,`Dodaj lastno opremo`)}
                </button>
                <div class="cl-custom-eq-input" id="cl-custom-eq-${e.id}" style="display:none;margin-top:.5rem;display:none">
                    <input class="cl-input cl-input--sm" type="text" maxlength="80"
                        id="cl-custom-eq-val-${e.id}"
                        placeholder="${t(`cl_eq_custom_placeholder`,`npr. Porsche Active Ride`)}" />
                    <p class="cl-hint" style="margin:.25rem 0 .4rem">${t(`cl_eq_custom_hint`,`Vnesite samo ime funkcije/opreme — bo shranjeno v taksonomijo za to znamko.`)}</p>
                    <button type="button" class="cl-btn cl-btn--sm cl-btn--primary" data-confirm-custom="${e.id}">${t(`cl_eq_custom_add`,`Dodaj`)}</button>
                    <button type="button" class="cl-btn cl-btn--sm cl-btn--ghost" data-cancel-custom="${e.id}">${t(`cl_cancel`,`Prekliči`)}</button>
                </div>
            </div>
        </div>`}).join(``);function a(e){return e.replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}let o=n?`
        <div id="cl-exhaust-sub" style="${r?``:`display:none;`}background:rgba(0,0,0,0.03);border-radius:1rem;padding:1rem 1.25rem;margin-bottom:1rem;">
            <p class="cl-equipment-group-title" style="margin-bottom:.75rem;"><i data-lucide="wind"></i> Podrobnosti izpuha</p>
            <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;">
                <button type="button" class="cl-chip${M.exhaustType===``?` active`:``}" data-exhaust-type="">Vse vrste</button>
                <button type="button" class="cl-chip${M.exhaustType===`slip-on`?` active`:``}" data-exhaust-type="slip-on">Slip-on</button>
                <button type="button" class="cl-chip${M.exhaustType===`full-system`?` active`:``}" data-exhaust-type="full-system">Full System</button>
            </div>
            <select id="cl-exhaust-brand" class="cl-input" style="max-width:280px;">
                <option value="">Znamka izpuha (opcijsko)</option>
            </select>
        </div>`:``;Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_eq_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_eq_sub`)}</p>
            ${i}
            ${o}
            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnEqBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnEqNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons(),document.querySelectorAll(`.cl-chip[data-val]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.val;if(M.equipment.includes(t)){if(M.equipment=M.equipment.filter(e=>e!==t),e.classList.remove(`active`),t===`SportExhaust`){let e=document.getElementById(`cl-exhaust-sub`);e&&(e.style.display=`none`),M.exhaustType=``,M.exhaustBrand=``}}else if(M.equipment=[...M.equipment,t],e.classList.add(`active`),t===`SportExhaust`){let e=document.getElementById(`cl-exhaust-sub`);e&&(e.style.display=``)}})}),document.querySelectorAll(`.cl-chip[data-exhaust-type]`).forEach(e=>{e.addEventListener(`click`,()=>{M.exhaustType=e.dataset.exhaustType,document.querySelectorAll(`.cl-chip[data-exhaust-type]`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)})}),n&&fetch(`json/exhaust_brands.json`).then(e=>e.json()).then(e=>{let t=document.getElementById(`cl-exhaust-brand`);t&&(e.forEach(e=>{let n=document.createElement(`option`);n.value=e,n.textContent=e,e===M.exhaustBrand&&(n.selected=!0),t.appendChild(n)}),t.value=M.exhaustBrand||``,t.addEventListener(`change`,()=>{M.exhaustBrand=t.value}))}).catch(()=>{}),document.querySelectorAll(`[data-open-custom]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.openCustom,n=document.getElementById(`cl-custom-eq-${t}`);n&&(n.style.display=n.style.display===`none`?``:`none`)})}),document.querySelectorAll(`[data-confirm-custom]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.confirmCustom,n=document.getElementById(`cl-custom-eq-val-${t}`),r=n?n.value.trim():``;r&&(M.customEquipment||=[],M.customEquipment.some(e=>e.category===t&&e.value.toLowerCase()===r.toLowerCase())||(M.customEquipment=[...M.customEquipment,{category:t,value:r}]),bt())})}),document.querySelectorAll(`[data-cancel-custom]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.cancelCustom,n=document.getElementById(`cl-custom-eq-${t}`);n&&(n.style.display=`none`)})}),document.querySelectorAll(`[data-remove-cat]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.removeCat,r=Number(e.dataset.removeCustom),i=(M.customEquipment||[]).filter(e=>e.category===n)[r];i&&(M.customEquipment=M.customEquipment.filter(e=>e!==i)),bt()})}),document.getElementById(`btnEqBack`).addEventListener(`click`,z),document.getElementById(`btnEqNext`).addEventListener(`click`,R)}var U=`exterior`;function xt(){let e=M._photoLostNotice?`<div style="background:#fef3c7;border:1.5px solid #f59e0b;border-radius:0.75rem;padding:0.75rem 1rem;margin-bottom:1.25rem;font-size:0.85rem;color:#92400e;display:flex;gap:0.5rem;align-items:flex-start;">
               <span style="flex-shrink:0;">⚠️</span>
               <span>Vaše fotografije niso bile shranjene med prijavo — prosimo, naložite jih znova.</span>
           </div>`:``;M._photoLostNotice=!1;let n=``;if(M._aiImported){let e=(M._aiImportWarnings||[]).length?`<ul style="margin:0.4rem 0 0;padding-left:1.1rem;">${M._aiImportWarnings.map(e=>`<li>${$(e)}</li>`).join(``)}</ul>`:``;n=`<div style="background:#ecfdf5;border:1.5px solid #10b981;border-radius:0.75rem;padding:0.75rem 1rem;margin-bottom:1.25rem;font-size:0.85rem;color:#065f46;">
               <div style="display:flex;gap:0.5rem;align-items:flex-start;"><span style="flex-shrink:0;">✨</span>
               <span><strong>${$(`${M.make} ${M.model}`.trim())}</strong> ${t(`cl_ai_imported_ok`,`je bil uvožen. Preverite vse korake in dodajte fotografije.`)}</span></div>
               ${e}
           </div>`,M._aiImported=!1,M._aiImportWarnings=null}Q(`
        <div class="cl-card">
            ${e}
            ${n}
            <h2 class="cl-step-title">${t(`cl_media_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_media_sub`)}</p>

            <div class="cl-media-tabs">
                <button class="cl-media-tab ${U===`exterior`?`active`:``}" data-tab="exterior">
                    ${F()?`⛵`:`🚗`} ${F()?`Plovilo`:t(`cl_media_exterior`)}
                    <span class="cl-media-tab-count" id="extCount">${M._exteriorFiles.length}</span>
                </button>
                <button class="cl-media-tab ${U===`interior`?`active`:``}" data-tab="interior">
                    ${F()?`🛋️`:`🪑`} ${F()?`Kabina / Cockpit`:t(`cl_media_interior`)}
                    <span class="cl-media-tab-count" id="intCount">${M._interiorFiles.length}</span>
                </button>
            </div>

            <div class="cl-dropzone" id="dropzone">
                <div class="cl-dropzone-icon">📷</div>
                <p id="dropzoneLabel">${t(U===`exterior`?`cl_media_dz_ext`:`cl_media_dz_int`)}</p>
                <small>${t(`cl_media_dz_sub`)}</small>
                <input type="file" id="fileInput" multiple accept="image/*" style="display:none;" />
            </div>

            <div class="cl-thumb-grid" id="thumbGrid"></div>
            <p class="cl-thumb-hint" id="thumbHint" style="display:none;">
                ${U===`exterior`?t(`cl_media_hint_cover`):``} ${t(`cl_media_hint_remove`)}
            </p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnMediaBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnMediaNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),St(),W(),document.querySelectorAll(`.cl-media-tab`).forEach(e=>{e.addEventListener(`click`,()=>{U=e.dataset.tab,xt()})}),document.getElementById(`btnMediaBack`).addEventListener(`click`,z),document.getElementById(`btnMediaNext`).addEventListener(`click`,()=>{if(M._exteriorFiles.length===0)return alert(t(`cl_err_min_photos`));R()})}function St(){let e=document.getElementById(`dropzone`),t=document.getElementById(`fileInput`);e.addEventListener(`click`,()=>t.click()),e.addEventListener(`dragover`,t=>{t.preventDefault(),e.classList.add(`dragover`)}),e.addEventListener(`dragleave`,()=>e.classList.remove(`dragover`)),e.addEventListener(`drop`,t=>{t.preventDefault(),e.classList.remove(`dragover`),Ct(t.dataTransfer.files)}),t.addEventListener(`change`,()=>Ct(t.files))}function Ct(e){let n=U===`exterior`,r=n?M._exteriorFiles:M._interiorFiles,i=n?M._exteriorUrls:M._interiorUrls;Array.from(e).forEach(e=>{if(e.type.startsWith(`image/`)){if(e.size>10*1024*1024)return alert(`${e.name} ${t(`cl_err_file_size`)}`);r.push(e),i.push(URL.createObjectURL(e))}}),W();let a=document.getElementById(`extCount`),o=document.getElementById(`intCount`);a&&(a.textContent=M._exteriorFiles.length),o&&(o.textContent=M._interiorFiles.length)}function W(){let e=document.getElementById(`thumbGrid`),n=document.getElementById(`thumbHint`);if(!e)return;let r=U===`exterior`,i=r?M._exteriorFiles:M._interiorFiles,a=r?M._exteriorUrls:M._interiorUrls;if(i.length===0){e.innerHTML=``,n&&(n.style.display=`none`);return}n&&(n.style.display=`block`),e.innerHTML=a.map((e,n)=>`
        <div class="cl-thumb ${r&&n===M.coverIndex?`is-cover`:``}" data-idx="${n}">
            <img src="${e}" alt="${t(`cl_label_color`)||`Slika`} ${n+1}" />
            ${r&&n===M.coverIndex?`<span class="cl-thumb-cover-badge">${t(`cl_media_cover_badge`)}</span>`:``}
            <button class="cl-thumb-remove" data-remove="${n}" title="${t(`cl_btn_remove`)||`Odstrani`}">×</button>
        </div>`).join(``),e.querySelectorAll(`.cl-thumb`).forEach(e=>{e.addEventListener(`click`,t=>{t.target.closest(`[data-remove]`)||r&&(M.coverIndex=Number(e.dataset.idx),W())})}),e.querySelectorAll(`[data-remove]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.remove);URL.revokeObjectURL(a[t]),i.splice(t,1),a.splice(t,1),r&&M.coverIndex>=i.length&&(M.coverIndex=0),W();let n=document.getElementById(`extCount`),o=document.getElementById(`intCount`);n&&(n.textContent=M._exteriorFiles.length),o&&(o.textContent=M._interiorFiles.length)})})}function wt(){let e=M.sellerType===`business`;Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_desc_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_desc_sub`)}</p>

            <div class="cl-field">
                <label class="cl-label">${t(`cl_label_desc`)}</label>
                <textarea class="cl-textarea" id="fDesc" maxlength="3000" placeholder="${t(`cl_placeholder_desc`)}">${$(M.description||``)}</textarea>
                <span id="descCount" style="font-size:0.75rem;color:#94a3b8;text-align:right;">${(M.description||``).length} / 3000</span>
            </div>

            ${e?`
            <p style="font-size:0.82rem;color:#92400e;padding:0.75rem 1rem;background:#fef3c7;border-radius:0.6rem;border:1px solid #fde68a;margin-bottom:0.75rem;">
                ${t(`cl_desc_warn_business`)}
            </p>`:``}

            <p style="font-size:0.82rem;color:#64748b;padding:0.75rem 1rem;background:rgba(37,99,235,0.04);border-radius:0.6rem;border:1px solid rgba(37,99,235,0.1);">
                ${t(`cl_desc_tip`)}
            </p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnDescBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnDescNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `);let n=document.getElementById(`fDesc`),r=document.getElementById(`descCount`);n.addEventListener(`input`,()=>{r.textContent=`${n.value.length} / 3000`}),document.getElementById(`btnDescBack`).addEventListener(`click`,z),document.getElementById(`btnDescNext`).addEventListener(`click`,()=>{M.description=n.value.trim(),R()})}var Tt=null;function Et(){let e=[{...m.auction3w,label:t(`cl_auction_pkg_3w`,`3 tedne`),desc:t(`cl_auction_pkg_3w_desc`,`Dražba traja 3 tedne`)},{...m.auction6w,label:t(`cl_auction_pkg_6w`,`6 tednov`),desc:t(`cl_auction_pkg_6w_desc`,`Dražba traja 6 tednov`)}].map(e=>`
        <div class="cl-promo-card ${M.auctionPackageId===e.id?`selected`:``}" data-pkg="${e.id}" data-weeks="${e.weeks}">
            <span class="cl-promo-icon">🔨</span>
            <p class="cl-promo-name">${e.label}</p>
            <p class="cl-promo-price">${e.price.toLocaleString(`sl-SI`,{minimumFractionDigits:2})} €</p>
            <p class="cl-promo-desc">${e.desc}</p>
        </div>`).join(``);Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_auction_title`,`Dražba`)}</h2>
            <p class="cl-step-sub">${t(`cl_auction_sub`,`Izberite trajanje, začetno ceno in podpišite zavezo k prodaji.`)}</p>

            <label class="cl-label">${t(`cl_auction_package`,`Trajanje dražbe`)} <span class="req">*</span></label>
            <div class="cl-promo-grid">${e}</div>

            <div class="cl-field">
                <label class="cl-label">${t(`cl_auction_start_price`,`Začetna cena`)} <span class="req">*</span></label>
                <div class="cl-price-wrap">
                    <input class="cl-input" id="fStartPrice" type="text" inputmode="numeric"
                        value="${A(M.startPriceEur)}" placeholder="0" autocomplete="off" />
                    <span class="cl-price-currency">€</span>
                </div>
                <span style="font-size:0.75rem;color:#94a3b8;">${t(`cl_auction_start_price_hint`,`Izhodiščna cena, od katere se začne licitiranje.`)}</span>
            </div>

            <div class="cl-field">
                <label class="cl-checkbox-label" style="margin-bottom:0.5rem;">
                    <input type="checkbox" id="fHasReserve" ${M.reservePriceEur?`checked`:``} />
                    ${t(`cl_auction_reserve_toggle`,`Dodaj minimalno ceno (reserve)`)}
                </label>
                <div id="reserveWrap" style="display:${M.reservePriceEur?`flex`:`none`};">
                    <div class="cl-price-wrap">
                        <input class="cl-input" id="fReserve" type="text" inputmode="numeric"
                            value="${A(M.reservePriceEur||``)}" placeholder="0" autocomplete="off" />
                        <span class="cl-price-currency">€</span>
                    </div>
                </div>
            </div>

            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />

            ${te({party:`seller`,title:t(`cl_auction_seller_contract_title`,`Zaveza k prodaji`),body:t(`cl_auction_seller_contract_body`,`S podpisom se zavezujete, da boste vozilo prodali kupcu po končni (zadnji) ponujeni ceni ob zaključku dražbe.`)})}

            <p class="cl-promo-note" style="margin-top:1rem;">${t(`cl_auction_note`,`Plačilo paketa se izvede po objavi. Trenutno je beleženo kot namera (test).`)}</p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnAucBack">${t(`cl_btn_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnAucNext">${t(`cl_btn_continue`)}</button>
            </div>
        </div>
    `),document.querySelectorAll(`.cl-promo-card`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.cl-promo-card`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),M.auctionPackageId=e.dataset.pkg,M.auctionDurationWeeks=Number(e.dataset.weeks)})});let n=document.getElementById(`fStartPrice`);_(n);let r=document.getElementById(`fReserve`);_(r),document.getElementById(`fHasReserve`).addEventListener(`change`,e=>{document.getElementById(`reserveWrap`).style.display=e.target.checked?`flex`:`none`,e.target.checked||(M.reservePriceEur=``,r.value=``)}),ee(document.querySelector(`.ac-contract`),{title:`Zaveza k prodaji na dražbi — MojAvto.si`,fileName:`zaveza-prodaja-drazba`,lines:[`Prodajalec se s tem dokumentom zavezuje, da bo predmet dražbe (vozilo) prodal`,`kupcu, ki ob zaključku dražbe odda najvišjo veljavno ponudbo, in sicer po tej`,`končni ceni.`,``,`Prodajalec potrjuje, da je navedena začetna cena resnična in zavezujoča.`,``,`Ta dokument se hrani le do zaključka dražbe.`]}).then(e=>{Tt=e}),document.getElementById(`btnAucBack`).addEventListener(`click`,z),document.getElementById(`btnAucNext`).addEventListener(`click`,()=>{if(M.startPriceEur=v(n.value)||``,M.reservePriceEur=document.getElementById(`fHasReserve`).checked&&v(r.value)||``,!M.startPriceEur||Number(M.startPriceEur)<=0){alert(t(`cl_auction_err_start_price`,`Vnesite veljavno začetno ceno.`));return}let e=Tt&&Tt();if(!S(e)){alert(t(`cl_auction_err_contract`,`Podpišite zavezo k prodaji ali prenesite in potrdite PDF pogodbo.`));return}M.sellerContract={type:e.type,signatureData:e.signatureData||null},M.priceEur=M.startPriceEur,R()})}function Dt(){let n=!!M.callForPrice,r=e.hasGlobalRentalToggle,i=M.listingType===`rental`,a=M.rentalPricing||{};Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_price_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_price_sub`)}</p>

            ${r?`
            <div class="cl-field">
                <label class="cl-label">${t(`cl_listing_type`,`Vrsta oglasa`)}</label>
                <div class="unit-toggle-pill" id="clListingTypeToggle" style="width:fit-content;">
                    <button type="button" class="unit-btn ${i?``:`active`}" data-mode="sale">${t(`cl_sale`,`Prodaja`)}</button>
                    <button type="button" class="unit-btn ${i?`active`:``}" data-mode="rental">${t(`cl_rental`,`Najem`)}</button>
                </div>
            </div>

            <div class="cl-field" id="rentalPricingWrap" style="display:${i?`block`:`none`};">
                <label class="cl-label">${t(`cl_rental_pricing`,`Cenik najema`)}</label>
                <div class="cl-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentDay" type="text" value="${$(a.perDay??``)}" placeholder="${t(`cl_rent_per_day`,`Cena / dan`)}" autocomplete="off" /><span class="cl-price-currency">€</span></div>
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentWeek" type="text" value="${$(a.perWeek??``)}" placeholder="${t(`cl_rent_per_week`,`Cena / teden`)}" autocomplete="off" /><span class="cl-price-currency">€</span></div>
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentDeposit" type="text" value="${$(a.deposit??``)}" placeholder="${t(`cl_rent_deposit`,`Varščina`)}" autocomplete="off" /><span class="cl-price-currency">€</span></div>
                    <div class="cl-price-wrap"><input class="cl-input" id="fRentMinDays" type="text" value="${$(a.minDays??``)}" placeholder="${t(`cl_rent_min_days`,`Min. dni`)}" autocomplete="off" /></div>
                </div>
            </div>
            `:``}

            <div class="cl-checkboxes" style="margin-bottom:1rem;">
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fCallForPrice" ${n?`checked`:``} />
                    ${t(`cl_label_call_for_price`)}
                </label>
            </div>

            <div class="cl-field" id="priceFieldWrap" style="${n?`display:none;`:``}">
                <label class="cl-label">${t(`cl_label_price`)} <span class="req">*</span></label>
                <div class="cl-price-wrap">
                    <input class="cl-input" id="fPrice" type="text"
                        value="${A(M.priceEur)}" placeholder="0" autocomplete="off" />
                    <span class="cl-price-currency">€</span>
                </div>
            </div>

            <div class="cl-field" id="salePriceWrap" style="${n?`display:none;`:``}">
                <label class="cl-checkbox-label" style="margin-bottom:0.5rem;">
                    <input type="checkbox" id="fHasSalePrice" ${M.salePriceEur?`checked`:``} />
                    Dodaj znižano ceno (popust)
                </label>
                <div id="salePriceInputWrap" style="display:${M.salePriceEur?`flex`:`none`}; flex-direction:column; gap:0.35rem;">
                    <div class="cl-price-wrap">
                        <input class="cl-input" id="fSalePrice" type="text"
                            value="${A(M.salePriceEur||``)}" placeholder="0" autocomplete="off" />
                        <span class="cl-price-currency">€</span>
                    </div>
                    <span style="font-size:0.75rem;color:#94a3b8;">Znižana cena je prikazana na oglasu. Originalna cena je vidna samo pri podrobnem ogledu.</span>
                </div>
            </div>

            <div class="cl-checkboxes">
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fNeg" ${M.priceNegotiable?`checked`:``} />
                    ${t(`cl_label_negotiable`)}
                </label>
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fFinalPrice" ${M.priceIsFinal?`checked`:``} />
                    ${t(`cl_label_final_price`)}
                </label>
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fVat" ${M.priceInclVat?`checked`:``} />
                    ${t(`cl_label_vat`)}
                </label>
                ${M.sellerType===`business`?``:`
                <label class="cl-checkbox-label">
                    <input type="checkbox" id="fLease" ${M.leaseAvailable?`checked`:``} />
                    ${t(`cl_label_lease`)}
                </label>`}
            </div>

            ${M.sellerType===`business`?`
            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />
            <div class="cl-field">
                <label class="cl-label" style="font-weight:600;">${t(`cl_financing_title`)}</label>
                <p style="font-size:0.82rem;color:#64748b;margin:0 0 0.75rem;">${t(`cl_financing_sub`)}</p>
                <div class="cl-checkboxes" style="margin-bottom:0.75rem;">
                    <label class="cl-checkbox-label">
                        <input type="checkbox" id="fOffersLeasing" ${M.leasingConditions?`checked`:``} />
                        ${t(`cl_label_offers_leasing`)}
                    </label>
                </div>
                <div id="leasingConditionsWrap" style="display:${M.leasingConditions?`block`:`none`};">
                    <label class="cl-label">${t(`cl_label_leasing_terms`)}</label>
                    <textarea class="cl-textarea" id="fLeasingConditions" maxlength="1000"
                        placeholder="${t(`cl_placeholder_leasing`)}"
                        style="min-height:120px;">${$(M.leasingConditions||``)}</textarea>
                    <span style="font-size:0.75rem;color:#94a3b8;text-align:right;display:block;" id="leasingCount">${(M.leasingConditions||``).length} / 1000</span>
                </div>
            </div>`:``}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnPriceBack">${t(`cl_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnPriceNext">${t(`cl_continue`)}</button>
            </div>
        </div>
    `),document.getElementById(`fCallForPrice`).addEventListener(`change`,e=>{document.getElementById(`priceFieldWrap`).style.display=e.target.checked?`none`:``,document.getElementById(`salePriceWrap`).style.display=e.target.checked?`none`:``}),document.getElementById(`fHasSalePrice`).addEventListener(`change`,e=>{document.getElementById(`salePriceInputWrap`).style.display=e.target.checked?`flex`:`none`,e.target.checked||(M.salePriceEur=null)});let o=document.getElementById(`clListingTypeToggle`);o&&o.querySelectorAll(`.unit-btn`).forEach(e=>{e.addEventListener(`click`,()=>{o.querySelectorAll(`.unit-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),M.listingType=e.dataset.mode===`rental`?`rental`:`sale`;let t=document.getElementById(`rentalPricingWrap`);t&&(t.style.display=M.listingType===`rental`?`block`:`none`)})});let s=document.getElementById(`fPrice`);M._imported?.price&&s?.classList.add(`imported-field`),s&&_(s);let c=document.getElementById(`fSalePrice`);c&&_(c);let l=document.getElementById(`fOffersLeasing`);if(l){l.addEventListener(`change`,e=>{document.getElementById(`leasingConditionsWrap`).style.display=e.target.checked?`block`:`none`});let e=document.getElementById(`fLeasingConditions`),t=document.getElementById(`leasingCount`);e&&t&&e.addEventListener(`input`,()=>{t.textContent=`${e.value.length} / 1000`})}document.getElementById(`btnPriceBack`).addEventListener(`click`,z),document.getElementById(`btnPriceNext`).addEventListener(`click`,()=>{let n=document.getElementById(`fCallForPrice`).checked;if(n)M.priceEur=0;else{let e=document.getElementById(`fPrice`).value,n=v(e);if(!n||n<=0)return alert(t(`cl_err_price`));M.priceEur=n}if(M.callForPrice=n,document.getElementById(`fHasSalePrice`).checked&&!n){let e=document.getElementById(`fSalePrice`).value,t=v(e);t>0&&t<M.priceEur?M.salePriceEur=t:(M.salePriceEur=null,t>=M.priceEur&&alert(`Znižana cena mora biti nižja od originalne cene.`))}else M.salePriceEur=null;if(M.priceNegotiable=document.getElementById(`fNeg`).checked,M.priceIsFinal=document.getElementById(`fFinalPrice`).checked,M.priceInclVat=document.getElementById(`fVat`).checked,e.hasGlobalRentalToggle&&M.listingType===`rental`){let e=e=>v(document.getElementById(e)?.value||``)||``;M.rentalPricing={perDay:e(`fRentDay`),perWeek:e(`fRentWeek`),deposit:e(`fRentDeposit`),minDays:e(`fRentMinDays`)}}if(M.sellerType===`business`){let e=document.getElementById(`fOffersLeasing`)?.checked;M.leaseAvailable=e||!1,M.leasingConditions=e&&document.getElementById(`fLeasingConditions`)?.value.trim()||``}else M.leaseAvailable=document.getElementById(`fLease`)?.checked||!1,M.leasingConditions=``;R()})}function Ot(){let e=M.sellerType===`business`,n=M.location?.country||``,r=M.location?.region||``,i=de.map(e=>`<option value="${e.code}" ${n===e.code?`selected`:``}>${e.label}</option>`).join(``),o=n?ue(n).map(e=>`<option value="${e}" ${r===e?`selected`:``}>${e}</option>`).join(``):``,s=[{key:`mon`,label:t(`cl_day_mon`)},{key:`tue`,label:t(`cl_day_tue`)},{key:`wed`,label:t(`cl_day_wed`)},{key:`thu`,label:t(`cl_day_thu`)},{key:`fri`,label:t(`cl_day_fri`)},{key:`sat`,label:t(`cl_day_sat`)},{key:`sun`,label:t(`cl_day_sun`)}],c=M.businessHours||{};Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_loc_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_loc_sub`)}</p>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_country`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fCountry">
                        <option value="">${t(`cl_sel_country`)}</option>
                        ${i}
                    </select>
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_region`)} <span class="req">*</span></label>
                    <select class="cl-select" id="fRegion" ${n?``:`disabled`}>
                        <option value="">${t(`cl_sel_region`)}</option>
                        ${o}
                    </select>
                </div>
            </div>

            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />

            <div class="cl-field">
                <label class="cl-label">${t(`cl_label_contact_name`)} <span class="req">*</span></label>
                <input class="cl-input" id="fContactName" type="text" value="${$(M.contact?.name||``)}" />
            </div>

            <div class="cl-row">
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_phone`)}</label>
                    <input class="cl-input" id="fPhone" type="tel" value="${$(M.contact?.phone||``)}" placeholder="+386 ..." />
                </div>
                <div class="cl-field" style="justify-content:flex-end;">
                    <label class="cl-checkbox-label" style="margin-top:1.6rem;">
                        <input type="checkbox" id="fShowPhone" ${M.contact?.showPhone?`checked`:``} />
                        ${t(`cl_label_show_phone`)}
                    </label>
                </div>
            </div>

            ${e?``:`
            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />
            <div class="cl-field">
                <label class="cl-label">${t(`cl_label_seller_note`)} <span style="font-size:0.78rem;color:#94a3b8;">(${t(`optional`)||`optional`})</span></label>
                <textarea class="cl-input" id="fSellerNote" rows="3" placeholder="${t(`cl_placeholder_seller_note`)}"
                    style="resize:vertical;">${$(M.sellerNote||``)}</textarea>
                <span class="cl-hint">${t(`cl_hint_seller_note`)}</span>
            </div>`}

            ${e?`
            <hr style="border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.25rem 0;" />
            <div class="cl-field">
                <label class="cl-label">${t(`cl_label_business_hours`)} <span style="font-size:0.78rem;color:#94a3b8;">(${t(`optional`)||`optional`})</span></label>
                <div class="cl-bh-grid" style="display:grid;gap:0.5rem;margin-top:0.5rem;">
                    ${s.map(e=>`
                    <div class="cl-bh-row" style="display:grid;grid-template-columns:7rem 1fr 0.4rem 1fr auto;align-items:center;gap:0.5rem;">
                        <label class="cl-checkbox-label" style="margin:0;">
                            <input type="checkbox" class="bh-check" data-day="${e.key}" ${c[e.key]?`checked`:``} />
                            ${e.label}
                        </label>
                        <input class="cl-input" type="time" id="bh_${e.key}_from" value="${$(c[e.key]?.from||`08:00`)}"
                            ${c[e.key]?``:`disabled`} style="padding:0.4rem;" />
                        <span style="text-align:center;color:#94a3b8;">–</span>
                        <input class="cl-input" type="time" id="bh_${e.key}_to" value="${$(c[e.key]?.to||`17:00`)}"
                            ${c[e.key]?``:`disabled`} style="padding:0.4rem;" />
                        <span class="cl-bh-closed" id="bh_${e.key}_label"
                            style="font-size:0.75rem;color:#94a3b8;width:4rem;">${c[e.key]?``:t(`cl_label_closed`)}</span>
                    </div>`).join(``)}
                </div>
            </div>`:``}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnLocBack">${t(`cl_btn_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnLocNext">${t(`cl_btn_continue`)}</button>
            </div>
        </div>
    `),document.getElementById(`btnLocBack`).addEventListener(`click`,z),y(),window.lucide&&window.lucide.createIcons();let l=document.getElementById(`fCountry`),u=document.getElementById(`fRegion`);l.addEventListener(`change`,()=>{let e=l.value;u.innerHTML=`<option value="">${t(`cl_sel_region`)}</option>`,e?(ue(e).forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,u.appendChild(t)}),u.disabled=!1):u.disabled=!0}),e&&document.querySelectorAll(`.bh-check`).forEach(e=>{e.addEventListener(`change`,()=>{let n=e.dataset.day,r=e.checked;document.getElementById(`bh_${n}_from`).disabled=!r,document.getElementById(`bh_${n}_to`).disabled=!r,document.getElementById(`bh_${n}_label`).textContent=r?``:t(`cl_label_closed`)})}),document.getElementById(`btnLocNext`).addEventListener(`click`,()=>{let n=document.getElementById(`fCountry`).value,r=document.getElementById(`fRegion`).value,i=document.getElementById(`fContactName`).value.trim();if(!n)return alert(t(`cl_err_country`));if(!r)return alert(t(`cl_err_region`));if(!i)return alert(t(`cl_err_contact_name`));if(M.location={country:n,region:r},M.contact={name:i,phone:document.getElementById(`fPhone`).value.trim(),showPhone:document.getElementById(`fShowPhone`).checked,email:a.currentUser?.email||``},!e)M.sellerNote=document.getElementById(`fSellerNote`)?.value.trim()||``;else{let e={};s.forEach(t=>{document.querySelector(`.bh-check[data-day="${t.key}"]`)?.checked&&(e[t.key]={from:document.getElementById(`bh_${t.key}_from`).value||`08:00`,to:document.getElementById(`bh_${t.key}_to`).value||`17:00`})}),M.businessHours=e}R()})}function kt(){let e=[{id:`free`,icon:`📋`,name:t(`cl_tier_free`),price:t(`cl_price_free`),desc:t(`cl_tier_free_desc`)},{id:`homepage`,icon:`⭐`,name:t(`cl_tier_featured`),price:t(`cl_price_featured`),desc:t(`cl_tier_featured_desc`)},{id:`sponsored`,icon:`🚀`,name:t(`cl_tier_sponsored`),price:t(`cl_price_sponsored`),desc:t(`cl_tier_sponsored_desc`)}].map(e=>`
        <div class="cl-promo-card ${M.promotionTier===e.id?`selected`:``}" data-tier="${e.id}">
            <span class="cl-promo-icon">${e.icon}</span>
            <p class="cl-promo-name">${e.name}</p>
            <p class="cl-promo-price">${e.price}</p>
            <p class="cl-promo-desc">${e.desc}</p>
        </div>`).join(``);Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_promo_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_promo_sub`)}</p>

            <div class="cl-promo-grid">${e}</div>

            <p class="cl-promo-note">
                ${t(`cl_promo_note`)}
            </p>

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnPromoBack">${t(`cl_btn_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnPromoNext">${t(`cl_btn_continue`)}</button>
            </div>
        </div>
    `),document.querySelectorAll(`.cl-promo-card`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.cl-promo-card`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),M.promotionTier=e.dataset.tier})}),document.getElementById(`btnPromoBack`).addEventListener(`click`,z),document.getElementById(`btnPromoNext`).addEventListener(`click`,R)}var G=null,K={condition:[[`Rabljeno`,`cl_condition_used`],[`Novo`,`cl_condition_new`],[`Razstavno vozilo`,`cl_condition_demo`],[`Starodobnik`,`cl_condition_classic`],[`Za dele`,`cl_condition_for_parts`]],color:[`Bela`,`Črna`,`Siva`,`Srebrna`,`Modra`,`Rdeča`,`Zelena`,`Rumena`,`Rjava`,`Oranžna`,`Vijolična`,`Zlata`,`Bronasta`,`Druga`],fuel:[[`Petrol`,`cl_fuel_petrol`],[`Dizel`,`cl_fuel_diesel`],[`Hibrid`,`cl_fuel_hybrid`],[`Elektrika`,`cl_fuel_electric`],[`LPG`,`cl_fuel_lpg`],[`CNG`,`cl_fuel_cng`],[`Vodik`,`cl_fuel_hydrogen`]],transmission:[[`Ročni`,`cl_trans_manual`],[`Avtomatski`,`cl_trans_automatic`],[`Polavtomatski`,`cl_trans_semi`]],drive:[[`FWD (sprednji)`,`cl_drive_fwd`],[`RWD (zadnji)`,`cl_drive_rwd`],[`AWD / 4x4`,`cl_drive_awd`]],emission:[`Euro 4`,`Euro 5`,`Euro 6`,`Euro 6d`,`Euro 6d-temp`]},q=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function J(e,n,r,i){let a=r.map(e=>{let[r,i]=Array.isArray(e)?[e[0],t(e[1],e[0])]:[e,e];return`<option value="${q(r)}" ${n===r?`selected`:``}>${q(i)}</option>`}).join(``);return`<select class="cl-select cl-redit-input" id="${e}">${i?`<option value="">${q(i)}</option>`:``}${a}</select>`}function Y(e,t){return`<div class="cl-redit-field"><label class="cl-redit-label">${q(e)}</label>${t}</div>`}function X(e,t,n=``){return`<input class="cl-input cl-redit-input" id="${e}" value="${q(t)}" ${n} />`}function At(e){if(!j(M)||F())return``;switch(e){case`category`:{let e=it.find(e=>e.id===M.category),n=(e?.subs||[]).map(e=>[e.value,t(e.name,e.value)]),r=e?t(e.label,M.category):M.category;return`<div class="cl-redit-grid">
                ${Y(t(`cl_section_category`),`<div class="cl-redit-static">${q(r)}</div>`)}
                ${Y(t(`cl_label_subcategory`,`Podkategorija`),n.length?J(`reSubcategory`,M.subcategory,n,t(`cl_sel_body_type`,`Izberite`)):X(`reSubcategory`,M.subcategory))}
            </div>`}case`basic`:return`<div class="cl-redit-grid">
                ${Y(t(`cl_label_make`),X(`reMake`,M.make))}
                ${Y(t(`cl_label_model`),X(`reModel`,M.model))}
                ${Y(t(`cl_label_year`),X(`reYear`,M.year,`type="number" min="1900" max="2100"`))}
                ${Y(t(`cl_label_mileage_review`),X(`reMileage`,M.mileageKm,`type="number" min="0"`))}
                ${Y(t(`cl_label_condition`),J(`reCondition`,M.condition,K.condition))}
                ${Y(t(`cl_label_color`),J(`reColor`,M.color,K.color,t(`cl_sel_color`,`Izberite barvo`)))}
            </div>`;case`technical`:return`<div class="cl-redit-grid">
                ${Y(t(`cl_label_fuel`),J(`reFuel`,M.fuel,K.fuel,t(`cl_sel_fuel`,`Izberite`)))}
                ${Y(t(`cl_label_transmission`),J(`reTransmission`,M.transmission,K.transmission,t(`cl_sel_transmission`,`Izberite`)))}
                ${Y(t(`cl_drive_label`,`Pogon`),J(`reDrive`,M.driveType,K.drive,t(`cl_sel_drive`,`Izberite`)))}
                ${Y(t(`cl_label_power_review`,`Moč (kW)`),X(`rePowerKw`,M.powerKw,`type="number" min="0"`))}
                ${Y(t(`cl_label_displacement_review`,`Prostornina (cc)`),X(`reEngineCc`,M.engineCc,`type="number" min="0"`))}
                ${Y(t(`cl_label_emissions`),J(`reEmission`,M.emissionClass,K.emission,t(`cl_sel_emission`,`—`)))}
                ${Y(t(`cl_label_cons_combined`,`Poraba (komb.)`),X(`reConsComb`,M.fuelL100kmCombined,`type="number" step="0.1" min="0"`))}
                ${Y(t(`cl_label_cons_city`,`Poraba (mesto)`),X(`reConsCity`,M.fuelL100kmCity,`type="number" step="0.1" min="0"`))}
                ${Y(t(`cl_label_cons_highway`,`Poraba (avtocesta)`),X(`reConsHwy`,M.fuelL100kmHighway,`type="number" step="0.1" min="0"`))}
                ${Y(t(`cl_label_range_review`,`Doseg (km)`),X(`reRange`,M.rangeKm,`type="number" min="0"`))}
            </div>`;case`price`:return`<div class="cl-redit-grid">
                ${Y(t(`cl_section_price`),X(`rePrice`,M.priceEur,`type="number" min="0"`))}
                ${Y(t(`cl_label_negotiable`),`<label class="cl-redit-check"><input type="checkbox" id="reNegotiable" ${M.priceNegotiable?`checked`:``}/> ${t(`cl_val_yes`)}</label>`)}
                ${Y(t(`cl_label_call_for_price`,`Cena po dogovoru`),`<label class="cl-redit-check"><input type="checkbox" id="reCallForPrice" ${M.callForPrice?`checked`:``}/> ${t(`cl_val_yes`)}</label>`)}
            </div>`;case`location`:return`<div class="cl-redit-grid">
                ${Y(t(`cl_label_country`),J(`reCountry`,M.location?.country||``,de.map(e=>[e.code,e.label]),t(`cl_sel_country`,`Izberite`)))}
                ${Y(t(`cl_label_region`),`<select class="cl-select cl-redit-input" id="reRegion"><option value="">${t(`cl_sel_region`,`Izberite`)}</option></select>`)}
                ${Y(t(`cl_label_contact`),X(`reContact`,M.contact?.name||``))}
            </div>`;case`promotion`:return`<div class="cl-redit-grid">
                ${Y(t(`cl_label_tier`),J(`reTier`,M.promotionTier,[[`free`,t(`cl_tier_free`)],[`homepage`,t(`cl_tier_featured`)],[`sponsored`,t(`cl_tier_sponsored`)]]))}
            </div>`;default:return``}}function jt(e){if(e===`location`){let e=document.getElementById(`reCountry`),n=document.getElementById(`reRegion`),r=e=>{if(!n)return;let r=ue(e)||[];n.innerHTML=`<option value="">${t(`cl_sel_region`,`Izberite`)}</option>`+r.map(e=>`<option value="${q(e)}" ${M.location?.region===e?`selected`:``}>${q(e)}</option>`).join(``)};r(M.location?.country||``),e?.addEventListener(`change`,()=>r(e.value))}}function Mt(e){let t=e=>{let t=document.getElementById(e);return t?t.value.trim():``},n=e=>{let t=document.getElementById(e);return!!(t&&t.checked)};switch(e){case`category`:M.subcategory=t(`reSubcategory`),M.bodyType=M.subcategory;break;case`basic`:M.make=t(`reMake`),M.model=t(`reModel`),M.year=t(`reYear`),M.mileageKm=t(`reMileage`),M.condition=t(`reCondition`),M.color=t(`reColor`);break;case`technical`:M.fuel=t(`reFuel`),M.transmission=t(`reTransmission`),M.driveType=t(`reDrive`),M.powerKw=t(`rePowerKw`),M.engineCc=t(`reEngineCc`),M.emissionClass=t(`reEmission`),M.fuelL100kmCombined=t(`reConsComb`),M.fuelL100kmCity=t(`reConsCity`),M.fuelL100kmHighway=t(`reConsHwy`),M.rangeKm=t(`reRange`);break;case`price`:M.priceEur=t(`rePrice`),M.priceNegotiable=n(`reNegotiable`),M.callForPrice=n(`reCallForPrice`);break;case`location`:M.location||={},M.location.country=t(`reCountry`),M.location.region=t(`reRegion`),M.contact||={},M.contact.name=t(`reContact`);break;case`promotion`:M.promotionTier=t(`reTier`)||`free`;break;case`equipment`:break}return k(M),!0}function Nt(){let e=Array.isArray(M.equipment)?M.equipment:[],n=Array.isArray(M.customEquipment)?M.customEquipment:[],r=q,i=G===`equipment`,a=e.length+n.length;if(!i&&a===0)return`
        <div class="cl-review-section">
            <div class="cl-review-section-header">
                <span class="cl-review-section-title">${t(`cl_eq_title`,`Oprema in dodatki`)}</span>
                <button class="cl-review-edit-btn" data-redit-open="equipment">✎ ${t(`cl_btn_edit`)}</button>
            </div>
            <div class="cl-review-eq-empty">${t(`cl_eq_none`,`Ni izbrane opreme.`)}</div>
        </div>`;if(i){let i=u(M.category).map(i=>{let a=i.items.map(n=>`
                <button type="button" class="cl-review-eq-chip cl-review-eq-chip--toggle ${e.includes(n.value)?`active`:``}" data-eq-toggle="${r(n.value)}">${r(t(n.label,n.value))}</button>`).join(``),o=n.filter(e=>e.category===i.id).map(e=>`
                <span class="cl-review-eq-chip cl-review-eq-chip--custom active">${r(e.value)}<span class="cl-review-eq-remove" data-eq-custom-remove="${r(e.value)}" data-eq-custom-cat="${r(i.id)}">×</span></span>`).join(``);return`<div class="cl-review-eq-group">
                <span class="cl-review-eq-group-label"><i data-lucide="${i.icon}"></i> ${r(t(i.label,i.id))}</span>
                <div class="cl-review-eq-chips">${a}${o}
                    <button type="button" class="cl-review-eq-addcustom" data-eq-add-custom="${r(i.id)}">+ ${t(`cl_eq_add_custom`,`Dodaj lastno`)}</button>
                </div>
            </div>`}).join(``);return`
        <div class="cl-review-section cl-review-section--editing">
            <div class="cl-review-section-header">
                <span class="cl-review-section-title">${t(`cl_eq_title`,`Oprema in dodatki`)} <span class="cl-review-eq-count">${a}</span></span>
            </div>
            <div class="cl-review-eq-body">${i}</div>
            <div class="cl-redit-actions">
                <button class="cl-btn cl-btn--sm cl-btn--primary" data-redit-cancel>${t(`cl_done`,`Končano`)}</button>
            </div>
        </div>`}let o=d.map(n=>{let i=n.items.filter(t=>e.includes(t.value));if(!i.length)return``;let a=i.map(e=>`<span class="cl-review-eq-chip">${r(t(e.label,e.value))}</span>`).join(``);return`<div class="cl-review-eq-group">
            <span class="cl-review-eq-group-label"><i data-lucide="${n.icon}"></i> ${r(t(n.label,n.id))}</span>
            <div class="cl-review-eq-chips">${a}</div>
        </div>`}).filter(Boolean).join(``),s=n.length?`<div class="cl-review-eq-group">
            <span class="cl-review-eq-group-label"><i data-lucide="plus-circle"></i> ${t(`cl_eq_custom_pending`,`Dodatna oprema (v pregledu)`)}</span>
            <div class="cl-review-eq-chips">${n.map(e=>`<span class="cl-review-eq-chip cl-review-eq-chip--custom">${r(e.value||``)}</span>`).join(``)}</div>
        </div>`:``;return`
        <div class="cl-review-section">
            <div class="cl-review-section-header">
                <span class="cl-review-section-title">${t(`cl_eq_title`,`Oprema in dodatki`)} <span class="cl-review-eq-count">${a}</span></span>
                <button class="cl-review-edit-btn" data-redit-open="equipment">✎ ${t(`cl_btn_edit`)}</button>
            </div>
            <div class="cl-review-eq-body">${o}${s}</div>
        </div>`}function Z(){let e=e=>new Intl.NumberFormat(n()===`sl`?`sl-SI`:`en-US`).format(e),r={free:t(`cl_tier_free`),homepage:t(`cl_tier_featured`),sponsored:t(`cl_tier_sponsored`)},i=M._exteriorUrls.length>0?`<img src="${M._exteriorUrls[M.coverIndex]}" alt="Naslovna" style="width:100%;height:200px;object-fit:cover;border-radius:0.85rem;margin-bottom:1rem;" />`:``;function o(e,n,r){let i=At(n),a=i!==``;if(a&&G===n)return`
            <div class="cl-review-section cl-review-section--editing">
                <div class="cl-review-section-header">
                    <span class="cl-review-section-title">${e}</span>
                </div>
                ${i}
                <div class="cl-redit-actions">
                    <button class="cl-btn cl-btn--sm cl-btn--ghost" data-redit-cancel>${t(`cl_cancel`,`Prekliči`)}</button>
                    <button class="cl-btn cl-btn--sm cl-btn--primary" data-redit-save="${n}">${t(`cl_save`,`Shrani`)}</button>
                </div>
            </div>`;let o=r.filter(([,e])=>e).map(([e,t])=>`
            <div class="cl-review-item">
                <span class="cl-review-item-label">${e}</span>
                <span class="cl-review-item-value">${$(String(t))}</span>
            </div>`).join(``);return`
            <div class="cl-review-section">
                <div class="cl-review-section-header">
                    <span class="cl-review-section-title">${e}</span>
                    ${a?`<button class="cl-review-edit-btn" data-redit-open="${n}">✎ ${t(`cl_btn_edit`)}</button>`:`<button class="cl-review-edit-btn" data-jump="${n}">✎ ${t(`cl_btn_edit`)}</button>`}
                </div>
                <div class="cl-review-grid">${o}</div>
            </div>`}Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_review_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_review_sub`)}</p>

            ${i}
            <p style="font-size:0.8rem;color:#94a3b8;margin-bottom:1.5rem;">
                ${t(`cl_review_media_count`,{ext:M._exteriorFiles.length,int:M._interiorFiles.length})}
            </p>

            ${j(M)?o(t(`cl_section_category`),`category`,[[t(`cl_section_category`),M.category],[t(`cl_label_subcategory`),M.subcategory]]):o(t(`cl_section_category`),`category`,[[t(`cl_what_are_you_listing`,`Kaj objavljate?`),M.itemType===`tire`?t(`cl_sub_guma`,`Pnevmatika`):M.itemType===`oprema`?t(`cl_sub_oprema`,`Moto oprema`):t(`cl_sub_del`,`Nadomestni del`)],[t(`gd_choose_vehicle_cat`,`Za katero vozilo?`),(oe.find(e=>e.value===M.vehicleCategory)||{}).label]])}

            ${j(M)?o(t(`cl_section_basic`),`basic`,F()?[[`Znamka`,M.make],[`Model`,M.model],[`Letnik`,M.year],[`Dolžina`,M.lengthM?M.lengthM+` m`:``],[`Ure motorja`,M.engineHoursUsed===``?``:e(M.engineHoursUsed)+` h`],[`Stanje`,M.condition],[`Material trupa`,M.hullMaterial],[`Barva`,M.color],[`Kabine / Ležišča`,M.cabins||M.berths?`${M.cabins||`—`} / ${M.berths||`—`}`:``]]:[[t(`cl_label_make`),M.make],[t(`cl_label_model`),M.model],[t(`cl_label_year`),M.year],[t(`cl_label_mileage_review`),M.mileageKm?e(M.mileageKm)+` km`:``],[t(`cl_label_condition`),M.condition],[t(`cl_label_color`),M.color]]):``}

            ${j(M)?o(t(`cl_section_technical`),`technical`,F()?[[`Gorivo / pogon`,M.fuel],[`Pogonski sistem`,M.driveSystem],[`Znamka motorja`,M.engineBrand],[`Moč motorja`,M.powerKw?`${Math.round(M.powerKw*1.34102)} KM (${M.powerKw} kW)`:``],[`Prostornina`,M.engineCc?M.engineCc+` cc`:``],[`Število motorjev`,M.engineCount],[`Kapaciteta rezervoarja`,M.fuelTankL?M.fuelTankL+` L`:``],[`Maks. hitrost`,M.maxSpeedKn?M.maxSpeedKn+` vozličev`:``]]:[[t(`cl_label_fuel`),M.fuel],[t(`cl_label_transmission`),M.transmission],[t(`cl_label_power_review`),M.powerKw?n()===`sl`?M.powerKw+` kW (`+Math.round(M.powerKw*1.34102)+` KM)`:Math.round(M.powerKw*1.34102)+` HP`:``],[t(`cl_label_displacement_review`),M.engineCc?M.engineCc+` cc`:``],[t(`cl_label_cons_combined`),M.fuelL100kmCombined?M.fuelL100kmCombined+` L/100km`:``],[t(`cl_label_cons_city`),M.fuelL100kmCity?M.fuelL100kmCity+` L/100km`:``],[t(`cl_label_cons_highway`),M.fuelL100kmHighway?M.fuelL100kmHighway+` L/100km`:``],[t(`cl_label_range_review`),M.rangeKm?M.rangeKm+` km`:``],[t(`cl_label_emissions`),M.emissionClass]]):``}

            ${j(M)?Nt():``}

            ${ze(M)?o(t(`cl_step_part_details`,`Podatki o delu`),`partDetails`,[[t(`gd_part_group`,`Sklop`),(ce(M.vehicleCategory).find(e=>e.value===M.partGroup)||{}).label],[t(`gd_part_type`,`Vrsta dela`),M.partTypeLabel||M.partType],[t(`cl_condition`,`Stanje`),M.condition],[t(`gd_part_brand`,`Znamka`),M.brand],[t(`gd_oem_number`,`OEM`),M.oemNumber],[t(`gd_compatibility`,`Združljivost`),[M.vehicleApplication?.make,M.vehicleApplication?.model].filter(Boolean).join(` `)]]):``}

            ${Be(M)?o(t(`cl_step_tire_details`,`Podatki o pnevmatiki`),`tireDetails`,[[t(`gd_tire_size`,`Dimenzija`),M.tireSize],[t(`gd_season`,`Sezona`),M.tireSeason],[t(`gd_part_brand`,`Znamka`),M.brand],[t(`cl_condition`,`Stanje`),M.condition],[t(`gd_tire_count`,`Število kosov`),M.tireCount],[t(`gd_tread_depth`,`Globina profila`),M.treadDepthMm?M.treadDepthMm+` mm`:``],[t(`gd_dot_year`,`DOT`),M.dotYear]]):``}

            ${Ve(M)?o(t(`cl_step_oprema_details`,`Podatki o opremi`),`opremaDetails`,[[t(`gd_eq_group`,`Sklop opreme`),ae(M.equipmentGroup)],[t(`gd_eq_type`,`Vrsta`),M.equipmentTypeLabel||M.equipmentType],[t(`gd_part_brand`,`Znamka`),M.brand],[t(`gd_eq_size`,`Velikost`),M.equipmentSize],[t(`cl_condition`,`Stanje`),M.condition]]):``}

            ${M.entryType===`auction`?o(t(`cl_auction_title`,`Dražba`),`auctionSetup`,[[t(`cl_auction_start_price`,`Začetna cena`),M.startPriceEur?e(M.startPriceEur)+` €`:``],[t(`cl_auction_package`,`Trajanje dražbe`),`${M.auctionDurationWeeks} ${M.auctionDurationWeeks===1?`teden`:M.auctionDurationWeeks<5?`tedne`:`tednov`} (${(m[M.auctionPackageId]?.price||0).toLocaleString(`sl-SI`,{minimumFractionDigits:2})} €)`],[t(`cl_auction_reserve_toggle`,`Minimalna cena`),M.reservePriceEur?e(M.reservePriceEur)+` €`:``],[t(`cl_auction_seller_contract_title`,`Zaveza k prodaji`),M.sellerContract?M.sellerContract.type===`sign`?`✓ Podpisano`:`✓ PDF potrjen`:``]]):o(t(`cl_section_price`),`price`,[[t(`cl_section_price`),M.callForPrice?t(`cl_label_call_for_price`):M.priceEur?n()===`sl`?e(M.priceEur)+` €`:`$`+e(M.priceEur):``],[t(`cl_label_negotiable`),M.priceNegotiable?t(`cl_val_yes`):t(`cl_val_no`)]])}

            ${o(t(`cl_section_location`),`location`,[[t(`cl_label_country`),de.find(e=>e.code===M.location?.country)?.label||M.location?.country],[t(`cl_label_region`),M.location?.region],[t(`cl_label_contact`),M.contact?.name]])}

            ${M.entryType===`auction`?``:o(t(`cl_section_promotion`),`promotion`,[[t(`cl_label_tier`),r[M.promotionTier]||M.promotionTier]])}

            <div class="cl-nav">
                <button class="cl-btn cl-btn--ghost" id="btnRevBack">${t(`cl_btn_back`)}</button>
                <button class="cl-btn cl-btn--primary" id="btnRevNext">${P?`Shrani spremembe`:t(`cl_btn_post`)}</button>
            </div>
        </div>
    `),window.lucide&&window.lucide.createIcons(),document.querySelectorAll(`[data-jump]`).forEach(e=>{e.addEventListener(`click`,()=>Qe(e.dataset.jump))}),document.querySelectorAll(`[data-redit-open]`).forEach(e=>{e.addEventListener(`click`,()=>{G=e.dataset.reditOpen,Z()})}),document.querySelectorAll(`[data-redit-cancel]`).forEach(e=>{e.addEventListener(`click`,()=>{G=null,Z()})}),document.querySelectorAll(`[data-redit-save]`).forEach(e=>{e.addEventListener(`click`,()=>{Mt(e.dataset.reditSave)!==!1&&(G=null,Z())})}),G&&jt(G),document.querySelectorAll(`[data-eq-toggle]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.eqToggle;Array.isArray(M.equipment)||(M.equipment=[]),M.equipment.includes(t)?(M.equipment=M.equipment.filter(e=>e!==t),e.classList.remove(`active`)):(M.equipment=[...M.equipment,t],e.classList.add(`active`)),k(M),Pt()})}),document.querySelectorAll(`[data-eq-add-custom]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.eqAddCustom,r=(window.prompt(t(`cl_eq_custom_placeholder`,`Vnesite ime opreme`))||``).trim();r&&(Array.isArray(M.customEquipment)||(M.customEquipment=[]),M.customEquipment.some(e=>e.category===n&&e.value.toLowerCase()===r.toLowerCase())||(M.customEquipment=[...M.customEquipment,{category:n,value:r}],k(M)),Z())})}),document.querySelectorAll(`[data-eq-custom-remove]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.eqCustomRemove,r=e.dataset.eqCustomCat;M.customEquipment=(M.customEquipment||[]).filter(e=>!(e.category===r&&e.value===n)),k(M),Z()})}),G&&document.querySelector(`.cl-review-section--editing`)?.scrollIntoView({block:`nearest`,behavior:`smooth`}),document.getElementById(`btnRevBack`).addEventListener(`click`,z),document.getElementById(`btnRevNext`).addEventListener(`click`,()=>{a.currentUser?It(a.currentUser):R()})}function Pt(){let e=Array.isArray(M.equipment)?M.equipment:[],t=Array.isArray(M.customEquipment)?M.customEquipment:[];document.querySelectorAll(`.cl-review-eq-count`).forEach(n=>{n.textContent=String(e.length+t.length)})}function Ft(){Q(`
        <div class="cl-card">
            <h2 class="cl-step-title">${t(`cl_auth_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_auth_sub`)}</p>

            <div class="cl-auth-wrap">
                <div class="cl-auth-info">
                    ${t(`cl_auth_info`)}
                </div>

                <button class="cl-btn cl-btn--google" id="btnGoogle">
                    <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="" />
                    ${t(`cl_btn_google`)}
                </button>

                <div class="cl-or">${t(`cl_auth_or`)}</div>

                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_email`)}</label>
                    <input class="cl-input" id="authEmail" type="email" placeholder="vas@email.com" />
                </div>
                <div class="cl-field">
                    <label class="cl-label">${t(`cl_label_password`)}</label>
                    <input class="cl-input" id="authPassword" type="password" placeholder="••••••••" />
                </div>

                <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
                    <button class="cl-btn cl-btn--primary" id="btnLogin" style="flex:1;">${t(`cl_btn_signin`)}</button>
                    <button class="cl-btn cl-btn--secondary" id="btnRegister" style="flex:1;">${t(`cl_btn_register`)}</button>
                </div>

                <p id="authError" style="color:#dc2626;font-size:0.82rem;margin-top:0.75rem;display:none;"></p>
            </div>

            <div class="cl-nav" style="margin-top:1.25rem;">
                <button class="cl-btn cl-btn--ghost" id="btnAuthBack">${t(`cl_btn_back`)}</button>
            </div>
        </div>
    `),document.getElementById(`btnAuthBack`).addEventListener(`click`,z);let e=e=>{let t=document.getElementById(`authError`);t.textContent=e,t.style.display=`block`},n=()=>M._exteriorFiles.length>0||M._exteriorUrls.length>0,c=async e=>{if(!n()){M._photoLostNotice=!0,Qe(`media`);return}await It(e)};document.getElementById(`btnGoogle`).addEventListener(`click`,async()=>{try{await c((await o(a,new i)).user)}catch(t){e(t.message)}}),document.getElementById(`btnLogin`).addEventListener(`click`,async()=>{try{let e=document.getElementById(`authEmail`).value,t=document.getElementById(`authPassword`).value;await c((await r(a,e,t)).user)}catch(n){e(t(`cl_err_signin`)+n.message)}}),document.getElementById(`btnRegister`).addEventListener(`click`,async()=>{try{let e=document.getElementById(`authEmail`).value,t=document.getElementById(`authPassword`).value;await c((await s(a,e,t)).user)}catch(n){e(t(`cl_err_register`)+n.message)}})}async function It(e){let n=document.getElementById(`clStepContainer`);n.innerHTML=`
        <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
            <div class="cl-submit-spinner" style="margin:0 auto 1.5rem;"></div>
            <h2 class="cl-step-title">${t(`cl_submitting_title`)}</h2>
            <p class="cl-step-sub">${t(`cl_submitting_sub`)}</p>
        </div>`,window.lucide&&window.lucide.createIcons();try{let r=await c();r&&r.sellerType&&(M.sellerType=r.sellerType);let i,a=!!P;if(P){let[t,n]=await Promise.all([M._exteriorFiles.length>0?(await l(async()=>{let{uploadImages:e}=await import(`./listingService-B896QzBR.js`);return{uploadImages:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url)).uploadImages(M._exteriorFiles,e.uid):Promise.resolve([]),M._interiorFiles.length>0?(await l(async()=>{let{uploadImages:e}=await import(`./listingService-B896QzBR.js`);return{uploadImages:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url)).uploadImages(M._interiorFiles,e.uid):Promise.resolve([])]),r=[...M._exteriorUrls.filter(e=>e.startsWith(`http`)),...t],a=[...M._interiorUrls.filter(e=>e.startsWith(`http`)),...n];await f(P,{category:M.category,subcategory:M.subcategory,bodyType:M.bodyType,itemType:M.itemType,make:M.make,model:M.model,variant:M.variant,linija:M.linija,year:M.year?Number(M.year):null,mileageKm:M.mileageKm?Number(M.mileageKm):null,mileage:M.mileageKm?Number(M.mileageKm):null,color:M.color,colorType:M.colorType,doorsCount:M.doorsCount?Number(M.doorsCount):null,seatsCount:M.seatsCount?Number(M.seatsCount):null,condition:M.condition,firstRegistration:M.firstRegistration,previousOwnersCount:M.previousOwnersCount?Number(M.previousOwnersCount):null,fuel:M.fuel,hybridType:M.hybridType,transmission:M.transmission,driveType:M.driveType,engineCc:M.engineCc?Number(M.engineCc):null,powerKw:M.powerKw?Number(M.powerKw):null,power:M.powerKw?Number(M.powerKw):null,co2:M.co2?Number(M.co2):null,emissionClass:M.emissionClass,fuelL100kmCombined:M.fuelL100kmCombined?Number(M.fuelL100kmCombined):null,batteryKwh:M.batteryKwh?Number(M.batteryKwh):null,rangeKm:M.rangeKm?Number(M.rangeKm):null,equipment:M.equipment,description:M.description,priceEur:Number(M.priceEur)||0,price:Number(M.priceEur)||0,salePriceEur:M.salePriceEur?Number(M.salePriceEur):null,priceNegotiable:M.priceNegotiable,priceInclVat:M.priceInclVat,callForPrice:M.callForPrice,listingType:M.listingType,isRental:M.isRental,location:M.location,contact:M.contact,sellerNote:M.sellerNote,images:{exterior:r,interior:a},coverIndex:M.coverIndex,title:`${M.make||``} ${M.model||``} ${M.variant||``}`.trim()}),i=P,P=null}else i=await h(M,M._exteriorFiles,M._interiorFiles,e),Re();M._exteriorUrls.forEach(e=>{try{URL.revokeObjectURL(e)}catch{}}),M._interiorUrls.forEach(e=>{try{URL.revokeObjectURL(e)}catch{}}),n.innerHTML=`
            <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
                <h2 class="cl-step-title">${a?`Oglas posodobljen!`:t(`cl_success_title`)}</h2>
                <p class="cl-step-sub">${t(`cl_success_sub`)}</p>
                <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem;">
                    <a href="#/${M.entryType===`auction`?`drazba`:`oglas`}?id=${i}" class="cl-btn cl-btn--primary">${t(`cl_btn_view_listing`)}</a>
                    <a href="#/dashboard" class="cl-btn cl-btn--secondary">${t(`cl_btn_my_listings`)}</a>
                </div>
            </div>`,document.getElementById(`clProgress`).style.display=`none`}catch(e){console.error(`[CreateListing] submit error:`,e),n.innerHTML=`
            <div class="cl-card" style="text-align:center;padding:3rem 2rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">❌</div>
                <h2 class="cl-step-title">${t(`cl_error_title`)}</h2>
                <p class="cl-step-sub">${$(e.message)}</p>
                <button class="cl-btn cl-btn--primary" onclick="location.reload()">${t(`cl_btn_retry`)}</button>
            </div>`}}function Q(e){let t=document.getElementById(`clStepContainer`);t&&(t.innerHTML=e)}function $(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}export{Ye as initCreateListingPage};