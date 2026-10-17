"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import SpreadWord from "@/components/SpreadWord";
import { CHAPTERS, HERO } from "@/lib/site";
import type { ThemeDefinition } from "@/lib/themes";

export interface ArchHeroEventTeaser {
  slug: string;
  title: string;
  dateLabel: string;
  placeLabel: string;
}

interface ArchHeroProps {
  /** Confirmed, published events only — null until the first real event exists. */
  nextEvent: ArchHeroEventTeaser | null;
  /** Credit line under the frame — photography or placeholder disclosure. */
  frameCredit: string;
  /** Optional replacement photograph, set from the studio. */
  frameUrl?: string;
  /** The active theme — the source of the frame and its framing. */
  theme: ThemeDefinition;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The three windows hold the three chapters, and each one is treated like the
 * template treats its portals: a monochrome frame with one colour passing
 * through it. So the panes live in the theme's own light rather than in the
 * photograph's colours — violet, warm paper, ember — and the imagery stays
 * legible without dragging a third palette into a black-and-violet page.
 */
const PANE_TREATMENT = [
  "grayscale contrast-[1.12] group-hover:grayscale-0",
  "grayscale-[0.35] group-hover:grayscale-0",
  "grayscale contrast-[1.05] group-hover:contrast-100 group-hover:grayscale-0",
];

/** At rest each window has been washed in one of the theme's tones. */
const PANE_WASH = [
  "linear-gradient(180deg, color-mix(in oklab, var(--color-ember) 34%, transparent) 0%, color-mix(in oklab, var(--color-void) 30%, transparent) 78%)",
  "linear-gradient(180deg, color-mix(in oklab, var(--color-bone) 22%, transparent) 0%, color-mix(in oklab, var(--color-void) 36%, transparent) 80%)",
  "linear-gradient(180deg, color-mix(in oklab, var(--color-amber) 26%, transparent) 0%, color-mix(in oklab, var(--color-void) 34%, transparent) 78%)",
];

/** Framing for the three panes: one work, cut three ways. */
const PANE_POSITION = ["74% center", "50% center", "26% center"];
const PANE_DELAY = [0.4, 0.28, 0.52];

/**
 * The Triptych hero — the template's composition translated to SHUNYA.
 *
 * A near-black gallery wall, one violet shaft of light, a sentence-case
 * statement set tight against the left, and three tall arch windows on the
 * right that hold the brand's three chapters (sound, space, people). The
 * windows breathe and light travels up them; the whole piece is the theme's
 * `arch` atmosphere.
 *
 * Content contract matches the standard hero: every statement is legible
 * before any motion runs, and `prefers-reduced-motion` leaves a still frame.
 */
export default function ArchHero({ nextEvent, frameCredit, frameUrl, theme }: ArchHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wideFrame = frameUrl || theme.hero.wide;
  const portraitFrame = theme.hero.portrait ?? wideFrame;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const frameY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const panels = CHAPTERS.slice(0, 3);

  return (
    <section
      ref={sectionRef}
      aria-label="SHUNYA introduction"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-void"
    >
      {/* --- the frame ----------------------------------------------------- */}
      <motion.div style={{ y: frameY }} className="absolute inset-0 -top-12 h-[112%]">
        {/* The wide scene is the room the arches stand in; the portrait crop
            keeps the centre arch on a phone. */}
        <Image
          src={wideFrame}
          alt={theme.hero.alt}
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden object-cover opacity-55 md:block"
        />
        <Image
          src={portraitFrame}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          style={{ objectPosition: theme.hero.mobilePosition }}
          className="object-cover opacity-45 md:hidden"
        />
      </motion.div>

      {/* --- grading --------------------------------------------------------- */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/45 to-void" />
      <div className="absolute inset-0 bg-gradient-to-r from-void via-void/55 to-void/10" />
      <div aria-hidden="true" className="triptych-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* the violet shaft moving across the wall */}
      <div
        aria-hidden="true"
        className="animate-beam-sway pointer-events-none absolute inset-y-0 left-[4%] w-[30%] mix-blend-screen"
        style={{
          background:
            "linear-gradient(100deg, transparent 0%, color-mix(in oklab, var(--color-ember) 18%, transparent) 44%, transparent 80%)",
          filter: "blur(20px)",
        }}
      />
      {/* and the bloom the beam comes from */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-44 left-1/2 h-[42rem] w-[78rem] -translate-x-1/2 rounded-full opacity-70 blur-[150px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-ember) 22%, transparent), transparent 72%)",
        }}
      />

      {/* --- micro HUD row ---------------------------------------------------- */}
      <div className="shell relative z-20 pt-[84px] md:pt-[100px]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-bone/12 pb-4 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">
          <span className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rotate-45 animate-pulse bg-ember-glow" />
            Independent · event &amp; music
          </span>
          <span className="hidden text-ash/85 md:inline">A work in three panels</span>
          <span className="text-bone/80">Taking enquiries</span>
        </div>
      </div>

