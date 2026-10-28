# gl-product-configurator

A product configurator for a shop page: a table lamp built in code on a clamped, damped orbit, turned by drag or by arrow keys on the focused view, with colour, finish and shade as native radio groups. Each choice tweens the lacquer or the shade's morph targets from where they are, sets the price, spec and a polite summary in the same task, and writes the configuration into the URL. Without WebGL2, in the static tier or after a lost context, a CSS-drawn lamp answers the same form; the maker, lamp and prices are a synthetic demo.

## Why
- **A swatch row and priced variants are the corpus form; the 3D configurator around them is the plugin's own.** A furniture maker shows a colour row of dots on its product close-ups, its collection accents used only as swatches `[site:floema]` [verified]. A gallery shop prints its prices in a chosen currency beside a cart count `[site:the-boyd]` [verified]. Neither turns a model or tweens a material; that part is this recipe's proposal.
- **The controls are the form, the canvas is the picture.** Variants are a radio group in a `fieldset` with a `legend`, arrow keys move the selection, and the price is formatted text (`[pattern:i18n-and-commerce#product-card-and-price]`). The canvas only shows the result, so a blocked or lost context loses the picture and nothing else (`[pattern:webgl-architecture#content-fallback-tiers]`).
- **The price is never late.** Price, spec and summary change in the same task as the click, before the tween has drawn a frame; only the picture eases (`[pattern:i18n-and-commerce#motion-out-of-the-purchase-path]`).
- **Interruptible, from the current value.** Every change is `gsap.to(…, { overwrite: true })` on the live material or morph weights, so a second choice mid-tween turns the first around from the exact colour it had reached; the same rule the house clock uses for shader states (`[recipe:gl-uniform-tween-targets]`).
- **The swatch is the colour you get.** Khronos PBR Neutral tone mapping at exposure `.7` on a mid-grey sweep was calibrated until the shade's lit front lands within ΔE2000 2.5 of each swatch, in every finish; a finish changes only the surface (roughness, clear coat), never the light the paint receives (`[pattern:webgl-architecture#colour-parity]`). The numbers are the plugin's own measurement.
- **One geometry, three shades.** The dome, cone and drum are lathe profiles with the same point count; the cone and drum are morph targets of the dome, so a shade change is two weights on one mesh rather than a swap of meshes. The plugin's own choice.
- **The URL is the configuration.** `?colour=…&finish=…&shade=…` is written with `history.replaceState` (no history entry per click) and read back on load; an unknown value falls back to its default and the address bar is corrected. The share link carries the configuration alone and copies itself. The plugin's own choice.
- **A slider, not a mystery canvas.** The focusable view is `role="slider"` for the turn, with `aria-valuenow` in degrees and a spoken value, Home and End at the clamps and a reset button beside it (`[recipe:gl-orbit-model-hotspots]` clamps a full orbit the same way). The polar angle moves by drag only.

