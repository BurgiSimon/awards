---
type: regex
pattern: 'Design\s+\d(?:\.\d+)?\s*·\s*Usability\s+\d(?:\.\d+)?\s*·\s*Creativity\s+\d(?:\.\d+)?\s*·\s*Content\s+\d(?:\.\d+)?'
target: last_message
---

The format is the one the skill promises: `skills/jury/SKILL.md` requires the reply to end with the
four axis scores "written out in full (`Design x.x · Usability x.x · Creativity x.x · Content x.x`)".
The earlier pattern looked for `x/10` or a markdown table cell, a shape the skill never specifies,
and failed the 2026-09-21 build run on a reply that met the contract exactly.
