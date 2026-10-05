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
| Fullscreen or backdrop field | a material that is the brand's image | liquid-metal stripes over a runtime mask of branching pipes, one triangle drawn from `gl_VertexID`; a metallic swirl by gradient advection behind the dark chapters | [site:cyphercapital] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Raymarched SDF object | a logo with depth and no model file | an SVG path rasterised to an R16F distance field, extruded with a bevel and raymarched with AO and a Fresnel tint | [site:cyphercapital] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Line and point field | a ground the hand moves | ≈ 1.21 M photo-coloured grains drawn twice a frame — once to paint an under-image where grains left, once as round points | [site:aqualoqa] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |

Forty-odd programs, all named-uniform planes or point sets, sorted into five kinds [site:edolus] [verified]: the count is a 100 % canvas campaign's, not a target; the sort is the useful part — pick the kind per beat, then reuse one program per kind. The small end of the same sort: four programs and no render target [site:cyphercapital], four programs and two float ping-pong pairs [site:aqualoqa] [verified on both].

## Uniform contract

Why: scroll, pointer, velocity and time reach the GPU as named, damped numbers on one ticker; the names and rest values are part of the design.

- **One pointer family across every field.** `uMousePush / uMouseRadius / uPushAlong / uPushOut / uPushSwirl / uTrailAge` with one set of defaults reused by the corridor, the dust and the plexus, so every particle field answers the hand the same way [site:edolus] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Progress as the master uniform.** One 0–1 progress gates every program, post preset, cursor state and sound band; a sim runs only inside its window (the ripple at .77–.98) [site:edolus] [verified].
- **Tweened uniforms.** Melt, hover and progress uniforms as GSAP targets with a `killTweensOf` first [site:why-zero] [verified]; values in `[pattern:gsap-choreography#driving-gl-from-timelines]`.
- **Order in the data, not in the timeline.** Each texel of the pipe mask carries a branch id in R and a 16-bit arc length across G and B; one uniform array, `u_branchReveal[4]`, then turns any path set into a trim-path reveal whose tip rounds like a cap [site:cyphercapital] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **A phase eased toward a target, no time uniform.** The swirl's phase moves at `1 − e^(−6t)` toward a target, so the field rests when the target rests [site:cyphercapital] [verified]; that scroll sets the target is [inferred].
- **Clamp the hand, protect the message.** The brush reads pointer delta clamped per frame, and a painted mask through `smoothstep(.25, .75)` scales the force to zero over the content that must stay legible — the screen of a buried television [site:aqualoqa] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.

## Noise and field toolbox

Why: the noise family and its octave count set the texture of the whole site.

- Curl + fbm for skies, an octave count exposed as a uniform beside a mobile flag, value noise for a burn edge and fbm for a softer dissolve [site:edolus] [verified uniform names; octave values unknown]. One family per job, chosen once, keeps forty programs reading as one hand.
- 2D simplex to bend the stripes, 3-octave 3D simplex fbm for a domain-warped sheen, and interleaved gradient noise (`fract(52.9829189 × fract(dot(xy, vec2(.06711056, .00583715)))) / 255`) as the dither in three of four programs [site:cyphercapital] [verified].
- Fields built at runtime from vectors, at zero texture bytes: the pipe mask from bezier branches in a module Worker, 2048 wide when `max(vw, vh × 1.25) ≥ 1024` and 1024 otherwise; an R16F edge field (0 on the centreline, 1 at the sides, R32F fallback) read with a 4-tap bicubic B-spline for smooth crease shading; the logo's distance field from its SVG path [site:cyphercapital] [verified].
- Anti-alias a procedural stripe from its phase, not its colour: `fwidth` of the continuous phase capped at `.2 × blur`, and coverage re-thresholded as `(g − .5) / fwidth(g) + .5` [site:cyphercapital] [verified].
- No noise family at all: a 1102² texture of `Math.random()` bytes gives each grain one random vector, and an artist's height map (R/G the uphill gradient, B the height) supplies the terrain the grains slide on [site:aqualoqa] [verified].

## Render targets and transitions

Why: section transitions and feedback effects live in render targets; their size and type decide the frame budget.

- **Ping-pong pairs by job.** Four pairs at RGBA16F with an RGBA8 fallback: pointer ripple and a light trail at 512², two cloud sims at 256² [site:edolus] [verified]. Size by what the eye reads — a trail that is looked at gets 512², a backdrop drift gets 256². Ripple values in `[pattern:webgl-architecture#effect-parameters]`.
- **A scene drawn into a mesh.** A screen render target with depth draws one scene into a monitor model inside another [site:edolus] [verified].
- **The scene cut as a pass.** Chapter changes run through a chromatic transition in the post queue with a dip to white, not through a second composited scene [site:edolus] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Float state for a point field.** Two ping-pong pairs at 1102²: a wake timer, and motion with displacement in RG and velocity in BA; RGBA32F under WebGL2 with `EXT_color_buffer_float`, else WebGL1 with `OES_texture_float`, else the effect is skipped and the photograph and video stay; nearest filtering, swapped every frame [site:aqualoqa] [verified].
- **Reveal a second layer, not a hole.** A points pass at each grain's home paints a prepared under-image where the grain has moved far enough; a reset glides the displacement home and then clears the buffers [site:aqualoqa] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **No render target.** Tone mapping, gamma and dither inline in each program; no framebuffer is created [site:cyphercapital] [verified].

