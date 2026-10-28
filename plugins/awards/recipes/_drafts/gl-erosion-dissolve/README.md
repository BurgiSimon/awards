# gl-erosion-dissolve

An object that leaves the story as the visitor scrolls. One stock `MeshStandardMaterial` is patched through `onBeforeCompile`. A 3D value-noise field that sticks to the mesh is leaned along a world-space axis and compared with one `uProgress` uniform. Fragments below the threshold are discarded, a hashed feather grains the edge, and a thin emissive band burns where the surface is about to go. The scroll drives `uProgress`, so scrolling back re-forms the mesh grain for grain. The resin cone (a lathe), its dish, the incense house and all copy are a synthetic demo; nothing is downloaded.

## Why
- **Dissolve the hero to change the subject.** The source erodes its mascot along its height to clear the stage for type, a narrative shader tied to one beat, with "a value-noise edge" and "a hashed stochastic feather" `[site:primesec]` [verified, main.js shader comment and code]. A second site keeps a family of dissolves with a burn edge for objects leaving its story `[site:edolus]` [verified, uniform names]. Here the cone burns away while the copy moves from the product to what it leaves behind (`[pattern:webgl-architecture#unifier-versus-narrative-shaders]`).
- **Patch, don't replace.** The stock material keeps three's lighting, environment, tone mapping and colour management; the patch inserts three chunks and throws if an include is missing, so a three upgrade fails loudly (`[pattern:webgl-3d-scenes#materials]`, `[recipe:gl-material-patch-reveal]`).
- **Noise on the object, bias in the world.** The noise reads object-space positions, so the grain turns with the cone and never swims; the 0–1 height is measured along a world axis (`uAxis`, here straight down), so the erosion always starts from the same side of the screen. Separating the two is the plugin's own choice; the source erodes along the model's height `[site:primesec]` [verified].
- **Whole at 0, gone at 1, by construction.** The front runs from below the lowest possible field value to above the highest, `mix(−(amp + feather + edge) − .01, 1 + amp + .01, uProgress)`, so the ends need no special case.
- **The band never vanishes on a phone.** Its width is `max(uEdge, 1.5 × max(fwidth(d), 1e-5))` field units: the authored width, or a pixel and a half where the cone is small, and never a division by zero on a flat field.
- **Render on change.** One frame per progress change on GSAP's ticker, none while idle, off screen or in a hidden tab. The source skips drawing 1.5 s after the last input `[site:primesec]` [verified]; this draws nothing at all until something changes (`[pattern:webgl-architecture#scene-windows-and-disposal]`).
- **A still for every tier.** The source has no fallback and its stage runs unchanged under reduced motion `[site:primesec]` [verified]. Here reduced motion cuts each chapter to its own still, and without WebGL2 an SVG still burns along a wavy clip to the same level (`[pattern:webgl-architecture#content-fallback-tiers]`).

## Parameters
| | |
|---|---|
| Stage | `380svh` section, sticky `100svh` inner; one ScrollTrigger `top top` → `bottom bottom`, progress read directly (ease none: Lenis is the smoothing) |
| Erosion window | `uProgress = clamp((p − .12) / .76, 0, 1)`: whole for the first 12 %, gone for the last 12 % |
| Chapters | three, boundaries at `p .3` and `.7`; buttons land at `.06`, `.5`, `.94` (a `1.2 s` Lenis glide, instant without Lenis) |
| Field | 3-octave value noise (weights `.5 / .3 / .2`, scales `×1, ×2.03, ×4.01`) at frequency `2.6` per unit, amplitude `±.14` of the height |
| Axis | `uAxis (0, −1, 0)`, `uMin −2.68`, `uMax −.08`: the cone's tip is 0, its foot 1 |
| Edge | hashed feather `.025` (hash of object position × 72), ember band `uEdge .03`, charring over `4 × uEdge`; ember `(1, .14, .015)` to hot `(1, .42, .08)`, intensity `1.5` outside, `2.0` on the hollow inside |
| Surface | colour `#8a5a3c`, roughness `.95`, `DoubleSide`; grain `×(.82 + .36 n)(.86 + .28 g)` with a second noise at `22` per unit; the inside at `.3` |
| Turn | `p × .8` rad about the vertical (full tier) |
| Light | three's `RoomEnvironment` through `PMREMGenerator.fromScene` at intensity `.35`, warm key `2.6`, cool rim `1.5`, hemisphere `.35`; an orange point light at the burning front, `2.5 × sin(π · uProgress)`; ACES tone mapping |
| Budget | lathe segments `128 / 96 / 72` by quality tier; DPR and pixel budget from `applyRendererBudget`; camera fits `4.1 × 3.05` units at fov `30°`, pitch `10°` |

## Tiers
- **Full:** the cone turns and erodes with the scroll; Lenis smooths the wheel; scrolling back re-forms it.
- **Reduced:** no Lenis, no turn and no scrub. Each chapter cuts to its still (`uProgress 0`, `.5`, `1`), so scrolling inside a chapter changes nothing and the next chapter arrives as a cut; the chapter text still swaps.
- **Static:** no stage: the section is ordinary flow, the SVG still shows the whole cone and all three chapters read in order. `?nogl`, a missing WebGL2 context or a renderer that fails to start keep the stage and burn the SVG still instead.

## Accessibility
The canvas is `aria-hidden`; the SVG still is `role="img"` with a title, and every chapter is DOM text that stays in the accessibility tree in order (the inactive ones are only transparent). The chapter buttons are real buttons with `aria-current="step"` on the one in view, 44 px tall, and take the visitor to their chapter by keyboard as well as by pointer. Lenis smooths the wheel only; keyboard scrolling is native.

## Adapters

### React / Next
Keep the uniforms in a ref and set `onBeforeCompile` once on a memoised `<meshStandardMaterial>`. In R3F use `frameloop="demand"` and call `invalidate()` from the ScrollTrigger's `onUpdate`; never put the progress in state. Load three in a client component behind `dynamic(…, { ssr: false })` with the SVG still as its fallback.

### Svelte
Create the renderer in `onMount` and dispose of it in the returned cleanup. The chapter index can be a store for the copy; the uniform is written directly from the trigger and never goes through the store.

### Webflow
Build the stage (a tall section, a sticky inner, a figure with the still as an `<img>`) in the Designer. Inject the module from the page's footer code and point it at the figure; keep the chapter text as Webflow text, toggled by an attribute the module writes.

Seen in: [site:primesec], [site:edolus].
