# flip-scroll-path

One picture travels the page. Four empty picture boxes sit in four sections' own layouts (a tall arch, a small square, a wide shelf, a round window), and a single CSS-drawn element is carried from each to the next by `Flip.fit` legs chained into one scrubbed ScrollTrigger timeline, its corner radius changing beside each leg. Where `[recipe:docked-media-grow]` grows one card inside one section, this moves one element across several, and the page's CSS, not the timeline, decides where it lands.

## Why
- **The layout owns the geometry.** Each stop is an empty box that the grid sizes, `aspect-ratio` shapes and `border-radius` rounds, and `Flip.fit` measures the element against it. Moving a stop is a CSS change; nothing in the script names a coordinate. The source site chains `Flip.fit(target, nextWrapper, { duration: pixelOffset, ease: "none", simple: true })` into one timeline at `scrub: 0.8` `[site:abatable]` [verified, bundle.js `initFlipOnScroll`; not on its home route].
- **A leg is paid in scroll distance.** The timeline's unit is the scroll pixel: it starts where the first slot's centre meets the viewport's and ends where the last one's does, and each leg lasts the scroll between its two slots. The element therefore keeps one speed and stays near the middle of the screen while the page passes under it `[site:abatable]` [verified] `[pattern:gsap-choreography#flip-and-layout-state]`. The dwell is this recipe's own addition: for `0.3` of a viewport around each slot's centre nothing moves, so the picture rests in its box and rides up with its section before it lifts off again.
- **The corner comes from the slot.** The source tweens `borderRadius` from `100vw` to `0` beside its legs `[site:abatable]` [verified]. Here each leg tweens to the next slot's own computed corner, clamped to half its shorter side so that `999px` and `50%` both mean fully round. That generalisation is the plugin's own.
- **Width and height, not scale.** The four boxes have four aspect ratios. A Flip at `scale: true` would stretch the drawing and turn every corner into an ellipse, so the legs run at `scale: false` and write `width` and `height`. That costs a layout per frame, so the flyer is `contain: strict`: the layout stays inside its own subtree. The drawing is sized in container units (`cqmin`), so the jar keeps its proportions in every box and the shelf and glow follow it. This trade is the plugin's own; a picture whose slots share one ratio should use `scale: true` (transform only).
- **Measured numbers expire.** `Flip.fit` returns absolute x, y, width and height for the layout it measured. On `refreshInit` the timeline and its trigger are killed and the flyer's inline styles cleared, and on `refresh` everything is measured again. ScrollTrigger refreshes on resize and on load. A `ResizeObserver` on `main` asks for a refresh when the page's height changes (fonts, text zoom, late content), which a resize event never reports. The card does not record how the source handles a layout change [unknown]; this rebuild is the plugin's own.
- **One copy travels; each slot keeps its own.** The travelling copy is `aria-hidden` and takes no pointer. Each slot holds its own still, a named image that stays in the accessibility tree. Under reduced motion the stills simply show. The source runs its scrubs whatever the motion setting `[site:abatable]` [verified, card §6].

## Parameters
| | |
|---|---|
| Slots | four `[data-slot]` boxes: arch `4 / 5` at `999px`, square `1` at `28px`, shelf `21 / 9` (phone `4 / 3`) at `0`, window `1` at `50%`; grid columns 8–11, 2–4, 1–12, 7–10 of 12 |
| Stops | `stops[k] = slot top + height / 2 − innerHeight / 2` (document coordinates) |
| Trigger | `trigger: slot 1, start: 'center center', endTrigger: slot 4, end: 'center center'`, `scrub: 0.6`, `ease: 'none'` throughout |
| Legs | `Flip.fit(flyer, slot k+1, { duration: gap − dwell, ease: 'none', simple: true, scale: false })` at `stops[k] − stops[0] + dwell / 2`; `borderRadius` to slot k+1's corner over the same span |
| Dwell | `min(0.3 × innerHeight, 0.45 × the shortest gap)` of scroll, centred on each stop |
| Rebuild | teardown on `refreshInit` (kill, `clearProps: 'all'`), build on `refresh`; `main` height change → `ScrollTrigger.refresh()` after `120 ms` |
| Flyer | `position: absolute; z-index: 20; contain: strict; pointer-events: none`, `aria-hidden` |
| Drawing | jar `60 × 56 cqmin` at `52 %` of the box, shelf at `74 %`, glow `130 cqmax` |

## Tiers
- **Full:** the flight, with a dwell in every slot. Each slot shows a hairline frame and the jar's dashed outline while the jar is elsewhere.
- **Reduced:** no timeline and no ScrollTrigger. The travelling copy is hidden and each slot shows its own still, so the picture is in every place it would have landed.
- **Static:** the same as reduced.
- **No JavaScript:** the stills show. The flyer stays `display: none` until the script marks the flight on.

## Accessibility
The page reads in order with or without the flight: four figures, each with a named image and a caption. The travelling copy duplicates them and is `aria-hidden` with `pointer-events: none`, so it never steals a click or a hit-test. The stills are hidden with `opacity`, not `display` or `visibility`, so assistive technology still finds every figure while the jar is flying. The enquiry link is a real link with a visible ring, and the resting jar never covers it. Text that lies on a leg's path is covered only while the jar passes, a few hundred pixels of scroll. Keep longer copy beside the slots, not between them. Forced colours draw each empty box's frame as an outline.

## Adapters

### React / Next
Keep the slots as plain elements with refs and build inside `useGSAP(() => { … }, { scope })`: register the `refreshInit` / `refresh` listeners there and remove them in the returned cleanup (`ScrollTrigger.removeEventListener`). Never put the flyer's box in state; Flip writes it. In the App Router, mount the flyer in a client component that sits inside the first slot.

### Vue / Nuxt
Build in `onMounted` after `nextTick` and tear down in `onBeforeUnmount`. A slot whose size depends on data (a CMS image's ratio) changes the page's height when the data lands, and the `ResizeObserver` on `main` turns that into a rebuild.

### Webflow
- Designer: give each picture box a Div with `data-slot`, its size from the grid, its ratio from `aspect-ratio` and its corner from `border-radius`. Put one Div `flyer` (absolute, full size, `z-index: 20`, `pointer-events: none`) inside the first. No slot ancestor may clip or set `overflow`.
- Inject from Footer code: the module above, with GSAP and Flip from the project's own scripts.
- Keep a static image in each slot for reduced motion; hide it with `opacity` only while `html[data-flight="on"]`.

Seen in: `[site:abatable]`.
