# Expand Corpus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Tasks 1–3 suit subagents. Tasks 4–5 run the finished skill and must run in the main session**: they spawn subagents and ask the maintainer questions.

**Goal:** Ship the repo-local maintainer skill `/expand-corpus`, pilot it on four sites, then run wave 2 over the queue in `awardsworthysites.md`.

**Architecture:** One `SKILL.md` under `.claude/skills/expand-corpus/`, phased (setup, triage, synthesis, recipes, stacks, upkeep). Per-site subagents follow the working-tree copy of `plugins/awards/skills/research/SKILL.md`. State lives in one ledger, `docs/handoff/corpus-ledger.md`. Only the main session writes shared files. No new scripts: existing `capture.mjs`, `lint-refs.mjs`, `verify-recipes.mjs`, `audit.mjs` and `claude plugin validate` do the mechanical work.

**Tech Stack:** Claude Code skills (Markdown + YAML frontmatter), Node 20.19+/22.12+ one-liners for checks, Playwright via `AWARDS_PLAYWRIGHT`, git.

**Spec:** `docs/superpowers/specs/2026-09-23-expand-corpus-design.md`

**Deviations from the spec (sequencing only):**
- The spec puts the `_TEMPLATE.md` row in skill phase 0 and the count-free wording in skill phase 5. Both are one-time edits, so Task 1 does them now. The skill then carries only steps that recur every wave.
- The root `README.md:187` line ("All nineteen entries were loaded…") stays. It is the 0.2 release note, a dated historical fact, not a live count.

## Global Constraints

- Every rule of `awards:research` holds unchanged: confidence labels on every hex, date, score, library and credit; site copy in fragments of at most 25 words; no asset downloads; cards under 200 lines; the nine template sections.
- No card is written from recall. A site that resolves but cannot be captured waits in the queue as `blocked`.
- Novelty decides inclusion; the rating is recorded, never a gate.
- Browser work runs serially where the repository says it must: no `verify-recipes.mjs` beside any capture, no `evals/behavior.mjs` beside either.
- No model identifiers in any committed file. Commit messages end with the session's attribution footer.
- Work happens on branch `feat/corpus-wave-2` (already created, spec committed as `7dab584`).
- Skill descriptions stay under 1,536 characters.
- Every command that drives a browser runs with `AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"` exported in the same shell call (recorded in `docs/handoff/state.md`; shell state does not persist between calls).

## File map

| File | Change | Task |
|---|---|---|
| `plugins/awards/references/sites/_TEMPLATE.md` | add `Corpus rating` row | 1 |
| `plugins/awards/references/sites/_index.md` | count-free title | 1 |
| `plugins/awards/skills/concept/SKILL.md` | count-free description | 1 |
| `plugins/awards/skills/structure/SKILL.md` | count-free description | 1 |
| `plugins/awards/skills/craft/SKILL.md` | count-free line 16 | 1 |
| `plugins/awards/skills/stack/SKILL.md` | count-free line 35 | 1 |
| `plugins/awards/evals/build-antarctic-site/graders/divergence-names-cards.md` | count-free prose | 1 |
| `.claude/skills/expand-corpus/SKILL.md` | new: the maintainer skill | 2, 3 |
| `docs/handoff/corpus-ledger.md` | new, created by the skill's setup phase | 4 |
| cards, `_index.md`, patterns, recipes, stacks, `awardsworthysites.md` | written by the skill | 4, 5 |

---

### Task 1: One-time count-free wording and the template row

**Files:**
- Modify: `plugins/awards/references/sites/_TEMPLATE.md` (after the `| Awards |` row)
- Modify: `plugins/awards/references/sites/_index.md:1`
- Modify: `plugins/awards/skills/concept/SKILL.md:3`
- Modify: `plugins/awards/skills/structure/SKILL.md:3`
- Modify: `plugins/awards/skills/craft/SKILL.md:16`
- Modify: `plugins/awards/skills/stack/SKILL.md:35`
- Modify: `plugins/awards/evals/build-antarctic-site/graders/divergence-names-cards.md:8`

**Interfaces:**
- Produces: the `Corpus rating` row name, exactly `| Corpus rating |`, which the skill's card check greps for (Task 2).

- [ ] **Step 1: Write the failing check**

Run from the repo root:

```bash
grep -rnE "19 analysed|across 19 award|nineteen analysed|Corpus index — 19|nineteen real corpus" plugins/awards/skills plugins/awards/references/sites/_index.md plugins/awards/evals/build-antarctic-site/graders; grep -c "^| Corpus rating |" plugins/awards/references/sites/_TEMPLATE.md
```

