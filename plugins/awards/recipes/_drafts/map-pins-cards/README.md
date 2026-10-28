# map-pins-cards

A drawn map of an invented island with eight named, numbered pins. Each pin is a real button laid out at its place's percentage of the map box, so it stays on its drawn point at any width. One card opens for the place under the pointer, the keyboard or the last click, on a side of the pin that never covers it. The same places, under the same numbers, run beside the map as a list that drives the same card; where the map is too small for a floating card, the card docks under the map at one fixed height.

## Why
- **A place is a fact with a position.** The source's location chapter is a line-drawn street map with icon pins next to a figure panel ("8 minutes by bus") `[site:likova]` [verified, index.html + wheel/mobile-s100.png], and its master plan gives every named zone a figure and a Select action [verified, index.html + webgl-club.js]. The floating card keeps that shape and nothing more: the name, the one number worth knowing with its unit, and an action. The place's sentence stays in the list beside the map, and joins the card when it docks and has the room; that split is the plugin's own choice.
- **The list is the map's other half, not a fallback.** On the source the 3D plan has no key handlers `[site:likova]` [verified, shared.js + webgl-club.js], so the zone list in its markup is the keyboard path [inferred]. Here the list reads in order with CSS and script off, carries the pins' numbers, and pointing at an entry, focusing into it or pressing its Show on map button opens the same card on the map. The catalogue asks for exactly this pairing and refuses pins without names `[pattern:components-catalog#interactive-map-cards]`, which is why a phone keeps the numbers when the names give way.
- **The card never covers its own pin.** A card clamped against the map's edge lands on the pin it describes, hiding the pin, its name and its focus ring. Here every candidate position starts 36 px from the pin's centre: above, below, or beside the pin on the side away from its name, slid along that side in 8 px steps. The cheapest one wins (10 for each other pin it covers, 1 for each other name), and pins stack above the card, so a covered pin stays reachable. The plugin's own choice; the verifier sweeps every place by pointer and by focus at 1440, 1024, 834 and 844 × 390 px.
- **Dock rather than crowd.** If some card cannot clear its own pin, if one would cover two other pins, or if more than a quarter would cover one, the card docks under the map. It reserves the height of its tallest place, so choosing a place never moves the caption or the list below. Beside the list the docked map gives up the card's room to keep the sticky figure on screen; on a landscape phone, where that would leave too small a map, the figure scrolls with the page instead. The plugin's own choice.
- **Percentages, not pixels, and no transform on the anchor.** The SVG fills an `aspect-ratio` box with the same proportions as its `viewBox`, and the pins layer covers that box, so `left: x %; top: y %` lands on the drawn point at every width. Each pin is centred by a fixed negative margin rather than a `translate(-50%, -50%)`, which keeps the centre exact and leaves `transform` free for the entrance. The plugin's own choice; the verifier holds every pin to its percentage and to the SVG's own point within a pixel at desktop and phone widths.
- **One tab stop, arrows inside.** Eight pins as eight tab stops push the list a long way down the tab order. The pins form one labelled group with a roving `tabindex`; arrows move in reading order (rows top to bottom, each left to right), the order the list and the numbers use too. The plugin's own choice.

