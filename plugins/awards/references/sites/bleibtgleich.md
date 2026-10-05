# bleibtgleich — https://bleibtgleich.dev/

| Field | Value |
|---|---|
| Class | portfolio (one designer-developer, Kyiv) |
| Visitor mode | experience |
| Awards | Self-declared in the page's JSON-LD: Awwwards SOTD, Developer Award and Portfolio Honors 2025, CSSDA WOTD 2025, CSS Winner SOTD 2025, GSAP SOTD 2025, Awwwards Typography Honor 2024 [verified, index.html JSON-LD — self-declared, no entry page read]. No published axis scores read [unknown] |
| Corpus rating | D 7.5 / U 6.4 / C 7.4 / Co 6.9 → weighted 7.09, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Solo: Maksym Bleibtgleich, designer and developer; "Working w/ TFTL" in the hero meta [verified, index.html JSON-LD + desktop-s00.png] |
| Stack (evidence level) | **Webflow** (generator meta, `data-wf-*`, webflow.js, jQuery 3.5.1) [verified, index.html] · site logic is one ES module on **Slater** (`assets.slater.app/slater/20419/62015.js`, 98 KB) [verified, slater.js → main.js] · **GSAP 3.15.0** from Webflow's CDN: core, MorphSVGPlugin, ScrollTrigger, SplitText, CustomEase, Draggable, InertiaPlugin [verified, index.html script srcs] · **Lenis 1.3.21** + lenis.css [verified, index.html] · **@barba/core** unversioned from unpkg [verified, index.html] · **three 0.128.0** from jsDelivr [verified, index.html] · raw WebGL for one fluid reveal [verified, main.js] · socket.io 4.5.4 for shared cursors [verified, index.html] · `web-haptics` ESM [verified, index.html] · GA4 [verified, index.html] |
| Palette | Achromatic ground: white page, black ink, black at 50 / 30 / 10 / 5 % for secondary text and rules [verified, site.css tokens]. Five visitor-chosen theme grounds swapped by a liquid WebGL wipe, stored per session [verified, main.js `initThemeMode`]. Strategy: two tokens, with ground hue handed to the visitor |
| Type | One family, **Akzidenz Grotesk Pro**, 400 and 500, self-hosted WOFF2 [verified, site.css @font-face]; display and body share it. H1 `90rem / 14.4`, line-height 88 %, tracking −.309rem; H2 40 / 14.4 at 80 %; P1 14 / 14.4 [verified, site.css :root] |
| WebGL dosage | moments — 3 canvases on desktop: a fixed theme-wipe quad, a three.js image globe, a raw-WebGL fluid reveal (off below 992 px); 2 on mobile [verified, manifest.json + main.js] |
| Scroll model | native + Lenis 1.3.21 on the GSAP ticker (`duration 1.2`, expo-out, `touchMultiplier 2`, `lagSmoothing(0)`); no pins [verified, main.js; manifest scrollMode native] |
| Narrative model | gallery — hero → statement → work globe → awards table → manifesto → contact clock and footer wordmark |

## 1. Concept and narrative
The site argues that type is a material that has to condense before it can be read. Every headline arrives as an ink blob that tightens into letters, so the whole page reads as a sequence of things setting rather than sliding in [verified, desktop-s25.png, desktop-s100.png, main.js]. The beats across the five states: a Swiss poster hero with the name set large against a hairline column rule; a three-line statement about execution; a work section where project tiles hang on a dome above two flanking labels; a blurred-in awards ledger; a closing sentence-length manifesto and a contact block above a giant split wordmark [verified, desktop-s00 … s100.png]. Register: terse, deadpan, a little hostile — the footer signs off "made w/ hate" [verified, mobile-s100.png].

