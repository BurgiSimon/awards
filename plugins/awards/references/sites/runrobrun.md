# Run Rob Run (Robert Aperios) — https://www.runrobrun.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio — a freelance creative developer's one-page site [verified, index.html `<title>` + meta description] |
| Visitor mode | persuade (experience-led): a mailto "Let's create" sits in the header and the footer, and the email field is in the footer [verified, index.html; desktop-s100.png] |
| Awards | Awwwards **Honorable Mention, 21 Aug 2026**. The entry lists no jury axis scores, only community votes (15/17) [verified, entry page `entry/entry.html`]. A CSS Design Awards listing exists [verified, web search result title only]; its scores [unknown] |
| Corpus rating | D 7.2 / U 6.3 / C 6.9 / Co 6.2 → weighted 6.77, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Robert Aperios, entry profile `r-aperios` [verified, entry page; index.html topbar]. A Codrops article on the goo scene, 20 Aug 2026 [verified, web search result title; article not read] |
| Stack (evidence level) | **Next.js 16.2.10, App Router, Turbopack** [verified, 1nm-po-yw_ii_.js `version:"16.2.10"`, `turbopack-*.js`] · **GSAP 3.15.0 + ScrollTrigger** [verified, 1tg1lcs-yq9vy.js] · **Lenis 1.3.25**, lazy chunk [verified, lenis-chunk.js `"1.3.25"`; 0_v9-tbxy4h9g.js] · **Three.js WebGPU build**, vendored under `/morph-pen/vendor/`, WebGL fallback module with `HDRLoader`, revision [unknown] [verified, morph-react-scene.js, morph-webgl-fallback.js] · **lottie-web 5.13.0** for the running-man loader [verified, 1tg1lcs-yq9vy.js `lottie.version="5.13.0"`; index.html preload `runman01.json`] · Web Audio `AnalyserNode` [verified, 1tg1lcs-yq9vy.js] · Vercel [verified, `getent hosts` → `vercel-dns-016.com`; `data-dpl-id`] · GA4 [verified, index.html gtag] · fonts via `next/font` locals, see Type |
| Palette | orange ground `--orange` |
| | `#ff641c` [verified, 0tgoiyecp9_k6.css `:root`] |
| | warm grey ground, doubling as "white" `--scene-base` |
| | `#dbdbda` [verified, 0tgoiyecp9_k6.css `:root`] |
| | near-black ink, used in rgba steps |
| | `#050505` [verified, 0tgoiyecp9_k6.css] |
| | a second dark token `--black` |
| | `#202020` [verified, 0tgoiyecp9_k6.css `:root`] |
| | Strategy: **one hot accent that floods whole sections**, alternating with the warm-grey ground; near-black ink on both; colour otherwise from the work mock-ups [verified, desktop-s25/s50/s75/s100.png] |
| Type | **extended display caps + grotesque subheads + mono body**. `next/font` locals named `monumentHeading`, `neueHeading`, `neueralBody`, `neueralMono` [verified, 0tgoiyecp9_k6.css `@font-face`]; the retail faces behind those names [unknown]. Body and labels run in the mono, uppercase [verified, `--font-sans` → neueral mono; desktop-s25.png] |
| WebGL dosage | moments — one hero canvas (WebGPU when `navigator.gpu` exists, else WebGL), music-reactive and scroll-morphed; the rest is DOM, CSS and a canvas-2D grain [verified, 1tg1lcs-yq9vy.js loader; morph-react-scene.js; manifest.json `canvases: 2`] |
| Scroll model | native + Lenis (lerp .1, own rAF loop, not created under reduced motion); GSAP ScrollTrigger scrubs on top; manifest `scrollMode: native` [verified, 0_v9-tbxy4h9g.js; manifest.json] |
| Narrative model | gallery — morph hero → two-column statement → portrait pixel reveal + five numbered skills → tools video rail → work cycle → quote → footer with wordmark [verified, index.html section order; desktop-s25…s100.png] |

## 1. Concept and narrative
**One idea:** the maker as a runner and a DJ. The name is a pun, a pixel running man recurs from the loader to the footer, and the hero object answers music from a small in-page player [verified, index.html; mobile-s00.png; desktop-s100.png]. The entry describes the goo turning from an organic blob into a cube as the page scrolls [verified, entry page]. The page's other thread is the pixel grid: loader, menu, section wipes and image reveals are all built from square cells [verified, index.html class names].

