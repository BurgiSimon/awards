# gl-arc-length-mask-reveal

Several strokes revealed in order by one shader pass. At load, four cubic Bézier branches are rasterised into an RGBA8 mask: R holds the branch id, G and B a 16-bit arc length (0 at the branch's start, 1 at its end), A the distance from the centreline. One uniform array of per-branch progress then draws every branch up to its own head, staggered, with a feathered front.

The branch geometry, tints and copy are synthetic demo content generated in code; no texture, model or font is downloaded. A real site swaps `BRANCHES` for its own paths (sampled from SVG `d` strings with `getPointAtLength`, or authored as Béziers).

## Why
- **Order lives in the data, not a timeline.** The arc-length channel turns any set of paths into a trim-path reveal; adding a branch is a new entry in the array and one more uniform slot, not a new tween `[site:cyphercapital]` (`[pattern:webgl-shaders#uniform-contract]`, values in `[pattern:webgl-architecture#effect-parameters]`).
- **16 bits, not 8.** One byte gives 256 steps along a branch, which steps visibly on a long stroke. High byte in G and low byte in B, read with `texelFetch` from a `NEAREST` texture so no filtering blends the two bytes.
- **A rounded head for free.** `front = arc + feather × edge²` makes the sides of the stroke trail the centre, so the head reads like a cap without any geometry.
- **Compared with `scroll-drawn-svg-path`:** that recipe draws one DOM stroke with `stroke-dashoffset`. This one is for strokes that are part of a GL surface (shaded, many at once, under other effects) and costs one fullscreen triangle whatever the branch count.

## Parameters
Four branches, `96` polyline steps each · stroke half-width `.034 ×` the stage's short side · feather `.12` · stagger `.2` (branch `i` runs over `[.2 i, .2 i + .4]` of the chapter) · per-branch reveal scaled by `1 + 2 × feather + .02` so the feathered head clears the end · damping `k = 9` on the shared ticker, which leaves once the progress arrives · DPR cap `1.5`, pixel budget `2.4 M`. **These are this recipe's own values, not a site's.**

The mask is built on the main thread (a few tens of ms at 1440 × 900). For larger stages, move `buildMask` into a Worker and transfer the buffer back.

## Tiers
- **Full:** the chapter's scroll (sticky stage in a `320svh` section) drives one progress value, split into four staggered branch windows.
- **Reduced:** every branch is drawn complete; nothing grows.
- **Static:** one frame, complete, no scroll listener.
- **No WebGL2 / shader failure:** the canvas stays hidden and the stage keeps its plain ground.

Resizing rebuilds the mask at the new size.

## Accessibility
The canvas is `aria-hidden`; the strokes carry no information that the copy does not. The progress readout is plain text. Nothing flashes; the reveal follows the scroll and never runs on its own.

## Adapters
- **three.js / R3F:** a `ShaderMaterial` on a fullscreen triangle with the mask as a `DataTexture` (`NearestFilter`, `UnsignedByteType`); feed `uReveal` as a `Float32Array`.
- **Vue / Svelte / Astro:** call `start()` on mount, and on unmount remove the scroll listener and lose the context.

Seen in: `[site:cyphercapital]` (branching hero channels revealed from a runtime mask with an arc-length channel and a per-branch reveal array).