      {/* --- statement + arches ----------------------------------------------- */}
      <div className="shell relative z-10 grid flex-1 items-center gap-10 py-9 md:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <motion.div style={{ y: contentY, opacity: fade }}>
          <motion.p
            data-reveal=""
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
            className="eyebrow flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-ember" />
            From Shoonya · everything begins
          </motion.p>

          <h1 className="type-statement mt-5 text-[clamp(2.5rem,6.4vw,4.9rem)] text-bone text-shadow-cine">
            {["From Shoonya,", "everything", "begins."].map((line, index) => (
              <motion.span
                key={line}
                data-reveal=""
                initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.05, ease: EASE, delay: 0.16 + index * 0.11 }}
                className={`block ${index === 1 ? "text-ash" : ""}`}
              >
                {index === 2 ? (
                  <>
                    begins
                    <span className="text-ember-glow">.</span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            data-reveal=""
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.46 }}
            className="lede mt-7 max-w-md"
          >
            {HERO.supporting} Three chapters — sound, space and people — built as one night.
          </motion.p>

          <motion.div
            data-reveal=""
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.58 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href={HERO.primaryCta.href} className="btn-ember">
              {HERO.primaryCta.label}
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 6h9M6.5 1.5 11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
            <Link href={HERO.secondaryCta.href} className="btn-ghost">
              {HERO.secondaryCta.label}
            </Link>
          </motion.div>
        </motion.div>

        {/* three windows — the triptych itself */}
        <div className="relative">
          <div className="flex items-end gap-2 sm:gap-3">
            {panels.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                data-reveal=""
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: EASE, delay: PANE_DELAY[index] ?? 0.4 }}
                whileHover={{ y: -6 }}
                className={`arch-pane group ${
                  index === 1
                    ? "h-[clamp(12rem,40vw,17rem)] md:h-[clamp(17rem,44vh,30rem)]"
                    : "h-[clamp(10rem,32vw,13.5rem)] md:h-[clamp(13.5rem,36vh,24.5rem)]"
                }`}
              >
                {/* The frame breathes behind its own tint; hovering brings the
                    photograph's own colour back and steps it forward. */}
                <div
                  className="animate-arch-breathe absolute inset-0"
                  style={{ animationDelay: `${index * 1.9}s` }}
                >
                  <Image
                    src={chapter.image}
                    alt={`${chapter.heading} — ${chapter.label}`}
                    fill
                    sizes="(min-width: 1024px) 22vw, 33vw"
                    style={{ objectPosition: PANE_POSITION[index] }}
                    className={`object-cover opacity-90 transition duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] ${PANE_TREATMENT[index]}`}
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-40"
                  style={{ background: PANE_WASH[index] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-void/10" />
                <span
                  className="arch-pane__sheen"
                  style={{ animationDelay: `${index * 1.7}s` }}
                />

                <div className="absolute inset-x-0 bottom-0 z-[4] p-3 sm:p-4">
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ember-glow">
                    {chapter.index}
                  </p>
                  <p className="mt-2 hidden font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone sm:block">
                    {chapter.label}
                  </p>
                  <p className="mt-1 hidden text-[0.72rem] leading-snug text-fog md:block">
                    {chapter.heading}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            data-reveal=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-5 flex items-center justify-between gap-4 border-t border-bone/12 pt-3 font-mono text-[0.52rem] uppercase tracking-[0.22em] text-ash"
          >
            <span>One work · three panels</span>
            <span className="text-bone/70">Sound — Space — People</span>
          </motion.div>
        </div>
      </div>

      {/* --- the wordmark, spread edge to edge, ghosted behind the panels ------ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[13%] z-0 hidden md:block"
      >
        <div className="shell">
          <SpreadWord
            text="SHUNYA"
            delay={0.72}
            stagger={0.045}
            className="text-[clamp(3rem,9.5vw,8rem)] text-bone/[0.06]"
          />
        </div>
      </div>

      {/* --- bottom status bar ------------------------------------------------ */}
      <motion.div
        data-reveal=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 1 }}
        className="shell relative z-10 w-full pb-8 md:pb-10"
      >
        <div className="flex flex-col gap-5 border-t border-bone/12 pt-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">
              Next
            </span>
            {nextEvent ? (
              <Link href={`/events/${nextEvent.slug}`} className="group max-w-md">
                <p className="text-[1.02rem] text-bone transition-colors group-hover:text-ember-glow">
                  {nextEvent.title}
                </p>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-fog">
                  {nextEvent.dateLabel} · {nextEvent.placeLabel}
                </p>
              </Link>
            ) : (
              <div className="max-w-md">
                <p className="text-[1.02rem] text-bone">Next event to be announced</p>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-fog">
                  No confirmed dates yet ·{" "}
                  <Link href="/contact?intent=general" className="text-ember-glow hover:underline">
                    join the list
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">
            <span className="relative block h-px w-10 overflow-hidden bg-bone/20">
              <span className="absolute inset-y-0 left-0 w-3 animate-cue bg-ember-glow" />
            </span>
            Scroll to enter
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden max-w-[26ch] font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.18em] text-ash/90 lg:inline">
              {frameCredit}
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.24em] text-bone/80">
              01 <span className="text-ash/70">/ 03</span>
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
