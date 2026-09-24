# three-custom-shader-material 6.4

<!-- Labels: [verified: tarball] = read from `npm pack three-custom-shader-material@6.4.0` (README.md, package.json, vanilla/vanilla.d.ts, react.d.ts, vanilla/three-custom-shader-material.es.js, three-custom-shader-material.es.js), 2026-09 · [verified: r186 probe] = compiled and rendered against three 0.186.0 in headless Chromium + SwiftShader (Standard, Physical, Lambert instance, Points and Basic bases; pixels read back), plus a string probe of every patch target in three 0.186's ShaderLib, 2026-09 · [inferred] = derived from the verified source, not documented · [recalled] · [unverified]. Context7 has no entry for this library (checked 2026-09). Where the README and the 6.4.0 source disagree, the source wins and the conflict is named. -->

## What it is for in this skill set
Extending one of three's lit materials (`MeshStandardMaterial`, `MeshPhysicalMaterial`, Lambert, Phong, Toon, `PointsMaterial`, `MeshDepthMaterial`) with your own vertex and fragment code while keeping everything the material already does: lights, shadows, fog, environment maps, tone mapping and the output colour-space conversion [verified: tarball, README intro and source]. It is the tool for a displaced, lit surface: a cloth ground with noise folds and a pointer-trail push [site:bethebuzz], a terrain lit by the scene, a PBR object whose colour or roughness is driven by a uniform. It is not for unlit image planes, post passes or text: those stay on `ShaderMaterial` like the catalogue's GL recipes (`gl-dom-tethered-planes`, `gl-depth-map-parallax`, `gl-msdf-text`) [recipe:gl-dom-tethered-planes]. The short rule for choosing is in the last section but one.

## Install (pinned)
```sh
npm i three-custom-shader-material@6.4.0
```
```js
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';   // vanilla three, a class
import CustomShaderMaterial from 'three-custom-shader-material';           // React Three Fiber, a component
```
[verified: tarball, package.json `exports` `.` and `./vanilla`, README examples]. Peer dependencies `three >=0.159`, `@react-three/fiber >=8.0` and `react >=18.0`, the last two optional, so the vanilla entry needs only three [verified: tarball, package.json `peerDependenciesMeta`]. No runtime dependencies. The vanilla ES module is 17.3 KB unminified, 4.5 KB gzip [verified: tarball, measured]; it belongs in the lazy GL chunk with three, never in the entry bundle [pattern:webgl-architecture]. 6.4.0 was published 2025-10-12 and is the latest as of 2026-09 [verified: npm registry].

## The API surface we use
### Constructor [verified: tarball, vanilla.d.ts and source]
```js
const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,  // a constructor or an existing material instance; required
  vertexShader,                               // optional GLSL: declarations + void main() { … }
  fragmentShader,                             // optional GLSL
  uniforms: { uTime: { value: 0 } },          // merged with the base material's own uniforms
  patchMap,                                   // optional extra string replacements (below)
  cacheKey,                                   // optional () => string for the program cache
  roughness: .6, color: '#6b3fd6', side: THREE.DoubleSide,   // anything else goes to the base material
});
```
- A constructor is instantiated with the remaining options; an instance gets them `Object.assign`ed. A `ShaderMaterial` or `RawShaderMaterial` base throws `CustomShaderMaterial does not support ShaderMaterial as a base material.` [verified: source; r186 probe].
- The result behaves as the base type: `material.type === 'MeshStandardMaterial'`, `material.isMeshStandardMaterial === true`, `material.name === 'CustomShaderMaterial<MeshStandardMaterial>'` [verified: r186 probe]. Renderer paths that branch on the material type (lights, transmission, shadows) therefore treat it as the base.
- `material.update({ vertexShader, fragmentShader, uniforms, patchMap, cacheKey })` swaps shaders and sets `needsUpdate`; `material.clone()` rebuilds from a cloned base [verified: source].
- A `CustomShaderMaterial` can itself be the `baseMaterial` of another. Bodies run in chain order, first material first; identifiers are not scoped, so two links declaring `uTime` or `vUv` fail with redefinition errors [verified: tarball, README "Gotchas"].

### How your shader is spliced in [verified: source]
Everything before your `void main() {` (uniforms, varyings, functions) is hoisted above three's `main`; the body of your `main` is pasted at the top of three's `main`, after CSM has initialised its outputs to the material's own values. Your code therefore runs before any three chunk, and three reads the `csm_*` values where it would have read its own. Comments are stripped before keyword detection, so an output named only in a comment changes nothing.

