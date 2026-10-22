# Rive 2.42 (`@rive-app/canvas`)

<!-- Labels: [verified: d.ts] = `rive.d.ts`, `semantics/types.d.ts`, `runtimeLoader.d.ts` from `npm pack @rive-app/canvas@2.42.2`, read 2026-10-22 · [verified: source] = `rive.js` of the same tarball, read 2026-10-22 · [verified: rive-docs] = Context7 `/rive-app/rive-docs` (web runtime, canvas vs WebGL2, data binding, semantics, low-level API), read 2026-10-22 · [verified: changelog] = rive-wasm `CHANGELOG.md`, entries 2.42.2 to 2.45.0, read 2026-10-22 · [verified: npm pack] = sizes measured with `gzip -9` on the packed files, 2026-10-22 · [inferred] · [unverified]. Registry: 2.42.2 published 2026-09-16; latest 2.45.0, published 2026-10-17. Site facts keep their card's own label. -->

## What it is for in this skill set
Designer-authored 2D vector graphics that hold **state**: a mascot that reacts, an icon that morphs between modes, a hamburger that knows it is open, a chapter scrubbed by scroll. The designer builds the artboard and its state machine in the Rive editor; the page only sets values (a progress, a hover flag, a click) and the state machine picks the motion, so a redesign of the graphic does not touch the JS. Not a scene engine, and not a typesetter: its text is invisible to assistive tech.

The pin is **2.42.2** (`versions.md`). Lando's bundle shipped `@rive-app/canvas-lite` 2.26.4 [site:lando-norris] [verified]; the API below is the 2.42.2 one.

## Install and package choice
```sh
npm i @rive-app/canvas@2.42.2
cp node_modules/@rive-app/canvas/rive.wasm public/rive/rive.wasm   # self-host the runtime binary (see Loading)
```
The package is a webpack UMD bundle (`main: rive.js`, no `exports` map); Vite pre-bundles it like any CommonJS dependency [verified: source].

| Package (same API) | Renderer | Gzipped runtime at 2.42.2 | Choose when |
|---|---|---|---|
| `@rive-app/canvas` (pinned) | browser Canvas2D | `rive.js` 101 KB + `rive.wasm` 797 KB [verified: npm pack] | several instances per page; no WebGL context budget to spend [verified: rive-docs] |
| `@rive-app/canvas-lite` | browser Canvas2D | `rive.js` 93 KB + `rive.wasm` 354 KB [verified: npm pack] | the files use no Rive Text, Layouts, Audio or Scripting; content using them simply does not appear [verified: rive-docs] |
| `@rive-app/webgl2` | Rive Renderer on WebGL2 | not measured | vector feathering or exact editor fidelity is needed; each instance costs a WebGL context unless `useOffscreenRenderer: true` shares one [verified: rive-docs] |

