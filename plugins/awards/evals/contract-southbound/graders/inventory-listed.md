---
type: regex
pattern: '^- \*\*Inventory[^\n]*?:\*\*[ \t]*(?:[^;\n]{3,};[ \t]*){7,}'
flags: m
target: { source: file, path: AWARDS.md }
---

Concept starts from what belongs to this client and no competitor: eight or more inventory items,
separated by semicolons, on the Brief's `Inventory` line. The template's line carries only its label,
so an untouched copy fails.
