I hit the session's WebSearch budget cap partway through (200/200 calls were already consumed at session level), so the query count per site is lower than the 10-15 target for sites 1 and 4. I compensated by mining GitHub heavily (the one reachable channel) — which turned out to be very productive, including Lusion's own open-source repos and the complete Floema course source. Everything below is labelled with confidence and sources; nothing is invented.

---

# Batch C research report

## Lama Lama — https://lamalama.com/

- **Type / purpose**: Agency portfolio / self-promotional site for an Amsterdam-based creative digital agency. Positioning line used across their properties: "delivers digital solutions for companies with a conscience and brands with a heart." Services listed as web design, web development, art direction. They also run a product sub-brand at `growsuite.lamalama.com` ("Lama Grow Suite" — search & AI-visibility services), so the main site doubles as a top-of-funnel for both agency services and a productised offering.

- **Awards & recognition** (confidence: medium-high on the facts, medium on exact dates because awwwards.com itself was unreachable and these came from search-result extraction):
  - Awwwards **Site of the Month, July 2026**.
  - Awwwards **Developer Award** (developer score reported as **7.30**, from individual jury votes 7, 8, 7, 7, 7, 8).
  - Awwwards **Portfolio Honors, June 2026**.
  - Awwwards overall score **7.51/10** — Design **7.64**, Usability **7.36**, Creativity **7.52**, Content **7.39** (Awwwards weighting is Design 40% / Usability 30% / Creativity 20% / Content 10%).
  - Awwwards technologies tagged: **WebGL, GSAP, JavaScript**. Awwwards-extracted palette: **#F9F4EB** and **#1A1C1C**.
  - Agency-level: recognised by **Awwwards, FWA and the Webby Awards**; **Awwwards Annual Awards 2024 agency nominee**.
  - Client work also awarded — their **treebytree** site was an Awwwards Site of the Day. Their Awwwards profile lists Tobacco, Bruut, Avancio, Our World and Home Agency as submissions; there is an older SOTD entry slug `lama-lama-2` implying a previous iteration of their own site was also awarded.
  - Gallery features: **Lapa Ninja**, **Land-book** (entry 30747), **landing.love**, **purelanding.page**, **Muzli**, **Agencies of Anywhere**.

- **Credits** (confidence: low): The site is in-house — concept/strategy, digital design and creative development all credited to Lama Lama on their own channels. One named individual surfaced: **Jort Boot** (Lama Lama, via LinkedIn). On a *separate* project their LinkedIn credits list "travel videos and editing by Claudiu Voicu" and "video and 360 by Wolfstreet for music and sound" — that is a client case, not the agency site. Per-role credits for lamalama.com itself: **unknown**.

- **Concept & narrative** (confidence: low-medium; drawn from gallery editorial copy, not from the page itself):
  - Described as a **playful approach that puts visitors in a mindset reminiscent of childhood — "pure and full of wonder."** That is the emotional thesis: an agency that sells wonder rather than process.
  - Structurally described as **a video-led hero with a dark, bold personality**, with **case studies that "roll in with festival-poster confidence"** — i.e. the work index is treated as a run of posters/announcements rather than a neutral grid, and the whole thing is characterised as "an agency portfolio that feels alive rather than static."
  - Known page inventory: home, `/about-us/`, `/cases/<slug>/` (e.g. `/cases/home-agency/`). So the narrative arc is hero → work as poster sequence → studio/people → contact.
  - Tone of voice: value-led and warm ("companies with a conscience," "brands with a heart") set against a loud, high-energy visual register — a deliberate soft-values / hard-craft contrast.

- **Visual design language** (confidence: medium):
  - **Palette**: two dominant values — a warm off-white/bone **#F9F4EB** and a near-black **#1A1C1C** (Awwwards). Lapa Ninja files it under **black** as the primary colour and tags it "big type, people, dark colors," which suggests a light editorial base punctuated by full-bleed near-black sections (or an inverted hero), rather than an all-dark site.
  - **Typography**: **Suisse BP Int'l** (Lapa Ninja typeface field). This is a Swiss neo-grotesque with tight, slightly quirky terminals — the exact same family Floema uses, which is a notable coincidence across this batch. Expect oversized display settings of a single grotesque rather than a serif/sans pairing.
  - **Imagery**: photography of **people** is called out explicitly as a styling tag, plus **video** in the hero. So: human-led art direction (team/client faces, on-set footage), not 3D renders or illustration.
  - **Layout**: editorial, big-type-first, poster-like case blocks.
  - Brand-design context: The Brand Identity covered Lama Lama's **modular identity system for "Home"** ("Sum of parts") — the studio thinks in modular/stackable identity systems, which is consistent with a case-card system that recombines.

- **Components & sections** (confidence: low — I could not load the site; these are the elements corroborated by gallery descriptions): full-bleed **video hero**; **case study cards / poster blocks** that animate in on scroll; **about-us** page; individual **case pages**. Preloader, cursor, menu pattern, footer specifics: **unknown**.

- **Motion & creative effects** (confidence: low-medium): **GSAP** plus **WebGL** are confirmed by Awwwards' technology tags, and a **Developer Award** with a 7.30 developer score indicates the jury rated the build itself, not just the design — meaning there is non-trivial custom WebGL. Specific effects (transition type, cursor, distortion, text splitting): **unknown**.

