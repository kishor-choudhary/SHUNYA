"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { THEMES, THEME_SWATCH_TOKENS, type ThemeId } from "@/lib/themes";

/**
 * Theme control for the studio.
 *
 * Picking a card previews the theme immediately — the palette is applied to
 * <html> right here, so the admin sees the real thing, real type and real
 * accents — but nothing reaches a visitor until Publish is pressed. The
 * preview is torn down when the card is reverted or this page is left, so a
 * preview can never leak onto another studio screen.
 *
 * On publish the theme is written with the rest of the settings; every visitor
 * then gets it on their next page load, on any device, with no cache to clear.
 */
export default function ThemePicker({ activeTheme }: { activeTheme: ThemeId }) {
  const router = useRouter();
  const [saved, setSaved] = useState<ThemeId>(activeTheme);
  const [preview, setPreview] = useState<ThemeId>(activeTheme);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const dirty = preview !== saved;
  const previewLabel = THEMES.find((theme) => theme.id === preview)?.label ?? preview;

  // Live preview. Restores the published theme on revert and on unmount.
  useEffect(() => {
    document.documentElement.dataset.theme = preview;
    return () => {
      document.documentElement.dataset.theme = saved;
    };
  }, [preview, saved]);

  async function publish() {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: preview }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: Record<string, string>;
        settings?: { theme: ThemeId };
      };
      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? payload.fields?.theme ?? "Could not publish the theme.");
        setStatus("error");
        return;
      }
      const published = payload.settings?.theme ?? preview;
      setSaved(published);
      setPreview(published);
      setMessage("Theme published. Every visitor sees it on their next page load.");
      setStatus("saved");
      router.refresh();
    } catch {
      setMessage("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void publish();
      }}
      className="rounded-sm border border-bone/12 bg-charcoal/40 p-6"
      noValidate
    >
      <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
        Site theme
      </p>
      <p className="mt-3 max-w-2xl text-[0.85rem] leading-relaxed text-fog">
        One theme is live for everybody at a time. Choosing a card here previews it on this
        screen only — press publish and every visitor is served it on their next page load,
        on any device. Nothing is stored in their browser, so there is no cache to clear.
      </p>

      <fieldset className="mt-6">
        <legend className="sr-only">Choose the published theme</legend>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {THEMES.map((theme) => {
            const selected = preview === theme.id;
            const live = saved === theme.id;
            return (
              <label
                key={theme.id}
                data-theme-option={theme.id}
                data-theme-live={live ? "true" : "false"}
                className={`relative flex cursor-pointer flex-col gap-3 rounded-sm border p-4 transition-colors ${
                  selected
                    ? "border-ember/70 bg-ember/10"
                    : "border-bone/12 bg-void/40 hover:border-bone/25"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.id}
                  checked={selected}
                  onChange={() => setPreview(theme.id)}
                  className="sr-only"
                />
                <span className="flex items-start justify-between gap-3">
                  <span className="text-[0.95rem] text-bone">{theme.label}</span>
                  {live ? (
                    <span className="rounded-sm border border-ember/50 px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ember-glow">
                      Live
                    </span>
                  ) : null}
                </span>

                {/* A real mini-render: this box carries the theme's own CSS
                    block, so everything inside it is drawn from the palette the
                    site will actually use — no colour is written down twice. */}
                <span
                  aria-hidden="true"
                  data-theme-preview={theme.id}
                  className="block rounded-sm border border-bone/10 p-2.5"
                  style={{ background: "var(--color-void)" }}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className="font-mono text-[0.6rem] font-semibold tracking-[0.28em]"
                      style={{ color: "var(--color-bone)" }}
                    >
                      SHUNYA
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-gold)" }}
                    />
                  </span>
                  <span className="mt-3 flex items-center gap-2">
                    <span
                      className="h-1.5 w-10 rounded-full"
                      style={{ background: "var(--color-ember)" }}
                    />
                    <span
                      className="h-1.5 w-5 rounded-full"
                      style={{ background: "var(--color-fog)" }}
                    />
                    <span
                      className="h-1.5 w-2.5 rounded-full"
                      style={{ background: "var(--color-ash)" }}
                    />
                  </span>
                  <span className="mt-2.5 flex gap-1">
                    {THEME_SWATCH_TOKENS.map((token) => (
                      <span
                        key={token}
                        className="h-4 flex-1 rounded-[2px]"
                        style={{ background: `var(${token})` }}
                      />
                    ))}
                  </span>
                </span>

                <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ash">
                  {theme.tagline}
                </span>
                <span className="text-[0.78rem] leading-relaxed text-fog">
                  {theme.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {message ? (
        <p
          role="status"
          className={`mt-6 rounded-sm border p-3 text-[0.85rem] ${
            status === "error"
              ? "border-ember/40 bg-ember/10 text-ember-glow"
              : "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-ember" disabled={!dirty || status === "saving"}>
          {status === "saving" ? "Publishing…" : "Publish theme"}
        </button>
        {dirty ? (
          <button type="button" className="btn-ghost" onClick={() => setPreview(saved)}>
            Revert preview
          </button>
        ) : null}
        {/* A polite nudge: the preview is only on this screen. */}
        <span aria-live="polite" className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">
          {dirty ? `Previewing ${previewLabel} — not published yet` : "This is the live theme"}
        </span>
      </div>
    </form>
  );
}
