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
- **Git.** Work on branch `feat/corpus-wave-<n>`; create it from `main` if it is absent. Commit after every triage batch and every phase. Commit messages name no model and end with the session's attribution footer.

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
4. Then continue with triage.

## Phase: triage

1. **Doctor.** Re-run the Setup doctor command; a `FAIL` stops the run.
2. **Queue.** Read `awardsworthysites.md`. Sites are the bullets under `# not reviewed`; the stack queue is the bullets under `# new stack` (handled in the stacks phase). Every site URL not yet in the current wave's Sites table gets a row with status `queued`. A URL already in an earlier wave keeps its slug: carry it into the new wave's table only if its last status was `blocked`; a `failed` URL is not re-queued until the maintainer corrects it in `awardsworthysites.md` (a corrected URL is a new URL).
3. **Slug.** Host name without `www.` and without the public suffix (`co.uk` counts as one suffix), remaining dots to hyphens, lower-case kebab-case: `why.zero.university` → `why-zero`, `911rennsport.co.uk` → `911rennsport`, `boc.studio` → `boc`. This collision rule applies only to new URLs: if the slug is already a file in `PLUGIN/references/sites/` or a row in any wave, append the next host label to the left; if none is left to append, append `-2`.
4. **Selection.** Rows with status `queued` or `blocked`, narrowed by `--only` (slugs) or `--limit N` (`queued` rows first in table order, then `blocked`). `blocked` rows get one retry per run.
5. **Orphans.** A selected slug whose card file already exists while its row is `queued` or `blocked` is left over from a killed run; the subagent overwrites it. If that re-run returns `skipped`, `blocked` or `failed`, the main session deletes the orphan card.
6. **Batches of three.** Spawn up to three `general-purpose` Agent calls in one message, one site each, with the prompt in "Subagent prompt: site". Wait for all of them before the next batch.
7. **Per output block:**
   - `added`: run "Card checks". A failing check goes back to the same subagent once through SendMessage with the failing lines; if it still fails, delete the card and record `blocked`, reason `card failed checks: <which>`.
   - `added`: append `index_row` as the last row of the table in `PLUGIN/references/sites/_index.md` (the table ends before `## Picking neighbours`). It must have the table's twelve cells. If `_index.md` already has a row for the slug, replace it instead of appending.
   - Every status: update the Sites row (status, rating, novelty hits separated by `; `, reason, date; `Synthesised` stays empty). Append each `techniques` and `stack_signatures` line to `### Techniques and stacks` prefixed with `<slug>: `.
   - `blocked` with a reason starting `environment:`: reset the row to `queued` instead of `blocked`, and stop the run after this batch; report the reason to the maintainer.
   - `awardsworthysites.md`: move the bullet from `# not reviewed` to `# Reviewed and in Skill` (added) or to `# Reviewed, not added` (skipped; create that section after `# Reviewed and in Skill` if absent, bullet suffixed ` — <reason>`). A `failed` bullet stays and gets ` (host does not resolve)`. A `blocked` bullet stays unchanged.
8. **After each batch:** `node PLUGIN/scripts/lint-refs.mjs` must end with `0 dangling reference(s)`. Commit `docs(corpus): wave <n> triage — <slugs>`.
9. **Done** when no selected row is `queued`. For an un-narrowed run, when no row at all is `queued`: mark `triage` `done` (blocked rows keep their reason). Also check: index rows equal `added` rows (count backticked slugs in `_index.md` table vs ledger `added` rows, plus the 20 pre-existing incl. `floema-jewelry`) and ledger Sites rows equal queue size.

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
   - First check the host resolves: `getent hosts <host>` (non-zero exit = does not resolve) → status failed, stop.
   - capture.mjs exit 3 → status blocked, reason `environment: browser unavailable`, and tell the main session; do not retry.
   - Resolves but exit 4, 403, or a timeout after research's one wheel/wait retry → status blocked. Never write a card from memory.
