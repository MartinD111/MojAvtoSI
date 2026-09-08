const fs = require('fs');
const path = require('path');

const dir = 'public/images/brand-logos';

const modernLogos = {
  // New 2021+ Renault nested geometric lines diamond logo
  'renault.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" fill="currentColor">
  <path d="M50 0L92 65L50 130L8 65Z" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round"/>
  <path d="M50 24L74 65L50 106L26 65Z" fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round"/>
</svg>`,

  // New 2021+ Peugeot lion head in shield logo
  'peugeot.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="currentColor">
  <path d="M12 10h76l-8 72-30 30-30-30z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>
  <text x="50" y="24" font-family="sans-serif" font-weight="900" font-size="10" fill="currentColor" text-anchor="middle" letter-spacing="2">PEUGEOT</text>
  <!-- Stylized lion head profile -->
  <path d="M42 34c8-3 18-2 24 4 4 4 6 10 7 16-2 1-5 2-8 1 2 4 1 9-2 13-4 5-11 7-17 5 3-3 4-8 3-12-3 2-6 2-9 0-3-2-5-6-4-10 1-3 4-5 7-6-3-2-4-6-3-9 1-1 2-2 2-2z" fill="currentColor"/>
  <path d="M68 62c4 4 6 10 5 16-3 0-6-1-8-3 1 5-1 10-5 13-5 4-13 5-19 2 4-3 5-8 4-13-4 1-8 0-11-3-3-3-4-8-2-12 2-4 6-6 10-6-3-3-3-8-1-12 5 2 9 6 12 11 5 1 10 3 15 6z" fill="currentColor"/>
  <path d="M30 68c6 8 16 13 26 13 4 0 8-1 12-3-4 6-11 10-18 11-8 1-16-2-20-8z" fill="currentColor"/>
</svg>`,

  // New 2021+ modern Kia connected typography
  'kia.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 60" fill="currentColor">
  <!-- KIA continuous modern strokes -->
  <path d="M15 12h18v16l22-16h18L49 32l26 16H55L33 32v16H15zm62 0h18v36H77zm24 36L122 12h16l21 36h-18l-5-10h-12l-5 10zm17-21h7l-4-9z" fill="currentColor"/>
</svg>`,

  // New 2021+ Dacia Link geometric interlocking DC logo
  'dacia.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80" fill="currentColor">
  <!-- Left D bracket -->
  <path d="M10 18h38l22 22-22 22H10l20-22z" fill="currentColor"/>
  <!-- Right C bracket -->
  <path d="M150 18h-38L90 40l22 22h38l-20-22z" fill="currentColor"/>
  <!-- Central cross connection -->
  <path d="M66 32h28v16H66z" fill="currentColor"/>
</svg>`,

  // Modern flat 2D Volkswagen logo
  'volkswagen.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="5"/>
  <path d="M22 26l21 44h4l9-22 9 22h4l21-44h-8L66 61l-9-21h-8l-9 21-16-35z" fill="currentColor"/>
  <path d="M41 53l9 21 9-21h6l-12 25h-6L35 53z" fill="currentColor"/>
</svg>`,

  // Modern flat 2D Audi rings
  'audi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" fill="currentColor">
  <circle cx="32" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="5"/>
  <circle cx="64" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="5"/>
  <circle cx="96" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="5"/>
  <circle cx="128" cy="30" r="22" fill="none" stroke="currentColor" stroke-width="5"/>
</svg>`,

  // Modern flat 2022+ Citroen retro oval chevron
  'citroen.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110" fill="currentColor">
  <ellipse cx="40" cy="55" rx="35" ry="50" fill="none" stroke="currentColor" stroke-width="7"/>
  <path d="M24 45L40 28L56 45" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 72L40 55L56 72" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,

  // Modern flat 2023+ Skoda modern winged arrow
  'skoda.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="7"/>
  <circle cx="66" cy="35" r="5" fill="currentColor"/>
  <path d="M24 48c12-3 26 1 34 8 2-10 1-20-4-28 14 6 22 18 24 32-8 3-18 2-26-3 6 8 8 18 5 27-8-7-14-17-15-28-6 1-12-1-18-8z" fill="currentColor"/>
</svg>`,

  // Modern flat 2020+ Nissan open illuminated ring
  'nissan.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="currentColor">
  <path d="M22 42A46 46 0 0 1 98 42M22 58a46 46 0 0 0 76 0" fill="none" stroke="currentColor" stroke-width="6"/>
  <text x="60" y="55" font-family="sans-serif" font-weight="900" font-size="16" fill="currentColor" text-anchor="middle" letter-spacing="4">NISSAN</text>
</svg>`,

  // Modern flat Opel blitz
  'opel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="6"/>
  <path d="M12 45h48l-22 18h48l-6 8H18l22-18H12z" fill="currentColor"/>
</svg>`
};

for (const [filename, content] of Object.entries(modernLogos)) {
  fs.writeFileSync(path.join(dir, filename), content.trim());
}

console.log('Successfully wrote ' + Object.keys(modernLogos).length + ' modern brand SVGs.');
