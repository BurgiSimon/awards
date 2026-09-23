# Alder Workshop demonstration assets

Alder Workshop, its bench, dimensions and product claims are fictional demonstration material. These five synthetic images were created on 2026-09-22 with the built-in image-generation tool, one call per view (five total). They are not photographs of a manufactured product. No external reference artwork was supplied. The selected first view was visually reviewed and supplied as the product, material and lighting reference for each subsequent call. No regeneration or retouching pass followed selection.

Fictional specification: 140 cm wide × 38 cm deep × 45 cm high, white oak, repairable mechanical joints, hardwax-oil finish. The images illustrate that story; they are not engineering evidence or manufacturing documentation.

## Delivered files

| File | Intrinsic width × height | Bytes | Subject, camera, crop and role |
|---|---|---:|---|
| `hero-wide.webp` | 1586 × 992 | 178868 | Complete bench in a limestone/plaster interior; seat-height three-quarter camera; landscape hero with all feet visible. |
| `hero-portrait.webp` | 1024 × 1536 | 173350 | Same bench and interior; three-quarter portrait with quiet wall above and floor below; phone hero with complete silhouette. |
| `joinery-detail.webp` | 1536 × 1024 | 126846 | Front-right seat, rail and leg junction; close three-quarter camera; intentionally cropped grain and paired-pin detail. |
| `workshop.webp` | 1536 × 1024 | 215796 | Pale oak board and squared stock, loose pins, unbranded hand plane and shavings; slightly elevated landscape across a worktable; process context. |
| `product-side.webp` | 1536 × 1024 | 181972 | Nearly straight-on long-side elevation; complete bench and feet against stone and plaster; clear product form. |

Use these intrinsic dimensions for HTML `width` and `height`. In the hero `<picture>`, select the portrait below 48rem and give its `<source>` width 1024 and height 1536; the fallback `<img>` uses 1586 and 992. Preserve the complete silhouette in hero and product views. The close-up is the deliberate crop.

All views retain pale white-oak grain, matte finish and broad left daylight. The bench has four square legs, plain under-seat rails, softly eased rectangular seat edges and vertically paired wooden pins. The workshop is material context, not an assembly diagram. No view includes a person, label, endorsement, logo or website interface.

Native Chromium canvas encoding produced WebP at quality 0.88 without resizing, cropping or retouching. All five decoded at the dimensions above in Chromium 153.0.8010.12, each below 1 MiB. Original PNGs and execution metadata remain outside the repository. Final WebPs omit embedded execution metadata; this document retains explicit synthetic provenance.

## Exact prompts

- [First approved landscape view](hero-wide-prompt.txt)
- [Portrait view](hero-portrait-prompt.txt)
- [Joinery detail](joinery-detail-prompt.txt)
- [Workshop](workshop-prompt.txt)
- [Product profile](product-side-prompt.txt)

Each later prompt's “input image 1” means the exact selected first original.

## Example palette and type

These tokens belong to this fictional materials story, not future projects by default. Warm ground `#f3eee5` relates to stone and oak; brown ink `#32291f` relates to wood shadows; clay `#985038` gives links, focus and selection a distinct accent. Muted text is `#6e6256`. Georgia supplies an editorial display and a neutral system sans-serif body keeps specifications clear. No font files ship.

Computed using WCAG sRGB relative luminance: ink on ground **12.3403:1**, accent on ground **5.1339:1**, muted on ground **5.1269:1**. Ground text on accent also gives **5.1339:1**. These clear 4.5:1 for normal text. The decorative rule `#c9bfb1` gives **1.5705:1**; do not use it for text, focus, or a boundary needed to identify a control.

Standalone stylesheets import `../_shared/base.css` then `../_shared/composition.css`. Use `.composition-title`, `.composition-heading` and `.composition-copy` for their 1.05/1.12/1.6 leading and 64ch maximum prose measure. Body text is 16px, rising to 18px at 48rem; the example uses a light color scheme. Existing global tokens stay unchanged.
