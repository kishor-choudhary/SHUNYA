/**
 * Global atmosphere layer: film grain, a slow scanline sweep, a blue-cast
 * vignette and faint scan lines. Purely decorative, `pointer-events-none`, and
 * hidden from assistive tech. Sits above content but below interactive chrome
 * (menu and modals use z-[100]+).
 */
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div className="film-grain animate-grain" />
      <div
        className="absolute inset-x-0 h-[18vh] animate-scan opacity-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-gold) 3.5%, transparent) 45%, color-mix(in oklab, var(--color-bone) 4%, transparent) 50%, color-mix(in oklab, var(--color-gold) 3.5%, transparent) 55%, transparent)",
        }}
      />
      {/* Vignette with a cool cast, keeping the eye in the centre of the frame. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 42%, transparent 42%, color-mix(in oklab, var(--color-void) 50%, black) 100%)",
        }}
      />
      {/* Fine horizontal scan lines. */}
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </div>
  );
}
