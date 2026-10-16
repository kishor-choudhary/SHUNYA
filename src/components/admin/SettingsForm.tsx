"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SiteSettings } from "@/lib/types";

export default function SettingsForm({
  settings,
  username,
  mustChangePassword,
}: {
  settings: SiteSettings;
  username: string;
  mustChangePassword: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    brandName: settings.brandName,
    tagline: settings.tagline,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    whatsapp: settings.whatsapp,
    instagram: settings.instagram,
    heroVideoUrl: settings.heroVideoUrl,
    heroVideoCredit: settings.heroVideoCredit,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [password, setPassword] = useState({
    currentPassword: "",
    username,
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordState, setPasswordState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    setErrors({});
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !payload.ok) {
        setErrors(payload.fields ?? {});
        setMessage(payload.error ?? "Could not save settings.");
        setStatus("error");
        return;
      }
      setMessage("Settings saved. The live site updates immediately.");
      setStatus("saved");
      router.refresh();
    } catch {
      setMessage("Network error — please try again.");
      setStatus("error");
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordErrors({});

    if (password.newPassword !== password.confirmPassword) {
      setPasswordErrors({ confirmPassword: "The two passwords do not match." });
      return;
    }

    setPasswordState("saving");
    setPasswordMessage("");
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          username: password.username,
          newPassword: password.newPassword,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !payload.ok) {
        setPasswordErrors(payload.fields ?? {});
        setPasswordMessage(payload.error ?? "Could not change the password.");
        setPasswordState("error");
        return;
      }
      setPassword({ ...password, currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Credentials updated. Use the new password next time you sign in.");
      setPasswordState("saved");
      router.refresh();
    } catch {
      setPasswordMessage("Network error — please try again.");
      setPasswordState("error");
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    options?: { placeholder?: string; hint?: string; type?: string },
  ) => (
    <div>
      <label htmlFor={`settings-${key}`} className="mb-2 block text-[0.8rem] text-fog">
        {label}
      </label>
      <input
        id={`settings-${key}`}
        type={options?.type ?? "text"}
        className="field-dark"
        value={form[key]}
        onChange={(event) => setForm((previous) => ({ ...previous, [key]: event.target.value }))}
        placeholder={options?.placeholder}
        aria-invalid={errors[key] ? true : undefined}
      />
      {errors[key] ? <p className="mt-1.5 text-[0.75rem] text-ember-glow">{errors[key]}</p> : null}
      {options?.hint ? <p className="mt-1.5 text-[0.72rem] text-ash">{options.hint}</p> : null}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* --- brand & contact ------------------------------------------------ */}
      <form onSubmit={saveSettings} className="rounded-sm border border-bone/12 bg-charcoal/40 p-6" noValidate>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          Brand & contact details
        </p>
        <p className="mt-3 max-w-2xl text-[0.85rem] leading-relaxed text-fog">
          These values feed the header, footer, contact page and WhatsApp links across the site.
          They ship as placeholders — replace them with the company&rsquo;s verified details.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {field("brandName", "Brand name")}
          {field("tagline", "Tagline")}
          {field("contactEmail", "Contact email", { placeholder: "hello@yourdomain.com" })}
          {field("contactPhone", "Contact phone", { placeholder: "+91 00000 00000" })}
          {field("whatsapp", "WhatsApp number", {
            placeholder: "910000000000",
            hint: "International format, digits only — no +, spaces or dashes.",
          })}
          {field("instagram", "Instagram URL", { placeholder: "https://instagram.com/…" })}
          <div className="md:col-span-2">
            {field("heroVideoUrl", "Hero frame image URL (overrides the theme)", {
              placeholder: "/media/your-photograph.jpg or https://…",
              hint: "Leave empty to use the frame that belongs to the published theme. Set it to override every theme with one photograph — a wide, landscape image works best, since the hero crops to fill the screen.",
            })}
          </div>
          <div className="md:col-span-2">
            {field("heroVideoCredit", "Hero frame credit line", {
              hint: "Shown at the bottom of the hero to credit the photograph or disclose that it is placeholder material.",
            })}
          </div>
        </div>

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

        <button type="submit" className="btn-ember mt-6" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save settings"}
        </button>
      </form>

      {/* --- password ------------------------------------------------------- */}
      <form
        id="password"
        onSubmit={changePassword}
        className="scroll-mt-24 rounded-sm border border-bone/12 bg-charcoal/40 p-6"
        noValidate
      >
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          Studio credentials
        </p>
        {mustChangePassword ? (
          <p className="mt-4 rounded-sm border border-ember/40 bg-ember/10 p-3 font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.14em] text-ember-glow">
            The default development password is still in use. Set a real password before launch.
          </p>
        ) : (
          <p className="mt-3 text-[0.85rem] text-fog">
            The studio is protected by a signed, HttpOnly session cookie that expires after 8 hours.
          </p>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="studio-current" className="mb-2 block text-[0.8rem] text-fog">
              Current password
            </label>
            <input
              id="studio-current"
              type="password"
              autoComplete="current-password"
              className="field-dark"
              value={password.currentPassword}
              onChange={(event) =>
                setPassword((previous) => ({ ...previous, currentPassword: event.target.value }))
              }
              required
            />
            {passwordErrors.currentPassword ? (
              <p className="mt-1.5 text-[0.75rem] text-ember-glow">{passwordErrors.currentPassword}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="studio-username" className="mb-2 block text-[0.8rem] text-fog">
              Username
            </label>
            <input
              id="studio-username"
              autoComplete="username"
              className="field-dark"
              value={password.username}
              onChange={(event) =>
                setPassword((previous) => ({ ...previous, username: event.target.value }))
              }
              required
            />
            {passwordErrors.username ? (
              <p className="mt-1.5 text-[0.75rem] text-ember-glow">{passwordErrors.username}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="studio-new" className="mb-2 block text-[0.8rem] text-fog">
              New password
            </label>
            <input
              id="studio-new"
              type="password"
              autoComplete="new-password"
              className="field-dark"
              value={password.newPassword}
              onChange={(event) =>
                setPassword((previous) => ({ ...previous, newPassword: event.target.value }))
              }
              required
            />
            {passwordErrors.newPassword ? (
              <p className="mt-1.5 text-[0.75rem] text-ember-glow">{passwordErrors.newPassword}</p>
            ) : (
              <p className="mt-1.5 text-[0.72rem] text-ash">At least 10 characters.</p>
            )}
          </div>

          <div>
            <label htmlFor="studio-confirm" className="mb-2 block text-[0.8rem] text-fog">
              Confirm new password
            </label>
            <input
              id="studio-confirm"
              type="password"
              autoComplete="new-password"
              className="field-dark"
              value={password.confirmPassword}
              onChange={(event) =>
                setPassword((previous) => ({ ...previous, confirmPassword: event.target.value }))
              }
              required
            />
            {passwordErrors.confirmPassword ? (
              <p className="mt-1.5 text-[0.75rem] text-ember-glow">{passwordErrors.confirmPassword}</p>
            ) : null}
          </div>
        </div>

        {passwordMessage ? (
          <p
            role="status"
            className={`mt-6 rounded-sm border p-3 text-[0.85rem] ${
              passwordState === "error"
                ? "border-ember/40 bg-ember/10 text-ember-glow"
                : "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]"
            }`}
          >
            {passwordMessage}
          </p>
        ) : null}

        <button type="submit" className="btn-ember mt-6" disabled={passwordState === "saving"}>
          {passwordState === "saving" ? "Updating…" : "Update credentials"}
        </button>
      </form>
    </div>
  );
}
