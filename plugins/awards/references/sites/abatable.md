# Abatable — https://abatable.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

> Identity: Abatable sells procurement, advisory and market intelligence for carbon credits and other environmental assets, operated by Zero Imprint Ltd from London [verified, index.html `<title>`, meta description, `desktop-s100.png` footer].

| Field | Value |
|---|---|
| Class | B2B product (environmental-asset procurement platform with an advisory service) |
| Visitor mode | persuade — one conversion, "Talk to us", orange in the nav bar, repeated as "Contact us" in the footer [verified, `retry/desktop-s00.png`, `retry/desktop-s100.png`] |
| Awards | none looked up [unknown] |
| Corpus rating | D 7.0 / U 6.4 / C 6.6 / Co 7.2 → weighted 6.76, 2026-10-05 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | [unknown]. The custom code is served from `cdn.odyn.dev/staging/ttye/` [verified, index.html]; the house ease is registered as `"osmo"` [verified, bundle.js], which suggests the Osmo snippet library rather than a studio [inferred]. `initGlobalParallax` matches the helper on `[site:siteassist]` line for line [verified, bundle.js against that card §4] |
| Stack (evidence level) | Webflow (`data-wf-site`, `webflow.schunk.*.js`) [verified, index.html] · GSAP 3.15 core + ScrollTrigger, SplitText, CustomEase, Flip, DrawSVGPlugin from jsdelivr, and a second GSAP 3.15.0 core from Webflow's CDN [verified, index.html] · Lenis 1.3.17 [verified, index.html] · Barba 2.10.3 [verified, index.html] · Swiper 8, hls.js 1.6.11, Finsweet Attributes 2, jQuery 3.5.1 [verified, index.html] · 3D none · Bunny CDN video [verified, index.html] · HubSpot, Intellimize, ConsentPro, LinkedIn, Google Ads [verified, index.html, `manifest.json`] |
| Palette | `--swatch--light-50` ground |
| | #f5f6f3 [verified, webflow.shared.css] |
| | `--swatch--brand-abyss`, navy ink and dark chapters |
| | #002642 [verified, webflow.shared.css] |
| | `--swatch--brand-flame`, primary button |
| | #ff5c29 [verified, webflow.shared.css] |
| | `--swatch--brand-spark`, map glow and dark-theme background |
| | #c3ff44 [verified, webflow.shared.css] |
| | `--swatch--brand-grove`, contour lines and first fan card |
| | #566246 [verified, webflow.shared.css] |
| | `--swatch--brand-millpond`, pale blue card |
| | #b2dfff [verified, webflow.shared.css] |
| | `--swatch--brand-moana`, saturated blue card |
| | #0090f8 [verified, webflow.shared.css] |
| | `--swatch--brand-dunes`, secondary ground |
| | #dfe3d8 [verified, webflow.shared.css] |
| | Strategy: warm off-white ground + navy ink + one orange CTA; four brand hues kept for cards and map visuals [verified, captures] |
| Type | One grotesque, **PP Mori** (Medium, SemiBold and italics as Webflow-hosted woff2), fallback Arial [verified, webflow.shared.css `@font-face`, `--_typography---font--primary-family`]. Fluid scale between viewport tokens: display `clamp(2.5rem … 12rem)`, h1 2.5→5.25 rem, h2 2→4 rem [verified, webflow.shared.css] |
| WebGL dosage | none — 0 canvases; the manifest's `webgl:true` is browser capability only [verified, `manifest.json`]. The map visuals are looping MP4s [verified, index.html] |
| Scroll model | native + smooth library: Lenis `lerp:.1` on `gsap.ticker`, `lagSmoothing(0)`, `scrollMode:"native"` [verified, bundle.js, `manifest.json`]; one ScrollTrigger pin (card fan) |
| Narrative model | specification — claim, logos, a masked thesis, four capability steps, the platform, why-trust cards, proof, insights, CTA |

