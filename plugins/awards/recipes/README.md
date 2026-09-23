# awards recipes

Verified, dependency-pinned implementations of the moves the corpus repeats. Vanilla Vite first; adapter notes for React / R3F, Vue / Nuxt, Svelte, Astro and Webflow injection live in each recipe's README and in `references/stacks/`. A recipe is a starting point to adapt (rename, re-token, re-time), never a block to paste unchanged.

## Contract
Each folder holds `index.html` (semantic, authored demo content), `main.js` (ESM; bare imports resolved by `package.json`), `style.css` (imports `_shared/base.css` first so the cascade survives bundling), `README.md` (what, why, parameters, accessibility, adapters), `recipe.json` (`id, title, tags, deps, tier, variants, seenIn, verified`) and `verify.mjs` (`states`, `probe`, `assert`) for `scripts/verify-recipes.mjs`. Every page implements `window.__awards = { ready, scrollTo, state }` through `_shared/awards-hook.js`, so the capture tool and the jury can drive it.

Shared modules: `_shared/raf.js` (one ticker, `damp()`), `reduced-motion.js` (three tiers), `quality-tiers.js` (device probe → DPR / pixel / particle budgets), `awards-hook.js`, `tokens.css`, `base.css`.

## Verify
```
cd plugins/awards/recipes && npm install
node ../scripts/verify-recipes.mjs            # every recipe: build, serve, headless Chromium with WebGL, desktop / mobile / reduced-motion states
node ../scripts/verify-recipes.mjs --only boot-lenis-gsap,marquee-raf-mask
```
Screenshots land in `_verify/<id>/<state>.png`; `recipe.json.verified` is stamped on a pass. SwiftShader proves correctness, not frame rate: run a real-device pass before shipping anything GL.

The six static visual examples declare their reviewed desktop/mobile image paths and notes in `recipe.json.visuals`. Select and open only relevant images through `references/patterns/visual-composition.md`. The catalogue now has 44 entries: 43 focused recipes and one complete composition.

## Catalogue by intent

