# State of the awards plugin — 2026-09-21

Read this first, then `todo.md`. `plan-0.2.md` is the approved specification for the work in
progress and `verification-log.md` is its evidence ledger — on a restart, the ledger says where to
resume. `plan.md` is the 0.1.0 specification, kept for reference and no longer the current plan.
`decisions.md` records choices already taken; do not re-litigate them.

## Latest implementation — interactive capture, behavior checks and preflight

The requested additions are implemented in the current workspace. The [implementation plan and verification record](../superpowers/plans/2026-09-21-capture-behavior-preflight.md) track this pass separately from the older 0.2.0 snapshots below. `capture.mjs --states <json-file>` replays named interactions; `doctor.mjs` checks prerequisites before implementation; `evals/behavior.mjs` tests actual browser/tool behavior without model calls. Shared action dispatch serves both captures and recipe verification. Usage and failure semantics: `plugins/awards/references/capture-states.md`.

The behavior suite passes **11/11**, including the reviewed server, audit, ticker and starter fallback/motion defects. Codex discovers all eleven skills and builds both installed scaffold variants. Manifest checks, reference lint and grader self-test pass. The serial recipe compatibility pass is **30/30 recipes across 156 states**; doctor reports all eight checks passed against the installed recipe project. Paid build/routing evals and real-device GPU measurements remain outside this pass.

## Where things are

