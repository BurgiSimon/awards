# Open todos

Ordered by value. None of these blocks using the plugin as it is.

## Before calling 0.1.0 done in practice
1. **Run one real build with the skills.** `claude --plugin-dir plugins/awards`, then `/awards:craft brief …` on a small brief with network access (so `npm install` and Playwright work). Expect wording to tighten in `craft`, `concept` and `jury`; record what the first real jury round looks like. Check that a forked `awards:jury` reply reaches the user with its `disposition:` line intact (plan §14 risk 2; fallback: `craft` spawns `awards-jury` with the input packet through the Agent tool).
2. **Run the smoke evals with the baseline** (`claude plugin eval . --tag smoke`, ≈ 11 cases × 3 runs × 2 arms; costs model calls). Tune skill descriptions where `tool_used: Skill` fails on natural phrasing; the three `no-trigger` cases guard against over-triggering.
3. **Run the build evals once** (`--tag build --scaffold --runs 1 --ablation none --allow-tools Write Edit "Bash(node *)" "Bash(npm *)" …`) and fix graders that turn out too strict or too loose; `research-unreachable` also tests honest confidence labelling.
4. **Real-device pass on the GL recipes** (a phone and a laptop GPU): `gl-fluid-wake-post`, `gl-dom-tethered-planes`, `gl-postprocessing-presets`, `gl-virtual-scroll-camera`; adjust the quality-tier thresholds in `recipes/_shared/quality-tiers.js` from measured frame rates.

## Corpus
5. **Re-verify the cards with network access**: `/awards:research <url> --to plugin` for each site, starting with the low-confidence ones (`mindmarket`, `lama-lama`, `white-desert`, `seasats` type, `trevor-noah` type, `animejs` awards, `mont-fort` awards, `lando-norris` awards). Fetch the published Awwwards weighting and update `references/jury/rubric.md` if it differs from 40 / 30 / 20 / 10.
6. Resolve the flagged conflicts: Son Daven 7.62 vs 9.01 (probably CSSDA), Why Zero's SOTD date, Léo Parpeix's "built by" credit, Floema's home-theme contrast (≈ 3.1:1 by the clone's hexes).

## Plugin
7. **P2 recipes**: `sound-toggle-opt-in` (Howler or `HTMLAudioElement`, persisted consent, audio-reactive 24×24 icon) and `gl-msdf-text` (MSDF text with a DOM mirror). Both are in the catalogue and cited by the pattern files.
8. **`allowed-tools` for the scripts** (`Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*)`) once the wildcard form is confirmed to work in plugin skills; v1 leaves prompts on.
9. **Framework adapters as code**: the recipes carry adapter notes; `recipes/<id>/adapters/{react.tsx,vue.vue,svelte.svelte,astro.astro}` are still to write for the P0 set, and `assets/scaffold/` has only `vite-vanilla` (the stack skill routes other stacks to `references/stacks/*.md`).
10. **`tools/extract-report.mjs`** (plan §7 tree, dev-only JSONL → last assistant text) was never needed and not written; drop it from the plan or add it.
11. Consider a `references/sites/_index.md` column for "last verified" once cards get re-checked.

## Housekeeping
12. Pull request #1 is open on `claude/award-worthy-website-skill-rbcead`; merge or keep iterating on the branch. `evals/results/` and `recipes/_verify/` are gitignored; `recipes/node_modules` must be installed locally (`npm install` in `plugins/awards/recipes`) before `verify-recipes.mjs`.
13. Bump `version` in `plugins/awards/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together on the next release.
