# Alec Tear (/lettering) — https://alectear.com/lettering

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio — an independent designer and lettering artist; this route is the lettering half of a two-discipline portfolio [verified, index.html meta description; desktop-s00.png] |
| Visitor mode | persuade — the work is the argument, and a contact pill in the header opens an in-page enquiry form [verified, index.html `contact` pill + `.contact` form CSS; desktop-s00.png] |
| Awards | Awwwards **Site of the Day, 7.19**; date, axis scores and developer scores unread (cookie wall over the score panel) [verified, entry page, `entry/desktop-s00.png`] |
| Corpus rating | D 7.3 / U 6.8 / C 6.9 / Co 7.2 → weighted 7.06, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | designed and built by **noko** [verified, entry page, `entry/desktop-s50.png` "Alec Tear by noko"]; individual credits [unknown] |
| Stack (evidence level) | **SvelteKit** [verified, index.html `/_app/immutable/` modulepreloads] on **Svelte 5** [verified, disclose-version.BDyRb4x3.js `const T="5"`] · **Motion One** (WAAPI `animate` + `stagger`), version [unknown] [verified, Blurhash.C0Hu4wWR.js `"motion-one"`, `--motion-` custom properties] · inline **blurhash** decoder painting 32×32 canvas-2D placeholders [verified, Blurhash.C0Hu4wWR.js] · **Sanity** image CDN (`w=1250&q=88&auto=format`) [verified, live DOM probe `img.currentSrc`] · no smoothing, GSAP or 3D signature in the fetched chunks [verified absence, 8 JS chunks] · fonts **Vulf Mono** + **Halvar Breitschrift** 400/500, self-hosted woff2, `font-display: block` [verified, 0.D4RnQfjg.css `@font-face`; index.html preloads] |
| Palette | two brand tokens plus alpha steps of the lilac, over a white page [verified, 0.D4RnQfjg.css `body{…}`] |
| | electric blue ink, logo disc, active switch segment: |
| | `#0000DC` [verified, 0.D4RnQfjg.css `--color-blue`] |
| | lilac tile ground and `theme-color`: |
| | `#D6D0FF` [verified, 0.D4RnQfjg.css `--color-lilac`; index.html `theme-color`] |
| | darker lilac for pills on light themes: |
| | `#C7BFFF` [verified, 0.D4RnQfjg.css `--color-lilac-dark`] |
| | Strategy: **the house duotone imposed on the work** — every lettering piece is shown re-inked in the blue on the lilac, and the piece's own colourway appears only on hover [verified, desktop-s00.png vs desktop-hover-tile.png] |
| Type | **wide grotesque + mono UI**: Halvar Breitschrift for the switch labels and footer, Vulf Mono lower-case for the header pills and the cursor label; the lettering itself is the display type [verified, 0.D4RnQfjg.css `--font-body`/`--font-mono`; Pill.DjXv5gIp.css] |
| WebGL dosage | none — the 36 canvases are blurhash placeholders drawn with `getContext("2d")` [verified, manifest.json `canvases: 36`; Blurhash.C0Hu4wWR.js; live DOM `canvas.blurhash-src` width 32] |
| Scroll model | native, no smoothing library; a fixed two-segment switch listens to `scrollY` against measured bounds [verified, manifest.json `scrollMode: native`; 0.BQ4Kx_FL.js `scrollAtBottom`] |
| Narrative model | gallery — one masonry wall of 36 logo and lettering tiles, then an empty stage where the discipline switch becomes the close, then a footer line [verified, desktop-s00 to s100.png; 3.DM_-IHou.css `grid--masonry`] |

