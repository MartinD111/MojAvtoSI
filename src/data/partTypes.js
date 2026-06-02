// ═══════════════════════════════════════════════════════════════════════════════
// Part taxonomy — MojAvto.si
// Two-level structure: vehicleCategory → part groups (sklopi) → specific types.
// Used by BOTH the "Gume in deli" search filter and the create-listing wizard so
// posting and filtering stay in sync. The same `group`/`value` keys are reused by
// the price-comparison catalog (partsCatalog.attributes) and the future scraper.
//
// Labels are stored as Slovenian strings (the site is Slovenian-primary) so the
// taxonomy is self-contained and does not require ~300 i18n keys.
// ═══════════════════════════════════════════════════════════════════════════════

export const VEHICLE_CATEGORIES = [
    { value: 'avto', label: 'Avtomobili', icon: 'car' },
    { value: 'moto', label: 'Motorna kolesa', icon: 'bike' },
    { value: 'gospodarska', label: 'Gospodarska vozila', icon: 'truck' },
    { value: 'prosti-cas', label: 'Prosti čas', icon: 'palmtree' },
];

export const PART_TAXONOMY = {
    avto: [
        {
            value: 'motor', label: 'Motor in deli motorja', icon: 'cog', types: [
                { value: 'olje_filtri', label: 'Olje in filtri' },
                { value: 'jermeni_verige', label: 'Jermeni in verige' },
                { value: 'vzig_svecke', label: 'Vžig in svečke' },
                { value: 'turbina', label: 'Turbina / kompresor' },
                { value: 'tesnila', label: 'Tesnila in glave' },
                { value: 'crpalke', label: 'Črpalke (olje/voda)' },
                { value: 'motor_kompleten', label: 'Kompleten motor' },
            ],
        },
        {
            value: 'menjalnik', label: 'Menjalnik in transmisija', icon: 'git-merge', types: [
                { value: 'sklopka', label: 'Sklopka' },
                { value: 'menjalnik', label: 'Menjalnik' },
                { value: 'pol_osi', label: 'Pol-osi in gredi' },
                { value: 'diferencial', label: 'Diferencial' },
            ],
        },
        {
            value: 'zavore', label: 'Zavorni sistem', icon: 'octagon', types: [
                { value: 'ploscice', label: 'Zavorne ploščice' },
                { value: 'diski', label: 'Zavorni diski' },
                { value: 'celjusti', label: 'Zavorne čeljusti' },
                { value: 'abs', label: 'ABS senzorji / črpalka' },
                { value: 'cevi', label: 'Zavorne cevi in tekočine' },
            ],
        },
        {
            value: 'obesa_krmilje', label: 'Obesa in krmilje', icon: 'move', types: [
                { value: 'blazilniki', label: 'Blažilniki' },
                { value: 'vzmeti', label: 'Vzmeti' },
                { value: 'roke', label: 'Roke / nosilci' },
                { value: 'krmilni_drog', label: 'Krmilni drog / letev' },
                { value: 'lezaji', label: 'Ležaji koles' },
            ],
        },
        {
            value: 'izpuh', label: 'Izpušni sistem', icon: 'wind', types: [
                { value: 'katalizator', label: 'Katalizator' },
                { value: 'dpf', label: 'DPF filter' },
                { value: 'lonec', label: 'Izpušni lonec' },
                { value: 'lambda', label: 'Lambda sonda' },
            ],
        },
        {
            value: 'hlajenje_klima', label: 'Hlajenje in klima', icon: 'snowflake', types: [
                { value: 'hladilnik', label: 'Hladilnik' },
                { value: 'vodna_crpalka', label: 'Vodna črpalka' },
                { value: 'kompresor_klime', label: 'Kompresor klime' },
                { value: 'ventilator', label: 'Ventilator' },
            ],
        },
        {
            value: 'gorivni_sistem', label: 'Gorivni sistem', icon: 'fuel', types: [
                { value: 'crpalka', label: 'Črpalka goriva' },
                { value: 'sobe', label: 'Šobe / vbrizg' },
                { value: 'rampa', label: 'Gorivna rampa' },
                { value: 'rezervoar', label: 'Rezervoar' },
            ],
        },
        {
            value: 'elektrika', label: 'Elektrika in elektronika', icon: 'zap', types: [
                { value: 'akumulator', label: 'Akumulator' },
                { value: 'alternator', label: 'Alternator' },
                { value: 'zaganjalnik', label: 'Zaganjalnik' },
                { value: 'senzorji', label: 'Senzorji' },
                { value: 'krmilniki', label: 'Krmilniki (ECU)' },
            ],
        },
        {
            value: 'razsvetljava', label: 'Razsvetljava', icon: 'lightbulb', types: [
                { value: 'zarometi', label: 'Žarometi' },
                { value: 'zadnje_luci', label: 'Zadnje luči' },
                { value: 'led_xenon', label: 'LED / Xenon' },
                { value: 'meglenke', label: 'Meglenke' },
            ],
        },
        {
            value: 'karoserija', label: 'Karoserija in zunanjost', icon: 'square', types: [
                { value: 'odbijac', label: 'Odbijač' },
                { value: 'blatnik', label: 'Blatnik' },
                { value: 'pokrov_motorja', label: 'Pokrov motorja' },
                { value: 'vrata', label: 'Vrata' },
                { value: 'ogledala', label: 'Ogledala' },
                { value: 'sipe', label: 'Šipe / stekla' },
            ],
        },
        {
            value: 'notranjost', label: 'Notranjost', icon: 'armchair', types: [
                { value: 'sedezi', label: 'Sedeži' },
                { value: 'armaturna', label: 'Armaturna plošča' },
                { value: 'volan', label: 'Volan' },
                { value: 'multimedija', label: 'Multimedija / navigacija' },
                { value: 'preproge', label: 'Preproge / talne obloge' },
            ],
        },
        {
            value: 'kolesa_platisca', label: 'Kolesa in platišča', icon: 'circle-dot', types: [
                { value: 'platisca_jeklena', label: 'Jeklena platišča' },
                { value: 'platisca_alu', label: 'Aluminijasta platišča' },
                { value: 'pesta', label: 'Pesta' },
                { value: 'cepi', label: 'Čepi / vijaki' },
                { value: 'tpms', label: 'TPMS senzorji' },
            ],
        },
        { value: 'ostalo', label: 'Ostalo', icon: 'more-horizontal', types: [{ value: 'ostalo', label: 'Ostalo' }] },
    ],

    moto: [
        {
            value: 'motor', label: 'Motor', icon: 'cog', types: [
                { value: 'olje_filtri', label: 'Olje in filtri' },
                { value: 'tesnila', label: 'Tesnila' },
                { value: 'bati', label: 'Bati / cilindri' },
                { value: 'motor_kompleten', label: 'Kompleten motor' },
            ],
        },
        {
            value: 'menjalnik_sklopka', label: 'Menjalnik in sklopka', icon: 'git-merge', types: [
                { value: 'sklopka', label: 'Sklopka' },
                { value: 'menjalnik', label: 'Menjalnik' },
            ],
        },
        {
            value: 'veriga_pogon', label: 'Veriga in pogon', icon: 'link', types: [
                { value: 'veriga', label: 'Veriga' },
                { value: 'zobniki', label: 'Zobniki (verižnik)' },
                { value: 'jermen', label: 'Pogonski jermen' },
            ],
        },
        {
            value: 'zavore', label: 'Zavore', icon: 'octagon', types: [
                { value: 'ploscice', label: 'Zavorne ploščice' },
                { value: 'diski', label: 'Zavorni diski' },
                { value: 'pumpe', label: 'Zavorne pumpe' },
            ],
        },
        {
            value: 'obesa_vilice', label: 'Obesa in vilice', icon: 'move', types: [
                { value: 'prednje_vilice', label: 'Prednje vilice' },
                { value: 'blazilnik', label: 'Zadnji blažilnik' },
                { value: 'lezaji', label: 'Ležaji' },
            ],
        },
        {
            value: 'izpuh', label: 'Izpuh', icon: 'wind', types: [
                { value: 'lonec', label: 'Izpušni lonec' },
                { value: 'kompleten', label: 'Kompleten sistem' },
            ],
        },
        {
            value: 'elektrika_akumulator', label: 'Elektrika in akumulator', icon: 'zap', types: [
                { value: 'akumulator', label: 'Akumulator' },
                { value: 'alternator', label: 'Alternator' },
                { value: 'senzorji', label: 'Senzorji / elektronika' },
            ],
        },
        {
            value: 'razsvetljava', label: 'Razsvetljava', icon: 'lightbulb', types: [
                { value: 'zaromet', label: 'Žaromet' },
                { value: 'zadnje_luci', label: 'Zadnje luči' },
                { value: 'smerniki', label: 'Smerniki' },
            ],
        },
        {
            value: 'plastika_oklepi', label: 'Plastika in oklepi', icon: 'shield', types: [
                { value: 'oklepi', label: 'Oklepi' },
                { value: 'maske', label: 'Maske / vetrobran' },
                { value: 'blatniki', label: 'Blatniki' },
            ],
        },
        {
            value: 'sedez_rezervoar', label: 'Sedež in rezervoar', icon: 'armchair', types: [
                { value: 'sedez', label: 'Sedež' },
                { value: 'rezervoar', label: 'Rezervoar' },
            ],
        },
        {
            value: 'kolesa_platisca', label: 'Kolesa in platišča', icon: 'circle-dot', types: [
                { value: 'platisca', label: 'Platišča' },
                { value: 'pesta', label: 'Pesta / ležaji' },
            ],
        },
        {
            value: 'oprema_voznika', label: 'Oprema voznika', icon: 'hard-hat', types: [
                { value: 'celada', label: 'Čelada' },
                { value: 'oblacila', label: 'Oblačila / ščitniki' },
            ],
        },
        { value: 'ostalo', label: 'Ostalo', icon: 'more-horizontal', types: [{ value: 'ostalo', label: 'Ostalo' }] },
    ],

    gospodarska: [
        {
            value: 'motor', label: 'Motor', icon: 'cog', types: [
                { value: 'olje_filtri', label: 'Olje in filtri' },
                { value: 'turbina', label: 'Turbina' },
                { value: 'tesnila', label: 'Tesnila / glave' },
                { value: 'motor_kompleten', label: 'Kompleten motor' },
            ],
        },
        {
            value: 'menjalnik', label: 'Menjalnik in transmisija', icon: 'git-merge', types: [
                { value: 'sklopka', label: 'Sklopka' },
                { value: 'menjalnik', label: 'Menjalnik' },
                { value: 'kardansko', label: 'Kardansko gredje' },
                { value: 'diferencial', label: 'Diferencial / osovine' },
            ],
        },
        {
            value: 'zavore_zracne', label: 'Zavore (zračne)', icon: 'octagon', types: [
                { value: 'obloge', label: 'Zavorne obloge' },
                { value: 'bobni_diski', label: 'Bobni / diski' },
                { value: 'zracni_sistem', label: 'Zračni sistem / ventili' },
                { value: 'kompresor', label: 'Kompresor zraka' },
            ],
        },
        {
            value: 'obesa_zracno', label: 'Obesa in zračno vzmetenje', icon: 'move', types: [
                { value: 'zracne_mehe', label: 'Zračne mehe' },
                { value: 'blazilniki', label: 'Blažilniki' },
                { value: 'listnate_vzmeti', label: 'Listnate vzmeti' },
            ],
        },
        {
            value: 'izpuh_adblue', label: 'Izpuh in AdBlue', icon: 'wind', types: [
                { value: 'dpf', label: 'DPF / SCR' },
                { value: 'adblue', label: 'AdBlue sistem' },
                { value: 'lonec', label: 'Izpušni lonec' },
            ],
        },
        {
            value: 'elektrika', label: 'Elektrika', icon: 'zap', types: [
                { value: 'akumulator', label: 'Akumulatorji' },
                { value: 'alternator', label: 'Alternator' },
                { value: 'zaganjalnik', label: 'Zaganjalnik' },
            ],
        },
        {
            value: 'razsvetljava', label: 'Razsvetljava', icon: 'lightbulb', types: [
                { value: 'zarometi', label: 'Žarometi' },
                { value: 'zadnje_luci', label: 'Zadnje luči' },
            ],
        },
        {
            value: 'kabina_karoserija', label: 'Kabina in karoserija', icon: 'square', types: [
                { value: 'odbijac', label: 'Odbijač / maska' },
                { value: 'ogledala', label: 'Ogledala' },
                { value: 'sipe', label: 'Šipe' },
                { value: 'sedezi', label: 'Sedeži' },
            ],
        },
        {
            value: 'hidravlika', label: 'Hidravlika', icon: 'droplet', types: [
                { value: 'crpalke', label: 'Hidravlične črpalke' },
                { value: 'cilindri', label: 'Cilindri' },
                { value: 'cevi', label: 'Cevi / ventili' },
            ],
        },
        {
            value: 'nadgradnja', label: 'Nadgradnja', icon: 'container', types: [
                { value: 'kesoni', label: 'Kesoni / zaboji' },
                { value: 'ponjave', label: 'Ponjave' },
                { value: 'dvizne_plosadi', label: 'Dvižne ploščadi' },
            ],
        },
        {
            value: 'kolesa_platisca', label: 'Kolesa in platišča', icon: 'circle-dot', types: [
                { value: 'platisca', label: 'Platišča' },
                { value: 'pesta', label: 'Pesta / ležaji' },
            ],
        },
        { value: 'ostalo', label: 'Ostalo', icon: 'more-horizontal', types: [{ value: 'ostalo', label: 'Ostalo' }] },
    ],

    'prosti-cas': [
        {
            value: 'podvozje_obesa', label: 'Podvozje in obesa', icon: 'move', types: [
                { value: 'osi', label: 'Osi' },
                { value: 'blazilniki', label: 'Blažilniki' },
                { value: 'lezaji', label: 'Ležaji' },
            ],
        },
        {
            value: 'zavore_prikolica', label: 'Zavore prikolice', icon: 'octagon', types: [
                { value: 'naletna', label: 'Naletna zavora' },
                { value: 'bobni', label: 'Zavorni bobni / čeljusti' },
            ],
        },
        {
            value: 'plin', label: 'Plinska napeljava', icon: 'flame', types: [
                { value: 'bojler', label: 'Bojler / grelnik' },
                { value: 'stedilnik', label: 'Štedilnik / kuhalnik' },
                { value: 'regulatorji', label: 'Regulatorji / cevi' },
            ],
        },
        {
            value: 'voda_sanitarije', label: 'Voda in sanitarije', icon: 'droplet', types: [
                { value: 'crpalke', label: 'Vodne črpalke' },
                { value: 'rezervoarji', label: 'Rezervoarji' },
                { value: 'wc', label: 'Kemično stranišče' },
            ],
        },
        {
            value: 'elektrika_220_12v', label: 'Elektrika 220V / 12V', icon: 'zap', types: [
                { value: 'pretvorniki', label: 'Pretvorniki / inverterji' },
                { value: 'baterije', label: 'Bivalne baterije' },
                { value: 'solar', label: 'Solarni paneli' },
            ],
        },
        {
            value: 'bivalni_del', label: 'Bivalni del', icon: 'home', types: [
                { value: 'pohistvo', label: 'Pohištvo' },
                { value: 'okna', label: 'Okna' },
                { value: 'stresna_okna', label: 'Strešna okna' },
            ],
        },
        {
            value: 'markize_zunanjost', label: 'Markize in zunanjost', icon: 'tent', types: [
                { value: 'markiza', label: 'Markiza' },
                { value: 'predsotor', label: 'Predšotor' },
                { value: 'nosilci', label: 'Nosilci / lestve' },
            ],
        },
        {
            value: 'ogrevanje_hlajenje', label: 'Ogrevanje in hlajenje', icon: 'thermometer', types: [
                { value: 'gretje', label: 'Gretje (Truma/Webasto)' },
                { value: 'klima', label: 'Klimatska naprava' },
                { value: 'hladilnik', label: 'Hladilnik' },
            ],
        },
        {
            value: 'kolesa_platisca', label: 'Kolesa in platišča', icon: 'circle-dot', types: [
                { value: 'platisca', label: 'Platišča' },
                { value: 'pesta', label: 'Pesta / ležaji' },
            ],
        },
        { value: 'ostalo', label: 'Ostalo', icon: 'more-horizontal', types: [{ value: 'ostalo', label: 'Ostalo' }] },
    ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────
export function getPartGroups(vehicleCategory) {
    return PART_TAXONOMY[vehicleCategory] || [];
}

export function getPartTypes(vehicleCategory, groupValue) {
    const group = getPartGroups(vehicleCategory).find(g => g.value === groupValue);
    return group ? group.types : [];
}

export function getPartGroupLabel(vehicleCategory, groupValue) {
    const group = getPartGroups(vehicleCategory).find(g => g.value === groupValue);
    return group ? group.label : groupValue;
}

export function getPartTypeLabel(vehicleCategory, groupValue, typeValue) {
    const type = getPartTypes(vehicleCategory, groupValue).find(tp => tp.value === typeValue);
    return type ? type.label : typeValue;
}
