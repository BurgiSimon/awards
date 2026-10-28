# Open todos

## Review work queue (from the 2026-10-22 review; the maintainer asked for everything except the large-effort, lower-impact items)

Item ids are the review's (A site quality, B engineering, C measurement, D corpus and recipes, E platform, F features, G docs). Tick each as it lands; one PR per batch.

Excluded by that instruction (lower impact, larger effort): F5 jury panel, F6 motion tuning page, B11 context weight, C2 per-rule fixtures, B24 audit split, F7 more scaffolds, D12 pattern digests, D13 variants as data, E8 plugin-managed browser, F8 comp-first, F10 recipe registry, G9 build gallery, recipes R7 Rive, R10 configurator, R11 WebGPU TSL, R12 variable axes. Not runnable here: C13 paid A/B sprint (costs the maintainer money). A12 stimulus deck: done in 1.0.0 (the convergence it waited for is measured in `house-ledger.md`).

**Batch 1 — evidence (0.8 remainder)**
- [x] C7 cheaper eval tiers (contract tier, regrade on kept workspaces)
- [x] C8 missing eval cases (jury-bland-clean, concept-deal-distinct, near-miss negatives, new-site technique, phase order, resume)
- [x] C9 tablet capture and lopsided/blank-band render rules
- [x] C10 Playwright Clock, ariaSnapshot, screencast evidence
- [x] C11 visual diff between capture rounds
- [x] C12 refresh calibration claims
- [x] C5 performance evidence (CLS rule, long tasks, lab INP, CPU throttle)
- [x] C6 real-GPU and WebKit lanes (`--gpu`, Safari and DevTools MCP guidance, CrUX field data)
- [x] C14 GSAP official skills coexistence eval
- [x] B9 render the build output, not bundler source
- [x] B16 rendered checks never fail silently
- [x] B10 Node floor per stack
- [x] D3 version check script

**Batch 2 — engineering, platform and docs**
- [x] B12 + E9 jury agent tools, turns, omitClaudeMd, `awards-log.mjs`
- [x] B13 concept deal within four options
- [x] B14 sub-skill hand-offs keep craft's checks
- [x] B17 scoped exceptions and ignores
- [x] B18 Windows and macOS spawn and lock fixes
- [x] B19 scaffold `.gitignore` and capture `--out` root
- [x] B20 research honours owner policy
- [x] B22 reproducible verification (pin Playwright, opt-in stamping)
- [x] B25 harden the local server
- [x] B26 small drift
- [x] E3 trimmed descriptions; E5 hook refinements (SubagentStop check; asyncRewake and exec form declined, see decisions.md); E6 userConfig; E7 effort (raised for concept only); E10 report pages. E4 `!command` state declined: a failed injected command aborts the skill (decisions.md)
- [x] G2 quick start; G3 permissions; G4 Playwright advice; G5 stale docs; G6 listing fields; G7 CONTRIBUTING and templates; G8 CHANGELOG; G10 archive. Left to the maintainer (repository settings, not files): tags for 0.5.0 and 0.7.0, GitHub releases, stale branches, branch protection on main, the plugin-directory submission

**Batch 3 — ceiling (generation side)**
- [x] A3 imagery strategy in WORLD + F3 asset sourcing and licence log
- [x] A5 house-style remnants; A6 mechanism, not look; A7 character-first fonts; A9 references slot
- [x] A8 positive craft checklist; A10 computed eyebrow counter; A11 negative exemplars
- [x] A2 layout and composition pattern file
- [x] A1 composition skeletons and fingerprints per card
- [x] D5 inner routes in research; D6 floema-jewelry citations; D7 stack notes (Rive, WebGPU/TSL, host platforms); D9 missing pattern topics
- [x] D4 gap-driven waves; D10 model-free pre-pass; D11 index, card and health scripts; D14 generated catalogue table; D15 tag vocabulary

**Batch 4 — recipes**
- [x] R1 view-transitions-mpa; R2 css-scroll-driven-timeline; R3 flip-layout-state; R4 case-study-route-kit
- [x] R5 drag-pan-infinite-grid; R6 image-trail-cursor; R9 physics-pile-matter
- [x] R8 pseudo-locale stress (`verify-recipes --pseudo`)
- [x] R13 the four specced wave-4 recipes; R14 designed-404, cart-drawer-quick-add

