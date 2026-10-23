---
name: Petrel
description: A repair cable paying out through the North Atlantic; grounds taken from how sunlight dies in seawater, one fault-locator red, a wide engineering gothic and a calm text face that prints every readout.
colors:
  ground: "#dfe5e4"
  ink: "#0e161c"
  accent: "#c4261d"
  on-accent: "#ffffff"
  blue-ground: "#97bccb"
  dark-ground: "#0a141d"
  dark-ink: "#d9e2e5"
  ooze-ground: "#d2ccbf"
typography:
  display:
    fontFamily: "Science Gothic, Science Gothic Fallback, Arial, sans-serif"
    fontSize: "88px"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.015em"
  h2:
    fontFamily: "Science Gothic, Science Gothic Fallback, Arial, sans-serif"
    fontSize: "52px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "Science Gothic, Science Gothic Fallback, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0em"
  body:
    fontFamily: "Radio Canada, Radio Canada Fallback, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "Radio Canada, Radio Canada Fallback, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  unit: "4px"
  gutter: "60px"
components:
  button-fault:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.none}"
    padding: "1rem 1.5rem"
  button-fault-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  link-quiet:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0"
---

# Petrel — design system

The frontmatter is the machine-readable layer; every value is identical in `src/styles/tokens.css`. Fluid sizes are recorded at the 1440 px artboard; their `clamp()` lives in `## Typography` and in `tokens.css`.

## Overview
- **Creative north star:** a cable going over the bow of a ship at night, into water that gets darker and then, four kilometres down, pale again.
- **Colour strategy:** theme by depth (the theme-per-section strategy, with the section boundaries set by depth, not by habit). Three base tokens (`--ground`, `--ink`, `--accent`) are re-pointed by four themes named for depth bands: `surface` (0 m, sea haze), `blue` (to 1,000 m, the blue that survives once red and yellow are absorbed), `dark` (1,000–4,212 m, no sunlight at all) and `ooze` (the abyssal plain, pale grey-beige sediment). Each chapter section owns its band; only two values are live on any screen. The ground is light at the surface and at the seabed and dark between, because that is where light is; the dark band is diegetic, not a register. The one accent is the red of a visual fault locator, the visible laser an engineer shines into a broken fibre: it marks the break, the fault and the fault-desk action, and nothing else.
- **What this world refuses:** a fleet photograph, a hero metric row, three feature cards; near-black from the first pixel with a glowing accent, a particle or "marine snow" field, bioluminescent glow, caustic shimmer; gradient text, glass, drop shadows.
- **Calibration:** [site:seasats] — display 124 px over 16 px body at 1440 (about 8 : 1), margin 352 px, on a three-act gradient ground → here 88 px over 18 px (about 5 : 1) and a 60 px margin: the claim shares the first viewport with the bow and the cable, and the readouts under it must read at arm's length; the acts are depth bands with flat grounds, never gradients.
- **Calibration:** [site:united-carriers] — 80 / 60 / 23 px on a dense grid (8 left edges), a dark hero opening a light body → here 88 / 52 / 18 px on 12 columns with 3–4 edges per screen; the dark band comes in the middle of the page at 1,000 m, not at the top, because the surface is daylit.
- **Calibration:** [site:igloo] — one face, one weight per role, one temperature and saturation near zero → here two faces with one weight per role, the grounds held near the sea's own temperature (cold blue-greys, one warm sediment), and the single saturated value spent only on the fault.
- **Lint:** `design-md.mjs lint` warns that `blue-ground`, `dark-ground`, `dark-ink` and `ooze-ground` are not referenced by a component: they are themes swapped in by `data-theme`. Kept.

