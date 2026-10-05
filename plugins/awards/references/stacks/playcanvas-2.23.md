# PlayCanvas Engine 2.23

<!-- Labels: [verified: context7] = Context7 `/playcanvas/engine` (README + maintainer rules) and `/websites/developer_playcanvas_user-manual` (scripting, asset loading), 2026-10 · [verified: d.ts] = `build/playcanvas.d.ts` and `build/playcanvas.mjs` of the published playcanvas@2.23.0 tarball, 2026-10 · [recalled] · [unverified]. playcanvas is not pinned in versions.md or recipes/package.json; 2.23.0 is `npm view playcanvas version` on 2026-10-05. -->

## What it is for in this skill set
A whole-world engine for the 100 %-canvas end of the WebGL dosage scale: entity / component scene graph, glTF containers, clustered lighting, shadows, an anim state graph, positional sound and a script system in one runtime [verified: context7]. Choose it over three ([three-0.186.md](three-0.186.md)) when the team authors in the PlayCanvas Editor and ships an Editor export, as [site:edolus] did. For DOM-first pages with a few GL accents, three or OGL stay the default; no recipe in this catalogue uses PlayCanvas, so the recipe patterns ([recipe:gl-progress-scene-windows], [recipe:gl-virtual-scroll-camera], [recipe:quality-tiers]) port across by hand [pattern:webgl-architecture].

## Install (pinned)
```sh
npm i playcanvas@2.23.0
```
```js
import { Application, Entity, Color, FILLMODE_FILL_WINDOW, RESOLUTION_AUTO } from 'playcanvas';
```
The package is `"type": "module"` with ESM and UMD builds plus `playcanvas.d.ts` [verified: d.ts]. No-build: an import map pointing `playcanvas` at `https://cdn.jsdelivr.net/npm/playcanvas/+esm` [verified: context7]; pin the version in that URL. Wrappers on the same engine objects: `@playcanvas/react`, `@playcanvas/web-components` [verified: context7]. An Editor export is a different shape: classic scripts (`__settings__.js`, `__start__.js`, `__loading__.js`, `config.json`, one concatenated `__game-scripts.js`) with the engine served as a separate file [verified: [site:edolus] card]; its engine version is whatever the Editor shipped (edolus: 2.21.4).

## The API surface we use
### App and canvas [verified: context7 README, d.ts]
- `new Application(canvas)`; or `createGraphicsDevice(canvas, { deviceTypes: [DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2] })` and pass the device through `AppOptions` to `AppBase` when you want WebGPU first.
- `app.setCanvasFillMode(FILLMODE_FILL_WINDOW)`, `app.setCanvasResolution(RESOLUTION_AUTO)`, and `window.addEventListener('resize', () => app.resizeCanvas())`.
- `app.graphicsDevice.maxPixelRatio`: the DPR cap; the lever for a DPR governor (edolus steps it between 1 and 2 by frame time).
- `app.autoRender = false` + `app.renderNextFrame = true`: render only on change; the idle gate.
- `app.timeScale` scales dt for scripts, animation and physics together (0 freezes them); `app.maxDeltaTime` clamps a long frame.
- `app.on('update', (dt) => …)`, dt in seconds; the app also fires `prerender`, `postrender`, `framerender`, `frameend` [verified: d.ts, `fire(...)` in playcanvas.mjs]. `app.start()` begins the loop; `app.destroy()` tears it down.

### Scene graph [verified: context7]
- `new Entity(name)`, `entity.addComponent('render' | 'camera' | 'light' | 'script' | 'sound' | 'anim', opts)`, `app.root.addChild(e)`. Prefer `render` over the legacy `model` component.
- Right-handed, +Y up, cameras look down −Z; `setEulerAngles`, `rotate`, `rotateLocal` take **degrees**.
- `Color` channels are 0–1 floats; call `material.update()` after changing a `StandardMaterial`.
- Tone mapping and gamma live on the camera component: `camera.toneMapping`, `camera.gammaCorrection` [verified: context7 rules; properties in d.ts]. Constants: `TONEMAP_LINEAR 0, FILMIC 1, HEJL 2, ACES 3, ACES2 4, NEUTRAL 5, NONE 6`; `GAMMA_NONE 0, GAMMA_SRGB 1` [verified: d.ts]. So edolus's scene value `4` is ACES2.
- `CameraFrame` (exported) is the 2.x camera post stack (bloom, DOF, grading) [verified: d.ts export]; its option names were not read this pass [unverified].

