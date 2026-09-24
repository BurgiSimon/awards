# Locomotive Scroll 5.0

<!-- Labels: [verified: Context7] = `/locomotivemtl/locomotive-scroll/v5.0.1` (README, docs/documentation/options.md + attributes.md, docs/extras/migration-guide.md), 2026-09 · [verified: tarball] = read from `npm pack locomotive-scroll@5.0.1` (package.json, dist/types/*.d.ts, dist/locomotive-scroll.modern.mjs, dist/locomotive-scroll.css) and `npm pack lenis@1.3.17`, 2026-09 · [verified: npm] = `npm view locomotive-scroll`, 2026-09 · [inferred: source] = read off the 5.0.1 bundle's behaviour, not documented · [recalled] · [unverified]. Where the docs and the 5.0.1 source disagree, the source wins and the conflict is named. -->

## What it is for in this skill set
Reading, not choosing. Two corpus sites ship it, and they ship two different libraries under one name: v4 is a transformed-container virtual scroller, v5 is a thin attribute layer over Lenis [verified: Context7, migration guide]. This note exists so that a site card's "Locomotive" can be translated into the scroll model it actually implies, and so that a v5 project someone hands you can be driven by the capture hook and kept on one ticker.

The skill set does not install it. [pattern:motion-vocabulary] scroll philosophy (a) is native scroll interpolated by Lenis, and `lenis-1.3.md` lists Locomotive among the smooth-scroll libraries to remove from a Lenis build. The reasons, each checked against 5.0.1:
- v5's smoothing *is* Lenis, pinned exactly to `lenis: 1.3.17` [verified: tarball, package.json]. It cannot follow our pin (1.3.26), so a project that also imports `lenis` bundles two copies [inferred: exact pin, no peer dependency].
- Lenis 1.3.17 has no `respectReducedMotion` option and no `prefers-reduced-motion` check anywhere in its dist [verified: tarball, grep of lenis.mjs]. The reduced-motion default the Lenis note relies on does not exist under Locomotive 5.0.1; you would wire it yourself.
- What v5 adds on top of Lenis (in-view classes, `--progress`, speed parallax, window CustomEvents) is what ScrollTrigger, a CSS scroll-driven animation or ten lines on the shared ticker already do in this skill set, with one fewer abstraction between the score and the frame.
- Its default loop is its own `requestAnimationFrame`; staying on one clock means passing `initCustomTicker` / `destroyCustomTicker` every time [verified: Context7, options.md].

## Install (pinned)
Only when inheriting a Locomotive 5 project; never in a new build.
```sh
npm i locomotive-scroll@5.0.1        # latest; dist-tags beta 5.0.0-beta.21, rc 5.0.0-rc.1 [verified: npm]
```
```js
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';   // the Lenis rules: html.lenis height:auto, .lenis-stopped overflow:clip, prevent overscroll [verified: tarball]
```
- ESM only in practice: the `require` export condition and `main` point at `dist/locomotive-scroll.js`, which is not in the tarball (it ships `.cjs`); `require('locomotive-scroll')` throws `MODULE_NOT_FOUND` [verified: tarball, tested in Node]. Vite, Next and Astro resolve the `default` condition (`modern.mjs`) and are unaffected [inferred: exports map].
- `engines.node >= 20`, `"type": "module"` [verified: tarball].
- 5.0.0 and 5.0.1 were published 22 minutes apart on 2026-01-15; the last v4 is 4.1.4 (2022-02-03) [verified: npm].
- The bundle writes `window.locomotiveScrollVersion = "5.0.0"` even in 5.0.1 [verified: tarball]. A site read that takes its version from that global cannot tell 5.0.0 from 5.0.1.

## The v4 → v5 break
Same package name, different machine [verified: Context7, migration guide, unless noted]:
| | v4 (≤ 4.1.4) | v5 (5.0.x) |
|---|---|---|
| Scroll model | `smooth: true` translates a `data-scroll-container` with `transform`; the document does not scroll [recalled] | native document scroll, interpolated by Lenis; `smooth` option gone (always on) |
| Markup | `data-scroll-container` + `data-scroll-section` required | neither required; any `data-scroll` under Lenis's root element |
| Sticky | `data-scroll-sticky` + `data-scroll-target` in JS | CSS `position: sticky` (the attribute is deprecated) |
| Options | `el`, `smooth`, `direction`, `lerp`, `multiplier`, `touchMultiplier`, `smartphone` / `tablet` objects, class options, `scrollbarContainer` | `lenisOptions.{wrapper, orientation, lerp, wheelMultiplier, touchMultiplier}`; class and scrollbar options removed |
| Events | `scroll.on('scroll' / 'call')`, ModularJS `data-scroll-call="fn, Module"` | `scrollCallback` option; `data-scroll-call` / `data-scroll-event-progress` dispatch CustomEvents on `window` |
| Gone | — | `data-scroll-delay`, `data-scroll-direction`, `data-scroll-target`, custom scrollbar, `init()` |
| Refresh | `update()` | `resize()`, "rarely needed" (Lenis's ResizeObserver hooks call it) |
| Parallax | arbitrary speed units | `displacement = progress × containerSize × speed × -1`; off on touch devices by default |
| ScrollTrigger | needs `ScrollTrigger.scrollerProxy` on the container [recalled] | document scrolls, so the default scroller works; sync on the scroll event [inferred: source] |

What this means for reading the corpus:
- A v4 smooth site is a **virtual float** in our scroll-model vocabulary, not "native + smooth library". `position: sticky`, find-in-page, the native scrollbar and `window.scrollTo` do not behave; the capture must drive it with `scrollMode: wheel` [recalled for v4 internals; the likova card records exactly this].
- v4 option names in a bundle (`smartphone`, `tablet`, `firefoxMultiplier`, `smooth:!0`) date the build to v4 without a version string; `lenisOptions`, `scrollCallback`, `data-scroll-css-progress` or `initCustomTicker` date it to v5 [verified: v5 names from tarball; v4 names from the likova bundle read].
- A v5 site is scroll philosophy (a) wearing an attribute API: translate it to Lenis + ScrollTrigger (or CSS) when taking a principle, and read `data-scroll-speed` values through the v5 formula, not v4 intuition.

## The API surface we use
Constructor options [verified: tarball, dist/types/types.d.ts + index.d.ts; defaults from the 5.0.1 bundle]:
| Option | Default | Use |
|---|---|---|
| `lenisOptions` | `{}` | passed straight to `new Lenis(...)`; every Lenis 1.3.17 option lives here |
| `triggerRootMargin` | `'-1px -1px -1px -1px'` | IntersectionObserver margin for class / call triggers |
| `rafRootMargin` | `'100% 100% 100% 100%'` | IO margin that subscribes progress / speed elements to the frame loop |
| `autoStart` | `true` | `false` defers the loop until `start()` [verified: Context7, options.md] |
| `scrollCallback` | noop | bound to Lenis `'scroll'`; receives the Lenis instance (`scroll`, `limit`, `velocity`, `direction`, `progress`) |
| `initCustomTicker` / `destroyCustomTicker` | unset | hand the render function to an external clock; declare both or it warns [verified: Context7 + tarball] |

Instance [verified: tarball, index.d.ts]:
- `lenisInstance`: the `Lenis`, created synchronously in the constructor. The attribute core is created one `requestAnimationFrame` later, and the loop starts there [inferred: source].
- `start()` / `stop()`: start or stop both Lenis and the loop.
- `scrollTo(target, { offset, lerp, duration, immediate, lock, force, easing, onComplete })`: a straight pass-through to Lenis; target is a number, element or selector.
- `resize()`, `destroy()`, `addScrollElements(container)` / `removeScrollElements(container)` for page transitions that swap a container.
- Each frame calls `lenis.raf(Date.now())` and ignores the time the ticker hands in [verified: tarball, `_onRender`].

Attributes [verified: Context7, attributes.md; defaults and edge behaviour from the tarball]:
- `data-scroll`: opt in. Adds `is-inview` (or `data-scroll-class`) when progress is inside (0, 1).
- `data-scroll-offset="start, end"` in px or `%` of the viewport; default `0,0`.
- `data-scroll-position="start, end"`, each `start | middle | end`; default `start,end`. Elements already in the first viewport use a `fold` start at 0 unless `data-scroll-ignore-fold`.
- `data-scroll-repeat`: without it, the class stays and no `leave` call fires [verified: tarball, `setOutOfView` returns early].
- `data-scroll-call="name"`: `window` CustomEvent `name`, `detail: { target, way: 'enter' | 'leave', from: 'start' | 'end' }`.
- `data-scroll-css-progress`: writes `--progress` (0..1) on the element.
- `data-scroll-event-progress="name"`: `window` CustomEvent `name`, `detail: { target, progress }`, on every progress change.
- `data-scroll-speed="n"`: `translate3d` parallax per the v5 formula; skipped on touch devices (`'ontouchstart' in window || maxTouchPoints > 0`) unless `data-scroll-enable-touch-speed`.
- `data-scroll-to` on a link, with `data-scroll-to-href`, `-offset`, `-duration`: click scrolls through Lenis. Offset and duration go through `parseInt`, so `data-scroll-to-duration="1.5"` runs for 1 s [verified: tarball].
- The root gets `data-scroll-orientation="vertical|horizontal"` [verified: tarball].

## Integration with the others
```js
// One clock: GSAP's ticker drives Locomotive, ScrollTrigger reads the scroll event.
// Ticker hooks [verified: Context7, options.md]; ScrollTrigger.update wiring [inferred: source, scrollCallback is Lenis 'scroll'].
const loco = new LocomotiveScroll({
  scrollCallback: ScrollTrigger.update,
  initCustomTicker: (render) => gsap.ticker.add(render),
  destroyCustomTicker: (render) => gsap.ticker.remove(render),
});
gsap.ticker.lagSmoothing(0);
window.lenis = loco.lenisInstance;   // lets recipes/_shared/awards-hook.js scrollTo({ immediate, force }) as with plain Lenis [inferred]
```
- Everything in `lenis-1.3.md` about the Lenis instance applies to `loco.lenisInstance`, minus the options 1.3.17 does not have (at least `respectReducedMotion`) [verified: tarball].
- Page transitions (Taxi, Barba): `removeScrollElements(old)` in the leave hook, `addScrollElements(new)` after the swap, `scrollTo(0, { immediate: true })`, then `ScrollTrigger.refresh()` [verified: method names; order inferred].
- Three / OGL: read `loco.lenisInstance.scroll` and `.velocity` in the same ticker callback, as with plain Lenis.
- Migrating off it: `data-scroll-css-progress` → a ScrollTrigger `onUpdate` writing the same `--progress`, or CSS `animation-timeline: view()`; `data-scroll-call` → `onEnter` / `onLeave`; `data-scroll-speed` → a scrubbed `yPercent` tween. Keep the CSS; replace the attribute engine [recipe:boot-lenis-gsap].

## Reduced motion and accessibility hooks
Nothing built in: Lenis 1.3.17 predates `respectReducedMotion` and Locomotive adds no check of its own [verified: tarball]. Under reduced motion, either `lenisOptions: { lerp: 1, smoothWheel: false }` (unverified that this fully restores native feel) or skip constructing it and let the page scroll natively; the in-view classes then need a static fallback in CSS [unverified]. v5 keeps the native scrollbar and keyboard scrolling because the document scrolls [verified: README "native scrollbar, keyboard navigation"]; v4 smooth mode did not [recalled].

## Performance rules
Two IntersectionObservers gate work: only elements inside `rafRootMargin` (one viewport either side) are updated per frame [verified: tarball]. Pure class toggles (`data-scroll`, no progress, no speed) never join the frame loop [inferred: `_checkRafNeeded`]. Parallax writes inline `transform` every frame on subscribed elements; keep speed elements few, and do not also tween their `transform` from GSAP.

## Gotchas
- Reading a v4 card as if it were v5, or the reverse: check the option names before the version string.
- A second Lenis beside it. `loco.lenisInstance` *is* the Lenis; creating another fights it for the wheel.
- No custom ticker → Locomotive runs its own rAF next to GSAP's: two clocks, the drift the Lenis note forbids.
- `require()` fails in 5.0.1 (missing CJS entry); SSR code paths that `require` it break [verified: tarball].
- The core arrives a frame after the constructor: querying classes or calling `addScrollElements` synchronously after `new` does nothing yet [inferred: source].
- `data-scroll-call` without `data-scroll-repeat` fires `enter` once and never `leave`.
- Touch devices silently drop parallax; a phone capture shows static layers unless the site opted in.

## Where the corpus used it
- [site:likova]: Locomotive Scroll **v4** smooth mode (`smooth:!0`, also on phones via `smartphone:{smooth:!0}`, `lerp .1`, `firefoxMultiplier 50`, tablet breakpoint 768), `data-scroll-sticky` stages and a site-written snap engine; classified as a virtual float and captured with `scrollMode: wheel`. Exact version unknown.
- [site:trevor-noah]: Locomotive Scroll **5.0.0** riding Lenis 1.3.17 inside a Webflow shell's ESM engine, beside GSAP ScrollTrigger; 50 `data-scroll` elements, 9 progress-driven, `data-scroll-speed ±0.05`, the wordmark driven by `data-scroll-css-progress`; native document scroll (`scrollMode: native`). Given the hard-coded version global above, 5.0.0 vs 5.0.1 is [unknown] unless the card read it from elsewhere.
- [site:oryzo] records it as absent from the served bundle.
