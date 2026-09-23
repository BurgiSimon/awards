# Visual Composition Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five composition recipes, one complete illustrated example, visual planning evidence, and a fair three-brief comparison against the current Awards plugin.

**Architecture:** Reuse the vanilla Vite recipe contract, shared tokens, automatic entry discovery, capture tool, and existing jury/ship loop. Five standalone examples contribute namespaced CSS to a sixth complete page; selected real captures and adjacent annotations become portable planning references. Keep the six-build comparison file-based and separate from routing evals.

**Tech Stack:** Semantic HTML, CSS Grid, native picture/details elements, existing Node built-ins, Vite, and Playwright. Image generation supplies original demo assets during execution; no new npm dependencies.

**Spec:** [Visual Composition Library — Design](../specs/2026-09-22-visual-composition-design.md).

**Status:** Tasks 1–11 are implemented and reviewed in the selected editorial furniture/materials direction. All six Task 12 builds and common technical checks are complete against frozen candidate `ae29ca6`; two candidate outputs fail the accessible-primary-action gate. Simon's 2026-09-23 choices meet the visual thresholds (two candidate Overall wins, one tie; all Mobile ties), but all requested reasons remain blank. Whole-branch and final fix reviews are complete, the reviewed implementation is in the original working tree, and the three post-pilot corrections have local regression evidence. See the [comparison record](../../handoff/visual-comparison-2026-09-22.md).

## Global Constraints

- Preserve all eleven skill names, existing standalone scopes, phase order, and the default vanilla Vite stack.
- Use Node 20.19+ on the 20.x line, or 22.12+, and the existing pinned recipe dependencies; add no npm dependency.
- Use native HTML/CSS for the five new recipes; no WebGL, new animation library, component framework, or custom renderer.
- Keep the existing recipe contract: index.html, main.js, style.css, README.md, recipe.json, verify.mjs, and window.__awards.
- Keep the current jury weights, thresholds, and maximum of two formal jury rounds per build.
- Ship no font files and no copied reference-site imagery, copy, or layouts. Demo fonts remain system stacks.
- Label invented brands, specifications, and generated imagery as synthetic demonstration material in the accompanying documentation.
- Store no model identifiers in committed files; raw execution metadata stays outside the repository.
- Run browser verification serially. Headless captures prove rendering and behavior, not real-device performance.

---

## Execution map

Tasks 1–2 establish the baseline and repair knowledge. Tasks 3–9 create the visual library. Task 10 connects it to the planning/review flow. Tasks 11–12 verify and compare outcomes. Commit each reviewed deliverable during execution using the session's required attribution; do not commit raw model traces, generated build directories, or unrelated edits.

All plugin-relative paths below start at `plugins/awards/`. Set `AWARDS_REPO` to the execution checkout and `AWARDS_PLUGIN="$AWARDS_REPO/plugins/awards"`; these are task-specific variables, not replacements for HOME or CODEX_HOME.

Before implementation, use the git-worktrees skill if isolation is needed. The frozen comparison baseline remains `4f348dc5ea850d9657af27ce28c17e11884f02d6`, even if planning documents receive a later commit.

## Task 1: Freeze the comparison protocol, input assets, and baseline

**Files:** create `evals/visual/README.md`, `evals/visual/review-template.md`, `evals/visual/inputs.json`; create `evals/visual/{kiln-nine,tidal-notes,form-sound}/{prompt.md,content.md,ASSETS.md}` and each case's `assets/` files. Baseline archive and raw runs live outside the repository.

**Interfaces:** consumes the spec's three cases and baseline revision; produces identical hashed inputs for both arms, a frozen baseline plugin, and a review form independent of candidate changes.

- [x] Record the chosen execution allowance before any paid call: proposed six calls at USD 35 each, USD 210 total planned build allowance, plus separate asset-generation usage. Planning does not authorize running them now.
- [x] Archive the exact baseline to a new directory outside the repository. Refuse to reuse a nonempty snapshot directory. Use the baseline CLI to scaffold one common Vite starter, install its pinned dependencies once, and freeze the resulting lockfile. Each run receives the same starter/lockfile and its own project-local installation.

```sh
AWARDS_BENCH_ROOT=$(mktemp -d /tmp/awards-visual.XXXXXX)
mkdir "$AWARDS_BENCH_ROOT/baseline"
git archive 4f348dc5ea850d9657af27ce28c17e11884f02d6 plugins/awards \
  | tar -x -C "$AWARDS_BENCH_ROOT/baseline"
```

- [x] Write the three prompts before candidate changes. Each asks for an award-worthy complete site, names the supplied `content.md`/`assets/`, requests recorded assumptions without questions, and requires building/capturing the result. Each prohibits new asset generation, external reference browsing, fabricated endorsements, and copying the demo brand. Preserve the modes and content below:

