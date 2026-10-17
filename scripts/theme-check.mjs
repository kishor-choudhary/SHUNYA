#!/usr/bin/env node
/**
 * SHUNYA theme check.
 *
 * There are two halves to a theme: the palette in src/app/globals.css and the
 * metadata in src/lib/themes.ts. This holds them together, and holds the
 * palette itself to its contrast floors.
 *
 * What it fails on:
 *   · a theme that exists in one half but not the other
 *   · a palette that is missing a token (so a colour would silently inherit
 *     the default theme's value)
 *   · a token that is not a real colour, or a value that is not in the file
 *   · surfaces that are not dark, or that do not ascend void → ink → … → smoke
 *   · type that is too faint for its size: ash 4.5:1, fog 7:1, bone 12:1
 *   · accents that cannot carry small text, or an accent fill whose label is
 *     unreadable (or unreadable on hover)
 *   · a browser chrome colour that no longer matches the theme's canvas
 *   · a hero frame that is missing from public/media
 *   · a theme with no preview selector, which the studio picker depends on
 *
 *   npm run check:themes
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = path.join(ROOT, "src/app/globals.css");
const REGISTRY_PATH = path.join(ROOT, "src/lib/themes.ts");

const css = readFileSync(CSS_PATH, "utf8");
const registry = readFileSync(REGISTRY_PATH, "utf8");

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  \u001b[32m✓\u001b[0m ${name}`);
    return true;
  }
  failures.push(name);
  console.log(`  \u001b[31m✗\u001b[0m ${name}${detail ? ` — ${detail}` : ""}`);
  return false;
}

function section(title) {
  console.log(`\n\u001b[1m${title}\u001b[0m`);
}

/* -------------------------------------------------------------------------- */
/*  Parsing                                                                   */
/* -------------------------------------------------------------------------- */

/** The body of the first block whose header matches, by brace counting. */
function blockAfter(source, headerPattern) {
  const header = source.match(headerPattern);
  if (!header) return null;
  const start = source.indexOf("{", header.index);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, i);
    }
  }
  return null;
}

const MANAGED_PREFIX = "--color-";

function paletteOf(block) {
  const palette = new Map();
  const pattern = new RegExp(`${MANAGED_PREFIX}([a-z-]+):\\s*([^;]+);`, "g");
  let match;
  while ((match = pattern.exec(block)) !== null) {
    palette.set(`${MANAGED_PREFIX}${match[1]}`, match[2].trim());
  }
  return palette;
}

const defaultBlock = blockAfter(css, /@theme\s*\{/);
if (!defaultBlock) {
  console.error("Could not find the @theme block in globals.css.");
  process.exit(1);
}
const defaultPalette = paletteOf(defaultBlock);

const previewSources = new Map();
for (const id of css.matchAll(/\[data-theme-preview="([a-z-]+)"\]/g)) {
  previewSources.set(id[1], true);
}
const publishedSources = new Map();
// A palette rule starts with the attribute followed by its own `{` (or a
// second selector). Scoped overrides such as
// `html[data-theme="triptych"] .arch-top { … }` must not be mistaken for one.
for (const id of css.matchAll(/html\[data-theme="([a-z-]+)"\]\s*[,{]/g)) {
  publishedSources.set(id[1], true);
}

/*
 * Which theme `@theme` holds. It is read from the registry so the check can
 * never drift when the studio launches on a different look — every other
 * theme is read out of its own published block.
 */
const defaultId =
  registry.match(/DEFAULT_THEME:\s*ThemeId\s*=\s*"([a-z-]+)"/)?.[1] ?? "dusk";

/** Palettes: default from @theme, the rest from their published block. */
const palettes = new Map([[defaultId, defaultPalette]]);
for (const id of publishedSources.keys()) {
  const block = blockAfter(css, new RegExp(`html\\[data-theme="${id}"\\]`));
  if (block) palettes.set(id, paletteOf(block));
}

/* The registry, read as source: it is a plain data literal. */
const arrayStart = registry.indexOf("export const THEMES");
const arraySource =
  arrayStart === -1 ? "" : registry.slice(arrayStart, registry.indexOf("\n];", arrayStart));
if (!arraySource) {
  console.error("Could not read the THEMES array in src/lib/themes.ts.");
  process.exit(1);
}

const entries = arraySource
  .split(/\n  \{\n/)
  .slice(1)
  .map((chunk) => {
    const id = chunk.match(/id:\s*"([a-z-]+)"/)?.[1] ?? "";
    const themeColor = chunk.match(/themeColor:\s*"(#[0-9a-fA-F]{3,8})"/)?.[1] ?? "";
    const atmosphere = chunk.match(/atmosphere:\s*"([a-z]+)"/)?.[1] ?? "";
    const label = chunk.match(/label:\s*"([^"]+)"/)?.[1] ?? "";
    const wide = chunk.match(/wide:\s*"([^"]+)"/)?.[1] ?? "";
    const portrait = chunk.match(/portrait:\s*"([^"]+)"/)?.[1] ?? "";
    return { id, themeColor, atmosphere, label, wide, portrait };
  })
  .filter((entry) => entry.id);

