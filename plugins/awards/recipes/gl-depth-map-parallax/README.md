# gl-depth-map-parallax

A flat image and a greyscale depth map: the shader offsets each texel by its depth times the pointer offset, so near parts move more than far parts and a still reads as a shallow relief. The cheapest rung of the depth ladder above flat planes.

## Why
- **Depth without a model.** A painting, a photograph or a render becomes dimensional with one extra greyscale image, at an image-file cost per scene instead of a mesh (`[pattern:webgl-architecture#the-depth-ladder]`). **No corpus card demonstrates this**: the two that were cited both turned out to ship something else [verified, live source 2026-09-18]. The technique stands on its own.
- **Offset from the pointer, damped.** `k = 6` damping keeps the relief calm; scroll adds a gentle vertical drift so the effect exists on touch too.
- **Strength is small.** `0.06` UV units at full offset; more shows the smearing at depth edges that the technique cannot hide.
- **Mirrored and budgeted.** The colour image stays in the DOM with alt text; the depth map is `hidden`; DPR from the tier; disposal on `pagehide`.

## Parameters
Strength `0.06` · damping `k 6` · pointer range `±1` · scroll drift `0.3 per viewport`.

## Producing depth maps
Render a Z-depth pass from the 3D tool, or generate one from a photograph with a monocular depth model and clean the edges; bright = near, dark = far, same aspect as the colour image.

Seen in: no corpus card, as of the 2026-09-18 live pass. `[site:shopify-editions-w26]` builds its scenes from Blender glTF with KTX2 textures, and `[site:trevor-noah]`'s "flat planes with a curl" are DOM cards with an SVG peel — neither uses a depth map.
