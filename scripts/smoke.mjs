#!/usr/bin/env node
/**
 * SHUNYA smoke test.
 *
 * Exercises the public pages, the enquiry pipeline and the full studio CRUD
 * cycle against a running server, then cleans up after itself.
 *
 *   npm run dev            # in one terminal
 *   npm run smoke          # in another  (BASE_URL=http://localhost:3000)
 *
 * The checks are read-mostly: the only writes are a temporary event and
 * temporary enquiries, both removed before the script exits.
 */

import { readFileSync } from "node:fs";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const USER = process.env.SMOKE_USER ?? "shunya-admin";
const PASS = process.env.SMOKE_PASS ?? "shunya-demo";

let passed = 0;
let failed = 0;
let skipped = 0;
/** Set while the theme suite has the site on a temporary theme. */
let themeToRestore = null;
const failures = [];
const skips = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  \u001b[32m✓\u001b[0m ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  \u001b[31m✗\u001b[0m ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n\u001b[1m${title}\u001b[0m`);
}

/**
 * A check that cannot run because the enquiry rate limiter is still counting
 * earlier runs is reported loudly and does not fail the suite — the limiter
 * working correctly is not a regression. Restart the server (in-memory buckets
 * reset) or wait out the window for a full run.
 */
function skip(name, reason) {
  skipped += 1;
  skips.push(`${name} — ${reason}`);
  console.log(`  \u001b[33m•\u001b[0m ${name} \u001b[33mSKIPPED\u001b[0m (${reason})`);
}

/** Cookie jar — the admin session is a plain cookie, no browser needed. */
const jar = new Map();

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function request(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (jar.size) headers.cookie = cookieHeader();
  if (options.json !== undefined) {
    headers["content-type"] = "application/json";
    options.body = JSON.stringify(options.json);
  }

  const response = await fetch(`${BASE}${path}`, { ...options, headers, redirect: "manual" });

  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const raw of setCookie) {
    const [pair] = raw.split(";");
    const index = pair.indexOf("=");
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (value === "") jar.delete(name);
    else jar.set(name, value);
  }
  return response;
}

const json = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

/**
 * The canvas colour a theme declares in the stylesheet. The default theme is
 * the palette in `@theme`; every other theme is read out of its own
 * `html[data-theme]` block. Used to check that the manifest and the browser
 * chrome follow whichever theme the studio has published, rather than the
 * default.
 */
const stylesheet = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function canvasFor(theme) {
  // The attribute must be followed by its own selector list or block — a
  // scoped override such as `html[data-theme="triptych"] .arch-top { … }`
  // is not a palette.
  const published = (stylesheet.match(
    new RegExp(
      `html\\[data-theme="${theme}"\\]\\s*(?=[,{])[^{]*\\{([\\s\\S]*?)\\}`,
    ),
  ) ?? [])[1];
  // No published block means this is the default: its values live in @theme,
  // which runs from the first `@theme` to the first preview block.
  const source =
    published ??
    stylesheet.slice(
      stylesheet.indexOf("@theme"),
      stylesheet.indexOf("[data-theme-preview=", stylesheet.indexOf("@theme")),
    );
  return (source ?? "").match(/--color-void:\s*(#[0-9a-fA-F]{6})/)?.[1];
}

/* -------------------------------------------------------------------------- */

async function publicPages() {
  section("Public pages");

  const routes = [
    ["/", "home"],
    ["/events", "events listing"],
    ["/gallery", "gallery"],
    ["/contact", "contact & booking"],
    ["/about", "about"],
    ["/private-experiences", "private experiences"],
    ["/robots.txt", "robots.txt"],
    ["/sitemap.xml", "sitemap.xml"],
    ["/manifest.webmanifest", "web app manifest"],
  ];

  for (const [path, label] of routes) {
    const response = await request(path);
    check(`${label} responds 200`, response.status === 200, `got ${response.status}`);
  }

  const home = await (await request("/")).text();
  check("hero headline present", home.includes("From Shoonya"));
  check("hero supporting line present", home.includes("bring people together"));
  check("hero CTAs present", home.includes("Explore Events") && home.includes("Plan your experience"));
  check("hero spreads the wordmark across the frame", home.includes("type-spread"));
  const eventsHeaderHtml = await (await request("/events")).text();
  check(
    "page headers carry the section index bar",
    // React separates adjacent text nodes with comment markers in SSR output.
    eventsHeaderHtml.replace(/<!--.*?-->/g, "").includes("03 / 06"),
  );

  // Brand assets: the identity is the wordmark, so it must be served, and the
  // app icon must exist for installs.
  const wordmark = await request("/brand/shunya-logo.svg");
  check(
    "brand wordmark is served and names the brand",
    wordmark.status === 200 && (await wordmark.text()).includes("SHUNYA"),
  );
  const icon = await request("/brand/icon-192.png");
  check(
    "app icon is served as a PNG",
    icon.status === 200 && (icon.headers.get("content-type") ?? "").includes("image/png"),
  );
  check("no fabricated contact details leaked", !/\+91\s?[6-9]\d{9}/.test(home));

  const headers = (await request("/")).headers;
  check(
    "HSTS header set",
    (headers.get("strict-transport-security") ?? "").includes("max-age="),
  );
  check("X-Content-Type-Options set", headers.get("x-content-type-options") === "nosniff");
  check("no x-powered-by leak", headers.get("x-powered-by") === null);

  const missing = await request("/events/this-slug-does-not-exist");
  check("unknown event returns 404", missing.status === 404, `got ${missing.status}`);

  // Structured data: the site-level pair on every page, plus page-specific
  // schema that search engines rely on.
  const eventsHtml = await (await request("/events")).text();
  check("events listing emits ItemList schema", eventsHtml.includes('"@type":"ItemList"'));
  check("events listing emits breadcrumbs", eventsHtml.includes('"@type":"BreadcrumbList"'));

  const privateHtml = await (await request("/private-experiences")).text();
  check("private experiences emits Service schema", privateHtml.includes('"@type":"Service"'));
  check(
    "private experiences publishes no invented pricing",
    !/"priceCurrency"|"price":/.test(privateHtml),
  );

  // The published theme is server-rendered onto <html>, and the manifest and
  // the theme-color meta have to follow the *published* palette rather than the
  // default one in @theme — so the canvas colour is read back out of the
  // stylesheet for whichever theme the home page says is live.
  const themedHtml = await (await request("/")).text();
  const liveTheme = (themedHtml.match(/data-theme="([a-z-]+)"/) ?? [])[1];
  check("the published theme is rendered onto <html>", Boolean(liveTheme), "no data-theme attribute");
  check(
    "the theme is served without JavaScript",
    /<html[^>]*data-theme="[a-z-]+"/.test(themedHtml),
    "the attribute should be in the server HTML, not added by a script",
  );

  const canvasHex = liveTheme ? canvasFor(liveTheme) : undefined;
  check(
    "the published theme declares a canvas colour",
    Boolean(canvasHex),
    `no --color-void found for ${liveTheme ?? "an unknown theme"}`,
  );

  const manifest = await (await request("/manifest.webmanifest")).json();
  check("manifest declares brand icons", Array.isArray(manifest.icons) && manifest.icons.length >= 3);
  check(
    "manifest background matches the live theme",
    Boolean(canvasHex) && manifest.background_color === canvasHex,
    `theme ${liveTheme} (${canvasHex ?? "missing"}) vs manifest ${manifest.background_color}`,
  );
  check("manifest theme colour matches the live theme", manifest.theme_color === canvasHex);
  check(
    "the browser chrome colour matches the live theme",
    themedHtml.includes(`<meta name="theme-color" content="${canvasHex}"`) ||
      themedHtml.includes(`content="${canvasHex}"`),
    `expected ${canvasHex}`,
  );

  // Health probe.
  const health = await request("/api/health");
  const healthBody = await json(health);
  check("health endpoint reports ready", health.status === 200 && healthBody.ok === true);
  check(
    "health reports the content store as readable",
    healthBody.contentStore === "readable",
  );
  check(
    "health leaks no enquiry payloads",
    JSON.stringify(healthBody).includes("enquiries") &&
      !JSON.stringify(healthBody).includes("message"),
  );
}

async function enquiryPipeline() {
  section("Enquiry pipeline");

  const valid = await request("/api/enquiries", {
    method: "POST",
    json: {
      type: "private-experience",
      name: "Smoke Test",
      email: "smoke@example.com",
      phone: "+919000000000",
      eventType: "Birthday Celebration",
      eventDate: "2027-01-20",
      location: "Pimpri",
      guestCount: "25 – 75",
      budgetRange: "Prefer to discuss",
      message: "Automated smoke test enquiry — removed at the end of the run.",
      source: "smoke-test",
    },
  });
  const created = await json(valid);
  if (valid.status === 429) {
    skip("valid enquiry accepted", "enquiry rate limit reached");
    skip("enquiry returns a reference id", "enquiry rate limit reached");
    skip("invalid enquiry rejected", "enquiry rate limit reached");
    skip("field-level errors returned", "enquiry rate limit reached");
    skip("honeypot submission rejected", "enquiry rate limit reached");
    return null;
  }
  check("valid enquiry accepted (201)", valid.status === 201, `got ${valid.status}`);
  check("enquiry returns a reference id", typeof created.id === "string" && created.id.length > 0);

  const invalid = await request("/api/enquiries", {
    method: "POST",
    json: { type: "general", name: "", email: "not-an-email", message: "hi" },
  });
  const invalidBody = await json(invalid);
  if (invalid.status === 429) {
    skip("invalid enquiry rejected", "enquiry rate limit reached");
    skip("field-level errors returned", "enquiry rate limit reached");
  } else {
    check("invalid enquiry rejected (422)", invalid.status === 422, `got ${invalid.status}`);
    check(
      "field-level errors returned",
      Boolean(invalidBody.fields?.name && invalidBody.fields?.email && invalidBody.fields?.message),
    );
  }

  const honeypot = await request("/api/enquiries", {
    method: "POST",
    json: {
      type: "general",
      name: "Bot",
      email: "bot@example.com",
      message: "definitely not spam, buy things",
      website: "http://spam.example",
    },
  });
  if (honeypot.status === 429) {
    skip("honeypot submission rejected", "enquiry rate limit reached");
  } else {
    check("honeypot submission rejected", honeypot.status === 422, `got ${honeypot.status}`);
  }

  return created.id;
}

/** Returns false when sign-in is unavailable, so dependent suites can skip. */
async function studio() {
  section("Studio authentication");

  const denied = await request("/api/admin/events");
  check("admin API rejects anonymous access", denied.status === 401, `got ${denied.status}`);

  const deniedDuplicate = await request("/api/admin/events/evt_anything/duplicate", {
    method: "POST",
  });
  check(
    "anonymous event duplicate refused",
    deniedDuplicate.status === 401,
    `got ${deniedDuplicate.status}`,
  );

  const deniedExport = await request("/api/admin/enquiries/export");
  check(
    "anonymous enquiry export refused",
    deniedExport.status === 401,
    `got ${deniedExport.status}`,
  );

  const badLogin = await request("/api/admin/session", {
    method: "POST",
    json: { username: USER, password: "definitely-the-wrong-password" },
  });
  if (badLogin.status === 429) {
    skip("wrong password rejected", "sign-in throttle active");
  } else {
    check("wrong password rejected (401)", badLogin.status === 401, `got ${badLogin.status}`);
  }

  const login = await request("/api/admin/session", {
    method: "POST",
    json: { username: USER, password: PASS },
  });

  if (login.status === 429) {
    skip("sign-in succeeds", "sign-in throttle active");
    skip("session cookie issued", "sign-in throttle active");
    skip("session cookie is HttpOnly", "sign-in throttle active");
    skip("studio shell renders when signed in", "sign-in throttle active");
    skip("public footer is not rendered inside the studio", "sign-in throttle active");
    return false;
  }

  check("sign-in succeeds", login.status === 200, `got ${login.status}`);

  const exportResponse = await request("/api/admin/enquiries/export");
  const exportBody = await exportResponse.text();
  check(
    "enquiry CSV export is served to the studio",
    exportResponse.status === 200 &&
      (exportResponse.headers.get("content-type") ?? "").includes("text/csv") &&
      exportBody.split("\r\n")[0].startsWith("Reference,Received,Status"),
    `got ${exportResponse.status}`,
  );
  check(
    "enquiry CSV export is never cached",
    exportResponse.headers.get("cache-control") === "no-store",
    exportResponse.headers.get("cache-control") ?? "no header",
  );

  check("session cookie issued", jar.has("shunya_admin"));
  check(
    "session cookie is HttpOnly",
    (login.headers.getSetCookie?.() ?? []).some((c) => /httponly/i.test(c)),
  );

  const admin = await request("/admin");
  const adminHtml = await admin.text();
  check("studio shell renders when signed in", admin.status === 200);
  check("public footer is not rendered inside the studio", !adminHtml.includes("Studio (Admin)"));

  return jar.has("shunya_admin");
}

async function eventCrud() {
  section("Event management");

  const payload = {
    title: "SMOKE TEST — DELETE ME",
    subtitle: "Automated check",
    category: "Electronic Music",
    status: "published",
    featured: false,
    startDate: "2027-03-12T14:30:00.000Z",
    timezoneLabel: "IST (UTC+5:30)",
    venue: "Venue to be confirmed",
    city: "City to be confirmed",
    shortDescription: "Temporary listing created by the smoke test.",
    description:
      "Temporary description created by the smoke test to verify the event CRUD cycle end to end. It is deleted before the script exits.",
    lineup: [{ name: "To be announced", role: "Headline", time: "" }],
    poster: "/media/gallery-11.jpg",
    ticketPrice: "TBA",
    ticketUrl: "#",
    faqs: [{ q: "Is this real?", a: "No — it is a temporary automated listing." }],
  };

  const created = await request("/api/admin/events", { method: "POST", json: payload });
  const { event } = await json(created);
  check("event created (201)", created.status === 201, `got ${created.status}`);
  check("slug generated", typeof event?.slug === "string" && event.slug.startsWith("smoke-test"));
  if (!event?.id) return null;

  const publicPage = await request(`/events/${event.slug}`);
  check("published event has a public page", publicPage.status === 200, `got ${publicPage.status}`);
  const pageHtml = await publicPage.text();
  check("event page carries Event structured data", pageHtml.includes('"@type":"Event"'));
  check("ticket CTA is disabled while price is TBA", pageHtml.includes("Tickets not on sale yet"));

  const invalid = await request("/api/admin/events", { method: "POST", json: { title: "x" } });
  check("incomplete event rejected (422)", invalid.status === 422, `got ${invalid.status}`);

  const drafted = await request(`/api/admin/events/${event.id}`, {
    method: "PATCH",
    json: { ...payload, status: "draft" },
  });
  check("event set back to draft", drafted.status === 200, `got ${drafted.status}`);
  const hidden = await request(`/events/${event.slug}`);
  check("draft event is not public (404)", hidden.status === 404, `got ${hidden.status}`);

  // Duplicating starts the next edition: a copy of the details, always a draft,
  // never reachable on the public site until someone publishes it on purpose.
  const duplicated = await request(`/api/admin/events/${event.id}/duplicate`, { method: "POST" });
  const { event: copy } = await json(duplicated);
  check(
    "event can be duplicated",
    duplicated.status === 201 && Boolean(copy?.id),
    `got ${duplicated.status}`,
  );
  check(
    "the duplicate lands as a draft",
    copy?.status === "draft" && copy?.featured === false,
    `status ${copy?.status}`,
  );
  check(
    "the duplicate copies the details under a new identity",
    copy?.id !== event.id &&
      copy?.slug === `${event.slug}-copy` &&
      (copy?.faqs?.length ?? 0) === payload.faqs.length,
    `slug ${copy?.slug}`,
  );
  if (copy?.slug) {
    const copyPage = await request(`/events/${copy.slug}`);
    check("a draft duplicate is not public", copyPage.status === 404, `got ${copyPage.status}`);
  } else {
    skip("a draft duplicate is not public", "no duplicate was created");
  }
  if (copy?.id) {
    const dropped = await request(`/api/admin/events/${copy.id}`, { method: "DELETE" });
    check("duplicate removed after the check", dropped.status === 200, `got ${dropped.status}`);
  }

  return event.id;
}

/**
 * Proves the studio's theme control really reaches visitors: switch away from
 * the published theme, read the public page back, then put it back. The theme
 * is restored even if a check throws — a smoke run must never leave the site
 * wearing a different look than the one it was given.
 */
async function themeSwitching() {
  section("Site theme");

  const before = await request("/api/admin/settings");
  const { settings: current } = await json(before);
  const original = current?.theme;
  check("the studio can read the published theme", typeof original === "string", String(original));

  themeToRestore = typeof original === "string" ? original : "dusk";

  // Deliberately not through request(): that helper attaches the session jar,
  // which would make this look authenticated when it must not be.
  const denied = await fetch(`${BASE}/api/admin/settings`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ theme: "moon" }),
    redirect: "manual",
  });
  check(
    "the theme cannot be changed without a session",
    denied.status === 401,
    `got ${denied.status}`,
  );

  const bogus = await request("/api/admin/settings", {
    method: "PATCH",
    json: { theme: "not-a-theme" },
  });
  check("an unknown theme is rejected (422)", bogus.status === 422, `got ${bogus.status}`);

  const target = original === "moon" ? "void" : "moon";
  const changed = await request("/api/admin/settings", {
    method: "PATCH",
    json: { theme: target },
  });
  const changedBody = await json(changed);
  check("the theme can be published", changed.status === 200, `got ${changed.status}`);
  check("the studio reports the new theme", changedBody.settings?.theme === target);

  // The point of the feature: a reload — nothing else — shows the new theme.
  const html = await (await request("/")).text();
  check(
    "the public page serves the new theme",
    html.includes(`data-theme="${target}"`),
    `expected data-theme="${target}"`,
  );
  const targetCanvas = canvasFor(target);
  const manifest = await (await request("/manifest.webmanifest")).json();
  check(
    "the manifest follows the new theme",
    Boolean(targetCanvas) && manifest.theme_color === targetCanvas,
    `${target} should be ${targetCanvas}, manifest says ${manifest.theme_color}`,
  );

  const restored = await request("/api/admin/settings", {
    method: "PATCH",
    json: { theme: themeToRestore },
  });
  check("the original theme is restored", restored.status === 200, `got ${restored.status}`);

  const back = await (await request("/")).text();
  check(
    "the site is back on the published theme",
    back.includes(`data-theme="${themeToRestore}"`),
    `expected data-theme="${themeToRestore}"`,
  );

  themeToRestore = null;
}

async function galleryAndSettings() {
  section("Gallery, settings and account");

  const list = await request("/api/admin/gallery");
  const { gallery } = await json(list);
  check("gallery listing available to the studio", Array.isArray(gallery) && gallery.length > 0);

  const first = gallery?.[0];
  if (first) {
    const hidden = await request(`/api/admin/gallery/${first.id}`, {
      method: "PATCH",
      json: { published: false },
    });
    check("frame can be unpublished", hidden.status === 200, `got ${hidden.status}`);
    const restored = await request(`/api/admin/gallery/${first.id}`, {
      method: "PATCH",
      json: { published: true },
    });
    check("frame can be republished", restored.status === 200, `got ${restored.status}`);
  }

  const badEmail = await request("/api/admin/settings", {
    method: "PATCH",
    json: { contactEmail: "not-an-email" },
  });
  check("invalid contact email rejected", badEmail.status === 422, `got ${badEmail.status}`);

  const okSettings = await request("/api/admin/settings", {
    method: "PATCH",
    json: { tagline: "From Shoonya, Everything Begins." },
  });
  check("settings update accepted", okSettings.status === 200, `got ${okSettings.status}`);

  const badUpload = await request("/api/admin/upload", {
    method: "POST",
    json: { fileName: "not-an-image.txt", dataUrl: "data:text/plain;base64,aGVsbG8=" },
  });
  check("non-image upload rejected", badUpload.status === 415, `got ${badUpload.status}`);

  const wrongCurrent = await request("/api/admin/password", {
    method: "POST",
    json: { currentPassword: "wrong", username: USER, newPassword: "a-long-enough-password" },
  });
  check(
    "password change requires the current password",
    wrongCurrent.status === 401,
    `got ${wrongCurrent.status}`,
  );
}

/** Remove everything the run created, so the studio is left exactly as found. */
async function cleanup(eventId, enquiryId, authed) {
  section("Cleanup");

  if (themeToRestore) {
    const restored = await request("/api/admin/settings", {
      method: "PATCH",
      json: { theme: themeToRestore },
    });
    check("temporary theme reverted", restored.status === 200, `got ${restored.status}`);
    themeToRestore = null;
  }

  if (!authed) {
    skip("temporary data cleanup", "no studio session this run");
    console.log(
      "\n\u001b[33mNo studio session — check the inbox in /admin for any SMOKE TEST\n" +
        "entries and remove them once the throttle window has passed.\u001b[0m",
    );
    return;
  }

  if (eventId) {
    const removed = await request(`/api/admin/events/${eventId}`, { method: "DELETE" });
    check("temporary event deleted", removed.status === 200, `got ${removed.status}`);
  }

  const inbox = await request("/api/admin/enquiries");
  const { enquiries } = await json(inbox);

  // Durable invariant: the inbox must always answer with a list to a signed-in
  // admin. This is what a vacuous cleanup check hid earlier.
  check(
    "inbox endpoint returns a list to the studio",
    inbox.status === 200 && Array.isArray(enquiries),
    `got ${inbox.status}`,
  );

  const all = enquiries ?? [];

  if (!enquiryId) {
    // Nothing was created this run (the enquiry budget was already spent), so
    // there is nothing to remove — but say so rather than passing silently.
    skip("temporary enquiries deleted", "no enquiry was created this run");
  } else {
    const testOnes = all.filter(
      (item) => item.id === enquiryId || item.source === "smoke-test" || item.name === "Smoke Test",
    );

    check(
      "inbox lists the enquiry this run created",
      testOnes.some((item) => item.id === enquiryId),
      `created ${enquiryId}, found ${testOnes.length} matching`,
    );

    let removedCount = 0;
    for (const item of testOnes) {
      const response = await request(`/api/admin/enquiries/${item.id}`, { method: "DELETE" });
      if (response.status === 200) removedCount += 1;
    }
    check(
      "temporary enquiries deleted",
      removedCount === testOnes.length && testOnes.length > 0,
      `${removedCount}/${testOnes.length}`,
    );
  }

  const after = await request("/api/admin/enquiries");
  const remaining = (await json(after)).enquiries ?? [];
  check(
    "inbox is clean after the run",
    remaining.every((item) => item.source !== "smoke-test" && item.name !== "Smoke Test"),
    `${remaining.length} enquiries left`,
  );

  await request("/api/admin/session", { method: "DELETE" });
  check("signed out", !jar.has("shunya_admin"));
}

/* -------------------------------------------------------------------------- */

console.log(`\u001b[1mSHUNYA smoke test\u001b[0m → ${BASE}`);

let eventId = null;
let enquiryId = null;
let authed = false;

try {
  const ping = await fetch(`${BASE}/`, { redirect: "manual" });
  if (!ping.ok && ping.status !== 404) throw new Error(`status ${ping.status}`);
} catch (error) {
  console.error(
    `\n\u001b[31mCannot reach ${BASE}\u001b[0m (${error.message}).\n` +
      `Start the site first:  npm run dev\n`,
  );
  process.exit(1);
}

try {
  await publicPages();
  enquiryId = await enquiryPipeline();

  authed = await studio();
  if (authed) {
    eventId = await eventCrud();
    await themeSwitching();
    await galleryAndSettings();
  } else {
    skip("event management suite", "no studio session");
    skip("gallery, settings and account suite", "no studio session");
  }
} catch (error) {
  console.error(`\n\u001b[31mUnexpected failure:\u001b[0m ${error.stack ?? error.message}`);
  failed += 1;
  failures.push("unexpected exception");
} finally {
  try {
    await cleanup(eventId, enquiryId, authed);
  } catch (error) {
    console.error(`Cleanup failed: ${error.message}`);
  }
}

console.log(
  `\n\u001b[1mResult:\u001b[0m ${passed} passed, ${failed} failed` +
    (skipped ? `, ${skipped} skipped` : "") +
    (failures.length ? `\n\u001b[31m${failures.join("\n")}\u001b[0m` : "") +
    (skips.length
      ? `\n\u001b[33m${skips.join("\n")}\u001b[0m\n` +
        `\u001b[33mRestart the server or wait out the window for a complete run.\u001b[0m`
      : ""),
);

process.exit(failed === 0 ? 0 : 1);
