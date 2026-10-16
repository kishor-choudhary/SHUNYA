"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import UploadField from "@/components/admin/UploadField";
import type { GalleryItem } from "@/lib/types";

const EMPTY = {
  src: "",
  alt: "",
  caption: "",
  location: "",
  date: "",
  orientation: "landscape" as GalleryItem["orientation"],
  credit: "",
  published: true,
};

export default function GalleryManager({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key as string]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  }

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setMessage(payload.error ?? "Could not add the frame.");
        return;
      }
      setDraft({ ...EMPTY });
      setMessage("Frame added to the gallery.");
      router.refresh();
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function patch(item: GalleryItem, patchBody: Partial<GalleryItem>) {
    setBusyId(item.id);
    try {
      const response = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.keys(patchBody).length === 1 && "published" in patchBody
            ? patchBody
            : {
                src: item.src,
                alt: item.alt,
                caption: item.caption,
                location: item.location,
                date: item.date,
                orientation: item.orientation,
                credit: item.credit,
                published: item.published,
                ...patchBody,
              },
        ),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) setMessage(payload.error ?? "Update failed.");
      else router.refresh();
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: GalleryItem) {
    setBusyId(item.id);
    try {
      const response = await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) setMessage(payload.error ?? "Delete failed.");
      else router.refresh();
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-10">
      {message ? (
        <p className="rounded-sm border border-bone/15 bg-charcoal/60 p-3 text-[0.85rem] text-fog" role="status">
          {message}
        </p>
      ) : null}

      {/* --- add frame ------------------------------------------------------ */}
      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">Add a frame</p>

        <form onSubmit={addItem} className="mt-6 space-y-6">
          <UploadField
            label="Image"
            value={draft.src}
            onChange={(url) => set("src", url)}
            hint="Upload a file or paste a path such as /media/gallery-01.jpg"
          />
          {errors.src ? <p className="text-[0.75rem] text-ember-glow">{errors.src}</p> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="gallery-alt" className="mb-2 block text-[0.8rem] text-fog">
                Alt text (describes the image for screen readers){" "}
                <span className="text-ember-glow">*</span>
              </label>
              <input
                id="gallery-alt"
                className="field-dark"
                value={draft.alt}
                onChange={(e) => set("alt", e.target.value)}
                placeholder="Crowd under red lasers in a dark warehouse"
              />
              {errors.alt ? <p className="mt-1.5 text-[0.75rem] text-ember-glow">{errors.alt}</p> : null}
            </div>

            <div>
              <label htmlFor="gallery-caption" className="mb-2 block text-[0.8rem] text-fog">
                Caption <span className="text-ember-glow">*</span>
              </label>
              <input
                id="gallery-caption"
                className="field-dark"
                value={draft.caption}
                onChange={(e) => set("caption", e.target.value)}
                placeholder="Opening night — placeholder frame"
              />
              {errors.caption ? (
                <p className="mt-1.5 text-[0.75rem] text-ember-glow">{errors.caption}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="gallery-location" className="mb-2 block text-[0.8rem] text-fog">
                Location
              </label>
              <input
                id="gallery-location"
                className="field-dark"
                value={draft.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Location to be confirmed"
              />
            </div>

            <div>
              <label htmlFor="gallery-date" className="mb-2 block text-[0.8rem] text-fog">
                Date label
              </label>
              <input
                id="gallery-date"
                className="field-dark"
                value={draft.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="TBC or MAR 2026"
              />
            </div>

            <div>
              <label htmlFor="gallery-orientation" className="mb-2 block text-[0.8rem] text-fog">
                Orientation <span className="text-ember-glow">*</span>
              </label>
              <select
                id="gallery-orientation"
                className="field-dark"
                value={draft.orientation}
                onChange={(e) => set("orientation", e.target.value as GalleryItem["orientation"])}
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="gallery-credit" className="mb-2 block text-[0.8rem] text-fog">
                Credit / usage note
              </label>
              <input
                id="gallery-credit"
                className="field-dark"
                value={draft.credit}
                onChange={(e) => set("credit", e.target.value)}
                placeholder="Photographer credit or placeholder notice"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn-ember" disabled={saving}>
              {saving ? "Adding…" : "Add frame"}
            </button>
            <label className="flex items-center gap-3 text-[0.85rem] text-fog">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 accent-[var(--color-ember)]"
              />
              Publish immediately
            </label>
          </div>
        </form>
      </section>

      {/* --- existing frames ------------------------------------------------ */}
      <section>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
            {items.length} frames in the library
          </p>
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-sm border border-bone/12 bg-charcoal/40"
            >
              <div className="relative aspect-[4/3]">
                <Image src={item.src} alt={item.alt} fill sizes="33vw" className="object-cover" />
                {!item.published ? (
                  <span className="absolute left-3 top-3 rounded-sm border border-dusk/50 bg-void/80 px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-dusk">
                    Hidden
                  </span>
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <p className="text-[0.85rem] text-bone">{item.caption}</p>
                <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ash">
                  {item.orientation} · {item.date} · {item.location}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => patch(item, { published: !item.published })}
                    disabled={busyId === item.id}
                    className="rounded-sm border border-bone/15 px-2.5 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-fog transition-colors hover:border-bone/40 hover:text-bone disabled:opacity-50"
                  >
                    {item.published ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={busyId === item.id}
                    className="rounded-sm border border-bone/15 px-2.5 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-fog transition-colors hover:border-ember hover:text-ember-glow disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
