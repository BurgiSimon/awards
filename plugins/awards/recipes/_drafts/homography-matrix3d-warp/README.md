# homography-matrix3d-warp

A live HTML screen carried by the scroll from flat into a drawn laptop. The four corners of the drawn screen are read off the SVG through its own scale and crop, each corner of the app is lerped toward its target, and the projective transform that sends the rectangle to those four points is solved and written as one `matrix3d`. The app inside is never copied or rasterised: its name selects with a double-click, its button takes focus and pauses the loop, through the same matrix.

## Why
- **Put the product inside the picture.** The source's project tiles are photographs of devices on furniture, each with a looping screen recording warped into the device's screen, so still art direction moves without a 3D engine `[site:zainabkabira]` [verified, index.html + desktop-s50.png].
- **Four measured corners are the whole model.** On the source, four screen-corner fractions measured off each photograph produce a 3 × 3 homography written as `matrix3d` on the `<video>`, and the photograph's cover-crop is mirrored so the recording stays on its screen at every width `[site:zainabkabira]` [verified, index.html `.cs-hero-mock` script]. Here the target is a polygon in the drawing, read through `getScreenCTM()`, which already contains the `slice` crop and the scale, and re-read by a ResizeObserver.
- **Live DOM instead of a recording.** The source warps a `<video>`. Warping the app itself keeps its text real and its controls working, and costs no file at all; the browser maps hit testing, selection and focus back through the matrix. The plugin's own choice, and the reason the screen holds only one control.
- **Interpolate the corners, never the matrix.** Every frame of the scrub is solved from four corners on straight lines between flat and placed, so every in-between shape is a true projection of the rectangle. Lerping the sixteen numbers of two matrices gives shapes no camera could see and can flip the perspective divide's sign half-way. The scrub itself is the plugin's own addition: the source places its screens and lets the scene breathe (`scale 1 → 1.05` over `18 s`) instead.
- **Read once, then write.** One scroll listener queues one frame; the frame reads the stage's rect and writes the transform, as the source's single scroll scheduler does `[site:zainabkabira]` [verified, index.html scroll scheduler].

## Parameters
| | |
|---|---|
| Screen | real DOM in a box `min(640px, 86 % of the scene's width, 62 % of its height × 1.6)` wide at 16:10, positioned in whole pixels: centred at `60 %` of a scene `≥ 900 px` wide, centred otherwise; inside, `font-size: 2.6cqw` so the app scales with the box |
| Target | the four points of `[data-screen-quad]` (TL, TR, BR, BL) through `svg.getScreenCTM()`, minus the scene's and the screen's offsets; re-read on every ResizeObserver change of the scene |
| Stage | `280svh` with a `100svh` sticky frame; progress `−top / (height − innerHeight)`, clamped |
| Warp window | flat until `.12`, placed from `.78`; `smoothstep` between |
| Corners | `flat + (target − flat) × e` for each corner, then the homography from `(0,0) (W,0) (W,H) (0,H)` to them |
| Solve | eight equations `u = (ax + by + c) / (gx + hy + 1)`, `v = (dx + ey + f) / (gx + hy + 1)`, Gaussian elimination with partial pivoting; three collinear corners return `null` |
| Matrix | `matrix3d(a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1)`, `transform-origin: 0 0`; `none` at `e = 0` |
| Lift | `--lift = 1 − e`: the box shadow and a `12 px` corner radius fade out as the screen lands |
| Glass | a second SVG with the same `viewBox` and `slice` over the scene, the same quad filled with a glare gradient, `opacity = e`, `pointer-events: none` |
| Loop | a `16`-step playhead over `4 s` (`steps(16, end)`), lit cells flashing on the same clock (`--c × .25 s`), a pointer wandering over `9 s`; paused while the stage is off screen or the tab is hidden |

## Tiers
- **Full:** the scrub as above; the loop plays while the stage is on screen.
- **Reduced:** no rail and no scrub: the stage is one screen tall and the app sits in the laptop from the first frame; the loop starts paused and plays only if the visitor presses Play.
- **Static:** the same as reduced; the page also follows a `data-motion="static"` set on `<html>` after load.
- **Forced colours:** the glare is dropped and the screen keeps a border.

## Accessibility
The screen is a `role="group"` named "Loomtone, a demo sequencer on the laptop"; its text is ordinary text and its button an ordinary button whose label says what it will do (Pause the loop, Play the loop), which is also the pause control the moving loop needs. The step grid, the playhead and the pointer are `aria-hidden` decoration, as is the drawing. The focus ring is drawn on the button and warps with it, so it stays visible on the laptop. The button is a 44 px target in the flat state on desktop and shrinks with the screen once placed; on a real page, keep any control the visitor must use outside the device as well.

## Adapters

### React / Next
Keep the screen as a component and do the work in a layout effect: measure on mount and from a ResizeObserver, subscribe to scroll with one queued frame, and write `style.transform` through a ref, never through state. The solver is a pure function; import it from a small module. The SVG must render on the server with the same `viewBox` and `preserveAspectRatio`, so the first client measure matches what was painted.

### Svelte
An action on the screen element (`use:warp={{ quad, stage }}`) owning the observers and the scroll listener, returning `destroy` to remove them; the scene stays plain markup.

### Webflow
- Designer: an Embed with the scene SVG (keep `data-screen-quad` on the polygon), a Div for the screen holding the app or a `<video>`, and a tall section with a sticky inner frame.
- Inject from Footer code: the module needs the four `data-*` hooks only. For a photograph instead of a drawing, give the four corners as fractions of the image and map them through the image's own object-fit cover-crop before solving.

Seen in: `[site:zainabkabira]`.
