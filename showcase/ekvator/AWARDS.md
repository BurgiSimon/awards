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
- **Subject:** Ekvator, a lamp maker in Tromsø, Norway (69.65° N), and its one product, the Ekvator E1: a 60 × 90 cm window panel that replays the real sun of another city, hour by hour, in rooms that get no sun at all from late November to mid January. Synthetic: the company, the product, its specifications, the price, the batch and the address are invented for this build.
- **Unique mechanism (what only this subject can prove):** it plays back a real solar arc (elevation, azimuth, colour temperature, length of day) computed from a latitude, a longitude and today's date. The page runs the same astronomy in the browser, so every time and angle it prints is true for the day it is read.
- **Audience and their real scene:** people living above about 60° N (Tromsø, Reykjavík, Luleå, Fairbanks, Yellowknife) and design-led buyers further south who dread winter; on a phone at 15:30 in December when it has been dark for an hour, or at a desk under office light.
- **Stakes and conversion (what a visitor should do, matched to the price of the decision):** a €2,400 considered purchase. The action is a refundable €200 deposit that reserves one of 120 panels in batch 03, which ships on 1 December 2026, before the sun leaves Tromsø: "Reserve a window, €200 deposit". In the first viewport and again at the close.
- **Assets on hand:** none. Copy, specifications, prices and the city list are authored for the build and synthetic. The light, the wall and every sky are computed from real solar positions (procedural, code); the product is drawn as a technical line drawing (code). No photography, no stock, no generated rasters.
- **Binding constraints:** Vite + vanilla JS, static hosting from any folder (relative base); WCAG 2.2 AA; three motion tiers; no third-party requests at runtime; `programs: awwwards` (Site of the Day as the target).
- **Routes:** single page + 404.
- **Sound:** none.
- **Visitor mode:** persuade, wrapped in experience (emotion before economics: the borrowed day first, the specification and the price in the second half).
- **References the user likes:** none.
- **Calibration:** wins on Creativity (the page is lit by a real sun from another city; the scroll is that city's clock) and Design; most likely to lose on Usability (a scroll that reads as a clock, a city switch, light that changes contrast under the text). The usability walk checks first: contrast of every text at every hour, the city switch and the hour line by keyboard, and the reserve action in the first viewport and at the close.

## Direction contract
- **THESIS:** The page is a wall lit by another city's sun. As the visitor scrolls, the page runs through one real day in the borrowed city, from first light to blue hour: a window-shaped patch of light computed from that city's actual solar elevation and azimuth crosses the wall, warms and cools, rakes the plaster when the sun is low and throws the headings' shadows. The product is never photographed; its effect is the page. Refused: the category rut (a lamp cut out on white, a three-feature grid, "Shop now", a lifestyle photo of a cosy sofa); the Awwwards rut (near-black ground with a neon glow, a blob or particle hero, fade-and-rise sections, a logo marquee, a cursor trail); the template skeleton (wordmark left with links right, a label over a two-line headline bottom left, a filled plus outline button pair).
- **WORLD:** Restrained duotone: a plaster ground and a cool near-black ink, with every other colour supplied by the computed light itself (chroma outsourced to imagery: the light runs from about 1,800 K at dawn to 5,600 K at noon and back), and one bookend accent taken from the warm end of that light, spent only on the conversion and the 404. Light ground because the wall is daylit; the one dark field is the polar-night interruption, a diegetic darkness. Three to four live tokens, swapped by solar state, never by section habit. Type contract: a voice and a silence — one heavy display face whose thick strokes throw readable shadows (wide, warm, soft-cornered, a Nordic-modernist build, never a reflex grotesque), and a quiet grotesque for body and the solar readouts, with tabular figures. Material policy: raking light on plaster — a procedural relief that shows under a low sun and flattens at noon; everything else sharp, radius 0, no drop shadows except the real cast shadows of the type. Imagery strategy: procedural light and sky from real solar data (code), with one secondary language, the product drawn as a single-weight technical line drawing; refused: photography, renders of a sofa, stock interiors, generated rasters.
- **STORY:** Chaptered journey, one day read in order, emotion before economics. Beats (entrance · hold · exit): (1) First light — the light switches on at the borrowed city's sunrise · the claim and the live readout · the patch climbs off the floor of the viewport; (2) Morning — the sun rises past 15°, the patch sharpens · three sentences on what the panel replays (angle, warmth, length of day) · the light swings toward noon; (3) The interruption: polar night — the light dies and the wall goes dark · "Noon in Tromsø on 21 December: the sun is 3.1° below the horizon", the real Tromsø figures for today and the count of days without a sunrise (about 50, computed) · the light comes back; (4) Noon — the panel itself, drawn and taken apart, under the highest sun · three parts (the travelling light bar, the 1,800–6,500 K matrix, the offline ephemeris) · the drawing settles; (5) Afternoon — the specification and the price, in numbers with units · the table · the sun lowers toward evening; (6) Blue hour, the close — the borrowed sun has set and the drawn panel is the only lit thing on the wall · the reservation (€200, batch 03, 120 units, 1 December) and the Tromsø address with the town's own sun status · the end of the day. One interruption: chapter 3. The 404 is the same wall in polar night with the light off.
- **FIRST VIEWPORT:** The wall at the borrowed city's sunrise, full bleed. A skewed four-pane patch of warm light (the window, its cross-shaped mullion shadow inside it) falls in from the right edge at the computed azimuth and elevation, covering about 40 % of the viewport and raking the plaster relief. The h1, "Lisbon's sun, in your window.", runs across the left two thirds at display scale on three lines, its letters throwing long shadows away from the light where the patch crosses them. The top edge is the navigation, drawn as the borrowed city's day: a hairline hour line from sunrise to sunset whose ticks are the chapters (links), with the wordmark "Ekvator" small at its left end, the city name as a button that opens the city list, and the action "Reserve a window, €200" at its right end. Inside the light patch, lower right: two sentences of subline and one live readout line (local time, solar elevation and azimuth, colour temperature). The light switches on once over 1.2 s when fonts and the first frame are ready. Phone: the patch falls across the top half, the h1 on four lines under it, the readout and the action below; the hour line collapses to the city button, the time and the action.
- **SIGNATURE:** The borrowed day. Physical metaphor: a window of someone else's daylight moving across your wall. Scroll position is the borrowed city's clock for today (from 40 minutes before sunrise to 70 minutes after sunset), and the light patch, the wall's warmth, the raking of the plaster and the length and direction of every heading's shadow follow that city's real solar position at that minute. Jobs: (1) the product demonstration — it is literally what the panel does to a room; (2) the wayfinding — the hour line is the progress bar and the chapter index; (3) the chapter transitions — each chapter sits at its own hour; (4) the proof — the readout prints real elevation, azimuth and Kelvin, and the city switch re-runs the day for Kyoto, Nairobi, Lima, Lisbon or Marrakesh. Technique tier: canvas-first — one fixed WebGL canvas behind the DOM draws the wall, the patch and the relief from a sun vector; the type shadows are CSS from the same vector. Touch: the same scroll; the city list is a native button group. Keyboard: the hour-line links jump to chapters; the city buttons are a radio group with arrow keys; the readout is text. Reduced motion: the light steps to each chapter's hour (no sweep), shadows stay, the switch-on is instant. Fallback (no WebGL, low tier, static tier): the same patch and wall drawn in CSS at each chapter's hour from the same sun vector; the text tier shows every heading, readout and number.
- **SCROLL MODEL:** Native + Lenis. The story is one day read in order and the page is a document (find-in-page, anchors, keys, the scrollbar all stay); the clock is a reading of the scroll position, never a hijack. One sticky stage on an invisible rail (about 220 vh) holds the polar-night interruption so the light can die and return while the text reads.
- **LOAD & CLOSE:** No preloader and no gate: the wall and the CSS light at the borrowed sunrise are painted from tokens on first paint. The real signal is `Promise.all([document.fonts.ready, the first GL frame])`; when it resolves, the light switches on once (1.2 s), and a repeat visit in the same session switches it on instantly. If GL fails or takes over 2.5 s, the CSS light stays and nothing waits. The last screen is blue hour: the borrowed sun has set, the drawn panel is the only lit object, and the reservation sits inside its light; below it the Tromsø address with coordinates and a live line on whether the sun is up in Tromsø today. The 404 ships with the first release: the same wall in polar night, the light off, three routes out.
- **DIVERGENCE:**
  - `[site:son-daven]` — take: emotion before economics, and time as the evidence (a progress of hours here, where it used seasons), with two tokens re-pointed by state rather than many colours. Refuse: the seasonal renders, the pointer-only season handle, the dither shader and its parameters, the chapter order and the two-token hexes.
  - `[site:white-desert]` — take: specificity is the luxury signal (coordinates, Kelvin, lux, degrees, dates and a published price), and one saturated accent reserved for the conversion path only. Refuse: the polar subject told through ice photography, the camp and trip naming, the navy-bone-orange set, the Cardinal Classic + Inter Tight + Oswald setting and the beat order.
  - `[site:oryzo]` — take: extreme reduction buys two or three loud moments (one wall, one light, one drawn object), and own the clock without stealing the scrollbar (native scroll, read as a clock). Refuse: the coaster and every keynote-satire device, the nine-token warm set, the desk scene, the particle footer and the Halyard + Literata + DM Mono setting.
- **FINISH:** unreviewed and unshipped is unfinished — this build ends with a jury disposition and a ship report.
- **Seed:** SEED 6ix3k0obcw0e · DEALT 1 3 5 of 7 · LEAD 3 · locked 3 (window recess) unattended

## Page map
| # | Chapter / route | Beat (entrance · hold · exit) | Layout | Components (recipe id: keep · change · pair) | Notes |
|---|---|---|---|---|---|
| 1 | First light (hero) | the light switches on at sunrise · the claim and the live readout · the patch climbs off the bottom edge | | | |
| 2 | Morning | the sun passes 15° and the patch sharpens · three sentences on angle, warmth and length of day · the light swings toward noon | | | |
| 3 | Polar night (interruption) | the light dies and the wall goes dark · today's real Tromsø figures and the count of days without a sunrise · the light returns | | | |
| 4 | Noon: the panel | the highest sun over the drawn panel · three parts taken apart · the drawing settles | | | |
| 5 | Afternoon: specification | the sun lowers · specification and price in numbers with units · evening colour arrives | | | |
| 6 | Blue hour (close) | the borrowed sun sets and the panel is the only light · the reservation and the Tromsø address · end of the day | | | |
| — | 404 | the wall in polar night, light off · one line and three routes out · — | | | |

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
