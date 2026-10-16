"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Studio sign-in. The default demo credentials are shown because this is a
 * development handover build — remove the hint (and set real credentials) before
 * the site goes live.
 */
export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Sign-in failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      id="main"
      className="relative mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-6 py-20"
    >
      <div className="flex items-baseline gap-3">
        <div>
          <p className="type-display text-[1.05rem] tracking-[0.3em] text-bone">SHUNYA</p>
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-ash">
            Content studio
          </p>
        </div>
      </div>

      <h1 className="type-display mt-10 text-[clamp(1.6rem,5vw,2.4rem)] text-bone">
        Studio access
      </h1>
      <p className="mt-4 text-[0.92rem] leading-relaxed text-fog">
        Sign in to manage events, galleries, enquiries and contact details.
      </p>

      <form onSubmit={onSubmit} className="card-dark mt-8 space-y-5 p-6" aria-label="Studio sign in">
        <div>
          <label htmlFor="studio-username" className="mb-2 block text-[0.8rem] text-fog">
            Username
          </label>
          <input
            id="studio-username"
            name="username"
            autoComplete="username"
            className="field-dark"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="studio-password" className="mb-2 block text-[0.8rem] text-fog">
            Password
          </label>
          <input
            id="studio-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="field-dark"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-sm border border-ember/40 bg-ember/10 p-3 text-[0.85rem] text-ember-glow">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-ember w-full" disabled={busy}>
          {busy ? "Signing in…" : "Enter the studio"}
        </button>
      </form>

      <div className="mt-6 rounded-sm border border-bone/15 bg-charcoal/50 p-4">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
          Development credentials
        </p>
        <p className="mt-2 font-mono text-[0.75rem] text-bone">
          username: shunya-admin
          <br />
          password: shunya-demo
        </p>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-fog">
          Change these under Studio → Settings before launch. The session is a signed, HttpOnly
          cookie and expires after 8 hours.
        </p>
      </div>
    </main>
  );
}
