---
name: <project>
description: <one-line description of the visual world>
colors:
  ground: "<derive: from the use scene and the subject's real ground>"
  ink: "<derive: near-black shifted toward the world's temperature>"
  accent: "<derive: from the subject's environment, job named>"
typography:
  display:
    fontFamily: "<Display face>, <fallback>"
    fontSize: "<derive: clamp(floor, px / artboard × 100 vw, ceiling) from the composition>"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "<Display face>, <fallback>"
    fontSize: "<derive: clamp() step between display and body>"
  h3:
    fontFamily: "<Display or body face>, <fallback>"
    fontSize: "<derive: clamp() step between h2 and body>"
  body:
    fontFamily: "<Body face>, <fallback>"
    fontSize: "<derive: reading size, usually 1rem–1.125rem>"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "<Body face>, <fallback>"
    fontSize: "<derive: at least 11px>"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  none: "0"
spacing:
  unit: "4px"
  gutter: "<derive: clamp(phone px, vw, desktop px) from the grid>"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ground}"
---

# <Project> — design system

The frontmatter is the machine-readable layer (DESIGN.md spec: tokens are normative, prose explains how to apply them). Keep every value identical to `src/styles/tokens.css`.

## Overview
- **Creative north star:** one named metaphor for the whole world.
- **Colour strategy:** restrained / committed / drenched / theme-per-section — and why the use scene forces light or dark.
- **What this world refuses:** the category default and the Awwwards default it will not ship.
- **Calibration:** [site:slug] — one relationship from its §3 → this world's value and the WORLD reason (one line per DIVERGENCE card).

## Colors
Roles (ground, ink, accent, surfaces), contrast pairs with ratios (body ≥ 4.5:1, large ≥ 3:1), the theme table (`data-theme` values and the tokens each remaps), wide-gamut duplicates (`color(display-p3 …)`), where chroma comes from (tokens vs imagery).

## Typography
The contract (expressive display + neutral grotesque, or one characterful family at display scale); the scale (artboard width, vw-lock values, `clamp()` bounds); tracking floor (≥ −0.04em), display leading (0.8–0.95), optical hang; the `--h2`, `--h3`, `--body` steps; labels only when the world is a metadata world (size, tracking, case), otherwise none; loading (`@font-face` self-hosted woff2, `font-display`, `size-adjust` fallback); text splitting only after `document.fonts.ready`.

## Layout
Artboard and grid, gutters, breakpoints or vw-lock policy, coarse-pointer swaps, resize strategy (never a full reload at a breakpoint), max measure for prose.

## Elevation & Depth
Sharp and shadowless vs soft — a decision, not a habit; depth by luminance, occlusion or optics; grain/texture policy.

## Shapes
Radius policy, corner language, masks and clipping, icon stroke.

## Components
One entry per component: tokens used, every state (hover, focus-visible, active, disabled, loading, empty), motion hook (recipe id), accessibility notes.

## Motion
Register chosen from WORLD (editorial, mechanical, organic or cinematic) and why; easing tokens with their values (`--ease-out-expo: <derive>`, `--ease-in-out-expo: <derive>`, `--ease-theme: <derive>`), durations (feedback ≤ 300 ms, routine 300–500 ms, hero in the register's band), stagger (0.06–0.1), reduced-motion tiers (full / reduced / static).

## Browser surfaces
`::selection`, caret colour, scrollbar, focus ring, `color-scheme`, `theme-color`, favicon, OG image — themed from the tokens.

## Do's and Don'ts
- Do …
- Don't …