## 1. Concept and narrative
One person, two disciplines, one switch. The site is split into a design portfolio and a lettering portfolio as sibling routes, and a pill with two segments — design | lettering — sits over the page the whole time, saying which half you are in [verified, desktop-s00.png; live DOM `.part-link` → `/design`, `/lettering`]. The lettering route has no hero and no statement: the first viewport is already the wall, wordmarks and badges at poster weight inside rounded lilac tiles [verified, desktop-s00.png]. Everything is re-inked in one blue, so thirty-six clients read as one hand; the variety lives in letterforms (script, blackletter-adjacent ornament, condensed caps, a mascot badge), not colour [verified, desktop-s25/s50/s75.png]. At the end the wall stops, the page opens into white space, and the small switch is replaced by a large one centred in the viewport — the last question the page asks is which half you want next [verified, desktop-s100.png].

Register: almost no copy on the route; the meta description is dry and self-deprecating about third-person bios [verified, index.html `description`].

## 2. Structure and components
- **Header**: a blue circular logo disc plus three lower-case mono pills (index, about, contact), each a frosted pill with `backdrop-filter: blur(10px)` [verified, index.html; Pill.DjXv5gIp.css]. "index" toggles a list view of the same work, remembered in `sessionStorage` [verified, 3.C9ieEV_B.js `setItem("view","index")`].
- **Discipline switch** (the signature): two segments with a sliding blue indicator; docked near the bottom while scrolling, replaced at the page end by a large centred copy [verified, desktop-s00.png, desktop-s100.png; 0.D4RnQfjg.css `.part--small`, `.part--large`, `.slider--center`].
- **Masonry wall**: 12-column grid, 3 columns ≥ 1200 px, 2 ≥ 580 px, 1 below; tiles span 1, 2 or 3 rows (3:1, 3:2, 3:3) [verified, 3.DM_-IHou.css]. Each tile is one `<a>` with an `aria-label` naming the client, holding a base image and a hover image [verified, live DOM probe: 36 links, 72 images].
- **Cursor label**: a mono pill that follows the pointer and names the hovered project, with an optional image preview slot [verified, desktop-hover-tile.png; 0.D4RnQfjg.css `.popover`].
- **Contact overlay**: a full-screen blue sheet with inline pill inputs that grow to their content width [verified, 0.D4RnQfjg.css `.contact`, `.input`]; not opened in this pass.
- **Footer**: a copyright line and four social links on one row at desktop, stacked above the switch on the phone [verified, desktop-s100.png, mobile-s100.png]. 404: not observed [unknown].

## 3. Visual language
- **Grounds**: white page, lilac tiles, blue ink; three body themes (`theme-light`, `theme-blue`, `theme-lilac`) plus a `custom` theme that injects a per-project style tag, and the `theme-color` meta is rewritten per theme [verified, 0.D4RnQfjg.css; 0.BQ4Kx_FL.js theme switch].
- **Colour as reward**: at rest the work wears the house ink; hover swaps in the real piece (a pink wordmark on aubergine in the capture) [verified, desktop-hover-tile.png]. An unused `image--filter` treatment (grayscale + blue `screen` + `#6a6ab1` `hard-light`) exists in the CSS as a code-side duotone [verified, Image.Cg2ezTNW.css].
- **Type**: the chrome stays small and lower-case so the lettering is the only display type; mono pills at 1–1.05 rem with −.05em tracking; switch labels at `clamp(1.5rem, 3.75vw, 2.65rem)` on the large copy [verified, Pill.DjXv5gIp.css; 0.D4RnQfjg.css].
- **Shape**: one radius (`1.25rem`) on tiles, full pills on every control, `2px` gap between header pills, `.5rem` gutters [verified, 0.D4RnQfjg.css tokens].
- **Browser surfaces**: `theme-color`, a pinned-tab mask colour and `::selection` inverted per theme are all set [verified, index.html; 0.D4RnQfjg.css].

