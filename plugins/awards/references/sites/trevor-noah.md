# Trevor Noah — https://www.trevornoah.com/

| Field | Value |
|---|---|
| Class | brand (personal-brand / talent hub: tour, podcast, books, specials, foundation) [verified, index.html routes + desktop-s100.png footer index] |
| Visitor mode | experience → persuade — the only persistent CTA is a "Get Tickets" pill [verified, desktop-s25.png + index.html] |
| Awards | Site of the Day 3 Sep 2026, overall 7.45 = D 7.38 / U 7.32 / C 7.78 / Co 7.40 [verified, Awwwards entry read 2026-09-18]; DEV AWARD 7.23 = Semantics-SEO 7.40 / Animations-Transitions 7.40 / Accessibility 6.80 / WPO 6.80 / Responsive 7.60 / Markup-Metadata 7.20 [verified, same]; community score 9.13 [verified, same] |
| Studio / credits | OFF+BRAND (PRO submitter on the entry) [verified, Awwwards entry read 2026-09-18]; individual designers/developers [unknown] |
| Stack (evidence level) | Webflow shell (`data-wf-site`, `w-*` classes, jQuery 3.5.1, Webflow CMS) + a separately hosted ESM engine on `trevor-nine.vercel.app` (`app.js` → `chunk-022tjzda.js`) [verified, index.html + app.js]; GSAP 3.14.2 with ScrollTrigger, SplitText, Flip, Observer, CustomEase [verified, chunk-022tjzda.js]; Locomotive Scroll 5.0.0 riding Lenis 1.3.17 [verified, same]; Three.js r183 with GLTFLoader + DRACOLoader + KTX2Loader [verified, same]; `@unseenco/taxi` page transitions [verified, `data-taxi` / `data-taxi-view` in index.html and the `X-Requested-With: Taxi` fetch in the chunk]; self-hosted woff2 off the Webflow CDN [verified, index.html] |
| Palette | ground `--color-background #1d2440`; accent `--color-accent #ff9bb4`; paper `--color-surface #f9fcf4` (a green-cast off-white, not white); `--color-dark #2b2b2b` for one section; per-section override `--color-accent #e36625`; `--color-heart #c6313e`; pills `#46517b` on `#615e83` [all verified, main.css]. `theme-color` `#1d2440` [verified, index.html]. Awwwards lists the palette as two colours; the token set is larger [verified, Awwwards entry] |
| Type | one family, three cuts: `--font-primary "Die Grotesk C"` (400/500/700 + 500 italic, body and UI), `--font-secondary "Die Grotesk D"` (500/700, h1–h3, menu, marquee, "large"), `--font-tertiary "Die Grotesk B"` (700, pills) [verified, wf-shared.css @font-face + main.css tokens]. Display scale `--font-size-h1: clamp(10.625rem, 5.99061rem + 18.4453vw, 28.125rem)` = 170px → 450px; h2 40px → 126px; body 18px → 20px [verified, main.css] |
| WebGL dosage | canvas-first — one persistent full-page `canvas.webgl_canvas` outside `<main>`, carrying the hero head carousel, the `gl-nav` and a footer tour head [verified, index.html + chunk-022tjzda.js] |
| Scroll model | native + smooth library (Locomotive 5 / Lenis; `scrollMode: native` in all three capture passes) [verified, manifest.json + chunk-022tjzda.js] |
| Narrative model | collage → index: a mind spilling objects, resolving into a numbered CMS-driven hub [verified, desktop-s00/25/100.png] |

## 1. Concept and narrative
The agency's stated idea puts the subject's mind at the centre: snapshots into his mind, "a living collage where fragmented thoughts evolve into fully formed ideas" [verified quote, agency case study]. The homepage takes that literally: a cut-out photographic head with the crown torn off, and 3D objects — microphone, brain, cloud, book, video player, heart — rising out of the opening [verified, desktop-s00.png; glb names `TREVOR_head-opt-04.glb`, `TREVOR_brain-opt-01.glb`, `TREVOR_mic-opt-01.glb`, `TREVOR_book-opt-21.glb`, `TREVOR_player-opt-24.glb`, `TREVOR_heart-opt-01.glb`, `TREVOR_cloud-opt-01.glb`, plus earth, leaves, mug, quote, rocks and a page in chunk-022tjzda.js]. The entry's own line: "An immersive digital home for Trevor Noah, uniting his stand-up, podcast, books and world tour in one interactive experience built to explore." [verified quote, Awwwards entry read 2026-09-18].

Beats across the capture set: hero head + giant pink wordmark → a photo-card collage with a "View All Media" pill → a dark-grey about panel with a cut-out hand and a "Read More" pill → a torn-paper seam into a pink-and-white pull-quote → a numbered footer index [verified, desktop-s00/25/50/75/100.png].

