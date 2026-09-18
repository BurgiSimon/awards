---
type: regex
pattern: 'scrub\s*:[\s\S]{0,200}ease:\s*[\x27"]power'
target: { source: file, path: main.js }
match: not_contains
---

Guard. The mirror of `no-eased-scrub-before`: the same defect written the other way round, with
`scrub` declared before the ease. It passes on the untouched fixture by design; it exists so a
rewrite cannot reintroduce an eased scrub simply by reordering the object. `scrub\s*:` and not bare
`scrub`, or the word in a comment one line above an eased tween matches it.
