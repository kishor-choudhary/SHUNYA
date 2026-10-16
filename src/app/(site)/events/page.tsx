import type { Metadata } from "next";
import Link from "next/link";

import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { isPast } from "@/lib/format";
import { breadcrumbLd, eventListLd } from "@/lib/seo";
import { SITE, whatsappLink } from "@/lib/site";
import { getEvents, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and past SHUNYA electronic music events. Dates, venues and lineups are published only once they are confirmed.",
  alternates: { canonical: "/events" },
};

type SearchParams = Promise<{ when?: string; category?: string; city?: string }>;

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ when = "upcoming", category = "", city = "" }, events, settings] = await Promise.all([
    searchParams,
    getEvents(),
    getSettings(),
  ]);

  const upcoming = events.filter((event) => !isPast(event.endDate ?? event.startDate));
  const past = events.filter((event) => isPast(event.endDate ?? event.startDate));

  const categories = [...new Set(events.map((event) => event.category))].sort();
  const cities = [...new Set(events.map((event) => event.city))].sort();

  let visible =
    when === "past" ? past : when === "all" ? events : upcoming;
  if (category) visible = visible.filter((event) => event.category === category);
  if (city) visible = visible.filter((event) => event.city === city);

  // Featured / soonest first, and the first card gets the wide treatment.
  visible = [...visible].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const [feature, ...rest] = visible;

  return (
    <div className="pb-24 pt-28 md:pb-32 md:pt-36">
      {/* --- page header --------------------------------------------------- */}
      <PageHeader
        index="03"
        eyebrow={`${upcoming.length} upcoming · ${past.length} archived`}
        meta={<span>Announced only when confirmed</span>}
        wide
        title="Events"
        lead="Large-scale electronic music events, warehouse sessions and open-air stages. Every date on this page is published from the SHUNYA studio — nothing is listed until it is confirmed."
      />

      {/* --- filters ------------------------------------------------------- */}
      <div className="shell mt-12">
        <Reveal className="card-dark p-5 md:p-6">
          <EventFilters
            categories={categories}
            cities={cities}
            activeCategory={category}
            activeCity={city}
            activeWhen={when}
            total={visible.length}
          />
        </Reveal>
      </div>

      {/* --- listing ------------------------------------------------------- */}
      <section className="shell mt-12" aria-label="Event listing">
        {feature ? (
          <div className="space-y-6">
            <EventCard event={feature} index={0} layout="wide" titleAs="h2" priority />
            {rest.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((event, index) => (
                  <Reveal key={event.id} delay={Math.min(index * 0.06, 0.24)}>
                    <EventCard event={event} index={index + 1} titleAs="h2" />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <Reveal className="card-dark p-10 text-center md:p-16">
            <p className="eyebrow justify-center">Nothing here yet</p>
            <h2 className="type-display mt-5 text-[clamp(1.6rem,4vw,2.6rem)] text-bone">
              No events match this filter.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[0.98rem] leading-relaxed text-fog">
              Try a different timeframe, or ask us directly — private experiences are commissioned
              all year round regardless of the public calendar.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/events" className="btn-ghost">
                Clear filters
              </Link>
              <Link href="/private-experiences" className="btn-ember">
                Plan a private experience
              </Link>
            </div>
          </Reveal>
        )}
      </section>

      {/* --- closing CTA --------------------------------------------------- */}
      <section className="shell mt-20">
        <Reveal className="relative overflow-hidden rounded-sm border border-bone/10 bg-ink p-8 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/12 blur-[110px]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Don&apos;t see your date?</p>
              <h2 className="type-display mt-4 max-w-[24ch] text-[clamp(1.5rem,3.6vw,2.4rem)] text-bone">
                Private experiences are built on request, all year.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/private-experiences#enquiry" className="btn-ember">
                Start an enquiry
              </Link>
              <a
                href={whatsappLink(
                  settings.whatsapp,
                  "Hi SHUNYA — I'd like to know about upcoming events.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
          ]),
          eventListLd(visible),
        ]}
      />

      <p className="shell mt-10 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-ash/85">
        {SITE.name} lists only confirmed events. Placeholder listings are labelled and removed
        automatically once real dates are published.
      </p>
    </div>
  );
}
