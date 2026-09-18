# Verification log — 0.2.0 live corpus pass

The ledger for `docs/handoff/plan-0.2.md`. On any restart read this file first and continue at
the first row not marked `done`. Every number here is re-fetched from the live site or its live
award entry during the pass; nothing is copied from the plan's planning notes.

Branch: `feat/live-verification-0.2` · machine: this one (Node 24.21, CLI 2.1.276, Playwright
1.63.0 via `AWARDS_PLAYWRIGHT=$HOME/.npm/_npx/e41f203b7505f1fb`).

## Phase 0 — baseline

| Check | Result | Date |
|---|---|---|
| `claude plugin validate plugins/awards` | pass | 2026-09-18 |
| `node scripts/verify-recipes.mjs` | 27/28, one drift, fixed below → 28/28 | 2026-09-18 |
| `node scripts/audit.mjs recipes` | 121 files · P0 0 · P1 0 · P2 0 · P3 30 | 2026-09-18 |
| `@unseenco/taxi` pin aligned to 1.9.1 | done (`^1.8.0` → `1.9.1`, lockfile resynced) | 2026-09-18 |

Recipes were re-verified on Chromium 153.0.8010.12 (the stamps said 141.0.7390.37), so every
`recipe.json.verified` block moved. Node 24.21.0, CLI 2.1.276.

### Drift found by the baseline, and fixed

1. **`gl-rtt-composite-transition` failed `arrow keys switch sections`**, and flakily: 1 pass in 3.
   Root cause, confirmed by instrumenting the page (`keydown` count 2, second press seen with
   `transitioning: true`, `section` still `0`): every relative step was computed from
   `state.section`, which stays on the outgoing section for the whole transition. The second press
   therefore asked for the section already on its way, the `transitioning` guard queued it, and the
   queued call returned at `next === state.section`. The press was swallowed — on any machine,
   whenever a visitor presses twice inside the one-second switch. Fixed by stepping from the pending
   destination (`pending()`), in the three call sites and in the early-return guard.
2. **A fixed sleep cannot time a headless GL page.** Measuring rAF intervals on this page showed
   ~16 ms frames with **one 3,917 ms stall** while SwiftShader compiled the second render-target
   path. That stall, not the logic, is what made the old 1,500 ms waits flaky. `verify-recipes.mjs`
   gained a `waitFor` action (`page.waitForFunction`, 15 s default) and the `keys` and `after` states
   now wait on the page's own state. The `mid` state keeps its fixed wait: a frame sampled *during*
   a transition cannot be awaited on state, because the value disappears the moment a stalled rAF
   resumes past it. The new `keys` state presses the second key 120 ms in, on purpose, and was
   confirmed to fail on the unfixed page and pass 4 / 4 on the fixed one.
3. **`verify-recipes.mjs --only <id>` rewrote the committed `recipes/index.html`** down to the
   filtered subset, because the gallery was generated from the filtered `ids`. It now generates from
   every recipe folder.
4. **`.gitignore` did not ignore `plugins/awards/.awards/`**: `.awards/audit.json` and its siblings
   contain a slash, so git anchored them to the repository root. Rewritten as `**/.awards/…`.

5. **`verify-recipes.mjs` is not safe to run beside another Chromium.** With a site capture running
   in parallel, `gl-virtual-scroll-camera` failed `idle float snaps to a chapter (0.855)`; alone it
   passes 3 / 3, and the whole suite passed it. Run the suite with nothing else driving a browser.

## Phase 1 — capture.mjs hardening

Checked against `https://www.igloo.inc/` (a virtual-scroll site, the case the old `scrollTo` could
not move) with `--only desktop --scroll 0,50,100 --wheel 12000 --wait 6000 --timeout 90000`:

| Check | Result |
|---|---|
| exit code | 0 |
| `manifest.json` written | yes, 3 captures, 0 page errors, 0 console errors |
| `metrics.desktop.scrollMode` | `wheel` |
| frames differ | yes: wireframe field → igloo on a snowfield → a rock in fog |
| `metrics.desktop` | `domNodes: 27`, `canvases: 0`, `awardsHook: false`, LCP 864 ms, CLS 0 |
| `verify-recipes --only gl-virtual-scroll-camera,boot-lenis-gsap` | 3 / 3 runs green |

