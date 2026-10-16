"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import UploadField from "@/components/admin/UploadField";
import type { EventFaq, LineupArtist, ShunyaEvent } from "@/lib/types";

const CATEGORIES = [
  "Electronic Music",
  "Private Experience",
  "Open Air",
  "Warehouse Series",
  "Late Session",
  "Festival",
  "Brand Activation",
];

function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

interface FormState {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  status: "published" | "draft";
  featured: boolean;
  startDate: string;
  endDate: string;
  timezoneLabel: string;
  venue: string;
  address: string;
  city: string;
  shortDescription: string;
  description: string;
  poster: string;
  heroImage: string;
  ticketPrice: string;
  ticketUrl: string;
  ticketNote: string;
  lineup: LineupArtist[];
  faqs: EventFaq[];
}

function initialState(event?: ShunyaEvent): FormState {
  return {
    title: event?.title ?? "",
    subtitle: event?.subtitle ?? "",
    slug: event?.slug ?? "",
    category: event?.category ?? "Electronic Music",
    status: event?.status ?? "draft",
    featured: event?.featured ?? false,
    startDate: toLocalInput(event?.startDate),
    endDate: toLocalInput(event?.endDate),
    timezoneLabel: event?.timezoneLabel ?? "IST (UTC+5:30)",
    venue: event?.venue ?? "",
    address: event?.address ?? "",
    city: event?.city ?? "",
    shortDescription: event?.shortDescription ?? "",
    description: event?.description ?? "",
    poster: event?.poster ?? "",
    heroImage: event?.heroImage ?? "",
    ticketPrice: event?.ticketPrice ?? "TBA",
    ticketUrl: event?.ticketUrl ?? "#",
    ticketNote: event?.ticketNote ?? "",
    lineup: event?.lineup?.length ? event.lineup : [{ name: "", role: "Headline", time: "" }],
    faqs: event?.faqs?.length ? event.faqs : [{ q: "", a: "" }],
  };
}

/**
 * Full event editor. Placeholders are welcome — the point is that the brand
 * never has to publish invented details: leave a field as "TBA"/"To be
 * confirmed" and the public page shows it honestly.
 */
