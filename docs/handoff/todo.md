# Open todos

Rewritten 2026-09-21, after Phases 0–6 of `plan-0.2.md`. The plan is the specification, the
ledger (`verification-log.md`) is the evidence. Nothing here blocks using the plugin as it is.

## Before 0.2.0 ships

1. **Phase 7 — the build tier, and only that.** The smoke half is finished and its bars are met:
   the full tier on 2026-09-18 (17 × 3 × 2, $36.22, 13/17, mean delta +0.48) plus the four repaired
   cases re-run at 3/3 each. Tables in `evals/README.md` under "Last run".
   - **Build tier, `--tag build --scaffold --runs 1`, ceiling $45.** Never run, zero executions
     ever. It is the only check that a grader can *pass* — `selftest.mjs` only proves they fail on
     untouched input — and the only breadth test of what the skills produce rather than whether
     they fire.
   - The baseline arm does not need running again. Measured over 102 runs: every `skill-fired`
     grader scores 0 without the plugin, because the skill does not exist there, and all six
     negatives pass trivially for the same reason. The one informative row was `trigger-jury`
     (`disposition-line` 3/3 with, 0/3 without). Use `--ablation none` from here.
   - If the smoke tier is ever re-run whole, budget more than the arithmetic suggests: three cases
     × three runs cost $6.64, not the ≈ $2 estimated from the earlier per-run figures.
2. **Phase 8 — one real end-to-end build**, network and Playwright available, ceiling $25. The open
   question is whether the forked jury's literal `disposition:` line reaches the user; the fallback
   (spawn `awards-jury` through the Agent tool) is already documented in `skills/craft/SKILL.md`.
   The eval evidence is encouraging but not an answer: `disposition-line` passed 3/3 with the plugin
   inside the eval sandbox, which is not the same as a forked jury inside a real `craft` run.
   Worth running before the build tier — it is the defect-finder, and any wording fix it produces
   invalidates eval numbers bought earlier.
3. **Phase 9 — finish the docs and the version.** The free half was done on 2026-09-21 (counts,
   `state.md`, this file). Still open: `version` to `0.2.0` in **both**
   `plugins/awards/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together,
   release notes in `README.md`, the eval "Last run" table, and the full verification block at the
   end of `plan-0.2.md`.

## Out of scope for 0.2.0 by decision, still worth doing

4. **Real-device pass on the GL recipes** (a phone and a laptop GPU): `gl-fluid-wake-post`,
   `gl-dom-tethered-planes`, `gl-postprocessing-presets`, `gl-virtual-scroll-camera`, `gl-msdf-text`.
   Adjust the thresholds in `recipes/_shared/quality-tiers.js` from measured frame rates; they are
   guesses today. This is a human task — headless SwiftShader cannot answer it.
5. **Framework adapters as code.** The recipes carry adapter notes;
   `recipes/<id>/adapters/{react.tsx,vue.vue,svelte.svelte,astro.astro}` are unwritten for the P0
   set, and `assets/scaffold/` has only `vite-vanilla` (the stack skill routes other stacks to
   `references/stacks/*.md`).

## Smaller, open

6. **Slosh Seltzer's captures show its WebGL gate, not the site.** Its card records this and its
   confidence stayed medium-high. A capture through a GL-capable browser would close it.
7. **The fifteen site cards that disclaim the manifest's LCP by hand** still say "the manifest's LCP
   figures". The field is now `lcpColdSynthetic` and carries its own warning, so those sentences are
   redundant rather than wrong. Tidy them only if a card is being edited anyway.

## Closed since 0.1.0

Everything else on the old list. The corpus is live-verified 19/19 (item 5), the flagged conflicts
are resolved (6), both P2 recipes ship (7), `allowed-tools` is on every skill (8), the cold-LCP
defect is fixed (9), `_index.md` has its `Last verified` column (12), and pull request #1 is merged
(13). `tools/extract-report.mjs` (11) was never needed and is **dropped**, not deferred. Details and
evidence for each are in `verification-log.md`.
