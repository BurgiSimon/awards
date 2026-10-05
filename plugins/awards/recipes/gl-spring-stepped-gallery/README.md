# gl-spring-stepped-gallery

A WebGL row of items driven by one float index. A spring pulls the index to a whole item; every plate's depth, scale, lift, yaw and opacity are read from its distance to that index, so nothing else is animated. Wheel, drag, keys and buttons only change the spring's target (drag writes the index directly, then coasts and hands over). A wheel step detector turns any wheel gesture, a mouse notch or a long trackpad flick, into exactly one step.

Demo content is synthetic: eight invented glaze test plates. Each face is drawn on a 2D canvas (a ground in the item's colour, a shaded disc, the number) and uploaded as a `CanvasTexture`. No models, textures, fonts or media.

## Why
- **One number drives the scene.** A spring on a float index (frequency `9.5`, damping `12`) with transforms derived from `i − index` `[site:a24-raviklaassens]` (`[pattern:webgl-3d-scenes]`). The scene cannot drift out of sync with the state, and a resize or a context restore only has to render once.
- **Exact substeps.** The spring integrates `a = ω²(target − pos) − c·v` in fixed `1/240 s` substeps of the shared ticker's `dt`, so it feels the same at 60 and 144 Hz and never explodes after a stall. `ζ = c / 2ω ≈ .63`: one small overshoot, then rest in about `.7 s`. The loop leaves the ticker at rest.
- **A wheel gesture is one step.** Deltas under the noise floor (`.3 px`) are dropped; each is capped (`24 px`), so a `100 px` mouse notch counts the same as a flick; the sum fires once at the threshold (`6 px`) and disarms. A quiet gap (`130 ms`) ends the gesture and re-arms. A held gesture repeats every `480 ms`, but only while its delta sits at its own envelope (a peak follower decaying over `550 ms`). A trackpad's inertia tail decays faster than that envelope, so it never steps twice.
- **Never trap the page.** At the first or last item a wheel pointing outward is not prevented, so the page scrolls on. Both reference sites capture the wheel on the whole route; this keeps the gesture local to the stage.
- **Drag with friction.** After a `6 px` threshold the pointer is captured and moves the index by the projected plate spacing (`× .95`), so a plate stays under the finger. Velocity is smoothed (`.32`) and capped. On release the index coasts with friction `.89` per 60 Hz frame and hands over to the spring below `2` items/s; the velocity drive echoes `[site:agrumeafarm]`.

## Parameters
Spring frequency `9.5`, damping `12`, substep `1/240 s` · drag threshold `6 px`, sensitivity `.95`, smoothing `.32`, cap `30` items/s, friction `.89`, handoff `2` items/s, end overshoot `.3` · wheel floor `.3`, cap `24`, threshold `6`, quiet `130 ms`, sustain `480 ms`, envelope `550 ms` · plates `1.5 × 1.9`, gap `2.1`, depth `1` per step, inactive scale `.8`, yaw `.22` per step · camera fov `35°`, z `7` (pulled back on portrait stages) · DPR from `detectQualityTier`.

## Motion tiers
- **full**: spring, coast and the derived depth / scale / yaw.
- **reduced** and **static**: every target change sets the index directly and renders one frame; drag still follows the finger (the user moves it) and snaps to the nearest item on release.
Without WebGL the stage shows the active item's colour as a flat card; the caption, buttons, keys and announcer work the same.

## Accessibility
The section is `aria-roledescription="carousel"`, the canvas `aria-hidden`. A focusable stage takes ArrowLeft / Right (and Up / Down), Home and End. The items are an ordered list of `aria-roledescription="slide"` entries for assistive technology. A visible caption shows `n / N`, the title and meta, beside Previous / Next buttons of 44 px. A polite, atomic live region announces "Plate n of N: title" on each change, not on load.

## Adapters
- **React / R3F:** keep the index, velocity and target in a ref and integrate in `useFrame`; derive each mesh's transform in the same callback. Put the wheel listener on the stage element with `{ passive: false }` in a `useEffect` and keep the DOM caption in React state, updated only when the target changes.
- **Vue / Svelte:** the same split: a module-level spring object, one `ticker.add` while moving, the caption bound to the target.
- **More items:** derive only the plates with `|i − index| < 4` and hide the rest; the derivation is per item, so the cost is linear in the visible ones.

## Verify
`top` checks a lit centre pixel, a transparent corner, index 0 and the carousel role. `key` presses ArrowRight twice and checks the settled index is `2 ± .01` and the announcer names plate 3. `wheel` rests the mouse on the stage and sends one burst of 20 small, decaying deltas (78 px in all): exactly one step. `edge` jumps to the end and wheels on: the wheel reaches the page, which scrolls. `rm` presses once under reduced motion and checks the index is whole one frame later. `mobile` taps Next on a phone and checks the step, a drawn canvas, no sideways overflow and that the controls fit the first screen. With the detector's disarm removed, `wheel` fails (the burst moves seven plates).

Seen in: `[site:a24-raviklaassens]`, `[site:agrumeafarm]`.
