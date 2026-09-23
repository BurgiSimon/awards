# goats. — https://goats.com.pl/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a Polish branding and web-development studio [verified, index.html `<title>` and meta description] |
| Visitor mode | persuade — a *Skontaktuj się* (contact) pill in the header, email and phone at display size in the close [verified, desktop-s00.png, desktop-s100.png] |
| Awards | Awwwards **Honorable Mention, 21 Aug 2026**; no axis or developer scores captured (cookie wall over the score panel; only individual juror rows visible) [verified, entry page, `entry/desktop-s00.png`, `entry/desktop-s100.png`]. The site links its own ribbon to the entry [verified, index.html `#awwwards`] |
| Corpus rating | D 6.6 / U 6.4 / C 6.6 / Co 6.3 → weighted 6.51, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Matt Michalak, Jacek Zielinski [verified, entry page, `entry/desktop-s50.png`] |
| Stack (evidence level) | **WordPress** with a custom `goats` theme built from ACF blocks (hero, about, wemake, clients, site-header, site-footer), Yoast SEO 28.5, W3 Total Cache lazyload, Contact Form 7 6.1.7 + reCAPTCHA v3, Flexible Cookies [verified, index.html] · **GSAP 3.15.0** + ScrollTrigger, bundled [verified, js_index.js `version="3.15.0"`] · **Lenis 1.3.25**, bundled [verified, js_index.js `da="1.3.25"`] · jQuery 3.7.1 loaded by WordPress, unused by the theme bundle [verified, index.html; inferred for unused] · GTM [verified, index.html] · fonts: Poppins self-hosted woff2 [verified, index.html inline `@font-face`] |
| Palette | ground light grey `--c-bg` |
| | `#ebebeb` [verified, css_index.css `:root`] |
| | ink `--c-dark` |
| | `#111` [verified, css_index.css `:root`] |
| | body text `--c-text` |
| | `#3f3f3f` [verified, css_index.css `:root`] |
| | the one accent, hot pink `--c-pink` (wordmark, first word of the statement, current language, cookie buttons) |
| | `#ff005c` [verified, css_index.css `:root`; desktop-s00/s25.png] |
| | dark grounds for menu and client section |
| | `#1c1c1c` [verified, css_index.css `--c-menu-dark`] |
| | `#212121` [verified, blocks_acf_clients_style-index.css `.clients`; desktop-s75.png] |
| | Strategy: **light-grey ground + near-black ink + one hot-pink accent; black-and-white goat footage carries the world**, colour only from client work [verified, CSS tokens; desktop-s00 to s100.png] |
| Type | **one geometric sans, three weights** — Poppins 400/500/600, latin + latin-ext [verified, index.html `@font-face`]; a reflex face by `references/reflex-lists.md` |
| WebGL dosage | none — `canvases: 0`; the world is three webm videos and stills [verified, manifest.json; index.html `<video>`] |
| Scroll model | native + Lenis 1.3.25 (`lerp: .1`) on the GSAP ticker; one desktop rail done by counter-translation, no `pin:`; a scrubbed video footer [verified, js_index.js; manifest.json `scrollMode: native`] |
| Narrative model | gallery — goat hero, a word-fill statement, a sideways case rail, a client logo grid, a herd-video close [verified, desktop-s00 to s100.png] |

## 1. Concept and narrative
**One idea:** the name taken literally. Goats (and the GOAT boast underneath) are the only motif: a black goat walks straight at the camera on a pale grey sweep in the hero, a suited reader behind a newspaper headed *WHAT WE DO* opens the work chapter, and a dark herd fills the footer, one black goat among grey ones [verified, desktop-s00.png, mobile-s50.png, desktop-s100.png]. The footage is monochrome, so the pink wordmark is the one saturated thing on the first screen [verified, desktop-s00.png].

Beats: the walking goat with a floating header card (contact pill, PL / EN / DE, burger) [verified, desktop-s00.png]; a centred greeting that fills word by word (*Cześć, jesteśmy goats.*) under a spaced-caps label [verified, desktop-s25.png]; the newspaper video giving way sideways to a claim (*marki, których nie da się zignorować*) and a rail of portrait case cards over a large faint goat-head artboard [verified, desktop-s50.png]; a dark *Z kim pracujemy?* grid of client logos [verified, desktop-rm-s75.png]; the herd footer with the white wordmark, a tagline, contact lines and five links [verified, desktop-s100.png]. Register: short, confident agency lines in Polish, with EN and DE routes [verified, index.html `hreflang`].

