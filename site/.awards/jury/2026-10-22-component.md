# Jury report — component `#sheet` (home, first viewport: the strip, the job line, the ringed install ticket) — 2026-10-22

disposition: fix
Design 7.9 · Usability 8.0 · Creativity 8.0 — mean 7.97
1. Strip caption: the build id must tell the frames' build from the build being read (facts/collect.js:42–50 → dist/index.html:83, :298)
2. Strip frames: author a pointer hover (src/styles/site.css:128–132)
3. Copy: make a refused clipboard visible on the ticket, not only in the sr-only status (src/ui/copy.js:27–29)

Component pass, not a page round: scored at the static checkpoint after the stack phase (contract bootstrapping state b: frames from a capture, no page-round report, so no marks and no jury sentence; the strip's follow, the s00 ring draw and the marks are the motion phase's and were not marked down).

## Evidence
- Recorded manifest: `.awards/captures/20261022T141210Z-stack-2/home/manifest.json`. Valid in itself (0 page errors, 0 console errors, 0 failed requests). It is **stale** for this pass: `src/styles/site.css` (14:20:38) and `dist/` (14:20:40) are newer than its frames (14:12:13). It also has no `--selector` component frames. Not used for scoring.
- Fresh component capture: `.awards/captures/20261022T142648Z-component/`. Doctor first: `node scripts/doctor.mjs site-next --json`, ready, Chromium 141 and WebGL2. Every run went one at a time under the shared lock through `.awards/locked.mjs`, all against `dist`, all exit 0, 0 page errors, 0 console errors, 0 failed requests, CLS 0, long tasks 0.
  - `manifest.json`: `--selector "#sheet" --hover "[data-fact=commands-claude-code] li:nth-child(1) .copy" --tablet 834x1194 --reduced-motion`. Frames: `desktop-component-sheet.png`, `desktop-component-sheet-hover.png`, `tablet-component-sheet.png`, `mobile-component-sheet.png`, `desktop-rm-component-sheet.png`, `desktop-rm-component-sheet-hover.png`.
    - The desktop strip (`nav.strip`, dist/index.html:68–84) sits outside `#sheet`, so the selector crop misses it at desktop and tablet. The viewport frames below carry it.
    - The phone component crop is taller than the glass. Its stitched screenshot shows the sticky band over the job line, a capture artefact: `phone-mobile-s00.png` is clean.
  - `page-manifest.json`: `--name page --only desktop --scroll 0 --reduced-motion --states <plan>`. Frames: `page-desktop-s00.png`, `page-desktop-rm-s00.png`, and these states, each also at `desktop-rm`:
    - `page-desktop-state-strip-hover.png`
    - `page-desktop-state-strip-keyboard.png`: focus s00, then ArrowRight
    - `page-desktop-state-strip-jump.png`: focus s50, then Enter; `awardsState.scroll` 0.5
    - `page-desktop-state-ticket-copy-hover.png`
    - `page-desktop-state-ticket-copy-keyboard.png`: focus Copy 1, then Tab
    - `page-desktop-state-ticket-copy-pressed.png`
    - `page-desktop-state-tab-walk.png`: seven Tabs from the top
  - `tab-manifest.json`: `tab-tablet-s00.png`.
  - `phone-manifest.json`: `phone-mobile-s00.png`, plus states `phone-mobile-state-frames-open.png`, `phone-mobile-state-row-keyboard.png` and `phone-mobile-state-ticket-copy-tap.png`.
  - `active-manifest.json`: held mouse-down states `active-desktop-state-ticket-copy-active.png` and `active-desktop-state-strip-frame-active.png`.
  - `copied-states.json`: a juror script under the lock that grants clipboard permission, which `capture.mjs` cannot. Frames: `desktop-state-ticket-copied.png` and `mobile-state-ticket-copied.png` (button "Copied", status "Copied: /plugin marketplace add burgisimon/awards", clipboard holds the command). Also `desktop-state-ticket-copied-refused.png`, without permission: button unchanged, status "The clipboard refused; select the command and copy it by hand." in the sr-only region only.
  - This directory has no `routes.json`, so `npm run proof` never selects it.
- Coverage (Page map row 1 and FIRST VIEWPORT):
  - desktop 1440: strip column, job line, sentence, ringed ticket
  - tablet 834: 22 % strip
  - phone 390: 56 px band, job line, ticket, then the frame row
  - 320 px: measured
  - reduced motion
  - states: rest, hover, focus-visible, active, copied, refused, Frames open, keyboard rove and jump, coarse-pointer tap
  - Every frame listed above was opened. Reduced-motion frames are pixel-identical to the full tier, which is expected before the motion phase.
  - DOM measurement at 1440, 834, 390 and 320: every Copy is 72 × 44 px; the rebate targets are 44 px tall; there is no horizontal overflow at any width; the ring stays 8–10 px inside the glass on phones.
