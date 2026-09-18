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
