import type { Metadata } from "next";
import Link from "next/link";

import EnquiryForm from "@/components/forms/EnquiryForm";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { DEFAULT_WHATSAPP_MESSAGE, ENQUIRY_INTENTS, whatsappLink } from "@/lib/site";
import { breadcrumbLd } from "@/lib/seo";
import { getSettings } from "@/lib/store";
import type { EnquiryType } from "@/lib/types";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Booking",
  description:
    "Contact SHUNYA for private bookings, artist collaborations, brand partnerships, sponsorships and general enquiries. WhatsApp and email channels are open.",
  alternates: { canonical: "/contact" },
};

type SearchParams = Promise<{ intent?: string }>;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ intent }, settings] = await Promise.all([searchParams, getSettings()]);

  const matched = ENQUIRY_INTENTS.find((item) => item.id === intent || item.type === intent);
  const defaultIntent: EnquiryType = matched?.type ?? "private-experience";

  return (
    <div className="pb-24 pt-28 md:pb-32 md:pt-36">
      {/* --- header --------------------------------------------------------- */}
      <PageHeader
        index="06"
        eyebrow="Contact & booking"
        meta={<span>Replies to every serious enquiry</span>}
        title={
          <>
            Let&apos;s talk
            <span className="block text-ash">about the room.</span>
          </>
        }
        lead="Five routes in. Choose the one that fits and the enquiry lands with the right person — private bookings, artist collaborations, brand partnerships, sponsorships or general questions."
      />

      {/* --- intent routes --------------------------------------------------- */}
      <section className="shell mt-14" aria-label="Enquiry types">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ENQUIRY_INTENTS.map((item, index) => {
            const active = (matched?.id ?? "") === item.id;
            return (
              <Reveal
                key={item.id}
                delay={index * 0.05}
                className={`rounded-sm border p-6 transition-colors duration-500 ${
                  active ? "border-ember/60 bg-ember/5" : "border-bone/12 bg-charcoal/40"
                }`}
              >
                <p className="font-mono text-[0.55rem] tracking-[0.3em] text-ash">{item.index}</p>
                <h2 className="type-display mt-4 text-[1.25rem] text-bone">{item.label}</h2>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-fog">{item.blurb}</p>
                <Link
                  href={`/contact?intent=${item.id}#enquiry`}
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bone"
                >
                  <span className="link-underline">{active ? "Selected" : "Enquire"}</span>
                  <svg width="18" height="8" viewBox="0 0 20 8" fill="none" aria-hidden="true">
                    <path d="M0 4h18M15 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* --- form + channels ------------------------------------------------- */}
      <section id="enquiry" className="shell mt-20 scroll-mt-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <EnquiryForm
              source="contact"
              variant="full"
              defaultIntent={defaultIntent}
              heading="Send an enquiry"
              whatsappNumber={settings.whatsapp}
              contactEmail={settings.contactEmail}
            />
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.06} className="card-dark p-6 md:p-7">
              <p className="eyebrow">Direct channels</p>
              <ul className="mt-5 space-y-5">
                <li>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                    WhatsApp
                  </p>
                  <a
                    href={whatsappLink(settings.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline mt-2 inline-block text-[0.95rem] text-bone"
                  >
                    {settings.contactPhone}
                  </a>
                  <p className="mt-1 text-[0.78rem] text-fog">
                    Fastest route for private bookings and urgent date questions.
                  </p>
                </li>
                <li>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                    Email
                  </p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="link-underline mt-2 inline-block text-[0.95rem] text-bone"
                  >
                    {settings.contactEmail}
                  </a>
                  <p className="mt-1 text-[0.78rem] text-fog">
                    Best for briefs, decks, riders and partnership documents.
                  </p>
                </li>
                <li>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                    Instagram
                  </p>
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline mt-2 inline-block break-all text-[0.95rem] text-bone"
                  >
                    {settings.instagram.replace(/^https?:\/\//, "")}
                  </a>
                </li>
                <li>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                    Studio address
                  </p>
                  <p className="mt-2 text-[0.95rem] text-bone">Address to be confirmed</p>
                </li>
              </ul>

              <p className="mt-6 rounded-sm border border-ember/30 bg-ember/5 p-3 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.16em] text-ember-glow">
                Placeholder contact details · replace in the SHUNYA studio before launch
              </p>
            </Reveal>

            <Reveal delay={0.1} className="card-dark p-6 md:p-7">
              <p className="eyebrow">What happens next</p>
              <ol className="mt-5 space-y-4">
                {[
                  "Your enquiry is logged in the SHUNYA studio with a reference number.",
                  "The team reviews it and replies by email or WhatsApp.",
                  "For private experiences we follow up with a concept direction and a quote.",
                  "For artist and brand enquiries we arrange a call with the right person.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-mono text-[0.58rem] tracking-[0.24em] text-ember-glow">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.9rem] leading-relaxed text-fog">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.14} className="card-dark p-6 md:p-7">
              <p className="eyebrow">Response times</p>
              <p className="mt-4 text-[0.9rem] leading-relaxed text-fog">
                We aim to respond to every serious enquiry within a few working days. Date-critical
                private bookings are handled fastest over WhatsApp.
              </p>
              <Link href="/events" className="btn-ghost mt-6 w-full justify-center">
                Check the event calendar
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- closing --------------------------------------------------------- */}
      <section className="shell mt-20">
        <SectionHeading
          align="center"
          eyebrow="Studio"
          title="Managing SHUNYA content?"
          lead="Events, galleries, enquiries and contact details are all editable from the SHUNYA studio — no developer required."
          size="md"
        />
        <Reveal delay={0.08} className="mt-8 flex justify-center">
          <Link href="/admin" className="btn-ghost">
            Open the studio
          </Link>
        </Reveal>
      </section>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

    </div>
  );
}
