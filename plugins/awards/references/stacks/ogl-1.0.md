# OGL 1.0

<!-- Labels: [verified: context7] = checked against Context7 (`/oframe/ogl`: README and examples), 2026-09 · [verified: source] = read in the published package, `recipes/node_modules/ogl/src` at 1.0.11 · [recalled] · [unverified]. -->

## What it is for in this skill set
The lighter sibling of Three for the same architecture: one canvas, planes laid over DOM rects, scroll and velocity as uniforms, the DOM keeping layout and semantics [pattern:webgl-architecture]. It fits a page whose GL is image planes, a mask or a fullscreen shader and nothing else: [site:siena]'s film roll and the [site:floema-jewelry] capstone are that shape. It is a thin layer over WebGL with a Three-like scene graph, zero dependencies and far fewer features [verified: context7, README]; everything Three does for you (colour management, disposal, context loss, PBR, a post stack) you write yourself. Three stays the default [pattern:webgl-architecture]; the choice is spelled out at the end of this note.

## Install (pinned)
```sh
npm i ogl@1.0.11          # npm view ogl version → 1.0.11 (2026-09), matches versions.md
```
```js
import { Renderer, Camera, Transform, Program, Mesh, Plane, Texture, RenderTarget } from 'ogl';
```
ES modules, `"sideEffects": false`, TypeScript types shipped in `types/` [verified: source, package.json]. README sizes, minzipped: core 8 KB, math 6 KB, extras 15 KB, 29 KB for everything, less after tree-shaking [verified: context7, README]. Still load it behind a dynamic `import()` like any GL chunk.

## The API surface we use
### Renderer [verified: source, core/Renderer.js]
```js
const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, antialias: false, powerPreference: 'high-performance' });
const gl = renderer.gl;            // WebGL2, falls back to WebGL1; renderer.isWebgl2 says which
gl.clearColor(0, 0, 0, 0);         // manual: the renderer never sets the clear colour
renderer.render({ scene, camera }); // also: target, clear, sort = true, frustumCull = true, update = true
```
Constructor defaults: `dpr 1`, `alpha false`, `depth true`, `stencil false`, `antialias false`, `premultipliedAlpha false`, `autoClear true`, `webgl 2`. The context is on `renderer.gl` and `gl.renderer` points back, which is how every other class reaches shared state. `render()` sorts opaque, then transparent (depth-tested, back to front), then `depthTest: false` meshes; `renderOrder` overrides all three.

### Camera and Transform [verified: source, core/Camera.js, core/Transform.js]
- `new Camera(gl, { fov: 45, near: .1, far: 100, aspect })`; passing `left`/`right` makes it orthographic. `camera.perspective({ aspect })` rebuilds the projection; `lookAt(target)`, `project(v)`, `unproject(v)`.
- `Transform` is the scene graph: `position`, `rotation` (Euler), `quaternion` and `scale` stay in sync; `setParent(parent)` / `addChild` / `removeChild`; `visible = false` skips a node and its children; `traverse(cb)` stops descending when `cb` returns true.

