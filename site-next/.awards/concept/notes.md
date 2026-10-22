# Concept round — working notes (site-next, redesign from site/)

Date: 2026-10-22. Skill: `awards:concept`, Steps 1–4. The direction is not locked in this file; the user chooses from the deal. Only the winner and the seed go to `AWARDS.md`.

Read before dealing: `references/sites/_index.md`; §7 and §8 of `okaydev`, `siteassist`, `primesec`; skeletons `siteassist.png`, `primesec.png` (the `okaydev` skeleton and fingerprint were refused by the owner's policy on 2026-10-22, so its composition bar comes from the card text); their `_fingerprints.md` rows; `anti-patterns.md`; `negative-exemplars.md` and all six frames; `narrative-structures.md`; `hero-archetypes.md`; `visual-composition.md` with the hero, specification and complete-page frames; `copy-and-content.md`; `imagery-and-assets.md`; `webgl-architecture.md#dosage-ladder`; `color-and-material.md#colour-strategies`; the `AWARDS.md` template. Redesign inputs: the baseline report, the inventory, baseline frames `home/desktop-s00`, `mobile-s00`, `desktop-s25`, `desktop-s50`, `desktop-s75`, `mobile-s50`.

## Step 0a — the redesign inputs

- Baseline: page-mode jury on `site/` (the wind-tunnel build), weighted 7.44, disposition `fix` (D 7.5 / U 7.0 / C 8.0 / Co 7.4).
- Keep line in the report: the smoke flow that treats the page's own text as the solid. By the maintainer's instruction the device is not kept. What is carried is the principle under it: **the signature acts on the page's own real content and real measurements (its DOM and the plugin's own data are the material), and it is enacted, not decorative.** The contract must say this is how the Keep line was carried.
- The old world is refused outright (brief): smoke streamlines, the light lab ground, warning orange, the extended heavy grotesque wordmark as the hero object.
- Baseline faults that become THESIS refusals, worded as what the new site does instead:
  1. The readout printed "unmeasured" and "pending" at display size (`20261022T114718-jury/desktop-s37`, `home/desktop-s50`). Instead: the page sets only figures it has a file for, and each figure names the file; a check that has not run is absent, never a slot.
  2. Ceiling note: the flow showed scroll speed, not anything the jury or audit measured. Instead: the signature moves only on measured values (audit findings, capture frames, jury scores, the DOM's own computed sizes), never on scroll or pointer speed.
  3. The hero-metric row (SKILLS 11 · AUDIT RULES 88 · RECIPES VERIFIED 76 / 89 as label-over-figure cells). Instead: numbers ride inside sentences and records.
  4. The install action was absent from s25 to s75 on the phone. Instead: install is one tap or one key away in every chapter at every width.
- Inventory decisions that bind the deal: wordmark-as-hero dropped; airflow switch, flow solver and WebGL chunk dropped; the "this page, measured" chapter kept (the scores copied verbatim from the new page's own jury report); phases-with-artefacts chapter, 88-rules chapter and corpus chapter kept as rewritten content; recipes route added (89 entries with their own frames).

## Step 1 — five lines

- **Mechanism:** a website held to a written contract and tested before anyone sees it, by the same loop that built this page (88 rules after every edit, captures at three widths, a fresh-context juror who ends on one word), and the page carries that loop's own record of itself, unedited.
- **Scene:** a developer or design engineer who already runs Claude Code or Codex, on a laptop with a terminal open beside the browser, arriving from a repository link or a post; about thirty seconds of sceptical, split attention before installing or closing the tab. The second visit is a lookup: a rule id, a recipe, a command.
- **Category rut (dev-tool / plugin page; `anti-patterns.md` B2B product and Docs/OSS rows):** a dark hero with the install command inside a fake terminal window, a hero-metric row (stars, rules, recipes), a three-feature icon grid, a docs sidebar, "Get started".
- **Awwwards rut:** near-black ground, one neon accent with glow, an oversized grotesque, a blob or particle field behind it, sections that fade and rise, a logo marquee, a cursor trail.
- **Template rut:** wordmark left with links right; a label over a two-line headline at bottom left; a subline; a filled plus outline button pair.

## Step 2 — neighbours and DIVERGENCE

Order of matching: class B2B product (a free dev tool's product page; industry dev-tools), then persuade, then the dosage this build can afford (none to moments; the old three.js chunk is dropped), then native scroll. That gives `okaydev` (B2B product, dev-tools, persuade, specification, none, native), `siteassist` (B2B product, software-saas, persuade, specification, none, native + Lenis near native) and `primesec` (B2B product, software-saas, persuade, specification, moments, native). No user references. `animejs` and `grids-obys` (docs class, read mode) are not neighbours under class-first matching; they are the cards a juror might still think of for some dealt worlds, and are named as such on those cards.

| Card | Principle taken (holds for any site) | Literal move refused |
|---|---|---|
| `[site:okaydev]` | Show the interface as an object, not a device: real output handled as an object on the page, never inside a laptop, phone or terminal frame (§7.2). Compositional. | The three-noun stacked headline with its last word on a black slab, the scatter of members' work around the headline, the five-accent theme-per-section set, the chunky extruded display wordmark, the order hero → brand band → profile → feed → studios → pricing → footer. |
| `[site:siteassist]` | Reserve the only saturated colour for the ask: one accent token that exists only on the conversion (§7.3, §8 take). | The hero as drawn (drone video, uppercase mono claim, ruled line, coordinate readout, logo row), the latitude/longitude pointer readout, Geist + Geist Mono as a pair, the violet, the order benefit tabs → numbered solutions → platform → sectors → case → "Let's talk". |
| `[site:primesec]` | One clock, many windows: one progress value sliced into eased windows keeps every beat in sync and makes every state reproducible from a number (§7.5), which is what `window.__awards` and the captures need. Structural. | The mascot (a classical statue with a modern prop), the pun on the name, the headline split around the figure, the before / in / after triptych and the stat trio, near-black + bone + acid yellow, a trial-cut grotesque and its mono, the 1480vh sticky stage. |

Shared by all three, therefore genre craft and usable: a persistent conversion in the header on every frame (Request demo, Book a demo, Sign up), a grotesque-plus-mono register, the specification model (numbers as evidence). The persistent header action also answers baseline fault 4.

Skeleton bar: `siteassist` opens full-bleed media with a heading block at left over it and a right text column; `primesec` opens 100 % media with a centred figure and a dense 11-edge grid. A dealt FIRST VIEWPORT may not be media-led full-bleed with a heading block at left over it, and may not centre one figure over 100 % media.

Visual-composition example (product brief: hero, specification, complete page): one principle taken — density changes with the content and the close resolves the opening (a quiet first decision, a dense ruled facts register in the middle, a reversed close that repeats the opening's gutter). What changes here: the "image" is this page's own output (captures, measurements, records), and on the phone the install action comes before any visual, as the demo puts the action before the portrait.

Negative exemplars: none of the dealt cards may reduce to the house style (label over a huge grotesque line, marquee), the template product page (glow, pill, metric row, icon grid) or the clean, forgettable page (centred heading, one column, no imagery decision) with new colours.

## Step 3 — seven worlds (audience culture: what developers and design engineers handle)

Material families covered: paper and print (1, 2, 4), metal (3), screen and console (5), stone (6), moulded plastic (7).

1. **Manual page** · typeset paper, the bound printed manual (serif troff setting, running heads, hanging indents, not a terminal) · the page is the manual entry `awards(1)`: SYNOPSIS holds the two install commands, EXIT STATUS holds this page's own disposition, BUGS lists the jury's open faults on this very page, unedited; every cross-reference (`jury(1)`, `rules(5)`, `recipes(7)`) unfolds in place into its real entry.
2. **Released drawing** · drafting film and ink · the page is an engineering drawing of itself: dimension lines measured from its own DOM at runtime (type size, measure in characters, target size, contrast ratio), each with the rule's tolerance beside it; a title block signed drawn / checked / approved by contract, audit and jury with their dates; revision clouds with lettered triangles around what the jury made the build change.
3. **Hallmark** · struck silver · the assay row of punch marks: each check (contract, audit, captures, jury, ship) strikes its mark into the page only when its file exists, with the date letter of the run; an unearned mark is an empty, unstruck cartouche, never a placeholder figure; the last strike is the disposition.
4. **Contact sheet** · photographic proof paper and grease pencil · `capture.mjs`'s frames of this very page (three widths, five stops) laid out as proof strips beside the live page; the juror's grease-pencil marks (circle, cross, arrow) sit on the frames they cite, each one a line from the jury report; the reader's scroll position selects the frame the jury saw at that depth.
5. **Self-test** · screen and console, set as type rather than inside a window · the page runs a subset of its own audit rules in the visitor's browser and writes the result as a test stream beside the elements it measured (`ok 14 — C01 body text 12.6:1 ≥ 4.5`); resizing the window re-runs it; the recorded build audit and the live run sit side by side.
6. **Touchstone** · black slate and a metal streak · the assayer's comparison: the 31 awarded corpus entries are the reference needles (their published scores), the plugin's juror is calibrated about 0.7 below them by design, and the page rubs its own streak (its own jury scores) beside the needles so the reader sees exactly where it lands.
7. **Keymap** · moulded keycaps with dye-sublimated legends · the page's real keyboard path as a row of keys: every focus stop the audit swept, in its measured order; Tab presses them one by one; the install commands are typed out on the keys; the reduced-motion and skip keys are printed on the board.

## Step 4 — the deal

Run from `site-next/`: `node "/home/user/awards/plugins/awards/scripts/roll.mjs" --deal 3 --of 7`

```
SEED 3zaj142iys4g
DEALT 4 5 7 of 7
LEAD 4
```

Re-roll pool (undealt, never offered): 1 Manual page, 2 Released drawing, 3 Hallmark, 6 Touchstone. A plain re-roll is `--seed 3zaj142iys4g --reroll 1`.

Every card shares these refusals, worded for its world in the card: the old world (streamlines, light lab ground, warning orange, the wordmark as hero object) and four baseline faults turned into rules: (1) only figures with a file behind them, nothing "pending"; (2) the signature moves on measured values, never on speed; (3) numbers in sentences and records, no metric row; (4) Install one key or tap away in every chapter at every width. The Keep line is carried as the principle: the signature acts on the page's own real content and measurements, enacted, not decorative.

### Card 4 · Contact sheet — LEAD

- **Thesis.** The page is its own proof sheet. The frames `capture.mjs` shot of this very page (three widths, five depths) hang beside it as proof strips, and the juror's marks sit on the frames they cite, each one a line from the jury report: the visitor sees what the jury saw and what it circled or crossed. Refuses the dev-tool category rut (no install command in a fake terminal window as the hero, no hero-metric row, no three-feature icon grid, no docs sidebar on home), the Awwwards rut (no dark ground with neon glow, no particle field, no fade-and-rise: frames are placed, never faded in) and the template skeleton (no label over a two-line headline at bottom left, no filled-plus-outline pair: the claim is the sheet's job line, the action is the one marked select). Also refuses the old world, and turns the faults into rules: a frame or mark exists only when its capture or report exists, so nothing reads "pending"; the strip moves on recorded evidence, never on scroll or pointer speed; counts ride in captions and sentences; Install sits in the strip's rebate on every frame at every width. Keep line carried: the material is this page's own captures and its own verdict.
- **World.** Restrained duotone: a warm-white proof-paper ground and a dense silver-black ink; chroma only from the frames themselves; one saturated grease-pencil hue exists only on the select, which is the install action; the jury's marks are drawn in black wax, not in the accent. Light, warm-neutral: a proof sheet is read on a desk in daylight, the docs and recipes routes are long reads, and the whiter, warmer paper separates it from the old cool lab grey. Type: two voices and one hand — a narrow technical edge-print sans (frame numbers, capture times, nav), a sturdy upright reading face (claim, prose); the only handwriting is the marker, drawn as strokes, never a script font. Material: flat paper, no shadows, no glass; frames flush in black rebates; one lens, the 1:1 loupe. Imagery: "the work is the imagery" — this page's own captures (`capture.mjs`) and each recipe's own frame on the recipes route (`verify-recipes`), all owned (MIT); secondary, the drawn marker language (circle, cross, arrow, underline). Refuses stock, device and terminal mock-ups, any third-party capture.
- **First viewport.** A full-height proof strip of this page's own desktop frames runs down the left quarter in black rebates edge-printed with stop and time, its s00 frame (this very screen as the jury shot it) ringed in black marker and captioned with the jury's memory sentence, its top rebate printing the version and the routes (Install, Docs, Recipes, Source) as edge print in place of a header bar, while the bare paper to its right, top-aligned with the first frame, carries the job line at display size in few words, one sentence on what the plugin is, and the two install commands as the job ticket with copy buttons, ringed once in the grease hue as the select; on a phone the job line and the ticket come first and the strip runs sideways beneath them.
- **Signature and tier.** The strip follows the reader: as you scroll, the frame the jury shot at your depth slides beside you, and where the report cites that frame the marker draws its mark once (circle = keep, cross = fault, arrow = fix; about 600 ms) with the report's line and date beside it. Jobs: proof (this depth was captured and judged), wayfinding (the strip is the progress bar and a jump rail; every frame is a link to its depth), honesty (the faults are drawn on the page's own picture, unedited). Tier: DOM-only (images, inline SVG strokes, one progress value cut into windows on the shared ticker). Touch: the strip docks as a horizontal rail under the top edge; tap a frame to jump. Keyboard: the strip is a `nav` of links, arrow keys step frames, the skip link passes it. Reduced motion: marks are already drawn, the strip is static per chapter. No script: each chapter prints its frames inline as a static proof row, marks included.
- **Scroll model.** Native + Lenis; the strip is a sticky element, never a pin; its windows come from one progress value, so `window.__awards.scrollTo` reproduces every state for captures.
- **Honest risk.** The frames always show the build before the one being read: the loop is capture → jury → embed → recapture, every frame dated and named, and ship must recapture to confirm which build each frame shows. A frame of this page inside this page is recursive and small, so alt text and the 1:1 loupe carry legibility. Weight: 15 home frames plus 89 recipe frames as responsive AVIF/WebP, lazy, roughly 0.6–1 MB across the routes, and 89 frames to produce at build. Paper, edge-print labels and rules flirt with the editorial-print register; the rebates must do what hairlines would. A page of its own screenshots can read as navel-gazing, so the copy must keep the visitor's own site in front.
- **Nearest card.** `[site:siena]`: a vertical film strip with evidence (ratings, laurels, running times) laid on each frame. Difference: no film stock, sprockets, grain, amber grade, ticket ritual or velocity blur; the frames are this page's own captures, the evidence on them is the verdict on this page, and the strip moves by depth, never smeared by speed.

### Card 5 · Self-test

- **Thesis.** The page tests itself in front of you. On load a subset of its own audit rules runs in the visitor's browser against its own DOM and writes each result as a line of a test report beside the element it measured (format only, figures illustrative: `ok 7 · C01 · body text on its ground · 12.6:1, floor 4.5:1`), with the build audit's recorded result and date beside it; resize the window and the run repeats. Refuses the category rut (the report is the page's own typography, never a terminal window holding the install command; no metric row, no feature grid, no docs sidebar on home), the Awwwards rut (no neon on black, no glow, no particles, no fade-and-rise: the only motion is result lines arriving as each check completes) and the template skeleton (no label over a two-line headline: the display line is the plan, "n checks on this page, running in your browser"; no button pair: one reproduce block). Also refuses the old world, and turns the faults into rules: a result line appears only after its check ran and recorded figures name their file, so nothing reads "pending"; the signature is the measurement itself, never speed; numbers live in result lines and sentences; the reproduce (install) block stays one key or tap away in every chapter at every width. Keep line carried: the material is the page's own DOM, measured live.
- **World.** Restrained duotone: a warm graphite ground and a paper-white ink; pass and fail carried by words and a glyph, never green and red; one accent only on the ask (reproduce block and header Install). Dark, warmed: the visitor reads it beside a terminal and the report should sit in the light of their own tools; warm graphite with no glow and no neon is the opposite pole of the refused cool lab ground. Type: the report is the display — a monospace with drawn character (not a coding default), large for the plan and totals, small for result lines; a plain sturdy grotesque for sentences. Material: flat screen; no glass, shadow, glow or cursor block; rules only where the report's structure separates. Imagery: procedural images from the world's own data — live measurements and the recorded audit JSON drawn as the report (type as the image); each recipe's own frame on the recipes route. Refuses terminal-window and editor mock-ups, device frames, stock.
- **First viewport.** The plan line runs at display size across the top two-thirds, the stream fills the left column beneath it one completed check at a time (each line a link to the element it measured, ending in a total timed on this machine beside the recorded build audit and its date), and the right column holds a two-sentence claim and the reproduce block — the two install commands with copy buttons, the page's only accent — under a header that is the report's first line, one left-aligned run of text (name, version, audit date, then Install, Docs, Recipes, Source inline) rather than a split bar; on a phone the plan line and the reproduce block come before the first lines of the stream.
- **Signature and tier.** The live self-test. Each chapter is one rule family (fonts, colour, motion, accessibility, layout, performance, surfaces, slop) whose live checks run when the chapter enters, so the rules chapter is the page itself rather than a table about it. Jobs: proof (the mechanism demonstrated on this page, on the reader's own machine), structure (the eight families are the chapters), wayfinding (each result moves focus to its element and outlines it; each rule id opens its rule text). Tier: DOM-only (a checker module of roughly 6–10 KB gz in idle callbacks, tasks under 50 ms). Touch: tap a result to scroll to and outline its element. Keyboard: results are a list of links, Enter moves focus to the measured element, one polite summary per chapter, never a flood. Reduced motion: results appear all at once, still computed live. No script: the recorded build-audit lines render as static text with their date and the live column is absent.
- **Scroll model.** Native + Lenis near native lerp, desktop only; no pin, so every result is findable, selectable text.
- **Honest risk.** A browser-side subset of the rules can disagree with the Node audit (zoom, forced colours, blocked fonts, extensions), and the page must print `not ok` honestly when a reader's setup fails a check. The checker adds script weight and main-thread time the performance rules will measure. Dark graphite with a monospace display sits one step from the console rut and the Awwwards rut: no glow, no green, no blinking caret, ever. The stream is text-dense; the thirty-second visitor must get what it is and how to install before reading one result.
- **Nearest card.** `[site:animejs]`: a dev tool proving its library on its own page, with a stress test and the bundle size published beside the install. Difference: no instrument dial, tick-ruler scrub, bundle-size legend or 3D machine; the proof is pass/fail checks with rule ids measured on this page's DOM on the reader's machine, and nothing animates as a character.

### Card 7 · Keymap

- **Thesis.** The page's real keyboard path is the object. Every focus stop the audit's rendered sweep counts, in its measured order, is a key on a printed keymap; each Tab presses the next key and the page moves focus there; each key's sub-legend carries that stop's measured target size and focus-ring contrast; the install commands are typed out on the board. Refuses the category rut (no terminal window with the command, no metric row, no feature grid, no docs sidebar on home), the Awwwards rut (no dark and neon, no glow, no cursor trail, no fade-and-rise; the pointer gets nothing the keyboard lacks) and the template skeleton (no wordmark-left, links-right header and no button pair: the nav and the actions are keys on the board). Also refuses the old world, and turns the faults into rules: a sub-legend shows a figure only when the sweep measured it, with its date; the signature moves on the measured focus order and sizes, never speed; counts sit on legends and in sentences; the board docks at the bottom edge with the Install key on it in every chapter at every width. Keep line carried: the material is the page's own measured focus path.
- **World.** Restrained duotone of two plastics: a light alpha-key tone and a darker modifier tone on a warm light ground; one accent keycap, Install, is the only saturated colour (how a keycap set marks Enter). Light, warm: the board is read on a laptop in daylight and its legends must hold small text at AA; warm plastic refuses the old cool lab grey. Type: the legend face — a compact, open grotesque cut to read small, set top-left on the caps like printed legends; a plain text face for prose. Material: one material with real depth only on the keys (sculpted caps, dished tops, 2–3 px press travel); everything else flat; no glass, no glow. Imagery: CSS-built objects — keys from boxes, gradients and masks; each recipe's own frame on the recipes route. Refuses keyboard photography, 3D keyboard renders, device mock-ups.
- **First viewport.** A one-sentence claim sits upper left in the prose face and a small live legend of the working keys (Tab, Shift+Tab, Enter) upper right, while the lower third holds the board — one row of sculpted keys for this page's focus stops in their measured order (skip link, Install, Docs, Recipes, Source, the two copy-command keys and on), the Install key the only coloured cap — so the board is both the nav and the action; on a phone the claim comes first and the board docks as a two-row block at the bottom with Install leading.
- **Signature and tier.** Tab drives the board: each press depresses the key for the current focus stop (2–3 px travel, about 90 ms) and the page moves there; its sub-legend shows that stop's measured size and ring contrast; pointer users press the same keys, which are the real links and buttons. Jobs: proof of the floor (the keyboard path is visible, complete and measured, where the corpus scores worst), navigation (the board is the nav and jump rail), conversion (the docked board keeps Install in every chapter). Tier: DOM-only (real `a` and `button` elements styled as keys; order generated at build from the audit's focus sweep, re-measured live). Touch: the docked board scrolls sideways under the thumb, tap = press, sub-legends behind one toggle. Keyboard: native Tab order is the signature; no single-character shortcuts. Reduced motion: the press is a state change with no travel. No script: the keys stay real links and buttons, with build-time figures and their date.
- **Scroll model.** Native + Lenis; the board docks as a sticky row at the bottom edge once the hero passes.
- **Honest risk.** Most visitors use a pointer and see a board of buttons; unless they press Tab the signature reads as a nav dressed as keys, and a mouse-only juror may call it skeuomorphic chrome. The board must match the real focus order on every route and width, so it needs a sweep per route and breakpoint. Keycap skeuomorphism can read as hobby nostalgia. It proves one of the loop's tests (the keyboard walk) deeply and the rest only in copy, narrower than the brief's mechanism. A docked board takes about 56–64 px of a phone screen.
- **Nearest card.** `[site:areebali]`: navigation as an operable object with a printed keymap legend that changes with state. Difference: no device shell, click wheel or power-on; the keys are not sections a designer chose but the page's measured focus order, each carrying its measured size and ring contrast, and Tab, the browser's own key, is the input.

### Pick, exit, labels

- **My pick: 4, Contact sheet.** It is the only one of the three that shows the whole loop at once (the page as captured, as judged and as marked) and gives every route, the 89-recipe catalogue included, one owned image system instead of type on a ground.
- **Conventional exit.** The competent dev-tool page: a header with the routes, a headline and the two install commands in a code block with copy buttons, a four-step "how it works" (contract → audit → captures → jury), a rules table by family, a recipe grid of thumbnails, docs with a sidebar, a footer. Ceiling: Design about 7, Creativity about 6. Advantages: days rather than weeks, read mode and accessibility kept simple, no capture-embedding pipeline, easy to keep in sync with generated data. Honestly: a juror names it a docs site, and it is one careless step from the template product page.
- **Labels (≤ 12 words):**
  1. Contact sheet — the jury's own frames of this page, marked (my pick)
  2. Self-test — the page runs its own audit in your browser
  3. Keymap — the page's measured keyboard path as a row of keys
  4. Conventional exit: safe docs-style plugin page, Design ~7, Creativity ~6
- Question text ends: "or answer re-roll (plain, safer or bolder)".

Status after the deal: waiting for the user's choice (`AWARDS.md` untouched at that point).

## Lock and Steps 5–8 (2026-10-22)

The user chose card 4, Contact sheet, in one round (it was also my pick). Locked as: `SEED 3zaj142iys4g` · reroll 0 · DEALT 4 5 7 of 7 · LEAD 4 · locked 4. The contract was written to `AWARDS.md ## Direction contract`, the ten-row skeleton to `## Page map`, and "Direction contract locked (concept)" was ticked. No other section was touched; `state-card.mjs` still parses the file.

Settled inside the contract, as the coordinator asked:
- **Bootstrapping.** `npm run proof` (`scripts/proof.mjs`) writes committed `src/data/proof.json` plus `public/proof/<stamp>/<route>/` frames. It chooses its source by what exists on disk:
  - (a) the newest page-round report (never a baseline or component pass), with the capture runs that report's Evidence section lists, and arrows from a newer verdict;
  - (b) otherwise the newest valid capture run, dated and unmarked; chapter 3's hold then sets that capture's own metrics and the build's audit summary instead of scores;
  - (c) otherwise no strip at all.
  The build id sits in `window.__awards.state().build`, so manifests record which build was shot. The caption names capture, build and report, and the footer names the build being read.
- **Editorial-print register.** No tracked mono anywhere: edge print is a narrow sans, light on the black rebate, and every label is a fact of the sheet. No hairline as texture: the rebate is the only rule, and data tables get one rule under the head. The paper is derived (print paper) and never empty of evidence, since frames fill about a quarter of every desktop screen. The juror's strip-the-copy test is written into WORLD, and the exception reason is ready if X21 or L05 fires.
- **Memory test.** "The page showed me its own screenshots in a strip down the side, with the jury's marker rings and crosses on them."
- **Gap found and fixed during the checks.** The first draft left chapter 3 out of builds that had no report. The first jury round would then have judged a page with no interruption. Fixed through state (b) above.

### Naming test (both directions, first viewport)
1. **Source site.** Compared against every card a juror might name:
   - `siteassist`: its skeleton opens on full-bleed media with a heading block over it. Ours puts media in a left column (about 25 %) with nothing over it.
   - `primesec`: a centred figure over 100 % media. Not ours.
   - `okaydev`: a stacked headline and a scatter of member work. Ours has a strict column, no scatter.
   - `siena`: a black ground, a film strip with sprockets, an amber grade, ticket stubs. Ours is white paper, frames of a web page and black wax marks.
   - `the-line` (acetate over a silver ground), `grids-obys` (one grotesque on paper, grid overlay), `animejs` (dial, ramps): none present.
   - The old site: no shared element (no streamlines, no lab grey, no orange, no wordmark hero).
   Result: **no juror can name the source.**
2. **Generator.** Slop scan over the contract:
   - Surface: no glass, shadow, glow, sticker kit or stripes. Watch X06: build the strip as a column, not as a `border-left` on a card.
   - Type: no eyebrows; edge print is earned as a metadata world; the serif is upright, not the premium italic.
   - Colour: no framework purple, no gradient, no halo, no cream; the ink is not pure black.
   - Layout: no template order, icon grid or metric row; s00, s25 and the rest are real capture stops (X07 earned).
   - Motion: no fade-and-rise; one ring per chapter; marks never loop; no preloader, overlay nav, cursor or marquee.
   - Copy: no avoid-list words.
   Families present: 0. The editorial-print register is guarded and goes to the jury to judge. Result: **no juror can name the generator.**
3. **Strip test.** With the copy removed: a column of black-framed screenshots with marker rings beside a ticket ringed in one colour. It still says "a page under review, and one action". **Pass.**

### The six first-viewport tests
1. Naming: pass (above).
2. Generator: pass (above).
3. Strip: pass (above).
4. Action: the Copy buttons on the ticket and Install in the rebate are visible without scrolling, are real `button` and `a` elements, and are labelled with the outcome. Pass.
5. Cost: the LCP is DOM text; two frames load eagerly with width and height; no GL; one 1.2 s moment, played once, skipped drawn on repeat. Pass. Image bytes are not yet measured.
6. Phone: the same idea at 390 px (rebate, job line, ringed ticket, then the ringed phone frames). Designed, not degraded. Pass.

### Closing checks (skill Verify)
- [x] Memory-test answer is an object and a behaviour, with no mood word.
- [x] Naming test passes in both directions.
- [x] Every block is concrete:
  - THESIS refuses all three ruts, the old world and four faults by name;
  - STORY has its model, six beats, one interruption (chapter 3, after the first content beat, with keyboard path and skip) and a close;
  - SIGNATURE gives its jobs, tier, touch, keyboard, reduced motion and fallback;
  - FIRST VIEWPORT is an exact composition;
  - WORLD names its strategy and contract type;
  - SCROLL MODEL gives its reason;
  - LOAD & CLOSE names a real signal (`fonts.ready` plus `decode()`, 1.5 s ceiling).
- [x] Honest risk is stated for all three dealt cards (above) and for the winner (SIGNATURE, cost and risk).
- [x] The concept survives with WebGL removed: no WebGL at all (DOM-only).
- [x] DIVERGENCE names three real slugs from the index, each with a take and a refuse line. No card's signature, order, copy, hexes or pairing appears in the contract.
- [x] `roll.mjs` was run, and the SEED line is in the Seed field. No re-roll was used.
- [x] The conventional exit was offered with its ceiling, and the user locked the direction in one round.
- [x] The visitor mode is honoured: persuade has no gate and no preloader; the read routes keep their index on screen one; Install is present in every chapter.
- [x] `## Status` has the concept line ticked; nothing else changed.

Open, by design or not concrete yet:
- Faces and hexes belong to `awards:system`.
- The job line's exact words belong to structure and copy.
- The install commands are read from the README at build.
- `proof.mjs` parses the jury report's markdown sections (Evidence, Memory test, Keep, Usability walk, Slop scan, Material fixes). If the report template changes, the script must follow.
- The frame byte budget (0.6–1 MB) is an estimate, not a measurement.
- The recipes route needs 89 recipe frames that do not exist yet. Only 6 recipes ship `visuals/` today, so the frames are a pipeline step: `verify-recipes` or `capture.mjs` over `recipes/dist`.
