import { NextResponse } from "next/server";

import { clientKey, jsonError, jsonOk } from "@/lib/api-guard";
import { createEnquiry } from "@/lib/store";
import { rateLimit, validateEnquiry } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Anti-spam budget per IP. 12 enquiries per 10 minutes is comfortably above what
 * a genuine visitor needs, and can be tuned per environment — a staging box or
 * an office behind a single NAT address may need headroom.
 */
function limitConfig() {
  const burst = Number(process.env.ENQUIRY_RATE_LIMIT ?? 12);
  const windowMinutes = Number(process.env.ENQUIRY_RATE_WINDOW_MINUTES ?? 10);
  return {
    burst: Number.isFinite(burst) && burst > 0 ? burst : 12,
    windowMs: (Number.isFinite(windowMinutes) && windowMinutes > 0 ? windowMinutes : 10) * 60_000,
  };
}

/**
 * POST /api/enquiries
 * Public enquiry endpoint used by every form on the site.
 * Enquiries are stored in the SHUNYA studio inbox, and optionally forwarded to
 * ENQUIRY_WEBHOOK_URL (Formspree / Basin / Resend / CRM) when configured.
 */
export async function POST(request: Request) {
  const { burst, windowMs } = limitConfig();
  if (!rateLimit(clientKey(request, "enquiry"), burst, windowMs)) {
    return jsonError("Too many enquiries from this connection. Please try again shortly.", 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("We couldn't read that submission. Please try again.");
  }

  const { ok, data, errors } = validateEnquiry(payload);
  if (!ok) return jsonError("Please check the highlighted fields.", 422, errors);

  try {
    const enquiry = await createEnquiry(data);

    const webhook = process.env.ENQUIRY_WEBHOOK_URL;
    if (webhook && /^https?:\/\//i.test(webhook)) {
      // Fire and forget — never block or fail the enquirer on a webhook error.
      void fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, receivedAt: enquiry.createdAt, brand: "SHUNYA" }),
      }).catch((error) => console.error("[shunya] enquiry webhook failed:", error));
    }

    return jsonOk({ id: enquiry.id, message: "Enquiry received." }, 201);
  } catch (error) {
    console.error("[shunya] enquiry failed:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong saving your enquiry. Please email us instead." },
      { status: 500 },
    );
  }
}