**Batch 5 — new modes and proof**
- [x] F2 quick mode; F1 redesign mode; F4 multi-route sites; F9 award program presets; F11 DESIGN.md interop
- [x] D8 framework adapters: React adapters for ten core recipes, a Webflow section in every core README, `scripts/check-adapters.mjs` in CI
- [x] G1 the plugin's own site, rebuilt from scratch in redesign mode as the maintainer asked ("Contact sheet", seed `3zaj142iys4g`): three page jury rounds (ship 7.70, fix 7.71, ship 7.88; the third asked for by the maintainer), Shipped 2026-10-23. Left to the maintainer: enable GitHub Pages with Actions as the source and run `.github/workflows/site.yml`; one pass on a real phone and trackpad (the strip's follow and chapter 3's scroll were measured only headless); the Awwwards submission. Open after ship: two craft rows in `site/.awards/ship/2026-10-23.md` (s00's arrow label in view; the hover crop's marks in paper ink)


## Corpus wave 6a — Son Daven video weave (2026-10-28) follow-ups

1. Real-GPU and real-phone pass for `gl-video-dither-layers`, `gl-dither-scene-pool` and `dither-cell-transition`: frame time with three playing clips, the slice copies on a phone, `captureStream` and `requestVideoFrameCallback` on Safari (the recipes fall back to canvases when no frame arrives in 2.5 s; unproven there).
2. Try the recipes with filed footage (an H.264 clip graded on black) and record the bitrate at which the weave stops showing compression.
3. `webcodecs-frame-scrub`, left unbuilt (`recipe-proposals-2026-10-28-son-daven.md`): check `VideoEncoder` under headless Chromium first.
4. Re-read Son Daven's load from an ordinary network: from this container 17 of 120 hero frames were pending at 40 s.
5. Stamp the three recipes at the next release.
6. `evals/behavior.mjs --only capture`: the held-clock timeline baseline diff fails about one run in three with 1–3 changed pixels (0.0001–0.0003), on the unchanged `capture.mjs` too (observed 2026-10-28, while checking the load-timeout fallback); make the comparison tolerate antialiasing noise or find the source.

## Found pictures off (2026-10-28) follow-ups

1. A contract-tier case for `--no-found-pictures`: the Southbound brief with the flag, graded on the `Found pictures: off` line, WORLD's `found pictures off`, and no `assets.mjs search` call (a few dollars, the maintainer's call).

## Demos built with 1.0.0 (2026-10-26) follow-ups

1. Unattended runs: craft (and the build evals' prompts) should say that a run ends when the turn ends, so long work (picture searches, captures) runs in the foreground; the Wrenmouth build lost its first picture search that way. Headless runs can also set `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`.
2. Put Wrenmouth on the homepage's record: `site/facts/collect.js` lists the builds it reads and `render.js` holds the page to five; a sixth build is a homepage change and needs a verdict round.
3. Wrenmouth's open phone fixes (the Trust card's size, one season-pass caption on the fold) and its four 1,024 px originals; its Creativity (7.6) is the lowest axis.
4. Date a second house-tells wave once there are three or more 1.0 builds to compare.

## Release 1.0.0 (2026-10-26) follow-ups

From the taste-skill comparison (`analysis-2026-10-26-taste-skill.md`); every recommendation landed as code or prose, none has been measured on a paid build.

1. Run one blind round (`evals/visual/tournament.md`, review item C13): three briefs, three arms (no plugin, awards, taste-skill at `12af471`), the forked jury in `--blind` mode plus one person. It is the only test of whether R1–R12 made better pages; budget $100–200. Add the no-asset persuade brief first.
2. Paid contract cases for the new graders: `node evals/pick.mjs v0.8.0` lists them (`contract-southbound` inventory, competitor and Seed graders; `concept-deal-distinct` engines and stimuli). Then smoke and `trigger-jury`, because the jury's description changed ("says an award-level page looks generic, templated or AI-made"), and the route tier once.
3. Widen the contrast set beyond SaaS templates (`references/sites/_contrast-queue.md`): agency pages, portfolios and launches that won nothing, and the remaining winners (`contrast-set.mjs --winners all`). With eight pages a side, a difference under 25 points is noise; annotate the slop scan only from a wider set.
4. L11 still skips canvases before the pixel check (a WebGL canvas redraws between shots, so the still check would set it aside anyway); text under a canvas is the jury's from the frames. Revisit if a build shows text under an opaque canvas that the jury missed.
5. Refresh `references/patterns/house-tells.md` and re-run `house-ledger.mjs --write` after the next showcase builds; a value stays spent until builds stop sharing it.
6. The walk (`capture.mjs --walk`) was tested on three showcase builds and a fixture; run it on a framework build (Next or Nuxt) with client routing before trusting its URL-change test there.
7. `assets.mjs search`: Wikimedia answered 429 and the Art Institute 403 from this container; re-test both from a normal network and record which collections a maintainer can rely on.
8. Re-run `contrast-set.mjs` after every change to a rendered rule (it re-measures on its own when `audit.mjs` or `rules.json` changed) and read any rule that fires on most winners before shipping it at P0–P2; L11 and S11 were narrowed on 2026-10-26 for exactly that.
9. A real build should exercise the new Seed line end to end: concept writes `· ENGINE <id>` after the answer locks a direction, and `house-ledger.mjs --against` reads it; until then the ledger infers engines from the five earlier builds' THESIS lines.

