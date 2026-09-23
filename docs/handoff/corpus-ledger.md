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

### Notes
