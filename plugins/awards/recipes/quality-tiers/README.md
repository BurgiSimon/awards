# quality-tiers

Probe the device once (DPR, memory, cores, GPU string, WebGL2) and time the first frames; hand every effect a tier and a budget. High: DPR ≤ 2, full effects. Mid: DPR ≤ 1.5, fewer particles and blur samples. Low: DPR 1, no post-processing, and a still instead of a field. Reduced motion overrides everything.

## Why
- **Winners measure before they spend.** Adaptive DPR, blur samples and geometry LOD from frame timing kept a shader-heavy site at 60 fps on budget phones `[site:why-zero]`; a four-tier device system and a three-tier content fallback did the same for a 70 %-mobile audience `[site:shopify-editions-w26]` (`[pattern:webgl-architecture]`).
- **Pixels, not DPR.** Mobile GPUs die on pixel count; the budget is an absolute `maxPixels` on top of the DPR cap (`applyRendererBudget` does the same for a Three renderer).
- **Low tier is a still, not a stutter.** A 20 fps particle field is worse than a good image. The still is a real `<img>` with alt text.
- **Probe once.** Every effect reads the profile; nothing re-measures, nothing flickers between tiers.

## Parameters
Sample `500 ms` of frames · score from memory, cores, GPU string, fps, WebGL2 · particles `600 / 240 / 0` · pixel caps `2560×1440 / 1920×1080 / 1280×720`.

## Accessibility
The forced-tier switch is a real button group with `aria-pressed`; the readout is `aria-live`; the canvas is `aria-hidden` and the fallback image carries alt text.

Seen in: `[site:why-zero]`, `[site:shopify-editions-w26]`, `[site:slosh-seltzer]`, `[site:igloo]`.
