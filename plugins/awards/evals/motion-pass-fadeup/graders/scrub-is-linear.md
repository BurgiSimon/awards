---
type: regex
pattern: 'scrub[\s\S]{0,220}ease:\s*[\x27"](?!none|linear)'
target: { source: file, path: main.js }
match: not_contains
---
