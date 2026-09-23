# Warm & Fuzzy — https://www.warmnfuzzy.tv/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a production-led creative company (direction, production, animation, VFX, live experiences) [verified, index.html services list; mobile-s100.png] |
| Visitor mode | persuade — the reel, the work and a copy-to-clipboard email do the selling [verified, desktop-s00.png, index.html "Click to copy"] |
| Awards | Awwwards **Site of the Day, 12 Sep 2026, 7.26** — Design 7.35 / Usability 7.03 / Creativity 7.35 / Content 7.40; **Developer Award 7.52** — Semantics 7.60, Animations 7.60, Accessibility 7.20, WPO 7.20, Responsive 7.80, Markup 7.60 [verified, entry page, `entry/entry.html` + `entry/desktop-s00.png`] |
| Corpus rating | D 7.2 / U 6.8 / C 7.0 / Co 7.2 → weighted 7.04, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Neutral Studio with Paulo Ferreira Jorge [verified, entry page; index.html `twitter:site @neutral_studio`, `twitter:creator @mfjpaulo`] |
| Stack (evidence level) | **Next.js 16.2.1, Pages Router, Turbopack** [verified, index.html `__NEXT_DATA__` + `_buildManifest.js` + `turbopack-*.js`; 0skjn7eyt7~4a.js `"16.2.1"`] · **Lenis 1.3.20** through its React hook [verified, 0-9pg3v4jydey.js `s="1.3.20"`; runtime `window.lenisVersion`; `useLenis` in the header chunk] · **Motion (framer-motion)**, version not in the served text [verified, 0j3bx3v8qnxhf.js `framerAppearId`, `AnimatePresence`] · **raw WebGPU** + canvas 2D for animated shapes, no 3D library [verified, 0vfjpxgat0bl8.js `navigator.gpu.requestAdapter`, inline WGSL] · **hls.js 1.6.15** over Mux streams [verified, 111rgua_t~gfz.js; manifest.json `stream.mux.com`] · **Storyblok** [verified, index.html `a.storyblok.com`] · Vercel [verified, `getent hosts` → `vercel-dns-016.com`] · GTM [verified, 0_4mrm86joruc.js] · **Suisse Int'l** via `next/font` [verified, 0r.03hwyovjrn.css `@font-face` SuisseIntl] |
| Palette | black theme ground `#000` [verified, 0r.03hwyovjrn.css `[data-theme=black]`] |
| | ultramarine ground with white ink `#190bb6` [verified, 0r.03hwyovjrn.css `[data-theme=blue]`] |
| | yellow ground with black ink `#f7dd47` [verified, 0r.03hwyovjrn.css `[data-theme=yellow]`; index.html `theme-color rgb(247, 221, 71)`] |
| | orange ground with white ink `#e74a27` [verified, 0r.03hwyovjrn.css `[data-theme=orange]`] |
| | white ground `#fff`; hairline rules at 10 % alpha, `#ffffff1a` on dark and `#0000001a` on light [verified, 0r.03hwyovjrn.css] |
| | Strategy: **theme-per-section, five flat named grounds, each with its own ink; the project media carry every other hue** [verified, 0r.03hwyovjrn.css `[data-theme=…]`; desktop-s00 to s100.png]. A lighter tint of each hue exists as a token [verified, 09kzghax1hjwe.js `COLORS`] |
| Type | **one grotesque, one weight** — Suisse Int'l, a single 700 file for every size [verified, 0r.03hwyovjrn.css one `@font-face`; index.html one preloaded woff2]; plus a hand-drawn SVG wordmark, `aria-hidden` inside a labelled link [verified, index.html `link-logo`] |
| WebGL dosage | moments — WebGPU silhouette canvases on work cards and titles, feature-detected; the hero's glitch look is in the video, not in a shader [verified, 0vfjpxgat0bl8.js; runtime probe: hero stack is `<video>` + `<img>`, no canvas] |
| Scroll model | native + Lenis on an inner scroll container: the document is one viewport tall and a page container scrolls [verified, runtime probe `scrollHeight 900`; manifest.json `scrollMode: wheel`] |
| Narrative model | gallery — reel hero, a statement, featured work, a manifesto paragraph, services, disciplines, a photographic interruption, a wordmark close [verified, desktop-s00 to s100.png, mobile-s00 to s100.png] |

