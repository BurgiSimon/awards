# smooothy 0.0

<!-- Labels: [verified: tarball] = read from `npm pack smooothy@0.0.35` (readme.md, dist/index.d.ts, dist/esm.js), 2026-09 · [verified: Context7] = `/vallafederico/smooothy` (readme.md, docs/extend.md, docs/api.md), 2026-09 · [inferred: source] = read off dist/esm.js behaviour, not documented · [recalled] · [unverified]. Where the README and the 0.0.35 source disagree, the source wins and the conflict is named. -->

## What it is for in this skill set
A small, framework-agnostic slider core by Federico Valla: a flex row (or column) of slides moved by `translateX/Y`, with drag, touch swipe, trackpad input, momentum, snapping, infinite wrap and per-slide `parallaxValues` [verified: tarball readme]. The README says it was made because other sliders synced badly with WebGL [verified: Context7 readme]. In this skill set it is the pointer-first engine for the **draggable carousel or rail** in `[pattern:components-catalog#infinite-draggable-plane-and-arc-gallery]`, when you would otherwise hand-roll `utils.wrap` + damping as [site:animejs] and [site:floema-jewelry] did. It is not a page scroller and never replaces Lenis: the document keeps scrolling natively, the slider owns only its own row. A scroll-scrubbed sideways track stays `[recipe:horizontal-rail]`; reach for smooothy only when the gesture is drag or swipe, not page scroll.

## Install (pinned)
```sh
npm i -E smooothy@0.0.35      # 0.0.x: no semver promise, pin exactly
```
```js
import Core, { damp, lerp, symmetricMod } from 'smooothy';   // the only exports in 0.0.35 [verified: tarball dist/esm.js]
```
One runtime dependency, `virtual-scroll@^2.2.1`, bundled into `dist/esm.js` (18.4 kB, minified) [verified: tarball]. MIT [verified: npm]. It is not in `references/stacks/versions.md` yet; add a row there before a recipe or scaffold depends on it. The README lists premade `KeyboardSlider`, `LinkSlider` and `ControlSlider` exports [verified: Context7 readme], but 0.0.35 exports none of them [verified: tarball]; they exist only as copy-paste examples in `docs/extend.md` [verified: Context7].

## The API surface we use
Constructor: `new Core(wrapper, config)`. Every child of `wrapper` is a slide, so put nothing else inside [verified: tarball readme + d.ts]. The README's "Smarter usage" passes `super({ wrapper, config })`. That is wrong for 0.0.35: the signature is `(wrapper, config)` [verified: d.ts].

| Option | Default | Use |
|---|---|---|
| `infinite` | `true` | wrap with `symmetricMod`; items are re-translated, never cloned [inferred: source] |
| `snap` | `true` | settle on a slide; also a setter `slider.snap = false` |
| `variableWidth` | `false` | slides of their own CSS width, snapped to centre; **units switch to pixels** (see Gotchas) |
| `vertical` | `false` | column slider; CSS must be `flex-direction: column` + fixed height |
| `lerpFactor` | `0.3` | used as `damp(current, target, 1 / lerpFactor, dt)` [verified: source]. The README says "lower = smoother", but the source makes a lower value **snappier** |
| `snapStrength` | `0.1` | per-frame pull of `target` to the nearest slide |
| `speedDecay` | `0.85` | per-frame decay of `speed` |
| `dragSensitivity` | `0.005` | slide units per drag pixel (ignored when `variableWidth`) |
| `scrollSensitivity` | `1` | trackpad/wheel multiplier |
| `scrollInput` | `false` | `false`: a horizontal slider reads only `deltaX` (sideways trackpad swipes), so vertical wheel passes on to the page. `true`: the dominant axis drives it, which means a vertical wheel over the row moves the slider [verified: source] |
| `bounceLimit` | `1` | overscroll when not infinite |
| `setOffset(viewport)` | item size | where a finite slider ends |
| `virtualScroll` | `{ mouseMultiplier: .5, touchMultiplier: 2, firefoxMultiplier: 30, useKeyboard: false, passive: true }` | passed to virtual-scroll; keep `useKeyboard: false` (see Gotchas) |
| `onSlideChange(cur, prev)`, `onResize(core)`, `onUpdate(core)` | — | callbacks; `onUpdate` runs at the end of each `update()` |
All defaults: [verified: tarball readme table and `dist/esm.js` defaults object].

