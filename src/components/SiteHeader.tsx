"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { DEFAULT_WHATSAPP_MESSAGE, NAV_LINKS, whatsappLink } from "@/lib/site";

interface SiteHeaderProps {
  whatsapp: string;
  instagram: string;
  contactEmail: string;
  contactPhone: string;
  /** Confirmed upcoming event, shown inside the index panel. */
  nextEvent: { title: string; dateLabel: string; href: string } | null;
}

const PANEL_EASE = [0.16, 1, 0.3, 1] as const;

export default function SiteHeader({
  whatsapp,
  instagram,
  contactEmail,
  contactPhone,
  nextEvent,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  /* Solid backdrop after the hero, hide when scrolling down, reveal on the way up. */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 420 && y > lastY);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close on navigation. */
  useEffect(() => setOpen(false), [pathname]);

  /* Escape closes, the page behind is locked, and focus is managed both ways. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), 120);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      triggerRef.current?.focus();
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-sm focus:bg-ember focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[80] transition-transform duration-500 ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div
          className={`transition-colors duration-500 ${
            scrolled || open
              ? "border-b border-bone/10 bg-void/85 backdrop-blur-xl"
              : "border-b border-transparent bg-gradient-to-b from-black/70 to-transparent"
          }`}
        >
          <div className="shell flex h-[68px] items-center justify-between gap-6 md:h-[76px]">
            {/* Wordmark — type only, no mark. */}
            <Link
              href="/"
              className="group flex items-baseline gap-2.5"
              aria-label="SHUNYA — home"
            >
              <span className="type-display text-[1.16rem] leading-none tracking-[0.34em] text-bone transition-colors duration-500 group-hover:text-ember-glow">
                SHUNYA
              </span>
              <span className="hidden font-serif text-[0.86rem] italic leading-none text-ash transition-colors duration-500 group-hover:text-fog sm:inline">
                from Shoonya
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`group relative flex items-center gap-2 px-3 py-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isActive(link.href) ? "text-bone" : "text-fog hover:text-bone"
                  }`}
                >
                  <span className="text-[0.55rem] text-ash">{link.index}</span>
                  <span className="link-underline">{link.label}</span>
                  {isActive(link.href) ? (
                    <span className="absolute -bottom-0.5 left-3 h-px w-[calc(100%-1.5rem)] bg-ember" />
                  ) : null}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <a
                href={whatsappLink(whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-9 w-9 place-items-center rounded-full border border-bone/20 text-bone/80 transition-colors duration-300 hover:border-bone/60 hover:text-bone md:grid"
                aria-label="Message SHUNYA on WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.02.24-3.45-.72-2.92-1.15-4.76-4.19-4.9-4.38-.15-.2-1.16-1.55-1.16-2.95 0-1.4.73-2.09 1-2.38.24-.27.53-.34.73-.34h.53c.17 0 .39-.03.6.46.24.53.8 1.98.87 2.13.07.15.12.32.02.51-.1.2-.22.32-.42.53-.2.2-.31.32-.44.53-.15.24-.05.44.07.63.12.2.68 1.12 1.46 1.81 1 .89 1.83 1.16 2.09 1.29.26.12.42.1.58-.07.17-.19.71-.83.9-1.11.2-.29.39-.24.63-.15.24.1 1.53.72 1.79.85.26.12.44.19.51.3.07.1.07.62-.17 1.3Z" />
                </svg>
              </a>

              <Link
                href="/private-experiences#enquiry"
                className="group hidden items-center gap-2.5 rounded-full bg-bone px-5 py-2.5 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-void transition-colors duration-300 hover:bg-ember hover:text-white xl:inline-flex"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ember transition-colors duration-300 group-hover:bg-white" />
                Plan an experience
              </Link>

              {/* Index trigger — the oversized menu, available on every viewport. */}
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="shunya-mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className={`group flex items-center gap-3 rounded-full border px-3.5 py-2 transition-colors duration-300 ${
                  open
                    ? "border-ember bg-ember/12 text-bone"
                    : "border-bone/20 text-bone hover:border-bone/60"
                }`}
              >
                <span className="relative grid h-3 w-3 place-items-center">
                  <span
                    className={`absolute h-px w-3 bg-current transition-transform duration-300 ${
                      open ? "rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute h-3 w-px bg-current transition-transform duration-300 ${
                      open ? "rotate-45" : ""
                    }`}
                  />
                </span>
                <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
                  {open ? "Close" : "Index"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Oversized index panel — the chapter-list treatment from the brief. */}
      {/* ---------------------------------------------------------------- */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="shunya-mobile-menu"
            key="index-panel"
            role="dialog"
            aria-modal="true"
            aria-label="SHUNYA site index"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[75] overflow-y-auto bg-void/97 backdrop-blur-xl"
          >
            <div className="shell flex min-h-full flex-col justify-between gap-12 pb-12 pt-[92px] md:pt-[104px]">
              <div className="grid gap-12 lg:grid-cols-[1.4fr_0.75fr] lg:gap-20">
                {/* Big numbered index */}
                <nav aria-label="Site index">
                  <p className="eyebrow mb-6 flex items-center gap-3">
                    <span className="inline-block h-px w-8 bg-ember" />
                    Index
                  </p>

                  <ul className="flex flex-col">
                    {NAV_LINKS.map((link, index) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.05 * index + 0.06,
                          duration: 0.6,
                          ease: PANEL_EASE,
                        }}
                        className="border-b border-bone/10"
                      >
                        <Link
                          ref={index === 0 ? firstLinkRef : undefined}
                          href={link.href}
                          className="group flex items-center gap-5 py-3 md:gap-8 md:py-4"
                        >
                          <span className="font-mono text-[0.6rem] tracking-[0.24em] text-ash transition-colors duration-300 group-hover:text-ember-glow md:text-[0.7rem]">
                            {link.index}
                          </span>
                          <span
                            className={`type-display flex-1 text-[clamp(1.85rem,7.5vw,2.6rem)] transition-all duration-500 group-hover:translate-x-2 lg:text-[clamp(2.4rem,4.6vw,4.4rem)] ${
                              isActive(link.href)
                                ? "text-ember-glow"
                                : "text-bone group-hover:text-ember-glow"
                            }`}
                          >
                            {link.label}
                          </span>
                          <span className="shrink-0 text-ash opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:text-ember-glow group-hover:opacity-100 md:-translate-x-3">
                            <svg
                              width="34"
                              height="14"
                              viewBox="0 0 34 14"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path d="M0 7h31M25 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" />
                            </svg>
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Meta column */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, duration: 0.6, ease: PANEL_EASE }}
                  className="space-y-8"
                >
                  {nextEvent ? (
                    <div className="rounded-sm border border-bone/12 bg-charcoal/50 p-5">
                      <p className="eyebrow">Next event</p>
                      <Link href={nextEvent.href} className="group mt-3 block">
                        <p className="text-[1.05rem] text-bone transition-colors group-hover:text-ember-glow">
                          {nextEvent.title}
                        </p>
                        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-fog">
                          {nextEvent.dateLabel}
                        </p>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-sm border border-bone/12 bg-charcoal/50 p-5">
                      <p className="eyebrow">Next event</p>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-fog">
                        Dates are announced once confirmed. Ask us to notify you.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 border-t border-bone/10 pt-6">
                    <p className="eyebrow">Direct</p>
                    <ul className="space-y-3 text-[0.9rem]">
                      <li>
                        <a
                          href={whatsappLink(whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-underline text-bone"
                        >
                          WhatsApp
                        </a>
                      </li>
                      <li>
                        <a href={`mailto:${contactEmail}`} className="link-underline text-bone">
                          {contactEmail}
                        </a>
                      </li>
                      <li>
                        <a
                          href={`tel:${contactPhone.replace(/\s/g, "")}`}
                          className="link-underline text-bone"
                        >
                          {contactPhone}
                        </a>
                      </li>
                      <li>
                        <a
                          href={instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-underline break-all text-bone"
                        >
                          Instagram
                        </a>
                      </li>
                    </ul>
                    <p className="font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-ash">
                      Placeholder contact details · editable in the studio
                    </p>
                  </div>

                  <Link href="/private-experiences#enquiry" className="btn-ember w-full">
                    Plan your experience
                  </Link>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash"
              >
                From Shoonya, everything begins
              </motion.p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
