import type { ReactNode } from "react";

/**
 * Infinite horizontal band. The track holds two identical copies and animates
 * to -50%, so the loop is seamless. Pauses for reduced-motion visitors.
 */
export default function Marquee({
  children,
  className,
  speed = 42,
  reverse = false,
  fadeFrom = "from-void",
  showFades = true,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
  /** Tailwind `from-*` colour matching the band behind the marquee. */
  fadeFrom?: string;
  showFades?: boolean;
}) {
  const track = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {children}
    </div>
  );

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {track}
        {track}
      </div>
      {/* Feather the edges so type doesn't hard-cut at the viewport. */}
      {showFades ? (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent md:w-32 ${fadeFrom}`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent md:w-32 ${fadeFrom}`}
          />
        </>
      ) : null}
    </div>
  );
}

/** Convenience: a repeated label with an ember separator. */
export function MarqueeWords({
  words,
  className,
  fadeFrom = "from-ink",
}: {
  words: string[];
  className?: string;
  fadeFrom?: string;
}) {
  return (
    <Marquee className={className} fadeFrom={fadeFrom}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="flex items-center">
          <span className="type-display px-6 text-[clamp(2rem,5.5vw,4.6rem)] text-bone/85 md:px-10">
            {word}
          </span>
          <span className="h-2 w-2 shrink-0 rotate-45 bg-ember" />
        </span>
      ))}
    </Marquee>
  );
}
