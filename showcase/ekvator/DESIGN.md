---
name: Ekvator
description: A plaster wall lit by another city's sun; one heavy, wide voice that throws real shadows and a quiet Norwegian grotesque for the numbers.
colors:
  ground: "#e7e4dd"
  ink: "#151a22"
  accent: "#ef9a3c"
  night-ground: "#192030"
  night-ink: "#e7e4dd"
  night-accent: "#f0a257"
typography:
  display:
    fontFamily: "Unbounded, Unbounded Fallback, Arial, sans-serif"
    fontSize: "128px"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  h2:
    fontFamily: "Unbounded, Unbounded Fallback, Arial, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  h3:
    fontFamily: "Unbounded, Unbounded Fallback, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, Schibsted Fallback, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Schibsted Grotesk, Schibsted Fallback, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
rounded:
  none: "0px"
spacing:
  unit: "4px"
  gutter: "60px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  button-quiet:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
---

# Ekvator — design system

The frontmatter is the machine-readable layer; every value is identical in `src/styles/tokens.css`. Fluid sizes are recorded here at the 1440 px artboard; their `clamp()` lives in `## Typography` and in `tokens.css`.

## Overview
- **Creative north star:** a wall in a dark northern room, lit by a window of someone else's daylight.
- **Colour strategy:** restrained duotone. A plaster ground and a cool near-black ink carry every surface; all other chroma comes from the computed light itself (1,800 K at dawn to 5,600 K at noon), which the WebGL wall paints and the CSS fallback approximates. One bookend accent, the warm end of that light, is spent only on the conversion and the 404. The ground is light because the wall is daylit; the one dark field is the polar-night interruption and blue hour, where the theme flips to `night` because the light has actually gone.
- **What this world refuses:** a lamp cut out on white, a lifestyle sofa photo, a three-feature grid; near-black with neon glow, a blob or particle hero, fade-and-rise sections; gradient text, glass, drop shadows that are not cast by the light.
- **Calibration:** [site:white-desert] — display to body runs 256 : 14 px at 1440 (about 18 : 1) on a poster first screen → here 128 : 19 px (about 7 : 1), because the claim must share the first viewport with the light patch and still run on three lines, and the readout under it has to read at arm's length on a phone.
- **Calibration:** [site:oryzo] — an artboard-locked display of 123 px at 1440 and 100 px on a phone, margin 48 / 24 → here 128 px at 1440 and 44 px at 390 with a 60 / 20 px margin; the phone h1 runs four lines under the patch instead of holding poster scale, because on the phone the light owns the top half of the screen.
- **Calibration:** [site:son-daven] — two tokens re-pointed by three theme classes swapped per section → here two token sets, `day` and `night`, re-pointed by the borrowed sun's elevation (below −3° the wall is in twilight and the ink flips), never by section habit.

- **Lint:** `design-md.mjs lint` reports 0 errors and 3 orphaned-token warnings for `night-ground`, `night-ink` and `night-accent`; they are the `night` theme, swapped in by `data-theme`, so no component references them by name. Kept.

## Colors
| Role | Token | Day | Night |
|---|---|---|---|
| Ground, the unlit plaster | `--ground` | `#e7e4dd` | `#192030` |
| Ink, cool near-black shifted toward the northern blue | `--ink` | `#151a22` | `#e7e4dd` |
| Bookend accent, the warm end of the light | `--accent` | `#ef9a3c` | `#f0a257` |
| Muted text | `--muted` | ink 72 % into ground | ink 72 % into ground |
| Hairlines | `--line` | ink 22 % into ground | ink 26 % into ground |

`data-theme` on `<html>` is the single source: `day` or `night`, chosen from the borrowed sun's elevation at the current scroll position. The renderer reads the same tokens for its ambient colour.

Contrast (WCAG 2.x, computed):
- Day: ink on ground 13.75 : 1; muted on ground 6.10 : 1; ink on accent 7.78 : 1 (the action is ink text on an accent surface; the accent on the ground is 1.77 : 1 and is never text); ink and muted on the dimmest dawn wall the shader may paint (`#c9ccd3`) 10.86 : 1 and 4.81 : 1; ink on the brightest lit patch (`#ffe7c4`) 14.5 : 1.
- Night: light ink on ground 12.81 : 1; muted 7.25 : 1; accent on ground 7.76 : 1 (large text and the action only); light ink and muted on the lightest twilight wall the shader may paint (`#344058`) 8.19 : 1 and 4.63 : 1.
- Focus ring: accent on day ground is 1.77 : 1, so the ring is drawn in ink with a 2 px accent inner line (ink ring 13.75 : 1); on night, the accent ring alone is 7.76 : 1.
- The shader clamps the wall's luminance per theme (day ≥ the dawn floor above, night ≤ the twilight ceiling above), so no hour of any city can drop text below 4.5 : 1.

