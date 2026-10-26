---
name: awards — the record
description: Four verdict grounds, one on screen at a time, one warm ink and one paper for the action; a ruling serif over a plain grotesque; the plugin's own builds as the pictures.
colors:
  ground: "#5cb973"
  ink: "#18130e"
  accent: "#f6f3ec"
  ground-ship: "#5cb973"
  ground-fix: "#d1942b"
  ground-rebuild: "#eb7357"
  ground-recapture: "#76a1ef"
typography:
  display:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "128px"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  mega:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "180px"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
  h3:
    fontFamily: "Familjen Grotesk, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Familjen Grotesk, Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  body:
    fontFamily: "Familjen Grotesk, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  code:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0em"
  label:
    fontFamily: "Familjen Grotesk, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0em"
rounded:
  none: "0px"
spacing:
  unit: "4px"
  gutter: "48px"
components:
  copy-target:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  copy-target-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.accent}"
  band-install:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.accent}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1rem"
---

# awards — the record — design system

The frontmatter is the machine-readable layer; every value is identical to `src/styles/tokens.css` (fluid sizes are written here at the 1440 artboard; the `clamp()` lives in `tokens.css` and below).

## Overview
- **Creative north star:** the jury table. Entries laid out, then put in the order of what was said about them; the colour of the room is the verdict being read.
- **Colour strategy:** palette-as-navigation (dealt: `roll.mjs --choose committed-accent,theme-per-section,palette-as-navigation --label colour --seed m5x1vn6o30cl --avoid restrained-duotone`). Four grounds, one for each word the jury ends on (`ship`, `fix`, `rebuild`, `recapture`), one on screen at a time; the swap at a chapter boundary is the transition. One warm near-black ink reads on all four, and one paper is the action's surface. Mid-value saturated grounds, neither light nor dark, because the scene is a laptop in daylight and the pictures are other websites' first viewports, mostly light pages: on a pale paper they would vanish, on near-black they would be the Awwwards rut. On these grounds they sit as lit rectangles (checked on `.awards/builds/*/desktop-s00.png`, 2026-10-26).
- **What this world refuses:** the AI dev-tool rut (near-black, a terminal window, gradient text, an icon triad, a metric row); the Awwwards rut (gold, laurels, a trophy, glow, an oversized grotesque); the plugin's own wave-1 rut (a light restrained duotone, labels as texture, a readout in the margin, code-only imagery).
- **Calibration:** [site:okaydev] — its five accents share one channel rule, so loud colours stay one family → here the four grounds share one OKLCH lightness band (.69–.71) and chroma band (.125–.155) and only the hue moves (150, 76, 34, 262), so the set reads as one system and as state, never as a generated wheel.
- **Calibration:** [site:animejs] — a different hue per chapter over one ink, and the theme swap tweened on one curve for everything it touches → here one ground per chapter, swapped on `--ease-theme` over `--dur-routine` on `<html>`, `theme-color` following.
- **Calibration:** [site:leo-parpeix] — two families, the display large and loud against a quiet grotesque at roughly 14 / 14 / 34 px on its home (`_fingerprints.md`, its display is set larger than the measured h1) → here a display serif at 128 px over an 18 px grotesque body, about 7:1, a text-led two-state hero; the leo-parpeix pairing (Avantt + Monument Grotesk) is not taken.

## Colors
`design-md.mjs lint` (2026-10-26): 0 errors, 5 warnings, all "orphaned token" on the five grounds: grounds are page surfaces set by `data-theme`, not component fills, so no component references them by design.

