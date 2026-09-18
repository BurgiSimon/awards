---
name: motion
description: "Author the motion of an award-level site or component with GSAP 3.15 (ScrollTrigger, SplitText, Flip, Observer), Lenis, anime.js 4 or CSS: a preloader that holds at 100 on a real load signal, masked line reveals, scroll-scrubbed pins and sticky stages, velocity-driven effects, a two-speed contextual cursor, magnetic targets, rAF marquees, flicker and scramble text, theme swaps, page and shared-element transitions, all on one expo-out vocabulary with framerate-independent damping and three reduced-motion tiers. Use when asked to animate, add motion or smooth scroll, build scroll-triggered or scrollytelling effects, text reveals, transitions, micro-interactions or cursor effects, make a page feel alive, premium or cinematic, or fix animation that feels generic, janky or fade-up-everything. Not for chart or dashboard animation, and not for the WebGL layer itself (awards:webgl)."
argument-hint: "[target or feature] [--lib gsap|anime|css] [--score-only]"
---

# awards:motion

Write the motion score first, then build it: one authored moment per chapter, one signature, one easing family, one clock, and a reduced-motion tier that still shows every state. Motion is the layer a jury feels before it can name it, and it is where "generic" gets diagnosed.

## Setup

Every skill in this set opens the same way, because work that ignores a locked contract or an existing token set is work the jury sends back.

