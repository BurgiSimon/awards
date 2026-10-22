# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Claude Code and Codex plugin, `plugins/awards/`, for designing and building award-worthy (Awwwards-league) websites and components. The repo root is also the plugin marketplace (`.claude-plugin/marketplace.json`). There is no application code at the root: everything lives under `plugins/awards/`.

Continuing the work: read `docs/handoff/state.md` and `docs/handoff/todo.md` first. `docs/handoff/archive/plan.md` is the original approved specification (history; `state.md` is current), `docs/handoff/decisions.md` the record of choices already made (do not re-litigate them).

## Commands

All paths below are relative to `plugins/awards/`.

```bash
claude plugin validate .                                  # manifest, skills, agent, hook
claude --plugin-dir plugins/awards                        # from the repo root: load the plugin locally

cd recipes && npm install                                 # once; pinned deps for every recipe
node ../scripts/verify-recipes.mjs                        # all 78 entries: vite build, serve, headless Chromium + SwiftShader WebGL
node ../scripts/verify-recipes.mjs --only boot-lenis-gsap,marquee-raf-mask   # one or a few recipes
node ../scripts/verify-recipes.mjs --no-build --json      # reuse recipes/dist, machine-readable report
node ../scripts/verify-recipes.mjs --only <id> --pseudo --lock <path>   # build just that entry; +40 % text and right-to-left on a phone; wait for other runs sharing dist/
npm run dev                                               # from recipes/: Vite dev server with the recipe index page

node scripts/audit.mjs recipes                            # craft-floor audit; must stay free of P0–P2 findings
node scripts/audit.mjs <dir|file|url> [--json] [--quick] [--render]
node scripts/doctor.mjs <project-dir> [--json]             # prerequisites + actual browser launch, no installs
node scripts/capture.mjs <url|file|dir> [--out .awards/captures] [--states <json-file>] [--wheel <px>]   # jury evidence: scroll positions at desktop, tablet and phone, ARIA trees, reduced motion
node scripts/capture.mjs <target> --timeline 0,400,1200 | --video | --throttle | --gpu | --baseline <earlier capture dir>   # held-clock frames, webm, 4x CPU + slow 4G phone, hardware-GPU frame times, pixel diff per frame
node scripts/new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--keep-existing] [--dry-run]
node scripts/roll.mjs --deal 3 --of 7 [--seed <key>]      # seeded direction roll used by the concept skill
node scripts/check-versions.mjs [--json] [--strict]        # every versions.md pin against the npm registry's latest, no install
node scripts/calibration.mjs [--since 2021] [--json]       # the score figures the rubric quotes, recomputed from the site cards
node scripts/crux.mjs <url> [--origin]                     # Chrome UX Report field p75 for a live site (needs CRUX_API_KEY)
node scripts/fonts.mjs search --category <class> --seed <key> | specimen --fonts <ids> --text "<headline>" | fetch --font <id>   # character-first faces from Fontsource
node scripts/design-md.mjs lint | export --format dtcg|css-tailwind|json-tailwind | snapshot --label round-n | diff   # DESIGN.md through Google's design.md CLI (pinned 0.4.0, npx); unmeasured offline
node scripts/assets.mjs add --file <f> --kind owned|licensed|generated|drawn|placeholder | check [dir] | credits   # the project's asset and licence log
node scripts/skeleton.mjs <url|dir> --out <file.png>       # composition block map + measured fingerprint of one page (owner policy first)
node scripts/corpus-skeletons.mjs [--only slug,…] [--missing] [--table-only]   # every card's skeleton and references/sites/_fingerprints.md

node scripts/lint-refs.mjs                                 # every [site:]/[clone:]/[recipe:]/[pattern:] and ${CLAUDE_PLUGIN_ROOT} path resolves
node scripts/build-index.mjs [--dir .awards/sites] [--check]   # references/sites/_index.md table from the card headers; never typed by hand
node scripts/check-card.mjs <card.md> | --all              # header rows and vocabularies (scripts/data/corpus-vocab.json), nine sections, length, labels, quotes
node scripts/corpus-gaps.mjs                               # card counts by class, industry, mode, dosage, routes against the floors; where to look
node scripts/corpus-prepass.mjs --queue awardsworthysites.md [--capture]   # model-free wave pre-pass: DNS, owner policy, signatures, existing cards, captures
node scripts/corpus-health.mjs [--only slug,…]             # quarterly: DNS, HTTP and asset-list hash per card URL against references/sites/_health.json
node scripts/build-catalogue.mjs [--check]                 # recipes/README.md catalogue from recipe.json; tags against scripts/data/recipe-tags.json
node scripts/check-sync.mjs                                # manifest versions, pins vs versions.md, scaffold/_shared copies, LICENSE/NOTICE, quoted counts
node evals/behavior.mjs                                   # serial browser/tool regressions; needs recipes/node_modules + Playwright
node evals/selftest.mjs                                   # every file-target grader must fail on untouched input
node evals/codex-install.mjs --build                       # isolated install, discovery and both scaffold builds (needs recipes/node_modules)

node evals/pick.mjs [base-ref]                              # which paid cases a change needs, with the commands (free)
node evals/regrade.mjs <case> <kept-workspace>             # re-grade a --keep-temp run with the current graders, no model call
claude plugin eval . --case <name> --runs 1 --ablation none --trust-plugin --max-cost-usd 0   # load and validate a case, no model call
claude plugin eval . --tag smoke                          # 15 routing cases (3 deep-mode) + 10 negatives, no-plugin baseline (model calls, costs money)
claude plugin eval . --tag contract --runs 1 --ablation none --allow-tools Write Edit WebFetch Bash   # brief → concept → system only, a few dollars a case
claude plugin eval . --tag deep --runs 3 --ablation none     # the 3 deep-mode routing cases only
claude plugin eval . --tag route --runs 3 --ablation none --allow-tools Write Edit WebFetch Bash   # unled long brief, full tools: does it reach craft
claude plugin eval . --case trigger-jury --runs 1 --ablation none   # one case, cheapest iteration
claude plugin eval . --tag build --scaffold --runs 1 --ablation none --allow-tools Write Edit WebFetch Bash   # 20–30 min per case; Bash whole, not Bash(node *): those match a command prefix and deny everything the skills actually run
```