Defaults your code starts from: `csm_Position = position`, `csm_Normal = normal`, `csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(position, 1.)`, `csm_DiffuseColor = vec4(diffuse, opacity)` multiplied by the `map` sample when a map is set, `csm_Roughness`/`csm_Metalness`/`csm_Emissive` = the material's uniforms, `csm_UnlitFac = 0.` [verified: source]. So `csm_DiffuseColor.rgb *= shade;` keeps the colour map and tints it; assigning a fresh `vec4` discards the map.

### Output variables
| Variable | Type | Stage | Where three reads it | Base materials that accept it |
|---|---|---|---|---|
| `csm_Position` | `vec3` | vertex | replaces `transformed` at `begin_vertex`: object space, before skinning, morphs, instancing and projection | all |
| `csm_PositionRaw` | `vec4` | vertex | overwrites `gl_Position` after `project_vertex` (clip space) | all |
| `csm_Normal` | `vec3` | vertex | replaces `objectNormal` at `beginnormal_vertex` | all |
| `csm_PointSize` | `float` | vertex | replaces `gl_PointSize = size` | `PointsMaterial` |
| `csm_DiffuseColor` | `vec4` | fragment | `diffuseColor` after `color_fragment`; lighting is applied to it | all |
| `csm_FragColor` | `vec4` | fragment | mixed into `gl_FragColor` after `opaque_fragment` by `csm_UnlitFac`, which becomes `1.` automatically when the shader mentions `csm_FragColor` | all |
| `csm_UnlitFac` | `float` | fragment | the mix between lit `csm_DiffuseColor` and unlit `csm_FragColor` | all |
| `csm_Roughness`, `csm_Metalness` | `float` | fragment | after `roughnessmap_fragment` / `metalnessmap_fragment` | Standard, Physical |
| `csm_Emissive` | `vec3` | fragment | `totalEmissiveRadiance` | Standard, Physical |
| `csm_AO` | `float` | fragment | `indirectDiffuse *= 1. - csm_AO` after `aomap_fragment` | Standard, Physical, Basic, Lambert, Phong, Toon |
| `csm_FragNormal` | `vec3` | fragment | `normal` after `normal_fragment_maps` (view space) | declared only for Standard, Physical, Lambert, Phong, Toon, Matcap, Normal, Shadow |
| `csm_Iridescence` | `float` | fragment | `material.iridescence` | Standard, Physical |
| `csm_Clearcoat`, `csm_ClearcoatRoughness`, `csm_ClearcoatNormal`, `csm_Transmission`, `csm_Thickness` | `float` / `vec3` | fragment | the matching `material.*` field | Physical |
| `csm_DepthAlpha` | `float` | fragment | alpha or discard in `MeshDepthMaterial` (and the distance material, see compatibility) | declared for all, read only by Depth |

[verified: source, the declaration block, the default block and the keyword → material gating table; r186 probe for Position, Normal, DiffuseColor, Roughness, FragColor, Clearcoat, Emissive, PointSize]. README conflicts, source wins: the README types `csm_FragNormal` as `float` (it is `vec3`), and says roughness, metalness and emissive need a `roughnessMap` / `metalnessMap` / an `emissive` material, while the source gates them on Standard or Physical only, so `csm_Emissive` on a Lambert base is refused. Mentioning `csm_Clearcoat*`, `csm_Transmission`/`csm_Thickness` or `csm_Iridescence` sets `material.clearcoat`, `.transmission` or `.iridescence` to `1` if it was `0`, so the physical branch compiles [verified: source; r186 probe `clearcoat === 1`]. Bump mapping as its own output was removed in 6.4.0; derive it into `csm_FragNormal` [verified: tarball, README "Bump mapping"].

### Uniforms [verified: source; r186 probe]
Your `uniforms` object is merged into the compiled program's uniforms, and after the first compile `material.uniforms` is replaced by that merged object. The individual `{ value }` objects are the same references, so both `uniforms.uTime.value = t` on the object you passed and `material.uniforms.uTime.value = t` work; replacing a whole `{ value }` entry after compile does not reach the program [inferred]. Writing `.value` never recompiles. Colour uniforms as `THREE.Color` land in the working (linear) space the same way `material.color` does [recalled].

### patchMap and cacheKey [verified: tarball, README "Custom overrides", vanilla.d.ts]
```js
patchMap: {
  uGrain: { '#include <dithering_fragment>': '#include <dithering_fragment>\n gl_FragColor.rgb += uGrain;' },  // applied only if your shader text contains uGrain (declare it there)
  '*': { 'to replace': { value: 'replacement', type: 'fs' } },   // '*' always applies; type limits it to 'fs' or 'vs'
}
```
Program cache key = `cacheKey?.() || hash(vertexShader + fragmentShader)` + the base material's own key, so identical CSM materials share one program [verified: source]. Supply `cacheKey` only when uniforms change `#define`s or branches the shader text does not show.

