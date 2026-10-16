import type { ReactNode } from "react";

import Reveal from "./Reveal";

interface PageHeaderProps {
  /** Section number in the site index, e.g. "02". */
  index: string;
  /** Small mono label on the left of the HUD bar. */
  eyebrow: string;
  /** Right-hand HUD slot — counts, status, or a short note. */
  meta?: ReactNode;
  /** Page title. Rendered as the oversized display plate. */
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Optional wide title sizing for short words like "Events". */
  wide?: boolean;
}

/**
 * Page header used by every inner page: a mono HUD bar, the oversized display
 * plate, an editorial serif lead and optional actions. Keeps the reference
 * layout's rhythm identical from page to page.
 */
export default function PageHeader({
  index,
  eyebrow,
  meta,
  title,
  lead,
  actions,
  wide = false,
}: PageHeaderProps) {
  return (
    <header className="shell">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-bone/12 pb-4 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">
          <span className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            {eyebrow}
          </span>
          <span className="flex items-center gap-3 text-ash/90">
            {meta}
            <span className="text-bone/70">{index} / 06</span>
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <h1
          className={`type-mega mt-8 text-bone ${
            wide
              ? "max-w-[24ch] text-[clamp(2.6rem,11vw,7.6rem)]"
              : "max-w-[20ch] text-[clamp(2.4rem,10vw,7rem)]"
          }`}
        >
          {title}
        </h1>
      </Reveal>

      {lead ? (
        <Reveal delay={0.11}>
          <p className="lede mt-8 max-w-2xl">{lead}</p>
        </Reveal>
      ) : null}

      {actions ? (
        <Reveal delay={0.16} className="mt-9 flex flex-wrap gap-3">
          {actions}
        </Reveal>
      ) : null}
    </header>
  );
}