## 2. Structure and components
- **Preloader**: a black column grows to full height over 4 s while a counter runs 0 → 100 % over 2 s, both on the `InOut` ease; nav and menu then slide in from 5 vw off-corner (25 vw on phones) [verified, main.js `initPreloader`]. State lives on `window`, so it is skipped across Barba routes but replays on every full load [verified, main.js].
- **Sticky split wordmark**: the name sits in two grey halves in the bottom corners throughout and resolves into one dark wordmark at the end [verified, desktop-s00.png, desktop-s100.png].
- **Menu pill** top right, a dev-grid toggle square top left [verified, desktop-s00.png; `initDevGrid` in main.js].
- **Work globe**: project images on a Fibonacci sphere in three.js, back faces UV-flipped so the image reads from inside; cards/globe filter tabs [verified, main.js `_initGlobeReal`, `initFilterTabs`; desktop-s50.png].
- **Works intro mask**: an even-odd polygon `clip-path` hole scrubbed open while the two flanking labels part ±50 vw [verified, main.js `initWorksIntroMask`].
- **Orbit tiles** carousel, **awards ledger** with certificate pop-ups on hover (clip from below, scale .9 → 1, .4 s), **tilt cards** (±25° / ±40°), **contact dial** (drag to rotate), **footer clock** [verified, main.js; mobile-s100.png].
- **Shared cursors**: other visitors' pointers drawn live with a chat bubble, over socket.io to a Railway host [verified, main.js `initCursorTracker`]; the endpoint failed in capture [verified, manifest.json].
- **Totem**: a 2 s spin-and-scale flourish when a theme is chosen [verified, main.js `initTotemActivation`].
- An infinite-canvas archive route with WASD / arrow navigation exists in the bundle; not visited [verified, main.js].

## 3. Visual language
White ground, black ink, mid-grey for the parked wordmark; colour is opt-in through the theme switch [verified, site.css + main.js]. Theme ground hexes, for the record only:
`#ffffff` base [verified, main.js theme map]
`#bec1ca` concrete [verified hex, main.js theme map; name inferred from site.css token names]
`#FF633D` rust [verified hex, main.js theme map; name inferred from site.css token names]
`#919E44` verdigris [verified hex, main.js theme map; name inferred from site.css token names]
`#D5312F` blood [verified hex, main.js theme map; name inferred from site.css token names]
Type is one grotesque in two weights at tight leading (80–88 %) and negative tracking, with a single hairline vertical rule that the hero and statement hang from [verified, site.css + desktop-s00.png]. Imagery is project screenshots only. The favicon switches with the theme [verified, main.js].

## 4. Motion and effects (with parameters)
- **Durations** as named tokens: `durXS .2`, `durS .4`, `durM .8`, `durL 1.2`, `stagger .1`, `delayReveal .2` [verified, main.js].
- **Goo text reveal** (the signature): see the lens below.
- **Div reveal**: opacity 0 → 1 and `blur(20px)` → 0 over 1.2 s `power2.out` [verified, main.js `animateDivReveal`].
- **Page transition**: Barba `sync: true`; old page `blur(0 → 24px)` and fade over .8 s `InOut`, new page the reverse; reduced motion swaps to a cut [verified, main.js].
- **Theme wipe**: fullscreen ortho quad, `uProgress`, `uCenter`, `uColor`, `uAspect`, `uTime`, hash noise edge; DPR capped at 2 [verified, main.js].
- **Globe**: perspective 48°, DPR ≤ 2, anisotropy ≤ 4, mipmapped, lazy via IntersectionObserver at a 50 % root margin [verified, main.js].
- **Tilt**: `quickTo` rotationX / Y, .6 s `power3.out`, perspective 1000 [verified, main.js].

## 5. Tech and pipeline
Webflow hosts the markup and CSS; all behaviour is one hand-written module served by Slater rather than Webflow Interactions [verified, index.html + main.js]. Libraries come from three CDNs with no bundling. three r128 is old enough that its stack note will not match [verified version; note mismatch inferred]. Fetched weights: main.js 98 108 B, site CSS 124 336 B [verified, content-length]. Every WebGL renderer caps DPR at 2 and the fluid reveal opts out under 992 px [verified, main.js]. Desktop CLS 0.165 [verified, manifest.json; headless].

