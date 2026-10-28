# House tells — this plugin's own defaults, dated

What this file is for: the fourth rut. The category rut, the Awwwards rut and the template skeleton are other people's defaults; this file lists the shapes this plugin's own finished builds converge on, so concept can name them and refuse them, and the jury can count them. Each wave is dated and never rewritten: a device that was a fresh idea in one wave is a habit by the next, which is exactly how every generated look starts. Read it in concept Step 1, before the seven worlds, and in the jury's slop scan.

The evidence is the house ledger (`docs/handoff/house-ledger.md` in the repository, written by `node scripts/house-ledger.mjs --write`), which reads each finished build's `AWARDS.md` and counts what their contracts share. A value carried by at least three builds and by at least half of them is spent. A user's own builds can be read the same way: `node "${CLAUDE_PLUGIN_ROOT}/scripts/house-ledger.mjs" <build dirs…> --against AWARDS.md` prints which spent features a new contract shares, and exits 2 at two or more.

## Contents
1. [Wave 1 (2026-10-23)](#wave-1-2026-10-23)
2. [Why each rule produced it](#why-each-rule-produced-it)
3. [Using the registry](#using-the-registry)
4. [Refreshing it](#refreshing-it)
5. [Verify](#verify) · [Refuse](#refuse)

## Wave 1 (2026-10-23)

Why: these five builds (`showcase/awards-home`, `ekvator`, `extinct`, `petrel` and the plugin's own `site/`) were the first after the house-style strip, the ceiling batch and the finish gates, on five different briefs. Each concept was strong alone; together they read as one studio's formula.

| Device | Seen in | Earned when | Instead, as a procedure |
|---|---|---|---|
| The thesis "the page *is* [an object]" (engine `artefact`) | five of five | the object is this client's own, one a competitor could not claim (siena's ticket is the cinema's real admission ritual `[site:siena]`) | pick the engine first from `scripts/data/engines.json`, then write the thesis as what the page *does* for the visitor |
| The page as a proof or capture of itself | two of five | never twice in a row; the plugin's own pages are the only honest place for it | the subject's output or its people as the material (`collage-to-index`, `voice-led`) |
| The scroll as the engine of a physical process (engine `process-performed`) | four of five | the sequence is the subject's real one and the visitor needs it in order (a journey, a making) `[site:united-carriers]` | a held stage, a switch the visitor operates, or chapters in colour; the scroll can simply read |
| A live numeric readout of that process in the margin, as wayfinding | four of four showcase builds; the plugin site refused the one its predecessor had | the readout is the subject's real instrument and its audience reads it (a cable ship's bridge prints tension) | wayfinding by chapter names, by colour, or by the page's own contents; numbers belong in sentences (`[pattern:copy-and-content#numbers-not-adjectives]`) |
| Every picture made in code, photography refused | four of five | the subject truly has no honest picture, and the made imagery has three levels of detail (`[pattern:imagery-and-assets#finish-for-made-imagery]`) | search the open collections for the subject's world first (`assets.mjs search`), and make only what no honest picture shows |
| A light, near-achromatic ground with one accent ("restrained duotone") | four of five, three under that name | the subject's scene forces light and its imagery carries the chroma; the strategy is also the corpus mode (21 cards), so the reason is written | deal the colour strategy from the ones WORLD allows (`roll.mjs --choose … --avoid restrained-duotone`) and write why the result fits |
| THESIS refusals pasted as stock sentences | four of four showcase contracts (the template-skeleton sentence verbatim) | — | write each rut as it looks for this subject: the bakery's category rut, the bakery's Awwwards rut; extinct and petrel adapted theirs |

Sign of the wave in one sentence: a scroll-driven physical process with a readout in the margin, drawn in code on a light duotone, with a thesis that begins "The page is". A contract that matches two or more rows is the plugin rut.

## Why each rule produced it

Why: every rule behind the wave is sound alone; knowing which rule pulls where is what lets a contract keep the rule and leave the habit.

- SIGNATURE asks for one physical metaphor doing at least two jobs, and the concept skill's own example names wayfinding as one; a readout is the cheapest way to make any metaphor do wayfinding.
- The memory test accepts "an object or a behaviour", so "the page is the object" passes it by construction.
- The telemetry register and "numbers not adjectives" (`[pattern:copy-and-content#telemetry-register]`) reward readouts.
- The no-asset strategies were all made, not found, before 1.0; one of them, procedural images from the world's own data, produces readouts directly.
- Restrained duotone is the corpus's modal strategy (`[pattern:color-and-material#colour-strategies]`), and "light grounds are the corpus majority" was written to counter the dark default, so the model takes the mode.

## Using the registry

- Concept Step 1 writes the plugin rut as a fourth line: the devices from the latest wave this direction would use. A contract may use one, with its "earned when" written into THESIS; two or more send the direction back.
- Concept Step 3 tags every world with an engine; the latest wave's spent engines go to `roll.mjs --avoid`, which deals other engines first and says so when it cannot.
- The jury's slop scan treats the latest wave as a family, `House concept`: two or more of its devices present, unearned, count as one family, and two families cap Creativity at 6 as before. A build whose `AWARDS.md` says `Found pictures: off` made its imagery by the user's choice, so its code-only imagery is earned; the finish bar still applies.
- The registry names procedures, never replacement devices: a list of "use this instead" becomes the next wave.

## Refreshing it

- After every set of finished builds (a dogfood wave, the showcase, a build eval kept with `--keep-temp`): `node scripts/house-ledger.mjs --write docs/handoff/house-ledger.md`, then add a dated wave here for every spent value the previous wave does not already list. Never edit an earlier wave; a device that stops recurring stays in its wave as history.
- Declare engines on the Seed line (`ENGINES …` as `roll.mjs` prints them), so the ledger reads them instead of inferring them from the thesis's words.
- `node scripts/house-ledger.mjs --fingerprints` adds first-viewport fingerprints through `skeleton.mjs` for builds with a build output; two builds under 0.35 apart have one first viewport in two outfits.

## Verify

- [ ] Concept wrote the plugin rut line and named at most one device from the latest wave, with its reason.
- [ ] The Seed line carries `ENGINES` for the dealt worlds.
- [ ] `house-ledger.mjs --against AWARDS.md` exits 0, or the contract names each shared spent feature with the reason this subject earns it.

## Refuse

- A thesis that begins "The page is" because it is the shortest way to pass the memory test.
- A readout added so that a metaphor can do wayfinding.
- Code-only imagery chosen before the open collections were searched, unless the user turned found pictures off.
- Rewriting an earlier wave to make a recurring device look new.
