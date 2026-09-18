---
type: regex
pattern: 'opacity:\s*0,\s*y:\s*60'
target: { source: file, path: main.js }
match: not_contains
---
