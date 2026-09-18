# gl-postprocessing-presets

Bloom, grain and anti-aliasing through the `postprocessing` composer, with three fixed presets (hero 1.5, chapter 0.5, quiet 0.25) instead of a free intensity dial. Presets are how a multi-scene site stays coherent; the low quality tier gets no post pass at all.

## Why
- **Fixed presets, not dials.** A site with six scenes and three bloom values reads as one world; a per-scene dial drifts `[site:lando-norris]` (`[pattern:webgl-architecture#post-processing]`).
- **One pipeline.** pmndrs `postprocessing` merges effects into single passes; never mix it with Three's own EffectComposer in one page.
- **Half-float where it exists, bytes on low tier**, SMAA instead of MSAA on mobile, and the composer skipped entirely when the tier says so (`[recipe:quality-tiers]`).
- **Grain is a material policy**, not a filter: a low, constant overlay that makes flat colour read as surface `[site:igloo]`.

## Parameters
Bloom `1.5 / 0.5 / 0.25`, threshold `0.6`, smoothing `0.2`, mipmap blur · grain overlay `.18 / .12 / .06` · SMAA on every tier that renders post.

Seen in: `[site:lando-norris]`, `[site:igloo]`, `[site:united-carriers]` (glow on one hue).
