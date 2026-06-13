const fs = require('fs');
const path = require('path');

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!/node_modules|dist|\.git/.test(p)) walk(p, acc);
    } else if (/\.(js|jsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

// SKIP these files: mock data, taxonomy datasets, pure-logic
const SKIP = [
  'src/data/sampleListings.js', 'src/data/sampleBoats.js', 'src/data/sampleAuctions.js',
  'src/data/sampleCatalog.js', 'src/data/businesses.js', 'src/data/businesses.navtika.js',
  'src/data/bookingData.js', 'src/data/partTypes.js', 'src/data/commercialTaxonomy.js',
  'src/data/equipmentTypes.js', 'src/data/equipment.js', 'src/data/searchRelevance.js',
  'src/data/serviceIcons.js', 'src/config/platform.js',
  'src/utils/listingUtils.js', 'src/utils/costCalculator.js', 'src/utils/customSelect.js',
  'src/examples/tcoUsageExample.js',
];

const SL_WORD = /\b(Domov|Oglasi|Iskanje|Prijava|Registracija|Objavi|Oglas|Cena|Znamka|Letnik|Gorivo|Menjalnik|Prodaja|Najem|Naprej|Nazaj|Preklic|Shrani|Poslji|Zapri|Odpri|Prikazi|Filtri|Sortiraj|Rezultat|Kontakt|Sporocilo|Podrobnosti|Lastnosti|Lokacija|Telefon)\b/;
const SL_CHAR = /[čšžČŠŽ]/;

// Lines that are clearly not UI text
function isExempt(line) {
  return /\bt\(|data-i18n|console\.(log|error|warn|debug)|^\s*import\s|^\s*from\s|\.json['"`]|\/\/|^\s*\*|===|!==|\.includes\(|\.toLowerCase\(\)\s*===|fuelStr|fuelKey|fuelType|normalized|=== 'elektrika'|=== 'električno'/.test(line);
}

const files = walk('src', []);
const results = {};
for (const f of files) {
  const rel = f.replace(/\\/g, '/');
  if (SKIP.includes(rel)) continue;
  const lines = fs.readFileSync(f, 'utf-8').split('\n');
  lines.forEach((ln, i) => {
    const trimmed = ln.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (isExempt(ln)) return;
    const segs = ln.match(/(["'`>])([^"'`<>]{2,}?)(["'`<])/g) || [];
    for (const s of segs) {
      const inner = s.slice(1, -1);
      // skip things that look like email/url/css
      if (/@|https?:|\.(si|com|png|jpg|svg)|px|rem|#[0-9a-f]{3,6}/i.test(inner)) continue;
      if (SL_CHAR.test(inner) || SL_WORD.test(inner)) {
        (results[rel] = results[rel] || []).push((i + 1) + '| ' + trimmed.slice(0, 130));
        break;
      }
    }
  });
}

let total = 0;
const sorted = Object.entries(results).sort((a,b)=>b[1].length-a[1].length);
for (const [f, hits] of sorted) {
  console.log('\n### ' + f + ' (' + hits.length + ')');
  total += hits.length;
}
console.log('\n=== files:', Object.keys(results).length, 'total lines:', total);

// dump full detail to a file
let detail = '';
for (const [f, hits] of sorted) {
  detail += '\n### ' + f + ' (' + hits.length + ')\n';
  hits.forEach(h => detail += '  ' + h + '\n');
}
fs.writeFileSync('scratch/sl_hits.txt', detail);
