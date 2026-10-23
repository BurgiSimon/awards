---
name: Museum of Extinct Colours
description: A paint cross-section under a microscope; an achromatic laboratory in which the seven lost pigments are the only colour, an engraved-label serif and a book face with old-style figures.
colors:
  ground: "#eceeeb"
  ink: "#151719"
  accent: "#151719"
  ir-ground: "#0d0e0f"
  ir-ink: "#e6e8e6"
typography:
  display:
    fontFamily: "Kalnia, Kalnia Fallback, Times New Roman, serif"
    fontSize: "92px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Kalnia, Kalnia Fallback, Times New Roman, serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "Kalnia, Kalnia Fallback, Times New Roman, serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "EB Garamond, EB Garamond Fallback, Times New Roman, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "EB Garamond, EB Garamond Fallback, Times New Roman, serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  block: "18px"
spacing:
  unit: "4px"
  gutter: "60px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    padding: "1rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
  plaque:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1.25rem 1.5rem"
---

# Museum of Extinct Colours — design system

The frontmatter is the machine-readable layer; every value is identical in `src/styles/tokens.css`. Fluid sizes are recorded at the 1440 px artboard; their `clamp()` lives in `## Typography` and in `tokens.css`.

## Overview
- **Creative north star:** a polished sliver of paint in a resin block under a microscope, and a small white card beside each layer.
- **Colour strategy:** restrained duotone with chroma from the specimen only. A cool off-white ground (the light of a microscope's field) and a near-black ink carry every word, every control and every rule; the accent token is the ink itself, so the action is an ink button and nothing on the page competes with the exhibits. The seven pigments are the only colour, and they are data, not tokens: each appears as the grains of its own layer and as a small chip beside its name, never as a section flood, a button or a decoration. The ground is light because a microscope's field is light and a pigment is judged under daylight; the one dark chapter is the infrared view, which is dark because infrared photography of luminescence is.
- **What this world refuses:** a photograph of the building, opening hours in a bar, "What's on" cards; a dark page with a glowing accent, a paint splash or fluid blob, floating particles; chapters flooded with flat hues, gradient text, glass.
- **Calibration:** [site:gehry-getty] — the heavy display held to one or two jobs (initials and full-width titles), essays in a serif, body 21 px at 1440 → here the display serif holds the claim, the chapter titles and the seven colour names only, and the book face carries every history at 20 px; no chapter floods, the pigment stays in its grains.
- **Calibration:** [site:a24-raviklaassens] — an achromatic paper ground and one ink so the work is the only colour, display 120 px over 14 px labels → here 92 px over 13 px labels on a cooler, whiter ground (a lab, not paper), and the work is the grains of each pigment.
- **Calibration:** [site:agrumeafarm] — a sharp high-contrast serif display with a spaced uppercase prompt on a 12-column grid with `clamp(12px, 1.45vw, 30px)` gutters → here a high-contrast serif on 12 columns with `clamp(20px, 4.1667vw, 120px)` gutters, spaced capitals only for catalogue numbers and dates on the label cards.
- **Lint:** `design-md.mjs lint` warns that `accent`, `ir-ground` and `ir-ink` are not referenced by a component: the accent is the ink by design (components name `{colors.ink}`), and the other two are the infrared theme, swapped in by `data-theme`. Kept.

## Colors
| Role | Token | lab | ir |
|---|---|---|---|
| Ground, the microscope's field | `--ground` | `#eceeeb` | `#0d0e0f` |
| Ink, a near-black shifted cool | `--ink` | `#151719` | `#e6e8e6` |
| Accent: the ink (the action is an ink button) | `--accent` | `#151719` | `#e6e8e6` |
| Muted text | `--muted` | ink 68 % into ground | ink 68 % into ground |
| Hairlines and the resin's edge | `--line` | ink 20 % into ground | ink 26 % into ground |

The exhibits (sRGB approximations computed from published descriptions, labelled as approximations on the page, set as data in `src/data/pigments.js`, never as chrome):

| No. | Pigment | Ended | Approximation | Grain |
|---|---|---|---|---|
| 1 | Mummy brown | 1960s | `#5c3b26` | warm, translucent, with resin and fibre |
| 2 | Uranium red | 1943 | `#d4482b` | glaze: glassy, with bubbles |
| 3 | Indian yellow | c. 1910 | `#e2a51c` | translucent, deep golden |
| 4 | Scheele's green | c. 1900 | `#6f9a35` | fine, bright, slightly dull |
| 5 | Lead-tin yellow | c. 1750 | `#efd86c` | small, rounded, opaque |
| 6 | Tyrian purple | 1453 | `#6a1043` | fine and dense |
| 7 | Egyptian blue | c. 4th century | `#2b5fae` | angular, glassy crystals |

Contrast (WCAG 2.x, computed): lab — ink on ground 15.40 : 1, muted 5.77 : 1, ground on the ink button 15.40 : 1; ir — light ink on ground 15.69 : 1, muted 7.54 : 1. Text never sits on a pigment field: every word in a chapter is on a ground-coloured plaque or in the page margin on the ground. The colour chips beside names run from 10.18 : 1 (Tyrian purple) down to 1.22 : 1 (lead-tin yellow) against the ground; every chip carries a 1 px ink hairline, so its shape reads whatever its colour, and no chip carries meaning that its name beside it does not. Focus ring: 2 px ink, 3 px offset, 15.40 : 1 and 15.69 : 1.

Wide gamut: there is no accent hue to duplicate; the pigment approximations stay sRGB on purpose, because they are approximations and claiming P3 would overstate them.

## Typography
Voice: a high-contrast serif with ball terminals and a long, sharp `y`, the precision of an engraved specimen label or a brass plate on a cabinet drawer, which can say "Seven colours you can no longer buy" quietly and still be the loudest thing on the page; and a book face with old-style figures that reads like a catalogue note.

Candidates pulled with `fonts.mjs search` (serif at 400–700, display at 400, variable serif) and judged on `.awards/type/specimen-display.png` and `specimen-text.png` with the real headline, a real label line and a real paragraph:
- **Chosen display: Kalnia** (Frida Medrano for Google Fonts, OFL-1.1, weights 400 and 600). The highest contrast of the six, wide, with ball terminals and a hairline finish that reads as engraved; it is the only candidate that looks like a label, not a book.
- **Chosen body: EB Garamond** (Georg Duffner and Octavio Pardo, OFL-1.1, weights 400 and 600). Old-style figures by default, so "c. 1750" and "1453" sit in the line like a catalogue's dates; quiet at 20 px. The Fontsource subset carries no small-caps feature, so catalogue numbers are set as tracked capitals at label size, not as faux small capitals.
- Rejected display: Imbue (condensed didone, elegant but fashion-magazine, and too narrow for a claim that must hold three lines); Poltawski Nowy (a fine book face, too warm and too calligraphic for a label); Brygada 1918 (a text face at display size, no engraving in it); Libre Baskerville (the default "classic" serif, nothing of the specimen); Hahmlet (soft, wedge serifs, a newspaper voice).
- Rejected body: Alegreya (lively, calligraphic, competes with Kalnia); Markazi Text (small x-height and tight at body size); Noto Serif (neutral to the point of absence); Eczar (heavy, a display voice in disguise).

Contract: a voice and a silence. Kalnia for display, h2 and the colour names (h3); EB Garamond for body, labels, controls and the stage readout. No third face.

Scale, vw-lock on a 1440 artboard, `clamp()` floors for the phone:
- `--display: clamp(2.75rem, 6.3889vw, 6.5rem)` — 92 px at 1440, 44 px at 390; three lines on desktop, four on a phone.
- `--h2: clamp(2rem, 3.8889vw, 3.75rem)` — 56 px at 1440.
- `--h3: clamp(1.5rem, 2.0833vw, 2rem)` — 30 px at 1440, the colour names on their labels.
- `--body: clamp(1.125rem, 1.3889vw, 1.3125rem)` — 20 px at 1440, 18 px on a phone.
- `--label: 0.8125rem` — 13 px, EB Garamond 600, uppercase, tracked 0.08em: catalogue numbers, dates and the stage readout's captions on the label cards. A museum label is a metadata world, so these labels are earned; none sits above a heading as an eyebrow.

Display setting: tracking −0.02em at display, −0.015em at h2; leading 1.0 at display after checking that the descender of `y` clears the cap of the line below. Loading: self-hosted woff2 in `public/fonts/`, four files, 80 KB in all; `font-display: swap`; metric-matched fallbacks (`Kalnia Fallback`: Times New Roman, size-adjust 127.3 %, ascent 82.1 %, descent 23.6 %; `EB Garamond Fallback`: Times New Roman, size-adjust 94.6 %, ascent 106.4 %, descent 31.5 %); Kalnia 400 is preloaded. No text is split.

## Layout
- Artboard 1440 × 900; 12 columns; gutter `clamp(20px, 4.1667vw, 120px)`; unit 4 px.
- Scaling: vw-lock above 768 px through the `clamp()` tokens; fixed floors below.
- The microscope field is fixed behind the whole page (a `<canvas>` with a static fallback); chapters are transparent so the field shows, and their words sit on label cards (columns 1–5 or 8–12, alternating by chapter) so no text is ever on a pigment.
- Prose measure 32 em on the cards. Section padding `calc(var(--unit) * 40)` desktop, `calc(var(--unit) * 24)` phone; each layer chapter is tall (about 1.6 viewports) so the field holds each pigment while its card reads.
- Coarse pointer: no hover-only state; targets 44 × 44 px; the seven colour links collapse to a menu under 900 px.
- Resize: the GL field rebuilds on a debounced `ResizeObserver`; never a reload.

## Elevation & Depth
Optical, one policy: the microscope. Depth comes from focus (the grains are sharp in the focal plane and the binder around them softens), from the light passing through translucent pigments (Indian yellow, mummy brown, the uranium glaze) and from the resin block's polished face (a soft highlight along its top edge, drawn in CSS). The label cards are flat paper with a 1 px `--line` edge and no shadow. No drop shadows, no glass, no glow outside the infrared chapter, no grain over text.

## Shapes
Radius 0 for cards, buttons and fields; the resin block alone is a rounded rectangle (18 px), as cast resin is. Rules are 1 px hairlines in `--line`. Colour chips are 10 × 10 px squares with a 1 px ink hairline. Icons are 1.25 px strokes.

## Components
- **Museum line (nav):** fixed top bar on the ground with a hairline; the museum's name at the left, the seven colour names as links with their chips across (the current layer marked `aria-current`), "Book" at the right. Phone: the name, the current layer and a Colours menu (non-modal list, Escape closes).
- **Stage readout:** a small fixed line at the bottom left in label size: depth in µm, layer number and name, year it ended, magnification; text, `aria-live="off"`.
- **Resin block:** the cross-section object, CSS-drawn: a translucent grey rounded rectangle with a polished face showing seven bands in layer order (approximations), a 1 mm scale bar and the catalogue number "MEC 7".
- **Plaque (wall label):** a museum wall label, one per exhibit, in four different compositions down the page: catalogue number and year in label capitals, the colour name in Kalnia, two short paragraphs (what it was, why it ended), a confidence note in muted text (verified, recalled or uncertain), and the chip.
- **Infrared toggle:** a real `<button aria-pressed>` "Visible light / Infrared" inside the Egyptian blue stage; the scroll dims the visible light, the button flips it at once.
- **Booking form (button-primary):** day (a native date input limited to Tuesday–Sunday), time slot (a radio group, 10:00 to 16:40 every 40 minutes), number of people (1–6); inline errors, a submitting state and a confirmation with a booking number that says plainly nothing was charged. The action: ground text on ink, radius 0, at least 48 px tall; hover inverts in 180 ms; focus ring; active 1 px press; disabled at 50 %.
- **Sources list:** an ordered list of sources, one line per claim, each with its confidence label.
- **404:** the resin block with an empty layer; one line, three routes out.

## Motion
Register: editorial. A museum is read slowly; arrivals are long and soft, nothing bounces.
- `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` — arrivals (the block settling on load, a label card's one moment).
- `--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)` — travel between known states (the microscope moving in from the block to the first layer).
- `--ease-theme: cubic-bezier(0.87, 0, 0.13, 1)` — the infrared repaint.
- `--dur-feedback: 180ms`, `--dur-routine: 420ms`, `--dur-hero: 1200ms` (the block turning once on load). Stagger 0.08 s. The stage travel and the infrared dim are scrubbed on `ease: 'none'`.
- Tiers: full (the stage travels continuously down the section with the scroll), reduced (the field cuts from layer to layer at the boundaries; the infrared view is a cut), static (each layer's still field, CSS-drawn, no canvas). Under `prefers-reduced-motion: reduce` the duration tokens shorten to 0 / 120 ms / 200 ms; no global kill.

## Browser surfaces
- `::selection`: ink ground with ground text (the infrared chapter inverts it); `caret-color`: ink.
- Scrollbar: thin, thumb `--ink` on `--ground`; native scrolling under it.
- `:focus-visible`: 2 px `--ink` ring, 3 px offset, everywhere.
- `color-scheme: light`, dark inside the infrared chapter; `<meta name="theme-color">` `#eceeeb`.
- Favicon: the resin block's seven bands as a tiny rounded square; Open Graph image: the first viewport at 1200 × 630, produced at ship.

## Do's and Don'ts
- Do keep every pigment inside its grains and its chip; let the page stay grey around it.
- Do label every colour as an approximation and every claim with its confidence.
- Do put every word on a label card or on the ground, never on a field of grains.
- Don't flood a section with a pigment, tint a button, or use a pigment for a rule or an icon.
- Don't use faux small capitals; tracked label capitals instead.
- Don't animate anything but the block on load, the stage travel and the infrared dim.
