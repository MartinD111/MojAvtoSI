const fs = require('fs');
const path = require('path');

const dir = 'public/images/brand-logos';

const logos = {
  'ds.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <path d="M50 8L78 50L50 92L22 50Z" fill="none" stroke="currentColor" stroke-width="6"/>
  <path d="M50 20L70 50L50 80L30 50Z" fill="none" stroke="currentColor" stroke-width="4"/>
  <path d="M38 38L50 50L62 38M38 62L50 50L62 62" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
</svg>`,

  'xiaomi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="30" fill="#ff6900"/>
  <path d="M28 28h11v23c0 4.4 3.6 8 8 8s8-3.6 8-8V28h11v23c0 10.5-8.5 19-19 19s-19-8.5-19-19V28zm33 22h11v22H61V50z" fill="#fff"/>
</svg>`,

  'ssangyong.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#002b66">
  <circle cx="50" cy="50" r="46" fill="none" stroke="#002b66" stroke-width="7"/>
  <path d="M28 58c0-14 10-24 22-24s22 10 22 24c0-8-10-15-22-15s-22 7-22 15z"/>
  <path d="M36 65c4-16 14-22 24-22s20 6 24 22c-8-10-16-13-24-13s-16 3-24 13z"/>
</svg>`,

  'bollinger.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="15" y="15" width="70" height="70" rx="10" fill="#111"/>
  <path d="M32 28h22c7 0 12 4 12 10 0 4-3 8-7 9 5 1 9 5 9 11 0 7-6 12-14 12H32V28zm12 18h9c2.5 0 4.5-1.5 4.5-4s-2-4-4.5-4H44v8zm0 16h10c3 0 5.5-1.5 5.5-4.5s-2.5-4.5-5.5-4.5H44v9z" fill="#fff"/>
</svg>`,

  'bsa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#c00"/>
  <circle cx="50" cy="50" r="40" fill="#fff"/>
  <path d="M50 18v64M32 30l36 40M68 30L32 70" stroke="#c00" stroke-width="6" stroke-linecap="round"/>
  <text x="50" y="58" font-family="sans-serif" font-weight="900" font-size="28" fill="#111" text-anchor="middle">BSA</text>
</svg>`,

  'motoguzzi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
  <path d="M60 25c-8-12-25-18-50-12 16 8 28 18 36 26-10 0-22-3-38-10 12 12 26 19 40 20-8 2-18 2-30-2 14 8 28 9 42 7-1 4-2 9-2 14h4c0-5-1-10-2-14 14 2 28 1 42-7-12 4-22 4-30 2 14-1 28-8 40-20-16 7-28 10-38 10 8-8 20-18 36-26-25-6-42 0-50 12z" fill="#c00"/>
  <text x="60" y="68" font-family="sans-serif" font-weight="800" font-size="11" fill="#111" text-anchor="middle" letter-spacing="1">MOTO GUZZI</text>
</svg>`,

  'royalenfield.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#111"/>
  <circle cx="50" cy="50" r="42" fill="#c99700"/>
  <circle cx="50" cy="50" r="38" fill="#111"/>
  <path d="M50 20l5 10h11l-9 7 3 11-10-7-10 7 3-11-9-7h11z" fill="#c99700"/>
  <text x="50" y="66" font-family="sans-serif" font-weight="900" font-size="11" fill="#fff" text-anchor="middle" letter-spacing="1">ROYAL</text>
  <text x="50" y="78" font-family="sans-serif" font-weight="900" font-size="10" fill="#fff" text-anchor="middle" letter-spacing="1">ENFIELD</text>
</svg>`,

  'indian.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
  <path d="M15 35q12-25 45-20t45 20q-25-10-45-10t-45 10z" fill="#900"/>
  <text x="60" y="42" font-family="serif" font-weight="bold" font-style="italic" font-size="22" fill="#900" text-anchor="middle">Indian</text>
</svg>`,

  'benelli.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#005a36"/>
  <circle cx="50" cy="50" r="42" fill="#fff"/>
  <circle cx="50" cy="50" r="38" fill="#005a36"/>
  <path d="M35 32l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6zM50 26l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6zM65 32l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="#ffc72c"/>
  <text x="50" y="68" font-family="sans-serif" font-weight="900" font-size="13" fill="#fff" text-anchor="middle" letter-spacing="1">Benelli</text>
</svg>`,

  'gasgas.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#e00"/>
  <text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="34" fill="#fff" text-anchor="middle" font-style="italic">GG</text>
</svg>`,

  'puch.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#006633"/>
  <circle cx="50" cy="50" r="40" fill="#fff"/>
  <path d="M50 14A36 36 0 0 1 86 50H50V14zM14 50a36 36 0 0 1 36-36v36H14z" fill="#006633"/>
  <circle cx="50" cy="50" r="22" fill="#fff"/>
  <text x="50" y="56" font-family="sans-serif" font-weight="900" font-size="13" fill="#006633" text-anchor="middle">PUCH</text>
</svg>`,

  'trabant.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#003366"/>
  <circle cx="50" cy="50" r="40" fill="#fff"/>
  <path d="M36 32h28c4 0 7 3 7 7s-3 7-7 7H40c-4 0-7 3-7 7s3 7 7 7h24" fill="none" stroke="#003366" stroke-width="9" stroke-linecap="round"/>
</svg>`,

  'schmitz.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
  <path d="M25 45c-5-10 0-22 10-25 10-3 20 4 25 12 3-5 10-8 16-5 6 3 9 10 7 18H25z" fill="#003b80"/>
  <circle cx="35" cy="30" r="3" fill="#fff"/>
  <text x="60" y="64" font-family="sans-serif" font-weight="900" font-size="11" fill="#003b80" text-anchor="middle" letter-spacing="1">SCHMITZ</text>
</svg>`,

  'kogel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#e2001a"/>
  <path d="M35 25v50M65 25L35 50l30 25" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  'polaris.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#002d62"/>
  <path d="M50 15L58 42L85 50L58 58L50 85L42 58L15 50L42 42Z" fill="#fff"/>
  <path d="M50 25L55 45L75 50L55 55L50 75L45 55L25 50L45 45Z" fill="#002d62"/>
</svg>`,

  'segway.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#e4002b">
  <circle cx="50" cy="50" r="46" fill="#111"/>
  <path d="M48 22a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm-14 26h28l-8 30h-12z" fill="#fff"/>
</svg>`,

  'niu.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#df001f"/>
  <path d="M28 50a22 22 0 1 1 44 0 22 22 0 0 1-44 0z" fill="none" stroke="#fff" stroke-width="8"/>
  <path d="M50 24v20" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
</svg>`,

  'zero.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#c30"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="#fff" stroke-width="8"/>
  <path d="M30 70L70 30" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
</svg>`,

  'mvagusta.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#003366"/>
  <path d="M25 35h50L50 75z" fill="#c00"/>
  <text x="50" y="52" font-family="sans-serif" font-weight="900" font-size="18" fill="#fff" text-anchor="middle">MV</text>
</svg>`,

  'bimota.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#fff" stroke="#c00" stroke-width="6"/>
  <text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="36" fill="#c00" text-anchor="middle">b</text>
</svg>`,

  'derbi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#d00"/>
  <circle cx="50" cy="36" r="14" fill="#fff"/>
  <circle cx="36" cy="58" r="14" fill="#fff"/>
  <circle cx="64" cy="58" r="14" fill="#fff"/>
  <circle cx="50" cy="50" r="7" fill="#d00"/>
</svg>`,

  'fantic.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
  <rect width="120" height="60" rx="12" fill="#c00"/>
  <text x="60" y="38" font-family="sans-serif" font-weight="900" font-style="italic" font-size="20" fill="#fff" text-anchor="middle">FANTIC</text>
</svg>`,

  'malaguti.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#c00"/>
  <path d="M28 65V35l22 22 22-22v30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  'supersoco.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#111"/>
  <path d="M35 32c8-8 22-8 30 0s8 22 0 30L35 32z" fill="#00d284"/>
  <path d="M65 68c-8 8-22 8-30 0s-8-22 0-30l30 30z" fill="#fff"/>
</svg>`,

  'surron.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#111"/>
  <path d="M50 20L30 45h15L35 80 70 50H55z" fill="#ff4d00"/>
</svg>`,

  'gwm.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#c00"/>
  <path d="M30 65V40l20-15 20 15v25H58V50H42v15z" fill="#fff"/>
</svg>`,

  'baic.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#c00"/>
  <ellipse cx="40" cy="50" rx="14" ry="24" fill="none" stroke="#fff" stroke-width="6"/>
  <ellipse cx="60" cy="50" rx="14" ry="24" fill="none" stroke="#fff" stroke-width="6"/>
</svg>`,

  'accars.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#003366"/>
  <circle cx="50" cy="50" r="40" fill="#fff"/>
  <text x="50" y="62" font-family="sans-serif" font-weight="900" font-size="34" fill="#003366" text-anchor="middle">AC</text>
</svg>`,

  'yangwang.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#0b0f19"/>
  <path d="M50 15L40 45h20L50 85" stroke="#facc15" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,

  'avatr.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#111"/>
  <path d="M50 20L75 75H25z" fill="none" stroke="#fff" stroke-width="6"/>
  <path d="M50 35L65 70H35z" fill="#3b82f6"/>
</svg>`
};

for (const [filename, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(dir, filename), content.trim());
}
console.log('Saved ' + Object.keys(logos).length + ' SVG brand logos into ' + dir);
