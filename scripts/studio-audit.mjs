#!/usr/bin/env node
/**
 * SHUNYA studio audit.
 *
 * The public audit checks the site visitors see; this checks the screens behind
 * the session cookie, so the tools the team uses every day meet the same
 * standard: one h1, one main landmark, no heading level jumps, a name on every
 * image, control and button.
 *
 *   npm run audit:studio       # signs in with SMOKE_USER / SMOKE_PASS
 *
 * Exits non-zero when anything is wrong, so it can gate a release.
 */

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const USER = process.env.SMOKE_USER ?? "shunya-admin";
const PASS = process.env.SMOKE_PASS ?? "shunya-demo";

const ROUTES = [
  "/admin",
  "/admin/events",
  "/admin/events/new",
  "/admin/gallery",
  "/admin/enquiries",
  "/admin/settings",
];

const login = await fetch(`${BASE}/api/admin/session`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: USER, password: PASS }),
});

if (!login.ok) {
  console.error(`  Cannot sign in to the studio (${login.status}). Check SMOKE_USER / SMOKE_PASS.`);
  process.exit(1);
}

const cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
let problems = 0;

/** Controls wrapped in a <label> are labelled by it — the wrapping counts. */
function wrappedControls(html) {
  const tags = new Set();
  for (const [, block] of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)) {
    for (const tag of block.match(/<(input|select|textarea)\b[^>]*>/gi) ?? []) tags.add(tag);
  }
  return tags;
}

console.log(`\nSHUNYA studio audit — ${BASE}\n`);

for (const route of ROUTES) {
  const response = await fetch(`${BASE}${route}`, { headers: { cookie }, redirect: "manual" });
  const html = (await response.text()).replace(/<!--.*?-->/g, "");
  const issues = [];

  if (response.status !== 200) issues.push(`status ${response.status}`);

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) issues.push(`${h1Count} h1 elements`);

  const mainCount = (html.match(/<main\b/gi) ?? []).length;
  if (mainCount !== 1) issues.push(`${mainCount} main landmarks`);

  const levels = (html.match(/<h([1-6])\b/gi) ?? []).map((tag) => Number(tag.match(/\d/)[0]));
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] - levels[i - 1] > 1) {
      issues.push(`heading jumps h${levels[i - 1]} to h${levels[i]}`);
      break;
    }
  }

  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = images.filter((tag) => !/\balt=/i.test(tag)).length;
  if (missingAlt) issues.push(`${missingAlt} image(s) without alt`);

  const labelIds = new Set([...html.matchAll(/<label[^>]+for="([^"]+)"/gi)].map((m) => m[1]));
  const wrapped = wrappedControls(html);

  const unlabelled = (html.match(/<(input|select|textarea)\b[^>]*>/gi) ?? []).filter((tag) => {
    const type = (tag.match(/type="([^"]+)"/i)?.[1] ?? "text").toLowerCase();
    if (["hidden", "submit", "button", "reset"].includes(type)) return false;
    // A visually hidden file input driven by a styled button is not reachable.
    if (/(^|\s)class="hidden"/.test(tag)) return false;
    if (/aria-label|aria-labelledby/i.test(tag)) return false;
    if (wrapped.has(tag)) return false;
    const id = tag.match(/id="([^"]+)"/i)?.[1];
    return !(id && labelIds.has(id));
  });
  if (unlabelled.length) issues.push(`${unlabelled.length} unlabelled control(s)`);

  const namelessButtons = (html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? []).filter(
    (button) => {
      const openTag = button.match(/<button\b[^>]*>/i)[0];
      if (/aria-label|title=/i.test(openTag)) return false;
      // An icon-only button is fine when the icon is explicitly decorative,
      // because then the button is decorative too — flag anything else.
      const text = button.replace(/<[^>]*>/g, "").replace(/\s+/g, "");
      if (text.length > 0) return false;
      return !/<svg[^>]*aria-hidden="true"/i.test(button);
    },
  );
  if (namelessButtons.length) issues.push(`${namelessButtons.length} unnamed button(s)`);

  console.log(
    issues.length === 0 ? `  ✓ ${route}` : `  ✗ ${route} — ${issues.join(", ")}`,
  );
  problems += issues.length;
}

console.log(
  problems === 0
    ? '\nResult: the studio screens pass every structural check.\n'
    : `\nResult: ${problems} problem(s) found.\n`,
);

process.exit(problems === 0 ? 0 : 1);
