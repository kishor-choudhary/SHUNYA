import { getAdminSession } from "@/lib/api-guard";
import { getEnquiries } from "@/lib/store";
import type { Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/enquiries/export — every enquiry as a CSV download.
 *
 * The inbox is where the team reads enquiries; this is how they take them
 * somewhere else (a spreadsheet, a CRM, the accounts export). It is a plain
 * authenticated GET so a download link works without JavaScript, and it is
 * always rendered fresh with no caching.
 */

const COLUMNS: { key: string; label: string; value: (enquiry: Enquiry) => string }[] = [
  { key: "id", label: "Reference", value: (e) => e.id },
  { key: "createdAt", label: "Received", value: (e) => e.createdAt },
  { key: "status", label: "Status", value: (e) => e.status },
  { key: "type", label: "Enquiry type", value: (e) => e.type },
  { key: "name", label: "Name", value: (e) => e.name },
  { key: "email", label: "Email", value: (e) => e.email },
  { key: "phone", label: "Phone", value: (e) => e.phone ?? "" },
  { key: "company", label: "Company", value: (e) => e.company ?? "" },
  { key: "eventType", label: "Event type", value: (e) => e.eventType ?? "" },
  { key: "eventDate", label: "Event date", value: (e) => e.eventDate ?? "" },
  { key: "location", label: "Location", value: (e) => e.location ?? "" },
  { key: "guestCount", label: "Guests", value: (e) => e.guestCount ?? "" },
  { key: "budgetRange", label: "Budget range", value: (e) => e.budgetRange ?? "" },
  { key: "message", label: "Message", value: (e) => e.message },
  { key: "source", label: "Source", value: (e) => e.source ?? "" },
];

/** RFC 4180 escaping: wrap in quotes and double any quote inside. */
function cell(value: string): string {
  const clean = value.replace(/\r?\n/g, " ").trim();
  if (/[",]/.test(clean)) return `"${clean.replace(/"/g, '""')}"`;
  return clean;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return new Response("Not authenticated. Sign in to the SHUNYA studio.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const enquiries = await getEnquiries();
  const rows = [
    COLUMNS.map((column) => cell(column.label)).join(","),
    ...enquiries.map((enquiry) =>
      COLUMNS.map((column) => cell(column.value(enquiry))).join(","),
    ),
  ];

  // A BOM keeps Excel from mangling accented names and the rupee sign.
  const body = `\uFEFF${rows.join("\r\n")}\r\n`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shunya-enquiries-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
