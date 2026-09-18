---
type: regex
pattern: 'Get started|Learn more'
target: { source: file, path: index.html }
match: not_contains
flags: i
---

Scanned on the page, not the trace: on the trace this false-failed whenever the agent read
`references/anti-patterns.md`, where both phrases are quoted as the thing to avoid.
