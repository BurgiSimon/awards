# The blind tournament

The one measure of whether a change to the plugin makes better pages. Every other eval checks that the workflow runs, the contract is filled and the graders hold; none of them says whether a stranger prefers the result to what the model makes with no plugin at all. taste-skill's own record shows why this matters: across five blind rounds it lost to the no-skill baseline four times while passing every check of its own, and it caught up only by turning the jurors' reasons into rules (`docs/handoff/analysis-2026-10-26-taste-skill.md` §5.9). This plugin has not run one since its 0.3 pilot, which made zero Skill calls.

## What runs

- **Briefs.** The three frozen briefs in this folder, one per visitor mode: `kiln-nine` (persuade, assets supplied), `tidal-notes` (read) and `form-sound` (experience). Add one no-asset persuade brief when the round tests the picture path (R4); write it the same way, synthetic and frozen before any build.
- **Arms.** At least three: no plugin; awards (`craft --quick` on every brief, plus one full build where the budget allows); and one other public design skill, pinned to a commit (taste-skill at `12af471` was the comparison in the 2026-10-26 analysis). Same model, same effort, same turn and cost caps, same tools, a fresh workspace per build, no human touch between the prompt and the capture. A build that never fired its skill is still an arm's build; record that it did not fire.
- **Capture.** `node evals/tournament.mjs prepare --out <dir> --arm kiln-nine/none=<dir> --arm kiln-nine/awards=<dir> --arm kiln-nine/other=<dir> … --seed <key>` captures every build with the same flags (five scroll stops at desktop, tablet and phone, plus reduced motion), copies only the frames into `blind/<letter>/` and keeps the key in `.private/key.json`.
- **Judges.** Two kinds, and both are required:
  - a forked jury in blind mode (`/awards:jury --blind <dir>`), which reads only the lettered frames and writes `judgements/jury-<date>.json`;
  - at least one person, who fills `review.md` and writes `judgements/<name>.json`. A score, a ranking or a same-tool group without its reason is not counted; the 2026-09-22 pilot's blank reasons are why.
- **Reveal.** `node evals/tournament.mjs reveal --out <dir>` maps letters back to arms and writes `reveal.json`: the weighted mean and the four axes per arm, wins per brief, and the same-tool precision (how often judges grouped one arm's builds together, which is the plain measure of a house style).

## Cost and when to run

About nine builds per round (three briefs × three arms). The full build case measured $24–32 and 129–153 turns; quick mode is cheaper and unmeasured. Budget $100–200 per round; it is the maintainer's decision (review item C13). Run a round before a release that changes concept, system, structure or the slop scan, and after a corpus wave that changes the cards concept reads first.

## Turning reasons into changes

- Read every reason in `reveal.json` verbatim, grouped by arm. A reason that appears for two or more builds is a finding.
- A finding against awards becomes one of: a row in `references/patterns/house-tells.md` (when judges group awards builds by it), a rule or a measurement in `scripts/audit.mjs` (when a browser can see it), a line in a skill's Refuse list, or a recipe change. Record which in `docs/handoff/state.md` with the round's seed.
- A finding in another arm's favour that awards cannot answer is a todo item with the reasons attached, not a rule written on the spot.
- Never re-run a round until the result changes; a second round on the same briefs measures memory of the briefs, so rotate one brief per round.

## Limits

- Model jurors share blind spots with model builders; the person's column is the check on that.
- One juror per brief carries about half a point of noise (taste-skill's estimate); read a difference under that as a tie.
- Headless captures say nothing about frame rate, sound or a real phone.
