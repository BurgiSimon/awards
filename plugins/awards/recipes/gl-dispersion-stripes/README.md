# gl-dispersion-stripes

A liquid-metal stripe field with chromatic dispersion, in one fullscreen triangle of raw WebGL2. The stripe phase is a rotated ramp bent by a radial bump and 2D simplex noise; red and blue read the same stripe at a shifted phase, so every edge splits into colour fringes while the flats stay neutral. Each edge is anti-aliased from the phase with a `fwidth` re-threshold, and tone mapping, gamma and dither run inline, with no render target.

The stripe field, slab silhouette, colours and copy are synthetic demo content generated in code; no texture, model or font is downloaded. Colours come from the page tokens (`--ground`, `--ink`), converted to linear before shading.

## Why
- **Dispersion is a phase offset, not a post pass.** Three evaluations of one cheap function, offset per channel, give the prism fringe with no extra render target or blur `[site:cyphercapital]` (`[pattern:webgl-shaders#noise-and-field-toolbox]`, values in `[pattern:webgl-architecture#effect-parameters]`).
- **Anti-alias the phase, not the colour.** `cov = clamp((g − .5) / max(fwidth(g) × blur, 1e-5) + .5, 0, 1)` turns the triangle-wave phase `g` into a coverage that is exactly as soft as `blur` screen pixels at any zoom or DPR. `blur 1` is a hairline edge; `4` reads as liquid.
- **Guard the division.** Where `g` is flat (the fold of the triangle wave, or any clamped field), `fwidth` is exactly zero; without `max(…, 1e-5)` the edge divides by zero and, under SwiftShader, can blow a whole region opaque.
- **Inline finish.** A Narkowicz ACES fit, gamma `1/2.2` and interleaved gradient noise (`52.9829189`) dither in the same program: no framebuffer, so no colour-space mismatch between passes and no banding on the dark flats.

## Parameters
Repetition `5` stripes across the short side · angle `.35 rad` · shiftRed `.06`, shiftBlue `.05` (phase units; one period = 1) · bump `.22` · simplex distortion `.12` · blur `4 × fwidth` · drift `.18` periods a second · exposure `1.1` · slab half-size `.44 × .34` of the stage, corner radius `.08` of the short side · DPR cap `2`, pixel budget `4 M`. **These are this recipe's own values, not a site's.**

Keep the two shifts below about `.15`: past that the fringes read as separate stripes instead of one edge splitting.

## Tiers
- **Full:** the phase drifts on the shared ticker while the stage intersects the viewport; the ticker stops on hidden tabs.
- **Reduced:** one still frame at a fixed time; no drift, no loop.
- **Static:** the same still frame.
- **No WebGL2 / shader failure:** the canvas stays hidden and the stage keeps its plain ground.

`window.__stripes.freeze(t)` pins the clock for verification and captures.

## Accessibility
The canvas is `aria-hidden`; the stripes carry no information. The drift is slow, continuous and never flashes; it does not run under reduced motion. Text stays in the DOM.

## Adapters
- **three.js / R3F:** the fragment shader as a `ShaderMaterial` on a fullscreen triangle; pass linear colours and add `#include <colorspace_fragment>` if you drop the inline gamma.
- **Vue / Svelte / Astro:** call `start()` on mount; on unmount stop the ticker subscription, disconnect the observer and lose the context.

Seen in: `[site:cyphercapital]` (liquid-metal stripes with per-channel phase shifts and a `fwidth` coverage re-threshold behind a hero mask).
