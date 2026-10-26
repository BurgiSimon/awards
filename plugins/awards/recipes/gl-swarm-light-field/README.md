# gl-swarm-light-field

A closing beat for a footer: a swarm of small instanced objects drifting along a spiral path behind the footer's copy, lit by a point light that rides the pointer, with ambient occlusion and shadow taken from a coarse voxel grid of where the swarm is. The objects here are generated seeds; a real site swaps in its own small object (a bean, a pill, a bolt, a petal).

## Why
- **Shadow without shadow maps.** Every object splats one pixel into a 32 × 16 × 16 voxel grid stored as a sliced 2D atlas, with `MAX` blending. One pass blurs across neighbouring voxels and slices and eases toward the new occupancy. The object shader reads AO one voxel along its normal and shadow one and two voxels toward the light. A thousand objects shade each other for the price of one 96 × 96 target. The architecture is the one `[site:oryzo]` ships in its footer [verified, `hoisted.CRsATKbF.js`, 2026-10-26].
- **A light the visitor holds.** The point light floats in front of the swarm at the pointer, so moving the mouse moves the shading. On touch, or before any pointer, it idles on a slow figure-eight.
- **CPU state, GPU draw.** About a thousand objects are cheap to simulate in JavaScript. A spatial hash keeps the contact pass O(n). Positions and quaternions go into two float `DataTexture`s that one instanced draw reads by instance index, so the field pass reuses the same positions without a second upload.
- **The footer pays for itself only at the end.** Three.js is a dynamic import fetched when the footer is within a screen of the viewport. The loop runs only while the footer is visible.

## Parameters
| | |
|---|---|
| Count | 32² = 1,024 on a desktop, 24² = 576 on a phone, a coarse pointer or a low quality tier |
| Path | diagonal (−1.1, .36) → (1.1, −.36) landscape; (−.45, .85) → (.45, −.85) portrait; curve amplitude .1 at frequency 8, phase speed .25; spiral radius up to .2 at frequency 8 × random(0–2) |
| Motion | drift .2 units/s (rate 2), pull-back rate .5, damping 1, contact distance 1.4 × the half-length |
| Pointer | sphere radius .2, push .25, carry of the pointer's motion × 6 decaying at e^(−10·dt) |
| Light | .3 in front of the swarm plane, eased to the pointer at 12/s; power 2.2, attenuation 1 / (1 + 9 d²); specular exponent 80 − 40 × per-object brightness |
| Field | 32 × 16 × 16 (16 × 32 × 16 portrait) over the swarm's bounds; RGBA8 atlas 96 × 96; rise .15, fall .05 a frame; AO `(1 − .55 occ)²`, shadow `(1 − .7 block)²`; a dense swarm fills nearly every voxel of its core, so full-strength occlusion turns the interior black |

These are this recipe's own values. Oryzo's footer runs a smaller world (object radius .01 on a path of about 1.1 units) and an O(n²) contact pass. Take the architecture; tune the numbers against your own object and frame.

## Tiers
- **Full:** simulation, field and render every frame while the footer is on screen.
- **Reduced motion:** one settled frame, with the field computed instantly and the light parked. Re-rendered on resize only.
- **Static** (`data-motion="static"`) **or no WebGL 2:** no canvas, and the footer is plain DOM on its ground colour.

## Accessibility
The canvas is `aria-hidden`. Every word, link and the form sit in the DOM above it with 44 px targets. Nothing in the footer depends on the pointer.

## Adapters

### Webflow
- Designer: the Footer element with class `site-footer` (`position: relative; overflow: hidden`). The module inserts `<canvas class="gl" aria-hidden="true">` as its first child, so the Designer never holds it. Footer copy, form and links stay native Webflow elements on a higher `z-index`.
- Inject: a Footer-code `<script type="module">` that imports this module only when `IntersectionObserver` reports the footer within a screen. Keep the Three.js import dynamic so pages that never reach the footer never fetch it ([recipe:boot-lenis-gsap] for the loader shape).
- No Webflow interaction on the footer background: the swarm owns that layer. Interactions on the copy are fine.
- Reduced motion or no WebGL 2: no canvas, and the Webflow footer is the footer.

Seen in: `[site:oryzo]` (footer bean field and its light field).
