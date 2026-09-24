# Christoph Nagel — https://christoph-nagel.dev/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio: one-page self-presentation of a web developer, photographer and videographer in the Ruhr area [verified, index.html `<title>`, `meta[name=description]`, JSON-LD `ProfilePage`] |
| Visitor mode | persuade. A *Kontakt* mailto and an *SEO Schnelltest* lead tool sit in the header on every panel [verified, index.html `.header-actions`; desktop-s00.png] |
| Awards | Awwwards Nominee, 27 Aug 2026, listed as "Christoph Nagel Portfolio"; nominees publish no jury axis scores [verified, entry/desktop-s00.png; entry/entry.html] |
| Corpus rating | D 6.8 / U 6.6 / C 6.8 / Co 6.4 → weighted 6.70, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Christoph Nagel, author [verified, index.html `meta[name=author]`]; self-built and self-shot [inferred from the subject of every video and the absence of a studio credit] |
| Stack (evidence level) | no framework and no bundler: one hand-written `script.js` IIFE and one `styles.css` loaded by plain tags [verified, index.html] · **GSAP 3.12.5** core only, loaded `async`, with a Web Animations API fallback for every tween when it fails to load [verified, gsap.min.js banner; script.js `animate()`] · no Lenis, no ScrollTrigger, no Three / OGL signature [verified, grep of fetched files] · a PHP endpoint behind the SEO check (`/seo-check/api/analyze.php`) [verified, seo-check.js] · fonts self-hosted: Anton woff2, Manrope variable TTF [verified, styles.css `@font-face`] · hosting [unknown] |
| Palette | page ground, `theme-color` and the pre-CSS boot ground |
| | `#080808` [verified, styles.css `--bg`; index.html `theme-color`] |
| | ink |
| | `#f4f4f1` [verified, styles.css `--text`] |
| | video stage ground behind the footage |
| | `#101010` [verified, styles.css `.video-stage`] |
| | the one accent, spent only on the preloader meter's danger zone |
| | `#ff4b3e` [verified, styles.css `--red`; script.js `setLoadProgress`] |
| | Strategy: **near-black + off-white with every image forced greyscale in CSS** (`grayscale(1) contrast(1.04) brightness(0.62)`); muted text, hairlines and glass are white at stepped alphas (.68 / .18 / .38) [verified, styles.css] |
| Type | **condensed display + variable grotesque body**: Anton for every heading and the hero word, Manrope 200–800 for body, nav and labels, uppercase micro labels tracked .12–.14em [verified, styles.css `h1…h6`, `body`, `.section-kicker`]. Anton sits on the reflex list for condensed display [verified, references/reflex-lists.md] |
| WebGL dosage | none. 0 canvases on all three profiles; the manifest's `webgl: true` only reports an available context [verified, manifest.json] |
| Scroll model | section switcher. `body { overflow: hidden }`; wheel (|Δy| ≥ 18, 760 ms lock), swipe (> 55 px), arrows / PageUp / PageDown / Space / Home, prev / next buttons and nav buttons step five panels; long chapter copy scrolls inside its own box and hands the wheel back at its edges [verified, script.js; styles.css `.content-panel`] |
| Narrative model | chaptered journey: a portrait intro that cycles three words, then four numbered chapters (web, photography, video, the person), each on its own full-bleed video loop [verified, index.html panels; desktop-s00/s25/s75/s100.png, desktop-rm-s100.png] |

## 1. Concept and narrative
**One idea:** the three trades as three words — code, camera, plain talk — and the site as a short film of the person doing each. The page has no work gallery at all: the evidence is the footage itself, shot and graded by the subject [verified, index.html; captures]. The register is blunt and self-deprecating, "ohne unnötiges Gedöns" (without needless fuss) in the meta description; the video chapter jokes that twelve transitions and dramatic fog are rarely the answer [verified, index.html].

