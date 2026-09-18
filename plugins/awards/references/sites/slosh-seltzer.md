# Slosh Seltzer — https://sloshseltzer.com/

| Field | Value |
|---|---|
| Class | brand — a multi-flavour (multi-SKU) DTC hard-seltzer experience, not a storefront-first site [verified, index.html og:description + `uil.json` scene names] |
| Visitor mode | experience |
| Awards | Awwwards **Site of the Day, 5 Jun 2024**, overall **7.69** — Design 7.60 · Usability 7.34 · Creativity 8.30 · Content 7.87 [verified, Awwwards entry read 2026-09-18]. **DEV AWARD score 7.45** (a published score, not a badge) over six criteria: Semantics/SEO 6.80 · Animations/Transitions 8.60 · Accessibility 6.80 · WPO 7.60 · Responsive Design 7.60 · Markup/Meta-data 7.20 [verified, same]. The entry shows **no Site of the Month**, no honourable mention and no CSSDA row [verified, same]. CSSDA WOTY-2024 nominee and the 8.99 figure: **unverified this pass**, previously sourced only to AI-compiled repos — treat as unproven [unknown] |
| Studio / credits | Awwwards credits the entry to **Active Theory** [verified, Awwwards entry read 2026-09-18]. The site's own `<title>`, `og:title` and `og:description` brand it **Buttermax** — "Buttermax's newest brainchild Slosh Seltzer, an in-house maximalist design exploration" [verified, index.html]. The bundle boots Active Theory's **Hydra** framework (`hydra_*` events, `#Stage`, `HydraCSS`) [verified, app.js]. Both names are real and not in conflict: submitted by Active Theory, published under the Buttermax brand. Individual credits [unknown] |
| Stack (evidence level) | **Hydra** (Active Theory in-house) + **Theatre.js** sequencer + **Oimo.js** rigid-body physics + Firebase (app/auth/database/storage) + Draco, KTX2/Basis transcoders, all self-hosted under `assets/js/lib/` [verified, app.js]. Three.js only as an optional global (`window.THREE ? new THREE.PerspectiveCamera(...)`) — the renderer is Hydra's own (`ShaderRendererWebGL`, `FBORendererWebGL`) [verified, app.js]. **No GSAP, no Lenis, no React, no Next/Nuxt/Astro, no Webflow, no CMS** — zero hits [verified, app.js]. Hosting: Firebase Hosting behind Fastly (`x-fh-requested-host`, `x-served-by: cache-fra-*`) [verified, response headers]. GA4 `G-HYFTSX6G0W`, `ads_storage` denied by default [verified, index.html]. The old "WordPress" scrape stays rejected as junk |
| Palette | `#FFC1FF` pink · `#00A165` green · `#FF0837` red · `#0069D8` blue · `#FF5F00` orange · `#FFC800` yellow [verified, `families.json` sample; `#FFC1FF`, `#FF0837`, `#0069D8`, `#00A165`, `#FFC800` re-read from `unsupported.html` and `uil.json`/`app.js` 2026-09-18]. Awwwards lists exactly **one** palette colour, `#ffc1ff` [verified, entry]. Strategy: flavour-swap colourfield — saturated, unmodulated hues, one on screen at a time |
| Type | **steelfish-eb** (condensed display) + **FKGroteskMono Regular / Medium**, self-hosted woff2+woff, and Steelfish also shipped as `.json` + `.png` — an **MSDF atlas for type drawn inside WebGL** [verified, index.html, style.css, app.js]. Contract read from the GL layout: display `steelfish-eb` at 85, subtitle `FKGroteskMono-Regular` at 17, `lineHeight: 1`, `letterSpacing: -.03` [verified, app.js UIL tree] |
| WebGL dosage | **100 % canvas.** `html, body, #Stage { overflow: hidden; touch-action: none }`; the whole page is one GL stage, the served CSS is 2.6 KB of stage plumbing with no design tokens at all [verified, style.css] |
| Scroll model | section switcher on a **virtual scroll** — no document scroll exists; `virtualScroll` / `smoothScroll: true` drive a `ScrollController` + `ScrollRenderManager` [verified, app.js]. Confirmed live: capture reported `scrollMode: wheel` on desktop, `native` on mobile [verified, manifest.json] |
| Narrative model | single-object launch — a short loop of seven named scenes around one can [verified, app.js `GLA11y.registerPage` calls] |

