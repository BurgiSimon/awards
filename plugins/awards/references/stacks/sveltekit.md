# SvelteKit 2 (+ Threlte)

<!-- Labels: [verified] = checked against Context7 docs, 2026-09 · [recalled] · [inferred] · [unverified]. Pinned versions: versions.md. -->

## When to choose it
Svelte 5 teams, and engine-first sites that want a component model without React's render cost: [site:igloo] (Vite build; Svelte/Threlte, medium confidence; SOTY 2024 + Developer SOTY; a 100 % canvas world with virtual scroll and four workers, and an accessibility sub-score of 6.6 because the DOM was empty). SvelteKit adds SSR for the DOM mirror, file routes, `onNavigate` view transitions and `adapter-static` for a fully static build. Choose it when the team writes Svelte; choose `vite-vanilla.md` when there is no team and one page.

## Scaffold
```sh
npx sv create my-site        # [verified] prompts for TypeScript and tooling; then npm run dev
cd my-site && npm i @sveltejs/kit@2.70.3 gsap@3.15.0 lenis@1.3.26
npm i three@0.186.0 @threlte/core@8.6.0 @threlte/extras@9.21.1 postprocessing@6.39.5   # WebGL layer only (Threlte versions from npm, 2026-09)
```
Layout: `src/routes/+layout.svelte` (boot), `src/routes/**/+page.svelte`, `src/lib/{motion,webgl,awards-hook,reduced-motion,quality-tiers}`, `static/{fonts,decoders}`, `src/app.html`, `src/app.css`.

## Boot architecture
Browser-only code goes in `onMount`, which never runs on the server, and browser-only libraries are imported inside it [verified: SvelteKit FAQ]; components may also branch on `browser` from `$app/environment` [verified].
```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import 'lenis/dist/lenis.css';
  import '../app.css';
  let { children } = $props();

  onMount(async () => {
    const { default: Lenis } = await import('lenis');            // browser-only import [verified pattern]
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;                                          // capture contract (recipes/_shared/awards-hook.js)
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };   // destroy() [unverified in this pass]
  });
  afterNavigate(() => { window.lenis?.scrollTo(0, { immediate: true }); ScrollTrigger.refresh(); });   // [verified: afterNavigate]
  onNavigate((navigation) => {                                     // native View Transitions [verified: SvelteKit FAQ]
    if (!document.startViewTransition) return;
    return new Promise((resolve) => {
      document.startViewTransition(async () => { resolve(); await navigation.complete; });
    });
  });
</script>
{@render children()}
```
Each `+page.svelte` opens its score in `onMount(() => { const ctx = gsap.context(build); return () => ctx.revert(); })` so tweens and ScrollTriggers die with the page [verified: gsap.context]. `window.__awards` is installed from `$lib/awards-hook` in the same layout mount; `awards.ready()` fires after fonts and the hero scene. Reduced motion: `$lib/reduced-motion` (`motionTier()` → full | reduced | static), read by every context and mirrored in `gsap.matchMedia` conditions [verified] [recipe:reduced-motion-switch]. Quality tiers: `detectQualityTier()` before the GL import [recipe:quality-tiers].

## WebGL in its own chunk
Load the Threlte tree lazily so `three` never enters the entry chunk:
```svelte
{#await import('$lib/webgl/Stage.svelte') then { default: Stage }}<Stage />{/await}
```
`Stage.svelte` wraps `<Canvas>`; the scene inside uses `<T.Mesh>`, `useTask((delta) => ...)` for per-frame work and `useThrelte()` for `renderer`, `dpr` (writable: `dpr.set(profile.dpr)`), `renderMode` (`'always' | 'on-demand' | 'manual'`), `invalidate()` and `advance()` [verified: Threlte core]. Two clocks are acceptable as long as scroll flows one way: read `lenis.progress` inside `useTask`, never push it into `$state`. For a settled frame (reduced motion, low tier) set `renderMode` to `'on-demand'` and call `invalidate()` when something changes [verified]. Threlte disposes what `<T>` created on unmount [unverified in this pass]; vanilla three in a plain component disposes in the `onMount` cleanup. Keep the DOM mirror server-rendered: that is the Igloo lesson.

## Page transitions
`onNavigate` + `document.startViewTransition` (above) is the framework-native route: `view-transition-name` on shared elements and `::view-transition-*` CSS do the choreography; `@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none !important; } }` switches it off. Authored exits that must finish first: `beforeNavigate` can cancel a navigation [verified], so cancel, play the exit, then `goto()` [recalled]. GL composites run on the persistent canvas in the layout [recipe:gl-rtt-composite-transition]. No taxi or Barba: the router already owns navigation.

## Fonts
`static/fonts/*.woff2`, `@font-face` in `src/app.css` with `font-display: swap` and a `size-adjust`ed fallback, `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `src/app.html`. No Google Fonts CDN. Igloo rendered its type as MSDF inside the canvas; if you do that, mirror it in the DOM [site:igloo] [recipe:gl-msdf-text].

## Resize strategy
Same rules as every stack: `ignoreMobileResize` [verified], `invalidateOnRefresh: true` on scrubbed tweens [verified], breakpoints as `gsap.matchMedia` conditions [verified], `lenis.resize()` after async content [verified]. Threlte's `<Canvas>` resizes with its container; cap the pixel budget through `dpr` from the quality tier. No reload at a breakpoint.

## Deploy notes
Static: `@sveltejs/adapter-static` in `svelte.config.js` and `export const prerender = true` in `src/routes/+layout.js` [verified]. Do not set `ssr = false` there: it turns the app into an SPA with an empty shell [verified]. `adapter-auto` picks Vercel / Netlify / Cloudflare otherwise [recalled]. Add immutable cache headers for `/fonts/*` and `/decoders/*`; hashed `_app/immutable` already has them.

## Pitfalls
- Browser-only code at module level in `+page.js` / `+layout.js`: those modules load on the server; import inside `+page.svelte` / `onMount` [verified].
- `export const ssr = false` to dodge `window` errors: it deletes the DOM mirror and the SEO shell [verified].
- Two Lenis instances across layout groups, or Lenis + ScrollSmoother; `html { scroll-behavior: smooth }` in `app.css`.
- Pushing scroll or pointer values through `$state` into Threlte: re-renders per frame; read refs inside `useTask`.
- A canvas per page instead of one in the layout: drift, duplicate renderers, lost GPU resources.
- Framer Motion / `motion` for scrub: not in the corpus; scrub is ScrollTrigger with `ease: 'none'`.
- Reloading at a breakpoint.
