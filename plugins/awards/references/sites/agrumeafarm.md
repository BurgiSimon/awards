# Agrumea Farm — https://www.agrumeafarm.it/en

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | brand: a Sicilian producer of jams, pestos and preserves; routes Pantry (`/dispensa` + one route per product), Production, Experience, About, Contacts, and a Shop link [verified, index.html nav hrefs; meta description] |
| Visitor mode | experience: the home route is one product carousel and nothing else; reading happens on the product and story routes [verified, desktop-s25…s100.png; index.html, 359 DOM nodes] |
| Awards | Awwwards **Nominee, 1 Oct 2026**, public vote still open, no jury scores published; tagged Food & Drink, Promotional, Animation, 3D, GSAP, Three.js, Nuxt.js [verified, entry page `entry/entry.html`, `entry/desktop-s00.png`] |
| Corpus rating | D 7.4 / U 6.6 / C 7.3 / Co 6.8 → weighted 7.08, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Studio K95 [verified, entry page] |
| Stack (evidence level) | **Nuxt** (`/_nuxt/` chunks, `__NUXT_DATA__`) [verified, index.html] · Prismic CMS (`images.prismic.io/agrumea-site`, `getSingle("homepage")`) [verified, index.html; C2lrDrZj.js] · **GSAP 3.15.0** with ScrollTrigger, Observer, CustomEase [verified, 5uUeoJaR.js `version="3.15.0"`, `registerPlugin`] · **Lenis 1.3.23** [verified, 5uUeoJaR.js `Gp="1.3.23"`] · **Three.js r160**, lazily imported for the carousel only [verified, DoMZv-wV.js `"160"`; C2lrDrZj.js dynamic import] · **matter-js 0.20.0** for the loader [verified, 5uUeoJaR.js `s.version="0.20.0"`] · Adobe Fonts kit (ivymode, ivystyle-sans) [verified, typekit.css] · Google Analytics [verified, capture-out.json requests] |
| Palette | cream ground, oxblood ink, one orange accent, a yellow reserve (hexes in §3); strategy: **warm ground + dark ink + one hot accent; the product labels bring every other colour** [verified, CmsHomePage + inline CSS tokens; desktop captures] |
| Type | **display serif for logo-adjacent display and spaced caps + humanist sans for UI**: ivymode for display and the uppercase prompt, ivystyle-sans 400/600 for buttons and body [verified, inline CSS `--font-serif`, `--font-sans`; typekit.css] |
| WebGL dosage | moments: one offscreen Three.js renderer draws only the jar labels; each jar is a photo plus a 2D canvas the renderer blits into [verified, C2lrDrZj.js; manifest `canvases: 10`] |
| Scroll model | virtual float: on the home route the wheel and drag are captured to move a tilted carousel; Lenis drives the other routes and is off under reduced motion [verified, C2lrDrZj.js `wheel` `preventDefault`; manifest `scrollMode: wheel`; 5uUeoJaR.js] |
| Narrative model | gallery: the whole catalogue as a ring of jars over a stamp-like emblem, each jar a link to its product route [verified, desktop-s25…s100.png; index.html 10 `data-jar-slider-item`] |

## 1. Concept and narrative
The home page is the pantry shelf, tipped on its side. Labelled jars ride a gently tilted curve across a cream ground, larger and sharper in the middle, smaller and blurred toward the edges, in front of a dark polygonal emblem whose circular motto turns as the row moves [verified, desktop-s25/s50/s75/s100.png]. There are no chapters: each frame shows a different set of jars, and the story lives on the product and production routes.

Register: warm, artisanal, Italian product names on the labels; the home page itself carries only a hidden h1, the motto and a short uppercase prompt to scroll [verified, index.html; desktop-s25.png].