1. Read `AWARDS.md` in the project root when it exists and resume from its `## Status` checklist; read `DESIGN.md` beside it for the tokens, the type contract and the motion tokens. When neither exists, work from the request and record each decision as you go.
2. Read `PRODUCT.md` when it exists: it is impeccable's product-truth file and the source for audience, claims and constraints. Never edit or overwrite it.
3. Detect the scope from the request: a whole site, one component (a named element, file or selector), or a critique (judge, review, score). Detect the stack from `package.json` and the framework files (`next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, `vite.config.*`, a Webflow export's `webflow.js`).
4. When the request is clearly a whole site and `AWARDS.md` holds no direction contract, offer `/awards:craft` once, in one sentence, then proceed with this skill whatever the answer.

## Why a score, not effects

GSAP runs the motion on every stack the corpus could read, and none of those sites ships fade-and-translate on every section; they treat velocity as an input, author the load and the last screen, and let one interaction carry the page. A score is how that discipline survives a build: each moment is named before it is coded, so nothing arrives by reflex.

- Install GreenSock's official skills for API-level correctness: `/plugin marketplace add greensock/gsap-skills`, then install the plugin it lists (core, timelines, ScrollTrigger, plugins, utils, React, performance). This skill stays on the choreography layer above them.
- Before using an API you have not verified this session, resolve the library on Context7 (`${CLAUDE_PLUGIN_ROOT}/references/stacks/versions.md` lists the ids) and query one concept at a time. Every plugin in GSAP 3.15 is free, SplitText included.
- Read `${CLAUDE_PLUGIN_ROOT}/references/patterns/motion-vocabulary.md` before writing a tween, `patterns/preloaders-and-transitions.md` before the load and route work, `patterns/cursor-and-pointer.md` before anything the pointer drives, and `${CLAUDE_PLUGIN_ROOT}/recipes/README.md` for the catalogue.
- Library notes when an option name is in doubt: `${CLAUDE_PLUGIN_ROOT}/references/stacks/gsap-3.15.md`, `stacks/lenis-1.3.md`, `stacks/animejs-4.md`.

## Inputs

- From `AWARDS.md ## Direction contract`: SIGNATURE, SCROLL MODEL, LOAD & CLOSE and the STORY beats; from `## Page map`: the chapters and the components each one names.
- From `DESIGN.md ## Motion` and `src/styles/tokens.css`: the easing tokens, the duration bands, the stagger step. When DESIGN.md has no `## Motion`, write it from the vocabulary below before coding.
- From the stack: which grammar is present (`gsap`, `animejs`, neither), whether Lenis is booted (`window.lenis`), the framework's cleanup idiom, and whether `window.__awards` exists. When the boot is missing: Invoke the `awards:stack` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline.
- Arguments: `[target or feature]` narrows the pass to one element or one moment; `--lib gsap|anime|css` overrides the detected grammar (CSS only for a site with no JS motion at all); `--score-only` writes the score and stops before code.
- A request for one element that must become award-worthy as a whole (a menu, a hero, a footer) belongs to `awards:component`; a request for one moment on an element that already works (magnetic pull on this button, a reveal on this heading) stays here as a one-row score.

## Diagnosing generic motion

A motion pass on an existing site starts with an inventory, because "the animations feel generic" has a short list of causes and each has a mechanical fix. Grep the sources before touching anything, and keep the counts as the before.

| Symptom | What you will find | Fix |
|---|---|---|
| Every section fades and rises the same way | `opacity: 0 → 1` plus `y` on each `section`, one trigger per block | one beat per chapter; the other sections arrive settled; headings get the masked reveal and nothing else moves |
| Scroll effects lag or fight the wheel | `scrub: true` with `power2.out` or similar | `ease: 'none'` on every scrubbed tween; smoothing from Lenis or `scrub: .4–.6` [M03] |
| Pinned chapters jump on mobile | `pin: true` with spacers, no `ignoreMobileResize` | sticky stages on invisible rails; `ScrollTrigger.config({ ignoreMobileResize: true })` |
| Loops burn frames off-screen | `repeat: -1` or CSS `infinite` with no pause | `onToggle` play and pause, `visibilitychange` [M08] |
| The cursor or marquee stutters at 144 Hz | per-frame `lerp(a, b, .1)` on a private rAF | `damp()` with `dt` on the one ticker `[pattern:motion-vocabulary#damping-math]` |
| Nothing changes under reduced motion, or everything vanishes | no branch, or a global `0.01ms` kill | three tiers through `gsap.matchMedia` [M01] [M02] |
| The preloader lies | a `setTimeout` counter | `Promise.all([fonts, firstSceneAssets])`, a hold, a skip, a session skip |

## Write the motion score

The score lives in `AWARDS.md ## Motion score`, one row per moment (Moment · Trigger · Vocabulary (ease · duration · stagger) · Reduced-motion tier · Recipe). Write it before code so each moment has a reason and a cost, and so the jury can check fidelity against it.

Rows every site has:

1. Load: the preloader's signal, its hold and exit, the repeat-visit behaviour.
2. Hero entrance: the one hero-scale moment (1.2–1.5 s), played once.
3. One beat per chapter, entrance · hold · exit, tied to a sentence of the thesis; the rest of the chapter is craft, not motion `[pattern:narrative-structures#pacing]`.
4. Signature: the interaction the contract names, the physical metaphor it enacts, its touch, keyboard and reduced-motion behaviour.
5. Transitions: route, section or theme, one vocabulary.
6. Hover and cursor grammar: the feedback band, the badge verbs, the magnetic targets.
7. Close: the last screen's one moment.
8. Budget: total tweens, loops, the one ticker, the pause policy.

Rules: at most one hero-scale moment per chapter; one signature and everything else supporting; a component-scale request gets a single row in the same table; a velocity-driven effect names its input and its rest value. With `--score-only`, stop here and return the table.

## Vocabulary

Name the curves and bands once as tokens and use nothing else; a site reads as one hand when every movement decelerates the same way `[pattern:motion-vocabulary#easing]`. Tokens live in `src/styles/tokens.css` (`--ease-out-expo`, `--ease-in-out-expo`, `--ease-theme`, `--dur-feedback`, `--dur-routine`, `--dur-hero`) and in `src/lib/motion.js` (`EASE`, `DUR`).

| Role | Value | Notes |
|---|---|---|
| Entrances, hover, cursor | expo-out `cubic-bezier(.16,1,.3,1)`, GSAP `expo.out`, anime `'outExpo'` | the house curve; page and cursor share it `[site:leo-parpeix]` |
| Travel between two known states (flights, camera moves) | expo-in-out `cubic-bezier(.87,0,.13,1)`, `expo.inOut` | symmetric because departure and arrival are both known `[site:floema-jewelry]` |
| Theme swap, whole-page repaint | `cubic-bezier(.645,.045,.355,1)`, 1–1.5 s | symmetric on purpose: a repaint has no arrival |
| Anything scrubbed by scroll | `ease: 'none'` | the smoothing lives in Lenis or in `scrub: .4–.6` [M03] |
| Feedback (hover, press, toggle) | ≤ .3 s; token 160 ms | slower reads as lag |
| Routine (reveals, menu items, cards) | ≈ .4 s | |
| Hero-scale (preloader exit, flight, chapter cut) | 1.2–1.5 s; token 1400 ms | one per chapter; never on a hover `[pattern:motion-vocabulary#durations]` |
| Exits | shorter than the entrance | tighter travel and stagger on the way out |
| Stagger, lines or words | .06–.1 s; `count × step` under ≈ .6 s | `from: 'center'` when the block has a focal glyph `[pattern:motion-vocabulary#staggers]` |
| Stagger, flicker glyphs | ≈ .04 s | baked into the keyframe `times` |
| Stagger, characters (scramble, rolls) | 5–30 ms | |
| Masked line reveal | `yPercent: 120–150 → 0`, expo-out, stagger .1 | beyond 100 % clears descenders under tight leading `[pattern:motion-vocabulary#masked-line-reveals]` |
| Damping per frame | `damp(current, target, k, dt)`, i.e. `lerp(current, target, 1 − exp(−k·dt))` | `k = −60 · ln(1 − l)`: a .1 lerp is k ≈ 6.3, .22 is ≈ 15, .75 is ≈ 83 `[pattern:motion-vocabulary#damping-math]` |
| Virtual-float weight | friction .97 per frame at 60 fps, converted the same way; a slow lerp on the input and a faster one on the reader; 1.4 s snap | `[site:igloo]` |
| Elastic, back, bounce | one landing the story earns (a wordmark, a dropped object) | never UI feedback `[site:animejs]` |

Anime.js composes curves from strings (`'outExpo'`, `'inOut(2)'`, `cubicBezier(.16, 1, .3, 1)`); map the tokens onto those strings instead of adding a fourth family.

## Scroll model

Smooth scroll is a decision with costs (restoration, find-in-page, keyboard, assistive tech), so the contract names one model and the code implements only that one `[pattern:motion-vocabulary#scroll-philosophies]`.

| Model | Implement with | When |
|---|---|---|
| Native + Lenis + ScrollTrigger | the boot from `[recipe:boot-lenis-gsap]`; triggers read Lenis through `ScrollTrigger.update` | the default for any page that reads |
| Sticky stages on invisible rails | `position: sticky` visuals under tall transparent rails, scrubbed by triggers on the rail `[recipe:sticky-stages-rails]` | holds and hinges; never `pin: true` where sticky works [M06] `[site:the-line]` |
| Pin + scrub inside one chapter | `pin: true`, `scrub: .4–.6`, `invalidateOnRefresh: true`; animate the children, never the pinned element `[recipe:scroll-pin-scrub]` | media that must scrub frame by frame `[site:seasats]` — and prefer CSS `position: sticky`, which is what the corpus actually ships |
| Virtual float | wheel and touch into a target, a damped float, one 0–1 progress driving timelines and the camera; keys, `awards.setScroller`, hash restore `[recipe:gl-virtual-scroll-camera]` | only when the story must gate, hold or redirect `[site:why-zero]` `[site:igloo]` |
| Section switcher | `Observer.create({ type: 'wheel,touch', tolerance: 10, onUp, onDown })` and a keyboard `next()` | short loops `[site:slosh-seltzer]` |
| CSS scroll-driven animations | `animation-timeline: view()` on the same markup | a progressive enhancement, with the JS path kept where Safari matters |

Rules for every model:

- Scrubbed tweens use `ease: 'none'`; `ScrollTrigger.refresh()` after fonts, load and the preloader; `invalidateOnRefresh: true` on measured values `[pattern:motion-vocabulary#scrub-and-refresh-rules]`.
- Scroll writes into refs or uniforms, never into framework state; the cheapest scrub is a multiplier on the scroll value.
- A virtual float answers ArrowDown, PageDown, Space, Home and End, exposes its progress, restores from the hash and steps under reduced motion `[pattern:accessibility-and-reduced-motion#scroll-jacking-rules]`.
- Rail heights: 200–300 vh for a chapter with media, longer only when there is something to read.

## Recipe map by intent

Read the recipe's README and `main.js` under `${CLAUDE_PLUGIN_ROOT}/recipes/<id>/`, then adapt: rename the classes and data attributes, re-token onto the site's tokens, re-time to the site's bands, drop the demo copy. Never paste a recipe unchanged. A P1 folder exists only once it is verified; when a row's folder is missing, build from the catalogue row's parameters and the pattern entry it cites.

| Intent | Recipe | What you re-decide |
|---|---|---|
| Boot, one ticker, the hook | `boot-lenis-gsap` | lerp, hero stagger |
| Scrubbed chapter | `scroll-pin-scrub` | rail height, the beats |
| Hold and hinge | `sticky-stages-rails` | hinge angle (4–15° on a named corner); the child lags the parent |
| Heading reveal | `split-text-masked-reveal` | travel, stagger, trigger start |
| Motion policy | `reduced-motion-switch` | the tier of every effect |
| Magnetic CTA | `magnetic-button` | radius, pull; real targets only |
| Custom cursor | `cursor-two-speed` | rates, badge verbs |
| Ticker | `marquee-raf-mask` | base speed, velocity share |
| Menu | `nav-overlay-fullscreen` | wipe direction, link count |
| Loading | `preloader-counter-hold` | the signal, the register (counter, readouts, leader) |
| Colour as state | `theme-swap-tokens` | themes per chapter, `theme-color` |
| Routes | `page-transitions` | taxi or View Transitions per stack |
| Stacked cards | `sticky-stack-cards` | scale and blur of the previous card |
| Horizontal rail | `horizontal-rail` | native overflow on touch, arrow keys |
| Archive list | `hover-preview-list` | the preview anchored on focus |
| Compare | `compare-hold-drag` | 5 % keyboard steps |
| Drawn path | `scroll-drawn-svg-path` | dash-offset range |
| Flicker accent | `flicker-text` | ladder, glyph stagger |
| Decode accent | `scramble-decode-text` | charset, reveal and settle rates |
| Frame scrub | `image-sequence-scrub` | frame count, poster |

## Build order

Build in the order the page loads, so each step is verifiable before the next depends on it.

1. Boot and tiers: `motionTier()`, `gsap.matchMedia` conditions, the one ticker, `window.__awards` (from `awards:stack`; check they exist).
2. Preloader and `awards.ready()`: the real signal, the hold, the skip, the session skip.
3. Hero entrance: the one hero-scale moment, after `document.fonts.ready`.
4. Chapter beats: one per chapter, entrance reveals with `once: true`.
5. Signature: the interaction the contract names, with its touch, keyboard and reduced-motion paths built in the same step, never later.
6. Pointer grammar: cursor, badges, magnetic targets, hover previews.
7. Transitions and theme swaps.
8. Close: the footer's one moment, the 404's idle loop.
9. Captures and the audit; then the score's reduced-motion column is checked against `desktop-rm-*` captures.

## Where the score lives per stack

Every view owns one cleanup scope so nothing leaks across routes, and the idiom differs per framework (`${CLAUDE_PLUGIN_ROOT}/references/stacks/<stack>.md`).

| Stack | Scope | Cleanup |
|---|---|---|
| Vite vanilla | `gsap.context(fn, root)` per page or module | `ctx.revert()` on route leave and `pagehide` |
| Next.js | `useGSAP(fn, { scope })`, handlers via `contextSafe` | reverted on unmount; `revertOnUpdate` when deps change |
| Nuxt | `gsap.context` inside `onMounted` | `ctx.revert()` in `onBeforeUnmount` |
| Astro | one context per `astro:page-load` | `ctx.revert()` on `astro:before-swap` |
| SvelteKit | `gsap.context` inside `onMount` | the returned cleanup reverts it |
| Webflow shell | one context per `data-module` renderer | reverted in the taxi `onLeave` |

## Text

A line rising out of a clipped box reads as typesetting rather than a fade, which is why it is the corpus's default entrance for headings; and lines split on fallback metrics shred when the real face lands.

- `SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit })` after `document.fonts.ready`; create the animation inside `onSplit` and return it, so a re-split carries its time `[recipe:split-text-masked-reveal]`. Anime: `splitText(el, { lines: { wrap: 'clip' } })` with `addEffect`, which survives re-splits.
- Two text systems, split by role: masked reveals for headings; a per-character wave, roll, flicker or scramble for one accent phrase per chapter; never both on one element `[pattern:motion-vocabulary#text-effects]`.
- Flicker: a per-letter opacity ladder such as `[0, 1, 0, 0, 1, 1]` with ≈ .04 s between glyphs, once on mount and again on pointer enter; the non-monotonic ladder is what reads as a tube striking `[recipe:flicker-text]`.
- Scramble: anime's `scrambleText({ chars, cursor, revealRate: 60, settleRate: 30 })` or a vanilla character table; the final text equals the source `[recipe:scramble-decode-text]`.
- Split spans are not readable text: keep an accessible copy (`aria-label` or a visually hidden original). Reduced tier: opacity only, ≤ .4 s; scramble and flicker show the final text.

## Pointer

The pointer is an affordance system, not decoration: a cursor with two rates carries mass, a badge names the gesture, a magnetic target confirms it is a target `[pattern:cursor-and-pointer#two-speed-cursor]`.

- Two-speed cursor: dot at lerp .75 (k ≈ 83), ring at .22 (k ≈ 15), both through `damp()` on the shared ticker and on the house curve; the hover answer (ring 1.35×, dot .7×) inside the feedback band `[recipe:cursor-two-speed]`.
- Cursor hygiene: transform only, `pointer-events: none`, hidden on window leave and `visibilitychange`, the native cursor back over inputs and text.
- Badges declared on the target (`data-cursor="drag|play|view|copy"`), four or five verbs at most; the target keeps its own accessible name `[pattern:cursor-and-pointer#contextual-badges]`.
- Off on coarse pointers, `(hover: none), (pointer: coarse)`, with the fine state kept reachable through `any-pointer: fine`; the audit fails a cursor without the guard [A08] `[pattern:cursor-and-pointer#coarse-pointer-policy]`.
- Magnetic pull through `gsap.quickTo` on the button and a weaker one on its label, distance falloff, fine pointers only, real targets only (primary CTA, nav toggle, sound switch) `[recipe:magnetic-button]`.
- Hover-preview lists: one `aria-hidden` preview per list repositioned by `damp()`, the same preview on `:focus-visible` anchored to the row, thumbnails or taps on touch `[recipe:hover-preview-list]`.
- Every hover state is also a `:focus-visible` state; hovers stay ≤ 300 ms on transform and opacity `[pattern:motion-vocabulary#hover-shifts]`; every drag, hold or draw has the keyboard path from `[pattern:cursor-and-pointer#keyboard-equivalents]` [A11].

## Transitions

One transition vocabulary per site; a shared-element flight and a wipe on the same route are two ideas `[pattern:preloaders-and-transitions#transition-archetypes]`.

- Shared element: `Flip.getState(el)`, change the DOM, `Flip.from(state, { duration: 1–1.5, ease: 'expo.inOut', absolute: true })`; `Flip.fit` moves one element into another's box. In GL the source plane is lifted and tweened to the destination rect on the same curve `[site:floema-jewelry]`.
- Routes: taxi on Vite SPA and Webflow (`Renderer.onEnter` opens a `gsap.context`, `onLeave` reverts it; the `Transition` resets Lenis, then refreshes before `done()`); the framework router with View Transitions on Next, Nuxt, Astro and SvelteKit `[recipe:page-transitions]`.
- Theme swap: tween `--ground`, `--ink` and `--accent` on `documentElement` over 1–1.5 s on the theme curve, retarget rather than stack under fast scrolling, and paint the canvas clear colour from the same live object; update `theme-color` on complete `[recipe:theme-swap-tokens]`.
- After any route change: scroll reset with `lenis.scrollTo(0, { immediate: true })`, focus to the new `<main>` or `<h1>`, old contexts reverted, `ScrollTrigger.refresh()` once fonts and images have landed `[pattern:preloaders-and-transitions#route-transition-mechanics]`.

## Preloader

A loader is honest only when it waits for something real, and a jury notices a counter that finishes at the same second on every connection `[pattern:preloaders-and-transitions#the-load-contract]`.

- Gate on `Promise.all([document.fonts.ready, firstSceneAssets])`, the first viewport's assets only; add a timeout that shows the page with the static tier, and a visible Skip control focusable from the first frame.
- The counter reports real progress in uneven jumps, never ahead of the truth; hold ≈ 1 s at 100 (the recipe uses 450 ms); exit ≤ 1.5 s with titles at `yPercent 120–150` and stagger .1, the count on a shorter travel `[recipe:preloader-counter-hold]`.
- Speak the site's register: a counter, a frame leader, telemetry readouts, a title card; the corpus devices as drawn are refused `[pattern:preloaders-and-transitions#preloader-archetypes]`.
- Sound consent may ride the exit gesture, but content never waits for it: enter-with-sound beside enter, or the switch in the chrome `[pattern:preloaders-and-transitions#sound-consent-on-the-gesture]`.
- `sessionStorage` remembers; a repeat visit skips the sequence or cuts it to ≤ 2.5 s.
- `role="status"` with `aria-live="polite"`, a number every 25 %, `hidden` after the exit so the overlay leaves the accessibility tree; `awards.ready()` resolves after the exit.

## Reduced-motion tiers

No card in the corpus documents a reduced-motion path, and the Site of the Year scored 6.6 on accessibility; shipping three tiers is where new work beats the reference set instead of copying it `[pattern:accessibility-and-reduced-motion#motion-tiers]`.

- Decide once: `motionTier()` from `src/lib/reduced-motion.js` (`full | reduced | static`, with a `data-motion` override on `<html>`), mirrored by `gsap.matchMedia().add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (ctx) => …)` with the breakpoint conditions in the same block, so the setup re-runs and reverts itself when the preference flips `[recipe:reduced-motion-switch]`.
- Anime: `createScope({ mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' } })`, whose constructors re-run when the query flips.
- Build every effect inside a function of the tier; tear the old tier down (`ctx.revert()`, ticker unsubscribe) before the next applies.
- Reduced keeps state changes, hierarchy, opacity and colour steps, instant scroll positions and the theme swap as a ≤ 300 ms repaint; it drops spatial travel, parallax, velocity inputs, marquees, autoplaying loops and the cursor lag. Static shows the final frame, one still per chapter.
- The per-effect table is `[pattern:accessibility-and-reduced-motion#reduced-motion-tiers]`; copy the relevant rows into the score's reduced-motion column.
- CSS: `base.css` shortens the duration tokens under the query; scope any animation kill to `[data-motion="spatial"]`; a global `* { animation: none !important }` or a 0.01 ms duration removes the state changes the reduced tier depends on [M01] [M02].
- Keyboard equivalents ship with the tier: held Enter or Space for holds, arrow keys for rails and compares, a Skip beside every gate `[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]`.

## Performance

Motion is judged at 60 fps on a mid-range phone, not on the machine that built it.

- One ticker for scroll, tweens, loops and render (`gsap.ticker` or `src/lib/raf.js`); every lerp uses `damp()` with the ticker's clamped `dt`; the ticker pauses when the tab is hidden.
- Transforms and opacity only; never `width`, `height`, `top`, `left` or margins [M07]. `will-change` for the duration of a tween and cleared after, never site-wide [M04].
- `ScrollTrigger.batch` for lists; `once: true` for entrance reveals; `invalidateOnRefresh` instead of rebuilding timelines on resize; `ScrollTrigger.refresh()` only when layout really changed, debounced.
- Every infinite loop pauses off-screen (`ScrollTrigger.create({ onToggle })`) and on `visibilitychange` [M08].
- `gsap.quickTo` for anything the pointer drives; one `gsap.context` per view so nothing leaks across routes; pin sparingly, because pins promote layers and cost refreshes.
- Anime beside GSAP: one engine, or tick anime's engine from `gsap.ticker` (`engine.useDefaultMainLoop = false`).

## Verify

Evidence first, then the checklist; the jury reads the captures before it reads the code.

- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" <dir|url> --out .awards/captures --scroll 0,50,100 --reduced-motion --json`: `desktop-s00.png`, `desktop-s50.png` and `desktop-s100.png` differ where the score says they should; `desktop-rm-s*.png` shows every state (menu, theme, revealed text) with no residual transform; `consoleErrors` and `pageErrors` are empty.
- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" <dir> --scope motion --json`: M01–M08 clean, or each finding carries a reason under `AWARDS.md ## Exceptions`.
- [ ] One authored hero-scale moment per chapter; the hero's moment plays once and never re-runs on scroll.
- [ ] Two or three named easing tokens in use; no default `ease`; `none` only under scrubs.
- [ ] Feedback ≤ .3 s; staggers .06–.1 s for text; exits shorter than entrances.
- [ ] Loops stop off-screen and when hidden; `window.__awards.state()` reports the motion tier; a virtual float answers the keys.
- [ ] Text splits after fonts and re-splits on resize; an accessible copy exists for every split heading.
- [ ] Cursor, magnetic pull and hover previews are off or replaced on a coarse pointer; every hover is a focus-visible state.
- [ ] On a motion pass: the before and after counts (section fades, eased scrubs, loops without a pause) are in the reply, and the section fades dropped by more than half.
- [ ] `AWARDS.md ## Motion score` has every row above with a reduced-motion tier and a recipe id (or "none").

## Hand-off

Tick "Motion score authored and built (motion)" in `AWARDS.md ## Status`. When the score names a WebGL moment (a tethered plane, a wake, a scene, a camera rig): Invoke the `awards:webgl` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. Otherwise, or once the GL layer has landed: Invoke the `awards:jury` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline.

## Refuse

- Fade-and-rise on every section at 400 ms on the default ease: the tell that motion was applied, not authored.
- Bounce, elastic or back easing on UI feedback: it belongs to one landing the story earns.
- Parallax on everything: depth with no beat behind it.
- Scroll-jacking with no keyboard exit, or a virtual float on a page that is a document.
- A blocking preloader with no concept, no skip, or a timer for a signal; one that replays in full on every visit.
- Hover-only affordances, drag-only galleries, a cursor with no coarse-pointer guard.
- Animating layout properties; `will-change` on `*`; a second ticker; raw wheel deltas as an effect input; 60 fps constants shipped untransformed.
- Eased scrubs that fight the scroll; `pin: true` where a sticky stage works.
- A global animation kill presented as the reduced-motion path; marquees and flickers that keep running under it.
- Framer Motion or `motion` for scroll scrub; two smooth-scroll libraries.
- `[site:floema-jewelry]`'s bulge and flight, `[site:leo-parpeix]`'s cursor badges and counter jumps, `[site:the-line]`'s hinge and `00/24` leader, or any corpus device reproduced as a signature: they are pattern pointers, never parts.
