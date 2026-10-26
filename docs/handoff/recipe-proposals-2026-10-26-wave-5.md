# Recipe proposals — corpus wave 5 (2026-10-26)

Wave 5 is a WebGL + 3D lens wave on four sites the maintainer named: oryzo (existing card, lens update), daikifujita, da-san333 and everswap. The maintainer asked for the WebGL and Three.js work region by region: hero, nav, footer and the whole page.

Candidates come from two places:
- `### Techniques and stacks` under `## Wave 5` in `docs/handoff/corpus-ledger.md`;
- the agents' lens notes in `.awards/research/<slug>/lens-notes.md`, which are gitignored. Their findings are carried into the cards' `### Tech lens:` sections.

A candidate is listed only when no title or tag in `recipes/*/recipe.json` or `recipes/README.md` covers it. Each entry generalises its technique; none copies a site's palette, copy, assets or signature values. All seven build under the recipe contract: headless SwiftShader, system fonts, procedural geometry and generated shapes only, and the pinned `three@0.186.0` or no dependency at all. No new pin is needed.

The maintainer asked for new recipes as part of the request, so the selection gate was answered in advance. All seven were built in the recipes phase.

## 1. `gl-swarm-light-field` — Footer swarm lit by the pointer, shadowed by a voxel light field (footer)
- Seen in: oryzo
- Tier: P1 · Deps: three@0.186.0
- Overlap:
  - `gl-ping-pong-grain-field` moves a GPU point field with no lighting.
  - `physics-pile-matter` is 2D physics.
  - This recipe adds a CPU swarm written to float `DataTexture`s and drawn in one instanced call.
  - It adds a point light at the pointer.
  - It adds AO and shadow from a sliced 3D occupancy atlas that the swarm splats with `MAX` blending.
  - Three.js loads only near the footer.
- Verify idea:
  - The occupancy atlas has lit voxels.
  - Rendering with the field at strength 1 and at 0 gives a luminance ratio below 0.95 and above 0.2.
  - The loop stops off screen.
  - Three.js is not fetched at the top of the page.
  - Reduced motion renders one settled frame.
- Lens: 3d

## 2. `gl-screen-paint-distortion` — Screen paint: a pointer field without a fluid solver (whole page)
- Seen in: oryzo, everswap (same studio framework)
- Tier: P1 · Deps: three@0.186.0
- Overlap:
  - `gl-fluid-wake-post` advects a velocity field with Gaussian splats.
  - This recipe paints capsule strokes with a speed-sized radius.
  - It self-advects along a blurred one-sixteenth copy, adds gradient-noise curl, and floors decay at 0.004 so 8-bit storage reaches zero.
  - It smears along the paint with 9 taps plus an oil-film fringe.
- Verify idea:
  - A resting pointer paints nothing.
  - A sweep raises the field energy.
  - The field returns to exactly 0.
  - A phone paints only while pressed.
- Lens: shader

## 3. `gl-grade-pass-scene-cuts` — Scene cuts inside the grade pass (whole page, footer)
- Seen in: everswap
- Tier: P1 · Deps: three@0.186.0
- Overlap:
  - `gl-rtt-composite-transition` blends two render targets.
  - `gl-noise-edge-theme-wipe` wipes a theme.
  - This recipe keeps one scene target. Its final pass carries three cuts: a staged full, half and quarter blur into a flat colour; a diamond iris over a frame frozen on its first frame, with the edge drawn by a 2D canvas in CSS pixels; and a footer iris onto the ground colour.
- Verify idea:
  - At the dip's peak the centre pixel is the flat colour and the scene has swapped.
  - Mid-iris the centre shows the new scene and the corner the frozen old one.
  - Scrolling back releases the still.
  - The close fills the corner with the ground.
  - Reduced motion makes hard switches.
- Lens: shader

## 4. `gl-dom-refraction-lens` — A glass object that refracts the page itself and travels between section anchors (hero, whole page, footer)
- Seen in: daikifujita
- Tier: P1 · Deps: three@0.186.0
- Overlap:
  - `gl-dispersion-stripes` disperses a procedural pattern.
  - `gl-built-studio-environment` lights chrome.
  - `gl-hero-object-inertia` keeps one object in the hero.
  - This recipe repaints the page's words and hairlines into a square canvas around the glass and refracts that through front normals and a back-face normal target. It adds 12-tap spectral dispersion, a Fresnel soft-box studio, and section anchors weighted by the middle band, followed on a spring.
