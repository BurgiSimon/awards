# Anime.js v4 — https://animejs.com/

<!-- Two evidence classes, kept apart throughout. LIBRARY facts are [verified] from the repo clone at `scratchpad/refs/anime` (package.json 4.5.0, src/, examples/) — read on disk for this card. SITE facts (layout, hero sequencing, framework, host) are [recalled] or [unknown]: the website's source is not in the repo and no repo for the site was found. The examples stylesheet is the only design-token source; that the marketing site uses the same tokens is [recalled, medium]. -->

| Field | Value |
|---|---|
| Class | docs (documentation + marketing for an open-source animation engine) |
| Visitor mode | read, with experience set-pieces |
| Awards | Awwwards Site of the Day on the 2025 v4 launch [recalled, medium]; a Developer Award as the natural category [recalled, medium]; SOTM / FWA / CSSDA [recalled, low]; dates, scores, jury [unknown] — state none |
| Studio / credits | Julian Garnier, sole author — `"author": "Julian Garnier <julian@animejs.com>"`, `© Julian Garnier | MIT License`, repo `juliangarnier/anime` [verified]; site designed and built by the author [inferred, high — the v4 logo animation ships as `examples/animejs-v4-logo-animation/` in the library repo]; sponsor tiers Platinum/Silver with mostly placeholder slots, one named Silver sponsor TestMu AI [verified] |
| Stack (evidence level) | LIBRARY [verified]: `animejs` 4.5.0, ESM-first (`"type": "module"`), Rollup 4 + `@rollup/plugin-terser`, plain JS with JSDoc types and `tsconfig.types.json` for `.d.ts` only, ESM + UMD + CJS + IIFE bundles, deep export map (`animejs/timer`, `/text`, `/svg`, `/waapi`, `/easings/spring`, `/adapters/three` …), zero runtime dependencies, `three` an optional peer `>=0.150.0`, dev deps `tweaks ^0.3.4`, `three ^0.184.0`, browser-sync, mocha, chai, nodemon · SITE: framework, CMS, host [unknown]; a static generator on a CDN is genre-typical [inferred, low] |
| Palette | LIBRARY token system [verified from `examples/assets/css/styles.css`]: warm near-black surfaces `--bg-1 #252423` → `--bg-5 #3a3938`, foregrounds `--fg-1 #dddcda` → `--fg-5 #33332e`, 17 named hues × 6 steps converging on the warm ground; site uses the same tokens [recalled, medium]; strategy: tinted dark ground + unlimited accents from one ramp system |
| Type | `IoskeleyMono` Regular + Bold, self-hosted woff2; `font-family: 'IoskeleyMono', monospace, sans-serif` with a `ui-monospace, monospace` fallback stack [verified for the example system]; the whole design system is monospaced; site scale [unknown] |
| WebGL dosage | moments — one Three.js demo (`threejs/transforms`) via the adapter [verified]; the site is otherwise DOM, SVG and 2D canvas [recalled, medium] |
| Scroll model | native scroll + `onScroll({ sync })` scrubbing [verified as the library's model]; an external smooth-scroll library on the site [unknown, and would be odd] |
| Narrative model | specification — documentation as a playground, opened by a self-demonstrating identity |

## 1. Concept and narrative
- The idea [verified artefact, inferred framing]: the product demonstrates itself. The wordmark is a physics gag built with the library — an ink line falls, splashes, wiggles, and the letters `a n i m e` pop out of the splash. The animation lives in the repo as a runnable example, so identity and product share authorship.
- Site narrative [recalled, medium]: every doc page is a live, running demo rather than a code listing; the homepage is a sequence of self-playing set-pieces; a v3→v4 migration guide sits on the repo wiki [verified].
- Register [recalled, medium]: playful, technical, dense with toys; copy is terse and API-flavoured.
- Reputational proxies [verified]: README badges for npm monthly downloads, jsDelivr hits and GitHub Sponsors; dark/light logo GIFs via `<picture>` + `prefers-color-scheme`, so light mode exists in the brand.

## 2. Structure and components
- Site [recalled, medium]: homepage set-pieces; a documentation area with a persistent sidebar; live examples with editable parameters; an examples/showcase gallery; sponsor tiers. Preloader, cursor, 404 [unknown].
- Demo inventory on disk [verified]: 36 example programs — `additive-creature`, `additive-fireflies`, `advanced-grid-staggering`, `animatable-follow-cursor`, `animejs-v4-logo-animation`, nine under `auto-layout/` (accordion, cards, code, grid-columns, nav, onscroll, periodic-table, planets, todo-list), `canvas-2d`, `clock-playback-controls`, `draggable-infinite-auto-carousel`, `draggable-mouse-scroll-snap-carousel`, `draggable-playground`, `irregular-playback-typewriter`, `layered-css-transforms`, `onscroll-responsive-scope`, `onscroll-sticky`, `stagger`, `svg-graph`, `svg-line-drawing`, `text/hover-effects`, `text/scramble`, `text/scramble-tl`, `text/split-effects`, `text/split-playground`, `threejs/transforms`, `timeline-50K-stars`, `timeline-refresh-starlings`, `timeline-seamless-loop`, `timeline-stress-test`.
- Tweak panels [verified]: `createTweaks` / `GUI.BeginPanel` with `syncTweaks('localStorage')` — live parameter controls whose state survives reloads; the two "playground" demos are built on it.
- Star confetti [verified]: `timeline-50K-stars` clones a star SVG on click, tweens randomised multi-keyframe `translateX`, `color: { from: '#FFDD8E' }`, `scale: [1, 1.2, 1, .8]`, opacity to 0 — a "celebrate the repo" interaction; `timeline-stress-test` is an explicit performance flex.

## 3. Visual language
- Surfaces [verified tokens]: `--bg-1 #252423`, `--bg-2 #2a2928`, `--bg-3 #2f2e2d`, `--bg-4 #353433`, `--bg-5 #3a3938` — brown-shifted charcoal, not neutral grey. Foregrounds `--fg-1 #dddcda`, `--fg-2 #c6c3c1`, `--fg-3 #96918f`, `--fg-4 #65655e`, `--fg-5 #33332e`. Ramps `--white-1 #f6f4f2` → `--white-6 #312e2b`, `--black-1 #252423` → `--black-6 #272421`.
- The 17 × 6 accent system [verified]: every hue has steps `-1` (vivid) to `-6` (near-ground), laid out identically — red `#ff4b4b`, corail `#ff8333`, orange `#ffa828`, yellow `#ffcc2a`, citrus `#f9f640`, lime `#b7ff54`, green `#6aff65`, emerald `#57f695`, turquoise `#66ffbc`, cyan `#26f2d5`, sega `#05dbe9`, sky `#33b3f1`, indigo `#717aff`, lavender `#a369ff`, purple `#c06ddf`, magenta `#e962bf`, pink `#ff86a7`. The `-6` steps carry their hue into the ground (`--red-6 #322523`, `--lime-6 #2d3123`, `--cyan-6 #23302d`, `--sega-6 #212f2f`, `--indigo-6 #282630`) — a tinted dark mode where no accent ever goes muddy.
- Geometry tokens [verified]: `--br: 1rem`, `--padding: 1rem`, `--border-width: 1px`, `--input-border-radius: .25rem`.
- Type [verified]: IoskeleyMono everywhere; no secondary face in the system.
- Imagery [recalled, medium]: none — SVG, DOM, canvas and type only; spec-sheet / oscilloscope / dev-tool aesthetic, not editorial.
- Site layout, grid, hero composition [unknown].

## 4. Motion and effects (with parameters)
### The logo animation [verified, `examples/animejs-v4-logo-animation/index.js`]
One `createTimeline()` with labels `FALL` → `WIGGLE` → `POP` → `SWEECH` → `FOUR` → `TEXT` → `OUTRO`; two custom curves: `splashCurve = cubicBezier(0.225, 1, 0.915, 0.980)` and `sweechCurve = eases.outElastic(1.1, 0.9)`.
- FALL: `#line-0` `translateY` `[-280 → 19]` on `inQuart` 320 ms; then `scaleY [3 → 1.75]` (300 ms) and `scaleX [.8 → 1]` (650 ms) both on `outElastic(1, 1.4)` after a 320 ms delay — a drop with squash; during impact five sequential `svg.morphTo` path morphs (`#line-0-1` … `#line-0-6`) at 60 / 80 / 90 / 90 / 140 ms — the line deforms like liquid.
- WIGGLE: five more morphs (`#line-1` … `#line-5`) at 340 / 260 / 180 / 180 / 340 ms (`inOutQuad` in, `outSine` out); `translateY → 0` over 500 ms; `scaleX → .9` after 750 ms over 550 ms; block 900 ms.
- POP: the line is swapped for a dot (`.set` at the label). Letters `#a-1 #n-1 #i-1 #m-1 #e-1`, `stagger(80, { from: 'center' })`, per-axis keyframes: `translateY` `[35, -80]` 190 ms splash → `4` 120 ms delay 20 `inQuad` → `0` 120 ms `outQuad`; `scaleX` `[.25, .85]` 190 `outQuad` → `1.08` 120 delay 85 `inOutSine` → `1` 260 delay 25; `scaleY` `[.4, 1.5]` 120 `outSine` → `.6` 120 delay 180 → `1.2` 180 delay 25 → `1` 190 delay 15 — hand-authored squash-and-stretch. The dot: `translateY` `[30, -170]` 240 splash → `35` → `-50` splash → `5` → `0`; `scaleY [4 → 1]` 190 ms; `rotate '+=.75turn'` 480 ms then `'+=.25turn'`. `#logo` `scale [1.3 → 1]`, `translateY [-23 → 0]`, 1000 ms `outExpo`. The `i` re-squashes at `'<<+=380'`: `scaleY .25` (150 ms `outExpo`) → `1` over 700 ms on `outElastic(2.11, 0.61)`.
- SWEECH (`'-=290'`): dot morphs to `#dot-2` over 900 ms on the sweech curve; four onion-skin clones (created in JS, `transformOrigin: '100% 50%'`) follow with `opacity: stagger([1, .4])`, `scaleX [4 → 1]`, `delay: stagger(18)`; each letter morphs to its final glyph at `SWEECH+=0/10/20/30/40`; `svg.createDrawable(['#j-line', '#s-line'])` draws `'0 1'` over 620 ms `outQuint`, `stagger(40)`.
- FOUR (`'<+=80'`): `#four` `fill` from `#FFF` (delay 600, `out(2)`, 900 ms), `opacity [0 → 1]` 350 ms, `scale [1.75 → 1]` 1400 ms `inOutExpo`; an SVG `feGaussianBlur` `stdDeviation ['15,15' → '0,0']` over 1000 ms `out(2)`; letters slide `translateX '-=68'` 1250 ms `inOutQuint`, `stagger(14)`.
- TEXT: the tagline is a `textContent` tween over a character table with a `modifier` that rounds to a glyph — a scramble reveal, 800 ms `inOutExpo`, `stagger(30, { from: 'center', ease: 'inOut(2)' })`. OUTRO (`'+=1000'`) reverses it and drops the letters `translateY 80` with `stagger(30, { start: 300, from: 'last' })`.

### The v4 API grammar [verified from `src/` and `examples/`]
- Exports (`src/index.js`): timer, animation, timeline, animatable, draggable, scope, events, engine, easings, layout, utils, svg, text, waapi, types, globals. Factories: `animate`, `createTimer`, `createTimeline`, `createAnimatable`, `createDraggable`, `createScope`, `onScroll` (class `ScrollObserver`); classes `JSAnimation`, `Timer`, `Timeline`, `Animatable`, `Draggable`, `Scope`.
- `animate(targets, params)` on CSS, SVG, DOM attributes and plain objects; per-property objects (`rotate: { from: -180 }`) and per-property keyframe arrays, each with its own `duration`, `delay`, `ease` — the v4 signature.
- `composition: 'blend'` — additive blending; in `onscroll-sticky` scroll drives `y: { to: '-60%', duration: 400 }` while hover blends to `'-70%'` (350 ms) and back (750 ms, delay 75) without fighting.
- `stagger(value, { from: 'center'|'first'|'last'|'random', start, ease, reversed, modifier, use: 'data-line'|'data-char' })`, range form `stagger([.75, 1])`; grid staggering in `advanced-grid-staggering`.
- `createTimeline({ defaults })` with `.add(target, params, position)`, `.set()`, `.label('NAME')`, `.init()`, `.seek()`, `.play()`; positions are numbers, labels, relative strings (`'<<+=380'`, `'SWEECH+=250'`) or a `stagger()`.
- `onScroll({ target, enter: 'top top', leave: 'bottom bottom', sync: .5, debug: true, scrollContainers })` passed as the `autoplay` value — scroll-linking is an autoplay strategy, not a plugin; `sync` is the scrub smoothing, `debug` draws markers.
- `splitText(target, { chars, words, lines, debug })`: `chars: { class, clone: 'left'|'right'|'top'|'bottom', wrap: 'clip' }` builds an inert absolute duplicate at ±100 % inside an overflow-clipped wrapper; writes `data-line` / `data-char`; `.addEffect(fn)` re-applies after a re-split on resize; `.revert()` runs cleanups. The hover roll: `clone: 'left', wrap: 'clip'` then `.add('.char > span', { x: '100%' }, stagger(5, { use: 'data-char' }))`.
- `scrambleText`: `from: auto|left|right|center|random`, `chars` presets lowercase, uppercase, numbers, symbols (`'!%#_|*+='`), braille, blocks, shades; `cursor` — `true` gives `'_'`, a string is used as given, the library default is none and the demo panel seeds `'░▒▓█'`; `perturbation`, `seed`, `revealDelay`, `revealRate` (default 60/s), `settleDuration` (default 300 ms), `settleRate` (default 30/s).
- `createDraggable(target, { trigger, x/y locks, onGrab, onRelease, onResize, releaseStiffness (default 80), velocityMultiplier })` with live `deltaX`/`deltaY`.
- `createAnimatable(target, { x: 0, modifier })` returns callable setters; the infinite carousel uses `modifier: v => utils.wrap(v, -carousel.width / 2, 0)`, tweens `speedX` to 0 on grab and back to 2 on release (500 ms each), sums `draggable.deltaX` and a wheel value lerped at `.2` into the same `x` each frame.
- `createScope({ root, defaults, mediaQueries })` → `.add(scope => …)` returning a teardown, `scope.add('method', fn)`, `matchMedia`-driven re-execution — v4's answer to `gsap.context()` and the key to React/Vue safety.
- Easings: one power primitive `easeInPower = (p = 1.68) => t => pow(t, +p)`; `Quad/Cubic/Quart/Quint` = powers 2/3/4/5; `Sine`, `Circ`, `Expo`, `Bounce`; parametric `Back(overshoot = 1.7)` and `Elastic(amplitude = 1, period = .3)` (amplitude clamped 1–10); four wrappers `in / out / inOut / outIn`, so strings compose: `'inOutQuint'`, `'outElastic(1, 1.4)'`, `'in(2)'`, `'steps(10)'`, `'linear'`; `createSpring` adapted from WebKit's spring solver; `cubicBezier`, `irregular`, `steps`.
- SVG: `morphTo` (ten uses in the logo), `createDrawable`, `createMotionPath`, `getPath`. `utils`: `$`, `set`, `get`, `random`, `randomPick`, `shuffle`, `createSeededRandom`, `lerp`, `damp`, `clamp`, `round`, `roundPad`, `snap`, `wrap`, `mapRange`, `degToRad`, `radToDeg`, `padStart`, `padEnd`, `sync`, `keepTime`, `remove` — no lodash needed.
- `waapi` adapter for compositor-thread transform/opacity with the same grammar. Three.js adapter (`src/adapters/three/`, a side-effect import) lets `animate()` and `utils.set()` take Meshes, Materials, InstancedMesh instances and uniforms, and resolves CSS custom properties into Three colours: `utils.set(scene, { background: 'var(--bg-1)' })`, colour keyframes `['var(--orange-1)', 'var(--red-1)', 'var(--lime-1)', …]` — one palette for DOM and WebGL.
- Site-level sequencing of these into the hero [recalled, medium]. Sound [unknown].

## 5. Tech and pipeline
- Library build [verified]: Rollup + terser, JSDoc-typed JS with generated `.d.ts`, four bundle formats, deep per-module export map for tree-shaking, `sideEffects` limited to `adapters/**`, jsDelivr/unpkg pointing at `dist/bundles/anime.umd.min.js`.
- Responsive story [verified]: `createScope` re-initialises per media query with automatic cleanup; `splitText().addEffect()` survives re-splits; `keepTime` and `sync` handle tab-visibility drift; the WAAPI path offloads to the compositor.
- Site framework, host, CMS, asset pipeline, budgets [unknown].

## 6. Weaknesses
- No `prefers-reduced-motion` handling anywhere in `src/` [verified, grep] and none evidenced on the site [unknown] — do not assume the library supplies it.
- Site accessibility, keyboard navigation of live demos, focus handling inside tweak panels, Lighthouse [unknown].
- Persisted tweak state in localStorage [verified] is a per-browser convenience that can throw in private windows — wrap it.
- The logo timeline is long (several seconds end to end [inferred from the durations]) with no evidenced skip.
- What the awards skills do differently: a reduced-motion branch at the `createScope` level that plays the logo's final frame and disables autoplaying set-pieces; keyboard-operable demos with visible focus; every splitter output mirrored by an `aria-label`/visually-hidden copy of the original text (split spans are not readable text); a load gate only on assets actually needed above the fold; no breakpoint reloads — `mediaQueries` scopes are the right pattern here; dark and light both via tokens, never a hard-coded `#252423`.

## 7. Principles (3–6, generalisable)
1. Let the product demonstrate itself: build the identity with the very tool or aesthetic the site sells, and publish it as a readable example.
2. Documentation as playground: real parameters, live and persisted, keep visitors playing rather than reading.
3. A design system built for motion: N hues × 6 steps converging on one tinted ground lets unlimited accents stay coherent.
4. Animation principles applied to type: squash, stretch, anticipation, overshoot and settle, per axis, per keyframe.
5. Compositional grammar over presets: one primitive plus wrappers yields a huge expressive range for almost no code.
6. Prove performance in public: a stress test is a claim nobody can fake.

## 8. Take / Don't take
- **Take:**
  - The 6-step tinted accent ramp: for any dark UI, define each hue so its darkest step is the background tinted with that hue.
  - The compositional easing grammar (`type(power)` strings from one power primitive) and parametric `outElastic(amplitude, period)` for landings.
  - Scroll-linking as an autoplay strategy: `autoplay: onScroll({ enter, leave, sync })` so one timeline plays on load or on scroll by swapping one option (compare camera scrubbing with a smoothing factor in [site:mont-fort]).
  - `composition: 'blend'` so hover, scroll and idle on one property coexist.
  - Scope + teardown + media queries as the container for framework-embedded motion.
  - Split-then-stagger-by-data-attribute so word and line rhythms nest (the GSAP SplitText equivalent is used in [site:lando-norris]).
  - The duplicate-char hover roll: `clone: 'left', wrap: 'clip'`, then stagger the clone's `x: '100%'` at 5 ms per char.
  - Onion-skin trails: N clones, offset `transformOrigin`, `opacity: stagger([1, .4])`, `delay: stagger(18)`.
  - The impact morph chain: 4–6 sequential path morphs of 60–140 ms on a landing moment, then a slower 180–340 ms settle.
  - Per-axis, per-keyframe squash-and-stretch on a wordmark (190 / 120 / 120 ms up-hold-settle as a starting rhythm).
  - Persisted tweak panels for showcases; a scramble with separate `revealRate` and `settleRate`.
  - One palette for DOM and WebGL by resolving CSS custom properties into scene colours.
  - The seamless infinite carousel: duplicate children once, animate `x` continuously, `utils.wrap(v, -width/2, 0)`, sum drag delta into the same value, tween auto-speed to 0 on grab.
- **Don't take:**
  - The ink-drop / splash / letters-pop logo choreography as a sequence, or its label names.
  - The IoskeleyMono-only system as the identity, or the "everything monospace" look for a non-dev product.
  - The 17 named hues and their hexes (`#252423`, `#ff4b4b`, `#05dbe9` …) — take the ramp *rule*, not the values.
  - The `--br: 1rem` / `--padding: 1rem` panel geometry, the tweak-panel chrome, the star-confetti button.
  - The docs-as-demo page structure and any of the 36 example set-pieces re-skinned.

## 9. Confidence and sources
- Library API, versions, build, examples, tokens, fonts, logo choreography: [verified], very high — read on disk.
- Site design language ("the examples palette is the site palette", live-docs concept, no imagery): [recalled, medium]. Site framework, host, layout, hero sequencing, preloader, cursor: [unknown]. Awards: [recalled, medium] for SOTD, [unknown] for specifics.
- Sources (all under `scratchpad/refs/anime/`): `README.md`, `package.json`, `src/index.js`, `src/easings/eases/parser.js`, `src/easings/spring/index.js`, `src/text/split.js`, `src/text/scramble.js`, `src/draggable/draggable.js`, `src/scope/scope.js`, `src/adapters/three/`, `src/utils/`, `src/svg/`, `examples/assets/css/styles.css`, `examples/animejs-v4-logo-animation/index.js`, `examples/onscroll-sticky/index.js`, `examples/text/split-effects/index.js`, `examples/text/hover-effects/index.js`, `examples/text/scramble/index.js`, `examples/draggable-infinite-auto-carousel/index.js`, `examples/timeline-50K-stars/index.js`, `examples/threejs/transforms/index.js`. Research report: `scratchpad/research/batch-D.md`.