| Role | Token | Value | Notes |
|---|---|---|---|
| Ground (live) | `--ground` | one of the four below | set by `data-theme` on `<html>` (script) or on each chapter (no script) |
| Ground, ship | `--ground-ship` | `#5cb973` | oklch(.71 .135 150): the correction, the terms and the close |
| Ground, fix | `--ground-fix` | `#d1942b` | oklch(.71 .135 76): the record, how a build goes |
| Ground, rebuild | `--ground-rebuild` | `#eb7357` | oklch(.69 .155 34): the interruption only |
| Ground, recapture | `--ground-recapture` | `#76a1ef` | oklch(.71 .125 262): the recipes (evidence captured in a browser), the 404 |
| Ink | `--ink` | `#18130e` | oklch(.19 .012 60), a warm near-black; every text, rule and focus ring |
| Paper (accent) | `--accent` | `#f6f3ec` | oklch(.965 .01 85); job: surface of the action (the command ticket, Copy, the band's Install text) and the selection's text |
| Muted text | `--muted` | `color-mix(in oklab, ink 80%, ground)` | captions, dates, file names |
| Line | `--line` | `color-mix(in oklab, ink 30%, ground)` | the floor line in the record, one rule under table heads |

Contrast (WCAG 2.x, computed 2026-10-26):

| Pair | ship | fix | rebuild | recapture |
|---|---|---|---|---|
| ink on ground (body) | 7.59 | 7.01 | 6.26 | 7.13 |
| muted on ground (≈ 80 % ink) | ≥ 4.9 | ≥ 4.6 | ≥ 4.5 | ≥ 4.6 (re-measured by the rendered audit) |
| ink focus ring on ground | 7.59 | 7.01 | 6.26 | 7.13 |
| paper on ground | 2.19 | 2.37 | 2.66 | 2.34 — never text on a ground; paper is a surface only |

- Ink on paper: 16.65 (the commands); paper on ink: 16.65 (the band's Install, hover fills).
- The accent fails as text on every ground, so it is a surface with ink on it, never a text colour on a ground; the focus ring is the ink (2 px, 4 px offset), which clears 3:1 on every ground and on paper.
- **Theme table:** `[data-theme="ship" | "fix" | "rebuild" | "recapture"]` remaps `--ground` only; ink and paper never change. With script, `<html data-theme>` follows the chapter whose top has crossed the viewport's middle and the chapters are transparent; without script, each chapter paints its own ground.
- Chroma: only the grounds and the pictures (the builds' first viewports, the recipe frames) carry colour; no gradients. No wide-gamut duplicates: the grounds are state colours and stay sRGB so the ratios above hold everywhere.

## Typography
- **Voice:** a ruling read out, not a slogan: a heavy-stroked, sharp, high-contrast display serif with a cold, upright bluntness, which must make "Done when a jury says ship." and "rebuild." sound like a verdict. The reader is a plain, slightly warm grotesque that disappears into sentences, rows and docs.
- **Candidates:** pulled with `fonts.mjs search --category display --weights 800 --seed awards-record`, `--category sans-serif`, `--category serif` (the random pulls: Baloo, Bitcount, Turret Road, Hauora Sans, Pathway Extreme and others, none of them this voice), then eight rendered on the real headline and paragraph: `.awards/type/specimen-display.png`.
- **Chosen: Gloock** (Duarte Pinto, the Gloock Project; SIL OFL 1.1) for the display line, the four words, the interruption word and the chapter heads; **Familjen Grotesk** (Familjen STHLM; SIL OFL 1.1) at 400 and 600 for everything that reads; the system monospace only inside commands and code.
- **Rejected:** Anybody (variable width, but at 800 it repeats the heavy-grotesque register the plugin's own showcase home uses); Dela Gothic One (the bluntest, but a wide heavy geometric that sits next to Ekvator's Unbounded in the record's frames); Darker Grotesque (compact, but too soft to deliver a verdict at size); Big Shoulders Display (condensed signage, a stadium not a court); Bowlby One and Archivo Black (poster heaviness that turns the line into shouting and the body unreadable); Familjen Grotesk as the display (a body face, no voice at 128 px).
- **Kept off:** every face the five builds in the record use (Special Gothic, Schibsted Grotesk, Unbounded, EB Garamond, Kalnia, Radio Canada, Science Gothic, Enriqueta, Saira Condensed), so no frame and no heading share a voice.
- **Contract:** a voice and a reader. Gloock has one weight (400, heavy by design); hierarchy comes from size and the ground, never from a second display weight.
- **Scale (fluid clamp from a 1440 artboard):** `--display: clamp(2.75rem, 8.8889vw, 10rem)` (128 px); `--mega: clamp(4.5rem, 12.5vw, 15rem)` (180 px, under the 13 vw ceiling); `--h2: clamp(2.125rem, 4.4444vw, 5rem)` (64); `--h3: clamp(1.375rem, 1.9444vw, 2rem)` (28); `--lede: clamp(1.1875rem, 1.4583vw, 1.5rem)` (21); `--body: clamp(1.0625rem, 1.25vw, 1.25rem)` (18); `--code: clamp(0.9375rem, 1.1806vw, 1.125rem)` (17); `--label: 0.875rem` (14). Under 768 px fixed: display 44, mega 72, h2 34, h3 22, lede 19, body 17, code 15.
- **Setting:** display tracking −0.02em (mega −0.03em), leading .95 (mega .9), `text-wrap: balance`, the two-line break authored; body leading 1.5, prose measure 62ch; `font-variant-numeric: tabular-nums` on scores and dates in Familjen. No labels as texture and no eyebrows: the world is not a metadata world; headings carry the hierarchy.
- **Loading:** three self-hosted woff2 files, 50 KB in all (`public/fonts/`, licences beside them), `font-display: swap`, metric-matched fallbacks (`Gloock fallback` on Times New Roman / Liberation Serif at `size-adjust: 111.2%`, `Familjen fallback` on Arial / Liberation Sans at 94.2%, from rendered widths). Gloock is preloaded (the LCP line); Familjen 400 too, because it sets the sentence beside it. The hero's mutation waits for `document.fonts.ready`; text is never split before it.

## Layout
- **Artboard 1440, twelve columns,** gutter and outer margin `--gutter` (48 px at 1440, `clamp(20px, 3.3333vw, 64px)`), column gap 24 px; fluid clamp from the artboard, fixed sizes below 768 px, no reload at any breakpoint (scenes and the sort re-measure on resize).
- **Measure:** prose ≤ 62ch; the record's rows: frame on columns 1–5, text on 6–12 at desktop; one column under 768 px.
- **Spacing:** multiples of `--unit` (4 px): 8, 16, 24, 40, 64, 96, 160 between blocks; a chapter's top padding 160 px at 1440 (96 px on a phone).
- **Coarse pointer:** every control ≥ 44 × 44 px; hover states only under `(hover: hover)`.

## Elevation & Depth
Sharp and shadowless. Depth exists only as overlap in the gathering (a frame over a frame), never as a shadow, blur or glow; the pictures sit flush on the ground with a 1 px ink keyline so a light page never bleeds into a light chapter. No grain, glass, gradient or texture.

## Shapes
Radius 0 everywhere. The only drawn mark is the strike in the hero: a 0.08 em ink rule through "Stunning." Frames are cropped only at the browser's viewport (the capture's own 16:10 desktop or 390:844 phone), never re-cropped or masked. No icons; arrows are the text glyph →.

## Components
- **The display line** (`h1.claim__line`): Gloock at `--display`, two authored lines. Its first state is an `aria-hidden` overlay ("Stunning. Done.") over the real text; the strike is a 0.075 em ink bar drawn by `scaleX` (`src/motion/claim.js`). Reduced and static: the claim settled. No layout moves in any state.
- **Command line** (`li.command`): a paper strip (`--accent`), the command in the mono at `--code`, wrapping only at spaces and after an inner "/" (the build's `<wbr>`), `user-select: all`. Its Copy button: ink ground, paper label, 88 × 44 px minimum, 2 px ground-coloured seam. Hover (fine pointers): the ink lifts toward paper. Focus-visible: 2 px ink ring, 2 px offset. Active: inset paper ring. Copied: paper ground with an ink inset ring, "Copied" for 2 s, the polite status line. Refused clipboard: the command is selected, "Selected", one line on the ticket says which key to press. Without script or clipboard: no button; the line selects on one click.
- **Client switch** (phones, with script): two tabs, `aria-selected`, arrow keys; the selected tab is the ink fill. Above 767 px it is hidden and both clients show, without tab roles.
- **Band**: wordmark in Gloock 28 px with the version; links at `--label` 600, 44 px tall; the current route underlined 2 px; Install the one filled target (ink, paper text) on every route at every width. Phone: Install and a Menu button (`aria-expanded`, Escape closes and returns focus) that opens the links as a column.
- **Record row** (`li.row`): frame (16:10, 1 px ink keyline, no shadow), name (link to the build's folder), what (muted, two lines on the desktop stage), last verdict word in Gloock with the weighted score, four axis scores (`dl`), every round as word + score linked to its report. The sorted axis is underlined. While gathered (`--t` < 1) the row's text waits at opacity `--t`; the frame carries the travel (`transform` only).
- **Sort buttons**: 44 px, 2 px ink border; pressed = ink fill with paper text (`aria-pressed`). Shown only with script.
- **Floor line**: 3 px ink rule across the record above the first row under the floor, label at 12 px 600 on the ground.
- **Memory sentence**: Gloock at `--h3`, line-height 1.4, curly quotes; the source line (build, report file linked, date) at `--label`.
- **Recipe wall tile**: the recipe's frame at 16:10 with the keyline; leads span 2 × 2 with the group name on an ink tab; hover lifts 3 px.
- **Phase**: name at `--h3` (Familjen 600), what it does at `--label`, "Writes" the file, a quoted line above a 1 px rule.
- **Tables** (`.data`): one ink rule under the head, rows separated by space; numbers tabular.
- **Colophon**: on the ship ground under a 2 px ink rule; version in Gloock; links 36 px (44 px on phones); credits as a table.

## Motion
- **Register: mechanical** (software and a verdict: short, firm, decided). `--ease-out-expo: cubic-bezier(0.25, 1, 0.5, 1)`, `--ease-in-out-expo: cubic-bezier(0.65, 0, 0.35, 1)`, `--ease-theme: cubic-bezier(0.45, 0, 0.55, 1)`.
- **Durations:** `--dur-feedback` 160 ms, `--dur-routine` 400 ms (ground swaps, the sort's FLIP uses 1.5×), `--dur-hero` 900 ms (the correction runs on fractions of it, about 1.2 s in all with its sequence: strike, fade, slide, arrive); stagger `--stagger` 40 ms. The contract's FIRST VIEWPORT moment runs in this band.
- **Reduced motion:** the tokens shorten under `prefers-reduced-motion: reduce` (feedback 0, routine 120 ms, hero 200 ms, stagger 0); the tiers are full / reduced / static from one switch (`data-motion-tier` on `<html>`), never a global animation kill.

## Browser surfaces
- `::selection`: ink ground, paper text. `caret-color`: ink.
- Scrollbar: thin, thumb in the ink at 60 %, track transparent; native scrolling kept.
- `:focus-visible`: 2 px ink outline, 4 px offset, everywhere (paper surfaces included).
- `color-scheme: light` on `:root`; `<meta name="theme-color">` starts at the ship ground and follows every ground swap.
- Favicon: the letter "a" in Gloock, ink on the ship ground (SVG and 32 px PNG, apple-touch 180 px). Open Graph image 1200 × 630: the display line "Done when a jury says ship." in ink on the ship ground with the five builds' frames gathered along its foot, drawn by `scripts/og.mjs` from the same frames.

## Do's and Don'ts
- Do let a chapter's ground say which verdict it is about; one ground on screen at a time.
- Do put every number in a sentence or a row with the file it comes from.
- Don't set text in the paper colour on a ground, or any text but ink on a ground.
- Don't add shadows, rounded corners, device frames or browser chrome to the pictures.
- Don't use Gloock for running text, or Familjen for the display line.
