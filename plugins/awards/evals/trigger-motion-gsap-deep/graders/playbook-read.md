---
type: regex
pattern: '"file_path"\s*:\s*"[^"]*gsap-choreography\.md"'
target: trace
---

Anchored to the Read tool's input: the loaded skill body itself names the playbook path, so a bare trace match would pass without the file ever being read.
