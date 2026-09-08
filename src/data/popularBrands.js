// Top-10 "most popular" brands surfaced at the top of make dropdowns.
// Shared by the advanced-search page and the landing-page quick search so the
// two stay in lockstep. Keyed by canonical category slug ('avto', 'moto', …).
export const POPULAR_BRANDS = {
    avto: [
        'Alfa Romeo',
        'Audi',
        'BMW',
        'BYD',
        'Citroën',
        'Cupra',
        'Dacia',
        'Fiat',
        'Ford',
        'Honda',
        'Hyundai',
        'Jaecoo',
        'Kia',
        'Mercedes-Benz',
        'Mini',
        'Nissan',
        'Opel',
        'Peugeot',
        'Polestar',
        'Renault',
        'Škoda',
        'Tesla',
        'Toyota',
        'Volkswagen'
    ],
    moto: ['BMW Motorrad', 'BMW', 'CFMoto', 'CF Moto', 'Ducati', 'Honda', 'Husqvarna', 'Kawasaki', 'KTM', 'Piaggio', 'Suzuki', 'Yamaha'],
    plovila: ['Axopar', 'Bavaria', 'Bayliner', 'Beneteau', 'Elan', 'Jeanneau', 'Quicksilver', 'Sea Ray', 'Yamaha', 'Zodiac'],
    izvenkrmni: ['Yamaha', 'Mercury', 'Honda', 'Suzuki', 'Tohatsu', 'Torqeedo', 'Evinrude', 'Volvo Penta', 'Selva', 'Parsun'],
};

// Normalise the various category slugs used across the app to a POPULAR_BRANDS
// key. The home page emits 'motor' for motorbikes; advanced search uses 'moto'.
export function popularBrandsFor(category) {
    if (!category) return [];
    const norm = String(category).toLowerCase().replace(/_/g, '-');
    if (norm === 'motor' || norm === 'moto') return POPULAR_BRANDS.moto;
    if (norm === 'izvenkrmni' || norm === 'izvenkrmni-motorji') return POPULAR_BRANDS.izvenkrmni;
    if (norm === 'colni' || norm === 'jadrnice' || norm === 'gumenjaki' || norm === 'jet-ski' || norm === 'plovila' || norm === 'navtika' || norm === 'plovilo') {
        return POPULAR_BRANDS.plovila;
    }
    return POPULAR_BRANDS[norm] || [];
}
