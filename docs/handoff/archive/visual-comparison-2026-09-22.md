# Visual composition comparison — 2026-09-22

All six authorized builds and the common technical evaluation are complete. Simon's review,
received 2026-09-23, prefers the candidate overall in two cases and ties the third, with all three
Mobile preferences tied. Those selections meet the visual preference thresholds, but **the pilot
fails the no-new-blocking-technical-failure condition:** the Kiln Nine and Form & Sound candidate
outputs have inaccessible keyboard-focus label contrast. All requested preference reasons were
left blank, and no build invoked an Awards skill, so the result cannot establish library benefit.
No generated application was repaired or rerun.

## Frozen protocol and execution

Baseline: `4f348dc5ea850d9657af27ce28c17e11884f02d6` (484 plugin files).
Candidate: `ae29ca62b73b3a24ad0c246bdee6ee25687d6e48` (572 plugin files).
Candidate archive: 8,355,840 bytes, SHA-256
`26f77a11e16dfffd5f590f2662e6bf3dd0223e411a4373731b3f522d3b73a08a`.
Both extracted snapshots match their archives before every call and after evaluation.

The three briefs are Kiln Nine (ceramics/local enquiry), Tidal Notes (six-entry journal/full lead
excerpt), and Form & Sound (three-day program/local booking). Every call revalidated the 37 frozen
source entries and its workspace's 24 pristine input hashes. All six supplied assets decoded and
an actual Chromium capture passed before spending. No recipe imagery was copied into inputs.

Six fresh serial CLI sessions used the same private backend, high effort, USD 35/60-minute cap,
allowed tools, explicit unrelated-plugin disabling and strict empty MCP configuration. CLI 2.1.278
built-in capabilities remained available. The authorized ceiling was USD 210; there were exactly
six calls, no retries, extra paid judging or executor polish rounds.

| Run | Case / snapshot | Exit / result | Wall minutes | Actual USD |
|---|---|---|---:|---:|
| 1 | Kiln Nine / baseline | 0 / success | 36.17 | 15.032996 |
| 2 | Kiln Nine / candidate | 0 / success | 32.67 | 10.3013615 |
| 3 | Tidal Notes / candidate | 0 / success | 35.00 | 14.426946 |
| 4 | Tidal Notes / baseline | 0 / success | 37.17 | 15.922832 |
| 5 | Form & Sound / baseline | 0 / success | 45.50 | 13.2903835 |
| 6 | Form & Sound / candidate | 0 / success | 38.17 | 13.8690755 |

Total: **USD 82.8435945; 224.67 paid-session wall minutes**, excluding preflight, common evaluation
and human review. No final result reports a permission denial. Successful CLI completion does not
mean technical eligibility or workflow adherence.

## Workflow adherence

All six actual init traces advertise all eleven Awards skills, allow Skill and identify the correct
snapshot root. **All six made zero Skill calls.** No guide/recipe visual read, formal static-before-
motion handoff, or forked jury is evidenced. Plugin script use, self-written checklists and final
capture paths do not prove those workflow steps. This is observed routing non-use with available
tools, not an absent-skill environment failure. Task 10 wording effectiveness and library causality
remain unmeasured; appearance cannot establish that the intended workflow ran.

## Common evidence and gates

All six builds use `npm run build -- --base ./` and the frozen candidate's unchanged audit/capture/
server helpers. Common runtime: Playwright 1.63.0, Chromium 153.0.8010.12, common system fonts,
WebGL disabled. Each arm has 15 standard frames: 0/25/50/75/100% at desktop 1440×900, mobile
390×844 and desktop reduced motion. All 90 captures and six builds succeed with no recorded
console/page/failed-request errors. Application dependencies/lockfiles and frozen input files are
unchanged; pinned GSAP 3.15.0, Lenis 1.3.26 and Vite 8.3.0 have no extraneous app dependency or
shipped font. Final generated-source inventories remain unchanged by evaluation and gallery creation.

The identical final supplemental probe, SHA-256
`5017769a61b9a4595f7de965b4d36c9a0af30a748a7c1582e31e396d1a7b5803`, ran serially on all six
outputs: 18 contexts, 96 additional frames. It verifies exact served dist identity, full lazy-artwork
traversal, native sequential Tab, associated form names, required validation, matched supplied
choices, exact local success disclosures and navigation. Request guards block non-GET/HEAD and
off-origin document/fetch/XHR effects before interaction. All contexts record zero blocked or external
requests, zero errors and no horizontal overflow. Four forms succeed locally without submission;
both journals navigate from the index through all seven excerpt paragraphs and back. A separate,
identical focus-paint probe adds 30 native-Tab screenshots and computed element/pseudo styles.

| Output | Build | Required facts/assets | Clipping observed | Primary action | Reduced-motion content | Technical eligibility |
|---|---|---|---|---|---|---|
| Kiln Nine baseline | Pass | Pass | None | Pass | Pass | Pass tested gates |
| Kiln Nine candidate | Pass | Pass | None | **Fail focus label**; activation passes | Pass | **Fail** |
| Tidal Notes baseline | Pass | Pass | None | Pass | Pass | Pass tested gates; unresolved secondary C01 P1 |
| Tidal Notes candidate | Pass | Pass | None | Pass | Pass | Pass tested gates |
| Form & Sound baseline | Pass | Pass | None | Pass | Pass | Pass tested gates; unresolved secondary C01 P1 |
| Form & Sound candidate | Pass | Pass | None | **Fail focus labels**; activation passes | Pass | **Fail** |

