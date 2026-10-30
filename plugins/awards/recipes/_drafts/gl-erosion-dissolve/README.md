# gl-erosion-dissolve

An object that leaves the story as the visitor scrolls: one stock `MeshStandardMaterial`, patched through `onBeforeCompile`, discards every fragment under a scrolled threshold on a noise field that sticks to the mesh, leaves a pixel-fine ash crust and a thin ember band at the edge, and shades the back faces it exposes as a solid, smouldering cut. One `uProgress` uniform follows the scroll, so scrolling back re-forms the mesh grain for grain. The resin cone (a lathe), its dish, the incense house and all copy are a synthetic demo drawn in code; nothing is downloaded.

## Why
- **Dissolve the hero to change the subject.** The source erodes its mascot along its height to clear the stage for type, a narrative shader tied to one beat, with "a value-noise edge" and "a hashed stochastic feather" `[site:primesec]` [verified, main.js shader comment and code]. A second site keeps three dissolve programs, one of them (`rackDissolve`) a value-noise burn edge `[site:edolus]` [verified, uniform names]. Here the cone burns away while the copy moves from the product to what it leaves behind (`[pattern:webgl-architecture#unifier-versus-narrative-shaders]`).
- **Patch, don't replace.** The stock material keeps three's lighting, environment, tone mapping and colour management. The patch rewrites seven sites (the declarations and one include in the vertex shader, the declarations and four includes in the fragment shader), and each throws if its chunk is missing, so a three upgrade fails loudly (`[pattern:webgl-3d-scenes#materials]`, `[recipe:gl-material-patch-reveal]`).
- **Noise on the object, bias in the world.** The noise reads object-space positions, so the grain turns with the cone and never swims; the 0–1 height is measured along a world axis (`uAxis`, here straight down), so the erosion always starts from the same side of the screen. Separating the two is the plugin's own choice; the source erodes along the model's height `[site:primesec]` [verified].
- **Untouched at 0, gone at 1, by construction.** The front runs from below the lowest field value less the feather and the char, `mix(−(amp + feather + 4·edge) − .01, 1 + amp + .01, uProgress)`, so at 0 nothing is discarded or darkened and at 1 nothing is left, with no special case.
- **A solid cut, not a hollow shell.** A lathe is a shell, and once the tip goes its inside shows. Back faces are shaded as the cut itself: the normal turned to the camera, a dark ash albedo, ember light in patches and the same band at its rim, so the opening reads as a burning face rather than a crater. The plugin's own choice.
- **No thin band on a phone, no blocky grain on a desktop.** Core, band and char widths are each the authored width or a pixel or so (`max(fwidth(d), 1e-5)`), whichever is wider. The feather hashes cells of 1/72 unit or one pixel, whichever is smaller (`fwidth` of the object position), so a speck is never a visible square. Every derivative is taken before the first `discard`.
- **Render on change.** One frame per progress change on GSAP's ticker, none while idle, off screen or in a hidden tab. The source skips drawing 1.5 s after the last input `[site:primesec]` [verified]; this draws nothing at all until something changes (`[pattern:webgl-architecture#scene-windows-and-disposal]`).
- **A still for every tier.** The source has no fallback, and its scrubbed stage and the dissolve still run under reduced motion `[site:primesec]` [verified]. Here reduced motion cuts each chapter to its own still, and the SVG still is this camera's projection of the same lathe and dish, in the same frame, burnt along a wavy clip to the row the front reaches (`[pattern:webgl-architecture#content-fallback-tiers]`).
- **Tier changes queue, the context is guarded.** WebGL2 is tested once and the test context released (a test per tier change used to evict the live context after about sixteen). Tier changes chain on one promise and are listened for before the first await, so a change during start-up lands after it. A lost context hands the figure to the still, and a restored one is rebuilt. The plugin's own choice.

