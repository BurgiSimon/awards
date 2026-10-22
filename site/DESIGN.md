---
name: awards — the wind tunnel
description: A daylight test lab. Graphite hairline streamlines on a cool lab ground, one warning orange, an extended heavy grotesque for markings and a mono for instrument labels.
colors:
  ground: "#e8ebe9"
  ink: "#15181b"
  accent: "#d9480f"
typography:
  display:
    fontFamily: "Archivo, Archivo Fallback, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3.5rem, 12vw, 13rem)"
    fontWeight: 850
    fontStretch: "125%"
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Archivo, Archivo Fallback, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Martian Mono, Martian Mono Fallback, ui-monospace, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  none: "0"
spacing:
  unit: "4px"
  gutter: "clamp(20px, 4.1667vw, 120px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    padding: "1rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  command:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
---

# awards — design system

The frontmatter is the machine-readable layer; keep every value identical to `src/styles/tokens.css`.

## Overview
- **Creative north star:** the wind tunnel. The page is a test section; the flow is the measurement; labels are the rig's markings.
- **Colour strategy:** committed accent. One warning orange (the colour of test tags and tunnel markings) does every emphasis job on a light, cool lab ground with graphite ink. Light because the scene is a lit rig beside a working terminal; the one ink-ground chapter (the readout) is the instrument panel, a tempo change rather than a dark mode.
- **What this world refuses:** the docs/OSS default (sidebar, code blocks, a hero built from an install command) and the Awwwards default (near-black ground, neon glow, blob or particle hero, fade-and-rise).

## Colors
| Token | Value | Role |
|---|---|---|
| `--ground` | `#e8ebe9` | lab ground, every page |
| `--ink` | `#15181b` | text, hairlines, streamlines, primary button surface |
| `--accent` | `#d9480f` (P3 `color(display-p3 0.82 0.3 0.1)`) | separated flow, focus ring, selection, the one live marker per chapter; never body text |
| `--muted` | `color-mix(in oklab, ink 68%, ground)` ≈ `#595c5d` | secondary text, readout units |
| `--line` | `color-mix(in oklab, ink 16%, ground)` | rules, table hairlines |

Contrast (computed, WCAG 2.x):
- ink on ground 14.84:1 · muted on ground 5.62:1 (body-safe)
- accent on ground 3.58:1 → large text, focus ring and marks only (≥ 3:1)
- accent on ink 4.14:1 → focus ring on the readout theme, large figures only
- ground on ink (primary button) 14.84:1

Themes (`data-theme` on `<html>` or a section): `default` as above; `readout` swaps ground and ink (`#15181b` / `#e8ebe9`), accent unchanged, `color-scheme: dark` inside it. Chroma comes only from the accent; there is no imagery.

## Typography
- **Contract:** one superfamily, two cuts, plus a mono for instruments. Archivo (Omnibus-Type, OFL 1.1), variable `wght 100–900`, `wdth 62–125`: display at `font-stretch: 125%`, weight 850 (wide heavy markings, a good obstacle for the flow); body at 100 % width, 400/600. Martian Mono (Evil Martians, OFL 1.1), variable, for labels, readouts and commands only — the audience's terminal is open beside the page; mono is the instrument voice, never a heading style.
- **Scale:** artboard 1728. Display `clamp(3.5rem, 12vw, 13rem)`; h2 `clamp(2.25rem, 5.0926vw, 5.5rem)` (88 px at 1728); h3 `clamp(1.25rem, 1.6204vw, 1.75rem)`; lede `clamp(1.125rem, 1.3889vw, 1.5rem)`; body 1rem/1.55; labels 0.6875rem.
- **Setting:** display tracking −0.03em, leading 0.86; h2 −0.02em, leading 0.95; labels uppercase mono, tracked .08em, 11 px minimum; tabular numerals (`tnum`) on every readout.
- **Loading:** self-hosted woff2 (`public/fonts/archivo.woff2` 78 KB, `martian-mono.woff2` 34 KB; 2 files, 112 KB); `font-display: swap`; metric-matched fallbacks with `size-adjust` / `ascent-override` / `descent-override`; the flow's obstacle field is rasterised only after `document.fonts.ready`.

## Layout
- 12-column grid on the gutter, `--gutter: clamp(20px, 4.1667vw, 120px)`; spacing in multiples of `--unit: 4px`; section padding `calc(var(--unit) * 24–40)`.
- Prose measure `--measure: 64ch`.
- Fluid clamp scale (vw-locked above 768 px, fixed floors below). Under 768 px the grid collapses to one column; the flow keeps running in the hero at the phone's own aspect.
- Coarse pointer: no hover-only information; the drag probe is replaced by scroll-driven airspeed.
- Resize rebuilds the flow's obstacle field; never a reload.

## Elevation & Depth
Sharp and shadowless. Depth only by luminance (the readout chapter) and by the flow passing behind the text. No glass, no glow, no grain.

## Shapes
Radius 0 everywhere. Hairline rules (1 px `--line`); the accent appears as a 2–4 px bar or tick, never a fill behind text. Icons: 1.5 px stroke in ink, square caps.

## Components
- **Button (primary):** ink surface, ground text, 0 radius, `1rem 1.5rem`; hover: an accent bar slides in along the bottom edge (transform, `--dur-feedback`); focus-visible: 2 px accent ring, 4 px offset; active: translateY(1px).
- **Link (secondary):** ink text, 1 px underline at 0.2em offset; hover: underline turns accent.
- **Command:** mono line with a copy button; button states idle / copied (label changes to "Copied", announced via `aria-live`) / failed ("Select and copy").
- **Readout strip:** mono labels + tabular values; live values update ≤ 10 Hz.
- **Airflow switch:** a real `<button aria-pressed>` stating "Airflow on" / "Airflow off".

## Motion
- Easing: `--ease-out-expo: cubic-bezier(.16,1,.3,1)` arrivals; `--ease-in-out-expo: cubic-bezier(.87,0,.13,1)` travel; `--ease-theme: cubic-bezier(.645,.045,.355,1)` repaints.
- Durations: feedback 160 ms, routine 400 ms, hero 1400 ms (once per chapter); stagger 0.06–0.08.
- Tiers: full (flow animates, masked line reveals); reduced (the flow draws one settled frame, reveals become 120 ms opacity); static (final frames, no transitions). Never a global animation kill.

## Browser surfaces
`::selection` accent with ground text; `caret-color` accent; `scrollbar-color` ink on transparent, thin; `:focus-visible` 2 px accent, 4 px offset (3.58:1 on ground, 4.14:1 on ink); `color-scheme: light` with `dark` inside the readout; `<meta name="theme-color" content="#e8ebe9">`; favicon: three ink streamlines bending around an orange tick; OG image 1200×630 rendered from the hero frame (produced at ship).

## Do's and Don'ts
- Do draw every streamline as an ink hairline; separation is the only place the accent enters the flow.
- Do carry numbers inside sentences and readouts, read from the repository at build time.
- Don't put the accent on body text, fills behind text, or more than one live marker per chapter.
- Don't add dots, particles, glow, gradients or blur to the flow.
- Don't use mono for headings or paragraphs.
