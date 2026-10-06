---
type: regex
pattern: '\|\s*Layout\s*\|[^\n]*\n\|[-|: ]+\|\s*\n(?:\|[^\n]*\n)*?\|[^|\n]*\|[^|\n]*\|[^|\n]*\|\s*[^|\s][^|\n]*\|'
target: { source: file, path: AWARDS.md }
---

The template already carries the `Layout` header, so the header alone passes on an untouched copy.
This requires a page-map row whose fourth cell, Layout, is filled; concept's skeleton rows leave it empty.
