# Zainab Kabira — https://zainabkabira.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio (independent product designer; one document holding home, About, Playground and four case-study views) [verified, index.html] |
| Visitor mode | persuade: "Work with me" sits in the nav pill and opens a contact drawer; the scrolled nav collapses to an "Available for work" pill [verified, desktop-s00.png, retry/desktop-s25.png, site.js] |
| Awards | Awwwards **Honorable Mention, 26 Aug 2026**; no aggregate axis scores published, only 15 of 22 community votes listed one by one (overalls 6.50–8.90) [verified, entry page awwwards.com/sites/zainab-kabira-portfolio-2026, entry.html]. The entry declares two colours and "Javascript, HTML5, Figma" [verified, entry.html] |
| Corpus rating | D 7.3 / U 6.8 / C 7.2 / Co 7.3 → weighted 7.13, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Zainab Kabira, self-designed and self-built [verified, footer line in desktop-s100 retry capture; entry page credits "ZainabKabira"]; other credits [unknown] |
| Stack (evidence level) | no framework, no bundler: one hand-written 731 KB HTML file with inline modules, plus `/css/site.css` and `/js/site.js` [verified, index.html] · two custom elements, `site-nav` and `site-footer` [verified, site.js] · **no animation, scroll or 3D library**: 0 hits for gsap, lenis, three, ogl, rive, barba [verified, index.html, site.js, site.css] · native View Transitions API [verified, site.js] · Google Fonts, ten families in one request [verified, index.html] · hosting [unknown] |
| Palette | illustrated strata: a sky-gradient hero over a warm cream page, a sand raised surface, gold and coral accents, a navy night theme; tiered tokens (palette → semantic roles) with the hexes listed in §3 [verified, index.html `:root`] |
| Type | serif display + grotesque body + mono labels: DM Serif Display, Space Grotesk, JetBrains Mono [verified, index.html font-family counts]; seven more families load for case-study mock-ups (Figtree, Inter, Roboto, Lato, Playfair Display, Darker Grotesque, Bitter) [verified, index.html Google Fonts URL] |
| WebGL dosage | none — no `<canvas>` in the DOM; the hero "shader" is a baked `hero-shader.webp` preloaded at high priority; manifest `webgl: true` only reports an available context [verified, index.html, manifest.json `canvases: 0`] |
| Scroll model | native, no smoothing library; one shared scroll scheduler drives CSS-sticky pins with scrubbed stages; case studies are gesture-snapped decks (one wheel, key or swipe = one panel) on desktop and plain vertical scroll at ≤ 820 px [verified, index.html; manifest `scrollMode: native`] |
| Narrative model | gallery — sky hero → statement → logo marquee → scrubbed project tiles → testimonial deck → garden close, with four case-study routes [verified, retry/desktop-s00…s100] |

## 1. Concept and narrative
A portfolio as a walk down through one painted landscape: it opens in the sky, lands on cream ground, passes a willow grove and ends in a flower bed over dark soil. The claim sits in the headline — a designer who ships, codes, builds or solves, the last word rolling through the cycle like a slot [verified, index.html `#scramble`]. The tone is warm and playful: a tape-deck widget offers the design journey "rapped" as audio [verified, desktop-s00.png, index.html `<audio>`], and the loader is a Pac-Man eating dots with rotating lines [verified, index.html `#page-loader`].

Beats [verified, retry/desktop-s00…s100 and mobile-s00…s100]: sky hero with a stacked serif headline, the tape deck, a hatched sun and painted cloud edges → a bold centred statement about story → "Work featured on" over a logo marquee, a paper plane flying a dashed path down the margin → project tiles in two-up rows (device photographs with live screens) → testimonials in frosted cards over a willow painting → a sand-coloured close with a one-line offer, "Let's grow your next idea", a garden illustration and three social pills.

