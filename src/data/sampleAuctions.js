// Sample auction (dražba) listings — MojAvto.si / MojaNavtika.si
//
// Demo/fallback data so the auction board (#/drazbe) and detail page (#/drazba?id=)
// are populated and fully interactive WITHOUT a backend. Each entry is a normal
// listing doc with `entryType: 'auction'` (so it flows through getListings and the
// standard listing renderer), paired with mock auction state + a bid history that
// auctionService falls back to when there is no Firestore doc.
//
// Timestamps are computed at module load as offsets from now, so the countdowns are
// always live (an auction ending "in 3 days" stays 3 days out, never goes stale).
// Shapes mirror docs/AUCTIONS_HANDOFF.md:
//   • listing.endsAt / auction.endsAt|startsAt — Date
//   • auction.priceSeries[].t — ms number
//   • bid.createdAt — Firestore-Timestamp-like shim ({ toDate, toMillis, seconds })

const NOW = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

/** A Firestore-Timestamp-like object for a given ms epoch (bid.createdAt uses .toDate). */
function tsAt(ms) {
    return {
        seconds: Math.floor(ms / 1000),
        nanoseconds: 0,
        toMillis: () => ms,
        toDate: () => new Date(ms),
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Builder — keeps each auction definition compact. Given a starting price and a
// list of bids (amount + how many hours ago, newest last), it derives the listing
// auction fields, the auction state doc, the bid docs (newest first), and the
// denormalized price series for the chart.
// ──────────────────────────────────────────────────────────────────────────────
function buildAuction(listing, {
    startPrice,
    reservePrice = null,
    durationWeeks,
    endsInDays,
    bids = [],            // [{ name, amount, hoursAgo }] oldest → newest
    sellerId = 'demo-seller',
}) {
    const startsAt = NOW - (durationWeeks * 7 * DAY - endsInDays * DAY);
    const endsAt = NOW + endsInDays * DAY;

    // Price series starts at the opening price, then one point per bid.
    const series = [{ t: startsAt, amount: startPrice, bidders: 0 }];
    const seenBidders = new Set();
    bids.forEach((b) => {
        seenBidders.add(b.name);
        series.push({ t: NOW - b.hoursAgo * HOUR, amount: b.amount, bidders: seenBidders.size });
    });

    const last = bids[bids.length - 1];
    const currentBidEur = last ? last.amount : startPrice;
    const bidderCount = seenBidders.size;

    // Bid docs newest-first (matches subscribeBids orderBy createdAt desc).
    const bidDocs = bids
        .map((b, i) => ({
            id: `bid-${listing.id}-${i}`,
            bidderId: `demo-bidder-${b.name}`,
            bidderName: b.name,
            amountEur: b.amount,
            contract: { type: 'sign', signatureData: null, signedAt: tsAt(NOW - b.hoursAgo * HOUR) },
            notify: { onOutbid: true, thresholdEur: null },
            createdAt: tsAt(NOW - b.hoursAgo * HOUR),
        }))
        .reverse();

    const auction = {
        id: listing.id,
        listingId: listing.id,
        sellerId,
        status: 'active',
        startPriceEur: startPrice,
        reservePriceEur: reservePrice,
        currentBidEur,
        currentBidderId: last ? `demo-bidder-${last.name}` : null,
        bidCount: bids.length,
        bidderCount,
        durationWeeks,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        sellerContract: { type: 'sign', signatureData: null, signedAt: tsAt(startsAt) },
        packageId: durationWeeks >= 6 ? 'auction6w' : 'auction3w',
        paidAmount: durationWeeks >= 6 ? 9.99 : 4.99,
        paymentRef: null,
        priceSeries: series,
        winnerId: null,
    };

    // Listing-doc auction mirror fields (read by cards + price display).
    const listingDoc = {
        ...listing,
        entryType: 'auction',
        auctionDurationWeeks: durationWeeks,
        startPriceEur: startPrice,
        endsAt: new Date(endsAt),
        priceEur: currentBidEur,
        priceRaw: currentBidEur,
        price: `${currentBidEur.toLocaleString('sl-SI')} €`,
        status: 'active',
    };

    return { listing: listingDoc, auction, bids: bidDocs };
}

// ── Car auctions (avto/moto) ──────────────────────────────────────────────────
const CAR_DEFS = [
    [
        {
            id: 'auction-car-1',
            title: 'BMW M3 Competition',
            subtitle: '3.0 R6 (510 KM) — M xDrive, karbon paket, Laser',
            year: '2022',
            mileage: '34.500 km',
            mileageKm: 34500,
            power: '375 kW (510 KM)',
            powerKw: 375,
            fuel: 'Petrol',
            condition: 'Rabljeno',
            sellerNote: 'Servisno knjižico vodi BMW. Brez vlaganj, prvi lastnik.',
            location: { city: 'Ljubljana', postalCode: '1000', region: 'Osrednjeslovenska' },
            seller: 'Zasebni prodajalec',
            sellerImage: 'https://i.pravatar.cc/150?u=bmwm3',
            sellerType: 'private',
            segment: 'Sport',
            category: 'avto',
            itemType: 'vehicle',
            make: 'BMW',
            model: 'M3',
            variant: 'Competition',
            transmission: 'Avtomatski',
            driveType: '4x4',
            color: 'Siva',
            doorsCount: 4,
            seatsCount: 5,
            engineCc: 2993,
            firstRegistration: '06/2022',
            previousOwnersCount: 1,
            images: {
                exterior: [
                    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
                ],
                interior: [],
            },
            imgCount: 21,
        },
        {
            startPrice: 52000,
            reservePrice: 64000,
            durationWeeks: 3,
            endsInDays: 2,
            bids: [
                { name: 'Marko', amount: 52000, hoursAgo: 70 },
                { name: 'Janez', amount: 53500, hoursAgo: 64 },
                { name: 'Marko', amount: 55000, hoursAgo: 50 },
                { name: 'Aleš', amount: 57000, hoursAgo: 33 },
                { name: 'Janez', amount: 58500, hoursAgo: 20 },
                { name: 'Aleš', amount: 60000, hoursAgo: 6 },
            ],
        },
    ],
    [
        {
            id: 'auction-car-2',
            title: 'Volkswagen Golf GTI',
            subtitle: '2.0 TSI (245 KM) — DSG, Akrapovič, virtual cockpit',
            year: '2019',
            mileage: '78.000 km',
            mileageKm: 78000,
            power: '180 kW (245 KM)',
            powerKw: 180,
            fuel: 'Petrol',
            condition: 'Rabljeno',
            sellerNote: 'Lepo ohranjen, redno servisiran. Zimske + letne gume.',
            location: { city: 'Celje', postalCode: '3000', region: 'Savinjska' },
            seller: 'AvtoCenter Celje',
            sellerImage: 'https://i.pravatar.cc/150?u=golfgti',
            sellerType: 'dealer',
            segment: 'Hatchback',
            category: 'avto',
            itemType: 'vehicle',
            make: 'Volkswagen',
            model: 'Golf',
            variant: 'GTI',
            transmission: 'Avtomatski',
            driveType: 'Spredaj',
            color: 'Bela',
            doorsCount: 5,
            seatsCount: 5,
            engineCc: 1984,
            firstRegistration: '03/2019',
            previousOwnersCount: 2,
            images: {
                exterior: [
                    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
                ],
                interior: [],
            },
            imgCount: 15,
        },
        {
            startPrice: 16500,
            reservePrice: null,
            durationWeeks: 3,
            endsInDays: 5,
            bids: [
                { name: 'Peter', amount: 16500, hoursAgo: 40 },
                { name: 'Sara', amount: 17000, hoursAgo: 28 },
                { name: 'Peter', amount: 17800, hoursAgo: 9 },
            ],
        },
    ],
    [
        {
            id: 'auction-car-3',
            title: 'Mercedes-Benz G 350 d',
            subtitle: '3.0 R6 dizel (286 KM) — AMG paket, AdBlue, 360° kamera',
            year: '2021',
            mileage: '46.000 km',
            mileageKm: 46000,
            power: '210 kW (286 KM)',
            powerKw: 210,
            fuel: 'Dizel',
            condition: 'Rabljeno',
            sellerNote: 'Top oprema. Možen leasing prevzem. Vključen komplet zimskih gum.',
            location: { city: 'Maribor', postalCode: '2000', region: 'Podravska' },
            seller: 'Star Automobili',
            sellerImage: 'https://i.pravatar.cc/150?u=gklasa',
            sellerType: 'dealer',
            segment: 'SUV',
            category: 'avto',
            itemType: 'vehicle',
            make: 'Mercedes-Benz',
            model: 'G 350',
            variant: 'd AMG Line',
            transmission: 'Avtomatski',
            driveType: '4x4',
            color: 'Črna',
            doorsCount: 5,
            seatsCount: 5,
            engineCc: 2925,
            firstRegistration: '09/2021',
            previousOwnersCount: 1,
            images: {
                exterior: [
                    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
                ],
                interior: [],
            },
            imgCount: 27,
        },
        {
            startPrice: 89000,
            reservePrice: 105000,
            durationWeeks: 6,
            endsInDays: 9,
            bids: [
                { name: 'Robert', amount: 89000, hoursAgo: 120 },
                { name: 'Damjan', amount: 92000, hoursAgo: 96 },
                { name: 'Robert', amount: 95000, hoursAgo: 60 },
                { name: 'Nina', amount: 98000, hoursAgo: 18 },
            ],
        },
    ],
    [
        {
            id: 'auction-car-4',
            title: 'Yamaha MT-09',
            subtitle: '847 cm³ (115 KM) — Akrapovič, quickshifter, ABS',
            year: '2020',
            mileage: '12.300 km',
            mileageKm: 12300,
            power: '85 kW (115 KM)',
            powerKw: 85,
            fuel: 'Petrol',
            condition: 'Rabljeno',
            sellerNote: 'Garažiran, nikoli padel. Dodatna oprema v vrednosti 1.500 €.',
            location: { city: 'Kranj', postalCode: '4000', region: 'Gorenjska' },
            seller: 'Zasebni prodajalec',
            sellerImage: 'https://i.pravatar.cc/150?u=mt09',
            sellerType: 'private',
            segment: 'Naked',
            category: 'motorna-kolesa',
            itemType: 'vehicle',
            make: 'Yamaha',
            model: 'MT-09',
            variant: 'MT-09',
            transmission: 'Ročni',
            color: 'Modra',
            engineCc: 847,
            firstRegistration: '04/2020',
            previousOwnersCount: 1,
            images: {
                exterior: [
                    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
                ],
                interior: [],
            },
            imgCount: 12,
        },
        {
            startPrice: 6500,
            reservePrice: null,
            durationWeeks: 3,
            endsInDays: 1,
            bids: [
                { name: 'Tine', amount: 6500, hoursAgo: 30 },
                { name: 'Gregor', amount: 6800, hoursAgo: 22 },
                { name: 'Tine', amount: 7100, hoursAgo: 12 },
                { name: 'Miha', amount: 7400, hoursAgo: 3 },
            ],
        },
    ],
];

// ── Boat auctions (navtika) ───────────────────────────────────────────────────
const BOAT_DEFS = [
    [
        {
            id: 'auction-boat-1',
            title: 'Jeanneau Cap Camarat 7.5',
            subtitle: 'Mercury 250 KM — športni gliser, kot nov',
            year: '2021',
            location: { city: 'Koper', postalCode: '6000', region: 'Obalno-kraška' },
            seller: 'Marina Trade',
            sellerImage: 'https://i.pravatar.cc/150?u=capcamarat',
            sellerType: 'dealer',
            category: 'colni',
            subcategory: 'motorni-coln',
            bodyType: 'KabinskiColn',
            itemType: 'plovilo',
            listingType: 'sale',
            isRental: false,
            make: 'Jeanneau',
            model: 'Cap Camarat 7.5',
            variant: 'Cap Camarat 7.5 WA',
            lengthM: 7.5,
            beamM: 2.5,
            draftM: 0.6,
            engineHours: 95,
            enginePowerHp: 250,
            enginePowerKw: 184,
            engineCount: 1,
            engineMountType: 'izvenkrmni',
            engineMake: 'Mercury',
            fuel: 'Bencin',
            hullMaterial: 'Stekloplastika',
            cabins: 1,
            berths: 2,
            ceCategory: 'C',
            condition: 'Rabljeno',
            equipment: ['gps_plotter', 'bimini', 'teak', 'shower'],
            images: {
                exterior: [
                    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=800&q=80',
                ],
                interior: [],
            },
            imgCount: 16,
        },
        {
            startPrice: 38000,
            reservePrice: 46000,
            durationWeeks: 3,
            endsInDays: 3,
            bids: [
                { name: 'Boris', amount: 38000, hoursAgo: 55 },
                { name: 'Davor', amount: 39500, hoursAgo: 41 },
                { name: 'Boris', amount: 41000, hoursAgo: 16 },
                { name: 'Tomaž', amount: 42500, hoursAgo: 4 },
            ],
        },
    ],
    [
        {
            id: 'auction-boat-2',
            title: 'Bavaria Cruiser 37',
            subtitle: 'Jadrnica, 3 kabine — Volvo Penta 30 KM',
            year: '2016',
            location: { city: 'Portorož', postalCode: '6320', region: 'Obalno-kraška' },
            seller: 'Zasebni prodajalec',
            sellerImage: 'https://i.pravatar.cc/150?u=bavaria37',
            sellerType: 'private',
            category: 'jadrnice',
            subcategory: 'jadrnica',
            bodyType: 'Jadrnica',
            itemType: 'plovilo',
            listingType: 'sale',
            isRental: false,
            make: 'Bavaria',
            model: 'Cruiser 37',
            variant: 'Cruiser 37',
            lengthM: 11.3,
            beamM: 3.7,
            draftM: 1.9,
            engineHours: 1200,
            enginePowerHp: 30,
            enginePowerKw: 22,
            engineCount: 1,
            engineMountType: 'vgrajeni',
            engineMake: 'Volvo Penta',
            fuel: 'Dizel',
            hullMaterial: 'Stekloplastika',
            cabins: 3,
            berths: 6,
            ceCategory: 'A',
            condition: 'Rabljeno',
            equipment: ['autopilot', 'gps_plotter', 'bow_thruster', 'solar_panel', 'refrigerator'],
            images: {
                exterior: [
                    'https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=800&q=80',
                ],
                interior: [],
            },
            imgCount: 22,
        },
        {
            startPrice: 72000,
            reservePrice: null,
            durationWeeks: 6,
            endsInDays: 7,
            bids: [
                { name: 'Andrej', amount: 72000, hoursAgo: 90 },
                { name: 'Klemen', amount: 74000, hoursAgo: 50 },
                { name: 'Andrej', amount: 76500, hoursAgo: 10 },
            ],
        },
    ],
];

// ── Build ───────────────────────────────────────────────────────────────────
const _carBuilt = CAR_DEFS.map(([listing, opts]) => buildAuction(listing, opts));
const _boatBuilt = BOAT_DEFS.map(([listing, opts]) => buildAuction(listing, opts));

/** Auction listing docs (entryType: 'auction') — merged into getListings(). */
export const sampleAuctionCars = _carBuilt.map(b => b.listing);
export const sampleAuctionBoats = _boatBuilt.map(b => b.listing);

/**
 * Mock auction state keyed by listing id: { auction, bids }. auctionService falls
 * back to this when no Firestore auction doc exists (demo listings have none).
 */
export const sampleAuctionState = {};
[..._carBuilt, ..._boatBuilt].forEach(b => {
    sampleAuctionState[b.listing.id] = { auction: b.auction, bids: b.bids };
});
