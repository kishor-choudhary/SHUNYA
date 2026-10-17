import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { SERVICES } from "@/lib/site";

/** The three things SHUNYA sells: private experiences, music, production. */
export default function Services() {
  return (
    <section id="services" className="border-t border-bone/10 bg-void py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="What we build"
          title={
            <>
              Private experiences.
              <span className="block text-ash">Electronic music. Production.</span>
            </>
          }
          lead="Three disciplines, one team. Whether it is twenty guests on a rooftop or a few thousand on a warehouse floor, the production standard does not change."
          action={{ href: "/private-experiences", label: "Plan your experience" }}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {SERVICES.map((service, index) => (
            <Reveal
              key={service.id}
              delay={index * 0.08}
              className="arch-top group hud-frame relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-sm border border-bone/10 md:min-h-[32rem]"
            >
              <Image
                src={service.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="-z-10 object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-void via-void/60 to-void/10" />
              <div className="absolute inset-0 -z-10 bg-ember/0 transition-colors duration-700 group-hover:bg-ember/10" />

              <div className="p-7">
                <p className="flex items-center gap-2.5 font-mono text-[0.58rem] tracking-[0.3em] text-ash">
                  <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                  {service.index}
                </p>
                <h3 className="type-display mt-4 text-[1.75rem] text-bone">{service.title}</h3>
                <p className="mt-3 max-w-sm font-serif text-[1.02rem] leading-snug text-fog">
                  {service.body}
                </p>
                <Link
                  href={service.href}
                  className="mt-6 inline-flex items-center gap-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bone"
                >
                  <span className="link-underline">{service.cta}</span>
                  <svg width="18" height="8" viewBox="0 0 20 8" fill="none" aria-hidden="true">
                    <path d="M0 4h18M15 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