## 2. Structure and components
- **Preloader**: Pac-Man chomping nine dots and a rotating status line; it holds until fonts and the hero image are ready, never less than 1200 ms and at most 4000 ms, on every load [verified, site.js `pageLoader`].
- **Nav**: a frosted pill centred at the top (portrait, Work, About, Playground, "Work with me"), a location label at the left, and a sound toggle and a day/night toggle at the right; on the phone a menu button, a mail button and the theme toggle [verified, desktop-s00.png, mobile-s00.png].
- **Hero**: vertical mono label "design / details / code", a mono greeting line, the two-line serif headline with the rolling word, and the tape deck [verified, desktop-s00.png].
- **Logo marquee** "Work featured on" revealed as a group on scroll [verified, index.html, retry/desktop-s25.png].
- **Project tiles**: rounded photo cards of devices on furniture, each carrying a looping screen recording warped into the device's screen [verified, retry/desktop-s50.png, index.html].
- **Testimonial deck**: three frosted cards that stay stacked while the section slides up over the pinned tiles, then fan out left and right; a looping carousel on the phone [verified, retry/desktop-s75.png, mobile-s75.png, index.html].
- **Footer**: illustrated garden and soil, a closing offer and LinkedIn, GitHub and Behance links [verified, retry/desktop-s100.png].
- **Case studies**: tile → hero shared-element morph, then a cover-slide deck with a section pager, looping recordings and an 8 s auto-advancing "read next" slide [verified, index.html].
- **Playground**: a CSS-3D coverflow ring of clips with a lightbox [verified, index.html].
- **Other chrome**: an "Honors" side tab linking the award entry [verified, desktop-s00.png, index.html]; a curtain route transition between home, About and Playground [verified, index.html]; 404 [unknown].

