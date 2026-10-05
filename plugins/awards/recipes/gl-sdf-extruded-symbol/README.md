# gl-sdf-extruded-symbol

A flat symbol given a polished-metal body without a model file. A 2D signed-distance mark is extruded with a depth and a rounded bevel, and one fullscreen triangle of raw WebGL2 raymarches it inside its bounding box with a fixed step budget. Shading is reflection only: a procedural studio environment, four-tap normals, four-tap ambient occlusion, a Schlick tint, inline ACES and gamma. Reduced motion, the static tier, a missing WebGL2 and a lost context all keep an SVG stroke still of the same mark.

The mark (a ring crossed by a bar), environment, colours and copy are synthetic demo content generated in code; no texture, model or font is downloaded.

## Why
- **Extrude, then round.** `w = (mark(p.xy) + bevel, |z| − (depth − bevel))`, `d = min(max(w.x, w.y), 0) + length(max(w, 0)) − bevel`. Shrinking the profile and the slab by the bevel first, and subtracting it after, gives every edge a quarter-round whose normals sweep from the face to the side; that sweep is what catches the light `[site:cyphercapital]` (`[pattern:webgl-shaders#shader-beats-by-kind]`, values in `[pattern:webgl-architecture#effect-parameters]`).
- **Any 2D SDF works.** `mark()` here is analytic (a ring and a capsule joined with `min`). For a real logo, rasterise its SVG path into a distance-field texture at load and sample it in `mark()`; the extrusion, march and shading do not change.
- **Clip before marching.** A ray–box test against the mark's bounds returns transparent for most pixels before a single step, which is what keeps a per-pixel raymarch inside budget.
- **Metal is the environment.** A dark front, a bright ring at grazing angles and one soft key: the face reflects the dark, the bevel reflects the ring, so the edge reads as chrome with no lamps. Schlick on a near-neutral tint lifts the grazing edge further.
- **Inline finish.** ACES fit and gamma in the same program: no render target, so no colour-space mismatch.
- **A designed fallback.** The SVG still is in the DOM from the start and only hides once a context has drawn, so the page never shows an empty stage; `webglcontextlost` brings it back.

## Parameters
Half-depth `.16` · bevel `.055` (ring radius `.62`) · `80` steps · hit `5e-4` · tint F0 `(.93, .94, .96)` · exposure `1.15` · camera distance `3.2`, focal `2.6` · intro: depth `.9 s`, yaw from −90° settling over `1.6 s`, then a `±.32 rad` sway at `.55 rad/s` · DPR cap `2`, pixel budget `2 M`. **These are this recipe's own values, not a site's.**

Keep the bevel below about a third of the depth and of the stroke half-width (`.08` here): past that the rounding eats the face and the mark reads as a tube.

## Tiers
- **Full:** intro then sway on the shared ticker while the stage intersects the viewport; the ticker stops on hidden tabs.
- **Reduced / static:** no context is created; the SVG stroke still shows.
- **No WebGL2, compile failure or context loss:** the SVG still shows and the canvas stays hidden.

`window.__symbol.freeze(yaw, depth)` pins a pose and `window.__symbol.loseContext()` forces the fallback, for verification and captures.

## Accessibility
The stage is `role="img"` with a label describing the mark; the canvas and the SVG are `aria-hidden`. Motion is a slow sway that never flashes and does not run under reduced motion.

## Adapters
- **three.js / R3F:** the fragment shader as a `ShaderMaterial` on a fullscreen triangle; keep the inline tone map or add `#include <colorspace_fragment>` and let the renderer do it.
- **Vue / Svelte / Astro:** call `start()` on mount; on unmount stop the ticker subscription, disconnect the observer and lose the context.

Seen in: `[site:cyphercapital]` (a brand symbol rasterised to a distance field and raymarched as extruded chrome, with a static SVG fallback).
