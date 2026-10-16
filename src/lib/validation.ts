/**
 * Dependency-free validation for every write endpoint.
 * Returns a flat map of field → message so forms can highlight inputs.
 */

import { ENQUIRY_INTENTS } from "./site";
import type { Enquiry, EnquiryType, EventStatus, GalleryItem } from "./types";

export type FieldErrors = Record<string, string>;

export interface Validated<T> {
  ok: boolean;
  data: T;
  errors: FieldErrors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Digits-only phone check that tolerates +, spaces, dashes and parentheses. */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

const ENQUIRY_TYPES = new Set<EnquiryType>(ENQUIRY_INTENTS.map((i) => i.type));

export interface EnquiryInput {
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  guestCount?: string;
  budgetRange?: string;
  message: string;
  source?: string;
  /** Honeypot — must stay empty. */
  website?: string;
}

export function validateEnquiry(payload: unknown): Validated<EnquiryInput> {
  const body = (payload ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const type = str(body.type) as EnquiryType;
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);
  const honeypot = str(body.website);

  if (!ENQUIRY_TYPES.has(type)) errors.type = "Choose what your enquiry is about.";
  if (name.length < 2) errors.name = "Please enter your name.";
  if (name.length > 120) errors.name = "That name is too long.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (phone && !isPhone(phone)) errors.phone = "Enter a valid phone number.";
  if (message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  if (message.length > 4000) errors.message = "Please keep this under 4000 characters.";
  if (honeypot) errors.website = "Spam check failed.";

  const eventDate = str(body.eventDate);
  if (eventDate && Number.isNaN(new Date(eventDate).getTime())) {
    errors.eventDate = "Enter a valid date.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      type,
      name,
      email,
      phone: phone || undefined,
      company: str(body.company) || undefined,
      eventType: str(body.eventType) || undefined,
      eventDate: eventDate || undefined,
      location: str(body.location) || undefined,
      guestCount: str(body.guestCount) || undefined,
      budgetRange: str(body.budgetRange) || undefined,
      message,
      source: str(body.source) || undefined,
    },
  };
}

export interface EventFormInput {
  title: string;
  subtitle?: string;
  category: string;
  status: EventStatus;
  featured: boolean;
  startDate: string;
  endDate?: string;
  timezoneLabel: string;
  venue: string;
  address?: string;
  city: string;
  shortDescription: string;
  description: string;
  lineup: { name: string; role?: string; time?: string }[];
  poster: string;
  heroImage?: string;
  ticketPrice: string;
  ticketUrl: string;
  ticketNote?: string;
  faqs: { q: string; a: string }[];
  slug?: string;
}

export function validateEvent(payload: unknown): Validated<EventFormInput> {
  const body = (payload ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const title = str(body.title);
  const slug = str(body.slug);
  const category = str(body.category);
  const status = str(body.status) === "draft" ? "draft" : "published";
  const startDate = str(body.startDate);
  const endDate = str(body.endDate);
  const venue = str(body.venue);
  const city = str(body.city);
  const shortDescription = str(body.shortDescription);
  const description = str(body.description);
  const poster = str(body.poster);
  const ticketPrice = str(body.ticketPrice);
  const ticketUrl = str(body.ticketUrl);

  if (title.length < 2) errors.title = "Give the event a name.";
  if (!category) errors.category = "Pick a category.";
  if (!startDate || Number.isNaN(new Date(startDate).getTime())) {
    errors.startDate = "Set a valid start date and time.";
  }
  if (endDate && Number.isNaN(new Date(endDate).getTime())) {
    errors.endDate = "Set a valid end date and time.";
  }
  if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
    errors.endDate = "The end time must come after the start time.";
  }
  if (!venue) errors.venue = "Add the venue (or 'To be confirmed').";
  if (!city) errors.city = "Add the city (or 'To be confirmed').";
  if (shortDescription.length < 10) errors.shortDescription = "Add a one-line summary.";
  if (description.length < 20) errors.description = "Add a longer description.";
  if (!poster) errors.poster = "Add a poster image URL or upload one.";
  if (!ticketPrice) errors.ticketPrice = "Enter a price, or 'TBA'.";
  if (ticketUrl && ticketUrl !== "#" && !/^https?:\/\//i.test(ticketUrl)) {
    errors.ticketUrl = "Ticket links must start with http:// or https://";
  }
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and dashes only.";
  }

