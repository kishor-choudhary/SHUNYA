import Link from "next/link";
import type { ReactNode } from "react";

import Reveal from "./Reveal";

interface SectionHeadingProps {
  /** Small mono label, e.g. "01 / The Sound". */
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Optional right-hand link. */
  action?: { href: string; label: string };
  className?: string;
  align?: "left" | "center";
  size?: "md" | "lg";
}

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  className,
  align = "left",
  size = "lg",
}: SectionHeadingProps) {
  return (
    <div
      className={`flex flex-col gap-6 ${
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      } ${className ?? ""}`}
    >
      <Reveal className={align === "center" ? "max-w-3xl" : "max-w-3xl"}>
        {eyebrow ? (
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-ember" />
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`type-display text-bone ${
            size === "lg"
              ? "text-[clamp(2.1rem,6vw,4.4rem)]"
              : "text-[clamp(1.75rem,4.2vw,3rem)]"
          }`}
        >
          {title}
        </h2>
        {lead ? <p className="lede mt-6 max-w-2xl">{lead}</p> : null}
      </Reveal>

      {action ? (
        <Reveal delay={0.1} className="shrink-0">
          <Link
            href={action.href}
            className="group inline-flex items-center gap-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-bone"
          >
            <span className="link-underline">{action.label}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-bone/25 transition-colors duration-500 group-hover:border-ember group-hover:bg-ember group-hover:text-white">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 6h9M6.5 1.5 11 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
          </Link>
        </Reveal>
      ) : null}
    </div>
  );
}
