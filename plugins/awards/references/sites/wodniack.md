# AW Portfolio (Antoine Wodniack) — https://wodniack.dev/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio (freelance creative developer, single page) [verified, index.html `<title>` and description] |
| Visitor mode | persuade, experience-led: a "Hire me" action sits in the header at every width [verified, desktop-s00.png, mobile-s00.png] |
| Awards | Awwwards **Site of the Day, 12 Dec 2024**, **7.56** — Design 7.53 · Usability 7.30 · Creativity 7.96 · Content 7.69; **DEV AWARD 7.58** — Semantics/SEO 7.20 · Animations/Transitions 8.40 · Accessibility 6.20 · WPO 7.80 · Responsive Design 7.80 · Markup/Meta-data 7.60 [verified, entry page awwwards.com/sites/aw-portfolio, captured 2026-09-23]. The site's own awards block claims CSSDA WOTD × 18, WOTM × 1 and GSAP SOTM Oct and Nov 2024 [verified, extra/desktop-s12.png; the underlying awards not checked] |
| Corpus rating | D 7.9 / U 6.3 / C 7.6 / Co 7.4 → weighted 7.31, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Antoine Wodniack (PRO) is the only name on the entry [verified, entry desktop-state-s0.png]; design and development credits beyond that [unknown] |
| Stack (evidence level) | **Astro 4.15.9** (`generator` meta, `/_astro/` hashed assets) [verified, index.html] · **GSAP 3.12.5** + ScrollTrigger, SplitText, DrawSVGPlugin, EasePack (SlowMo), Observer [verified, hoisted.js banners and `registerPlugin`] · **Lenis 1.1.13**, default options, driven from `gsap.ticker` with `lagSmoothing(0)` [verified, hoisted.js `window.lenisVersion="1.1.13"`, `initLenis()`] · no WebGL library: two canvases, both `getContext("2d")`, zero `webgl` strings [verified, hoisted.js; manifest.json `canvases: 2`] · Cloudflare in front (`/cdn-cgi/` email decode) [verified, index.html] · fonts Bigger Display, PP Editorial New, PP Fraktion Mono, self-hosted woff2 [verified, index.html preloads] · CMS [unknown] |
| Palette | two tokens swapped by section, plus a shadow tone for extruded letters; a header toggle re-points the ground to off-white (see §3) [verified, index.css `:root` and `.theme-contrasted`] |
| Type | condensed poster display (Bigger Display, 700) + light editorial serif as the text voice (PP Editorial New Regular/Ultralight) + mono micro-labels (PP Fraktion Mono); no grotesque anywhere [verified, index.css `--font-family-*`, index.html preloads] |
| WebGL dosage | none — SVG line fields, two canvas-2D layers and CSS 3D (`preserve-3d`, `translate3d` to `--z:-1000vw`) [verified, index.css + hoisted.js] |
| Scroll model | native + smooth library (Lenis 1.1.13 on the GSAP ticker), one long scrubbed section; manifest `scrollMode: native` [verified] |
| Narrative model | gallery — one page: hero → about with an awards stack → a 34-project video reel inside the WORK title → a throwable-object toy → CTA [verified, captures + index.html sections] |

## 1. Concept and narrative
The developer's own site as a poster that keeps moving: every section is one heading made spatial, and the work is shown as motion, not described. The register is dry and self-deprecating — the header status line cycles through loading jokes such as "Compiling designer dreams…into developer nightmares" [verified, hoisted.js `messages`].

Beats [verified, desktop-s00…s100 + extra/desktop-s06…s94]: a red ticket-like header and a field of noise-bent vertical lines above a full-width condensed "CREATIVE ✦ DEVELOPER" → an about text in a light serif set inside a drawn perspective room → awards stacked as boxes down the corridor → the word WORK in a black capsule, which grows until the visitor is inside it and ghost rows of W, O, R, K fly past carrying 34 project videos, each tagged with a mono serial (`#…-0015/34`) → back out of the capsule onto a radial floor where "CODING MY WAY SINCE 1987" is set in steep perspective and objects can be grabbed and thrown → a warped grid around a round logo button, then the monogram as the close.