| Case | Required content/action | Required assets |
|---|---|---|
| `kiln-nine` | Three fictional ceramic pieces, dimensions in cm, material/care information, enquiry action | `collection.webp`, `glaze-detail.webp` |
| `tidal-notes` | Six fictional journal entries across Coast/Materials/People, reading times, visible index, a substantial article excerpt | `coast.webp`, `shore-detail.webp` |
| `form-sound` | Three-day fictional program, daily schedule, venue/access information, visible booking action | `poster.svg`, `mark.svg` |

- [x] Supply original, decodable artwork and honest provenance. Use the image-generation skill for raster creation and a single consistent brief per pair; the SVGs are original graphic assets. Keep each file below 1 MiB. Do not reuse the existing zero-byte eval JPG/PNG fixtures.
- [x] Write `inputs.json` with each case's prompt/content/assets paths and SHA-256 values. The inventory includes every file read by a build, including the common starter and dependency lockfile stored with the benchmark archive. Keep raw backend identifiers outside the repository.
- [x] Prove input integrity before accepting this task: read every listed file, assert a nonzero size, recompute its SHA-256 with `node:crypto`, and open the four raster images plus two SVGs in a browser/image viewer. Equal hashes establish equal inputs; file existence alone does not.
- [x] Write the blind review form now: Composition, Typography, Imagery, Distinctiveness, Mobile, Overall; each gets `A / B / tie`, one visible reason, and a technical-eligibility result. Do not reveal plugin version or its self-jury scores in the review sheet.
- [x] Commit the protocol and inputs. The six model builds run only in Task 12, after both plugin snapshots are fixed.

## Task 2: Reconcile derived guidance and the unmeasured jury branch

**Files:** modify `references/patterns/{color-and-material,typography,components-catalog}.md`, `references/craft-floor.md`, `skills/{system,jury,craft}/SKILL.md`, `agents/awards-jury.md`, `references/jury/report-template.md`, `assets/templates/jury-report.md`, `evals/jury-generic-saas/graders/scores-present.md`; create `evals/jury-evidence-selftest.mjs`.

**Interfaces:** consumes corrected `sites/the-line.md` and `sites/mindmarket.md`; produces consistent factual guidance and two explicit report branches: scored rendered evidence, or unmeasured `recapture`.

- [x] Read every consumer of the relevant claims using `rg -n 'greyscale|grayscale|48 countries|48-country|nothing between|20 : 1|source.only|nothing gets scored' plugins/awards`. Limit edits to the four disagreement groups in the spec and their direct consumers.
- [x] Add an assertion-based grader check that extracts the actual `pattern`/`flags` from `scores-present.md` and tests these four messages. Initially, the unmeasured positive must fail. Keep this separate from `selftest.mjs`, which intentionally tests file-target graders only.

```js
const measured = 'disposition: fix\nDesign 7.4 · Usability 7.2 · Creativity 7.0 · Content 7.1 — weighted 7.24';
const missing = 'disposition: recapture\nDesign unmeasured · Usability unmeasured · Creativity unmeasured · Content unmeasured — weighted unmeasured';
assert.equal(matches(measured), true);
assert.equal(matches(missing), true);
assert.equal(matches(measured.replace('disposition: fix', 'disposition: recapture')), false);
assert.equal(matches(missing.replace('disposition: recapture', 'disposition: ship')), false);
```

Implement local `matches(text)` by reading the grader's YAML frontmatter with the same `field`/unquote approach as `evals/selftest.mjs` and constructing `new RegExp(pattern, flags)`. Add a fifth rejection for mixed numeric/unmeasured axes.

- [x] Make the grader's two branches bind disposition to the immediately following score line. The rendered branch accepts only `ship|fix|rebuild` and four numbers plus a numeric weighted value; the missing branch accepts only `recapture` and the exact all-unmeasured line. Use multiline line anchors, not a loose alternative matching the word `unmeasured` anywhere.
- [x] Replace source-only scoring instructions in both jury definitions. Propagate `unmeasured` to the report template, jury log, and craft's final relay. Visual memory/fidelity and developer scores stay unmeasured; located source findings remain useful under a separate heading. Preserve the component mode's D/U/C scope in both measured and unmeasured reporting.
- [x] Replace the imagery rule with this guidance: “Choose a treatment from the subject and the supplied images. Preserve useful color differences; selective desaturation or overprint is an optional unifying treatment. The Line's acetate is local, not a site-wide greyscale policy.” Correct the nearby red-only-at-bookends claim.
- [x] Correct the typography evidence to the card's eight-step ladder. Describe 20:1 contrast as a poster-oriented example, permit intermediate headings for reading/specifications, and choose leading from rendered glyphs. Keep the existing accessibility and loading requirements.
- [x] Mark the MindMarket map dataset clone-derived/recalled-low and not verified on the live site. Preserve the generic map pattern without presenting clone data as live evidence.
- [x] Run `node plugins/awards/evals/jury-evidence-selftest.mjs`, `node plugins/awards/evals/selftest.mjs`, and `node plugins/awards/scripts/lint-refs.mjs`. Review the changed prose against the corrected cards; do not claim semantic consistency from link lint alone. Commit.

