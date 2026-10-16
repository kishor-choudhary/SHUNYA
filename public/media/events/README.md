# SHUNYA event photography

Drop the real event photography here, then reference it from the studio
(**Gallery → Add a frame**, or the poster/hero fields on an event) as:

    /media/events/your-file.jpg

Everything currently in `public/media/` (including the graded crops used on the
chapter panels and the hero loop) is **development placeholder material**
generated for the build, and the website labels it as such. Replace it before
launch.

## Recommended sizes

| Use | Ratio | Target width | Notes |
|---|---|---|---|
| Event poster | 4:5 portrait | 1200 px | Also used for social sharing previews |
| Event hero | 16:9 landscape | 2000 px | Falls back to the poster when empty |
| Gallery frame | as shot | 1600 px | Portrait, landscape or square — set the orientation in the studio |
| Homepage chapter | 4:5 portrait | 1600 px | Three chapter panels on the homepage |
| Private experiences tile | — | 1200 px | Six tiles on the private experiences page |

## Guidance

- Shoot and export dark: the design sits on #050506, so lifted shadows look washed out.
- Keep files under 8 MB — that is the studio upload limit. Export at ~75% JPEG quality or use WebP/AVIF.
- Do not burn text, logos or watermarks into images. The layout draws its own type over them.
- Keep the subject clear of the frame edges: tiles are cropped differently on phones and desktop
  (roughly the top and bottom tenth are lost on narrow screens).
- **Alt text is required** in the studio, and it matters: describe what is happening in the frame,
  not the filename. It is what screen-reader users hear and how the gallery is indexed.

## Confirmed vs placeholder

Do not name a venue, city or date in a caption until SHUNYA has confirmed it. The captions and
location fields are free text, so use `TBC` or `Location to be confirmed` until then — the site is
built to present unconfirmed details honestly rather than filling them in.
