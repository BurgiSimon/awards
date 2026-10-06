# AWARDS.md — award-level build contract

<!-- awards:schema 1 · written and read by the awards skills · keep the sections in this order -->

## Status
- [x] Brief captured
- [x] Direction contract locked (concept)
- [ ] Visual system written (system → DESIGN.md, tokens.css)
- [ ] Page map and skeleton built (structure)
- [ ] Stack booted (stack)
- [ ] Motion score authored and built (motion)
- [ ] WebGL layer built or explicitly declined (webgl)
- [ ] Jury disposition: —
- [ ] Shipped (ship)

## Brief
- **Subject:** Varn — a two-person studio glassworks (synthetic: the studio, its people, prices and pieces are invented for this build) that blows and lathe-turns vessels and pendant lamps to commission, one firing at a time.
- **Unique mechanism (what only this subject can prove):** hot glass shows its own temperature as colour. Every solid begins to glow at the Draper point, about 525 °C; soda-lime glass is worked near 1,100 °C, held at its annealing point near 520 °C, and cooled to room temperature over about fourteen hours in the annealing oven. A piece is finished only when it stops glowing and is safe to hold; the cooling record is the proof of the work.
- **Audience and their real scene:** interior architects and private collectors commissioning a lamp series or a single vessel; first visit on a laptop in a studio between client calls, return visits on a phone when a quote is discussed.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** a commission costs from €1,400 (one vessel) to €18,000 (a pendant series) and books a firing slot weeks ahead; the action is "Reserve a firing slot", a short enquiry naming piece, quantity and month, with a phone and email fallback. No checkout.
- **Assets on hand:** none. All copy, numbers, prices and the 3D vessels are authored for the build and labelled synthetic; no photography; geometry is generated in code.
- **Binding constraints:** static Vite site, no CMS, self-hosted fonts, WCAG 2.2 AA, no third-party trackers; must read fully with WebGL off and under reduced motion.
- **Routes:** single page + an authored 404.
- **Sound:** none.
- **Visitor mode:** persuade wrapped in experience — emotion first (the glowing piece cooling), then the numbers (schedule, sizes, prices, booking).
- **Calibration:** can win on Creativity (the cooling record as the page's spine) and Design; most likely to lose on Usability (a canvas-first page whose scroll also drives a 3D object); the usability walk checks first that the booking action is reachable by keyboard from the first viewport and that every chapter reads with WebGL off.

## Direction contract
- **THESIS:** The page is run 0417's annealing record. Scroll is oven time: a pen draws the cooling curve from 1,100 °C at hour 0 to 20 °C at hour 14, and the one vessel in the oven port cools in step, glowing white-orange, then red, then going dark at the Draper point (about 525 °C) and ending as clear, ordinary glass you could hold. The piece is shown finished only when the line reaches room temperature, and that moment is where the booking sits. Refuses the craft-studio rut (hands-at-work hero, serif headline over a full-bleed photo, a three-step "our process" row, a gallery grid, "Get in touch") and the Awwwards rut for this subject (near-black ground with a molten-orange glow, a heat-haze or ember field behind an oversized grotesque, fade-and-rise sections): here the ground is light chart paper and the glow is data that ends.
- **WORLD:** Committed-accent strategy: one recorder-ink hue does all the emphasis (the trace, the action, the focus ring); a light, warm chart-paper ground with a hairline grid at one weight; one dark field only, the oven port, the single place anything glows, and its glow colour is computed from temperature, not taken from the palette. Three to four colour tokens (paper, ink, recorder hue, port dark). Type contract: an instrument/technical voice for axes, labels and figures (tabular numerals, small stamped capitals) paired with a plain book voice for the studio's log notes, which read like entries written beside the trace. Material policy: line work and paper; sharp and shadowless everywhere; no glass cards, no halo, no bloom outside the port.
- **STORY:** Chaptered journey `[pattern:narrative-structures#chaptered-journey]` along the record's time axis; emotion first, economics second `[pattern:narrative-structures#emotion-before-economics]`. Chapters (entrance · hold · exit): (1) Hour 0 — Gather: the pen leaves 1,100 °C, the vessel is white-orange · two log notes: who works the piece, one firing a day · the trace bends down. (2) Hours 0–1 — Working: the vessel turns on the lathe as it drops from 1,050 to about 600 °C · notes on turning, the jacks, why each profile is one of one · the glow reddens. (3) Hour 1 — The Draper point: at 525 °C the glow goes out, the vessel reads as clear glass for the first time · one line: "From here you can no longer see that it is hot." · the curve flattens. (4) Hours 1–3 — The hold at 520 °C: the flat line; INTERRUPTION enters here (below) · why the hold removes stress · the ramp begins. (5) Hours 3–14 — The slow ramp: the numbers half as annotations on the curve: the pieces (sizes in cm and in), the lamp series, lead time in weeks, prices from €1,400 to €18,000 · the line approaches 20 °C. (6) Hour 14 — Safe to hold: the vessel is finished, refraction shown once · "Reserve a firing slot" as a sentence-form enquiry naming piece, quantity and month · designed footer as the record's printout tail (run number, next run, studio address, phone, email). Interruption (exactly one): at the start of chapter 4, a polariscope compare — the same vessel seen between crossed polarisers, without the hold (stress fringes) and with it (clear); a drag handle with a keyboard slider and a skip link; it changes the input from scrolling to comparing. Close: the finished vessel and the booking sentence; the 404 is "No record at this hour", an empty chart with the axes and a link back to hour 0.
- **FIRST VIEWPORT:** Archetype: still variant of the generative line field `[pattern:hero-archetypes#generative-line-field]`, where the line is the subject's own record. The chart fills the screen: °C axis (0–1,200) on the left, 0–14 h axis along the bottom, hairline grid. The pen rests at 1,100 °C, hour 0, top-left of the plot; the oven port sits in the plot's upper right third at about 34 vw × 48 vh with the white-orange vessel inside it. A header strip across the top carries the record's stamp (studio, run 0417, the date) and the h1 "A Varn piece is finished when it stops glowing." set across the strip at display size; "Reserve a firing slot" is stamped at the strip's right end as "Next run: open slots", fixed, the first tab stop after the skip link. Nothing moves until the visitor scrolls except one 1.2 s pen-down tick of the trace's first millimetre. Phone: the port stacks above the chart, the axis labels shorten, the action stays in the fixed strip.
- **SIGNATURE:** The cooling record. Physical metaphor: a strip-chart recorder drawing the oven's temperature while the piece cools. One master scroll timeline maps scroll position to oven hours (with stretch bands so hour 0–1 gets far more scroll than the twelve-hour ramp) and hours to temperature on an authored annealing schedule; it draws the trace (SVG path length), moves the time cursor and the °C readout in the DOM, and drives a temperature uniform on the lathe-turned vessel whose emission follows a tuned blackbody ramp and goes out below 525 °C. Jobs: progress bar, chapter index (curve events are the chapter anchors), the emotional peak (the glow), and proof of work (the finished record). Technique tier: canvas-first — one canvas tethered to the oven port only; the chart, readouts and notes are SVG/DOM. Deep modes: motion gsap (the master timeline, labels per curve event, scrub-threshold annotations), webgl 3d (lathe vessel, built studio light, one material), webgl shader (temperature emission). Touch: same native scroll; the compare handle uses a horizontal drag with a touch-action guard. Keyboard: native Page/arrow scroll; an "Hours" index of the six curve events as a nav list jumps the record; the polariscope is a native range input. Reduced motion: the full curve is drawn at load, the vessel shows the stage state for the chapter in view (cut, no scrub); static: final frame with every annotation visible. Fallback (no WebGL or low tier): the port shows a DOM swatch whose colour is computed from the same temperature, with the °C readout; the chart and table read completely.
- **SCROLL MODEL:** Native scroll with Lenis on the GSAP ticker; the chart is a sticky stage over invisible rails, one rail per curve event. The record's time is linear and so is reading: native scroll keeps Page/arrow keys, find-in-page and anchors, and keeps the booking one tab away, which the persuade mode needs.
- **LOAD & CLOSE:** No gate: the h1, chart axes and action render in the first paint. The port itself carries the load: it shows "Pre-heating · n %" against the real signal (fonts ready + the GL chunk and its compiled programs), then the vessel appears at 1,100 °C; repeat visits in the session skip the count. The last screen is hour 14: the clear vessel, the closed record and the booking sentence, above the printout-tail footer. The 404 ships with the first release ("No record at this hour").
- **DIVERGENCE:** `[site:eugeniagrab]` — take: a change of state across scroll should be felt, scrubbed and reversible, with the 3D sitting in the page like print — refuse: monochrome-to-colour as reward, the dial-origin circular hand-off, the plant cast, the word-search loader, its paper/ink token set and its pairing; here colour is lost as proof, not earned. `[site:floema]` — take: the conversion lives inside the story, not only in the footer; the canvas degrades explicitly and the DOM stays the source of truth — refuse: cut-out products drifting over an ivory hero, its token set and one-accent-per-collection, its single-face contract. `[site:son-daven]` — take: emotion before economics, time as evidence, one consistent treatment becomes identity — refuse: its dither shader and parameters, the seasonal compare handle as signature (our compare is a polariscope, once, as the interruption), its two-token pair, its face and chapter order. Also refused for the naming test: rows or rings of turned objects `[site:a24-raviklaassens]` `[site:agrumeafarm]`, a dark fogged specimen with rim light `[site:igloo]`, glassy or chrome type `[site:haoqi]` `[site:ascension-pegassi]`, molten or ember shader fields `[site:cyphercapital]` `[site:mensch]`.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** SEED zoctf8vt8r1i · DEALT 1 3 5 of 7 · LEAD 1 · locked: 1 (the annealing log) by the maintainer's standing instruction to decide alone

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Components (recipe ids) | Notes |
|---|---|---|---|---|
| 0 | First viewport — the record at hour 0 | pen-down tick · h1, axes, port at 1,100 °C, action · first scroll moves the clock | | |
| 1 | Hour 0 — Gather | trace leaves 1,100 °C · two log notes (who, one firing a day) · trace bends down | | |
| 2 | Hours 0–1 — Working | vessel turns as it drops to ~600 °C · notes on turning and profiles · glow reddens | | |
| 3 | Hour 1 — The Draper point | glow goes out at 525 °C · one line, the vessel reads as glass · curve flattens | | |
| 4 | Hours 1–3 — The hold at 520 °C (interruption: polariscope compare) | flat line + polariscope enters · why the hold removes stress · ramp begins | | |
| 5 | Hours 3–14 — The slow ramp | annotations arrive on the curve · pieces, sizes, lamp series, lead time, prices · line nears 20 °C | | |
| 6 | Hour 14 — Safe to hold | vessel clear, refraction once · sentence-form booking · printout-tail footer | | |
| 404 | No record at this hour | empty chart, axes only · one sentence · link to hour 0 | | |

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|

## Budgets & tiers
- Entry JS (gz): · GL chunk (gz): · Textures per scene: · Fonts (files / KB): · LCP target: · Tiers: high / mid / low →
- Deep modes: motion gsap · webgl shader + 3d — because the brief asks for the full deep stack: one timeline carries the cooling story, a temperature shader draws the glow, a lathe-turned vessel is the object (concept, motion and webgl confirm or narrow this)

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes -->

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line: `C02 — pure black is diegetic (night-vision console)` -->
