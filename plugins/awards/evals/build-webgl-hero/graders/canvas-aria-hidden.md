---
type: regex
pattern: '"(content|new_string)"\s*:\s*"(?:[^"\\]|\\.)*?aria-hidden'
target: trace
---

Anchored to the written file content in the tool call, not to the transcript: on a bare trace
regex this passed on prose about the token and failed on nothing.
