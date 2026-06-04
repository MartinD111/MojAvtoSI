// ═══════════════════════════════════════════════════════════════════════════════
// Moto equipment (oprema) taxonomy — MojAvto.si
// Rider gear & accessories — a SEPARATE itemType ('oprema') from spare parts.
// Two-level structure: equipment group (sklop) → specific types (vrste).
// Used by BOTH the "Gume in deli" search filter (Oprema tab) and the
// create-listing wizard so posting and filtering stay in sync.
//
// Labels are Slovenian strings (the site is Slovenian-primary), matching the
// convention used by partTypes.js. Brands live in public/json/equipment_brands.json
// (managed in the admin center, JSON + Excel import/export).
// ═══════════════════════════════════════════════════════════════════════════════

export const EQUIPMENT_TAXONOMY = [
    {
        value: 'celade', label: 'Čelade', icon: 'hard-hat', types: [
            { value: 'integralna', label: 'Integralna' },
            { value: 'modularna', label: 'Modularna (flip-up)' },
            { value: 'jet', label: 'Jet / odprta' },
            { value: 'cross_enduro', label: 'Cross / Enduro' },
            { value: 'adventure', label: 'Adventure / Touring' },
            { value: 'polovicna', label: 'Polovična' },
            { value: 'dodatki_celada', label: 'Vizirji in dodatki' },
        ],
    },
    {
        value: 'jakne', label: 'Jakne', icon: 'shirt', types: [
            { value: 'tekstilna', label: 'Tekstilna' },
            { value: 'usnjena', label: 'Usnjena' },
            { value: 'adventure', label: 'Adventure / Touring' },
            { value: 'mestna', label: 'Mestna / urbana' },
            { value: 'dezna', label: 'Dežna' },
        ],
    },
    {
        value: 'hlace', label: 'Hlače', icon: 'rows-3', types: [
            { value: 'tekstilne', label: 'Tekstilne' },
            { value: 'usnjene', label: 'Usnjene' },
            { value: 'kevlar_kavbojke', label: 'Kavbojke (Kevlar)' },
            { value: 'dezne', label: 'Dežne' },
        ],
    },
    {
        value: 'kombinezoni', label: 'Kombinezoni', icon: 'user', types: [
            { value: 'enodelni', label: 'Enodelni' },
            { value: 'dvodelni', label: 'Dvodelni' },
        ],
    },
    {
        value: 'rokavice', label: 'Rokavice', icon: 'hand', types: [
            { value: 'poletne', label: 'Poletne / kratke' },
            { value: 'touring', label: 'Touring / dolge' },
            { value: 'zimske', label: 'Zimske' },
            { value: 'sportne', label: 'Športne / usnjene' },
            { value: 'cross', label: 'Cross / Enduro' },
        ],
    },
    {
        value: 'obutev', label: 'Škornji in obutev', icon: 'footprints', types: [
            { value: 'sportni', label: 'Športni' },
            { value: 'touring', label: 'Touring' },
            { value: 'cross_enduro', label: 'Cross / Enduro' },
            { value: 'adventure', label: 'Adventure' },
            { value: 'mestni', label: 'Mestni / urbani' },
        ],
    },
    {
        value: 'scitniki', label: 'Ščitniki in zaščita', icon: 'shield', types: [
            { value: 'hrbtenicni', label: 'Hrbtenični ščitnik' },
            { value: 'prsni', label: 'Prsni ščitnik' },
            { value: 'kolena_komolci', label: 'Kolena / komolci' },
            { value: 'airbag', label: 'Airbag jopič / sistem' },
            { value: 'ledvicni_pas', label: 'Ledvični pas' },
            { value: 'protektor_vlozki', label: 'Protektorski vložki' },
        ],
    },
    {
        value: 'komunikacija', label: 'Komunikacija', icon: 'radio', types: [
            { value: 'interkom', label: 'Interkom' },
            { value: 'naglavne_slusalke', label: 'Naglavne slušalke' },
            { value: 'dodatki_interkom', label: 'Dodatki za interkom' },
        ],
    },
    {
        value: 'prtljaga', label: 'Torbe in kovčki', icon: 'briefcase', types: [
            { value: 'stranski_kovcki', label: 'Stranski kovčki' },
            { value: 'top_case', label: 'Top case / zadnji kovček' },
            { value: 'tank_torba', label: 'Tank torba' },
            { value: 'nahrbtnik', label: 'Nahrbtnik' },
            { value: 'mehke_torbe', label: 'Mehke torbe / roll bag' },
            { value: 'nosilci', label: 'Nosilci za kovčke' },
        ],
    },
    {
        value: 'dodatki', label: 'Dodatki', icon: 'plus-circle', types: [
            { value: 'ocala', label: 'Očala / goggles' },
            { value: 'podkapa', label: 'Podkapa / balaclava' },
            { value: 'ovratnik', label: 'Ovratnik / tubular' },
            { value: 'grelci', label: 'Grelci (rokavic/telesa)' },
            { value: 'dezne_prevleke', label: 'Dežne prevleke' },
            { value: 'kljucavnice', label: 'Ključavnice / zaščita' },
        ],
    },
    {
        value: 'otroska', label: 'Otroška oprema', icon: 'baby', types: [
            { value: 'celade', label: 'Otroške čelade' },
            { value: 'oblacila', label: 'Otroška oblačila' },
            { value: 'scitniki', label: 'Otroški ščitniki' },
        ],
    },
    { value: 'ostalo', label: 'Ostalo', icon: 'more-horizontal', types: [{ value: 'ostalo', label: 'Ostalo' }] },
];

// Common confection sizes for moto gear. A single size field keeps the wizard
// and filters simple; helmets/boots overlap enough that one list works for all.
export const EQUIPMENT_SIZES = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL',
    'EU 36', 'EU 38', 'EU 40', 'EU 42', 'EU 44', 'EU 46', 'EU 48',
    'Univerzalna',
];

// ── Helpers (mirror partTypes.js signatures) ──────────────────────────────────
export function getEquipmentGroups() {
    return EQUIPMENT_TAXONOMY;
}

export function getEquipmentTypes(groupValue) {
    const group = EQUIPMENT_TAXONOMY.find(g => g.value === groupValue);
    return group ? group.types : [];
}

export function getEquipmentGroupLabel(groupValue) {
    const group = EQUIPMENT_TAXONOMY.find(g => g.value === groupValue);
    return group ? group.label : groupValue;
}

export function getEquipmentTypeLabel(groupValue, typeValue) {
    const type = getEquipmentTypes(groupValue).find(tp => tp.value === typeValue);
    return type ? type.label : typeValue;
}