The 27-node DOM behind a full-screen canvas is itself evidence for the `igloo` card's accessibility
claim; it is recorded here and confirmed on that card's own pass.

### Environment findings that change the plan

- **Awwwards answers 403 to curl**, with or without a browser user agent and full navigation
  headers. The plan's Phase 3 packet says to `curl` the entry; that no longer works. Real Chromium
  through the repo's own Playwright resolver gets 200, and the entry markup is exactly as the plan
  describes (`igloo-inc`: overall 7.92, D 8.05 / U 7.50 / C 8.31 / Co 7.91, DEV AWARD 7.66, six
  developer sub-scores in the order Semantics / SEO, Animations / Transitions, Accessibility, WPO,
  Responsive Design, Markup / Meta-data). Live sites themselves still answer curl. Site cards are
  therefore fetched with curl and award entries with a headless browser.
- **`shopify-editions-w26` and `the-line` entry slugs, resolved by web search.** Shopify Editions
  Winter '26 is `the-renaissance-edition` (its entry links to `shopify.com/editions/winter2026`) and
  The Line is `thelinestudio-com`. **Both cards claim a Site of the Month that neither entry lists** —
  each shows Site of the Day only (Feb 9 2026 and Nov 5 2024). `awwwards.com/search/` is not a route
  and five slug guesses 404ed, so the listing pages are not a usable index.
- **`lama-lama` resolves to two entries.** `lama-lama` is Site of the Day 30 Dec **2021** at 7.69;
  `lama-lama-2` is Site of the Day 20 Jul 2026 at 7.51. The card says "SOTM Jul 2026 + Dev 7.30",
  which matches neither, and calls it Site of the Month where both entries say Site of the Day. Its
  own pass has to decide which entry the live site is.
- **`floema`'s entry contradicts its card outright**: the entry is Site of the Day 13 May **2026** at
  7.65, the card says SOTD Jul **2021** at 7.53.
- **Plugin eval and skill documentation, answered from the docs** (for Phases 5a and 6c): grader
  types are `regex`, `tool_used`, `tool_order`, `file_exists`, `llm`, `baseline` — there is no
  command or script grader; targets are `last_message` (the default), `trace`, `files`,
  `{ source: file, path }` and `mock_calls`; `file_exists` **does** accept a glob; case-insensitivity
  is `flags: i` and inline `(?i)` is unsupported; `arm: with-only` drops a grader from the baseline
  arm and `arm: both` forces it into both; `--threshold` compares a per-case mean of per-run
  grader-pass fractions; `add_dirs` grants **read-only** copies inside the sandbox, so a case cannot
  write to the committed fixture; and `allowed-tools` **does** expand `${CLAUDE_PLUGIN_ROOT}` in Bash
  rules, which puts Phase 6c on its "supported" branch.

## Site pass — 19 cards

Columns: **reach** = HTTP status of the live site · **exit** = `capture.mjs` exit code ·
**scroll** = `hook` / `native` / `wheel` · **overall** = award entry overall score as read from
the live entry markup on the pass date · **conf** = card confidence before → after.

