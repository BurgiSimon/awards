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
| Refractive object | an object that belongs to the page because it bends the page | a back-face normal target and the DOM repainted into a texture behind the object (`[pattern:webgl-architecture#text-in-webgl]`), sampled in spectral taps; the work's picture marched as a block inside the ice; instanced splinters with an RGB split, point glints with a star sprite, a shadow quad at render order −2 | [site:daikifujita] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Tethered plane | a preview that answers focus as well as hover | an 18 × 26 certificate plane bent by velocity with an RGB split, drawn only while shown | [site:daikifujita] | [verified] |
| Line and point field | ambience that answers how fast the visitor scrolls | points on a hollow cylinder flying forward by scroll speed, each move stamped as a line segment the GPU fades by age | [site:da-san333] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Line and point field | light trails through a valley, one lit per audience | 24 GPU-simulated spline trails drawn as instanced tubes | [site:everswap] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Fullscreen or backdrop field | the product's own noun as a surface | water drawn in post from two Worley layers, advected by the pointer, rising over a cut | [site:everswap] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]` |
| Halftone weave | every picture on the page, film included, in one texture and the brand's two inks | a cell grid over clips graded on black: one bar per cell, as wide as the cell is dark; near-black drops as the key, so clips composite as cut-outs; each layer's black and white points (inverted when black is above white), grid and box are the tween targets that develop, swap and fly it | [site:son-daven] | [verified]; values in `[pattern:webgl-architecture#effect-parameters]`, `[recipe:gl-video-dither-layers]` |

Forty-odd programs, all named-uniform planes or point sets, sorted into five kinds [site:edolus] [verified]: the count is a 100 % canvas campaign's, not a target; the sort is the useful part — pick the kind per beat, then reuse one program per kind. The small end of the same sort: four programs and no render target [site:cyphercapital], four programs and two float ping-pong pairs [site:aqualoqa] [verified on both]; two programs, no render target and no post at all [site:da-san333] [verified].

## Uniform contract

Why: scroll, pointer, velocity and time reach the GPU as named, damped numbers on one ticker; the names and rest values are part of the design.

- **One pointer family across every field.** `uMousePush / uMouseRadius / uPushAlong / uPushOut / uPushSwirl / uTrailAge` with one set of defaults reused by the corridor, the dust and the plexus, so every particle field answers the hand the same way [site:edolus] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Progress as the master uniform.** One 0–1 progress gates every program, post preset, cursor state and sound band; a sim runs only inside its window (the ripple at .77–.98) [site:edolus] [verified].
- **Tweened uniforms.** Melt, hover and progress uniforms as GSAP targets with a `killTweensOf` first [site:why-zero] [verified]; values in `[pattern:gsap-choreography#driving-gl-from-timelines]`.
- **Order in the data, not in the timeline.** Each texel of the pipe mask carries a branch id in R and a 16-bit arc length across G and B; one uniform array, `u_branchReveal[4]`, then turns any path set into a trim-path reveal whose tip rounds like a cap [site:cyphercapital] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **A phase eased toward a target, no time uniform.** The swirl's phase moves at `1 − e^(−6t)` toward a target, so the field rests when the target rests [site:cyphercapital] [verified]; that scroll sets the target is [inferred].
- **Post profiles as data, rebuilt every frame.** One profile object of about forty numbers and colours (bloom, halo, bokeh, vignette, saturation, contrast, tint, screen paint, SMAA); each frame starts from the default, every live scene `blend()`s its own by its ratio (numbers mixed, colours mixed through `Color`), and one sync writes the passes [site:oryzo] [verified]. A chapter change is then a cross-fade of grades with no tween to kill. The same framework rebuilds three scene profiles on another site: hero bloom 1.5663 at threshold .72129 with bokeh f/3 at focal 16 and an exit blur over ratio .85–.95; the valley's bokeh off and its radial blur centred on whichever trail is lit; lake bloom .95977 at .61101 with f/10 at focal 100 [site:everswap] [verified].
- **One paint field, many readers.** The pointer's screen-paint field (`#render-targets-and-transitions`) feeds the distortion pass and three more readers: the GL title, whose fill it erases while lighting a travelling outline dash; the water, whose cells it advects; the footer ground, where it draws a `sin(vel × 40 + (0, 2, 4) × 10)` wake [site:everswap] [verified] `[recipe:gl-screen-paint-distortion]`.
- **Occlusion as a uniform array.** Up to six picture rects go in as `uHideR[6]`, and the object's ice, splinters and glints `discard` inside them, so it passes behind the DOM's images — but not its text, which dark pieces then cover [site:daikifujita] [verified].
- **Age on the GPU.** A per-vertex birth time compared with one time uniform fades and discards each streak, so the CPU only appends to a ring buffer [site:da-san333] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Clamp the hand, protect the message.** The brush reads pointer delta clamped per frame, and a painted mask through `smoothstep(.25, .75)` scales the force to zero over the content that must stay legible — the screen of a buried television [site:aqualoqa] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.

