# Webflow shell + injected ESM bundle

<!-- Labels: [verified] = checked against Context7 docs, 2026-09 · [recalled] · [inferred] · [unverified]. Pinned versions: versions.md. -->

## When to choose it
When the client designs, edits and hosts in Webflow and still wants an award-class engine: design, CMS and hosting stay in Webflow; every line of motion and WebGL lives in a separate repo, bundled to ESM, served from your own origin and embedded with one `<script type="module">`. OFF+BRAND runs it on [site:lando-norris] (bundle from `lando.itsoffbrand.io`: Lenis 1.1.20, GSAP 3.13 with Observer / ScrollTrigger / MotionPath / SplitText, Three r174 with bloom and a fluid sim, Rive ×8, `@unseenco/taxi`, DRACO + KTX2) and [site:trevor-noah] (Webflow CMS + custom WebGL); [site:united-carriers] (Webflow + GSAP + Three) and [site:son-daven] (Webflow + GSAP + WebGL, SOTM) prove the ceiling is Site of the Month. Choose it for the client's editing story, never for the developer's convenience.

## Scaffold
Two repos. Webflow holds pages, classes, CMS collections and custom attributes; the engine is a Vite project with a single entry.
```sh
mkdir engine && cd engine && npm init -y
npm i gsap@3.15.0 lenis@1.3.26 three@0.186.0 @unseenco/taxi@1.9.1 && npm i -D vite@8.3.0
```
```js
// engine/vite.config.js — one unhashed entry, hashed chunks, CORS for the Webflow preview origin
import { defineConfig } from 'vite';
export default defineConfig({
  build: { lib: { entry: 'src/main.js', formats: ['es'], fileName: () => 'main.js' },          // lib mode [recalled]
           rolldownOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js' } } },        // Vite 8 option name [verified]
  server: { cors: { origin: [/\.webflow\.io$/, 'https://www.example.com'] } },                // dev CORS is strict by default [recalled]
});
```
esbuild is the leaner alternative and what Lando's bundle suggests: `esbuild src/main.js --bundle --format=esm --splitting --outdir=dist --minify` [recalled]. Layout: `src/main.js` (boot), `src/modules/<name>.js` (one per `data-module`), `src/webgl/`, `src/lib/` (ports of `recipes/_shared/*.js`), `public/decoders/`.

## Boot architecture
Embed once, site-wide, in Site settings → Custom code → Footer (Webflow places it before `</body>`; Head code goes inside `<head>`) [verified: Webflow custom code]. A module script is deferred by the HTML spec, so it runs after the page is parsed and after Webflow's own classic scripts (jQuery and `webflow.js` [unverified in this pass]).
```html
<script type="module">
  const dev = localStorage.getItem('engine:dev') === '1';   // flip in DevTools to run against the local Vite server
  import(dev ? 'http://localhost:5173/src/main.js' : 'https://engine.example.com/main.js');
</script>
```
```js
// src/main.js — the same single ticker as every other stack [verified: Lenis README]
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { awards } from './lib/awards-hook.js';
import { motionTier } from './lib/reduced-motion.js';
import { detectQualityTier } from './lib/quality-tiers.js';
import { modules } from './modules/index.js';           // { hero: (el, ctx) => void, marquee: ..., ... }
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.lenis = lenis;
export async function mount(root = document) {
  const tier = motionTier();
  const profile = await detectQualityTier();
  const ctx = gsap.context(() => {
    root.querySelectorAll('[data-module]').forEach((el) => modules[el.dataset.module]?.(el, { tier, profile, lenis }));
  });
  await document.fonts.ready;
  ScrollTrigger.refresh();
  awards.ready();
  return ctx;
}
mount();
```
Content stays in Webflow: Collection Lists render the DOM; the engine hydrates by `data-module` and reads parameters from custom attributes bound to CMS fields (`data-accent`, `data-scene`) [recalled: Designer custom attributes]. Reduced motion and quality tiers are the shared modules [recipe:reduced-motion-switch] [recipe:quality-tiers]; `window.__awards` is the capture contract [recipe:boot-lenis-gsap]. Do not depend on `window.jQuery` or `Webflow.push()` [unverified]; the engine imports what it needs. The `wf` Browser API (`wf.ready`) exists only with Analyze/Optimize enabled [verified] and is irrelevant to the engine.

