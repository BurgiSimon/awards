# Siena Film Foundation — https://siena.film/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio: a boutique film production house showing eight of its films; the home route plus `/work`, `/about` and `/films/<slug>` case routes [verified, index.html meta description, prefetch links] |
| Visitor mode | experience: the home route is the reel itself; the contact is an "ADMIT ONE" ticket with an e-mail link, reached through the menu [verified, index.html text; desktop-state-menu-open.png] |
| Awards | Awwwards **Site of the Day, 18 Mar 2025, 7.9**: Design 7.99 / Usability 7.61 / Creativity 8.13 / Content 8. **Developer 7.51**: Semantics 7.20, Animations 8.60, Accessibility 6.60, WPO 7.20, Responsive 8.00, Markup 7.20; entry palette `#000000` + `#FAF7EF` [verified, entry page, `entry/siena-film-foundation.html` + `entry/desktop-s00.png`]. A Site of the Month in March 2025 is reported by a search snippet but is not shown on the entry page [unknown] |
| Corpus rating | D 7.8 / U 5.8 / C 8.0 / Co 7.2 → weighted 7.18, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Niccolò Miranda, Federico, G-NS Studio [verified, entry page "by" line]; the served bundle and the media sit under a `niccolomiranda/siena` jsDelivr path [verified, index.html, app.js] |
| Stack (evidence level) | **Webflow** shell (published 9 Mar 2025, jQuery 3.5.1, `webflow.js`) [verified, index.html comment, `data-wf-site`, script tags] · an injected esbuild-style bundle `app.js` from `siena-film-foundation.vercel.app`, with a commented-out `localhost:8000` dev switch [verified, index.html] · **GSAP 3.12.5** with ScrollTrigger, SplitText, DrawSVG, Observer and Flip code [verified, app.js `version:"3.12.5"`, `SplitText: 3.12.5` banner, `name:"drawSVG"`, `isFlip`] · **OGL** (`Renderer` with `isWebgl2`, "unable to create webgl context", `Program`, `Mesh`), version [unknown] [verified, app.js] · **@unseenco/taxi** page transitions, version [unknown] [verified, app.js `renderers`, `transitions`, `reloadJsFilter`; index.html `data-taxi`] · **Lenis 1.1.16** bundled [verified, app.js `"1.1.16"`; main.css `html.lenis`], used on which route [unknown] · the **virtual-scroll** package (`vs-touchmove-allowed`, `useKeyboard`, `firefoxMultiplier:15`) [verified, app.js] · **Howler 2.2.4** for four UI sounds [verified, app.js `howler.js v2.2.4`] · GA4 [verified, index.html] · three `.ttf` faces from the Webflow CDN [verified, Webflow CSS] |
| Palette | black ground, warm cream ink, two unused-looking accents (hexes in §3); strategy: **near-black cinema dark + one warm paper tone for tickets and type; chroma comes from the film stills, pushed toward gold by the shader** [verified, Webflow CSS `:root`; states2 captures; app.js fragment shader] |
| Type | **quirky display grotesque + spaced serif small caps + neutral grotesque + SVG period logotype**: Neue Brucke for titles, quotes and menu (55 uses), P22 Parrish Roman for letter-spaced labels (outlet names, category), NB International as body; the SIENA mark is one SVG with flared, western-poster letterforms [verified, Webflow CSS `font-family` counts; index.html `svg-logo`; mobile-state-entered.png] |
| WebGL dosage | canvas-first: one OGL canvas draws the film frames of the roll; the DOM lays out and carries titles, reviews and buttons over it [verified, manifest.json `canvases: 1`, index.html `data-gl="c"`, app.js] |
| Scroll model | virtual float, snapping, modulo-wrapped: the home route is fixed at `100svh`; wheel, touch, keys and top/bottom hitboxes feed a looping roll that eases and snaps to the nearest film [verified, out.css `[data-page=home]{height:100svh}`, app.js roll config; manifest `scrollMode: wheel`] |
| Narrative model | gallery: eight films on one endless vertical film strip, each frame a poster with reviews and an EXPLORE ticket to its case route [verified, index.html; states2 captures] |

