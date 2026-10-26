# awards evals

Cases for `claude plugin eval`, in the `prompt.md` + `graders/*.md` layout. Six tiers, cheapest first:

- **smoke** (25 cases, read-only, cheap): twelve requests that must route to the right skill — one per skill, plus a new-site brief that names WebGL and GSAP and must still reach craft (`trigger-new-site-technique`) —, three that must take a deep mode (`--tag deep`), and ten that must not touch any awards skill: the six originals and four near misses (a blog font pairing, checkout QA, a modal fade-in, a SaaS pricing page's sections). Graded with `tool_used: Skill` matchers; the jury case also checks for a disposition line and the usability axis. Five of them ship a `fixture/` site staged by `fixture.sh`, so the tier needs `--scaffold`.
- **contract** (2 cases, a few dollars each): `contract-southbound` runs the Antarctic brief through brief, concept and system and stops, graded on the same contract graders as the full build plus the phase order (`tool_order`: craft before concept, concept before system), real colour tokens and no page written; `concept-deal-distinct` checks that the seeded roll ran, its seed is reported, and an `llm` judge fails twin cards. This is the tier for any change to the corpus, the templates, concept or system.
- **resume** (1 case): `resume-after-system` seeds a workspace stopped after the visual system and a two-turn history (`context.history_file`), then says "carry on": craft or structure must fire, the roll must not run again, the locked seed stays, and the page map gets its first filled row. The history file's format follows the Claude Code transcript but is not documented for evals; its first paid run is also the check that the runner accepts it.
- **route** (1 case, full tools, 30 turns): `route-full-tools-brief`, a long whole-site brief that names no process, graded only on whether `awards:craft` fires. The smoke prompts are one line with read-only tools; this is the case the `UserPromptSubmit` route hint (`scripts/route-hint.mjs`) is meant to lift to at least 2 / 3 (unled builds called no skill before it), with every `no-trigger-*` case still at 0.
- **coexist** (2 cases): this plugin beside GreenSock's official `gsap-skills` (`plugins: ["../..", "../_vendor/gsap-skills"]`). A plain GSAP API question must reach gsap-skills and no awards skill; an award-framed GSAP choreography request must still reach `awards:motion` or `awards:craft`. Fetch the pinned checkout once with `bash evals/_vendor-fetch.sh` (needs the network; `_vendor/` is gitignored). Without it the two cases fail to load and every other tier runs as usual.
- **build** (7 cases, expensive): the full site loop, a component pass, a WebGL hero, two jury runs, a motion pass and an unreachable-site research run. Fixture sites are seeded into the empty workspace by each case's `fixture.sh` (needs `--scaffold`). Graded with regexes over the produced files and the transcript plus one `llm` rubric where judgement is unavoidable. `jury-generic-saas/not-shipped` fails a jury that lets the template page through with `ship`; `jury-bland-clean` is the harder half: a studio page that passes the audit at P0–P3 and has no slop for the scan to name, only no idea, and the jury must hold Creativity at 6 or below and not ship it. The eval sandbox hides the user's home, npm and the network, so `build-antarctic-site` and both jury cases run `evals/stage-browser.sh`, which copies `recipes/node_modules`, Playwright and its headless Chromium into the workspace (`.awards/browsers/`, found by `scripts/lib/playwright.mjs`). Launch the tier with `AWARDS_PLAYWRIGHT` set; without it those cases end in `recapture`.

## Spend less

- **Pick by diff.** `node evals/pick.mjs [base-ref]` lists the cases a change exercises (a skill's graders, the smoke tier for any skill text, the jury cases for the jury agent and rubric, the browser cases for `audit`, `capture` and `doctor`, the contract tier for the corpus and templates) and prints the commands. It reads git and the case files only.
- **One run while iterating.** Routing is sampled, so a release still runs smoke at `--runs 3 --threshold 0.67`; between releases one run per case finds a broken route at a third of the cost.
- **Check that cases load for free.** `claude plugin eval . --case <name> --runs 1 --ablation none --trust-plugin --max-cost-usd 0` loads and validates the case (grader schemas, tool grants, scaffold flags) and stops at the ceiling before any model call.
- **Regrade a kept run.** Run with `--keep-temp`, then `node evals/regrade.mjs <case> <workspace> [--transcript <file.jsonl>]` re-runs the case's current `file_exists` and file-target `regex` graders, and its `tool_used`, `tool_order` and trace or last-message graders when a transcript is there, without a model call; `llm` graders are skipped. A grader fix is tried against a run already paid for before it costs another.

## Run
```bash
cd plugins/awards
claude plugin eval . --tag smoke --scaffold --runs 3 --threshold 0.67   # triggering, with the no-plugin baseline
# --scaffold is not optional here: five smoke cases name a fixture/ directory in their prompt, and
# only each case's fixture.sh puts it there. Without it the working directory is empty, the agent
# finds nothing at the path the prompt names, and the case measures how it copes with that instead
# of whether it routes. One run per case also cannot apply a threshold: routing is sampled, so the
# tier runs three times and 0.67 means two of three.
claude plugin eval . --tag smoke --runs 1 --ablation none          # cheap iteration on descriptions
claude plugin eval . --tag route --runs 3 --ablation none --allow-tools Write Edit WebFetch Bash   # unled brief: does it reach craft
claude plugin eval . --tag build --scaffold --runs 1 --ablation none \
  --allow-tools Write Edit WebFetch Bash
# Bash is granted whole, not as Bash(node *) and siblings. Those patterns match the command prefix,
# and the skills invoke `timeout 120 node …`, `cd … && …` and `node … | head -200`, none of which
# start with a granted word. The 2026-09-21 run was denied Bash on every call in every case, so
# capture.mjs and audit.mjs never executed and nothing was graded against a rendered page. The OS
# sandbox still confines the shell to the case workspace, and --scaffold already runs author bash.
```
Every run is a real model call on your account; the build tier can take 20–30 minutes per case. `results/` is gitignored.

The build cases run inside the eval sandbox, where `npm install` and Playwright captures usually cannot run; the prompts ask Claude to say so and continue, and the graders read the transcript and the files rather than a rendered page. Run the same prompts in a normal session with network access for the full loop.

## Last run

| Tier | Command | Date | CLI | Result | Cost |
|---|---|---|---|---|---|
| smoke | `--tag smoke --runs 1 --ablation none -j 3 --threshold 0.67` | 2026-09-18 | 2.1.51 | 15 / 17 | $9.20 |
| smoke | `--tag smoke --runs 3 --threshold 0.67` (both arms, 102 runs, 49 min) | 2026-09-18 | 2.1.276 | **13 / 17**, overall score 0.86, mean delta over baseline **+0.48** | $36.22 |
| smoke | `--case <name> --runs 3 --ablation none --scaffold` on the three unverified cases | 2026-09-21 | 2.1.278 | **3 / 3 each, every grader green** | $6.64 |
| deep | `--tag deep --runs 3 --ablation none` | 2026-10-05 | 2.1.289 | first pass gsap and 3d 3/3, shader 0/3 (routed to `awards:component`, which handed off to webgl only at build); after the component hand-off fix **3 / 3 each** | $5.32 |
| route | `--tag route --runs 3 --ablation none` | 2026-10-06 | 2.1.291 | **3 / 3** reached `awards:craft` against `250e141` (route hint on); every run then stopped at the 30-turn cap, which the grader ignores. No hint-off arm was run | $6.23 |
| build | `--tag build --scaffold --runs 1 --ablation none` | 2026-10-07 | — | nav, webgl-hero, research 1.00; motion 0.86 (grader defect, fixed); jury 0.71 and antarctic 0.25: no browser in the sandbox and the build landed in a subfolder (prompt and staging fixed, re-run pending) | $8.31 |
| build | `--case jury-generic-saas --scaffold --runs 1 --ablation none` + browser staged by `stage-browser.sh` | 2026-10-07 | — | **1.00**, 7 / 7 graders: real captures and scores, `not-shipped` passes. An earlier attempt the same day staged no Playwright (the runner passes no environment to the fixture; fixed) and ended in `recapture` at 0.71, $0.56 | $1.08 |
| build | `--case build-antarctic-site --scaffold --runs 1 --ablation none` + browser staged | 2026-10-07 | — | **interrupted, skipped, not scored**: the session ended at about 35 minutes, during the final jury; every file grader aborted | $7.97 |
| smoke | `--case` trigger-motion, trigger-webgl-hero, trigger-component-nav `--runs 3 --ablation none --scaffold` (0.5.0 regression) | 2026-10-05 | 2.1.289 | **3 / 3 each** | $3.21 |
| build | `--tag build --scaffold --runs 1 --ablation none -j 2 --keep-temp` + the documented `--allow-tools` set | 2026-09-21 | 2.1.278 | **2 / 6 cases all-green; 36 of 41 graders passed**, overall score 0.86 | $27.68 |
| build | same, re-run with `--allow-tools … Bash` working and four graders repaired | 2026-09-21 | 2.1.278 | **4 / 6 cases all-green; 39 of 41 graders passed**, overall score **0.95** | $41.43 |
| build | third run, after the `scope-respected` swap and the `motion-score-written` loosening | 2026-09-21 | 2.1.278 | **4 / 6 cases all-green; 40 of 42 graders passed**, overall score **0.96** | $44.37 |

> **Correction, 2026-09-21.** The first two build rows were recorded here as "47 of 53" and
> "50 of 53". Both were wrong — the tier has 41 graders, not 53, and the totals are 36 and 39. The
> figures were written into this file, the ledger, `state.md` and `todo.md` before anyone summed the
> per-case numbers. Count them from `evals/results/build-r*.json` rather than from prose.

Per case, from the **second** build run — the first is summarised under it. Every skill fired 1× in
every case in both runs; routing is not a problem anywhere in this tier.

| Case | Graders | Failure | Verdict |
|---|---|---|---|
| `build-antarctic-site` | **10 / 10** | — | 153 turns, 2,737 s, $27.31. It needed the raised timeout: the old 1800 s cap would have cut it off again |
| `build-webgl-hero` | 8 / 8 | — | pass |
| `jury-generic-saas` | 6 / 6 | — | the three repaired graders hold inside the tier |
| `research-unreachable` | 4 / 4 | — | the new branch holds inside the tier |
| `motion-pass-fadeup` | 6 / 7 | `motion-score-written` | **grader**: the pattern demanded the table sit directly under `## Motion score`, and this run wrote a sentence of rationale first. Loosened to allow prose without crossing into the next `##` section; re-run at **7 / 7** |
| `build-nav-component` | 5 / 6 | `scope-respected` | **grader, and the interesting one** — see below |

### An llm grader cannot audit a long run from `focus: trace`

`scope-respected` asked three judges to certify that the hero, work grid and footer were unchanged.
It failed 3 / 3 twice, on runs that had changed nothing: a diff of the first against the fixture
showed all three sections **byte-identical**, and the agent said so in its own final message.

The judges were right to refuse. The evidence an llm grader receives for `focus: trace` is
**truncated to about 25 lines** — 25 for a 44-turn run and 25 for a 51-turn one, the last line cut
mid-object. What reached the judge contained a single `Edit main.js` and none of the rest of the
file work. They were asked to affirm something the evidence did not contain.

No wording fixes that, and an attempt to reword it changed nothing. The grader is replaced by two
deterministic file guards, `hero-and-work-kept` and `footer-kept`, which is the mechanism this suite
already uses for "must not be deleted" (`pin-kept`, `images-remain`). Both are in `selftest.mjs`'s
`GUARDS` set, both hold on the untouched fixture, and both were checked against the exact run three
judges had failed: **they pass on it.** The keyboard requirements the old grader also carried are
already covered by `escape-closes`, `focus-management` and `overlay-accessible`.

**The lesson for this suite**: prefer a file target. Four of the six failures across the two build
runs came from a grader encoding how work is *presented* — the shape of a score line, which file a
marker sits in, whether a fix list leads with direction work, whether the table follows its heading —
rather than what the work *is*.

### What the first build run found

It scored 36 / 41 with **every Bash call denied**: `--allow-tools "Bash(node *)"` matches on the
command prefix, and the skills invoke `timeout 120 node …`, `cd … && …` and `node … | head -200`.
`capture.mjs` and `audit.mjs` never executed, so it measured written output only. With `Bash`
granted whole, the second run had `audit.mjs` returning a real `P0 1 · P1 5 · P2 8 · P3 6` and
`capture.mjs` exiting 3 for a missing Playwright, which is its documented path.

Its other findings are all closed: `pin-kept` retargeted to `index.html`, `scores-present` matched to
the format `skills/jury/SKILL.md` promises, `fixes-ordered-and-specific` no longer failing a reply
that correctly reaches `rebuild`, `research` given its missing branch for a host that cannot exist,
and `card-written` accepting either correct outcome.

**Not yet re-measured as a whole.** The 39 / 41 above predates the two grader repairs made after it,
and `build-nav-component` now has seven graders where it had six. Both repairs were verified on their
own; the tier has not been run again since.

All six negatives held 3/3 on both arms. Of the eleven triggering cases, seven fired 3/3 with the
plugin and 0/3 without it. The four that missed:

| Case | With | Without | What it was |
|---|---|---|---|
| `trigger-motion` | 0 / 3 | 0 / 3 | the fixture never reached the workspace |
| `trigger-component-nav` | 1 / 3 | 0 / 3 | the fixture never reached the workspace |
| `trigger-webgl-hero` | 2 / 3 | 0 / 3 | same; the failing run answered in **one turn**, exactly like every baseline run |
| `trigger-jury` | 3 / 3 fired, `usability-axis` 1 / 3 | 0 / 3 on `disposition-line`, 3 / 3 on `usability-axis` | the forked reply was never required to name the axes |

Both causes were fixed after the run (`b49d6a2`, `2dfa1e3`), and **all four cases have now been
re-run against the fixes and pass 3 / 3**: `trigger-webgl-hero` on 2026-09-18, the other three on
2026-09-21 at CLI 2.1.278. `trigger-jury` passes all three graders in all three runs, including the
`usability-axis` that missed 2 / 3 before.

Every bar in `docs/handoff/archive/plan-0.2.md` Phase 7 is therefore met for the smoke tier. One honest caveat: the four
repairs were measured case by case on the plugin arm, not by re-running the whole tier in one pass.
The other thirteen cases passed in the 2026-09-18 tier run and were not touched by either fix.

What the baseline arm bought, measured: every `skill-fired` grader scored 0 without the plugin, as
it must, since the skill does not exist there. The one informative comparison was `trigger-jury`,
where the baseline named the Usability axis in 3 / 3 runs and never produced the `disposition:`
line. `--ablation none` costs about half as much and loses that single comparison.

## Behavior regressions

These free checks run the shipped tools and real Chromium interactions. They complement the regex graders; they do not call a model or require an eval account.

```bash
# From plugins/awards/recipes, after npm ci and Playwright/Chromium setup:
node ../evals/behavior.mjs
node ../evals/behavior.mjs --only capture,doctor
node ../evals/behavior.mjs --only server,audit,tools,ticker  # browser-free subset
node ../evals/jury-evidence-selftest.mjs       # immutable jury evidence contract
node ../evals/visual-library-selftest.mjs      # visual references and recipe metadata
```

For Playwright installed elsewhere, set `AWARDS_PLAYWRIGHT` to its parent project directory. The full suite uses the installed Vite dependencies in `recipes/node_modules` to build the starter and menu into temporary directories; it deletes its fixtures/builds and leaves recipe verification stamps untouched. Run it serially, never beside `verify-recipes.mjs` or another browser. Browser launch or localhost restrictions are prerequisite failures, not skipped passes.

Groups cover static-server root containment, quick/URL audit semantics, ticker pause/resume and teardown, named captures (keyboard, pointer drag, reload persistence, cropping, invalid input and failure recovery), doctor failures and configuration preservation, starter readiness without WebGL and live reduced-motion changes, and the bundled menu's focus trap/Escape restoration. Since 1.0.0 they also cover the deal (`roll.mjs --engines`, `--stimulus`, `--choose`), the house ledger, picture search against a stubbed collection (`AWARDS_COLLECTION_OPENVERSE`), the frame rules L11–L15 and S11 on a bad and a good fixture, `capture.mjs --walk` with picture shares, and a tournament prepare and reveal with the blind jury reply. Exit 0 means all selected checks passed; exit 1 means a failure. Add a regression here when a tool can pass syntactically while its observable behavior is broken. Run the 36-entry recipe verifier as the compatibility pass; use `--only` for the six visual examples. `jury-evidence-selftest.mjs` and `visual-library-selftest.mjs` cover the new evidence and visual-reference contracts without model calls. Historical smoke/build results above remain separate from that deterministic verification.

## Blind tournament

```bash
node evals/tournament.mjs prepare --out <dir> --arm <brief>/<arm>=<build dir|url> … --seed <key>
node evals/tournament.mjs reveal --out <dir>
```

The one measure of whether the plugin makes pages strangers prefer: the frozen briefs in `visual/`, built by several arms (no plugin, awards, another skill), captured the same way, judged from frames under shuffled letters by the forked jury in `--blind` mode and at least one person, then revealed. Building the arms is a paid run and the maintainer's decision; the protocol is [visual/tournament.md](visual/tournament.md).

## Grader self-test
```bash
node evals/selftest.mjs      # free, about a second
```
Every regex grader with a file target is run against the untouched fixture (or, for `AWARDS.md`,
`assets/templates/AWARDS.md`) and must **fail** there: a grader that already passes before the
agent has done anything measures nothing. The exceptions are named in the script's `GUARDS` set —
graders whose job is to fail when something is *removed* (`pin-kept`, `images-remain`,
`contract-blocks`, `no-eased-scrub-after`); those must pass on untouched input instead.
A `last_message` grader listed in the script's `REPLIES` table is checked against written sample
replies instead: `jury-generic-saas/not-shipped` must fail a `ship` reply and pass `fix` and `rebuild`.
`node scripts/route-hint.mjs --selftest` does the same for the route hint: silent on every
`no-trigger-*` prompt, and on every award-framed prompt it names a skill that case's own Skill grader accepts.

## Adding a case
Copy a sibling directory, edit `prompt.md` (the body is exactly what Claude receives; no skill names), keep `case.yaml` for fixtures and tags, and prefer `regex`, `tool_used` and `file_exists` graders over `llm` ones. A prompt that names a path must have a `fixture.sh` that copies the fixture to that path: `context.add_dirs` only grants a read on a directory inside the case, it puts nothing in the working directory, and a case whose files never arrive silently measures the wrong thing. Trigger regexes accept both `craft` and `awards:craft` forms.
