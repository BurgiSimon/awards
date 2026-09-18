# Lenis 1.3

<!-- Labels: [verified] = checked against Context7 (`/darkroomengineering/lenis`: core, react and vue READMEs, source), 2026-09 · [recalled] · [unverified]. -->

## What it is for in this skill set
Scroll philosophy (a) in the motion vocabulary: native document scroll, interpolated, with ScrollTrigger kept in sync on one ticker [pattern:motion-vocabulary]. It replaces hand-rolled lerp scrollers (Floema's `interpolate(current, target, .1)`) and ScrollSmoother, and it keeps sticky layouts working because the document itself scrolls [unverified in this pass; consistent with its `html.lenis` stylesheet]. When the story must gate, hold or redirect scroll (Why Zero, Igloo) you do not use Lenis at all: you own a virtual float [recipe:gl-virtual-scroll-camera].

## Install (pinned)
```sh
npm i lenis@1.3.26
```
```js
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';     // html.lenis height:auto and the prevent / stopped rules [verified: stylesheet exists]
```
Framework entries: `lenis/react` (`ReactLenis`, `useLenis`) and `lenis/vue` (`VueLenis`, `useLenis`) [verified].

## The API surface we use
Constructor options [verified: README settings table unless noted]:
| Option | Default | Use |
|---|---|---|
| `lerp` | `0.1` | damping per frame (framerate-independent inside); the corpus feel is .075–.1 |
| `duration` + `easing` | unset | time-based mode; when set, `lerp` is ignored (one path runs, never both) [verified: animate.ts] |
| `smoothWheel` | `true` | smooth wheel input |
| `syncTouch` | `false` | smooth touch too; can be unstable on iOS < 16; required by `infinite` |
| `syncTouchLerp` | `0.075` | lerp during syncTouch inertia |
| `autoRaf` | `false` is the 1.3 default | Nothing scrolls until something calls `lenis.raf(time)` every frame: GSAP's ticker, the shared ticker, or `autoRaf: true` when no other clock exists. A Lenis with no clock swallows wheel events and the page appears frozen |
| `respectReducedMotion` | `true` | smoothing off and programmatic scrolls instant under `prefers-reduced-motion`; scroll stays native |
| `prevent` | — | `(node) => node.id === 'modal'` keeps a node's scroll native |
| `anchors` | `false` | `true` or `{ offset, onComplete }` so `#hash` links work |
| `orientation`, `gestureOrientation` | `vertical` | `'horizontal'` for a rail instance; `gestureOrientation: 'both'` exists |
| `infinite` | `false` | modulo scroll (Igloo-style loops) |
| `overscroll` | `true` | like CSS `overscroll-behavior` |
| `stopInertiaOnNavigate` | `false` | kill inertia when an internal link is clicked |
| `naiveDimensions` | `false` | cheaper measure with a performance impact; avoid |

Instance API [verified unless noted]:
- `lenis.on('scroll', (lenis) => ...)`: the instance is the event; read `scroll`, `limit`, `progress` (0..1), `velocity`, `direction`, `isScrolling` (`'smooth' | 'native' | false`), `isStopped`, `prefersReducedMotion`.
- `lenis.raf(timeMs)`: advance one frame; milliseconds.
- `lenis.scrollTo(target, { offset, lerp, duration, easing, immediate, lock, force, onComplete, userData })`: target is pixels, a selector, `'top' | 'bottom'` or an element; `immediate` skips easing, `lock` blocks the user until arrival, `force` moves even while stopped.
- `lenis.resize()`: recompute dimensions after content the ResizeObserver cannot see.
- `lenis.stop()` / `lenis.start()` / `lenis.destroy()` [unverified in this pass: only the `isStopped` getter and the `force` option surfaced; names per README].
- Markup: `data-lenis-prevent` (plus `-wheel`, `-touch`) keeps a nested scroller native.

## Integration with the others
```js
// vanilla — the canonical snippet [verified: Lenis README] [recipe:boot-lenis-gsap]
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));   // ticker seconds → ms
gsap.ticker.lagSmoothing(0);
```
```jsx
// React — ReactLenis owns the instance, GSAP's ticker drives it [verified: lenis/react README]
const lenisRef = useRef(null);
useEffect(() => {
  const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
  gsap.ticker.add(update);
  return () => gsap.ticker.remove(update);
}, []);
return <><ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />{children}</>;
```
```vue
<!-- Vue — VueLenis with root scrolls <html>; useLenis() returns the instance ref, null until mounted [verified: lenis/vue README] -->
<VueLenis root :options="{ autoRaf: false }" />
```
- `useLenis((lenis) => ...)` runs every scroll in React and Vue [verified]; wire the ticker once the instance exists.
- Three / OGL: read `lenis.scroll` and `lenis.velocity` in the same ticker callback → uniforms (velocity bulge at [site:floema], fluid wake at [site:leo-parpeix]).
- Capture: `window.lenis = lenis` lets `recipes/_shared/awards-hook.js` call `scrollTo(y, { immediate: true, force: true })`.
- Nav overlays: stop while open, start on close, `data-lenis-prevent` on the overlay's own scroller [recipe:nav-overlay-fullscreen].
- Page transitions: `scrollTo(0, { immediate: true })` in the enter hook, then `ScrollTrigger.refresh()` [recipe:page-transitions].

## Reduced motion and accessibility hooks
`respectReducedMotion: true` (default) turns smoothing off and makes `scrollTo` instant while native scrolling keeps running; read `lenis.prefersReducedMotion` if the score needs to know [verified]. Keyboard, Space, PageDown and find-in-page keep working because the document scrolls natively [unverified in this pass]. `anchors: true` for skip links and in-page navigation [verified]. Never `lock: true` longer than a transition; never trap focus behind a stopped page.

## Performance rules
One rAF: GSAP's ticker or Lenis's `autoRaf`, never both. `lerp` for scroll feel; `duration` + `easing` only for `scrollTo` cinematics. Avoid `naiveDimensions` [verified]. `resize()` only after async layout changes [verified]. `syncTouch` costs on old iOS; keep native touch unless the design needs inertia parity [verified]. Keep `prevent` predicates cheap: they run per event.

## Gotchas
- A second smooth-scroll library (ScrollSmoother, Locomotive, `ScrollTrigger.normalizeScroll(true)`) beside Lenis.
- `html { scroll-behavior: smooth }` makes `scrollTo` fight the browser; the Lenis stylesheet is enough.
- `raf(time)` expects milliseconds; GSAP's ticker hands you seconds.
- Anchor links are blocked until `anchors: true` [verified].
- Nested scrollers (modals, code blocks, horizontal rails) need `data-lenis-prevent` or `prevent()`, or their wheel is smoothed away [verified].
- Creating the instance before the page height is final and never calling `resize()`: the limit is wrong until the next resize event.
- Lando shipped 1.1.20; 1.3 has the same option shape and honours reduced motion by default [verified]; read the changelog before relying on anything else [unknown].

## Where the corpus used it
[site:leo-parpeix] (Lenis + GSAP + Three), [site:lando-norris] (Lenis 1.1.20 inside the injected bundle), [site:mont-fort] (Lenis + ScrollTrigger in Astro); Satūs, the Lenis authors' Next starter, is the reference integration. [site:floema] hand-rolled the same lerp (0.1) before Lenis existed; [site:why-zero] and [site:igloo] chose a virtual float instead.
