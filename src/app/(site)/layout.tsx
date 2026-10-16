import CursorAura from "@/components/CursorAura";
import ScrollProgress from "@/components/ScrollProgress";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppFab from "@/components/WhatsAppFab";
import Analytics from "@/components/Analytics";
import { formatEventDate, isPast } from "@/lib/format";
import { SITE } from "@/lib/site";
import { getEvents, getSettings } from "@/lib/store";

/**
 * Public site layout: everything a visitor sees around a page — header,
 * footer, momentum scrolling, the cursor aura, the WhatsApp line — plus the
 * Organization / WebSite structured data.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, events] = await Promise.all([getSettings(), getEvents()]);

  const nextEvent = events.find((event) => !isPast(event.endDate ?? event.startDate)) ?? null;

  const organisationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brandName,
    alternateName: "SHUNYA Experiences",
    slogan: settings.tagline,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/brand/shunya-logo.svg`,
    email: settings.contactEmail,
    telephone: settings.contactPhone,
    sameAs: [settings.instagram].filter(Boolean),
    areaServed: "IN",
    knowsAbout: ["electronic music events", "private celebrations", "event production"],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.brandName,
    url: SITE.url,
  };

  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <SiteHeader
        whatsapp={settings.whatsapp}
        instagram={settings.instagram}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        nextEvent={
          nextEvent
            ? {
                title: nextEvent.title,
                dateLabel: formatEventDate(nextEvent.startDate),
                href: `/events/${nextEvent.slug}`,
              }
            : null
        }
      />

      <div className="relative z-10">
        <main id="main">{children}</main>
        <SiteFooter settings={settings} />
      </div>

      <WhatsAppFab number={settings.whatsapp} />
      <CursorAura />
      <Analytics />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
    </>
  );
}