### React Three Fiber entry [verified: tarball, three-custom-shader-material.es.js and react.d.ts]
```jsx
import CustomShaderMaterial from 'three-custom-shader-material';
import CSMImpl from 'three-custom-shader-material/vanilla';    // type for the ref

const uniforms = useMemo(() => ({ uTime: { value: 0 }, uTrail: { value: null } }), []);
const ref = useRef(null);   // useRef<CSMImpl<typeof THREE.MeshStandardMaterial>>(null!) in TS
useFrame((state) => { uniforms.uTime.value = state.clock.elapsedTime; });
return (
  <mesh>
    <planeGeometry args={[w, h, 128, 128]} />
    <CustomShaderMaterial ref={ref} baseMaterial={THREE.MeshStandardMaterial}
      vertexShader={vs} fragmentShader={fs} uniforms={uniforms} map={diffuse} roughness={0.8} />
  </mesh>
);
```
The component builds the vanilla material in a `useMemo` keyed on `baseMaterial` alone, renders it as `<primitive object={material} attach="material" {...rest} />` (so base props like `map` and `roughness` are applied by R3F as props), calls `dispose()` + `update()` when `vertexShader`, `fragmentShader`, `uniforms`, `patchMap` or `cacheKey` change by reference, and disposes on unmount. The ref is the vanilla instance. Changing `baseMaterial` builds a new material; an inline `uniforms={{…}}` object is a new reference every render and recompiles the program every render, so memoize it [verified: README "Performance" and wrapper source]. An `attach` prop overrides `"material"`, e.g. `attach="customDepthMaterial"` [verified: wrapper source]. React 19 with R3F 9.7 is inside the declared peer ranges; it was not exercised in the probe [unverified].

## Integration with the others
```js
// vanilla — a lit cloth ground on one ticker (the shape of the Be The Buzz ground; values are ours)
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

const uniforms = { uTime: { value: 0 }, uFold: { value: 4 }, uPointer: { value: new THREE.Vector2() } };
const cloth = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial, map: diffuseMap, roughness: .85, uniforms,
  vertexShader: /* glsl */`
    uniform float uTime; uniform float uFold; uniform vec2 uPointer;
    varying float vLift;
    float field(vec2 p) { return sin(p.x * uFold + uTime) * .5 + .5; }   // swap in value noise
    void main() {
      float e = .01;
      float h  = field(uv), hx = field(uv + vec2(e, 0.)), hy = field(uv + vec2(0., e));
      csm_Position = position + normal * h * .2;
      csm_Normal = normalize(vec3(-(hx - h) / e * .2, -(hy - h) / e * .2, 1.));  // finite differences in uv; scale by the plane size for exact normals
      vLift = h;
    }`,
  fragmentShader: /* glsl */`
    varying float vLift;
    void main() { csm_DiffuseColor.rgb *= mix(.1, 1.1, vLift); }   // keeps the map, shades by elevation
  `,
});
gsap.ticker.add((t) => { uniforms.uTime.value = t * .3; });   // the one ticker [recipe:boot-lenis-gsap]
```
- Scroll and pointer arrive as uniforms written in the same ticker callback, never from their own rAF [pattern:webgl-architecture#scroll-and-pointer-as-uniforms].
- Shadows from displaced geometry: give the mesh a `customDepthMaterial` built from `baseMaterial: THREE.MeshDepthMaterial` with the same vertex shader and uniforms; otherwise the shadow is the flat plane's [inferred: source patches the depth shader's `begin_vertex` for any base; README names `customDepthMaterial` under `csm_DepthAlpha`].
- Disposal: `material.dispose()` and the base's textures on scene exit, like any material [pattern:webgl-architecture#scene-windows-and-disposal].
- Quality tier: segment count and whether normals are recomputed per vertex are the knobs; DPR comes from `applyRendererBudget` [recipe:quality-tiers].

