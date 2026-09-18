# cursor-two-speed

A dot that follows the pointer almost instantly and a ring that lags: two damping rates on one input give the cursor mass. Over interactive elements the ring grows to `1.35×` and the dot shrinks to `0.7×`; over elements tagged `data-cursor="drag|play|view|copy"` a badge names the affordance. On coarse pointers, or when hover does not exist, the whole thing is never created.

## Why
- **Mass from two rates.** Dot lerp `.75`, ring lerp `.22` (per 60 fps frame), converted through `damp()` so the feel is identical at 60 and 144 Hz `[site:leo-parpeix]`.
- **Cursor as affordance system.** The badge tells the visitor what a gesture will do before they commit; it replaces tooltips on drag surfaces and media (`[pattern:cursor-and-pointer]`).
- **Feature-gated, not hidden.** `(pointer: fine) and (hover: hover)` decides whether the module even attaches; `cursor: none` is applied through a class so the OS cursor comes back the moment the module is disabled or the pointer leaves the window.
- **Reduced motion removes the lag**, not the cursor: both parts snap to the pointer, so nothing trails.

## Parameters
`DOT_LERP .75` · `RING_LERP .22` · hover ring `1.35×`, dot `0.7×`, ring opacity `.35 → .8` · badge offset `14 px`.

## Accessibility
`aria-hidden` cursor layer, `pointer-events: none`, keyboard users never see it; every tagged element is a real link, button or focusable group.

Seen in: `[site:leo-parpeix]`, `[site:the-line]`, `[site:why-zero]`.
