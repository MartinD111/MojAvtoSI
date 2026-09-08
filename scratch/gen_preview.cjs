const fs = require('fs');
const nakedSvg = fs.readFileSync('C:/Users/marti/Downloads/PNG and SVG icons/SVG/14. Naked Bike.svg', 'utf8');
const advSvg = fs.readFileSync('C:/Users/marti/Downloads/PNG and SVG icons/SVG/13. Adventure.svg', 'utf8');

const html = '<!DOCTYPE html><html><head><style>' +
'body { background: #f1f5f9; font-family: sans-serif; padding: 20px; }' +
'.card { width: 140px; height: 120px; background: rgba(255, 255, 255, 0.6); border: 1px solid #e5e7eb; border-radius: 20px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; margin: 10px; cursor: pointer; transition: all 0.2s; }' +
'.card:hover { background: white; border-color: #d1d5db; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }' +
'.custom-v-icon { width: 76px; height: 76px; --icon-base: #475569; --icon-accent: #2563eb; --bg-glass: #ffffff; }' +
'.broken-hover:hover .custom-v-icon { --icon-base: #ffffff; --icon-accent: rgba(255, 255, 255, 0.7); --bg-glass: #2563eb; }' +
'.fixed-hover:hover .custom-v-icon { transform: scale(1.06); --icon-base: #0f172a; --icon-accent: #1d4ed8; --bg-glass: #ffffff; }' +
'svg { width: 76px; height: 76px; }' +
'</style></head><body>' +
'<h3>1. Adventure (Current Sprite) - Broken Hover:</h3>' +
'<div class=" card broken-hover\><svg class=\custom-v-icon\><use href=\../public/icons/vehicles-custom.svg#vc-adventure\></use></svg><span>Adventure (Broken Hover)</span></div>' +
'<h3>2. Adventure (Current Sprite) - Fixed Hover:</h3>' +
'<div class=\card fixed-hover\><svg class=\custom-v-icon\><use href=\../public/icons/vehicles-custom.svg#vc-adventure\></use></svg><span>Adventure (Fixed Hover)</span></div>' +
'<h3>3. Naked Bike (Current in Sprite - Broken!):</h3>' +
'<div class=\card broken-hover\><svg class=\custom-v-icon\><use href=\../public/icons/vehicles-custom.svg#vc-naked-bike\></use></svg><span>Current Naked</span></div>' +
'<h3>4. Naked Bike (From Downloads 14. Naked Bike.svg):</h3>' +
'<div class=\card fixed-hover\>' + nakedSvg + '<span>Real Naked Bike</span></div>' +
'</body></html>';

fs.writeFileSync('scratch/test_preview.html', html, 'utf8');
console.log('Preview generated at scratch/test_preview.html');
