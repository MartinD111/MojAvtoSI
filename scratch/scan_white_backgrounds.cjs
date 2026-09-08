const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const dir = 'public/images/brand-logos';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

const whiteBgFiles = [];

for (const f of files) {
  const data = fs.readFileSync(path.join(dir, f));
  try {
    const png = PNG.sync.read(data);
    // Check top-left, top-right, bottom-left, bottom-right corners
    const w = png.width;
    const h = png.height;
    const corners = [
      0, // (0,0)
      (w - 1) * 4, // (w-1, 0)
      (h - 1) * w * 4, // (0, h-1)
      ((h - 1) * w + (w - 1)) * 4 // (w-1, h-1)
    ];

    let opaqueWhiteCorners = 0;
    for (const idx of corners) {
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      // If alpha is high and color is near white
      if (a > 200 && r > 240 && g > 240 && b > 240) {
        opaqueWhiteCorners++;
      }
    }

    // Also sample edges
    if (opaqueWhiteCorners >= 3) {
      whiteBgFiles.push({ file: f, width: w, height: h, opaqueWhiteCorners });
    }
  } catch (err) {
    console.error('Error reading', f, err.message);
  }
}

console.log('PNG files with opaque white corners (' + whiteBgFiles.length + '):');
whiteBgFiles.forEach(x => console.log('-', x.file));
