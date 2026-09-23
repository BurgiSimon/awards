---
name: craft
description: "Design and build award-worthy websites end to end (Site of the Day / Month / Year and Developer Award league): brief → concept → visual system → page structure → stack → motion → WebGL → jury → ship. Use whenever the user wants a site, landing page, portfolio, campaign, product, studio or brand site that should be 'award-worthy', 'award-level', 'the best site you can build', 'immersive', 'cinematic', 'creative-developer style', 'with smooth scroll / GSAP / Lenis / WebGL', names studios or sites (Lusion, basement, Igloo, Lando Norris, Léo Parpeix) or says 'make it stunning'. Also the entry point when unsure which awards skill applies: it routes single elements to awards:component and critiques to awards:jury, and it owns AWARDS.md. Not for dashboards, admin CRUD, bug fixes, API docs or accessibility work with no award framing."
argument-hint: "[brief | site | component | resume | status | jury | ship] [target]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:craft — the orchestrating skill

Codex: read [the runtime guidance](../../references/codex.md) before following this skill; it maps plugin paths, tool names and handoffs to Codex.

This skill turns a brief into a finished, judged and shipped site by driving the other awards skills in order. It never does their work itself: it captures the brief, keeps `AWARDS.md` honest, routes each phase to the right skill, calibrates against the award rubric and refuses to call a build finished before a jury and a ship report exist.

## What award-worthy means here

Why: the reference corpus (the analysed winners in `${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md`) agrees on more than a look, and the agreement is what a jury rewards. Hold these five points as the definition of done.

- Concept first. Every winner makes one idea do the job a feature list usually does; effects serve that idea or get cut.
- One world, one signature, one authored load and one authored close. A page that is loud everywhere has no loud moment.
- A Developer Award accompanied nearly every Site of the Day in the corpus, so the technical bar (one ticker, budgets, disposal, semantics) is part of the brief, not a polish step.
- Usability is the lowest axis on nineteen of the twenty verified references, and the lowest-scoring axis in the corpus overall (7.00–7.90) [verified, twenty Awwwards entries read 2026-09-18]. The reduced-motion, keyboard and DOM-mirror paths they skipped are where new work beats them without borrowing anything.
- The memory test: what a visitor describes an hour later must be an object or a behaviour, never a mood. "Cinematic" is not an answer; "the shipment that crosses the page" is.

## Setup

Why: the durable files are the memory of the build; a skill that starts without them re-asks what is already decided and drifts from the contract.