Beats: a two-word CREATIVE / DEVELOPER hero around the goo canvas with a player and a short bio (from source; the frame was never captured, §9) [verified, index.html]. Next, two statement headlines, then a greyscale record-shop portrait assembled cell by cell over a pale orange shape [verified, mobile-s25.png]. Five numbered skills follow on an orange ground [verified, desktop-s25.png], then a TOOLS stage: a mono caption, a looping clip beside a pixel figure, a stacked title ticker and a large three-digit counter [verified, desktop-s50.png]. WORK comes on the grey ground as a three-column cell of number, mock-up and label/description [verified, desktop-s75.png]. The close is an orange framed footer and a full-width `/APERIOS` wordmark with the pixel runner [verified, desktop-s100.png]. Register: confident and generic in the skills copy, playful in the footer, with a one-line quotation as an interruption [verified, index.html].

## 2. Structure and components
- **Preloader**: a 10 × 8 grid of near-black cells (cell size 112 / 100 / 88 / 72 px by viewport) with the Lottie runner and a LOADING label; progress runs on a fixed 1.4 s rAF timer and hides 120 ms after [verified, 1tg1lcs-yq9vy.js `lU={cols:10,rows:8}`, `lJ=1400`; mobile-s00.png]. No storage key, so it plays on every visit [verified, zero `sessionStorage`/`localStorage` in the chunk].
- **Header**: name at left, About / Tools / Work anchors and the mailto CTA [verified, index.html]. Below 1000 px a button (`aria-expanded`, `aria-controls`) opens an overlay whose ground is a six-column cell grid that fills in and out on opposite stagger orders [verified, index.html `topbar-menu-cell` delays; 0tgoiyecp9_k6.css].
- **Corner crosshairs**: six fixed registration marks at corners and mid-edges, over every frame [verified, index.html `site-corner-crosses`; all captures].
- **Music player**: play toggle, scrub track, "Press Play" label, three-track playlist, a native `<audio preload="metadata">`; hidden at ≤ 1000 px [verified, index.html; 0tgoiyecp9_k6.css].
- **Word-duplicated headings**: each statement word is set twice (hidden + visible) under an `aria-label` on the `h2` [verified, index.html].
- **Pixel-cell portraits**: three figures, each a grid of `<span>` cells holding the same greyscale image, revealed cell by cell [verified, index.html `page-entry-gallery-pixel-cell`; 0tgoiyecp9_k6.css `filter:grayscale()`].
- **Numbered skill rows**: `[01]`…`[05]`, title in the grotesque, mono caption at right, hairlines between [verified, desktop-s25.png].
- **Tools rail**: four MP4 studies with a small and a large counter and a stacked title list; arrow buttons on the phone [verified, index.html `tools-strip`; mobile-s50.png].
- **Work**: a cycling feature cell with a "View project" link, plus a list version of four Webflow builds shown as device mock-ups [verified, index.html `projects-cycle-figure`, `projects-list-figure`; desktop-s75.png, mobile-s75.png].
- **Footer**: three framed columns (lead line, links + language switch EN / DA / PT, contact + email field) with square corner nodes, then the SVG wordmark stretched by `textLength="1200"` [verified, index.html; desktop-s100.png].
- **Section wipes**: a full-screen grid of orange cells that fades in and out on per-cell delays [verified, index.html `section-scroll-transition-cell`; 0tgoiyecp9_k6.css].

## 3. Visual language
- Two grounds only, swapped by section: orange for skills, tools and the close, warm grey for about and work [verified, desktop-s25…s100.png]. Ink is near-black at stepped alphas (`…0d`, `…2e`, `…94`, `…cc`) rather than extra greys [verified, 0tgoiyecp9_k6.css].
- **Type**: hero caps at `clamp(3rem, 9.6vw, 120px)`, weight 900, tracking `-.06em`, line-height `.66` [verified, 0tgoiyecp9_k6.css `.hero-title`]. Section titles (TOOLS, WORK) in the same extended caps, centred; subheads in the grotesque at sentence case; everything else in uppercase mono [verified, desktop-s25/s50/s75.png].
- **Texture**: a fixed canvas grain at opacity .05, `multiply`, over everything [verified, 0tgoiyecp9_k6.css `.site-noise-layer`; visible in every capture].
- **Pixel as the second material**: black stepped blocks beside the tools clip and the runner in the footer echo the cell grids [verified, desktop-s50.png, desktop-s100.png].
- Layout: 1440 px container, 24 px gutter, a 12-column row/col system with hairline rules [verified, 0tgoiyecp9_k6.css `--container`, `--gutter`; index.html `col-md-*`].
- Imagery: greyscale portraits; work shown as photographed device mock-ups served from a folder named `mock-work-images` [verified, index.html].
- Browser surfaces: favicon set including an animated GIF; no `theme-color`, no Open Graph tags [verified, index.html].

