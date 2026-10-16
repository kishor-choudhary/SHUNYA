import Link from "next/link";

import Reveal from "@/components/Reveal";
import SunAccent from "@/components/SunAccent";
import { DEFAULT_WHATSAPP_MESSAGE, ENQUIRY_INTENTS, mailtoLink, whatsappLink } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

/** Closing contact block — every route into the brand in one place. */
export default function FinalContact({ settings }: { settings: SiteSettings }) {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-bone/10 bg-void py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-ember/60 to-transparent" />
      <div className="mist left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2" />
      {/* The page closes with a low sun over the horizon line of the section. */}
      <SunAccent size="clamp(7rem,14vw,14rem)" className="-right-[6%] bottom-[-4%] opacity-70" />

      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-ember" />
                Contact
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="type-display mt-6 text-[clamp(2rem,6.2vw,4.6rem)] text-bone">
                Start something
                <span className="block text-ash">in an empty room.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="lede mt-6 max-w-xl">
                Whether it is a private celebration, an artist collaboration, a brand activation or a
                sponsorship — tell us what you have in mind. We reply to every serious enquiry.
              </p>
            </Reveal>

            <Reveal delay={0.18} className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-ember">
                Open the contact page
              </Link>
              <a
                href={whatsappLink(settings.whatsapp, DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                WhatsApp
              </a>
              <a
                href={mailtoLink(settings.contactEmail, "SHUNYA enquiry", "")}
                className="btn-ghost"
              >
                Email
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Instagram
              </a>
            </Reveal>

            <Reveal delay={0.24} className="mt-10 grid gap-6 border-t border-bone/10 pt-8 sm:grid-cols-3">
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
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  Phone / WhatsApp
                </p>
                <a
                  href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                  className="link-underline mt-2 inline-block text-[0.9rem] text-bone"
                >
                  {settings.contactPhone}
                </a>
              </div>
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  Instagram
                </p>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-2 inline-block break-all text-[0.9rem] text-bone"
                >
                  {settings.instagram.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </Reveal>
          </div>

          {/* Intent list */}
          <Reveal delay={0.14}>
            <div className="divide-y divide-bone/10 border-y border-bone/10">
              {ENQUIRY_INTENTS.map((intent) => (
                <Link
                  key={intent.id}
                  href={`/contact?intent=${intent.id}`}
                  className="group flex items-start gap-5 py-5 transition-colors duration-300"
                >
                  <span className="pt-1 font-mono text-[0.58rem] tracking-[0.24em] text-ash">
                    {intent.index}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-3 text-[1.05rem] font-medium text-bone transition-colors duration-300 group-hover:text-ember-glow">
                      {intent.label}
                      <svg
                        width="20"
                        height="8"
                        viewBox="0 0 20 8"
                        fill="none"
                        aria-hidden="true"
                        className="translate-x-0 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100"
                      >
                        <path d="M0 4h18M15 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </span>
                    <span className="mt-1.5 block max-w-md text-[0.85rem] leading-relaxed text-fog">
                      {intent.blurb}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
