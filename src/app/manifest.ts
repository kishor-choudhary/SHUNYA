import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";
import { getSettings } from "@/lib/store";
import { getTheme } from "@/lib/themes";

/**
 * Web app manifest — lets the SHUNYA studio and site be installed to a phone
 * home screen with the brand mark, which is how the team is most likely to
 * check enquiries on the night of an event.
 *
 * The splash and chrome colours come from the active theme, so an installed
 * icon matches the site after the studio switches look.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { theme } = await getSettings();
  const canvas = getTheme(theme).themeColor;

  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: canvas,
    theme_color: canvas,
    categories: ["music", "entertainment", "events"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/brand/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Events", url: "/events" },
      { name: "Private Experiences", url: "/private-experiences" },
      { name: "Enquiries (Studio)", url: "/admin/enquiries" },
    ],
  };
}
