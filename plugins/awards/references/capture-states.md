# Environment checks and interactive captures

## Check the environment early

From the website project, before implementation or the first capture:

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" . --json
```

For a new project whose directory does not exist yet, check its existing parent first. Rerun against the project after scaffolding/installing dependencies, or when the environment changes; do not repeat it at every skill handoff.

Doctor checks the Node/npm versions, declared dependencies, build-script availability, writable project/report locations, Playwright resolution, and a real Chromium launch and screenshot. It also probes headless WebGL2. It installs nothing, makes no network probes or configuration changes, and removes its temporary write probes. No package/build yet is a warning: static HTML remains usable. WebGL absence is a warning requiring a DOM fallback. The check does not run the project's build or measure real-device performance.

Exit **0** means required checks passed (inspect warnings); **2** means a prerequisite failed; **1** means invalid arguments/target. JSON includes `ready` and `checks[]` with `id`, `status`, `detail` and an actionable `fix` on failure. Resolve only the missing prerequisites for the requested work. Independent design and static-source work can continue while browser setup is pending; capture and visual-verification claims cannot.

Playwright resolves from the working project, `AWARDS_PLAYWRIGHT` (a project directory containing `node_modules/playwright`), or global npm. `AWARDS_CHROMIUM` can select an existing executable; an invalid explicit path fails instead of silently falling back. The check does not change host permissions.

## Immutable orchestrated passes

For each Awards phase or recapture that produces evidence for another phase, allocate a **new** timestamp-plus-stage directory under `.awards/captures/` and pass it with `--out`. For example, run `capture_out=".awards/captures/$(date -u +%Y%m%dT%H%M%S)-static"` immediately before a static pass, then `--out "$capture_out"`; use `jury`, `ship`, `component`, `motion`, `stack`, `nogl`, or another stage for later passes. If that directory already exists, choose a fresh timestamp before capture. Allocate again for every fallback, verdict or component recapture. Record `$capture_out/manifest.json` in Page map Notes or the report and pass the exact directory (and any state plan) to the juror. Choose `--scroll` positions that cover each applicable Page map chapter at desktop and mobile widths, including middle and close; add `--reduced-motion` and `--states` for required sections/interactions. Record gaps as unmeasured and recapture into another fresh directory when needed. Compare only files listed by each recorded manifest. Standalone `capture.mjs` without `--out` keeps its existing `.awards/captures` default. The one fixed name is structure's hero probe: `.awards/captures/hero-probe`, then `hero-probe-2`.

## Default control frames

Without `--hover` or `--states`, the desktop pass also records hover and focus-visible frames for the first three visible links and buttons (inside `--selector` when given): `[prefix-]desktop-hover-<n>.png` and `[prefix-]desktop-focus-<n>.png`, each a crop around the control. Manifest entries carry `kind: "hover"` or `"focus-visible"`, `index`, and `element` (`tag`, `text`, `matched`: whether the control really took the state). A page without controls records none; these frames never fail the capture. Open them before judging hover or focus finish; a `matched: false` frame is not evidence.

## Capture named states

Keep a small JSON plan with the project, for example `.awards/capture-states.json`:

```json
[
  {
    "name": "menu-open",
    "actions": [
      { "type": "click", "selector": "[data-menu-toggle]" },
      { "type": "waitFor", "selector": "[data-menu]:not([hidden])" }
    ],
    "selector": "[data-menu]"
  },
  {
    "name": "menu-keyboard",
    "actions": [
      { "type": "focus", "selector": "[data-menu-toggle]" },
      { "type": "press", "key": "Enter" },
      { "type": "press", "key": "Tab" }
    ]
  },
  {
    "name": "menu-dismissed",
    "actions": [
      { "type": "click", "selector": "[data-menu-toggle]" },
      { "type": "press", "key": "Escape" },
      { "type": "waitFor", "selector": "[data-menu]", "state": "hidden" }
    ]
  }
]
```

Replace selectors with the actual controls. For an orchestrated pass, allocate a fresh output directory as above and capture once after the edit batch:

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <dir|url> --out "$capture_out" --states .awards/capture-states.json --reduced-motion --json
```

Existing scroll/component frames and filenames stay intact. Additional files use `[prefix-]<viewport>-state-<name>.png`, including `desktop`, `tablet`, `mobile` and, with `--reduced-motion`, `desktop-rm`. `--only desktop`, `--only tablet` or `--only mobile` limits the regular viewports; reduced motion adds its desktop pass. Each state navigates to the original target and runs its actions in order. Cookies and storage persist within a viewport, so a theme selection can be tested through `reload`; viewports use separate contexts. States are independent interaction sequences, not continuations of the preceding state's DOM.

Each state needs a unique lowercase slug `name` (letters, digits, hyphens, 1–64 characters) and an `actions` array, which may be empty. Its optional `selector` crops the final frame and overrides the command's `--selector`; otherwise the command selector or viewport is captured. Selector crops fail when missing or ambiguous. Use separate plans with `--only` if desktop/mobile controls or drag coordinates differ.

| Action `type` | Fields |
|---|---|
| `click`, `hover`, `focus` | `selector` |
| `press` | `key`, e.g. `Enter`, `Escape`, `Tab`, `Shift+Tab`, `ArrowRight` |
| `move` | viewport coordinates `x`, `y`; optional `steps` (default 8) |
| `down`, `up` | none; left mouse button, combine with `move` for a drag |
| `wheel` | optional `dx`, `dy` (default 0); add a wait for an animated scroll |
| `wait` | optional `ms` (default 300) |
| `waitFor` | `selector`; optional `state`: `visible` (default), `hidden`, `attached`, `detached` |
| `reload` | none; waits for load and the optional Awards ready hook |