Beats: a VU-meter loader over a blurred, darkened intro loop [verified, script.js `runPreloader`; styles.css `body.is-loading .background-video`]. The intro is a double-exposure portrait with name, subline and a huge word, *Code.* [verified, desktop-s00.png]. The first two wheel steps swap the word in place — *Kamera.*, then *Klartext.* — without leaving the panel [verified, desktop-s25.png; script.js `step()`]. The third step wipes to chapter 01. Each chapter is a left text column on a black gradient shade over a right-weighted greyscale clip: the subject at a desk, behind a stills camera, behind a cinema rig, then on a ridge with a partner and a dog [verified, desktop-s75.png, desktop-s100.png, desktop-rm-s100.png]. The close is the person chapter; the cursor badge relabels itself *Scroll zurück* there and the next button disables [verified, desktop-rm-s100.png; script.js `updateNavigation`].

## 2. Structure and components
- **Preloader**: a glass card with *Webseite wird geladen*, a percentage and a 20-segment VU meter labelled 0–100 %, the top segments (≥ 85 %) marked as the red zone, and a 2 px needle [verified, index.html `.preloader`; script.js segment loop].
- **Topbar**: `CN` roundel home link left, a pill nav of four chapter buttons centre with an underline on the active one, *Kontakt* and a filled *SEO Schnelltest* pill right [verified, desktop-s00.png, desktop-s75.png].
- **Section controls** bottom right: prev and next roundels around a 1 px progress bar scaled by panel index [verified, desktop-s75.png; script.js `progressBar`].
- **Legal footer** bottom left: a flag linking to the English site, *Impressum* and *Datenschutz*, each opening an iframe dialog with a focus trap and Escape [verified, index.html `.legal-layer`; script.js `trapLegalFocus`].
- **Cursor**: a 3.75 rem glass roundel reading *Scroll*, visible only on a fine pointer; over links it grows and pulses [verified, styles.css `.scroll-cursor`, `cursor-link-pulse`; desktop-s00.png].
- **SEO quick-check modal**: a URL field posting to a PHP analyser, with loading and result regions marked `aria-live` [verified, index.html `#seo-quickcheck`; seo-check.js]. Not rendered in this pass.
- **Phone**: a hamburger roundel opens the nav with Kontakt and SEO buttons; each panel sets its own `object-position` for the portrait crop; hero at `clamp(4rem, 21vw, 7rem)` [verified, mobile-s00.png; index.html `data-mobile-position`; styles.css ≤ 620 px].
- **Routes and 404**: none beyond the one page, the two legal HTML files and `/seo-schnelltest/`; a 404 was not requested [verified, index.html links; 404 unknown].

## 3. Visual language
- **Grounds**: always footage. The intro sits under a radial vignette plus top and bottom gradients; content chapters add a left-to-right black shade (.88 → 0 by 72 %) so the text column reads [verified, styles.css `.video-treatment`, `.content-shade`].
- **Material**: film grain as a 170 px PNG tile at .16 opacity, `overlay` blend, `contrast(1.42)`, jittered through six positions in 0.18 s steps [verified, styles.css `.grain`, `@keyframes grain-shift`]. Chrome is frosted glass: `blur(12–16px) saturate(120%)` on the nav pill, controls and cursor [verified, styles.css].
- **Type scale**: hero word `clamp(4rem, 13vw, 12.8rem)` at line-height .84 in a clipped word window; chapter titles `clamp(2.25rem, 4.25vw, 4.7rem)`, capped at 2.8 rem below 1 937 px; body `clamp(0.94rem, 1.05vw, 1.15rem)` [verified, styles.css]. Macro/micro contrast comes from the huge condensed word against 0.7 rem tracked caps.
- **Layout**: one fixed stage; the text column is `min(35vw, 42rem)` wide, capped at `100dvh − 12rem` tall, on the left third; imagery is framed to the right [verified, styles.css `.content-panel`; desktop-s75.png].
- **Browser surfaces**: `color-scheme: dark`, `theme-color` on the ground, thin translucent scrollbars inside panels, a 2 px white `:focus-visible` outline [verified, styles.css; index.html]. No `::selection` rule [verified, grep].

