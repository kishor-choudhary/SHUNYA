"use client";

import { motion } from "framer-motion";

/**
 * Slow drifting ember mist — the dust in the air over the crowd on the Moon
 * theme. Purely decorative; every position is fixed rather than random so
 * server and client markup match, and the whole layer is removed under
 * reduced-motion by the global animation override.
 *
 * The dots take their colour from the theme's accent tokens rather than
 * hard-coded crimsons, so the layer stays honest if the palette is retuned.
 */
const DOTS = [
  { left: "8%", top: "58%", size: 5, blur: 1, opacity: 0.5, delay: 0 },
  { left: "17%", top: "34%", size: 3, blur: 0.5, opacity: 0.38, delay: 1.4 },
  { left: "24%", top: "72%", size: 7, blur: 2, opacity: 0.34, delay: 2.8 },
  { left: "33%", top: "46%", size: 4, blur: 1, opacity: 0.44, delay: 0.7 },
  { left: "41%", top: "82%", size: 6, blur: 1.5, opacity: 0.3, delay: 3.6 },
  { left: "49%", top: "28%", size: 3, blur: 0.5, opacity: 0.42, delay: 2.1 },
  { left: "56%", top: "62%", size: 4, blur: 1, opacity: 0.46, delay: 4.4 },
  { left: "63%", top: "40%", size: 6, blur: 2, opacity: 0.32, delay: 1.1 },
  { left: "70%", top: "76%", size: 3, blur: 0.5, opacity: 0.4, delay: 3.1 },
  { left: "78%", top: "52%", size: 5, blur: 1.5, opacity: 0.36, delay: 0.4 },
  { left: "85%", top: "30%", size: 4, blur: 1, opacity: 0.44, delay: 2.5 },
  { left: "91%", top: "68%", size: 6, blur: 2, opacity: 0.3, delay: 1.8 },
] as const;

export default function Particles({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {DOTS.map((dot, index) => (
        <motion.span
          key={`${dot.left}-${dot.top}`}
          className="absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            opacity: dot.opacity,
            filter: `blur(${dot.blur}px)`,
            background:
              index % 3 === 0
                ? "radial-gradient(circle, var(--color-ember-glow), transparent)"
                : "radial-gradient(circle, var(--color-ember), transparent)",
          }}
          animate={{ y: [0, -26, 6, 0], x: [0, 10, -8, 0] }}
          transition={{
            duration: 22 + (index % 5) * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