- **Tech stack (with evidence)** (confidence: mixed):
  - Confirmed by Awwwards tags: **WebGL, GSAP, vanilla JavaScript** (no framework named).
  - Agency-level stack evidence from their GitHub orgs `lamalamaNL` / `lamalamanl`: **Statamic** (the Laravel-based PHP CMS) — they publish `statamic-scout-driven-cp-meilisearch-search` (PHP, GPL-3.0), i.e. a Laravel Scout + **Meilisearch** driver for the Statamic control panel — plus a forked macOS `dotfiles` repo (Shell, MIT, from driesvints/dotfiles, the Laravel ecosystem's standard dotfiles). This is strong evidence their CMS practice is **Statamic/Laravel**, commonly paired headlessly with Nuxt/Next/Astro front ends. Whether lamalama.com itself runs Statamic: **unknown**.
  - Fonts: self-hosted or licensed **Suisse BP Int'l** (Swiss Typefaces), not a Google Font.
  - Hosting/CDN: **unknown**.

- **Responsive / accessibility / performance notes**: Usability scored lowest of the four Awwwards criteria (**7.36**), which on a dark, video-heavy, motion-heavy agency site typically reflects heavy first load and unconventional navigation. No specific reduced-motion or a11y evidence found. Confidence: low.

- **Why it is award-worthy** (generalizable principles):
  1. **A single confident register, held everywhere** — two colours, one typeface, one image type (people). Winning agency sites subtract rather than add.
  2. **Work presented as posters, not as a grid** — each case gets a full-bleed, typographically dominant announcement moment instead of a thumbnail cell.
  3. **Motion earns a Developer Award separately from design** — the build is the argument. An agency site that wins a developer award is demonstrating capability, which is the actual product being sold.
  4. **Warm values, loud craft** — soft, ethical copy against high-contrast, high-energy visuals creates tension that reads as personality.
  5. **Video as the first thing, type as the second** — motion establishes energy before any reading happens.

- **Reusable patterns to extract**:
  - "Two-value palette + one grotesque + one image genre" as a brand-lock constraint for a whole site.
  - Case index as a **vertical run of poster-scale blocks** where each block owns a full viewport, animating in with mass (scale/clip rather than fade).
  - Agency-site information architecture: home → work-as-posters → studio/people → contact, with case detail pages at `/cases/<slug>`.
  - Statamic/Laravel headless CMS behind a custom WebGL/GSAP front end as a production-realistic content model for agency sites.

- **Confidence & sources**: Awards/scores **medium-high**; palette/type **medium**; concept/narrative **low-medium**; components/motion **low**; stack **medium (agency), low (this site)**.
  - https://www.awwwards.com/lamalama/
  - https://www.awwwards.com/sites/lama-lama and https://www.awwwards.com/sites/lama-lama-2
  - https://www.awwwards.com/inspiration/lama-lama-amsterdam-based-creative-digital-agency-1
  - https://annuals.awwwards.com/agency-nominees/lamalama
  - https://www.lapa.ninja/post/lama-lama/ and https://www.lapa.ninja/post/lamalama/
  - https://land-book.com/websites/30747-lama-lama-amsterdam-based-creative-digital-agency
  - https://www.landing.love/sites/lamalama-2/
  - https://the-brandidentity.com/project/sum-of-parts-lama-lamas-modular-identity-for-home-is-stacked-with-the-creative-agencys-potential
  - https://github.com/lamalamaNL and https://github.com/lamalamanl
  - https://lamalama.com/ , https://lamalama.com/about-us/ , https://lamalama.com/cases/home-agency/ , https://growsuite.lamalama.com/
  - https://www.linkedin.com/company/lama-lama , https://www.linkedin.com/in/jort-boot-862723a/

---

## Floema — https://floema.com/en

- **Type / purpose**: A brand/e-commerce-flavoured **immersive product site for a jewellery label ("Floema Jewelry")**, built as the capstone project of the Awwwards Academy course **"Building an immersive creative website from scratch without frameworks"** by **Luis Henrique Bizarro**. It functions as both a real brand experience (home / collections / product detail / about) and as the canonical teaching artefact for framework-free creative development.

- **Awards & recognition** (confidence: medium-high):
  - Awwwards **Site of the Day, 30 July 2021**, plus a **Developer Award**.
  - Awwwards score **7.53/10**.
  - Awwwards tags/technologies: **fashion, animation, unusual navigation, WebGL, transitions, GSAP, GLSL, Webpack, interaction design**.
  - Awwwards-extracted palette (screenshot-derived, and it disagrees with the source — see below): **#2779a7, #987654, #FF9398**.
  - Featured in editorial roundups such as ilovecreatives "Internet Gems" and Muzli.
  - Awwwards has separate entries for `sites/floema-jewelry` and `sites/floema`.

- **Credits** (confidence: high): **Design — Empi (Empi Persona)**. **Development — Luis Henrique Bizarro** (Awwwards profile `bizarro`) **and Angelo Bartolome**. Course author/instructor: Luis Henrique Bizarro.

- **Important source note**: `github.com/bizarro/floema` now returns **404** — the original repo is gone or renamed. Everything technical below is read from **faithful course clones** whose file-by-file structure matches the lectures: `whizzbbig/floema_` (archived 27 Oct 2024) and `predosoares/floema-jewelry`. Treat the architecture as high-confidence for the course project (and therefore for the site as taught), medium for the exact production deploy.

- **Concept & narrative** (confidence: medium): A soft, botanical, tactile jewellery world — the name Floema (phloem, the living tissue that moves nutrients through a plant) frames the brand around growth and flow. The page order is **Home (a drifting field of product imagery) → Collections (a horizontal run of collections) → Detail (a single piece) → About (an editorial studio story)**. There is no conventional nav-driven browsing: the home page is an **infinite, draggable plane of images** you push around, which is why Awwwards tagged it "unusual navigation." Copy is minimal and label-driven (a numbered label plus a collection title per item).

- **Visual design language** (confidence: high — read from source):
  - **Palette (from `styles/utils/variables.scss`, the source of truth)**:
    - `$color-white` **#f9f1e7** (warm bone)
    - `$color-contessa` **#c97164** (terracotta/rose)
    - `$color-quicksand` **#bc978c** (muted clay)
    - `$color-cadet-blue` **#b2b8c3** (cool grey-blue)
    - `$color-bright-grey` **#37384c** (ink navy)
    - Accent **#FFC400** used only for the drawn stroke on the home CTA.
  - **Colour is a per-page variable, animated**: each page template carries `data-background` / `data-color` — Home is `data-background="#c97164" data-color="#f9f1e7"`, About is `data-background="#b2b8c3" data-color="#37384c"`. A `ColorsManager` singleton runs `GSAP.to(document.documentElement, { background, color, duration: 1.5 })`, so the entire document **cross-fades its whole colour scheme over 1.5s during every page transition**. This is the site's single strongest art-direction move.
  - **Typography**: two self-hosted families, woff + woff2 — **Suisse BP Intl** in ultralight / light / regular (the UI and body grotesque) and **George X** (a serif display face) for headline moments. Light-weight grotesque at large sizes plus a serif for editorial punctuation.
  - **Imagery**: photographic product/lifestyle shots, all loaded as WebGL textures rather than as `<img>` pixels (the `<img data-src>` is a placeholder the GL layer reads geometry from).
  - **Layout**: no page grid in the traditional sense on Home — it is a free 2D plane. About is a classic editorial alternation (`about__content--left` / `--right`) of label + paragraph + image, interleaved with full-width galleries and "highlight" sections.
  - **Easing vocabulary**: `$ease-in-out: cubic-bezier(.77, 0, .175, 1)` and `$ease-out-expo: cubic-bezier(.19, 1, .22, 1)` — plus `expo.out` / `expo.inOut` in GSAP. Everything decelerates hard; nothing uses a linear or default ease.
  - **Stacking discipline**: a named z-index scale `('preloader', 'navigation', 'content', 'canvas')`.

- **Components & sections** (confidence: high):
  - **Preloader** with a live percentage counter: iterates `window.ASSETS`, creates an OGL `Texture` per asset with `crossOrigin = 'anonymous'`, increments on each `onload`, writes `${Math.round(percent * 100)}%` into the DOM. At 100% it waits ~1s so you actually *see* 100, then runs a GSAP timeline — title spans out (`duration: 1.5, ease: 'expo.out', stagger: 0.1, y: '150%'`), number out (`y: '100%'`), container `autoAlpha: 0`, then destroys itself.
  - **Navigation** that re-colours per template: on `about` it tweens the nav colour to the ink navy over 1.5s and swaps which nav item is visible (fade in item 1 with a 0.75s delay, fade out item 2); inverted elsewhere.
  - **Home**: an **infinite draggable gallery** of planes — wheel + touch, positions recycled when an item passes 60% of viewport width/height, direction tracked to decide which edge to recycle to, and a per-item random z-rotation re-randomised on recycle.
  - **Collections**: a **horizontal drag gallery** with per-index rotation `Math.abs(GSAP.utils.mapRange(0, 1, -0.2, 0.2, index / (n - 1))) - 0.1` and a **cosine-wave vertical offset** as a function of x, so the row arcs. An `onChange()` derives the active collection from scroll progress, toggles DOM classes and transforms a stacked titles element (rotation + translate) like a physical dial.
  - **Detail**: single product plane, texture pulled from a preloaded `window.TEXTURES[image]` cache, mesh z-rotated `Math.PI * 0.01`.
  - **About**: Prismic slices — `title`, `content` (label + rich-text description + image, left/right alternating), `highlight` (label + title + media set), `gallery` — plus its own horizontal WebGL gallery with the same recycle logic.
  - **Hand-drawn SVG CTA**: the home link is an inline SVG ellipse (a hand-drawn circle around the button text) with a second `path.home__link__icon__path` stroked in **#FFC400** — a classic "circle the word" stroke-draw.

- **Motion & creative effects** (confidence: high):
  - **Smooth scroll is hand-rolled, not a library.** `normalize-wheel` normalises wheel deltas; `Page.update()` does `scroll.current = GSAP.utils.interpolate(scroll.current, scroll.target, 0.1)` and applies `transform: translateY(-${scroll.current}px)`, with target clamped to `[0, limit]`. No Lenis, no Locomotive.
  - **Page transitions without a router library**: `onChange({url})` → `canvas.onChangeStart()` → `await page.hide()` → `fetch(url)` → parse the returned HTML into a detached div → read `.content[data-template]` → `history.pushState` → swap innerHTML → `canvas.onChangeEnd()` → instantiate the new page class → `page.show()` → re-bind link listeners. No Barba, no Swup.
  - **Shared-element WebGL transition** (`Canvas/Transition.js`): when going Collections → Detail (or back), it grabs the source mesh, creates a program/mesh for the destination element, and GSAP-tweens **scale, position and rotation simultaneously over 1.5s with `expo.inOut`**, then removes the mesh 0.2s after completion. The mesh gets `+0.01` on z so it renders above the scene during flight. This is a FLIP-style shared element, but executed in GL space rather than DOM space.
  - **Velocity-driven vertex distortion** — the signature effect. `home-vertex.glsl`:
    ```glsl
    newPosition.z -= (sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0)
                    + sin(newPosition.x / uViewportSizes.x * PI + PI / 2.0)) * abs(uSpeed);
    ```
    `uSpeed` is fed from the gallery's scroll velocity, so images **bulge/curve away from the screen in proportion to how fast you are dragging** and flatten when you stop. The fragment shaders are deliberately trivial (`texture2D(tMap, vUv)` with `gl_FragColor.a = uAlpha`) — all the character lives in the vertex stage.
  - **DOM→GL coordinate mapping**: each `Media` reads `getBoundingClientRect()`, converts to normalized viewport units, and positions its plane so the GL object sits exactly where its DOM placeholder is, y inverted for GL's bottom-up space, offset by scroll. Planes fade via a `uAlpha` uniform animated between 0 and **0.4** (deliberately semi-transparent).
  - **Scroll reveals via IntersectionObserver**, not scroll listeners: an `Animation` base class observes its element and calls `animateIn()` / `animateOut()` on intersect changes. Elements opt in declaratively with `data-animation="title|paragraph|label|highlight"`.
  - **Text splitting**: `utils/text.js` exposes `split(element, expression)` which wraps text units in spans **while preserving inline markup** (`<a>`, `<strong>`) and `<br>`, and `calculate(spans)` which buckets spans into lines by `offsetTop` — the standard recipe for per-line masked reveals (note: in the clone I read, the concrete `Title`/`Paragraph` classes had been simplified to `autoAlpha` fades; the split utility is the course's real mechanism).
  - **Random per-mesh z-rotation** on creation and on recycle gives the whole thing a scattered, hand-placed feel instead of a rigid grid.

- **Tech stack (with evidence — all read from source)** (confidence: high):
  - **No front-end framework.** A single `class App` orchestrating components; `new App()` at the bottom of `app/index.js`.
  - **Server**: Node + **Express** (`app.js`), port 8004, `morgan` logging, `body-parser`, `method-override`, `errorhandler`, static serving, `dotenv`.
  - **CMS**: **Prismic** (`@prismicio/client` ^5.1.0, migrated to v6 with `@prismicio/helpers` + `node-fetch@2.6.7`), with a custom `HandleLinkResolver` mapping doc types to `/detail/{slug}`, `/collections`, `/about`, `/`. Routes: `/`, `/about`, `/collections`, `/detail/:uid`. Content is fetched in parallel via `Promise.all` over `meta`, `preloader`, `navigation`, `home`, `about` and a `collection` query with `fetchLinks: 'product.image'`.
  - **Templating**: **Pug** (`views/index.pug`, `views/_includes/`, `views/pages/`).
  - **Device detection**: **ua-parser-js** on the server, injecting `isDesktop/isPhone/isTablet` into template locals for server-side responsive branching.
  - **3D/WebGL**: **OGL** (^0.0.73) — not Three.js. `new Renderer({ alpha: true, antialias: true })`, `Camera` at z=5 with fov-derived viewport sizing, `Transform` as scene root, one scene class per template plus a `Transition`.
  - **Animation**: **GSAP** ^3.7.1 (timelines, `utils.interpolate`, `utils.mapRange`, `fromTo`, `set`).
  - **Shaders**: raw `.glsl` files in `app/shaders/` — `home-vertex/fragment`, `collections-vertex/fragment`, `plane-vertex/fragment` — loaded through **glslify** / a glsl webpack loader.
  - **Build**: **Webpack 5** + **Babel**, SCSS + PostCSS with autoprefixer, `mini-css-extract`, image minimizer across formats, Terser, clean + copy plugins, dev server; `concurrently` running `nodemon` (backend) and webpack-dev-server (frontend).
  - **Utilities**: `lodash/each`, `normalize-wheel`. **ESLint + Prettier + EditorConfig**.
  - **Hosting**: originally **Heroku**; the clone also ships `vercel.json` for **Vercel**.
  - **Fonts**: self-hosted Suisse BP Intl + George X as woff/woff2 in `/fonts`.

- **Responsive / accessibility / performance notes** (confidence: medium): Server-side device detection enables genuinely different markup per device class rather than CSS-only adaptation. Images carry `alt` from Prismic. Everything meaningful is real DOM text behind the GL layer, so content is technically present — but interaction is drag/wheel-only with no keyboard path, there is no `prefers-reduced-motion` handling anywhere in the source I read, and the preloader blocks the experience until **all** textures decode. Usability was the implicit cost of the "unusual navigation" tag.

- **Why it is award-worthy** (generalizable principles):
  1. **The DOM is the layout engine; WebGL is the renderer.** Lay out with real HTML, read `getBoundingClientRect()`, and draw planes exactly on top. You keep semantics, responsiveness and CMS-driven content while getting shader control.
  2. **Put the character in the vertex shader, keep the fragment shader dumb.** One `sin()`-based z-displacement driven by scroll velocity is the entire signature effect.
  3. **Make colour a page-level state that animates.** Tweening `documentElement` background and text colour over 1.5s per route turns navigation into an art-direction event.
  4. **Physicality over navigation.** An infinite draggable plane with inertia, recycling and per-item random rotation communicates "handmade" better than any layout.
  5. **Shared-element transitions in GL space.** Flying the same textured mesh from grid position to detail position with `expo.inOut` makes two pages feel like one continuous space.
  6. **Ship a preloader that is content, not a spinner** — a counted percentage with a staged exit is the first beat of the story.

- **Reusable patterns to extract**:
  - "GL mirror of the DOM": a `Media` class that owns one DOM element, maps its rect into normalized viewport units each frame, and offsets by a lerped scroll value.
  - Velocity uniform: track `scroll.current - scroll.last` as `speed`, pass `abs(speed)` into a vertex displacement, lerp it back to 0 at rest.
  - Declarative animation opt-in: `data-animation="title|paragraph|label"` + an `IntersectionObserver`-backed base class, so designers add motion from the template.
  - Per-route `data-background` / `data-color` + a singleton colour manager tweening `document.documentElement`.
  - Framework-free page router: `fetch` → parse → swap `.content` → `pushState` → rebuild page/canvas → rebind links, with `await page.hide()` gating the swap.
  - Infinite recycling gallery: recycle at 60% of viewport past the edge, track direction, re-randomise rotation on recycle.
  - A named z-index scale as a SCSS list so stacking never becomes arbitrary.
  - Percentage preloader that pauses at 100% before exiting with a staggered `expo.out` mask-up.

- **Confidence & sources**: Architecture/effects/palette **high**; awards/credits **medium-high**; the live floema.com/en deploy matching the course source exactly **medium**.
  - https://www.awwwards.com/sites/floema-jewelry , https://www.awwwards.com/sites/floema
  - https://www.awwwards.com/bizarro/ , https://www.awwwards.com/empi.junior/
  - https://www.awwwards.com/academy/course/building-an-immersive-creative-website-from-scratch-without-frameworks
  - https://github.com/whizzbbig/floema_ (archived) — `app/index.js`, `app/components/Canvas/index.js`, `Canvas/Home/index.js`, `Canvas/Home/Media.js`, `Canvas/Collections/index.js`, `Canvas/Detail/index.js`, `Canvas/About/Gallery.js`, `Canvas/Transition.js`, `components/Preloader.js`, `components/Navigation.js`, `classes/Page.js`, `classes/Animation.js`, `classes/Colors.js`, `utils/text.js`, `shaders/*.glsl`, `styles/utils/variables.scss`, `views/pages/home.pug`, `views/pages/about.pug`, `app.js`, `package.json`, `fonts/`
  - https://github.com/predosoares/floema-jewelry (package.json)
  - https://github.com/whizzbbig/solutions-of-errors-floema_course-
  - https://github.com/bizarro/floema — **404, repo no longer public**

---

## Oryzo AI — https://oryzo.ai/

- **Type / purpose**: A **satirical product-launch campaign site** for a fictional AI-era product: a cork coaster. It is a **self-initiated internal project by Lusion** (a year in the making), functioning simultaneously as comedy, as a studio capability showcase, and as a full fake go-to-market campaign.

- **Awards & recognition** (confidence: high):
  - Awwwards **Site of the Day, 14 April 2026**. Score **7.86/10** — **Design 7.9, Usability 7.51, Creativity 8.35**.
  - Awwwards tags: **Art & Illustration, Design Agencies, Web & Interactive, Transitions, Storytelling, 3D, Filters and Effects**. Technologies: **WebGL, GSAP, Three.js**. Awwwards-extracted palette: **#100904** and **#FF8539**.
  - Awwwards' own citation: *"A cinematic product story that turns an ordinary cork coaster into an immersive digital experience"* with hashtags `#storytelling #transitions #GSAP`.
  - Multiple Awwwards "inspiration" entries carved out of it: **Intro Interaction**, **Footer Interactive Particles**, **Desktop**, **Mobile** — i.e. individual moments were strong enough to be indexed on their own.
  - **CSS Design Awards** (entry 49111) and **CSS Winner** (19168).
  - **Motion Design Awards** — "Oryzo Main Promo" (the launch film).
  - Listed by Utsubo among the best Three.js websites of 2026.
  - Also has a three.js forum showcase thread.

- **Credits** (confidence: high at studio level, low at individual level): **Lusion** — a digital production studio in **Bristol, UK**, founded by **Edan Kwan in 2017** (originally from Hong Kong; pursued music first, then taught himself design and coding). Self-described as "a close knit team." They run **Lusion Labs** for internal R&D, of which Oryzo is an example. Per-person credits for Oryzo: **unknown**. Disciplines involved, from their own BTS index: concept/creative direction, 3D design, motion graphics, visual systems, UX/UI, illustration, WebGL/Three.js engineering, and film.

- **Concept & narrative** (confidence: high):
  - The premise: **take a deliberately ridiculous object and present it with total sincerity**. In their words, the product was "so mundane that treating it seriously was already funny," presented "with the kind of confidence, polish, and dramatic seriousness you would normally associate with a keynote launch or high-end product page." The comedy lives entirely in **the gap between what the product is and how seriously it is presented** — the site never winks.
  - **The campaign extends far past the site**: an "open weight" **GitHub release** (`lusionltd/ORYZO-1`), a **Product Hunt launch**, a **founder video**, and social content. The world-building is the joke's delivery mechanism.
  - The GitHub artefact is the sharpest piece of writing in the project: six OBJ "checkpoints" named exactly like LLM releases — **base 26b / 40b / 108b / 145b, instruct 168b, frontier 344b** — a fabricated eval suite called **"WoodenBench"**, benchmarked *"on a single desk and very possibly rigged by us,"* acknowledged limitations of *"heavy dependency on gravity, mugs, and human deployment,"* a `paper.pdf`, and an MIT licence. 90 stars, 9 forks.
  - Narrative structure on the page (partial, confidence medium): an **intro interaction**, a hero with the object presented as a flagship device, a **desk scene**, an **extreme close-up / zoom section**, and an **interactive particle footer**.
  - Tone of voice: deadpan technical-marketing register, AI-launch boilerplate played completely straight.

- **Visual design language** (confidence: high — from Lusion's own BTS part 3):
  - **Four colours total**: a **cream**, a **near-black**, a **muted olive**, and an **orange**. Awwwards sampled the two dominant ones: **#100904** (near-black, warm-shifted) and **#FF8539** (the orange). The olive and cream were not sampled numerically in any source I could reach.
  - **Roughly 99% of the type is set in a single family.** Their stated principle: *"fewer typefaces, fewer colours, and fewer UI ideas competing for attention."*
  - **Custom illustration** is a major register alongside the 3D. AI was allowed into parts of the pipeline **without being allowed to define the final look** — a deliberate, stated boundary.
  - Art direction rule they articulated explicitly: *"The parts of the site that do get loud — the desk scene, the humour, the illustrations — only work because everything around them stays relatively quiet."*
  - The hero object reads as **crafted-without-a-full-scene**: a single object rendered with **weight, inertia and lighting** rather than an elaborate environment.

- **Components & sections** (confidence: medium):
  - **Intro interaction** (indexed separately on Awwwards) — a gated/interactive entry moment rather than a passive preloader.
  - **Hero**: one object, real inertia, physical lighting, reveal-on-interaction.
  - **Desk scene** — a staged environment, one of the two or three "loud" moments.
  - **Extreme-zoom close-up section** containing an **easter egg: tiny tardigrades appear if you linger there long enough.**
  - **Interactive particle footer** (indexed separately on Awwwards).
  - A dedicated, purpose-built **mobile** experience (also indexed separately).
  - Off-site components: GitHub "model card" page, Product Hunt listing, founder video, launch film.

- **Motion & creative effects** (confidence: medium-high):
  - **Vanilla Three.js, not React Three Fiber** — chosen for finer control, which is the norm for Lusion's heaviest builds.
  - **GSAP** for timeline/transition work; Awwwards specifically tagged **transitions** and `#GSAP`.
  - **No scroll-jacking.** Lusion's open-source `WebGL-Scroll-Sync` documents their house technique: instead of `position: fixed` on the canvas, use **`position: absolute` and offset the canvas every rAF to match the current scroll position**, so the canvas *physically scrolls with the page*. Their stated rationale: *"native scrolling doesn't run on the same thread as `requestAnimationFrame`"*, so a fixed canvas drifts when scroll happens between frames — *"If the scroll happens between two rAF calls, the canvas will physically scroll with the page, keeping your 3D visuals attached to the DOM elements they're linked to. No drift."* The tradeoff is clipping on fast scroll, mitigated by **~25% vertical padding** (rendering extra offscreen pixels) or by rendering to a framebuffer with edge blending/fading. Their verdict: clipping is more noticeable than the rendering cost.
  - This also solves the multi-canvas problem they name: *"you cannot create infinite WebGL contexts on a single page"* and *"resources can't be shared across different contexts"* — hence one canvas, DOM-tethered.
  - **Easter egg** as reward for dwell time (the tardigrades), not for clicking.
  - **Launch film** as a separate motion-design deliverable, awarded on its own at Motion Design Awards.

- **Tech stack (with evidence)** (confidence: medium-high):
  - **Three.js (vanilla) + WebGL + GSAP** — Awwwards technology tags, corroborated by Utsubo's technique writeup.
  - **Lusion's own `WebGL-Scroll-Sync` approach** (MIT, 367 stars, Vite-based demo, updated April 2025) — their published scroll/canvas architecture.
  - Framework, CMS, hosting, font foundry: **unknown**. The site is almost certainly custom/no-CMS given it is a one-off campaign.
  - Supporting repo: `lusionltd/ORYZO-1` (MIT, OBJ assets, paper.pdf).

- **Responsive / accessibility / performance notes** (confidence: low-medium): A distinct mobile treatment exists and was strong enough to be indexed separately on Awwwards, which is unusual for a heavy WebGL site. Usability scored **7.51**, the lowest of its three rated criteria — consistent with a gated intro interaction and dwell-gated content. No reduced-motion evidence found.

- **Why it is award-worthy** (generalizable principles):
  1. **Commit to a premise with total sincerity.** The craft is the punchline; the moment the site winks, the joke dies.
  2. **Extreme reduction buys you two or three loud moments.** Four colours, one typeface, minimal UI — so the desk scene and the illustrations can be maximal.
  3. **One object rendered with real weight beats a whole 3D world.** Inertia, lighting and material response on a single hero mesh reads as more expensive than a sprawling scene, at a fraction of the cost.
  4. **Build the world, not just the page.** A fake GitHub model card, a fake benchmark, a Product Hunt launch and a founder video make the site feel like an artefact of something real.
  5. **Reward dwelling.** Hidden detail at extreme zoom (tardigrades) converts curiosity into time-on-site without requiring a click.
  6. **Solve scroll sync at the architecture level.** Publishing the `position: absolute` canvas technique shows the craft is systemic, not decorative — and it is why their DOM-linked 3D never drifts.

- **Reusable patterns to extract**:
  - "Straight-faced satire": adopt the complete genre conventions of a category (AI product launch, keynote, model card, benchmark) and apply them to something trivial, with zero tonal breaks.
  - **Four-value colour system + one typeface at ~99% coverage** as a hard constraint, with loudness rationed to 2-3 designated moments.
  - **DOM-tethered absolute canvas** offset per rAF instead of a fixed canvas — the anti-drift, anti-scroll-jack pattern.
  - **Single hero object with inertia**: weight, momentum on drag, lighting that responds — a "low-to-medium effort, high perceived craft" move.
  - **Dwell-gated easter eggs** inside an extreme-zoom section.
  - **Interactive particle footer** as the closing beat, so the last screen is as authored as the first.
  - **Campaign surface area**: site + open-source artefact + Product Hunt + founder film + social, all in one voice.
  - Publishing a **multi-part BTS series** (7 parts, split by discipline) as part of the launch — the making-of is itself a distribution channel.

- **Confidence & sources**: Awards/scores **high**; concept/credits/design system **high**; components **medium**; exact stack beyond Three.js/GSAP **medium**.
  - https://www.awwwards.com/sites/oryzo-ai
  - https://www.awwwards.com/inspiration/intro-interaction-oryzo-ai
  - https://www.awwwards.com/inspiration/footer-interactive-particles-oryzo-ai
  - https://www.awwwards.com/inspiration/desktop-oryzo-ai , https://www.awwwards.com/inspiration/mobile-oryzo-ai
  - https://www.cssdesignawards.com/sites/oryzo-ai/49111 , https://www.csswinner.com/details/oryzo-ai/19168
  - https://www.motiondesignawards.com/project/2533/oryzo-main-promo
  - https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction
  - https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations
  - https://lusion.co/projects/oryzo_ai/ , https://lusion.co/
  - https://github.com/lusionltd/ORYZO-1 , https://github.com/lusionltd/WebGL-Scroll-Sync
  - https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/
  - https://www.utsubo.com/blog/best-threejs-websites-2026
  - https://discourse.threejs.org/t/oryzo-ai-a-wearable-product-in-the-ai-era/90696

---

## Shopify Editions Winter '26 ("The Renaissance Edition") — https://www.shopify.com/editions/winter2026

- **Type / purpose**: A **product changelog reframed as an editorial art experience**. "Editions" is Shopify's twice-yearly publication of platform updates — Winter '26 ships **150+ updates** and is themed **"The Renaissance Edition"** (also written "RenAIssance"), launched globally **December 2025**. It is simultaneously a release note, a brand statement, and a recruiting/credibility artefact for Shopify's in-house design org.

- **Awards & recognition** (confidence: high for the awards, medium for exact scores since awwwards.com was unreachable):
  - **Awwwards Site of the Day, 10 February 2026** and **Site of the Month, February 2026**.
  - **CSS Design Awards** (entry 48847).
  - **RGD 2026 In-House Design Awards** winner (Canadian Association of Graphic Design).
  - Awwwards framing: *"showcases 150+ updates to Shopify, set in a mashup of generative paintings with elements of modern commerce."*
  - **Series lineage** (this matters — the same org ships these repeatedly):
    - **Summer '24** — Awwwards **SOTD**, score **7.27/10**; tags video, animation, navigation, 404, transitions, headers; 3D, interaction design, microinteractions; "150+ updates with 75+ interactive graphics and videos." Also a **Webby 2025** entry in Best Visual Design – Function.
    - **Winter '24** — Awwwards **Honorable Mention**; tags 3D, microinteractions, video, transitions; individually indexed moments include the **header**, the **404 page**, and a **Rive animation for Shopify Collabs**.
    - **Winter '25 — "The Boring Edition"** — Awwwards **Honorable Mention**; a deliberate anti-design concept: updates presented in the plainest possible early-web style, with **a toggle into an alternate "non-boring" technicolor, AI-powered universe**. Shopify published a "how we built boring edition" post.
    - **Spring '26 — "Everywhere"** — the subject of a full **Codrops engineering case study**.
    - Shopify also holds a **Webby winner story** about Editions ("Shopify on Balancing Function and Form").

- **Credits** (confidence: medium): **Shopify Design / Shopify Creative, in-house** (Awwwards profiles `shopifydesign` and `magpye` "Shopify Creative"). Named people found: **Maggie Fost**, design director (credited leading the Boring Edition team); **Vanessa Lee**, VP of Product (authored the Winter '26 announcement). Individual designer/developer/3D credits for Winter '26: **unknown**. The RGD entry notes **AI generated each artwork's foundations while human artists fine-tuned depth, lighting and character animation** — so the art pipeline was hybrid AI/human by design.

- **Concept & narrative** (confidence: high):
  - **The thesis**: merchants are "modern Renaissance masters equipped with AI tools." Shopify picked the Renaissance because it *"symbolizes progress, momentum, courage, and new beginnings"* — apt for features that "weren't possible a year ago."
  - **The structure**: a **scroll-driven gallery**. Each of the **150+ product updates is anchored to its own 3D-rendered Renaissance painting**. The changelog becomes a walk through a gallery; the product update is the wall label.
  - **Transitions between sections are brushstroke-edged** — the wipe between chapters is painted, not geometric. That single decision carries the metaphor through the motion layer.
  - Tone: grand and art-historical in the visuals, plain and scannable in the update copy. The gap between the two registers is the whole gag/charm — same structural trick as Oryzo, inverted.
  - The series precedent matters: **each Edition invents a whole new concept and visual world** (generative Renaissance paintings; the "Boring Edition" anti-design toggle; "Everywhere"). The through-line is not a style, it is **"a changelog deserves a concept."**

- **Visual design language**:
  - **Confirmed (high)**: generative, **3D-rendered Renaissance paintings** — "rich textures, warm luminosity, dramatic composition, and a palette that evokes old masters while remaining unmistakably contemporary," mashed up with "elements of modern commerce." Character **animation** inside the paintings (human-finished).
  - **Third-party design-system documentation (medium-low confidence — sampled by an outside analyst, not published by Shopify)**: a **black stage** `#000000` against **warm paper** `#f7f7ee`, **ink** `#292919`, **muted panels** `#dcdcd0` / `#e2e2d9`, a **focus blue** `#739bff`, plus **one sharp product accent per chapter**. Typography documented as a **three-layer system** — a **display serif** for titles and release identity, a **grotesque sans** for navigation/buttons/product copy, and a **script face** reserved for selective brand moments; **Roman numerals or numbered sections** for navigation; negative letter-spacing only on large titles, never globally.
  - **Layout**: full-viewport sticky scene layer behind editorial content; chapters; a section sidebar with ordered labels and connecting lines showing active state; desktop header of 50-60px with logo, centred nav and right-aligned CTA.

- **Components & sections** (confidence: medium — architecture observed by a third party inspecting the live site):
  - **Header**: fixed/sticky, carrying release identity, **edition selector** (switch between past Editions), **search**, and a primary CTA.
  - **Sidebar section nav**: visible on desktop, collapsible on mobile, with active-state highlighting.
  - **Mobile nav**: full-height overlay with large stacked labels.
  - **Sticky full-viewport scene layer** with **static fallback media underneath** per section.
  - **Hero** carrying release name, launch idea, one-line promise, primary CTA, and a visible cue that more sections follow.
  - **Chapter/section structure** with categories roughly: AI/automation, online store, retail/POS, marketing, checkout, operations/analytics, developer platform.
  - **Update cards** with filtering/grouping and **local search** over the update set (keyboard-navigable, Escape-to-close).
  - **404 page** treated as a designed moment (established in Winter '24).
  - Content schema observed: `ReleaseSection: id, navLabel, eyebrow, title, summary, theme, scene, updates` and `ProductUpdate: id, title, category, summary, tags, media, cta`.

- **Motion & creative effects**:
  - **Confirmed (high, RGD)**: **brushstroke-edge transitions** between sections; **Theatre.js** used so that **designers could direct on-page motion directly** rather than going through engineers; **texture compression** to hold **60fps on mobile, where 70% of sessions occurred**.
  - **Third-party reverse-engineering of the painting effect (medium confidence)**: the paintings are **2.5D, not 3D** — a **Parallax Occlusion Mapping** shader driven by a source JPG plus a **grayscale depth map**, ray-marched with a forward pass then a backward refinement pass to find the exact depth-surface intersection, producing real occlusion and mouse/scroll-driven parallax **without any geometry**. Depth maps of this kind are generated with tools like **DepthAnything V2**. Layered on top: **wave-mask scroll transitions** (sine-wave layering with scattered metallic highlights along the reveal edge, wave position tied directly to scroll progress), **UnrealBloomPass** glow, floating **dust particles** reacting to the cursor, **video textures** substituted for a static painting in at least one scene, and per-artwork bespoke effects (a travelling light band, a proximity-triggered electric arc). Treat the specific pass counts as one analyst's reconstruction, but the **image + depth-map parallax approach is highly consistent with the observed look and with the "fine-tuned depth" language in the RGD citation.**
  - **From the sibling Spring '26 build (Codrops, high confidence for that site, strongly indicative for the family)**:
    - One **fullscreen WebGL canvas**; as you scroll, the app **resolves which scene is active, mounts the active scene plus its immediate neighbours, and composites between them**. Everything outside that window is **unmounted and disposed**.
    - **Scroll position drives uniforms, not React renders.** Camera motion, section transitions, screen offset, point-cloud displacement and post-processing params are read **from refs inside the render loop**, keeping high-frequency scroll updates out of React while the DOM page and WebGL scene stay visually locked.
    - **Volumetric light from video** via **KTX2 array textures rendered as raymarched boxes** in Three.js — used where a scene needed soft moving light rather than flat video.
    - **Cross-browser transparent video** via a **stacked RGB + alpha video** and a **WebGL2 shader**.
    - A **custom point-cloud format** with **quantized positions and chroma subsampling**.
    - A **shared fluid field system** driving cursor- and scroll-reactive effects across scenes.
    - A **four-tier GPU device system** for performance scaling.
    - Stated goal: *"cinematic while remaining true to the web: responsive, accessible, performant, and usable across a wide range of devices."*

- **Tech stack (with evidence)** (confidence: mixed — Shopify has not published a Winter '26 stack post):
  - **Theatre.js** for designer-authored on-page motion — **confirmed** (RGD).
  - **Three.js / WebGL** with **texture compression** — confirmed in substance (RGD) and by Awwwards tags across the series (3D, microinteractions, transitions).
  - **Rive** was used for animation in Winter '24 (Shopify Collabs) — confirmed by an Awwwards inspiration entry.
  - **Third-party observation of the live Winter '26 site (medium confidence)**: a **shell `index.html` using iframe embedding**, with **server-rendered Remix / Shopify Oxygen** at `editions/winter2026/index.html`, **Tailwind v4** with custom tokens, and hydrated JS bundles for interactivity. Remix + Oxygen is Shopify's own stack, so this is plausible on its face.
  - **Spring '26 sibling**: **React** + Three.js + fullscreen canvas + KTX2 + custom point-cloud tooling (Codrops).
  - **Recommended/observed asset pipeline** for this class of site: `.glb` with **Draco** geometry compression and **KTX2/Basis** textures, **GLTFLoader / DRACOLoader / KTX2Loader.detectSupport(renderer) / RGBELoader**, loaders cached and reused; hero models under ~5 MB compressed, supporting assets under ~2 MB, textures 1024-2048px; PMREM environments at 1K.
  - Hosting/CDN: Shopify's own infrastructure. CMS: internal/structured data, not a public CMS.

- **Responsive / accessibility / performance notes** (confidence: medium-high):
  - **Mobile is the primary surface — 70% of sessions** — and they explicitly engineered texture compression to hit **60fps there**. This is the single most important datapoint in the whole batch: the most visually maximal site here is mobile-first in its performance budget.
  - Documented degradation strategy in three tiers: **full WebGL scenes → static fallback image/video per section → plain text and card layout**, with asset failures isolated to individual scenes so one broken asset cannot take down the page.
  - Quality tiers by device: High (60fps, DPR ≤ 2, full effects) / Medium (DPR capped, reduced particles) / Low (30fps target, minimal effects, fallback acceptable), detected from WebGL support, DPR, viewport, `prefers-reduced-motion` and **measured post-load FPS**.
  - `prefers-reduced-motion` is treated as a first-class requirement — remove ornamental motion, preserve content hierarchy; disable particles.
  - Accessibility expectations documented: skip links, keyboard navigation, visible focus rings, sufficient contrast in both light and dark nav themes, and a text-only fallback tier.
  - Criticism found in reviews: none substantive — commentary I found (e.g. Series Eight's "Why Shopify's Renaissance Edition might actually live up to the hype") was about the *product* claims, not the site craft.

- **Why it is award-worthy** (generalizable principles):
  1. **Give a boring content type a concept.** A changelog becomes a gallery; 150 bullet points become 150 paintings. The content did not change — the frame did.
  2. **One metaphor, carried into the motion layer.** Renaissance paintings + **brushstroke-edged transitions** means even the wipe between sections is in-world.
  3. **Depth without geometry.** Image + depth map + parallax occlusion shader gives a 3D-feeling scene per section at image-file cost — which is how you can afford 150 of them and still hit 60fps on phones.
  4. **Put the motion controls in designers' hands.** Theatre.js let designers direct on-page motion directly; the polish comes from iteration count, and iteration count comes from removing the engineer from the loop.
  5. **Design the degradation, not just the maximum.** Three explicit tiers (WebGL → static media → text/cards) with per-scene failure isolation, plus a measured-FPS quality tier system.
  6. **Mobile-first performance on a maximalist site.** 70% mobile sessions drove the texture-compression work; the ambition survived because the budget was real.
  7. **Reinvent the concept every release, keep the container.** Same nav, same edition switcher, same card/search system; totally new world each time. That is what makes it a *series* rather than a redesign treadmill.

- **Reusable patterns to extract**:
  - **Scene-window mounting**: mount only the active section's scene plus immediate neighbours; unmount and dispose everything else; composite between them in one fullscreen canvas.
  - **Scroll → ref → rAF, never scroll → setState.** Write one scroll number to a ref; read it inside the render loop to drive camera, uniforms and post-processing.
  - **Depth-map parallax section backgrounds**: one JPG + one grayscale depth PNG per section, ray-marched POM shader, mouse/scroll parallax, optional bloom and dust particles.
  - **Wave/brushstroke mask transitions** whose reveal position is bound directly to scroll progress, with a treated edge (metallic flecks, painted texture) rather than a hard line.
  - **Quality tiering**: detect WebGL support + DPR + viewport + reduced-motion, then *measure post-load FPS* and downgrade; cap DPR per tier; drop particles and post-processing first.
  - **Three-tier content degradation** with per-scene failure isolation.
  - **Designer-directed motion** via a timeline tool (Theatre.js) rather than hand-tuned code constants.
  - **Content schema first**: `ReleaseSection { id, navLabel, eyebrow, title, summary, theme, scene, updates }` + `ProductUpdate { id, title, category, summary, tags, media, cta }`, then render hero and sections from data, then layer scenes on top.
  - **Edition switcher + local search over the update set** (⌘K-style, keyboard-navigable, Escape to close) so a 150-item page stays scannable.
  - **Numbered/Roman-numeral section indices** in a sidebar with connecting lines and active state.
  - Treat the **404 page** as an authored moment in the same world.

- **Confidence & sources**: Awards **high**; concept **high**; Theatre.js / brushstroke transitions / 60fps-mobile / 70%-mobile / AI-assisted art pipeline **high** (RGD citation); palette hexes, typography layers and Remix/Oxygen/Tailwind architecture **medium-low** (third-party observation); POM shader specifics **medium-low** (third-party reconstruction); Spring '26 engineering details **high for Spring '26**, indicative for Winter '26.
  - https://www.awwwards.com/sites/the-renaissance-edition
  - https://www.awwwards.com/sites/shopify-editions-summer-24 , https://www.awwwards.com/sites/shopify-editions-winter-24 , https://www.awwwards.com/sites/the-boring-edition
  - https://www.awwwards.com/inspiration/shopify-winter-24-edition-header-shopify-editions-winter-24 , https://www.awwwards.com/inspiration/winter-24-edition-404-shopify-editions-winter-24 , https://www.awwwards.com/inspiration/shopify-collabs-rive-animation-shopify-editions-winter-24
  - https://www.awwwards.com/shopifydesign/ , https://www.awwwards.com/magpye/
  - https://www.cssdesignawards.com/sites/the-renaissance-edition/48847
  - https://rgd.ca/hiring-designers/award-winners/2026-in-house-award-winners/the-renaissance-edition
  - https://www.shopify.com/editions/winter2026 , https://www.shopify.com/news/winter-26-edition-renaissance , https://www.shopify.com/news/winter-26-edition-merchant , https://www.shopify.com/news/winter-26-edition-dev
  - https://www.shopify.com/news/how-we-built-boring-edition
  - https://tympanus.net/codrops/2026/06/26/engineering-the-web-experience-behind-shopifys-spring-26-edition-everywhere/ (read via search extraction; domain is egress-blocked)
  - https://www.webbyawards.com/winner-stories-shopify-editions/ , https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-visual-design-function/326608/shopify-summer-24-edition
  - Third-party analyses (clearly secondary): https://github.com/webdown-a/shopify-editions-3d-site (references/architecture.md, visual-system.md, three-scene-system.md, asset-pipeline.md, implementation-checklist.md), https://github.com/yyliu2012/renaissance26skills
  - https://serieseight.com/journal/shopify-winter-editions-2026 , https://uiuxshowcase.com/resources/shopify-editions-winter-2026/

---

## Cross-site observations (batch C)

**Shared tech**

- **GSAP is universal.** All four are tagged with or verified using GSAP. None of the four uses Framer Motion. GSAP + a custom render loop is the award-site default, not a React animation library.
- **Nobody uses an off-the-shelf smooth-scroll library.** Floema hand-rolls it (`normalize-wheel` + `GSAP.utils.interpolate` at lerp 0.1 + `translateY`). Lusion publishes an *anti*-scroll-jacking technique that keeps native scroll and moves the canvas instead. Shopify drives everything from native scroll position written to a ref. Lenis and Locomotive are conspicuously absent from all four. The shared principle: **read scroll, interpolate it yourself, never fight it.**
- **Three different WebGL libraries for three different jobs**: Floema uses **OGL** (tiny, fits a no-framework build), Lusion uses **vanilla Three.js** ("finer control" for the heaviest custom work), Shopify uses **React + Three.js** at Editions scale. Lama Lama is tagged WebGL with no library named. Nobody in this batch uses Spline or a no-code 3D tool.
- **The single fullscreen canvas + DOM-tethered planes pattern appears in three of four.** Floema maps `getBoundingClientRect()` into GL space per frame; Lusion offsets an absolutely-positioned canvas to match scroll; Shopify composites scenes in one fullscreen canvas driven by scroll-derived uniforms. Different implementations, one architecture: **HTML does layout, WebGL does rendering.**
- **Scroll drives uniforms, not state.** Explicit in the Shopify Spring '26 writeup ("scroll position drives uniforms, not React renders"), implicit in Floema (`uSpeed` fed from scroll velocity) and in Lusion's rAF canvas offset.
- **Disposal and mounting discipline** is a stated concern only at Shopify scale (mount active + neighbours, dispose the rest) — but Floema does the same thing at small scale by creating/destroying per-template canvas scenes on route change.

**Shared motion vocabulary**

- **Expo easing everywhere.** Floema's SCSS literally names `$ease-out-expo: cubic-bezier(.19, 1, .22, 1)` and uses `expo.out` for the preloader and `expo.inOut` for the shared-element transition. The house style across award sites is hard deceleration, never linear, never default.
- **1.5 seconds is the transition unit.** Floema's colour tween, its shared-element flight, and its preloader title are all 1.5s / 1.5s / 1.5s. Slow-and-confident beats snappy on this kind of site.
- **Staggered masked reveals** are the baseline text treatment — Floema stages spans out at `y: '150%'` with `stagger: 0.1`; Shopify's system documents "staggered entry animations."
- **A shared-element transition is the money moment.** Floema flies a textured mesh from grid to detail. Shopify composites between adjacent scenes. In both, the point is that navigation should not feel like a page change.
- **Velocity, not just position, is an input.** Floema's `uSpeed` bends the image planes proportionally to drag speed; Shopify has a "shared fluid field system for cursor/scroll-driven effects." Reacting to *how fast* the user moves is what makes a site feel physical.
- **Preloaders are authored content, not spinners** — Floema's counted percentage with a deliberate 1s hold at 100%; Oryzo's "intro interaction" was strong enough to be indexed on Awwwards as a standalone moment.
- **The last screen is authored too** — Oryzo's interactive particle footer; Shopify's designed 404. Award juries look at the edges.

**Shared typographic and layout moves**

- **Suisse BP Int'l appears on two of four sites** (Lama Lama and Floema), five years apart. A licensed Swiss grotesque with character — not Inter, not a Google Font — is a recurring tell.
- **Radical typeface reduction.** Oryzo sets ~99% of the site in one family, stated as a principle. Floema uses exactly two (one grotesque, one serif display). Lama Lama uses one. Shopify Editions is the outlier with a documented three-layer system (display serif + grotesque + occasional script) — but that is a site with 150 discrete content items that needs the extra hierarchy.
- **Small palettes, treated as systems.** Oryzo: four values. Lama Lama: two. Floema: five named SCSS colours, but only **two active at a time**, swapped per page. Shopify: a black stage plus warm paper plus one accent per chapter. Nobody in this batch has a palette that could be described as "brand colours plus greys."
- **Warm neutrals dominate.** #F9F4EB (Lama Lama), #f9f1e7 (Floema), cream + #100904 (Oryzo), #f7f7ee / #292919 (Shopify, per third-party sampling). Even the blacks are warm-shifted (#1A1C1C, #100904, #292919) — nobody uses pure #000 as the content black.
- **Labels and numbering as a typographic device**: Floema's `home__titles__label` uses `${collection} ${Numbers(index)}`; Shopify uses Roman numerals / numbered sections in the sidebar. Small mono-ish labels giving structure to big display type is a shared editorial move.
- **Layout escapes the grid on purpose**: Floema's infinite draggable plane, Collections' cosine-arc row with per-item rotation, Lama Lama's "festival-poster" case blocks. The rotation values are tiny — Floema's random z-rotations, `Math.PI * 0.01` on the detail plane, `mapRange(-0.2, 0.2)` on collections. **Sub-degree-to-few-degree rotations are what make a digital layout read as hand-placed.**

**Shared narrative structures**

- **All four make a concept do the work that a feature list usually does.** A jewellery catalogue becomes a plane you push around. A coaster becomes a frontier model. A changelog becomes a gallery. An agency becomes a festival poster run. **Concept-first is the single strongest common denominator.**
- **Two of four are deliberately absurd and play it completely straight** (Oryzo's model card and WoodenBench; Shopify's Boring Edition anti-design toggle). The comedy comes from committing to the frame, never from winking.
- **Chapters/beats with hold time.** Utsubo's summary of the pattern fits three of the four: "each section staged as a beat with entrance, hold, and exit."
- **Reward for curiosity.** Oryzo's tardigrades at extreme zoom; Shopify's authored 404; Floema's hand-drawn yellow ellipse on the CTA. Every one of these sites plants something that only exists for the person who looks closely.
- **The making-of is part of the launch.** Lusion shipped a 7-part BTS series split by discipline. Shopify published "how we built boring edition" plus a Codrops engineering deep-dive. Bizarro turned the entire build into a course. The site is not the only deliverable.

**Differences worth noting**

- **Craft-maximal vs. content-maximal.** Oryzo and Floema have almost no content and enormous per-pixel craft. Shopify Editions has 150+ discrete content items and must remain searchable, filterable and scannable — which is why it alone has a search, a sidebar, an edition switcher and a three-tier text fallback. **The amount of content determines how much UI you are allowed to delete.**
- **Performance posture is inverted from what you'd expect.** The most visually extreme site (Shopify) is the one with an explicit mobile-first 60fps budget, a four-tier GPU system, measured post-load FPS downgrading, and a documented plain-text fallback. The smaller craft sites have blocking preloaders, drag-only navigation and no `prefers-reduced-motion` handling I could find. **Scale forces accessibility discipline; boutique scale often skips it — and that shows up in the Usability sub-score** (Floema 7.53 overall; Oryzo Usability 7.51 vs Creativity 8.35; Lama Lama Usability 7.36, its lowest criterion).
- **Creativity outruns usability on every scored site here.** Oryzo: Creativity 8.35 vs Usability 7.51. Lama Lama: Creativity 7.52 vs Usability 7.36. That is the Awwwards trade these sites are consciously making, and it is worth encoding as an explicit design decision rather than an accident.
- **AI shows up twice, in opposite roles**: as the *subject* being satirised (Oryzo) and as a *production tool* kept on a leash (Shopify — "AI generated each artwork's foundations while human artists fine-tuned depth, lighting and character animation"; Lusion — "where they allowed AI into the pipeline without letting it define the final look"). Both studios drew the same line independently: **AI for the substrate, humans for the finish.**
- **Framework diversity is total.** Vanilla ES6 + Express + Pug + Prismic (Floema), vanilla Three.js (Oryzo), React + Remix/Oxygen + Tailwind (Shopify, per third-party observation), unknown-with-Statamic-adjacency (Lama Lama). There is no "award-winning stack." There is an award-winning *architecture* (DOM layout, GL render, scroll→uniforms, hand-rolled lerp), and it is implementable in any of them.

**Things that surprised me**

- `github.com/bizarro/floema` is **gone (404)**. The canonical open-source reference for the most-cloned creative-dev course on the internet now survives only through student forks.
- **Lusion open-sources their core scroll architecture** (`WebGL-Scroll-Sync`, 367 stars, MIT) and argues *against* the fullscreen-fixed-canvas + scroll-jack pattern that most award sites use — on correctness grounds (native scroll and rAF are on different threads, so a fixed canvas drifts). That is a genuinely contrarian, load-bearing technical position from a studio at the top of this field.
- **Shopify's Editions team optimised for mobile because 70% of sessions are mobile** — on a site whose entire premise is scroll-driven 3D Renaissance paintings. The maximalism is engineered, not indulged.
- **Theatre.js in production at Shopify scale**, specifically so designers could author motion without engineers. That is a workflow decision that shows up as visual quality.
- **The Renaissance paintings are very likely 2.5D, not 3D** — image + depth map + parallax occlusion mapping. If so, the most opulent-looking site in the batch is also, per-scene, the cheapest to render. That is the most directly transferable trick here.
- **Suisse BP Int'l on two unrelated sites five years apart**, and a **serif-display + light-grotesque pairing** recurring across Floema and Shopify Editions.
- **Oryzo's funniest artefact is a GitHub repo**, not a page on the site — model checkpoints named `26b/40b/108b/145b/168b/344b`, a benchmark suite called WoodenBench "possibly rigged by us," and a limitations section citing "heavy dependency on gravity, mugs, and human deployment."
- A 61-star repo already exists that packages "Shopify Editions 3D site" as a **Claude Code skill**, and another packages the Renaissance parallax backgrounds as one. Worth reading as prior art before writing yours — and worth beating on the strength of the verified primary-source detail above.

**Caveats on this report**: awwwards.com, cssdesignawards.com, blog.lusion.co, tympanus.net, rgd.ca and all four target sites are blocked by this sandbox's egress proxy, so every award score, palette hex and studio quote attributed to those domains was read through WebSearch's content extraction rather than by loading the page. GitHub-sourced material (all of the Floema architecture, the Lusion repos, the third-party Shopify analyses) was fetched directly and is verbatim. The session's WebSearch quota was exhausted after roughly 25 queries, which is why Lama Lama's components/motion sections and Winter '26's individual credits remain thin — those are the two gaps worth re-running first if more search budget becomes available.