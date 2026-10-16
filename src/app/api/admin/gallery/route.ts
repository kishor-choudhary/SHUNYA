import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { createGalleryItem, getGallery } from "@/lib/store";
import { validateGalleryItem } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/admin/gallery — every frame, published or hidden. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return jsonOk({ gallery: await getGallery({ includeHidden: true }) });
}

/** POST /api/admin/gallery — add a frame. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const { ok, data, errors } = validateGalleryItem(payload);
  if (!ok) return jsonError("Please fix the highlighted fields.", 422, errors);

  const item = await createGalleryItem(data);
  return jsonOk({ item }, 201);
}
