# scroll-curl-screens

A run of full-width case screens that lean back as they leave the top of the window. Each screen turns in `rotateX` about its bottom edge, under the perspective of its list item, by an amount that depends on how far out it is and how fast the page is moving. A slight scale and shade go with the lean so it reads as a surface turning away from the light. When the scroll goes quiet every screen relaxes to flat, and the loop that drives them stops.

## Why
- **A screen shown as an object, not a device.** The source tilts its product screens back on a curve as they pass, instead of framing them in laptop mockups `[site:okaydev]` [verified, home-renderer `applyCylinderProgress`, desktop-s50.png]. Turning about the bottom edge keeps the part still on screen in place, so only the part that is leaving recedes.
- **Speed, not position alone.** The source leans each screen by its position (`48° × power1.in(p)`), damped at `.18` per frame on GSAP's ticker `[site:okaydev]` [verified]. Here the lean is `34° × smoothstep(0, .65, p) × energy`, where energy is the scroll speed over `1,400 px/s`, clamped to 1. A screen parked half out is flat, a slow read barely bends it, and a flick bends it fully. The speed term and the relax are this recipe's own move, in the vein of `[pattern:motion-vocabulary#velocity-as-an-input]`; the source's position-only curl is a variant.
- **Damped by time, not by frame.** The energy rises at `k 12` and falls at `k 3.2`, and each angle follows its target at `k 14`, all through `damp()` from `_shared/raf.js`. The feel is the same at 60 Hz and 144 Hz, which a per-frame `.18` lerp is not `[pattern:motion-vocabulary#damping-math]`.
- **The speed is measured, never guessed.** It comes from Lenis' own scroll events, timed by the clock. The first event after a quiet spell has nothing to measure against and counts as zero, so a jump (End, an anchor, a programmatic scroll) never fakes a fling. The speed is clamped and the angle is capped at `34°`, so a hard flick never spins a screen.
- **A loop that ends.** The ticker starts on a scroll and removes itself once the energy is spent and every screen is flat; the source likewise removes its ticker callback when settled `[site:okaydev]` [verified]. At rest the page runs no frame at all.
- **Flat where it matters.** A screen that holds focus is set flat at once and stays flat while focused, so its ring is never drawn on a slant. Under reduced motion nothing turns.

## Parameters
| | |
|---|---|
| Lean | `rotateX(34° × smoothstep(0, .65, p) × energy)`, `transform-origin: 50% 100%` |
| Exit progress p | one ScrollTrigger per list item, `start: 'top top'`, `end: 'bottom top'` (the item is never transformed) |
| Energy | target `min(1, |v| / 1400 px/s)`; `damp` at `k 12` rising, `k 3.2` falling |
| Speed v | from Lenis `scroll` events over wall-clock time, clamped to `±6,000 px/s`; zero after `90 ms` without an event and for the first event after one |
| Angle | `damp` toward the target at `k 14`, capped at `34°`; no transform written under `.05°` |
| Depth cues | `scale(1 − .05 × lean)`, shade `opacity .5 × lean` (lean = angle / 34°) |
| Perspective | `1200px` on each list item, `800px` at ≤ 760 px |
| Stop | energy under `.003` and every screen flat → ticker removed |

## Tiers
- **Full:** the lean, the relax and the depth cues.
- **Reduced:** no tilt, no scale, no shade, and the ticker never starts; the screens scroll as flat panels.
- **Static:** the same as reduced.
- **Forced colours:** the shade is dropped and each screen gets a solid edge.

## Accessibility
Each screen is one link holding an `h3`, a sentence and a line of metadata, and it points at its case note further down the page. The drawn interfaces inside are `aria-hidden`. The ring is 3 px in the ink colour with an 8 px offset on the light ground, and a focused screen is held flat however the page moves. The motion follows the visitor's own scrolling and stops when they stop. It is never a loop, and reduced motion removes it.

## Adapters

### React / Next
Keep the angles, the energy and the speed in refs and write `transform` through element refs inside one ticker callback. Never put per-frame values in state. Create the ScrollTriggers in `useGSAP` with the list's ref as `scope`, subscribe to Lenis' `scroll` in the same effect, and return a cleanup that removes the listener and the ticker callback.

### Vue / Nuxt
Template refs for the items; build in `onMounted`, tear down in `onBeforeUnmount`. A `v-for` that re-renders the list must rebuild the triggers (`ScrollTrigger.refresh()` after `nextTick`).

### Webflow
- Designer: a Collection List whose items carry `perspective`, with the item's Link Block as the screen (`transform-origin` bottom centre) and an empty Div for the shade.
- Inject from Footer code: the module above, with Lenis and GSAP from the project's scripts. Webflow's own Interactions must not also transform the Link Block.

Seen in: `[site:okaydev]`.
