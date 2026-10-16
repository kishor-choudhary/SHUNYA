import Link from "next/link";

import EventCard from "@/components/events/EventCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { formatEventDate, formatEventTime, isPast } from "@/lib/format";
import type { ShunyaEvent } from "@/lib/types";

/**
 * Upcoming events — driven entirely by published events from the SHUNYA studio.
 * When nothing is confirmed the section says so rather than inventing a date.
 */
export default function UpcomingEvents({ events }: { events: ShunyaEvent[] }) {
  const upcoming = events.filter((event) => !isPast(event.endDate ?? event.startDate));
  const next = upcoming[0];
  const rest = upcoming.slice(1, 4);

  return (
    <section
      id="events"
      className="relative overflow-hidden border-t border-bone/10 bg-ink py-20 md:py-28"
    >
      <div className="mist -right-32 top-10 h-[34rem] w-[34rem]" />
      <div className="shell">
        <SectionHeading
          eyebrow="Events"
          title={
            <>
              Upcoming
              <span className="text-ash"> events</span>
            </>
          }
          lead="Every date below is published from the SHUNYA studio. Nothing goes live until it is confirmed."
          action={{ href: "/events", label: "All events" }}
        />

        {next ? (
          <div className="mt-14 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Reveal className="lg:col-span-1">
              <EventCard event={next} index={0} layout="wide" priority />
            </Reveal>

            <div className="grid gap-6">
              {rest.length ? (
                rest.map((event, index) => (
                  <Reveal key={event.id} delay={0.08 * (index + 1)}>
                    <EventCard event={event} index={index + 1} />
                  </Reveal>
                ))
              ) : (
                <Reveal delay={0.1} className="card-dark flex h-full flex-col justify-between p-8">
                  <div>
                    <p className="eyebrow">Full calendar</p>
                    <p className="mt-4 text-[1rem] leading-relaxed text-fog">
                      More dates are added as they are confirmed. The full calendar, past events and
                      archives live on the events page.
                    </p>
                  </div>
                  <Link href="/events" className="btn-ghost mt-8 self-start">
                    Open the calendar
                  </Link>
                </Reveal>
              )}
            </div>
          </div>
        ) : (
          <Reveal className="card-dark mt-14 p-8 md:p-12">
            <p className="eyebrow">No confirmed dates published</p>
            <h3 className="type-display mt-5 max-w-[24ch] text-[clamp(1.6rem,4vw,2.6rem)] text-bone">
              The next SHUNYA event is being built.
            </h3>
            <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-fog">
              Dates, venues and lineups are announced only when they are final. Leave your email and
              we will tell you first — or plan a private experience in the meantime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?intent=general" className="btn-ember">
                Get the announcement
              </Link>
              <Link href="/private-experiences" className="btn-ghost">
                Plan a private experience
              </Link>
            </div>
          </Reveal>
        )}

        {/* Compact calendar strip */}
        {upcoming.length > 1 ? (
          <Reveal delay={0.12} className="mt-10 overflow-hidden rounded-sm border border-bone/10">
            <div className="grid divide-y divide-bone/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              {upcoming.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group flex items-center justify-between gap-4 p-5 transition-colors duration-300 hover:bg-charcoal/70"
                >
                  <span>
                    <span className="block font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">
                      {formatEventDate(event.startDate)} · {formatEventTime(event.startDate)}
                    </span>
                    <span className="mt-1.5 block text-[0.95rem] text-bone">{event.title}</span>
                    <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-fog">
                      {event.city}
                    </span>
                  </span>
                  <span className="shrink-0 text-ash transition-colors group-hover:text-ember-glow">
                    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" aria-hidden="true">
                      <path d="M0 4h18M15 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
