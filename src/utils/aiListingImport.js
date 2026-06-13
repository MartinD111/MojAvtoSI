// ═══════════════════════════════════════════════════════════════════════════════
// AI Listing Import ("Že imate oglas?") — MojAvto.si  [EXPERIMENTAL]
// ───────────────────────────────────────────────────────────────────────────────
// Lets a seller convert an existing listing (from another site) into a MojAvto.si
// listing with the help of a chatbot (ChatGPT / DeepSeek):
//   1. The seller copies their existing listing text.
//   2. They download a detailed prompt (.txt) generated here and paste it +
//      their listing into the chatbot.
//   3. The chatbot returns a JSON file shaped exactly for our create-listing state.
//   4. The seller pastes that JSON here; we validate + sanitise it against the
//      real taxonomy (same enums/equipment slugs the wizard uses) and hand a clean
//      partial-state back to the wizard, which drops them on the photo step.
//
// This module is the single source of truth for the *import contract*: the enums
// it advertises in the prompt are the same ones it validates against, so the two
// can never drift. Everything that is NOT whitelisted here is dropped.
//
// Scope (v1): vehicles on MojAvto (avto / moto / gospodarska / mehanizacija /
// prosti-cas). Parts, tyres and navtika are intentionally excluded.
// ═══════════════════════════════════════════════════════════════════════════════

import { EQUIPMENT_GROUPS, ALL_EQUIPMENT_VALUES } from '../data/equipment.js';
import { t } from '../core/i18n.js';

// ── The import contract: enums (must mirror create-listing select options) ──────
const FUELS = ['Petrol', 'Dizel', 'Hibrid', 'Elektrika', 'LPG', 'CNG', 'Vodik'];
const FUEL_SYNONYMS = {
    petrol: 'Petrol', bencin: 'Petrol', gasoline: 'Petrol', benzin: 'Petrol',
    diesel: 'Dizel', dizel: 'Dizel', tdi: 'Dizel', hdi: 'Dizel',
    hybrid: 'Hibrid', hibrid: 'Hibrid', phev: 'Hibrid', mhev: 'Hibrid',
    electric: 'Elektrika', elektrika: 'Elektrika', ev: 'Elektrika', bev: 'Elektrika', 'električni': 'Elektrika',
    lpg: 'LPG', 'avtoplin': 'LPG', plin: 'LPG',
    cng: 'CNG', metan: 'CNG',
    vodik: 'Vodik', hydrogen: 'Vodik',
};

const TRANSMISSIONS = ['Ročni', 'Avtomatski', 'Polavtomatski'];
const TRANS_SYNONYMS = {
    manual: 'Ročni', 'ročni': 'Ročni', rocni: 'Ročni',
    automatic: 'Avtomatski', avtomatski: 'Avtomatski', auto: 'Avtomatski', dsg: 'Avtomatski', cvt: 'Avtomatski', tiptronic: 'Avtomatski',
    semi: 'Polavtomatski', 'polavtomatski': 'Polavtomatski', semiautomatic: 'Polavtomatski',
};

const DRIVES = ['FWD (sprednji)', 'RWD (zadnji)', 'AWD / 4x4'];
const DRIVE_SYNONYMS = {
    fwd: 'FWD (sprednji)', 'sprednji': 'FWD (sprednji)', front: 'FWD (sprednji)',
    rwd: 'RWD (zadnji)', 'zadnji': 'RWD (zadnji)', rear: 'RWD (zadnji)',
    awd: 'AWD / 4x4', '4x4': 'AWD / 4x4', '4wd': 'AWD / 4x4', quattro: 'AWD / 4x4', 'štirikolesni': 'AWD / 4x4', stirikolesni: 'AWD / 4x4',
};

