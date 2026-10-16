import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Accordion from "@/components/Accordion";
import Marquee from "@/components/Marquee";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { PROCESS_STEPS, SITE, whatsappLink } from "@/lib/site";
import { breadcrumbLd } from "@/lib/seo";
import { getSettings } from "@/lib/store";
import JsonLd from "@/components/JsonLd";

/** Content is CMS-driven: always render from the live store, never a build-time snapshot. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "SHUNYA is an independent event and electronic music experiences brand building private celebrations and large-scale electronic music events.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    index: "01",
    title: "Design the room, not the flyer",
    body: "We start with sightlines, sound pressure and how a crowd will physically move. The artwork tells you what happened; the room is what people remember.",
  },
  {
    index: "02",
    title: "One arc, start to finish",
    body: "A SHUNYA night is programmed as one continuous piece. Opening sets, peaks and the last record are decided together with the artist, not bolted on.",
  },
  {
    index: "03",
    title: "Underground by standard, not by costume",
    body: "Underground means the sound system is honest, the lineup is curated and the door policy respects the crowd. It is a production standard, not a mood board.",
  },
  {
    index: "04",
    title: "Private means private",
    body: "Private celebrations are never published, tagged or shared without the host's written approval. Discretion is part of the service.",
  },
];

const FAQS = [
  {
    q: "Is SHUNYA a ticketing company?",
    a: "No. SHUNYA is an event and experiences brand. Where an event is ticketed, booking runs through the official ticketing partner linked on that event's page.",
  },
  {
    q: "Do you organise private celebrations as well as club events?",
    a: "Yes. Private experiences — birthdays, pool parties, sundowners, theme parties and exclusive celebrations — are produced end to end with the same production team that builds our music events.",
  },
  {
    q: "Can artists and brands work with SHUNYA?",
    a: "Yes. Artists, venues, brands and sponsors can start a conversation from the contact page. Every enquiry is routed to the right person and answered.",
  },
  {
    q: "Where are SHUNYA events held?",
    a: "Cities and venues are announced per event. Nothing is published until the venue and permissions are confirmed, which is why the calendar can look quiet between announcements.",
  },
  {
    q: "How do I stay informed about upcoming events?",
    a: "Send a general enquiry and ask to be added to the announcement list, or follow SHUNYA on Instagram and WhatsApp for updates.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="pb-24 pt-28 md:pb-32 md:pt-36">
      {/* --- header --------------------------------------------------------- */}
      <PageHeader
        index="02"
        eyebrow={`About ${SITE.name}`}
        meta={<span>Independent · Est. in an empty room</span>}
        title={
          <>
            An empty room
            <span className="block text-ash">is where we start.</span>
          </>
        }
        lead={`${SITE.tagline} That line is the whole company. Shoonya — the void, the zero, the empty floor before doors — is where every SHUNYA event is built from. We are an independent event and electronic music experiences brand working across private celebrations and large-scale electronic music events.`}
      />

      {/* --- full-bleed visual band ---------------------------------------- */}
      <Reveal className="relative mt-16 h-[46svh] overflow-hidden md:h-[62svh]">
        <Image
          src="/media/chapter-people.jpg"
          alt="Large crowd silhouetted toward a distant stage"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-void/50" />
        <div className="absolute inset-x-0 bottom-8">
          <div className="shell">
            <p className="max-w-md font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-fog">
              Development placeholder visual · replace with licensed event photography
            </p>
          </div>
        </div>
      </Reveal>

      {/* --- story ---------------------------------------------------------- */}
      <section className="shell mt-20 grid gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
        <div className="space-y-6">
          <Reveal>
            <h2 className="type-display text-[clamp(1.8rem,4.6vw,3.2rem)] text-bone">
              Built by people who stay until load-out.
            </h2>
          </Reveal>
          <Reveal delay={0.06} className="max-w-2xl space-y-5 font-serif text-[1.14rem] leading-[1.5] text-fog md:text-[1.26rem]">
            <p>
              SHUNYA operates as a collective of producers, curators and designers rather than a
              booking agency with a logo. The team that conceives a night is the team that runs it —
              from the first site visit to the final cable coiled at sunrise.
            </p>
            <p>
              That structure is deliberate. It means the sound system is chosen for the room, the
              lighting rig is drawn around the crowd, and the running order is set by the same people
              who will stand at the desk while it plays.
            </p>
            <p>
              It also means we can move between formats without losing the standard: a twenty-guest
              rooftop dinner and a few thousand people under a warehouse truss are produced with the
              same level of intent.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="grid gap-6 border-t border-bone/10 pt-8 sm:grid-cols-3">
            {[
              { k: "Positioning", v: "Independent event & music brand" },
              { k: "Formats", v: "Private experiences · Electronic music · Production" },
              { k: "Based", v: "Address to be confirmed" },
            ].map((item) => (
              <div key={item.k}>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  {item.k}
                </p>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-bone/90">{item.v}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-sm border border-bone/10">
            <Image
              src="/media/chapter-sound.jpg"
              alt="DJ silhouette behind a mixer lit by a single red light"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/70 to-transparent" />
          </Reveal>
          <Reveal delay={0.08} className="card-dark p-6">
            <p className="eyebrow">The team</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-fog">
              Founders, resident curators and production crew details are being finalised and will be
              published here once confirmed by SHUNYA.
            </p>
            <p className="mt-4 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-ash">
              Editable placeholder — no names are invented
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- principles ----------------------------------------------------- */}
      <section className="mt-24 border-y border-bone/10 bg-ink py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="How we think"
            title={
              <>
                Four principles.
                <span className="block text-ash">Everything else is detail.</span>
              </>
            }
          />

          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {PRINCIPLES.map((item, index) => (
              <Reveal key={item.index} delay={index * 0.06}>
                <p className="font-mono text-[0.58rem] tracking-[0.3em] text-ash">{item.index}</p>
                <h3 className="type-display mt-4 text-[1.5rem] text-bone md:text-[1.75rem]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-fog">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- process -------------------------------------------------------- */}
      <section className="shell mt-24">
        <SectionHeading
          eyebrow="How we work"
          title="From first message to last record"
          lead="A simple, transparent process — whether the brief is a private dinner or a warehouse event."
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

      {/* --- statement band ------------------------------------------------- */}
      <div className="mt-24 border-y border-bone/10 py-10">
        <Marquee speed={48}>
          {["Private celebrations", "Warehouse events", "Open air", "Production"].map((word) => (
            <span key={word} className="flex items-center">
              <span className="type-display px-8 text-[clamp(1.4rem,3.4vw,2.6rem)] text-bone/80">
                {word}
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-ember" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* --- FAQ ------------------------------------------------------------ */}
      <section className="shell mt-20">
        <SectionHeading
          eyebrow="Questions"
          title="About SHUNYA"
          size="md"
          action={{ href: "/contact", label: "Ask us directly" }}
        />
        <Reveal delay={0.08} className="mt-10">
          <Accordion items={FAQS} />
        </Reveal>
      </section>

      {/* --- CTA ------------------------------------------------------------ */}
      <section className="shell mt-20">
        <Reveal className="relative overflow-hidden rounded-sm border border-bone/10 bg-ink p-8 md:p-12">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ember/12 blur-[110px]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Work with us</p>
              <h2 className="type-display mt-4 max-w-[26ch] text-[clamp(1.5rem,3.6vw,2.4rem)] text-bone">
                Whether it is a party for twenty or a stage for thousands — start here.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/private-experiences" className="btn-ember">
                Plan an experience
              </Link>
              <a
                href={whatsappLink(settings.whatsapp, "Hi SHUNYA — I'd like to talk about a project.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </section>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

    </div>
  );
}
