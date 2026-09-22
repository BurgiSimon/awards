---
name: ship
description: Takes an award-level site or component from "it works" to "it ships". Applies the jury's fix list in one batch, runs the deterministic craft-floor audit (reflex fonts, contrast, reduced-motion branch, landmarks and alt, overflow, scrub easing, will-change, browser surfaces, slop patterns) until every finding is fixed or recorded as an exception, captures desktop, mobile, scroll-state and reduced-motion screenshots, checks the performance budgets (entry JS, GL chunk, images, meshes, fonts, LCP, CLS), meta and Open Graph, favicon, 404, console errors, and writes the ship report. Use whenever the user says ship, launch, finalize, polish, QA, "make it production-ready", "check performance or accessibility", "run the audit", "take screenshots", or after any awards build or jury round in a project with an AWARDS.md. Not a deploy tool, nor for ordinary app screens with no award framing.
argument-hint: "[path | url] [--fix] [--report-only] [--states <json-file>]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*), Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/*)
---

# awards:ship — fix, prove, report

Codex: read [the runtime guidance](../../references/codex.md) before following this skill; it maps plugin paths, tool names and handoffs to Codex.

The jury judges; this skill fixes and proves. A ship pass ends with evidence a stranger could check: an audit at zero, five valid captures, measured budgets and a report. It never redesigns, because a fix that needs a new idea is a concept problem and goes back to `awards:craft`.

Arguments: `$ARGUMENTS`

- a path (the project directory or its built `dist/`) or a URL; with nothing given, the project root and its build output
- `--fix` — apply the jury's fix batch and the audit fixes (the default whenever a jury report exists)
- `--report-only` — prove without changing site source: audit, captures, budgets, checks, report; throughout this skill, list fixes without applying them
- `--states <json-file>` — interaction plan to replay; otherwise reuse the recorded plan or `.awards/capture-states.json` when present

## Setup

Read `AWARDS.md` and `DESIGN.md` in the project root when they exist; `## Status` in `AWARDS.md` says which phases are done, so resume from there instead of restarting. Read impeccable's `PRODUCT.md` for product truth when it exists and never overwrite it. Detect the scope (a whole site, one component named by file or selector, or a critique of something that already exists) and the stack (framework, animation and 3D libraries, build tool) from `package.json`, lockfiles and the entry files. When the request is clearly a whole site and no direction contract exists yet, offer `/awards:craft` once, then proceed with this skill.

Also read `${CLAUDE_PLUGIN_ROOT}/references/craft-floor.md` before touching any file: it is the list of what a Developer Award jury checks in the first minute, and every rule id below points into it. When the request is "ship" or "finalize" and no `.awards/jury/<date>.md` exists yet, the fix list is missing: invoke the `awards:jury` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the request is only the audit, run section 2 once and report findings without edits. When it is only screenshots, run section 3 and report the capture paths/errors without fixes or a jury round. Only a full ship/finalize request runs all sections.

Before a build or browser capture, run `node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" <project-dir> --json` if this environment has not been checked since setup changed. Follow `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md` for failures; a static-audit-only request needs no browser preflight.

## How a pass runs

1. Fix batch from the jury list (section 1), applied once.
2. Audit until clean or excepted (section 2).
3. Build, capture, open every frame (section 3).
4. Budgets measured from the build (section 4).
5. Accessibility and usability verified against the build (section 5).
6. Meta, chrome and browser surfaces (sections 6 and 7).
7. Cleanup (section 8), then the report and the hand-off (section 9).

## 1. The fix batch

Why: fixes applied one at a time, each followed by a capture, turn a ship pass into a week; fixes invented here, outside the jury list, drift the build away from its contract. The batch comes strictly from the latest jury report, is classified so each fix lands at the right level, and is applied once before a single recapture.

Read `## Material fixes` and `## Keep` from the latest `.awards/jury/<date>.md`. The Keep line is a constraint on every fix: nothing in the batch may dilute what it names. Classify each fix before touching code:

| Class | What it means | Where the fix goes |
|---|---|---|
| token | the wrong value lives in `tokens.css` or `DESIGN.md`: a contrast pair, a display size, a spacing step | at the token, never per instance, so it propagates |
| one-off | one element in one file: a missing alt, a hover-only affordance, a stray second accent on one section | that element |
| conceptual | resolving it would change the THESIS, the SIGNATURE or the WORLD | not a ship fix; record it as `deferred — conceptual` and hand it back through `awards:craft` |
| local | a component's internal states or motion: a focus trap, arrow keys on a rail, the reduced-motion tier of one moment | inside the component and its tokens |

