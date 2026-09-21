# awards — award-worthy websites with Claude Code and Codex

A plugin for Claude Code and Codex that teaches the agent to design and build websites and single components in the league of Site of the Day / Month / Year award winners: in that style, never as copies. It is built from twenty site case studies, the pattern language they share, thirty motion and WebGL recipes verified in a headless browser, a deterministic craft-floor audit, and a fresh-context jury that scores the way the real one does.

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

Codex supports the existing [Claude-compatible marketplace format](https://developers.openai.com/plugins/build/plugins#how-local-marketplaces-work), so both clients use the same marketplace and skill files. The package includes a `.codex-plugin/plugin.json` compatibility manifest with Codex display metadata and starter prompts, alongside the Claude manifest. The [Codex runtime guidance](plugins/awards/references/codex.md) covers installed paths, phase handoffs, jury delegation and explicit audits. The automatic edit hook is Claude-specific; Codex runs the audit after edit batches. Fresh-context jury reviews require available delegation; otherwise the report discloses that it used the current context.

### Claude Code

```
/plugin marketplace add burgisimon/awards
/plugin install awards@awards
```

For an unpublished local checkout, use `/plugin marketplace add /absolute/path/to/awards`, then `/plugin install awards@awards`. Local development from the repository root: `claude --plugin-dir ./plugins/awards`. Start with `/awards:craft` or `/awards:component`.

### Runtime requirements

Use a current Claude Code or Codex CLI with plugin support. Installation checks were run with Claude Code 2.1.278 and Codex CLI 0.155.1. Builds require Node **20.19+ on the 20.x line, or 22.12+**, matching the bundled Vite version; Node 24 works. npm and network access are needed to install project dependencies. Context7 is optional; the skills can use official web documentation instead.

For captures, rendered audits and jury evidence, install Playwright **and Chromium** in the website project:

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Run captures from that project directory. For an existing Playwright installation elsewhere, set `AWARDS_PLAYWRIGHT` to its parent project directory; `AWARDS_CHROMIUM` can point to an installed Chromium executable. Linux/cloud hosts may need `npx playwright install --with-deps chromium`. Static audits and scaffolding do not need a browser. If captures cannot be produced, the jury reports `recapture`.

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

- `plugins/awards/references/` — twenty site case studies, each checked against the live site and its live award entry on 2026-09-18 and carrying confidence labels, the pattern language (narrative, heroes, components, motion, preloaders, cursor, typography, colour, copy, WebGL, assets, accessibility, responsive, sound), the jury rubric and usability walk, the craft floor, anti-pattern and reflex lists, per-stack and per-library notes with pinned versions.
- `plugins/awards/recipes/` — thirty recipes (Lenis + GSAP boot, scrubbed chapters, sticky stages, text reveals, cursor, magnetic CTA, marquee, menu overlay, preloader, theme swap, page transitions, quality tiers, DOM-tethered WebGL planes, fluid wake, depth-map parallax, render-to-texture transitions, virtual scroll camera, an opt-in sound toggle and runtime-atlas MSDF text), each with a browser-verified test.
- `plugins/awards/scripts/` — `capture.mjs`, `audit.mjs`, `new-project.mjs`, `roll.mjs`, `verify-recipes.mjs`, `lint-refs.mjs`.
- `plugins/awards/evals/` — a `claude plugin eval` suite: seventeen routing cases (eleven that must fire a skill, six that must not) and six build cases with fixtures, plus `selftest.mjs`, which checks every file-target grader fails on untouched input.

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
npm ci
npm install --no-save --package-lock=false playwright  # verification tool only
npx playwright install chromium
node ../scripts/verify-recipes.mjs            # all 30 recipes, headless Chromium with WebGL
node ../scripts/audit.mjs .                   # the craft floor: must stay free of P0-P2
node ../scripts/lint-refs.mjs                 # every [site:]/[recipe:]/[pattern:] reference resolves
node ../evals/selftest.mjs                    # every file-target grader fails on untouched input
node ../evals/codex-install.mjs --build       # installed scaffolds, with and without WebGL
cd ..
claude plugin eval . --tag smoke --scaffold --runs 3 --threshold 0.67   # routing (model calls)
```

Only `claude plugin eval` makes model calls. `verify-recipes` and the captures need Playwright, and are not
safe to run beside another browser.

## Status

Version 0.2.0.

### 0.2.0 — 2026-09-21

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

## Provenance and licence

See `NOTICE.md`. MIT.
