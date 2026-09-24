# camera-controls 3.1

<!-- Labels: [verified: tarball] = read from `npm pack camera-controls@3.1.2` (readme.md, package.json, dist/index.d.ts, dist/camera-controls.module.js), 2026-09 · [verified: Context7] = `/yomotsu/camera-controls` (readme.md, examples/config.html, examples/first-person.html), 2026-09 · [inferred] = derived from the verified source or arithmetic, not documented · [recalled] · [unverified]. Where the README and the 3.1.2 source disagree, the source wins and the conflict is named. -->

## What it is for in this skill set
The clamped, damped orbit around one explorable model: a master plan, a product, a site model with named zones that the visitor turns and the page flies to. It is the library behind the corpus's orbit camera [site:likova]. It takes the goal/current camera, the clamps, pinch-to-dolly and promise-returning fly-tos off your hands. It does not replace a scroll-driven camera rig, where the camera follows a virtual scroll and the visitor never grabs it [recipe:gl-virtual-scroll-camera]. For a plain clamped orbit the hand-written version in [recipe:gl-orbit-model-hotspots] is usually enough (see the last section).

## Install (pinned)
```sh
npm i camera-controls@3.1.2
```
Peer dependency `three >=0.126.1`, so three 0.186 is fine. ESM entry `dist/camera-controls.module.js`, types included [verified: tarball, package.json]. The minified module is 62.8 KB, about 12.4 KB gzip [verified: tarball, measured]. Lazy-load it in the GL chunk along with three, never in the entry bundle [pattern:webgl-architecture].
```js
import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE });   // once, before the first `new CameraControls` [verified: Context7 + tarball]
const controls = new CameraControls(camera, renderer.domElement);
```
- The `install` call is required. Without it the constructor logs `` `THREE` is undefined. You must first run `CameraControls.install( { THREE: THREE } )` `` and nothing works [verified: tarball, source].
- For tree-shaking, pass a subset instead of the whole namespace: `{ Vector2, Vector3, Vector4, Quaternion, Matrix4, Spherical, Box3, Sphere, Raycaster }` [verified: tarball, readme].
- R3F: drei ships a ready-made `<CameraControls>` wrapper [verified: tarball, readme points to it]. Its props and version pinning are [unverified in this pass]; check `@react-three/drei` 10.7.8's own docs before using it.
- `domElement` is optional in the constructor. Attach later with `connect(el)` and detach with `disconnect()` [verified: tarball, readme].

## The API surface we use
Properties [verified: tarball, readme table and source defaults]:
| Property | Default | Use |
|---|---|---|
| `minPolarAngle` / `maxPolarAngle` | `0` / `Math.PI` | The polar band. The corpus clamp is about 1.1–1.5 rad [site:likova] |
| `minAzimuthAngle` / `maxAzimuthAngle` | `-Infinity` / `Infinity` | Limit the turn when the model has a "back" nobody should see |
| `minDistance` / `maxDistance` | `Number.EPSILON` / `Infinity` | The dolly range. The corpus uses 40–53.5 [site:likova] |
| `smoothTime` | `0.25` | Seconds, roughly the time to reach the goal. Applies to transitions (fly-tos, `rotate(…, true)`) and to the settle after the pointer lets go |
| `draggingSmoothTime` | `0.125` | The same while the pointer is down. Keep it short so the model stays under the hand |
| `maxSpeed` | `Infinity` | Caps the dolly and target speed in a transition (not rotation) [verified: source, `smoothDamp` calls] |
| `restThreshold` | `0.01` in the 3.1.2 source; the README table says `0.0025` | How close counts as arrived: fires `rest` and resolves transition promises [verified: tarball; source wins] |
| `azimuthRotateSpeed`, `polarRotateSpeed`, `dollySpeed` | `1`, `1`, `1` | Negative values invert |
| `dollyToCursor` | `false` | Wheel dolly toward the pointer, not the target |
| `enabled` | `true` | Turn input off while a fly-to runs, or while the dialog is closed |

The smoothing is a critically damped SmoothDamp, not the per-frame `dampingFactor` v1 used, and it is framerate-independent as long as `update` receives real seconds [verified: tarball, readme v2 migration and source `smoothDamp(…, deltaTime)`]. Likova ships two smoothing times, .2 and .6 [site:likova]; which property holds which one is [unknown].

