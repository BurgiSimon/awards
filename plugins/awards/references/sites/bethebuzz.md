# Be The Buzz — https://www.bethebuzz.co/services

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | B2B service: a go-to-market marketing agency for B2B SaaS, e-commerce and cybersecurity companies [verified, index.html `<title>` and meta description] |
| Visitor mode | persuade: a violet LEARN MORE per service, EXPLORE OUR SOLUTIONS, a BOOK A SESSION box and the address as a display line in the close [verified, desktop-s25/s75/s100.png] |
| Awards | Site of the Day, 4 Aug 2024, 7.19: Design 7.16 / Usability 7.18 / Creativity 7.24 / Content 7.24; Developer 7.35: Semantics 6.80, Animations 7.60, Accessibility 6.40, WPO 8.00, Responsive 7.80, Markup 7.00 [verified, entry page awwwards.com/sites/be-the-buzz, `entry/be-the-buzz.html`] |
| Corpus rating | D 6.8 / U 6.2 / C 6.6 / Co 6.0 → weighted 6.50, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Buzzworthy, with Juraj Molnár, Kodo House and Akaru [verified, entry page]; footer line "Website by Buzzworthy" [verified, desktop-s100.png] |
| Stack (evidence level) | **Next.js 14.2.35** app router (`window.next={version:"14.2.35"}`) [verified, `2117-….js`] · **Prismic** (`images.prismic.io/bethebuzz-cms`, `PrismicNextLink`) [verified, index.html; `layout-….js`] · **React Three Fiber** [verified, `4963-….js` `@react-three/fiber`] on **three r162** [verified, `b536a0f1-….js` REVISION] · **three-custom-shader-material** (`baseMaterial`, `csm_Position`, `csm_DiffuseColor`) [verified, `layout-….js`, `4963-….js`], version [unknown] · **detect-gpu 5.0.38** benchmarks gate the canvas [verified, `4963-….js`] · **GSAP 3.14.2** + ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, CustomEase [verified, `4176-….js`, `2227-….js`, `2135-….js`] · **Lenis 1.0.35** through `@studio-freight/react-lenis` (`lenisVersion`, `autoRaf` default true) [verified, `7227-….js`] · Swiper [verified, CSS `swiper-icons`] · hosting on Vercel [inferred, host resolves to 76.76.21.21] · fonts: PP Neue Montreal (Regular, Book, Medium, Bold), PP Editorial Old Ultralight, Lemon-Bold [verified, CSS `@font-face`] |
| Palette | ground: a fixed WebGL cloth in the route's theme colour (violet on this route; orange, red, pink named) [verified, index.html `data-page-theme="violet"`; `layout-….js` theme list] |
| | ink `--color-dark-blue` |
| | `#010561` [verified, CSS `:root`] |
| | accent `--color-violet` (titles, buttons, `::selection`) |
| | `#5e29f9` [verified, CSS `:root`] |
| | section panel `--color-orange` |
| | `#fe9421` [verified, CSS `:root`] |
| | theme hues `--color-pink`, `--color-red` |
| | `#e60696` [verified, CSS `:root`] |
| | `#f35356` [verified, CSS `:root`] |
| | panel greys `--color-light-grey`, `--color-grey` |
| | `#f2f2f7` [verified, CSS `:root`] |
| | `#e6e6f0` [verified, CSS `:root`] |
| | Strategy: **theme-per-route cloth ground under white and flat-colour DOM panels; dark-blue ink, one violet accent** [verified, captures + CSS] |
| Type | **Condensed display caps + ultralight editorial serif + neutral grotesque**: Lemon-Bold for headlines, PP Editorial Old Ultralight in caps for kickers and the close, PP Neue Montreal for body and buttons [verified, CSS tokens `--font-headline-bold`, `--font-editorial-ultralight`, `--font-text-*`]; retail source of "Lemon" [unknown]. Hero display size `clamp(100px, 23vw, 600px)` [verified, CSS `servicesHero`] |
| WebGL dosage | canvas-first, ambient: one fixed R3F canvas draws a cloth plane under every section and route; the DOM reads as panels floating on it; gated on GPU tier ≥ 1 with a CSS gradient-blob fallback [verified, `layout-….js`; manifest.json `canvases: 1`, `webgl: true`] |
| Scroll model | native + Lenis 1.0.35 (react-lenis wrapper, own rAF; options [unknown]); one ScrollTrigger pin at `scrub: 1` for desktop ≥ 1025 px [verified, `7227-….js`, `2135-….js`; manifest.json `scrollMode: native`] |
| Narrative model | specification: services hero → three-service accordion → a pinned "solutions" chapter → contact close [verified, desktop-s00 to s100.png] |

