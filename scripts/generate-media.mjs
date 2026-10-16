#!/usr/bin/env node
/**
 * Generates the development placeholder set for `public/media`.
 *
 *   node scripts/generate-media.mjs
 *
 * The site ships with abstract, cinematic stand-ins so every layout can be
 * built and reviewed before real event photography exists — the UI labels
 * them as placeholders (see the credit lines in `src/lib/seed.ts`). They are
 * deliberately dark and text-free: the design sits on a near-black canvas and
 * draws its own type over the frame.
 *
 * Everything is deterministic (seeded noise and layout), so a re-run
 * reproduces the same files byte-for-byte-ish and the set can be rebuilt any
 * time — including after a fresh clone.
 *
 * Only `public/media` is written. The two Dusk hero frames
 * (`hero-sunset.jpg`, `hero-sunset-portrait.jpg`) are real photography and are
 * NOT touched here; `hero-void.jpg` is derived from `chapter-space.jpg` by
 * `scripts/generate-theme-art.mjs`, and the app icons by
 * `scripts/generate-icons.mjs`.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const sharp = createRequire(import.meta.url)("sharp");

const MEDIA = path.join(process.cwd(), "public", "media");

/* -------------------------------------------------------------------------- */
/*  Deterministic randomness                                                   */
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

/* -------------------------------------------------------------------------- */
/*  Drawing helpers — SVG scenes rendered through sharp                        */
/* -------------------------------------------------------------------------- */

