import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { deleteEnquiry, updateEnquiryStatus } from "@/lib/store";
import type { EnquiryStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/admin/enquiries/:id — new → read → archived. */
export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  let payload: { status?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const status = payload.status as EnquiryStatus;
  if (!["new", "read", "archived"].includes(status)) {
    return jsonError("Unknown status.", 422);
  }

  const enquiry = await updateEnquiryStatus(id, status);
  if (!enquiry) return jsonError("Enquiry not found.", 404);
  return jsonOk({ enquiry });
}

/** DELETE /api/admin/enquiries/:id */
export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const removed = await deleteEnquiry(id);
  if (!removed) return jsonError("Enquiry not found.", 404);
  return jsonOk({ id });
}