## Task 3: Create the original asset family and shared visual/test primitives

**Files:** create `recipes/_shared/composition.css`, `recipes/_shared/composition/ASSETS.md`, the five image files named in the spec, and `recipes/_shared/verify-layout.mjs`; update both `NOTICE.md` copies with the demo assets' provenance.

**Interfaces:** produces the five asset paths, standard tokens, self-contained `probeLayout()` and `assertLayout(results)` exports. These are consumed by all six entries.

- [x] Use the image-generation skill to create the bench's first view, inspect it, and use it as the reference for the remaining views. Record subject, material, lighting, camera, crop, intended role, and synthetic provenance. Inspect the set together and replace any view that changes the product's geometry/material. Do not make website screenshots with image generation.
- [x] Export the five assets at their intended sizes under 1 MiB each. Confirm actual pixel dimensions and decoding; record the dimensions used in HTML. Avoid text embedded in the product photographs.
- [x] Define example token overrides in `composition.css`, including a serif display, neutral system body, warm ground, dark brown ink, one clay accent, 16–18 px body text, an intermediate heading, 48rem breakpoint, and a maximum prose measure. Compute contrast for the actual selected colors. Keep colors original and document why they serve this fictional subject.
- [x] Each standalone stylesheet imports `../_shared/base.css` first, then `../_shared/composition.css`, before its namespaced component rules. Override `color-scheme` for this light example and use the new type primitives rather than the old `.display` class's tight leading. Leave existing shared tokens unchanged.

```css
:root {
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --display: clamp(3rem, 6.5vw, 6rem);
  --heading: clamp(1.75rem, 3vw, 3rem);
  --measure: 64ch;
}
.composition-title { font: 400 var(--display)/1.05 var(--font-display); letter-spacing: -.025em; }
.composition-heading { font: 400 var(--heading)/1.12 var(--font-display); }
.composition-copy { max-width: var(--measure); line-height: 1.6; }
```

- [x] Define `probeLayout()` entirely within its function body because Playwright serializes it into the browser. It returns `overflow`, `h1Count`, `brokenVisibleImages`, `unresolvedFragments`, and `boxes` for `[data-layout]` elements. `boxes` stores `{x,y,width,height}` by the element's data value.

```js
export function probeLayout() {
  const visible = el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  };
  return {
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    h1Count: document.querySelectorAll('h1').length,
    brokenVisibleImages: [...document.images]
      .filter(img => visible(img) && (!img.complete || !img.naturalWidth))
      .map(img => img.getAttribute('src')),
    unresolvedFragments: [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href').slice(1))
      .filter(id => id && !document.getElementById(id)),
    boxes: Object.fromEntries([...document.querySelectorAll('[data-layout]')].map(el => {
      const r = el.getBoundingClientRect();
      return [el.dataset.layout, {x:r.x, y:r.y, width:r.width, height:r.height}];
    })),
  };
}
export function assertLayout(results) {
  return Object.entries(results).flatMap(([name, {probe}]) => [
    {ok: !!probe && !probe.overflow, message: `${name}: no horizontal overflow`},
    {ok: probe?.h1Count === 1, message: `${name}: one h1`},
    {ok: probe?.brokenVisibleImages?.length === 0, message: `${name}: visible images loaded`},
    {ok: probe?.unresolvedFragments?.length === 0, message: `${name}: local links resolve`},
  ]);
}
```

- [x] Re-export `probeLayout` as each verifier's `probe`. Register recipe-specific metrics through the existing `awards.addState(fn)` in `main.js`, before `awards.ready()`, and assert them through `results[stateName].state`. Do not wrap `probeLayout()` in a browser function that calls an imported helper: Playwright serialization loses that closure. A missing metric or `stateError` fails the relevant check. The full composition registers the metrics it uses explicitly; do not import standalone `main.js` files.
- [x] Exercise `assertLayout()` once with an overflow result, once with a broken-image result, and once with a passing result using Node assertions. Browser integration is verified by the next task; do not add a test framework.
- [x] Commit only shared source/assets and the narrow helper. Do not modify the existing global demo tokens or the 30 old recipes.