Instance [verified: d.ts + readme unless noted]:
- `update()`: one frame. It **takes no time argument** and computes `deltaTime` from its own `performance.now()` [verified: source]. It returns early while `isVisible` is false (an IntersectionObserver with a 50px root margin) or after `kill()`.
- `goToNext()`, `goToPrev()`, `goToIndex(i)`; `target` / `current` getters and setters: setting `target` glides there, setting both jumps (`slider.current = slider.target = x`).
- `currentSlide`, `progress` (0..1), `getProgress()`, `speed`, `deltaTime` (seconds), `parallaxValues[]`, `viewport { itemWidth, wrapperWidth, totalWidth, itemHeight, wrapperHeight, totalHeight, vertical }`, `isVisible`, `isDragging`, `items`.
- `paused = true|false`: ignores drag, touch and wheel input (the touch handler returns before its `preventDefault`) [verified: source]. `kill()`: stops `update()`, clears inline transforms, resets position to 0. `init()`: resumes after `kill()`. `resize()`: re-measures; a ResizeObserver on the wrapper already calls it, debounced 10 ms [verified: source]. `destroy()`: see Gotchas.

## Integration with the others
One clock. `update()` ignores the caller's time, so subscribe it to whichever ticker the page already runs and discard the ticker's `dt`. The upstream examples do exactly this with `gsap.ticker.add(this.update.bind(this))` [verified: Context7 docs/extend.md].
```js
// Lenis page (the plugin default): one GSAP tick drives scroll, slider, then render [recipe:boot-lenis-gsap]
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);        // Lenis 1.3, autoRaf: false
  slider.update();               // reads its own performance.now()
  // gl: read slider.current / parallaxValues here, then renderer.render(...)
});
```
```js
// No GSAP: the shared ticker in recipes/_shared/raf.js
import { ticker } from '../_shared/raf.js';
ticker.add(() => slider.update());   // (dt, t) are ignored; raf.js pauses on hidden tabs, so does the slider
```
- **Lenis coexistence.** They share no state. Lenis smooths wheel on the window. smooothy listens for wheel and touch on its own wrapper, passively, and never calls `preventDefault` on wheel [verified: source]. With `scrollInput: false` (default) a vertical wheel over the row scrolls the page through Lenis, and a sideways trackpad swipe moves the slider. Lenis ignores that swipe under `gestureOrientation: 'vertical'` [recalled medium]. This is the non-hijacking setup; keep it. With `scrollInput: true` **both** move on a vertical wheel. To give the row the wheel, add `data-lenis-prevent-wheel` on the wrapper and your own `wheel` listener with `{ passive: false }` that calls `preventDefault()` [unverified in this pass]. Doing so is scroll-jacking, so it needs a reason (`[pattern:accessibility-and-reduced-motion#scroll-jacking-rules]`).
- **Touch.** A window `touchmove` with `{ passive: false }` calls `preventDefault` only once a swipe resolves to the slider's own axis past 5 px, so vertical page swipes stay native [verified: source]. The plugin still swaps drag rails to native overflow on a coarse pointer (`[pattern:responsive-strategy#coarse-pointer-swaps]`); see below.
- **WebGL.** Tether planes to the slides as in `[recipe:gl-dom-tethered-planes]`. Read `slider.current`, `speed` or `parallaxValues` in the same tick, after `update()` and before `render()`. There is no separate smooothy loop to drift against.
- **Subclass callbacks.** Define `onUpdate` / `onSlideChange` / `onResize` as arrow **fields** (`onUpdate = (core) => {…}`) or pass them in config. A prototype *method* named `onUpdate` is never called. `Core` declares `onUpdate;` as a class field, and that own property shadows the subclass method [verified: source + node check]. The README's `onUpdate({ parallaxValues }) {…}` examples use the broken form; `docs/extend.md` uses the working one [verified: Context7].
- **Captures.** `window.__awards.scrollTo` drives the page, not the row. For a deterministic slider state, jump with `slider.current = slider.target = -i` in a capture action. That form holds when `variableWidth` is false; with `variableWidth: true` the value is pixels.
- **Custom cursor.** The constructor writes `wrapper.style.cursor = 'grab'` and drag toggles `'grabbing'` inline [verified: source]. Under `[recipe:cursor-two-speed]` the inline style beats the stylesheet, so override it with `!important` or clear it after each change.

## Reduced motion and accessibility hooks
smooothy has no reduced-motion branch: no `matchMedia` anywhere in 0.0.35 [verified: source]. Map it onto the three tiers in `recipes/_shared/reduced-motion.js` the same way `[recipe:horizontal-rail]` already does (`[pattern:accessibility-and-reduced-motion#reduced-motion-tiers]`):
```js
import { motionTier, onMotionTierChange } from '../_shared/reduced-motion.js';
const coarse = matchMedia('(pointer: coarse)');
const apply = () => {
  const native = motionTier() !== 'full' || coarse.matches;   // reduced, static and touch → native scroller
  wrapper.classList.toggle('is-native', native);               // CSS: overflow-x:auto; scroll-snap-type:x mandatory
  slider.paused = native;                                      // stops its touch preventDefault
  native ? slider.kill() : slider.init();                      // kill() clears the inline transforms
  wrapper.style.cursor = native ? '' : 'grab';
};
apply(); onMotionTierChange(apply); coarse.addEventListener('change', apply);
```
This pattern follows from reading the source [inferred: source]. `kill()` resets to slide 0, so returning to `full` starts from the first slide again. Raising `lerpFactor`'s speed and `snapStrength: 1` does **not** give a clean reduced tier: a snap strength of 1 resets small trackpad deltas every frame, so the row never advances [inferred: source].

