---
type: regex
pattern: '"(content|new_string)"\s*:\s*"(?:[^"\\]|\\.)*?setPixelRatio\(\s*(?:window\.)?devicePixelRatio\s*\)'
target: trace
match: not_contains
---

Anchored to the written file content: on a bare trace regex, reading a reference page that quotes
the uncapped form as the anti-pattern was enough to fail the case.
