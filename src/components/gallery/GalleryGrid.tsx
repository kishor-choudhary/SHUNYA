"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { GalleryItem } from "@/lib/types";

type Filter = "all" | "landscape" | "portrait";

/**
 * Masonry gallery with a keyboard-accessible lightbox. Frames are passed in
 * from the server, so the markup is indexable and works without JavaScript;
 * the lightbox is a progressive enhancement.
 */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.orientation === filter)),
    [items, filter],
  );

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (direction: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = (current + direction + visible.length) % visible.length;
        return next;
      });
    },
    [visible.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, step]);

  const current = openIndex !== null ? visible[openIndex] : null;

  const chip = (active: boolean) =>
    `rounded-sm border px-3.5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
      active
        ? "border-ember bg-ember/15 text-bone"
        : "border-bone/15 text-fog hover:border-bone/40 hover:text-bone"
    }`;

  return (
    <div>
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
          Show
        </span>
        {(
          [
            { id: "all", label: "All frames" },
            { id: "landscape", label: "Landscape" },
            { id: "portrait", label: "Portrait" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
            className={chip(filter === option.id)}
          >
            {option.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ash">
          {visible.length} frames
        </span>
      </div>

      {/* masonry */}
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image: ${item.caption}`}
            data-reveal=""
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative block w-full overflow-hidden rounded-sm border border-bone/10 text-left"
          >
            <div
              className={`relative w-full ${
                item.orientation === "portrait"
                  ? "aspect-[3/4]"
                  : item.orientation === "square"
                    ? "aspect-square"
                    : "aspect-[4/3]"
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-transparent opacity-90" />
              <div className="absolute inset-x-4 bottom-4">
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-ash">
                  {item.date} · {item.location}
                </p>
                <p className="mt-1 text-[0.9rem] text-bone">{item.caption}</p>
              </div>
              <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-bone/25 bg-void/50 text-bone opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M4 1H1v3M8 11h3V8M1 8v3h3M11 4V1H8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </div>
            {item.credit ? (
              <span className="sr-only">{item.credit}</span>
            ) : null}
          </motion.button>
        ))}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {current ? (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={current.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col bg-void/96 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
              <div>
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ash">
                  {current.date} · {current.location}
                </p>
                <p className="mt-1 text-[0.95rem] text-bone">{current.caption}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember hover:bg-ember"
                aria-label="Close image viewer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>

            <div className="relative flex-1">
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-bone/10 px-5 py-4">
              <button
                type="button"
                onClick={() => step(-1)}
                className="btn-ghost"
                aria-label="Previous image"
              >
                Prev
              </button>
              <p className="max-w-md text-center font-mono text-[0.55rem] uppercase leading-relaxed tracking-[0.18em] text-ash">
                {current.credit ?? "SHUNYA"}
              </p>
              <button
                type="button"
                onClick={() => step(1)}
                className="btn-ghost"
                aria-label="Next image"
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