## 2. Structure and components
- **Header as chrome** [verified, desktop-s00.png, index.html]: monogram, a typing status line, About/Work/Contact anchors, CodePen and LinkedIn icons, a contrast toggle (`<button class="js-contrast">`), a location line, the hire link and a QR code. On the phone it collapses to monogram, two icons, "Hire me" and the toggle; the section anchors are dropped [verified, mobile-s00.png].
- **Binary tickers**: thin rules of `► 0101… //////// ◄` above and below the hero title; the digits differ between captures, so they regenerate [verified, desktop-s00 vs desktop-rm-s00].
- **Hero line field**: SVG paths inside an `a-waves` element, drawn in on load and bent by noise and the pointer (§4) [verified, hoisted.js].
- **About room**: a canvas-2D perspective corridor with the text column on its axis; awards as a stacked set of ruled boxes with hatching; smiley sprites drop through it [verified, extra/desktop-s06/s12.png, hoisted.js `.s-about` class].
- **Work reel**: 34 muted looping videos, lazy through `data-src`, set in a CSS-3D scene inside the WORK title mask [verified, index.html 34 × `<video data-src>`; desktop-s25…s75].
- **Throw toy**: `.a-object` elements with 3D sides, `cursor: grab`, thrown into a perspective "catcher" [verified, index.css `.s-my-way`, hoisted.js `thrownObjects`, `draggedObject`].
- **CTA**: an SVG grid that bulges around a hovered circular button [verified, desktop-s100.png, hoisted.js `.s-cta` class with `grid`, `wave`, `buttonIsHovered`].
- **Custom scrollbar**: native bar hidden (`scrollbar-width:none`), a draggable thumb that writes `window.scrollTo` [verified, index.css, hoisted.js `.site-scrollbar`].
- Preloader: none as an overlay; the hero intro starts on `window.load` [verified, hoisted.js `siteLoaded`]. 404 and easter eggs beyond the toy [unknown].

## 3. Visual language
- **Grounds and ink**: primary red
  `#f40c3f` [verified, index.css `:root --color-primary`]
  on oxblood near-black
  `#160000` [verified, index.css `--color-secondary`; also `theme-color`, index.html]
  with a darker red for letter extrusions
  `#540000` [verified, index.css `--color-shadow`].
  Hero, about and close are red ground with oxblood ink; the work reel inverts to oxblood ground with red letters [verified, desktop-s00/s25/s100].
- **Contrast theme**: `.theme-contrasted` swaps the primary to an off-white
  `#fff2ed` [verified, index.css]
  and the shadow to a warm grey
  `#4d4040` [verified, index.css].
- **Type**: the display face runs at poster scale — `min(15vw,18.5rem)/.8`, `min(18.75rem,25lvh)/1` — always uppercase and tightly led; body text is the light serif at 16 px / 1.48 with `-.025em` tracking; mono labels are 8–10 px, letter-spaced [verified, index.css]. The title words carry a stepped drop shadow in the shadow token [verified, desktop-s25.png].
- **Line work as material**: every surface is drawn in hairlines — the noise field, the corridor, grids, hatching, radial floors. No photography of its own; colour and imagery beyond the two tokens come only from the project videos [verified, captures].
- **Surfaces**: `::selection` inverts the tokens, `theme-color` is the oxblood, a thin red custom scroll thumb sits on the right edge [verified, index.css, index.html, captures].
- **Layout**: a 1rem framing border around the viewport, 44 media queries at 576/767/987/1080/1280 and above [verified, index.css]. The phone layout is designed: the title breaks to two lines, the tunnel keeps its composition [verified, mobile-s00/s25/s50].

