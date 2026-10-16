# SHUNYA
# SHUNYA — From Shoonya, Everything Begins.

A complete, cinematic, mobile-first website for **SHUNYA**, an independent event and electronic
music experiences brand. Built to feel like a premium underground collective rather than a generic
event-management template: black and charcoal rooms, full-screen film, oversized display type,
scroll-driven chapters, and a real content studio behind it.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local     # optional: fill in real contact details
npm run dev                    # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start # serves on http://0.0.0.0:3000
```

Verification (run the site first, then point the smoke test at it):

```bash
npm run typecheck              # TypeScript, no emit
npm run smoke                  # 86 checks: pages, SEO + schema, manifest, health, enquiries, themes, studio CRUD
npm run audit                  # 218 checks: accessibility, metadata, headings, landmarks, palette rules, link health
npm run audit:studio           # the signed-in studio screens, same structural standards
npm run check:themes           # every theme's palette: completeness, contrast floors, frames, chrome colour
npm run check:sun              # the movable sun in the hero: slider semantics and wiring
BASE_URL=https://staging.example npm run smoke
BASE_URL=https://staging.example npm run audit
BASE_URL=https://staging.example npm run audit:studio
```

The smoke test creates one temporary event and one temporary enquiry, publishes a temporary
theme for the length of one check, then deletes, reverts and signs out — it leaves the studio
exactly as it found it.

The site runs with **zero external services**. Content is stored in `data/shunya.json`, which is
created automatically from the seed templates on first run.

### Documentation

- **`docs/BRAND-GUIDE.md`** — plain-language guide for whoever runs SHUNYA's content:
  adding events, uploading photographs, answering enquiries, changing contact details.
- **`README.md`** (this file) — setup, deployment, security and the technical handover.

### Studio (admin) access

| | |
|---|---|
| URL | `/admin` |
| Username | `shunya-admin` |
| Password | `shunya-demo` |

> ⚠️ These are **development credentials** and are printed on the sign-in screen.
> Open **Studio → Settings → Studio credentials** and replace both before launch
> (minimum 10 characters; scrypt-hashed, never stored in plain text).

---

## 2. Pages

| Route | Purpose |
|---|---|
| `/` | Cinematic hero film, brand intro, three chapters (sound / space / people), services, upcoming events, past-event gallery strip, private enquiry, final contact |
| `/about` | Story, positioning, four principles, process, FAQ |
| `/events` | Listing with URL-driven filters (timeframe, category, city) |
| `/events/[slug]` | Event detail: description, date & time, venue, lineup, poster, ticket price, booking link, event FAQs, countdown, calendar export, related events |
| `/private-experiences` | Six experience formats, production scope, process, mood board, full booking form, FAQ |
| `/gallery` | Masonry archive with filters and a keyboard-accessible lightbox |
| `/contact` | Five enquiry routes — private bookings, artist collaborations, brand partnerships, sponsorships, general — plus direct WhatsApp / email / Instagram channels |
| `/admin/**` | SHUNYA Studio: dashboard, events CRUD, gallery manager, enquiry inbox, settings & credentials |

Extras: a branded 404 inside the public chrome, a root 404 fallback, and a route-level error
boundary (`error.tsx`) with a retry action and an error digest for the hosting logs.

SEO plumbing: `sitemap.xml` (dynamic, includes events), `robots.txt` (studio and API excluded),
canonical URLs, Open Graph + Twitter cards, a web app manifest, and JSON-LD schema — `Organization`
and `WebSite` site-wide, plus `Event`, `ItemList` (the event calendar as a set), `Service` with an
`OfferCatalog` (private experience formats, deliberately with no published pricing) and
`BreadcrumbList` on every interior page. Structured data is built in `src/lib/seo.ts` and rendered
through `src/components/JsonLd.tsx`, so every page emits it the same way.

---

## 3. The studio (CMS)

Everything public is editable without touching code:

- **Events** — create, edit, publish/unpublish, feature, delete. Poster + hero upload, lineup
  repeater, FAQ repeater, ticket price and booking link (`#` keeps tickets disabled until real).
- **Gallery** — add frames, upload or paste images, write alt text, hide or delete.
- **Enquiries** — every submission with a reference number, status (new / read / archived), reply
  shortcuts by email and WhatsApp, delete.
- **Theme** — three complete looks (Dusk, Moon, Void); pick one, preview it on your own screen,
  then publish it for everyone. See [Themes](#8-themes).
- **Settings** — contact email, phone, WhatsApp number, Instagram, hero frame URL and credit line,
  plus studio credential rotation.

Public pages render from the live store (`export const dynamic = "force-dynamic"`), so a save in the
studio appears on the website immediately.

### Content storage

| Path | Contents |
|---|---|
| `data/shunya.json` | Events, gallery, enquiries, settings, admin account |
| `public/uploads/*` | Images uploaded through the studio |

Both are git-ignored. Set `DATA_DIR` to a mounted volume in production so content survives
redeploys, and back up that JSON file plus the uploads folder — that pair is the entire content set.
On a read-only host, paste external image URLs instead of uploading.

---

## 4. Environment variables

See `.env.example`. All are optional; the site ships with clearly-labelled placeholders.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for metadata, sitemap and structured data |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `_PHONE` | Seeded contact placeholders |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number, digits only (`910000000000`) — powers every WhatsApp link |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Instagram profile |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID; omit to load no third-party scripts at all |
| `ENQUIRY_WEBHOOK_URL` | Optional forward target (Formspree / Basin / Resend / CRM) |
| `ADMIN_TOKEN` | HMAC secret for the admin session cookie — **change this** |
| `DATA_DIR` | Content directory (defaults to `./data`) |
| `ENQUIRY_RATE_LIMIT` / `_WINDOW_MINUTES` | Enquiries accepted per IP (default 12 per 10 min) |
| `LOGIN_RATE_LIMIT` / `_WINDOW_MINUTES` | *Failed* studio sign-ins tolerated per IP (default 8 per 15 min) |

---

## 5. Enquiry pipeline

Every form on the site (homepage, private experiences, contact) posts to `POST /api/enquiries`:

1. Server-side validation, honeypot check and rate limiting (12 submissions / 10 min / IP by
   default, tunable via `ENQUIRY_RATE_LIMIT`).
2. Stored in the studio inbox with an ID; the visitor receives a reference number.
3. Optionally forwarded to `ENQUIRY_WEBHOOK_URL`.
   The studio can also pull every enquiry out as a spreadsheet:
   `GET /api/admin/enquiries/export` returns RFC 4180 CSV (BOM included so Excel
   reads it cleanly), authenticated and never cached.
4. Success state offers a WhatsApp continuation pre-filled with the enquiry summary.

Forms request: name, contact, event type, date, location, guest count, budget range and description —
exactly the brief for private bookings. Budget bands ship as labelled placeholders until SHUNYA
confirms real ranges.

## 6. Operations

- **Health probe:** `GET /api/health` reads the content store and returns counts plus which contact
  details are still placeholders — point an uptime monitor at it. A `503` means the studio's storage
  is unreachable. It exposes no secrets and no enquiry payloads, only counts.
- **App icons:** `public/brand/*.png` are generated by `node scripts/generate-icons.mjs` (no image
  dependencies — it encodes the PNGs directly). The icon is the "S" letterform taken from the
  wordmark, drawn on the blue-black canvas; re-run the script if that letterform changes.
- **Advertising the site:** a web app manifest lets the team install the studio to a phone home
  screen, with shortcuts straight to Events, Private Experiences and the enquiry inbox.

## 7. No fabricated information

The build deliberately publishes nothing that the company has not confirmed:

- Event listings are templates titled `SHUNYA 01 — TBA`, with `Venue to be confirmed`,
  `TBA` pricing and inert ticket links.
- Lineup entries read `To be announced`; there are no invented performers or testimonials.
- Contact details, Instagram handle, address and budget bands are placeholder strings, each labelled
  as such in the UI and replaceable from the studio.
- Every placeholder visual carries a visible credit line stating it is development material to be
  replaced with licensed event photography.

---

## 8. Themes

The site ships **three complete looks**, and the studio decides which one the world sees — no
developer, no redeploy, no rebuild.

| Theme | What it is | Hero |
|---|---|---|
| **Dusk** *(default)* | Blue-hour sky, cream stone, one gold sun | Sunset frame with the sun visitors can drag |
| **Moon** | Near-black night, a single crimson moon, embers in the air | Crowd under lasers, crimson disc drifting above |
| **Void** | Monochrome: no colour anywhere | The empty hall with the colour taken out, perfectly still |

**How it works.** The choice is stored with the rest of the content and the root layout renders it
onto `<html data-theme="…">` **on the server**. Every visitor therefore gets the published theme on
their next page load — any device, signed in or not, JavaScript or not. Nothing is kept in a
cookie or `localStorage` and there is no flash of the previous theme while the page loads.

A theme is not only a palette. It also chooses the hero frame and framing, what moves over it
(`sun` / `particles` / `still`), and the browser chrome colour used by `<meta name="theme-color">`
and the web app manifest.

**Adding a fourth theme** means two edits: a palette block in `src/app/globals.css` (copy an
existing one and change the values) and an entry in `src/lib/themes.ts` (id, copy shown in the
studio, chrome colour, hero frame, atmosphere). `npm run check:themes` then holds you to it — it
fails on a missing palette token, a chrome colour that is not the theme's canvas, a missing hero
frame, a theme with no preview selector, or any pairing under its contrast floor (body type 12:1,
secondary 7:1, small type 4.5:1, accent fills 3:1 with a 4.5:1 label). The studio picker draws
each card from the theme's **own CSS block**, so a card can never advertise a colour the site
does not render.

**Colours are declared once.** Every themed utility reads `var(--color-…)`, and Tailwind emits its
opacity variants as `color-mix(…, var(--color-void) 90%, transparent)` behind an
`@supports (color: color-mix(…))` guard — which is what makes a runtime override re-theme the
whole page, gradients and translucent panels included. Browsers without `color-mix` support fall
back to the default theme's baked values.

---

## 9. Accessibility & performance

- Skip link, semantic landmarks, one `h1` per page, labelled form controls, `aria-invalid` /
  `aria-describedby` wiring, `role="status"` / `role="alert"` feedback, visible focus rings.
- Full keyboard support: mobile menu, lightbox (Esc / ← / →), FAQ accordion, filters.
- `prefers-reduced-motion` disables Lenis smooth scroll, hero video, the custom cursor and all
  entrance animations.
- **`npm run audit`** walks every public route plus the studio screen and the 404, then checks the
  things that can be verified from rendered HTML: one `main` landmark per page, exactly one `h1`,
  heading levels that never skip, an `alt` attribute on every image, an accessible name on every
  link and button, a label for every form control, a documented language, a canonical URL, Open
  Graph title and image, a zoomable viewport, no positive `tabindex`, and that every internal link
  on the site resolves. It also confirms the stylesheet defines focus styles and honours
  `prefers-reduced-motion`. It also enforces the palette rule that small crimson text is set in
  the readable tone, never the deep brand crimson. It exits non-zero on failure, so it can gate a
  release.
- Keyboard access was verified by inspection, not by automated browser run — the build environment
  has no browser. The index panel traps nothing and returns focus to its trigger on close, the
  lightbox supports Esc / ← / →, and the accordion and filters are native buttons and links.
- **`npm run audit:studio`** signs in with `SMOKE_USER` / `SMOKE_PASS` and runs the structural
  checks over the studio screens — dashboard, events list, event editor, gallery, inbox, settings —
  so the tools the team uses daily meet the same standard as the public pages.
- **What the audit cannot check:** colour contrast as it lands on a real screen, visible focus
  rings, screen-reader announcement order, and keyboard traps. Those need a browser and a human
  reviewer — run the audit, then walk the site with a keyboard before launch.
- Text contrast was measured rather than eyeballed. On the sunset canvas (`--color-void`
  `#0a1119`) the muted label colour `--color-ash` `#93a3b8` reads 6.5:1 and `--color-fog`
  `#bcc7d6` reads 11:1, so every small mono caption clears WCAG AA. The brand crimson is split in
  two on purpose: `--color-ember` `#c1272d` (3.4:1) is used for fills, borders and display-size
  type, while `--color-ember-glow` `#e8656a` (6.1:1) is the only crimson small text is set in.
  A smoke check reads the canvas token straight from `globals.css` and compares it with the
  manifest, so a re-theme can never silently drift from what the OS chrome reports.
- **The hero was measured, not eyeballed.** The photograph is a bright sunset, so the type over it
  is not left to chance: the layer stack (left, top and bottom scrims) was reproduced offline and
  the luminance behind every text region sampled, giving a worst case of **4.6:1** against the
  smallest mono caption — clear of AA — while the palace and sky on the right stay at full
  strength. The movable sun's corona is deliberately small at rest for the same reason, and grows
  as the sun is dragged.
- `color-scheme: dark` plus explicit styling for native date pickers, autofill and scrollbars, so
  no browser control renders as a light-mode rectangle on the black canvas.
- A `<noscript>` rule pins every animated block to its final visible state.
- Images are served as AVIF/WebP via `next/image` with long-lived immutable caching for `/media`.
- The hero frame is a still photograph, so nothing moves on its own behind the copy, and the only
  animated thing over it is **the sun** — which the visitor controls, and which is a labelled
  slider (`role="slider"`, arrow keys to nudge, Home/End to send it to the horizon or the bottom of
  the frame) so keyboard and screen-reader visitors get the same interaction. It publishes
  `--sun-travel` on the hero element and the grading overlays are multiplied by it: at rest that
  value is 0, so a visitor who never touches the sun sees the photograph exactly as shot.
- The photograph was cropped so that it contains **no sun disc of its own** — the only sun in the
  hero is the movable one, which is why dragging it away leaves no second sun behind. `npm run
  check:sun` asserts that contract, along with the slider semantics, the grab area and the
  corona.

## 10. Security

- HTTPS enforced with HSTS (`max-age=63072000; includeSubDomains; preload`) plus
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`.
- Admin session: HMAC-signed, `HttpOnly`, `SameSite=Lax`, `Secure` in production, 8-hour expiry.
  Only *failed* sign-in attempts count toward the lockout and a success clears the counter, so an
  attacker is throttled while a legitimate admin — or a team behind one office IP — never locks
  itself out.
- Passwords hashed with scrypt; password comparison and session checks use timing-safe equality.
- Every admin mutation re-checks the session server-side; uploads are MIME-, magic-number- and
  size-validated (8 MB) and renamed before being written.

---

## 11. Project structure

```
src/
  app/                 routes (public pages, /admin studio, API handlers, sitemap, robots)
  components/          shared chrome, motion primitives, home sections, events, gallery, forms
    admin/             studio UI (dashboard, event editor, gallery, inbox, settings, login)
  lib/                 site config & brand copy, theme registry, store, auth, validation, formatting, seed
scripts/
  smoke.mjs            end-to-end verification of pages, APIs, the theme switch and studio CRUD
  audit.mjs            accessibility and SEO audit of the rendered pages
  studio-audit.mjs     the same structural checks for the signed-in studio
  theme-check.mjs      palette completeness and contrast floors for every theme
  sun-check.mjs        contract check for the hero's movable sun
  generate-icons.mjs   dependency-free PNG app icons from the wordmark letterform
  generate-theme-art.mjs  the hero frames a theme needs, built from the source photography
public/
  media/               hero film, poster, chapter and gallery imagery
    events/            drop real event photography here (see its README)
  brand/               wordmark (SVG) + generated app icons
  uploads/             studio uploads (git-ignored)
data/shunya.json       content database (git-ignored, seeded on first run)
```

Brand copy, navigation, chapters, service descriptions, experience types, budget bands and contact
intents all live in **`src/lib/site.ts`** — one file for the brand team to edit.

---

## 12. Launch checklist

1. Replace placeholder contact details, WhatsApp number and Instagram URL (Studio → Settings, or
   `.env.local`), and publish the theme you want to launch with (Studio → Settings → Site theme).
2. Change the studio username and password.
3. Set `ADMIN_TOKEN` to a long random value and `NEXT_PUBLIC_SITE_URL` to the live domain.
4. Delete the placeholder event listings and create the real ones; add real posters.
5. Replace placeholder gallery frames with licensed event photography (drop the files in
   `public/media/events/` — see the README there for sizes and guidance), with meaningful alt text.
6. Point `DATA_DIR` at persistent storage and set up backups of `data/shunya.json` + `public/uploads`.
7. Add a GA4 measurement ID if analytics are required.
8. Serve over HTTPS (the HSTS header is already set) and submit `sitemap.xml` to search engines.
9. Run `npm run check:themes`, `npm run smoke`, `npm run audit` and `npm run audit:studio` against the live domain, then walk the site with a
   keyboard: tab through the index panel, the lightbox and the enquiry form, and confirm the focus
   ring is visible on every control.
