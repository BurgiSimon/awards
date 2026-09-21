# State of the awards plugin — 2026-09-21

Read this first, then `todo.md`. `plan-0.2.md` is the approved specification for the work in
progress and `verification-log.md` is its evidence ledger — on a restart, the ledger says where to
resume. `plan.md` is the 0.1.0 specification, kept for reference and no longer the current plan.
`decisions.md` records choices already taken; do not re-litigate them.

## Where things are

| Item | Location |
|---|---|
| Repository | `github.com/BurgiSimon/awards`; branch `feat/live-verification-0.2`, 54 commits ahead of `main`, nothing behind. The 0.1.0 pull request #1 is merged |
| Plugin | `plugins/awards/` (manifest `plugins/awards/.claude-plugin/plugin.json`, version **0.1.0**); marketplace manifest `.claude-plugin/marketplace.json` at the repo root, also 0.1.0. Phase 9 bumps both to 0.2.0 together |
| Skills | `plugins/awards/skills/{craft,concept,system,structure,stack,motion,webgl,component,jury,ship,research}/SKILL.md` — eleven, each with `allowed-tools` for the plugin's own scripts |
| Agent and hook | `plugins/awards/agents/awards-jury.md`, `plugins/awards/hooks/hooks.json` |
| Reference corpus | `plugins/awards/references/` — 20 site cards + `_index.md` + `_TEMPLATE.md`, 14 pattern files, `jury/{rubric,usability-walk,report-template}.md`, `craft-floor.md`, `anti-patterns.md`, `reflex-lists.md`, 11 stack and library notes |
| Recipes | `plugins/awards/recipes/` — 30 folders, `_shared/`, `README.md` catalogue, `package.json` (pinned deps), `vite.config.mjs`, `_verify/` (gitignored) |
| Scripts | `plugins/awards/scripts/{capture,audit,new-project,roll,verify-recipes,lint-refs}.mjs`, `scripts/lib/*`, `scripts/data/{rules.json,reflex-fonts.json}` |
| Templates and scaffold | `plugins/awards/assets/templates/`, `plugins/awards/assets/scaffold/vite-vanilla/` |
| Evals | `plugins/awards/evals/` — 23 cases (17 smoke, 6 build), `selftest.mjs`, `README.md`; `results/` gitignored |
| Original input | `awardsworthysites.md` (the user's list of 19 sites) |

## Where the 0.2.0 work stands

`plan-0.2.md` has nine phases. **Phases 0–6 are done and committed. Phase 7 is half done, Phase 8
has not started, and Phase 9 has had its free half taken early.**

| Phase | What it was | State |
|---|---|---|
| 0 | Branch, ledger, baseline, taxi pin | done — five real drifts found and fixed, listed in the ledger |
| 1 | Harden `capture.mjs`: wheel fallback, never lose the manifest | done, checked against a live virtual-scroll site |
| 2 | Seven blind jury calibration runs | done — **decision: change nothing in the rubric**, see below |
| 3 | Live pass over all 19 cards | done, 19/19, one card split into two slugs |
| 4 | Propagate the deltas, re-derive the rubric, `lint-refs.mjs` | done |
| 5 | Repair graders, add `selftest.mjs`, six new smoke cases, cheap smoke run | done — but its conclusion about the two misses was wrong; see the ledger's 5c correction |
| 6 | The two missing P2 recipes, `allowed-tools` on every skill | done, 30/30 recipes |
| 7 | Full smoke with the baseline arm, build tier once | **both tiers have run.** Smoke meets its bars; the build tier is 2/6 all-green with 47/53 graders passing, and its six failures are diagnosed but not yet fixed |
| 8 | One real end-to-end build | **not started** — the ledger's Phase 8 section is an empty stub |
| 9 | Docs, counts, version bump, final verification | **partly done** — see below |

The calibration outcome is load-bearing and easy to misread: this jury scores roughly 0.7 below the
published Awwwards overall and handed `fix` or `rebuild` to six sites that all actually won Site of
the Day. That gap is the plugin's stated edge, not a defect, so no anchor wording was changed.
`ship` means "clears our floor, which is stricter than the award's", not "this would win".

Phase 9 was started early on 2026-09-21 with the parts that cost nothing: the stale counts in
`CLAUDE.md`, `README.md` and `plugins/awards/README.md`, this file, `todo.md`, and the "Last run"
table in `evals/README.md` — which turned out to be recording a run that had already happened and
was never written down. The version bump, the release notes and the final verification block still
belong to Phase 9 proper, because they depend on results Phases 7 and 8 have not produced yet.

## What is verified

Re-run on 2026-09-21 in this session, output seen:

- `claude plugin validate plugins/awards` — passes.
- `node scripts/lint-refs.mjs` — 330 files, **0 dangling references**. Every `[site:]`, `[recipe:]`,
  `[pattern:]` and `${CLAUDE_PLUGIN_ROOT}` path resolves.
- `node evals/selftest.mjs` — 12 file-target graders, **0 defective**, 2 whitelisted guards.
- 30 recipe folders, all 30 carrying a `verified` stamp; 23 eval cases (17 smoke, 6 build).
- 20 site cards, every one carrying a `Live pass 2026-` line, none 200 lines or longer;
  `_index.md` has its `Last verified` column and no longer claims no card saw a live render.
- `capture.mjs` end to end against a local page after the LCP rename: manifest written,
  `lcpColdSynthetic` present.

Stamped on 2026-09-18 and **not** re-run since:

- `node scripts/verify-recipes.mjs` — 30/30 on Chromium 153.0.8010.12, Node 24.21.0, at desktop
  1440×900 and mobile 390×844, with reduced-motion emulation and keyboard, hover, drag and wheel
  actions. Every `recipe.json.verified` block carries that date.
- `node scripts/audit.mjs recipes` — 0 P0, 0 P1, 0 P2; 30 P3, all the deliberate missing Open Graph
  image on demo pages.

## What is not verified

- **The build tier ran once, on 2026-09-21** (CLI 2.1.278, 33 min, $27.68): 2/6 cases all-green,
  **47 of 53 graders passed**, every skill fired. Four of the six failures are grader defects, one is
  a 1800 s timeout on `build-antarctic-site`, and one is a real gap in `research` — it has no branch
  for a host that does not exist, only for one that is temporarily down. **None is fixed yet.**
- **The build tier has never executed a plugin script.** Bash was denied on every call, because
  `--allow-tools "Bash(node *)"` matches the command prefix and the skills invoke `timeout 120
  node …`, `cd … && …` and `node … | head`. `capture.mjs` and `audit.mjs` have never run inside an
  eval, so no grader has been tested against a rendered page or a real audit.
- The smoke tier **is** verified, in two parts: the full tier on 2026-09-18 (17 cases × 3 runs × 2
  arms, CLI 2.1.276, 49 min, $36.22, 13/17, mean delta over baseline +0.48) and the four repaired
  cases re-run afterwards at 3/3 each ($6.64 for the last three, CLI 2.1.278). Every Phase 7 bar is
  met. The caveat: the repairs were measured case by case on the plugin arm, not by re-running the
  whole tier in one pass. Per-case tables in `evals/README.md` under "Last run".
- Graders are now proven in **both** directions for the build tier: `selftest.mjs` checks that each
  fails on untouched input, and the 2026-09-21 run showed 47 of 53 passing on real output. The four
  that were wrong are named in the ledger.
- **The skills have never been driven end to end on a real project.** The open question is
  `plan.md` risk 2: whether the forked jury's literal `disposition:` line survives the relay back to
  the user. If it does not, the fallback is documented in `skills/craft/SKILL.md` — spawn
  `awards-jury` through the Agent tool with the input packet.
- **No recipe or skill has run on a real GPU or a real phone.** SwiftShader proves the recipes
  correct, not fast. The quality-tier thresholds in `recipes/_shared/quality-tiers.js` are still
  unmeasured guesses.
- Slosh Seltzer's captures show its WebGL gate rather than the site; its card says so, and its
  confidence stayed at medium-high for that reason.

## Environment facts that shaped the work

- This machine: Node 24.21.0, Claude Code CLI 2.1.276, Playwright 1.63.0 reached through
  `export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"` (the resolver in
  `scripts/lib/playwright.mjs` looks at cwd, then that variable, then `npm root -g`). Set it before
  anything that drives a browser. `recipes/node_modules` must be installed
  (`cd plugins/awards/recipes && npm install`) before `verify-recipes.mjs`.
- Egress is open; all 19 sites answer 200 to curl. **Awwwards answers 403 to curl** with any header
  set, but 200 through real headless Chromium — so site sources are fetched with curl and award
  entries with a browser.
- `verify-recipes.mjs` is not safe to run beside another Chromium. With a capture running in
  parallel, `gl-virtual-scroll-camera` fails its snap assertion; alone it passes.
- The account's usage limit killed agents mid-run three times across the two sessions. Commit after
  every unit; keep to three parallel subagents at most; subagents never commit and never touch
  shared files.
- `claude plugin eval` publishes an HTML report to claude.ai unless `--no-publish`, and prompts for
  trust unless `--trust-plugin`. Its cost ceiling is checked before a run launches, so `-j 3` with a
  tight `--max-cost-usd` overshoots: an `$8` ceiling spent `$9.20`.
- Playwright quirks that cost time: `page.hover` scrolls the element into view and the `scroll`
  event arrives a frame later; a scroll applied after a hover moves the element out from under the
  pointer; `mouse.wheel` needs a live Lenis clock to move a Lenis page; `readPixels` after a
  composer render needs the default framebuffer bound and a fresh render in the same task.

## Two lessons from Phase 6 worth keeping

1. **An existence check on a render proves almost nothing.** `gl-msdf-text` passed 8/8 while
   rendering its headline as a solid black slab, because the assertion only asked whether
   `readPixels` found ink inside the text rect. It now asks for an ink fraction between 0.08 and
   0.45. Look at the screenshots in `recipes/_verify/` before believing a PASS.
2. **The capture manifest's LCP was a lie, and every card author had to write the same disclaimer
   by hand.** As of 2026-09-21 the field is named `lcpColdSynthetic`, and `jury`, `ship`, `research`
   and the jury agent all say what it is. It is headless, cold-cache and software-GL: one run
   reported 71,044 ms desktop against 368 ms mobile for the same site. Read it as an asset-weight
   signal or not at all; a performance claim needs Lighthouse or a throttled trace.

## Numbers

| | |
|---|---|
| Commits on `feat/live-verification-0.2` ahead of `main` | 54 |
| Site cards / pattern files / stack notes | 20 / 14 / 11 |
| Recipes verified | 30 |
| Audit rules | 55 (`T` fonts, `C` colour, `M` motion, `A` accessibility, `L` layout, `P` performance, `S` surfaces, `X` slop) |
| Eval cases | 23 (17 smoke, 6 build) |
| Site of the Day overalls across the 20 verified entries | 7.28 – 8.18, median 7.67 |
| Pinned versions | gsap 3.15.0, lenis 1.3.26, three 0.186.0, animejs 4.5.0, ogl 1.0.11, postprocessing 6.39.5, @unseenco/taxi 1.9.1, vite 8.3.0 (full list in `references/stacks/versions.md`) |
