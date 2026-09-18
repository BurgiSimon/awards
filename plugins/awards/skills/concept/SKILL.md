---
name: concept
description: "Find the concept for an award-worthy site or component before any code: the one idea the page owns, its narrative or scroll story, the signature interaction and a committed visual world, grounded in 19 analysed award-winning sites and deliberately diverging from them. Use whenever the user asks for ideas, creative direction, a concept or 'big idea', storytelling or scrollytelling structure for a product story, 'how would an award-winning studio approach this', 'what would make this site win', 'would this win', or when a build request arrives with no direction yet. Deals three directions plus a conventional exit with a seeded roll, lets the user lock one in a single question, and writes the AWARDS.md direction contract. Never copies a reference site. Not for copywriting alone, dashboards, admin tools or feature work with no award framing."
argument-hint: "[subject or brief] [--mode persuade|experience|read] [--reroll] [--component]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:concept — the direction contract

This skill produces the one artefact every later phase depends on: a direction contract in `AWARDS.md` whose blocks are concrete enough to build from and specific enough that no juror can trace the page to a reference site. It reads the corpus, diverges from it, deals candidate worlds with a seeded roll, lets the user lock one, and writes the contract.

## Why concept first

Why: Creativity is the highest axis on the concept-led winners in the corpus (`[site:son-daven]` 8.15, `[site:oryzo]` 8.35, `[site:trevor-noah]` 7.78) and it is the one axis effects cannot move; every card makes a single idea do the work a feature list usually does. A concept round is the most expensive thing to skip and the cheapest thing to redo.

- The output is a contract, not a mood board: an object or a behaviour, a story with beats, one signature, one world.
- The memory test is the acceptance test: what a visitor describes an hour later. A mood cannot be described; a coaster launched like a frontier model can.
- The concept must survive with the canvas turned off. WebGL is a dosage the contract chooses, never the idea itself.

## Setup

Why: the durable files are the memory of the build; a skill that starts without them re-asks what is already decided and drifts from the contract.