## Task 4: Build the typography specimen

**Files:** create `recipes/typography-specimen/{index.html,main.js,style.css,README.md,recipe.json,verify.mjs}`.

**Interfaces:** consumes shared composition tokens and layout probe; produces `.type-specimen` styles, identical-copy poster/editorial/technical examples, and documented type decisions for `system`.

- [x] Create the six-file entry with a minimal runnable document and hook, then `verify.mjs` with desktop top/middle/end, mobile top/middle/end, and reduced-motion states. Export `probeLayout` as `probe` and call `assertLayout`. Add state metrics for the required specimen text and clipped ancestors of resting `.type-specimen` text. Confirm the content check fails while the specimen is absent; a discovery/build error is not the intended negative check. Automated mask detection supplements the required glyph inspection.
- [x] Write a complete semantic demo with one h1 and three sections using the same text: “Made to stay in use.”, “A clear form, a repairable joint, and a surface that records daily life.” Include the glyph diagnostic strings from the spec, a paragraph, list, caption, and figures with units. Do not use dummy prose.
- [x] Give the three sections distinct hierarchy and density through namespaced classes, while keeping the same content. Use the shared `.composition-title`/`.composition-heading` primitives for the editorial variant. Explain the difference between font character and hierarchy.
- [x] Use this minimum readiness code in the demo's `main.js`; static content must render before it runs:

```js
import { awards } from '../_shared/awards-hook.js';
await document.fonts.ready;
awards.ready();
```

- [x] Fill metadata with `id: typography-specimen`, original title, `tags: [typography, hierarchy, layout, static]`, `deps: []`, `tier: P0`, `variants: [vanilla]`, real supporting site slugs under `seenIn`, and `verified: null` until the verifier passes. Explain original authorship separately from `seenIn` evidence.
- [x] Run the focused verifier, then inspect every generated frame for full descenders/diacritics, line breaks, readable labels, and hierarchy. Document actual settings and commit.

```sh
node plugins/awards/scripts/verify-recipes.mjs --only typography-specimen
```

## Task 5: Build the responsive art-directed hero

**Files:** create `recipes/responsive-art-directed-hero/{index.html,main.js,style.css,README.md,recipe.json,verify.mjs}`.

**Interfaces:** consumes hero-wide/hero-portrait and shared type tokens; produces `.art-hero` and markers `hero-copy`/`hero-media`, used unchanged by the full page.

- [x] Create the runnable six-file entry and verifier states for desktop, mobile, and reduced motion. Reuse the layout probe and register hero state with `awards.addState(() => ({ heroSource: document.querySelector('.art-hero img')?.currentSrc ?? null }))`. Assert the desktop/mobile states select the intended wide/portrait source and decode successfully. Confirm the source-selection check fails without the portrait `<source>` before adding it; do not count a missing-entry error as verification.
- [x] Implement the native picture and meaningful reading order:

```html
<section class="art-hero" aria-labelledby="hero-title">
  <div data-layout="hero-copy">
    <h1 id="hero-title" class="composition-title">Made to stay in use.</h1>
    <p class="composition-copy">One oak bench. Repairable joints. Room for everyday life.</p>
    <a href="#specification">See dimensions and materials</a>
  </div>
  <picture data-layout="hero-media">
    <source media="(max-width: 47.999rem)" srcset="../_shared/composition/hero-portrait.webp">
    <img src="../_shared/composition/hero-wide.webp" alt="The fictional oak bench in a daylight interior" fetchpriority="high" decoding="async">
  </picture>
</section>
```

Add actual width/height attributes from the asset record; reserve both aspect ratios in CSS. Provide the `#specification` target in the standalone demo.

```css
.art-hero { display:grid; grid-template-columns:1fr 1.15fr; gap:var(--gutter); align-items:center; }
.art-hero img { width:100%; height:100%; object-fit:cover; }
.art-hero picture { aspect-ratio:8/5; }
@media (max-width:47.999rem) {
  .art-hero { grid-template-columns:1fr; }
  .art-hero picture { aspect-ratio:4/5; }
}
```

- [x] Keep headline/action before the image in both DOM and visual order for this example; explain that choice. Tune focal positions from the actual assets instead of guessing percentages.
- [x] Add the same four-line readiness module, complete recipe metadata/README, run `verify-recipes.mjs --only responsive-art-directed-hero`, and inspect both crops. Commit.

## Task 6: Build the editorial image/text composition

**Files:** create `recipes/editorial-image-text/{index.html,main.js,style.css,README.md,recipe.json,verify.mjs}`.

**Interfaces:** consumes joinery-detail/workshop and shared tokens; produces `.editorial-feature` and markers `editorial-figure`/`editorial-copy`.