## Parameters
| | |
|---|---|
| Map | inline SVG, `viewBox 0 0 1000 800`, in an `aspect-ratio: 1000 / 800` box; on desktop at most `(100svh − 48px) × 1.25` wide and sticky `24px` from the top beside the list |
| Pins | `<button>`s at `left: calc(var(--x) * 1%); top: calc(var(--y) * 1%)`, `44 × 44 px`, margin `−22px`; a `20 px` numbered disc (`22 px` on phones), `1.15×` on hover, inverted when open; each number is its list entry's number |
| Names | the chart's italic at `14 px`, set off by a `3 px` land-coloured stroke painted under the letters; in reading order a name stays only if it is inside the map and `4 px` clear of every earlier name and every other pin (counting the `14 px` a focused name steps out), otherwise the number stands alone; numbers only under `720 px` |
| Reading order | rows top to bottom (a pin within `6 %` of the map's height of a row's first pin joins it), each row left to right; the DOM order is rewritten to match |
| Card | one element filled from the list entry each time it opens; floating `16rem` wide with name, figure and action; docked at the map's width with the sentence as well |
| Placement | `36 px` from the pin's centre (clears the `28 px` focus halo and the `7 px` tick); above, below, or beside away from the name, slid in `8 px` steps; `12 px` inside the map; cost `10` per other pin covered, `1` per other name, plus `0` / `0.1` / `0.6` for above / below / beside and up to `0.5` off centre; the tick keeps `20 px` from the corners |
| Dock | always under `720 px`; otherwise when a card cannot clear its pin, one would cover two pins, or more than `25 %` would cover one; `min-height` is the tallest place's height; beside the list the map shrinks by `12 px` + that height + the caption, unless that leaves under `60 %` of its free width or `320 px`, when the figure stops being sticky |
| Hover | mouse only; `140 ms` grace on leaving a pin or list entry so the pointer can reach the card; a pin under the open card takes over after a `160 ms` rest, any other pin at once; a key press hands the pointer's claim back until it moves |
| Priority | pointer, then keyboard focus, then the last click; focus inside the card holds it on its place |
| Keys | ← → ↑ ↓ move (wrapping; physical in a right-to-left page too, because the map does not mirror), Home and End jump; Enter or Space toggles the focused pin's card; Escape closes from a pin or from inside the card, returning focus to the pin |
| Click and tap | selects (the card stays after the pointer leaves); a second one on the same pin lets go; a click anywhere else lets go (a click, not a press, so a touch scroll keeps the choice) |
| Reveal | a card opened by keyboard focus, or a docked card opened by a tap, scrolls into view, never so far that its pin leaves the screen |
| List | `pointerenter` and `focusin` on an entry open its card; Show on map selects, writes `"<place> shown on the map."` to a polite status, and scrolls the map into view when it is off screen |
| Entrance | the first time `35 %` of the map is in view, a pin takes focus or the pointer reaches the map: opacity `0 → 1` over `360 ms`, `translateY(−14px) scale(.6) → none` over `560 ms` expo-out, `70 ms` apart in reading order; waiting pins take no pointer; delays cleared after `1.11 s` |
| Focus ring | on the pin's `::after`, above its name: `2 px` land, `2 px` ink, `2 px` land, from `22` to `28 px` out; the name steps `14 px` further out while focused |

## Tiers
- **Full:** the staggered entrance, the card's `6 px` rise and fade on the feedback band, smooth reveal scrolls.
- **Reduced:** pins are in place from the first frame; the card fades without travelling; reveal scrolls jump. Everything that is state (open, chosen, focused) stays.
- **Static:** the same as reduced, with no transitions on the card, the discs or the list numbers.
- **Forced colours:** the discs take `Highlight` with `HighlightText` numbers (open: `CanvasText`), names sit on `Canvas`, the focus ring becomes a `Highlight` outline, and the card gets a border, since its background drops.

## Accessibility
Pins are buttons named by their visible name, which stays the accessible name when it steps back to the number or sits under the card (it turns transparent, never hidden). They are described by the list entry's figure and line through `aria-describedby`, with `aria-controls` pointing at the card and `aria-expanded`, which Enter and Space really toggle. They sit in a `role="group"` named "Places on the map" and described by the caption's keyboard line: one tab stop, arrows inside, Escape out of the card. The card's action comes straight after the group in the tab order. A card never covers its own pin, its focus ring or its name, and a card opened from the keyboard is scrolled fully on screen. The ring changes the pixels around the pin by at least 3:1 in every direction, on land and on sea. Hover content can be dismissed (Escape), hovered (the grace) and stays until the pointer or focus leaves. A tap selects without relying on focus, so the docked card holds on browsers where a tapped button takes no focus, and scrolling past the map keeps it. The list is an ordered list with a heading per place; its numbers are decorative (`content: counter(place) / ""`), since the list already announces position, and its buttons read "Show on map: <place>". The map drawing itself is `aria-hidden` with a caption, because the pins and the list carry everything it says. Every target is at least 44 px.

## Adapters

### React / Next
Keep the places as data (`{ id, x, y, name, num, unit, what, line, href }`) and render pins and list from it; hold `hover`, `focus` and `selected` in a reducer and derive the shown place. Make placement a pure function of the map size, the card size and the other pins' boxes, and run the dock decision in a layout effect that measures the card once per place (a `ResizeObserver` on the map re-runs it). Write the card's `transform` through a ref, never through state, and do not let the SVG re-render on hover.

### Vue / Nuxt
A `places` array drives both `v-for`s; `shown` is a computed from the three sources. Run the dock decision and placement in a `watch` with `flush: 'post'`, so the measurement sees the new text. Register the document listeners (Escape, the outside click) and the `ResizeObserver` in `onMounted`, and remove them in `onBeforeUnmount`.

### Webflow
- Designer: a Div with `aspect-ratio` holding the SVG (an Embed) and an absolutely positioned pins layer above the card; each pin a Button with `style="--x: 42; --y: 13.75"` and `data-place` custom attributes, holding a number span and a name span. The list is a Collection List whose items carry the same `data-place`.
- Inject from Footer code: the module needs only the `data-*` hooks; set the percentages from CMS fields with a custom attribute.
- Keep the card one element outside the Collection List, so it is never repeated per item.

Seen in: `[site:likova]`.
