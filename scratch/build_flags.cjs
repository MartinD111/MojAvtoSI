const fs = require('fs');
const path = require('path');

const flags = {
  // 1. Slovenia (SI) - with clear Triglav, waves and 3 gold Celje stars coat of arms
  si: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="14" fill="#ffffff"/>
  <rect y="14" width="64" height="14" fill="#0055b8"/>
  <rect y="28" width="64" height="14" fill="#ee1c25"/>
  <!-- Slovenian Coat of Arms (Grb Republike Slovenije) -->
  <g transform="translate(10, 3.5)">
    <!-- Blue shield with distinct red border -->
    <path d="M 0,0 L 18,0 L 18,12 C 18,19 9,23.5 9,23.5 C 9,23.5 0,19 0,12 Z" fill="#0055b8" stroke="#ee1c25" stroke-width="2"/>
    <!-- Triglav white mountain peaks -->
    <path d="M 2.5,16.5 L 5.5,12 L 7.5,14 L 9,9.5 L 10.5,14 L 12.5,12 L 15.5,16.5 Z" fill="#ffffff"/>
    <!-- Two blue undulating waves beneath -->
    <path d="M 3.8,18.5 Q 6.4,17.2 9,18.5 T 14.2,18.5" fill="none" stroke="#0055b8" stroke-width="1.3"/>
    <path d="M 3.8,20.7 Q 6.4,19.4 9,20.7 T 14.2,20.7" fill="none" stroke="#0055b8" stroke-width="1.3"/>
    <!-- 3 Golden 6-pointed stars of Celje (Zvezde grofov Celjskih) -->
    <!-- Top left star -->
    <polygon points="5.5,1.5 6.2,3.3 8,3.3 6.6,4.4 7.1,6.1 5.5,5 3.9,6.1 4.4,4.4 3,3.3 4.8,3.3" fill="#facc15"/>
    <!-- Top right star -->
    <polygon points="12.5,1.5 13.2,3.3 15,3.3 13.6,4.4 14.1,6.1 12.5,5 10.9,6.1 11.4,4.4 10,3.3 11.8,3.3" fill="#facc15"/>
    <!-- Bottom center star -->
    <polygon points="9,5 9.7,6.8 11.5,6.8 10.1,7.9 10.6,9.6 9,8.5 7.4,9.6 7.9,7.9 6.5,6.8 8.3,6.8" fill="#facc15"/>
  </g>
</svg>`,

  // 2. Croatia (HR) - with clear 5x5 checkerboard and regional crowns
  hr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="14" fill="#ff0000"/>
  <rect y="14" width="64" height="14" fill="#ffffff"/>
  <rect y="28" width="64" height="14" fill="#003893"/>
  <!-- Croatian Coat of Arms (Šahovnica s krono) -->
  <g transform="translate(22.5, 5)">
    <!-- Crown with 5 regional shields -->
    <g transform="translate(0, 0)">
      <!-- 1. Illyria (yellow star on blue) -->
      <path d="M 0.5,5.5 L 3.8,5.5 L 3.8,8 C 3.8,9.8 2.1,10.8 2.1,10.8 C 2.1,10.8 0.5,9.8 0.5,8 Z" fill="#003893" stroke="#facc15" stroke-width="0.5"/>
      <circle cx="2.1" cy="7.2" r="0.9" fill="#facc15"/>
      <!-- 2. Dubrovnik (red bars on blue) -->
      <path d="M 4.3,3.8 L 7.6,3.8 L 7.6,7.2 C 7.6,9 6,10 6,10 C 6,10 4.3,9 4.3,7.2 Z" fill="#003893" stroke="#ff0000" stroke-width="0.5"/>
      <line x1="4.3" y1="5.2" x2="7.6" y2="5.2" stroke="#ff0000" stroke-width="0.9"/>
      <line x1="4.3" y1="7" x2="7.6" y2="7" stroke="#ff0000" stroke-width="0.9"/>
      <!-- 3. Dalmatia (3 leopards on blue) -->
      <path d="M 8.1,2.5 L 11.4,2.5 L 11.4,6.8 C 11.4,8.5 9.7,9.5 9.7,9.5 C 9.7,9.5 8.1,8.5 8.1,6.8 Z" fill="#003893" stroke="#facc15" stroke-width="0.5"/>
      <circle cx="9.7" cy="4.5" r="0.8" fill="#facc15"/>
      <circle cx="9" cy="6.6" r="0.6" fill="#facc15"/>
      <circle cx="10.4" cy="6.6" r="0.6" fill="#facc15"/>
      <!-- 4. Istria (golden goat on blue) -->
      <path d="M 11.9,3.8 L 15.2,3.8 L 15.2,7.2 C 15.2,9 13.5,10 13.5,10 C 13.5,10 11.9,9 11.9,7.2 Z" fill="#003893" stroke="#facc15" stroke-width="0.5"/>
      <polygon points="13.5,4.8 14.5,6.6 12.5,6.6" fill="#facc15"/>
      <!-- 5. Slavonia (marten on blue/red) -->
      <path d="M 15.7,5.5 L 19,5.5 L 19,8 C 19,9.8 17.3,10.8 17.3,10.8 C 17.3,10.8 15.7,9.8 15.7,8 Z" fill="#003893" stroke="#ff0000" stroke-width="0.5"/>
      <rect x="15.7" y="6.8" width="3.3" height="1.5" fill="#ff0000"/>
    </g>
    <!-- Main Checkerboard Shield (5x5, starts with red) -->
    <g transform="translate(0.5, 9.5)">
      <clipPath id="hr-shield-clip">
        <path d="M 0,0 L 18,0 L 18,14.5 C 18,22 9,26 9,26 C 9,26 0,22 0,14.5 Z"/>
      </clipPath>
      <g clip-path="url(#hr-shield-clip)">
        <rect width="18" height="27" fill="#ffffff"/>
        <!-- 5x5 grid: width 18 (each 3.6), height 19 (each 3.8) -->
        <!-- Row 0: R W R W R -->
        <rect x="0" y="0" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="7.2" y="0" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="14.4" y="0" width="3.6" height="3.8" fill="#ff0000"/>
        <!-- Row 1: W R W R W -->
        <rect x="3.6" y="3.8" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="10.8" y="3.8" width="3.6" height="3.8" fill="#ff0000"/>
        <!-- Row 2: R W R W R -->
        <rect x="0" y="7.6" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="7.2" y="7.6" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="14.4" y="7.6" width="3.6" height="3.8" fill="#ff0000"/>
        <!-- Row 3: W R W R W -->
        <rect x="3.6" y="11.4" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="10.8" y="11.4" width="3.6" height="3.8" fill="#ff0000"/>
        <!-- Row 4: R W R W R -->
        <rect x="0" y="15.2" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="7.2" y="15.2" width="3.6" height="3.8" fill="#ff0000"/>
        <rect x="14.4" y="15.2" width="3.6" height="3.8" fill="#ff0000"/>
      </g>
      <!-- Shield outline -->
      <path d="M 0,0 L 18,0 L 18,14.5 C 18,22 9,26 9,26 C 9,26 0,22 0,14.5 Z" fill="none" stroke="#003893" stroke-width="1.3"/>
    </g>
  </g>
</svg>`,

  // 3. Serbia (RS) - with clear double-headed eagle and crown
  rs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="14" fill="#c6363c"/>
  <rect y="14" width="64" height="14" fill="#0c4076"/>
  <rect y="28" width="64" height="14" fill="#ffffff"/>
  <!-- Serbian Coat of Arms (Beli dvoglavi orao s krunom) -->
  <g transform="translate(12, 4.5)">
    <!-- Royal Crown -->
    <path d="M 4,4.5 L 16,4.5 L 17,1.5 L 13,3 L 10,0.5 L 7,3 L 3,1.5 Z" fill="#facc15" stroke="#b45309" stroke-width="0.5"/>
    <circle cx="10" cy="0.5" r="0.8" fill="#ffffff"/>
    <!-- Red Shield -->
    <path d="M 1.5,4.5 L 18.5,4.5 L 18.5,18 C 18.5,25.5 10,29.5 10,29.5 C 10,29.5 1.5,25.5 1.5,18 Z" fill="#c6363c" stroke="#facc15" stroke-width="1.3"/>
    <!-- White Double-Headed Eagle -->
    <g fill="#ffffff">
      <!-- Left head & neck -->
      <path d="M 6.5,8 C 4.5,7 4.5,9.5 6.5,11 L 8.5,11.5 L 8.5,8 Z"/>
      <!-- Right head & neck -->
      <path d="M 13.5,8 C 15.5,7 15.5,9.5 13.5,11 L 11.5,11.5 L 11.5,8 Z"/>
      <!-- Wings spread wide -->
      <path d="M 2.5,11.5 C 2.5,17 6,19 7,20 L 7.5,12.5 Z"/>
      <path d="M 17.5,11.5 C 17.5,17 14,19 13,20 L 12.5,12.5 Z"/>
      <!-- Tail feathers -->
      <path d="M 8.5,22 L 10,25.5 L 11.5,22 Z"/>
    </g>
    <!-- Golden beaks -->
    <polygon points="4.5,8 3.2,8.8 4.8,9.2" fill="#facc15"/>
    <polygon points="15.5,8 16.8,8.8 15.2,9.2" fill="#facc15"/>
    <!-- Heart Shield: Serbian Cross with 4 firesteels (ocila) -->
    <rect x="7.6" y="12.5" width="4.8" height="6.2" rx="0.8" fill="#c6363c" stroke="#ffffff" stroke-width="0.7"/>
    <line x1="10" y1="12.8" x2="10" y2="18.3" stroke="#ffffff" stroke-width="0.9"/>
    <line x1="7.9" y1="15.5" x2="12.1" y2="15.5" stroke="#ffffff" stroke-width="0.9"/>
    <circle cx="8.9" cy="14" r="0.45" fill="#ffffff"/>
    <circle cx="11.1" cy="14" r="0.45" fill="#ffffff"/>
    <circle cx="8.9" cy="17" r="0.45" fill="#ffffff"/>
    <circle cx="11.1" cy="17" r="0.45" fill="#ffffff"/>
  </g>
</svg>`,

  // 4. Bosnia and Herzegovina (BA) - yellow triangle + white stars + shield
  ba: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="42" fill="#002366"/>
  <!-- Yellow Country Triangle -->
  <polygon points="16,0 58,0 58,42" fill="#fecb00"/>
  <!-- Diagonal Stars -->
  <g fill="#ffffff">
    <polygon points="18,1 18.8,2.8 20.6,2.8 19.2,3.8 19.7,5.5 18.3,4.5 16.9,5.5 17.4,3.8 16,2.8 17.8,2.8"/>
    <polygon points="22.5,6.5 23.3,8.3 25.1,8.3 23.7,9.3 24.2,11 22.8,10 21.4,11 21.9,9.3 20.5,8.3 22.3,8.3"/>
    <polygon points="27,12 27.8,13.8 29.6,13.8 28.2,14.8 28.7,16.5 27.3,15.5 25.9,16.5 26.4,14.8 25,13.8 26.8,13.8"/>
    <polygon points="31.5,17.5 32.3,19.3 34.1,19.3 32.7,20.3 33.2,22 31.8,21 30.4,22 30.9,20.3 29.5,19.3 31.3,19.3"/>
    <polygon points="36,23 36.8,24.8 38.6,24.8 37.2,25.8 37.7,27.5 36.3,26.5 34.9,27.5 35.4,25.8 34,24.8 35.8,24.8"/>
    <polygon points="40.5,28.5 41.3,30.3 43.1,30.3 41.7,31.3 42.2,33 40.8,32 39.4,33 39.9,31.3 38.5,30.3 40.3,30.3"/>
    <polygon points="45,34 45.8,35.8 47.6,35.8 46.2,36.8 46.7,38.5 45.3,37.5 43.9,38.5 44.4,36.8 43,35.8 44.8,35.8"/>
  </g>
  <!-- Prominent Coat of Arms Shield (Grb Bosne in Hercegovine) -->
  <g transform="translate(42, 6)">
    <path d="M 0,0 L 16,0 L 16,13 C 16,19.5 8,24 8,24 C 8,24 0,19.5 0,13 Z" fill="#002366" stroke="#fecb00" stroke-width="1.5"/>
    <polygon points="3,1 15,1 15,13" fill="#fecb00"/>
    <circle cx="7" cy="4.5" r="0.8" fill="#ffffff"/>
    <circle cx="9.5" cy="8" r="0.8" fill="#ffffff"/>
    <circle cx="12" cy="11.5" r="0.8" fill="#ffffff"/>
  </g>
</svg>`,

  // 5. Italy (IT) - Green-White-Red + clearly visible Stella d'Italia emblem
  it: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="21.3" height="42" fill="#008c45"/>
  <rect x="21.3" width="21.4" height="42" fill="#ffffff"/>
  <rect x="42.7" width="21.3" height="42" fill="#cd212a"/>
  <!-- Italian National Emblem (Emblema della Repubblica Italiana) -->
  <g transform="translate(32, 21)">
    <!-- Cogwheel -->
    <circle cx="0" cy="0" r="8.5" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="2.2 1.4"/>
    <circle cx="0" cy="0" r="5" fill="none" stroke="#64748b" stroke-width="1"/>
    <!-- Olive (peace) & Oak (strength) branches -->
    <path d="M -9,6 C -11,0 -9,-8 -1,-10" fill="none" stroke="#15803d" stroke-width="1.4"/>
    <path d="M 9,6 C 11,0 9,-8 1,-10" fill="none" stroke="#15803d" stroke-width="1.4"/>
    <!-- Red ribbon at base -->
    <path d="M -7,8 Q 0,10.5 7,8" fill="none" stroke="#cd212a" stroke-width="1.8"/>
    <!-- White 5-pointed star with red border (Stella d'Italia) -->
    <polygon points="0,-8 2.4,-2.5 8.2,-2.5 3.5,1.2 5.4,7 0,3.2 -5.4,7 -3.5,1.2 -8.2,-2.5 -2.4,-2.5" fill="#ffffff" stroke="#cd212a" stroke-width="0.8"/>
  </g>
</svg>`,

  // 6. Austria (AT) - Red-White-Red + official Austrian Federal Eagle (Bundesadler)
  at: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="14" fill="#c8102e"/>
  <rect y="14" width="64" height="14" fill="#ffffff"/>
  <rect y="28" width="64" height="14" fill="#c8102e"/>
  <!-- Austrian Federal Eagle Coat of Arms (Avstrijski zvezni orel) -->
  <g transform="translate(32, 21)">
    <!-- Black Eagle -->
    <path d="M -12,-8 C -14,-3 -12,4 -9,7.5 L -5,3.5 L -5,-5 Z" fill="#0f172a"/>
    <path d="M 12,-8 C 14,-3 12,4 9,7.5 L 5,3.5 L 5,-5 Z" fill="#0f172a"/>
    <path d="M 0,-9 C -2.5,-9 -3.5,-7 -2.5,-4.5 L -4.5,-1 L 4.5,-1 L 2.5,-4.5 C 3.5,-7 2.5,-9 0,-9 Z" fill="#0f172a"/>
    <!-- Golden Mural Crown -->
    <polygon points="-3,-9 3,-9 2.5,-11.5 1,-10.5 0,-11.5 -1,-10.5 -2.5,-11.5" fill="#facc15"/>
    <!-- Gold beak -->
    <polygon points="-2.5,-6.5 -5,-6 -2.8,-5.2" fill="#facc15"/>
    <!-- Tail -->
    <path d="M -3.5,7 L 0,12 L 3.5,7 Z" fill="#0f172a"/>
    <!-- Claws with sickle & hammer -->
    <rect x="-10" y="4" width="5.5" height="1.2" transform="rotate(-30 -7.5 4)" fill="#facc15"/>
    <rect x="-11" y="2" width="2.2" height="3.5" fill="#facc15"/>
    <path d="M 7,3 A 4 4 0 0 1 11,7.5" fill="none" stroke="#facc15" stroke-width="1.3"/>
    <!-- Broken chain on legs -->
    <path d="M -4.5,9 Q 0,11.5 4.5,9" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="1.2 1.2"/>
    <!-- Austrian Red-White-Red Chest Shield (Bindenschild) -->
    <rect x="-4" y="-1.5" width="8" height="8.5" rx="0.5" fill="#ffffff" stroke="#0f172a" stroke-width="0.6"/>
    <rect x="-4" y="-1.5" width="8" height="2.8" fill="#c8102e"/>
    <rect x="-4" y="4.2" width="8" height="2.8" fill="#c8102e"/>
  </g>
</svg>`,

  // 7. Hungary (HU) - Red-White-Green + Saint Stephen's Crown and Coat of Arms
  hu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="14" fill="#ce2939"/>
  <rect y="14" width="64" height="14" fill="#ffffff"/>
  <rect y="28" width="64" height="14" fill="#477050"/>
  <!-- Hungarian Coat of Arms (Magyar címer s krono sv. Štefana) -->
  <g transform="translate(23, 6.5)">
    <!-- Crown of Saint Stephen -->
    <g transform="translate(9, 1)">
      <path d="M -5.5,3.5 Q 0,0 5.5,3.5 L 4.5,5.5 L -4.5,5.5 Z" fill="#facc15" stroke="#b45309" stroke-width="0.5"/>
      <!-- Tilted Apostolic Cross -->
      <line x1="0" y1="0.5" x2="1" y2="-3" stroke="#facc15" stroke-width="0.9"/>
      <line x1="-1" y1="-1.5" x2="2" y2="-1" stroke="#facc15" stroke-width="0.9"/>
      <circle cx="-5.5" cy="5.5" r="0.7" fill="#facc15"/>
      <circle cx="5.5" cy="5.5" r="0.7" fill="#facc15"/>
    </g>
    <!-- Split Shield -->
    <g transform="translate(0.5, 6.5)">
      <clipPath id="hu-shield-clip">
        <path d="M 0,0 L 17,0 L 17,14 C 17,20.5 8.5,24.5 8.5,24.5 C 8.5,24.5 0,20.5 0,14 Z"/>
      </clipPath>
      <g clip-path="url(#hu-shield-clip)">
        <!-- Left: 4 red, 4 silver stripes -->
        <rect x="0" y="0" width="8.5" height="25" fill="#ffffff"/>
        <rect x="0" y="0" width="8.5" height="3.1" fill="#ce2939"/>
        <rect x="0" y="6.2" width="8.5" height="3.1" fill="#ce2939"/>
        <rect x="0" y="12.4" width="8.5" height="3.1" fill="#ce2939"/>
        <rect x="0" y="18.6" width="8.5" height="3.1" fill="#ce2939"/>
        <!-- Right: Red field with 3 green hills, crown and silver double cross -->
        <rect x="8.5" y="0" width="8.5" height="25" fill="#ce2939"/>
        <circle cx="10" cy="21.5" r="3.2" fill="#477050"/>
        <circle cx="15.5" cy="21.5" r="3.2" fill="#477050"/>
        <circle cx="12.8" cy="19.5" r="3.5" fill="#477050"/>
        <!-- Gold crown -->
        <polygon points="11,17.2 14.5,17.2 14.2,16 12.8,16.6 11.4,16" fill="#facc15"/>
        <!-- Silver double cross -->
        <line x1="12.8" y1="7.5" x2="12.8" y2="16" stroke="#ffffff" stroke-width="1.3"/>
        <line x1="11" y1="9.5" x2="14.5" y2="9.5" stroke="#ffffff" stroke-width="1.1"/>
        <line x1="10.2" y1="12.2" x2="15.3" y2="12.2" stroke="#ffffff" stroke-width="1.3"/>
      </g>
      <!-- Shield border -->
      <path d="M 0,0 L 17,0 L 17,14 C 17,20.5 8.5,24.5 8.5,24.5 C 8.5,24.5 0,20.5 0,14 Z" fill="none" stroke="#facc15" stroke-width="1.3"/>
      <line x1="8.5" y1="0" x2="8.5" y2="24.5" stroke="#facc15" stroke-width="0.8"/>
    </g>
  </g>
</svg>`,

  // 8. Slovakia (SK) - White-Blue-Red + Patriarchal double cross on 3 blue hills
  sk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="14" fill="#ffffff"/>
  <rect y="14" width="64" height="14" fill="#0b4ea2"/>
  <rect y="28" width="64" height="14" fill="#ee1c25"/>
  <!-- Slovak Coat of Arms (Slovaški grb - dvojni križ na treh hribih) -->
  <g transform="translate(10.5, 5.5)">
    <!-- Red Gothic Shield with white border -->
    <path d="M 0,0 L 17,0 L 17,14 C 17,21 8.5,25 8.5,25 C 8.5,25 0,21 0,14 Z" fill="#ee1c25" stroke="#ffffff" stroke-width="1.8"/>
    <!-- Three dark blue mountain peaks (Tatra, Matra, Fatra) -->
    <g fill="#0b4ea2">
      <circle cx="4.5" cy="19.5" r="4.2"/>
      <circle cx="12.5" cy="19.5" r="4.2"/>
      <circle cx="8.5" cy="17" r="4.6"/>
    </g>
    <!-- White Patriarchal Double-Cross -->
    <g stroke="#ffffff" stroke-linecap="square">
      <!-- Main vertical post -->
      <line x1="8.5" y1="3.5" x2="8.5" y2="18" stroke-width="2"/>
      <!-- Upper horizontal bar -->
      <line x1="5.8" y1="7" x2="11.2" y2="7" stroke-width="1.8"/>
      <!-- Lower horizontal bar -->
      <line x1="4.2" y1="11" x2="12.8" y2="11" stroke-width="2"/>
    </g>
  </g>
</svg>`,

  // 9. Czech Republic (CZ) - White/Red with blue wedge + Bohemian Lion coat of arms
  cz: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="21" fill="#ffffff"/>
  <rect y="21" width="64" height="21" fill="#d7141a"/>
  <!-- Blue Wedge -->
  <polygon points="0,0 32,21 0,42" fill="#11457e"/>
  <!-- Czech Bohemian Double-Tailed Silver Lion Shield -->
  <g transform="translate(36, 8.5)">
    <!-- Red Shield with golden border -->
    <path d="M 0,0 L 17,0 L 17,15 C 17,21.5 8.5,25.5 8.5,25.5 C 8.5,25.5 0,21.5 0,15 Z" fill="#d7141a" stroke="#facc15" stroke-width="1.3"/>
    <!-- Silver Bohemian Lion (Češki dvorepi lev) -->
    <g fill="#ffffff">
      <!-- Body & chest -->
      <path d="M 6.5,10.5 C 6.5,7.5 9,5.5 10.5,6.5 C 12,5.5 14,8.5 12,12.5 C 11,15.5 9.5,18.5 7.5,17.5 Z"/>
      <!-- Head with open jaw -->
      <circle cx="10.5" cy="7" r="2.4"/>
      <polygon points="11.5,6 13.8,6.8 12,8"/>
      <!-- Double Tail -->
      <path d="M 6.5,15.5 C 3.5,14.5 2.5,10.5 4.5,8.5 C 5,10.5 6,11.5 6.5,12.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>
      <path d="M 6.5,16.5 C 2.5,17.5 1.5,12.5 3.5,10.5 C 4.3,12.5 5.5,14.5 6.5,15.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>
      <!-- Claws -->
      <line x1="9.5" y1="10.5" x2="13.8" y2="9" stroke="#ffffff" stroke-width="1.3"/>
      <line x1="8.5" y1="14.5" x2="13.8" y2="15.5" stroke="#ffffff" stroke-width="1.3"/>
      <line x1="6.5" y1="17.5" x2="8.5" y2="19.5" stroke="#ffffff" stroke-width="1.3"/>
    </g>
    <!-- Golden Crown -->
    <polygon points="9,4.2 12.2,4.2 12.8,2.5 11.2,3.3 10.6,2 10,3.3 8.4,2.5" fill="#facc15"/>
  </g>
</svg>`,

  // 10. Poland (PL) - White/Red + Crowned White Eagle Coat of Arms
  pl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="21" fill="#ffffff"/>
  <rect y="21" width="64" height="21" fill="#dc143c"/>
  <!-- Polish White Eagle Coat of Arms (Orzeł Biały na rdečem ščitu) -->
  <g transform="translate(22.5, 2)">
    <!-- Red Shield with golden border -->
    <path d="M 0,0 L 19,0 L 19,13 C 19,18.5 9.5,21.5 9.5,21.5 C 9.5,21.5 0,18.5 0,13 Z" fill="#dc143c" stroke="#facc15" stroke-width="0.9"/>
    <!-- Crowned White Eagle -->
    <g fill="#ffffff">
      <circle cx="9.5" cy="5.5" r="2"/>
      <!-- Wings spread wide -->
      <path d="M 2,7.5 C 3,4.5 7.5,4.5 9,7.5 L 7.5,13 C 5.5,12 3,10 2,7.5 Z"/>
      <path d="M 17,7.5 C 16,4.5 11.5,4.5 10,7.5 L 11.5,13 C 13.5,12 16,10 17,7.5 Z"/>
      <!-- Body & breast -->
      <path d="M 8,7.5 L 11,7.5 L 11,14 L 8,14 Z"/>
      <!-- Tail -->
      <path d="M 8,14 L 9.5,18 L 11,14 Z"/>
      <!-- Golden claws -->
      <line x1="7" y1="14" x2="5.5" y2="16.5" stroke="#facc15" stroke-width="1.1"/>
      <line x1="12" y1="14" x2="13.5" y2="16.5" stroke="#facc15" stroke-width="1.1"/>
    </g>
    <!-- Golden beak -->
    <polygon points="7.6,5.5 6,6.3 7.8,6.8" fill="#facc15"/>
    <!-- Golden Crown -->
    <polygon points="8.2,3.8 10.8,3.8 11.4,2 10,2.6 9.5,1.4 9,2.6 7.6,2" fill="#facc15"/>
  </g>
</svg>`,

  // 11. Spain (ES) - Red-Yellow-Red + Spanish Royal Coat of Arms & Pillars
  es: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 42" width="64" height="42">
  <rect width="64" height="10.5" fill="#aa151b"/>
  <rect y="10.5" width="64" height="21" fill="#f1bf00"/>
  <rect y="31.5" width="64" height="10.5" fill="#aa151b"/>
  <!-- Spanish Coat of Arms (Kraljevi grb Španije) -->
  <g transform="translate(12, 10.5)">
    <!-- Royal Crown on top -->
    <g transform="translate(9, 2)">
      <path d="M -5.5,3.5 Q 0,0 5.5,3.5 L 4.5,5.5 L -4.5,5.5 Z" fill="#aa151b" stroke="#f1bf00" stroke-width="0.6"/>
      <circle cx="0" cy="0.2" r="0.8" fill="#f1bf00"/>
      <path d="M -4.5,3.5 Q 0,-1.2 4.5,3.5" fill="none" stroke="#f1bf00" stroke-width="0.9"/>
    </g>
    <!-- Pillars of Hercules (Stebra z napisom) -->
    <!-- Left pillar -->
    <rect x="0.5" y="7.5" width="1.8" height="11" rx="0.5" fill="#ffffff" stroke="#94a3b8" stroke-width="0.5"/>
    <polygon points="0,7.5 2.8,7.5 1.4,5.8" fill="#f1bf00"/>
    <path d="M 0,12 Q 1.4,11 2.8,12" fill="none" stroke="#aa151b" stroke-width="0.9"/>
    <!-- Right pillar -->
    <rect x="15.5" y="7.5" width="1.8" height="11" rx="0.5" fill="#ffffff" stroke="#94a3b8" stroke-width="0.5"/>
    <polygon points="15,7.5 17.8,7.5 16.4,5.8" fill="#f1bf00"/>
    <path d="M 15,12 Q 16.4,11 17.8,12" fill="none" stroke="#aa151b" stroke-width="0.9"/>
    <!-- Quartered Shield (Kastilija, Leon, Aragon, Navara) -->
    <g transform="translate(4, 7)">
      <clipPath id="es-shield-clip">
        <path d="M 0,0 L 10,0 L 10,9 C 10,13.5 5,15.5 5,15.5 C 5,15.5 0,13.5 0,9 Z"/>
      </clipPath>
      <g clip-path="url(#es-shield-clip)">
        <!-- Q1: Castile -->
        <rect x="0" y="0" width="5" height="5" fill="#aa151b"/>
        <rect x="1.6" y="1.6" width="2" height="2.4" fill="#f1bf00"/>
        <!-- Q2: Leon -->
        <rect x="5" y="0" width="5" height="5" fill="#ffffff"/>
        <circle cx="7.5" cy="2.5" r="1.3" fill="#c026d3"/>
        <!-- Q3: Aragon -->
        <rect x="0" y="5" width="5" height="10.5" fill="#f1bf00"/>
        <line x1="1.2" y1="5" x2="1.2" y2="15.5" stroke="#aa151b" stroke-width="0.7"/>
        <line x1="2.5" y1="5" x2="2.5" y2="15.5" stroke="#aa151b" stroke-width="0.7"/>
        <line x1="3.8" y1="5" x2="3.8" y2="15.5" stroke="#aa151b" stroke-width="0.7"/>
        <!-- Q4: Navarre -->
        <rect x="5" y="5" width="5" height="10.5" fill="#aa151b"/>
        <rect x="6" y="6" width="3" height="3" fill="none" stroke="#f1bf00" stroke-width="0.7"/>
        <line x1="6" y1="6" x2="9" y2="9" stroke="#f1bf00" stroke-width="0.6"/>
        <line x1="9" y1="6" x2="6" y2="9" stroke="#f1bf00" stroke-width="0.6"/>
      </g>
      <path d="M 0,0 L 10,0 L 10,9 C 10,13.5 5,15.5 5,15.5 C 5,15.5 0,13.5 0,9 Z" fill="none" stroke="#f1bf00" stroke-width="0.9"/>
    </g>
  </g>
</svg>`
};

const outputDir = path.resolve(__dirname, '../public/images/flags');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const [code, svg] of Object.entries(flags)) {
  const filePath = path.join(outputDir, `${code}.svg`);
  fs.writeFileSync(filePath, svg.trim());
  console.log(`Saved ${code}.svg (${svg.length} bytes)`);
}
console.log('All 11 country flags generated successfully!');
