# Expand Corpus — Design

Status: approved design; implementation has not started.

## Goal

Make growing the reference corpus a repeatable, resumable procedure instead of an ad-hoc agent session. The first wave (19 sites) was analysed by batch research agents, card writers, two synthesis agents and a stacks agent, following `docs/handoff/plan.md` §13 phase 1; none of that is written down as a process. `awardsworthysites.md` now lists 31 more sites and one stack under review, and it will keep growing.

The procedure takes the queue in `awardsworthysites.md`, rates and analyses each site, admits the ones that add something new, and carries what they add into patterns, recipes, stacks and the counts that name the corpus.

## Approach and alternatives

One repo-local maintainer skill, `.claude/skills/expand-corpus/SKILL.md`, phased, reusing the existing `awards:research` procedure for every per-site step.

- It lives outside `plugins/awards/`. Plugin users never grow this corpus; a plugin skill would only add trigger surface and routing noise to the eleven shipped skills.
- It reuses research by having each subagent read `plugins/awards/skills/research/SKILL.md` from the working tree, not by invoking the installed plugin: an installed plugin cache can lag the repository, and the repository is what is being changed.
- It adds no scripts. `capture.mjs`, `lint-refs.mjs`, `verify-recipes.mjs`, `audit.mjs` and `claude plugin validate` already cover every mechanical step; the rest is judgement.

Declined:

- Extending `awards:research` with batch, rating and synthesis steps: it would bloat a skill end users run with steps only the maintainer needs.
- Three repo-local skills (triage, synthesis, recipes): hand-off lines and three trigger descriptions for one maintainer, with the same ledger underneath.
- A script-driven pipeline or a checked-in Workflow script: the capture step is already scripted; what remains is judgement, and a Workflow run is a large spend behind one call.
- Codex exposure: Claude Code only.

## Global constraints

- Every rule of `awards:research` holds unchanged: confidence labels on every hex, date, score, library and credit; site copy in fragments of at most 25 words; no asset downloads; cards under 200 lines; the nine template sections.
- No card is written from recall. A site that resolves but cannot be captured waits in the queue (see Failure states). This deliberately departs from research §3 for corpus growth: every recall-based card of wave 1 needed the 0.2 live re-verification pass.
- Browser work runs serially where the repository says it must: no `verify-recipes.mjs` beside any capture, no `evals/behavior.mjs` beside either.
- No model identifiers in any committed file. Commit messages end with the session's attribution footer.
- Work happens on branch `feat/corpus-wave-2`, one commit per phase and per batch inside phase 1.

## Inputs and durable files

| File | Role | Written by |
|---|---|---|
| `awardsworthysites.md` | Queue. `# not reviewed` is the site queue, `# new stack` the stack queue. On completion a URL moves to `# Reviewed and in Skill` (added) or a new `# Reviewed, not added` section (skipped), or is marked `(host does not resolve)` in place (failed). | main session |
| `docs/handoff/corpus-ledger.md` | One row per queued URL: slug, URL, status, rating, novelty hits, synthesised, reason, date. Resume starts at the first row whose status is not terminal. Same pattern as `docs/handoff/verification-log.md`. | main session |
| `plugins/awards/references/sites/<slug>.md` | The card, for `added` sites only. | the site's subagent |
| `.awards/research/<slug>/` | Captures, fetched HTML and text assets (gitignored). | the site's subagent |
| `plugins/awards/references/sites/_index.md` | One row per added site; the count-free title. | main session |
| `docs/handoff/recipe-proposals-<date>.md` | Ranked recipe proposals from phase 3. | main session |

**Single-writer rule.** Subagents write only their own card and their own `.awards/research/<slug>/`. They return everything else as a fixed output block. Only the main session edits `_index.md`, the ledger and `awardsworthysites.md`, so parallel subagents never race on a shared file.

Statuses: `queued`, `added`, `skipped`, `blocked`, `failed`. Terminal: `added`, `skipped`, `failed`. `blocked` stays in the queue for the next run.

## Invocation

```
/expand-corpus [--limit N] [--only slug,…] [--phase triage|synthesis|recipes|stacks|upkeep]
```

No arguments: read the ledger and resume at the first unfinished phase (phase 0 when no ledger exists). `--limit N` processes the first N queued sites. `--only` names slugs explicitly. `--phase` runs one phase.

## Phases

