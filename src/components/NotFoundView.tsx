import Link from "next/link";

import SpreadWord from "./SpreadWord";

/**
 * Shared 404 view so the site and the root fallback stay identical. Laid out
 * like a page: HUD bar, oversized plate, serif lead, routes back in.
 */
export default function NotFoundView({ standalone = false }: { standalone?: boolean } = {}) {
  /* Inside the site chrome the layout already provides <main id="main">; the
     root fallback renders outside it, so it brings its own landmark. */
  const Wrapper = standalone ? "main" : "div";
  return (
    <Wrapper
      id={standalone ? "main" : undefined}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-32"
    >
      <div className="mist left-1/2 top-1/4 h-[34rem] w-[34rem] -translate-x-1/2" />

      <div className="shell relative">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone/12 pb-4 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-ash">
          <span className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Error 404 · Page not found
          </span>
          <span className="text-bone/70">00 / 06</span>
        </div>
      </div>

      {/* Oversized plate, spread edge to edge like the hero. */}
      <div className="shell relative mt-14 w-full">
        <SpreadWord
          text="404"
          stagger={0.08}
          className="text-[clamp(4rem,20vw,14rem)] text-bone"
          letterClassName="text-shadow-cine"
        />
      </div>

      <div className="shell relative mt-10">
        <h1 className="type-mega max-w-[18ch] text-[clamp(1.9rem,6vw,3.6rem)] text-bone">
          Shoonya.
          <span className="block text-ash">Nothing here.</span>
        </h1>

        <p className="lede mt-7 max-w-xl">
          The page you were looking for has moved, been unpublished, or never existed. That is the
          funny thing about the void — plenty of room, no directions.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-ember">
            Back to the beginning
          </Link>
          <Link href="/events" className="btn-ghost">
            See events
          </Link>
          <Link href="/contact" className="btn-ghost">
            Contact us
          </Link>
        </div>
      </div>
    </Wrapper>
  );
}