## 1. Concept and narrative
**One idea:** the agency's world is a moving fabric, and the page is laid over it like cards on a table. The first viewport is white: a two-line ultralight serif kicker at the top, a cut-corner photo of a woman shouting through a megaphone, and a single display word across the full width whose letters are holes, so the violet cloth moves inside them [verified, desktop-s00.png; index.html `mask id="hole"`]. A small drawn arrow and "SCROLL" sit bottom left [verified, desktop-s00.png].

Beats: the white hero gives way to the cloth, and three service cards sit on it, one expanded with a large violet title, paragraph and LEARN MORE, two collapsed with a round "+" [verified, desktop-s25.png]; an orange panel with a serif kicker and a four-line white display claim, wooden steps photographed on orange, and a white line that draws itself up the steps [verified, desktop-s50/s75.png]; the close is the cloth again, with the address as a big serif line, a strategy-session box, footer nav, social links and a newsletter field [verified, desktop-s100.png]. Register: conventional B2B marketing copy, second person, outcome words ("measurable growth", "bottom line") [verified, index.html].

## 2. Structure and components
- **Header**: full wordmark top left, a round white menu button top right with a drawn two-line glyph; after the first section a ScrollTrigger `onLeave` swaps to a compact mark in a white pill [verified, `layout-….js`; desktop-s50.png]. Menu button is a `<button aria-label="Toggle Nav">` [verified, index.html]. The open menu was not captured; its links are text filled with a still of the cloth (`background-clip: text`, `/static-bg.webp`) [verified, CSS].
- **Knockout hero word**: an SVG, `viewBox 0 0 1169 334`, whose white rect is masked by the letter paths; flanking `.js-transparent-bg` panels paint the page white around it, their box-shadow dropped under 1200 px [verified, index.html; CSS].
- **Service accordion**: three cards, each title an `h1`, each toggled by an icon-only `<button data-index>` [verified, index.html; desktop-s25.png]. Phone: stacked cards with an arrow disc [verified, mobile-s00.png].
- **Solutions chapter**: an orange rounded panel with the claim, the steps photograph, a drawn chart line, a dot, then a star badge in a white disc [verified, desktop-s50/s75.png; `2135-….js`].
- **Close**: display email line with a return-arrow box, BOOK A SESSION outline button, NAVIGATION and SOCIAL columns with underlined links, a newsletter input with an arrow submit, legal row [verified, desktop-s100.png].
- **Load**: `is-preloading` on `<html>` and `<body>`, removed after a 600 ms timeout; no preloader seen [verified, index.html; `layout-….js`]. No custom cursor or sound observed. 404 not observed; a `not_found` hero variation exists in CSS [verified, CSS].

## 3. Visual language
- **Grounds**: white for the hero and cards, the cloth everywhere else, one saturated orange panel as the interruption [verified, captures]. The cloth texture is a JPG diffuse map chosen per theme and per aspect (`/map-diffuse-{portrait|landscape}-{theme}.jpg`) [verified, `layout-….js`].
- **Type**: the hero word fills the width at about 300 px tall on the 1440 frame [inferred, desktop-s00.png]; card titles and the solutions claim in the condensed face in violet or white; kickers in the ultralight serif in caps; body in the grotesque at a comfortable size [verified, captures].
- **Imagery**: stock-register photography on flat colour (megaphone portrait, wooden steps) [verified, captures]; hand-drawn line icons in violet [verified, desktop-s25.png].
- **Layout**: 20 px page gutter, `--grid-gap: clamp(10px, 1.389vw, 20px)`, `--block-padding: clamp(24px, 4.167vw, 60px)`, radius `max(5px, .3vw)` [verified, CSS `:root`]. Cards sit one gutter apart so the cloth shows in every seam [verified, desktop-s25.png].
- **Browser surfaces**: `::selection` violet with white text [verified, CSS]; no `theme-color` [verified, index.html].

