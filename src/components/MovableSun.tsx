"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The sun — the one movable thing on the site.
 *
 * It can be dragged with a pointer or nudged with the arrow keys, and it is a
 * labelled slider so that keyboard and screen-reader visitors can move it too.
 * Dragging it down the frame deepens the dusk: the hero sky darkens and the
 * sun itself warms towards the horizon.
 *
 * The effect is decorative — `--sun-travel` is 0 until it is moved, so a
 * visitor who ignores the sun sees the untouched photograph. Position is kept
 * in a ratio of the hero box, so a resize never loses it, and nothing is
 * persisted: every visit starts at the horizon.
 */

/**
 * Where the sun starts. The photograph's own glow sits low and far to the
 * right of the composited frame, so the sun begins a little inside it — close
 * enough to read as the light that lit the palace, clear of the edge so it is
 * never clipped and always grabbable. The frame contains no sun disc, which is
 * why dragging this one away leaves no ghost behind it.
 */
const START = { x: 0.86, y: 0.30 };

/** How far down the frame the sun can be dragged, as a fraction of height. */
const MIN_Y = 0.16;
const MAX_Y = 0.9;

/** Keep a whole sun inside the frame, whatever the viewport. */
const EDGE = 0.055;

export default function MovableSun({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(START);
  const [dragging, setDragging] = useState(false);
  const [travel, setTravel] = useState(0);

  /** Depth of the scene: 0 at the horizon, 1 at the very bottom of the frame. */
  const depthFor = useCallback((y: number) => {
    const span = MAX_Y - MIN_Y;
    return span <= 0 ? 0 : Math.min(1, Math.max(0, (y - MIN_Y) / span));
  }, []);

  const apply = useCallback(
    (x: number, y: number) => {
      const clampedX = Math.min(1 - EDGE, Math.max(EDGE, x));
      const clampedY = Math.min(MAX_Y, Math.max(MIN_Y, y));
      setPosition({ x: clampedX, y: clampedY });
      setTravel(depthFor(clampedY));
    },
    [depthFor],
  );

  /* Publish the depth on the hero element so the sky can respond. */
  useEffect(() => {
    const host = boxRef.current?.parentElement;
    if (!host) return;
    host.style.setProperty("--sun-x", `${(position.x * 100).toFixed(2)}%`);
    host.style.setProperty("--sun-y", `${(position.y * 100).toFixed(2)}%`);
    host.style.setProperty("--sun-travel", travel.toFixed(3));
    host.dataset.sunMoved = travel > 0.001 ? "true" : "false";
  }, [position, travel]);

  /* Pointer drag, with capture so the gesture survives leaving the disc. */
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const onMove = (event: PointerEvent) => {
      const host = box.parentElement;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      apply((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    const onDown = (event: PointerEvent) => {
      setDragging(true);
      box.setPointerCapture?.(event.pointerId);
      onMove(event);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    box.addEventListener("pointerdown", onDown);
    return () => {
      box.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [apply]);

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 0.06 : 0.02;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      Home: [0, MIN_Y - position.y],
      End: [0, MAX_Y - position.y],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    apply(position.x + move[0], position.y + move[1]);
  }

  const percentage = Math.round((1 - travel) * 100);

  return (
    <div
      ref={boxRef}
      role="slider"
      tabIndex={0}
      aria-label="Move the sun"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      aria-valuetext={`${percentage}% of the light left`}
      onKeyDown={onKeyDown}
      className={`group absolute z-[3] h-24 w-24 -translate-x-1/2 -translate-y-1/2 select-none rounded-full outline-none transition-transform duration-300 ease-out focus-visible:ring-2 focus-visible:ring-bone/85 focus-visible:ring-offset-[10px] focus-visible:ring-offset-transparent ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      } ${className ?? ""}`}
      /* The visible disc is the size of a sun in the landscape; the hit area is
         deliberately larger, so it is easy to catch on a phone. */
      data-sun-body=""
      style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
    >
      <span
        aria-hidden="true"
        className="sun-body absolute left-1/2 top-1/2 block aspect-square w-[clamp(3.25rem,4.4vw,5.5rem)] -translate-x-1/2 -translate-y-1/2"
      />

      {/* A hint that only shows until the sun has been moved. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] -translate-x-1/2 whitespace-nowrap font-mono text-[0.5rem] uppercase tracking-[0.24em] text-bone/75 transition-opacity duration-500 ${
          travel > 0.001 ? "opacity-0" : "opacity-100"
        } group-hover:opacity-100`}
      >
        Drag the sun
      </span>
    </div>
  );
}
