# gl-dom-refraction-lens

One faceted glass object sits over the page and refracts the page itself. The words and hairlines around it are painted again into a small square canvas. The glass bends that canvas through its front and back faces at several wavelengths, so what shows inside it is the text it covers, split into colour at the rims. Each section names an anchor; the glass follows their weighted mean on a stiff spring, from the hero to the footer.

## Why
- **The page is the material.** There is no environment map to tune and no photograph to license: the glass refracts the page's own words and hairlines. `[site:daikifujita]` builds its whole awake page around one such crystal [verified, `shared-lib.CTuRAKaB.mjs`, 2026-10-26].
- **Repaint only the square that matters.** Only a square region around the glass is repainted: about twice the radius plus the largest refraction offset, snapped to 48 px steps. Repaints happen only when the region or the scroll changes, and at most every 30 ms (12 ms during a fast scroll).
- **Two surfaces, not one.** A back-face pass writes the exit normals into a target at 0.6 of the device pixel ratio. The front face refracts in through its own normal and out through the back one, which is what makes facets read as thick glass.
- **Dispersion as weighted taps.** Twelve wavelengths (six on touch) with an index of refraction of 1.31 ± 0.03, each weighted into red, green and blue by Gaussians centred at 0.8, 0.5 and 0.2 (σ 0.19), then normalised per channel.
- **Anchors, not keyframes.** Each section declares `data-anchor="x,y,size"` in viewport fractions. Its weight is its overlap with the middle half of the viewport. The glass follows the weighted target on a spring of stiffness 46, damped just under critical, so it arrives without drifting past.

## Parameters
| | |
|---|---|
| Glass | convex hull of 18 seeded points plus two tips; flat facets; radius = anchor size × short side / 2 (× 1.35 under 760 px) |
| Refraction | IOR 1.31, spread .06, thickness .9 × radius in CSS px; frost `.05 + .22 × (1 − n·v)^1.6`; Fresnel `.06 + .94 × (1 − n·v)^4` |
| Studio | a grey ramp and three soft boxes at 4×, 7× and 4×; the key drifts on `sin(t × .21)`, `cos(t × .17)` |
| Back texture | 1,024² (512² on touch); region ≤ .75 × the longer side |
| Motion | spring 46, damping `2√46 × .94`; idle spin .25 rad/s plus the scroll velocity × 8e-4 (± 1.6); pointer tilt eased at 4/s |

These are this recipe's own values. The source site runs a far larger shader with fractures, memories and a dream mode; this recipe keeps the refraction and the travel.

## Tiers
- **Full:** as above.
- **Reduced motion:** the glass is placed at the current anchor, with no travel, no spin and a still studio. It still refracts.
- **Static or no WebGL:** no glass. The page is complete without it.

## Accessibility
The canvas is `aria-hidden` and ignores the pointer, so every link under the glass still works. Words covered by the glass are still in the DOM, unchanged; the glass shows a bent copy of them. Keep the glass off form fields and body copy that must be read at rest; the anchors decide where it sits.

## Adapters

### Webflow
- Designer: give each Section a custom attribute `data-anchor` ("0.76,0.5,0.24"), and give every text element the glass should bend `data-paint`. A fixed Embed holds `<canvas class="gl" aria-hidden="true">` above the content (`pointer-events: none`).
- Inject from Footer code after `document.fonts.ready`: the back texture is painted from computed fonts and word boxes measured with `Range` rects, re-measured on resize.
- No Webflow interaction that moves `data-paint` text after load, or the painted copy and the DOM disagree under the glass.

Seen in: `[site:daikifujita]`.