### Assets [verified: context7 manual, d.ts JSDoc]
- `app.assets.loadFromUrl('model.glb', 'container', (err, asset) => app.root.addChild(asset.resource.instantiateRenderEntity()))`.
- Batches: `new Asset(name, type, { url })`, `app.assets.add()`, then `app.assets.load()` or `AssetListLoader`; wait for `load` / `asset.ready()` before reading `asset.resource`.
- Compressed: `dracoInitialize(config)` and `basisInitialize(config)` are exported for Draco meshes and Basis textures; `WasmModule.setConfig('Ammo', { glueUrl, wasmUrl, fallbackUrl })` before physics [verified: d.ts exports; context7 rules]. Config fields beyond those three were not read [unverified].

### Scripts [verified: context7 manual]
```js
import { Script } from 'playcanvas';
export class Progress extends Script {
  static scriptName = 'progress';
  /** @attribute */ speed = 10;
  initialize() {}
  update(dt) {}
}
// engine-only: registerScript(Progress, undefined, app)  or  app.scripts.add(Progress)
// entity.addComponent('script'); entity.script.create('progress');
```
ESM scripts use `.mjs` in the Editor and register automatically there. `createScript()` is the legacy classic form (what edolus ships); never mix the two styles in one file.

## Integration with the others
- **GSAP:** tween plain objects or uniform holders, then write them into entities in `app.on('update')`; drive `gsap.ticker` from the app loop or let both run on rAF, never two independent animation clocks fighting over one value [recalled]. Edolus injected GSAP core only, for camera and post-preset tweens [verified: [site:edolus] card].
- **Scroll:** a PlayCanvas page is usually a virtual float, not Lenis: a script owns progress 0..1 from wheel / touch / keys, and every scene window, camera key and sound band reads it ([recipe:gl-virtual-scroll-camera], [recipe:gl-progress-scene-windows]).
- **Capture:** expose `window.__awards` from the loader script; its `scrollTo` must set the progress script's target and current together so the frame settles [recalled; contract in `recipes/_shared/awards-hook.js`].
- **DOM twin:** chapter copy rendered to GL textures needs a hidden-from-sight DOM mirror with headings [pattern:accessibility-and-reduced-motion].

## Reduced motion and accessibility hooks
The engine has no reduced-motion switch [recalled]. Read `matchMedia('(prefers-reduced-motion: reduce)')` yourself: set `app.timeScale = 0` after one settled frame per chapter, or `autoRender = false` and render on chapter change. Gates and controls are real `<button>`s outside the canvas; edolus's click-only `div` gate is the failure to avoid [verified: [site:edolus] card].

## Performance rules
- Cap `maxPixelRatio` (1.5–2) and lower it from measured frame time; persist the learned ceiling [verified: [site:edolus] card; see [recipe:quality-tiers]].
- `autoRender = false` once the scene is idle; `renderNextFrame = true` on input.
- Toggle chapter entities with `enabled`; destroy only what never returns (`entity.destroy()`, `asset.unload()`, `material.destroy()`, `texture.destroy()`) [verified: context7 rules].
- Compress GLBs (Draco or meshopt) and textures (Basis / KTX2); edolus shipped 23.5 MB of uncompressed GLB to phones [verified: [site:edolus] card].
- Warm shaders before the visitor sees a chapter: walk the progress windows behind the loader with culling off, as edolus does [verified: [site:edolus] card].
- No `new Vec3/Quat/Mat4/Color` inside `update`; reuse module-scope temporaries [verified: context7 rules].

## Gotchas
- Degrees, not radians, in every rotation call.
- Tone mapping set on the scene in 1.x tutorials; in 2.x it belongs to the camera [verified: context7 rules].
- An Editor export is unbundled classic scripts with no tree-shaking: the edolus game-scripts file alone is 1.0 MB [verified: [site:edolus] card].
- WebGPU first means custom shaders need a WGSL path or the device list must stay `[webgl2]`; do not call WebGL or WebGPU APIs directly [verified: context7 rules].
- `material.update()` forgotten after a property change: nothing changes.
- 2.21 (edolus) to 2.23: no changelog was read this pass [unknown]; check release notes before porting Editor-era code.

## Where the corpus used it
[site:edolus]: PlayCanvas Engine 2.21.4 as an Editor export, WebGL2 with WebGL1 fallback, clustered lighting, 107 classic scripts, GSAP core for tweens, `sound.slot` audio, Basis transcoder, no Draco [verified: card]. No other card in `references/sites/` names PlayCanvas (grep, 2026-10-05).