## 1. Concept and narrative
The one idea is *terrain as data*: topographic contour lines are the brand material, drawn on screen as the visitor scrolls, and the same contours reappear inside the dark map panels. The first viewport splits into four quadrants on hairlines with an orange crosshair at their meeting point [verified, `retry/desktop-s00.png`]. Top-left holds a field of contours with two heavy green strokes. Bottom-left holds the h1 in large PP Mori. The right column holds three chapter dots, and the hero's supporting sentence fills in word by word as you scroll [verified, bundle.js `initHomeHeroScroll`, `retry/desktop-s00.png`]. Beats seen across the states:
- a client logo row, then a statement revealed through a growing circle mask [verified, index.html `data-clip-hero`];
- four sticky capability steps (source, mitigate, manage, stay ahead), each beside a navy map video with a lime-ringed marker [verified, `retry/desktop-s25.png`, index.html];
- a "Meet the … Platform" video card on a darkened mountain photograph, framed by registration crosses [verified, `retry/desktop-s50.png`];
- a pinned fan of four tilted cards in grove, millpond, moana and abyss, then a navy stats band ("1.3bn") [verified, `retry/desktop-s75.png`];
- a navy footer with a large sitemap [verified, `retry/desktop-s100.png`].
The copy register is institutional and calm: "operating system for environmental markets" [verified, index.html h1].

## 2. Structure and components
- **Preloader:** a full-screen panel with a background image and the logo. It opens through `clipPath` polygon wipes and hands off to the hero lines and contours [verified, bundle.js `runPageOnceAnimation`]. It runs on every full load: no storage check [verified, bundle.js, no `sessionStorage`].
- **Nav:** a white bar inset from the edges with mega-menu dropdowns (Solutions, Resources), "Sign in" outlined, "Talk to us" in orange [verified, `retry/desktop-s00.png`]. The dropdown follows hover direction (enter delay 120 ms, leave 150 ms) [verified, bundle.js `initMegaNavDirectionalHover`]. It hides on scroll-down past 80 px and returns on scroll-up, desktop only [verified, bundle.js `initNavScrollBehaviour`]. On mobile it becomes a hamburger [verified, `mobile-s00.png`].
- **Hero chapter dots:** three anchor links (`#structured`, `#independent`, `#real-time`) whose `w--current` class follows the scrubbed hero timeline [verified, index.html, bundle.js].
- **Sticky steps:** the item nearest the viewport centre gets `data-sticky-steps-item-status="active"` from a raw scroll listener [verified, bundle.js `initStickyStepsBasic`].
- **Card fan:** pinned on ≥ 768 px; below that it is an ordinary vertical stack [verified, bundle.js `initTiltCards`, `mobile-s50.png`].
- **Stats:** a Swiper row with counters [verified, index.html `stat-slider_component`].
- **Testimonials:** a line-masked slider with prev / next, a counter and arrow keys [verified, bundle.js `initLineRevealTestimonials`].
- **Cursor:** a text-label cursor, shown on fine pointers only [verified, bundle.js `initDynamicTextCursor`].
- **Routes:** Barba slides the old page up 25vh under a dark veil while the new page rises from 100vh [verified, bundle.js].
- **Footer:** navy, with a six-column sitemap, the company address and a © year filled in by script [verified, `retry/desktop-s100.png`, bundle.js].
- **Consent:** a ConsentPro box covers the bottom right on desktop and most of the phone screen in every frame [verified, all captures].

## 3. Visual language
- **Grounds:** off-white for the long middle, navy for the stats band, the map panels and the footer. A mountain photograph behind a halftone dot screen frames the platform card [verified, captures].
- **Chrome as survey drawing:** hairline grids, corner ticks and small orange or navy registration crosses mark panel corners throughout [verified, `retry/desktop-s25/s50/s75.png`]. The crosshair is the hero's centre of gravity.
- **Type:** one face at two weights. Big tight display for claims, the same face at reading size; uppercase pale-blue column heads in the footer [verified, captures].
- **Colour discipline:** orange appears only on CTAs, crosses and map markers; lime only as a glow on navy; the four card hues only in the fan [verified, captures].
- **Browser surfaces:** no `theme-color` meta [verified, index.html].

