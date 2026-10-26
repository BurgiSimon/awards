# Redesign inventory: the "Contact sheet" build (0.7.0–0.8 era, shipped 2026-10-23) → the 1.0.0 homepage

Baseline: `.awards/redesign-2/baseline/routes.json` (home, install, docs, recipes at desktop, tablet and phone, s00–s100, reduced motion, ARIA trees; captured 2026-10-26 from `dist/`, build `1.0.0+41e46a7.1d1fd7d`). Rendered audit: `.awards/redesign-2/baseline-audit.json`, P0 0 · P1 0 · P2 9 (L11: the ticket's ring SVG over the ticket heading and first command, three widths) · P3 1 (L12). Baseline critique: `.awards/jury/2026-10-26-baseline.md`, `ship`, D 7.4 / U 7.6 / C 7.7 / Co 7.0 → 7.48, developer mean 8.03. The redesign has to beat 7.48.

The baseline's own record is kept beside this file: `baseline-AWARDS.md`, `baseline-DESIGN.md` (moved out of the project root when the new contract was started, unchanged).

Kept content is real content. Every count on the site is read from the plugin at build time, so "keep" for a count means keep the fact, not the sentence.

| Item | Where | Decision | Reason |
|---|---|---|---|
| Route: home | `/` | keep (rebuild) | The conversion page, rebuilt on a new contract; the order install → how a build goes → recipes is the brief's |
| Route: install | `/install.html` | keep (re-skin) | Read mode, commands first; correct facts (Node floor, Playwright pin, cloud sessions, Cowork, local copy). New world's tokens and chrome, same sections |
| Route: docs | `/docs.html` | keep (re-skin) | Read mode, generated rule tables and skill list; new chrome |
| Route: recipes | `/recipes.html` | keep (re-skin) | The jury's Keep: 96 recipe frames, the site's best real imagery; filter by group and tag kept |
| Route: 404 | `/404.html` | keep (rewrite copy) | Authored error page with three ways back (Keep); its "no capture exists" line belongs to the contact sheet and goes |
| Facts binding `facts/collect.js`, `html.js`, `render.js`, `index.js` | build | keep | Brief: counts, version, commands and rule tables read from `../plugins/awards` at build |
| Proof step `facts/proof.js`, `scripts/proof.mjs`, `src/data/proof.json`, `public/proof/` | build | drop | It exists to hang this page's own captures on the page: the contact-sheet concept, spent (`house-tells.md` wave 1 "the page as a proof or capture of itself"; the brief lists it as spent). Its captions also quoted fix-list prose (baseline fault 2) |
| Strip of the page's own frames, juror's marks, s00 ring, loupe plate | home | drop | The spent signature |
| Job line "Your site, proofed before anyone sees it." | home h1 | drop | The baseline juror: it "would serve impeccable as well" |
| Lede (Claude Code and Codex, a written contract, audit rules at three widths, a juror in a fresh context) | home | keep (rewrite) | The four facts are right; "a juror in a fresh context" is jargon to a stranger (walk 5) |
| Install ticket: both clients' commands from the README, Copy, refused clipboard selects the command, `role=status` | home s00, close, /install | keep | The jury's Keep: the working conversion. Its decorative ring covered the text (L11 ×9) and the action had no weight of its own (craft fix 4): both go |
| Install in the band on every route at every width | chrome | keep | Keep; the current route must read differently from it (craft fix 5) |
| Chapter "Every phase leaves a file the next one reads" (nine phases in three runs, each with its file) | home | keep (rewrite) | The product's spine and the brief's second task, now told on a real build's record |
| Chapter "The jury reads the captures before the contract" (weights, dispositions, calibration line) | home | keep (rewrite) | The dispositions are bound from `agents/awards-jury.md`; the calibration line (about 0.7 below the award) is the honest frame for every score shown |
| Chapter "rules, the fast ones as you edit" (eight families with counts, slop line) | home | keep (shorten) | Real numbers from `rules.json`; the families table moves to /docs, home keeps one sentence and the slop cap |
| Chapter "Taste you can cite" (cards, skeletons, patterns, recipes, one frame per group) | home | keep (rewrite) | The brief's third task arrived at s75 (baseline usability cost); recipes come earlier and larger |
| Printed proof (audit sentence, 7.88 · ship, frames saying 89 rules) | home | drop | Stale: described build 0.7.0 (baseline craft fix 1). The redesign prints only records it reads at build, with their file and date |
| Colophon: version, MIT, by BurgiSimon, source, release notes, licence, credits, build id | every route | keep (rewrite) | Truthful and short; credits change with the faces |
| Fonts Enriqueta, Saira Condensed | assets | drop | The baseline's type contract; system chooses again |
| Restrained duotone (paper, silver-black, one grease red) | system | drop | House tell, 4 of 5 builds; the baseline juror counted it unearned |
| View Transitions between routes | motion | keep (re-author) | Same-origin MPA; the held object changes with the world |
| URL, canonicals, Open Graph, robots, sitemap | head | keep | Keep |
| `og.png`, favicons | public | rewrite | Drawn for the old world |
| Recipe frames `public/recipes/*.webp`, `src/data/recipes.json`, `scripts/recipe-frames.mjs` | public | keep | Owned (MIT), the site's real imagery; the frames script is kept; `wordmark-header-handoff` has no frame yet |
| Exceptions X02@docs.html, X07@docs.html, X18@recipes.html | AWARDS.md | keep | Same reasons: the pages print rule messages and recipe titles verbatim |
