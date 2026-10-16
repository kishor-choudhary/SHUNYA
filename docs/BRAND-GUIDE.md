# SHUNYA — Brand & Content Guide

A plain-language guide for running the SHUNYA website. No code required.
Everything here happens in the **SHUNYA Studio** at `/admin`.

---

## 0. What the brand looks like

Worth knowing before you add anything, because every page is built on these four
decisions.

- **The name is the logo.** There is no symbol, badge or icon in the
  branding — just the word **SHUNYA**, set wide and large. The little "S" you
  see on a phone's home screen is simply the first letter of the wordmark,
  used because a browser tab needs a square image.
- **The colours depend on the theme.** There are three complete looks and
  you choose which one is live — see section 2. Out of the box the site wears
  **Dusk**: a deep blue-black background (the last blue of the sky rather than
  pure black), cream-white type, and the warm accents of a sunset — gold, amber
  and bougainvillea crimson. There are two crimsons: a deeper one for blocks,
  borders and very large headings, and a lighter, pinker one for small text and
  links, chosen so words stay readable against the dark background.
- **The sun moves — in the Dusk theme.** On the home page there is a real sun
  sitting in the sky over the lake. Visitors can drag it — with a finger, a
  mouse, or the arrow keys once they have tabbed to it — and the whole frame
  responds: the light drains out of the water, the sky deepens, and the sun's
  own glow swells. The corner label reads "Drag the sun" until someone does.
  Nothing else on the page moves by itself, and if a visitor never touches it
  the photograph looks exactly as it was taken. The **Moon** theme has drifting
  embers instead, and **Void** has nothing moving at all.
- **Two types of lettering.** Big headings and the brand name are set in a
  heavy, extra-wide sans-serif. Paragraphs of story-telling copy are set in an
  editorial serif (the elegant, book-like one). Small labels, dates, counters
  and buttons are always in a monospace style, which is what gives the site
  its technical, backstage feel.
- **Photographs do the emotional work.** Keep the ratio generous: dark rooms,
  red light, people, movement. A bright, evenly-lit snapshot will always look
  out of place here.

---

## 1. Getting into the studio

1. Go to **`yourdomain.com/admin`**.
2. Sign in with the studio username and password.

> **Do this first:** the site currently ships with placeholder credentials
> (`shunya-admin` / `shunya-demo`) that are printed on the sign-in screen.
> Open **Studio → Settings → Studio credentials** and set your own. Use at least
> 10 characters. The studio will remind you with a red banner until you do.

You stay signed in for 8 hours. Use **Sign out** at the bottom of the studio menu
on a shared computer.

---

## 2. Choosing the site's look

The website ships with three complete looks and you can switch between them in
about ten seconds — no developer, no rebuild, nothing to re-upload.

1. Open **`/admin/settings`** (see section 1 if you are not signed in).
2. Find the **Site theme** card at the top. Each theme has its own card with a
   small preview drawn in that theme's real colours.
3. **Click a card to preview it.** The preview happens on your screen only —
   the live site does not change, and the line under the buttons tells you so:
   "Previewing moon — not published yet". Look at the rest of the studio if you
   like; the real look comes back the moment you leave this page.
4. Happy with it? Press **Publish theme**. From the next page load, every
   visitor sees that look — on phones, on laptops, signed in or not. There is
   no cache for anyone to clear, and nothing is saved in a visitor's browser.
5. Not happy? Press **Revert preview** to go straight back to the live theme
   without publishing anything.

The three looks:

| Look | What it is | What moves |
|---|---|---|
| **Dusk** *(the default)* | A sunset over the lake. Blue-hour shadows, cream stone, one gold sun. | The sun, which visitors can drag |
| **Moon** | A crowd under lasers with a crimson moon above them. Darkest and coolest of the three — built for electronic music nights. | Embers drifting across the frame |
| **Void** | Monochrome, no colour anywhere, over a black-and-white hall before the crowd arrives. "Shoonya" means void, and this look takes it literally. | Nothing at all |

Two things worth knowing:

