import type { Metadata } from "next";

import BrandIntro from "@/components/home/BrandIntro";
import Chapters from "@/components/home/Chapters";
import EnquiryTeaser from "@/components/home/EnquiryTeaser";
import FinalContact from "@/components/home/FinalContact";
import GalleryStrip from "@/components/home/GalleryStrip";
import Hero, { type HeroEventTeaser } from "@/components/home/Hero";
import Services from "@/components/home/Services";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import Marquee, { MarqueeWords } from "@/components/Marquee";
import { CHAPTERS, SITE } from "@/lib/site";
import { formatEventDate, isPast } from "@/lib/format";
import { getEvents, getGallery, getSettings } from "@/lib/store";
import { getTheme } from "@/lib/themes";

/** Content is CMS-driven: always render from the live store, never a build-time snapshot. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [events, gallery, settings] = await Promise.all([getEvents(), getGallery(), getSettings()]);
  const theme = getTheme(settings.theme);

  const nextEvent = events.find((event) => !isPast(event.endDate ?? event.startDate)) ?? null;
  const teaser: HeroEventTeaser | null = nextEvent
    ? {
        slug: nextEvent.slug,
        title: nextEvent.title,
        dateLabel: formatEventDate(nextEvent.startDate),
        placeLabel: [nextEvent.venue, nextEvent.city].filter(Boolean).join(" · "),
      }
    : null;

  return (
    <>
      <Hero
        nextEvent={teaser}
        frameCredit={settings.heroVideoCredit}
        frameUrl={settings.heroVideoUrl}
        theme={theme}
      />

      {/* Transition band between the hero film and the story. */}
      <MarqueeWords
        words={["SHUNYA", "LIVE", "UNDERGROUND", "CELEBRATION", "CULTURE"]}
        className="border-y border-bone/10 bg-ink py-5"
      />

      <BrandIntro />
      <Services />
      <Chapters chapters={CHAPTERS} />
      <UpcomingEvents events={events} />
      <GalleryStrip items={gallery} />
      <EnquiryTeaser settings={settings} />

      {/* Quiet statement band before the final contact block. */}
      <section className="border-t border-bone/10 bg-void py-16 md:py-20">
        <Marquee speed={52} reverse>
          {["From Shoonya", "Everything Begins"].map((word, index) => (
            <span key={`${word}-${index}`} className="flex items-center">
              <span
                className={`type-mega px-8 text-[clamp(2.4rem,7vw,5.6rem)] md:px-12 ${
                  index % 2 === 0 ? "text-bone" : "text-transparent"
                }`}
                style={
                  index % 2 === 0
                    ? undefined
                    : {
                        WebkitTextStroke:
                          "1px color-mix(in oklab, var(--color-bone) 35%, transparent)",
                      }
                }
              >
                {word}
              </span>
              <span className="h-3 w-3 rotate-45 bg-ember" />
            </span>
          ))}
        </Marquee>
      </section>

      <FinalContact settings={settings} />
    </>
  );
}
