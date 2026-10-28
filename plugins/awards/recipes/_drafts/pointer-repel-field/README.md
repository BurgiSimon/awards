# pointer-repel-field

A tray of small items that a pointer parts as it passes: every item inside a circle of radius R around the pointer is pushed straight away from it, turned and lifted, by a weight that falls smoothly from 1 at the pointer to 0 at the edge, and each returns to its place on a spring once the pointer has gone. A finger parts the tray where it lands and drags the circle sideways while a vertical swipe still scrolls the page, and a real Nudge button sends a wave out from the centre, so the toy is not mouse-only; with reduced motion the tray holds still, says so and leaves every touch to the page.

## Why
- **Push away, spring back.** The source pushes each object within `460 px` of the pointer (`260 px` under 768) along the pointer-to-object angle by up to `380 px` (`110 px`) with the falloff `((R − d) / R)^1.6`, turns it up to `30°` (`12°`) and grows it up to `+.2` (`+.1`), over `.45 s power4.out`; outside the radius each object springs home with `elastic.out(1, .35)` over `1.2 s` `[site:noth]` [verified, `main.js` `Kv`]. Its card names the principle: a slow elastic return keeps a still arrangement alive while it always settles back to the designed layout.
- **One weight, three channels, rescaled.** Push, turn and lift all come from the same `w`, as in the source `[site:noth]` [verified, `main.js` `Kv`]. The amplitudes here are the plugin's, and R and the push are counted in cells of the tray's own grid (`R 3.3` cells, push `1.25`; `2.7` and `1.0` on the phone's 8 × 8), so the parting covers the same few buttons on a 420 px tray and a 920 px one, where the source's pixel radius switches only at a 768 px breakpoint. They keep `push < R / 1.6`, the condition under which pushed items never cross each other along a ray from the pointer, so the field parts cleanly instead of piling up; near the rim a push is shortened along its own ray, so no button leaves the felt. The turn direction is seeded per item, so the tray turns like loose buttons rather than like one wheel.
- **Springs for the two curves.** A near-critical spring (ζ ≈ .98) stands in for the source's quick push and an under-damped one (ζ ≈ .45, about a fifth past the place and back) for its elastic return; the plugin's choice, because a spring keeps an item's velocity when the pointer comes back mid-return, where a fresh tween would restart from rest. Both step at a fixed 120 Hz, so a 60 Hz and a 144 Hz screen produce the same motion; `[recipe:svg-noise-line-field]` scales a per-frame spring by the frame time instead.
- **The cost stays near the pointer.** Item centres are read once, with every transform removed, and again only when the tray or the copy around it resizes. Each frame is arithmetic over that cache; transforms are written only for items inside R or still settling, removed entirely at rest, and the shared ticker is left as soon as nothing moves, even while the pointer rests on the tray. The verifier counts the writes, the frames and the layout reads.
- **Not a mouse-only ornament.** The source's field answers only to a pointer, with no touch variant and no reduced-motion branch [verified, the card's Weaknesses]. Here a finger parts the tray where it lands and a sideways drag moves the circle. The live tray sets `touch-action: pan-y pinch-zoom`, never `none`, so a vertical swipe stays the page's: the browser scrolls, cancels the pointer, and the tray lets go as on a lift. The still tiers hold it at `auto`. The Nudge button gives keyboards the same toy.
- **What it refuses.** Content inside the field: it is `aria-hidden` and its items take no pointer events, so a link or a word placed there would be lost. A field that fills a phone's screen, where every touch on the way past would part it. A field behind running text, which the parting would disturb.

