# virtual-scroll 2.2

<!-- Labels: [verified: tarball] = read from `npm pack virtual-scroll@2.2.1` (README.md, src/index.js, src/support.js, src/keycodes.js, lib/virtualscroll.js, package.json), 2026-09 · [verified: npm] = `npm view` · [verified: lenis.mjs] = `recipes/node_modules/lenis/dist/lenis.mjs` and `lenis.d.ts` at 1.3.26 · [recalled] · [unverified]. Context7 has no entry for this package (the search returns TanStack Virtual and vue-virtual-scroller), so every API claim below is from the tarball. -->

## What it is for in this skill set
A 2 kB input normaliser: it listens to wheel, touch and arrow/Space keys and emits deltas. It moves nothing, has no clock, no easing, no clamp and no inertia [verified: tarball]. You own the float, the damping and the render. That makes it a delta source for scroll philosophy (b), the virtual float of a canvas-first page that never scrolls its document [pattern:motion-vocabulary] [recipe:gl-virtual-scroll-camera]. It is the opposite of [Lenis](lenis-1.3.md), which scrolls the real document and keeps sticky, find-in-page and ScrollTrigger working.

In practice you meet it inherited rather than chosen. It sits inside the Siena roll [site:siena], inside smooothy (`virtual-scroll@^2.2.1` is its one runtime dependency, see [smooothy-0.0.md](smooothy-0.0.md)) and inside Locomotive Scroll v4 [recalled; the README names locomotive-scroll as a library built on it]. For a new build, the default is the hand-written input block of [recipe:gl-endless-reel-sheets] or Lenis's own `virtual-scroll` event (see the decision section below).

## Install (pinned)
```sh
npm i virtual-scroll@2.2.1
```
```js
import VirtualScroll from 'virtual-scroll';
```
- 2.2.1 is `latest` and was published 2022-01-18. The package has had no release since [verified: npm]. Treat it as frozen.
- `main` is `lib/virtualscroll.js`, a microbundle UMD build with `tiny-emitter` inlined. It has no `module`, `exports` or `types` field [verified: tarball]. `require()` returns the class itself [verified: tarball, run under Node]. Vite and esbuild reach it through CommonJS interop, so the default import works [inferred]. `src/index.js` uses private class fields and class-property arrows, but the published UMD build is what bundlers load [verified: tarball].
- No bundled types. `@types/virtual-scroll` is at 2.0.3 [verified: npm] and was written for the 2.0 API [unverified that it matches 2.2].
- It is not in `references/stacks/versions.md`. Add a row there before a recipe or scaffold depends on it.

## The API surface we use
Constructor `new VirtualScroll(options)` [verified: tarball, README and src/index.js defaults]:
| Option | Default | Use |
|---|---|---|
| `el` | `window` | target for wheel and touch listeners. Keys always bind on `document`, whatever `el` is |
| `mouseMultiplier` | `1` | multiplies every wheel delta, Firefox included |
| `touchMultiplier` | `2` | multiplies finger travel per `touchmove` |
| `firefoxMultiplier` | `15` | applied only when the browser is Firefox (UA sniff) **and** `deltaMode === 1` (lines), before `mouseMultiplier` |
| `keyStep` | `120` | px per arrow press |
| `preventTouch` | `false` | `preventDefault()` on `touchmove` unless the target carries `unpreventTouchClass` |
| `unpreventTouchClass` | `'vs-touchmove-allowed'` | exempt class. It is checked on `e.target` only, never on ancestors |
| `passive` | `undefined` | if set, `{ passive }` is passed to the wheel, mousewheel, touchstart and touchmove listeners, all four together |
| `useKeyboard` | `true` | binds `keydown` on `document` |
| `useTouch` | `true` | binds `touchstart` / `touchmove` |

Instance API [verified: tarball]:
- `vs.on(cb, ctx)`: the DOM listeners bind lazily, when the first callback is added. `vs.off(cb, ctx)` unbinds them when the last one goes. `vs.destroy()` drops every callback and unbinds.
- Event payload: `{ x, y, deltaX, deltaY, originalEvent }`. `x`/`y` are running sums of every delta since construction. There is no setter and no reset, so keep your own target and ignore them in a clamped or wrapped reel.

