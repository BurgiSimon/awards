# scroll-drawn-svg-path

A route drawn exactly as far as the visitor has read: `stroke-dasharray` equals the path length and the dash offset is scrubbed from that length to zero across the chapter.

## Why
- **Progress you can see.** A drawn line is a wayfinding cue and a story beat in one; it belongs where the subject *is* a route or a process `[site:mindmarket]` `[site:mont-fort]`.
- **Linear scrub.** `ease: 'none'`; the reading pace is the easing.
- **Accessible SVG.** `role="img"` with a `<title>`, stops as real text, and a complete line under reduced motion.

## Parameters
Trigger `top 70% → bottom bottom` (the line completes once the whole route is on screen, so a short footer never leaves it unfinished) · `scrub: 0.3` · stroke `3px`.

Seen in: `[site:mindmarket]`, `[site:mont-fort]`.
