# Sculpting Harmony (Getty, Frank Gehry and the Walt Disney Concert Hall) — https://gehry.getty.edu/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | campaign: a museum's online exhibition marking an anniversary. It tells the story of one building from the archive of the architect who designed it [verified, index.html `<title>`, meta description "A new online exhibition from Getty"] |
| Visitor mode | experience → read: a narrated, scored film layer over long archival essays with "[READ MORE]" expanders [verified, desktop-s50/s75, mobile-s50] |
| Awards | Awwwards **Site of the Day, 17 Nov 2023**, **7.89**: Design 7.97 · Usability 7.52 · Creativity 8.19 · Content 8.04. **DEV AWARD 7.78**: Semantics/SEO 7.80 · Animations/Transitions 8.60 · Accessibility 7.60 · WPO 8.00 · Responsive Design 7.60 · Markup/Meta-data 7.00 [verified, entry page awwwards.com/sites/sculpting-harmony, fetched and captured 2026-09-23]. Site of the Month, November 2023 [recalled medium: only the title of an Awwwards article in one search result; the article was not read] |
| Corpus rating | D 8.0 / U 6.8 / C 7.8 / Co 8.4 → weighted 7.64, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | **Resn** (PRO) with **Getty** [verified, entry page desktop-s50.png]. Music performed by and courtesy of the LA Phil, with narration by the architect [verified, desktop-s00, desktop-s100]. Individual credits [unknown] |
| Stack (evidence level) | **Nuxt 3.6.5** on **Vue 3.3.4** (`/_nuxt/` chunks, `versions:{nuxt:"3.6.5"}`) [verified, index.html, entry.f152f914.js] · **Storyblok** CMS (`/storyblok/cache/` assets, `StoryblokPage` chunk) [verified, index.html] · **GSAP 3.12.1**, which registers ScrollTrigger and SplitText through a `GsapProvider`, and Observer [verified, entry.f152f914.js] · **Lenis 1.0.19** (`window.lenisVersion`) [verified, entry.f152f914.js] · **Three.js r153**, with glTF loader, orbit and a vector-spring helper chunk [verified, entry.f152f914.js revision const, index.html modulepreloads] · **Howler** for sound, version not read [verified, entry.f152f914.js `window.Howler`] · Tweakpane debug panel shipped, switched off (`USE_TWEAKPANE:false`) [verified, index.html] · Nuxt Image `/_ipx/` WebP resizing [verified, index.html] · CloudFront [verified, `getent hosts`] · fonts self-hosted woff/woff2 [verified, index.html `@font-face`] |
| Palette | theme per chapter: four flat institutional hues flood entire chapters, alternating with black and white grounds. Chroma otherwise comes from archival photography and film (hexes in §3) [verified, entry.d6ab82be.css `:root`, captures] |
| Type | light editorial serif for text + a black grotesque in two compressed widths, stretched across the full width for titles + a mono for uppercase labels (Reckless 200/400 + Sharp Grotesk Black widths 15/20 + Roboto Mono) [verified, index.html `@font-face`, entry.d6ab82be.css `font-family`] |
| WebGL dosage | moments. The manifest reports 2 canvases with `webgl: true`. The GL is an explorable model scene: modulepreloaded `InteractiveScene`, `Hotspot`, `orbit` and `gltf-loader` chunks, plus an "[EXPLORE THE MODEL]" control [verified, manifest.json, index.html, desktop-s25]. The rest of the page is video and DOM [verified, 11 `<video>` in index.html] |
| Scroll model | native + smooth library (Lenis 1.0.19). GSAP ScrollTrigger is scrubbed through a shared `useBaseScrollTrigger` composable (`scrub` defaults to `true`) [verified, useBaseScrollTrigger.f0aaf192.js]. The intro and outro films are named `*-scrub.mp4` [verified, manifest.json failedRequests]. manifest `scrollMode: native` [verified] |
| Narrative model | chaptered journey: a sketch preloader, then a scrubbed intro film, then three numbered, titled chapters (each has film, an essay, archival stills and a model beat), then an index / acknowledgements close [verified, desktop-s00…s100, credits list in desktop-s100] |

## 1. Concept and narrative
The idea is an archive told in the architect's own voice, with one piece of music per chapter. The site retells how a building's form was found, by hand, in paper and wood models. The medium follows the same order: a line sketch, then a model, then film of the finished steel [verified, desktop-s00, desktop-s25, desktop-s50].