## WebGL in its own chunk
`import('./webgl/index.js')` from `mount()` when `tier === 'full'` and `profile.tier !== 'low'`; chunks resolve relative to `main.js` on the engine origin, so decoders and textures live there too: `ktx2.setTranscoderPath('https://engine.example.com/decoders/basis/')`. One canvas appended to `body` by the engine (Webflow never knows about it), sized by the quality budget; DOM placeholders are Webflow images, read after `img.decode()` and through `currentSrc` (Webflow emits `srcset`). Dispose scenes on every taxi leave; the renderer persists.

## Page transitions
`@unseenco/taxi` is the SPA layer Lando used: `data-taxi` on the page wrapper and `data-taxi-view="home"` on each page's main div (custom attributes in the Designer), a `Renderer` per view keyed by that value whose `onEnter` calls `mount(this.content)` and whose `onLeave` reverts the context, a `Transition` with `onLeave({ from, done })` / `onEnter({ to, done })`, `reloadJsFilter` left at its default so only `data-taxi-reload` scripts re-run, and `data-taxi-ignore` on links that must hard-load [verified: taxi docs] [recipe:page-transitions]. Webflow components that depend on `webflow.js` (dropdowns, sliders, Interactions) do not re-initialise after a DOM swap by themselves (`Webflow.destroy()` / `Webflow.ready()` / `Webflow.require('ix2').init()` circulate as community snippets [unverified]); the clean rule is no Webflow Interactions and no Webflow-JS components on transitioned pages. Page-level custom code runs once; keep per-page logic in renderers.

## Fonts
Upload woff2 in Site settings → Fonts so they load from Webflow's asset host, or serve them from the engine origin with CORS and declare `@font-face` in Head code [recalled]. Remove Google Fonts from the site's font settings (Webflow's Google integration loads from Google's CDN [recalled]); the corpus faces were licensed and self-hosted: Mona Sans + Brier [site:lando-norris], BT Steinhart + Helvetica Now [site:united-carriers], KTF Metro [site:son-daven]. Preload the hero faces in Head code; gate SplitText on `document.fonts.ready`.

## Resize strategy
Align the engine's `gsap.matchMedia` breakpoints with Webflow's (991 / 767 / 478 px) so both sides flip together [recalled: Webflow breakpoints]; `ignoreMobileResize` [verified]; `invalidateOnRefresh: true` on scrubbed tweens [verified]; `lenis.resize()` after Collection Lists paginate or filter [verified]. Lando reloads across 992 px and picks texture formats by `innerWidth`: do neither; swap scene detail through the tier module.

## Deploy notes
Engine → Cloudflare Pages / Netlify with a `_headers` file: `Access-Control-Allow-Origin: *` on `/*` (cross-origin module scripts, chunks, fonts and decoders all need CORS), `Cache-Control: public, max-age=31536000, immutable` on `/chunks/*`, `/decoders/*`, `/fonts/*`, and `max-age=60` on `/main.js`. Deploy the engine first (new chunks by hash), keep old chunks online for open tabs, then publish Webflow. Webflow hosting runs no server code: forms, redirects and the CMS stay Webflow's.

## Pitfalls
- Missing CORS on the engine origin: the module fails with one console line and the site is a static Webflow page.
- Webflow Interactions and GSAP on the same element: two transforms; give IX2 nothing, or only elements the engine never touches.
- A "smooth scroll" cloneable or a class setting `html { scroll-behavior: smooth }`: fights Lenis.
- The Webflow nav sets `overflow: hidden` on `body` when open; stop and restart Lenis (`lenis.stop()` / `lenis.start()` [unverified]) and put `data-lenis-prevent` on the overlay instead of fighting it.
- Webflow's `loading="lazy"` on hero images: GL textures arrive late; set the hero image to eager.
- Custom code character limits per site and page [recalled]: embed only the loader, never the engine inline.
- Hashing `main.js`: every deploy would need a Webflow publish; keep the entry name stable and hash only chunks.
- Framer Motion for scrub, a `position: fixed` canvas that drifts, a breakpoint reload: the same refusals as every other stack.
