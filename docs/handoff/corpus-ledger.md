# Corpus ledger

Maintained by `/expand-corpus` (`.claude/skills/expand-corpus/SKILL.md`). Resume at the last wave's first phase not marked `done`.

## Wave 2 — opened 2026-09-23

| Phase | Status | Note |
|---|---|---|
| setup | done | |
| triage | done | closed by maintainer 2026-09-23 after the boc, wodniack pilot (testing); 29 rows stay queued for a later run |
| synthesis | done | boc, wodniack synthesised |
| recipes | done | 8 built: transition-promote-chosen, filmstrip-index-rows, svg-noise-line-field, title-mask-tunnel, dialog-nested-lenis-sheet, throw-objects-css3d, scrollbar-thumb-drag, sprite-rain-canvas2d; catalogue 44/44 |
| stacks | done | motion-13.4.md (boc stack hit), smooothy-0.0.md (new-stack queue); versions.md motion bumped to 13.4.1 |
| upkeep | done | grader slugs regenerated (21); validate passes; lint 0 dangling; count greps clean; smoke evals skipped by maintainer 2026-09-23 |

### Sites

| Slug | URL | Status | Rating | Novelty | Synthesised | Reason | Date |
|---|---|---|---|---|---|---|---|
| robbietilton | https://robbietilton.com/ | queued | | | | | |
| pensatori-irrazionali | https://pensatori-irrazionali.com/ | queued | | | | | |
| boc | https://boc.studio/work | added | D 7.0 / U 7.2 / C 6.8 / Co 7.2 → w 7.04 [inferred]; official: SOTD 7.23 [verified, entry page] | technique: case-open row-rise route exit (distance-staggered fade, clicked row rises to brand bar) — checked against [pattern:preloaders-and-transitions#transition-archetypes] and [recipe:page-transitions]; technique: per-project filmstrip marquee rows as portfolio index, width-derived duration (~70 px/s), overshoot hover grow — checked against [recipe:marquee-raf-mask] and [pattern:components-catalog#ticker-and-marquee]; stack: Motion (framer-motion) for dialogs and bottom sheets — checked against stacks/ (no motion note; nearest next.md) | yes | 2026-09-23 |
| warmnfuzzy | https://www.warmnfuzzy.tv/ | queued | | | | | |
| jesperlandberg | https://jesperlandberg.com/ | queued | | | | | |
| zainabkabira | https://zainabkabira.com/ | queued | | | | | |
| wearedirect | https://wearedirect.co/ | queued | | | | | |
| oxigen | https://www.oxigen.sa/ | queued | | | | | |
| runrobrun | https://www.runrobrun.com/ | queued | | | | | |
| goats | https://goats.com.pl/ | queued | | | | | |
| okaydev | https://okaydev.co/ | queued | | | | | |
| likova | https://likova.space/ | queued | | | | | |
| mensch | https://www.mensch.club/ | queued | | | | | |
| to-top | https://www.to-top.ch/en | queued | | | | | |
| siteassist | https://www.siteassist.com/ | queued | | | | | |
| 911rennsport | https://www.911rennsport.co.uk/ | queued | | | | | |
| primesec | https://www.primesec.ai/ | queued | | | | | |
| nodeck | https://www.nodeck.online/ | queued | | | | | |
| haoqi | https://haoqi.design/ | queued | | | | | |
| noth | https://www.noth.in/ | queued | | | | | |
| areebali | https://areebali.com/ | queued | | | | | |
| serotoninn | https://serotoninn.com/ | queued | | | | | |
| siena | https://siena.film/ | queued | | | | | |
| gehry-getty | https://gehry.getty.edu/ | queued | | | | | |
| the-boyd | https://the-boyd.com/ | queued | | | | | |
| grids-obys | https://grids.obys.agency/ | queued | | | | | |
| bethebuzz | https://www.bethebuzz.co/services | queued | | | | | |
| alectear | https://alectear.com/lettering | queued | | | | | |
| wodniack | https://wodniack.dev/ | added | D 7.9 / U 6.3 / C 7.6 / Co 7.4 → w 7.31 [inferred]; official: SOTD 12 Dec 2024 7.56 (D 7.53 / U 7.30 / C 7.96 / Co 7.69; dev 7.58) [verified, entry page] | class: portfolio has one card — checked against leo-parpeix; model: portfolio + WebGL none + gallery absent — checked against leo-parpeix; technique: Perlin-bent SVG polyline field with pointer spring (no WebGL) — checked against gl-fluid-wake-post and webgl-architecture#effect-parameters; technique: section title as CSS-3D tunnel (capsule mask scales viewer in on scrub, ghost-letter rows carry video reel in z) — checked against gl-virtual-scroll-camera and components-catalog#infinite-draggable-plane-and-arc-gallery; technique: grab-and-throw CSS-3D objects into a perspective catcher — checked against cursor-and-pointer#drag-affordances; world: condensed poster display + light editorial serif + mono, no grotesque — checked against seasats, white-desert, united-carriers | yes | 2026-09-23 |
| spasoje | https://www.spasoje.dev/ | queued | | | | | |
| christoph-nagel | https://christoph-nagel.dev/ | queued | | | | | |

### Techniques and stacks

boc: width-timed filmstrip marquee rows — 009q953p2hib1.js + style.css — translate3d 0 → -50% linear infinite; duration = max((Σ still widths + 15·(n−1))/70, 12) s, ×1.25 on wide rows; gap 15px; clone aria-hidden, tabIndex -1; reduced motion animation:none
boc: row hover grow — style.css — height/width .4s cubic-bezier(1,0,.47,1.25), scale 1.2 plus caption height
boc: gated hover video — 009q953p2hib1.js — Mux 480p MP4 muted/loop/playsInline; mounts on intersect (rootMargin "0px 150px"), (hover: hover), no reduced motion; plays on pointerenter
boc: case-open row-rise transition — 0-eq2~kkzvyve.js — desktop: hold .15, rowFade .65 (opacity 0, y 18, power2.in), stagger .09·|i−clicked|, sidebarAt .45, rise 1.15 power2.inOut to brand bar + 15px, fade .45, push 1.6; phone: rise .8, push 1.15, stagger .06; skipped under reduced motion
boc: dialog motion — 0uta1m-ut_is8.js — entrance .666s [.16,1,.3,1], close [.64,0,.78,0]; nested Lenis duration 1.2 expo autoRaf; drag-to-dismiss bottom sheet on phone
boc: next@unknown (App Router, Turbopack) — index.html
boc: gsap@3.15.0 — 052_rgenbp_yq.js
boc: lenis@unknown — 0uta1m-ut_is8.js
boc: motion (framer-motion)@unknown — 0ol1mhi~tvftw.js
wodniack: noise-displaced SVG line field — hoisted.js (movePoints) — angle = perlin2((x+t·.0125)·.002, (y+t·.005)·.0015)·12; offset x = cos·32, y = sin·16 px; pointer radius max(175, pointer speed); spring .005; damping .925 per frame
wodniack: DrawSVG hero intro — hoisted.js (intro()) — drawSVG "100% 100%" → "0% 100%", 3 s expo.out, stagger amount .5 from "edges"; border scaleY .025 → 1 over 1 s expo.inOut; title clip-path polygon wipe 1 s expo.inOut
wodniack: title-mask tunnel with a CSS-3D reel — hoisted.js (setTimeline), index.css — ScrollTrigger start "top 25%", end "bottom 75%", scrub 1; mask scale 1 → maxScale power4.in; objects at translate3d(..., --z:-1000vw) preserve-3d; 34 lazy data-src MP4s 1082×636
wodniack: grab-and-throw CSS-3D objects — hoisted.js (.s-my-way thrownObjects/draggedObject), index.css — cursor grab; 3D sides --depth 1rem; catcher perspective calc(var(--distortion)·.85em)
wodniack: canvas-2D sprite rain — hoisted.js (.s-about) — vy += .45 per frame, random vx, rotation ±10°/frame
wodniack: draggable custom scrollbar — hoisted.js (.site-scrollbar), index.css — html scrollbar-width:none; thumb drag writes window.scrollTo(progress·maxScrollTop)
wodniack: contrast theme toggle — index.css (.theme-contrasted) — re-points --color-primary to #fff2ed and --color-shadow to #4d4040
wodniack: Lenis on the GSAP ticker — hoisted.js (initLenis) — Lenis defaults (lerp .1), gsap.ticker.add(t => lenis.raf(t·1000)), lagSmoothing(0)
wodniack: astro@4.15.9 — index.html (generator meta, /_astro/ assets)
wodniack: gsap@3.12.5 (ScrollTrigger, SplitText, DrawSVGPlugin, EasePack, Observer) — hoisted.js
wodniack: lenis@1.1.13 — hoisted.js (window.lenisVersion)

### Notes

- 2026-09-23 synthesis (boc, wodniack): duplicates none. boc's filmstrip rows overlap only partly with the seasats and mindmarket marquees: same duplicated strip, different job (portfolio index, not trust strip) and mechanism (width-timed CSS keyframes, not rAF).

## Wave 3 — opened 2026-09-23

| Phase | Status | Note |
|---|---|---|
| setup | done | 29 rows carried queued from wave 2 (triage closed there after the pilot) |
| triage | open | |
| synthesis | open | |
| recipes | open | |
| stacks | open | |
| upkeep | open | |

### Sites