- **The theme changes the whole site**, including the hero photograph and the
  colour of a phone's browser bar — so give it a moment and look at more than
  one page before you decide.
- **Your photographs are never re-coloured.** A theme changes the palette and
  the hero frame; the images in your gallery stay exactly as you uploaded them.
  If you switch to **Void**, red-and-pink event photographs will still be red
  and pink — that contrast is deliberate, but upload darker work if you want
  the monochrome feel throughout.

---

## 3. The five-minute tour

| Studio section | What it controls |
|---|---|
| **Dashboard** | Counts, the launch checklist, and the five newest enquiries |
| **Events** | Every event listing on the website |
| **Gallery** | Every photograph in the gallery and on the homepage strip |
| **Enquiries** | Every form submission from the website |
| **Settings** | Contact details, WhatsApp, Instagram, the hero film, passwords |

Anything you save appears on the live website immediately.

---

## 4. Adding an event

1. Click **New event** (top right of any studio page).
2. Fill in **Basics**: name, subtitle, category, and set **Status**.
   - **Draft** = only you can see it. Use this while you are still confirming details.
   - **Published** = it appears on the website.
   - Tick **Feature on the events page** for the large hero card.
3. Fill in **When & where**: start, end, city, venue, and the address if you want
   to publish it now. Leave the address empty if it is announced later.
4. Write the **Description**: a one-line summary (used on cards and in Google
   results) plus the longer story. *Press Enter twice to start a new paragraph.*
5. Add **Imagery**: upload a poster (a tall 4:5 crop works best) and optionally a
   wide hero image. The poster is also used when the event is shared on
   WhatsApp, Instagram or Google.
6. Add **Ticketing**: the price to display and the booking link from your
   ticketing partner.
7. Add the **Artist lineup** and **Event FAQs** — one row per artist, one row per
   question. Both can be left empty.
8. Click **Save changes**. Use **View live** to see the public page.

### If a detail isn't confirmed yet

Type `TBA` or `To be confirmed` and publish anyway — the website has been built
to present unconfirmed details honestly rather than inventing them:

- Price `TBA` shows the ticket button as **"Tickets not on sale yet"** instead of
  a broken link.
- Booking link `#` does the same, and shows your **Ticketing note** underneath.
- Venue or city "To be confirmed" is presented as exactly that.

You can always edit the event the moment the real information lands. A separate
ticket link and price can be added right up until doors open.

### Running the same night again

Most events come round again — the next SHUNYA edition, the next warehouse
session. **Studio → Events → Duplicate** copies an event's description, lineup
notes, FAQs, category and location into a brand-new listing, so you only have to
change the date, the venue and the poster.

The copy always arrives **unpublished**, with "(copy)" added to the name. It
appears in the list with a *Draft* tag and nowhere on the public website, which
means you can take your time over it. Rename it, set the real date, and publish
it when it is ready.

### Publishing, hiding and deleting

In the **Events** list you can, without opening each event:

- Click the **status chip** to flip between *published* and *draft*.
- Click **Delete** → **Confirm** to remove an event. This cannot be undone.
  If you only want it off the site, switch it to *draft* instead — the record,
  description and FAQs are kept.

Past events stay in the system and appear under the **Past** filter on the
events page, so the archive builds itself.

---

## 5. Adding photographs

Open **Gallery → Add a frame**.

1. **Image** — click **Upload image** and choose a file from your phone or
   laptop (JPG, PNG, WebP or AVIF, up to 8 MB), or paste an existing link.
2. **Alt text** — *required.* Describe what is happening in the photo, e.g.
   "Crowd with hands raised under red lasers in a warehouse". This is what blind
   and low-vision visitors hear, and what search engines read. Skipping it makes
   the whole gallery harder to find.
3. **Caption**, **Location** and **Date label** — these appear over the image on
   the gallery page. Use `TBC` if you don't want to name a location.
4. **Orientation** — portrait, landscape or square. This decides the shape of
   the tile, so family photos and wide stage shots both sit correctly.
