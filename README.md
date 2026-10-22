# awards — award-worthy websites with Claude Code and Codex

A plugin for Claude Code and Codex that teaches the agent to design and build websites and single components in the league of award winners. It is built from a reference corpus of analysed award-winning sites, the pattern language they share, 88 focused recipes and one complete composition (89 browser-verifiable entries), a deterministic craft-floor audit, and a fresh-context jury that scores the way the real one does.

## Install

### Codex

From a local checkout of this repository:

```bash
codex plugin marketplace add /absolute/path/to/awards
codex plugin add awards@awards
```

Or install the published repository:

```bash
codex plugin marketplace add burgisimon/awards
codex plugin add awards@awards
```

Start a new Codex session and invoke `$awards:craft` for a site or `$awards:component` for one element. All eleven skills use the same `$awards:<name>` form and remain available for automatic selection. Install the whole plugin rather than copying individual skill folders: they share the corpus, recipes, scripts and templates.

Codex supports the existing [Claude-compatible marketplace format](https://developers.openai.com/plugins/build/plugins#how-local-marketplaces-work), so both clients use the same marketplace and skill files. The package includes a `.codex-plugin/plugin.json` compatibility manifest with Codex display metadata and starter prompts, alongside the Claude manifest. The [Codex runtime guidance](plugins/awards/references/codex.md) covers installed paths, phase handoffs, jury delegation and explicit audits. The hooks are Claude Code's alone: the Codex manifest declares none (`"hooks": {}`), which keeps the plugin eligible for Codex's public plugin directory, and Codex runs the audit after edit batches. Fresh-context jury reviews require available delegation; otherwise the report discloses that it used the current context.

### Claude Code

```
/plugin marketplace add burgisimon/awards
/plugin install awards@awards
```

For an unpublished local checkout, use `/plugin marketplace add /absolute/path/to/awards`, then `/plugin install awards@awards`. Local development from the repository root: `claude --plugin-dir ./plugins/awards`. Start with `/awards:craft` or `/awards:component`.

### Runtime requirements

Use a current Claude Code or Codex CLI with plugin support. Installation checks were run with Claude Code 2.1.278 and Codex CLI 0.155.1. Builds need Node **22 LTS (22.12+) or 24 LTS**. Node 20.19+ still runs the scripts and the Vite scaffold, but it reached end of life on 2026-04-30 and current Astro, Nuxt and SvelteKit releases refuse it; `scripts/doctor.mjs` checks the running Node against every installed package's `engines.node`. npm and network access are needed to install project dependencies. Context7 is optional; the skills can use official web documentation instead.

For captures, rendered audits and jury evidence, install Playwright **and Chromium** once, before the first build: the hero probe captures in phase 3, before the website project has a `package.json`.

```bash
npm install --global playwright@1.64.1
npx playwright install chromium
```

A project-local install (`npm install --save-dev playwright@1.64.1`) works too once the project exists. For an existing Playwright installation elsewhere, set `AWARDS_PLAYWRIGHT` to its parent project directory; `AWARDS_CHROMIUM` can point to an installed Chromium executable. Linux/cloud hosts may need `npx playwright install --with-deps chromium`. Static audits and scaffolding do not need a browser. If captures cannot be produced, the jury reports `recapture`.

Before a build or capture, run the non-installing environment check from the website project:

```bash
node /absolute/path/to/awards/plugins/awards/scripts/doctor.mjs . --json
```

It checks Node/npm, dependencies, output access and an actual Chromium screenshot. Exit 2 identifies missing prerequisites; warnings distinguish an unconfigured build or unavailable WebGL from a browser failure. Rerun after setup changes. For menus, keyboard focus, drags and theme reloads, pass `--states .awards/capture-states.json` to `capture.mjs`; see the [state-plan format and environment guidance](plugins/awards/references/capture-states.md).

### Cloud sessions and Cowork

Claude Code cloud sessions do not inherit plugins enabled only in your local user settings. In the **website repository** that should use Awards, merge this into `.claude/settings.json` and commit it once the plugin changes are published:

```json
{
  "extraKnownMarketplaces": {
    "awards": {
      "source": { "source": "github", "repo": "burgisimon/awards" }
    }
  },
  "enabledPlugins": { "awards@awards": true }
}
```

Provision Node and the browser dependencies in that cloud environment too. See [Claude's cloud skill loading rules](https://code.claude.com/docs/en/skills#skills-in-cowork-and-cloud-sessions).

For Cowork, install the **whole plugin** through Cowork → Customize → Plugins, using a custom plugin upload or an available marketplace. A terminal installation does not install it into Cowork. See [Claude's plugin installation guide](https://support.claude.com/en/articles/13837440-use-plugins-in-claude). After committing the release files, create a clean upload from the repository root:

```bash
git archive --format=zip --output=/tmp/awards.zip HEAD:plugins/awards
```

This includes committed files only. Do not upload individual `skills/<name>` folders as standalone skills: their shared resources live at the plugin root. Their names and descriptions follow the [Agent Skills specification](https://agentskills.io/specification); the frontmatter also retains Claude-specific invocation and jury settings. Cowork/cloud availability and browser permissions depend on the host; those sessions have not been tested here.

## Quick start

1. Install the plugin and Playwright (above), open an empty folder, and start Claude Code there.
2. Ask for the site in your own words, with the subject, the audience and what a visitor should do, for example: *"Build an award-worthy site for Saltglaze, a two-person stoneware studio. Collectors and restaurant buyers, often on a phone. The goal is enquiries for the next kiln opening."* `/awards:craft` is the explicit entry point; an award-framed request reaches it on its own.
3. You will be asked at most three questions about the brief, then once to choose between three dealt directions and a conventional exit. Everything else is decided and recorded in `AWARDS.md` and `DESIGN.md`, where you can change it.
4. A full build runs every phase, brief to ship, and takes long: the reference build took about 45 minutes and 150 turns, and roughly $27 of API usage at the eval runner's rates (`plugins/awards/evals/README.md`). Expect a long unattended run, not a chat.
5. The first jury verdict is usually `fix`, not `ship`. The jury is calibrated about 0.7 below the real award on purpose (`references/jury/rubric.md`), so `fix` with a short, located list is the normal result; ship applies it and the jury re-checks once.

What you get: the site in the folder, `AWARDS.md` (brief, direction contract, page map, motion score, budgets, jury and ship logs), `DESIGN.md` and `tokens.css`, and `.awards/` with captures, the audit and the jury and ship reports (gitignored).

**Permissions.** A build runs `node` scripts, `npm install`, `npm run build` and captures many times. The skills pre-approve their own scripts and those build commands; for the rest, auto mode (Claude Code's default starting mode for interactive sessions since 2.1.283) keeps prompts rare while a classifier checks each action. `acceptEdits` also works, with more prompts. Use `bypassPermissions` only in a disposable container or VM.

## Skills

The table uses Claude Code's `/awards:<name>` notation; use `$awards:<name>` in Codex.

| Skill | Use it for |
|---|---|
| `/awards:craft` | Build an award-worthy site end to end (brief → concept → system → structure → stack → motion → WebGL → jury → ship) |
| `/awards:concept` | The idea, narrative and signature interaction before any code; deals three directions and writes the direction contract |
| `/awards:system` | Type contract, colour strategy, tokens, `DESIGN.md` |
| `/awards:structure` | Page map, hero archetype, components, semantic skeleton, responsive strategy |
| `/awards:stack` | Scaffold Vite (default), Next, Nuxt, Astro, SvelteKit or a Webflow shell with Lenis + GSAP (+ Three) on one ticker |
| `/awards:motion` | The motion score: preloader, reveals, scrub, cursor, transitions, reduced-motion tiers; `--gsap` deep mode for timeline-led sites |
| `/awards:webgl` | Three.js / OGL / R3F layer, shaders, asset pipeline, quality tiers, fallbacks; `--shader` and `--3d` deep modes |
| `/awards:component` | One award-worthy component inside an existing site |
| `/awards:jury` | Score like a design-award jury in a fresh context; ordered fixes; a disposition |
| `/awards:ship` | Fix batch, audit, captures, performance, accessibility, meta; the ship report |
| `/awards:research` | Turn a reference site into a corpus case study |

Every skill also triggers on its own request ("add a custom cursor", "judge this page", "set up Vite with GSAP and Three"); `craft` is the entry point for a whole site and routes single elements to `component` and critiques to `jury`.

Three ways into a whole site:

- `/awards:craft --quick` for one landing page: the same contract, one jury round, no component passes.
- `/awards:craft redesign <url or folder>` for an existing site: a baseline capture and critique first, a content inventory, and the old site's faults as the new contract's refusals, on a branch.
- `/awards:craft` for the full build. Name the award programs in the brief (`programs: awwwards, cssda`) and the jury reports a target line for each.

## How a build runs

1. **Brief.** `craft` copies `AWARDS.md` into the project, asks at most three questions, records the visitor mode and every synthetic asset.
2. **Concept.** `concept` reads the corpus index, picks the three nearest case studies, deals three directions with a seeded roll, and writes the direction contract: THESIS, WORLD, STORY, FIRST VIEWPORT, SIGNATURE, SCROLL MODEL, LOAD & CLOSE, DIVERGENCE. The thesis refuses three ruts by name: the category's, the Awwwards register and the template hero.
3. **System, structure, stack.** Read selected desktop/mobile examples from the visual composition guide; write `DESIGN.md` (calibrated against the three chosen neighbours), `tokens.css` and the page map with a layout per chapter; build the hero first and judge its capture; boot the project on one ticker with the `window.__awards` hook. Review the static hero, middle and close on desktop/mobile, then run a forked component jury on the first viewport before the motion handoff.
4. **Motion and WebGL.** A motion score per chapter, recipes adapted rather than pasted, a DOM mirror and a no-GL path for every canvas.
5. **Jury and ship.** Capture coverage follows the page map and capture manifest, including desktop/mobile chapters, reduced motion and required interaction states. The audit and forked jury produce Design / Usability / Creativity / Content and developer scores, or `recapture` when visual evidence is missing. The jury returns `ship`, `fix`, `rebuild` or `recapture`; ship applies the fix batch and verifies the expected changes in before/after captures.

Durable files: `AWARDS.md` (brief, contract, page map, motion score, budgets, jury and ship logs, exceptions), `DESIGN.md` (tokens and rules), `.awards/` (captures, reports, audit output; gitignored). In Claude Code, a `PostToolUse` hook runs a sub-second audit after each edit, only in projects that carry an `AWARDS.md`, a `UserPromptSubmit` hook adds one routing line when a prompt asks for award-level work, and after a context compaction a `SessionStart` hook re-attaches a short state card from an unfinished build's `AWARDS.md`, and a `SubagentStop` hook sends a jury reply that lost its `disposition:` line back once; set `AWARDS_HOOK=0`, or turn off the plugin's `hooks_enabled` setting, to silence all four. Codex runs the same audit explicitly after edit batches.

## What is inside

- `plugins/awards/references/` — the site case studies, each checked against the live site and its live award entry (the original set on 2026-09-18, later cards on the date each one records) and carrying confidence labels, the [visual composition guide](plugins/awards/references/patterns/visual-composition.md) and broader pattern language, the jury rubric and usability walk, the craft floor, anti-pattern and reflex lists, per-stack and per-library notes with pinned versions.
- `plugins/awards/recipes/` — 75 focused recipes plus one complete editorial composition, 76 verifiable entries in all. The six new visual examples include reviewed desktop/mobile images and synthetic demonstration content; each entry has a browser verifier. These images are generated and tested examples, not evidence of human preference.
- `plugins/awards/scripts/` — `doctor.mjs`, `capture.mjs`, `audit.mjs`, `crux.mjs`, `new-project.mjs`, `roll.mjs`, `verify-recipes.mjs`, `lint-refs.mjs`, `check-sync.mjs`, `check-versions.mjs`, `calibration.mjs`.
- `plugins/awards/evals/` — a `claude plugin eval` suite in six tiers: 25 routing cases (twelve that must fire a skill, three that must take a deep mode, ten that must not), a contract tier that stops after the visual system, a resume case, a full-tools routing case, two coexistence cases beside GreenSock's gsap-skills and seven build cases with fixtures; plus `selftest.mjs` for grader checks, `regrade.mjs` and `pick.mjs` to spend less, and `behavior.mjs` for real browser, audit, capture, server and ticker regressions without model calls.

## Verify

From the repository root, with Codex CLI and Node installed:

```bash
node plugins/awards/evals/codex-install.mjs
```

This installs into a temporary Codex home, checks actual skill discovery through the app server, resolves bundled references and exercises both installed scaffold variants from another working directory. It makes no model calls and leaves your Codex configuration untouched. After `npm ci` in `plugins/awards/recipes`, add `--build` to also compile both generated projects.

```
claude plugin validate plugins/awards
claude plugin validate .claude-plugin/marketplace.json
cd plugins/awards/recipes
npm ci                                       # includes the pinned Playwright (1.64.1)
npx playwright install chromium
node ../scripts/doctor.mjs .                 # early prerequisite check; no installs
node ../evals/behavior.mjs                   # live behavior regressions, no model calls
node ../scripts/verify-recipes.mjs            # all 89 entries, headless Chromium with WebGL
node ../scripts/audit.mjs .                   # the craft floor: must stay free of P0-P2
node ../scripts/lint-refs.mjs                 # every [site:]/[recipe:]/[pattern:] reference resolves
node ../scripts/check-sync.mjs                # versions, pins, shared copies, licence files, quoted counts
node ../scripts/check-versions.mjs            # pins against the npm registry's latest (network, no install)
node ../evals/jury-evidence-selftest.mjs      # jury evidence contract, no model calls
node ../evals/visual-library-selftest.mjs     # visual guide/recipe metadata, no model calls
node ../evals/selftest.mjs                    # every file-target grader fails on untouched input
node ../evals/codex-install.mjs --build       # installed scaffolds, with and without WebGL
cd ..
node evals/pick.mjs                           # which paid cases this branch needs (free)
claude plugin eval . --tag smoke --scaffold --runs 3 --threshold 0.67   # routing (model calls)
```

Only `claude plugin eval` makes model calls. `behavior`, `verify-recipes` and captures need Playwright. Run browser checks serially;
SwiftShader verification is not safe beside another browser. See [behavior check groups](plugins/awards/evals/README.md#behavior-regressions).

## Status

Version 0.7.0.

Release notes are in [CHANGELOG.md](CHANGELOG.md); unreleased work is listed at its top.

## Provenance and licence

See `NOTICE.md`. MIT.
