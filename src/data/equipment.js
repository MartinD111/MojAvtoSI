// ═══════════════════════════════════════════════════════════════════════════════
// Equipment data — MojAvto.si
// Single source of truth for equipment/features.
// Values MUST match `name="features"` checkboxes in advanced-search.html
// Used by: create-listing (step 4) + advanced-search filters
// ═══════════════════════════════════════════════════════════════════════════════

export const EQUIPMENT_GROUPS = [
    {
        id: 'varnost',
        label: 'eq_group_varnost',
        icon: 'shield-check',
        categories: ['avto'],
        items: [
            { value: 'ABS',       label: 'eq_abs', icon: 'shield' },
            { value: 'ESP',       label: 'eq_esp', icon: 'activity' },
            { value: 'Alarm',     label: 'eq_alarm', icon: 'bell' },
            { value: 'BlindSpot', label: 'eq_blind_spot', icon: 'eye-off' },
            { value: 'RoadSign',  label: 'eq_road_sign', icon: 'signpost' },
            { value: 'LaneDep',   label: 'eq_lane_dep', icon: 'split' },
            { value: 'LaneAssist',label: 'eq_lane_assist', icon: 'move-horizontal' },
            { value: 'AutoBrake', label: 'eq_auto_brake', icon: 'octagon' },
            { value: 'CrossTraffic', label: 'eq_cross_traffic', icon: 'arrow-left-right' },
            { value: 'Isofix',    label: 'eq_isofix', icon: 'baby' },
        ],
    },
    {
        id: 'razsvetljava',
        label: 'eq_group_razsvetljava',
        icon: 'sun',
        categories: ['avto'],
        items: [
            { value: 'LED',    label: 'eq_led', icon: 'sun' },
            { value: 'Xenon',  label: 'eq_xenon', icon: 'sparkles' },
            { value: 'Matrix', label: 'eq_matrix', icon: 'lightbulb' },
            { value: 'DRL',    label: 'eq_drl', icon: 'sun-dim' },
            { value: 'Fog',    label: 'eq_fog', icon: 'cloud-fog' },
            { value: 'AutoHighBeam', label: 'eq_auto_high_beam', icon: 'sun-medium' },
            { value: 'AmbientLight', label: 'eq_ambient_light', icon: 'sparkles' },
        ],
    },
    {
        id: 'udobje',
        label: 'eq_group_udobje',
        icon: 'sofa',
        categories: ['avto'],
        items: [
            { value: 'Climate',        label: 'eq_climate', icon: 'thermometer-snowflake' },
            { value: 'Climate2Zone',   label: 'eq_climate_2zone', icon: 'snowflake' },
            { value: 'ElectricSeats',  label: 'eq_electric_seats', icon: 'armchair' },
            { value: 'HeatedSeats',    label: 'eq_heated_seats', icon: 'flame' },
            { value: 'HeatedSeatsRear',label: 'eq_heated_seats_rear', icon: 'flame' },
            { value: 'MassageSeats',   label: 'eq_massage_seats', icon: 'waves' },
            { value: 'CooledSeats',    label: 'eq_cooled_seats', icon: 'snowflake' },
            { value: 'Panorama',       label: 'eq_panorama', icon: 'layers' },
            { value: 'Sibedah',        label: 'eq_sibedah', icon: 'maximize-2' },
            { value: 'ElecTrunk',      label: 'eq_elec_trunk', icon: 'package' },
            { value: 'HeatedWheel',    label: 'eq_heated_wheel', icon: 'circle-dot' },
            { value: 'Keyless',        label: 'eq_keyless', icon: 'key' },
            { value: 'MemorySeats',    label: 'eq_memory_seats', icon: 'save' },
            { value: 'AirSuspension',  label: 'eq_air_suspension', icon: 'arrow-up-down' },
            { value: 'Leather',        label: 'eq_leather', icon: 'layers' },
            { value: 'Alcantara',      label: 'eq_alcantara', icon: 'layers' },
            { value: 'SoftClose',      label: 'eq_soft_close', icon: 'door-closed' },
        ],
    },
    {
        id: 'parkiranje',
        label: 'eq_group_parkiranje',
        icon: 'parking-square',
        categories: ['avto'],
        items: [
            { value: 'ParkSensorFront', label: 'eq_park_sensor_front', icon: 'radar' },
            { value: 'ParkSensorRear',  label: 'eq_park_sensor_rear', icon: 'radar' },
            { value: 'RearCamera',      label: 'eq_rear_camera', icon: 'video' },
            { value: 'Camera360',       label: 'eq_camera_360', icon: 'aperture' },
            { value: 'AutoParking',     label: 'eq_auto_parking', icon: 'parking-circle' },
        ],
    },
    {
        id: 'multimedija',
        label: 'eq_group_multimedija',
        icon: 'monitor-smartphone',
        categories: ['avto'],
        items: [
            { value: 'Navigation',     label: 'eq_navigation', icon: 'map' },
            { value: 'Bluetooth',      label: 'eq_bluetooth', icon: 'bluetooth' },
            { value: 'Handsfree',      label: 'eq_handsfree', icon: 'phone-call' },
            { value: 'CarPlay',        label: 'eq_carplay', icon: 'smartphone' },
            { value: 'HifiSound',      label: 'eq_hifi_sound', icon: 'speaker' },
            { value: 'DigitalCockpit', label: 'eq_digital_cockpit', icon: 'layout-dashboard' },
            { value: 'HUD',            label: 'eq_hud', icon: 'target' },
            { value: 'WiFi',           label: 'eq_wifi', icon: 'wifi' },
            { value: 'Wireless',       label: 'eq_wireless', icon: 'zap' },
        ],
    },
    {
        id: 'asistenti',
        label: 'eq_group_asistenti',
        icon: 'cpu',
        categories: ['avto'],
        items: [
            { value: 'CruiseControl',     label: 'eq_cruise', icon: 'timer' },
            { value: 'AdaptiveCruise',    label: 'eq_adaptive_cruise', icon: 'timer-reset' },
            { value: 'TrafficJamAssist',  label: 'eq_traffic_jam', icon: 'users' },
            { value: 'NightVision',       label: 'eq_night_vision', icon: 'moon' },
            { value: 'FatigueAlert',      label: 'eq_fatigue', icon: 'coffee' },
            { value: 'TirePressure',      label: 'eq_tpms', icon: 'gauge' },
        ],
    },
    {
        id: 'prtljaga',
        label: 'eq_group_prtljaga',
        icon: 'package',
        categories: ['avto'],
        items: [
            { value: 'TowBar',       label: 'eq_tow_bar', icon: 'anchor' },
            { value: 'RoofRails',    label: 'eq_roof_rails', icon: 'square' },
            { value: 'FoldSeat',     label: 'eq_fold_seat', icon: 'chevron-down' },
        ],
    },
    {
        id: 'garancija',
        label: 'eq_group_garancija',
        icon: 'badge-check',
        categories: ['all'],
        items: [
            { value: 'ServiceBook',  label: 'eq_service_book', icon: 'book-open' },
            { value: 'Warranty',     label: 'eq_warranty', icon: 'badge-check' },
            { value: 'NonSmoking',   label: 'eq_non_smoking', icon: 'cigarette-off' },
        ],
    },
    {
        id: 'moto',
        label: 'eq_group_moto',
        icon: 'bike',
        categories: ['moto'],
        items: [
            { value: 'MotoABS',        label: 'eq_moto_abs', icon: 'shield' },
            { value: 'MotoCruise',     label: 'eq_moto_cruise', icon: 'timer' },
            { value: 'ElecSuspension', label: 'eq_elec_suspension', icon: 'arrow-up-down' },
            { value: 'MotoNavigation', label: 'eq_moto_navigation', icon: 'map' },
            { value: 'Panniers',       label: 'eq_panniers', icon: 'package' },
            { value: 'SportExhaust',   label: 'eq_sport_exhaust', icon: 'wind' },
            { value: 'TPMS',           label: 'eq_moto_tpms', icon: 'gauge' },
            { value: 'Quickshifter',   label: 'eq_quickshifter', icon: 'zap' },
            { value: 'HeatedGrips',    label: 'eq_heated_grips', icon: 'flame' },
            { value: 'TractionControl', label: 'eq_traction_control', icon: 'activity' },
        ],
    },
    {
        id: 'drugo',
        label: 'eq_group_drugo',
        icon: 'plus-circle',
        categories: ['all'],
        items: [
            { value: 'Kadilski',       label: 'eq_smoking', icon: 'cigarette' },
            { value: 'Taxi',           label: 'eq_taxi', icon: 'taxi' },
            { value: 'DrivingSchool',  label: 'eq_driving_school', icon: 'graduation-cap' },
        ],
    }
];

