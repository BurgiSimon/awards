# Floema — https://floema.com/en

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

<!-- Provenance: the original repo github.com/bizarro/floema is gone (404). Everything marked [verified — clone] was read file by file from two faithful course clones, `whizzbbig/floema_` (archived 27 Oct 2024) and `predosoares/floema-jewelry`, whose structure matches the Awwwards Academy lectures. That is high confidence for the site as taught; that the live floema.com/en deploy matches the course source exactly is the report's medium-confidence assumption. Awards and credits were read through search extraction (awwwards.com blocked) and are labelled [recalled …]. -->

| Field | Value |
|---|---|
| Class | brand — immersive product site for a jewellery label ("Floema Jewelry"): home, collections, product detail, about; no checkout evidenced [verified — clone routes]. Also the capstone of Luis Henrique Bizarro's Awwwards Academy course "Building an immersive creative website from scratch without frameworks" [recalled high] |
| Visitor mode | experience |
| Awards | Awwwards Site of the Day, 30 July 2021, plus a Developer Award [recalled medium-high — awwwards.com via search] · score 7.53 [recalled medium-high]; axis sub-scores [unknown] · tags: fashion, animation, unusual navigation, WebGL, transitions, GSAP, GLSL, Webpack, interaction design [recalled medium-high] · two Awwwards entries, `sites/floema-jewelry` and `sites/floema` [recalled medium] · editorial: ilovecreatives "Internet Gems", Muzli [recalled medium] |
| Studio / credits | Design: Empi (Empi Persona) · Development: Luis Henrique Bizarro (Awwwards `bizarro`) and Angelo Bartolome · course author: Bizarro [recalled high — Awwwards profiles via search] |
| Stack (evidence level) | framework: none — one `class App` orchestrates components, `new App()` at the foot of `app/index.js` [verified — clone] · server: Node + Express on port 8004 with morgan, body-parser, method-override, errorhandler, dotenv, static serving [verified — clone `app.js`] · CMS: Prismic, `@prismicio/client` ^5.1.0, migrated to v6 with `@prismicio/helpers` and `node-fetch@2.6.7` [verified — clone `package.json`] · templating: Pug [verified] · animation: GSAP ^3.7.1 [verified] · 3D: OGL ^0.0.73, not Three.js [verified] · shaders: raw `.glsl` through glslify / a glsl webpack loader [verified] · build: Webpack 5 + Babel, SCSS + PostCSS/autoprefixer, mini-css-extract, image minimizer, Terser, clean + copy plugins, `concurrently` running nodemon and webpack-dev-server [verified] · other: `normalize-wheel`, `lodash/each`, `ua-parser-js`, ESLint + Prettier + EditorConfig [verified] · hosting: Heroku originally [recalled medium], the clone ships `vercel.json` [verified] · fonts: self-hosted Suisse BP Intl (ultralight / light / regular) and George X, woff + woff2 in `/fonts` [verified — clone] |
| Palette | `$color-white` #f9f1e7 warm bone · `$color-contessa` #c97164 terracotta · `$color-quicksand` #bc978c clay · `$color-cadet-blue` #b2b8c3 grey-blue · `$color-bright-grey` #37384c ink navy · #FFC400 only on the drawn CTA stroke [verified — clone `styles/utils/variables.scss`]. Strategy: theme-per-page — exactly two values active at a time, declared per template and cross-faded over 1.5 s on every route change. Awwwards' screenshot-sampled #2779a7 / #987654 / #FF9398 disagree with the source [recalled medium — treat as noise] |
| Type | expressive serif display (George X) + light neutral grotesque (Suisse BP Intl at ultralight/light) [verified — clone fonts] |
| WebGL dosage | canvas-first — every image is an OGL plane drawn over an `<img data-src>` placeholder; all text stays in the DOM [verified — clone] |
| Scroll model | virtual float — hand-rolled wheel/touch scroll (normalize-wheel → lerp 0.1 → `translateY`) plus an infinite draggable plane on Home; no Lenis, no Locomotive [verified — clone `classes/Page.js`, `Canvas/Home`] |
| Narrative model | gallery — drifting image field (Home) → horizontal collections rail → one piece (Detail) → editorial studio story (About) [verified — clone routes and templates] |

