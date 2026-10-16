import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { createEvent, getEvents } from "@/lib/store";
import { validateEvent } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/admin/events — every event including drafts. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return jsonOk({ events: await getEvents({ includeDrafts: true }) });
}

/** POST /api/admin/events — create an event. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const { ok, data, errors } = validateEvent(payload);
  if (!ok) return jsonError("Please fix the highlighted fields.", 422, errors);

  const event = await createEvent(data);
  return jsonOk({ event }, 201);
}
