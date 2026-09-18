# Anime.js 4

<!-- Labels: [verified: source] = read in the cloned juliangarnier/anime repo at 4.5.0 (README, src/, examples/), 2026-09 · [recalled] · [unverified]. Docs id for later checks: `/websites/animejs`. -->

## What it is for in this skill set
The second animation grammar in the corpus: [site:animejs] animates its own documentation with it (logo FALL → WIGGLE → POP, morphs, squash-and-stretch, a 50K-star confetti demo). We reach for it where its primitives are sharper than GSAP's for the job: `scrambleText` decode reveals, `splitText` with clone/clip wraps whose effects survive re-splits, `createDraggable` with release physics, `onScroll` as an autoplay strategy, `createScope` with media queries and scoped defaults. One engine per page: a site does not run GSAP loops and Anime loops side by side unless one ticks the other (below).

## Install (pinned)
```sh
npm i animejs@4.5.0
```
```js
import { animate, createTimeline, createTimer, stagger, onScroll, splitText, scrambleText,
         createDraggable, createAnimatable, createScope, createSpring, utils, svg, waapi, engine } from 'animejs';
```
ESM, tree-shakeable, with subpath entries (`animejs/timer`, `animejs/animation`, `animejs/timeline`, `animejs/scope`, ...) [verified: source package.json exports].

## The API surface we use
### `animate` and the easing grammar [verified: README, src/easings, examples]
```js
animate('.card', { y: { to: '-60%', duration: 400 }, rotate: { from: -180 }, delay: stagger(65, { from: 'center' }), ease: 'inOutQuint', composition: 'blend' });
```
- Per-property objects carry their own `from` / `to` / `ease` / `duration`; `[from, to]` arrays are the shorthand; `loop`, `alternate`; `composition: 'blend'` for hovers that layer over a running animation; plain objects (uniforms) are valid targets.
- Easings: named (`'linear'`, `'inOutQuad'`, `'inOutExpo'`), parametric (`'in(2)'`, `'out(4)'`, `'inOut(2)'`), `cubicBezier(x1, y1, x2, y2)`, `createSpring(params)`, the `eases` table. `cubicBezier(.16, 1, .3, 1)` is the house expo-out.
- `stagger(value, { from: 'first' | 'last' | 'center', start, use: 'data-line', modifier })`: `use` groups by an attribute the splitter wrote, `modifier` maps values, a `[from, to]` range spreads them.

### Timelines on scroll: `createTimeline` + `onScroll` [verified: src/events/scroll.js, examples/onscroll-sticky]
```js
createTimeline({ defaults: { ease: 'linear', duration: 500 },
  autoplay: onScroll({ target: '.sticky-container', enter: 'top top', leave: 'bottom bottom', sync: .5, debug: true }) })
  .add('.stack', { rotateY: [-180, 0], ease: 'in(2)' }, 0)
  .add('.card', { y: { to: '-60%', duration: 400 }, delay: stagger(1, { from: 'first' }) }, 0)
  .init();   // [recipe:scroll-pin-scrub] [recipe:sticky-stack-cards]
```
`sync` takes `true` / a number (smoothing), an ease name, or `'play pause'`-style method pairs; `container` picks the scroller; callbacks `onEnter`, `onLeave`, `onEnterForward/Backward`, `onLeaveForward/Backward`, `onUpdate`, `onResize`, `onSyncComplete`; `repeat` re-arms.

### Text: `splitText` and `scrambleText` [verified: src/text, examples/text/*]
```js
const split = splitText('h1', { lines: { wrap: 'clip' }, words: true });     // lines wait for document.fonts and re-split on width change
split.addEffect((s) => createTimeline().add(s.lines, { y: ['100%', 0], ease: 'out(4)', duration: 1200 }, stagger(100)).init());
animate('.readout', { innerHTML: scrambleText({ chars: 'uppercase', cursor: '░▒▓█', revealRate: 60, settleRate: 30 }) });
```
- `splitText(target, { lines, words, chars, accessible = true, includeSpaces, debug })`: each type is `true` or `{ class, clone: 'left' | 'right' | 'top' | 'bottom' | true, wrap: true | 'clip' }`; `clone` adds an inert duplicate for slide-swap reveals, `wrap` an `overflow: clip` wrapper; `split.lines / words / chars`; `addEffect((split) => animation | cleanup)` re-runs after every re-split (wrapped in `keepTime`); `refresh()`, `revert()` [recipe:split-text-masked-reveal].
- `scrambleText(params)` is a value factory for `innerHTML`: `chars` is a set name (`lowercase`, `uppercase`, `numbers`, `symbols`, `braille`, `blocks`, `shades`) or a literal range like `'a-z0-9'`; `cursor` (string or `true`), `revealRate` (60), `settleRate` (30), `settleDuration` (300), `text`, `ease`, `seed`, `onChange` [recipe:scramble-decode-text].