## 1. Concept and narrative
- **The one idea:** a soft, botanical, tactile jewellery world. Floema is phloem, the living tissue that moves nutrients through a plant, so the brand is framed as growth and flow [recalled medium]. Nothing is browsed through a nav; the home page is an infinite plane of product imagery you push around, which earned the "unusual navigation" tag.
- **Beats:** a counted preloader → the drifting field → the arced collections rail → a single piece filling the frame → an editorial about page. Each route swaps the whole colour scheme, so navigation itself is an art-direction event.
- **Copy register:** minimal and label-driven — a numbered label plus a collection title per item (`${collection} ${Numbers(index)}` in the Pug) [verified — clone `views/pages/home.pug`]; the about page carries the only paragraphs.

## 2. Structure and components
- **Routes:** `/` · `/about` · `/collections` · `/detail/:uid`; a custom `HandleLinkResolver` maps Prismic doc types to these paths [verified — clone `app.js`].
- **Preloader:** iterates `window.ASSETS`, creates an OGL `Texture` per asset with `crossOrigin = 'anonymous'`, increments on each `onload`, writes `${Math.round(percent * 100)}%` into the DOM; at 100 % it holds ~1 s so the number is seen, then a GSAP timeline sends the title spans out (`y: '150%'`, `duration: 1.5`, `ease: 'expo.out'`, `stagger: 0.1`), the number out (`y: '100%'`), the container to `autoAlpha: 0`, and destroys itself [verified — clone `components/Preloader.js`].
- **Navigation:** re-colours per template — on `about` it tweens to the ink navy over 1.5 s and swaps items (item 1 fades in after a 0.75 s delay, item 2 fades out); inverted elsewhere [verified — clone `components/Navigation.js`].
- **Home:** infinite draggable gallery of planes, wheel + touch; an item is recycled to the opposite edge once it passes 60 % of viewport width/height, direction-tracked; each item gets a random z-rotation, re-randomised on recycle [verified — clone `Canvas/Home`].
- **Collections:** horizontal drag gallery; per-index rotation `Math.abs(GSAP.utils.mapRange(0, 1, -0.2, 0.2, index / (n - 1))) - 0.1` and a cosine-wave vertical offset as a function of x, so the row arcs; `onChange()` derives the active collection from scroll progress, toggles DOM classes and rotates + translates a stacked titles element like a physical dial [verified — clone `Canvas/Collections`].
- **Detail:** one product plane, texture from the preloaded `window.TEXTURES[image]` cache, mesh z-rotated `Math.PI * 0.01` [verified — clone `Canvas/Detail`].
- **About:** Prismic slices `title`, `content` (label + rich text + image, `about__content--left` / `--right` alternation), `highlight` (label + title + media), `gallery`; plus its own horizontal WebGL gallery with the same recycle logic [verified — clone `views/pages/about.pug`, `Canvas/About/Gallery.js`].
- **CTA:** the home link is wrapped in an inline SVG hand-drawn ellipse, with a second `path.home__link__icon__path` stroked #FFC400 — a "circle the word" stroke-draw [verified — clone].
- **Stacking:** a named z-index scale `('preloader', 'navigation', 'content', 'canvas')` as an SCSS list [verified — clone].
- **Cursor, sound, 404:** none in the clone read [verified absence — clone]; production [unknown].

