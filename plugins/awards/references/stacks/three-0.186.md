# Three.js 0.186 (+ postprocessing 6.39)

<!-- Labels: [verified] = checked against Context7 (`/websites/threejs`, `/mrdoob/three.js`, `/pmndrs/postprocessing`, `/websites/pmndrs_github_io_postprocessing_public`, `/pmndrs/react-three-fiber`, `/threlte/threlte`), 2026-09 · [recalled] · [unverified]. -->

## What it is for in this skill set
The rendering layer under "HTML lays out, WebGL renders": one canvas, planes mapped from DOM rects, scroll and pointer as uniforms, scenes mounted per section and disposed on route change [pattern:webgl-architecture]. Three is the corpus default (Léo Parpeix, Why Zero, Lando, Mont-Fort, Igloo, Oryzo, United Carriers, Shopify); OGL is the lighter sibling with the same architecture [site:floema]; R3F and Threlte wrap it for React and Svelte.

## Install (pinned)
```sh
npm i three@0.186.0 postprocessing@6.39.5        # + @react-three/fiber@9.7.0 @react-three/drei@10.7.8 for React
cp -r node_modules/three/examples/jsm/libs/draco public/decoders/draco && cp -r node_modules/three/examples/jsm/libs/basis public/decoders/basis
```
```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect, SMAAPreset } from 'postprocessing';
```

## The API surface we use
### Renderer and colour [verified]
```js
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(profile.dpr);                 // multiplies every later setSize
renderer.setSize(innerWidth, innerHeight, false);    // updateStyle:false leaves the CSS size to the stylesheet
// renderer.outputColorSpace defaults to SRGBColorSpace, toneMapping to NoToneMapping
colorMap.colorSpace = THREE.SRGBColorSpace;          // colour maps only; never normal / roughness / data maps
```
`recipes/_shared/quality-tiers.js` → `applyRendererBudget(renderer, profile)` caps DPR and an absolute pixel budget [recipe:quality-tiers]. Leave `THREE.ColorManagement` at its default (on in current releases [unverified: default value]). With colour management on, `new THREE.Color('#2D628C')` lands where the CSS token does [recalled], which is how theme swaps keep the clear colour in step with `--bg` [recipe:theme-swap-tokens].

### Loaders [verified]
```js
const ktx2 = new KTX2Loader().setTranscoderPath('/decoders/basis/').detectSupport(renderer);   // detectSupport before any load
const draco = new DRACOLoader().setDecoderPath('/decoders/draco/');
const gltf = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2);
const { scene: model } = await gltf.loadAsync('/models/hero.glb');
```
KTX2 (ETC1S for colour, UASTC for normals) stays compressed on the GPU; Draco or meshopt for geometry; the pipeline is `@gltf-transform/cli` plus `toktx` / `basisu` [pattern:asset-pipeline].

### Render targets [verified]
```js
const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4, depthBuffer: false });
// half-float: bloom / fluid / composite buffers without banding · samples: MSAA on the target · no depth for a fullscreen quad
rt.dispose();   // frees texture, framebuffer and renderbuffers   [recipe:gl-fluid-wake-post] [recipe:gl-rtt-composite-transition]
```

### Disposal [verified]
Geometries, materials and textures are shared, so each is disposed separately; `renderer.dispose()` frees the renderer's internal resources.
```js
export function disposeScene(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose();
    for (const m of [].concat(o.material ?? [])) { for (const v of Object.values(m)) v?.isTexture && v.dispose(); m.dispose(); }
  });
}
```

### Post-processing (pmndrs `postprocessing`, not three's own composer) [verified]
```js
const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera,
  new BloomEffect({ intensity: 1.5, luminanceThreshold: 1, luminanceSmoothing: .03, mipmapBlur: true, radius: .85 }),
  new SMAAEffect({ preset: SMAAPreset.HIGH })));
gsap.ticker.add(() => composer.render());
```
Fixed presets keep a multi-scene site coherent: bloom 1.5 / .5 / .25 [site:lando-norris] [recipe:gl-postprocessing-presets]. Create the renderer with `antialias: false` and let SMAA do the work [recalled: postprocessing README].

