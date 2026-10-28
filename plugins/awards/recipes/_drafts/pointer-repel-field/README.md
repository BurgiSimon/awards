# pointer-repel-field

A tray of small items that a pointer parts as it passes: every item inside a circle of radius R around the pointer is pushed straight away from it, turned and lifted, by a weight that falls smoothly from 1 at the pointer to 0 at the edge, and each returns to its place on a spring once the pointer has gone. A finger pressed on the tray drags the same circle, and a real Nudge button sends a wave out from the centre, so the toy is not mouse-only; with reduced motion the tray holds still and says so.

## Why
- **Push away, spring back.** The source pushes each object within `460 px` of the pointer (`260 px` under 768) along the pointer-to-object angle by up to `380 px` (`110 px`) with the falloff `((R − d) / R)^1.6`, turns it up to `30°` (`12°`) and grows it up to `+.2` (`+.1`), over `.45 s power4.out`; outside the radius each object springs home with `elastic.out(1, .35)` over `1.2 s` `[site:noth]` [verified, `main.js` `Kv`]. Its card names the principle: a slow elastic return keeps a still arrangement alive while it always settles back to the designed layout.
- **One weight, three channels, rescaled.** Push, turn and lift all come from the same `w`, as in the source. The amplitudes here are the plugin's, sized to a tray of 58 px cells (`R 190`, push `72`), and they keep `push < R / 1.6`, the condition under which pushed items never cross each other along a ray from the pointer, so the field parts cleanly instead of piling up. The turn direction is seeded per item, so the tray turns like loose buttons rather than like one wheel.
- **Springs for the two curves.** A near-critical spring (ζ ≈ .98) stands in for the source's quick push and an under-damped one (ζ ≈ .45, about a fifth past the place and back) for its elastic return; the plugin's choice, because a spring keeps an item's velocity when the pointer comes back mid-return, where a fresh tween would restart from rest. Both step at a fixed 120 Hz, so a 60 Hz and a 144 Hz screen produce the same motion; `[recipe:svg-noise-line-field]` scales a per-frame spring by the frame time instead.
- **The cost stays near the pointer.** Item centres are read once, with every transform removed, and again only when the tray or the copy around it resizes. Each frame is arithmetic over that cache; transforms are written only for items inside R or still settling, removed entirely at rest, and the shared ticker is left as soon as nothing moves, even while the pointer rests on the tray. The verifier counts the writes and the frames.
- **Not a mouse-only ornament.** The source's field answers only to a pointer, with no touch variant and no reduced-motion branch [verified, the card's Weaknesses]. Here a press and drag on the tray acts as the pointer and lets go on lift, with `touch-action: none` scoped to the tray so the page scrolls from everywhere else; the Nudge button gives keyboards the same toy.
- **What it refuses.** Content inside the field: it is `aria-hidden` and its items take no pointer events, so a link or a word placed there would be lost. A field that fills a phone's screen, since a finger on it no longer scrolls. A field behind running text, which the parting would disturb.

## Parameters
| | |
|---|---|
| Items | 144 `<i>` in a CSS grid of 12 columns (8 × 8 under 760 px, the rest `display: none`), drawn with gradients, `pointer-events: none` |
| Cache | each centre from its rect relative to the tray, read with every transform removed, and the tray's page offset; re-read on a ResizeObserver (tray and hero), the 760 px breakpoint and fonts |
| Weight | `w = ((R − d) / R)^1.6`, `d` from the pointer to the item's place |
| Desktop / phone | R `190 / 112 px`, push `72 / 42 px`, turn `38° / 26°`, lift `+.28 / +.18` |
| Turn direction | per item from a hash: `±1 × .6–1.0` |
| Follow spring | `k 300`, `c 34` (ζ ≈ .98) while the item is inside R |
| Home spring | `k 130`, `c 10.3` (ζ ≈ .45) once it is outside |
| Step | fixed `1/120 s`, at most 24 steps a frame |
| Rest | under `.05 px` and `.5 px/s`, `.05°` and `.5°/s`, `.0005` and `.005/s` of scale: snapped, and the transform removed once home |
| Nudge | one ring from the centre at `900 px/s`; each item it passes gets `520 px/s` outward, `240°/s` of spin and `1.6/s` of lift, × `1 − .5 d / d_max` |
| Touch | `pointerdown` on the tray captures, `pointermove` drags, `pointerup` / `pointercancel` let go |
| Escape | anywhere on the page, with items displaced: every item home at once, the wave stopped |
| Off screen | an IntersectionObserver releases every item and stops the ticker |

## Tiers
- **Full:** hover, press-and-drag and the nudge, as above.
- **Reduced:** the tray is still and no input moves it; the Nudge button is `hidden` (gone from sight and from the accessibility tree) and a line says motion is reduced, so the still tray reads as a choice, not a fault.
- **Static:** the same as reduced. Switching tier live (`html[data-motion]`) releases every item home at once.

## Accessibility
The tray is decoration, `aria-hidden="true"`, and the hero's heading, copy, Nudge button and link carry everything it says; the verifier reads the accessibility tree and finds them and nothing of the tray. The Nudge is a `<button>` 48 px tall with a visible focus ring, answering Enter and Space, and Escape anywhere on the page stills the tray at once, so motion the visitor started can always be ended. On a phone the tray sits under the copy, square and no wider than the screen, so there is always page to scroll from. Under forced colours the drawn buttons keep their colours and gain an outline. Bone ink on the felt ground is about 10:1, the felt label on the mustard button about 6:1.

## Adapters

### React / Next
`'use client'`. Render the items once from a fixed array and keep the typed arrays, the active set and the pointer in refs created after mount; attach the listeners, the ResizeObserver and the IntersectionObserver to the tray's ref in one effect and remove them in its cleanup. Never put offsets in state: the toy writes `style.transform` directly.

### Svelte
An action, `use:repel`, on the tray: it measures, listens and subscribes to the ticker, and returns `destroy`. Render the items with `{#each}` over a constant array that nothing re-renders.

### Webflow
- Designer: a Div with the custom attributes `data-field` and `aria-hidden="true"`, set to Grid (12 columns), holding the item Divs; a Button element with `data-nudge` beside the heading.
- Inject from Footer code: the module writes only the items' `transform`, so Interactions must not animate the same Divs.
- Keep the tray off the full width of a phone layout, or give the phone a smaller grid, so visitors can scroll past it.

Seen in: `[site:noth]`.
