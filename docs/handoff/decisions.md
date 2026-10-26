# Decisions

Decisions taken during the build, with the reason, so a future session does not re-litigate them.

## Taken with the user (2026-09-17)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Shape | One plugin `awards` with an orchestrating `craft` skill plus ten focused sub-skills, each independently triggerable | impeccable's single skill with sub-command reference files (sub-commands cannot auto-trigger; one description cannot carry every trigger phrase under the 1,536-character cap) |
| Default stack | Vanilla Vite + GSAP (ScrollTrigger, SplitText) + Lenis + Three.js; recipes vanilla first with adapter notes for React / R3F, Vue / Nuxt, Svelte, Astro, Webflow injection | Next.js + R3F as the default |
| Research gaps | Proceed with a confidence-labelled corpus; `awards:research` re-verifies sites when a session has network and search access | Waiting for network access |
| Layout | `plugins/awards/` plus `.claude-plugin/marketplace.json` at the repo root (`/plugin marketplace add burgisimon/awards`, `/plugin install awards@awards`; local `claude --plugin-dir plugins/awards`) | The plugin at the repo root |

## Taken with the user (2026-09-24, slop scan)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Where slop detection lives | Extend the existing skills: one catalogue (`references/anti-patterns.md#the-slop-scan`), more audit rules, an explicit slop pass in craft and component, a scored Slop scan section in the jury report, ship naming the rules | A twelfth `awards:slop` skill |
| Award staples (marquee, one family, cream or paper grounds, huge display headlines, italic serif display) | Judged, never audited: they are `judge` rows whose earned version the corpus ships | Advisory P3 rules; leaving them out |
| Detectors | Static source rules and `--render` checks (L06–L08, T08, X20); C05 (rendered ground vs the DESIGN.md ground token) added by the 2026-10-07 finish-gates plan as the one colour check, since it enforces DESIGN.md rather than a taste outside it | Rules for colours, fonts or radii outside DESIGN.md |
| Consequence in the jury | Two or more families present caps Creativity at 6 (the rubric's category-default anchor); it does not force `rebuild` on its own | Treating a nameable generator like a nameable source site |

## Taken with the user (2026-10-05, deep modes)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Shape | Deep modes of `motion` (`--gsap`) and `webgl` (`--shader`, `--3d`) | Three new triggerable skills: routing competition with motion and webgl, broken trigger evals, a reopened eleven-skill decision |
| Activation | Automatic from the contract, dosage or score, plus a flag; recorded on the `Deep modes:` line of `AWARDS.md ## Budgets & tiers` | Flag only; automatic only |
| Analysis | Corpus wave 4 with a tech lens; the teardown is `### Tech lens:` at the end of card §5 | A separate tech study; teardown files beside cards; a §10 |
| Playbooks | `references/patterns/gsap-choreography.md`, `webgl-shaders.md`, `webgl-3d-scenes.md` | A new `references/playbooks/` folder (no lint form) |
| Captures in parallel triage | Serialised behind `flock .awards/capture.lock` | Overlapping captures (the pilot's timed out) |
| Owner policy | A site whose robots.txt or AI-usage policy forbids automated extraction is `skipped`, never retried | Treating it as `blocked` |
| oxigen.sa | Dropped from the queue | A real-GPU retry |

## Taken with the user (2026-10-22, quick wins)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Jury round cap | Two page rounds (phase 7 and one verdict pass) plus at most two component passes, counted separately from `## Jury log` (component lines are marked `component`) | Component passes counting toward the two rounds (finish gates, 2026-10-07): with both component passes used, ship's verdict pass needed a user request, so no unattended build could reach Shipped; an uncapped verdict loop |
| Shipped after a `ship` verdict | Craft rows, new or carried as partial, are recorded as `open — after ship` and do not hold the Shipped box; floor rows and contract blocks still must be resolved or kept (taken 2026-10-23, after the plugin's own site: three verdict rounds, the last `ship` at 7.88 with three small craft seams) | Requiring every craft row resolved: applying one is material, needs another verdict, and the jury lists craft seams on nearly every pass, so no build could ever tick Shipped |
| Verdict mode | Re-scores the axes on the after captures; a score moves only with a named before/after evidence pair | Verdict as resolution check only: a `fix` from a weighted 6.8–7.19 could never become `ship` |
| Component passes and `## Status` | A component pass appends its log lines and never touches `## Status` | Ticking `Jury disposition` in every mode: a resumed build could skip phase 7 or ship on one element's verdict |
| Codex hooks | `.codex-plugin/plugin.json` declares `"hooks": {}`; Codex loads no hook and runs the audit explicitly | Supporting the hooks in Codex (it discovers `hooks/hooks.json` by default and runs it once trusted, but plugins with lifecycle hooks are not eligible for its public directory); `"hooks": []`, which Codex 0.163 reads as unset and so still loads all three |
| Compaction | A `SessionStart` hook on `compact` re-attaches a state card from `AWARDS.md` while a Status line is open; it names the next phase and tells a session doing other work to ignore it | Relying on re-attached skills (each keeps 5,000 tokens inside a 25,000-token budget filled from the most recent, so craft drops first); firing on every session start (that would be the AWARDS.md-presence trigger declined for the route hint) |

## Taken in the evidence batch (2026-10-22, from the maintainer's "everything except the large, lower-impact items")

| Decision | Choice | Alternatives declined |
|---|---|---|
| Visual diff between rounds | `capture.mjs --baseline` decodes both PNGs in the capture browser's own canvas and counts pixels whose summed channel difference exceeds 48, with a red-over-faded map | pixelmatch 8 (a second runtime dependency every user project would have to resolve beside Playwright, for a comparison of frames the same browser drew) |
| Layout shift rule P08 | Measured during load only, before the scroll sweep, P2 above 0.1 and P1 above 0.25 | Over load and the sweep: the sweep jumps between positions, and a pinned element handing off between fixed and in-flow at a jump read as a 0.8 shift no reader sees (docked-media-grow) |
| Rendered viewports | Desktop 1440, tablet 834 × 1194 and phone 390, with touch emulation on tablet and phone; widths judged against the layout viewport (`clientWidth`) | `innerWidth`: under phone emulation a page that overflows widens it to its own width, which hid a 1170 px figure on a 390 px phone from L02 (gl-depth-map-parallax) |
| A failed rendered step | An `ERR` finding at P1 naming the step; after a hang the viewport is abandoned; a failed browser launch exits 3 | Swallowing the error (the run read clean); failing the whole audit (the static findings are still true) |
| Bundler projects under `--render` | Render `dist/`, `build/`, `out/` or `.output/public` when one has an `index.html`; warn when it is older than `src/` or missing | Always rendering the source (bare imports fail, every rendered rule reads a broken page); building inside the audit (it would change the project and take minutes) |
| Node floor | 22 LTS or 24 LTS in the docs and the doctor; 20.19+ warns, since it still runs the scripts and Vite; per package, the installed `engines.node` decides | Failing Node 20 outright (the plugin's own scripts still work on it); a hand-kept per-framework table in the doctor (the installed packages already say it) |
| Calibration figures | Recomputed from the site cards by `scripts/calibration.mjs --since 2021` and quoted with that citation; outside-corpus counterexamples (Cartier, Accessibility 8.00) named where a corpus maximum is quoted | Hand-counted figures over a fixed twenty entries (they went stale as the corpus grew to 32 scored cards) |
| Coexistence with gsap-skills | Two `coexist` cases list `../_vendor/gsap-skills` in `plugins:`; `evals/_vendor-fetch.sh` clones a pinned commit; `_vendor/` is gitignored | Vendoring GreenSock's plugin into this repository (a third-party copy to keep current, shipped inside the plugin); installing it into the eval workspace (the sandbox loads no `.claude/` from the workspace) |
| Contract tier | `contract-southbound` and `concept-deal-distinct`, a few dollars a run, for corpus, template, concept and system changes | Running the full build case for every creative change (about $32 and 30 minutes each) |

## Taken in the platform batch (2026-10-22)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Live state in skills (`!command`) | Not used | Injecting the state card into craft, jury and ship: a failed or unapproved injected command aborts the whole skill, and in an eval run or a restrictive permission setup craft would never load; craft already reads `AWARDS.md` first and the compaction card covers the gap |
| Hook refinements | A `SubagentStop` check sends a jury reply without its `disposition:` line back once | A background `--render` audit with `asyncRewake` after edits (a browser and about 45 s per batch, on every batch); exec-form `args` (a CLI that ignores `args` would run bare `node` on every edit) |
| Per-skill effort | `effort: high` on concept only | Lowering effort for stack or ship: the override's lifetime is not documented, and inside one long craft turn a low setting could carry into motion and WebGL |
| userConfig | `hooks_enabled` (hooks on or off, like `AWARDS_HOOK=0`) and `default_stack` | A `hooks` key (the validator reads it as a misplaced hook block); an award-program option before the presets exist |
| Jury agent | Write for the report, `scripts/awards-log.mjs` for log and Status lines, Bash pre-approved only for the plugin's scripts, `mkdir -p .awards*` and `date`, 45 turns, `omitClaudeMd: true` | Bare Bash pre-approved while the juror captures third-party sites; heredocs into `AWARDS.md` |
| Recipe stamping | `verify-recipes.mjs --stamp`, a release step | Rewriting 76 tracked `recipe.json` files on every local pass |
| Lockfiles | `package-lock.json` only; `bun.lock` removed | Keeping two lockfiles in step by hand |
| Owner policy | `scripts/policy.mjs` before any research capture or download: robots.txt for the generic and AI-crawler groups, robots meta and `X-Robots-Tag` `noai`; refused means skipped | A prose rule with no check (the decision above it was never enforced) |
| Exceptions | `RULE@path-or-viewport` scopes an exception; `audit-ignore-next-line` scopes an inline one; comments in `## Exceptions` are ignored | Bare ids only (one C01 exception hid every contrast failure) |
| Capture concurrency | `capture.mjs --lock <path>`, a directory lock that works on every platform | `flock` (absent on macOS and Windows) |
| Handoff archive | The 0.1.0 and 0.2.0 plans and the 2026-09-22 comparison moved to `docs/handoff/archive/` | Archiving `corpus-ledger.md` (the expand-corpus skill appends to it) or the 2026-10-06 analysis (open items still cite it) |

## Taken in the ceiling batch (2026-10-22)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Corpus index | Generated by `build-index.mjs` from five short header rows every card now carries (Palette strategy, Type contract, Awards / score, Confidence, Last verified) plus Industry; class is the first canonical word of the Class row | Deriving the palette and type cells from the long evidence rows (first clauses read as `Declared pair`, `` `@font-face` aliases ``); a checker beside a hand-typed table (the drift it would report keeps recurring) |
| Card classes | Eight: the template's seven plus `B2B service`, which nine cards already used | Folding service companies into `B2B product` |
| Clone-level card | Cited as `[clone:floema-jewelry]` everywhere (119 citations); lint-refs rejects `[site:]` on a clone card and `[clone:]` on a live one | Re-sourcing each citation to a live card (many record course-clone parameters no live card shows); deleting the card |
| Recipe catalogue | Generated from `recipe.json` (`intent`, `group`, `summary`); tags from six facets in `scripts/data/recipe-tags.json`, 126 in use | A free tag list with a lint for near-duplicates only |
| Face selection | `fonts.mjs` pulls five candidates per class from Fontsource with a seed, faces this plugin recommended often sorted last, and renders the real headline | A longer alternatives table (it became the reflex it replaced) |
| Wave opening | A wave opens only when its queue fills two gaps `corpus-gaps.mjs` lists; the pre-pass settles DNS, policy, signatures and captures before any subagent | Quotas enforced by refusing sites (a strong site in a crowded class can still teach a technique) |
| Skeletons | Block maps and measured fingerprints only, never frames of the sites, kept in git (about 20 KB each) | Storing captures in the repository; SVG maps (PNG renders identically everywhere the Read tool runs) |

## Taken in the modes batch (2026-10-22)

| Decision | Choice | Alternatives declined |
|---|---|---|
| Quick mode | Same skills and the same complete contract; system hands straight to structure, no component passes, one page jury round, one ship pass | A separate quick skill (a twelfth trigger surface to keep from over-firing); dropping the hero probe (the cheapest early catch) |
| Redesign baseline | A forked `jury --baseline` logged as `baseline`, never a page round; its Keep line survives and two faults become THESIS refusals | Letting the first page round double as the baseline (it would spend a round and score the wrong site) |
| Multi-route capture | `capture.mjs --routes` runs one full capture per route and writes `routes.json`; a local site is served once from its root | One capture with route states (absolute asset paths break when each route is served from its own folder) |
| Program presets | Target lines after the scores, from each program's published bar; the mappings are marked inferred and never move a score | Re-weighting the rubric per program (the corpus calibration is Awwwards'; a second weighting would be invented) |
| DESIGN.md CLI | `@google/design.md` 0.4.0 through npx, pinned, `unmeasured` offline; `missing-primary` read as information because the accent plays primary | Installing it in the scaffold (alpha); adding a `primary` alias token (it would have to be kept in step with tokens.css) |
| Adapters | Code adapters checked by `check-adapters.mjs` (Oxc parse through the recipes' Vite, pinned imports, `useGSAP` with GSAP); a Webflow section in every P0 README | Adapters as README prose only (no check catches a broken one) |

## Taken in the 0.9 batch (2026-10-26, from the taste-skill comparison; the user asked for every recommendation)

| Decision | Choice | Alternatives declined |
|---|---|---|
| House style at the concept level | A dated registry (`references/patterns/house-tells.md`), a fourth rut in concept, judge rows in a `House concept` slop family, and `scripts/house-ledger.mjs` deriving spent features from finished builds into `docs/handoff/house-ledger.md` | Audit rules for "the page is an object" or for readouts (concept shapes are judged, as the staples are); a ledger in the user's home folder (declined 2026-10-06; the plugin's own builds are the evidence, a user's builds are passed by path) |
| Outside entropy | A12's deferral lifted: the convergence it waited for is measured (`docs/handoff/house-ledger.md`, five of five builds one engine). Fourteen engines and a forty-four-item stimulus deck dealt by `roll.mjs` on their own streams, so every existing seed deals as before; colour strategy and hero archetype dealt with `--choose` among the options WORLD allows | Per-chapter layout deals (declined 2026-10-06: they cut layout off from WORLD); a fixed direction library as the only source of geometry (it becomes its own look) |
| Subject first | An `Inventory` line in `## Brief` (semicolon-separated, eight to twelve items) and a competitor line ending THESIS; the jury names its own competitor before reading the contract's and caps Creativity at 7 | A new contract block (block names are read by every skill, the hook and the evals) |
| Pictures | `assets.mjs search` / `get` over collections that need no key; found pictures rank before made imagery when no assets exist; the capture manifest measures picture share for the jury | A picture-count floor as an audit rule (imagery is a contract decision; a type-only world is legitimate); atmosphere stock photographs |
| The frame | L11–L15 and S11 as rules: readability and composition defects the showcase juries found by eye; headline line counts and first-viewport actions as measurements only | A headline-length rule and an action-in-fold rule (declined 2026-10-06, judged by decision); taste-skill's outright bans of monospace labels, index numbering and hairlines (judged, never audited, 2026-09-24) |
| Covered text | Hit-tested with `pointer-events` forced on; a full-viewport canvas, a gradient or a fade never counts as a cover | A pixel comparison with the cover hidden (deferred until a build shows a miss) |
| The walk | `capture.mjs --walk` writes `walk.json` as evidence for the jury's walk steps 1 and 2; its findings are not audit rules | Folding it into `audit.mjs` (it reloads and presses things; the audit stays a measurement of one load) |
| Blind tournament | The harness, the jury's `--blind` mode and the protocol ship; a round is the maintainer's paid decision (C13) | Running a paid round unasked |
| Contrast set | Rule hits only, template demos first, owner policy first, no pages stored | Cards for unawarded sites; stored captures |
| Version | 0.9.0 | 1.0.0 before a blind round has measured the change |

## Architectural

- **Corpus at the plugin root**, addressed as `${CLAUDE_PLUGIN_ROOT}/references/…`, `…/recipes/…`, `…/scripts/…`; skill folders hold no private copies. Copying a single skill folder elsewhere is unsupported.
- **Durable project files**: `AWARDS.md` (brief, direction contract, page map, motion score, budgets, jury and ship logs, exceptions), `DESIGN.md` (DESIGN.md-spec frontmatter, compatible with impeccable and Stitch), `.awards/` for captures, reports and audit output (gitignored). impeccable's `PRODUCT.md` is read, never written.
- **Routing**: skills cannot call each other programmatically; every phase hand-off is the written line "Invoke the `awards:<name>` skill now with the Skill tool…". `craft` never runs a phase from the no-argument status menu without an answer.
- **Jury runs forked** (`context: fork`, `agent: awards-jury`) so the build conversation cannot anchor it; its reply ends with the literal `disposition:` line, the weighted score and the top three fixes, plus a request to relay them unchanged (the forked reply is all the caller sees). Without a shell or Playwright it still reports, with `disposition: recapture` and lowered confidence.
- **Hook**: `PostToolUse` on `Edit|Write` runs `audit.mjs --quick --changed-file -`; it exits silently unless the project has an `AWARDS.md` (≈ 0.1–0.25 s); `AWARDS_HOOK=0` disables it. No `Stop` hook: jury and ship do the deep pass deliberately.
- **State card (2026-10-22)**: `SessionStart` with matcher `compact` runs `scripts/state-card.mjs` (stdlib). Only after a compaction, only with an `AWARDS.md` whose `## Status` still has an open line, it adds the Status count, the next phase and its skill, the `Deep modes:` line and the last jury and ship log lines, plus one sentence: resume through craft from the files if the session was building, ignore it otherwise. `AWARDS_HOOK=0` silences it.
- **Route hint (2026-10-06)**: `UserPromptSubmit` runs `scripts/route-hint.mjs` (stdlib, about 20 ms). On explicit award framing only (`awwwards`, `award-worthy/-level/-winning`, `site of the day/month/year`, `immersive site/website`) it adds one line naming `awards:craft`, or `jury` for a review, `webgl` / `motion` for a named technique (a new site to build that names one still goes to craft, which hands it to its phase; 2026-10-22), `component` for a part of an existing site, `concept` for a request for directions, and leaves room for another skill. `--selftest` checks every award-framed eval prompt against its own Skill grader. A hint, not a gate: it blocks nothing, never fires on the mere presence of `AWARDS.md` (that would hijack bug-fix and component prompts), and `AWARDS_HOOK=0` silences it. No effect on Codex, subagents or a run without the plugin.
- **`allowed-tools` pre-approves the plugin's own scripts** on all eleven skills (0.2.0), as `Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*)`. The documentation is explicit on two points: the variable and a trailing wildcard are both supported in a skill's Bash rule, and `allowed-tools` is *pre-approval, not restriction* — a skill that lists only this rule keeps Read, Write, Edit and the rest under the session's normal permissions. It is silent on a third: the skills invoke the scripts with the path quoted (`node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs"`), and nothing documents whether a rule matches across the quotes — the permissions page does show that `git 'push'` fails to match `Bash(git push *)`, which suggests it does not. Each skill therefore carries the rule in both spellings; the plugin validates with the quoted one present. Whether the prompt actually disappears is an empirical question, checked in the Phase 8 run.
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
