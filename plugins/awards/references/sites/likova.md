# LIKOVA — https://likova.space/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | B2B product: leasing site for a Class A business centre under construction on the south-west edge of Moscow (office, retail and parking space) [verified, index.html `<title>` "Class A Business Center" + JSON-LD Organization + copy]; Awwwards tags Business & Corporate, Real Estate, Luxury [verified, Awwwards entry read 2026-09-23] |
| Visitor mode | persuade: two conversion paths, "Select office space" and "Contact us", are pinned in the header on every frame [verified, desktop-s00.png … desktop-s100.png] |
| Awards | **Awwwards Site of the Day, 19 Aug 2026, SOTD 7.33**: Design 7.49 · Usability 7.13 · Creativity 7.28 · Content 7.44 [verified, Awwwards entry read 2026-09-23]. **DEV AWARD 7.41**: Semantics/SEO 7.20 · Animations/Transitions 8.20 · Accessibility 6.60 · WPO 7.60 · Responsive 7.40 · Markup/Meta 7.20 [verified, same]. Entry palette: two colours, #070B20 + #E3E6EB [verified, same]. Communication Arts Webpick listing exists [verified, search result title only; page not read] |
| Corpus rating | D 7.3 / U 6.4 / C 7.0 / Co 7.2 → weighted 6.96, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Website by **Vide Infra** [verified, index.html footer + Awwwards entry "LIKOVA by Vide Infra PRO"]. Architecture by Kamen Architects, architectural lighting by 500 Lux, public interiors by Kononenko bureau — building credits named on the page's team chapter, not website credits [verified, index.html]. Individual roles [unknown] |
| Stack (evidence level) | Webpack-bundled vanilla + **jQuery 3.7.1** with a `data-plugin="…"` attribute registry (388 declarations, 30 plugin names) [verified, shared.js + index.html] · **@barba/core 2.10.3** (`data-barba="wrapper"`/`container`) [verified, shared.js + index.html] · **Locomotive Scroll v4** option shape (`smartphone`/`tablet` objects, `firefoxMultiplier:50`, `lerp:.1`), created with `smooth:!0` and `smartphone:{smooth:!0}` [verified, shared.js]; exact version [unknown] · a Framer Motion `MotionValue` build `"11.13.3"` [verified, shared.js] · **Three.js r180** (`const i="180"`) in a lazy `threejs.js` chunk with GLTFLoader, DRACOLoader, KTX2Loader, PMREM, RawShaderMaterial [verified, threejs.js] · **camera-controls** (yomotsu) [verified, threejs.js] · scene code in a lazy `webgl-club.js` chunk [verified, shared.js chunk map + webgl-club.js] · fonts self-hosted woff2 [verified, global.css] · CMS and hosting [unknown] |
| Palette | Strategy: blue-black ground + white ink + cool greys, **no accent**; chroma comes only from the dusk renders of the building [verified, captures + global.css]. Tokens [verified, global.css]: |
| | `--c-blue-gray` #070b20 (ground; also `theme-color`) [verified, global.css + index.html] |
| | `--c-blue-dark` #232739 [verified, global.css] |
| | `--c-border` #393c4d [verified, global.css] |
| | `--c-blue-deep` #57566a [verified, global.css] |
| | `--c-gray` #bdbec4 [verified, global.css] |
| | `--c-gray-light` #e3e6eb [verified, global.css] |
| | `--c-white` #fff [verified, global.css] |
| | `--c-error` #ce1d20, the only warm hue, reserved for form errors [verified, global.css] |
| Type | One geometric grotesque in two near-identical weights: **TT Norms Pro** 400 and 450 (`tt-norms-pro-regular` / `-normal` woff2), fallback Helvetica, Arial [verified, global.css @font-face]. 450 carries 23 of 28 weight declarations [verified, global.css + landing.css]. Body and labels set in uppercase; display numerals and the wordmark run light and wide [verified, captures] |
| WebGL dosage | moments: one canvas on the page [verified, manifest.json `canvases: 1`, `webgl: true`] serving two scenes, a glass lattice object (`webglDark`, `/assets/webgl-dark/white.glb`) behind the key-figures stage and an orbitable site model (`webglWhite`) inside the master-plan modal [verified, index.html + webgl-club.js] |
| Scroll model | virtual float: Locomotive Scroll 4 in smooth (transformed-container) mode on desktop **and** phones, lerp .1 [verified, shared.js], with `data-scroll-sticky` layers and a site-written snap-point engine on top [verified, shared.js + index.html]; capture `scrollMode: wheel` on desktop and mobile [verified, manifest.json] |
| Narrative model | specification, place-led: nine numbered chapters (about, location, master plan, architecture, lobby, offices, technology, infrastructure, team), each a figure-and-fact block, then a contact close [verified, index.html + menu links] |

