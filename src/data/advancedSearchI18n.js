import { getCurrentLang } from '../core/i18n.js';

// Advanced search predates the shared data-i18n markup and contains many
// labels in the HTML itself. Keep filter values untouched; translate only
// rendered text and UI attributes.
const EN = {
    'Avtomobili': 'Cars', 'Motorji': 'Motorcycles', 'Gospodarska': 'Commercial', 'Prosti čas': 'Leisure',
    'Osnovni podatki': 'Basic information', 'Zapomni': 'Remember', 'Vrsta vozila': 'Vehicle type',
    'Limuzina': 'Sedan', 'Kombilimuzina': 'Hatchback', 'Karavan': 'Estate', 'Terensko vozilo': 'SUV / off-road',
    'Enoprostorec': 'MPV', 'Kabriolet': 'Convertible', 'Športni avto': 'Sports car', 'Športni motor': 'Sport bike',
    'Športni potovalni': 'Sport touring', 'Potovalni': 'Touring', 'Kros': 'Motocross', 'Skuter': 'Scooter',
    'Motorne sani': 'Snowmobile', 'E-Vozila': 'Electric vehicles', '4 in 3 Kolesna': '4- and 3-wheeled',
    'motorna vozila': 'motor vehicles', 'Štirikolesnik': 'Quad bike', 'Trikolesnik': 'Three-wheeler',
    'Gokart': 'Go-kart', 'Nazaj': 'Back', 'Nazaj na vrste': 'Back to types',
    'Počitniška prikolica': 'Caravan', 'Mobilna hišica': 'Mobile home', 'Šotorska prikolica': 'Tent trailer',
    'Znamka': 'Make', 'Model': 'Model', 'Različica': 'Variant', 'Linija': 'Line', 'Dodaj': 'Add', 'Izloči': 'Exclude', 'Izločena vozila': 'Excluded vehicles',
    'Stanje vozila': 'Vehicle condition', 'Novo': 'New', 'Rabljeno': 'Used', 'Razstavno/Testno': 'Demo / test vehicle',
    'Dnevna registracija': 'Daily registration', 'Starodobnik': 'Classic vehicle',
    'Poškodovana in zalita vozila': 'Damaged and flooded vehicles', 'Vsa vozila': 'All vehicles',
    'Samo poškodovana': 'Damaged only', 'Brez poškodovanih': 'Exclude damaged vehicles',
    'Cena od (€)': 'Price from (€)', 'Cena do (€)': 'Price to (€)', 'Prikaži tudi oglase brez cene': 'Include listings without a price',
    '1. registracija od': 'First registration from', '1. registracija do': 'First registration to', 'Vse': 'All',
    'Prevoženi kilometri od': 'Mileage from', 'Prevoženi kilometri do': 'Mileage to',
    'Obratovalne ure od': 'Operating hours from', 'Obratovalne ure do': 'Operating hours to',
    'Motor in pogon': 'Engine and drivetrain', 'Vrsta goriva': 'Fuel type', 'Bencin': 'Petrol', 'Dizel': 'Diesel',
    'Hibrid': 'Hybrid', 'Elektrika': 'Electric', 'LPG / Plin': 'LPG / gas', 'Vodik': 'Hydrogen',
    'Vrsta hibrida': 'Hybrid type', 'Blagi hibrid': 'Mild hybrid', 'Plug-in hibrid': 'Plug-in hybrid',
    'Motor hibrida': 'Hybrid engine', 'Bencin hibrid': 'Petrol hybrid', 'Dizel hibrid': 'Diesel hybrid',
    'Enota za moč:': 'Power unit:', 'Moč motorja od (kW)': 'Engine power from (kW)', 'Moč motorja do (kW)': 'Engine power to (kW)',
    'Moč motorja od (KM)': 'Engine power from (hp)', 'Moč motorja do (KM)': 'Engine power to (hp)',
    'Menjalnik': 'Transmission', 'Vsi menjalniki': 'All transmissions', 'Ročni': 'Manual', 'Avtomatski': 'Automatic',
    'Polavtomatski': 'Semi-automatic', 'Poraba goriva do (L/100 km)': 'Fuel consumption up to (L/100 km)',
    'A2 izpit': 'A2 licence', 'Samo A2': 'A2 only', 'Prostornina motorja od (ccm)': 'Engine capacity from (cc)',
    'Prostornina motorja do (ccm)': 'Engine capacity to (cc)', 'Konfiguracija motorja': 'Engine configuration',
    'Pogonski sklop': 'Drivetrain', 'Prednji (FWD)': 'Front-wheel drive (FWD)', 'Zadnji (RWD)': 'Rear-wheel drive (RWD)',
    '4x4 / Vsekolesni (AWD)': '4x4 / all-wheel drive (AWD)', 'Takt motorja': 'Engine stroke', 'Vsi takti': 'All strokes',
    '2-taktni': '2-stroke', '4-taktni': '4-stroke', 'Vrsta motorja / Valji': 'Engine type / cylinders',
    'Valji': 'Cylinders', '+ Dodaj': '+ Add', '× Odstrani': '× Remove', 'Prenos moči': 'Power transmission',
    'Veriga': 'Chain', 'Zobati jermen': 'Toothed belt', 'Jekleni jermen': 'Steel belt', 'Kardan': 'Shaft drive',
    'Zunanjost': 'Exterior', 'Število vrat': 'Number of doors', 'vrata': 'doors', 'Barva zunanjosti': 'Exterior colour',
    'Bela': 'White', 'Črna': 'Black', 'Siva': 'Grey', 'Srebrna': 'Silver', 'Rdeča': 'Red', 'Modra': 'Blue',
    'Zelena': 'Green', 'Rjava': 'Brown', 'Rumena': 'Yellow', 'Oranžna': 'Orange', 'Vijolična': 'Purple',
    'Vrsta barve': 'Paint type', 'Kovinska': 'Metallic', 'Navadna': 'Solid', 'Biserna': 'Pearlescent', 'Vlečna kljuka': 'Tow hitch',
    'Fiksna': 'Fixed', 'Snemljiva': 'Removable', 'Vrtljiva': 'Swivelling',
    'Notranjost in udobje': 'Interior and comfort', 'Število sedežev od': 'Seats from', 'Število sedežev do': 'Seats to',
    'Material notranjosti': 'Interior material', 'Usnje': 'Leather', 'Delno usnje': 'Partial leather', 'Blago': 'Cloth',
    'Klimatska naprava': 'Air conditioning', 'Brez klime': 'No air conditioning', 'Ročna': 'Manual',
    'Avtomatska (1-conska)': 'Automatic (single-zone)', 'Avtomatska (2-conska)': 'Automatic (dual-zone)',
    'Avtomatska (3/4-conska)': 'Automatic (3/4-zone)', 'Parkirni senzorji': 'Parking sensors',
    'Spredaj': 'Front', 'Zadaj': 'Rear', 'Samodejno parkiranje': 'Automatic parking', 'Zračne blazine': 'Airbags',
    'Sprednje': 'Front', 'Stranske': 'Side', 'Zavese': 'Curtain', 'Kolenske': 'Knee', 'Aktivni tempomat (ACC)': 'Adaptive cruise control (ACC)',
    'Oprema': 'Equipment', 'Športni izpuh': 'Sport exhaust', 'Znamka izpuha': 'Exhaust make', 'Celotni sistem': 'Full system',
    '6-osni IMU': '6-axis IMU', 'Nadzor zdrsa': 'Traction control', 'Povezano zaviranje': 'Linked braking',
    'Ponudnik in lokacija': 'Seller and location',
    'Garancija in servis': 'Warranty and service', 'Servisna knjiga potrjena': 'Service book verified', 'Z garancijo': 'With warranty',
    'Nekadilsko vozilo': 'Non-smoking vehicle', 'Ponastavi': 'Reset', 'Prikaži rezultate': 'Show results',
    'Prodaja': 'Sale', 'Najem': 'Rental', 'Fizična oseba': 'Private seller', 'Trgovec': 'Dealer',
    'Država': 'Country', 'Vse države': 'All countries', 'Mesto / Poštna številka': 'City / ZIP code',
    'Radij iskanja': 'Search radius', 'Točna lokacija': 'Exact location', 'Do 15 km': 'Up to 15 km', 'Do 40 km': 'Up to 40 km',
    'Do 80 km': 'Up to 80 km', 'Do 150 km': 'Up to 150 km', 'Do 300 km': 'Up to 300 km', 'Brez omejitve': 'No limit',
    'Prikaži cene brez DDV': 'Show prices excluding VAT', 'Povleci sem': 'Drag here',
};

