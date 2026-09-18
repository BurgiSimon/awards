# Vite 8 + vanilla (the default stack)

<!-- Labels: [verified] = checked against Context7 docs or a cloned source, 2026-09 · [recalled] · [inferred] · [unverified]. Pinned versions: versions.md. -->

## When to choose it
The default for anything that is not content-heavy: one page or a handful of routes, an authored motion score, optionally one WebGL layer, no CMS. The engine-first winners ran exactly this: Vite + vanilla Three + GSAP with a virtual scroll at [site:why-zero]; Vite with Three, Draco and KTX2 workers at [site:igloo] (Svelte/Threlte, medium confidence); vanilla Three + GSAP with Lusion's absolute-canvas scroll sync at [site:oryzo]; vanilla JS + WebGL + GSAP at [site:lama-lama]; vanilla ES6 + OGL at [site:floema-jewelry] (Webpack era, same architecture); Vue 3 + Vite (medium) at [site:leo-parpeix]. Leave it for `next.md` / `nuxt.md` when a CMS drives dozens of templated pages, for `astro.md` when the site is mostly documents with islands, for `webflow-export.md` when the client edits in Webflow. The architecture is the constant: HTML lays out, WebGL renders, one canvas, scroll → uniforms, Lenis + GSAP on one ticker [pattern:webgl-architecture].

## Scaffold
```sh
npm create vite@latest my-site -- --template vanilla        # [verified] create-vite; `vanilla-ts` also exists
cd my-site && npm i gsap@3.15.0 lenis@1.3.26 && npm i -D vite@8.3.0
npm i three@0.186.0 postprocessing@6.39.5                   # only with a WebGL layer
```
`awards:stack` writes the same layout with `scripts/new-project.mjs --stack vite [--webgl]`. Layout: one `index.html` per route (MPA), `src/main.js` (boot), `src/motion/` (the score), `src/webgl/` (own chunk), `src/styles/{tokens,fonts,base}.css`, `public/fonts/*.woff2`, `public/decoders/{draco,basis}/`.

```js
// vite.config.js — Vite 8 is Rolldown-based; `build.rollupOptions` is a deprecated alias [verified]
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
export default defineConfig({
  input: { main: resolve(import.meta.dirname, 'index.html'), about: resolve(import.meta.dirname, 'about/index.html') }, // MPA entries [verified]
  build: { rolldownOptions: { output: { codeSplitting: { groups: [{ name: 'three', test: /node_modules[\\/]three/ }] } } } }, // replaces manualChunks [verified]
});
```

## Boot architecture
One clock: GSAP's ticker drives Lenis, ScrollTrigger reads Lenis, every loop rides the same ticker [verified: Lenis README].
```js
// src/main.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { awards } from './lib/awards-hook.js';            // copies of recipes/_shared/*.js
import { motionTier } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';

gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis();                                // lerp .1, smoothWheel, respectReducedMotion are on by default
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));             // ticker gives seconds, Lenis wants ms
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;                                     // capture.mjs drives scroll through it

const tier = motionTier();                                // 'full' | 'reduced' | 'static' — the one switch every module reads
const profile = await detectQualityTier();                // sets html[data-quality="high|mid|low"]
const gl = tier === 'full' && profile.tier !== 'low'
  ? import('./webgl/index.js').then((m) => m.boot({ lenis, profile }))
  : null;
await Promise.all([document.fonts.ready, gl]);
ScrollTrigger.refresh();                                  // after fonts and decoded assets [verified]
awards.addState(() => ({ tier, quality: profile.tier }));
awards.ready();
```
`window.__awards = { ready, scrollTo(progress), state() }` is the capture contract from `recipes/_shared/awards-hook.js`: `scripts/capture.mjs` awaits `ready`, calls `scrollTo(0 | .5 | 1)` (which routes through `window.lenis.scrollTo(y, { immediate: true, force: true })`) and records `state()` [recipe:boot-lenis-gsap]. Reduced motion is decided once in `motionTier()` and mirrored by `gsap.matchMedia` conditions inside the score [recipe:reduced-motion-switch]; tiers come from `detectQualityTier()` [recipe:quality-tiers]. Top-level `await` works because Vite emits `<script type="module">`.

