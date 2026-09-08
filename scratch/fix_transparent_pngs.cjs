const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const dir = 'public/images/brand-logos';
const targets = [
  'austin.png',
  'dkw.png',
  'franklin.png',
  'genesis.png',
  'hillman.png',
  'hispano-suiza.png',
  'hupmobile.png',
  'jawa.png',
  'kaiser.png',
  'lada.png',
  'morgan.png',
  'morris.png',
  'oldsmobile.png',
  'omoda.png',
  'pierce-arrow.png',
  'saturn.png',
  'zastava.png',
  'zenvo.png'
];

function isWhite(r, g, b, a) {
  // Near white background
  return a > 10 && r >= 230 && g >= 230 && b >= 230;
}

for (const filename of targets) {
  const file = path.join(dir, filename);
  if (!fs.existsSync(file)) continue;

  const buf = fs.readFileSync(file);
  const png = PNG.sync.read(buf);
  const w = png.width;
  const h = png.height;

  // BFS flood-fill from all 4 borders to remove outside white background
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed with all border pixels that are white
  for (let x = 0; x < w; x++) {
    // top row
    let idx = (0 * w + x) * 4;
    if (isWhite(png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3])) {
      queue.push(x, 0);
      visited[0 * w + x] = 1;
    }
    // bottom row
    idx = ((h - 1) * w + x) * 4;
    if (isWhite(png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3])) {
      queue.push(x, h - 1);
      visited[(h - 1) * w + x] = 1;
    }
  }

  for (let y = 0; y < h; y++) {
    // left column
    let idx = (y * w + 0) * 4;
    if (!visited[y * w + 0] && isWhite(png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3])) {
      queue.push(0, y);
      visited[y * w + 0] = 1;
    }
    // right column
    idx = (y * w + (w - 1)) * 4;
    if (!visited[y * w + (w - 1)] && isWhite(png.data[idx], png.data[idx + 1], png.data[idx + 2], png.data[idx + 3])) {
      queue.push(w - 1, y);
      visited[y * w + (w - 1)] = 1;
    }
  }

  let head = 0;
  let cleared = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const pIdx = (cy * w + cx) * 4;
    png.data[pIdx + 3] = 0; // set alpha to 0 (fully transparent)
    cleared++;

    // Neighbors: Up, Down, Left, Right
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nPos = ny * w + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (isWhite(png.data[nIdx], png.data[nIdx + 1], png.data[nIdx + 2], png.data[nIdx + 3])) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  const outBuf = PNG.sync.write(png);
  fs.writeFileSync(file, outBuf);
  console.log(`Processed ${filename}: cleared ${cleared} outer white pixels out of ${w * h}`);
}
