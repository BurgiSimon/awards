# Finish gates: hero probe, early component jury, jury judges finish

Branch `feat/finish-gates` (from `feat/ceiling`). Source: `docs/handoff/analysis-2026-10-06.md`
§5 items P07, P12, P13 (revised text; read them first, and the dropped list for what not to
build). Paths relative to `plugins/awards/` unless noted.

Goal: the first independent aesthetic judgement moves from the end of the build to the first
viewport, and the final jury's fix list stops being crowded out by floor items.

## Packages (disjoint file ownership)

### G. Hero probe and early component jury in the flow (P07, P12 flow side)

Owns `skills/structure/SKILL.md`, `skills/craft/SKILL.md`.

- structure: build the hero first with real tokens; capture s00 at desktop and phone
  (`capture.mjs`, into `.awards/captures/hero-probe/`); check it on the image against the six
  first-viewport checks, the hero judge rows and the selected visual-composition frame. At most
  one fix batch. Naming or memory test fails: back to concept (same-seed re-roll allowed).
  Record the manifest path in Page map row 1.
- craft: the "after structure" step requires the hero-probe manifest. After the static
  checkpoint, invoke `awards:jury --component <first-viewport selector>` (`rebuild` → back to
  concept or structure; `fix` → the existing batch). When SIGNATURE is canvas or GL, run the same
  pass once after webgl. These passes count toward the existing two rounds (no exemption).

### J. Jury contract (P12 jury side, P13 judgement side)

Owns `skills/jury/SKILL.md`, `agents/awards-jury.md`, `references/jury/report-template.md`,
`assets/templates/jury-report.md`, `skills/ship/SKILL.md`, `references/jury/rubric.md` if needed.

- Component scale: name one concrete scale, density or finish delta per DIVERGENCE card, from
  its §8.
- Fix list split: floor fixes (uncapped, mechanical: fidelity, walk items, P0/P1) and up to five
  craft fixes inside the contract. ship applies both; ship still never redesigns.
- Open the hover and focus-visible frames when the capture has them (package C produces them).
- One-sentence `Ceiling:` line: the world-native device the build never uses. Reported only,
  never a fix, never a score change.
- The `disposition:` line contract and reply block stay literal; check `evals/` graders and
  `evals/jury-evidence-selftest.mjs` still match.

### C. Capture and audit tooling (P13 tooling side)

Owns `scripts/capture.mjs`, `scripts/lib/*` as needed, `scripts/audit.mjs`,
`scripts/data/rules.json`, `evals/behavior.mjs`, `evals/jury-evidence-selftest.mjs`,
`references/capture-states.md`.

- capture: when no `--hover`/`--states` is given, also capture hover and focus-visible frames
  for the first three visible links and buttons (desktop), listed in the manifest. Cheap, never
  fails the capture when there are none.
- audit `--render`: new P2 rule (next free id in the colour family) comparing the computed
  body/main background against the DESIGN.md ground token, when DESIGN.md declares one. Silent
  without DESIGN.md. Keep the rule count in sync wherever it is stated.
- behavior.mjs fixtures for both; no flaky timing.

## Verification (serial, by the integrator)

1. `claude plugin validate .`
2. `node scripts/lint-refs.mjs`
3. `node evals/selftest.mjs`, `node evals/jury-evidence-selftest.mjs`,
   `node evals/visual-library-selftest.mjs`
4. `node scripts/audit.mjs recipes` (no P0–P2) and a `--render` run on a couple of built recipes
   (new rule quiet without DESIGN.md)
5. `node evals/behavior.mjs` (`AWARDS_PLAYWRIGHT` as in `state.md`)
6. `capture.mjs` on one built recipe: the manifest lists hover/focus frames; open them.

Paid evals are not run here.