## 3. Visual language
- **Colour as page state:** each template carries `data-background` / `data-color` — Home `#c97164` on `#f9f1e7`, About `#b2b8c3` on `#37384c` [verified — clone Pug]; a `ColorsManager` singleton runs `GSAP.to(document.documentElement, { background, color, duration: 1.5 })` [verified — clone `classes/Colors.js`]. Five named colours exist, two are ever active. Yellow appears once, on the CTA stroke.
- **Type:** light grotesque at large sizes for UI and labels, serif for headline punctuation; both self-hosted. The serif-display + light-grotesque pairing recurs in [site:shopify-editions-w26]; Suisse BP recurs in [site:lama-lama].
- **Imagery:** photographic product and lifestyle shots, all uploaded as GL textures; planes fade to `uAlpha` 0.4, deliberately translucent, never opaque [verified — clone `Media.js`].
- **Layout:** Home has no grid — a free 2D plane; About is a classic editorial alternation of label + paragraph + image with full-width galleries and highlight sections [verified — clone].
- **Easing vocabulary:** `$ease-in-out: cubic-bezier(.77, 0, .175, 1)` and `$ease-out-expo: cubic-bezier(.19, 1, .22, 1)` in SCSS, `expo.out` / `expo.inOut` in GSAP; nothing linear, nothing default [verified — clone `variables.scss`].
- **Browser surfaces:** [unknown].

## 4. Motion and effects (with parameters)
- **Smooth scroll, hand-rolled** [verified — clone `classes/Page.js`, condensed]:
  ```js
  // classes/Page.js (course clone whizzbbig/floema_, condensed)
  onWheel(event) { this.scroll.target += NormalizeWheel(event).pixelY }
  update() {
    this.scroll.target  = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.target)
    this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.1)
    this.elements.wrapper.style.transform = `translateY(-${this.scroll.current}px)`
  }
  ```
- **Page transitions without a router** [verified — clone `app/index.js`]: `onChange({ url })` → `canvas.onChangeStart()` → `await page.hide()` → `fetch(url)` → parse the HTML into a detached div → read `.content[data-template]` → `history.pushState` → swap `innerHTML` → `canvas.onChangeEnd()` → instantiate the new page class → `page.show()` → re-bind link listeners. No Barba, no Swup.
- **Shared-element transition in GL space** [verified — clone `Canvas/Transition.js`, condensed]: Collections ↔ Detail grabs the source mesh, builds a program/mesh for the destination element and flies it:
  ```js
  // Canvas/Transition.js (course clone, condensed) — FLIP, but in GL space
  this.mesh.position.z += 0.01                          // draw above the scene in flight
  GSAP.to(this.mesh.scale,    { x, y,    duration: 1.5, ease: 'expo.inOut' })
  GSAP.to(this.mesh.position, { x, y,    duration: 1.5, ease: 'expo.inOut' })
  GSAP.to(this.mesh.rotation, { z: rotZ, duration: 1.5, ease: 'expo.inOut',
    onComplete: () => GSAP.delayedCall(0.2, () => this.scene.removeChild(this.mesh)) })
  ```
- **Velocity-driven vertex distortion — the signature** [verified — clone `shaders/home-vertex.glsl`, verbatim formula]:
  ```glsl
  // shaders/home-vertex.glsl (course clone) — uSpeed is fed from gallery scroll velocity
  newPosition.z -= (sin(newPosition.y / uViewportSizes.y * PI + PI / 2.0)
                  + sin(newPosition.x / uViewportSizes.x * PI + PI / 2.0)) * abs(uSpeed);
  // fragment stage stays trivial: gl_FragColor = texture2D(tMap, vUv); gl_FragColor.a = uAlpha;
  ```
  Images bulge away from the screen in proportion to drag speed and flatten at rest; all the character is in the vertex stage.
- **DOM → GL rect mapping** [verified in substance — clone `Canvas/Home/Media.js`; variable names condensed, recalled medium]:
  ```js
  // Canvas/Home/Media.js (course clone, condensed) — the plane sits exactly on its <img>
  const b = this.element.getBoundingClientRect()                 // DOM rect, px
  this.mesh.scale.x = viewport.width  * b.width  / screen.width  // px → GL units
  this.mesh.scale.y = viewport.height * b.height / screen.height
  this.mesh.position.x = -viewport.width / 2 + this.mesh.scale.x / 2 + (b.left / screen.width) * viewport.width + extra.x
  this.mesh.position.y = viewport.height / 2 - this.mesh.scale.y / 2 - ((b.top - scroll.y) / screen.height) * viewport.height + extra.y
  // y inverted (GL is bottom-up); `extra` accumulates the infinite-recycle offset
  ```
