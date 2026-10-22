# Award programs

What this file is for: a build can aim at more than one program, and the programs do not judge alike. This file gives each program's scale, what decides its daily award, and how the plugin's jury maps its own scores onto it. Read it when `## Brief` or the jury's `--program` names a program other than Awwwards. The rubric itself (`rubric.md`) stays the one the jury scores against; a program changes the report's target line, never the scores.

## Contents
1. [Awwwards](#awwwards)
2. [CSS Design Awards](#css-design-awards)
3. [FWA](#fwa)
4. [The Webby Awards](#the-webby-awards)
5. [Mapping the plugin's scores](#mapping-the-plugins-scores)
6. [Several programs at once](#several-programs-at-once)

## Awwwards

| Fact | Value | Confidence |
|---|---|---|
| Scale | 0–10 per axis; Design 40 %, Usability 30 %, Creativity 20 %, Content 10 %, plus a Developer Award over six criteria | [verified, `rubric.md`, twenty entries read 2026-09-18] |
| Site of the Day territory | weighted 7.2 or more with no axis below 6.8; the 31 corpus entries since 2021 run 7.19–8.18 | [verified per card, `rubric.md#thresholds`] |
| Honorable Mention | begins around a weighted 6.5 (`rubric.md#thresholds`) [recalled medium]; the two corpus entries that hold one publish no aggregate axis scores, only juror overalls of 6.40–9.90 and 6.50–8.90 | [verified, entry pages on those cards] |

Target lines: `Site of the Day` (the default) or `Honors` (an Honorable Mention: a finished, coherent site whose weighted score may sit under 7.2; the jury still names what would lift it to Site of the Day).

## CSS Design Awards

| Fact | Value | Confidence |
|---|---|---|
| Scores | three judge scores, UI Design, UX Design and Innovation, each 0–10; the final judge's score is their mean (7.40, 7.37 and 7.30 give 7.36 on one nominee page) | [verified, cssdesignawards.com nominee page and its FAQ, read 2026-10-22] |
| Website of the Day | decided by the judging panel; an average above 8.0, which "varies depending on quality of the sites submitted"; a 96-hour window | [verified, same FAQ] |
| Special Kudos | sites other than WOTDs whose judges' average is above 6 | [verified, same] |
| UI, UX and Innovation awards | public awards: 20 votes in a category and a judges' average above 6 | [verified, same] |
| What each score covers | UI: aesthetics and effects; UX: user experience and functionality; Innovation: new development and design ideas | [verified, same] |

The bar is higher than Awwwards' daily award on the same arithmetic: a build at 7.6 on the plugin's rubric is a Site of the Day candidate and a Special Kudos at CSSDA.

## FWA

| Fact | Value | Confidence |
|---|---|---|
| Scale | each judge gives up to 100 points; the page shows the average of all judges who voted, with at least 20 votes | [verified, thefwa.com judging tooltips and jury guidance, read 2026-10-22] |
| Bands the jury is given | 70–79 "FWA of the Day worthy", 80–89 "a great FWA of the Day example", 90 and above "FWA of the Month worthy"; below 70 is not considered | [verified, same; fragments quoted] |
| Who judges | a jury of web professionals; the daily award goes to the best project of the day | [verified, same] |
| Leaning | campaigns, experiments and interactive work; a conventional marketing site rarely competes | [inferred, from the winners' gallery and the bands' wording] |

## The Webby Awards

| Fact | Value | Confidence |
|---|---|---|
| Criteria for websites | Content, Structure and Navigation, Visual Design, Functionality, Interactivity, Innovation, Overall Experience | [verified, webbyawards.com/judging-criteria, read 2026-10-22] |
| Notable wording | Visual Design should "improve inclusion for people with disabilities"; Functionality names load speed and cross-platform performance; Innovation asks whether "any AI is used responsibly" | [verified, same] |
| Structure | entries compete inside industry and feature categories, with a separate public People's Voice award | [verified categories; People's Voice mechanics [unknown]] |
| Numeric threshold | none published | [unknown] |

A Webby entry is chosen by category first: the brief's industry decides where it competes, which is also where `scripts/corpus-gaps.mjs` sends a maintainer looking for references.

## Mapping the plugin's scores

The jury scores the rubric as always, then adds one target line per program the brief names. The mappings are the plugin's own and marked as such in the report:

| Program | Target line | Mapping |
|---|---|---|
| Awwwards | `Awwwards: SOTD candidate` / `Honors candidate` / `below` | the rubric's thresholds as they stand |
| CSS Design Awards | `CSSDA: WOTD candidate` (≥ 8.0) / `Special Kudos` (> 6) / `below` | UI ≈ Design, UX ≈ Usability, Innovation ≈ Creativity; their mean against the program's bar [inferred mapping] |
| FWA | `FWA: ≈ <n>/100, <band>` | the weighted score × 10, reported as a band, never as a prediction [inferred mapping] |
| Webby | one line per criterion: met, partly met or missing, with the evidence | the jury's existing assessments: Content → Content; Structure and Navigation → the usability walk; Visual Design → Design plus accessibility; Functionality → the developer criteria and performance; Interactivity → the signature and state inventory; Innovation → Creativity; Overall Experience → the memory test |

A mapping never moves a score or a disposition. When a program's bar is above the rubric's (CSSDA's 8.0), the report says what the gap is made of rather than inflating anything.

## Several programs at once

- The brief may name up to three programs (`## Brief`, binding constraints: `programs: awwwards, cssda`). The first is the primary target; the others are reported, never optimised for at the primary's expense.
- Conflicts are named, not averaged: FWA's leaning towards experiments and Webby's insistence on inclusion and load speed pull in different directions. The contract chooses, and the report says which program the choice costs.
