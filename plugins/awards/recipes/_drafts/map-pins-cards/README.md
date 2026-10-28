# map-pins-cards

A drawn map of an invented island with eight named pins. Each pin is a real button laid out at its place's percentage of the map box, so it stays on its drawn point at any width; one card opens for the place under the pointer, the keyboard or the last click, with a name, one figure and its unit, one line and one action. The same places run beside the map as a plain list that drives the same card, and on a phone the card docks under the map instead of floating over it.

## Why
- **A place is a fact with a position.** The source's location chapter is a line-drawn street map with icon pins next to a figure panel ("8 minutes by bus"), and its master plan gives every named zone a figure and a Select action `[site:likova]` [verified, index.html + captures]. The card keeps that shape and nothing more: the name, the one number worth knowing with its unit, a line, an action.
- **The list is the map's other half, not a fallback.** On the source the 3D plan has no key handlers, so the zone list in its markup is the only keyboard path `[site:likova]` [verified, webgl-club.js]. Here the list reads in order with CSS and script off, and pointing at an entry, focusing into it or pressing its Show on map button opens the same card on the map, so neither half is second-class. The catalogue asks for exactly this pairing `[pattern:components-catalog#interactive-map-cards]`.
- **Location cards belong to a long page's evidence.** An infrastructure map with interactive location cards sits in the source's inventory, in the location chapter that follows its about chapter `[site:son-daven]` [verified, index.html section order; the card does not record the map's mechanism, so everything here about how it moves is the plugin's own].
- **Percentages, not pixels, and no transform on the anchor.** The SVG fills an `aspect-ratio` box with the same proportions as its `viewBox`, and the pins layer covers that box, so `left: x %; top: y %` lands on the drawn point at every width. Each pin is centred by a fixed negative margin rather than a `translate(-50%, -50%)`, which keeps the centre exact and leaves `transform` free for the entrance. The plugin's own choice; the verifier holds every pin to its percentage and to the SVG's own point within a pixel at desktop and phone widths.
- **One tab stop, arrows inside.** Eight pins as eight tab stops push the list a long way down the tab order. The pins form one labelled group with a roving `tabindex`; arrows move in reading order (top to bottom, then left to right), which is the order the list uses too. The plugin's own choice.
- **Docked on a phone.** At 350 px a floating card covers most of the pins it explains. Under 720 px it sits in the flow under the map, always present with a prompt when nothing is chosen, so choosing a place never pushes the page down. The plugin's own choice.

## Parameters
| | |
|---|---|
| Map | inline SVG, `viewBox 0 0 1000 800`, in an `aspect-ratio: 1000 / 800` box; on desktop at most `(100svh − 48px) × 1.25` wide and sticky `24px` from the top beside the list |
| Pins | `<button>`s at `left: calc(var(--x) * 1%); top: calc(var(--y) * 1%)`, `44 × 44 px`, margin `−22px`; a `14 px` dot (`11 px` on phones), `1.35×` when hovered or open |
| Reading order | sorted by `y`, with pins within `6 %` of the map's height ordered by `x`; the DOM order is rewritten to match |
| Card | one element filled from the list entry (name, figure, unit, line, link) each time it opens |
| Placement | `22 px` above the pin's centre, or below when the top would leave the map; clamped `12 px` inside the map's edges; written as one `translate3d`; a tick at the pin's `x` |
| Hover | mouse only; `140 ms` grace on leaving a pin or list entry so the pointer can reach the card |
| Priority | pointer, then keyboard focus, then the last click; focus inside the card holds it on its place |
| Keys | ← → ↑ ↓ move (wrapping; ← and → swap in a right-to-left page), Home and End jump; Escape closes from a pin or from inside the card, returning focus to the pin |
| List | `pointerenter` and `focusin` on an entry open its card; Show on map selects, writes `"<place> shown on the map."` to a polite status, and scrolls the map into view only when it is off screen |
| Entrance | the first time `35 %` of the map is in view (or a pin takes focus): opacity `0 → 1` over `360 ms`, `translateY(−14px) scale(.6) → none` over `560 ms` expo-out, `70 ms` apart in reading order; delays cleared after `1.11 s` |
| Dock | `max-width: 720px`: the card is `position: relative` under the map at its width, `min-height 9.5rem`, labels become clipped text |

## Tiers
- **Full:** the staggered entrance, the card's `6 px` rise and fade on the feedback band.
- **Reduced:** pins are in place from the first frame; the card fades without travelling. Everything that is state (open, chosen, focused) stays.
- **Static:** the same as reduced, with no transitions on the card or the dots.
- **Forced colours:** the dots take `Highlight` (open: `CanvasText`) and the card gets a border, since its background drops.

## Accessibility
Pins are buttons named by their visible label (clipped, not removed, on phones), described by the list entry's figure and line through `aria-describedby`, with `aria-expanded` and `aria-controls` pointing at the card. They sit in a `role="group"` named "Places on the map": one tab stop, arrows inside, Escape out of the card. The card's action comes straight after the group in the tab order, so a keyboard user reaches it with one Tab, and leaving the card returns nothing to a hidden state. The list is an ordered list with a heading per place; its buttons read "Show on map: <place>" (the visible words first), and choosing one is announced politely. The map drawing itself is `aria-hidden` with a caption, because the pins and the list carry everything it says. Every target is at least 44 px.

## Adapters

### React / Next
Keep the places as data (`{ id, x, y, name, num, unit, what, line, href }`) and render both the pins and the list from it; hold `hover`, `focus` and `selected` in a reducer and derive the shown place. Measure and write the card's `transform` in a layout effect through a ref, and keep the roving `tabIndex` in state. The SVG can be an inline component; do not let it re-render on hover.

### Vue / Nuxt
A `places` array drives both `v-for`s; `shown` is a computed from the three sources. Place the card in a `watch` with `flush: 'post'` so the measurement happens after the text changes. Register the document listeners (Escape, outside press) in `onMounted` and remove them in `onBeforeUnmount`.

### Webflow
- Designer: a Div with `aspect-ratio` holding the SVG (an Embed) and an absolutely positioned pins layer; each pin a Button with two custom attributes, `style="--x: 42; --y: 13.75"` and `data-place`. The list is a Collection List whose items carry the same `data-place`.
- Inject from Footer code: the module needs only the `data-*` hooks; set the percentages from CMS fields with a custom attribute.
- Keep the card one element outside the Collection List, so it is never repeated per item.

Seen in: `[site:likova]`, `[site:son-daven]`.
