# Changelog

Release notes for the awards plugin, newest first. The manifests carry the version; `scripts/check-sync.mjs` keeps them in step.

## Unreleased

From the 2026-10-22 review, batches 1 to 5 (everything except the large, lower-impact items).

- **Truthful rendered checks.** Every visible text is measured against what is actually behind it, focus states included (C01, A12); axe-core runs WCAG 2.2 A/AA (A16); new rules for titles, descriptions, canonical and Open Graph (S07–S10), skip links (A13), touch targets (A14) and duplicate ids (A15). A rendered step that fails is an `ERR` finding, never a clean read; a bundler project renders its build output. Rendered checks run at desktop, tablet and phone and add blank viewports (L09), lopsided tablet and phone sections (L10) and layout shift during load (P08). 85 rules.
- **Evidence the jury can use.** Tablet frames, ARIA trees, held-clock timeline frames and a contact sheet, a video pass, a throttled phone pass, a GPU lane that refuses SwiftShader, per-frame diffs against the previous round, and Chrome UX Report field data (`scripts/crux.mjs`). The jury scores Awwwards' six developer criteria by name.
- **Recipes fixed by the sweeps.** Five recipes overflowed a phone, left a blank tablet screen or shifted during load; all five are fixed, and the shared `--muted` ink clears AA everywhere.
- **Upkeep.** `scripts/check-versions.mjs` compares every pin with the registry; the doctor checks the running Node against every installed package's `engines.node` and asks for 22 LTS or 24 LTS; `scripts/calibration.mjs` recomputes the rubric's corpus figures from the cards; Playwright 1.64.1 is pinned in the recipes, and recipe stamping is opt-in.
- **Evals.** Contract, resume and coexist tiers (the last beside GreenSock's gsap-skills), near-miss negatives, a bland-but-clean jury case, a free regrade of kept runs and a picker that maps a diff to the cases it needs.
- **Platform.** Shorter skill descriptions (7.4k characters in all, inside Codex's budget), a SubagentStop check that sends a jury reply without its disposition line back once, `userConfig` for the hooks and the default stack, a narrower jury toolset with Write, 45 turns and no CLAUDE.md, `scripts/awards-log.mjs` for log and Status lines, research that honours the site owner's policy (`scripts/policy.mjs`), scoped exceptions (`C01@path`), a portable capture lock, a hardened local server, sub-skill hand-offs that keep craft's pre-jury checks, and a deal that fits the question tool.
- **Imagery and assets.** WORLD names an imagery strategy and what supplies it; `references/patterns/imagery-and-assets.md` covers the strategies the cards use, open sources, generated assets (with the EU AI Act's transparency rules from 2 August 2026) and the asset log `scripts/assets.mjs` keeps in `.awards/assets.json`.
- **Less house style, more mechanism.** No default motion register; labels untracked unless WORLD asks; the fullscreen menu loses its numbers by default; every recipe use carries a `keep / change / pair` line; faces are chosen character first from Fontsource with `scripts/fonts.mjs` (a seeded pull, a rendered specimen of the real headline, the licence on fetch).
- **What finish looks like, and what failure looks like.** craft-floor names the finish beside the prohibitions; `references/patterns/negative-exemplars.md` pairs three captured failures (the house style, the template product page, the clean but forgettable page) with the rules they break; rendered rules X21 (eyebrow labels by computed style) and P09 (images drawn above their natural size).
- **Composition you can measure.** `references/patterns/layout-and-composition.md` (grids, gutters, measure, image share, thirteen layout families and the adjacency rules the page map is checked against), and a block-map skeleton plus a measured fingerprint row (type ramp at 1440 and 390, margin, column edges, media share) for every card that allows it (`scripts/skeleton.mjs`, `references/sites/_fingerprints.md`).
- **A corpus that keeps itself honest.** The index is generated from the card headers (`build-index.mjs`), every card is checked against a vocabulary (`check-card.mjs`), waves are opened against a gap report (`corpus-gaps.mjs`) after a model-free pre-pass (`corpus-prepass.mjs`), a quarterly health pass records which sites were rebuilt (`corpus-health.mjs`), research reads up to two named inner routes, and the clone-level card is cited as `[clone:floema-jewelry]`.
- **Recipe catalogue from data.** `recipes/README.md` is generated from each `recipe.json` (intent, group, summary), grouped by the component catalogue, with tags from a controlled vocabulary.
- **New modes.** `craft --quick` for one landing page (system and structure checked once, no component passes, one jury round); `craft redesign <url|dir>` (a branch, a baseline capture and a forked `jury --baseline`, a content inventory, two baseline faults as THESIS refusals); `capture.mjs --routes` captures every route of a site into one `routes.json` the jury reads; award program presets (`jury --program awwwards,cssda,fwa,webby`, `references/jury/programs.md`); DESIGN.md lint, export and per-round token diffs through Google's design.md CLI (`scripts/design-md.mjs`).
- **Verification.** `verify-recipes --pseudo` (text 40 % longer, then right to left, on a phone); `--only` builds only those entries; audit rule A17 (viewport that locks zoom); four recipes lost the eyebrow labels the computed-style check found.
- **The plugin's own site** moved onto `main` under `site/`.
- **Not yet measured.** No paid eval has run against these changes; `node evals/pick.mjs` lists the cases they need.

## 0.7.0 — 2026-10-22

From the 2026-10-22 improvement review: a full build can now finish, and the tools it leans on tell the
truth.

- **Builds can finish.** The stack phase scaffolds into the project the earlier phases started
  (`new-project.mjs --keep-existing`). A build gets two page jury rounds (phase 7 and one verdict pass)
  plus up to two component passes, counted separately; verdict mode re-scores, so a `fix` can become
  `ship`; a component pass no longer ticks the page-level jury box.
- **An edit hook that tells the truth.** Line numbers are indexed, not rescanned (a 1.2 MB stylesheet went
  from 64 s to 0.55 s against the hook's 5 s limit); "handled anywhere" checks read the whole project, so
  ordinary edits no longer earn false P0/P1 findings; a build in a subfolder of the open project is audited.
- **Survives compaction.** A `SessionStart` hook re-attaches a short state card from `AWARDS.md` after a
  context compaction while a build is unfinished.
- **Corrected facts and routing.** The igloo, the-line and son-daven award claims now match their cards
  (Site of the Day, with scores); the Tailwind rule names the two winners that use it as a token layer; a
  new-site brief that names WebGL or GSAP routes to `craft`.
- **Taxi 2.0.** Both taxi recipes run on 1.9.1 and on 2.0.0; `references/stacks/taxi-2.0.md` lists the
  breaking changes. The pin stays at 1.9.1.
- **Codex.** The Codex manifest declares no hooks (`"hooks": {}`), which keeps the plugin eligible for
  Codex's public plugin directory; Codex runs the audit explicitly, as before.
- **CI and tests.** GitHub Actions runs the free checks on Node 22 and 24 for every push and pull request;
  `scripts/check-sync.mjs` guards versions, pins, shared copies, licence files and quoted counts. The
  grain-field reset is no longer timing-flaky, and `behavior.mjs` passes 20/20 without manual setup.
- **Not yet measured.** No paid eval ran for this release: whether a full build now reaches Shipped awaits
  one `build-antarctic-site` run (see `docs/handoff/todo.md`).

## 0.6.0 — 2026-10-07

From a whole-plugin analysis of why generated sites fall short of the corpus
([`docs/handoff/analysis-2026-10-06.md`](docs/handoff/analysis-2026-10-06.md)). The changes move effort from
detecting slop to generating less of it.

- **No house style.** The scaffold hero lost its `/ 01` label; labels as texture, motion values and the
  display clamp are now derived from the world instead of fixed; the staple kit (counter preloader,
  overlay nav, cursor, magnetic button, marquee, split reveal) is capped at two at recipe-default shape;
  structure offers all thirteen hero archetypes. Fourteen recipes lost their eyebrow micro-meta and the
  six visual examples were re-captured.
- **Composition, not only costume.** The template hero is a named rut, the page map carries a Layout
  column (no layout in two adjacent chapters, four or more on long pages), and the seeded roll picks its
  lead at random among the dealt directions.
- **Calibrated against real neighbours.** `system` derives its relationships from the three chosen corpus
  cards; the jury opens a frame of each neighbour and names one finish gap per card.
- **Judgement moves forward.** The hero is captured and judged on the image right after the system; a
  forked component jury looks at the first viewport before motion (and again after WebGL when the
  signature is a canvas). The jury splits its fixes into an uncapped floor list and up to five craft
  fixes, and adds a reported-only `Ceiling:` line.
- **Tooling.** `capture.mjs` records hover and focus-visible frames by default; audit rule C05 (render)
  compares the page ground with the DESIGN.md token, L05 catches BEM eyebrow names, X07 catches `/ 01`;
  a `UserPromptSubmit` route hint. New evals: an unled full-tools brief (3 / 3 reached `craft`) and graders
  for the Layout column, calibration and a lenient jury. `evals/stage-browser.sh` stages Playwright and
  Chromium into the eval sandbox, which no longer sees the user's home.
- **Not yet measured.** The full build case was interrupted, skipped and not scored; the effect on jury
  scores is open (see `docs/handoff/todo.md`).

## 0.5.0 — 2026-10-05

- **Deep modes.** `awards:motion --gsap`, `awards:webgl --shader` and `awards:webgl --3d` are modes of
  the existing skills, not new skills. They switch on from the direction contract, the WebGL dosage
  and depth rung, or the motion score, or by flag, and record themselves on one `Deep modes:` line in
  `AWARDS.md`. Each loads a playbook: `gsap-choreography.md`, `webgl-shaders.md`, `webgl-3d-scenes.md`.
- **Corpus wave 4 with a tech lens.** Seventeen queued sites (GSAP, WebGL and 3D queues): twelve new
  cards plus a GSAP teardown on `why-zero`, each with a `## Tech lens:` subsection read from live
  source; two skipped because their owners forbid automated extraction; two blocked because their
  scenes do not render headless (retry needs a real GPU). The index grows from 50 to 62 rows.
- **Sixteen new recipes**, for 75 focused recipes plus one complete composition: house easing tokens,
  uniforms as tween targets, a scrubbed clip-path door, scrub-threshold timelines, a studio environment
  built at runtime, a patched-material reveal, one context feeding many canvases, a lathe-turned object,
  a GPU grain field, an arc-length stroke reveal, dispersion stripes, an extruded SDF symbol, a
  spring-stepped gallery, progress-line scene windows, a two-phase interruptible timeline and an
  OffscreenCanvas worker. All 76 entries passed one serial browser run on 2026-10-05.
- **Expand-corpus.** Lens queues, an existing-card path, captures serialised behind a lock, and an
  owner-policy check before any capture.

## 0.4.0 — 2026-09-24

- **Thirty new site cards.** The corpus index grows from 20 to 50 rows over two waves. Every card
  was captured live and its source read; none is written from memory. Each carries a corpus rating
  (Design / Usability / Creativity / Content, labelled `[inferred]`) next to any published award
  score, and a card is added for what it teaches the corpus, never for its rating. New ground
  includes e-commerce, docs and B2B-service classes, section-switcher decks, operable-object
  portfolios and chaptered campaigns. One site (oxigen) stays blocked: headless capture cannot
  render its scene.
- **The pattern language absorbs them.** All thirteen pattern files, the reflex and anti-pattern
  lists and the recipe `seenIn` arrays cite the new cards. New hero archetypes ("wordmark as a
  window", "operable object", "the work on screen one"), components (persistent mode switch,
  auto-advancing tabs with a visible clock, sentence-form enquiry, docked media that grows into its
  section) and an e-commerce row in the category defaults.
- **Twenty-four new recipes**, for 59 focused recipes plus one complete composition. Among them:
  scroll-filled words, a hero word cycle, a wheel-committed panel deck, a clamped orbit over a
  model with DOM hotspots, a knockout wordmark over a moving ground, a preloader that opens into
  the hero, an endless GL reel, a blur-peek snapping carousel, a video clip-wipe and a runtime
  DPR governor with an idle render gate. Each ships its own browser check, and none ships a media
  or font file.
- **Fourteen library notes**, among them Barba, Taxi, Highway, next-view-transitions, OGL,
  Locomotive Scroll, camera-controls, lottie-web, the Spline viewer and html2canvas, each checked
  against published source and linked from the stack skill, with pins in `versions.md`.
- **`inspect(page, state)`** in `verify.mjs` lets a recipe check the accessibility tree or an ARIA
  snapshot from Node on the page the harness already drove; `sentence-form-enquiry` uses it.
- **A maintainer workflow for growing the corpus** (`.claude/skills/expand-corpus/`, not shipped
  with the plugin): triage in batches, synthesis, recipe proposals behind a maintainer gate, stack
  notes and upkeep, with a ledger in `docs/handoff/corpus-ledger.md`.

**Verification and limits.** All 60 entries passed in one serial browser run on 2026-09-24, and the
recipe audit is free of P0–P2 findings. Headless checks do not establish real-device GPU
performance or real touch feel. The routing smoke evals were not re-run for this release, so the
skills' triggering is measured only as of 0.3.0.

## 0.3.0 — 2026-09-23

- **Visual composition library.** Five new recipes cover editorial image/text composition,
  responsive art-directed heroes, product specifications, typography specimens and designed
  footers. One complete furniture/materials page combines them with coherent synthetic imagery,
  shared styles and annotated desktop/mobile captures. The catalogue has 35 focused recipes and
  one complete composition.
- **Visual evidence in planning.** A composition guide connects real rendered examples to concept,
  system and structure decisions. A static desktop/mobile review precedes motion. Jury and ship
  derive coverage from the page map and capture manifest, and verify named fixes before/after.
- **More consistent guidance.** Corrected contradictory palette, type hierarchy and case-study
  confidence rules. Missing visual evidence produces an unmeasured `recapture` result instead of
  a numeric score. Metadata validation handles malformed recipe roots; shared specification styles
  keep disclosure text clear of the keyboard-focus outline.
- **Runtime and installation support since 0.2.0.** Both Claude Code and Codex manifests ship with
  isolated install/discovery checks. Interactive capture state plans, the non-installing `doctor`
  preflight and browser/tool regression checks support the complete workflow.

**Verification and limits.** All 36 entries passed in isolated serial browser runs; a single-session
full run remains unproven. Headless checks do not establish real-device GPU performance. In the
[three-pair pilot](docs/handoff/archive/visual-comparison-2026-09-22.md), the candidate was preferred overall
twice, tied once, and tied on mobile throughout. Two candidate builds failed keyboard-focus contrast,
so the pilot did not meet acceptance. None of the six builds invoked the advertised skills;
the library's effect on generated sites remains unmeasured. The release includes the implementation
and evidence, with those follow-ups still open.

## 0.2.0 — 2026-09-21

0.1.0 was built in a sandbox that could not reach a single one of the sites it described, and its
eval suite had run once. This release closes both.

- **The corpus saw the sites.** All nineteen entries were loaded in a real browser and read against
  their live award entries. Facts changed: one card described a different company, one resolved to
  the wrong award entry and split into two slugs, a shader that does not exist was removed, and a
  site the corpus said never asserts a score turned out to hold the highest one in it. Every claim
  still carries `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`, and `_index.md` gained a
  `Last verified` column.
- **The jury rubric is derived rather than recalled.** The 40 / 30 / 20 / 10 weighting was read off
  twenty live entries and reproduces their published overall to 0.01. Site of the Day runs 7.28 to
  8.18 in this corpus, not the "7.2–7.9" the old notes claimed, and the six developer criteria
  Awwwards publishes are now mapped to the five this rubric scores.
- **Calibration, and how to read a verdict.** Seven blind jury runs scored about 0.7 below the
  published overall and handed `fix` or `rebuild` to six sites that all won Site of the Day. That
  gap is deliberate: `ship` means "clears this floor, which is stricter than the award's", not
  "this would win".
- **Two recipes finish the catalogue**, at thirty: an opt-in sound toggle that synthesises its own
  audio, and MSDF text that builds its atlas at runtime, so neither ships an asset file.
- **The eval suite runs.** Seventeen routing cases across both arms, and a build tier that had never
  executed once. Running it found more defects in the graders than in the plugin, and one in the
  jury skill's reply contract.
- **`lint-refs.mjs`** checks that every `[site:]`, `[recipe:]`, `[pattern:]` and
  `${CLAUDE_PLUGIN_ROOT}` path resolves. **`evals/selftest.mjs`** checks that every file-target
  grader fails on untouched input, so a grader that measures nothing cannot pass quietly.
- **Fixes worth naming**: capture manifests reported a headless cold-cache number as if it were a
  field LCP, and the jury scored performance from it — the field is now `lcpColdSynthetic` and the
  skills say what it is worth. `audit.mjs` resolved its project root from the shell's working
  directory, so auditing from inside `public/` wrote its report there for the build to ship, and
  silently dropped the project's signed-off exceptions.

**What is not verified.** No recipe has run on a real GPU or a real phone: headless SwiftShader
proves they are correct, not fast, so run a real-device pass before shipping anything WebGL. The
quality-tier thresholds are unmeasured guesses. The build eval tier's last two fixes have not been
re-measured. `docs/handoff/verification-log.md` is the evidence for all of it, including what went
wrong on the way.
