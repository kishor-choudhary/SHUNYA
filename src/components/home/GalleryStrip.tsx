import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import type { GalleryItem } from "@/lib/types";

/**
 * Past event gallery. Frames come from the SHUNYA studio; the shipped set is
 * clearly labelled development placeholder material so nothing is presented as
 * real event photography.
 */
export default function GalleryStrip({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null;
  const frames = items.slice(0, 8);

  return (
    <section id="gallery" className="border-t border-bone/10 bg-void py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Past events"
          title={
            <>
              The archive
              <span className="text-ash"> so far</span>
            </>
          }
          lead="Rooms, rigs, crowds and the details in between. Frames are published from the SHUNYA studio gallery."
          action={{ href: "/gallery", label: "Full gallery" }}
        />
      </div>

      {/* Horizontal film strip — scrolls on all devices, momentum on touch. */}
      <div className="mt-14">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pl-5 pr-5 md:gap-6 md:pl-10 md:pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-label="Past event gallery, scroll horizontally"
          tabIndex={0}
        >
          {frames.map((item, index) => (
            <Reveal
              key={item.id}
              delay={Math.min(index * 0.05, 0.3)}
              className={`arch-top group relative shrink-0 snap-start overflow-hidden rounded-sm border border-bone/10 ${
                index % 3 === 1
                  ? "aspect-[3/4] w-[76vw] sm:w-[42vw] lg:w-[26vw]"
                  : "aspect-[4/3] w-[86vw] sm:w-[52vw] lg:w-[34vw]"
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 34vw, 86vw"
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4">
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  {item.date} · {item.location}
                </p>
                <p className="mt-1 text-[0.9rem] text-bone">{item.caption}</p>
              </div>
              <div className="absolute right-4 top-4 font-mono text-[0.55rem] tracking-[0.2em] text-bone/70">
                {String(index + 1).padStart(2, "0")}
              </div>
            </Reveal>
          ))}

          {/* Closing tile */}
          <Reveal className="relative grid aspect-[4/3] w-[70vw] shrink-0 snap-start place-items-center rounded-sm border border-bone/15 bg-charcoal/60 sm:w-[40vw] lg:w-[24vw]">
            <Link
              href="/gallery"
              className="group flex flex-col items-center gap-4 text-center"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border border-bone/30 transition-colors duration-500 group-hover:border-ember group-hover:bg-ember">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 6h9M6.5 1.5 11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-bone">
                Open the full gallery
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
