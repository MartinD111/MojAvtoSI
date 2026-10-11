// Brand signature RGB colors for automotive, motorcycle, and commercial vehicle brands
// Each entry maps a brand name to its iconic primary RGB tuple string, e.g. "234, 179, 8" for Renault yellow.

const BRAND_COLORS_RGB = {
  // French brands
  "Renault": "234, 179, 8",          // Renault Yellow
  "Peugeot": "30, 64, 175",          // Peugeot Blue
  "Citroën": "220, 38, 38",          // Citroen Red
  "DS Automobiles": "180, 83, 9",    // DS Gold / Bronze
  "DS": "180, 83, 9",
  "Alpine": "2, 132, 199",           // Alpine Blue
  "Bugatti": "37, 99, 235",          // Bugatti Blue

  // German brands
  "Mercedes-Benz": "100, 116, 139",  // Silver / Slate
  "Mercedes": "100, 116, 139",
  "Mercedes-AMG": "100, 116, 139",
  "AMG": "100, 116, 139",
  "Benz": "100, 116, 139",
  "Auto Union": "100, 116, 139",
  "BMW": "37, 99, 235",              // Bavarian Blue
  "BMW M": "37, 99, 235",
  "BMW Motorrad": "37, 99, 235",
  "Audi": "100, 116, 139",           // Silver / Graphite Rings
  "Volkswagen": "2, 132, 199",       // VW Blue
  "VW": "2, 132, 199",
  "Porsche": "217, 119, 6",          // Stuttgart Crest Gold / Guards Red
  "Opel": "234, 179, 8",             // Opel Yellow
  "Smart": "13, 148, 136",           // Teal / Green
  "Maybach": "100, 116, 139",
  "Trabant": "3, 105, 161",

  // Italian brands
  "Alfa Romeo": "220, 38, 38",       // Rosso Alfa
  "Ferrari": "239, 68, 68",          // Rosso Corsa
  "Lamborghini": "245, 158, 11",     // Giallo Auge / Gold
  "Maserati": "30, 58, 138",         // Maserati Deep Blue
  "Fiat": "190, 18, 60",             // Fiat Ruby
  "Lancia": "30, 58, 138",
  "Abarth": "220, 38, 38",           // Scorpion Red / Yellow

  // Czech / Spanish / Romanian
  "Škoda": "22, 163, 74",            // Skoda Emerald
  "Skoda": "22, 163, 74",
  "Cupra": "180, 83, 9",             // Cupra Copper
  "SEAT": "225, 29, 72",             // Seat Red
  "Dacia": "234, 88, 12",            // Dacia Terracotta / Khaki

  // British / Swedish
  "Aston Martin": "4, 120, 87",      // British Racing Green
  "Jaguar": "4, 120, 87",            // British Racing Green
  "Land Rover": "21, 128, 61",       // Forest Green
  "MINI": "21, 128, 61",             // Racing Green
  "Bentley": "4, 120, 87",
  "Rolls-Royce": "71, 85, 105",
  "Lotus": "234, 179, 8",            // Lotus Yellow / Green
  "McLaren": "249, 115, 22",         // Papaya Orange
  "Volvo": "3, 105, 161",            // Iron Blue
  "Polestar": "217, 119, 6",         // Gold / Silver
  "Wolseley": "15, 23, 42",
  "Winton": "136, 19, 55",
  "Checker": "234, 179, 8",
  "Still": "234, 88, 12",

  // Asian brands
  "Toyota": "225, 29, 72",           // Toyota Red
  "Honda": "220, 38, 38",            // Type-R Red
  "Nissan": "185, 28, 28",           // Nissan Red
  "Mazda": "190, 18, 60",            // Soul Red Crystal
  "Subaru": "29, 78, 216",           // Rally Blue
  "Suzuki": "37, 99, 235",           // Suzuki Blue
  "Mitsubishi": "220, 38, 38",       // 3-Diamonds Red
  "Lexus": "71, 85, 105",            // Lexus Slate
  "Infiniti": "100, 116, 139",
  "Hyundai": "2, 132, 199",          // Hyundai Blue
  "Kia": "220, 38, 38",              // Kia Red
  "Genesis": "100, 116, 139",
  "SsangYong": "3, 105, 161",
  "KGM": "3, 105, 161",
  "BYD": "225, 29, 72",
  "MG": "220, 38, 38",
  "Geely": "37, 99, 235",

  // American brands
  "Ford": "29, 78, 216",             // Ford Blue Oval
  "Chevrolet": "217, 119, 6",        // Gold Bowtie
  "Tesla": "225, 29, 72",            // Tesla Red
  "Jeep": "77, 124, 15",             // Olive Green
  "Dodge": "220, 38, 38",            // SRT Red
  "RAM": "185, 28, 28",
  "Chrysler": "3, 105, 161",
  "Cadillac": "180, 83, 9",          // Crest Gold
  "GMC": "220, 38, 38",

  // Motorcycles & Micromobility
  "Yamaha": "29, 78, 216",           // Yamaha Racing Blue
  "Kawasaki": "22, 163, 74",         // Lime Green
  "Ducati": "220, 38, 38",           // Ducati Corse Red
  "KTM": "249, 115, 22",             // Ready to Race Orange
  "Harley-Davidson": "249, 115, 22", // Bar & Shield Orange
  "BMW Motorrad": "37, 99, 235",
  "Triumph": "185, 28, 28",
  "Aprilia": "220, 38, 38",
  "Moto Guzzi": "185, 28, 28",
  "Husqvarna": "3, 105, 161",
  "Vespa": "13, 148, 136",
  "Piaggio": "3, 105, 161",
  "CFMoto": "0, 180, 216",
  "CF Moto": "0, 180, 216",
  "Cagiva": "220, 38, 38",
  "Gilera": "220, 38, 38",
  "Buell": "0, 45, 98",
  "Moto Morini": "185, 28, 28",
  "Lambretta": "0, 56, 130",
  "Norton": "30, 41, 59",
  "Rieju": "220, 38, 38",
  "Sherco": "0, 43, 128",
  "SWM": "220, 38, 38",
  "TM": "2, 132, 199",
  "Ural": "30, 58, 138",
  "Zündapp": "245, 158, 11",
  "Bultaco": "234, 179, 8",
  "Husaberg": "2, 132, 199",
  "Hyosung": "220, 38, 38",
  "Italjet": "185, 28, 28",
  "Kreidler": "220, 38, 38",
  "Sachs": "0, 75, 135",
  "Simson": "30, 64, 175",
  "Benelli": "0, 90, 54",
  "GasGas": "220, 38, 38",
  "Puch": "0, 102, 51",
  "MV Agusta": "0, 51, 102",
  "Bimota": "220, 38, 38",
  "Derbi": "208, 0, 0",
  "Fantic": "204, 0, 0",
  "Malaguti": "204, 0, 0",
  "Royal Enfield": "17, 17, 17",
  "Indian Motorcycle": "153, 0, 0",
  "Indian": "153, 0, 0",
  "Super Soco": "0, 210, 132",
  "Sur-Ron": "255, 77, 0",
  "Zero": "204, 51, 0",
  "Zero Motorcycles": "204, 51, 0",
  "Niu": "223, 0, 31",
  "Segway": "228, 0, 43",
  "Talaria": "6, 182, 212",
  "Stark": "234, 179, 8",
  "QJ Motor": "225, 29, 72",
  "Yadea": "234, 88, 12",
  "Horwin": "13, 148, 136",
  "Energica": "132, 204, 22",
  "LiveWire": "234, 179, 8",
  "Specialized": "220, 38, 38",
  "Trek": "30, 41, 59",
  "Cube": "30, 41, 59",
  "Scott": "30, 41, 59",
  "Giant": "30, 41, 59",
  "Haibike": "2, 132, 199",
  "Bulls": "220, 38, 38",
  "Tony Kart": "21, 128, 61",
  "CRG": "234, 88, 12",
  "Birel": "220, 38, 38",
  "Sodi": "220, 38, 38",
  "Arctic Cat": "21, 128, 61",
  "Ski-Doo": "234, 179, 8",
  "Tomos": "220, 38, 38",

  // Commercial / Trucks
  "MAN": "2, 132, 199",              // MAN Blue
  "Scania": "30, 64, 175",           // Scania Griffin Blue
  "Iveco": "37, 99, 235",            // Iveco Blue
  "DAF": "30, 58, 138",              // DAF Blue
  "Mercedes-Benz Trucks": "100, 116, 139",
  "Renault Trucks": "220, 38, 38",
  "Volvo Trucks": "3, 105, 161",

  // Tires, parts and rider equipment — shared by the Gume in deli smart picker
  "Michelin": "0, 75, 141",
  "Continental": "244, 161, 0",
  "Bridgestone": "224, 34, 42",
  "Goodyear": "27, 72, 151",
  "Pirelli": "214, 28, 39",
  "Dunlop": "255, 207, 0",
  "Hankook": "238, 44, 47",
  "Nokian": "0, 90, 153",
  "Yokohama": "210, 35, 42",
  "Falken": "0, 105, 180",
  "Bosch": "228, 0, 43",
  "Brembo": "219, 25, 39",
  "ATE": "0, 73, 144",
  "TRW": "216, 30, 39",
  "Valeo": "0, 140, 81",
  "Denso": "220, 38, 38",
  "NGK": "213, 34, 47",
  "Mann": "255, 199, 0",
  "Mahle": "0, 91, 157",
  "Gates": "198, 30, 43",
  "Bilstein": "242, 186, 0",
  "Hella": "0, 92, 169",
  "Varta": "0, 69, 137",
  "Osram": "245, 126, 32",
  "Akrapovič": "220, 38, 38",
  "Alpinestars": "220, 38, 38",
  "Dainese": "220, 38, 38",
  "Shoei": "30, 64, 175",
  "AGV": "239, 68, 68",

  // Nautical / Marine Brands (Plovila, Motorji, Oprema)
  "Axopar": "0, 191, 178",
  "Azimut": "196, 154, 69",
  "Bali": "2, 132, 199",
  "Bavaria": "2, 132, 199",
  "Bayliner": "2, 132, 199",
  "Beneteau": "0, 43, 73",
  "Boston Whaler": "220, 38, 38",
  "Brig": "220, 38, 38",
  "BSC": "3, 105, 161",
  "Capelli": "225, 29, 72",
  "Chaparral": "2, 132, 199",
  "Cranchi": "185, 28, 28",
  "Crownline": "217, 119, 6",
  "De Antonio": "15, 23, 42",
  "Dehler": "220, 38, 38",
  "Dromeas": "2, 132, 199",
  "Dufour": "3, 105, 161",
  "Elan": "34, 197, 94",
  "Fairline": "30, 58, 138",
  "Fjord": "15, 23, 42",
  "Fountaine Pajot": "2, 132, 199",
  "Four Winns": "220, 38, 38",
  "Galeon": "196, 154, 69",
  "Grand": "220, 38, 38",
  "Grand Soleil": "245, 158, 11",
  "Greenline": "22, 163, 74",
  "Hanse": "220, 38, 38",
  "Highfield": "220, 38, 38",
  "Jeanneau": "220, 38, 38",
  "Joker Boat": "225, 29, 72",
  "Karnic": "2, 132, 199",
  "Lagoon": "2, 132, 199",
  "Lomac": "220, 38, 38",
  "Marlin": "3, 105, 161",
  "Monterey": "3, 105, 161",
  "Nimbus": "15, 23, 42",
  "Numarine": "234, 88, 12",
  "Pardo": "15, 23, 42",
  "Prestige": "196, 154, 69",
  "Princess": "30, 58, 138",
  "Quicksilver": "220, 38, 38",
  "Ranieri": "2, 132, 199",
  "Rinker": "15, 23, 42",
  "Sacs": "225, 29, 72",
  "Salona": "2, 132, 199",
  "Salpa": "2, 132, 199",
  "Sargo": "245, 158, 11",
  "Saxdor": "234, 88, 12",
  "Sea Ray": "15, 23, 42",
  "Sea-Doo": "245, 158, 11",
  "Sealine": "2, 132, 199",
  "Sessa Marine": "15, 23, 42",
  "Sirena": "196, 154, 69",
  "Sunseeker": "15, 23, 42",
  "Vicem": "185, 28, 28",
  "Williams": "2, 132, 199",
  "X-Yachts": "220, 38, 38",
  "Zar Formenti": "2, 132, 199",
  "Zodiac": "220, 38, 38",
  "Mercury Marine": "220, 38, 38",
  "Tohatsu": "3, 105, 161",
  "Torqeedo": "249, 115, 22",
  "Evinrude": "220, 38, 38",
  "Volvo Penta": "0, 48, 87",
  "Yanmar": "220, 38, 38",
  "Selva": "2, 132, 199",
  "ePropulsion": "6, 182, 212",
  "Parsun": "30, 58, 138",
  "Garmin": "0, 124, 195",
  "Raymarine": "220, 38, 38",
  "Lowrance": "3, 105, 161",
  "Simrad": "30, 58, 138",
  "Victron Energy": "2, 132, 199",

  // Bespoke & Specialty Manufacturers
  "Bristol": "128, 0, 0",
  "Devon": "148, 163, 184",
  "Dome": "225, 29, 72",
  "RUF": "0, 135, 81",
  "Caterham": "0, 66, 37",
  "Ultima": "153, 27, 27",
  "Tramontana": "148, 163, 184",
  "Lotec": "212, 175, 55",
  "Sabra": "30, 64, 175",
  "Fornasari": "185, 28, 28",
  "Yulon": "2, 132, 199",
  "Sungreen": "22, 163, 74",
  "VIA Motors": "56, 189, 248",
  "Gordon Murray": "10, 25, 47",
  "Ascari": "0, 94, 184",
  "Keating": "127, 29, 29",
  "Beck": "20, 83, 45",
  "Arash": "217, 119, 6",
  "Vencer": "100, 116, 139",
  "Trident": "30, 58, 138",
  "Trion": "239, 68, 68",
  "Hulme": "15, 23, 42",
  "Gunther Werks": "212, 175, 55",
  "RWB": "15, 23, 42",
  "Singer": "217, 119, 6",
  "DMC": "100, 116, 139",
  "DeLorean": "100, 116, 139"
};

// Normalized index for lookup
const normalizedColors = new Map();

function cleanKey(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

for (const [brand, rgb] of Object.entries(BRAND_COLORS_RGB)) {
  normalizedColors.set(brand.toLowerCase(), rgb);
  normalizedColors.set(cleanKey(brand), rgb);
}

// Default fallback color: sophisticated slate silver
const DEFAULT_BRAND_RGB = "100, 116, 139";

/**
 * Returns the brand's iconic RGB string (e.g. "234, 179, 8" for Renault)
 * @param {string} brandName
 * @returns {string} RGB tuple string
 */
export function getBrandRgb(brandName) {
  if (!brandName || typeof brandName !== 'string') return DEFAULT_BRAND_RGB;
  const trimmed = brandName.trim();
  if (!trimmed) return DEFAULT_BRAND_RGB;

  let rgb = BRAND_COLORS_RGB[trimmed];
  if (!rgb) rgb = normalizedColors.get(trimmed.toLowerCase());
  if (!rgb) rgb = normalizedColors.get(cleanKey(trimmed));

  return rgb || DEFAULT_BRAND_RGB;
}
