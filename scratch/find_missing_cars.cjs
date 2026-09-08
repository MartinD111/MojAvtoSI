const fs = require('fs');

const globalData = JSON.parse(fs.readFileSync('public/json/brands_models_global.json', 'utf8'));
const carBrands = Object.keys(globalData);
const mapFile = fs.readFileSync('src/data/brandLogosMap.js', 'utf8');
const brandLogos = {};
const lines = mapFile.split('\n');
lines.forEach(l => {
  const m = l.match(/"([^"]+)":\s*"([^"]+)"/);
  if (m) brandLogos[m[1]] = m[2];
});

const missing = carBrands.filter(b => !brandLogos[b]);
console.log('Missing car brands (' + missing.length + '):');
console.log(JSON.stringify(missing, null, 2));