5. **Publish immediately** — leave ticked for it to go live.

In the gallery list you can **Hide** a frame (takes it off the website without
deleting it) or **Delete** it permanently.

### Replacing the development photography

The photography currently on the site is placeholder material generated for the
build, and every frame is labelled as such. Before launch:

1. Get your real event photography shot or licensed.
2. Hide or delete the placeholder frames.
3. Upload yours with real alt text, captions, locations and dates.

---

## 6. Reading and answering enquiries

Every form on the website — the homepage enquiry, the private experiences
booking form and the contact page — lands in **Enquiries**. The visitor
immediately receives a reference number.

- **New** enquiries are highlighted with an unread count in the studio menu.
- Click any enquiry to open the full record: name, email, phone, event type,
  date, location, guest count, budget range and their message.
- **Reply by email** opens your mail app with the subject already set.
- **Open WhatsApp** starts a chat with that person, pre-filled.
- **Mark read** / **Archive** keep the list tidy. Archive rather than delete —
  it is your record of who approached you.

Private bookings include the **event type, date, location, guest count and
budget range**, which is everything needed to reply with a concept or a quote.

If you would also like enquiries delivered straight to a company inbox or CRM,
that can be connected with one setting — ask your developer for the
`ENQUIRY_WEBHOOK_URL` value.

### Taking the list away with you

**Studio → Enquiries → Download CSV** saves every enquiry as a spreadsheet file
you can open in Excel, Numbers or Google Sheets — name, contact, event type,
date, location, guest count, budget range and message, one row each, with the
reference number in the first column. It is the fastest way to hand a month of
enquiries to whoever does the accounts, or to keep an offline record before you
clear old ones out of the inbox.

---

## 7. Contact details and links

**Studio → Settings** controls what appears across the whole site:

| Setting | Where it shows |
|---|---|
| Brand name & tagline | Header, footer, browser tab, structured data |
| Contact email | Footer, contact page, enquiry confirmations |
| Contact phone | Footer and contact page |
| WhatsApp number | Header icon, footer button, floating button, every "Ask on WhatsApp" link |
| Instagram URL | Header menu, footer, contact page |
| Hero film URL | The full-screen video on the homepage |
| Hero film credit | The small line under the hero, used to disclose footage licensing |

**WhatsApp number format:** international format, digits only — no `+`, spaces
or dashes. For India that means `91` followed by the ten-digit number, e.g.
`919876543210`.

**Hero film:** leave the URL empty to keep the bundled placeholder loop. To use
your own, upload the file to your hosting (or a CDN) and paste the full
`https://…` link. Portrait phone footage works; a short loop under 15 seconds
loads fastest.

Every field on this page is a placeholder until you replace it. A yellow-bordered
note on the website itself reminds visitors that the details are not final — it
disappears as soon as you save real values.

---

## 8. Before you launch — the checklist

The **Dashboard** shows this list with ticks as you complete it:

- [ ] Replace the placeholder contact email, phone, WhatsApp number and Instagram URL
- [ ] Change the studio username and password
- [ ] Replace the placeholder event listings with real ones, or delete them
- [ ] Replace the placeholder gallery imagery with licensed event photography
- [ ] Point the content folder at persistent storage and set up monthly backups
- [ ] Set the public website address (`NEXT_PUBLIC_SITE_URL`) to your live domain
- [ ] Add a Google Analytics ID if you want traffic reporting
- [ ] Serve the site over HTTPS and submit `sitemap.xml` to Google Search Console

Steps 5–8 are technical — hand those to your developer. Full details are in
`README.md`.

---

## 9. Things the website will never do on its own

The site has been built deliberately so it cannot mislead your audience:

- It will not invent a performer, venue, date or price. Anything unconfirmed is
  displayed as unconfirmed until you type the real value.
- It will not show a working ticket button for an event with no ticket link.
- It will not publish a private client's celebration unless you explicitly create
  and publish that listing.
- It will not publish a gallery frame you have hidden.

That is the safety net — what goes on the site is always what you have confirmed.