### Wrappers [verified]
- R3F: `<Canvas dpr={[1, 2]} frameloop="always" | "demand" flat gl={{ antialias: false }}>`; `useFrame((state, delta) => ...)` is unsubscribed on unmount.
- Threlte: `<Canvas>`, `<T.Mesh>`, `useTask((delta) => ...)`, `useThrelte()` → `renderer`, `dpr`, `renderMode`, `invalidate`, `advance`.

## Integration with the others
- Ticker: render inside `gsap.ticker.add(...)` after Lenis has updated, reading `lenis.scroll` / `lenis.velocity` into uniforms [recipe:gl-dom-tethered-planes].
- Scroll sync: a `position: fixed` canvas whose planes receive `uScroll`, or Lusion's absolute canvas re-offset every frame (no drift, no fixed-layer cost) [site:oryzo].
- DOM tethering, per frame after Lenis updated, y inverted [site:floema]:
```js
const r = el.getBoundingClientRect();
mesh.scale.set((r.width / innerWidth) * viewW, (r.height / innerHeight) * viewH, 1);
mesh.position.x = -viewW / 2 + mesh.scale.x / 2 + (r.left / innerWidth) * viewW;
mesh.position.y =  viewH / 2 - mesh.scale.y / 2 - (r.top / innerHeight) * viewH;
```
- Cuts and theme swaps: `gsap.to(material.uniforms.uMix, { value: 1, ease: 'expo.inOut' })` with the clear colour lerped in the same tween [site:slosh-seltzer].
- Pointer: `gsap.quickTo` on a target vector, then damped follow in the loop [site:leo-parpeix].

## Reduced motion and accessibility hooks
The canvas is `aria-hidden="true"`; every image, heading and label it renders also exists in the DOM (the mirror) [pattern:accessibility-and-reduced-motion]. Reduced motion: render one settled frame (`frameloop="demand"` / `renderMode: 'on-demand'` [verified]) and stop pointer-driven simulation; the static tier swaps the canvas for `<img>` or poster video. Never gate content behind a WebGL-only gesture without a keyboard path [site:why-zero] [recipe:compare-hold-drag].

## Performance rules
DPR ≤ 2 plus an absolute pixel cap (mobile GPUs die on pixel count); half-float targets on mobile; SMAA over MSAA when post-processing; KTX2 for every texture over ~100 KB; Draco / meshopt geometry; one canvas; mount the active scene and its neighbours only [site:shopify-editions-w26]; pause the loop when offscreen or hidden; budgets: entry ≈ 20 KB gz, scene ≈ 500 KB gz, textures ≤ 700 KB per scene [site:igloo]; measure with `renderer.info` and a frame-time probe before enabling effects [recipe:quality-tiers]. Adaptive quality: DPR → blur samples → geometry LOD from frame timing [site:why-zero].

## Gotchas
- `detectSupport(renderer)` must run before the first KTX2 load, after the renderer exists [verified].
- `setSize` before `setPixelRatio` sizes the buffer twice; ratio first, then size [verified: setPixelRatio calls setSize].
- `SRGBColorSpace` on data textures (normal, roughness, depth): wrong lighting [verified: colour maps only].
- Mixing three's `examples/jsm/postprocessing` passes with pmndrs `postprocessing`: same class names, two pipelines; use one.
- Forgetting `renderTarget.dispose()` on route change: framebuffers leak after the scene is gone [verified].
- Uncapped `devicePixelRatio` on a 3× phone plus bloom: the classic 12 fps site.
- A 50 MB glb because nobody ran `gltf-transform`; hero objects stay under ~300 KB [recipe:gl-hero-object-inertia].

## Where the corpus used it
[site:leo-parpeix] (Draco glTF, fluid FBO + one post-process), [site:why-zero] (vanilla Three, five GLSL shaders, adaptive quality, DRACO + KTX2 atlases), [site:lando-norris] (r174, six scenes, bloom presets, fluid sim, MSDF text), [site:mont-fort] (procedural mountain, KTX2, EXR HDRI, baked lightmap), [site:igloo] (Draco + KTX2 for everything, workers, MSDF), [site:oryzo] (absolute-canvas scroll sync), [site:united-carriers], [site:shopify-editions-w26] (Theatre.js + KTX2 array textures), [site:slosh-seltzer] (render-to-texture compositing), [site:trevor-noah] (2D planes with a Polaroid curl); [site:floema] used OGL.