const svgOpen = (w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;

/** Soft radial glow disc. */
function glow(cx, cy, r, color, opacity = 1, id) {
  return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
    <stop offset="45%" stop-color="${color}" stop-opacity="${opacity * 0.55}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </radialGradient>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

/** Solid disc with a soft edge (moon). */
function moon(cx, cy, r, fill, id) {
  return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${fill}" stop-opacity="1"/>
    <stop offset="82%" stop-color="${fill}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${fill}" stop-opacity="0.55"/>
  </radialGradient>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

/** Vertical linear gradient background. */
function sky(id, stops) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    ${stops.map(([o, c, a = 1]) => `<stop offset="${o}%" stop-color="${c}" stop-opacity="${a}"/>`).join("")}
  </linearGradient>
  <rect width="100%" height="100%" fill="url(#${id})"/>`;
}

/** A light beam: tapered polygon fading along its length. */
function beam(x1, y1, x2, y2, width, color, opacity, id) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (width / 2);
  const ny = (dx / len) * (width / 2);
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>
  <polygon points="${x1 + nx},${y1 + ny} ${x1 - nx},${y1 - ny} ${x2 - nx * 2.2},${y2 - ny * 2.2} ${x2 + nx * 2.2},${y2 + ny * 2.2}" fill="url(#${id})"/>`;
}

/** Crowd silhouette: a rolling baseline of heads and shoulders. */
function crowd(w, h, baseY, color, rng, density = 26) {
  const parts = [];
  for (let i = 0; i < density; i += 1) {
    const cx = (w / density) * (i + rng() * 0.9);
    const r = w * (0.018 + rng() * 0.02);
    const cy = baseY + rng() * h * 0.03;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`);
    parts.push(
      `<path d="M ${cx - r * 2.1} ${h} q 0 ${-(r * 2.6)} ${r * 2.1} ${-(r * 2.9)} q ${r * 2.1} ${0.3 * r} ${r * 2.1} ${r * 2.9} L ${cx + r * 2.1} ${h} Z" fill="${color}"/>`,
    );
  }
  parts.push(`<rect x="0" y="${baseY + h * 0.035}" width="${w}" height="${h}" fill="${color}"/>`);
  return parts.join("");
}

/** Raised arms — short, thick strokes with rounded hands, rising from a baseline. */
function arms(w, h, baseY, color, rng, count = 12) {
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    const x = w * (0.06 + rng() * 0.88);
    const len = h * (0.07 + rng() * 0.1);
    const tilt = (rng() - 0.5) * 0.42;
    const x2 = x + tilt * len;
    const y2 = baseY - len;
    const sw = w * (0.014 + rng() * 0.01);
    parts.push(
      `<path d="M ${x} ${baseY} Q ${x + tilt * len * 0.35} ${baseY - len * 0.6} ${x2} ${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`,
      `<circle cx="${x2}" cy="${y2}" r="${sw * 0.72}" fill="${color}"/>`,
    );
  }
  return parts.join("");
}

/** Scattered bokeh discs. */
function bokeh(w, h, rng, count, color) {
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    const cx = rng() * w;
    const cy = rng() * h;
    const r = w * (0.008 + rng() * 0.045);
    const o = 0.05 + rng() * 0.16;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="${o.toFixed(3)}"/>`);
  }
  return parts.join("");
}

/** Dust motes. */
function dust(w, h, rng, count) {
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    parts.push(
      `<circle cx="${(rng() * w).toFixed(1)}" cy="${(rng() * h).toFixed(1)}" r="${(w * (0.0008 + rng() * 0.0022)).toFixed(2)}" fill="#efe9dc" fill-opacity="${(0.06 + rng() * 0.2).toFixed(3)}"/>`,
    );
  }
  return parts.join("");
}

/** Corner vignette. */
function vignette(w, h, strength = 0.75) {
  return `<radialGradient id="vig" cx="50%" cy="46%" r="72%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity="${strength}"/>
  </radialGradient>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>`;
}

/* -------------------------------------------------------------------------- */
/*  Scenes                                                                     */
/* -------------------------------------------------------------------------- */

const VOID = "#05060a";
const NIGHT = "#0a0f18";
const CRIMSON = "#b3283f";
const EMBER = "#d4552c";
const GOLD = "#e8b45a";
const BONE = "#efe9dc";

/** Crimson moon over a dark crowd — the Moon theme's hero. */
function moonOverCrowd(w, h, rng, { moonR = 0.16, moonY = 0.3, crowdY = 0.74, lasers = true } = {}) {
  const mx = w * 0.68;
  const my = h * moonY;
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#04050a"],
      [55, "#0b0d16"],
      [78, "#171019"],
      [100, "#0a070c"],
    ]),
    dust(w, h, rng, 90),
    glow(mx, my, w * moonR * 3.4, CRIMSON, 0.34, "mg"),
    moon(mx, my, w * moonR, "#c2334d", "mn"),
    lasers
      ? beam(w * 0.1, h * 0.92, w * 0.55, h * 0.18, w * 0.012, CRIMSON, 0.26, "l1") +
        beam(w * 0.86, h * 0.95, w * 0.42, h * 0.2, w * 0.01, EMBER, 0.22, "l2") +
        beam(w * 0.3, h, w * 0.78, h * 0.25, w * 0.008, GOLD, 0.16, "l3")
      : "",
    glow(w * 0.5, h * crowdY, w * 0.7, "#2a1218", 0.8, "hg"),
    crowd(w, h, h * crowdY, "#050307", rng, 30),
    arms(w, h, h * (crowdY + 0.02), "#050307", rng, 18),
    vignette(w, h, 0.8),
    "</svg>",
  ].join("");
}

/** Sound as light: a glowing waveform band. */
function soundWaves(w, h, rng) {
  const bars = [];
  const n = 42;
  for (let i = 0; i < n; i += 1) {
    const x = (w / n) * (i + 0.5);
    const amp = (0.12 + rng() * 0.52) * h * 0.4;
    const bw = (w / n) * 0.34;
    const y = h * 0.46;
    const o = 0.25 + rng() * 0.65;
    bars.push(
      `<rect x="${x - bw / 2}" y="${y - amp}" width="${bw}" height="${amp * 2}" rx="${bw / 2}" fill="url(#bar)" fill-opacity="${o.toFixed(2)}"/>`,
      `<rect x="${x - bw / 2}" y="${y + amp * 1.06}" width="${bw}" height="${amp * 1.3}" rx="${bw / 2}" fill="url(#bar)" fill-opacity="${(o * 0.22).toFixed(2)}"/>`,
    );
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, VOID],
      [45, "#0c0a10"],
      [52, "#171017"],
      [60, "#0c0a10"],
      [100, VOID],
    ]),
    `<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${EMBER}"/>
      <stop offset="50%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="${EMBER}"/>
    </linearGradient>`,
    glow(w * 0.5, h * 0.46, w * 0.55, EMBER, 0.3, "sg"),
    bars.join(""),
    dust(w, h, rng, 60),
    vignette(w, h, 0.72),
    "</svg>",
  ].join("");
}

/** The empty hall: perspective trusses and hanging light. */
function emptyHall(w, h, rng) {
  const vx = w * 0.5;
  const vy = h * 0.42;
  const lines = [];
  for (let i = -4; i <= 4; i += 1) {
    const xFloor = vx + i * w * 0.19;
    const xTop = vx + i * w * 0.045;
    lines.push(
      `<line x1="${xTop}" y1="${vy}" x2="${xFloor}" y2="${h}" stroke="#3a4152" stroke-width="3" stroke-opacity="${0.8 - Math.abs(i) * 0.1}"/>`,
    );
    lines.push(
      `<line x1="${xTop}" y1="${vy}" x2="${vx + i * w * 0.16}" y2="0" stroke="#333a4b" stroke-width="3.5" stroke-opacity="${0.7 - Math.abs(i) * 0.09}"/>`,
    );
  }
  for (let r = 1; r <= 5; r += 1) {
    const t = r / 6;
    const y = vy + (h - vy) * t * t;
    lines.push(`<line x1="${vx - w * 0.5 * t * t - w * 0.05}" y1="${y}" x2="${vx + w * 0.5 * t * t + w * 0.05}" y2="${y}" stroke="#39404f" stroke-width="${1.5 + t * 2.5}" stroke-opacity="0.62"/>`);
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#07080c"],
      [38, "#0c0e15"],
      [42, "#161a24"],
      [100, "#0b0d12"],
    ]),
    lines.join(""),
    beam(w * 0.38, h * 0.06, w * 0.28, h * 0.82, w * 0.12, "#8b93a6", 0.22, "c1"),
    beam(w * 0.62, h * 0.06, w * 0.74, h * 0.82, w * 0.12, "#8b93a6", 0.2, "c2"),
    beam(w * 0.5, 0, w * 0.5, h * 0.9, w * 0.2, "#aab2c4", 0.24, "c3"),
    glow(vx, vy, w * 0.42, "#4a5266", 0.65, "fg"),
    dust(w, h, rng, 110),
    vignette(w, h, 0.7),
    "</svg>",
  ].join("");
}

/** People as silhouette against warm light. */
function peopleGlow(w, h, rng, { headY = 0.68, warm = true } = {}) {
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, warm ? "#0c0806" : VOID],
      [55, warm ? "#241207" : "#101018"],
      [100, warm ? "#120a06" : "#0a0a10"],
    ]),
    glow(w * 0.5, h * 0.42, w * 0.5, warm ? EMBER : "#4a3a6a", 0.4, "pg"),
    dust(w, h, rng, 70),
    arms(w, h, h * (headY + 0.06), "#070406", rng, 20),
    crowd(w, h, h * headY, "#070406", rng, 22),
    vignette(w, h, 0.78),
    "</svg>",
  ].join("");
}

/** Soft bokeh field with a standing figure. */
function bokehFigure(w, h, rng, hue = "warm") {
  const c = hue === "warm" ? GOLD : "#7d8dff";
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, VOID],
      [60, hue === "warm" ? "#120c0a" : "#0a0c16"],
      [100, "#07060a"],
    ]),
    bokeh(w, h, rng, 26, c),
    glow(w * 0.68, h * 0.34, w * 0.5, c, 0.22, "bg"),
    `<ellipse cx="${w * 0.32}" cy="${h * 0.68}" rx="${w * 0.085}" ry="${h * 0.13}" fill="#060408" fill-opacity="0.85"/>`,
    `<circle cx="${w * 0.32}" cy="${h * 0.52}" r="${w * 0.048}" fill="#060408" fill-opacity="0.85"/>`,
    dust(w, h, rng, 40),
    vignette(w, h, 0.72),
    "</svg>",
  ].join("");
}

/** Crossing laser beams in haze. */
function beamField(w, h, rng, count = 7) {
  const beams = [];
  for (let i = 0; i < count; i += 1) {
    const x1 = rng() * w;
    const x2 = x1 + (rng() - 0.5) * w * 1.4;
    const c = [CRIMSON, EMBER, GOLD, "#7d5cff"][Math.floor(rng() * 4)];
    beams.push(beam(x1, h * 1.05, x2, h * 0.12, w * (0.008 + rng() * 0.02), c, 0.16 + rng() * 0.22, `bf${i}`));
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, VOID],
      [100, "#0c0910"],
    ]),
    beams.join(""),
    glow(w * 0.5, h * 0.85, w * 0.6, "#2a1020", 0.55, "fg"),
    dust(w, h, rng, 80),
    vignette(w, h, 0.75),
    "</svg>",
  ].join("");
}

/** A stage bar glowing through haze. */
function stageGlow(w, h, rng) {
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, VOID],
      [58, "#120b10"],
      [100, "#080508"],
    ]),
    `<rect x="${w * 0.18}" y="${h * 0.52}" width="${w * 0.64}" height="${h * 0.02}" rx="${h * 0.01}" fill="${EMBER}" fill-opacity="0.85"/>`,
    glow(w * 0.5, h * 0.53, w * 0.42, EMBER, 0.5, "stg"),
    beam(w * 0.3, h * 0.5, w * 0.18, h * 0.1, w * 0.05, GOLD, 0.16, "s1"),
    beam(w * 0.7, h * 0.5, w * 0.84, h * 0.12, w * 0.05, GOLD, 0.14, "s2"),
    crowd(w, h, h * 0.82, "#050306", rng, 18),
    vignette(w, h, 0.8),
    "</svg>",
  ].join("");
}

/** Layered haze horizon with a small moon. */
function hazeLayers(w, h, rng) {
  const layers = [];
  for (let i = 0; i < 5; i += 1) {
    const y = h * (0.5 + i * 0.1);
    layers.push(
      `<ellipse cx="${w * (0.3 + rng() * 0.4)}" cy="${y}" rx="${w * 0.75}" ry="${h * (0.05 + rng() * 0.05)}" fill="#1a1220" fill-opacity="${(0.35 - i * 0.05).toFixed(2)}"/>`,
    );
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#06070d"],
      [48, "#111021"],
      [100, "#0a0710"],
    ]),
    moon(w * 0.32, h * 0.26, w * 0.045, "#c9b8d8", "hm"),
    glow(w * 0.32, h * 0.26, w * 0.2, "#8d76b8", 0.28, "hg"),
    layers.join(""),
    dust(w, h, rng, 50),
    vignette(w, h, 0.7),
    "</svg>",
  ].join("");
}

/** A lone figure under a high moon. */
function moonFigure(w, h, rng) {
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#04050a"],
      [70, "#0d0c16"],
      [100, "#08070c"],
    ]),
    moon(w * 0.62, h * 0.26, w * 0.08, "#c2334d", "mf"),
    glow(w * 0.62, h * 0.26, w * 0.3, CRIMSON, 0.3, "mfg"),
    dust(w, h, rng, 60),
    `<ellipse cx="${w * 0.5}" cy="${h * 0.8}" rx="${w * 0.085}" ry="${h * 0.13}" fill="#040307"/>`,
    `<circle cx="${w * 0.5}" cy="${h * 0.64}" r="${w * 0.052}" fill="#040307"/>`,
    `<rect x="0" y="${h * 0.92}" width="${w}" height="${h * 0.1}" fill="#040307"/>`,
    glow(w * 0.5, h * 0.95, w * 0.5, CRIMSON, 0.12, "gg"),
    vignette(w, h, 0.76),
    "</svg>",
  ].join("");
}

/** Glowing floor grid — a dance floor before anyone arrives. */
function floorGrid(w, h, rng) {
  const lines = [];
  const vy = h * 0.42;
  for (let i = -6; i <= 6; i += 1) {
    lines.push(
      `<line x1="${w * 0.5 + i * w * 0.045}" y1="${vy}" x2="${w * 0.5 + i * w * 0.26}" y2="${h}" stroke="${EMBER}" stroke-width="2" stroke-opacity="${(0.35 - Math.abs(i) * 0.04).toFixed(2)}"/>`,
    );
  }
  for (let r = 1; r <= 6; r += 1) {
    const t = r / 7;
    const y = vy + (h - vy) * t * t;
    lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${EMBER}" stroke-width="${1 + t * 2.5}" stroke-opacity="${(0.3 * (1 - t) + 0.08).toFixed(2)}"/>`);
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, VOID],
      [40, "#0b0910"],
      [100, "#120b0e"],
    ]),
    lines.join(""),
    glow(w * 0.5, vy, w * 0.4, GOLD, 0.22, "fg"),
    dust(w, h, rng, 45),
    vignette(w, h, 0.72),
    "</svg>",
  ].join("");
}

