// ═══════════════════════════════════════════════════════════════════════════════
// Category hierarchy data — MojAvto (vehicles)
// mainCategory → subcategory → vehicleType. Each leaf maps to search filters.
// Consumed via the platform router in categories.js.
// ═══════════════════════════════════════════════════════════════════════════════

export const MAIN_CATEGORIES = {
    avto: {
        label: 'cat_cars',
        icon: 'car',
        slug: 'avto',
        hasRentalToggle: true,
        // Cars goes directly to advanced search (existing flow)
        directSearch: true,
    },
    moto: {
        label: 'cat_moto',
        icon: 'bike',
        slug: 'moto',
        hasRentalToggle: true,
        subcategories: {
            motorno_kolo: {
                label: 'cat_motorcycle',
                icon: 'bike',
                slug: 'motorno-kolo',
                searchType: 'vozilo', // default — searching for the vehicle itself
                vehicleTypes: [
                    { value: 'SportniMotor', label: 'vtype_sport_bike' },
                    { value: 'SportniTourer', label: 'vtype_sport_tourer' },
                    { value: 'Adventure', label: 'vtype_adventure' },
                    { value: 'NakedBike', label: 'vtype_naked_bike' },
                    { value: 'Enduro', label: 'vtype_enduro' },
                    { value: 'Chopper', label: 'vtype_chopper' },
                    { value: 'Tourer', label: 'vtype_tourer' },
                    { value: 'Supermoto', label: 'vtype_supermoto' },
                    { value: 'Trial', label: 'vtype_trial' },
                    { value: 'Cross', label: 'vtype_motocross' },
                    { value: 'Skuter', label: 'vtype_scooter' },
                    { value: 'Minimoto', label: 'vtype_mini_moto' },
                    { value: 'Gocart', label: 'vtype_go_cart' },
                    { value: 'MotorneSani', label: 'vtype_snowmobile' },
                    { value: 'EMoto', label: 'vtype_emoto' },
                    { value: 'ESkiro', label: 'vtype_eskiro' },
                    { value: 'EKolo', label: 'vtype_ebike' },
                ],
            },
            atv_utv: {
                label: 'cat_atv_utv',
                icon: 'tractor',
                slug: 'atv-utv',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
            motorne_sani: {
                label: 'cat_snowmobiles',
                icon: 'snowflake',
                slug: 'motorne-sani',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
            moto_najem: {
                label: 'cat_rental',
                icon: 'calendar',
                slug: 'moto-najem',
                searchType: 'najem',
                vehicleTypes: [],
            },
        },
    },
    gospodarska: {
        label: 'cat_commercial',
        icon: 'truck',
        slug: 'gospodarska',
        hasRentalToggle: true,
        subcategories: {
            dostavna: {
                label: 'cat_vans',
                icon: 'truck',
                slug: 'dostavna',
                // When user clicks, they are asked: Vehicle, Parts & Equipment, Tires
                askSearchType: true,
                vehicleTypes: [],
            },
            tovorna: {
                label: 'cat_trucks',
                icon: 'truck',
                slug: 'tovorna',
                askSearchType: true,
                vehicleTypes: [],
            },
            avtobus: {
                label: 'cat_buses',
                icon: 'bus-front',
                slug: 'avtobus',
                askSearchType: true,
                vehicleTypes: [],
            },
            tovorne_prikolice: {
                label: 'cat_trailers',
                icon: 'container',
                slug: 'tovorne-prikolice',
                askSearchType: true,
                vehicleTypes: [],
            },
            gradbena: {
                label: 'cat_construction',
                icon: 'hard-hat',
                slug: 'gradbena',
                askSearchType: true,
                vehicleTypes: [],
            },
            kmetijska: {
                label: 'cat_agricultural',
                icon: 'wheat',
                slug: 'kmetijska',
                askSearchType: true,
                vehicleTypes: [],
            },
            komunalna: {
                label: 'cat_municipal',
                icon: 'recycle',
                slug: 'komunalna',
                askSearchType: true,
                vehicleTypes: [],
            },
            gozdarska: {
                label: 'cat_forestry',
                icon: 'tree-pine',
                slug: 'gozdarska',
                askSearchType: true,
                vehicleTypes: [],
            },
            vilicarji: {
                label: 'cat_forklifts',
                icon: 'forklift',
                slug: 'vilicarji',
                askSearchType: true,
                vehicleTypes: [],
            },
        },
    },
    prosti_cas: {
        label: 'cat_recreation',
        icon: 'palmtree',
        slug: 'prosti-cas',
        hasRentalToggle: true,
        subcategories: {
            avtodom: {
                label: 'cat_motorhome',
                icon: 'caravan',
                slug: 'avtodom',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
            pocitniiska_prikolica: {
                label: 'cat_holiday_trailer',
                icon: 'tent',
                slug: 'pocitniiska-prikolica',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
            mobilna_hisica: {
                label: 'cat_mobile_home',
                icon: 'home',
                slug: 'mobilna-hisica',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
            snemljiv_bivalnik: {
                label: 'cat_camper_box',
                icon: 'box',
                slug: 'snemljiv-bivalnik',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
            sotorska_prikolica: {
                label: 'cat_tent_trailer',
                icon: 'tent',
                slug: 'sotorska-prikolica',
                searchType: 'vozilo',
                vehicleTypes: [],
            },
        },
    },
};

// Search type options (vehicle only — parts & tires sections removed)
export const SEARCH_TYPE_OPTIONS = [
    { value: 'vozilo', label: 'Vozilo', icon: 'truck' },
];
