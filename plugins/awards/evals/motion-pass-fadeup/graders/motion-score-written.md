---
type: regex
pattern: '## Motion score(?:(?!\n## )[\s\S]){0,800}?\n\|[^\n]*\n\|[-|: ]+\n\|\s*[^|\s]'
target: { source: file, path: AWARDS.md }
---

The heading alone is in `assets/templates/AWARDS.md`, so it proves nothing. This requires the table
under it to carry at least one data row.

The table need not sit directly beneath the heading: a motion score is allowed a sentence of
rationale first, and the 2026-09-21 build run wrote one, which the earlier anchored pattern scored
as a missing table. The match cannot cross into the next `## ` section, so a filled table further
down the file cannot rescue an empty Motion score.
