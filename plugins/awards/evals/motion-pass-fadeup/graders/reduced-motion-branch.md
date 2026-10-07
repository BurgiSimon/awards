---
type: regex
pattern: 'prefers-reduced-motion|matchMedia|reduced-motion\.js|motionTier'
target: { source: file, path: main.js }
---

The branch may live in the shared `lib/reduced-motion.js` the skills copy in; importing it from
`main.js` counts (2026-10-07 build run: correct import, grader failed).
