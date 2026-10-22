# Contributing

Thank you for helping. The plugin lives in `plugins/awards/`; the repository root is also its marketplace. Start with `CLAUDE.md` (commands and architecture) and `docs/handoff/state.md` (where things stand).

## Before a pull request

Run the free checks from `plugins/awards/` (CI runs the same on Node 22 and 24):

```bash
(cd recipes && npm ci)
node scripts/check-sync.mjs        # versions, pins, shared copies, licence files, quoted counts
node scripts/lint-refs.mjs         # every [site:], [recipe:] and [pattern:] reference resolves
node evals/selftest.mjs            # graders fail on untouched input
node scripts/route-hint.mjs --selftest
node scripts/audit.mjs recipes     # the recipes stay free of P0–P2
claude plugin validate .
```

With Playwright installed (`recipes/` pins 1.64.1), also run what your change touches, one browser job at a time:

```bash
node scripts/verify-recipes.mjs --only <recipe-id>   # a recipe you changed
node evals/behavior.mjs --only audit,capture         # tool behaviour, never beside verify-recipes
```

`node evals/pick.mjs` lists the paid eval cases your change exercises; say in the pull request which you ran, or that none ran.

## Conventions

- **Original prose.** No copied text from other skills or sites; site copy only in fragments of at most 25 words. Every fact on a site card carries `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`.
- **Recipes are a contract.** Each recipe has `index.html`, `main.js`, `style.css`, `README.md`, `recipe.json` and `verify.mjs`, uses system fonts and the shared modules, and passes `verify-recipes`. Its `group` and `tags` come from `scripts/data/recipe-tags.json`; `node scripts/build-catalogue.mjs` then rewrites the README table (`check-sync` fails a stale one). Stamp `recipe.json` (`--stamp`) only in a release pass.
- **Pins move together.** A library version changes in `references/stacks/versions.md` and `recipes/package.json` (with the lockfile) in one commit; `check-sync.mjs` fails a partial bump. `scripts/check-versions.mjs` shows what moved upstream.
- **Decisions are recorded.** A change to something listed in `docs/handoff/decisions.md` adds a row with the reason instead of quietly reversing it.
- **No model identifiers** in code, docs, commit titles or bodies.

## Reporting

Use the issue templates: a bug in a script, skill or recipe; a site to add to the corpus; or a proposal. Security problems go to the maintainer privately, not to a public issue.
