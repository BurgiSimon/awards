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
| One Draco glb wordmark (151,636 B), decoder self-hosted (WASM 192,420 B) and disposed after load; every mesh merged into one geometry keeping position, normal and uv, centred and scaled to unit width; loaders in two lazy chunks | one hero object, no scene | [site:ascension-pegassi] | [verified, `curl -sI`] |
| Four glb totalling 751 KB through a self-hosted Draco decoder preloaded at boot; meshopt and KTX2 bundled but never registered; 380,000 instanced grass blades in 2,600 clusters, 45 % on phones | a world built from few files and one instanced field | [site:cutobot-byholm] | [verified]; per-file compression [unknown] |
| No models: a disc from `LatheGeometry` profiles (an edge ring of 256 segments, hub and matrix bands rippled by `.6 + .4·cos(3πt)`) and `RingGeometry` faces (220 segments); normal and roughness maps computed in an inline Blob Worker with a same-thread fallback, cached per size | the item object generated in code | [site:a24-raviklaassens] | [verified] |
| Six Draco plant glb, 11,424,460 B; each carries a baked growth clip whose tracks are merged into one `AnimationClip`; a 4k PNG normal map at 1,130,748 B; no KTX2 or meshopt | authored animation, heavy intake | [site:eugeniagrab] | [verified, content-length] |
| No models: the product is a photograph and only its label is 3D, a `LatheGeometry` of 17 points × 128 radial segments tipped 3° to match the photo's perspective | 3D on the one surface that turns | [site:agrumeafarm] | [verified] |