> Upgraded from the corpus's weakest card by a live pass on 2026-09-18. The site is reachable and its bundle was read, but **the render was never seen**: the site gates on its own WebGL check and served the unsupported wall to headless Chromium. Everything below is from source, headers, the award entry and the gate — never from a screenshot of the site.

## 1. Concept and narrative
**One idea:** the palette is the navigation. One flat, unmodulated colour field is bound to the current SKU; choosing a flavour repaints the world. One focal object sits on the field; chrome stays tiny [verified at family level, `families.json`; consistent with Slosh's own per-flavour can textures under `assets/images/can/` and per-slide `bg` colours such as `#0069D8` in the GL layout — verified, app.js].

**The loop, now named.** Seven scenes are registered by name with a heading each [verified, app.js]:

| Scene | Registered H1 |
|---|---|
| `landing` | "Slosh Seltzer" |
| `carousel` | "Find a Flavor" |
| `rolling` | "Keep scrolling, The can rolls down the screen as you scroll" |
| `tastebuds` | "Make Your Tastebuds Dance" |
| `good times` | "Good Times Flowing" |
| `pong` | "Shoot your shot" |
| `cheers` | "Sip Sip Hooray, Cheers!" |

Plus `ringpull` and `pourout` as beats inside them [verified, `assets/data/timeline-ringpull.json`, `timeline-cheers.json`, `PouroutFX`]. So the recalled "pop the top" payoff is real and is called **ringpull**; the recalled fluid cursor is real and is called `MouseFluid`; and there is a **playable Pong** ("Shoot your shot") nobody had recorded [verified, app.js, `uil.json`].

**Register:** maximalism, self-declared — the site calls itself "an in-house maximalist design exploration" [verified, index.html og:description]. Awwwards tags: Colorful, Transitions, Microinteractions, Food & Drink, Graphic design, Web & Interactive, Design Agencies [verified, entry].

## 2. Structure and components
| Component | What it does | Label |
|---|---|---|
| WebGL capability gate | no WebGL → redirect to `unsupported.html`, a red-on-pink text wall with no content | [verified, index.html, unsupported.html] |
| Age gate | real HTML: checkbox + `<label for="age">` "I am of legal drinking age in my country/region" + Enter button, disabled until checked | [verified, app.js] |
| Preloader | progress-driven load with `preloading` states | [verified, app.js] |
| Drinks carousel | the flavour switcher; a drag area (`.carousel-drag-area`) over the canvas, wobble/delta-lerp camera | [verified, style.css, `uil.json`] |
| Ringpull / pourout | the physics payoff; `PouroutFX` renders the liquid to its own render target | [verified, app.js] |
| Tastebuds, Rolling can, Cheers, Pong | the remaining scenes; Cheers has a `ConfettiShader` | [verified, app.js, `uil.json`] |
| Sound | `backing.mp3`, `soda_pour-out_loop.wav`, an audio sprite set, and a `muteButton` | [verified, app.js] |
| GL a11y / SEO mirror | `GLA11y` / `GLSEO` builds a visually-hidden DOM of headings and links per scene | [verified, app.js, style.css] |
| Stockist locator, nutrition strip, newsletter, commerce | **no evidence** — no cart, checkout or CMS signature in the bundle | [unknown] |

## 3. Visual language
- **Palette** [verified hexes]: saturated hues, one per flavour, no gradient and no photographic ground. The gate page alone fixes two of them in served CSS: `background-color: #FFC1FF`, `color: #FF0837` [verified, unsupported.html].
- **Light vs dark — closed.** Every colour in the served CSS and in the GL parameter store is light or saturated: `#ffc1ff`, `#ffc0ff`, `#ff0a36`, `#ece4d5`, `#00a165`, `#ffca0a`, `#17cc14`, `#ffc800`, `#ff0837`, `#0019d6`, `#cf97cf`, `#ecebbb` — **no dark or near-black value anywhere** [verified, `uil.json`, unsupported.html, style.css]. The "dark site" description in a Korean reference list is wrong. A warm cream `#ece4d5` sits alongside the saturated hues, so the ground is not always a flavour hue.
- **Type is drawn in GL**, not in the DOM: an MSDF atlas (`steelfish-eb.json` + `.png`) rendered by an `AnimatedText2` shader, `lineHeight: 1`, `letterSpacing: -.03` [verified, app.js]. The family-level "display word at viewport scale, line-height 1, no kicker" claim is now confirmed for Slosh itself.
- **No DOM design system.** There are no CSS custom properties for colour or type; the entire visual system lives in the GL layout tree and its JSON parameter store [verified, style.css, `uil.json`].
- **Not Slosh:** the typeface Sailec and the faceted low-poly fruit belong to Delassus, a family exemplar. Slosh's faces are Steelfish EB and FK Grotesk Mono.
- Browser surfaces: no `theme-color` and no `color-scheme` meta [verified, index.html].

## 4. Motion and effects (with parameters)
- **Render-to-texture section transition — confirmed, not contradicted.** `FXScrollTransition` is a fullscreen shader on a `position: fixed` layer at `zIndex: 2` with uniforms `tMap1`, `tMap2`, `uTransition`, `uVelocity`, `uAngle`, `uRatio`, `uProgress`, plus `tNoise` from `RTNoise.instance().rt` and `tLiquid` from `PouroutFX.instance().rt.texture`; a `ScrollRenderManager` and `ScrollController` drive it [verified, app.js]. Two scene textures composited by one shader is exactly the pattern `[recipe:gl-rtt-composite-transition]` cites this site for, and `SimpleWipeTransitionShader` is a second, simpler member of the same family [verified, app.js]. Compare the scene cuts in [site:igloo].
- **Motion is keyframed in Theatre.js, not tweened in CSS or GSAP.** The landing sequence is a `PositionalSequence` of 39 keyframes over 13 tracked props, ~9.0 s long, every keyframe carrying its own cubic-bezier handles [verified, `assets/data/timeline-landing.json`]. Separate sheets ship for `landing-title`, `ringpull` and `cheers` [verified, asset paths in app.js].
- **The family's "~1 s `cubic-bezier(.645,.045,.355,1)` CSS repaint" does not exist here.** That parameter belongs to the `flavor-swap-colorfield` family exemplars, not to Slosh; Slosh has no DOM tokens to repaint [verified by absence, style.css].
- **Physics is Oimo.js**, a rigid-body engine, not a fluid solver: `OIMO`, `addRigidBody`, `gravity`, and a `TestsCollisionsProton` scene [verified, app.js, `uil.json`]. The liquid is shader work (`uLiquidTransition`, `PouroutFXShader`, `BubbleShader`), the weight is rigid-body.
- **Fluid cursor is real:** `MouseFluid.instance()` feeds the scenes [verified, app.js].
- **Anti-aliasing:** multisampled render targets resolved with a blit, plus an FXAA pass [verified, app.js] — not the SMAA the corpus's genre rule suggests.
- Materials: `CanPBR`, `CarouselFruitPBR`, `CupPBR`, `BallPBR`; lighting from `arealights.json` and an `invert.cube` LUT [verified, `uil.json`, app.js].

## 5. Tech and pipeline
- Single bundle `assets/js/app.<cache>.js`, **1.63 MB uncompressed**, `cache-control: max-age=3600`, last built 8 Jun 2026 — still maintained [verified, response headers]. GL parameter store `uil.json` is a further 236 KB [verified].
- Asset pipeline: **glTF + Draco** (decoder in a worker, `DracoThread`) and **KTX2 / Basis** (`basis_transcoder.wasm`), both self-hosted [verified, app.js].
- Quality tiering is real: a `GPU` helper with `OVERSIZED`, `lt(tier)` and a `GPUBlocklist`, driving `pixelRatio: GPU.OVERSIZED ? 1 : …` and a `World.DPR` used everywhere [verified, app.js]. It carries a device table of Apple GPU model strings [verified, app.js]. The mobile-WebGL-is-viable recall is supported: an `.ios` CSS branch, `AgeGateMobile`, and DPR capping all ship.
- Realtime/multiplayer machinery is present — Firebase database + auth, Automerge CRDT, cbor-x, "Log in with Google" — though which scene uses it is not visible from the bundle [verified for presence, app.js; purpose unknown].
- Bot detection list (`googlebot`, `bingbot`, `facebot`, …) gates something in the boot path [verified, app.js].

## 6. Weaknesses
The jury agreed with most of this: Semantics/SEO 6.80 and Accessibility 6.80 are its two lowest published scores, against Animations/Transitions 8.60 [verified, entry].

- **Reduced motion: fail.** `prefers-reduced-motion` appears **zero** times in the bundle and never in the CSS [verified, app.js, style.css]. A nine-second keyframed intro, a fluid cursor and rigid-body physics with no reduced tier.
- **No-WebGL: fail.** The site redirects to a page reading "Either your browser is very old and not supported or you have turned off webgl" [verified, unsupported.html] — red on pink, `noindex`, no product, no copy, no link. This is also why the 2026-09-18 capture never reached the site.
- **Pinch-zoom blocked:** `maximum-scale=1.0, user-scalable=no` [verified, index.html].
- **Keyboard and screen reader: better than the corpus assumed — correct the old card.** `GLA11y`/`GLSEO` registers a page and an `<h1>` per scene, `aria-label`, `aria-hidden`, `aria-live`, `aria-labelledby`, `aria-busy`, `tabIndex`, `keydown`/`keyup`, ArrowLeft/ArrowRight and Space all ship; `ScrollRenderManager` takes `keyboard` and defaults it **on**; one affordance is labelled "press enter here to go to the flavors section" [verified, app.js]. The age gate is a real checkbox with a real `<label for>`.
- Content depth is thin for a product site — no ingredients, nutrition, stockist or buy path found in the bundle [unknown / probable absence].
- **What the awards skills do differently:** ship the same GL-mirror idea but keep a **real no-WebGL tier** (a per-SKU still and the product copy in HTML) instead of an apology page; add the reduced-motion branch Slosh skips — instant repaint, fluid off, the ringpull as a static "opened" state that still shows the payoff; drop `user-scalable=no`; put `data-theme` on `documentElement` as the single source for DOM tokens *and* the canvas clear colour; make the flavour switcher a radio group or `aria-pressed` buttons with arrow keys; lazy-chunk the GL engine rather than shipping 1.6 MB in one file.

## 7. Principles
1. **Product nature = interaction nature.** The thing sold is liquid, so the interaction is liquid; derive the signature from the physical truth of the product.
2. **Palette as information architecture.** When switching a variant repaints the whole world, navigation, brand and delight collapse into one gesture.
3. **One earned payoff beats ten effects.** Maximal surface, minimal structure — a short loop around a single shareable moment.
4. **Composite rendering is the transition engine.** Two scene textures and one fullscreen shader let a maximalist site change worlds without seams or loading states.
5. **Author long motion in a sequencer, not in tween calls.** A nine-second, thirteen-track, per-keyframe-bezier timeline is a data file a designer can edit; the same thing written as nested tweens is not.
6. **A GL page still owes the DOM a mirror.** Registering a heading and links per scene is what keeps a 100 %-canvas site addressable — and it is cheap.
7. **Joy is a legitimate brief.** In a year of cold monochrome WebGL, a saturated, physically playful site scored 8.30 on Creativity, its highest axis by half a point.

## 8. Take / Don't take
- **Take:**
  - Composite rendering for section transitions: render scene A to a render target, feed it and scene B into one fullscreen shader as `tMap1`/`tMap2`, drive the wipe with a transition uniform and a velocity uniform. Slosh also feeds a noise RT and a live liquid RT into the same shader — an effect layer can be an *input* to the transition, not a layer on top of it.
  - Theme-swap as navigation: N token sets (ground, ink, panel, button, shadow), one repaint across every slot, the WebGL clear colour lerped in the same tween, restart-from-current. Use it when the product has real variants and the palette stays small and hand-picked. Compare the colour-as-bookend opposite in [site:the-line].
  - A sequencer file per scene (Theatre.js or equivalent) for anything longer than a couple of seconds, with per-keyframe easing instead of one global curve.
  - The GL a11y mirror: register a page name and an `<h1>` per scene, keep it visually hidden with `clip`, and give the scroll manager a keyboard path that is on by default.
  - Derive the signature interaction from the product's physics — liquid → fluid, crisp → shatter, elastic → spring — name the moment and build the page around it (compare the single-object launch in [site:oryzo]).
  - Quality tiering that caps DPR from a GPU tier and an oversized-display check, with Draco + KTX2 self-hosted and the transcoder in a worker.
- **Don't take:**
  - The hard-seltzer can as the object, the ringpull moment, floating fruit, the Pong easter egg.
  - The six hexes `#FFC1FF` / `#00A165` / `#FF0837` / `#0069D8` / `#FF5F00` / `#FFC800`, or six flavour colours as a set.
  - The WebGL gate. Redirecting non-WebGL visitors to an apology page is the single worst decision on this site.
  - `user-scalable=no`, and shipping with no `prefers-reduced-motion` branch at all.
  - One 1.6 MB bundle for the whole experience.
  - The Delassus details (Sailec, faceted low-poly fruit) — they are not even Slosh's.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards, all ten scores, tags, description | high — the Awwwards entry page read directly |
| SOTM Jun 2024 | **withdrawn** — the entry shows Site of the Day only |
| CSSDA WOTY 2024 nominee, 8.99 | unverified this pass — not sought, previously AI-compiled sources only |
| Credits | high — Awwwards credits Active Theory; the site's own metadata brands it Buttermax |
| Stack, fonts, hosting, asset pipeline, quality tiers | high — served HTML, CSS, headers and the app bundle |
| RTT composite transition, virtual scroll, Theatre.js timings, Oimo physics | high — named shader, uniforms and asset files in the bundle |
| Scene map and headings | high — `GLA11y.registerPage` / `setPageH1` calls |
| Reduced motion (absent), keyboard and a11y layer (present) | high — grep of the served bundle and CSS |
| Rendered appearance, layout, composition, hover states, sound design | **unknown** — the site gated the capture; no frame of the real site was seen |
| WordPress claim | rejected as unreliable |

Live pass 2026-09-18: reachable, capture exit 0, scroll mode wheel (desktop) / native (mobile), sources `index.html`, `style.css`, `app.js` (1.63 MB), `uil.json`, `timeline-landing.json`, `unsupported.html`, response headers, `manifest.json`, Awwwards entry `awwwards.com/sites/slosh-seltzer`.

All fifteen capture frames show the WebGL gate, not the site: the ten desktop and reduced-motion PNGs are byte-identical to one another (md5 `4957a186…`), so **the desktop scroll states could not be reached**; the five mobile PNGs differ only because native scroll moves the overflowing gate paragraph. The manifest's `title: "Not Supported - Slosh Seltzer"`, `domNodes: 11`, `canvases: 0` describe `unsupported.html`. Its LCP figures are a headless SwiftShader cold-cache artefact of that page and are not a performance claim about Slosh.

Earlier second-hand sources, superseded where they conflict with the above: `families.json` (family `flavor-swap-colorfield`, palette sample) · `roshanvijay37` data.js · `vigchetan/Any-IDE` · `mrbrandonmills`, `organvm-iii-ergon` corpora · `TUARAN/frontend-weekly-digest-cn` (CN translation of Jeremy Chang, Codrops, 2026-02-23, "Composite Rendering") · `lidge-jun/design-isms` · `muzlix` weekly 450 · `iamgoodbytes/testkitchen.goodbytes.be` · `github.com/phucbm/2dwa-slosh-seltzer`. Batch-E research report 2026-09-17 (site unreachable then).
