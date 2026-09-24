# State of the awards plugin — 2026-09-23

Read this first, then `todo.md`. The visual composition candidate's deterministic verification is
recorded below in [Candidate verification record](#candidate-verification-record). `plan-0.2.md` and
`verification-log.md` record the earlier 0.2.0 work. `plan.md` is the 0.1.0 specification, kept for
reference. `decisions.md` records choices already taken.

## Unreleased — slop scan (branch `feat/no-slop`)

- **Catalogue.** `references/anti-patterns.md` has a new section, `## The slop scan`. It groups the habits a generator falls into under eight headings, and each row names the audit rule that catches the habit, or `judge`, plus the earned version. impeccable's public slop catalogue was the checklist for which categories to cover; the prose and detectors are original.
- **Audit.** It grew from 55 to 72 rules.
  - Static rules: X09–X19 and T07.
  - Render-only rules: L06–L08, T08 and X20.
  - Widened rules: X01, X02, X06, X08, L04 and L05. The copy lists they read are in `scripts/data/reflex-copy.json`.
  - Helper: `lib/css.mjs` has a new `ruleBlocks()`.
- **Recipes.** They stay at P0 0 · P1 0 · P2 0 · P3 68. Four earned uses carry inline `audit-ignore` lines with their reasons:
  - `filmstrip-index-rows` X13
  - `word-cycle-hero` X13 and X14
  - `throw-objects-css3d` X09
- **Workflow.**
  - The jury writes a `## Slop scan` section and caps Creativity at 6 at two families.
  - craft runs a slop pass before the jury, and component runs one as Verify step 3.
  - ship requires `--render` when a browser exists.
  - system, motion and structure widen their audit scopes.
- **Tests.** `evals/behavior.mjs --only audit` covers every new static rule on a slop fixture, a clean control page and the five rendered rules. A negative render fixture keeps the earned shapes quiet.
- **Rendered rules against the built recipes.** An `audit.mjs --render` sweep of all 60 built recipes (`recipes/dist`, served by URL) is clean except for `gl-endless-reel-sheets` T08. That one is earned: when GL is on, the h1 is deliberately shrunk to a label.
  - Three false positives were fixed in the detectors:
    - L06 skips text under a canvas (the GL mirror).
    - L08 measures the text rather than the padded box.
    - T08 skips an h1 whose visual is an svg or img.
  - A render sweep must run the audit asynchronously. `execFileSync` blocks the process that serves the pages, and every audit hangs.

## Current release — visual composition library

Version **0.3.0** synchronizes the Claude, Codex and marketplace manifests. The
[release notes](../../README.md#status) describe the implementation and measured limits; the
frozen comparison below remains a failed acceptance result, with no claim of library causality.

The catalogue has **35 focused recipes plus one complete composition, 36 verifiable entries**.
Five native visual recipes, their composed page and the
[visual composition guide](../../plugins/awards/references/patterns/visual-composition.md) are in
the candidate. Alder Workshop, its specifications and imagery are synthetic demonstration material.
The published images have been reviewed and browser-tested. Human preferences for the three paired
builds are recorded below; preference for the library examples themselves has not been measured.
The eleven skills and 23 existing eval cases (17 smoke, 6 build) remain in place. The three-brief
manual visual benchmark is separate from those cases.

The six new entries pass **6/6 across 38 states and 409 checks**. The compatibility pass in a
temporary plugin copy covers **36/36 entries, 194 states and 931 checks** on headless Chromium
153.0.8010.12, with a fresh browser for each entry and serial execution. Two attempts using one
browser for all entries aborted during browser-context teardown; one also had a timing-sensitive
`gl-virtual-scroll-camera` idle-snap assertion at 0.363. That recipe passed its eight states in an
isolated fresh-browser run. This is complete isolated serial coverage, not a successful monolithic
browser session. Headless SwiftShader says nothing about real-device performance.

Behavior checks pass 11/11; jury-evidence self-check passes 5 assertions; the frozen candidate's
visual-library self-check passed 15 fixtures; grader self-test has 14 file-target checks, zero defective
and two known missing fixture skips; reference lint scans 380 files with zero dangling references. Both
manifests validate.
An isolated Codex installation discovers all eleven skills and builds both scaffold variants. Static
audits of the six entries and shared composition assets have no P0/P1 findings; per-directory
shared-import warnings and intentional demo exceptions are explained below. The controller froze candidate `ae29ca62b73b3a24ad0c246bdee6ee25687d6e48` for Task 12;
its unchanged plugin archive is recorded in the comparison report below.

## Post-pilot review corrections

After the frozen `ae29ca62b73b3a24ad0c246bdee6ee25687d6e48` candidate, the current source received
three locally verified review corrections: jury evidence reading order, a root-null recipe metadata
diagnostic, and open care-disclosure spacing. The expanded current visual-library self-check passes
16 fixtures. These later source changes were not used in the six frozen builds and add no paired-build
evidence; the archive, raw trial outputs and negative pilot result remain unchanged.

Post-review checks also pass the five jury-evidence assertions and reference lint (380 files,
zero misses). In a temporary plugin copy, `node scripts/verify-recipes.mjs --only
product-specification,complete-editorial-composition --out /tmp/awards-final-fix.CcrrLf/fresh-verify`
passed both entries: 13 states and 165 checks in Chromium 153.0.8010.12. Four new desktop/mobile
open-care focus frames were inspected. The fresh report is
`/tmp/awards-final-fix.CcrrLf/fresh-verify/report.json`; earlier raw evidence is preserved, and the
published closed-disclosure images remain valid and unchanged.

Independent whole-branch review and the scoped fix review are complete. Plugin source through
`d699771daf7c5a1bdbdd25c124bb0dd211f0c097` was copied into the original working tree on 2026-09-22,
preserving the user's existing edits. The pre-existing audit parser/corpus follow-ups remain in
`todo.md`; submitted human preferences are now recorded below.

## Paired comparison execution

Task 12 completed all six authorized frozen sessions and common evaluation using baseline
`4f348dc5ea850d9657af27ce28c17e11884f02d6` and candidate
`ae29ca62b73b3a24ad0c246bdee6ee25687d6e48`: USD 82.8435945, 224.67 paid-session minutes.
The candidate Kiln Nine and Form & Sound outputs fail the existing accessible-primary-action gate
because keyboard focus produces unreadable/insufficient-contrast labels. Secondary-copy C01 P1
findings also remain in two baseline outputs and Form & Sound candidate. This pilot fails technical
acceptance; it does not establish visual superiority. All six advertised Awards skills correctly
but made zero Skill calls, so guide/recipe workflow effectiveness remains unmeasured.

The [comparison record](visual-comparison-2026-09-22.md) records explicit gates, protocol deviations
and the verified 216-image neutral gallery. Simon's 2026-09-23 review prefers the candidate overall
for Tidal Notes and Form & Sound, ties Kiln Nine overall, and ties all three Mobile comparisons.
Kiln Nine's imagery favors the baseline; Tidal Notes' composition favors the candidate. All other
dimensions tie. These choices meet the visual preference thresholds, while technical acceptance
still fails. Practical blinding is limited and all 18 requested reasons are blank; the original
form, including technical checkboxes that disagree with measured failures, is preserved unchanged.
Evidence delivery and preference recording are complete; human rationale remains incomplete.
Generated source and frozen snapshots are preserved, with no additional paid run or application repair.

## Release checks — 2026-09-23

Fresh checks on the original working tree for 0.3.0:

- Both `claude plugin validate` commands pass; all three release manifests agree on 0.3.0.
  Root/plugin LICENSE and NOTICE copies match. Private scaffold/recipe package versions are unchanged.
- `lint-refs.mjs`: 380 files, zero dangling references. Jury evidence: 5 assertions. Visual metadata:
  16 fixtures. Shared layout assertions pass. File-target graders: 14 checks, zero defective,
  2 explicitly skipped missing fixtures.
- `npm --prefix plugins/awards/recipes run build` succeeds and emits all 36 entry pages. Vite retains
  the existing warning for the shared Three.js chunk above 500 kB; this is not a build failure.
- `evals/behavior.mjs`: 11/11 browser/tool checks pass, with the existing Playwright installation.
  `evals/codex-install.mjs --build`: 11 skills discovered in an isolated temporary install and both
  scaffold variants build; no user configuration or model calls are involved.
- All 569 plugin files outside the two release manifests and plugin README match the reviewed
  implementation byte-for-byte. The earlier 36-entry isolated browser coverage remains applicable;
  it was not repeated or relabeled as a successful single-session run.

The first metadata self-test attempt hit a sandbox `spawnSync ... EPERM` denial and returned no child
JSON. A minimal subprocess probe identified that permission failure; the unchanged test passed with
child-process permission. No source workaround was introduced. Release notes retain the failed
paired-pilot acceptance and unmeasured workflow benefit.

## Candidate verification record

Verified 2026-09-22 from base `74ba7b2` plus the documentation candidate, using Node `v24.21.0`,
npm `11.19.0`, Playwright and headless Chromium `153.0.8010.12`. Browser commands set
`AWARDS_PLAYWRIGHT` to the installed Playwright project and ran serially with SwiftShader.

| Command | Observed result |
|---|---|
| `node plugins/awards/scripts/verify-recipes.mjs --only complete-editorial-composition,designed-footer,editorial-image-text,product-specification,responsive-art-directed-hero,typography-specimen` | 6/6 entries, 38 states, 409 checks; exit 0. All 38 fresh frames inspected in six contact sheets; six mobile/action frames also opened at original resolution. No material overflow, crop, blank section or obscured action found. |
| `node plugins/awards/scripts/verify-recipes.mjs --no-build --only <id> --out <entry-output>` for each of the 36 IDs in a temporary plugin copy, one fresh browser per ID | 36/36 entries, 194 states, 931 checks; every entry exit 0 and report pass. The copy kept plugin-relative scripts/references and linked existing dependencies; the original 30 stamps were untouched. |
| `node plugins/awards/evals/behavior.mjs` | 11/11 browser/tool behavior checks; exit 0. |
| `node plugins/awards/evals/jury-evidence-selftest.mjs`; `node plugins/awards/evals/visual-library-selftest.mjs` | 5 assertions and 15 fixtures passed; exit 0 each. |
| `node plugins/awards/evals/selftest.mjs` | 14 file-target graders, 0 defective, 2 explicit missing-`index.html` fixture skips; exit 0. Skips are not passes. |
| `node plugins/awards/scripts/lint-refs.mjs` | 380 files, 0 dangling references; exit 0. |
| `claude plugin validate plugins/awards`; `claude plugin validate .claude-plugin/marketplace.json` | Both manifests valid; exit 0 each. |
| `node plugins/awards/evals/codex-install.mjs --build` | Isolated install discovered 11 skills and built both scaffold variants; exit 0. |
| `git diff --check` | Clean; exit 0. |

The long-session verifier was also attempted twice in the same temporary copy. First attempt:
12 entries printed PASS, then `browserContext.close` failed with `Target.disposeBrowserContext:
Failed to find context with id …` at `verify-recipes.mjs:110`; exit 1, no final JSON. Second attempt:
18 entries printed PASS, `gl-virtual-scroll-camera` failed its idle-snap assertion at `0.363`, then
`browserContext.close` failed after `magnetic-button` because the page/context/browser had closed;
exit 1, no final JSON. Browser diagnostics included readPixels stalls and repeated missing-mailbox
messages from SwiftShader. The virtual-scroll recipe passed all eight states with a fresh browser.
An initial fresh-browser runner later received exit 143 after twelve saved passes; its cause was not
established, no browser process remained, and it resumed in short serial groups. These failures
remain part of the record: 36/36 is **isolated serial coverage**, not a successful single-session run.

Eight static `audit.mjs <target> --json --no-write` runs covered six new entry directories,
`_shared/composition/` and `_shared/composition.css`. All 66 recorded source hashes matched the
candidate; the audits exited 0 with **0 P0/P1**. Per-directory scans reported A06 ×5 (P2), and
S01 ×6, S02 ×6, S04 ×6, S06 ×6, X07 ×3 (27 P3). A06/S01/S02/S04 arise because these scans do not
follow `style.css` imports: all six entries import `_shared/base.css` and `_shared/composition.css`,
which supply focus-visible, selection, scrollbar and color-scheme rules in the built pages. S06 is
the documented demo exception for omitted Open Graph images; a real site needs one. X07 marks
meaningful numbered study navigation, construction/process steps or compared type treatments in
three demos. The binary asset directory contains no scannable source file. No finding was suppressed.
The visual examples' imagery, brand and facts are synthetic demonstration material; browser checks
do not establish human preference or real-device performance.

## Earlier implementation — interactive capture, behavior checks and preflight

The requested additions are implemented in the current workspace. The [implementation plan and verification record](../superpowers/plans/2026-09-21-capture-behavior-preflight.md) track this pass separately from the older 0.2.0 snapshots below. `capture.mjs --states <json-file>` replays named interactions; `doctor.mjs` checks prerequisites before implementation; `evals/behavior.mjs` tests actual browser/tool behavior without model calls. Shared action dispatch serves both captures and recipe verification. Usage and failure semantics: `plugins/awards/references/capture-states.md`.

That pass recorded **11/11** behavior checks, including the reviewed server, audit, ticker and starter fallback/motion defects. Codex discovered all eleven skills and built both installed scaffold variants. Manifest checks, reference lint and grader self-test passed. The then-current serial recipe compatibility pass was **30/30 recipes across 156 states**; doctor reported all eight checks passed against the installed recipe project. Paid build/routing evals and real-device GPU measurements remained outside that pass.

## Where things are

| Item | Location |
|---|---|
| Repository | `github.com/BurgiSimon/awards`, branch `main`. The 0.3.0 release is prepared locally from `b63ed1c`; remote `main` matched that base at the release preflight on 2026-09-23. Use `git status -sb` for the current push state. Earlier 0.2.0 branch notes below are historical. |
| Plugin | `plugins/awards/`, version **0.3.0** in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` and the root `.claude-plugin/marketplace.json`. Bump all three together; `recipes/package.json` and the scaffold's `package.json` are unrelated private versions and stay where they are. |
| Skills | `plugins/awards/skills/{craft,concept,system,structure,stack,motion,webgl,component,jury,ship,research}/SKILL.md` — eleven, each with `allowed-tools` for the plugin's own scripts |
| Agent and hook | `plugins/awards/agents/awards-jury.md`, `plugins/awards/hooks/hooks.json` |
| Reference corpus | `plugins/awards/references/` — 20 site cards + `_index.md` + `_TEMPLATE.md`, 15 pattern files, `jury/{rubric,usability-walk,report-template}.md`, `craft-floor.md`, `anti-patterns.md`, `reflex-lists.md`, 11 stack and library notes |
| Recipes | `plugins/awards/recipes/` — 36 entries (35 focused, one complete composition), `_shared/`, `README.md` catalogue, `package.json` (pinned deps), `vite.config.mjs`, `_verify/` (gitignored) |
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
| Current branch | `main`; use `git status -sb` for the current push state |
| Site cards / pattern files / stack notes | 20 / 15 / 11 |
| Recipe entries verified | 36 in isolated serial browser runs; 35 focused plus one complete composition |
| Audit rules | 55 (`T` fonts, `C` colour, `M` motion, `A` accessibility, `L` layout, `P` performance, `S` surfaces, `X` slop) |
| Eval cases | 23 (17 smoke, 6 build) |
| Site of the Day overalls across the 20 verified entries | 7.28 – 8.18, median 7.67 |
| Pinned versions | gsap 3.15.0, lenis 1.3.26, three 0.186.0, animejs 4.5.0, ogl 1.0.11, postprocessing 6.39.5, @unseenco/taxi 1.9.1, vite 8.3.0 (full list in `references/stacks/versions.md`) |