/** Truss tunnel receding to a lit point. */
function trussTunnel(w, h, rng) {
  const frames = [];
  for (let i = 0; i < 7; i += 1) {
    const t = i / 7;
    const inset = t * 0.42;
    frames.push(
      `<rect x="${w * inset}" y="${h * inset * 0.9}" width="${w * (1 - inset * 2)}" height="${h * (1 - inset * 1.8)}" fill="none" stroke="#2b3140" stroke-width="${(2.5 * (1 - t) + 1).toFixed(1)}" stroke-opacity="${(0.55 * (1 - t) + 0.1).toFixed(2)}"/>`,
    );
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, VOID],
      [100, "#0a0c12"],
    ]),
    frames.join(""),
    glow(w * 0.5, h * 0.48, w * 0.2, GOLD, 0.4, "tg"),
    beam(w * 0.5, h * 0.46, w * 0.5, h, w * 0.24, GOLD, 0.1, "tgb"),
    dust(w, h, rng, 70),
    vignette(w, h, 0.74),
    "</svg>",
  ].join("");
}

/** Confetti drift over a warm glow. */
function confettiDrift(w, h, rng) {
  const bits = [];
  for (let i = 0; i < 90; i += 1) {
    const x = rng() * w;
    const y = rng() * h * 0.9;
    const s = w * (0.004 + rng() * 0.01);
    const rot = rng() * 180;
    const c = [GOLD, EMBER, BONE, CRIMSON][Math.floor(rng() * 4)];
    bits.push(
      `<rect x="${x}" y="${y}" width="${s * 2.4}" height="${s}" rx="${s / 3}" fill="${c}" fill-opacity="${(0.2 + rng() * 0.6).toFixed(2)}" transform="rotate(${rot.toFixed(1)} ${x} ${y})"/>`,
    );
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#08060a"],
      [62, "#1a1010"],
      [100, "#0c080a"],
    ]),
    glow(w * 0.5, h * 0.55, w * 0.55, EMBER, 0.34, "cg"),
    bits.join(""),
    crowd(w, h, h * 0.9, "#050306", rng, 16),
    vignette(w, h, 0.78),
    "</svg>",
  ].join("");
}

