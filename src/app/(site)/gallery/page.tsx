import type { Metadata } from "next";
import Link from "next/link";

import GalleryGrid from "@/components/gallery/GalleryGrid";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { whatsappLink } from "@/lib/site";
import { breadcrumbLd } from "@/lib/seo";
import { getGallery, getSettings } from "@/lib/store";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "SHUNYA gallery — rooms, rigs, crowds and private celebrations. Frames are published from the SHUNYA studio.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [items, settings] = await Promise.all([getGallery(), getSettings()]);

  return (
    <div className="pb-24 pt-28 md:pb-32 md:pt-36">
      <PageHeader
        index="05"
        eyebrow={`Gallery · ${items.length} frames`}
        meta={<span>Published from the studio</span>}
        wide
        title="Gallery"
        lead="The archive of SHUNYA rooms and celebrations. Every frame here is published by the SHUNYA team through the studio — the current set is labelled development placeholder material and will be replaced with licensed event photography."
      />

      <section className="shell mt-14" aria-label="Image gallery">
        <GalleryGrid items={items} />
      </section>

      <section className="shell mt-20">
        <Reveal className="relative overflow-hidden rounded-sm border border-bone/10 bg-ink p-8 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/12 blur-[110px]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Photography credit</p>
              <h2 className="type-display mt-4 max-w-[26ch] text-[clamp(1.4rem,3.4vw,2.2rem)] text-bone">
                Are you photographing the next SHUNYA event?
              </h2>
              <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-fog">
                Photographers and visual artists can pitch coverage, submit a portfolio and collaborate
                on event documentation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact?intent=artist-collaborations" className="btn-ember">
                Pitch coverage
              </Link>
              <a
                href={whatsappLink(settings.whatsapp, "Hi SHUNYA — I'd like to shoot an event with you.")}
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
            { name: "Gallery", path: "/gallery" },
          ]),
        ]}
      />

    </div>
  );
}