Keyboard: `Core` has no key handling in 0.0.35. The README's "keyboard navigation (ArrowLeft/ArrowRight)" line is not in the source [verified: tarball]. `virtualScroll.useKeyboard: true` binds `keydown` on `document` and turns arrows, Space and Page keys into deltas for the whole page, so leave it off. The extend.md `KeyboardSlider` listens on `window` [verified: Context7], which steals Space and arrows from the page whenever the row is visible. Instead, make the wrapper focusable (`tabindex="0"`, `role="region"`, `aria-roledescription="carousel"`, a label). Handle ArrowLeft/Right with `goToPrev/Next` and Home/End with `goToIndex` on that element only, and keep slides as links in a list (`[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]`).

## Performance rules
No DOM reads in `update()` apart from the transform writes, and it idles off-screen through its own IntersectionObserver [verified: source]. Leave it subscribed rather than adding and removing it on scroll. Every instance adds window `mousemove`, `mouseup`, `touchmove` (non-passive) and `touchend` listeners. Keep one instance per rail, not one per card.

## Gotchas
- **Frame-rate-dependent parts.** `current` damps on real `deltaTime`, but `snapStrength` and `speedDecay` apply once per `update()` call [verified: source]. On a 120 Hz screen, or with `update()` subscribed to two tickers, the snap settles about twice as fast. Subscribe it exactly once.
- **Units.** With `variableWidth: false`, `target`/`current` are in slide units and **negative** (`goToIndex(i)` sets `target = -i`). With `variableWidth: true` they are pixels [verified: source]. The README's `slider.target = 5 // Lerp to slide 5` has the sign wrong.
- **Jumps after idle.** After the row was off-screen or the tab hidden, the first `update()` sees a large `deltaTime` and `current` lands on `target` in one frame [inferred: source]. This is harmless unless a velocity effect reads `speed` on that frame.
- **`destroy()` leaks in 0.0.35.** It removes freshly created arrow functions, so the window listeners stay attached. The wrapper's ResizeObserver is never disconnected, and virtual-scroll is destroyed only when `scrollInput` is true [verified: source]. For SPA page transitions (`[recipe:page-transitions]`), call `slider.kill()`, then `slider.destroy()`, then `slider.virtualScroll?.destroy()`. The window listeners are private closures and cannot be removed from outside. They return early when idle, but they retain the instance: a known ceiling until upstream fixes it.
- **Measure after fonts and images.** The ResizeObserver watches only the wrapper, so slides that change width inside a fixed wrapper (late images, `document.fonts.ready`) need a manual `slider.resize()` [inferred: source].
- **Clicks after drag.** Nothing suppresses the `click` that follows a drag on a link inside a slide, and `mousedown` does not prevent native image and link dragging [inferred: source]. Add `draggable="false"` on images and links, and cancel the click when `Math.abs(dragDistance) > 5`. `LinkSlider` in extend.md is the upstream answer [verified: Context7 readme, table only].
- **Focus inside `overflow: hidden`.** Tabbing to an off-screen slide lets the browser set the wrapper's `scrollLeft`, which stacks on top of the transforms [inferred]. On `focusin`, call `goToIndex(i)` and reset `wrapper.scrollLeft = 0`.
- **No gaps.** CSS `gap` is not measured. Pad a full-width child by half the gap and put the visual slide inside it [verified: tarball readme].
- **README and source disagree** on exports, keyboard handling, the `lerpFactor` direction and the `super()` signature (all above). Trust `dist/index.d.ts` and `dist/esm.js` for 0.0.35, and re-read them before any bump.

## Where the corpus used it
No corpus card uses it. `references/sites/` has no mention of smooothy (grep, 2026-09), so no `[site:]` evidence exists. The draggable carousels in the corpus were hand-rolled: [site:animejs] (`utils.wrap`, auto-speed tweened to 0 on grab), [site:floema-jewelry] (infinite recycled plane) and [site:leo-parpeix] (a drag-badged carousel, library [unknown]). Outside the corpus, the README credits Siena Film Foundation (siena.film) as a production use [verified: tarball readme]; no card has analysed it.
