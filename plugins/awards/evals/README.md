# awards evals

Cases for `claude plugin eval`, in the `prompt.md` + `graders/*.md` layout. Two tiers:

- **smoke** (11 cases, read-only, cheap): eight requests that must route to the right skill and three that must not touch any awards skill. Graded with `tool_used: Skill` matchers; the jury case also checks for a disposition line and the usability axis.
- **build** (6 cases, expensive): the full site loop, a component pass, a WebGL hero, a jury run, a motion pass and an unreachable-site research run. Fixture sites are seeded by each case's `fixture.sh` (needs `--scaffold`) and readable through `context.add_dirs`. Graded with regexes over the produced files and the transcript plus one `llm` rubric where judgement is unavoidable.

## Run
```bash
cd plugins/awards
claude plugin eval . --tag smoke                                   # triggering, with the no-plugin baseline
claude plugin eval . --tag smoke --runs 1 --ablation none          # cheap iteration on descriptions
claude plugin eval . --tag build --scaffold --runs 1 --ablation none \
  --allow-tools Write Edit "Bash(node *)" "Bash(npm *)" "Bash(npx *)" "Bash(ls *)" "Bash(cat *)" "Bash(mkdir *)"
```
Every run is a real model call on your account; the build tier can take 20–30 minutes per case. `results/` is gitignored.

The build cases run inside the eval sandbox, where `npm install` and Playwright captures usually cannot run; the prompts ask Claude to say so and continue, and the graders read the transcript and the files rather than a rendered page. Run the same prompts in a normal session with network access for the full loop.

## Adding a case
Copy a sibling directory, edit `prompt.md` (the body is exactly what Claude receives; no skill names), keep `case.yaml` for fixtures and tags, and prefer `regex`, `tool_used` and `file_exists` graders over `llm` ones. Trigger regexes accept both `craft` and `awards:craft` forms.