/** Two figures close together in warm light. */
function intimatePair(w, h, rng) {
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#070505"],
      [58, "#20120b"],
      [100, "#0d0806"],
    ]),
    glow(w * 0.5, h * 0.46, w * 0.52, EMBER, 0.42, "ig"),
    `<ellipse cx="${w * 0.38}" cy="${h * 0.72}" rx="${w * 0.105}" ry="${h * 0.17}" fill="#060305"/>`,
    `<circle cx="${w * 0.38}" cy="${h * 0.52}" r="${w * 0.062}" fill="#060305"/>`,
    `<ellipse cx="${w * 0.61}" cy="${h * 0.74}" rx="${w * 0.092}" ry="${h * 0.15}" fill="#060305"/>`,
    `<circle cx="${w * 0.61}" cy="${h * 0.57}" r="${w * 0.055}" fill="#060305"/>`,
    dust(w, h, rng, 40),
    vignette(w, h, 0.8),
    "</svg>",
  ].join("");
}

/** Wide venue, small lit stage, far crowd. */
function wideVenue(w, h, rng) {
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#05060a"],
      [50, "#0a0b12"],
      [100, "#060508"],
    ]),
    `<rect x="${w * 0.36}" y="${h * 0.46}" width="${w * 0.28}" height="${h * 0.016}" rx="4" fill="${GOLD}" fill-opacity="0.8"/>`,
    glow(w * 0.5, h * 0.47, w * 0.3, GOLD, 0.38, "wv"),
    beam(w * 0.42, h * 0.46, w * 0.22, h * 0.1, w * 0.035, GOLD, 0.16, "w1"),
    beam(w * 0.58, h * 0.46, w * 0.8, h * 0.1, w * 0.035, EMBER, 0.16, "w2"),
    beam(w * 0.5, h * 0.46, w * 0.5, h * 0.05, w * 0.05, GOLD, 0.12, "w3"),
    crowd(w, h, h * 0.78, "#040306", rng, 24),
    vignette(w, h, 0.82),
    "</svg>",
  ].join("");
}