“Pass tested gates” is not a defect-free or complete accessibility verdict. Both ceramic outputs
retain supplied dimensions/material/use/care/disclosures. Both journals retain six titles/categories/
reading times/dates/summaries and the complete excerpt; abbreviated dates and the relocated lead
summary are semantic matches. Both event outputs retain all three days, session times/speakers/rooms,
breaks/closing times, venue/access details, pass prices and local booking disclosure. Paragraph splits,
heading labels and list punctuation explain exact-text probe misses. Standard frames, complete
article states, all full-day schedule captures and rendered/source text were manually reviewed.

Both supplied artworks are present in each output. Form & Sound baseline inlines its header mark:
viewBox, geometry, inherited stroke/fill and rendered identity match the supplied SVG in all three
contexts. Its serialization is not byte-verbatim; that is not an absent-asset failure. Exact input
bytes remain unchanged. Other supplied assets are confirmed by decoded response hashes and rendered
bounds. Derived versions elsewhere are recorded separately below.

### Confirmed rendered contrast findings

Existing rule C01 is P1. Computed foreground/background/font evidence and actual captures override
self-reported “fixed” comments or zero static findings.

- Kiln Nine candidate: `a.btn.btn--primary.site-head__cta:focus-visible` has ink `#15120e` on a
  full-inset `::after` of the same ink, **1:1**, at 13–14px/500. Native Tab makes the header enquiry
  label disappear in desktop, mobile and reduced motion. This fails the accessible-primary gate.
- Form & Sound candidate: focused primary and submit `.btn` labels use cream `#f0ecd8` over the
  full coral `#dc5134` pseudo-background, **3.36:1**, at 11.52–12.96px. Activation works but the
  labels fail the primary-action gate in all three contexts. Separate P1s remain in small artifact
  labels/notes (`#696c61` over `#e4dec4`, approximately **3.97:1**) and mobile CHF 90/35 labels
  (`#dc5134` over `#232823`, **3.77:1**, 17.6px normal).
- Tidal Notes baseline: meaningful filter counts, Issue/Contents labels and article contents numbers
  use `#7e8a8e` over `#e8e7e2`, **2.87:1**, 11px. The “decorative only” token comment is incorrect.
  The primary lead-entry link is unaffected; this unresolved P1 is separate from that narrower gate.
- Form & Sound baseline: Day 03 schedule descriptions/stats use computed `#696c61` over `#f0e2cd`,
  approximately **4.20:1**, 11–15.6px. Required copy remains visible but has an unresolved P1.
  Primary booking controls are unaffected. Decorative wordmarks/ampersands are not counted as
  body-text failures; the inspected sample is not an exhaustive contrast certification.

### Audit exception adjudication

All six unsuppressed source-mirror audits have zero P0/P1/P2 findings. Mirrors preserve authored
application bytes, exclude AWARDS.md/evidence/dependencies/dist, run with cwd inside the mirror, and
have no AWARDS.md ancestor. Remaining P3 X07 markers name actual pieces/entries/days/contents;
S06 omissions concern optional social-preview art (including a noindex 404). These do not fail the
frozen technical gates.

The parser collects rule IDs from `## Exceptions` through EOF, including later “fixed” descriptions.
Tidal baseline therefore suppresses historical M02/M07/C01 mentions; Form & Sound candidate can
suppress X07 despite saying none are open. Independent source review confirms Tidal's M02 blanket
kill was removed and its M07 arrows use fixed-width scale/translation; reduced-motion content and
feedback remain visible. Its C01 “fixed” statement is insufficient: meaningful sea-colored labels
still fail. Unsuppressed static audits do not clear the rendered P1 findings above. No frozen plugin
or generated application was changed to repair them.

## Prompt compliance and execution deviations

Technical eligibility and strict prompt compliance are separate. Supplied art plus HTML/CSS graphics
were allowed. Runs 1–5 authored vector assets outside that literal allowance: both ceramic favicons;
Kiln candidate SVG elevations/scale graphics; both journal favicons and baseline wave/tide SVG; Form
baseline's derived favicon/preloader/receipt and new arcs/schematic. Supplied dimensions remain
correct; the event schematic uses supplied room labels but invented arrangement, explicitly marked
“Diagram, not a map.” Run 6 uses exact supplied SVG plus HTML/CSS, with no new vector asset observed.
These are disclosed prompt deviations, not newly invented automatic technical gates. No additional
image-generation call, app dependency or frozen-input mutation was observed.