## Corpus wave 5 (2026-10-26) follow-ups

1. Real-GPU and real-phone pass for the seven wave 5 recipes (`gl-swarm-light-field`, `gl-screen-paint-distortion`, `gl-grade-pass-scene-cuts`, `gl-dom-refraction-lens`, `gl-pointer-wake-reveal`, `point-cloud-shape-morph`, `wordmark-header-handoff`): frame times, the swarm's lazy chunk on a phone, the lens's repaint cost during a fast scroll. All were verified on SwiftShader only.
2. everswap's official scores: the Awwwards entry page returned 502; re-read it and replace the `[recalled]` award line with the jury figures.
3. Not built from the wave (`recipe-proposals-2026-10-26-wave-5.md#not-built-candidates-left-in-this-file`): `gl-scroll-speed-tunnel`, `gl-texture-skinned-bird`, `gl-gpu-spline-trails`, `gl-voronoi-fracture-carry`, `gl-dual-gate-camera-track`. The bird and the camera track need authored DCC exports; the tunnel overlaps `gl-virtual-scroll-camera`.
4. Stamp the seven recipes (`verify-recipes --only <ids> --stamp`) at the next release; all seven already pass `--pseudo`.

## Release 0.8.0 follow-ups (2026-10-23)
- Maintainer: tag `v0.8.0` on the merge commit and publish the GitHub release from `CHANGELOG.md`.
- Maintainer: enable GitHub Pages with "GitHub Actions" as the source, then run `.github/workflows/site.yml`; check the deployed page once on a real phone and a trackpad (the strip's follow and chapter 3's scroll were measured headless only).
- Paid evals: none ran for 0.8.0; `node plugins/awards/evals/pick.mjs v0.7.0` lists the cases the changes need, with their commands.
- Site, open after ship (`site/.awards/ship/2026-10-23.md`): s00's arrow label in view; the hover crop's marks in paper ink. Each is material, so it needs a verdict round.
- Still excluded by the review instruction (large effort, lower impact): F5, F6, B11, C2, B24, F7, D12, D13, E8, F8, F10, G9, R7, R10, R11, R12; C13 (paid; the harness ships in 1.0.0); A12 done in 1.0.0.

## Quick wins (2026-10-22) follow-ups

1. Measure, paid: an uninterrupted `build-antarctic-site` should now reach `Shipped` or stop on a named blocker; record the page and component jury lines it writes.
2. ~~Watch the first CI runs.~~ Done: `static` green on Node 22 and 24 for PR #9 (16 s each); the manual `browser` job has not been dispatched yet.
3. ~~Codex hook policy.~~ Done 2026-10-22: `"hooks": {}` in the Codex manifest (decisions.md).
4. ~~`behavior.mjs` NODE_PATH leak.~~ Done 2026-10-22. The `/opt/pw-browsers` fallback stays on purpose: it is the browser Claude Code cloud containers preinstall, tried only after a failed launch.
5. Remaining top-15 review items, in order: imagery strategy and an asset log (A3, F3); composition skeletons per card (A1); a layout and composition pattern file (A2); quick mode (F2); redesign mode (F1); finish and ship the plugin's own site (G1). Next: a version check (D3), cheaper eval tiers (C7), house-style remnants (A5). Done 2026-10-22: D1, D2, E2, B7, B8, then A4, B6, C3, C4 (unreleased).
7. Evidence phase, still open: cheaper eval tiers (C7), throttled traces and lab INP (C5), a real-GPU lane (C6), the paid A/B sprint (C13). Optional: re-capture the six visual examples after the `--muted` change.
6. Taxi: the pin stays at 1.9.1; moving it to 2.0 is the checklist at the end of `references/stacks/taxi-2.0.md` (the recipes already pass on 2.0.0).

## Release 0.6.0 follow-ups

1. ~~`gl-ping-pong-grain-field` reset assertion is timing-flaky.~~ Done 2026-10-22: the glide is timed by the clock and ends at 0 px (3 / 3 runs).
2. Re-run `build-antarctic-site` uninterrupted for a scored measure of 0.6.0.

## Finish gates (feat/finish-gates) follow-ups

