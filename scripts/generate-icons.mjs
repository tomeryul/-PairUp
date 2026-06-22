// Generates PWA PNG icons with no external dependencies.
// Draws a romantic gradient tile with a white heart.
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public');
mkdirSync(outDir, { recursive: true });

const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const c1 = hex('#ef9080');
const c2 = hex('#d9705e');
const heartRGB = hex('#f6f2e9');

// Heart test: is point (x,y) in [-1.4,1.4] inside a heart curve?
const insideHeart = (x, y) => {
  const v = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
  return v <= 0;
};

function render(size) {
  const data = Buffer.alloc(size * size * 4);
  const r = size * 0.22; // corner radius
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const t = (px + py) / (2 * size);
      let R = lerp(c1[0], c2[0], t);
      let G = lerp(c1[1], c2[1], t);
      let B = lerp(c1[2], c2[2], t);

      // rounded-corner alpha
      let a = 255;
      const cx = Math.min(px, size - px);
      const cy = Math.min(py, size - py);
      if (cx < r && cy < r) {
        const dx = r - cx;
        const dy = r - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > r) a = 0;
        else if (d > r - 1.5) a = Math.round(255 * (r - d) / 1.5);
      }

      // heart in center
      const hx = (px / size - 0.5) * 2.9;
      const hy = -(py / size - 0.46) * 2.9;
      if (insideHeart(hx, hy)) {
        R = heartRGB[0]; G = heartRGB[1]; B = heartRGB[2];
      }

      const i = (py * size + px) * 4;
      data[i] = R;
      data[i + 1] = G;
      data[i + 2] = B;
      data[i + 3] = a;
    }
  }
  return data;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function toPng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  writeFileSync(path.join(outDir, `pwa-${size}.png`), toPng(size, render(size)));
}
writeFileSync(path.join(outDir, 'apple-touch-icon.png'), toPng(180, render(180)));
console.log('icons generated in', outDir);
