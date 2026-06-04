const fs = require('fs');
const path = require('path');

const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n`;
const svgFooter = `</svg>\n`;

function generateVehicle(id, bodyPath, wheels) {
    let out = `  <symbol id="${id}" viewBox="0 0 64 64">\n`;
    out += `    <path fill="var(--icon-base, #475569)" d="${bodyPath}" stroke-linejoin="round" />\n`;
    for(const w of wheels) {
        out += `    <circle fill="var(--icon-accent, #2563eb)" cx="${w.x}" cy="${w.y}" r="${w.r}" />\n`;
        out += `    <circle fill="var(--bg-glass, #ffffff)" cx="${w.x}" cy="${w.y}" r="${w.r * 0.4}" />\n`;
    }
    out += `  </symbol>\n`;
    return out;
}

let svgs = svgHeader;

svgs += generateVehicle('v-sedan', 'M 8 32 L 18 20 L 42 20 L 52 32 L 60 32 L 60 46 L 4 46 L 4 32 Z', [{x:16, y:46, r:8}, {x:48, y:46, r:8}]);
svgs += generateVehicle('v-hatchback', 'M 8 32 L 20 18 L 54 18 L 54 46 L 4 46 L 4 32 Z', [{x:16, y:46, r:8}, {x:44, y:46, r:8}]);
svgs += generateVehicle('v-estate', 'M 6 32 L 18 18 L 58 18 L 58 46 L 4 46 L 4 32 Z', [{x:16, y:46, r:8}, {x:46, y:46, r:8}]);
svgs += generateVehicle('v-suv', 'M 4 28 L 14 14 L 56 14 L 56 44 L 4 44 Z', [{x:16, y:44, r:10}, {x:46, y:44, r:10}]);
svgs += generateVehicle('v-van', 'M 4 24 L 20 14 L 56 14 L 56 46 L 4 46 Z', [{x:16, y:46, r:9}, {x:46, y:46, r:9}]);
svgs += generateVehicle('v-cabrio', 'M 10 32 L 24 32 L 40 32 L 52 32 L 60 32 L 60 46 L 4 46 L 4 32 Z', [{x:16, y:46, r:8}, {x:48, y:46, r:8}]);
svgs += generateVehicle('v-coupe', 'M 8 34 L 26 22 L 40 22 L 54 34 L 60 34 L 60 46 L 4 46 L 4 34 Z', [{x:16, y:46, r:8}, {x:48, y:46, r:8}]);
svgs += generateVehicle('v-sports', 'M 6 36 L 28 26 L 40 26 L 56 36 L 62 36 L 62 46 L 2 46 L 2 36 Z', [{x:16, y:46, r:8}, {x:48, y:46, r:8}]);
svgs += generateVehicle('v-pickup', 'M 4 30 L 16 20 L 32 20 L 32 30 L 58 30 L 58 46 L 4 46 Z', [{x:16, y:46, r:9}, {x:46, y:46, r:9}]);
svgs += generateVehicle('v-damaged', 'M 8 32 L 18 20 L 42 20 L 52 32 L 60 32 L 60 46 L 4 46 L 4 32 Z M 20 20 L 30 30 L 40 20 Z', [{x:16, y:46, r:8}, {x:48, y:46, r:8}]);

svgs += generateVehicle('v-moto-generic', 'M 20 40 L 26 24 L 38 24 L 44 40 L 32 40 Z M 32 24 L 46 12', [{x:16, y:46, r:12}, {x:48, y:46, r:12}]);
svgs += generateVehicle('v-scooter', 'M 24 40 L 24 24 L 32 24 L 32 40 Z M 24 24 L 38 12', [{x:16, y:46, r:10}, {x:48, y:46, r:10}]);
svgs += generateVehicle('v-atv', 'M 10 32 L 20 20 L 44 20 L 54 32 L 60 32 L 60 46 L 4 46 Z', [{x:14, y:46, r:11}, {x:50, y:46, r:11}]);

svgs += generateVehicle('v-camper', 'M 4 16 L 56 16 L 60 28 L 60 48 L 4 48 Z M 12 16 L 24 8 L 36 8 L 48 16', [{x:16, y:48, r:8}, {x:48, y:48, r:8}]);
svgs += generateVehicle('v-caravan', 'M 12 20 L 52 20 L 60 32 L 60 46 L 12 46 Z M 4 40 L 12 40', [{x:36, y:46, r:9}]);
svgs += generateVehicle('v-tent-trailer', 'M 12 36 L 52 36 L 52 46 L 12 46 Z M 32 16 L 12 36 L 52 36 Z', [{x:32, y:46, r:7}]);

svgs += generateVehicle('v-com-van', 'M 4 16 L 44 16 L 58 30 L 58 48 L 4 48 Z', [{x:16, y:48, r:9}, {x:46, y:48, r:9}]);
svgs += generateVehicle('v-truck', 'M 4 12 L 40 12 L 40 46 L 4 46 Z M 42 24 L 56 24 L 56 46 L 42 46 Z', [{x:14, y:46, r:10}, {x:30, y:46, r:10}, {x:48, y:46, r:10}]);
svgs += generateVehicle('v-trailer', 'M 4 20 L 60 20 L 60 46 L 4 46 Z', [{x:16, y:46, r:10}, {x:32, y:46, r:10}, {x:48, y:46, r:10}]);
svgs += generateVehicle('v-bus', 'M 4 12 L 60 12 L 60 46 L 4 46 Z', [{x:16, y:46, r:9}, {x:48, y:46, r:9}]);
svgs += generateVehicle('v-excavator', 'M 10 30 L 30 30 L 30 46 L 10 46 Z M 20 30 L 40 16 L 56 36', [{x:20, y:46, r:12}]);
svgs += generateVehicle('v-tractor', 'M 8 20 L 32 20 L 32 40 L 56 40 L 56 48 L 8 48 Z', [{x:20, y:40, r:16}, {x:48, y:46, r:8}]);
svgs += generateVehicle('v-forestry', 'M 4 20 L 24 20 L 24 46 L 4 46 Z M 26 30 L 56 30 L 56 46 L 26 46 Z M 40 10 L 40 30', [{x:14, y:46, r:12}, {x:40, y:46, r:12}]);
svgs += generateVehicle('v-garbage', 'M 4 16 L 40 16 L 40 46 L 4 46 Z M 42 24 L 56 24 L 56 46 L 42 46 Z M 40 16 L 50 10', [{x:16, y:46, r:10}, {x:48, y:46, r:10}]);
svgs += generateVehicle('v-forklift', 'M 12 24 L 36 24 L 36 46 L 12 46 Z M 40 12 L 40 46 M 40 40 L 60 40', [{x:18, y:46, r:8}, {x:32, y:46, r:8}]);
svgs += generateVehicle('v-ambulance', 'M 4 16 L 44 16 L 58 30 L 58 48 L 4 48 Z M 20 24 L 28 24 M 24 20 L 24 28', [{x:16, y:48, r:9}, {x:46, y:48, r:9}]);
svgs += generateVehicle('v-plane', 'M 8 32 L 56 32 L 62 24 L 8 24 Z M 32 24 L 32 10 Z', [{x:20, y:36, r:4}, {x:44, y:36, r:4}]);
svgs += generateVehicle('v-crusher', 'M 8 20 L 56 20 L 56 46 L 8 46 Z M 8 20 L 20 4 M 56 20 L 44 4', [{x:16, y:46, r:10}, {x:48, y:46, r:10}]);
svgs += generateVehicle('v-snowplow', 'M 20 16 L 40 16 L 40 46 L 20 46 Z M 42 24 L 56 24 L 56 46 L 42 46 Z M 16 36 L 4 46', [{x:26, y:46, r:10}, {x:48, y:46, r:10}]);

svgs += svgFooter;

fs.writeFileSync(path.join(__dirname, 'public/icons/vehicles.svg'), svgs, 'utf8');
console.log("Wrote vehicles.svg successfully");