## 2. Structure and components
- **Loader:** an orange full-screen field where fruit illustrations drop and pile under physics while a percentage counts up, then the cover wipes away [verified, mobile-s00.png, desktop-s00.png mid-wipe; 5uUeoJaR.js `SiteFruitLoaderIntro`, 22 `fruit-loader__fruit`].
- **Chrome:** IT/EN discs top left, the illustrated logo centred, a MENU pill with an orange diamond disc top right, a Privacy & Cookies link bottom left [verified, desktop-s25.png].
- **Menu:** a fullscreen overlay with rolling-character links (Home, Pantry, Production, Experience, About, Contacts, Shop) and a keydown handler [verified, index.html `fp-nav__roll-char`; 5uUeoJaR.js].
- **Jar carousel:** ten jars (a list of products repeated up to eight minimum), each an `<a>` to `/dispensa/<slug>` with alt text; hover on a fine pointer shows a "Discover the product" badge and spins the label once [verified, index.html; C2lrDrZj.js; desktop-s50.png].
- **Emblem:** a polygon shape image and a rotating circular-text SVG behind the row [verified, C2lrDrZj.js `back-slider-home.svg`, `circle-text-en.svg`].
- **Route exit:** clicking a jar hides it and flies a clone into the product route [verified, C2lrDrZj.js `is-flying-out`; inline CSS `--page-jar-exit-duration .42s`].
- **Skip link** to `#site-main` [verified, index.html]. Footer, 404 and product routes [unknown, not captured].

## 3. Visual language
- **Tokens:**
  `#fdf3eb` [verified, inline CSS `--color-white`; meta theme-color] — the cream ground
  `#762530` [verified, inline CSS `--color-border`] — oxblood ink, outlines and (by eye) the emblem fill
  `#e94e1b` [verified, inline CSS `--color-orange`] — the accent: active language, menu disc, motto, loader field
  `#f39200` [verified, inline CSS `--color-yellow`] — not seen on the home captures
  `#f4e9dd` [verified, inline CSS, one use]
- **Type:** a sharp high-contrast serif for display and the spaced uppercase prompt (letter-spacing .1em); a sans at 400/600 for the pills [verified, inline CSS; desktop-s25.png]. Display sizes run on `clamp()` with an open upper bound, e.g. `--text-display: clamp(4rem, calc(2.9rem + 11vw), 999999px)` [verified, inline CSS].
- **Imagery:** product photography of the real jars, labels in flat cut-paper illustration; the jars are the only saturated colour beyond the orange [verified, desktop captures].
- **Layout:** a 12-column grid tokenised per breakpoint (`--grid-col-d/t/m`), gutters `clamp(12px, 1.45vw, 30px)`, a carousel row rotated 10° [verified, inline CSS `--jar-marquee-angle: 10deg`].

## 4. Motion and effects (with parameters)
- **Smooth scroll:** Lenis `duration 1.2`, ease `min(1, 1.001 − 2^(−10t))`, `smoothWheel`, `syncTouch` with `syncTouchLerp .085`, `autoRaf: true` (its own rAF, not the GSAP ticker); not created under `prefers-reduced-motion` [verified, 5uUeoJaR.js].
- **Eases:** CustomEase `textveil .165,1,.32,1`, `Pagtrans` and `pagein .645,.045,.355,1`, `linedraw .65,.05,.36,1`, `headermark .22,1,.36,1`; CSS mirrors `--ease-don-expo .19,1,.22,1`, `--ease-out-expo .16,1,.3,1`, `--ease-soft .22,1,.36,1` [verified, 5uUeoJaR.js; inline CSS].
- **Text reveal:** an in-house splitter with masked units: lines .55 s, stagger .08, distance 112 %; chars .95 s, stagger .02, distance 108 % [verified, 5uUeoJaR.js `qC`]. Route transition 1.8 s, page cover .9 s, all zeroed under reduced motion [verified, inline CSS].
- **Carousel drive:** wheel delta × 1.15 (dominant axis), drag × 1.5 after a 6 px threshold with pointer capture, release velocity smoothed .72/.28, clamped ± 3.5 and thrown × 190; the row follows its target at an exponential rate of 2.3/s (11/s while dragging), dt capped at 1/30 s [verified, C2lrDrZj.js constants].
- **Depth from position:** x is warped by `q + .55 · .16 · tanh((q − .5)/.16)`; scale .55 → 1.35 by `sin(πq)`, brightness .7 → 1.1, CSS blur up to 4 px (2 px on phones) by distance from centre, plus up to 3.2 px (1.6 px) of speed blur; each jar wobbles `sin(...) · 18°` [verified, C2lrDrZj.js]. The emblem's motto turns −.012°/px of travel (−.03° on phones) [verified].
- **Pointer field:** per jar, five damped springs (turn, lean, lift, pullX, pullY): `v += ((target − x)·k − v·9)·dt`, stiffness 70 varied ± 15 % by a golden-ratio hash; a Gaussian falloff of radius 1.6 jar widths gives up to 30° turn, 5° lean, .05 lift, 16 px pull; speed alone turns jars up to 38° at 2400 px/s [verified, C2lrDrZj.js]. Only on `(hover: hover) and (pointer: fine)` and without reduced motion [verified].
- **Intro:** shape, badge and each jar fade and rise over 1150 ms on a cubic-out, jars from 56 px [verified, C2lrDrZj.js `qe`, `Se`].
- **Loader physics:** matter-js, gravity 3.35, bodies built from each fruit SVG's path hull sampled every 16 px, restitution .03, friction .82, air friction .03, sleeping on, a static dome under the mark; the counter runs 1700 ms cubic-out, close after 1800 ms; under reduced motion the fruits are placed on a static ring [verified, 5uUeoJaR.js].

