---
name: Varn
description: Run 0417's annealing record — light chart paper, soot ink, one recorder-ink blue, and a single dark oven port where the only glow is computed from temperature.
colors:
  ground: "#f2eee3"
  ink: "#211d19"
  accent: "#2b3f9e"
  port: "#15100c"
typography:
  display:
    fontFamily: "Martian Mono, Martian Mono Fallback, Courier New, monospace"
    fontSize: "clamp(2.25rem, 5.5556vw, 6rem)"
    fontWeight: 500
    fontStretch: "75%"
    lineHeight: 1
    letterSpacing: "-0.03em"
  readout:
    fontFamily: "Martian Mono, Martian Mono Fallback, Courier New, monospace"
    fontSize: "clamp(2rem, 3.7037vw, 4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Martian Mono, Martian Mono Fallback, Courier New, monospace"
    fontSize: "clamp(1.5rem, 1.8519vw, 2rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Source Serif 4, Source Serif 4 Fallback, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Martian Mono, Martian Mono Fallback, Courier New, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  none: "0"
spacing:
  unit: "4px"
  gutter: "clamp(20px, 4.1667vw, 120px)"
  hairline: "1px"
  measure: "62ch"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  link:
    textColor: "{colors.ink}"
    underlineColor: "{colors.accent}"
---

# Varn — design system

The frontmatter is the machine-readable layer; `src/styles/tokens.css` (with `src/styles/fonts.css`) carries the same values. Change both in one edit.

## Overview
- **Creative north star:** the strip-chart record of one annealing run. The page is paper a pen draws on; the only light in it is the oven port.
- **Colour strategy:** committed accent. One recorder-ink blue does all the emphasis — the trace, the booking action, the focus ring, selection — on a warm chart-paper ground with a hairline grid. Light, because the use scene is a laptop in a working studio between client calls and the subject's proof is a paper record; and because the brief refuses the dark molten register. The one dark field is the oven port, a local `data-theme="port"` scope, not a page theme. The glow inside it is never a token: its colour is computed from the temperature on a blackbody ramp and goes out below 525 °C.
- **Why blue:** chart recorders draw in coloured fibre-tip ink; blue is the pen that stays legible against a red-to-orange glow and reads as the cold side of the record — the side where the piece becomes safe to hold.
- **What this world refuses:** the craft-studio default (hands-at-work photo, serif headline over full-bleed, process row, gallery grid) and the Awwwards default for hot glass (near-black ground, molten-orange glow, ember fields, haze, fade-and-rise). No orange token anywhere.

## Colors

| Token | Value | Role |
|---|---|---|
| `--ground` | `#f2eee3` | chart paper |
| `--ink` | `#211d19` | soot-warm near-black: text, axes, the favicon |
| `--accent` | `#2b3f9e` (P3: `color(display-p3 0.17 0.24 0.64)`) | recorder ink. Job: **emphasis** — trace line, time cursor, action, focus ring, selection. Never a second accent. |
| `--port` | `#15100c` | the oven port interior, the one dark field |
| `--muted` | `color-mix(in oklab, var(--ink) 62%, var(--ground))` ≈ `#68645e` | secondary labels, axis numerals |
| `--line` | `color-mix(in oklab, var(--ink) 14%, var(--ground))` ≈ `#d1cdc3` | the hairline grid, one weight |

Near-black: `#211d19` is shifted warm (soot on a kiln) — not pure black, no C02 exception. Hues in the file: four, plus the P3 duplicate of the accent (C03 ≤ 6).

**Themes**

