---
name: awards-home
description: A two-plate press proof on coated paper; the key carries every word, process yellow carries the solids, the marks and the press OK.
colors:
  ground: "#f3f2ee"
  ink: "#1f1c1a"
  accent: "#ffd400"
typography:
  display:
    fontFamily: "Special Gothic, Special Gothic Fallback, Arial Narrow, sans-serif"
    fontSize: "168px"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 78"
  h2:
    fontFamily: "Special Gothic, Special Gothic Fallback, Arial Narrow, sans-serif"
    fontSize: "72px"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 82"
  h3:
    fontFamily: "Special Gothic, Special Gothic Fallback, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0em"
    fontVariation: "'wdth' 92"
  body:
    fontFamily: "Special Gothic, Special Gothic Fallback, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Special Gothic, Special Gothic Fallback, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 115"
rounded:
  none: "0px"
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
  solid:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
---

# awards-home — design system

The frontmatter is the machine-readable layer; every value is identical in `src/styles/tokens.css`. Fluid sizes are recorded here at the 1440 px artboard; their `clamp()` lives in `## Typography` and `tokens.css`. Widths are the variable `wdth` axis of the one family.

## Overview
- **Creative north star:** a press sheet under the viewing booth, two plates, one of them still out of register.
- **Colour strategy:** restrained duotone with one committed spot. Proof paper and a warm near-black key carry every word; process yellow is the second plate, a surface that does every non-text job: the solids under the headlines, the colour bar, the registration targets, the halftone of the proof, the selection, the inner rule of the focus ring and the press OK. Light because a proof is judged under a daylight booth on paper. Yellow never sets text on paper (1.28 : 1); key text sits on yellow solids (11.84 : 1).
- **What this world refuses:** a docs hero with an install command over a gradient, icon feature grids, a stars badge; near-black with neon, glow, blob or particle fields, fade-and-rise; gradient text, glass, soft drop shadows; the previous contact sheet of captures with jury marks.
- **Calibration:** [site:the-line] — one hot ink doing loading, selection, active state and the last screen, display to label 175 : 10 at 1440 → here one spot yellow doing solids, the colour bar, registration, selection, focus and the OK, display 168 px to label 12 px (14 : 1), because the sheet's furniture must stay legible as labels while the claim fills the plate.
- **Calibration:** [site:grids-obys] — hairline spec rows that quantify a design decision on a 3-edge grid, body 14 px → here hairline rows carry the audit's rule counts and the jury's scores at 18 px body on a 12-column sheet, because the numbers are the proof and must read at arm's length.
- **Calibration:** [site:animejs] — counts printed on the page as claims you can check (body 16 px, 4 left edges) → here every count is read from the repository at build and printed with the date it was read, on 4 working edges (margin, column 4, column 7, column 10).
- **Lint:** `design-md.mjs lint` reports 0 errors and 0 warnings.

## Colors
| Role | Token | Value |
|---|---|---|
| Proof paper (ground) | `--ground` | `#f3f2ee` |
| Key plate (ink): offset black, warm | `--ink` | `#1f1c1a` |
| Spot plate (accent): process yellow, a surface | `--accent` | `#ffd400` (P3 `color(display-p3 1 0.84 0.1)`) |
| Muted text | `--muted` | ink 70 % into paper (`#5f5c5a`) |
| Hairlines, crop marks | `--line` | ink 20 % into paper |
| Overprint | — | yellow under key multiplies to key; never a new token |

Contrast (WCAG 2.x, computed): key on paper 15.13 : 1; muted on paper 5.92 : 1; key on yellow 11.84 : 1 (labels and headlines on solids); yellow on paper 1.28 : 1, so yellow is never text or a lone focus indicator; muted text never sits on yellow. Focus ring: 2 px key outline, 4 px offset (15.13 : 1 on paper, 11.84 : 1 on yellow). There is one theme (`proof`); the 404 uses the same tokens. Chroma from imagery: the halftone of the Ekvator proof is printed in the two inks, so no third hue appears even there.

## Typography
Voice: a sturdy American gothic with the cadence of trade-press headlines, condensed when it shouts, plain when it reads, wide and tracked when it labels a plate.

Candidates pulled with `fonts.mjs search` (sans-serif with a width axis, sans-serif at 900, display at 800) and judged on `.awards/type/specimen.png` with the real headline and paragraph:
- **Chosen: Special Gothic** (Alistair McCready, OFL-1.1), one variable file, wght 400–700 and wdth 75–125. A gothic in the trade-press tradition; at wdth 78 and 700 it fills the plate like a proof headline, at 100 and 400 it reads quietly, at 115 and 600 it sets the sheet's furniture. One family as a voice and its own silence, by width.
- Rejected: Phudu (all caps only: the body and the commands cannot be set in it); Asap Sharp (the sharp terminals read as a tech-brand sans, not print); Saira (squared counters pull toward a sci-fi console); Pliant (spacing collapses at body size, as on the specimen).

Contract: one family across three widths. No second display face. The install commands are set in the system monospace stack (`--font-mono`) because they are code a visitor pastes; that is the one place a third face appears, recorded under `AWARDS.md ## Exceptions` if the audit asks.

