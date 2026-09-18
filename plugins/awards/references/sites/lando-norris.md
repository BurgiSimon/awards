# Lando Norris — https://landonorris.com/

<!-- Evidence base: a third-party 1:1 reverse-engineering (`boyang-hu/landonorris-rebuild` — README.md, REBUILD_PLAN.md, docs/engine-notes.md) whose exact versions, line ranges and named dead branches read as genuine bundle analysis. "[verified]" below means "read from that rebuild's documentation of the production bundle". Nothing here was fetched from the live site. -->

| Field | Value |
|---|---|
| Class | brand (athlete personal brand, multi-route world) |
| Visitor mode | experience |
| Awards | Awwwards Site of the Day [inferred, high — the site's own Three.js asset manifest ships a GLB model of an Awwwards SOTD trophy, listed beside `helmet-21`, `tracks-05` and a disco ball (that manifest entry is [verified])]; further Awwwards recognition and 2025 roundup circulation [recalled, medium]; SOTD date, jury/public scores, developer sub-scores, SOTM/SOTY, FWA, CSSDA, Godly [unknown] — never assert a score |
| Studio / credits | OFF+BRAND [verified, indirect but strong — the production bundle, Rive files, GL models and textures are served from `lando.itsoffbrand.io` and `assets.itsoffbrand.io/lando/`]; OFF+BRAND as a Webflow-specialist studio [recalled, medium]; studio city [unknown — sources disagree, do not state one]; individual designers, developers, 3D artists [unknown] |
| Stack (evidence level) | Webflow content shell (`cdn.prod.website-files.com`, `webflow.js`, jQuery 3.5.1) [verified] · hand-written esbuild ESM bundle, 776 top-level declarations, on the agency subdomain [verified] · GSAP 3.13.0 core + CSSPlugin, Observer, ScrollTrigger, MotionPathPlugin, SplitText [verified] · Lenis 1.1.20 [verified] · Three.js r174 [verified] · three-msdf-text-utils 1.5.0 + word-wrapper [verified] · Rive `@rive-app/canvas-lite` 2.26.4, eight files [verified] · @unseenco/taxi 1.8.0 [verified] · DRACO, GLTF, RGBE, Font, KTX2/Basis loaders [verified] · dat.gui 0.7.9 + stats-gl 4.2.3 behind `?debug` [verified] · Klaviyo (runtime-injected), Vimeo (lazy) [verified] · self-hosted woff2 fonts [verified] · hosting: Webflow CDN + `lando.itsoffbrand.io` [verified] |
| Palette | hexes [unknown — colour tokens were not in the sources read; state none]; strategy: dual light/dark theme, flipped by scroll position — the nav samples the topmost section to pick its theme state [verified]; McLaren papaya is not guaranteed, this is a personal brand, not the team's [inferred] |
| Type | Mona Sans, variable woff2 in several custom weight instances (GitHub's open grotesque) + Brier Bold as display [verified]; headline type also rendered as MSDF text inside WebGL [verified]; fluid clamp scale from one `--fluid-font` custom property anchored to a 1728px design baseline [verified] |
| WebGL dosage | canvas-first — six scenes (`head`, `tracks`, `background`, `carousel`, `helmet-scroll`, `not-found`) [verified], with Webflow DOM content around them |
| Scroll model | native + Lenis 1.1.20 [verified], with a scroll-pinned helmet stage (`helmet-scroll`) and scroll-driven nav theme state [verified] |
| Narrative model | faceted world — a persona fork (`/on-track` vs `/off-track`) across seven authored routes plus a 404 [verified structure; the fork-as-concept reading is inferred] |

## 1. Concept and narrative
- The one idea [inferred from verified structure]: you enter through the visor. The homepage hero is a parallax avatar with a wireframe helmet overlay running a scanline shader [verified] — the driver is rendered as telemetry, and the metaphor lives in GLSL rather than in copy.
- The fork [verified routes, inferred meaning]: `/on-track` is the racing self, `/off-track` the civilian self. The information architecture *is* the brand proposition — one person, two worlds — and the nav dramatises the choice.
- Beats: hero (helmet + scanline) → choose a self → `/calendar`, where the season is a 3D racetrack with fluorescent wall structures, DOM-anchored sprint markers and the current round auto-highlighted [verified] → `/partnerships`, the sponsor inventory [verified] → legal routes. Even the 404 is authored: an orbiting helmet using dual-quaternion transforms [verified].
- Commercial purpose: partnership inventory plus fan capture (Klaviyo runtime-injected) [verified].
- Register [inferred]: confident, athletic, low word count. Copy is label-like — nav words and rotating phrase loops (the `phrases` Rive file) — and the 3D carries the story.

## 2. Structure and components
- Routes [verified]: `/`, `/on-track`, `/off-track`, `/calendar`, `/partnerships`, `/legal/privacy-policy`, `/legal/terms-conditions`, plus a 404 template.
- Preloader [verified]: a Rive animation gated on GL readiness — the startup chain awaits `Promise.all()` of Rive-ready and GL-assets-loaded before revealing the banner. Never revealed on a timer.
- Router [verified]: @unseenco/taxi 1.8.0 intercepts link clicks, prefetches the route, tears down the old DOM and fires page-init callbacks; WebGL scenes are torn down and rebuilt per route change.
- Nav [verified]: theme state sampled from the section under the header; Rive-driven hamburger/menu morph.
- Rive inventory [verified names; readings inferred]: `page-transition`, `hamburger`, `phrases` (rotating copy), `signature` (handwriting draw-on), `reef` (marine/environmental philanthropy), `circuits` (animated track maps), `mob-landscape` (rotate-your-device prompt), `ln4` (personal monogram).
- Scenes [verified]: `head` (hero), `tracks` (calendar circuit), `background`, `carousel` (a 3D carousel component), `helmet-scroll` (scroll-pinned helmet sequence), `not-found`.
- `/on-track` "heroflip" [verified]: a gold helmet driven along a Bézier motion path (MotionPathPlugin).
- Calendar [verified]: HTML sprint markers registered into the 3D scene — DOM↔WebGL coordinate sync, so labels stay text while geometry stays canvas.
- Video [verified]: Vimeo lazy-loaded through a `window.Vimeo` global, off the critical path.
- Easter eggs [verified]: the SOTD-trophy GLB inside the scene; a disco-ball GLB (celebration state [inferred]); `?debug` unlocking dat.gui + stats-gl.
- Custom cursor and sound [unknown]. A mouse-trail effect on the hero [inferred — one clone advertises reproducing the hero "without the mouse trail"].

## 3. Visual language
- Palette roles [unknown]; what is verified is the mechanism: light and dark are both first-class, and the page crosses between them as you scroll [verified]. The trick is that the *theme* is a scroll-driven property, not a toggle.
- Materials [verified]: StandardMaterial PBR sets (albedo / normal / roughness / metallic / occlusion), matcap materials, RGBE HDRI environment lighting. Models named in the manifest: `helmet-21`, `tracks-05`, the trophy, the disco ball [verified]. One manifest entry (`textures.helmet.mask`) is unused [verified].
- Type [verified]: Mona Sans (variable, multiple instances) for UI/body, Brier Bold for display; headlines that live in 3D use MSDF text via three-msdf-text-utils 1.5.0 + word-wrapper, crisp at any scale rather than textured quads. Mona Sans is a deliberately engineering-flavoured, anti-luxury choice for a driver brand [inferred].
- Layout [verified]: a bespoke fluid clamp scale driven by `--fluid-font`, with a 1728px design baseline — the comp was drawn at 1728 and everything interpolates from it.
- Browser surfaces [verified]: below 992px the site swaps texture formats and, in landscape on phones, shows the `mob-landscape` orientation prompt rather than a landscape layout.

## 4. Motion and effects (with parameters)
- Smooth scroll: Lenis 1.1.20 [verified]. Lerp/duration settings [unknown].
- Animation: GSAP 3.13.0 with Observer, ScrollTrigger, MotionPathPlugin, SplitText [verified]. SplitText recalculates after font load — prevents reflow-shredded lines [verified].
- Post-processing [verified]: `EffectComposer` → `RenderPass` → `UnrealBloom` → `ShaderPass`; bloom intensity held to three fixed presets, 1.5 / 0.5 / 0.25, chosen per scene.
- Shaders [verified]: a six-pass fluid-simulation pipeline with noise sampling; a time-driven scanline shader over the wireframe helmet; an idle displacement loop using Perlin/Simplex noise so nothing is ever fully static; roughly 88 `void main` entry points in the bundle (mostly Three.js chunks, a meaningful custom subset).
- Camera [verified]: OrbitControls, driven by GSAP timelines during transitions.
- Route transition [verified]: Rive state change + camera move + Three.js teardown/setup sequenced on one GSAP timeline — choreographed, not crossfaded.
- Load sequence [verified]: `Promise.all([riveReady, glAssetsLoaded])` → reveal.
- Heroflip [verified]: helmet on a Bézier motion path. 404 [verified]: orbit via dual quaternions.
- Calendar [verified]: current round self-highlights; sprint markers are DOM nodes positioned against projected 3D coordinates.
- Pointer effects: mouse trail [inferred]; custom cursor [unknown]. Sound [unknown]. Text animation beyond SplitText usage [unknown].

## 5. Tech and pipeline
- Shell/engine split [verified]: Webflow owns content, SEO and hosting; a single self-hosted esbuild ESM bundle (with `__esm`/`__commonJS` helpers — not webpack or Turbopack) owns every interesting behaviour. The client edits copy without touching the engine.
- Assets [verified]: DRACO-compressed meshes, GLTF, RGBE HDRIs, KTX2/Basis textures; preconnect/dns-prefetch hints to the CDN; Vimeo deferred.
- Texture tiering [verified]: desktop viewports get WebP, viewports ≤ 991px get KTX2/Basis GPU-compressed textures — keyed on `innerWidth`, not capability.
- Resize strategy [verified]: crossing 992px forces a full page reload rather than rebuilding six scenes.
- Debug affordance [verified]: `?debug` → dat.gui 0.7.9 + stats-gl 4.2.3, shipped to production.
- Dead code in production [verified]: a `window.ScrollTrigger` branch that never runs (a fallback scroll listener does the work), `scene.remove(name)` as a silent no-op, an undefined `iridescence` material property, the orphaned `textures.helmet.mask` entry.
- Budgets, Lighthouse/CWV [unknown]; six scenes + Rive + Lenis is heavy, and LCP/TBT are not the selling point [inferred].

## 6. Weaknesses
- Breakpoint reload [verified]: a 992px crossing reloads the page, which zoom users and window-resizers trip; it is an admission that the scenes are not resize-elastic.
- Width-keyed texture tier [verified]: a narrow desktop window receives mobile textures, and a wide low-VRAM device receives WebP.
- Orientation prompt instead of a landscape layout [verified] — the phone user is told to rotate.
- Headline type inside WebGL (MSDF) is only accessible if mirrored in the DOM; whether it is [unknown]. Reduced motion, keyboard navigation, contrast, cursor fallbacks [unknown]. No reduced-motion evidence anywhere in the sources.
- Shipped dead branches and an undefined material property [verified] — finish, not perfection, was the bar.
- What the awards skills do differently: a `prefers-reduced-motion` path that swaps shaders and the fluid sim for stills and keeps the persona fork usable; keyboard-reachable routes, menu and calendar markers with visible focus; a DOM mirror for every MSDF headline and every 3D-anchored label; a load gate on real asset readiness *with* a timeout and a skip; resize-elastic scenes (rebuild on `ResizeObserver`, never a reload); texture tiers picked by capability (`WEBGL_compressed_texture_*`, device memory), not `innerWidth`.

## 7. Principles (3–6, generalisable)
1. Put the metaphor in the rendering pipeline. If the idea is "X as Y", make the shader do Y; do not caption it.
2. Author every route, including the error page. Depth of finish across seven pages beats one spectacular page.
3. Find the one dataset that deserves geometry (here, the season calendar) and leave the rest as text.
4. Use two animation runtimes for what each does best — authored 2D vector states in one, spatial and scroll-linked work in the other — and never force one to do the other's job.
5. Boring platform, uncompromised engine: let a CMS own content and one self-hosted bundle own motion; deploy them independently.
6. Fixed presets beat per-scene guesswork: three bloom intensities keep six scenes coherent.

## 8. Take / Don't take
- **Take:**
  - The shell/engine split — CMS or static host for content + SEO, one ESM bundle for all motion, served from your own origin so releases are independent.
  - The asset-gated preloader: `Promise.all([vectorReady, glReady])` then reveal — plus the timeout and skip the original lacks.
  - The persona-fork IA: split one subject into two opposed routes (on/off, day/night, work/play) and make the nav the choice.
  - DOM↔3D marker sync: position HTML labels against projected coordinates so text stays selectable and geometry stays on canvas.
  - Viewport-tiered texture formats (KTX2/Basis vs WebP), but branch on capability, not width.
  - Fluid type from one baseline: a single clamp anchored to the real comp width (e.g. 1728), every size derived.
  - Three fixed bloom presets (1.5 / 0.5 / 0.25 as a starting range) instead of per-scene ad-hoc values.
  - SplitText (or any splitter) re-run after `document.fonts.ready`.
  - Scroll-position-driven theme inversion for the nav, sampling the section under the header.
  - One easter-egg asset that rewards exploration off the main path; a `?debug` panel stripped or gated in production.
  - The choreographed route transition: vector state + camera move + scene swap on one timeline (compare the chaptered camera in [site:mont-fort]; Rive as second runtime also in [site:mindmarket]).
- **Don't take:**
  - The helmet, the visor/scanline hero, the wireframe-driver signature, the gold "heroflip" helmet, the orbiting-helmet 404.
  - The on-track / off-track route names and the seven-route order.
  - The calendar-as-racetrack, the SOTD-trophy or disco-ball easter eggs, the `ln4` monogram and signature draw-on.
  - The Mona Sans + Brier Bold pairing as a package, or the 1728 baseline as a number.
  - The scroll-flipped light/dark theme *as the identity* — take the mechanism only.
  - The 992px reload and the width-keyed texture switch.

## 9. Confidence and sources
- Type/IA, routes, stack and versions, scenes, shaders, post-processing, Rive inventory, fonts, CDN, texture tiering, breakpoint reload, dead code: [verified], high — all from the rebuild's documentation.
- Agency attribution: [verified], high, via the `itsoffbrand.io` asset domains; city and individuals [unknown].
- Awards: [inferred], high for SOTD from the trophy GLB; [unknown] for every specific.
- Concept reading (visor, persona fork, tone): [inferred]. Palette, cursor, sound, accessibility, performance numbers: [unknown]. Mouse trail: [inferred].
- Sources: `https://github.com/boyang-hu/landonorris-rebuild`; `https://raw.githubusercontent.com/boyang-hu/landonorris-rebuild/main/README.md`; `.../main/REBUILD_PLAN.md`; `.../main/docs/engine-notes.md`. Seen in search, not read: `OtanoStudio/Lando-Demo` (r3f hero reconstruction without the mouse trail), `ChenSenhao0104/...homepage-effect...reproduced` (GLSL), `SheryiansResearchClub/Landonorris-Clone`. Research report: `scratchpad/research/batch-D.md`.