## 4. Motion and effects (with parameters)
- **House ease:** `CustomEase.create("osmo", "0.625, 0.05, 0, 1")` set as `gsap.defaults({ ease: "osmo", duration: 0.6 })` [verified, bundle.js].
- **Preloader:** logo and panels wiped with `clipPath` polygons. Durations are 1.5 / 1.25 (`expo.out`) / 1.5 / 1.5 s; the background image scales from 1.125 over 3 s, linear [verified, bundle.js]. The first contour set draws over 5 s, `power3.out`; the nav drops from yPercent −125 over 1.5 s, `expo.out`; the h1 fades in per character at 0.03 s steps [verified, bundle.js]. The gate lasts about 3.25 s before the hero is uncovered [inferred, from timeline positions].
- **Hero scrub:** one timeline, `start:"clamp(top top)"`, `end:"bottom top"`, `scrub:true`, linear. The background scales to 1.125; a second contour set draws 0→100 %; the two supporting paragraphs reveal word by word; a third layer wipes in by clip-path [verified, bundle.js].
- **Reveals:** `[data-reveal-content]` components fire once at `top 80%`. Headings fade per character (stagger 0.03); paragraphs scale from 0.9 over 0.8 s at +0.4; buttons fade at +0.8. Mobile gets plain fades [verified, bundle.js `initRevealAnimations`].
- **Circle mask:** `clip-path: circle(progress × 150 % at 50 % 120 %)`, `scrub:1`, from `top 70%` to `center center` (mobile `top 95%` → `bottom 90%`) [verified, bundle.js `initCircleMaskHero`].
- **Card fan:** spread 4° per card. Each card has its own scrub window inside one pinned range [verified, bundle.js]; details in the lens.
- **Parallax:** attribute-driven yPercent 20 → −20, `scrub:true`, per-breakpoint disable [verified, bundle.js].
- **Pointer drift:** `quickTo` on x/y, duration 2, `power3`, up to 10 rem × strength; skipped on touch [verified, bundle.js `initMouseMove`].
- **Testimonials:** lines leave to yPercent −110 over 0.6 s, `power4.inOut`; incoming lines rise over 0.7 s; the image opens from `inset(50%)` [verified, bundle.js].
- **Route change:** 1.2 s on `CustomEase "parallax" 0.7, 0.05, 0.13, 1` [verified, bundle.js].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework / CMS | Webflow + Finsweet Attributes | [verified, index.html] |
| Motion | GSAP 3.15 (ScrollTrigger, SplitText, CustomEase, Flip, DrawSVG) | [verified, index.html, bundle.js] |
| Scroll | Lenis 1.3.17 on `gsap.ticker` | [verified, bundle.js] |
| Routes | Barba 2.10.3, `sync:true`, `debug:true` | [verified, bundle.js] |
| Custom code | one unminified 353 KB IIFE from Odyn's staging CDN, plus a live-reload WebSocket client | [verified, bundle.js] |
| Video | four autoplay map MP4s, ≈ 2.3 / 5.2 / 8.2 / 13.5 MB, paused off-screen by an IntersectionObserver but `src` set in markup | [verified, `curl -sI`, index.html, bundle.js] |

- **Page weight:** 1,930 DOM nodes on desktop; CLS 0.164 desktop, 0 mobile [verified, `manifest.json`]. Shared Webflow CSS 1.46 MB [verified, fetched size].
- **Capture:** the first desktop pass timed out on four screenshots; a retry with `--wait 6000 --timeout 90000` succeeded [verified, `manifest.json`, `retry/manifest.json`].