CI: `.github/workflows/checks.yml` runs the free checks above (check-sync, lint-refs, the self-tests, the recipes audit gated at P0–P2, the recipes build, both validates) on Node 22 and 24 for every push to `main` and every pull request; `behavior.mjs` and `verify-recipes` run only on a manual dispatch with `browser` ticked. No paid eval runs in CI.

Requirements: Node 22 LTS (22.12+) or 24 LTS; 20.19+ still runs the scripts but reached end of life on 2026-04-30, and `doctor.mjs` checks the running Node against every installed package's `engines.node`. Playwright plus its Chromium browser (global or project-local) for `verify-recipes`, `capture` and `audit --render`. Verification outputs (`recipes/_verify/`, `recipes/dist/`, `evals/results/`, `.awards/`) are gitignored. Headless SwiftShader proves recipes correct, not fast.

## Architecture

**Skills route by written hand-off, not code.** Eleven skills in `skills/<name>/SKILL.md`: `craft` orchestrates (brief → concept → system → structure → stack → motion → webgl → jury → ship) and owns `AWARDS.md`; the ten others are independently triggerable. Skills cannot call each other, so every phase transition is a literal instruction line "Invoke the `awards:<name>` skill now with the Skill tool…". Skill descriptions are the trigger surface (1,536-char cap); the `no-trigger-*` evals guard against over-triggering.