- Apply every token, one-off and local fix in one batch, in the jury's order: fidelity first, then walk steps 1 and 3, then audit P0/P1, then seams.
- Keep each change as small as the fix demands; the jury named a location and a change, not a rewrite.
- Recapture once after the batch (section 3), not after each fix.
- A fix that turns out to need a decision the jury did not make (a new colour, a new moment) stops the batch for that item: reclassify it as conceptual and move on.
- Log every fix in the report's table with its class and whether it is done.

With `--report-only`, list the fixes and their classes in the report without applying them.

## 2. The deterministic audit

Why: the audit measures the part of the craft floor that a script can measure, so the jury can spend its attention on what a script cannot. It is repeatable, which is what makes "the audit is clean" a claim rather than a mood.

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <dir> --json
```

- Run it against the project directory: it is static and needs source; add `--render` for the in-page checks when Playwright is available. Exit 2 means P0 or P1 findings remain; exit 0 means none. The findings land in `.awards/audit.json` with `rule`, `severity`, `file`, `line`, `message` and `fix`.
- Every finding is either fixed or recorded. A recorded finding is one line under `AWARDS.md ## Exceptions`, or an inline comment next to the code when it concerns one file:

```
## Exceptions
C02 — pure black is diegetic: the whole site is a night-vision console
M08 — the marquee is already paused by the IntersectionObserver in src/marquee.js

<!-- audit-ignore: L01 the poster frame is a fixed 1200px print artefact by design -->
```

- The reason is one a juror would accept; `C02 — looks better` is not a reason.
- P0 findings (M01, no reduced-motion branch; L03, no viewport meta) are never excepted. P3 surface findings (S01–S06) are fixed rather than excepted, because they are cheap and jurors notice them.
- Re-run until the exit code is 0 and every remaining P2 or P3 is fixed or excepted. Name the rules by id in the report, with counts per severity and the exception count.
- The PostToolUse hook already reported quick findings while files were edited; this full run is the one that counts, because it sees the whole project and the build output.

## 3. Captures and their validity

Why: the jury and the user judge from these frames, and a stale or broken capture proves nothing. Capture the built output when a build exists, because preloads, hashed chunks and budgets only exist there.

```
npm run build
node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" dist --out .awards/captures --scroll 0,50,100 --mobile --reduced-motion --json
```

For static HTML with no build script, capture the source directory directly. For a component, add `--selector "<selector>" --hover "<selector>"`. Add `--states <json-file>` for the recorded interaction plan; use `${CLAUDE_PLUGIN_ROOT}/references/capture-states.md` to create one for required menu, focus, drag or persistence states. Inspect each named frame and its manifest entry; a failed action is missing evidence, even when baseline frames passed. When the target is a URL with no local source, capture the URL and use `audit.mjs <url> --render` for rendered checks. Mark the static-source audit and build budgets unmeasured unless the served assets were actually fetched and inspected.

Then open each file with the Read tool, once, and check:

- `desktop-s00`, `desktop-s50`, `desktop-s100`, `mobile-s00`, `desktop-rm-s00` (and the component frames) exist and are not blank, not one flat colour, not a stuck preloader; the three scroll states differ.
- `desktop-rm-s00` is fully readable at rest: no line left translated, masked or at opacity 0.
- `mobile-s00` shows a designed phone layout with reachable navigation, not a shrunken desktop.
- `manifest.json`: `consoleErrors`, `pageErrors` and `failedRequests` are empty; `metrics` carries the CLS number for section 4, says whether WebGL initialised, and reports `lcpColdSynthetic`, which is not a field LCP — see the performance table.

An invalid capture is a bug to fix now, followed by a recapture; the report never lists a capture that was not opened.

## 4. Performance budgets

Why: a Site of the Year shipped its whole 3D app at under half a megabyte gzipped, and the developer jury docks every heavy asset it can see in the network panel. Budgets are measured from the build output, gzipped, never from source sizes; the full table with its sources is in `${CLAUDE_PLUGIN_ROOT}/references/patterns/asset-pipeline.md#budgets`, to read when a number is disputed.

