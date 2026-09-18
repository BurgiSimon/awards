---
name: stack
description: "Choose and scaffold the technical foundation of a creative-developer site and boot it correctly: Vite + vanilla by default, or Next.js (@gsap/react, React Three Fiber), Nuxt, Astro with View Transitions, SvelteKit + Threlte, or a Webflow shell with an injected ESM engine. Wires Lenis 1.3 and GSAP ScrollTrigger on one ticker, lazy-chunks Three.js, self-hosts fonts, picks the page-transition mechanism, sets up the glTF/Draco/KTX2 pipeline, quality tiers and one reduced-motion switch, and records budgets in AWARDS.md. Use when asked to set up, scaffold, bootstrap or configure a project for smooth scroll, GSAP, Lenis, Three.js, WebGL or page transitions, which framework suits an Awwwards-style site, or to add these libraries to an existing Next, Nuxt, Astro, Svelte or Webflow app. Not for CRUD or dashboard scaffolds without award framing, nor for authoring the animations (awards:motion)."
argument-hint: "[vite|next|nuxt|astro|sveltekit|webflow] [--name <dir>] [--webgl] [--cms <name>]"
---

# awards:stack

Pick the stack, scaffold it, and boot Lenis, GSAP and (when the concept needs it) Three on one clock, so every later phase inherits a page that scrolls, measures and degrades correctly. The stack is a decision made once per project; the architecture under it is the same on every stack in the corpus.

## Setup

Every skill in this set opens the same way, because work that ignores a locked contract or an existing token set is work the jury sends back.

