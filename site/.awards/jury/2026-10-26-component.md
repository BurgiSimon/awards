# Jury report — component `#top` (home, first viewport: the two-state display line, the install ticket, the gathered builds under the sentence) — 2026-10-26

disposition: fix
Design 7.8 · Usability 8.1 · Creativity 7.8 — mean 7.90
1. Command strips: hang every continuation line by 2ch, so a wrapped command never reads as a second command (src/styles/site.css:122–126)
2. The correction: start "Done"'s slide only once "Stunning." has faded, so the two words never share ink (src/motion/claim.js:44–46)
3. Reduced tier: keep the five frames at rest in the pile instead of emptying the lower left of the first screen (src/styles/site.css:196–197, src/motion/gather.js:34, :105–107)

This is a component pass, not a page round. The motion for this viewport is built, and it was judged as built: the correction, the gathering's travel and the copy states. `## Status` is untouched.

## Evidence
### Handed capture
- Manifest: `.awards/captures/20261026T144310-component/manifest.json`, target `dist`, built 14:43:10, captured 14:43:11.
  - Valid: 0 page errors, 0 console errors, 0 failed requests.
  - Not stale: no source file is newer than its frames, only `AWARDS.md`, and `dist/` is newer than every file in `src/`, `facts/` and `public/`.
  - CLS 0.0031 on desktop, 0 on tablet and phone, one long task.
  - Frames opened:
    - `desktop-s00`, `-s10`, `-s20`
    - `tablet-s00`
    - `mobile-s00`, `-s10`
    - `desktop-rm-s00`, `-s10`
  - Its default hover and focus frames are the band's links (awards, Install, How a build goes), not the component's controls.

### Fresh component captures (this pass)
All runs were one at a time under `.awards/capture.lock`, against `dist`, and every one exited 0 with 0 page, console and request errors.
- `.awards/captures/20261026T144549-component-jury/manifest.json`
  - Flags: `--selector "#top" --hover "#client-claude li:first-child button[data-copy]" --reduced-motion --only desktop --states <plan>`
  - Component frames: `desktop-component-top.png`, `desktop-component-top-hover.png`, `desktop-rm-component-top.png`, `desktop-rm-component-top-hover.png`
  - States, each also as `desktop-rm-state-*`: `desktop-state-copy-focus`, `-copy-hover`, `-copy-press`, `-copy-clicked` (refused clipboard), `-copy-keyboard-enter`
- `.awards/captures/20261026T144549-component-jury-phone/manifest.json`
  - Frames: `mobile-component-top`, `mobile-state-switch-codex`, `mobile-state-switch-keyboard` (focus on Claude Code, then ArrowRight), `mobile-state-copy-tap` (refused clipboard)
- `.awards/captures/20261026T144549-component-jury-timeline/manifest.json`
  - Flags: `--timeline 0,150,350,600,900,1300,2000`
  - Frames: `desktop-t00000` … `desktop-t02000` and `desktop-timeline.png`, the correction on a held clock.
- `.awards/captures/20261026T144549-component-jury-probe/probe.json`
  - A juror script under the same lock (`.awards/locked.mjs`). It grants clipboard permission, which `capture.mjs` cannot.
  - Frames: `desktop-state-copy-copied.png`, `mobile-state-copy-copied.png`, `mobile-state-copy-after.png` (2.3 s later), `mobile320-s00.png`
  - Measured: Tab order, target sizes, and overflow at 390 and 320 px.
- The plans in `.awards/capture-states*.json` target the previous build (`.strip`, `#select-open`) and were not used. This pass's plans are in the juror's scratchpad, and the manifests keep them in `interactiveStates`.

### Coverage (Page map row 1 and FIRST VIEWPORT)
- Widths: desktop 1440, tablet 834, phone 390, phone 320.
- The correction: frames at 0, 150, 350, 600, 900, 1300 and 2000 ms.
- The gathering at rest (s00) and mid-travel (s10). s20 shows the landing.
- Reduced motion.
- States: rest, hover, press, focus-visible, copied, refused, keyboard Enter, the phone switch by tap and by arrow key, and tap on a coarse pointer.

