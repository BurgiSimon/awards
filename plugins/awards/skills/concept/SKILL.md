---
name: concept
description: "Find the concept for an award-worthy site or component before any code: the one idea the page owns, its scroll story, the signature interaction and a committed visual world, diverging from a corpus of analysed award winners. Use when the user asks for ideas, creative direction, a 'big idea', storytelling or scrollytelling, 'how would an award-winning studio approach this', 'what would make this site win', or when a build has no direction yet. Deals three directions and a conventional exit with a seeded roll, locks one in a single question and writes the AWARDS.md contract. Never copies a reference site. Not for copywriting alone, dashboards or feature work."
argument-hint: "[subject or brief] [--mode persuade|experience|read] [--reroll] [--component] [--no-found-pictures]"
effort: high
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:concept — the direction contract

Codex: read [the runtime guidance](../../references/codex.md) before following this skill; it maps plugin paths, tool names and handoffs to Codex.

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
6. When the request is a whole site to build and no `AWARDS.md` exists yet, the brief has not been captured: Invoke the `awards:craft` skill now with the Skill tool, passing the request; it captures the brief and hands back here; do not do its work inline. When the user asked only for directions, continue here.

## Read before you deal

Why: this is the heaviest reading phase of the plugin; the corpus is the taste, and a direction dealt without it is the model's default wearing a new name.

- `${CLAUDE_PLUGIN_ROOT}/references/sites/_index.md` first: the table and its neighbour-picking rules. Project-local cards in `.awards/sites/` (written by `awards:research`) count as neighbours too.
- The three nearest cards in `${CLAUDE_PLUGIN_ROOT}/references/sites/<slug>.md`, sections §7 Principles and §8 Take / Don't take only; §1–§4 are evidence, never a plan.
- Each of those cards' composition skeleton, `${CLAUDE_PLUGIN_ROOT}/references/sites/skeletons/<slug>.png` (block maps of where headings, text and media sit at the top, middle and close, and on a phone), and its row in `_fingerprints.md`. This is the visual bar the deal has to clear: a dealt FIRST VIEWPORT that reproduces a neighbour's block map is that neighbour, whatever its colours.
- `${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md` before naming the four ruts, and again before the naming test at the end.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/house-tells.md` before the four ruts: the latest wave is the plugin rut, the shapes this plugin's own builds keep converging on.
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --list engines` before the seven worlds: the engines are the kinds of idea a world can rest on (`scripts/data/engines.json`, with the cards that run each).
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/negative-exemplars.md` and its six frames in `negative/`: the house style, the template product page and the clean, forgettable page. No dealt card may reduce to one of them with new colours.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/narrative-structures.md` before writing STORY.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/hero-archetypes.md` before writing FIRST VIEWPORT.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/visual-composition.md`: for a read-heavy brief open the typography and editorial frames; for a product brief open hero and specifications. For an editorial/product/material-led complete page, also open the complete composition’s opening, middle and close frames. Select only fitting examples. Record one principle and what changes for this subject. These fictional examples do not replace the three real site-card DIVERGENCE entries.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/copy-and-content.md` before writing the thesis sentence and the conversion.
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/AWARDS.md` for the exact block names and order of `## Direction contract` and the columns of `## Page map`.

## Inputs

Why: a concept is derived from the mechanism, the audience's scene and the stakes; everything else is downstream.

- With `AWARDS.md`: read `## Brief` and use it as given. `--mode persuade|experience|read` overrides the visitor mode for this round and is written back to the brief.
- Without it: ask two questions in one AskUserQuestion round. First, what only this subject can prove and who reads it, where (the physical scene). Second, the stakes and conversion, and the assets on hand (photo, video, 3D, copy, none). Assert your reading of the rest so the user edits rather than composes; never ask about fonts, colours or effects.
- `--component`: skip to the mini contract at the end; no deal is run for a single element unless the user asked for options.

## Step 1 — the inventory, the scene and the four ruts

Why: a page defaults four times when nobody names the defaults: to what its category always ships, to the register every generator reaches for when asked for "award-winning", to the layout every template ships under both, and to what this plugin's own last builds did. The cure for all four starts from what belongs to this client and no one else.

