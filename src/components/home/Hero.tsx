"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import MovableSun from "@/components/MovableSun";
import Particles from "@/components/Particles";
import SpreadWord from "@/components/SpreadWord";
import { HERO } from "@/lib/site";
import type { ThemeDefinition } from "@/lib/themes";

export interface HeroEventTeaser {
  slug: string;
  title: string;
  dateLabel: string;
  placeLabel: string;
}

interface HeroProps {
  /** Confirmed, published events only — null until the first real event exists. */
  nextEvent: HeroEventTeaser | null;
  /** Credit line under the frame — photography or placeholder disclosure. */
  frameCredit: string;
  /** Optional replacement photograph, set from the studio. */
  frameUrl?: string;
  /**
   * The active theme. It decides the frame, the framing, and what (if anything)
   * moves over it: the draggable sun in Dusk, drifting embers in Moon, and
   * nothing at all in Void.
   */
  theme: ThemeDefinition;
}

/**
 * Full-screen cinematic hero, laid out on the reference structure: micro HUD row,
 * a left-aligned headline block with narrative serif copy and pill actions, the
 * brand name spread edge to edge across the frame, and a bottom status bar.
 * Parallax and the scroll cue are motion-only refinements — the content is fully
 * legible without them.
 *
 * The frame and everything moving over it belong to the theme (see
 * src/lib/themes.ts): the studio's "Hero frame image URL" still wins over the
 * theme's own frame when it is set.
 */
