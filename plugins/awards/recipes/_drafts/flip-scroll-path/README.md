# flip-scroll-path

One picture travels the page. Four picture boxes sit in four sections' own layouts (a tall arch, a small detail, a wide shelf, a round window), and a single CSS-drawn element is carried from each to the next by `Flip.fit` legs chained into one scrubbed ScrollTrigger timeline, its four corners and its scene changing beside each leg. Where `[recipe:docked-media-grow]` grows one card inside one section, and `[recipe:flip-layout-state]` flips one layout change on a click, this chains `Flip.fit` legs into one scrub across sections, and the page's CSS, not the timeline, decides where the element lands.

## Why
- **The layout owns the geometry.** Each stop is a box that the grid sizes, `aspect-ratio` shapes and `border-radius` rounds, and `Flip.fit` measures the element against it. Moving a stop is a CSS change; nothing in the script names a coordinate. The source site chains `Flip.fit(target, nextWrapper, { duration: pixelOffset, ease: "none", simple: true })` into one timeline at `scrub: 0.8` `[site:abatable]` [verified, bundle.js `initFlipOnScroll`; not on its home route].
- **A leg is paid in scroll distance.** Each leg's share of the timeline equals its scroll distance, so the element travels at constant speed `[site:abatable]` [verified, bundle.js `initFlipOnScroll`] `[pattern:gsap-choreography#flip-and-layout-state]`. Fitting each slot where its centre meets the viewport's keeps the element at the middle of the screen while the page passes under it; that alignment is the plugin's own. So is the dwell: for `0.3` of a viewport around each slot's centre nothing moves, and the picture rests in its box and rides up with its section before it lifts off again.
- **The path holds no text.** Between two boxes the element sweeps their convex hull: every side moves on a straight line, so whatever lies between the two boxes is covered for as long as the scroll takes to cross it, and a reader who stops there keeps it covered. A first version that let the jar cross the copy column covered captions, headings and the enquiry link over 120 to 480 px of scroll each. The page is therefore laid out in lanes: copy in columns 1–5, captions in 6–7, every slot in the picture lane, 8–12, so the hull of any two slots stays inside the lane. A caption sits beside its slot, on the copy side, never under it, because the jar leaves every slot downwards. The verifier sweeps every leg and fails on any text box the jar touches. This rule is the plugin's own; the card does not record how the source keeps its copy clear [unknown].
- **The corners come from the slot.** The source tweens `borderRadius` from `100vw` to `0` beside its legs `[site:abatable]` [verified, bundle.js]. Here each leg tweens all four corners, horizontal and vertical radii apart, to the next slot's as the browser paints them: percentages resolve against width and height, and when two radii on one side overflow it, all of them shrink by one factor. `999px 999px 0 0` on the tall box is then a true arch, and `50%` on the square a circle. The eight numbers tween on one plain object and are written as a single `border-radius`. That generalisation is the plugin's own.
- **Each box has its own picture.** The jar lands in four scenes, named by `data-scene` on each still: a studio shelf, the seam close up, a kiln shelf with brick behind, a nest of oat straw seen through a window. The travelling copy carries all four as layers, and a tween beside each leg moves their weights (`--detail`, `--kiln`, `--crate`, 0 to 1) from one slot's scene to the next over the middle `0.3`–`0.7` of the leg, `sine.inOut`. The blend is part of the scrub, so a reader who stops mid-leg sees a steady picture, and scrolling back plays it backwards. The plugin's own.
- **Width and height, not scale.** The four boxes have four aspect ratios. A Flip at `scale: true` would stretch the drawing and turn every corner into an ellipse, so the legs run at `scale: false` and write `width` and `height`. That costs a layout per frame, so the flyer is `contain: strict`: the layout stays inside its own subtree. The drawing is sized in container units (`cqmin`), so the jar keeps its proportions in every box. This trade is the plugin's own; a picture whose slots share one ratio should use `scale: true` (transform only).
- **Measured numbers expire.** `Flip.fit` returns absolute x, y, width and height for the layout it measured. On `refreshInit` the timeline and its trigger are killed and the flyer's inline styles cleared, and on `refresh` everything is measured again. ScrollTrigger refreshes on resize and on load. A `ResizeObserver` on `body` and on every slot asks for a refresh when the page's height or a slot's size changes (fonts, text zoom, a late banner), which a resize event never reports; a change of `dir` or of motion tier, or a crossing of the breakpoint, asks for one too. The card does not record how the source handles a layout change [unknown]; this rebuild is the plugin's own.
- **Wide screens only.** Below `1024px` the page is one column, and a jar crossing one column would cross every line in it, so the flight is gated by `matchMedia` and the phone gets each box's own still. The source gates its fan (≥ 768) and its rail (≥ 992) the same way, with `gsap.matchMedia` `[site:abatable]` [verified, bundle.js]; the breakpoint here is the plugin's own.
- **One copy travels; each slot keeps its own.** The travelling copy is `aria-hidden` and takes no pointer. Each slot holds its own still, a named image that stays in the accessibility tree, and an empty set (its scene with the lights down) that shows while the jar is elsewhere. Under reduced motion the stills simply show. On its homepage the source's hero scrub and card fan ignore reduced motion `[site:abatable]` [verified, bundle.js]; how its Flip helper behaves there is not recorded [unknown].