| Check | Budget | How to measure or fix |
|---|---|---|
| LCP | ≤ 2.5 s on a throttled 4G profile | Lighthouse or a throttled DevTools trace. The manifest's `lcpColdSynthetic` is **not** an LCP measurement — headless, cold cache, software GL, and observed to differ by two orders of magnitude between viewports of one run — so never record it as this row's value; write `not measured` when no real trace was taken. LCP comes from a poster or DOM text, never from the canvas |
| Entry JS | ≤ 200 KB gz (P04 fails at 300) | the bundler's gzip column, or `gzip -c dist/assets/<entry>.js \| wc -c` |
| GL chunk | lazy, ≤ 500 KB gz | Three, OGL or R3F behind a dynamic `import()` in its own chunk, loaded after the first paint |
| Textures | compressed, ≤ 700 KB per scene | KTX2 for GL, AVIF or WebP for DOM rasters; no PNG photographs |
| Meshes | Draco or Meshopt (P03), hero mesh ≤ 300 KB | the loader has the decoder wired |
| Fonts | ≤ 4 files, ≤ 400 KB (P05), subset, woff2, `font-display` (T05), `size-adjust` fallback (T06) | `<link rel="preload" as="font" crossorigin>` for the faces used above the fold |
| `<img>` | `width` and `height`, `loading="lazy"` below the fold, `decoding="async"`, `srcset` and `sizes` for large rasters (P01, P02) | every raster under 1 MB |
| `<video>` | `muted`, `playsinline`, `poster`, `preload="metadata"` (A10) | autoplay only with all four |
| Preloader exit | CLS ≈ 0 | the page is laid out beneath the overlay before it leaves; nothing reflows on exit |
| Off-screen chapters | `content-visibility: auto` with `contain-intrinsic-size` | long pages only; never on the chapter that holds a pinned stage |
| Renderer | DPR capped at 2 (P06), `dispose()` on route change (P07) | one ticker shared with the animation library |

Measure sizes from the build, not from memory:

```
npm run build
for f in dist/assets/*.js; do printf '%s %s KB gz\n' "$f" $(( $(gzip -c "$f" | wc -c) / 1024 )); done
find dist -name '*.woff2' -o -name '*.woff' | xargs -r du -ch | tail -1
find dist \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' -o -name '*.avif' \) -size +500k
```

The entry chunk is the one `index.html` loads with `type="module"`; the GL chunk is the one the dynamic `import()` produces. Write both numbers into the report even when they are inside budget, so the next pass can see drift.

## 5. Accessibility and usability

Why: usability is the lowest axis on nineteen of the twenty verified corpus entries [verified, twenty Awwwards entries read 2026-09-18], and a jury that finds a keyboard dead end at the first gesture stops looking for the good parts. Verify each item from the captures and the source; when a reduced-motion tier needs rework, read `${CLAUDE_PLUGIN_ROOT}/references/patterns/accessibility-and-reduced-motion.md` for the three tiers and the keyboard paths.

- Landmarks with one `<main>` and one `<h1>`, an unbroken heading order, `lang` on `<html>` (A01, A03, A09).
- A skip link first in the tab order, landing on `<main>`.
- Visible `:focus-visible` styles in the world's own register, never `outline: none` without a replacement (A06, A07).
- Reduced-motion tiers verified, not assumed: `desktop-rm-s00` readable, state changes preserved (the menu opens, the theme swaps, the slider compares), loops static or paused, no global kill (M01, M02).
- Keyboard walk: Tab through the whole page; the fullscreen menu traps focus, closes on Escape, returns focus and sets the page `inert`.
- Walk in this order and stop at the first dead end: skip link → header links → menu trigger and the open menu → every gesture in page order (hold gates, drags, compare sliders, rails) → forms → footer → the 404's way out.
- Every drag, hold or draw gesture has a key path (A11); a virtual scroll still moves on Space, PageDown and arrows.
- Coarse pointer: custom cursor and magnetic effects off under `(hover: none), (pointer: coarse)` (A08); nothing hover-only; touch targets at least 44 px; rails become native overflow.
- Body contrast at least 4.5:1 (C01); the `theme-color` and selection pair keep contrast in both themes.
- Every canvas `aria-hidden` with its text and images mirrored in the DOM, or carrying an accessible name (A04).
- Live regions: preloader progress in an `aria-live="polite"` element; route changes announce the new title.
- Sound strictly opt-in, with the toggle reachable by keyboard and persisted.

## 6. Meta and chrome

Why: the tab, the link preview and the error page are the first and last things a juror sees, and they are the cheapest places to look unfinished. Every value below comes from the tokens and the type contract, so the chrome belongs to the world.

