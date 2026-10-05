# Deep Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three deep modes (`awards:motion --gsap`, `awards:webgl --shader`, `awards:webgl --3d`) backed by three pattern playbooks, filled by a corpus wave 4 that analyses the 16 queued lens sites.

**Architecture:** No new skills. `/expand-corpus` (repo-local maintainer skill) learns a per-category tech lens; the lens teardown lives in each card as a `### Tech lens:` subsection of §5; synthesis folds the teardowns into three new `references/patterns/` files; `motion` and `webgl` gain a deep-mode section that reads the playbook when the contract or a flag calls for it, recorded on one `Deep modes:` line in `AWARDS.md`.

**Tech Stack:** Markdown skills and references, Node 20.19+/22.12+ scripts (`lint-refs.mjs`, `verify-recipes.mjs`, `audit.mjs`), `claude plugin validate`, `claude plugin eval`.

**Spec:** `docs/superpowers/specs/2026-10-05-deep-modes-design.md`

## Global Constraints

- Branch `feat/deep-modes` (already created from `main`; commits `321fe1d` queue, `8c07594` spec).
- No new skill names; skill count stays eleven.
- Skill descriptions ≤ 900 characters (Codex hard cap 1,024); `SKILL.md` bodies < 500 lines; every skill keeps Setup / Verify / Hand-off / Refuse.
- Corpus lives at the plugin root, never inside skill folders. Cross-references use `[site:slug]`, `[recipe:id]`, `[pattern:file#anchor]` and must resolve: `node plugins/awards/scripts/lint-refs.mjs` ends `0 dangling reference(s)`.
- No model identifiers in any repository artefact or commit title/body; commit messages end with the session's attribution footer.
- Original prose only. Site copy in fragments of at most 25 words. Every fact on a card carries `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`.
- No card and no playbook content from recall: playbook content sections are filled only by wave 4 synthesis.
- Lens evidence never downloads a model, texture, decoder, image, font, video or audio body; `curl -sI` headers only for sizes.
- Browser work serial: no `verify-recipes.mjs` beside a capture, no `evals/behavior.mjs` beside either.
- `oxigen.sa` is dropped by the maintainer (2026-10-05); it is not re-queued.
- GSAP API correctness stays with the official GSAP skills and `stacks/gsap-3.15.md`; the GSAP playbook holds choreography only.

## Review Focus

1. **URL under two lens headings** (`edolus.com` under 3D and WebGL): expect one ledger row with `Lens: 3D, WebGL`, one card with two `### Tech lens:` subsections, the bullet removed from both headings. Pinned by Task 1 step 5 (dry-run queue parse).
2. **Lens URL that already has a card** (`why.zero.university` → `why-zero`): expect the slug reused, no second card, no second index row, a lens-only update or `skipped`. Pinned by Task 1 step 5 and the pilot in Task 7.
3. **Plain trace grader false-pass**: a grader that matches the playbook path anywhere in the trace passes on the loaded skill body. Expect graders anchored on the Read tool's `"file_path"` input. Pinned by Task 6 step 2.
4. **Over-activation**: a DOM-first `moments` site with no shader signature must stay on the standard webgl path; a plain fade pass must not enter GSAP deep mode. Pinned by explicit `none` criteria in Tasks 3–4 and the `Deep mode: none` reply line.
5. **Headless capture of GPU-heavy sites**: a site that cannot be captured gets `blocked` and no lens; nothing is filled from source reading alone. Pinned by Task 1 lens rule and Task 7 pilot order.

---

### Task 1: Tech lens in `/expand-corpus`

**Files:**
- Modify: `.claude/skills/expand-corpus/SKILL.md` (lines 16–23, 27, 60, 73–85, 91–130, 136–142, 173–175, 185–192, 242–259, 265–267)
- Modify: `docs/superpowers/specs/2026-09-23-expand-corpus-design.md` (append addendum)

**Interfaces:**
- Produces: lens names `GSAP`, `WebGL`, `3D`; ledger `Lens` column; card subsection heading `### Tech lens: <GSAP|WebGL|3D>`; reply-block line `lens:`; playbook paths `PLUGIN/references/patterns/gsap-choreography.md`, `webgl-shaders.md`, `webgl-3d-scenes.md` (created in Task 2). Lens → playbook map: `GSAP` → `gsap-choreography.md`, `WebGL` → `webgl-shaders.md`, `3D` → `webgl-3d-scenes.md`.

- [ ] **Step 1: Baseline check that fails**

Run:
```bash
cd /home/fdaiobue/projects/Pers/awards
grep -c "Tech lens" .claude/skills/expand-corpus/SKILL.md
grep -c "heading that starts" .claude/skills/expand-corpus/SKILL.md
```
Expected: `0` and `0`.

- [ ] **Step 2: Rules and Resume**

After the `- **Git.** …` bullet (line 23), replace that bullet and add the lens rule:
```markdown
- **Git.** Work on branch `feat/corpus-wave-<n>`, or on the current branch when it is not `main` and the maintainer opened it for this wave; create `feat/corpus-wave-<n>` from `main` otherwise. Commit after every triage batch and every phase. Commit messages name no model and end with the session's attribution footer.
- **Lens.** A site queued under `# not reviewed <Lens>` (`GSAP`, `WebGL` or `3D`) also gets that category's teardown, written as `### Tech lens: <Lens>` at the end of its card's §5, and its synthesis lands in the lens playbook: `GSAP` → `PLUGIN/references/patterns/gsap-choreography.md`, `WebGL` → `webgl-shaders.md`, `3D` → `webgl-3d-scenes.md`. A lens never licenses recall: a blocked site gets no lens.
```
In Resume (line 27) replace `URLs under \`# not reviewed\` or \`# new stack\`` with `URLs under any heading that starts with \`# not reviewed\`, or under \`# new stack\`,`.

- [ ] **Step 3: Ledger template and triage queue**

Line 60–61 Sites table header becomes:
```markdown
   | Slug | URL | Lens | Status | Rating | Novelty | Synthesised | Reason | Date |
   |---|---|---|---|---|---|---|---|---|
```
Add after the template block (before step 3 of Setup): `Waves opened before wave 4 keep their eight-column table.`

