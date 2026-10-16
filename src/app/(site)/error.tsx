"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Keeps the visitor inside the SHUNYA visual
 * language when something breaks server-side, and offers a real way out.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for the hosting platform's logs.
    console.error("[shunya] route error:", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center py-32">
      <p className="eyebrow flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-ember" />
        Something broke
      </p>
      <h1 className="type-mega mt-6 max-w-[20ch] text-[clamp(2.2rem,8vw,5.5rem)] text-bone">
        Signal lost.
        <span className="block text-ash">Not the whole night.</span>
      </h1>
      <p className="mt-8 max-w-xl text-[1rem] leading-relaxed text-fog">
        This section failed to load. Try again — and if it keeps happening, message the SHUNYA team on
        WhatsApp or by email and we will sort it out.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash/90">
          Reference {error.digest}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn-ember">
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Back to the beginning
        </Link>
        <Link href="/contact" className="btn-ghost">
          Contact us
        </Link>
      </div>
    </div>
  );
}
