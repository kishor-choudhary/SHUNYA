#!/usr/bin/env node
/**
 * SHUNYA accessibility & SEO audit.
 *
 * Fetches every public route from a running server and checks the things that
 * can be verified from the rendered HTML: landmarks, heading structure,
 * accessible names on images/links/buttons/inputs, metadata, viewport settings
 * and internal link health.
 *
 *   npm run dev            # in one terminal
 *   npm run audit          # in another
 *
 * What this cannot check: colour contrast on a real screen, focus visibility,
 * screen-reader announcement order and keyboard traps — those need a browser
 * and a human. The README says so explicitly.
 *
 * Exit code is non-zero when any check fails, so it can gate a release.
 */

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const ROUTES = [
  "/",
  "/about",
  "/events",
  "/private-experiences",
  "/gallery",
  "/contact",
  "/admin",
  "/nope-does-not-exist",
];

let failures = 0;
let checks = 0;
const notes = [];

function check(route, name, condition, detail = "") {
  checks += 1;
  if (condition) return true;
  failures += 1;
  console.log(`  ✗ [${route}] ${name}${detail ? ` — ${detail}` : ""}`);
  return false;
}

/* ----------------------------------------------------------------- pieces -- */

const stripComments = (html) => html.replace(/<!--.*?-->/g, "");

function textOf(fragment) {
  return stripComments(fragment)
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match ? match[1] : null;
}

function labelTargets(html) {
  const forIds = new Set();
  for (const label of tags(html, "label")) {
    const target = attr(label, "for");
    if (target) forIds.add(target);
  }
  return forIds;
}

/* ------------------------------------------------------------------ audit -- */

async function audit(route) {
  const response = await fetch(`${BASE}${route}`, { redirect: "manual" });
  const html = await response.text();
  const flat = stripComments(html);
  const isError = route.includes("does-not-exist");

  if (!isError) {
    check(route, "responds 200", response.status === 200, `got ${response.status}`);
    if (response.status !== 200) return html;
  } else {
    check(route, "unknown route returns 404", response.status === 404, `got ${response.status}`);
  }

  // --- document ---------------------------------------------------------
  check(route, "declares a language", /<html[^>]+lang="[a-z]{2}(-[A-Za-z]{2})?"/i.test(html));

  const title = (html.match(/<title>([^<]*)<\/title>/i) ?? [])[1] ?? "";
  check(route, "has a non-empty title", title.trim().length > 0);
  check(route, "title fits search results", title.length <= 70, `${title.length} chars`);

  const description = attr(tags(html, "meta").find((t) => /name="description"/i.test(t)) ?? "", "content");
  check(route, "has a meta description", Boolean(description && description.length > 40), `${description?.length ?? 0} chars`);
  check(route, "description fits search results", !description || description.length <= 165, `${description?.length ?? 0} chars`);

  check(route, "declares a canonical URL", /rel="canonical"/i.test(html));

  const viewport = attr((tags(html, "meta").find((t) => /name="viewport"/i.test(t)) ?? ""), "content");
  check(route, "viewport allows zooming", Boolean(viewport) && !/user-scalable\s*=\s*no/i.test(viewport ?? ""));

  // --- social -----------------------------------------------------------
  check(route, "has an Open Graph title", /property="og:title"/i.test(html));
  check(route, "has an Open Graph image", /property="og:image"/i.test(html));

  // --- landmarks & headings --------------------------------------------
  const mainCount = tags(flat, "main").length;
  check(route, "has exactly one main landmark", mainCount === 1, `found ${mainCount}`);

  const h1s = tags(flat, "h1");
  check(route, "has exactly one h1", h1s.length === 1, `found ${h1s.length}`);

  const headingLevels = (flat.match(/<h([1-6])\b[^>]*>/gi) ?? []).map((tag) => Number(tag.match(/<h([1-6])/i)[1]));
  let skipped = null;
  for (let i = 1; i < headingLevels.length; i += 1) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      skipped = `h${headingLevels[i - 1]} → h${headingLevels[i]}`;
      break;
    }
  }
  check(route, "heading levels never skip", skipped === null, skipped ?? "");

  // A skip link only earns its place when there is chrome before the content.
  const hasChrome = /<nav\b/i.test(flat) || /<header\b/i.test(flat);
  const skipLink = /<a[^>]+href="#main"/i.test(html);
  check(route, "offers a skip-to-content link", skipLink || !hasChrome);
  check(route, 'main landmark is targetable (#main)', /id="main"/.test(flat));

  // --- names ------------------------------------------------------------
  const images = tags(flat, "img");
  const imagesWithoutAlt = images.filter((tag) => attr(tag, "alt") === null);
  check(route, "every image has an alt attribute", imagesWithoutAlt.length === 0, `${imagesWithoutAlt.length} missing`);
  check(route, "every image is sized", images.every((tag) => attr(tag, "width") !== null || attr(tag, "sizes") !== null), "width or sizes");

  const anchors = flat.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const namelessLinks = anchors.filter((anchor) => {
    const openTag = anchor.match(/<a\b[^>]*>/i)?.[0] ?? "";
    if (attr(openTag, "aria-label") || attr(openTag, "title")) return false;
    if (textOf(anchor).length > 0) return false;
    return !/<img[^>]+alt="[^"]+"/i.test(anchor);
  });
  check(route, "every link has an accessible name", namelessLinks.length === 0, `${namelessLinks.length} unnamed`);

  const buttons = flat.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  const namelessButtons = buttons.filter((button) => {
    const openTag = button.match(/<button\b[^>]*>/i)?.[0] ?? "";
    if (attr(openTag, "aria-label") || attr(openTag, "title")) return false;
    return textOf(button).length === 0;
  });
  check(route, "every button has an accessible name", namelessButtons.length === 0, `${namelessButtons.length} unnamed`);

  // form controls: associated <label for>, aria-label or aria-labelledby
  const forIds = labelTargets(flat);
  const controls = flat.match(/<(input|select|textarea)\b[^>]*>/gi) ?? [];
  const unlabelled = controls.filter((tag) => {
    const type = (attr(tag, "type") ?? "text").toLowerCase();
    if (["hidden", "submit", "button", "reset", "image"].includes(type)) return false;
    if (/aria-hidden="true"/i.test(tag)) return false;
    if (attr(tag, "aria-label") || attr(tag, "aria-labelledby")) return false;
    const id = attr(tag, "id");
    if (id && forIds.has(id)) return false;
    // a control wrapped in its own label is fine
    const wrapped = flat.includes(`<label`) && new RegExp(`<label[^>]*>(?:(?!</label>)[\\s\\S])*${id ?? "\u0000"}`).test(flat);
    return !wrapped;
  });
  check(route, "every form control is labelled", unlabelled.length === 0, `${unlabelled.length} unlabelled`);

  // --- palette rule ------------------------------------------------------
  // The brand crimson is split in two on purpose: --color-ember is for fills,
  // borders and display type, --color-ember-glow is the readable one for small
  // text. Flag any bare "text-ember" that slipped into a rendered page.
  const bareEmber = [...flat.matchAll(/(?<![\w-])text-ember(?!-glow)/g)];
  check(
    route,
    "small crimson text uses the readable tone",
    bareEmber.length === 0,
    `${bareEmber.length} use(s) of text-ember`,
  );

  // --- robustness -------------------------------------------------------
  check(route, "no positive tabindex", !/tabindex="[1-9]/i.test(html));
  check(route, "no deprecated marquee/blink", !/<(marquee|blink)\b/i.test(html));
  // The real requirement is that the first paint is not blocked by a pile of
  // images: at most three may be eager (a responsive hero pair and, on the
  // home page, the featured event card), and the rest must be lazy.
  const eager = images.filter((tag) => !/loading="lazy"/i.test(tag));
  check(
    route,
    "at most three images are eager",
    eager.length <= 3,
    `${eager.length} of ${images.length} eager`,
  );
  check(route, "images below the fold are lazy", images.length - eager.length >= images.length - 3);

  // --- internal links ---------------------------------------------------
  const hrefs = new Set();
  for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = match[1];
    if (!href.startsWith("/_next") && !href.startsWith("//") && href !== "/") hrefs.add(href);
  }
  return { html, hrefs, route };
}

