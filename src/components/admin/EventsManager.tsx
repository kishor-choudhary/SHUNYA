"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatDateTime, isPast } from "@/lib/format";
import type { ShunyaEvent } from "@/lib/types";

export default function EventsManager({ events }: { events: ShunyaEvent[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function patchEvent(event: ShunyaEvent, patch: Partial<ShunyaEvent>) {
    setBusyId(event.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          subtitle: event.subtitle,
          category: event.category,
          status: event.status,
          featured: event.featured,
          startDate: event.startDate,
          endDate: event.endDate,
          timezoneLabel: event.timezoneLabel,
          venue: event.venue,
          address: event.address,
          city: event.city,
          shortDescription: event.shortDescription,
          description: event.description,
          lineup: event.lineup,
          poster: event.poster,
          heroImage: event.heroImage,
          ticketPrice: event.ticketPrice,
          ticketUrl: event.ticketUrl,
          ticketNote: event.ticketNote,
          faqs: event.faqs,
          slug: event.slug,
          ...patch,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Update failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(event: ShunyaEvent) {
    setBusyId(event.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Delete failed.");
        return;
      }
      setConfirmId(null);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  /** Start the next edition from an existing event — always lands as a draft. */
  async function duplicate(event: ShunyaEvent) {
    setBusyId(event.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/events/${event.id}/duplicate`, { method: "POST" });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Duplicate failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-sm border border-ember/40 bg-ember/10 p-3 text-[0.85rem] text-ember-glow">
          {error}
        </p>
      ) : null}

      {events.length === 0 ? (
        <div className="rounded-sm border border-bone/12 bg-charcoal/40 p-8 text-center">
          <p className="text-[0.95rem] text-fog">
            No events yet. Create the first listing — drafts stay hidden from the public site until
            you publish them.
          </p>
          <Link href="/admin/events/new" className="btn-ember mt-6">
            Create an event
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-bone/12">
          {/* header row (desktop) */}
          <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_0.7fr_auto] gap-4 border-b border-bone/10 bg-charcoal/60 px-5 py-3 font-mono text-[0.52rem] uppercase tracking-[0.2em] text-ash lg:grid">
            <span>Event</span>
            <span>When</span>
            <span>Status</span>
            <span>Tickets</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-bone/10">
            {events.map((event) => {
              const past = isPast(event.endDate ?? event.startDate);
              return (
                <li
                  key={event.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1.6fr_1fr_0.8fr_0.7fr_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="block truncate text-[0.95rem] text-bone transition-colors hover:text-ember-glow"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-0.5 truncate font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">
                      {event.category} · {event.city}
                      {event.featured ? " · featured" : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.85rem] text-fog">{formatDateTime(event.startDate)}</p>
                    {past ? (
                      <p className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ash">
                        Past
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        patchEvent(event, {
                          status: event.status === "published" ? "draft" : "published",
                        })
                      }
                      disabled={busyId === event.id}
                      className={`rounded-sm border px-2.5 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] transition-colors disabled:opacity-50 ${
                        event.status === "published"
                          ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]"
                          : "border-dusk/50 bg-dusk/12 text-dusk"
                      }`}
                      aria-label={`Toggle status for ${event.title}`}
                    >
                      {event.status}
                    </button>
                  </div>

                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fog">
                    {event.ticketPrice}
                    <span className="mt-0.5 block text-[0.5rem] text-ash">
                      {event.ticketUrl && event.ticketUrl !== "#" ? "link live" : "no link"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      className="rounded-sm border border-bone/15 px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-bone/40 hover:text-bone"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="rounded-sm border border-bone/15 px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone transition-colors hover:border-ember hover:text-ember-glow"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => duplicate(event)}
                      disabled={busyId === event.id}
                      title="Copy this event's details into a new draft"
                      className="rounded-sm border border-bone/15 px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-bone/40 hover:text-bone disabled:opacity-50"
                    >
                      {busyId === event.id ? "…" : "Duplicate"}
                    </button>
                    {confirmId === event.id ? (
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => remove(event)}
                          disabled={busyId === event.id}
                          className="rounded-sm bg-ember px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-white disabled:opacity-50"
                        >
                          {busyId === event.id ? "…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-ash hover:text-bone"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(event.id)}
                        className="rounded-sm border border-bone/15 px-3 py-1.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-ember hover:text-ember-glow"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
