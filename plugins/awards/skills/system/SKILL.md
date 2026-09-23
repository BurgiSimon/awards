---
name: system
description: "Turn a direction into a complete visual system for an award-level site and write DESIGN.md plus src/styles/tokens.css: a typeface contract (expressive display + neutral grotesque, or one characterful grotesque at display scale), a fluid type scale locked to an artboard, two to four colour tokens under a named strategy, warm near-blacks, a spacing unit, grid and gutters, radius and shadow policy, per-section themes, easing and duration tokens and themed browser surfaces. Use whenever the user asks for design tokens, a palette, fonts or typography, 'pick fonts and colours for …', a design system, DESIGN.md, 'make the type feel premium', theme switching, or when an awards build has no DESIGN.md yet. Avoids the reflex faces and generated palettes. Not for a Tailwind config conversion, a Figma hand-off or component styling with no award framing."
argument-hint: "[--from AWARDS.md | describe the world] [--light|--dark|--flip]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:system — the visual system

Codex: read [the runtime guidance](../../references/codex.md) before following this skill; it maps plugin paths, tool names and handoffs to Codex.

This skill turns the WORLD block of a direction contract into the tokens every later phase builds with: one type contract, two to four colour tokens under a named strategy, a spacing base, a material policy, motion tokens and themed browser surfaces. It writes `DESIGN.md` and `src/styles/tokens.css`, keeps their values identical, and proves the result with the audit.

## Why few tokens

Why: the corpus runs on two to four live colour tokens and at most two type families, and its variety comes from change over time (a theme per section, colour as page state), not from more values. A system small enough to hold in the head reads as a world; twelve values read as a hierarchy someone had to manage.

- Two to four colour tokens; a fifth or sixth value exists only as a theme or a variant set that is never live at the same time (`[pattern:color-and-material#token-counts]`).
- One type contract held everywhere; all the personality in the display voice, none in the body (`[pattern:typography#contracts]`).
- Everything the browser paints (selection, scrollbar, focus ring, tab colour) belongs to the same tokens; a default-blue selection breaks a bone-and-brass world.

## Setup

Why: the durable files are the memory of the build; a skill that starts without them re-asks what is already decided and drifts from the contract.

