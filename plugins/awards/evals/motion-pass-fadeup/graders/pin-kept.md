---
type: regex
pattern: 'data-pin|frame-stage'
target: { source: file, path: main.js }
---

Guard. It passes on the untouched fixture by design: it is here so a motion rewrite cannot quietly
delete the pinned stage instead of fixing its easing.
