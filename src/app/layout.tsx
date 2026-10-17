import type { Metadata, Viewport } from "next";

import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

import Atmosphere from "@/components/Atmosphere";
import TriptychLoader from "@/components/TriptychLoader";
import { SITE } from "@/lib/site";
import { getSettings } from "@/lib/store";
import { getTheme } from "@/lib/themes";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    images: [
      {
        url: "/media/hero-loop-poster.jpg",
        width: 1920,
        height: 1080,
        alt: "SHUNYA — crowd under red lasers in a dark warehouse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/media/hero-loop-poster.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/brand/shunya-mark.svg", type: "image/svg+xml" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/brand/icon-192.png"],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false },
  category: "music",
};

/**
 * The browser/OS chrome colour follows the active theme, so an installed PWA
 * and a mobile status bar match the site instead of a stale hard-coded black.
 */
export async function generateViewport(): Promise<Viewport> {
  const { theme } = await getSettings();
  return {
    themeColor: getTheme(theme).themeColor,
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
    // Zoom is never disabled — accessibility before aesthetics.
    maximumScale: 5,
  };
}

/**
 * Root shell. Public chrome (header, footer, smooth scroll, cursor, social)
 * lives in the `(site)` route group so the studio at /admin renders standalone.
 *
 * This is also where the studio's theme choice reaches everybody: the palette
 * is re-declared in globals.css under `html[data-theme="…"]`, the attribute is
 * rendered here on the server, and the studio writes the choice through
 * /api/admin/settings. No cookie, no localStorage, no flash of the old theme,
 * and the correct theme is already in the HTML for a visitor with JavaScript
 * switched off.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = await getSettings();
  const activeTheme = getTheme(theme);

  return (
    <html lang="en" data-theme={activeTheme.id} suppressHydrationWarning>
      <head>
        {/*
          Motion is a progressive enhancement. Without JavaScript, Framer's
          initial state would leave animated blocks invisible, so this rule
          pins every animated element to its final, fully legible state.
        */}
        <noscript>
          <style>{`
            [data-reveal] { opacity: 1 !important; transform: none !important; filter: none !important; }
            #shunya-mobile-menu { display: none !important; }
          `}</style>
        </noscript>
      </head>
      <body className="min-h-dvh bg-void text-bone antialiased">
        {children}
        <Atmosphere />
        {/* The Triptych theme's entrance panel belongs to that atmosphere only.
            It is client-rendered, once per session, and skips itself entirely
            for reduced-motion visitors. */}
        {activeTheme.atmosphere === "arch" ? <TriptychLoader /> : null}
      </body>
    </html>
  );
}