## 4. Motion and effects (with parameters)
- **One curve**: `cubic-bezier(.03,.71,.31,1)` (a hard ease-out) on the grid entry, page swap, inputs and popovers; a softer `cubic-bezier(.06,.58,.3,1)` on the switch [verified, 3.C9ieEV_B.js; 0.D4RnQfjg.css].
- **Wall entry** (Motion One): tiles from opacity 0 and `scale(.97)` to rest, `.6s`, opacity on `.2s`, stagger `.025s` in masonry (`.045s` otherwise) from `.1s` with an ease-in stagger distribution [verified, 3.C9ieEV_B.js]. List view: `scale(.985) translateY(-8px)` to rest, `.8s`, stagger `.0125s` from `.2s` [verified, same file].
- **Discipline swap**: the incoming page slides from `translateX(±10%)` (direction by discipline) to 0 over `.8s` [verified, 3.C9ieEV_B.js].
- **Switch handoff**: the small switch leaves by `opacity 0` + `scale(1.75)` (`2.1` ≥ 1200 px) while the large one arrives from `scale(.5)`; transforms `.4s`, the dock moves on `bottom` over `.7s`; the indicator slides by `translate` and resizes over `.4s` [verified, 0.D4RnQfjg.css `.part--hidden`, `.slider`, `.part-indicator`]. A desktop `main` margin of `85lvh` creates the empty stage the large switch lands in [verified, 3.DM_-IHou.css `.main`].
- **Cursor label**: pointer position lerped at `.3` per frame in rAF (frame-rate dependent), not mounted on touch devices; the pill scales 0 → 1 over `.15s` from its top-left [verified, 0.BQ4Kx_FL.js; math.DC-7jTd4.js; 0.D4RnQfjg.css `.popover-inner`].
- **Tile press**: hover `scale(.98)` with the image counter-scaled to `1.015`, active `.965`, all `.15s`; hover image fades in from `scale(1.025)` over `.5s` [verified, 3.DM_-IHou.css].
- **Pill press**: hover lifts the label 2 px by padding, active drops it back with no transition — a tactile key rather than a colour flash [verified, Pill.DjXv5gIp.css].
- **Load**: no preloader; each image lazy-loads at IntersectionObserver threshold `.05` over its blurhash, then fades in over `.5s` [verified, Image.DV95X1Wa.js; Image.Cg2ezTNW.css]. Sound, WebGL: none [verified absence].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | SvelteKit, Svelte 5 | [verified, index.html; disclose-version.BDyRb4x3.js] |
| CMS / images | Sanity CDN, 1250 px wide, q 88, auto format; blurhash string per image | [verified, live DOM; Blurhash.C0Hu4wWR.js] |
| Motion | Motion One (WAAPI) for entries; CSS transitions for everything else | [verified, Blurhash.C0Hu4wWR.js; CSS files] |
| Scroll | native | [verified, manifest.json] |
| Fonts | 3 self-hosted woff2, preloaded, `font-display: block` | [verified, index.html; 0.D4RnQfjg.css] |

Weights: the 14 fetched CSS and JS files total about 92 KB uncompressed [verified, `wc -c`]. Server HTML carries the chrome but zero `<img>` — the wall renders client-side [verified, index.html]. Breakpoints at 580 / 900 / 1200 / 2280 px [verified, 3.DM_-IHou.css]. `lcpColdSynthetic` in the manifest is a headless artefact and not quoted.

## 6. Weaknesses
- Reduced motion: **pass at rest, no branch** — the reduced-motion frame reads fully, but no `prefers-reduced-motion` query exists in any fetched file [verified, desktop-rm-s00.png, desktop-rm-s50.png; grep 0 hits].
- Keyboard: **mostly pass** — logo, pills, switch and tiles are real links or buttons in a sensible order with `:focus-visible` outlines ≥ 900 px; both switch copies are in the tab order (four stops for two choices) and the hover colourway has no focus equivalent [verified, Tab walk; Pill.DjXv5gIp.css; 3.DM_-IHou.css].
- DOM behind the canvas: **fail without JS** — no canvas problem, but the server HTML holds no work at all [verified, index.html 0 × `<img>`]. No `<h1>` [verified, live DOM].
- Load gate: **pass** — no preloader; blurhash holds each slot [verified, desktop-s50.png].
- Phone: **designed** — one column, the switch docked above the fold line, footer re-stacked; the colourway reveal and the cursor label simply do not exist on touch [verified, mobile-s00/s100.png; 0.BQ4Kx_FL.js touch check].
- Wayfinding and conversion: **pass** — the active segment always says which half you are in; contact is one pill away [verified, desktop captures].

