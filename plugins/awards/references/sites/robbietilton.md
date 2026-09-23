# Robbie Tilton — https://robbietilton.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio (product designer and founder, one page plus an About view) [verified, index.html description and markup] |
| Visitor mode | persuade: the work is the pitch, the only action is an e-mail link in the footer [verified, desktop-s100.png, index.html `mailto:`] |
| Awards | Awwwards **Site of the Day, 28 Jul 2012**, **6.99** — Design 7 · Usability 6.63 · Creativity 7.5 · Content 7 [verified, entry page awwwards.com/sites/robbie-tilton, captured 2026-09-23]. The entry shows a **predecessor site** (red ground, Portfolio / Archive / Blog nav) and no developer scores; the design analysed here is not the one that was judged [verified, entry/desktop-s00.png] |
| Corpus rating | D 6.6 / U 6.3 / C 6.4 / Co 6.9 → weighted 6.50, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Robbie Tilton, self-built; the About view names his studio Wonder Assembly [verified, index.html]; other credits [unknown] |
| Stack (evidence level) | no framework, no bundler: one hand-written HTML file with inline `<style>` and `<script>` [verified, index.html] · **jQuery 3.7.1** from code.jquery.com [verified, index.html `<script src>`] · no animation, scroll or 3D library: 0 × gsap, lenis, three, canvas [verified, index.html; manifest.json `canvases: 0`] · Google Analytics gtag [verified, index.html] · fonts: none loaded, system `sans-serif` / `'Helvetica'` [verified, index.html] · hosting [unknown] |
| Palette | white ground, graphite ink, two greys, no accent token; chroma comes only from the product photography (see §3) [verified, index.html inline CSS] |
| Type | system sans only — `font-family: sans-serif`, the About view `'Helvetica', sans-serif`; no web font; captions 16 px at 700 [verified, index.html] |
| WebGL dosage | none — manifest `webgl: true` only reports a context was available; no canvas in the DOM [verified, manifest.json] |
| Scroll model | native, no smoothing library; on fine pointers a hand-rolled drag-to-scroll with momentum and rubber-band overscroll writes `window.scrollTo`; each chapter is a snapped horizontal carousel [verified, index.html; manifest `scrollMode: native`] |
| Narrative model | gallery — four career chapters, newest first, one carousel row each [verified, desktop-s00…s100] |

## 1. Concept and narrative
A career told as a stack of product shelves. Each row is one employer or period, captioned with a name and a date range; the visitor reads the CV by moving down and browses the work by moving sideways. The feel borrows from phone OS physics rather than from web motion: things snap, stretch and spring back instead of fading in. Copy is plain and first-person; the About view closes with a personal essay under the heading "Notes to the explorers" [verified, index.html].

Beats [verified, desktop-s00…s100]: a two-word header (name left, "More Info" right) over a white field → the first row: a large rounded card holding a hand-held hardware prototype, the chapter caption floating at the left edge, the next card a blurred ghost at the right edge → a studio-work row → a row for a head-mounted computer programme → a row for an earlier wearable → an 11 px footer of social links and the e-mail line. There is no hero statement: the first project image is the hero.

## 2. Structure and components
- **Two views, one document**: the portfolio and the About view are sibling `<div>`s; "More Info" swaps them with `display`, calls `history.pushState` to `/more-info` and handles `popstate` [verified, index.html `showView`].
- **Chapter row**: `.carousel-container` holding a flex strip of `.carousel-item` cards (2–6 per row), two invisible half-width click zones for previous / next, and a caption overlay [verified, index.html].
- **Caption that becomes a card**: clicking the caption grows it into a translucent panel with a paragraph about the period; it closes on mouse-leave. On the phone the caption moves below the card, centred [verified, index.html `openDetail`, mobile-s00.png].
- **Custom cursor**: a 40 px frosted disc replacing the system cursor on fine pointers; it shrinks to nothing over captions and links [verified, index.html `.custom-cursor`].
- **Footer**: three-column grid, grey labels with darker links, collapsing to one centred row of four links on the phone [verified, desktop-s100.png, mobile-s100.png].
- **About view**: an intro with a "read more" expander, a social row with follower counts, and a list of hover-highlighted link rows [verified, index.html `#more-info-view`].
- Dormant code: a tab bar (`.tab-button`, one `software` tab), a `#detailModal` lookup and three commented-out project cards [verified, index.html].
- Preloader: none; `.main-content` fades from opacity 0 over .6 s once ready [verified, index.html]. 404 [unknown].

## 3. Visual language
- **Ground and ink**: white page and body
  `#fff` [verified, index.html `html, body`]
  with black body text
  `#000` [verified, index.html `body`]
  and a graphite for the name and nav
  `#272727` [verified, index.html `.nav-left`, `.nav-cta`].
- **Greys as hierarchy**: dates and meta
  `#9B9B9B` [verified, index.html `.carousel-overlay .year`]
  footer labels and inactive text
  `#C7C7C7` [verified, index.html `.footer-label`]
  a pill fill
  `#F0F0F0` [verified, index.html `.pill`]
  and a hairline card border at .5 px
  `#D0D0D0` [verified, index.html `.carousel-item`].