- [x] Create the runnable six-file entry and desktop/mobile/reduced-motion verification with common layout checks and geometry assertions: desktop text and figure occupy separate columns; mobile text follows the figure/caption without overlap. Check the desktop-column assertion fails on the unstyled semantic markup, then add the layout.
- [x] Implement a figure/caption and real explanatory copy headed “The joint is the detail.” Describe the fictional repairable construction in two short paragraphs, followed by a quieter note. Put the figure and caption before the text in DOM order.

```css
.editorial-feature { display:grid; grid-template-columns:1.35fr 1fr; gap:var(--gutter); align-items:start; }
.editorial-feature figure { margin:0; }
.editorial-feature figcaption { margin-top:calc(var(--unit) * 3); }
.editorial-feature .composition-copy { max-width:58ch; }
@media (max-width:47.999rem) { .editorial-feature { grid-template-columns:1fr; } }
```

- [x] Use the shared readiness module, explicit image dimensions, meaningful alt/caption, native lazy loading below the first viewport, and real local anchor targets. Keep styles scoped to `.editorial-feature`.
- [x] Complete metadata and explain alignment, column ratio, figure/caption relationship, and phone order in README. Run `verify-recipes.mjs --only editorial-image-text`, inspect all frames, and commit.

## Task 7: Build the product specification section

**Files:** create `recipes/product-specification/{index.html,main.js,style.css,README.md,recipe.json,verify.mjs}`.

**Interfaces:** consumes product-side and shared tokens; produces `.product-spec`, `#specification`, a six-pair `<dl>`, and native care disclosure.

- [x] Create the runnable six-file entry. Register `careOpen`, specification term/description counts, and specification text through `awards.addState`. Write layout checks plus a keyboard state that focuses `#care-summary`, presses Enter, and verifies `careOpen`. Count six terms/descriptions, assert unit strings remain in DOM text, and test the primary enquiry fragment resolves. Confirm missing specification content fails before supplying it.

```js
{ name:'care-keyboard', actions:[
  {type:'focus', selector:'#care-summary'},
  {type:'press', key:'Enter'},
] }
```

Omit `scroll` on focus/keyboard states so the verifier does not scroll away after the action. Repeat the disclosure state with `viewport: 'mobile'`.

- [x] Supply explicitly fictional specifications: width 140 cm, depth 38 cm, height 45 cm, white oak, repairable mechanical joints, and hardwax-oil finish. Keep measurement labels and units in text, not CSS pseudo-elements. Provide brief care prose within `<details id="care-details"><summary id="care-summary">Care and repair</summary>...</details>`.

```css
.product-spec dl { display:grid; grid-template-columns:minmax(9rem, 1fr) 2fr; }
.product-spec dt, .product-spec dd { margin:0; padding-block:calc(var(--unit) * 4); border-bottom:1px solid var(--line); }
@media (max-width:47.999rem) {
  .product-spec dl { grid-template-columns:1fr; }
  .product-spec dt { padding-bottom:0; border-bottom:0; }
}
```

- [x] Add the product profile image, readiness module, complete metadata and contextual README. Run `verify-recipes.mjs --only product-specification`, inspect disclosure/facts on both widths, and commit.

## Task 8: Build the designed footer

**Files:** create `recipes/designed-footer/{index.html,main.js,style.css,README.md,recipe.json,verify.mjs}`.

**Interfaces:** consumes shared tokens/type primitives; produces `.designed-close`, `#enquire`, section links and a native `#top` action.

- [x] Create the runnable six-file entry and common layout checks. Register the primary link's accessible text, focus status, bounding box, and computed outline through `awards.addState`; use a keyboard state focusing the link, with no subsequent `scroll` value. Assert a nonempty name, visible focus styling, and at least a 44×44 CSS-pixel target, then inspect its actual focus frame. Verify missing fragment targets fail before adding them.
- [x] Build a footer headed “Make room for something lasting.” Use `mailto:studio@alder.example`, links to Materials/Specifications/Care, a small fictional-demo colophon, and back-to-top. Test focus only; do not send email or create a fake form submission.

```css
.designed-close { padding:calc(var(--unit) * 20) var(--gutter); }
.designed-close nav { display:flex; flex-wrap:wrap; gap:calc(var(--unit) * 6); }
.designed-close a { display:inline-flex; align-items:center; min-width:44px; min-height:44px; }
.designed-close .composition-title { max-width:15ch; }
```

- [x] Give the standalone demo enough preceding content to show its relationship to a page ending, with real local fragment targets. Keep a single h1 outside the footer and use h2 for the closing statement.
- [x] Add readiness, metadata, README, then run `verify-recipes.mjs --only designed-footer`. Inspect mobile wrapping, footer contrast, focus, and the final viewport. Commit.

