# Jesper Landberg — https://jesperlandberg.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio (freelance design engineer; home reel plus a `/full` index route and `/projects/<slug>` pages) [verified, index.html sr-only list] |
| Visitor mode | persuade (experience-led): the reel is the pitch, the contact is an e-mail link inside the Profile panel [verified, index.html] |
| Awards | Awwwards **Honorable Mention, 26 Aug 2026**, entry `/sites/jesper-landberg-4`; the entry publishes **no jury axis scores and no developer score**, only community votes; tags Animation, Infinite Scroll, GSAP, Three.js, Nuxt.js; entry palette `#000000` + `#fff` [verified, entry page read and captured 2026-09-23]. The owner's two Awwwards Independent of the Year titles (2022, 2024) are personal, not this site's [verified, index.html meta description] |
| Corpus rating | D 7.4 / U 6.3 / C 7.4 / Co 6.9 → weighted 7.02, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Jesper Landberg, self-built; the entry lists him alone under "by" [verified, entry page]; other credits [unknown] |
| Stack (evidence level) | **Nuxt 3.21.10** on **Vue 3.5.40**, SSR'd HTML with `_payload.json` and `/_nuxt/` chunks [verified, DZyj3ghP.js + index.html] · **Three.js r185** (`REVISION "185"`, `WebGLRenderer`, `ShaderMaterial`, KTX2 + Basis transcoder chunk) [verified, DZyj3ghP.js, DJ70QaFT.js, `basis_transcoder` prefetch] · **GSAP 3.15.0** core; ScrollTrigger appears only as core's internal hook, no plugin evidence [verified / unknown, DZyj3ghP.js] · no Lenis: a hand-written wheel, touch and key engine [verified, DZyj3ghP.js] · CMS DatoCMS (`datocms-assets.com`) [verified, index.html] · video from Mux (`stream.mux.com`) [verified, manifest.json] · Tailwind utility layer [verified, index.html inline CSS] · hosting [unknown] |
| Palette | pure black ground + white ink, no accent in the chrome; chroma comes only from the project sites mapped onto the cards (hexes in §3) [verified, index.html + desktop-s00…s100] |
| Type | one variable grotesque, **ABC Diatype Plus Variable** (weights 200–1000, one woff2, aliased `sans`); uppercase 500-weight labels; root `font-size: clamp(5px, 20px, 10 * 100vw / var(--size))` with `--size` 390 below 650 px and 1500 above [verified, index.html inline CSS] |
| WebGL dosage | 100 % canvas: one fixed canvas draws cards, floor grid, chrome labels and body text; the DOM glyphs are made transparent and a `.sr-only` block carries the content [verified, index.html `data-gl`, manifest.json `canvases: 1`] |
| Scroll model | virtual float, modulo-wrapped: `html, body` fixed with `overflow: hidden` and `touch-action: none`; a custom engine feeds one looping reel [verified, index.html CSS, DZyj3ghP.js; manifest `scrollMode: wheel`] |
| Narrative model | gallery: eight featured projects on one endless reel, no chapters; Profile and Newsletter as overlays [verified, index.html + captures] |

## 1. Concept and narrative
The portfolio as a physical object: each project's site appears as a screenshot printed on a flexible sheet, and the sheets run past on an endless belt above a dark floor grid. Scrolling does more than move the belt: the sheets bend, twist and lean as they travel, so the visitor feels the momentum they put in. There is no hero statement and no headline. The first viewport is already the work, with the name, "Profile", a "Featured / Full" switch and "Newsletter" in the four corners as tiny uppercase labels [verified, desktop-s00.png]. The copy lives in the Profile overlay and the sr-only mirror: a short third-person bio and a numeric boast, "77 awards — 30× Awwwards, 40× FWA, 3× Webby, 2× Lovie" [verified, index.html].

Beats [verified, desktop-s00…s100]: two cards upright at rest with the next title floating at the right → a sheet curling into a tunnel shape as it arrives → a gap in the belt with cards seen edge-on at the sides → a wide sheet folding into a wave with a testimonial page on it → the loop comes back round to the second card. `desktop-s100` shows the same pair as `desktop-s25`: the reel wraps rather than ending.