## 3. Visual language
- **Grounds and ink** [verified, index.html `:root`]:
  `#fff9f1` cream page ground [verified, index.html `--c-cream`; also the entry's first declared colour and the `theme-color`]
  `#eee8d2` sand raised surface for testimonials and footer [verified, index.html `--c-sand`]
  `#060606` near-black body ink [verified, index.html `--c-ink`]
  `#ffda3f` gold accent (sun, status dot) [verified, index.html `--c-gold`]
  `#fc9073` coral accent (paper plane) [verified, index.html `--c-coral`]
  `#0a0a0f` night page ground [verified, index.html `--c-night`]
  `#111c36` night raised surface [verified, index.html `--c-navy`]
  `#6ca5d7` sky blue declared on the entry [verified, entry.html]; the build's hero is a radial gradient between two rgba blues, not this hex [verified, index.html `--c-blue-start/end`]
- **Strategy**: a flat token system kept deliberately small, with the colour carried by painted scenery — sky, clouds, willows, flowers, soil — that changes per section; the tokens stay put while the illustration changes the world [verified, captures; index.html].
- **Type**: display serif at poster scale for the hero and the close, grotesque for statements and body, mono in caps for labels and the greeting [verified, desktop-s00.png, retry/desktop-s100.png]. Fluid values are `clamp()` in px and vw [verified, index.html].
- **Material**: 10 % noise on a 2048 px tile over the sky, day cirrus and night stars screen-blended on, rough-edged painted cloud cut-outs [verified, index.html `.hero-noise`, `.hero-stars`].
- **Layout**: a 1440 artboard; the hero keeps its staggered composition and scales to fit between 640 and 1100 px, then reflows to a column [verified, index.html hero scale script].
- **Browser surfaces**: `theme-color` cream [verified, index.html]; custom scrollbar rules present [verified, index.html]; no `::selection` and no `color-scheme` [verified, index.html, site.css].

## 4. Motion and effects (with parameters)
- **Scroll**: native, no smoothing. One scroll listener and one rAF read every rect at the top of the frame, then run subscribers that only write — replacing 18 listeners and about 8 forced reflows a frame, by the author's own comment [verified, index.html scroll scheduler].
- **Headline slot roll**: four words; each rests 900 ms and rolls in 560 ms on `cubic-bezier(0.22, 1.15, 0.36, 1)`, a slight overshoot; per-letter spans take the title's hover tilt; reduced motion swaps the word with no movement [verified, index.html `#scramble`].
- **Text reveal**: 26 px rise plus opacity over .85 s on `cubic-bezier(0.22, 0.61, 0.36, 1)`, fired by IntersectionObserver; case-study media use a 72 px slide with a settle-scale [verified, index.html].
- **Project tiles**: each row scales from half to full size as its top travels from 95 % to 45 % of the viewport, smoothstep-eased; per tile on the phone [verified, index.html].
- **Pin and cover**: the tiles section is sticky by its bottom (`top: 100vh − height`) so testimonials slide over its last screen, with an opacity scrim instead of a `filter` on the pinned layer; the deck then fans over 460 px of scroll, smoothstep [verified, index.html].
- **Paper plane**: a sprite follows an SVG motion path; a 1.4 px dashed trail (`10 6`) is revealed through a 44 px mask stroke; the path is routed through empty zones only [verified, index.html `.plane-fly`].
- **Screen warp**: four screen-corner fractions measured off each device photograph produce a 3 × 3 homography written as CSS `matrix3d` on the `<video>`; the cover-crop is mirrored so the recording stays on the screen at every width; the scene breathes scale 1 → 1.05 over 18 s, off under reduced motion [verified, index.html `.cs-hero-mock` script].
- **Snap deck** (case studies): one gesture tweens to the next panel over 1000 ms, ease-in-out cubic, keeping native scroll in sync so the scrollbar still drags [verified, index.html].
- **Coverflow** (Playground): cards on a ring, 54 % translate, 300 px depth and 38° per step on desktop (60 %, 250 px, 32° on phones), two neighbours each side at opacity .55 and .22; drag, wheel and arrow keys rotate; only the centred clip plays [verified, index.html].
- **Marquee**: 40 px per second with a fractional carry so sub-pixel speeds hold at 120 Hz; parks on hover; infinite loops pause off-screen via IntersectionObserver [verified, index.html].
- **Theme**: the day/night toggle crossfades the page through `document.startViewTransition`, with a 500 ms class fade as fallback; the choice is stored and applied before first paint; night runs one meteor of about 1.5 s every 5–13 s, and returning to day plays one wind gust [verified, site.js, index.html].
- **Easing set**: `cubic-bezier(0.22,1,0.36,1)` leads (42 uses), then a springy `(0.3,1.25,0.4,1)` and `(0.34,1.56,0.64,1)` [verified, index.html counts].
- **Sound**: a recorded track, `preload="none"`, started only by the tape deck or the nav toggle [verified, index.html, site.js].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | none; hand-written HTML with a hash router behind real paths | [verified, index.html path-router shim] |
| Motion | CSS transitions and keyframes plus rAF; no library | [verified, index.html, site.js] |
| Transitions | View Transitions for tile → hero and theme; a two-pane curtain elsewhere | [verified, index.html, site.js] |
| Fonts | Google Fonts, ten families, one stylesheet request | [verified, index.html] |

- Weights: index.html 731,041 B, site.css 81,143 B, site.js 55,407 B as fetched [verified, curl sizes]; 142 `<img>`, 30 `<video>`, one `<audio>` in the document [verified, index.html].
- Videos load late and play only in view; the hero image is preloaded `fetchpriority="high"` [verified, index.html].
- Manifest: ~3,230 DOM nodes, desktop CLS 0.25, no console errors [verified, manifest.json, retry/manifest.json]; `lcpColdSynthetic` is not quoted.

## 6. Weaknesses
- Reduced motion: **pass** — `desktop-rm-s00…s75` read at rest with every section populated; 57 reduced-motion branches in the source [verified, captures, index.html]. The rm s100 frame timed out [verified, manifest.json].
- Keyboard: **partial** — arrow, page, Home/End, Escape and Enter handlers for the decks, coverflow and lightbox [verified, index.html, site.js]; but no skip link and no `<main>` landmark [verified, index.html].
- DOM behind the canvas: **pass** — there is no canvas; every view's text is in the markup with one `h1` per view [verified, index.html].
- Load gate: **fail** — the loader holds at least 1.2 s on every visit, with no repeat-visit skip [verified, site.js].
- Phone: **pass** — a designed reflow: stacked hero, carousel testimonials, case studies as plain scroll [verified, mobile-s00…s100, index.html].
- Wayfinding and conversion: **pass** on the action (contact in the nav at every depth); **fail** on arrival mid-page — reveals stay at opacity 0 until observed, so the jump-scrolled `desktop-s50` and `desktop-s100` frames came back as empty cream [verified, desktop-s50.png, desktop-s100.png].
- Type sprawl: ten families load on the home route for mock-ups seen only inside case studies [verified, index.html].

**What the awards skills do differently**: the loader follows [recipe:preloader-counter-hold] and is skipped on a repeat visit; reveals ship visible and animate only when the motion tier allows ([recipe:reduced-motion-switch]), so an anchor jump never lands on an empty screen; a skip link and `<main>` come from the structure pass; per-route fonts load with the route.

## 7. Principles
1. **Let the scroll descend through one place.** A long single page gains an ending when its sections are strata of one scene, from sky to ground; the close is where the ground is.
2. **Put the product inside the photograph.** Warping a live recording into a measured screen quad makes still art direction move without a 3D engine.
3. **One slot, many verbs.** A single rolling word in an otherwise fixed headline states a range of skills without a list.
4. **Pin by the bottom edge.** A section held at its last screen lets the next one slide over a finished composition instead of a half-scrolled one.
5. **A theme is a scene, not a palette flip.** Give each theme one event of its own, played once, so switching feels like changing the hour.
6. **Read once, then write.** One scheduler that measures at the top of the frame keeps many scroll effects cheap on a large document.

## 8. Take / Don't take
- **Take:**
  - The homography warp: four measured corner fractions → `matrix3d`, recomputed from one ResizeObserver, mirroring the image's cover-crop.
  - Slot-roll timing: ~900 ms rest, ~560 ms roll, a small overshoot, and a plain swap under reduced motion.
  - The bottom-pinned section with an opacity scrim rather than an animated `filter` on a layer full of video.
  - A fixed-duration snap deck that keeps native scroll in sync so the scrollbar still works.
  - A coverflow ring with arrow keys, one playing clip, and at most two visible neighbours.
  - Marquee speed in px per second with a fractional carry; off-screen loops parked by IntersectionObserver.
  - Theme choice applied before first paint, crossfaded with View Transitions.
- **Don't take:**
  - The cream, sand, gold, coral and navy set as literal values:
    `#fff9f1` [verified, index.html]
    `#eee8d2` [verified, index.html]
    `#060606` [verified, index.html]
    `#ffda3f` [verified, index.html]
    `#fc9073` [verified, index.html]
    `#0a0a0f` [verified, index.html]
    `#111c36` [verified, index.html]
    `#6ca5d7` [verified, entry.html]
  - The sky → willow → garden sequence, the hatched sun, the tape deck, the paper plane or the Pac-Man loader as-is.
  - The headline's verb list, the "Let's grow your next idea" close and any testimonial, client or product.
  - Ten font families on one route, a loader on every visit, and reveals that leave jumped-to sections empty — things to beat, not adopt.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards | high — entry page captured and its text read 2026-09-23; Honorable Mention with no aggregate scores |
| Stack, palette, type, motion parameters | high — read from index.html, site.css and site.js |
| Composition, phone, reduced motion | high — standard captures plus a desktop retry |
| Keyboard and deck behaviour | medium — read from source, not driven in the browser |
| 404, hosting | unknown |

**Live pass 2026-09-23: reachable, capture exit 2, scroll mode native.** The first desktop pass returned empty cream frames at s50 and s100 (reveals not yet observed after a jump) and the reduced-motion s100 frame timed out; one retry with `--wheel 12000 --wait 6000 --timeout 90000`, desktop only, reached all five states (exit 0). Sources in `.awards/research/zainabkabira/`: `desktop-s00…s100`, `retry/desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s75`, `manifest.json`, `retry/manifest.json`, `index.html`, `site.css`, `site.js`. Awwwards entry captured desktop-only into `entry/` (exit 2, cookie wall) with `entry/entry.html` read for the award, palette and vote table.
