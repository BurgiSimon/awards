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
| upkeep | done | grader slugs regenerated (21); validate passes; lint 0 dangling; count greps clean; smoke evals pending maintainer |

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
