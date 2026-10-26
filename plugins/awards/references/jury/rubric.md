# Jury rubric — scoring the way an Awwwards jury scores

This file calibrates `awards:jury` and the award-calibration section of `awards:craft`. It turns the four public axes and the developer criteria into anchored 0–10 scales, with corpus exemplars so a score means the same thing on every run. Scores are a diagnostic instrument, not praise: the report that follows a score is an ordered fix list.

## Axes and weights

| Axis | Weight | What it actually measures |
|---|---|---|
| Design | 40 | Whether the page owns a visual world: type, colour, space, imagery and chrome as one system, and whether the first viewport is unforgettable |
| Usability | 30 | Whether every visitor can reach the content and the conversion: wayfinding, load, keyboard, touch, reduced motion, mobile |
| Creativity | 20 | Whether one concept does the work a feature list usually does, and whether the medium enacts it |
| Content | 10 | Whether the copy and assets are specific, true and authored at full fidelity |

Weighted score = Design × 0.4 + Usability × 0.3 + Creativity × 0.2 + Content × 0.1. The 40/30/20/10 split is printed on the entry page beside each axis and reproduces every published overall in the corpus to within 0.01 [verified, twenty Awwwards entries read 2026-09-18]. `[site:oryzo]` is 7.90 / 7.51 / 8.35 / 7.76 → 7.86; the card's earlier inference of Content ≈ 7.77 was one hundredth out.

**Thresholds.** Site of the Day territory begins at a weighted **7.2** with **no axis below 6.8**. That floor holds: the 31 corpus entries awarded since 2021 run **7.19 to 8.18**, median 7.62, and none scores an axis below 7.00 [verified per card; counted by `scripts/calibration.mjs --since 2021`, 2026-10-22]. The one older card, `[site:robbietilton]`'s 2012 award (6.99, Usability 6.63), judged a predecessor site under an earlier jury. Honourable Mention begins around 6.5 [recalled medium — the one Honourable Mention entry read, `leo-parpeix-portfolio` 2021, publishes no axis scores]. A Developer Award needs the developer average above **7**; the mean of the six published criteria runs 6.83 to 8.03, median 7.50, across the 30 cards that publish them.

Per axis, across the same 31 entries (`node scripts/calibration.mjs --since 2021`; re-run it each quarter and after every corpus wave):

| Axis | min | median | max |
|---|---|---|---|
| Design | 7.13 | 7.63 | 8.12 |
| Usability | 7.00 | 7.34 | 7.90 |
| Creativity | 7.21 | 7.82 | 8.71 |
| Content | 7.16 | 7.65 | 8.18 |
| Overall | 7.19 | 7.62 | 8.18 |
| Developer mean | 6.83 | 7.50 | 8.03 |

**This rubric scores below the award, on purpose.** Six corpus sites were juried blind against their
own live entries during the 0.2 calibration, and this instrument came out about **0.7 lower** on the
weighted score, almost all of it in Usability (mean −1.25) and in the Accessibility leg of the
developer average. Every one of those gaps came from a usability-walk cap for a skip link or a
reduced-motion tier the winning site genuinely does not have. So `ship` here means *clears our
floor, which is stricter than the award's*, and a `fix` or `rebuild` on work of real Site-of-the-Day
quality is the expected result, not a contradiction. Do not re-scale to close the gap: it is the one
axis on which new work can beat the reference set instead of copying it. Full table in the
repository's [verification log](https://github.com/burgisimon/awards/blob/main/docs/handoff/verification-log.md) (not part of the installed plugin).

## Design anchors (40)

| Score | Anchor |
|---|---|
| 9–10 | A world no other site owns. Every element belongs to it, including the scrollbar, the selection colour and the 404. The first viewport is an object or a behaviour a visitor can describe an hour later. Type and colour are a two-to-four token system with a macro/micro contrast. Nothing reads as borrowed. Corpus: `[site:igloo]` at 7.92 as a Site of the Day shows how rarely even winners reach here |
| 8 | A committed world with one or two seams: a section that opts out of the system, a stock component, a second accent that crept in. `[site:oryzo]` 7.9 |
| 7 | Competent and cohesive, but a juror has seen this register before. Typical SOTD floor: `[site:son-daven]` 7.70, `[site:seasats]` 7.61, `[site:trevor-noah]` 7.38, `[site:white-desert]` 7.28 |
| 6 | The category default or the Awwwards default: dark + glow + big grotesque, hero-metric row, identical card grids, a reflex display face. Hierarchy works but nothing is authored |
| ≤ 5 | Inconsistent tokens, broken hierarchy, template order, unstyled states |