const CONDITIONS = ['Rabljeno', 'Novo', 'Razstavno vozilo', 'Starodobnik', 'Za dele'];
const CONDITION_SYNONYMS = {
    used: 'Rabljeno', rabljeno: 'Rabljeno',
    new: 'Novo', novo: 'Novo',
    demo: 'Razstavno vozilo', 'razstavno': 'Razstavno vozilo',
    classic: 'Starodobnik', oldtimer: 'Starodobnik', 'starodobnik': 'Starodobnik',
    'za dele': 'Za dele', parts: 'Za dele', damaged: 'Za dele',
};

const COLOR_TYPES = ['solid', 'metallic', 'matte', 'pearl'];
const COLORS = ['Bela', 'Črna', 'Siva', 'Srebrna', 'Modra', 'Rdeča', 'Zelena', 'Rumena', 'Rjava', 'Oranžna', 'Vijolična', 'Zlata', 'Bronasta', 'Druga'];
const EMISSIONS = ['Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d', 'Euro 6d-temp'];
const ENGINE_CONFIGS = ['I3', 'I4', 'V6', 'V8', 'V10', 'V12', 'W12', 'W16', 'Electric'];

// Category → body-type (vrsta) value list. Values match create-listing CATEGORIES_AVTO.
// The label is a Slovenian gloss the chatbot can match free text against.
const VEHICLE_CATS = {
    avto: {
        label: 'Osebni avtomobil',
        bodyTypes: [
            ['Limuzina', 'Limuzina'], ['Terensko', 'SUV / terensko'], ['Karavan', 'Karavan'],
            ['Kombilimuzina', 'Kombilimuzina (hatchback)'], ['Kabriolet', 'Kabriolet'], ['Coupe', 'Coupe'],
            ['Enoprostorec', 'Enoprostorec (van)'], ['Pick-up', 'Pick-up'], ['Oldtimer', 'Oldtimer / starodobnik'],
        ],
    },
    moto: {
        label: 'Motorno kolo',
        bodyTypes: [
            ['SportniMotor', 'Športni motor'], ['SportniTourer', 'Športni tourer'], ['Adventure', 'Adventure / enduro cestni'],
            ['Skuter', 'Skuter'], ['Enduro', 'Enduro / cross'], ['Chopper', 'Chopper / cruiser'],
            ['Tourer', 'Tourer'], ['atv_utv', 'ATV / štirikolesnik'], ['EMoto', 'Električni motor'],
        ],
    },
    gospodarska: { label: 'Gospodarsko vozilo (kombi, tovornjak, prikolica)', bodyTypes: [] },
    mehanizacija: { label: 'Gradbena / kmetijska mehanizacija', bodyTypes: [] },
    'prosti-cas': { label: 'Prosti čas (avtodom, počitniška prikolica)', bodyTypes: [] },
};

// ── Coercion helpers ────────────────────────────────────────────────────────────
const asString = (v, max = 200) => (v == null ? '' : String(v).trim().slice(0, max));

function asInt(v) {
    if (v == null || v === '') return null;
    const n = parseInt(String(v).replace(/[^\d.-]/g, ''), 10);
    return Number.isFinite(n) ? n : null;
}
function asFloat(v) {
    if (v == null || v === '') return null;
    const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
}
function asBool(v) {
    if (typeof v === 'boolean') return v;
    const s = String(v).toLowerCase().trim();
    return s === 'true' || s === 'da' || s === 'yes' || s === '1';
}

// Match against an enum (exact, then case-insensitive, then synonym map).
function matchEnum(v, list, synonyms) {
    if (v == null) return null;
    const raw = String(v).trim();
    if (!raw) return null;
    if (list.includes(raw)) return raw;
    const lower = raw.toLowerCase();
    const exactCi = list.find(o => o.toLowerCase() === lower);
    if (exactCi) return exactCi;
    if (synonyms && synonyms[lower]) return synonyms[lower];
    return null;
}

// Canonical equipment-value lookup (case-insensitive).
const EQUIP_LOWER = new Map(ALL_EQUIPMENT_VALUES.map(v => [v.toLowerCase(), v]));

