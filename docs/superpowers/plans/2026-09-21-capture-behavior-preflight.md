# Capture States, Behavioral Checks and Preflight Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. Keep changes in the current workspace and preserve unrelated edits.

**Goal:** Capture interactive UI states, verify actual browser behavior, and identify missing environment prerequisites before an Awards build starts.

**Architecture:** Extract the recipe runner's action dispatch into one shared module. Capture accepts named JSON states alongside its existing screenshots. A standalone doctor checks the environment, while one assertion-based behavior suite exercises the real tools and bundled UI.

**Tech Stack:** Node built-ins, the existing Playwright resolver, installed Vite and recipe dependencies. No new dependencies or paid model calls.

**Spec:** The user's selected additions from the repository review: interactive capture states, behavioral regression checks, and an early environment check.

## Constraints and interfaces

- Preserve existing capture flags, filenames, viewport selection and recipe action types.
- `capture.mjs <target> --states <json-file>` adds named screenshots after the normal captures. JSON is an array of `{name, actions, selector?}`; names are unique lowercase slugs. Each state starts at the original URL in the same viewport/session. `reload` within a state preserves session storage.
- `scripts/lib/actions.mjs` exports `validateActions(actions)` and `runActions(page, actions, {timeout})`. Supported actions: click, hover, focus, press, move, down, up, wheel, wait, waitFor and reload. Existing recipe predicates remain supported; capture plans use selector-based waitFor actions.
- Record each successful named capture and its observed page state in the manifest. An action failure names the checkpoint, retains earlier captures, continues with later checkpoints and returns exit 2. Reject invalid plans before launching a browser or writing output.
- `doctor.mjs [project-dir] [--json]` reports Node support, npm, declared dependencies/build setup, writable output locations, Playwright and an actual Chromium screenshot. Exit 0 means ready, 2 means a prerequisite failed, 1 means invalid usage. No installations or project configuration changes; temporary write probes are removed.
- Missing browser support limits capture/jury evidence; it does not prevent independent design or static source work. Missing WebGL is reported as a fallback requirement, not a reason to reject DOM-only projects.
- Behavioral checks include the review's reproduced server containment, quick-audit, URL-audit, ticker and starter fallback/motion failures, plus actual menu focus behavior. Fix the narrow root causes so the suite is green.
- Preserve the eleven skills, existing phase order, stack choices and corpus. General instruction compression and additional scaffolds are outside this change.

## Task 1: Write the regression checks

**Files:** create `plugins/awards/evals/behavior.mjs`.

- [x] Create temporary fixtures and a serial assertion runner; support `--only <group>` for focused work.
- [x] Exercise CLI validation, captures and manifests, doctor success/failure paths, server boundaries, directory/URL audits, ticker lifecycle, starter no-GL/reduced-motion behavior, and the bundled menu's keyboard behavior.
- [x] Run the checks before implementation and record the expected failures. Browser tests require the existing Playwright installation and local browser execution permissions.

```bash
node plugins/awards/evals/behavior.mjs
```

## Task 2: Share browser actions and add capture states

**Files:** create `scripts/lib/actions.mjs`; modify `scripts/capture.mjs` and `scripts/verify-recipes.mjs` under `plugins/awards/`.

- [x] Validate action fields and capture state names; reject unknown/malformed actions and executable predicates in external capture plans.
- [x] Extract existing action semantics and use the helper in both callers. Timeouts and failures must be explicit.
- [x] Add independent named checkpoints, screenshot cropping, manifest observations and failure recovery to capture. Preserve the manifest if Chromium cannot launch.
- [x] Run capture checks and the existing recipe verifier to prove action compatibility.

```json
[
  {"name":"menu-open","actions":[{"type":"click","selector":"[data-menu-toggle]"},{"type":"waitFor","selector":"[data-menu]","state":"visible"}],"selector":"[data-menu]"},
  {"name":"keyboard-focus","actions":[{"type":"focus","selector":"[data-menu-toggle]"},{"type":"press","key":"Enter"},{"type":"press","key":"Tab"}]}
]
```

## Task 3: Add preflight and satisfy the behavioral checks

**Files:** create `scripts/doctor.mjs`; modify `scripts/lib/server.mjs`, `scripts/audit.mjs`, shared/scaffold ticker and quality modules, and the starter's initialization/motion/scene modules as needed by failing checks.

- [x] Implement the doctor using existing resolvers and built-in filesystem/process APIs, with structured checks and actionable failure messages.
- [x] Enforce real-path containment in the local server, make directory quick audits run, and reject unmeasured URL/render audits.
- [x] Cancel pending ticker callbacks on pause and on the last unsubscribe; do not duplicate loops on resume.
- [x] Keep starter readiness independent of optional GL; honor initial and changing motion preferences; clean up scene resources and listeners.
- [x] Run the complete behavior suite and inspect failures without loosening assertions to match broken behavior.

## Task 4: Integrate, document and verify

**Files:** update the relevant craft/stack/component/jury/ship instructions and jury agent handoff, Codex runtime reference, root/plugin READMEs, `CLAUDE.md` and eval documentation. Add a concise capture-state reference shared by the consuming skills.

- [x] Run preflight before build work; explain which work can continue when a prerequisite fails and when to rerun the check.
- [x] Teach component/jury/ship how to author and inspect named states while preserving standalone audit/capture scope.
- [x] Document CLI examples, schema, exits, test prerequisites and the distinction between browser correctness and real-device performance.
- [x] Run behavior checks, all recipe checks, reference lint, grader self-test, both manifest validators and the isolated Codex install/build check. Keep generated verification artifacts out of the source diff.
- [x] Review the final diff and mark completed plan items with observed verification results.

## Verification record — 2026-09-21

- Before implementation: 1/10 behavior checks passed; the nine expected failures reproduced the missing features and reviewed runtime defects. The bundled menu already passed.
- After implementation: **11/11 behavior checks passed**, including an added failing-then-passing regression for an invalid explicit Chromium path. The suite ran with local Chromium outside the restricted sandbox, using only installed dependencies.
- Reference lint: **337 files, 0 dangling references**. Grader self-test: **14 file-target graders, 0 defective, 2 skipped** because those cases have no untouched HTML fixture.
- Claude plugin and marketplace validation, Codex manifest validation: **passed**.
- Isolated Codex install/discovery and both installed scaffold builds: **passed; 11 skills discovered**.
- Recipe static audit: **0 P0 / 0 P1 / 0 P2 / 32 P3**; the P3 findings are the existing demo Open Graph omissions.
- Full recipe compatibility pass: **30/30 recipes, 156 states passed** on Chromium **153.0.8010.12**, run serially in a temporary plugin copy. Source recipe stamps and gallery remain untouched. The menu focus-trap and WebGL postprocessing screenshots were also opened and checked.
- Doctor against the installed recipe project: **ready, all 8 checks passed**, including all 8 declared packages, actual Chromium screenshot and WebGL2 probe.
- Final diff reviewed; `git diff --check` passed.
- No new dependencies, paid model evals or real-device performance claims.
