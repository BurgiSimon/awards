# awards

A Claude Code plugin (`plugins/awards/`) for designing and building award-worthy websites and components. The repository root is also the plugin marketplace (`.claude-plugin/marketplace.json`).

- **Continuing the work:** read `docs/handoff/state.md` and `docs/handoff/todo.md` first; `docs/handoff/plan.md` is the approved specification and `docs/handoff/decisions.md` the record of choices already made.
- **Validate:** `claude plugin validate plugins/awards`.
- **Verify recipes:** `cd plugins/awards/recipes && npm install && node ../scripts/verify-recipes.mjs` (headless Chromium with WebGL; screenshots in `recipes/_verify/`).
- **Audit:** `node plugins/awards/scripts/audit.mjs plugins/awards/recipes` must stay free of P0–P2 findings.
- **Evals:** `cd plugins/awards && claude plugin eval . --tag smoke` (model calls; see `plugins/awards/evals/README.md`).
- **Conventions:** original prose only (no impeccable wording, site copy in fragments of at most 25 words, confidence labels on every site fact); recipe stylesheets import `_shared/base.css` themselves; Lenis needs a clock (`autoRaf: false` + a ticker); custom shaders include `<colorspace_fragment>`; no model identifiers in any repository artefact; commit messages end with the attribution footer the session provides.