## 4. Motion and effects (with parameters)
- **Smooth scroll**: Lenis defaults (lerp .1, exponential damping `1 - exp(-60·lerp·dt)`) ticked from `gsap.ticker`, `lagSmoothing(0)` [verified, hoisted.js].
- **Hero intro**: the SVG lines draw with DrawSVG from `"100% 100%"` to `"0% 100%"`, 3 s `expo.out`, stagger amount .5 `from:"edges"`; the frame border collapses and re-opens with `expo.inOut` 1 s; the title is revealed by a `clip-path` polygon wipe, 1 s `expo.inOut`; the star rotates in from 90° over 2 s [verified, hoisted.js `intro()`].
- **Line field**: each point's offset angle is `perlin2((x + t·.0125)·.002, (y + t·.005)·.0015)·12`, giving `x = cos·32`, `y = sin·16` px; the pointer pushes points within `max(175, pointer speed)` px, with a spring of .005 back to rest and velocity damping .925 per frame [verified, hoisted.js `movePoints`].
- **Work tunnel**: one timeline, ScrollTrigger `start:"top 25%"`, `end:"bottom 75%"`, `scrub:1`; the capsule mask scales from 1 to a computed `maxScale` with `power4.in`, then letter ghosts and videos travel in z [verified, hoisted.js `setTimeline`]. Easing house style: `expo.inOut` ×9, `power4.inOut` ×6, `expo.out` ×5 [verified, hoisted.js count].
- **Smiley rain**: canvas-2D sprites with gravity `vy += .45` per frame and random spin [verified, hoisted.js].
- **Header console**: a typed status line cycling through the message list [verified, hoisted.js `writeDelay`, `messages`].
- **Reduced motion**: no branch — 0 × `prefers-reduced-motion` in CSS or JS; the rm frames still show the animated field and tunnel [verified, index.css, hoisted.js, desktop-rm-s00/s25/s50].
- Sound: none found [verified as an absence, hoisted.js].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Astro 4.15.9, one hoisted script | [verified, index.html] |
| Motion | GSAP 3.12.5, ScrollTrigger, SplitText, DrawSVG, SlowMo | [verified, hoisted.js] |
| Scroll | Lenis 1.1.13 on `gsap.ticker` | [verified, hoisted.js] |
| Graphics | SVG paths + canvas 2D + CSS 3D, no WebGL | [verified, hoisted.js, index.css] |
| Media | 34 MP4s, `data-src`, `muted loop playsinline`, 1082 × 636 | [verified, index.html] |
| Fonts | 5 woff2 preloads | [verified, index.html] |

Weights: `hoisted.js` 196 KB and `index.css` 73 KB uncompressed [verified, fetched files]. The manifest's 171 failed requests are all aborted MP4 loads when the capture moved on [verified, manifest.json]; zero console or page errors [verified, same]. `lcpColdSynthetic` is a headless artefact and not quoted. Resize is throttled at 200 ms and rebuilds the line grids [verified, hoisted.js].

