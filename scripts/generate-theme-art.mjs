#!/usr/bin/env node
/**
 * Generates the hero frames that belong to a theme.
 *
 * Dusk and Moon use photographs that already exist. Void needs the same empty
 * hall in black and white — there is no colour in that theme anywhere, so the
 * frame has to match. Triptych needs a frame in its own language: the
 * template's panel black, a single signal-violet shaft of light and three
 * architectural arches waiting on the back wall.
 *
 *   node scripts/generate-theme-art.mjs
 *
 * Only files under public/media are written; nothing else is touched.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MEDIA = path.join(process.cwd(), "public", "media");

/* -------------------------------------------------------------------------- */
/*  Deterministic dust                                                        */
/* -------------------------------------------------------------------------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fine dust caught in the beam — the template's frames are never empty. */
function dust(width, height, count, seed) {
  const rand = mulberry32(seed);
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const x = rand() * width;
    const y = rand() * height;
    const r = 0.6 + rand() * 1.9;
    const o = 0.08 + rand() * 0.4;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#d6d0dc" opacity="${o.toFixed(2)}"/>`;
  }
  return out;
}

/**
 * The Triptych frame: a dark gallery wall with three tall arch openings, the
 * centre one taller, and one violet beam falling through the far left of the
 * room. No type — the design draws its own.
 */
function triptychScene(width, height) {
  const rand = mulberry32(20261017);
  const horizon = height * 0.72;
  const archW = width * 0.19;
  const gap = width * 0.055;
  const centreW = width * 0.22;
  const total = archW * 2 + centreW + gap * 2;
  const start = (width - total) / 2;
  const base = height * 0.795;
  const sideH = height * 0.5;
  const centreH = height * 0.58;
  const arch = (x, w, h, tint, opacity) => {
    const r = w / 2;
    const top = base - h;
    return `<path d="M${x} ${base} L${x} ${top + r} A${r} ${r} 0 0 1 ${x + w} ${top + r} L${x + w} ${base} Z" fill="${tint}" opacity="${opacity}"/>
      <path d="M${x} ${base} L${x} ${top + r} A${r} ${r} 0 0 1 ${x + w} ${top + r} L${x + w} ${base}" fill="none" stroke="#f8f5ee" stroke-opacity="${opacity * 0.9}" stroke-width="1.6"/>`;
  };

  const columns = Array.from({ length: 7 }, (_, i) => {
    const x = (width / 6) * i;
    return `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#f8f5ee" stroke-opacity="0.035" stroke-width="1"/>`;
  }).join("");

  const beams = Array.from({ length: 3 }, (_, i) => {
    const x = width * (0.1 + i * 0.055);
    const w = width * (0.02 + rand() * 0.015);
    return `<polygon points="${x},0 ${x + w},0 ${x + w * 5},${horizon} ${x + w * 3.2},${horizon}" fill="url(#shaft)" opacity="${0.24 - i * 0.05}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#141414"/>
        <stop offset="46%" stop-color="#0e0e0e"/>
        <stop offset="100%" stop-color="#080808"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#171717"/>
        <stop offset="100%" stop-color="#050505"/>
      </linearGradient>
      <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e04bff" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#af00f1" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="bloom" cx="50%" cy="30%" r="62%">
        <stop offset="0%" stop-color="#af00f1" stop-opacity="0.34"/>
        <stop offset="42%" stop-color="#5c0080" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#0c0c0c" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="halo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e04bff" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#e04bff" stop-opacity="0"/>
      </radialGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
    </defs>

    <rect width="100%" height="100%" fill="url(#wall)"/>
    ${columns}
    <rect width="100%" height="${horizon}" fill="url(#bloom)"/>
    ${beams}

    <ellipse cx="${width * 0.5}" cy="${horizon * 0.62}" rx="${width * 0.42}" ry="${height * 0.4}" fill="url(#halo)" opacity="0.55"/>

    ${arch(start, archW, sideH, "#181818", 0.9)}
    ${arch(start + archW + gap, centreW, centreH, "#1c161d", 1)}
    ${arch(start + archW + gap + centreW + gap, archW, sideH, "#181818", 0.9)}

    <rect y="${horizon}" width="100%" height="${height - horizon}" fill="url(#floor)"/>
    <line x1="0" y1="${horizon}" x2="${width}" y2="${horizon}" stroke="#f8f5ee" stroke-opacity="0.07" stroke-width="1.5"/>
    <line x1="0" y1="${horizon + (height - horizon) * 0.34}" x2="${width}" y2="${horizon + (height - horizon) * 0.34}" stroke="#f8f5ee" stroke-opacity="0.04" stroke-width="1"/>
    <line x1="0" y1="${horizon + (height - horizon) * 0.68}" x2="${width}" y2="${horizon + (height - horizon) * 0.68}" stroke="#f8f5ee" stroke-opacity="0.03" stroke-width="1"/>

    ${dust(width, height * 0.86, Math.round((width * height) / 26000), 71)}

    <rect width="100%" height="100%" filter="url(#grain)" opacity="0.05"/>
  </svg>`;
}

/** file to write → how to build it from a source frame */
const FRAMES = [
  {
    out: "hero-void.jpg",
    from: "chapter-space.jpg",
    // A touch more contrast after desaturating: with no colour to separate the
    // floor from the dark, the gradient has to do the work. The wide frame is
    // the hall's centre band — the hero fills a landscape viewport, so the
    // void keeps the vanishing point and the light shaft and lets the ceiling
    // and floor extremes go.
    build: (image) =>
      image
        .resize(2400, 1350, { fit: "cover", position: "centre" })
        .grayscale()
        .linear(1.06, -6),
    note: "Void theme hero — the hall with the colour taken out",
  },
  {
    out: "hero-triptych.jpg",
    svg: () => triptychScene(2400, 1350),
    note: "Triptych theme hero — panel black, signal violet, three arches",
  },
  {
    out: "hero-triptych-portrait.jpg",
    svg: () => triptychScene(1200, 1800),
    note: "Triptych theme hero, portrait crop for phones",
  },
];

for (const frame of FRAMES) {
  const target = path.join(MEDIA, frame.out);

  let output;
  let sizeNote;

  if (frame.svg) {
    const svg = Buffer.from(frame.svg());
    output = await sharp(svg).jpeg({ quality: 86, mozjpeg: true, progressive: true }).toBuffer();
    sizeNote = "";
  } else {
    const source = path.join(MEDIA, frame.from);
    const input = sharp(source, { failOn: "error" });
    const meta = await input.metadata();
    output = await frame
      .build(input)
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toBuffer();
    sizeNote = `  (from ${frame.from} ${meta.width}×${meta.height})`;
  }

  const outMeta = await sharp(output).metadata();
  await fs.writeFile(target, output);
  console.log(
    `${frame.out}  ${outMeta.width}×${outMeta.height}  ${(output.length / 1024).toFixed(0)} KB${sizeNote}`,
  );
  console.log(`  ${frame.note}`);
}
