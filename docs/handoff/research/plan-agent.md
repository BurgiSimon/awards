I have what I need. Verified facts that change the plan relative to §4/§7 of the research plan: the installed CLI (2.1.42) has `claude plugin validate` and `--plugin-dir` but **no `claude plugin eval`** (so evals need our own runner); Playwright 1.56.1 is a *global* package (`/opt/node22/lib/node_modules/playwright`) with browsers at `/opt/pw-browsers`, so shipped scripts must resolve Playwright beyond the local `node_modules`; the five research transcripts (A–E) have a consistent per-site schema (A/B/E use 12 `###` subsections, C/D use one `##` block per site), each report is 52–72 K chars; `/home/user/awards` is on branch `claude/award-worthy-website-skill-rbcead` with one commit and a stray untracked `cap.txt` ("404: Not Found") that must not be committed.

# Implementation plan: the `awards` plugin

## 1. Architecture decision

### 1.1 Plugin and skill list (validated §7, revised)

**Plugin `awards`, repo = marketplace.** `/plugin marketplace add burgisimon/awards` → `/plugin install awards@awards`. Skills are `/awards:<name>`.

**Shape: one orchestrator + ten sub-skills, each a real skill** (own `SKILL.md`, own pushy description) so partial requests ("add a WebGL hero", "make this menu award-worthy", "scaffold a Lenis + GSAP project") trigger the right skill without the core, while the core drives them in order for a full build. The alternative (impeccable's single skill + command references) is rejected: sub-skills would not auto-trigger and one description cannot carry every trigger phrase under the 1,536-char cap.

| Skill | Job (one line) | Phase | Why it is its own skill |
|---|---|---|---|
| `awards:craft` (core) | Brief → contract → drives every phase → jury → ship; owns `AWARDS.md`, the craft floor, the award calibration, routing | all | Entry point; the only skill that knows the whole workflow |
| `awards:concept` | Thesis, narrative model, signature interaction, world sketch; pulls 3 nearest corpus cards and *diverges* | 1 | Standalone demand ("ideas / direction / would this win") and the heaviest corpus reads |
| `awards:system` | Type contract, colour strategy + tokens, spacing/grid, materials, theme model, motion tokens → `DESIGN.md` + `tokens.css` | 2 | "pick fonts/colours / design tokens" requests; DESIGN.md interoperates with impeccable/Stitch |
| `awards:structure` | Chapter/route map, hero archetype, pacing, component catalogue selection, semantic DOM + responsive strategy, static skeleton | 3 | Renamed from `compose` to avoid confusion with `component` |
| `awards:stack` | Choose + scaffold the technical foundation (Vite/Next/Nuxt/Astro/SvelteKit/Webflow shell), boot Lenis + GSAP (+ Three), asset pipeline, quality tiers, transitions | 4 | Common standalone request; owns `new-project.mjs` and `references/stacks/`; keeps the core lean |
| `awards:motion` | The motion score: preloader, reveals, scrub/pin, cursor, magnetic, marquee, transitions, easing vocabulary, reduced-motion tiers, perf | 5 | Most frequent partial request; GSAP/Lenis/anime.js expertise |
| `awards:webgl` | Three/OGL/R3F layer: DOM-tethered planes, fluid wake, depth-map, RTT transitions, camera rigs, post, asset pipeline, tiers, DOM mirror + fallback | 6 | Heavy, optional, distinct vocabulary; must not load for DOM-only sites |
| `awards:component` | Fast path for ONE award-worthy component inside an existing world (or standalone) | any | The user's explicit second use case; inherits, never re-invents a world |
| `awards:jury` | Fresh-context Awwwards-style scoring (D/U/C/Co + Dev), memory + specificity tests, usability walk, ordered fixes, disposition | 7 | Runs forked (`context: fork`, `agent: awards-jury`) so the build thread cannot anchor it |
| `awards:ship` | Fix batch from the jury, deterministic audit, captures, perf/a11y/SEO/browser-surface checks, ship report | 8 | Fixing and proving is a different job from judging |
| `awards:research` | Turn a URL/notes into a corpus case-study card (Playwright capture when reachable), extend the index | grow | Keeps the corpus growing; different trigger ("analyse this site") |

Dropped/merged: nothing from §7 is dropped; `compose` → `structure`; `stack` added; `research` kept but scheduled last (Phase 4).

### 1.2 Routing

- Core body has a phase table; each phase ends with an explicit line: *"Invoke the `awards:<x>` skill now via the Skill tool, passing the brief; do not do its work inline."* (Skills cannot call skills programmatically, but this instruction works in practice.)
- Every sub-skill opens with the same **Setup** block: read `AWARDS.md` if present (resume from its `## Status`), else run a 1-round compact intake; if the request is clearly a whole site with no contract yet, offer `/awards:craft` once, then proceed.
- Scope detection in core: *site* (multi-section/route) → full loop; *component* (one element, named file/selector, "this nav/hero/menu") → hand to `awards:component`; *critique* → `awards:jury`; *no argument* → status menu from `AWARDS.md` (never auto-run).

### 1.3 Corpus location

All shared material at plugin root, addressed as `${CLAUDE_PLUGIN_ROOT}/references/…`, `${CLAUDE_PLUGIN_ROOT}/recipes/…`, `${CLAUDE_PLUGIN_ROOT}/scripts/…`. Skill-local `references/` only for a skill's private worksheets. Rationale: `concept`, `structure`, `motion`, `webgl`, `component`, `jury` all read the same site cards and patterns; duplicating them per skill would multiply maintenance. Each SKILL.md notes the fallback (`../../references/` relative to the skill dir) for `--plugin-dir` testing and states that standalone copying of a single skill folder is unsupported.

### 1.4 Durable project files

| File | Owner (writer) | Readers | Content |
|---|---|---|---|
| `AWARDS.md` (project root) | craft (skeleton), concept (contract), structure (page map), motion (score), stack/webgl (budgets), jury/ship (logs) | all | `## Status` checklist · `## Brief` · `## Direction contract` (THESIS / WORLD / STORY / FIRST VIEWPORT / SIGNATURE / SCROLL MODEL / LOAD & CLOSE / DIVERGENCE / FINISH) · `## Page map` · `## Motion score` · `## Budgets & tiers` · `## Jury log` · `## Ship log` · `## Exceptions` (audit-ignore lines with reasons) |
| `DESIGN.md` (project root) | system | all | DESIGN.md-spec frontmatter (colors/typography/rounded/spacing/components) + canonical 8 sections + `## Themes`, `## Motion`, `## Browser surfaces` |
| `.awards/captures/` | capture.mjs | jury, ship | screenshots + `manifest.json` (gitignored) |
| `.awards/jury/<date>.md`, `.awards/ship/<date>.md` | jury, ship | craft | reports |
| `.awards/sites/<slug>.md` | research | concept | project-local corpus additions |
| `.awards/audit.json` | audit.mjs | jury, ship, hook | last findings |

Compatibility: if impeccable's `PRODUCT.md` exists, `craft` reads it for product truth and never overwrites it; `DESIGN.md` uses the same spec so both tools can share it.

### 1.5 Agents

- `agents/awards-jury.md` — fresh-context reviewer (tools: Read, Glob, Grep, Bash; `model: inherit`; `effort: high`; turn ceiling ~30). Used two ways: `/awards:jury` runs forked with `agent: awards-jury`; `craft` may also spawn it via the Agent tool with an explicit input packet. Disposition vocabulary: `recapture | rebuild | fix | ship`.
- No other agents in v1 (research runs inline; recipe verification is a script).

### 1.6 Hooks in v1: ship one, gated

`hooks/hooks.json`: `PostToolUse` on `Edit|Write`, command = `[ -f "${CLAUDE_PROJECT_DIR:-.}/AWARDS.md" ] || exit 0; node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" --quick --changed-file "$FILE_FROM_STDIN"` (the script reads the tool input JSON from stdin to get the path), timeout 5 s, silent when clean, findings returned as `hookSpecificOutput.additionalContext` (fallback: exit 2 + stderr). Rationale: the floor violations the model ships unknowingly (reflex fonts, missing reduced-motion, eased scrubs, uncapped DPR) are cheapest to catch at edit time, and gating on `AWARDS.md` makes the hook inert in every other project. Escape hatch: `AWARDS_HOOK=0`. No `Stop` hook in v1 (the jury/ship phases do the deep pass deliberately).

### 1.7 Directory tree

```
/home/user/awards/                              # repo root = marketplace
├── .claude-plugin/marketplace.json             # name "awards", plugins[0].source "./plugins/awards"
├── .gitignore                                  # node_modules, .awards/captures, recipes/dist, scratch
├── README.md                                   # install, skill map, workflow, provenance, licence
├── awardsworthysites.md                        # existing list (kept)
├── tools/extract-report.mjs                    # dev-only: JSONL transcript → last assistant text (not shipped)
└── plugins/awards/
    ├── .claude-plugin/plugin.json              # name, version 0.1.0, description, author, skills ./skills, agents ./agents, hooks ./hooks/hooks.json
    ├── README.md
    ├── skills/{craft,concept,system,structure,stack,motion,webgl,component,jury,ship,research}/SKILL.md
    ├── agents/awards-jury.md
    ├── hooks/hooks.json
    ├── references/
    │   ├── README.md  craft-floor.md  anti-patterns.md  reflex-lists.md
    │   ├── jury/{rubric.md, usability-walk.md, report-template.md}
    │   ├── patterns/{narrative-structures, hero-archetypes, components-catalog, motion-vocabulary,
    │   │             preloaders-and-transitions, cursor-and-pointer, typography, color-and-material,
    │   │             copy-and-content, webgl-architecture, asset-pipeline, accessibility-and-reduced-motion,
    │   │             responsive-strategy, sound}.md
    │   ├── stacks/{vite-vanilla, next, nuxt, astro, sveltekit, webflow-export, gsap-3.15, lenis-1.3,
    │   │           animejs-4, three-0.186, versions}.md
    │   └── sites/{_index.md, _TEMPLATE.md, <19 slugs>.md}
    ├── recipes/
    │   ├── README.md  package.json  vite.config.mjs  (MPA inputs = every recipe folder)
    │   ├── _shared/{base.css, tokens.css, raf.js, reduced-motion.js, quality-tiers.js, awards-hook.js}
    │   └── <recipe-id>/{index.html, main.js, style.css, README.md, recipe.json, verify.mjs, adapters/}
    ├── assets/
    │   ├── templates/{AWARDS.md, DESIGN.md, jury-report.md, ship-report.md, 404.html}
    │   └── scaffold/vite-vanilla/…  (+ scaffold/webgl-module/…)
    ├── scripts/
    │   ├── capture.mjs  audit.mjs  new-project.mjs  roll.mjs  verify-recipes.mjs
    │   ├── data/{reflex-fonts.json, rules.json}
    │   └── lib/{playwright.mjs, server.mjs, html.mjs, css.mjs, contrast.mjs, report.mjs}
    └── evals/{evals.json, run-evals.sh, check.mjs, files/…}
```

---

## 2. Per-skill plans

Conventions for all skills: frontmatter `name`, `description` (≤ 900 chars, pushy), `argument-hint`; `user-invocable: true` default; body imperative, "why" before rules; every body ends with a **Verify** list and a **Hand-off** line; each has a **Refuse** list. Line budgets are for the body.

### 2.1 `awards:craft` (core) — ~360 lines

**Purpose.** Orchestrate an award-worthy site build end to end; own the contract, calibration and routing; route single elements to `component`.

**Frontmatter**
```yaml
name: craft
description: "Design and build award-worthy websites (Awwwards Site of the Day / Month / Year and Developer Award league, CSSDA, FWA) end to end: brief → concept → visual system → page structure → stack → build → motion → WebGL → jury → ship. Use this whenever the user wants a site, landing page, portfolio, campaign, product, studio or brand site that should be 'award-worthy', 'Awwwards-level', 'like the best creative-studio sites', 'immersive', 'cinematic', 'creative-developer style', 'with smooth scroll / GSAP / Lenis / WebGL', names studios or sites (Lusion, basement, OFF+BRAND, Igloo, Lando Norris, Léo Parpeix), or just says 'make it stunning' or 'the best site you can build'. Also the entry point when unsure which awards sub-skill applies; routes single elements to awards:component. Writes AWARDS.md and drives the sub-skills in order."
argument-hint: "[brief | site | component | resume | status | jury | ship] [target]"
```

**Body outline**
1. *What award-worthy means here* (12 lines): concept-first; one world, one signature, one authored load and close; the technical bar (a Developer Award accompanies nearly every SOTD); the usability floor the references skipped (their lowest sub-score, 7.16–7.51) is our edge; the memory test.
2. *Setup* (15): read `AWARDS.md`/`DESIGN.md`/`PRODUCT.md`; detect scope; detect stack; load `references/craft-floor.md` before any UI edit (why: it holds the reflexes no reviewer forgives).
3. *Intake round* (25): ≤ 3 questions via AskUserQuestion — the subject's unique mechanism, the audience's real scene, stakes/conversion, real assets available (photo/video/3D/copy), binding constraints (stack, CMS, hosting, deadline), route count, sound yes/no. Assert likely readings; never ask for CSS values or "styles".
4. *Workflow table* (40): phases 0–8 with entry condition, invocation line, exit artefact (see §1.2). Explicit: "Never write page code before the direction contract is locked; never pick the stack before the concept."
5. *Direction contract blocks* (30): definitions and the reason each exists (THESIS refuses the category default and the Awwwards default; SIGNATURE names the technique tier it implies; SCROLL MODEL is a decision — native+Lenis / sticky rails / virtual float / section switcher; LOAD & CLOSE because loading and the last screen are authored on every winner; DIVERGENCE lists the three nearest cards and the literal moves refused; FINISH: "unreviewed and unshipped is unfinished").
6. *Build discipline* (45): build order (semantic skeleton → tokens → layout → media → motion → WebGL → transitions → preloader last); DOM does layout, canvas renders; real content authored at full fidelity and labelled synthetic; commit every atom (nav, buttons, inputs in the world's vocabulary); bounded verification (one capture round per pass, batch fixes, ≤ 2 rounds).
7. *Award calibration* (25): the four axes and the Dev criteria; where points are lost (usability, load, mobile); creativity comes from concept, not effect count; WebGL dosage is a choice (The Line took SOTM DOM-first; Igloo took SOTY 100 % canvas).
8. *Generalisation guardrails* (15): draw from ≥ 3 cards per decision; never reuse a reference's layout order, copy, palette hexes or asset; the naming test ("if a juror could name the source site from the first viewport, restart concept").
9. *First-class paths* (15): reduced-motion tiers, keyboard for every gesture (drag, hold, draw), DOM mirror for canvas text, sound opt-in — as requirements, not polish.
10. *Routing & status menu* (20).
11. *Refuse* (15): fade-and-rise on every section; hero-metric/feature-grid templates; "Get started"; Inter/Space Grotesk as display; dark + neon + glow reflex; particles/blob hero; blocking preloader without concept; WebGL because it is expected; silent skip of jury.
12. *Finish* (8): jury disposition reported verbatim; ship log; `## Status` all checked.

**Loads**: `references/craft-floor.md` (step 2), `references/jury/rubric.md` (calibration, on demand), `references/patterns/narrative-structures.md` (intake when vague), `assets/templates/AWARDS.md`.
**Scripts**: `scripts/capture.mjs` (build verification), `scripts/audit.mjs` (before jury).
**Inputs/outputs**: brief → `AWARDS.md` (skeleton + Status), then delegates.
**Verify**: contract blocks all concrete; each phase artefact exists; jury ran forked; ship report exists; memory-test answer recorded in Jury log.
**Hand-offs**: all sub-skills; `component` for single elements.

### 2.2 `awards:concept` — ~260 lines

**Purpose.** Produce the direction contract: thesis, narrative model, signature interaction, world sketch — grounded in and diverging from the corpus.

```yaml
name: concept
description: "Find the concept for an award-worthy site or component before any code: the one idea the page owns, its narrative or scroll story, the signature interaction, and a committed visual world — grounded in 19 analysed Awwwards winners and deliberately diverging from them. Use whenever the user asks for ideas, creative direction, a concept or 'big idea', storytelling/scrollytelling structure, 'how would an award-winning studio approach this', 'what would make this site win', or when a build request arrives with no direction yet. Deals three directions plus a conventional exit, lets the user lock one, and writes the AWARDS.md direction contract. Never copies a reference site."
argument-hint: "[subject or brief] [--mode persuade|experience|read] [--reroll] [--component]"
```

**Body outline**
1. Why concept first (creativity is the highest sub-score on concept-led winners; every card makes one idea do a feature list's work).
2. Inputs: `AWARDS.md` brief or 2-question intake.
3. Name the mechanism, the audience scene, and the two ruts: the category default *and* the Awwwards default (dark, WebGL blob, big grotesque, fade-ups).
4. Corpus neighbours: read `sites/_index.md`, pick 3 closest by (site class, visitor mode, WebGL dosage, budget); read those cards; write per card: principle to take, literal move refused.
5. Seven candidate worlds from the audience's culture (≥ 3 material families; graphic traditions count); `node scripts/roll.mjs --deal 3 --of 7` prints the seed key and which three reach the user; present cards (thesis · world · first viewport · signature interaction + technique tier · scroll model · honest risk · nearest card and difference) + your pick + the canon exit, via AskUserQuestion; re-roll registers plain/safer/bolder.
6. Narrative model from `patterns/narrative-structures.md`; write chapter beats (entrance-hold-exit), rule of three, the interruption, the close.
7. Signature interaction spec: one physical metaphor doing ≥ 2 jobs (Trevor's Polaroid curl = memory + collage + 3D justification); parameters; behaviour on touch, keyboard, reduced motion; cost tier and fallback.
8. Write `## Direction contract` + `## Page map` skeleton into `AWARDS.md` (component scope: a 6-line mini contract returned to `component`).
9. Verify: memory test answer is an object/behaviour, not a mood; naming test passes; every block concrete; risk stated; concept survives with WebGL removed.
10. Hand-off: `awards:system`.
11. Refuse: mood adjectives; effect-as-concept; copying; the two ruts; a concept needing assets the user cannot supply unless labelled synthetic.

**Loads**: `sites/_index.md` + 3 cards; `patterns/narrative-structures.md`, `patterns/copy-and-content.md`, `anti-patterns.md`. **Scripts**: `roll.mjs`. **Outputs**: AWARDS.md contract.

### 2.3 `awards:system` — ~230 lines

```yaml
name: system
description: "Turn a direction into a complete visual system for an award-level site and write DESIGN.md plus tokens.css: typeface contract (expressive display + neutral grotesque, or one characterful grotesque at display scale), fluid type scale with vw-lock, 2–4 colour tokens under a named colour strategy, warm near-blacks, spacing base, grid and gutters, radius/shadow policy, per-section theme tokens, easing and duration tokens, themed browser surfaces. Use whenever the user asks for design tokens, a palette, fonts or typography, a design system, DESIGN.md, 'make the type feel premium', theme switching, or when a build has no DESIGN.md. Avoids the AI-default faces and palettes."
argument-hint: "[--from AWARDS.md | describe the world] [--light|--dark|--flip]"
```

**Body outline**: (1) why few tokens (winners: 2–4 colours, ≤ 2 families; variety comes from change over time); (2) read WORLD block or ask two questions; (3) typography — the two contracts, macro/micro with no middle (The Line 210 px vs 9 px), labels as texture (metadata quartets, numerals), display up to ~12 vw locked to a 1728 artboard, `clamp()` recipe, tracking floor −0.04em, display leading .8–.95, optical hang, self-hosted woff2 + `font-display` + `size-adjust`, SplitText after `document.fonts.ready`; face selection by character class with the reflex list to avoid and verified open alternatives (Mona Sans is OFL; Google-fonts families checked via the `google/fonts` GitHub repo since fonts.google.com is unreachable); (4) colour — strategy pick, ground + ink + ≤ 1 environmental accent, warm near-black table (#1A1C1C #100904 #292919 #2C2824 #37384C), light grounds are back, chroma from imagery, colour as page state (`data-theme` per section), P3 duplication, contrast ≥ 4.5; (5) space & material — base unit, gutters 40–120 → 20 px, sharp-and-shadowless vs soft as a decision, depth by luminance; (6) motion tokens — `--ease-out-expo: cubic-bezier(.16,1,.3,1)`, `--ease-in-out-expo: cubic-bezier(.87,0,.13,1)`, `--ease-theme: cubic-bezier(.645,.045,.355,1)`, durations, stagger; (7) browser surfaces — selection, caret, scrollbar, focus ring, `color-scheme`, `theme-color`; (8) write DESIGN.md (spec frontmatter + sections) and `src/styles/tokens.css`; (9) verify with `audit.mjs --scope fonts,contrast,surfaces`; (10) hand-off `structure`; (11) refuse: generated 6-hue palettes, gradient text, glass-by-default, Google Fonts CDN, system display faces, #000 unless diegetic (USAvionix), theme by habit.

**Loads**: `patterns/typography.md`, `patterns/color-and-material.md`, `reflex-lists.md`, `assets/templates/DESIGN.md`, 1–2 cards by contract type (The Line, Slosh, Léo). **Outputs**: DESIGN.md, tokens.css.

### 2.4 `awards:structure` — ~270 lines

```yaml
name: structure
description: "Plan and build the page architecture of an award-level site: chapter or route map with pacing, hero archetype, navigation and fullscreen menu overlay, preloader slot, marquee, sticky and pinned stacks, horizontal rails, galleries, hover-preview archive lists, spec blocks, designed footer and 404 — as semantic HTML with keyboard paths and a responsive strategy decided up front. Use whenever the user asks for page structure, sections, the layout of a landing page or portfolio, 'what sections should this have', wireframes, a hero, nav, menu, footer or 404 page, or when turning a direction into markup. Draws on a catalogue of components seen across 19 Awwwards winners."
argument-hint: "[page | route] [--from AWARDS.md] [--skeleton]"
```

**Body outline**: (1) pages are chaptered arguments, pacing is craft (dense earns quiet), interruption as tool; (2) inputs: contract + content inventory; (3) page map with beats, rule of three, where the signature and the interruption live, the close; for faceted worlds every route authored incl. 404 (Lando); (4) hero archetypes (nine, from `patterns/hero-archetypes.md`) chosen by concept; (5) component selection from the catalogue with recipe ids and a11y needs; (6) semantic DOM plan — landmarks, headings, real controls, the canvas mirror rule, focus order, skip link, `inert` for overlays, live region for preloader; the "empty DOM" failure (Igloo a11y 6.6); (7) responsive strategy before build — vw-lock vs breakpoints, coarse-pointer swaps, dedicated mobile vs degrade, never a full reload at a breakpoint; (8) build the static skeleton with tokens and authored content; (9) verify: readable with CSS off, keyboard nav works, no identical card grids, footer designed, 404 exists; (10) hand-off `stack` (if no project) else `motion`; (11) refuse: hero-metric template, eyebrows, meaningless numbering, modal-by-reflex, the features/testimonials/pricing template order unless earned.

**Loads**: `patterns/hero-archetypes.md`, `patterns/components-catalog.md`, `patterns/narrative-structures.md`, `patterns/responsive-strategy.md`, `patterns/accessibility-and-reduced-motion.md`. **Recipes**: `_shared/base.css`, `nav-overlay-fullscreen`, `marquee-raf-mask`, `sticky-stack-cards`, `hover-preview-list`, `assets/templates/404.html`. **Outputs**: `## Page map`; skeleton markup.

### 2.5 `awards:stack` — ~210 lines

```yaml
name: stack
description: "Choose and scaffold the technical foundation of a creative-developer site: Vite + vanilla (default), Next.js/React with @gsap/react and React Three Fiber, Nuxt, Astro islands with View Transitions, SvelteKit/Threlte, or a Webflow-export shell — wiring Lenis + GSAP ScrollTrigger on one ticker, optional Three.js/OGL in its own chunk, self-hosted fonts, page transitions, the glTF + Draco + KTX2 asset pipeline, quality tiers and a central reduced-motion switch. Use whenever the user asks to set up, scaffold, bootstrap or configure a project for smooth scroll, GSAP, Three.js, WebGL or page transitions, asks which framework to use for an Awwwards-style site, or wants these libraries added to an existing app."
argument-hint: "[vite|next|nuxt|astro|sveltekit|webflow] [--name <dir>] [--webgl] [--cms <name>]"
```

**Body outline**: (1) stack is a decision, architecture is the constant (originals ran Vite/vanilla, Svelte, Nuxt, Astro, Webflow, Next; Framer Motion appears nowhere); (2) decision matrix: content volume → CMS; routes → MPA + View Transitions vs SPA + taxi; WebGL dose → chunking, R3F vs vanilla; Webflow shell + injected ESM bundle (OFF+BRAND); (3) scaffold via `node ${CLAUDE_PLUGIN_ROOT}/scripts/new-project.mjs --stack vite --name <dir> [--webgl]`; framework adapters from `references/stacks/<stack>.md`; (4) boot architecture — GSAP ticker drives Lenis (`gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0); lenis.on('scroll', ScrollTrigger.update)`), `ScrollTrigger.refresh()` after fonts/images, resize strategy, `window.__awards` debug/capture contract, reduced-motion switch, quality tiers; (5) asset pipeline tooling (`@gltf-transform/cli`, `toktx`/`basisu`), budgets; (6) transitions per stack; (7) verify: dev boots, scroll works, build chunks GL, RM switch flips, `capture.mjs` on the scaffold; (8) hand-off `motion`; (9) refuse: two smooth-scroll libs, CSS `scroll-behavior: smooth` with Lenis, Google Fonts CDN, fixed canvas that drifts, Framer Motion for scrub.

**Loads**: `references/stacks/*.md`, `patterns/asset-pipeline.md`, `stacks/versions.md`. **Scripts/assets**: `new-project.mjs`, `assets/scaffold/*`.

### 2.6 `awards:motion` — ~310 lines

```yaml
name: motion
description: "Author the motion of an award-level site or component with GSAP 3.15 (ScrollTrigger, SplitText, Flip, Observer — all free now), Lenis smooth scroll, anime.js v4 or CSS: preloader sequence that holds at 100, staggered masked line reveals, scroll-scrubbed pins and sticky stages, velocity-driven effects, two-speed contextual cursor, magnetic buttons, rAF marquee, hinge and flicker text, shared-element and page transitions, hover previews — using the expo-out easing vocabulary, framerate-independent damping and a real prefers-reduced-motion path. Use whenever the user asks to animate, add motion, smooth scroll, scroll-triggered or scrollytelling effects, text reveals, transitions, micro-interactions, cursor effects, 'make it feel alive / premium / cinematic', or to fix generic or janky animation."
argument-hint: "[target or feature] [--lib gsap|anime|css] [--score-only]"
```

**Body outline**: (1) why a score, not scattered effects (GSAP on 12/12 known stacks; nobody ships fade-and-translate; velocity is an input; load and close are authored); (2) inputs; (3) write `## Motion score` — load, hero entrance, per-chapter beats, signature, transitions, hover/cursor grammar, close, budget; (4) vocabulary table (easings, durations 1.2–1.5 s hero / faster exits / ≤ .3 s feedback, stagger .06–.1, masked `y:150%` reveals, scrub `ease:'none'`, lerp .1 / friction .97 / `1 - Math.exp(-k*dt)` damping); (5) scroll model implementation — Lenis+ScrollTrigger default, sticky stages + invisible rails (never `pin:true` where sticky works), virtual float only for gates/holds, Observer for switchers, CSS scroll-driven as enhancement; (6) recipe map by intent; (7) text: `SplitText.create(el, { type:'lines', mask:'lines', autoSplit:true, onSplit })` after fonts; flicker ladder; scramble decode (anime.js `scrambleText`); (8) pointer: two-speed cursor (.75/.22), contextual badges, coarse-pointer off, magnetic via `gsap.quickTo`, hover-preview lists; (9) transitions: Flip shared-element, taxi / View Transitions, theme swap on `documentElement`; (10) preloader rules (real load signal, hold at 100, exits stagger, sound consent, sessionStorage skip, `aria-live`, ≤ 2.5 s repeat visits); (11) reduced-motion tiers with `gsap.matchMedia()` and keyboard equivalents; (12) performance: one ticker, `will-change` only during animation, no layout props, batch, pause offscreen, `invalidateOnRefresh`; (13) verify: `capture.mjs --scroll 0,50,100 --reduced-motion`, `audit.mjs --scope motion`, one authored moment per chapter, loops stop offscreen; (14) hand-off `webgl` if the score names GL, else `jury`; (15) refuse: fade-up-everything, bounce/elastic by reflex, parallax on everything, scroll-jacking, blocking preloader, hover-only affordances, animating layout properties.

**Loads**: `patterns/motion-vocabulary.md`, `patterns/preloaders-and-transitions.md`, `patterns/cursor-and-pointer.md`, `stacks/gsap-3.15.md`, `stacks/animejs-4.md`, `recipes/README.md`. **Outputs**: `## Motion score`, motion code.

### 2.7 `awards:webgl` — ~310 lines

```yaml
name: webgl
description: "Build the WebGL layer of an award-level site with Three.js 0.186 (or OGL, React Three Fiber): DOM-tethered image planes with velocity distortion, a fluid-simulation post-process wake, depth-map 2.5D parallax, scroll-driven camera rigs over a virtual scroll, render-to-texture section transitions, procedural landscapes, a single hero object with inertia, particles, bloom/grain post-processing — plus the Blender→glTF+Draco+KTX2 asset pipeline, adaptive quality tiers, disposal, a semantic DOM mirror and a reduced-motion/no-GL fallback. Use whenever the user asks for 3D, WebGL, shaders, GLSL, Three.js, R3F, OGL, particles, liquid/fluid/distortion effects, image hover distortion, a 3D hero, scroll-scrubbed models, or any canvas effect beyond CSS."
argument-hint: "[effect or scene] [--lib three|ogl|r3f] [--tier low|mid|high]"
```

**Body outline**: (1) dosage first (100 % canvas / canvas-first / DOM-first with GL moments; one global unifier vs discrete narrative shaders; the cost-controlled depth ladder: 2D-in-3D → depth map → pre-rendered sequence → single object → full scene); (2) architecture: HTML lays out, GL renders; one canvas; absolute canvas re-offset per rAF (Lusion) or fixed + scroll uniform; rects → NDC each frame; scroll → uniforms never state; scene windows; disposal; DPR cap; shared ticker; `ColorManagement` and CSS-colour parity; (3) effect recipes with the researched parameters (Floema bulge formula; 128² ping-pong fluid, dissipation .96, UV .0035 + chromatic aberration; depth-map parallax; RTT composite; camera spline with friction .97 and 1.4 s snap; hero object matcap/HDRI; scanline wireframe; "cheap ice" — Fresnel rim, high-threshold bloom, fog, grain, near-zero saturation, no transmission; procedural mountain); (4) post: `postprocessing` composer with fixed presets (bloom 1.5/.5/.25), SMAA, half-float RTs on mobile; (5) asset pipeline and budgets (entry ≈ 20 KB gz, scene ≈ 500 KB gz, textures ≤ 700 KB per scene; WebP desktop / KTX2 mobile; staged loading feeding the preloader); (6) quality tiers module; three-tier content fallback; (7) DOM mirror + `aria-hidden` canvas + reduced-motion static frame; (8) sound opt-in; (9) verify with `capture.mjs --webgl` (SwiftShader flags) and `--no-webgl`, console clean, disposal on route change, FPS sample; (10) hand-off `jury`; (11) refuse: blob/particle hero by default, GL text without DOM mirror, uncapped DPR, 50 MB glb, "make it 3D" without concept, no fallback.

**Loads**: `patterns/webgl-architecture.md`, `patterns/asset-pipeline.md`, `stacks/three-0.186.md`, cards: Léo, Floema, Igloo, Slosh, Shopify, Oryzo. **Recipes**: `gl-*`.

### 2.8 `awards:component` — ~230 lines

```yaml
name: component
description: "Design and build ONE award-worthy component inside an existing site or as a standalone piece: hero, preloader, navigation overlay, custom cursor, marquee, sticky stack, horizontal gallery, hover-preview list, image-distortion grid, theme switcher, compare slider, magnetic CTA, page transition, footer, 404. Use whenever the user asks to make a specific element 'award-worthy', 'Awwwards-level', 'more premium / impressive / memorable', to 'add a X like the creative studios do', or to build a single section or component with real motion — without redesigning the whole site. Inherits the site's tokens; adds one signature interaction, every state, keyboard, touch and reduced-motion paths; verifies with a component capture."
argument-hint: "<component name | file | selector> [--standalone] [--lib gsap|anime|css]"
```

**Body outline**: (1) why a fast path (a component inside an established world inherits it; never a new identity exercise); (2) inputs: target, tokens (DESIGN.md or extracted from CSS), the site's motion lib; (3) one intake question round at most; (4) 6-line mini contract (job · signature move · material tier · states · a11y · cost) — call `awards:concept --component` only when the user wants options; (5) catalogue lookup → recipe → adapt (rename, re-token, re-time; never paste unchanged); (6) build: semantic markup, tokens, motion vocabulary inline, GL only when the signature needs it (invoke `awards:webgl`); (7) states and paths (hover/focus/active/disabled/loading/empty, keyboard, coarse pointer, reduced motion, long text, SSR safety); (8) verify: `capture.mjs --selector <sel> --hover <sel> --mobile --reduced-motion`, `audit.mjs --file`, removal test, specificity test; (9) hand-off: optional `awards:jury --component`; (10) refuse: restyling outside the target, a second font/palette, new dependencies unasked, hover-only affordances, effect without state.

### 2.9 `awards:jury` — ~200 lines + agent file ~90 lines

```yaml
name: jury
description: "Score a site, page or component the way an Awwwards jury would — Design, Usability, Creativity, Content (0–10; SOTD winners cluster 7.2–7.9) plus Developer Award criteria (animation, performance, responsive, accessibility and semantics, code) — run the memory test, the specificity test ('could a juror name the source site?'), the keyboard and reduced-motion walk and the anti-slop scan, and return an ordered fix list with a disposition (ship / fix / rebuild / recapture). Use whenever the user asks to review, critique, score, judge or evaluate a site, asks 'would this win', 'is this award-worthy', 'what is missing', or before shipping any award-level work. Runs in a fresh context so the build cannot anchor it."
argument-hint: "[url | path | --component <selector>] [--captures <dir>] [--verdict]"
context: fork
agent: awards-jury
allowed-tools: Read, Glob, Grep, Bash
```

**Body outline**: (0) evidence gate — captures (`desktop-s00/s50/s100`, `mobile-s00`, `desktop-rm-s00`) exist and are valid, else run `capture.mjs`, else `disposition: recapture`; `audit.json` else run `audit.mjs --json`; (1) read contract + DESIGN.md; (2) Assessment A — design director: memory test, first-viewport thesis, concept vs effect, specificity, world commitment, type, pacing, close; (3) Assessment B — developer judge: motion quality, perf signals, responsive captures, semantics/a11y, markup; (4) Assessment C — usability walk (`jury/usability-walk.md`): keyboard-only, coarse pointer, reduced motion, load gate, copy clarity, conversion path, wayfinding; (5) score with `jury/rubric.md` anchors (weights D 40 / U 30 / C 20 / Co 10 — verify against Awwwards' published formula when network allows), SOTD threshold ≥ 7.2 with no axis < 6.8; (6) report per `jury/report-template.md`: disposition line; scores table; memory-test answer; specificity verdict; ≤ 8 material fixes ordered (fidelity to contract > craft); keep line; append to `AWARDS.md ## Jury log` and write `.awards/jury/<date>.md`; (7) verdict pass mode (resolved/partial/unresolved, ≤ 3 regressions); (8) refuse: praise, softening, redesigning, scoring without captures, counting effects as creativity.

**Agent `agents/awards-jury.md`**: persona (a juror who has scored hundreds of SOTD entries and reads Dev-award sub-scores), turn ceiling, "read captures first, inventory the first viewport in your own words before reading the contract", disposition derivation rules, output contract. Loaded by `context: fork` (verify in Phase 3 that the fork does not inherit the build transcript; if it does, `craft` spawns the agent via the Agent tool with an input packet instead).

### 2.10 `awards:ship` — ~230 lines

```yaml
name: ship
description: "Take an award-level site or component from 'works' to 'ships': apply the jury's fix list in one batch, run the deterministic audit (reflex fonts, contrast, prefers-reduced-motion, landmarks and alt, overflow, scrubbed-tween easing, will-change, browser surfaces, slop patterns), capture desktop, mobile, scroll-state and reduced-motion screenshots, check performance budgets (entry JS, images, KTX2/Draco, fonts), font loading, SEO/OG/meta, favicon, 404, console errors, and write the ship report. Use whenever the user says ship, launch, finalize, polish, QA, 'make it production-ready', 'check performance or accessibility', 'run the audit', 'take screenshots', or after any awards build or jury round."
argument-hint: "[path | url] [--fix] [--report-only]"
```

**Body outline**: (1) ship fixes and proves; jury judges — never redesign here; (2) fix batch strictly from the jury list, classified (token / one-off / conceptual / local), one batch, recapture; (3) `node scripts/audit.mjs <dir|url> --json` → every finding fixed or recorded under `## Exceptions` with a reason; (4) captures and validity check (open each once); (5) performance budget checklist (LCP ≤ 2.5 s throttled, entry JS ≤ 200 KB gz, GL chunk lazy, textures compressed, fonts subset + preloaded, `<img>` sizes/loading/dimensions, video muted/playsinline/poster, no CLS from preloader exit, `content-visibility`); (6) a11y and usability (landmarks, heading order, focus-visible, skip link, RM tiers verified, keyboard walk, coarse pointer, contrast, `aria-hidden` canvas, live regions); (7) meta and chrome (title/description/OG image authored, favicon + `theme-color` from tokens, 404, robots/sitemap, `lang`, `color-scheme`); (8) browser surfaces; (9) cleanup (debug flags off, console.log, unused deps, `.awards/captures` gitignored); (10) ship report → `.awards/ship/<date>.md`, Status = shipped; if material fixes were applied, hand back to `jury --verdict`; (11) refuse: `*{animation:none!important}` reduced-motion kills, removing the signature to pass perf (tier it), preloader > 2.5 s on repeat visits.

### 2.11 `awards:research` — ~180 lines

```yaml
name: research
description: "Analyse a reference website (URL, notes, screenshots or an Awwwards entry) into a structured case study in the awards corpus format — concept, palette, type, components, motion, stack evidence, weaknesses, generalisable principles, reusable patterns, what to take and what not to take, confidence per section — using Playwright captures and source inspection when the site is reachable, and marking inferences honestly when it is not. Use whenever the user shares a site to learn from, asks 'what makes this site award-winning', 'analyse / deconstruct / break down this site', 'add this to the references', or wants the awards skills to learn a new style. Extracts principles; never copies a site."
argument-hint: "<url | notes file> [--slug <name>] [--to project|plugin]"
```

**Body outline**: (1) the corpus is the skill's taste; (2) inputs; (3) `capture.mjs <url> --out .awards/research/<slug> --scroll 0,25,50,75,100 --mobile --reduced-motion`; if unreachable say so and lower confidence; (4) source inspection: HTML head, script/font/lib signatures (GSAP/Lenis/Three/Rive/anime), CSS custom properties, meta; short quotes only, no asset downloads; (5) write the card from `sites/_TEMPLATE.md`; (6) add a row to `_index.md` (project copy at `.awards/sites/_index.md` unless `--to plugin` inside the awards repo); (7) verify: confidence labels present, ≤ 200 lines, no copied copy beyond 25-word quotes; (8) hand-off `concept`; (9) refuse: scraping, reproduction, unevidenced stack claims.

---

## 3. Shared references and recipes

### 3.1 `references/` file list (with per-file outline and research source)

| File | Outline | Fed by |
|---|---|---|
| `README.md` | Index; citation convention (`[site:the-line]`, `[pattern:motion-vocabulary#easing]`); confidence labels; how to add a card | — |
| `craft-floor.md` (~90 lines) | **Verify** (contrast, type floors incl. display up to 12 vw with vw-lock, one authored moment per chapter, states, themed browser surfaces, designed footer + 404, DOM mirror, reduced-motion tiers, cursor off on coarse pointers, scrub `ease:none`, damping framerate-independent) and **Refuse** (impeccable's list rewritten in our words + award-specific: blob/particle hero, dark+neon+glow, fade-up-everything, scroll-jacking, blocking preloader, GL text without mirror, generated palettes). Original text, not copied from impeccable | §3, §6, impeccable craft-floor (shape only) |
| `anti-patterns.md` (~120) | "The Awwwards default" slop families with tells and rewrites; calibration triads (what every model ships for portfolio / B2B / campaign); the naming test | §6, impeccable new-work calibration |
| `reflex-lists.md` (~100) | Fonts to avoid (impeccable list + Inter/Space Grotesk/DM Sans/Manrope/Geist as display); verified alternatives by character class incl. corpus faces (Monument Grotesk, Avantt, Suisse BP Int'l, BT Steinhart, Helvetica Now, KTF Metro, George X, Denim, Mona Sans, IoskeleyMono) with licence notes; palettes to avoid; effect clichés. Mirrors `scripts/data/reflex-fonts.json` | §5 type notes, §6 typography |
| `jury/rubric.md` (~150) | Four axes with 0–10 anchors and band descriptions; Dev criteria (animation, WPO, responsive, a11y/semantics, code); weights; SOTD threshold; calibrated exemplars (Son Daven 7.70/7.16/8.15, Oryzo 7.9/7.51/8.35, Igloo dev 9.6 animation vs 6.6 a11y); what moves each score | §5 table, §6 award mechanics |
| `jury/usability-walk.md` (~80) | Keyboard-only path, coarse pointer, reduced motion, load gate, copy clarity, wayfinding, conversion; scoring cues | §6 (usability lowest), cards' gaps |
| `jury/report-template.md` (~40) | Fixed report + verdict-pass format | impeccable reviewer output contract (shape) |
| `patterns/narrative-structures.md` (~200) | Models: chaptered/spatial journey (Igloo, Mont-Fort, United Carriers, Son Daven), faceted brand world (Lando, Trevor), manifesto with gates (Why Zero), single-object launch (Oryzo, Slosh), collage/index (Trevor, Léo), gallery/changelog (Shopify), print artefact (The Line), specification/B2B (Seasats, White Desert, USAvionix, MindMarket); beats, interruption, rule of three, close, copy registers, DOM implications | §6 concept, cards |
| `patterns/hero-archetypes.md` (~160) | Nine archetypes (two-state typographic, role-casting boot, poster/video, object with inertia, collage, spatial descent, print artefact, headline-as-string, palette field): anatomy, entrance, mobile, recipe ids | cards 1,4,9,11,6,17,18,14,19 |
| `patterns/components-catalog.md` (~300, TOC) | ~24 components (preloader, nav overlay, cursor, scrubbed hero object, pinned chapter, horizontal rail, draggable plane/arc gallery, hover-preview list, marquee, scrollspy index, compare reveal, poster case blocks, metadata rows, spec blocks, map cards, edition switcher + ⌘K, stack cards, scroll-path, wavy text, footer, 404, easter eggs): role, seen-in, anatomy, motion, a11y, recipe id, refuse notes | §6 catalogue, MindMarket kit, Son Daven, Seasats |
| `patterns/motion-vocabulary.md` (~220) | Easing/duration/stagger tables; reveals; velocity inputs; scroll philosophies (a–e); damping math; transitions; anime.js equivalents; reduced-motion tiers | §6 motion, cards 1,10,17,18,19,15 |
| `patterns/preloaders-and-transitions.md` (~140) | Preloader archetypes (counter hold-at-100, gesture gate, boot sequence, cinematic title card, fps counter, Rive on `Promise.all`), sound consent, skip logic; transition archetypes (shared-element GL, RTT composite, brushstroke mask, hinge, theme swap, taxi / View Transitions) | cards 1,3,4,10,13,18,19,12 |
| `patterns/cursor-and-pointer.md` (~90) | Two-speed cursor, contextual badges, magnetic, hover previews, drag affordances, coarse-pointer policy, keyboard equivalents | cards 1,3,18, §6 |
| `patterns/typography.md` (~160) | Contracts, macro/micro, vw-lock math (210 px @1728 = 12.15278 vw), labels as texture, MSDF text, loading, faces seen | §6, cards 18,13,8,10 |
| `patterns/color-and-material.md` (~150) | Token counts, warm near-blacks, light grounds, accent derivation, colour as state, theme swap mechanics incl. canvas clear lerp, P3, sharp/shadowless, multiply acetate, grain, ice recipe | §6 colour, cards 18,19,10,1,17 |
| `patterns/copy-and-content.md` (~120) | Numbers not adjectives, dual units, verb chains, constraint-removal formula, two registers, conversion matched to stakes, telemetry register, metadata boasts, credits, the villain | §6 copy, cards 2,5,7,4,17 |
| `patterns/webgl-architecture.md` (~220) | DOM-tethered planes, canvas positioning, scroll→uniforms, scene windows, unifier vs narrative shaders, depth ladder, tiers, disposal, DOM mirror; effect parameter table | §6 WebGL, cards 1,10,11,12,17,19 |
| `patterns/asset-pipeline.md` (~120) | glTF + Draco/meshopt, KTX2 ETC1S/UASTC, atlases, stacked RGB+alpha video, image formats, budgets, staged loading, workers | cards 3,12,13,17 |
| `patterns/accessibility-and-reduced-motion.md` (~120) | The deliberate improvement: tiers, DOM mirror, keyboard for drag/hold/draw gates, overlay focus management, live regions, `aria-hidden` canvas, sound consent, no breakpoint reloads | §6 award mechanics, cards 17,10,13 |
| `patterns/responsive-strategy.md` (~90) | vw-lock, breakpoints, coarse pointer, mobile GL budget rules (DPR cap, pixel cap, half-float, SMAA, low-detail variants, pause offscreen), dedicated mobile vs degrade | cards 18,13,19,12 |
| `patterns/sound.md` (~50) | Opt-in, levels (.375/.35), state-bound crossfades, rate-limited SFX, Howler, persistence | cards 1,17,14 |
| `stacks/vite-vanilla.md`, `next.md`, `nuxt.md`, `astro.md`, `sveltekit.md`, `webflow-export.md` (~80–120 each) | Setup, adapter code (Lenis/GSAP/Three hooks or islands), transitions, chunking, fonts, deploy notes; which winners used it | §5 stack rows, Satūs, Mont-Fort, Lando, Igloo, The Line |
| `stacks/gsap-3.15.md`, `lenis-1.3.md`, `animejs-4.md`, `three-0.186.md` (~80–120 each) | API notes verified via Context7 during implementation (SplitText `mask`/`autoSplit`, `matchMedia`, Observer; Lenis options + ticker; anime v4 grammar from the cloned repo; Three ColorManagement, KTX2/DRACO loaders, postprocessing) | repo clone, Context7 |
| `stacks/versions.md` | Pinned versions table (from §2) + "check Context7 before using an API you have not verified" | §2 |
| `sites/_index.md` (~60) | Table: slug, name, class, visitor mode, narrative model, WebGL dosage, scroll model, palette strategy, type contract, awards/score, confidence; neighbour-picking guidance | §5 table |
| `sites/_TEMPLATE.md` | 12 sections + confidence labels + Take/Don't-take | reports A/B/E schema |
| `sites/<slug>.md` × 19 (≤ 200 lines each) | `leo-parpeix, white-desert, why-zero, usavionix, seasats, trevor-noah, united-carriers, son-daven, lama-lama, floema, oryzo, shopify-editions-w26, lando-norris, mont-fort, animejs, mindmarket, igloo, the-line, slosh-seltzer` — header (URL, class, awards, scores, studio, stack with evidence level, palette hexes, type) · Concept · Structure & components · Visual language · Motion & effects (parameters) · Tech & pipeline · Weaknesses · Principles · Take / Don't take · Confidence & sources | transcripts A–E + §5 cards |

### 3.2 Recipe catalogue (`recipes/`)

Contract per recipe folder: `index.html` (imports `../_shared/base.css`, demo content authored, semantic), `main.js` (ESM, bare imports resolved by `recipes/package.json`), `style.css`, `README.md` (what/why, parameters, a11y, reduced-motion behaviour, deps, adapters), `recipe.json` (`id, title, tags, deps, tier, verified: {date, chromium}`), `verify.mjs` (exports `{ waitFor, states:[…], assert(pageStates) }` for the harness), optional `adapters/{react.tsx, vue.vue, svelte.svelte, astro.astro}`. Every recipe implements the page-side contract `window.__awards = { ready: Promise, scrollTo(progress), state() }` from `_shared/awards-hook.js` so `capture.mjs` can drive virtual scroll. Vanilla Vite first; framework adapters only where marked.

| # | Recipe id | Demonstrates | Tier | Variants | Sandbox verification (all: no console/page errors; desktop + mobile + RM captures) |
|---|---|---|---|---|---|
| 1 | `boot-lenis-gsap` | Lenis 1.3 + GSAP 3.15 single ticker, `lagSmoothing(0)`, ScrollTrigger update, refresh after fonts, resize, RM switch, `__awards` hook | P0 | vanilla; React (`useLenis`+`useGSAP`); Astro island note | `state().scroll` ≈ 50 % after `scrollTo(.5)`; `ScrollTrigger` progress reported |
| 2 | `scroll-pin-scrub` | Pinned chapter + scrubbed timeline, `ease:'none'`, `invalidateOnRefresh`, media scrub | P0 | GSAP; anime.js `onScroll({sync})` | captures at 0/50/100 differ; audit M03 = 0 |
| 3 | `sticky-stages-rails` | The Line: sticky stages with invisible rails (no `pin:true`), hero hinge panel (origin bottom-left, x 0→−10 %, rotate 0→−15°), child rotates harder and lags | P0 | GSAP | computed transform rotation at 0 vs 100 |
| 4 | `split-text-masked-reveal` | `SplitText.create` lines with `mask:'lines'`, `y:150%`→0, stagger .1, expo.out, `autoSplit`, font-load gating; RM = opacity only | P0 | GSAP; anime `splitText` + `stagger` | after `ready`, lines visible; RM capture has no residual transform |
| 5 | `flicker-text` | Per-letter opacity ladder `[0,1,0,0,1,1]`, ~.04 s stagger, expo-out hover shift | P1 | GSAP; anime keyframes | span count = glyphs; final opacity 1 |
| 6 | `scramble-decode-text` | Telemetry decode reveal (charsets, cursor `░▒▓█`), reveal/settle rates | P1 | anime.js `scrambleText`; custom vanilla | final text equals source |
| 7 | `magnetic-button` | `quickTo` pull with distance falloff, ring/label split, `pointer: fine` only, focus-visible | P0 | vanilla | `--hover` capture shows offset transform |
| 8 | `cursor-two-speed` | Dot lerp .75 / ring .22, hover scale 1.35×/0.7×, `data-cursor` badges (drag/play/view/copy), hidden on coarse pointer and window leave | P0 | vanilla | after synthetic pointer move, dot/ring transforms differ; hidden under touch emulation |
| 9 | `marquee-raf-mask` | rAF wraparound, mask edge fade, pause on hover/focus, speed from scroll velocity, RM static | P0 | vanilla; anime `createTimer` variant | transform changes between two frames; RM: no change |
| 10 | `preloader-counter-hold` | Non-linear counter tied to real `Promise.all(fonts, assets)`, hold at 100, exit `y:150%` stagger, `aria-live`, sessionStorage skip; variants: click-to-enter sound consent, boot-sequence readouts (USAvionix), fps counter (The Line) | P0 | GSAP | capture at t0 shows counter; after `ready` preloader removed from a11y tree; second load skips |
| 11 | `theme-swap-tokens` | `data-theme` per section, tween `--bg/--ink` on `documentElement` over 1–1.5 s with `cubic-bezier(.645,.045,.355,1)`, canvas clear colour RGBA-lerped in the same tween | P0 | GSAP (+ optional Three clear) | computed `background-color` differs at scroll states |
| 12 | `nav-overlay-fullscreen` | Numbered links, stagger in/out, focus trap, ESC, `inert` on page, theme-aware, scroll lock via Lenis | P0 | vanilla | Playwright keyboard open/close; focus stays inside |
| 13 | `sticky-stack-cards` | Stacked sticky cards with scale/blur of the previous card (MindMarket) | P1 | GSAP; anime `onScroll` (from `onscroll-sticky` example) | card transforms at states |
| 14 | `horizontal-rail` | Horizontal section inside vertical page (pin + x), arrow keys, touch = native overflow fallback | P1 | GSAP | x translate differs; mobile capture shows native scroll |
| 15 | `hover-preview-list` | Archive list with cursor-following preview image, keyboard focus shows preview | P1 | vanilla | `--hover` shows preview; focus via Tab shows preview |
| 16 | `compare-hold-drag` | Hold/drag to compare two renders (Son Daven), pointer capture, arrow keys | P1 | vanilla | drag via mouse steps changes clip; keyboard changes clip |
| 17 | `scroll-drawn-svg-path` | Dash-offset path drawn on scroll | P1 | GSAP; anime `svg.createDrawable` | dashoffset at states |
| 18 | `page-transitions` | `@unseenco/taxi` overlay transition + Lenis reset + `gsap.context` cleanup; variant: View Transitions API for MPA/Astro | P0 | taxi; VT | navigate between two pages in Playwright; no duplicate tickers |
| 19 | `gl-dom-tethered-planes` | Three planes mapped from `getBoundingClientRect`, absolute canvas re-offset (Lusion), Floema velocity bulge shader, DPR cap, dispose, `<img>` fallback + `aria-hidden` canvas | P0 | Three; OGL | `--webgl` capture differs from `--no-webgl`; images present in DOM |
| 20 | `gl-fluid-wake-post` | 128² ping-pong velocity FBO (dissipation .96) → full-frame UV distortion .0035 + chromatic aberration | P0 | Three | pixels change after pointer move |
| 21 | `gl-depth-map-parallax` | Image + depth map parallax on pointer/scroll (2.5D), static fallback | P1 | Three | capture differs across pointer positions |
| 22 | `gl-rtt-composite-transition` | Two scenes to render targets, blended by custom shader, driven by section switch | P1 | Three | mid-transition capture differs |
| 23 | `gl-virtual-scroll-camera` | Wheel/touch → eased float (friction .97, double lerp) → camera on CatmullRom spline, DOM-anchored labels, 1.4 s snap, keys/PageDown, RM = stepped | P1 | Three | `scrollTo(.5)` moves camera; keyboard advances section |
| 24 | `gl-hero-object-inertia` | Procedural or tiny Draco glb object with pointer inertia, matcap/HD

---

RI lighting, scroll-scrubbed rotation | P1 | Three; R3F adapter | rotation differs at states; no glb > 300 KB shipped |
| 25 | `gl-postprocessing-presets` | `postprocessing` 6.39 composer, fixed bloom presets (1.5/.5/.25), grain, SMAA, half-float RT on mobile, tier hook | P1 | Three | preset switch changes pixels; mobile capture uses lower DPR |
| 26 | `image-sequence-scrub` | Pre-rendered frame sequence scrubbed on scroll (Seasats), canvas draw, preloading, poster fallback | P1 | vanilla | frame index differs at states |
| 27 | `quality-tiers` (+ `_shared/quality-tiers.js`) | DPR/`deviceMemory`/GPU string/frame-time probe → tier → DPR, blur samples, LOD, effect toggles; demo page | P0 | vanilla | tier reported in `state()` |
| 28 | `reduced-motion-switch` (+ `_shared/reduced-motion.js`) | Central `prefersReducedMotion()`, `gsap.matchMedia` wrapper, three tiers demo | P0 | GSAP; anime `createScope` mediaQueries | RM emulation flips tier |
| 29 | `sound-toggle-opt-in` | Howler ambient + SFX opt-in, persistence, audio-reactive 24×24 icon | P2 | vanilla | DOM state only (no audio in headless) |
| 30 | `gl-msdf-text` | MSDF text in canvas with DOM mirror | P2 (v1.1) | Three | deferred |

Priority: P0 (16 recipes) before skills are finalised; P1 (12) before evals; P2 later.

---

## 4. Scripts

### 4.1 `scripts/capture.mjs`

```
node capture.mjs <url|file|dir> [--out .awards/captures] [--desktop 1440x900] [--mobile 390x844]
  [--scroll 0,50,100] [--reduced-motion] [--full-page] [--selector <css>] [--hover <css>]
  [--wait <ms>] [--wait-for <css>] [--webgl|--no-webgl] [--json] [--name <prefix>]
```
- Resolves Playwright in order: project `node_modules/playwright` → `playwright-core` → `npm root -g` → `$AWARDS_PLAYWRIGHT`; else prints one line ("Playwright not found; install with `npm i -D playwright && npx playwright install chromium`, or pass screenshots manually") and exits 3. Browsers via `PLAYWRIGHT_BROWSERS_PATH` if set.
- File/dir input → ephemeral static server (`lib/server.mjs`, correct MIME, ESM-safe) on a random port; never `file://`.
- Chromium flags for GL: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`; `--no-webgl` blocks `getContext('webgl*')` via init script.
- Per state: wait `document.fonts.ready` + network idle + `window.__awards?.ready`; scroll via `__awards.scrollTo(p)` if present else `window.scrollTo`, then `ScrollTrigger?.update()`, `--wait`; `--reduced-motion` uses `emulateMedia({ reducedMotion: 'reduce' })`.
- Output names: `desktop-s00.png`, `desktop-s50.png`, `mobile-s00.png`, `desktop-rm-s00.png`, `component-<slug>.png`, `component-<slug>-hover.png`; `manifest.json` with viewport, scroll states, console/page errors, failed requests, `webgl: boolean`, LCP/CLS entries, DOM node count, title/lang.
- Exit: 0 ok · 2 page/console errors · 3 Playwright missing · 4 unreachable. One-line messages, no stack traces.

### 4.2 `scripts/audit.mjs`

```
node audit.mjs <dir|file|url> [--json] [--quick] [--changed-file <path>] [--render]
  [--scope fonts,contrast,motion,a11y,layout,perf,surfaces,slop] [--ignore T01,…] [--config .awards/audit.json]
```
Static, dependency-free (hand-rolled tolerant HTML/CSS/JS scanning in `lib/`); `--render` adds in-page checks through the capture resolver. Rules (`scripts/data/rules.json` is the single source; `reflex-fonts.json` mirrors `references/reflex-lists.md`):
- **T** fonts: T01 reflex face · T02 Google Fonts CDN · T03 display > 12 vw or unclamped · T04 tracking < −0.06em · T05 `@font-face` without `font-display` · T06 no `size-adjust` fallback (advisory)
- **C** colour: C01 body contrast < 4.5 (token pairs; real pairs under `--render`) · C02 #000/#fff ground (advisory unless `## Exceptions` says diegetic) · C03 > 6 hues · C04 gradient text
- **M** motion: M01 no `prefers-reduced-motion` / `matchMedia` RM branch · M02 global `0.01ms` kill · M03 `scrub:` tween with ease ≠ none · M04 `will-change` on > 5 selectors or `*` · M05 `scroll-behavior: smooth` with Lenis · M06 `pin:true` inside sticky (advisory) · M07 animating layout props · M08 `repeat:-1` without visibility pause
- **A** a11y: A01 landmarks missing · A02 img without alt · A03 heading order/no h1 · A04 canvas without `aria-hidden` or mirror · A05 click handlers on div/span · A06 no `:focus-visible` · A07 `outline:none` unreplaced · A08 custom cursor without `pointer: coarse` guard · A09 no `lang` · A10 autoplay video without `muted`/`playsinline` · A11 pointer-only interaction without keyboard handler
- **L** layout: L01 fixed widths > 600 px · L02 `100vw` overflow risk · L03 viewport meta · L04 identical card grid · L05 eyebrow/kicker classes
- **P** perf: P01 img without `loading`/dimensions · P02 raster > 1 MB · P03 glb without Draco/meshopt · P04 entry JS > 300 KB gz (when `dist/` exists) · P05 fonts > 4 files / 400 KB · P06 uncapped `setPixelRatio` · P07 `WebGLRenderer` without `dispose`
- **S** surfaces: S01 no `::selection` · S02 no scrollbar styling (advisory) · S03 no `theme-color` · S04 no `color-scheme` · S05 no favicon · S06 no OG image
- **X** slop: X01 "Get started"/"Learn more" CTAs · X02 lorem · X03 emoji icons · X04 `backdrop-filter` > 3 selectors · X05 hard offset shadow · X06 side-stripe border · X07 numbered markers (advisory) · X08 hero-metric template
Output: table, or `--json` `{summary, findings:[{rule, severity, file, line, message, fix}]}`; honours `<!-- audit-ignore: T01 reason -->` and `AWARDS.md ## Exceptions`. `--quick` = regex rules on one file, < 300 ms, for the hook (reads tool-input JSON from stdin when `--changed-file -`). Exit 0 clean · 2 P0/P1 findings · 1 error.

### 4.3 Helpers
- `new-project.mjs --stack vite|next|nuxt|astro|sveltekit --name <dir> [--webgl] [--fonts <dir>] [--dry-run]`: copies `assets/scaffold/<stack>`, writes `package.json` with pinned versions from `stacks/versions.md`, refuses to overwrite, prints next steps.
- `roll.mjs --deal 3 --of 7 [--seed <key>] [--reroll n]`: seeded PRNG, prints `SEED <key>` and dealt indices.
- `verify-recipes.mjs [--only <id,…>] [--report]`: `vite build` (MPA), static-serve `dist/`, for each recipe run capture (desktop/mobile/RM/scroll states, GL flags), run its `verify.mjs` assertions, write `recipes/_verify/report.json` + PNGs to the scratchpad, update `recipe.json.verified`.
- `tools/extract-report.mjs <jsonl> --out <md>` (dev-only): last `assistant` text block > 4,000 chars; split per site on `^## .*https?://` headings.
- `lib/`: `playwright.mjs` (resolver), `server.mjs`, `html.mjs`, `css.mjs`, `contrast.mjs` (WCAG relative luminance), `report.mjs`.

---

## 5. Evals

`evals/evals.json` (skill-creator schema: `skill_name`, `evals[] {id, prompt, expected_output, files, expectations}`) + `evals/run-evals.sh` (for each eval: temp project copy of `files/`, `claude -p --plugin-dir plugins/awards --permission-mode acceptEdits --output-format json "<prompt>"`, then `node evals/check.mjs <eval-id> <dir>` runs the objective checks) — since `claude plugin eval` does not exist in the installed CLI.

| # | Prompt (abridged) | Fixture | Objective checks |
|---|---|---|---|
| 1 | "Build an award-worthy site for a small Antarctic expedition operator (Vite, no CMS, we have 12 photos)" | none | `AWARDS.md` has all contract blocks + DIVERGENCE; `DESIGN.md` ≤ 4 colour tokens, T01 = 0; `index.html` landmarks + single h1; RM branch present (M01 = 0); `audit.mjs` exit 0; `.awards/captures/manifest.json` has desktop/mobile/rm; jury log with 4 scores; no White Desert phrases (grep "all directions lead north", "Echo"); no `#0016CB`-style corpus hexes reused |
| 2 | "Make the navigation of this site award-worthy" | `files/plain-site/` | diff touches only nav files + tokens; overlay has focus trap, ESC, `inert`; stagger animation; RM branch; no new font; `component-*.png` captured open state |
| 3 | "Add a WebGL hero where the product images distort with scroll velocity" | `files/product-page/` | Three/OGL imported; rect→plane mapping; `Math.min(devicePixelRatio, …)`; `dispose`; `<img>` remain; canvas `aria-hidden`; RM disables distortion; manifest `webgl:true` with `--webgl`, images visible with `--no-webgl` |
| 4 | "Judge this landing page like an Awwwards jury" | `files/generic-saas/` | report has four 0–10 scores + dev sub-scores; disposition line; memory-test paragraph; ≤ 8 ordered fixes; ≥ 3 audit rule ids cited; no files edited; ran forked/agent |
| 5 | "The animations feel generic — do a motion pass" | `files/fadeup-site/` (fade-ups everywhere, `scrub:true` + `power2.out`) | M03 = 0 after; count of `opacity:0 → 1` section tweens reduced ≥ 60 %; `## Motion score` written; RM branch; scroll-state captures exist |
| 6 | "Analyse https://example-studio.tld and add it to the references" | none (egress-blocked) | `.awards/sites/<slug>.md` follows template with confidence labels; states unreachable + inferred; index row added; no asset files written |

**Should trigger** (description tuning): "make me an Awwwards-level portfolio"; "the best landing page you can build"; "immersive site with smooth scroll"; "add a custom cursor like Léo Parpeix"; "is this site award-worthy?"; "set up Vite with GSAP and Three"; "the hero needs to feel premium"; "scrollytelling for our product story"; "what makes igloo.inc so good?"; "pick fonts and colours for a luxury travel site".
**Should not trigger**: "add a dashboard chart" (dataviz); "fix this React state bug"; "write API docs"; "make the settings page accessible" (generic a11y, unless award framing); "build a CRUD admin"; "convert Figma to Tailwind" (unless award framing).

---

## 6. Implementation order

| Phase | Work | Parallel? | Verify | Commit (branch `claude/award-worthy-website-skill-rbcead`) |
|---|---|---|---|---|
| 0 Skeleton | `.gitignore`, delete stray `cap.txt`, `plugins/awards/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, README stubs, `scripts/lib/*`, templates | no | `claude plugin validate plugins/awards`; `claude --plugin-dir plugins/awards` loads | 1 `chore: plugin skeleton` |
| 1 Corpus | `tools/extract-report.mjs` → 5 raw reports in scratchpad; 19 site cards; `_index.md`; patterns, jury, craft-floor, anti-patterns, reflex lists; stacks | yes: 5 card-writer agents (one per batch A–E, inputs = raw report + §5 card + template), 2 synthesis agents (patterns split motion/GL vs narrative/type/colour/copy), 1 stacks agent using Context7 for API claims | lint: line budgets, template sections present, confidence labels, no > 25-word verbatim site copy, links resolve | 2 `docs(references): corpus and patterns` |
| 2 Scripts + recipes | `capture.mjs`, `audit.mjs`, `new-project.mjs`, `roll.mjs`, `verify-recipes.mjs`; `recipes/` P0 then P1; scaffold | yes: scripts (1 agent), recipes by family (text/motion · pointer/structure · GL) | `verify-recipes.mjs` green in sandbox (SwiftShader GL); `audit.mjs` on each recipe = 0 P0/P1; `capture.mjs` exit 3 path tested with `PATH` stripped | 3 `feat(scripts)`, 4 `feat(recipes): P0`, 5 `feat(recipes): P1` |
| 3 Skills + agent + hook | 11 `SKILL.md`, `agents/awards-jury.md`, `hooks/hooks.json` | yes: 3 agents (plan/design skills · build skills · verify/grow skills), then one consistency pass | `claude plugin validate`; load with `--plugin-dir`; `/awards:craft status`, `/awards:jury` on a recipe (confirm fork does not inherit transcript); hook fires only with `AWARDS.md` present and stays < 300 ms | 6 `feat(skills): awards skill set` |
| 4 Evals | fixtures, `evals.json`, `run-evals.sh`, `check.mjs`; run 1–5 (6 optional); tune descriptions with the trigger lists | evals in parallel via `claude -p` | pass rate recorded per eval; regressions fixed in skills | 7 `test(evals)` |
| 5 Release | README (install, map, provenance, licence), version 0.1.0, push, PR | no | fresh clone → `/plugin marketplace add` → install → smoke | 8 `docs: release 0.1.0`, push + PR |

---

## 7. Risks and open decisions (the ones that change the work)

1. **Eleven skills vs one entry point.** Recommended: eleven (auto-triggering on partial requests is the point). If the user prefers a single `/awards` with sub-commands, the sub-skill bodies become `references/commands/*.md` and only `craft` ships — decide before Phase 3.
2. **Hook in v1.** Recommended: yes, gated on `AWARDS.md`, quick mode. Say no and `hooks/` ships as `hooks.example.json` with README instructions.
3. **Font licensing stance.** Corpus faces are mostly licensed; recommended: teach the character classes, recommend verified open faces by default, name licensed faces as "if you can license". Decide whether the skill may propose paid faces.
4. **Where `research` writes.** Recommended: project `.awards/sites/` by default, plugin corpus only inside this repo.
5. **Framework adapter scope for v1.** Recommended: vanilla Vite complete; React adapters for recipes 1, 4, 19, 24 only; Nuxt/Astro/Svelte as reference notes, not code.
6. **`context: fork` behaviour for jury.** Must be verified in Phase 3; fallback is agent spawning from `craft` with an input packet.
7. **Corpus confidence.** Seven sites (Lando, Mindmarket, Mont-Fort, Anime.js, The Line, Igloo, Slosh) were analysed without live search; cards carry lower confidence and should be topped up with `/awards:research` when a networked session is available.
8. **Original text vs impeccable.** All reference prose must be original (structure may echo; wording must not); add a NOTICE line crediting impeccable's architecture as inspiration. Plugin name stays `awards` (never "awwwards") to avoid a trademark issue.
9. **Permission friction.** `allowed-tools` wildcards for `node …/scripts/*.mjs` are unverified in plugin skills; v1 leaves prompts on and documents a one-line `settings.json` allow rule.

### Critical Files for Implementation
- `/home/user/awards/plugins/awards/skills/craft/SKILL.md` — the orchestrator: contract blocks, phase routing, calibration
- `/home/user/awards/plugins/awards/references/sites/_index.md` — the corpus index every planning skill reads first (plus the 19 cards it points to)
- `/home/user/awards/plugins/awards/references/patterns/motion-vocabulary.md` — the shared vocabulary `motion`, `webgl`, `component` and the recipes are built from
- `/home/user/awards/plugins/awards/scripts/audit.mjs` — the deterministic craft floor used by `ship`, `jury` and the hook
- `/home/user/awards/plugins/awards/scripts/capture.mjs` — the evidence source for `jury`, `ship`, `component`, `research` and recipe verification