An optional positive `timeout` in milliseconds overrides `--timeout` for selector actions and reload. Prefer `waitFor` to fixed waits. External JSON cannot contain executable predicates; trusted bundled recipe verifiers retain their `waitFor.fn` support through the same action runner.

The manifest retains the supplied plan in `interactiveStates`. Successful checkpoints record `kind: "state"`, `name`, `actions`, `selector`, `file` and the optional `window.__awards.state()` result as `awardsState`. A failed action records its viewport, state name and action index in `pageErrors`, omits that state's capture, and continues with later states. Earlier frames and the manifest survive. Old files may remain in a reused output directory: judge only the current manifest's entries.

Capture exits: **0** success, **1** invalid usage/plan, **2** page or action errors, **3** browser unavailable, **4** initial target unreachable, **5** `--gpu` reached a software renderer. A page that answers but never fires `load` within `--timeout` (a frame queue that stalls, a challenge iframe that keeps retrying) is captured once its document has parsed, and the viewport is listed in `manifest.loadTimeouts`; read that as an observation about the page's load, and expect a preloader that waits on the same requests to be showing. Invalid plans fail before browser launch or output creation. A failed browser launch is recorded in the manifest; missing Playwright is reported before a manifest can be created. Open every required frame and inspect errors before using it as evidence. Screenshots show a state; assertions against live DOM behavior prove focus trapping, persistence and teardown.

## Evidence beyond the scroll frames

Every page pass (not `--selector` runs) also writes:

- **Tablet frames.** `tablet-s<nn>.png` at 834 × 1194, touch, an iPad user agent: the third width Responsive Design is judged at. `--tablet <w>x<h>` changes it, `--no-tablet` drops it; a `--selector` run adds it only when `--tablet` is named.
- **The accessibility tree.** `<viewport>-aria.yml`, Playwright's ARIA snapshot of `<body>` at that width: landmarks, headings with levels, names of links and controls. It is the Semantics / SEO evidence and shows whether a canvas chapter's words exist in the DOM.
- **Interaction and main-thread metrics** in `metrics.<viewport>`: `cls` (largest session window), `longTasks` and `blockingMs` (time past 50 ms per long task), and on desktop `inpLab`, the slowest of the capture's own keyboard steps with `interactions` counted. Lab figures from a headless browser; never report them as field Core Web Vitals.
- **Pictures** in `metrics.<viewport>.pictures`: `shareByScroll` gives, per scroll frame, the share of the viewport that is `picture` (photographs, clips, raster images, url() backgrounds) and `made` (canvases and large SVG drawings), sampled on a 24 × 15 grid; `raster`, `videos`, `drawings` and `canvases` count the page's pictures, and `sectionsWithPictures` of `sections` carry one a third of the viewport wide. What `references/patterns/imagery-and-assets.md#how-much-picture` reads.

On request:

| Flag | What it adds | Read it as |
|---|---|---|
| `--timeline 0,400,1200,2400` | `desktop-t<ms>.png` at those milliseconds of page time and `desktop-timeline.png`, all frames on one captioned sheet. The page clock is paused before navigation, so timers, `requestAnimationFrame` and GSAP advance only by those steps: two runs give the same frames | a preloader, an intro sequence, a marquee or an autoplay at fixed moments. CSS animations and transitions run on the browser's own clock and are not held |
| `--video` | `desktop-scroll.webm`, a real-time wheel pass from top to bottom over about six seconds | for people: the jury cannot play video, so pair it with `--timeline` |
| `--throttle` | the phone pass at 4× CPU, 150 ms round trip, 1.6 Mbps down and 750 Kbps up (Lighthouse's mobile values); `manifest.throttle` names them | the throttled lab LCP, CLS and blocking time `ship` asks for when no DevTools trace exists |
| `--gpu` (`--headed`) | launches on the platform's GPU backend (`AWARDS_GPU_ARGS` overrides the flags), refuses with exit 5 when the renderer is still SwiftShader or llvmpipe, and records `frames.<viewport>`: p50 and p95 frame time and the share of slow frames, at rest and while scrolling | the only frame-time numbers worth quoting; run it on a machine with a GPU, never in a cloud sandbox |
| `--walk` | `walk.json` and frames for the stops with a finding: on desktop every Tab stop from the top (name, in view, under a fixed bar, a visible change when focused), a Shift+Tab pass back up, each `aria-expanded` disclosure opened with Enter and tried with Shift+Tab and Escape, each button pressed with Enter (a `role="button"` with Space too); on the phone each button and disclosure tapped. `manifest.walk` counts the stops and findings | the jury's usability walk steps 1 and 2, measured instead of read off stills; a full-viewport canvas over the page is not judged as a cover |
| `--baseline <earlier capture_out>` | for every PNG with the same name in the earlier pass, `diff[]` in the manifest: the changed share of pixels, the box around the changes, and a map in `diff/` (changes in red over the faded new frame) | what a fix round actually changed, and what it changed by accident |

Field data and other engines, outside the capture: `node "${CLAUDE_PLUGIN_ROOT}/scripts/crux.mjs" <url>` reads the Chrome UX Report's p75 LCP, INP, CLS, FCP and TTFB for a live site with enough Chrome traffic (needs `CRUX_API_KEY`; exit 4 when the site is not in the dataset). When the Chrome DevTools MCP is connected, `emulate` (`cpuThrottlingRate`, `networkConditions: "Slow 4G"`) followed by `performance_start_trace` gives a full throttled trace, and `lighthouse_audit` the non-performance Lighthouse categories. On a Mac with Safari 27, `claude mcp add safari-mcp -- /usr/bin/safaridriver --mcp` (after enabling "Show features for web developers" and "Allow remote automation and external agents") gives screenshots, console, network timing and `evaluate_javascript` in real WebKit [verified, webkit.org, 2026-07-01].