3. Rate. Read PLUGIN/references/jury/rubric.md. Score Design, Usability, Creativity and Content on its anchors, from the captures and research §6's walk. Weighted = D×0.4 + U×0.3 + C×0.2 + Co×0.1, two decimals, label [inferred]. Finding the award entry is optional: if its URL is known or turns up from one search, capture it with `--out REPO/.awards/research/{slug}/entry --only desktop` so the site's own captures are not overwritten, and record its published scores as [verified, entry page]. Otherwise official is none. The rating never decides inclusion.
4. Novelty. Read PLUGIN/references/sites/_index.md, the title and tags of every PLUGIN/recipes/*/recipe.json, the file names in PLUGIN/references/stacks/, and the headings of PLUGIN/references/patterns/*.md. Record each hit as `<type>: <what> — checked against <nearest card, recipe, stack or pattern>`:
   class — the site's class has at most one card in the index
   model — the class together with the site's narrative model, scroll model or WebGL dosage is absent from the index
   technique — an effect or interaction the site has is covered by no recipe and no pattern section
   stack — a library or framework it uses has no stack note
   world — its type contract or palette strategy appears in no index row
   Judge `class` and `world` against the fixed vocabularies in `_TEMPLATE.md` (class, narrative model, scroll model, WebGL dosage) and the palette-strategy and type-contract families already used in the index, not raw free-text differences. `stack` counts only frameworks and rendering, motion, scroll, page-transition or 3D libraries, never a CMS, analytics, hosting or fonts.
5. At least one hit: write PLUGIN/references/sites/{slug}.md from _TEMPLATE.md per research §5 and §6, including the Corpus rating row, overwriting any file already there. Every hex in the card, including the §8 "Don't take" list, carries a label on its own line. Run research's Verify list on it and fix what fails. No hit: write no card; status skipped.
6. Reply with exactly this block and nothing else:

slug: {slug}
status: added | skipped | blocked | failed
rating: D x.x / U x.x / C x.x / Co x.x → w x.xx [inferred]; official: <scores [verified, entry page]> | none
novelty: <hit>; <hit> | none
index_row: | `{slug}` | … |   (added only: the twelve columns of _index.md, in order; the 12th (Last verified) is {YYYY-MM-DD})
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
grep -nE '#[0-9a-fA-F]{3,8}\b' "$f" | grep -vE '\[(verified|recalled|inferred|unknown)'
```

The last line prints hex values with no label on their line. After the index row is appended, `grep -c '^| `<slug>` |' PLUGIN/references/sites/_index.md` must print `1`. Then read the card once for quotes over 25 words; the slug must be identical in the file name, the index row and every `[site:<slug>]` in the card.

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
5. Un-narrowed run: mark `synthesis` `done` only when `triage` is `done` and no `added` row is unsynthesised.

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

1. **Doctor.** Re-run the Setup doctor command; a `FAIL` stops the run.
2. **Candidates.** From `### Techniques and stacks` of the current wave and the synthesis edits, list every technique no existing recipe covers (compare with the titles and tags of `PLUGIN/recipes/*/recipe.json` and the catalogue in `PLUGIN/recipes/README.md`). Rank by the number of added sites that show it, then by how many skills would cite it.
3. **Proposals file.** Write `docs/handoff/recipe-proposals-<YYYY-MM-DD>.md`, one entry per candidate:
   ```markdown
   ## <rank>. `<recipe-id>` — <title>
   - Seen in: <slug>, <slug>
   - Tier: P0 | P1 | P2 · Deps: <pinned packages from PLUGIN/recipes/package.json, or a new pin with its reason>
   - Overlap: <nearest existing recipe and what this adds>
   - Verify idea: <the state and the assertion that fail when the technique breaks>
   ```
   Commit `docs(corpus): wave <n> recipe proposals`.
4. **Maintainer gate.** Ask with AskUserQuestion, `multiSelect: true`, four candidates per question, at most four questions, in rank order; each option label is the recipe id and its description the title plus `Seen in`. Candidates beyond sixteen stay in the file unselected. Nothing selected: mark the phase `done`.
5. **Build, one recipe at a time, never in parallel** (each build runs a browser). Per selected id, spawn one `general-purpose` subagent with the prompt in "Subagent prompt: recipe", wait, then commit `feat(recipes): add <id>` with its files, plus `PLUGIN/recipes/package.json`, `PLUGIN/recipes/package-lock.json` and `PLUGIN/references/stacks/versions.md` when the subagent added a pin.
6. **After the last build**, with nothing else driving a browser:
   ```bash
   export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"; cd PLUGIN/recipes && node ../scripts/verify-recipes.mjs
   cd PLUGIN && node scripts/audit.mjs recipes
   ```
   Every entry passes; the audit reports P0 0, P1 0, P2 0. Commit the re-stamped `recipe.json` files and the regenerated `recipes/index.html`: `chore(recipes): re-verify catalogue`.
7. **Counts.** Re-derive the current recipe and entry counts from `ls PLUGIN/recipes`, then find every live count with:
   ```bash
   grep -rnE "\b60 (entries|verifiable|browser)|59 focused|60 browser-verifiable" --include='*.md' --include='*.json' REPO --exclude-dir=node_modules --exclude-dir=docs
   ```
   Update each hit to the new numbers, keeping `PLUGIN/.claude-plugin/plugin.json`, `PLUGIN/.codex-plugin/plugin.json` and `REPO/.claude-plugin/marketplace.json` descriptions in sync with each other. This grep pattern itself names the current counts, so update it here too the next time the catalogue grows. Commit `docs(recipes): update catalogue counts`, and mark the phase `done`.

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
4. **Link.** Add a reference to each new stack note in `PLUGIN/skills/stack/SKILL.md`, wherever that file already lists stack notes by path (its framework-choice and page-transition tables, and inline `stacks/<name>.md` mentions).
5. Move each handled `# new stack` bullet to `# Reviewed and in Skill`. `node PLUGIN/scripts/lint-refs.mjs` ends `0 dangling reference(s)`. Commit `docs(stacks): wave <n> stack notes`, mark the phase `done`.

