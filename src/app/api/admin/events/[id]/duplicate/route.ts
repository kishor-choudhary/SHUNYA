import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { createEvent, getEventById, type EventInput } from "@/lib/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/events/:id/duplicate — start the next edition from an
 * existing event.
 *
 * An events brand runs the same night more than once, so the studio can copy
 * an event instead of retyping its description, FAQs and lineup notes. The copy
 * always lands as a **draft** with "(copy)" in the title, so nothing can reach
 * the public site until someone edits the details and publishes it on purpose.
 */
export async function POST(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const source = await getEventById(id);
  if (!source) return jsonError("Event not found.", 404);

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, slug: _slug, ...input } = source;

  const copy: EventInput = {
    ...input,
    title: `${source.title} (copy)`,
    slug: "", // the store derives a unique slug from the new title
    status: "draft",
    featured: false,
  };

  const event = await createEvent(copy);
  return jsonOk({ event }, 201);
}
