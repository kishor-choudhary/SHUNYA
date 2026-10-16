"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { formatFileSize } from "@/lib/format";

/**
 * Poster / gallery uploader. Reads the file locally, posts it to
 * /api/admin/upload (base64, validated server-side) and returns the public path.
 * Pasting an external URL by hand is always available as a fallback.
 */
export default function UploadField({
  label,
  value,
  onChange,
  hint,
  maxLabel = "8 MB max",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  maxLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleFile(file: File) {
    setError("");
    setInfo("");

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG, WebP or AVIF).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(`That file is ${formatFileSize(file.size)} — the limit is 8 MB.`);
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      const payload = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (!response.ok || !payload.ok || !payload.url) {
        setError(payload.error ?? "Upload failed.");
        return;
      }
      onChange(payload.url);
      setInfo(`Uploaded ${formatFileSize(file.size)} → ${payload.url}`);
    } catch {
      setError("Upload failed. On a read-only host, paste an external image URL instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-[0.8rem] text-fog">{label}</label>

      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-bone/15 bg-charcoal">
          {value ? (
            value.startsWith("/") || value.startsWith("http") ? (
              <Image src={value} alt="Selected poster preview" fill sizes="144px" className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center font-mono text-[0.55rem] text-ash">
                Preview unavailable
              </span>
            )
          ) : (
            <span className="grid h-full place-items-center font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">
              No image
            </span>
          )}
        </div>

        <div className="space-y-3">
          <input
            className="field-dark"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/media/poster.jpg or https://…"
            aria-label={`${label} URL`}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-sm border border-bone/20 px-3.5 py-2 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-bone transition-colors hover:border-ember hover:bg-ember/10 disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Upload image"}
            </button>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">
              {maxLabel}
            </span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = "";
            }}
          />

          {hint ? <p className="text-[0.75rem] leading-relaxed text-ash">{hint}</p> : null}
          {info ? <p className="text-[0.75rem] text-[#4ade80]">{info}</p> : null}
          {error ? (
            <p role="alert" className="text-[0.75rem] text-ember-glow">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
