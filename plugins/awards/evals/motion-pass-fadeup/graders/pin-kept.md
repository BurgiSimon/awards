---
type: regex
pattern: 'data-pin|frame-stage'
target: { source: file, path: index.html }
---

Guard. It passes on the untouched fixture by design: it is here so a motion rewrite cannot quietly
delete the pinned stage instead of fixing its easing.

It reads `index.html`, where the stage exists as markup, not `main.js`. A rewrite may legitimately
move the hold from a ScrollTrigger pin to a CSS sticky stage — the 2026-09-21 build run did exactly
that, said so in a comment and asserted zero ScrollTrigger pins, which matches this repo's own
finding that no corpus card pins. Against `main.js` the guard read that relocation as a deletion.