/** Rooftop string lights over a warm horizon. */
function rooftopLights(w, h, rng) {
  const wires = [];
  for (let row = 0; row < 3; row += 1) {
    const y = h * (0.18 + row * 0.13);
    const sag = h * (0.05 + row * 0.012);
    wires.push(
      `<path d="M 0 ${y} Q ${w / 2} ${y + sag} ${w} ${y - h * 0.02}" stroke="#3a2c22" stroke-width="2.5" fill="none"/>`,
    );
    const bulbs = 9 + row * 2;
    for (let i = 1; i < bulbs; i += 1) {
      const t = i / bulbs;
      const bx = t * w;
      const by = y + sag * 2 * t * (1 - t) - t * h * 0.02;
      wires.push(`<circle cx="${bx}" cy="${by}" r="${w * 0.008}" fill="${GOLD}"/>`);
      wires.push(`<circle cx="${bx}" cy="${by}" r="${w * 0.028}" fill="${GOLD}" fill-opacity="0.18"/>`);
    }
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#070509"],
      [42, "#170e12"],
      [70, "#2a1610"],
      [100, "#120a08"],
    ]),
    glow(w * 0.72, h * 0.52, w * 0.5, EMBER, 0.4, "rh"),
    wires.join(""),
    `<rect x="0" y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#0a0608"/>`,
    `<rect x="0" y="${h * 0.7}" width="${w}" height="${h * 0.03}" fill="#241611"/>`,
    dust(w, h, rng, 30),
    vignette(w, h, 0.74),
    "</svg>",
  ].join("");
}