## 2. Structure and components
- **Preloader**: logo mark, a dot, a numeric counter and an SVG curve for the curtain's lower edge; quick mode on a repeat visit in the same session [verified, index.html `.preloader`; js_index.js `goatsPreloaded`].
- **Header**: pink wordmark top left; a white rounded card top right with an outlined contact pill, language links (current in pink, `aria-current`) and a two-line burger; hides on scroll down after 120 px, returns on scroll up [verified, desktop-s00.png; js_index.js `start:120`].
- **Menu overlay**: `role="dialog"`, `aria-modal`, a goat SVG on the left half, three links and languages on the right; Escape, a Tab trap and `inert` on the page behind [verified, index.html; js_index.js].
- **Side chrome**: a fixed column of three social icons at the right edge and an Awwwards *Honors* tab at the left edge on every frame [verified, all desktop captures].
- **Hero**: a full-viewport muted looping webm with a poster; the phone gets its own clip, framed in a rounded card [verified, index.html `data-mobile-src`; mobile-s00.png]. A pause / play button sits bottom left and fades out once the hero leaves [verified, index.html `.video-toggle`; js_index.js].
- **Statement**: a 200 vh section with a sticky 100 svh stage, one screen-reader-only `h1` elsewhere, the greeting as the visible `h2` [verified, blocks_acf_about_style-index.css; index.html].
- **Case rail (*wemake*)**: an intro video screen, then the claim and seven linked portrait cards (321:435, rounded) with a progress bar; desktop moves sideways on scroll, phone scrolls natively [verified, index.html; blocks_acf_wemake_style-index.css; desktop-s50.png, desktop-rm-s75.png].
- **Clients**: a dark section with the heading at 12 % white and eight logo tiles in a four-column grid [verified, blocks_acf_clients_style-index.css; desktop-rm-s75.png].
- **Footer**: a sticky full-height herd video under a shade, the wordmark as a back-to-top link, email and phone with arrow glyphs, five links, socials, the privacy link [verified, index.html; desktop-s100.png].
- **404**: exists as a designed page (a goat illustration and outlined code in the CSS; listed on the entry as a 404 element) [verified, css_index.css `.err404`; `entry/desktop-s50.png`]; not captured.
- Third-party chrome on every frame: a consent card (bottom left) and the reCAPTCHA badge (bottom right) [verified, desktop-s00.png, mobile-s00.png].

## 3. Visual language
- **Grounds**: light grey for hero, statement and rail; near-black for clients and the footer; the transition is a straight cut [verified, desktop-s75.png].
- **Accent discipline**: pink appears only on the wordmark, the first word of the greeting, the last word of the claim, the current language and the consent buttons [verified, desktop-s00/s25/s50.png].
- **Type scale**: fluid `clamp()` everywhere — statement `clamp(44px, 6.8vw, 130px)` at 600 with `.01em` tracking and 1.15 leading; claim `clamp(34px, 3.9vw, 75px)`; clients heading `clamp(44px, 6vw, 116px)` [verified, block CSS files]. Labels in spaced caps [verified, desktop-s25.png].
- **Imagery**: monochrome, studio-lit animal and figure footage on a pale sweep; client cards are full-colour product and campaign photography with rounded corners [verified, desktop-s00/s50.png].
- **Layout**: centred single-column statements; the rail's claim is left-aligned beside a large white goat-head artboard [verified, desktop-s50.png].
- **Browser surfaces**: SVG + ICO favicons and an apple-touch icon [verified, index.html]; no `theme-color` meta [verified, index.html]; `scrollbar-gutter: stable` [verified, css_index.css]; one easing token in CSS, `cubic-bezier(.22,1,.36,1)`, and a `.3s linear` default transition [verified, css_index.css].

