/**
 * Renders JSON-LD blocks. Keeping this in one place means every page emits
 * structured data the same way, and script keys never collide when a page
 * carries more than one schema (e.g. Event + BreadcrumbList).
 */
export default function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  return (
    <>
      {data.map((entry, index) => (
        <script
          key={`${String(entry["@type"] ?? "schema")}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
