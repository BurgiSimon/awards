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

For each Awards phase or recapture that produces evidence for another phase, allocate a **new** timestamp-plus-stage directory under `.awards/captures/` and pass it with `--out`. For example, run `capture_out=".awards/captures/$(date -u +%Y%m%dT%H%M%S)-static"` immediately before a static pass, then `--out "$capture_out"`; use `jury`, `ship`, `component`, `motion`, `stack`, `nogl`, or another stage for later passes. If that directory already exists, choose a fresh timestamp before capture. Allocate again for every fallback, verdict or component recapture. Record `$capture_out/manifest.json` in Page map Notes or the report and pass the exact directory (and any state plan) to the juror. Choose `--scroll` positions that cover each applicable Page map chapter at desktop and mobile widths, including middle and close; add `--reduced-motion` and `--states` for required sections/interactions. Record gaps as unmeasured and recapture into another fresh directory when needed. Compare only files listed by each recorded manifest. Standalone `capture.mjs` without `--out` keeps its existing `.awards/captures` default.

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

Existing scroll/component frames and filenames stay intact. Additional files use `[prefix-]<viewport>-state-<name>.png`, including `desktop`, `mobile` and, with `--reduced-motion`, `desktop-rm`. `--only desktop` or `--only mobile` limits the regular viewports; reduced motion adds its desktop pass. Each state navigates to the original target and runs its actions in order. Cookies and storage persist within a viewport, so a theme selection can be tested through `reload`; viewports use separate contexts. States are independent interaction sequences, not continuations of the preceding state's DOM.

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

Capture exits: **0** success, **1** invalid usage/plan, **2** page or action errors, **3** browser unavailable, **4** initial target unreachable. Invalid plans fail before browser launch or output creation. A failed browser launch is recorded in the manifest; missing Playwright is reported before a manifest can be created. Open every required frame and inspect errors before using it as evidence. Screenshots show a state; assertions against live DOM behavior prove focus trapping, persistence and teardown.