| # | Slug | Live URL | Entry URL | Pass date | Reach | Exit | Scroll | Overall (verified) | Conf before → after | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `united-carriers` | https://unitedcarriers.com/ | https://www.awwwards.com/sites/united-carriers | 2026-09-18 | 200 | 2 | native / wheel (mobile) | 7.28 (D 7.35 · U 7.00 · C 7.61 · Co 7.16 · DEV 7.54) | medium-high → high | **done** |
| 2 | `white-desert` | https://white-desert.com/ | https://www.awwwards.com/sites/white-desert | 2026-09-18 | 200 | 0 | native | 7.31 (D 7.28 · U 7.27 · C 7.21 · Co 7.74 · DEV 7.61) | medium → high | **done** |
| 3 | `seasats` | https://www.seasats.com/ | https://www.awwwards.com/sites/seasats | 2026-09-18 | 200 | 0 | native | 7.44 (D 7.61 · U 7.17 · C 7.38 · Co 7.65 · DEV 7.22) | medium → high | **done** |
| 4 | `mont-fort` | https://mont-fort.com/ | https://www.awwwards.com/sites/montfort | 2026-09-18 | 200 | 2 | native | 7.62 (D 7.67 · U 7.40 · C 7.85 · Co 7.65 · DEV 7.84) | high → high (live + entry) | **done** |
| 5 | `mindmarket` | https://mindmarket.com/ | https://www.awwwards.com/sites/mindmarket | | | | | | low-medium → | todo |
| 6 | `lando-norris` | https://landonorris.com/ | https://www.awwwards.com/sites/lando-norris | | | | | | high → | todo |
| 7 | `lama-lama` | https://lamalama.com/ | https://www.awwwards.com/sites/lama-lama | | | | | | medium → | todo |
| 8 | `trevor-noah` | https://www.trevornoah.com/ | https://www.awwwards.com/sites/trevor-noah | | | | | | medium → | todo |
| 9 | `animejs` | https://animejs.com/ | https://www.awwwards.com/sites/anime-js | | | | | | high/low → | todo |
| 10 | `son-daven` | https://sondaven.com/en | https://www.awwwards.com/sites/son-daven | | | | | | high → | todo |
| 11 | `why-zero` | https://why.zero.university/ | https://www.awwwards.com/sites/why-zero | | | | | | medium-high → | todo |
| 12 | `leo-parpeix` | https://www.leoparpeix.com/ | https://www.awwwards.com/sites/leo-parpeix-portfolio-2026 | | | | | | medium-high → | todo |
| 13 | `floema` | https://floema.com/en | https://www.awwwards.com/sites/floema | | | | | | high → | todo |
| 14 | `slosh-seltzer` | https://sloshseltzer.com/ | https://www.awwwards.com/sites/slosh-seltzer | | | | | | medium-high → | todo |
| 15 | `igloo` | https://www.igloo.inc/ | https://www.awwwards.com/sites/igloo-inc | | | | | | high → | todo |
| 16 | `shopify-editions-w26` | https://www.shopify.com/editions/winter2026 | https://www.awwwards.com/sites/the-renaissance-edition | | | | | | medium → | todo |
| 17 | `oryzo` | https://oryzo.ai/ | https://www.awwwards.com/sites/oryzo-ai | | | | | | medium-high → | todo |
| 18 | `usavionix` | https://www.usavionix.com/ | https://www.awwwards.com/sites/usavionix | | | | | | medium → | todo |
| 19 | `the-line` | https://thelinestudio.com/ | https://www.awwwards.com/sites/thelinestudio-com | | | | | | high → | todo |

### Deltas

One subsection per site, filled after its pass: `field: old → new [evidence]`, plus any
technique attribution the live site contradicts and anything that stayed blocked.

**`united-carriers`** — the two load-bearing technique claims were both wrong.

- *WebGL dosage*: "canvas-first for the journey scenes", with ScrollTrigger scrubbing a Three.js
  scene state machine → **moments**. The land beats are 554 pre-rendered AVIF frames scrubbed into
  2D canvases by a sequence player; real-time WebGL is the hero globe, an ocean/wake scene and a
  footer particle canvas [verified, `chunk-Home-CZ3JhV-m.js`, `chunk-globe.js`]. The old card would
  have sent a build down a Three.js scene-graph route for an effect this site bought with a render
  farm.
- *Palette*: "one hue, one ground, no second accent" → **two tokens**. `--secondary:#f50` is used 67
  times and is the entire cursor system; only the hero is dark, the body and footer are white
  [verified, `webflow-shared.css`]. A §7 principle rested on the single-hue claim and is replaced.
- *Type*: "Helvetica Now" → **Helvetica Neue**, plus a third face the card never had, BT Steinhart
  Mono [verified, `@font-face`].
- *Awards*: sub-scores `[unknown]` → 7.28, D 7.35 / U 7.00 / C 7.61 / Co 7.16, DEV 7.54 with all six
  developer criteria [verified, entry read 2026-09-18].
- *Accessibility*: `[unknown]` → fails on three counts — no landmarks or skip link, zero key
  handlers, one `prefers-reduced-motion` guard in the whole homepage bundle [verified].
