# Deep Modes — Design

Status: approved design; implementation has not started.

## Goal

Give the plugin three tech-specialised paths, each grounded in analysed sites rather than recall: a GSAP path for motion, a shader path and a 3D path for WebGL. The maintainer queued 16 new sites in `awardsworthysites.md` under three lens headings (`# not reviewed 3D`, `# not reviewed GSAP`, `# not reviewed WebGL`); corpus wave 4 analyses them with a per-lens teardown and the synthesis fills one playbook per mode.

## Approach and alternatives

Deep modes of existing skills, not new skills.

- `awards:motion --gsap`: one timeline architecture across the score, ScrollTrigger configurations as shipped, SplitText, Flip and Observer choreography.
- `awards:webgl --shader`: depth rungs 1–3. Planes, fullscreen fields, noise and fluid, render-target transitions, post chains, text in shaders.
- `awards:webgl --3d`: depth rungs 4–5. Model intake, lighting rigs, materials, camera rigs, scroll-driven scenes, interaction and physics.

A mode switches on automatically from the direction contract, the WebGL dosage and depth rung, or the motion score, and can be forced with its flag. The choice is recorded once, in `AWARDS.md ## Budgets & tiers` as `Deep modes: motion gsap|none · webgl shader|3d|none — because …`, and the skill's reply opens with `Deep mode: <mode>|none`.

Declined:

- Three new triggerable skills (`awards:gsap`, `awards:3d`, `awards:shader`). They re-open the "eleven skills" decision, compete with `motion` and `webgl` for the same requests, break the existing trigger evals, and add routing surface while routing already under-fires (`docs/handoff/todo.md`).
- Playbooks only, with no skill change. The skills would never know when to read them.
- A separate tech study outside `/expand-corpus`. It would bypass the ledger, the novelty gate and the no-recall rule.

## Analysis: wave 4 with a tech lens

`/expand-corpus` (`.claude/skills/expand-corpus/SKILL.md`) gains a lens:

- The queue is every bullet under a heading that starts `# not reviewed`; the suffix names the lens. One URL is one ledger row; a URL under two headings carries both lenses (`edolus`: `3D, WebGL`). The ledger gains a `Lens` column for the new wave.
- A URL that already has a card (`why.zero.university` → `why-zero`) keeps its slug and gets a lens-only update.
- The site subagent gathers lens evidence only from the HTML, first-party JS and CSS research already fetches (at most 2 MB each) plus `curl -sI` headers for asset sizes. It never downloads a model, texture or decoder. Literal values read from source are `[verified, <file>]`; structure reconstructed from minified code is `[inferred]`.
- Novelty gains a sixth hit type, `lens`, judged per category. On an existing card only a lens hit counts.
- The teardown lives in the card as `### Tech lens: <GSAP|WebGL|3D>` at the end of §5, at most 50 lines (30 each with two lenses), card still under 200 lines. This keeps the nine-section template, research Verify and the card checks unchanged. A separate teardown file would be counted as a slug by the synthesis check and could not be cited with `[site:]`; a §10 would break the schema order for 16 cards.
- The card-text fallback (`===CARD START===` / `===CARD END===`) is written into the subagent prompt, because subagent card writes were refused in wave 3.
- Synthesis folds each lens subsection into its playbook. One fact lives in one place: effect parameter rows stay in `webgl-architecture#effect-parameters` and the playbook links to them.
- Recipe proposals carry a lens; the maintainer gate asks one question per lens.
- `oxigen.sa` is dropped from the queue by the maintainer and recorded as `dropped` in the ledger.

## Playbooks

Three files in `plugins/awards/references/patterns/`, where `lint-refs.mjs` already resolves `[pattern:file#anchor]` and the triage novelty check and synthesis scope already reach:

| File | Mode | Owns | Links instead of repeating |
|---|---|---|---|
| `gsap-choreography.md` | `--gsap` | timeline architecture, ScrollTrigger configurations as shipped, easing as used, SplitText, Flip and Observer choreography, GL driven by timelines | API → official GSAP skills and `stacks/gsap-3.15.md`; tokens, durations, scrub rules → `motion-vocabulary` |
| `webgl-shaders.md` | `--shader` | shader beats by kind, uniform contract, noise and field toolbox, render-target chains, post order, text in shaders | dosage, architecture, effect rows → `webgl-architecture`; renderer API → `stacks/three-0.186.md` |
| `webgl-3d-scenes.md` | `--3d` | scene-level model intake, lighting rigs, materials, camera rigs, scroll-driven scenes, interaction and physics | export pipeline and budgets → `asset-pipeline`; camera API → `stacks/camera-controls-3.1.md` |

Each follows the register of `webgl-architecture.md` and ends with `## Teardowns` (site, summary, signature move, `[site:]`), `## Recipe map` (`[recipe:]`, seeded from existing recipes), `## Verify` and `## Refuse`. Content sections are filled by synthesis only; nothing is written from recall.

## Skill wiring

- `motion`: `--gsap` flag; a `## Deep mode: GSAP` section with auto-entry criteria (GSAP grammar and one of: DOM motion carries the signature at dosage `none` or `moments`; one timeline across two or more scrubbed chapters, a Flip signature, an Observer switcher, or SplitText beyond heading reveals; the request asks for it; `AWARDS.md` already records it). In the mode every score row names its timeline and label. API correctness still defers to the official GSAP skills.
- `webgl`: `--shader` and `--3d` flags; a `## Deep modes` table after the depth ladder. `moments` with no shader signature stays on the standard path; with both modes, 3D leads and reads only the post-chain section of the shader playbook. The stale "planned recipes" line is replaced.
- `craft`: passes flags or brief intent into the `Deep modes:` line at intake; the phase invocation lines stay unchanged because the skills read the line themselves; the hand-back check requires the line.
- Descriptions stay at or under 900 characters (Codex caps at 1,024); bodies stay under 500 lines.

## Evals

Three fixture-free smoke cases tagged `deep`: `trigger-motion-gsap-deep`, `trigger-webgl-shader-deep`, `trigger-webgl-3d-deep`. Each checks the skill fired, that the playbook was read (anchored on the Read tool's `file_path` input, since the skill body itself contains the path) and that the final message names the mode. Prompts name no skill and no mode. The existing `trigger-motion` and `trigger-webgl-hero` cases stay untouched and must not regress.

## Release

Version 0.5.0 in the three manifests; `CLAUDE.md`, root `README.md`, `evals/README.md`, `docs/handoff/decisions.md`, `state.md` and `todo.md` updated. Skill count stays eleven.

## Risks

- Headless SwiftShader may block GPU-heavy captures, as with oxigen in wave 3. Blocked sites get no lens; the pilot runs the heaviest 3D site early.
- Minified bundles leave most structure `[inferred]`; playbooks keep the labels.
- The official GSAP skills may out-route `awards:motion` on GSAP-worded requests; the deep eval measures this. The description is not stuffed past its budget to chase it.
- Loose auto criteria would make every run deep; the `Deep mode: none` reply line keeps the choice visible.
