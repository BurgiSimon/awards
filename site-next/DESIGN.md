---
name: awards · contact sheet
description: The plugin's public page as its own proof sheet. Bright proof paper, a silver-black ink that is also the rebate, a second ink for edge print, and one grease-pencil red that rings the install select and nothing else.
colors:
  ground: "#fcfbf8"
  ink: "#131211"
  muted: "#545251"
  accent: "#d1213a"
  rebate-ground: "#131211"
  rebate-ink: "#fcfbf8"
  rebate-muted: "#a9a8a5"
  line: "#d7d6d3"
typography:
  display:
    fontFamily: "Enriqueta, Enriqueta Fallback, Times New Roman, serif"
    fontSize: "104px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Enriqueta, Enriqueta Fallback, Times New Roman, serif"
    fontSize: "56px"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Enriqueta, Enriqueta Fallback, Times New Roman, serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Enriqueta, Enriqueta Fallback, Times New Roman, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  body:
    fontFamily: "Enriqueta, Enriqueta Fallback, Times New Roman, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  caption:
    fontFamily: "Saira Condensed, Saira Condensed Fallback, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0em"
  label:
    fontFamily: "Saira Condensed, Saira Condensed Fallback, Arial Narrow, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0em"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  none: "0px"
spacing:
  unit: "4px"
  gutter: "60px"
  gap: "24px"
  strip: "360px"
  strip-gap: "64px"
  rebate-band: "56px"
  rebate-head: "88px"
  target: "44px"
  space-1: "8px"
  space-2: "24px"
  space-3: "128px"
  space-4: "192px"
  stroke: "2px"
  mark: "3px"
components:
  button-copy:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0px 16px"
    height: "44px"
    typography: "{typography.label}"
  button-copy-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  rebate-link:
    backgroundColor: "{colors.rebate-ground}"
    textColor: "{colors.rebate-ink}"
    rounded: "{rounded.none}"
    padding: "0px 8px"
    height: "44px"
    typography: "{typography.label}"
  rebate-install:
    backgroundColor: "{colors.rebate-ground}"
    textColor: "{colors.rebate-ink}"
    rounded: "{rounded.none}"
    padding: "0px 8px"
    height: "44px"
  rebate-install-underline:
    backgroundColor: "{colors.accent}"
    height: "2px"
  table-head-rule:
    backgroundColor: "{colors.line}"
    height: "2px"
  ticket:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  caption:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
  edge-print:
    backgroundColor: "{colors.rebate-ground}"
    textColor: "{colors.rebate-muted}"
    typography: "{typography.label}"
---

# awards · contact sheet — design system

The frontmatter is the machine-readable layer; `src/styles/tokens.css` and `src/styles/fonts.css` are what the page runs on, and every value below is identical in all three. Frontmatter dimensions are recorded at the 1440 artboard; their `clamp()` forms live in `## Typography`, `## Layout` and `tokens.css`. `muted`, `line` and the three `rebate-*` colours are not extra tokens: they are what `tokens.css` computes on each surface (see `## Colors`), written out so the linter and a token pipeline can read them.

