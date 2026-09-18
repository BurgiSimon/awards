# compare-hold-drag

Two aligned images of the same subject under two conditions. Drag the handle to move the divider, hold anywhere on the image to peek at the other side, or use the keyboard: the handle is a real slider with arrow, Home, End and Space bindings and an announced value.

## Why
- **Two conditions beat one render.** Seasons, day and night, empty and furnished: the compare turns a promise into evidence `[site:son-daven]` (`[pattern:components-catalog]`).
- **Pointer capture and cancel paths.** The drag survives leaving the handle and always releases on cancel, blur or capture loss, so it never sticks (`[pattern:responsive-strategy#coarse-pointer-swaps]`).
- **`touch-action: pan-y`** keeps vertical page scrolling on touch while the horizontal gesture belongs to the divider.
- **Keyboard is first-class.** `role="slider"` with `aria-valuenow` and `aria-valuetext`; Space peeks like a hold.

## Parameters
Steps `5` (Shift `20`) · hold peeks to `0` or `100` depending on the current side · divider transition `--dur-feedback` linear, none while dragging.

Seen in: `[site:son-daven]`.