| Slug | URL | Status | Rating | Novelty | Synthesised | Reason | Date |
|---|---|---|---|---|---|---|---|
| robbietilton | https://robbietilton.com/ | added | D 6.6 / U 6.3 / C 6.4 / Co 6.9 → w 6.50 [inferred]; official: SOTD 28 Jul 2012, 6.99 — D 7 / U 6.63 / C 7.5 / Co 7, no dev scores; the entry shows a predecessor design (red ground, Portfolio/Archive/Blog), not the live site [verified, entry page] | model: portfolio × native scroll with no smoothing library (hand-rolled drag-to-scroll, momentum and rubber-band on window.scrollTo) — checked against wodniack, leo-parpeix (both native + Lenis); technique: rubber-band overscroll with a critically damped spring return, plus velocity-graded carousel snap — checked against pattern:motion-vocabulary#damping-math, pattern:cursor-and-pointer#drag-affordances, recipe:horizontal-rail; technique: blur-peek centred carousel rows (neighbours dimmed and blurred, spacing computed from a fixed peek) — checked against pattern:components-catalog#horizontal-rail-inside-a-vertical-page, recipe:filmstrip-index-rows; world: achromatic white ground with no accent token + system sans with no web font — checked against boc (chroma outsourced, slate + orange, PP Mori) and mindmarket (Inter only) | |  | 2026-09-23 |
| pensatori-irrazionali | https://pensatori-irrazionali.com/ | added | D 7.2 / U 6.6 / C 7.2 / Co 6.9 → w 6.99 [inferred]; official: SOTD 7.23 overall [verified, entry page]; axis and developer sub-scores hidden behind the cookie wall [unknown]; date 20 Sep 2026 and Developer Award from a search summary only [inferred] | model: studio × specification narrative (numbered disciplines, each a spec table + sample rail + own marquee) and moments WebGL dosage — checked against lama-lama (gallery, canvas-first), boc (gallery, none), the-line (print artefact, none); technique: pointer trail selecting per pixel between six baked engraving frames in one KTX2 array texture — checked against recipe gl-fluid-wake-post and pattern cursor-and-pointer#hover-previews-and-cursor-following-reveals; stack: next-view-transitions (page-transition library) — checked against stacks/next.md (React ViewTransition and intercept-Link only) | |  | 2026-09-23 |
| warmnfuzzy | https://www.warmnfuzzy.tv/ | added | D 7.2 / U 6.8 / C 7.0 / Co 7.2 → w 7.04 [inferred]; official: SOTD 12 Sep 2026, 7.26 (D 7.35 / U 7.03 / C 7.35 / Co 7.40), Dev 7.52 (Semantics 7.60, Animations 7.60, Accessibility 7.20, WPO 7.20, Responsive 7.80, Markup 7.60) [verified, entry page] | model: studio + WebGL dosage "moments" (WebGPU silhouette canvases) — checked against lama-lama (studio, canvas-first), the-line and boc (studio, none); technique: media clipped to a turning 3D silhouette (WebGPU mesh drawn white offscreen, then 2D canvas `source-in` composite of a cover-fitted video or image) — checked against [recipe:title-mask-tunnel] and lando-norris SVG mask-image; technique: 3D prism flip on nav cells (rotateX(90deg) translateZ(row-height/2), clone face) — checked against [pattern:motion-vocabulary#hover-shifts]; technique: media chips set inline between the words of a display-size paragraph — checked against [pattern:components-catalog#wavy-text-and-the-second-text-system] | |  | 2026-09-23 |
| jesperlandberg | https://jesperlandberg.com/ | added | D 7.4 / U 6.3 / C 7.4 / Co 6.9 → w 7.02 [inferred]; official: Honorable Mention 26 Aug 2026, no jury or developer scores published [verified, entry page] | model: portfolio × 100 % canvas × virtual float, modulo-wrapped — checked against leo-parpeix (portfolio, canvas-first, native + Lenis) and igloo (100 % canvas, wrapped virtual float, brand monument); technique: DOM-measured text redrawn per element into Canvas-2D textures on GL planes, with the DOM glyphs made transparent rather than removed — checked against [pattern:webgl-architecture#text-in-webgl] and [recipe:gl-msdf-text]; technique: project cards as segmented sheets that twist, wave and curl into a tunnel shape in transit on an endless reel over a GL floor grid — checked against [recipe:gl-dom-tethered-planes] (velocity bulge only) and [pattern:components-catalog#infinite-draggable-plane-and-arc-gallery] | |  | 2026-09-23 |
| zainabkabira | https://zainabkabira.com/ | added | D 7.3 / U 6.8 / C 7.2 / Co 7.3 → w 7.13 [inferred]; official: Awwwards Honorable Mention 26 Aug 2026, no aggregate axis scores published (15/22 community votes listed individually, overalls 6.50–8.90) [verified, entry page] | model: portfolio class with a sticky-stages scroll model (CSS-sticky bottom-pinned sections, scrubbed stages, gesture-snapped case-study decks, no smoothing library) — checked against robbietilton (portfolio / gallery / none / native with drag-scroll), leo-parpeix, wodniack and trevor-noah (all native + Lenis or Locomotive); technique: homography warp of a live screen recording into a measured device-photo quad via CSS matrix3d — checked against gl-dom-tethered-planes, gl-depth-map-parallax and patterns/asset-pipeline#video-and-volumes; technique: slot-roll headline word cycle with spring overshoot — checked against patterns/motion-vocabulary#text-effects (flicker, scramble, squash only) and recipes flicker-text / scramble-decode-text; technique: CSS-3D coverflow ring carousel with drag, wheel and arrow keys — checked against throw-objects-css3d, horizontal-rail and components-catalog#infinite-draggable-plane-and-arc-gallery; world: illustration-led palette (a small flat token set, with colour carried by painted scenery strata from sky to cream to willow to garden soil, plus a remembered day/night scene toggle) — checked against the index palette families (theme-per-section in mindmarket and warmnfuzzy, named themes in leo-parpeix and seasats, two tokens inverted in son-daven and wodniack, cream + accent in oryzo) | |  | 2026-09-23 |
| wearedirect | https://wearedirect.co/ | added | D 6.8 / U 6.3 / C 6.8 / Co 7.0 → w 6.67 [inferred]; official: Awwwards Honorable Mention 25 Aug 2026, no jury axis or developer scores published (only 15/25 community votes listed) [verified, entry page] | technique: batched colour-wave glyph entry (characters flash through five accents, then settle to ink) — checked against [pattern:motion-vocabulary#text-effects] and [recipe:flicker-text]; technique: a reel card docked bottom right that scrub-grows to viewport minus gutter, then follows its section — checked against [pattern:components-catalog#pinned-chapter-with-scrubbed-media] and [recipe:scroll-pin-scrub]; technique: services accordion that advances itself, with a linear progress rule as its timer — checked against components-catalog (no accordion or auto-cycle entry) and [recipe:sticky-stack-cards]; stack: @barba/core page-transition router — checked against references/stacks/ (only a versions.md row, no note; the nearest is [recipe:page-transitions], which uses taxi) | |  | 2026-09-23 |
| oxigen | https://www.oxigen.sa/ | blocked |  |  | | capture timed out on 13 of 15 frames after the one retry (--wait 6000 --timeout 90000), every desktop and reduced-motion frame missing; headless SwiftShader cannot run the ~65k-voxel GTAO + bloom scene; source fully read; 4 technique hits pending a real-GPU capture | 2026-09-23 |
| runrobrun | https://www.runrobrun.com/ | added | D 7.2 / U 6.3 / C 6.9 / Co 6.2 → w 6.77 [inferred]; official: Awwwards Honorable Mention 21 Aug 2026, no jury axis scores published (community votes only) [verified, entry page] | model: portfolio with the "moments" WebGL dosage (one hero canvas, everything else DOM) — checked against leo-parpeix (canvas-first), jesperlandberg (100 % canvas), wodniack / robbietilton / zainabkabira (none); technique: music-reactive hero mesh (AnalyserNode bands and onset pulses drive the geometry's deformation) — checked against pattern:sound#the-control (mont-fort's visualiser icon only), recipe:sound-toggle-opt-in, recipe:gl-hero-object-inertia; technique: one DOM pixel-cell grid used for the loader, menu overlay, section wipes and image reveals, driven by per-cell CSS delay variables — checked against pattern:preloaders-and-transitions#transition-archetypes, recipe:nav-overlay-fullscreen, recipe:page-transitions; stack: lottie-web 5.13.0 — checked against references/stacks/ (no Lottie note; versions.md lists only @lottiefiles/dotlottie-web) | |  | 2026-09-23 |
| goats | https://goats.com.pl/ | added | D 6.6 / U 6.4 / C 6.6 / Co 6.3 → w 6.51 [inferred]; official: Awwwards Honorable Mention 21 Aug 2026, no axis or developer scores captured (a cookie wall covered the score panel) [verified, entry page] | technique: preloader-to-hero aperture handoff (the curtain lifts with a bowed SVG edge while the hero opens from clip-path inset(32% round 10px) to inset(0), video scale .6→1, 1.4 s expo.inOut) — checked against [pattern:preloaders-and-transitions#preloader-archetypes] and [recipe:preloader-counter-hold]; technique: scroll-scrubbed per-word opacity fill (label and title words .15→1, stagger .5, ease none, across a 200 vh sticky section) — checked against [pattern:motion-vocabulary#text-effects] and [recipe:split-text-masked-reveal] | |  | 2026-09-23 |
| okaydev | https://okaydev.co/ | added | D 7.1 / U 7.2 / C 6.6 / Co 7.4 → w 7.06 [inferred]; official: none | model: B2B product + native scroll with no smoothing library is absent from the index (every B2B row runs Lenis) — checked against usavionix, seasats, united-carriers, mindmarket; technique: a damped scroll curl on product screens (rotationX up to 48°, z = −900(1−cos θ), brightness to .35, lerp .18 on gsap.ticker) — checked against [recipe:sticky-stack-cards], [recipe:title-mask-tunnel]; technique: hero cards that tilt toward the pointer with moving shine and shade layers, locked while the page scrolls — checked against [recipe:magnetic-button], [pattern:cursor-and-pointer#hover-previews-and-cursor-following-reveals]; technique: a scripted composer demo that types a post character by character, with a syntax-highlighted code block — checked against [pattern:copy-and-content] typed status line [site:wodniack]; stack: a Highway-style PJAX router (data-router-wrapper/view/disabled, NAVIGATE_IN) — checked against stacks/ (no router note) and [recipe:page-transitions] (taxi) | |  | 2026-09-23 |
| likova | https://likova.space/ | added | D 7.3 / U 6.4 / C 7.0 / Co 7.2 → w 6.96 [inferred]; official: SOTD 19 Aug 2026, 7.33 (D 7.49 / U 7.13 / C 7.28 / Co 7.44), Dev 7.41 (Sem 7.20 / Anim 8.20 / A11y 6.60 / WPO 7.60 / Resp 7.40 / Markup 7.20) [verified, entry page] | model: B2B product + specification + virtual float (Locomotive 4 smooth, forced on phones too) + WebGL moments — checked against `seasats` (B2B, specification, moments, but native + Lenis); technique: a 3D site model the visitor can orbit, with a clamped and damped camera (camera-controls, polar ~1.1–1.5 rad, distance 40–53.5, smoothTime .2/.6) and named zone cards in a modal — checked against [pattern:components-catalog#interactive-map-cards] (it covers markers, not a user-driven orbit camera) and [recipe:gl-hero-object-inertia]; stack: Locomotive Scroll 4 — checked against stacks/lenis-1.3.md (it only lists Locomotive as a library to remove); stack: camera-controls (yomotsu) — checked against stacks/three-0.186.md; stack: @barba/core 2.10.3 — checked against stacks/versions.md (a version pin only, no note) | |  | 2026-09-23 |
| mensch | https://www.mensch.club/ | added | D 7.2 / U 6.8 / C 7.0 / Co 6.5 → w 6.97 [inferred]; official: Honorable Mention 18 Aug 2026, no aggregate axis scores published (15 juror rows, overalls 6.40–9.90) [verified, entry page] | technique: idle settle-snap on a smoothed native scroll (160 ms of quiet, then ease to the nearer end of the first viewport) — checked against [pattern:motion-vocabulary#scroll-philosophies] (section snap is listed only for virtual scroll, [site:igloo]); technique: timed typeface swap of a section title into blackletter — checked against [pattern:motion-vocabulary#text-effects] and [recipe:flicker-text]; technique: type-and-erase title loop (fixed first word, rotating second) — checked against [pattern:motion-vocabulary#text-effects] and [recipe:scramble-decode-text]; world: blackletter accent face in the type contract — checked against the _index.md type-contract column (nearest [site:pensatori-irrazionali], script display + grotesque) and [pattern:typography#faces-seen] | |  | 2026-09-23 |
| to-top | https://www.to-top.ch/en | added | D 6.8 / U 5.8 / C 6.6 / Co 6.3 → w 6.41 [inferred]; official: none | technique: DOM multi-plane cut-out landscape parallax (six photographic planes scrubbed at yPercent 0–80, CTA disc at 125, headline at −70) — checked against [recipe:gl-depth-map-parallax] (WebGL depth map, not DOM planes) and [pattern:motion-vocabulary#scrub-and-refresh-rules]; stack: Spline (@splinetool/viewer) 3D scenes — checked against references/stacks/three-0.186.md (no Spline stack note) | |  | 2026-09-23 |
| siteassist | https://www.siteassist.com/ | added | D 6.4 / U 6.5 / C 5.8 / Co 6.8 → w 6.35 [inferred]; official: Awwwards Honorable Mention 17 Aug 2026, no jury axis scores published [verified, entry page] | model: B2B product × specification × WebGL none — checked against usavionix (B2B product, specification, canvas-first) and mindmarket (B2B product, WebGL none, faceted world); technique: pointer position mapped live onto a geographic coordinate readout (viewport → lat/lon box) — checked against [pattern:copy-and-content#telemetry-register] (static coordinate readouts, igloo) and [recipe:scramble-decode-text] | |  | 2026-09-23 |
| 911rennsport | https://www.911rennsport.co.uk/ | added | D 6.6 / U 5.8 / C 6.0 / Co 6.8 → w 6.26 [inferred]; official: none | technique: a full-width hero logotype scrubbed down into the sticky nav logo slot (GSAP `from` width 100% / y −20%, scrub .4) — checked against hero-archetypes#two-state-typographic and recipe split-text-masked-reveal; technique: a pair of display lines moved in opposite directions by section scroll progress (−100%→100% / 100%→−100%) rather than a looping marquee — checked against components-catalog#ticker-and-marquee and recipe marquee-raf-mask | |  | 2026-09-23 |
| primesec | https://www.primesec.ai/ | added | D 7.4 / U 6.5 / C 7.2 / Co 6.8 → w 7.03 [inferred]; official: none | technique: a noise-feathered erosion dissolve of a glTF mesh, driven by scroll progress — checked against [pattern:webgl-architecture#unifier-versus-narrative-shaders] and [recipe:gl-rtt-composite-transition]; technique: runtime DPR steps set by measured frame rate — checked against [recipe:quality-tiers]; technique: an idle render gate that stops drawing 1.5 s after the last scroll or pointer input — checked against [pattern:webgl-architecture#scene-windows-and-disposal]; technique: raycast-seeded wireframe ripples on a mesh surface — checked against [recipe:gl-fluid-wake-post] | |  | 2026-09-23 |
| nodeck | https://www.nodeck.online/ | added | D 7.3 / U 6.9 / C 8.0 / Co 7.6 → w 7.35 [inferred]; official: none | model: campaign + section switcher (a print-artefact slide deck) — checked against slosh-seltzer (the only section-switcher card, DTC) and oryzo (the satirical campaign, native scroll); technique: DOM slide rasterised with html2canvas onto a Three.js plane, crumpled into a noisy ball and dropped into a bin — checked against gl-rtt-composite-transition and patterns/preloaders-and-transitions#transition-archetypes; technique: wheel-delta accumulator that fills an SVG progress ring, commits a slide at 500 px and rolls back after 1 s idle — checked against patterns/cursor-and-pointer#hold-gates and compare-hold-drag; technique: an order button that dodges the mouse cursor — checked against magnetic-button; stack: html2canvas (DOM-to-canvas rendering) — checked against stacks/three-0.186.md | |  | 2026-09-23 |
| haoqi | https://haoqi.design/ | added | D 7.3 / U 6.6 / C 7.2 / Co 6.8 → w 7.02 [inferred]; official: SOTD 14 Aug 2026, 7.36 (D 7.44 / U 7.10 / C 7.69 / Co 7.17) + Dev 7.43 (Sem 7.00 / Anim 8.80 / A11y 6.60 / WPO 7.80 / Resp 7.20 / Markup 7.00) [verified, entry page] | technique: passcode-gated inline redaction, the employer name shown as six ■ glyphs in a focusable `role="button"` labelled "Protected — enter passcode to reveal" — checked against copy-and-content.md#metadata-as-boast and components-catalog.md#easter-eggs; technique: global single-key theme/sound hotkeys (L/D/A, S), ignored in inputs and with modifier keys, saved to localStorage, with the current state shown as a glyph in brackets in the nav label (`THEME[A]`, `SOUND[/]`) — checked against components-catalog.md#colour-bound-product-row-and-theme-switcher and [recipe:sound-toggle-opt-in] | |  | 2026-09-23 |
| noth | https://www.noth.in/ | added | D 7.4 / U 6.4 / C 7.2 / Co 6.8 → w 7.00 [inferred]; official: Awwwards SOTD 10 Aug 2026, 7.45 — D 7.58 / U 7.24 / C 7.60 / Co 7.23; Dev 7.24 (Semantics 6.80, Animations 8.00, Accessibility 6.80, WPO 7.20, Responsive 7.40, Markup 7.20) [verified, entry page] | technique: a fluid-sim dye field used as a reveal mask between an SVG wordmark rasterised on white and a video behind the canvas — checked against [recipe:gl-fluid-wake-post] and [pattern:webgl-architecture#effect-parameters], which cover fluid only as a distortion or wake post-pass; technique: a pointer repulsion field (push, rotate and scale by falloff, then an elastic return) — checked against [recipe:magnetic-button] and [pattern:cursor-and-pointer#magnetic-targets], which cover attraction only; technique: a GSAP Flip layout morph scrubbed by scroll (the WORKS letters reparented between two layouts) — checked against [recipe:page-transitions], which uses Flip.fit only on route change, and [pattern:motion-vocabulary] | |  | 2026-09-23 |
| areebali | https://areebali.com/ | added | D 7.6 / U 6.8 / C 8.0 / Co 7.4 → w 7.42 [inferred]; official: Awwwards Honorable Mention 10 Aug 2026, no axis scores readable behind the consent panel [verified, entry page] | model: a portfolio built as a faceted world with a section-switcher scroll model, a pairing absent from the index — checked against nodeck (campaign, print artefact, section switcher) and jesperlandberg (portfolio, gallery, virtual float); technique: an operable handheld device is the whole navigation (click-wheel channels, power gate, back key, keyboard legend that changes with state) — checked against [pattern:components-catalog#fullscreen-nav-overlay-with-numbered-links] and nodeck's deck chrome; technique: intro film sized to the live device's bounding rect, then cut onto it — checked against [pattern:preloaders-and-transitions#preloader-archetypes] (cinematic title card, son-daven); technique: visitor stamp guestbook behind a dwell countdown, moderated, with approvals published as a dated changelog — checked against [pattern:components-catalog#living-utility-pages] | |  | 2026-09-23 |
| serotoninn | https://serotoninn.com/ | added | D 7.0 / U 5.8 / C 7.0 / Co 6.6 → w 6.60 [inferred]; official: SOTD 4 Aug 2026, 7.37 (D 7.29 / U 7.24 / C 7.76 / Co 7.30), Dev 7.32 (Sem 7.40 / Anim 7.60 / A11y 6.60 / WPO 7.40 / Resp 7.40 / Markup 7.20) [verified, entry page] | class: e-commerce has at most one card — checked against floema (brand + catalogue e-commerce); model: e-commerce × gallery narrative × WebGL none absent from the index — checked against floema (chaptered journey, moments); technique: baseline-anchored scaleY stretch-up reveals as the whole reveal vocabulary — checked against [recipe:split-text-masked-reveal] and motion-vocabulary#masked-line-reveals / squash-on-wordmark; technique: a Lottie scrubbed by intent (parks at 50 % on reveal, finishes on hover, returns on leave) — checked against no recipe or pattern section (nearest [recipe:sound-toggle-opt-in] / components-catalog#easter-eggs); technique: a colour layer under a torn-paper raster mask over a greyscale twin, auto-cycled by opposed-origin scaleY wipes — checked against preloaders-and-transitions torn-edge mask ([site:shopify-editions-w26] chapter wipes) and [recipe:compare-hold-drag]; stack: lottie-web 5.13.0 has no stack note — checked against references/stacks/ (animejs-4, gsap-3.15, lenis-1.3, motion-13.4, three-0.186 …) | |  | 2026-09-23 |
| siena | https://siena.film/ | queued | | | | | |
| gehry-getty | https://gehry.getty.edu/ | added | D 8.0 / U 6.8 / C 7.8 / Co 8.4 → w 7.64 [inferred]; official: SOTD 17 Nov 2023, 7.89 (D 7.97 / U 7.52 / C 8.19 / Co 8.04), DEV 7.78 (Sem 7.80 / Anim 8.60 / A11y 7.60 / WPO 8.00 / Resp 7.60 / Markup 7.00) [verified, entry page] | model: campaign × chaptered journey, no campaign card uses that model — checked against shopify-editions-w26 (campaign, chaptered gallery) and united-carriers (chaptered journey, B2B); technique: architect's narration as the story spine, with one licensed recording per chapter — checked against pattern:sound (only ambient, SFX, bed and transition-cue layers) and recipe sound-toggle-opt-in; technique: explorable glTF model with hotspots and orbit as one beat in a chapter — checked against recipe gl-hero-object-inertia and pattern:webgl-architecture; technique: parallel accessible-version route (own layout, first link in the header) — checked against pattern:accessibility-and-reduced-motion#the-dom-mirror | |  | 2026-09-23 |
| the-boyd | https://the-boyd.com/ | queued | | | | | |
| grids-obys | https://grids.obys.agency/ | added | D 7.8 / U 5.8 / C 7.6 / Co 7.6 → w 7.14 [inferred]; official: SOTD 1 Sep 2021, 7.83 — D 8.03 / U 7.44 / C 8.02 / Co 7.83; Dev 7.19 (Semantics 7.40, Animations 8.40, Accessibility 6.00, WPO 6.40, Responsive 7.00, Markup 7.80) [verified, entry page] | class: docs (a studio's teaching explainer) — checked against `animejs`, the only docs card in the index; model: docs + print artefact + no WebGL + four pages read as one native scroll — checked against `animejs` (specification, canvas-first) and `the-line` (print artefact, studio); technique: a page-wide layout-grid overlay the reader turns on and off (Grid On/Off) — checked against `[recipe:theme-swap-tokens]`, `[pattern:components-catalog#colour-bound-product-row-and-theme-switcher]` and `seasats` (whose dev-grid overlay is listed as a weakness, not a feature); technique: routes stacked in one continuous document scroll, with the URL rewritten per page — checked against `[pattern:preloaders-and-transitions#route-transition-mechanics]` and `[recipe:page-transitions]`; stack: Readymag (a no-code platform with its own renderer and a built-in scroll, load and click animation engine) — checked against `stacks/webflow-export.md` | |  | 2026-09-23 |
| bethebuzz | https://www.bethebuzz.co/services | added | D 6.8 / U 6.2 / C 6.6 / Co 6.0 → w 6.50 [inferred]; official: SOTD 4 Aug 2024, 7.19 — D 7.16 / U 7.18 / C 7.24 / Co 7.24; Dev 7.35 (Semantics 6.80, Animations 7.60, Accessibility 6.40, WPO 8.00, Responsive 7.80, Markup 7.00) [verified, entry page] | model: B2B service + canvas-first ambient ground + specification — checked against mindmarket (faceted world, none) and to-top (chaptered journey, moments); technique: SVG-mask knockout headline whose letters are holes onto a fixed WebGL ground — checked against recipe title-mask-tunnel and pattern typography#type-as-webgl-material; technique: noise-folded textured cloth plane with pointer-trail vertex displacement as the persistent page ground — checked against recipe gl-fluid-wake-post and pattern webgl-architecture#scroll-and-pointer-as-uniforms; stack: three-custom-shader-material — checked against stacks/three-0.186.md | |  | 2026-09-23 |
| alectear | https://alectear.com/lettering | added | D 7.3 / U 6.8 / C 6.9 / Co 7.2 → w 7.06 [inferred]; official: SOTD 7.19 overall, axis scores and date behind cookie wall [verified, entry page] | technique: persistent two-segment discipline switch (design \| lettering) docked at the bottom, which cross-scales into a large centred copy as the page's close — checked against components-catalog#edition-switcher-and-local-search, narrative-structures#the-close, [recipe:designed-footer]; world: house duotone imposed on the client work (every piece re-inked blue on lilac at rest, real colourway shown only on hover) — checked against color-and-material#colour-strategies (restrained duotone takes its chroma from imagery), `boc`, `wodniack`, `warmnfuzzy` rows; technique: at-rest monochrome to original-colourway hover swap per tile — checked against motion-vocabulary#hover-shifts, cursor-and-pointer#hover-previews-and-cursor-following-reveals | |  | 2026-09-23 |
| spasoje | https://www.spasoje.dev/ | queued | | | | | |
| christoph-nagel | https://christoph-nagel.dev/ | queued | | | | | |

