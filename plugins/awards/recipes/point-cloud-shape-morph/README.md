# point-cloud-shape-morph

A hero of a few thousand points that become one shape, then the next, as the page scrolls. The points are sampled from SVGs rasterised once, projected in JavaScript and drawn as small squares on a 2D canvas. It uses no WebGL. The scroll position picks which two shapes to blend and by how much. Each shape holds still at both ends of its segment. The cloud swirls only mid-morph, and the pointer parts it.

## Why
- **A rung below the GPU.** The perspective is one division per point and the depth order is sixteen buckets. A 2D canvas draws five thousand squares a frame without a WebGL context, a shader compile or a lost-context path. `[site:da-san333]` builds its whole hero this way [verified, `ScrollCounter.By-DpzJw.mjs`, 2026-10-26].
- **Holds make shapes readable.** Each shape holds for the first and last 18 % of its segment. In between, a quadratic in-out ease blends the targets and a swirl weighted by `sin²(πe)` adds motion that is zero at rest and peaks half-way.
- **Shapes as data.** A new shape is an SVG string. Points take its opaque pixels on a 2 px grid of a 512 px raster.
- **It stops when it is done.** A settled cloud with no pointer and no blend in progress skips its paint, and the loop stops when the hero leaves the screen.

## Parameters
| | |
|---|---|
| Points | 5,000 on a desktop, 2,500 on a phone or a coarse pointer; dot 1.6 px × perspective scale; alpha `clamp((scale − .85) × 3.3, .25, 1)` |
| Projection | horizontal fov 45° (40° coarse), camera at 800 (600 coarse), depth ± 60 px, 16 buckets far to near |
| Scroll | progress over the section's travel, followed at `1 − e^(−2.45·dt)`; hold 18 % at both ends; quadratic in-out between |
| Motion | spring 42, damping 8 (per second), stepped at a fixed 1/60 s of real time; swirl 260 px/s × `sin²(πe)`; burst 520 px/s decaying over 260 ms on each segment change |
| Pointer | radius 100 px (200 coarse), repel `(1 − d/R)³ × 6,000` px/s² against the spring (about 140 px at the centre) with a tangential half-share of 1.5 |

These are this recipe's own values. The source site runs 6,000 points with its own tuning and re-matches scattered points through a spatial hash; see the variants in `recipe.json`.

## Tiers
- **Full:** as above.
- **Reduced motion and static:** points never travel. The two settled shapes of the current segment are drawn and cross-faded by opacity, rendered on scroll only, and the pointer does nothing.

## Accessibility
The canvas is `aria-hidden`. The three practices it stands for are an ordered list in the DOM, with `aria-current` on the active one. The counter is decorative.

## Adapters

### Webflow
- Designer: a Section `morph` (300vh) with a sticky Div `morph__stage` (100vh) and an Embed holding `<canvas class="morph__canvas" aria-hidden="true">`. The list and title are native elements above it.
- Inject the module from Footer code. The shapes are SVG strings in the module; paste your own marks there, not as Webflow assets.
- Keep the section height fixed. The scroll arithmetic reads its rect.

Seen in: `[site:da-san333]`.