Replace triage step 2 (line 73) with:
```markdown
2. **Queue.** Read `awardsworthysites.md`. Sites are the bullets under every heading that starts with `# not reviewed`; the text after `not reviewed` names the lens (`GSAP`, `WebGL`, `3D`), no suffix means no lens. One URL is one row: a URL under several headings gets the lenses joined with `, ` (`3D, WebGL`). The stack queue is the bullets under `# new stack` (handled in the stacks phase). Before slugging, look the URL up under `# Reviewed and in Skill` and in the first line of every `PLUGIN/references/sites/*.md`: a match reuses that card's slug, its row gets Reason `existing card`, and its subagent only adds the lens. Every site URL not yet in the current wave's Sites table gets a row with status `queued`. A URL already in an earlier wave keeps its slug: carry it into the new wave's table only if its last status was `queued` or `blocked`; a `failed` URL is not re-queued until the maintainer corrects it in `awardsworthysites.md` (a corrected URL is a new URL).
```
In step 3 (line 74) append: `A URL matched to an existing card in step 2 keeps that card's slug; the collision rule never applies to it.`

- [ ] **Step 4: Per-block handling and counts**

In step 7, replace the `awardsworthysites.md` bullet (line 83) with:
```markdown
   - `awardsworthysites.md`: remove the bullet from every `# not reviewed…` heading it sits under and add it once to `# Reviewed and in Skill` (added; skip if already there) or to `# Reviewed, not added` (skipped; create that section after `# Reviewed and in Skill` if absent, bullet suffixed ` — <reason>`). A `failed` bullet stays and gets ` (host does not resolve)`. A `blocked` bullet stays unchanged. Empty lens headings stay as queue slots.
```
In the `index_row` bullet (line 80) append: `An existing-card row replaces its index row; it never appends one.`
In step 9 (line 85) replace `plus the 20 pre-existing incl. \`floema-jewelry\`` with `plus the 20 pre-existing incl. \`floema-jewelry\`; existing-card rows add none`.

- [ ] **Step 5: Dry-run the queue rule against the real file**

Run:
```bash
cd /home/fdaiobue/projects/Pers/awards
node -e '
const t=require("fs").readFileSync("awardsworthysites.md","utf8");let h="",rows=new Map();
for(const l of t.split("\n")){if(l.startsWith("# "))h=l;else if(h.startsWith("# not reviewed")&&l.startsWith("- ")){const u=l.slice(2).trim(),lens=h.slice(15).trim();const r=rows.get(u)||[];if(lens)r.push(lens);rows.set(u,r)}}
const reviewed=t.split("# not reviewed")[0];
for(const [u,l] of rows)console.log(u,"|",l.join(", "),reviewed.includes(u)?"| existing card":"");console.log(rows.size,"rows")'
```
Expected: `17 rows`; `https://edolus.com/ | 3D, WebGL`; `https://why.zero.university/ | GSAP | existing card`. This is the rule the skill text describes; if the output differs, fix the wording before going on.

- [ ] **Step 6: Subagent prompt fields and lens evidence**

In "Subagent prompt: site", after `Slugs already added this wave …` (line 99) add:
```
Lens: {GSAP | WebGL | 3D, comma list, or none}
Existing card: {PLUGIN/references/sites/<slug>.md | none}
Lens file(s): {PLUGIN/references/patterns/gsap-choreography.md | webgl-shaders.md | webgl-3d-scenes.md, one per lens, or none}
```
After step 2 of the prompt add:
```
2b. Lens evidence (only when Lens is not none). Grep the HTML and the first-party JS and CSS research §4 already fetched (at most 2 MB each). For asset sizes use `curl -sI <url>` and read content-length; never fetch a model, texture or decoder body. A literal value read from source is [verified, <file>]; structure reconstructed from minified code is [inferred]; never upgrade an inferred structure.
   GSAP: registerPlugin arguments and the version banner; timeline count and nesting, addLabel, position parameters; up to 8 ScrollTrigger configs (trigger, start, end, scrub, pin, snap, toggleActions); eases, including CustomEase.create strings; SplitText options (type, mask, autoSplit); Flip and Observer parameters; smooth-scroll library and whether it shares gsap.ticker; whether a matchMedia or reduced-motion branch exists.
   WebGL: library and version; canvas model and count; per program: kind (fullscreen, plane, points), uniform names, noise family, notable constants; render targets (count, size, type, ping-pong); the post chain in order with values; text in GL; DPR cap and quality tiers; fallback.
   3D: model formats and compression (.glb, .gltf, .drc, .ktx2, .hdr, .exr; Draco, meshopt, Basis) with header sizes; scene windows; lighting (environment type, lights, baked maps, shadows); materials; camera rig (type, constraints, damping, scroll mapping); animation clips and baked simulations; raycast and physics; disposal evidence.
```
In prompt step 4, after the `world — …` line add:
```
   lens — a <Lens> technique, configuration or parameter set absent from the lens file, from [pattern:webgl-architecture#effect-parameters] (WebGL, 3D) or [pattern:motion-vocabulary] (GSAP), and from every recipe tagged for it
   Judge `lens` per category only: a GSAP site's shader is never a GSAP lens hit. On an Existing card only `lens` hits count; with none, status skipped and leave the card untouched.
```
In prompt step 5, append:
```
   With a Lens, close §5 with one `### Tech lens: <Lens>` subsection per lens from step 2b: at most 50 lines, at most 30 each with two lenses, every fact labelled, the card still under 200 lines. With an Existing card, keep every other section and only re-verify what the lens touches (research §1, update in place).