1. Measure, paid: `--tag build` with vs without the hero probe and component jury: final Design and Creativity, late `rebuild` verdicts on the first viewport, slop families present (P07, P12); craft-list seam fixes resolved per round, target two or more (P13).
2. Check that a build reaches `.awards/captures/hero-probe/manifest.json` before the skeleton tick, and how often the two-round cap leaves the verdict pass to the user.
3. C05 reports a ground painted only by a fixed full-screen canvas as unpainted; the floor expects a body fallback, so it stays unless builds trip it.

## Ceiling (feat/ceiling) follow-ups

1. Done 2026-10-07: §8 Take on `boc`, `eugeniagrab` and `aqualoqa` now leads with a compositional or structural move from the card's own evidence.
2. Measure, paid: A/B `--tag build` for Design score, finish-type fixes and clone rate (P02); spread of `Calibration:` values across 3–4 briefs (P03); distinct Layout values and adjacent repeats per page (P04). Optional: a hint-off arm of `--tag route` (`AWARDS_HOOK=0`) to isolate the hint.
3. Undecided: drop the demo mastheads' numbered markers (`04 — Typography`, `05 — Art direction`, `07 —`, `09 —`) and typography's `Study 01.` captions; if dropped, re-capture hero and typography `visuals/`.

## Deep modes (0.5.0) follow-ups

1. Done 2026-10-05: deep evals 3/3 each after the component hand-off fix; trigger-motion, trigger-webgl-hero and trigger-component-nav 3/3 (`evals/README.md`). Still open: a full `--tag smoke` run with the no-plugin baseline.
2. Real-GPU capture for the blocked lens sites: santionispirits (blocklists SwiftShader; card held back, techniques in the wave 4 ledger) and guillaumecolombel (WebGPU scene stalls headless). oxigen was dropped by the maintainer.
3. Shader playbook evidence is thin: three of its recipes rest on one site (cyphercapital). A future WebGL lens queue should widen it.

Updated 2026-09-23 after the human visual review. The older 0.2.0 closeout record below is
historical; `verification-log.md` remains its evidence ledger.

## Visual comparison closeout

1. Human choices are recorded: candidate Overall wins for Tidal Notes and Form & Sound, Kiln Nine
   Overall tie, and three Mobile ties. See the [comparison record](archive/visual-comparison-2026-09-22.md)
   and unchanged submitted JSON. All 18 requested reasons remain blank, as do technical evidence,
   case notes and both Kiln Nine reduced-motion checkboxes. Record any later rationale verbatim;
   do not infer it or treat those blanks as ties. Practical blinding is limited.
2. Preserve the failed technical acceptance result: candidate Kiln Nine and Form & Sound have
   focused primary-action C01 P1 failures. Secondary-copy P1s also remain. No generated-site repair,
   retry or extra paid judging is authorized. Human preference cannot clear these technical failures.
3. In separately scoped work: skill-routing non-use done (route hint, `--tag route` 3 / 3 to craft,
   2026-10-06); audit exception parsing done (stops at the next heading). Still open: rendered
   keyboard-focus/surface contrast verification (capture now records focus-visible frames, but no
   check measures their contrast). Static checkpoint/guide wording effectiveness is unmeasured.
   Keep current frozen snapshots and raw pilot evidence unchanged.
4. In separately scoped corpus maintenance, correct or demote the pre-existing The Line narrative
   sequence attribution and distinguish the reconstructed 768px typography breakpoint from the live
   1024px card observation. Keep either correction outside the frozen visual-library candidate.
5. A real phone and GPU pass remains necessary for WebGL performance claims. Headless captures do
   not establish frame rate or device quality. Retain earlier aborted monolithic-browser evidence.

## Earlier 0.2.0 closeout record

