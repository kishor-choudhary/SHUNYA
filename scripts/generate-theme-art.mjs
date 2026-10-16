#!/usr/bin/env node
/**
 * Generates the hero frames that belong to a theme.
 *
 * Dusk and Moon use photographs that already exist. Void needs the same empty
 * hall in black and white — there is no colour in that theme anywhere, so the
 * frame has to match. Doing it here rather than with a CSS filter means the
 * file can be inspected, optimised and licensed like any other asset.
 *
 *   node scripts/generate-theme-art.mjs
 *
 * Only files under public/media are written; nothing else is touched.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MEDIA = path.join(process.cwd(), "public", "media");

/** file to write → how to build it from a source frame */
const FRAMES = [
  {
    out: "hero-void.jpg",
    from: "chapter-space.jpg",
    // A touch more contrast after desaturating: with no colour to separate the
    // floor from the dark, the gradient has to do the work.
    build: (image) => image.grayscale().linear(1.06, -6),
    note: "Void theme hero — the hall with the colour taken out",
  },
];

for (const frame of FRAMES) {
  const source = path.join(MEDIA, frame.from);
  const target = path.join(MEDIA, frame.out);

  const input = sharp(source, { failOn: "error" });
  const meta = await input.metadata();
  const output = await frame
    .build(input)
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toBuffer();

  await fs.writeFile(target, output);
  console.log(
    `${frame.out}  ${meta.width}×${meta.height}  ${(output.length / 1024).toFixed(0)} KB  (from ${frame.from})`,
  );
  console.log(`  ${frame.note}`);
}