- Audit: `.awards/audit.json` (2026-10-22 14:21:10 UTC, rendered from `dist`, axe-core 4.14.0): P0 0 · P1 0 · P2 0 · P3 0. Exceptions X02@docs.html, X07@docs.html, X18@recipes.html (outside this component).
- Console / page errors: 0.

## Scores
| Axis | Score /10 | One-line reason |
|---|---|---|
| Design | 7.9 | A committed four-token world held at 1440, 834 and 390: proof paper, ink, edge print, one red only on the select. Enriqueta voice, Saira Condensed edge print, system mono only in commands. Two seams: the strip's frames have no pointer state, and the caption names the same build as the footer while the s00 frame shows another layout (`page-desktop-s00.png` vs `dist/proof/20261022T140258Z-stack/home/desktop-s00-1440.webp`) |
| Usability | 8.0 | Every path has a key: skip link first, the strip is one tab stop with arrows and Enter (`page-desktop-state-strip-jump.png`, scroll 0.5), and Copy's focus is ink fill plus ring. Targets are 44 px at every width, the phone path is designed (ticket before frames), and the reduced tier is readable. Friction: a refused clipboard is silent to sighted readers, and Copy's fill sticks after a tap |
| Creativity | 8.0 | The page shows its own captures in a black rebate, each a link to its depth, beside a select ringed in grease pencil: the concept is enacted with real evidence, not decoration. The hand-drawn circle and a thumbnail strip are known moves, and until the next proof refresh the s00 frame does not show the strip, so the recursion reads less than it will |
| **Mean** | **7.97** | (7.9 + 8.0 + 8.0) / 3; no cap applies (specificity no, slop families 0, effects carry the concept) |

States inventory:
- rest: authored, at all three widths.
- hover:
  - Copy: authored, ink fill (`desktop-component-sheet-hover.png`).
  - Strip frame: **unauthored**, 0 px changed (`page-desktop-state-strip-hover.png`).
- focus-visible:
  - Copy: ink fill plus offset ring (`page-desktop-state-ticket-copy-keyboard.png`).
  - Strip frame: paper ring on the rebate (`page-desktop-state-strip-keyboard.png`, `phone-mobile-state-row-keyboard.png`).
- active:
  - Copy: steps to the muted ink, as DESIGN.md says (`active-desktop-state-ticket-copy-active.png`).
  - Strip frame: none, 0 px changed (`active-desktop-state-strip-frame-active.png`).
- copied: authored (`desktop-state-ticket-copied.png`). Refused: invisible (`desktop-state-ticket-copied-refused.png`).
- open / closed: the Frames disclosure drops a rebate-black panel listing s00–s100 in words, with the caption (`phone-mobile-state-frames-open.png`).
- reduced motion: readable, rings drawn (`desktop-rm-component-sheet.png`).
- coarse pointer: the frame row is native overflow with a peek of the next frame. Copy's hover fill persists after a tap (`phone-mobile-state-ticket-copy-tap.png`).
- keyboard: tab order is skip link, wordmark, Install, Docs, Recipes, Source, then the strip (`page-desktop-state-tab-walk.png`); the Frames summary is out of the desktop order.

Walk at component scale:
- walk 1 — pass — skip link first and lands past the strip; strip roving tabindex; Enter jumps through `__awards.scrollTo`; Copy has a ring.
- walk 2 — pass — 44 px targets everywhere; the phone row is native overflow; note the sticky hover (craft 3).
- walk 3 — pass — `desktop-rm-*` is readable and the state changes survive (jump to 0.5 under reduced motion).
- walk 4 — pass — no gate.
- walk 5 — pass — what, for whom and the action are all in s00.
- walk 6 — pass — the strip works as a jump rail; the depth cue is the motion phase's.
- walk 7 — pass — install is the one action, in the first viewport and in the rebate.
- walk 8 — pass — no canvas; 320 px has no overflow; long commands hang at 2ch.

## Memory test
"A black film strip down the left edge holding screenshots of the very page you are on, and the install commands circled by hand in red, like the chosen frame on a contact sheet."

## Specificity test
no. The card a juror might still name, `[site:siena]`, is a black ground with cream tickets, sprockets, grain and amber stills. This is white proof paper, a flush black rebate, no grain and no film stock, and the frames are this page's own.
- okaydev — §8 "mouse-only hover credits: these are what to beat". The strip beats it on keyboard (roving tabindex, paper ring) and loses the pointer half: hovering a frame changes 0 px (`page-desktop-state-strip-hover.png` vs `page-desktop-s00.png`). Neighbour frame not captured in component mode.
- siteassist — §8 "one accent token that exists only on CTAs". Here the hue is a 3 px stroke enclosing the ask, not its fill. The ask reads by enclosure; the four Copy buttons stay ink, and the red covers under 1 % of the viewport (`desktop-component-sheet.png`). Neighbour frame not captured in component mode.
- primesec — §8 "a separate lighter model below a breakpoint". The phone drops the sticky column for an inline overflow row of 154 px phone frames after the ticket, plus a text list in the Frames disclosure: a lighter path, not a shrunk one (`phone-mobile-state-row-keyboard.png`, `phone-mobile-state-frames-open.png`). Neighbour frame not captured in component mode.