## WebGL in its own chunk
`import('./webgl/index.js')` becomes its own chunk by construction: Vite wraps every dynamic `import()` in a preload helper and emits the module separately [verified]; the `three` group above keeps the vendor code out of `main`. One canvas for the whole site, created by `boot()`, sized with `renderer.setPixelRatio(profile.dpr)` and `renderer.setSize(w, h, false)` (`three-0.186.md`). `boot()` returns `{ dispose }`; call it before a route swap and on `pagehide`: dispose geometries, materials, textures and render targets, then `renderer.dispose()`. DOM placeholders stay in the HTML (`<img>` with `alt`) and the canvas is `aria-hidden="true"` [pattern:accessibility-and-reduced-motion].

## Page transitions
Two honest routes; never both. MPA (this default): each route is an `index.html`, the browser navigates, and cross-document View Transitions are a progressive enhancement (Chromium 126+, Safari 18.2+ [recalled]):
```css
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none !important; } }
```
SPA when a shared-element or overlay transition is the money moment: `@unseenco/taxi` 1.9.1 with `data-taxi` / `data-taxi-view` wrappers, a `Renderer` per page whose `onEnter` opens a `gsap.context` and whose `onLeave` reverts it, and a `Transition` whose `onEnter` does `lenis.scrollTo(0, { immediate: true })` then `ScrollTrigger.refresh()` before `done()` [verified: taxi docs] [recipe:page-transitions].

## Fonts
Self-host: `public/fonts/*.woff2`, `@font-face` with `font-display: swap` (or `optional` for a display face when a late swap is worse than the fallback), a metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`) so lines do not reflow when SplitText re-splits, and `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the two files above the fold. No Google Fonts CDN, no foundry `@import`: every readable production bundle in the corpus self-hosted ([site:lando-norris], [site:mont-fort]). Gate line splits on `document.fonts.ready`.

## Resize strategy
Decide before building: vw-locked layouts scale, breakpoint layouts swap [pattern:responsive-strategy]. Width changes → `ScrollTrigger.refresh()` (it listens to `resize` already); height-only changes on touch are the address bar, so `ScrollTrigger.config({ ignoreMobileResize: true })` [verified]. Scrubbed tweens with function-based values take `invalidateOnRefresh: true` [verified]. Breakpoint-specific choreography lives in `gsap.matchMedia()` blocks, which revert themselves when the query flips [verified]. Lenis measures itself with ResizeObserver; call `lenis.resize()` after async content that does not change the wrapper's size [verified]. Never `location.reload()` at a breakpoint ([site:lando-norris] does, at 992 px, and it shows).

## Deploy notes
`vite build` → `dist/` with hashed assets: any static host (Cloudflare Pages, Netlify, Vercel static). Headers: `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`, a short max-age for HTML, correct `Content-Type` for `.ktx2`, `.drc` and `.wasm` under `/decoders/`. Budgets from the corpus: entry ≈ 20 KB gzipped, a scene ≈ 500 KB gzipped, textures ≤ 700 KB per scene [site:igloo] [pattern:asset-pipeline].

## Pitfalls
- Two smooth-scroll libraries (Lenis + ScrollSmoother, Lenis + Locomotive, Lenis + `ScrollTrigger.normalizeScroll(true)`): keep Lenis, drop the rest.
- `html { scroll-behavior: smooth }` fights `lenis.scrollTo`; import `lenis/dist/lenis.css` and leave the property alone.
- A `position: fixed` canvas whose planes drift against DOM placeholders: re-offset an absolute canvas every frame or feed scroll as a uniform [site:oryzo] [recipe:gl-dom-tethered-planes].
- Framer Motion / `motion` for scroll scrub: in no winner; scrubbed timelines are ScrollTrigger with `ease: 'none'`.
- Splitting text before fonts resolve: lines split on fallback metrics; `autoSplit: true` plus the `document.fonts.ready` gate covers both.
- Reloading at a breakpoint, or building two scores and toggling them with `display: none` (both stay alive): use `gsap.matchMedia`.
- Pinning where sticky works: [site:the-line] ships sticky stages with invisible rails and no `pin: true`; pin promotes layers and costs refreshes.
