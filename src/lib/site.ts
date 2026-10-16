import type { EnquiryType } from "./types";

/* -------------------------------------------------------------------------- */
/*  Site-wide configuration and brand copy                                    */
/* -------------------------------------------------------------------------- */
/**
 * All public copy lives here so the brand team can edit one file. Contact
 * details are EDITABLE PLACEHOLDERS — pull them from the admin settings or the
 * NEXT_PUBLIC_* environment variables before launch.
 */

export const SITE = {
  name: "SHUNYA",
  legalName: "SHUNYA",
  tagline: "From Shoonya, Everything Begins.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shunya.example").replace(/\/$/, ""),
  description:
    "SHUNYA is an independent event and electronic music experiences brand creating private parties, exclusive celebrations and large-scale electronic music events.",
  keywords: [
    "SHUNYA",
    "electronic music events",
    "underground music collective",
    "private parties",
    "event production",
    "warehouse party",
    "sundowner",
    "event company",
  ],
  /** Social handles are placeholders. */
  sameAs: [] as string[],
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home", index: "01" },
  { href: "/about", label: "About", index: "02" },
  { href: "/events", label: "Events", index: "03" },
  { href: "/private-experiences", label: "Private Experiences", index: "04" },
  { href: "/gallery", label: "Gallery", index: "05" },
  { href: "/contact", label: "Contact", index: "06" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Homepage copy                                                             */
/* -------------------------------------------------------------------------- */

export const HERO = {
  kicker: "Independent event & electronic music experiences brand",
  headline: "From Shoonya, Everything Begins.",
  supporting:
    "We create experiences that bring people together through music, energy, and culture.",
  primaryCta: { label: "Explore Events", href: "/events" },
  secondaryCta: { label: "Plan Your Experience", href: "/private-experiences" },
} as const;

/** Scroll-driven chapters — the "cinematic journey" backbone of the homepage. */
export interface Chapter {
  id: string;
  index: string;
  label: string;
  heading: string;
  stat: string;
  body: string;
  image: string;
  href: string;
  /** Framing hint for the poster panel. */
  accent?: "ember" | "bone" | "dusk";
  meta: { k: string; v: string }[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "sound",
    index: "01",
    label: "The Sound",
    heading: "Electronic Music",
    stat: "Sound first",
    body: "Programming is built around a single arc — from the first record to the last light. Rooms are chosen for how they hold low end, not how they photograph. Lineups are curated for tension and release rather than genre convenience.",
    image: "/media/chapter-sound.jpg",
    href: "/events",
    accent: "ember",
    meta: [
      { k: "Formats", v: "Warehouse · Open air · Late session" },
      { k: "Programming", v: "Headline, support, opening — one continuous set" },
      { k: "Sound", v: "Tuned systems, controlled volume, full-range low end" },
    ],
  },
  {
    id: "space",
    index: "02",
    label: "The Space",
    heading: "Event Production",
    stat: "Built, not booked",
    body: "Lighting, staging, haze and sightlines are designed together as one system. Every SHUNYA room is drawn before it is dressed: where the crowd stands, where the beams land, where the night opens up.",
    image: "/media/chapter-space.jpg",
    href: "/about",
    accent: "bone",
    meta: [
      { k: "Design", v: "Truss, beams, haze and floor plan in one pass" },
      { k: "Scale", v: "Intimate rooms to large-scale stages" },
      { k: "Team", v: "In-house production with trusted venue partners" },
    ],
  },
  {
    id: "people",
    index: "03",
    label: "The People",
    heading: "Private Experiences",
    stat: "By invitation",
    body: "Birthdays, pool parties, sundowners, theme parties and exclusive celebrations — produced end to end. We take the brief, build the concept, run production and hospitality, and keep the details private.",
    image: "/media/chapter-people.jpg",
    href: "/private-experiences",
    accent: "dusk",
    meta: [
      { k: "Occasions", v: "Birthdays · Pool parties · Sundowners · Theme parties" },
      { k: "Scope", v: "Concept, production, sound, hospitality, artists" },
      { k: "Discretion", v: "Private by default — never published without approval" },
    ],
  },
];

export const SERVICES = [
  {
    id: "private",
    index: "01",
    title: "Private Experiences",
    body: "Birthday celebrations, pool parties, sundowners, theme parties and exclusive gatherings — produced end to end, hosted with discretion.",
    href: "/private-experiences",
    cta: "Plan an experience",
    image: "/media/private-rooftop.jpg",
  },
  {
    id: "music",
    index: "02",
    title: "Electronic Music",
    body: "Curated lineups and serious sound systems. From intimate late sessions to large-scale electronic music events, programmed for the room.",
    href: "/events",
    cta: "See what's next",
    image: "/media/chapter-sound.jpg",
  },
  {
    id: "production",
    index: "03",
    title: "Event Production",
    body: "Concept, stage design, lighting, sound, permissions and on-night operations — the full production layer, delivered as one team.",
    href: "/contact?intent=brand-partnership",
    cta: "Start a project",
    image: "/media/chapter-space.jpg",
  },
] as const;

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Enquiry",
    body: "Send us the date, the city, the guest count and the feeling you want in the room. A short brief is enough to start.",
  },
  {
    step: "02",
    title: "Concept & plan",
    body: "We return with a concept, a production plan, a music direction and a transparent cost structure.",
  },
  {
    step: "03",
    title: "Production",
    body: "Sound, lighting, staging, hospitality and artist coordination — managed by the SHUNYA team from load-in to load-out.",
  },
  {
    step: "04",
    title: "The night",
    body: "We run the room so you don't have to. You arrive as a guest at your own event.",
  },
] as const;

