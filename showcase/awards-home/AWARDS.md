# AWARDS.md — award-level build contract

<!-- awards:schema 1 · written and read by the awards skills · keep the sections in this order -->

## Status
- [x] Brief captured
- [x] Direction contract locked (concept)
- [x] Visual system written (system → DESIGN.md, tokens.css)
- [ ] Page map and skeleton built (structure)
- [ ] Stack booted (stack)
- [ ] Motion score authored and built (motion)
- [ ] WebGL layer built or explicitly declined (webgl)
- [ ] Jury disposition: —
- [ ] Shipped (ship)

## Brief
- **Subject:** awards, the open-source plugin for Claude Code and Codex in this repository (`plugins/awards`, version read from its manifest): eleven skills that design and build award-level websites and components, browser-verified recipes, a deterministic craft-floor audit, a corpus of analysed award winners, and a jury that scores a build in a fresh context. Every count, name and command the page prints is read from the plugin at build time; nothing is typed by hand. Real, not synthetic. The one proof the page shows is the Ekvator showcase in this repository, a real build the plugin made, cited with its own captures and jury lines.
- **Unique mechanism (what only this subject can prove):** nothing it builds counts as finished until a jury that never saw the build being made has scored captures of it and a ship report exists. Everything before that is a proof.
- **Audience and their real scene:** front-end and creative developers, and designers who code, who already use Claude Code or Codex; at a desk with a terminal beside the browser, arriving from the GitHub README or a shared link, deciding within a minute whether to install. Sometimes a phone, from a post.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** free and open source, a two-command install. The action is to copy the install commands for Claude Code or Codex, in the first viewport and again at the close; secondary, open the repository.
- **Assets on hand:** the plugin's own files (manifests, skills, recipes, audit rules, corpus index), and the Ekvator showcase's captures and jury report. No photography. Anything authored for the page (copy) is the page's own; no testimonials, no invented users, no award claims.
- **Binding constraints:** Vite + vanilla JS; static hosting from any folder (GitHub Pages); counts read from `plugins/awards` at build time; WCAG 2.2 AA; three motion tiers; no runtime third-party requests; `programs: awwwards` (Site of the Day as the target).
- **Routes:** single page + 404.
- **Sound:** none.
- **Visitor mode:** persuade, with read holds: the skill run and the recipe case must stay scannable under every effect.
- **References the user likes:** none.
- **Calibration:** wins on Creativity (the page is a proof of itself and comes into register as it is read) and Content (real counts, a real install, a real jury line); most likely to lose on Usability if the out-of-register plate ever touches legibility. The usability walk checks first: the key plate (every word) never moves; the install commands copy by keyboard and are visible in the first viewport; the skill run and recipe case scan at phone width.

