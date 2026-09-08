const fs = require('fs');

const globalData = JSON.parse(fs.readFileSync('public/json/brands_models_global.json', 'utf8'));
const motoData = JSON.parse(fs.readFileSync('public/json/brands_models_moto.json', 'utf8'));
const gospData = JSON.parse(fs.readFileSync('public/json/brands_models_gospodarska.json', 'utf8'));

const allBrands = new Set([
  ...Object.keys(globalData),
  ...Object.keys(motoData),
  ...Object.keys(gospData)
]);

console.log('Total unique brands across all 3 files:', allBrands.size);

const mapFile = fs.readFileSync('src/data/brandLogosMap.js', 'utf8');
const brandLogos = {};
const regex = /"([^"]+)":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(mapFile)) !== null) {
  brandLogos[match[1]] = match[2];
}

const missing = [];
for (const b of allBrands) {
  if (!brandLogos[b]) {
    missing.push(b);
  }
}
console.log('Brands without explicit logo mapping:', missing.length);
console.log(JSON.stringify(missing.sort(), null, 2));
