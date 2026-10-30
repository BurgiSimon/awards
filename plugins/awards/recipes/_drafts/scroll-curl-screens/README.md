# scroll-curl-screens

A run of full-width case screens that lean back as they leave the top of the window. Each screen turns in `rotateX` about its bottom edge, under the perspective of its list item, by an amount that depends on how far out it is and how fast the page is moving. A slight scale and a shade that darkens toward the receding top go with the lean, and when the scroll goes quiet every screen relaxes to flat and the curl's callback leaves the ticker.

## Why
- **A screen shown as an object, not a device.** The source tilts its product screens back on a curve as they pass, instead of framing them in laptop mockups `[site:okaydev]` [verified, home-renderer `applyCylinderProgress`, desktop-s50.png]. Its curl is a cylinder: `rotationX` with `z = −900 × (1 − cos θ)`, and brightness falling from 1 to .35 past p = .55 `[site:okaydev]` [verified]. The bottom-edge pivot, the scale and the gradient shade here are this recipe's own choices: only the hinge line stays put, and everything above it recedes and foreshortens. The cylinder push and the late brightness fade are listed as a variant.
- **Speed, not position alone.** The source leans each screen by its position (`48° × power1.in(p)`), damped at `.18` per frame on GSAP's ticker `[site:okaydev]` [verified]. Here the lean is `34° × smoothstep(0, .65, p) × energy`, where energy is the scroll speed over `1,400 px/s`, clamped to 1. A screen parked half out is flat, a 200 px/s read leans it a quarter to a third as far as an 800 px/s scroll, and a flick bends it fully. The speed term and the relax are this recipe's own move, in the vein of `[pattern:motion-vocabulary#velocity-as-an-input]`; the source's position-only curl is a variant.
- **Damped by time, not by frame.** The energy rises at `k 12` and falls at `k 3.2`, and each angle follows its target at `k 14`, all through `damp()` from `_shared/raf.js`. The feel is the same at 60 Hz and 144 Hz, which a per-frame `.18` lerp is not `[pattern:motion-vocabulary#damping-math]`.
- **The speed is measured, never guessed.** It comes from Lenis' own scroll events, timed by the clock over at least `6 ms` (a touch drag can deliver two events 1 ms apart). The first event after a quiet spell counts as zero, so an instant jump (an anchor, a programmatic scroll with `immediate`) never fakes a fling. Home and End are jumps too, but Chromium animates them natively at thousands of px/s, so the speed is ignored from the key press until that scroll goes quiet. PageDown, Space and the arrows are scrolling and lean like any scroll of their speed. The speed is clamped and the angle capped at `34°`, so a hard flick never spins a screen.
- **A loop that ends.** The curl's callback joins the shared ticker on a scroll and takes itself off once the energy is spent and every screen is flat; the source likewise removes its ticker callback when settled `[site:okaydev]` [verified]. At rest the curl's callback is off the ticker; only the Lenis clock every Lenis page carries keeps running.
- **Flat where it matters.** A screen that holds focus is set flat at once and stays flat while focused, so its ring is never drawn on a slant. Under reduced motion and the static tier nothing turns.

## Parameters
| | |
|---|---|
| Lean | `rotateX(34° × smoothstep(0, .65, p) × energy)`, `transform-origin: 50% 100%` |
| Exit progress p | one ScrollTrigger per list item, `start: 'top top'`, `end: 'bottom top'` (the item is never transformed) |
| Energy | target `min(1, abs(v) / 1400 px/s)`; `damp` at `k 12` rising, `k 3.2` falling |
| Speed v | from Lenis `scroll` events over wall-clock time, measured over at least `6 ms`, clamped to `±6,000 px/s`; zero after `90 ms` without an event and for the first event after one |
| Home and End | speed ignored from the key until the scroll they start has been quiet `90 ms` (`250 ms` for it to begin); a wheel or touch ends this at once |
| Angle | `damp` toward the target at `k 14`, capped at `34°`; no transform written under `.05°` |
| Depth cues | `scale(1 − .05 × lean)`; shade `opacity .5 × lean` over a gradient from full at the top edge to `.45` at 40 % and clear at 78 % of the height (lean = angle / 34°) |
| Perspective | `900px` on each list item, `800px` at ≤ 760 px |
| Card height | `min-height: min(78svh, 780px)`, `74svh` on a phone, `max(84svh, 280px)` when the window is 520 px tall or less; never a fixed height, so longer text grows the card |
| Stop | energy under `.003` and every screen flat → the curl's callback removed from the ticker |

## Tiers
- **Full:** the lean, the relax and the depth cues.
- **Reduced:** no tilt, no scale, no shade, and the curl's callback never joins the ticker; the screens scroll as flat panels.
- **Static:** the same as reduced (forced with `data-motion="static"` on the root).
- **Forced colours:** the shade is dropped and each screen gets a solid edge.

## Accessibility
Each screen is one link holding an `h3`, a sentence and a line of metadata, and it points at its case note further down the page. The note is a focus target (`tabindex="-1"`), so Enter on a screen moves focus there, and each note ends with a link back to its screen. The drawn interfaces inside the screens are `aria-hidden`. The ring is 3 px in the ink colour with an 8 px offset on the light ground, and a focused screen is held flat however the page moves. The shade is darkest at the receding top edge and clear toward the hinge, so the text still in view keeps its contrast (6.4:1 or better through a 1,600 px/s pass on desktop). The motion follows the visitor's own scrolling and stops when they stop. It is never a loop, and reduced motion removes it. On a phone held sideways the text and the picture sit side by side again and the card grows to fit its text.

## Adapters

### React / Next
Keep the angles, the energy and the speed in refs and write `transform` through element refs inside one ticker callback. Never put per-frame values in state. Create the ScrollTriggers in `useGSAP` with the list's ref as `scope`, subscribe to Lenis' `scroll` and the `keydown`, `wheel` and `touchstart` listeners in the same effect, and return a cleanup that removes them and the ticker callback.

### Vue / Nuxt
Template refs for the items; build in `onMounted`, tear down in `onBeforeUnmount`. A `v-for` that re-renders the list must rebuild the triggers (`ScrollTrigger.refresh()` after `nextTick`).

### Webflow
- Designer: a Collection List whose items carry `perspective`, with the item's Link Block as the screen (`transform-origin` bottom centre, a min height rather than a height) and an empty Div for the shade.
- Inject from Footer code: the module above, with Lenis and GSAP from the project's scripts. Webflow's own Interactions must not also transform the Link Block.

Seen in: `[site:okaydev]`.