export default function Hero({ nextEvent, frameCredit, frameUrl, theme }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wideFrame = frameUrl || theme.hero.wide;
  const mobileFrame = theme.hero.portrait ?? wideFrame;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-void"
      data-sun-moved="false"
      aria-label="SHUNYA introduction"
    >
      {/* --- the frame ---------------------------------------------------- */}
      <motion.div style={{ y: mediaY }} className="absolute inset-0 -top-10 h-[112%]">
        {/* No film loop here: this frame is a photograph, and the only thing
            that moves over it is the sun the visitor controls. */}
        {/* Two crops of the same photograph: a wide one for desktop, and a
            taller one so a phone keeps the pavilion as well as the palace.
            Neither contains a sun disc — that belongs to the movable sun. */}
        <Image
          src={wideFrame}
          alt={theme.hero.alt}
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden object-cover object-center md:block"
        />
        {/* On a phone the frame is cropped to a portrait window, so the theme
            chooses the framing: the sunset keeps its pavilion, the moon frame
            keeps the disc above the crowd. */}
        <Image
          src={mobileFrame}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          style={{ objectPosition: theme.hero.mobilePosition }}
          className="object-cover md:hidden"
        />
      </motion.div>

      {/* --- grading overlays -------------------------------------------------
          The frame is a bright sunset, so the type needs real ground under it.
          Three fixed scrims do the structural work — left, bottom, top — and
          they are the same at rest and in motion. Then two layers respond to
          the sun: their opacity is the `--sun-travel` value the visitor
          creates by dragging, so a visitor who never touches the sun sees the
          photograph exactly as shot.                                       */}

      {/* left scrim — carries the headline, keeps the palace clear */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-void/55 to-void/80 md:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-void/90 via-void/45 to-transparent md:block" />

      {/* bottom scrim — the spread wordmark and the status bar */}
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-void via-void/70 to-transparent" />

      {/* top scrim — the micro HUD row sits over the brightest part of the sky,
          and a deep band at the top is also what the reference frame has */}
      <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-void via-void/45 to-transparent" />

      {/* the sun's own light, deepening as it is dragged down */}
      {theme.atmosphere === "sun" ? (
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: "var(--sun-travel, 0)",
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--color-void) 78%, transparent) 0%, color-mix(in oklab, var(--color-night) 45%, transparent) 45%, color-mix(in oklab, var(--color-void) 80%, transparent) 100%)",
          }}
        />
      ) : null}

      {/* and the light draining away from wherever the sun has been taken */}
      {theme.atmosphere === "sun" ? (
        <div
          className="absolute inset-0 mix-blend-multiply transition-opacity duration-300 ease-out"
          style={{
            opacity: "calc(var(--sun-travel, 0) * 0.75)",
            background:
              "radial-gradient(120% 90% at var(--sun-x,86%) var(--sun-y,30%), transparent 10%, color-mix(in oklab, var(--color-void) 80%, transparent) 80%)",
          }}
        />
      ) : null}

      {/* final fade so the frame dissolves into the page below it */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />

      {/* --- the theme's own light, and its own air --------------------------
          Dusk puts a sun in the frame that the visitor can drag down; Moon
          hangs a crimson disc over the crowd with embers drifting past it;
          Void stays perfectly still and lets the photograph speak.          */}
      {theme.atmosphere === "sun" ? <MovableSun /> : null}
      {theme.atmosphere === "particles" ? (
        <>
          <div
            aria-hidden="true"
            className="moon-glow pointer-events-none absolute -top-[6%] right-[4%] h-[34vw] w-[34vw] max-h-[26rem] max-w-[26rem] animate-moon-drift sm:right-[8%] md:top-[6%]"
          />
          <Particles className="z-[2]" />
        </>
      ) : null}

      {/* --- micro HUD row --------------------------------------------------- */}
      <div className="relative z-10">
        <div className="shell pt-[86px] md:pt-[100px]">
          <div className="flex items-start justify-between gap-6 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-bone/75">
            <span className="max-w-[22ch] leading-relaxed sm:max-w-none">{HERO.kicker}</span>
            <span className="flex shrink-0 items-center gap-2 text-bone/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember-glow" />
              Taking enquiries
            </span>
          </div>
        </div>
      </div>

      {/* --- content --------------------------------------------------------- */}
      <motion.div style={{ y: contentY, opacity: fade }} className="shell relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.p
            data-reveal=""
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="eyebrow flex items-center gap-3"
          >
            <span className="inline-block h-px w-8 bg-ember" />
            Event &amp; electronic music experiences
          </motion.p>

          <motion.h1
            data-reveal=""
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
            className="type-display mt-6 text-[clamp(2.1rem,7.2vw,4.9rem)] text-bone text-shadow-cine"
          >
            From Shoonya,
            <span className="block text-bone/72">
              everything{" "}
              <span className="relative inline-block">
                begins.
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-ember/85 md:h-[4px]" />
              </span>
            </span>
          </motion.h1>

          <motion.p
            data-reveal=""
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="lede mt-7 max-w-xl"
          >
            {HERO.supporting}
          </motion.p>

          <motion.div
            data-reveal=""
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.54 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
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
        </div>
      </motion.div>

      {/* --- giant spread wordmark ------------------------------------------- */}
      <motion.div style={{ y: wordY }} className="shell relative z-10 mt-14 w-full md:mt-10">
        <SpreadWord
          text="SHUNYA"
          delay={0.62}
          stagger={0.055}
          className="text-[clamp(3.1rem,15.5vw,11.5rem)] text-bone"
          letterClassName="text-shadow-cine"
        />
      </motion.div>

      {/* --- bottom status bar ------------------------------------------------ */}
      <motion.div
        data-reveal=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.05 }}
        className="shell relative z-10 mt-10 w-full pb-10 md:pb-12"
      >
        <div className="flex flex-col gap-5 border-t border-bone/12 pt-5 md:flex-row md:items-start md:justify-between">
          {/* next event */}
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
                  No confirmed dates published yet ·{" "}
                  <Link href="/contact?intent=general" className="text-ember-glow hover:underline">
                    join the list
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* scroll cue */}
          <div className="flex items-center gap-3 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">
            <span className="relative block h-px w-10 overflow-hidden bg-bone/20">
              <span className="absolute inset-y-0 left-0 w-3 animate-cue bg-ember-glow" />
            </span>
            Scroll to enter
          </div>

          {/* credit + pagination */}
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
