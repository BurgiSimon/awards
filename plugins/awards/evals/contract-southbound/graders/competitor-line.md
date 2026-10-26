---
type: regex
pattern: 'Competitor test:[ \t]*(?=[^ \t<\n])[^\n]{3,}?\s[—-]\s\S'
target: { source: file, path: AWARDS.md }
---

THESIS names the nearest real competitor and why the thesis breaks for it. The template's line is a
placeholder (`Competitor test: <nearest competitor> — …`), which the lookahead refuses.