5b. If the Write of the card is refused, put the full card text between a line `===CARD START===` and a line `===CARD END===` after the reply block; the main session writes it.
```
In the reply block, after `novelty:` add `lens: <Lens, comma list> | none`, and after `<name> — <evidence file> — <parameters>` add the note `   (a lens technique ends with [lens:gsap|webgl|3d])`.

- [ ] **Step 7: Card checks, synthesis, recipes, upkeep, report**

Card checks block (after line 141) add:
```bash
for L in <each lens of the row>; do grep -q "^### Tech lens: $L" "$f" || echo "missing lens $L"; done
```
Card checks prose (line 144): append `For an existing-card row the index count stays 1.`
Synthesis prompt: after step 3 add:
```
3b. Fold every `### Tech lens: <Lens>` subsection into its lens file (GSAP → PLUGIN/references/patterns/gsap-choreography.md, WebGL → webgl-shaders.md, 3D → webgl-3d-scenes.md) in that file's register, citing [site:<slug>], and add the site to its `## Teardowns` table. One fact lives in one place: an effect parameter row belongs in [pattern:webgl-architecture#effect-parameters] and the lens file links to it.
```
Recipes phase proposal template: add the line `   - Lens: gsap | shader | 3d | none`. Maintainer gate (step 4): append `Ask lens candidates first, one question per lens, then the rest.`
Upkeep: add step `2b. **Lens maps.** Each recipe of this wave with a lens gets a row in its lens file's \`## Recipe map\` and in the skill's recipe table (\`PLUGIN/skills/motion/SKILL.md\` "Recipe map by intent" for gsap, \`PLUGIN/skills/webgl/SKILL.md\` "Effect recipes" for shader and 3d).` In step 5 replace `eleven routing cases` with `fourteen routing cases`.
Narrowed-run report: add bullet `- per lens: whether the lens gate admitted or skipped well, and the teardown line counts;`.

- [ ] **Step 8: Design addendum**

Append to `docs/superpowers/specs/2026-09-23-expand-corpus-design.md`:
```markdown

## Addendum 2026-10-05: tech lens (wave 4)

Queue headings may carry a lens suffix (`# not reviewed GSAP|WebGL|3D`). A lens adds a teardown as `### Tech lens: <Lens>` at the end of the card's §5 and a sixth novelty type, `lens`, judged per category; synthesis folds teardowns into `patterns/gsap-choreography.md`, `webgl-shaders.md` and `webgl-3d-scenes.md`. A URL that already has a card keeps its slug and gets a lens-only update. Design: `docs/superpowers/specs/2026-10-05-deep-modes-design.md`.
```

- [ ] **Step 9: Verify**

```bash
cd /home/fdaiobue/projects/Pers/awards
grep -c "Tech lens" .claude/skills/expand-corpus/SKILL.md       # ≥ 5
grep -n "heading that starts" .claude/skills/expand-corpus/SKILL.md   # lines in Resume and triage step 2
grep -n "eleven" .claude/skills/expand-corpus/SKILL.md            # nothing
wc -l .claude/skills/expand-corpus/SKILL.md                       # < 330
```

- [ ] **Step 10: Commit**

```bash
git add .claude/skills/expand-corpus/SKILL.md docs/superpowers/specs/2026-09-23-expand-corpus-design.md
git commit -m "feat(corpus): tech lens for expand-corpus waves" -m "Co-Authored-By: <session footer>"
```

---

### Task 2: Playbook skeletons and template notes

**Files:**
- Create: `plugins/awards/references/patterns/gsap-choreography.md`
- Create: `plugins/awards/references/patterns/webgl-shaders.md`
- Create: `plugins/awards/references/patterns/webgl-3d-scenes.md`
- Modify: `plugins/awards/references/README.md:7`
- Modify: `plugins/awards/references/sites/_TEMPLATE.md:31-32`

**Interfaces:**
- Produces anchors used by Tasks 3–4: `#timeline-architecture`, `#scrolltrigger-configurations`, `#post-chains`, `#uniform-contract`, `#camera-rigs`, `#lighting-rigs`, `#recipe-map`, `#teardowns`, `#verify`, `#refuse`.

- [ ] **Step 1: Failing check**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
printf 'x [pattern:gsap-choreography#timeline-architecture] [pattern:webgl-shaders#post-chains] [pattern:webgl-3d-scenes#camera-rigs]\n' > /tmp/claude-1000/-home-fdaiobue-projects-Pers-awards/e08d99b1-e1b8-4bf3-a8bc-aeee7c6d193b/scratchpad/lint-probe.md
cp /tmp/claude-1000/-home-fdaiobue-projects-Pers-awards/e08d99b1-e1b8-4bf3-a8bc-aeee7c6d193b/scratchpad/lint-probe.md references/_probe.md && node scripts/lint-refs.mjs | tail -1; rm references/_probe.md
```
Expected: `3 dangling reference(s)`.

- [ ] **Step 2: Write `gsap-choreography.md`**

```markdown
# GSAP choreography

What this file is for: the deep GSAP path of `awards:motion` (`--gsap`). How the analysed sites structure GSAP across a whole page — timeline architecture, ScrollTrigger configurations as shipped, easing as actually used, SplitText, Flip and Observer choreography, and GL uniforms driven from timelines. It does not teach the API: that is GreenSock's official skills and `stacks/gsap-3.15.md`. Tokens, duration bands and scrub rules stay in `[pattern:motion-vocabulary]`. Cite as `[pattern:gsap-choreography#section]`. Every row carries the card's confidence label; structure read from minified bundles is `[inferred]`.

## Contents
1. [Timeline architecture](#timeline-architecture)
2. [ScrollTrigger configurations](#scrolltrigger-configurations)
3. [Easing as shipped](#easing-as-shipped)
4. [SplitText choreography](#splittext-choreography)
5. [Flip and layout state](#flip-and-layout-state)
6. [Observer and gesture sections](#observer-and-gesture-sections)
7. [Driving GL from timelines](#driving-gl-from-timelines)
8. [Teardowns](#teardowns)
9. [Recipe map](#recipe-map)
10. [Verify](#verify) · [Refuse](#refuse)

## Timeline architecture

Why: a page whose moments are separate tweens cannot be scored, paused or reduced as one; the deep path names one master timeline per scroll model and a label per chapter.

<!-- filled by wave 4 synthesis from `### Tech lens: GSAP` subsections -->

## ScrollTrigger configurations

Why: start, end, scrub and pin values are where shipped sites differ from tutorials; this table records them as shipped.

| Use | start / end | scrub | pin or sticky | snap | Site | Confidence |
|---|---|---|---|---|---|---|

## Easing as shipped

Why: named curves and CustomEase strings the corpus actually ships, beside the token set in `[pattern:motion-vocabulary#easing]`.

## SplitText choreography

Why: split type, masking and stagger decide whether a text reveal reads as authored or as a plugin default.

## Flip and layout state

Why: shared-element moves are the cheapest way to make two layouts read as one object.

## Observer and gesture sections

Why: section switchers commit on a gesture, not on scroll distance; the thresholds decide whether they feel deliberate or twitchy.

## Driving GL from timelines

Why: when GSAP owns the clock, uniforms are tweened values on the same ticker, never a second loop.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|

## Recipe map

| Intent | Recipe |
|---|---|
| One ticker for Lenis and ScrollTrigger | [recipe:boot-lenis-gsap] |
| Pinned scrubbed chapter | [recipe:scroll-pin-scrub] |
| Masked line reveal | [recipe:split-text-masked-reveal] |
| Scroll-filled words | [recipe:scroll-word-fill] |
| Gesture-committed sections | [recipe:section-switcher-wheel-commit] |
| Chosen item promoted across a route | [recipe:transition-promote-chosen] |
| Route transitions | [recipe:page-transitions] |

## Verify

- [ ] Every motion score row names its timeline and label (`master@ch2`).
- [ ] Every timeline is created inside one `gsap.context()` or `gsap.matchMedia()` scope and reverted on teardown.
- [ ] Every scrubbed tween runs on `ease: 'none'` [M03].
- [ ] The reduced tier is a `matchMedia` branch, not a global kill [M01] [M02].

## Refuse

- A timeline per element with no master: nothing can be scored, paused or reduced as one.
- A corpus site's exact timeline, curve or label set shipped as the signature: pattern pointers, never parts.
```

- [ ] **Step 3: Write `webgl-shaders.md`**

```markdown
# WebGL shaders

What this file is for: the deep shader path of `awards:webgl` (`--shader`), depth rungs 1–3 of `[pattern:webgl-architecture#the-depth-ladder]`: shader beats by kind, the uniform contract between DOM and GPU, the noise and field toolbox, render-target chains and transitions, post chains in order, text in shaders. Dosage, canvas placement, disposal and single-row effect parameters stay in `[pattern:webgl-architecture]`; renderer API in `stacks/three-0.186.md`. Cite as `[pattern:webgl-shaders#section]`. Every row carries the card's confidence label; structure read from minified bundles is `[inferred]`.

## Contents
1. [Shader beats by kind](#shader-beats-by-kind)
2. [Uniform contract](#uniform-contract)
3. [Noise and field toolbox](#noise-and-field-toolbox)
4. [Render targets and transitions](#render-targets-and-transitions)
5. [Post chains](#post-chains)
6. [Text in shaders](#text-in-shaders)
7. [Teardowns](#teardowns)
8. [Recipe map](#recipe-map)
9. [Verify](#verify) · [Refuse](#refuse)

## Shader beats by kind

Why: a fullscreen field, a tethered plane and a point cloud each cost and read differently; the beat picks the kind, never the reverse.

<!-- filled by wave 4 synthesis from `### Tech lens: WebGL` subsections -->

## Uniform contract

Why: scroll, pointer, velocity and time reach the GPU as named, damped numbers on one ticker; the names and rest values are part of the design.

## Noise and field toolbox

Why: the noise family and its octave count set the texture of the whole site.

## Render targets and transitions

Why: section transitions and feedback effects live in render targets; their size and type decide the frame budget.

## Post chains

Why: post order changes the image (grain before or after the grade, bloom before or after the wake); this section records shipped orders with values.

## Text in shaders

Why: GL text must keep a DOM twin; this section records how the corpus distorts type without losing it.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|

## Recipe map

| Intent | Recipe |
|---|---|
| Planes tethered to DOM images | [recipe:gl-dom-tethered-planes] |
| Global fluid wake | [recipe:gl-fluid-wake-post] |
| Depth-map parallax | [recipe:gl-depth-map-parallax] |
| Section transition through render targets | [recipe:gl-rtt-composite-transition] |
| Bloom and grain presets | [recipe:gl-postprocessing-presets] |
| MSDF text | [recipe:gl-msdf-text] |
| Endless reel of sheets | [recipe:gl-endless-reel-sheets] |

## Verify

- [ ] Every custom material ends its fragment stage with `#include <colorspace_fragment>`.
- [ ] Every uniform is fed from the one ticker, with a named rest value.
- [ ] The post chain order is written in `AWARDS.md ## Budgets & tiers` and no shader compile warning reaches the console.

## Refuse

- A second ticker or a raw wheel delta as a uniform.
- A corpus site's exact shader, curve or post values shipped as the signature: pattern pointers, never parts.
```

- [ ] **Step 4: Write `webgl-3d-scenes.md`**

```markdown
# WebGL 3D scenes

What this file is for: the deep 3D path of `awards:webgl` (`--3d`), depth rungs 4–5 of `[pattern:webgl-architecture#the-depth-ladder]`: scene-level model intake, lighting rigs, materials, camera rigs, scroll-driven scenes, interaction and physics. Export pipeline, encoders and byte budgets stay in `[pattern:asset-pipeline]`; camera library API in `stacks/camera-controls-3.1.md`; renderer API in `stacks/three-0.186.md`. Cite as `[pattern:webgl-3d-scenes#section]`. Every row carries the card's confidence label; asset sizes come from response headers only.

## Contents
1. [Model intake](#model-intake)
2. [Lighting rigs](#lighting-rigs)
3. [Materials](#materials)
4. [Camera rigs](#camera-rigs)
5. [Scroll-driven scenes](#scroll-driven-scenes)
6. [Interaction and physics](#interaction-and-physics)
7. [Teardowns](#teardowns)
8. [Recipe map](#recipe-map)
9. [Verify](#verify) · [Refuse](#refuse)

## Model intake

Why: formats, compression, instancing and level of detail decide whether the scene loads on a phone at all.

<!-- filled by wave 4 synthesis from `### Tech lens: 3D` subsections -->

## Lighting rigs

Why: an environment map, a baked lightmap or real-time lights each fix a different look and a different cost.

## Materials

Why: the material world is the site's palette in 3D; matcap, physical and custom shaders trade realism for control.

## Camera rigs

Why: the camera is the scroll model of a 3D site; its constraints, damping and keyboard path decide whether the visitor feels guided or trapped.

## Scroll-driven scenes

Why: chapters map to camera positions, animation clips or scene swaps; the mapping is the narrative.

## Interaction and physics

Why: raycast hover, drag and physics make a scene a toy; each one needs a touch and keyboard answer.

## Teardowns

| Site | Lens summary | Signature move | Card |
|---|---|---|---|

## Recipe map

| Intent | Recipe |
|---|---|
| One hero object with inertia | [recipe:gl-hero-object-inertia] |
| Orbit model with hotspots | [recipe:gl-orbit-model-hotspots] |
| Camera on a virtual scroll | [recipe:gl-virtual-scroll-camera] |
| Quality tiers | [recipe:quality-tiers] |
| Frame-rate governor and idle gate | [recipe:gl-fps-governor-idle-gate] |

## Verify

- [ ] The largest glb and every KTX2 set are listed with their sizes in `AWARDS.md ## Budgets & tiers`; decoders are served from the site, never a CDN.
- [ ] The camera rig answers arrow keys, PageUp/PageDown and Home/End, and has a reduced-motion tier.
- [ ] Scenes mount and dispose per window; `renderer.info.memory` is flat after three route changes.

## Refuse

- A model with no beat behind it; a scene the visitor cannot leave by keyboard.
- A corpus site's model, light rig or camera path shipped as the signature: pattern pointers, never parts.
```

- [ ] **Step 5: README layout and template note**

In `references/README.md` line 7, replace `WebGL architecture, asset pipeline,` with `WebGL architecture, the three deep-mode playbooks (GSAP choreography, WebGL shaders, WebGL 3D scenes), asset pipeline,`.
In `references/sites/_TEMPLATE.md` after line 32 (`Stack with evidence, asset pipeline, …`) add a line:
```markdown
Corpus lens waves only: close this section with `### Tech lens: GSAP|WebGL|3D`, at most 50 lines each, every fact labelled.
```

- [ ] **Step 6: Verify**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
cp /tmp/claude-1000/-home-fdaiobue-projects-Pers-awards/e08d99b1-e1b8-4bf3-a8bc-aeee7c6d193b/scratchpad/lint-probe.md references/_probe.md && node scripts/lint-refs.mjs | tail -1; rm references/_probe.md /tmp/claude-1000/-home-fdaiobue-projects-Pers-awards/e08d99b1-e1b8-4bf3-a8bc-aeee7c6d193b/scratchpad/lint-probe.md
node scripts/lint-refs.mjs | tail -1
```
Expected: both `0 dangling reference(s)`.

- [ ] **Step 7: Commit**

```bash
git add references/patterns/gsap-choreography.md references/patterns/webgl-shaders.md references/patterns/webgl-3d-scenes.md references/README.md references/sites/_TEMPLATE.md
git commit -m "docs(patterns): add deep-mode playbook skeletons" -m "Co-Authored-By: <session footer>"
```

---

### Task 3: GSAP deep mode in `awards:motion`

**Files:**
- Modify: `plugins/awards/skills/motion/SKILL.md` (lines 3, 4, 37, after 69, Verify block ~247)

**Interfaces:**
- Consumes: `references/patterns/gsap-choreography.md` anchors from Task 2; `Deep modes:` line from Task 5.
- Produces: reply opener `Deep mode: gsap — <reason>` or `Deep mode: none`.

- [ ] **Step 1: Failing check**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
grep -c "Deep mode" skills/motion/SKILL.md     # 0
```

- [ ] **Step 2: Frontmatter**

Line 4: `argument-hint: "[target or feature] [--lib gsap|anime|css] [--gsap] [--score-only]"`.
Line 3 description: replace `build scroll-triggered or scrollytelling effects` with `build GSAP timelines, scroll-triggered or scrollytelling effects`, and `a two-speed contextual cursor` with `a two-speed cursor`.

- [ ] **Step 3: Arguments bullet (line 37)**

Replace `; \`--score-only\` writes the score and stops before code.` with `; \`--gsap\` forces the deep GSAP path below and \`--lib anime|css\` rules it out; \`--score-only\` writes the score and stops before code.`

- [ ] **Step 4: Deep mode section** — insert after the `Rules: at most one hero-scale moment …` paragraph (line 69), before `## Vocabulary`:

```markdown
## Deep mode: GSAP

Some sites are carried by their choreography: no canvas, or a canvas that only follows, and one GSAP architecture that holds every chapter. For those the score is not enough; the timelines themselves are designed `[pattern:gsap-choreography#timeline-architecture]`.

- **Enter** when the grammar is GSAP and any of these holds:
  - the dosage is `none` or `moments` and SIGNATURE is DOM motion, so motion carries Creativity;
  - the score needs one timeline across two or more scrubbed chapters, a Flip shared-element signature, an Observer section switcher, or SplitText beyond heading reveals;
  - the request asks for GSAP timeline or ScrollTrigger choreography, or passes `--gsap`;
  - `AWARDS.md ## Budgets & tiers` already reads `Deep modes: motion gsap`.
- **Stay standard** for a one-row component score, a motion pass that only removes generic motion, or `--lib anime|css`.
- **Record** the choice on the motion half of the `Deep modes:` line in `AWARDS.md ## Budgets & tiers` (`motion gsap` or `motion none`, with the reason), and open the reply with `Deep mode: gsap — <reason>` or `Deep mode: none`.
- **Read** `${CLAUDE_PLUGIN_ROOT}/references/patterns/gsap-choreography.md` in full, then the `### Tech lens: GSAP` subsection of the two nearest cards in its `## Teardowns` table.
- **Add to the score:** every row names its timeline and label (`master@ch2`); one master timeline per scroll model; ScrollTrigger rows record start, end, scrub, pin or sticky and snap `[pattern:gsap-choreography#scrolltrigger-configurations]`.
- **Build** step 4 below follows the timeline architecture section. API questions still go to the official GSAP skills; nothing from them is copied here.
```

- [ ] **Step 5: Verify item** — after the `- [ ] \`AWARDS.md ## Motion score\` has every row …` line add:
```markdown
- [ ] `Deep modes:` names `motion gsap` or `motion none`; in gsap mode every score row names a timeline and label, and every timeline lives in one `gsap.context()` or `gsap.matchMedia()` scope.
```

- [ ] **Step 6: Verify**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
node -e 'const t=require("fs").readFileSync("skills/motion/SKILL.md","utf8");console.log(t.match(/^description: "(.*)"$/m)[1].length)'   # ≤ 900
wc -l skills/motion/SKILL.md            # < 500
grep -n "Build order" skills/motion/SKILL.md   # confirm "step 4" exists in Build order; adjust wording if the step number differs
node scripts/lint-refs.mjs | tail -1    # 0 dangling
```

- [ ] **Step 7: Commit** `feat(motion): GSAP deep mode`.

---

### Task 4: Shader and 3D deep modes in `awards:webgl`

**Files:**
- Modify: `plugins/awards/skills/webgl/SKILL.md` (lines 3, 4, 30, 31, after 56, Verify ~215)

**Interfaces:**
- Consumes: `webgl-shaders.md`, `webgl-3d-scenes.md` anchors from Task 2; `Deep modes:` line from Task 5.
- Produces: reply opener `Deep mode: shader|3d|shader + 3d|none`.

- [ ] **Step 1: Failing check**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
grep -c "Deep mode" skills/webgl/SKILL.md   # 0
grep -n "are planned" skills/webgl/SKILL.md # line 30
```

- [ ] **Step 2: Frontmatter**

Line 4: `argument-hint: "[effect or scene] [--lib three|ogl|r3f] [--tier low|mid|high] [--shader] [--3d]"`.
Line 3 description: replace `Use when asked for 3D, WebGL, shaders` with `Use when asked for 3D, WebGL, a Three.js scene, shaders`, and delete `procedural landscapes, `.

- [ ] **Step 3: Stale recipe line (line 30)** — replace the whole bullet with:
```markdown
- Every `gl-*` folder under `${CLAUDE_PLUGIN_ROOT}/recipes/` is verified. Read `recipes/gl-dom-tethered-planes/` and `recipes/gl-fluid-wake-post/` (`main.js` and README) first: they carry the shipped conventions this skill assumes.
```
Line 31 Arguments: append `; \`--shader\` and \`--3d\` force a deep mode (below), and both may be given.`

- [ ] **Step 4: Deep modes section** — insert after the depth-ladder table (after line 56), before `## Architecture`:

```markdown
## Deep modes

Two kinds of GL site need more than this file: one where shaders carry the signature, one where a modelled scene does. Each has a playbook built from teardowns of shipped sites.

| Mode | Enter when | Read | Adds |
|---|---|---|---|
| `shader` | depth rung 1–3 and (dosage canvas-first or 100 %, or the unifier or a narrative shader is SIGNATURE); or the request names a shader, distortion, fluid, noise, a render-target transition or GL text; or `--shader` | `${CLAUDE_PLUGIN_ROOT}/references/patterns/webgl-shaders.md`, then the `### Tech lens: WebGL` of the two nearest cards in its Teardowns | the uniform contract with rest values, render-target sizes, the post chain order `[pattern:webgl-shaders#post-chains]` |
| `3d` | depth rung 4–5; or the request names a model, glTF, lighting, a camera rig or physics; or `--3d` | `${CLAUDE_PLUGIN_ROOT}/references/patterns/webgl-3d-scenes.md`, then the `### Tech lens: 3D` of the two nearest cards | the light rig, the camera rig with its keyboard path, scene windows `[pattern:webgl-3d-scenes#camera-rigs]` |

- `moments` with no shader signature stays on the standard path; so does a pass that only fixes drift, colour or disposal.
- With both modes, 3D leads and only the post-chain section of the shader playbook is read.
- Record the webgl half of `Deep modes:` in `AWARDS.md ## Budgets & tiers` (`webgl shader`, `webgl 3d`, `webgl shader + 3d` or `webgl none`, with the reason), and open the reply with `Deep mode: <mode>` or `Deep mode: none`.
```

- [ ] **Step 5: Verify items** — before `- [ ] Contract: the dosage rung …` add:
```markdown
- [ ] `Deep modes:` names the webgl mode or `none`. Shader mode: every custom material includes `colorspace_fragment`, every uniform is fed from the ticker, and the post order is written down. 3D mode: header-measured glb and KTX2 sizes are in the budget table, decoders are served from the site, and the camera rig answers the keys.
```

- [ ] **Step 6: Verify**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
node -e 'const t=require("fs").readFileSync("skills/webgl/SKILL.md","utf8");console.log(t.match(/^description: "(.*)"$/m)[1].length)'   # ≤ 900
grep -n "planned" skills/webgl/SKILL.md   # nothing
wc -l skills/webgl/SKILL.md               # < 500
node scripts/lint-refs.mjs | tail -1      # 0 dangling
```

- [ ] **Step 7: Commit** `feat(webgl): shader and 3D deep modes`.

---

### Task 5: `Deep modes:` line in the template and craft

**Files:**
- Modify: `plugins/awards/assets/templates/AWARDS.md:48`
- Modify: `plugins/awards/skills/craft/SKILL.md` (line 4, Intake step 5 ~line 81, hand-back checks lines 127–128)

**Interfaces:**
- Produces: template line `- Deep modes: motion gsap|none · webgl shader|3d|none — because …` read by Tasks 3–4.

- [ ] **Step 1: Failing check**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
grep -c "Deep modes" assets/templates/AWARDS.md skills/craft/SKILL.md   # 0 and 0
```

- [ ] **Step 2: Template** — after line 48 add:
```markdown
- Deep modes: motion gsap|none · webgl shader|3d|none — because …
```

- [ ] **Step 3: craft**

Line 4: `argument-hint: "[brief | site | component | resume | status | jury | ship] [target] [--gsap|--shader|--3d]"`.
Intake step 5: append `A \`--gsap\`, \`--shader\` or \`--3d\` argument, or a brief that asks for deep GSAP, shader or 3D work, is written to the \`Deep modes:\` line of \`## Budgets & tiers\` now; motion and webgl confirm or set it themselves.`
Hand-back checks: append to the "After motion:" bullet `; the \`Deep modes:\` line names \`motion gsap\` or \`motion none\``; append to the "After webgl:" bullet `; the \`Deep modes:\` line names the webgl mode or \`none\`, and in a deep mode the playbook's Verify items are ticked`.

- [ ] **Step 4: Verify**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
grep -c "Deep modes" assets/templates/AWARDS.md skills/craft/SKILL.md   # 1 and ≥ 3
node evals/selftest.mjs | tail -1    # 0 defective (template change must not make a file-target grader pass untouched input)
claude plugin validate .
```

- [ ] **Step 5: Commit** `feat(craft): record deep modes in AWARDS.md`.

---

### Task 6: Deep-mode routing evals

**Files:**
- Create: `plugins/awards/evals/trigger-motion-gsap-deep/{case.yaml,prompt.md,graders/skill-fired.md,graders/playbook-read.md,graders/mode-named.md}`
- Create: same set for `trigger-webgl-shader-deep` and `trigger-webgl-3d-deep`
- Modify: `plugins/awards/evals/README.md:5`

- [ ] **Step 1: `trigger-motion-gsap-deep`**

`case.yaml`:
```yaml
schema_version: "1.1"
name: trigger-motion-gsap-deep
tags: [smoke, deep]
```
`prompt.md`:
```markdown
---
description: "A choreography-led launch page should route to motion and take its GSAP deep path."
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm planning an award-level launch page with no 3D at all: the motion is the whole show. One scroll-scrubbed story carries three pinned chapters, headings split into lines that unmask as they arrive, and a grid image that flies into the detail view when clicked. Before any code, lay out the timelines, labels and triggers for the whole page.
```
`graders/skill-fired.md`:
```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:awards:)?(?:motion)"'
---
```
`graders/playbook-read.md`:
```markdown
---
type: regex
pattern: '"file_path"\s*:\s*"[^"]*gsap-choreography\.md"'
target: trace
---

Anchored to the Read tool's input: the loaded skill body itself names the playbook path, so a bare trace match would pass without the file ever being read.
```
`graders/mode-named.md`:
```markdown
---
type: regex
pattern: 'Deep mode:?\W{0,4}gsap'
target: last_message
flags: i
---
```

- [ ] **Step 2: `trigger-webgl-shader-deep`** — same files with:
`case.yaml` name `trigger-webgl-shader-deep`, tags `[smoke, deep]`.
`prompt.md` description `"A shader-led hero should route to webgl and take its shader deep path."`, body:
```markdown
I want an award-level hero that is one fullscreen noise gradient the pointer stirs like ink, with a film-grain pass on top, and a dissolve through render targets into the next section. Explain the architecture and the fallbacks before writing code.
```
`skill-fired.md` matching `(?:webgl)`; `playbook-read.md` pattern `'"file_path"\s*:\s*"[^"]*webgl-shaders\.md"'`; `mode-named.md` pattern `'Deep mode:?\W{0,4}shader'`.

- [ ] **Step 3: `trigger-webgl-3d-deep`** — same files with:
name `trigger-webgl-3d-deep`; description `"A modelled product scene should route to webgl and take its 3D deep path."`; body:
```markdown
Plan an award-level product page built around one scroll-driven scene: a glTF model of the product under studio lighting, with the camera travelling around it through three chapters. Walk me through the asset pipeline, the lights, the camera rig and the fallbacks before any code.
```
`skill-fired.md` matching `(?:webgl)`; `playbook-read.md` pattern `'"file_path"\s*:\s*"[^"]*webgl-3d-scenes\.md"'`; `mode-named.md` pattern `'Deep mode:?\W{0,4}3d'`.

- [ ] **Step 4: README count** — `evals/README.md` line 5: replace `**smoke** (17 cases, read-only, cheap): eleven requests that must route to the right skill — one per skill — and six that` with `**smoke** (20 cases, read-only, cheap): eleven requests that must route to the right skill — one per skill —, three that must take a deep mode (\`--tag deep\`), and six that`.

- [ ] **Step 5: Verify (free)**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
grep -ilE "awards:|deep mode|--gsap|--shader|--3d" evals/trigger-*-deep/prompt.md   # nothing: prompts name no skill or mode
node evals/selftest.mjs | tail -1      # 0 defective
claude plugin validate .
```

- [ ] **Step 6: Commit** `test(evals): deep-mode routing cases`.

- [ ] **Step 7: Paid run (ask the user first)**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
claude plugin eval . --tag deep --runs 3 --ablation none
```
Expected: each case ≥ 2/3 on all three graders. If `skill-fired` fails because an official `gsap-*` skill took the request, record it in `docs/handoff/todo.md`; do not stuff the description past 900 characters.

---

### Task 7: Corpus wave 4 (maintainer run)

**Files:** written by `/expand-corpus` itself: `docs/handoff/corpus-ledger.md`, `plugins/awards/references/sites/*.md`, `_index.md`, the three playbooks, `references/patterns/*.md`, `recipes/*/recipe.json` `seenIn`, `awardsworthysites.md`, `docs/handoff/recipe-proposals-*.md`, new `recipes/<id>/`, `references/stacks/*`.

- [ ] **Step 1: Setup** — run `/expand-corpus --phase setup` on `feat/deep-modes`. Expected: doctor PASS, `## Wave 4` with the nine-column Sites table, commit `docs(corpus): open wave 4 ledger`. Add under `### Notes`: `oxigen: dropped from the queue by the maintainer 2026-10-05; wave 3 row stays blocked.`
- [ ] **Step 2: Pilot** — `/expand-corpus --only edolus,abatable,why-zero`. Expected: 17 queued rows; `edolus` `Lens 3D, WebGL`; `why-zero` Reason `existing card`. Stop at the narrowed-run report; review per-lens gate decisions and teardown line counts with the user. Any card write refused → main session writes it from the `===CARD START===` block; tell the user and offer accept-edits mode.
- [ ] **Step 3: Full triage** — `/expand-corpus` (un-narrowed). Run the heaviest 3D sites (`ascension-pegassi`, `cutobot-byholm`, `a24-raviklaassens`) in the first batch. Expected: every row `added`, `skipped`, `failed` or `blocked` with reason; card checks pass, including the lens grep.
- [ ] **Step 4: Synthesis** — fills the three playbooks' content sections and Teardowns tables. Check `git diff plugins/awards/references/patterns/` for duplicated effect rows (one fact one place) and labels on every added claim.
- [ ] **Step 5: Recipes** — proposals with `Lens:`; user picks per lens; one subagent per recipe; then full `verify-recipes` and `audit.mjs recipes` (P0–P2 = 0); counts updated.
- [ ] **Step 6: Stacks** — notes for new libraries hit (for example a physics library or OGL recipe pin) with pins in `versions.md` and `recipes/package.json` in sync.
- [ ] **Step 7: Upkeep** — grader slugs regenerated; lens recipe rows added to playbook `## Recipe map` and to the motion/webgl recipe tables; checks pass.

---

### Task 8: Docs, decisions, release 0.5.0

**Files:**
- Modify: `docs/handoff/decisions.md` (new section after line 22)
- Modify: `CLAUDE.md` (routing case count line in Commands; Architecture skills paragraph)
- Modify: `README.md` (skills rows for motion and webgl; status entry; version)
- Modify: `docs/handoff/state.md` (header), `docs/handoff/todo.md`
- Modify: `plugins/awards/.claude-plugin/plugin.json`, `plugins/awards/.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json` (version)

- [ ] **Step 1: decisions.md** — insert before `## Architectural`:
```markdown
## Taken with the user (2026-10-05, deep modes)

| Topic | Choice | Declined |
|---|---|---|
| Shape | deep modes of `motion` (`--gsap`) and `webgl` (`--shader`, `--3d`) | three new triggerable skills: routing competition with motion and webgl, broken trigger evals, the eleven-skill decision |
| Activation | automatic from the contract, dosage or score, plus a flag; recorded on the `Deep modes:` line of `AWARDS.md ## Budgets & tiers` | flag only; automatic only |
| Analysis | corpus wave 4 with a tech lens; teardown as `### Tech lens:` at the end of card §5 | a separate tech study; teardown files beside cards; a §10 |
| Playbooks | `references/patterns/gsap-choreography.md`, `webgl-shaders.md`, `webgl-3d-scenes.md` | a new `references/playbooks/` folder (no lint form) |
| oxigen.sa | dropped from the queue | a real-GPU retry |
```

- [ ] **Step 2: CLAUDE.md** — Commands: `11 routing cases` → `14 routing cases` on the smoke line, and add a line `claude plugin eval . --tag deep --runs 3 --ablation none        # 3 deep-mode routing cases (costs money)`. Architecture, after the eleven-skills sentence: `\`motion\` and \`webgl\` carry deep modes (\`--gsap\`, \`--shader\`, \`--3d\`) that load \`references/patterns/gsap-choreography.md\`, \`webgl-shaders.md\` or \`webgl-3d-scenes.md\`; they are modes, not skills, and record themselves on the \`Deep modes:\` line of \`AWARDS.md\`.`

- [ ] **Step 3: README.md** — motion and webgl rows of the skills table mention their flags; `README.md:117` routing count `seventeen` → `twenty` (eleven + three deep + six negatives); add a `0.5.0` status entry naming the deep modes and wave 4's card, lens and recipe counts (take numbers from the ledger); version string to `0.5.0`.

- [ ] **Step 4: state.md and todo.md** — header `## Unreleased — deep modes (branch feat/deep-modes)` with what landed and the eval result; todo: blocked wave 4 sites needing a real GPU, any routing loss to the official GSAP skills.

- [ ] **Step 5: Version bump** — `"version": "0.4.0"` → `"0.5.0"` in the three manifests; recipe counts in their descriptions match the recipes phase.

- [ ] **Step 6: Verify**

```bash
cd /home/fdaiobue/projects/Pers/awards
grep -n '"version"' plugins/awards/.claude-plugin/plugin.json plugins/awards/.codex-plugin/plugin.json .claude-plugin/marketplace.json   # all 0.5.0
node plugins/awards/scripts/lint-refs.mjs | tail -1
claude plugin validate plugins/awards
```

- [ ] **Step 7: Commit** docs as `docs: record deep modes`, then the bump alone as `chore(release): 0.5.0`.

---

### Task 9: Whole-branch verification

- [ ] **Step 1: Free checks**

```bash
cd /home/fdaiobue/projects/Pers/awards
P=plugins/awards
node $P/scripts/lint-refs.mjs | tail -1                     # 0 dangling
claude plugin validate $P
node $P/evals/selftest.mjs | tail -1                        # 0 defective
wc -l $P/skills/{motion,webgl,craft}/SKILL.md               # each < 500
for s in motion webgl craft; do node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");console.log(process.argv[1],t.match(/^description: "(.*)"$/m)[1].length)' $P/skills/$s/SKILL.md; done   # ≤ 900
for f in $(grep -l '^### Tech lens:' $P/references/sites/*.md); do echo "$f $(grep -c '^### Tech lens:' $f) $(wc -l < $f)"; done   # every lens card < 200 lines
(cd $P/recipes && AWARDS_PLAYWRIGHT="$HOME/.npm/_npx/e41f203b7505f1fb" node ../scripts/verify-recipes.mjs) && (cd $P && node scripts/audit.mjs recipes)   # all pass; P0–P2 = 0
node $P/evals/codex-install.mjs --build
git log main..HEAD --format=%B | grep -v '^Co-Authored-By' | grep -iE 'opus|sonnet|haiku|claude-[0-9]|gpt-'   # nothing
```

- [ ] **Step 2: Paid regression (ask the user first)**

```bash
cd /home/fdaiobue/projects/Pers/awards/plugins/awards
claude plugin eval . --case trigger-motion --runs 3 --ablation none --scaffold
claude plugin eval . --case trigger-webgl-hero --runs 3 --ablation none --scaffold
```
Expected: no regression against 0.4.0.

- [ ] **Step 3:** whole-branch review (superpowers:requesting-code-review), then superpowers:finishing-a-development-branch.
