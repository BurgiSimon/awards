# Open todos

Updated 2026-09-23 after the human visual review. The older 0.2.0 closeout record below is
historical; `verification-log.md` remains its evidence ledger.

## Visual comparison closeout

1. Human choices are recorded: candidate Overall wins for Tidal Notes and Form & Sound, Kiln Nine
   Overall tie, and three Mobile ties. See the [comparison record](visual-comparison-2026-09-22.md)
   and unchanged submitted JSON. All 18 requested reasons remain blank, as do technical evidence,
   case notes and both Kiln Nine reduced-motion checkboxes. Record any later rationale verbatim;
   do not infer it or treat those blanks as ties. Practical blinding is limited.
2. Preserve the failed technical acceptance result: candidate Kiln Nine and Form & Sound have
   focused primary-action C01 P1 failures. Secondary-copy P1s also remain. No generated-site repair,
   retry or extra paid judging is authorized. Human preference cannot clear these technical failures.
3. In separately scoped work, investigate skill-routing non-use (all eleven skills advertised,
   zero Skill calls in all six builds), rendered keyboard-focus/surface contrast verification and
   audit exception parsing through EOF. Static checkpoint/guide wording effectiveness is unmeasured.
   Keep current frozen snapshots and raw pilot evidence unchanged.
4. In separately scoped corpus maintenance, correct or demote the pre-existing The Line narrative
   sequence attribution and distinguish the reconstructed 768px typography breakpoint from the live
   1024px card observation. Keep either correction outside the frozen visual-library candidate.
5. A real phone and GPU pass remains necessary for WebGL performance claims. Headless captures do
   not establish frame rate or device quality. Retain earlier aborted monolithic-browser evidence.

## Earlier 0.2.0 closeout record

1. **Phase 7 — close out the build tier's findings.** Both tiers have now run. Smoke meets every
   bar. The build tier ran on 2026-09-21 ($27.68, 33 min): 2/6 cases all-green, **36 of 41 graders
   passed**, every skill fired. Six failures, diagnosed in the ledger, **none fixed yet**:
   - ~~Fix the `--allow-tools` grant.~~ **Done and verified**: `Bash` is granted whole in all three
     places that document the command. `audit.mjs` and `capture.mjs` now execute inside an eval.
   - ~~Three grader defects.~~ **Done and verified**, `jury-generic-saas` 0.67 → 1.00 over two runs
     ($3.17). `scores-present` matches the contract format; `pin-kept` reads `index.html`;
     `fixes-ordered-and-specific` no longer fails a reply that correctly reaches `rebuild` and names
     direction work as its first fix.
   - ~~One real skill gap in `research`.~~ **Done and verified**, 4 / 4 twice: the skill now
     separates a host that cannot exist from a site that is merely unreadable, and `card-written`
     accepts either correct outcome.
   - ~~One timeout on `build-antarctic-site`.~~ **Raised to 3600**, from the Phase 8 measurement of
     129 turns and 2,567 s for the same prompt. Reasoned from a measurement, not re-tested — the
     next build-tier run is what confirms it.
   - The baseline arm does not need running again. Measured over 102 runs: every `skill-fired`
     grader scores 0 without the plugin, and all six negatives pass trivially there. The one
     informative row was `trigger-jury` (`disposition-line` 3/3 with, 0/3 without).
   - ~~Re-run the build tier.~~ **Done 2026-09-21**: 39 / 41 graders, 4 / 6 cases all-green, $41.43.
     It surfaced two more grader defects, both since repaired. A **third run** confirmed them at
     40 / 42 graders and 4 / 6 cases, $44.37. That run found two more things, both now fixed and
     **neither re-measured**: `build-antarctic-site` exhausted `max_turns` (151 of 150) inside its
     raised time cap, so the cap is 200 now; and the jury skill drifted off its own reply contract,
     writing the axes as a table, so the contract is a literal block in the skill.
   - The jury contract was then sampled on its own for $1.63: **6 / 6**, and the shape held where it
     had drifted. It also showed "end your reply with the block" is stricter than the need — the
     reply led with the block and dropped the closing sentence — so the skill now asks for it
     verbatim and unbroken at either end. **That last wording change is unsampled.** The turn cap is
     unsampled too, and is arithmetic from three measurements (129, 153, 151 turns against a cap of
     200); a tier run to watch it costs about $44, of which `build-antarctic-site` is $32.
   - Budget note: three smoke cases × three runs cost $6.64, not the ≈ $2 estimated. The build tier
     came in at $27.68 against a $45 ceiling, and the two grader verification runs at $3.17.
2. ~~**Phase 8 — one real end-to-end build.**~~ **Done 2026-09-21**, $23.89, every check in the plan
   met, and **`plan.md` risk 2 is resolved** — the forked jury's literal `disposition:` line reaches
   the user verbatim. Details in the ledger. It left one defect, **since fixed**:
   `scripts/audit.mjs` resolved its project root from `process.cwd()`, so auditing from inside
   `public/` wrote the report there and the build shipped it — and, less visibly, dropped every
   signed-off `## Exceptions` entry, since those are read from the same place. It now walks up from
   the audited target to the nearest `AWARDS.md`, falling back to cwd where there is none.
3. ~~**Phase 9 — docs and version.**~~ **Done 2026-09-21.** Both manifests are at 0.2.0, the
   release notes are in `README.md`, the counts are corrected everywhere, and the verification
   block at the end of `plan-0.2.md` was run. **Nothing is pushed and no pull request is open** —
   the plan says to stop and report first, and that still stands.

## Out of scope for 0.2.0 by decision, still worth doing

4. **Real-device pass on the GL recipes** (a phone and a laptop GPU): `gl-fluid-wake-post`,
   `gl-dom-tethered-planes`, `gl-postprocessing-presets`, `gl-virtual-scroll-camera`, `gl-msdf-text`.
   Adjust the thresholds in `recipes/_shared/quality-tiers.js` from measured frame rates; they are
   guesses today. This is a human task — headless SwiftShader cannot answer it.
5. **Framework adapters as code.** The recipes carry adapter notes;
   `recipes/<id>/adapters/{react.tsx,vue.vue,svelte.svelte,astro.astro}` are unwritten for the P0
   set, and `assets/scaffold/` has only `vite-vanilla` (the stack skill routes other stacks to
   `references/stacks/*.md`).

## Smaller, open

6. **Slosh Seltzer's captures show its WebGL gate, not the site.** Its card records this and its
   confidence stayed medium-high. A capture through a GL-capable browser would close it.
7. **The fifteen site cards that disclaim the manifest's LCP by hand** still say "the manifest's LCP
   figures". The field is now `lcpColdSynthetic` and carries its own warning, so those sentences are
   redundant rather than wrong. Tidy them only if a card is being edited anyway.

## Closed since 0.1.0

Everything else on the old list. The corpus is live-verified 19/19 (item 5), the flagged conflicts
are resolved (6), both P2 recipes ship (7), `allowed-tools` is on every skill (8), the cold-LCP
defect is fixed (9), `_index.md` has its `Last verified` column (12), and pull request #1 is merged
(13). `tools/extract-report.mjs` (11) was never needed and is **dropped**, not deferred. Details and
evidence for each are in `verification-log.md`.