## Task 9: Compose the full page and publish actual visual evidence

**Files:** create `recipes/complete-editorial-composition/{index.html,main.js,style.css,README.md,recipe.json,verify.mjs,capture-states.json}`; add `visuals/` images and metadata to all six new entries; modify `scripts/lint-refs.mjs`; create `evals/visual-library-selftest.mjs`.

**Interfaces:** consumes all five namespaced component styles and shared assets; produces a whole page, selected original captures, optional `recipe.json.visuals`, and verified local visual references.

- [x] Create the complete page in this order: hero → editorial material story → specification → short typography-led care statement → close. Include header, skip link, `main`, one h1, semantic sections, and footer. Reuse the same component selectors and import their styles:

```css
@import '../responsive-art-directed-hero/style.css';
@import '../editorial-image-text/style.css';
@import '../product-specification/style.css';
@import '../typography-specimen/style.css';
@import '../designed-footer/style.css';
```

Keep demo-only chrome under `[data-demo]` in standalone pages so it does not affect this page. Fix shared component CSS at its source instead of adding composition-only overrides.

- [x] Add verifier states for desktop/mobile top/middle/end, reduced motion, and care-open. Confirm all five sections render with no missing images or unresolved fragments, and disclosure works from the keyboard.
- [x] Capture the composition at 320×844 and 768×1024 with the existing custom viewport flags, in addition to the standard desktop/mobile verifier. Inspect narrow/tablet images for overflow, crop, order, and intact glyphs. Do not extend the verifier's viewport schema just for this batch.

```sh
node plugins/awards/scripts/verify-recipes.mjs --only complete-editorial-composition
npm --prefix plugins/awards/recipes run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

Keep preview in a managed background session, wait for its ready URL, then run the captures serially in another shell. Serve the full `dist/` root: passing the nested HTML file directly to `capture.mjs` would hide sibling Vite assets. Use fresh output directories and stop the preview session afterward.

```sh
AWARDS_NARROW_CAPTURE=$(mktemp -d /tmp/awards-composition-320.XXXXXX)
AWARDS_TABLET_CAPTURE=$(mktemp -d /tmp/awards-composition-768.XXXXXX)
node plugins/awards/scripts/capture.mjs http://127.0.0.1:4174/complete-editorial-composition/index.html --only desktop --desktop 320x844 --scroll 0,50,100 --out "$AWARDS_NARROW_CAPTURE"
node plugins/awards/scripts/capture.mjs http://127.0.0.1:4174/complete-editorial-composition/index.html --only desktop --desktop 768x1024 --scroll 0,50,100 --out "$AWARDS_TABLET_CAPTURE"
```

- [x] Publish reviewed desktop/mobile images under each entry's `visuals/`. Publish middle/close pairs for the complete page too. Use real browser screenshots; image generation is for source artwork only. When necessary, use Playwright's native JPEG screenshot output to meet the image budget and update paths consistently.
- [x] Add `## Visual notes` with adjacent images and five specific observations per viewport: hierarchy, alignment, crop, measure/whitespace, and responsive recomposition. Name the capture environment/date. Describe a failure alternative and what must change when adapting the recipe to a new subject.
- [x] Add the spec's optional `visuals` object to each new `recipe.json`. Keep the old entries compatible without it. Extend `lint-refs.mjs` to require declared visual paths to stay inside the recipe directory, refer to nonempty supported image files, and resolve the notes file/heading. Reject absolute paths, `..` escapes, missing images, empty files, malformed metadata, and absent headings with a located diagnostic.
- [x] Add `visual-library-selftest.mjs`: stage a minimal plugin fixture in an OS temporary directory, copy the linter script into its `scripts/`, and test valid metadata, absent optional metadata, a missing image, an empty image, a traversal path, and a missing notes heading. Use `node:assert/strict` and `spawnSync`; no new CLI flags or dependencies are needed. Restore/remove fixtures after each run.
- [x] Run `node plugins/awards/evals/visual-library-selftest.mjs` and reference lint, then the six-entry verifier. Open every promoted image and confirm its README describes what it actually shows. Commit.

## Task 10: Connect visual examples to planning and fix verification

**Files:** create `references/patterns/visual-composition.md`; modify `references/{README,codex,capture-states}.md`, `references/patterns/{hero-archetypes,components-catalog,typography,asset-pipeline}.md`, `skills/{concept,system,structure,component,craft,jury,ship}/SKILL.md`, `agents/awards-jury.md`, `references/jury/report-template.md`, `assets/templates/{jury-report,ship-report}.md`, and `recipes/README.md`.

**Interfaces:** consumes `recipe.json.visuals` and actual images; produces explicit image-reading instructions, a static checkpoint inside existing phases, and immutable report-to-capture links.

