# gl-hero-object-inertia

One object with weight. The pointer sets a target orientation; a damped spring chases it, so the object overshoots and settles like a thing with mass; scroll adds a full turn across two viewports. Lit by a generated matcap (a lit sphere baked into a 256 px texture): no HDRI, no download.

## Why
- **One object beats a world.** A single hero object with real inertia and lighting carries a launch page; the corpus's loudest single-object sites use exactly this dosage `[site:oryzo]` (`[pattern:webgl-architecture#the-depth-ladder]`).
- **A spring, not a lerp.** `a = k·(target − x) − c·v` gives overshoot and settle; a lerp only decays. `k = 18`, `c = 5.5` is a firm object; lower `c` for a wobblier one.
- **Matcap lighting** is consistent from every angle at the cost of one small texture; swap in a photographed matcap for a specific material, or a Draco glb under 300 KB for a real product `[site:lando-norris]`.
- **Budgeted and mirrored.** Geometry detail and DPR follow the quality tier; a still image stays in the DOM for no-GL and reduced-motion visitors; everything is disposed on `pagehide`.

## Parameters
Spring `k 18`, `c 5.5` · pointer range `±0.6 rad` (y), `±0.4 rad` (x) · scroll turn `2π` over `2 × innerHeight` · geometry `200×32 / 120×20 / 64×12` by tier.

Seen in: `[site:oryzo]`, `[site:lando-norris]`.
