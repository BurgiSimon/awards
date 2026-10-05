# gl-one-context-many-canvases

One WebGL renderer feeding many small 2D canvases. The grid keeps its DOM layout: every item is a real button with its own `<canvas>` and caption. A single `WebGLRenderer` on a detached canvas renders each item in turn into a slice of its drawing buffer and `drawImage`s that slice into the item's 2D canvas, in the same task as the render. Items re-render only when they changed and sit near the viewport; one pixel budget sets the pixel ratio for the whole set; teardown releases the context at once.

Demo content is synthetic: six generated primitives (torus knot, torus, icosahedron, lathe, two cylinders), colours derived from the shared `--accent` token. No models, textures, fonts or media.

## Why
- **Contexts are scarce.** Browsers cap live WebGL contexts per page and contexts cannot share buffers or programs; a canvas per card hits the cap and compiles every shader N times (`[pattern:webgl-architecture#scene-windows-and-disposal]`). One renderer drawing each label in turn and blitting it into that item's 2D canvas `[site:agrumeafarm]`; one detached context serving many per-word canvases `[site:cyphercapital]`.
- **Keep the DOM in charge.** Unlike `[recipe:gl-dom-tethered-planes]`, there is no full-screen canvas over the page: each item's canvas flows with its card, so grid, captions, focus rings and hit targets stay plain HTML.
- **Render on change, near the viewport.** An item is drawn when it is dirty (its turn moved, a resize) and an `IntersectionObserver` with a `50%` root margin reports it near. A resting grid draws nothing; the verify checks each item rendered exactly once at rest.
- **One budget for the set.** Pixel ratio = `min(tier DPR, √(budget / Σ item area))`, so adding items lowers resolution instead of multiplying GPU work. The shared drawing buffer is the largest item's size; each item uses the top-left slice (`setViewport(0, H − h, w, h)`, because GL rows start at the bottom).
- **Release, don't wait for GC.** Teardown disposes geometries and materials, then `renderer.dispose()` and `forceContextLoss()`, the pattern used where renderers are recycled across routes `[site:a24-raviklaassens]`. The 2D canvases keep their last frame, so nothing blanks on the way out.

## Parameters
Pixel budget `2,000,000` device px for all items · tier DPR from `detectQualityTier` · near margin `50%` of the viewport · turn: one revolution, damped `k = 5`, settles within `1e-3` rad · camera fov `30°`, z `6`.

## Motion tiers
- **full** — hover (mouse pointers) or press turns an item one revolution; only that item re-renders while it moves.
- **reduced** — hover or press toggles a tint towards `--ink`; no rotation; one re-render per change.
- **static** — each item is drawn once; no interaction changes the render.
Without WebGL each canvas keeps a CSS field with a centred disc, and the buttons and captions stay.

## Accessibility
Item canvases are `aria-hidden`; the button text (number and name) is the accessible name. Press works with Enter and Space. Hover turning listens to mouse pointers only, so a tap gives one turn, not two.

## Adapters
- **Raw WebGL2:** one `getContext('webgl2')` on a detached canvas, one program, per-item uniforms, `gl.viewport` + `drawImage` per item; skip three entirely for flat effects such as word sheens.
- **React / R3F:** keep one renderer in a module-level singleton; each item component registers its canvas and a dirty flag in a ref. Do not mount a `<Canvas>` per item.
- **Different item sizes:** the code already sizes the buffer to the largest item and slices per item; mixed aspects only need the per-item `camera.aspect` set before each render (done here).

## Verify
`grid` scrolls the grid into view and checks six DOM canvases with painted centre regions, exactly one WebGL context (counted by a `getContext` wrapper installed after the quality probe, whose own throwaway canvas is outside the technique), backing pixels within the budget, and one render per item at rest. `hover` turns only the hovered item. `teardown` checks `isContextLost()` and that the 2D canvases kept their pixels. Opening a context per item fails the count (7 instead of 1).

Seen in: `[site:agrumeafarm]`, `[site:cyphercapital]`, `[site:a24-raviklaassens]`.
