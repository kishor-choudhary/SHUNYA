#!/usr/bin/env node
/**
 * Generates the SHUNYA app icons (PNG) without any image dependencies.
 *
 *   node scripts/generate-icons.mjs
 *
 * Draws the SHUNYA app icon: a bone-white "S" letterform on the panel-black
 * canvas of the default Triptych theme. The brand is
 * type-only, so the icon is a letterform taken from the
 * wordmark rather than a separate emblem — and
 * writes it at the sizes iOS, Android and the web manifest expect. Run this
 * again if the brand mark changes; the output is committed to the repository.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "public", "brand");

/* -------------------------------------------------------------------------- */
/*  Minimal PNG encoder (RGBA, 8-bit)                                          */
/* -------------------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // one filter byte (0 = None) per scanline
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* -------------------------------------------------------------------------- */
/*  Brand mark                                                                 */
/* -------------------------------------------------------------------------- */

const VOID = [0x0c, 0x0c, 0x0c];
const BONE = [0xf8, 0xf5, 0xee];

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** 1px-wide analytic edge for smooth anti-aliasing. */
const coverage = (distance, radius) => clamp01(radius - distance + 0.5);

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * The "S" centreline, as three cubic béziers in a 100×100 design box — the same
 * curve the SVG favicon uses, translated into the drawing space.
 */
const SEGMENTS = [
  { p0: [44.8, 15.4], c1: [-9, -9], c2: [-31.9, -2.8], p1: [-27.1, 5.2] },
  { p0: [17.7, 20.6], c1: [6.7, 11.2], c2: [21.9, 11.6], p1: [28.6, 22.8] },
  { p0: [46.3, 43.4], c1: [4.8, 8], c2: [-18.1, 14.2], p1: [-27.1, 5.2] },
];

function sCentreline(samples = 96) {
  const points = [];
  for (const seg of SEGMENTS) {
    const c1x = seg.p0[0] + seg.c1[0];
    const c1y = seg.p0[1] + seg.c1[1];
    const c2x = seg.p0[0] + seg.c2[0];
    const c2y = seg.p0[1] + seg.c2[1];
    const p1x = seg.p0[0] + seg.p1[0];
    const p1y = seg.p0[1] + seg.p1[1];
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const m = 1 - t;
      points.push([
        m * m * m * seg.p0[0] + 3 * m * m * t * c1x + 3 * m * t * t * c2x + t * t * t * p1x,
        m * m * m * seg.p0[1] + 3 * m * m * t * c1y + 3 * m * t * t * c2y + t * t * t * p1y,
      ]);
    }
  }
  return points;
}

/* The letterform is point-symmetric about its own centre, so no manual shift
   is needed — the fit below centres it in the canvas. */
const GLYPH_SHIFT = [0, 0];
const GLYPH_BOX = 100;
const GLYPH_STROKE = 6.6;

function renderIcon(size, { padding = 0.1 } = {}) {
  const px = Buffer.alloc(size * size * 4);

  // The glyph's own bounds decide the fit, so padding means the same thing at
  // every size and for both the round and the square-masked variants.
  const raw = sCentreline().map(([x, y]) => [x + GLYPH_SHIFT[0], y + GLYPH_SHIFT[1]]);
  const xs = raw.map(([x]) => x);
  const ys = raw.map(([, y]) => y);
  const minX = Math.min(...xs) - GLYPH_STROKE / 2;
  const maxX = Math.max(...xs) + GLYPH_STROKE / 2;
  const minY = Math.min(...ys) - GLYPH_STROKE / 2;
  const maxY = Math.max(...ys) + GLYPH_STROKE / 2;

  const available = size * (1 - padding * 2);
  const scale = available / Math.max(maxX - minX, maxY - minY);
  const originX = (size - (maxX - minX) * scale) / 2 - minX * scale;
  const originY = (size - (maxY - minY) * scale) / 2 - minY * scale;

  const curve = raw.map(([x, y]) => [originX + x * scale, originY + y * scale]);
  const halfStroke = (GLYPH_STROKE / 2) * scale + 0.5;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      // Background: the Triptych theme’s panel black.
      let colour = VOID.slice();

      // Distance to the letterform's centreline drives the coverage.
      let nearest = Infinity;
      for (const [cx, cy] of curve) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const d = dx * dx + dy * dy;
        if (d < nearest) nearest = d;
      }
      const alpha = clamp01(halfStroke - Math.sqrt(nearest) + 0.5);
      if (alpha > 0) colour = mix(colour, BONE, alpha);

      const index = (y * size + x) * 4;
      px[index] = colour[0];
      px[index + 1] = colour[1];
      px[index + 2] = colour[2];
      px[index + 3] = 255;
    }
  }

  return encodePng(size, size, px);
}

/* -------------------------------------------------------------------------- */

mkdirSync(OUT, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, padding: 0.12 },
  { file: "icon-512.png", size: 512, padding: 0.12 },
  // Icons that get masked need more breathing room.
  { file: "icon-maskable-512.png", size: 512, padding: 0.2 },
  { file: "apple-touch-icon.png", size: 180, padding: 0.14 },
];

for (const target of targets) {
  const png = renderIcon(target.size, { padding: target.padding });
  writeFileSync(join(OUT, target.file), png);
  console.log(
    `  ${target.file.padEnd(26)} ${target.size}×${target.size}  ${(png.length / 1024).toFixed(1)} KB`,
  );
}

console.log(`\nWrote ${targets.length} icons to public/brand/`);
