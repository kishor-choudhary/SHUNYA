"use client";

import { useEffect, useState } from "react";

/**
 * Share an event. The WhatsApp link is a plain anchor so it works with
 * JavaScript off; the copy button and the native share sheet are progressive
 * enhancements on top of it.
 */
export default function ShareActions({ title, url }: { title: string; url: string }) {
  const [status, setStatus] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function copy() {
    try {
      // Copy the address actually being viewed, which stays correct on staging
      // and preview domains too.
      await navigator.clipboard.writeText(window.location.href);
      setStatus("Link copied");
    } catch {
      setStatus("Copy failed — select the address bar instead");
    }
    window.setTimeout(() => setStatus(""), 2600);
  }

  async function share() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* The visitor dismissed the sheet — nothing to report. */
    }
  }

  const classNames =
    "inline-flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-fog transition-colors duration-300 hover:text-bone";

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">Share</span>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames}
      >
        WhatsApp
      </a>

      <button type="button" onClick={copy} className={classNames}>
        Copy link
      </button>

      {canShare ? (
        <button type="button" onClick={share} className={classNames}>
          More
        </button>
      ) : null}

      <span role="status" aria-live="polite" className="font-mono text-[0.58rem] text-ember-glow">
        {status}
      </span>
    </div>
  );
}
