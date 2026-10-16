"use client";

import { useMemo, useState } from "react";

import {
  BUDGET_RANGES,
  ENQUIRY_INTENTS,
  EXPERIENCE_TYPES,
  GUEST_COUNTS,
  whatsappLink,
} from "@/lib/site";
import type { EnquiryType } from "@/lib/types";

type Status = "idle" | "sending" | "sent" | "error";

interface EnquiryFormProps {
  /** Which enquiry types this instance offers. */
  intents?: { id: string; type: EnquiryType; index: string; label: string; blurb: string }[];
  defaultIntent?: EnquiryType;
  /** `compact` is the homepage / inline version; `full` is the dedicated page. */
  variant?: "full" | "compact";
  /** Page attribution recorded with the enquiry. */
  source: string;
  whatsappNumber: string;
  contactEmail: string;
  /** Heading rendered above the form. */
  heading?: string;
  /** Hide the intent picker when the section already implies the intent. */
  showIntentPicker?: boolean;
}

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  eventType: "",
  eventDate: "",
  location: "",
  guestCount: "",
  budgetRange: "",
  message: "",
  website: "", // honeypot
};

export default function EnquiryForm({
  intents = ENQUIRY_INTENTS,
  defaultIntent,
  variant = "full",
  source,
  whatsappNumber,
  contactEmail,
  heading,
  showIntentPicker = true,
}: EnquiryFormProps) {
  const [intent, setIntent] = useState<EnquiryType>(defaultIntent ?? intents[0]?.type ?? "general");
  const [values, setValues] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");

  const isPrivate = intent === "private-experience";
  const isBusiness = intent === "brand-partnership" || intent === "sponsorship";
  const isCompact = variant === "compact";

  const activeIntent = useMemo(
    () => intents.find((item) => item.type === intent),
    [intents, intent],
  );

  const set = (key: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((previous) => ({ ...previous, [key]: event.target.value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  /** Mirror of the server validation so mistakes are caught before the round-trip. */
  function clientValidate() {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (values.phone.trim() && values.phone.replace(/[^\d]/g, "").length < 7) {
      next.phone = "Enter a valid phone number.";
    }
    if (values.message.trim().length < 10) {
      next.message = "Tell us a little more (at least 10 characters).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    if (!clientValidate()) {
      const firstField = document.querySelector<HTMLElement>("[data-invalid='true']");
      firstField?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, type: intent, source }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        id?: string;
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setServerError(payload.error ?? "We couldn't send that. Please try again.");
        setStatus("error");
        return;
      }

      setReference(payload.id?.slice(-6).toUpperCase() ?? "");
      setStatus("sent");
      setValues({ ...EMPTY });
    } catch {
      setServerError("Network error — check your connection, or message us on WhatsApp.");
      setStatus("error");
    }
  }

  /* --- success state ------------------------------------------------------ */
  if (status === "sent") {
    const summary = [
      `SHUNYA enquiry${reference ? ` (ref ${reference})` : ""}`,
      `Type: ${activeIntent?.label ?? intent}`,
      `Name: ${values.name || "—"}`,
      values.eventDate ? `Date: ${values.eventDate}` : "",
      values.guestCount ? `Guests: ${values.guestCount}` : "",
      values.location ? `Location: ${values.location}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <div className="card-dark p-8 md:p-10" role="status" aria-live="polite">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ember text-white">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2 9.5 6.5 14 16 4" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
        <h3 className="type-display mt-6 text-[1.75rem] text-bone">Enquiry received</h3>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-fog">
          Thank you — your enquiry is with the SHUNYA team. We reply to private bookings, artist
          and partnership enquiries within a few working days.
          {reference ? (
            <>
              {" "}
              Your reference is{" "}
              <span className="font-mono text-bone">#{reference}</span>.
            </>
          ) : null}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={whatsappLink(whatsappNumber, summary)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ember"
          >
            Continue on WhatsApp
          </a>
          <button type="button" className="btn-ghost" onClick={() => setStatus("idle")}>
            Send another enquiry
          </button>
        </div>
        <p className="mt-6 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ash">
          Prefer email? {contactEmail}
        </p>
      </div>
    );
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`${source}-${key}-error`} className="mt-1.5 text-[0.75rem] text-ember-glow">
        {errors[key]}
      </p>
    ) : null;

  const inputProps = (key: keyof typeof EMPTY) => ({
    id: `${source}-${key}`,
    name: key,
    value: values[key],
    onChange: set(key),
    "data-invalid": errors[key] ? "true" : undefined,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${source}-${key}-error` : undefined,
    className: "field-dark",
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="card-dark p-6 md:p-8"
      aria-label="SHUNYA enquiry form"
    >
      {heading ? (
        <h3 className="type-display mb-6 text-[1.5rem] text-bone md:text-[1.75rem]">{heading}</h3>
      ) : null}

      {/* --- intent picker -------------------------------------------------- */}
      {showIntentPicker && intents.length > 1 ? (
        <fieldset className="mb-7">
          <legend className="eyebrow mb-3">What is this about?</legend>
          <div className="flex flex-wrap gap-2">
            {intents.map((item) => {
              const selected = item.type === intent;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIntent(item.type)}
                  aria-pressed={selected}
                  className={`rounded-sm border px-3.5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    selected
                      ? "border-ember bg-ember/15 text-bone"
                      : "border-bone/15 text-fog hover:border-bone/40 hover:text-bone"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {activeIntent ? (
            <p className="mt-3 max-w-lg text-[0.82rem] text-ash">{activeIntent.blurb}</p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${source}-name`} className="mb-2 block text-[0.8rem] text-fog">
            Name <span className="text-ember-glow">*</span>
          </label>
          <input
            {...inputProps("name")}
            autoComplete="name"
            placeholder="Your full name"
            required
          />
          {fieldError("name")}
        </div>

        <div>
          <label htmlFor={`${source}-email`} className="mb-2 block text-[0.8rem] text-fog">
            Email <span className="text-ember-glow">*</span>
          </label>
          <input
            {...inputProps("email")}
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
          />
          {fieldError("email")}
        </div>

        <div>
          <label htmlFor={`${source}-phone`} className="mb-2 block text-[0.8rem] text-fog">
            Phone / WhatsApp
          </label>
          <input
            {...inputProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 …"
          />
          {fieldError("phone")}
        </div>

        {isBusiness ? (
          <div>
            <label htmlFor={`${source}-company`} className="mb-2 block text-[0.8rem] text-fog">
              Company / Brand
            </label>
            <input {...inputProps("company")} autoComplete="organization" placeholder="Brand name" />
            {fieldError("company")}
          </div>
        ) : (
          <div>
            <label htmlFor={`${source}-location`} className="mb-2 block text-[0.8rem] text-fog">
              City / Location
            </label>
            <input {...inputProps("location")} placeholder="Where is it happening?" />
            {fieldError("location")}
          </div>
        )}
      </div>

      {/* --- private experience details ------------------------------------- */}
      {isPrivate ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${source}-eventType`} className="mb-2 block text-[0.8rem] text-fog">
              Event type
            </label>
            <select {...inputProps("eventType")}>
              <option value="">Select an occasion</option>
              {EXPERIENCE_TYPES.map((type) => (
                <option key={type.id} value={type.label}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${source}-eventDate`} className="mb-2 block text-[0.8rem] text-fog">
              Preferred date
            </label>
            <input {...inputProps("eventDate")} type="date" />
            {fieldError("eventDate")}
          </div>

          <div>
            <label htmlFor={`${source}-guestCount`} className="mb-2 block text-[0.8rem] text-fog">
              Guest count
            </label>
            <select {...inputProps("guestCount")}>
              <option value="">Select a range</option>
              {GUEST_COUNTS.map((count) => (
                <option key={count.id} value={count.label}>
                  {count.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${source}-budgetRange`} className="mb-2 block text-[0.8rem] text-fog">
              Budget range
            </label>
            <select {...inputProps("budgetRange")}>
              <option value="">Select a range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range.id} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[0.7rem] text-ash">
              Placeholder bands — confirm real ranges with the SHUNYA team.
            </p>
          </div>
        </div>
      ) : null}

      {!isCompact && !isPrivate ? (
        <div className="mt-5">
          <label htmlFor={`${source}-eventDate`} className="mb-2 block text-[0.8rem] text-fog">
            {isBusiness ? "Campaign / activation date" : "Relevant date"}
          </label>
          <input
            {...inputProps("eventDate")}
            type="date"
            aria-label={isBusiness ? "Campaign date" : "Relevant date"}
          />
          {fieldError("eventDate")}
        </div>
      ) : null}

      <div className="mt-5">
        <label htmlFor={`${source}-message`} className="mb-2 block text-[0.8rem] text-fog">
          {isPrivate ? "Tell us about the experience" : "Your message"}{" "}
          <span className="text-ember-glow">*</span>
        </label>
        <textarea
          {...inputProps("message")}
          rows={isCompact ? 3 : 5}
          placeholder={
            isPrivate
              ? "The occasion, the mood, the city, anything we should know…"
              : "What are you building? Dates, city, scale, anything useful."
          }
          required
        />
        {fieldError("message")}
      </div>

      {/* Honeypot: hidden from users, ignored visually, catches naive bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${source}-website`}>Website</label>
        <input {...inputProps("website")} tabIndex={-1} autoComplete="off" />
      </div>

      {serverError ? (
        <p role="alert" className="mt-5 rounded-sm border border-ember/40 bg-ember/10 p-3 text-[0.85rem] text-ember-glow">
          {serverError}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn-ember w-full sm:w-auto" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
          {status !== "sending" ? (
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 6h9M6.5 1.5 11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : null}
        </button>
        <p className="font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.18em] text-ash">
          Your details stay with SHUNYA. No spam, ever.
        </p>
      </div>
    </form>
  );
}