- [x] Write a short selection table in `visual-composition.md`: brief need → relevant recipe → exact image/annotation path → adaptation question. A read-heavy brief opens the type/editorial examples; a product brief opens hero/specifications; any complete page can inspect close/composition. Do not require all six entries for every task.
- [x] Add an asset-direction section to the existing asset-pipeline reference covering subject, light, perspective, material, focal point, text-safe area, and mobile crop, linked to `ASSETS.md`. Keep delivery/budget guidance intact.
- [x] Teach `concept`, `system`, `structure`, and `component` the reading flow in the spec. In Codex guidance explicitly use an image-viewing tool; reading PNG bytes or Markdown alt text does not count. Existing site-card DIVERGENCE remains separate from fictional example selection.
- [x] Insert the builder's static checkpoint after stack boot and before motion: inspect hero/middle/close at desktop/mobile, compare against the chosen visual principles, fix material defects as one batch, and record result/evidence path in Page map Notes. Capture-unavailable means unmeasured, not a passed gate. Do not add a skill, phase, schema section, or automatic extra jury call.
- [x] Make orchestrated passes allocate a fresh timestamp-plus-stage output directory. Reports and jury input carry that path; standalone capture's default remains unchanged. All template examples use the recorded manifest rather than assuming `.awards/captures/manifest.json` is always current.
- [x] Replace the five-frame checklist with manifest-derived coverage for all applicable page-map chapters, mobile middle/close, reduced-motion sections, and required named states. The old frame names remain valid; the review is broader.
- [x] Extend material fixes and ship rows to `location | change | expected visible result | viewport/state | before evidence | after evidence | resolved/partial/unresolved`. Verdict explicitly checks regressions and preserves the Keep line. A contract failure omitted from the fix batch remains unresolved, preventing a false finished claim.
- [x] Update component catalogue references from “no recipe” to the new appropriate IDs and add the six entries to the recipe catalogue. Keep source-specific examples as evidence, not instructions to copy.
- [x] Run both new self-checks, existing grader self-test, and reference lint. Walk one product brief and one read brief through the instructions without calling a model: each must reach appropriate existing image files without loading unrelated recipes. Commit.

## Task 11: Verify compatibility and make the candidate snapshot

**Files:** modify root/plugin `README.md`, `CLAUDE.md`, `evals/README.md`, `docs/handoff/{state,todo}.md`, and manifest descriptions in both plugin manifests as needed for accurate counts. Do not bump a release version or publish during this batch.

**Interfaces:** consumes the completed visual library/integration; produces an independently verified candidate revision and an accurate technical verification record.

- [x] Run the focused six-entry verifier, audit the new entries/shared assets, and inspect all generated frames. Preserve existing intentional demo exceptions; record any new exception with its actual reason. P0/P1 findings must be fixed.
- [x] Run all 36 recipe entries serially in a temporary plugin copy to avoid unrelated timestamp churn in the source tree. The source already has the six new stamps from focused verification. Record the complete pass count and browser version.
- [x] Run the existing behavior checks, both new self-checks, grader self-test, reference lint, manifest validation, and isolated Codex installation/build verification. Missing browser prerequisites fail verification; they are not skipped passes.

```sh
node plugins/awards/evals/jury-evidence-selftest.mjs
node plugins/awards/evals/visual-library-selftest.mjs
node plugins/awards/evals/selftest.mjs
node plugins/awards/scripts/lint-refs.mjs
node plugins/awards/evals/behavior.mjs
claude plugin validate plugins/awards
claude plugin validate .claude-plugin/marketplace.json
node plugins/awards/evals/codex-install.mjs --build
git diff --check
```

- [x] Update documentation to 35 focused recipes plus one composition, 36 verifiable entries, and the new visual reference guide. Preserve existing routing/build case counts because the manual visual benchmark is a separate three-brief set. Keep “generated/tested” distinct from “human preferred.”
- [x] Review diff and commit the candidate. Archive that exact revision outside the repository. Freeze both snapshots and inputs before Task 12; candidate edits during the comparison invalidate affected pairs.

## Task 12: Run six builds and report the blinded comparison

**Files:** read `evals/visual/`; write raw outputs and answer key outside the repository; create `docs/handoff/visual-comparison-2026-09-22.md` with sanitized results and evidence locations. Update handoff state only with observed results.

**Interfaces:** consumes baseline/candidate snapshots and frozen Task 1 inputs; produces three comparable A/B pairs, a completed human review, and an honest adoption/inconclusive/regression result.