### Audit
- I re-ran the audit, because `.awards/audit.json` (14:41) predated edits at 14:43.
- Static run (`audit.mjs . --json`, 14:44:03): 35 files, P0 0 · P1 0 · P2 0 · P3 0.
- Rendered run (`--render --json`, 14:44:43, from `dist`, axe-core 4.14.0): P0 0 · P1 0 · P2 1 · P3 2, none inside `#top`:
  - L07 on tablet: a paragraph elsewhere on the page.
  - A18 on mobile: the record's trail links, 43 × 44 px.
  - P09: `extinct-desktop.webp` at 960 px, drawn at 888 px.
- No A16 (axe-core) violations.
- Exceptions: X02@docs.html, X07@docs.html, X18@recipes.html.

### Console and page errors
0 across all five manifests.

## Scores
| Axis | Score /10 | One-line reason |
|---|---|---|
| Design | 7.8 | A committed world, held at 1440, 834, 390 and 320 (`desktop-component-top`, `tablet-s00`, `mobile-s00`, `mobile320-s00`): one mid-green verdict ground, warm ink, paper only on the action, Gloock at 128 px in two locked lines, Familjen for text, mono only in commands, flat frames with ink keylines and no shadow. Three seams: the hand-over frame of the correction smears "Stunning." into "Done." (`desktop-t00600`); the reduced tier leaves the lower left of the first screen as bare ground (`desktop-rm-component-top`); and a wrapped command has no hanging indent (`mobile320-s00`) |
| Usability | 8.1 | The conversion is the first viewport: four copy targets at 1440 and 834, and on a phone one client's two lines at 489–626 px of 844, with a 44 px switch (`probe.json`). Tab order: skip link, band, the four Copy buttons in reading order, each named "Copy <command>". Enter copies, and the refused clipboard is said on the ticket (`desktop-state-copy-keyboard-enter`). Friction: at 320 px the first command breaks into three flush lines, and on a phone the refused-clipboard line says "press Ctrl+C" (`mobile-state-copy-tap`) |
| Creativity | 7.8 | The line is the argument: a model's self-praise struck out once by a rule, then corrected into the plugin's own definition of done, over the real builds the jury judged, which then travel into their verdict rows. Known parts: the two-state typographic hero is a named archetype, a strike-through correction is a familiar gag, and a pile of site captures is a collage move. The correction lasts about 1 s once per session, so most later looks at this viewport show only the settled line |
| **Mean** | **7.90** | (7.8 + 8.1 + 7.8) / 3. No cap applies: specificity no, slop families 0, and the effects carry the concept |

### States inventory
- Rest: authored at all four widths.
- Hover:
  - Copy, fine pointers only: the ink lifts toward paper (`desktop-state-copy-hover`, `desktop-component-top-hover`).
  - The pile has `pointer-events: none` and is `aria-hidden`, so no hover is owed.
- Active: an inset paper ring on the lifted ink (`desktop-state-copy-press`).
- Focus-visible:
  - Copy: a 2 px ink ring at a 2 px offset, the same in reduced motion (`desktop-state-copy-focus`, `desktop-rm-state-copy-focus`).
  - Phone tab: an ink ring (`mobile-state-switch-keyboard`).
- Copied: a paper ground with an ink inset and the label "Copied". The status reads "Copied: /plugin marketplace add burgisimon/awards", the clipboard holds the command, and the label returns to "Copy" after 2 s (`desktop-state-copy-copied`, `mobile-state-copy-copied`, `probe.json`).
- Refused: the command is selected, the button reads "Selected", and a visible line says which key to press (`desktop-state-copy-clicked`). On a phone that key is wrong (`mobile-state-copy-tap`).
- Open / closed, the phone client switch: tap and ArrowRight both swap the panel, `aria-selected` follows, and the Codex lines sit at the same place (`mobile-state-switch-codex`, `mobile-state-switch-keyboard`). Home and End are not handled.
- Reduced motion: the claim is settled from the first paint and the copy states survive, but the pile is absent (`desktop-rm-component-top`, `desktop-rm-state-copy-*`).
- Coarse pointer: no sticky hover after a tap (`mobile-state-copy-after`). Copy is 88 × 65 px and the tabs 175 × 44 px.
- Keyboard: see the walk below.