## 4. Motion and effects (with parameters)
- **Smooth scroll**: Lenis `{ lerp: .1, smoothWheel: true, smoothTouch: false }` on its own `requestAnimationFrame`, exposed as `window.__siteLenis`; the effect returns early under `prefers-reduced-motion: reduce`, so no Lenis is created there [verified, 0_v9-tbxy4h9g.js]. Anchor links jump with `immediate: true` [verified, 1tg1lcs-yq9vy.js].
- **Scroll typography**: `yPercent: "+=100"` on `expo.inOut`, ScrollTrigger from `bottom 90%` to `top 25%`, `scrub: .4`; a separate `scrub: true` trigger over `top bottom → bottom top` drives a progress value [verified, 1tg1lcs-yq9vy.js].
- **Menu**: link rows `autoAlpha 1, y 0` over .26 s `power3.out`, stagger .045; rules `scaleX 1` over .28 s `power2.out` [verified, 1tg1lcs-yq9vy.js]. Menu cells fade over .34 s `cubic-bezier(.16,1,.3,1)`, open delays ≈ 0–.58 s, close delays mirrored [verified, 0tgoiyecp9_k6.css; index.html].
- **Cell timing**: section-wipe cells switch in 20 ms linear with delays ≈ .05–.37 s radiating from one side; portrait cells fade in .16 s linear [verified, 0tgoiyecp9_k6.css; index.html delays].
- **Easing tokens**: `(.16,1,.3,1)`, `(.165,.84,.44,1)`, `(.22,1,.36,1)` [verified, 0tgoiyecp9_k6.css].
- **Goo hero (the signature)**: pointer eased by `1 − 0.001^dt`, drag rotation by `1 − 0.0001^dt` — framerate-independent [verified, morph-react-scene.js]. Scroll progress feeds a morph state; modules include blob geometry, a deformer, cube split, hover dust and hover grid, and a scroll-pause state [verified, morph-react-scene.js imports].
- **Music reactivity**: `createMediaElementSource` → `AnalyserNode` with `fftSize 256`, `smoothingTimeConstant .52`. Bins 1–10 / 10–32 / 32–64 become low / mid / high, followed at .42 / .24 / .16. Onset pulses: low ×7.5 above .018, mid ×5.4 above .035, decaying ×.82 / ×.72 per frame. The state goes to the scene as a window `CustomEvent` [verified, 1tg1lcs-yq9vy.js; music-reactive-input.js]. Inside the scene, impact rises at .34 and settles at .075 [verified, morph-react-scene.js].
- **Grain**: canvas-2D frames of random pixels (14 % black), cycled every 83.3 ms (12 fps), rebuilt 160 ms after a resize; a static SVG-noise class exists as the other path [verified, 0_v9-tbxy4h9g.js; 0tgoiyecp9_k6.css].
- **Cursor**: a follower eased at .28 per frame, not created on coarse pointers [verified, 1tg1lcs-yq9vy.js `(pointer: coarse)`].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js 16.2.10, App Router, Turbopack, Vercel | [verified, 1nm-po-yw_ii_.js, index.html] |
| Scroll | Lenis 1.3.25, lazy chunk, own rAF | [verified, lenis-chunk.js, 0_v9-tbxy4h9g.js] |
| Animation | GSAP 3.15.0 + ScrollTrigger; CSS transitions for every cell grid | [verified, 1tg1lcs-yq9vy.js, 0tgoiyecp9_k6.css] |
| 3D | Three.js WebGPU build as native ES modules from `/public`, WebGL fallback + HDR environment | [verified, morph-react-scene.js, morph-webgl-fallback.js] |
| Vector animation | lottie-web 5.13.0 | [verified, 1tg1lcs-yq9vy.js] |
| Audio | `<audio>` + Web Audio analyser | [verified, index.html, 1tg1lcs-yq9vy.js] |

- The initial document links ≈ 1.03 MB of module JS uncompressed (plus a 113 KB `noModule` polyfill) and 55 KB of CSS; the scene modules load on demand outside the bundle [verified, fetched file sizes]. Desktop DOM is 2,762 nodes, swollen by 285 duplicated `<img alt="">` in the pixel cells [verified, manifest.json; index.html].
- No console errors; failed requests are aborted MP4/MP3 ranges and analytics [verified, manifest.json]. The headless run measured CLS .91 desktop and .43 phone [verified, manifest.json]; a real-browser figure is [unknown]. `lcpColdSynthetic` is a headless artefact, not quoted.