## 2. Structure and components
- **Preloader**: a full-screen black cover (`z-99`) with three .5 × 5 rem pills drawn by GL (`data-gl="bar"`) [verified, index.html]; hold length [unknown].
- **Corner chrome**: the name links home, then a Profile button, a `nav` labelled "Project views" with Featured / Full (`aria-current`), and a Newsletter button. Each hit area is widened with a `before:-inset-15` pseudo-element [verified, index.html].
- **Reel of cards**: eight `<article data-gl="card" data-id>` elements laid out in a flex row at `43.5svh` tall (max 55 rem), aspect 2048 / 1172, each with a title and a round arrow badge; GL maps a deformable plane onto each box [verified, index.html].
- **Profile overlay**: bio, awards line, Instagram / X / LinkedIn / Email links, all GL-drawn text over real anchors [verified, index.html].
- **Newsletter overlay**: an e-mail field with a visible-but-transparent input, a honeypot `company` field, a `role="status" aria-live="polite"` result line [verified, index.html].
- **Escape** closes the topmost active layer from a layer stack [verified, DZyj3ghP.js `"Escape"` handler].
- **Semantic mirror**: an `.sr-only` block with an `h1`, the bio, an `h2` "Featured work" list of eight project links with one-line descriptions, and an "Elsewhere" list ending in an `llms.txt` link [verified, index.html].
- **Phone**: the reel becomes a vertical stack of full-width rounded cards that also wraps; corner labels scale up to legible size [verified, mobile-s00.png, mobile-s100.png].
- 404 and project pages were not visited [unknown].

## 3. Visual language
- **Ground**: black everywhere, and the entry's own palette agrees:
  `#000` [verified, index.html `bg-black`; entry page lists `#000000`]
- **Ink**: white for every label and title:
  `#fff` [verified, index.html `text-white`; entry page]
- **Selection**: white at 20 %:
  `#fff3` [verified, index.html `selection:bg-white/20`]
- **Unused on the home route**: a gold utility and a light grey exist in the CSS but draw nothing in the captures:
  `#d9a441` [verified, index.html `.text-[#d9a441]`]
  `#eee` [verified, index.html]
- **Floor**: a thin grey perspective grid fading into black at the horizon, the only environmental element [verified, desktop-s00.png].
- **Imagery**: each card carries a full-bleed image or video of the client site, so all colour on the page is borrowed from the work: warm renders, a red testimonial board, pastel collages [verified, desktop-s00/s25/s75.png].
- **Type**: one face; labels at `1rem` uppercase 500, which is 9.6 px on a 1440 viewport under the 1500 artboard; card titles 1.6–1.8 rem with `-0.05em` tracking [verified, index.html]. Devices without hover get `max(1.4rem, 16px)` [verified, index.html `has-not-hover`].
- **Layout**: vw-lock (1 rem = 10 px at 1500 wide, 390 on the phone), four-corner chrome at 8 rem × 4 rem padding on desktop [verified, index.html].
- **Surfaces**: favicons from a single face image; no `theme-color` or `color-scheme` meta [verified, index.html].

## 4. Motion and effects (with parameters)
- **Scroll engine** [verified, DZyj3ghP.js]: wheel delta × 1.25, `deltaMode` lines × 16. A "burst" (|delta| ≥ 40 after a ≥ 30 ms gap and ≥ 500 ms since the last burst) is doubled and eased in at `1 − (1 − .22)^frames`, capped at 4 frames per tick. Touch moves at × 3.25 and releases a fling of the last delta × 35. Keys: ↑/↓ 100 px, PageUp/PageDown `.9 × viewport`, Space and Shift+Space the same; ignored in inputs and with modifiers.
- **Ticker**: its own `requestAnimationFrame` loop emitting a frame ratio `dt / (1000/60)`; GSAP's `autoSleep` off and `lagSmoothing(0)` [verified, DZyj3ghP.js].
- **Card sheets**: planes of 48 × 24 segments (a 32 × 12 variant elsewhere) bent in the vertex shader by `u_twist`, `u_wave`, `u_tunnelP/R/Y`, `u_reel`, `u_spin`, `u_lean*` and `u_sheet*` uniforms; `u_wave × sin(π · p)` peaks mid-transit [verified, DZyj3ghP.js]. Visible as tunnel curls and wave folds [verified, desktop-s25/s50/s75.png].
- **GL text**: each `data-gl="text"` element is measured in the DOM (line and per-character boxes, `fontBoundingBox` ascent and descent) and redrawn with `fillText` into a Canvas-2D texture on a GL plane; the DOM copy stays in place with `-webkit-text-fill-color: transparent` [verified, DZyj3ghP.js + index.html].
- **Transitions**: the entry records Home → Profile as a modal and Home → project and project → project as transitions [verified, entry page element list]; parameters [unknown].
- **CSS**: hover opacity .3–.5 s ease-out; one named curve `cubic-bezier(.23, 1, .32, 1)` [verified, index.html].
- **Quality**: `setPixelRatio(min(2, devicePixelRatio))`, clear colour black [verified, DZyj3ghP.js].
- Reduced motion: none; 0 × `prefers-reduced-motion` in the HTML and the main bundle [verified]. Sound: none [verified as absence].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Nuxt 3.21.10 / Vue 3.5.40, SSR | [verified, DZyj3ghP.js] |
| 3D | Three.js r185, KTX2 + Basis textures | [verified, DZyj3ghP.js, DJ70QaFT.js] |
| Motion | GSAP 3.15.0 core, own rAF ticker | [verified, DZyj3ghP.js] |
| Scroll | hand-written virtual scroll | [verified, DZyj3ghP.js] |
| Content / media | DatoCMS images, Mux video | [verified, index.html, manifest.json] |