- **Scroll reveals:** an `Animation` base class observes its element with `IntersectionObserver` and calls `animateIn()` / `animateOut()`; elements opt in with `data-animation="title|paragraph|label|highlight"` [verified — clone `classes/Animation.js`].
- **Text splitting:** `utils/text.js` — `split(element, expression)` wraps units in spans while preserving inline markup (`<a>`, `<strong>`) and `<br>`; `calculate(spans)` buckets spans into lines by `offsetTop` for per-line masked reveals [verified — clone]. In the clone read, the concrete `Title` / `Paragraph` classes had been simplified to `autoAlpha` fades; the split utility is the course's real mechanism.
- **Hand-placed feel:** random per-mesh z-rotation on creation and on recycle; `Math.PI * 0.01` on the detail plane; `mapRange(-0.2, 0.2)` across the collections row [verified — clone].
- **Pointer:** drag with inertia through the same lerp; no custom cursor evidenced [verified absence — clone]. **Sound:** none [verified absence — clone].
- **Load sequence:** the counted preloader above; 1.5 s / 1.5 s / 1.5 s — colour tween, mesh flight, preloader exit — make 1.5 s the site's transition unit.

## 5. Tech and pipeline
- **Rendering:** `new Renderer({ alpha: true, antialias: true })`, a `Camera` at z = 5 with fov-derived viewport sizing, a `Transform` scene root, one scene class per template plus `Transition` [verified — clone `Canvas/index.js`].
- **Content:** Prismic fetched in parallel via `Promise.all` over `meta`, `preloader`, `navigation`, `home`, `about` and a `collection` query with `fetchLinks: 'product.image'` [verified — clone `app.js`]; `ua-parser-js` injects `isDesktop / isPhone / isTablet` into template locals for server-side responsive branching, so device classes get different markup, not just CSS [verified].
- **Assets:** `window.ASSETS` lists every texture; all are decoded into `window.TEXTURES` before the preloader exits; images run through webpack's image minimizer [verified — clone]. Two font families, six files [verified].
- **Budgets:** none stated [unknown]. **Resize:** each `Media` recomputes its bounds, scale and position on resize [recalled medium — course structure].

## 6. Weaknesses
- **No keyboard path:** interaction is drag/wheel only; gallery items are not focusable stops [verified — clone].
- **No `prefers-reduced-motion` handling anywhere in the source** [verified absence — clone]; the velocity shader, the recycle drift and the 1.5 s colour tween all run for everyone.
- **A total load gate:** the preloader blocks until every texture on the site has decoded, not just the first scene [verified — clone].
- **Virtual scroll costs:** `translateY` scrolling removes the native scrollbar, scroll restoration and find-in-page anchoring [inferred consequence]; 0.4-alpha planes trade image contrast for atmosphere [verified value, inferred cost].
- **Score:** 7.53 with the "unusual navigation" tag [recalled medium-high]; usability was the implicit price, as with [site:oryzo] and [site:lama-lama].
- **What the awards skills do differently:** `/awards:motion` ships the reduced tier — static image grid on native scroll, no velocity uniform, the colour swap instant or ≤ 300 ms; `/awards:structure` makes each gallery item an `<a>` in a list so Tab/arrow keys move `scroll.target` one item at a time with a visible focus ring; `/awards:webgl` keeps the DOM mirror rule the course already half-follows — the `<img alt>` stays readable by assistive tech, the canvas is `aria-hidden`, a failed plane leaves the image visible; the load gates change — the preloader's real signal is the first scene's textures plus `document.fonts.ready`, the rest streams by `IntersectionObserver`, GL chunk lazy ≤ 500 KB gz, CLS ≈ 0; `/awards:ship` verifies scroll restoration and deep links when scrolling is virtual.

