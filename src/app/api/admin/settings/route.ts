import { revalidatePath } from "next/cache";

import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { getSettings, updateSettings } from "@/lib/store";
import { isThemeId, THEMES } from "@/lib/themes";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED: (keyof SiteSettings)[] = [
  "theme",
  "brandName",
  "tagline",
  "contactEmail",
  "contactPhone",
  "whatsapp",
  "instagram",
  "heroVideoUrl",
  "heroVideoCredit",
];

/**
 * GET /api/admin/settings — the content the studio has published, including the
 * active theme. Read back by the smoke suite to prove that what the studio
 * writes is what the site is serving.
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return jsonOk({ settings: await getSettings() });
}

/**
 * PATCH /api/admin/settings — the published theme, contact details, socials and
 * the hero frame.
 *
 * `theme` is the one setting that changes every page for every visitor, so it is
 * validated against the registry and the change is pushed through
 * `revalidatePath` — the public pages are rendered per request, but the few
 * prerendered resources that carry the palette (the manifest, the 404 page) are
 * not, and this is what keeps them from serving the previous look.
 */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const patch: Partial<SiteSettings> = {};

  // The theme is an id from the registry rather than free text, so it is read
  // and validated on its own.
  if ("theme" in payload) {
    const value = typeof payload.theme === "string" ? payload.theme.trim() : payload.theme;
    if (!isThemeId(value)) {
      return jsonError("That theme is not available.", 422, {
        theme: `Choose one of: ${THEMES.map((theme) => theme.id).join(", ")}.`,
      });
    }
    patch.theme = value;
  }

  for (const key of ALLOWED) {
    if (key === "theme" || !(key in payload)) continue;
    const value = payload[key];
    patch[key] = typeof value === "string" ? value.trim() : "";
  }

  if (patch.contactEmail && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(patch.contactEmail)) {
    return jsonError("Enter a valid contact email.", 422, {
      contactEmail: "Enter a valid email address.",
    });
  }
  if (patch.heroVideoUrl && !/^https?:\/\//i.test(patch.heroVideoUrl) && !patch.heroVideoUrl.startsWith("/")) {
    return jsonError("Hero film must be a URL or a /media path.", 422, {
      heroVideoUrl: "Use https://… or /media/…",
    });
  }

  const settings = await updateSettings(patch);

  if ("theme" in patch) {
    // Forces the prerendered resources that carry the palette to be rebuilt.
    revalidatePath("/", "layout");
  }

  return jsonOk({ settings });
}