## 1. Concept and narrative
**One idea:** "feel good" made literal through colour. Each section is a flat, saturated ground, black → ultramarine → yellow → blue, so scrolling the page is a run of colour changes. The work supplies the texture: campaign stills, anamorphic billboards, toy-like 3D [verified, desktop-s00 to s100.png].

Beats: a full-bleed reel of a running shoe cut through with scan-line, point-cloud and bounding-box "machine vision" marks, and the one-line positioning set across the foot of the frame [verified, desktop-s00.png]. Next, a blue statement block and featured work set in an uneven grid, with one red card holding video inside an ampersand [verified, desktop-s25.png]. Then a yellow manifesto paragraph at display size with small media chips set inline between its words [verified, desktop-s50.png], a full-bleed photograph of a sticker-covered car [verified, desktop-s75.png], and a blue close with the wordmark at full width under a turning sticker-wrapped object [verified, desktop-s100.png]. The tone is warm and confident, with the occasional pun ("grabs you by the eyeballs", mobile-s100.png) [verified].

## 2. Structure and components
- **Header bar**: wordmark, a one-line company description with "learn more", a *Latest work* pill with its thumbnail, then WORK / INFO / CONTACT as square cells divided by hairlines [verified, desktop-s00.png]. The phone gets the wordmark and a two-line menu button that opens a `<dialog>` nav [verified, mobile-s00.png; index.html `nav-mobile` inside `<dialog>`].
- **Flip buttons**: every nav cell is a 3D prism that turns a clone face into view (§4) [verified, 0lbgeuh6in.p_.css `button-flip`].
- **Hero reel**: a Mux HLS loop with an eager poster `<img>`, a *showreel* trigger and cursor label in `mix-blend-mode: difference` [verified, index.html; 0lbgeuh6in.p_.css]. On the phone the title becomes a sideways ticker, with a real `h1` for tablet up and an `aria-label` heading on the ticker [verified, index.html].
- **Intro mask**: a `<dialog aria-label="Loading...">` with `data-lenis-prevent`, gated by `canPlayIntro` / `canRevealContent` state [verified, index.html; header chunk]. It was not on screen in any capture, and whether a repeat visit skips it is [unknown].
- **Featured work cards**: name + year rows, media at mixed sizes on a 24-column grid, some cards carrying an animated letter-shape mask [verified, desktop-s25.png; 0r.03hwyovjrn.css `--columns:24`].
- **Manifesto with inline chips**: round and square thumbnails the height of a line, set between words [verified, desktop-s50.png].
- **Services list + disciplines carousel**: eight services in the display face, then a sideways run of disciplines with counts, each tile a letterform filled with a clip [verified, mobile-s100.png].
- **Footer**: email, WORK / INFO / CONTACT, the wordmark at full width, social links, cookies and © in hairline cells [verified, desktop-s100.png].
- **Cookie bar**: a persistent bottom-right strip with Accept / Decline, over every frame [verified, all captures].

## 3. Visual language
- Grounds are flat, and a section changes theme with one attribute: `[data-theme=blue]` sets ground, ink and border token together [verified, 0r.03hwyovjrn.css]. Where two sections share a theme, a hairline appears between them [verified, same file `[data-block=has-border-top]`].
- **Grain everywhere**: a 32 px greyscale PNG tile over the whole page, stepping in place (§4) [verified, 0lbgeuh6in.p_.css `noise-overlay`; visible in every capture].
- **Type** is uppercase at label and nav size, sentence case at manifesto size, with no second weight: hierarchy comes only from scale [verified, desktop-s00/s50.png]. The ticker line uses tracking `-.045em` at line-height `.98em` (small) and `-.027em` at `.91em` (large), with `text-box: trim-both cap alphabetic` [verified, 0lbgeuh6in.p_.css].
- **Fluid sizing locked to four artboards**: `max(N − N·m + 100vw·N / W·m, N)` with `m = .2` and `W` = 375 / 768 / 1280 / 1600, so a size grows at a fifth of the viewport rate above its artboard and never drops below the design value [verified, 0r.03hwyovjrn.css `--scale-modifier`, `--target-window-width`]. Display steps run from 12 px up to 320 px [verified, 0lbgeuh6in.p_.css].
- **Grid**: 8 / 16 / 24 columns, outer gutter 16 px, inner 10 or 16 px [verified, 0r.03hwyovjrn.css; 09kzghax1hjwe.js].
- Imagery is loud and varied (a zoo billboard, inflatable flowers, a hair tool on sky blue); the flat grounds keep that variety in order [verified, desktop-s25.png, mobile-s50.png].
- Browser surfaces: `theme-color` and tile colour are the brand yellow; favicon set shipped [verified, index.html].