## Parameters
| | |
|---|---|
| Lanes (≥ 1024 px) | copy in columns 1–5 of 12, captions in 6–7 (end-aligned, at the foot of their slot), pictures in 8–12; each figure is a subgrid over 6–12 |
| Slots | four `[data-slot]` boxes in document order, each lower on the page than the last: arch `4 / 5` at `999px 999px 0 0` (columns 9–12), detail `4 / 3` at `28px` (8–10), shelf `21 / 9` at `0` (8–12; `2 / 1` below 1024 px), window `1` at `50%` (8–11) |
| Gate | `matchMedia('(min-width: 1024px)')` and the full motion tier; otherwise `html[data-flight="off"]` and the stills |
| Stops | `stops[k] = slot top + height / 2 − innerHeight / 2` (document coordinates); a gap of zero or less between two stops turns the flight off with a console warning |
| Trigger | `trigger: slot 1, start: 'center center', endTrigger: slot 4, end: 'center center'`, `scrub: 0.6`, `ease: 'none'` throughout |
| Legs | `Flip.fit(flyer, slot k+1, { duration: max(1, gap − dwell), ease: 'none', simple: true, scale: false })` at `stops[k] − stops[0] + dwell / 2` |
| Corners | eight used radii (four horizontal, four vertical) tweened as one array beside each leg, written as `border-radius: a b c d / e f g h` |
| Scenes | `studio`, `detail`, `kiln`, `crate` from each still's `data-scene`; weights cross over `0.3`–`0.7` of each leg, `sine.inOut` |
| Dwell | `max(0, min(0.3 × innerHeight, 0.45 × the shortest gap))` of scroll, centred on each stop |
| Rebuild | teardown on `refreshInit` (kill, `clearProps: 'all'`), build on `refresh`; a size change of `body` or a slot → `ScrollTrigger.refresh()` after `120 ms`; `dir`, `data-motion`, the tier media query and the breakpoint → refresh now |
| Flyer | `position: absolute; z-index: 20; contain: strict; pointer-events: none`, `aria-hidden` |
| Drawing | jar `60 × 56 cqmin` at `52 %` of the box, shelf at `74 %`, glow `130 cqmax`; brick tile `30 × 20 cqmin`; empty sets at `brightness(0.52)` |

## Tiers
- **Full, 1024 px and wider:** the flight, with a dwell in every slot. Each box shows its empty set while the jar is elsewhere.
- **Full, narrower:** one column; no timeline and no ScrollTrigger; each box shows its own still in its own scene.
- **Reduced:** the same as narrow. The travelling copy is hidden and each slot shows its own still, so the picture is in every place it would have landed.
- **Static:** the same as reduced.
- **No JavaScript:** the stills show. The flyer stays `display: none` until the script marks the flight on.

## Accessibility
The page reads in order with or without the flight: four sections, each a heading, its copy and a figure with a named image and a caption. The travelling copy duplicates the images and is `aria-hidden` with `pointer-events: none`, so it never steals a click or a hit-test. The stills are hidden with `opacity`, not `display` or `visibility`, so assistive technology still finds every figure while the jar is flying. No line of text, caption or link is ever under the jar: the copy and the captions sit in lanes the path never enters, which the verifier proves by sweeping every leg at 1440 × 900 and 1024 × 768. On a phone there is no flight at all, so nothing crosses the single column. The enquiry link is a real link with a visible ring. Forced colours outline each box.

## Adapters

### React / Next
Render the sections as plain markup and mount in an effect: `useEffect(() => mountFlipScrollPath(ref.current), [])`. The returned `destroy()` is the cleanup: it disconnects the `ResizeObserver` and the `MutationObserver`, removes the tier and breakpoint listeners and the `load` listener, clears the pending refresh timer, removes the `refreshInit` / `refresh` listeners, kills the timeline and its trigger, removes the ticker callback and destroys Lenis. An app that already runs Lenis drops the Lenis lines from `mount` and keeps `lenis.on('scroll', ScrollTrigger.update)` in its own boot. Never put the flyer's box in state; Flip writes it. In the App Router, mount it from a client component.

### Vue / Nuxt
`onMounted(() => { destroy = mountFlipScrollPath(el.value) })` and `onBeforeUnmount(() => destroy())`; the same list of disposers runs. A slot whose size depends on data (a CMS image's ratio) changes its own size or the page's height when the data lands, and the `ResizeObserver` turns that into a rebuild.

### Webflow
- Designer: lay the page out in lanes. Give each picture box a Div with `data-slot`, its size from the grid, its ratio from `aspect-ratio` and its corners from `border-radius`, all in one column band the copy never enters; put each caption beside its box, not under it. Put one Div `flyer` (absolute, full size, `z-index: 20`, `pointer-events: none`) inside the first. No slot ancestor may clip or set `overflow`.
- Inject from Footer code: the module above, with GSAP and Flip from the project's own scripts.
- Keep a static image in each slot for reduced motion and narrow screens; hide it with `opacity` only while `html[data-flight="on"]`.

Seen in: `[site:abatable]`.