## Colors
| Role | Token | surface | blue | dark | ooze |
|---|---|---|---|---|---|
| Ground: sea haze / surviving blue / no light / sediment | `--ground` | `#dfe5e4` | `#97bccb` | `#0a141d` | `#d2ccbf` |
| Ink: a cold near-black shifted toward sea blue; light in the dark band | `--ink` | `#0e161c` | `#0e161c` | `#d9e2e5` | `#0e161c` |
| Accent: fault-locator red, the same in every band | `--accent` | `#c4261d` | `#c4261d` | `#c4261d` | `#c4261d` |
| Text on the accent | `--on-accent` | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` |
| Muted text | `--muted` | ink 72 % into ground | | | |
| Hairlines | `--line` | ink 22 % into ground (30 % in `dark`) | | | |

`data-theme` on each chapter `<section>` sets its band; the fixed bridge line and `<meta name="theme-color">` take the band of the chapter under them, and the WebGL renderer clears to transparent so the section grounds show behind the cable.

Contrast (WCAG 2.x, computed):
- surface: ink on ground 14.32 : 1; muted 6.43 : 1; white on accent 5.77 : 1; accent against ground 4.52 : 1.
- blue: ink on ground 9.02 : 1; muted 4.99 : 1; the accent against this ground is 2.85 : 1, so no button sits on a blue chapter (the fault-desk action lives in surface, ooze and the bridge line, which is drawn on its band's ground with a hairline).
- dark: light ink on ground 14.12 : 1; muted 7.68 : 1; accent against ground 3.22 : 1, so red marks the break and large figures only, never small text.
- ooze: ink on ground 11.42 : 1; muted 5.70 : 1; accent against ground 3.60 : 1; white on accent 5.77 : 1.
- Focus ring: 2 px in `--ink` with a 3 px offset, 14.32, 9.02, 14.12 and 11.42 : 1 against the four grounds.

Wide gamut: the accent is duplicated as `color(display-p3 0.72 0.17 0.13)`; grounds and inks stay sRGB. Between two bands a thermocline strip (an `aria-hidden` gradient between the two grounds, no text on it) marks the boundary.

## Typography
Voice: a wide, square-shouldered engineering gothic, the letters painted on a hull and on the drum of a cable engine, which can say "4,212 metres" as a fact and not as a slogan; and a calm, open text face with tabular numerals that prints depth, tension and time like a log.

Candidates pulled with `fonts.mjs search` (sans-serif with a width axis at 400–800, display at 700, sans-serif at 400–600) and judged on `.awards/type/specimen-display.png` and `specimen-text.png` with the real headline, the real readout and a real paragraph:
- **Chosen display: Science Gothic** (Font Detective LLC for Google Fonts, OFL-1.1, weights 700 and 800). The widest of the six, flat-sided, with squared counters and tabular figures; at 800 it reads as marking, and "4,212" holds together as one number.
- **Chosen body: Radio Canada** (CBC/Radio-Canada, OFL-1.1, weights 400 and 600). Open, slightly humanist, with real tabular figures (`tnum`) so a readout does not jitter as it counts; quiet beside the gothic.
- Rejected display: Saira (technical but generic at 800, the "esports" register); Georama (good weight, too close to a neutral grotesque to carry the world); Zalando Sans (a retail brand's face, round and friendly); Big Shoulders Stencil Text (stencil is the cliché of "industrial", and condensed fights the wide bow); Saira Stencil (the same cliché).
- Rejected body: Libre Franklin (fine, but its figures are narrower than its letters and the readouts looked cramped); Moderustic (quirky `k` and `a` at body size); Argentum Sans (geometric, too wide for long paragraphs); Lexend (readability face, soft and characterless here); Asap (narrow, a second technical voice).

Contract: a voice and a silence. Science Gothic for display, h2, h3 and the wordmark; Radio Canada for body, readouts, labels and controls. No third face; readouts are Radio Canada 600 with `font-variant-numeric: tabular-nums`.

Scale, vw-lock on a 1440 artboard, `clamp()` floors for the phone:
- `--display: clamp(2.5rem, 6.1111vw, 6.25rem)` — 88 px at 1440; three lines on desktop. Under 560 px `clamp(2rem, 9.2vw, 2.25rem)`, 36 px at 390 and 32 px at 320, so the claim's longest unbreakable run, "4,212 metres", clears the cable band at the right edge; four lines on a phone.
- `--h2: clamp(1.875rem, 3.6111vw, 3.5rem)` — 52 px at 1440, 30 px on a phone.
- `--h3: clamp(1.125rem, 1.5278vw, 1.375rem)` — 22 px at 1440.
- `--body: clamp(1.0625rem, 1.25vw, 1.1875rem)` — 18 px at 1440, 17 px on a phone.
- `--label: 0.75rem` — 12 px, uppercase, tracked 0.08em, 600: the bridge line's instrument labels and the readout captions only. This is a metadata world (an instrument and a ship's log), so labels are earned there; no label sits above a heading as an eyebrow.

Display setting: tracking −0.015em at display, −0.01em at h2 (the face is wide and its sidebearings are already tight); leading 0.98 at display after checking that the comma of "4,212" clears the line below. Loading: self-hosted woff2 in `public/fonts/`, four files, 55 KB in all; `font-display: swap`; metric-matched fallbacks (`Science Gothic Fallback`: Arial Bold, size-adjust 133.3 %, ascent 81.6 %, descent 29.1 %; `Radio Canada Fallback`: Arial, size-adjust 105.0 %, ascent 90.0 %, descent 24.3 %); Science Gothic 800 is preloaded. No text is split; nothing waits for `document.fonts.ready` except the measurement of the cable's chapter anchors.

## Layout
- Artboard 1440 × 900; 12 columns; gutter `clamp(20px, 4.1667vw, 120px)` (60 px at 1440, 20 px at 390); unit 4 px.
- Scaling: vw-lock above 768 px through the `clamp()` tokens; fixed floors below.
- The cable owns the right third (columns 9–12) for the whole page, fixed to the viewport; every chapter's text sits in columns 1–8 (desktop) so it never runs under the cable. On a phone the cable is a thin band down the right edge (about 16 % of the width) and text runs in the remaining width.
- Prose measure 34 em. Section padding `calc(var(--unit) * 40)` desktop, `calc(var(--unit) * 24)` phone; the depth chapters are tall on purpose (a page-height per 1,000 m in the descent), with their text at the top of each.
- Coarse pointer: no hover-only state; every control 44 × 44 px; the bridge line collapses to a chapter menu under 900 px.
- Resize: the GL cable and the depth map are rebuilt on a debounced `ResizeObserver`; never a reload.

## Elevation & Depth
Hairline section drawing: the bow, the sheave, the shore station and the seabed are drawn at one 1.25 px stroke in `--ink` (or `--line`), like a naval architect's profile. The only rendered material is the cable: black polyethylene, galvanised steel armour wires in a helix, a copper tube and glass fibres in gel, lit by one key light from above at the surface and by nothing but a faint ambient in the dark band (the cable reads by its edge there). No drop shadows, no glass, no glow, no grain, no fog.

## Shapes
Radius 0 everywhere; rules are 1 px hairlines in `--line`; the break is a red point (a 6 px square at 45°) and a short red tick on the cable; the 404 is the cut end of a fibre. Icons are 1.25 px strokes.

## Components
- **Bridge line (nav):** fixed top bar on its band's ground with a hairline; the wordmark "C/S Petrel" and the ship's position at the left, the chapter depths as links across (0 m, 200 m, 4,212 m, seabed, deck, laid), the live depth readout and "Fault desk" at the right. States: hover underline, focus ring, `aria-current` on the chapter in view. Phone: wordmark, depth readout, a Chapters menu (non-modal list, Escape closes).
- **Depth readout:** text, `aria-live="off"`; depth in metres, metres of wire paid out, line tension in kN, each with a caption label; updated per frame, read by screen readers on demand.
- **Fault-desk action (button-fault):** white text on the accent, radius 0, at least 48 px tall; hover swaps to ink ground with ground text in 160 ms; focus ring; active 1 px press; disabled at 50 % with `aria-disabled`. In the first viewport, the bridge line and the close.
- **Alarm line:** one line of copy with the UTC time, the distance from shore and the visitor's own crossing time; a small red square marks it.
- **Light-pulse figure (chapter 2):** an inline SVG of the fibre from the shore station to the break with repeaters every 60 km; a pulse runs out and an echo returns; the distance and the round-trip time in microseconds are text beside it.
- **Depth scale:** a hairline ruler down the left edge of the descent with a tick every 100 m and a label every 500 m; real text.
- **Drag stage (interruption):** a sticky stage on a 180 vh rail; the seabed profile across the screen, the grapnel crossing it, a tension trace under it that runs flat and jumps when the grapnel catches. Keyboard: the stage is scrolled like any other; the catch value is text.
- **Cross-section (splice):** the cable's layers as a labelled diagram with real `<li>` text for each layer; the GL cable opens beside it.
- **Fault-desk form:** cable name, last good repeater, first alarm (UTC), contact e-mail; inline errors, a submitting state and a confirmation with a ticket number that says plainly nothing was sent.
- **Ship's particulars (footer):** a `<dl>` laid out like a ship's data plate (length, beam, cable capacity, wire on the drum, base, standby zone), then the light-restored timestamp.
- **404:** the cut end of a fibre with a red point of light; one line, three routes out.

## Motion
Register: mechanical. A cable engine, a winch, a grapnel on a wire: firm starts, firm stops, no bounce.
- `--ease-out-expo: cubic-bezier(0.25, 1, 0.5, 1)` — arrivals (the pay-out on load, a chapter's one moment).
- `--ease-in-out-expo: cubic-bezier(0.65, 0, 0.35, 1)` — travel between known states (the cross-section opening, the bight laid down).
- `--ease-theme: cubic-bezier(0.65, 0, 0.35, 1)` — the bridge line's band repaint.
- `--dur-feedback: 160ms`, `--dur-routine: 360ms`, `--dur-hero: 900ms` (the cable paying out on load, once). Stagger 0.06 s. Scrubbed moments (the descent, the drag, the splice) run on `ease: 'none'`.
- Tiers: full (the cable pays out continuously with the scroll), reduced (the cable steps to each chapter's state, repaints in 200 ms), static (each chapter's settled frame, the drawn SVG cable, no canvas). Under `prefers-reduced-motion: reduce` the duration tokens shorten to 0 / 120 ms / 200 ms; no global kill.

## Browser surfaces
- `::selection`: accent ground with white text; `caret-color`: accent.
- Scrollbar: thin, thumb `--ink` on `--ground` (follows the band); native scrolling under it.
- `:focus-visible`: 2 px `--ink` ring, 3 px offset, on every control in every band.
- `color-scheme`: light on surface, blue and ooze, dark on dark; `<meta name="theme-color">` follows the band under the bridge line.
- Favicon: the cable's end in section (a circle of armour wires around a red core) drawn in the ink; Open Graph image: the first viewport at 1200 × 630, produced at ship.

## Do's and Don'ts
- Do print every number with its unit (m, km, kN, µs, ms, h) and in tabular figures.
- Do keep text in columns 1–8 so the cable is never under a word.
- Do let a band's ground do the chapter marking; a thermocline strip only between bands.
- Don't put red text on the dark band, or a red button on the blue band.
- Don't add a glow, a particle, a caustic or a gradient on a surface that carries text.
- Don't animate anything but the cable, the pulse, the grapnel and the tension trace.
