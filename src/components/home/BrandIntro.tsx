import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";

/**
 * Brand introduction: what SHUNYA is, in the brand's own voice. No claims about
 * scale, history or clients that the company hasn't confirmed.
 */
export default function BrandIntro() {
  return (
    <section className="relative overflow-hidden border-t border-bone/10 bg-ink py-20 md:py-28">
      <div className="mist -left-24 top-0 h-[38rem] w-[38rem]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-ember/10 blur-[150px]" />

      <div className="shell relative grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" />
              About SHUNYA
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="type-display mt-6 text-[clamp(1.9rem,5.4vw,4rem)] text-bone">
              An independent event and electronic music experiences brand.
            </h2>
          </Reveal>

          <Reveal
            delay={0.12}
            className="mt-8 max-w-2xl space-y-5 font-serif text-[1.16rem] leading-[1.5] text-fog md:text-[1.3rem]"
          >
            <p>
              SHUNYA began with an empty room — and the belief that an empty room is where
              everything starts. Every event we build is designed backwards from the moment the
              first light hits the crowd.
            </p>
            <p>
              We work across two disciplines that feed each other: large-scale electronic music
              events, and private celebrations produced with the same intensity. Warehouse
              sessions, open-air stages, birthday celebrations, pool parties, sundowners and theme
              parties — different rooms, one standard.
            </p>
            <p className="text-bone">
              <span className="italic">Premium, underground, restless.</span> That is the whole
              brief.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-10 flex flex-wrap gap-3">
            <Link href="/about" className="btn-ghost">
              Read the full story
            </Link>
            <Link href="/gallery" className="btn-ghost">
              See the gallery
            </Link>
          </Reveal>
        </div>

        {/* Visual + principle list */}
        <div className="space-y-8">
          <Reveal className="hud-frame relative aspect-[4/3] overflow-hidden rounded-sm border border-bone/10">
            <Image
              src="/media/chapter-space.jpg"
              alt="Empty industrial warehouse lit by a suspended lighting truss before doors"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="animate-drift object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-fog">
              Development placeholder visual · replace with licensed event photography
            </p>
          </Reveal>

          <Reveal delay={0.1} className="divide-y divide-bone/10 border-y border-bone/10">
            {[
              {
                k: "What we do",
                v: "Electronic music events, private experiences, full event production",
              },
              { k: "Where we work", v: "Cities and venues confirmed per event — never assumed" },
              { k: "How we work", v: "Concept, production and music direction as one team" },
              { k: "Who we work with", v: "Artists, venues, brands and private hosts" },
            ].map((row) => (
              <div key={row.k} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-10">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
                  {row.k}
                </p>
                <p className="text-[0.9rem] text-bone/85 sm:max-w-[22rem] sm:text-right">{row.v}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