- **The one hue**: text selection in yellow
  `#ffd433` [verified, index.html `::selection`];
  nothing else in the chrome is chromatic. All colour comes from the photographs [verified, desktop-s00…s100].
- **Imagery**: studio product photography on pale seamless grounds — hands holding devices, a face under a headset, a hand dangling a wearable — each inside a card with a 30 px radius; the cards read as one catalogue because every shot shares the white-to-pale-grey backdrop [verified, desktop-s00/s50/s75/s100].
- **Type**: no scale to speak of — 16 px everywhere in the chrome, weight (400 / 700) and grey value doing the hierarchy; the About view goes to 42 px for its intro and 26 px body [verified, index.html].
- **Layout**: desktop cards sit at `min(65vh, 614px)` tall, centred, with the caption pinned 40 px from the left edge at mid-height; below 920 px cards become `74vw` squares [verified, index.html, mobile-s00.png].
- **Surfaces**: no `theme-color`, no favicon link found; `cursor: none !important` on fine pointers; `user-select: none` on the body [verified, index.html].

## 4. Motion and effects (with parameters)
- **Focus by blur**: inactive cards sit at opacity .2 with `filter: blur(6px)`, the active one at 1 and 0; the change runs .5 s `ease-in-out`. Below 920 px the blur is dropped and neighbours sit at opacity .1 [verified, index.html `.carousel-item`].
- **Peek geometry**: the gap between cards is recomputed per move so only a fixed slice of the neighbour shows — peek 10 % of the viewport on desktop, 14 % on the phone, gap `max(20, vw/2 − active/2 − peek)` px [verified, index.html `updateCarousel`].
- **Velocity-graded snap**: on drag release the duration follows the gesture — |v| > 1.2 px/ms → 320 ms; .6–1.2 → 400 → 320 ms; a slow advance 450–600 ms by remaining distance; a snap-back 350–550 ms. Fast flicks use `cubic-bezier(.25,.46,.45,.94)`, slow gestures `cubic-bezier(.32,.72,.37,1)` [verified, index.html touch/drag handlers].
- **Drag-to-scroll on desktop**: mouse-down outside a row and drag scrolls the page after an 8 px threshold; release velocity comes from the last 150 ms of six samples, is scaled by 16 and decays by .95 per frame until under .5 [verified, index.html `globalDrag`]. A wheel event cancels any running momentum [verified, same].
- **Rubber-band overscroll**: past either end the whole page wrapper is translated by `d·(1 − 1/(x·.20/d + 1))` with `d` the viewport height, then returned by a critically damped spring, stiffness 170, damping `2√170 ≈ 26.08`, fixed `dt = 1/60`, resting when |pos| < .5 and |vel| < 5; momentum crossing an edge hands its velocity × .20 × 60 to the spring [verified, index.html `rubberBand`, `springOverscroll`].
- **Magnetic captions**: the caption leans toward the pointer by up to ±12 px through `--parallax-x/y`, footer links by ±4 px [verified, index.html `maxParallaxOffset`, `maxFooterOffset`].
- **Caption expand**: height animated from a measured px value to the measured open height, 500 ms `cubic-bezier(.2,.6,.2,1)`; the paragraph fades in over 1000 ms `cubic-bezier(.2,.8,.2,1)` after 100 ms; the panel takes an 8 px backdrop blur and scales to 1.05 [verified, index.html `.carousel-overlay.is-open`].
- **Cursor**: position written straight to `left/top` on every `mousemove` with no lerp; size and opacity at .15 s; pressed 34 px [verified, index.html].
- **Media discipline**: a row's video plays only while its card is active; GIFs swap to a still when inactive [verified, index.html `updateCarousel`].
- **Keyboard**: ↑/↓ centre the previous or next row (600 ms `easeOutCubic` via jQuery `animate`), ←/→ step the row nearest the viewport centre, Space opens its caption [verified, index.html `keydown`].
- Reduced motion: no branch — 0 × `prefers-reduced-motion` [verified, index.html]. Sound: none [verified as an absence, index.html].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | none; one static HTML file, inline CSS and JS | [verified, index.html] |
| DOM / motion | jQuery 3.7.1 (`animate` for keyboard scroll-to with a custom `easeOutCubic`); everything else CSS transitions and hand-written rAF loops | [verified, index.html] |
| Scroll | native document scroll plus a custom drag, momentum and spring layer | [verified, index.html] |
| Media | `<picture>` with a separate `-mobile.jpg` per card below 920 px; `loading="lazy"`, `decoding="async"`; MP4s `preload="metadata"` with mobile sources | [verified, index.html] |
| Analytics | Google Analytics gtag | [verified, index.html] |

Weights: `index.html` 127 KB uncompressed, all CSS and JS inline [verified, fetched file]. Manifest: 306 DOM nodes, zero console or page errors; the failed requests are aborted MP4 and analytics loads as the capture moved on [verified, manifest.json]. The reduced-motion desktop run logged CLS .158 against 0 in the other runs [verified, manifest.json]. `lcpColdSynthetic` is a headless artefact and is not quoted. Resize is batched through `scheduleRecalc` and, on crossing 920 px, moves the caption node after the strip in the DOM [verified, index.html `handleResize`].

