"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { formatDateTime } from "@/lib/format";
import { ENQUIRY_TYPE_LABELS } from "@/lib/seed";
import { whatsappLink } from "@/lib/site";
import type { Enquiry, EnquiryType } from "@/lib/types";

const TYPE_ORDER: (EnquiryType | "all")[] = [
  "all",
  "private-experience",
  "artist-collaboration",
  "brand-partnership",
  "sponsorship",
  "general",
];

export default function EnquiriesInbox({
  enquiries,
  contactEmail,
}: {
  enquiries: Enquiry[];
  contactEmail: string;
}) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<EnquiryType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const visible = useMemo(
    () =>
      enquiries.filter(
        (enquiry) =>
          (typeFilter === "all" || enquiry.type === typeFilter) &&
          (statusFilter === "all" || enquiry.status === statusFilter),
      ),
    [enquiries, typeFilter, statusFilter],
  );

  async function setStatus(enquiry: Enquiry, status: Enquiry["status"]) {
    setBusyId(enquiry.id);
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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

  async function remove(enquiry: Enquiry) {
    setBusyId(enquiry.id);
    try {
      const response = await fetch(`/api/admin/enquiries/${enquiry.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) setMessage(payload.error ?? "Delete failed.");
      else {
        setOpenId(null);
        router.refresh();
      }
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const chip = (active: boolean) =>
    `rounded-sm border px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] transition-colors ${
      active
        ? "border-ember bg-ember/15 text-bone"
        : "border-bone/15 text-fog hover:border-bone/40 hover:text-bone"
    }`;

  return (
    <div className="space-y-6">
      {message ? (
        <p role="status" className="rounded-sm border border-bone/15 bg-charcoal/60 p-3 text-[0.85rem] text-fog">
          {message}
        </p>
      ) : null}

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="basis-full" />
        {TYPE_ORDER.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTypeFilter(option)}
            aria-pressed={typeFilter === option}
            className={chip(typeFilter === option)}
          >
            {option === "all" ? "All types" : ENQUIRY_TYPE_LABELS[option]}
          </button>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-bone/15 sm:block" />
        {(["all", "new", "read", "archived"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatusFilter(option)}
            aria-pressed={statusFilter === option}
            className={chip(statusFilter === option)}
          >
            {option}
          </button>
        ))}

        {/* The inbox is where enquiries are read; this is how they leave the site. */}
        <a
          href="/api/admin/enquiries/export"
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-bone/20 px-3.5 py-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-fog transition-colors hover:border-bone/50 hover:text-bone"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1v7M3 5.5 6 8l3-2.5M1.5 10.5h9" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Download CSV
        </a>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-sm border border-bone/12 bg-charcoal/40 p-8 text-center">
          <p className="text-[0.95rem] text-fog">
            No enquiries match this filter yet. Website submissions appear here instantly.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-bone/10 overflow-hidden rounded-sm border border-bone/12">
          {visible.map((enquiry) => {
            const isOpen = openId === enquiry.id;
            return (
              <li key={enquiry.id} className="bg-charcoal/30">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : enquiry.id)}
                    aria-expanded={isOpen}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex flex-wrap items-center gap-3">
                      <span className="text-[0.95rem] text-bone">{enquiry.name}</span>
                      <span
                        className={`rounded-sm border px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.16em] ${
                          enquiry.status === "new"
                            ? "border-ember/50 bg-ember/10 text-ember-glow"
                            : "border-bone/15 text-ash"
                        }`}
                      >
                        {enquiry.status}
                      </span>
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ash">
                        {ENQUIRY_TYPE_LABELS[enquiry.type]}
                      </span>
                    </span>
                    <span className="mt-1 block truncate font-mono text-[0.55rem] uppercase tracking-[0.16em] text-ash">
                      {formatDateTime(enquiry.createdAt)} · {enquiry.email}
                      {enquiry.source ? ` · from ${enquiry.source}` : ""}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {enquiry.status !== "read" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(enquiry, "read")}
                        disabled={busyId === enquiry.id}
                        className={chip(false)}
                      >
                        Mark read
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        setStatus(enquiry, enquiry.status === "archived" ? "new" : "archived")
                      }
                      disabled={busyId === enquiry.id}
                      className={chip(false)}
                    >
                      {enquiry.status === "archived" ? "Restore" : "Archive"}
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="grid gap-6 border-t border-bone/10 bg-void/40 p-5 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-4">
                      <p className="whitespace-pre-line text-[0.92rem] leading-relaxed text-fog">
                        {enquiry.message}
                      </p>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["Email", enquiry.email],
                          ["Phone", enquiry.phone || "—"],
                          ["Company", enquiry.company || "—"],
                          ["Event type", enquiry.eventType || "—"],
                          ["Date", enquiry.eventDate || "—"],
                          ["Location", enquiry.location || "—"],
                          ["Guests", enquiry.guestCount || "—"],
                          ["Budget", enquiry.budgetRange || "—"],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ash">
                              {label}
                            </dt>
                            <dd className="mt-1 text-[0.85rem] text-bone">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ash">
                        Reference {enquiry.id.slice(-6).toUpperCase()}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <a
                        href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                          `Re: your SHUNYA enquiry (${enquiry.id.slice(-6).toUpperCase()})`,
                        )}`}
                        className="btn-ember w-full"
                      >
                        Reply by email
                      </a>
                      {enquiry.phone ? (
                        <a
                          href={whatsappLink(
                            enquiry.phone,
                            `Hi ${enquiry.name}, thank you for your enquiry to SHUNYA.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost w-full"
                        >
                          Open WhatsApp
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => remove(enquiry)}
                        disabled={busyId === enquiry.id}
                        className="w-full rounded-sm border border-bone/20 px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog transition-colors hover:border-ember hover:text-ember-glow disabled:opacity-50"
                      >
                        Delete enquiry
                      </button>
                      <p className="font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.16em] text-ash">
                        Studio inbox · also forwarded to your webhook when configured. Brand email:{" "}
                        {contactEmail}
                      </p>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
