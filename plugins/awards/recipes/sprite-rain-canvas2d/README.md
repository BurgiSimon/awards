# sprite-rain-canvas2d

An easter egg: one button lets a shower of small sprites fall through the page on a single full-viewport canvas. Each sprite gets gravity, a sideways drift and a spin; it is dropped from the array the moment it leaves the screen, and the ticker callback is released when the last one is gone.

Demo content is synthetic: the four-point spark is drawn procedurally on the canvas, and the copy is invented for the recipe. Nothing of the source's smileys, copy or palette is reused.

## Why
- **Canvas 2D, not DOM nodes.** A hundred falling elements means a hundred layers and style recalcs; a hundred sprites on one canvas is an array and a loop `[site:wodniack]`.
- **One bitmap, stamped.** The spark is drawn once to an offscreen canvas at the device pixel ratio, then `drawImage`d with a per-sprite `setTransform` + `rotate`. No path is rebuilt per sprite per frame.
- **Framerate-independent gravity.** The source's numbers are per frame at 60 fps (`vy += .45`, spin up to ±10°/frame). Every per-frame step is multiplied by `f = dt · 60`, so the shower falls at the same speed on a 60 Hz laptop, a 120 Hz phone and a throttled tab (the shared ticker caps `dt` at `.1 s`).
- **The tier sets the count.** `_shared/quality-tiers.js` probes once; its tier picks the live-sprite ceiling and its DPR / pixel budget sizes the canvas. Spawning stops at the ceiling rather than dropping frames.
- **The clock is released.** When no sprite is left and the emitter has closed, the tick unsubscribes from the shared ticker; `_shared/raf.js` then stops requesting frames altogether.

## Parameters
Gravity `.45` px/frame² · drift `vx ∈ ±3` px/frame · start `vy 0`, just above the top edge · spin `±10°`/frame · sprite `14–28` CSS px · emitter `90` sprites/s for `1.2 s` per press · ceiling `160 / 80 / 32` live sprites for high / mid / low. Every px value is multiplied by the canvas DPR.

## Motion tiers
- **full**: the shower as described.
- **reduced / static**: nothing spawns. The button stays and the status line says the rain is off under reduced motion, so the press is never silent.

## Accessibility
The canvas is `aria-hidden` decoration with `pointer-events: none`, so links and text under the shower stay usable. The trigger is a real `<button>` (44 px target, visible focus ring) described as decorative, and a polite status region confirms each press.

## Adapters
- **React / Next**: keep the sprite array and the canvas in refs; subscribe to the ticker from the click handler and unsubscribe in the effect cleanup as well.
- **Vue / Nuxt, Svelte**: same shape; release the ticker in `onUnmounted` / `onDestroy`.
- **GSAP pages**: drive `tick` from `gsap.ticker.add` (its `deltaTime` is in ms, so divide by 1000) and remove it the same way.

Related: `[recipe:quality-tiers]` supplies the budget; `[recipe:throw-objects-css3d]` is the other toy from the same site.

Seen in: `[site:wodniack]`.
