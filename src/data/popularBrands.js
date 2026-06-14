// Top-10 "most popular" brands surfaced at the top of make dropdowns.
// Shared by the advanced-search page and the landing-page quick search so the
// two stay in lockstep. Keyed by canonical category slug ('avto', 'moto', …).
export const POPULAR_BRANDS = {
    avto: ['Audi', 'Dacia', 'Ford', 'Hyundai', 'Kia', 'Peugeot', 'Renault', 'Škoda', 'Toyota', 'Volkswagen'],
    moto: ['BMW', 'CF Moto', 'Ducati', 'Honda', 'Husqvarna', 'Kawasaki', 'KTM', 'Piaggio', 'Suzuki', 'Yamaha'],
};

// Normalise the various category slugs used across the app to a POPULAR_BRANDS
// key. The home page emits 'motor' for motorbikes; advanced search uses 'moto'.
export function popularBrandsFor(category) {
    const key = category === 'motor' ? 'moto' : category;
    return POPULAR_BRANDS[key] || [];
}
