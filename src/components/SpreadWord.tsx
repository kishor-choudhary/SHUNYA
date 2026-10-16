"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Giant wordmark spread edge to edge, the reference layout's signature hero
 * move. Rendered as a decorative element — the brand name is already announced
 * by the header wordmark — so it is hidden from assistive tech to avoid
 * repeating the name.
 */
export default function SpreadWord({
  text,
  className,
  letterClassName,
  stagger = 0.05,
  delay = 0,
}: {
  text: string;
  className?: string;
  letterClassName?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`type-spread ${className ?? ""}`}
      style={{ paddingRight: "0.06em" }}
    >
      {text.split("").map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          initial={{ opacity: 0, y: "0.18em", filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1.1,
            delay: delay + index * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={letterClassName}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}

/** Small mono label flanked by a hairline — the reference's HUD section bars. */
export function SectionBar({
  left,
  right,
  className,
  children,
}: {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-bone/10 pb-3 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash ${
        className ?? ""
      }`}
    >
      <span className="flex items-center gap-3">
        {left}
        {children}
      </span>
      {right ? <span className="text-ash/90">{right}</span> : null}
    </div>
  );
}
