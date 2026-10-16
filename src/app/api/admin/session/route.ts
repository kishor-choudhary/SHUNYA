import { NextResponse } from "next/server";

import { clientKey, jsonError } from "@/lib/api-guard";
import { ADMIN_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";
import { getAdminAccount } from "@/lib/store";
import { rateLimitFailures } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/admin/session — sign in to the SHUNYA studio. */
export async function POST(request: Request) {
  const burst = Number(process.env.LOGIN_RATE_LIMIT ?? 8);
  const windowMinutes = Number(process.env.LOGIN_RATE_WINDOW_MINUTES ?? 15);
  const throttle = rateLimitFailures(
    clientKey(request, "login"),
    Number.isFinite(burst) && burst > 0 ? burst : 8,
    (Number.isFinite(windowMinutes) && windowMinutes > 0 ? windowMinutes : 15) * 60_000,
  );

  if (!throttle.allowed) {
    return jsonError(
      "Too many failed sign-in attempts. Wait a few minutes and try again.",
      429,
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid request.");
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";
  if (!username || !password) return jsonError("Enter your username and password.", 422);

  const account = await getAdminAccount();
  const validUser = username === account.username;
  const validPass = verifyPassword(password, account.passwordHash);

  // Constant-ish response regardless of which half failed.
  if (!validUser || !validPass) {
    throttle.recordFailure();
    return jsonError("Those credentials don't match an SHUNYA studio account.", 401);
  }

  // A correct password means this is the real admin — release the budget.
  throttle.clear();

  const response = NextResponse.json({
    ok: true,
    mustChangePassword: account.mustChangePassword,
  });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: createSessionToken(account.username),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

/** DELETE /api/admin/session — sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: ADMIN_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
