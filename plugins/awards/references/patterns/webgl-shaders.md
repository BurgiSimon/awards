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

| Kind | What it is for | Example | Site | Confidence |
|---|---|---|---|---|
| Fullscreen or backdrop field | a world's sky or atmosphere behind a chapter | `nebula` / `nebula2` (curl + fbm), `aurora` with an octave uniform and a mobile switch, a cloud transition, an energy field | [site:edolus] | [verified uniform names] |
| Line and point field | data made visible as motion | `plexus` (80 points, link distance .9, at most 3 links), `matrix` (a 7 × 4 corridor of 14 side + 6 top lines × 22 particles), `dustLight` (300 curl particles) | [site:edolus] | [verified] |
| Dissolve | a narrative cut: the object leaves the story | `rackDissolve` on value noise with a burn edge, `centerDissolve` on fbm, `chipDissolve` | [site:edolus] | [verified] |
| Uniform-heavy system | one diagram-like beat with many parts | `infraGrid`, ≈ 60 uniforms of avenues, nodes and impact rings | [site:edolus] | [verified] |
| Screen effect | the frame itself as a device | `satelliteFeed` (scanlines, lens, chroma), `textblur` | [site:edolus] | [verified] |

Forty-odd programs, all named-uniform planes or point sets, sorted into five kinds [site:edolus] [verified]: the count is a 100 % canvas campaign's, not a target; the sort is the useful part — pick the kind per beat, then reuse one program per kind.

## Uniform contract

Why: scroll, pointer, velocity and time reach the GPU as named, damped numbers on one ticker; the names and rest values are part of the design.

- **One pointer family across every field.** `uMousePush / uMouseRadius / uPushAlong / uPushOut / uPushSwirl / uTrailAge` with one set of defaults reused by the corridor, the dust and the plexus, so every particle field answers the hand the same way [site:edolus] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Progress as the master uniform.** One 0–1 progress gates every program, post preset, cursor state and sound band; a sim runs only inside its window (the ripple at .77–.98) [site:edolus] [verified].
- **Tweened uniforms.** Melt, hover and progress uniforms as GSAP targets with a `killTweensOf` first [site:why-zero] [verified]; values in `[pattern:gsap-choreography#driving-gl-from-timelines]`.

## Noise and field toolbox

Why: the noise family and its octave count set the texture of the whole site.

- Curl + fbm for skies, an octave count exposed as a uniform beside a mobile flag, value noise for a burn edge and fbm for a softer dissolve [site:edolus] [verified uniform names; octave values unknown]. One family per job, chosen once, keeps forty programs reading as one hand.

## Render targets and transitions

Why: section transitions and feedback effects live in render targets; their size and type decide the frame budget.

- **Ping-pong pairs by job.** Four pairs at RGBA16F with an RGBA8 fallback: pointer ripple and a light trail at 512², two cloud sims at 256² [site:edolus] [verified]. Size by what the eye reads — a trail that is looked at gets 512², a backdrop drift gets 256². Ripple values in `[pattern:webgl-architecture#effect-parameters]`.
- **A scene drawn into a mesh.** A screen render target with depth draws one scene into a monitor model inside another [site:edolus] [verified].
- **The scene cut as a pass.** Chapter changes run through a chromatic transition in the post queue with a dip to white, not through a second composited scene [site:edolus] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.

## Post chains

Why: post order changes the image (grain before or after the grade, bloom before or after the wake); this section records shipped orders with values.

| Order | Notes | Site | Confidence |
|---|---|---|---|
| film grain (.02 at 24 fps) → bokeh (maxBlur .02) → bloom → chromatic transition → satellite-feed screen effect | bloom is disabled in the scene, yet bloom and vignette presets are tweened .9 s `power2.inOut` on every chapter change (one preset: threshold .2, intensity 1.4); depth of field is pulled by scroll band | [site:edolus] | [verified script order and values]; that script order is render order [inferred]; the presets do nothing for bloom [inferred] |

Rule: a preset that tweens a disabled pass is dead weight — check that every tweened parameter reaches a live pass. The scroll-banded focus pull is in `[pattern:webgl-architecture#effect-parameters]`.

## Text in shaders

Why: GL text must keep a DOM twin; this section records how the corpus distorts type without losing it.

- Canvas-2D textures for chapter type (`worldText`, `CardDesign` and others), blurred on hover by pointer distance, and six cuts of the display face baked to PlayCanvas glyph atlases [site:edolus] [verified]. No DOM twin, no headings, `lang` null [site:edolus] [verified] — the miss; the mirror rule is `[pattern:webgl-architecture#text-in-webgl]`.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|
| EDOLUS | PlayCanvas 2.21.4, one canvas, 40-odd named-uniform programs in five kinds, four ping-pong pairs, a grain → bokeh → bloom → chromatic → screen queue, all on one progress value; a frame-time DPR governor (`[pattern:webgl-architecture#scene-windows-and-disposal]`) and a warm-up walk behind the gate (`[pattern:preloaders-and-transitions#preloader-archetypes]`) | one pointer-push uniform family shared by every particle field; a focus pull banded to scroll | [site:edolus] |

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