### The correction, frame by frame (`desktop-timeline.png`)
- 0 and 150 ms: "Stunning. Done." in full ink.
- 350 ms: the rule is drawn through "Stunning."
- 600 ms: "Done" slides left over the half-faded "Stunning", and the two read as "StunninDone." in two inks (`desktop-t00600`).
- 900 ms: "Done when a jury / says ship." settled.
- Nothing moves after that, and the lede, ticket and pile never shift.
- The load signal is fonts plus the first two frames' `decode()`, with a 1.5 s ceiling (src/main.js:28–36). The claim plays once per session (index.html:20, src/motion/claim.js:16).

### Walk at component scale
- walk 1 — pass — Tab order: skip link, wordmark, Install, four links, then Copy ×4 at y 508–726, then the sort (`probe.json`). Every Copy has a visible ring (`desktop-state-copy-focus`), Enter copies (`desktop-state-copy-keyboard-enter`), and the phone tabs take arrows. Note: each button carries both `aria-label="Copy <command>"` (dist/index.html:81) and `aria-describedby` on the same command (src/ui/copy.js:32–33), so a screen reader hears the command twice.
- walk 2 — pass — Copy 88 × 52 (desktop) and 88 × 65 (phone), tabs 44 px tall. Hover is inside `@media (hover: hover)` (src/styles/site.css:134), with no sticky fill after a tap.
- walk 3 — pass — reduced: readable at rest, nothing at opacity 0, copy and focus states intact (`desktop-rm-component-top`, `desktop-rm-state-copy-clicked`). The missing pile is a design seam, not a readability failure.
- walk 4 — pass — no gate. The final claim is in the `h1` throughout, and the first state is an `aria-hidden` overlay (index.html:53). S11 did not fire.
- walk 5 — pass — what it is, for whom and the action are all on screen at s00 on desktop and phone.
- walk 6 — pass — the band is present. Deeper wayfinding is the page's job.
- walk 7 — pass — install is the one action, as four real copy targets beside the sentence. Install in the band is the second path.
- walk 8 — pass — no canvas (`canvases: 0`), and no overflow at 320 px (`scrollWidth` 320). Long commands wrap, but without a hang (craft, and fidelity below).

## Memory test
"A green page with a giant black serif line 'Done when a jury says ship.' over a pile of black-framed screenshots of sites it built, and the install commands set as cream copy strips."

(Written from `desktop-s00` before the contract was read. The correction is not in it, because the frame shows the settled state; on the held timeline, "Stunning." is struck at 350 ms.)

## Specificity test
**Could a juror name the source site? No.**

The nearest card on sight is `[site:okaydev]`: a saturated green field with other people's work in frames around a black headline (`.awards/neighbours/okaydev/desktop-s00.png`). Its identity is absent here:
- the centred stacked grotesque with the last word on a black slab
- tiles orbiting the headline with soft shadows
- the marquee
- the pill navigation

This build sets a left-aligned high-contrast serif on a mid green, with flat keylined frames piled in one quadrant, and its ground changes per chapter.

**competitor: Anthropic's `frontend-design` plugin for Claude Code [recalled medium] — breaks.**
- That plugin, or a v0 or Lovable gallery, could use the pile of builds and the four command strips.
- It could not use the line, or the travel into rows of jury verdicts: no juror sends its work back.
- The contract's competitor line (impeccable) was read in the same pass as the rest of the contract, so this test is not fully independent. The competitor named here is a second one the contract did not test, and it breaks for the same reason.

