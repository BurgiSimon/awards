---
type: regex
pattern: 'ease:\s*[\x27"]power2\.out[\x27"],\s*scrollTrigger:\s*\{[^}]*scrub'
target: { source: file, path: main.js }
match: not_contains
---
