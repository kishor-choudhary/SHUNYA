import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { deleteEvent, getEventById, updateEvent } from "@/lib/store";
import { validateEvent } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** GET /api/admin/events/:id */
export async function GET(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return jsonError("Event not found.", 404);
  return jsonOk({ event });
}

/** PATCH /api/admin/events/:id — full update (the studio always posts the whole form). */
export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getEventById(id);
  if (!existing) return jsonError("Event not found.", 404);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const { ok, data, errors } = validateEvent(payload);
  if (!ok) return jsonError("Please fix the highlighted fields.", 422, errors);

  const event = await updateEvent(id, data);
  return jsonOk({ event });
}

/** DELETE /api/admin/events/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const removed = await deleteEvent(id);
  if (!removed) return jsonError("Event not found.", 404);
  return jsonOk({ id });
}
