const fs = require('fs');
const file = 'src/data/commercialTaxonomy.js';
let content = fs.readFileSync(file, 'utf8');

const mapping = {
  'Traktor': 'vc-agricultural-tractor',
  'Traktor (ozki za vinograd)': 'vc-orchard-vineyard-tractor',
  'Vrtni traktor': 'vc-garden-tractor',
  'Motokultivator': 'vc-two-wheel-tractor-power-tiller',
  'Kombajn': 'vc-combine-harvester',
  'Kmetijski kombajn': 'vc-combine-harvester',
  'Obralnik grozdja': 'vc-grape-harvester',
  'Samovozna krmna žetev': 'vc-self-propelled-forage-harvester',
  'Samovozna košilnica': 'vc-self-propelled-mower',
  'Kosilnica': 'vc-mower',
  'Mulčar': 'vc-mulcher-flail-mower',
  'Plug': 'vc-plough-plow',
  'Brane': 'vc-harrows',
  'Freza': 'vc-rotary-tiller-rotary-hoe',
  'Predsetvenik': 'vc-seedbed-cultivator',
  'Sejalnica': 'vc-seed-drill-seeder',
  'Sadilna tehnika': 'vc-planter-transplanter',
  'Škropilnica': 'vc-field-sprayer',
  'Dognojevalec': 'vc-fertilizer-spreader',
  'Trosilec': 'vc-manure-spreader',
  'Cisterna': 'vc-slurry-tanker',
  'Cisterna za prevoz': 'vc-transport-tanker',
  'Balirka': 'vc-baler',
  'Ovijalka za bale': 'vc-bale-wrapper',
  'Obračalnik': 'vc-tedder',
  'Zgrabljalnik': 'vc-rake',
  'Samonakladalka': 'vc-self-loading-wagon-forage-wagon',
  'Nosilec': 'vc-implement-carrier',
  'Izkopalnik': 'vc-root-crop-harvester',
  'Izkopalnik/Okopalnik': 'vc-ridger',
  'Česalnik': 'vc-weeder-harrow',
  'Mešalnica krmil': 'vc-feed-mixer',
  'Odjemalec silaže': 'vc-silage-defacer-cutter',
  'Šrotar': 'vc-hammer-mill-feed-grinder',
  'Cepilnik/Drobilnik': 'vc-log-splitter-wood-chipper',
  'Stroj za sortiranje krompirja': 'vc-potato-sorting-machine',
  'Stroj za kompostiranje': 'vc-composting-machine',
  'Stroj za vinograd (trsna košilnica)': 'vc-vine-trimmer',
  'Traktorska prikolica': 'vc-farm-trailer',
  'Traktorska prikolica (kiper)': 'vc-farm-tipper-trailer',
  'Traktorska prikolica (razsuti tovor)': 'vc-grain-bulk-farm-trailer',
  'Traktorska prikolica (za bale)': 'vc-bale-trailer',
  'Traktorski plato': 'vc-tractor-transport-box-link-box',
  'UTV (večnamensko vozilo)': 'vc-utility-terrain-vehicle-utv',

  'Harvester': 'vc-forestry-harvester',
  'Gozdni kombajn': 'vc-forestry-harvester',
  'Gozdni forwarder': 'vc-forwarder',
  'Gozdni skider': 'vc-skidding-tractor-cable-grapple-skidder',
  'Gozdni skider (kombinirani)': 'vc-skidding-tractor-cable-grapple-skidder',
  'Feller Buncher': 'vc-feller-buncher',
  'Gozdarski vitel': 'vc-forestry-winch',
  'Dvigalo': 'vc-log-loader-forestry-crane',
  'Stroj za sekance': 'vc-wood-chipper',

  'Bager (gosenični)': 'vc-crawler-excavator',
  'Bager na kolesih': 'vc-wheeled-excavator',
  'Kompaktni bager (midi)': 'vc-mini-midi-excavator',
  'Kombinirka': 'vc-backhoe-loader',
  'Kompaktni nakladalnik (skid steer)': 'vc-skid-steer-loader',
  'Zgibni mini nakladalnik': 'vc-articulated-mini-loader',
  'Nizkoprofilni nakladalnik (LHD)': 'vc-load-haul-dump-lhd-loader',
  'Buldožer': 'vc-bulldozer-dozer',
  'Dozer': 'vc-bulldozer-dozer',
  'Greder (Motor Grader)': 'vc-motor-grader',
  'Demper': 'vc-dumper',
  'Demper (Samonakladalni)': 'vc-self-loading-dumper',
  'Samonakladalni demper': 'vc-self-loading-dumper',
  'Zglobni dumper': 'vc-articulated-dump-truck-adt',
  'Rudarski dumper': 'vc-rigid-dump-truck-mining-truck',
  'Rudarski Demper': 'vc-rigid-dump-truck-mining-truck',
  'Motorni strgač (scraper)': 'vc-wheel-tractor-scraper',
  'Valjar': 'vc-road-roller-compactor',
  'Asfaltni finišer': 'vc-asphalt-paver',
  'Hladni rezkar (cestni frezer)': 'vc-cold-planer-road-milling-machine',
  'Rovokopač (trencher)': 'vc-trencher',
  'Avtodvigalo (Mobile Crane)': 'vc-mobile-crane',
  'Gosenično dvigalo (Crawler Crane)': 'vc-crawler-crane',
  'Gradbeno dvigalo': 'vc-tower-crane-construction-hoist',
  'Avtokošara (Aerial Work Platform)': 'vc-cherry-picker-boom-lift',
  'Škarjasta dvižna ploščad (Scissor Lift)': 'vc-scissor-lift',
  'Teleskopska dvižna ploščad (Boom Lift)': 'vc-telescopic-boom-lift',
  'Tovornjak mešalec betona': 'vc-concrete-mixer-truck',
  'Tovornjak z betonsko črpalko': 'vc-concrete-pump-truck',
  'Stroj za pilotiranje (Piling Rig)': 'vc-piling-rig',
  'Stroj za polaganje cevi (Pipe layer)': 'vc-pipelayer',
  'Vrtalni stroj (Jumbo Drill)': 'vc-drilling-rig-jumbo-drill',
  'Rušitveni robot': 'vc-demolition-robot',
  'Sejalnik': 'vc-screener',
  'Transportni trak': 'vc-conveyor-belt',
  'Vozilo za označevanje cestišč': 'vc-road-marking-machine',

  'Tovornjak za odpadke': 'vc-garbage-truck-refuse-collection-vehicle',
  'Tovornjak za odvoz zabojnikov (Skip Loader)': 'vc-skip-loader',
  'Tovornjak s kotalnim prekucnikom (Hooklift)': 'vc-hooklift-truck',

  'Tovornjak': 'vc-rigid-truck-lorry',
  'Vlačilec': 'vc-tractor-unit',
  'Vlačilec/Šasija': 'vc-tractor-chassis',
  'Šasija': 'vc-chassis-cab',
  'Šasija (Gradbena)': 'vc-construction-chassis',
  'Tovornjak s prekucnim kesonom (tipper)': 'vc-tipper-dump-truck',
  'Tovornjak hladilnik (reefer)': 'vc-refrigerated-truck-reefer',
  'Tovornjak za prevoz hlodovine': 'vc-logging-truck-timber-truck',
  'Tovornjak za prevoz živali': 'vc-livestock-truck',
  'Tovornjak za odvoz zabojnikov (skip)': 'vc-skip-loader-truck',
  'Cisterna za mleko / živila': 'vc-food-grade-milk-tanker-truck',
  'Cisterna za tekoči dušik': 'vc-liquid-nitrogen-tanker-truck',
  'Težki vlačilec (tovornjak)': 'vc-heavy-haulage-tractor',
  'Težki vlačilec (Heavy Duty Recovery)': 'vc-heavy-recovery-vehicle-wrecker',
  'Terminalni traktor': 'vc-terminal-tractor-yard-mule',
  'Portalni dvigalni prenašalec (Straddle Carrier)': 'vc-straddle-carrier',
  'Samovozni modularni transporter': 'vc-self-propelled-modular-transporter-spmt',
  'Pristaniški AGV': 'vc-port-automated-guided-vehicle-agv',

  'Prikolica': 'vc-trailer',
  'Prikolica (Hladilna)': 'vc-refrigerated-trailer',
  'Polprikolica s ponjavo (Curtainsider)': 'vc-curtainsider-semi-trailer',
  'Polprikolica hlajena (reefer)': 'vc-refrigerated-semi-trailer-reefer',
  'Kiper polprikolica (Tipper Trailer)': 'vc-tipper-semi-trailer',
  'Nizkopodna polprikolica (Lowbed Trailer)': 'vc-lowbed-semi-trailer-lowboy',
  'Kontejnerska polprikolica (Container chassis)': 'vc-container-chassis-semi-trailer',
  'Cisterna (Tanker Trailer)': 'vc-tanker-semi-trailer',
  'Polprikolica za razsuti tovor (silo)': 'vc-silo-bulk-powder-semi-trailer',
  'Polprikolica s premičnim dnom (Walking Floor)': 'vc-walking-floor-semi-trailer',
  'Polprikolica za prevoz lesa (Štice)': 'vc-timber-logging-semi-trailer',
  'Polprikolica za prevoz vozil (Car transporter)': 'vc-car-transporter-semi-trailer',
  'Polprikolica za prevoz živine': 'vc-livestock-semi-trailer',
  'Polprikolica za betonske elemente': 'vc-precast-concrete-panel-semi-trailer',
  'Prikolica z zamenljivo nadgradnjo (Swap body)': 'vc-swap-body-trailer',
  'Prikolica za avtomobile': 'vc-car-carrier-trailer',
  'Prikolica za prevoz živine': 'vc-livestock-trailer',
  'Prikolica za čolne': 'vc-boat-trailer',

  'Mestni solo avtobus': 'vc-rigid-city-bus',
  'Mestni zglobni avtobus': 'vc-articulated-city-bus',
  'Mestni minibus': 'vc-city-minibus',
  'Medkrajevni avtobus': 'vc-intercity-bus-coach',
  'Turistični avtobus': 'vc-touring-coach',
  'Nadstropni avtobus': 'vc-double-decker-bus',
  'Šolski avtobus': 'vc-school-bus',
  'Električni minibus': 'vc-electric-minibus',
  'Trolejbus': 'vc-trolleybus',
  'Letališki avtobus': 'vc-airport-shuttle-bus',

  'Furgon': 'vc-panel-van',
  'Furgon s hladilnico': 'vc-refrigerated-panel-van',
  'Furgon s kesonom (Kiper)': 'vc-tipper-van',
  'Kesonar z nadgradnjo (Dropside)': 'vc-dropside-van-with-canopy-box-van',
  'Šasija s kabino (Chassis cab)': 'vc-chassis-cab',
  'Osebno dostavno vozilo (Car-derived van)': 'vc-car-derived-van',
  'Mobilna prodajalna (Food Truck)': 'vc-food-truck-mobile-shop',
  'Oklepno vozilo za prevoz gotovine': 'vc-armored-cash-in-transit-vehicle',
  'Kargo tricikel (Zadnja milja)': 'vc-cargo-tricycle-last-mile-delivery',
};