What the awards skills do differently: a reduced-motion tier that drops the stagger and the page slide, one focusable switch at a time, the colourway reveal on `:focus-visible` and as a tap state, and the work server-rendered with its `alt`.

## 7. Principles
1. **Make the site's one navigation question its close.** When a portfolio has two halves, the ending that asks "the other half?" at full scale does more than a footer of links.
2. **Impose the house ink on heterogeneous work, and let hover return the original.** A single ink turns many clients into one hand at rest; colour becomes the reward for attention.
3. **Let the content be the display type.** When the work is typographic, keep the chrome small, lower-case and quiet so nothing competes at poster size.
4. **Give controls a pressed state, not just a hover state.** A 2 px lift and drop on every pill makes a flat UI feel physical at no cost.
5. **Hold every image slot with its own low-resolution colour field.** A per-image placeholder keeps a dense grid from flashing empty rectangles while it loads.

## 8. Take / Don't take
- **Take:**
  - A persistent segmented switch for a two-route split, with one handoff to a large centred copy at the page end (cross-scale out ≈ 1.75, in from .5, ≈ .4 s).
  - A monochrome at-rest treatment for mixed client work, with the true asset on hover and focus.
  - Staggers under 50 ms with an ease-in distribution for walls of more than thirty tiles.
  - Pill controls with a press offset and a frosted backdrop, one radius token for every surface.
- **Don't take:**
  - The hexes, each as a literal:
    - `#0000DC` [verified, 0.D4RnQfjg.css]
    - `#D6D0FF` [verified, 0.D4RnQfjg.css]
    - `#C7BFFF` [verified, 0.D4RnQfjg.css]
  - The electric-blue-on-lilac pairing itself, or any blue-on-pastel duotone read as "the lettering look".
  - The design | lettering pill with its labels and its bottom-dock-to-centre move as drawn.
  - Halvar Breitschrift + Vulf Mono as the pair; the rounded-tile masonry of logos as the page.
  - Any client mark, wordmark or the self-deprecating bio line.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, 6 CSS and 8 JS files, live DOM probe |
| Award | medium — overall 7.19 and the noko credit read from the entry page; date and axis scores behind a cookie wall |
| Concept, structure, visual language | high — five desktop states, five phone states, reduced-motion frames, one hover frame |
| Motion parameters | high — read from the served chunks and CSS |
| Weaknesses | high for reduced motion, keyboard and DOM; medium for phone (emulated, no real device) |
| Contact overlay, 404, design route, per-project themes | low — class names only, not opened |

**Live pass 2026-09-23: reachable, capture exit 0, scroll mode native, no wheel retry needed.** Sources in `.awards/research/alectear/`: 15 captures + `manifest.json`; `desktop-hover-tile.png` (one Playwright hover and Tab walk); `index.html`; `reset.css`, `0.D4RnQfjg.css`, `3.DM_-IHou.css`, `Image.Cg2ezTNW.css`, `Blurhash.DgqFEaIN.css`, `Pill.DjXv5gIp.css`; `0.BQ4Kx_FL.js`, `3.C9ieEV_B.js`, `Blurhash.C0Hu4wWR.js`, `Image.DV95X1Wa.js`, `Pill.CSYdHl1t.js`, `nav.CN_xZnGh.js`, `math.DC-7jTd4.js`, `disclose-version.BDyRb4x3.js`. Award entry `awwwards.com/sites/alec-tear` captured desktop-only into `entry/` (exit 2, cookie wall over the score panel).
