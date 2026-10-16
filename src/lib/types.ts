/**
 * SHUNYA — domain types.
 *
 * Every field that a real business must supply is intentionally a placeholder
 * string (`TBA`, `To be announced`, …). Nothing here asserts a real venue,
 * performer, price or testimonial.
 */

import type { ThemeId } from "./themes";

export type EventStatus = "published" | "draft";

export interface LineupArtist {
  /** Artist / act name — placeholder until confirmed by SHUNYA. */
  name: string;
  /** e.g. "Headline", "Support", "Live", "B2B" */
  role?: string;
  /** Set time, e.g. "23:30" — placeholder where unconfirmed. */
  time?: string;
}

export interface EventFaq {
  q: string;
  a: string;
}

export interface ShunyaEvent {
  id: string;
  slug: string;
  /** Working title. Replace with the confirmed event name. */
  title: string;
  subtitle?: string;
  /** e.g. "Warehouse Series", "Private Experience" */
  category: string;
  status: EventStatus;
  featured: boolean;
  /** ISO 8601 date-time, stored UTC. Displayed in the event's local timezone. */
  startDate: string;
  endDate?: string;
  /** Free-text timezone label, e.g. "IST (UTC+5:30)". */
  timezoneLabel: string;
  venue: string;
  address?: string;
  city: string;
  shortDescription: string;
  /** Long copy. Paragraphs separated by a blank line. */
  description: string;
  lineup: LineupArtist[];
  /** /public path to the event poster. */
  poster: string;
  heroImage?: string;
  /** Placeholder until pricing is confirmed, e.g. "TBA" / "From ₹ —". */
  ticketPrice: string;
  /** External ticketing destination. "#" = not yet live. */
  ticketUrl: string;
  ticketNote?: string;
  faqs: EventFaq[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  location: string;
  date: string;
  /** "landscape" | "portrait" | "square" — drives the masonry rhythm. */
  orientation: "landscape" | "portrait" | "square";
  credit?: string;
  published: boolean;
  createdAt: string;
}

export type EnquiryType =
  | "private-experience"
  | "artist-collaboration"
  | "brand-partnership"
  | "sponsorship"
  | "general";

export type EnquiryStatus = "new" | "read" | "archived";

export interface Enquiry {
  id: string;
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  /** Private-experience fields. */
  eventType?: string;
  eventDate?: string;
  location?: string;
  guestCount?: string;
  budgetRange?: string;
  message: string;
  /** Which page the enquiry came from, for attribution. */
  source?: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface SiteSettings {
  /**
   * The look the whole site is rendered in, chosen in the studio. Stored with
   * the rest of the content and rendered onto <html data-theme="…"> by the
   * root layout, so every visitor — on any device, signed in or not — sees the
   * published theme on their next page load. See src/lib/themes.ts.
   */
  theme: ThemeId;
  brandName: string;
  tagline: string;
  /** Placeholder contact details — see /admin/settings. */
  contactEmail: string;
  contactPhone: string;
  /** International format, digits only, e.g. 910000000000. */
  whatsapp: string;
  instagram: string;
  /**
   * Optional hero frame image — an absolute URL or a /media/… path. Empty
   * means the bundled placeholder photograph.
   *
   * The key keeps its original name because it is stored in existing content
   * documents; it holds an image, not a film.
   */
  heroVideoUrl: string;
  /** Credit line under the hero frame — photography or placeholder disclosure. */
  heroVideoCredit: string;
  updatedAt: string;
}

export interface AdminAccount {
  /** Username for the SHUNYA studio (admin) interface. */
  username: string;
  /** scrypt hash — never a plaintext password. */
  passwordHash: string;
  /** Force a password change when still using the seeded default. */
  mustChangePassword: boolean;
  updatedAt: string;
}

export interface ShunyaDatabase {
  version: number;
  settings: SiteSettings;
  events: ShunyaEvent[];
  gallery: GalleryItem[];
  enquiries: Enquiry[];
  admin: AdminAccount;
}
