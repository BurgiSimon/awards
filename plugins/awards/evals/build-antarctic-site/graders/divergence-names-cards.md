---
type: regex
pattern: '\[site:(animejs|floema|igloo|lama-lama|lando-norris|leo-parpeix|mindmarket|mont-fort|oryzo|seasats|shopify-editions-w26|slosh-seltzer|son-daven|the-line|trevor-noah|united-carriers|usavionix|white-desert|why-zero)\]'
target: { source: file, path: AWARDS.md }
---

The literal placeholder `[site:slug]` is in the template, so the old `[a-z0-9-]+` form passed on an
untouched copy. Only real corpus slugs count; extend the alternation when the corpus grows.