if (entries.length === 0) {
  console.error("Could not parse any theme entries out of src/lib/themes.ts.");
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/*  Colour maths                                                              */
/* -------------------------------------------------------------------------- */

function luminanceOf(hex) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const linear = (channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const [r, g, b] = channels.map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminanceOf(a), luminanceOf(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const isHex = (value) => /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(value);

/* -------------------------------------------------------------------------- */
/*  Registry ↔ CSS                                                            */
/* -------------------------------------------------------------------------- */

section("Registry and stylesheet agree");

const registryIds = entries.map((entry) => entry.id);
check(
  "every theme in the registry has a palette",
  registryIds.every((id) => palettes.has(id)),
  `missing: ${registryIds.filter((id) => !palettes.has(id)).join(", ") || "none"}`,
);
check(
  "no palette is orphaned from the registry",
  [...palettes.keys()].every((id) => registryIds.includes(id)),
  `orphans: ${[...palettes.keys()].filter((id) => !registryIds.includes(id)).join(", ") || "none"}`,
);
check(
  "the default theme is the one @theme declares",
  entries.some((entry) => entry.id === defaultId) && palettes.has(defaultId),
  `default ${defaultId}`,
);

/*
 * Every other theme declares its palette once, on a rule that carries both the
 * published and the preview selector. The default is the exception — @theme
 * holds its values and a separate preview block repeats them — so that pair is
 * compared here. It is the one place a colour is written down twice, and this
 * is what stops the two copies drifting apart.
 */
{
  const previewBlock = blockAfter(
    css,
    new RegExp(`\\[data-theme-preview="${defaultId}"\\]`),
  );
  const previewPalette = previewBlock ? paletteOf(previewBlock) : new Map();
  const differing = [...defaultPalette.entries()]
    .filter(([token, value]) => previewPalette.get(token) !== value)
    .map(([token, value]) => `${token}: @theme ${value} vs preview ${previewPalette.get(token) ?? "missing"}`);
  check(
    "the default theme's preview copy matches @theme",
    previewBlock !== null && differing.length === 0,
    differing.join("; "),
  );
}
check(
  "every theme can be previewed in the studio",
  registryIds.every((id) => previewSources.has(id)),
  `missing preview selector: ${registryIds.filter((id) => !previewSources.has(id)).join(", ") || "none"}`,
);
check(
  "accent buttons take their label from the theme",
  /color:\s*var\(--color-on-ember\)/.test(css),
  "btn-ember should use --color-on-ember, not a hard-coded white",
);
check(
  "and flip to the canvas colour on hover",
  /&:hover\s*\{[^}]*background:\s*var\(--color-ember-glow\);[^}]*color:\s*var\(--color-void\)/.test(css),
  "btn-ember:hover should light the accent and darken the label",
);

/* -------------------------------------------------------------------------- */
/*  Per-theme palette rules                                                   */
/* -------------------------------------------------------------------------- */

const SURFACES = ["void", "ink", "night", "charcoal", "graphite", "smoke"];
const TEXT_LADDER = [
  ["ash", 4.5],
  ["fog", 7],
  ["bone", 12],
  ["dusk", 4.5],
  ["amber", 4.5],
  ["ember-glow", 4.5],
];
const KNOWN_ATMOSPHERES = ["arch", "sun", "particles", "still"];

const expectedTokens = [...defaultPalette.keys()];

for (const entry of entries) {
  const palette = palettes.get(entry.id);
  if (!palette) continue;
  const label = entry.label || entry.id;

  section(`${label} (${entry.id})`);

  const missing = expectedTokens.filter((token) => !palette.has(token));
  const extra = [...palette.keys()].filter((token) => !expectedTokens.includes(token));
  check(
    "declares every palette token",
    missing.length === 0,
    missing.length ? `missing ${missing.join(", ")}` : "",
  );
  check(
    "declares no stray tokens",
    extra.length === 0,
    extra.length ? `unexpected ${extra.join(", ")}` : "",
  );

  const notAColour = [...palette.entries()]
    .filter(([, value]) => !isHex(value))
    .map(([token, value]) => `${token}=${value}`);
  check("every token is a literal colour", notAColour.length === 0, notAColour.join(", "));
  if (notAColour.length > 0 || missing.length > 0) continue;

  const get = (name) => palette.get(`${MANAGED_PREFIX}${name}`);

  // Surfaces: dark, and each step above the last.
  const surfaceLuminance = SURFACES.map((name) => luminanceOf(get(name)));
  check(
    "surfaces are dark",
    surfaceLuminance[surfaceLuminance.length - 1] <= 0.12,
    `smoke luminance ${surfaceLuminance[surfaceLuminance.length - 1].toFixed(3)}`,
  );
  check(
    "surfaces ascend from void to smoke",
    surfaceLuminance.every((value, index) => index === 0 || value > surfaceLuminance[index - 1]),
    SURFACES.map((name, index) => `${name} ${surfaceLuminance[index].toFixed(3)}`).join(" < "),
  );

  // Type ladder.
  for (const [token, floor] of TEXT_LADDER) {
    const ratio = contrast(get(token), get("void"));
    check(
      `${token} reaches ${floor}:1 on the canvas`,
      ratio >= floor,
      `${ratio.toFixed(2)}:1`,
    );
  }
  check(
    "ash < fog < bone",
    luminanceOf(get("ash")) < luminanceOf(get("fog")) &&
      luminanceOf(get("fog")) < luminanceOf(get("bone")),
  );

  // Accents.
  check(
    "the accent is visible on the canvas",
    contrast(get("ember"), get("void")) >= 3,
    `${contrast(get("ember"), get("void")).toFixed(2)}:1`,
  );
  check(
    "the accent deepens rather than lightens",
    luminanceOf(get("ember-deep")) < luminanceOf(get("ember")),
  );
  check(
    "an accent fill carries its label",
    contrast(get("on-ember"), get("ember")) >= 4.5,
    `${contrast(get("on-ember"), get("ember")).toFixed(2)}:1`,
  );
  // The hover state lights the accent up and flips the label to the canvas
  // colour (see .btn-ember), so that is the pairing to hold at 4.5:1.
  check(
    "the hover accent carries the canvas label",
    contrast(get("void"), get("ember-glow")) >= 4.5,
    `${contrast(get("void"), get("ember-glow")).toFixed(2)}:1`,
  );

  // Small type on raised panels, where most badges and errors sit.
  check(
    "ash holds up on charcoal",
    contrast(get("ash"), get("charcoal")) >= 4.5,
    `${contrast(get("ash"), get("charcoal")).toFixed(2)}:1`,
  );
  check(
    "the accent glow holds up on charcoal",
    contrast(get("ember-glow"), get("charcoal")) >= 4.5,
    `${contrast(get("ember-glow"), get("charcoal")).toFixed(2)}:1`,
  );
  check(
    "ash holds up on the footer band",
    contrast(get("ash"), get("ink")) >= 4.5,
    `${contrast(get("ash"), get("ink")).toFixed(2)}:1`,
  );

  // Metadata.
  check(
    "the chrome colour is the theme's canvas",
    entry.themeColor.toLowerCase() === get("void").toLowerCase(),
    `registry ${entry.themeColor} vs css ${get("void")}`,
  );
  check(
    "the atmosphere is one the hero understands",
    KNOWN_ATMOSPHERES.includes(entry.atmosphere),
    entry.atmosphere,
  );

  const frames = [
    ["wide", entry.wide],
    ["portrait", entry.portrait].filter(Boolean),
  ].filter(([, file]) => Boolean(file));
  for (const [kind, file] of frames) {
    check(
      `the ${kind} hero frame exists`,
      existsSync(path.join(ROOT, "public", file.replace(/^\//, ""))),
      file,
    );
  }
}

/* -------------------------------------------------------------------------- */

console.log(
  `\n\u001b[1mResult:\u001b[0m ${passed} checks passed, ${failures.length} failed.` +
    (failures.length ? `\n\u001b[31m${failures.join("\n")}\u001b[0m` : ""),
);

process.exit(failures.length === 0 ? 0 : 1);