## Slop scan
families present: 0
- Audit: no X, L or T findings.
- Judge rows walked on the captures:
  - The hand-drawn ring is in the world's own hand (DESIGN.md Shapes).
  - The job line is seven words, upright.
  - Three faces, each with one job.
  - The paper is a derived near-white with no tracked mono and no hairlines.
  - The version and capture stamps are facts of the sheet named by WORLD.
  - The commands are not in a terminal mock-up.
  - Text is clear of every box edge.
generator nameable: no

## Contract fidelity
| Block | Kept? | Evidence (capture, file:line) |
|---|---|---|
| WORLD | kept | Paper `#fcfbf8`, ink rebate, edge print on black, red only on the ticket ring and the Install underline (`page-desktop-s00.png`, `tab-tablet-s00.png`, `phone-mobile-s00.png`). Enriqueta at 104 px in two lines on the paper x 424–1380; system mono only in `code`; radius 0; no shadow |
| SIGNATURE | not kept (one clause) | Kept at this phase: the sticky 360 px column of this page's desktop frames, about 300 px each, stop and stamp on each; per width class (tablet strip in `tab-tablet-s00.png`; phone row and disclosure); jump rail and keyboard (`page-desktop-state-strip-jump.png`, `-strip-keyboard.png`); alt text names stop, width and stamp (`page-desktop-aria.yml`); unmarked and labelled "as the capture shot them" in state b. Not kept: the Cost and risk clause "the frames always show the build before the one being read, and the caption says so" and LOAD & CLOSE "a reader therefore sees when the frames are of an earlier build". The caption reads "build 0.7.0+e11b790" (dist/index.html:83), the footer reads "This is build 0.7.0+e11b790" (dist/index.html:298), and `awardsState.build` is the same with `buildDirty: false` (`page-manifest.json`). Yet the s00 frame shows the state-c layout (top band, ticket beside the lede), not the page beside it. The id comes from the git hash plus a dirty check that ignores untracked files (facts/collect.js:42–50) [inferred: the site's own edits never change it] |

## Material fixes
### Floor (uncapped: fidelity, walk 1 and 3, audit P0/P1)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| facts/collect.js:42–50 (feeds the strip caption dist/index.html:83, the Frames panel caption dist/index.html:56 and the footer dist/index.html:298) | Derive the build id so it changes when the site's own sources change: count the site's untracked and uncommitted files in the dirty check, or append a hash of the built sources | The strip caption names a build different from the footer's whenever the frames show an earlier layout | desktop and tablet s00 (strip caption), phone Frames open | `.awards/captures/20261022T142648Z-component/page-manifest.json` (`build 0.7.0+e11b790`, `buildDirty false`) + `page-desktop-s00.png` vs `dist/proof/20261022T140258Z-stack/home/desktop-s00-1440.webp` | pending | unresolved |

### Craft (at most 5, inside the contract)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| src/styles/site.css:128–132 (`.frame` in `.strip__list` and `.chapter__frames--row`) | Author a pointer hover under `@media (hover: hover)` in the world's vocabulary: the 2 px paper outline that focus and the current frame already use (DESIGN.md Elevation, Components "every control … authored hover") | Hovering a strip frame outlines it; pressing it gives a visible step | desktop and tablet strip, hover and active | `page-manifest.json` + `page-desktop-state-strip-hover.png` (0 px changed against `page-desktop-s00.png`), `active-manifest.json` + `active-desktop-state-strip-frame-active.png` (0 px) | pending | unresolved |
| src/ui/copy.js:27–29 | When `writeText` rejects, select the command's text and say so on the ticket itself (the button label or a visible line), not only in the sr-only `role=status` | After a refused click the command is highlighted and the ticket tells a sighted reader to copy it by hand | desktop and phone, clipboard refused | `copied-states.json` + `desktop-state-ticket-copied-refused.png` (button unchanged; message only in the sr-only status) | pending | unresolved |
| src/styles/site.css:483 (`.copy:hover, .copy:focus-visible`) | Put `.copy:hover` inside `@media (hover: hover)`; keep `:focus-visible` unconditional | After a tap the button shows "Copied" for 2 s and then returns to the paper ground instead of staying ink-filled | phone, coarse pointer after tap | `phone-manifest.json` + `phone-mobile-state-ticket-copy-tap.png` (filled "Copy" after the tap), `mobile-state-ticket-copied.png` | pending | unresolved |

## Keep
The strip of this page's own black-rebated frames beside the one red-ringed ticket, the only red on the paper. Page-level note: refresh the proof (`npm run proof`) from a routes capture of the current build, so that the strip's s00 frame shows the strip itself; `20261022T141210Z-stack-2` predates the 14:20 CSS change.

## Ceiling
Ceiling: the command just copied is never marked by the hand that ringed the ticket; an inverted button says "Copied" where a grease-pencil tick beside that command would.
