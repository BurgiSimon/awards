# Jury report — <target> — <date>

disposition: ship | fix | rebuild | recapture
<!-- Measured site reply: disposition: ship|fix|rebuild, then the numeric line below.
Missing-render reply: disposition: recapture, then the all-unmeasured line below.
Component reply uses only D/U/C and mean; omit Content and developer rows. -->
Design x.x · Usability x.x · Creativity x.x · Content x.x — weighted w.ww
<!-- or: Design unmeasured · Usability unmeasured · Creativity unmeasured · Content unmeasured — weighted unmeasured
component measured: Design x.x · Usability x.x · Creativity x.x — mean x.xx
component unmeasured: Design unmeasured · Usability unmeasured · Creativity unmeasured — mean unmeasured -->

## Evidence
- Manifest: `<recorded-manifest-path>` — valid: yes / no
- Coverage from this manifest and Page map: applicable chapters at desktop/mobile, mobile middle/close, reduced-motion sections, required named states — name each inspected frame or gap
- Audit: `.awards/audit.json` (<date>) — P0 n · P1 n · P2 n
- Console / page errors: n

## Scores
| Axis (weight) | Score /10 | One-line reason |
|---|---|---|
| Design (40) | | |
| Usability (30) | | |
| Creativity (20) | | |
| Content (10) | | |
| **Weighted** | | SOTD threshold ≥ 7.2 with no axis < 6.8; unmeasured when captures are invalid |

| Developer criteria | Score /10 | Note |
|---|---|---|
| Animation and interaction | | |
| Performance | | |
| Responsive | | |
| Accessibility and semantics | | |
| Code quality | | |

<!-- Without valid rendered evidence, every value above is unmeasured. For a component, use only Design, Usability and Creativity with their mean; omit Content and the developer table. -->

## Memory test
What a visitor who left after one viewport describes an hour later — an object or a behaviour, never a mood:

## Specificity test
Could a juror name a source site from the first viewport? no / yes — which, and what to change:
<!-- component: one scale, density or finish delta per DIVERGENCE card, from its §8 -->
<!-- finish bar, one line per DIVERGENCE card: <slug> — <finish gap> — <build capture> vs <neighbour capture>, or <slug> — neighbour frame unavailable -->

## Slop scan
families present: n
<!-- one line per family: <family> — <capture, file:line or rule id>; earned uses recorded under ## Exceptions do not count -->
generator nameable: no / yes (two or more families)

## Contract fidelity
| Block | Kept? | Evidence (capture, file:line) |
|---|---|---|
| THESIS | | |
| WORLD | | |
| STORY | | |
| FIRST VIEWPORT | | |
| SIGNATURE | | |
| SCROLL MODEL | | |
| LOAD & CLOSE | | |

<!-- Missing rendered evidence: mark visual memory and fidelity unmeasured. Component: keep only WORLD and SIGNATURE when owned. -->

## Source findings
<!-- On recapture, put located file:line source observations here. Never infer a visual score from them. -->

## Material fixes
### Floor (uncapped: fidelity, walk 1 and 3, audit P0/P1)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| | | | | manifest + frame | pending | unresolved |

### Craft (at most 5, inside the contract)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| | | | | manifest + frame | pending | unresolved |

## Keep
One line naming what must not be diluted while fixing.

## Ceiling
Ceiling: <one sentence: the world-native device the build never uses; never a fix or a score change>

<!-- Verdict pass (after ship applies fixes): replace the sections above with
## Verdict
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| | | | | manifest + frame | manifest + frame | resolved / partial / unresolved |
## Regressions (≤ 3)
## Keep
<original Keep line; confirm it remains visible>
## Remaining
clear / list
disposition: <recomputed>
-->
