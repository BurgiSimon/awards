# WebGPU and TSL on three 0.186

<!-- Labels: [verified: source] = three@0.186.0 as installed in `recipes/node_modules` (`src/renderers/webgpu/WebGPURenderer.js`, `src/renderers/common/{Renderer,RenderPipeline,PostProcessing}.js`, `src/renderers/webgl-fallback/{WebGLBackend.js,nodes/GLSLNodeBuilder.js}`, `src/renderers/common/nodes/NodeLibrary.js`, `src/renderers/webgpu/nodes/StandardNodeLibrary.js`, `src/nodes/accessors/StorageBufferNode.js`, `examples/jsm/loaders/KTX2Loader.js`, `examples/jsm/tsl/display/*`), read 2026-10-22 · [verified: import] = every TSL and `three/webgpu` name below resolved by importing both entry points in Node, 2026-10-22 · [verified: three-docs] = Context7 `/mrdoob/three.js` (TSL guide, wiki, BloomNode, StorageBufferNode, webgpu examples), read 2026-10-22 · [verified: r3f-docs] = Context7 `/pmndrs/react-three-fiber` (canvas.mdx, v9 migration), read 2026-10-22 · [verified: gpuweb] = gpuweb wiki "Implementation Status", last edited 2026-10-02, read 2026-10-22 · [verified: build] = two minimal scenes bundled with rolldown (minify) against three 0.186.0, gzip -9, 2026-10-22 · [inferred] · [unverified]. Site facts keep their card's own label. -->