## 4. Motion and effects (with parameters)
- **Lenis**: `new Lenis({ lerp: .1 })`, `lenis.raf(time × 1000)` from `gsap.ticker`, `lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)`; stopped while preloading, during the hero intro and while the menu is open; never created under reduced motion [verified, js_index.js].
- **Preloader**: mark `yPercent 110 → 0`, .9 s `expo.out` (.55 s quick); dot `scale 0 → 1`, .5 s `back.out(2.5)`; counter tweens to 92 over 2.4 s `power2.out`, then to 100 in .35 s `power1.in` once `load` fires and a minimum of 1500 ms (800 ms quick) has passed; fallbacks at 3.5 s, 5.2 s and a hard release at 6.8 s [verified, js_index.js].
- **Curtain exit**: counter out (`y: -24`, .3 s `power2.in`), mark `yPercent -112` .45 s `expo.in`, curtain `yPercent -112` .9 s `expo.inOut` after .4 s (.2 s quick); its lower-edge path bows to `Q50,10` over .4 s `power2.in`, then flattens over .45 s `power3.out` [verified, js_index.js].
- **Aperture handoff** (first frame at the top, motion allowed): the hero starts at `clip-path: inset(32% round 10px)`, opacity 0 and the video at `scale .6`, opacity .5; it fades in .7 s `power2.out` while the inset eases to 30 %, then opens to `inset(0% round 0px)` over 1.4 s `expo.inOut` with the video scaling to 1; chrome follows (`y: -1.5vw → 0`, 1.4 s, delay 1). Scroll stays locked for 2.4 s [verified, js_index.js].
- **Hero scroll-out**: video `y: 50vh`, `scale 1.1`, opacity → 0, scrubbed from `top top` to `bottom top` [verified, js_index.js].
- **Word fill**: label and every title word set to opacity .15, then one scrubbed timeline brings each to 1 (`duration 1`, `stagger .5`, `ease: 'none'`) from `top top` to `bottom bottom` of the 200 vh section [verified, js_index.js].
- **Rail without a pin** (≥ 1025 px): the section's height is set to viewport + track overflow `T`; one scrubbed tween moves the track `y: +T, x: −T` so it holds still while it slides; the intro video drifts `x: T/2`, `scale 1.1`, opacity → 0; after one viewport width the title and artboard counter-move to stay in view. Below 1025 px the list becomes a native `overflow-x` rail with `scroll-snap-align: start`, `tabindex="0"`, `data-lenis-prevent` and a `scaleX` progress bar written on rAF [verified, js_index.js; blocks_acf_wemake_style-index.css].
- **Client tiles**: `from autoAlpha 0, y 28`, .7 s `power2.out`, stagger .08, at `top 82%`, once [verified, js_index.js].
- **Scrubbed footer video** (fine pointer, and only when the footer content fits one viewport): the wrap is `100 + clamp(55, round(51 × duration), 150)` vh tall around a sticky 100 svh stage, and `currentTime = progress × (duration − .05)`. On coarse pointers the clip is unlocked by a play-then-pause on the first touch, and falls back to a plain loop when no duration arrives [verified, js_index.js; blocks_acf_site-footer_style-index.css].
- **Idle snap** to the nearest section top (within 45 % of the viewport, 140 ms after scrolling stops, .9 s ease-out cubic, desktop fine pointer only) ships in the bundle but targets another page template, so it is inactive on the home route [verified, js_index.js `page-template-page-no-title`].
- No cursor, no text splitting, no sound, no page-transition library [verified, grep of js_index.js].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| CMS / build | WordPress, custom block theme, ACF blocks each with their own CSS; one bundled `index.js` (158 KB uncompressed) | [verified, index.html; local file size] |
| Motion | GSAP 3.15.0 + ScrollTrigger; Lenis 1.3.25 | [verified, js_index.js] |
| Media | three webm videos (desktop hero, mobile hero, footer) with posters; `what_we_do_video.webm`; images lazy-loaded through `data-src` | [verified, index.html] |
| Third parties | GTM, reCAPTCHA v3, Flexible Cookies consent | [verified, index.html] |

