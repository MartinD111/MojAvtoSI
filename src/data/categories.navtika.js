// ═══════════════════════════════════════════════════════════════════════════════
// Category hierarchy data — MojaNavtika (vessels)
// mainCategory → subcategory → vesselType. Mirrors the MojAvto shape so the search
// page, header mega-menu and helpers work unchanged. Consumed via categories.js.
//
// itemType mapping for create-listing / search:
//   colni, jadrnice, gumenjaki, jet_ski → 'plovilo' (vessel)
//   izvenkrmni_motorji                  → 'motor'   (outboard engine, product)
//   plovila_oprema                      → 'oprema'  (gear/equipment)
// ═══════════════════════════════════════════════════════════════════════════════

export const MAIN_CATEGORIES = {
    colni: {
        label: 'cat_boats',
        icon: 'sailboat',
        slug: 'colni',
        subcategories: {
            motorni_coln: {
                label: 'cat_motorboat',
                icon: 'sailboat',
                slug: 'motorni-coln',
                searchType: 'vozilo',
                itemType: 'plovilo',
                vehicleTypes: [
                    { value: 'Gliser', label: 'vtype_bowrider', icon: 'custom-svg:#vc-speedboat-bowrider' },
                    { value: 'KabinskiColn', label: 'vtype_cabin_cruiser', icon: 'custom-svg:#vc-cabin-cruiser' },
                    { value: 'KonzolniColn', label: 'vtype_center_console', icon: 'custom-svg:#vc-center-console-boat' },
                    { value: 'SportnaJahta', label: 'vtype_sport_yacht', icon: 'custom-svg:#vc-sport-yacht' },
                    { value: 'RibiskiColn', label: 'vtype_fishing_boat', icon: 'custom-svg:#vc-fishing-boat' },
                    { value: 'Ponton', label: 'vtype_pontoon', icon: 'custom-svg:#vc-pontoon-boat' },
                    { value: 'Walkaround', label: 'vtype_walkaround', icon: 'custom-svg:#vc-walkaround-boat' },
                ],
            },
            jahte: {
                label: 'cat_yachts',
                icon: 'ship',
                slug: 'jahte',
                searchType: 'vozilo',
                itemType: 'plovilo',
                vehicleTypes: [
                    { value: 'Flybridge', label: 'vtype_flybridge', icon: 'custom-svg:#vc-flybridge-yacht' },
                    { value: 'MotornaJahta', label: 'vtype_motor_yacht', icon: 'custom-svg:#vc-motor-yacht' },
                    { value: 'Trawler', label: 'vtype_trawler', icon: 'custom-svg:#vc-trawler' },
                    { value: 'MegaJahta', label: 'vtype_mega_yacht', icon: 'custom-svg:#vc-mega-yacht' },
                ],
            },
        },
    },
    jadrnice: {
        label: 'cat_sailboats',
        icon: 'sailboat',
        slug: 'jadrnice',
        subcategories: {
            jadrnica: {
                label: 'cat_sailboat',
                icon: 'sailboat',
                slug: 'jadrnica',
                searchType: 'vozilo',
                itemType: 'plovilo',
                vehicleTypes: [
                    { value: 'Enotrupna', label: 'vtype_monohull', icon: 'custom-svg:#vc-monohull-sailboat' },
                    { value: 'Regatna', label: 'vtype_racer', icon: 'custom-svg:#vc-racing-sailboat' },
                    { value: 'Potovalna', label: 'vtype_cruiser', icon: 'custom-svg:#vc-cruising-sailboat' },
                    { value: 'Motorsailer', label: 'vtype_motorsailer', icon: 'custom-svg:#vc-motorsailer' },
                ],
            },
            katamaran: {
                label: 'cat_catamaran',
                icon: 'sailboat',
                slug: 'katamaran',
                searchType: 'vozilo',
                itemType: 'plovilo',
                vehicleTypes: [
                    { value: 'JadralniKatamaran', label: 'vtype_sail_catamaran', icon: 'custom-svg:#vc-sailing-catamaran' },
                    { value: 'MotorniKatamaran', label: 'vtype_power_catamaran', icon: 'custom-svg:#vc-power-catamaran' },
                ],
            },
        },
    },
    gumenjaki: {
        label: 'cat_inflatables',
        icon: 'sailboat',
        slug: 'gumenjaki',
        subcategories: {
            rib: {
                label: 'cat_rib',
                icon: 'sailboat',
                slug: 'rib',
                searchType: 'vozilo',
                itemType: 'plovilo',
                vehicleTypes: [
                    { value: 'RibKonzola', label: 'vtype_rib_console', icon: 'custom-svg:#vc-rib-with-console' },
                    { value: 'RibBrezKonzole', label: 'vtype_rib_open', icon: 'custom-svg:#vc-rib-without-console' },
                ],
            },
            mehki_gumenjak: {
                label: 'cat_soft_inflatable',
                icon: 'sailboat',
                slug: 'mehki-gumenjak',
                searchType: 'vozilo',
                itemType: 'plovilo',
                vehicleTypes: [
                    { value: 'TrdoDno', label: 'vtype_hard_bottom', icon: 'custom-svg:#vc-hard-bottom-inflatable' },
                    { value: 'Zlozljiv', label: 'vtype_foldable', icon: 'custom-svg:#vc-foldable-inflatable-boat' },
                ],
            },
        },
    },
    jet_ski: {
        label: 'cat_jet_ski',
        icon: 'waves',
        slug: 'jet-ski',
        // Personal watercraft — flat list, goes straight to search
        searchType: 'vozilo',
        itemType: 'plovilo',
        directSearch: true,
        vehicleTypes: [
            { value: 'SedeciJetSki', label: 'vtype_pwc_runabout', icon: 'custom-svg:#vc-runabout-jet-ski-sit-down' },
            { value: 'StojeciJetSki', label: 'vtype_pwc_standup', icon: 'custom-svg:#vc-stand-up-jet-ski' },
        ],
    },
    izvenkrmni_motorji: {
        label: 'cat_outboard_engines',
        icon: 'cog',
        slug: 'izvenkrmni-motorji',
        itemType: 'motor',
        subcategories: {
            razred: {
                label: 'cat_engine_class',
                icon: 'cog',
                slug: 'razred',
                searchType: 'vozilo',
                itemType: 'motor',
                vehicleTypes: [
                    { value: 'do15', label: 'vtype_engine_to_15' },
                    { value: '15-50', label: 'vtype_engine_15_50' },
                    { value: '50-150', label: 'vtype_engine_50_150' },
                    { value: 'nad150', label: 'vtype_engine_over_150' },
                ],
            },
        },
    },
    plovila_oprema: {
        label: 'cat_boat_equipment',
        icon: 'life-buoy',
        slug: 'oprema',
        itemType: 'oprema',
        subcategories: {
            oprema_splosno: {
                label: 'cat_equipment_general',
                icon: 'life-buoy',
                slug: 'splosno',
                searchType: 'oprema',
                itemType: 'oprema',
                vehicleTypes: [
                    { value: 'Navigacija', label: 'vtype_navigation' },
                    { value: 'Varnost', label: 'vtype_safety_gear' },
                    { value: 'SidraVrvi', label: 'vtype_anchors_ropes' },
                    { value: 'Jadra', label: 'vtype_sails' },
                    { value: 'Elektronika', label: 'vtype_electronics' },
                    { value: 'PrikoliceZaPlovila', label: 'vtype_boat_trailers' },
                ],
            },
        },
    },
};

// Search type options (vessels)
export const SEARCH_TYPE_OPTIONS = [
    { value: 'vozilo', label: 'Plovilo', icon: 'sailboat' },
];
