# awards — reference corpus

The corpus is the skill set's taste. Every planning skill reads `sites/_index.md` first, picks the three nearest case studies for the job, and then *diverges* from them. Nothing here is a template to copy: cards record principles, parameters and mistakes, and each one ends with "Take / Don't take".

## Layout
- `sites/` — one case study per analysed site (`_index.md` is the table of contents, `_TEMPLATE.md` the schema).
- `patterns/` — the cross-site pattern language: narrative structures, hero archetypes, the component catalogue, motion vocabulary, preloaders and transitions, cursor and pointer, typography, colour and material, copy and content, WebGL architecture, asset pipeline, accessibility and reduced motion, responsive strategy, sound.
- `jury/` — the scoring rubric, the usability walk and the report template used by `awards:jury`.
- `stacks/` — setup and adapter notes per framework and per library, with pinned versions.
- `craft-floor.md` — the quality floor loaded before any UI edit; `anti-patterns.md` — the Awwwards-default slop families; `reflex-lists.md` — faces, palettes and effects to avoid, with verified alternatives.

## Citation convention
Cite a card as `[site:slug]` (slugs are the file names in `sites/`), a pattern as `[pattern:file#anchor]`, a recipe as `[recipe:id]`. A citation is a pointer to a principle, never permission to reproduce a layout, copy, palette or asset.

## Confidence labels
Every factual claim about a site carries one label: `[verified]` (read from a fetched source, named), `[recalled]` (from memory, with high / medium / low), `[inferred]` (typical for the genre, not specific to the site), `[unknown]`. Never state a hex, a date, a score, a library or a credit without a label. Quote a site's copy only in fragments of at most 25 words.

## Adding a card
Run `/awards:research <url>`; it writes a card from `sites/_TEMPLATE.md` into the project's `.awards/sites/` (or into this folder with `--to plugin` inside the awards repository) and adds a row to the index. Keep cards under 200 lines.

## Provenance
Site facts belong to the sites' authors and studios; the analyses here were compiled from public award listings, published case studies, open-source repositories and reconstructions, with confidence labels. The corpus text itself is MIT-licensed with the plugin.
