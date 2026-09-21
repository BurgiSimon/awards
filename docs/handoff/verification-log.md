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
| 5 | `mindmarket` | https://mindmarket.com/ | https://www.awwwards.com/sites/mindmarket | 2026-09-18 | 200 | 0 | native | 7.85 (D 8.09 · U 7.48 · C 7.95 · Co 7.75 · DEV 7.55) | low-medium → high | **done** |
| 6 | `lando-norris` | https://landonorris.com/ | https://www.awwwards.com/sites/lando-norris | 2026-09-18 | 200 | 0 | native | 8.18 (D 8.12 · U 7.90 · C 8.71 · Co 8.18 · DEV 7.58) | high → high (live + entry) | **done** |
| 7 | `lama-lama` | https://lamalama.com/ | `/sites/lama-lama-2` (live) · `/lama-lama` is the 2021 .nl site | 2026-09-18 | 200 | 0 | wheel (virtual float) | 7.51 (D 7.64 · U 7.36 · C 7.52 · Co 7.39 · DEV 7.37) | medium → high | **done** |
| 8 | `trevor-noah` | https://www.trevornoah.com/ | https://www.awwwards.com/sites/trevor-noah | 2026-09-18 | 200 | 0 | native | 7.45 (D 7.38 · U 7.32 · C 7.78 · Co 7.40 · DEV 7.23) | medium → high | **done** |
| 9 | `animejs` | https://animejs.com/ | https://www.awwwards.com/sites/anime-js | 2026-09-18 | 200 | 0 | native | 7.62 (D 7.63 · U 7.51 · C 7.75 · Co 7.63 · DEV 7.84) | high (repo) / low (site) → high (live + entry) | **done** |
| 10 | `son-daven` | https://sondaven.com/en | https://www.awwwards.com/sites/son-daven | 2026-09-18 | 200 | 2 | native | 7.62 (D 7.70 · U 7.16 · C 8.15 · Co 7.59 · DEV 8.09) | high → high | **done** |
| 11 | `why-zero` | https://why.zero.university/ | https://www.awwwards.com/sites/why-zero | 2026-09-18 | 200 | 0 | wheel — gate never passed | 7.73 (D 7.70 · U 7.46 · C 8.16 · Co 7.75 · DEV 7.26) | medium-high → high | **done** |
| 12 | `leo-parpeix` | https://www.leoparpeix.com/ | https://www.awwwards.com/sites/leo-parpeix-portfolio-2026 | 2026-09-18 | 200 | 0 | native | 7.69 (D 7.79 · U 7.34 · C 8.04 · Co 7.63 · DEV 7.47) | medium-high → high | **done** |
| 13 | `floema` | https://floema.com/en | https://www.awwwards.com/sites/floema | 2026-09-18 | 200 | 2 | native | 7.65 (D 7.77 · U 7.38 · C 7.82 · Co 7.64 · DEV 7.67) | high (clone) → high (live) | **done** |
| 14 | `slosh-seltzer` | https://sloshseltzer.com/ | https://www.awwwards.com/sites/slosh-seltzer | 2026-09-18 | 200 | 0 | wheel — WebGL gate redirected | 7.69 (D 7.60 · U 7.34 · C 8.30 · Co 7.87 · DEV 7.45) | medium-high → medium-high | **done** |
| 15 | `igloo` | https://www.igloo.inc/ | https://www.awwwards.com/sites/igloo-inc | 2026-09-18 | 200 | 0 | wheel (virtual float) | 7.92 (D 8.05 · U 7.50 · C 8.31 · Co 7.91 · DEV 7.66) | high → high (live) | **done** |
| 16 | `shopify-editions-w26` | https://www.shopify.com/editions/winter2026 | https://www.awwwards.com/sites/the-renaissance-edition | 2026-09-18 | 200 | 2 | native | 7.92 (D 8.03 · U 7.51 · C 8.24 · Co 8.09 · DEV 8.05) | medium → high | **done** |
| 17 | `oryzo` | https://oryzo.ai/ | https://www.awwwards.com/sites/oryzo-ai | 2026-09-18 | 200 | 0 | native | 7.86 (D 7.90 · U 7.51 · C 8.35 · Co 7.76 · DEV 7.87) | medium-high → high | **done** |
| 18 | `usavionix` | https://www.usavionix.com/ | https://www.awwwards.com/sites/usavionix | 2026-09-18 | 200 | 2 | native | 7.41 (D 7.38 · U 7.03 · C 8.00 · Co 7.47 · DEV 7.74) | medium → high | **done** |
| 19 | `the-line` | https://thelinestudio.com/ | https://www.awwwards.com/sites/thelinestudio-com | 2026-09-18 | 200 | 0 | native | 7.76 (D 8.02 · U 7.40 · C 7.78 · Co 7.77 · DEV 7.76) | high → very high | **done** |