### Program, Mesh, Plane [verified: source + context7 examples]
```js
const geometry = new Plane(gl, { widthSegments: 32, heightSegments: 32 }); // 1×1, centred, position/normal/uv/index
const program = new Program(gl, {
  vertex, fragment,
  uniforms: { tMap: { value: texture }, uSpeed: { value: 0 }, uViewport: { value: [1, 1] } },
  transparent: true, cullFace: false,              // cullFace defaults to gl.BACK
});
const mesh = new Mesh(gl, { geometry, program });
mesh.setParent(scene);
```
- `Mesh.draw` fills `modelMatrix`, `viewMatrix`, `modelViewMatrix`, `normalMatrix`, `projectionMatrix` and `cameraPosition` for you; the shader declares them and the `position` / `uv` attributes itself (no injected prelude, unlike three's `ShaderMaterial`).
- Uniforms are `{ value }` objects read every draw; mutate `.value` in the loop. A uniform the shader uses but the program lacks logs a warning (capped at 100) and is skipped.
- `transparent: true` enables `SRC_ALPHA, ONE_MINUS_SRC_ALPHA` blending, or `ONE, ONE_MINUS_SRC_ALPHA` when the renderer is `premultipliedAlpha`.
- Shaders are GLSL 1.0 (`attribute`, `varying`, `texture2D`, `gl_FragColor`) in the examples; `#version 300 es` works on WebGL2 but breaks the WebGL1 fallback, so ship both and pick with `renderer.isWebgl2` [verified: context7, normal-maps example].
- Fullscreen shader without camera or scene graph: `renderer.render({ scene: mesh })` on a `Triangle` [verified: context7, README].

### Texture [verified: source, core/Texture.js]
```js
const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR }); // 1×1 empty pixel until an image arrives
const img = new Image(); img.src = el.dataset.src;
await img.decode();                                   // [recalled] standard HTMLImageElement API
texture.image = img;                                  // uploaded on the next draw that uses it
```
Defaults for a 2D texture: `flipY: true`, `generateMipmaps: true` with `minFilter NEAREST_MIPMAP_LINEAR`, clamp-to-edge, `format = internalFormat = gl.RGBA`, `UNSIGNED_BYTE`. On WebGL1 a non-power-of-two image silently drops mips and clamps. Video: set `texture.needsUpdate = true` each frame once `readyState` is enough [verified: context7, textures example]. `TextureLoader.load(gl, { src })` returns a texture with a `loaded` promise and caches by `src` plus options; `TextureLoader.clearCache()` empties that cache [verified: source, extras/TextureLoader.js].

### RenderTarget and Post [verified: source]
`new RenderTarget(gl, { width, height, type, depth })` defaults to the canvas's device-pixel size at construction and exposes `texture` / `textures[]`; `rt.setSize(w, h)` re-allocates. `Post` is a ping-pong pass chain with `resize({ width, height, dpr })`. Extras also ship `Flowmap`, `GPGPU`, `Text` (MSDF layout), `GLTFLoader`, `KTXTexture`, `BasisManager`, `DracoManager`, `Raycast` [verified: source, src/index.js exports].

## DOM-tethered planes on a virtual scroll
The mapping is Three's [recipe:gl-dom-tethered-planes], in viewport units instead of pixels. The world size of the view at the plane's depth comes from the camera:
```js
// perspective camera at z, planes at z = 0   [recalled: frustum height = 2·tan(fov/2)·distance]
const fov = camera.fov * Math.PI / 180;
const viewH = 2 * Math.tan(fov / 2) * camera.position.z;
const viewW = viewH * camera.aspect;

// measure once per resize, against the document, not per frame
item.rect = { top: r.top + scroll.current, left: r.left, width: r.width, height: r.height };

// per frame, from the same float that translates the DOM
const y = item.rect.top - scroll.current;
mesh.scale.set((item.rect.width / innerWidth) * viewW, (item.rect.height / innerHeight) * viewH, 1);
mesh.position.x = -viewW / 2 + mesh.scale.x / 2 + (item.rect.left / innerWidth) * viewW;
mesh.position.y =  viewH / 2 - mesh.scale.y / 2 - (y / innerHeight) * viewH;
program.uniforms.uSpeed.value = scroll.velocity;
```
- One float drives both layers: `current` eases toward `target` (lerp .1 at [site:floema-jewelry] and [site:siena]), the DOM gets `translateY(-current)`, the planes read the same value in the same tick. Reading `getBoundingClientRect()` per frame works but costs a layout read per plane per frame; measuring at resize and offsetting by the float does not [inferred].
- A looping roll wraps each item's offset by a modulo of the strip height ([site:siena], `gl-endless-reel-sheets`) [recipe:gl-endless-reel-sheets]; a gated or redirected story owns the float outright [recipe:gl-virtual-scroll-camera].
- Render on the one ticker after the float updates (Siena renders on GSAP's ticker [site:siena]); never a second `requestAnimationFrame`.
- Vertex displacement (Floema's `z -= … * abs(uSpeed)`) moves vertices outside the bounding sphere OGL computed from the flat `position` attribute once, so an edge plane can be culled while still visible; pass `frustumCulled: false` on distorted planes [verified: source, `frustumIntersectsMesh` uses `geometry.bounds`; the pop is inferred].

## Colour space (manual)
OGL has no colour management: no `outputColorSpace`, no `colorspace_fragment` chunk, no conversion anywhere in `Program` or `Renderer` [verified: source, no sRGB handling beyond requesting `EXT_sRGB` on WebGL1]. What that means in practice:
- A pass-through fragment (`gl_FragColor = texture2D(tMap, vUv)`) with the default `RGBA` upload shows the image as authored: sRGB bytes in, sRGB bytes out. This is why OGL image planes do not render dark the way an unconverted Three `ShaderMaterial` does [inferred from the source].
- `new Color('#2D628C')` is the hex divided by 255, still sRGB-encoded [verified: source, math/functions/ColorFunc.js], so a CSS token and the clear colour match with no conversion [pattern:webgl-architecture#colour-parity] [recipe:theme-swap-tokens].
- Blending, blur, lighting, mixing two stills or a fluid wake are only correct in linear light. Either decode in the shader and re-encode at the end, or upload with `internalFormat: gl.SRGB8_ALPHA8` on WebGL2 so the sampler returns linear values [recalled: WebGL2 sized sRGB format], then re-encode:
```glsl
vec3 toLinear(vec3 c) { return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(.04045, c)); }
vec3 toSRGB(vec3 c)   { return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
// gl_FragColor.rgb = toSRGB(linearResult);
```
- The rule: one space per program. Decoding without re-encoding renders dark; re-encoding a value that was never decoded renders washed out. Render targets carry whatever the writing pass wrote, so the reading pass must agree [inferred].

## Resize and DPR
```js
function resize() {
  renderer.dpr = Math.min(devicePixelRatio, profile.dpr);   // dpr is a plain field read by setSize and render
  renderer.setSize(innerWidth, innerHeight);                 // CSS px; buffer = size × dpr
  camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
  rt?.setSize(gl.canvas.width, gl.canvas.height);            // targets never follow the canvas on their own
  measureItems();                                            // re-read DOM rects, then viewW / viewH
}
```
- `setSize(w, h)` writes `canvas.width/height = w/h × dpr` and **inline** `style.width/height` in px [verified: source]; a stylesheet `width: 100%` loses to it, so size from the viewport or the container, not from CSS.
- There is no `setPixelRatio`. `recipes/_shared/quality-tiers.js` `applyRendererBudget()` calls `renderer.setPixelRatio` and `setSize(w, h, false)` [verified: source], which is Three's API; for OGL apply the same maths by hand: `renderer.dpr = profile.dpr * Math.min(1, Math.sqrt(profile.maxPixels / (w * h * profile.dpr ** 2)))` [recipe:quality-tiers].
- The constructor already sized the canvas to 300 × 150; call `resize()` once before the first frame [verified: source].

## Disposal
OGL has no `dispose()` on anything; the TODOs in `Texture.js` and `Renderer.js` say so [verified: source]. What exists: `geometry.remove()` deletes its VAOs and buffers; `program.remove()` deletes the program but not its two shaders. Everything else is raw GL:
```js
function disposeMesh(mesh, { keepGeometry = false } = {}) {
  const { gl, program } = mesh;
  mesh.setParent(null);
  if (!keepGeometry) mesh.geometry.remove();                 // shared geometry: remove once, last
  for (const u of Object.values(program.uniforms)) if (u.value?.texture) gl.deleteTexture(u.value.texture);
  program.remove(); gl.deleteShader(program.vertexShader); gl.deleteShader(program.fragmentShader);
}
function disposeTarget(gl, rt) {
  rt.textures.forEach((t) => gl.deleteTexture(t.texture));
  rt.depthTexture && gl.deleteTexture(rt.depthTexture.texture);
  for (const b of [rt.depthBuffer, rt.stencilBuffer, rt.depthStencilBuffer]) b && gl.deleteRenderbuffer(b);
  gl.deleteFramebuffer(rt.buffer);
}
// tear down the whole canvas on route exit
gl.getExtension('WEBGL_lose_context')?.loseContext();       // [recalled] standard WebGL extension
```
A texture that came from `TextureLoader` stays in its cache after `deleteTexture`; call `TextureLoader.clearCache()` on teardown or the next `load` of that `src` hands back a dead texture [verified: source, cache keyed by src + options + renderer id]. Context loss is not handled either (`// TODO: Handle context loss` [verified: source]): listen for `webglcontextlost` yourself and fall back to the DOM images [pattern:webgl-architecture#scene-windows-and-disposal].

## Reduced motion and accessibility hooks
Same contract as Three: the canvas is `aria-hidden="true"`, every plane mirrors an `<img>` with its alt in the DOM, reduced motion renders one settled frame with `uSpeed` at 0 and stops the loop, the static tier removes the canvas [pattern:webgl-architecture]. [site:siena] had no reduced-motion branch at all and failed that check [verified: site card].

## Gotchas
- `cullFace` defaults to `gl.BACK`: a plane turned past 90°, or a strip that flips, vanishes; set `cullFace: false` as the examples do.
- The default mip filter on a downscaled plane looks fine, but mips on large photos cost memory; `generateMipmaps: false, minFilter: gl.LINEAR` for planes shown near 1:1.
- `flipY: true` is the default for images; render-target textures are created with `flipY: false` [verified: source]. Sampling a target with image-style UVs shows it upside down.
- `premultipliedAlpha: false` plus `alpha: true` on a canvas over the DOM: edges of transparent planes fringe unless the shader output agrees; either keep straight alpha end to end or set both the renderer and textures to premultiplied [recalled].
- `renderer.setSize` inside a `ResizeObserver` on the canvas itself loops, because `setSize` rewrites the canvas style [inferred from the source].
- Copying Floema's course code: it pins OGL ^0.0.73 [site:floema-jewelry]; what changed between 0.0.x and 1.0 is [unknown], so port against 1.0.11's source, not the clone.
- The recipes in this repo are written in Three; the OGL variant of `gl-dom-tethered-planes` and `gl-fluid-wake-post` exists as a note in `recipe.json`, not as a verified build. An OGL build is outside what `verify-recipes` proves.

## When to choose OGL over Three
Read beside `three-0.186.md`. Choose OGL when every GL element is a textured plane, a mask or a fullscreen shader, bundle weight is a stated budget, and the team is comfortable owning colour, disposal and context loss by hand (Siena's roll, Floema's gallery). Choose Three when the scene has a glTF model with lit materials, a post stack (pmndrs `postprocessing` presets), KTX2 across many textures, colour management you want done for you, or a React / Svelte wrapper (R3F, Threlte); also when the build should lean on this repo's verified GL recipes, all of which are Three. When in doubt, Three: OGL's size win is real but the saving is usually smaller than one hero image [inferred].

## Where the corpus used it
[site:siena] (`Renderer` with `isWebgl2`, `Program`, `Mesh` in `app.js`, version [unknown]; one canvas, DPR ≤ 2, mask-texture frame shader rendered on the GSAP ticker) and [site:floema-jewelry] (OGL ^0.0.73 in the course clones: every image an OGL plane over an `<img data-src>`, the velocity bulge in the vertex stage). [site:floema] is the negative case: the served floema.com has WebGL but no OGL signature, every `ogl` hit there is a substring of "google" [verified absence, site card].
