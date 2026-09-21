# Plan: awards plugin 0.1.0 → 0.2.0 — live corpus verification, full eval run, readiness

## Context

Plugin `plugins/awards/` (11 skills, 19 site cards, 28 recipes, 55 audit rules, 17 eval cases) was built in a sandbox with blocked egress and a tight usage limit. Two debts remain:

1. **Eval suite never ran.** 1 of 17 cases executed once. Trigger descriptions and graders are untested.
2. **Corpus never saw the sites.** All 19 cards in `references/sites/` came from search extraction, GitHub clones and recall (`_index.md:5`: "No card was written from a live render of the site").

Outcome: every site in `awardsworthysites.md` verified against the live site and its live Awwwards entry, corrected facts propagated; jury calibrated against real jury scores; whole eval suite run and failures fixed; one real end-to-end build; the two missing recipes written; release 0.2.0.

User decisions (final): verify all 19 + jury calibration on 6 sites and the generic fixture · full eval budget · in scope: missing smoke cases, both P2 recipes, `allowed-tools` for plugin scripts · out of scope: framework adapters as code, extra scaffolds, real-device GPU pass (human task, stays in `todo.md`).

## Findings from planning (2026-09-18, this machine)

- **Egress open.** All 19 sites answer HTTP 200 to curl with a browser user agent.
- **Awwwards entries are curl-fetchable** (`https://www.awwwards.com/sites/<entry>`) and cleanly structured: overall `c-heading-score__note">→ 7.92`; weights `layout-overall__type">Design<strong>40%</strong>` (×4); the first four `data-note="…"` after that = Design, Usability, Creativity, Content; the next six = Semantics/SEO, Animations/Transitions, Accessibility, WPO, Responsive Design, Markup/Meta-data; second `heading-2` = `DEV AWARD → x.xx`. Evaluation page `/about-evaluation/`.
- **Weighting 40/30/20/10 confirmed** on live markup (Igloo 0.4·8.05 + 0.3·7.5 + 0.2·8.31 + 0.1·7.91 = 7.92).
- **Entry slugs:** `leo-parpeix-portfolio-2026` (older `leo-parpeix-portfolio` = Honorable Mention 2021, earlier site), `white-desert`, `why-zero`, `usavionix`, `seasats`, `trevor-noah`, `united-carriers`, `son-daven`, `lama-lama` (also try `lama-lama-2`: live scores 7.69 disagree with the card's 7.51, may be the older site), `floema`, `oryzo-ai`, `lando-norris`, `mindmarket`, `montfort`, `anime-js`, `igloo-inc`, `slosh-seltzer`. **Not found yet:** Shopify Editions Winter '26, The Line → `https://www.awwwards.com/websites/?text=<query>` then grep `/sites/<slug>`, else WebSearch `site:awwwards.com/sites`.
- **Overall scores seen (re-fetch in the pass; never copy from this plan):** united-carriers 7.28 · white-desert 7.31 · usavionix 7.41 · seasats 7.44 · trevor-noah 7.45 · anime-js 7.62 · montfort 7.62 · son-daven 7.62 · floema 7.65 · leo-parpeix 7.69 · slosh 7.69 · why-zero 7.73 · mindmarket 7.85 · oryzo 7.86 · igloo 7.92 · lando-norris 8.18.
- **Cards already contradicted:** `mindmarket`, `mont-fort` awards `[unknown]` → live SOTD with full scores; `lando-norris` "never assert a score" → 8.18, top of corpus; Son Daven resolves to 7.62 (D 7.70 / U 7.16 / C 8.15 / Co 7.59); Oryzo Content 7.76 (card inferred 7.77); White Desert 7.31 (card ≈ 7.35). Load-bearing claim "usability is the lowest axis on every scored site" (`_index.md:39`, `decisions.md:23`, `skills/jury/SKILL.md:104`) is false for White Desert (C 7.21 < U 7.27); "scores cluster 7.2–7.9" is now 7.28–8.18; rubric and jury skill name five developer criteria, Awwwards publishes six.
- **Local tooling:** `recipes/node_modules` absent. `playwright` unresolvable (resolver `scripts/lib/playwright.mjs`: cwd → `$AWARDS_PLAYWRIGHT` → `npm root -g`). `export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"` (Playwright 1.63.0 ↔ cached `chromium-1243`) **was tested and works** with zero downloads. Node 24.21, CLI 2.1.276. A Playwright MCP browser is available in-session for interactive inspection.
- **`capture.mjs` has two real defects on third-party GL sites** (tested on igloo.inc): (1) `page.screenshot` (`capture.mjs:162`) is unguarded: under SwiftShader the third frame timed out after 30 s, the script crashed with exit 1 and **wrote no manifest**; (2) `scrollTo` (`capture.mjs:87-99`) knows only the `__awards` hook and native `window.scrollTo`, so virtual-scroll sites (igloo, why-zero, floema, slosh-seltzer) never advance; frames differed only because the intro animation kept running. Two frames of Igloo took about two minutes: budget time, raise `--wait` and `--timeout`.
- `audit.mjs <url>` scans nothing without `--render` and never writes `audit.json` for a URL.
- **Evals:** `claude plugin eval` has `--case`, `--tag`, `--runs`, `--ablation`, `-j`, `--max-cost-usd`, `--json`, `--threshold` (default 1.0), `--scaffold`, `--allow-tools`, `--trust-plugin`, `--keep-temp`; **publishes an HTML report to claude.ai unless `--no-publish`**; first run prompts for trust unless `--trust-plugin`; no resume. Fragile graders listed in Phase 5.
- **Dangling refs:** only the two unwritten P2 recipes: `[recipe:gl-msdf-text]` in `references/patterns/{typography.md:96,webgl-architecture.md:150,hero-archetypes.md:79}`, `references/stacks/sveltekit.md:65`; `[recipe:sound-toggle-opt-in]` in `skills/webgl/SKILL.md:199`, `references/patterns/{sound.md:43,components-catalog.md:53}`; catalogue rows `recipes/README.md:50-53`. `@unseenco/taxi` pinned `^1.8.0` in `recipes/package.json` vs 1.9.1 in lockfile, `versions.md` and `page-transitions/recipe.json`.
- **Docs stale:** `state.md`/`todo.md` say PR #1 open (both merged, work is on `main`); `plan.md:408` says `claude plugin eval` is absent; environment notes describe the old sandbox.
- The design-review agent was cut off before reporting; two questions it was to answer from documentation stay open and are scheduled in Phase 5a and Phase 6c.

## Working rules for the implementing session

- `git switch -c feat/live-verification-0.2` first. **Commit after every unit** (one site, one grader batch, one recipe): the account's usage limit has killed agents mid-work before. Commit messages end with the footer the session provides. Push / PR only when the user says so.
- No model identifiers in any repo artefact. Original prose; site copy ≤ 25 words per quote; every card fact labelled; cards < 200 lines.
- ≤ 3 parallel subagents. Subagents never commit and never touch shared files (`_index.md`, ledger, patterns, rubric); the main session does.
- Long commands (`claude plugin eval`, `claude -p`, full `verify-recipes`, GL captures) run in the background with output to a file; Bash caps at 10 minutes.
- Ledger and evidence: `docs/handoff/verification-log.md` (committed). On any restart read it first and continue at the first row not marked done.
- If the session has `awards:*` skills (started with `claude --plugin-dir plugins/awards`), invoke them; otherwise follow the matching `SKILL.md` as the procedure with `CLAUDE_PLUGIN_ROOT=/home/fdaiobue/projects/Pers/awards/plugins/awards`.
- Skill edits keep descriptions ≤ 1,536 chars; rerun `claude plugin validate plugins/awards` after any frontmatter change.

## Phase 0 — Setup and baseline (no model cost)

1. Branch; copy this plan to `docs/handoff/plan-0.2.md`; create `docs/handoff/verification-log.md` with a 19-row table: slug · entry URL · pass date · reachable · capture exit · scroll mode · overall (verified) · confidence before → after · status.
2. `cd plugins/awards/recipes && npm install`; `export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"` (if that cache is gone: `npm i -g playwright && npx playwright install chromium`).
3. Baseline must be green before anything else: `claude plugin validate plugins/awards` · `node scripts/verify-recipes.mjs` (28/28; new Chromium build and Node 24 versus the stamped run, so drift here is a finding to fix first) · `node scripts/audit.mjs recipes` (0 P0–P2).
4. Fix `@unseenco/taxi` to `1.9.1` in `recipes/package.json`. Commit.

## Phase 1 — Harden `scripts/capture.mjs` (≈ 30 lines)

- **Wheel fallback.** `scrollTo` returns its mode: `hook` (has `__awards.scrollTo`), `native`, or `wheel` when there is no hook and `scrollHeight − innerHeight < 0.25 × innerHeight`. In wheel mode: move the mouse to the viewport centre, send `(percent − previousPercent)/100 × wheelPx` through `page.mouse.wheel` in 10 steps 80 ms apart, then the normal settle. New flag `--wheel <px>` (default 8000, `0` disables). Record `scrollMode` in `manifest.metrics[label]`.
- **Never lose the manifest.** Pass `timeout` to `page.screenshot`, catch its failure into `manifest.pageErrors` (`[label] screenshot timeout at sNN`), continue with the next state, and write `manifest.json` in the `finally` path. Exit codes unchanged (2 on errors).
- Docs: one bullet in `skills/research/SKILL.md` §2 and in `skills/jury/SKILL.md` §0 ("identical frames or `scrollMode: wheel` with no change: rerun with `--wheel <px> --wait 6000 --timeout 90000`; say in the card or report how the states were reached"); flag list in `CLAUDE.md` and `docs` line for `capture.mjs`.
- Check: capture `https://www.igloo.inc/` with `--only desktop --scroll 0,50,100 --wheel 12000 --wait 6000 --timeout 90000` → manifest exists, `scrollMode: "wheel"`, frames show different scenes when opened with Read. `node scripts/verify-recipes.mjs --only gl-virtual-scroll-camera,boot-lenis-gsap` still green. Commit.

## Phase 2 — Captures for the six calibration sites, then the blind jury runs

Six sites: `united-carriers` 7.28 · `white-desert` 7.31 · `seasats` 7.44 · `mont-fort` 7.62 · `mindmarket` 7.85 · `lando-norris` 8.18. Reason: they span the range, all scroll natively (reliable frames), and three have no score anywhere in today's corpus. **Run the jury before these cards or `_index.md` receive verified scores**, otherwise the jury reads its own answer key.

1. Per site from the repo root: `node plugins/awards/scripts/capture.mjs <url> --out .awards/research/<slug> --scroll 0,25,50,75,100 --mobile --reduced-motion --json` (+ `--wait 4000` when a preloader sits in every frame). The research capture set already contains the five frames the jury requires.
2. Jury run per site in a scratch project outside the repo (`<scratchpad>/calib/<slug>/.awards/captures/` ← copy of the research captures; `node scripts/audit.mjs <url> --render --json > .awards/audit-render.json`). Invoke `awards:jury <url> --captures .awards/captures`, or spawn an agent told to follow `agents/awards-jury.md` + `skills/jury/SKILL.md`. Blind packet, verbatim: "Calibration run. Do not open this site's card in references/sites/, do not read its row in _index.md, do not look up its awards or scores. Skip the DIVERGENCE comparison; there is no AWARDS.md." Seventh run: copy `evals/jury-generic-saas/fixture/` to scratch, capture it locally, same jury.
3. Ledger section "Calibration": per site jury D/U/C/Co/weighted/dev versus Awwwards, deltas, caps the jury applied, disposition.
4. Decision rule. Change rubric anchor wording only when an axis is off by more than 0.5 in the same direction on ≥ 5 of 6 sites, then rerun two sites to confirm. Usability deltas caused by the jury's deliberate caps (keyboard, reduced motion, DOM mirror) are recorded, not corrected: that strictness is the plugin's stated edge. The generic fixture must land below 6.5 and not `ship`. Never touch weights or mechanical disposition rules on n = 6; thresholds come from the verified entry data in Phase 4. Known residual contamination (the model may recall famous sites' scores) is noted in the ledger.

## Phase 3 — Live card pass, all 19

Order: the six above (captures exist) → `lama-lama`, `trevor-noah`, `animejs` → conflicts `son-daven`, `why-zero`, `leo-parpeix`, `floema` → `slosh-seltzer`, `igloo`, `shopify-editions-w26` (58 recalled claims), `oryzo` (44) → `usavionix`, `the-line`. Batches of three subagents, one site each. Procedure = `skills/research/SKILL.md` for an existing card (line 43) plus the award listing. Subagent packet:

```
Site <name> <url> · card plugins/awards/references/sites/<slug>.md · Awwwards entry <entry url>
Follow plugins/awards/skills/research/SKILL.md §1–§6 for an EXISTING card, destination plugin,
CLAUDE_PLUGIN_ROOT=/home/fdaiobue/projects/Pers/awards/plugins/awards, AWARDS_PLAYWRIGHT=<path>, cwd = repo root.
1 capture (SKILL.md:50). Frames identical or scrollMode wheel without change → rerun with --wheel 12000 --wait 6000 --timeout 90000.
  Preloader or consent wall in every frame → rerun once with --wait 4000 or --wait-for; record what you got.
2 curl index.html + at most six linked CSS/JS text files ≤ 2 MB into .awards/research/<slug>/; signature table SKILL.md:87-98.
3 curl the Awwwards entry to .awards/research/<slug>/awwwards.html; read award levels and dates, overall, D/U/C/Co, six developer
  sub-scores + DEV AWARD score, credits, tags. Fetch a CSSDA/FWA entry only when the card cites one. Label: [verified, Awwwards entry <date>].
4 Open every PNG with Read. Update the card in place: keep labels that hold, upgrade to [verified, <capture or file>] only with named
  evidence, correct what is wrong, add what changed on the site, §9 gets "Live pass <date>: reachable, exit code, scroll mode, sources".
Hard rules: no images, fonts, video, audio or 3D downloads; one document, no route crawling; quotes ≤ 25 words; card < 200 lines;
edit only that card and .awards/research/<slug>/; do not commit.
Return: reachability, exit code, scroll mode · DELTA list `field: old → new [evidence]` · technique attributions the live site
contradicts · the new _index.md row · anything blocked.
```

After each batch the main session: reads the three diffs for label discipline and quote length, updates the `_index.md` rows, pastes the deltas into the ledger, commits one commit per site (`docs(references): live-verify <slug>`). Named targets that must be closed: Why Zero SOTD date · Léo Parpeix "built by" credit · Floema contrast claim (`patterns/color-and-material.md:131`, hexes from live CSS) · Igloo ScrollTrigger `[contested]` · Slosh creator credit and ground colour · `seasats`/`trevor-noah`/`mindmarket` type and palette · Lama Lama entry identity and scores.

## Phase 4 — Propagate, re-derive, lint

1. For every ledger delta grep its consumers (`grep -rn "\[site:<slug>\]" plugins/awards/{references,skills,recipes}`) and fix statements the verified card contradicts; heaviest files are `references/patterns/*.md`. Fix `recipes/*/recipe.json` `seenIn` and the README "Seen in" text where an attribution fell (watch `mindmarket` × 3 recipes, `seasats` × `image-sequence-scrub`, `igloo` × 2).
2. `references/jury/rubric.md`: line 14 weighting → `[verified, Awwwards entry markup <date>]`; line 16 thresholds and line 66 calibration re-derived from the verified entries (min / median / max per axis, developer score range); add the mapping from Awwwards' six published developer criteria to the jury's five. Same numbers into `_index.md` "Calibration rows"; replace "lowest on every scored site" by the true count in `_index.md`, `skills/jury/SKILL.md:104`, `agents/awards-jury.md` if present; `decisions.md:22-23` gets a dated amendment line, not a rewrite.
3. `_index.md`: new last column `Last verified`; confidence legend rewritten (high = live render + entry read); delete the "No card was written from a live render" sentence once 19/19 are done.
4. New `scripts/lint-refs.mjs` (dependency-free, ~40 lines): every `[site:x]`, `[recipe:x]`, `[pattern:f#anchor]` and `${CLAUDE_PLUGIN_ROOT}/path` under `plugins/awards` resolves (skip the literal placeholders `slug`, `id`, `#section|component|archetype|model`); exit 1 on a miss. It fails now on the two P2 ids and goes green in Phase 6. Add to `CLAUDE.md` commands. Commit.

## Phase 5 — Evals, cheap half

**5a. Repair graders before spending anything.** First ask the `claude-code-guide` agent once: valid grader `type`s and `target`s, default target, whether `file_exists` and file targets accept globs, whether a command/script grader exists, meaning of `arm:` and with-only under ablation, how `--threshold` combines per-case scores. Then apply, conservatively where the docs are silent:

| Grader | Defect | Fix |
|---|---|---|
| `motion-pass-fadeup/scrub-is-linear` | passes on the untouched fixture (needs `scrub` before `ease`, fixture has the reverse) | delete; `no-eased-scrub-before` covers it, add its mirror `scrub[\s\S]{0,200}ease:\s*['"]power` as `not_contains` |
| `motion-pass-fadeup/pin-kept` | passes untouched | keep (guards a rewrite), note it is a guard |
| `motion-pass-fadeup/motion-score-written` | heading exists in the template | require a data row: `## Motion score\s*\n\|[^\n]*\n\|[-| ]+\n\|\s*[^|\s]` |
| `build-antarctic-site/contract-blocks` | passes on a verbatim template | add sibling `contract-not-template`: `not_contains` `the one idea this surface owns\|recognisable with every word removed\|the three nearest corpus cards` on `AWARDS.md` |
| `build-antarctic-site/divergence-names-cards` | matches literal `[site:slug]` | enumerate the 19 real slugs |
| `build-antarctic-site/no-generic-cta` | scans the trace; false-fails when the agent reads `anti-patterns.md` | target file `index.html`, flag `i` |
| `build-nav-component/*`, `build-webgl-hero/*` trace regexes (`Escape`, `focus\(`, `inert\|aria-modal`, `aria-hidden`, `dispose\(`, `getBoundingClientRect`, `setPixelRatio\(`, `prefers-reduced-motion`, `uncapped-dpr-absent`) | pass or fail on prose | file targets (`main.js`, `index.html`, `styles.css`; glob if supported), else anchor to tool input: `"(content\|new_string)"\s*:\s*"[^"]*<token>` |
| `research-unreachable/card-written` | glob in `file_exists`, support unknown | if unsupported: trace regex `"file_path"\s*:\s*"[^"]*\.awards/sites/[a-z0-9-]+\.md"` |
| `trigger-jury/{disposition-line,usability-axis}` | no `target:` | `target: last_message` like the build sibling |
| four scaffolded build cases | `add_dirs: [fixture]` exposes the committed fixture to Write/Edit | drop `add_dirs` there (the scaffold copies the fixture into the workspace); after every build run `git status -- plugins/awards/evals` must be clean |
| `evals/README.md` build command | lacks `WebFetch` | add it |

New `evals/selftest.mjs` (~40 lines, no deps): for every regex grader with a file target, run it against the untouched fixture file (or `assets/templates/AWARDS.md` for `AWARDS.md`) and assert it **fails**; guards are whitelisted by name. Free, runs in a second. Commit.

**5b. Six new smoke cases** (copy a sibling; prompts name no skill): `trigger-structure` ("what sections should this landing page have … hero that feels premium, footer, 404"), `trigger-ship` ("make it production-ready: run the audit, take the screenshots", fixture with an `AWARDS.md`), `trigger-concept` ("how would an award-winning studio approach a site for …, give me directions, no code"), `no-trigger-a11y-settings`, `no-trigger-figma-tailwind`, `no-trigger-crud-admin`. Smoke = 17 cases, all 11 skills covered.

**5c. Cheap smoke pass** (background): `cd plugins/awards && claude plugin eval . --tag smoke --runs 1 --ablation none --no-publish --trust-plugin -j 3 --max-cost-usd 8 --threshold 0.67 --json evals/results/smoke-r1.json`. Fix misses: description wording first (natural phrasing from the failing prompt, stay under the cap), grader second. Rerun only failures with `--case`. Commit per fix.

## Phase 6 — Plugin gaps (before the expensive runs, so those test final text)

**6a. `recipes/sound-toggle-opt-in/`.** Read `recipes/theme-swap-tokens/` and `references/patterns/sound.md` first; full recipe contract. No audio file: ambient bed and click synthesised with WebAudio (oscillators + filtered noise), levels from `sound.md`. `<button aria-pressed>` toggle, default off, **no `AudioContext` before a user gesture**, consent persisted in `localStorage` (after reload: state `armed`, context still created only on the first gesture), suspend on `visibilitychange`, 24 × 24 icon driven by an `AnalyserNode`, static under reduced motion, no dependency. `window.__awards.state()` → `{ sound: 'off'|'armed'|'on', context: null|'running'|'suspended' }`. `verify.mjs`: initial `off` + `context null`; click → `aria-pressed="true"`, `on`, `running`, storage set; reload → `armed`, `context null`; reduced-motion state → icon has no running animation; keyboard activation works. Never assert audible output.

**6b. `recipes/gl-msdf-text/`.** Constraint: recipes ship no font files. Build the glyph atlas **at runtime from the system stack**: Canvas 2D glyph raster + Felzenszwalb distance transform inline (~60 lines, no dependency), single-channel distance copied to RGB and sampled by a genuine MSDF fragment shader (`median(r,g,b)`, `fwidth` antialiasing, `#include <colorspace_fragment>`), so a production `msdf-bmfont` atlas is a drop-in. README states this plainly: runtime SDF, softer corners than true MSDF, how to swap the atlas, what the corpus sites do per their verified cards. DOM mirror: the same string as real selectable text under an `aria-hidden` canvas; no-WebGL and static reduced-motion tiers show the DOM text; DPR through `_shared/quality-tiers.js`; dispose on teardown. `verify.mjs`: mirror text equals the rendered string; `readPixels` finds ink inside the text rect (default framebuffer, fresh render in the same task); `--no-webgl` state shows DOM text; reduced motion static.

Both: catalogue rows in `recipes/README.md` (drop "no folder yet"), `seenIn` only for sites whose verified cards confirm the technique, make the seven citations true (`sound.md:43` tense, `webgl/SKILL.md:199` "planned", `webgl-architecture.md:150` "deferred"), `node scripts/verify-recipes.mjs --only sound-toggle-opt-in,gl-msdf-text`, `node scripts/audit.mjs recipes` 0 P0–P2, `lint-refs` green. One commit per recipe.

**6c. `allowed-tools`.** Ask `claude-code-guide` whether plugin skill frontmatter supports `Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*)` (variable expansion + wildcard). Supported → add to the skills that run scripts (`craft`, `research`, `ship`, `component`, `stack`, `concept` for `roll.mjs`; jury keeps its set plus this), validate, confirm in the Phase 8 run that no prompt appears. Not supported → leave prompts on, document the one-line settings allow rule in `plugins/awards/README.md`, record the finding in `decisions.md`.

## Phase 7 — Evals, expensive half (background, final text)

1. Full smoke with baseline: `claude plugin eval . --tag smoke --no-publish --trust-plugin -j 3 --max-cost-usd 40 --threshold 0.67 --json evals/results/smoke-full.json` (17 × 3 × 2 ≈ 102 runs).
2. Build tier once: `claude plugin eval . --tag build --scaffold --runs 1 --ablation none --no-publish --trust-plugin -j 2 --max-cost-usd 45 --keep-temp --json evals/results/build-r1.json --allow-tools Write Edit WebFetch Bash`; then `git status -- plugins/awards/evals` clean. (The per-command grants written here were tried on 2026-09-21 and denied every Bash call in every case: they match a command prefix, and the skills invoke `timeout 120 node …`, `cd … && …` and `node … | head`.) Rerun only failed cases after a fix.
3. **Pass bar** (none existed): every trigger case fires its skill in ≥ 2 of 3 runs; every no-trigger case is clean in 3 of 3 on both arms; the plugin arm beats the baseline on the scored graders of the jury case. Build: ≥ 80 % of a case's graders pass, and every failing grader is explained as a skill defect (fixed) or a grader defect (fixed). Record date, CLI version, per-case score, with/without delta and cost as a "Last run" table in `evals/README.md` (`results/` stays gitignored).

## Phase 8 — One real end-to-end build

Scratch directory outside the repo, network and Playwright available, background: `claude -p --plugin-dir /home/fdaiobue/projects/Pers/awards/plugins/awards --permission-mode acceptEdits --max-budget-usd 25 --output-format stream-json --verbose "<body of evals/build-antarctic-site/prompt.md>" > run.jsonl`. Check: `AWARDS.md` has all contract blocks with three real `[site:…]` cards and a seed; `DESIGN.md` and `src/styles/tokens.css` exist; `npm run build` passes; `audit.mjs <dir>` 0 P0–P1; `.awards/captures/manifest.json` has desktop, mobile and reduced-motion frames; `.awards/jury/<date>.md` exists and **the final message carries the literal `disposition:` line unchanged** (spec risk 2; if the fork loses it, implement the documented fallback in `skills/craft/SKILL.md`: spawn `awards-jury` through the Agent tool with the input packet); ship report written. Tighten wording in `craft`, `concept`, `jury` where the run stumbled; record the first real jury round in `state.md`. One rerun at most.

## Phase 9 — Docs, version, final verification

- `docs/handoff/state.md` rewritten to the new truth (what is verified live, this machine's environment, eval results, calibration outcome); `todo.md` pruned (done: 1, 2, 3, 5, 6, 7, 8, 10 dropped as never needed, 11, 12; open: real-device pass, adapters, scaffolds); `plan.md` untouched except a one-line pointer to `plan-0.2.md`.
- Counts: 28 → 30 recipes, 17 → 23 eval cases (17 smoke) in `CLAUDE.md`, `README.md`, `plugins/awards/README.md`, `evals/README.md`, manifests' descriptions where they count; corpus described as live-verified with the date.
- Version `0.2.0` in `plugins/awards/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together; release notes in `README.md`.
- Stop and report before any push or pull request.

## Verification (end to end)

```bash
cd /home/fdaiobue/projects/Pers/awards
claude plugin validate plugins/awards
cd plugins/awards
node scripts/verify-recipes.mjs                 # 30 / 30
node scripts/audit.mjs recipes                  # 0 P0–P2
node scripts/lint-refs.mjs                      # 0 misses
node evals/selftest.mjs                         # every file grader fails on untouched input
grep -L "Live pass 2026-" references/sites/[a-z]*.md      # prints nothing
wc -l references/sites/[a-z]*.md | awk '$2!="total" && $1>=200'   # prints nothing: every card < 200
grep -c "No card was written from a live render" references/sites/_index.md   # 0
git status --short                              # clean; evals/*/fixture untouched
```
Plus: ledger shows 19/19 done with entry URL, capture exit code and scroll mode; calibration table filled with the decision taken; `evals/README.md` "Last run" table meets the pass bar or explains each miss; Phase 8 artefacts listed in `state.md`; both manifests say 0.2.0.

## Budget and order of spend

Free first (Phases 0, 1, 5a, selftest, lint). Then the corpus pass (largest token cost: about 19 agent runs reading 7–9 images each, plus 7 jury runs). Model-billed eval spend is capped by flags: 8 + 40 + 45 + 25 USD ceilings. If the usage limit hits, stop at the last commit; the ledger and `evals/results/*.json` say where to resume.
