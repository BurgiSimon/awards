# Spasoje Perovic — https://www.spasoje.dev/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | portfolio (independent creative developer, one page) [verified, index.html `<title>` and description] |
| Visitor mode | persuade, experience-led: the email pill sits in the header at every width and again in the close [verified, desktop-s00.png, mobile-s00.png, desktop-s100.png] |
| Awards | Awwwards **Honorable Mention, 3 Mar 2025**; no axis scores visible on the entry [verified, entry/desktop-s00.png]. The site's own project data lists per-project Awwwards marks such as "10 / 10" [verified, index.html `__NEXT_DATA__`; underlying awards not checked] |
| Corpus rating | D 7.6 / U 6.4 / C 7.4 / Co 7.2 → weighted 7.16, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Spasoje Perovic (PRO) and Josif Perovic are the names on the entry [verified, entry/desktop-s25.png]; who did what [unknown] |
| Stack (evidence level) | **Next.js**, pages router (`/_next/`, `pages/_app`, `__N_SSG`, `next/image`) [verified, index.html] · **GSAP 3.12.5** with ScrollTrigger, SplitText, ScrollSmoother; Observer and Flip code present in the chunks [verified, `"3.12.5"` ×5, 285-….js, 94726e6d-….js] · `useGSAP` (`contextSafe`, `revertOnUpdate`) [verified, index-….js] · one canvas, `getContext("2d")`, no WebGL library strings [verified, index-….js; manifest.json `canvases: 1`] · CMS: the data uses Strapi-shaped `attributes` objects [inferred] · hosting Vercel [verified, DNS `cname.vercel-dns.com`] · fonts via `next/font` local: `terminal` (.ttf) + `akkuratMMono` (.otf) [verified, c05af27f….css `@font-face`] |
| Palette | achromatic grey ground + graphite ink + one signal orange (see §3) [verified, CSS] |
| Type | dot-matrix display + grotesque mono, both uppercase, no proportional face anywhere; `--font-Terminal` and `--font-Akkurat` [verified, CSS custom properties]; retail faces [unknown] beyond the family names |
| WebGL dosage | none — one canvas-2D analogue clock [verified, index-….js] |
| Scroll model | native + smooth library: GSAP ScrollSmoother `smooth: 1.2`, created only when `ScrollTrigger.isTouch !== 1`, paused until the loader ends; manifest `scrollMode: native` [verified, 896-….js, manifest.json] |
| Narrative model | gallery — letter-toy hero → two featured case cards → a WRK statement → a grid/list project index → B&W portrait about → local-time clock close [verified, captures] |

## 1. Concept and narrative
The developer's site as a piece of hardware: a display panel of dot-matrix characters, white push-knobs with LED dots, a toggle switch, a wall clock, and clicks for every control. The idea is that the visitor operates the page rather than reads it; the hero invites it with a blinking hint to tap a letter [verified, desktop-s00.png `hero__hint`].

Beats [verified, desktop-s00…s100 second pass]: a self-labelled "fake loading" counter spelled in dot-matrix digits, which resolves into the word DEV → a hero grid of oversized dot-matrix glyphs spelling the role and location, with the h1 paragraph and "available for freelance" set small between them → two full-width case cards in greyscale with a VISIT pill → WRK spelled in dots beside a two-paragraph process statement → a "relevant projects" index with a grid/list toggle; list rows carry year, client, tech and a difficulty score out of 10 → a large greyscale portrait → a centred analogue clock labelled as the maker's local time, flanked by dot-matrix readouts, with the email pill and footer links below. Copy register is casual and first-person ("probably not sleeping", "life's struggles") [verified, desktop-s100.png, mobile-s75.png].

## 2. Structure and components
- **Preloader**: counter 000 → 100 over 4 s after a .5 s delay, a crosshair arrow and the "fake loading" label; then the digits collapse to D00 → DE0 → DEV over .5 s and `overflow` is released on `<html>` and `<body>` [verified, 896-….js]. No storage flag, so it runs on every full load [verified, 0 × `sessionStorage`/`localStorage` in the fetched JS].
- **Header**: SP•DEV mark, GitHub / Awwwards / Instagram, an email pill with an orange LED dot; it jumps 200 px up on scroll down and back on scroll up, `duration: 0` [verified, 896-….js `homeNavigation`]. The phone keeps mark + email pill only [verified, mobile-s00.png].
- **Letter hero**: each dot-matrix glyph is a `<button type="button">`; a tap re-rolls it to a random glyph from a character table with a click sound; a skeuomorphic knob (`resetBtn`, "click") restores the word with a down/up sound pair [verified, index-….js, desktop-s00.png].
- **Case cards**: greyscale images under horizontal scanlines with the client logo on top, year / client / VISIT beneath [verified, desktop-s25.png]; no scanline CSS in the fetched sheets, so the lines are in the images [inferred].
- **Project index**: an orange toggle switch between grid and list; the list is a ruled table of big dot-matrix initial, `YR:`, `CL:`, `TC:`, `DF:` rows, an arrow knob, a logo thumbnail and a dot-matrix row number [verified, desktop-s50.png, mobile-s25/s50.png]. 12 projects in the data [verified, index.html].
- **Close**: canvas-2D clock with hour, minute and an orange second hand, DPR-scaled, redrawn every rAF [verified, index-….js `getContext("2d")`, `devicePixelRatio`]; footer © line and three links (GH / AW / IG on the phone) [verified, mobile-s100.png].
- 404, cursor and easter eggs beyond the letter toy [unknown].

