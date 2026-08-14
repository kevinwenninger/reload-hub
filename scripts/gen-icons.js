/**
 * Generates placeholder app icons (target/reticle on the app's dark palette)
 * without external dependencies. Rerun after design changes:
 *   node scripts/gen-icons.js
 */
const { deflateSync } = require('node:zlib');
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

// Keep in sync with src/lib/colors.ts.
const BG = [0x0f, 0x11, 0x15, 255];
const ORANGE = [0xb4, 0x53, 0x09, 255];
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([len, typeAndData, crc]);
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Renders the reticle: three target rings + four crosshair ticks.
 * All radii are fractions of `scale` (the reticle's outer radius in px).
 */
function render(size, { background, ink, scale }) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const rings = [
    [0.82, 0.95], // outer ring
    [0.52, 0.65], // middle ring
    [0.0, 0.3], // bullseye
  ];
  const tickInner = 0.7;
  const tickOuter = 1.18;
  const tickHalfWidth = 0.055;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 2x2 supersampling for smooth edges
      let coverage = 0;
      for (const [ox, oy] of [
        [0.25, 0.25],
        [0.75, 0.25],
        [0.25, 0.75],
        [0.75, 0.75],
      ]) {
        const dx = x + ox - cx;
        const dy = y + oy - cy;
        const r = Math.sqrt(dx * dx + dy * dy) / scale;
        let hit = rings.some(([inner, outer]) => r >= inner && r <= outer);
        if (!hit) {
          const onVertical =
            Math.abs(dx) / scale <= tickHalfWidth &&
            Math.abs(dy) / scale >= tickInner &&
            Math.abs(dy) / scale <= tickOuter;
          const onHorizontal =
            Math.abs(dy) / scale <= tickHalfWidth &&
            Math.abs(dx) / scale >= tickInner &&
            Math.abs(dx) / scale <= tickOuter;
          hit = onVertical || onHorizontal;
        }
        if (hit) coverage++;
      }
      const alpha = coverage / 4;
      const offset = (y * size + x) * 4;
      for (let c = 0; c < 4; c++) {
        pixels[offset + c] = Math.round(
          background[c] * (1 - alpha) + ink[c] * alpha,
        );
      }
    }
  }
  return pixels;
}

function write(name, size, options) {
  const file = join(__dirname, '..', 'assets', 'images', name);
  writeFileSync(file, encodePng(size, render(size, options)));
  console.log(`wrote ${name} (${size}x${size})`);
}

// iOS app icon: opaque background, reticle at 62% so ticks stay inside.
write('icon.png', 1024, { background: BG, ink: ORANGE, scale: 320 });
// Splash icon: transparent background (page background comes from app.json).
write('splash-icon.png', 512, { background: TRANSPARENT, ink: ORANGE, scale: 180 });
// Android adaptive icon: foreground within the safe zone (~66% of canvas).
write('android-icon-foreground.png', 1024, {
  background: TRANSPARENT,
  ink: ORANGE,
  scale: 220,
});
write('android-icon-background.png', 1024, {
  background: BG,
  ink: BG,
  scale: 0.0001,
});
write('android-icon-monochrome.png', 1024, {
  background: TRANSPARENT,
  ink: WHITE,
  scale: 220,
});
write('favicon.png', 48, { background: TRANSPARENT, ink: ORANGE, scale: 17 });
