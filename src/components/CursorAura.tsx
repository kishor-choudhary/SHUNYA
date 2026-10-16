"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only cursor aura: a small ember dot tracking exactly, and a slower
 * ring that lags behind and expands over interactive elements. Disabled on
 * touch devices and for reduced-motion visitors — the native cursor returns.
 */
export default function CursorAura() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("cursor-none-desktop");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let hoverBoost = 0;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      const el = event.target as HTMLElement | null;
      hoverBoost = el?.closest?.("a, button, [role='button'], input, textarea, select, label")
        ? 1
        : 0;
    };

    const onLeave = () => {
      target.x = -200;
      target.y = -200;
    };

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      const scale = 1 + hoverBoost * 0.85;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x - 3}px, ${target.y - 3}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - 22}px, ${ring.y - 22}px, 0) scale(${scale})`;
        ringRef.current.style.borderColor = hoverBoost
          ? "var(--color-ember-glow)"
          : "color-mix(in oklab, var(--color-bone) 35%, transparent)";
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("cursor-none-desktop");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[110] hidden lg:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-11 w-11 rounded-full border transition-[border-color] duration-300"
        style={{ borderColor: "color-mix(in oklab, var(--color-bone) 35%, transparent)" }}
      />
      <div ref={dotRef} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-ember" />
    </div>
  );
}
