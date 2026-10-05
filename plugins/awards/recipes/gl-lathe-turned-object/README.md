# gl-lathe-turned-object

A turned object built in code instead of downloaded. A profile of 48 points (a waist plus a cosine ripple) is spun by `LatheGeometry`, closed by two `RingGeometry` faces and bored through by a second lathe. Its normal and roughness maps come from one builder function, run in an inline Blob `Worker` with a same-thread fallback. After a short dwell, a fine pointer gets exactly one quantised revolution.

Demo content is synthetic: a generated spool, coloured from the shared `--accent` token. No models, textures, fonts or media; the page ships bytes of JavaScript, not a mesh.

## Why
- **Generate the object.** Simple turned forms cost a few lines and retune with a number. A disc built from lathe profiles with ring faces and a rippled band `[site:a24-raviklaassens]`; a label that is a lathe cylinder over a product photo `[site:agrumeafarm]` (`[pattern:webgl-3d-scenes]`).
- **The ripple fades at the ends.** `r(t) = R·(waist + (1 − waist)·(½ + ½cos 2πt)) + ripple·cos(2π·n·t)·sin(πt)`, so `r(0) = r(1) = R` and the ring faces close the wall exactly with no seam.
- **Maps off the main thread, never only there.** The builder is self-contained, so `buildMaps.toString()` becomes the worker's source and the same function is the fallback. A worker that throws, errors or misses its `1.5 s` deadline falls back to the main thread (`?worker=0` forces it). Maps are built once per page at one size; cache them per size if several objects share them.
- **A quantised turn.** The hover tweens from `n·2π` to `(n + 1)·2π` and sets the end value exactly, so repeated hovers never drift off a whole turn. It listens to mouse pointers under `(pointer: fine)` only, so a tap on a touch screen never starts it.
- **Render on change.** The frame loop joins the shared ticker for the length of a turn and leaves it after; a resize renders once.

## Parameters
Profile `48` points, height `2`, radius `1`, waist `.62`, ripple `.035 × 7` · bore `.28` · lathe segments `160 / 112 / 72` by quality tier · maps `512² / 256²` (24 flutes around, 28 grooves along) · dwell `250 ms`, turn `1000 ms` cubic in-out · camera fov `30°`, z `7.5`.

## Motion tiers
- **full**: drawn on load; a mouse dwell gives one revolution.
- **reduced**: drawn on load; the hover tints the object towards `--ink` and does not turn it.
- **static**: drawn once; no interaction changes it.
Without WebGL the figure keeps an SVG still with alt text.

## Accessibility
The canvas is `aria-hidden`; the figure's still and caption carry the meaning. The turn is decorative and adds no information, so there is no keyboard equivalent.

## Adapters
- **React / R3F:** `<latheGeometry args={[points, segments]} />` with points from `useMemo`; build maps in a `useEffect` and keep the worker code module-level. Drive the turn in `useFrame` from a ref.
- **Disc or label band:** a short profile with wide ring faces gives a disc; a two-point straight profile gives a label band to lay over a photograph.

## Verify
`rest` checks a lit centre pixel and a transparent corner pixel, read after a fresh render in the same task, and that the lathe has `(segments + 1) × points` vertices (three duplicates the seam column for UVs). It also checks that the maps came from the worker. `hover` dwells and checks the turn is `2π` within `1e-3` after `1.5 s`. `fallback` reloads with `?worker=0`, then checks main-thread maps, a render and a turn. `rm` checks a still, tinted object, and `mobile` checks that a coarse pointer leaves the turn at 0. With the dwell timer not starting the turn, `hover` and `fallback` fail.

Seen in: `[site:agrumeafarm]`, `[site:a24-raviklaassens]`.