### Phase 3 outcome — 19 / 19 done

Every card was rendered live, its source read, and its award entry read from the entry page. What
the pass found is not a scatter of small errors but four repeating kinds:

**1. Cards written from someone else's code — four of nineteen.** `mindmarket` (a practice clone),
`animejs` (the library's own `examples/`), `leo-parpeix` (an educational clone) and `the-line` (a
third-party React rebuild). These were the most damaging, because clone code reads as evidence: it
produced exact-looking parameters — a 128² FBO, dissipation .96, chromatic aberration ±.001, a
six-value flicker ladder — that the shipped sites match on no value. `floema` was worse still: the
card described **a different company**, and the slug had to be split (see that commit).

**2. Award claims the entry does not carry — nine of nineteen.** `son-daven`, `why-zero`,
`slosh-seltzer`, `usavionix`, `shopify-editions-w26`, `the-line`, `lama-lama`, `igloo` and
`trevor-noah` each claimed a Site of the Month, a Site of the Year, an Honorable Mention or a
Developer Award **badge** that is absent from the entry page. The root cause is one mistake repeated:
every entry publishes a `DEV AWARD` **score** panel beside its `SOTD / SCORE` panel, and an earlier
search-extraction batch read that as a badge. Dates were a day or a year out on five cards.

**3. Techniques the corpus taught on the authority of sites that do not use them.** Three had to be
retired outright: ScrollTrigger `pin:` (no corpus card uses it — `son-daven` and `lando-norris` both
ship CSS sticky), the absolute-canvas scroll sync (`oryzo` ships a fixed canvas tethered by DOM
rects), and depth-map 2.5D parallax (`shopify-editions-w26` ships Blender glTF; `trevor-noah`'s
"planes" are DOM). Also gone: lando's width-keyed texture tiering, why-zero's hexagonal text-blur
shader, and the "bloom wants a high luminance threshold" rule of thumb, which igloo inverts at .2
and 0.