### Drag, animatables, timers [verified: examples/draggable-infinite-auto-carousel]
```js
const state = { width, speed: 2 };
const x = createAnimatable(track, { x: 0, modifier: (v) => utils.wrap(v, -state.width / 2, 0) }).x;   // getter / setter
const drag = createDraggable(state, { trigger: '#rail', y: false, releaseStiffness: 20, velocityMultiplier: 1.5,
  onGrab: () => animate(state, { speed: 0, duration: 500 }), onRelease: () => animate(state, { speed: 2, duration: 500 }) });
createTimer({ onUpdate: () => x(x() - state.speed + drag.deltaX) });   // one loop for the marquee [recipe:marquee-raf-mask]
```
`createTimer` also takes `duration`, `loop`, `frameRate`, `autoplay`, `onBegin`, `onComplete` [verified: src/timer].

### Scopes, SVG, WAAPI [verified: src/scope, src/svg, src/waapi, examples/text/hover-effects]
```js
createScope({ root: '#hero', defaults: { ease: 'outQuad', duration: 500 }, mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' } })
  .add((scope) => { if (scope.matches.reduced) return; /* build */ scope.add('onEnter', () => {}); return () => { /* cleanup */ }; });
```
- `scope.add(fn)` registers a constructor (re-run when a media query flips), `scope.add('name', fn)` a method on `scope.methods`; `.addOnce()`, `.refresh()`, `.revert()` [recipe:reduced-motion-switch].
- `svg.createDrawable(selector, start, end)`, `svg.morphTo(path, precision)`, `svg.createMotionPath(path, offset)` [recipe:scroll-drawn-svg-path].
- `utils.$ / set / get / random / lerp / wrap`; `waapi.animate(targets, params)` for cheap compositor tweens, `waapi.convertEase`.

## Integration with the others
- Anime runs its own main loop (`engine`), paused when the document is hidden (`engine.pauseOnDocumentHidden`, default `true`) [verified: src/engine].
- On a GSAP + Lenis page tick it from the shared clock [verified: both members exist; the pairing is our rule]:
```js
engine.useDefaultMainLoop = false;
gsap.ticker.add(() => engine.update());
```
- `onScroll` observes the real scroll container, so Lenis's native scroll should drive it [unverified in this pass]; a virtual float can drive timelines directly.
- Three: `animate(material.uniforms.uMix, { value: 1 })`: plain objects are targets [verified: README].
- `engine.timeUnit = 's'` switches durations to seconds; the default is milliseconds [verified: setter exists; README durations are ms].

## Reduced motion and accessibility hooks
`createScope({ mediaQueries })` re-runs its constructors when a query flips, and `scope.matches.reduced` gates the score; under reduced motion keep `splitText` for layout but animate opacity only, and skip `scrambleText` (assistive tech gets the final text; sighted users a flicker of nonsense). `splitText` defaults to `accessible: true` [verified: source]; check what it renders for screen readers before relying on it [unverified]. Every `createDraggable` surface needs a keyboard equivalent (arrow keys write `x()`).

## Performance rules
Batch DOM reads before `animate`; prefer `waapi.animate` for many simple opacity/transform tweens; one `createTimer` for marquees instead of per-item timers; `composition: 'blend'` only where a hover must layer over a running timeline; `debug: true` on `onScroll` in development only; revert scopes on route change.

## Gotchas
- v4 is a new API: v3's `anime({ targets })` is gone; everything is a named factory import.
- `splitText` waits for fonts when splitting lines, so the first effect may fire later than you expect [verified: source].
- `scrambleText` writes `innerHTML`: give it plain text nodes, not markup.
- Two engines (Anime's loop plus `gsap.ticker`) means two rAFs; tick one from the other.
- `stagger(..., { use: 'data-line' })` only works on elements the splitter annotated.

## Where the corpus used it
[site:animejs] (the library's own site and examples; its design system: warm near-black surfaces, a 17-hue × 6-step accent ramp, IoskeleyMono). The recipes offer Anime variants where its grammar is shorter: scroll scrub, masked reveals, flicker ladders, scramble decode, marquee timers, drawn paths and scoped reduced motion.