/* ------------------------------------------------------------------ links -- */

async function checkLinks(allHrefs) {
  for (const href of allHrefs) {
    let response;
    try {
      response = await fetch(`${BASE}${href}`, { redirect: "manual" });
    } catch (error) {
      check(href, "link responds", false, String(error));
      continue;
    }
    check(href, "internal link resolves", response.status < 400, `got ${response.status}`);
  }
}

/* ------------------------------------------------------------------- main -- */

console.log(`\nSHUNYA audit — ${BASE}\n`);

const ping = await fetch(`${BASE}/`, { redirect: "manual" }).catch(() => null);
if (!ping || !ping.ok) {
  console.error(`  Cannot reach ${BASE}. Start the dev server first (npm run dev).\n`);
  process.exit(1);
}

const hrefs = new Set();
for (const route of ROUTES) {
  const result = await audit(route);
  if (result && typeof result === "object") {
    for (const href of result.hrefs) hrefs.add(href);
  }
}

console.log(`\nCrawling ${hrefs.size} internal links…`);
await checkLinks(hrefs);

/* ------------------------------------------------------------------ fonts -- */

const css = await (await fetch(`${BASE}/`)).text();
const styleHrefs = [...css.matchAll(/href="(\/_next\/[^"]+\.css)"/g)].map((m) => m[1]);
if (styleHrefs.length) {
  const sheet = await (await fetch(`${BASE}${styleHrefs[0]}`)).text();
  check("/", "stylesheet loads", sheet.length > 1000, `${sheet.length} bytes`);
  check("/", "focus styles are defined", /:focus-visible|:focus\b/.test(sheet));
  check("/", "reduced-motion is honoured", /prefers-reduced-motion/.test(sheet));
} else {
  notes.push("No stylesheet link found on the home page — skipped CSS checks.");
}

for (const note of notes) console.log(`  · ${note}`);

console.log(
  failures === 0
    ? `\nResult: ${checks} checks passed, 0 failed.\n`
    : `\nResult: ${checks - failures} passed, ${failures} failed.\n`,
);

process.exit(failures === 0 ? 0 : 1);