Methods. Each one taking `enableTransition` returns a `Promise` that resolves on `rest` [verified: tarball, index.d.ts + readme]:
- `update(deltaSeconds): boolean` runs once per frame and returns `true` when the camera moved. Render only then.
- `setLookAt(px, py, pz, tx, ty, tz, true)`: the zone fly-to. Camera position and orbit target in one damped move.
- `rotateTo(azimuth, polar, true)`, `rotate(dAz, dPolar, true)`, `dollyTo(d, true)`, `dolly(step, true)`, `moveTo(x, y, z, true)`, `setTarget(…)`, `setPosition(…)`.
- `fitToBox(meshOrBox3, true, { paddingTop, … })`, `fitToSphere(meshOrSphere, true)`: frame a model without hand-computing a distance.
- `saveState()` and `reset(true)`: the Home key and the "Reset view" button.
- `setBoundary(box3)` keeps the target inside a box. `stop()` cancels transitions. `normalizeRotations()` is chainable. `dispose()`.
- Events through `addEventListener`: `controlstart`, `control`, `controlend`, `transitionstart`, `update`, `wake`, `rest`, `sleep`. Use `rest` for "arrived" UI: `sleep` comes seconds later because of the damping tail. Wheel input fires no `controlstart`/`controlend` [verified: tarball, readme events].

Input mapping [verified: tarball, readme + source constructor]:
| Slot | Default (perspective camera) | For a clamped model orbit |
|---|---|---|
| `mouseButtons.left` | `ROTATE` | keep |
| `mouseButtons.right` | `TRUCK` | `ACTION.NONE` unless panning is part of the idea |
| `mouseButtons.middle` / `.wheel` | `DOLLY` | keep; an orthographic camera gets `ZOOM` |
| `touches.one` | `TOUCH_ROTATE` | keep |
| `touches.two` | `TOUCH_DOLLY_TRUCK` (pinch dollies, the two-finger drag pans) | `ACTION.TOUCH_DOLLY` for pinch-only zoom, as Likova does [site:likova] |
| `touches.three` | `TOUCH_DOLLY_TRUCK` | `ACTION.NONE` |

On macOS a trackpad pinch arrives as a `ctrlKey` wheel event, and the library always treats it as `ZOOM` [verified: source, wheel handler].

## Integration with the others
```js
// Clamped orbit on the shared ticker (seconds): the camera-controls version of gl-orbit-model-hotspots.
import { ticker } from '../_shared/raf.js';
const A = CameraControls.ACTION;
Object.assign(controls, {
  minPolarAngle: 0.85, maxPolarAngle: 1.3, minDistance: 7, maxDistance: 15,
  smoothTime: 0.5, draggingSmoothTime: 0.25,   // ≈ K_FLY 0.02 and K_DRAG 0.0004 in the recipe [inferred: arithmetic]
});
controls.mouseButtons.right = A.NONE;
controls.touches.two = A.TOUCH_DOLLY;
controls.touches.three = A.NONE;
controls.saveState();

const off = ticker.add((dt) => { if (controls.update(dt)) render(); });   // dt is already seconds

// Zone fly-to. The pose must already be inside the band: setLookAt does not clamp (see pitfalls).
const flyTo = (z, animate) => controls.normalizeRotations().setLookAt(...z.position, ...z.target, animate);
```
- GSAP ticker: `gsap.ticker.add((time, deltaMs) => controls.update(deltaMs / 1000))`. `update` wants seconds, and the GSAP callback's second argument is milliseconds [verified: tarball for `update`; GSAP signature recalled].
- Lenis: the library calls `preventDefault()` on `wheel` over its element, and listens with `passive: false` [verified: source]. Put `data-lenis-prevent` on the stage too, as the recipe does, and `lenis.stop()` while a modal orbit is open [recipe:gl-orbit-model-hotspots].
- DOM hotspots: project each zone's target in the same frame `update` returned `true`, as the recipe does. A `<button>` per zone calls `flyTo`.
- Capture: expose the state from `controls.azimuthAngle`, `.polarAngle` and `.distance`, or from `getTarget(out)` and `getPosition(out)`, on `window.__awards.state` so `verify.mjs` and the jury can read it.

## Reduced motion and accessibility hooks
- The library knows nothing about `prefers-reduced-motion` and has no keyboard handler: the 3.1.2 source contains no `matchMedia` and no `keydown` [verified: source]. Both paths are yours.
- Reduced tier: pass `enableTransition = motionTier() === 'full'` to every fly-to and reset. For the drag glide too, set `smoothTime` and `draggingSmoothTime` near zero; SmoothDamp floors them at `0.0001` [verified: source]. No settle-in on open.
- Keyboard: a focusable stage, where the arrows call `rotate(±0.2, 0, true)` / `rotate(0, ±0.1, true)`, `+`/`−` call `dolly(±step, true)` and Home calls `reset(true)`. `rotateTo` clamps to the polar and azimuth band [verified: source]. A list of zone buttons does the rest.
- Static tier or no WebGL: do not construct the controls at all. Show the poster and the same zone list [recipe:gl-orbit-model-hotspots].
- `connect()` sets `touch-action: none` and `user-select: none` on the element [verified: source]. A full-width canvas in the page flow therefore traps vertical swipes on a phone. Keep the orbit in a modal or a bounded stage, as Likova does [site:likova], or call `disconnect()` on coarse pointers and use tap-to-fly buttons.