## Phase: upkeep

1. **Grader slugs.** Regenerate the alternation in `PLUGIN/evals/build-antarctic-site/graders/divergence-names-cards.md` from the index, all card slugs except `floema-jewelry`, sorted:
   ```bash
   grep -oE '^\| `[a-z0-9-]+`' PLUGIN/references/sites/_index.md | tr -d '|` ' | grep -vx floema-jewelry | sort | paste -sd'|'
   ```
   The `pattern:` line becomes `pattern: '\[site:(<that output>)\]'`.
2. **Stack list.** If the wave's `stack_signatures` add a framework, add it to the list in `PLUGIN/skills/stack/SKILL.md` ("The analysed sites run Vite + vanilla, …"). Re-check that file's "Framer Motion appears on none of them" claim against the wave's `stack_signatures`; correct the sentence if one of them now does.
3. **Checks:**
   ```bash
   claude plugin validate PLUGIN
   node PLUGIN/scripts/lint-refs.mjs | tail -1
   grep -rnE "19 analysed|across 19 award|nineteen analysed|Corpus index — 19" PLUGIN/skills PLUGIN/references/sites/_index.md
   grep -rnE "twenty-card|twenty site case studies" REPO/README.md PLUGIN/.claude-plugin PLUGIN/.codex-plugin REPO/.claude-plugin
   ```
   Validate passes, lint ends `0 dangling reference(s)`, both greps print nothing.
4. Commit `chore(corpus): wave <n> upkeep`.
5. **Maintainer gate.** Ask whether to run the smoke evals (`cd PLUGIN && claude plugin eval . --tag smoke`, eleven routing cases with a no-plugin baseline; it costs money). Run them only on a yes and report the pass counts. Mark the phase `done`.

## Narrowed-run report

After the synthesis of a narrowed run, stop and report to the maintainer, then wait:

- per site: slug, status, rating, novelty hits, card path or reason;
- the synthesis edits, one line each, and any duplicates;
- anything in the gate wording that decided a case badly: a site skipped that obviously adds something, or added on a thin hit.

The maintainer approves, or edits this skill's novelty wording and asks for a re-run of the same sites. To re-run the same sites, first `git revert --no-edit` the narrowed run's triage and synthesis commits (newest first), which restores the index, the queue bullets, the patterns and the ledger rows; then re-run.

## Done

A wave is done when every Sites row is `added`, `skipped` or `failed` (a `blocked` row may remain with its reason), `awardsworthysites.md` reflects every status, every phase is `done`, and every phase check passed. Report the counts per status, the new cards, the recipes built, the stack notes written and the eval result if one ran.