How the deltas are made [verified: src/index.js]:
- **Sign.** `deltaY > 0` means the user scrolled **up / back**. Wheel is `e.wheelDeltaY || e.deltaY * -1`, touch is `(pageY − lastPageY) × touchMultiplier`, and keys give `+keyStep` for ArrowUp. The README example writes `translateY(event.y)`. Lenis's `virtual-scroll` event uses the opposite sign (`deltaY > 0` is forward) [verified: lenis.mjs].
- **Wheel magnitude differs by browser.** Where the non-standard `wheelDeltaY` exists (Chromium, WebKit) it is used as is. Elsewhere it is the negated standard `deltaY`. `deltaMode` is honoured only in Firefox line mode, and page mode (`deltaMode === 2`) is never scaled. A legacy `mousewheel` listener is also bound where `onmousewheel` exists. Blink and WebKit fire the legacy listener only when the target has no `wheel` listener, so one callback per wheel event is expected [recalled].
- **Touch.** It reads only `targetTouches[0]`, so a pinch reads as a drag. It has no `touchend` handler, so a release produces no fling. Any inertia after a swipe is yours to write.
- **Keys** (`keyCode`, deprecated but still dispatched): ArrowUp and ArrowLeft give `deltaY = +keyStep`, ArrowDown and ArrowRight give `−keyStep`, Space gives `∓(innerHeight − 40)` (Shift reverses it). Left and Right land on `deltaY`, never `deltaX`. PageUp, PageDown, Home and End do nothing. Modifiers are not filtered, focus inside `input`, `textarea` or a button is not checked, and `preventDefault()` is never called on keys [verified: src/index.js, src/keycodes.js].

## Integration with the others
```js
// A modulo-wrapped reel fed by virtual-scroll: deltas in, your own float out [pattern shape from recipe:gl-endless-reel-sheets]
const vs = new VirtualScroll({ el: stage, mouseMultiplier: .5, touchMultiplier: 2, useKeyboard: false, passive: false });
vs.on(({ deltaY, originalEvent }) => {
  originalEvent.preventDefault?.();                 // needs passive: false (see Gotchas)
  target -= deltaY / pitch;                         // flip the sign: virtual-scroll is +up, the reel counts forward
});
gsap.ticker.add((_, dt) => {                       // one clock: the GSAP ticker or recipes/_shared/raf.js
  offset += (target - offset) * (1 - Math.pow(1 - .1, dt / 16.67));   // framerate-independent damping
  const d = ((i - offset + N / 2) % N + N) % N - N / 2;              // per item: nearest copy on the loop
});
```
- Siena's roll numbers are a starting point: `mouseMultiplier .5`, `touchMultiplier 5.5`, target `+= delta × .001`, lerp `.1`, snap threshold `.25` [site:siena] (that the two multipliers are passed to virtual-scroll is [inferred] from the bundle).
- Beside Lenis on the same page: build the virtual-scroll instance on the route that stops the document and `destroy()` it in the page transition's leave hook. Otherwise both libraries read the same wheel [recipe:page-transitions].
- Capture and verification: `window.__awards.scrollTo(p)` must write the virtual target, because the document never scrolls. The reel recipe does this [recipe:gl-endless-reel-sheets].

## Which input layer for a modulo-wrapped virtual reel
| Situation | Use | Why |
|---|---|---|
| New build, reel is the page | hand-written listeners, as in [recipe:gl-endless-reel-sheets] | about 40 lines. `deltaMode` is scaled in every browser, `wheel` is `{ passive: false }` with a real `preventDefault`, and it has proper keys (Page, Home/End, modifier and text-field filters, Space left to focused buttons), a `touchend` for swipe steps and the reduced tier's one-step-per-gesture. virtual-scroll covers none of these |
| Lenis already runs the site, one route is a reel | `lenis.on('virtual-scroll', ({ deltaX, deltaY, event }) => …)` plus `lenis.stop()` on that route | the event is emitted **before** Lenis checks `isStopped`, and a stopped Lenis calls `preventDefault()` on cancelable events [verified: lenis.mjs]. Payload key is `event` (not `originalEvent`). `deltaMode` is scaled (lines × 100/6, pages × viewport), `deltaY > 0` is forward, and `touchend` re-emits the last delta for a fling [verified: lenis.mjs]. The `virtualScroll(data) => false` option filters input before Lenis acts [verified: lenis.d.ts]. No keys: add your own |
| Inheriting Siena-style code, smooothy or Locomotive v4 | keep virtual-scroll, set `useKeyboard: false`, add your own keys | replacing a working engine is not the job. Removing the document-wide key hijack is |
| Document should scroll | none of these: [Lenis](lenis-1.3.md) | a virtual reel is only for a page that is a world, never for a document ([site:igloo], [site:why-zero]) |