## 3. Visual language
- **Ground**: an achromatic light grey, set on `html`
  `#f5f5f5` [verified, 615927….css `html{background-color}`]
- **Ink**: near-black for text
  `#1a1a1a` [verified, CSS, 17 uses]
  and a softer graphite for the dot glyphs and rules
  `#404040` [verified, CSS, 7 uses]
- **Accent**: one signal orange for the loader label, LED dots, VISIT labels, the second hand, the toggle and `::selection`
  `#ff611b` [verified, CSS `::selection{background}`]
- Greys for the `YR:`/`CL:` keys and hint text
  `#b3b3b3` [verified, CSS]
- **Materials**: white knobs and pills with stacked soft drop-shadows, reading as moulded plastic; all photography greyscale; colour enters only through the orange [verified, captures; index-….js `drop-shadow` filters].
- **Type**: dot-matrix glyphs at 16.6–19.85vw per character slot, hand-tuned per letter class [verified, CSS `font-size` values]; every other string is the mono in caps, about 12 px on desktop, larger on the phone [verified, captures]. The macro/micro contrast is the whole type system.
- **Layout**: glyphs sit on a loose grid with empty cells; text blocks drop into gaps between letters [verified, desktop-s00.png]. The phone restacks the hero rather than shrinking it [verified, mobile-s00.png].
- **Surfaces**: `color-scheme: light only`, `scrollbar-width: none`, orange selection [verified, index.html, CSS]; no `theme-color` [verified, index.html].

## 4. Motion and effects (with parameters)
- **Stepped, not eased**: almost every entrance is a GSAP timeline of `duration: 0`, `ease: "none"` opacity flips. Hero glyphs appear one at a time in a Fisher–Yates-shuffled order at .09 s steps; SplitText lines of the description follow at .15 s after .6 s; section statements and project rows flip in at .1–.15 s on ScrollTrigger `start: "top 70%"` [verified, index-….js]. The result reads as a display panel switching segments, not as animation.
- **Loader counter**: tweened with an ease string `rough({ strength: 1, points: 20, taper: out, randomize: true })` for a stuttering count [verified, 896-….js]; no EasePack registration found in the fetched chunks, so whether the rough ease resolves [unknown].
- **Hint blink**: repeat −1, delay 3.2 s, on 1.2 s / off .2 s; stops once a letter has been clicked [verified, index-….js].
- **Idle re-roll**: an 8 s timer is armed after the hero entry (`N(8e3)`), apparently changing a random letter unprompted [inferred, from `randomCharToCHange`].
- **Knob press**: `.15 s power3.out`, `y: 1`, shadow flattened, LED dot on, then reversed after .1 s [verified, index-….js]. The toggle uses `power2.out` and a 31.5 px dot travel [verified, same].
- **Smooth scroll**: ScrollSmoother `smooth: 1.2`, desktop only [verified, 896-….js].
- **Sound**: 8 WAV files — letter, single and multiple letter changes, hover, toggle, down, up — at volume .3–.5, fired on hover and click with no opt-in control [verified, index-….js, 896-….js `new Audio`].
- **Reduced motion**: `(prefers-reduced-motion: reduce)` is registered as a `matchMedia` condition on the loader but never read; the 4 s counter plays and the clock and readouts keep moving [verified, 896-….js; desktop-rm-s00 first pass, desktop-rm-s100.png].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework | Next.js pages router, SSG (`__N_SSG`), `next/image` srcsets to 3840w | [verified, index.html] |
| Motion | GSAP 3.12.5 + ScrollTrigger + SplitText + ScrollSmoother, `useGSAP` | [verified, JS chunks] |
| Graphics | one canvas 2D (clock); glyphs are font text in buttons | [verified, index-….js, CSS] |
| Sound | `HTMLAudioElement`, 8 WAVs | [verified, JS] |
| Hosting | Vercel | [verified, DNS] |

Weights [verified, fetched files, uncompressed]: page chunk 54 KB, GSAP core 52 KB, plugin chunk 100 KB, CSS 101 KB over three files. The HTML carries **83** `fetchpriority="high"` hints, image preloads for every case card at up to 3840w [verified, index.html]. Manifest: 1,018 DOM nodes after load, no console or page errors, desktop CLS 0 but **mobile CLS 1.49** [verified, manifest.json]; the one failed request is an aborted WAV on mobile. `lcpColdSynthetic` is a headless artefact and not quoted.