- [x] Preflight the common build environment before any paid call. Check all assets decode, starter dependency versions are equal, and Chromium actually captures. Set `AWARDS_EVAL_MODEL` externally to one fixed backend and use the same effort level for all six runs; do not commit its value.
- [x] Prepare six clean workspaces outside this repository from the identical starter. Install using the common lockfile, then copy the correct case's frozen assets/content. No candidate recipe assets are copied into these workspaces. Save hashes before each run and reject any mismatch.
- [x] Launch one fresh CLI session per workspace with the selected snapshot. The example command uses locally verified CLI flags; run it in a managed background session so progress remains visible. `AWARDS_BENCH_WORKSPACE`, `AWARDS_BENCH_PLUGIN`, `AWARDS_CASE_DIR`, and `AWARDS_RUN_DIR` are absolute paths for the selected arm/case. Set the selected case directory to the workspace-local copy of the frozen inputs, and create the output directory before launching.

```sh
cd "$AWARDS_BENCH_WORKSPACE"
timeout 3600s claude -p \
  --plugin-dir "$AWARDS_BENCH_PLUGIN" \
  --setting-sources project,local \
  --permission-mode acceptEdits \
  --allowedTools Skill Bash Write Edit Read Glob Grep \
  --model "$AWARDS_EVAL_MODEL" --effort high \
  --max-budget-usd 35 --output-format stream-json --verbose \
  < "$AWARDS_CASE_DIR/prompt.md" \
  > "$AWARDS_RUN_DIR/run.jsonl" 2> "$AWARDS_RUN_DIR/run.stderr"
```

Verify the actual Awards skill root in the trace and that no unrelated design plugin influenced the build. A denied Skill tool or unavailable browser is an environment failure: stop, preserve outputs, and fix prerequisites before another authorized run. Do not infer successful skill execution merely from the generated site's appearance.

- [x] Run serially in alternating order: kiln-nine baseline/candidate, tidal-notes candidate/baseline, form-sound baseline/candidate. Record exit, duration, actual cost, source revision, input hashes, and effective environment in the private ledger. Do not add automatic retries, extra polish rounds, or paid judging calls.
- [x] Build and capture both arms through one common external capture/audit tool revision. For each, capture 0/25/50/75/100 at desktop/mobile plus reduced motion; add the primary interaction state where applicable. Preserve the raw outputs and each arm's own jury/ship reports, but do not use their differently instructed self-scores as the comparison result.
- [x] Produce a static A/B review document using the actual screenshots and links to the local pages. Show identical viewport/state pairs and the full required content. Counterbalance left/right positions, keep the answer key separate, and omit plugin labels and self-scores. No hosted service or new gallery framework is needed.
- [ ] Have the user complete the prewritten review form. Record ties and reasons. The executor must not invent a human preference or count its own preference as the user's. If review is pending, report that implementation is complete but visual outcome validation remains pending.
  - Selections received and recorded 2026-09-23: all 18 preferences supplied; all 18 reasons, technical evidence and case notes blank, plus both Kiln Nine reduced-motion checkboxes. Preferences are decoded and reported; this item remains open only for the incomplete form fields, not missing preference selections. No reason or technical observation was invented.
- [x] Apply the predetermined acceptance condition: candidate preferred overall in at least two of three cases, no mobile preference regression in any case, and no new blocking technical failure. Report a failed/mixed pilot honestly; three one-shot pairs do not establish universal superiority. A failed target is a result, not permission for unlimited reruns.
- [x] Write the sanitized comparison record: baseline/candidate revisions, three briefs, fixed-input checks, per-case technical result, blind preferences, actual aggregate cost/duration, limitations, and the next evidence-driven change. Keep raw model identifiers out of repository files. Commit the report and update handoff state. No push, PR, deployment, or release is part of this plan.

## Plan self-review

- [x] User scope maps to tasks: contradictions → 2; five recipes → 4–8; coherent assets → 3; complete page and annotations → 9; planning/review integration → 10; three paired builds → 1 and 12.
- [x] Existing recipe discovery, capture states, custom viewport flags, and jury verdict mode are reused.
- [x] Baseline revision, six-run design, empty fixture risk, comparison rules, and proposed spending allowance are explicit.
- [x] No new dependency, generic renderer, framework adapter, hosted viewer, or broad corpus expansion is introduced.
- [x] Technical verification and human visual preference are separate completion claims.
- [x] Tasks 1–11 are implemented and reviewed; the frozen candidate is `ae29ca6`. Task 12 has delivered six builds, common evidence and a neutral review gallery. Human selections meet the visual preference thresholds, with reasons omitted; technical acceptance still fails and workflow benefit remains unmeasured. See [the comparison record](../../handoff/visual-comparison-2026-09-22.md) and [candidate verification record](../../handoff/state.md#candidate-verification-record).