## 4. Motion and effects (with parameters)
- **Cloth ground** [verified, `layout-….js`]: a `planeGeometry` at 1.1 × the viewport with 128 × 128 segments; `dpr [1, 2]`, `fov 55`, `antialias`, `preserveDrawingBuffer: true`. The vertex shader rotates UVs by 20°, stretches x by a fold factor of 4, drifts by `speed (.75, 2.25)` over time and lifts z by value noise clamped to .4–1.0. A 256 px pointer-trail texture (radius .25, max age 800 ms) pushes vertices by `displacement .1` per axis, clamped to ±.6, in the direction of pointer velocity (mouse lerp .1, velocity × 5). The fragment mixes a shadow (diffuse × (1 − .9)) and a light (diffuse × 1.1) by elevation. The trail hook matches drei's `useTrailTexture` signature [inferred].
- **Tier gate**: canvas only when detect-gpu tier ≥ 1; otherwise a CSS gradient with orange, pink, red and violet blob divs [verified, `layout-….js`].
- **Headline reveals** [verified, `2135-….js`]: letter-spacing 5vw → 0 with opacity over 1.66 s `power2.inOut`; SplitText chars `rotateX` → 0°, stagger .03, 1.33 s; words `rotateX` → 0°, `expo.out`, stagger .05, 1.33 s; lines split twice for masked reveals.
- **Solutions pin** [verified, `2135-….js`]: desktop only (`innerWidth ≥ 1025`), `pin: true`, `scrub: 1`, one element height long. DrawSVG `0% 0%` → `0% 100%` on `.chart-line` while a circle follows it via MotionPath (`align`, `alignOrigin [.5, .5]`), both linear over 1.5; the circle then scales 7× and rises 200 %, and two stars scale in from −210° and 192° with stagger .05, `power2`. Below 1025 px the same timeline plays unpinned with the line over 5 s.
- **Buttons**: a hover timeline run forward and back with a CustomEase `M0,0 C0.263,0 0.206,0.627 0.502,0.864 0.646,0.979 0.704,1 1,1` [verified, `layout-….js`].
- **CSS easings**: `cubic-bezier(.16,1,.3,1)` leads (nav link fill over 1.2 s), with ten others in the stylesheet [verified, CSS].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework / CMS | Next.js 14.2.35 app router, Prismic slices (`data-slice-variation`) | [verified, `2117-….js`, CSS] |
| 3D | R3F + three r162 + custom-shader-material, one fixed canvas in the layout, persists across routes | [verified, bundles]; persistence [inferred, layout component] |
| Motion | GSAP 3.14.2 (ScrollTrigger, SplitText, DrawSVG, MotionPath, CustomEase), Lenis 1.0.35 | [verified, bundles] |
| Quality | detect-gpu tier gate, DPR capped at 2, CSS fallback | [verified, `layout-….js`] |

- 415 DOM nodes desktop, CLS 0 desktop and .0003 phone; no console or page errors; 30 failed requests, all analytics and ad beacons aborted at teardown [verified, manifest.json]. `lcpColdSynthetic` is a headless artefact, not a performance claim.
- The three chunk alone is 675 KB unminified text; the R3F chunk 207 KB [verified, file sizes in `src/`].

## 6. Weaknesses
- Reduced motion: **fail**. `prefers-reduced-motion` appears in no fetched CSS or JS [verified, src/]; `desktop-rm-s00` matches `desktop-s00` and the cloth still moves. Nothing is left hidden: the hero reads at rest [verified, desktop-rm-s00/s75.png].
- Keyboard: **partial**. The menu is a named button, but the accordion "+" buttons are icon-only with no accessible name, and the CSS removes outlines five times with no `:focus-visible` rule [verified, index.html; CSS].
- DOM behind the canvas: **pass for copy, fail for the hero word**. The canvas is decoration and all copy is markup, but the display word is SVG path data with no `<title>` or label [verified, index.html].
- Semantics: **fail**. Three `h1`s are card titles; the hero kicker is an `h2` [verified, index.html].
- Load gate: **pass**. A 600 ms class hold, no counter [verified, `layout-….js`].
- Phone: **pass**. Designed stack, cloth kept, the pin replaced by a timed play [verified, mobile-s00/s50/s75.png; `2135-….js`].
- Wayfinding and conversion: **partial**. No chapter indicator; the booking action lives in the close and the menu [verified, captures].