## 6. Weaknesses
- Reduced motion: **partial**. Lenis is skipped, and the reduced-motion frames read at rest [verified, 0_v9-tbxy4h9g.js; desktop-rm-s25/s50.png]. The CSS has no `prefers-reduced-motion` query, so cell wipes, grain and the scene keep running [verified, 0tgoiyecp9_k6.css; rm frames match the full-motion ones].
- Keyboard: **partial**. Real anchors and buttons, 11 `:focus-visible` rules; no skip link; the music toggle has a name but no `aria-pressed` [verified, index.html, CSS counts]. No key handlers in the app chunk [verified, 1tg1lcs-yq9vy.js].
- DOM behind the canvas: **pass**. The goo is `aria-hidden` decoration over SSR text; the work images carry descriptive alt [verified, index.html]. There are two `h1`s ("Creative", "Developer") [verified, index.html].
- Load gate: **fail**. It is a fixed 1.4 s timer rather than a load signal, and it replays on every visit [verified, 1tg1lcs-yq9vy.js]. The desktop first frame could not be screenshotted in two runs (§9).
- Phone: **designed but loses the signature**. The layout is single-column with a cell-grid menu and rail arrows [verified, mobile-s25/s50/s100.png], but the player is hidden ≤ 1000 px, so the music-reactive hero has no input there [verified, 0tgoiyecp9_k6.css].
- Wayfinding and conversion: **mixed**. There is no current-section marker. The mailto sits in the header, but the footer's Facebook link goes to the bare facebook.com [verified, index.html]. On desktop-s75 the work number, image and label disagree mid-cycle [verified, desktop-s75.png].

What the awards skills do differently: a load signal and a remembered skip instead of a timer, a reduced tier that parks the cell wipes and the grain [recipe:reduced-motion-switch], an `aria-pressed` sound control [pattern:sound#the-control], and a phone path that keeps the signature (a tap-to-play that still drives the object).

## 7. Principles
1. **Let one unit build every transition.** When the loader, menu, section wipe and image reveal are all the same square cell on different delays, the motion vocabulary reads as a system rather than a list of effects.
2. **Give sound a visible job.** Audio that deforms the hero object makes the play button an interaction with a payoff, not a mood toggle; split it into a few bands with onset pulses and a slow settle.
3. **Ease a live signal differently up and down.** A fast attack and a slow release turn noisy input (audio, pointer) into motion that reads as physical.
4. **Two grounds and stepped-alpha ink.** One hot ground swapped with one neutral, and a single ink at a few alphas, give the page rhythm without a grey ramp.
5. **Feature-detect the renderer, keep one scene contract.** A preferred GPU path and a fallback module behind the same init signature let the hero survive on any device.

## 8. Take / Don't take
- **Take:**
  - Cell grids as CSS custom-property delays computed once in markup, with open and close orders mirrored, so the transition needs no JS per frame.
  - The analyser shape: `fftSize 256`, three bin bands, per-band follow rates, thresholded onset pulses with a multiplicative decay, published as one event the scene reads.
  - `1 − k^dt` damping for pointer and drag (`k` = .001 / .0001) [pattern:motion-vocabulary#damping-math].
  - Lenis created only when reduced motion is off, with anchor jumps using `immediate` [recipe:boot-lenis-gsap].
  - A grain canvas of pre-built random frames stepped at 12 fps, rebuilt on a debounced resize.
- **Don't take:**
  - The orange / grey / near-black set as literal values:
    `#ff641c` [verified, 0tgoiyecp9_k6.css]
    `#dbdbda` [verified, 0tgoiyecp9_k6.css]
    `#050505` [verified, 0tgoiyecp9_k6.css]
    `#202020` [verified, 0tgoiyecp9_k6.css]
  - The music-reactive goo that morphs into a cube, the pixel running man, the name pun, the CREATIVE / DEVELOPER hero or the `/NAME` stretched wordmark as-is.
  - The section order hero → statements → pixel portraits → skills → tools rail → work → quote → footer, the corner crosshairs, and the three-track playlist.
  - The fixed-timer preloader, 285 duplicated images per reveal, the hidden player on phones and the missing reduced-motion CSS: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, CSS, app chunks, Lenis chunk, scene modules; face retail names unknown |
| Award | high — entry page read; no jury scores exist to read |
| Concept, structure, visual language | high for s25–s100 on all profiles; hero composition from source only |
| Motion parameters | high — read from CSS and JS; the goo's shader and morph curves not read |
| Weaknesses | high for code-level findings; CLS from a headless run only |

**Live pass 2026-09-23: reachable, capture exit 2, `scrollMode: native`.** The desktop and desktop-rm `s00` screenshots timed out while the hero scene ran. One retry with `--wait 6000 --timeout 90000` also timed out, so the desktop first viewport was never seen; mobile-s00 shows the loader. Sources in `.awards/research/runrobrun/`: 13 captures + `manifest.json`, `index.html`, `0tgoiyecp9_k6.css`, app chunks (`1tg1lcs-yq9vy.js`, `0_v9-tbxy4h9g.js`, `1nm-po-yw_ii_.js` and siblings), `lenis-chunk.js`, `morph-react-scene.js`, `morph-webgl-fallback.js`, `music-reactive-input.js`. Award entry `awwwards.com/sites/run-rob-run`, found with one web search, captured desktop-only into `entry/` (exit 2) and its HTML read. Not observed: the hero on screen, the menu open, audio playback, the Codrops article, the CSSDA scores, any 404.
