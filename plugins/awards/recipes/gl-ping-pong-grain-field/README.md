# gl-ping-pong-grain-field

A field of GPU grains that the pointer brushes aside. Each grain's state (displacement in RG, velocity in BA, in CSS pixels) lives in one texel of a float render target that is read and rewritten every frame (ping-pong). A protect mask scales the brush to zero over the content it must never cover. Two points passes draw it: the under-layer at the home of every grain that moved, then the grains at home + displacement, coloured from the surface image at their home. A reset glides every grain home.

The surface, the under-layer and the mask are generated in code; the copy is synthetic demo content. A real site swaps `surfaceImage()` for a cover-cropped photograph and `underImage()` for its own under-layer.

## Why
- **State per grain, not per pixel.** Unlike a fluid post-process (`gl-fluid-wake-post`), every grain carries its own history, so marks persist where the visitor left them `[site:aqualoqa]`.
- **A storage chain that always renders.** The first renderable of RGBA32F → RGBA16F → RGBA8 wins, checked with `checkFramebufferStatus`. RGBA8 cannot integrate small velocities, so the byte path packs displacement into 16 bits per axis (±2048 px, 1/16 px steps) and drops inertia. Grains still move under the brush, they just do not coast. Ping-pong pairs with an 8-bit fallback are the same habit as `[site:edolus]`'s render targets.
- **A brush that cannot skip.** The force is applied along a capsule from the last pointer position to the current one, so a fast flick that crosses the field between two frames still moves every grain on its way.
- **Protect what must stay legible.** The mask is drawn from the copy block's rectangle, so the protected area follows the layout instead of a painted file (`[pattern:webgl-architecture#effect-parameters]`).
- **Idle gate.** The loop leaves the shared ticker 150 frames after the last input; nothing renders while the field is at rest.

## Parameters
Brush radius `56 px`, falloff `1 − r³` · pointer delta clamped to `24 px` per frame · per-grain hash scatter `.35 × |delta|` · impulse `.5`, velocity kept `.88` per frame, settles to zero under `.02 px` · reset glide `× .88` per frame for `1.6 s`, then both targets cleared · grains per tier: high `120,000`, mid `60,000`, low `30,000`, laid out on a grid that follows the canvas aspect. All per-frame values are at 60 fps and scaled by the ticker's `dt`. **These are this recipe's own values, not a site's.**

`?format=half` and `?format=byte` start the storage chain lower, to test the fallbacks.

## Tiers
- **Full:** grains fly, the under-layer opens behind them.
- **Reduced:** the simulation runs but no grain is drawn moving; the brush only reveals the under-layer in place, and reset fades it.
- **Static:** the surface is drawn once, no simulation, no listeners.
- **No WebGL2 / no renderable format:** the hero keeps its CSS gradient.

Resizing rebuilds the field (and resets it).

## Accessibility
The canvas is `aria-hidden`; nothing is said only in GL. The copy is real DOM above the canvas and is never brushed. Reset is a real `<button>`. On touch the canvas uses `touch-action: pan-y`, so vertical swipes scroll and horizontal swipes brush. A drag on the canvas does not start a text selection.

## Adapters
- **React / R3F:** keep the two targets in a `useFBO` pair and swap them in `useFrame`; the points material reads the current read target.
- **Vue / Svelte / Astro:** mount `start()` on the canvas in the component's mount hook, run the `pagehide` teardown on unmount.

Seen in: `[site:aqualoqa]` (a photo-sampled point field with a protect mask, a hole pass and a reset glide), `[site:edolus]` (ping-pong pairs at RGBA16F with an RGBA8 fallback and a shared pointer-push uniform family).
