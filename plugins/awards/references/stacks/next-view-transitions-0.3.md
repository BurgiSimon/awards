# next-view-transitions 0.3

<!-- Labels: [verified: source] = read from the published tarball `next-view-transitions@0.3.5` (README.md, dist/index.d.ts, dist/index.js, package.json), 2026-09 · [verified: Context7] = `/shuding/next-view-transitions` (_autodocs getting-started, configuration, api-reference/useTransitionRouter), 2026-09 · [inferred: source] = behaviour read off dist/index.js, not documented · [recalled] · [unverified]. Where the docs and the 0.3.5 source disagree, the source wins. -->

## What it is for in this skill set
A small client-only wrapper by Shu Ding that puts the browser View Transitions API (`document.startViewTransition`) around App Router navigations [verified: source]. It gives a Next site the same route crossfade and CSS-named shared elements that Astro's View Transitions give an Astro site, with no React canary and on Next 14 upward [verified: source, peerDependencies `next >=14.0.0`]. Its README calls it a tool for basic cases and names concurrent rendering, Suspense and streaming as still unsolved [verified: source README]. In this skill set it is the cheap middle rung of the Next transition ladder in `next.md`:

| Need | Choose | Why |
|---|---|---|
| Next 16, React 19.2+, crossfades and shared elements that must survive Suspense and streaming | React `<ViewTransition>` (`next.md` → Page transitions) | Built into React's commit, so it knows when a streamed route is actually ready [inferred from the README disclaimer] |
| Next 14 or 15, or a React without `<ViewTransition>`, and the transition is a root crossfade plus a few `view-transition-name` morphs | **next-view-transitions** | Three exports, CSS does the animation, back/forward animate too [verified: source] |
| An authored exit that must finish before the route changes (overlay wipe, GL composite, promoted image) | Intercept the `<Link>` click, play the exit, then `router.push` (`next.md`) [recipe:page-transitions] [recipe:gl-rtt-composite-transition] | The browser snapshot cannot wait on a GSAP timeline; the intercept can |

The last two combine: the package's `Link` runs your `onClick` first and backs off if you called `preventDefault()`, so you can play the exit and then call `useTransitionRouter().push` to get a view transition for the enter [verified: source]. Never run React `<ViewTransition>` and this package in the same app: both drive `startViewTransition`, and only one transition can run at a time [inferred].

## Install (pinned)
```sh
npm i -E next-view-transitions@0.3.5     # 0.x: no semver promise, pin exactly
```
One ESM entry, `'use client'` at the top of the bundle, no stylesheet, no dependencies beyond the peers `next >=14.0.0` and `react`/`react-dom` `>=18.2.0 || ^19.0.0` [verified: source package.json]. The bundle imports React's `use`, which stable React 18.2 does not export; the App Router ships its own React build, so this matters only outside the App Router [inferred: source]. Pages Router is not supported: it imports `useRouter` and `usePathname` from `next/navigation` [verified: source].

## The API surface we use
Three exports, nothing else: `ViewTransitions`, `Link`, `useTransitionRouter` [verified: source dist/index.d.ts].

- **`<ViewTransitions>`**: the provider. The README wraps `<html>` with it in the root layout [verified: source README]. It listens for `popstate` and opens a transition on back/forward, then holds the new route's render until the old page has been captured [verified: source `useBrowserNativeTransitions`]. The transition ends when the new pathname (or hash) commits [verified: source].
- **`<Link>`**: accepts the same props as `next/link` and renders it [verified: source d.ts]. When `startViewTransition` exists it calls your `onClick`, returns if `e.defaultPrevented`, leaves modified clicks (`target` not `_self`, meta, ctrl, shift, alt, middle button) to the browser, otherwise prevents default and calls `router.push` or `router.replace` (from `replace`) with `as || href` and `scroll` (default `true`) [verified: source]. Without the API it does nothing and `next/link` navigates normally [verified: source].
- **`useTransitionRouter()`**: the App Router instance with `push` and `replace` wrapped: `document.startViewTransition(() => new Promise(resolve => startTransition(() => { navigate(); finish(resolve) })))` [verified: source]. Options are Next's `NavigateOptions` (`scroll`) plus `onTransitionReady?: () => void`, called on `transition.ready` [verified: source d.ts; Context7]. `back`, `forward`, `refresh` and `prefetch` are the plain router methods [verified: source]; `back()` still animates because it fires `popstate`, which the provider handles [inferred: source]. Using it outside `<ViewTransitions>` throws `useSetFinishViewTransition must be used within a ViewTransitions component` [verified: source].
- **CSS does the motion**: `::view-transition-old(root)` / `::view-transition-new(root)` keyframes for the page, and `view-transition-name: <unique>` on an element in both routes for a morph [verified: Context7 configuration]. Everything else is the platform's API, not this package's.

