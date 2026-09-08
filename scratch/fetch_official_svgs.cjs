const fs = require('fs');
const path = require('path');

const map = {
  'volkswagen': 'volkswagen.svg',
  'renault': 'renault.svg',
  'peugeot': 'peugeot.svg',
  'kia': 'kia.svg',
  'dacia': 'dacia.svg',
  'audi': 'audi.svg',
  'skoda': 'skoda.svg',
  'citroen': 'citroen.svg',
  'nissan': 'nissan.svg',
  'opel': 'opel.svg',
  'toyota': 'toyota.svg',
  'mercedes': 'mercedes-benz.svg',
  'bmw': 'bmw.svg',
  'honda': 'honda.svg',
  'hyundai': 'hyundai.svg',
  'ford': 'ford.svg',
  'mitsubishi': 'mitsubishi.svg',
  'mazda': 'mazda.svg',
  'suzuki': 'suzuki.svg',
  'subaru': 'subaru.svg',
  'volvo': 'volvo.svg',
  'tesla': 'tesla.svg'
};

async function run() {
  for (const [icon, target] of Object.entries(map)) {
    try {
      const res = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/${icon}.svg`);
      if (res.ok) {
        let svg = await res.text();
        // Set fill='currentColor' so it responds directly to CSS text color in light/dark mode
        if (svg.includes('role="img"')) {
          svg = svg.replace('<svg ', '<svg fill="currentColor" ');
        }
        fs.writeFileSync(path.join('public/images/brand-logos', target), svg);
        console.log(`Saved official authentic ${target} (${svg.length} bytes)`);
      } else {
        console.error(`HTTP ${res.status} for ${icon}`);
      }
    } catch (e) {
      console.error(`Error fetching ${icon}:`, e.message);
    }
  }
}

run();