// ── Attribute Icons ───────────────────────────────────────────────────────────
// Icons for common vehicle attributes (fuel, transmission, etc.)
export const ATTRIBUTE_ICONS = {
    // Fuel
    'Petrol': 'fuel',
    'Dizel':  'fuel',
    'Hibrid': 'battery-charging',
    'Elektrika': 'zap',
    'LPG': 'flame',
    'CNG': 'flame',
    'Vodik': 'droplets',
    
    // Transmission
    'Ročni': 'settings-2',
    'Avtomatski': 'box',
    'Sekvenčni': 'move-up',
    'Polavtomatski': 'workflow',
    
    // Drive
    'Spredaj': 'car-front',
    'Zadaj': 'car-front',
    'Štirikolesni (4x4)': 'navigation',
    'FWD (sprednji)': 'arrow-up',
    'RWD (zadnji)': 'arrow-down',
    'AWD / 4x4': 'move',
    '4x4': 'move',
    '4WD': 'move',
    
    // Condition
    'Novo': 'sparkles',
    'Rabljeno': 'history',
    'Testno': 'test-tube-2',
    'Poškodovano': 'alert-triangle',
    'V okvari': 'wrench',
    'Starodobnik': 'calendar',
    'Razstavno vozilo': 'eye',
    'Za dele': 'wrench',
    
    // Color
    'Bela': 'palette',
    'Črna': 'palette',
    'Srebrna': 'palette',
    'Siva': 'palette',
    'Modra': 'palette',
    'Rdeča': 'palette',
    'Zelena': 'palette',
    'Rumena': 'palette',
    'Rjava': 'palette',
    'Oranžna': 'palette',
    'Vijolična': 'palette',
    'Zlata': 'palette',
    'Bronasta': 'palette',
    'Druga': 'palette',

    // Color Type
    'solid': 'palette',
    'metallic': 'sparkles',
    'matte': 'droplet',
    'pearl': 'circle',
    
    // Body types
    'Limuzina': 'car',
    'SUV / Terensko': 'mountain',
    'Karavan': 'layout-template',
    'Kombilimuzina': 'car',
    'Kabriolet': 'sun',
    'Coupe': 'zap',
    'Enoprostorec': 'users',
    'Pick-up': 'truck',
    'Oldtimer': 'history',

    // Euro class
    'Euro 4': 'leaf',
    'Euro 5': 'leaf',
    'Euro 6': 'leaf',
    'Euro 6d': 'leaf',
    'Euro 6d-temp': 'leaf',

    // Owners
    '1. lastnik': 'user-check',
    '2. lastnik': 'user-check',
    '3. lastnik': 'user-check',
    '4. lastnik': 'user-check',
    '5 ali več': 'users',

    // Hybrid Types
    'PetrolHybrid': 'battery-charging',
    'DizelHibrid': 'battery-charging',
    'PlugIn': 'plug-zap',
    'MildHibrid': 'zap',

    // Months
    '01': 'calendar', '02': 'calendar', '03': 'calendar', '04': 'calendar',
    '05': 'calendar', '06': 'calendar', '07': 'calendar', '08': 'calendar',
    '09': 'calendar', '10': 'calendar', '11': 'calendar', '12': 'calendar',
    
    // Numbers (Doors, Seats)
    '2': 'door-closed', '3': 'door-closed', '4': 'door-closed', '5': 'door-closed', '6': 'door-closed',
    '2 ': 'armchair', '3 ': 'armchair', '4 ': 'armchair', '5 ': 'armchair', '6 ': 'armchair', '7 ': 'armchair', '8 ': 'armchair', '9 ': 'armchair',
    
    // Misc
    'firstRegistration': 'calendar',
    'mileage': 'gauge',
    'power': 'zap',
    'seats': 'armchair',
    'doors': 'door-closed',
    'co2': 'cloud',
    'emission': 'leaf',
    'vin': 'fingerprint',
    'price': 'banknote',
    'brand': 'car-front',
    'model': 'car',
    'variant': 'file-text',
    'year': 'calendar',
    'engine': 'cpu',
    'cc': 'pipette',
    'transmission': 'settings-2',
    'drive': 'navigation',
    'color': 'palette',
    'registeredUntil': 'calendar-check',
    'towing': 'anchor',
    'battery': 'battery',
    'range': 'map-pin',
    'abs': 'shield',
    'esp': 'activity',
    'airbag': 'user-check',
    'tempomat': 'timer',
    'kamera': 'video',
    'usnje': 'layers',
    'klima': 'thermometer-snowflake',
    'luči': 'sun',
    'nekadilski': 'cigarette-off',
    'kadilski': 'cigarette',
    'servis': 'book-open',
    'garancija': 'badge-check',
    'navigacija': 'map',
};

