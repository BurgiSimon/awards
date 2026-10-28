# local-search-dialog

The folder `node scripts/drafts.mjs new <id>` copies for a new draft. It fills one bar with its section's scroll progress, which is only there so the page runs, verifies and shows in the explorer from the first minute. Replace it with the recipe.

## Why
- **Say why the move works, with evidence.** Cite the corpus card it comes from, `[site:slug]` with `[verified]`, `[recalled]` or `[inferred]`, or say it is the plugin's own proposal.
- **Say what it refuses.** The habit it replaces, and the case where it is the wrong move.

## Parameters
| | |
|---|---|
| Progress | `-rect.top / (rect.height - innerHeight)`, clamped to 0–1, read on the shared ticker while the stage is in view |
| Bar | `transform: scaleX(progress)`, origin left |

## Tiers
- **Full:** the bar follows the scroll.
- **Reduced:** the bar is full and still.
- **Static:** the same as reduced.

## Accessibility
The bar is decoration (`aria-hidden`); the figure under it is text. Nothing here needs a pointer.

## Adapters

### React / Next
Read the progress in an effect that subscribes to the ticker while the section is intersecting; write the transform through a ref, never through state.

### Webflow
Inject from Footer code; the module only writes the bar's transform.
