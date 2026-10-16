import { DEFAULT_THEME } from "./themes";
import type {
  EnquiryType,
  EventFaq,
  GalleryItem,
  LineupArtist,
  ShunyaDatabase,
  ShunyaEvent,
  SiteSettings,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                 */
/* -------------------------------------------------------------------------- */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 72);
}

export function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/* -------------------------------------------------------------------------- */
/*  Placeholder content                                                       */
/* -------------------------------------------------------------------------- */
/**
 * IMPORTANT — every event below is a DRAFT TEMPLATE, not a confirmed booking.
 * Titles use the "—TBA" pattern, artists are "To be announced", prices are
 * "TBA" and ticket links are inert. Replace them in /admin/events (or by
 * editing data/shunya.json) with confirmed information before launch.
 */

/** Placeholder asset set shipped in /public/media. Replace via the admin gallery. */
export const PLACEHOLDER_IMAGES = [
  "/media/hero-main.jpg",
  "/media/chapter-sound.jpg",
  "/media/chapter-space.jpg",
  "/media/chapter-people.jpg",
  "/media/gallery-01.jpg",
  "/media/gallery-02.jpg",
  "/media/gallery-03.jpg",
  "/media/gallery-04.jpg",
  "/media/gallery-05.jpg",
  "/media/gallery-06.jpg",
  "/media/gallery-07.jpg",
  "/media/gallery-08.jpg",
  "/media/gallery-09.jpg",
  "/media/gallery-10.jpg",
  "/media/gallery-11.jpg",
  "/media/private-rooftop.jpg",
  "/media/private-pool.jpg",
];

const PLACEHOLDER_FAQS: EventFaq[] = [
  {
    q: "Is this event confirmed?",
    a: "This listing is a placeholder template. Date, venue, lineup and pricing are confirmed only when SHUNYA publishes the official announcement.",
  },
  {
    q: "What is the age policy?",
    a: "Age policy is set per event and will be published with the official announcement. Photo ID is required at entry.",
  },
  {
    q: "Are tickets refundable?",
    a: "Refund and transfer terms are defined by the official ticketing partner for each event and will be linked here once tickets go live.",
  },
  {
    q: "Is there a dress code?",
    a: "SHUNYA events are dark, comfortable and dancefloor-first. Any specific dress code will be stated on the event page.",
  },
  {
    q: "Accessibility and access requirements",
    a: "Tell us what you need when you book and we will arrange access, seating or assistance with the venue team.",
  },
];

function placeholderLineup(): LineupArtist[] {
  return [
    { name: "Headline — To be announced", role: "Headline", time: "To be announced" },
    { name: "Support — To be announced", role: "Support", time: "To be announced" },
    { name: "Opening — To be announced", role: "Opening", time: "To be announced" },
  ];
}

function isoDaysFromNow(days: number, hourUTC = 14): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hourUTC, 30, 0, 0);
  return d.toISOString();
}

interface EventSeed {
  title: string;
  subtitle: string;
  category: string;
  startInDays: number;
  city: string;
  venue: string;
  poster: string;
  heroImage: string;
  featured: boolean;
  shortDescription: string;
  description: string;
}

