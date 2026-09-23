---
name: component
description: "Design and build ONE award-worthy component inside an existing site, or as a standalone piece: a hero, preloader, navigation overlay, custom cursor, marquee, sticky stack, horizontal gallery, hover-preview list, image-distortion grid, theme switcher, compare slider, magnetic CTA, page transition, footer or 404. Use whenever the user asks to make a specific element 'award-worthy', 'award-level', 'more premium / impressive / memorable', to 'add a menu / cursor / marquee like the creative studios do', or to build a single section or component with real motion without redesigning the whole site. Inherits the site's tokens and motion library, adds one signature interaction, every state, keyboard, touch and reduced-motion paths, and verifies with a component capture. Not for whole-site builds (awards:craft), dashboards, admin UI or plain bug fixes."
argument-hint: "<component name | file | selector> [--standalone] [--lib gsap|anime|css]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:component — one element, award-level

Codex: read [the runtime guidance](../../references/codex.md) before following this skill; it maps plugin paths, tool names and handoffs to Codex.

The fast path. A component inside an established world inherits that world; it is never a new identity exercise. The job is to give one element a signature move, every state and every path, and to prove it with a capture, while touching nothing around it.

## Setup

Why: the durable files are the memory of the build; a skill that starts without them re-asks what is already decided and drifts from the contract.

