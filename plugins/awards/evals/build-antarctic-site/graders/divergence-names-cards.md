---
type: regex
pattern: '\[site:(911rennsport|alectear|animejs|areebali|bethebuzz|boc|christoph-nagel|floema|gehry-getty|goats|grids-obys|haoqi|igloo|jesperlandberg|lama-lama|lando-norris|leo-parpeix|likova|mensch|mindmarket|mont-fort|nodeck|noth|okaydev|oryzo|pensatori-irrazionali|primesec|robbietilton|runrobrun|seasats|serotoninn|shopify-editions-w26|siena|siteassist|slosh-seltzer|son-daven|spasoje|the-boyd|the-line|to-top|trevor-noah|united-carriers|usavionix|warmnfuzzy|wearedirect|white-desert|why-zero|wodniack|zainabkabira)\]'
target: { source: file, path: AWARDS.md }
---

The literal placeholder `[site:slug]` is in the template, so the old `[a-z0-9-]+` form passed on an
untouched copy. Only real corpus slugs count; extend the alternation when the corpus grows.