## 1. Concept and narrative
The one idea is the building's own massing turned into interface grammar: the stepped, notched silhouette of the glass volumes is the shape of the preloader card, the hero wordmark panel, the cookie box, the numeral panels and 18 "bitten-corner" buttons [verified, desktop-s00.png, desktop-rm-s00.png, mobile-s100.png, index.html `btn--bitten-corner`]. The load holds on that stepped white block counting to 100 % over a dimmed glass lattice [verified, desktop-rm-s00.png, mobile-s00.png]. The hero then plays as one long scrubbed stage: white panel with the wordmark over a dusk render (s00), the panel retracts upward (s25), a hairline "Class A" card and a short positioning line appear (s50), the card fades as the render pulls back to reveal street, plaza and people (s75, s100) [verified, wheel/desktop-s00 … s100.png]. After it, the page reads as a specification sheet with numbered chapters, big numerals and dual labels ("minutes / by bus") [verified, index.html + wheel/mobile-s100.png]. Register: aspirational property copy ("Where future gains momentum" [verified, index.html]) carrying real figures: 53 300 m², 266 underground and 254 ground spaces, a 12 m lobby ceiling [verified, index.html].

## 2. Structure and components
- Preloader: stepped white block with the wordmark and a percentage, over the dimmed lattice scene [verified, desktop-rm-s00.png]. Repeat-visit skip [unknown]: no `sessionStorage` in shared.js or landing.js [verified, absent].
- Header: hamburger, wordmark (appears once the hero panel leaves), Select office space, a favourites heart with counter (`favouriteCounter`), Contact us [verified, desktop-s50.png + index.html]. Phone: hamburger, wordmark, Contact us only [verified, wheel/mobile-s100.png].
- Menu overlay: the nine chapters, select office and parking space, and a two-field callback form with two separate consent checkboxes [verified, index.html].
- Key-figures stage: a sticky section (`sticky--under-previous sticky--under-next`) with three figures (floors, total area, commissioning) over the lattice scene, driven by a scrubbed `--progress` [verified, index.html].
- Location: a line-drawn street map with icon pins (metro, airport, café, clinic, gym, park) over a full-bleed portrait video, with a stepped numeral panel ("8 minutes by bus") and a three-segment progress bar with a `1 / 3` counter [verified, wheel/mobile-s100.png + index.html].
- Master plan: a modal holding the 3D site model with named zones (territory, offices, retail, recreation, courtyard, charging, parking), each with a figure and a Select CTA [verified, index.html `#plan-map-modal` + webgl-club.js].
- Carousels with thumbnails and `n / 5` counters for architecture, offices, infrastructure; 42 tooltips; an architect's-statement modal [verified, index.html data-plugin counts].
- Footer: hours, a Contact me action, legal notice that renders may differ from the finished building, studio credit [verified, index.html].
- A "turn your device over" orientation notice exists in the markup [verified, index.html]; its trigger [unknown].

## 3. Visual language
Ground is a blue-black navy rather than a warm near-black; every surface is navy, white or a cool grey, and the only warmth on screen is the amber façade lighting in the renders [verified, captures + global.css]. That makes the photography the accent: the page is dressed like the building at dusk. The stepped block is the one shape: rectangles that lose a corner step, in white on navy or navy on white [verified, captures]. Type is one grotesque in uppercase at small sizes with generous tracking, and light, wide display numerals and a single outsized "A" [verified, desktop-s50.png, wheel/mobile-s100.png]. The fluid root `--scale-text-rem` runs from .7rem to 1rem between 980 and 1200 px viewport widths; the largest display step is 24.3 × that unit [verified, global.css]. Hairline frames (`--c-border`) draw cards over imagery [verified, desktop-s50.png]. `theme-color` is set to the ground colour; the safari mask icon is white [verified, index.html].