## 4. Motion and effects (with parameters)
- **Easing tokens**: out `(.26, 1, .48, 1)` — 17 CSS uses —, in `(.52, 0, .74, 0)`, in-out `(.76, 0, .24, 1)`, an "expressive" `(1, 0, 0, 1)`, and linear for fades [verified, 09kzghax1hjwe.js `EASE_*`; CSS counts].
- **Flip nav**: on hover or activation the face goes `rotateX(90deg) translateZ(var(--flip-depth)) translateY(-50%)`, depth = half the row height, a clone rotates in, `perspective: 1000px` only while transitioning; the underline travels with it on `.5s` out-ease; idle faces dim to `.5` on hover [verified, 0lbgeuh6in.p_.css].
- **Silhouette masks (WebGPU)**: a mesh is drawn solid white (`vec4f(1.0)`) into an offscreen WebGPU canvas; a visible 2D canvas draws that, switches to `globalCompositeOperation = "source-in"` and draws a cover-fitted `<video>` or `<img>` frame, so the media shows only inside the turning shape [verified, 0vfjpxgat0bl8.js]. Rotation advances `x += 8e-4·dt`, `y += 8.2e-4·dt` (rad per ms) from random start angles; each instance initialises once an `IntersectionObserver` sees it; one shared GPU device is acquired and released per instance and handles device loss [verified, same]. Support is feature-detected with `"gpu" in navigator` [verified, 0_4mrm86joruc.js]. In the headless run the shape canvases stayed at the default 300×150 while desktop-s25 still showed a filled ampersand, so a non-WebGPU fallback exists; how it works is [unknown].
- **Hero glitch**: point-cloud, scan-line and tracking-box marks over the shoe clip. These are in the reel itself: no canvas sits over the hero [verified, runtime probe], and the reduced-motion frame shows a clean poster frame instead [verified, desktop-rm-s00.png].
- **Grain**: `animation: 1s steps(2, end) infinite` on the tile at `inset: -100px`; under reduced motion the tile resets to `inset: 0` and holds still [verified, 0lbgeuh6in.p_.css].
- **Parallax and reveals**: `--parallax-amount-large: 25svh`, `-small: 5svh`, offset multiplier `-.8`; reveal delays `.2s` / `.4s`; lazy media fade in over `.1s` linear and only under `no-preference` [verified, 0lbgeuh6in.p_.css].
- Smooth scroll: Lenis 1.3.20; lerp or duration not found in the served text [unknown].
- Sound: an audio button module exists for full-video playback [verified, 0lbgeuh6in.p_.css `button-audio`]; nothing plays on the home page [verified, captures].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js 16.2.1 Pages Router, Turbopack, CSS Modules (SCSS) | [verified, index.html, `_buildManifest.js`, class names] |
| Scroll | Lenis 1.3.20, React hook, inner scroll container | [verified, 0-9pg3v4jydey.js, runtime probe] |
| Animation | Motion (framer-motion) for presence and state; CSS for flips, grain, reveals | [verified, 0j3bx3v8qnxhf.js, 0lbgeuh6in.p_.css] |
| Shapes | raw WebGPU + canvas 2D compositing, no library | [verified, 0vfjpxgat0bl8.js] |
| Media | Mux HLS through hls.js 1.6.15; Mux thumbnails through `next/image` at `q=90` | [verified, 111rgua_t~gfz.js, index.html] |
| CMS | Storyblok, with preview API routes | [verified, index.html, `_buildManifest.js` `/api/preview`] |

