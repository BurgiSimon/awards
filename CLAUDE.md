# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Claude Code plugin, `plugins/awards/`, for designing and building award-worthy (Awwwards-league) websites and components. The repo root is also the plugin marketplace (`.claude-plugin/marketplace.json`). There is no application code at the root: everything lives under `plugins/awards/`.

Continuing the work: read `docs/handoff/state.md` and `docs/handoff/todo.md` first. `docs/handoff/plan.md` is the approved specification, `docs/handoff/decisions.md` the record of choices already made (do not re-litigate them).

## Commands

All paths below are relative to `plugins/awards/`.

```bash
claude plugin validate .                                  # manifest, skills, agent, hook
claude --plugin-dir plugins/awards                        # from the repo root: load the plugin locally

cd recipes && npm install                                 # once; pinned deps for every recipe
node ../scripts/verify-recipes.mjs                        # all 30 recipes: vite build, serve, headless Chromium + SwiftShader WebGL
node ../scripts/verify-recipes.mjs --only boot-lenis-gsap,marquee-raf-mask   # one or a few recipes
node ../scripts/verify-recipes.mjs --no-build --json      # reuse recipes/dist, machine-readable report
npm run dev                                               # from recipes/: Vite dev server with the recipe index page

node scripts/audit.mjs recipes                            # craft-floor audit; must stay free of P0–P2 findings
node scripts/audit.mjs <dir|file|url> [--json] [--quick] [--render]
node scripts/capture.mjs <url|file|dir> [--out .awards/captures] [--wheel <px>]   # jury evidence: three scroll positions, phone, reduced motion
node scripts/new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--dry-run]
node scripts/roll.mjs --deal 3 --of 7 [--seed <key>]      # seeded direction roll used by the concept skill

node scripts/lint-refs.mjs                                 # every [site:]/[recipe:]/[pattern:] and ${CLAUDE_PLUGIN_ROOT} path resolves
node evals/selftest.mjs                                   # every file-target grader must fail on untouched input

claude plugin eval . --tag smoke                          # 11 routing cases with no-plugin baseline (model calls, costs money)
claude plugin eval . --case trigger-jury --runs 1 --ablation none   # one case, cheapest iteration
claude plugin eval . --tag build --scaffold --runs 1 --ablation none --allow-tools Write Edit WebFetch "Bash(node *)" "Bash(npm *)"   # 20–30 min per case
```

Requirements: Node 20+, Playwright (global or project-local) for `verify-recipes`, `capture` and `audit --render`. Verification outputs (`recipes/_verify/`, `recipes/dist/`, `evals/results/`, `.awards/`) are gitignored. Headless SwiftShader proves recipes correct, not fast.

## Architecture

**Skills route by written hand-off, not code.** Eleven skills in `skills/<name>/SKILL.md`: `craft` orchestrates (brief → concept → system → structure → stack → motion → webgl → jury → ship) and owns `AWARDS.md`; the ten others are independently triggerable. Skills cannot call each other, so every phase transition is a literal instruction line "Invoke the `awards:<name>` skill now with the Skill tool…". Skill descriptions are the trigger surface (1,536-char cap); the `no-trigger-*` evals guard against over-triggering.

**Corpus lives at the plugin root, never inside skill folders.** Skills reference `${CLAUDE_PLUGIN_ROOT}/references/…`, `…/recipes/…`, `…/scripts/…`. Cross-references use `[site:slug]`, `[recipe:id]` and `[pattern:file#anchor]` forms that must resolve to real files (`references/sites/<slug>.md`, `recipes/<id>/`, `references/patterns/<file>.md`).

**Durable project files** in a user's project: `AWARDS.md` (brief, direction contract, page map, motion score, budgets, jury and ship logs, exceptions), `DESIGN.md` (tokens and rules), `.awards/` (captures, reports, audit JSON). Templates in `assets/templates/`, the Vite scaffold in `assets/scaffold/vite-vanilla/`.

**Jury is forked and evidence-first.** `skills/jury` runs with `context: fork` and `agent: awards-jury` (`agents/awards-jury.md`) so the build conversation cannot anchor it. It scores Design 40 / Usability 30 / Creativity 20 / Content 10 plus developer criteria, must end with a literal `disposition: ship|fix|rebuild|recapture` line, and never edits the build. `craft` relays that reply unchanged.

**Hook.** `hooks/hooks.json` runs `audit.mjs --quick --changed-file -` on every `Edit|Write`; it is silent unless the project has an `AWARDS.md`, and `AWARDS_HOOK=0` disables it. No `Stop` hook by design.

**Recipes are a contract.** Each `recipes/<id>/` holds `index.html`, `main.js`, `style.css`, `README.md`, `recipe.json` (`id, title, tags, deps, tier, variants, seenIn, verified`) and `verify.mjs` exporting `states`, `probe(), assert(results)`. `verify-recipes.mjs` builds all recipes with `recipes/vite.config.mjs`, serves `dist/`, drives each state (scroll fraction, viewport, reducedMotion, actions) and stamps `recipe.json.verified` on pass. Every page exposes `window.__awards = { ready, scrollTo, state }` via `_shared/awards-hook.js`, which is what `capture.mjs` and the jury use to drive pages. Shared modules: `_shared/raf.js` (single ticker), `reduced-motion.js` (full / reduced / static tiers), `quality-tiers.js` (device probe → DPR/pixel budgets), `tokens.css`, `base.css`.

**Audit** (`scripts/audit.mjs`) is rule-driven from `scripts/data/rules.json` (55 rules, prefixes T fonts, C colour, M motion, A accessibility, L layout, P performance, S surfaces, X slop) with helpers in `scripts/lib/`. Rule M03 judges only the tween or trigger that owns a `scrub`.

**Evals** follow the `claude plugin eval` layout: `evals/<case>/{prompt.md,case.yaml,graders/*.md}`, optional `fixture/` + `fixture.sh` (needs `--scaffold`). Prefer `regex`, `tool_used`, `file_exists` graders; one `llm` grader only where judgement is unavoidable. `prompt.md` must not name skills.

## Conventions that bite

- Recipe stylesheets `@import '../_shared/base.css'` themselves rather than linking it from HTML. Vite emitted the shared chunk after the recipe CSS and reversed the cascade.
- Lenis 1.3 defaults to `autoRaf: false`. Every recipe drives `lenis.raf(time)` from the GSAP ticker or the shared ticker; a Lenis with no clock swallows wheel events and the page looks frozen.
- Custom `ShaderMaterial`s include `#include <colorspace_fragment>`, otherwise sRGB textures and render targets render dark.
- Distance-field shaders divide by `max(fwidth(d), 1e-5)`. A padded atlas is flat almost everywhere, `fwidth` is exactly zero there, and the division renders the whole quad opaque under SwiftShader.
- Pinned library versions live in `recipes/package.json` and `references/stacks/versions.md`; keep them in sync. Bump `version` in `plugins/awards/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together.
- Original prose only: the workflow shape echoes the *impeccable* skill, its wording never does. Site copy is quoted in fragments of at most 25 words. Every fact on a site card carries `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`.
- No model identifiers in any repository artefact (code, docs, commit titles or bodies). Commit messages end with the attribution footer the session provides.
- Fonts: recipes use system stacks and never ship font files.
- Playwright quirks recorded in `docs/handoff/state.md`: `page.hover` scrolls into view and `scroll` fires a frame later; `mouse.wheel` needs a live Lenis clock; `readPixels` after a composer render needs the default framebuffer and a fresh render in the same task.