1. **Phase 7 — close out the build tier's findings.** Both tiers have now run. Smoke meets every
   bar. The build tier ran on 2026-09-21 ($27.68, 33 min): 2/6 cases all-green, **36 of 41 graders
   passed**, every skill fired. Six failures, diagnosed in the ledger, **none fixed yet**:
   - ~~Fix the `--allow-tools` grant.~~ **Done and verified**: `Bash` is granted whole in all three
     places that document the command. `audit.mjs` and `capture.mjs` now execute inside an eval.
   - ~~Three grader defects.~~ **Done and verified**, `jury-generic-saas` 0.67 → 1.00 over two runs
     ($3.17). `scores-present` matches the contract format; `pin-kept` reads `index.html`;
     `fixes-ordered-and-specific` no longer fails a reply that correctly reaches `rebuild` and names
     direction work as its first fix.
   - ~~One real skill gap in `research`.~~ **Done and verified**, 4 / 4 twice: the skill now
     separates a host that cannot exist from a site that is merely unreadable, and `card-written`
     accepts either correct outcome.
   - ~~One timeout on `build-antarctic-site`.~~ **Raised to 3600**, from the Phase 8 measurement of
     129 turns and 2,567 s for the same prompt. Reasoned from a measurement, not re-tested — the
     next build-tier run is what confirms it.
   - The baseline arm does not need running again. Measured over 102 runs: every `skill-fired`
     grader scores 0 without the plugin, and all six negatives pass trivially there. The one
     informative row was `trigger-jury` (`disposition-line` 3/3 with, 0/3 without).
   - ~~Re-run the build tier.~~ **Done 2026-09-21**: 39 / 41 graders, 4 / 6 cases all-green, $41.43.
     It surfaced two more grader defects, both since repaired. A **third run** confirmed them at
     40 / 42 graders and 4 / 6 cases, $44.37. That run found two more things, both now fixed and
     **neither re-measured**: `build-antarctic-site` exhausted `max_turns` (151 of 150) inside its
     raised time cap, so the cap is 200 now; and the jury skill drifted off its own reply contract,
     writing the axes as a table, so the contract is a literal block in the skill.
   - The jury contract was then sampled on its own for $1.63: **6 / 6**, and the shape held where it
     had drifted. It also showed "end your reply with the block" is stricter than the need — the
     reply led with the block and dropped the closing sentence — so the skill now asks for it
     verbatim and unbroken at either end. **That last wording change is unsampled.** The turn cap is
     unsampled too, and is arithmetic from three measurements (129, 153, 151 turns against a cap of
     200); a tier run to watch it costs about $44, of which `build-antarctic-site` is $32.
   - Budget note: three smoke cases × three runs cost $6.64, not the ≈ $2 estimated. The build tier
     came in at $27.68 against a $45 ceiling, and the two grader verification runs at $3.17.
2. ~~**Phase 8 — one real end-to-end build.**~~ **Done 2026-09-21**, $23.89, every check in the plan
   met, and **`archive/plan.md` risk 2 is resolved** — the forked jury's literal `disposition:` line reaches
   the user verbatim. Details in the ledger. It left one defect, **since fixed**:
   `scripts/audit.mjs` resolved its project root from `process.cwd()`, so auditing from inside
   `public/` wrote the report there and the build shipped it — and, less visibly, dropped every
   signed-off `## Exceptions` entry, since those are read from the same place. It now walks up from
   the audited target to the nearest `AWARDS.md`, falling back to cwd where there is none.
3. ~~**Phase 9 — docs and version.**~~ **Done 2026-09-21.** Both manifests are at 0.2.0, the
   release notes are in `README.md`, the counts are corrected everywhere, and the verification
   block at the end of `archive/plan-0.2.md` was run. **Nothing is pushed and no pull request is open** —
   the plan says to stop and report first, and that still stands.

## Out of scope for 0.2.0 by decision, still worth doing

4. **Real-device pass on the GL recipes** (a phone and a laptop GPU): `gl-fluid-wake-post`,
   `gl-dom-tethered-planes`, `gl-postprocessing-presets`, `gl-virtual-scroll-camera`, `gl-msdf-text`.
   Adjust the thresholds in `recipes/_shared/quality-tiers.js` from measured frame rates; they are
   guesses today. This is a human task — headless SwiftShader cannot answer it.
5. **Framework adapters as code.** The recipes carry adapter notes;
   `recipes/<id>/adapters/{react.tsx,vue.vue,svelte.svelte,astro.astro}` are unwritten for the P0
   set, and `assets/scaffold/` has only `vite-vanilla` (the stack skill routes other stacks to
   `references/stacks/*.md`).

## Smaller, open

6. **Slosh Seltzer's captures show its WebGL gate, not the site.** Its card records this and its
   confidence stayed medium-high. A capture through a GL-capable browser would close it.
7. **The fifteen site cards that disclaim the manifest's LCP by hand** still say "the manifest's LCP
   figures". The field is now `lcpColdSynthetic` and carries its own warning, so those sentences are
   redundant rather than wrong. Tidy them only if a card is being edited anyway.

## Closed since 0.1.0

Everything else on the old list. The corpus is live-verified 19/19 (item 5), the flagged conflicts
are resolved (6), both P2 recipes ship (7), `allowed-tools` is on every skill (8), the cold-LCP
defect is fixed (9), `_index.md` has its `Last verified` column (12), and pull request #1 is merged
(13). `tools/extract-report.mjs` (11) was never needed and is **dropped**, not deferred. Details and
evidence for each are in `verification-log.md`.
