# Nuxt 4

<!-- Labels: [verified] = checked against Context7 docs, 2026-09 · [recalled] · [inferred] · [unverified]. Pinned versions: versions.md. -->

## When to choose it
Vue teams with content pages and a DOM/CSS-first score: [site:the-line] (Nuxt, medium-high confidence; a canvas only for the cursor reveal, everything else CSS + GSAP with sticky stages and invisible rails; SOTM). [site:leo-parpeix] ran Vue 3 + Vite (medium) with Three + GSAP + Lenis: the same boot, without file routes. Choose Nuxt for file routes, `useHead`, a CMS module and SSR (the DOM mirror comes for free); choose Vite + Vue for one page and an engine.

## Scaffold
```sh
npm create nuxt@latest my-site          # [recalled] `npx nuxi@latest init my-site` also works
cd my-site && npm i nuxt@4.5.2 gsap@3.15.0 lenis@1.3.26
npm i three@0.186.0 postprocessing@6.39.5     # WebGL layer only
```
Nuxt 4 layout: `app/{app.vue,pages,layouts,components,composables,plugins,assets}`, `public/{fonts,decoders}`. Motion in `app/composables/`, WebGL in `app/webgl/` imported only from `.client.vue` components or `.client.ts` plugins.

## Boot architecture
A client-only plugin (`.client` suffix: it runs in the browser only [verified: Nuxt lifecycle]) creates Lenis once, wires the ticker and provides both handles to the app.
```ts
// app/plugins/smooth.client.ts
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis();                                // lerp .1, smoothWheel, respectReducedMotion on by default
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.config({ ignoreMobileResize: true });
  window.lenis = lenis;                                     // capture contract (recipes/_shared/awards-hook.js)
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  return { provide: { lenis, gsap } };                      // useNuxtApp().$lenis / $gsap [verified: provide]
});
```
Alternative when you prefer components: `<VueLenis root :options="{ autoRaf: false }" />` in `app.vue` and `useLenis()` anywhere below it; the composable returns the instance (null until mounted) and accepts a per-scroll callback [verified: lenis/vue]. Do not run both.

Per page or component, the score lives in a context created after mount and reverted before unmount:
```vue
<script setup lang="ts">
const { $gsap } = useNuxtApp();
const root = ref<HTMLElement>();
let ctx: gsap.Context | undefined;
onMounted(() => { ctx = $gsap.context(() => { /* tweens + ScrollTriggers scoped to root.value */ }); });
onBeforeUnmount(() => ctx?.revert());
</script>
```
`window.__awards` (from `recipes/_shared/awards-hook.js`, copied into `app/plugins/awards.client.ts`) resolves `ready` once fonts and hero assets are decoded; `state()` reports the motion tier. Reduced motion: one `motionTier()` composable (port of `recipes/_shared/reduced-motion.js`) read by every context plus `gsap.matchMedia` conditions [verified] [recipe:reduced-motion-switch]. Quality tiers: `detectQualityTier()` inside the WebGL boot [recipe:quality-tiers].

## WebGL in its own chunk
Put the canvas in `app/layouts/default.vue` inside `<ClientOnly>` (server renders the fallback, nothing GL touches SSR) [verified] as a `Scene.client.vue` component [verified suffix]; inside it:
```ts
onMounted(async () => { const { boot } = await import('~/webgl/scene'); handle = await boot({ lenis: useNuxtApp().$lenis }); });  // browser-only import [verified pattern]
onBeforeUnmount(() => handle?.dispose());
```
The dynamic import is its own chunk; pages announce their scene through a shared store (`useState('scene')`) and the single renderer swaps content rather than remounting. Scroll reaches shaders as `$lenis.progress` read inside the ticker, never as reactive state. Keep `<img>` placeholders in the page markup as the DOM mirror; the canvas is `aria-hidden="true"`.

## Page transitions
Nuxt's router is the transition engine; do not add taxi or Barba. JavaScript hooks on the page transition give GSAP the `done` callback [verified: transitions guide]:
```ts
definePageMeta({ pageTransition: { name: 'page', mode: 'out-in', css: false,   // css:false is a Vue <Transition> prop [recalled]
  onLeave: (el, done) => gsap.to(el, { autoAlpha: 0, duration: .4, onComplete: done }),
  onEnter: (el, done) => { useNuxtApp().$lenis.scrollTo(0, { immediate: true }); ScrollTrigger.refresh(); gsap.from(el, { autoAlpha: 0, duration: .6, onComplete: done }); },
} });
```
Site-wide defaults go in `nuxt.config` → `app.pageTransition: { name: 'page', mode: 'out-in' }` (it does not run across layouts) [verified]; `experimental.viewTransition: true` opts into the browser View Transitions API and respects `prefers-reduced-motion` [verified]; `viewTransition: false` in `definePageMeta` opts a page out [verified]. Shared-element GL transitions render both scenes to targets and blend [recipe:gl-rtt-composite-transition].

## Fonts
`public/fonts/*.woff2` + `@font-face` in `app/assets/css/fonts.css` with `font-display: swap` and a `size-adjust`ed fallback; preload the two above-the-fold files through `useHead({ link: [{ rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' }] })` [recalled: useHead]. No Google Fonts CDN. If you adopt `@nuxt/fonts`, pin the `local` provider so nothing resolves to Google or Bunny at build [unverified]. Gate SplitText on `document.fonts.ready`; The Line's vw-locked type (210 px at 1728 → 12.15278vw) needs no re-split at all [site:the-line].

## Resize strategy
Width changes refresh ScrollTrigger; touch height changes are the address bar → `ignoreMobileResize` [verified]. Scrubbed tweens with function-based values: `invalidateOnRefresh: true` [verified]. Breakpoint scores in `gsap.matchMedia` inside the same context [verified]. `lenis.resize()` after async content the ResizeObserver cannot see [verified]. Never reload at a breakpoint.

## Deploy notes
`nuxt generate` for a static site (Nitro prerender), `nuxt build` for SSR with a Nitro preset (Vercel, Cloudflare, Netlify) [recalled]. Add immutable cache headers for `/fonts/*` and `/decoders/*` via `routeRules` [recalled]. The Line's host is unknown [unknown].

## Pitfalls
- A universal plugin importing `three` or Lenis: it runs on the server; use the `.client.ts` suffix.
- `useLenis()` before mount returns null; guard with `watch(..., { immediate: true })` or use the plugin above.
- Two smooth scrolls (`VueLenis` + the plugin, or Lenis + ScrollSmoother), or `html { scroll-behavior: smooth }` in a global stylesheet.
- `<NuxtPage keepalive>` with a canvas per page: two renderers alive; keep the canvas in the layout.
- Nuxt's own scroll restoration (`app/router.options.ts` → `scrollBehavior` [recalled]) fighting a manual `scrollTo`: choose one.
- Framer Motion / `motion` for scrub: not in the corpus; scrub is ScrollTrigger with `ease: 'none'`.
- A `position: fixed` canvas drifting against placeholders: re-offset per frame or feed scroll as a uniform [site:oryzo].
- Stripping the server-rendered fallback inside `<ClientOnly>`: that fallback is the DOM mirror the jury reads.
