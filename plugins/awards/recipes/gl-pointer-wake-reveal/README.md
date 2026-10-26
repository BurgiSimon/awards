# gl-pointer-wake-reveal

The hero is paper, with a second world under it. Where the pointer passes it leaves a short-lived wake that opens the paper onto a GL scene, and the paper closes again within a second. The scene renders only while the wake is open, at a reduced scale and every second frame.

## Why
- **A mask the 2D canvas can paint.** The wake is up to 140 points, each living 750 ms, drawn as radial gradients into a small canvas (480 × 300 here; the source uses 320 × 200). The shader reads that canvas as a mask, so there is no trail simulation and no ping-pong target. `[site:daikifujita]` opens its "dream" behind the paper hero this way [verified, `shared-lib.CTuRAKaB.mjs`, 2026-10-26].
- **A render scale separate from the DPR.** The world renders into its own target at 0.62 of the canvas's pixel ratio and is upscaled in the composite. The mask edge stays crisp while the world under it stays soft and cheap.
- **Nothing at rest.** With no live points the loop paints an empty mask and returns. The canvas is cleared once and stays clear.
- **Speed widens the wake.** Radius is `0.095 × short side × (0.6 + 0.6 × speed / 1,600 px/s)`, so a flick opens more of the world than a drift does.

## Parameters
| | |
|---|---|
| Wake | ≤ 140 points; one per 6 px of travel; life 750 ms; strength `(1 − age)²`; a 480 × 300 mask canvas; threshold `smoothstep(.02, .5)` |
| World | render scale .62; every second frame; procedural night (gradient, a warped ribbon, twinkling stars) |
| Canvas | `alpha: true`, premultiplied; DPR ≤ 1.5 from the quality tier |

These are this recipe's own values; the world is a stand-in for whatever lies under your paper.

## Tiers and input
- **Fine pointer, full motion:** as above.
- **Touch, reduced motion or no WebGL:** paper only. The paper is the complete page, and the world is a gift to the mouse.
- Text over an open wake loses contrast for under a second. Keep body copy out of the hero, or narrow the wake behind it.

## Accessibility
The canvas is `aria-hidden` and ignores the pointer. Every word is DOM above it, and nothing is reachable only through the wake.

## Adapters

### Webflow
- Designer: the hero Section (`position: relative; overflow: hidden`) on the paper colour, with an Embed `<canvas class="world" aria-hidden="true">` as its first child and the copy above it.
- Inject from Footer code only when `(hover: hover) and (pointer: fine)` matches and reduced motion is off; dispose on `pagehide`.

Seen in: `[site:daikifujita]`.
