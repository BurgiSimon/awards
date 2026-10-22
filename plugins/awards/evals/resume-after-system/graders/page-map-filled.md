---
type: regex
pattern: '\|\s*Layout\s*\|[^\n]*\n\|[-|: ]+\|\s*\n(?:\|[^\n]*\n)*?\|[^|\n]*\|[^|\n]*\|[^|\n]*\|\s*[^|\s][^|\n]*\|'
target: { source: file, path: AWARDS.md }
---

The resumed run did the next phase's work: a page-map row with its Layout cell filled. The fixture's
page map is empty, so it fails before the run.
