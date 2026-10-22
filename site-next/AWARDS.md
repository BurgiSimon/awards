# AWARDS.md — award-level build contract

<!-- awards:schema 1 · written and read by the awards skills · keep the sections in this order -->

## Status
- [x] Brief captured
- [ ] Direction contract locked (concept)
- [ ] Visual system written (system → DESIGN.md, tokens.css)
- [ ] Page map and skeleton built (structure)
- [ ] Stack booted (stack)
- [ ] Motion score authored and built (motion)
- [ ] WebGL layer built or explicitly declined (webgl)
- [ ] Jury disposition: —
- [ ] Shipped (ship)

## Brief
- **Subject:** `awards`, a Claude Code and Codex plugin (MIT, BurgiSimon; the version is read from its manifest at build time) that designs, builds, audits and judges websites against a corpus of analysed award winners. This site is its public page, self-hosted as static files. It replaces the earlier public page in `site/` (the wind-tunnel build), which is this redesign's baseline.
- **Unique mechanism (what only this subject can prove):** a website held to a written contract and tested before anyone sees it, by the same loop that built this page: 89 audit rules in 8 families run after every edit, headless captures at three widths, and a juror in a fresh context who scores Design 40 · Usability 30 · Creativity 20 · Content 10 and ends on one word (`ship`, `fix`, `rebuild`, `recapture`). The taste is cited, not claimed: 62 analysed award sites (55 with measured composition skeletons) and 89 recipe entries verified in headless Chromium. The scores this page received are printed on it, unedited.
- **Audience and their real scene:** developers and design engineers who already run Claude Code or Codex; they arrive from a repository link or a post, on a laptop with a terminal open beside the browser, with about thirty seconds before deciding to install or close the tab. A second visit is a lookup: a rule id, a recipe, a command.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** free, two commands, reversible: copy the install commands (Claude Code and Codex) and paste them. Secondary: browse the recipes, read the docs.
- **Assets on hand:** no photographs, video or 3D. Owned: frames of the plugin's own 89 recipes rendered in headless Chromium (MIT, produced by `verify-recipes` and `capture.mjs`), this build's own captures, audit JSON and jury report, and the recipe, rule and card metadata. Copy is authored from the plugin's own files; every count is read from the repository at build time. Anything drawn for the build (diagrams, marks) is labelled synthetic. No screenshots of third-party sites: the corpus captures are other people's work, evidence and never published.
- **Binding constraints:** static Vite multi-page build, relative `base`, self-hosted on any static server (`.github/workflows/site.yml` deploys `site/` to GitHub Pages on dispatch); WCAG 2.2 AA; no analytics, no external requests at runtime; no invented awards, testimonials or logos. `programs: awwwards`, target Site of the Day. A redesign, not a reskin: the baseline's world (smoke streamlines, a light lab ground, one warning orange, an extended heavy grotesque wordmark) is not reused.
- **Routes:** 5 — home, install, docs, recipes (the catalogue of 89 entries, filterable by group and tag, each with its frame), 404.
- **Sound:** none.
- **Visitor mode:** persuade (install is the conversion); the docs and recipes routes are read.
- **References the user likes:** none.

## Direction contract
- **THESIS:** the one idea this surface owns; the category default, the Awwwards default and the template skeleton it refuses.
- **WORLD:** colour strategy and tokens, type contract, materials, and one imagery strategy with what supplies it (owned photographs, a named open collection, a generation tool, a drawn language, code) — recognisable with every word removed. "None, flat grounds" is not a strategy.
- **STORY:** the narrative model, the chapter beats (entrance · hold · exit), the interruption, the close.
- **FIRST VIEWPORT:** the exact composition — what is where, at what scale, and where the primary action sits.
- **SIGNATURE:** the one interaction, the physical metaphor it enacts and the jobs it does, its technique tier, its behaviour on touch, keyboard and reduced motion, its fallback.
- **SCROLL MODEL:** native + Lenis / sticky stages + invisible rails / virtual float / section switcher — and why this story needs it.
- **LOAD & CLOSE:** what the preloader does and its real load signal; what the last screen is.
- **DIVERGENCE:** the three nearest corpus cards as `[site:slug]`; the principle taken from each; the literal move refused from each.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** (printed by `roll.mjs`)

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Layout | Components (recipe id: keep · change · pair) | Notes |
|---|---|---|---|---|---|

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|

## Budgets & tiers
- Entry JS (gz): · GL chunk (gz): · Textures per scene: · Fonts (files / KB): · LCP target: · Tiers: high / mid / low →
- Deep modes: motion gsap|none · webgl shader|3d|shader + 3d|none — because …
- Mode: redesign from site/ (the wind-tunnel build; baseline `.awards/redesign/baseline/routes.json`, audit `.awards/redesign/baseline-audit.json`, inventory `.awards/redesign/inventory.md`)

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes; component passes are marked `component` and a redesign's first score `baseline`; neither counts as a page round -->
- 2026-10-22 · baseline · fix · D 7.5 / U 7.0 / C 8.0 / Co 7.4 → 7.44 · .awards/jury/2026-10-22-baseline.md (the old site, page mode on its pre-jury captures)

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line, scoped to a path or viewport where you can: `C02 — pure black is diegetic (night-vision console)`, `C01@src/credits.html — read once over the film still` -->
