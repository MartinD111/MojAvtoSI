const fs = require('fs');

const sprite = fs.readFileSync('public/icons/vehicles-custom.svg', 'utf8');
const nakedSvgRaw = fs.readFileSync('C:/Users/marti/Downloads/PNG and SVG icons/SVG/14. Naked Bike.svg', 'utf8');

// Scoped new naked bike
let innerMatch = nakedSvgRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
let innerNaked = innerMatch ? innerMatch[1] : '';
innerNaked = innerNaked.replace(/class="cls-1"/g, 'class="cls-1-vc-naked-bike"');
innerNaked = innerNaked.replace(/class="cls-2"/g, 'class="cls-2-vc-naked-bike"');
innerNaked = innerNaked.replace(/<style[^>]*>[\s\S]*?<\/style>/, `<style>
  .cls-1-vc-naked-bike { fill: var(--icon-base, #343e47); }
  .cls-2-vc-naked-bike { fill: var(--icon-accent, #1a47b8); }
</style>`);
const scopedNewNaked = `<symbol id="vc-naked-bike-fixed" viewBox="0 0 512 512">${innerNaked}</symbol>`;

const advMatch = sprite.match(/<symbol id="vc-adventure"[\s\S]*?<\/symbol>/);
const nakedCurrentMatch = sprite.match(/<symbol id="vc-naked-bike"[\s\S]*?<\/symbol>/);
const sedanMatch = sprite.match(/<symbol id="vc-sedan"[\s\S]*?<\/symbol>/);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; }
h2 { color: #1e293b; margin-top: 30px; }
.grid { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
.card {
  width: 130px; height: 116px; background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e5e7eb; border-radius: 20px;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.custom-v-icon {
  width: 64px; height: 64px;
  fill: var(--icon-base, #475569);
  --icon-base: #475569;
  --icon-accent: #3b82f6;
  --bg-glass: #ffffff;
  transition: transform 0.2s ease;
}

/* BROKEN HOVER (What was happening) */
.broken-hover {
  background: white;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.broken-hover .custom-v-icon {
  --icon-base: #ffffff;
  --icon-accent: rgba(255, 255, 255, 0.7);
  --bg-glass: #3b82f6;
}

/* FIXED HOVER */
.fixed-hover {
  background: white;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}
.fixed-hover .custom-v-icon {
  transform: scale(1.06);
  --icon-base: #0f172a;
  --icon-accent: #2563eb;
  --bg-glass: #ffffff;
}

.label { font-size: 13px; font-weight: 500; color: #475569; }
</style>
</head>
<body>
<svg style="display:none;">
  <defs>
    ${advMatch ? advMatch[0] : ''}
    ${nakedCurrentMatch ? nakedCurrentMatch[0] : ''}
    ${scopedNewNaked}
    ${sedanMatch ? sedanMatch[0] : ''}
  </defs>
</svg>

<h2>1. Normal State (Unhovered)</h2>
<div class="grid">
  <div class="card">
    <svg class="custom-v-icon"><use href="#vc-adventure"></use></svg>
    <span class="label">Adventure</span>
  </div>
  <div class="card">
    <svg class="custom-v-icon"><use href="#vc-sedan"></use></svg>
    <span class="label">Sedan</span>
  </div>
  <div class="card">
    <svg class="custom-v-icon"><use href="#vc-naked-bike"></use></svg>
    <span class="label">Naked (Current Broken)</span>
  </div>
  <div class="card">
    <svg class="custom-v-icon"><use href="#vc-naked-bike-fixed"></use></svg>
    <span class="label">Naked (Proper SVG)</span>
  </div>
</div>

<h2>2. Current BROKEN Hover (Wheels disappear, inverted into white!)</h2>
<div class="grid">
  <div class="card broken-hover">
    <svg class="custom-v-icon"><use href="#vc-adventure"></use></svg>
    <span class="label">Adventure (Broken)</span>
  </div>
  <div class="card broken-hover">
    <svg class="custom-v-icon"><use href="#vc-sedan"></use></svg>
    <span class="label">Sedan (Broken)</span>
  </div>
  <div class="card broken-hover">
    <svg class="custom-v-icon"><use href="#vc-naked-bike"></use></svg>
    <span class="label">Naked (Current Broken)</span>
  </div>
</div>

<h2>3. FIXED Hover (Wheels stay crisp, slight scale, rich contrast)</h2>
<div class="grid">
  <div class="card fixed-hover">
    <svg class="custom-v-icon"><use href="#vc-adventure"></use></svg>
    <span class="label">Adventure (Fixed)</span>
  </div>
  <div class="card fixed-hover">
    <svg class="custom-v-icon"><use href="#vc-sedan"></use></svg>
    <span class="label">Sedan (Fixed)</span>
  </div>
  <div class="card fixed-hover">
    <svg class="custom-v-icon"><use href="#vc-naked-bike-fixed"></use></svg>
    <span class="label">Naked (Fixed)</span>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync('scratch/test_comparison.html', html, 'utf8');
console.log('Comparison HTML created');
