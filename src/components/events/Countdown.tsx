"use client";

import { useEffect, useState } from "react";

/** Days / hours / minutes until the event. Renders nothing once it has started. */
export default function Countdown({ target, label }: { target: string; label?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(new Date(target).getTime() - Date.now());
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, [target]);

  if (remaining === null || Number.isNaN(remaining) || remaining <= 0) return null;

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);

  const cells = [
    { value: days, unit: "Days" },
    { value: hours, unit: "Hours" },
    { value: minutes, unit: "Mins" },
  ];

  return (
    <div className="flex items-end gap-6" role="timer" aria-live="off">
      {cells.map((cell) => (
        <div key={cell.unit}>
          <p className="type-mega text-[clamp(1.8rem,5vw,3rem)] text-bone tabular-nums">
            {String(cell.value).padStart(2, "0")}
          </p>
          <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
            {cell.unit}
          </p>
        </div>
      ))}
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