### 0. Setup (first run only)

Create the ledger with its header, and add the `Corpus rating` row to `references/sites/_TEMPLATE.md` after `Awards`: weighted score and four axes, the date, labelled `[inferred]`. Commit.

### 1. Triage and card (subagents, batches of three)

The main session creates ledger rows for every queued URL that has none, derives the slug with research's rule (host name without `www` and the public suffix, so `co.uk` counts as one suffix, kebab-case; a collision with an existing slug gets the next host label appended), then spawns up to three `general-purpose` subagents at a time, one site each, and starts no browser of its own while a batch runs.

**Subagent input:** URL, slug, wave date, the absolute `plugins/awards` path (the value of `${CLAUDE_PLUGIN_ROOT}` for every path in the research skill), the path of `plugins/awards/skills/research/SKILL.md`, and the slugs already added this wave.

**Subagent steps:**

1. **Capture and source.** Follow research §2 and §4 exactly: five scroll states, mobile, reduced motion, head, CSS and JS signatures, including its wheel, wait and consent-wall handling.
2. **Rate.** Score Design, Usability, Creativity and Content against the anchors in `plugins/awards/references/jury/rubric.md`, from the captures and research §6's short usability walk. Compute the weighted score (40/30/20/10), labelled `[inferred]`. If the award entry page is readable, record its published scores separately as `[verified]`. The two are expected to differ by about 0.7, which the rubric documents and does not re-scale. **The rating never decides inclusion.**
3. **Novelty check** against `_index.md`, every `recipes/*/recipe.json`, `references/stacks/`, `references/patterns/` and the slugs added earlier this wave. Each hit names what is new and the nearest existing card, recipe, stack or pattern section it was checked against. Hit types:

   | Type | Hit when |
   |---|---|
   | `class` | the site's class has at most one card in the corpus |
   | `model` | the combination of class with narrative model, scroll model or WebGL dosage is absent |
   | `technique` | an effect or interaction is covered by no recipe and no pattern section |
   | `stack` | a library or framework has no stack reference |
   | `world` | the type contract or palette strategy is absent from the corpus |

   `class` and `world` are judged against the fixed vocabularies in `references/sites/_TEMPLATE.md` (class, narrative model, scroll model, WebGL dosage) and the palette-strategy and type-contract families already used in the index, not raw free-text differences. `stack` counts only frameworks and rendering, motion, scroll, page-transition or 3D libraries, never a CMS, analytics, hosting or fonts.

4. **Decide.** At least one hit: write the full card per research §5 to §7, with the `Corpus rating` header row, and verify it with research's own Verify list. No hit: write nothing.

**Output block** (the only thing the subagent returns):

```
slug: <slug>
status: added | skipped | blocked | failed
rating: D x.x / U x.x / C x.x / Co x.x → w x.xx [inferred]; official: <scores [verified, entry page]> | none
novelty: [<type>: <what> — checked against <card|recipe|stack|pattern>] …
index_row: | `<slug>` | … |            (added only; the twelve columns of _index.md)
techniques: <name> — <evidence file> — <parameters>   (one per line)
stack_signatures: <library@version — evidence file>   (one per line)
reason: <text>                          (skipped, blocked, failed)
```

**After each batch** the main session appends the index rows, writes the ledger rows, moves the URLs in `awardsworthysites.md` and commits.

**Failure states:**

- `failed`: the host does not resolve (`ENOTFOUND`, `NXDOMAIN`). No card, per research §3; the URL is marked for the maintainer to correct.
- `blocked`: the host resolves but no capture is possible (403, timeout, `capture.mjs` exit 3 or 4). No card; stays queued with the reason.
- A subagent killed mid-run: a card file with no ledger row means the site is re-run on resume. The card is written once, at the end, so no partial card exists.

### 2. Synthesis (one subagent, after all batches)

Reads every card added this wave plus the technique and stack lines from the ledger. Updates, citing `[site:<slug>]` and never carrying site copy:

- `references/patterns/*.md` where a new card adds a component, hero archetype, narrative structure, motion parameter, WebGL technique or colour/type strategy;
- `references/reflex-lists.md` and `references/anti-patterns.md` where new faces or clichés appear;
- `seenIn` in existing `recipes/*/recipe.json` where a new site uses a recipe's technique;
- a note in the ledger for any two added sites of this wave that turned out to duplicate each other (parallel novelty checks cannot see each other within a batch).