## Direction contract
- **THESIS:** The page is a press proof of itself. It is printed in two plates: the key plate (near-black) carries every word and never moves; the spot plate (process yellow) carries the solids, the colour bar and the registration marks, and it starts out of register. As the reader goes down the plugin's run (brief, concept, system, structure, stack, motion, WebGL, jury, ship), the spot plate pulls into register, the measured error in the margin falls to 0.00 mm, and at the jury chapter the sheet is stamped with its press OK. Refused: the category rut (docs and open source: an install command over a gradient hero, an icon feature grid, a docs sidebar, a stars badge, "Get started"); the Awwwards rut (near-black with a neon glow, a blob or particle field, fade-and-rise sections, a logo marquee, a cursor trail); the template skeleton (wordmark left with links right, a label over a two-line headline bottom left, a filled plus outline button pair). Also refused: this plugin's previous page, a contact sheet of captures with jury marks drawn on them.
- **WORLD:** Restrained duotone of coated proof paper and a near-black key, plus one spot ink, process yellow, that is a surface and never text on paper: solids, the colour bar, the registration targets, the halftone of the proof and the OK stamp. Light ground because a proof is judged under a daylight viewing booth. Three live tokens and the overprint of the two inks. Type contract: one sturdy grotesque with a press voice at display scale on the key plate (heavy, slightly condensed, ink-trapped or ink-spread at small sizes, never a reflex face) and a quiet text face for reading; the sheet's furniture (slug line, plate names, densities) is a metadata world, so small tracked labels are earned there and nowhere else. Material policy: offset print on coated stock — hairline crop marks, the overprint where yellow meets black (multiply), a halftone screen; flat, no shadows, no glow. Imagery strategy: the Ekvator showcase's own captures reprinted as two-ink halftones (generated in code from the real frames), and type and press marks drawn in code; refused: photography, illustrations of robots or sparkles, screenshots in browser chrome, logos of tools.
- **STORY:** Print artefact, read in the order of the press run. Beats (entrance · hold · exit): (1) The sheet — the proof lands with its yellow plate out of register · the claim, what it is in one sentence, the install commands and the margin readout · the plate starts to pull in; (2) The run — the eleven skills in their order down the sheet · index rows, one line of job each, the deal and its seed shown as printed · registration improves with each phase; (3) The floor — the audit as the sheet's colour bar · the rule families as density patches with their counts, three rules quoted · the bar settles; (4) The interruption: the press check — the scale and the register change: the Ekvator proof, reprinted in halftone, is pulled from the press · the jury's own disposition line and scores from that build, and what a fresh context means · the plates meet at 0.00 mm and the OK stamp prints; (5) The case — the recipes as the type case · dense index rows by group, scannable · the case closes; (6) Press OK, the close — the install again, the repository and the colophon with the version and counts read at build · end of the sheet. One interruption: chapter 4. The 404 is a spoiled sheet marked waste, with three routes out.
- **FIRST VIEWPORT:** The sheet, full bleed on paper, with crop marks at the four corners of the viewport and two registration targets on its top and bottom centre lines, the yellow target visibly off its black twin. The slug line runs along the top edge as the navigation, in the sheet's own furniture: job name and version at the left, the plate names (each a chapter link) across, the register error in millimetres at the right. The h1 "Nothing ships unproofed." sets across the left three quarters at display scale on two lines, black on paper, with a yellow solid printed under its second line and a yellow ghost of the type sitting 2–3 mm off it. Under it, at the right half, one sentence on what the plugin is and the install block: two tabs (Claude Code, Codex) over two commands set in the key plate, with one action, "Copy the install commands", as a black button with a yellow inner rule. The colour bar runs down the right edge. Phone: crop marks and targets stay at the corners, the slug line collapses to the job name, the error and a plate menu; the h1 on three lines, the install block full width under it.
- **SIGNATURE:** Registration. Physical metaphor: a two-plate print run brought into register at the press check. The spot plate (every yellow element on the page, moved as one layer) starts offset by about 2.6 mm and 0.6° and pulls into register as the reader passes each phase; the margin prints the live error in millimetres and the phase name. Jobs: (1) it enacts the thesis — the page itself is not finished until it has been proofed; (2) wayfinding — the error and the phase name in the slug line say where the reader is in the run; (3) the chapter transitions — each chapter is one step of register; (4) the proof — at the press check the plates meet at 0.00 mm and the OK stamp prints on the sheet. Technique tier: DOM-only (one layer of yellow elements transformed by a scroll-read value, multiply overprint). Touch: the same scroll. Keyboard: the slug-line plate names are chapter links; the readout is text. Reduced motion: the register steps to each chapter's value with no drift, and the OK stamp is simply printed. Fallback without JavaScript: the sheet in register with the readout at 0.00 mm and the stamp printed.
- **SCROLL MODEL:** Native + Lenis. The page is a document the reader scans and returns to; register is read from the scroll position, never written to it. One sticky stage on an invisible rail (about 200 vh) holds the press check so the plates can meet while the jury line reads.
- **LOAD & CLOSE:** No preloader and no gate: the sheet paints from tokens with the plate offset already set in CSS, so first paint is the proof. The real signal is `document.fonts.ready`; once it resolves the register readout starts and the sheet is interactive. The last screen is the press OK: the install commands once more, the repository, and a colophon with the version, the counts and the date they were read. The 404 ships with the first release: a spoiled sheet, plates far out of register and marked waste, three routes out.
- **DIVERGENCE:**
  - `[site:the-line]` — take: one ink used everywhere beats one ink used twice (the yellow does the loading readout, the solids, the selection, the focus and the OK), and chrome in the client's dialect (the press sheet's furniture as the interface). Refuse: the red acetate, the hinge, the call-sheet furniture set, the flare red and silver pairing, the sticky red footer and the section order.
  - `[site:grids-obys]` — take: make the subject the interface (the proof is the page and it comes into register as it is read), and spec tables with hairline rows that quantify a decision. Refuse: the construction-grid overlay toggle, the grey paper with pure black, the yellow flood of the alternate mode (yellow here is a spot ink in fixed places, never a flood), the outline-letter crops and the book spines.
  - `[site:animejs]` — take: a number on screen is a claim you can check (counts read from the repository at build, with the date), and the product's architecture as the object on screen (the skills as the press run). Refuse: the hue ramps, the camera-lens machine and its exploded view, mono for every label, the instrument-dial hero and the tick-ruler scrub widget.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** SEED uf9246qzn6sy · DEALT 1 5 7 of 7 · LEAD 5 · locked 1 (press proof) unattended: the press check is the plugin's own mechanism, and the lead (a darkroom test strip) reads as the photographic world of the plugin's previous contact-sheet page, which this brief refuses.

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Layout | Components (recipe id: keep · change · pair) | Notes |
|---|---|---|---|---|---|
| 1 | The sheet (hero) | the proof lands out of register · claim, one sentence, install, readout · the plate starts to pull in | | | |
| 2 | The run | registration improves per phase · eleven skills in order, the deal and its seed · — | | | |
| 3 | The floor | the colour bar arrives · rule families as density patches with counts · the bar settles | | | |
| 4 | The press check (interruption) | the scale and register change; the Ekvator proof is pulled · the jury's line and scores, what a fresh context means · 0.00 mm and the OK stamp | | | |
| 5 | The case | the type case opens · recipe rows by group · the case closes | | | |
| 6 | Press OK (close) | the OK sheet · install, repository, colophon · end of the sheet | | | |
| — | 404 | a spoiled sheet · one line and three routes out · — | | | |

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|

## Budgets & tiers
- Entry JS (gz): · GL chunk (gz): · Textures per scene: · Fonts (files / KB): · LCP target: · Tiers: high / mid / low →
- Deep modes: motion — · webgl — (set by motion and webgl)
- Mode: full

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes; component passes are marked `component` and a redesign's first score `baseline`; neither counts as a page round -->

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line, scoped to a path or viewport where you can: `C02 — pure black is diegetic (night-vision console)`, `C01@src/credits.html — read once over the film still` -->
