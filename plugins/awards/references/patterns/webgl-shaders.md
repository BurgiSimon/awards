# WebGL shaders

What this file is for: the deep shader path of `awards:webgl` (`--shader`), depth rungs 1–3 of `[pattern:webgl-architecture#the-depth-ladder]`: shader beats by kind, the uniform contract between DOM and GPU, the noise and field toolbox, render-target chains and transitions, post chains in order, text in shaders. Dosage, canvas placement, disposal and single-row effect parameters stay in `[pattern:webgl-architecture]`; renderer API in `stacks/three-0.186.md`. Cite as `[pattern:webgl-shaders#section]`. Every row carries the card's confidence label; structure read from minified bundles is `[inferred]`.

## Contents
1. [Shader beats by kind](#shader-beats-by-kind)
2. [Uniform contract](#uniform-contract)
3. [Noise and field toolbox](#noise-and-field-toolbox)
4. [Render targets and transitions](#render-targets-and-transitions)
5. [Post chains](#post-chains)
6. [Text in shaders](#text-in-shaders)
7. [Teardowns](#teardowns)
8. [Recipe map](#recipe-map)
9. [Verify](#verify) · [Refuse](#refuse)

## Shader beats by kind

Why: a fullscreen field, a tethered plane and a point cloud each cost and read differently; the beat picks the kind, never the reverse.

<!-- filled by wave 4 synthesis from `### Tech lens: WebGL` subsections -->

## Uniform contract

Why: scroll, pointer, velocity and time reach the GPU as named, damped numbers on one ticker; the names and rest values are part of the design.

## Noise and field toolbox

Why: the noise family and its octave count set the texture of the whole site.

## Render targets and transitions

Why: section transitions and feedback effects live in render targets; their size and type decide the frame budget.

## Post chains

Why: post order changes the image (grain before or after the grade, bloom before or after the wake); this section records shipped orders with values.

## Text in shaders

Why: GL text must keep a DOM twin; this section records how the corpus distorts type without losing it.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|

## Recipe map

| Intent | Recipe |
|---|---|
| Planes tethered to DOM images | [recipe:gl-dom-tethered-planes] |
| Global fluid wake | [recipe:gl-fluid-wake-post] |
| Depth-map parallax | [recipe:gl-depth-map-parallax] |
| Section transition through render targets | [recipe:gl-rtt-composite-transition] |
| Bloom and grain presets | [recipe:gl-postprocessing-presets] |
| MSDF text | [recipe:gl-msdf-text] |
| Endless reel of sheets | [recipe:gl-endless-reel-sheets] |

## Verify

- [ ] Every custom material ends its fragment stage with `#include <colorspace_fragment>`.
- [ ] Every uniform is fed from the one ticker, with a named rest value.
- [ ] The post chain order is written in `AWARDS.md ## Budgets & tiers` and no shader compile warning reaches the console.

## Refuse

- A second ticker or a raw wheel delta as a uniform.
- A corpus site's exact shader, curve or post values shipped as the signature: pattern pointers, never parts.
