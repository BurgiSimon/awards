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
- **`shopify-editions-w26` and `the-line` entry slugs are still unresolved.** Five guesses 404
  (`shopify-editions`, `shopify-editions-winter-26`, `shopify-editions-winter-2026`, `the-line`,
  `the-line-studio`) and `awwwards.com/search/` is not a route. To be resolved with a web search in
  Phase 3.
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
| 1 | `united-carriers` | https://unitedcarriers.com/ | https://www.awwwards.com/sites/united-carriers | | | | | | medium-high → | todo |
| 2 | `white-desert` | https://white-desert.com/ | https://www.awwwards.com/sites/white-desert | | | | | | medium → | todo |
| 3 | `seasats` | https://www.seasats.com/ | https://www.awwwards.com/sites/seasats | | | | | | medium → | todo |
| 4 | `mont-fort` | https://mont-fort.com/ | https://www.awwwards.com/sites/montfort | | | | | | high → | todo |
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
| 16 | `shopify-editions-w26` | https://www.shopify.com/editions/winter2026 | search needed | | | | | | medium → | todo |
| 17 | `oryzo` | https://oryzo.ai/ | https://www.awwwards.com/sites/oryzo-ai | | | | | | medium-high → | todo |
| 18 | `usavionix` | https://www.usavionix.com/ | https://www.awwwards.com/sites/usavionix | | | | | | medium → | todo |
| 19 | `the-line` | https://thelinestudio.com/ | search needed | | | | | | high → | todo |

### Deltas

One subsection per site, filled after its pass: `field: old → new [evidence]`, plus any
technique attribution the live site contradicts and anything that stayed blocked.

## Calibration

Six sites plus the generic fixture, juried blind before any verified score reached a card or
`_index.md`. Deltas are jury minus the award entry.

| Site | Jury D | U | C | Co | Weighted | Dev | Entry D | U | C | Co | Overall | Dev | Disposition |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `united-carriers` | | | | | | | | | | | | | |
| `white-desert` | | | | | | | | | | | | | |
| `seasats` | | | | | | | | | | | | | |
| `mont-fort` | | | | | | | | | | | | | |
| `mindmarket` | | | | | | | | | | | | | |
| `lando-norris` | | | | | | | | | | | | | |
| generic fixture | | | | | | | — | — | — | — | — | — | must be < 6.5, not `ship` |

Decision taken: pending.

Residual contamination: the juror model may recall published scores for the most famous sites
(`lando-norris`, `igloo`). Blind packets forbid lookups but cannot erase recall; treat those two
rows as the weakest evidence in the table.

## Eval runs

| Run | Command | Date | CLI | Result | Cost |
|---|---|---|---|---|---|

## Phase 8 — end-to-end build

| Artefact | Present | Note |
|---|---|---|
