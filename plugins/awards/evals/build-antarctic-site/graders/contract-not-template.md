---
type: regex
pattern: 'the one idea this surface owns|recognisable with every word removed|the three nearest corpus cards'
target: { source: file, path: AWARDS.md }
match: not_contains
---

`contract-blocks` only proves the headings survived, which a verbatim copy of
`assets/templates/AWARDS.md` also does. This fails when the template's own prompt text is still
sitting in the contract.