**Deep modes, not more skills.** `motion --gsap`, `webgl --shader` and `webgl --3d` switch on from the contract, dosage or score or by flag, record themselves on the `Deep modes:` line of `AWARDS.md ## Budgets & tiers`, and load `references/patterns/gsap-choreography.md`, `webgl-shaders.md` or `webgl-3d-scenes.md`. Those playbooks are filled only by corpus waves with a tech lens (`### Tech lens:` at the end of a card's §5); the `trigger-*-deep` evals check the mode fires and the playbook is actually read.

**Corpus lives at the plugin root, never inside skill folders.** Skills reference `${CLAUDE_PLUGIN_ROOT}/references/…`, `…/recipes/…`, `…/scripts/…`. Cross-references use `[site:slug]`, `[clone:slug]` (a clone-level card, never rendered live; `floema-jewelry` is the one), `[recipe:id]` and `[pattern:file#anchor]` forms that must resolve to real files (`references/sites/<slug>.md`, `recipes/<id>/`, `references/patterns/<file>.md`). `references/patterns/visual-composition.md` selects the six visual examples and their reviewed desktop/mobile images.

**Durable project files** in a user's project: `AWARDS.md` (brief, direction contract, page map, motion score, budgets, jury and ship logs, exceptions), `DESIGN.md` (tokens and rules), `.awards/` (captures, reports, audit JSON). Templates in `assets/templates/`, the Vite scaffold in `assets/scaffold/vite-vanilla/`.

**Jury is forked and evidence-first.** `skills/jury` runs with `context: fork` and `agent: awards-jury` (`agents/awards-jury.md`) so the build conversation cannot anchor it. It scores Design 40 / Usability 30 / Creativity 20 / Content 10 plus developer criteria, must end with a literal `disposition: ship|fix|rebuild|recapture` line, and never edits the build. `craft` relays that reply unchanged.

**Hooks.** `hooks/hooks.json` runs `audit.mjs --quick --changed-file -` on every `Edit|Write`, silent unless the project has an `AWARDS.md`. On `UserPromptSubmit` it runs `scripts/route-hint.mjs`, which adds one routing line (craft by default; jury, webgl, motion, component or concept when the prompt says so) only when the prompt carries explicit award framing; a hint, not a gate (`node scripts/route-hint.mjs --selftest` checks it against the eval prompts). On `SessionStart` after compaction it runs `scripts/state-card.mjs`, which re-attaches a short state card from `AWARDS.md` (phase, next skill, deep modes, last jury and ship lines) while a build is unfinished, because compaction keeps only the most recently invoked skills and craft drops out first. On `SubagentStop` for the forked juror, `scripts/jury-reply-check.mjs` blocks once when the reply lacks its literal `disposition:` line (craft routes on it). `AWARDS_HOOK=0` or the `hooks_enabled` userConfig option disables all four; `userConfig` also carries `default_stack`. No `Stop` hook by design. The Codex manifest declares `"hooks": {}` so Codex loads none of them; `check-sync.mjs` and `evals/codex-install.mjs` (its `hooks/list` check) hold that.

**Recipes are a contract.** The catalogue has 77 focused recipes and one complete composition, 78 verifiable entries. Each `recipes/<id>/` holds `index.html`, `main.js`, `style.css`, `README.md`, `recipe.json` (`id, title, intent, group, summary, tags, deps, tier, variants, seenIn, verified`; groups and tags come from the controlled vocabulary in `scripts/data/recipe-tags.json`, and `scripts/build-catalogue.mjs` writes the `recipes/README.md` table from these files, never by hand) and `verify.mjs` exporting `states`, `probe(), assert(results)` and optionally `inspect(page, state)`, which runs in Node on the same page after the probe (accessibility tree, ARIA snapshot, CDP) and lands in `results[state].inspect`. `verify-recipes.mjs` builds all entries with `recipes/vite.config.mjs`, serves `dist/`, drives each state (scroll fraction, viewport, reducedMotion, actions) and, with `--stamp` (a release step), records the pass in `recipe.json.verified`. Every page exposes `window.__awards = { ready, scrollTo, state }` via `_shared/awards-hook.js`, which is what `capture.mjs` and the jury use to drive pages. Shared modules: `_shared/raf.js` (single ticker), `reduced-motion.js` (full / reduced / static tiers), `quality-tiers.js` (device probe → DPR/pixel budgets), `tokens.css`, `base.css`, and the visual examples' `_shared/composition.css`.

**Runtime checks.** `scripts/doctor.mjs` checks prerequisites without changing configuration. `scripts/lib/actions.mjs` drives both recipe verification and `capture.mjs --states`; external JSON uses selector waits, while trusted recipe states may use predicates. The schema and exit codes live in `references/capture-states.md`. `evals/behavior.mjs` tests real behavior (no model calls); never run it alongside recipe/browser verification.

**Audit** (`scripts/audit.mjs`) is rule-driven from `scripts/data/rules.json` (88 rules, prefixes T fonts, C colour, M motion, A accessibility, L layout, P performance, S surfaces and meta, X slop) with helpers in `scripts/lib/`. Rule M03 judges only the tween or trigger that owns a `scrub`. The X rules and T07/T08, L04–L08 are the slop scan's deterministic half; `references/anti-patterns.md#the-slop-scan` maps every habit to its rule or to `judge`, and `scripts/data/reflex-copy.json` holds the copy lists. L06–L10, T08, X20, X21, C05, A12, A14, A16, P08 and P09 run only under `--render`, at desktop, tablet (834 px) and phone widths, and C01 is re-measured there: every visible text against what is actually behind it (the paint stack under its centre, or its ancestors' fills), then each control in its keyboard-focus state (A12 for the ring). C05 compares the rendered ground with the DESIGN.md ground token; A16 runs axe-core's WCAG 2.2 A/AA rules (contrast and target size excluded) when `axe-core` resolves from the project or the recipes, and the JSON says `axe: unmeasured` otherwise. L09 and L10 come from one scroll through the page (blank viewports; on tablet and phone, lopsided sections), P08 from layout shift during load. A rendered step that throws or hangs becomes an `ERR` finding at P1 rather than a silent pass, a failed browser launch exits 3, and a bundler project renders its build output (`dist/`, `build/`, `out/`, `.output/public`) when one exists, with a warning when it is older than `src/` or missing (`renderedFrom` in the JSON).