- Verify idea:
  - Inside the glass the pixels are opaque with a luminance spread from the bent text, and colour splits at the rims.
  - Mid-travel the error is large.
  - Once settled the glass sits at each anchor.
  - Reduced motion places the glass without travel or spin.
- Lens: 3d

## 5. `gl-pointer-wake-reveal` — A pointer wake that opens the paper onto a second world (hero)
- Seen in: daikifujita
- Tier: P1 · Deps: three@0.186.0
- Overlap:
  - `image-trail-cursor` stamps images.
  - `gl-fluid-wake-post` distorts.
  - This recipe paints short-lived wake points as gradients into a small 2D canvas used as a mask. The world renders at 0.62 scale every second frame, and not at all at rest.
- Verify idea:
  - At rest nothing renders.
  - After a sweep the alpha is above 60 on the path and 0 off it.
  - The world renders fewer frames than the composite.
  - After 1.6 s the canvas is clear.
  - Touch and reduced motion get paper only.
- Lens: shader

## 6. `point-cloud-shape-morph` — Scroll morph between point clouds sampled from SVG shapes, on a 2D canvas (hero)
- Seen in: da-san333
- Tier: P1 · Deps: none
- Overlap:
  - `gl-ping-pong-grain-field` and `sprite-rain-canvas2d` move points with no shape targets.
  - This recipe projects the points in JavaScript and sorts them into 16 depth buckets. Scroll picks the shape pair, with 18 % holds, a swirl weighted by `sin²(πe)`, a burst on segment change and a pointer repel.
  - It skips the paint once the cloud has settled.
- Verify idea:
  - At rest the cloud has settled on its targets (error < 3 px) and the paint is skipped.
  - Mid-morph the swirl weight is above 0.5 and the points are moving.
  - The next shape holds.
  - The pointer pushes more than 40 points.
  - Reduced motion cross-fades with no travel.
- Lens: none (canvas 2D; the lens site's GL is the tunnel below)

## 7. `wordmark-header-handoff` — Hero wordmark that becomes the header logo, with an easing nav underline (nav)
- Seen in: oryzo
- Tier: P1 · Deps: none
- Overlap:
  - `knockout-wordmark-window` masks a ground through the name.
  - `nav-overlay-fullscreen` is a menu.
  - This recipe makes one fixed link, laid out in the header slot and transformed onto the hero's reference box, which unwinds as the hero leaves. The underline eases at `1 − e^(−10·dt)` and snaps.
- Verify idea:
  - At the top the mark covers the hero box.
  - After the hand-off it sits exactly in the slot.
  - The underline lands under the active link and stops writing styles.
  - The second Tab focuses the mark.
  - Reduced motion never moves it.
- Lens: none (DOM). None of the four sites draws GL in its nav; this is the nav finding.

## Not built (candidates left in this file)
- `gl-scroll-speed-tunnel`:
  - A point ring with a GPU-faded `LineSegments` ring buffer, keyed to scroll speed rather than position (da-san333). It overlaps `gl-virtual-scroll-camera` in spirit.
  - Build it next if a brief needs a velocity-driven ambient layer.
- `gl-texture-skinned-bird`:
  - Bones baked into float textures, with the wing beat clocked by scroll (everswap). It needs an authored rig, so it is not a procedural recipe.
- `gl-gpu-spline-trails`:
  - 24 spline trails × 256 nodes simulated in a 256 × 24 float target and drawn as instanced tubes (everswap).
- `gl-voronoi-fracture-carry`:
  - Pre-built Voronoi fracture sets chosen by hit direction, with pieces riding Catmull-Rom splines (daikifujita). It is heavy, and the card records it.
- `gl-dual-gate-camera-track`:
  - One baked camera track authored for a 2:1 desktop gate and a 1:2 portrait gate, whose focus distance drives the bokeh (everswap). It depends on DCC exports.