Weights: the entry module `DZyj3ghP.js` is 1.1 MB raw, about 340 KB gzipped, with Three.js inside it rather than in a lazy chunk [verified, fetched file]. Manifest: 171 DOM nodes, no console errors, one aborted Mux MP4, CLS .0006; the mobile run timed out on its s75 screenshot [verified, manifest.json]. `lcpColdSynthetic` is a headless artefact and is not quoted.

## 6. Weaknesses
- Reduced motion: **fail**. `desktop-rm-s00…s100` show the same bending sheets as the full-motion run [verified, captures].
- Keyboard: **partial**. Arrows, Page keys and Space drive the reel and Escape closes layers, but the visible cards are `<article>`s with click handlers and no `tabindex`. The only focusable project links are the invisible sr-only ones, and no focus style exists [verified, index.html, DZyj3ghP.js].
- DOM behind the canvas: **pass**. A complete sr-only mirror with `h1`, lists and real links [verified, index.html].
- Load gate: **unknown**. A three-pill loader over a black cover; hold and repeat-visit behaviour not read.
- Phone: **pass**. A designed vertical stack, larger labels, touch fling [verified, mobile-s00.png].
- Wayfinding: **fail**. An endless loop with no count or position, labels at 9.6 px on a 1440 screen, and the contact two clicks deep in Profile [verified, captures + index.html].
- Performance: Three.js ships in the entry chunk [verified, DZyj3ghP.js].

**What the awards skills do differently**: every card is a focusable link with a visible ring and arrow-key stepping [pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]; the sheets rest flat under the reduced tier and freeze under static [recipe:reduced-motion-switch]; the loop shows "n of 8"; labels hold a 12 px floor; GL goes in its own chunk [recipe:quality-tiers].

## 7. Principles
1. **Let the medium carry the momentum.** When the content deforms in proportion to the input, the visitor feels their own gesture, and no separate indicator of speed is needed.
2. **Keep the DOM as the layout engine, even at 100 % canvas.** Measuring real elements and redrawing them in GL keeps the CMS, the breakpoints and the accessibility tree in one place.
3. **A text mirror is cheap if it is the source.** Rasterising DOM text into textures, rather than keeping a second copy of the strings, means the mirror can never drift from what is drawn.
4. **Outsource colour to the work.** A black field with white labels makes a set of unrelated client sites read as one collection.
5. **Separate a flick from a stream.** Detecting a discrete wheel burst and easing it in over a few frames makes mouse wheels and trackpads feel equally deliberate.

## 8. Take / Don't take
- **Take:**
  - Wheel-burst detection: a threshold, a gap and a cooldown, the burst amplified and spread over frames with `1 − (1 − k)^frames`.
  - DOM-measured text rasterised per element into Canvas-2D textures, the DOM glyphs made transparent rather than removed.
  - Segmented planes (about 48 × 24) whose bend is a named uniform peaking mid-transit via `sin(π · p)`.
  - The four-corner chrome with enlarged pseudo-element hit areas.
  - An sr-only semantic block with `h1`, list and links, plus an `llms.txt` link.
  - `min(2, devicePixelRatio)` and a frame-ratio ticker.
- **Don't take:**
  - The black and white chrome and its unused extras as literal values:
    `#000` [verified, index.html]
    `#fff` [verified, index.html]
    `#fff3` [verified, index.html]
    `#d9a441` [verified, index.html]
    `#eee` [verified, index.html]
  - The endless belt of client screenshots over a floor grid, the tunnel curl and wave fold as drawn, and the Featured / Full switch as-is.
  - Any project image, client name, the awards-tally line or the bio wording.
  - 9.6 px labels, click-only `<article>` cards, the missing reduced-motion branch and Three.js in the entry chunk: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards | high: entry page read and captured 2026-09-23; Honorable Mention with no jury scores |
| Stack, type, palette, scroll engine, shader uniforms | high: index.html and DZyj3ghP.js |
| Composition, phone, reduced motion | high: 14 captures |
| Transitions, preloader timing, project pages, 404 | unknown |

**Live pass 2026-09-23: reachable, capture exit 2 (mobile s75 screenshot timed out), scroll mode wheel.** The states were reached by wheel on the first run and the frames differ, so no retry was needed. Sources in `.awards/research/jesperlandberg/`: `desktop-s00…s100`, `mobile-s00/s25/s50/s100`, `desktop-rm-s00…s100`, `manifest.json`, `index.html`, `DZyj3ghP.js` (entry), `DJ70QaFT.js` (KTX2), `Dhdylg00.js`, `CHzWqGxK.js`, `mriNB3Nt.js`, `CSMsEA09.js`, `D6Jn8M47.js`. From awwwards.com/sites/jesper-landberg-4: `entry/desktop-s00`, `entry/desktop-s50`, `entry/desktop-s100` (a cookie wall covers the capture) and `entry/jesper-landberg-4.html`.