**The inventory.** Before any idea, list eight to twelve things that belong to this client and to no competitor, and write them on the `Inventory` line of `## Brief`, separated by semicolons (the one Brief line this skill writes; keep what craft already put there). Look for:
- the name and what it means; the address, the street, the door and what that place looks like (its signs, tiles, light and weather);
- the numbers in the brief (seats, rooms, minutes to the sea, the price, the year, the batch size);
- the one constraint it lives with (one batch a month, closed in winter, by appointment only);
- its materials and colours, its rituals and hours (the oven lit at five, the ferry at seven);
- the printed and made things of its world (a timetable, a label, a ticket, a logbook) and its people.

An item a competitor could also claim ("hand-made", "quality", "the sea") is replaced. The inventory is also the picture search list for WORLD's imagery (`assets.mjs search`), unless found pictures are off.

Then write seven lines in your working notes:
- Mechanism: the inventory item only this subject can prove (a range, a process, a place, a person's plurality).
- Scene: where the audience is when they read this, on what device, with how much attention.
- Category rut, as it would look for this subject: what every model ships for this class, from the category table in `anti-patterns.md` (a portfolio's card grid, a B2B page's metric row and feature triad, a luxury page's serif over a full-bleed photo), drawn for this client.
- Awwwards rut, as it would look for this subject: near-black ground, one neon accent with glow, an oversized grotesque, a blob or particle field behind it, sections that fade and rise, a logo marquee, a cursor trail — in this subject's own costume (a salt works' crystal particles, a cable ship's marine snow).
- Template rut: wordmark left with links right; a label over a two-line headline at bottom left; a subline; a filled plus outline button pair. Costume over this skeleton is still the template.
- Plugin rut: the devices of the latest wave in `house-tells.md` this subject would pull towards (the page as an object, the scroll as a process with a readout in the margin, code-only imagery, a light restrained duotone). A contract may keep one, with its "earned when" written into THESIS; two or more send the direction back.
- First idea: the concept that came to mind first. It enters the seven worlds only if it passes the competitor test below; otherwise THESIS refuses it by name.

The thesis must refuse all four ruts by name, each written for this subject; a thesis that refuses one lands in another, and a refusal copied from the template refuses nothing.

**The competitor test.** Put the nearest real competitor's name into a thesis or a world in place of this client's (the bakery two streets away, another oak furniture maker, another hut on the same mountain). If the sentence still works, the idea belongs to the category: a loaf of bread is every bakery; the seven doors of the street this one is named after are only this one. Run it on every world in Step 3 and on the locked THESIS, and write the competitor's name and why the thesis breaks for it into the contract.

## Step 2 — corpus neighbours and the DIVERGENCE block

Why: three cards give a principle; one card gives a signature, and a signature is exactly what may not be taken.

0a. When `Mode:` in `## Budgets & tiers` reads `redesign`, read the baseline report in `.awards/jury/` (the one marked `baseline`): its Keep line survives into the contract, and at least two of its named faults become THESIS refusals, worded as what the new site does instead.
0. When `## Brief` lists references the user likes, each needs a card first: a corpus card when its slug exists, otherwise Invoke the `awards:research` skill now with the Skill tool for that URL (two at most), then continue here. A user reference may fill one DIVERGENCE slot, never more, with the same take and refuse lines as any card: liking a site is a reason to learn its principle, never to copy its signature.
1. Pick the three nearest cards in the index's order of matching: class first, then visitor mode, then the WebGL dosage the budget affords, then the scroll model. Widen by mode when fewer than three fit; never fill a slot with an unrelated card.
2. Read their §7 and §8. For each card write one principle taken (a rule that would hold for any site) and one literal move refused (the device, object, colour set, order or line that is that site's own). At least one take is compositional, typographic or structural, not technique; when a card's §8 has none, take it from §7.
3. Note what all three share (masked reveals, a designed footer, numbers as copy): shared moves are the genre's craft and may be used. Anything only one card does is its signature and is refused.
4. This becomes the DIVERGENCE block, verbatim in shape: three `[site:slug]` entries, each with a take and a refuse line (a `[clone:slug]` card is a technique reference, never one of the three).

## Step 3 — seven candidate worlds

Why: the first three ideas any model produces are the ruts in different clothes; the seventh is where the client's own world starts to show. The seven are still one model's ideas, so two outside forces go in before they are written: an engine for each world, so they are seven kinds of idea, and two stimuli from outside any category, so two of them start somewhere the model would not go.

1. Deal the stimuli first: `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --stimulus 2`. It prints `SEED <key>` and `STIMULI a b`; keep the seed, the deal in Step 4 uses it.
2. Derive the seven worlds from the inventory first and the audience's culture second, never from web design: the places, objects, paperwork, tools, rituals and graphic traditions this client and its audience actually handle. At least four of the seven are built on an inventory item. Graphic traditions count (a call sheet, a timetable, a specimen sheet, a nautical chart, a model card), when they are this client's own.
3. Worlds 6 and 7 each fuse one dealt stimulus with one inventory item: what does this subject look like if it behaves like a seed packet, a tide table, a darts scoreboard? A stimulus is a provocation, never a theme to decorate with.
4. Tag every world with one engine from `roll.mjs --list engines`. The seven span at least four engines; two worlds on one engine are one idea in two outfits. The engines the latest wave of `house-tells.md` lists as spent are written down for `--avoid`.
5. Cover at least three material families across the seven (for example paper and print, metal and machine, glass and ice, textile, screen and console, botanical, stone and architecture).
6. Write each world as one line: name · engine · inventory item (or stimulus + item) · material · the object or behaviour it hands the page. A world with no object or behaviour is a mood and is replaced; a world that passes the competitor test for the nearest competitor is the category and is replaced.
7. Number them 1–7 and keep the list in your notes; only the winner, the seed, the engines and the stimuli reach `AWARDS.md`.

## Step 4 — the deal

Why: a scripted deal stops the round from converging on the presenter's favourite, and the seed makes the round auditable and repeatable in a later session.

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --deal 3 --of 7 --seed <key from Step 3> --engines <engine of world 1>,…,<engine of world 7> --avoid <spent engines>`. It prints `SEED <key>`, `DEALT a b c of 7`, `LEAD x` and `ENGINES …`: the three dealt worlds come from three different engines when the tags allow, engines in `--avoid` only when nothing else is left, and the lead is a seeded pick among the three, not the lowest index. A `NOTE` that the worlds span fewer than four engines means Step 3 was not done; rewrite the worlds and roll again with the same seed. Record one Seed line for the contract: `SEED <key> · DEALT a b c · ENGINES … · STIMULI …`; once the answer in Step 5 locks a direction, end it with `· ENGINE <that direction's engine>` (`· ENGINE exit` for the conventional exit), the one value the house ledger counts.

Write the three dealt worlds as full cards of equal weight, in `DEALT` order, the lead marked. Each card carries, in this order:
- Engine and source: the engine, and the inventory item (or the stimulus and the item) the world is built on.
- Thesis: the object or behaviour and the four ruts it refuses, each as it would look for this subject.
- Competitor test: the nearest real competitor's name in the thesis, and why the thesis no longer works for it.
- World: colour strategy, temperature, light or dark and why, the character of the type voice, the material policy, and the imagery strategy with what supplies it (names, not hexes or faces; `awards:system` chooses those; `${CLAUDE_PLUGIN_ROOT}/references/patterns/imagery-and-assets.md` lists the strategies, and "none, flat grounds" is not one). With no assets on hand, the card names what the open collections hold of the subject's world (a query from the inventory) before it settles on made imagery; with found pictures off, it says so instead.
- First viewport: the composition in one sentence; copy placement, nav form and action form come from the world.
- Signature interaction and its technique tier: DOM-only · moments · canvas-first · 100 % canvas (the rungs of `[pattern:webgl-architecture#dosage-ladder]`).
- Scroll model: native + Lenis / sticky stages + invisible rails / virtual float / section switcher.
- Honest risk: what this direction costs in build time, assets, usability or budget.
- Nearest card and the difference: the `[site:slug]` a juror might think of, and the move that keeps this from being it.

Then add your pick and the exit, and present everything in one AskUserQuestion round:
- Your own pick: one of the three, labelled as your pick with one sentence of reason. A deal that missed the strongest world goes to the plain re-roll, never to an undealt world.
- The conventional exit: the competent, conventional site for this category, described honestly with its ceiling (Design around 7, Creativity around 6) and its advantages (speed, safety, no pipeline).

Options in the question: the three dealt cards by name with your pick marked, and the conventional exit. That is four, the most the question takes; a re-roll is the free-text answer every question offers, so end the question text with "or answer re-roll (plain, safer or bolder)". One round; the answer locks the direction. Rewriting a card after the answer to "improve" it is a second round in disguise and is not done. Unattended, with no user to answer, lock your pick among the dealt three and state why in one sentence in the reply.

### Re-roll registers

Why: a user who declines all three is telling you something about register, not asking for three more of the same.

- Plain: `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --deal 3 --of 7 --seed <key> --reroll 1 --engines <the same seven tags> --avoid <the same>` deals a different three from the same seven; increment `--reroll` on each further call, keep the seed and the tags.
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
- One signature per page. Every other move is craft and stays quiet in motion, not in layout: composition still changes from chapter to chapter (`${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md`, effect inflation).

## Step 7 — the remaining blocks

Why: the contract is only usable when the first screen, the world, the scroll model and the load and close are decided at the same resolution as the story.

- FIRST VIEWPORT: choose one archetype from `[pattern:hero-archetypes#choosing]` by model and dosage; when two or more fit, deal it with `roll.mjs --choose <the fitting archetypes> --label archetype --seed <key>` rather than taking the first that comes to mind. Then write the exact composition from the archetype's blueprint, saying where and why it departs: what is where, at what scale, where the primary action sits, what moves once and for how long. Derive the copy block's placement, the nav's form and the action's form from WORLD (a timetable's columns, a stamp, a dial), never from the template skeleton. Run the six checks in `[pattern:hero-archetypes#the-first-viewport-test]` on it, including the phone version.
- WORLD: the colour strategy by name (`[pattern:color-and-material#colour-strategies]`), the token count, light or dark and the reason the scene forces it, the type contract type and the character class of the display voice, the material policy. Faces and hexes belong to `awards:system`; the world must be recognisable with every word removed.
  - The colour strategy is dealt, not defaulted. List the strategies this world allows (at least two unless the brand fixes one, and then say so), and run `node "${CLAUDE_PLUGIN_ROOT}/scripts/roll.mjs" --choose <allowed,…> --label colour --seed <key> --avoid <the strategy the latest house-tells wave lists>`. Write the `CHOSEN` strategy and one sentence on why it fits; taking the avoided strategy anyway needs the scene's reason in WORLD. Restrained duotone is the corpus mode (21 cards), so it is never the strategy by default.
  - The imagery strategy follows `[pattern:imagery-and-assets#choosing-one]`: the client's own pictures first; with none, real pictures of the subject's world from the open collections, searched from the inventory (`assets.mjs search`); made imagery (drawn, procedural, CSS-built, type) only for what no honest picture shows, and then with three levels of detail. Code-only imagery while an honest found picture exists is the plugin rut, not a choice.
  - Found pictures off: when `## Budgets & tiers` says `Found pictures: off`, or this run got `--no-found-pictures` (write that line first, with the reason), skip the search. Take the client's own pictures first, then the made strategies in their order, and write `found pictures off (<the reason>)` in WORLD in place of what the search found. Made imagery keeps its three levels of detail, and the colour deal still avoids the house strategy: code-only imagery on a light restrained duotone is still the house shape.
- SCROLL MODEL: one of the four with the reason this story needs it; native + Lenis is the default, a virtual float only when the story must gate or hold, a section switcher only for a short loop.
- LOAD & CLOSE: the preloader archetype and its real load signal (`[pattern:preloaders-and-transitions#the-load-contract]`), the repeat-visit rule, what the last screen is, that the 404 ships with the first release.
- FINISH: the template's line, verbatim.

## Step 8 — write the contract

Why: the block names are read by every other skill, the hook and the evals; a paraphrased name is an invisible block.

1. Open `AWARDS.md` (create it from `${CLAUDE_PLUGIN_ROOT}/assets/templates/AWARDS.md` when absent) and write `## Direction contract` with the blocks in the template's order and exact names: THESIS, WORLD, STORY, FIRST VIEWPORT, SIGNATURE, SCROLL MODEL, LOAD & CLOSE, DIVERGENCE, FINISH, Seed.
2. Write the `## Page map` skeleton: one row per chapter or route with `#`, `Chapter / route` and `Beat (entrance · hold · exit)` filled from STORY; leave `Layout`, `Components (recipe id: keep · change · pair)` and `Notes` for `awards:structure`. A faceted world lists every route, the 404 included.
3. THESIS ends with the competitor line: `Competitor test: <nearest competitor> — <why the thesis breaks for it>`. The Seed field carries the whole Seed line from Step 4 with the locked engine (`SEED … · DEALT … · ENGINES … · STIMULI … · ENGINE …`).
4. When the project or the plugin's repository holds earlier builds, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/house-ledger.mjs" <earlier build dirs…> --against AWARDS.md`; exit 2 (two or more spent features shared) sends the direction back unless THESIS already names each with the reason this subject earns it. With found pictures off, it does not count code-only imagery and says so.
5. Tick "Direction contract locked (concept)" in `## Status`. Touch no other section, except the `Inventory` line of `## Brief` written in Step 1 and the `Found pictures:` line when this run got `--no-found-pictures`.
6. Keep the seven worlds and the dealt cards in the reply, not in the file; the file carries the decision, the seed, the engines and the stimuli.

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
- [ ] The inventory on the `Inventory` line has eight to twelve items no competitor could claim; THESIS is built on one of them and carries its competitor line.
- [ ] The seven worlds spanned at least four engines, at least four were built on inventory items, worlds 6 and 7 fused a dealt stimulus; the dealt three come from three engines, or the NOTE says why not.
- [ ] The plugin rut was named from the latest `house-tells.md` wave, and the contract keeps at most one of its devices, with the reason.
- [ ] Every block is concrete: THESIS refuses all four ruts by name, each written for this subject; STORY has a model, four to six beats, one interruption and a close; SIGNATURE names its jobs, tier, touch, keyboard, reduced-motion and fallback lines; FIRST VIEWPORT is a composition; WORLD names a strategy and a contract type; SCROLL MODEL gives a reason; LOAD & CLOSE names a real signal.
- [ ] The honest risk is stated for every dealt card and for the winner.
- [ ] The concept survives with WebGL removed; the page still argues the thesis in the DOM.
- [ ] DIVERGENCE names three real `[site:slug]` entries from the index or `.awards/sites/`, each with a take and a refuse line; no card's signature, section order, copy, hexes or pairing appears anywhere in the contract.
- [ ] `roll.mjs` was actually run (`--stimulus`, then `--deal` with `--engines`, and `--choose` for the colour strategy); the Seed field holds the whole line; re-rolls used the same seed and tags.
- [ ] The conventional exit was offered and its ceiling stated; the user locked the direction in one round, or, unattended, your pick among the dealt three was locked with its reason stated.
- [ ] The visitor mode (from the brief or `--mode`) is honoured: no gate before content in persuade, a rail out in experience, the index on screen one in read.
- [ ] `## Status` shows "Direction contract locked (concept)" ticked and nothing else changed but the `Inventory` line (and the `Found pictures:` line under `--no-found-pictures`).

## Hand-off

The next phase belongs to `awards:system`, which needs the WORLD block and the brief. When the user asked for the whole site or `awards:craft` is driving the build: Invoke the `awards:system` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the user asked only for ideas or a direction, stop after writing the contract and offer that next step in one line. A `--component` run hands its six lines back to `awards:component`.

## Refuse

- Mood adjectives as concepts (premium, immersive, bold, cinematic, clean): they fail the memory test by definition.
- Effect as concept ("a WebGL hero with distortion", "particles that react to the cursor"): an effect is a technique tier, and a technique is not an idea.
- The category rut, the Awwwards rut, the template skeleton and the plugin rut, however the user phrases the request; all four are named in THESIS as refusals, written for this subject rather than copied from the template.
- An idea that still works with the nearest competitor's name in it, a world tagged with no engine, seven worlds on fewer than four engines, and stimuli dealt after the worlds were written.
- Code-only imagery chosen before the open collections were searched while found pictures are on, and the corpus's modal colour strategy taken without a deal or a reason.
- Any card's signature, section order, copy, palette, type pairing or asset, including when the user asks for "something like" a named site; the card's principle is offered instead.
- A direction that needs assets the user cannot supply (a commissioned object per variant, drone footage, a full bake pipeline) unless the brief labels them synthetic and they can be authored for the build.
- A deal without the script, an undealt world locked or offered, three variants of one idea presented as three worlds, any option beyond the dealt cards, the exit and re-roll, more than two re-rolls, a second question round.
- A gate in front of the content, two interruptions, two signatures, or a scroll model chosen for spectacle rather than for the story.
- Faces, hexes or effect parameters written into WORLD: that is `awards:system` and `awards:motion` work, done with the reference files they own.
