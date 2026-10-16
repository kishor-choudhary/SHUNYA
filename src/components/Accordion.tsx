"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";

export interface AccordionItem {
  q: string;
  a: string;
}

/**
 * Accessible FAQ accordion — real buttons, `aria-expanded`, keyboard operable,
 * and a height animation that collapses cleanly.
 */
export default function Accordion({
  items,
  className,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  className?: string;
  /** Index open on load, or -1 for all closed. */
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const baseId = useId();

  return (
    <div className={`border-t border-bone/10 ${className ?? ""}`}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={`${item.q}-${index}`} className="border-b border-bone/10">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="group flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-300 hover:text-white md:py-6"
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-[0.65rem] tracking-[0.2em] text-ash">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-[1rem] font-medium text-bone md:text-[1.0625rem]">
                    {item.q}
                  </span>
                </span>
                <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                    isOpen
                      ? "border-ember bg-ember text-white"
                      : "border-bone/25 text-bone group-hover:border-bone/60"
                  }`}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      d={isOpen ? "M1 6h10" : "M6 1v10M1 6h10"}
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 pl-8 text-[0.9375rem] leading-relaxed text-fog">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
