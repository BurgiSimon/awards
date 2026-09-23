---
name: structure
description: "Plan and build the page architecture of an award-level site: a chapter or route map with pacing, the hero archetype, navigation and a fullscreen menu overlay, the preloader slot, marquee, sticky and pinned stacks, horizontal rails, galleries, hover-preview archive lists, spec blocks, a designed footer and 404, as semantic HTML with keyboard paths and a responsive strategy decided before build. Use whenever the user asks for page structure, sections, the layout of a landing page or portfolio, 'what sections should this have', wireframes, a hero that 'needs to feel premium', a nav, menu, footer or 404 page, scrollytelling structure, or when turning a locked direction into markup. Draws on a catalogue of components seen across 19 award-winning sites. Not for dashboards, admin CRUD, forms-only pages or accessibility fixes with no award framing."
argument-hint: "[page | route] [--from AWARDS.md] [--skeleton]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:structure — page map and skeleton

Codex: read [the runtime guidance](../../references/codex.md) before following this skill; it maps plugin paths, tool names and handoffs to Codex.

This skill turns a locked direction into the architecture of the page: a page map with beats and pacing, one hero archetype, the components each chapter needs, a semantic DOM plan, a responsive strategy decided before any component exists, and the static skeleton itself, 404 included. Motion and WebGL come later and must survive on top of what this phase ships.

## Pages are chaptered arguments

Why: the order hero → logos → features → testimonials → pricing is the first thing a juror recognises, and it recognises it because sections stack while chapters argue. The corpus builds pages as beats with one interruption and an authored close, and it treats pacing as craft: dense earns quiet, and a page that is loud everywhere has no loud moment (`[pattern:narrative-structures#pacing]`).

- Every chapter has an entrance (the moment that arrives), a hold (the part that reads) and an exit (the hand-off).
- Exactly one interruption per page, after the first content beat, and it changes the input, the scale or the register (`[pattern:narrative-structures#the-interruption]`).
- The last screen is scored like the first: a designed footer, a conversion in the page's register, a 404 in the same world (`[pattern:narrative-structures#the-close]`).
- The DOM is the story with CSS off; the Site of the Year's empty DOM cost it a 6.6 on accessibility and semantics `[site:igloo]`, a ceiling survived, not a licence.

## Setup

Why: the durable files are the memory of the build; a skill that starts without them re-asks what is already decided and drifts from the contract.