1. Read `AWARDS.md` in the project root if it exists and resume from its `## Status` checklist; treat every locked block as decided.
2. Read `DESIGN.md` in the project root if it exists; its tokens are the visual system and are not re-invented here.
3. If impeccable's `PRODUCT.md` exists, read it for product truth (audience, purpose, voice, constraints) and never overwrite it.
4. Detect the scope: a whole site, one component (a named element, file or selector), or a critique of existing work.
5. Detect the stack from `package.json` and framework files (`vite.config.*`, `next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, a Webflow export); note the motion and GL libraries already installed.
6. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once — it drives every phase in order — then proceed with this skill if the user declines.

## Read before you write

Why: the type and colour rules live in two pattern files with the corpus evidence attached; the reflex list is what keeps the choice from being the generator's.

- The WORLD block of `AWARDS.md ## Direction contract` (`--from AWARDS.md` is the default whenever the file exists): strategy, temperature, ground, type contract type, display character class, material policy.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/typography.md` before the type contract and the scale.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/color-and-material.md` before the colour tokens, the material policy and the browser surfaces.
- `${CLAUDE_PLUGIN_ROOT}/references/reflex-lists.md` before naming any face or palette; its alternatives table is the shortlist.
- `${CLAUDE_PLUGIN_ROOT}/references/craft-floor.md`, the Type and Colour and material sections, for the audit rule ids the result is measured against.
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/DESIGN.md` for the frontmatter schema and the section names; `${CLAUDE_PLUGIN_ROOT}/recipes/_shared/tokens.css` for the token names every recipe expects.
- One or two cards by contract type, §3 Visual language and §8 Take / Don't take only: `[site:the-line]` for one variable grotesk with a vw-lock, `[site:leo-parpeix]` for a two-family contract with a theme per section, `[site:slosh-seltzer]` for a palette as navigation. Their hexes and pairings are evidence, never values.

## Inputs

Why: the system is derived from the world's material and the use scene; both are usually in the contract, and two questions cover them when it is missing.

- With a contract: take the WORLD block as decided. Where it names a strategy the system keeps it; where it names a character class ("a condensed industrial voice") the face is chosen inside that class.
- Without one: ask two questions in one AskUserQuestion round. First, what the subject is made of and what the audience handles (material, temperature, the paperwork of the trade). Second, the use scene (reading, photography, a daylight product, a night console) and any binding brand commitment (a face or a hex that must stay). Assert your reading of the rest.
- `--light` and `--dark` force the ground and still require the reason in `## Overview`; `--flip` means a theme-per-section or dual model where the ground changes by section or scroll position, with every theme checked for contrast on its own.

## Typography

Why: a site reads as one voice when the number of faces is a decision, and a scale locked to an artboard survives every width without a breakpoint per size (`[pattern:typography#fluid-scale]`).

1. Contract: a voice and a silence (expressive display + neutral grotesque), or one voice (a characterful family at every size). A third layer only when more than a hundred discrete items need it. Record face, foundry and licence for each.
2. Macro and micro: choose the display and label sizes for the composition; 20:1 is a poster-oriented example, not a required ratio. The Line uses 210 px against 10 px at its artboard with a full eight-step ladder. Add intermediate headings for reading or specifications (`[pattern:typography#macro-and-micro]`).
3. Scale: every desktop measure is `px / artboard × 100` on a 1728 (or 1440) artboard, wrapped in `clamp()` so it neither collapses on a phone nor outgrows the artboard; the display token is `clamp(3rem, 12.1528vw, 13.125rem)` for 210 px at 1728, ceiling about 12–13 vw (T03); fixed pixels below 768 px; labels at `0.6875rem`.
4. Display setting: tracking −0.03 to −0.04em by choice and never tighter than −0.06em (T04); choose leading from the rendered glyphs; the first glyph of a display line optically hung when the face needs it (`[pattern:typography#optical-hang]`); `font-feature-settings` in the token layer, not per component.
5. Labels as texture: the body face, uppercase, tracked about .08em, at least 11 px when they carry meaning; numerals only when they count something (`[pattern:typography#labels-as-texture]`).
6. Loading: self-hosted woff2 in `public/fonts/`, at most four files and 400 KB (P05); `@font-face` with `font-display: swap` and a metric-matched fallback declared with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` (T05, T06); preload the display face only; note in `DESIGN.md` that text is split only after `document.fonts.ready` (`[pattern:typography#loading]`).
7. Face selection by character class (`[pattern:typography#choosing-by-character-class]`): the contract from the world, then the character the display voice needs (round or sharp, wide or narrow, warm or cold, condensed or extended), then the licence. Open-licence faces by default from the alternatives table in `reflex-lists.md`; the corpus's licensed faces named as "if you can license"; never the pairing a neighbour card already owns.
8. Google-served families: check the licence file in the `google/fonts` repository (`ofl/<family>/OFL.txt` or the `apache/` and `ufl/` folders) because fonts.google.com may be unreachable from the sandbox; download the files once and self-host them; never the CDN `<link>` (T02).
9. A face from the reflex list chosen on purpose (a monospace identity for a genuinely technical world, a body role) is recorded under `AWARDS.md ## Exceptions` with the reason (T01); a reflex face as the voice by habit is refused.

## Colour

Why: an accent chosen from a trend deck says "website"; a ground and an accent taken from the subject's real scene say the subject, and two to four of them are enough when colour is also allowed to change over time.

1. Strategy: pick one of the four in `[pattern:color-and-material#colour-strategies]` (restrained duotone, committed accent, theme-per-section, palette-as-navigation) and write the sentence that explains every token into `## Overview`, with the reason the use scene forces light or dark.
2. Tokens: `--ground`, `--ink`, at most one live `--accent` derived from the subject's environment with its job named (emphasis, bookend, state or surface) (`[pattern:color-and-material#accent-from-the-environment]`); `--muted` and `--line` are mixed from ground and ink with `color-mix()`, never new hues; at most six hues in the file (C03).
3. Near-black: shift the darkest value toward the world's temperature (`[pattern:color-and-material#warm-near-blacks]`); the corpus's values are evidence of the direction, never values to reuse; pure #000 only when it is diegetic, recorded as a C02 exception.
4. Ground: the use scene chooses. Light grounds are the corpus majority and are rarely white (bone, paper, silver, off-white); a dark ground is earned by a diegetic reason, a stage behind scenes, or one chapter's tempo change (`[pattern:color-and-material#light-grounds]`).
5. Chroma policy: choose a treatment from the subject and supplied images. Preserve useful color differences; selective desaturation or overprint is optional. The Line's acetate is local, not a site-wide greyscale policy. Without imagery, the accent and material carry the world (`[pattern:color-and-material#chroma-outsourced-to-imagery]`).
6. Colour as state: `data-theme` on `<html>` is the single source for the tokens and for any renderer's clear colour; `[data-theme="…"]` blocks remap the same token names; swaps tween on `documentElement` with `--ease-theme`, instant or under 300 ms under reduced motion; `theme-color` follows the swap (`[pattern:color-and-material#colour-as-state]`).
7. Wide gamut: duplicate the accent only, as `color(display-p3 …)` after the sRGB declaration; ink and ground stay sRGB so the contrast maths hold (`[pattern:color-and-material#wide-gamut]`).
8. Contrast: body and labels at least 4.5:1, large text 3:1, the focus ring 3:1 against both grounds, on every theme separately (C01); compute the ratios and write them into `DESIGN.md ## Colors`. An accent that fails as body text is a surface and an ink, never a text colour (`[pattern:color-and-material#contrast]`).

## Space and material

Why: a spacing base makes rhythm a multiplication instead of a choice, and one material policy is what keeps a page from looking assembled from parts.

- `--unit: 4px` (or 8) as the base; every spacing step a multiple; `--gutter: clamp(20px, 4.1667vw, 120px)` covers the corpus's 40–120 px desktop gutters and 20 px phone gutters; `--artboard` records the comp width.
- Grid and measure: columns, the maximum measure for prose (about 60–70 characters), section padding on the same scale as type; write them under `## Layout` together with the scaling system the contract chose (vw-lock or fluid clamp) and the coarse-pointer swaps (`[pattern:responsive-strategy#decide-before-build]`).
- Material policy, one per world, named under `## Elevation & Depth` (`[pattern:color-and-material#material-policies]`): sharp and shadowless with depth by luminance is the default when nothing argues otherwise; soft, optical, glow, glass or grain only as a policy the world chose, and grain last, never over text.
- Shapes under `## Shapes`: one radius value (often 0), the corner language, masks and clipping, the icon stroke.

## Motion tokens

Why: the motion skill reads the curve and the durations from the token layer; one house curve and three duration bands are what make a page feel like one hand set it (`[pattern:motion-vocabulary#easing]`).

- Easing: `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` for arrivals, `--ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1)` for travel, `--ease-theme: cubic-bezier(0.645, 0.045, 0.355, 1)` for repaints.
- Durations: `--dur-feedback: 160ms` (band up to 300 ms), `--dur-routine: 400ms` (300–500 ms), `--dur-hero: 1400ms` (1.2–1.5 s, once per chapter); stagger .06–.1 s, recorded under `## Motion` (`[pattern:motion-vocabulary#durations]`).
- Reduced motion: under `prefers-reduced-motion: reduce` the duration tokens shorten (feedback 0, routine 120 ms, hero 200 ms) the way `recipes/_shared/base.css` does, and the three tiers (full / reduced / static) are named; never a global animation kill (M01, M02).

## Browser surfaces

Why: the surfaces the browser paints are part of the first viewport a juror sees, and they are the cheapest place to prove the world is complete (S01–S06).

- `::selection` in the accent with the ground as text colour; `caret-color` in the accent; a thin scrollbar coloured from the ink with native scrolling kept underneath; `:focus-visible` as a 2 px ring in the accent with a 4 px offset, the same everywhere and visible on both grounds of a swap.
- `color-scheme` on `:root` and per theme; `<meta name="theme-color">` from the ink or ground and updated on every theme swap; a favicon drawn in the ink; an Open Graph image drawn in the world, listed under `## Browser surfaces` even when it is produced later.

## Write DESIGN.md and tokens.css

Why: the frontmatter is the machine-readable layer other tools read, the CSS is what the page runs on, and the two drift apart within a day unless they are written together and checked together.

1. Write `DESIGN.md` at the project root from `${CLAUDE_PLUGIN_ROOT}/assets/templates/DESIGN.md`: the frontmatter (`name`, `description`, `colors`, `typography.display`, `typography.body`, `typography.label`, `rounded`, `spacing`, `components`) and the sections `## Overview`, `## Colors` (with the theme table and the contrast ratios), `## Typography`, `## Layout`, `## Elevation & Depth`, `## Shapes`, `## Components`, `## Motion`, `## Browser surfaces`, `## Do's and Don'ts`. When impeccable wrote a `DESIGN.md` first, extend it: keep its frontmatter keys and values, add the missing sections, and say what changed.
2. Write `src/styles/tokens.css` with exactly these names, because the recipes and the scaffold read them: `--ground`, `--ink`, `--accent`, `--muted`, `--line`, `--font-display`, `--font-body`, `--font-mono`, `--artboard`, `--display`, `--label`, `--gutter`, `--unit`, `--ease-out-expo`, `--ease-in-out-expo`, `--ease-theme`, `--dur-feedback`, `--dur-routine`, `--dur-hero`; then one `[data-theme="…"]` block per theme that remaps only `--ground`, `--ink` and `--accent` (the derived tokens follow).
3. Write `src/styles/fonts.css` with the `@font-face` rules and the metric-matched fallbacks; put the files in `public/fonts/`.
4. Keep every value identical in the frontmatter, the prose and the CSS; when one changes, change the other in the same edit.
5. Fill `## Components` with the components the page map names once `awards:structure` has run; until then, the button and link entries from the template with every state.
6. Tick "Visual system written (system → DESIGN.md, tokens.css)" in `AWARDS.md ## Status`. When no project exists yet, write the files at those paths anyway; `awards:stack` scaffolds around them and never overwrites them.

When the brief needs editorial/product hierarchy, open `[recipe:typography-specimen]` desktop/mobile images and the complete composition’s asset/type notes through `${CLAUDE_PLUGIN_ROOT}/references/patterns/visual-composition.md`; select the project’s own type, colour and image direction.

## Verify

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <dir> --scope fonts,contrast,surfaces` on the project directory; exit 0 or every finding recorded under `AWARDS.md ## Exceptions` with a reason. Then tick:

- [ ] One type contract in `DESIGN.md` with face, foundry and licence; no second display face; no reflex face as the voice without an exception line (T01).
- [ ] Fonts self-hosted as woff2, at most four files and 400 KB, `font-display` set, a metric-matched fallback declared; no CDN link (T02, T05, T06, P05).
- [ ] The display token is a `clamp()` with one agreed floor and a ceiling at or under 13 vw; tracking no tighter than −0.06em; leading checked against rendered glyphs (T03, T04).
- [ ] Two to four live colour tokens under one named strategy; `--muted` and `--line` mixed, not added; at most six hues (C03); the darkest value temperature-shifted, or a C02 exception recorded.
- [ ] Contrast ratios computed and written for every theme: body 4.5:1, large 3:1, focus ring 3:1 on both grounds (C01).
- [ ] Every browser surface themed from the tokens (S01–S06); `theme-color` follows the theme swap.
- [ ] Motion tokens present with the house curves and three duration bands; reduced-motion shortening in place, no global kill.
- [ ] `DESIGN.md` frontmatter, prose and `tokens.css` carry identical values; the token names match `recipes/_shared/tokens.css`.
- [ ] No hex, pairing or set from any corpus card reused as a package.

## Hand-off

The next phase belongs to `awards:structure`, which needs `DESIGN.md`, `tokens.css` and the contract. When the user asked for the whole site or `awards:craft` is driving the build: Invoke the `awards:structure` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the user asked only for tokens, a palette or fonts, stop after the verify step and offer that next step in one line. If the project is scaffolded later by `awards:stack`, this `tokens.css` replaces the scaffold's, never the other way round.

## Refuse

- A generated six-hue palette, the indigo-violet pair, teal + orange, pastel rainbow, gold on black: a wheel, not a world.
- Gradient text, glass panels by default, glow as a default register, hard offset shadows outside a deliberate neobrutalist world: costume, not material.
- A Google Fonts or any CDN `<link>`, more than four font files, a display face that swaps late and shreds split lines.
- A system face or a reflex-list face as the display voice by habit; two display faces; a third layer without a hundred items to organise.
- Pure #000 under pure #FFF with no diegetic reason and no exception; a dark ground chosen because award sites "are dark".
- Theme by habit: a dark mode nobody asked the use scene for, or a theme that fails contrast because "it is only one section".
- A second accent as a token; an accent used as body text; tracking tighter than −0.06em; display type above 13 vw or without a `clamp()`.
- Any corpus card's set or pairing as a package (bone + near-black, the five jewellery tokens, the four portfolio themes, the six flavour hues, silver + flare red, the named face pairings in `typography.md`).
- Values in `DESIGN.md` that differ from `tokens.css`, or token names that differ from the shared recipe names.