Wide gamut: the accent is duplicated as `color(display-p3 0.9 0.62 0.3)`; ground and ink stay sRGB. Chroma from imagery: the light colour is computed per frame from the solar elevation (Kelvin → RGB); it is never a token.

## Typography
Voice: a heavy, wide, warm display with soft corners and thick strokes, a Nordic sign painted on a building, whose letters throw shadows you can read; and a quiet grotesque that prints times, angles and prices like a tide table.

Candidates pulled with `fonts.mjs search` (sans-serif at 800, sans-serif with a width axis, display at 700) and judged on `.awards/type/specimen.png` with the real headline and paragraph:
- **Chosen display: Unbounded** (NARS Design for Google Fonts, OFL-1.1, weights 400 and 800). Widest and heaviest of the six, soft-cornered terminals, open counters; at 800 the strokes are thick enough to cast a shadow that reads as a shadow, not as a blur.
- **Chosen body: Schibsted Grotesk** (Bakken & Bæck, Oslo, for Schibsted; OFL-1.1, weights 400 and 600). A Norwegian-made grotesque for a Tromsø maker: the local-provenance rule taken from [site:son-daven]. Proportional figures (its tabular set spaces punctuation like digits).
- Rejected: Parkinsans (warm and round, but geometric and toy-like at 800; the claim reads as a children's brand); Anek Latin (good weight, too narrow at default width to fill the wall); Encode Sans (wide but generic; disappears next to the light); Pliant (spacing collapses at body size); Bricolage Grotesque (on the reflex list, and its quirks fight the shadows).

Contract: a voice and a silence. Unbounded 800 for display, h2 and h3; Schibsted Grotesk for body, readouts and controls. No third face.

Scale, vw-lock on a 1440 artboard, `clamp()` floors for the phone:
- `--display: clamp(2.75rem, 8.8889vw, 9rem)` — 128 px at 1440, 44 px at 390.
- `--h2: clamp(2rem, 4.4444vw, 4.5rem)` — 64 px at 1440.
- `--h3: clamp(1.25rem, 1.8056vw, 1.75rem)` — 26 px at 1440.
- `--body: clamp(1.0625rem, 1.3194vw, 1.25rem)` — 19 px at 1440, 17 px on a phone.
- `--label: 0.875rem` — 14 px, readouts and control text; sentence case, not tracked caps (this is not a metadata world: the readout is content).

Display setting: tracking −0.035em at display, −0.03em at h2; leading 0.98 (Unbounded's tall ascender clears the line above at 0.98); no optical hang needed (the L and the K have flat stems). Proportional figures throughout: Schibsted's tabular set spaces the colon and the point like digits, which broke "08:03" and "1.4°" in the hero probe. Loading: self-hosted woff2 in `public/fonts/`, four files, 91 KB in all; `font-display: swap`; metric-matched fallbacks (`Unbounded Fallback`: Arial Bold, size-adjust 133.8 %, ascent 74.4 %, descent 18.3 %; `Schibsted Fallback`: Arial, size-adjust 105.1 %, ascent 92.9 %, descent 24.5 %); the display 800 file is preloaded. No text is split.

## Layout
- Artboard 1440 × 900; 12 columns; gutter `clamp(20px, 4.1667vw, 120px)` (60 px at 1440, 20 px at 390); unit 4 px.
- Scaling: vw-lock above 768 px through the `clamp()` tokens; fixed floors below. One system, no breakpoint per size.
- Prose measure 34 em (about 65 characters). Section padding on the type scale: `calc(var(--unit) * 40)` desktop, `calc(var(--unit) * 24)` phone.
- The light patch, the wall and the hour line are fixed to the viewport (the room does not move; the wall scrolls under the window).
- Coarse pointer: no hover-only state anywhere; the city list is a native button group; targets 44 × 44 px.
- Resize: the WebGL wall and the chapter-to-hour map are rebuilt on a debounced `ResizeObserver`; never a reload.

## Elevation & Depth
Raking light on plaster: a procedural relief that only shows when the borrowed sun is low and flattens at noon, lit by the same sun vector the readout prints. Depth comes from real light alone: the patch, the mullion's shadow and the type's cast shadows. No drop shadows, no glass, no glow, no grain over text (the relief is in the wall, under the text).

## Shapes
Radius 0 everywhere; the window patch is a parallelogram with a cross-shaped mullion shadow; rules are 1 px hairlines in `--line`; the product drawing is a single 1.5 px stroke in `--ink`.

## Components
- **Hour line (nav):** a fixed top bar; wordmark (Unbounded 800 at `--label`×1.15) at the left end, a hairline from first light to blue hour whose ticks are the chapter links (each labelled with its real local time), a sun marker riding the line with the scroll, the city button, and the reserve action at the right end. States: link hover underline draws in 200 ms, focus ring, current chapter `aria-current="true"` with the tick filled. Phone: city button, time and action only. Motion hook: the marker reads the scroll clock.
- **City switch:** a `<button aria-expanded>` opening a small panel with a radio group of five cities (arrow keys, Enter); choosing re-runs the day and rewrites the h1 city name and every time on the page. States: hover, focus, checked, disabled (none). Escape closes, focus returns.
- **Live readout:** one line of text, `aria-live="off"` (it changes every frame; a polite region would talk constantly), with a static copy for screen readers updated on chapter change only.
- **Reserve action (button-primary):** ink text on accent, radius 0, 44 px tall minimum; hover swaps to ink ground with plaster text in 200 ms; focus ring ink 2 px + 4 px offset; active presses 1 px down; disabled at 50 % with `aria-disabled`. Appears in the hour line and at the close.
- **Polar-night stage:** a sticky stage on a 220 vh rail; the light dies as the rail is entered, the figures read, the light returns as it is left. Reduced: a cut.
- **Panel drawing:** an inline SVG exploded view in four layers with three numbered callouts that are real `<li>` text beside it (the numbers count parts, so they are earned). Scroll separates the layers once.
- **Specification table:** a `<dl>` in two columns; dual units where the reader may think in either (mm and in, lux and foot-candles, kg and lb).
- **Reservation form:** name, e-mail, delivery country; client-side validation with an error line per field, a submitting state and a confirmation that says plainly that this demonstration takes no money.
- **404:** the same wall in polar night, light off; one line, three routes out.

## Motion
Register: organic. The subject is a natural light moving slowly; nothing snaps, nothing bounces.
- `--ease-out-expo: cubic-bezier(0.33, 1, 0.68, 1)` — arrivals and the light switching on.
- `--ease-in-out-expo: cubic-bezier(0.45, 0, 0.55, 1)` — travel between two known states (the panel layers, the theme flip).
- `--ease-theme: cubic-bezier(0.45, 0, 0.55, 1)` — the day/night repaint, symmetric.
- `--dur-feedback: 200ms`, `--dur-routine: 420ms`, `--dur-hero: 1200ms` (the light switching on, once). Stagger 0.08 s.
- Tiers: full (the light sweeps with the scroll), reduced (the light steps to each chapter's hour, the theme repaints in 200 ms, shadows stay), static (the CSS light at each chapter's hour, no canvas). Under `prefers-reduced-motion: reduce` the duration tokens shorten to 0 / 120 ms / 200 ms; there is no global kill.

## Browser surfaces
- `::selection` accent ground with ink text; `caret-color` accent.
- Scrollbar thin, thumb `--muted` on `--ground`; native scrolling under it.
- `:focus-visible` 2 px ink ring with a 4 px offset on day, 2 px accent ring on night.
- `color-scheme: light` on day, `dark` on night; `<meta name="theme-color">` follows the theme flip (`#e7e4dd` / `#192030`).
- Favicon: a parallelogram of light with a cross mullion, drawn in ink and accent (SVG). Open Graph image: the wall at first light with the claim, 1200 × 630, drawn from the same tokens.

## Do's and Don'ts
- Do let the computed light carry the colour; keep tokens to ground, ink and the one accent.
- Do print real numbers with units, in Schibsted with tabular figures.
- Don't add a drop shadow, glow or gradient that the sun did not cast.
- Don't set the accent as text on the day ground; it is a surface.
- Don't animate anything the light does not explain.
