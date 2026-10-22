---
type: regex
pattern: '\b(?:SEED|[Ss]eed)\b\W{0,12}[a-z0-9]{12}\b'
target: last_message
---

The reply carries the roll's seed, so the round can be dealt again in a later session.
