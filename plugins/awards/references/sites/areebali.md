# ree|b. handheld portfolio (Areeb Ali) — https://areebali.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio: a product designer and design engineer's case studies, AI films and experiments [verified, index.html `meta[name=description]`] |
| Visitor mode | persuade (experience-led). The portfolio is a device you switch on and operate, and a *Book a call* link sits in the contact channel [verified, 0-l9aqkh94542.js contact list; states/desktop-state-power-nav.png] |
| Awards | Awwwards Honorable Mention, 10 Aug 2026, listed as "ree\|b. handheld portfolio"; no axis scores visible behind the consent panel [verified, entry/desktop-s00.png; entry URL linked from the site's own ribbon in 0-l9aqkh94542.js] |
| Corpus rating | D 7.6 / U 6.8 / C 8.0 / Co 7.4 → weighted 7.42, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Areeb Ali, design and build [verified, index.html `meta[name=author]`; footer line in desktop-s25.png]; sole authorship of the code [inferred] |
| Stack (evidence level) | **Next.js** App Router, Turbopack build (`/_next/static/chunks/turbopack-*.js`, `self.__next_f`) [verified, index.html] · **React 19.3 canary** [verified, 0wj8l4fwydekq.js `"19.3.0-canary-3f0b9e61-20260317"`] · **GSAP 3.14.2** with ScrollTrigger and Observer in one chunk; which component uses it is unread [verified, 04f71k5d5_pc2.js `version="3.14.2"`] · no Lenis, no Three / OGL / Rive signature in the fetched chunks [verified, grep of all 12 chunks] · **Web Audio** synthesised UI tones + one WAV doorbell [verified, 0-l9aqkh94542.js `createOscillator`] · a `/api/rams` chat endpoint [verified, 0-l9aqkh94542.js] · Google Analytics [verified, manifest.json failed requests] · fonts via `next/font` (Inter, Libre Baskerville, League Spartan TTF) [verified, index.html preloads + `html` classes] |
| Palette | cool grey stage behind the device (intro cover and page ground) |
| | `#c9ced5` [verified, 0-l9aqkh94542.js inline `background`] |
| | brushed-aluminium body and wheel, mid tone |
| | `#e6e9ed` [verified, 0-l9aqkh94542.js gradient stops] |
| | black glass screen |
| | `#0a0b0d` [verified, 0-l9aqkh94542.js; role read from desktop-s25.png] |
| | label ink on the aluminium, used at 0.2–0.62 alpha |
| | `#2b2e33` [verified, 0-l9aqkh94542.js `rgba(43,46,51,…)`] |
| | the one accent: power key, LED, selected channel, screen titles |
| | `#e8461c` [verified, 0t~vlawo4y1zt.css `--color-orange`] |
| | accent hover on screen crumbs |
| | `#ff7a4d` [verified, index.html inline `.rn-crumb:hover`] |
| | Strategy: **the object's materials are the palette**: aluminium greys on a cool grey stage, one black screen, one orange control colour. Screen text is off-white at stepped alphas [verified, captures + 0-l9aqkh94542.js] |
| Type | **neutral grotesque chrome + system monospace screen + serif accent for the guestbook**: Inter for chrome labels; `ui-monospace, 'SF Mono', Menlo, monospace` for everything on the screen; Libre Baskerville for the guestbook line [verified, 0t~vlawo4y1zt.css families; 0-l9aqkh94542.js `W=`; desktop-s50.png]. League Spartan variable is preloaded, probably for the heavy `ree\|b.` wordmark [verified preload; use inferred] |
| WebGL dosage | none. No renderer signature in any fetched chunk; the manifest counts one canvas on desktop and none on the phone, purpose unread [verified, chunks + manifest.json; canvas role unknown] |
| Scroll model | section switcher. The document never scrolls (all five wheel states show the same composition); the screen swaps channels and items via wheel, keys and taps [verified, desktop-s50/s75/s100.png identical; 0-l9aqkh94542.js key map] |
| Narrative model | faceted world on one object: four channels on a click wheel (work up, about right, contact down, chat left), work split into Work / AI Films / Playground [verified, mobile-state-power-on.png; icon roles inferred from the glyphs and `WORK` / `CHAT` / `AI` / `PLAY` keys in 0-l9aqkh94542.js] |

## 1. Concept and narrative
**One idea:** the portfolio is a handheld product the visitor switches on. A product designer shows his work through a product. The lineage (a Braun radio, then the click-wheel music player) is stated in the site's own chat replies [verified, 0-l9aqkh94542.js reply strings]. The case studies sit inside the device's screen as text, not as a page of image tiles.

Beats: a random design quotation on a cover, not repeated within the session. Then a short film of a glowing wireframe handheld assembling [verified, desktop-s00.png; 0-l9aqkh94542.js `rn-intro-quote-last`]. The film cuts to the real device, dead, with *press power* on the black screen [verified, desktop-s25.png]. Power on lights the orange LED and opens the work list: numbered lines, years, a lock glyph on one NDA project [verified, states/mobile-state-power-on.png]. Stepping selects a line, and the screen shows role, a two-line summary and hashtags, with *1 / 8* and prev / next [verified, states/desktop-state-power-nav.png]. The copy register is terse terminal lowercase on screen and letter-spaced micro caps on the body.

## 2. Structure and components
- **Intro gate**: quotation card, then the wireframe film, then a handoff onto the live device. The plain path (reduced motion, or ≤ 640 px) drops the film [verified, 0-l9aqkh94542.js `d(n?"video":"plain")`].
- **The device**: a rounded aluminium slab centred on the stage. Wordmark and version top left, speaker dots, status LED top right, black screen, orange *power* key left, click wheel centre with four glyphs and a select button, *back* key right [verified, desktop-s25.png]. A USB-stick-like accessory leans out behind its right edge [verified, desktop-s25.png; function unread].
- **Screen UI**: breadcrumb (`/WORK`), item count, three sub-channel tabs, numbered rows, a single highlighted row that the pointer moves, and an `OPEN` / `OPEN FULL` / `SEND` action label that changes by channel [verified, mobile-state-power-nav.png; 0-l9aqkh94542.js `tY`].
- **Projector**: *open full* expands a case study into an overlay with *esc to close* and a 44 px close button [verified, 0-l9aqkh94542.js `aria-label":"Close projector"`]; not captured.
- **Chat channel**: a nickname, then free text sent to `/api/rams`. A regex reply bank takes over on failure, and a password or NDA phrase routes to the locked project's access flow [verified, 0-l9aqkh94542.js `tI`, `tS`].
- **Keyboard legend** (right edge): shows only *P power on* while the device is off. Powered, it lists arrows, Enter, Alt + arrows, Esc and P [verified, desktop-s25.png vs states/desktop-state-power-nav.png].
- **Guestbook** (left): a countdown, *unlocks in 0:58*, then *leave your mark*, a *Stamp the wall* button, and a paginated wall of rubber-stamp marks in several shapes and inks [verified, desktop-rm-s00.png, desktop-s50.png]. Stamps are data committed to the bundle; pending ones wait in `localStorage` [verified, 03.ic12.qdu.s.js stamp records; 0-l9aqkh94542.js `rn-stamp-pending-v1`].
- **Changelog** (bottom left): dated commit subjects with shas, mostly stamp approvals plus feature notes [verified, desktop-s25.png; 0-l9aqkh94542.js changelog array].
- **Honors ribbon** (right edge) linking to the award entry [verified, desktop-s25.png; 0-l9aqkh94542.js `id:"awwwards"`].
- **Phone**: the device *is* the viewport: screen and wheel enlarged, guestbook, changelog and legend gone, *tap a line to open* [verified, mobile-s00.png, states/mobile-state-power-on.png; manifest.json 188 DOM nodes vs 3 142 on desktop].

## 3. Visual language
- **Grounds**: one cool grey field with a soft radial light around the device; no sections, no second ground [verified, desktop-s25.png].
- **Material**: skeuomorphic, drawn in CSS. The body is brushed metal with a fine vertical grain, the wheel a radial-gradient dish with an inset highlight, the keys pill-shaped [verified, desktop-s25.png; 0-l9aqkh94542.js `radial-gradient(circle at 50% 40%, …)`]. A noise overlay sits on top, off under reduced motion and ≤ 768 px [verified, 0t~vlawo4y1zt.css `.noise-overlay`].
- **Type**: the screen is monospace at about 13 px with the orange for titles and indices; the chrome is Inter micro caps at 9–10 px with wide tracking (`0.24em`) [verified, 0-l9aqkh94542.js `fontSize:9`, `fontSize:13`]. The serif appears only on the guestbook, which reads as a visitors' book beside the machine [verified, desktop-s50.png].
- **Layout**: device centred at fixed size on desktop; peripheral panels pinned to three corners and one edge; nothing competes with the object [verified, desktop-s25.png].
- **Browser surfaces**: an orange scrollbar thumb on the (unused) page scrollbar; a stored `lc-theme` light theme switches the unused `--background` token [verified, 0t~vlawo4y1zt.css; index.html inline script]. No `theme-color` meta [verified, index.html].

## 4. Motion and effects (with parameters)
- **Intro timeline**: quote at 120 ms, recovery at 2 900 ms, film at 3 600 ms. The handoff comes when the video reaches 7.875 s, or at a 13 975 ms fallback, then 620 ms to done. The plain path fades out at 3 600 ms and is done at 4 400 ms. The film is sized to the device's measured rect so it lands on it [verified, 0-l9aqkh94542.js `ec`, `onTimeUpdate`, `style:{left:u.left,…}`].
- **Wheel tilt**: pointer position maps to `perspective(620px) rotateX(−5y) rotateY(5x)` in degrees, and a press scales it to .985. It follows over .12 s `ease-out` while hovered and settles over .5 s `cubic-bezier(0.2,0.8,0.2,1)` on leave [verified, 0-l9aqkh94542.js].
- **Projector**: in over .1–.2 s `ease`, out over .5 s `cubic-bezier(0.4,0,0.6,1)` [verified, 0-l9aqkh94542.js `projIn`, `projFadeOut`].
- **Vocabulary**: CSS `cubic-bezier(.16,1,.3,1)`; inline `(0.7,0,0.25,1)`, `(0.2,0.7,0.2,1)`; row hover fills over .14 s [verified, 0t~vlawo4y1zt.css; 0-l9aqkh94542.js; index.html inline style].
- **Sound**: short synthesised clicks and chimes. A sine and a triangle voice play 784 Hz, then 1 174.7 Hz 85 ms later; a 300 → 760 Hz sweep runs over .1 s. A doorbell WAV is fetched on first use, and the context resumes on a gesture [verified, 0-l9aqkh94542.js]. An on-screen *sound / muted* toggle starts muted; whether the key clicks obey it is unread [verified `useState(!1)`; coverage unknown].
- **Reduced motion**: a global rule collapses every CSS transition and animation to .001 ms, the device scope repeats it, and the film is skipped [verified, 0t~vlawo4y1zt.css; 0-l9aqkh94542.js].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| Framework | Next.js on Turbopack, React 19.3 canary, RSC flight data inline [verified, index.html; 0wj8l4fwydekq.js] |
| Styling | Tailwind-style tokens in one 45 KB stylesheet; the device itself is inline React styles [verified, 0t~vlawo4y1zt.css `--spacing:.25rem`; 0-l9aqkh94542.js] |
| Motion | CSS transitions for the device; GSAP 3.14.2 + ScrollTrigger + Observer shipped [verified, 04f71k5d5_pc2.js] |
| Media | one intro MP4 (`/Folio-1.mp4`); case-study films and WebP storyboards per project [verified, 0-l9aqkh94542.js; 03.ic12.qdu.s.js] |
| Content | projects, stamps, quotes and changelog as JS data modules [verified, 03.ic12.qdu.s.js; 0-l9aqkh94542.js] |

Fetched text weights, raw: 12 JS chunks about 1.07 MB, the largest 226 KB (React DOM) and 99 KB (the device); CSS 45 KB [verified, fetched files]. No console or page errors; the only failed requests are aborted analytics beacons; CLS 0 on all three profiles [verified, manifest.json].

## 6. Weaknesses
- Reduced motion: **pass**. `desktop-rm-s00` shows the finished device at rest; the film is skipped and transitions collapse [verified].
- Keyboard: **partial**. The key map is generous and printed on screen: P, Enter or Space to power, arrows, Alt + arrows, Esc [verified, 0-l9aqkh94542.js; legend capture]. But no `:focus-visible` rule exists in any fetched file, the chat input sets `outline: none`, and three Tabs showed no visible focus [verified, states/desktop-state-tab-walk.png; grep].
- DOM: **pass with a gap**. No canvas carries content. An sr-only `h1` and a polite live-region `h2` announce the screen state, and the device is `role="main"` [verified, 0-l9aqkh94542.js]. Case-study copy arrives from JS data; server-rendered coverage unread [unknown].
- Load gate: **fail**. Every visit plays the intro: about 14.6 s with the film, 4.4 s plain. No skip control or repeat-visit bypass was found; `sessionStorage` only rotates the quotation [verified, 0-l9aqkh94542.js; no `skip` string]. A second gate follows: the screen is dark until Power.
- Phone: **pass**. A designed layout where the device fills the phone, with touch copy [verified, mobile captures].
- Wayfinding and conversion: **partial**. Breadcrumb, *1 / 8* and the legend orient well once powered, but contact is two gestures deep and the chrome labels are 9 px grey on grey [verified, captures; 0-l9aqkh94542.js].

What the awards skills do differently: the intro is skippable and plays once per session (`[recipe:preloader-counter-hold]` holds on a real signal, never a timer); every device control gets a visible focus ring in the accent (`[pattern:accessibility-and-reduced-motion#skip-link-landmarks-and-focus-styles]`); labels hold a 12 px floor; and a plain *email / book a call* line sits outside the device so conversion needs no power-on.

## 7. Principles
1. **Let the navigation be an object with a known grammar.** When the controls borrow a device everyone has held, the information architecture teaches itself: four directions, four sections, one select, one back.
2. **Print the keymap beside the interface and let it change with state.** A legend that shows only what works right now turns an eccentric UI into a legible one.
3. **Land the film on the live interface.** Sizing a pre-rendered intro to the real element's rect, then cutting to it, makes the load sequence arrive somewhere instead of ending before it.
4. **Give visitors a durable, moderated mark.** A wall that grows by review, with the moderation published as a dated log, makes a personal site visibly alive between visits.
5. **Put a portfolio's evidence in text on a small screen.** Numbered lines with years and a one-line role read faster than a grid of thumbnails and hold one type system.

## 8. Take / Don't take
- **Take:**
  - An object-as-navigation pattern: directional input maps to channels, and a single highlighted row always matches what Enter opens. Mirror the state into a polite live region `[pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates]`.
  - A state-aware shortcut legend at the edge of the stage, listing only the live keys.
  - Pointer tilt on a control capped at ±5° with `perspective(620px)`, a .985 press scale, a fast follow (.12 s) and a slow settle (.5 s).
  - An intro film positioned on the target element's bounding rect, cut on `timeupdate` with a timer fallback, and replaced by a plain fade under reduced motion or on small screens `[pattern:preloaders-and-transitions#preloader-archetypes]`.
  - UI sounds synthesised with Web Audio oscillators rather than samples, started muted `[recipe:sound-toggle-opt-in]`.
  - A dated changelog as living content `[pattern:components-catalog#living-utility-pages]`.
- **Don't take:**
  - The palette as literal values:
    - `#c9ced5` [verified, 0-l9aqkh94542.js]
    - `#e6e9ed` [verified, 0-l9aqkh94542.js]
    - `#0a0b0d` [verified, 0-l9aqkh94542.js]
    - `#2b2e33` [verified, 0-l9aqkh94542.js]
    - `#e8461c` [verified, 0t~vlawo4y1zt.css]
    - `#ff7a4d` [verified, index.html]
  - The click-wheel handheld itself, the wireframe boot film, the power-on gate, the rubber-stamp guestbook and the quotation cover: together they are this site's signature.
  - Any case-study text, project names, quotation list or chat reply lines.
  - A mandatory 14 s intro on every visit, missing focus rings and 9 px grey chrome labels: these are the parts to improve on.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high: served HTML, all 12 linked JS chunks and the stylesheet |
| Awards | high for the Honorable Mention and date, read from the entry page; axis scores not read (consent panel); rating is this corpus's own [inferred] |
| Concept, structure, visual language | high: five desktop and five phone scroll frames, five reduced-motion frames, and three keyboard-driven states per viewport |
| Motion parameters | high: read from the device chunk; the projector and chat were not rendered |
| Weaknesses | high for reduced motion, keyboard, load gate and phone; server-rendered DOM coverage unknown |

**Live pass 2026-09-23: reachable, `scrollMode: wheel`.** The page never scrolls: `desktop-s50`, `s75` and `s100` are the same composition, and s00 → s25 differ only by intro time, so the wheel retry was not needed. A second pass drove keys into `states/`: `power-on` (P), `power-nav` (P, ArrowDown, Enter) and `tab-walk` (Tab ×3), desktop and phone. The desktop `power-on` and `s00` frames timed out there, and the phone frames cover them. Sources in `.awards/research/areebali/`: 15 captures + `manifest.json`; `states/` captures + `manifest.json`; `entry/desktop-s00.png`; `index.html`; 12 `/_next/static/chunks/*.js` and `0t~vlawo4y1zt.css`.