## 1. Concept and narrative
The house presents itself as a cinema: you buy a ticket to get in, and what you see is the reel. The ENTER button is a ticket stub, the menu is a ticket with a perforated tear line, the contact is an "ADMIT ONE" stub numbered 004, and the films run past vertically as frames on a strip with rounded gate corners, grain and light leaks [verified, desktop-s00.png, desktop-state-menu-open.png, index.html].

Beats [verified, desktop-s00.png, states2/*]: black gate with the flared SIENA mark over "FILM FOUNDATION" in wide-spaced caps and one ENTER stub → the roll spins in and slows, frames smeared and blown toward white-gold by speed → a settled frame: the film still full-bleed, a festival laurel and "World premiere" at left, star ratings with outlet names and short quotes at right, category, title and credits below → the menu ticket unfolds into WORK / ABOUT / CONTACT with legal links and socials. The register is festival marketing: stars, laurels, two-to-four-word pull quotes such as "Pure cinematic beauty" [verified, index.html].

## 2. Structure and components
- **Gate**: an autoplaying logo film (desktop and mobile cuts); the ENTER stub fades in after a fixed 3.5 s timer, not a load signal; clicking sets a `preloader_shown` cookie for one hour, after which the gate is skipped [verified, app.js `COOKIE_DURATION:60*60*1e3`, `setTimeout(…showButton,3500)`; desktop-state-repeat-visit.png].
- **Tutorial**: two seconds after entry a small panel slides up with a looping demo video and captions that step every 4.8 s ("Hold and drag to navigate the content", the menu, EXPLORE); a `tutorial_shown` cookie suppresses it for 48 h [verified, app.js `Bv=48*60*60*1e3`, `setInterval(…,4800)`; desktop-rm-state-entered.png].
- **Roll**: eight `[data-roll="item"]` poster frames, each a DOM layer (laurel, reviews, title, credit table, EXPLORE) over a GL image plane; frames above and below peek in, blurred [verified, index.html; desktop-state-roll-next.png].
- **Menu ticket** (top right): a stub showing the current film's thumbnail, title, category, year and minutes, with a chevron that drops a list of all eight films; a second column holds the hamburger that opens the main panel. Both panels are driven by hidden checkboxes and CSS `:has(input:checked)` [verified, index.html `#smallpanel`, `#mainpanel`; main.css].
- **Cursor**: a ring labelled SCROLL that swaps to an up or down arrow over invisible PREV / NEXT halves of the screen; a click there steps the roll [verified, main.css `.top/.bottom[data-cursor=home]`; app.js `onHitbox`; desktop-state-keyboard.png].
- **Phone**: the roll becomes a stack of full-width DOM poster cards with the reviews above the still and a solid EXPLORE stub; a "Rotate your device" cover exists for one Webflow breakpoint [verified, mobile-state-entered.png; index.html `div-block-44`, Webflow CSS].
- **Sound**: four hover and menu cues (CTA in / out, menu in / out) at volume .5; no mute control found [verified, app.js `Pi.lib`, index.html has no sound toggle].
- `/work` (a `100vw` horizontal route), `/about`, the case routes and a 404 were not visited [unknown].

## 3. Visual language
- **Ground**: black for the page and the GL clear colour:
  `#000` [verified, Webflow CSS `--black:black`; app.js `clearColor:[0,0,0,1]`]
- **Ink and paper**: one warm cream for type, tickets and the logo; the entry lists it too:
  `#faf7ef` [verified, Webflow CSS `--white`; entry page]
  `#faf7ef4d` [verified, Webflow CSS `--white--30`]
- **Declared accents** not seen in any capture:
  `#ffc700` [verified, Webflow CSS `--gold`]
  `#ff0f00` [verified, Webflow CSS `--red`]
  `#222` [verified, Webflow CSS `--gray`]
  `#bababa` [verified, Webflow CSS `--col--gray`]
- **Material**: film grain over everything, rounded film-gate corners, dashed tear lines and punched notches on every button and panel, star rows and festival laurels as ornament [verified, states2 captures].
- **Imagery**: warm, shallow-focus stills from the films; the shader darkens and gold-dodges the corners, so the whole reel reads amber [verified, desktop-state-roll-next.png; app.js fragment shader].
- **Type**: titles in Neue Brucke caps set tight; outlet names in P22 Parrish Roman at wide tracking; ticket metadata in tiny NB International caps. Tokens: `--text-h1: 5.6rem`, `--text-h2: 3.2rem`, `--text-eyeb-small: .6rem`; display words up to `49vw` somewhere in the CSS [verified, Webflow CSS].
- **Surfaces**: no `theme-color`; favicon and web clip set [verified, index.html].

## 4. Motion and effects (with parameters)
- **Roll engine** [verified, app.js `sc.roll`]: `scrollSpeed .001` (wheel delta × .001 on the target), `lerpFactor .1`, `snapThreshold .25`, `snapFactor .1`, `mouseMultiplier .5`, `touchMultiplier 5.5`, `keyScrollCooldown 200` ms. ArrowUp steps back, ArrowDown and Space step forward. Item positions wrap by a modulo over half the item count, so the strip never ends.
- **Entry spin**: after ENTER the roll's current and target are set to −60 and it runs down to the first film, about seven loops of eight [verified, app.js `animateIn`]; the smeared, blown-out frames are this spin [verified, desktop-state-settled.png].
- **Velocity as blur**: the DOM layer of every frame gets `filter: blur(lspeed × 10 px)`, `lspeed` lerped at .1 toward the decaying speed (×.95 per frame); parallax children move by `offset × value × 10 %`; `will-change` is set only while moving; off on phones [verified, app.js `updatePositions`].
- **GL frame shader** [verified, app.js fragment `Ff`]: the still is sampled with a scroll parallax offset; a mask texture sampled at `x × .7168` cuts the frame shape; two corner gradients (`smoothstep(.1,.4, distance)`) blend the image toward a colour-dodge of `vec3(1, .86, 0)` at 20 %; a vertical `smoothstep(.5,.1)` vignette; alpha = mask × page alpha. DPR `min(devicePixelRatio, 2)`; render on the GSAP ticker [verified, app.js].
- **CSS curves**: `--customEase cubic-bezier(.19,1,.22,1)`, `--easeOutQuint cubic-bezier(.23,1,.32,1)`, `--easeOut cubic-bezier(.77,0,.175,1)`; menu panels open on `grid-template-rows` over `--panels-duration .9s`; delays on a `data-delay` ladder .1–2 s [verified, main.css]. One rule references `var(----customEase)` (four dashes) and so falls back to the default easing [verified, main.css `[data-a=y]`].
- **Transitions**: Taxi swaps routes with a default renderer and transition; parameters [unknown].
- **Reduced motion**: none. No `prefers-reduced-motion` in app.js, main.css or the Webflow CSS, and `desktop-rm-state-entered.png` shows the same smeared spin and tutorial as the full run [verified].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Shell / CMS | Webflow, jQuery 3.5.1 | [verified, index.html] |
| Engine | one bundle from Vercel, 419 KB raw / 132 KB gzip | [verified, fetched app.js] |
| GL | OGL, one canvas, DPR ≤ 2 | [verified, app.js] |
| Motion | GSAP 3.12.5 + ScrollTrigger, SplitText, DrawSVG, Observer | [verified, app.js] |
| Scroll / input | own roll engine; virtual-scroll package; Lenis 1.1.16 | [verified, app.js] |
| Routes | @unseenco/taxi | [verified, app.js] |
| Sound | Howler 2.2.4, four MP3 cues | [verified, app.js] |
| Fonts | three `.ttf` files, no woff2 | [verified, Webflow CSS] |

Media and sound come from jsDelivr under a GitHub path, not the Webflow CDN [verified, index.html, app.js]. Manifest: 2,032 DOM nodes, no console errors; the tutorial MP4 aborts in every viewport; CLS .65 on desktop and .10 on mobile, measured on the gate [verified, manifest.json]. `lcpColdSynthetic` is a headless artefact and is not quoted.

## 6. Weaknesses
- Reduced motion: **fail**. No branch anywhere; the seven-loop entry spin and velocity blur run unchanged [verified, captures + sources].
- Keyboard: **fail**. Arrows and Space step the roll, but `outline: 0` with no replacement, the menu is a `div` over unlabelled checkboxes, EXPLORE is a `button` nested inside an `a`, and three Tabs show no visible focus [verified, index.html, Webflow CSS, desktop-state-keyboard.png].
- DOM behind the canvas: **partial**. Titles, credits and reviews are real DOM text, but there is no `h1`, `main` or `nav`, and all 76 images carry `alt=""` [verified, index.html].
- Load gate: **fail on first visit, pass on repeat**. A fixed 3.5 s hold then a required click; a one-hour cookie skips it [verified, app.js; desktop-state-repeat-visit.png].
- Phone: **pass**. A designed stack of poster cards [verified, mobile-state-entered.png].
- Wayfinding: **partial**. The menu ticket names the current film and lists all eight, but the loop has no count and the tutorial is needed to explain the controls [verified, captures].
- Content: every film's case panel repeats the same HEADLINE line and producer, and a Webflow placeholder sentence ships in the DOM [verified, index.html].

**What the awards skills do differently**: the gate is tied to a real load signal and skipped by key on repeat [recipe:preloader-counter-hold]; a reduced tier snaps the roll with no spin and no blur [recipe:reduced-motion-switch]; the menu is a real button with a focus trap [recipe:nav-overlay-fullscreen]; the loop shows "n of 8"; controls are taught by the interface, not a timed video.

## 7. Principles
1. **Borrow the ritual of the subject's venue.** When the entry, the navigation and the contact each take the form of one object from that venue, the site feels like a place without any literal 3D.
2. **Let a shader carry the grade.** One fragment pass that warms and vignettes every image makes unrelated stills read as one collection.
3. **Speed can be a visual texture.** Blur, smear and exposure driven by velocity turn scrolling into the subject's own material and settle to a clean frame at rest.
4. **Keep the index beside the reel.** A compact live label for the current item, which opens into the full list, lets a looping gallery stay browsable.
5. **Put evidence on the frame.** Ratings, festivals and running times laid on each item do the persuading without a separate section.

## 8. Take / Don't take
- **Take:**
  - Roll parameters as a starting point: target += delta × .001, lerp .1, snap threshold .25 with snap factor .1, a 200 ms key cooldown.
  - Velocity blur on the DOM layer with `will-change` set only while moving and dropped on phones.
  - A texture mask for the GL frame shape instead of geometry, plus corner-dodge and vertical vignette uniforms.
  - A single object used as the chrome vocabulary across gate, menu, CTAs and contact.
  - A current-item ticket that doubles as the index dropdown.
- **Don't take:**
  - The palette as literal values:
    `#000` [verified, Webflow CSS]
    `#faf7ef` [verified, Webflow CSS]
    `#faf7ef4d` [verified, Webflow CSS]
    `#ffc700` [verified, Webflow CSS]
    `#ff0f00` [verified, Webflow CSS]
    `#222` [verified, Webflow CSS]
    `#bababa` [verified, Webflow CSS]
  - The ticket-stub buttons, ADMIT ONE contact and film-gate frame as drawn, the flared logotype, and the gold-dodge grade as-is.
  - Any film still, title, review quote or credit.
  - The timed gate, the seven-loop entry spin, the missing reduced-motion branch, `outline: 0` and the checkbox menu: things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Awards and credits | high: entry page fetched and captured 2026-09-23 (a cookie wall covers the capture; scores read from the HTML) |
| Stack, roll engine, shader, gate and tutorial logic | high: index.html, app.js, main.css, Webflow CSS |
| Composition, menu, phone, reduced motion, keyboard | high: gate frames plus eleven interactive states |
| Transitions, other routes, 404 | unknown |

**Live pass 2026-09-23: reachable; capture exit 0.** Every scroll frame (`desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`) shows the ENTER gate, because the home route never scrolls and waits for a click. Past it, the states were reached with `--states`: `states/` (exit 2: entered on desktop, mobile and reduced motion; later states failed there because the one-hour cookie had already skipped the gate) and `states2/` (exit 0, desktop: settled, repeat-visit, roll-next by one wheel, menu-open, keyboard). Sources in `.awards/research/siena/`: those captures, `manifest.json` per pass, `index.html`, `app.js`, `main.css`, `out.css`, `siena-work-space.webflow.5a4c7c0c2.min.css`, `states.json`, `states2.json`; `entry/desktop-s00.png` and `entry/siena-film-foundation.html` from awwwards.com/sites/siena-film-foundation.