What moves Design up: a decided colour strategy (`[pattern:color-and-material#colour-strategies]`), one type contract held everywhere, authored load and close, pacing with rests, themed browser surfaces. What moves it down: a second font, a generated palette, a section in another register, chrome left at browser defaults.

## Usability anchors (30)

| Score | Anchor |
|---|---|
| 9–10 | Every gesture has a keyboard path; wayfinding is never in doubt; repeat loads under 2.5 s; reduced motion honoured with state changes preserved; mobile designed, not degraded; nothing is gated |
| 8 | Minor friction: one hover-only affordance, a rail that is awkward on touch, a preloader that always plays |
| 7 | The typical winner. A gate, a scroll-jack, an unusual navigation or a heavy load costs comprehension. The corpus cluster: `[site:son-daven]` 7.16, `[site:seasats]` 7.17, `[site:white-desert]` 7.27, `[site:trevor-noah]` 7.32, `[site:oryzo]` 7.51 |
| 6 | Content sits behind a gesture with no alternative; the mobile experience is a shrunken desktop; the core task (enquire, buy, read) takes effort to find |
| ≤ 5 | The core task cannot be completed by keyboard or on a phone; empty DOM behind a canvas; no reduced-motion path and motion that blocks reading |

Usability is the lowest of the four axes on **27 of the 31** corpus entries awarded since 2021 [verified per card; counted by `scripts/calibration.mjs --since 2021`, 2026-10-22]. The exceptions miss by hundredths: `[site:white-desert]` (Creativity 7.21 under Usability 7.27), `[site:noth]` (Content 7.23 under 7.24), `[site:aardvarkbookclub]` and `[site:bethebuzz]` (Design 7.13 and 7.16 under 7.16 and 7.18). Outside the corpus, Cartier's Site of the Day of 20 Oct 2026 put Design 7.33 under Usability 7.51 [verified, awwwards.com/sites/cartier-le-choeur-des-pierres read 2026-10-22]. It is therefore the cheapest axis to beat the reference set on: run `usability-walk.md` and fix what it finds before touching anything else.

## Creativity anchors (20)

| Score | Anchor |
|---|---|
| 9–10 | A concept that replaces the feature list, enacted in the medium: the interaction *is* the argument (drawing a zero to enter a manifesto `[site:why-zero]`, a changelog hung as a gallery `[site:shopify-editions-w26]`, a coaster launched like a frontier model `[site:oryzo]` 8.35) |
| 8 | A strong concept whose execution partly borrows known moves. `[site:son-daven]` 8.15, `[site:trevor-noah]` 7.78 |
| 7 | One memorable moment on a conventional structure. `[site:seasats]` 7.38, `[site:white-desert]` 7.21 |
| 6 | Effects without a concept: fade-ups, a blob hero, particles, a cursor trail. Effect count is not creativity |
| ≤ 5 | A template with the client's logo |

The naming test belongs here: if a juror could name the source site from the first viewport, Creativity caps at 6 regardless of polish. The competitor test caps it at 7: put the nearest real competitor's name on the page, and if the idea, the first viewport and the signature would serve it as well, the concept is the category's, however well it is made.

## Content anchors (10)

| Score | Anchor |
|---|---|
| 9–10 | Numbers instead of adjectives, dual units, specification-grade claims, two registers separated by chapter, real photography or renders, authored 404 and footer copy. `[site:white-desert]` 7.74 and `[site:seasats]` 7.65 lead the corpus on this axis |
| 8 | Mostly specific with some filler |
| 7 | Readable but generic claims ("world-class", "seamless") |
| 6 | Placeholder feel: "Get started", "Learn more", unlabelled stock |
| ≤ 5 | Lorem ipsum, invented testimonials presented as real |

## Developer criteria

