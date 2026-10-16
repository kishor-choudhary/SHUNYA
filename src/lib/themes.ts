/**
 * SHUNYA — theme registry.
 *
 * The site ships more than one complete look. A theme is a full palette plus
 * the atmosphere and the hero frame that go with it, and exactly one theme is
 * active at a time for *every* visitor: the studio picks it in
 * /admin/settings, the choice is stored with the rest of the content, and the
 * root layout renders it onto `<html data-theme="…">` on the server. Nothing
 * is kept in the visitor's browser, so a reload — on any device, signed in or
 * not — always shows the theme the studio published.
 *
 * Where the colours live: `src/app/globals.css` — `@theme` holds the default
 * (Dusk) and one block per theme follows it, each matching
 * `html[data-theme="…"]` *and* `[data-theme-preview="…"]`. The second selector
 * is what lets the studio draw a real mini-render of a theme inside the picker
 * without a single colour value being written down twice.
 *
 * This file carries everything else a theme needs: the id, the copy shown in
 * the studio, the browser chrome colour and the hero frame.
 *
 * `npm run check:themes` holds the two halves together: it fails if a theme is
 * missing from either place, if a palette is incomplete, if the chrome colour
 * has drifted away from `--color-void`, if a hero frame is missing, or if any
 * pairing in a palette falls below its contrast floor.
 */

export const THEME_IDS = ["dusk", "moon", "void"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "dusk";

/**
 * The moving element that belongs to a theme's hero.
 *
 * - `sun`       — the draggable sun (a photograph with a sun in it)
 * - `particles` — drifting embers over a dark frame
 * - `still`     — nothing moves but the film grain
 */
export type ThemeAtmosphere = "sun" | "particles" | "still";

export interface ThemeHero {
  /** Frame used from `md` up. */
  wide: string;
  /**
   * Optional dedicated portrait crop. Themes whose source frame is already
   * landscape use `mobilePosition` instead: a phone then sees the full height
   * of the same photograph with the sides cropped away, which keeps far more
   * of the picture than a squeezed landscape crop would.
   */
  portrait?: string;
  /** `object-position` for the wide frame below `md`. */
  mobilePosition: string;
  alt: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  /** Short name, as a visitor would describe it. */
  label: string;
  /** One line of mood — shown on the studio card. */
  tagline: string;
  /** What changes on the site, in plain language. */
  description: string;
  /**
   * Browser and OS chrome colour. Must equal the theme's `--color-void`; this
   * is what the manifest and `<meta name="theme-color">` report.
   */
  themeColor: string;
  atmosphere: ThemeAtmosphere;
  hero: ThemeHero;
}

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "dusk",
    label: "Dusk",
    tagline: "Blue hour, cream stone, gold sun",
    description:
      "A warm sunset frame with a photographer's sun that visitors can drag down the sky. Deep blue shadows, cream type and a single gold accent. This is the theme the brand was photographed for.",
    themeColor: "#0a1119",
    atmosphere: "sun",
    hero: {
      wide: "/media/hero-sunset.jpg",
      portrait: "/media/hero-sunset-portrait.jpg",
      mobilePosition: "35% center",
      alt: "A cream marble pavilion and pink bougainvillea above a lake at sunset, with a palace town along the far shore",
    },
  },
  {
    id: "moon",
    label: "Moon",
    tagline: "Near-black night, one crimson moon",
    description:
      "The original house look: a crowd under lasers, a crimson moon above them and drifting embers in the air. Coolest and darkest of the three — built for electronic music nights.",
    themeColor: "#06080d",
    atmosphere: "particles",
    hero: {
      wide: "/media/hero-main.jpg",
      mobilePosition: "50% center",
      alt: "Hands raised in a dark warehouse beneath a crimson moon and red laser beams",
    },
  },
  {
    id: "void",
    label: "Void",
    tagline: "Monochrome, no colour at all",
    description:
      "Shoonya means void, and this theme takes it literally: a black-and-bone palette with no colour anywhere, over a grayscale frame of an empty hall before the crowd arrives. Gallery-like and uncompromising.",
    themeColor: "#06070a",
    atmosphere: "still",
    hero: {
      wide: "/media/hero-void.jpg",
      mobilePosition: "50% center",
      alt: "An empty warehouse hall in black and white, its ceiling trusses receding into darkness",
    },
  },
];

/**
 * The palette itself, read by the studio's preview card. These are the same
 * variables every component uses, so a card can only ever show colours the
 * site really renders.
 */
export const THEME_SWATCH_TOKENS = ["--color-void", "--color-ember", "--color-bone"] as const;

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/**
 * Resolve a stored theme id. Anything unrecognised — an empty field in an
 * older content document, a value edited by hand, a theme removed from the
 * registry — falls back to the default rather than rendering an unstyled page.
 */
export function getTheme(id: string | null | undefined): ThemeDefinition {
  const found = THEMES.find((theme) => theme.id === id);
  return found ?? THEMES.find((theme) => theme.id === DEFAULT_THEME) ?? THEMES[0];
}