### Techniques and stacks

robbietilton: blur-peek centred carousel — .awards/research/robbietilton/index.html (.carousel-item, updateCarousel) — inactive opacity .2 + blur(6px) on desktop, opacity .1 with no blur ≤920px; .5s ease-in-out; peek 10% vw desktop / 14% phone; gap = max(20, vw/2 − active/2 − peek)
robbietilton: velocity-graded snap on release — index.html (drag/touch end handler) — |v|>1.2 px/ms → 320ms; .6–1.2 → 400→320ms; slow advance 450–600ms; snap-back 350–550ms; fast cubic-bezier(.25,.46,.45,.94), slow cubic-bezier(.32,.72,.37,1)
robbietilton: desktop drag-to-scroll with momentum — index.html (globalDrag) — 8px threshold; velocity from last 150ms of 6 samples, ×16; friction .95/frame; stop <.5; wheel cancels
robbietilton: rubber-band overscroll + critically damped spring — index.html (rubberBand, springOverscroll) — d·(1−1/(x·.20/d+1)), d = innerHeight; stiffness 170, damping 2√170≈26.08, fixed dt 1/60; rest |pos|<.5 & |vel|<5; hand-off vel = vy·.20·60
robbietilton: magnetic caption and links — index.html (setParallaxFromMouse) — ±12px caption, ±4px footer links via --parallax-x/y
robbietilton: caption expanding into a glass card — index.html (openDetail, .carousel-overlay.is-open) — height 500ms cubic-bezier(.2,.6,.2,1); text opacity 1000ms cubic-bezier(.2,.8,.2,1) after 100ms; backdrop blur 8px, scale 1.05
robbietilton: frosted-disc cursor — index.html (.custom-cursor) — 40px, white .7, backdrop blur 4px, pressed 34px, collapses to 1px + blur 6px over interactive elements, .15s; no lerp
robbietilton: spatial keyboard nav — index.html (keydown) — ↑/↓ centre prev/next row (600ms easeOutCubic via jQuery animate), ←/→ step the nearest row, Space toggles its caption
robbietilton: active-only media — index.html (updateCarousel) — video plays only on the active card; GIF swapped to a still when inactive
robbietilton: jquery@3.7.1 — .awards/research/robbietilton/index.html (code.jquery.com/jquery-3.7.1.min.js)
pensatori-irrazionali: pointer-trail reveal across baked KTX2 array frames — .awards/research/pensatori-irrazionali/src/08~kpwfcf6e70.js — 6 bakes in sequence.ktx2 plus per-frame fallbacks; tiers high dpr [1,1.2] / trail 216 px / 200 pts / 3 blur samples / 44 fps, medium dpr [.7,1.05] / 128 / 160 / 3 / 36, low dpr [.5,.75] / 72 / 96 / 1 / 30 with 650k render px; half-float output; sleeps on visibilitychange; mounts at rootMargin 300px
pensatori-irrazionali: quality-tier probe — same file — 2G −2, 3G −1, prefers-reduced-motion −1, screen > 4M px −1 and > 8M px another −1, "gpu" in navigator +1
pensatori-irrazionali: GSAP global defaults — src/0rprn20dpqx26.js — duration 1/φ ≈ .618 s, CustomEase "0.175, 0.885, 0.32, 1" (back-out), autoSleep 60
pensatori-irrazionali: scripted preloader counter — src/08-om41l.yg-h.js — percent = Math.round(100 × timeline.progress()), no real load signal; SVG strokeDashoffset 1229.5 over 1.5 s power1.inOut, line draw 1 s at .3 s, wrapper hidden after .6 s delay; reduced motion sets every duration to .01; no repeat-visit skip
pensatori-irrazionali: SplitText word/line entry — src/068fq8h1ymnjo.js — type "words, lines", autoSplit, from x 1rem + blur(8px) + opacity 0
pensatori-irrazionali: view transitions router — src/04et1ujm.1ogt.js — startViewTransition wrapped in useTransitionRouter, Lenis read in the same hook
pensatori-irrazionali: sound on by default + click SFX + Konami egg — src/04et1ujm.1ogt.js, src/08-om41l.yg-h.js — localStorage "pensatori:sound-enabled" is true unless "false" was saved; click sound on buttons and links on desktop only; Konami sequence plays konami.mp3 at volume .15
pensatori-irrazionali: keyboard runner game on the 404 — src/04rtv_jfzwvzy.js — Space / ArrowUp / Enter to jump, jump velocity 780, obstacle spawn 780, collectible spawn 1180
pensatori-irrazionali: next (App Router, Turbopack, Vercel dpl id) — .awards/research/pensatori-irrazionali/index.html
pensatori-irrazionali: gsap@3.14.2 (+CustomEase, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin) — src/0rprn20dpqx26.js
pensatori-irrazionali: lenis@1.3.17 — src/133n6s~7.wlqw.js
pensatori-irrazionali: three@r182 (WebGPURenderer forceWebGL, TSL, KTX2Loader, /basis/ transcoder) — src/15g8q_4~dnkbu.js, src/08~kpwfcf6e70.js
pensatori-irrazionali: next-view-transitions@unknown — src/04et1ujm.1ogt.js
pensatori-irrazionali: swiper@unknown — src/0o7s~nivrs1sq.css, src/068fq8h1ymnjo.js
warmnfuzzy: silhouette-masked media (WebGPU → canvas 2D source-in) — .awards/research/warmnfuzzy/src/0vfjpxgat0bl8.js — WGSL fragment returns vec4f(1.0); offscreen WebGPU canvas drawn to a 2D canvas, then "source-in" and a cover-fitted <video>/<img>; rotation x += 8e-4·dt, y += 8.2e-4·dt rad/ms from random start angles; IntersectionObserver init; shared GPU device with device-lost handling; `"gpu" in navigator` detect (0_4mrm86joruc.js)
warmnfuzzy: 3D prism flip nav — src/0lbgeuh6in.p_.css — rotateX(90deg) translateZ(var(--flip-depth)) translateY(-50%), depth = row height / 2, clone face, perspective 1000px only while transitioning, .5s cubic-bezier(.26,1,.48,1)
warmnfuzzy: theme-per-section attribute — src/0r.03hwyovjrn.css — [data-theme=black|blue|yellow|orange|white] sets background, ink and --color-border; hairline only between same-theme neighbours
warmnfuzzy: artboard-locked fluid sizing — src/0r.03hwyovjrn.css — max(N − N·m + 100vw·N/W·m, N), m = .2, W = 375/768/1280/1600
warmnfuzzy: stepped grain overlay — src/0lbgeuh6in.p_.css — 32px PNG tile, inset -100px, 1s steps(2,end) infinite; still under reduced motion
warmnfuzzy: easing tokens — src/09kzghax1hjwe.js — out (.26,1,.48,1), in (.52,0,.74,0), in-out (.76,0,.24,1), expressive (1,0,0,1)
warmnfuzzy: inline media chips in a display paragraph — desktop-s50.png — round and square line-height thumbnails between words
warmnfuzzy: next@16.2.1 (Pages Router, Turbopack) — src/0skjn7eyt7~4a.js + index.html __NEXT_DATA__ / _buildManifest.js
warmnfuzzy: lenis@1.3.20 — src/0-9pg3v4jydey.js (s="1.3.20")
warmnfuzzy: framer-motion@unknown — src/0j3bx3v8qnxhf.js (framerAppearId, AnimatePresence)
warmnfuzzy: webgpu (raw, no library) — src/0vfjpxgat0bl8.js
warmnfuzzy: hls.js@1.6.15 — src/111rgua_t~gfz.js
wearedirect: colour-wave glyph entry — inline.js #6 `color-wave-entry` — SplitType chars start at opacity .15 in ink; batches of 3, .04 s per char, .1 s sine.out to one of 5 accents, .05 s hold, .1 s sine.in back to ink; lines .15 s apart; trigger top 80%, once
wearedirect: docked reel scrub-grow — inline.js #17 — fixed bottom-right at 2rem gap; width/height scrub natural → viewport − 2×2rem from `top 85%` to `top 2rem`, ease none, caption opacity 1→0; a follow trigger then tracks the section's rect; desktop ≥1024 only; click scrolls there with lenis 1.2 s
wearedirect: per-route curtain with prefetched theme — inline.js #23 — clone drops from −300vh to 0 in 1 s power2.inOut, leaves to 200vh after 1 s; colour and word come from `data-barba-color` / `data-barba-word`, prefetched from every same-origin link in idle time
wearedirect: load gate — inline.js #23 — scroll locked; logo in .4 s at .2 s, out .4 s at +.5 s; curtain to y 300vh, 1 s power2.inOut, delay .9 s; `loader:completed` at 1.35 s; plays on every load
wearedirect: services auto-advance — inline.js #21 — AUTO_DELAY 8000 ms, progress fill scaleX 0→1 linear over 8 s, pauses on mouseenter, click opens a row
wearedirect: reveal set — inline.js #6 — clip inset(0 0 100% 0)→0, 1 s power2.out, .1 s container stagger; slide-up y 48 + opacity 0, 1 s; split lines from y 130%, stagger amount .15; random-order char alpha .02 s each, 1–4 s, expo.out
wearedirect: Lenis config — inline.js #23 — duration 2, easing min(1, 1.001 − 2^(−10t)), smoothTouch false, touchMultiplier 2, gsap.ticker with lagSmoothing(0), rebuilt on every route change
wearedirect: logo marquee with drag momentum — inline.js #22 — rAF at 0.6 px/frame, drag velocity capped at 15, decays ×0.95 per frame, stops off-screen
wearedirect: webflow (export, self-hosted) — index.html (generator meta, `data-wf-site`, js/webflow.js)
wearedirect: gsap@3.12.5 + ScrollTrigger + ScrollToPlugin + Flip — index.html
wearedirect: @studio-freight/lenis@latest (unpinned) — index.html
wearedirect: @barba/core (unpinned) — index.html; entry/entry.html tags
wearedirect: split-type@0.3.4 — index.html
wearedirect: jquery@3.5.1 — index.html
wearedirect: sanity (client-side fetch) — inline.js #15
wearedirect: @elevenlabs/convai-widget-embed — index.html
zainabkabira: homography screen warp — index.html (.cs-hero-mock script) — 4 measured corner fractions → 3×3 homography → CSS matrix3d on the video; cover-crop mirrored; one ResizeObserver; scene breathes scale 1→1.05 over 18 s ease-in-out, off under reduced motion
zainabkabira: headline slot roll — index.html (#scramble) — 4 words, HOLD 900 ms, DUR 560 ms, cubic-bezier(0.22,1.15,0.36,1); plain swap under reduced motion
zainabkabira: CSS-3D coverflow ring — index.html (playground) — 54 % / 300 px / 38° per step on desktop (60 % / 250 px / 32° below 620 px), 2 neighbours each side at opacity .55 / .22, scale 1−0.14·|off|; drag axis-locked, wheel and ←/→ rotate; only the centred clip plays
zainabkabira: bottom-pinned cover + testimonial fan — index.html — sticky top = 100vh − section height, opacity scrim instead of filter, PLANE_BUFFER 160 px; fan over SCRUB 460 px, smoothstep
zainabkabira: project-tile row scrub — index.html — row scale 0.5→1 as its top travels from 95 % to 45 % of the viewport, smoothstep; per tile on mobile
zainabkabira: snap deck — index.html (case studies) — one wheel, key or swipe = one panel, 1000 ms ease-in-out cubic, native scroll kept in sync
zainabkabira: scroll-path paper plane — index.html (.plane-fly) — sprite on SVG motion path, 1.4 px trail with dasharray 10 6 revealed through a 44 px mask stroke
zainabkabira: single scroll scheduler — index.html — one listener, one rAF, cached rect reads before any write
zainabkabira: text reveal — site.css / index.html — 26 px rise, .85 s cubic-bezier(0.22,0.61,0.36,1), IntersectionObserver; media 72 px slide + settle-scale
zainabkabira: marquee — index.html — 40 px/s with fractional carry, hover park, IntersectionObserver play-state gate
zainabkabira: preloader — site.js (pageLoader) — min 1200 ms, cap 4000 ms, line rotation 1600 ms, 420 ms fade; min ≤ 600 ms under reduced motion; plays on every load
zainabkabira: day/night theme — site.js (initTheme) — document.startViewTransition crossfade, 500 ms class-fade fallback, localStorage applied before first paint; night meteor ~1.5 s every 5–13 s
zainabkabira: no framework, bundler, animation, scroll or 3D library (0 hits for gsap, lenis, three, ogl, rive, barba; hand-written vanilla JS with custom elements site-nav and site-footer) — index.html, site.js, site.css
zainabkabira: View Transitions API (native) — site.js
zainabkabira: Google Fonts css2, 10 families in one request — index.html
jesperlandberg: wheel-burst virtual scroll — DZyj3ghP.js — wheel ×1.25, deltaMode lines ×16; burst when abs(delta) ≥ 40, gap ≥ 30 ms, cooldown 500 ms; burst doubled and eased in at 1−(1−.22)^frames, at most 4 frames per tick; touch ×3.25, fling last delta ×35; ↑/↓ 100 px, PageUp/PageDown/Space .9×viewport
jesperlandberg: DOM text rasterised to Canvas-2D textures — DZyj3ghP.js + index.html — data-gl="text", per-line and per-char fillText from measured DOM boxes (fontBoundingBox ascent/descent), DOM copy -webkit-text-fill-color: transparent
jesperlandberg: deformable card sheets on an endless reel — DZyj3ghP.js — PlaneGeometry 48×24 (and 32×12); uniforms u_twist/u_twistIn, u_wave·sin(π·p), u_tunnelP/R/Y, u_reel/u_reelH, u_spin, u_lean*, u_sheet*
jesperlandberg: own rAF ticker — DZyj3ghP.js — frame ratio dt/(1000/60); gsap autoSleep false, lagSmoothing(0)
jesperlandberg: quality cap — DZyj3ghP.js — setPixelRatio(min(2, devicePixelRatio))
jesperlandberg: vw-lock root — index.html — html font-size clamp(5px, 20px, 10*100vw/var(--size)), --size 390 below 650 px, 1500 above
jesperlandberg: nuxt@3.21.10 — DZyj3ghP.js
jesperlandberg: vue@3.5.40 — DZyj3ghP.js
jesperlandberg: three@r185 (KTX2 + Basis) — DZyj3ghP.js, DJ70QaFT.js
jesperlandberg: gsap@3.15.0 (core; ScrollTrigger plugin unknown) — DZyj3ghP.js
goats: preloader aperture handoff — js_index.js — hero clip inset(32% round 10px), opacity 0 → .7 s power2.out to inset(30%), then inset(0% round 0px) 1.4 s expo.inOut; video scale .6/opacity .5 → 1; chrome y -1.5vw → 0, 1.4 s delay 1; scroll locked 2.4 s; skipped under reduced motion or when scrollY ≥ 2
goats: preloader counter + bowed curtain — js_index.js — counter to 92 over 2.4 s power2.out, to 100 in .35 s power1.in on load; min hold 1500 ms (800 ms quick via sessionStorage goatsPreloaded); fallbacks at 3.5 s, 5.2 s and 6.8 s; curtain yPercent -112 .9 s expo.inOut; edge path Q50,10 over .4 s power2.in, then flat over .45 s power3.out
goats: word-opacity fill — js_index.js, blocks_acf_about_style-index.css — words start at .15; one scrub timeline to 1, duration 1, stagger .5, ease none, top top → bottom bottom; 200 vh section, sticky 100 svh stage
goats: counter-translated horizontal rail — js_index.js, blocks_acf_wemake_style-index.css — section height = innerHeight + (scrollWidth − innerWidth); track y:+T, x:−T scrubbed; intro video x T/2, scale 1.1, opacity → 0; ≥1025 px only; below that native overflow-x, scroll-snap-align start, tabindex 0, data-lenis-prevent, scaleX progress bar on rAF
goats: scroll-scrubbed footer video — js_index.js, blocks_acf_site-footer_style-index.css — wrap 100 + clamp(55, round(51 × duration), 150) vh, sticky 100 svh; currentTime = p × (duration − .05); fine pointer only; on coarse pointers, play-then-pause on the first touch, with a loop fallback
goats: hero scroll-out — js_index.js — video y 50vh, scale 1.1, opacity → 0, scrub top top → bottom top
goats: header hide on scroll direction — js_index.js — ScrollTrigger start 120, toggles is-hidden on direction 1
goats: client tile reveal — js_index.js — from autoAlpha 0, y 28, .7 s power2.out, stagger .08, start top 82%, once
goats: idle section snap (in the bundle, inactive on home) — js_index.js — 140 ms debounce, snaps if within 45% of the viewport, .9 s ease-out cubic, desktop fine pointer only, page-template-page-no-title only
goats: gsap@3.15.0 (+ ScrollTrigger) — js_index.js
goats: lenis@1.3.25 — js_index.js
goats: WordPress custom theme with ACF blocks, Yoast 28.5, W3 Total Cache, Contact Form 7 6.1.7 — index.html
goats: jquery@3.7.1 (loaded by WordPress, the theme bundle does not use it [inferred]) — index.html
goats: Poppins self-hosted woff2 — index.html
runrobrun: music-reactive analyser — 1tg1lcs-yq9vy.js — createMediaElementSource → AnalyserNode fftSize 256, smoothingTimeConstant .52; bins 1–10 / 10–32 / 32–64 = low / mid / high, followed at .42 / .24 / .16; onset pulses low ×7.5 above .018, mid ×5.4 above .035, decay ×.82 / ×.72; the state is sent to the scene as a window CustomEvent (music-reactive-input.js)
runrobrun: goo hero input damping — morph-react-scene.js — pointer lerp 1 − 0.001^dt, drag rotation 1 − 0.0001^dt; music impact attack .34, release .075; WebGPU when navigator.gpu exists, otherwise a dynamic import of webgl-fallback-scene.js
runrobrun: pixel-cell loader — 1tg1lcs-yq9vy.js — 10×8 grid, target cell 112/100/88/72 px by viewport width, fixed 1.4 s rAF timer then hidden after 120 ms, Lottie runner, no repeat-visit skip
runrobrun: pixel-cell menu overlay — 0tgoiyecp9_k6.css + index.html — 6 columns, opacity .34 s cubic-bezier(.16,1,.3,1), open delays ≈ 0–.58 s with mirrored close delays
runrobrun: pixel-cell section wipe and image reveal — 0tgoiyecp9_k6.css + index.html — wipe cells opacity 20 ms linear, delays ≈ .05–.37 s; portrait cells .16 s linear, greyscale image repeated in every cell
runrobrun: scroll typography — 1tg1lcs-yq9vy.js — yPercent "+=100", expo.inOut, start "bottom 90%", end "top 25%", scrub .4
runrobrun: menu link reveal — 1tg1lcs-yq9vy.js — autoAlpha/y .26 s power3.out stagger .045; rules scaleX .28 s power2.out
runrobrun: canvas grain — 0_v9-tbxy4h9g.js + 0tgoiyecp9_k6.css — random-pixel frames (14 % black) cycled every 83.33 ms (12 fps), rebuilt 160 ms after a resize, opacity .05 multiply
runrobrun: Lenis boot — 0_v9-tbxy4h9g.js — {lerp .1, smoothWheel true, smoothTouch false}, own rAF, skipped under prefers-reduced-motion, anchor jumps with immediate: true
runrobrun: next@16.2.10 — 1nm-po-yw_ii_.js (+ turbopack-1kmgj0d31i3ll.js)
runrobrun: gsap@3.15.0 + ScrollTrigger — 1tg1lcs-yq9vy.js
runrobrun: lenis@1.3.25 — lenis-chunk.js (1n1wrlbf_viss.js)
runrobrun: three (WebGPU build + WebGL fallback, revision unknown) — morph-react-scene.js, morph-webgl-fallback.js
runrobrun: lottie-web@5.13.0 — 1tg1lcs-yq9vy.js
oxigen: Scroll camera on waypoints — .awards/research/oxigen/index.html l.879–919, 2020–2030 — 7 waypoints; eased (cubic in-out) between them; progress measured over the 3D chapters only; camera lerp .085; each waypoint also sets glow intensity and fill height (0→54)
oxigen: Intro build — index.html l.2008–2025 — 2700 ms camera dolly (cubic ease-out) from (0,44,205); voxels build over 2000 ms with a glow front climbing to 52, then wireframe resolves to solid over 700 ms; Lenis stopped until done
oxigen: Voxel motion — index.html l.1183–1230 — RoundedBox 0.96 edge / 0.13 radius; grid 144; coarser voxels (VQ 2) at ≤820 px; idle amp .09, wind .7, flutter 3.0/.28, cursor wake radius 18 / lift 1.8; hover only on fine pointers
oxigen: Logo-fill preloader — index.html l.2098–2160 — weights boot .08 / fonts .32 / scene .60; trickle 0.9·(1−e^(−t/1600)) capped at .92; MIN 850 / MAX 8000 ms; exit 1600 ms exponential scale into the 'g' counter; reduced motion: opacity .5 s
oxigen: Typewriter headlines — index.html l.1651–1810 — 50 ms/char headings, 12 ms/char belief cascade, 180 ms gap; column height locked before typing; skipped under reduced motion
oxigen: Dithered portrait — index.html l.2208–2259 — 8×8 Bayer; grid 400 (240 below 760 px); fade width .06; lerp .16 on section progress; drawn whole under reduced motion
oxigen: Pixel-grammar icons — index.html l.2161–2206 — 15×15 procedural canvas-2D; 3.4–4.4 s loops; paused off-screen via IntersectionObserver
oxigen: 3D-to-DOM hand-off — index.html l.1954–1966, 2044–2075 — canvas scales to 0.87 then translates away while #paper fades in; fixed layers set to display:none past #services
oxigen: Adaptive quality ladder — index.html l.822, 1971–2000 — DPR cap 1.3 desktop / 1 on phones; 60 fps cap; after more than 15 frames over 22 ms: DPR −0.2 down to .9, then GTAO off, then bloom off
oxigen: Two-panel page transition — index.html l.2339–2384 — WAAPI translateY, cubic-bezier(.76,0,.24,1); exit 520 ms + 90 ms offset, enter 560 ms; sessionStorage flag; bfcache reset
oxigen: Horizontal accordion cards — index.html CSS l.342–366 — flex-grow 1 to 2.7 on hover, .55 s cubic-bezier(.4,0,.12,1); stacks at ≤820 px
oxigen: Lenis setup and keyboard path — index.html l.1833–1873 — lerp .09, syncTouch false; custom keydown: arrows ±110 px, PageUp/PageDown/Space ±0.9 × viewport height, Home/End
oxigen: three@0.170.0 — .awards/research/oxigen/index.html (importmap to unpkg; RoundedBoxGeometry, EffectComposer, GTAOPass, UnrealBloomPass, OutputPass, ShaderPass)
oxigen: lenis@1.1.14 — .awards/research/oxigen/lenis.min.js
oxigen: no bundler or framework: one hand-written HTML file with inline module scripts — .awards/research/oxigen/index.html
mensch: settle-snap after scroll stops — index.html (inline hero → about settle script) — QUIET 160 ms, EDGE .06, target 0 or 1 vh, lenis.scrollTo .7 s lock, 900 ms re-arm guard, held while pointer/touch is down, off under reduced motion
mensch: blackletter title glitch — index.html (services script, `#svc-title.uf`) — swap to UnifrakturCook for 320 ms every 3400 + rand(2200) ms, off under reduced motion
mensch: type-and-erase title — index.html (`#ht-word` script) — 6 words, type 115 ms/char, erase 58 ms/char, hold 2200 ms, 400 ms gap, opens mid-cycle on a full phrase, aria-hidden, reduced motion shows first word
mensch: sequential word fill — index.html (about scroll-fill script) — rgb(160,157,133) → white, progress × (N + 6) − i, starts .45 vh before pin, ends when section top meets viewport top
mensch: self-releasing sticky statement — index.html (about layout script) — pin height = top + h − 110 px gap, spacer leaves 25 px of the next section peeking
mensch: shared-field soil shader — assets/vendor/mensch-soil.js — fbm 4 octaves, one CLOCK_ORIGIN and one pointer sim for all canvases (trail 32, decay .55, pull .012, damping .93), uScroll = scrollY/vh × .5, DPR ≤ 2, IO pause, one static frame under reduced motion
mensch: rolling-window frame sequence — lab-canvases.js — 120 WebP frames at 15 fps, 20 decoded ImageBitmaps kept and close()d behind the playhead (45 MB vs 273 MB), DPR ≤ 3; boot loader gated on the same 20 frames, capped at 2.5 s
mensch: hero recede — web-chrome.js — smoothstep(scrollY/vh), translateY up to −44 px, opacity to .72, no scale
mensch: CRT boot loader — index.html (`#boot`) — once per visitor via localStorage, click to skip, .62 s warm-up, 45 ms ticks to 87 %, crt-flicker 4 s steps(1), crt-roll 5.5 s linear on transform
mensch: footer wordmark letter-part — web-chrome.js — hovered letter holds, others translate ±52 viewBox units, .4 s cubic-bezier(.16,1,.3,1)
mensch: pointer parallax — assets/vendor/mensch-parallax.js — lerp .08, video −12/−8 px, pill 6/4 px, off on touch and reduced motion
mensch: lenis@1.1.14 — .awards/research/mensch/src-lenis.min.js (`var k="1.1.14"`), lazy-injected by src-web-chrome.js
mensch: raw WebGL / WebGL2, no library — .awards/research/mensch/src-assets_vendor_mensch-soil.js (`getContext('webgl2')`)
mensch: vanilla JS, no framework or bundler — .awards/research/mensch/index.html (plain script tags)
911rennsport: wordmark dock — index.html (inline script "Logo Scale"), rennsport.shared.css `.nav_logo_home` — timeline per `.section.is--hero`, start 'top top', end 'bottom top', scrub .4, from { y: '-20%', width: '100%' } to a sticky 180px link (tweens width)
911rennsport: opposed scrubbed headline pair — schunk.4cf233830a198d29.js (IX2 `a-5` "Display Carousel") — SCROLLING_IN_VIEW → SCROLL_PROGRESS; .start-left x −100% → 100%, .start-right x 100% → −100%, keyframe 100 easeOut; lines 5rem base up to 9rem, −4px tracking
911rennsport: background-position parallax — index.html (initParallaxEffect), rennsport.shared.css `.para-item` — 50% 0% → 50% 100%, ease none, scrub true, 'top bottom' → 'bottom top', background-size 150%, aspect 2/3
911rennsport: auto-advancing tab hero with progress bars — index.html (tabLoop scripts), rennsport.shared.css `.tab-progress` — two copies of the interval script, 6000 ms and 4000 ms, a click resets the timer; each bar is a scaleX from origin 0
911rennsport: nav re-theme poller — index.html (navContextSwitcher) — a rAF loop that never stops, getBoundingClientRect on every data-section-dark/black/transparent section each frame, offset half the nav height, priority dark > transparent > black
911rennsport: Lenis smooth scroll — index.html — lerp .1, wheelMultiplier .7, smoothTouch false, normalizeWheel false, its own rAF loop (not the GSAP ticker); the burger stops and starts it through data-lenis-toggle
911rennsport: webflow — index.html (`data-wf-site`, `w-` classes, `Webflow.push`), schunk.4cf233830a198d29.js (IX2 data, rspack 1.3.9 runtime in wf-ix.js)
911rennsport: lenis@1.0.23 — index.html (`cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.23/bundled/lenis.min.js`)
911rennsport: gsap@3.8.0 — index.html (`cdnjs.cloudflare.com/ajax/libs/gsap/3.8.0/gsap.min.js`)
911rennsport: ScrollTrigger@3.8.0 — index.html (`cdnjs.cloudflare.com/ajax/libs/gsap/3.8.0/ScrollTrigger.min.js`)
911rennsport: jquery@3.5.1 — index.html (Webflow cloudfront jquery-3.5.1.min)
okaydev: scroll curl — home-renderer-DnS0bFuM.js `applyCylinderProgress`/`initCylinder` — rotationX = 48° × power1.in(p), z = −900(1−cos θ), brightness 1→.35 past p .55, current += .18 × (target − current) on gsap.ticker, ticker removed when settled within .001
okaydev: pointer tilt with shine and shade — home-renderer-DnS0bFuM.js — quickSetter rotationX/Y + shine/shade xPercent/yPercent/opacity; mouse pointerType only; credit card scale .94→1
okaydev: scroll-end hover lock — home-renderer-DnS0bFuM.js `is-interaction-locked` — 140 ms scroll-end timer, released on the next pointermove
okaydev: hero exit timelines — home-renderer-DnS0bFuM.js `playExitForward`/`playExitReverse` — threshold-played, timeScale 1.35 forward / 1.85 reverse
okaydev: marquee hover slow-down — home-renderer-DnS0bFuM.js — timeScale .35 over .85 s power2.inOut; height 60/58/52 px; not built under reduced motion
okaydev: column parallax — home-renderer-DnS0bFuM.js `initParallax` — y ±46/12/20/40 px, ease none, scrub 1, top bottom+=70% → center top
okaydev: sideways brand word — home-renderer-DnS0bFuM.js class P — x by overflow, scrub .5, breakpoint 1023
okaydev: phone hero media cycle — home-renderer-DnS0bFuM.js `initMobileCycle` — 2.8 s repeat timeline, portrait + no-preference only, inert/aria-hidden on hidden slots
okaydev: scripted composer typing — home-renderer-DnS0bFuM.js `typeInSeg` — per-character typing into a highlighted fenced CSS block
okaydev: duration grid — home-renderer-DnS0bFuM.js — .12/.36/.48/.72/.96 s, power2.out leads; CSS eases cubic-bezier(.19,1,.22,1), (.215,.61,.355,1), (.23,1,.32,1) in app-DZ4qmsr3.css
okaydev: header intro skip — index.html inline script — `data-header-intro-seen` clears the entrance before first paint on repeat within a tab
okaydev: section height reserve — index.html `okaydev-home-height-reserve` — 100svh hero, clamp(720px,63.9vw,920px) work
okaydev: gsap@3.15.0 (ScrollTrigger, SplitText, Draggable, InertiaPlugin) — HeaderLogoLetters-YUlN53xs.js, home-renderer-DnS0bFuM.js
okaydev: htmx@2.0.7 (+ Sprig) — HeaderLogoLetters-YUlN53xs.js
okaydev: Highway-style PJAX router (version unknown; possibly an in-house port) — index.html data-router-*, HeaderLogoLetters-YUlN53xs.js NAVIGATE_IN / onEnterCompleted
okaydev: vite (modern + legacy bundles, renderer chunk per route type) — index.html modulepreload / vite-script-loaded, app-DcB1ZGDG.js
okaydev: craft-cms on Servd (SEOmatic, Freeform) — index.html
okaydev: fonts Aeonik Pro VF / Aeonik Mono / Megazoid (self-hosted woff2) — index.html, app-DZ4qmsr3.css
likova: stepped "bitten-corner" silhouette reused as loader, panels, cookie box and buttons — index.html, desktop-rm-s00.png, wheel/mobile-s100.png — 18 `btn--bitten-corner` buttons, variants `--lt` / `--lb` / `--outline`
likova: long scrubbed hero stage (wordmark panel retracts → Class A card → render pulls back) — wheel/desktop-s00…s100.png — 12 000 px of wheel input stays inside the hero
likova: scroll keyframes declared as attributes that write CSS custom properties — index.html — 219 `data-plugin="parallax"`, `data-parallax-0-0='{"--progress":"0"}'` → `100-100 … "1"`, `data-parallax-clamp`
likova: snap points + gravity wells on top of Locomotive — shared.js, index.html — `{viewport, element, direction, scrollable}` points; 14 empty `data-scroll-snap-point` attributes, so whether snapping engages is unknown
likova: Locomotive smooth mode — shared.js — `smooth:!0`, `smartphone:{smooth:!0}`, lerp .1, multiplier 1, touchMultiplier 2, tablet breakpoint 768
likova: clamped orbit camera over the site model — webgl-club.js — camera-controls smoothTime .2 / .6, polar ~1.1–1.5, distance 40–53.5, two-finger touch zoom, `setLookAt` fly-tos, `antialias:false`, tone mapping
likova: single easing token — global.css, landing.css — `cubic-bezier(.7,0,.3,1)` ×102 at .5 s / .7 s / 1.2 s
likova: preloader counting to 100 % over the dimmed lattice scene — desktop-rm-s00.png, mobile-s00.png — no repeat-visit skip found (no sessionStorage)
likova: three@r180 — threejs.js (`const i="180"`; GLTFLoader, DRACOLoader, KTX2Loader, PMREM, RawShaderMaterial)
likova: camera-controls@unknown — threejs.js (`camera-controls`, `yomotsu`), webgl-club.js (`CameraControls`)
likova: locomotive-scroll@4.x — shared.js (`namespace="locomotive"`, v4 `smartphone` / `tablet` option shape)
likova: @barba/core@2.10.3 — shared.js (`this.version="2.10.3"`, `@barba/core` logger), index.html (`data-barba="wrapper"`)
likova: framer-motion@11.13.3 — shared.js (`MotionValue` `this.version="11.13.3"`)
likova: jquery@3.7.1 — shared.js (`jQuery JavaScript Library v3.7.1`)
likova: webpack@unknown — shared.js (`webpackJsonp`, lazy chunk map `threejs` / `webgl-club` / `webgl-fps-counter`)
siteassist: pointer-mapped coordinate readout — .awards/research/siteassist/index.html (initCursorCoordinates) — pageY/innerHeight → lat 51.30–51.70, pageX/innerWidth → lon −0.50 to −0.05, toFixed(4), raw mousemove, no damping
siteassist: autoplay tab accordion with progress bar — index.html (initTabSystem) — timeline defaults .3s power3; visual autoAlpha crossfade at +.25s; details height 0→auto; progress scaleX 0→1 power1.inOut over 5000/7000 ms; first switch once at "top 80%"; mobile pre-scroll with a 5rem offset
siteassist: scroll-direction marquee — index.html (initMarqueeScrollDirection) — speed 30, scroll-speed 2, duplicate 2, multiplier .25 below 479px / .5 below 991px / 1
siteassist: attribute-driven parallax — index.html (initGlobalParallax) — gsap.matchMedia at 479/767/991, defaults yPercent 20→−20 from "top bottom", scrub true; homepage instance 0→20 from "top top"
siteassist: nav theme by section — index.html (initThemeToggle) — data-next-theme dark/light/transparent tested at viewport top on a passive scroll listener; Shift+T manual toggle
siteassist: Lenis config — index.html — lerp .6, wheelMultiplier 1, autoRaf true; stop/start around the demo form, Escape restarts
siteassist: quote fader — index.html — Swiper effect fade crossFade, loop, a11y false
siteassist: CSS easings — .awards/research/siteassist/site.css — transform .4s cubic-bezier(.625,.05,0,1) on tab chrome; .2s cubic-bezier(.215,.61,.355,1) on buttons
siteassist: webflow (data-wf-site, webflow.schunk.*.js, w- classes, w-dyn-item) — index.html
siteassist: gsap@3.15.0 + ScrollTrigger, CustomEase, MorphSVGPlugin, SplitText (cdn.prod.website-files.com/gsap/3.15.0/) — index.html
siteassist: lenis@1.2.3 — index.html
siteassist: swiper@11 — index.html
siteassist: jquery@3.5.1 — index.html
siteassist: webfontloader@1.6.26 (Geist, Geist Mono) — index.html
to-top: layered cut-out landscape parallax — .awards/research/to-top/index.html (inline script) — .mountain0–5 yPercent 0/30/52/55/70/80, .main-button-circle 125, .logo-section −70; trigger .parallax-components '50% bottom'→'bottom top', scrub 1.2, ease none; fade timeline 'top bottom'→'35% top', mountain4 → .5, mountain5 → .3; matchMedia min-width 990px
to-top: lazy Spline mount — .awards/research/to-top/index.html (inline module) — IntersectionObserver rootMargin '1000px 0px', threshold 0, spline-viewer appended once then unobserved; AVIF signpost still in the layout
to-top: Lenis smooth scroll — .awards/research/to-top/index.html — duration 2.3, easing min(1, 1.001 − 2^(−10t)), smoothTouch false, touchMultiplier 2, own rAF loop calling ScrollTrigger.update(), innerWidth ≥ 990 only
to-top: cursor-follow card label — .awards/research/to-top/index.html — lerp 0.1 per rAF, one rAF loop per .cursor-area that never stops, opacity toggled on enter and leave
to-top: sticker-disc CTA hover — .awards/research/to-top/index.html — rotate 15 → 8 on mouseenter, back on mouseleave, 0.8 s power1.out
to-top: hide-on-scroll nav — .awards/research/to-top/index.html — class swap on any 1 px change of scroll direction
to-top: Webflow IX reveals — .awards/research/to-top/index.html (head style) — opacity 0 + translate3d(0,20%,0) + blur 8px; translate −101% drop; rotateZ 6deg; scale .6
to-top: Webflow (last published 2026-09-08) — .awards/research/to-top/index.html
to-top: gsap@3.15.0 + ScrollTrigger, SplitText, TextPlugin, ScrollToPlugin, EasePack — .awards/research/to-top/index.html
to-top: lenis@0.2.28 (studio-freight bundled) — .awards/research/to-top/index.html
to-top: @splinetool/viewer@1.10.40 and @1.10.32 (both imported; causes the duplicate-define page error) — .awards/research/to-top/index.html, manifest.json
to-top: jquery@3.5.1 — .awards/research/to-top/index.html
nodeck: paper-crumple exit transition — main-BqI5seD_.js (`Ks`, `_snapshot`, `lt`, `Ot`) — html2canvas at DPR ≤ 2 → CanvasTexture on a 48×36-segment plane; ball radius min(vw,vh)×.2 clamped 64–320 px; three angular sine octaves (3/7/13) + hashed jitter; gather / fall / spin / drift into a bin; skipped under reduced motion; falls through on error
nodeck: wheel commit ring — main-BqI5seD_.js (`_onWheel`, `hi=500`, `ci=1e3`) — sums |deltaY| to 500; ring tween .2 s power2.out, commit .12 s; 1000 ms idle rollback; resets on direction change; `role="progressbar"`; disconnected under reduced motion
nodeck: slide transition interstitial — main-BqI5seD_.js (`transition.run`) — band height 300vh, y −100vh, 1 s power3.inOut; SplitText lines+chars masked, yPercent 110→0, .5 s back.out(1.7), stagger .02, in at +.45 s; out back.in(1.7) after .2 s
nodeck: runaway CTA — main-BqI5seD_.js (`_resolveFlee`, `At=220`, `Mt=160`, `Os=280`, `Ms=120`) — flees within 220 px of its edge; step 160→280 px by proximity; farthest of 9 anchors when still within 40 px; quickTo beyond 120 px, direct set inside; mouse only
nodeck: reduced-motion helpers — sound-CsfXcoUP.js (`hA`, `w`) — tween duration / delay / stagger zeroed; durations max(180 ms, 40 %); instant slide changes
nodeck: opt-in sound — sound-CsfXcoUP.js — Howler bank, muted by default, remembered in localStorage, ducking
nodeck: gsap@3.14.2 (+ ScrollTrigger, SplitText, Flip, Observer, Draggable, InertiaPlugin) — gsap-DUAj52go.js
nodeck: three@r185 — three-PDSP0dbZ.js
nodeck: html2canvas@unknown — main-BqI5seD_.js, html2canvas-DXEQVQnt.js
nodeck: swiper@unknown — swiper-B37jsxd9.js, swiper-hP8iLu9g.js
nodeck: howler@unknown — howler-EcGChfno.js, sound-CsfXcoUP.js
nodeck: vite (vanilla) — main-BqI5seD_.js (`__vitePreload`), index.html
nodeck: vercel (hosting) — getent hosts
primesec: mesh erosion dissolve — main.js — value-noise edge ×10, amplitude .09 (offset −.6); a hashed stochastic feather over .08 units above the front discards fragments; the front sweeps from bbox min − 1.5·band to max + 1.5·band with progress
primesec: frame-rate DPR governor — main.js — samples every .5 s; below 45 fps steps −.25 (floor 1), above 57 fps steps +.25 up to min(DPR,1.5) on phones or clamp(DPR,1.5,2) on desktop; antialias only at ≥ 992 px
primesec: idle render gate — main.js — skips rendering 1500 ms after the last scroll or pointer input unless a transition is busy; stops while the tab is hidden; dt clamped to .05 s
primesec: raycast surface ripples — main.js — pointer lerps .4 toward the hit point; a new ripple once the pointer moves more than radius × spacing or the cooldown ends; trail decays, cut-off .004
primesec: scroll-scrubbed glTF clip + pointer head-turn — main.js — mixer time = clipStart + p·length; pointer smoothing .03 per frame; idle bob sin(t·.8)·.012; camera keyframes reached with lerp(1 − .001^dt)
primesec: stage progress state machine — main.js — 1480vh sticky stage; smootherstep 6t⁵−15t⁴+10t³ windows; act 1 is the first 37.5 %, act 2 starts at 50.5 % on desktop
primesec: split-headline exit — main.js — halves translate ±52vw (115vw below 1024 px) over the first 18 % of act 1; entrance ±90 px, 1.1 s power3.out
primesec: two-layer clip-path line fill — main.js — base and fill copies; fill uses inset(0 (1−r)·100% 0 leave·100%); lines enter from translateY 120 %
primesec: preloader counter hold — main.js, index.html — capped at 92 until glTF ready (.5 s power1.out steps); 100 in .4 s power2.out; slides up in .85 s cubic-bezier(.76,0,.24,1); removed at 950 ms; 12 s fallback; plays on every visit
primesec: scroll-driven tabs with click jump — main.js — 5 tabs; a label click cross-fades in 700 ms, then scrollTo immediate
primesec: rAF logo marquee — index.html inline — 26 s per set, 3 copies, dt clamp .1 s, not started under reduced motion
primesec: sticky numbered why-list — index.html inline — 180svh wrapper, 100svh sticky panel, index = floor(progress × n), .4 s power2.out height and colour swaps
primesec: SplitText reveals — index.html inline — yPercent 115, 1 s power3.out, stagger .01, delay .5; scrubbed word fade from .3
primesec: three@0.169.0 (r169) — main.js
primesec: gsap@3.15.0 + ScrollTrigger + SplitText — index.html (Webflow CDN); gsap@3.15.0 bundled again — main.js
primesec: lenis@1.0.23 — index.html
primesec: lenis@1.3.23 — main.js
primesec: swiper@11 — index.html
primesec: webflow (IX3) — index.html
primesec: jquery@3.5.1 — index.html
primesec: GLTFLoader + DRACOLoader (KTX2Loader, MeshoptDecoder bundled) — main.js
primesec: Vite-hashed module assets/index-DM4qWrvI.js — index.html
haoqi: Lenis on inner wrapper — 3c6cc5b2fcccdee5.js — ReactLenis {lerp .1, smoothWheel, syncTouch, anchors, autoRaf:false}, lenis.raf from shared ticker; jumps lenisScrollTo(…,{lerp .1}); SVG thumb drag {immediate:true}
haoqi: Preloader pill — index.html — 140px track, fill width 520ms cubic-bezier(.22,1,.36,1), fade 250ms cubic-bezier(.25,1,.5,1); FontFace display:"block" before reveal
haoqi: Scroll-clocked hyperspace shader chapter — 4d3f3b68dbbde33a.js — Shadertoy-style iTime clamped to uScrollDuration, 100 angular cells, uStarRays/uStreakScale/starThinness, 4 stages over 8 segment heights, per-char hsstFadeIn/Out stagger
haoqi: Instanced sticker rain — 4d3f3b68dbbde33a.js — 12 atlas sprites, fallSpeed 1.8, windStrength 1.8, windFrequency .3, rotationSpeed .8, scale 1.4, click re-spawn, alpha discard <.01
haoqi: GL-only work thumbnails with hover swap — index.html + 4d3f3b68dbbde33a.js — empty aspect-ratio 1/1 DOM boxes, imageUrl/hoverImageUrl textures, R3F dpr [1,2]
haoqi: SVG signature stroke draw — index.html — stroke-dashoffset, per-path --path-delay/--path-dur, cubic-bezier(.65,0,.35,1), reduced-motion shows final stroke
haoqi: Passcode-gated redaction — index.html — role=button tabindex=0, six ■ glyphs, aria-label "Protected — enter passcode to reveal"
haoqi: Theme/sound hotkeys — 2689132c4e070b68.js — L/D/A → light/dark/system, S → sound, input and modifier guards, localStorage keys `theme` / `sound`
haoqi: BGM — 2689132c4e070b68.js — /bgm.mp3 loop, volume .35, on by default, play() at once and again on first pointerdown
haoqi: House ease — 635eb04122aa774f.css + 2689132c4e070b68.js — --ease-66 cubic-bezier(.66,0,.01,1)
haoqi: next@16.1.6 (App Router, Turbopack) — 56b0d8f9f2c1e441.js
haoqi: react@19.3.0-canary-f93b9fd4-20251217 — 1098c2541054fc77.js
haoqi: @react-three/fiber@9.6.1 — 1098c2541054fc77.js
haoqi: three@r184 — 1098c2541054fc77.js (`__THREE__="184"`)
haoqi: postprocessing@unknown (EffectComposer, Bloom, SMAA materials) — 1098c2541054fc77.js
haoqi: GLTFLoader + DRACOLoader + KTX2 — 4d3f3b68dbbde33a.js
haoqi: lenis@1.3.23 — 1098c2541054fc77.js
haoqi: motion (React; layoutId / LayoutGroup / whileHover)@unknown — d59f7a97fb1c563f.js
haoqi: Vercel hosting (`?dpl=dpl_…`) — index.html
serotoninn: scaleY stretch-up reveal — src/main.js — scaleY 0→1 from transformOrigin bottom, .7 s, cubic-bezier(.75,0,.25,1), SplitText line stagger .06, start top 75–95%
serotoninn: hero two-state torn split cycle — src/main.js, src/main.css — colour layer mask-image mask_img.webp over grayscale(1) twin; outgoing scaleY→0 (origin top) / incoming scaleY→1 (origin bottom), 1.5 s, second layer at +.8 s, 5 s per look; pinned top→arrivals top, pinSpacing false
serotoninn: alphabet-ladder scramble — src/footer-anim.js, src/loader.js — each letter steps a→itself, .18 s per char, .04 s stagger, ease none
serotoninn: intent-scrubbed Lottie sticker — src/footer-anim.js — canvas renderer; frames 0→50 % over .9 s ease-out-cubic on reveal, →100 % over .6 s on hover, back to 50 % on leave; fine pointer only, touch plays 0→100 %
serotoninn: lips-outline video mask — src/main.css — inline SVG `mask:url(data:image/svg+xml…)` on a film, section 2× --inner-vh tall
serotoninn: block-scoped cursor — src/custom-cursor.js — quickSetter x/y on rAF; enter scale .4→1.05→.9→1 (.167/.133/.167 s, cursorEase .20,0,.10,1); press →.8; label char roll yPercent ±105, .35 s, stagger .1, 2 s hold; hides over iframes/embeds
serotoninn: route curtain — src/loader.js — loader panel y −150→−50→0 vh, .8 s + .8 s, loaderEase (.75,0,.25,1), then location.assign
serotoninn: scrubbed parallax and clip — src/main.js — campaign video y 10%→−10%, bestseller frame inset(0 15%)→0, ease none, scrub true
serotoninn: session-gated preloader — src/main.js — sessionStorage heroIntroDone skips the intro on repeat visits
serotoninn: gsap@3.14.2 + ScrollTrigger + SplitText + CustomEase — src/loader.js
serotoninn: lenis@1.1.20 — src/loader.js
serotoninn: lottie-web@5.13.0 — src/loader.js, src/footer-anim.js
serotoninn: @fancyapps/ui (Fancybox)@5.0.36 — src/loader.js
serotoninn: swiper@unknown — src/loader.js, src/loader.css
serotoninn: jquery@3.7.1 — index.html
serotoninn: WordPress (theme `ref`, PageSpeed) — index.html
areebali: object-as-navigation click wheel — .awards/research/areebali/0-l9aqkh94542.js — `{ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}` maps to channels; P / Enter / Space power; Alt+arrows change channel; Esc goes back; one highlighted row always matches Enter
areebali: wheel pointer tilt — .awards/research/areebali/0-l9aqkh94542.js — perspective(620px), rotateX/Y ±5°, press scale .985, follow .12s ease-out, settle .5s cubic-bezier(0.2,0.8,0.2,1)
areebali: state-aware keyboard legend — .awards/research/areebali/states/desktop-state-power-nav.png — off: "P power on"; on: ←→ prev/next, ↑↓ scroll, ↵ open full, Alt+arrows channel, Esc back, P power off
areebali: intro film handed off to the live device — .awards/research/areebali/0-l9aqkh94542.js — quote 120ms, recover 2900ms, video 3600ms, cut at currentTime 7.875s or a 13975ms fallback, 620ms handoff; plain path (reduced motion or ≤640px) out at 3600ms, done at 4400ms; video positioned on the device rect
areebali: synthesised UI sound — .awards/research/areebali/0-l9aqkh94542.js — sine + triangle voices at 784 Hz then 1174.7 Hz (+85ms); 300→760 Hz sweep over .1s; WAV doorbell fetched lazily; on-screen sound toggle defaults to muted
areebali: moderated stamp guestbook — .awards/research/areebali/03.ic12.qdu.s.js, desktop-s50.png — stamp {name, template, ink, size, x%, y%, rotation, ts, tz, message}; pending in localStorage `rn-stamp-pending-v1`; countdown before stamping unlocks (0:58 observed)
areebali: chat channel with fallback — .awards/research/areebali/0-l9aqkh94542.js — POST /api/rams {nick, speaker, messages}, AbortController, falls back to a regex reply bank; password/NDA phrases route to the locked-project flow
areebali: reduced-motion collapse — .awards/research/areebali/0t~vlawo4y1zt.css — transition and animation durations .001ms, iteration count 1, noise overlay off under reduced motion and ≤768px
areebali: next (Turbopack build, App Router) — .awards/research/areebali/index.html
areebali: react@19.3.0-canary-3f0b9e61-20260317 — .awards/research/areebali/0wj8l4fwydekq.js
areebali: gsap@3.14.2 (+ScrollTrigger, Observer) — .awards/research/areebali/04f71k5d5_pc2.js
noth: fluid-dye reveal mask — .awards/research/noth/main.js — sim 256², dye 512², velocity dissipation .962, dye dissipation .988, 20 pressure iterations, curl 0, splat radius 6e-5, splat force 5900, revealSize 3.9, edgeSoftness .5, edgeWidth .01; mask = smoothstep(soft, soft+width, dye×size); DPR ≤ 2, no antialias
noth: pointer repulsion field — .awards/research/noth/main.js — radius 460 px (260 px ≤ 767), max push 380 px (110), falloff ((R−d)/R)^1.6, rotation 30° (12°), scale +.2 (+.1), .45 s power4.out; return elastic.out(1, .35) over 1.2 s
noth: scroll-scrubbed Flip letter morph — .awards/research/noth/main.js — Flip.from power4.inOut 1.4 s, stagger .2 from the end, repeat 1 yoyo, per-letter scale dip to .2; ScrollTrigger over the section, scrub 3
noth: framed manifesto dolly-out — .awards/research/noth/main.js — pinned one viewport; video scale 1.4→.35, wall photo scale 1.8→1, ease none, scrub 1, ≥ 992 px; reflection video re-synced when drift > .08 s; sound fades in .35 s, out 1.6 s after a 1.4 s delay
noth: countdown preloader with shuffled wordmark rise — .awards/research/noth/main.js — fixed 5000 ms image flicker, gap 500→100→500 ms along a sine; counter 100→000 with power2.inOut; loader height→0 1.8 s power4.inOut; letters yPercent 120→0 in random order, 1.8 s power4.inOut, stagger .07; sessionStorage skip on repeat visits
noth: work tile reveals and cursor badge — .awards/research/noth/main.js — clip-path power4.inOut 1 s at top 88%; tile y scrub 1.5, image yPercent −5→−20 scrub 3; badge lerp .09, back.out(1.8) in, .38 s power3.in out
noth: showreel shrink — .awards/research/noth/main.js — width and height 100%→33.3%×35%, power4.inOut, scrub 3 (animates layout properties)
noth: gsap@3.13.0 (ScrollTrigger, Flip, SplitText) — .awards/research/noth/main.js
noth: lenis@1.2.3 — .awards/research/noth/main.js
noth: three@r184 — .awards/research/noth/main.js
noth: @unseenco/taxi@unknown — .awards/research/noth/main.js
noth: webflow (+ jquery@3.5.1) — .awards/research/noth/index.html
noth: vite ESM engine injected from nothinv1.netlify.app — .awards/research/noth/index.html
gehry-getty: narrated chapter score (the architect's voice + one orchestral recording per chapter, consent on first click, state shown in the header) — entry.f152f914.js (`window.Howler`), desktop-s00.png, desktop-s100.png (credits for intro, ch. I–III, index) — Howler, 5 cues; levels and crossfades unread
gehry-getty: explorable glTF model with hotspots — index.html modulepreloads (InteractiveScene, Hotspot, orbit, gltf-loader, three-vector-spring), desktop-s25.png "[EXPLORE THE MODEL]" — Three r153; spring constants unread; render not captured
gehry-getty: parallel accessible-version route — index.html (`<a href="/accessibility" aria-label="Click to open accessible version">`, first in header), entry.f152f914.js (route layout `accessible`) — route not visited
gehry-getty: scroll-scrubbed intro/outro films with per-viewport encodes — manifest.json failedRequests — intro-scrub.mp4 / intro-scrub-mobile.mp4, outro-scrub-mobile.mp4, 720p desktop chapter films + recap.mp4 per chapter
gehry-getty: shared scrubbed ScrollTrigger factory — useBaseScrollTrigger.f0aaf192.js — `scrub` defaults to true
gehry-getty: chapter-hue floods — entry.d6ab82be.css — 4 `--getty-*` tokens as whole-section grounds, blurred band where the ground meets full-bleed film
gehry-getty: stretched full-width titles + single drop-cap letters — index.html (5 × titleStretch), desktop-s50/s75/s100 — Sharp Grotesk Black width cuts 15/20
gehry-getty: easing vocabulary — entry.f152f914.js — none ×4, power3.out ×2, power2.inOut ×2, expo.out, power4.inOut, power3.in, sine.out; durations 1.8 / .9 / .5 s
gehry-getty: nuxt@3.6.5 — entry.f152f914.js
gehry-getty: vue@3.3.4 — entry.f152f914.js
gehry-getty: gsap@3.12.1 (ScrollTrigger, SplitText, Observer) — entry.f152f914.js
gehry-getty: lenis@1.0.19 — entry.f152f914.js (`window.lenisVersion`)
gehry-getty: three@r153 — entry.f152f914.js (revision const "153")
gehry-getty: howler@unread — entry.f152f914.js
gehry-getty: storyblok@unread (CMS) — index.html (`/storyblok/cache/`, StoryblokPage chunk)
gehry-getty: tweakpane@unread (debug, `USE_TWEAKPANE:false`) — entry.f152f914.js, index.html
alectear: wall entry stagger — 3.C9ieEV_B.js — Motion One, opacity 0→1 (.2s) + scale .97→1, .6s, cubic-bezier(.03,.71,.31,1), stagger .025s masonry / .045s grid from .1s, ease-in distribution
alectear: discipline page swap — 3.C9ieEV_B.js — translateX(±10%)→0, .8s, cubic-bezier(.03,.71,.31,1)
alectear: switch dock-to-centre handoff — 0.D4RnQfjg.css — small copy out: opacity 0 + scale 1.75 (2.1 ≥1200px); large copy in from scale .5; .4s cubic-bezier(.06,.58,.3,1); dock `bottom` .7s; main margin-bottom 85lvh stage
alectear: cursor project label — 0.BQ4Kx_FL.js, math.DC-7jTd4.js — rAF lerp .3 per frame, not mounted on touch; pill scale 0→1 .15s
alectear: hover colourway swap — 3.DM_-IHou.css, desktop-hover-tile.png — hover image opacity + scale 1.025→1 .5s; tile scale .98, image 1.015, active .965, .15s
alectear: blurhash placeholders — Blurhash.C0Hu4wWR.js, Image.DV95X1Wa.js — 32×32 canvas-2D decode, IO threshold .05, img fade .5s
alectear: pill press — Pill.DjXv5gIp.css — hover padding-bottom +2px .15s, active snaps back 0s; backdrop blur 10px (16px ≥900px)
alectear: sveltekit@unknown — index.html (`/_app/immutable/`)
alectear: svelte@5 — disclose-version.BDyRb4x3.js (`const T="5"`)
alectear: motion-one@unknown — Blurhash.C0Hu4wWR.js (`"motion-one"`, `--motion-`)
grids-obys: Grid overlay toggle — .awards/research/grids-obys/states/desktop-state-grid-on.png — 8 translucent grey columns, gutters about 14 px, over the whole page including content; widget named "Grid trigger" in index.html
grids-obys: Alternate world mode — states/desktop-state-crazy-on.png + index.html — ground floods yellow, script flourishes over the wordmark; shapes loop 3 s `swing`, dx up to 1814 px, rotate up to 1080°
grids-obys: Loader rule that becomes chrome — desktop-s00.png, desktop-rm-s00.png — header rule grows as the progress bar (about 340 px at 20, about 860 px at 70) and stays as the nav baseline; square turns 90° per step, 0.8 s after a 1.2 s delay, ease-out then ease-both
grids-obys: Scripted arrival — index.html animation JSON — delay 3.8 s, duration 0.6 s, dy -224 px, -7° → 0°, so a hold of about 4 s on every visit
grids-obys: Scroll-keyed quarter-turn shapes — index.html animation JSON — start_point bottom, delay_px 1174 / 1730, dx 70–302, dy -241, rotations 90 / 180 / 270°, ease-out in and ease-in out; separate tilt to -7° over 330 px with dy 300
grids-obys: Continuous multi-route scroll — manifest.json GA dl/dr pairs — / → /columns_vandegraaf/ → /booksandcredits/ inside one native scroll, `rel="next"` chain
grids-obys: Portrait phone gate — mobile-s00.png to mobile-s100.png — a rotate-your-device prompt with a black rectangle turning in steps; no portrait content
grids-obys: Readymag@build 5636cb37 (no public version) — index.html (`meta generator="Readymag"`, st-p.rmcdn1.net/5636cb37 modulepreloads)
grids-obys: Readymag widget animation engine — index.html (`"animation"` arrays with scroll/load/click step types)
grids-obys: Google Fonts Mr Bedfort + uploaded custom face custom_40538 "Grids" — index.html font list
grids-obys: GTM + GA4 — manifest.json failed requests
grids-obys: No GSAP / Lenis / Three.js / OGL / anime.js / Barba / Swup signature — index.html
bethebuzz: cloth ground shader — .awards/research/bethebuzz/src/layout-eba535b6a27a0e57.js — plane 1.1× viewport, 128×128 segments; value noise with UVs rotated 20°, fold factor 4, speed (.75, 2.25), z clamped .4–1.0; 256 px trail texture, radius .25, maxAge 800 ms, displacement .1 per axis clamped ±.6, mouse lerp .1, velocity ×5; shading mixes shadow .9 and light 1.1 by elevation; dpr [1,2], fov 55
bethebuzz: GPU tier gate + CSS fallback — .awards/research/bethebuzz/src/layout-eba535b6a27a0e57.js, 4963-6917835f6018295e.js — canvas only when detect-gpu tier ≥ 1, otherwise a CSS gradient plus orange/pink/red/violet blob divs
bethebuzz: knockout SVG-mask headline — .awards/research/bethebuzz/index.html, src/*.css — `<mask id="hole">` white rect with the letter paths cut out, viewBox 0 0 1169 334, height clamp(100px,23vw,600px); flanking `.js-transparent-bg` panels, box-shadow dropped under 1200 px
bethebuzz: scroll-drawn stair line with follower → badge — .awards/research/bethebuzz/src/2135-26c8682fcf448083.js — pin, scrub 1, ≥ 1025 px; DrawSVG 0%→100% plus MotionPath follower, linear 1.5; circle scales 7× and moves yPercent −200 (power2); stars rotate in from −210° / 192°, stagger .05; timed 5 s play below 1025 px
bethebuzz: headline reveals — .awards/research/bethebuzz/src/2135-26c8682fcf448083.js — letterSpacing 5vw→0 over 1.66 s power2.inOut; SplitText chars rotateX→0, stagger .03, 1.33 s; words expo.out, stagger .05, 1.33 s
bethebuzz: cloth-filled nav text — .awards/research/bethebuzz/src/*.css — background-clip:text with /static-bg.webp, transition 1.2 s cubic-bezier(.16,1,.3,1)
bethebuzz: button hover CustomEase — .awards/research/bethebuzz/src/layout-eba535b6a27a0e57.js — "M0,0 C0.263,0 0.206,0.627 0.502,0.864 0.646,0.979 0.704,1 1,1"
bethebuzz: next@14.2.35 — .awards/research/bethebuzz/src/2117-6eef2c878a59e343.js
bethebuzz: three@r162 — .awards/research/bethebuzz/src/b536a0f1-ee8816be2e5aa89a.js
bethebuzz: @react-three/fiber@unknown — .awards/research/bethebuzz/src/4963-6917835f6018295e.js
bethebuzz: three-custom-shader-material@unknown — .awards/research/bethebuzz/src/layout-eba535b6a27a0e57.js
bethebuzz: detect-gpu@5.0.38 — .awards/research/bethebuzz/src/4963-6917835f6018295e.js
bethebuzz: gsap@3.14.2 (ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, CustomEase) — .awards/research/bethebuzz/src/4176-dc118922d6381401.js, 2227-72ab17f5fd00b372.js
bethebuzz: lenis@1.0.35 (@studio-freight/react-lenis) — .awards/research/bethebuzz/src/7227-52ca862f3c1d5222.js
bethebuzz: prismic@unknown — .awards/research/bethebuzz/index.html
bethebuzz: swiper@unknown — .awards/research/bethebuzz/src/ce8676dfb5a8255d.css

### Notes