const EVENT_SEEDS: EventSeed[] = [
  {
    title: "SHUNYA 01 — TBA",
    subtitle: "Warehouse Series / Placeholder Listing",
    category: "Electronic Music",
    startInDays: 21,
    city: "City to be confirmed",
    venue: "Venue to be confirmed",
    poster: "/media/chapter-space.jpg",
    heroImage: "/media/hero-main.jpg",
    featured: true,
    shortDescription:
      "Placeholder listing for the next SHUNYA warehouse night. Date, venue and lineup are confirmed on announcement.",
    description:
      "This is a placeholder event page. It exists so the SHUNYA site can be reviewed, tested and handed over with the full event experience in place — listing card, poster, lineup grid, ticketing block and FAQs — without publishing unconfirmed details.\n\nSHUNYA builds nights around a single idea: a room, a sound system and a crowd that arrives with intent. The floor plan, the light rig and the running order are designed together, so the night moves as one continuous piece rather than a set of separate performances.\n\nReplace this copy in the SHUNYA studio at /admin/events with the confirmed event information. The page structure, metadata and ticketing block will update automatically.",
  },
  {
    title: "SHUNYA 02 — TBA",
    subtitle: "Open Air / Placeholder Listing",
    category: "Electronic Music",
    startInDays: 49,
    city: "City to be confirmed",
    venue: "Outdoor site to be confirmed",
    poster: "/media/gallery-08.jpg",
    heroImage: "/media/gallery-08.jpg",
    featured: true,
    shortDescription:
      "Placeholder listing for an open-air SHUNYA session. Timing and location confirmed on announcement.",
    description:
      "A placeholder for the SHUNYA open-air format — daylight into night, low volume in the early hours and a long, patient build across the evening.\n\nOpen-air programming at SHUNYA is designed for scale without losing intimacy: one stage, one continuous arc, and a site chosen for how sound behaves in the landscape rather than how it photographs.\n\nAll details on this page are unconfirmed placeholders. Update or remove this listing in the SHUNYA studio at /admin/events.",
  },
  {
    title: "SHUNYA 03 — TBA",
    subtitle: "Late Session / Placeholder Listing",
    category: "Electronic Music",
    startInDays: 77,
    city: "City to be confirmed",
    venue: "Venue to be confirmed",
    poster: "/media/chapter-sound.jpg",
    heroImage: "/media/chapter-sound.jpg",
    featured: false,
    shortDescription:
      "Placeholder listing for a late-night SHUNYA session. Lineup and capacity confirmed on announcement.",
    description:
      "A placeholder for the SHUNYA late session — a smaller room, a stricter sound system and a floor that stays full from the first record.\n\nLate sessions are built for people who arrive after midnight and stay until the lights come up. Capacity is deliberately limited and the running order is kept off the flyer.\n\nThis listing is a template. Confirm or remove it in the SHUNYA studio at /admin/events.",
  },
  {
    title: "Private Experience — Sample",
    subtitle: "Private Celebration / Example Layout",
    category: "Private Experience",
    startInDays: 35,
    city: "Location on request",
    venue: "Private venue — undisclosed",
    poster: "/media/gallery-09.jpg",
    heroImage: "/media/gallery-09.jpg",
    featured: false,
    shortDescription:
      "Example layout for a private SHUNYA experience. Private events are never listed publicly with real details.",
    description:
      "This entry demonstrates how a private experience can be displayed if — and only if — the host approves a public listing. Private SHUNYA events are by default unlisted.\n\nPrivate work covers birthday celebrations, pool parties, sundowners, theme parties and full-scale exclusive celebrations: concept, production, sound, lighting, hospitality and artist programming as one package.\n\nUse this page as a layout reference, then archive or delete it from /admin/events.",
  },
];

export function seedEvents(): ShunyaEvent[] {
  const now = new Date().toISOString();
  return EVENT_SEEDS.map((seed, index) => {
    const { ...rest } = seed;
    return {
      id: makeId("evt"),
      slug: slugify(rest.title) || `event-${index + 1}`,
      title: rest.title,
      subtitle: rest.subtitle,
      category: rest.category,
      status: "published" as const,
      featured: rest.featured,
      startDate: isoDaysFromNow(rest.startInDays),
      endDate: undefined,
      timezoneLabel: "IST (UTC+5:30)",
      venue: rest.venue,
      address: undefined,
      city: rest.city,
      shortDescription: rest.shortDescription,
      description: rest.description,
      lineup: placeholderLineup(),
      poster: rest.poster,
      heroImage: rest.heroImage,
      ticketPrice: "TBA",
      ticketUrl: "#",
      ticketNote: "Ticket link activates with the official announcement.",
      faqs: PLACEHOLDER_FAQS,
      createdAt: now,
      updatedAt: now,
    };
  });
}

type GallerySeed = Omit<GalleryItem, "id" | "createdAt">;