Scale, vw-lock on a 1440 artboard:
- `--display: clamp(3.25rem, 11.6667vw, 10.5rem)` — 168 px at 1440, wdth 78, leading 0.86, tracking −0.02em.
- `--h2: clamp(2.25rem, 5vw, 4.5rem)` — 72 px, wdth 82.
- `--h3: clamp(1.25rem, 1.9444vw, 1.75rem)` — 28 px, wdth 92.
- `--body: clamp(1.0625rem, 1.25vw, 1.1875rem)` — 18 px, wdth 100.
- `--label: 0.75rem` — 12 px, wdth 115, 600, uppercase, tracked 0.08em. Labels exist only as the sheet's furniture (slug line, plate names, densities, the margin readout): this is a metadata world. No label sits over a heading as an eyebrow.

Loading: one self-hosted woff2 of 71 KB in `public/fonts/`, preloaded; `font-display: swap`; metric-matched fallback (`Special Gothic Fallback`: Arial, size-adjust 94 %, ascent 106.9 %, descent 31.4 %). No text is split.

## Layout
- Artboard 1440 × 900; 12 columns; gutter `clamp(20px, 4.1667vw, 120px)`; unit 4 px.
- vw-lock above 768 px through the `clamp()` tokens; fixed floors below. One system.
- The sheet: crop marks inset one gutter from each viewport corner, fixed; the registration targets on the top and bottom centre lines, fixed; the colour bar down the right edge, fixed on desktop and dropped on phones (its job moves into chapter 3).
- Prose measure 36 em. Section padding `calc(var(--unit) * 36)` desktop, `calc(var(--unit) * 22)` phone.
- Coarse pointer: no hover-only state; copy buttons 44 × 44 px minimum.
- Resize: the register value is recomputed from section positions on a debounced `ResizeObserver`; never a reload.

## Elevation & Depth
Offset print on coated stock: flat, no shadows, depth only by overprint (yellow multiplied under the key) and by the halftone screen. Hairline crop marks and rules at 1 px in `--line`; registration targets at 1 px in key and in yellow.

## Shapes
Radius 0. Rectangular solids; circles only in the registration targets and halftone dots. Icon stroke 1.5 px where a glyph is needed (copy, check).

## Components
- **Slug line (nav):** fixed top; job name and version left, plate names as chapter links across (K, then the phases), the live register error in mm and the current phase name right. States: link hover underline, focus ring, `aria-current` on the chapter in view. Phone: job name, error, and a "Plates" button that opens the chapter list (a non-modal dialog, Escape closes).
- **Install block:** a tablist (Claude Code, Codex) over two commands in `<pre><code>`; one primary button "Copy the install commands" copies the visible tab's two lines; a status line says "Copied" or explains a blocked clipboard and selects the text instead. States: hover (yellow ground, key text), focus ring, active 1 px press, success, error.
- **Register layer:** every yellow element carries `data-plate="y"` and is transformed by one scroll-read value; reduced motion steps it per chapter.
- **Skill run rows:** an `<ol>` of the eleven skills in order, name, one line of job, the phase number; hover and focus draw a yellow solid under the row.
- **Colour bar (the floor):** the audit's families as patches with their rule counts as text, a `<dl>` under the visual bar.
- **Press check stage:** a sticky stage on a 200 vh rail; the Ekvator proof as a halftone in two inks; the jury's disposition line quoted as text; the OK stamp prints when the plates meet.
- **Recipe case:** recipe titles in rows grouped by group, columns on desktop, one column on a phone, each a link to its folder on GitHub.
- **Colophon:** version, counts, read date, licence, links.
- **404:** a spoiled sheet marked waste, plates far out, three routes.

## Motion
Register: mechanical. A press run is short, firm and exact.
- `--ease-out-expo: cubic-bezier(0.25, 1, 0.5, 1)`; `--ease-in-out-expo: cubic-bezier(0.65, 0, 0.35, 1)`; `--ease-theme` the same in-out.
- `--dur-feedback: 160ms`, `--dur-routine: 360ms`, `--dur-hero: 800ms` (the OK stamp, once). Stagger 0.06 s. Steps allowed.
- Tiers: full (the plate drifts into register with the scroll), reduced (the plate steps to each chapter's register; the stamp prints without travel), static (in register, stamp printed). Durations shorten under `prefers-reduced-motion: reduce`; no global kill.

## Browser surfaces
- `::selection` yellow with key text; `caret-color` key.
- Scrollbar thin, key thumb on paper.
- `:focus-visible` 2 px key ring, 4 px offset, everywhere.
- `color-scheme: light`; `<meta name="theme-color">` paper `#f3f2ee`.
- Favicon: a registration target in key with its yellow twin offset (SVG). Open Graph image: the first viewport of the sheet, 1200 × 630.

## Do's and Don'ts
- Do let yellow do every non-text job and keep every word in the key.
- Do print counts as read from the repository, with the date.
- Don't set text in yellow on paper or muted text on yellow.
- Don't move the key plate: words never animate out of place.
- Don't add a third hue, a shadow or a glow.