## 6. Weaknesses
- Reduced motion: **partial** — nothing is left hidden, `desktop-rm-s00` reads at rest, but the blur transitions, snaps and springs have no calmer tier [verified, desktop-rm-s00.png, index.html].
- Keyboard: **partial** — a real arrow-key and Space model exists, but cards, click zones and captions are `<div>`s with no `tabindex`, so Tab reaches only the nav and footer links; no `:focus` rule, so focus relies on browser defaults [verified, index.html].
- DOM: **pass with defects** — all content is in the markup, but there is no `<h1>` and no `<main>`, chapter titles are `<div>`s, and alt text is copied between rows (headset photos labelled "Google Glass", studio work "pen") [verified, index.html].
- Load gate: **pass** — no preloader; a .6 s fade only [verified, index.html].
- Phone: **pass** — square cards, captions below, native pan with `touch-action: pan-y` [verified, mobile-s00/s50/s100.png].
- Wayfinding and conversion: **fail on the action** — the e-mail link is 11 px grey text at the far corner of the footer; the rows give no count or position ("2 of 6") [verified, desktop-s100.png, index.html].
- Physics tuned per frame: friction .95 and the spring's fixed `dt = 1/60` run faster on high-refresh displays [verified, index.html; see [pattern:motion-vocabulary#damping-math]].
- `user-select: none` on the body stops visitors copying names or the About text [verified, index.html].

**What the awards skills do differently**: each card is a focusable link in a list with arrow keys moving one item [pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]; the blur and springs drop to instant state changes under [recipe:reduced-motion-switch]; damping reads `dt` from one ticker; the row shows its position; the contact action is a real button in the header.

## 7. Principles
1. **Two axes, two meanings.** When vertical movement means time and horizontal movement means depth within one period, a visitor learns the navigation from the first row.
2. **Focus by subtraction.** Blurring and dimming the neighbours, rather than enlarging the chosen item, keeps every card the same size while making one of them unmistakably current.
3. **Size the peek, not the gap.** Computing spacing from a fixed visible sliver of the next item keeps the "there is more" cue identical across card widths and viewports.
4. **Let the gesture set the duration.** Mapping release velocity to snap time and curve makes a fast flick feel obeyed and a slow drag feel placed.
5. **Edges should answer.** A resisted stretch and a critically damped return at the ends of a scroll tell the visitor they have reached the end without a footer shouting it.
6. **Neutral chrome for a hardware portfolio.** When the photographs share one backdrop, a white page with greys for hierarchy lets the objects be the only colour.

## 8. Take / Don't take
- **Take:**
  - The blur-peek focus model: neighbours at low opacity plus a few px of blur on fine pointers, opacity only on touch, one duration for both.
  - Peek-driven spacing: `gap = max(min, vw/2 − active/2 − peek)`, peek as a fraction of the viewport.
  - Velocity-graded snap: a fast band with a crisp ease-out and a slow band with a softer one, durations in the 320–600 ms range.
  - The rubber-band formula `d·(1 − 1/(x·k/d + 1))` and a critically damped return (damping = 2√stiffness), rebuilt on a `dt`-aware ticker.
  - Pausing video and swapping GIFs to stills whenever a card is not the current one.
  - Arrow keys that move between rows and within the nearest row, as a model to extend with real focus.
- **Don't take:**
  - The white, graphite and grey set with a yellow selection as literal values:
    `#fff` [verified, index.html]
    `#000` [verified, index.html]
    `#272727` [verified, index.html]
    `#9B9B9B` [verified, index.html]
    `#C7C7C7` [verified, index.html]
    `#F0F0F0` [verified, index.html]
    `#D0D0D0` [verified, index.html]
    `#ffd433` [verified, index.html]
  - The career-rows-newest-first layout with a floating left caption as-is; the "More Info" plus icon; the 30 px card radius and .5 px hairline as a pair.
  - Any product photograph, client or employer name, and the "Notes to the explorers" essay.
  - The frosted-disc cursor that hides over links, `cursor: none !important` and `user-select: none` — things to beat, not adopt.
  - The per-frame friction and fixed-`dt` spring, and the missing heading structure and alt text.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards | high — entry page captured and its score table read 2026-09-23; it scores a predecessor design |
| Stack, palette, type, motion parameters | high — everything is inline in index.html |
| Composition, phone, reduced motion | high — 15 standard captures |
| Drag, keyboard and caption behaviour | medium — read from source, not driven in the browser |
| 404, favicon, hosting | unknown |

**Live pass 2026-09-23: reachable, capture exit 0, scroll mode native**; five scroll states reached by native scroll, no wheel retry needed. Sources in `.awards/research/robbietilton/`: `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`, `manifest.json`, `index.html` (the only text asset; all CSS and JS inline). Awwwards entry `awwwards.com/sites/robbie-tilton` captured desktop-only into `entry/` (exit 2, cookie wall over the page) with `entry.html` read for the score table.
