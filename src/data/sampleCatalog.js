// ═══════════════════════════════════════════════════════════════════════════════
// Sample price-comparison catalog — MojAvto.si
// MOCK DATA. These products mimic what the future webscraping backend will write
// into the Firestore `partsCatalog` collection (see docs/WEBSCRAPING_HANDOFF.md).
// Each product carries an `offers[]` array of shop offers; the UI shows the lowest
// price ("od X€") and links out to each shop. Domains/prices here are illustrative.
//
// Shape mirrors partsCatalog:
//   { id, itemType:'part'|'tire', vehicleCategory, title, brand, imageUrl,
//     attributes:{...}, offers:[{shop,domain,price,currency,url,inStock}],
//     lowestPrice, offerCount, status, ingestSource }
// ═══════════════════════════════════════════════════════════════════════════════

function build(products) {
    return products.map(p => {
        const prices = p.offers.map(o => o.price).filter(n => typeof n === 'number');
        return {
            status: 'active',
            ingestSource: 'mock',
            currency: 'EUR',
            ...p,
            lowestPrice: prices.length ? Math.min(...prices) : null,
            offerCount: p.offers.length,
        };
    });
}

export const SAMPLE_CATALOG = build([
    // ── Tires — cars ─────────────────────────────────────────────────────────
    {
        id: 'cat-tire-1',
        itemType: 'tire',
        vehicleCategory: 'avto',
        title: 'Michelin Primacy 4 205/55 R16 91V',
        brand: 'Michelin',
        imageUrl: '',
        attributes: { size: '205/55 R16', width: 205, aspect: 55, rim: 16, season: 'letne', loadIndex: '91', speedRating: 'V' },
        offers: [
            { shop: 'Pnevmatike24', domain: 'pnevmatike24.si', price: 89, url: 'https://www.pnevmatike24.si/', inStock: true },
            { shop: 'Guma Shop', domain: 'guma-shop.si', price: 94, url: 'https://www.guma-shop.si/', inStock: true },
            { shop: 'Avto Center', domain: 'avtocenter.si', price: 99, url: 'https://www.avtocenter.si/', inStock: false },
        ],
    },
    {
        id: 'cat-tire-2',
        itemType: 'tire',
        vehicleCategory: 'avto',
        title: 'Continental WinterContact TS870 195/65 R15 91T',
        brand: 'Continental',
        imageUrl: '',
        attributes: { size: '195/65 R15', width: 195, aspect: 65, rim: 15, season: 'zimske', loadIndex: '91', speedRating: 'T' },
        offers: [
            { shop: 'Pnevmatike24', domain: 'pnevmatike24.si', price: 72, url: 'https://www.pnevmatike24.si/', inStock: true },
            { shop: 'Rodi', domain: 'rodi.si', price: 75, url: 'https://www.rodi.si/', inStock: true },
            { shop: 'Guma Shop', domain: 'guma-shop.si', price: 79, url: 'https://www.guma-shop.si/', inStock: true },
            { shop: 'Avto Center', domain: 'avtocenter.si', price: 84, url: 'https://www.avtocenter.si/', inStock: true },
        ],
    },
    {
        id: 'cat-tire-3',
        itemType: 'tire',
        vehicleCategory: 'avto',
        title: 'Goodyear Vector 4Seasons Gen-3 225/45 R17 94W',
        brand: 'Goodyear',
        imageUrl: '',
        attributes: { size: '225/45 R17', width: 225, aspect: 45, rim: 17, season: 'celoletne', loadIndex: '94', speedRating: 'W' },
        offers: [
            { shop: 'Rodi', domain: 'rodi.si', price: 118, url: 'https://www.rodi.si/', inStock: true },
            { shop: 'Pnevmatike24', domain: 'pnevmatike24.si', price: 125, url: 'https://www.pnevmatike24.si/', inStock: true },
        ],
    },
    // ── Tires — motorcycles ──────────────────────────────────────────────────
    {
        id: 'cat-tire-4',
        itemType: 'tire',
        vehicleCategory: 'moto',
        title: 'Michelin Road 6 120/70 ZR17',
        brand: 'Michelin',
        imageUrl: '',
        attributes: { size: '120/70 R17', width: 120, aspect: 70, rim: 17, season: 'letne', loadIndex: '58', speedRating: 'W' },
        offers: [
            { shop: 'Moto Guma', domain: 'motoguma.si', price: 135, url: 'https://www.motoguma.si/', inStock: true },
            { shop: 'Pnevmatike24', domain: 'pnevmatike24.si', price: 142, url: 'https://www.pnevmatike24.si/', inStock: true },
        ],
    },
    // ── Tires — commercial ───────────────────────────────────────────────────
    {
        id: 'cat-tire-5',
        itemType: 'tire',
        vehicleCategory: 'gospodarska',
        title: 'Continental HDR2 315/80 R22.5',
        brand: 'Continental',
        imageUrl: '',
        attributes: { size: '315/80 R22', width: 315, aspect: 80, rim: 22, season: 'celoletne' },
        offers: [
            { shop: 'Tovorne Gume', domain: 'tovorne-gume.si', price: 320, url: 'https://www.tovorne-gume.si/', inStock: true },
            { shop: 'Rodi', domain: 'rodi.si', price: 345, url: 'https://www.rodi.si/', inStock: true },
        ],
    },

    // ── Parts — cars ─────────────────────────────────────────────────────────
    {
        id: 'cat-part-1',
        itemType: 'part',
        vehicleCategory: 'avto',
        title: 'Bosch zavorne ploščice spredaj (komplet)',
        brand: 'Bosch',
        imageUrl: '',
        attributes: {
            partGroup: 'zavore', partType: 'ploscice', oemNumber: '0986494104',
            compatibility: [{ make: 'Volkswagen', model: 'Golf' }, { make: 'Audi', model: 'A3' }],
        },
        offers: [
            { shop: 'Avto Deli', domain: 'avto-deli.si', price: 32, url: 'https://www.avto-deli.si/', inStock: true },
            { shop: 'Rezervni Deli', domain: 'rezervni-deli.si', price: 35, url: 'https://www.rezervni-deli.si/', inStock: true },
            { shop: 'Mister Auto', domain: 'mister-auto.si', price: 38, url: 'https://www.mister-auto.si/', inStock: true },
        ],
    },
    {
        id: 'cat-part-2',
        itemType: 'part',
        vehicleCategory: 'avto',
        title: 'Mann oljni filter W712/95',
        brand: 'Mann-Filter',
        imageUrl: '',
        attributes: {
            partGroup: 'motor', partType: 'olje_filtri', oemNumber: 'W712/95',
            compatibility: [{ make: 'Volkswagen', model: 'Polo' }],
        },
        offers: [
            { shop: 'Avto Deli', domain: 'avto-deli.si', price: 6, url: 'https://www.avto-deli.si/', inStock: true },
            { shop: 'Rezervni Deli', domain: 'rezervni-deli.si', price: 7, url: 'https://www.rezervni-deli.si/', inStock: true },
        ],
    },
    {
        id: 'cat-part-3',
        itemType: 'part',
        vehicleCategory: 'avto',
        title: 'Sachs sklopka komplet',
        brand: 'Sachs',
        imageUrl: '',
        attributes: {
            partGroup: 'menjalnik', partType: 'sklopka', oemNumber: '3000951081',
            compatibility: [{ make: 'BMW', model: '3 Series' }],
        },
        offers: [
            { shop: 'Rezervni Deli', domain: 'rezervni-deli.si', price: 165, url: 'https://www.rezervni-deli.si/', inStock: true },
            { shop: 'Mister Auto', domain: 'mister-auto.si', price: 189, url: 'https://www.mister-auto.si/', inStock: true },
            { shop: 'Avto Deli', domain: 'avto-deli.si', price: 199, url: 'https://www.avto-deli.si/', inStock: false },
        ],
    },
    // ── Parts — motorcycles ──────────────────────────────────────────────────
    {
        id: 'cat-part-4',
        itemType: 'part',
        vehicleCategory: 'moto',
        title: 'DID veriga 520 VX3 (118 členov)',
        brand: 'DID',
        imageUrl: '',
        attributes: {
            partGroup: 'veriga_pogon', partType: 'veriga',
            compatibility: [{ make: 'Yamaha', model: 'MT-07' }],
        },
        offers: [
            { shop: 'Moto Deli', domain: 'moto-deli.si', price: 58, url: 'https://www.moto-deli.si/', inStock: true },
            { shop: 'Moto Guma', domain: 'motoguma.si', price: 64, url: 'https://www.motoguma.si/', inStock: true },
        ],
    },
    // ── Parts — leisure ──────────────────────────────────────────────────────
    {
        id: 'cat-part-5',
        itemType: 'part',
        vehicleCategory: 'prosti-cas',
        title: 'Truma Therme bojler 5L',
        brand: 'Truma',
        imageUrl: '',
        attributes: {
            partGroup: 'plin', partType: 'bojler',
            compatibility: [],
        },
        offers: [
            { shop: 'Kamping Center', domain: 'kamping-center.si', price: 119, url: 'https://www.kamping-center.si/', inStock: true },
            { shop: 'Avtodom Shop', domain: 'avtodom-shop.si', price: 129, url: 'https://www.avtodom-shop.si/', inStock: true },
        ],
    },
    // ── More tires and parts ─────────────────────────────────────────────────
    {
        id: 'cat-tire-6',
        itemType: 'tire',
        vehicleCategory: 'avto',
        title: 'Pirelli P Zero 245/40 R18 97Y',
        brand: 'Pirelli',
        imageUrl: '',
        attributes: { size: '245/40 R18', width: 245, aspect: 40, rim: 18, season: 'letne', loadIndex: '97', speedRating: 'Y' },
        offers: [
            { shop: 'Pnevmatike24', domain: 'pnevmatike24.si', price: 145, url: 'https://www.pnevmatike24.si/', inStock: true },
            { shop: 'Guma Shop', domain: 'guma-shop.si', price: 152, url: 'https://www.guma-shop.si/', inStock: true },
        ],
    },
    {
        id: 'cat-part-6',
        itemType: 'part',
        vehicleCategory: 'avto',
        title: 'Brembo zavorni diski spredaj',
        brand: 'Brembo',
        imageUrl: '',
        attributes: {
            partGroup: 'zavore', partType: 'diski', oemNumber: '09.A259.1X',
            compatibility: [{ make: 'Skoda', model: 'Octavia' }, { make: 'Volkswagen', model: 'Golf' }],
        },
        offers: [
            { shop: 'Avto Deli', domain: 'avto-deli.si', price: 85, url: 'https://www.avto-deli.si/', inStock: true },
            { shop: 'Rezervni Deli', domain: 'rezervni-deli.si', price: 89, url: 'https://www.rezervni-deli.si/', inStock: true },
        ],
    },
]);
