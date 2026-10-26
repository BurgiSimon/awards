# gl-screen-paint-distortion

A pointer field that looks like fluid but solves nothing. The pointer paints a capsule stroke into a quarter-resolution target. The target advects itself along a blurred sixteenth-resolution copy of its own velocity, curling through gradient noise. One post pass smears the rendered frame along that velocity and adds an oil-film fringe where the stroke thins out. The hero here is the DOM hero drawn into a texture; a real site samples its own rendered scene.

## Why
- **A wake at a fraction of a solver's cost.** No divergence, no pressure iterations. The swirl comes from advecting along a blurred copy plus the analytic gradient of one noise octave. This is `[site:oryzo]`'s screen paint [verified, `hoisted.CRsATKbF.js`, 2026-10-26]; `[recipe:gl-fluid-wake-post]` is the advect-and-splat sibling for comparison.
- **Strokes, not dots.** Each frame paints a capsule from the last pointer position to this one, so a fast flick leaves an unbroken mark. Its radius grows with the distance moved, so a resting pointer paints nothing and a slow drag paints thinly.
- **8-bit storage everywhere.** Velocity is stored around 0.5. Both weights decay by at least 0.004 a frame, so the field reaches exact zero instead of stalling a step above it. That is also what lets the tests compare the field with zero.
- **One field, many readers.** The paint target is a texture any pass can sample: a smear here, a reveal mask or a light map elsewhere.

## Parameters
| | |
|---|---|
| Field | quarter resolution, RGBA8 ping-pong; xy velocity around .5, z slow weight (keep .985), w fast weight (keep .75); velocity keep .985 |
| Stroke | capsule from the last to the current pointer; radius 0 → 100 CSS px as the pointer moves 0 → 100 px in a frame; velocity input `(to − from) × dt × .8`, with the previous input kept at .8 |
| Advection | along the blurred low copy × 25 texels, plus gradient-noise curl at scale .06 and strength 1.75, weighted by the local paint |
| Low copy | sixteenth resolution, separable 9-tap Gaussian at 4 texels |
| Smear | 9 taps along `velocity × amount 20 / 4 × multiplier 5` per paint texel, jittered by interleaved gradient noise; fringe `sin((vx + vy) × 40 + (0, 2, 4) × .5)` × `smoothstep(.4, −.9, weight)` × shade 1.25 × colour 10 |

These are this recipe's own values. The field constants match the source they came from; the smear's amount, multiplier and colour gain are tuned for a flat hero, not taken from a scene's post profile.

## Tiers and input
- **Fine pointer:** paints on movement.
- **Coarse pointer:** paints only while a finger is down, so scrolling a phone does not smear the page.
- **Reduced motion or no WebGL:** no field and no canvas; the hero is plain DOM.

## Accessibility
The canvas is `aria-hidden`. The hero's words stay in the DOM as the mirror, hidden only while the GL copy is drawn. Nothing is reachable only through the effect.

## Adapters

### Webflow
- Designer: a hero Section `hero` (`position: relative; min-height: 100svh; overflow: hidden`) with its label, H1 (`data-hero-title`) and lede as native elements. The module inserts `<canvas class="gl" aria-hidden="true">` as the Section's first child.
- The hero is redrawn into the texture from computed fonts, so load the faces first (Site settings → Fonts) and start the module behind `document.fonts.ready`. Put `html.gl-active [data-hero-title] { visibility: hidden }` and `html.gl-active .gl { display: block }` in Head code.
- No Webflow interaction on the hero copy: the texture is taken from the resting layout.
- Inject from Footer code only for the full motion tier ([recipe:quality-tiers], [recipe:reduced-motion-switch]); dispose on `pagehide`.

Seen in: `[site:oryzo]` (its post queue's screen-paint distortion); also in `[site:everswap]`, the same studio framework.
