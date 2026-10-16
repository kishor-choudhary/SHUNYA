import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { deleteGalleryItem, updateGalleryItem } from "@/lib/store";
import { validateGalleryItem } from "@/lib/validation";
import type { GalleryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/admin/gallery/:id — update the whole frame, or toggle `published` only. */
export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  // Lightweight toggle path used by the gallery table.
  if (Object.keys(payload).length === 1 && "published" in payload) {
    const item = await updateGalleryItem(id, { published: Boolean(payload.published) });
    if (!item) return jsonError("Frame not found.", 404);
    return jsonOk({ item });
  }

  const { ok, data, errors } = validateGalleryItem(payload);
  if (!ok) return jsonError("Please fix the highlighted fields.", 422, errors);

  const item = await updateGalleryItem(id, data as Partial<Omit<GalleryItem, "id" | "createdAt">>);
  if (!item) return jsonError("Frame not found.", 404);
  return jsonOk({ item });
}

/** DELETE /api/admin/gallery/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const removed = await deleteGalleryItem(id);
  if (!removed) return jsonError("Frame not found.", 404);
  return jsonOk({ id });
}