## three 0.186 compatibility
- Declared peer `three >=0.159`; 0.186 is inside it [verified: tarball, package.json].
- Standard (position, normal, diffuse, roughness, uniforms), Physical (clearcoat, emissive), unlit `csm_FragColor`, a Lambert instance base and `PointsMaterial` with `csm_PointSize` all compiled with zero shader errors and rendered the expected pixels on three 0.186.0 [verified: r186 probe].
- Every string CSM patches exists in 0.186's ShaderLib except one: the distance material (point-light shadow maps) now writes `gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );`, not `packDepthToRGBA( dist )`, so `csm_DepthAlpha` has no effect in point-light shadows on 0.186 [verified: r186 probe of the strings; the effect is inferred]. In `MeshDepthMaterial` only the Basic and RGBA packing branches are patched; RGB and RG packing ignore it [verified: r186 probe; inferred].
- An output used on a base that does not accept it logs `CustomShaderMaterial: csm_Roughness is not available in MeshBasicMaterial. Shader cannot compile.` and the program fails (black) [verified: r186 probe].
- WebGLRenderer only. CSM works through `onBeforeCompile` and `customProgramCacheKey` [verified: source], which `WebGPURenderer` and node materials do not run; on that renderer the equivalent is a TSL node material [recalled].
- The corpus site ran it on three r162 [site:bethebuzz]; nothing in 6.4.0 is specific to either version beyond the patch strings above [inferred].

## Reduced motion and accessibility hooks
The material has no motion of its own: motion is whatever writes `uTime` and the pointer uniforms. Under the reduced tier stop advancing `uTime` and let the pointer trail decay; under the static tier render one frame and stop the loop [recipe:reduced-motion-switch]. Be The Buzz shipped no reduced-motion branch and its cloth kept moving [site:bethebuzz]. The canvas stays `aria-hidden`; the DOM carries the content [pattern:webgl-architecture#content-fallback-tiers].

## Performance rules
- Initialisation is cheap in v6; the cost is the program compile, shared by every material with the same cache key [verified: README "Performance"].
- Recompiles happen only when `baseMaterial`, either shader string, the `uniforms` reference, `patchMap` or `cacheKey` changes [verified: README and wrapper source]. Never rebuild a shader string per frame.
- Vertex displacement costs per vertex: a 128 × 128 plane is 16,641 vertices and three noise samples each when normals come from finite differences [inferred]. Step segments down with the quality tier before cutting DPR.
- A Physical base with clearcoat or transmission costs extra passes; use Standard unless the look needs them [recalled].

## Pitfalls
- `csm_Position` is object space and un-projected; multiplying it by `projectionMatrix` or `modelViewMatrix` projects it twice. `csm_PositionRaw` is clip space and skips instancing, so multiply `instanceMatrix` in yourself [verified: README "Gotchas"].
- Displacing `csm_Position` without writing `csm_Normal` lights the surface as the flat plane it was: the folds show only in silhouette.
- Assigning `csm_DiffuseColor = vec4(...)` drops `map` and `color`; multiply the default instead.
- `csm_FragColor` turns the material unlit (`csm_UnlitFac = 1.`) unless you set `csm_UnlitFac` back yourself.
- An unmemoized `uniforms` prop in React recompiles every render and resets `.value`s you wrote.
- Chained CSM materials share one namespace; prefix every identifier per link.
- A base material with its own `onBeforeCompile` runs first, and CSM's string patches fail silently if it rewrote the `#include`s they match [verified: README "Gotchas"; source runs the previous hook first].
- Do not add `#include <colorspace_fragment>`: the base material already ends with it. The CLAUDE.md rule about that include is for hand-written `ShaderMaterial`s [inferred: three's lit shaders include it].

## When a plain ShaderMaterial or onBeforeCompile is enough
- **Unlit image, video, text or post**: `ShaderMaterial` (with `#include <colorspace_fragment>`) is smaller and clearer; nothing is lost because nothing was lit. The catalogue's custom GL shaders are all `ShaderMaterial`s; no recipe uses CSM or `onBeforeCompile`.
- **One lit material, one or two edits**: `material.onBeforeCompile = (shader) => { shader.uniforms.uTime = uniforms.uTime; shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '…'); }` plus a `customProgramCacheKey` costs no dependency. CSM earns its 4.5 KB when several outputs are touched, when the same code must land in a depth material too, when materials are chained, or in R3F, where the wrapper handles rebuilds and disposal [inferred].
- **You need full control of lighting**: write a `ShaderMaterial` with the `#include`s you need; the README itself says a lost `patchMap` user is often better served that way [verified: tarball, README "Gotchas"].
- **WebGPURenderer**: TSL node materials, not CSM [recalled].

## Where the corpus used it
[site:bethebuzz] is the only card with the library in evidence (`baseMaterial`, `csm_Position`, `csm_DiffuseColor` in the layout and R3F bundles; version unknown; three r162). It drives the fixed full-viewport cloth ground: a 128 × 128 plane, UVs rotated 20°, a fold factor of 4, value-noise lift, a 256 px pointer-trail texture pushing vertices by .1 per axis, and a fragment that mixes shadow and light from the diffuse map by elevation. No other card under `references/sites/` names it.
