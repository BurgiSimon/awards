---
type: regex
pattern: '^(?:disposition: (?:ship|fix|rebuild)\r?\nDesign \d+(?:\.\d+)? · Usability \d+(?:\.\d+)? · Creativity \d+(?:\.\d+)? · Content \d+(?:\.\d+)? — weighted \d+(?:\.\d+)?|disposition: recapture\r?\nDesign unmeasured · Usability unmeasured · Creativity unmeasured · Content unmeasured — weighted unmeasured)$'
flags: m
target: last_message
---

The disposition and immediately following score line must agree. Rendered evidence has four numeric
axes and a numeric weighted result; missing visual evidence has `recapture` and all values `unmeasured`.