### Tech lens: GSAP
GSAP is the only animation engine; Lenis rides its ticker and Barba hands it the containers [verified, main.js].
- **Plugins**: `gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger, SplitText, CustomEase, Draggable, InertiaPlugin)`, all 3.15.0 from `cdn.prod.website-files.com/gsap/3.15.0/` [verified, index.html]. Inertia is loaded and registered but the only Draggable sets `inertia: false` [verified, main.js].
- **Volume**: 14 `gsap.timeline`, 41 `gsap.to`, 3 `fromTo`, 0 `from`, 77 `gsap.set`, 8 `delayedCall`, 0 `addLabel`, 0 `addPause`, 3 `quickTo`, 25 `killTweensOf`, no `gsap.context` [verified, main.js]. Timelines are flat and local to one moment (transition, menu, orbit cycle, scrubbed widths) with no master [inferred, minified structure].
- **CustomEase.create**: `InOut "0.76,0,0.24,1"`, `Out "0.25,1,0.5,1"`, `In "0.5,0,0.75,0"`, `ease "0.25,0.1,0.25,1"`, `Write "0.333,0,0.667,1"`, `osmo "0.625,0.05,0,1"` [verified, main.js]. Uses: `Out` 25, `InOut` 20, `none` 11, `In` 6, `power2/3` 6, `osmo` 1 [verified, main.js].
- **Per-line SVG goo reveal**: `new SplitText(el, {type: 'lines'})`; each line gets its own `<filter>` (x/y −25 %, 150 % box, sRGB) = `feGaussianBlur stdDeviation 50` → `feColorMatrix` alpha row `20 −8`. Reveal tweens `attr: {stdDeviation: 0}` over `durL` 1.2 s `Out`, lines at `i × .1`; a proxy `{amp 20 → 1, off −8 → 0}` over `.35 × durL` on `none` writes the matrix in `onUpdate`, placed at `">-.42"` so the threshold relaxes in the blur's tail; `onComplete` clears the filter [verified, main.js `animateTextReveal`]. Hide reverses: matrix back to 20 / −8 over `.3 × durS`, blur to 50 over `durS` `In`, lines at `i × .05` [verified, main.js]. No `mask`, no `autoSplit`, no `document.fonts` wait [verified absent, main.js].
- **ScrollTrigger**: 8 `create` + 3 inline configs [verified, main.js]: reveals `start 'top bottom', once` (text, clip, div) and `'top 88%'` / `'top 90%'`; works intro `trigger, 'center center' → 'top top', scrub: true` writing a polygon hole; outro `'top bottom' → 'bottom bottom', scrub`; orbit `'top bottom' → 'bottom top'` with `onToggle` play / pause; featured heading `'top 75%' → 'bottom 25%', scrub` width out-and-back. **No `pin`, no `snap`, no `toggleActions`** [verified absent, main.js].
- **Orbit tiles**: each item owns a `{progress}` proxy; a paused timeline tweens every proxy `+1` over 2.5 s on `osmo`, staggered `.03 × 2.5`; `onUpdate` maps angle to `x = sin × w`, `y = cos × .04w`, `scale .2 → 1`, `blur(1px → 0) brightness(.3 → 1)` by `((cos + 1) / 2)^1.3`; list rotates 360° per 24 s and items counter-rotate [verified, main.js `initOrbitTiles`].
- **MorphSVG**: logo path starts as the rectangle `M0 0 L95 0 L95 160 L0 160 Z`, its wrapper opens `inset(0 0 100% 0) → 0` over .8 s `Out`, then `morphSVG` to the stored mark over 1.2 s `Out` [verified, main.js `initLogoMorph`].
- **Draggable dial**: `type: 'rotation'`, `bounds {minRotation 0, maxRotation n}`, a second element follows at a mapped ratio; release springs to 0 over .8 s `Out`; desktop only via `gsap.matchMedia('(min-width: 992px)')` [verified, main.js `initContactDial`].
- **Lenis**: `new Lenis({duration 1.2, smoothWheel, touchMultiplier 2, easing 1.001 − 2^(−10t)})`, driven from `gsap.ticker.add`, `lagSmoothing(0)`, rebuilt on each Barba entry [verified, main.js].
- **matchMedia / reduced motion**: 7 `window.matchMedia('(max-width: 991px)')`, 5 `gsap.matchMedia()`, one coarse-pointer query; `prefers-reduced-motion` is read once and branches only the page transition [verified, main.js]. No reveal, preloader or orbit has a reduced path [verified, main.js; desktop-rm-s00.png].
- No Flip, no Observer [verified absent, main.js].

