import Link from "next/link";

import { DEFAULT_WHATSAPP_MESSAGE, NAV_LINKS, SITE, whatsappLink } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";
import Marquee from "./Marquee";
import Reveal from "./Reveal";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-ink">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-ember/12 blur-[120px]" />

      <Marquee className="border-b border-bone/10 py-4" speed={56} fadeFrom="from-ink">
        {["SHUNYA", "EVENTS", "EXPERIENCES", "CULTURE", "MUSIC"].map((word) => (
          <span key={word} className="flex items-center">
            <span className="px-6 font-mono text-[0.7rem] uppercase tracking-[0.42em] text-ash">
              {word}
            </span>
            <span className="h-1 w-1 rounded-full bg-ember/70" />
          </span>
        ))}
      </Marquee>

      <div className="shell relative grid gap-14 py-16 md:py-20 lg:grid-cols-[1.3fr_1fr_1fr]">
        {/* Brand block */}
        <Reveal className="space-y-6">
          <p className="eyebrow">Independent event & experience brand</p>
          <p className="type-display text-[clamp(2rem,5vw,3.2rem)] text-bone">
            From Shoonya,
            <br />
            <span className="text-ash">Everything begins.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(settings.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ember"
            >
              WhatsApp us
            </a>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Instagram
            </a>
          </div>
        </Reveal>

        {/* Sitemap */}
        <Reveal delay={0.08} className="space-y-5">
          <p className="eyebrow">Navigate</p>
          <ul className="space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-baseline gap-3 text-sm text-fog transition-colors duration-300 hover:text-bone"
                >
                  <span className="font-mono text-[0.58rem] tracking-[0.2em] text-ash/85">
                    {link.index}
                  </span>
                  <span className="link-underline">{link.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="group inline-flex items-baseline gap-3 text-sm text-fog transition-colors duration-300 hover:text-bone"
              >
                <span className="font-mono text-[0.58rem] tracking-[0.2em] text-ash/85">07</span>
                <span className="link-underline">Studio (Admin)</span>
              </Link>
            </li>
          </ul>
        </Reveal>

        {/* Contact */}
        <Reveal delay={0.16} className="space-y-5">
          <p className="eyebrow">Get in touch</p>
          <ul className="space-y-4 text-sm text-fog">
            <li>
              <span className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
                Enquiries
              </span>
              <a href={`mailto:${settings.contactEmail}`} className="link-underline text-bone">
                {settings.contactEmail}
              </a>
            </li>
            <li>
              <span className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
                Phone
              </span>
              <a
                href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                className="link-underline text-bone"
              >
                {settings.contactPhone}
              </a>
            </li>
            <li>
              <span className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
                Studio
              </span>
              <span className="text-fog">Address to be confirmed</span>
            </li>
          </ul>
          <p className="rounded-sm border border-ember/30 bg-ember/5 p-3 font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.16em] text-ember-glow">
            Placeholder details — replace in Studio → Settings before launch.
          </p>
        </Reveal>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-bone/10 py-7 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">
          © {year} {settings.brandName} · {SITE.tagline}
        </p>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">
          Imagery is placeholder visual material for development · Replace with licensed event
          photography
        </p>
      </div>

      {/* Oversized wordmark — the closing note of the page. */}
      <div aria-hidden="true" className="relative select-none overflow-hidden">
        <p className="type-mega translate-y-[14%] px-2 text-center text-[22vw] leading-none text-bone/[0.055]">
          SHUNYA
        </p>
      </div>
    </footer>
  );
}
