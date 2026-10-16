import { notFound } from "next/navigation";

import EventEditor from "@/components/admin/EventEditor";
import { getEventById } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return <EventEditor event={event} />;
}
