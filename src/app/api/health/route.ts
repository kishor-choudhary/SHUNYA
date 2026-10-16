import { NextResponse } from "next/server";

import { getEvents, getEnquiries, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Lightweight readiness probe for a host or uptime monitor. It reads the
 * content store, so a 500 here means the studio's storage is unreachable —
 * exactly the failure worth alerting on. No secrets or customer data are
 * exposed: enquiry traffic is reported as a count only.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    const [settings, events, enquiries] = await Promise.all([
      getSettings(),
      getEvents({ includeDrafts: true }),
      getEnquiries(),
    ]);

    return NextResponse.json({
      ok: true,
      service: "shunya",
      contentStore: "readable",
      counts: {
        events: events.length,
        publishedEvents: events.filter((event) => event.status === "published").length,
        enquiries: enquiries.length,
        newEnquiries: enquiries.filter((enquiry) => enquiry.status === "new").length,
      },
      placeholders: {
        // Surfaces unfinished handover work without exposing anything private.
        contactEmail: settings.contactEmail.endsWith(".example"),
        whatsapp: settings.whatsapp === "910000000000",
        instagram: settings.instagram.includes(".example"),
      },
      checkedAt: new Date().toISOString(),
      tookMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("[shunya] health check failed:", error);
    return NextResponse.json(
      { ok: false, service: "shunya", contentStore: "unreadable" },
      { status: 503 },
    );
  }
}