const GALLERY_SEEDS: GallerySeed[] = [
  {
    src: "/media/hero-main.jpg",
    alt: "Silhouetted crowd with raised hands under red lasers in a dark warehouse",
    caption: "Warehouse Series — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-01.jpg",
    alt: "Festival crowd seen from below through beams of light and smoke",
    caption: "Rig and beams — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "portrait",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-02.jpg",
    alt: "Single figure silhouetted against strobe light",
    caption: "Strobe study — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "portrait",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/chapter-sound.jpg",
    alt: "DJ silhouette behind a mixer lit by a single red light",
    caption: "Booth — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/chapter-space.jpg",
    alt: "Empty industrial warehouse interior lit by a hanging truss",
    caption: "Room before doors — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-03.jpg",
    alt: "Concrete industrial corridor lit by a red strip light",
    caption: "Load-in corridor — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "portrait",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-04.jpg",
    alt: "Hands adjusting a modular synthesiser in near darkness",
    caption: "Modular — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/chapter-people.jpg",
    alt: "Large festival crowd silhouetted toward a distant stage",
    caption: "Last record — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-06.jpg",
    alt: "Guests at a long candlelit communal table in a dark warehouse",
    caption: "Private celebration — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "portrait",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/private-rooftop.jpg",
    alt: "Rooftop dinner table at night with candles and city bokeh",
    caption: "Rooftop table — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/private-pool.jpg",
    alt: "Poolside sundowner party at dusk with crimson and pink reflections",
    caption: "Sundowner — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-05.jpg",
    alt: "Open-air gathering under a wide dark sky",
    caption: "Open air — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-07.jpg",
    alt: "Detail of a mixing desk under low red light",
    caption: "Detail — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-08.jpg",
    alt: "Outdoor festival main stage glowing red behind a crowd with raised arms",
    caption: "Main stage — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-11.jpg",
    alt: "Warehouse party seen from a mezzanine, lighting rig fanning beams over the crowd",
    caption: "Mezzanine view — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-09.jpg",
    alt: "Dark private dining table with brass candlesticks and a single black orchid",
    caption: "Table setting — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "landscape",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
  {
    src: "/media/gallery-10.jpg",
    alt: "Raised hands of a crowd inside thick smoke, backlit in black and white",
    caption: "Hands up — placeholder frame",
    location: "Location to be confirmed",
    date: "TBC",
    orientation: "portrait",
    credit: "Development placeholder visual — replace with licensed event photography",
    published: true,
  },
];

export function seedGallery(): GalleryItem[] {
  const now = new Date().toISOString();
  return GALLERY_SEEDS.map((seed) => ({ ...seed, id: makeId("img"), createdAt: now }));
}

export function seedSettings(): SiteSettings {
  // Placeholders only. Read from NEXT_PUBLIC_* when provided so a deployment can
  // be configured without touching code.
  const env = (key: string, fallback: string) => {
    const value = process.env[key];
    return value && value.trim().length > 0 ? value.trim() : fallback;
  };

  return {
    // Dusk — the warm sunset identity the brand was photographed for. The
    // studio can switch to Moon or Void without a redeploy.
    theme: DEFAULT_THEME,
    brandName: "SHUNYA",
    tagline: "From Shoonya, Everything Begins.",
    contactEmail: env("NEXT_PUBLIC_CONTACT_EMAIL", "hello@shunya.example"),
    contactPhone: env("NEXT_PUBLIC_CONTACT_PHONE", "+910000000000"),
    whatsapp: env("NEXT_PUBLIC_WHATSAPP_NUMBER", "910000000000"),
    instagram: env("NEXT_PUBLIC_INSTAGRAM_URL", "https://instagram.com/shunya.example"),
    heroVideoUrl: "",
    heroVideoCredit: "Placeholder photography — replace with licensed event imagery.",
    updatedAt: new Date().toISOString(),
  };
}

export function seedAdminAccount(): ShunyaDatabase["admin"] {
  return {
    username: "shunya-admin",
    // Hash of the temporary password "shunya" — a prompt to change it is shown
    // the moment the studio is opened. Replaced on first password change.
    passwordHash: "scrypt$16384$8$1$106b8b7a27e5e0b1a0e0f4e9bcd0a3f2$2f8eea5e5e0f1d3b3b0d9a7c",
    mustChangePassword: true,
    updatedAt: new Date().toISOString(),
  };
}

export function seedDatabase(): ShunyaDatabase {
  return {
    version: 1,
    settings: seedSettings(),
    events: seedEvents(),
    gallery: seedGallery(),
    enquiries: [],
    admin: seedAdminAccount(),
  };
}

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  "private-experience": "Private Experience",
  "artist-collaboration": "Artist Collaboration",
  "brand-partnership": "Brand Partnership",
  sponsorship: "Sponsorship",
  general: "General Enquiry",
};
