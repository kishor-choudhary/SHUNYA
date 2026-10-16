import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, readSessionToken } from "./auth";

/** Returns the admin session or null. Route handlers must bail when null. */
export async function getAdminSession() {
  const store = await cookies();
  return readSessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated. Sign in to the SHUNYA studio." },
      { status: 401 },
    );
  }
  return null;
}

export function jsonError(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json({ ok: false, error: message, fields }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/** Best-effort client identity for rate limiting. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
