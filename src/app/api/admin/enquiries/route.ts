import { jsonOk, requireAdmin } from "@/lib/api-guard";
import { getEnquiries } from "@/lib/store";

export const dynamic = "force-dynamic";

/** GET /api/admin/enquiries — the studio inbox, newest first. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const enquiries = await getEnquiries();
  return jsonOk({
    enquiries,
    total: enquiries.length,
    unread: enquiries.filter((enquiry) => enquiry.status === "new").length,
  });
}
