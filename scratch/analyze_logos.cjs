const fs = require('fs');
const path = require('path');

const logoFiles = fs.readdirSync('public/images/brand-logos');
console.log('Logo files in public/images/brand-logos:', logoFiles.length);

const globalData = JSON.parse(fs.readFileSync('public/json/brands_models_global.json', 'utf8'));
const carBrands = Object.keys(globalData);
console.log('Total car brands in brands_models_global.json:', carBrands.length);

// Also check moto & gospodarska
const motoData = JSON.parse(fs.readFileSync('public/json/brands_models_moto.json', 'utf8'));
const motoBrands = Object.keys(motoData);
const gospData = JSON.parse(fs.readFileSync('public/json/brands_models_gospodarska.json', 'utf8'));
const gospBrands = Object.keys(gospData);

// Load existing brandLogosMap
const mapFile = fs.readFileSync('src/data/brandLogosMap.js', 'utf8');
const brandLogos = {};
const regex = /"([^"]+)":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(mapFile)) !== null) {
  brandLogos[match[1]] = match[2];
}
console.log('Current entries in brandLogosMap.js:', Object.keys(brandLogos).length);

// See which brand names from carBrands don't have a logo in brandLogos
const missingInMap = carBrands.filter(b => !brandLogos[b]);
console.log('Car brands without entry in brandLogosMap.js:', missingInMap.length);

// Can any missing brands be matched against existing logo files?
function cleanKey(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

const fileMapByClean = new Map();
logoFiles.forEach(f => {
  const base = path.parse(f).name;
  fileMapByClean.set(cleanKey(base), f);
});

const canAutoMatch = [];
const stillMissing = [];

missingInMap.forEach(b => {
  const c = cleanKey(b);
  if (fileMapByClean.has(c)) {
    canAutoMatch.push({ brand: b, file: fileMapByClean.get(c) });
  } else {
    stillMissing.push(b);
  }
});

console.log('Could be matched directly from existing logo files:', canAutoMatch.length);
console.log('Top 30 still missing:', stillMissing.slice(0, 30));
