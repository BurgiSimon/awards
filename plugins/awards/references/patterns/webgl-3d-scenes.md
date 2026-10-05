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

<!-- filled by wave 4 synthesis from `### Tech lens: 3D` subsections -->

## Lighting rigs

Why: an environment map, a baked lightmap or real-time lights each fix a different look and a different cost.

## Materials

Why: the material world is the site's palette in 3D; matcap, physical and custom shaders trade realism for control.

## Camera rigs

Why: the camera is the scroll model of a 3D site; its constraints, damping and keyboard path decide whether the visitor feels guided or trapped.

## Scroll-driven scenes

Why: chapters map to camera positions, animation clips or scene swaps; the mapping is the narrative.

## Interaction and physics

Why: raycast hover, drag and physics make a scene a toy; each one needs a touch and keyboard answer.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|

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