- 378 DOM nodes on desktop; CLS .04 desktop, .007 phone [verified, manifest.json]. `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.
- Console: `requestStorageAccess` denials on each profile and one 401 on the phone; the footer webm request was aborted once on desktop [verified, manifest.json].
- ScrollTrigger is refreshed when an image or video finishes loading and the page height changed, deferred while the rail is active [verified, js_index.js].
- Video weights [unknown] — not fetched.

## 6. Weaknesses
- Reduced motion: **partial**. Lenis, the hero intro, the word fill, the rail, the footer scrub and the hero autoplay are all skipped [verified, js_index.js; desktop-rm-s00.png]. The preloader still runs its counter and its 1.5 s floor [verified, js_index.js]. The greeting then rests in white on the light-grey ground, about 1.2:1 [verified, desktop-rm-s25.png; blocks_acf_about_style-index.css].
- Keyboard: **mixed**. There is a skip link; the menu is a real dialog with Escape, a Tab trap and `inert`, and the video has a labelled pause button [verified, index.html; js_index.js]. But the focus ring is a 2 px **white** outline on a light-grey page [verified, css_index.css `:focus-visible`], and nothing moves the desktop rail to a focused card [verified, no focus handler in js_index.js], so focus can sit off-screen [inferred].
- DOM behind the canvas: **pass** — there is no canvas; all copy and links are in the served HTML [verified, index.html].
- Load gate: **fail on first visit**. A 1.5 s minimum hold, a .9 s curtain and a 2.4 s scroll-locked intro. A repeat visit shortens the hold to .8 s, but the locked intro still plays at the top [verified, js_index.js].
- Phone: **designed**. It has its own hero clip, a native snap rail and a looping footer [verified, mobile-s00/s50.png; js_index.js]. The consent card covers about half of the first phone screen, and the reCAPTCHA badge overlaps the social column [verified, mobile-s00.png, mobile-s50.png].
- Wayfinding and conversion: **pass**. The contact pill is in the header and the email and phone are the footer's largest lines [verified, desktop-s00/s100.png]. No section marker, and the header hides on every downward scroll [verified, js_index.js].
- Contrast beyond the statement: the clients heading at 12 % white on near-black is a heading nobody can read [verified, blocks_acf_clients_style-index.css; desktop-rm-s75.png].

What the awards skills do differently: skip the loader and its floor under reduced motion and on repeat visits `[recipe:preloader-counter-hold]` `[recipe:reduced-motion-switch]`; a focus ring that contrasts with every ground; a rail that scrolls a focused card into view `[recipe:horizontal-rail]`; statement text that meets contrast at rest, before any fill; consent and captcha chrome kept out of the reading column.

## 7. Principles
1. **Let the subject walk toward the visitor.** One figure moving straight at the camera turns the first viewport into a presence, not a layout, and needs no headline to be remembered.
2. **Hand the loader to the hero through one frame.** When the hero opens from a rounded inset to full bleed as the curtain lifts, load and arrival read as one move.
3. **Size scrubbed media from the media.** Deriving a scrubbed clip's scroll distance from its duration gives every second of footage the same travel.
4. **Counter-translate instead of pinning.** A section as tall as its overflow, with the track moved by `+y` and `−x` of the same amount, holds a sideways rail while the document stays a document.
5. **Swap the mechanism on touch, keep the content.** The same rail and footer become native overflow and a looping clip on coarse pointers, so the phone gets the chapter without the scrub.

## 8. Take / Don't take
- **Take:**
  - The aperture handoff: an inset clip with a small radius opening to zero over ≈ 1.4 s `expo.inOut` while the media scales from ≈ .6 to 1, started by the curtain's exit, and skipped when the page is not at the top or motion is reduced `[pattern:preloaders-and-transitions#preloader-archetypes]`.
  - A curtain whose lower edge bows then flattens (a two-step path morph, ≈ .4 s in, .45 s out) so the lift has weight without a shader.
  - Scroll distance for a `currentTime` scrub as `base + clamp(min, k × duration, max)` vh, sticky stage inside, `duration − .05` as the last frame; gated to fine pointers `[pattern:components-catalog#pinned-chapter-with-scrubbed-media]`.
  - Counter-translated rails: section height = viewport + overflow, one scrubbed tween on `y: +T, x: −T`, rebuilt on `onRefreshInit`, native `overflow-x` with snap below the breakpoint `[recipe:horizontal-rail]`.
  - A per-word opacity fill scrubbed across a sticky stage, but from a resting state that already passes contrast.
- **Don't take:**
  - The palette as literal values:
    - `#ebebeb` [verified, css_index.css]
    - `#ff005c` [verified, css_index.css]
    - `#111` [verified, css_index.css]
    - `#1c1c1c` [verified, css_index.css]
  - Goats, a herd, or any animal-as-name-pun footage; the newspaper-reader figure; the greeting or the "can't be ignored" claim.
  - Poppins as the whole contract; it is on the reflex list.
  - The section order hero → greeting → sideways work rail → logo grid → video footer, which is the studio default.
  - White statement type on a light ground, a white focus ring, a 12 % heading and a scroll-locked intro: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, theme bundle, theme and block CSS |
| Award and credits | high for the Honorable Mention, date and credits (entry page); axis scores not captured |
| Concept, structure, visual language | high — five desktop, five phone and five reduced-motion states |
| Motion parameters | high — read from the theme bundle |
| Weaknesses | high for reduced motion, keyboard, load gate and contrast; 404 and inner routes not observed |

**Live pass 2026-09-23: reachable, capture exit 2 (an aborted footer-video request and reCAPTCHA beacons only), `scrollMode: native`, distinct frames on every profile, no wheel retry needed.** Sources in `.awards/research/goats/`: 15 captures + `manifest.json`; `index.html`; `js_index.js` (theme bundle with GSAP, ScrollTrigger and Lenis); `css_index.css`; six `blocks_acf_*_style-index.css` files (their `script.js` files are empty). Award entry `awwwards.com/sites/goats`, linked from the site's own ribbon, captured desktop-only into `entry/` (exit 2, a cookie wall over the frames). Not observed: inner routes, the menu open, the 404, hover states, the EN and DE routes.