/** Night pool with a light column on the water. */
function poolReflections(w, h, rng) {
  const ripples = [];
  for (let i = 0; i < 16; i += 1) {
    const y = h * (0.42 + i * 0.035);
    const o = 0.05 + rng() * 0.12;
    ripples.push(
      `<ellipse cx="${w * (0.42 + rng() * 0.16)}" cy="${y}" rx="${w * (0.18 + rng() * 0.22)}" ry="${h * 0.004}" fill="#9ad7e8" fill-opacity="${o.toFixed(2)}"/>`,
    );
  }
  return [
    svgOpen(w, h),
    sky("sky", [
      [0, "#04070c"],
      [36, "#071220"],
      [40, "#0a1c2c"],
      [100, "#06121e"],
    ]),
    moon(w * 0.56, h * 0.18, w * 0.035, "#d8e8ee", "pm"),
    glow(w * 0.56, h * 0.2, w * 0.18, "#8fc4d8", 0.3, "pg"),
    `<rect x="${w * 0.5}" y="${h * 0.4}" width="${w * 0.1}" height="${h * 0.6}" fill="#bfe6f2" fill-opacity="0.1"/>`,
    ripples.join(""),
    `<rect x="0" y="0" width="${w}" height="${h * 0.05}" fill="#030507"/>`,
    dust(w, h, rng, 25),
    vignette(w, h, 0.7),
    "</svg>",
  ].join("");
}

/* -------------------------------------------------------------------------- */
/*  Grain + assembly                                                           */
/* -------------------------------------------------------------------------- */

