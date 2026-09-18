# GSAP 3.15

<!-- Labels: [verified] = checked against Context7 (`/websites/gsap_v3`, `/greensock/react`, `/greensock/gsap`, `/greensock/gsap-skills`), 2026-09 · [recalled] · [unverified]. -->

## What it is for in this skill set
The motion engine on every stack we could read in the corpus (12 of 12): timelines, ScrollTrigger, SplitText, Flip, Observer, `quickTo`. It runs the score, not just the reveals [pattern:motion-vocabulary]. For API depth beyond this note install GreenSock's official plugin, `/plugin marketplace add greensock/gsap-skills` (MIT; eight skills: gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-utils, gsap-react, gsap-performance, gsap-frameworks; its rules: register plugins once, transforms + `autoAlpha`, timelines over chained delays, `ScrollTrigger.refresh()` after layout changes, `useGSAP` with `scope` in React). Our motion skill teaches the award-site choreography on top of it. Since Webflow's acquisition GSAP is completely free for all users including commercial projects, and the formerly paid bonus plugins such as SplitText and MorphSVG ship in the npm package [verified: GSAP README]; ScrollSmoother is in the same package (we use Lenis instead).

## Install (pinned)
```sh
npm i gsap@3.15.0            # + @gsap/react@2.1.2 for React / Next
```
```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer);   // once, at boot
```

## The API surface we use
### Core and cleanup
- `gsap.to / from / fromTo / set`, `gsap.timeline({ defaults })`, position parameters (`'<'`, `'-=.2'`), `autoAlpha`, `xPercent` / `yPercent`. House easings: `expo.out` (≈ `cubic-bezier(.16,1,.3,1)`), `expo.inOut`, and `ease: 'none'` for anything scrubbed [pattern:motion-vocabulary].
- `gsap.context(fn)` tracks every tween and ScrollTrigger created inside; `ctx.revert()` kills and reverts them; return a function for custom cleanup; `self.ignore(fn)` excludes something [verified]. Every page, route or component owns one.
- `gsap.ticker.add((time) => ...)` is the one clock (seconds); `gsap.ticker.lagSmoothing(0)` disables catch-up when Lenis drives scroll (`lagSmoothing(1000, 16)` is the default shape) [verified].

### Conditions: `gsap.matchMedia()` [verified]
```js
const mm = gsap.matchMedia();
mm.add({ isDesktop: '(min-width: 800px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, (ctx) => {
  const { isDesktop, reduceMotion } = ctx.conditions;        // booleans; the setup re-runs whenever a condition flips
  gsap.to('.hero', { rotation: isDesktop ? 360 : 180, duration: reduceMotion ? 0 : 2 });
  return () => { /* custom cleanup only; the context reverts itself */ };
});   // [recipe:reduced-motion-switch]
```

### Pointer: `gsap.quickTo` [verified]
```js
const xTo = gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3' });
const yTo = gsap.quickTo(btn, 'y', { duration: .4, ease: 'power3' });
btn.addEventListener('pointermove', (e) => { xTo(e.offsetX - btn.offsetWidth / 2); yTo(e.offsetY - btn.offsetHeight / 2); });
xTo.tween.pause();   // the underlying tween is reachable   [recipe:magnetic-button] [recipe:cursor-two-speed]
```

### ScrollTrigger [verified]
- `scrub: true | 1` (seconds of lag) · `pin: true` (pins the trigger; never animate the pinned element itself; nested pins need `pinnedContainer`) · `pinSpacing: true` (default; adds the spacer) · `invalidateOnRefresh: true` (re-reads function-based values on refresh) · `ScrollTrigger.refresh()` (recomputes every trigger in creation order; `refresh(true)` waits for scrolling to stop) · `ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true })` · `ScrollTrigger.update` as Lenis's scroll listener.
- `ScrollTrigger.normalizeScroll(true)` moves scrolling to the JS thread and returns an Observer: an alternative to Lenis, never a companion.
```js
gsap.timeline({ scrollTrigger: { trigger: '.chapter', start: 'top top', end: '+=200%', scrub: true, pin: true, invalidateOnRefresh: true } })
  .to('.chapter__media', { scale: 1.2, ease: 'none' })
  .from('.chapter__lines', { yPercent: 100, stagger: .1, ease: 'none' }, '<');   // [recipe:scroll-pin-scrub]
```