| Scope | `--ground` | `--ink` | `--accent` | `color-scheme` |
|---|---|---|---|---|
| `:root` (paper) | `#f2eee3` | `#211d19` | `#2b3f9e` | light |
| `[data-theme="port"]` (the port, the 404's empty port) | `var(--port)` `#15100c` | `#f2eee3` | `#f2eee3` | dark |

Inside the port the accent becomes paper: the recorder blue on the port dark is only 2.08:1, so the port's readout and focus ring use paper. The renderer's clear colour reads `--port` from the same CSS custom property.

**Contrast (WCAG 2.x, computed from the sRGB values)**

| Pair | Ratio | Use | Passes |
|---|---|---|---|
| ink on paper | 14.44:1 | body, labels, display | AA / AAA |
| muted (`#68645e`) on paper | 5.07:1 | secondary labels at 11 px | AA body |
| accent on paper | 7.85:1 | trace, links, action text; focus ring | AA body; ring ≥ 3:1 |
| paper on accent | 7.85:1 | action button label, selection | AA body |
| line on paper | 1.37:1 | grid hairline only, never text | decorative |
| paper on port | 16.30:1 | port readout, "Pre-heating · n %" | AA / AAA |
| muted-in-port (`#959088`) on port | 5.96:1 | secondary port labels | AA body |
| focus ring in port (paper on port) | 16.30:1 | | ≥ 3:1 |
| accent on port | 2.08:1 | **not used** — why the port remaps its accent | fails |

The glow inside the port is decorative imagery with the °C readout as its text equivalent; text never sits on the glow.

**Chroma policy:** no imagery; the accent and the port's computed glow carry all colour. The glow is data, ending at 525 °C.

## Typography

**Contract: a voice and a silence.** The instrument voice carries axes, stamps, readouts, annotations and the h1; the book voice carries the studio's log notes and nothing else.

| Role | Face | Foundry | Licence | Package |
|---|---|---|---|---|
| Instrument (display, readout, headings, labels, figures) | Martian Mono, variable `wght` 100–800, `wdth` pinned at 75 | Evil Martians | SIL OFL 1.1 | `@fontsource-variable/martian-mono@5.3.0` |
| Book (log notes) | Source Serif 4, variable `wght` 200–900, roman + italic | Frank Grießhammer / Adobe | SIL OFL 1.1 | `@fontsource-variable/source-serif-4@5.3.0` |

Why these: a monospace is an identity here because the voice is diegetically an instrument — a recorder's stamped capitals and tabular figures — and the condensed width (75) makes it read as a chart stamp rather than a code editor. Source Serif 4 is a plain book face that reads like an entry written beside the trace. Source Serif 4 is on no reflex list. Martian Mono is on the reflex lists' "Monospace identity" row (`references/reflex-lists.md`, `scripts/data/reflex-fonts.json` → `mono`), so it is a recorded, deliberate choice: `T01` under `AWARDS.md ## Exceptions`. It stays because its `wdth` axis goes down to 75, a condensed mono the open alternatives on that list lack, and the condensed cut is what makes it a chart stamp. The pairing belongs to no corpus card.

**Scale** (vw-lock on the 1728 artboard, `clamp()`ed; fixed below 768 px):

| Token | Desktop at 1728 | Value | Phone (< 768) |
|---|---|---|---|
| `--display` | 96 px | `clamp(2.25rem, 5.5556vw, 6rem)` | 2.25rem |
| `--text-readout` | 64 px | `clamp(2rem, 3.7037vw, 4rem)` | 2rem |
| `--text-heading` | 32 px | `clamp(1.5rem, 1.8519vw, 2rem)` | 1.5rem |
| `--text-body` | 18 px | `1.125rem` | 1.125rem |
| `--label` | 11 px | `0.6875rem` | 0.6875rem |

The macro is the h1 at 96 px set across the header strip in two lines (46 characters at 0.6 em advance); the readout is the second macro, the one that changes. Ratio display:label ≈ 8.7:1 — the chart, not the type, is the poster. Display ceiling 5.56 vw, well under 13 vw (T03).

**Setting.** Display tracking −0.03em, leading 1.0 (cap 0.80, descender 0.20 of the em: the ascent/descent box is exactly 1.2, so 1.0 keeps descenders of "p" and "g" clear of the next line's caps; check on rendered glyphs at build). Readout −0.02em, leading 1. Numerals are tabular by construction (monospace) and `tabular-nums slashed-zero` is set in the token layer so 0417 and 0 °C read as instrument zeros. No optical hang needed: the mono's left side bearings are even. Labels: Martian Mono 500, uppercase, +0.08em, 11 px minimum, always DOM text. Log notes: sentence case, ragged right, 18 px, leading 1.55, measure 62ch, `text-wrap: pretty`. No tracking tighter than −0.03em anywhere (T04 floor −0.06em).

**Loading.** Three self-hosted woff2 files in `public/fonts/` (latin subset, covers °, €, –, ×): Martian Mono 38,492 B, Source Serif 4 roman 50,824 B, italic 51,516 B — 140,832 B total (P05: ≤ 4 files, ≤ 400 KB). `@font-face` in `src/styles/fonts.css` with `font-display: swap`. Metric-matched fallbacks measured in Chromium: Martian Mono at wdth 75 advances 0.600 em, the same as Courier New → `size-adjust: 100%`, `ascent-override: 100%`, `descent-override: 20%`, `line-gap-override: 0%`; Source Serif 4 is 1.148× Times New Roman → `size-adjust: 114.8%`, `ascent-override: 90.2%`, `descent-override: 29.2%`, `line-gap-override: 0%`. Preload `martian-mono-latin-standard-normal.woff2` only. The `@font-face` pins `font-stretch: 75%`, so every instrument use renders condensed with no per-component setting. Any text splitting (the h1 stamp, annotations) runs only after `document.fonts.ready`, and again on resize. The files came from the `@fontsource-variable` packages; the stack phase may install those packages instead and point the `src` URLs at them, keeping these family names and fallbacks.

## Layout
- **Artboard** 1728; every desktop measure is `px / 1728 × 100` inside a `clamp()`; fixed px below 768.
- **Grid:** the chart *is* the grid. Plot area inside `--gutter` on both sides; °C axis 0–1,200 in 12 major divisions, hour axis 0–14 in 14 major divisions, minor hairlines at fifths; all at `--hairline` 1 px in `--line`. Major divisions at 1 px in `color-mix(in oklab, var(--ink) 28%, var(--ground))` only if the build shows the 14 % grid too faint — one weight is the rule, so decide once.
- **Spacing:** `--unit` 4 px; section padding and the header strip height are multiples (strip 16 units = 64 px desktop, 14 units phone).
- **Measure:** log notes at most 62ch, set in a column beside the trace like marginalia.
- **Scaling system:** vw-lock with clamp, no JS on resize, never a reload at a breakpoint.
- **Mobile approach:** graceful degrade — same content and links; the stage becomes a sticky 54 svh top band (port over chart) with the chapters reading beneath; on short landscape screens (≤ 520 px tall) the stage unsticks.
- **Coarse pointer / phone:** the port stacks above the chart; axis labels shorten (`1,100 °C` → `1100°`, `hour 3` → `3h`); the action stays in the fixed strip; the polariscope handle grows to a 44 px hit area.

## Elevation & Depth
**Line work and paper; sharp and shadowless.** Depth only by luminance — paper, ink, and the one dark port. No shadow, no blur, no glass, no grain, no halo. Bloom and glow exist only inside the port's canvas, driven by temperature; outside the port nothing glows (X10, X11).

## Shapes
- Radius: 0 everywhere, including the focus ring and the port.
- Corner language: registration ticks at the port's four corners and at the plot origin, drawn as 1 px strokes in pseudo-elements.
- Clipping: the port is a rectangular window (`overflow: hidden`), the canvas never bleeds past it.
- Icons: 1.5 px strokes in `--ink`, square caps; the only icon set is the axis arrowheads and the polariscope handle.

## Components
Named by `awards:structure` from the page map. Every value comes from the tokens; class names are by role.

- **Header strip** (`.strip`, custom): fixed, `--strip` 64 px (56 px phone), paper ground, 1 px `--line` rule below. Stamp in `.t-label`; Hours index (`nav.hours`, six links, `aria-current="true"` in `--accent` for the chapter in view) at ≥ 1200 px; below it a `.strip__toggle` button (`aria-expanded`, `aria-controls="hours-menu"`). Motion hook: `[data-menu-toggle]`. A11y: the action is the first tab stop after the skip link.
- **Hours overlay** (`#hours-menu`, `nav-overlay-fullscreen`): `role="dialog" aria-modal`, after `#page`, `hidden` until opened; paper ground, links at `--text-heading` with the hour in `.t-label` `--muted`. Motion: links in on `--ease-out-expo`, stagger `--stagger`, out faster. A11y: `inert` on `#page`, focus trap, Escape, focus back to the toggle, Lenis stopped; instant under reduced motion.
- **Stage and rails** (`.stage`, `.rails`, `.chapter`, `sticky-stages-rails`): the stage is `position: sticky` under the strip; rails are transparent sections with `data-rail` and `data-hours`; notes (`.note`) sit on a paper ground in the plot's lower left, ≤ 42 % and `--measure`. No `pin: true`.
- **Chart** (`figure.chart`, `scroll-drawn-svg-path`): SVG `viewBox 0 0 1400 1200` (100 units per hour, 1 per °C), `preserveAspectRatio="none"`, every stroke `non-scaling-stroke`; grid one path in `--line` at `--hairline`, axes `--ink`, trace `--accent` at 2 px (`[data-trace]`, `data-motion="spatial"`). Events, axis numerals and the time cursor are DOM text positioned by `--h` (0–14) and `--t` (0–1,200); event dots are 5 px `--accent` squares in pseudo-elements. Readouts `[data-readout-hour]`, `[data-readout-temp]` at `--text-heading`, `aria-hidden` (the chapter heading carries the value). Reduced: full trace at load. A11y: `role="img"` with a full `<title>`, the schedule table as the text alternative.
- **Oven port** (`.port`, `data-theme="port"`): the one dark field; `[data-gl-slot]` for the canvas (created by the script, `aria-hidden`), `[data-port-swatch]` whose `--glow` the fallback computes from temperature, the vessel drawing (`svg role="img"`, paper strokes), readout `.t-readout` `[data-readout-port]`. Pre-heat status `[data-preloader]`: `role="status"`, `hidden` until the script shows it, a "Skip pre-heat" button inside (`preloader-counter-hold`).
- **Polariscope** (`figure.polariscope`, `compare-hold-drag` with a native range): two vessel drawings, fringes as 1 px `--ink` contours clipped to the vessel; `--split` on the figure is the compare position (`[data-compare]`, `[data-compare-input]`); `accent-color: var(--accent)`; 44 px row, 56 px under `any-pointer: coarse`, `touch-action: pan-y`. Static: both views side by side. A11y: label, `aria-valuetext`, a skip link to the ramp.
- **Pieces and terms** (`table.pieces`, `dl.terms`, `product-specification`): hairline `--line` rules, headers in `.t-label` `--muted`, prices in the instrument face with tabular figures. `[data-annotation-hours]` tells motion where on the curve each block belongs. Phone: rows reflow to piece + price over size.
- **Booking sentence** (`form.sentence`, `sentence-form-enquiry`): Source Serif 4 at 1.375 rem / 2.3; blanks are bottom-ruled inline fields (`field-sizing: content`), radios and select native with `accent-color`; submit is the `.action`. Errors `ul.errors` filled by the script; confirmation `[data-sent]` receives focus. No-JS: `mailto:` post.
- **Printout tail** (`footer.printout`, `designed-footer`): dashed `--ink` tear line after "End of record", the schedule table in `.t-label`, next run with the action, `<address>`, "Back to hour 0", colophon over a `--line` rule. Phone: one column, table first.
- **404** (`404.html`): base.css only; stamp strip, empty axes and grid `aria-hidden`, h1 at `--display`, one line, three links.

- **Action — "Reserve a firing slot" / "Next run: open slots"** (`button-primary`): `--accent` ground, `--ground` text, Martian Mono label style at 0.8125rem. Hover: ground `--ink` over `--dur-feedback` on `--ease-out-expo`. Focus-visible: 2 px `--accent` ring, 4 px offset (on the accent ground the offset leaves a paper gap so the ring reads at 7.85:1). Active: inset by 1 px translate, no shadow. Disabled: `--muted` text on `--line`, `aria-disabled`, never the accent. Loading (enquiry submit): label becomes "Recording…" with the trace's pen glyph; no spinner.
- **Link:** `--ink` text, 1 px underline in `--accent`, `text-underline-offset: 0.2em`. Hover: text turns `--accent`. Focus-visible: the ring.
- **Readout:** `.t-readout` in the port (paper on port) and on the chart cursor (ink on paper); `aria-live="off"`, the chapter heading carries the announced value.

## Motion
- Easing: `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` arrivals; `--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)` travel (hours-index jumps); `--ease-theme: cubic-bezier(0.645, 0.045, 0.355, 1)` repaints.
- Durations: `--dur-feedback: 160ms`, `--dur-routine: 400ms`, `--dur-hero: 1400ms` (the one pen-down tick is 1.2 s, inside the hero band); `--stagger: 0.08s`.
- Scrubbed motion (trace, cursor, temperature) has no duration: it is scroll position.
- Reduced motion: `--dur-feedback: 0ms`, `--dur-routine: 120ms`, `--dur-hero: 200ms`, `--stagger: 0s`. Tiers: **full** (scrubbed record), **reduced** (curve drawn at load, vessel cuts to each chapter's stage state), **static** (final frame, every annotation visible). No global animation kill.

## Browser surfaces
- `::selection`: `--accent` ground, `--ground` text (in tokens.css).
- `caret-color` and `accent-color`: `--accent` (the polariscope range input inherits it).
- Scrollbar: thin, thumb `color-mix(in oklab, var(--ink) 45%, var(--ground))`, transparent track; native scrolling underneath.
- Focus ring: `:focus-visible` 2 px `--accent`, 4 px offset, radius 0; paper inside the port.
- `color-scheme: light` on `:root`, `dark` on `[data-theme="port"]`.
- `<meta name="theme-color" content="#f2eee3">` (paper); the page has no theme swap, so it never changes. The 404 keeps paper.
- Favicon: `public/favicon.svg`, a cooling curve on axes in `--ink` over paper.
- Open Graph image (1200×630, to be drawn at build): the full record of run 0417 in ink and recorder blue on paper, the port as one dark rectangle with the clear finished vessel; the h1 in Martian Mono.

## Do's and Don'ts
- Do let the recorder blue do one job: emphasis — trace, cursor, action, ring, selection.
- Do compute the port glow from temperature in the shader and the DOM fallback; it is data, not a palette colour.
- Do keep every label as DOM text in Martian Mono at ≥ 11 px.
- Do set log notes only in Source Serif 4, never in caps, never justified.
- Don't add an orange, red or ember token, a glow, a halo or a gradient outside the port.
- Don't put the recorder blue on the port dark, or any text on the glow.
- Don't set tracking tighter than −0.03em, or the display above its clamp.
- Don't use a shadow, a radius, glass or grain anywhere.
- Don't add a third face; the 404 and the footer printout use the same two voices.
