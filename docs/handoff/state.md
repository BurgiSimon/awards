# State of the awards plugin — 2026-09-18

Written at the end of the session that built the plugin, for whoever (human or model) continues it. Read this first, then `todo.md`, then `plan.md` for the full specification.

## Where things are

| Item | Location |
|---|---|
| Repository | `github.com/BurgiSimon/awards`, branch `claude/award-worthy-website-skill-rbcead`, pull request #1 (open, created from the Claude Code UI) |
| Plugin | `plugins/awards/` (manifest `plugins/awards/.claude-plugin/plugin.json`, version 0.1.0); marketplace manifest `.claude-plugin/marketplace.json` at the repo root |
| Skills | `plugins/awards/skills/{craft,concept,system,structure,stack,motion,webgl,component,jury,ship,research}/SKILL.md` |
| Agent and hook | `plugins/awards/agents/awards-jury.md`, `plugins/awards/hooks/hooks.json` |
| Reference corpus | `plugins/awards/references/` — 19 site cards + `_index.md` + `_TEMPLATE.md`, 14 pattern files, `jury/{rubric,usability-walk,report-template}.md`, `craft-floor.md`, `anti-patterns.md`, `reflex-lists.md`, 11 stack and library notes |
| Recipes | `plugins/awards/recipes/` — 28 folders, `_shared/`, `README.md` catalogue, `package.json` (pinned deps), `vite.config.mjs`, `_verify/` (gitignored screenshots and `report.json`) |
| Scripts | `plugins/awards/scripts/{capture,audit,new-project,roll,verify-recipes}.mjs`, `scripts/lib/*`, `scripts/data/{rules.json,reflex-fonts.json}` |
| Templates and scaffold | `plugins/awards/assets/templates/{AWARDS.md,DESIGN.md,jury-report.md,ship-report.md,404.html}`, `plugins/awards/assets/scaffold/vite-vanilla/` |
| Evals | `plugins/awards/evals/` — 11 smoke cases, 6 build cases with fixtures, `README.md`; `results/` gitignored |
| Docs | `README.md`, `NOTICE.md`, `LICENSE` (MIT), `plugins/awards/README.md`, this folder |
| Original input | `awardsworthysites.md` (the user's list of 19 sites) |

## What is verified

- `claude plugin validate plugins/awards` passes (CLI 2.1.274).
- `node scripts/verify-recipes.mjs`: 28 / 28 recipes pass in headless Chromium 141 with SwiftShader WebGL 2, at desktop 1440×900 and mobile 390×844, with reduced-motion emulation and keyboard, hover, drag and wheel actions (last full run 2026-09-18T04:23Z). Screenshots per state in `recipes/_verify/<id>/`.
- `node scripts/audit.mjs recipes`: 0 P0, 0 P1, 0 P2; the remaining P3 findings are the missing Open Graph image on demo pages (documented as deliberate). `audit.mjs assets/scaffold/vite-vanilla`: clean.
- The hook: silent without `AWARDS.md` (≈ 0.23 s including Node start), findings as `hookSpecificOutput.additionalContext` with it (≈ 0.1 s), silent with `AWARDS_HOOK=0`.
- One eval case ran for real (`claude plugin eval . --case trigger-jury --runs 1 --ablation none`): the jury skill fired and named the usability axis; the disposition grader failed on formatting and was loosened (`disposition\W{0,8}(ship|fix|rebuild|recapture)`). Cost ≈ $0.21, 55 s. The rest of the suite has not been run.
- Static lint (a throwaway script, not committed): every `[site:slug]`, `[recipe:id]`, `[pattern:file#anchor]` and `${CLAUDE_PLUGIN_ROOT}/…` reference in skills, agent, references and recipe READMEs resolves; no model names in repository artefacts.

## What is not verified

- No recipe or skill has run on a real GPU or a real phone; SwiftShader proves correctness, not frame rate.
- The skills have not been exercised end to end on a real project (`/awards:craft` through `ship`). Their content follows the plan and the conventions, but the first real build will surface wording that needs tightening; the eval suite exists for that.
- The 19 site cards were compiled without loading any of the sites (egress blocked everything except GitHub, npm, PyPI and code.claude.com). Every fact carries a confidence label; scores and dates came from search extraction; seven sites (batches D–E) were analysed from GitHub sources and recall after the session's web-search budget (200 calls) was exhausted.
- The Awwwards weighting 40 / 30 / 20 / 10 is recalled, not fetched; it reproduces the corpus arithmetic (Oryzo 7.9 / 7.51 / 8.35 → 7.86 implies Content ≈ 7.77).
- `claude plugin eval` build cases assume `--scaffold` and tool grants; inside the eval sandbox `npm install` and Playwright usually cannot run, and the prompts tell Claude to say so and continue.

## Environment facts that shaped the work

- Sandbox egress: only `github.com`, `api.github.com`, `raw.githubusercontent.com`, `registry.npmjs.org`, `pypi.org`, `code.claude.com`. The 19 sites, awwwards.com, archive.org and every gallery were unreachable for curl, Playwright and WebFetch. GitHub API search endpoints were blocked; GitHub HTML search worked through WebFetch with 429s after bursts.
- Headless Chromium (Playwright 1.56.1, global npm, browsers at `/opt/pw-browsers`) renders local pages served by `scripts/lib/server.mjs`; WebGL 2 via `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`; float and half-float render targets available; `emulateMedia({ reducedMotion })`, View Transitions and scroll-driven animations supported.
- Context7 works for library docs (GSAP `/websites/gsap_v3`, Lenis `/darkroomengineering/lenis`, Anime.js `/websites/animejs`).
- Background agents were killed three times by the account's usage limit (session limit resets on a five-hour window; the message also cited a monthly spend limit). Each time, finished files survived because agents wrote per file; the missing parts were written in the main session. Spawn few agents at a time.
- Playwright quirks that cost time: `page.hover` scrolls the element into view and the `scroll` event arrives a frame later (measure rects on the next pointer event, not on the scroll event); a `scroll` applied after a hover moves the element out from under the pointer (scroll first, or scroll by wheel inside the actions); `mouse.wheel` needs a live Lenis clock to move a Lenis page; `readPixels` after a composer render needs the default framebuffer bound and a fresh render in the same task.

## Timeline of the build

1. Research: five agents (batches A–E) plus a planning agent; raw reports in `research/`.
2. Plan approved by the user (`plan.md`), four decisions taken (`decisions.md`).
3. Phase 0 skeleton and templates; Phase 2 scripts (`capture`, `audit`, `roll`, `new-project`, `verify-recipes`) and the Vite scaffold.
4. Phase 1 corpus: 19 cards (7 by agents, 12 by the main session after agents were killed), index, jury files, craft floor, anti-patterns, reflex lists, 11 stack notes (agent), 14 pattern files (two agents, second attempt).
5. Phase 2 recipes: 15 P0 and 13 P1 (the plan's 30 minus two P2), all verified; fixes along the way for the CSS cascade order, Lenis `autoRaf`, shader colour space, the M03 audit rule.
6. Phase 3 skills, agent and hook (three agents killed mid-way; `component` and the jury's relay and tool-less rules written in the main session); `claude plugin validate` green.
7. Phase 4 evals: 17 cases, one smoke run.
8. Phase 5: README, NOTICE, release notes; push blocked by a missing GitHub App installation, then granted; the two earliest commits were rewritten to the `Claude <noreply@anthropic.com>` committer identity before the push; PR #1 opened from the UI.

## Numbers

| | |
|---|---|
| Commits on the branch (excluding the initial list) | 14 |
| Files in the plugin (excluding `node_modules`, `dist`, `_verify`, `results`) | ≈ 425 |
| Site cards / pattern files / stack notes | 19 / 14 / 11 |
| Recipes verified | 28 (15 P0, 13 P1) |
| Audit rules | 55 (`T` fonts, `C` colour, `M` motion, `A` accessibility, `L` layout, `P` performance, `S` surfaces, `X` slop) |
| Eval cases | 17 (11 smoke, 6 build) |
| Pinned versions | gsap 3.15.0, lenis 1.3.26, three 0.186.0, animejs 4.5.0, ogl 1.0.11, postprocessing 6.39.5, @unseenco/taxi 1.9.1, vite 8.3.0 (full list in `references/stacks/versions.md`) |
