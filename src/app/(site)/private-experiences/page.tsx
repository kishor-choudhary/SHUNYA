import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Accordion from "@/components/Accordion";
import EnquiryForm from "@/components/forms/EnquiryForm";
import JsonLd from "@/components/JsonLd";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { breadcrumbLd, privateExperienceLd } from "@/lib/seo";
import {DEFAULT_WHATSAPP_MESSAGE, PROCESS_STEPS, SITE, whatsappLink} from "@/lib/site";
import { getGallery, getSettings } from "@/lib/store";

/** Content is CMS-driven: always render from the live store, never a build-time snapshot. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Experiences",
  description:
    "Birthdays, pool parties, sundowners, theme parties and exclusive celebrations, produced end to end by SHUNYA. Send your date, location and guest count.",
  alternates: { canonical: "/private-experiences" },
};

const EXPERIENCES = [
  {
    id: "birthdays",
    title: "Birthdays",
    body: "Milestone birthdays built as a full night: concept, sound, lighting, hospitality and the running order.",
    image: "/media/private-rooftop.jpg",
  },
  {
    id: "pool-parties",
    title: "Pool Parties",
    body: "Daylight into dusk. Sound designed for open air, water and a crowd that never sits down.",
    image: "/media/private-pool.jpg",
  },
  {
    id: "sundowners",
    title: "Sundowners",
    body: "Golden-hour sessions with a curated music arc, considered bar programme and a room that fills slowly.",
    image: "/media/gallery-06.jpg",
  },
  {
    id: "theme-parties",
    title: "Theme Parties",
    body: "From the invite to the last light — art direction, set design and production that holds the concept.",
    image: "/media/gallery-10.jpg",
  },
  {
    id: "exclusive-celebrations",
    title: "Exclusive Celebrations",
    body: "Anniversaries, launches and private gatherings produced with full discretion and no public listing.",
    image: "/media/gallery-09.jpg",
  },
  {
    id: "warehouse-takeovers",
    title: "Warehouse Takeovers",
    body: "A full SHUNYA production scaled to your guest list — truss, beams, haze, sound and door management.",
    image: "/media/chapter-space.jpg",
  },
];

const INCLUDED = [
  { k: "Concept & creative", v: "Narrative, art direction, invite design and run-of-show" },
  { k: "Production", v: "Stage, truss, lighting design, haze, power and site management" },
  { k: "Sound", v: "Tuned systems with a dedicated engineer for the full event" },
  { k: "Music & artists", v: "Curated DJs and live acts briefed against your crowd" },
  { k: "Hospitality", v: "Bar programme, service flow and guest journey planning" },
  { k: "Operations", v: "Permissions, security coordination, load-in and load-out" },
  { k: "Content", v: "Photo and video coverage options, delivered post-event" },
  { k: "Discretion", v: "Nothing published without your written approval" },
];

const FAQS = [
  {
    q: "How far in advance should I enquire?",
    a: "For full-production private experiences, earlier is always better — it gives time to lock the venue, artists and permissions. Shorter timelines can work for smaller formats; tell us your date and we'll be honest about what's possible.",
  },
  {
    q: "Do you work outside your home city?",
    a: "Yes, subject to production logistics and permissions. Share the location with your enquiry and the team will confirm feasibility.",
  },
  {
    q: "Can you handle the venue as well?",
    a: "We can advise on venues and coordinate with them. Where you already have a venue, we plug into their team and manage our own production scope.",
  },
  {
    q: "How is pricing structured?",
    a: "Pricing is quoted per project once the brief, guest count, production scope and location are clear. Budget bands shown in the enquiry form are placeholders and will be replaced with real bands by SHUNYA.",
  },
  {
    q: "Will my event be publicised?",
    a: "No. Private experiences are confidential by default. Coverage is published only with your explicit approval.",
  },
  {
    q: "Do you provide alcohol and bar services?",
    a: "Bar programmes are planned in line with local licensing and permits for the venue and city. We coordinate the compliance side rather than assuming it.",
  },
];

export default async function PrivateExperiencesPage() {
  const [settings, gallery] = await Promise.all([getSettings(), getGallery()]);
  const frames = gallery.slice(0, 5);

  return (
    <div className="pb-24 pt-28 md:pb-32 md:pt-36">
      {/* --- header --------------------------------------------------------- */}
      <PageHeader
        index="04"
        eyebrow="Private Experiences"
        meta={<span>Produced end to end</span>}
        title={
          <>
            Your night,
            <span className="block text-ash">produced properly.</span>
          </>
        }
        lead={
          <>
            Birthdays, pool parties, sundowners, theme parties and exclusive celebrations — produced
            end to end by the same team that builds SHUNYA&apos;s electronic music events. You bring
            the occasion and the guest list; we bring the concept, production, sound, music and
            operations.
          </>
        }
        actions={
          <>
            <Link href="#enquiry" className="btn-ember">
              Plan your experience
            </Link>
            <a
              href={whatsappLink(settings.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              WhatsApp the team
            </a>
          </>
        }
      />

      {/* --- experience types ---------------------------------------------- */}
      <section className="shell mt-20">
        <SectionHeading
          eyebrow="Formats"
          title="What we produce"
          lead="Every format below is built from scratch around your date, location and guest count. Placeholder visuals are used for now — real event photography will replace them."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCES.map((item, index) => (
            <Reveal
              key={item.id}
              delay={Math.min(index * 0.05, 0.25)}
              className="group relative isolate flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-sm border border-bone/10"
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="-z-10 object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-void via-void/55 to-void/5" />
              <div className="p-6">
                <h3 className="type-display text-[1.4rem] text-bone">{item.title}</h3>
                <p className="mt-3 max-w-sm text-[0.88rem] leading-relaxed text-fog">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- what's included ----------------------------------------------- */}
      <section className="mt-24 border-y border-bone/10 bg-ink py-20">
        <div className="shell grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" />
                Scope
              </p>
              <h2 className="type-display mt-5 text-[clamp(1.7rem,4.4vw,3rem)] text-bone">
                What a SHUNYA
                <span className="block text-ash">production covers</span>
              </h2>
              <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-fog">
                You can take the full scope or any part of it. Most private experiences start with
                concept and production and grow from there.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="divide-y divide-bone/10 border-y border-bone/10">
            {INCLUDED.map((row) => (
              <div
                key={row.k}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
              >
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">
                  {row.k}
                </p>
                <p className="text-[0.9rem] leading-relaxed text-bone/85 sm:max-w-[26rem] sm:text-right">
                  {row.v}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --- process -------------------------------------------------------- */}
      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Process"
          title={<>Four steps, no surprises</>}
          lead="No hidden line items, no mystery fees. You see the plan and the pricing before anything is booked."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <Reveal key={step.step} delay={index * 0.07} className="card-dark p-6">
              <p className="type-mega text-[2.4rem] text-bone/25">{step.step}</p>
              <h3 className="mt-4 text-[1.05rem] font-medium text-bone">{step.title}</h3>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-fog">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- visual band ---------------------------------------------------- */}
      {frames.length ? (
        <section className="mt-24">
          <div className="shell">
            <SectionHeading
              eyebrow="Mood"
              title="The look we build toward"
              size="md"
              action={{ href: "/gallery", label: "Open gallery" }}
            />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {frames.map((frame, index) => (
              <Reveal
                key={frame.id}
                delay={index * 0.05}
                className={`relative overflow-hidden rounded-sm border border-bone/10 ${
                  index === 0 ? "col-span-2 aspect-[4/3] md:aspect-[3/4]" : "aspect-[3/4]"
                }`}
              >
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-void/25" />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* --- enquiry -------------------------------------------------------- */}
      <section id="enquiry" className="mt-24 scroll-mt-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" />
                Enquiry
              </p>
              <h2 className="type-display mt-5 text-[clamp(1.8rem,4.6vw,3rem)] text-bone">
                Tell us about the night.
              </h2>
              <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-fog">
                Name, contact, event type, date, location, guest count, budget range and a short
                description — that is everything we need to start. The SHUNYA team replies with a
                concept direction and next steps.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="mt-10 space-y-4 border-t border-bone/10 pt-8">
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  WhatsApp
                </p>
                <a
                  href={whatsappLink(
                    settings.whatsapp,
                    "Hi SHUNYA — I'd like to plan a private experience.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-2 inline-block text-[0.9rem] text-bone"
                >
                  {settings.contactPhone}
                </a>
              </div>
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  Email
                </p>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="link-underline mt-2 inline-block text-[0.9rem] text-bone"
                >
                  {settings.contactEmail}
                </a>
              </div>
              <p className="font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-ash/90">
                Placeholder contact details · confirmed by {SITE.name} before launch
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.06}>
            <EnquiryForm
              source="private-experiences"
              variant="full"
              defaultIntent="private-experience"
              intents={[
                {
                  id: "private-bookings",
                  type: "private-experience",
                  index: "01",
                  label: "Private Experience",
                  blurb: "Tell us the occasion, the date, the location and the guest count.",
                },
                {
                  id: "brand-partnerships",
                  type: "brand-partnership",
                  index: "02",
                  label: "Brand / Partnership",
                  blurb: "Hosting a brand moment inside a SHUNYA production.",
                },
              ]}
              heading="Private experience enquiry"
              whatsappNumber={settings.whatsapp}
              contactEmail={settings.contactEmail}
            />
          </Reveal>
        </div>
      </section>

      <JsonLd
        data={[
          privateExperienceLd(EXPERIENCES),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Private Experiences", path: "/private-experiences" },
          ]),
        ]}
      />

      {/* --- FAQ ------------------------------------------------------------ */}
      <section className="shell mt-24">
        <SectionHeading eyebrow="Questions" title="Private experiences, answered" size="md" />
        <Reveal delay={0.08} className="mt-10">
          <Accordion items={FAQS} />
        </Reveal>
      </section>
    </div>
  );
}