## 4. Motion and effects (with parameters)
- One easing everywhere: `cubic-bezier(.7,0,.3,1)`, 102 occurrences, at .5 s for colour and border, .7 s for transform plus opacity, 1.2 s for large transforms [verified, global.css + landing.css].
- Scroll: Locomotive 4 smooth mode, `lerp .1`, `multiplier 1`, `touchMultiplier 2`, tablet breakpoint 768 [verified, shared.js]. 12 000 px of wheel input over the five desktop states did not scroll past the hero stage [verified, wheel/desktop-s100.png].
- Attribute-authored scroll keyframes: 219 `data-plugin="parallax"` elements declare keyframes such as `data-parallax-0-0='{"--progress":"0"}'` → `data-parallax-100-100='{"--progress":"1"}'` with `data-parallax-clamp`, so scroll writes CSS custom properties and CSS does the drawing [verified, index.html].
- Snap engine: `data-scroll-snap-point` on 14 sections, read into `{viewport, element, direction, scrollable}` points, plus "gravity wells" (`data-scroll-gravity-well`) that pull the scroll toward a viewport/element alignment [verified, shared.js + index.html]. The 14 attributes carry no value, so whether snapping engages on this page [unknown].
- 90 `appear` and 11 `reveal` plugins for entrances [verified, index.html]; their timings [unknown].
- 3D plan camera: camera-controls with `smoothTime` .2 and .6, polar angle clamped between about 1.1 and 1.5 rad, distance 40 to 53.5, two-finger touch zoom, `setLookAt` for zone fly-tos [verified, webgl-club.js]. Renderer `antialias:false`, `toneMapping` with exposure, `outputColorSpace` set [verified, webgl-club.js].
- Page transitions via Barba [verified, shared.js]; the transition's look [unknown].
- Sound: none found [verified, absent in index.html].

## 5. Tech and pipeline
Webpack runtime with a named lazy-chunk map (`threejs`, `webgl-club`, `webgl-fps-counter`, three reCAPTCHA variants) [verified, shared.js]. Transfer: shared.js 563 KB (170 KB gzip), threejs.js 871 KB (214 KB gzip), webgl-club.js 35 KB, landing.js 29 KB, global.css 374 KB, landing.css 118 KB, the HTML itself 727 KB [verified, curl sizes + local gzip]. Images are `<picture>` sets with `@xxxl.webp` variants [verified, index.html]; zero `loading="lazy"` attributes across 186 images [verified, index.html]. The site model ships as Draco-compressed glTF with KTX2 support in the bundle [verified, threejs.js + webgl-club.js]. CLS 0.0073 desktop, 0 mobile; no console errors [verified, manifest.json]. The capture's LCP figure is a headless artefact and not quoted. Meta: OG and Twitter cards, JSON-LD Organization and WebPage, canonical `/en/`, `lang="en"` [verified, index.html].

## 6. Weaknesses
- **Reduced motion: fail.** No `prefers-reduced-motion` in the CSS or site code; the one match is inside the bundled Framer Motion runtime [verified, global.css, landing.css, landing.js, shared.js]. `desktop-rm-s50.png` matches `desktop-s50.png`; the page does read at rest [verified, captures].
- **Keyboard: partial.** A focusable skip link and 67 `aria-label`s exist [verified, index.html]; key handlers cover form inputs and modal close only, and the 3D plan has none [verified, shared.js, webgl-club.js]. The zone list in the markup is the keyboard path.
- **DOM behind the canvas: pass.** All figures, zone names and copy are in the served HTML [verified, index.html].
- **Load gate: fail on repeat.** A preloader counting to 100 % on every visit, with no repeat skip found [verified, captures + absence in source].
- **Phone: partial.** Chapters are re-laid for 390 px [verified, wheel/mobile-s100.png], but smooth mode is forced on smartphones, so touch scrolling is replaced by a lerped transform [verified, shared.js], and landscape gets a rotate notice [verified, index.html].
- **Wayfinding: partial.** Numbered chapters and `n / 3` counters orient well, but the hero scrub is long enough that 12 000 px of wheel input stays inside it [verified, wheel captures].
- **Semantics.** One `<main>`, one `<h1>`, 13 `<h2>`, no `<nav>` element; 185 of 186 images have `alt=""`, including renders that carry the building's argument [verified, index.html]. Accessibility 6.60 was the entry's lowest developer score [verified, Awwwards entry].
- Cookie box overlaps the lower-left of every desktop frame [verified, captures].

