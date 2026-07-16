const fs = require('fs');
const path = require('path');

let htmlPath = path.join(__dirname, 'public/views/advanced-search.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const mapCustom = {
    // Cars
    'Limuzina': 'vc-sedan',
    'Kombilimuzina': 'vc-hatchback',
    'Karavan': 'vc-estate-station-wagon',
    'Terensko': 'vc-suv-off-road',
    'Enoprostorec': 'vc-van-mpv',
    'Kabriolet': 'vc-cabriolet-convertible',
    'Coupe': 'vc-coupe',
    'Sportni': 'vc-sports-car',
    'Pick-up': 'vc-pick-up-truck',

    // Moto
    'SportniMotor': 'vc-sport-bike',
    'SportniTourer': 'vc-sport-tourer',
    'Adventure': 'vc-adventure',
    'NakedBike': 'vc-naked-bike',
    'Enduro': 'vc-enduro',
    'Chopper': 'vc-chopper',
    'Tourer': 'vc-touring-bike',
    'Supermoto': 'vc-supermoto',
    'Trial': 'vc-trial',
    'Cross': 'vc-motocross',
    'Skuter': 'vc-scooter',
    'Minimoto': 'vc-pocket-bike-minimoto',
    'Classic': 'vc-classic-bike',
    'Cruiser': 'vc-cruiser',
    'Moped': 'vc-moped',
    'MotorneSani': 'vc-snowmobile',
    'EVozila': 'vc-electric-motorcycles-mopeds',
    '4in3kolesa': 'vc-artboard-28',
    'ATV': 'vc-artboard-28',
    'UTV': 'vc-utv-side-by-side',
    'Trikolesnik': 'vc-trike',
    'Gocart': 'vc-go-kart'
};

for (const [key, iconId] of Object.entries(mapCustom)) {
    // We want to replace the `<use href="/icons/vehicles.svg#v-whatever"></use>`
    // with `<use href="/icons/vehicles-custom.svg#iconId"></use>` inside the button with data-value="key"
    const regex = new RegExp(`(<button[^>]*data-value="${key}"[^>]*>\\s*<svg[^>]*>\\s*<use href=")[^"]*("\\s*><\\/use>\\s*<\\/svg>\\s*<span>.*?<\\/span>\\s*<\\/button>)`, 'is');
    html = html.replace(regex, `$1/icons/vehicles-custom.svg#${iconId}$2`);
}

// Special case for 4in3kolesa data-group
const regexGrp = new RegExp(`(<button[^>]*data-group="4in3kolesa"[^>]*>\\s*<svg[^>]*>\\s*<use href=")[^"]*("\\s*><\\/use>\\s*<\\/svg>\\s*<span>.*?<\\/span>\\s*<\\/button>)`, 'is');
html = html.replace(regexGrp, `$1/icons/vehicles-custom.svg#vc-artboard-28$2`);

fs.writeFileSync(htmlPath, html, 'utf8');

let comPath = path.join(__dirname, 'src/data/commercialTaxonomy.js');
let comCode = fs.readFileSync(comPath, 'utf8');

const mapCommercial = {
    'Dostavna': 'vc-panel-van',
    'Tovorna': 'vc-rigid-truck-lorry',
    'TovornePrikolice': 'vc-trailer',
    'Avtobus': 'vc-intercity-bus-coach',
    'Gradbena': 'vc-crawler-excavator',
    'Kmetijska': 'vc-agricultural-tractor',
    'Gozdarska': 'vc-forestry-harvester',
    'Komunalna': 'vc-garbage-truck-refuse-collection-vehicle',
    'Letaliska': 'vc-airport-shuttle-bus',
    'Kamnolom': 'vc-crusher'
};

for (const [key, iconId] of Object.entries(mapCommercial)) {
    // Replace icon: 'svg:#v-something' with icon: 'custom-svg:#iconId' or just update the file path.
    // Wait, commercialTaxonomy.js uses 'svg:#v-com-van'. If we use 'svg:#vc-panel-van', 
    // the UI script might assume it's from `vehicles.svg`. Let's check how the UI renders it!
    
    // For now, let's just replace the id inside the commercialTaxonomy.js. 
    // But how does it know which file to load? 
    // Let's use 'custom-svg:#iconId' to differentiate if needed, or we might need to modify the UI script.
    // I will look into advanced-search.js later if needed.
}