const COMMERCIAL = {
    'Dostavna vozila': 'Delivery vans', 'Tovorna vozila': 'Trucks', 'Prikolice in polprikolice': 'Trailers and semi-trailers',
    'Avtobusi': 'Buses', 'Gradbena mehanizacija': 'Construction machinery', 'Kmetijska mehanizacija': 'Agricultural machinery',
    'Gozdarska mehanizacija': 'Forestry machinery', 'Komunalna mehanizacija': 'Municipal machinery',
    'Viličarji': 'Forklifts', 'Interventna vozila': 'Emergency vehicles', 'Letališka vozila': 'Airport vehicles',
    'Kamnolom': 'Quarry equipment', 'Zimska mehanizacija': 'Winter maintenance machinery',
    'Furgon': 'Panel van', 'Furgon s hladilnico': 'Refrigerated panel van', 'Furgon s kesonom (Kiper)': 'Tipper van',
    'Kombinirka': 'Backhoe loader', 'Nakladalec': 'Loader', 'Bager (gosenični)': 'Crawler excavator', 'Bager na kolesih': 'Wheeled excavator',
    'Kompaktni bager (midi)': 'Compact excavator (midi)', 'Kompaktni nakladalnik (skid steer)': 'Compact skid-steer loader',
    'Zgibni mini nakladalnik': 'Articulated mini loader', 'Nizkoprofilni nakladalnik (LHD)': 'Low-profile loader (LHD)',
    'Buldožer': 'Bulldozer', 'Dozer': 'Dozer', 'Greder (Motor Grader)': 'Motor grader', 'Demper': 'Dumper',
    'Demper (Samonakladalni)': 'Self-loading dumper', 'Samonakladalni demper': 'Self-loading dumper', 'Zglobni dumper': 'Articulated dumper',
    'Rudarski dumper': 'Mining dumper', 'Rudarski Demper': 'Mining dumper', 'Motorni strgač (scraper)': 'Motor scraper',
    'Valjar': 'Road roller', 'Asfaltni finišer': 'Asphalt paver', 'Hladni rezkar (cestni frezer)': 'Cold planer (road milling machine)',
    'Rovokopač (trencher)': 'Trencher', 'Avtodvigalo (Mobile Crane)': 'Mobile crane', 'Gosenično dvigalo (Crawler Crane)': 'Crawler crane',
    'Gradbeno dvigalo': 'Construction crane', 'Drobilec': 'Crusher', 'Sejalnik': 'Screening machine', 'Transportni trak': 'Conveyor belt',
    'Traktor': 'Tractor', 'Vrtni traktor': 'Garden tractor', 'Motokultivator': 'Rotary cultivator', 'Kombajn': 'Combine harvester',
    'Kosilnica': 'Mower', 'Mulčar': 'Mulcher', 'Plug': 'Plough', 'Brane': 'Harrow', 'Freza': 'Tiller', 'Sejalnica': 'Seed drill',
    'Škropilnica': 'Sprayer', 'Balirka': 'Baler', 'Cisterna': 'Tanker', 'Traktorska prikolica': 'Tractor trailer',
    'Harvester': 'Harvester', 'Gozdni kombajn': 'Forest harvester', 'Gozdni forwarder': 'Forwarder', 'Gozdni skider': 'Forest skidder',
    'Tovornjak za odpadke': 'Waste collection truck', 'Cestni pometač': 'Street sweeper', 'Avtovleka (Tow Truck)': 'Tow truck',
    'Viličar (Čelni)': 'Front forklift', 'Viličar (Električni)': 'Electric forklift', 'Teleskopski viličar': 'Telescopic forklift',
    'Terenski viličar': 'Rough-terrain forklift', 'Paletni viličar': 'Pallet truck', 'Reševalno vozilo (Ambulance)': 'Ambulance',
    'Policijsko intervencijsko vozilo': 'Police response vehicle', 'Gasilsko vozilo (črpalka)': 'Fire engine (pump)',
};