| Item | Location |
|---|---|
| Repository | `github.com/BurgiSimon/awards`, branch `feat/live-verification-0.2`. Pull request #1 (0.1.0) and **#3** are both merged: `main` carries the branch through `c3b1740`, which is Phases 0–6. Everything from the cold-LCP fix onward — Phases 7 and 8, and the fixes they produced — is on the branch and not yet in `main`. Do not trust a "commits ahead" count in this file; it moved by 39 the moment #3 landed |
| Plugin | `plugins/awards/` (manifest `plugins/awards/.claude-plugin/plugin.json`, version **0.2.0**); marketplace manifest `.claude-plugin/marketplace.json` at the repo root, also 0.2.0. Bump the two together; `recipes/package.json` and the scaffold's `package.json` are unrelated private versions and stay where they are |
| Skills | `plugins/awards/skills/{craft,concept,system,structure,stack,motion,webgl,component,jury,ship,research}/SKILL.md` — eleven, each with `allowed-tools` for the plugin's own scripts |
| Agent and hook | `plugins/awards/agents/awards-jury.md`, `plugins/awards/hooks/hooks.json` |
| Reference corpus | `plugins/awards/references/` — 20 site cards + `_index.md` + `_TEMPLATE.md`, 14 pattern files, `jury/{rubric,usability-walk,report-template}.md`, `craft-floor.md`, `anti-patterns.md`, `reflex-lists.md`, 11 stack and library notes |
| Recipes | `plugins/awards/recipes/` — 30 folders, `_shared/`, `README.md` catalogue, `package.json` (pinned deps), `vite.config.mjs`, `_verify/` (gitignored) |
| Scripts | `plugins/awards/scripts/{doctor,capture,audit,new-project,roll,verify-recipes,lint-refs}.mjs`, `scripts/lib/*`, `scripts/data/{rules.json,reflex-fonts.json}` |
| Templates and scaffold | `plugins/awards/assets/templates/`, `plugins/awards/assets/scaffold/vite-vanilla/` |
| Evals | `plugins/awards/evals/` — 23 cases (17 smoke, 6 build), `behavior.mjs`, `selftest.mjs`, `README.md`; `results/` gitignored |
| Original input | `awardsworthysites.md` (the user's list of 19 sites) |

## Where the 0.2.0 work stands

`plan-0.2.md` has nine phases, and **all nine are done**. What remains open is listed in `todo.md`:
two fixes from the third build-tier run that have not been re-measured, and the work put out of
scope by decision (a real-device GPU pass, framework adapters, extra scaffolds).

| Phase | What it was | State |
|---|---|---|
| 0 | Branch, ledger, baseline, taxi pin | done — five real drifts found and fixed, listed in the ledger |
| 1 | Harden `capture.mjs`: wheel fallback, never lose the manifest | done, checked against a live virtual-scroll site |
| 2 | Seven blind jury calibration runs | done — **decision: change nothing in the rubric**, see below |
| 3 | Live pass over all 19 cards | done, 19/19, one card split into two slugs |
| 4 | Propagate the deltas, re-derive the rubric, `lint-refs.mjs` | done |
| 5 | Repair graders, add `selftest.mjs`, six new smoke cases, cheap smoke run | done — but its conclusion about the two misses was wrong; see the ledger's 5c correction |
| 6 | The two missing P2 recipes, `allowed-tools` on every skill | done, 30/30 recipes |
| 7 | Full smoke with the baseline arm, build tier once | **both tiers have run.** Smoke meets its bars; the build tier is 2/6 all-green with 36/41 graders passing, and its six failures are diagnosed but not yet fixed |
| 8 | One real end-to-end build | **done 2026-09-21**, $23.89, every check met, and `plan.md` risk 2 is resolved |
| 9 | Docs, counts, version bump, final verification | **done 2026-09-21** — both manifests at 0.2.0, release notes in `README.md`, counts corrected, verification block run |

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
  **36 of 41 graders passed**, every skill fired. Three grader defects and the tool grant have since
  been fixed and verified, and so have both remaining findings: `research` gained its missing branch
  for a host that cannot exist (4/4 twice), and `build-antarctic-site` went to `timeout_seconds:
  3600` from the Phase 8 measurement of 129 turns and 2,567 s. The timeout is reasoned from that
  measurement rather than re-tested.
- **The build tier was re-run on 2026-09-21 with the grant working**: $41.43, 45.6 min, **4/6 cases
  all-green, 39 of 41 graders, overall 0.95**, against 2/6 and 36/41 before. `build-antarctic-site`
  went 0 → 10/10 at 2,737 s, which also confirms the raised timeout by measurement rather than by
  reasoning. Two graders failed that had passed before, both on presentation rather than substance;
  both are repaired and verified. **A third run on 2026-09-21** ($44.37, 53.3 min) measured past
  those repairs: **4/6 cases all-green, 40 of 42 graders, overall 0.96**, with both repaired cases
  at 7/7. Its two failures are new in kind — `build-antarctic-site` ran out of *turns* (151 of 150)
  inside its raised time cap, so `max_turns` is now 200; and `jury-generic-saas/scores-present`
  caught the **jury skill drifting off its own reply contract**, writing its axes as a table and
  closing in prose. That contract is now a literal block in `skills/jury/SKILL.md`. Neither fix has
  been re-measured in the tier.
- An `llm` grader with `focus: trace` receives **about 25 lines** of transcript regardless of run
  length, so it cannot audit a long run. `scope-respected` failed 3/3 twice on runs that changed
  nothing, and is replaced by two file guards. Prefer a file target for anything a judge would have
  to reconstruct.
- The smoke tier **is** verified, in two parts: the full tier on 2026-09-18 (17 cases × 3 runs × 2
  arms, CLI 2.1.276, 49 min, $36.22, 13/17, mean delta over baseline +0.48) and the four repaired
  cases re-run afterwards at 3/3 each ($6.64 for the last three, CLI 2.1.278). Every Phase 7 bar is
  met. The caveat: the repairs were measured case by case on the plugin arm, not by re-running the
  whole tier in one pass. Per-case tables in `evals/README.md` under "Last run".
- Graders are now proven in **both** directions for the build tier: `selftest.mjs` checks that each
  fails on untouched input, and the first 2026-09-21 run showed 36 of 41 passing on real output. The four
  that were wrong are named in the ledger.
- ~~The skills have never been driven end to end on a real project.~~ **Done 2026-09-21.** Eight
  skill calls, `craft` → `concept` → `system` → `structure` → `stack` → `motion` → `jury` →
  `jury --verdict`, 129 turns, $23.89. `npm run build` passed, the audit re-run independently is
  clean at P0–P3 0, and the captures cover desktop, mobile and reduced motion with no console or
  page errors. **`plan.md` risk 2 is resolved**: the forked jury's literal `disposition:` line
  reaches the user verbatim, so the Agent-tool fallback in `skills/craft/SKILL.md` stays as
  insurance rather than being needed. Full account in the ledger's Phase 8 section.
- The one defect that run surfaced is fixed: `scripts/audit.mjs` resolved its project root from
  `process.cwd()`, so auditing from inside `public/` wrote the report there for the build to ship,
  and silently dropped the project's `## Exceptions`. It now walks up from the audited target to the
  nearest `AWARDS.md`, falling back to cwd where there is none.
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
| Commits on the branch not yet in `main` | 11 as of 2026-09-21, and this number rots — `git log --oneline main..HEAD` is the answer |
| Site cards / pattern files / stack notes | 20 / 14 / 11 |
| Recipes verified | 30 |
| Audit rules | 55 (`T` fonts, `C` colour, `M` motion, `A` accessibility, `L` layout, `P` performance, `S` surfaces, `X` slop) |
| Eval cases | 23 (17 smoke, 6 build) |
| Site of the Day overalls across the 20 verified entries | 7.28 – 8.18, median 7.67 |
| Pinned versions | gsap 3.15.0, lenis 1.3.26, three 0.186.0, animejs 4.5.0, ogl 1.0.11, postprocessing 6.39.5, @unseenco/taxi 1.9.1, vite 8.3.0 (full list in `references/stacks/versions.md`) |