The rubric's calibration statistics ("usability is the lowest axis on nineteen of the twenty verified entries") are dated verified facts and stay as written.

### 3. Recipe proposals

The main session writes `docs/handoff/recipe-proposals-<date>.md`: one entry per candidate technique not covered by an existing recipe, ranked by how many added sites use it, each with id, title, `seenIn`, tier, deps, the overlap with existing recipes, and the `verify.mjs` idea. The maintainer multi-selects which to build. Each approved recipe is built by one subagent to the recipe contract in `CLAUDE.md` (six files, `window.__awards`, system fonts, the `_shared` modules); then `verify-recipes.mjs --only <new ids>` runs alone, followed by the full suite alone, and `audit.mjs recipes` must stay free of P0–P2. The recipe count is updated in `CLAUDE.md`, `plugins/awards/README.md` and `plugins/awards/recipes/README.md`, and the catalogue by intent in `recipes/README.md` gains the new entries.

### 4. Stacks

Each URL in the stack queue, and each `stack` novelty hit, becomes `references/stacks/<lib>.md` in the register of the existing stack notes, from the library's documentation (Context7 when available) and its source. `versions.md` gains the pin; `recipes/package.json` gains it only when an approved recipe depends on it, and the two are kept in sync.

### 5. Upkeep

- Replace the hardcoded corpus size with count-free wording in `skills/concept/SKILL.md` (description), `skills/structure/SKILL.md` (description), `skills/craft/SKILL.md:16`, `skills/stack/SKILL.md:35` (its stack list also gains any framework the wave adds), the title of `references/sites/_index.md`, and the root `README.md:187`. Each description stays under the 1,536-character cap.
- Extend the slug alternation in `plugins/awards/evals/build-antarctic-site/graders/divergence-names-cards.md` with every added slug, and make its prose count-free.

## Maintainer gates

The skill stops and asks at three points:

1. After the pilot, before the remaining sites.
2. At the recipe proposals: which to build.
3. Before `claude plugin eval . --tag smoke`, which costs money and is warranted because phase 5 changes trigger descriptions.

## Pilot

`/expand-corpus --only boc,wodniack,likova,911rennsport` (a studio, a developer portfolio, a WebGL-heavy site, a brand with commerce), phases 1 and 2 only. The maintainer reviews the four ratings, the novelty calls, any cards and the pattern diff, and approves or tunes the gate wording before the other 27 sites run. The pilot is the skill's test; the maintainer skill gets no eval suite of its own.

## Verification per phase

| Phase | Checks |
|---|---|
| 1 | Every new card passes research's Verify list (labels on every hex, date, score, library and credit; under 200 lines; header table and nine sections; no quote over 25 words; slug identical in file name, index row and citation). Index rows added equal `added` ledger rows. Ledger rows equal queue size. `node plugins/awards/scripts/lint-refs.mjs` passes. |
| 2 | `lint-refs.mjs` passes. Every pattern edit cites a real `[site:<slug>]` and holds no site copy. Every `seenIn` value is a real card slug. |
| 3 | `verify-recipes.mjs --only <new ids>`, then the full suite, each alone. `audit.mjs recipes` free of P0–P2. Recipe counts updated in all three files. |
| 4 | Every pin in `references/stacks/versions.md` that `recipes/package.json` also names matches it. |
| 5 | `claude plugin validate plugins/awards` passes. `lint-refs.mjs` passes. `grep -rn "19 analysed\|across 19\|nineteen analysed\|nineteen entries were"` over the edited files finds nothing. The grader regex lists every card slug in `_index.md` except `floema-jewelry`. Smoke evals run if the maintainer approved them. |

## Done

Every queued URL is `added`, `skipped` or `failed`, and any `blocked` row carries its reason; `awardsworthysites.md` reflects every status; the ledger is complete; every phase check above is green; the smoke evals ran if approved.

## Out of scope

- Backfilling a `Corpus rating` for the 19 existing cards.
- Re-deriving the rubric's calibration statistics from new award entries.
- Codex exposure of the maintainer skill.
- New scripts, and an eval suite for the maintainer skill itself.

## Size

`SKILL.md` of about 150 lines, including the ledger header and the subagent prompt; one row added to `_TEMPLATE.md`. No other new files beyond what the phases produce.
