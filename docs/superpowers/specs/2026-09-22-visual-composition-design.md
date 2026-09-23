# Visual Composition Library — Design

Status: proposed design for the user's selected first batch; implementation has not started.

## Goal

Improve the appearance of generated sites by teaching complete composition through five reusable recipes, one coherent example page, rendered desktop/mobile evidence, and a three-brief comparison against the current plugin.

The user selected this scope after the repository review: fix contradictions, create one complete composition with coherent assets and desktop/mobile annotations, connect those visuals to planning, and compare three resulting builds against the current plugin. The five requested recipes are editorial image/text composition, responsive art-directed hero, product specification section, typography specimen, and designed footer.

## Approach and alternatives

Use the existing recipe contract and Vite multi-page build. Add five standalone recipes and a sixth entry that composes them into one finished page. Share imagery, tokens, and component styles; retain semantic HTML in each page. This makes the individual decisions inspectable and demonstrates how they work together.

Independent demos alone would be slightly smaller but would not teach whole-page coherence. A configurable design-system engine or new gallery application would add infrastructure without proving better design. Neither belongs in this batch.

This is one connected change: the visual library supplies evidence to planning, and the comparison evaluates whether that evidence improves outputs. Each implementation task remains independently reviewable.

## Global constraints

- Preserve all eleven skill names, existing standalone scopes, phase order, and the default vanilla Vite stack.
- Use Node 20.19+ on the 20.x line, or 22.12+, and the existing pinned recipe dependencies; add no npm dependency.
- Use native HTML/CSS for the five new recipes; no WebGL, new animation library, component framework, or custom renderer.
- Keep the existing recipe contract: index.html, main.js, style.css, README.md, recipe.json, verify.mjs, and window.__awards.
- Keep the current jury weights, thresholds, and maximum of two formal jury rounds per build.
- Ship no font files and no copied reference-site imagery, copy, or layouts. Demo fonts remain system stacks.
- Label invented brands, specifications, and generated imagery as synthetic demonstration material in the accompanying documentation.
- Store no model identifiers in committed files; raw execution metadata stays outside the repository.
- Run browser verification serially. Headless captures prove rendering and behavior, not real-device performance.

## Current evidence and bounded corrections

Baseline revision: `4f348dc5ea850d9657af27ce28c17e11884f02d6`.

The current catalogue has 30 recipe entries. Its Vite configuration and verifier discover entry directories automatically. The verifier rewrites the gallery index and passing verification stamps; compatibility checks must account for those writes. `capture.mjs` already supports custom viewport sizes, scroll positions, reduced motion, named states, and selectable output directories. Reuse these capabilities.

Correct these identified disagreements without performing a general corpus rewrite:

1. **The Line's imagery:** `sites/the-line.md` records a local acetate treatment and otherwise full-color imagery. Remove the unconditional heterogeneous-imagery-to-greyscale prescription from `patterns/color-and-material.md` and `skills/system/SKILL.md`; retain desaturation as a deliberate optional treatment. Correct nearby claims that its red occurs only in navigation and the footer.
2. **The Line's typography:** its corrected card documents an eight-step scale between 210 px and 10 px, while `patterns/typography.md` still claims there is effectively nothing between. Correct the attribution. Treat 20:1 display/label contrast and tight leading as poster-oriented starting points, not requirements for every composition. Update their consumers in `system` and `craft-floor` while preserving contrast, font-loading, and tracking safeguards.
3. **MindMarket's map:** `sites/mindmarket.md` demotes a clone-derived 48-country dataset; `patterns/components-catalog.md` still labels it verified. Carry the corrected confidence through to the derived claim.
4. **Missing jury evidence:** `jury` and the jury agent both forbid scoring without captures and also instruct source-only scoring. Use a single unmeasured result when required evidence is absent; source observations may still be reported with locations.

Do not rewrite historical research reports or verification logs to make earlier observations appear correct.

## Deliverables and file ownership

Add these entries under `plugins/awards/recipes/`:

| ID | Responsibility | Core visual lesson |
|---|---|---|
| `typography-specimen` | Display, editorial, and technical specimens using identical copy | Hierarchy, line length, wrapping, leading, and optical alignment change with the job |
| `responsive-art-directed-hero` | Responsive picture, headline, and primary action | Preserve subject and action through a deliberate desktop/mobile composition |
| `editorial-image-text` | Figure, caption, and explanatory text | Asymmetry, aligned edges, image proportion, and reading measure |
| `product-specification` | Product description, semantic specifications, care disclosure | Concrete evidence with readable hierarchy and units |
| `designed-footer` | Closing statement, primary action, navigation, and colophon | A deliberate ending that continues the page's visual language |
| `complete-editorial-composition` | Complete page using all five component styles | Consistent motifs, varied section density, pacing, and a coherent close |

Six new entries yield 36 verifiable catalogue entries: 35 focused recipes and one full composition. Counts in user-facing documentation must describe that distinction consistently.

Shared files have narrow purposes:

- `recipes/_shared/composition.css`: the example world's token overrides and shared text/layout primitives.
- `recipes/_shared/composition/ASSETS.md` and five optimized images: original imagery with provenance, intended roles, dimensions, focal points, and mobile treatment.
- `recipes/_shared/verify-layout.mjs`: self-contained browser probe and common result checks used by the six verifiers; no runtime dependency.
- `references/patterns/visual-composition.md`: a concise selection guide, visual-reading procedure, and adaptation rules linked to the new examples.
- `evals/visual/`: three fixed briefs, their actual assets and content, comparison instructions, and a blank human review form. This is a manual rendered benchmark, separate from the existing routing/build suites.

Each standalone recipe owns its HTML, component CSS, and recipe-specific checks. The complete composition imports those component styles. Do not add a templating engine to eliminate small, deliberate repetitions of semantic demo markup.

## Example world and assets

User-selected direction: an editorial furniture/materials brand with coherent product imagery. Use the explicitly fictional name **Alder Workshop**. The subject determines copy/assets and the shared theme, while the recipe interfaces and benchmark protocol remain reusable.

The example presents one fictional white-oak bench: a quiet warm ground, dark brown ink, one clay accent, a serif display voice, a neutral system body face, generous but unevenly paced whitespace, and product imagery with consistent light and material. This is an example world, not a new default for all sites.

Five image roles:

| File | Intended content | Framing |
|---|---|---|
| `hero-wide.webp` | Bench in a restrained daylight interior | Landscape, complete recognizable silhouette |
| `hero-portrait.webp` | Same bench and lighting | Phone-specific portrait composition, not a squeezed landscape |
| `joinery-detail.webp` | Same wood and construction | Close detail with visible grain and joint |
| `workshop.webp` | Materials/tools in the same production world | Editorial landscape, no invented endorsements or identifiable people required |
| `product-side.webp` | Same bench in profile | Clear form against a quiet background |

Generate original imagery using the image-generation skill at execution time, or use explicitly supplied assets with suitable provenance. Reference the selected product image when generating subsequent views. Reject inconsistent geometry, wood, or lighting. Document synthetic status in `ASSETS.md` and the recipe README. Export at the displayed resolution; each shipped raster must remain under 1 MiB.

Use `Georgia, "Times New Roman", serif` for the example display and the existing portable system body stack. No downloaded fonts or font CDN is required to view the examples. Explain that projects select their own licensed typeface; the transferable lesson is composition. Keep labels legible, body text at least 16 CSS px, and a useful intermediate heading size.

The complete page contains hero, editorial material story, product evidence, a short typography-led care statement, and the designed close. A product detail/care disclosure is the only required interaction. No loading gate, cursor, scroll-jacking, or invented checkout is needed.

## Recipe behavior and acceptance

All six pages work as documents without JavaScript. JavaScript exposes readiness and the existing capture hook. Do not wait indefinitely for off-screen lazy images before declaring readiness.