What the captures show, beat by beat [verified, desktop-s00…s100, desktop-rm-*]:
1. On a flat orange ground, a loose ink line draws itself. A sponsor wordmark sits at the left, "INITIALIZING..." at the right, and a pill invites a click anywhere to enable sound. Below it, a serif note explains that the story has narration and a score.
2. A top-down view of a cardboard hall model sits on black, with a segmented progress bar, a pause control and "[EXPLORE THE MODEL]".
3. The chapter opens on a blue flood: a full-width video of curved steel, a poster-scale drop-cap letter, an essay column and model-making footage.
4. Photo captions sit on white, then a red flood carries the next chapter's title set as full-height stretched letters.
5. The close is a mono credits list for each chapter's recording and the photographers, a full-width stretched title, a "[BACK TO TOP]" link and the trust's copyright.

The register is curatorial and warm. Essay prose is set in the serif; the labels read like museum wall captions [verified, desktop-s50, desktop-s75].

## 2. Structure and components
- **Preloader and sound consent**: the drawn-line sketch, an "INITIALIZING..." label and a click-anywhere sound pill. A `SKIP_PRELOADER:false` flag exists in the public config [verified, desktop-s00, index.html `__NUXT__.config`]. Whether a repeat visit skips it [unknown].
- **Header**: a wordmark, then the current chapter number and title as two mono lines, then a live "SOUND ○ OFF / ● ON" state and "[MENU]". On a phone the chapter shortens to "II.SAILS OF STEEL" [verified, desktop-s50, mobile-s50].
- **Accessible-version link**: the first element in the header is an empty `<a href="/accessibility">` with `aria-label="Click to open accessible version"`. The router maps that route to its own `accessible` layout [verified, index.html; entry.f152f914.js route table]. The route itself was not visited, so its content is [unknown].
- **Menu**: a `<nav>` of chapter items, each with a drawn line image (`menuNavItem__line`) [verified, index.html]. Its open state was not captured.
- **Film player chrome**: a round pause button and a segmented progress bar sit under the film beats [verified, desktop-s25].
- **Chapter body**: a full-bleed film, a single oversized drop-cap letter in the black grotesque, an essay column, inline archival media and grey mono captions with credits, then "[READ MORE]" expanders [verified, desktop-s50/s75, mobile-s50].
- **Stretched titles**: five `titleStretch` blocks (outer / inner / content) set chapter titles edge to edge at full viewport height [verified, index.html, desktop-s75].
- **Explorable model**: an interactive chapter scene with hotspots, orbit and a spring-damped camera vector [verified, chunk names in index.html; render not captured].
- **Close**: a per-chapter music credits list, a photo credits list, a stretched title, back-to-top and copyright [verified, desktop-s100, mobile-s100]. 404 and easter eggs [unknown].

## 3. Visual language
- **Chapter hues** are four custom properties, each used as a whole-section ground:
  `#ffa441` yellow-orange: the preloader and close ground [verified, entry.d6ab82be.css `--getty-yellow`; desktop-s00, desktop-s100]
  `#ff6359` red: the chapter title flood [verified, entry.d6ab82be.css `--getty-red`; desktop-s75]
  `#4596ff` blue: the chapter II flood [verified, entry.d6ab82be.css `--getty-blue`; desktop-s50]
  `#16a147` green: a chapter flood seen on the phone [verified, entry.d6ab82be.css `--getty-green`; mobile-s25]
  The ink is black, with white as the reading ground for captions:
  `#000` [verified, entry.d6ab82be.css]
  `#fff` [verified, entry.d6ab82be.css]
- **Grounds meet film with a soft edge**: the chapter hue bleeds into the top and bottom of full-bleed media as a blur band, not a hard cut [verified, desktop-s50, mobile-s25].
- **Type**: three voices, each with one job. The serif (Reckless Light / Regular) carries the essays and the preloader note. The black grotesque appears only as single drop-cap letters and full-width stretched titles; its two width cuts suggest the stretch is set in type, not drawn as an image [verified, index.html fonts; desktop-s50/s75/s100; the mechanism is inferred]. Mono uppercase is used for chrome, captions, credits and bracketed actions ("[MENU]", "[READ MORE]") [verified].
- **Imagery**: archival sketches, cardboard and wood study models, period studio footage and contemporary photography of the finished steel. The ink sketch line doubles as the preloader and the menu's graphic [verified, captures, index.html `images/menu/line.png`].
- **Layout**: a 6-column grid, side margin 1.2rem / 2rem and top margin `menuHeight + 2rem / 6rem` [verified, entry.d6ab82be.css custom properties]. On the phone the layout is stacked and designed, with separate mobile film encodes [verified, mobile-s00…s100, manifest.json failedRequests].
- **Browser surfaces**: no `theme-color` [verified, index.html]. Selection and scrollbar [unknown].

