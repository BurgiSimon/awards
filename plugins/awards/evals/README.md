# awards evals

Cases for `claude plugin eval`, in the `prompt.md` + `graders/*.md` layout. Two tiers:

- **smoke** (17 cases, read-only, cheap): eleven requests that must route to the right skill — one per skill — and six that must not touch any awards skill. Graded with `tool_used: Skill` matchers; the jury case also checks for a disposition line and the usability axis. Five of them ship a `fixture/` site staged by `fixture.sh`, so the tier needs `--scaffold`.
- **build** (6 cases, expensive): the full site loop, a component pass, a WebGL hero, a jury run, a motion pass and an unreachable-site research run. Fixture sites are seeded into the empty workspace by each case's `fixture.sh` (needs `--scaffold`). Graded with regexes over the produced files and the transcript plus one `llm` rubric where judgement is unavoidable.

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
claude plugin eval . --tag build --scaffold --runs 1 --ablation none \
  --allow-tools Write Edit WebFetch "Bash(node *)" "Bash(npm *)" "Bash(npx *)" "Bash(ls *)" "Bash(cat *)" "Bash(mkdir *)"
```
Every run is a real model call on your account; the build tier can take 20–30 minutes per case. `results/` is gitignored.

The build cases run inside the eval sandbox, where `npm install` and Playwright captures usually cannot run; the prompts ask Claude to say so and continue, and the graders read the transcript and the files rather than a rendered page. Run the same prompts in a normal session with network access for the full loop.

## Last run

| Tier | Command | Date | CLI | Result | Cost |
|---|---|---|---|---|---|
| smoke | `--tag smoke --runs 1 --ablation none -j 3 --threshold 0.67` | 2026-09-18 | 2.1.51 | 15 / 17 | $9.20 |
| smoke | `--tag smoke --runs 3 --threshold 0.67` (both arms, 102 runs, 49 min) | 2026-09-18 | 2.1.276 | **13 / 17**, overall score 0.86, mean delta over baseline **+0.48** | $36.22 |
| smoke | `--case <name> --runs 3 --ablation none --scaffold` on the three unverified cases | 2026-09-21 | 2.1.278 | **3 / 3 each, every grader green** | $6.64 |
| build | never run | — | — | — | — |

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

Every bar in `plan-0.2.md` Phase 7 is therefore met for the smoke tier. One honest caveat: the four
repairs were measured case by case on the plugin arm, not by re-running the whole tier in one pass.
The other thirteen cases passed in the 2026-09-18 tier run and were not touched by either fix.

What the baseline arm bought, measured: every `skill-fired` grader scored 0 without the plugin, as
it must, since the skill does not exist there. The one informative comparison was `trigger-jury`,
where the baseline named the Usability axis in 3 / 3 runs and never produced the `disposition:`
line. `--ablation none` costs about half as much and loses that single comparison.

## Grader self-test
```bash
node evals/selftest.mjs      # free, about a second
```
Every regex grader with a file target is run against the untouched fixture (or, for `AWARDS.md`,
`assets/templates/AWARDS.md`) and must **fail** there: a grader that already passes before the
agent has done anything measures nothing. The exceptions are named in the script's `GUARDS` set —
graders whose job is to fail when something is *removed* (`pin-kept`, `images-remain`,
`contract-blocks`, `no-eased-scrub-after`); those must pass on untouched input instead.

## Adding a case
Copy a sibling directory, edit `prompt.md` (the body is exactly what Claude receives; no skill names), keep `case.yaml` for fixtures and tags, and prefer `regex`, `tool_used` and `file_exists` graders over `llm` ones. A prompt that names a path must have a `fixture.sh` that copies the fixture to that path: `context.add_dirs` only grants a read on a directory inside the case, it puts nothing in the working directory, and a case whose files never arrive silently measures the wrong thing. Trigger regexes accept both `craft` and `awards:craft` forms.