## Overview
- **Creative north star:** an editor's contact sheet of this very page. Proof paper, black rebates around flush frames, edge print along the rebate, a black wax pencil for the jury's marks and one red wax pencil for the select.
- **Colour strategy: restrained duotone, four live tokens.** Paper (`--ground`) and silver-black (`--ink`) carry the page; the second ink (`--muted`) is mixed from them for edge print and captions; the grease red (`--accent`) exists on exactly two things, the ring around the install ticket and the underline under Install in the rebate. Every other colour on screen comes from the frames, which are this page's own captures. **Light, because the scene forces it:** a laptop in daylight with a terminal beside the browser, long reads on /docs and /recipes, and a contact sheet is printed on white paper. The paper is whiter and a hair warmer than the old site's cool lab grey (`#e8ebe9`), so the two worlds never meet.
- **What this world refuses:** the dev-tool default (a dark hero, the install command inside a fake terminal window, a metric row, an icon grid, a docs sidebar on home) and the Awwwards default (near-black with neon glow, an oversized grotesque over a particle field, fade-and-rise). Also the editorial-print register this world borders on: no tracked mono, no hairlines as texture, no cream.
- **Calibration:** [site:primesec] — its measured ramp is 90 / 48 / 24 px at 1440 (display 3.75 × body) and 54 / 32 / 16 at 390, over 100 % media on 11 column edges → here 104 / 56 / 18 at 1440 (5.8 ×) and 44 / 32 / 17 at 390 (2.6 ×), 12 paper columns, media about 25 % of the desktop screen. Reason (WORLD): the frames are a quarter column of photographs, not a full-bleed stage, so the paper beside them holds few words at a larger step and the phone floor stays at the contract's 44 px job line.
- **Calibration:** [site:siteassist] — the one saturated hue lives on the calls to action and eyebrow bullets; panels step in from the glass at about 160 / 48 / 16 px → here the grease red lives on two elements only (under 1 % of the first viewport by area) and there is one inset, not three: the rebate runs flush to the glass and the paper starts 64 px from it, 60 px from the right edge. Reason (WORLD): the hue exists only on the select, and a contact sheet's rebate runs to the edge of the print.
- **Calibration:** [site:okaydev] — one grotesque, controls in tracked mono capitals, display `clamp(48px, 5vw, 192px)`, five grounds as chapters → here the display is `clamp(2.75rem, 7.2222vw, 6.5rem)` with its ceiling at the artboard, controls are an untracked narrow sans in sentence case, and one paper holds every chapter with the rebate as the only dark surface. Reason (WORLD): (a) no tracked mono anywhere; one sheet of paper, one rebate.
- **design.md lint:** 0 errors, 0 warnings on `node "${CLAUDE_PLUGIN_ROOT}/scripts/design-md.mjs" lint DESIGN.md` (2026-10-22, `@google/design.md@0.4.0`); the one info line, `missing-primary`, is expected: the accent plays that role, and only on the select.

## Colors

| Token | Value | Role | Job |
|---|---|---|---|
| `--ground` | `#fcfbf8` · `oklch(0.988 0.004 91)` | proof paper | the page's one ground |
| `--ink` | `#131211` · `oklch(0.183 0.003 68)` | silver-black | text, the jury's black wax marks, frame outlines; the rebate's ground |
| `--muted` | `color-mix(in oklab, var(--ink) 68%, var(--ground))` | second ink | edge print and captions; resolves per surface (below) |
| `--accent` | `#d1213a` · `oklch(0.556 0.207 21)`; P3 `color(display-p3 0.7874 0.1215 0.2147)` under `@supports` | grease-pencil red | **state/bookend of the select only**: the ellipse around the install ticket (home ch. 1 and ch. 6, /install) and the 2 px underline under Install in the rebate |
| `--line` | `color-mix(in oklab, var(--ink) 14%, var(--ground))` = `#d7d6d3` | derived | the one rule under a data table's head; nowhere else |

Hues in the token file: one chromatic hue (the red) plus two near-neutrals; C03 counts at most two.

**Theme table.** One page theme and one surface theme. `data-theme` on `<html>` stays the page's single source; the rebate is a scoped surface that remaps the same names, and the derived tokens are declared on `:root, [data-theme]` so they resolve against the surface they sit on.

| `data-theme` | Where | `--ground` | `--ink` | `--muted` resolves to | `--accent` | `color-scheme` |
|---|---|---|---|---|---|---|
| (none, `:root`) | the paper | `#fcfbf8` | `#131211` | `#545251` | `#d1213a` | light |
| `rebate` | the rebate band or column, the 1:1 frame viewer's surround | `#131211` | `#fcfbf8` | `#a9a8a5` | `#d1213a` | dark |

**Contrast, computed (WCAG 2.2 relative luminance; paper L = 0.9647, ink L = 0.0061, red L = 0.1495, P3 red L = 0.1459).**

