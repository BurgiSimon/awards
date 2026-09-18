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

**Thresholds.** Site of the Day territory begins at a weighted **7.2** with **no axis below 6.8**. That floor is confirmed: the twenty verified entries run **7.28 to 8.18**, median 7.67, and none scores an axis below 7.00 [verified, entries read 2026-09-18]. Honourable Mention begins around 6.5 [recalled medium — the one Honourable Mention entry read, `leo-parpeix-portfolio` 2021, publishes no axis scores]. A Developer Award needs the developer average above **7**; the verified range is 7.22 to 8.09, median 7.63.

Per axis, across the same twenty entries:

| Axis | min | median | max |
|---|---|---|---|
| Design | 7.28 | 7.70 | 8.12 |
| Usability | 7.00 | 7.38 | 7.90 |
| Creativity | 7.21 | 7.97 | 8.71 |
| Content | 7.16 | 7.70 | 8.18 |
| Overall | 7.28 | 7.67 | 8.18 |
| Developer award | 7.22 | 7.63 | 8.09 |

**This rubric scores below the award, on purpose.** Six corpus sites were juried blind against their
own live entries during the 0.2 calibration, and this instrument came out about **0.7 lower** on the
weighted score, almost all of it in Usability (mean −1.25) and in the Accessibility leg of the
developer average. Every one of those gaps came from a usability-walk cap for a skip link or a
reduced-motion tier the winning site genuinely does not have. So `ship` here means *clears our
floor, which is stricter than the award's*, and a `fix` or `rebuild` on work of real Site-of-the-Day
quality is the expected result, not a contradiction. Do not re-scale to close the gap: it is the one
axis on which new work can beat the reference set instead of copying it. Full table in
`docs/handoff/verification-log.md`.

## Design anchors (40)

| Score | Anchor |
|---|---|
| 9–10 | A world no other site owns. Every element belongs to it, including the scrollbar, the selection colour and the 404. The first viewport is an object or a behaviour a visitor can describe an hour later. Type and colour are a two-to-four token system with a macro/micro contrast. Nothing reads as borrowed. Corpus: `[site:igloo]` 7.92 overall as Site of the Year shows how rarely even winners reach here |
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

Usability is the lowest of the four axes on **nineteen of the twenty** verified entries — `[site:white-desert]` is the single exception, scoring Creativity 7.21 under Usability 7.27 [verified, entries read 2026-09-18]. It is therefore the cheapest axis to beat the reference set on: run `usability-walk.md` and fix what it finds before touching anything else.

## Creativity anchors (20)

| Score | Anchor |
|---|---|
| 9–10 | A concept that replaces the feature list, enacted in the medium: the interaction *is* the argument (drawing a zero to enter a manifesto `[site:why-zero]`, a changelog hung as a gallery `[site:shopify-editions-w26]`, a coaster launched like a frontier model `[site:oryzo]` 8.35) |
| 8 | A strong concept whose execution partly borrows known moves. `[site:son-daven]` 8.15, `[site:trevor-noah]` 7.78 |
| 7 | One memorable moment on a conventional structure. `[site:seasats]` 7.38, `[site:white-desert]` 7.21 |
| 6 | Effects without a concept: fade-ups, a blob hero, particles, a cursor trail. Effect count is not creativity |
| ≤ 5 | A template with the client's logo |

The naming test belongs here: if a juror could name the source site from the first viewport, Creativity caps at 6 regardless of polish.

## Content anchors (10)

| Score | Anchor |
|---|---|
| 9–10 | Numbers instead of adjectives, dual units, specification-grade claims, two registers separated by chapter, real photography or renders, authored 404 and footer copy. `[site:white-desert]` 7.74 and `[site:seasats]` 7.65 lead the corpus on this axis |
| 8 | Mostly specific with some filler |
| 7 | Readable but generic claims ("world-class", "seamless") |
| 6 | Placeholder feel: "Get started", "Learn more", unlabelled stock |
| ≤ 5 | Lorem ipsum, invented testimonials presented as real |

## Developer criteria

Awwwards publishes **six** developer criteria; this rubric anchors **five**, because Semantics / SEO and Accessibility are judged together here. The mapping [verified, entries read 2026-09-18]:

| Awwwards criterion | This rubric's criterion |
|---|---|
| Animations / Transitions | Animation and interaction |
| WPO | Performance |
| Responsive Design | Responsive |
| Accessibility **and** Semantics / SEO | Accessibility and semantics |
| Markup / Meta-data | Code and markup |

The published **DEV AWARD** score is the mean of the six, to within 0.07 across every entry read — the displayed sub-scores are rounded to two places, the mean is not.

Corpus calibration, now read rather than recalled: `[site:igloo]` scored Semantics/SEO 6.60, Animations 9.60, Accessibility 6.60, WPO 8.00, Responsive 8.40, Markup/Meta 6.40 → 7.66. (The earlier `[recalled medium]` figures were right but collapsed two 6.60s into one "accessibility and semantics".) Across the twenty entries the criteria run: Semantics/SEO 6.60–8.20, Animations 7.40–9.60, Accessibility 6.60–7.60, WPO 6.80–8.60, Responsive 7.00–8.40, Markup/Meta 6.40–8.00. **Accessibility is the lowest-ceilinged of the six** — its maximum across the whole corpus is 7.60.

| Criterion | 9–10 | 7 | ≤ 5 |
|---|---|---|---|
| Animation and interaction | One ticker, framerate-independent damping, scrubbed tweens with `ease:'none'`, velocity as input, every loop paused off-screen | Smooth but some jank on resize or route change | Layout-property animation, dropped frames, scroll-jack with no exit |
| Performance | Entry JS ≤ 200 KB gz, GL in its own lazy chunk, compressed textures and meshes, LCP ≤ 2.5 s throttled | One heavy asset or an uncapped DPR | Multi-megabyte rasters, blocking fonts, no code splitting |
| Responsive | Strategy decided (vw-lock or breakpoints), coarse-pointer swaps, no overflow, touch targets ≥ 44 px | Works with rough edges | Desktop only; a reload at a breakpoint |
| Accessibility and semantics | Landmarks, one h1, alt, focus-visible, keyboard for every gesture, DOM mirror behind canvases, reduced-motion tiers | Partial: some labels, some focus styles | Empty DOM, `outline:none`, drag-only controls |
| Code and markup | Valid, semantic, no console errors, disposal on route change, no debug flags shipped | Minor warnings, some dead code | Errors, duplicate tickers, leaked renderers |

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
