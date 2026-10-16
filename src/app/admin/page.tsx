import Link from "next/link";

import { formatDateTime, isPast } from "@/lib/format";
import { ENQUIRY_TYPE_LABELS } from "@/lib/seed";
import { getEnquiries, getEvents, getGallery, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-sm border border-bone/12 bg-charcoal/40 p-5 transition-colors duration-300 hover:border-bone/30"
    >
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">{label}</p>
      <p className="type-mega mt-3 text-[2.4rem] text-bone">{value}</p>
      {hint ? <p className="mt-1 text-[0.78rem] text-fog">{hint}</p> : null}
      <span className="mt-4 inline-block font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash transition-colors group-hover:text-ember-glow">
        Manage →
      </span>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [events, gallery, enquiries, settings] = await Promise.all([
    getEvents({ includeDrafts: true }),
    getGallery({ includeHidden: true }),
    getEnquiries(),
    getSettings(),
  ]);

  const upcoming = events.filter((event) => !isPast(event.endDate ?? event.startDate));
  const drafts = events.filter((event) => event.status === "draft");
  const unread = enquiries.filter((enquiry) => enquiry.status === "new");

  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          Studio dashboard
        </p>
        <h1 className="type-display mt-3 text-[clamp(1.8rem,4.4vw,2.8rem)] text-bone">
          Content control room
        </h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-fog">
          Everything published on the SHUNYA website is managed here. Public pages read directly from
          this store, so changes appear on the live site immediately after saving.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Upcoming events"
          value={upcoming.length}
          hint={`${events.length} total · ${drafts.length} draft`}
          href="/admin/events"
        />
        <Stat
          label="New enquiries"
          value={unread.length}
          hint={`${enquiries.length} in the inbox`}
          href="/admin/enquiries"
        />
        <Stat
          label="Gallery frames"
          value={gallery.length}
          hint={`${gallery.filter((item) => !item.published).length} hidden`}
          href="/admin/gallery"
        />
        <Stat label="Settings" value="⚙" hint="Contact details, hero film, password" href="/admin/settings" />
      </div>

      {/* content health */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
            Before launch checklist
          </p>
          <ul className="mt-5 space-y-4 text-[0.9rem]">
            {[
              {
                done: settings.contactEmail !== "hello@shunya.example",
                label: "Replace placeholder contact email",
                href: "/admin/settings",
              },
              {
                done: settings.whatsapp !== "910000000000",
                label: "Set the real WhatsApp number",
                href: "/admin/settings",
              },
              {
                done: settings.instagram !== "https://instagram.com/shunya.example",
                label: "Set the real Instagram profile",
                href: "/admin/settings",
              },
              {
                done: events.every((event) => !event.title.includes("TBA")),
                label: "Replace placeholder event listings",
                href: "/admin/events",
              },
              {
                done: gallery.every((item) => !(item.credit ?? "").includes("placeholder")),
                label: "Replace placeholder gallery imagery",
                href: "/admin/gallery",
              },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.6rem] ${
                    item.done
                      ? "border-[#4ade80]/60 bg-[#4ade80]/15 text-[#4ade80]"
                      : "border-ember/50 bg-ember/10 text-ember-glow"
                  }`}
                  aria-hidden="true"
                >
                  {item.done ? "✓" : "!"}
                </span>
                <Link href={item.href} className="text-fog transition-colors hover:text-bone">
                  {item.label}
                  <span className="sr-only">
                    {" "}
                    — {item.done ? "complete" : "outstanding"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
              Latest enquiries
            </p>
            <Link
              href="/admin/enquiries"
              className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ember-glow"
            >
              Open inbox →
            </Link>
          </div>

          {enquiries.length ? (
            <ul className="mt-5 divide-y divide-bone/10">
              {enquiries.slice(0, 5).map((enquiry) => (
                <li key={enquiry.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.9rem] text-bone">{enquiry.name}</p>
                    <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">
                      {ENQUIRY_TYPE_LABELS[enquiry.type]} · {formatDateTime(enquiry.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-sm border px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.18em] ${
                      enquiry.status === "new"
                        ? "border-ember/50 bg-ember/10 text-ember-glow"
                        : "border-bone/15 text-ash"
                    }`}
                  >
                    {enquiry.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-[0.9rem] leading-relaxed text-fog">
              No enquiries yet. Submissions from the website land here instantly and are also
              forwarded to the configured webhook, if one is set.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-sm border border-bone/12 bg-charcoal/40 p-6">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          How content is stored
        </p>
        <div className="mt-4 grid gap-6 text-[0.88rem] leading-relaxed text-fog md:grid-cols-3">
          <p>
            Events, gallery frames, enquiries and settings live in{" "}
            <code className="font-mono text-bone">data/shunya.json</code>. Point{" "}
            <code className="font-mono text-bone">DATA_DIR</code> at a mounted volume in production
            so content survives redeploys.
          </p>
          <p>
            Uploaded images are written to{" "}
            <code className="font-mono text-bone">public/uploads</code>. If the host filesystem is
            read-only, paste an external image URL instead — the field accepts both.
          </p>
          <p>
            Monthly backups: copy <code className="font-mono text-bone">data/shunya.json</code> and
            the uploads folder. That pair is the entire content set.
          </p>
        </div>
      </section>
    </div>
  );
}
