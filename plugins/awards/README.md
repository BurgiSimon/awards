# awards plugin

Skills, agent, hook, reference corpus, recipes and scripts for building award-worthy websites and components with Claude Code and Codex. Start with `/awards:craft` for a whole site or `/awards:component` for a single element in Claude Code; use `$awards:craft` or `$awards:component` in Codex. Every other skill also triggers on its own request. See the [installation instructions](https://github.com/burgisimon/awards#install) and [Codex runtime guidance](references/codex.md).

Install this whole folder; individual skills depend on its shared resources. Node 20.19+ (20.x) or 22.12+ is required for Vite builds. In the website project, run `npm install --save-dev playwright` and `npx playwright install chromium` for captures and jury evidence. The static audit and scaffold do not require Playwright. Both client manifests live here; [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md) travel with the installed package.

- `skills/` — the eleven skills (`craft`, `concept`, `system`, `structure`, `stack`, `motion`, `webgl`, `component`, `jury`, `ship`, `research`).
- `agents/awards-jury.md` — the fresh-context jury.
- `hooks/hooks.json` — a quick craft-floor audit after Claude Code edits, active only in projects that have an `AWARDS.md`; Codex runs the audit explicitly.
- `references/` — the corpus: 20 live-verified site case studies, the pattern language, the jury rubric, stack notes.
- `recipes/` — thirty verified motion and WebGL recipes (vanilla Vite first, framework adapters where marked); `recipes/README.md` is the catalogue by intent.
- `scripts/` — `capture.mjs` (Playwright screenshots), `audit.mjs` (deterministic checks), `new-project.mjs`, `roll.mjs`, `verify-recipes.mjs`.
- `assets/templates/` — `AWARDS.md`, `DESIGN.md`, jury and ship report templates, an authored 404; `assets/scaffold/vite-vanilla/` is what `new-project.mjs` copies.
- `evals/` — the `claude plugin eval` suite (smoke and build tiers) and `codex-install.mjs` (installation and discovery, no model calls).
