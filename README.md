# awards — award-worthy websites with Claude Code and Codex

A plugin for Claude Code and Codex that teaches the agent to design and build websites and single components in the league of Site of the Day / Month / Year award winners: in that style, never as copies. It is built from an analysis of nineteen award-winning sites, the pattern language they share, twenty-eight motion and WebGL recipes verified in a headless browser, a deterministic craft-floor audit, and a fresh-context jury that scores the way the real one does.

## Install

### Codex

From a local checkout of this repository:

```bash
codex plugin marketplace add /absolute/path/to/awards
codex plugin add awards@awards
```

Or install the published repository (after these changes are pushed to the chosen branch):

```bash
codex plugin marketplace add burgisimon/awards
codex plugin add awards@awards
```

Start a new Codex session and invoke `$awards:craft` for a site or `$awards:component` for one element. All eleven skills use the same `$awards:<name>` form and remain available for automatic selection. Install the whole plugin rather than copying individual skill folders: they share the corpus, recipes, scripts and templates.

Codex supports the existing [Claude-compatible marketplace format](https://developers.openai.com/plugins/build/plugins#how-local-marketplaces-work), so both clients use the same package. The [Codex runtime guidance](plugins/awards/references/codex.md) covers installed paths, phase handoffs, jury delegation and explicit audits. The automatic edit hook is Claude-specific; Codex runs the audit after edit batches. Fresh-context jury reviews require available delegation; otherwise the report discloses that it used the current context.

### Claude Code

```
/plugin marketplace add burgisimon/awards
/plugin install awards@awards
```

Local development: `claude --plugin-dir plugins/awards`. Requirements: Node 20 or newer; Playwright (`npm i -D playwright` in the project, or a global install) for screenshots and the jury's evidence; `npm install` inside `plugins/awards/recipes` to build or verify the recipes.

## Skills

The table uses Claude Code's `/awards:<name>` notation; use `$awards:<name>` in Codex.

| Skill | Use it for |
|---|---|
| `/awards:craft` | Build an award-worthy site end to end (brief → concept → system → structure → stack → motion → WebGL → jury → ship) |
| `/awards:concept` | The idea, narrative and signature interaction before any code; deals three directions and writes the direction contract |
| `/awards:system` | Type contract, colour strategy, tokens, `DESIGN.md` |
| `/awards:structure` | Page map, hero archetype, components, semantic skeleton, responsive strategy |
| `/awards:stack` | Scaffold Vite (default), Next, Nuxt, Astro, SvelteKit or a Webflow shell with Lenis + GSAP (+ Three) on one ticker |
| `/awards:motion` | The motion score: preloader, reveals, scrub, cursor, transitions, reduced-motion tiers |
| `/awards:webgl` | Three.js / OGL / R3F layer, shaders, asset pipeline, quality tiers, fallbacks |
| `/awards:component` | One award-worthy component inside an existing site |
| `/awards:jury` | Score like a design-award jury in a fresh context; ordered fixes; a disposition |
| `/awards:ship` | Fix batch, audit, captures, performance, accessibility, meta; the ship report |
| `/awards:research` | Turn a reference site into a corpus case study |

Every skill also triggers on its own request ("add a custom cursor", "judge this page", "set up Vite with GSAP and Three"); `craft` is the entry point for a whole site and routes single elements to `component` and critiques to `jury`.

## How a build runs

1. **Brief.** `craft` copies `AWARDS.md` into the project, asks at most three questions, records the visitor mode and every synthetic asset.
2. **Concept.** `concept` reads the corpus index, picks the three nearest case studies, deals three directions with a seeded roll, and writes the direction contract: THESIS, WORLD, STORY, FIRST VIEWPORT, SIGNATURE, SCROLL MODEL, LOAD & CLOSE, DIVERGENCE.
3. **System, structure, stack.** `DESIGN.md` and `tokens.css`; the page map and a semantic skeleton; a project booted on one ticker with the `window.__awards` hook the tools use.
4. **Motion and WebGL.** A motion score per chapter, recipes adapted rather than pasted, a DOM mirror and a no-GL path for every canvas.
5. **Jury and ship.** Playwright captures at three scroll positions, on a phone and under reduced motion; the audit; a forked jury that scores Design / Usability / Creativity / Content and the developer criteria and returns `ship`, `fix`, `rebuild` or `recapture`; a ship pass that applies the fix batch and writes the report.

Durable files: `AWARDS.md` (brief, contract, page map, motion score, budgets, jury and ship logs, exceptions), `DESIGN.md` (tokens and rules), `.awards/` (captures, reports, audit output; gitignored). In Claude Code, a `PostToolUse` hook runs a sub-second audit after each edit, only in projects that carry an `AWARDS.md`; set `AWARDS_HOOK=0` to silence it. Codex runs the same audit explicitly after edit batches.

## What is inside

- `plugins/awards/references/` — nineteen site case studies with confidence labels, the pattern language (narrative, heroes, components, motion, preloaders, cursor, typography, colour, copy, WebGL, assets, accessibility, responsive, sound), the jury rubric and usability walk, the craft floor, anti-pattern and reflex lists, per-stack and per-library notes with pinned versions.
- `plugins/awards/recipes/` — twenty-eight recipes (Lenis + GSAP boot, scrubbed chapters, sticky stages, text reveals, cursor, magnetic CTA, marquee, menu overlay, preloader, theme swap, page transitions, quality tiers, DOM-tethered WebGL planes, fluid wake, depth-map parallax, render-to-texture transitions, virtual scroll camera and more), each with a browser-verified test.
- `plugins/awards/scripts/` — `capture.mjs`, `audit.mjs`, `new-project.mjs`, `roll.mjs`, `verify-recipes.mjs`.
- `plugins/awards/evals/` — a `claude plugin eval` suite: eleven routing cases and six build cases with fixtures.

## Verify

From the repository root, with Codex CLI and Node installed:

```bash
node plugins/awards/evals/codex-install.mjs
```

This installs into a temporary Codex home, checks actual skill discovery through the app server, resolves bundled references and exercises the installed scaffold from another working directory. It makes no model calls and leaves your Codex configuration untouched.

```
cd plugins/awards
claude plugin validate .
cd recipes && npm install && node ../scripts/verify-recipes.mjs     # every recipe, headless Chromium with WebGL
node scripts/audit.mjs recipes                                        # the craft floor on the recipes
claude plugin eval . --tag smoke                                      # routing, with the no-plugin baseline (model calls)
```

## Status

Version 0.1.0. The corpus was compiled without live access to the sites, so every fact carries a confidence label and `/awards:research` re-verifies a site when a session has network access. Headless verification proves the recipes are correct, not fast: run a real-device pass before shipping anything WebGL. Two planned recipes (an opt-in sound toggle and MSDF text with a DOM mirror) are scheduled for 0.2.

## Provenance and licence

See `NOTICE.md`. MIT.
