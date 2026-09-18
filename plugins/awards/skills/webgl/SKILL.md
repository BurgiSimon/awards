---
name: webgl
description: "Build the WebGL layer of an award-level site with Three.js 0.186, OGL, React Three Fiber or Threlte: DOM-tethered image planes with velocity distortion, a fluid-wake post-process, depth-map 2.5D parallax, scroll-driven camera rigs on a virtual scroll, render-to-texture section transitions, procedural landscapes, one hero object with inertia, particles, bloom and grain post-processing, plus the Blender to glTF + Draco + KTX2 pipeline, adaptive quality tiers, disposal, a semantic DOM mirror and a no-GL, reduced-motion fallback. Use when asked for 3D, WebGL, shaders, GLSL, Three.js, R3F, OGL, particles, liquid, fluid or distortion effects, image hover distortion, a 3D hero, scroll-scrubbed models or any canvas effect beyond CSS, and when a canvas site is slow, drifts against the DOM or renders dark. Not for DOM-only motion (awards:motion), charts, or 'make it 3D' with no concept behind it."
argument-hint: "[effect or scene] [--lib three|ogl|r3f] [--tier low|mid|high]"
---

# awards:webgl

Fix the dose before the first mesh, let the DOM own layout, feed scroll and pointer to the shaders as numbers, and ship a page that still reads with the context blocked. WebGL earns a Developer Award when it disappears into the page; it loses one when the page disappears into it.

## Setup

Every skill in this set opens the same way, because work that ignores a locked contract or an existing token set is work the jury sends back.