## 6. Weaknesses
- **Reduced motion: fail.** The reduced-motion hero shows the name and headline as unreadable black blobs mid-goo, and the awards ledger still blurred at s75 [verified, desktop-rm-s00.png, desktop-rm-s75.png].
- **Keyboard: partial.** Key handlers exist only for the archive canvas and the cursor chat; the dial, globe and orbit are pointer-only [verified, main.js]. No skip link; `aria-current` is the only ARIA attribute in the served HTML [verified, index.html].
- **DOM behind the canvas: pass.** Text is real DOM; canvases are decoration and work imagery [verified, index.html].
- **Load gate: fail on repeat.** ≈ 2 s counter and a 4 s column on every full load; no storage skip [verified, main.js].
- **The phone: partial.** The hero is designed, but the first phone frame is still the preloader and the fluid reveal is simply removed [verified, mobile-s00.png, main.js].
- **Wayfinding and conversion: pass.** Email and three socials in a clear close [verified, mobile-s100.png].
- **Content defects**: `og:url` ships a placeholder Cyrillic domain [verified, index.html]; the shared-cursor socket errors on every frame when the host is down [verified, manifest.json].

What the awards skills do differently: resolve every text filter to its final state under reduced motion before first paint, store the preloader as seen in `sessionStorage`, give the dial and globe a keyboard twin, and fail a realtime layer silently after one retry.

## 7. Principles
1. One reveal verb, applied to every line of type, is a stronger identity than a catalogue of effects.
2. Animate a threshold, not an opacity: a blur plus a steep alpha curve makes text condense rather than fade.
3. Let a reveal's last phase overlap its first's tail so the hand-off has no visible seam.
4. A monochrome base earns the right to hand colour to the visitor as a choice.
5. Name durations and curves as tokens once; every tween then shares a tempo.

## 8. Take / Don't take
- **Take:** the per-line blur-plus-alpha-threshold reveal with the threshold relaxing in the last third of the blur; duration tokens on a 1 : 2 : 3 ladder; proxy-progress tweens for carousel items so one ease drives position, scale and depth together; a rotation dial that springs home; a polygon `clip-path` hole scrubbed open as a section door.
- **Don't take:** the goo reveal as the signature as-is, the split corner wordmark, the hairline-column Swiss hero, the theme set or its hexes listed in §3 (`#FF633D` rust [verified, main.js] and `#D5312F` blood [verified, main.js] included), the copy register, the work-on-a-dome layout, and the shared-cursor layer.

## 9. Confidence and sources
Header, stack and motion parameters high (literal values from main.js, index.html, site.css) · structure high from captures · awards medium (self-declared JSON-LD; no entry page read) · rating inferred · narrative order verified from five desktop states.

**Live pass 2026-10-05: reachable; robots.txt `Allow: /`, no AI-usage file (404); capture exit 2 (failed socket.io and GA requests only), native scroll, all states reached by scroll. Sources: https://bleibtgleich.dev/ (index.html), Webflow shared CSS, Slater loader + module `20419/62015.js` (main.js), manifest.json, 15 captures.** LCP figures are headless cold-cache artefacts, not a performance claim.
