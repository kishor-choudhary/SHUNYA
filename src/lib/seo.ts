import { SITE } from "./site";
import { formatEventDate } from "./format";
import type { ShunyaEvent } from "./types";

/**
 * JSON-LD builders. Everything is derived from content the brand has actually
 * published — no invented ratings, prices or performer claims.
 */

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}

/** A listing of events, so search engines understand the calendar as a set. */
export function eventListLd(events: ShunyaEvent[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE.name} events`,
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE.url}/events/${event.slug}`,
      name: event.title,
      description: event.shortDescription,
    })),
  };
}

/**
 * Service schema for the private experiences page. Formats are listed as an
 * offer catalogue with no pricing — prices are quoted per project and are not
 * published, so nothing is asserted here that SHUNYA has not confirmed.
 */
export function privateExperienceLd(formats: { title: string; body: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "SHUNYA Private Experiences",
    serviceType: "Private event production",
    description:
      "Private parties, birthdays, pool parties, sundowners, theme parties and exclusive celebrations produced end to end by SHUNYA.",
    url: `${SITE.url}/private-experiences`,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: "IN",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Experience formats",
      itemListElement: formats.map((format) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: format.title,
          description: format.body,
        },
        // Pricing is quoted per project; no price is published.
        availability: "https://schema.org/InStock",
      })),
    },
  };
}

export function eventLd(event: ShunyaEvent, isPastEvent: boolean) {
  const ticketsLive = Boolean(event.ticketUrl && event.ticketUrl !== "#");

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.shortDescription,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [`${SITE.url}${event.heroImage || event.poster}`],
    isAccessibleForFree: false,
    location: {
      "@type": "Place",
      name: event.venue,
      ...(event.address ? { address: event.address } : {}),
      ...(event.city ? { addressLocality: event.city } : {}),
    },
    ...(ticketsLive
      ? {
          offers: {
            "@type": "Offer",
            url: event.ticketUrl,
            description: event.ticketNote ?? `Tickets: ${event.ticketPrice}`,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    performer: event.lineup.map((artist) => ({
      "@type": "PerformingGroup",
      name: artist.name,
    })),
    organizer: { "@type": "Organization", name: SITE.name, url: SITE.url },
    ...(isPastEvent ? { typicalAgeRange: undefined } : {}),
  };
}

/** Human-readable date range used in metadata descriptions. */
export function eventDateSummary(event: ShunyaEvent): string {
  const start = formatEventDate(event.startDate);
  if (!event.endDate) return `${start} · ${event.venue}, ${event.city}`;
  return `${start} – ${formatEventDate(event.endDate)} · ${event.venue}, ${event.city}`;
}
