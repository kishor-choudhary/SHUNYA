"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Chapter } from "@/lib/site";

const ACCENT: Record<NonNullable<Chapter["accent"]>, string> = {
  ember: "from-ember/70",
  bone: "from-bone/45",
  dusk: "from-dusk/60",
};

/**
 * The scroll-driven centrepiece: three chapters, one sticky poster panel.
 * Each chapter row reports itself as "active" as it crosses the middle of the
 * viewport (IntersectionObserver with a -45% band), which drives the poster,
 * the copy and the progress rail. Fully readable as a plain stacked list when
 * JavaScript or motion is unavailable.
 */
export default function Chapters({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!rows.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = rows.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) setActive(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  const current = chapters[active] ?? chapters[0];

  return (
    <section id="experience" className="relative border-t border-bone/10 bg-void py-20 md:py-28">
      {/* --- chapter statement ------------------------------------------- */}
      <div className="shell">
        <p className="eyebrow flex items-center gap-3">
          <span className="inline-block h-px w-8 bg-ember" />
          The SHUNYA experience
        </p>
        <h2 className="type-display mt-6 max-w-[22ch] text-[clamp(2rem,6.4vw,5rem)] text-bone">
          Three chapters.
          <span className="block text-ash">One night.</span>
          <span className="block">
            Nothing{" "}
            <span className="relative inline-block">
              wasted.
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-ember/80" />
            </span>
          </span>
        </h2>
      </div>

      {/* --- journey ------------------------------------------------------ */}
      <div className="shell mt-16 grid gap-10 md:mt-24 lg:grid-cols-[0.92fr_1fr] lg:gap-16">
        {/* Sticky poster panel (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <div className="hud-frame relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-bone/10 bg-ink">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: index === active ? 1 : 0,
                    scale: index === active ? 1 : 1.06,
                  }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={chapter.image}
                    alt={`${chapter.heading} — ${chapter.label}`}
                    fill
                    sizes="(min-width: 1024px) 44vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              ))}

              {/* grading + framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${ACCENT[current?.accent ?? "ember"]} via-transparent to-transparent opacity-40 mix-blend-screen`}
              />
              <div className="absolute inset-3 border border-bone/12" />

              {/* HUD: chapter counter */}
              <div className="absolute left-5 top-5 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.26em] text-bone/70">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                Chapter {current?.index}
              </div>
              <div className="absolute right-5 top-5 font-mono text-[0.58rem] uppercase tracking-[0.26em] text-bone/70">
                {String(active + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
              </div>

              {/* Rotated chapter label down the right edge — the reference HUD treatment. */}
              <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current?.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="type-display [writing-mode:vertical-rl] text-[0.9rem] tracking-[0.4em] text-bone/75"
                  >
                    {current?.heading}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* copy */}
              <div className="absolute inset-x-5 bottom-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current?.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="type-display text-[clamp(1.5rem,2.6vw,2.35rem)] text-bone text-shadow-cine">
                      {current?.heading}
                    </p>
                    <p className="mt-2 max-w-sm text-[0.82rem] leading-relaxed text-fog">
                      {current?.stat} —{" "}
                      {current?.meta?.[0]?.v ?? "Details confirmed on announcement."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* progress rail */}
            <div className="mt-6 flex items-center gap-4">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() =>
                    rowRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  aria-label={`Jump to chapter ${chapter.index}: ${chapter.label}`}
                  aria-current={index === active ? "true" : undefined}
                  className="group flex flex-1 flex-col gap-2 text-left"
                >
                  <span className="relative block h-px w-full bg-bone/15">
                    <motion.span
                      className="absolute inset-y-0 left-0 bg-ember"
                      initial={false}
                      animate={{ width: index <= active ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                  <span
                    className={`font-mono text-[0.58rem] uppercase tracking-[0.24em] transition-colors duration-300 ${
                      index === active ? "text-bone" : "text-ash/85 group-hover:text-fog"
                    }`}
                  >
                    {chapter.index} {chapter.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter rows */}
        <div className="flex flex-col">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
              className="flex min-h-[72svh] flex-col justify-center border-b border-bone/10 py-12 last:border-b-0 lg:min-h-[86svh] lg:py-16"
            >
              {/* Mobile / tablet poster */}
              <div className="hud-frame relative mb-8 aspect-[16/10] w-full overflow-hidden rounded-sm border border-bone/10 lg:hidden">
                <Image
                  src={chapter.image}
                  alt={`${chapter.heading} — ${chapter.label}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent" />
              </div>

              <motion.div
                data-reveal=""
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[0.62rem] tracking-[0.3em] text-ash">
                    {chapter.index}
                  </span>
                  <span className="h-px w-10 bg-ember/70" />
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-fog">
                    {chapter.label}
                  </span>
                </div>

                <h3 className="type-display mt-6 text-[clamp(2.2rem,7vw,4.2rem)] text-bone">
                  {chapter.heading}
                </h3>

                <p className="lede mt-5 max-w-xl">{chapter.body}</p>

                <dl className="mt-9 max-w-xl divide-y divide-bone/10 border-y border-bone/10">
                  {chapter.meta.map((row) => (
                    <div
                      key={row.k}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                    >
                      <dt className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
                        {row.k}
                      </dt>
                      <dd className="text-[0.875rem] text-bone/85 sm:text-right">{row.v}</dd>
                    </div>
                  ))}
                </dl>

                <Link
                  href={chapter.href}
                  className="group mt-9 inline-flex items-center gap-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-bone"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-bone/25 transition-colors duration-500 group-hover:border-ember group-hover:bg-ember group-hover:text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M1 6h9M6.5 1.5 11 6l-4.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </span>
                  <span className="link-underline">
                    {chapter.id === "people" ? "Plan your experience" : "Explore further"}
                  </span>
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