| Pair | Ratio | Needs | Use |
|---|---|---|---|
| ink `#131211` on paper `#fcfbf8` | 18.08:1 | 4.5 | all text on paper |
| paper `#fcfbf8` on rebate `#131211` | 18.08:1 | 4.5 | wordmark and nav in the rebate |
| second ink `#545251` on paper | 7.51:1 | 4.5 | captions, credits, table heads on paper |
| edge print `#a9a8a5` on rebate | 7.87:1 | 4.5 | frame stops, capture stamps, build ids, version in the rebate |
| grease red `#d1213a` on paper | 5.09:1 (P3: 5.18:1) | 3 (graphic) | the ticket's ring; would also pass as text, and is never used as text |
| grease red `#d1213a` on rebate | 3.55:1 (P3: 3.49:1) | 3 (graphic) | the Install underline; never text |
| focus ring: ink on paper / paper on rebate | 18.08:1 / 18.08:1 | 3 | `:focus-visible` on both surfaces |
| `--line` `#d7d6d3` on paper | 1.40:1 | — | decorative rule under a table head; the head text itself is ink |
| selection: paper on ink | 18.08:1 | 4.5 | `::selection` |

**No single second ink exists for both surfaces.** The contract asks for one second ink for edge print and captions, AA on paper; edge print sits on the black rebate. The best single grey for both is `#787878` at 4.24:1 on each, which fails AA on both. So the second ink is one mixing rule (`--ink` 68 % into `--ground`) that resolves to `#545251` on paper and `#a9a8a5` on the rebate, both above 7.5:1.

