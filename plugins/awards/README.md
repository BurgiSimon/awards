# awards plugin

Skills, agent, hook, reference corpus, recipes and scripts for building award-worthy websites and components with Claude Code. Start with `/awards:craft` for a whole site or `/awards:component` for a single element; every other skill also triggers on its own request.

- `skills/` — the eleven skills (`craft`, `concept`, `system`, `structure`, `stack`, `motion`, `webgl`, `component`, `jury`, `ship`, `research`).
- `agents/awards-jury.md` — the fresh-context jury.
- `hooks/hooks.json` — a quick craft-floor audit after edits, active only in projects that have an `AWARDS.md`.
- `references/` — the corpus: 19 site case studies, the pattern language, the jury rubric, stack notes.
- `recipes/` — twenty-eight verified motion and WebGL recipes (vanilla Vite first, framework adapters where marked); `recipes/README.md` is the catalogue by intent.
- `scripts/` — `capture.mjs` (Playwright screenshots), `audit.mjs` (deterministic checks), `new-project.mjs`, `roll.mjs`, `verify-recipes.mjs`.
- `assets/templates/` — `AWARDS.md`, `DESIGN.md`, jury and ship report templates, an authored 404; `assets/scaffold/vite-vanilla/` is what `new-project.mjs` copies.
- `evals/` — the `claude plugin eval` suite (smoke and build tiers).