## 4. Motion and effects (with parameters)
- **Chapter change** (the signature): two `<video>` elements are double-buffered. The incoming one gets the next panel's poster and source and starts at `clip-path: inset(0 100% 0 0)` (reversed going back). One timeline: outgoing copy `y −24, opacity 0`, .34 s `power2.in`, stagger .025; at .12 s a 1 px white seam (opacity .76, glow `0 0 32px 7px`) runs `left 0 → 100%` in step with the clip opening, both 1.0 s `expo.inOut`; the seam fades at 1.0 s; incoming copy `y 42 → 0` over .72 s `power3.out`, stagger .065, from .66 s [verified, script.js `prepareNextVideo`, `switchPanel`]. The nav highlight moves at the start, not the end [verified, script.js comment and loop].
- **Hero word cycle**: next word from `yPercent ±118`, current out to `∓118` with opacity 0; .72 s and .78 s `power4.inOut`, offset .04 [verified, script.js `setHeroWord`].
- **Preloader**: the target is `min(86, 18 + t·0.034)` until the intro video (`canplaythrough` or `loadeddata`), `window.load` and `document.fonts.ready` all report; then 99.6. Progress eases toward it at .042, then .105 per 60 Hz frame, dt-scaled, plus a `sin(now/88)` wobble up to 1.25 points. Minimum 1 800 ms, maximum 4 800 ms [verified, script.js `runPreloader`]. Exit: glass `scale .94, y −20, opacity 0` .48 s `power3.in`; loader `clip-path inset(50% 0 50% 0)` .68 s `expo.inOut`; the video un-blurs to its graded filter over 1.05 s `power3.out`; intro copy rises from `y 36`, .9 s, stagger .11 [verified, script.js `finishPreloader`].
- **Cursor**: lerp .2 per frame toward the pointer, snapped to 1 under reduced motion or with a dialog open; the legal iframes post pointer coordinates back so one cursor survives inside them [verified, script.js `renderCursor`, `message` listener].
- **Fallback vocabulary**: without GSAP every tween maps to WAAPI on `cubic-bezier(.2,.75,.2,1)` or `(.7,0,.2,1)` [verified, script.js].
- **Reduced motion**: every duration drops to .01 s, staggers to 0, videos stay paused on their posters, the preloader bounds shrink to 100–250 ms, grain stops, and CSS transitions collapse to .001 ms [verified, script.js `reducedMotion` branches; styles.css `@media (prefers-reduced-motion)`].
- **Sound**: none [verified, all videos `muted`; no audio element].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| Markup | static HTML, all five panels server-rendered with full copy; JSON-LD `Person` + `WebSite` + `ProfilePage` [verified, index.html] |
| Script | one IIFE, `defer`, booting on GSAP's `load`, its `error`, or a 900 ms timeout [verified, script.js `startOnce`] |
| Motion | GSAP 3.12.5 core `gsap.to` / `timeline` only [verified, gsap.min.js; script.js] |
| Media | five HD MP4 loops under `assets/videos/original/`, one JPG poster each; only the intro loads eagerly, the rest on demand [verified, index.html `data-video`, `preload="none"` on buffer B] |
| Boot | body hidden until `styles.css` fires `onload`, with an 8 s timeout and a `<noscript>` release; `<noscript>` also unstacks the panels into a readable document [verified, index.html] |

Fetched text weights, raw: index.html 22.7 KB, styles.css 31.2 KB, script.js 31.4 KB, gsap.min.js 72.2 KB, seo-check.js 7.1 KB [verified, fetched files]. Video weights not fetched. No console or page errors; the only failed requests are aborted MP4 range loads when the capture moved on [verified, manifest.json]. CLS 0.417 desktop, 0.807 phone, 0.012 under reduced motion, which points at the animated panel entrances rather than layout [verified values, manifest.json; cause inferred].

## 6. Weaknesses
- Reduced motion: **pass**. `desktop-rm-s00` and `rm-s100` read at rest with full copy; videos park on posters [verified].
- Keyboard: **partial**. Arrows, PageUp / PageDown, Home, buttons for every chapter, a skip link, a focus trap in the legal dialogs and a visible outline [verified, script.js; styles.css]. But the window listener calls `preventDefault` on Space for every target, which likely stops Space from pressing a focused button [verified code; effect inferred].
- DOM: **pass**. All text is in the markup; the panel announcer is a polite live region; hidden panels carry `aria-hidden` [verified, index.html].
- Load gate: **fail**. Every visit holds at least 1.8 s, with no session memory, and the body stays hidden until the stylesheet loads [verified, script.js; index.html].
- Phone: **partial**. The layout is designed (menu, per-panel crop, hero rescaled), but chapter copy scrolls inside a box capped under the chrome, so `mobile-s25` shows the chapter title scrolled out of view mid-read; CLS 0.81 [verified, mobile-s25.png, manifest.json].
- Wayfinding and conversion: **pass / fail**. Numbered kickers, the active nav underline, a progress bar and a hash per chapter orient well, and contact is one click. But a portfolio with no work shown leaves the persuasion to prose paragraphs [verified, captures; index.html].

