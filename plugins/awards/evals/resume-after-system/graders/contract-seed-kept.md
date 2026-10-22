---
type: regex
pattern: '\*\*Seed:\*\* k3v9q2m7x1pd'
target: { source: file, path: AWARDS.md }
---

A guard: the locked contract's seed is still in AWARDS.md after the run. It holds on the fixture and
fails when the resumed run rewrote the contract.