- **Hero:** `<picture>` selects a portrait source below 48rem; desktop aligns copy and imagery asymmetrically. At phone width the image, title, and action remain understandable in their documented order. The focal subject is not cropped accidentally.
- **Editorial:** `<figure>`, `<figcaption>`, and text form a two-column composition above 48rem, then one meaningful reading sequence below it. Captions stay with their images. Prose stays roughly 45–70 characters wide on desktop.
- **Specifications:** use `<dl>` for single-product key/value facts, retain units in text, and use native `<details>/<summary>` for care information. The same facts remain visible or discoverable on mobile. No animated counters or decorative metric row.
- **Typography:** show poster, editorial, and technical hierarchy using identical copy. Include `Typography, paying attention` and `gypqj ÅÉ` to expose descender/diacritic clipping. Resting text is never masked. Explanatory annotations distinguish examples from mandatory rules.
- **Footer:** provide a real close, primary contact action, section links, and back-to-top. All local fragments resolve, controls remain reachable, and the footer's visual change preserves contrast.
- **Complete page:** use the five shared component styles without local repairs that mask a standalone recipe defect. Include skip link, landmarks, one h1, complete alt text, and consistent tokens. Its typography passage is content, not a screenshot of the specimen demo.

Automated verification checks errors, readiness, loaded visible images, horizontal overflow, semantic facts, responsive source selection, and keyboard disclosure behavior. Human inspection checks balance, crop, intact glyphs, visual rhythm, and the quality of the ending. DOM assertions alone do not establish beauty.

## Portable visuals and annotations

Each new entry ships `visuals/desktop.png` and `visuals/mobile.png`, captured from its actual built page at 1440×900 and 390×844. The complete composition additionally ships `visuals/desktop-middle.png`, `visuals/mobile-middle.png`, `visuals/desktop-close.png`, and `visuals/mobile-close.png`. Keep these files below the raster budget, using native browser JPEG output and `.jpg` metadata paths if a PNG cannot meet it; one format must be recorded consistently per entry.

Keep raw verifier output in the existing ignored `_verify/` directory. Promote only reviewed images into `visuals/`. Never fabricate a preview with image generation; previews must represent the shipped HTML/CSS. Record capture date, browser version, CSS viewport, and the review outcome in README.

Extend the optional recipe metadata with:

```json
{
  "visuals": {
    "desktop": "visuals/desktop.png",
    "mobile": "visuals/mobile.png",
    "notes": "README.md#visual-notes"
  }
}
```

Existing recipe metadata remains valid without this field. `lint-refs.mjs` checks declared image files and notes targets; absence of `visuals` on the old 30 entries is not an error. Preserve this field when verification adds its existing timestamp.

README annotations sit beside the real screenshots and reference normalized positions or named elements. Each explains at least five concrete decisions: dominant element, alignment, image crop, whitespace/measure, and mobile recomposition. The complete page's middle and close receive their own annotations. Include one described unsuccessful alternative per recipe; no need to build a second design solely to illustrate a failure.

## Planning and review integration

Add the visual-composition guide to the existing progressive reading flow:

1. `concept` reads the complete composition's desktop/mobile evidence when the brief calls for an editorial/product/material-led page, and selects relevant examples for other briefs. It records the visual principle taken and what must change for this subject. Do not replace the three site-card DIVERGENCE citations with fictional demo pages.
2. `system` opens the typography specimen and reads the composition's asset/typography notes when applicable. It chooses the project's own fonts, colors, and hierarchy.
3. `structure` opens the hero, editorial, specification, and footer examples only where their roles occur in the page map. It records mobile order and image-crop decisions.
4. `component` can use any one of the five examples without starting a whole-site workflow.
5. `craft` performs a static visual review after the stack boots and layout/media exist, before the motion handoff. This is a builder checkpoint inside the existing phases, not a third formal jury round. Its result goes in page-map Notes and existing status prose; no new AWARDS schema section is needed.

The static review checks hero, a middle section, and close at desktop/mobile widths against the selected visual principles. It fixes material defects in one batch. When capture is unavailable, record the checkpoint as unmeasured and continue independent work without claiming visual approval.

Use distinct capture paths for each pass, such as `.awards/captures/20260922T140000-static`, `...-jury`, and `...-ship`. Record the actual manifest path in reports and jury input. Preserve `capture.mjs`'s existing CLI default for standalone users. Reused directories and files outside the current manifest are not valid comparison evidence.

Every jury fix adds an expected visible result and its viewport/state. Ship and verdict compare those states before/after. Derive review coverage from the manifest and page map, including mobile middle/close and named interactions; retire the fixed five-frame checklist. Evidence that a contract block failed must enter the fix list or remain explicitly unresolved.

