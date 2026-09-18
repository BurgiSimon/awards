---
type: regex
pattern: '## Motion score\s*\n\|[^\n]*\n\|[-|: ]+\n\|\s*[^|\s]'
target: { source: file, path: AWARDS.md }
---

The heading alone is in `assets/templates/AWARDS.md`, so it proves nothing. This requires the table
under it to carry at least one data row.
