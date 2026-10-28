# gl-product-configurator

A product configurator for a shop page. A table lamp built in code turns on a clamped, damped orbit, by drag or by arrow keys on the focused view. Colour, finish and shade are native radio groups. Each choice tweens the lacquer or the shade's morph targets from where they are now, sets the price, spec line and a polite summary at once, and writes the configuration into the URL, so the same lamp comes back on reload or from a shared link. Without WebGL2, or in the static tier, a CSS-drawn lamp answers the same controls. The maker, the lamp, its prices and every word are a synthetic demo.

## Why
- **The controls are the form, the canvas is the picture.** Variants are a radio group in a `fieldset` with a `legend`, arrow keys move the selection, and the price is formatted text (`[pattern:i18n-and-commerce#product-card-and-price]`). The canvas only shows the result, so a failed context loses the picture and nothing else (`[pattern:webgl-architecture#content-fallback-tiers]`).
- **The price is never late.** Price, spec and summary change in the same task as the click; only the picture eases. A variant change may crossfade after the price is right, never before (`[pattern:i18n-and-commerce#motion-out-of-the-purchase-path]`).
- **Interruptible, from the current value.** Every change is `gsap.to(…, { overwrite: true })` on the live material or morph weights, so a second choice mid-tween turns the first around without a jump; the same rule the house clock uses for shader states (`[recipe:gl-uniform-tween-targets]`).
- **One geometry, three shades.** The dome, cone and drum are lathe profiles with the same point count; the cone and drum are morph targets of the dome, so a shade change is two weights on one mesh rather than a swap of meshes.
- **The URL is the configuration.** `?colour=…&finish=…&shade=…` is written with `history.replaceState` (no history entry per click) and read back on load; unknown values fall back to the defaults. A shareable link is the cheapest saved basket. The plugin's own choice.
- **A slider, not a mystery canvas.** The focusable view is `role="slider"` for the turn, with `aria-valuenow` in degrees and a spoken value, Home and End at the clamps and a reset button beside it (`[recipe:gl-orbit-model-hotspots]` clamps a full orbit the same way). The polar angle moves by drag only.
- **A swatch row is the corpus form.** A furniture maker shows a colour row of dots on its product close-ups, the collection accents used only as swatches `[site:floema]` [verified]. A gallery shop prints its prices in a chosen currency beside a cart `[site:the-boyd]` [verified]. The configurator around them is the plugin's own proposal.
- **Neutral light for true colour.** Khronos PBR Neutral tone mapping and a grey studio sweep keep the lacquer close to its swatch; a coloured page ground would tint every judgement. The plugin's own choice.

## Parameters
| | |
|---|---|
| Orbit | azimuth `−50°…50°` (home `20°`), polar `1.1…1.5` rad (home `1.32`); drag `2.4` rad per stage width, `1.6` per height; damping `x += (goal − x)(1 − .002^dt)`, `dt ≤ .5 s`; snapped and stopped within `1e-4` |
| Keys on the view | ← ↓ `−10°`, → ↑ `+10°`, Page Up / Down `±25°`, Home `−50°`, End `50°` |
| Arrival | full tier only: the first frames turn in from `−25°` to `20°` on the same damping, once |
| Tween | `.4 s power2.out`, `overwrite: true`; colour in linear RGB on `material.color`; finish on `roughness`, `clearcoat`, `clearcoatRoughness`, `envMapIntensity`; shade on two morph weights |
| Finishes | matte `.82 / .02 / .8 / .6`, satin `.48 / .25 / .35 / .9`, gloss `.3 / 1 / .06 / 1.2` (roughness / clearcoat / its roughness / environment); clearcoat never 0, so no choice recompiles the program |
| Colours | Chalk `#e6e1d6`, Clay `#b4613f`, Moss `#5f6e47`, Ink `#262a33`, Saffron `#d7a032` |
| Prices | shade dome `£240`, cone `£225`, drum `£260`; finish `+ £0 / 15 / 30`; `Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })` |
| Scene | lathe shade of `28` points × `128 / 96 / 72` segments by quality tier, a lathe foot, a brass stem, a cord and a switch knob (so the turn reads), a floor-shadow plane; `RoomEnvironment` baked once through PMREM at `.62`, key `1.4`, fill `.5`; `NeutralToneMapping`; `compileAsync` before the first frame |
| Rendering | a GSAP ticker listener exists only while the view damps or a tween runs, then removes itself; DPR and pixel budget from `applyRendererBudget` |

## Tiers
- **Full:** the arrival turn, damped drag and keys, `.4 s` material and shape tweens.
- **Reduced:** no arrival, no damping (the view jumps to the clamped goal) and no tweens: every choice is set at once; the price, summary and URL behave the same.
- **Static** (and `?nogl`, or no WebGL2): no canvas and no orbit. A CSS lamp (shade by `border-radius` or `clip-path`, colour by `--lamp`, finish by a sheen gradient) takes the same configuration, and every control, the price and the URL keep working.

## Accessibility
Three `fieldset`s with legends hold native radios, visually hidden but focusable; the label is the 44 px target and shows checked and focus states, and arrow keys move within a group as the platform does. The summary is `aria-live="polite"` and says the whole configuration and price once per change; the add-to-bag answer goes to a separate `role="status"`. The view is a labelled slider with a description, present only when the canvas is; the canvas and the CSS lamp are `aria-hidden`. `touch-action: pan-y` leaves vertical swipes to the page on phones, and the controls sit under the stage there.

## Adapters

### React / Next
Keep the configuration in the URL with the router's `replace` (shallow) and derive everything from it; the radios are controlled inputs. The canvas is a client component with `frameloop="demand"`: tween the material in an effect keyed on the configuration and call `invalidate()` from the tween's `onUpdate`. Render the price on the server from the same catalogue.

### Vue / Nuxt
`useRoute().query` as the source of truth, `router.replace({ query })` on change; a computed price and summary. Mount three in `onMounted` behind `<ClientOnly>`, with the CSS lamp as the fallback slot.

### Webflow
Build the options as a native form with radio buttons and the product data as CMS fields (`data-hex`, `data-price` on each label). Inject the module from the page's footer code; it reads the form, writes the URL and owns the canvas inside a div you place in the product section.

Seen in: [site:floema], [site:the-boyd].