## Post chains

Why: post order changes the image (grain before or after the grade, bloom before or after the wake); this section records shipped orders with values.

| Order | Notes | Site | Confidence |
|---|---|---|---|
| film grain (.02 at 24 fps) → bokeh (maxBlur .02) → bloom → chromatic transition → satellite-feed screen effect | bloom is disabled in the scene, yet bloom and vignette presets are tweened .9 s `power2.inOut` on every chapter change (one preset: threshold .2, intensity 1.4); depth of field is pulled by scroll band | [site:edolus] | [verified script order and values]; that script order is render order [inferred]; the presets do nothing for bloom [inferred] |
| RenderPass → GTAO (half resolution, radius .35, 8 samples, off by default) → bloom from a separate composer at .4 scale (strength .55, radius .4, threshold .85) → depth of field (off) → OutputPass → painterly quadrant filter (radius 6, step 2, sharpness 18) → ink contour from the GTAO depth and normals (threshold .1, thickness 1.4) → grade (vignette, warm base) → transition → lens shell with grain .045 → dither (desktop only) → portal lens (refraction .1, noise .035, chroma .006) | a stylisation stack after the output pass, so the render reads drawn; the frame-time governor drops the painterly pass last | [site:cutobot-byholm] | [verified values and order]; reading the filter as Kuwahara [inferred] |
| none in GL; grain as a separate 2D canvas of eight 192 px random tiles at half resolution, overlay at .07, redrawn every third frame | the cheapest grain is outside the context | [site:aqualoqa] | [verified] |

Rule: a preset that tweens a disabled pass is dead weight — check that every tweened parameter reaches a live pass. The scroll-banded focus pull is in `[pattern:webgl-architecture#effect-parameters]`.

## Text in shaders

Why: GL text must keep a DOM twin; this section records how the corpus distorts type without losing it.

- Canvas-2D textures for chapter type (`worldText`, `CardDesign` and others), blurred on hover by pointer distance, and six cuts of the display face baked to PlayCanvas glyph atlases [site:edolus] [verified]. No DOM twin, no headings, `lang` null [site:edolus] [verified] — the miss; the mirror rule is `[pattern:webgl-architecture#text-in-webgl]`.
- **Glyphs as curves, no atlas.** Text layers fetch per-face glyph JSON and binaries and shade each glyph from its quadratic Bézier curves, held in a 1,024-wide float texture, by counting ray crossings in x and y per pixel; per-element rect, progress, mode and colour live in rows of a data texture [site:ascension-pegassi] [verified]. A hovered link lights through a backlight pass marching from each pixel toward the pointer through the text mask [verified]; values in `[pattern:webgl-architecture#effect-parameters]`. Every string is also SSR HTML under an `sr-only` `h1` [site:ascension-pegassi] [verified] — the twin the row above lacks.
- **One context, many words.** A detached WebGL2 canvas renders a sheen for each word — glyphs drawn with `fillText` into a 2D canvas as the mask, an fbm domain warp over it — and `drawImage`s the result into that word's own 2D canvas [site:cyphercapital] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|
| EDOLUS | PlayCanvas 2.21.4, one canvas, 40-odd named-uniform programs in five kinds, four ping-pong pairs, a grain → bokeh → bloom → chromatic → screen queue, all on one progress value; a frame-time DPR governor (`[pattern:webgl-architecture#scene-windows-and-disposal]`) and a warm-up walk behind the gate (`[pattern:preloaders-and-transitions#preloader-archetypes]`) | one pointer-push uniform family shared by every particle field; a focus pull banded to scroll | [site:edolus] |
| Cypher Capital | raw WebGL2, four programs in four modules, no library; masks and fields generated from vector paths in a Worker; one detached context shared by many word canvases; inline tone map and dither, no render target; DPR ≤ 2 and ≤ 12.5 MP | arc length packed in two channels for a trim-path reveal; a 2D SDF raymarched into a chrome logo | [site:cyphercapital] |
| Aqualoqa | raw WebGL2 with a WebGL1 float fallback, four programs; two float ping-pong pairs at 1102²; ≈ 1.21 M points twice a frame with no idle gate or tier; grain on a separate 2D canvas; a port of an open-source sand toy, credited in the source | a terrain and a protect mask on a pointer brush; a hole pass that reveals a prepared under-image | [site:aqualoqa] |

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
| GPU point field with float ping-pong state | [recipe:gl-ping-pong-grain-field] |
| Ordered stroke reveal from an arc-length mask | [recipe:gl-arc-length-mask-reveal] |
| Dispersion stripes with fwidth anti-aliasing | [recipe:gl-dispersion-stripes] |
| Raymarched extruded SDF symbol | [recipe:gl-sdf-extruded-symbol] |
| Rendering off the main thread | [recipe:offscreen-canvas-worker] |

## Verify

- [ ] Every custom material ends its fragment stage with `#include <colorspace_fragment>`.
- [ ] Every uniform is fed from the one ticker, with a named rest value.
- [ ] The post chain order is written in `AWARDS.md ## Budgets & tiers` and no shader compile warning reaches the console.

## Refuse

- A second ticker or a raw wheel delta as a uniform.
- A point field drawn every frame while nothing moves [site:aqualoqa] [verified].
- A corpus site's exact shader, curve or post values shipped as the signature: pattern pointers, never parts.