## What it is for in this skill set
`three/webgpu` ships `WebGPURenderer`, a second renderer with its own material system: **node materials**, written in **TSL** (Three.js Shading Language), a JavaScript graph that compiles to WGSL on the WebGPU backend and to GLSL on its WebGL2 fallback [verified: source]. Same scene graph, same loaders, same architecture [pattern:webgl-architecture#html-lays-out-webgl-renders]; different shaders, a different post stack and, for the first time in the browser, **compute**. `three-0.186.md` stays the default note; this one is for a project that chose the WebGPU build.

## WebGPU or WebGL
| Choose `WebGPURenderer` when | Stay on `WebGLRenderer` when |
|---|---|
| a GPU simulation: particles or fields updated in compute every frame | the dosage is a few tethered planes and one post pass [pattern:webgl-architecture#dosage-ladder] |
| you want one shader source for both backends (TSL), the way Pensatori ships it forced to WebGL [site:pensatori-irrazionali] [verified] | the build relies on pmndrs `postprocessing` presets [recipe:gl-postprocessing-presets]: 6.39.5 builds `WebGLRenderTarget`s and has no WebGPU path [verified: source] |
| storage buffers, indirect draws, compute-written textures | `three-custom-shader-material` or any GLSL `ShaderMaterial` / `onBeforeCompile` patch you cannot port (see below) |
| the entry budget can carry it: a minimal plane scene is **241 KB** gz minified on `three/webgpu` vs **129 KB** on `three` [verified: build] | the scene must be in the first payload on a phone |

The recipes are GLSL on `WebGLRenderer` and stay there; none imports `three/webgpu` [verified: grep of `recipes/`, 2026-10-22]. A WebGPU build is a deliberate per-project choice recorded in `AWARDS.md ## Budgets & tiers`.

## Browser support, October 2026
| Engine | WebGPU on by default | Not yet |
|---|---|---|
| Chromium (Chrome, Edge) | macOS, Windows x64, ChromeOS since 113; Android 12+ on ARM/Qualcomm/Intel GPUs since 121; Linux Intel Gen12+ since 144, NVIDIA on Wayland since 147 [verified: gpuweb] | Windows on ARM64 (flag); other Android GPUs, e.g. Samsung Xclipse (TBD) [verified: gpuweb] |
| Safari | macOS, iOS/iPadOS and visionOS since Safari 26 [verified: gpuweb] | — |
| Firefox | Windows since 141; macOS 26+ since 145, all macOS since 147 [verified: gpuweb] | Linux (Nightly) and Android (flag), both expected in 2026 [verified: gpuweb] |

So a meaningful minority of Android and Linux visitors still lands on the fallback [inferred]. Design the WebGL2 backend as a first-class tier, not a rescue; the Warm & Fuzzy card names that as what the awards skills do differently [site:warmnfuzzy] [verified].

## Boot, backend and fallback
```js
import * as THREE from 'three/webgpu';
import { detectQualityTier, applyRendererBudget } from './lib/quality-tiers.js';   // port of recipes/_shared
import { awards } from './lib/awards-hook.js';

const renderer = new THREE.WebGPURenderer({ canvas, antialias: false, alpha: true });  // alpha already defaults to true here [verified: source]
await renderer.init();                     // render() throws until initialised; rejects if WebGL2 fails too [verified: source]
const backend = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl2';   // flags on each backend class [verified: source]
awards.addState(() => ({ glBackend: backend }));                          // captures and the jury see which path ran
const profile = await detectQualityTier();
applyRendererBudget(renderer, profile);    // setPixelRatio / setSize exist with the WebGL signatures [verified: source]
gsap.ticker.add(() => renderer.render(scene, camera));                   // one clock [recipe:boot-lenis-gsap]
```
- **Fallback is built in.** When the WebGPU backend fails to initialise, `init()` swaps in the WebGL2 backend through `getFallback` and logs a warning; if that fails too, `init()` rejects [verified: source]. `forceWebGL: true` skips WebGPU entirely [verified: source], which is Pensatori's shipped setting [site:pensatori-irrazionali] [verified]. There is no WebGL1 path [verified: source, only `WebGLBackend` exists]: wrap `await renderer.init()` in `try` and keep the DOM tier on a rejection.
- Feature probe without a renderer: `navigator.gpu` plus `await navigator.gpu.requestAdapter()` (three's `addons/capabilities/WebGPU.js` does exactly that with a top-level await) [verified: source]. Run Run Rob Run chooses WebGPU when `navigator.gpu` exists and loads a separate WebGL fallback module otherwise [site:runrobrun] [verified]; with `WebGPURenderer` one module covers both.
- `renderAsync()` and the other `*Async` render helpers are deprecated since r181: `await renderer.init()` once, then the synchronous calls [verified: source]. `computeAsync()` remains for a dispatch before init [verified: source].
- three's docs prefer `setAnimationLoop` "for best compatibility" (it also drives WebXR) [verified: source comment]; outside XR the GSAP ticker is fine once `init()` resolved [verified: source, `render()` only checks `_initialized`].
- R3F 9: `<Canvas gl={async (props) => { const r = new THREE.WebGPURenderer(props); await r.init(); return r; }}>` and `extend(THREE)` from `three/webgpu` [verified: r3f-docs].
- `KTX2Loader.detectSupport(renderer)` accepts a `WebGPURenderer` and reads its texture-compression features, so call it after `init()`; `detectSupportAsync` is deprecated [verified: source].

## TSL in place of `ShaderMaterial` and `onBeforeCompile`
Under `WebGPURenderer`, classic materials are converted to their node twins (`MeshStandardMaterial` → `MeshStandardNodeMaterial`, and so on); `ShaderMaterial` has no entry in that library [verified: source, `NodeLibrary.fromMaterial` returns null for unmapped types], so a GLSL material will not render as written; whether that surfaces as an error or a blank mesh is [unverified]. Nothing in the renderer or node materials reads `onBeforeCompile` [verified: source, grep]. Port, do not patch.

| GLSL habit | TSL equivalent [verified: import] |
|---|---|
| `uniform float uSpeed;` + `material.uniforms.uSpeed.value = v` | `const uSpeed = uniform(0)` shared by every material that uses it; `uSpeed.value = v` on the ticker |
| `varying vec2 vUv; vUv = uv;` | `uv()` wherever it is needed; varyings are derived |
| patch `position` before `gl_Position` | `material.positionNode = positionLocal.add(…)` |
| `gl_FragColor = …` | `material.colorNode` (keeps lighting and output), or `fragmentNode` (replaces the whole fragment stage) [verified: three-docs] |
| `texture2D(uMap, vUv)` | `texture(map)`, `texture(map, uvNode)`, or `node.sample(uvNode)` |
| `onBeforeCompile` chunk surgery on a standard material | its node slots: `colorNode`, `positionNode`, `normalNode`, `opacityNode`, `emissiveNode` [verified: three-docs examples] |
| `#include <colorspace_fragment>` | **nothing**; see the colour row in the rules table |
| raw WGSL or GLSL you must keep | `wgslFn` / `glslFn` exist [verified: import]; `glslFn` cannot run on the WebGPU backend [inferred] |

### Tethered planes, ported
The GLSL in [recipe:gl-dom-tethered-planes] (Floema's speed bulge [clone:floema-jewelry] [verified]) becomes:
```js
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, texture, uv, positionLocal, sin, abs, vec3 } from 'three/tsl';

export const uSpeed = uniform(0);          // one node, every plane: written once per frame from lenis.velocity
const uStrength = uniform(0.35);
export function planeMaterial(map) {      // map.colorSpace = SRGBColorSpace, as before
  const m = new MeshBasicNodeMaterial({ transparent: true });
  const bulge = sin(uv().y.mul(Math.PI)).add(sin(uv().x.mul(Math.PI))).mul(abs(uSpeed)).mul(uStrength);
  m.positionNode = positionLocal.sub(vec3(0, 0, bulge));     // z in pixels, as in the recipe
  m.colorNode = texture(map);                                 // decoded on sample; converted once on output
  return m;
}
```
DOM-rect tethering, the camera distance and the reduced-motion branch are unchanged JavaScript. Under reduced motion `uSpeed.value` stays 0, as in the recipe [recipe:reduced-motion-switch].

## Post-processing: `RenderPipeline`
`PostProcessing` was renamed `RenderPipeline` in r183; the old name still works and warns [verified: source]. Effects are nodes from `three/addons/tsl/display/`: `bloom(node, strength, radius, threshold)`, `smaa(node)`, `fxaa(node)`, `rgbShift(node, amount, angle)`, `transition(a, b, mixTexture, mixRatio, threshold, useTexture)`, and about forty more [verified: source].
```js
import { RenderPipeline } from 'three/webgpu';
import { pass, texture, screenUV, uniform, Fn } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

const pipeline = new RenderPipeline(renderer);
const scenePass = pass(scene, camera);                   // options take type, samples, depthBuffer… [verified: three-docs]
const color = scenePass.getTextureNode('output');
const uWake = uniform(0.02);
const wake = texture(wakeTarget.texture);                // RG velocity from the wake pass [recipe:gl-fluid-wake-post]
const distorted = Fn(() => color.sample(screenUV.sub(wake.sample(screenUV).rg.mul(uWake))))();
pipeline.outputNode = distorted.add(bloom(distorted, 1.5, 0.4, 1));   // Lando's 1.5 preset, by eye [site:lando-norris]
gsap.ticker.add(() => pipeline.render());                // the pipeline's render(), not renderer.render() [verified: source]
```
- `outputColorTransform` (default `true`) applies tone mapping and the output colour space once, at the end [verified: source]. FXAA and SMAA expect sRGB input: set it `false` and wrap the chain yourself, `smaa(renderOutput(scenePass))` [verified: source docstring].
- `scenePass.setResolutionScale(0.5)` halves a pass for the low tier [verified: three-docs].
- Preset numbers do not carry over pixel for pixel from pmndrs `BloomEffect` to `BloomNode`; re-tune against the captures [inferred].
- A route-change composite ([recipe:gl-rtt-composite-transition]) maps onto `transition()` or two `pass()` nodes mixed by a `uniform` that GSAP tweens [inferred, from the signatures above].

## Compute for particles
```js
import { SpriteNodeMaterial, Sprite, Vector3 } from 'three/webgpu';
import { Fn, instancedArray, instanceIndex, hash, deltaTime, uniform, vec3 } from 'three/tsl';

const count = Math.round(40000 * profile.particles);          // the tier decides, 0 on low [recipe:quality-tiers]
const pos = instancedArray(count, 'vec3'), vel = instancedArray(count, 'vec3');
const uPointer = uniform(new Vector3());                      // world-space pointer, written on the ticker
const init = Fn(() => { pos.element(instanceIndex).assign(vec3(hash(instanceIndex), hash(instanceIndex.add(1)), 0).sub(0.5).mul(4)); })().compute(count);
const step = Fn(() => {
  const p = pos.element(instanceIndex), v = vel.element(instanceIndex);
  v.addAssign(uPointer.sub(p).mul(0.02).mul(deltaTime)); v.mulAssign(0.96); p.addAssign(v);
})().compute(count);
const mat = new SpriteNodeMaterial({ transparent: true, depthWrite: false });
mat.positionNode = pos.toAttribute();                          // the documented hand-off to rendering [verified: three-docs]
const sprites = new Sprite(mat); sprites.count = count; sprites.frustumCulled = false; scene.add(sprites);
renderer.compute(init);                                        // after init(); names and node methods verified by import
gsap.ticker.add(() => { if (tier === 'full') renderer.compute(step); renderer.render(scene, camera); });
```
- On the **WebGL2 fallback** compute runs as transform feedback over a `POINTS` draw with rasterisation discarded; the dispatch size must be a single number (no `[x, y, z]`, no indirect), and the GLSL builder reports `storageBuffer` as unavailable, so storage reads go through attributes [verified: source]. Keep compute kernels to "one element in, the same element out" so both backends agree [inferred]; scattered writes and atomics are WebGPU-only [inferred].
- The canvas-2D and CSS answers still win for a few hundred sprites [recipe:sprite-rain-canvas2d]; compute earns its bundle above tens of thousands [inferred].
- Ping-pong fields ([recipe:gl-ping-pong-grain-field]) port either to two render targets on a `QuadMesh` or to a storage texture written in compute [inferred].

## The plugin's rules, under WebGPU
| Rule (CLAUDE.md, `three-0.186.md`) | Under `WebGPURenderer` |
|---|---|
| DPR ≤ 2 plus an absolute pixel cap | unchanged: `applyRendererBudget` works as is [verified: source]. New: the default `outputBufferType` is `HalfFloatType` and an internal framebuffer target is allocated whenever tone mapping or colour conversion is needed [verified: source]; `UnsignedByteType` saves memory on the low tier at some quality cost [verified: source docstring] |
| `#include <colorspace_fragment>` in every custom `ShaderMaterial` | gone: the renderer's output pass converts once. The rule becomes **never convert twice**: no manual sRGB encode in a `colorNode`, `outputColorTransform` left on unless an effect needs sRGB input [verified: source] |
| distance fields divide by `max(fwidth(d), 1e-5)` | same guard in TSL: `d.div(max(fwidth(d), 1e-5))`; `fwidth` exists [verified: import]. The SwiftShader reason applies on the fallback [inferred] |
| dispose geometry, materials, textures, render targets per scene | unchanged per object; `renderer.dispose()` is now **async** and awaits the backend [verified: source]; also `pipeline.dispose()` and each pass node's `dispose()` [verified: source] |
| `readPixels` after a composer render needs the default framebuffer and a fresh render | only `readRenderTargetPixelsAsync()` exists; no synchronous read [verified: import]. A `verify.mjs` probe awaits it after the render it reads [inferred] |
| reduced motion: one settled frame | `await renderer.init()`, then call `render()` once; no loop. Compute does not dispatch [pattern:accessibility-and-reduced-motion#reduced-motion-tiers]. Warm & Fuzzy does not even create its WebGPU canvases under the query [site:warmnfuzzy] [verified] |
| canvas `aria-hidden`, every string in the DOM | unchanged [pattern:accessibility-and-reduced-motion#the-dom-mirror] |
| one ticker | unchanged; render (or `pipeline.render()`) and `compute()` inside `gsap.ticker` |
| pause when hidden or off-screen | unchanged; Pensatori sleeps on `visibilitychange` and mounts within 300 px of the viewport [site:pensatori-irrazionali] [verified] [recipe:gl-fps-governor-idle-gate] |
| context loss | becomes **device loss**: the default handler logs and stops all rendering and compute [verified: source]. Assign `renderer.onDeviceLost = (info) => swapToPoster()` to fall to the static tier [verified: source, assignable property]. Warm & Fuzzy handles device loss on its shared device [site:warmnfuzzy] [verified] |
| recipe verification under SwiftShader | `verify-recipes.mjs` runs headless Chromium with SwiftShader WebGL; whether `navigator.gpu` is exposed there is [unverified]. If it is not, a green run proves the WebGL2 backend only [inferred]; prove the WebGPU path with `capture.mjs --gpu` on hardware |

## Gotchas
- `three` and `three/webgpu` share one core (`build/three.core.js`), so math and scene classes are the same objects [verified: source]; the WebGL-only addons (`examples/jsm/postprocessing/*`, `EffectComposer`) do not work with `WebGPURenderer` [inferred]. Import from `three/webgpu` everywhere in a WebGPU build.
- `alpha` defaults to `true` and `antialias` to `false` (MSAA `samples` 4 when on) [verified: source]: a WebGL setup copied over may suddenly show the page through the canvas.
- First frames compile pipelines; `renderer.compileAsync(scene, camera)` before the reveal avoids a hitch [verified: source, method exists] [inferred: hitch size].
- TSL renames still land between releases (r185 renamed `directionToColor` → `packNormalToRGB`) [verified: source]; check the console for `warnOnce` lines after every bump.
- Pensatori's tier probe adds a point when WebGPU exists [site:pensatori-irrazionali] [verified]; the shared `detectQualityTier()` probes WebGL only [verified: recipes/_shared/quality-tiers.js] and needs the backend fed in by hand if a project wants the same.

## Where the corpus used it
[site:pensatori-irrazionali] (three r182 `WebGPURenderer` with `forceWebGL`, a TSL node material, KTX2 array texture, three quality tiers, lazy chunk of 366 KB raw), [site:runrobrun] (three's WebGPU build as native ES modules from `/public`, a WebGL fallback module with `HDRLoader`, chosen on `navigator.gpu`), [site:warmnfuzzy] (raw WebGPU with inline WGSL, no library: offscreen silhouette masks composited on 2D canvases, feature-detected, device loss handled, not created under reduced motion).