| Item | Ships when |
|---|---|
| `<title>` | authored per route, never "Home" or the framework default |
| `<meta name="description">` | authored, specific, one sentence in the site's register |
| canonical | present per route |
| Open Graph and Twitter card | title, description and an image designed in the world at 1200 × 630 (S06); the preview checked once |
| favicon | SVG with a PNG fallback and an apple-touch-icon, drawn from the tokens (S05) |
| `theme-color` | per theme via `media`, from the tokens (S03) |
| `color-scheme` | declared on `<html>` or in a meta (S04) |
| 404 | an authored moment with a way out; start from `${CLAUDE_PLUGIN_ROOT}/assets/templates/404.html` when none exists, keep the same tokens, wire it to the host (a root `404.html` on static hosts, the framework's not-found route otherwise) |
| `robots.txt`, `sitemap.xml` | present and truthful; no `noindex` left over from staging |
| `lang` | set on `<html>` (A09) |

## 7. Browser surfaces

Why: default blue selection, a grey system scrollbar or a black focus ring on a warm dark ground announces that nobody looked. Read `DESIGN.md ## Browser surfaces` for the decided values and verify each exists in the shipped CSS.

- `::selection` (S01), `caret-color`, `accent-color` for native controls, `-webkit-tap-highlight-color` on touch.
- Scrollbar styled through `scrollbar-color` and `scrollbar-width`, with the `::-webkit-scrollbar` fallback (S02); never hidden on a page that scrolls.
- Focus ring in the world's accent with an offset; `overscroll-behavior` where a full-screen stage would rubber-band.

## 8. Cleanup

Why: a shipped debug panel or a console full of logs costs the code-quality sub-score and tells the jury the site was never opened in a clean profile.

- Debug flags off: query-string switches, `stats.js`, GUI panels, `ScrollTrigger` markers, wireframe toggles.
- No `console.log` in the shipped bundle; no `console.error` from the page in a clean profile (the manifest shows zero).
- Unused dependencies removed from `package.json` (`npx depcheck` when available, otherwise grep the imports); lockfile updated.
- `.awards/captures/`, `.awards/research/` and `.awards/audit.json` in `.gitignore`; reports under `.awards/jury/` and `.awards/ship/` stay tracked.
- Synthetic content labels in `AWARDS.md ## Brief` still true; no lorem or placeholder images (X02).

## Component mode

Why: a single component ships inside a world that already shipped, so the pass narrows to what the component owns. Run the batch, the audit and the captures with `--selector` and `--hover`, measure only the budgets the component touches (its chunk, its assets, its fonts), verify its states (rest, hover, focus-visible, active, open and closed, reduced motion, coarse pointer, keyboard), and skip sections 6 and 7 unless the component changed a token they use.

## 9. The ship report

Why: `awards:craft` and the user need one document that says what changed, what was measured and what remains, so the state of the build is never in someone's memory.

- Fill a copy of `${CLAUDE_PLUGIN_ROOT}/assets/templates/ship-report.md` and write it to `.awards/ship/<date>.md` (`date +%F`; suffix `-2` when taken): the fix table with classes, the audit counts and exceptions, the captures line, the performance table with measured values against budgets, the walk items, meta and chrome, browser surfaces, cleanup, and the status.
- Append one line under `AWARDS.md ## Ship log`:

```
- <date> · audit P0 n / P1 n / P2 n / P3 n · exceptions n · captures 5 valid · entry x KB gz · GL y KB gz · LCP z s (throttled | unthrottled | not measured) · CLS c · .awards/ship/<date>.md
```

- A material fix is any change that alters what a capture shows: layout, motion, colour, type, copy, a state. Meta, cleanup, exceptions and gitignore changes are not material.
- Set `## Status`: tick `Shipped (ship)` when no material fix was applied and the audit is clean; otherwise write `back to awards:jury --verdict` in the report's status line and leave the box unticked until the verdict comes back `ship`.
- Remind the user that headless captures prove correctness, not frame rate: WebGL work needs one pass on a real phone before launch.

## Verify

- `.awards/audit.json` is fresh, exits 0, and every remaining finding has a reason under `## Exceptions` or inline.
- Five captures (or the component set) were opened and are valid; the manifest shows zero console errors, page errors and failed requests.
- Every row of the performance table carries a measured value, gzipped where it is a size, with the throttled, unthrottled or not-measured label on LCP; the capture manifest's `lcpColdSynthetic` is never that value.
- The keyboard walk and the reduced-motion check were done against the build, not assumed from the source.
- Title, description, OG image, favicon, `theme-color`, `color-scheme`, 404, robots and sitemap exist and were authored, not generated.
- `.awards/ship/<date>.md` exists, `## Ship log` has its line, `## Status` reflects the outcome, and no jury fix was skipped without a `deferred — conceptual` entry.

## Hand-off

When any material fix was applied, invoke the `awards:jury` skill now with the Skill tool, passing the brief and the AWARDS.md path (with `--verdict` and the target); do not do its work inline. Deferred conceptual fixes go back to `awards:craft` with the report path. With no material fix and a clean audit, the build is shipped: return the report path and the performance line to the user or to `awards:craft`.

## Refuse

- A reduced-motion branch that kills everything (`* { animation: none !important }` or a global 0.01 ms duration); tier the motion instead (M02).
- Removing the signature to pass a budget; tier it, lazy-load it or lower its resolution.
- A preloader that runs longer than 2.5 s on a repeat visit, or one not tied to a real load signal.
- Excepting a P0 finding, or any finding without a reason a juror would accept.
- Redesigning during the fix batch, or adding fixes the jury did not list.
- Writing "shipped" with the audit red, a capture unopened or a budget unmeasured.
