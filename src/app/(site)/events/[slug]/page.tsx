import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Accordion from "@/components/Accordion";
import Countdown from "@/components/events/Countdown";
import JsonLd from "@/components/JsonLd";
import EventCard from "@/components/events/EventCard";
import Reveal from "@/components/Reveal";
import ShareActions from "@/components/ShareActions";
import {
  formatEventDate,
  formatEventTime,
  googleCalendarUrl,
  isPast,
  toDateTimeAttribute,
} from "@/lib/format";
import { breadcrumbLd, eventDateSummary, eventLd } from "@/lib/seo";
import { SITE, whatsappLink } from "@/lib/site";
import { getEventBySlug, getEvents, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: `${event.shortDescription} ${eventDateSummary(event)}`.trim(),
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.title} · ${SITE.name}`,
      description: event.shortDescription,
      images: [{ url: event.poster, alt: `${event.title} poster` }],
      type: "article",
    },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [event, events, settings] = await Promise.all([
    getEventBySlug(slug),
    getEvents(),
    getSettings(),
  ]);

  if (!event || event.status !== "published") notFound();

  const past = isPast(event.endDate ?? event.startDate);
  const ticketsLive = Boolean(event.ticketUrl && event.ticketUrl !== "#");
  const related = events
    .filter((item) => item.id !== event.id && !isPast(item.endDate ?? item.startDate))
    .slice(0, 3);

  const structuredData = [
    eventLd(event, past),
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
      { name: event.title, path: `/events/${event.slug}` },
    ]),
  ];

  return (
    <article className="pb-24">
      {/* --- poster hero ---------------------------------------------------- */}
      <header className="relative flex min-h-[78svh] items-end overflow-hidden">
        <Image
          src={event.heroImage || event.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/40" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_110%,color-mix(in_oklab,var(--color-ember-deep)_35%,transparent),transparent_60%)]" />

        <div className="shell relative z-10 w-full pb-12 pt-32 md:pb-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">
              <li>
                <Link href="/" className="hover:text-bone">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/events" className="hover:text-bone">
                  Events
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-bone">{event.title}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-bone/25 bg-void/60 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone backdrop-blur-sm">
              {event.category}
            </span>
            {past ? (
              <span className="rounded-sm border border-bone/20 bg-void/60 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash backdrop-blur-sm">
                Past event
              </span>
            ) : ticketsLive ? (
              <span className="inline-flex items-center gap-2 rounded-sm border border-ember/40 bg-void/60 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ember-glow backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
                Tickets on sale
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-sm border border-bone/20 bg-void/60 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-fog backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-fog" />
                Tickets to be announced
              </span>
            )}
          </div>

          <h1 className="type-mega mt-6 max-w-[18ch] text-[clamp(2.4rem,9vw,6.4rem)] text-bone text-shadow-cine">
            {event.title}
          </h1>
          {event.subtitle ? (
            <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.26em] text-fog">
              {event.subtitle}
            </p>
          ) : null}

          {/* key facts */}
          <dl className="mt-10 grid gap-6 border-t border-bone/12 pt-7 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Date</dt>
              <dd className="mt-2 text-[0.95rem] text-bone">
                <time dateTime={toDateTimeAttribute(event.startDate)}>
                  {formatEventDate(event.startDate)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Time</dt>
              <dd className="mt-2 text-[0.95rem] text-bone">
                {formatEventTime(event.startDate)}
                {event.endDate ? ` – ${formatEventTime(event.endDate)}` : ""}
                <span className="mt-1 block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">
                  {event.timezoneLabel}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Venue</dt>
              <dd className="mt-2 text-[0.95rem] text-bone">{event.venue}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">City</dt>
              <dd className="mt-2 text-[0.95rem] text-bone">{event.city}</dd>
            </div>
          </dl>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {ticketsLive ? (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ember"
              >
                Book tickets
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 6h9M6.5 1.5 11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </a>
            ) : (
              <span
                className="btn-ember cursor-not-allowed opacity-60"
                aria-disabled="true"
                title={event.ticketNote ?? "Tickets are not on sale yet"}
              >
                Tickets not on sale yet
              </span>
            )}

            <a
              href={whatsappLink(
                settings.whatsapp,
                `Hi SHUNYA — I'd like details about ${event.title} (${formatEventDate(event.startDate)}).`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Ask on WhatsApp
            </a>

            <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Add to calendar
            </a>
          </div>

          <ShareActions
            title={`${event.title} · ${SITE.name}`}
            url={`${SITE.url}/events/${event.slug}`}
          />
        </div>
      </header>

      {/* --- body ----------------------------------------------------------- */}
      <div className="shell mt-16 grid gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20">
        <div className="space-y-16">
          {/* About the event */}
          <section aria-labelledby="about-event">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" />
                About the event
              </p>
              <h2 id="about-event" className="type-display mt-5 text-[clamp(1.6rem,4vw,2.6rem)] text-bone">
                {event.title}
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="mt-7 space-y-5">
              {event.description.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="max-w-2xl text-[1rem] leading-relaxed text-fog">
                  {paragraph}
                </p>
              ))}
            </Reveal>
          </section>

          {/* Lineup */}
          <section aria-labelledby="lineup">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" />
                Artist lineup
              </p>
              <h2 id="lineup" className="type-display mt-5 text-[clamp(1.6rem,4vw,2.6rem)] text-bone">
                The bill
              </h2>
            </Reveal>

            {event.lineup.length ? (
              <Reveal delay={0.08} className="mt-7 divide-y divide-bone/10 border-y border-bone/10">
                {event.lineup.map((artist, index) => (
                  <div
                    key={`${artist.name}-${index}`}
                    className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[0.58rem] tracking-[0.24em] text-ash">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[1.0625rem] text-bone">{artist.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pl-8 sm:pl-0">
                      {artist.role ? (
                        <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-fog">
                          {artist.role}
                        </span>
                      ) : null}
                      {artist.time ? (
                        <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ash">
                          {artist.time}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </Reveal>
            ) : (
              <Reveal delay={0.08} className="card-dark mt-7 p-6">
                <p className="text-[0.95rem] text-fog">
                  Lineup to be announced. Artists are published only once they are confirmed.
                </p>
              </Reveal>
            )}

            <p className="mt-5 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-ash/90">
              Placeholder lineup entries · replace with confirmed artists in the SHUNYA studio
            </p>
          </section>

          {/* FAQs */}
          <section aria-labelledby="event-faqs">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" />
                Event FAQs
              </p>
              <h2 id="event-faqs" className="type-display mt-5 text-[clamp(1.6rem,4vw,2.6rem)] text-bone">
                Good to know
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="mt-7">
              <Accordion items={event.faqs} />
            </Reveal>
          </section>
        </div>

        {/* --- sidebar ------------------------------------------------------ */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {/* countdown */}
          {!past ? (
            <Reveal className="card-dark p-6">
              <p className="eyebrow">Doors in</p>
              <div className="mt-5">
                <Countdown target={event.startDate} label={`Countdown to ${event.title}`} />
              </div>
            </Reveal>
          ) : null}

          {/* ticketing */}
          <Reveal delay={0.06} className="card-dark p-6">
            <p className="eyebrow">Tickets</p>
            <p className="type-display mt-4 text-[1.75rem] text-bone">{event.ticketPrice}</p>
            {ticketsLive ? (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ember mt-5 w-full"
              >
                Book tickets
              </a>
            ) : (
              <p className="mt-4 rounded-sm border border-bone/15 bg-void/60 p-3 text-[0.82rem] leading-relaxed text-fog">
                {event.ticketNote ??
                  "Ticket link activates with the official announcement. Ask us on WhatsApp to be notified first."}
              </p>
            )}
            <a
              href={whatsappLink(
                settings.whatsapp,
                `Hi SHUNYA — please notify me about tickets for ${event.title}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-3 w-full"
            >
              Notify me
            </a>
            <p className="mt-4 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-ash">
              Prices are shown as published · nothing is invented
            </p>
          </Reveal>

          {/* venue */}
          <Reveal delay={0.1} className="card-dark p-6">
            <p className="eyebrow">Venue</p>
            <p className="mt-4 text-[1rem] text-bone">{event.venue}</p>
            <p className="mt-1 text-[0.85rem] text-fog">{event.city}</p>
            {event.address ? (
              <>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-fog">{event.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${event.venue}, ${event.address}, ${event.city}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-5 w-full"
                >
                  Open in maps
                </a>
              </>
            ) : (
              <p className="mt-4 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-ash">
                Full address published closer to the date
              </p>
            )}
          </Reveal>

          {/* poster download-ish block */}
          <Reveal delay={0.14} className="arch-top overflow-hidden rounded-sm border border-bone/10">
            <div className="relative aspect-[4/5]">
              <Image
                src={event.poster}
                alt={`${event.title} poster`}
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-4 bg-charcoal/80 p-4">
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash">
                Official poster
              </span>
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-fog">
                {formatEventDate(event.startDate)}
              </span>
            </div>
          </Reveal>
        </aside>
      </div>

      {/* --- related -------------------------------------------------------- */}
      {related.length ? (
        <section className="shell mt-24" aria-labelledby="more-events">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" />
              More from SHUNYA
            </p>
            <h2 id="more-events" className="type-display mt-5 text-[clamp(1.6rem,4vw,2.6rem)] text-bone">
              Next up
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.06}>
                <EventCard event={item} index={index} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd data={structuredData} />
    </article>
  );
}
