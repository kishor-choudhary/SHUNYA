import GalleryManager from "@/components/admin/GalleryManager";
import { getGallery } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await getGallery({ includeHidden: true });

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          {items.length} frames
        </p>
        <h1 className="type-display mt-3 text-[clamp(1.6rem,4vw,2.4rem)] text-bone">Gallery</h1>
        <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-fog">
          Add frames, write meaningful alt text, hide or delete. Replace the shipped placeholder
          visuals with licensed event photography before launch.
        </p>
      </header>

      <GalleryManager items={items} />
    </div>
  );
}
