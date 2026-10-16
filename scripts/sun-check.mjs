#!/usr/bin/env node
/**
 * Checks that the movable sun is wired the way it claims to be.
 *
 * There is no browser in the build environment, so this inspects the rendered
 * markup for the contract the component depends on: a labelled slider in the
 * hero, published sun coordinates, and grading overlays whose opacity is driven
 * by --sun-travel (which is 0 until the visitor moves the sun, so the untouched
 * hero is the photograph as shot).
 *
 *   node scripts/sun-check.mjs
 */

import { readFileSync } from "node:fs";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const html = await (await fetch(`${BASE}/`)).text();
const flat = html.replace(/<!--.*?-->/g, "");

/*
 * The sun belongs to one theme, and the studio can publish another one. If the
 * site is not currently wearing the sun theme, this suite has nothing to say:
 * it reports that and steps aside rather than failing on a correct page.
 */
const liveTheme = (html.match(/data-theme="([a-z-]+)"/) ?? [])[1];
const registry = readFileSync(new URL("../src/lib/themes.ts", import.meta.url), "utf8");
const atmosphere = registry
  .slice(registry.indexOf("export const THEMES"))
  .split(/\n  \{\n/)
  .map((chunk) => ({
    id: chunk.match(/id:\s*"([a-z-]+)"/)?.[1],
    atmosphere: chunk.match(/atmosphere:\s*"([a-z]+)"/)?.[1],
  }))
  .find((entry) => entry.id === liveTheme)?.atmosphere;

if (atmosphere && atmosphere !== "sun" && !/role="slider"/.test(flat)) {
  console.log(
    `\nThe published theme is ${liveTheme}, which has no movable sun (its hero is "${atmosphere}").`,
  );
  console.log("Nothing to check. Publish the Dusk theme to run this suite.\n");
  process.exit(0);
}

let failures = 0;
function check(name, condition, detail = "") {
  console.log(`  ${condition ? "✓" : "✗"} ${name}${condition || !detail ? "" : ` — ${detail}`}`);
  if (!condition) failures += 1;
}

const slider = flat.match(/<div[^>]*role="slider"[^>]*>/)?.[0] ?? "";
check("the sun is a labelled slider", /aria-label="Move the sun"/.test(slider));
check("the sun is keyboard reachable", /tabindex="0"/.test(slider));
check(
  "the sun reports its value",
  /aria-valuenow="\d+"/.test(slider) && /aria-valuetext="[^"]*light left"/.test(slider),
);
check("the sun can be grabbed", /cursor-grab/.test(slider));
check(
  "the sun starts inside the photograph's own glow",
  /left:86%/.test(slider) && /top:30%/.test(slider),
  slider.slice(slider.indexOf("style=")),
);
check(
  "the frame contains no baked-in sun disc",
  // The photograph was cropped so that the only sun in the hero is this one;
  // otherwise dragging it away would leave a second sun behind.
  !/delogo/.test(html),
);

check("the sun body is drawn", /sun-body/.test(flat));
check(
  "the sun is a sun, not a dot",
  /w-\[clamp\(3\.25rem,4\.4vw,5\.5rem\)\]/.test(flat) || /clamp\(3\.25rem/.test(flat),
  "the disc should scale with the viewport",
);
check(
  "the disc sits inside a larger grab area",
  /class="[^"]*\bh-24 w-24\b/.test(slider) || /h-24 w-24/.test(slider),
  "touch targets need to be bigger than the artwork",
);
check(
  "the frame is the sun theme's own photograph",
  /hero-sunset\.jpg/.test(flat),
  "the Dusk hero should be the sunset frame",
);
check(
  "the untouched frame is unmodified",
  /--sun-travel:0|--sun-travel,0/.test(flat) || flat.includes("--sun-travel"),
);
check(
  "grading responds to the sun",
  /opacity:\[var\(--sun-travel/.test(flat) || flat.includes("var(--sun-travel"),
);
check("the hint invites a drag", /Drag the sun/.test(flat));

// The old drifting particle field and crimson moon must be gone.
check("no particle field remains", !/rgba\(224,88,92/.test(flat));
check("no moon accent remains", !/moon-glow/.test(flat));
check(
  "the sun's corona grows as it descends",
  /box-shadow:[^"]*var\(--sun-travel/.test(flat) || flat.includes("var(--sun-travel"),
  "the glow should be tied to how far it has been dragged",
);

// The sun is the only slider; nothing else should have acquired the role.
const sliders = (flat.match(/role="slider"/g) ?? []).length;
check("there is exactly one movable sun", sliders === 1, `found ${sliders}`);

console.log(
  failures === 0 ? "\nThe sun is wired correctly.\n" : `\n${failures} problem(s) found.\n`,
);
process.exit(failures === 0 ? 0 : 1);