| Intent | Recipe | Tier | Demonstrates | Seen in |
|---|---|---|---|---|
| Typography hierarchy | `typography-specimen` | P0 | Same copy in poster, editorial and technical registers; measure and mobile reflow | synthetic example; `recipe.json.visuals` |
| Responsive image hero | `responsive-art-directed-hero` | P0 | Separate wide/portrait composition, intact subject and action | synthetic example; `recipe.json.visuals` |
| Editorial story | `editorial-image-text` | P0 | Figure, caption, asymmetric reading column and mobile order | synthetic example; `recipe.json.visuals` |
| Product facts | `product-specification` | P0 | Semantic facts with units and native care disclosure | synthetic example; `recipe.json.visuals` |
| Designed close | `designed-footer` | P0 | Statement, contact action, navigation and colophon | synthetic example; `recipe.json.visuals` |
| Enquiry as prose | `sentence-form-enquiry` | P0 | One sentence the visitor completes: each prose fragment is the `<label>` of its blank (a `span` + `aria-labelledby` names the `radiogroup`), native `required` / `type="email"` validity with the page's own messages tied by `aria-describedby`, `aria-invalid` and focus on the first invalid in sentence order, submit prevented with a focused local confirmation, `field-sizing: content` blanks, fragment-over-field rows on the phone; rise / fade / none entrance tiers | the-boyd, alectear |
| Whole-page composition | `complete-editorial-composition` | P0 | The five components in one paced, coherent page | synthetic example; six frames in `recipe.json.visuals` |
| Boot the page | `boot-lenis-gsap` | P0 | Lenis on the GSAP ticker, `lagSmoothing(0)`, fonts before splits, reduced-motion tier, `__awards` hook | leo-parpeix, lando-norris, mont-fort |
| Scrubbed chapter | `scroll-pin-scrub` | P0 | Sticky stage in a tall section, linear scrub, quantised beats | son-daven, united-carriers, mont-fort |
| Hold and hinge | `sticky-stages-rails` | P0 | Sticky stages on invisible rails, hero hinge (x −10 %, −15°, child lags), no `pin` | the-line, shopify-editions-w26 |
| Text reveal | `split-text-masked-reveal` | P0 | `SplitText.create` lines with masks, `autoSplit` + `onSplit`, `y 120 % → 0`, expo-out | floema, leo-parpeix, the-line |
| Motion policy | `reduced-motion-switch` | P0 | Central full / reduced / static tiers, user override, teardown between tiers | (the skill's improvement) |
| Magnetic CTA | `magnetic-button` | P0 | `quickTo` pull with smoothstep falloff, label parallax, fine pointers only | leo-parpeix |
| Custom cursor | `cursor-two-speed` | P0 | Dot `.75` / ring `.22`, hover scale, contextual badges, off on coarse pointers | leo-parpeix, the-line, why-zero |
| Ticker | `marquee-raf-mask` | P0 | rAF wraparound, mask fade, pause on hover / focus, speed from scroll velocity, off-screen stop | seasats, mindmarket |
| Menu | `nav-overlay-fullscreen` | P0 | Clip-path wipe, numbered links, `inert`, focus trap, Escape, Lenis stop | son-daven, leo-parpeix, mont-fort |
| Loading | `preloader-counter-hold` | P0 | Real-signal counter, uneven jumps, hold at 100, exit by lines, sessionStorage skip | floema, leo-parpeix, the-line, son-daven |
| Colour as state | `theme-swap-tokens` | P0 | Tokens tweened on `<html>` per chapter, canvas clear colour in the same tween, `theme-color` | leo-parpeix, floema, slosh-seltzer |
| Routes | `page-transitions` | P0 | taxi wipe transition, renderer lifecycle in `gsap.context`, Lenis reset, one module | floema, lando-norris, mont-fort |
| Device budget | `quality-tiers` | P0 | One-time probe → DPR / pixel / particle budgets, still on low tier | why-zero, shopify-editions-w26, igloo |
| Images in GL | `gl-dom-tethered-planes` | P0 | Absolute canvas re-offset per frame, rect → plane mapping, velocity bulge, colour-space parity, DOM mirror | floema, oryzo, trevor-noah |
| Global wake | `gl-fluid-wake-post` | P0 | 128² ping-pong velocity field, splat, advect, dissipate, distortion + chroma composite | leo-parpeix, lando-norris |
| Flicker text | `flicker-text` | P1 | Per-letter opacity ladder `[0,1,0,0,1,1]` | the-line |
| Decode text | `scramble-decode-text` | P1 | Telemetry decode reveal | igloo, usavionix |
| Stacked cards | `sticky-stack-cards` | P1 | Sticky cards scaling the previous one | mindmarket |
| Timed feature set | `autoplay-tabs-progress` | P1 | Tabs that auto-advance on a linear `scaleX` 0 → 1 bar that is the timer, start once in view, hold on hover / keyboard focus / off-screen / pause button, restart on click; `role="tab"` with arrow keys, no autoplay under reduced motion | wearedirect, siteassist, 911rennsport, primesec |
| Read-as-you-scroll statement | `scroll-word-fill` | P1 | SplitText words on a sticky stage, one scrubbed timeline taking each word from a `.5` floor to full ink (`duration 1`, `stagger .5`, linear), done before the stage releases; unsplit and at full ink under reduced motion | goats, mensch, primesec |
| Turning hero word | `word-cycle-hero` | P1 | One slot in a fixed headline cycles a word list three ways: timed reel roll (`back.out` overshoot, 900 ms rest), typed and erased per character, or stepped by the first wheel inputs at `scrollY 0` before the page moves; width held by one grid cell so the line never reflows, `aria-hidden` slot with an `aria-live="off"` label, first word still under reduced motion | zainabkabira, mensch, christoph-nagel |
| Deck of panels | `section-switcher-wheel-commit` | P1 | The document never scrolls: GSAP Observer sums wheel delta magnitudes into a `role="progressbar"` ring that commits one step at 500, drains after 1 s idle, resets on reversal and locks 900 ms after a commit; swipe > 55 px, arrow / Page / Home / End keys and prev / next reach every panel, inactive panels `inert`, one live-region announcement per change, instant swap (wheel still live) under reduced motion, `__awards.scrollTo` routed to panels | nodeck, areebali, christoph-nagel |
| Visitor-held mode | `persistent-mode-switch` | P1 | Docked segmented switch + Grid overlay pill + `L` / `D` / `G` hotkeys (ignored in text fields and with Ctrl / Alt / Meta), state set as root attributes, stored in `localStorage`, printed in the label and restored by a head script before first paint; at the close the dock cross-scales out (`1.75`) as a large centred copy arrives (from `.5`), one copy reachable at a time; no tween under reduced motion | alectear, grids-obys, haoqi |
| Horizontal rail | `horizontal-rail` | P1 | Pinned horizontal section, arrows, native overflow on touch | son-daven |
| Archive list | `hover-preview-list` | P1 | Cursor-following preview, focus shows it too | leo-parpeix |
| Compare | `compare-hold-drag` | P1 | Hold / drag mask between two states, arrow keys | son-daven |
| Drawn path | `scroll-drawn-svg-path` | P1 | Dash-offset path on scroll | mindmarket |
| 2.5D | `gl-depth-map-parallax` | P1 | Image + depth map parallax | shopify-editions-w26 |
| Scene switch | `gl-rtt-composite-transition` | P1 | Two scenes to render targets, blended by a shader | slosh-seltzer |
| Spatial scroll | `gl-virtual-scroll-camera` | P1 | Wheel / touch → eased float → camera spline, snap, keyboard | igloo, why-zero |
| Hero object | `gl-hero-object-inertia` | P1 | One object with pointer inertia and scroll rotation | oryzo, lando-norris |
| Explorable model | `gl-orbit-model-hotspots` | P1 | Model in a native `<dialog>` on a spherical goal / current camera damped by `1 − k^dt` (drag `.0004`, fly `.02`), polar clamped to `0.85–1.3` rad and distance to `7–15`, zones as real `aria-pressed` buttons pinned to projected targets that fly the camera there, arrow / `+` / `−` / Home keys on the focused stage; instant fly-tos under reduced motion, poster plus the same list in the static tier | likova, gehry-getty |
| Post presets | `gl-postprocessing-presets` | P1 | Fixed bloom presets, grain, SMAA, half-float on mobile | lando-norris, igloo |
| Frame scrub | `image-sequence-scrub` | P1 | Pre-rendered frames scrubbed on scroll | seasats |
| Project index as reels | `filmstrip-index-rows` | P1 | CSS-keyframe rows at one px/s from measured width, one link per project, pause on hover / focus / off-screen, late-overshoot grow, hover clip gated on `(hover: hover)` | boc |
| Chosen-item exit | `transition-promote-chosen` | P1 | Clicked row rises to the header slot, siblings fade by `.09 s × distance`, route pushed after the rise, phone timing set | boc |
| Living line field | `svg-noise-line-field` | P1 | Hairline SVG field, one Perlin angle per point drifting in time, pointer push with a framerate-independent spring (.005 / .925), edge-first draw-in, still under reduced motion | wodniack |
| Title as a doorway | `title-mask-tunnel` | P1 | Capsule title mask scrubbed to a computed cover scale (exponential zoom, linear scrub), counter-scaled CSS-3D scene moved on one layer, focus flies a work to the front, plain list under reduced motion | wodniack |
| Name as a window | `knockout-wordmark-window` | P1 | SVG `<mask>` subtracting the wordmark's paths from a solid `--ground` rect that overflows the word's box and is clipped by the hero, over a fixed canvas-2D ground (four Lissajous blobs + light / shade folds at 1/6 resolution) on the shared ticker, stopped off-screen; `h1` with a hidden text twin, no media files, one still frame under reduced motion | bethebuzz, noth |
| Long-read dialog | `dialog-nested-lenis-sheet` | P2 | Native `<dialog>` + `showModal()`, nested Lenis on the shared ticker, `data-lenis-prevent` on dialog and inner pane, server-rendered content, drag-to-dismiss bottom sheet under 768 px, instant under reduced motion | boc |
| Throw toy | `throw-objects-css3d` | P2 | Draggable + InertiaPlugin throw of extruded CSS-3D blocks, `snap.points` on the clamped landing point into a perspective tray, velocity tilt on an inner body, a throw button per block, drop-in-place under reduced motion | wodniack |
| Drawn scrollbar | `scrollbar-thumb-drag` | P2 | Themed thumb mirroring `scrollY` on the shared ticker, drag and track-press write the scroll, native bar and keys kept, `aria-hidden` pointer duplicate, snaps under reduced motion, hidden on coarse pointers | wodniack |
| Easter-egg rain | `sprite-rain-canvas2d` | P2 | Button-triggered canvas-2D sprite shower from one pre-rendered bitmap, gravity `.45` / spin `±10°` per 60 fps frame scaled by `dt`, live count capped by the quality tier, sprites dropped off-screen and the ticker released, nothing spawns under reduced motion | wodniack |
| Sound | `sound-toggle-opt-in` | P2 | Opt-in ambient + SFX, persisted | igloo, mont-fort |
| GL text | `gl-msdf-text` | P2 | MSDF text with a DOM mirror | igloo, lando-norris |

Every row ships verified. Demo pages deliberately skip an Open Graph image (audit S06), which a real site must ship.
