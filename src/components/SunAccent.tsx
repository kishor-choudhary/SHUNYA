/**
 * A static sun, set into a section as a compositional accent — the way the sun
 * sits in the corner of the reference frame. Decorative only: the movable sun
 * lives in the hero, and there is exactly one of those.
 */
export default function SunAccent({
  size = "22rem",
  className,
}: {
  size?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute animate-sun-drift ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span className="sun-body absolute inset-0 block" />
    </div>
  );
}