- About 350 words of real text are in the served HTML; the DOM has 679 nodes on desktop [verified, index.html, manifest.json]. No console or page errors [verified, manifest.json]. The 149 failed requests are aborted Mux segment and analytics beacons from the headless run [verified, manifest.json]. The initial document links 34 JS and CSS files, ≈ 1.0 MB uncompressed [verified, `src/` sizes].
- `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.

## 6. Weaknesses
- Reduced motion: **pass**. The hero shows a clean poster frame, the WebGPU canvases are not created (0 in `desktop-rm`, 1 in `desktop`), the grain stops, and fades are gated on `no-preference` [verified, desktop-rm-s00.png, manifest.json, 0lbgeuh6in.p_.css].
- Keyboard: **partial**. Nav cells are real links and buttons, and the menu is a native `<dialog>` [verified, index.html]. There is no skip link, only two `focus-visible` rules and one `outline:none` [verified, index.html, CSS counts].
- DOM behind the canvas: **pass**. The canvases are decoration over SSR text, and the ticker headline carries an `aria-label` [verified, index.html]. All 15 images ship `alt=""`, work thumbnails included, so a project card is known only by its caption [verified, index.html].
- Load gate: **[unknown]**. The intro dialog exists but was not seen, and no repeat-visit skip was found.
- Phone: **designed**. Hamburger dialog, ticker title, single-column work with offset media [verified, mobile-s00/s50.png]. The cookie strip covers about 5 % of the phone viewport until answered [verified, mobile captures].
- Wayfinding and conversion: **mixed**. There is no current-section marker, but the email is one click (copy) from any page and the footer repeats it [verified, desktop-s100.png].

What the awards skills do differently: a skip link and a visible focus state on every flip cell, `focus-visible` driving the same prism turn as hover, descriptive `alt` on work media, and a non-WebGPU fallback designed as a first-class tier rather than one that is simply there.

## 7. Principles
1. **Let the grounds change the mood.** Flat, saturated section grounds switched by one attribute make a page feel joyful without a single decorative element; the work supplies the texture.
2. **Bake the look into the footage.** When the hero's signature is in the video, the reduced-motion path gets a clean poster for free and no shader competes with the LCP.
3. **One face, one weight, hierarchy by scale alone.** Dropping weight changes forces the ratio between sizes to carry the whole hierarchy, and makes the system read as decided.
4. **Mask the media, not the layout.** A shape that clips a moving clip adds depth to one card without changing the grid around it.
5. **Scale above the artboard at a fraction.** Growing sizes at a fifth of the viewport rate over a floor keeps a layout recognisable from laptop to wall screen.

## 8. Take / Don't take
- **Take:**
  - The theme attribute that sets ground, ink and border token at once, plus the hairline that appears only between same-theme neighbours.
  - The artboard formula `max(N − N·m + 100vw·N/W·m, N)` with a small `m` and one `W` per breakpoint.
  - The 2D-canvas `source-in` composite: draw a shape (from any renderer), switch the operation, draw the cover-fitted media frame.
  - A 3D prism turn for nav labels with depth tied to the row height, a clone face, and perspective applied only while it moves.
  - Grain that steps in place (`steps(2)`) and freezes under reduced motion.
- **Don't take:**
  - The five-ground set as literal values:
    - `#190bb6`, `#f7dd47`, `#e74a27` [verified, 0r.03hwyovjrn.css]
    - `#000` and `#fff` as the black and white themes [verified, 0r.03hwyovjrn.css]
  - The machine-vision reel, the sticker car, the sticker-wrapped object, the hand-drawn wordmark or any client work.
  - The feel-good line, the "grabs you by the eyeballs" pun, or the section order reel → statement → work → manifesto → services → close.
  - Suisse Int'l 700 as the single face; `[site:lama-lama]` already carries the same family.
  - Blank `alt` on every work image and the missing skip link, which are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, six CSS files, JS chunks, runtime probe |
| Award | high — entry page read, all axis and developer scores |
| Concept, structure, visual language | high — five desktop states, five phone states, five reduced-motion states |
| Motion parameters | high for CSS, easing tokens and the WebGPU shape renderer; Lenis options unknown |
| Weaknesses | high for reduced motion, alt, focus counts; low for the intro gate (never observed) |

**Live pass 2026-09-23: reachable, capture exit 0, `scrollMode: wheel` with distinct frames on every profile (no retry needed).** Sources in `.awards/research/warmnfuzzy/`: 15 captures + `manifest.json`; `index.html`; `src/` with the linked CSS and the JS chunks loaded by the page (`0r.03hwyovjrn.css`, `0lbgeuh6in.p_.css`, `0vfjpxgat0bl8.js`, `0-9pg3v4jydey.js`, `09kzghax1hjwe.js`, `0_4mrm86joruc.js`, `0j3bx3v8qnxhf.js`, `111rgua_t~gfz.js`, `0skjn7eyt7~4a.js`). Award entry `awwwards.com/sites/warm-fuzzy`, found with one web search, captured desktop-only into `entry/` (exit 2) and its HTML read. Not observed: `/work`, `/info`, `/contact`, the 404 page, the intro mask on screen, and the shapes under a real GPU.
