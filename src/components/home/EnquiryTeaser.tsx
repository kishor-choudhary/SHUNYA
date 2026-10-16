import Link from "next/link";

import EnquiryForm from "@/components/forms/EnquiryForm";
import Reveal from "@/components/Reveal";
import { EXPERIENCE_TYPES } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

/**
 * Private event enquiry — the homepage conversion block. A short version of the
 * full private experiences form, so a host can start without leaving the page.
 */
export default function EnquiryTeaser({ settings }: { settings: SiteSettings }) {
  return (
    <section id="enquire" className="relative overflow-hidden border-t border-bone/10 bg-ink py-20 md:py-28">
      <div className="mist -right-24 top-0 h-[32rem] w-[32rem]" />
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-ember/14 blur-[130px]" />

      <div className="shell relative grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" />
              Private event enquiry
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="type-display mt-6 text-[clamp(1.9rem,5.2vw,3.6rem)] text-bone">
              Tell us the date.
              <span className="block text-ash">We will build the night.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="lede mt-6 max-w-lg">
              Birthdays, pool parties, sundowners, theme parties and exclusive celebrations —
              produced end to end. Share the basics and the SHUNYA team will come back with a
              concept.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-9 flex flex-wrap gap-2">
            {EXPERIENCE_TYPES.slice(0, 7).map((type) => (
              <span
                key={type.id}
                className="rounded-sm border border-bone/15 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-fog"
              >
                {type.label}
              </span>
            ))}
          </Reveal>

          <Reveal delay={0.24} className="mt-10 grid gap-4 border-t border-bone/10 pt-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">
                WhatsApp
              </p>
              <p className="mt-2 text-[0.9rem] text-bone">{settings.contactPhone}</p>
            </div>
            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">Email</p>
              <p className="mt-2 text-[0.9rem] text-bone">{settings.contactEmail}</p>
            </div>
            <p className="sm:col-span-2 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.18em] text-ash/90">
              Placeholder contact details · editable in the SHUNYA studio
            </p>
          </Reveal>

          <Reveal delay={0.28} className="mt-8">
            <Link href="/private-experiences" className="btn-ghost">
              See the full private experience
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <EnquiryForm
            variant="compact"
            source="home-enquiry"
            defaultIntent="private-experience"
            intents={[
              {
                id: "private-bookings",
                type: "private-experience",
                index: "01",
                label: "Private Experience",
                blurb: "Celebrations produced end to end, hosted with discretion.",
              },
              {
                id: "general",
                type: "general",
                index: "02",
                label: "Something else",
                blurb: "Press, venues, artists, suppliers or general questions.",
              },
            ]}
            heading="Start your enquiry"
            whatsappNumber={settings.whatsapp}
            contactEmail={settings.contactEmail}
          />
        </Reveal>
      </div>
    </section>
  );
}
