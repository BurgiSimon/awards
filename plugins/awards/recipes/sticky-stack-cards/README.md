# sticky-stack-cards

Sticky articles that pile up: as the next card travels from the bottom of the viewport to its sticky top, the card beneath scales down and dims, so the stack reads as depth. No `pin`, no spacer; each card is a real article with a heading.

## Why
- **Depth from settling, not from shadows.** The scale step per layer (`.92, .90, .88`) and the opacity drop are what make the pile read; a drop shadow would fight the sharp-and-shadowless material policy (`[pattern:color-and-material#material-policies]`).
- **Sticky is the mechanism.** The sticky offset is the stack's top edge; the trigger reads the *next* card's travel, so refresh and resize never desynchronise `[site:mindmarket]`.
- **Reduced motion:** plain cards, full opacity, still sticky (the stacking itself is layout, not motion).

## Parameters
Sticky `top: 12svh` · card `min-height 70svh`, gap `18svh` · scale `0.92 − 0.02·i`, opacity `.6` · `scrub: 0.4`.

Seen in: `[site:mindmarket]`.
