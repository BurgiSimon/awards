---
type: regex
pattern: '"file_path"\s*:\s*"[^"]*\.awards/sites/[a-z0-9-]+\.md"|does not resolve|never resolved|NXDOMAIN|ENOTFOUND|not a (?:real|delegated) (?:host|domain|top-level domain)|placeholder (?:host|domain)'
target: trace
flags: i
---

Either correct outcome passes, because the run cannot choose which situation it is in.

A site that resolves and still cannot be read — 403, consent wall, timeout, `capture.mjs` exit 3 or
4 — gets a card with the labels dropped accordingly, and that card is the first alternative.

A host that does not resolve at all gets no card: every field would be invented and would then sit
in `_index.md` as a neighbour `awards:concept` could draw. Establishing that and saying so is the
second alternative, and it is what `skills/research/SKILL.md` §3 now requires.

This case's URL uses `.tld`, which is not a delegated top-level domain, so with live DNS it always
takes the second branch; inside a sandbox with no DNS it can take the first. The 2026-09-21 build
run failed this grader for doing the right thing — it refused, and the old `file_exists` on
`.awards/sites/*.md` could not express that.
