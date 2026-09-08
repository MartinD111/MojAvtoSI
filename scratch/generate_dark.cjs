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
const sedanMatch = sprite.match(/<symbol id="vc-sedan"[\s\S]*?<\/symbol>/);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; }
h2 { color: #f8fafc; margin-top: 30px; }
.grid { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
.card {
  width: 130px; height: 116px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.custom-v-icon {
  width: 64px; height: 64px;
  fill: var(--icon-base, #cbd5e1);
  --icon-base: #cbd5e1;
  --icon-accent: #60a5fa;
  --bg-glass: #1e293b;
  transition: transform 0.2s ease;
}

/* DARK MODE HOVER */
.card:hover {
  background: rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.5);
  transform: translateY(-2px);
}
.card:hover .custom-v-icon {
  transform: scale(1.06);
  fill: var(--icon-base, #ffffff);
  --icon-base: #ffffff;
  --icon-accent: #93c5fd;
}

/* DARK MODE ACTIVE */
.card.active {
  background: rgba(37, 99, 235, 0.25);
  border-color: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
  transform: scale(1.02);
}
.card.active .custom-v-icon {
  fill: var(--icon-base, #ffffff);
  --icon-base: #ffffff;
  --icon-accent: #93c5fd;
}
.card.active .label { color: #60a5fa; font-weight: 600; }

.label { font-size: 13px; font-weight: 500; color: #94a3b8; }
</style>
</head>
<body>
<svg style="display:none;">
  <defs>
    ${advMatch ? advMatch[0] : ''}
    ${scopedNewNaked}
    ${sedanMatch ? sedanMatch[0] : ''}
  </defs>
</svg>

<h2>Dark Mode: Normal</h2>
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
    <svg class="custom-v-icon"><use href="#vc-naked-bike-fixed"></use></svg>
    <span class="label">Naked Bike</span>
  </div>
</div>

<h2>Dark Mode: Hover & Active</h2>
<div class="grid">
  <div class="card" style="background: rgba(37, 99, 235, 0.2); border-color: rgba(37, 99, 235, 0.5); transform: translateY(-2px);">
    <svg class="custom-v-icon" style="fill: #fff; --icon-base: #fff; --icon-accent: #93c5fd; transform: scale(1.06);"><use href="#vc-adventure"></use></svg>
    <span class="label" style="color: #fff;">Adventure (Hover)</span>
  </div>
  <div class="card active">
    <svg class="custom-v-icon"><use href="#vc-sedan"></use></svg>
    <span class="label">Sedan (Active)</span>
  </div>
  <div class="card active">
    <svg class="custom-v-icon"><use href="#vc-naked-bike-fixed"></use></svg>
    <span class="label">Naked (Active)</span>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync('scratch/test_dark.html', html, 'utf8');
