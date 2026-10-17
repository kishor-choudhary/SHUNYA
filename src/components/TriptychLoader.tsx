"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * The Triptych theme's entrance panel.
 *
 * Taken from the template's loader: three arch windows, a climbing bar row, a
 * percentage that counts the page in and a definition of the name — "SHUNYA:
 * the void; the empty floor before anything begins."
 *
 * Rules it follows:
 *  · it is decorative — `aria-hidden`, never focusable, never traps anything;
 *  · it appears once per browser session (`sessionStorage`), so moving around
 *    the site is never gated behind the animation again;
 *  · `prefers-reduced-motion` skips it entirely — those visitors go straight
 *    to the page;
 *  · it renders only after hydration, so a visitor without JavaScript never
 *    receives an overlay that could get stuck;
 *  · any click, scroll or key press lifts it immediately, so it can never be
 *    in the way of someone who already knows where they are going.
 */
const STORAGE_KEY = "shunya:triptych-entrance";

type Phase = "pending" | "running" | "exiting" | "done";

export default function TriptychLoader() {
  const [phase, setPhase] = useState<Phase>("pending");
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Private mode can throw on storage access; showing it again is harmless.
    }

    if (reduced || seen) {
      setPhase("done");
      return;
    }

    setPhase("running");

    const duration = 950;
    const start = performance.now();
    let frame = 0;
    let exitTimer = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Storage is optional; the loader simply appears next time.
      }
      setPercent(100);
      setPhase("exiting");
      exitTimer = window.setTimeout(() => setPhase("done"), 850);
    };

    const tick = (now: number) => {
      if (finished) return;
      const progress = Math.min(1, (now - start) / duration);
      setPercent(Math.round(progress * 100));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      finish();
    };

    frame = window.requestAnimationFrame(tick);

    // Anything the visitor does means "I am here for the page, not the
    // prologue" — lift the panel without a second thought.
    const events = ["pointerdown", "wheel", "touchstart", "keydown"] as const;
    events.forEach((event) =>
      window.addEventListener(event, finish, { passive: true, once: true }),
    );

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      events.forEach((event) => window.removeEventListener(event, finish));
    };
  }, []);

  if (phase === "pending" || phase === "done") return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-phase={phase}
      className={`triptych-loader ${phase === "exiting" ? "is-exiting" : ""}`}
    >
      <div className="triptych-loader__backdrop" />

      <div className="triptych-loader__windows">
        <span className="triptych-loader__window" />
        <span className="triptych-loader__window triptych-loader__window--centre" />
        <span className="triptych-loader__window" />

        <div className="triptych-loader__bars">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="triptych-loader__bar"
              style={{ "--bar-i": index } as CSSProperties}
            />
          ))}
        </div>
      </div>

      <p className="triptych-loader__mark">SHUNYA</p>
      <p className="triptych-loader__counter">{percent}%</p>

      <div className="triptych-loader__progress">
        <span
          className="triptych-loader__fill"
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>

      <p className="triptych-loader__definition">
        <b>SHUNYA</b> — the void; the empty floor before anything begins.
      </p>
    </div>
  );
}