**Chroma.** Tokens carry none beyond the red. Frames keep their own colours untouched (they are this page's screenshots: paper, ink and whatever red they caught); no desaturation, no overprint. The jury's marks are drawn in the ink, never in the red. Until a frame exists, nothing stands in for it: no placeholder, no grey box.

## Typography

**Contract: a voice and a silence.** One family of voice at every size from the job line to the docs body; one narrow edge-print sans for facts of the sheet; the system mono only inside commands and code; the marker is drawn, never typeset.

**The voice.** *A sturdy, upright text serif, low in contrast with a large x-height, narrow enough to keep the job line to three lines at most, that says "your site, proofed before anyone sees it" the way a job line is typed on a ticket, not the way a magazine sets a headline.*
- **Chosen: Enriqueta** (FontFuror, as the `google/fonts` METADATA names the designer; SIL OFL 1.1, from `google/fonts` via Fontsource; licence text in `public/fonts/enriqueta-OFL.txt`). Bracketed wedge serifs, low stroke contrast, x-height 0.48 em, cap height 0.72 em; it sets the job line ("Your site, proofed before anyone sees it.", chosen in the hero probe) in two lines at 104 px inside 956 px and three at 44 px on a phone. Weights 400 (body) and 500 (display, headings, emphasis). No italic is shipped; emphasis is weight 500.
- **Candidates** (`fonts.mjs search --category serif --seed site-next --pull 12 --weights 400,700` and `--variable --pull 10`), judged on `.awards/type/specimen-serif.png` with the job line and a real paragraph:
  - Martel — at 400 the display goes thin and wide, with more contrast than the paper wants at 104 px.
  - Faustina — book contrast and a narrow, literary set: it reads as a magazine, the register WORLD guards against.
  - Labrada — sturdy, but its calligraphic wedges read hand-made and literary rather than typed.
  - Hahmlet — the closest in sturdiness; its wide set breaks the phone job line to four lines at 40 px, and its Latin is the companion of a Korean family.
  - Bitter — a screen slab, low contrast, but the most familiar of the set; reads as a blog default.
  - Laila — a Devanagari companion whose f, y and g terminals pull attention at display size.
  - Montagu Slab — a fat face at display optical size: high contrast, the opposite of the brief.
  - Pulled and not rendered, refused by character: Bona Nova (higher contrast, small x-height), Libre Caslon Text (old-style contrast, small x-height), Playfair Display SC (a reflex family, capitals only), Bodoni Moda SC (didone), Redaction 35 (a degraded-print costume), BIZ UDPMincho, Kaisei Opti and Mirza (companions of Japanese and Arabic families).

**The silence: edge print.** *A narrow, machine-set sans with squared rounds, the way film stock prints frame numbers and batch codes in its rebate: quiet, untracked, light on black.*
- **Chosen: Saira Condensed** 400 (Omnibus-Type, as its METADATA names the designer; SIL OFL 1.1; licence text in `public/fonts/sairacondensed-OFL.txt`). Squared bowls and narrow counters; legible at 13 px on the rebate and 15 px for caption sentences on paper.
- **Candidates** (`fonts.mjs search --category sans-serif --seed site-next --variable --axis wdth --pull 8`, then the narrow families of the same seeded pool), judged on `.awards/type/specimen-edge.png`:
  - Fira Sans Extra Condensed — humanist and warm; reads as interface text, not machine print.
  - Barlow Condensed — road-sign DIN shapes; close, but softer and the most widely seen.
  - Asap Condensed — tight spacing and rounded terminals; dense at 13 px.
  - Sofia Sans Extra Condensed — too compressed; the 15 px caption line closes up.
  - Carrois Gothic — barely narrow; the rebate needs the width saved.
  - Reddit Sans Condensed — another product's brand face, and less narrow.
  - Pathway Gothic One — one display-cut weight, uneven at 13 px.
  - Science Gothic, Pathway Extreme, Georama, Mozilla Headline — their narrow widths live on a `wdth` axis the latin `wght` file does not carry; Saira ships the narrow cut as a static file. Fredoka and Sour Gummy — rounded, refused on sight.
- **Mono:** the system stack `ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace`, only inside `<code>` and the commands. No shipped file.

**Scale** (fluid clamp from the 1440 baseline; px at 1440 → vw; floor; ceiling at the artboard value):

| Token | 1440 | `clamp()` | 390 | Face · weight · leading · tracking |
|---|---|---|---|---|
| `--display` | 104 px | `clamp(2.75rem, 7.2222vw, 6.5rem)` | 44 px | Enriqueta 500 · 1.0 · −0.03em |
| `--h2` | 56 px | `clamp(2rem, 3.8889vw, 3.5rem)` | 32 px | Enriqueta 500 · 1.05 · −0.02em |
| `--h3` | 28 px | `clamp(1.375rem, 1.9444vw, 1.75rem)` | 22 px | Enriqueta 500 · 1.2 · −0.01em |
| `--lede` | 21 px | `clamp(1.1875rem, 1.4583vw, 1.3125rem)` | 19 px | Enriqueta 400 · 1.45 · 0 |
| `--body` | 18 px | `clamp(1.0625rem, 1.25vw, 1.125rem)` | 17 px | Enriqueta 400 · 1.55 · 0 |
| `--caption` | 15 px | `0.9375rem` | 15 px | Saira Condensed 400 · 1.35 · 0 |
| `--label` | 13 px | `0.8125rem` | 13 px | Saira Condensed 400 · 1.2 · 0 |
| code | 16 px | `1rem` (0.9em inside body copy) | 15 px | system mono 400 · 1.5 · 0 |

- Display to label 8:1; display to body 5.8:1 at 1440. Tracking never tighter than −0.03em (T04's floor is −0.06em). Display leading 1.0, chosen on the rendered glyphs: Enriqueta's descenders (j, y, p) clear the next line's ascenders at 1.0 and touch at 0.9.
- Optical hang: Enriqueta's Y and the open quote sit about 0.04 em inside the margin at 104 px; the first display glyph is hung by `margin-inline-start: -0.04em` on the display line only, rechecked after the font swap.
- `font-feature-settings` lives in the token layer (`--font-feature`, `--font-feature-figures`). Enriqueta ships old-style figures only (no `lnum`, no `tnum`; its features are `ccmp frac liga locl`), so a 0 sits at x-height and "P0" would read as "Po": severity and rule identifiers are set as `<code>` in the system mono, and table figures align right. Saira Condensed's figures are lining by design.
- **Labels are a metadata world here, by contract:** every label is a fact of the sheet (a stop, a capture stamp, a route, a build id, a frame's width), set in the edge-print sans, sentence case, untracked, at 13 px. No label sits above any heading; headings carry the hierarchy.
- **Loading:** three woff2 files, 58 KB in all (59,380 bytes) (`public/fonts/enriqueta-latin-400.woff2` 20.1 KB, `enriqueta-latin-500.woff2` 20.2 KB, `saira-condensed-latin-400.woff2` 17.7 KB), `font-display: swap`, metric-matched fallbacks measured against Liberation Serif and Liberation Sans (the metric twins of Times New Roman and Arial): Enriqueta Fallback `size-adjust 109.2%`, ascent 98.63 %, descent 23.9 %, line gap 0 %; Saira Condensed Fallback `size-adjust 78.55%`, ascent 144.49 %, descent 55.89 %, line gap 0 %. Preload all three (awards:stack, 2026-10-22): each is above the fold, and with only Enriqueta 500 preloaded the body and edge-print faces swapped about 90 ms after first paint and moved /recipes by a layout shift of 0.30 (the lede and the filter rewrapped); preloaded, every route measures 0. Nothing is split into lines; if a later phase splits text, it waits on `document.fonts.ready` and re-splits on resize.

## Layout
- **Scaling system: fluid `clamp()` from one 1440 baseline** (product-like: many components, long copy on /docs and /recipes). Every desktop measure is `px / 1440 × 100` vw with a rem floor and a ceiling at the artboard value; no vw-lock handoff, no stepped px tokens. Display stays at 7.2 vw, under T03's 12 vw.
- **Artboard 1440 × 900; phone 390 × 844; tablet 834 × 1194.**
- **Desktop with frames (states a and b of the contract's bootstrapping):** the rebate column `--strip` 25 % (360 px) flush left, sticky, full height; `--strip-gap` 64 px; the paper from x 424 to x 1380 (956 px) on **12 columns** with a 24 px `--gap` (column ≈ 57.7 px); right margin `--gutter` 60 px.
- **Tablet with frames:** rebate column 22 % (≈ 183 px), 32 px gap, paper on **8 columns**, 24 px right margin.
- **Phone, and every width before a capture exists (state c):** the rebate is a sticky top band, `--rebate-band` 56 px, flush to the glass; the paper takes the full width inside `--gutter` (20 px at 390, 60 px at 1440) on **4 columns** at phone width (16 px gap) and the same 12 columns above 1024 px. The composition holds its spans between states: the job line spans 9 of 12 columns whether the paper is 956 or 1320 px wide, so it stays two lines (three at 44 px on a phone).
- **Fingerprint check:** columns 12 / 8 / 4, gutter 24 / 16 px, margin 60 / 20 px; no corpus row shares the set ([site:primesec] measures 32 / 16 px margins on 11 edges).
- **Measure:** prose at `--measure` 64ch; the lede at 32ch; captions at 48ch; flush left, ragged right everywhere.
- **Spacing ladder** on `--unit` 4 px: `--space-1` 8 px inside a component, `--space-2` 24 px between components, `--space-3` `clamp(4rem, 8.8889vw, 8rem)` (128 px) between chapters, `--space-4` `clamp(6rem, 13.3333vw, 12rem)` (192 px) around the interruption. A heading sits `--space-2` from its own block and `--space-3` from the block above.
- **Targets:** every control outside running text is at least `--target` 44 × 44 px at every width (A14, A18); links inside running text keep the line's height and a 0.2 em underline offset.
- **Coarse-pointer swaps:** no custom cursor, no magnetic pull, no hover-only state anywhere (every hover is also `:focus-visible`); the strip does not follow on touch: each chapter carries its frames inline at its head and the rebate's Frames disclosure lists them; a row of frames is native `overflow-x: auto` with `scroll-snap-type: x mandatory` and a visible peek of the next frame. Tested with `any-pointer` as well as `pointer`.
- **Resize:** nothing reloads; the strip and the chapter 3 growth recompute their windows on `ResizeObserver`; 320 px shows no horizontal scroll; 200 % zoom enlarges every rem floor; phone landscape gets the phone layout with the 56 px band, no prompt.

## Elevation & Depth
**Sharp and shadowless; depth by luminance only.** Three levels: paper (L 0.99) → the frames' own light grounds inside their rebate → the rebate (L 0.18). Frames sit flush in the black rebate with 12 px of rebate between them; the current frame carries a 2 px ink outline (paper-coloured inside the rebate). The one lens is the full-size view in chapter 3 (1:1, on the rebate surface). No shadows, grain, glass, glow, gradients or blur anywhere; nothing floats over anything except the 1:1 viewer, which is a modal surface of the rebate's black.

## Shapes
- **Radius: 0** everywhere (`rounded.none`). Prints, frames, buttons, the ticket and the band are square-cornered.
- **The rebate band is the page's only rule.** No hairline as texture, no borders between sections; data tables get one `--line` rule under the head and separate rows by space.
- **Drawn marks:** ring (a hand-drawn ellipse that overshoots the frame edge by about 6 px), cross (two strokes) and arrow (a stroke with an open head), all SVG paths at one `--mark` weight of 3 px, round caps and joins, in the ink; the select's ellipse is the same hand in the red. Marks are drawn (`stroke-dasharray` paths), never typeset, never an icon font.
- **Masks and clipping:** frames are clipped to their own box; no masks on type.
- **Icons:** none. Buttons say what they do ("Copy", "Open at full size", "Close").

## Components
Filled from the page map by `awards:structure` (2026-10-22). Every control is a real `<a>` or `<button>`, 44 × 44 px minimum, with authored hover, `:focus-visible`, active and disabled states in this world's vocabulary: an ink fill, an underline that thickens, a weight step.

- **Link (in prose)** — ink, underline at 1 px with 0.2 em offset; hover and `:focus-visible`: underline thickens to 2 px (`--stroke`) over `--dur-feedback`; focus adds the ring; visited unchanged. Motion hook: none.
- **Rebate (chrome)** — custom. `data-theme="rebate"` surface. Wordmark `awards` in Enriqueta 500 at 20 px in the rebate's ink, the version beside it as edge print (`--muted` on the rebate, 7.87:1); nav Install · Docs · Recipes · Source as edge print at 15 px in the rebate's ink, each a 44 px-tall target; Install carries a 2 px `--accent` underline at all times (the only red in the chrome). Hover/focus: the other links gain a 2 px paper underline; `aria-current="page"` on the current route draws the same underline permanently. Placement: a sticky 56 px top band at every width while no capture exists, and on phones always; the top 88 px of the left column (two 44 px lines) on desktop once frames exist, and on tablet the same block with the four links two by two (four 44 px targets do not fit 150 px of rebate), about 132 px. **Phone band once frames exist (awards:stack):** the wordmark and version, the Frames disclosure and Install, as the contract lists; Docs, Recipes and Source leave the band below 768 px (five 44 px targets and the wordmark need about 400 px of a 350 px band), and Docs and Recipes head the colophon's links on every route in states capture and report (Source on GitHub is already there). Accessibility: `<header>` with a `<nav aria-label="Site">`; the skip link precedes it.
- **Strip (frames)** — custom, slot built and styled, rendered only when `npm run proof` has frames (contract states a and b). `<nav class="strip" aria-label="Frames of this page as the jury captured them">` with an `<ol>` of links, one per frame, each an `<img>` (width, height, alt naming what it shows, its stop, width and capture stamp) in the rebate, edge-printed with stop and stamp; roving tabindex (arrows step, Enter jumps through `window.__awards.scrollTo`, Home/End). Current frame: 2 px paper outline. Caption: "Frames: capture <stamp>, build <id> · Marks: report <date>". Motion hook: `data-motion="strip"` (positional translate, lerp .12 on the shared ticker); reduced: jumps; static: settled. Recipe pairing: `sticky-stages-rails` (sticky, no pin) and `boot-lenis-gsap`. Built by `facts/proof.js` (awards:stack): one list per width class (desktop, tablet), CSS shows the reader's own; the column is cut at the glass's foot until the motion phase moves it, with the caption printed over the foot of the rebate. Before any jury round (state capture) the label reads "Frames of this page as the capture shot them", since no juror has seen them yet.
- **Marks** — custom. Inline SVG over a frame, `aria-hidden`, with the report's line as a real `<figcaption>` (`report <date> · <section>`). Ring, cross, arrow at `--mark`, ink. Draw: `stroke-dashoffset` over `--dur-mark` 600 ms on `--ease-out-expo`, `--stagger` 120 ms between marks on one frame, caption opacity step over `--dur-feedback` 160 ms; once per session. Reduced and static: drawn. Recipe pairing: `scroll-drawn-svg-path` (state-triggered, not scrubbed).
- **Ticket (the select)** — custom. A `<section>`-level block on paper: one row per client (Claude Code, Codex), each an `<ol>` of commands in mono with one Copy button per command, ringed once by a drawn `--accent` ellipse (`aria-hidden` SVG). Copy button: 44 px tall, edge-print label "Copy", 2 px ink border, paper ground; hover and `:focus-visible`: ink fill, paper label; active: the fill steps to the muted ink; copied: label reads "Copied" for 2 s and the page's one `role="status"` region says "Copied: <command>"; disabled (no clipboard): the button is not rendered, the command stays selectable text. Without script the buttons are hidden and the commands are plain text, one click selecting a whole command (`user-select: all`); a wrapped command hangs its continuation by 2ch. Motion hook: `data-motion="select-ring"` draws the ellipse once on entry (`--dur-hero` on the first ticket, `--dur-mark` on the close's). Recipe pairing: none; `designed-footer`'s action-first close for its place in the page.
- **Proof row (recipe frames)** — custom on `horizontal-rail` (native overflow with snap on every pointer, no pin): an `<ol>` on the rebate surface of the recipes' own frames, one per group, each linking to its entry on /recipes, the recipe id under each as edge print; frames 640 × 400 WebP drawn at 220–320 px, lazy. Focus ring inset 6 px so it sits on the rebate. Rendered from `src/data/recipes.json`.
- **The loupe (chapter 3)** — custom on `docked-media-grow` (transform-only growth, linear scrub) and `dialog-nested-lenis-sheet` (native `<dialog>` for the 1:1 view). The frame the jury's memory sentence came from grows out of the strip to the paper's width on the chapter's window; "Open at full size" (`<button aria-haspopup="dialog">`) opens it 1:1 in a `<dialog>` on the rebate surface; Esc closes and focus returns; "Skip the frame" is a link to the scores. Reduced: placed; phone: inline full width. Rendered only when a capture exists.
- **Frames disclosure (phone)** — custom: `<details class="frames-disclosure">` in the band, summary "Frames" (44 px, the nav's underline vocabulary, held while open), its panel a sheet of the rebate's black dropping from the band: one link per phone frame (stop in the voice of edge print, where it sits in words; a marked frame names the marks drawn on it, "cross drawn", and adds the report's lines), then the strip's caption. A link jumps through `window.__awards.scrollTo` and closes the panel; Escape closes it; focus returns to the summary.
- **Report figures** — custom: a `<table>` of the four axes (weight, score), the weighted score, the disposition and the date, each naming its file; before any page-round report, the capture's measured metrics (largest layout shift, longest blocking, page errors) and then the audit's findings as a one-row table by severity, each table followed by one caption line naming its file and date. Measured values are set in the edge-print face at `--h3` (Enriqueta's old-style 0 reads as an o); one `--line` rule under the head.
- **Run rows (chapter 2)** — custom index rows: three `<section>`s (Decide, Build, Judge), each an `<ol>` of its phases with the file each leaves in mono.
- **Marking key (chapter 4)** — custom: the eight audit families as a `<table>` (family, rules, one thing it catches), counts read at build.
- **Catalogue sheet (/recipes)** — custom on `filmstrip-index-rows`' one-link-per-item rule (no self-moving rows): every recipe an `<li>` with its own frame in a rebate (a link to the image at 1:1; ring inset), title linking to its source folder, id, summary, intent, tags and recorded pass date; groups as anchor links that work without script; the group and tag filter as `<button aria-pressed>` controls shown by script.
- **Footer (colophon)** — custom on `designed-footer`: version, MIT, repository, the jury line (report file, date, disposition) when a report exists, the build being read, credits as a table (faces with foundries and licences; libraries with versions once the stack exists).
- **404** — on `designed-404`: the same sheet; the requested path as edge print; one job line; three ways out (home, recipes, docs), links first in the DOM.

## Motion
- **Register: editorial.** A contact sheet is publishing paperwork, and the contract already fixes the hero at 1.2 s and the marks at 600 ms, which is the editorial band, not the mechanical one.
- **Tokens:** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` (the house expo-out: rings, marks, arrivals); `--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)` (travel: the chapter 3 frame's return); `--ease-theme: cubic-bezier(0.65, 0, 0.35, 1)` (no theme swaps are planned; kept for the token contract).
- **Durations:** `--dur-feedback` 160 ms (hovers, the caption's opacity step, Copied); `--dur-routine` 400 ms (the strip's current-frame outline, disclosure); `--dur-mark` 600 ms (one mark's stroke); `--dur-hero` 1200 ms (the s00 ring, once per session).
- **Stagger:** `--stagger` 120 ms between marks on one frame, the contract's value, above the usual 60–100 ms band on purpose: each mark is a separate stroke of a hand.
- **Positional, never velocity:** the strip's offset interpolates linearly in page progress and damps at lerp .12 on the shared ticker; nothing reads scroll speed.
- **Tiers:** full (as above); reduced (`prefers-reduced-motion: reduce`: feedback 0, routine 120 ms, mark 0, hero 200 ms, stagger 0; marks and rings shown drawn; the strip jumps to the current frame; the chapter 3 frame is placed, not grown); static (`data-motion="static"`: everything settled at load, one still per chapter). Never a global animation kill.

## Browser surfaces
- `::selection`: paper text on the ink (an inversion), on both surfaces. The red is not used: it exists only on the select.
- `caret-color`: the ink.
- Scrollbar: `scrollbar-width: thin; scrollbar-color: var(--ink) var(--ground)`; native scrolling kept underneath.
- `:focus-visible`: `outline: 2px solid var(--ink); outline-offset: 4px`, the same shape everywhere; on the rebate the ink token is the paper, so the ring is paper on black (18.08:1 both ways). Not the accent, because the contract keeps the red to the select.
- `color-scheme: light` on `:root`, `dark` on `[data-theme="rebate"]`; `<meta name="color-scheme" content="light">`.
- `<meta name="theme-color" content="#131211">`: the rebate's black, which is the top edge on a phone. No theme swap exists, so it never changes.
- Favicon: `public/favicon.svg`, drawn: a black rebate square holding one paper frame with a red ring offset off its corner, logged as drawn.
- Open Graph image: `public/og.png`, 1200 × 630, to be produced by the proof step from the newest s00 frame in its rebate with the job line beside it in Enriqueta; until a capture exists, a drawn sheet (rebate, job line, ticket ring) rendered from the tokens. Listed now, produced in the stack phase.

## Do's and Don'ts
- Do let the frames carry every colour beyond the four tokens.
- Do keep the red to the select: the ticket's ring and the rebate's Install underline. Nothing else is red.
- Do set every fact of the sheet (stop, stamp, route, build, width) in the edge-print sans, untracked, sentence case.
- Do name the file behind every figure, and leave out whatever has not run.
- Don't track any label; don't put a label above a heading; don't draw a hairline as texture.
- Don't use the red for links, focus, selection, hover or emphasis.
- Don't put a frame inside a device, browser or terminal mock-up.
- Don't add shadows, grain, glow, blur or gradients; depth is the rebate's black.
- Don't typeset the marker; the marks are drawn strokes.
- Don't ship a placeholder where a frame, a score or a mark would go.
