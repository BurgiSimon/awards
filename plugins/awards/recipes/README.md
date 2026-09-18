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

## Catalogue by intent

| Intent | Recipe | Tier | Demonstrates | Seen in |
|---|---|---|---|---|
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
| Horizontal rail | `horizontal-rail` | P1 | Pinned horizontal section, arrows, native overflow on touch | son-daven |
| Archive list | `hover-preview-list` | P1 | Cursor-following preview, focus shows it too | leo-parpeix |
| Compare | `compare-hold-drag` | P1 | Hold / drag mask between two states, arrow keys | son-daven |
| Drawn path | `scroll-drawn-svg-path` | P1 | Dash-offset path on scroll | mindmarket |
| 2.5D | `gl-depth-map-parallax` | P1 | Image + depth map parallax | shopify-editions-w26 |
| Scene switch | `gl-rtt-composite-transition` | P1 | Two scenes to render targets, blended by a shader | slosh-seltzer |
| Spatial scroll | `gl-virtual-scroll-camera` | P1 | Wheel / touch → eased float → camera spline, snap, keyboard | igloo, why-zero |
| Hero object | `gl-hero-object-inertia` | P1 | One object with pointer inertia and scroll rotation | oryzo, lando-norris |
| Post presets | `gl-postprocessing-presets` | P1 | Fixed bloom presets, grain, SMAA, half-float on mobile | lando-norris, igloo |
| Frame scrub | `image-sequence-scrub` | P1 | Pre-rendered frames scrubbed on scroll | seasats |
| Sound | `sound-toggle-opt-in` | P2 | Opt-in ambient + SFX, persisted | igloo, mont-fort |
| GL text | `gl-msdf-text` | P2 | MSDF text with a DOM mirror | igloo, lando-norris |

Every P0 and P1 recipe ships verified; `gl-msdf-text` is planned for 0.2 and has no folder yet. Demo pages deliberately skip an Open Graph image (audit S06), which a real site must ship.