Never run two delta sources on the same input: virtual-scroll and Lenis's `virtual-scroll` event on one wheel double the travel.

## Reduced motion and accessibility hooks
The package has no `prefers-reduced-motion` branch and no focus handling [verified: tarball]. Every cost of a non-scrolling document is yours [pattern:accessibility-and-reduced-motion#scroll-jacking-rules]:
- **Keyboard.** Its key map is incomplete and document-wide (above). With `useKeyboard: true`, Space inside a form field or on a focused button also moves the reel. Set `useKeyboard: false` and bind keys yourself [pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates].
- **Focus and screen readers.** Tabbing to an item off-stage does not bring it into view, and a screen reader's virtual cursor does not either. Keep a real list of items (buttons or links) and make focus call `goTo(i)`. Mark the canvas `aria-hidden` and put the DOM mirror beside it [pattern:accessibility-and-reduced-motion#the-dom-mirror].
- **Lost browser features.** Find-in-page, the scrollbar, anchors, scroll restoration and middle-click autoscroll stop working. Add a visible "n of N" position and an index.
- **Zoom and reflow.** A `100svh` `overflow: hidden` stage clips content at 400 % zoom. Give the static tier an ordinary scrolling page.
- **Reduced motion.** Snap one item per gesture, no easing, no velocity smear. Siena shipped none of this and fails both reduced motion and keyboard [site:siena]. [recipe:reduced-motion-switch] holds the three tiers.

## Performance rules
Per event it is cheap: one object allocation per emit and no layout reads [verified: src/index.js]. The cost is in your callback, so write the target there and render only on the ticker, never in `on()`. Leave `passive` unset only if you never need `preventDefault`. Set `touch-action: none` in CSS on the stage rather than paying for `preventTouch` [recalled].

## Gotchas
- **`preventTouch` can silently do nothing.** With the default `el: window` and `passive` unset, Chromium treats `touchmove` on window/document/body as passive, and `wheel` there too, so `preventDefault()` is ignored with a console warning [recalled: browser intervention]. Pass `passive: false` explicitly, or use `touch-action: none` on the stage.
- `passive: true` kills `preventTouch` and any `originalEvent.preventDefault()` in your callback.
- **It never cancels wheel.** If the document can still scroll, it scrolls natively under your reel. Lock the stage (`overflow: hidden`, a fixed `100svh` height) or cancel in the callback with `passive: false`.
- `vs-touchmove-allowed` must sit on the exact touched element. A nested scroller's children do not inherit the exemption.
- Sign inverted against Lenis and against `WheelEvent.deltaY`. Negate once at the boundary and comment it.
- Magnitudes differ between Chromium and Firefox (`wheelDeltaY` vs `deltaY`), and only Firefox line mode is boosted. Tune `mouseMultiplier` on both browsers, with a mouse and with a trackpad.
- Touch has no release event: a swipe stops dead unless you add inertia from your own velocity.
- `x`/`y` accumulate forever and cannot be reset. Do not use them as the reel position.
- Keys bind on `document` even when `el` is a single stage, and they stay bound until the last `off()` or `destroy()`. Call `destroy()` in every SPA leave hook.
- Firefox detection is a user-agent sniff (`navigator.userAgent.indexOf('Firefox')`) [verified: src/support.js].

## Where the corpus used it
[site:siena]: the only card with the package itself. The film-strip roll reads wheel and touch through virtual-scroll (`vs-touchmove-allowed`, `useKeyboard`, `firefoxMultiplier:15` in app.js), next to a bundled Lenis 1.1.16 whose route is [unknown] and GSAP Observer. It feeds its own modulo-wrapped, snapping roll engine [verified: site card]. The package version there is [unknown].

Not the package, though the name appears:
- [site:lama-lama]: its `virtual-scroll` emitter string is Lenis's internal input module, which has the same name [inferred: the card lists it as Lenis evidence].
- [site:slosh-seltzer]: its `virtualScroll` / `smoothScroll` flags drive its own `ScrollController` [inferred].
- [site:igloo], [site:why-zero]: they hand-roll the virtual float that [recipe:gl-virtual-scroll-camera] generalises.
