# gl-fluid-wake-post

One global, physically simulated layer instead of a dozen hover tricks: a velocity field is advected and dissipated every frame and splatted where the pointer moves, and a single full-frame pass distorts the rendered hero by that velocity and fringes its colour channels. The hero here is the DOM headline drawn into a texture; a real site renders its scene into the same target.

## Why
- **A unifier beats effects.** Everything on the canvas shares one wake, so the page reads as one material `[site:leo-parpeix]` (`[pattern:webgl-architecture#effect-parameters]`).
- **Advection only.** No pressure solve, no divergence pass: a wake that dissipates at `0.96` per frame, cheap enough for a small target on phones.
- **Two passes, one quad.** Simulation (ping-pong) then composite; the energy probe is a third tiny pass used only by tests.
- **Storage that exists everywhere.** Half-float targets where `EXT_color_buffer_(half_)float` exists, bytes with a dead zone otherwise (8-bit storage cannot hold a true zero).
- **Fallbacks are structural.** The DOM headline stays in the tree as the mirror; reduced motion and no-GL show it as plain DOM; DPR comes from the quality tier; everything is disposed on `pagehide`.

## Parameters
Field `128²` · dissipation `0.96` · advection `0.02` · splat force = pointer delta (UV) × 10, clamped ±1 · splat variance `0.0015` at rest, `0.002` moving · distortion `0.09` · chroma `0.02`. **These are this recipe's own values, not a site's.** They were once traced to `[site:leo-parpeix]` through an educational clone; the 2026-09-18 live pass of that site found a fluid at `resolution 0.2` of the viewport with `mouse_force 80`, `dissipation 0.98` and a velocity-driven hash blur with no colour fringing at all [verified, live bundle 2026-09-18]. Tune these against your own render, not against a corpus number.

## Accessibility
`aria-hidden` canvas, DOM mirror of the headline, no gesture required to read anything, no simulation under reduced motion.

Seen in: `[site:leo-parpeix]`; a six-pass sibling on `[site:lando-norris]`.
