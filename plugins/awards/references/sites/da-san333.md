# Daiki Fujita — Portfolio (2025) — https://da-san333.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio — a Tokyo web designer's three-project index [verified, index.html + q1wSYo….mjs About copy] |
| Industry | creative-practice |
| Visitor mode | experience, with a persuade tail (CONTACT mailto and an About panel inside the menu card) [verified, captures + index.html] |
| Awards | No Awwwards, CSSDA or FWA entry found for this domain (one web search, 2026-10-26) [unknown]. The designer's newer site lists "Portfolio v1" (2025) with CSSDA Special Kudos, Best UI, Best UX, Best Innovation and CSS Winner Site of the Day [verified, daikifujita.com index.html — the site's claim]; that "Portfolio v1" is this site is [inferred: same designer, ©2025, SSR dated 2025-09-30]. This site's own About claims FWA of the Day ×1, CSSDA Special Kudos ×2, CSS Winner SOTD ×2 across its work [verified, q1wSYo….mjs — the site's claim] |
| Corpus rating | D 7.0 / U 6.0 / C 6.8 / Co 5.8 → weighted 6.54, 2026-10-26 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Daiki Fujita, designer, Tokyo — design and build [verified, About copy in q1wSYo….mjs]. Third-party Framer parts: a `PixelGridReveal` crediting Pixco, and Framer's Lenis component "cooked and served by darkroom.engineering" [verified, shared-lib.C8-bm9xa.mjs property descriptions] |
| Stack (evidence level) | **Framer** (`generator` "Framer 3e5217b", `server: Framer/24ab00f`) with React 18.2 and Framer Motion chunks [verified, index.html, script_main, `curl -sI`] · **three.js r136** (`REVISION 136`) for one component only [verified, ScrollCounter.By-DpzJw.mjs] · **canvas 2D** for the hero, the pointer trail and the glyph flashes [verified, ScrollCounter + shared-lib] · **Lenis 1.3.8** bundled in Framer's Lenis component, stylesheet from unpkg [verified, shared-lib `1.3.8`; index.html] · fonts: Voyager (Framer built-in), Satoshi (Fontshare), IBM Plex Sans JP (Google) [verified, index.html @font-face] · hosting Framer [verified, response headers] |
| Palette | achromatic: black ground, white type and chrome, grey particles, one white menu card with dark-grey links; no accent (hexes in §3) [verified, index.html + q1wSYo….mjs props] |
| Type | Voyager, a square-cornered pixel-grid display face, for titles and counter; Satoshi for chrome; IBM Plex Sans JP for the Japanese bio [verified, q1wSYo….mjs fonts + props] |
| WebGL dosage | canvas-first: a fixed 2D-canvas hero object under DOM titles, plus one full-viewport WebGL starfield overlay; manifest `canvases` 4 desktop / 3 tablet / 3 phone, `webgl: true` [verified, manifest.json + source] |
| Scroll model | native + Lenis 1.3.8 (`duration` 3 s, expo-out, `smoothWheel`, touch native) [verified, shared-lib + q1wSYo… props; manifest `scrollMode: native`] |
| Narrative model | gallery: three project titles scroll over one fixed object that changes shape per beat [verified, desktop-s00…s100] |
| Palette strategy | achromatic black ground + white ink, grey only from particle density; one white menu card (#000000 / #ffffff) |
| Type contract | pixel-grid display + geometric grotesque chrome + JP sans (Voyager + Satoshi + IBM Plex Sans JP) |
| Awards / score | none found; newer site claims CSSDA Special Kudos + CSS Winner SOTD for "Portfolio v1" (unconfirmed) |
| Confidence | high (source read verbatim, live captures and one state pass; awards unconfirmed) |
| Last verified | 2026-10-26 |

## 1. Concept and narrative
The meta description names the idea: abstraction against concreteness, a client's problem made visible "using particle particles" [verified, index.html]. One cloud of 6,000 grey points sits fixed behind the page and changes shape as the visitor scrolls: a twelve-armed starburst, then the designer's own mark (two squares stacked with a half-round between them, the same figure as the header logo), then an orbit figure of four crossing ellipses [verified, desktop-s00, desktop-s75, tablet-s100, mobile-s100]. Between shapes the points loosen into a round, diffuse cloud [verified, desktop-s50]. Three project titles in a pixel display face scroll over it one viewport at a time, a "1/3" counter keeps count, and a sparse field of white dots drifts across the whole frame, streaking outward while the page moves [verified, desktop-s00, desktop-s25]. Register: terse English chrome, a rotating one-line caption in the menu card ("Hi, I'm Daiki Fujita.", "Focus is on web, interaction & 3D."), a bilingual EN/JA About [verified, captures + shared-lib phrases].

## 2. Structure and components
- **HERO / whole-page object**: a fixed, full-height 2D canvas (container max-width 1200 px, z 1) under everything; the morph runs over the first 1,500 px of scroll (1,200 on phones) [verified, CSS + props]. Detail in §4 and the 3D lens.
- **Project sections**: three 100 vh blocks in a 60 % column, each a link (`./01`–`./03`) whose title decrypts letter by letter and fades in at 50 % visibility; index numbers sit left of the title [verified, q1wSYo… props, desktop-s00/s50/s100]. Routes `/home` and a three-item collection `/:slug` exist in the bundle [verified, script_main]; only home was read.
- **Counter**: "1/3 → 3/3" in the display face, digits sliding per character, right side of a centred 55 % column [verified, desktop-s00/s100; ScrollCounter source].
- **NAV — header**: fixed, 106 px (72 on phones), `mix-blend-mode: difference`; pixel mark + "DAIKI FUJITA" left, "ABOUT" right [verified, desktop-s00, CSS]. ABOUT is a `div tabindex="0"` with a tap handler, exposed as a paragraph [verified, index.html, desktop-aria.yml].
- **NAV — menu card**: a white 500 px bar fixed bottom-centre: a black square pet with two white eyes, a rotating caption, a "+" [verified, desktop-s00]. Tapping it opens the card to CONTACT, ABOUT and a PROJECTS accordion [verified, shared-lib variants]. The pet tracks the pointer, blinks, falls asleep after about 14 s idle and emits pixel "Z"s [verified, props; desktop-s50/s75 show the Z's].
- **NAV — About overlay**: a white full-screen backdrop, black glyph flashes over it, and a right-hand panel with EN/JA bio, an awards list and a mailto [verified, q1wSYo…; see the state frame in §9].
- **FOOTER**: no footer section in the flow. A fixed strip 40 px from the bottom (difference blend, desktop and tablet) holds a column of sixteen 2 px dots that drip in a wave, an X link and "©2025"; phones keep only the dots [verified, desktop-s00, mobile-s00, CSS].
- **WHOLE PAGE overlays**: a desktop-only pointer trail of grey 32 px cells (2D, z 2); 5 × 5 bitmap glyphs flashing white for 100 ms at random spots (2D, z 10); the WebGL starfield on top of everything (z 10, last in the DOM) [verified, CSS + captures desktop-hover-2, tablet-s00, desktop-rm-s50].
- **Intro**: white 128 px cells over the first viewport dissolve in random batches over about 450 ms, every load [verified, PixelGridReveal props + source]. **Cursor**: a white pixel-stepped badge reading "VIEW" over the three titles [verified, desktop-hover-1…3]. 404 and easter eggs beyond the pet [unknown].

## 3. Visual language
- **Ground**: page and canvas black, the only background on every route read:
  `#000000` [verified, q1wSYo….mjs CSS + hero `backgroundColor`]
- **Ink**: white for titles, chrome, cursor and glyph flashes:
  `#ffffff` [verified, index.html — 88 inline `rgb(255, 255, 255)`]
- **Particles**: hero dots desktop, then phones:
  `#999999` [verified, hero `particleColor rgb(153, 153, 153)`]
  `#e6e6e6` [verified, phone override `rgb(230, 230, 230)`]
- **Starfield**: tunnel dots and streaks:
  `#d9d9d9` [verified, tunnel `color rgb(217, 217, 217)`]
- **Menu links**: on the white card:
  `#404040` [verified, index.html `rgb(64, 64, 64)`]
- **Type**: Voyager at 8vw, tracking −.09em, line height ×.5 for two-line titles (60 px on phones); the I reads as an X in every frame ("XNCEPTURE") [verified, all captures]; that it is the glyph, not a frozen scramble, is [inferred from its consistency across frames and viewports]. Satoshi 14 px for chrome, the counter at 20 px, labels as texture (index numbers at 1vw) [verified].
- **Material**: one unit everywhere — the square cell: pixel mark (`image-rendering: pixelated`), pixel-stepped cursor, cell intro, 32 px pointer trail, 5 × 5 glyph flashes, 2 px dots, square particles [verified, index.html + captures]. Greys come only from density and alpha [inferred].
- **Layout**: centred object, titles left-aligned at 300 px from the left edge on 1440, counter on the right of a 55 % column, chrome pinned to the four corners plus a bottom-centre card [verified, desktop-s00]. Phones: object at 1.1 × width, titles across the full width, card full width [verified, mobile-s00].
- **Surfaces**: `lang="en"`; no `theme-color`, no `color-scheme`; favicons per colour scheme [verified, index.html; manifest `lang`].

## 4. Motion and effects (with parameters)
- **Smooth scroll**: Lenis 1.3.8 by duration — `intensity 30` → `duration 3` s with Lenis's expo-out default (`intensity 50` on phones, where touch stays native); `autoRaf`, `anchors`, `allowNestedScroll` [verified, shared-lib + props].
- **HERO morph** (2D canvas): progress = scrollTop over 1 → 1,500 px, smoothed `+= (target − current) × .04` per frame; three shapes, two segments, each shape holding for 18 % at both ends; quadratic in-out between slot pairs [verified, ScrollCounter.By-DpzJw.mjs]. Mid-morph a "ZeroGravity" drift weighted by `sin²(πu)` (intensity .5, boldness .77, frequency 1.2) and a 260 ms burst (×1.72) when the segment changes [verified]. The per-frame smoothing is not time-corrected: both desktop s100 frames are still mid-morph under SwiftShader while tablet and phone reached the orbit [verified, frames; cause inferred].
- **HERO pointer**: repel inside 100 px (200 on phones), falloff cubed, strength 2, swirl 1.5, drag-follow .5, kick capped .01; a 300 px push-out ring; scattered points re-claim the nearest free target through a 16 px spatial hash; friction .999, max 6 px/frame [verified]. Phones never deliver touch to it: the sections above it take pointer events there [verified CSS; consequence inferred].
- **WHOLE PAGE starfield** (WebGL): drift .03 units/frame plus scroll speed `|Δy| × .05`, capped 3, damped (decay .9, ease 20); streak lifetime .1 s [verified]. Values in the WebGL lens.
- **Titles**: decrypt one character per .1 s, noise re-rolled at 60 fps, replays on every entry; appear spring .4 s, bounce .2 [verified, props].
- **NAV**: About backdrop .3 s `ease [.8, 0, .1, 1]`, panel spring .4 s; menu card .4 s same ease; glyph flashes on a musical clock — page layer 15 bpm at 1/2 (every 2 s, 5 ± 1 glyphs, 100 ms each, cells 8 px, 4 on phones), About layer 30 bpm (every 1 s, 12 ± 1) — envelope cubic in-out [verified, props + shared-lib]. Pointer trail (desktop): 32 px cells, stamp radius 32 px growing with speed, decay 1/50 per frame, `alpha = v³`, 3 Hz pulse, sin-hash flicker [verified].
- **FOOTER**: dot wave every 5 s, stagger 70 ms, smoothstep-eased [verified].
- **Load**: Framer page fade .1 s; cell wipe 450 ms with body scroll locked above 768 px [verified].
- **Reduced motion**: only the counter's digit slide stops; the rm frames show the same morph, starfield streaks and glyph flashes [verified, desktop-rm-s00…s100; source].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Platform | Framer, three breakpoints (≥ 1200, 810–1199, ≤ 809), SSR copies pruned at hydration | [verified, index.html, script_main] |
| Components | Framer code components with property controls: hero morph, tunnel, counter, decrypt text, pixel trail, glyph compositor, dots, pet, Lenis | [verified, chunk exports] |
| Rendering | four canvases on desktop: three 2D, one WebGL | [verified, manifest + source] |
| Scroll | Lenis 1.3.8, own rAF; every canvas reads `scrollY` in its own loop, about eight loops in all | [verified per component] |

Entry graph, all statically imported: framer 428,025 B, ScrollCounter chunk 585,516 B (three r136 ≈ 557,816 of it), react 144,991, motion 138,736, shared-lib 134,365, page 72,135 [verified, fetched sizes]; gzip estimate of the three part ≈ 139 KB [inferred, local gzip]. The 2D hero lives in the same chunk, so it waits for three [verified import; consequence inferred]. Hero SVG targets 553, 219 and 6,174 B; no models or textures [verified, `curl -sI`]. Manifest: 351 desktop DOM nodes, CLS 0, no console or page errors, `blockingMs` 1,544 (headless lab, not a field figure) [verified, manifest.json].

### Tech lens: 3D
- **No 3D engine for the hero**: a point cloud projected in JavaScript and painted with `fillRect` on a 2D context [verified, ScrollCounter `Qt`]. It is the rung below the depth ladder's first.
- **Point targets from SVG alpha**: each SVG drawn aspect-fit into an 800 px square, read with `getImageData`; every pixel on a 2 px grid with alpha 255 becomes a target, x/y in −.5….5, z random ±4 (`extrudeDepth 8`) [verified, `Ht`].
- Targets shuffled, cut to 6,000 and to the smallest shape so slot *i* exists in every shape; a failed SVG falls back to a disc of radius .45 [verified, `Wt`, `Ut`].
- Morphs lerp slot *i* of shape A to slot *i* of shape B. The pairing is random, so the midpoint is a diffuse round cloud — the look of desktop-s50 [verified, frame; mechanism from source].
- **Camera**: horizontal fov 45 (40 phones), camera distance 800 (600), yaw and pitch 0; focal = width × .5 / tan(fov/2); scale = focal / (z + distance) [verified, `y()`]. Shape scale .48 × min(w, h), .6 tablet, 1.1 phone [verified].
- **Depth**: 16 buckets between .2× and 4× the camera distance, painted far to near; square dots .6 px × perspective scale clamped .25–2.8; alpha = clamp(scale × 1.15, .25, 1); DPR ≤ 2 [verified].
- **Physics**: follow gain .6 (.3 phones) per frame, then velocity × .3; leash pull past 160 px; z clamped ±6.4 with bounce −.55; jitter by two sines (amp 2, freq 3) — no noise library [verified]. A softer leash at 260 px can never run because it is larger than the hard one [verified, branch order].
- **three.js scene (the tunnel)**: `PerspectiveCamera` fov 30 (90 phones), near .1, far 1000, at z 5, never moves; no lights, materials beyond two `ShaderMaterial`s, models, loaders, raycasting or physics [verified, `Tp`].
- Geometry: 1,000 points (1,500 phones) on a hollow cylinder of radius 7 × (.85–1.15), 200 units deep [verified].
- Disposal on unmount: rAF cancelled, canvas removed, both geometries, both materials and the renderer disposed; no `forceContextLoss` [verified].
- No visibility pause, idle gate, quality tier or reduced-motion branch in either component [verified by absence].

### Tech lens: WebGL
- **One context**: three r136 `WebGLRenderer({antialias: true})`, alpha off, DPR ≤ 2; r136 tries `webgl2`, then `webgl`, and keeps its own context-loss listeners; the component adds none [verified, ScrollCounter chunk].
- **Opaque canvas blended away**: `scene.background` is `rgba(0, 0, 0, 0)`; three keeps the black and drops the alpha with a console warning. The fixed container's `mix-blend-mode: lighten` makes the black vanish over the page [verified, `Tp` + `Color.setStyle` + CSS; effect verified in every frame].
- **Program 1, points**: uniforms `uColor uFadeStart uFadeStrength uSize`. Vertex `gl_PointSize = clamp(uSize * 100.0, 1.0, 10.0)` → 2 px (3 on phones), no attenuation and no DPR factor [verified].
- Fragment `alpha = 1 − (|z| − 15) × .1` past depth 15, so gone by 25 (from 0 on phones); square points; transparent, no depth write [verified].
- **Program 2, trail**: `LineSegments` ring buffer of 10,000 segments with a per-vertex `aBirth` float [verified].
- Each frame, half the points that moved (Δz ≥ 5e-4, no wrap, ≤ 100 units) write a segment from old z to new z, stamped with the clock time [verified].
- Fragment: `life = clamp(1 − (uTime − aBirth) / uLife)`, `alpha = life × uOpacity × exp(−uDepthFade × |z| × .05)`, `discard` at 0; `uLife .1`, `uOpacity 1`, `uDepthFade 1` [verified]. The GPU retires every streak; the CPU only appends.
- Whole attributes re-uploaded whenever a segment is written (no update range) [verified flags; cost inferred].
- **Scroll input**: CPU-side, no uniform. Speed = `MathUtils.damp(speed × .9, min(|Δy| × .05, 3), 20, min(dt, 1/20))` (.02 sensitivity on phones); z advance = .03 + speed per frame, not × dt; points wrap from z > 5 to −200 [verified].
- Direction ignored: scrolling up also flies forward [verified].
- **Absent**: noise, render targets, post-processing, text in GL, pointer input [verified by absence].
- **Read in frames**: at rest a sparse field of 1–2 px dots across the frame; while scrolling, short streaks radiating from the centre [verified, desktop-s00 vs desktop-s25, desktop-s50].
- **Cost**: renders every frame whether or not anything moves; the whole library ships for a component of about 7 KB [verified].
- **Fallback**: no GL means no starfield and nothing else lost — every word is DOM [verified, aria snapshots].

## 6. Weaknesses
- Reduced motion: **fail**. Readable at rest, but the morph, starfield, flashes, trail, decrypt and dots all run; only the counter's slide stops [verified, desktop-rm frames + source].
- Keyboard: **partial**. The three title links take a thin white focus ring [verified, desktop-focus-1…3]. ABOUT and PROJECTS are paragraphs to assistive tech, and the two X links have no name [verified, desktop-aria.yml]. KEYBOARD_ABOUT_RESULT
- DOM behind the canvas: **pass** for text, every word is DOM; **fail** for structure: no heading, no landmark in any ARIA snapshot [verified, *-aria.yml].
- Load gate: a 450 ms cell wipe on every visit, scroll locked while it runs [verified, source]; three ships in the entry for a decorative overlay [verified].
- Phone: **designed** — object at full width, titles at 60 px, full-width card [verified, mobile-s00]. Titles scroll under the header mark and collide with it [verified, mobile-s25, mobile-s75]. The particles cannot be touched there [inferred, CSS].
- Tablet touch: the hero canvas sets `touch-action: none` under content that passes pointer events through, and Lenis leaves touch native, so a finger landing on the canvas may not scroll at 810–1199 px [inferred, CSS + Lenis 1.3.8 source; not tested with touch].
- Legibility: the display face's I reads as an X in every title [verified, captures].
- Wayfinding and conversion: the counter is clear; contact sits one tap inside the menu card; the home says nothing about any project beyond its name [verified].
- Frame-rate-bound motion: per-frame lerps (morph .04, follow .6, advance .03) run slower on slow devices [verified source; desktop s100 frames lag].
- **What the awards skills do differently**: one ticker for every loop, dt-corrected damping, and a reduced tier that holds each shape still [recipe:reduced-motion-switch]; GL in a lazy chunk behind an idle gate [recipe:gl-fps-governor-idle-gate]; real buttons with `aria-expanded`, an `h1` and landmarks; a coarse-pointer swap that lets the finger reach the object.

## 7. Principles
1. **Let one object change state instead of moving the camera.** A fixed point budget that becomes each chapter's figure carries the narrative without a scene.
2. **Hold, then move.** Give each shape a rest at both ends of its segment and spend the motion only in the middle, enveloped so it peaks halfway.
3. **Split scroll position from scroll speed.** Position chooses what is shown; speed drives the ambience, so the page answers how the visitor moves, not only where.
4. **Build every piece of chrome from one unit.** When logo, cursor, intro, trail, glyph flashes and type share a square cell, the effects read as one hand.
5. **Match the renderer to the job.** A few thousand projected points fit a 2D context; reserve the GPU for what needs it, and load it lazily.
6. **Retire on the GPU.** Stamp a birth time once and let the shader fade by age; the CPU only appends.

## 8. Take / Don't take
- **Take:**
  - Composition: a centred object under left-set two-line titles, a counter on the right of a narrower centred column, chrome pinned to the corners and one bottom-centre card that expands into the whole menu [verified, desktop-s00].
  - Scroll-amount morph between sampled point sets with hold windows and a `sin²(πu)` mid-morph envelope; a short burst when the segment changes.
  - Nearest-free-slot re-matching through a spatial hash after the pointer scatters points.
  - Scroll speed, damped and capped, as the speed of an ambient field, separate from the position that picks the content.
  - A `LineSegments` ring buffer with a birth attribute, faded by age in the fragment.
  - An opaque canvas composited with `lighten` when the ground is black — check the blend cost on phones.
  - Ambient flashes on a tempo (bpm and division) rather than random timers.
- **Don't take:**
  - The colours as literal values:
    `#000000` [verified, q1wSYo….mjs CSS]
    `#ffffff` [verified, index.html]
  - The starburst, the mark and the orbit figure; the pixel mark, the Voyager titles, the sleeping pet, the caption lines and the three-title order.
  - three.js whole in the entry for one overlay; eight loops without a ticker; per-frame lerps without dt; no reduced tier; a `div` as the About button.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Stack, both lenses, motion parameters, tokens | high: index.html and the first-party Framer chunks read verbatim |
| Composition, phone, tablet, reduced motion, ARIA | high: desktop, tablet, mobile and desktop-rm captures + ARIA snapshots |
| About overlay, menu card, keyboard path | STATE_CONFIDENCE |
| Awards, the identity with "Portfolio v1" | unknown / inferred: no entry found; claims are the designer's own |

**Live pass 2026-10-26: reachable, prepass status ready, capture exit 0** (`--scroll 0,25,50,75,100`, desktop 1440 × 900, tablet 834 × 1194, phone 390 × 844, desktop reduced motion). EXTRA_PASS Sources in `.awards/research/da-san333/`: `index.html`, `src/` (script_main, page module q1wSYo…, ScrollCounter.By-DpzJw, shared-lib.C8-bm9xa, framer, react, motion), the frames, `manifest.json`, `*-aria.yml`, `lens-notes.md`; asset sizes from `curl -sI`; daikifujita.com's claims from that wave's fetched `index.html`.