## 5. Tech and pipeline
- Entry chunk 569,192 B of text (Vue, GSAP, Lenis, matter-js); the carousel chunk 19,760 B; Three.js 456,306 B imported only after a 1 s label delay [verified, fetched sizes; C2lrDrZj.js `labelDelayMs`]. Gzip sizes [unknown].
- Per jar: a base photo (`srcset`, 1080 cap, `sizes` 150/300 px) and a separate label image; one label read at 80,942 B (JPEG to curl) and one jar at 859,269 B (PNG to curl; Prismic `auto=format` serves WebP to browsers) [verified, `curl -sI`; inferred for the browser format].
- Manifest: 359 DOM nodes, no console errors, CLS .0006 desktop, failed requests are analytics beacons only [verified, capture-out.json].

### Tech lens: 3D
- **No model files.** The jar body is a photograph; only the label is 3D: a `LatheGeometry` of 17 points (16 height segments) × 128 radial segments, a straight cylinder of radius `.885 · (630/1013)/2` and height .6 (`CYL_TOP .27`, `CYL_BOT .87`), tipped 3° on x to match the photo's perspective [verified, C2lrDrZj.js `Br`]. No .glb, .gltf, Draco, KTX2 or HDR string anywhere [verified, all fetched chunks].
- **Label material:** `MeshStandardMaterial` roughness .72, metalness 0, front side, patched by `onBeforeCompile`: uniform `uGap .09` discards the seam band (`fract(u + uOffset) ≥ 1 − gap`), the rest is remapped to the full texture, and `uOffset` (front at 182°/360) rotates the label around the jar [verified, C2lrDrZj.js shader string]. Texture: sRGB, wrap S repeat, mipmaps, trilinear, max anisotropy [verified].
- **Lighting:** `AmbientLight` .89; one `SpotLight` at `.58 × 5`, distance 6, angle π/4, penumbra .7, decay 1.2, at (−1, .5, .6) aimed at the origin; no environment map, no shadows [verified, C2lrDrZj.js].
- **Camera:** `OrthographicCamera` framed to the jar's 630 × 1013 aspect, z 5; no controls, no scroll mapping; the scene never moves — the label offset is the only animated value [verified].
- **One renderer, many canvases:** a single `WebGLRenderer` (alpha, antialias) renders each jar's label in turn and `drawImage`s the result into that jar's 2D canvas, which sits over the photo [verified, C2lrDrZj.js `render` + `blit`]. A jar re-renders only when its offset changed and it is within one jar width of the viewport [verified].
- **Pixel budget:** canvases are 1.35 × the jar box; pixel ratio = `min(DPR capped at 3, √(12,000,000 / (w·1.35 · h·1.35 · count)))`, i.e. a 12 MP budget shared by all jars [verified, Dizcpx2j.js; C2lrDrZj.js].
- **The spin:** hover on a fine pointer, after 260 ms of dwell unless the pointer arrived after the last fast motion, plays one label revolution; the intro also turns each label one revolution as it fades in; spring turn is quantised to 1/2000 of a revolution to avoid needless re-renders [verified, C2lrDrZj.js `cr`, `ta`]. Spin duration [unknown, imported constant].
- **Loading and fallback:** labels preload with `fetchpriority` high for the first five; Three.js loads after 1 s; if the import fails, the photos stay and the labels simply never spin [verified, C2lrDrZj.js `catch{B()}`].
- **Disposal:** per-jar material and texture `dispose`, geometry dispose, `renderer.dispose()` and `forceContextLoss()`, all listeners removed on unmount [verified, C2lrDrZj.js `destroy`].
- No raycasting (hover is DOM `pointerenter`) and no physics in 3D [verified].

