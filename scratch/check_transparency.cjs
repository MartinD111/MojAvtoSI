const fs = require('fs');
const path = require('path');

const dir = 'public/images/brand-logos';
const files = fs.readdirSync(dir);

const results = {
  isJpeg: [],
  noAlphaPng: [],
  validPngWithAlpha: [],
  svgs: []
};

for (const f of files) {
  const full = path.join(dir, f);
  if (f.endsWith('.svg')) {
    results.svgs.push(f);
    continue;
  }
  const buf = fs.readFileSync(full);
  // Check header
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    results.isJpeg.push(f);
  } else if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    // PNG IHDR is at offset 12 (length 4 bytes, 'IHDR', then width (4), height (4), bit depth (1), color type (1))
    // Offset 12: chunk data length (usually 13)
    // Offset 16: 'IHDR'
    // Offset 25: color type (0: grayscale, 2: RGB, 3: indexed/palette, 4: grayscale+alpha, 6: RGBA)
    const colorType = buf[25];
    if (colorType === 2) {
      // RGB without alpha channel! (opaque)
      results.noAlphaPng.push({ file: f, colorType });
    } else {
      results.validPngWithAlpha.push({ file: f, colorType });
    }
  }
}

console.log('JPEGs with .png extension:', results.isJpeg);
console.log('PNGs without alpha channel (completely opaque!):', results.noAlphaPng.map(x => x.file));
console.log('SVGs count:', results.svgs.length);
console.log('PNGs with alpha channel count:', results.validPngWithAlpha.length);
