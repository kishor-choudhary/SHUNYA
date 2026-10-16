import Image from "next/image";
import Link from "next/link";

import { formatEventDate, formatEventTime, isPast, relativeDayLabel } from "@/lib/format";
import type { ShunyaEvent } from "@/lib/types";

interface EventCardProps {
  event: ShunyaEvent;
  /** Position in the listing, used for the numeric index label. */
  index?: number;
  /** `wide` renders the feature layout used for the first card. */
  layout?: "compact" | "wide";
  /** Heading level, so the card never breaks the page's outline. */
  titleAs?: "h2" | "h3";
  priority?: boolean;
}

function TicketChip({ event }: { event: ShunyaEvent }) {
  const live = event.ticketUrl && event.ticketUrl !== "#";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-fog">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-ember" : "bg-ash/60"}`} />
      Tickets {event.ticketPrice || "TBA"}
    </span>
  );
}

export default function EventCard({
  event,
  index = 0,
  layout = "compact",
  titleAs = "h3",
  priority = false,
}: EventCardProps) {
  const past = isPast(event.endDate ?? event.startDate);
  const isWide = layout === "wide";
  const TitleTag = titleAs;

  return (
    <article
      className={`group relative isolate overflow-hidden rounded-sm border border-bone/10 bg-ink transition-colors duration-500 hover:border-bone/25 ${
        isWide ? "md:flex md:items-stretch" : ""
      }`}
    >
      {/* poster */}
      <div
        className={`relative overflow-hidden ${
          isWide ? "aspect-[16/10] md:aspect-auto md:w-[58%]" : "aspect-[4/5]"
        }`}
      >
        <Image
          src={event.poster}
          alt={`${event.title} poster`}
          fill
          priority={priority}
          sizes={isWide ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />

        {/* corner chips */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-sm border border-bone/25 bg-void/70 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone backdrop-blur-sm">
            {event.category}
          </span>
          {past ? (
            <span className="rounded-sm border border-bone/20 bg-void/70 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash backdrop-blur-sm">
              Past
            </span>
          ) : null}
          {event.status === "draft" ? (
            <span className="rounded-sm border border-dusk/50 bg-void/70 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-dusk backdrop-blur-sm">
              Draft
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4 font-mono text-[0.55rem] tracking-[0.24em] text-bone/60">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* date stamp */}
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <span className="type-display text-[2rem] leading-none text-bone text-shadow-cine">
            {formatEventDate(event.startDate).split(" ").slice(1, 3).join(" ")}
          </span>
          <span className="pb-1 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-fog">
            {formatEventTime(event.startDate)}
          </span>
        </div>
      </div>

      {/* body */}
      <div className={`flex flex-col justify-between gap-6 p-6 md:p-7 ${isWide ? "md:flex-1" : ""}`}>
        <div>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-ash">
            {relativeDayLabel(event.startDate)}
          </p>
          <TitleTag
            className={`type-display mt-3 text-bone ${
              isWide ? "text-[clamp(1.6rem,3.4vw,2.6rem)]" : "text-[1.5rem]"
            }`}
          >
            <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
              {event.title}
            </Link>
          </TitleTag>
          {event.subtitle ? (
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-fog">
              {event.subtitle}
            </p>
          ) : null}
          <p className="mt-4 max-w-xl text-[0.9rem] leading-relaxed text-fog">
            {event.shortDescription}
          </p>
        </div>

        <div className="space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-t border-bone/10 pt-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash">Venue</dt>
              <dd className="mt-1 text-[0.85rem] text-bone/90">{event.venue}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash">City</dt>
              <dd className="mt-1 text-[0.85rem] text-bone/90">{event.city}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <TicketChip event={event} />
            <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bone">
              Event details
              <svg
                width="20"
                height="8"
                viewBox="0 0 20 8"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-500 group-hover:translate-x-1"
              >
                <path d="M0 4h18M15 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