**Evals** follow the `claude plugin eval` layout: `evals/<case>/{prompt.md,case.yaml,graders/*.md}`, optional `fixture/` + `fixture.sh` (needs `--scaffold`). Prefer `regex`, `tool_used`, `tool_order`, `file_exists` graders; one `llm` grader only where judgement is unavoidable. `prompt.md` must not name skills. Tiers: smoke, contract, resume (`context.history_file`), route, coexist (beside GreenSock's gsap-skills, fetched by `evals/_vendor-fetch.sh`) and build.

## Conventions that bite

- Recipe stylesheets `@import '../_shared/base.css'` themselves rather than linking it from HTML. Vite emitted the shared chunk after the recipe CSS and reversed the cascade.
- Lenis 1.3 defaults to `autoRaf: false`. Every recipe drives `lenis.raf(time)` from the GSAP ticker or the shared ticker; a Lenis with no clock swallows wheel events and the page looks frozen.
- Custom `ShaderMaterial`s include `#include <colorspace_fragment>`, otherwise sRGB textures and render targets render dark.
- Distance-field shaders divide by `max(fwidth(d), 1e-5)`. A padded atlas is flat almost everywhere, `fwidth` is exactly zero there, and the division renders the whole quad opaque under SwiftShader.
- Pinned library versions live in `recipes/package.json` and `references/stacks/versions.md`; keep them in sync. Keep `version` in `plugins/awards/.claude-plugin/plugin.json`, `plugins/awards/.codex-plugin/plugin.json` and `.claude-plugin/marketplace.json` in sync. Keep the root and plugin copies of `LICENSE` and `NOTICE.md` in sync. `scripts/check-sync.mjs` checks all of these (and the skill, recipe and rule counts the descriptions quote); CI runs it.
- Original prose only: the workflow shape echoes the *impeccable* skill, its wording never does. Site copy is quoted in fragments of at most 25 words. Every fact on a site card carries `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`.
- No model identifiers in any repository artefact (code, docs, commit titles or bodies). Commit messages end with the attribution footer the session provides.
- Fonts: recipes use system stacks and never ship font files.
- Playwright quirks recorded in `docs/handoff/state.md`: `page.hover` scrolls into view and `scroll` fires a frame later; `mouse.wheel` needs a live Lenis clock; `readPixels` after a composer render needs the default framebuffer and a fresh render in the same task.
