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
- **Subject:** Southbound, a small Antarctic expedition operator: six guests per trip, two camps, flights from Cape Town.
- **Unique mechanism (what only this subject can prove):** every trip is planned around a weather window; the camp is struck and pitched by hand.
- **Audience and their real scene:** experienced travellers, often retired, reading at home on a tablet with a partner beside them.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** request the departure dossier for one named season; no instant booking at this price.
- **Assets on hand:** twelve photos, labelled placeholders for now (synthetic until replaced).
- **Binding constraints:** vanilla Vite, no CMS, WCAG 2.2 AA.
- **Routes:** single page
- **Sound:** none
- **Visitor mode:** persuade

## Direction contract
- **THESIS:** the weather window as the product: the page is planned the way a departure is, held until conditions allow; it refuses the drone-shot hero, the itinerary card grid and the testimonial carousel.
- **WORLD:** a met office briefing sheet: cold paper ground, carbon ink, one signal orange for go decisions; a condensed grotesque for readings and a plain serif for the expedition leader's notes; materials are carbon copies, grease pencil and laminated charts.
- **STORY:** briefing (the season), the window (how a go is decided), the crossing, the camps, the six names on the manifest, the dossier request as the final go.
- **FIRST VIEWPORT:** a full-width pressure chart with the season's dates as isobars; the headline set as a forecast line at upper left; the dossier action pinned as the chart's legend at lower right.
- **SIGNATURE:** the go / hold switch: scrolling advances a forecast clock, and sections stay greyed until their window opens; keyboard steps the clock by six hours; reduced motion shows every window open with its date.
- **SCROLL MODEL:** native + Lenis, with one sticky stage for the forecast clock.
- **LOAD & CLOSE:** no preloader; the chart draws from the DOM. The close is the manifest with one empty seat and the dossier request.
- **DIVERGENCE:** [site:white-desert] take the restraint of a single-voice caption system, refuse its luxury-black hero; [site:seasats] take instrument readouts as copy, refuse its unusual navigation; [site:mont-fort] take one uninterrupted chapter view, refuse its glacier colour set.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** k3v9q2m7x1pd

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Layout | Components (recipe ids) | Notes |
|---|---|---|---|---|---|

## Motion score
| Moment | Trigger | Vocabulary (ease · duration · stagger) | Reduced-motion tier | Recipe |
|---|---|---|---|---|

## Budgets & tiers
- Entry JS (gz): · GL chunk (gz): · Textures per scene: · Fonts (files / KB): · LCP target: · Tiers: high / mid / low →
- Deep modes: motion none · webgl none — because the chart is DOM and SVG

## Jury log
<!-- appended by awards:jury — date · disposition · D/U/C/Co · dev sub-scores · top fixes; component passes are marked `component` and never count as page rounds -->

## Ship log
<!-- appended by awards:ship — date · audit summary · captures · performance numbers -->

## Exceptions
<!-- audit rule ids deliberately accepted, one per line: `C02 — pure black is diegetic (night-vision console)` -->