**One delta per DIVERGENCE card, from each card's §8:**
- okaydev — §8 refuses its tile scatter. Density delta: okaydev hangs about 13 tiles at five or more sizes around the headline. Here five frames sit at about 20–32 % of the width in one quadrant, three visible above the desktop fold. They have a 2 px ink keyline and no shadow (`desktop-component-top` vs `.awards/neighbours/okaydev/desktop-s00.png`). The frames are flatter and fewer, which the contract asks for.
- animejs — §8: "the time-based onEnter reveal with no reduced-motion branch … the one thing a jury can prove is broken". Beaten here: the correction has a settled reduced and static branch (`desktop-rm-component-top`). But the same branch drops the pictures from the first screen (craft 2). No animejs neighbour frame is on disk; the card's §8 was used.
- leo-parpeix — §8 takes "the two-state hero headline". Scale delta: here the two states share their first word, run at 128 px over eleven columns, and the second state is the real `h1`. Finish gap: the hand-over frame shows both states in one place at once (`desktop-t00600`). The card's two states never overlap in ink [recalled medium]. No neighbour frame is on disk; the card's §8 was used.

## Slop scan
families present: 0
- Audit: no X, L or T finding inside `#top` (rendered and static).
- Judge rows walked on the captures:
  - Display headline: six words, and it is the hero archetype. Earned.
  - Serif display: Gloock is the voice across the system (the four words, chapter heads), per DESIGN.md. Earned.
  - Cream: paper appears only on the action's strips. The ground is a derived verdict green, so it is not a cream palette.
  - No terminal mock-up, no window or device chrome on the frames, no glow, no gradient, no eyebrow, no metric row.
  - Text clears every edge; commands sit 16 px inside their strips.
  - Text passed over during the travel (`desktop-s10`: the record's intro and floor note under the flying frames) is readable at rest (`desktop-s20`), and no action is covered while it can be pressed. Earned under the row "a layer passes over on its way through".
- House concept (wave 1):
  - No page as an object.
  - No capture of this page: two of the five frames are this site's earlier builds, labelled as such in the record.
  - No readout in the margin.
  - The pictures are real captures, not code-only imagery.
  - No light duotone.
  - The travel is a transition into a stage the visitor then operates (the sort), not a process the scroll performs.
  - 0 devices.

generator nameable: no

## Contract fidelity
| Block | Kept? | Evidence (capture, file:line) |
|---|---|---|
| WORLD | kept | Ship ground `#5cb973` and ink `#18130e` (src/styles/tokens.css:5–6, :67); paper only on the command strips (src/styles/site.css:117–121). Gloock display, Familjen text, system mono only in `code` (`desktop-component-top`, `mobile-s00`). The builds' frames are flat rectangles with no chrome or shadow, and depth comes only from overlap (`desktop-s00`). No glass, glow, gradient or grain. The swap to the fix ground at the chapter boundary is visible at `desktop-s10` |
| FIRST VIEWPORT | not kept (one clause) | Kept: the band with Install filled (`desktop-s00`, `mobile-s00`). The line at 128 px on two lines (rendered audit: h1 128 px, 2 lines; 44 px, 2 lines at 390). The sentence at 21 px beside the ticket on cols 7–12. Four command lines, each with its own Copy, named by its command (dist/index.html:81–82). The gathering inside the first screen at about 32 % for the largest frame (`desktop-s00`). The correction once, after fonts and `decode()` with a 1.5 s ceiling, about 0.9 s (`desktop-timeline.png`; the masked arrival changed to opacity in Page map row 1). On the phone the action comes before the pictures (pile top at 650 of 844, `probe.json`). Not kept: the phone clause "wrapping at spaces with a hanging indent". Continuation lines start flush with the command (`mobile-s00`, `mobile-state-switch-codex`). At 320 px "/plugin marketplace add burgisimon/awards" breaks into three flush lines (`mobile320-s00`). `.command code` has no indent rule (src/styles/site.css:122–126), and DESIGN.md:148 dropped the clause |
| SIGNATURE (opening state only: the gathering) | kept | Five frames overlapping under the sentence, none at one size (PILE.wide 0.62–0.42 of the pile's width, src/motion/gather.js:10–17). They travel by transform only on a linear scrub from the one ticker (gather.js:62–98), mid-travel at `desktop-s10` and landed at `desktop-s20` (`awardsState.gather.p` 1). Reduced tier: frames in their rows, no travel (`desktop-rm-s10`). The 160 ms opacity step the contract names for the reduced tier is not visible, because the pile is never shown in that tier (craft 2) |

## Material fixes
### Floor (uncapped: fidelity, walk 1 and 3, audit P0/P1)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| src/styles/site.css:122–126 (`.command code`); the same rule serves `.ticket--close` and /install | Hang continuation lines by 2ch: indent every line after the first (for example `padding-left: calc(16px + 2ch); text-indent: -2ch` on a block-level text container, either `.command code` as a block instead of `display: flex`, or an inner span), keeping the `<wbr>` breaks | On a phone, "burgisimon/awards" and "awards@awards" sit 2ch inside the command's first character. At 320 px the three-line command reads as one command | phone 390 and 320, both clients; desktop unchanged | `.awards/captures/20261026T144310-component/manifest.json` + `mobile-s00.png`; `.awards/captures/20261026T144549-component-jury-phone/manifest.json` + `mobile-state-switch-codex.png`; `.awards/captures/20261026T144549-component-jury-probe/mobile320-s00.png` | pending | unresolved |

### Craft (at most 5, inside the contract)
| Location | Change | Expected visible result | Viewport/state | Before evidence | After evidence | Status |
|---|---|---|---|---|---|---|
| src/motion/claim.js:44–46 | Sequence the hand-over so "Done" never passes over visible ink. Either start `w2`'s slide once `w1` has faded (positioned after the fade's end, or at least two thirds into it), or shorten `w1`'s fade so it finishes first. Keep the total near 0.9 s | At 600 ms the frame shows the struck "Stunning." almost gone, or already gone, as "Done" travels. No "StunninDone." smear | desktop and phone, first visit, full tier | `.awards/captures/20261026T144549-component-jury-timeline/manifest.json` + `desktop-t00600.png`, `desktop-timeline.png` | pending | unresolved |
| src/styles/site.css:196–197 (`.claim__pile` shown only in `[data-motion-tier="full"]`); src/motion/gather.js:34, :105–107 | In the reduced tier, show the five frames at rest in the pile, with no travel. At the record's threshold, hand them to their rows in the single 160 ms opacity step the SIGNATURE's reduced tier names, instead of never showing the pile. The static tier stays as Page map row 1 says | `desktop-rm-s00` shows the tops of the gathered frames under the sentence, as `desktop-s00` does. The first screen carries pictures for reduced-motion visitors. The rows at `desktop-rm-s10` are unchanged | desktop and phone, reduced motion | `.awards/captures/20261026T144310-component/manifest.json` + `desktop-rm-s00.png` (lower left bare); `.awards/captures/20261026T144549-component-jury/manifest.json` + `desktop-rm-component-top.png` (section ends at 786 px with no pile) | pending | unresolved |
| src/ui/copy.js:6, :55–58 | On a coarse pointer, `(pointer: coarse)`, the refused line names the touch gesture rather than a key ("The command is selected: press and hold it, then choose Copy"). Keep ⌘C or Ctrl+C for fine pointers | After a refused tap on a phone, the ticket's line gives an instruction the phone can follow | phone, clipboard refused | `.awards/captures/20261026T144549-component-jury-phone/manifest.json` + `mobile-state-copy-tap.png` ("press Ctrl+C to copy it") | pending | unresolved |

## Keep
- **Do not dilute:** the line "Done when a jury says ship." at 128 px Gloock, on two lines, on the ship ground. Beside it, four real command strips, each with its own Copy and its own ring. Under the sentence, the five real build frames, flat and keylined. Nothing may push a client's commands below the phone fold.
- **Page-level note, not a fix here:** the rendered audit's A18 (the record's 43 px trail links) and P09 (`extinct-desktop.webp`) belong to the record and are for the page round.

## Ceiling
Ceiling: the first screen never uses its own palette-as-navigation: the correction could also turn the ground, with "Stunning. Done." standing on the fix ground and the page going ship green as the line is corrected, so the colour gives the verdict before the words do.
