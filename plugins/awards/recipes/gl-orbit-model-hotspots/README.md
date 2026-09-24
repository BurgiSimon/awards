# gl-orbit-model-hotspots

An explorable model handed to the visitor inside a native `<dialog>`: drag, arrow keys or the wheel turn a clamped orbit camera, and every named zone is a real `<button>` pinned over the canvas that flies the camera to it. The camera is a goal / current pair on spherical coordinates, damped by hand with `1 − k^dt`. No camera-controls, no OrbitControls.

**Demo content is synthetic.** The site, its zones and every figure are invented, and the model is built at runtime from three primitives (a plane, a box and a cylinder, scaled and placed). No model file ships.

## Why
- **A clamped orbit keeps every view composed.** A narrow polar band and a short distance range mean the visitor can't flip under the ground or zoom into a wall. The corpus's master-plan modal clamps polar to about 1.1–1.5 rad and distance to 40–53.5 `[site:likova]`. The explorable model works best as one beat inside a chapter `[site:gehry-getty]`.
- **Goal and current, not a controls library.** Input only ever writes the *goal* (clamped as it is written). Each frame the camera moves toward it by `1 − k^dt`, where `k` is the fraction of the gap left after one second, so it feels the same at 60 and 144 Hz. Because the goal is clamped and the camera interpolates between clamped values, the camera never leaves the band either.
- **Two smoothing times.** Dragging uses `k = 0.0004` so the view stays under the hand. Fly-tos and keys use `k = 0.02`, a visible glide of about 0.8 s.
- **Hotspots are DOM.** Each zone label is a `<button aria-pressed>` whose transform follows the projected target every frame. It has real focus, real text and a 44 px hit area, and the canvas needs no hit-testing. Zones that project off screen park on the stage edge, so a focused button is always visible. The same buttons are the keyboard path and the static-tier list.
- **The selected zone renders in the accent.** Its material colour changes, which reads in every tier because nothing moves.

## Parameters
Polar band `0.85–1.3 rad` (measured from straight up) · distance `7–15` · `K_DRAG 0.0004`, `K_FLY 0.02` · drag `1.5π` of azimuth across the stage width, `π` of polar across its height · keys `±0.2 rad` azimuth, `±0.1 rad` polar, `×0.9 / ×1.1` zoom · open settle-in from `+4` distance (full tier) · cylinder segments `48 / 24` by quality tier, DPR and pixel budget from `_shared/quality-tiers.js`.

## Accessibility and motion tiers
- The stage is focusable (`tabindex="0"`), described by the hint line: arrows orbit, `+` / `−` zoom, Home resets. Tab moves on to the hotspot buttons, then to Reset view and Close. Escape closes the dialog and focus returns to the opener.
- **Full:** damped fly-tos and a settle-in on open. Lenis runs on the shared ticker, stops while the dialog is open, and `data-lenis-prevent` keeps the dialog's wheel for zoom.
- **Reduced:** WebGL stays and so does drag. Fly-tos, keys and resets land instantly, and there is no settle-in and no Lenis.
- **Static, or no WebGL:** no renderer is created. The dialog shows a poster of the plan with the same hotspot buttons as a plain list, and they still update the detail panel.
- The render loop subscribes to the ticker only while the dialog is open. Geometries, materials and the renderer are disposed on `pagehide`.

## Adapting
- **A real model:** load a Draco / KTX2 glb once on first open, as this demo builds its scene. Read hotspot targets from named empties in the file rather than hard-coding them. Keep the poster as the static tier and the no-GL fallback.
- **camera-controls:** if a project already ships it, `minPolarAngle` / `maxPolarAngle`, `minDistance` / `maxDistance`, `smoothTime` and `setLookAt(…, true)` map one-to-one onto this. Don't add the dependency for this alone.
- **R3F:** keep the goal / current pair in a ref and apply `1 − k ** dt` in `useFrame`. Wrap real buttons in drei `<Html>` for the hotspots.
- **Touch zoom:** two-finger pinch is not wired. The wheel and `+` / `−` cover zoom, and the default radius already frames the site on a phone. Add a pointer-pair distance if the model needs close inspection on touch.

## Verify
`verify.mjs` opens the dialog in every state and reads back real pixels (`readPixels` on a 7 × 11 grid after a fresh render). **Drag:** a drag right and far down turns the azimuth more than 0.8 rad, the polar angle rests on the clamp, and the rendered view changes. **Hotspot:** the tower button flies the camera target to the tower (in flight on the first samples, under 0.05 at the end) and the tower renders in the accent. **Keys:** arrows orbit and Tab + Enter flies to a zone. **Close:** Escape closes, focus returns to the opener and Lenis restarts. **Reduced motion:** the fly-to is already there on the first sample. **Static:** the poster and the list, with no renderer. **Mobile:** tap-to-fly with 44 px targets and no overflow. With the polar clamp or the fly-to disabled, the drag, hotspot, keys, reduced and mobile checks fail.

Seen in: `[site:likova]`, `[site:gehry-getty]`.