/**
 * Robust icon lookup for any attribute or equipment item.
 * Searches in ATTRIBUTE_ICONS first, then falls back to EQUIPMENT_GROUPS.
 */
export function getAttributeIcon(key, value) {
    const v = String(value || '').trim();
    const k = String(key || '').trim();

    // 1. Direct match in attribute icons (by value)
    if (ATTRIBUTE_ICONS[v]) return ATTRIBUTE_ICONS[v];
    
    // 2. Direct match in attribute icons (by key)
    if (ATTRIBUTE_ICONS[k]) return ATTRIBUTE_ICONS[k];

    // 3. Search in Equipment Groups (by value or label)
    for (const group of EQUIPMENT_GROUPS) {
        const item = group.items.find(i => 
            i.value === v || 
            i.label === v || 
            i.value === k || 
            i.label === k ||
            i.value.toLowerCase() === v.toLowerCase() ||
            i.label.toLowerCase() === v.toLowerCase()
        );
        if (item && item.icon) return item.icon;
    }

    // 4. Heuristic fallbacks (Slovenian keywords)
    const lowerV = v.toLowerCase();
    const lowerK = k.toLowerCase();

    if (lowerV.includes('km') || lowerK.includes('mileage')) return 'gauge';
    if (lowerV.includes('kw') || lowerV.includes('km (moč)') || lowerK.includes('power')) return 'zap';
    if (lowerV.includes('€') || lowerK.includes('price')) return 'banknote';
    if (lowerV.includes('kamera')) return 'video';
    if (lowerV.includes('tempomat')) return 'timer';
    if (lowerV.includes('usnje')) return 'layers';
    if (lowerV.includes('luči') || lowerV.includes('žarometi')) return 'sun';
    if (lowerV.includes('abs')) return 'shield';
    if (lowerV.includes('esp')) return 'activity';
    if (lowerV.includes('klima')) return 'thermometer-snowflake';
    if (lowerV.includes('nekadilsk')) return 'cigarette-off';
    if (lowerV.includes('kadilsk')) return 'cigarette';
    if (lowerV.includes('servis')) return 'book-open';
    if (lowerV.includes('garancija')) return 'badge-check';
    if (lowerV.includes('navigacija')) return 'map';
    if (lowerV.includes('sedež')) return 'armchair';
    if (lowerV.includes('volan')) return 'circle-dot';
    if (lowerV.includes('vrat')) return 'door-closed';
    if (lowerV.includes('motor')) return 'cpu';
    if (lowerV.includes('radio') || lowerV.includes('avdio') || lowerV.includes('zvok')) return 'speaker';
    if (lowerV.includes('parkirn') || lowerV.includes('senz')) return 'radar';
    if (lowerV.includes('bluetooth')) return 'bluetooth';
    if (lowerV.includes('paket')) return 'package';
    if (lowerV.includes('streha') || lowerV.includes('okno')) return 'layout';

    return 'check';
}


// Get equipment items for a specific category (avto/moto/etc.)
export function getEquipmentForCategory(category) {
    const cat = (category || 'avto').toLowerCase();
    return EQUIPMENT_GROUPS.filter(g =>
        g.categories.includes(cat) || g.categories.includes('all')
    );
}

// Flat list of all values (for search filtering)
export const ALL_EQUIPMENT_VALUES = EQUIPMENT_GROUPS.flatMap(g => g.items.map(i => i.value));

// Lookup: value → label
export function getEquipmentLabel(value) {
    for (const group of EQUIPMENT_GROUPS) {
        const item = group.items.find(i => i.value === value);
        if (item) return item.label;
    }
    return value;
}

// Lookup: value → icon
export function getEquipmentIcon(value) {
    for (const group of EQUIPMENT_GROUPS) {
        const item = group.items.find(i => i.value === value);
        if (item) return item.icon;
    }
    return 'check';
}