## 6. Weaknesses
- Reduced motion: **partial.** Lenis, pointer tilt and page transitions are off, the loader is static, but the jar intro and the carousel still run; `desktop-rm-s00` shows an empty cream page with only the chrome, while `desktop-rm-s50` shows the jars [verified, desktop-rm-s00.png, desktop-rm-s50.png].
- Keyboard: **fail on the carousel.** Jars are focusable links, but there is no key handler to move the row, so a focused jar can sit off-screen [verified, C2lrDrZj.js has no `keydown`; inferred behaviour]. Skip link and menu keys present [verified].
- DOM behind the canvas: **pass.** Photos with alt text and links are real markup; the canvas only paints labels [verified, index.html].
- Load gate: the loader runs about 1.7 s plus 1.8 s and its state lives in memory, so it likely replays on every full load [verified durations; inferred replay].
- Phone: **designed.** One large jar centred, the emblem pushed to the bottom, pills enlarged [verified, mobile-s50.png]. Drag is the touch path [verified].
- Wayfinding and conversion: no product names in DOM text on the home route beyond alt text, no count, and the Shop is inside the menu [verified, index.html; desktop captures].
- The awards skills: give the row arrow keys that scroll the focused item into the centre, show the active product's name in text, and let reduced motion render the row at rest from the first frame.

## 7. Principles
1. **Render only the part that has to move.** Keep the photograph for what is static and put the 3D work on the one surface that turns; the asset stays real and the GPU cost stays small.
2. **Share one renderer across many small canvases.** Render each item in turn and copy the frame out, under one pixel budget for the whole set, instead of one context per item.
3. **Let position carry depth.** Scale, brightness and blur keyed to distance from centre give a flat row a focal plane without a camera.
4. **Give every item its own spring.** Slightly different stiffness per item turns one gesture into a ripple instead of a block move.
5. **Make the loader a sample of the brand's world.** A physical pile of the brand's own illustrations says more than a bar, and can be laid out statically when motion is reduced.

## 8. Take / Don't take
- **Take:**
  - The photo-plus-label split: a lathe cylinder with a seam-discard UV remap over a real product photo.
  - The single-renderer blit loop with a shared √(budget / area) pixel ratio and render-on-change.
  - Per-item damped springs with hashed stiffness and a Gaussian pointer falloff.
  - A tanh position warp that crowds items toward centre, with scale and blur from the same value.
  - Lazy-loading the 3D library after the first paint, with the photos as the complete fallback.
- **Don't take:**
  - The palette as literal values:
    `#fdf3eb` [verified, inline CSS]
    `#762530` [verified, inline CSS]
    `#e94e1b` [verified, inline CSS]
    `#f39200` [verified, inline CSS]
    `#f4e9dd` [verified, inline CSS]
  - Jars on a tilted ring over a polygon emblem with a turning circular motto: the signature as-is.
  - The falling-fruit loader on an orange field, the illustrations, labels, photographs and motto.
  - A home route that captures the wheel with no keyboard path, and a reduced-motion first frame left empty: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack | high: index.html, typekit.css, 13 Nuxt chunks and the Three.js chunk read 2026-10-05 |
| Composition, phone, reduced motion | high: 15 captures |
| Motion and 3D parameters | high for constants read from C2lrDrZj.js and 5uUeoJaR.js; runtime behaviour reconstructed from minified code is [inferred] |
| Product, story routes, footer, 404 | unknown: not captured |

**Live pass 2026-10-05: reachable; capture exit 0.** The home route hijacks the wheel (`scrollMode: wheel`) and the capture's wheel input moved the carousel, so frames differ; no rerun. `desktop-s00` and `mobile-s00` caught the loader. Sources in `.awards/research/agrumeafarm/`: `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`, `capture-out.json`, `manifest.json`, `index.html`, `CmsHomePage.css`, `typekit.css`, `5uUeoJaR.js`, `C2lrDrZj.js`, `Dizcpx2j.js`, `DoMZv-wV.js` and the small Nuxt chunks; `curl -sI` on one label and one jar image. Award entry: `entry/desktop-s00/s50/s100.png` (capture exit 2, cookie wall over the first frame) and `entry/entry.html` from awwwards.com/sites/agrumea-farm.