## 2. Structure and components
- Routes [verified from indexed URLs]: `/` hub, `/about`, `/shows` with per-city show pages, `/watch-listen`, `/video-gallery`, `/books/<title>`, outbound foundation link.
- Modules declared in markup: `intro`, `preloader`, `hero-carousel`, `gl-nav`, `card`, `split`, `modal`, `widget`, `hover-float`, `fixed-progress` [verified, `data-module` attributes in index.html].
- Preloader: `.preloader_wrap` with `.preloader_percentage` — a counting gate [verified, index.html].
- Nav: a two-item bar (hamburger + "Get Tickets" pill), the menu itself a `.menu_wrap.u-modal` overlay [verified, index.html + desktop-s25.png].
- Hero is a carousel, not a static scene: `[data-hero-carousel-viewport]` with a `[data-hero-carousel-progress]` ring, arrows on phone, and a torn-paper label pill under the head naming the destination [verified, index.html + mobile-s00.png].
- Marquee ticker `.widget_marquee_track` with a pink "Latest" pill riding it [verified, index.html + mobile-s00.png].
- Footer: a numbered index — 01 Shows, 02 Watch & Listen, 03 Books, 04 About, 05 St… — beside a cut-out head with a speech bubble reading "Leaving so soon?" [verified, desktop-s100.png].
- `.skip_link` present [verified, index.html]. Cookie consent banner appears after first paint and is still open at every later scroll state [verified, desktop-s25/50/75/100.png].

## 3. Visual language
Pink on navy refuses the black-and-neon "comedy special" register: warm, pop, slightly nostalgic, photo-friendly and high-contrast. The paper token is `#f9fcf4`, a faintly green off-white, which keeps the "cut from a magazine" feel that pure white would lose [verified, main.css]. The material language is physical throughout: torn paper edges as section seams, cut-out photography with a white deckle border, and photo cards whose corner is peeled back [verified, desktop-s25/75/100.png].

Type is one characterful grotesque in three width cuts rather than a display/neutral pair: Die Grotesk D for headings and the wordmark, C for body, B for pills [verified, main.css]. h1 runs to 450px at the top of the clamp, so the wordmark is architecture, not a logo [verified, main.css + mobile-s00.png]. Grid is 12 columns dropping to 8/6/4, gutter `clamp(10px, 10px + 30*(100vw - 402px)/1518, 40px)`, spacing unit `0.25rem` with a fluid `sm…4xl` ramp [verified, main.css].

## 4. Motion and effects (with parameters)
- Global GSAP defaults: `{ ease: "expo.out", duration: 0.25 }` [verified, chunk-022tjzda.js].
- Four registered CustomEases: `custom.ease` `M0,0 C0.645,0 0,1 1,1`; `custom.easeCustom` `C0.215,0.61 0.355,1 1,1`; `custom.easeBounceSmooth` `C0.5,1.8 0.62,1 1,1`; `custom.easeBounceSoft` `C0.4,1.65 0.3,1 1,1` [verified, chunk-022tjzda.js]. A parallel CSS ease token set mirrors them (`--ease-bounce-smooth: cubic-bezier(.5,1.8,.62,1)`) [verified, main.css].
- **Card peel — DOM and SVG, not WebGL.** A `card-peel-inner` wrapper with generated `<path class="cp-curl">` and `<path class="cp-shadow">` geometry built from arc commands, constants `SIN225 = sin(π/8)` and `COS45 = cos(π/4)`. Defaults: `borderRadius 20`, `curledRadius 12`, `foldRest 8`, `foldHover 55`, `duration 500`ms, `corners: ["br"]` from a valid set of `tl tr bl br`. It runs its own `requestAnimationFrame` interpolation, and in `scrollPeel` mode the fold amount is read from scroll each frame instead of from hover [verified, chunk-022tjzda.js; `data-scroll-peel` on five elements in index.html].
- Hero objects idle: hovering an object fires `webgl:hero-hover-enter`; on leave a 2000 ms timer replays a "mexican wave" timeline across the object set, and the whole behaviour is disabled below the 479px breakpoint [verified, chunk-022tjzda.js].
- The wordmark is an inline SVG `#animatedLogo` driven by Locomotive progress (`data-scroll-css-progress`, `data-scroll-offset="110%, -20%"`) [verified, index.html].
- Scroll bindings: 50 `data-scroll` elements, 9 progress-driven, parallax `data-scroll-speed` of ±0.05, offsets mostly `15%` [verified, index.html].
- Reduced motion is branched, not bolted on: a `matchMedia("(prefers-reduced-motion: reduce)")` module with a live change handler, a `to/from/fromTo` wrapper that degrades every tween to `gsap.set`, and a split-text reveal that returns before splitting [verified, chunk-022tjzda.js].
- Quality tier: `pixelRatio = Math.min(devicePixelRatio, width >= mobile ? 1.5 : 2)` — desktop capped at 1.5, phone at 2 [verified, chunk-022tjzda.js].
- Sound: none observed [unknown].

