---
type: regex
pattern: 'Calibration:[^\n]*\[site:(?!slug\])[a-z0-9-]+\]'
target: { source: file, path: DESIGN.md }
---

system calibrates against the DIVERGENCE cards, not a fixed three. The template's own line carries
the placeholder `[site:slug]`, which the lookahead refuses, so an untouched copy fails.