## Performance rules
- Render on demand: `if (controls.update(dt)) render()` [verified: Context7, readme usage]. Unsubscribe from the ticker while the dialog is closed.
- `colliderMeshes` raycasts from 4 near-plane corners every update. Avoid it unless collision is the idea [verified: tarball, readme footnote].
- One instance per canvas. `dispose()` on `pagehide` or route leave; it removes the listeners.

## Pitfalls
- **`setLookAt` does not clamp.** `rotateTo` clamps polar and azimuth and `dollyTo` clamps distance. `setLookAt`, `setPosition` and `lerpLookAt` write the end sphere straight from the vector, and `update` never clamps it back [verified: source]. `setTarget` re-clamps polar only [verified: source, issue #335 comment]. A fly-to pose outside the band leaves the band and stays there until the next drag. Compute zone poses inside the band, or fly with `moveTo(target) + rotateTo(az, polar) + dollyTo(d)`, which all clamp.
- **The azimuth accumulates.** Every full turn adds 2π to `azimuthAngle` [verified: tarball, readme]. In v3, `setLookAt`, `lerpLookAt`, `setTarget`, `setPosition` and `reset` no longer normalise it, so a fly-to after three spins unwinds all three. Chain `normalizeRotations()` first; it wraps to −180…180° [verified: tarball, readme v3 migration].
- **Which way the polar angle counts.** The source builds the sphere from `camera.position − target` in Y-up space [verified: source], so `0` is the camera straight overhead and `π/2` is level, the three.js `Spherical` convention [recalled]. The README's "180º top/sky, 0º bottom/floor" diagram reads the other way. Trust the source, and test the band on screen.
- **Seconds, not milliseconds**, for `update(delta)`. With milliseconds every transition lands in one frame.
- **Two-finger pan by default.** `TOUCH_DOLLY_TRUCK` lets a pinch also pan the target off the model. Set `touches.two = TOUCH_DOLLY`, or `setBoundary(box3)`.
- **`rest` against `sleep`, and the threshold.** Enable UI on `rest`. The README states the `restThreshold` default as 0.0025, but the source sets 0.01.
- **`install` runs once per module graph.** Two copies of three in the bundle (an R3F app plus a stray `three` import) give an instance built on the wrong `Vector3` [inferred].
- **Wheel over the stage never scrolls the page**, because the listener always calls `preventDefault` [verified: source]. That is right inside a dialog and wrong in the page flow.

## When the hand-written damping is enough
[recipe:gl-orbit-model-hotspots] already covers a clamped orbit without the library. It keeps a goal/current pair on spherical coordinates, clamps the goal as it is written, eases with `1 − k^dt`, has two smoothing constants, drag, wheel, keys and fly-tos, and weighs nothing. Map it one-to-one: `POLAR` → `min/maxPolarAngle`, `RADIUS` → `min/maxDistance`, `K_DRAG` / `K_FLY` → `draggingSmoothTime` / `smoothTime`, `setGoal(…, K_FLY)` → `setLookAt(…, true)`.

Keep the hand-written version when the orbit is a rotate-plus-dolly around fixed or flown-to targets, touch zoom can be buttons, and nothing else in the project ships camera-controls. Reach for the library when any of these is part of the idea:
- a real two-finger pinch with dolly on phones (the recipe does not wire one);
- panning with a `setBoundary` box;
- `fitToBox` / `fitToSphere` framing of loaded models whose size varies;
- `dollyToCursor`, an orthographic camera or camera collision;
- promise-chained camera choreography (`await rotateTo(…); await dollyTo(…)`);
- the project already ships it.

Adding 12 KB gzip for a band and two smoothing times is the dependency the recipe tells you not to add.

## Where the corpus used it
[site:likova] is the only card with the library in evidence: camera-controls in the lazy three.js chunk, driving the orbitable site model in the master-plan modal. Measured parameters: smoothing .2 and .6, polar clamped to about 1.1–1.5 rad, distance 40–53.5, two-finger touch zoom and `setLookAt` zone fly-tos. [site:lando-norris] ships three's OrbitControls behind `?debug` only, not camera-controls. The clamped-orbit row in [pattern:webgl-architecture] cites Likova.