1. Read `AWARDS.md` in the project root when it exists and resume from its `## Status` checklist; read `DESIGN.md` beside it for the tokens, the type contract and the motion tokens. When neither exists, work from the request and record each decision as you go.
2. Read `PRODUCT.md` when it exists: it is impeccable's product-truth file and the source for audience, claims and constraints. Never edit or overwrite it.
3. Detect the scope from the request: a whole site, one component (a named element, file or selector), or a critique (judge, review, score). Detect the stack from `package.json` and the framework files (`next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, `vite.config.*`, a Webflow export's `webflow.js`).
4. When the request is clearly a whole site and `AWARDS.md` holds no direction contract, offer `/awards:craft` once, in one sentence, then proceed with this skill whatever the answer.

## Read first

The corpus published real numbers for its shaders and real weights for its assets; reading them before building keeps the work inside what has been proven to ship.

- `${CLAUDE_PLUGIN_ROOT}/references/patterns/webgl-architecture.md` end to end before any `gl-*` work; `${CLAUDE_PLUGIN_ROOT}/references/patterns/asset-pipeline.md` before the first asset is imported.
- `${CLAUDE_PLUGIN_ROOT}/references/stacks/three-0.186.md` for the API surface (renderer, loaders, render targets, disposal, the composer, R3F and Threlte props); `stacks/versions.md` for pins and Context7 ids. Verify any API you have not used this session on Context7, one concept per query.
- The cards, §7 Principles and §8 Take / Don't take only: `${CLAUDE_PLUGIN_ROOT}/references/sites/leo-parpeix.md`, `floema.md`, `igloo.md`, `slosh-seltzer.md`, `shopify-editions-w26.md`, `oryzo.md`. Take the architecture, refuse the signature.
- The two verified GL recipes, `${CLAUDE_PLUGIN_ROOT}/recipes/gl-dom-tethered-planes/` and `recipes/gl-fluid-wake-post/` (`main.js` and README): they carry the shipped conventions this skill assumes. The other `gl-*` rows in `recipes/README.md` are planned; a folder exists only once verified, so build those from the pattern file and the row's parameters.
- Arguments: `[effect or scene]` names the beat; `--lib three|ogl|r3f` overrides the default (Three; Threlte inside SvelteKit); `--tier low|mid|high` pins a quality profile for the build session by handing the effects a hand-made profile object, and never ships pinned.

## Dosage first

The corpus took Site of the Month with no canvas at all and Site of the Year with nothing but a canvas, so dosage is a budget decision rather than a quality signal; it is fixed before a single mesh exists, because every rung changes the DOM, the load gate and the accessibility work `[pattern:webgl-architecture#dosage-ladder]`.

| Rung | Meaning | Cards | What it costs |
|---|---|---|---|
| 100 % canvas | the DOM is a shell; layout is camera framing | `[site:igloo]` `[site:why-zero]` | a full DOM mirror, a virtual scroll with keys, the whole pipeline; the 6.6 accessibility score lives here |
| Canvas-first | one canvas behind or over DOM content: tethered planes, a hero object, a scene per section | `[site:leo-parpeix]` `[site:oryzo]` `[site:lando-norris]` `[site:mont-fort]` `[site:floema-jewelry]` `[site:shopify-editions-w26]` | a lazy chunk, tiers, disposal, a mirror; text stays in the DOM |
| Moments | flat planes or one demo inside a DOM-first page | `[site:trevor-noah]` `[site:the-line]` `[site:son-daven]` | one material behaviour, one recipe, one fallback still |
| None | 3D by pre-render, vector runtime or photography | `[site:seasats]` `[site:white-desert]` `[site:mindmarket]` | a frame sequence or a poster; zero runtime GL risk |

- Pick the lowest rung the thesis survives, and write `Dosage: <rung>, because <the beat>` into `AWARDS.md ## Direction contract` (SIGNATURE) or, standalone, into `## Budgets & tiers`.
- "Make it 3D" with no beat behind it is a request for a concept. Ask one question ("which moment of the story needs depth?"); when there is no answer, Invoke the `awards:concept` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline.
- One unifier, named in the contract: a single global pass every pixel goes through (a wake, a grade and grain stack). Narrative shaders only where the story turns, one per chapter; an idle noise displacement is seasoning, not a third kind `[pattern:webgl-architecture#unifier-versus-narrative-shaders]`.

Depth is bought by the rung, and each rung up costs an order of magnitude in assets and risk `[pattern:webgl-architecture#the-depth-ladder]`:

| Rung | Technique | Cost | Recipe |
|---|---|---|---|
| 1 | 2D-in-3D: flat planes with one material behaviour | subdivided quads, no scene | `gl-dom-tethered-planes` |
| 2 | Depth-map 2.5D: image plus greyscale depth, parallax on pointer and scroll | an extra image per scene; smears at depth edges under large offsets | `gl-depth-map-parallax` |
| 3 | Pre-rendered sequence scrubbed on scroll, drawn to a 2D canvas | the frames' weight; no runtime GL | `image-sequence-scrub` |
| 4 | One hero object with inertia: a Draco glb, physical or matcap material, drag momentum | one glb ≤ 300 KB plus an HDRI or matcap | `gl-hero-object-inertia` |
| 5 | Full scene with a camera rig: a spline the scroll drives, per-chapter scenes, a post stack | the whole pipeline and a mirror for everything; `quality-tiers` first | `gl-virtual-scroll-camera` |

## Architecture

### HTML lays out, WebGL renders

When the DOM owns layout, semantics, responsiveness and CMS content survive, and the canvas only adds what shaders can do `[pattern:webgl-architecture#html-lays-out-webgl-renders]`.

- Every plane is tethered to a DOM element: an `<img>` with `alt`, `width`, `height` and `loading`, or a heading. The plane hides it with `visibility` or opacity on a `data-gl` class, never `display: none`, so a failed context leaves the image [A02] [A04].
- Anything the canvas draws that reads as content (headings, labels, captions) exists in the DOM first.
- One media class per element; the scene is a list of tethers, not a hand-placed composition.

### One canvas, positioned on purpose

Native scrolling and `requestAnimationFrame` do not share a clock, so a fixed canvas whose planes are placed from the scroll value can lag the DOM by a frame and the planes swim against their placeholders `[pattern:webgl-architecture#canvas-positioning]`.

- Absolute canvas, re-offset every frame: `position: absolute` and `translate3d(0, scrollY, 0)` in the ticker, with ≈ 25 % vertical over-render against a fast scroll — Lusion's published `WebGL-Scroll-Sync` technique, though `[site:oryzo]` itself ships a fixed canvas tethered by DOM rects [verified, live source 2026-09-18] (`[recipe:gl-dom-tethered-planes]`).
- Or a fixed canvas plus a scroll uniform, where every plane offsets itself by the same smoothed value the DOM moved with `[site:floema-jewelry]`.
- Choose one, write it into the contract, and never scroll-jack to cure drift: fix the clock.
- One canvas per page, created in the layout; scenes mount into it and dispose. Two contexts cannot share resources and the second one is the one that gets lost.

### Rects to pixels every frame

A camera whose distance makes one world unit equal one CSS pixel at depth zero lets DOM rects map 1:1, so responsive rules and lazy images keep working.

- Camera at distance `D`, `fov = 2 · atan(h / 2 / D)` in degrees, `aspect = w / h`; `scale.set(rect.width, rect.height, 1)`; `position.set(rect.left + rect.width / 2 − w / 2, −(rect.top + rect.height / 2) + h / 2, 0)`.
- Read `getBoundingClientRect()` after Lenis has updated on the same tick; under Lenis on the document the rect is already viewport-relative, so nothing is subtracted.
- Skip planes outside the viewport with a margin; set `frustumCulled = false` so a vertex-displaced plane is not culled by its undisplaced bounds.
- OGL maps the same rects to viewport units instead of pixels; R3F does the loop in `useFrame` and writes into refs.

### Scroll and pointer as uniforms

A framework render per scroll event is the slowest possible path into a shader, and it drifts against the DOM `[pattern:webgl-architecture#scroll-and-pointer-as-uniforms]`.

- Scroll is one number (`lenis.scroll`, `lenis.progress` or the virtual float) written into uniforms and refs inside the render loop; framework state never sees it. R3F: `useLenis((l) => { progress.current = l.progress })` and `useFrame`; Threlte: `useTask`, never `$state`.
- Velocity is derived per frame from the smoothed value (`lenis.velocity`) and damped back to zero with `damp(current, target, k, dt)`; reduced motion pins it at zero.
- The pointer goes through `gsap.quickTo` or `damp()` into a vector uniform, never straight from events.
- The time uniform comes from the ticker's clamped `dt`, so a hidden tab does not jump.
- The cheapest scrub is a multiplier on the scroll value; a chapter maps scroll to a 0–1 progress that drives the camera `[site:mont-fort]`.

### Scene windows and disposal

A page with a scene per chapter cannot keep every scene alive, and a route change must leave nothing running `[pattern:webgl-architecture#scene-windows-and-disposal]`.

- Mount the active scene and its immediate neighbours; composite between them in one canvas; dispose the rest.
- Dispose geometries, materials, textures and render targets separately, then the renderer when the canvas goes (`disposeScene` in `stacks/three-0.186.md`); call it from the route's leave hook and on `pagehide` [P07].
- Isolate failures per scene: one broken texture blanks one section, not the page.
- Every loop rides the one ticker (`gsap.ticker` or `src/lib/raf.js`) and pauses when the tab is hidden or the canvas is off-screen [M08].
- DPR comes from the quality tier and an absolute pixel budget through `applyRendererBudget(renderer, profile)`; `setPixelRatio` before `setSize(w, h, false)`; never raw `devicePixelRatio` [P06].

### Colour management

A theme swap that tweens CSS tokens while the clear colour stays behind, or a token that lands a different shade in GL, breaks the fiction that the canvas is part of the page `[pattern:webgl-architecture#colour-parity]`.

- Leave `THREE.ColorManagement` on and `outputColorSpace` at its sRGB default; mark colour maps `SRGBColorSpace` only, data maps (normal, roughness, depth) linear.
- A custom `ShaderMaterial` bypasses the built-in conversion: end its fragment stage with `#include <colorspace_fragment>` (as `gl-dom-tethered-planes` does), or sRGB textures render dark and washed. OGL and raw WebGL need the equivalent conversion written out.
- One source for colour: `data-theme` on `<html>` feeds the CSS tokens and the renderer's clear colour in the same tween; read the token with `getComputedStyle` per swap and hand it to `new THREE.Color()` `[recipe:theme-swap-tokens]`.
- A `display-p3` token in CSS needs its sRGB twin for the clear colour, or the whole canvas opts into P3 output; never one without the other.
- A grade belongs in the post stack (a LUT with no tone mapping), not in the token values.

## Effect recipes

Every parameter below is published or reconstructed from one card and lives, with its confidence label, in `[pattern:webgl-architecture#effect-parameters]`. Take the architecture and design your own displacement; the card's exact curve is the one thing not to ship.

| Effect | Recipe | Architecture to take | What you design |
|---|---|---|---|
| Velocity bulge on planes | `gl-dom-tethered-planes` | vertex-stage displacement scaled by a damped scroll speed; a trivial fragment stage | the displacement shape, the strength, the rest state `[site:floema-jewelry]` |
| Global fluid wake | `gl-fluid-wake-post` | a 128² ping-pong velocity field, advection only, dissipation ≈ .96; one post pass reading it as UV distortion plus chromatic aberration | the splat radius and force, the distortion magnitude, what the wake touches `[site:leo-parpeix]` |
| Depth-map parallax | `gl-depth-map-parallax` | image plus greyscale depth, parallax occlusion with a forward pass and a refinement pass | the offset range, the pointer and scroll mix `[site:shopify-editions-w26]` |
| Section transition | `gl-rtt-composite-transition` | each section to a render target; a fullscreen plane's fragment blends them | the blend (wipe, warp, dissolve), the duration on the in-out curve `[site:slosh-seltzer]` |
| Camera on a spline | `gl-virtual-scroll-camera` | wheel and touch into a float with friction, a slow lerp on the input and a faster one on the camera, a 1.4 s snap, DOM-anchored labels, keys | the path, the chapters, the snap points `[site:igloo]` |
| Hero object with inertia | `gl-hero-object-inertia` | one Draco glb ≤ 300 KB, matcap or a 1K PMREM'd HDRI, pointer momentum through damping, scroll-scrubbed rotation | the object, the light answer, the scroll mapping `[site:oryzo]` |
| Scanline wireframe | none (pattern) | a time-driven scanline over a wireframe with an idle noise displacement | the geometry and the cadence `[site:lando-norris]` |
| Cheap ice, matte worlds | none (pattern) | matte blocks, no transmission: bevelled edges, a key light, a Fresnel rim, high-threshold bloom, fog, fine grain, saturation ≈ 0; refraction on one hero object only | the material world `[site:igloo]` |
| Procedural landscape | none (pattern) | Perlin and Voronoi noise, a rock diffuse and normal, a mix mask, a baked lightmap, one HDRI, KTX2 textures | the terrain and its ink `[site:mont-fort]` |
| Frame sequence | `image-sequence-scrub` | pre-rendered frames decoded to `ImageBitmap`, drawn to a 2D canvas, a poster underneath | the render and the frame count `[site:seasats]` |
| Text in the scene | `gl-msdf-text` (planned) | MSDF glyphs from a pre-built atlas with a DOM twin | the scramble or blur it earns `[site:igloo]` `[site:why-zero]` |

Library choice: Three by default; OGL for a planes-only page where the smaller bundle matters `[site:floema-jewelry]`; R3F only inside a React app with a component-shaped scene (`<Canvas dpr={[1, 2]} frameloop="always" flat gl={{ antialias: false, powerPreference: 'high-performance' }}>`, `useFrame((state, delta) => …)`); Threlte inside SvelteKit (`useTask`, `useThrelte()` for `renderer`, `dpr`, `renderMode`, `invalidate`). Whatever the wrapper, the rect loop, the uniforms and the disposal rules above are unchanged.

## Post-processing

A post stack is the fastest way to make six scenes read as one site, and the fastest way to lose the frame budget on a phone `[pattern:webgl-architecture#post-processing]`.

- One pipeline: pmndrs `postprocessing` 6.39.5 with `frameBufferType: HalfFloatType`, a `RenderPass` and one `EffectPass` merging bloom and SMAA; the renderer created with `antialias: false`. Never mix it with Three's own `examples/jsm/postprocessing` passes `[recipe:gl-postprocessing-presets]`.
- Fixed presets, not per-scene guesses: three bloom intensities across the site (1.5 / .5 / .25), a high luminance threshold on bright scenes so bloom does not smear the frame, one grade LUT.
- Half-float render targets, no depth buffer on fullscreen quads, SMAA over MSAA on mobile.
- Step down by tier: DPR first, then blur samples, then geometry detail; the low tier drops post-processing entirely (`profile.postprocessing === false`).

## Assets and budgets

A scene is cheap or expensive at export time, not at runtime; every heavy winner with readable assets runs the same chain and none feeds a PNG to a shader `[pattern:asset-pipeline#the-pipeline]`.

- Blender, Cinema 4D or Houdini → glTF with Draco or meshopt geometry, quantised attributes, pruned data (`@gltf-transform/cli` 4.5.0: `optimize`, `draco`, `resize`, `prune`, `dedup`, `weld`) → KTX2 textures (`toktx` or `basisu`; ETC1S for colour maps, UASTC for normal and data maps, mipmaps on) → atlases → decoding in workers where the engine allows.
- Decoders self-hosted under `public/decoders/{draco,basis}/`; `KTX2Loader.detectSupport(renderer)` before the first load; the audit checks the loader for a compressor [P03].
- Bake what the visitor cannot influence: simulations as replayed geometry, lighting as a lightmap where the camera path is known.
- Texture tier by GPU capability and `deviceMemory`, never by viewport width; 1024–2048 px per map; environment maps PMREM'd at 1K.
- Staged loading feeds the preloader: shell, then the first scene's assets (this `Promise.all` resolves the counter), then neighbours, then idle; failures isolate to one scene `[pattern:asset-pipeline#staged-loading]`.

Copy the budgets into `AWARDS.md ## Budgets & tiers` and hold the build to them; their sources are listed in `[pattern:asset-pipeline#budgets]`.

| Item | Budget |
|---|---|
| Shell entry | ≈ 20 KB gz |
| JS before the GL chunk | ≤ 200 KB gz (the audit fails at 300 [P04]) |
| GL chunk plus first scene | ≤ 500 KB gz, lazy |
| Textures per scene | ≤ 700 KB |
| Hero mesh | ≤ 300 KB glb |
| Whole 3D narrative | single-digit MB |
| Any raster | < 1 MB [P02] |
| Audio bed | ≈ 1.5 MB, fetched after consent |
| LCP | ≤ 2.5 s on throttled 4G, from a poster or the DOM |

Measure gzipped output from the build, never source sizes.

## Quality tiers and the three-tier fallback

Mobile GPUs fail on pixel count and bandwidth, and WebGL fails outright on blocked contexts, lost contexts and 404'd textures; a page that goes blank has no jury score at all `[pattern:webgl-architecture#content-fallback-tiers]`.

- `detectQualityTier()` from `src/lib/quality-tiers.js` probes once (DPR, memory, cores, GPU string, WebGL2, a frame-time sample) and returns `tier`, `dpr`, `maxPixels`, `postprocessing`, `particles`, `blurSamples`; it also sets `data-quality` on `<html>`. Every effect reads the profile; nothing re-measures `[recipe:quality-tiers]`.
- High: DPR ≤ 2, full effects. Mid: DPR ≤ 1.5, fewer particles and blur samples. Low: DPR 1, no post, a still instead of a field. Reduced motion overrides all three.
- Adaptive within a tier: step DPR, then blur samples, then geometry detail from measured frame time; target 30 fps on low `[site:why-zero]`.

| Content tier | Shows | Triggered by |
|---|---|---|
| WebGL | the scene | a `webgl2` (or `webgl`) context, quality tier above low, motion tier full |
| Static media | a poster still or muted video per section, the DOM placeholders already carry it | no context, low tier, `webglcontextlost`, a failed asset in that scene, reduced motion, a WebGL1-only device |
| Text | headings, copy, links and cards alone | media failed too; always the base layer |

## DOM mirror, reduced motion, keyboard

A screen reader, a search crawler, find-in-page, translation and the `--no-webgl` capture all read the DOM; the Site of the Year's empty DOM is the whole story of its 6.6 `[pattern:accessibility-and-reduced-motion#the-dom-mirror]`.

- The canvas is `aria-hidden="true"`; every string and image it draws exists in the DOM first, visible or `.sr-only` [A04] `[pattern:webgl-architecture#text-in-webgl]`.
- An interactive canvas (a map, a gallery) has DOM controls, `<button>`s or `<a>`s, and the canvas is decoration over them [A05].
- Reduced tier: the scene renders one settled frame on demand (`frameloop="demand"`, `renderMode: 'on-demand'`, or a single `render()` after layout), simulation and pointer wakes stop, velocity uniforms sit at zero. Static tier: the DOM alone, the poster in place of the canvas.
- A virtual float answers ArrowDown, PageDown, Space, Home and End, steps between sections under reduced motion, registers `awards.setScroller(fn)` and reports through `state()` `[pattern:accessibility-and-reduced-motion#scroll-jacking-rules]`.
- Every gesture the scene asks for (drag, hold, draw) has the keyboard path from `[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]` and a visible Skip [A11].
- Report through the hook: `awards.addState(() => ({ gl, tier, planes, speed }))`, so the capture manifest shows what the scene did.

## Sound

Sound is opt-in only: browsers refuse audio without a gesture and a jury refuses a site that starts talking `[pattern:sound#opt-in-only]`.

- A visible `<button aria-pressed>` whose name carries the state, styled from the tokens; the audio context created or resumed inside its click handler; the bed fetched only after consent.
- Consent may ride the preloader's exit gesture, but content never waits for it.
- Levels well under full scale (the published ceiling is ambient ≈ .375, SFX ≈ .35); one-shots named and rate-limited; the visualiser frozen under reduced motion `[pattern:sound#the-control]`. `[recipe:sound-toggle-opt-in]` is the planned reference.

## Verify

SwiftShader proves correctness, not frame rate: the captures below prove the page draws, mirrors and degrades; a real-device pass proves it is fast.

- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <dir|url> --out .awards/captures --scroll 0,50,100 --reduced-motion --json` (WebGL is on by default through the SwiftShader flags): `metrics.desktop.webgl` is `true`, `canvases` is 1, `awardsState.gl` is `true`, `consoleErrors`, `pageErrors` and `failedRequests` are empty (a failed decoder or texture request shows up here), `desktop-rm-s00.png` shows one settled frame.
- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <dir|url> --out .awards/captures --name nogl --no-webgl --json`: `nogl-desktop-s00.png` reads as a whole page, images and headings visible, `awardsState.gl` is `false`, and the two runs differ only where the scene draws.
- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <dir> --scope perf,a11y --json`: P03, P06, P07 and A04 clean, or each carries a reason under `AWARDS.md ## Exceptions`.
- [ ] Drift test: a fast wheel scroll and a resize leave every plane on its placeholder; the address bar on a phone does not rebuild the scene.
- [ ] Disposal: after three route changes `renderer.info.memory.geometries` and `.textures` are flat and no ticker subscriber survives the leave hook.
- [ ] Budgets: gzipped sizes of the entry and the GL chunk, texture bytes per scene, the largest glb, all inside the table above and written into `AWARDS.md ## Budgets & tiers`.
- [ ] Real device: a frame-time sample on a mid-range phone (≥ 55 fps high, ≥ 30 fps low); no shader compile warnings in the console; `data-quality` reports the tier you expected.
- [ ] Contract: the dosage rung, the unifier, the canvas model and the fallback tiers are written where the contract says.

## Hand-off

Tick "WebGL layer built or explicitly declined (webgl)" in `AWARDS.md ## Status` and fill the GL lines of `## Budgets & tiers`. Then: Invoke the `awards:jury` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When this skill ran standalone on a component, hand back to `awards:component` for its own verification instead.

## Refuse

- A blob, particle field or floating primitives with no beat behind them; "make it 3D" as a brief: a concept, not a shader, is missing.
- Text or images that exist only in the canvas: the accessibility score and find-in-page are made of the DOM.
- An uncapped `devicePixelRatio`, or a 3× phone rendering bloom at full resolution: the classic 12 fps site.
- A 50 MB glb, a PNG into a shader, a decoder pulled from a CDN at runtime: the pipeline exists to prevent all three.
- Two contexts on one page, a canvas per section, a scene that outlives its route.
- Scroll or pointer written to framework state; raw wheel deltas as uniforms.
- Per-scene bloom values chosen by eye; both post pipelines at once.
- A canvas with no fallback: no static tier, no text tier, no `--no-webgl` capture.
- Runtime simulation of anything the visitor cannot influence: bake it.
- The Floema bulge, the Léo Parpeix wake, the Igloo ice, the Mont-fort peak, the Lando visor, the Shopify paintings or the Slosh can shipped as the signature: pattern pointers, never parts.