**4. What survived, and is now first-party.** MSDF type is confirmed twice (`igloo`'s KTX2 atlas in a
named worker, `lando-norris`'s two atlases), which matters because Phase 6 has to write that recipe.
The Line's never-`pin` sticky rail is confirmed in its own bundle. `seasats`' canvas frame sequences,
`mindmarket`'s three recipe citations and `slosh-seltzer`'s RTT composite all hold — and slosh gave
the RTT recipe a better idea than it had, feeding the liquid target *into* the transition shader.

**Two sites could not be rendered at all** by headless SwiftShader, and both say so on their cards
rather than describing frames they did not see: `why-zero` gates on a pointer-drag ring that
`--wheel` cannot complete, and `slosh-seltzer` fails its own WebGL check and redirects to an
apology page. `slosh-seltzer` is the one card that did **not** reach high confidence for that reason.

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

### Usage limit, 2026-09-18

The account's monthly spend limit terminated the `animejs` and `son-daven` card agents mid-run and
reset shortly after. `animejs` had finished writing its card but never reported, so its card was
inspected directly (nine sections, 47 labelled claims, a complete §9) and committed with its index
row derived from its own header table. `son-daven` had written nothing and was relaunched from
scratch. No other work was lost: the capture batch is a shell job and kept running throughout.

## Phase 5b — the smoke tier now covers every skill

Six cases added, so the eleven triggering cases are one per skill and no skill is graded only by a
sibling's regex. `trigger-structure`, `trigger-concept` and `trigger-ship` each quote the phrasing
its skill description claims ("what sections should this have", "how would an award-winning studio
approach this", "make it production-ready: run the audit, take the screenshots") without naming a
skill, which is what makes a miss in 5c a wording defect rather than a prompt accident.
`trigger-ship` carries the only new fixture: the bicycle-workshop site from `trigger-motion` plus a
filled `AWARDS.md` whose jury log already reads `fix`, because `ship` is described as a skill for a
project that has one.

The three new negatives are chosen against the descriptions that reach furthest. `structure` and
`ship` both name accessibility, so `no-trigger-a11y-settings` asks for exactly that on an internal
settings form; `system` and `structure` both name tokens and page architecture, so
`no-trigger-figma-tailwind` asks for a signed-off frame translated as drawn; and
`no-trigger-crud-admin` covers the admin CRUD that three descriptions explicitly disclaim.

Smoke is now 17 cases: 11 triggering, 6 negative. Graders unchanged in kind — `tool_used: Skill`
with the `awards:` prefix optional, `min: 0 max: 0 arm: both` on the negatives.

## Eval runs

| Run | Command | Date | CLI | Result | Cost |
|---|---|---|---|---|---|
| smoke, cheap pass | `--tag smoke --runs 1 --ablation none -j 3 --threshold 0.67` | 2026-09-18 | 2.1.51 | **15 / 17**, misses `trigger-motion` and `trigger-component-nav` | $9.20 |
| rerun, `--case trigger-motion` | `--runs 1 --ablation none --keep-temp` | 2026-09-18 | 2.1.51 | pass, skill called 1× | included below |
| rerun, `--case trigger-component-nav` | `--runs 1 --ablation none --keep-temp` | 2026-09-18 | 2.1.51 | pass, skill called 1× | $0.68 both |

### Phase 5c — what the two misses turned out to be

All six new cases passed on their first run, including the three new triggers, and all six negatives
held. The two misses are both pre-existing fixture cases, and both pass when rerun on their own, so
the defect is not the wording the plan told me to fix first: `motion`'s description already carries
the failing prompt's own phrase ("fix animation that feels generic, janky or fade-up-everything")
and `component`'s already carries "add a menu / cursor / marquee like the creative studios do".
Neither description is near the 1,536-character cap, so there is nothing to buy by adding more.

What both failing runs share is that the agent spent its whole turn budget reading the fixture and
then answered from what it had read. That is a sampling outcome, not a routing rule, and the honest
fix is in the measurement rather than in the case: **the smoke tier needs more than one run per
case.** `--runs 1 --threshold 0.67` — the command the plan specifies — cannot apply a 0.67 threshold
to a single sample, so one miss flips a case from 1.00 to 0.00. The tier is scheduled to run again
in Phase 7 with the baseline arm; it runs at `--runs 3` there, where a 2-of-3 pass is what 0.67
actually means. The graders were left alone: they assert the skill fired, which is the whole point
of the case.

Cost note: the run reported `cost ceiling $8 exceeded: $9.20 spent by runs already in flight when it
was crossed; nothing was skipped`. The ceiling is checked before a run launches, so three concurrent
runs can overshoot it; `-j 3` and a tight ceiling do not combine.

**Correction, written 2026-09-21.** The reading above — "a sampling outcome, not a routing rule" —
was wrong, and the full run in Phase 7 disproved it. `trigger-motion` and `trigger-component-nav`
were failing because `context.add_dirs` grants a read on a directory *inside the case* and puts
nothing in the working directory, so the fixture the prompt names was never there. Three of the five
fixture cases passed anyway, because their prompts route on the request itself before the missing
files matter, which is what kept it invisible. Fixed in `2dfa1e3`; the paragraph above is kept as
the before-reading.


## Phase 6 — the two missing recipes

Both P2 rows in the catalogue now ship, and `lint-refs` is at **0 dangling references** for the
first time (it was 8, all of them these two recipes being cited by files that described them as
planned). Every such citation was rewritten to the present tense, including the three that called
them "planned" or "deferred".

| Recipe | Checks | Dependencies | Note |
|---|---|---|---|
| `sound-toggle-opt-in` | 9 / 9 | none | no audio file: the bed is two detuned sines under filtered noise, synthesised at the levels the corpus publishes |
| `gl-msdf-text` | 8 / 8 | `three` | no font file: the atlas is rasterised and distance-transformed in the page |

Two things worth keeping from the second one.

**A verify that passed a page that was visibly broken.** `gl-msdf-text` passed 8/8 on its first run
while rendering the headline as a solid black slab with glyph-shaped holes. The assertion asked
whether `readPixels` found ink inside the text rect; a fully opaque quad answers yes. The screenshot
is what caught it. The assertion now asks for an ink fraction between 0.08 and 0.45 — what a line of
text actually covers — and would have failed the slab at 0.83. The general lesson for this
repository: an existence check on a render proves almost nothing, and every recipe screenshot in
`recipes/_verify/` is worth a look before believing a PASS.

**The defect under it was real and is documented.** Instrumenting the shader channel by channel
showed the field, the layout and the UVs were all correct: `fwidth(d)` is exactly zero wherever the
distance field has saturated, which is most of a padded atlas, and `d / 0.0` came back as something
`clamp` resolved to 1 — every flat pixel opaque. The divisor now carries a floor, and the rule is in
`CLAUDE.md` with the other conventions that bite, because any distance-field shader in this plugin
will hit it.

`node scripts/audit.mjs recipes` stays at 0 P0–P2 findings with both recipes in.

## Phase 7 — evals, expensive half

**Step 1, the full smoke tier with the baseline arm, ran on 2026-09-18 and was never written down
until 2026-09-21.** `evals/results/smoke-full.json`, 91 KB: 17 cases × 3 runs × 2 arms, CLI 2.1.276,
49.2 minutes, **$36.22**, `partial: false`. Result **13 / 17 cases passed**, overall score 0.86,
mean delta over the no-plugin baseline **+0.48**. The per-case table now lives in
`evals/README.md` under "Last run".

Against the plan's pass bar:

| Bar | Result |
|---|---|
| every trigger case fires in ≥ 2 of 3 runs | **not met** — `trigger-motion` 0/3, `trigger-component-nav` 1/3 |
| every no-trigger case clean 3 of 3 on both arms | **met**, all six |
| plugin arm beats baseline on the jury case's scored graders | **met** — `disposition-line` 3/3 with, 0/3 without |

Both root causes were found and fixed after the run, and both were defects in the harness rather
than in the skills:

1. `context.add_dirs` grants a read-only copy inside the case and stages nothing in the working
   directory, so five cases named a `fixture/` their agent never had. `2dfa1e3` gives each a
   `fixture.sh`. The diagnostic evidence is in the kept sandboxes behind
   `rerun2-trigger-motion.json` (1/3) and `rerun2-trigger-component-nav.json` (0/3), both run
   *before* that fix.
2. The forked jury reply was only ever required to carry the disposition, the weighted score and
   the three fixes — the axes appear in the `AWARDS.md` log line as D / U / C / Co, so a compliant
   reply could omit the word "Usability" entirely. `b49d6a2` puts the axes in the contract.

**What is still owed on Phase 7:**

- ~~Re-run `trigger-motion`, `trigger-component-nav` and `trigger-jury` against the fixes.~~
  **Done 2026-09-21**, see below.
- ~~The build tier has **never run**.~~ **Ran 2026-09-21**, see below.

### The build tier, first run ever, 2026-09-21

`--tag build --scaffold --runs 1 --ablation none -j 2 --keep-temp --max-cost-usd 45` plus the
documented `--allow-tools` set. CLI 2.1.278, 33.2 minutes, **$27.68**, `partial: false`. **2 / 6
cases all-green, 36 of 41 graders passed**, overall score 0.86. Per-case table in
`evals/README.md`.

The tier's real purpose was to test the graders in the passing direction, which `selftest.mjs`
cannot do. That answer is good: 36 of 41 pass, and every skill fired 1× in every case. Of the six
failures, **four are grader defects, one is a timeout, and one is a genuine gap in a skill** — and
the skill was arguably right.

1. `jury-generic-saas/scores-present` looks for `x/10` or a table cell `| x |`. The skill's own
   reply format is `Design 3.5 · Usability 3.0 · Creativity 2.5 · Content 2.5` followed by
   `Weighted 3.05`, which is exactly what the run produced. The grader was written against a format
   the skill never specified.
2. `jury-generic-saas/fixes-ordered-and-specific` failed 3 / 3 judge votes. The reply carries three
   ordered fixes, each with a file and line, and names six of the eight anti-patterns the grader
   lists — but in its "why the creativity score is that low" paragraph rather than inside the
   numbered list the judge is told to read. Boundary case; the grader's PASS condition needs to say
   where it will look.
3. `motion-pass-fadeup/pin-kept` greps `main.js` for `data-pin|frame-stage`. The rewrite kept the
   pinned stage and moved it to CSS sticky on purpose — the new `main.js` says
   `// 04 The build — the pinned frame. Kept as a CSS sticky stage on a tall transparent rail (no
   pin spacers)` and asserts `pinned: … // 0: the hold is CSS sticky`, while the markers now live in
   `index.html` and `styles.css`. That is consistent with this repo's own finding that no corpus
   card uses ScrollTrigger pin. The guard cannot tell a deleted stage from a relocated one.
4. `build-antarctic-site/final-report-honest` had nothing to judge: the run **timed out after
   1800 s** at 122 turns and $15.68, more than half the tier's total cost. The other nine graders
   passed. The full craft chain does not fit the case's timeout.
5. `research-unreachable/card-written` is the one worth arguing about. The agent refused to write a
   card for `example-studio.tld`, a placeholder that does not resolve, on the grounds that a phantom
   neighbour in `_index.md` is worse for the user than no card — and its `confidence-labels` and
   `unreachable-stated` graders both passed on that refusal. The skill's unreachable path assumes a
   real site that is temporarily down; it has no branch for a host that does not exist. **Skill
   gap, and the behaviour under it was better than the grader's expectation.**

**The tier never executed a single plugin script.** Bash was denied on every call in every case:
`--allow-tools "Bash(node *)"` matches on the command prefix, and the skills invoke
`timeout 120 node …`, `cd … && …` and `node … | head -200`. So `capture.mjs` and `audit.mjs` never
ran, no grader here has been tested against a rendered page or a real audit, and the tier currently
measures written output only. The grant list in this plan and in `evals/README.md` needs fixing
before the next run.

Committed fixtures were clean afterwards: `git status -- plugins/awards/evals` empty.

#### Fixed and verified, 2026-09-21

The grant list and the three grader defects are repaired. Two verification runs of
`jury-generic-saas` ($1.65 then $1.52) took the case from **0.67 → 0.83 → 1.00, 6 / 6 graders**.

- **The grant.** `--allow-tools Write Edit WebFetch Bash`, granted whole, in `evals/README.md`,
  `CLAUDE.md` and this plan. Confirmed: every Bash call ran, `audit.mjs` produced a real
  `P0 1 · P1 5 · P2 8 · P3 6`, and `capture.mjs` ran and exited 3 because Playwright is absent from
  the sandbox — the documented path, not a denial. The plugin has now executed its own scripts
  inside an eval for the first time. The OS sandbox still confines the shell to the case workspace,
  and `--scaffold` already ran author bash as the user, so the widening is smaller than it looks.
- **`scores-present`** now matches the format the skill promises at `skills/jury/SKILL.md:152`.
- **`pin-kept`** reads `index.html`. Verified without another run by replaying the 2026-09-18 trace's
  write and four edits to that file: the marker survives, so the retargeted guard passes on the run
  it previously failed. `selftest.mjs` reports `guard holds on index.html`.

**Correction to finding 2 above, same day.** The first diagnosis — that the judge reads only the
numbered list — was wrong, and the first repair (telling it to look anywhere) did not move the
verdict: still FAIL, FAIL, FAIL. The real cause is the grader's own closing clause, *"FAIL if the
reply ... proposes a redesign instead of a fix list"*. On this fixture the jury correctly lands in
rebuild territory and names direction work as fix #1, and `skills/jury/SKILL.md:190` routes
`rebuild` back to `awards:concept` — so the clause was failing the behaviour the skill documents.
The grader is rewritten against the contract and keeps its teeth: praise, scores without reasons,
and fixes with no location all still FAIL. The reasoning is in the grader file so the change can be
judged as principled rather than fitted to turn a test green.

### The three repairs, verified 2026-09-21

`--case <name> --runs 3 --ablation none --scaffold --no-publish --trust-plugin -j 1`, serially, CLI
2.1.278 (the tier ran on 2.1.276), **$6.64** for nine runs — three times the ≈ $2 estimated above.

| Case | Before | After | Graders |
|---|---|---|---|
| `trigger-motion` | 0 / 3 | **3 / 3** | `skill-fired` P P P, 9–14 turns |
| `trigger-component-nav` | 1 / 3 | **3 / 3** | `skill-fired` P P P, 9–15 turns |
| `trigger-jury` | fired 3 / 3, `usability-axis` 1 / 3 | **3 / 3** | `disposition-line`, `skill-fired`, `usability-axis` all P in all three runs, 2–4 turns |

Both diagnoses hold. The fixture cases now take 9–15 turns where the failing runs took 7–9 and
answered from an empty directory; `trigger-jury` names the Usability axis in every run now that the
reply contract requires the four axes.

With `trigger-webgl-hero` at 3 / 3 on 2026-09-18, all four failures of the tier run are repaired and
measured. **Every Phase 7 pass bar is met for the smoke tier.** The caveat worth keeping: the
repairs were measured case by case on the plugin arm, not by re-running the whole tier in one pass.

**What the baseline arm actually bought, now measured rather than argued.** Every `skill-fired`
grader scored 0 in the `without` arm, which it must: the plugin is not loaded, so the skill cannot
be called. All six negatives pass there trivially for the same reason. The single informative
comparison in 102 runs was `trigger-jury`, where the baseline named the Usability axis 3/3 and
produced the `disposition:` line 0/3. Half the tier's cost buys that one row; `--ablation none` is
the honest default for iteration.

## Phase 8 — end-to-end build, 2026-09-21

Scratch project at `/tmp/awards-phase8`, outside the repo, with the real environment the eval
sandbox could not give: node 24.21, npm 11.19 on `PATH`, the Playwright cache reachable through
`AWARDS_PLAYWRIGHT`, network up. **129 turns, 42.8 minutes, $23.89 of a $25 budget, exit 0.**

### The plan's own command does not work, and attempt 1 proved it

`--permission-mode acceptEdits` auto-approves edits and nothing else. Under `-p` there is nobody to
approve anything else, so the **Skill tool itself was denied**: the trace shows exactly two attempts,
`awards:craft` and `awards:concept`, each coming back as a bare `Execute skill: awards:craft` error.
Bash was denied for the same reason — no `npm install`, no build, no capture. The agent gave up on
the plugin and, in its own words, "ran the phase structure by hand instead", producing a plausible
27-file site for $7.72 that tested nothing. Kept at `/tmp/awards-phase8-attempt1`.

The skill name resolved rather than erroring as unknown, so `--plugin-dir` had loaded the plugin;
the block was permission, not discovery. The fix is `--allowedTools Skill Bash Write Edit Read Glob
Grep WebFetch` — the grant the case's own `prompt.md` frontmatter already declares. Corrected in
`plan-0.2.md`.

### Attempt 2: the whole chain ran

Eight skill calls, no errors: `craft` → `concept` → `system` → `structure` → `stack` → `motion` →
`jury` → `jury --verdict`. `webgl` was declined at rung *none* by the skill's own ladder, which is a
decision the chain is supposed to be able to make.

| Check (from the plan) | Result |
|---|---|
| `AWARDS.md` contract blocks | all present |
| three real `[site:…]` cards | five cited: `white-desert`, `seasats`, `oryzo`, `son-daven`, `lando-norris` |
| direction seed recorded | `SEED shck92in247c · DEALT 1 5 7 of 7 · LEAD 1` |
| `DESIGN.md`, `src/styles/tokens.css` | both present |
| `npm run build` | passed — `dist/` with hashed assets, entry JS 55.4 KB gz |
| `audit.mjs <dir>` 0 P0–P1 | **re-run independently: 15 files, P0 0 · P1 0 · P2 0 · P3 0, clean** |
| captures: desktop, mobile, reduced motion | 18 PNGs across `desktop`, `mobile`, `desktop-rm`; manifest has all three, 0 console errors, 0 page errors |
| `.awards/jury/<date>.md` | present, plus `-verdict.md` from the second round |
| ship report | `.awards/ship/2026-09-21.md` |

### Risk 2 is resolved

`plan.md` §14 risk 2 asked whether the forked jury's literal `disposition:` line survives the relay
back to the user. **It does.** The final message opens with it quoted verbatim:

```
disposition: fix
Design 7.6 · Usability 7.9 · Creativity 8.1 · Content 7.5 — weighted 7.78
```

The documented fallback in `skills/craft/SKILL.md` — spawning `awards-jury` through the Agent tool —
is therefore not needed and can stay where it is as insurance.

Two rounds ran: 7.50 `fix`, then 7.78 `fix` after an eight-item batch, the second inside the corpus
band of 7.28–8.18. The verdict held at `fix` on the contract rule rather than on the scores, and the
two-round cap stopped a third, which is the mechanism behaving as written.

### The LCP rename is working in the field

The jury report, unprompted: *"The manifest's `lcpColdSynthetic` (152 ms desktop vs 3,680 ms mobile)
is a headless cold-cache software-GL number, read here only as a rough asset-weight signal — the
byte counts are the real evidence."* The two-orders-of-magnitude artefact appeared again in this
run's own manifest (144 ms desktop, 3,588 ms mobile) and this time nothing scored performance from
it. The ship report labels its row *"LCP (headless, cold, synthetic) … not a field metric"*.

### One real defect found, and fixed the same day

`dist/fonts/.awards/audit.json` shipped into the build output. `scripts/audit.mjs:55` takes
`projectDir` from `CLAUDE_PROJECT_DIR` or **`process.cwd()`**, and line 394 writes
`<projectDir>/.awards/audit.json`. The run audited the project from inside `public/fonts`, so the
report was written to `public/fonts/.awards/` — under `public/`, which Vite copies verbatim into
`dist/`. The report names the project root as its `target` while landing somewhere else entirely.
Any project that audits a subdirectory of `public/` ships an internal report.

**The cwd assumption cost more than the report path.** `## Exceptions` is read from
`projectDir/AWARDS.md` as well, so the same run silently lost every signed-off exception — an audit
from a subdirectory would re-raise findings the project had already accepted. One helper fixes both:
`ownerOf()` walks up from the target to the nearest `AWARDS.md`, and `projectDir` is now
`CLAUDE_PROJECT_DIR` → that owner → `process.cwd()`, in that order.

Checked by reproducing the Phase 8 scenario and four regressions:

| Check | Result |
|---|---|
| audit the project root from inside `public/fonts` | report at the project root; **no `public/fonts/.awards`** |
| `## Exceptions` from the root `AWARDS.md` | `['C02']`, found from the subdirectory |
| `audit.mjs recipes` in this repo, which has no `AWARDS.md` | falls back to cwd, unchanged |
| hook on a file inside an awards project, `CLAUDE_PROJECT_DIR` unset | fires — it was cwd-dependent before, and is now measured from the changed file, which is what `CLAUDE.md` always claimed |
| hook on a file with no `AWARDS.md` above it | silent |
| `AWARDS_HOOK=0` | silent |
| URL target | unaffected |

### The two remaining build-tier findings, closed 2026-09-21

**`research` had no branch for a host that does not exist.** Its §3 covered a site that resolves and
cannot be read; the case's URL is `https://example-studio.tld`, and `.tld` is not a delegated
top-level domain, so it can never resolve. The skill now separates the two: a 403, consent wall,
timeout or `capture.mjs` exit 3/4 still gets a card with the labels dropped, while `ENOTFOUND`,
`NXDOMAIN` or a placeholder TLD gets **no card and no index row**, a statement of what was
established, and the one thing that would unblock it.

`card-written` was `file_exists` on `.awards/sites/*.md`, which cannot express "or a reasoned
refusal", and it failed the 2026-09-21 run for doing the right thing. It is now a trace regex
accepting either correct outcome, because the run cannot choose which situation it is in: with live
DNS the case always takes the refusal branch, inside a sandbox without DNS it can take the card one.

Verified twice, **4 / 4 graders, score 1.00, $0.57 for both runs**, and the second kept its trace to
confirm *which* branch fired: no file was written, and the reply names the distinction the skill now
draws. It also reasoned past what the branch asks for — the sandbox blocks outbound DNS, so
`example.com` fails too, which makes the network evidence inconclusive; it settled the question on
the placeholder TLD instead of on the failed lookup. Turns fell from 10 to 6, the skill no longer
having to derive the rule.

**`build-antarctic-site` timed out at 1800 s.** Set to **3600** from the measured Phase 8 run of the
same prompt, which took 129 turns and 2,567 s with the whole chain working — 1800 s was never
survivable. `max_turns: 150` is left alone, since 129 fits inside it. **This one is reasoned from a
measurement, not re-tested**: confirming it means paying for the case again, and it is the tier's
expensive one at $15.68 even when truncated.

### Build tier, second run 2026-09-21 — $41.43, 45.6 min, not partial

With `Bash` granted whole and four graders repaired: **4 / 6 cases all-green, 39 of 41 graders,
overall score 0.95**, against 2 / 6 and 36 / 41 the first time. Committed fixtures clean. The $55
ceiling was $10 more than needed — $45 would have held.

`build-antarctic-site` went from 0 to **10 / 10** at 153 turns and 2,737 s, which also settles the
timeout: the old 1800 s cap would have cut it off again, so the number raised from the Phase 8
measurement is now measured in the tier itself. `jury-generic-saas` and `research-unreachable`
confirmed their repairs inside the tier at 6 / 6 and 4 / 4.

Two graders failed that had passed the first time, both by luck of presentation rather than any
change in the plugin.

`motion-score-written` required the table directly beneath `## Motion score`; this run wrote a
sentence of rationale first. Loosened to allow prose while refusing to cross into the next `##`
section, checked three ways before applying — the template still fails, this run's file passes, and
a filled table further down cannot rescue an empty section. Re-run at **7 / 7**.

**`scope-respected` is the finding worth keeping.** It failed 3 / 3 twice on runs that changed
nothing outside the nav — a diff of the first against the fixture showed the hero, work grid and
footer byte-identical. The judges were right to refuse: the evidence an llm grader gets for
`focus: trace` is **truncated to about 25 lines**, 25 for a 44-turn run and 25 for a 51-turn one,
the last cut mid-object. What arrived held a single `Edit main.js` and none of the rest of the file
work, so three judges were asked to affirm something their evidence did not contain. Rewording it
changed nothing, which is the evidence that the first diagnosis was wrong. It is replaced by two
file guards, `hero-and-work-kept` and `footer-kept`, in `selftest.mjs`'s `GUARDS` set, holding on
the untouched fixture and passing on the exact run the judges failed. Its keyboard clauses were
already covered by `escape-closes`, `focus-management` and `overlay-accessible`.

Four of the six failures across both build runs came from a grader encoding how work is *presented*
rather than what it *is*: the shape of a score line, which file a marker sits in, whether a fix list
leads with direction work, whether a table follows its heading. Prefer a file target.

**The tier has not been re-measured since those last two repairs.** 39 / 41 predates them, and
`build-nav-component` now carries seven graders where it had six.

### Build tier, third run 2026-09-21 — $44.37, 53.3 min, not partial

**4 / 6 cases all-green, 40 of 42 graders, overall 0.96.** Both graders repaired after the second
run hold in the tier: `build-nav-component` **7 / 7** with the two file guards in place of the
truncated-evidence judge, and `motion-pass-fadeup` **7 / 7** with the loosened Motion score pattern.
`build-webgl-hero` and `research-unreachable` clean again. Committed fixtures clean.

Two failures, and they are different in kind from everything before them.

**`build-antarctic-site` ran out of turns, not time.** `exit 1: Reached maximum number of turns
(150)` at 151 turns and 3,198 s — inside the 3,600 s cap the last run earned it. Phase 8's real run
of the same prompt took 129 turns, the second tier run 153, this one 151. The ceiling raised last
time was the wrong one. `max_turns` is now **200**; the timeout stays at 3,600, which has never been
reached.

**`jury-generic-saas/scores-present` failed, and this time the skill is at fault, not the grader.**
The reply put its four axes in a `## Scores` markdown table and closed with the prose sentence
"**Disposition: recapture.**". It never emitted the line `skills/jury/SKILL.md` requires. The
grader is right to fail it: line 126 of that skill says the format exists so `awards:craft` and
`awards:ship` "can act on it without parsing prose", and a table defeats exactly that. Phase 8's
real run produced the correct form, so the skill can do it — the requirement was buried mid-sentence
in a long paragraph.

The contract is now a literal block the reply must end with, naming what it must not be (a table, a
prose sentence, a `## Scores` section), with everything else required to go above it. Note the
direction of this one: the earlier `scores-present` pattern — `x/10` or a table cell — would have
**passed** this reply. Tightening it to the contract is what exposed the drift.

**A correction to the two runs above.** They were recorded as "47 of 53" and "50 of 53" graders.
The tier has 41, and the real totals are 36 and 39. The wrong figures reached this ledger,
`evals/README.md`, `state.md` and `todo.md` before anyone added up the per-case numbers, and are
corrected throughout. Sum `evals/results/build-r*.json`; do not trust a total written in prose.

### The jury reply contract, sampled once 2026-09-21

`jury-generic-saas` at **6 / 6, $1.63** after the contract became a literal block. Run alone, because
the tier's $44 is $32 of `build-antarctic-site`, which tests the turn cap — arithmetic from three
measurements, not something a fourth sample settles.

**The graders passed and the contract still did not hold.** The shape is fixed: the reply carries
`disposition: recapture`, the four axes separated by `·`, the weighted score and three located
fixes, where the run before it wrote a `## Scores` table and closed in prose. That was the part that
mattered — a caller can parse this one and could not parse that one.

But the block sat **16 % into a 3,303-character reply** as a blockquote, with 2,764 characters of
prose after it, and the closing sentence "Relay these lines to the user unchanged" was missing
entirely. The skill said "as the last thing you write" and the reply led with it instead.

No grader catches that, because `scores-present` and `disposition-line` scan the whole message. The
honest reading is that "last" was stricter than the need: the requirement `awards:craft` and
`awards:ship` actually have is a block in a fixed shape, unbroken, that a regex can find — and
leading with the verdict reads better for a human than burying it under the reasoning. The skill now
asks for the block verbatim and unbroken, opening or closing the reply, and restores the closing
sentence, which had simply been dropped.

**That wording change is not sampled.** It was written after this run, and re-running to watch one
more sample of a wording tweak is not worth $1.63 of anyone's money without a reason.

### Tools still denied, neither blocking

`git init` (a compound command needing approval, so no phase-boundary commits — the run recorded it
as `NO-GIT`) and the Playwright **MCP** server's navigate tool. The run drove the live build through
the plugin's own Playwright instead, which is how its keyboard walk is evidenced rather than assumed.

### Old stub, kept for shape

| Artefact | Present | Note |
|---|---|---|

## The cold-LCP defect, fixed 2026-09-21

Phase 2 recorded it and Phase 4 did not close it: `capture.mjs` wrote a raw headless cold-cache
number into `manifest.metrics[label].lcp`, and the jury read it as a field LCP. It scored
Performance 3.5, 4.0 and 4.5 from that number on the first three calibration runs, and capped
`white-desert`'s Usability with it. The number cannot be a property of a site — `united-carriers`
reported **71,044 ms desktop against 368 ms mobile in the same run**.

Fixed by naming it, not by measuring twice: measuring twice would double the wall-clock cost of
every capture, and the problem was never precision, it was that the field claimed to be something
it is not.

| Change | File |
|---|---|
| `lcp` → `lcpColdSynthetic` in the manifest, with a comment at the source | `scripts/capture.mjs` |
| Performance must never be scored from it; what it is and what it is worth | `skills/jury/SKILL.md` |
| LCP row takes Lighthouse or a throttled trace, otherwise `not measured`; report line and checklist | `skills/ship/SKILL.md` |
| Named as a cold-cache artefact in the manifest table | `skills/research/SKILL.md` |
| Named as not a field LCP in the evidence table | `agents/awards-jury.md` |

Checked: `node --check` on the script, then a real capture of a local page — manifest written,
`"lcpColdSynthetic": 124`, `scrollMode: "native"`, exit 0. `lint-refs` 0 dangling,
`claude plugin validate` passes.

The fifteen site cards that disclaim "the manifest's LCP figures" by hand are left alone: they are
dated evidence records, and the sentences are now redundant rather than wrong.