Rive's docs recommend `webgl2` for most projects [verified: rive-docs]; this skill set pins `canvas` because the page's WebGL budget belongs to the main scene [pattern:webgl-architecture#dosage-ladder] and Canvas2D has no practical instance limit [verified: rive-docs]. Feathering does not render on Canvas2D yet [verified: rive-docs]: tell the designer before export.

## Loading a `.riv`
```js
import { Rive, RuntimeLoader, Layout, Fit, Alignment } from '@rive-app/canvas';

// Default WASM URL is unpkg, with a jsDelivr fallback [verified: source]. Self-host both: no third-party
// request before first paint, and a strict CSP needs only 'self' plus 'wasm-unsafe-eval' [inferred].
RuntimeLoader.setWasmUrl('/rive/rive.wasm');
RuntimeLoader.setWasmFallbackUrl(null);                  // null disables the fallback [verified: d.ts]

export function mountRive(canvas, { src, artboard, stateMachine, onReady }) {
  const r = new Rive({
    canvas, src, artboard, stateMachine,                 // one state machine per instance; the plural forms are deprecated [verified: d.ts]
    autoplay: true, autoBind: true,                      // autoBind binds the artboard's default view model instance [verified: d.ts]
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    isTouchScrollEnabled: true,                          // otherwise touch-drags on the canvas may not scroll the page [verified: d.ts]
    enableRiveAssetCDN: false,                           // default true: referenced assets load from Rive's CDN [verified: d.ts]
    onLoad: () => { r.resizeDrawingSurfaceToCanvas(Math.min(devicePixelRatio, 2)); onReady?.(r); },
    onLoadError: () => canvas.closest('[data-rive]')?.classList.add('is-static'),   // poster stays visible
  });
  return r;
}
```
- `src`, `buffer` (an `ArrayBuffer` you fetched) or `riveFile` (a `RiveFile` shared by several instances) are the three sources [verified: d.ts]. Share one `RiveFile` when the same `.riv` feeds a nav icon and a footer mark.
- `onLoad` is the readiness signal. Lando's boot awaits the `page-transition` file, then `Promise.all` of the GL load and an "all Rive loaded" event before init: real readiness, never a timer [site:lando-norris] [verified]. Gate `awards.ready()` on the same promise [recipe:preloader-counter-hold].
- Images, fonts and audio can be embedded or referenced and supplied through `assetLoader(asset, bytes)` [verified: d.ts]; referenced keeps the `.riv` small and the images in the project's pipeline [pattern:asset-pipeline#images].

## Driving it: inputs, or data binding
In 2.42.2 **state machine inputs are deprecated** in favour of data binding (view model properties); they still work and will be removed in a future major [verified: d.ts]. Text runs, Rive Events, state-change events, `scrub()` and named linear animations carry the same deprecation [verified: d.ts]. New files should be authored with view model properties; inherited files with inputs still play.

| Value the page sets | Input API (deprecated) | Data binding API |
|---|---|---|
| number (scroll progress, pointer x) | `r.stateMachineInputs('SM').find(i => i.name === 'progress').value = 42` | `r.viewModelInstance.number('progress').value = 42` |
| boolean (hover, open, theme) | same object, `.value = true` | `vmi.boolean('isOpen').value = true` |
| trigger (click, arrival) | `input.fire()` | `vmi.trigger('pop').trigger()` |
| nested artboard | `setNumberStateAtPath(name, value, path)` and siblings | a path string, `vmi.number('card/progress')` |
| read back a change | `EventType.StateChange` (deprecated) | `property.on(cb)` / `off(cb)` on the property [verified: d.ts] |

`stateMachineInputs(name)` returns `undefined` before the file loads [verified: d.ts]: look inputs up in `onLoad`, never at construction. All of the right-hand column is [verified: d.ts] and [verified: rive-docs].

### Scroll and pointer, on the one ticker
Rive owns its render loop; the page owns the values. ScrollTrigger and the GSAP ticker write a number, the state machine reads it on its next frame.
```js
// scroll: Lando drives a number 0→1000 with scrub .5 on [data-rive-scrolltrigger] [site:lando-norris] [verified]
function scrubRive(r, el) {
  const progress = r.viewModelInstance?.number('progress');          // or the deprecated input object
  if (!progress) return;
  return ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.5,
    onUpdate: (self) => { progress.value = self.progress * 100; } });   // range is whatever the designer keyed
}
// pointer: damp on the shared ticker, write once per frame [recipe:boot-lenis-gsap]
const look = r.viewModelInstance.number('lookX'); const target = { x: 50 };
const toX = gsap.quickTo(target, 'x', { duration: 0.4, ease: 'power3' });
el.addEventListener('pointermove', (e) => { const b = el.getBoundingClientRect(); toX(((e.clientX - b.left) / b.width) * 100); });
gsap.ticker.add(() => { look.value = target.x; });
// boolean and trigger: hover/focus parity, and a click
el.addEventListener('pointerenter', () => (r.viewModelInstance.boolean('hover').value = true));
button.addEventListener('focus', () => (r.viewModelInstance.boolean('hover').value = true));
button.addEventListener('click', () => r.viewModelInstance.trigger('pop').trigger());
```
- Rive Listeners (pointer logic authored inside the file) attach their own events to the canvas; `shouldDisableRiveListeners: true` turns them off when the page drives everything [verified: d.ts]. Keep one owner per gesture.
- Putting Rive itself on the GSAP ticker needs the low-level `@rive-app/canvas-advanced` loop (`stateMachine.advance(dt)`, `artboard.draw(renderer)`, `rive.resolveAnimationFrame()` after drawing) [verified: rive-docs]. Only worth it for a frame-locked composite with WebGL; otherwise accept Rive's loop and keep its inputs on the ticker [inferred].

## Layout, resize and DPR
| `Fit` [verified: d.ts] | Use |
|---|---|
| `Contain` | icons, mascots: never cropped |
| `Cover` | a full-bleed vector chapter |
| `Layout` | artboards built with Rive Layouts: the artboard is resized to the canvas box ÷ `layoutScaleFactor` [verified: source] |
| `FitWidth`, `FitHeight`, `Fill`, `None`, `ScaleDown` | rarely; `Fill` distorts |

`Alignment` is `Center` plus the eight edges and corners (`TopLeft` … `BottomRight`) [verified: d.ts].

- Change layout by assigning a new object: `r.layout = new Layout({ fit: Fit.Cover })`; layouts are immutable [verified: d.ts].
- `resizeDrawingSurfaceToCanvas(dpr?)` sets `canvas.width/height` from the CSS box × DPR and redraws; with no argument it uses raw `window.devicePixelRatio`, uncapped [verified: source]. Always pass the cap: `Math.min(devicePixelRatio, 2)` or the tier's `profile.dpr` [recipe:quality-tiers].
- The runtime watches the canvas only for a zero-size toggle (display none and back) [verified: source]; ordinary resizes are yours. One `ResizeObserver` on the wrapper, then `resizeDrawingSurfaceToCanvas(cap)`; never reload on a breakpoint [pattern:responsive-strategy#never-reload-at-a-breakpoint].
- 2.42.2 sets `artboard.width` inside `resizeDrawingSurfaceToCanvas` under `Fit.Layout` without checking that the artboard exists, so calling it before `onLoad` can throw; 2.43.1 added the check [verified: source, changelog]. Resize only after load.
- Size the canvas in CSS (`width: 100%; aspect-ratio: <artboard ratio>`) so the poster and the canvas share a box and nothing shifts on load.

## Clock, off-screen and teardown
- The loop re-arms `requestAnimationFrame` while any animation or state machine is playing, and draws only when the artboard changed (`DrawOptimizationOptions.DrawOnChanged` is the default) [verified: source]. A playing idle loop therefore still wakes every frame.
- Hidden tabs are handled: a `visibilitychange` listener cancels the frame and resets elapsed time so nothing jumps on return [verified: source].
- Off-screen is not. Pause it yourself:
```js
const io = new IntersectionObserver(([e]) => (e.isIntersecting ? r.play() : r.pause()), { rootMargin: '200px' });
io.observe(canvas);
```
  `pause()` also removes the Rive Listeners until `play()` [verified: source]; `stopRendering()` / `startRendering()` stop only the loop and keep state [verified: d.ts]. Mount far-away instances only near the viewport, the way Mindmarket lazy-loads Rive as its own chunk [site:mindmarket] [verified].
- Teardown on every route leave: `io.disconnect()`, kill the ScrollTrigger, `r.cleanup()`. `cleanup()` stops rendering, frees artboard, state machine and renderer instances, removes the resize observer, the listeners and the visibility handler, and hands back the instance's reference to its file [verified: source]. A `RiveFile` you constructed yourself is yours to `cleanup()` when the page that loaded it goes [verified: d.ts].

## Reduced motion
| Tier | Rive behaviour |
|---|---|
| full | autoplay; scroll and pointer write values |
| reduced | `autoplay: false`, `drawFrame()` in `onLoad` to paint one pose [verified: d.ts, method exists]; booleans and triggers that change *state* (open/closed, theme) still apply, scrubs and idle loops do not [pattern:accessibility-and-reduced-motion#reduced-motion-tiers] |
| static | no runtime at all: the poster `<img>` per instance |

Ask the designer for a "settled" view model value or state the page can jump to, so reduced is a designed frame and not whatever the entry state happens to be [inferred]. Shopify's Editions ship a desktop and a mobile fallback PNG beside every update's `.riv` [site:shopify-editions-w26] [verified]: that is the static tier, authored. Mindmarket's hero Rive plays identically under the media query [site:mindmarket] [verified]; do not copy that. Subscribe with `onMotionTierChange` and call `pause()` / `play()` when the preference flips [recipe:reduced-motion-switch].

## Accessibility: the canvas carries no text
A Rive canvas is pixels. Every word and every meaningful image in it needs a DOM twin [pattern:accessibility-and-reduced-motion#the-dom-mirror].
```html
<figure class="rive" data-rive>
  <img class="rive__poster" src="/rive/reef-poster.webp" alt="A reef of hand-drawn corals swaying" width="800" height="600">
  <canvas aria-hidden="true"></canvas>
  <figcaption class="sr-only">…the words the artboard animates…</figcaption>
</figure>
```
- Decorative: `aria-hidden="true"` on the canvas, the description on the `<img>` poster (kept in the DOM, faded under the canvas once loaded).
- Interactive: the control is a DOM `<button>` with the label and state (`aria-expanded`, `aria-pressed`); the canvas inside it is `aria-hidden`. Lando sets `aria-label="Open menu"` and `aria-expanded` from JS on its Rive hamburger [site:lando-norris] [verified]; a real `<button>` around the canvas gets keyboard and focus for free.
- Mindmarket ships thirteen Rive canvases with no accessible name and no fallback text, while the illustration is the brand [site:mindmarket] [verified]. That is the failure this section exists for.
- 2.42.2 has an **experimental** semantics mode (`semanticsMode: SemanticMode.Enabled`, `semanticsOptions.riveCanvasLabel`) that builds an accessibility DOM overlay from semantic roles authored in the file (button, link, slider, text field and others) [verified: d.ts, rive-docs]. It may change without a major bump [verified: d.ts]; treat it as an addition to the mirror, never a replacement, until a release drops the experimental flag [inferred].
- `tabIndex` on the constructor makes the canvas focusable when the file has focus nodes [verified: d.ts]; if you use it, give the canvas an accessible name too.

## Budget
- Runtime: about 0.9 MB gzipped for `canvas` (101 KB JS + 797 KB WASM), 0.45 MB for `canvas-lite` [verified: npm pack]. That is close to twice the ≈ 500 KB gz `three-0.186.md` allows a whole WebGL scene; load it as a lazy chunk when the first Rive section nears the viewport, never in the entry [pattern:asset-pipeline#staged-loading]. One runtime serves every instance on the page [verified: source, `RuntimeLoader` is static].
- Files: budget each `.riv` like an image, under ~150 KB for a UI icon set and ~400 KB for an illustrated chapter, with raster assets referenced rather than embedded [inferred]. Lando ships 8 files [site:lando-norris] [verified]; Mindmarket 13 [site:mindmarket] [verified]; Shopify Editions 27+ with a dedicated chunk [site:shopify-editions-w26] [verified]: count instances, not just bytes.
- One file, many artboards: Oryzo draws two artboards from one `oryzo.riv` [site:oryzo] [verified]; Lando keeps nav and button icons as artboards in one `btn-ui` file [site:lando-norris] [verified].
- Measure with `enablePerfMarks: true` (marks for load and the first three frames) or `enableFPSCounter()` [verified: d.ts].

## Rive, Lottie, or a GSAP/SVG build
| Need | Choose | Why |
|---|---|---|
| Motion with states and transitions the designer owns (idle → hover → pressed → done), interactive mascots | **Rive** | the state machine is authored; the page sets values [verified: rive-docs] |
| A linear After Effects piece scrubbed or parked by frame | **Lottie** (`lottie-web` 5.13) | frame addressing (`goToAndStop`) and a 47 KB gz light build, both measured in `stacks/lottie-web-5.13.md` |
| A logo, a line drawing, a morph, a counter, anything the DOM must also read | **GSAP + inline SVG** | text and paths stay in the DOM, no runtime beyond GSAP, theming by CSS tokens [recipe:scroll-drawn-svg-path] [inferred] |
| Many small looping icons in a grid | Rive `canvas` or CSS/SVG | Rive Canvas2D has no context limit [verified: rive-docs]; CSS is cheaper still for two-state icons [inferred] |
| A 3D object | neither | WebGL [pattern:webgl-architecture#dosage-ladder] |

Rule of thumb [inferred]: if the motion has a **graph** (states and conditions), Rive; if it has a **timeline** only, Lottie; if it has **words or a brand mark**, SVG. Under ~0.9 MB of runtime, Rive must earn its place more than once per page.

## Gotchas
- Two clocks: Rive's loop plus the GSAP ticker is acceptable; a third rAF loop for "smoothing inputs" is not. Damp on the ticker, write once [recipe:boot-lenis-gsap].
- `isTouchScrollEnabled` left false on a full-width canvas: the page may not scroll on a phone when the drag starts on it [verified: d.ts].
- A wrong state machine or animation name fails at runtime, not at build: Shopify Editions' capture logged "Animation with name autoplay not found" twice, mobile only [site:shopify-editions-w26] [verified]. Assert the names against `r.contents` (artboards, state machines, inputs) in the build's verify step [verified: d.ts, `contents`].
- Mindmarket marks instances `data-disable-firefox-renderer`, implying a per-browser renderer switch [site:mindmarket] [verified]; Oryzo serves the advanced canvas WASM with a fallback binary [site:oryzo] [verified]. Test Firefox and Safari, not only Chromium [inferred].

## What 2.43 to 2.45 change
None of these is breaking for the code above [verified: changelog, d.ts diff 2.42.2 → 2.45.0].
| Release | Change that matters here |
|---|---|
| 2.43.0 (2026-09-22) | softer deprecation wording for Rive Events; `Rive.suppressDeprecationWarnings = [ids]` with a `DeprecationKeys` list [verified: changelog, d.ts 2.45] |
| 2.43.1 (2026-09-23) | the `Fit.Layout` artboard check in `resizeDrawingSurfaceToCanvas` [verified: changelog] |
| 2.44.0 (2026-09-30) | text input and key input, directional focus [verified: changelog] |
| 2.44.1 (2026-10-09) | idle state machines stop redoing work that cannot change anything; triggers no longer reset every frame [verified: changelog] |
| 2.45.0 (2026-10-17) | `enableInkbleed` (experimental, WebGL2 only) and a blur-on-outside-press for text fields [verified: d.ts 2.45, changelog] |

Weight grows: `rive.wasm` 797 → 866 KB gz and `rive.js` 101 → 126 KB gz from 2.42.2 to 2.45.0 [verified: npm pack]. Moving the pin: no recipe installs Rive (`recipes/package.json` does not list it) [verified: grep, 2026-10-22], so the bump is `versions.md` plus the project's own `package.json` and a fresh copy of `rive.wasm`; re-capture every Rive section after it.

## Where the corpus used it
[site:lando-norris] (`canvas-lite` 2.26.4, eight files, a Rive page transition and load gate, scroll-scrubbed numeric input, Rive hamburger with ARIA set in JS, a `mob-landscape` panel on phone rotation), [site:mindmarket] (13 `.riv` through one `<c-rive>` custom element, all autoplay, lazy chunk, no accessible names, no reduced-motion branch), [site:oryzo] (two artboards from one file in the sustainability chapter, beside one WebGL context), [site:shopify-editions-w26] (27+ files in a dedicated chunk, a desktop and a mobile PNG fallback per file). Verified absences: [site:areebali], [site:floema], [site:lama-lama], [site:white-desert], [site:zainabkabira].