- [ ] **Step 2: Confirm it fails**

Expected: 6 matching lines (concept:3, structure:3, craft:16, stack:35, `_index.md:1`, grader:8), then `0`.

- [ ] **Step 3: Make the edits**

`_TEMPLATE.md`: insert this row directly after the line starting `| Awards |`:

```
| Corpus rating | D x.x / U x.x / C x.x / Co x.x → weighted x.xx, YYYY-MM-DD [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
```

`_index.md:1`: replace
`# Corpus index — 19 analysed award-winning sites, plus one clone-level reference`
with
`# Corpus index — analysed award-winning sites, plus one clone-level reference`

`concept/SKILL.md:3`: replace `grounded in 19 analysed award-winning sites` with `grounded in a corpus of analysed award-winning sites`.

`structure/SKILL.md:3`: replace `seen across 19 award-winning sites` with `seen across the analysed award-winning sites`.

`craft/SKILL.md:16`: replace `(19 analysed winners, \`${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md\`)` with `(the analysed winners in \`${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md\`)`.

`stack/SKILL.md:35`: replace `The nineteen analysed sites ran Vite + vanilla` with `The analysed sites run Vite + vanilla`.

`divergence-names-cards.md:8`: replace `untouched copy. Only the nineteen real corpus slugs count.` with `untouched copy. Only real corpus slugs count; extend the alternation when the corpus grows.`

Leave every "nineteen of the twenty verified entries" line alone: those are dated calibration facts.

- [ ] **Step 4: Confirm it passes**

```bash
grep -rnE "19 analysed|across 19 award|nineteen analysed|Corpus index — 19|nineteen real corpus" plugins/awards/skills plugins/awards/references/sites/_index.md plugins/awards/evals/build-antarctic-site/graders; grep -c "^| Corpus rating |" plugins/awards/references/sites/_TEMPLATE.md
node -e 'for (const s of ["concept","structure"]) { const t=require("fs").readFileSync(`plugins/awards/skills/${s}/SKILL.md`,"utf8"); const d=t.match(/^description: "(.*)"$/m)[1]; console.log(s, d.length); if (d.length>=1536) process.exit(1) }'
node plugins/awards/scripts/lint-refs.mjs | tail -1
claude plugin validate plugins/awards
```

Expected: no grep lines, then `1`; both description lengths under 1536; `0 dangling reference(s)`; validate passes.

- [ ] **Step 5: Commit**

```bash
git add plugins/awards
git commit -F - <<'EOF'
docs(awards): make corpus size count-free and add the corpus rating row

The corpus is about to grow past nineteen sites; descriptions and titles
no longer name a number. Cards gain a Corpus rating header row for the
plugin's own rubric score beside the official award scores.

<session attribution footer>
EOF
```

---

### Task 2: The skill, part 1 (frontmatter, rules, resume, setup, triage)

**Files:**
- Create: `.claude/skills/expand-corpus/SKILL.md`

**Interfaces:**
- Consumes: the `| Corpus rating |` row name from Task 1.
- Produces: these literal headings, which Task 3 appends after and Task 4 relies on: `## Rules that hold in every phase`, `## Resume`, `## Setup`, `## Phase: triage`, `### Subagent prompt: site`, `### Card checks`. Ledger statuses `queued|added|skipped|blocked|failed`, ledger phase names `setup|triage|synthesis|recipes|stacks|upkeep`, and the ledger path `docs/handoff/corpus-ledger.md`.

- [ ] **Step 1: Write the failing check**

```bash
node -e '
const fs=require("fs"), f=".claude/skills/expand-corpus/SKILL.md";
if(!fs.existsSync(f)){console.log("missing file");process.exit(1)}
const t=fs.readFileSync(f,"utf8");
const fm=t.match(/^---\n([\s\S]*?)\n---\n/); if(!fm){console.log("no frontmatter");process.exit(1)}
for (const k of ["name: expand-corpus","disable-model-invocation: true","argument-hint:","description:"]) if(!fm[1].includes(k)) {console.log("frontmatter lacks",k);process.exitCode=1}
const need=["## Rules that hold in every phase","## Resume","## Setup","## Phase: triage","### Subagent prompt: site","### Card checks"];
for (const h of need) if(!t.includes("\n"+h+"\n")) {console.log("missing",h);process.exitCode=1}
'
```

- [ ] **Step 2: Confirm it fails**

Expected: `missing file`, exit 1.

- [ ] **Step 3: Write the file**

