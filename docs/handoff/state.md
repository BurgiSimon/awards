# State of the awards plugin — 2026-10-23 (release 0.8.0)

Read this first, then `todo.md`. The visual composition candidate's deterministic verification is
recorded below in [Candidate verification record](#candidate-verification-record). `archive/plan-0.2.md` and
`verification-log.md` record the earlier 0.2.0 work. `archive/plan.md` is the 0.1.0 specification, kept for
reference. `decisions.md` records choices already taken.

## Recipe explorer (2026-10-26, unreleased)

- `recipes/index.html` is a generated explorer (`scripts/build-gallery.mjs`, called by `verify-recipes` and checked by check-sync) with its script, styles and committed frames in `recipes/_gallery/`; `scripts/gallery-frames.mjs` renders one 800 × 500 WebP per recipe from the 1440 × 900 desktop state the site's frame rule picks, plus a 15-column contact sheet (89 frames, 1.17 MB; sheet 103 KB). `recipes/vite.config.mjs` serves recipe text files to the explorer at `_gallery/src/` in dev and emits them at build.
- Checked: `audit.mjs recipes` P0–P2 0 (P3 358, one fewer than before); `audit.mjs <dev url> --render` P0–P3 0 at desktop, tablet and phone with axe-core; axe on the open stage, the code tab and the facet panel, light and dark, clean; dev and built `dist/` driven in headless Chromium (open, scrub, play-through, tabs, next, Escape, Back, deep links, random, hover-live, no-JS). Not checked: Safari and Firefox (view transitions fall back to instant changes), a real GPU.

## Release 0.8.0 (2026-10-23)

Review batches 1 to 5 and the rebuilt site (G1) ship together as 0.8.0; all three manifests agree. Release notes in `CHANGELOG.md`. No paid eval has run against it: `node evals/pick.mjs` lists the cases the changes need. Tag and GitHub release are the maintainer's.

## Review batches 3 to 5 (2026-10-22 to 2026-10-23, in 0.8.0)

- Ceiling, generation side: WORLD names an imagery strategy and the asset log (`scripts/assets.mjs`); house-style defaults removed; faces chosen character first through `scripts/fonts.mjs` (Fontsource search, a rendered specimen, licence on fetch; offline it falls back to the reflex-list alternatives); `references/patterns/negative-exemplars.md` with three captured failures; X21 (eyebrow labels by computed style) and P09 (images drawn above their natural size) under `--render`; A17 (viewport that locks zoom) static; A18 (a phone control under 44 × 44 px, rendered), added after the old site's jury capped Usability on targets the audit had passed. 89 rules.
- Composition: `references/patterns/layout-and-composition.md`, and a skeleton plus a measured fingerprint row for every card that allows it (55 skeletons; clone cards skipped). Corpus scripts: `build-index.mjs` writes `_index.md` from the card headers, `check-card.mjs` holds every card to `scripts/data/corpus-vocab.json`, `corpus-gaps.mjs`, `corpus-prepass.mjs`, `corpus-health.mjs` (`_health.json`). `[clone:slug]` is a citation form; lint-refs resolves it.
- Recipes: thirteen new entries (89 in all), each built alone in a clean worktree and passed with `verify-recipes --only <id> --pseudo` (text 40 % longer, then right to left on a phone). The catalogue table is generated from `recipe.json` (`build-catalogue.mjs`, groups and tags from `scripts/data/recipe-tags.json`); check-sync compares it. React adapters in ten core recipes (`adapters/react.jsx`) and a Webflow section in every core README; `check-adapters.mjs` parses them with Vite's Oxc transform, limits imports to the pinned libraries and requires `useGSAP` with GSAP. The adapters are parse-checked, not run inside a React app.
- Modes: `craft --quick`, `craft redesign <url|dir>` (baseline capture and a forked `jury --baseline`), `capture.mjs --routes` (one `routes.json`, a local site served once from its root), `jury --program` with `references/jury/programs.md` (CSSDA, FWA and Webby facts read 2026-10-22), `scripts/design-md.mjs` (Google's design.md CLI pinned at 0.4.0 through npx; `unmeasured` offline). The DESIGN.md template's frontmatter now passes that lint: dimensions are a number and a unit at the artboard, the `clamp()` stays in `tokens.css`.
- Checks on the head of the branch: check-sync 132 checks, 0 drift; lint-refs 0 dangling; selftest and the route-hint selftest pass; both validates; the recipes audit carries P3 only; check-adapters 10 adapters, 0 problems; behavior 34/34.
- The plugin's own site (`site/`), rebuilt from scratch in redesign mode (baseline: the wind-tunnel build, `fix` 7.44). The page is its own contact sheet: a sticky strip of frames `capture.mjs` shot of this page, with the jury's rings, crosses and arrows drawn on the frames its reports cite (`scripts/proof.mjs` writes `src/data/proof.json`; `scripts/recipe-frames.mjs` renders a frame per recipe). DOM-only. A component pass (7.97), three page rounds (ship 7.70, fix 7.71 when the marked state crowded the first screen, ship 7.88) and three ship passes; Shipped 2026-10-23, rendered audit P0–P3 0, throttled-capture LCP 1.23 s, CLS 0. Reports in `site/.awards/jury/` and `site/.awards/ship/`.
- What the build found in the plugin, all fixed: the DESIGN.md template's frontmatter failed design.md lint; the audit passed phone targets the jury's walk capped (A18, 89 rules); Vite 8.3.0 carried six dev-server advisories (pin 8.3.5); no build could tick Shipped once a verdict listed any craft seam (ship gate, `decisions.md`); a bare `capture.mjs --routes` captured a route named `true`. Noted, not changed: `gsap.matchMedia` made ScrollTrigger scroll the page to the top when the window crossed a breakpoint in this build (`site/` uses `gsap.context` with its own media listeners); unverified beyond this build.
- Not measured: no paid eval has run against batches 1 to 5 (`node evals/pick.mjs` lists the cases); the site's frame time on a real GPU (SwiftShader here: about 33 ms a frame at 1440 × 900 with the flow live).

## Review batches 1 and 2 (2026-10-22, in 0.8.0)

- Audit, rendered: a failed or hung step is an `ERR` finding (P1); a browser that will not launch exits 3; a bundler project renders `dist/`, `build/`, `out/` or `.output/public` and warns when it is stale or missing (`renderedFrom`). Three widths (1440, 834 × 1194, 390, touch on the two smaller), measured against `clientWidth` because phone emulation widens `innerWidth` to an overflowing page. New rules L09 blank viewport, L10 lopsided tablet/phone section (P3), P08 load-time layout shift (read before the scroll sweep). Scoped exceptions (`RULE@path|viewport`), `audit-ignore-next-line`, comments no longer satisfy M01 or count as exceptions, recipe severity only for the plugin's own catalogue. 85 rules.
- Two full URL sweeps of the 76 built recipes found five real defects, all fixed and re-verified: phone overflow in gl-depth-map-parallax (grid track) and preloader-counter-hold (image max-width), a blank tablet screen in clip-path-scrub-door, load shifts of 0.12 in blur-peek-snap-carousel (gap set by script) and 0.81 in gl-endless-reel-sheets (layout class set after load, now in the head). Only gl-endless-reel-sheets T08 remains, earned as before.
- Capture: tablet frames, `<viewport>-aria.yml`, session CLS, long tasks, blocking time and lab INP; `--timeline` (paused clock, identical frames across runs, contact sheet), `--video`, `--throttle`, `--gpu` (exit 5 on SwiftShader, as here), `--baseline` (in-browser pixel diff), `--lock`; relative `--out` resolves beside `AWARDS.md`; remote targets launch sandboxed where the host allows. `scripts/crux.mjs` for field data. Playwright 1.64.1's `page.screencast` path needs its own ffmpeg build, which this container lacks; 1.56 records through `recordVideo`.
- Upkeep: `check-versions.mjs` (first run: SvelteKit 3.1, motion 14.5, Taxi 2.0 and dotlottie 0.81 are majors ahead), the Node floor (22 LTS / 24 LTS; doctor checks every installed `engines.node`), `calibration.mjs` (usability lowest on 27 of 31 entries since 2021; Accessibility corpus maximum 7.60, Cartier 8.00 outside it). Playwright pinned in `recipes/`, stamping opt-in, `bun.lock` gone.
- Evals: contract, resume, coexist tiers; near misses; jury-bland-clean; `regrade.mjs`, `pick.mjs`; every new case loads under `--max-cost-usd 0`. The resume case's history format and the coexist cases' second plugin are accepted at load but unproven until a paid run.
- Platform and docs: descriptions trimmed to 7.4k characters; SubagentStop jury reply check; `userConfig` (`hooks_enabled`, `default_stack`); jury agent with Write, 45 turns, `omitClaudeMd`, narrow Bash and `awards-log.mjs`; research runs `policy.mjs` first; hand-offs from motion and webgl go back through craft's pre-jury checks; the deal fits four options; Windows spawns and a portable browser staging; dot-paths refused by the local server; icon and listing URLs; quick start, CHANGELOG.md, CONTRIBUTING.md, issue and PR templates; superseded plans archived.
- Behavior suite: 30/30 pass (2026-10-22), including the new checks for the rendered failures, build output, three widths, layout rules, timeline and baseline captures, the GPU refusal, scoped exceptions, dot-paths, owner policy, the log writer, the reply check and the capture lock. Two full rendered sweeps of the recipes, the Codex install check with both scaffold builds, and every free check pass.

## Evidence phase, first batch (2026-10-22, in 0.8.0)

- Contrast (A4, B6): rendered C01 measures every visible text against what is behind it (paint stack under its centre, or ancestors off screen, composited, colours through a canvas); imagery is unmeasured, blurred or ghosted (opacity < .25) and clipped text skipped, large text 3:1. A desktop Tab pass measures focused labels (C01, focus) and rings (A12, 3:1). The JSON reports texts measured, texts over imagery and focus stops per viewport.
- Developer criteria (C3, C4): the jury scores Awwwards' six criteria by name and their mean. New rules S07–S10 (title, description, OG text, canonical), A13 skip link, A14 targets (render, phone), A15 duplicate ids, A16 axe-core WCAG 2.2 A/AA (render; axe-core 4.14.0 pinned in recipes). 82 rules.
- Fixed on the way: a piped `--json` report over 64 KB was truncated (process.exit before stdout drained).
- Shared `--muted` lifted from a 55 % to a 62 % ink mix: the URL sweep found recipe labels at 4.25:1 on the ground; 62 % gives 5.24 (light), 5.99 (dark), 4.67 (accent). The six visual examples' labels are a shade darker than their reviewed captures.
- A first render sweep served each recipe folder alone, so `/assets/` 404'd and pages rendered unstyled; sweeps must serve `recipes/dist` once and audit by URL.
- URL sweep of all 76 built recipes, 2026-10-22 (1,222 texts measured on desktop): after the `--muted` fix it found the sticky-stack-cards numbers on the darker cards and the accent card (now each card's own ink), SplitText's `aria-label` on paragraphs in scroll-word-fill and split-text-masked-reveal (axe aria-prohibited-attr; now `aria: 'hidden'` plus a screen-reader-only copy, headings keep `auto`), and the gallery stage's unnamed-role label (now `role="group"`). Three audit refinements came from it: `aria-disabled` controls are exempt, a ring is judged against the paint stack where it is drawn, and clipped screen-reader copies count as hidden. Re-swept clean except gl-endless-reel-sheets T08, earned as before. verify-recipes passes the seven touched recipes.

## Release 0.7.0 (2026-10-22)

The quick wins and the second finish batch below ship together as 0.7.0; all three manifests agree. Release notes in `CHANGELOG.md`. Released without the paid gate run, by the maintainer's decision: `build-antarctic-site` has not run against 0.7.0.

Release checks, 2026-10-22, serial: both `claude plugin validate` pass; check-sync, lint-refs, grader selftest, route-hint, jury-evidence and visual-library self-checks pass; `audit.mjs recipes` has no P0–P2; `behavior.mjs` 20/20; `codex-install.mjs --build` (Codex CLI 0.163.0) finds 11 skills and no hooks and builds both scaffolds; the recipes build. Full `verify-recipes` not re-run for the release (the three changed recipes passed on 2026-10-22).

## Finish phase, second batch (branch `claude/relaxed-heisenberg-rszyzq`, 2026-10-22)

- Claims (D1, D2): every igloo, the-line and son-daven award statement now matches its card (Site of the Day, with scores); the Tailwind rule names the two winners that use it as a token layer.
- Route hint (B7): a build verb plus a new site routes to craft even when it names WebGL or GSAP; all eval prompts route as before.
- Taxi 2.0 (B8): `references/stacks/taxi-2.0.md`; both taxi recipes declare `initialLoad()` and pass on 1.9.1 and on 2.0.0 (scratch install), and fail on 2.0.0 without it. The pin stays 1.9.1.
- Tests: the grain-field glide is clock-timed (3 / 3 runs, glide end 0 px); `behavior.mjs` no-browser checks clear `NODE_PATH` (20/20 without manual env).
- Codex (E2): `"hooks": {}` in `.codex-plugin/plugin.json`; Codex 0.163 lists no awards hook (it listed three before; `[]` still lists three). `codex-install.mjs --build` passes with the new `hooks/list` check; `check-sync.mjs` (114 checks) guards it.
- Checks green: both validates, check-sync, lint-refs (625 files), route-hint selftest, behavior 20/20, audit `recipes` P0–P2 clean, verify-recipes for the three changed recipes, codex-install `--build` with Codex CLI 0.163.0. Paid evals not run.

## Quick wins (branch `claude/relaxed-heisenberg-rszyzq`, 2026-10-22)

- Source: the 2026-10-22 improvement review (top-15 items 1–5); open items in `todo.md`.
- Finish (B1–B3): `new-project.mjs --keep-existing` scaffolds around the files concept, system and structure already wrote; the stack skill runs it as `--name . --keep-existing`. Two page jury rounds (phase 7 and one verdict pass) plus at most two component passes, counted separately; verdict mode re-scores; component passes never touch `## Status`. Decisions recorded.
- Edit hook (B4, B5, B15): `lineOf` uses a newline index (a 1.2 MB stylesheet: 64 s → 0.55 s, identical findings on the recipes); hook-mode "handled anywhere" conditions read the whole project under the nearest `AWARDS.md`; the project root is the nearest `AWARDS.md`, bounded at `CLAUDE_PROJECT_DIR`.
- Compaction (E1): `SessionStart` on `compact` runs `scripts/state-card.mjs`, a state card while a Status line is open.
- CI (C1): `.github/workflows/checks.yml` and `scripts/check-sync.mjs` (113 checks, 0 drift).
- Checks green: both validates, check-sync, lint-refs (624 files), selftest 17/0 defective, route-hint, jury-evidence, visual-library, verify-layout, audit `recipes` P0–P2 clean (P3 79), recipes build, `behavior.mjs` 20/20 with `NODE_PATH` cleared (the two missing-Playwright checks resolve a global Playwright through `NODE_PATH` on this host; known, not new). Paid evals not run.

## Release 0.6.0 (2026-10-07)

The Now items, Ceiling and Finish gates below ship together as 0.6.0; all three manifests agree. Release notes in `CHANGELOG.md`.

Release checks, 2026-10-07, serial: both `claude plugin validate` pass; lint-refs, selftest, jury-evidence, visual-library and route-hint self-checks pass; `audit.mjs recipes` has no P0–P2; `behavior.mjs` passes; `codex-install.mjs --build` finds 11 skills and builds both scaffolds. `verify-recipes` passed 73/76 in one run. `gl-lathe-turned-object` and `gl-virtual-scroll-camera` passed when re-run alone. `gl-ping-pong-grain-field` is timing-flaky on this branch and on `main` alike: its reset glide sometimes ends 1–10 px short under SwiftShader (main 6/8, this branch 4/11 over interleaved runs). Its source is unchanged since 0.5.0.

## Finish gates (branch `feat/finish-gates`, 2026-10-07)

- Source: `analysis-2026-10-06.md` P07, P12, P13; plan: `docs/superpowers/plans/2026-10-07-finish-gates.md`.
- Hero probe (P07): structure builds the hero first on real tokens, captures s00 into `.awards/captures/hero-probe/` and judges it against the six first-viewport checks, the first-screen slop `judge` rows and the visual-composition frame; one fix batch; naming or memory failure returns to concept. Manifest path in Page map row 1; craft's after-structure check requires it.
- Early component jury (P12): after the static checkpoint craft runs `awards:jury <dir> --component <first-viewport selector>`, and once more after webgl when SIGNATURE is canvas or GL; stack and webgl hand-offs name it. Component passes count toward the two jury rounds; phase 7 always runs, so the verdict pass needs the user's request once the cap is used.
- Jury judges finish (P13): `## Material fixes` splits into floor (uncapped, mechanical) and craft (at most five, inside the contract); ship applies floor then craft and still never redesigns. Component mode names one scale, density or finish delta per DIVERGENCE card from §8. One `Ceiling:` line, reported only. Disposition and reply lines unchanged.
- Tooling: `capture.mjs` without `--hover`/`--states` adds desktop hover and focus-visible frames for the first three visible controls (`kind` `hover`/`focus-visible`, `element.matched`). Audit has 73 rules: render-only C05 (P2) compares body/html and a filled `main` with the DESIGN.md ground token, silent without one.
- Checks green: validate, lint-refs (622 files), selftest 17/0 defective, jury-evidence 5, visual-library 16, audit `recipes` P0–P2 clean (P3 79), `--render` on two built recipes C05-quiet, behavior 17/17, capture of `autoplay-tabs-progress` from the dist root: six control frames, all matched.
- Open: paid measures in `todo.md`.
- Eval sandbox, 2026-10-07: it now hides the user's home, npm and the network, so `evals/stage-browser.sh` stages `recipes/node_modules`, Playwright and its headless Chromium into the workspace (found by `scripts/lib/playwright.mjs` under `.awards/browsers/`). With it, `jury-generic-saas` scored 1.00 on real captures. `build-antarctic-site` was interrupted, skipped and not scored ($7.97); its partial build is in the untracked `site/demo/`.

## Ceiling (branch `feat/ceiling`, 2026-10-06)

- Source: `analysis-2026-10-06.md` P02, P03, P04; plan: `docs/superpowers/plans/2026-10-06-ceiling.md`.
- Layout (P04): concept names a third rut, the template skeleton; FIRST VIEWPORT takes copy, nav and action form from WORLD. Page map gains a `Layout` column; structure fills it (no adjacent repeat, four distinct on six or more chapters, split header only when the thesis needs it).
- Neighbours (P03, P02): system calibrates against the three DIVERGENCE cards' §3 and writes one `Calibration:` line per card in `DESIGN.md ## Overview`. §8 Take and concept takes need one compositional, typographic or structural move. The jury reuses or captures each neighbour into `.awards/neighbours/<slug>/` behind the capture lock and names one finish gap per card; ship never ships that folder.
- The six visual examples re-captured 2026-10-06; stale-screenshot notes removed.
- New graders `layout-column`, `calibration-cites-neighbour`. Checks green: validate, lint-refs (622 files), selftest 17/0 defective, visual-library 16, jury-evidence 5, audit `recipes` P0–P2 clean, verify-recipes 6/6, behavior 15/15.
- Open: see `todo.md` Ceiling follow-ups (card §8 hand-fixes, paid measures, demo masthead numbers).

## Now items (branch `feat/now-items`, 2026-10-06)

- Source: `analysis-2026-10-06.md`; plan: `docs/superpowers/plans/2026-10-06-now-items.md`.
- House style removed: scaffold `/ 01`, unconditional labels, fixed motion literals and display clamp (now derived from WORLD); scaffold copies `AWARDS.md`/`DESIGN.md` from `assets/templates/`; `--h2`/`--h3`/`--body` required.
- Structure offers all 13 archetypes; staple kit capped at two at recipe-default shape. `roll.mjs` picks LEAD at random among the dealt; no undealt fourth.
- Audit: L05 BEM-aware, X07 catches `/ 0N` and `No. 0N` (P2 under `recipes/`), Exceptions parse stops at the next `##`. 14 recipes cleaned and re-verified; audit `recipes` P0–P2 clean.
- `UserPromptSubmit` route hint (`scripts/route-hint.mjs`); new `route-full-tools-brief` eval and `jury-generic-saas/not-shipped` grader, both unpaid so far.
- Checks green: validate, lint-refs (620 files), selftest, behavior 15/15 (needs `AWARDS_PLAYWRIGHT`), verify-recipes 14/14, codex-install `--build`.
- Paid `--tag route` eval 2026-10-06 against `250e141`: 3 / 3 reached `awards:craft`, $6.23. No hint-off arm, so the hint's share of the lift is not isolated.

## 0.5.0 — deep modes (branch `feat/deep-modes`)

- Deep modes of existing skills: `motion --gsap`, `webgl --shader`, `webgl --3d`, recorded on the `Deep modes:` line of `AWARDS.md`, each loading a playbook in `references/patterns/` (`gsap-choreography`, `webgl-shaders`, `webgl-3d-scenes`). Skill count stays eleven. Spec: `docs/superpowers/specs/2026-10-05-deep-modes-design.md`; plan: `docs/superpowers/plans/2026-10-05-deep-modes.md`.
- Corpus wave 4 with a tech lens (`docs/handoff/corpus-ledger.md`): 13 added (12 new cards + the why-zero lens), 2 skipped by owner policy (ruitat, nyphil), 2 blocked by headless GPU (santionispirits, guillaumecolombel). Index 62 rows.
- 16 new recipes; catalogue 76/76 pass 2026-10-05; audit P0–P2 clean. Stack notes: playcanvas-2.23, matter-js-0.20, react-three-fiber-9.7, swiper-14.3.
- Three fixture-free `[smoke, deep]` eval cases; free checks green (validate, lint-refs, selftest). Paid evals: see todo.

## Previously unreleased — slop scan (branch `feat/no-slop`, shipped in 0.4.0)

- **Catalogue.** `references/anti-patterns.md` has a new section, `## The slop scan`. It groups the habits a generator falls into under eight headings, and each row names the audit rule that catches the habit, or `judge`, plus the earned version. impeccable's public slop catalogue was the checklist for which categories to cover; the prose and detectors are original.
- **Audit.** It grew from 55 to 72 rules.
  - Static rules: X09–X19 and T07.
  - Render-only rules: L06–L08, T08 and X20.
  - Widened rules: X01, X02, X06, X08, L04 and L05. The copy lists they read are in `scripts/data/reflex-copy.json`.
  - Helper: `lib/css.mjs` has a new `ruleBlocks()`.
- **Recipes.** They stay at P0 0 · P1 0 · P2 0 · P3 68. Four earned uses carry inline `audit-ignore` lines with their reasons:
  - `filmstrip-index-rows` X13
  - `word-cycle-hero` X13 and X14
  - `throw-objects-css3d` X09
- **Workflow.**
  - The jury writes a `## Slop scan` section and caps Creativity at 6 at two families.
  - craft runs a slop pass before the jury, and component runs one as Verify step 3.
  - ship requires `--render` when a browser exists.
  - system, motion and structure widen their audit scopes.
- **Tests.** `evals/behavior.mjs --only audit` covers every new static rule on a slop fixture, a clean control page and the five rendered rules. A negative render fixture keeps the earned shapes quiet.
- **Rendered rules against the built recipes.** An `audit.mjs --render` sweep of all 60 built recipes (`recipes/dist`, served by URL) is clean except for `gl-endless-reel-sheets` T08. That one is earned: when GL is on, the h1 is deliberately shrunk to a label.
  - Three false positives were fixed in the detectors:
    - L06 skips text under a canvas (the GL mirror).
    - L08 measures the text rather than the padded box.
    - T08 skips an h1 whose visual is an svg or img.
  - A render sweep must run the audit asynchronously. `execFileSync` blocks the process that serves the pages, and every audit hangs.

## 0.3.0 — visual composition library

Version **0.3.0** synchronizes the Claude, Codex and marketplace manifests. The
[release notes](../../CHANGELOG.md) describe the implementation and measured limits; the
frozen comparison below remains a failed acceptance result, with no claim of library causality.

The catalogue has **35 focused recipes plus one complete composition, 36 verifiable entries**.
Five native visual recipes, their composed page and the
[visual composition guide](../../plugins/awards/references/patterns/visual-composition.md) are in
the candidate. Alder Workshop, its specifications and imagery are synthetic demonstration material.
The published images have been reviewed and browser-tested. Human preferences for the three paired
builds are recorded below; preference for the library examples themselves has not been measured.
The eleven skills and 23 existing eval cases (17 smoke, 6 build) remain in place. The three-brief
manual visual benchmark is separate from those cases.

The six new entries pass **6/6 across 38 states and 409 checks**. The compatibility pass in a
temporary plugin copy covers **36/36 entries, 194 states and 931 checks** on headless Chromium
153.0.8010.12, with a fresh browser for each entry and serial execution. Two attempts using one
browser for all entries aborted during browser-context teardown; one also had a timing-sensitive
`gl-virtual-scroll-camera` idle-snap assertion at 0.363. That recipe passed its eight states in an
isolated fresh-browser run. This is complete isolated serial coverage, not a successful monolithic
browser session. Headless SwiftShader says nothing about real-device performance.

Behavior checks pass 11/11; jury-evidence self-check passes 5 assertions; the frozen candidate's
visual-library self-check passed 15 fixtures; grader self-test has 14 file-target checks, zero defective
and two known missing fixture skips; reference lint scans 380 files with zero dangling references. Both
manifests validate.
An isolated Codex installation discovers all eleven skills and builds both scaffold variants. Static
audits of the six entries and shared composition assets have no P0/P1 findings; per-directory
shared-import warnings and intentional demo exceptions are explained below. The controller froze candidate `ae29ca62b73b3a24ad0c246bdee6ee25687d6e48` for Task 12;
its unchanged plugin archive is recorded in the comparison report below.

## Post-pilot review corrections

After the frozen `ae29ca62b73b3a24ad0c246bdee6ee25687d6e48` candidate, the current source received
three locally verified review corrections: jury evidence reading order, a root-null recipe metadata
diagnostic, and open care-disclosure spacing. The expanded current visual-library self-check passes
16 fixtures. These later source changes were not used in the six frozen builds and add no paired-build
evidence; the archive, raw trial outputs and negative pilot result remain unchanged.

Post-review checks also pass the five jury-evidence assertions and reference lint (380 files,
zero misses). In a temporary plugin copy, `node scripts/verify-recipes.mjs --only
product-specification,complete-editorial-composition --out /tmp/awards-final-fix.CcrrLf/fresh-verify`
passed both entries: 13 states and 165 checks in Chromium 153.0.8010.12. Four new desktop/mobile
open-care focus frames were inspected. The fresh report is
`/tmp/awards-final-fix.CcrrLf/fresh-verify/report.json`; earlier raw evidence is preserved, and the
published closed-disclosure images remain valid and unchanged.

Independent whole-branch review and the scoped fix review are complete. Plugin source through
`d699771daf7c5a1bdbdd25c124bb0dd211f0c097` was copied into the original working tree on 2026-09-22,
preserving the user's existing edits. The pre-existing audit parser/corpus follow-ups remain in
`todo.md`; submitted human preferences are now recorded below.

## Paired comparison execution

Task 12 completed all six authorized frozen sessions and common evaluation using baseline
`4f348dc5ea850d9657af27ce28c17e11884f02d6` and candidate
`ae29ca62b73b3a24ad0c246bdee6ee25687d6e48`: USD 82.8435945, 224.67 paid-session minutes.
The candidate Kiln Nine and Form & Sound outputs fail the existing accessible-primary-action gate
because keyboard focus produces unreadable/insufficient-contrast labels. Secondary-copy C01 P1
findings also remain in two baseline outputs and Form & Sound candidate. This pilot fails technical
acceptance; it does not establish visual superiority. All six advertised Awards skills correctly
but made zero Skill calls, so guide/recipe workflow effectiveness remains unmeasured.

The [comparison record](archive/visual-comparison-2026-09-22.md) records explicit gates, protocol deviations
and the verified 216-image neutral gallery. Simon's 2026-09-23 review prefers the candidate overall
for Tidal Notes and Form & Sound, ties Kiln Nine overall, and ties all three Mobile comparisons.
Kiln Nine's imagery favors the baseline; Tidal Notes' composition favors the candidate. All other
dimensions tie. These choices meet the visual preference thresholds, while technical acceptance
still fails. Practical blinding is limited and all 18 requested reasons are blank; the original
form, including technical checkboxes that disagree with measured failures, is preserved unchanged.
Evidence delivery and preference recording are complete; human rationale remains incomplete.
Generated source and frozen snapshots are preserved, with no additional paid run or application repair.

## Release checks — 2026-09-23

Fresh checks on the original working tree for 0.3.0:

- Both `claude plugin validate` commands pass; all three release manifests agree on 0.3.0.
  Root/plugin LICENSE and NOTICE copies match. Private scaffold/recipe package versions are unchanged.
- `lint-refs.mjs`: 380 files, zero dangling references. Jury evidence: 5 assertions. Visual metadata:
  16 fixtures. Shared layout assertions pass. File-target graders: 14 checks, zero defective,
  2 explicitly skipped missing fixtures.
- `npm --prefix plugins/awards/recipes run build` succeeds and emits all 36 entry pages. Vite retains
  the existing warning for the shared Three.js chunk above 500 kB; this is not a build failure.
- `evals/behavior.mjs`: 11/11 browser/tool checks pass, with the existing Playwright installation.
  `evals/codex-install.mjs --build`: 11 skills discovered in an isolated temporary install and both
  scaffold variants build; no user configuration or model calls are involved.
- All 569 plugin files outside the two release manifests and plugin README match the reviewed
  implementation byte-for-byte. The earlier 36-entry isolated browser coverage remains applicable;
  it was not repeated or relabeled as a successful single-session run.

The first metadata self-test attempt hit a sandbox `spawnSync ... EPERM` denial and returned no child
JSON. A minimal subprocess probe identified that permission failure; the unchanged test passed with
child-process permission. No source workaround was introduced. Release notes retain the failed
paired-pilot acceptance and unmeasured workflow benefit.

## Candidate verification record

Verified 2026-09-22 from base `74ba7b2` plus the documentation candidate, using Node `v24.21.0`,
npm `11.19.0`, Playwright and headless Chromium `153.0.8010.12`. Browser commands set
`AWARDS_PLAYWRIGHT` to the installed Playwright project and ran serially with SwiftShader.

| Command | Observed result |
|---|---|
| `node plugins/awards/scripts/verify-recipes.mjs --only complete-editorial-composition,designed-footer,editorial-image-text,product-specification,responsive-art-directed-hero,typography-specimen` | 6/6 entries, 38 states, 409 checks; exit 0. All 38 fresh frames inspected in six contact sheets; six mobile/action frames also opened at original resolution. No material overflow, crop, blank section or obscured action found. |
| `node plugins/awards/scripts/verify-recipes.mjs --no-build --only <id> --out <entry-output>` for each of the 36 IDs in a temporary plugin copy, one fresh browser per ID | 36/36 entries, 194 states, 931 checks; every entry exit 0 and report pass. The copy kept plugin-relative scripts/references and linked existing dependencies; the original 30 stamps were untouched. |
| `node plugins/awards/evals/behavior.mjs` | 11/11 browser/tool behavior checks; exit 0. |
| `node plugins/awards/evals/jury-evidence-selftest.mjs`; `node plugins/awards/evals/visual-library-selftest.mjs` | 5 assertions and 15 fixtures passed; exit 0 each. |
| `node plugins/awards/evals/selftest.mjs` | 14 file-target graders, 0 defective, 2 explicit missing-`index.html` fixture skips; exit 0. Skips are not passes. |
| `node plugins/awards/scripts/lint-refs.mjs` | 380 files, 0 dangling references; exit 0. |
| `claude plugin validate plugins/awards`; `claude plugin validate .claude-plugin/marketplace.json` | Both manifests valid; exit 0 each. |
| `node plugins/awards/evals/codex-install.mjs --build` | Isolated install discovered 11 skills and built both scaffold variants; exit 0. |
| `git diff --check` | Clean; exit 0. |

The long-session verifier was also attempted twice in the same temporary copy. First attempt:
12 entries printed PASS, then `browserContext.close` failed with `Target.disposeBrowserContext:
Failed to find context with id …` at `verify-recipes.mjs:110`; exit 1, no final JSON. Second attempt:
18 entries printed PASS, `gl-virtual-scroll-camera` failed its idle-snap assertion at `0.363`, then
`browserContext.close` failed after `magnetic-button` because the page/context/browser had closed;
exit 1, no final JSON. Browser diagnostics included readPixels stalls and repeated missing-mailbox
messages from SwiftShader. The virtual-scroll recipe passed all eight states with a fresh browser.
An initial fresh-browser runner later received exit 143 after twelve saved passes; its cause was not
established, no browser process remained, and it resumed in short serial groups. These failures
remain part of the record: 36/36 is **isolated serial coverage**, not a successful single-session run.

Eight static `audit.mjs <target> --json --no-write` runs covered six new entry directories,
`_shared/composition/` and `_shared/composition.css`. All 66 recorded source hashes matched the
candidate; the audits exited 0 with **0 P0/P1**. Per-directory scans reported A06 ×5 (P2), and
S01 ×6, S02 ×6, S04 ×6, S06 ×6, X07 ×3 (27 P3). A06/S01/S02/S04 arise because these scans do not
follow `style.css` imports: all six entries import `_shared/base.css` and `_shared/composition.css`,
which supply focus-visible, selection, scrollbar and color-scheme rules in the built pages. S06 is
the documented demo exception for omitted Open Graph images; a real site needs one. X07 marks
meaningful numbered study navigation, construction/process steps or compared type treatments in
three demos. The binary asset directory contains no scannable source file. No finding was suppressed.
The visual examples' imagery, brand and facts are synthetic demonstration material; browser checks
do not establish human preference or real-device performance.

## Earlier implementation — interactive capture, behavior checks and preflight

The requested additions are implemented in the current workspace. The [implementation plan and verification record](../superpowers/plans/2026-09-21-capture-behavior-preflight.md) track this pass separately from the older 0.2.0 snapshots below. `capture.mjs --states <json-file>` replays named interactions; `doctor.mjs` checks prerequisites before implementation; `evals/behavior.mjs` tests actual browser/tool behavior without model calls. Shared action dispatch serves both captures and recipe verification. Usage and failure semantics: `plugins/awards/references/capture-states.md`.

That pass recorded **11/11** behavior checks, including the reviewed server, audit, ticker and starter fallback/motion defects. Codex discovered all eleven skills and built both installed scaffold variants. Manifest checks, reference lint and grader self-test passed. The then-current serial recipe compatibility pass was **30/30 recipes across 156 states**; doctor reported all eight checks passed against the installed recipe project. Paid build/routing evals and real-device GPU measurements remained outside that pass.

## Where things are

| Item | Location |
|---|---|
| Repository | `github.com/BurgiSimon/awards`, branch `main`. The 0.3.0 release is prepared locally from `b63ed1c`; remote `main` matched that base at the release preflight on 2026-09-23. Use `git status -sb` for the current push state. Earlier 0.2.0 branch notes below are historical. |
| Plugin | `plugins/awards/`, version **0.3.0** in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` and the root `.claude-plugin/marketplace.json`. Bump all three together; `recipes/package.json` and the scaffold's `package.json` are unrelated private versions and stay where they are. |
| Skills | `plugins/awards/skills/{craft,concept,system,structure,stack,motion,webgl,component,jury,ship,research}/SKILL.md` — eleven, each with `allowed-tools` for the plugin's own scripts |
| Agent and hook | `plugins/awards/agents/awards-jury.md`, `plugins/awards/hooks/hooks.json` |
| Reference corpus | `plugins/awards/references/` — 20 site cards + `_index.md` + `_TEMPLATE.md`, 15 pattern files, `jury/{rubric,usability-walk,report-template}.md`, `craft-floor.md`, `anti-patterns.md`, `reflex-lists.md`, 11 stack and library notes |
| Recipes | `plugins/awards/recipes/` — 36 entries (35 focused, one complete composition), `_shared/`, `README.md` catalogue, `package.json` (pinned deps), `vite.config.mjs`, `_verify/` (gitignored) |
| Scripts | `plugins/awards/scripts/{doctor,capture,audit,new-project,roll,verify-recipes,lint-refs}.mjs`, `scripts/lib/*`, `scripts/data/{rules.json,reflex-fonts.json}` |
| Templates and scaffold | `plugins/awards/assets/templates/`, `plugins/awards/assets/scaffold/vite-vanilla/` |
| Evals | `plugins/awards/evals/` — 23 cases (17 smoke, 6 build), `behavior.mjs`, `selftest.mjs`, `README.md`; `results/` gitignored |
| Original input | `awardsworthysites.md` (the user's list of 19 sites) |

## Where the 0.2.0 work stands

`archive/plan-0.2.md` has nine phases, and **all nine are done**. What remains open is listed in `todo.md`:
two fixes from the third build-tier run that have not been re-measured, and the work put out of
scope by decision (a real-device GPU pass, framework adapters, extra scaffolds).

| Phase | What it was | State |
|---|---|---|
| 0 | Branch, ledger, baseline, taxi pin | done — five real drifts found and fixed, listed in the ledger |
| 1 | Harden `capture.mjs`: wheel fallback, never lose the manifest | done, checked against a live virtual-scroll site |
| 2 | Seven blind jury calibration runs | done — **decision: change nothing in the rubric**, see below |
| 3 | Live pass over all 19 cards | done, 19/19, one card split into two slugs |
| 4 | Propagate the deltas, re-derive the rubric, `lint-refs.mjs` | done |
| 5 | Repair graders, add `selftest.mjs`, six new smoke cases, cheap smoke run | done — but its conclusion about the two misses was wrong; see the ledger's 5c correction |
| 6 | The two missing P2 recipes, `allowed-tools` on every skill | done, 30/30 recipes |
| 7 | Full smoke with the baseline arm, build tier once | **both tiers have run.** Smoke meets its bars; the build tier is 2/6 all-green with 36/41 graders passing, and its six failures are diagnosed but not yet fixed |
| 8 | One real end-to-end build | **done 2026-09-21**, $23.89, every check met, and `archive/plan.md` risk 2 is resolved |
| 9 | Docs, counts, version bump, final verification | **done 2026-09-21** — both manifests at 0.2.0, release notes in `README.md`, counts corrected, verification block run |

The calibration outcome is load-bearing and easy to misread: this jury scores roughly 0.7 below the
published Awwwards overall and handed `fix` or `rebuild` to six sites that all actually won Site of
the Day. That gap is the plugin's stated edge, not a defect, so no anchor wording was changed.
`ship` means "clears our floor, which is stricter than the award's", not "this would win".

Phase 9 was started early on 2026-09-21 with the parts that cost nothing: the stale counts in
`CLAUDE.md`, `README.md` and `plugins/awards/README.md`, this file, `todo.md`, and the "Last run"
table in `evals/README.md` — which turned out to be recording a run that had already happened and
was never written down. The version bump, the release notes and the final verification block still
belong to Phase 9 proper, because they depend on results Phases 7 and 8 have not produced yet.

## What is verified

Re-run on 2026-09-21 in this session, output seen:

- `claude plugin validate plugins/awards` — passes.
- `node scripts/lint-refs.mjs` — 330 files, **0 dangling references**. Every `[site:]`, `[recipe:]`,
  `[pattern:]` and `${CLAUDE_PLUGIN_ROOT}` path resolves.
- `node evals/selftest.mjs` — 12 file-target graders, **0 defective**, 2 whitelisted guards.
- 30 recipe folders, all 30 carrying a `verified` stamp; 23 eval cases (17 smoke, 6 build).
- 20 site cards, every one carrying a `Live pass 2026-` line, none 200 lines or longer;
  `_index.md` has its `Last verified` column and no longer claims no card saw a live render.
- `capture.mjs` end to end against a local page after the LCP rename: manifest written,
  `lcpColdSynthetic` present.

Stamped on 2026-09-18 and **not** re-run since:

- `node scripts/verify-recipes.mjs` — 30/30 on Chromium 153.0.8010.12, Node 24.21.0, at desktop
  1440×900 and mobile 390×844, with reduced-motion emulation and keyboard, hover, drag and wheel
  actions. Every `recipe.json.verified` block carries that date.
- `node scripts/audit.mjs recipes` — 0 P0, 0 P1, 0 P2; 30 P3, all the deliberate missing Open Graph
  image on demo pages.

## What is not verified

- **The build tier ran once, on 2026-09-21** (CLI 2.1.278, 33 min, $27.68): 2/6 cases all-green,
  **36 of 41 graders passed**, every skill fired. Three grader defects and the tool grant have since
  been fixed and verified, and so have both remaining findings: `research` gained its missing branch
  for a host that cannot exist (4/4 twice), and `build-antarctic-site` went to `timeout_seconds:
  3600` from the Phase 8 measurement of 129 turns and 2,567 s. The timeout is reasoned from that
  measurement rather than re-tested.
- **The build tier was re-run on 2026-09-21 with the grant working**: $41.43, 45.6 min, **4/6 cases
  all-green, 39 of 41 graders, overall 0.95**, against 2/6 and 36/41 before. `build-antarctic-site`
  went 0 → 10/10 at 2,737 s, which also confirms the raised timeout by measurement rather than by
  reasoning. Two graders failed that had passed before, both on presentation rather than substance;
  both are repaired and verified. **A third run on 2026-09-21** ($44.37, 53.3 min) measured past
  those repairs: **4/6 cases all-green, 40 of 42 graders, overall 0.96**, with both repaired cases
  at 7/7. Its two failures are new in kind — `build-antarctic-site` ran out of *turns* (151 of 150)
  inside its raised time cap, so `max_turns` is now 200; and `jury-generic-saas/scores-present`
  caught the **jury skill drifting off its own reply contract**, writing its axes as a table and
  closing in prose. That contract is now a literal block in `skills/jury/SKILL.md`. Neither fix has
  been re-measured in the tier.
- An `llm` grader with `focus: trace` receives **about 25 lines** of transcript regardless of run
  length, so it cannot audit a long run. `scope-respected` failed 3/3 twice on runs that changed
  nothing, and is replaced by two file guards. Prefer a file target for anything a judge would have
  to reconstruct.
- The smoke tier **is** verified, in two parts: the full tier on 2026-09-18 (17 cases × 3 runs × 2
  arms, CLI 2.1.276, 49 min, $36.22, 13/17, mean delta over baseline +0.48) and the four repaired
  cases re-run afterwards at 3/3 each ($6.64 for the last three, CLI 2.1.278). Every Phase 7 bar is
  met. The caveat: the repairs were measured case by case on the plugin arm, not by re-running the
  whole tier in one pass. Per-case tables in `evals/README.md` under "Last run".
- Graders are now proven in **both** directions for the build tier: `selftest.mjs` checks that each
  fails on untouched input, and the first 2026-09-21 run showed 36 of 41 passing on real output. The four
  that were wrong are named in the ledger.
- ~~The skills have never been driven end to end on a real project.~~ **Done 2026-09-21.** Eight
  skill calls, `craft` → `concept` → `system` → `structure` → `stack` → `motion` → `jury` →
  `jury --verdict`, 129 turns, $23.89. `npm run build` passed, the audit re-run independently is
  clean at P0–P3 0, and the captures cover desktop, mobile and reduced motion with no console or
  page errors. **`archive/plan.md` risk 2 is resolved**: the forked jury's literal `disposition:` line
  reaches the user verbatim, so the Agent-tool fallback in `skills/craft/SKILL.md` stays as
  insurance rather than being needed. Full account in the ledger's Phase 8 section.
- The one defect that run surfaced is fixed: `scripts/audit.mjs` resolved its project root from
  `process.cwd()`, so auditing from inside `public/` wrote the report there for the build to ship,
  and silently dropped the project's `## Exceptions`. It now walks up from the audited target to the
  nearest `AWARDS.md`, falling back to cwd where there is none.
- **No recipe or skill has run on a real GPU or a real phone.** SwiftShader proves the recipes
  correct, not fast. The quality-tier thresholds in `recipes/_shared/quality-tiers.js` are still
  unmeasured guesses.
- Slosh Seltzer's captures show its WebGL gate rather than the site; its card says so, and its
  confidence stayed at medium-high for that reason.

## Environment facts that shaped the work

- This machine: Node 24.21.0, Claude Code CLI 2.1.276, Playwright 1.63.0 reached through
  `export AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb"` (the resolver in
  `scripts/lib/playwright.mjs` looks at cwd, then that variable, then `npm root -g`). Set it before
  anything that drives a browser. `recipes/node_modules` must be installed
  (`cd plugins/awards/recipes && npm install`) before `verify-recipes.mjs`.
- Egress is open; all 19 sites answer 200 to curl. **Awwwards answers 403 to curl** with any header
  set, but 200 through real headless Chromium — so site sources are fetched with curl and award
  entries with a browser.
- `verify-recipes.mjs` is not safe to run beside another Chromium. With a capture running in
  parallel, `gl-virtual-scroll-camera` fails its snap assertion; alone it passes.
- The account's usage limit killed agents mid-run three times across the two sessions. Commit after
  every unit; keep to three parallel subagents at most; subagents never commit and never touch
  shared files.
- `claude plugin eval` publishes an HTML report to claude.ai unless `--no-publish`, and prompts for
  trust unless `--trust-plugin`. Its cost ceiling is checked before a run launches, so `-j 3` with a
  tight `--max-cost-usd` overshoots: an `$8` ceiling spent `$9.20`.
- Playwright quirks that cost time: `page.hover` scrolls the element into view and the `scroll`
  event arrives a frame later; a scroll applied after a hover moves the element out from under the
  pointer; `mouse.wheel` needs a live Lenis clock to move a Lenis page; `readPixels` after a
  composer render needs the default framebuffer bound and a fresh render in the same task.

## Two lessons from Phase 6 worth keeping

1. **An existence check on a render proves almost nothing.** `gl-msdf-text` passed 8/8 while
   rendering its headline as a solid black slab, because the assertion only asked whether
   `readPixels` found ink inside the text rect. It now asks for an ink fraction between 0.08 and
   0.45. Look at the screenshots in `recipes/_verify/` before believing a PASS.
2. **The capture manifest's LCP was a lie, and every card author had to write the same disclaimer
   by hand.** As of 2026-09-21 the field is named `lcpColdSynthetic`, and `jury`, `ship`, `research`
   and the jury agent all say what it is. It is headless, cold-cache and software-GL: one run
   reported 71,044 ms desktop against 368 ms mobile for the same site. Read it as an asset-weight
   signal or not at all; a performance claim needs Lighthouse or a throttled trace.

## Numbers

| | |
|---|---|
| Current branch | `main`; use `git status -sb` for the current push state |
| Site cards / pattern files / stack notes | 20 / 15 / 11 |
| Recipe entries verified | 36 in isolated serial browser runs; 35 focused plus one complete composition |
| Audit rules | 55 (`T` fonts, `C` colour, `M` motion, `A` accessibility, `L` layout, `P` performance, `S` surfaces, `X` slop) |
| Eval cases | 23 (17 smoke, 6 build) |
| Site of the Day overalls across the 20 verified entries | 7.28 – 8.18, median 7.67 |
| Pinned versions | gsap 3.15.0, lenis 1.3.26, three 0.186.0, animejs 4.5.0, ogl 1.0.11, postprocessing 6.39.5, @unseenco/taxi 1.9.1, vite 8.3.5 (full list in `references/stacks/versions.md`) |