// Valid group ids a custom feature can be filed under (matches EQUIPMENT_GROUPS).
const EQUIP_GROUP_IDS = new Set(EQUIPMENT_GROUPS.map(g => g.id));

// Lower-cased translated item labels — so a custom feature that is really just the
// label of an existing slug ("Usnjeni sedeži") isn't proposed as new.
const KNOWN_LABEL_LOWER = new Set(
    EQUIPMENT_GROUPS.flatMap(g => g.items.map(i => String(t(i.label, i.value)).toLowerCase()))
);

// ── Validate + sanitise the chatbot JSON into a wizard-state partial ─────────────
/**
 * @param {string} raw  raw text pasted by the user (may include code fences/prose)
 * @returns {{ ok:boolean, data?:object, errors:string[], warnings:string[] }}
 */
export function parseImportJson(raw) {
    const errors = [];
    const warnings = [];

    let text = String(raw || '').trim();
    if (!text) return { ok: false, errors: ['Prilepite JSON, ki vam ga je vrnil pomočnik AI.'], warnings };

    // Strip markdown code fences and any prose around the object.
    text = text.replace(/```[a-z]*\s*/gi, '').replace(/```/g, '').trim();

    let obj = null;
    try {
        obj = JSON.parse(text);
    } catch {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) { try { obj = JSON.parse(m[0]); } catch { /* fallthrough */ } }
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return { ok: false, errors: ['Besedila ni bilo mogoče prebrati kot JSON. Prilepite celoten odgovor pomočnika — od prvega « { » do zadnjega « } ».'], warnings };
    }

    const d = {};

    // ── Category + body type ──
    let cat = asString(obj.category).toLowerCase();
    if (!VEHICLE_CATS[cat]) {
        if (cat) warnings.push(`Kategorija «${cat}» ni prepoznana — nastavljena bo na «avto». Po potrebi jo popravite v čarovniku.`);
        cat = 'avto';
    }
    d.category = cat;
    const body = matchEnum(obj.bodyType || obj.subcategory, VEHICLE_CATS[cat].bodyTypes.map(b => b[0]));
    if (body) { d.bodyType = body; d.subcategory = body; }
    else if (obj.bodyType) warnings.push(`Karoserija «${asString(obj.bodyType)}» ni prepoznana — izberite jo ročno.`);

    // ── Basic ──
    d.make = asString(obj.make, 60);
    d.model = asString(obj.model, 80);
    d.variant = asString(obj.variant, 80);
    d.linija = asString(obj.linija || obj.line, 60);

    const yr = asInt(obj.year);
    const maxYear = new Date().getFullYear() + 1;
    if (yr && yr >= 1900 && yr <= maxYear) d.year = String(yr);
    else if (obj.year) warnings.push('Letnik ni bil prepoznan — vnesite ga ročno.');

    const km = asInt(obj.mileageKm ?? obj.mileage);
    if (km != null && km >= 0) d.mileageKm = String(km);

    const color = matchEnum(obj.color, COLORS);
    if (color) d.color = color;
    else if (obj.color) warnings.push(`Barva «${asString(obj.color)}» ni v seznamu — izberite jo ročno.`);
    d.colorType = matchEnum(obj.colorType, COLOR_TYPES) || 'solid';

    d.condition = matchEnum(obj.condition, CONDITIONS, CONDITION_SYNONYMS) || 'Rabljeno';

    const doors = asInt(obj.doorsCount ?? obj.doors);
    if (doors && doors >= 1 && doors <= 7) d.doorsCount = String(doors);
    const seats = asInt(obj.seatsCount ?? obj.seats);
    if (seats && seats >= 1 && seats <= 12) d.seatsCount = String(seats);

    // firstRegistration → "YYYY-MM"
    const fr = asString(obj.firstRegistration);
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(fr)) d.firstRegistration = fr;
    else if (/^\d{4}$/.test(fr)) d.firstRegistration = `${fr}-01`;
    else if (fr) warnings.push('Datum prve registracije ni v obliki LLLL-MM — vnesite ga ročno.');

    // ── Technical ──
    const fuel = matchEnum(obj.fuel, FUELS, FUEL_SYNONYMS);
    if (fuel) d.fuel = fuel;
    d.transmission = matchEnum(obj.transmission, TRANSMISSIONS, TRANS_SYNONYMS) || '';
    d.driveType = matchEnum(obj.driveType || obj.drive, DRIVES, DRIVE_SYNONYMS) || '';

    const cc = asInt(obj.engineCc ?? obj.engine_capacity_cc);
    if (cc && cc > 0 && cc < 20000) d.engineCc = String(cc);
    d.engineConfig = matchEnum(obj.engineConfig, ENGINE_CONFIGS) || '';

    const kw = asInt(obj.powerKw);
    if (kw && kw > 0 && kw < 2000) d.powerKw = String(kw);
    else if (obj.powerHp || obj.powerKm) {
        // Some chatbots emit HP/KM despite instructions — convert.
        const hp = asInt(obj.powerHp ?? obj.powerKm);
        if (hp && hp > 0) { d.powerKw = String(Math.round(hp / 1.35962)); warnings.push('Moč je bila podana v KM/HP in pretvorjena v kW — preverite jo.'); }
    }

    const co2 = asInt(obj.co2);
    if (co2 != null && co2 >= 0) d.co2 = String(co2);
    d.emissionClass = matchEnum(obj.emissionClass, EMISSIONS) || '';

    const cc1 = asFloat(obj.fuelL100kmCombined); if (cc1 != null) d.fuelL100kmCombined = String(cc1);
    const cc2 = asFloat(obj.fuelL100kmCity); if (cc2 != null) d.fuelL100kmCity = String(cc2);
    const cc3 = asFloat(obj.fuelL100kmHighway); if (cc3 != null) d.fuelL100kmHighway = String(cc3);

    const bk = asFloat(obj.batteryKwh); if (bk != null) d.batteryKwh = String(bk);
    const rk = asInt(obj.rangeKm); if (rk != null) d.rangeKm = String(rk);
    const tw = asInt(obj.towingKg); if (tw != null) d.towingKg = String(tw);

    // ── Equipment (known slugs) ──
    if (Array.isArray(obj.equipment)) {
        const kept = [];
        let dropped = 0;
        for (const e of obj.equipment) {
            const canon = EQUIP_LOWER.get(String(e).trim().toLowerCase());
            if (canon && !kept.includes(canon)) kept.push(canon);
            else if (e) dropped++;
        }
        d.equipment = kept;
        if (dropped) warnings.push(`${dropped} kos(ov) opreme ni bilo prepoznanih in so bili izpuščeni.`);
    }

    // ── Custom equipment (features with no slug) → routed to admin approval ──
    // The AI is asked to coin a clean Slovenian name and assign each one to a
    // group id. We validate the group, drop duplicates / anything already covered
    // by a known slug, and hand them to the wizard's customEquipment[] — which the
    // listing service turns into pending taxonomy_proposals, exactly like a manual
    // "+ Dodaj lastno opremo" entry.
    if (Array.isArray(obj.customEquipment)) {
        const custom = [];
        let added = 0;
        for (const raw of obj.customEquipment) {
            let category = '', value = '';
            if (raw && typeof raw === 'object') {
                category = asString(raw.category, 40).toLowerCase();
                value = asString(raw.value || raw.name || raw.label, 80);
            } else {
                value = asString(raw, 80);
            }
            if (!value) continue;
            // Skip if it's actually a known slug (or its label) we already mapped.
            if (EQUIP_LOWER.has(value.toLowerCase())) continue;
            if ((d.equipment || []).length && KNOWN_LABEL_LOWER.has(value.toLowerCase())) continue;
            if (!EQUIP_GROUP_IDS.has(category)) category = 'drugo';
            const dup = custom.some(c => c.value.toLowerCase() === value.toLowerCase());
            if (!dup) { custom.push({ category, value }); added++; }
        }
        if (custom.length) d.customEquipment = custom;
        if (added) warnings.push(`${added} dodatnih lastnosti je predlaganih kot lastna oprema — po objavi jih pregleda uredništvo, preden se dodajo v taksonomijo.`);
    }

    // ── Linija (trim line): match known, else propose as custom (admin approval) ──
    const linijaRaw = asString(obj.linija || obj.line, 60);
    if (linijaRaw) {
        // We can't load the per-brand line list here synchronously, so we treat a
        // provided linija as a proposal: the wizard pre-selects the known value if
        // it matches, otherwise it lands in the custom field for approval. We pass
        // both so create-listing can resolve it against vehicle_lines.json.
        d.linija = linijaRaw;
        d._linijaProposed = linijaRaw;
    }

    // ── Description + price ──
    d.description = asString(obj.description, 5000);
    const price = asInt(obj.priceEur ?? obj.price);
    if (price && price > 0) d.priceEur = String(price);
    else warnings.push('Cena ni bila prepoznana — vnesli jo boste v koraku «Cena».');
    if (obj.priceNegotiable != null) d.priceNegotiable = asBool(obj.priceNegotiable);
    if (obj.priceInclVat != null) d.priceInclVat = asBool(obj.priceInclVat);

    // ── Location (optional, best-effort) ──
    if (obj.location && typeof obj.location === 'object') {
        d.location = {
            country: asString(obj.location.country, 4),
            region: asString(obj.location.region, 60),
        };
    }

    // ── Required-field gate (mirrors createListing's vehicle requirements) ──
    if (!d.make) errors.push('Manjka znamka vozila («make»).');
    if (!d.model) errors.push('Manjka model vozila («model»).');
    if (!d.fuel) errors.push('Manjka ali ni prepoznano gorivo («fuel»: Petrol, Dizel, Hibrid, Elektrika, LPG, CNG ali Vodik).');

    return { ok: errors.length === 0, data: d, errors, warnings };
}