Write `.claude/skills/expand-corpus/SKILL.md` with exactly this content (the `{…}` fields inside the subagent prompt are fill-ins the skill's operator substitutes at run time, not plan gaps):

````markdown
---
name: expand-corpus
description: Maintainer procedure for growing the awards plugin's reference corpus from awardsworthysites.md. Rates every queued site, admits the ones that add something new as site cards, then carries the new material into patterns, recipes, stacks and counts. Only for this repository, only when invoked as /expand-corpus.
argument-hint: "[--limit N] [--only slug,…] [--phase setup|triage|synthesis|recipes|stacks|upkeep]"
disable-model-invocation: true
---

# expand-corpus — grow the reference corpus

Arguments: `$ARGUMENTS`

Design: `docs/superpowers/specs/2026-09-23-expand-corpus-design.md`. This skill belongs to the repository's maintainer. It is not part of the plugin and never ships.

`REPO` below is the absolute path of this checkout's root, `PLUGIN` is `REPO/plugins/awards`. `PLUGIN` is the value of `${CLAUDE_PLUGIN_ROOT}` in every path the research skill names.

## Rules that hold in every phase

- Every rule of `PLUGIN/skills/research/SKILL.md` holds: a label on every hex, date, score, library and credit; site copy only in fragments of at most 25 words; no downloads of images, fonts, video, audio or models; cards under 200 lines with the header table and all nine sections.
- **No card from recall.** A site that resolves but cannot be captured waits in the queue as `blocked`. This departs from research §3 on purpose: every recall-based card of wave 1 needed a live re-verification pass.
- **Novelty decides inclusion. The rating is recorded, never a gate.**
- **Single writer.** Subagents write only the files their prompt names. Only this session edits `PLUGIN/references/sites/_index.md`, `docs/handoff/corpus-ledger.md` and `awardsworthysites.md`, so parallel subagents never race on a shared file.
- **Browsers.** Every command that drives a browser runs with `export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"` in the same shell call. Never run `verify-recipes.mjs` beside a capture, nor `evals/behavior.mjs` beside either. While a triage batch runs, start no browser here.
- **Git.** Work on branch `feat/corpus-wave-2`; create it from `main` if it is absent. Commit after every triage batch and every phase. Commit messages name no model and end with the session's attribution footer.

## Resume

Read `docs/handoff/corpus-ledger.md`. If it does not exist, run Setup. Otherwise take its last `## Wave` section and continue at the first row of its phase table not marked `done`. When every phase of the last wave is `done` and `awardsworthysites.md` holds URLs under `# not reviewed` or `# new stack` that the ledger does not list, run Setup again for a new wave.

- `--phase <name>` runs that phase only.
- `--only slug,…` or `--limit N` narrows triage. **A narrowed run does triage and synthesis for its sites only, then stops with the report in "Narrowed-run report" and leaves both phases `open`.** The pilot is the first narrowed run of a wave.

## Setup

1. Check prerequisites; Playwright and Chromium must both report `PASS`:
   ```bash
   export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"; node PLUGIN/scripts/doctor.mjs REPO
   ```
   A `FAIL` stops the run: report it and ask the maintainer to fix the Playwright location.
2. Create or extend `docs/handoff/corpus-ledger.md`. The file starts with this header once:
   ```markdown
   # Corpus ledger

   Maintained by `/expand-corpus` (`.claude/skills/expand-corpus/SKILL.md`). Resume at the last wave's first phase not marked `done`.
   ```
   Then append one wave section, with `<n>` one more than the last wave number in the file (the first wave written here is 2; wave 1 is the original nineteen in `docs/handoff/plan.md`):
   ```markdown
   ## Wave <n> — opened YYYY-MM-DD

   | Phase | Status | Note |
   |---|---|---|
   | setup | done | |
   | triage | open | |
   | synthesis | open | |
   | recipes | open | |
   | stacks | open | |
   | upkeep | open | |

   ### Sites

   | Slug | URL | Status | Rating | Novelty | Synthesised | Reason | Date |
   |---|---|---|---|---|---|---|---|

   ### Techniques and stacks

   ### Notes
   ```
3. Commit: `docs(corpus): open wave <n> ledger`.

## Phase: triage

1. **Queue.** Read `awardsworthysites.md`. Sites are the bullets under `# not reviewed`; the stack queue is the bullets under `# new stack` (handled in the stacks phase). Every site URL not yet in the current wave's Sites table gets a row with status `queued`.
2. **Slug.** Host name without `www.` and without the public suffix (`co.uk` counts as one suffix), remaining dots to hyphens, lower-case kebab-case: `why.zero.university` → `why-zero`, `911rennsport.co.uk` → `911rennsport`, `boc.studio` → `boc`. If the slug is already a file in `PLUGIN/references/sites/` or a row in any wave, append the next host label to the left.
3. **Selection.** Rows with status `queued` or `blocked`, narrowed by `--only` (slugs) or `--limit N` (first N in table order). `blocked` rows get one retry per run.
4. **Orphans.** A selected slug whose card file already exists while its row is `queued` or `blocked` is left over from a killed run; the subagent overwrites it.
5. **Batches of four.** Spawn up to four `general-purpose` Agent calls in one message, one site each, with the prompt in "Subagent prompt: site". Wait for all of them before the next batch.
6. **Per output block:**
   - `added`: run "Card checks". A failing check goes back to the same subagent once through SendMessage with the failing lines; if it still fails, delete the card and record `blocked`, reason `card failed checks: <which>`.
   - `added`: append `index_row` as the last row of the table in `PLUGIN/references/sites/_index.md` (the table ends before `## Picking neighbours`). It must have the table's twelve cells.
   - Every status: update the Sites row (status, rating, novelty hits separated by `; `, reason, date; `Synthesised` stays empty). Append each `techniques` and `stack_signatures` line to `### Techniques and stacks` prefixed with `<slug>: `.
   - `awardsworthysites.md`: move the bullet from `# not reviewed` to `# Reviewed and in Skill` (added) or to `# Reviewed, not added` (skipped; create that section after `# Reviewed and in Skill` if absent, bullet suffixed ` — <reason>`). A `failed` bullet stays and gets ` (host does not resolve)`. A `blocked` bullet stays unchanged.
7. **After each batch:** `node PLUGIN/scripts/lint-refs.mjs` must end with `0 dangling reference(s)`. Commit `docs(corpus): wave <n> triage — <slugs>`.
8. **Done** when no selected row is `queued`. For an un-narrowed run, when no row at all is `queued`: mark `triage` `done` (blocked rows keep their reason).

### Subagent prompt: site

Send this with the fields filled in:

```
You are adding one site to the awards plugin's reference corpus. Work alone and write only the files named here.

Site: {url}
Slug: {slug}
Date: {YYYY-MM-DD}
REPO: {repo}
PLUGIN: {repo}/plugins/awards  (the value of ${CLAUDE_PLUGIN_ROOT} in every path the research skill names)
Slugs already added this wave (they count as corpus): {comma-separated or "none"}

Every shell call that drives a browser starts with:
export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb";

1. Read PLUGIN/skills/research/SKILL.md and PLUGIN/references/README.md in full. You follow research §2, §4, §5 and §6 with destination `--to plugin`. Return research §7's index row instead of writing it, and skip its Hand-off.
2. Capture per research §2 into REPO/.awards/research/{slug}/ and inspect the source per §4.
   - The host does not resolve (ENOTFOUND, NXDOMAIN): stop, status failed.
   - It resolves but capture.mjs exits 3 or 4, answers 403, or times out after research's one wheel/wait retry: stop, status blocked. Never write a card from memory.
3. Rate. Read PLUGIN/references/jury/rubric.md. Score Design, Usability, Creativity and Content on its anchors, from the captures and research §6's walk. Weighted = D×0.4 + U×0.3 + C×0.2 + Co×0.1, two decimals, label [inferred]. The award entry page answers curl with 403; if you can read it through headless Chromium, record its published scores separately as [verified, entry page]. Otherwise official is none. The rating never decides inclusion.
4. Novelty. Read PLUGIN/references/sites/_index.md, the title and tags of every PLUGIN/recipes/*/recipe.json, the file names in PLUGIN/references/stacks/, and the headings of PLUGIN/references/patterns/*.md. Record each hit as `<type>: <what> — checked against <nearest card, recipe, stack or pattern>`:
   class — the site's class has at most one card in the index
   model — the class together with the site's narrative model, scroll model or WebGL dosage is absent from the index
   technique — an effect or interaction the site has is covered by no recipe and no pattern section
   stack — a library or framework it uses has no stack note
   world — its type contract or palette strategy appears in no index row
5. At least one hit: write PLUGIN/references/sites/{slug}.md from _TEMPLATE.md per research §5 and §6, including the Corpus rating row, overwriting any file already there. Run research's Verify list on it and fix what fails. No hit: write no card; status skipped.
6. Reply with exactly this block and nothing else:

slug: {slug}
status: added | skipped | blocked | failed
rating: D x.x / U x.x / C x.x / Co x.x → w x.xx [inferred]; official: <scores [verified, entry page]> | none
novelty: <hit>; <hit> | none
index_row: | `{slug}` | … |   (added only: the twelve columns of _index.md, in order)
techniques:
<name> — <evidence file> — <parameters>
stack_signatures:
<library@version> — <evidence file>
reason: <one line>   (skipped, blocked, failed)
```

### Card checks

Run for each `added` slug; every command must print nothing unless noted:

```bash
f=PLUGIN/references/sites/<slug>.md
[ "$(wc -l < "$f")" -lt 200 ] || echo "over 200 lines"
for n in 1 2 3 4 5 6 7 8 9; do grep -q "^## $n\. " "$f" || echo "missing section $n"; done
grep -q "^| Corpus rating |" "$f" || echo "missing Corpus rating row"
grep -nE '#[0-9a-fA-F]{3,6}\b' "$f" | grep -vE '\[(verified|recalled|inferred|unknown)'
```

The last line prints hex values with no label on their line. After the index row is appended, `grep -c '^| `<slug>` |' PLUGIN/references/sites/_index.md` must print `1`. Then read the card once for quotes over 25 words; the slug must be identical in the file name, the index row and every `[site:<slug>]` in the card.
````

- [ ] **Step 4: Confirm the check passes**

Run the Step 1 command again. Expected: no output, exit 0.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/expand-corpus/SKILL.md
git commit -F - <<'EOF'
feat(corpus): add expand-corpus maintainer skill, setup and triage

<session attribution footer>
EOF
```

---

### Task 3: The skill, part 2 (synthesis, recipes, stacks, upkeep, report, done)

**Files:**
- Modify: `.claude/skills/expand-corpus/SKILL.md` (append after `### Card checks` and its body)

**Interfaces:**
- Consumes: the headings, statuses, ledger layout (`Synthesised` column, `### Techniques and stacks`, `### Notes`) and the `PLUGIN`/`REPO` names from Task 2.
- Produces: the headings `## Phase: synthesis`, `## Phase: recipes`, `## Phase: stacks`, `## Phase: upkeep`, `## Narrowed-run report`, `## Done`, which Task 4 follows.

- [ ] **Step 1: Write the failing check**

```bash
node -e '
const t=require("fs").readFileSync(".claude/skills/expand-corpus/SKILL.md","utf8");
const need=["## Rules that hold in every phase","## Resume","## Setup","## Phase: triage","### Subagent prompt: site","### Card checks","## Phase: synthesis","### Subagent prompt: synthesis","## Phase: recipes","### Subagent prompt: recipe","## Phase: stacks","## Phase: upkeep","## Narrowed-run report","## Done"];
let last=-1; for (const h of need){const i=t.indexOf("\n"+h+"\n"); if(i<0){console.log("missing",h);process.exitCode=1} else if(i<last){console.log("out of order",h);process.exitCode=1} else last=i}
const lines=t.split("\n").length; console.log("lines",lines); if(lines>320) process.exitCode=1;
'
```

- [ ] **Step 2: Confirm it fails**

Expected: `missing ## Phase: synthesis` and the headings after it, exit 1.

- [ ] **Step 3: Append this content to the end of the file**

````markdown

## Phase: synthesis

1. Collect the `added` rows of the current wave whose `Synthesised` cell is empty. If there are none, mark the phase `done` (un-narrowed run) and move on.
2. Spawn one `general-purpose` subagent with the prompt in "Subagent prompt: synthesis".
3. Check its work:
   ```bash
   node PLUGIN/scripts/lint-refs.mjs | tail -1
   node -e 'const fs=require("fs"),p=process.argv[1];const slugs=new Set(fs.readdirSync(p+"/references/sites").filter(f=>/^[a-z0-9].*\.md$/.test(f)).map(f=>f.slice(0,-3)));let bad=0;for(const d of fs.readdirSync(p+"/recipes")){const f=`${p}/recipes/${d}/recipe.json`;if(!fs.existsSync(f))continue;for(const s of JSON.parse(fs.readFileSync(f)).seenIn||[])if(!slugs.has(s)){console.log("seenIn",d,s);bad=1}}process.exit(bad)' PLUGIN
   git diff --stat
   ```
   The first must end `0 dangling reference(s)`; the second prints nothing. Read `git diff` of `PLUGIN/references/`: every added claim cites a real `[site:<slug>]` of this wave and carries a label, and no site copy runs past 25 words.
4. Write the subagent's duplicate notes under `### Notes`, tick `Synthesised` (`yes`) on the rows it covered, and commit `docs(corpus): wave <n> synthesis — <slugs>`.
5. Un-narrowed run: mark `synthesis` `done`.

### Subagent prompt: synthesis

```
You are folding new site cards into the awards plugin's pattern language. Work alone.

REPO: {repo}
PLUGIN: {repo}/plugins/awards
New cards: {PLUGIN/references/sites/<slug>.md, one per line}
Technique and stack lines for them (from the ledger):
{lines}

1. Read PLUGIN/references/README.md for the citation and label rules, then every new card in full.
2. Read the headings of PLUGIN/references/patterns/*.md, PLUGIN/references/reflex-lists.md and PLUGIN/references/anti-patterns.md, and the whole file wherever a card adds something.
3. Where a new card adds a component, hero archetype, narrative structure, motion parameter, WebGL technique, colour or type strategy, face or cliché that the file lacks, add it in that file's register: one entry or table row, citing [site:<slug>], with the card's confidence label. Extend an existing entry with the new citation instead of duplicating it. No site copy beyond 25-word fragments, no hexes that are not in the card.
4. For each PLUGIN/recipes/*/recipe.json whose technique a new card shows with evidence, add the slug to `seenIn`. Touch nothing else in recipe.json.
5. Edit only files under PLUGIN/references/patterns/, PLUGIN/references/reflex-lists.md, PLUGIN/references/anti-patterns.md and recipe.json seenIn arrays.
6. Reply with: one line per edit (`file — what — [site:<slug>]`), then `duplicates:` followed by any two new cards (or a new card and an existing one) that turned out to cover the same ground, with the reason, or `none`.
```

## Phase: recipes

1. **Candidates.** From `### Techniques and stacks` of the current wave and the synthesis edits, list every technique no existing recipe covers (compare with the titles and tags of `PLUGIN/recipes/*/recipe.json` and the catalogue in `PLUGIN/recipes/README.md`). Rank by the number of added sites that show it, then by how many skills would cite it.
2. **Proposals file.** Write `docs/handoff/recipe-proposals-<YYYY-MM-DD>.md`, one entry per candidate:
   ```markdown
   ## <rank>. `<recipe-id>` — <title>
   - Seen in: <slug>, <slug>
   - Tier: P0 | P1 | P2 · Deps: <pinned packages from PLUGIN/recipes/package.json, or a new pin with its reason>
   - Overlap: <nearest existing recipe and what this adds>
   - Verify idea: <the state and the assertion that fail when the technique breaks>
   ```
   Commit `docs(corpus): wave <n> recipe proposals`.
3. **Maintainer gate.** Ask with AskUserQuestion, `multiSelect: true`, four candidates per question, at most four questions, in rank order; each option label is the recipe id and its description the title plus `Seen in`. Candidates beyond sixteen stay in the file unselected. Nothing selected: mark the phase `done`.
4. **Build, one recipe at a time, never in parallel** (each build runs a browser). Per selected id, spawn one `general-purpose` subagent with the prompt in "Subagent prompt: recipe", wait, then commit `feat(recipes): add <id>` with its files.
5. **After the last build**, with nothing else driving a browser:
   ```bash
   export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"; cd PLUGIN/recipes && node ../scripts/verify-recipes.mjs
   cd PLUGIN && node scripts/audit.mjs recipes
   ```
   Every entry passes; the audit reports P0 0, P1 0, P2 0.
6. **Counts.** Update the recipe and entry counts in `REPO/CLAUDE.md` (the `verify-recipes` comment and the "Recipes are a contract" paragraph), `PLUGIN/README.md` (the `recipes/` bullet) and `PLUGIN/recipes/README.md` ("The catalogue now has …"). Commit `docs(recipes): update catalogue counts`, and mark the phase `done`.

### Subagent prompt: recipe

```
You are adding one recipe to the awards plugin's verified catalogue. Work alone; nothing else is driving a browser.

REPO: {repo}
PLUGIN: {repo}/plugins/awards
Recipe id: {id}
Proposal: {the entry from the proposals file}
Cards to read for the technique: {PLUGIN/references/sites/<slug>.md, …}

1. Read REPO/CLAUDE.md sections "Recipes are a contract" and "Conventions that bite", PLUGIN/recipes/README.md, and the nearest existing recipe named under Overlap, all six files of it.
2. Create PLUGIN/recipes/{id}/ with index.html, main.js, style.css, README.md, recipe.json and verify.mjs, to that contract: style.css imports ../_shared/base.css itself; the page exposes window.__awards through _shared/awards-hook.js; the shared ticker drives any Lenis; system font stacks only; full, reduced and static motion tiers through _shared/reduced-motion.js; demo content synthetic and labelled so in README.md. recipe.json carries id, title, tags, deps, tier, variants and seenIn (the proposal's slugs); verify-recipes stamps verified.
3. A dependency not in PLUGIN/recipes/package.json needs an exact pin added both there and to PLUGIN/references/stacks/versions.md, then `cd PLUGIN/recipes && npm install`.
4. verify.mjs asserts the proposal's verify idea, plus the reduced-motion state and a mobile state. Confirm the key assertion fails when the technique is disabled, then restore it.
5. Run until it passes:
   export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"; cd PLUGIN/recipes && node ../scripts/verify-recipes.mjs --only {id}
6. Add one row for {id} to the "Catalogue by intent" table in PLUGIN/recipes/README.md.
7. Reply with the files written, the verify result line, and any pin added.
```

## Phase: stacks

1. **Queue.** Each URL under `# new stack` in `awardsworthysites.md`, plus each `stack` novelty hit of the current wave whose library still has no note in `PLUGIN/references/stacks/`.
2. **Per library**, spawn one `general-purpose` subagent (these need no browser and may run up to four at a time) with this prompt:
   ```
   Write PLUGIN/references/stacks/<name>-<major.minor>.md for {library} ({url}), in the register of PLUGIN/references/stacks/lenis-1.3.md: a label header comment, "What it is for in this skill set", "Install (pinned)", "The API surface we use", pitfalls, and which corpus cards use it (from their [site:<slug>] evidence). Take the version from `npm view <package> version`; take every API claim from its documentation through Context7 when available (resolve-library-id, then query-docs) or from its published source, labelled [verified: <source>]; anything else is [recalled] or [unverified]. PLUGIN = {repo}/plugins/awards. Write only that file. Reply with the path, the package name and the exact version.
   ```
3. **Pins.** Add a row `| <package> | <version> | <role> |` to `PLUGIN/references/stacks/versions.md`. Add it to `PLUGIN/recipes/package.json` only if a recipe of this wave depends on it. Then check that the two agree:
   ```bash
   node -e 'const fs=require("fs"),p=process.argv[1];const pins=Object.fromEntries([...fs.readFileSync(p+"/references/stacks/versions.md","utf8").matchAll(/^\| (\S+) \| (\d[^ |]*) \|/gm)].map(m=>[m[1],m[2]]));const pkg=JSON.parse(fs.readFileSync(p+"/recipes/package.json"));const deps={...pkg.dependencies,...pkg.devDependencies};let bad=0;for(const [n,v] of Object.entries(deps))if(pins[n]&&pins[n]!==v.replace(/^[\^~]/,"")){console.log("pin",n,pins[n],v);bad=1}process.exit(bad)' PLUGIN
   ```
   It prints nothing.
4. Move each handled `# new stack` bullet to `# Reviewed and in Skill`. `node PLUGIN/scripts/lint-refs.mjs` ends `0 dangling reference(s)`. Commit `docs(stacks): wave <n> stack notes`, mark the phase `done`.

## Phase: upkeep

1. **Grader slugs.** Regenerate the alternation in `PLUGIN/evals/build-antarctic-site/graders/divergence-names-cards.md` from the index, all card slugs except `floema-jewelry`, sorted:
   ```bash
   grep -oE '^\| `[a-z0-9-]+`' PLUGIN/references/sites/_index.md | tr -d '|` ' | grep -vx floema-jewelry | sort | paste -sd'|'
   ```
   The `pattern:` line becomes `pattern: '\[site:(<that output>)\]'`.
2. **Stack list.** If the wave's `stack_signatures` add a framework, add it to the list in `PLUGIN/skills/stack/SKILL.md` ("The analysed sites run Vite + vanilla, …").
3. **Checks:**
   ```bash
   claude plugin validate PLUGIN
   node PLUGIN/scripts/lint-refs.mjs | tail -1
   grep -rnE "19 analysed|across 19 award|nineteen analysed|Corpus index — 19" PLUGIN/skills PLUGIN/references/sites/_index.md
   ```
   Validate passes, lint ends `0 dangling reference(s)`, grep prints nothing.
4. Commit `chore(corpus): wave <n> upkeep`.
5. **Maintainer gate.** Ask whether to run the smoke evals (`cd PLUGIN && claude plugin eval . --tag smoke`, eleven routing cases with a no-plugin baseline; it costs money). Run them only on a yes and report the pass counts. Mark the phase `done`.

## Narrowed-run report

After the synthesis of a narrowed run, stop and report to the maintainer, then wait:

- per site: slug, status, rating, novelty hits, card path or reason;
- the synthesis edits, one line each, and any duplicates;
- anything in the gate wording that decided a case badly: a site skipped that obviously adds something, or added on a thin hit.

The maintainer approves, or edits this skill's novelty wording and asks for a re-run of the same sites.

## Done

A wave is done when every Sites row is `added`, `skipped` or `failed` (a `blocked` row may remain with its reason), `awardsworthysites.md` reflects every status, every phase is `done`, and every phase check passed. Report the counts per status, the new cards, the recipes built, the stack notes written and the eval result if one ran.
````

- [ ] **Step 4: Confirm the check passes**

Run the Step 1 command again. Expected: `lines <n>` with n ≤ 320, no `missing` or `out of order` lines, exit 0.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/expand-corpus/SKILL.md
git commit -F - <<'EOF'
feat(corpus): add synthesis, recipes, stacks and upkeep phases to expand-corpus

<session attribution footer>
EOF
```

---

### Task 4: Pilot run (main session, maintainer gate 1)

**Files:** written by the skill: `docs/handoff/corpus-ledger.md`, up to four cards in `plugins/awards/references/sites/`, `_index.md` rows, pattern edits, `awardsworthysites.md`.

**Interfaces:**
- Consumes: the finished skill from Tasks 2–3.
- Produces: an approved (possibly re-worded) novelty gate and a ledger whose wave has four terminal or `blocked` rows marked `Synthesised` where added.

- [ ] **Step 1: Confirm the skill is discoverable**

Start a fresh Claude Code session at the repo root (a skill written mid-session may not be listed) and type `/expand-corpus`. Expected: the skill appears in the slash-command list with its argument hint. If it does not, read `.claude/skills/expand-corpus/SKILL.md` and follow it by hand; report that the file was not picked up.

- [ ] **Step 2: Run the pilot**

```
/expand-corpus --only boc,wodniack,likova,911rennsport
```

Expected: Setup runs (doctor `PASS` for Playwright and Chromium, ledger with `## Wave 2`), four ledger rows, two triage batches (three subagents, then one), card checks on each `added` card, `lint-refs` clean, triage commit per batch, synthesis subagent, synthesis commit, then the narrowed-run report. `triage` and `synthesis` stay `open`.

- [ ] **Step 3: Verify independently**

```bash
git log --oneline -4
grep -A12 "^### Sites" docs/handoff/corpus-ledger.md
node plugins/awards/scripts/lint-refs.mjs | tail -1
```

Expected: setup, triage and synthesis commits; four rows with statuses from `added|skipped|blocked|failed`; `0 dangling reference(s)`. For each added card, run the "Card checks" block from the skill by hand.

- [ ] **Step 4: Maintainer gate 1**

The maintainer reads the report, the cards and `git diff HEAD~2 -- plugins/awards/references`. On requested changes to the novelty wording: edit `.claude/skills/expand-corpus/SKILL.md` (step 4 of "Subagent prompt: site"), commit `fix(corpus): tune novelty gate`. To re-run the same sites, first `git revert --no-edit` the narrowed run's triage and synthesis commits (newest first), which restores the index, the queue bullets, the patterns and the ledger rows; then re-run Step 2. Continue only on approval.

---

### Task 5: Wave 2 full run (main session, maintainer gates 2 and 3)

**Files:** everything the skill writes, see the file map.

**Interfaces:**
- Consumes: the approved skill and the pilot ledger from Task 4.
- Produces: wave 2 complete per the skill's `## Done`.

- [ ] **Step 1: Run**

```
/expand-corpus
```

Expected: resumes at `triage`, processes the remaining 27 sites in batches of three with a commit per batch, then synthesis over every unsynthesised added card.

- [ ] **Step 2: Maintainer gate 2 (recipes)**

The skill writes `docs/handoff/recipe-proposals-2026-09-23.md` (or the run date) and asks which recipes to build. It builds the selected ones serially, then runs the full `verify-recipes.mjs` and `audit.mjs recipes`. Expected: every entry passes; P0 0, P1 0, P2 0; counts updated in `CLAUDE.md`, `plugins/awards/README.md` and `plugins/awards/recipes/README.md`.

- [ ] **Step 3: Stacks and upkeep**

Expected: `references/stacks/smooothy-<major.minor>.md` (package name as npm reports it) plus any `stack` hits; pins in sync; grader regex regenerated; `claude plugin validate` passes.

- [ ] **Step 4: Maintainer gate 3 (smoke evals)**

Answer the skill's question. On yes, it runs `claude plugin eval . --tag smoke` and reports pass counts.

- [ ] **Step 5: Final verification**

```bash
grep -c "| queued |" docs/handoff/corpus-ledger.md
grep -A10 "^| Phase" docs/handoff/corpus-ledger.md | tail -8
claude plugin validate plugins/awards
node plugins/awards/scripts/lint-refs.mjs | tail -1
git status --short
```

Expected: `0` queued; every wave-2 phase `done`; validate passes; `0 dangling reference(s)`; clean tree. Hand the branch to superpowers:finishing-a-development-branch.