Rule: compress the meshes before the textures — a Basis set beside 23.5 MB of uncompressed geometry saves the smaller half [site:edolus] [inferred from the card's verified sizes]. Generate a turned object rather than load it, and render only the surface that moves [site:a24-raviklaassens] [site:agrumeafarm] [verified]; 11.4 MB of plants behind one page is the budget to beat [site:eugeniagrab] [verified].

## Lighting rigs

Why: an environment map, a baked lightmap or real-time lights each fix a different look and a different cost.

- **Few shadow casters, many fills.** A cubemap skybox (rotated 90° on z, intensity .8) and an RGBM studio environment; one directional and two warm spots (intensity 4 and 2) cast shadows into a 2048 atlas; nine more spot and point lights have shadows off; the car's contact shadow is a texture, not a light [site:edolus] [verified]. Clustered lighting on; tone mapping constant `4` with gamma correction [verified], read as ACES2 [inferred].
- **A built studio instead of an HDR file.** Emissive planes — one blue-tinted face panel (8.2 × 5.2 at .95), four crest bars (5–6), four sparkle strips (5–9) and three dark bars (.06–.1) — rendered once through `PMREMGenerator.fromScene` at 1,024 px as the only light on a chrome wordmark [site:ascension-pegassi] [verified]; a 1024 × 512 canvas painted with a dark gradient and four soft white bands, PMREM-filtered, plus a `RectAreaLight` strip 6 × .4 at 1.9 above the camera, ACES at exposure .86 and fog 7–14 [site:a24-raviklaassens] [verified]; PMREM `fromScene` of a procedural sky with per-world key, fill, rim and fog presets [site:cutobot-byholm] [verified]. The five 3D cards of the 2026-10-05 wave (every Teardowns row but EDOLUS, whose studio environment is RGBM) load no HDR file [verified on each].
- **One shadow caster for organic matte subjects.** PMREM from a generated scene at sigma .04, ambient .04, one key at 1.4 casting the only shadow (512², bias −3e-4, normalBias .025), a rim at .28, exposure .92 [site:eugeniagrab] [verified]. A larger world: PCF-soft shadows at 2048² for the near rig and 4096² across a wide one, 2048 on phones [site:cutobot-byholm] [verified].
- **Two lights for a label.** Ambient .89 and one spot (`.58 × 5`, angle π/4, penumbra .7, decay 1.2); no environment and no shadows, because the photograph already carries the light [site:agrumeafarm] [verified].

## Materials

Why: the material world is the site's palette in 3D; matcap, physical and custom shaders trade realism for control.

- **One glass, parameterised once.** A `trueGlass` script sets refraction on, IOR 1.5, thickness 1, roughness .35, surface opacity .6 [site:edolus] [verified]; reuse one glass definition rather than tuning each object.
- **Rim glow and implosion as shader materials.** An emissive Fresnel driven by a core-power uniform; a chip implosion on block size, scatter, spin and stagger uniforms [site:edolus] [verified]. 61 material assets across seven chapters [verified].
- **Patch the stock material.** `onBeforeCompile` is how this wave customises [verified on each]: a two-sine normal wobble (amount .03, scale .09) so a `MeshPhysicalMaterial` chrome (metalness 1, roughness .11, clearcoat .25, env 1.15) ripples like inflated foil [site:ascension-pegassi]; a luma ↔ colour mix at `<map_fragment>` driven by a progress uniform with per-plant saturation and gain (dandelion 1.65 / .44, echinacea 1.2 / 1.06), a screen-space alpha fade at `<dithering_fragment>` so stems dissolve before the canvas edge, and petal back-scatter `pow(·, 1.7) × .13` plus edge scatter `pow(·, 2.2) × .025` [site:eugeniagrab]; a seam band discarded by `uGap .09` and a label turned by `uOffset` on `MeshStandardMaterial` roughness .72 [site:agrumeafarm]; procedural grain on shell, rock and tile beside triplanar maps [site:cutobot-byholm].
- **One object, four physical materials.** Front clearcoat .8, roughness .42, metalness .48; back metalness 1, roughness .23, iridescence 1, IOR 1.86, thickness 140–900; hub transmission .68, IOR 2, thickness .6; edge roughness .04, metalness .55; transmission rendered at half resolution [site:a24-raviklaassens] [verified].

## Camera rigs

Why: the camera is the scroll model of a 3D site; its constraints, damping and keyboard path decide whether the visitor feels guided or trapped.

- **Keyframes on progress.** A perspective camera at fov 45 keyed on the progress value (`t .75 → y −18, z 15, rx −20`; `t .8 → z 110`), with tween defaults of 1.2 s `power2.inOut` [site:edolus] [verified].
- **Pointer look inside windows.** The cursor tilts the camera only in two progress windows — .26–.40 at pitch 5°, yaw 6°, roll .8°, and .71–1 at 4°, 3°, 1° — with smoothing .04 and faded window edges (.05 and .01) so the influence ramps in and out [site:edolus] [verified]. Bound the pointer to the chapters that earn it; outside them the camera is still.
- **Fit the camera to a DOM box.** Perspective fov 32 with the distance solved so the artboard width fills the box (`width / 2 / (tan(fov/2) × aspect)`), rendered into an 8-sample render target sized to the box × DPR [site:ascension-pegassi] [verified]; the composite is in `[pattern:webgl-architecture#html-lays-out-webgl-renders]`.
- **Keep the width, widen the fov.** Below a 16:9 design ratio the fov widens so the frame's width is preserved [site:cutobot-byholm] [verified]; its camera keys sit on film progress with position, target, follow and control fields and quadratic control points, smoothing 12, and a pointer look of yaw .08, pitch .046 at smoothing 3.2 [verified].
- **Rotate the group, not the camera.** fov 40 at z 4.4; the gallery group turns −30° / −30° and scales 1.08, items `hGap 2.3`, `depthGap 1`, inactive at .8 [site:a24-raviklaassens] [verified]. An orthographic camera framed to the label's 630 × 1013 aspect that never moves [site:agrumeafarm] [verified].

## Scroll-driven scenes

Why: chapters map to camera positions, animation clips or scene swaps; the mapping is the narrative.

- **Scene windows on one progress line.** Seven segments; a neighbour is enabled from half-way into the current one, with per-segment `preloadNextAt` / `dropPrevAt` overrides keeping one hand-off live; entities toggled with `enabled`, never destroyed [site:edolus] [verified]. The mount-and-dispose policy is `[pattern:webgl-architecture#scene-windows-and-disposal]`.
- **Stretch bands.** Five progress ranges cost more scroll — satellite .06–.085 ×1.5, map .205–.28 ×1.6, chip .545–.57 ×2.5, UI .57–.705 ×1.5, car .715–.84 ×1.5 — folded into one piecewise-linear raw ↔ progress map, overlapping bands discarded, so a dense beat gets time without re-timing its scene [site:edolus] [verified].
- **The float.** 32,000 px of wheel per run and 4,000 px of finger travel on touch, lerp .1 frame-corrected, arrow and Page keys stepping .12 of progress; after 1 s idle it snaps to the nearest of seven points within ± .014 [site:edolus] [verified]. An intro hold keeps the timeline at 0 while the first 1,200 px of scroll flies the opening object in [site:edolus] [verified].
- **One value drives the whole film.** Scene windows, camera keys, post presets, the stem mix and cursor states all read the same progress, so nothing drifts [site:edolus] [verified].
- **Scrub baked clips with `setTime`.** One timeline from `top top` to `bottom bottom`; plants at integer slots 0, 2, 4 and 6 of an 8-unit timeline, each slot a hand-off (1 unit, `power1.inOut`), a growth (.88 at + .88, `sine.inOut`) and a colour tween (.8 at + 1.04); each mixer is `setTime(progress × duration)` from GSAP-tweened refs, never `play()`; scrub 1.2 on desktop, .2 on the phone [site:eugeniagrab] [verified].
- **Hand off through the wayfinding element.** A circular `discard` patched in at `<clipping_planes_fragment>`, centred on the DOM progress dial's circle and grown to the farthest corner with a grained edge; the outgoing plant discards inside, the incoming one outside [site:eugeniagrab] [verified]; values in `[pattern:webgl-architecture#effect-parameters]`.
- **A clock with a speed limit.** Lenis progress drives a film clock that may move at most `3.8 × dt / filmSeconds` per frame, so a flick cannot outrun the story, on a body `100 + 170 × film-seconds` vh tall; an AUTO mode scrolls the document at a rate of 1.75 until any wheel or touch takes over; a floor set on entering the second world stops the visitor scrolling back [site:cutobot-byholm] [verified]. Keep the cap and the takeover; replace the floor with a chapter rail.

## Interaction and physics

Why: raycast hover, drag and physics make a scene a toy; each one needs a touch and keyboard answer.

- **Drag to rotate with weight.** Sensitivity .3, friction .95, weight 6, on mouse and touch; ray hits feed the fluid sims rather than picking; physics off [site:edolus] [verified]. No keyboard path, and the cursor's drag hint shows only for progress .44–.466 [site:edolus] [verified] — give the object arrow-key rotation and a visible focus.
- **Procedural gait, not clips.** Per-leg phase tables — wave `{LB 0, LF .25, RB .5, RF .75}` over .75 and trot `{LF 0, RB 0, RF .5, LB .5}` over .6 — on hip, knee and ankle bones, the feet meeting the ground wherever the body is [site:cutobot-byholm] [verified]; analytic IK [inferred].
- **A stepped gallery on a spring.** A float index snapped by a spring (frequency 9.5, damping 12); drag sensitivity .95, friction .89, velocity smoothing .32 capped at .5; hover tilt .21; raycast hover and click on per-item pick meshes; neighbours lean, bank and dip with travel velocity; reduced motion snaps directly [site:a24-raviklaassens] [verified]. Its keys and announcer are the model in `[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]`.
- **Tilt, glint, arrive.** Pointer tilt lerped .08 per 60 fps frame to a .15 rad lean, scroll adding a .08 π turn and .3 depth; the wordmark arrives from a π flip pushed back two camera distances over 1.5 s `expo.out`; glint sprites keyed to facet normals flare as the tilt points them at the viewer [site:ascension-pegassi] [verified]; glint values in `[pattern:webgl-architecture#effect-parameters]`.
- **An object pulled from its sleeve.** Progress pulls a disc out (smoothstep 0–.58), rolls it −120° and turns the sleeve π; a procedural 1,024² groove normal map (80 grooves at .35); drawn in a scissored viewport over its DOM rect [site:ascension-pegassi] [verified].
- **One revolution on hover.** After 260 ms of dwell on a fine pointer the label plays one revolution, its spring turn quantised to 1/2000 of a revolution so it stops re-rendering [site:agrumeafarm] [verified].
- **Weather on a spring.** Idle sway of two sines at .68°, and gusts every 2.4–5.5 s driving a spring (k 12, damping 3.8, 1.15°) [site:eugeniagrab] [verified].
- No 3D physics on any of the six (EDOLUS ships physics off); the one physics engine runs a 2D loader [site:agrumeafarm] [verified] (`[pattern:preloaders-and-transitions#preloader-archetypes]`).

Render policy for these cards — one renderer feeding many canvases, a renderer pool with idle prewarm, demand rendering, an upload queue, a one-way governor — is in `[pattern:webgl-architecture#scene-windows-and-disposal]`; the CUTOBOT post chain is in `[pattern:webgl-shaders#post-chains]`.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|
| EDOLUS | PlayCanvas Editor export; 12 uncompressed glb (23.5 MB) with Basis textures; skybox + RGBM environment, three shadow casters; a progress-keyed camera; seven scene windows toggled, not destroyed | stretch bands that give dense beats more scroll; pointer look bounded to two progress windows | [site:edolus] |
| Ascension | Nuxt; three r185; one fixed canvas over SSR DOM on desktop, none on phones; a Draco wordmark lit by a PMREM-baked studio of emissive panels; an offscreen MSAA target per hero object; redraw only on change | chrome with a normal wobble and tilt-keyed glints; a record pulled from its sleeve | [site:ascension-pegassi] |
| CUTOBOT | Vite; three r180; a 100 % canvas webfilm; four Draco glb and 380,000 instanced blades; PMREM sky presets; a stylising post chain; a one-way frame-time governor | a speed-capped film clock with an AUTO mode; procedural gait tables | [site:cutobot-byholm] |
| A24 (Ravi Klaassens) | Webflow export served by Astro; three r178, lazy; no model files; lathe discs with worker-built maps and four physical materials; a painted strip environment; a two-renderer pool with idle prewarm | a spring-snapped stepped gallery; generated turned objects | [site:a24-raviklaassens] |
| Yevgeniya Grab | React 18 + R3F over three r148; five canvases; six Draco plants with baked growth clips; three `onBeforeCompile` patches; demand rendering outside the story | `setTime` over merged clips on scroll; a grained hand-off centred on the DOM progress dial | [site:eugeniagrab] |
| Agrumea Farm | Nuxt; three r160 loaded 1 s after paint; no models; one offscreen renderer blitting labels into many 2D canvases under a shared pixel budget | 3D only on the label over a real photograph; per-jar springs | [site:agrumeafarm] |

## Recipe map

| Intent | Recipe |
|---|---|
| One hero object with inertia | [recipe:gl-hero-object-inertia] |
| Orbit model with hotspots | [recipe:gl-orbit-model-hotspots] |
| Camera on a virtual scroll | [recipe:gl-virtual-scroll-camera] |
| Quality tiers | [recipe:quality-tiers] |
| Frame-rate governor and idle gate | [recipe:gl-fps-governor-idle-gate] |
| Studio environment built at runtime | [recipe:gl-built-studio-environment] |
| Patched stock material, grey-to-colour hand-off | [recipe:gl-material-patch-reveal] |
| One renderer into many 2D canvases | [recipe:gl-one-context-many-canvases] |
| Lathe-turned procedural object | [recipe:gl-lathe-turned-object] |
| Spring-stepped canvas gallery with keys | [recipe:gl-spring-stepped-gallery] |
| One progress line, scene windows, capped clock | [recipe:gl-progress-scene-windows] |

## Verify

- [ ] The largest glb and every KTX2 set are listed with their sizes in `AWARDS.md ## Budgets & tiers`; decoders are served from the site, never a CDN.
- [ ] The camera rig answers arrow keys, PageUp/PageDown and Home/End, and has a reduced-motion tier.
- [ ] Scenes mount and dispose per window; `renderer.info.memory` is flat after three route changes.

## Refuse

- A model with no beat behind it; a scene the visitor cannot leave by keyboard.
- A backward ratchet on a timeline the visitor scrubs [site:cutobot-byholm] [verified].
- A corpus site's model, light rig or camera path shipped as the signature: pattern pointers, never parts.