// ── Prompt (.txt) generator ─────────────────────────────────────────────────────
function equipmentPromptSection() {
    const wanted = ['avto', 'moto', 'all'];
    const lines = [];
    for (const g of EQUIPMENT_GROUPS) {
        if (!g.categories.some(c => wanted.includes(c))) continue;
        lines.push(`  [skupina id="${g.id}"] ${t(g.label, g.id)}`);
        for (const item of g.items) {
            lines.push(`    - "${t(item.label, item.value)}" → ${item.value}`);
        }
    }
    return lines.join('\n');
}

// Comma list of group ids a custom feature can be assigned to.
function equipmentGroupIdList() {
    const wanted = ['avto', 'moto', 'all'];
    return EQUIPMENT_GROUPS
        .filter(g => g.categories.some(c => wanted.includes(c)))
        .map(g => `"${g.id}" (${t(g.label, g.id)})`)
        .join(', ');
}

function bodyTypePromptSection() {
    const lines = [];
    for (const [id, cfg] of Object.entries(VEHICLE_CATS)) {
        if (!cfg.bodyTypes.length) { lines.push(`  category "${id}" (${cfg.label}): bodyType ni obvezen`); continue; }
        lines.push(`  category "${id}" (${cfg.label}):`);
        for (const [val, gloss] of cfg.bodyTypes) lines.push(`    - ${gloss} → "${val}"`);
    }
    return lines.join('\n');
}