What the awards skills do differently: a static tier that freezes the cloth to one rendered frame and draws the stair line complete `[recipe:reduced-motion-switch]`; a visually hidden text twin inside any masked or SVG headline; one `h1`; named toggle buttons with `aria-expanded`; a visible focus ring themed to the accent.

## 7. Principles
1. **Make the ground the material, and let the layout reveal it.** When one living surface sits under every section, gutters, seams and cut-out letters become windows, and the page needs no other decoration.
2. **Cut the headline out, don't paint it.** Letters as holes in an opaque panel show whatever moves beneath, so the brand texture sits inside the biggest type on the page for free.
3. **Drive a cheap surface with two slow forces and one fast one.** Time-drifting noise for the resting fold, the pointer's trail for the response; a textured plane with vertex displacement reads as fabric without simulation.
4. **Let a line's endpoint become the reward.** A path drawn by scroll, a marker riding it, and the marker turning into the payoff badge gives a pinned chapter a beginning and an end.
5. **Gate the world by device, and keep its echo.** A GPU tier decides the canvas; the fallback and the menu reuse a still of the same surface, so the identity survives without WebGL.

## 8. Take / Don't take
- **Take:**
  - A fixed full-viewport textured plane with noise folds and a pointer-trail push as an ambient ground, DPR capped at 2, behind a tier gate `[recipe:quality-tiers]` `[pattern:webgl-architecture#canvas-positioning]`.
  - An SVG mask knockout headline over that ground, with a hidden text twin `[pattern:typography#type-as-webgl-material]`.
  - Card gutters wide enough to show the ground, so the world is present between sections.
  - A scroll-drawn path with a follower that becomes the section's badge `[recipe:scroll-drawn-svg-path]` `[recipe:scroll-pin-scrub]`, played on a timer under the pin breakpoint.
  - One theme hue per route applied to the ground, not to every component `[pattern:color-and-material#colour-as-state]`.
- **Don't take:**
  - The palette as literal values:
    - `#010561` [verified, CSS `:root`]
    - `#5e29f9` [verified, CSS `:root`]
    - `#fe9421` [verified, CSS `:root`]
    - `#e60696` [verified, CSS `:root`]
    - `#f35356` [verified, CSS `:root`]
    - `#f2f2f7` [verified, CSS `:root`]
    - `#e6e6f0` [verified, CSS `:root`]
  - A violet silk cloth as the ground, the megaphone and wooden-steps imagery, the hexagon-B wordmark, any copy line.
  - Lemon-Bold + PP Editorial Old Ultralight + PP Neue Montreal as a set.
  - The order white knockout hero → service accordion → orange pinned stairs → cloth contact close.
  - The shader parameters as a set (20° angle, fold 4, speed .75 / 2.25, shadow .9 / light 1.1); an unnamed SVG hero word, three `h1`s, stripped outlines and no reduced-motion branch are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high: served HTML, six CSS files and the linked JS chunks read |
| Awards and credits | high: entry page read |
| Concept, structure, visual language | high for this route; the menu open state and other routes not observed |
| Motion parameters | high: shader source and timelines read from bundles; Lenis options [unknown] |
| Weaknesses | high for reduced motion, semantics and labels; runtime focus behaviour [unknown] |

**Live pass 2026-09-23: reachable, capture exit 0**, `scrollMode: native`, states reached by native scroll with no retry. Sources in `.awards/research/bethebuzz/`: `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`, `manifest.json`, `index.html`, `src/` (6 CSS files and the page's JS chunks, text only). Award entry from awwwards.com/sites/be-the-buzz: `entry/desktop-s00/s50/s100.png`, `entry/be-the-buzz.html` (capture exit 2). Not observed: the menu open, the accordion toggled, the no-GL fallback, inner routes, the 404.
