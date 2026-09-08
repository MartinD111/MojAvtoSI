const fs = require('fs');
const path = require('path');

const dir = 'public/images/brand-logos';

// Authentic Bollinger Motors emblem: Two notched geometric vertical pillars that form the iconic 'B' shape
const bollingerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 100" fill="currentColor">
  <!-- Left solid vertical bar -->
  <rect x="25" y="15" width="22" height="70" rx="3" fill="currentColor"/>
  <!-- Right upper bar with rounded right corners -->
  <path d="M57 15h32c12 0 22 8 22 20s-10 20-22 20H57V15zm22 26c4 0 8-3 8-6s-4-6-8-6H69v12h10z" fill="currentColor"/>
  <!-- Right lower bar with rounded right corners -->
  <path d="M57 45h35c12 0 23 9 23 20s-11 20-23 20H57V45zm25 26c4 0 9-3 9-6s-5-6-9-6H69v12h13z" fill="currentColor"/>
</svg>`;

// Authentic Bond Cars Ltd emblem (Classic British Bond Equipe / Minicar red badge with silver wings and BOND script)
const bondSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 80">
  <path d="M10 40c20-15 45-22 60-22s40 7 60 22c-20 8-45 12-60 12s-40-4-60-12z" fill="#002b66"/>
  <ellipse cx="70" cy="40" rx="42" ry="24" fill="#c00000" stroke="#ffd700" stroke-width="2.5"/>
  <path d="M30 40h80" stroke="#ffd700" stroke-width="1.5" stroke-dasharray="2 2"/>
  <text x="70" y="47" font-family="serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="3" font-style="italic">BOND</text>
</svg>`;

fs.writeFileSync(path.join(dir, 'bollinger.svg'), bollingerSvg.trim());
fs.writeFileSync(path.join(dir, 'bond.svg'), bondSvg.trim());

console.log('Saved authentic bollinger.svg and bond.svg');