1. Read `AWARDS.md` in the project root if it exists and resume from its `## Status` checklist; treat every locked block as decided.
2. Read `DESIGN.md` in the project root if it exists; its tokens are the visual system and are not re-invented here.
3. If impeccable's `PRODUCT.md` exists, read it for product truth (audience, purpose, voice, constraints) and never overwrite it.
4. Detect the scope: a whole site, one component (a named element, file or selector), or a critique of existing work.
5. Detect the stack from `package.json` and framework files (`vite.config.*`, `next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, a Webflow export); note the motion and GL libraries already installed.
6. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once — it drives every phase in order — then proceed with this skill if the user declines.

A request that names one element ("the hero", "this menu", "a cursor like…", a file, a selector) is this skill's scope even when `AWARDS.md` is absent.

Before implementation, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" <project-dir> --json` once for this environment (use the existing parent if the project does not exist yet). Read `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md` for failure handling; rerun after scaffolding/installing prerequisites, not at every handoff. Continue independent design/static work while missing browser evidence remains explicit. Skip this for status or ideas-only requests.

## Read before you build

Why: the corpus decides what "award-level" means for each component; guessing produces the Awwwards default.

- `${CLAUDE_PLUGIN_ROOT}/references/craft-floor.md` before any edit: the floor the audit measures.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/components-catalog.md`, the entry for the requested component: role, anatomy, motion, accessibility needs, recipe id, refuse notes.
- `${CLAUDE_PLUGIN_ROOT}/recipes/README.md` to find the recipe, then the recipe folder's `README.md` and `main.js`. For a static hero, editorial block, specification, typography or footer, use `${CLAUDE_PLUGIN_ROOT}/references/patterns/visual-composition.md` to open only that recipe’s declared desktop/mobile images and notes. Recipes are adapted (renamed, re-tokened, re-timed), never pasted unchanged.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/hero-archetypes.md` when the component is a hero.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/cursor-and-pointer.md` for cursors, magnetic targets, hover previews and drag surfaces.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/preloaders-and-transitions.md` for preloaders, menus that wipe, theme swaps and route transitions.
- `${CLAUDE_PLUGIN_ROOT}/references/patterns/accessibility-and-reduced-motion.md` for the state and path checklist every component must pass.
- `${CLAUDE_PLUGIN_ROOT}/references/anti-patterns.md` when the request describes an effect rather than a job ("add particles", "make it glow").

## Inputs

Why: three facts decide everything else; ask for none that the project already answers.

1. The target: a name, a file, or a selector. Open it and read the markup, styles and any script that already touches it.
2. The tokens: `DESIGN.md` if present; otherwise extract them from the existing CSS (`:root` custom properties, the body font stack, the two or three colours that recur) and write them down before changing anything. A component never brings its own palette or typeface into a site.
3. The motion library already installed (GSAP, anime.js, Motion, CSS only). Use it; a second library for one component is a refusal below. `--lib` overrides only on a standalone piece.

At most one AskUserQuestion round, and only when the job of the element is genuinely unclear (what should the menu contain; is the hero a video or type). Never ask about easings, colours or effects.

## The mini contract

Why: a component without a stated job grows effects; a stated job makes cutting easy. Six lines, written before code, kept in the reply and, when `AWARDS.md` exists, appended under `## Page map` as a note on the component's row.

```
JOB        what the element must do for the visitor (one sentence, a verb)
SIGNATURE  the one interaction, its physical metaphor, and the two jobs it does
MATERIAL   the tier: CSS only / GSAP / GSAP + canvas / WebGL, and why that tier
STATES     rest · hover · focus · active · open/closed or playing/paused · loading · empty · error · long text
PATHS      keyboard · coarse pointer · reduced motion · no JS · no WebGL (where relevant)
COST       bytes added, dependencies added (should be none), and the budget it must stay under
```

When the user wants to choose between directions, invoke the `awards:concept` skill now with the Skill tool, passing the brief and the AWARDS.md path with `--component`; do not do its work inline. It returns a six-line contract in this shape.

The signature must be one move. A menu that wipes, staggers, flips the theme and spawns particles has no signature; pick the wipe and the numbered stagger and let the rest be craft (`[pattern:motion-vocabulary#staggers]`).

## Catalogue lookup, then adapt

Why: the recipes are verified in a real browser with keyboard, touch and reduced-motion states; starting from one means starting from something that passes.

| Component | Recipe to adapt | Notes |
|---|---|---|
| Preloader | `preloader-counter-hold` | Tie the counter to the page's real signals; keep the repeat-visit skip |
| Navigation overlay | `nav-overlay-fullscreen` | Keep `inert`, the trap, Escape and the theme swap; re-number the links |
| Custom cursor | `cursor-two-speed` | Badges only for real affordances; off on coarse pointers |
| Magnetic CTA | `magnetic-button` | Radius from the button's own size; fine pointers only |
| Marquee / ticker | `marquee-raf-mask` | Real links inside; pause on focus |
| Sticky stack | `sticky-stack-cards` | Cards stay articles with headings |
| Horizontal gallery / rail | `horizontal-rail` | Native overflow on touch; arrow keys |
| Hover-preview list | `hover-preview-list` | Focus shows the preview too |
| Compare slider | `compare-hold-drag` | The handle is a slider role |
| Text reveal | `split-text-masked-reveal`, `flicker-text`, `scramble-decode-text` | After fonts; mirror text for AT |
| Theme switcher / colour as state | `theme-swap-tokens` | Tokens on `<html>`, canvas in the same tween |
| Page transition | `page-transitions` | Lifecycle in `gsap.context`; every page ships the contract |
| Image-distortion grid | `gl-dom-tethered-planes` | Images stay `<img>`; canvas `aria-hidden` |
| Hero | the archetype's recipes in `hero-archetypes.md` | The first-viewport test applies |
| Footer, 404 | `${CLAUDE_PLUGIN_ROOT}/assets/templates/404.html` and the catalogue entries | Authored copy, a way out |

Adapting means: rename classes to the project's convention, replace the recipe's demo tokens with the project's, re-time to the project's motion tokens (`--dur-hero`, `--ease-out-expo` or their equivalents), and delete every demo line that does not serve the job. Keep the recipe's accessibility scaffolding intact; it is the part most often lost.

## Build

Why: the order keeps the element honest at every step, so a capture at any point shows something that works.

1. Semantic markup first: the right element (`button`, `a`, `dialog`, `ol`, `figure`), headings that fit the page's outline, labels and roles from the catalogue entry.
2. Tokens, not values: every colour, size, easing and duration references the project's custom properties; new tokens only for the component's own measures (a radius, a stagger), named after the component.
3. The motion vocabulary inline: expo-out for entrances, `ease: 'none'` for anything scrubbed, framerate-independent damping for anything that follows the pointer (`[pattern:motion-vocabulary#easing]`).
4. WebGL only when the signature needs it. Then invoke the `awards:webgl` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline.
5. Reduced-motion tier and keyboard path in the same commit as the effect, never "later".
6. SSR safety where the stack renders on the server: no `window` at module top level, measurements after mount, the component readable before hydration.

## States and paths

Why: a component the jury sees in one state is a screenshot; a component that survives every state is a product.

- Interaction states: rest, hover, focus-visible, active, disabled, loading, empty, error, and the component's own (open / closed, playing / paused, dragging).
- Content states: the longest realistic label, a two-line heading, a missing image, twelve items instead of four.
- Keyboard: every pointer gesture has a key path (Enter/Space for holds, arrows for drags and rails, Escape for overlays, Tab order that matches the visual order, focus returned on close).
- Coarse pointer: cursor and magnetic effects off, hover-only reveals become tap or focus, drag surfaces declare `touch-action`.
- Reduced motion: state changes and hierarchy stay, spatial movement goes; nothing is hidden behind an animation that will not run (`[pattern:accessibility-and-reduced-motion#motion-tiers]`).
- No JS / no WebGL: the element is still readable and usable; images stay images.

## Verify

Why: a component is proven by a capture and the audit, not by the diff.

1. Allocate a fresh timestamp-plus-stage `capture_out` as in `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md`; run `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <page> --out "$capture_out" --selector "<selector>" --hover "<selector>" --mobile --reduced-motion --json` and open each image once: rest, hover, mobile, reduced motion. Add `--no-webgl` when the component uses GL. For open, focused, dragged or persisted states, write `.awards/capture-states.json` using `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md` and add `--states .awards/capture-states.json` to the same capture pass. Open every named frame, inspect its manifest errors/state, and carry the manifest path and plan path into the jury handoff.
2. `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <file or dir> --json`: no P0/P1 findings in the component's files; record any accepted P2/P3 under `AWARDS.md ## Exceptions` when the project has one.
3. The removal test: delete the effect (not the element) and confirm the element still does its job; if not, the effect was carrying content.
4. The specificity test: could a juror name the recipe's source site from this element? If yes, change the metaphor or the timing, not the copy.
5. The scope test: `git diff --stat` touches the component's files and shared tokens only; no other section changed.
6. Keyboard walk: Tab to the element, operate it fully, leave it; nothing traps, nothing is unreachable.
7. When `AWARDS.md` exists, note the component on its `## Page map` row with the recipe id and the reduced-motion tier.

## Hand-off

For a jury opinion on the single element, invoke the `awards:jury` skill now with the Skill tool, passing the brief and the AWARDS.md path with `--component <selector>`; do not do its work inline. It scores Design, Usability and Creativity for the element alone.

## Refuse

- Restyling anything outside the named target; the surrounding page is the given.
- A second font family, a new palette or a new dependency for one component; if the world genuinely lacks a primitive, say which and ask.
- Hover-only affordances, drag-only galleries, effects with no state and no keyboard path.
- Pasting a recipe unchanged, demo copy and demo tokens included.
- WebGL, particles or a cursor trail because they are expected; the mini contract's SIGNATURE line decides.
- "Make it premium" answered with glow, gradient text or glass: those are the reflex families in `anti-patterns.md`.
