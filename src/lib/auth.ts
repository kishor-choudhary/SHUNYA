import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/* -------------------------------------------------------------------------- */
/*  Password hashing (scrypt, no native deps)                                 */
/* -------------------------------------------------------------------------- */

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;

/** Format: scrypt$N$r$p$saltHex$keyHex */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password.normalize("NFKC"), salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, n, r, p, saltHex, keyHex] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    const actual = scryptSync(password.normalize("NFKC"), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Session tokens (HMAC-signed, HttpOnly cookie)                             */
/* -------------------------------------------------------------------------- */

export const ADMIN_COOKIE = "shunya_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function secret(): string {
  return (
    process.env.ADMIN_TOKEN ??
    process.env.ADMIN_SESSION_SECRET ??
    "shunya-dev-token-change-me"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export interface AdminSession {
  username: string;
  /** Epoch ms expiry. */
  exp: number;
}

export function createSessionToken(username: string): string {
  const session: AdminSession = { username, exp: Date.now() + SESSION_TTL_MS };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session?.username || typeof session.exp !== "number") return null;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/** Credentials shown on the sign-in screen while the studio is in demo mode. */
export const DEMO_CREDENTIALS = {
  username: "shunya-admin",
  password: "shunya-demo",
} as const;
