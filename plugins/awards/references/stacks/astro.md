# Astro 7 (islands + View Transitions)

<!-- Labels: [verified] = checked against Context7 docs, 2026-09 · [recalled] · [inferred] · [unverified]. Pinned versions: versions.md. -->

## When to choose it
The "no-SPA cinematic" stack: static HTML for every route, one WebGL island, native page transitions. [site:mont-fort] shipped Astro 5.2.6 static with View Transitions, one Three island (KTX2, EXR HDRI, baked lightmap), GSAP ScrollTrigger and Lenis, WebGL and ScrollTrigger in their own chunks, self-hosted woff2, on Cloudflare. Choose Astro when the site is mostly documents (chapters, news, offices) with a few authored moments, when SEO matters and when the team is framework-agnostic; choose `vite-vanilla.md` when the whole page is the engine.

## Scaffold
```sh
npm create astro@latest my-site -- --template minimal     # [recalled]
cd my-site && npm i astro@7.3.3 gsap@3.15.0 lenis@1.3.26 three@0.186.0 postprocessing@6.39.5
npx astro add react   # or svelte — only if an island needs a framework; vanilla islands need nothing
```
Layout: `src/layouts/Base.astro`, `src/pages/*.astro`, `src/scripts/{boot,score}.ts`, `src/webgl/`, `src/components/*.astro`, `public/{fonts,decoders}`.

## Boot architecture
Astro bundles a `<script>` in a layout as a module that runs once per full load, even with the client router: module scripts do not re-execute on navigation [verified: script re-execution]. So the boot creates Lenis once and mounts pages on `astro:page-load`, the documented replacement for `DOMContentLoaded` [verified].
```astro
---
// src/layouts/Base.astro
import { ClientRouter } from 'astro:transitions';       // Astro ≥ 5 name [verified]
---
<html lang="en"><head><ClientRouter /></head>
<body><slot /><canvas id="gl" aria-hidden="true" transition:persist></canvas><script>import '../scripts/boot';</script></body></html>
```
```ts
// src/scripts/boot.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { awards } from './awards-hook';                 // copy of recipes/_shared/awards-hook.js
import { motionTier } from './reduced-motion';
import { mountPage } from './score';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;
let ctx: gsap.Context | undefined;
document.addEventListener('astro:before-swap', () => ctx?.revert());        // old page's tweens and triggers go [verified event]
document.addEventListener('astro:page-load', async () => {                  // first load and every navigation [verified]
  lenis.scrollTo(0, { immediate: true });
  await document.fonts.ready;
  ctx = gsap.context(() => mountPage({ tier: motionTier(), lenis }));
  ScrollTrigger.refresh();
  awards.ready();
});
```
`window.__awards` comes from the same hook file; `state()` adds `{ tier }` via `awards.addState`. Reduced motion is one `motionTier()` read at mount plus `gsap.matchMedia` conditions inside `mountPage` [verified] [recipe:reduced-motion-switch]. Quality tiers run once in the WebGL entry [recipe:quality-tiers].

## WebGL in its own chunk
Two shapes. Vanilla: the persisted `<canvas transition:persist>` above survives navigations [verified: transition:persist keeps an element] and `boot.ts` lazily does `const { createGL } = await import('../webgl')` once (own chunk), then per page `gl.mount(scene)` on `astro:page-load` and `gl.unmount()` on `astro:before-swap`; the renderer lives on, scenes are disposed. Framework island: `<Scene client:visible />` or `client:load`, and `client:only="react"` only when the component cannot render on the server [verified: directives]; add `transition:persist` to keep its state across pages [verified]. Either way the page markup keeps `<img>` placeholders (the DOM mirror), and the canvas is `aria-hidden`. Mont-Fort's split (WebGL and ScrollTrigger as separate chunks) is what dynamic `import()` gives you; Astro builds with Vite [inferred].

## Page transitions
`<ClientRouter />` turns the MPA into client-side navigation with View Transitions and fires `astro:before-preparation`, `astro:after-preparation`, `astro:before-swap`, `astro:after-swap`, `astro:page-load` in that order [verified]. `transition:name="hero"` pairs elements across pages; `transition:persist="media-player"` is the shorthand that names and persists [verified]; `fade` / `slide` come from `astro:transitions` [verified]. Under reduced motion switch the animations off in CSS:
```css
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }
```
Authored GL transitions (brushstroke, composite) run in `astro:before-swap` on the persisted canvas while the DOM swaps underneath [recipe:gl-rtt-composite-transition].

## Fonts
`public/fonts/*.woff2` with `@font-face` in `src/styles/fonts.css` (imported by the layout), `font-display: swap`, a `size-adjust`ed fallback, and `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the hero faces. No Google Fonts CDN; Mont-Fort self-hosted Century Gothic and Josefin Sans Light [site:mont-fort]. Astro's Fonts API can also serve local files [unverified]. Gate SplitText on `document.fonts.ready` (the boot already awaits it).

## Resize strategy
`ScrollTrigger.refresh()` on width change (automatic), `ignoreMobileResize` for the address bar [verified], `invalidateOnRefresh: true` on scrubbed tweens [verified], breakpoints as `gsap.matchMedia` conditions [verified], `lenis.resize()` after async content [verified]. Because every page is static HTML, layout is known at swap time; still refresh in `astro:page-load` after fonts, not in `astro:after-swap`.

## Deploy notes
Static output by default: `astro build` → `dist/`. Cloudflare Pages ([site:mont-fort]) or any static host; `public/_headers` for `Cache-Control: immutable` on `/_astro/*`, `/fonts/*`, `/decoders/*` [recalled: Cloudflare/Netlify convention]. `@astrojs/cloudflare` only if you need SSR. Prefetch is on for `<ClientRouter />` pages; keep hero scenes lazy so prefetch does not pull WebGL.

## Pitfalls
- Booting inside `astro:page-load` without a guard: a new Lenis and ticker per navigation. Create once, mount per page.
- Expecting a layout `<script>` to re-run after navigation: it will not; `data-astro-rerun` only helps inline (`is:inline`) scripts [verified].
- `client:only` islands render nothing on the server: no DOM mirror, and the jury's accessibility score drops ([site:igloo] scored 6.6 for an empty DOM).
- Two smooth scrolls, or `html { scroll-behavior: smooth }` fighting `lenis.scrollTo`.
- A `position: fixed` canvas that is not persisted: it re-creates per page and drifts; use `transition:persist` and re-measure rects after the swap.
- ScrollTrigger positions computed before the swap finished: refresh in `astro:page-load`.
- Framer Motion / `motion` for scrub: not in the corpus; scrub is ScrollTrigger with `ease: 'none'`.
- Reloading at a breakpoint: `gsap.matchMedia` instead.