## Parameters
| | |
|---|---|
| Items | 144 `<i>` in a CSS grid of 12 columns (8 × 8 under 760 px, the rest `display: none`), drawn with gradients, `pointer-events: none` |
| Cache | each centre from its rect relative to the tray, read with every transform removed, the tray's page offset, and the pitch and column count from the first row; re-read on a ResizeObserver (tray and hero), the 760 px breakpoint and fonts |
| Weight | `w = ((R − d) / R)^1.6`, `d` from the pointer to the item's place |
| Shape, 12 / 8 columns | R `3.3 / 2.7` cells, push `1.25 / 1.0` cells (`188 / 71 px` on the 57 px pitch at 1440 × 900, `111 / 41 px` on a 390 px phone), turn `38° / 26°`, lift `+.28 / +.18` |
| Rim | a pushed centre stays `.45` cell inside the tray's edge; the push is shortened along its own ray, never bent |
| Turn direction | per item from an unsigned hash: `±1 × .6–1.0` |
| Follow spring | `k 300`, `c 34` (ζ ≈ .98) while the item is inside R |
| Home spring | `k 130`, `c 10.3` (ζ ≈ .45) once it is outside |
| Step | fixed `1/120 s`, at most 24 steps a frame |
| Rest | under `.05 px` and `.5 px/s`, `.05°` and `.5°/s`, `.0005` and `.005/s` of scale: snapped, and the transform removed once home |
| Nudge | one ring from the centre at `15.8` cells/s (`900 px/s` at 1440 × 900); each item it passes gets `12.5` cells/s outward, `320°/s` of spin and `2/s` of lift, × `1 − .5 d / d_max`: the centre swings out about half a cell, the corners about a quarter |
| Touch | `touch-action: pan-y pinch-zoom` on the live tray only (`.is-live`, full tier); `pointerdown` takes the pointer where the finger lands and captures it, a sideways `pointermove` drags, `pointerup` lets go, and so does `pointercancel` when the browser takes a vertical swipe to scroll |
| Escape | anywhere on the page, with items displaced: every item home at once, the wave stopped |
| Off screen | an IntersectionObserver releases every item and stops the ticker |

## Tiers
- **Full:** hover, a finger's touch and sideways drag, and the nudge, as above.
- **Reduced:** the tray is still and no input moves it; its `touch-action` is `auto`, so every touch on it scrolls or zooms the page; the Nudge button is `hidden` (gone from sight and from the accessibility tree) and a line says motion is reduced, so the still tray reads as a choice, not a fault.
- **Static:** the same as reduced. Switching tier live (`html[data-motion]`) releases every item home at once. Without script the page is the same still tray, with the Nudge `hidden` in the markup.

## Accessibility
The tray is decoration, `aria-hidden="true"`, and the hero's heading, copy, Nudge button and link carry everything it says; the verifier reads the accessibility tree and finds them and nothing of the tray. The Nudge is a `<button>` 48 px tall with a visible focus ring, answering Enter and Space; Escape anywhere on the page stills the tray at once (the How list says so), and every motion here also ends on its own within about two seconds. The Nudge is `hidden` in the markup and shown only by the full tier, so a page without script never offers a button that does nothing. On a phone the whole 8 × 8 tray sits under the copy in the first screen, and a vertical swipe on it scrolls the page: only sideways drags belong to the toy, and under reduced motion none do. The lede speaks of a finger on a device without hover, and of a mouse and a keyboard elsewhere. Under forced colours the drawn buttons keep their colours and gain an outline, and the Nudge keeps an edge (a transparent border the system colours draw). Bone ink on the felt ground is about 10:1, the felt label on the mustard button about 6:1.

## Adapters

### React / Next
`'use client'`. Render the items once from a fixed array and keep the typed arrays, the active set and the pointer in refs created after mount; attach the listeners, the ResizeObserver and the IntersectionObserver to the tray's ref in one effect and remove them in its cleanup. Never put offsets in state: the toy writes `style.transform` directly. Toggle `is-live` from the motion tier in the same effect, so `touch-action` follows the tier.

### Svelte
An action, `use:repel`, on the tray: it measures, listens and subscribes to the ticker, and returns `destroy`. Render the items with `{#each}` over a constant array that nothing re-renders.

### Webflow
- Designer: a Div with the custom attributes `data-field` and `aria-hidden="true"`, set to Grid (12 columns), holding the item Divs; a Button element with `data-nudge` beside the heading.
- Inject from Footer code: the module writes only the items' `transform`, so Interactions must not animate the same Divs.
- Give the tray `touch-action: pan-y pinch-zoom` only through the `.is-live` class the module toggles, never `none` in the Designer, so a still tray never blocks a scroll.

Seen in: `[site:noth]`.