## 4. Motion and effects (with parameters)
- **Smooth scroll**: Lenis 1.0.19. The site's options (lerp, duration) were not read from its own call site [verified version; options unknown].
- **Scroll choreography**: ScrollTrigger is created through one composable with `scrub` defaulting to `true` [verified, useBaseScrollTrigger.f0aaf192.js]. Intro and outro films are scrubbed, with separate desktop and mobile files (`intro-scrub.mp4` / `intro-scrub-mobile.mp4`, `outro-scrub-mobile.mp4`) [verified names, manifest.json]. The currentTime mechanism is [inferred].
- **Chapter films**: 720p desktop encodes per chapter (`getty_desktop_CH1_720.mp4` …) and a `recap.mp4` per chapter [verified, manifest.json failedRequests].
- **Easing vocabulary** in the app code: `none` ×4, `power3.out` ×2, `power2.inOut` ×2, one each of `expo.out`, `power4.inOut`, `power3.in`, `sine.out`. Durations 1.8, .9 and .5 s recur [verified, entry.f152f914.js counts; counts include the whole bundle].
- **Preloader line**: the ink sketch builds stroke by stroke. desktop-s00 and desktop-rm-s00 show different progress of the same drawing [verified]. Its technique (SVG, canvas or video) [unknown].
- **Model scene**: orbit controls, hotspots and a `three-vector-spring` helper for damped camera or target motion [verified chunk names]. Spring constants [unknown].
- **Sound**: Howler plays the narration and one licensed orchestral recording per chapter (intro, chapters I–III, index) [verified, entry.f152f914.js, desktop-s100 credits]. Consent comes from the first click on the preloader, and the header toggle shows the state in text [verified, desktop-s00, desktop-s50]. Crossfades and levels [unknown].
- **Reduced motion**: no branch. There are zero `prefers-reduced-motion` or `reducedMotion` strings in the fetched CSS or JS. The rm frames match the full-motion ones, and the sketch keeps drawing [verified, entry.d6ab82be.css, entry.f152f914.js, Chapter.96a51b24.js; desktop-rm-s00/s50].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Nuxt 3.6.5, Vue 3.3.4, SSR HTML with the essays in the document | [verified, entry.f152f914.js; index.html contains the essay text] |
| CMS | Storyblok, assets cached under the site's own `/storyblok/cache/` | [verified, index.html] |
| Motion | GSAP 3.12.1 + ScrollTrigger, SplitText, Observer | [verified, entry.f152f914.js] |
| Scroll | Lenis 1.0.19 | [verified, entry.f152f914.js] |
| 3D | Three.js r153, glTF, orbit, hotspots | [verified, entry.f152f914.js, index.html] |
| Sound | Howler | [verified, entry.f152f914.js] |
| Images | Nuxt Image `/_ipx/` with WebP at q70, and responsive `srcset` | [verified, index.html] |
| Hosting | CloudFront | [verified, `getent hosts`] |

Weights: `entry.f152f914.js` is 1.33 MB uncompressed, bundling GSAP, Three, Howler and Vue into one entry. `entry.d6ab82be.css` is 24 KB and `index.html` 162 KB [verified, fetched files]. DOM nodes: 2527 desktop, 1595 mobile [verified, manifest.json]. The 87 failed requests are aborted MP4 loads as the capture moved on, plus blocked ad and analytics pixels (Google, LinkedIn, Snapchat, AppNexus) [verified, manifest.json]. There were no page errors except one rm screenshot timeout at s100 [verified, manifest.json]. `lcpColdSynthetic` is a headless artefact and is not quoted.

