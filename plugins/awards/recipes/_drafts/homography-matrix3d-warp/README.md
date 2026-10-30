# homography-matrix3d-warp

A live HTML screen carried by the scroll from flat into a drawn laptop. The four corners of the drawn screen are read off the SVG through its own scale and crop, each corner of the app is lerped toward its target, and the projective transform that sends the rectangle to those four points is solved and written as one `matrix3d`. The app inside is never copied or rasterised: its name selects with a double-click, its button takes focus and pauses the loop, through the same matrix.

## Why
- **Put the product inside the picture.** The source's project tiles are rounded photo cards of devices on furniture, each carrying a looping screen recording warped into the device's screen, so still art direction moves without a 3D engine `[site:zainabkabira]` [verified, index.html + retry/desktop-s50.png].
- **Four measured corners are the whole model.** On the source, four screen-corner fractions measured off each photograph produce a 3 × 3 homography written as `matrix3d` on the `<video>`, and the photograph's cover-crop is mirrored so the recording stays on its screen at every width `[site:zainabkabira]` [verified, index.html `.cs-hero-mock` script]. Here the target is a polygon in the drawing, read through `getScreenCTM()`, which already contains the crop and the scale, and re-read by a ResizeObserver.
- **Live DOM instead of a recording.** The source warps a `<video>` `[site:zainabkabira]` [verified, index.html `.cs-hero-mock` script]. Warping the app itself keeps its text real and its controls working, and costs no file at all; the browser maps hit testing, selection and focus back through the matrix. That is the plugin's own choice, and the reason the screen holds only one control and the page repeats it outside the picture.
- **Interpolate the corners, never the matrix.** Every frame of the scrub is solved from four corners on straight lines between flat and placed, so every in-between shape is a true projection of the rectangle. Lerping the sixteen numbers of two matrices gives shapes no camera could see and can flip the perspective divide's sign half-way. Scrubbing the corners is the plugin's addition: on the source the warp stays fixed while the scroll scales the tile that holds it from half to full size, smoothstep-eased `[site:zainabkabira]` [verified, index.html], and the scene breathes `scale 1 → 1.05` over `18 s` [verified, index.html `.cs-hero-mock` script].
- **A target in real perspective.** The laptop is projected from a 3D model, not drawn by eye, so the screen's far edge is `0.68` of its near one and the base recedes with the lid. A nearly frontal target lands as a scale with a slight keystone, which a 2D transform could almost fake; this one only a projective solve can reach. The plugin's own choice.
- **Read once, then write.** One scroll listener queues one frame; the frame reads the stage's rect and writes the transform and two opacities, as the source's single scroll scheduler does `[site:zainabkabira]` [verified, index.html scroll scheduler].

