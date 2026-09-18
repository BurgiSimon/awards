# Next.js 16 (App Router)

<!-- Labels: [verified] = checked against Context7 docs, 2026-09 · [recalled] · [inferred] · [unverified]. Pinned versions: versions.md. -->

## When to choose it
Choose Next when a headless CMS feeds many templated pages and the team already lives in React: [site:white-desert] (Next + Contentful + GSAP on Vercel, no WebGL, SOTD on copy and photography), [site:seasats] (Next + Payload CMS, pre-rendered C4D sequences scrubbed on scroll), [site:usavionix] (Next + WebGL from basement.studio's house stack: `@bsmnt/scrollytelling`, R3F inferred). The Lenis authors' starter Satūs (Next 16 + React 19 + Lenis + GSAP + Tempus + Theatre.js, optional R3F; `app/ components/ lib/{hooks,integrations,webgl,seo,styles}`) is the canonical creative-dev Next layout. Corpus reality check: React/Next appears mostly in reconstructions; the engine-first winners ran Vite, Svelte, Nuxt, Astro or Webflow. Choose it for the CMS and the team, not for the motion.

## Scaffold
```sh
npx create-next-app@latest my-site --ts --app --src-dir --no-tailwind --eslint
cd my-site && npm i next@16.3.5 gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.26
npm i three@0.186.0 @react-three/fiber@9.7.0 @react-three/drei@10.7.8 postprocessing@6.39.5   # WebGL layer only
```
Layout: `src/app/{layout,template,page}.tsx`, `src/components/smooth.tsx` (boot), `src/components/gl/` (client-only), `src/lib/{awards-hook,reduced-motion,quality-tiers}.ts` (ports of `recipes/_shared/*.js`), `public/fonts`, `public/decoders`.

## Boot architecture
Lenis and GSAP exist only in the browser, so the boot is one client component mounted once in the root layout. `ReactLenis root` owns the instance and GSAP's ticker drives it with `autoRaf: false` [verified: lenis/react README].
```tsx
// src/components/smooth.tsx
'use client';
import { useEffect, useRef } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';     // `LenisRef` type name [recalled]
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger, useGSAP);                 // [verified]

export function Smooth({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);
  useEffect(() => {
    const lenis = ref.current?.lenis;
    if (!lenis) return;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ ignoreMobileResize: true });
    (window as Window & { lenis?: unknown }).lenis = lenis;   // capture contract
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => gsap.ticker.remove(tick);
  }, []);
  return <><ReactLenis root options={{ autoRaf: false }} ref={ref} />{children}</>;   // root: Lenis scrolls <html>, no wrapper
}
```
```tsx
// src/components/awards.tsx — installs window.__awards (import has side effects) and resolves `ready`; renders nothing
'use client';
import { useEffect } from 'react';
import { awards } from '@/lib/awards-hook';
export function Awards() { useEffect(() => { document.fonts.ready.then(() => awards.ready()); }, []); return null; }
```
`app/layout.tsx` (a Server Component) renders `<Smooth>{children}</Smooth>` and `<Awards />`; resolve `ready` later than fonts when a preloader gates hero assets [recipe:boot-lenis-gsap]. Per-component motion goes through `useGSAP(() => { ... }, { scope: container })`, which wraps everything in a `gsap.context` and reverts it on unmount; handlers created later use `contextSafe`; `revertOnUpdate: true` reverts on every dependency change [verified: @gsap/react]. Reduced motion: `lib/reduced-motion.ts` exports `motionTier()` (full | reduced | static); every `useGSAP` block reads it and `gsap.matchMedia` conditions mirror it [verified] [recipe:reduced-motion-switch]. Quality tiers: `detectQualityTier()` runs in the GL entry, never during render [recipe:quality-tiers].

## WebGL in its own chunk
`next/dynamic` with `ssr: false` is only allowed inside a Client Component [verified], so wrap the scene once:
```tsx
'use client';
import dynamic from 'next/dynamic';
const Scene = dynamic(() => import('./scene'), { ssr: false, loading: () => null });
export function GL(props: SceneProps) { return <Scene {...props} />; }
```
Inside `scene.tsx` use vanilla three (a `useEffect` that boots and returns `dispose`) or R3F: `<Canvas dpr={[1, 2]} frameloop="always" flat gl={{ antialias: false, powerPreference: 'high-performance' }}>` [verified: Canvas `dpr`, `frameloop`, `flat`, `gl` props]. Mount one `<Canvas>` in the layout, not one per page; pages register their scene in a store and the canvas swaps. Scroll reaches the scene as a ref written in `useLenis((l) => { progress.current = l.progress; })` [verified: useLenis callback], never as React state (Shopify's Spring '26 rule: scroll → refs → uniforms [site:shopify-editions-w26]). R3F disposes objects it created when the tree unmounts [unverified in this pass]; vanilla three disposes explicitly in the effect cleanup. `frameloop="demand"` [verified] is the static/reduced-motion mode.

## Page transitions
`template.tsx` gets a new key per navigation, so Client Components inside remount and `useGSAP` replays the enter choreography [verified: template.js convention]. Crossfades and shared elements: React's `<ViewTransition>` (`import { ViewTransition } from 'react'`) with `name` / `share` / `enter` / `exit`; no `next.config` flag (`experimental.viewTransition` was removed) [verified]. Authored exits that must finish before the route changes (overlay, GL composite): intercept the `<Link>` click, play the exit, then `router.push`; `usePathname()` in a client component is the enter-side signal [verified]. After any navigation: `lenis.scrollTo(0, { immediate: true })` then `ScrollTrigger.refresh()`.

## Fonts
`next/font/local` with `display: 'swap'`, `variable` for a CSS custom property, and `adjustFontFallback` left on (it synthesises the metric-matched fallback) [verified]. Files sit next to `app/` and are served from your origin. `next/font/google` self-hosts at build time, so it is not a runtime CDN call [recalled, high], but the reflex list in `reflex-lists.md` still applies to the faces. Declare fonts at module scope in a Server Component; gate SplitText on `document.fonts.ready`.

## Resize strategy
`ScrollTrigger.config({ ignoreMobileResize: true })` once in `Smooth` [verified]; `invalidateOnRefresh: true` on scrubbed tweens [verified]; breakpoints as `gsap.matchMedia` conditions inside `useGSAP`, not React state that re-renders the tree [verified]. For the mobile viewport unit basement ships `next-real-viewport` [site:usavionix]; a `--vh` custom property set once from `visualViewport` does the same job. Never a reload at a breakpoint.

## Deploy notes
Vercel is the natural host ([site:white-desert]); `output: 'export'` for a fully static site. `headers()` in `next.config` for `Cache-Control: immutable` on `/fonts/*` and `/decoders/*` (hashed `_next/static` already is). Draco/Basis decoders live in `public/decoders/`. Check splits with an `ANALYZE` build: `three` must not land in the shared chunk of CMS-only pages.

## Pitfalls
- Creating Lenis in a Server Component or at module scope: it needs `window`; keep it inside `'use client'` files and effects.
- Two Lenis instances (`ReactLenis` plus a manual `new Lenis`), or Lenis plus `ScrollSmoother`.
- `html { scroll-behavior: smooth }` in `globals.css` fights `lenis.scrollTo`.
- Framer Motion / `motion` `useScroll` for scrub beside ScrollTrigger: two scroll models; scrub is ScrollTrigger with `ease: 'none'`.
- A `position: fixed` canvas inside `template.tsx`: it remounts per route and drifts against DOM placeholders; mount it in the layout.
- Strict Mode double-invokes effects in dev: `useGSAP` reverts cleanly; a bare `gsap.to` in `useEffect` without cleanup leaks tickers.
- `ssr: false` outside a Client Component, or importing `three` from a Server Component (it prerenders anyway) [verified].
- Reloading at a breakpoint, or using `client:only`-style empty shells: the DOM mirror is the accessibility score.