- *Scroll model*: below 767px the page scrolls an inner `.body-inner` element rather than the
  window, which is exactly why the Phase 1 wheel fallback was needed for its mobile frames.
- Still open: the preloader and the menu overlay appear in no frame, so their behaviour stays
  `[unknown]`; a bare `[verified]` on gallery curation had no named source and was downgraded to
  `[recalled medium, not re-checked]`.

## Calibration

Six sites plus the generic fixture, juried blind before any verified score reached a card or
`_index.md`. Deltas are jury minus the award entry.

Seven runs, all blind, all before a single verified score reached a card or `_index.md`. Each was
an `awards-jury` agent spawned fresh with the plan's verbatim packet, given the research captures
and a `--render` audit, and told to write nothing to disk.

**Answer key removed from the instrument.** The jury reads `references/jury/rubric.md`, and that
file cites `[site:seasats]` and `[site:white-desert]` with their per-axis scores in four of its own
anchor rows — a complete answer key for two of the six. The runs were therefore given a redacted
copy of the plugin root at `<scratch>/plugin-blind`: no `references/sites/` at all, and every score
on a line naming one of the six calibration targets replaced by `[redacted for calibration]` (25
lines). The anchors keep their descriptive text, which is the actual instrument. Two jurors noted
unprompted that they could still see *which* anchor rows named their target, and said so in their
reports; that residual is real and is why those two rows are the weakest in the table.

| Site | Jury D | U | C | Co | Weighted | Dev | Entry D | U | C | Co | Overall | Dev | Jury disposition | Real award |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `united-carriers` | 7.20 | 6.00 | 7.30 | 7.20 | 6.86 | 5.60 | 7.35 | 7.00 | 7.61 | 7.16 | 7.28 | 7.54 | fix | SOTD 2026-09-06 |
| `white-desert` | 7.20 | 6.70 | 6.90 | 8.80 | 7.15 | 6.10 | 7.28 | 7.27 | 7.21 | 7.74 | 7.31 | 7.61 | fix | SOTD 2026-09-11 |
| `seasats` | 7.30 | 6.00 | 7.20 | 8.80 | 7.04 | 6.24 | 7.61 | 7.17 | 7.38 | 7.65 | 7.44 | 7.22 | fix | SOTD 2026-09-08 |
| `mont-fort` | 6.90 | 6.00 | 6.50 | 6.80 | 6.54 | 6.20 | 7.67 | 7.40 | 7.85 | 7.65 | 7.62 | 7.84 | rebuild | SOTD 2025-06-23 |
| `mindmarket` | 7.00 | 6.00 | 7.00 | 7.50 | 6.75 | 7.20 | 8.09 | 7.48 | 7.95 | 7.75 | 7.85 | 7.55 | rebuild | SOTD 2025-12-29 |
| `lando-norris` | 7.60 | 6.00 | 7.40 | 7.80 | 7.10 | 6.00 | 8.12 | 7.90 | 8.71 | 8.18 | 8.18 | 7.58 | fix | SOTD 2025-11-17 |
| generic fixture | 5.00 | 5.00 | 4.00 | 4.00 | **4.70** | 4.30 | — | — | — | — | — | — | **rebuild** | — (bar: < 6.5, not `ship`) |

Deltas, jury minus entry:

| Site | ΔD | ΔU | ΔC | ΔCo | Δ weighted | Δ dev |
|---|---|---|---|---|---|---|
| `united-carriers` | −0.15 | −1.00 | −0.31 | +0.04 | −0.42 | −1.94 |
| `white-desert` | −0.08 | −0.57 | −0.31 | +1.06 | −0.16 | −1.51 |
| `seasats` | −0.31 | −1.17 | −0.18 | +1.15 | −0.40 | −0.98 |
| `mont-fort` | −0.77 | −1.40 | −1.35 | −0.85 | −1.08 | −1.64 |
| `mindmarket` | −1.09 | −1.48 | −0.95 | −0.25 | −1.10 | −0.35 |
| `lando-norris` | −0.52 | −1.90 | −1.31 | −0.38 | −1.08 | −1.58 |
| **mean** | **−0.487** | **−1.253** | **−0.735** | **+0.128** | **−0.707** | **−1.333** |