## Noise and field toolbox

Why: the noise family and its octave count set the texture of the whole site.

- Curl + fbm for skies, an octave count exposed as a uniform beside a mobile flag, value noise for a burn edge and fbm for a softer dissolve [site:edolus] [verified uniform names; octave values unknown]. One family per job, chosen once, keeps forty programs reading as one hand.
- 2D simplex to bend the stripes, 3-octave 3D simplex fbm for a domain-warped sheen, and interleaved gradient noise (`fract(52.9829189 × fract(dot(xy, vec2(.06711056, .00583715)))) / 255`) as the dither in three of four programs [site:cyphercapital] [verified].
- Fields built at runtime from vectors, at zero texture bytes: the pipe mask from bezier branches in a module Worker, 2048 wide when `max(vw, vh × 1.25) ≥ 1024` and 1024 otherwise; an R16F edge field (0 on the centreline, 1 at the sides, R32F fallback) read with a 4-tap bicubic B-spline for smooth crease shading; the logo's distance field from its SVG path [site:cyphercapital] [verified].
- Anti-alias a procedural stripe from its phase, not its colour: `fwidth` of the continuous phase capped at `.2 × blur`, and coverage re-thresholded as `(g − .5) / fwidth(g) + .5` [site:cyphercapital] [verified].
- No noise family at all: a 1102² texture of `Math.random()` bytes gives each grain one random vector, and an artist's height map (R/G the uphill gradient, B the height) supplies the terrain the grains slide on [site:aqualoqa] [verified]; two sines for a point cloud's jitter [site:da-san333] [verified].
- Sin-hash value noise with 4-octave fbm (`p·2.03 + 17`), Hoskins-hash 3D value noise, an interleaved-gradient dither and Voronoi cells in a warped space for ice [site:daikifujita] [verified].
- One family per job across a whole world: 4D simplex with analytic derivatives for the water warp, fog morph, cloud drift and smoke width; 3D simplex for trail radius; Worley for the water cells; value-noise fbm on the CPU for camera shake; one 128² blue-noise texture for jitter and dither [site:everswap] [verified].

## Render targets and transitions

Why: section transitions and feedback effects live in render targets; their size and type decide the frame budget.