## Parameters
| | |
|---|---|
| Orbit | azimuth `−50°…50°` (home `20°`), polar `1.1…1.5` rad (home `1.32`); drag `2.4` rad per stage width, `1.6` per height; damping `x += (goal − x)(1 − .002^dt)`, `dt ≤ .5 s`; snapped and stopped within `1e-4` |
| Keys on the view | ← ↓ `−10°`, → ↑ `+10°` (← and → swap right to left), Page Up / Down `±25°`, Home `−50°`, End `50°` |
| Arrival | full tier only: the first frame is drawn at `−25°` before the canvas fades in (`.3 s`), then the view damps to `20°`, once |
| Tween | `.4 s power2.out`, `overwrite: true`; colour in linear RGB on `material.color`; finish on `roughness`, `clearcoat`, `clearcoatRoughness`; shade on two morph weights |
| Finishes | matte `.82 / .02 / .8`, satin `.48 / .25 / .35`, gloss `.3 / 1 / .06` (roughness / clearcoat / its roughness); clearcoat never 0, so no choice recompiles the program |
| Colours | Chalk `#e6e1d6`, Clay `#b4613f`, Moss `#5f6e47`, Ink `#262a33`, Saffron `#d7a032`; rendered within ΔE2000 `2.5` of each (asserted ≤ `5`) |
| Light | `NeutralToneMapping` at exposure `.7`; `RoomEnvironment` baked once through PMREM at `.62` (re-baked after a restored context); key `1.4`, fill `.5`; a warm bulb `PointLight` `1.1` under the shade; a floor texture with a warm pool and a contact shadow |
| Prices | shade dome `£240`, cone `£225`, drum `£260`; finish `+ £0 / 15 / 30`; `Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })` |
| Scene | lathe shade of `28` points × `128 / 96 / 72` segments by quality tier, a brass crown cap that closes with the dome, a lathe foot, a brass stem, a cord and a switch knob (so the turn reads); `compileAsync` before the first frame |
| Rendering | a GSAP ticker listener exists only while the view damps or a tween runs, then removes itself; a resize redraws in the same task; DPR and pixel budget from `applyRendererBudget` |
| Layout | desktop: the stage sticks under a `64 px` sticky bar at `100svh − 64px`; phones (≤ `860 px`): the stage sticks at the top at `clamp(220px, 42svh, 460px)` above the options; a container query on the options column sets three pills (≤ `460 px`) and five swatches (≤ `380 px`) to a row |

## Tiers
- **Full:** the arrival turn, damped drag and keys, `.4 s` material and shape tweens, the canvas fading in over `.3 s`.
- **Reduced:** no arrival, no damping (the view jumps to the clamped goal), no tweens and no fade: every choice is set at once; the price, summary and URL behave the same.
- **Static** (and `?nogl`, no WebGL2, or a lost context until it is restored): no canvas and no orbit. A CSS lamp (shade by `border-radius` or `clip-path`, colour by `--lamp`, finish by a sheen gradient) takes the same configuration, and every control, the price and the URL keep working. On a full load the CSS lamp never shows first: the sweep stands empty until a mode is known.

## Accessibility
Three `fieldset`s with legends hold native radios, visually hidden but focusable; the label is the 44 px target and shows checked and focus states, arrow keys move within a group as the platform does, and Enter on a radio does not submit the form. The summary is a visually hidden `aria-live="polite"`, `aria-atomic` region that says the whole configuration and price once per change; it turns live only after load, so a configuration restored from the URL is not announced. The add-to-bag and copy answers go to a separate `role="status"`. The view is a labelled slider with a description, present only when the canvas is; during a drag its value is spoken once, on release. In forced colours a checked pill fills with `Highlight` and keyboard focus keeps its own `CanvasText` ring; the main action keeps a border. The skip link shows when focused. The canvas and the CSS lamp are `aria-hidden`; `touch-action: pan-y` leaves vertical swipes to the page on phones, where the stage stays in view above every option.

## Adapters

### React / Next
Keep the configuration in the URL with the router's `replace` (shallow) and derive everything from it; the radios are controlled inputs. The canvas is a client component with `frameloop="demand"`: tween the material in an effect keyed on the configuration and call `invalidate()` from the tween's `onUpdate`. Listen for `webglcontextlost` on the canvas and render the CSS lamp from the same state. Render the price on the server from the same catalogue.

### Vue / Nuxt
`useRoute().query` as the source of truth, `router.replace({ query })` on change; a computed price and summary. Mount three in `onMounted` behind `<ClientOnly>`, with the CSS lamp as the fallback slot, which a lost context also returns to.

### Webflow
Build the options as a native form with radio buttons and the product data as CMS fields (`data-hex`, `data-price` on each label). Inject the module from the page's footer code; it reads the form, writes the URL and owns the canvas inside a div you place in the product section.

Seen in: [site:floema], [site:the-boyd].
