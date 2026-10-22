---
type: regex
pattern: '^colors:\s*\n(?:[ \t]+[\w-]+:[ \t]*["'']?(?:#[0-9a-fA-F]{3,8}|oklch\(|rgb|hsl|color-mix)[^\n]*\n){3,}'
flags: m
target: { source: file, path: DESIGN.md }
---

At least three colour tokens with real values in DESIGN.md's frontmatter. The template's colour keys
are empty, so an untouched copy fails.