export const EXPERIENCE_TYPES = [
  { id: "birthday", label: "Birthday Celebration" },
  { id: "pool-party", label: "Pool Party" },
  { id: "sundowner", label: "Sundowner" },
  { id: "theme-party", label: "Theme Party" },
  { id: "private-dinner", label: "Private Dinner" },
  { id: "anniversary", label: "Anniversary / Milestone" },
  { id: "warehouse-celebration", label: "Warehouse Celebration" },
  { id: "other", label: "Something else" },
] as const;

/**
 * Budget bands are deliberately coarse placeholders. Replace with the real
 * bands once SHUNYA confirms pricing — never present invented numbers as real.
 */
export const BUDGET_RANGES = [
  { id: "to-be-discussed", label: "Prefer to discuss" },
  { id: "band-1", label: "Band 1 — placeholder" },
  { id: "band-2", label: "Band 2 — placeholder" },
  { id: "band-3", label: "Band 3 — placeholder" },
  { id: "band-4", label: "Band 4 — placeholder" },
] as const;

export const GUEST_COUNTS = [
  { id: "under-25", label: "Under 25" },
  { id: "25-75", label: "25 – 75" },
  { id: "75-150", label: "75 – 150" },
  { id: "150-400", label: "150 – 400" },
  { id: "400-plus", label: "400+" },
  { id: "discuss", label: "Not decided yet" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Contact intents                                                           */
/* -------------------------------------------------------------------------- */

export interface EnquiryIntent {
  type: EnquiryType;
  id: string;
  index: string;
  label: string;
  blurb: string;
  /** Fields shown for this intent. */
  fields: ("company" | "eventDetails")[];
}

export const ENQUIRY_INTENTS: EnquiryIntent[] = [
  {
    id: "private-bookings",
    type: "private-experience",
    index: "01",
    label: "Private Bookings",
    blurb: "Birthdays, pool parties, sundowners, theme parties and exclusive celebrations.",
    fields: ["eventDetails"],
  },
  {
    id: "artist-collaborations",
    type: "artist-collaboration",
    index: "02",
    label: "Artist Collaborations",
    blurb: "DJs, live acts, visual artists and collectives who want to build a night with us.",
    fields: [],
  },
  {
    id: "brand-partnerships",
    type: "brand-partnership",
    index: "03",
    label: "Brand Partnerships",
    blurb: "Campaigns, launches and cultural collaborations that need a real room and a real crowd.",
    fields: ["company"],
  },
  {
    id: "sponsorships",
    type: "sponsorship",
    index: "04",
    label: "Sponsorships",
    blurb: "Stage, sound system, bar and content partnerships across SHUNYA events.",
    fields: ["company"],
  },
  {
    id: "general",
    type: "general",
    index: "05",
    label: "General Enquiries",
    blurb: "Press, venues, internships, suppliers and everything else.",
    fields: [],
  },
];

/* -------------------------------------------------------------------------- */
/*  Link builders                                                             */
/* -------------------------------------------------------------------------- */

export function whatsappLink(number: string, message: string): string {
  const digits = (number || "").replace(/[^\d]/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi SHUNYA — I'd like to know more about your events and private experiences.";

export function mailtoLink(email: string, subject: string, body = ""): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}