  const lineup = Array.isArray(body.lineup)
    ? (body.lineup as Record<string, unknown>[])
        .map((item) => ({
          name: str(item?.name),
          role: str(item?.role) || undefined,
          time: str(item?.time) || undefined,
        }))
        .filter((item) => item.name.length > 0)
    : [];

  const faqs = Array.isArray(body.faqs)
    ? (body.faqs as Record<string, unknown>[])
        .map((item) => ({ q: str(item?.q), a: str(item?.a) }))
        .filter((item) => item.q.length > 0 && item.a.length > 0)
    : [];

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      title,
      subtitle: str(body.subtitle) || undefined,
      category,
      status,
      featured: Boolean(body.featured),
      startDate: startDate ? new Date(startDate).toISOString() : "",
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      timezoneLabel: str(body.timezoneLabel) || "IST (UTC+5:30)",
      venue,
      address: str(body.address) || undefined,
      city,
      shortDescription,
      description,
      lineup,
      poster,
      heroImage: str(body.heroImage) || undefined,
      ticketPrice,
      ticketUrl: ticketUrl || "#",
      ticketNote: str(body.ticketNote) || undefined,
      faqs,
      slug: slug || undefined,
    },
  };
}

export type GalleryInput = Omit<GalleryItem, "id" | "createdAt">;

export function validateGalleryItem(payload: unknown): Validated<GalleryInput> {
  const body = (payload ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const src = str(body.src);
  const alt = str(body.alt);
  const caption = str(body.caption);
  const orientation = str(body.orientation);
  const date = str(body.date);

  if (!src) errors.src = "Add an image URL or upload a file.";
  if (!/^(https?:\/\/|\/)/i.test(src)) errors.src = "Use an absolute URL or a /public path.";
  if (alt.length < 4) errors.alt = "Describe the image for screen readers.";
  if (!caption) errors.caption = "Add a caption.";
  if (!["landscape", "portrait", "square"].includes(orientation)) {
    errors.orientation = "Choose landscape, portrait or square.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      src,
      alt,
      caption,
      location: str(body.location) || "Location to be confirmed",
      date: date || "TBC",
      orientation: (orientation || "landscape") as GalleryItem["orientation"],
      credit: str(body.credit) || undefined,
      published: body.published === undefined ? true : Boolean(body.published),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Rate limiting (in-memory, per process)                                    */
/* -------------------------------------------------------------------------- */

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Consume one unit of a bucket. Returns false once the limit is reached within
 * the window — used for endpoints where every attempt counts (form spam).
 */
export function rateLimit(key: string, limit = 6, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Credential throttle. Only *failed* attempts consume the budget and a success
 * clears it, so an attacker is locked out after N wrong passwords while a
 * legitimate admin — or a team sharing one office IP — can retry freely.
 */
export function rateLimitFailures(
  key: string,
  limit = 8,
  windowMs = 15 * 60 * 1000,
): { allowed: boolean; recordFailure: () => void; clear: () => void } {
  const now = Date.now();
  const bucket = buckets.get(key);
  const fresh = !bucket || bucket.resetAt < now;

  return {
    allowed: fresh || bucket.count < limit,
    recordFailure: () => {
      const current = buckets.get(key);
      if (!current || current.resetAt < Date.now()) {
        buckets.set(key, { count: 1, resetAt: Date.now() + windowMs });
      } else {
        current.count += 1;
      }
    },
    clear: () => buckets.delete(key),
  };
}

export type { Enquiry };