When evidence is unavailable, output this unbroken score line after `disposition: recapture`:

```text
Design unmeasured · Usability unmeasured · Creativity unmeasured · Content unmeasured — weighted unmeasured
```

Developer scores, visual memory test, and visual fidelity are also unmeasured in that report. Keep located source observations in a separate section. Logs and graders accept this branch only with `recapture`. Do not replace an unknown score with zero.

## Three-brief comparison

Freeze the baseline revision before implementation. Build each brief once with that snapshot and once with the candidate: **six fresh builds total**. This is a pilot, not a statistically reliable claim of general superiority.

The existing image fixtures contain zero-byte JPG/PNG files. Do not reuse them for this benchmark. Supply actual, decodable, frozen assets before either arm runs:

| Case | Visitor mode | Fixed brief/assets | Transfer being tested |
|---|---|---|---|
| `kiln-nine` | persuade | Fictional ceramics collection; two coherent product/detail images; dimensions, material, care, and enquiry copy | Product evidence and art-directed imagery without reproducing the furniture page |
| `tidal-notes` | read | Fictional coastal field journal; two landscape/detail images; six entries with categories and reading times | Useful editorial hierarchy, reading density, and navigation |
| `form-sound` | experience | Fictional three-day design event; two original vector posters/marks; program, dates, venue, and booking action | Expressive typography and graphic composition outside the photograph-led example |

Baseline and candidate receive identical prompt, asset bytes, content, dependency lockfile, initial Vite scaffold, backend, effort, tools, and execution ceilings. Neither receives the exemplar images as project assets. No additional image generation during builds. Use an externally pinned backend for the six runs, keep raw identifiers outside the repository, and reject an unmatched pair if it changes.

Run in clean sibling workspaces outside this repository, with only the selected plugin snapshot available. Use normal CLI sessions because the existing eval sandbox can lack rendering prerequisites. Preflight the environment before any paid run, verify the intended Awards skills really loaded, and stop on a discovery/permission failure rather than spending the remaining calls.

Proposed allowance: six build calls at up to USD 35 each, maximum planned build allowance USD 210, and a 60-minute timeout per call. Image generation is a separate cost. Confirm or adjust this allowance when executing the plan; planning itself makes no paid calls. No automatic reruns or paid jury comparisons are included.

Capture every finished output with the same external capture tool revision and settings. Retain each arm's own reports, but assess technical eligibility with a common audit/capture protocol. Use blinded A/B presentation, swap left/right assignments across cases, and keep the answer key outside the human review sheet.

The human review form records preferred composition, typography, imagery, distinctiveness, mobile quality, and overall result, each with one visible reason and a tie option. Broken build, missing required content/assets, clipped meaningful text, inaccessible primary action, or missing reduced-motion content fails technical eligibility.

The pilot supports adoption when the candidate is preferred overall on at least two of three cases, is no worse on mobile in all three, and introduces no new blocking technical failures. Ties, mixed outcomes, missing runs, or one-shot variability must be reported explicitly. A failed target is a valid experiment outcome; do not tune repeatedly against these same three briefs until they pass.

## Out of scope

No broad site crawl, bulk corpus expansion, new framework adapters, new WebGL effects, configurable theme engine, vector database, hosted gallery, new skill name, automatic library promotion, or real-device performance claim. Existing routing tests remain in place; this comparison does not replace them.

## Completion criteria

- The four contradiction groups are corrected in their consuming instructions, with no fabricated verification labels.
- Five requested recipes and one complete composition pass the existing recipe verifier and visual review; the old 30 remain compatible.
- Original assets decode and match their documented roles; no empty fixtures or placeholder photography substitutes are used to claim visual quality.
- Desktop/mobile screenshots and annotations ship with all six entries, including the complete page's middle and close.
- Planning reads appropriate images; the static checkpoint and immutable fix evidence are documented without a new phase or extra formal jury round.
- Missing evidence produces an unmeasured `recapture` branch that the grader tests accept and numeric source-only results reject.
- Three paired builds have a reproducible, blinded comparison report, or an explicit incomplete outcome naming the missing evidence. An incomplete comparison does not count as completed validation.
- Documentation reports actual counts and measured results; no quality improvement is claimed solely from a clean audit or a higher self-jury score.