```tsx
// app/layout.tsx — provider outside <html>, Smooth (Lenis + GSAP boot) inside, as in next.md
import { ViewTransitions } from 'next-view-transitions';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en"><body><Smooth>{children}</Smooth></body></html>
    </ViewTransitions>
  );
}
```
```css
/* motion tokens from DESIGN.md; one expo-out vocabulary */
::view-transition-old(root) { animation: vt-out var(--dur-m) var(--ease-out) both; }
::view-transition-new(root) { animation: vt-in  var(--dur-m) var(--ease-out) both; }
@keyframes vt-out { to   { opacity: 0; transform: translateY(-2vh); } }
@keyframes vt-in  { from { opacity: 0; transform: translateY(4vh); } }
.case-hero { view-transition-name: case-hero; }   /* same name on the card and on the case page */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```
```tsx
// JS-driven enter: onTransitionReady takes no argument; reach the pseudo-elements through WAAPI
const router = useTransitionRouter();
router.push('/work/atlas', {
  onTransitionReady: () => document.documentElement.animate(
    { clipPath: ['inset(100% 0 0 0)', 'inset(0 0 0 0)'] },
    { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' },   // WAAPI pseudoElement [recalled]
  ),
});
```

## Pitfalls
- **The wrong `Link`.** `next/link` (or `<a>`) navigates without a transition; only the package's `Link` and `useTransitionRouter().push/replace` open one [verified: source]. Re-export one `Link` from `components/link.tsx` so nobody imports the other.
- **No reduced-motion branch.** The package never reads `prefers-reduced-motion` [verified: source, no `matchMedia`]; the CSS block above is mandatory, and a `onTransitionReady` animation must check `motionTier()` first [recipe:reduced-motion-switch].
- **No transition object.** `onTransitionReady` is called with nothing and there is no `finished` hook [verified: source d.ts]; the enter side learns the route changed from `usePathname()` in a client component, as in `next.md`.
- **`href` objects.** `Link` forwards `as || href` untouched to `router.push`, whose typed signature takes a string [verified: source]; a `UrlObject` href is likely to misroute [inferred]. Pass strings.
- **Lenis and scroll.** The old page is snapshotted at its current scroll, and `scroll: true` lets Next jump the document to the top. Set Lenis `stopInertiaOnNavigate: true`, then on pathname change `lenis.scrollTo(0, { immediate: true })` and `ScrollTrigger.refresh()` (`lenis-1.3.md`, `next.md`) [recalled]. `scroll: false` keeps position for in-place filters [verified: Context7].
- **Duplicate names.** A `view-transition-name` used twice in one snapshot aborts the transition [recalled]. Name the one clicked card on click, not every card in a list.
- **The page is a picture meanwhile.** During a transition the document is replaced by snapshots and input goes nowhere [recalled]. Keep page transitions under a second, and never pause a GSAP exit inside `onTransitionReady`: the new route is already live underneath.
- **Persistent WebGL canvas.** A fixed canvas in the layout is captured into the root snapshot and crossfades against its own next frame [inferred]. Give it its own `view-transition-name` and `animation: none` on its group, or drive the GL transition yourself with the intercept method [recipe:gl-rtt-composite-transition].
- **Unsupported browsers.** Without `startViewTransition` every path falls back to plain navigation [verified: source]; the enter choreography in `template.tsx` must stand on its own.
- **Streaming routes.** The transition waits for the pathname commit, not for nested Suspense boundaries; a streamed route can reveal half-loaded [verified: source comment "might not be complete when there are nested Suspense boundaries"]. Use React `<ViewTransition>` there.

## Where the corpus used it
[site:pensatori-irrazionali]: Next App Router on Turbopack with `ViewTransitions`, `Link` and `useTransitionRouter` bundled in one chunk, Lenis 1.3.17 read in the same router hook, beside GSAP 3.14.2 and a Three r182 WebGPURenderer forced to WebGL; the package version is unknown from the bundle [verified per the card, 04et1ujm.1ogt.js]. No other card in `references/sites/` names it.