## 6. Weaknesses
- Reduced motion: **fail** — no tier; text stays readable at rest, but the field, tunnel and rain never stop [verified, desktop-rm-*].
- Keyboard: **fail** — `*{outline:none}` with no `:focus` rule anywhere, no `keydown` handler; the throw toy and scrollbar thumb are pointer-only [verified, index.css, hoisted.js].
- DOM behind the canvas: **pass** — one `<h1>`, real `<h2>`s, 18 images all with `alt`; the canvases are decoration. But zero `aria-*` attributes and no `<main>` [verified, index.html].
- Load gate: **pass** — no preloader overlay; the content is in the DOM from the first frame [verified, index.html, desktop-s00]; whether the intro replays on repeat visits [unknown].
- The phone: **partial** — the layout is designed, but the section anchors vanish, leaving only scroll [verified, mobile-s00].
- Wayfinding and conversion: **partial** — the hire link is always visible; nothing shows which chapter you are in, and the 34 projects carry a name and serial but no link or role [verified, desktop-s25…s75; links per work unknown].
- The entry agrees: Accessibility 6.20 is its lowest developer score [verified, entry page].
- **What the awards skills do differently**: a three-tier motion switch [recipe:reduced-motion-switch] that freezes the line field at its drawn state and turns the tunnel into a plain list of works; visible focus styles and a keyboard path for the toy and the scrollbar [pattern:cursor-and-pointer#drag-affordances]; the phone keeps a way to jump to Work and Contact; each project in the reel links to something or names the role played.

## 7. Principles
1. **Two tokens, swapped, are three registers.** Ground and ink that trade roles per section give a page rhythm without a third hue; let only the content bring outside colour.
2. **Make the heading the space.** When a section title becomes the room the content moves through, the label does the work of a transition.
3. **Draw everything with one line weight.** Hairline fields, grids and hatching held to one weight read as one hand across very different effects.
4. **Chrome speaks the maker's trade.** Status lines, serials and tickers in the builder's own vocabulary do more for voice than a paragraph about it [pattern:typography#labels-as-texture].
5. **Proof as architecture.** Awards set as a built structure read as evidence; the same list as logos reads as decoration.
6. **Showpiece without WebGL.** SVG, canvas 2D and CSS 3D carry a developer showcase at a fraction of the budget; dosage is a choice, not a ceiling [site:the-line].

## 8. Take / Don't take
- **Take:**
  - The noise-displaced SVG line field as an architecture: a grid of points, one Perlin sample per point for angle, a capped pointer impulse with spring .005 and damping .925, redrawn once per ticker frame.
  - The DrawSVG intro shape — `"100% 100%"` → `"0% 100%"`, 3 s `expo.out`, stagger `from:"edges"` [recipe:scroll-drawn-svg-path].
  - Lenis on the GSAP ticker with `lagSmoothing(0)` [recipe:boot-lenis-gsap].
  - A title mask that scales the viewer into the section on `scrub:1`, with content travelling in CSS 3D inside it.
  - A contrast theme done by re-pointing two custom properties [recipe:theme-swap-tokens].
  - Lazy `data-src` video that starts only near the viewport.
- **Don't take:**
  - The red and oxblood pairing and its hexes:
    `#f40c3f` [verified, index.css]
    `#160000` [verified, index.css]
    `#540000` [verified, index.css]
    `#fff2ed` [verified, index.css]
  - The Bigger Display + Editorial New + Fraktion Mono trio; the "CREATIVE ✦ DEVELOPER" hero; the WORK capsule tunnel with ghost-letter rows as-is.
  - Binary tickers, the QR code in the header, the loading-joke console, the "since 1987" catcher and the smiley rain.
  - The section order hero → about room → awards stack → work tunnel → toy → grid CTA.
  - `*{outline:none}` and the missing reduced-motion branch — things to beat, not adopt.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards and scores | high — entry page captured 2026-09-23 |
| Stack, palette, type, motion parameters | high — index.html, index.css, hoisted.js read directly |
| Composition, mobile, reduced motion | high — 15 standard captures + 6 intermediate desktop states |
| Per-project links, CMS, 404, repeat-visit behaviour | unknown |

**Live pass 2026-09-23: reachable, capture exit 0, scroll mode native**; five scroll states reached by native scroll. Sources: `index.html`, `/_astro/index.MJ9FiCyD.css` (saved as `index.css`), `/_astro/hoisted.BvNyQ0G_.js` (saved as `hoisted.js`), `manifest.json`, `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`, `extra/desktop-s06/s12/s18/s82/s88/s94` in `.awards/research/wodniack/`; Awwwards entry `awwwards.com/sites/aw-portfolio` captured into `.awards/research/wodniack/entry/` (consent wall dismissed with "Reject all").
