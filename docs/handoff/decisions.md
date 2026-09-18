# Decisions

Decisions taken during the build, with the reason, so a future session does not re-litigate them.

## Taken with the user (2026-09-17)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Shape | One plugin `awards` with an orchestrating `craft` skill plus ten focused sub-skills, each independently triggerable | impeccable's single skill with sub-command reference files (sub-commands cannot auto-trigger; one description cannot carry every trigger phrase under the 1,536-character cap) |
| Default stack | Vanilla Vite + GSAP (ScrollTrigger, SplitText) + Lenis + Three.js; recipes vanilla first with adapter notes for React / R3F, Vue / Nuxt, Svelte, Astro, Webflow injection | Next.js + R3F as the default |
| Research gaps | Proceed with a confidence-labelled corpus; `awards:research` re-verifies sites when a session has network and search access | Waiting for network access |
| Layout | `plugins/awards/` plus `.claude-plugin/marketplace.json` at the repo root (`/plugin marketplace add burgisimon/awards`, `/plugin install awards@awards`; local `claude --plugin-dir plugins/awards`) | The plugin at the repo root |

## Architectural

- **Corpus at the plugin root**, addressed as `${CLAUDE_PLUGIN_ROOT}/references/…`, `…/recipes/…`, `…/scripts/…`; skill folders hold no private copies. Copying a single skill folder elsewhere is unsupported.
- **Durable project files**: `AWARDS.md` (brief, direction contract, page map, motion score, budgets, jury and ship logs, exceptions), `DESIGN.md` (DESIGN.md-spec frontmatter, compatible with impeccable and Stitch), `.awards/` for captures, reports and audit output (gitignored). impeccable's `PRODUCT.md` is read, never written.
- **Routing**: skills cannot call each other programmatically; every phase hand-off is the written line "Invoke the `awards:<name>` skill now with the Skill tool…". `craft` never runs a phase from the no-argument status menu without an answer.
- **Jury runs forked** (`context: fork`, `agent: awards-jury`) so the build conversation cannot anchor it; its reply ends with the literal `disposition:` line, the weighted score and the top three fixes, plus a request to relay them unchanged (the forked reply is all the caller sees). Without a shell or Playwright it still reports, with `disposition: recapture` and lowered confidence.
- **Hook**: `PostToolUse` on `Edit|Write` runs `audit.mjs --quick --changed-file -`; it exits silently unless the project has an `AWARDS.md` (≈ 0.1–0.25 s); `AWARDS_HOOK=0` disables it. No `Stop` hook: jury and ship do the deep pass deliberately.
- **No `allowed-tools` wildcards** on skills except the jury's read set; v1 leaves permission prompts on.
- **Scores and weights**: Design 40 / Usability 30 / Creativity 20 / Content 10 (recalled weighting, reproduces the corpus arithmetic); Site of the Day threshold 7.2 with no axis below 6.8; dispositions derived mechanically (`recapture`, `rebuild`, `fix`, `ship`).
- **Reduced motion, keyboard paths and the DOM mirror are requirements**, not polish: usability was the lowest axis on every scored reference and the Site of the Year scored 6.6 on accessibility. This is the skill set's deliberate improvement over the corpus.
- **Recipes** ship as vanilla Vite pages with a browser-verified `verify.mjs`; every page implements `window.__awards = { ready, scrollTo, state }` so `capture.mjs` and the jury can drive it, including virtual-scroll pages through `awards.setScroller`.
- **Recipe styles import `_shared/base.css` from their own stylesheet** rather than linking it from the HTML: Vite emitted the shared CSS chunk after the recipe's CSS, which reversed the cascade in the built pages.
- **Lenis 1.3 defaults to `autoRaf: false`**: every recipe drives `lenis.raf(time)` from GSAP's ticker or the shared ticker; a Lenis with no clock swallows wheel events and the page appears frozen.
- **Custom ShaderMaterials include `#include <colorspace_fragment>`**; without it sRGB textures and render targets display dark. The tethered-planes recipe asserts pixel parity with the DOM image.
- **Audit rule M03** judges only the tween or trigger that owns a `scrub`, not a ±400-character window (an earlier version flagged neighbouring tweens).
- **Fonts**: recipes use system stacks and never ship font files; the reflex list points to open faces first and names licensed corpus faces as options.
- **P2 recipes** (`sound-toggle-opt-in`, `gl-msdf-text`) deferred to 0.2; the catalogue lists them.
- **Evals** use the `claude plugin eval` layout (`prompt.md` + `graders/*.md` + `case.yaml`), two tiers (`smoke` read-only routing, `build` with scaffolded fixtures), regex / tool_used / file_exists graders first and one `llm` rubric only where judgement is unavoidable.

## Working conventions that held

- Commit after every unit of work; the account's usage limit killed background agents three times, and committed work survived.
- Agents write each file with a heredoc as soon as it is done, never batched, so a killed agent leaves finished files.
- Original prose everywhere: impeccable's structure may echo, its wording never; site copy quoted only in fragments of at most 25 words; every site fact labelled `[verified]`, `[recalled]`, `[inferred]` or `[unknown]`.
- No model identifiers in any repository artefact (code, docs, commit titles or bodies). Commit messages end with the attribution footer the harness provides in the session.
