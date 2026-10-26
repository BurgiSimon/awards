# Performance: INP and CLS

What this file is for: the two field metrics a motion-heavy page loses without noticing. INP covers how fast the page answers a click, tap or key. CLS covers how far the layout jumps while it loads. Both are decided by the motion layer, not by asset weight. LCP and the weight budgets live in `[pattern:asset-pipeline#budgets]` and `[pattern:asset-pipeline#staged-loading]`, and font loading lives in `[pattern:typography#loading]`. This file does not repeat them. Read it before the motion score is built and again before `ship`. Cite it as `[pattern:performance-cwv#section]`. The thresholds below are the platform's own. Corpus figures come from headless SwiftShader captures and are signals, never field data.

## Contents
1. [The two metrics](#the-two-metrics)
2. [How the plugin measures them](#how-the-plugin-measures-them)
3. [What makes INP poor on these sites](#what-makes-inp-poor-on-these-sites)
4. [Keeping interactions under 200 ms](#keeping-interactions-under-200-ms)
5. [CLS sources on these sites](#cls-sources-on-these-sites)
6. [Two cases from the recipes](#two-cases-from-the-recipes)
7. [Field data](#field-data)
8. [Verify](#verify) · [Refuse](#refuse)

## The two metrics

Why: a jury opens the page on a fast laptop. The visitor who taps the menu on a mid-range phone is the one the metric counts, and Core Web Vitals judge the 75th percentile of real page loads.

| Metric | Good | Poor | What counts | Source |
|---|---|---|---|---|
| INP | ≤ 200 ms | > 500 ms | clicks, taps and key presses; hover, zoom and scroll are not observed. Latency = input delay + processing + presentation delay up to the next frame | [verified: web.dev/articles/inp] |
| CLS | ≤ 0.1 | > 0.25 | the largest session window of unexpected shifts: gaps under 1 s, at most 5 s per window. Shifts within 500 ms of input carry `hadRecentInput` and are excluded. `transform` animations do not shift layout | [verified: web.dev/articles/cls] |
| Long task | — | > 50 ms | any main-thread task over 50 ms | [verified: web.dev/articles/optimize-long-tasks] |

INP replaced FID as a Core Web Vital on 12 March 2024 [verified: web.dev/blog/inp-cwv-march-12]. Hover is not an INP interaction. A `pointermove` handler that keeps the main thread busy still becomes the input delay of the click that follows it [inferred from the three phases above].

## How the plugin measures them

| Tool | What it reports | Read it as |
|---|---|---|
| `scripts/audit.mjs <url> --render`, rule **P08** | layout shift above 0.1 during load, read before any scroll. Above 0.25 it is raised to P1, and the largest source is named as `<tag.class>`. `renderedCoverage.<viewport>.clsLoad` holds the figure | the gate. A load shift is a build defect, and fixing it is cheap |
| `scripts/capture.mjs`, `metrics.<viewport>` | `cls` (largest session window over the whole pass), `longTasks`, `blockingMs` (the sum of each long task's time past 50 ms), and on desktop `inpLab`, the slowest of the capture's own interactions, with `interactions` counted | lab signals from a headless browser. Never report them as Core Web Vitals (`references/capture-states.md`) |
| `capture.mjs --states <plan>` | gives `inpLab` real interactions: the menu toggle, a carousel key, the add-to-bag button | without a plan, `inpLab` times only the capture's own key presses (a Shift before each focus frame, then three Tabs) |
| `capture.mjs --throttle` | the phone pass at 4× CPU, 150 ms round trip, 1.6 Mbps down and 750 Kbps up, recorded in `manifest.throttle` | the profile `ship` asks for when no DevTools trace exists |
| `scripts/crux.mjs <url>` | field p75 LCP, INP, CLS, FCP and TTFB per form factor (needs `CRUX_API_KEY`; exit 4 when the site is not in the dataset) | the only real-visitor numbers; see [Field data](#field-data) |

Corpus capture figures need care: one card's 4.41 is probably inflated by pages mounting below [site:grids-obys] [inferred], and another's 0.91 was measured under HTTP 429 throttling [site:okaydev] [verified]. A CLS that drops under reduced motion points at the motion: 0.417 on desktop and 0.807 on the phone against 0.012 reduced [site:christoph-nagel] [verified values; the panel entrances as the cause inferred], and 0.33 and 1.02 against 0 [site:nodeck] [verified].

## What makes INP poor on these sites

Why: an award page runs a scroll score, a cursor, a canvas and a splitter on the same main thread that has to answer the tap.

| Cause | Mechanism | Corpus | Fix |
|---|---|---|---|
| Splitting text at load, on font swap or on resize | "Splitting thousands of elements can be expensive", and `autoSplit` re-splits when fonts load and when the width changes [verified: gsap.com/docs/v3/Plugins/SplitText]. A re-split is a long task that lands on whatever the visitor does next | seventeen `new SplitText` calls on one home route [site:aardvarkbookclub] [verified]; headings split to chars, words and lines [site:abatable] [verified] | split lines or words, never chars for running text; split only what is near the viewport; `revert()` once a one-shot reveal has played (`[pattern:gsap-choreography#splittext-choreography]`) |
| Layout reads in scroll and resize handlers | reading a layout value after a style write forces a synchronous layout; batch the reads first [verified: web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing] | one scheduler reads every rect at the top of the frame and then runs subscribers that only write. It replaced 18 listeners and about 8 forced reflows a frame [site:zainabkabira] [verified]; resize batched through one recalc [site:robbietilton] [verified] | one ticker (`_shared/raf.js`); measure on `ResizeObserver` and cache; never call `getBoundingClientRect` inside a scroll callback |
| Heavy hover effects | filters, blurs, GL re-renders or layout changes driven by `pointermove`. They are not timed by INP, but they are the busy thread a click arrives on [inferred] | pointer-driven fluid masks and repulsion [site:noth] [verified]; a cursor image reveal kept to a CSS transform [site:the-line] [verified] | one pointer listener that writes a target; the ticker eases toward it; transforms and opacity only; heavy hover media only under `(hover: hover)` |
| Texture uploads and shader compiles on the main thread | the first render of an uninitialised texture pays its decode and GPU upload. `compileAsync` uses `KHR_parallel_shader_compile` [verified: three.js r186 `WebGLRenderer.js` doc comments, pinned in `recipes/`] | an upload queue with an 8 ms budget per frame [site:ascension-pegassi] [verified]; programs linked asynchronously and polled before first draw [site:cyphercapital] [verified]; the loader drawn in a worker so shader compiles never freeze it [site:cutobot-byholm] [verified]; four decode workers [site:igloo] [verified]; every material compiled one per frame on a fullscreen triangle as the last 15 % of the preloader count [site:everswap] [verified]; costly variants built only in idle callbacks with more than 12 ms free, and a second renderer prewarmed before it is asked for [site:daikifujita] [verified] | `initTexture` and `compileAsync` behind the preloader; a time-budgeted upload queue for later scenes; decode in workers; `[recipe:offscreen-canvas-worker]` for the one canvas that must keep moving |
| Route transitions that hold the first paint | presentation delay runs until the next frame is shown [verified: web.dev/articles/inp] | a 1.6 s curtain, then `location.assign` [site:serotoninn] [verified]; a route pushed at 1.6 s after the chosen row rises [site:boc] [verified] | paint a pressed state in the click's own frame, then run the choreography; `[recipe:transition-promote-chosen]` starts its fade at once |
| A large DOM | rendering work scales with DOM size, and `content-visibility` renders lazily [verified: web.dev/articles/optimize-inp] | ≈ 3,230 nodes [site:zainabkabira] [verified]; 203 case-study anchors for nine projects [site:boc] [verified]; a 928 KB document with the catalogue inlined [site:serotoninn] [verified] | fewer nodes per split and per marquee clone; `content-visibility: auto` with `contain-intrinsic-size` on long archives |
| Third-party tags | consent, analytics and captcha scripts on the same thread; a third-party notice can cost more than a self-built one [verified: web.dev/articles/cookie-notice-best-practices] | GTM, reCAPTCHA and a consent library on one page [site:goats] [verified] | load them async, after the first interaction where the law allows (`[pattern:consent-and-banners#loading-and-cost]`) |

## Keeping interactions under 200 ms

Plugin rules, each checked with `--states` on the throttled phone pass:

1. **Paint feedback first.** The handler's first job is the state change that paints: a class, `aria-expanded`, a pressed style. Expensive work comes after a yield. Yielding after a UI update is the guidance [verified: web.dev/articles/optimize-inp]. `setTimeout` starts a new task, and `scheduler.yield()` is not Baseline [verified: MDN Scheduler.yield], so feature-detect it and fall back to `setTimeout(0)`.
2. **Defer to the next frame.** Queue non-critical work from a `requestAnimationFrame` callback through a `setTimeout`, so it never blocks the next frame [verified: web.dev/articles/optimize-inp].
3. **Read, then write, once a frame.** Measurements are taken at the top of the shared tick. Writes are transforms and custom properties only.
4. **Text.** Fonts first, lines over chars, and only near the viewport. The reduced tier never splits (`[recipe:split-text-masked-reveal]`).
5. **GL.** Upload and compile behind the load gate (`[pattern:preloaders-and-transitions#the-load-contract]`). Stream neighbour scenes through a budgeted queue (`[pattern:webgl-architecture#scene-windows-and-disposal]`). Let the idle gate stop the loop when nothing moves (`[recipe:gl-fps-governor-idle-gate]`).
6. **Keys and buttons.** A carousel, reel or tab key handler changes the index and announces it. The tween runs on the ticker afterwards (`[recipe:blur-peek-snap-carousel]`).
7. **Targets.** `inpLab` ≤ 200 ms for every state in the plan on the throttled phone pass. `blockingMs` is read before and after each motion batch: a rise is a regression even when INP still passes.

## CLS sources on these sites

Why: a page that settles into place looks authored, and a page that jumps once looks broken. These sources all come from the motion layer.

| Source | Why it shifts | Corpus or recipe | Fix |
|---|---|---|---|
| Preloader exit | an in-flow loader removed, or the hero inserted after it; an exit animated on `top` | a boot roll moved from `top` to `transform` after it caused the page's whole CLS [site:mensch] [verified, source comment]; 0.65 measured on a gate [site:siena] [verified] | the loader is a fixed overlay over the final layout, and its exit is transform, opacity or clip-path |
| Late font swap | fallback metrics differ from the web face; `size-adjust` narrows the gap, and `font-display: optional` can avoid the re-layout [verified: web.dev/articles/optimize-cls] | a metric-matched fallback generated by the framework [site:boc] [verified] | `[pattern:typography#loading]`; re-split only after `document.fonts.ready` |
| Gaps, sizes or layout classes set from script after first paint | the first frame paints the CSS layout, then the script changes it | `[recipe:blur-peek-snap-carousel]` 0.12; `[recipe:gl-endless-reel-sheets]` 0.81 (next section); an inline block reserving each home section's height while scripts load [site:okaydev] [verified] | compute the value in CSS, or decide the class in a head script |
| Media without dimensions | the box has no height until the file arrives; set `width`/`height` or `aspect-ratio` [verified: web.dev/articles/optimize-cls] (audit P01) | 0.3142 on a phone, with `aspect-ratio` the card's recommended fix [site:the-line] [verified value; cause not established] | dimensions on every `img`, `video` and canvas box; reserve the canvas box [site:united-carriers] (0.34 on mobile [verified]) |
| Consent banner | "Top-of-screen cookie notices are a very common source of layout shift" [verified: web.dev/articles/cookie-notice-best-practices] | 0.34 on a phone with a banner over the bottom third [site:siteassist] [verified values; cause not established] | an overlay that never moves the page (`[pattern:consent-and-banners#placement-and-size]`) |
| Entrances that animate layout | changing `top` or `left` shifts layout; transforms do not [verified: web.dev/articles/optimize-cls] | the reduced-motion drops above [site:christoph-nagel] [site:nodeck] | entrances on transform and opacity; `margin`, `height` and `top` never tweened |
| Late or lazy text | a skipped `content-visibility` box with no intrinsic size makes the scrollbar jump [verified: web.dev/articles/content-visibility] | line balance computed in JS and `min-height: Nlh` reserved before the text arrives [site:a24-raviklaassens] [verified] | `contain-intrinsic-size: auto <h>`; reserve heading heights before a split |
| Pin spacers created after load | a pinned section inserts its spacer once the script runs | 1.23 on desktop, likely the pin spacer and late media [site:noth] [inferred] | create pins before the reveal, or reserve the pinned height in CSS; P08 reads before any scroll |

## Two cases from the recipes

Both were found by `audit.mjs --render` (P08) during the recipe sweeps recorded in `docs/handoff/state.md`.

- **A gap set from script.** `[recipe:blur-peek-snap-carousel]` sizes the gap so that a fixed slice of each neighbour shows. `main.js` computed it and wrote `track.style.gap`. The value arrived a frame after first paint and moved every card: a 0.12 shift. The fix states the same formula in CSS first, `gap: max(20px, 40cqw - min(62vw, 880px, 66svh) / 2)` on a container-query width, so the script only confirms a value that is already painted.
- **A layout class added after load.** `[recipe:gl-endless-reel-sheets]` is a list without WebGL and a reel with it. The module added the reel class once it had a context, so the whole page swapped layout after load: a 0.81 shift. The fix moves the decision into a head script that runs the same WebGL test before first paint and sets the class on `<html>`. `main.js` only removes it when WebGL fails, and that later change is the rare path.

The rule from both cases: anything that decides layout is decided before first paint, in CSS or in a blocking head script of a few lines. A module may only confirm it, or undo it on failure.

## Field data

`scripts/crux.mjs` reads the Chrome UX Report: a 28-day rolling average, updated daily, reported at p75 [verified: developer.chrome.com/docs/crux/api]. A page or origin is included only when it is publicly discoverable and sufficiently popular [verified: developer.chrome.com/docs/crux/methodology]. A launch-week award site usually has no record, so exit 4 is the normal answer. Until a record exists, the throttled capture is the evidence, and `AWARDS.md ## Ship log` says so. Never quote a lab `inpLab`, `cls` or `lcpColdSynthetic` as a Core Web Vital.

## Verify

- [ ] `audit.mjs --render` has no P08 at desktop or phone; every shift source it named has been removed, not just reduced.
- [ ] A `--states` plan times the menu, the main carousel or reel key, the primary CTA and, on a shop, add-to-bag; `inpLab` ≤ 200 ms for each on the throttled phone pass.
- [ ] `blockingMs` was recorded before and after the motion batch, and any rise is explained.
- [ ] Text splits wait for fonts, avoid chars on running text and are reverted when done.
- [ ] Textures are uploaded and shaders compiled behind the load gate, and later scenes stream through a budgeted queue.
- [ ] Layout-deciding classes and sizes are set before first paint; the loader is a fixed overlay; entrances are transforms.
- [ ] `crux.mjs` was run once the site is live; a missing record is noted rather than replaced with lab figures.

## Refuse

- A layout value or class that only script knows, applied after first paint.
- An in-flow preloader, or an exit on `top`, `height` or `margin`.
- `getBoundingClientRect` or `offsetHeight` read inside a scroll or pointer handler.
- Character splits on paragraphs; splits that are never reverted; re-splits on every resize without `autoSplit`'s width check.
- First-render texture uploads and shader compiles during the visitor's first interaction.
- A click whose first painted frame waits for a 1 s timeline.
- Lab figures reported as field Core Web Vitals.