/**
 * Builds the full instruction text the seller pastes into ChatGPT / DeepSeek.
 * Generated from the same enums this module validates against, so it can't drift.
 */
export function buildImportPromptText() {
    return `NAVODILO ZA PRETVORBO OGLASA V JSON ZA MOJAVTO.SI
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
    ${equipmentGroupIdList()}.
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
${bodyTypePromptSection()}

OSNOVNO:
  make            : besedilo (znamka, npr. "Audi")
  model           : besedilo (model, npr. "A4")
  variant         : besedilo (izvedba/motorizacija, npr. "2.0 TDI Sport")
  linija          : besedilo (paket/linija opreme, npr. "S-Line", "M Sport") — neobvezno
  year            : število (letnik, npr. 2019)
  firstRegistration: "LLLL-MM" (prva registracija)
  mileageKm       : število (prevoženi km)
  condition       : ena izmed → ${CONDITIONS.map(c => `"${c}"`).join(', ')}
  color           : ena izmed → ${COLORS.map(c => `"${c}"`).join(', ')}
  colorType       : ena izmed → ${COLOR_TYPES.map(c => `"${c}"`).join(', ')} (solid=enobarvna, metallic=kovinska, matte=mat, pearl=biserna)
  doorsCount      : število vrat
  seatsCount      : število sedežev

TEHNIČNO:
  fuel            : ena izmed → ${FUELS.map(c => `"${c}"`).join(', ')}
  transmission    : ena izmed → ${TRANSMISSIONS.map(c => `"${c}"`).join(', ')}  (Ročni=manual, Avtomatski=automatic)
  driveType       : ena izmed → ${DRIVES.map(c => `"${c}"`).join(', ')}
  engineCc        : število (prostornina v cc)
  engineConfig    : ena izmed → ${ENGINE_CONFIGS.map(c => `"${c}"`).join(', ')}
  powerKw         : število (moč v kW)
  co2             : število (g/km)
  emissionClass   : ena izmed → ${EMISSIONS.map(c => `"${c}"`).join(', ')}
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

${equipmentPromptSection()}

customEquipment : seznam objektov { "category": "<id skupine>", "value": "<lepo ime>" }
  za lastnosti brez kode. Veljavni id-ji skupin: ${equipmentGroupIdList()}.

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
`;
}

