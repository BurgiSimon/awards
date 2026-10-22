# Negative exemplars

What this file is for: three pages that show what the corpus principles are measured against, captured at desktop and phone and stored beside this file in `negative/`. Every one is synthetic and built by this plugin: two are eval fixtures, one is assembled from the plugin's own former defaults. Open the frames when a direction, a first viewport or a jury score needs a picture of the failure, not a description of it. Each is paired with the principle it fails and the audit rules that catch what can be caught.

## Contents
1. [The house style](#the-house-style)
2. [The template product page](#the-template-product-page)
3. [Clean and forgettable](#clean-and-forgettable)
4. [Using them](#using-them)

## The house style

Frames: `negative/house-style-desktop.png`, `negative/house-style-mobile.png`. Source: `assets/negative/house-style/index.html`.

What it is: the page this plugin produced by default before the house style was stripped out. A `/ 01 — Introduction` label above a huge grotesque headline that could belong to any studio, numbered links in the nav, a marquee of service names, a three-card project grid with labels, and a footer wordmark at 19 vw.

| What fails | Principle | Caught by |
|---|---|---|
| The thesis is a category sentence ("We craft digital experiences") | the first viewport states what only this subject can prove `[pattern:hero-archetypes#the-first-viewport-test]` | the jury's memory and specificity tests; not a rule |
| Eyebrow labels over every heading, numbered nav by default | labels are the texture of a metadata world and nothing else | X07, X21 (rendered) |
| Marquee of services, card grid of projects, giant footer wordmark | a staple used at recipe-default shape reads as the generator, not the studio | the slop scan's `judge` rows in `references/anti-patterns.md` |
| Display type scaled past 12 vw, labels in tracked capitals, grey on grey | the scale and the ramp are derived from the composition | T03, T07, C01 |

Why it matters: Creativity is the highest axis on the concept-led winners (`[site:lando-norris]` 8.71, `[site:oryzo]` 8.35) [verified, entries read 2026-09-18], and the rubric caps Creativity at 6 when a juror could name where the first viewport came from (`references/jury/rubric.md`). A juror who has seen a hundred generated studio pages can name this one's source.

## The template product page

Frames: `negative/generic-saas-desktop.png`, `negative/generic-saas-mobile.png`. Source: `evals/jury-generic-saas/fixture/`.

What it is: the reflex SaaS landing page. A violet glow behind a gradient-text headline in a reflex grotesque, a `NEW · AI-POWERED` pill, "Get started" and "Learn more", a row of three metrics, an identical icon-card grid.

| What fails | Principle | Caught by |
|---|---|---|
| Gradient text, coloured glow, framework violet | colour comes from the subject's own world | C04, X11, X12 |
| Reflex face from a font CDN as display and body | the type contract is chosen for the voice, never by habit | T01, T02 |
| Pill eyebrow, metric row, identical icon-card grid with emoji | the category rut, named and refused in the thesis | L04, L05, X03, X06, X08 |
| Generic calls to action and claims | the action names what the visitor gets | X01, X17 and the copy lists |
| No reduced-motion branch, no landmark, faint focus, text on the phone edge | the floor every winner is judged on | M01, A01, A06, A12, A13, L02, L08 |

The jury eval that uses it must not return `ship` (`evals/jury-generic-saas/graders/not-shipped.md`).

## Clean and forgettable

Frames: `negative/bland-clean-desktop.png`, `negative/bland-clean-mobile.png`. Source: `evals/jury-bland-clean/fixture/`.

What it is: an honest, accessible studio page that passes the whole audit, rendered checks included, with no slop habit for the scan to name. A centred serif headline, a paragraph, a list of three projects, a contact line.

| What fails | Principle | Caught by |
|---|---|---|
| No idea: nothing a juror would remember an hour later | one concept does the work a feature list usually does | the jury only; no rule can see it |
| No imagery strategy: type on a flat ground by default | WORLD names an imagery strategy `[pattern:imagery-and-assets#strategies]` | the contract, not the audit |
| One column, one rhythm, top to bottom | adjacent chapters never share a layout | the page map's Layout column |

This is the hardest exemplar and the most useful: a clean audit is the floor, not the bar. The jury eval that uses it must hold Creativity at 6 or below and not ship it (`evals/jury-bland-clean/graders/creativity-held.md`).

## Using them

- In concept, before dealing: none of the three cards may reduce to one of these frames with new colours.
- In the jury, when a score needs an anchor below 6: name the exemplar the build resembles and the row that matches.
- In ship: a build whose first viewport could be swapped for one of these frames without a juror noticing is a `rebuild`, whatever its audit says.
- Refresh the frames when the fixtures change: `node scripts/capture.mjs <source> --out <dir> --scroll 0 --no-tablet`, then copy `desktop-s00.png` and `mobile-s00.png` here.