### Tech lens: GSAP
- **Registration:** `gsap.registerPlugin(CustomEase, ScrollTrigger, Flip, DrawSVGPlugin)`; SplitText is loaded and used through `SplitText.create` without being registered [verified, bundle.js]. GSAP core is loaded twice, from jsdelivr `@3.15` and from Webflow's `3.15.0` [verified, index.html].
- **Timelines:** 18 `gsap.timeline` calls [verified, bundle.js]; children are tweens, `Flip.fit` results and empty callback tweens that move the hero's `w--current` dot, with no timeline nested in another [inferred, from bundle.js]. One label pair, `startEnter` / `pageReady`, gates the Barba enter promise [verified, bundle.js].
- **Defaults:** `gsap.defaults({ ease: "osmo", duration: 0.6 })`, `staggerDefault 0.05` [verified, bundle.js].
- **Eases:**
  - `osmo` `0.625, 0.05, 0, 1` is the house curve [verified, bundle.js].
  - `parallax` `0.7, 0.05, 0.13, 1` is used for route moves [verified, bundle.js].
  - `pop` `M0,0 C0.17,0.67 0.3,1.33 1,1` is an overshoot for card drops [verified, bundle.js].
  - Named eases: `expo.out`, `power2/3/4`, `none` on every scrub [verified, bundle.js].
- **ScrollTrigger configs:**
  - Hero: `clamp(top top)` → `bottom top`, `scrub:true` [verified, bundle.js].
  - Fan pin: trigger `.tilt-cards_pin-height`, `top top` → `bottom bottom`, `pin` on the inner contain, `anticipatePin:1`, `scrub:true` [verified, bundle.js].
  - Fan cards: `start:"top top-=" + distPerCard*i`, `end:"+=" + distPerCard`, `scrub:true`, `power1.out`; `distPerCard = (pinHeight − innerHeight) / cards` [verified, bundle.js].
  - Fan intro copy fades over the first 25 % of the pin [verified, bundle.js].
  - Circle mask: `top 70%` → `center center`, `scrub:1` [verified, bundle.js].
  - Reveals: `top 80%`, `once:true`, `refreshPriority:-1`; already-visible blocks get duration 0 [verified, bundle.js].
  - Card grid drop: `top 75%`, `toggleActions:"play none none none"`, random ±2–4° start rotation, stagger 0.2, `pop` [verified, bundle.js].
  - Split horizontal rail: `x: -(scrollWidth − 50vw)`, `top top` → `bottom bottom`, `invalidateOnRefresh` [verified, bundle.js]; not on the homepage [verified, index.html].
- **Flip:** a "flip on scroll" helper chains `Flip.fit(target, nextWrapper, { duration: pixelOffset, ease:"none", simple:true })` into one timeline at `scrub:0.8`, so each leg's share equals its scroll distance; a parallel tween takes `borderRadius` from 100vw to 0 [verified, bundle.js `initFlipOnScroll`]. It is not on the homepage [verified, index.html].
- **SplitText:**
  - Headings: `type:"chars, words, lines"` with mask classes, chars opacity 0→1 at 0.03 s steps [verified, bundle.js].
  - Hero paragraphs: `type:"words"`, `autoSplit:true`, and `onSplit` returns the `tl.from(words)` so a re-split rebuilds the tween inside the scrubbed timeline [verified, bundle.js].
  - Testimonials: `type:"lines"`, `mask:"lines"`, `autoSplit:true` [verified, bundle.js].
- **DrawSVG:** contour paths go `drawSVG "0%"` → `"100%"` on load (5 s) and on scrub [verified, bundle.js].
- **Smooth scroll:** `lenis.on("scroll", ScrollTrigger.update)`; the ticker drives `lenis.raf(time*1000)` [verified, bundle.js].
- **matchMedia / reduced motion:** `gsap.matchMedia` gates the nav, parallax, fan (≥ 768) and rail (≥ 992). Reduced motion is honoured only by route transitions and testimonials; the preloader, reveals, hero scrub and fan ignore it [verified, bundle.js].