## Parameters
| | |
|---|---|
| Stage | `380svh` section, sticky `100svh` inner; one ScrollTrigger `top top` → `bottom bottom`, progress read directly (ease none: Lenis is the smoothing) |
| Erosion window | `uProgress = clamp((p − .12) / .76, 0, 1)`: whole for the first 12 %, gone for the last 12 % |
| Chapters | three, boundaries at `p .3` and `.7`; buttons land at `.06`, `.5`, `.94` (a `1.2 s` Lenis glide, instant without Lenis) |
| Field | 3-octave value noise (weights `.5 / .3 / .2`, scales `×1, ×2.03, ×4.01`) at frequency `2.6` per unit, amplitude `±.14` of the height |
| Axis and front | `uAxis (0, −1, 0)`, `uMin −2.68`, `uMax −.08` (the tip is 0, the foot 1); `uFront (−.295, 1.15)`, mixed by `uProgress` |
| Edge | ash crust in the feather `.025` (hashed cells of `1/72` unit or one pixel, albedo `uAsh (.2, .19, .18) × (.6 + .8 g)`, ember glints `× .6` of the hash); hot core over `.3 × uEdge`, `uHot (1, .25, .03) × 1.2`; ember band over `uEdge .03`, `uEmber (1, .06, .004) × 1.2`; charring to `× .12` over `4 × uEdge` |
| Cut | back faces: normal `(0, 0, 1)` in view space, albedo `uAsh × (.1 + .15 g)`, ember `× .75` where a noise at `9` per unit passes `.3 → .8`, plus the band at the rim |
| Surface | colour `#8a5a3c`, roughness `.95`, `DoubleSide`; grain `×(.82 + .36 n)(.86 + .28 g)` with a second noise at `22` per unit; a mould seam `× .7` over `.022` units of arc at `2.02` rad |
| Turn | `p × .8` rad about the vertical (full tier): the seam drifts from left of centre to right of it |
| Light | three's `RoomEnvironment` through `PMREMGenerator.fromScene` at `.35`, warm key `2.6`, cool rim `1.5`, hemisphere `.35`; an orange point (`#ff5a1a`, decay `1.5`) on the axis `.15` under the front and never below `.75`, `6 × sin(π · uProgress)`; ACES tone mapping |
| Dish | glaze `#3a4840`, roughness `.42`; a soft shadow plane `4.8` units across |
| Frame | fov `30°`, pitch `10°`, target `y 1.12`; `4.1 × 3.05` units on a wide figure, narrowing to `3` units across at aspect `.7` and below (the dish rim crops, the cone grows); the still's `viewBox` is the same frame at `200` SVG units per unit |
| Budget | lathe segments `128 / 96 / 72` by quality tier; DPR and pixel budget from `applyRendererBudget` |

## Tiers
- **Full:** the cone turns and erodes with the scroll; Lenis smooths the wheel; scrolling back re-forms it.
- **Reduced:** no Lenis, no turn and no scrub. Each chapter cuts to its still (`uProgress 0`, `.5`, `1`), so scrolling inside a chapter changes nothing and the next chapter arrives as a cut; the chapter text still swaps.
- **Static:** no stage: the section is ordinary flow, the SVG still shows the whole cone and all three chapters read in order. `?nogl`, a missing WebGL2 context, a renderer that fails to start or a lost context keep the stage and burn the SVG still to the same row instead; a restored context is rebuilt.

## Accessibility
The canvas is `aria-hidden`. The SVG still stays under it in every mode (transparent, never hidden), so the figure always has one image, and its name follows what is drawn: whole, burning down from the tip, or the empty dish. Every chapter is DOM text that stays in the accessibility tree in order (the inactive ones are only transparent). The chapter buttons are real buttons, 44 px tall, with `aria-current="step"` on the one in view; activating one says where it went ("Chapter 3 of 3: What stays is the room.") through a polite status, while a plain scroll stays silent. The skip link shows in the corner on focus. Lenis smooths the wheel only; keyboard scrolling is native. A phone held sideways keeps two columns, and the caption steps aside when the figure is under 420 px tall, so no text sits on the effect.

## Adapters

### React / Next
Keep the uniforms in a ref and set `onBeforeCompile` once on a memoised `<meshStandardMaterial side={DoubleSide}>`. In R3F use `frameloop="demand"` and call `invalidate()` from the ScrollTrigger's `onUpdate`; never put the progress in state. Load three in a client component behind `dynamic(…, { ssr: false })`, with the inline SVG still as its fallback and the same frame function setting the still's `viewBox` and the camera.

### Svelte
Create the renderer in `onMount` and dispose of it in the returned cleanup, together with the context-loss listeners. The chapter index can be a store for the copy; the uniform is written directly from the trigger and never goes through the store.

### Webflow
Build the stage (a tall section, a sticky inner, a figure) in the Designer and put the still in the figure as an Embed holding the inline SVG, not an `<img>`: the module moves the clip and the ember line inside it. Inject the module from the page's footer code and point it at the figure; keep the chapter text as Webflow text, toggled by an attribute the module writes.

Seen in: [site:primesec], [site:edolus].
