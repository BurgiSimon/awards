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