1. Read `AWARDS.md` in the project root if it exists and resume from its `## Status` checklist; treat every locked block as decided.
2. Read `DESIGN.md` in the project root if it exists; its tokens are the visual system and are not re-invented here.
3. If impeccable's `PRODUCT.md` exists, read it for product truth (audience, purpose, voice, constraints) and never overwrite it.
4. Detect the scope: a whole site, one component (a named element, file or selector), or a critique of existing work.
5. Detect the stack from `package.json` and framework files (`vite.config.*`, `next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, a Webflow export); note the motion and GL libraries already installed.
6. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once — it drives every phase in order — then proceed with this skill if the user declines.

## Read before you plan

Why: the page map, the hero and the components are chosen from pattern files that carry the corpus evidence and the refusals; the recipes carry the markup contracts the motion phase expects.

- The contract's STORY, FIRST VIEWPORT, SIGNATURE, SCROLL MODEL and LOAD & CLOSE blocks, and `DESIGN.md` for the tokens and the type contract (`--from AWARDS.md` is the default whenever the file exists).
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/narrative-structures.md` before the page map; `${CLAUDE_PLUGIN_ROOT}/references/patterns/hero-archetypes.md` before the hero; `${CLAUDE_PLUGIN_ROOT}/references/patterns/components-catalog.md` before the component column.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/visual-composition.md`: open hero, editorial, specification and footer desktop/mobile frames only where those roles occur in this page map; record chosen mobile order and crop decisions in Notes.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/responsive-strategy.md` and `${CLAUDE_PLUGIN_ROOT}/references/patterns/accessibility-and-reduced-motion.md` before the DOM plan.
- `${CLAUDE_PLUGIN_ROOT}/references/craft-floor.md`, the Structure and accessibility and Layout and responsive sections, for the audit rule ids the skeleton is measured against.
- `${CLAUDE_PLUGIN_ROOT}/recipes/_shared/base.css` as the base stylesheet the skeleton starts from, and the `index.html` of `${CLAUDE_PLUGIN_ROOT}/recipes/nav-overlay-fullscreen/`, `${CLAUDE_PLUGIN_ROOT}/recipes/marquee-raf-mask/`, `${CLAUDE_PLUGIN_ROOT}/recipes/sticky-stack-cards/` and `${CLAUDE_PLUGIN_ROOT}/recipes/hover-preview-list/` for their markup contracts; where a recipe folder does not exist yet, the catalogue entry is the contract.
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/404.html` as the starting point for the 404.
- When the project already has a stack, `${CLAUDE_PLUGIN_ROOT}/references/stacks/<stack>.md` for where routes and styles live.

## Arguments

- `page` or `route`: which route to structure; the home route by default. In a faceted world each route is its own run of this skill with a shared page map.
- `--from AWARDS.md`: the default; with no contract, ask one question for the chapters the user already knows they need, then plan from `narrative-structures.md`.
- `--skeleton`: build the markup from an existing page map without re-planning it.

## Step 1 — the content inventory

Why: a structure planned for content that does not exist is planned twice; the holds are made of what is actually on hand.

List from `## Brief` and the project: headings and paragraphs that exist; numbers with units; images with alt text; video with posters; 3D assets and their size; PDFs and downloads; what will be authored for the build (labelled synthetic in the brief); what is missing and therefore blocks a chapter. A chapter with nothing to read is cut from the map, not padded.

## Step 2 — the page map

Why: `AWARDS.md ## Page map` is the one table every later skill reads: motion authors a moment per row, WebGL builds a scene per row that names one, ship checks every row rendered.

- One row per chapter or route with the template's columns: `#`, `Chapter / route`, `Beat (entrance · hold · exit)`, `Components (recipe ids)`, `Notes`. The beat column comes from STORY; the concept phase may have left the skeleton rows.
- Rule of three inside a hold: three support points at most.
- Place the signature in exactly one chapter and the interruption in exactly one, after the first content beat; write which row carries each.
- Pacing: alternate spectacle and rest; after a scrubbed scene a block that only reads; at most one hero-scale moment per chapter and never in two adjacent chapters; a dense chapter (a spec table, a triptych) is followed by a single line at display scale.
- Register per chapter in the Notes column (poetic or numeric); the switch only on a chapter boundary; on a big-ticket subject the numbers sit in the second half (`[pattern:narrative-structures#emotion-before-economics]`).
- The close is a row: the designed footer with the conversion matched to the stakes (`[pattern:copy-and-content#conversion-matched-to-stakes]`). In a faceted world every route is a row authored to the same standard, the 404 included.
- Notes also carry, per row: the responsive note (what the phone shows), the accessibility need (a key path, a live region, a mirror) and the still the static tier shows.

## Step 3 — the hero archetype

Why: the hero is the entrance beat of chapter one and the screen the naming test runs on; the archetype follows the narrative model and the dosage the budget allows, never the other way round (`[pattern:hero-archetypes#choosing]`).

Choose one of the nine: two-state typographic, role-casting boot sequence, poster or video hero, single object with inertia, collage of flat planes, spatial descent, print artefact with an acetate, headline as string, palette field bound to the product. Then:
- Decide what the first three seconds must say (who, what, why now) and take the lowest dosage that says it; never stack archetypes.
- Write the composition into row 1's Notes as the archetype's anatomy line describes it: what is where, at what scale, where the primary action sits, what moves once and for how long.
- Run the six checks in `[pattern:hero-archetypes#the-first-viewport-test]`, the phone test included; a failing naming test goes back to `awards:concept`, not to the copy.
- Name the archetype's mobile line and its reduced-motion line in the same row; the archetype's own card signature (its device, object or colour) is the one thing not taken.

## Step 4 — component selection

Why: a component earns its place by the job it does in the story, not by having been seen on a winning site; the catalogue lists role, anatomy, motion, accessibility, recipe and the literal version refused for each (`[pattern:components-catalog#how-to-read-an-entry]`).

For every chapter write the components into the `Components (recipe ids)` column with an id from `${CLAUDE_PLUGIN_ROOT}/recipes/README.md` or the word `custom`, and the accessibility need in Notes. The usual picks by role:

| Role in the story | Catalogue entries | Recipe ids |
|---|---|---|
| Arrival and chrome | authored preloader, fullscreen nav overlay, custom cursor, sound toggle, chapter jump rail, scrollspy index, theme switcher (`[pattern:components-catalog#arrival-and-chrome]`) | `preloader-counter-hold`, `nav-overlay-fullscreen`, `cursor-two-speed`, `sound-toggle-opt-in`, `theme-swap-tokens` |
| Scroll set-pieces | scrubbed hero object or scene, pinned chapter, horizontal rail, sticky stack cards, scroll-drawn path, hold or drag to compare (`[pattern:components-catalog#scroll-set-pieces]`) | `scroll-pin-scrub`, `sticky-stages-rails`, `horizontal-rail`, `sticky-stack-cards`, `scroll-drawn-svg-path`, `compare-hold-drag`, `image-sequence-scrub` |
| Galleries and lists | draggable plane or arc gallery, hover-preview archive list, poster-scale case blocks, metadata rows, ticker (`[pattern:components-catalog#galleries-and-lists]`) | `gl-dom-tethered-planes`, `hover-preview-list`, `marquee-raf-mask`, `split-text-masked-reveal` |
| Evidence blocks | spec and metric blocks, map cards (`[pattern:components-catalog#evidence-blocks]`) | `product-specification` for product facts and care; otherwise `custom` (numbers as copy in a `<dl>` or table, never a count-up) |
| The close | designed footer, designed 404, easter eggs, living-utility pages (`[pattern:components-catalog#the-close-and-beyond]`) | `magnetic-button` for the CTA, `theme-swap-tokens` when the footer is a theme, `page-transitions` for routes |

Rules: every component has a job in a row or it is cut; the catalogue's refuse line for each entry is binding (no counter jumps, badge sets, rotated indexes or chapter rails lifted with their values); a marquee is never the hero; a compare needs two conditions; hover previews also appear on focus. Add one entry per chosen component to `DESIGN.md ## Components` with its tokens, states, motion hook and accessibility notes.

## Step 5 — the semantic DOM plan

Why: a screen reader, a crawler, find-in-page, translation and the `--no-webgl` capture all read the DOM, and the reduced-motion and keyboard paths the references skipped begin here (`[pattern:accessibility-and-reduced-motion#the-improvement-over-the-corpus]`).

- Landmarks: `<header>`, one `<main>`, `<nav aria-label>` for each navigation, `<footer>`; one `<h1>` carrying the final claim; an unbroken heading order; every chapter a `<section aria-labelledby>` with its own heading and real text, so the sequence reads as an article (A01, A03).
- A skip link as the first focusable element, visible on focus, targeting `<main>`; `lang` on `<html>`, a viewport meta, `theme-color` and `color-scheme` from the tokens (A09, L03).
- Real controls: links are `<a>`, actions are `<button>`; never a click handler on a `div` or `span` (A05); every pointer gesture named in the page map has a keyboard path and a skip (A11, `[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]`).
- The canvas-mirror rule: every canvas slot is `<canvas aria-hidden="true">` (or is created by the script) over real `<img alt>` elements and real text; a headline that WebGL will draw exists as the real heading in the same place; the `--no-webgl` capture must read as a full page (A04, `[pattern:accessibility-and-reduced-motion#the-dom-mirror]`).
- `inert`-ready overlay slots: one page wrapper (`<div id="page">` around header, main and footer) so `inert` can be set on it in one attribute; the nav overlay and any dialog are siblings after it at the end of `<body>`, as a `<dialog>` or a `role="dialog"` element with `aria-modal`, hidden until opened; the toggle is a `<button aria-expanded aria-controls>` (`[pattern:accessibility-and-reduced-motion#overlays-and-focus]`).
- A live region for the preloader: `<div role="status" aria-live="polite" hidden>` with a visible skip `<button>` inside, shown by the script only, so the content is never behind it without JavaScript and it leaves the accessibility tree afterwards (`[pattern:accessibility-and-reduced-motion#preloader-and-live-regions]`); one polite region per page.
- Focus order equals reading order; `:focus-visible` from the tokens on both grounds; no `outline: none` without a replacement (A06, A07).
- Lists are `<ul>` or `<ol>`; specs and metadata are `<dl>` or tables; credits are tables; labels that carry meaning are text in the DOM, decorative slashes and rules live in `::before` (`[pattern:typography#labels-as-texture]`).
- Media: `<img>` with alt written as content, `width` and `height`, `loading` (A02, P01); `<video muted playsinline preload="metadata" poster>` with a text alternative or `aria-hidden` when decorative (A10); the poster or the DOM is the largest contentful paint, never the canvas.

## Step 6 — the responsive strategy, decided before build

Why: a scaling system chosen after the components exist means every measure is rewritten twice, and a phone that gets a shrunken desktop is where winners lose their usability points (`[pattern:responsive-strategy#decide-before-build]`).

- Pick one scaling system and record it in `DESIGN.md ## Layout` and the page map Notes: vw-lock (every desktop measure a fraction of one artboard, fixed pixels below the handoff width) or a fluid `clamp()` from one baseline; never both on one surface; display type stays under 13 vw with a `clamp()` (T03, L01).
- Apply the coarse-pointer swap list in full (`[pattern:responsive-strategy#coarse-pointer-swaps]`): custom cursor and magnetic pull off; hover previews become a thumbnail in the row or a tap; drag rails become native `overflow-x: auto` with scroll snap and an edge peek; hold gates keep the gate with a larger target; test `any-pointer` as well as `pointer`.
- Decide dedicated mobile or graceful degrade (`[pattern:responsive-strategy#dedicated-mobile-versus-graceful-degrade]`): dedicated when the phone is the revenue surface or the loud moment can be rebuilt smaller; degrade when the page is a document under an experience layer. Either way the phone gets the same content, headings and links, and a designed still where a scene would be.
- Never a reload at a breakpoint; scenes rebuild on resize, and breakpoint choreography lives in `gsap.matchMedia()` blocks written by the motion phase (`[pattern:responsive-strategy#never-reload-at-a-breakpoint]`).
- A side index collapses under about 900 px into a visible nav; rails are native overflow on touch; the same wayfinding exists at both widths (`[pattern:responsive-strategy#navigation-and-rails-on-small-screens]`).
- Plan for the checks the corpus never documents: 320 px with no horizontal scroll, 200 % zoom, 44 × 44 px targets, a landscape layout instead of a rotate prompt (`[pattern:responsive-strategy#checks]`).

## Step 7 — build the static skeleton

Why: the skeleton is the layer everything else must survive without; build it as a document first, so the static tier, the crawler and the keyboard user all get the whole page before a single tween exists.

- Files: one `index.html` per route (MPA routing unless the stack notes say otherwise); `src/styles/base.css` started from `${CLAUDE_PLUGIN_ROOT}/recipes/_shared/base.css` and importing `src/styles/tokens.css` from `awards:system`; `404.html` (or the stack's 404 route) started from `${CLAUDE_PLUGIN_ROOT}/assets/templates/404.html` and rewritten in the world: same tokens, same type contract, one small echo of the signature, three routes out, links first in DOM order, lighter than the home page.
- Content at full fidelity: real headings, numbers with units, alt text written as content; every invented figure, quote or image labelled synthetic in `## Brief`; no lorem, no emoji icons, no "Get started" (X01–X03).
- No JavaScript in this phase beyond the hooks the motion score will read (`data-reveal`, `data-theme`, `data-cursor`, `data-motion`): the overlay ships closed, the preloader ships hidden, and what renders is the static tier.
- Component markup adapted from the recipes' `index.html` (rename, re-token, drop the demo content) with their accessibility attributes kept; class names by role; every value through `var()` from the tokens; layout by grid and flow; no fixed width above 600 px, no `100vw` (L01, L02).
- Order of work: landmarks and headings → chapters with their holds → the hero composition → components → footer → 404.
- Tick "Page map and skeleton built (structure)" in `AWARDS.md ## Status`.

## Verify

Read the HTML top to bottom with styles disabled (or as source): it must read as an article with headings, real paragraphs, lists and links, in the page map's order. Then walk it with the keyboard: Tab from the top reaches the skip link, then the nav, then every control in reading order; the overlay toggle and the preloader skip are buttons in the tree. Then run:
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <dir> --scope a11y,layout,slop` — exit 0, or every finding recorded under `AWARDS.md ## Exceptions` with a reason.
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <dir> --out "$capture_out" --scroll 0,50,100` (fresh `capture_out` per `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md`) — desktop and mobile captures show the same headings; open each once.

- [ ] Readable with CSS off; keyboard navigation reaches every control in reading order.
- [ ] Landmarks, one `<h1>`, unbroken heading order, skip link, `lang`, viewport meta; every chapter a `<section>` with a heading and real text.
- [ ] The overlay slot is a dialog after the page wrapper, closed, with a `<button aria-expanded>` toggle; the preloader is a hidden `role="status"` region with a skip button; one polite live region on the page.
- [ ] Every canvas slot is `aria-hidden` over real `<img alt>` and text; nothing exists only in a canvas.
- [ ] No identical card grid, eyebrow labels, hero-metric row or numbered markers by habit (L04, L05, X07, X08); no template order.
- [ ] The footer is designed with the conversion in the page's register; the 404 exists, reads in the world and has three routes out.
- [ ] The responsive strategy is named; 320 px shows no horizontal scroll; the coarse-pointer swaps are planned per component.
- [ ] Every page map row has a beat, at least one component id or `custom`, an accessibility need and a static-tier still; the signature and the interruption each live in exactly one row.
- [ ] `DESIGN.md ## Components` has an entry per chosen component.

## Hand-off

When no project boots yet (no `package.json`, or no Lenis + GSAP boot): Invoke the `awards:stack` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the stack is already booted: complete or reuse the static checkpoint in `${CLAUDE_PLUGIN_ROOT}/references/patterns/visual-composition.md` and `awards:craft` after layout/media exist, recording its evidence or unmeasured result in Page map Notes; then invoke the `awards:motion` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the user asked only for structure, sections or a skeleton, stop after the verify step and offer the next step in one line. The artefacts the next skill needs are the filled `## Page map`, the skeleton files and `DESIGN.md ## Components`.

## Refuse

- The hero-metric template, eyebrow labels, meaningless section numbering, identical card grids: the slop families the audit catches and a juror recognises first.
- The features → testimonials → pricing order unless the story earned it; a chapter that exists because the category always has one.
- A modal by reflex; an overlay hidden with opacity that stays focusable; a menu with no `inert`, trap or Escape.
- Two hero archetypes stacked; a hero that needs the paragraph to make sense; a card's signature as drawn.
- A chapter with nothing to read; two interruptions; a gate in front of the content; a marquee as the hero.
- Canvas-only text or images; a click handler on a `div`; hover-only previews; drag-only galleries.
- Two scaling systems on one page; a reload at a breakpoint; a rotate-your-device prompt; a mobile version that drops headings, copy or links.
- The host's default 404; a sitemap dump or a social-icon row as the ending.
- Content that only appears once JavaScript runs; a preloader element that hides the page without a script.
- Any card's section order or component lifted with its values, whatever the user's shorthand names.