Awwwards publishes **six** developer criteria, and this rubric scores all six under the same names, so a jury report reads like an entry page [verified, entries read 2026-09-18]. Until 0.7 it anchored five, judging Semantics / SEO and Accessibility together; that weighed them as one fifth instead of two sixths, and the two diverge by 0.6–1.0 on current entries.

The published **DEV AWARD** score is the mean of the six, to within 0.07 across every entry read — the displayed sub-scores are rounded to two places, the mean is not. The jury's developer score is the same mean, and a Developer Award needs it above 7.

Corpus calibration, now read rather than recalled: `[site:igloo]` scored Semantics/SEO 6.60, Animations 9.60, Accessibility 6.60, WPO 8.00, Responsive 8.40, Markup/Meta 6.40 → 7.66. (The earlier `[recalled medium]` figures were right but collapsed two 6.60s into one "accessibility and semantics".) Across the 30 corpus cards that publish them the criteria run: Semantics/SEO 6.60–8.20, Animations 7.20–9.60, Accessibility 6.20–7.60, WPO 6.60–8.60, Responsive 6.80–8.40, Markup/Meta 6.40–8.00 [verified per card; counted by `scripts/calibration.mjs --since 2021`, 2026-10-22]. **Accessibility is the lowest-ceilinged of the six** — at most 7.60 in the corpus (`[site:gehry-getty]`), median 6.80. That is a corpus figure, not a ceiling: Cartier's Site of the Day of 20 Oct 2026 scored Accessibility 8.00 [verified, awwwards.com/sites/cartier-le-choeur-des-pierres read 2026-10-22].

| Criterion | 9–10 | 7 | ≤ 5 |
|---|---|---|---|
| Semantics / SEO | A descriptive title and meta description per page, canonical and Open Graph text, one h1 and an unbroken outline, landmarks, `lang`, and every word a canvas draws also present in the DOM | Present but generic: one title for every route, no description | No title, headings chosen by size, an empty DOM behind a canvas |
| Animations / Transitions | One ticker, framerate-independent damping, scrubbed tweens with `ease:'none'`, velocity as input, every loop paused off-screen | Smooth but some jank on resize or route change | Layout-property animation, dropped frames, scroll-jack with no exit |
| Accessibility | Every text at 4.5:1 (large 3:1) in every state including focus, a focus ring at 3:1, keyboard for every gesture, a skip link, targets ≥ 24 px (44 px for the top band), alt text, reduced-motion tiers, no axe-core violations | Partial: some labels, some focus styles, a contrast slip | `outline:none`, drag-only controls, unreadable focus states |
| WPO | Entry JS ≤ 200 KB gz, GL in its own lazy chunk, compressed textures and meshes, LCP ≤ 2.5 s throttled | One heavy asset or an uncapped DPR | Multi-megabyte rasters, blocking fonts, no code splitting |
| Responsive Design | Strategy decided (vw-lock or breakpoints), coarse-pointer swaps, no overflow, touch targets ≥ 44 px | Works with rough edges | Desktop only; a reload at a breakpoint |
| Markup / Meta-data | Valid, semantic markup with unique ids, theme-color, colour-scheme, favicon and Open Graph image, no console errors, disposal on route change, no debug flags shipped | Minor warnings, some dead code | Errors, duplicate ids or tickers, leaked renderers |

## How to score honestly

1. Score from the captures and the audit before reading the direction contract, so the contract cannot argue you upward.
2. Write the one-line reason next to each score. A score without a reason is a feeling.
3. Compare against the exemplars above. If you give a Design 9, name the corpus site it would beat.
4. Never round a middling axis up because another axis is strong. The weighted score exists to do that arithmetic.
5. Scores drive the disposition (`report-template.md`); the disposition drives the fix list. Praise is not part of the output.

## What moves each axis, in one table

| To raise | Do | Not |
|---|---|---|
| Design | Decide the colour strategy; hold one type contract; author load, close, 404 and browser surfaces; give the page pacing | Add effects, add a font, add a gradient |
| Usability | Run the walk; add keyboard paths; skip the preloader on repeat; collapse eccentric nav on touch; ship reduced-motion tiers | Remove the signature |
| Creativity | Make the signature enact the thesis; make one metaphor do two jobs; cut every effect that does not serve it | Add particles |
| Content | Replace adjectives with numbers; separate registers by chapter; label synthetic assets | Write more |