// Also we need to handle specific clashes.
content = content.replace(/categories:\s*\[([\s\S]*?)\]/g, (match, items) => {
    let replaced = items.split(',').map(line => {
        let trimmed = line.trim();
        if(!trimmed || trimmed.startsWith('//')) return line;
        
        let matchStr = trimmed.match(/'([^']+)'/);
        if(!matchStr) {
            // Check if it's already an object
            let matchObj = trimmed.match(/value:\s*'([^']+)'/);
            if (matchObj) {
                matchStr = matchObj;
            } else {
                return line;
            }
        }
        let val = matchStr[1];
        let icon = mapping[val];
        
        // Context specific fixes
        if (val === 'Nakladalec') {
            if (items.includes('Bager')) icon = 'vc-wheel-loader';
            else icon = 'vc-front-loader-tractor-attachment';
        }

        if (val === 'Drobilec') {
            if (items.includes('Bager') || items.includes('Sejalnik')) icon = 'vc-crusher';
            else icon = 'vc-wood-chipper';
        }

        if (val === 'ADR cisterna (nevarne snovi)') {
            if (items.includes('Furgon')) icon = 'vc-adr-tanker-hazardous-materials';
            else icon = 'vc-adr-tanker-truck';
        }

        if (icon) {
            return line.replace(/\{.*?\}|'[^']+'/, `{ value: '${val}', label: '${val}', icon: 'custom-svg:#${icon}' }`);
        } else {
            return line.replace(/\{.*?\}|'[^']+'/, `{ value: '${val}', label: '${val}' }`);
        }
    }).join(',');
    return `categories: [${replaced}]`;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Taxonomy updated.');