What the awards skills do differently: a reduced-motion tier that drops the smooth scroller and shortens the hero stage `[recipe:reduced-motion-switch]`; native scroll on coarse pointers; a sessionStorage short path for the loader `[recipe:preloader-counter-hold]`; arrow keys and a listed zone index for any orbitable model; real alt text on renders that make the case.

## 7. Principles
1. **Let the product's geometry become the UI's one shape.** A single silhouette taken from the thing being sold, used for loader, panels, buttons and dialogs, reads as identity rather than decoration.
2. **When the imagery is warm, keep the system cold.** A cool, accentless palette lets the photography be the only chroma and makes it glow.
3. **Specification beats superlative for high-ticket B2B.** Areas, counts, minutes and heights at display scale do the persuading; adjectives only frame them.
4. **Give a 3D model a clamped, damped orbit, not free rein.** A narrow polar band and a short distance range keep every view a composed one.
5. **Author scroll as data on the element.** Keyframes that write CSS custom properties keep motion declarative and inspectable.

## 8. Take / Don't take
- **Take:** one product-derived silhouette reused across chrome `[pattern:hero-archetypes]`; a cool accentless palette with chroma outsourced to imagery `[pattern:color-and-material#chroma-outsourced-to-imagery]`; figure-first chapters with dual labels `[pattern:copy-and-content#numbers-not-adjectives]`; a clamped orbit camera (narrow polar range, short dolly range, two smoothing times) for an explorable model with named zones `[pattern:components-catalog#interactive-map-cards]`; scroll keyframes declared as data attributes that write CSS variables `[pattern:motion-vocabulary]`; a single ease token used everywhere; a lazy GL chunk kept out of the entry bundle.
- **Don't take:** the stepped "bitten-corner" block as drawn; the hexes
  #070b20 [verified, global.css]
  and #e3e6eb [verified, global.css]
  as a pair; TT Norms Pro at 400/450 uppercase as the whole type system; the chapter order; the hero sequence (wordmark panel → Class A card → render pull-back); any copy line; the renders, map or glass lattice; smooth scroll forced on phones and the unconditional preloader.

## 9. Confidence and sources
Awards and dev scores high (entry page fetched and captured) · stack high (signatures and versions in served JS) · palette and type high (CSS tokens) · hero, mobile and reduced-motion frames high (captures) · desktop chapters after the hero medium (source only; never reached in capture) · motion parameters high where numbered, `[unknown]` where marked · performance low (transfer sizes only, no field data).
**Live pass 2026-09-23: reachable; capture exit 2 (desktop s25 and mobile s50–s100 screenshot timeouts); `scrollMode: wheel`, so rerun once with `--wheel 12000 --wait 6000 --timeout 90000`, which moved desktop only through the hero stage and mobile to the location chapter.** Sources: `.awards/research/likova/` (`desktop-s00/50/75/100.png`, `mobile-s00/25.png`, `desktop-rm-s00…s100.png`, `manifest.json`, `wheel/desktop-s00…s100.png`, `wheel/mobile-s00/25/100.png`, `wheel/manifest.json`, `index.html`, `global.css`, `landing.css`, `shared.js`, `landing.js`, `threejs.js`, `webgl-club.js`), Awwwards entry `awwwards.com/sites/likova` (`entry/entry.html`, `entry/desktop-s00.png`).
