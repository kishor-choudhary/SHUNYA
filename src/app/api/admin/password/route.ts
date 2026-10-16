import { jsonError, jsonOk, getAdminSession, requireAdmin } from "@/lib/api-guard";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getAdminAccount, updateAdminAccount } from "@/lib/store";

export const dynamic = "force-dynamic";

/** POST /api/admin/password — rotate the studio credentials. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const session = await getAdminSession();
  const account = await getAdminAccount();

  let payload: { currentPassword?: string; username?: string; newPassword?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const currentPassword = payload.currentPassword ?? "";
  const username = (payload.username ?? session?.username ?? "").trim();
  const newPassword = payload.newPassword ?? "";

  if (!verifyPassword(currentPassword, account.passwordHash)) {
    return jsonError("Your current password is incorrect.", 401, {
      currentPassword: "Incorrect password.",
    });
  }
  if (username.length < 3) {
    return jsonError("Choose a username of at least 3 characters.", 422, {
      username: "At least 3 characters.",
    });
  }
  if (newPassword.length < 10) {
    return jsonError("Use at least 10 characters for the new password.", 422, {
      newPassword: "At least 10 characters.",
    });
  }
  if (newPassword === currentPassword) {
    return jsonError("Choose a password you haven't used here before.", 422, {
      newPassword: "Pick a different password.",
    });
  }

  const updated = await updateAdminAccount({
    username,
    passwordHash: hashPassword(newPassword),
    mustChangePassword: false,
  });

  return jsonOk({ username: updated.username, mustChangePassword: updated.mustChangePassword });
}