export default function EventEditor({ event }: { event?: ShunyaEvent }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(event));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEdit = Boolean(event);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key as string]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  };

  async function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setStatus("saving");
    setMessage("");

    const payload = {
      ...form,
      startDate: fromLocalInput(form.startDate),
      endDate: fromLocalInput(form.endDate) || undefined,
      lineup: form.lineup.filter((artist) => artist.name.trim().length > 0),
      faqs: form.faqs.filter((faq) => faq.q.trim() && faq.a.trim()),
    };

    try {
      const response = await fetch(
        isEdit ? `/api/admin/events/${event?.id}` : "/api/admin/events",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: Record<string, string>;
        event?: ShunyaEvent;
      };

      if (!response.ok || !data.ok) {
        setErrors(data.fields ?? {});
        setMessage(data.error ?? "Could not save the event.");
        setStatus("error");
        return;
      }

      setStatus("saved");
      setMessage(isEdit ? "Event updated." : "Event created. It is live on the site.");
      if (!isEdit && data.event) {
        router.push(`/admin/events/${data.event.id}`);
        return;
      }
      router.refresh();
    } catch {
      setMessage("Network error — please try again.");
      setStatus("error");
    }
  }

  async function onDelete() {
    if (!event) return;
    setStatus("saving");
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Delete failed.");
        setStatus("error");
        return;
      }
      router.push("/admin/events");
    } catch {
      setMessage("Network error — please try again.");
      setStatus("error");
    }
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="mt-1.5 text-[0.75rem] text-ember-glow">{errors[key]}</p>
    ) : null;

  const input = (key: keyof FormState) => ({
    id: `event-${key}`,
    className: "field-dark",
    "aria-invalid": errors[key] ? true : undefined,
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* --- header -------------------------------------------------------- */}
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
            {isEdit ? "Edit event" : "New event"}
          </p>
          <h1 className="type-display mt-3 text-[clamp(1.5rem,3.6vw,2.2rem)] text-bone">
            {form.title || "Untitled event"}
          </h1>
          <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-fog">
            Leave any detail as &ldquo;To be confirmed&rdquo; or &ldquo;TBA&rdquo; until it is real —
            the public page will present it honestly rather than inventing information.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isEdit ? (
            <Link
              href={`/events/${event?.slug}`}
              target="_blank"
              className="rounded-sm border border-bone/20 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-bone/50 hover:text-bone"
            >
              View live
            </Link>
          ) : null}
          <button type="submit" className="btn-ember" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : isEdit ? "Save changes" : "Create event"}
          </button>
        </div>
      </header>

      {message ? (
        <p
          role="status"
          className={`rounded-sm border p-3 text-[0.85rem] ${
            status === "error"
              ? "border-ember/40 bg-ember/10 text-ember-glow"
              : "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]"
          }`}
        >
          {message}
        </p>
      ) : null}

      {/* --- basics -------------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Basics</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="event-title" className="mb-2 block text-[0.8rem] text-fog">
              Event name <span className="text-ember-glow">*</span>
            </label>
            <input
              {...input("title")}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. SHUNYA 01 — TBA"
            />
            {fieldError("title")}
          </div>

          <div>
            <label htmlFor="event-subtitle" className="mb-2 block text-[0.8rem] text-fog">
              Subtitle
            </label>
            <input
              {...input("subtitle")}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Warehouse Series / Late Session"
            />
          </div>

          <div>
            <label htmlFor="event-slug" className="mb-2 block text-[0.8rem] text-fog">
              URL slug
            </label>
            <input
              {...input("slug")}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="auto-generated from the name"
            />
            {fieldError("slug")}
          </div>

          <div>
            <label htmlFor="event-category" className="mb-2 block text-[0.8rem] text-fog">
              Category <span className="text-ember-glow">*</span>
            </label>
            <select
              {...input("category")}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldError("category")}
          </div>

          <div className="flex items-end gap-6">
            <div>
              <label htmlFor="event-status" className="mb-2 block text-[0.8rem] text-fog">
                Status
              </label>
              <select
                {...input("status")}
                value={form.status}
                onChange={(e) => set("status", e.target.value as "published" | "draft")}
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </select>
            </div>
            <label className="flex items-center gap-3 pb-3 text-[0.85rem] text-fog">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-[var(--color-ember)]"
              />
              Feature on the events page
            </label>
          </div>
        </div>
      </section>

      {/* --- when & where --------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">When & where</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="event-startDate" className="mb-2 block text-[0.8rem] text-fog">
              Starts <span className="text-ember-glow">*</span>
            </label>
            <input
              {...input("startDate")}
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
            {fieldError("startDate")}
          </div>
          <div>
            <label htmlFor="event-endDate" className="mb-2 block text-[0.8rem] text-fog">
              Ends
            </label>
            <input
              {...input("endDate")}
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
            {fieldError("endDate")}
          </div>
          <div>
            <label htmlFor="event-timezoneLabel" className="mb-2 block text-[0.8rem] text-fog">
              Timezone label
            </label>
            <input
              {...input("timezoneLabel")}
              value={form.timezoneLabel}
              onChange={(e) => set("timezoneLabel", e.target.value)}
              placeholder="IST (UTC+5:30)"
            />
          </div>
          <div>
            <label htmlFor="event-city" className="mb-2 block text-[0.8rem] text-fog">
              City <span className="text-ember-glow">*</span>
            </label>
            <input
              {...input("city")}
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="City to be confirmed"
            />
            {fieldError("city")}
          </div>
          <div>
            <label htmlFor="event-venue" className="mb-2 block text-[0.8rem] text-fog">
              Venue <span className="text-ember-glow">*</span>
            </label>
            <input
              {...input("venue")}
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              placeholder="Venue to be confirmed"
            />
            {fieldError("venue")}
          </div>
          <div>
            <label htmlFor="event-address" className="mb-2 block text-[0.8rem] text-fog">
              Address (optional)
            </label>
            <input
              {...input("address")}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Published closer to the date"
            />
          </div>
        </div>
      </section>

      {/* --- copy ----------------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          Description
        </p>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="event-shortDescription" className="mb-2 block text-[0.8rem] text-fog">
              One-line summary <span className="text-ember-glow">*</span>
            </label>
            <input
              {...input("shortDescription")}
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="Shown on event cards and in search results"
            />
            {fieldError("shortDescription")}
          </div>
          <div>
            <label htmlFor="event-description" className="mb-2 block text-[0.8rem] text-fog">
              Full description <span className="text-ember-glow">*</span>
            </label>
            <textarea
              {...input("description")}
              rows={8}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Separate paragraphs with a blank line."
            />
            {fieldError("description")}
          </div>
        </div>
      </section>

      {/* --- imagery -------------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Imagery</p>
        <div className="mt-6 space-y-6">
          <UploadField
            label="Event poster (4:5 works best)"
            value={form.poster}
            onChange={(url) => set("poster", url)}
            hint="Used on cards, the event page and social previews."
          />
          {fieldError("poster")}

          <UploadField
            label="Hero image (optional, 16:9)"
            value={form.heroImage}
            onChange={(url) => set("heroImage", url)}
            hint="Falls back to the poster when empty."
          />
        </div>
      </section>

      {/* --- tickets -------------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Ticketing</p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="event-ticketPrice" className="mb-2 block text-[0.8rem] text-fog">
              Price display <span className="text-ember-glow">*</span>
            </label>
            <input
              {...input("ticketPrice")}
              value={form.ticketPrice}
              onChange={(e) => set("ticketPrice", e.target.value)}
              placeholder="TBA"
            />
            {fieldError("ticketPrice")}
            <p className="mt-1.5 text-[0.72rem] text-ash">Never invent a price — use TBA.</p>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="event-ticketUrl" className="mb-2 block text-[0.8rem] text-fog">
              Booking link
            </label>
            <input
              {...input("ticketUrl")}
              value={form.ticketUrl}
              onChange={(e) => set("ticketUrl", e.target.value)}
              placeholder="# (not on sale yet)"
            />
            {fieldError("ticketUrl")}
            <p className="mt-1.5 text-[0.72rem] text-ash">
              &ldquo;#&rdquo; keeps the button disabled with the note below.
            </p>
          </div>
          <div className="md:col-span-3">
            <label htmlFor="event-ticketNote" className="mb-2 block text-[0.8rem] text-fog">
              Ticketing note
            </label>
            <input
              {...input("ticketNote")}
              value={form.ticketNote}
              onChange={(e) => set("ticketNote", e.target.value)}
              placeholder="Ticket link activates with the official announcement."
            />
          </div>
        </div>
      </section>

      {/* --- lineup --------------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Artist lineup</p>
          <button
            type="button"
            onClick={() =>
              set("lineup", [...form.lineup, { name: "", role: "Support", time: "" }])
            }
            className="rounded-sm border border-bone/20 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-bone hover:border-ember hover:text-ember-glow"
          >
            + Add artist
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {form.lineup.map((artist, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1.6fr_0.8fr_0.8fr_auto]">
              <input
                className="field-dark"
                value={artist.name}
                onChange={(e) => {
                  const next = [...form.lineup];
                  next[index] = { ...artist, name: e.target.value };
                  set("lineup", next);
                }}
                placeholder="Artist name — or 'To be announced'"
                aria-label={`Artist ${index + 1} name`}
              />
              <input
                className="field-dark"
                value={artist.role ?? ""}
                onChange={(e) => {
                  const next = [...form.lineup];
                  next[index] = { ...artist, role: e.target.value };
                  set("lineup", next);
                }}
                placeholder="Headline / Support"
                aria-label={`Artist ${index + 1} role`}
              />
              <input
                className="field-dark"
                value={artist.time ?? ""}
                onChange={(e) => {
                  const next = [...form.lineup];
                  next[index] = { ...artist, time: e.target.value };
                  set("lineup", next);
                }}
                placeholder="23:30"
                aria-label={`Artist ${index + 1} set time`}
              />
              <button
                type="button"
                onClick={() => set("lineup", form.lineup.filter((_, i) => i !== index))}
                className="rounded-sm border border-bone/15 px-3 py-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-fog hover:border-ember hover:text-ember-glow"
                aria-label={`Remove artist ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- faqs ----------------------------------------------------------- */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
            Event FAQs
          </p>
          <button
            type="button"
            onClick={() => set("faqs", [...form.faqs, { q: "", a: "" }])}
            className="rounded-sm border border-bone/20 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-bone hover:border-ember hover:text-ember-glow"
          >
            + Add FAQ
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {form.faqs.map((faq, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
              <input
                className="field-dark"
                value={faq.q}
                onChange={(e) => {
                  const next = [...form.faqs];
                  next[index] = { ...faq, q: e.target.value };
                  set("faqs", next);
                }}
                placeholder="Question"
                aria-label={`FAQ ${index + 1} question`}
              />
              <input
                className="field-dark"
                value={faq.a}
                onChange={(e) => {
                  const next = [...form.faqs];
                  next[index] = { ...faq, a: e.target.value };
                  set("faqs", next);
                }}
                placeholder="Answer"
                aria-label={`FAQ ${index + 1} answer`}
              />
              <button
                type="button"
                onClick={() => set("faqs", form.faqs.filter((_, i) => i !== index))}
                className="rounded-sm border border-bone/15 px-3 py-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-fog hover:border-ember hover:text-ember-glow"
                aria-label={`Remove FAQ ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- footer actions -------------------------------------------------- */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-ember" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : isEdit ? "Save changes" : "Create event"}
          </button>
          <Link
            href="/admin/events"
            className="rounded-sm border border-bone/20 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog hover:border-bone/50 hover:text-bone"
          >
            Back to events
          </Link>
        </div>

        {isEdit ? (
          confirmDelete ? (
            <span className="flex items-center gap-3">
              <button
                type="button"
                onClick={onDelete}
                className="rounded-sm bg-ember px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white"
              >
                Delete permanently
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ash hover:text-bone"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-sm border border-bone/20 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog hover:border-ember hover:text-ember-glow"
            >
              Delete event
            </button>
          )
        ) : null}
      </footer>
    </form>
  );
}