## 5. Tech and pipeline
The Webflow page ships the markup, CMS content and fonts; everything expressive comes from a single ESM app on a separate host, which the page loads as `app.js` (8.4 KB) pulling one `chunk-022tjzda.js` (1.3 MB, Three.js + GSAP + Lenis + Taxi inlined) [verified, fetched sizes]. The app boots fonts through the CSS Font Loading API with a timeout, sets a `FONTS_LOADED` class, initialises viewport → scroll → pages → responsive images, then dispatches `app:ready`; it also auto-fills `sizes="auto, 100vw"` on lazy `srcset` images via a MutationObserver [verified, app.js].

Asset pipeline: Draco-compressed glb (`-opt-NN` suffixes) plus KTX2 textures, including the book covers `born-a-crime-03.ktx2`, `into-the-uncut-grass-04.ktx2`, `born-a-crime-ya-edition-04.ktx2` and `eyes-scaled-02.ktx2` [verified, chunk-022tjzda.js]. Of 28 images, 22 are `loading="lazy"` and 15 carry `srcset` [verified, index.html]. Breakpoints `mobile 479 / tablet 991` [verified, chunk-022tjzda.js]. Real-world LCP and CLS [unknown] — the capture manifest's figures are a headless cold-cache artefact and are not a performance claim.

## 6. Weaknesses
- Design (7.38) and Usability (7.32) were the lowest of the four axes; Accessibility and WPO tie for the lowest developer sub-score at 6.80 [verified, Awwwards entry read 2026-09-18].
- At scroll 0 the reduced-motion frame shows the animated wordmark drawn only as far as its first letter and no "Get Tickets" CTA, while the standard frame at the same position shows more of the wordmark and the CTA; the two frames agree from 25% on [verified, desktop-rm-s00.png vs desktop-s00.png]. The intro's first viewport is the weak spot, not the scroll body.
- The WebGL canvas carries no `aria-hidden` and no fallback content — the document has zero `aria-hidden` attributes [verified, index.html]. The DOM behind it is real, though: `<main>`, two `<nav>`, a screen-reader-only `<h1>`, 34 `aria-label`s, 13 `role`s and `alt` on all 28 images [verified, index.html].
- The consent banner sits over the lower-right quadrant at every scroll state in the capture run and covers live content, including part of the pull-quote and the footer index [verified, desktop-s25/50/75/100.png].
- Two analytics beacons abort per pass; no console or page errors [verified, manifest.json].
- The awards skills keep the physical-material world but put the peel, the seams and the cut-outs where this site already puts them — in DOM and SVG — and keep the 3D budget for the one hero object.

## 7. Principles
1. Subordinate the technology to the subject; the effect is seasoning.
2. Make the metaphor the container: if the idea is "what is in his head", open the head and let the ventures be the objects inside it.
3. A physical material language (torn edges, deckle cut-outs, a peeled corner) can be cheaper in SVG than in shaders, and reads the same.
4. One characterful grotesque in several cuts can carry display, body and UI without a second family.
5. Let the commercial priority (tour) shape where the craft attention goes.
6. Structure sprawl as a numbered index, not a linear pitch — the footer can be the site map.

## 8. Take / Don't take
- **Take:** one persistent canvas holding a small cast of Draco+KTX2 objects around a single hero subject `[recipe:gl-hero-object-inertia]`; a DOM/SVG corner-peel driven by either hover or scroll progress, with the fold amount as the one animated scalar; a tiny ESM engine injected into a CMS shell so content stays editable `[pattern:webgl-architecture#dosage-ladder]`; `expo.out` at 0.25s as the global default with a named CustomEase set beside it `[pattern:motion-vocabulary#easing]`; a DPR clamp that is lower on desktop than on phone; collage → index structure `[pattern:narrative-structures#collage-index]`; a numbered footer that doubles as the site map; an idle "wave" that replays after a couple of seconds of no hover.
- **Don't take:** pink + navy, Die Grotesk, the torn-head hero, the peeled-Polaroid card as-is, the "snapshots of a mind" framing, the route set, the 170→450px wordmark clamp.

## 9. Confidence and sources
Awards, palette, type, stack, motion parameters and semantics high (read from fetched source and named captures) · concept high (agency's own words plus the hero capture) · components high · individual credits unknown · real-world performance unknown.

Live pass 2026-09-18: reachable, capture exit 0, scroll mode native, sources `index.html`, `app.js`, `chunk-022tjzda.js`, `main.css`, `wf-shared.css`, `wf-main.js`, `manifest.json`, `desktop-s00/25/50/75/100.png`, `mobile-s00…s100.png`, `desktop-rm-s00…s100.png`, Awwwards entry `awwwards.com/sites/trevor-noah`.
Earlier sources retained: itsoffbrand.com/our-work/trevor-noah (mirrored on omgrowth.ai); itsoffbrand.com/about-us; tympanus.net/codrops/2026/08/17 OFF+BRAND profile; webflow.com/customers/off-brand; trevornoah.com routes.