## 6. Weaknesses
- Reduced motion: **fail**. There is no tier, though text stays readable at rest because nothing is hidden behind an unplayed tween [verified, desktop-rm-s00/s50].
- Keyboard: **partial**. The page has 28 `<button>` elements and `<nav>` and `<main>` landmarks, and it offers a parallel accessible route. But the logo button is `aria-hidden`, there is no skip link, and whether the model hotspots can be reached by keyboard is [unknown] [verified, index.html].
- DOM behind the canvas: **pass**. The essays, headings and 23 labelled media items are server-rendered. There are five `<h1>` elements, one per chapter or section, which the entry's lowest developer score (Markup 7.00) is consistent with [verified, index.html, entry page].
- Load gate: **fail**. The sketch preloader and sound invitation hold the first viewport. In headless captures where nothing was clicked, the sound note stayed over content at desktop-s25, desktop-s50 and mobile-s25 [verified]. Skipping on repeat visits [unknown].
- The phone: **pass**. It is designed, with separate mobile film encodes and a shortened chapter label [verified, mobile-*, manifest.json].
- Wayfinding and conversion: **pass**. The header always names the chapter; the close has back-to-top [verified]. Grey mono captions on white are faint [verified, desktop-s75; contrast not measured].
- **What the awards skills do differently**: a three-tier motion switch [recipe:reduced-motion-switch] that stops the sketch at its finished drawing and swaps the scrubbed films for posters. Sound consent that never covers content: enter and enter-with-sound carry equal weight [pattern:sound#opt-in-only]. One `<h1>`. A skip link. The accessible version made visible to sighted keyboard users, not only to screen readers. Captions set at a contrast that passes.

## 7. Principles
1. **Let the medium retrace the making.** When a subject was made in stages (sketch, model, finished object), unfold it in the same order, so the page's technique moves forward as the story does.
2. **Give each chapter its own sound.** A different recording per chapter marks a boundary more firmly than a new heading, and the header's state label keeps it honest.
3. **Flood whole chapters with one flat hue.** A small set of saturated grounds, each owning a chapter, gives a long read its rhythm, while photography brings in every other colour.
4. **Hold a display face to one or two jobs.** A heavy face used only for single initials and edge-to-edge titles reads as a system. Spread across headings, it would read as noise.
5. **Ship a parallel accessible route for an experience-first piece.** When the main path is film, sound and scrub, a real alternate layout for the same CMS content is cheaper than retrofitting every beat. Still, make it visible, not only labelled.

## 8. Take / Don't take
- **Take:**
  - One ScrollTrigger factory with scrub on by default, so every scrubbed beat shares its defaults [recipe:scroll-pin-scrub].
  - Separate scrub-cut films for desktop and mobile, not one file scaled down [pattern:asset-pipeline#video-and-volumes].
  - Chapter number and title as live header chrome, shortened on the phone.
  - A CMS-fed alternate layout on its own route, reachable before the experience starts [pattern:accessibility-and-reduced-motion#the-dom-mirror].
  - A mono credits list as the close, crediting each recording and each photograph [pattern:copy-and-content#credits-pages].
  - The explorable model as one beat inside a chapter, not the whole site.
- **Don't take:**
  - The four chapter hues and their hexes:
    `#ffa441` [verified, entry.d6ab82be.css]
    `#ff6359` [verified, entry.d6ab82be.css]
    `#4596ff` [verified, entry.d6ab82be.css]
    `#16a147` [verified, entry.d6ab82be.css]
  - The Reckless + stretched Sharp Grotesk Black + Roboto Mono trio, bracketed mono actions and the drop-cap-letter device as-is.
  - The ink-sketch preloader with the click-anywhere sound pill, and the chapter order sketch → model → steel film → credits.
  - The subject's narration, the orchestral credits and any archival asset.
  - A sound note that covers content until clicked, five `<h1>` elements, and the missing reduced-motion branch: things to beat, not adopt.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards and scores | high: entry page fetched and captured 2026-09-23 (a consent wall covered the captures; scores read from the fetched entry HTML). SOTM medium |
| Stack, palette, type | high: index.html, entry.f152f914.js, entry.d6ab82be.css read directly |
| Composition, mobile, reduced motion | high: 14 captures (desktop-rm-s100 timed out) |
| Model scene, preloader technique, accessible route, repeat visit | unknown or chunk-name level only |

**Live pass 2026-09-23: reachable, capture exit 2 (console errors from blocked ad pixels), scroll mode native.** The five states were reached by native scroll with no retry. Sources, all in `.awards/research/gehry-getty/`: `index.html`, `entry.f152f914.js`, `entry.d6ab82be.css`, `Renderer.0c44b804.js`, `useThree.3cee39ec.js`, `useBaseScrollTrigger.f0aaf192.js`, `Chapter.96a51b24.js`, `manifest.json`, `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s75`. The Awwwards entry `awwwards.com/sites/sculpting-harmony` was captured into `entry/` (desktop only) with `entry.html` fetched as text.