## 7. Principles (3–6, generalisable)
1. **The DOM is the layout engine; WebGL is the renderer.** Lay out in HTML, read each rect, draw planes exactly on top — semantics, responsiveness and CMS content survive, shader control is added.
2. **Put the character in the vertex shader; keep the fragment shader dumb.** One velocity-driven `sin()` displacement is a whole signature.
3. **Colour is page-level state that animates.** A route change that tweens the document's ground and ink turns navigation into art direction.
4. **Physicality over navigation.** Inertia, recycling and per-item random rotation say "handmade" better than any grid.
5. **Shared-element transitions in GL space** make two routes read as one continuous space.
6. **A preloader is content, not a spinner** — a counted number with a staged exit is the first beat of the story.

## 8. Take / Don't take
- **Take:**
  - The GL mirror of the DOM: a `Media` class owning one element, rect → normalized viewport units each frame, offset by the lerped scroll, y inverted.
  - The velocity uniform: `speed = scroll.current - scroll.last`, `abs(speed)` into a vertex displacement, lerped back to 0 at rest — but design your own displacement function.
  - Lerp 0.1 for scroll interpolation with the target clamped to `[0, limit]`; hard deceleration everywhere (`cubic-bezier(.19, 1, .22, 1)` ≈ the plugin's `--ease-out-expo`); 1.5 s as the hero-moment unit, never for feedback.
  - Per-route `data-background` / `data-color` and a singleton tweening `document.documentElement` (1.5 s here; use `--ease-theme`), with exactly two values live at a time.
  - Declarative `data-animation` opt-in on an `IntersectionObserver` base class, so motion is authored from the template.
  - The framework-free router sequence with `await page.hide()` gating the swap; per-template canvas scenes created and destroyed on route change.
  - Infinite recycling at 60 % past the edge with direction tracking and re-randomised rotation; sub-degree to few-degree rotations (`Math.PI * 0.01`, `mapRange(-0.2, 0.2)`) for a hand-placed read.
  - A named z-index scale as a token list; a percentage preloader that holds ~1 s at 100 % and exits with `y: '150%'`, stagger 0.1, `expo.out`, 1.5 s.
- **Don't take:**
  - The five named SCSS colours, the Home / About pairs, or the #FFC400 circled CTA — those are Floema's world.
  - Suisse BP Intl + George X as a pairing; the batch already has Suisse twice.
  - The jewellery-field-as-home metaphor or the route order Home → Collections → Detail → About as-is.
  - The `sin()` bulge shader verbatim as a signature: it is the most-cloned effect on the web and a juror will name the course from the first drag. Same for the mesh flight from grid to detail as-is.
  - The course's file structure, Prismic slice names or `window.ASSETS` / `window.TEXTURES` globals as "the stack".

## 9. Confidence and sources
- **Per section:** architecture, effects, palette, type and components high [verified — clone]; awards and credits medium-high [recalled — search extraction]; that the live deploy matches the course source medium; §6 high for the absences in the clone, inferred for their consequences.
- **Sources used:** https://www.awwwards.com/sites/floema-jewelry · https://www.awwwards.com/sites/floema · https://www.awwwards.com/bizarro/ · https://www.awwwards.com/empi.junior/ · https://www.awwwards.com/academy/course/building-an-immersive-creative-website-from-scratch-without-frameworks · https://github.com/whizzbbig/floema_ (archived; files read: `app/index.js`, `app/components/Canvas/index.js`, `Canvas/Home/index.js`, `Canvas/Home/Media.js`, `Canvas/Collections/index.js`, `Canvas/Detail/index.js`, `Canvas/About/Gallery.js`, `Canvas/Transition.js`, `components/Preloader.js`, `components/Navigation.js`, `classes/Page.js`, `classes/Animation.js`, `classes/Colors.js`, `utils/text.js`, `shaders/*.glsl`, `styles/utils/variables.scss`, `views/pages/home.pug`, `views/pages/about.pug`, `app.js`, `package.json`, `fonts/`) · https://github.com/predosoares/floema-jewelry (`package.json`) · https://github.com/whizzbbig/solutions-of-errors-floema_course- · https://github.com/bizarro/floema (404, no longer public)
- **Access note:** GitHub fetched directly and read verbatim; awwwards.com read through search extraction; floema.com/en itself not loaded.