Builders used different self-capture tooling and replaced some self-evidence folders; only surviving
self-reports and raw traces are preserved, and self-scores are not comparison scores. Run 1 installed
browser tooling outside its app; command-only environment overrides and additive caches were observed,
not a shared persistent configuration change. Run 6 temporarily chose a different cached Playwright
before returning to the pinned installation. Common evaluation always uses the pinned browser.
Runs 3 and 5 issued broad process-kill commands in their own traces; unrelated impact is not
established. Executor cleanup used proven session/ancestry/cwd/PID-starttime ownership and retained
process inventories. No such broad cleanup was repeated by the evaluator.

## Human review and acceptance

Verified neutral review: [local A/B gallery](http://127.0.0.1:8765/).
External artifact: `/tmp/awards-visual.YU26DB/blind-review/index.html`.
Restart: `/tmp/awards-visual.YU26DB/start-review.sh` (six neutral previews on ports 8766–8771).
The static gallery includes **216 matched images**, full frozen content, page links and the frozen
review dimensions. Copyable textarea export and download work; 18 preference rows and 18 technical
rows begin blank and no local/session storage persists test choices. Six previews match their
original dist bytes. The answer key is separate, outside the gallery. Final notes were added after
initial publication; the initial version is preserved and all focus images were already present.

### Submitted preferences — 2026-09-23

Reviewer `simon` submitted all 18 preference selections at `2026-09-23T05:38:31.461Z`.
The [original review JSON](visual-comparison-review-2026-09-23.json) preserves every submitted
value, including empty strings. It was archived before decoding the final answer key. The frozen
assignment was Kiln Nine A = candidate / B = baseline; Tidal Notes and Form & Sound A = baseline /
B = candidate. The earlier draft assignment was not used.

| Case | Composition | Typography | Imagery | Distinctiveness | Mobile | Overall |
|---|---|---|---|---|---|---|
| Kiln Nine | tie | tie | baseline (B) | tie | tie | tie |
| Tidal Notes | candidate (B) | tie | tie | tie | tie | candidate (B) |
| Form & Sound | tie | tie | tie | tie | tie | candidate (B) |

Across all dimensions: 3 candidate selections, 1 baseline selection and 14 ties. The acceptance
rule uses Overall and Mobile separately, not this pooled count: **2/3 candidate Overall wins,
1 Overall tie, and 3/3 Mobile ties**. Kiln Nine's imagery favors the baseline. No other dimension
has a declared preference.

All 18 visible-reason fields, all 18 technical-evidence fields and all three case notes are blank.
The form is therefore incomplete against the requested rationale requirement; the missing reasons
are unmeasured, not inferred from screenshots or filled by the executor. Kiln Nine's reduced-motion
checkboxes are also blank for both arms. Its common reduced-motion checks remain recorded as passing,
without attributing that finding to the reviewer.

The submitted form marks both arms' primary action and overall eligibility as passing in every
case. Those observations are preserved alongside the measured evidence: they do not clear the
native-Tab focus-contrast failures in Kiln Nine candidate (A) and Form & Sound candidate (B).
The common technical-eligibility table and its confirmed findings remain unchanged.

Preparation was visible to the reviewer and some early Kiln Nine screenshots were shown with a
baseline label. An unpublished draft order was exposed, then replaced with a different privately
frozen counterbalanced assignment before review. This is neutral A/B presentation with **limited
practical blinding**, not protected blinding. Technical findings may also inform preferences.

Acceptance requires candidate Overall preference in at least two cases, no Mobile preference
regression and no new blocking technical failure. The submitted choices meet the first two
thresholds; the final condition fails on two candidate outputs. **Result: favorable declared visual
preferences, failed pilot acceptance, and unmeasured library/workflow benefit.** Three one-shot
pairs, workflow non-use, missing reasons, prompt deviations and visible preparation prevent causal
or universal-superiority claims. Implementation/evidence delivery and preference recording are
complete; the human rationale remains incomplete. No failed target authorizes another paid call.

## Evidence and next work

External root `/tmp/awards-visual.YU26DB` retains the private run ledger/traces, original workspaces,
frozen archives/inventories, `sanitized-ledger.json`, `canonical-probe-ledger.json`,
`final-source-preservation.json`, `review-verification.json`, publication history, the final
`private-answer-key.json` and `human-review-simon-2026-09-23.json`. Each numbered
`builds/` directory includes `common-evidence/`, `common-probe-v3/`, `focus-evidence/`,
`audit-adjudication/`, `final-integrity.json`, `technical-adjudication.json` and
`contrast-adjudication.json`. Raw runtime identifiers must stay outside repository/public artifacts.
Earlier v1/v2 probes are retained: v1 lacked lazy traversal/sequential focus, and v2 used mismatched
ceramic choices. Those gaps were unmeasured evidence, not app failures; final v3 uses Low bowl and
Three days consistently on both arms. Focus-paint evidence is a separate common supplement.

Next scoped work: diagnose why advertised skills are not invoked; improve rendered keyboard-focus
and surface-specific contrast review; address the audit exception parser's section boundary. These
are follow-up investigations, not changes to this frozen pilot. Real-device performance remains
unmeasured. Reviewed implementation changes were copied into the original working tree on
2026-09-22, preserving the user's existing edits. Human selections were recorded on 2026-09-23;
no new build, repair, paid call or publication accompanied this update.