async function grainBuffer(w, h, rng, opacity = 0.09) {
  // A small tile of mono noise, stretched over the frame — a film-grain pass
  // that also hides banding in the gradients.
  const tw = 220;
  const th = 220;
  const raw = Buffer.alloc(tw * th * 4);
  for (let i = 0; i < tw * th; i += 1) {
    const v = 110 + Math.floor(rng() * 70);
    raw[i * 4] = v;
    raw[i * 4 + 1] = v;
    raw[i * 4 + 2] = v;
    raw[i * 4 + 3] = Math.floor(255 * opacity * 2.4);
  }
  return sharp(raw, { raw: { width: tw, height: th, channels: 4 } })
    .resize(w, h, { fit: "fill" })
    .png()
    .toBuffer();
}

async function render(scene, w, h, seed) {
  const rng = mulberry32(seed);
  const svg = scene.svg;
  const grain = await grainBuffer(w, h, mulberry32(seed ^ 0x9e3779b9), scene.grain ?? 0.09);
  return sharp(Buffer.from(svg))
    .composite([{ input: grain, blend: "overlay" }])
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer();
}

/** file → scene recipe */
const SCENES = [
  { file: "hero-main.jpg", w: 2400, h: 1350, seed: 11, make: (w, h, r) => moonOverCrowd(w, h, r, { moonR: 0.14, moonY: 0.28, crowdY: 0.72 }) },
  { file: "hero-loop-poster.jpg", w: 2400, h: 1260, seed: 12, make: (w, h, r) => moonOverCrowd(w, h, r, { moonR: 0.09, moonY: 0.24, crowdY: 0.78 }) },
  { file: "chapter-sound.jpg", w: 1600, h: 2000, seed: 21, make: soundWaves },
  { file: "chapter-space.jpg", w: 1600, h: 2000, seed: 22, make: emptyHall },
  { file: "chapter-people.jpg", w: 1600, h: 2000, seed: 23, make: (w, h, r) => peopleGlow(w, h, r, { headY: 0.66 }) },
  { file: "gallery-01.jpg", w: 1200, h: 1600, seed: 31, make: (w, h, r) => bokehFigure(w, h, r, "warm") },
  { file: "gallery-02.jpg", w: 1200, h: 1600, seed: 32, make: (w, h, r) => beamField(w, h, r, 8) },
  { file: "gallery-03.jpg", w: 1200, h: 1600, seed: 33, make: (w, h, r) => peopleGlow(w, h, r, { headY: 0.7, warm: true }) },
  { file: "gallery-04.jpg", w: 1600, h: 1200, seed: 34, make: stageGlow },
  { file: "gallery-05.jpg", w: 1600, h: 1200, seed: 35, make: hazeLayers },
  { file: "gallery-06.jpg", w: 1200, h: 1600, seed: 36, make: moonFigure },
  { file: "gallery-07.jpg", w: 1600, h: 1200, seed: 37, make: floorGrid },
  { file: "gallery-08.jpg", w: 1600, h: 1200, seed: 38, make: trussTunnel },
  { file: "gallery-09.jpg", w: 1600, h: 1200, seed: 39, make: confettiDrift },
  { file: "gallery-10.jpg", w: 1200, h: 1600, seed: 40, make: intimatePair },
  { file: "gallery-11.jpg", w: 1600, h: 1200, seed: 41, make: wideVenue },
  { file: "private-rooftop.jpg", w: 1600, h: 1200, seed: 51, make: rooftopLights },
  { file: "private-pool.jpg", w: 1600, h: 1200, seed: 52, make: poolReflections },
];

await fs.mkdir(MEDIA, { recursive: true });

for (const scene of SCENES) {
  const svg = scene.make(scene.w, scene.h, mulberry32(scene.seed));
  const out = await render({ svg, grain: scene.grain }, scene.w, scene.h, scene.seed);
  await fs.writeFile(path.join(MEDIA, scene.file), out);
  console.log(`${scene.file}  ${scene.w}×${scene.h}  ${(out.length / 1024).toFixed(0)} KB`);
}

console.log(`\n${SCENES.length} placeholder frames written to public/media`);