- **Ping-pong pairs by job.** Four pairs, all RGBA16F with an RGBA8 fallback: the pointer ripple, a light trail at 512², two cloud sims at 256² [site:edolus] [verified]. Size by what the eye reads — a trail that is looked at gets 512², a backdrop drift gets 256². Ripple size, format and values in `[pattern:webgl-architecture#effect-parameters]`.
- **A scene drawn into a mesh.** A screen render target with depth draws one scene into a monitor model inside another [site:edolus] [verified].
- **The scene cut as a pass.** Chapter changes run through a chromatic transition in the post queue with a dip to white, not through a second composited scene [site:edolus] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Float state for a point field.** Two ping-pong pairs at 1102²: a wake timer, and motion with displacement in RG and velocity in BA; RGBA32F under WebGL2 with `EXT_color_buffer_float`, else WebGL1 with `OES_texture_float`, else the effect is skipped and the photograph and video stay; nearest filtering, swapped every frame [site:aqualoqa] [verified].
- **Reveal a second layer, not a hole.** A points pass at each grain's home paints a prepared under-image where the grain has moved far enough; a reset glides the displacement home and then clears the buffers [site:aqualoqa] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **Screen paint instead of a solver.** A quarter-resolution ping-pong field (RGBA8, velocity around .5, two weights) plus a sixteenth-resolution blurred copy: a capsule stroke from the last pointer position to this one, self-advection along the blurred copy, curl from analytic-gradient noise, decay floored so 8-bit storage reaches zero; any pass may read it [site:oryzo] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`, `[recipe:gl-screen-paint-distortion]`.
- **A voxel grid in a 2D atlas.** A 32 × 16 × 16 occupancy grid stored as an R8 sliced atlas; one-pixel points splatted with `MAX` blending, a pass that blurs across slices and eases toward the new occupancy through a ping-pong pair, sampled with manual interpolation between slices [site:oryzo] [verified]; `[recipe:gl-swarm-light-field]`.
- **Cuts inside the grade pass.** Every scene change — a blur dip, a frozen-frame iris, the close onto the ground — happens in the grade pass, the outgoing frame held in a cache target where it is needed, so two worlds never render at once [site:everswap] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`, archetypes in `[pattern:preloaders-and-transitions#transition-archetypes]`, `[recipe:gl-grade-pass-scene-cuts]`.
- **Simulate on the GPU, draw once.** One pass a frame writes 24 trails × 256 nodes into a 256 × 24 float target; one instanced draw reads it as tubes [site:everswap] [verified]. Beside it a two-phase flow map over six tiles that sample their neighbours across seams, lit trail masks re-saturating the path × 1.35 [verified].
- **A back face into a target.** A BackSide pass writes the object's far-side normals into a target below the output DPR, and the front shader reads them as the second surface of thick glass [site:daikifujita] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`, `[recipe:gl-dom-refraction-lens]`.
- **A mask onto a second world.** A pointer trail painted into a small mask opens the page onto another engine drawn under the content at reduced scale every second frame [site:daikifujita] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`, `[recipe:gl-pointer-wake-reveal]`.
- **No render target.** Tone mapping, gamma and dither inline in each program; no framebuffer is created [site:cyphercapital] [verified]. A halftone weave needs none either: each layer is a quad, read once per cell, blended straight into the canvas [site:son-daven] [verified].

## Post chains

Why: post order changes the image (grain before or after the grade, bloom before or after the wake); this section records shipped orders with values.

| Order | Notes | Site | Confidence |
|---|---|---|---|
| film grain (.02 at 24 fps) → bokeh (maxBlur .02) → bloom → chromatic transition → satellite-feed screen effect | bloom is disabled in the scene, yet bloom and vignette presets are tweened .9 s `power2.inOut` on every chapter change (one preset: threshold .2, intensity 1.4); depth of field is pulled by scroll band | [site:edolus] | [verified script order and values]; that script order is render order [inferred]; the presets do nothing for bloom [inferred] |
| RenderPass → GTAO (half resolution, radius .35, 8 samples, off by default) → bloom from a separate composer at .4 scale (strength .55, radius .4, threshold .85) → depth of field (off) → OutputPass → painterly quadrant filter (radius 6, step 2, sharpness 18) → ink contour from the GTAO depth and normals (threshold .1, thickness 1.4) → grade (vignette, warm base) → transition → lens shell with grain .045 → dither (desktop only) → portal lens (refraction .1, noise .035, chroma .006) | a stylisation stack after the output pass, so the render reads drawn; the frame-time governor drops the painterly pass last | [site:cutobot-byholm] | [verified values and order]; reading the filter as Kuwahara [inferred] |
| TAA (history .8, velocity from a second colour attachment) → FXAA while TAA runs, else SMAA (.05) → bokeh (quality 0 on phones) → an edge-glow pass gated on its own amount → a magazine layer → bloom (no convolution) → box blur → screen-paint distortion → final grade with a per-frame dither seed and the preloader mask | every pass skips itself at amount 0, and a per-scene profile sets the amounts | [site:oryzo] | [verified order and defaults] |
| none in GL; grain as a separate 2D canvas of eight 192 px random tiles at half resolution, overlay at .07, redrawn every third frame | the cheapest grain is outside the context | [site:aqualoqa] | [verified] |
| SMAA (.05) → half-res bokeh → bloom → radial blur → depth-reprojected motion blur (.35) → water pass → Final → paint distortion (`renderOrder 10`, after the grade) | the studio parts as on Oryzo; selective bloom from the alpha channel; the scene cuts and an authored 2:1 frame live in Final, which clamps uv.x to ± 1/aspect and smears blue noise beyond it on ultra-wide screens | [site:everswap] | [verified] |
| scene into HalfFloat with depth → `UnrealBloomPass(256², .58, .42, .4)` → a blur pass → `OutputPass` → a 31 KB final pass: liquid-glass UI from rounded-rect SDFs, an ink outline from the Laplacian of inverse depth, a portal mask, halation with an anamorphic streak, grain, a squircle vignette that reddens at low life, cinemascope bars | the second world's game HUD drawn in the last pass; eye adaptation in a 1 × 1 ping-pong (.2 / .05); scene render scale capped apart from the output DPR | [site:daikifujita] | [verified] |

Rule: a preset that tweens a disabled pass is dead weight — check that every tweened parameter reaches a live pass; so is a convolution bloom with a procedural star kernel built and then switched off by a constant [site:everswap] [verified]. The scroll-banded focus pull is in `[pattern:webgl-architecture#effect-parameters]`.

## Text in shaders

Why: GL text must keep a DOM twin; this section records how the corpus distorts type without losing it.

- Canvas-2D textures for chapter type (`worldText`, `CardDesign` and others), blurred on hover by pointer distance, and six cuts of the display face baked to PlayCanvas glyph atlases [site:edolus] [verified]. No DOM twin, no headings, `lang` null [site:edolus] [verified] — the miss; the mirror rule is `[pattern:webgl-architecture#text-in-webgl]`.
- **Glyphs as curves, no atlas.** Text layers fetch per-face glyph JSON and binaries and shade each glyph from its quadratic Bézier curves, held in a 1,024-wide float texture, by counting ray crossings in x and y per pixel; per-element rect, progress, mode and colour live in rows of a data texture [site:ascension-pegassi] [verified]. A hovered link lights through a backlight pass marching from each pixel toward the pointer through the text mask [verified]; values in `[pattern:webgl-architecture#effect-parameters]`. Every string is also SSR HTML under an `sr-only` `h1` [site:ascension-pegassi] [verified] — the twin the row above lacks.
- **One context, many words.** A detached WebGL2 canvas renders a sheen for each word — glyphs drawn with `fillText` into a 2D canvas as the mask, an fbm domain warp over it — and `drawImage`s the result into that word's own 2D canvas [site:cyphercapital] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **A headline the pointer erases.** Two title meshes in camera space, scaled to the DOM `h1`'s rect and drawn from a camera frozen at track ratio .112, extrude as `pos.z *= endRatio` while the shot moves on; the paint field erases the fill by `1 − smoothstep(.2, .5, weight)` and lights a travelling outline dash [site:everswap] [verified]. Its DOM twin is hidden — the miss in `[pattern:webgl-architecture#text-in-webgl]`.
- **Type in a fluid.** Display type rasterised per element is advected in 20 taps along a pointer fluid's flow, with a two-colour leading and trailing edge, over headings that stay DOM [site:daikifujita] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|
| EDOLUS | PlayCanvas 2.21.4, one canvas, 40-odd named-uniform programs in five kinds, four ping-pong pairs, a grain → bokeh → bloom → chromatic → screen queue, all on one progress value; a frame-time DPR governor (`[pattern:webgl-architecture#scene-windows-and-disposal]`) and a warm-up walk behind the gate (`[pattern:preloaders-and-transitions#preloader-archetypes]`) | one pointer-push uniform family shared by every particle field; a focus pull banded to scroll | [site:edolus] |
| Cypher Capital | raw WebGL2, four programs in four modules, no library; masks and fields generated from vector paths in a Worker; one detached context shared by many word canvases; inline tone map and dither, no render target; DPR ≤ 2 and ≤ 12.5 MP | arc length packed in two channels for a trim-path reveal; a 2D SDF raymarched into a chrome logo | [site:cyphercapital] |
| Aqualoqa | raw WebGL2 with a WebGL1 float fallback, four programs; two float ping-pong pairs at 1102²; ≈ 1.21 M points twice a frame with no idle gate or tier; grain on a separate 2D canvas; a port of an open-source sand toy, credited in the source | a terrain and a protect mask on a pointer brush; a hole pass that reveals a prepared under-image | [site:aqualoqa] |
| Oryzo | three r178 patched; one canvas; a ten-pass queue whose amounts come from per-scene profiles blended by ratio; a screen-paint field read by the distortion pass; a voxel light field for 1,024 instanced beans; TAA with an MRT velocity target | screen paint without a solver; occupancy-atlas AO and shadow | [site:oryzo] |
| EverSwap | three r148 under the same studio framework as Oryzo; one WebGL2 context; an eight-pass queue ending in a paint distortion after the grade; scene profiles rebuilt each frame; GPU spline trails; water drawn in post | scene cuts inside the grade pass; one paint field read by title, water and footer | [site:everswap] [verified] |
| Daiki Fujita | three 0.169.0 from esm.sh in a Framer code component; a fixed canvas over the DOM; the page repainted behind a glass object; a back-face normal target; stable fluids in a context of their own; a second engine under the page opened by a pointer mask, with a 31 KB final pass | two-surface refraction in spectral taps; picture rects as an occlusion array | [site:daikifujita] [verified] |
| Son Daven | raw WebGL 1, one dither program compiled per canvas, fifteen canvases and contexts on the home page; a quad per layer over the whole canvas with a bounds discard; a 25-read key ring per fragment; a `<video>` per layer per scene, uploaded only when `currentTime` moved; each canvas on its own rAF capped at 60 fps and stopped off screen; no render target, no post | footage graded on black, woven into two brand tokens by levels that GSAP tweens | [site:son-daven] |
| Daiki Fujita (Portfolio, 2025) | three r136 for one overlay; two programs, no render target, no post; an opaque canvas blended away with `lighten` | a line ring buffer faded by birth time on the GPU; ambience driven by scroll speed | [site:da-san333] [verified] |

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
| Pointer paint without a solver | [recipe:gl-screen-paint-distortion] |
| Scene cuts inside the grade pass | [recipe:gl-grade-pass-scene-cuts] |
| A pointer wake that opens a second world | [recipe:gl-pointer-wake-reveal] |
| Keyed footage woven as bars or ASCII glyphs | [recipe:gl-video-dither-layers] |
| Every woven scene on a page from one context | [recipe:gl-dither-scene-pool] |

## Verify

- [ ] Every custom material ends its fragment stage with `#include <colorspace_fragment>`.
- [ ] Every uniform is fed from the one ticker, with a named rest value.
- [ ] The post chain order is written in `AWARDS.md ## Budgets & tiers` and no shader compile warning reaches the console.

## Refuse

- A second ticker or a raw wheel delta as a uniform.
- A point field drawn every frame while nothing moves [site:aqualoqa] [verified].
- A corpus site's exact shader, curve or post values shipped as the signature: pattern pointers, never parts.