## 6. Weaknesses
- **Reduced motion — fail.** `desktop-rm-s00` matches the motion frame. `desktop-rm-s25` freezes a heading mid character fade, and `desktop-rm-s75` scrubs the fan [verified, captures, bundle.js].
- **Keyboard — mixed.** Testimonial arrows are bound on `window` and call `preventDefault`, which steals ←/→ page-wide [verified, bundle.js]. There is no skip link and no `:focus-visible` rule [verified, index.html, CSS].
- **DOM behind the canvas — pass.** There is no canvas; all text is in the markup [verified, index.html].
- **Load gate — fail.** The ≈ 3.25 s preloader replays on every full load [inferred, timeline; verified, no storage check].
- **Phone — pass.** It is a designed stack: hero copy first, the fan flattened to cards. The consent box covers most of the screen [verified, `mobile-*.png`].
- **Wayfinding and conversion — pass.** The CTA is persistent and the hero dots show position [verified, captures].
- **Code hygiene:** shipped `barba debug:true`, a staging live-reload socket, a duplicate GSAP core. `initTiltCards` adds one more resize listener per resize [verified, bundle.js].
- **Mid-fan legibility:** at s75 three of the four cards are cut off by the next card [verified, `retry/desktop-s75.png`].
- **What the awards skills do differently:** one motion-tier switch read by every helper ([recipe:reduced-motion-switch]); a preloader that remembers the visit ([recipe:preloader-counter-hold]); slider keys scoped to the focused slider; the fan scrub ending on a resting, readable layout.

## 7. Principles (3–6, generalisable)
1. **Let one drawn material carry the domain.** A single line language (contours, survey ticks, crosses) used in the hero, the panels and the chrome makes a B2B page feel authored without imagery.
2. **Split a pinned range evenly by item count.** Give each item its own scrub window of `(pin − viewport) / n`, so the sequence keeps its rhythm when items are added.
3. **Pay Flip legs in scroll distance.** A chained Flip whose leg durations equal pixel offsets travels at constant speed under scrub.
4. **Rebuild split tweens in `onSplit`.** When text re-splits on resize, the scrubbed timeline gets a fresh tween instead of animating detached nodes.
5. **Keep accents to roles.** Orange for actions, lime for live signal, the rest of the palette for cards only.

## 8. Take / Don't take
- **Take:**
  - Per-item scrub windows inside one pin, 4° spread, `power1.out` per window.
  - `Flip.fit` legs with duration = scroll offset at `scrub:0.8`, radius tween alongside.
  - Circle clip-path text mask driven by `self.progress`, origin below the box (50 % 120 %).
  - `onSplit` returning the tween for `autoSplit` text inside a scrubbed timeline.
  - Registration crosses and hairline grids as chrome.
- **Don't take:**
  - The off-white ground hex
  - #f5f6f3 [verified, webflow.shared.css]
  - The navy ink hex
  - #002642 [verified, webflow.shared.css]
  - The orange CTA hex
  - #ff5c29 [verified, webflow.shared.css]
  - The lime glow hex
  - #c3ff44 [verified, webflow.shared.css]
  - The four card hues, including grove green
  - #566246 [verified, webflow.shared.css]
  - PP Mori as the single face (already `[site:boc]`'s contract).
  - The hero as-is: contour quadrants, orange crosshair, three chapter dots.
  - The section order hero → logos → masked thesis → sticky map steps → platform card → card fan → stats.
  - The copy lines, map videos, photography and the `osmo` / `parallax` ease strings verbatim.

## 9. Confidence and sources
- Header and §1–§3: high [verified, captures + index.html + webflow.shared.css]. Awards and credits: [unknown]; no entry looked up.
- §4 and the lens: high for literal values [verified, bundle.js, unminified]; the timeline nesting and the gate length are [inferred].
- §5: high for signatures; sizes from fetched files and `curl -sI` headers, not throttled runs.
- §6: high [verified, source + captures]; screen-reader behaviour not tested.
- **Live pass 2026-10-05:** reachable; capture exit 2 (four desktop screenshot timeouts, tracking failures), `scrollMode` native. Desktop states were re-taken once with `--wait 6000 --timeout 90000` into `retry/`. Sources in `.awards/research/abatable/`: `retry/desktop-s00…s100.png`, `mobile-s00…s100.png`, `desktop-rm-s00…s100.png`, `manifest.json`, `retry/manifest.json`, `index.html`, `bundle.js`, `bundle.css`, `abatable---dev.webflow.shared.570b4d799.css`.