What the awards skills do differently: evidence before biography (at least one piece of work per trade); the wheel is never locked for a whole viewport of copy — chapters become sticky stages over a native document, or copy stays short enough to fit a panel; the loader plays once per session (`[recipe:preloader-counter-hold]`); Space is only captured when the page itself has focus.

## 7. Principles
1. **Let the medium carry the credential.** When the claim is "I shoot and cut film", the page's backgrounds can be that film, and the transitions can be cuts a video editor would sign.
2. **Stretch the hero across the first input steps.** Spending two wheel steps on in-place word swaps before the first chapter change turns a slogan into a paced sequence, and costs nothing when the visitor jumps by menu.
3. **Grade everything to one look in code.** One CSS filter over every clip makes mixed footage read as one shoot, and the palette stays two tokens because the imagery has no colour to fight.
4. **Give the transition a physical edge.** A thin light seam riding a clip wipe reads as a film gate or a scanner bar; it costs one element and needs no WebGL.
5. **Build the fallback into the animation helper.** A single helper that maps each tween to the Web Animations API when the library fails leaves the page complete if the library never arrives.

## 8. Take / Don't take
- **Take:**
  - Double-buffered full-bleed video with a directional `clip-path` wipe (1.0 s `expo.inOut`) and a 1 px glowing seam on the same clock; preload only the active clip, pause the outgoing one `[pattern:preloaders-and-transitions#transition-archetypes]`.
  - Copy out on `power2.in` (.34 s, short stagger) before the wipe, copy in on `power3.out` (.72 s) overlapping its last third.
  - A loader whose instrument speaks the trade (a level meter for a videographer), fed by real signals — media ready, `load`, `fonts.ready` — with a minimum hold and a hard ceiling `[recipe:preloader-counter-hold]`.
  - An always-present primary action in the chrome, plus a live-region announcer naming each chapter.
  - A `<noscript>` rule that turns the fixed stage back into a readable document.
- **Don't take:**
  - The palette as literal values:
    - `#080808` [verified, styles.css]
    - `#f4f4f1` [verified, styles.css]
    - `#101010` [verified, styles.css]
    - `#ff4b3e` [verified, styles.css]
  - The three-word cycling slogan, the chapter list and titles, any of the copy, the VU meter with its red zone as drawn, the double-exposure portrait and the self-shot footage.
  - Anton as the display face: it is a reflex condensed display `[pattern:typography#choosing-by-character-class]`.
  - A wheel lock over panels whose copy must be scrolled inside a box, a loader on every visit, and Space captured globally: these are the parts to improve on.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high: served HTML, styles.css, script.js, gsap.min.js banner, seo-check.js |
| Awards | high: entry page read (Nominee, date); nominees have no jury axis scores; rating is this corpus's own [inferred] |
| Concept, structure, visual language | high: desktop s00 / s25 / s75 / s100, five reduced-motion frames, five phone frames |
| Motion parameters | high: read from script.js and styles.css; the SEO modal and legal dialogs were not rendered |
| Weaknesses | high for reduced motion, load gate, DOM and phone; the Space-key effect is inferred from code |

**Live pass 2026-09-23: reachable, `scrollMode: wheel`, capture exit 2.** The states were reached by wheel steps and every frame moved (s25 = second hero word, s75 = chapter 02, s100 = chapter 03 on desktop; chapter 04 in `desktop-rm-s100`), so no retry was needed. `desktop-s50` timed out and is missing. Sources in `.awards/research/christoph-nagel/`: 14 captures + `manifest.json`; `index.html`, `styles.css`, `script.js`, `gsap.min.js`, `seo-check.js`; `entry/desktop-s00.png`, `entry/entry.html` (Awwwards entry, consent panel over the page).