const originalText = new WeakMap();

export function translateAdvancedSearchPage(root = document) {
    const english = getCurrentLang() === 'en';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
        if (!node.parentElement || /^(SCRIPT|STYLE)$/i.test(node.parentElement.tagName)) return;
        if (!originalText.has(node)) originalText.set(node, node.nodeValue);
        const source = originalText.get(node);
        const trimmed = source.trim();
        if (!trimmed) return;
        const commercial = node.parentElement.closest('.commercial-vrsta-card, .commercial-cat-card, .commercial-drill-title');
        const translated = english ? (EN[trimmed] || (commercial && COMMERCIAL[trimmed])) : trimmed;
        if (!translated) return;
        node.nodeValue = source.replace(trimmed, translated);
    });

    root.querySelectorAll('input[placeholder], select[title], [aria-label]').forEach(el => {
        if (!el.dataset.advancedSearchOriginalPlaceholder && el.placeholder) el.dataset.advancedSearchOriginalPlaceholder = el.placeholder;
        if (!el.dataset.advancedSearchOriginalTitle && el.title) el.dataset.advancedSearchOriginalTitle = el.title;
        if (!el.dataset.advancedSearchOriginalAria && el.getAttribute('aria-label')) el.dataset.advancedSearchOriginalAria = el.getAttribute('aria-label');
        if (english) {
            if (el.placeholder && EN[el.placeholder]) el.placeholder = EN[el.placeholder];
            if (el.title && EN[el.title]) el.title = EN[el.title];
            const aria = el.getAttribute('aria-label');
            if (aria && EN[aria]) el.setAttribute('aria-label', EN[aria]);
        } else {
            if (el.dataset.advancedSearchOriginalPlaceholder) el.placeholder = el.dataset.advancedSearchOriginalPlaceholder;
            if (el.dataset.advancedSearchOriginalTitle) el.title = el.dataset.advancedSearchOriginalTitle;
            if (el.dataset.advancedSearchOriginalAria) el.setAttribute('aria-label', el.dataset.advancedSearchOriginalAria);
        }
    });
}
