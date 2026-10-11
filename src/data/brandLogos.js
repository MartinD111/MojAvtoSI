import { BRAND_LOGOS } from './brandLogosMap.js';

// Pre-build normalized index for fast, resilient lookups
const normalizedIndex = new Map();

function cleanKey(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const ALIASES = {
  'mercedes': 'mercedesbenz',
  'mercedesamg': 'mercedesbenz',
  'mercedes-amg': 'mercedesbenz',
  'amg': 'mercedesbenz',
  'benz': 'mercedesbenz',
  'carlbenz': 'mercedesbenz',
  'bmwmotorrad': 'bmw',
  'bmwm': 'bmw',
  'audisport': 'audi',
  'autounion': 'audi',
  'toyotaforklift': 'toyota',
  'schmitzcargobull': 'schmitz',
  'volkswagencommercial': 'volkswagen',
  'vw': 'volkswagen',
  'yamahamotor': 'yamaha',
  'yamahamarine': 'yamaha',
  'hondamarine': 'honda',
  'suzukimarine': 'suzuki',
  'cf': 'cfmoto',
  'cfmoto': 'cfmoto',
  'adriamobil': 'adria',
  'adriahome': 'adria',
  'bsa': 'bsa',
  'birminghamsmallarmsbsa': 'bsa',
  'birminghamsmallarms': 'bsa',
  'kgm': 'ssangyong',
  'kgmssangyong': 'ssangyong',
  'ds': 'ds',
  'dsautomobiles': 'ds',
  'automobilipininfarina': 'pininfarina',
  'panhardlevassor': 'panhard',
  'willysoverland': 'jeep',
  'yugo': 'zastava',
  'volvopenta': 'volvo-penta',
  'mercurymarine': 'mercury',
  'seadoo': 'sea-doo',
  'searay': 'sea-ray',
  'fountainepajot': 'fountaine-pajot',
  'bostonwhaler': 'boston-whaler',
  'fourwinns': 'four-winns',
  'jokerboat': 'joker-boat',
  'grandsoleil': 'grand-soleil',
  'deantonio': 'de-antonio',
  'zarformenti': 'zar-formenti',
  'zar': 'zar-formenti',
  'sessamarine': 'sessa-marine',
  'sessayachts': 'sessa-marine',
  'xyachts': 'x-yachts',
  'victronenergy': 'victron-energy',
  'mzmotorrad': 'mz',
  'erikbuellracing': 'ebr',
  'made2race': 'm2r',
  'radpower': 'radpowerbikes',
  'riesemuller': 'riese-muller',
  'rieseundmuller': 'riese-muller',
  'birelart': 'birel',
  'dedion': 'dedionbouton',
  'moskvic': 'moskvich'
};

for (const [brand, filename] of Object.entries(BRAND_LOGOS)) {
  normalizedIndex.set(brand.toLowerCase(), filename);
  normalizedIndex.set(cleanKey(brand), filename);
}

// Ensure aliases point to the correct logo
for (const [alias, targetKey] of Object.entries(ALIASES)) {
  const targetFile = normalizedIndex.get(targetKey);
  if (targetFile && !normalizedIndex.has(alias)) {
    normalizedIndex.set(alias, targetFile);
  }
}

/**
 * Returns the URL path to the brand logo, or null if no logo is available.
 * @param {string} brandName - e.g. "Audi", "Škoda", "BMW Motorrad", "Yamaha"
 * @returns {string|null}
 */
export function getBrandLogo(brandName) {
  if (!brandName || typeof brandName !== 'string') return null;
  const trimmed = brandName.trim();
  if (!trimmed) return null;

  // Direct check
  let file = BRAND_LOGOS[trimmed];
  if (!file) file = normalizedIndex.get(trimmed.toLowerCase());
  if (!file) file = normalizedIndex.get(cleanKey(trimmed));

  if (!file) return null;

  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
    ? import.meta.env.BASE_URL
    : '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  return `${cleanBase}images/brand-logos/${file}`;
}

/**
 * Returns a 1-2 character monogram for brands without a logo.
 * @param {string} brandName
 * @returns {string}
 */
export function getBrandInitial(brandName) {
  if (!brandName) return '';
  const words = brandName.trim().split(/\s+|-/);
  if (words.length >= 2 && words[0] && words[1]) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return brandName.trim().slice(0, 2).toUpperCase();
}

const MONOCHROME_ADAPTIVE = new Set([
  'afeela',
  'aprilia',
  'aquawatt',
  'audi',
  'autounion',
  'aventon',
  'axopar',
  'azimut',
  'bali',
  'bayliner',
  'beneteau',
  'benz',
  'bmw',
  'bollinger',
  'bosch',
  'bostonwhaler',
  'brig',
  'bsc',
  'cake',
  'canam',
  'canyon',
  'capelli',
  'carlbenz',
  'caterpillar',
  'cfmoto',
  'chaparral',
  'citroen',
  'citron',
  'cowboy',
  'cranchi',
  'crownline',
  'cube',
  'cupra',
  'dacia',
  'deantonio',
  'dehler',
  'delorean',
  'deloreanshort',
  'dmc',
  'dromeas',
  'ds',
  'dsautomobiles',
  'ducati',
  'dufour',
  'elan',
  'elco',
  'epropulsion',
  'evinrude',
  'fairline',
  'fjord',
  'fluxmarine',
  'focus',
  'ford',
  'fountainepajot',
  'fourwinns',
  'furuno',
  'galeon',
  'garmin',
  'giant',
  'goldenmotor',
  'grand',
  'grandsoleil',
  'greenline',
  'hangkai',
  'hanse',
  'harleydavidson',
  'hidea',
  'highfield',
  'honda',
  'husqvarna',
  'hyundai',
  'jaecoo',
  'jcb',
  'jeanneau',
  'johndeere',
  'jokerboat',
  'karnic',
  'kawasaki',
  'kia',
  'koda',
  'kohler',
  'krautler',
  'ktm',
  'lagoon',
  'laverda',
  'lehr',
  'lian',
  'lomac',
  'lowrance',
  'mariner',
  'marlin',
  'mazda',
  'mercedes',
  'mercedesbenz',
  'mercurymarine',
  'mitsubishi',
  'monterey',
  'moustache',
  'neoplan',
  'neupropulsion',
  'nimbus',
  'nissan',
  'niu',
  'norton',
  'numarine',
  'opel',
  'orbea',
  'pardo',
  'parsun',
  'peugeot',
  'piaggio',
  'polestar',
  'prestige',
  'princess',
  'purewatercraft',
  'quicksilver',
  'ranieri',
  'rayelectric',
  'rayelectricoutboards',
  'raymarine',
  'razor',
  'regen',
  'renault',
  'rinker',
  'sacs',
  'salona',
  'salpa',
  'sargo',
  'saxdor',
  'scott',
  'seadoo',
  'sealine',
  'searay',
  'segway',
  'selva',
  'sessamarine',
  'simrad',
  'sirena',
  'skoda',
  'subaru',
  'sunseeker',
  'supersoco',
  'surron',
  'suzuki',
  'swift',
  'sym',
  'tank',
  'temo',
  'tesla',
  'thrustme',
  'tohatsu',
  'torqeedo',
  'toyota',
  'trabant',
  'trek',
  'triumph',
  'unagi',
  'vanmoof',
  'vespa',
  'vicem',
  'victronenergy',
  'volkswagen',
  'volvo',
  'volvopenta',
  'vw',
  'weimin',
  'williams',
  'xyachts',
  'yamaha',
  'zarformenti',
  'zero',
  'zodiac'
]);

/**
 * Returns true if the brand has a monochrome or flat modern logo that should adapt
 * to light/dark mode (dark in light mode, white in dark mode).
 * @param {string} brandName
 * @returns {boolean}
 */
export function isBrandMonochrome(brandName) {
  if (!brandName || typeof brandName !== 'string') return false;
  const key = cleanKey(brandName);
  const alias = ALIASES[key] || key;
  return MONOCHROME_ADAPTIVE.has(alias) || MONOCHROME_ADAPTIVE.has(key) || MONOCHROME_ADAPTIVE.has(brandName.trim().toLowerCase());
}


