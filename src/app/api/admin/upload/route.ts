import { jsonError, jsonOk, requireAdmin } from "@/lib/api-guard";
import { saveUpload } from "@/lib/store";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

/**
 * POST /api/admin/upload
 * Accepts `{ fileName, dataUrl }` so the studio can publish a poster or gallery
 * frame straight from a phone or laptop. Bytes are validated, size-capped and
 * renamed — never trusted from the client.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let payload: { fileName?: string; dataUrl?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return jsonError("Invalid JSON payload.");
  }

  const dataUrl = payload.dataUrl ?? "";
  const match = /^data:([a-z0-9/+.-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return jsonError("Upload a base64 image data URL.", 422);

  const [, mime, base64] = match;
  const ext = ALLOWED_TYPES[mime.toLowerCase()];
  if (!ext) {
    return jsonError("Images only — JPG, PNG, WebP or AVIF.", 415, {
      dataUrl: "Unsupported image type.",
    });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength === 0) return jsonError("That file appears to be empty.", 422);
  if (buffer.byteLength > MAX_BYTES) {
    return jsonError("Images must be under 8 MB.", 413, { dataUrl: "File too large." });
  }

  // Basic magic-number check so a renamed file can't be published.
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e;
  const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";
  const isAvif = buffer.subarray(4, 12).toString("ascii").includes("ftyp");
  if (!isJpeg && !isPng && !isWebp && !isAvif) {
    return jsonError("That file is not a readable image.", 415, {
      dataUrl: "File contents don't match an image.",
    });
  }

  try {
    const fileName = `${(payload.fileName ?? "upload").replace(/\.[^.]+$/, "")}${ext}`;
    const url = await saveUpload(fileName, buffer);
    return jsonOk({ url }, 201);
  } catch (error) {
    console.error("[shunya] upload failed:", error);
    return jsonError(
      "Upload failed. On a read-only host, paste an external image URL instead.",
      500,
    );
  }
}
