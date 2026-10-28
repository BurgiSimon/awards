# overprint-marker-index

A project index with one marker for the whole list. The marker is a single bar blended with `multiply`, laid between the rows' plates and their words, so whatever it covers takes its colour while the marked row's words turn to the paper colour above it. It cuts to the row under the mouse, the row holding keyboard focus, or on a touch screen the row crossing a reading line, and it never slides between rows.

## Why
- **An overprint reads as material, a highlight reads as UI.** A multiply layer behaves like a coloured gel laid on a print: the paper under it takes the colour, the dark ink stays dark, a picture under it turns duotone. One such layer used as the index's state marker is the same device the source site uses for its hero, its featured work and its list view `[site:the-line]` [verified: `.work-list__highlight{background-color:#ff391e;mix-blend-mode:multiply}` in `index.DFQ5Ncrj.css`, 2026-10-28].
- **A cut is the honest move for a list.** The source moves its list marker by `gsap.set(…, { yPercent: 100 × index })` and its carousel nav marker the same way, with no tween [verified, `D9wrofva.js`, `ICJAAGel.js`]. A row is a discrete thing; a marker that eases between two rows spends frames on positions that mean nothing, and under reduced motion it has nothing to remove.
- **Three inputs, one mark.** The source marks rows on hover only, with `(hover: hover)` gating the marker [verified, `index.DFQ5Ncrj.css`]. Here keyboard focus moves it the same way, its focus ring is drawn on the text layer (an outline painted with the link would be overprinted with it), in the paper colour on the marked row and in ink when the mouse has moved the marker elsewhere, and on a touch screen it becomes a reading-line indicator, so the device works without a mouse.
- **Words above, plates below.** The index is an isolated stacking context with its own ground: plates at `z 1`, the marker at `z 2`, the words at `z 3`. The multiply blends with the index's paper and plates only, never with the page behind it.

## Parameters
| | |
|---|---|
| Marker | one `aria-hidden` element; `transform: translate3d(0, row.offsetTop px, 0)` and `height: row.offsetHeight px`, written only when the row changes; no transition |
| Blend | `mix-blend-mode: multiply` inside `.index { isolation: isolate; background: var(--ground) }` |
| Inputs | mouse `pointerover` (pointer type `mouse`); `focusin` with `:focus-visible`; touch: the row crossing `40 %` of the viewport height, read on `scroll` (paused while keyboard focus, `:focus-visible`, is in the list; a tapped link does not pause it) |
| Clear | the pointer leaves the list (unless focus is inside it), or focus leaves it |
| Sort | Year (newest first, then oldest), Project, Client, Type (A to Z, then Z to A); rows re-appended in order; `aria-pressed` on the active button; the order announced in a `role="status"` |
| Re-entry after a sort | every row `opacity 0`, then each set back at `.04 + i × .03 s` (full tier) |
| Blink | a registered `blinkOnce` (0 → 1 at `.06 s`, `extendTimeline: true`) when the marker first appears (full tier) |

## Tiers
- **Full:** as above.
- **Reduced:** the marker still cuts (it never moved), with no blink and no stepped re-entry after a sort.
- **Static:** the same as reduced.
- **Forced colours:** blends and backgrounds are dropped, so the marker is hidden and the marked row carries an outline.

## Accessibility
The rows are links in an ordered list; the marker is decoration and hidden from assistive technology. The sort buttons are real buttons with `aria-pressed`, and a polite status announces the new order, because a silent re-order is invisible to a screen reader. The focus ring stays visible on the marker (paper colour) and off it (ink), so a mouse moving the marker to another row never hides where focus is. Rows are at least 44 px tall. The marked row's text in the paper colour on the overprint passes 4.5:1 with the demo tokens; check yours, since the marker colour sets that ratio.

## Adapters

### Vue / Nuxt
Keep `active` as a ref and write the marker's transform in a watcher, not in the template: binding `:style` re-renders the whole list on every hover. Sort with a computed list keyed by slug; after the DOM updates (`nextTick`), re-place the marker if a row is still marked.

### Webflow
- Designer: a Collection List whose wrapper gets `position: relative`, `isolation: isolate` and the page ground; inside each item, the plate first, then the text blocks with `position: relative; z-index: 3`. Add one Div `index__marker` as the wrapper's last child (absolute, `z-index: 2`, `mix-blend-mode: multiply`, `aria-hidden="true"`).
- Inject from Footer code: the module listens on the wrapper and writes only the marker's `transform` and `height`.
- Sorting a CMS list on the client needs the items' sort keys as custom attributes (`data-year`, `data-title`); Webflow's own sort happens at publish time only.

Seen in: `[site:the-line]`.