## Parameters
| | |
|---|---|
| Screen | real DOM in a box `min(640px, 86 % of the scene's width, 62 % of its height × 1.6)` wide at 16:10, centred in the scene in whole pixels; inside, `font-size: 2.6cqw`, and `3.5cqw` with tighter rows when the box is at most `480px` (a 390 px phone's is 335 × 209) |
| Drawing | a 32 × 22 cm laptop turned `42°` on the desk, lid open `104°`, projected into a `1600 × 1000` viewBox; the screen quad's far edge is `0.68` of its near edge; the desk meets the wall at `y 340`, and the wall starts on the page's ground |
| Crop | `--w: min(max(100cqw, 160cqh), 275.7cqw)`: cover, or on a narrow frame the lid (`x 444–978`) across `92 %` of the width; `left: clamp(100cqw − w, 50cqw − .4444 w, 0)`, `top: clamp(100cqh − h, 50cqh − .45 h, 0)`, so no edge ever shows a gap |
| Target | the four points of `[data-screen-quad]` (TL, TR, BR, BL) through `svg.getScreenCTM()`, minus the scene's and the screen's offsets; re-read on every ResizeObserver change of the scene |
| Stage | `280svh` with a `100svh` sticky frame after an intro in the flow: the scene above, the caption row below; `data-rail` is set by the script, `true` in the full tier only; progress `−top / (height − innerHeight)`, clamped |
| Warp window | flat until `.12`, placed from `.78`; `smoothstep` between |
| Corners | `flat + (target − flat) × e` for each corner, then the homography from `(0,0) (W,0) (W,H) (0,H)` to them |
| Solve | eight equations `u = (ax + by + c) / (gx + hy + 1)`, `v = (dx + ey + f) / (gx + hy + 1)`, Gaussian elimination with partial pivoting; three collinear corners return `null` |
| Matrix | `matrix3d(a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1)`, `transform-origin: 0 0`; `none` at `e = 0` |
| Lift and glare | two `aria-hidden` children of the screen, carried by the same matrix: a box shadow at opacity `1 − e` and a diagonal glare at opacity `e`, each `will-change: opacity`; the app's `12px` corner radius drops to `0` once, as `e` leaves `0` |
| Loop | a `16`-step playhead over `4 s` (`steps(16, end)`), lit cells flashing on the same clock (`--c × .25 s`); paused while the screen is out of view (an IntersectionObserver on the warped element itself, since the caption row can still show when the app has gone) or the tab is hidden |
| Controls | the app's own button and the page's, `min-height: 44px`, `aria-controls="loomtone"`; both say what they will do (Pause the loop, Play the loop) and a polite status says "Loop paused" or "Loop playing" after a press |

## Tiers
- **Full:** the scrub as above; the loop plays from load while the screen is in view.
- **Reduced:** the script gives the stage no rail, so it is one screen tall and the app sits in the laptop from the first frame; the loop starts paused and plays only on a press, and both of its movements are stepped (the playhead jumps column to column, the cells flash), so nothing glides.
- **Static:** the same as reduced. The page follows a `data-motion` set on `<html>` after load, `full` included: a forced full tier gets its rail back even when the system asks for less motion.
- **No script:** the stage is one screen tall, the app sits flat over the drawing, the loop is still and both loop buttons stay `hidden`.
- **Forced colours:** the text takes the visitor's palette; the lit steps are drawn in `Highlight`, the playhead outlined in `CanvasText`, the buttons' transparent borders show, and the shadow and glare are dropped.

## Accessibility
The screen is a `role="group"` named "Loomtone, a demo sequencer on the laptop"; its text is ordinary text and its button an ordinary button, warped with the picture. The page repeats that control in the caption row under the scene, outside the warp, at 44 px or more at every width; that is the pause control the moving loop relies on, and it names the app through `aria-controls`. Both buttons change label with the state, and a visually hidden `role="status"` line reports each press, because some screen readers do not announce a focused button's new name. Measured in headless Chromium: the in-screen button is `46 px` tall flat on a 1440 × 900 desktop and about `27 px` on its near side once placed; on a 390 × 844 phone it is `32 px` flat and `26 px` placed, so on a phone the caption's button is the target to use. Tab order from the top: the in-screen button (the stage scrolls into view with it), then the page's; the focus ring is drawn on the in-screen button and warps with it. The step grid, the playhead, the shadow, the glare and the drawing are `aria-hidden` decoration.

## Adapters

### React / Next
Keep the screen as a component and do the work in a layout effect: measure on mount and from a ResizeObserver, subscribe to scroll with one queued frame, and write `style.transform` and the two opacities through refs, never through state. The solver is a pure function; import it from a small module. The SVG must render on the server with the same `viewBox`, so the first client measure matches what was painted; render both loop buttons `hidden` and reveal them in the effect.

### Svelte
An action on the screen element (`use:warp={{ quad, stage }}`) owning the observers and the scroll listener, returning `destroy` to remove them; the playing state is a store that both buttons and the status line read, and the scene stays plain markup.

### Webflow
- Designer: an Embed with the scene SVG (keep `data-screen-quad` on the polygon), a Div for the screen holding the app or a `<video>`, and a tall section with a sticky inner frame and a caption row below the scene.
- Inject from Footer code. Required hooks: `data-stage`, `data-scene`, `data-scene-art`, `data-screen-quad`, `data-screen`. Optional: `data-lift` and `data-glare` inside the screen, `data-app` with its `data-loop-toggle`, and `data-loop-control` and `data-loop-status` outside it; the module skips any that are missing. For a photograph instead of a drawing, give the four corners as fractions of the image and map them through the image's own object-fit cover-crop before solving.

Seen in: `[site:zainabkabira]`.