### SplitText [verified]
`SplitText.create(target, vars)`: `type: 'lines' | 'words, lines' | 'chars,words'`, `mask: 'lines'` (extra clipping wrapper, v3.13+), `linesClass: 'line++'` (auto-incremented), `autoSplit: true` (re-splits when fonts load or the width changes), `onSplit(self)` (create the animation here and return it so SplitText carries its `totalTime()` across re-splits), `revert()`.
```js
document.fonts.ready.then(() => SplitText.create('.h1', {
  type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line',
  onSplit: (self) => gsap.from(self.lines, { yPercent: 100, duration: 1.2, ease: 'expo.out', stagger: .1 }),
}));   // [recipe:split-text-masked-reveal]
```

### Observer and Flip [verified]
```js
Observer.create({ target: window, type: 'wheel,touch', tolerance: 10, onUp: () => go(-1), onDown: () => go(1) });   // tolerance = px before a callback [recipe:gl-virtual-scroll-camera]
const state = Flip.getState('.card');             // capture, change the DOM, animate from the old state
grid.classList.toggle('is-detail');
Flip.from(state, { duration: 1, ease: 'expo.inOut', absolute: true });   // returns a timeline
Flip.fit('.thumb', '.stage', { duration: .8 });   // move one element into another's box [pattern:preloaders-and-transitions]
```

### React: `@gsap/react` [verified]
```tsx
const container = useRef<HTMLElement>(null);
useGSAP((context, contextSafe) => {                // gsap.context under the hood; reverted on unmount
  gsap.from('.line', { yPercent: 100, stagger: .1 });
  const onEnter = contextSafe(() => gsap.to('.ring', { scale: 1.35 }));
  container.current?.addEventListener('pointerenter', onEnter);
  return () => container.current?.removeEventListener('pointerenter', onEnter);
}, { scope: container });                          // { dependencies, revertOnUpdate: true } re-runs and reverts on change
```
Register once with `gsap.registerPlugin(useGSAP)`. Also in the corpus: MotionPathPlugin (a helmet on a Bézier path [site:lando-norris]); Draggable + Inertia for arc galleries.

## Integration with the others
- Lenis: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)` [verified: Lenis README] [recipe:boot-lenis-gsap].
- Three: read `lenis.scroll` / `lenis.progress` in the same ticker callback and write uniforms; `gsap.to(uniform, { value })` for cuts, `quickTo` for the pointer.
- Anime.js: one engine per page, or tick Anime's engine from `gsap.ticker` (`animejs-4.md`).
- Rive: authored 2D states; GSAP moves the container [site:lando-norris].

## Reduced motion and accessibility hooks
Three tiers from `recipes/_shared/reduced-motion.js`, applied through `gsap.matchMedia` conditions: the full score; reduced (opacity, colour and state changes only, no pin, no scrub-driven transforms); static. Under reduced motion SplitText may still split (layout) but the reveal is `autoAlpha` only, and masked wrappers must never leave text clipped. Check how the current SplitText exposes split text to assistive technology before relying on it [unverified]. Every Observer gate needs a keyboard path (`keydown` ArrowDown / PageDown → the same `next()`), every drag a focusable control.

## Performance rules
Transforms and opacity only; `will-change` for the duration of a tween, never permanently. One ticker. `pin` promotes layers, so pin sparingly and prefer sticky stages with invisible rails [site:the-line]. `scrub` with a small number smooths cheaply; call `ScrollTrigger.refresh()` only when layout really changed and debounce it on resize [verified: gsap-skills]. `quickTo` for anything the pointer drives. One `gsap.context` per view so nothing leaks across routes. `invalidateOnRefresh` instead of rebuilding timelines on resize.

## Gotchas
- `autoSplit` re-splits: animations created outside `onSplit` target dead elements after a re-split [verified].
- Function-based values (`x: () => el.offsetWidth`) freeze at creation unless `invalidateOnRefresh: true` [verified].
- `refresh()` before fonts and images decode gives wrong start/end positions; refresh after `document.fonts.ready` and the preloader.
- `normalizeScroll(true)` or ScrollSmoother beside Lenis: two scroll models.
- Animating the pinned element itself throws off measurements; animate its children [verified: pin docs].
- Two `matchMedia` blocks both building the same tween: split by condition, never by duplication.
- `from()` tweens inside scrubbed timelines render immediately; sequence with `fromTo` when order matters [recalled].

## Where the corpus used it
[site:leo-parpeix] (with Lenis + Three), [site:white-desert] (DOM-only score), [site:why-zero] (GSAP without ScrollTrigger: a virtual float drives timelines), [site:usavionix] (`@bsmnt/scrollytelling` over ScrollTrigger), [site:lando-norris] (3.13: Observer, ScrollTrigger, MotionPath, SplitText recalculated after font load), [site:mont-fort] (ScrollTrigger + Lenis in Astro), [site:united-carriers], [site:son-daven], [site:lama-lama], [site:floema], [site:oryzo], [site:the-line] (hinge and flicker vocabulary).