## 6. Weaknesses
- Reduced motion: **fail** — the condition is declared and ignored; the loader gate and the moving readouts stay [verified, 896-….js, desktop-rm-*].
- Keyboard: **partial** — the letters, knob, toggle and links are native buttons and anchors, but the button reset sets `outline: none` and there is no `:focus` rule in any sheet, so focus is invisible [verified, CSS]; 0 `aria-*` attributes [verified, index.html].
- DOM: **pass** — one `<h1>` (the description), `<main>`, `<nav>`, `<header>`, `<footer>`, 53 images all with `alt` [verified, index.html]; the dot-matrix words are single glyph buttons, so the role and location are spelled letter by letter to a screen reader [inferred].
- Load gate: **fail** — ≈ 5.8 s of scroll lock on desktop, every visit, and the label admits it is fake [verified, 896-….js timings].
- The phone: **pass with a cost** — designed restack, toggle and list survive, but CLS 1.49 [verified, mobile-*, manifest.json].
- Wayfinding and conversion: **pass** — the email pill is always one tap away; no section index, but the page is short [verified, captures].
- Sound: **fail** — hover and click audio with no mute or consent [verified, JS].
- **What the awards skills do differently**: a load contract tied to a real signal and skipped on repeat [recipe:preloader-counter-hold]; the three-tier switch [recipe:reduced-motion-switch] that freezes the idle re-roll and the readouts; a visible focus ring on every glyph button; an `aria-label` on each glyph word so it reads as a word; sound behind an explicit toggle [recipe:sound-toggle-opt-in].

## 7. Principles
1. **Build the world from one borrowed object.** When every control is a part of the same imagined device, the chrome stops being chrome and becomes the identity.
2. **Discrete beats a tween in a discrete world.** If the visual language is segments and pixels, zero-duration state flips at a steady step are more on-register than any ease.
3. **Let the hero be operated.** A headline the visitor can change, with a way back, turns the first viewport into a conversation that proves the maker's craft.
4. **One accent, many jobs.** A single signal colour for status, action, selection and time keeps a monochrome world alive without splitting it.
5. **Close on something alive.** A live, personal readout at the end gives the contact action a reason and a human scale.

## 8. Take / Don't take
- **Take:**
  - Shuffled-order, zero-duration reveals at ≈ .09 s per element for any segmented or pixel type; eased reveals for everything else.
  - Display glyphs as native `<button>`s with a restore control, a hint that retires once used, and a word-level label.
  - A single accent reserved for live and interactive states.
  - Desktop-only smoothing, created paused until the page is released [recipe:boot-lenis-gsap].
  - A DPR-aware canvas-2D readout for a live value instead of a DOM clock.
- **Don't take:**
  - The grey, ink and orange set and its hexes:
    `#f5f5f5` [verified, CSS]
    `#1a1a1a` [verified, CSS]
    `#404040` [verified, CSS]
    `#ff611b` [verified, CSS]
    `#b3b3b3` [verified, CSS]
  - The dot-matrix + mono pairing, the tap-to-swap letter hero with its reset knob, the "fake loading" joke, the local-time wall clock close.
  - The `YR:/CL:/TC:/DF:` row grammar with a difficulty score, the WRK spelling, the scanlined greyscale case cards.
  - The section order loader → letter hero → cases → statement → index → portrait → clock.
  - Unconsented sound, the ignored reduced-motion condition and `outline: none` — things to beat, not adopt.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header table, stack, palette, motion parameters | high — index.html, three CSS files and six JS chunks read directly |
| Composition, mobile, reduced motion | high — 15 captures on a second pass with `--wait 8000`; first pass kept for the loader and the reduced-motion gate |
| Awards | high for the Honorable Mention and credits (entry page, consent wall left up); axis scores not published |
| Rough-ease resolution, idle re-roll behaviour, retail faces, CMS, 404 | inferred or unknown |

**Live pass 2026-09-23: reachable, capture exit 0 twice, scroll mode native.** The first pass (no wait) caught the loader in desktop s00/s25 and desktop-rm-s00; the second, with `--wait 8000 --timeout 90000`, reached every state. Sources in `.awards/research/spasoje/`: `index.html`, `615927240946285a.css`, `8b2caa078a04bcac.css`, `c05af27fdb16f9a9.css`, `285-….js`, `486-….js`, `896-….js`, `94726e6d-….js`, `_app-….js`, `index-….js`, `manifest.json`, `desktop-s00…s100`, `mobile-s00…s100`, `desktop-rm-s00…s100`; Awwwards entry `awwwards.com/sites/spasoje-perovic` in `entry/` (found by one search).
