# WebGL 3D scenes

What this file is for: the deep 3D path of `awards:webgl` (`--3d`), depth rungs 4–5 of `[pattern:webgl-architecture#the-depth-ladder]`: scene-level model intake, lighting rigs, materials, camera rigs, scroll-driven scenes, interaction and physics. Export pipeline, encoders and byte budgets stay in `[pattern:asset-pipeline]`; camera library API in `stacks/camera-controls-3.1.md`; renderer API in `stacks/three-0.186.md`. Cite as `[pattern:webgl-3d-scenes#section]`. Every row carries the card's confidence label; asset sizes come from response headers only.

## Contents
1. [Model intake](#model-intake)
2. [Lighting rigs](#lighting-rigs)
3. [Materials](#materials)
4. [Camera rigs](#camera-rigs)
5. [Scroll-driven scenes](#scroll-driven-scenes)
6. [Interaction and physics](#interaction-and-physics)
7. [Teardowns](#teardowns)
8. [Recipe map](#recipe-map)
9. [Verify](#verify) · [Refuse](#refuse)

## Model intake

Why: formats, compression, instancing and level of detail decide whether the scene loads on a phone at all.

| Intake | Mechanism | Site | Confidence |
|---|---|---|---|
| Uncompressed glb | 12 containers with no Draco or meshopt decoder registered; one animation clip on the satellite through a state graph, everything else scripted from progress | [site:edolus] | [verified]; byte counts in `[pattern:asset-pipeline#budget-stories]` |
| Basis beside the source | 17 material textures carry a `basis` variant next to their WebP or JPG; reflection and HDR-like maps ship as RGBM PNG with no variant; the transcoder WASM is not preloaded | [site:edolus] | [verified] |
| Draco + KTX2 atlases, decoders self-hosted, assets demand-loaded per stage | the counter-model | [site:why-zero] | [verified] |

Rule: compress the meshes before the textures — a Basis set beside 23.5 MB of uncompressed geometry saves the smaller half [site:edolus] [inferred from the card's verified sizes].

## Lighting rigs

Why: an environment map, a baked lightmap or real-time lights each fix a different look and a different cost.

- **Few shadow casters, many fills.** A cubemap skybox (rotated 90° on z, intensity .8) and an RGBM studio environment; one directional and two warm spots (intensity 4 and 2) cast shadows into a 2048 atlas; nine more spot and point lights have shadows off; the car's contact shadow is a texture, not a light [site:edolus] [verified]. Clustered lighting on; tone mapping constant `4` with gamma correction [verified], read as ACES2 [inferred].

## Materials

Why: the material world is the site's palette in 3D; matcap, physical and custom shaders trade realism for control.

- **One glass, parameterised once.** A `trueGlass` script sets refraction on, IOR 1.5, thickness 1, roughness .35, surface opacity .6 [site:edolus] [verified]; reuse one glass definition rather than tuning each object.
- **Rim glow and implosion as shader materials.** An emissive Fresnel driven by a core-power uniform; a chip implosion on block size, scatter, spin and stagger uniforms [site:edolus] [verified]. 61 material assets across seven chapters [verified].

## Camera rigs

Why: the camera is the scroll model of a 3D site; its constraints, damping and keyboard path decide whether the visitor feels guided or trapped.

- **Keyframes on progress.** A perspective camera at fov 45 keyed on the progress value (`t .75 → y −18, z 15, rx −20`; `t .8 → z 110`), with tween defaults of 1.2 s `power2.inOut` [site:edolus] [verified].
- **Pointer look inside windows.** The cursor tilts the camera only in two progress windows — .26–.40 at pitch 5°, yaw 6°, roll .8°, and .71–1 at 4°, 3°, 1° — with smoothing .04 and faded window edges (.05 and .01) so the influence ramps in and out [site:edolus] [verified]. Bound the pointer to the chapters that earn it; outside them the camera is still.

## Scroll-driven scenes

Why: chapters map to camera positions, animation clips or scene swaps; the mapping is the narrative.

- **Scene windows on one progress line.** Seven segments; a neighbour is enabled from half-way into the current one, with per-segment `preloadNextAt` / `dropPrevAt` overrides keeping one hand-off live; entities toggled with `enabled`, never destroyed [site:edolus] [verified]. The mount-and-dispose policy is `[pattern:webgl-architecture#scene-windows-and-disposal]`.
- **Stretch bands.** Five progress ranges cost more scroll — satellite .06–.085 ×1.5, map .205–.28 ×1.6, chip .545–.57 ×2.5, UI .57–.705 ×1.5, car .715–.84 ×1.5 — folded into one piecewise-linear raw ↔ progress map, overlapping bands discarded, so a dense beat gets time without re-timing its scene [site:edolus] [verified].
- **The float.** 32,000 px of wheel per run and 4,000 px of finger travel on touch, lerp .1 frame-corrected, arrow and Page keys stepping .12 of progress; after 1 s idle it snaps to the nearest of seven points within ± .014 [site:edolus] [verified]. An intro hold keeps the timeline at 0 while the first 1,200 px of scroll flies the opening object in [site:edolus] [verified].
- **One value drives the whole film.** Scene windows, camera keys, post presets, the stem mix and cursor states all read the same progress, so nothing drifts [site:edolus] [verified].

## Interaction and physics

Why: raycast hover, drag and physics make a scene a toy; each one needs a touch and keyboard answer.

- **Drag to rotate with weight.** Sensitivity .3, friction .95, weight 6, on mouse and touch; ray hits feed the fluid sims rather than picking; physics off [site:edolus] [verified]. No keyboard path, and the cursor's drag hint shows only for progress .44–.466 [site:edolus] [verified] — give the object arrow-key rotation and a visible focus.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|
| EDOLUS | PlayCanvas Editor export; 12 uncompressed glb (23.5 MB) with Basis textures; skybox + RGBM environment, three shadow casters; a progress-keyed camera; seven scene windows toggled, not destroyed | stretch bands that give dense beats more scroll; pointer look bounded to two progress windows | [site:edolus] |

## Recipe map

| Intent | Recipe |
|---|---|
| One hero object with inertia | [recipe:gl-hero-object-inertia] |
| Orbit model with hotspots | [recipe:gl-orbit-model-hotspots] |
| Camera on a virtual scroll | [recipe:gl-virtual-scroll-camera] |
| Quality tiers | [recipe:quality-tiers] |
| Frame-rate governor and idle gate | [recipe:gl-fps-governor-idle-gate] |

## Verify

- [ ] The largest glb and every KTX2 set are listed with their sizes in `AWARDS.md ## Budgets & tiers`; decoders are served from the site, never a CDN.
- [ ] The camera rig answers arrow keys, PageUp/PageDown and Home/End, and has a reduced-motion tier.
- [ ] Scenes mount and dispose per window; `renderer.info.memory` is flat after three route changes.

## Refuse

- A model with no beat behind it; a scene the visitor cannot leave by keyboard.
- A corpus site's model, light rig or camera path shipped as the signature: pattern pointers, never parts.