// ── Overlay UI ──────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Opens the experimental AI-import overlay.
 * @param {{ onApply: (data:object, warnings:string[]) => void }} opts
 */
export function openAiImportOverlay({ onApply }) {
    document.getElementById('aiiOverlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'aiiOverlay';
    overlay.className = 'aii-overlay';
    overlay.innerHTML = `
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
        </div>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
        overlay.remove();
        document.body.style.overflow = '';
    };

    const jsonEl = overlay.querySelector('#aiiJson');
    const consentEl = overlay.querySelector('#aiiConsent');
    const applyBtn = overlay.querySelector('#aiiApply');
    const resultEl = overlay.querySelector('#aiiResult');

    const refreshApplyState = () => {
        applyBtn.disabled = !(consentEl.checked && jsonEl.value.trim().length > 0);
    };
    jsonEl.addEventListener('input', refreshApplyState);
    consentEl.addEventListener('change', refreshApplyState);

    overlay.querySelector('#aiiClose').addEventListener('click', close);
    overlay.querySelector('#aiiCancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
    });

    overlay.querySelector('#aiiDownload').addEventListener('click', () => {
        const blob = new Blob([buildImportPromptText()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MojAvto-navodila-AI.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    const showResult = (kind, html) => {
        resultEl.style.display = 'block';
        resultEl.className = `aii-result aii-result--${kind}`;
        resultEl.innerHTML = html;
    };

    applyBtn.addEventListener('click', () => {
        const { ok, data, errors, warnings } = parseImportJson(jsonEl.value);
        if (!ok) {
            showResult('err', `<strong>Podatkov ni bilo mogoče uvoziti:</strong><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`);
            return;
        }
        close();
        onApply(data, warnings || []);
    });
}