1. Read `AWARDS.md` in the project root if it exists and resume from its `## Status` checklist; treat every locked block as decided.
2. Read `DESIGN.md` in the project root if it exists; its tokens are the visual system and are not re-invented here.
3. If impeccable's `PRODUCT.md` exists, read it for product truth (audience, purpose, voice, constraints) and never overwrite it.
4. Detect the scope: a whole site, one component (a named element, file or selector), or a critique of existing work.
5. Detect the stack from `package.json` and framework files (`vite.config.*`, `next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, a Webflow export); note the motion and GL libraries already installed.
6. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once — it drives every phase in order — then proceed with this skill if the user declines.

Inside this skill step 6 is already satisfied: `craft` is the skill being offered, so go straight to scope and routing.

Before implementation, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" <project-dir> --json` once for this environment (use the existing parent if the project does not exist yet). Read `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md` for failure handling; rerun after scaffolding/installing prerequisites, not at every handoff. Continue independent design/static work while missing browser evidence remains explicit. Skip this for status or ideas-only requests.

## Read before you touch anything

Why: the corpus and the floor live in reference files so this skill stays short; reading the right file at the right moment is the whole method.

- `${CLAUDE_PLUGIN_ROOT}/references/craft-floor.md` before any UI edit in the project, in every phase. It is the floor the audit measures, not the ceiling.
- `${CLAUDE_PLUGIN_ROOT}/references/jury/rubric.md` before writing the calibration line in the brief and before reading any jury report.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/narrative-structures.md` when the brief is vague about what the page has to argue; it gives the intake questions their vocabulary.
- `${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md` before the naming test and whenever a phase artefact looks generic.
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/AWARDS.md` when creating the project's `AWARDS.md`; copy it whole and keep its section order and block names.
- `${CLAUDE_PLUGIN_ROOT}/references/README.md` for the citation convention (`[site:slug]`, `[pattern:file#anchor]`, `[recipe:id]`) used in every artefact.

## Scope and routing

Why: skills cannot call each other programmatically, so the routing is a written decision made once, at the top, from the argument and the request.

| Argument or request | Reading | Action |
|---|---|---|
| `brief <text>`, `site <target>`, or a description of a whole page or site | whole site | Run the workflow from the first unchecked phase in `## Status` (phase 0 when there is no `AWARDS.md`) |
| `component <name, file or selector>`, or a request that names one element ("the hero", "this menu", "a cursor like…") | one component | Invoke the `awards:component` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. |
| "is this award-worthy", "review", "score", "critique", "what is missing" | critique | Invoke the `awards:jury` skill now with the Skill tool, passing the brief, AWARDS.md path, and exact recorded captures directory and manifest path when available; do not do its work inline. |
| `resume` | continue | Print the next unchecked phase and its entry condition, confirm in one question, then run it |
| `status` or no argument | orientation | The status menu below; never start a phase from it without an answer |
| `jury`, `ship` | one phase | Invoke that skill with the routing line of its phase row |
| Dashboard charts, admin CRUD, state bugs, API docs, a Tailwind conversion, plain accessibility fixes | out of scope | Say so in one line and stop; no awards skill applies |

A component request inside a project that already has `AWARDS.md` and `DESIGN.md` still routes to `awards:component`; it inherits the world from those files instead of opening a new concept round.

### The status menu

Why: a build resumed in a new session has state the user may not remember; running a phase on an assumption wastes a jury round.

Print, in this order: the `## Status` checklist as it stands; the next unchecked phase with its entry condition and the skill it routes to; the last line of `## Jury log` and `## Ship log` if any; the `## Exceptions` count. Then ask with AskUserQuestion which to run: the next phase, a specific phase, a jury round, or nothing. Never auto-run a phase from the menu.

## Intake — phase 0

Why: every later decision is derived from seven facts, and a wrong guess about the audience's real scene produces a beautiful page for the wrong people.

1. Copy `${CLAUDE_PLUGIN_ROOT}/assets/templates/AWARDS.md` to the project root if it does not exist. If `PRODUCT.md` exists, prefill the brief from it and say so.
2. Ask at most three questions in one AskUserQuestion round, choosing from: the unique mechanism (what only this subject can prove), the audience and their real scene (where they are when they read this), the stakes and conversion, the assets on hand, binding constraints (stack, CMS, hosting, deadline, brand, accessibility standard), route count, sound.
3. Assert your likely reading of everything you did not ask ("I read this as a persuade site for buyers who see it on a phone between meetings; correct me") so the user edits instead of composes.
4. Never ask for CSS values, fonts, colours or effects; those are outputs of later phases.
5. Write `## Brief` with every field filled, label every asset that will be authored for the build as synthetic, set the visitor mode (persuade / experience / read), and tick "Brief captured".
6. Ask once whether to commit at phase boundaries; a jury `rebuild` then has a known state to return to.

### Visitor modes

Why: the same subject wants a different amount of spectacle depending on what the visitor came to do; the mode is set once in the brief and every sub-skill reads it to calibrate how far it may go.

| Mode | The visitor came to | What it licenses | What it forbids |
|---|---|---|---|
| persuade | decide: buy, enquire, download a spec sheet | one signature, evidence blocks, the conversion in the first viewport and at the close | a gate before the content; a scroll model that hides the action |
| experience | be somewhere | a world: canvas-first or fully canvas with a DOM mirror, a virtual float with keys, gates with skips | a story with no rail out; an empty DOM behind the loader |
| read | scan and find | a short hero, the index on screen one, local search past about a hundred items, effects that never delay text | a preloader that waits for more than the first scene; a hero-scale moment per item |

A big-ticket subject is persuade wrapped in experience: emotion first, then the numbers (`[pattern:narrative-structures#emotion-before-economics]`).

## The workflow

Why: the order is the method. Code written before the contract is locked has to be thrown away when the concept changes; a stack chosen before the concept decides the WebGL dosage backwards.

Two rules apply to every phase: never write page code before `## Direction contract` is locked, and never pick the stack before the concept. A phase runs only when its entry condition holds; its exit artefact is what the next phase reads.

| # | Phase | Entry condition | Invocation | Exit artefact |
|---|---|---|---|---|
| 0 | Brief | No `AWARDS.md`, or "Brief captured" unchecked | Done here (see Intake) | `AWARDS.md ## Brief`, visitor mode, synthetic labels |
| 1 | Concept | Brief captured; no locked contract | Invoke the `awards:concept` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | `## Direction contract` with every block concrete, `## Page map` skeleton, `Seed` |
| 2 | System | Contract locked; no `DESIGN.md` or one that predates the contract | Invoke the `awards:system` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | `DESIGN.md`, `src/styles/tokens.css`, audit clean on fonts, contrast, surfaces |
| 3 | Structure | `DESIGN.md` exists | Invoke the `awards:structure` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | `## Page map` filled per chapter, static semantic skeleton, responsive strategy, authored 404 |
| 4 | Stack | Skeleton exists; no booted project (no `package.json`, or no Lenis + GSAP boot) | Invoke the `awards:stack` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | Project boots on one ticker, `window.__awards` hook, `## Budgets & tiers` |
| 5 | Motion | Stack booted; static checkpoint recorded in Page map Notes | Invoke the `awards:motion` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | `## Motion score` and the motion code, reduced-motion tiers wired |
| 6 | WebGL | SIGNATURE or the motion score names a GL moment; otherwise tick "explicitly declined" and skip | Invoke the `awards:webgl` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | GL layer in its own chunk, DOM mirror, no-GL fallback, budgets updated |
| 7 | Jury | Phases 1–6 done or declined; the page renders | Invoke the `awards:jury` skill now with the Skill tool, passing the brief, AWARDS.md path, `--captures <recorded-directory>`, and that directory's exact `manifest.json` path; do not do its work inline. | `.awards/jury/<date>.md`, a line in `## Jury log`, a disposition |
| 8 | Ship | Disposition is `fix` or `ship` | Invoke the `awards:ship` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. | `.awards/ship/<date>.md`, a line in `## Ship log`; "Shipped" ticked only after the ship gate passes |

Resolution rules:
- After every phase: tick its Status line, read the exit artefact yourself (not the skill's summary), and check it against the contract before invoking the next skill.
- A phase that finds a broken earlier artefact (a page map that contradicts STORY) stops and returns to that phase; it does not patch around it.
- Phase 6 is skipped, not forgotten: the Status line reads "explicitly declined" with the dosage rung the contract chose.
- When ship applied material fixes, phase 7 runs once more as a verdict pass (`awards:jury --verdict`); at most two jury rounds per build unless the user asks for more.

### What to check at each hand-back

Why: a sub-skill reports what it did; this skill verifies what exists. Read the file, not the summary.

- After concept: every contract block passes its "concrete when" test (table below); `Seed` holds the key `roll.mjs` printed; the `## Page map` skeleton has one row per chapter or route, including the 404 in a faceted world.
- After system: the `DESIGN.md` frontmatter values and `src/styles/tokens.css` are identical; two to four colour tokens; the display face is not on the reflex list; `audit.mjs --scope fonts,contrast,surfaces` is clean.
- After structure: one `<h1>`, landmarks, a skip link, the overlay slot and the preloader status region exist; a 404 page exists; the page reads top to bottom with CSS off; the responsive strategy is named in the page map notes.
- After stack: the dev server boots; `window.__awards` answers `ready`, `scrollTo` and `state`; one ticker drives Lenis and ScrollTrigger; `## Budgets & tiers` is filled. Before motion, inspect hero, a middle section and the close at desktop/mobile widths against the selected principles in `${CLAUDE_PLUGIN_ROOT}/references/patterns/visual-composition.md`; fix material defects in one batch and record the result plus manifest path in Page map Notes. If capture is unavailable, record `unmeasured` and continue independent work without a passed visual gate.
- After motion: every `## Motion score` row has a reduced-motion tier and a recipe or "custom"; `audit.mjs --scope motion` is clean (scrubbed tweens on `ease: 'none'`, no global kill).
- After webgl: the `--no-webgl` capture shows the same headings and images; the canvas is `aria-hidden`; the GL chunk is lazy and the DPR capped; `dispose` runs on route change.
- After jury: the report starts with the disposition line and has at most eight ordered fixes and a Keep line. Valid rendered evidence gives four axis scores with reasons and a memory-test answer; `recapture` gives all-unmeasured scores, memory and visual fidelity plus located source findings where available. Component reports use D/U/C only.
- After ship: the ship report lists the fix batch, the audit summary, the capture list and the performance table; `## Exceptions` explains every accepted finding.

## The direction contract

Why: the contract is the only place the whole team of skills agrees on what the page is. Each block exists because a specific failure appears when it is missing. Block names are the template's; keep them verbatim.

| Block | Why it exists | It is concrete when |
|---|---|---|
| THESIS | Without a stated idea the page defaults twice: to its category's rut and to the Awwwards register (dark, glow, blob, fade-ups). The block names the idea and both refusals | It names an object or a behaviour, plus the two defaults it refuses |
| WORLD | A world is recognisable with every word removed; type and colour chosen per section never add up to one | Colour strategy, token count, type contract and material policy are named |
| STORY | Sections stack; chapters argue. Beats (entrance · hold · exit), one interruption and the close are decided before markup | A model from `narrative-structures.md`, four to six beats, one interruption, one close |
| FIRST VIEWPORT | Jurors decide in three seconds and run the naming test on this screen alone | What is where, at what scale, where the primary action sits |
| SIGNATURE | One interaction carries the creativity score; it must enact the thesis and name its cost | Physical metaphor, at least two jobs it does, technique tier, behaviour on touch, keyboard and reduced motion, fallback |
| SCROLL MODEL | Smooth scroll is a decision with costs (restoration, find-in-page, keys), not a plugin: native + Lenis / sticky stages + invisible rails / virtual float / section switcher | One model and the reason this story needs it |
| LOAD & CLOSE | Loading and the last screen are authored on every winner; left to defaults they are the first and last thing a juror sees | The preloader's real load signal and repeat-visit rule; what the last screen is; the 404 |
| DIVERGENCE | The corpus is the taste; copying it fails the naming test. Three nearest cards, the principle taken from each, the literal move refused from each | Three `[site:slug]` entries with a take and a refuse line each |
| FINISH | Unreviewed and unshipped is unfinished; the block is the promise that a jury disposition and a ship report end the build | Present verbatim from the template |
| Seed | The `SEED` line `roll.mjs` printed, so the concept round can be re-dealt or audited | A key is recorded |

Accept a contract only when every "concrete when" column holds. A mood word in any block (premium, immersive, bold, cinematic) sends it back to `awards:concept`.

## Build discipline

Why: the build order keeps every layer honest against the one below it, and the DOM is the layer everything else must survive without.

- Build in this order: semantic skeleton → tokens → layout → media → motion → WebGL → transitions → preloader last. The preloader comes last because it needs a real load signal, and there is nothing to load before the media and GL exist.
- The DOM lays out, the canvas renders. Every string and image a canvas draws exists in the DOM first; the canvas is `aria-hidden` over it (`[pattern:accessibility-and-reduced-motion#the-dom-mirror]`).
- Content is authored at full fidelity from the first commit: real headings, real numbers with units, real alt text. Whatever is invented for the build is listed as synthetic under `## Brief`; never fabricate awards, press, testimonials or partner logos (`[pattern:copy-and-content#content-at-full-fidelity]`).
- One artefact per phase, committed at the boundary when the user chose commits, with the phase in the message.
- Recipes are adapted, never pasted: rename, re-token, re-time (`${CLAUDE_PLUGIN_ROOT}/recipes/README.md` lists the ids and the contract).
- Bounded verification: one capture round per pass, fixes batched, at most two rounds before the jury. Allocate a fresh timestamp-plus-stage `capture_out` for this pass as in `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md`; record the resulting manifest path and pass that exact directory onward. The commands are exact:
  - `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <dir|url> --out "$capture_out" --scroll 0,50,100 --reduced-motion` writes frames and `manifest.json` into that pass directory; allocate a separate fresh directory when adding `--no-webgl` for the fallback capture. Use `--states .awards/capture-states.json` for the signature interaction and keyboard/open states, following `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md`; retain the plan path for jury/ship recaptures.
  - `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <dir> --json` runs the whole floor; exit 2 means P0/P1 findings, each fixed or recorded under `## Exceptions` as `RULE — reason`.
- The PostToolUse hook runs the quick audit after every edit once `AWARDS.md` exists; treat its findings as the floor speaking, not as noise.

## Award calibration

Why: a build aimed at "great" lands at 6; a build aimed at the rubric's anchors lands where the corpus does. Read `${CLAUDE_PLUGIN_ROOT}/references/jury/rubric.md` before writing a calibration line into the brief.

- Four axes, weighted Design 40 · Usability 30 · Creativity 20 · Content 10 — the split printed on every entry page [verified, twenty Awwwards entries read 2026-09-18]. Site of the Day territory starts at a weighted 7.2 with no axis under 6.8; the twenty verified corpus entries run 7.28–8.18, median 7.67. This plugin's own jury scores about 0.7 below the award by design, so read `ship` as clearing our floor rather than as a prediction; `${CLAUDE_PLUGIN_ROOT}/references/jury/rubric.md` has the derivation.
- Developer criteria are scored separately: animation and interaction, performance, responsive, accessibility and semantics, code and markup. A Developer Award needs the average above 7, and one accompanied nearly every Site of the Day in the corpus.
- Where points are lost: usability first (the lowest axis on nineteen of twenty verified entries, range 7.00–7.90) [verified, twenty Awwwards entries read 2026-09-18], then load (a gate that always plays), then mobile (a shrunken desktop). Design rarely loses a winner the award; usability does.
- Creativity is the highest axis on concept-led winners (`[site:son-daven]` 8.15, `[site:oryzo]` 8.35) and it comes from the concept, not from the effect count. Effect inflation caps Creativity at 6.
- WebGL dosage is a budget choice, not a quality signal: `[site:the-line]` took Site of the Month DOM-first, `[site:igloo]` took Site of the Year at 100 % canvas, `[site:seasats]` reads as 3D with no runtime GL. Pick the lowest rung the thesis survives (`[pattern:webgl-architecture#dosage-ladder]`).
- Content caps at 6 with placeholder copy and adjectives; numbers with units, dual units and a conversion matched to the stakes move it (`[pattern:copy-and-content#numbers-not-adjectives]`).

Write one calibration line under `## Brief` after intake: the axis this build can win on, the axis it is most likely to lose on, and what the usability walk will check first.

### Acting on a jury report

Why: the report is an ordered fix list under a disposition; this skill routes it and never re-judges it.

- `recapture`: the evidence was invalid (a blank capture, a missing state). Read the unmeasured score line and any located source findings, allocate a fresh capture directory and rerun `capture.mjs` with the flags the report names, then phase 7 again. No visual score exists yet.
- `rebuild`: a contract block failed fidelity. Return to phase 1 when THESIS, WORLD, SIGNATURE or DIVERGENCE failed, to phase 3 when STORY or FIRST VIEWPORT failed; never patch around it.
- `fix`: phase 8 applies the ordered fixes in one batch. A fix classified conceptual (it changes a contract block) goes back to phase 1 instead of being applied.
- `ship`: phase 8 runs the proof pass only.
- The Keep line names what no fix may dilute; read it before routing anything.
- A measured score without a reason is not a jury round; run it again. A `recapture` report with unmeasured scores is a useful evidence diagnosis, but no visual verdict.

## Generalisation guardrails

Why: the corpus is evidence, not a kit. A page a juror can trace to its source scores a 6 on Creativity however polished it is, and a page a juror can trace to a generator scores the same.

- Draw every decision from at least three cards, never one. If only one card supports a move, the move is that site's signature and is refused.
- Never reuse a reference's section order, copy, palette hexes, type pairing or assets. The pattern files name what each card refuses in their Refuse sections; those lists are binding.
- The naming test runs in both directions on the first viewport alone (`${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md`): could a juror name the source site, and could a juror name the generator? Either "yes" restarts the concept, changing the archetype, the palette strategy or the signature, not the copy.
- The DIVERGENCE block is the record: three `[site:slug]` neighbours from `_index.md`, a principle taken and a literal move refused for each. A build with an empty DIVERGENCE block has not been grounded.
- Site cards are read for their §7 Principles and §8 Take / Don't take; §1–§4 are evidence, never instructions.
- A user's shorthand ("like Igloo", "the Lando site but for us") is a pointer to a card, not permission: answer it with the principle the card gives and the move it refuses.

## First-class paths

Why: none of the references documents these paths, so they are the cheapest way to beat the reference set on the axis it loses on. They are requirements of every phase, not a final sweep.

- Reduced motion in three tiers (full / reduced / static) from one switch; reduced keeps state changes and hierarchy, static shows the final frame; never a global animation kill (`[pattern:accessibility-and-reduced-motion#reduced-motion-tiers]`).
- A keyboard path for every gesture: hold, drag, draw, compare, rail, virtual scroll, intro click; every gate has a visible skip (`[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]`).
- A DOM mirror for everything a canvas draws, and `aria-hidden` on the canvas; the `--no-webgl` capture must read as a full page.
- Sound opt-in only, behind a focusable control that states its current value; content never waits for consent (`[pattern:sound#opt-in-only]`).
- Never a reload at a breakpoint; scenes rebuild on resize (`[pattern:responsive-strategy#never-reload-at-a-breakpoint]`).

## Working beside impeccable

Why: the two plugins share `DESIGN.md` and may be installed together; a build that fights over a file loses the file.

- `PRODUCT.md` is impeccable's and read-only here; `AWARDS.md` is this plugin's and the only place the direction contract lives.
- `DESIGN.md` uses the same frontmatter schema in both; `awards:system` writes it and either plugin may read it. When impeccable wrote one first, `awards:system` extends it rather than replacing it, and keeps its values identical to `tokens.css`.
- Critique and polish commands from the other plugin may run on the same files, but the awards build ends only with `awards:jury` and `awards:ship`.

## Finish

Why: the last message of a build is what the user acts on; it has to carry the jury's own words and the proof, not a summary of effort.

A build is finished only when all three hold:
1. The jury's disposition and immediately following score line are reported verbatim. Valid site evidence has four numeric axes, a weighted result, developer sub-scores and a quoted memory answer; missing evidence has `recapture` and `unmeasured` for all visual and developer scores, memory and visual fidelity. Component mode relays only D/U/C and their mean, numeric or all unmeasured as the report gives them.
2. `.awards/ship/<date>.md` exists and `## Ship log` has its line: audit summary, capture list, performance numbers, exceptions with reasons.
3. Every line of `## Status` is checked, including "WebGL layer built or explicitly declined" and "Jury disposition" with its value.

The final message, in this order:
- The disposition and adjacent score line, quoted from the jury report; developer results only when measured.
- The memory-test answer and specificity verdict when rendered evidence supports them; otherwise the missing evidence and located source findings.
- The paths: `AWARDS.md`, `DESIGN.md`, the jury report, the ship report, the recorded captures directory and manifest.
- Fixes the jury listed that ship did not resolve, with the reason.
- What the sandbox could not prove and a real device must: frame rate on a phone, wide-gamut colour, sound, a slow network.

## Verify

- [ ] `AWARDS.md` exists, follows the template's section order, and every direction-contract block passes its "concrete when" test; no mood words.
- [ ] DIVERGENCE names three real `[site:slug]` entries with a take and a refuse line each; the naming test was run in both directions on the first viewport.
- [ ] Each phase's exit artefact exists on disk and was read, not just reported: contract, `DESIGN.md` + `tokens.css`, page map + skeleton + 404, boot, motion score, GL layer or an explicit decline.
- [ ] The jury ran forked (its report reads captures first and inventories the first viewport in its own words); the disposition is quoted verbatim in the final message.
- [ ] The ship report exists; the audit is clean or every remaining finding has an `## Exceptions` line with a reason.
- [ ] The memory-test answer is an object or a behaviour, recorded in the jury log.
- [ ] Reduced motion, keyboard, DOM mirror and sound opt-in were verified from captures (`desktop-rm-s00`, `--no-webgl`) and a keyboard walk, not assumed.
- [ ] `## Status` is fully checked; no phase was skipped silently; at most two jury rounds unless the user asked for more.

## Hand-off

Every phase hands off to the next skill in the table above with the brief and the `AWARDS.md` path; jury also receives the exact recorded captures directory and manifest path. Single elements go to `awards:component` at any time; a critique goes to `awards:jury`; a new reference site goes to `awards:research`, whose card feeds the next `awards:concept` round. When the user wants only part of the loop, run that phase and stop after ticking its Status line.

## Refuse

- Writing page code before the direction contract is locked, or choosing the stack before the concept: both throw work away.
- Fade-and-rise on every section, parallax on everything, bounce or elastic easing by reflex: motion as wallpaper.
- Hero-metric rows, identical feature-card grids, eyebrows, numbered markers by habit, the hero → logos → features → testimonials → pricing order: the template a juror recognises first.
- "Get started", "Learn more", "Discover" as actions: a conversion that names no outcome.
- Inter, Space Grotesk, DM Sans, Manrope, Geist or a system face as the display voice: the generator's signature.
- Dark + neon + glow, gradient text, glass by default, a blob or particle hero: the Awwwards default, refused in THESIS.
- A blocking preloader with no concept, or one that plays in full on every visit: the load gate that costs usability.
- WebGL because it is expected: every rung of dosage costs a pipeline, a tier system and a mirror; take it only when a beat needs depth.
- A global `animation: none` as the reduced-motion path; hover-only or drag-only affordances; canvas text with no DOM mirror.
- Silently skipping the jury, softening its disposition, or shipping with the audit red and no exception recorded.
- Reusing a reference's section order, copy, hexes, pairing or assets, whatever the user's shorthand seems to ask for; the corpus gives principles, the DIVERGENCE block records the refusals.