1. Read `AWARDS.md` in the project root if it exists and resume from its `## Status` checklist; treat every locked block as decided.
2. Read `DESIGN.md` in the project root if it exists; its tokens are the visual system and are not re-invented here.
3. If impeccable's `PRODUCT.md` exists, read it for product truth (audience, purpose, voice, constraints) and never overwrite it.
4. Detect the scope: a whole site, one component (a named element, file or selector), or a critique of existing work.
5. Detect the stack from `package.json` and framework files (`vite.config.*`, `next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, a Webflow export); note the motion and GL libraries already installed.
6. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once — it drives every phase in order — then proceed with this skill if the user declines.

## Read before you deal

Why: this is the heaviest reading phase of the plugin; the corpus is the taste, and a direction dealt without it is the model's default wearing a new name.

- `${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md` first: the table and its neighbour-picking rules. Project-local cards in `.awards/sites/` (written by `awards:research`) count as neighbours too.
- The three nearest cards in `${CLAUDE_PLUGIN_ROOT}/references/sites/<slug>.md`, sections §7 Principles and §8 Take / Don't take only; §1–§4 are evidence, never a plan.
- `${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md` before naming the two ruts, and again before the naming test at the end.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/narrative-structures.md` before writing STORY.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/hero-archetypes.md` before writing FIRST VIEWPORT.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/copy-and-content.md` before writing the thesis sentence and the conversion.
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/AWARDS.md` for the exact block names and order of `## Direction contract` and the columns of `## Page map`.

## Inputs

Why: a concept is derived from the mechanism, the audience's scene and the stakes; everything else is downstream.

- With `AWARDS.md`: read `## Brief` and use it as given. `--mode persuade|experience|read` overrides the visitor mode for this round and is written back to the brief.
- Without it: ask two questions in one AskUserQuestion round. First, what only this subject can prove and who reads it, where (the physical scene). Second, the stakes and conversion, and the assets on hand (photo, video, 3D, copy, none). Assert your reading of the rest so the user edits rather than composes; never ask about fonts, colours or effects.
- `--component`: skip to the mini contract at the end; no deal is run for a single element unless the user asked for options.

## Step 1 — the mechanism, the scene and the two ruts

Why: a page defaults twice when nobody names the defaults: to what its category always ships, and to the register every generator reaches for when asked for "award-winning".

Write four lines in your working notes before any idea:
- Mechanism: the one thing only this subject can prove (a range, a process, a place, a person's plurality).
- Scene: where the audience is when they read this, on what device, with how much attention.
- Category rut: what every model ships for this class, from the category table in `anti-patterns.md` (a portfolio's card grid, a B2B page's metric row and feature triad, a luxury page's serif over a full-bleed photo).
- Awwwards rut: near-black ground, one neon accent with glow, an oversized grotesque, a blob or particle field behind it, sections that fade and rise, a logo marquee, a cursor trail.

The thesis must refuse both by name; a thesis that only refuses one lands in the other.

## Step 2 — corpus neighbours and the DIVERGENCE block

Why: three cards give a principle; one card gives a signature, and a signature is exactly what may not be taken.

1. Pick the three nearest cards in the index's order of matching: class first, then visitor mode, then the WebGL dosage the budget affords, then the scroll model. Widen by mode when fewer than three fit; never fill a slot with an unrelated card.
2. Read their §7 and §8. For each card write one principle taken (a rule that would hold for any site) and one literal move refused (the device, object, colour set, order or line that is that site's own).
3. Note what all three share (masked reveals, a designed footer, numbers as copy): shared moves are the genre's craft and may be used. Anything only one card does is its signature and is refused.
4. This becomes the DIVERGENCE block, verbatim in shape: three `[site:slug]` entries, each with a take and a refuse line.

## Step 3 — seven candidate worlds

Why: the first three ideas any model produces are the ruts in different clothes; the seventh is where the audience's own culture starts to show.

- Derive seven worlds from the audience's culture, not from web design: the places, objects, paperwork, tools, rituals and graphic traditions the audience actually handles. Graphic traditions count (a call sheet, a timetable, a specimen sheet, a nautical chart, a model card).
- Cover at least three material families across the seven (for example paper and print, metal and machine, glass and ice, textile, screen and console, botanical, stone and architecture).
- Write each world as one line: name · material · the object or behaviour it hands the page. A world with no object or behaviour is a mood and is replaced.
- Number them 1–7 and keep the list in your notes; only the winner and the seed reach `AWARDS.md`.

## Step 4 — the deal

Why: a scripted deal stops the round from converging on the presenter's favourite, and the seed makes the round auditable and repeatable in a later session.

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --deal 3 --of 7`. It prints `SEED <key>`, `DEALT a b c of 7` and `LEAD a`. Record the `SEED` line; it goes into the contract's `Seed` field.

Write the three dealt worlds as full cards of equal weight, lead first. Each card carries, in this order:
- Thesis: the object or behaviour and the two ruts it refuses.
- World: colour strategy, temperature, light or dark and why, the character of the type voice, the material policy (names, not hexes or faces; `awards:system` chooses those).
- First viewport: the composition in one sentence, with the primary action's position.
- Signature interaction and its technique tier: DOM-only · moments · canvas-first · 100 % canvas (the rungs of `[pattern:webgl-architecture#dosage-ladder]`).
- Scroll model: native + Lenis / sticky stages + invisible rails / virtual float / section switcher.
- Honest risk: what this direction costs in build time, assets, usability or budget.
- Nearest card and the difference: the `[site:slug]` a juror might think of, and the move that keeps this from being it.

Then add two more options and present everything in one AskUserQuestion round:
- Your own pick: one of the three, or a fourth from the undealt pool when the deal missed the strongest world, labelled as your pick with one sentence of reason.
- The conventional exit: the competent, conventional site for this category, described honestly with its ceiling (Design around 7, Creativity around 6) and its advantages (speed, safety, no pipeline).

Options in the question: each dealt card by name, your pick when it differs, the conventional exit, and "re-roll". One round; the answer locks the direction. Rewriting a card after the answer to "improve" it is a second round in disguise and is not done.

### Re-roll registers

Why: a user who declines all three is telling you something about register, not asking for three more of the same.

- Plain: `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --deal 3 --of 7 --seed <key> --reroll 1` deals a different three from the same seven; increment `--reroll` on each further call, keep the seed.
- Safer: run the plain re-roll, then write each dealt card one technique tier down and one step closer to the category's conventions; the conventional exit stays on the table.
- Bolder: run the plain re-roll, then write each card one tier up and further from the conventions, with the risk line honest about assets and budget.
- At most two re-rolls per round; after that, propose the strongest world seen so far beside the exit and ask once more.
- The `--reroll` argument reopens a locked round: read `Seed` from `AWARDS.md`, run with the next `--reroll` number, and present as above.

## Step 5 — the story

Why: sections stack, chapters argue. The narrative model decides the beats, the one interruption and the close before any markup exists, and it decides them from the class, the mode and the assets, never from the WebGL budget.

- Choose one model with `[pattern:narrative-structures#choosing-a-model]`: chaptered journey, faceted world, manifesto with gates, single-object launch, collage index, gallery, print artefact, specification.
- Write four to six chapters (or the routes of a faceted world, the 404 included), each as entrance · hold · exit. The hold is where something reads; a chapter with nothing to read is cut.
- Rule of three inside a hold: three support points at most.
- Exactly one interruption, after the first content beat, from `[pattern:narrative-structures#the-interruption]`, with a keyboard equivalent and a skip.
- The close from `[pattern:narrative-structures#the-close]`: a designed footer, a 404 in the same world, a conversion matched to the stakes (`[pattern:copy-and-content#conversion-matched-to-stakes]`).
- One or two copy registers, switched only at a chapter boundary; on a big-ticket subject the numbers sit in the second half (`[pattern:narrative-structures#emotion-before-economics]`).
- Read mode wins over spectacle: a changelog or a docs page keeps its index on screen one and stays scannable under every effect.

## Step 6 — the signature

Why: one interaction carries the creativity score, and it does so only when it enacts the thesis rather than decorating it.

- One physical metaphor doing at least two jobs: the photograph whose corner lifts is memory, collage and the whole justification for having a third dimension `[site:trevor-noah]`; the shipment that crosses the page is the service, the chapter transition and the wayfinding `[site:united-carriers]`. Name the jobs.
- Parameters in numbers where the pattern files give them (travel, duration, easing, damping, snap); "smooth" is not a parameter.
- Behaviour on touch (the coarse-pointer swap), on the keyboard (the key path and the skip), under reduced motion (the tier: a cut, a settled frame, a static state that still shows both sides).
- Cost tier and what it buys: a DOM-only signature costs a day; canvas-first costs an asset pipeline, a tier system and a DOM mirror; 100 % canvas costs all of that plus the mirror of the whole page.
- The fallback: what the page shows with no GL and on the low tier.
- One signature per page. Every other move is craft and stays quiet (`${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md`, effect inflation).

## Step 7 — the remaining blocks

Why: the contract is only usable when the first screen, the world, the scroll model and the load and close are decided at the same resolution as the story.

- FIRST VIEWPORT: choose one archetype from `[pattern:hero-archetypes#choosing]` by model and dosage, then write the exact composition: what is where, at what scale, where the primary action sits, what moves once and for how long. Run the six checks in `[pattern:hero-archetypes#the-first-viewport-test]` on it, including the phone version.
- WORLD: the colour strategy by name (`[pattern:color-and-material#colour-strategies]`), the token count, light or dark and the reason the scene forces it, the type contract type and the character class of the display voice, the material policy. Faces and hexes belong to `awards:system`; the world must be recognisable with every word removed.
- SCROLL MODEL: one of the four with the reason this story needs it; native + Lenis is the default, a virtual float only when the story must gate or hold, a section switcher only for a short loop.
- LOAD & CLOSE: the preloader archetype and its real load signal (`[pattern:preloaders-and-transitions#the-load-contract]`), the repeat-visit rule, what the last screen is, that the 404 ships with the first release.
- FINISH: the template's line, verbatim.

## Step 8 — write the contract

Why: the block names are read by every other skill, the hook and the evals; a paraphrased name is an invisible block.

1. Open `AWARDS.md` (create it from `${CLAUDE_PLUGIN_ROOT}/assets/templates/AWARDS.md` when absent) and write `## Direction contract` with the blocks in the template's order and exact names: THESIS, WORLD, STORY, FIRST VIEWPORT, SIGNATURE, SCROLL MODEL, LOAD & CLOSE, DIVERGENCE, FINISH, Seed.
2. Write the `## Page map` skeleton: one row per chapter or route with `#`, `Chapter / route` and `Beat (entrance · hold · exit)` filled from STORY; leave `Components (recipe ids)` and `Notes` for `awards:structure`. A faceted world lists every route, the 404 included.
3. Tick "Direction contract locked (concept)" in `## Status`. Touch no other section.
4. Keep the seven worlds and the dealt cards in the reply, not in the file; the file carries the decision and the seed.

### `--component`: the mini contract

Why: a component inside an established world inherits that world; it needs a decision, not a new identity exercise.

Return six lines in the reply, and write nothing to `AWARDS.md` unless the component is a new chapter row in an existing page map:
1. Job: what the component does in the story, in one sentence.
2. Signature move: the one physical metaphor and the jobs it does.
3. Material tier: DOM-only, moments, or canvas-first, with the cost.
4. States: hover, focus-visible, active, disabled, loading, empty, long text.
5. Accessibility: the keyboard path, the coarse-pointer swap, the reduced-motion tier, the DOM mirror if a canvas is involved.
6. Cost: build time, assets, dependencies, and what the fallback shows.

When the user wants options for a component, run Steps 3 and 4 with three worlds instead of seven (`--deal 2 --of 3`) and present the deal the same way.

## Verify

- [ ] The memory-test answer for the locked direction is an object or a behaviour, written in one sentence with no mood word.
- [ ] The naming test passes in both directions on the first viewport: no juror could name the source site, none could name the generator.
- [ ] Every block is concrete: THESIS refuses both ruts by name; STORY has a model, four to six beats, one interruption and a close; SIGNATURE names its jobs, tier, touch, keyboard, reduced-motion and fallback lines; FIRST VIEWPORT is a composition; WORLD names a strategy and a contract type; SCROLL MODEL gives a reason; LOAD & CLOSE names a real signal.
- [ ] The honest risk is stated for every dealt card and for the winner.
- [ ] The concept survives with WebGL removed; the page still argues the thesis in the DOM.
- [ ] DIVERGENCE names three real `[site:slug]` entries from the index or `.awards/sites/`, each with a take and a refuse line; no card's signature, section order, copy, hexes or pairing appears anywhere in the contract.
- [ ] `roll.mjs` was actually run; the `SEED` line is in the `Seed` field; re-rolls used the same seed.
- [ ] The conventional exit was offered and its ceiling stated; the user locked the direction in one round.
- [ ] The visitor mode (from the brief or `--mode`) is honoured: no gate before content in persuade, a rail out in experience, the index on screen one in read.
- [ ] `## Status` shows "Direction contract locked (concept)" ticked and nothing else changed.

## Hand-off

The next phase belongs to `awards:system`, which needs the WORLD block and the brief. When the user asked for the whole site or `awards:craft` is driving the build: Invoke the `awards:system` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the user asked only for ideas or a direction, stop after writing the contract and offer that next step in one line. A `--component` run hands its six lines back to `awards:component`.

## Refuse

- Mood adjectives as concepts (premium, immersive, bold, cinematic, clean): they fail the memory test by definition.
- Effect as concept ("a WebGL hero with distortion", "particles that react to the cursor"): an effect is a technique tier, and a technique is not an idea.
- The category rut and the Awwwards rut, however the user phrases the request; both are named in THESIS as refusals.
- Any card's signature, section order, copy, palette, type pairing or asset, including when the user asks for "something like" a named site; the card's principle is offered instead.
- A direction that needs assets the user cannot supply (a commissioned object per variant, drone footage, a full bake pipeline) unless the brief labels them synthetic and they can be authored for the build.
- A deal without the script, three variants of one idea presented as three worlds, a fourth or fifth option beyond your pick and the exit, more than two re-rolls, a second question round.
- A gate in front of the content, two interruptions, two signatures, or a scroll model chosen for spectacle rather than for the story.
- Faces, hexes or effect parameters written into WORLD: that is `awards:system` and `awards:motion` work, done with the reference files they own.