1. Read `AWARDS.md` in the project root when it exists and resume from its `## Status` checklist; read `DESIGN.md` beside it for the tokens, the type contract and the motion tokens. When neither exists, work from the request and record each decision as you go.
2. Read `PRODUCT.md` when it exists: it is impeccable's product-truth file and the source for audience, claims and constraints. Never edit or overwrite it.
3. Detect the scope from the request: a whole site, one component (a named element, file or selector), or a critique (judge, review, score). Detect the stack from `package.json` and the framework files (`next.config.*`, `nuxt.config.*`, `astro.config.*`, `svelte.config.*`, `vite.config.*`, a Webflow export's `webflow.js`).
4. When the request is clearly a whole site and `AWARDS.md` holds no direction contract, offer `/awards:craft` once, in one sentence, then proceed with this skill whatever the answer.

## Arguments

- First word: the stack (`vite` when omitted and no framework is detected; the detected framework otherwise).
- `--name <dir>`: the directory to scaffold; without it, work inside the current project.
- `--webgl`: include the lazy WebGL module and the `three` dependency; omit it when the direction contract says the dose is "none".
- `--cms <name>`: the headless CMS the content team uses; it steers the framework row below and the deploy notes.
- An existing project with a boot already in place: skip the scaffold and run the boot audit at the end of this file instead.

## The stack is a decision, the architecture is the constant

The nineteen analysed sites ran Vite + vanilla, Svelte, Nuxt, Astro, Webflow and Next, and Framer Motion appears on none of them; what they share is not a framework but a shape. Every choice below preserves that shape, and the stack notes exist so the shape survives each framework's opinions. Read `${CLAUDE_PLUGIN_ROOT}/references/stacks/versions.md` before installing anything, and the "When to choose it" section of the two candidate notes before deciding.

- HTML lays out, WebGL renders: text and images live in the DOM, the canvas draws over them `[pattern:webgl-architecture#html-lays-out-webgl-renders]`.
- One canvas, one ticker: GSAP's ticker drives Lenis, Lenis feeds ScrollTrigger, the render loop reads the same clock `[recipe:boot-lenis-gsap]`.
- Scroll is one number that becomes uniforms and refs, never framework state `[pattern:motion-vocabulary#scroll-philosophies]`.
- Fonts are self-hosted woff2; a headless CMS appears only when content volume demands it; TypeScript is welcome, Tailwind only when the project already uses it.

## Decide

Each row is a question the brief already answers; write the answers into `AWARDS.md ## Budgets & tiers` as a `Stack:` line so nobody re-decides them mid-build.

| Question | Answer | Read |
|---|---|---|
| A page or a handful of routes, no CMS | Vite + vanilla, the default; the engine-first winners ran it `[site:why-zero]` `[site:oryzo]` `[site:lama-lama]` | `${CLAUDE_PLUGIN_ROOT}/references/stacks/vite-vanilla.md` |
| Dozens of templated pages from a headless CMS, a React team | Next.js App Router with `@gsap/react`; R3F only if the scene is component-shaped `[site:white-desert]` `[site:seasats]` `[site:usavionix]` | `stacks/next.md` |
| Vue team, content routes, DOM-first score | Nuxt 4 with a `.client` plugin for the boot `[site:the-line]` | `stacks/nuxt.md` |
| Mostly documents plus one WebGL island, SEO matters | Astro with `<ClientRouter />` and a persisted canvas `[site:mont-fort]` | `stacks/astro.md` |
| Svelte team, engine-first site with a component model | SvelteKit + Threlte; keep SSR on for the DOM mirror `[site:igloo]` (framework at medium confidence) | `stacks/sveltekit.md` |
| The client edits and hosts in Webflow | Webflow shell + an injected ESM engine from your own origin; the ceiling is Site of the Month `[site:lando-norris]` `[site:son-daven]` | `stacks/webflow-export.md` |
| Is a shared-element or overlay transition the money moment? | Yes: SPA navigation (taxi on Vite and Webflow, the framework router elsewhere). No: MPA with cross-document View Transitions | `[pattern:preloaders-and-transitions#route-transition-mechanics]` |
| WebGL dose from the direction contract | Any dose above "none" means a lazy chunk, a quality tier and a mirror; OGL for planes-only sites `[site:floema]`, Three otherwise, R3F or Threlte only inside their frameworks | `[pattern:webgl-architecture#dosage-ladder]` |
| `--cms <name>` given | The framework the CMS SDK serves best; content routes stay static HTML and the engine hydrates by attribute | the framework note |

Choose for the team and the content, never for the motion: the motion is identical on every row.

## Scaffold

The scaffold ships the boot, the shared modules and the two contract files, so a new project starts at the floor instead of climbing to it. It refuses to overwrite a non-empty directory.

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/new-project.mjs" --stack vite --name <dir> [--webgl] [--dry-run]
```

- `--stack vite` copies `${CLAUDE_PLUGIN_ROOT}/assets/scaffold/vite-vanilla/`: `index.html`, `src/main.js`, `src/lib/{scroll,motion,raf,reduced-motion,quality-tiers,awards-hook}.js`, `src/styles/{tokens,fonts,base}.css`, `src/webgl/scene.js` (only with `--webgl`), `AWARDS.md`, `DESIGN.md`, a `.gitignore` and pinned dependencies. Run `--dry-run` first when the directory already holds files.
- Any other `--stack` prints the path of its note and exits: follow that note's "Scaffold" section, then copy `src/lib/{awards-hook,reduced-motion,quality-tiers,raf}.js` from the vite scaffold into the client-only location the note names.
- Existing app: install `gsap@3.15.0`, `lenis@1.3.26` and, with WebGL, `three@0.186.0 postprocessing@6.39.5` at the pinned versions, then port the boot into the framework's client-only entry exactly as the note shows.
- Replace every placeholder before anyone sees it: the hero copy, the icosahedron in `src/webgl/scene.js` (a placeholder, never a hero), the commented `@font-face` rules in `fonts.css`, the empty `og:image` and `meta description`.

## Boot architecture

The rules below are what `[recipe:boot-lenis-gsap]` demonstrates. Read `${CLAUDE_PLUGIN_ROOT}/recipes/boot-lenis-gsap/main.js` and its README before porting the boot, and `${CLAUDE_PLUGIN_ROOT}/references/stacks/lenis-1.3.md` or `stacks/gsap-3.15.md` whenever an option name is in doubt.

### One clock

Lenis 1.3 defaults to `autoRaf: false`, so a Lenis nobody ticks swallows wheel events and the page looks frozen; and two clocks give every scroll-linked value two opinions.

- Create Lenis with `autoRaf: false` written out, so the ownership of the clock is visible in the code.
- Call `lenis.raf(time * 1000)` from `gsap.ticker.add`: the ticker hands you seconds, Lenis wants milliseconds.
- `gsap.ticker.lagSmoothing(0)`, so a tab switch does not fast-forward scrubbed values.
- `lenis.on('scroll', ScrollTrigger.update)`, so triggers read the smoothed position.
- Every other loop, the GL render included, subscribes to that ticker or to `src/lib/raf.js`; never a private `requestAnimationFrame`. The scaffold's placeholder scene runs its own loop for simplicity; move the real scene onto the ticker.

### Measure after the page is real

ScrollTrigger positions computed on fallback fonts or undecoded images are wrong by the height of the swap.

- `ScrollTrigger.refresh()` after `document.fonts.ready`, after `load`, and after the preloader resolves.
- `invalidateOnRefresh: true` on every tween with function-based values.
- Split text only after fonts, and let `autoSplit` re-split on resize `[pattern:motion-vocabulary#scrub-and-refresh-rules]`.

### Resize is a strategy, not an event

A scaling system chosen after the components exist means every measure is written twice.

- Decide vw-lock or fluid `clamp()` before the first component and write it into the contract `[pattern:responsive-strategy#decide-before-build]`.
- `ScrollTrigger.config({ ignoreMobileResize: true })`, so the address bar never rebuilds the page.
- Breakpoint choreography inside `gsap.matchMedia()` blocks that revert themselves; never two scores toggled with `display: none`.
- `lenis.resize()` after async content the ResizeObserver cannot see; scenes rebuilt on a debounced `ResizeObserver`.
- Never `location.reload()` at a breakpoint `[pattern:responsive-strategy#never-reload-at-a-breakpoint]`.

### The `window.__awards` contract

`capture.mjs`, `verify-recipes.mjs` and the jury drive the page through `window.__awards = { ready, scrollTo(progress), state() }`, installed by `src/lib/awards-hook.js`; a page without the hook cannot be reviewed by the tools.

- `awards.ready()` only when the page is interactive: fonts loaded, first-scene assets decoded, preloader gone.
- `awards.addState(() => ({ motion, quality, triggers, gl }))` for whatever a reviewer needs to read.
- `awards.setScroller(fn)` when the page owns a virtual float, so `scrollTo(progress)` still works.
- `window.lenis` stays exposed, so `scrollTo` routes through `lenis.scrollTo(y, { immediate: true, force: true })`.

### Reduced motion is one switch

A visitor who asked for less movement still needs to see a menu open and a theme change.

- `motionTier()` from `src/lib/reduced-motion.js` answers `full | reduced | static` once, from the media query and an optional `data-motion` override on `<html>`; `syncMotionTierAttribute()` mirrors it as `data-motion-tier` so CSS can branch.
- The score reads the same answer through `gsap.matchMedia()` conditions; Lenis honours the preference on its own (`respectReducedMotion` is on by default).
- Never a global animation kill; the audit fails it `[recipe:reduced-motion-switch]`.

### Quality tiers gate the expensive work

Mobile GPUs fail on pixel count, not triangle count, and a 20 fps particle field is worse than a still.

- `detectQualityTier()` probes once (DPR, memory, cores, GPU string, WebGL2, a frame-time sample) and returns `dpr`, `maxPixels`, `postprocessing`, `particles`, `blurSamples`.
- `applyRendererBudget(renderer, profile)` caps DPR and an absolute pixel budget.
- Import the GL chunk only when the quality tier is above low and the motion tier is full `[recipe:quality-tiers]`.

### Load in stages

The preloader is honest only when its stages are real `[pattern:asset-pipeline#staged-loading]`.

1. Tokens and a CSS-only loader, painted before any framework.
2. The shell entry (≈ 20 KB gz): fonts, Lenis, the score, the preloader logic.
3. The first scene's assets plus `document.fonts.ready`: this `Promise.all` resolves the counter.
4. Neighbouring scenes by scene window or `IntersectionObserver`.
5. Everything else on idle; the audio bed only after consent.

## WebGL in its own chunk

A `three` import in the entry costs every visitor the library whether or not the scene ever mounts, and the audit fails an entry above 300 KB gz [P04].

- Keep `src/webgl/` behind a dynamic `import()` guarded by the tiers; the scaffold's `vite.config.js` also groups `three` into its own vendor chunk. If Vite 8 warns that `rollupOptions` is a deprecated alias, move the group to `build.rolldownOptions.output.codeSplitting.groups` as `stacks/vite-vanilla.md` shows.
- Next: `next/dynamic` with `ssr: false` inside a Client Component. Nuxt: a `.client.vue` inside `<ClientOnly>` in the layout. Astro: one `<canvas transition:persist>` and a lazy import from the boot. SvelteKit: `{#await import(...)}` around the Threlte stage.
- One canvas for the whole site, created in the layout and never per page; scenes mount and dispose, the renderer persists.
- Copy the Draco and Basis decoders into `public/decoders/` and call `KTX2Loader.detectSupport(renderer)` before the first load (`stacks/three-0.186.md`).

Building the scene itself is another job. Invoke the `awards:webgl` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline.

## Fonts, assets and budgets

Every readable production bundle in the corpus self-hosts its faces, and a CDN font request is the first thing the audit flags [T02].

- Woff2 subsets from your origin, at most four files and 400 KB, `font-display` set, a metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`) so a re-split never reflows; preload the two files above the fold.
- Next: `next/font/local` with `adjustFontFallback` left on. Webflow: upload to the site's font settings or serve from the engine origin with CORS.
- Faces come from `awards:system` and `DESIGN.md`; the reflex faces in `${CLAUDE_PLUGIN_ROOT}/references/reflex-lists.md` stay out of the first family.

Set up the asset tooling with the project, because a scene is cheap or expensive at export time `[pattern:asset-pipeline#tooling]`:

- `@gltf-transform/cli` 4.5.0: `optimize`, `draco` or `meshopt`, `resize`, `prune`, `dedup`, `weld`.
- `toktx` or `basisu` for KTX2: `etc1s` for colour maps, `uastc` for normal and data maps, mipmaps on.
- `ffmpeg` for frame sequences and stacked-alpha video.
- Decoders served from `public/decoders/`, never from a third-party CDN.

Copy the budgets into `AWARDS.md ## Budgets & tiers` and hold the build to them. They are the numbers a Site of the Year shipped, listed with their sources in `[pattern:asset-pipeline#budgets]`: shell entry ≈ 20 KB gz, JS before the GL chunk ≤ 200 KB gz, GL chunk plus first scene ≤ 500 KB gz and lazy, textures ≤ 700 KB per scene, hero mesh ≤ 300 KB, rasters under 1 MB, fonts ≤ 4 files, LCP ≤ 2.5 s on throttled 4G from a poster or the DOM. Measure gzipped output, never source size.

## Transitions per stack

One transition vocabulary per site, chosen with the stack so the router and the score never fight `[pattern:preloaders-and-transitions#transition-archetypes]`. Whatever the mechanism, a route change resets scroll (`lenis.scrollTo(0, { immediate: true })`), moves focus to the new `<main>` or `<h1>`, reverts the old page's `gsap.context`, and refreshes ScrollTrigger once the new fonts and images have landed. Reduced motion switches every view-transition animation off in CSS.

| Stack | Mechanism | Note |
|---|---|---|
| Vite MPA (default) | Cross-document View Transitions, `@view-transition { navigation: auto; }`, shared elements by `view-transition-name` | `stacks/vite-vanilla.md` |
| Vite SPA, Webflow shell | `@unseenco/taxi` 1.9.1: a `Renderer` per view whose `onEnter` opens a `gsap.context` and whose `onLeave` reverts it; a `Transition` that resets Lenis and refreshes before `done()` | `[recipe:page-transitions]` |
| Next.js | `template.tsx` remounts client components per navigation; React's `<ViewTransition>` for morphs; intercept the `<Link>` click, play the exit, then `router.push` for authored exits | `stacks/next.md` |
| Nuxt | `definePageMeta({ pageTransition: { css: false, onLeave, onEnter } })` with GSAP owning the callbacks; `experimental.viewTransition` for the native path; no taxi or Barba | `stacks/nuxt.md` |
| Astro | `<ClientRouter />`; revert in `astro:before-swap`, mount and refresh in `astro:page-load`; `transition:name` pairs elements | `stacks/astro.md` |
| SvelteKit | `onNavigate` + `document.startViewTransition`; `afterNavigate` resets scroll and refreshes; `beforeNavigate` cancels for an authored exit | `stacks/sveltekit.md` |

## Existing app: audit the boot

When Lenis or GSAP is already installed, the fastest win is removing what fights them. Read the boot file and check:

- One Lenis instance, ticked from `gsap.ticker`; no `autoRaf: true` beside a ticker, no ScrollSmoother, Locomotive or `normalizeScroll` next to it.
- No `scroll-behavior: smooth` in any stylesheet; `lenis/dist/lenis.css` imported.
- `ScrollTrigger.refresh()` after fonts and load; `ignoreMobileResize` set; no `location.reload()` on resize.
- No private `requestAnimationFrame` loops (marquees, cursors, renderers) outside the ticker.
- `renderer.setPixelRatio` capped by a tier and a `dispose()` path present [P06] [P07].
- Fonts self-hosted; `window.__awards` installed; a reduced-motion branch that keeps state changes [M01].
- Vendor `three` in its own chunk; entry under 200 KB gz.

Fix each finding in place, keep the framework's conventions, and record anything you could not change under `AWARDS.md ## Exceptions`.

## Verify

Run these before handing off; a boot that fails any of them makes every later phase measure against a broken page.

- [ ] `npm install && npm run dev` boots; the wheel, arrow keys, Space, PageDown and the skip link all scroll the document; no console errors.
- [ ] `npm run build` writes a separate `three-*.js` (or equivalent) chunk under `dist/assets/` that the entry does not import statically; `gzip -c dist/assets/index-*.js | wc -c` stays under 200 KB.
- [ ] Emulate `prefers-reduced-motion: reduce` in DevTools: `window.__awards.state().motion` reports `reduced`, `<html data-motion-tier>` follows, Lenis scrolls instantly, nothing is hidden.
- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/capture.mjs" dist --out .awards/captures --scroll 0,50,100 --reduced-motion --json`: the manifest shows `awardsHook: true`, `awardsState.scroll` near `0.5` in `desktop-s50.png`, mobile and `desktop-rm` captures present, empty `consoleErrors` and `pageErrors`. Exit 3 means Playwright is missing: install it as the message says, or record that captures are pending.
- [ ] `node "${CLAUDE_PLUGIN_ROOT}/scripts/audit.mjs" . --json` reports no P0 or P1 finding, or each one has a reason under `AWARDS.md ## Exceptions`.
- [ ] `.gitignore` covers `node_modules`, `dist`, `.awards/captures` and `.awards/audit.json`; fonts, decoders and `og.png` are real files, not placeholders.
- [ ] `AWARDS.md ## Budgets & tiers` names the stack, the scroll model, the resize strategy, the transition mechanism and the budgets; `## Status` ticks "Stack booted".

## Hand-off

Tick "Stack booted (stack)" in `AWARDS.md ## Status`, fill `## Budgets & tiers`, and note any decision the brief did not cover (scroll model, transition mechanism, CMS) under `## Exceptions` or the brief's constraints. Then: Invoke the `awards:motion` skill now with the Skill tool, passing the brief and the AWARDS.md path; do not do its work inline. When the direction contract names a WebGL dose above "none", `awards:motion` hands on to `awards:webgl` after the score is written.

## Refuse

- Two smooth-scroll libraries (Lenis beside ScrollSmoother, Locomotive or `ScrollTrigger.normalizeScroll(true)`): two scroll positions that disagree every frame.
- CSS `scroll-behavior: smooth` beside Lenis: `scrollTo` fights the browser and the audit flags it [M05].
- A Google Fonts CDN link or a foundry `@import`: a third-party request before first paint and an audit failure [T02].
- A `position: fixed` canvas whose planes drift against their placeholders: fix the clock (absolute re-offset or a scroll uniform), never the scroll.
- Framer Motion or `motion` for scroll scrub: no winner shipped it; scrubbed timelines are ScrollTrigger with `ease: 'none'`.
- A canvas per page, or two WebGL contexts on one page: resources cannot be shared and the second context is the one that gets lost.
- `location.reload()` at a breakpoint, or two scores toggled with `display: none`: focus, scroll position and every live region are lost mid-visit.
- `ssr: false`, `client:only` or an empty shell to dodge `window` errors: it deletes the DOM mirror the accessibility score is made of.
- Bumping a pinned version because a newer one exists: bump one library at a time and re-run the recipe verification.
- Tailwind or a component library added by reflex: no winner shipped one in production; use them only where the project already does.
- Scaffolding into a non-empty directory, or a scaffold whose placeholders ship.