### Decision taken

The rule is: move an anchor only when an axis is off by more than 0.5 in the same direction on at
least 5 of 6 sites.

| Axis | Qualifies? | Action |
|---|---|---|
| Design | no — 3 of 6 | anchors unchanged |
| Creativity | no — 3 of 6 | anchors unchanged |
| Content | no — 1 of 6, and the deltas change sign (+1.15 to −0.85) | anchors unchanged |
| Usability | **yes — 6 of 6** | **recorded, not corrected** |
| Developer average | **yes — 5 of 6** | **recorded, not corrected** |

**No rubric anchor wording changes.** Both axes that qualify are the plugin's deliberate strictness,
which the plan says to record rather than correct. Every one of the six Usability scores was capped
by usability-walk step 1 or step 3, and in each case for something the site really does lack: no
skip link on `seasats`, `mindmarket`, `lando-norris`, `united-carriers` and `mont-fort`; no authored
reduced-motion tier on `mont-fort` and `lando-norris`. The developer average is under for the same
reason through its Accessibility leg — the jury scored 4.5–6.5 where Awwwards scored 6.60–7.20. That
gap *is* the plugin's stated edge over its own corpus, so closing it would be closing the only thing
the corpus is being beaten on.

**What does change, in Phase 4, and is factual rather than calibrational:**

1. The 40/30/20/10 weighting is no longer `[recalled medium]`. It reproduces the published overall
   to within 0.01 on all six entries, read from live markup.
2. The rubric says the developer jury scores **five** things; Awwwards publishes **six**
   (Semantics / SEO, Animations / Transitions, Accessibility, WPO, Responsive Design,
   Markup / Meta-data). The mapping has to be written down.
3. The threshold "Site of the Day territory begins at a weighted 7.2" is **confirmed**: the six
   verified entries run 7.28 to 8.18.
4. A calibration note is owed to the reader. This jury handed `fix` or `rebuild` to six sites that
   all actually won Site of the Day, and its weighted score sits about 0.7 below the published one.
   `ship` therefore means "clears our floor, which is stricter than the award's", not "this would
   win", and `rebuild` on a real winner is not a contradiction. Without that sentence the numbers
   invite exactly the wrong reading.

### Protocol split, recorded rather than hidden

The first three runs (`white-desert`, `seasats`, `united-carriers`) were given no caveat about the
manifest's LCP and scored Performance 3.5, 4.0 and 4.5 almost entirely on it; `white-desert`'s
Usability cap at walk 4 cites the same number. Those LCP figures are a headless SwiftShader
cold-cache artifact — `united-carriers` reported 71,044 ms desktop against 368 ms mobile *in the
same run*, which cannot be a property of the site. The remaining runs were told to read manifest LCP
as an asset-weight signal only. **Performance and the developer average are therefore not comparable
between the two arms**, and `white-desert`'s Usability carries one artifact-driven cap. The public
axes are otherwise unaffected, and the Usability finding holds without walk 4 because every site's
binding cap came from walk 1 or walk 3.

This is itself a defect worth fixing: the jury is handed a number that looks like a field LCP and is
not. Tracked for Phase 4 in `todo.md`.

### The generic fixture was broken, and is now fixed

The seventh run reported the fixture rendering nothing: `evals/jury-generic-saas/fixture/main.js`
set `opacity: 0` inline on every `section` and `.card`, then added a class `in` that `styles.css`
never defined and that could not have beaten an inline style anyway. All five desktop frames were
the same empty rectangle, so the case was grading blankness rather than the "template-grade SaaS
page" its own description names. Fixed in `0e44624`, re-captured, and re-juried: **4.70,
`rebuild`** — under the 6.5 bar and not `ship`, with a page that now actually renders. The
broken-fixture score of 1.95 is kept in the table above only as the before-reading.

## Eval runs

| Run | Command | Date | CLI | Result | Cost |
|---|---|---|---|---|---|

## Phase 8 — end-to-end build

| Artefact | Present | Note |
|---|---|---|
