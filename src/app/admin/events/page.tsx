import Link from "next/link";

import EventsManager from "@/components/admin/EventsManager";
import { getEvents } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await getEvents({ includeDrafts: true });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
            {events.length} listings
          </p>
          <h1 className="type-display mt-3 text-[clamp(1.6rem,4vw,2.4rem)] text-bone">Events</h1>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-fog">
            Add, edit, publish, unpublish or delete events. Drafts never appear on the public site.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn-ember">
          New event
        </Link>
      </header>

      <EventsManager events={events} />
    </div>
  );
}
