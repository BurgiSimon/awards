---
type: regex
pattern: '"file_path"\s*:\s*"[^"]*(index\.html|styles\.css|main\.js)"[^}]*"(old_string|content)"'
target: trace
match: not_contains
---
