# Nodeck — https://www.nodeck.online/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | campaign — a satirical showcase for a *fictional* startup consultancy, declared non-commercial in its own Legal and Credits dialogs [verified, index.html JSON-LD and `legal-modal`] |
| Visitor mode | experience — the one "order" button is a joke that dodges the cursor; nothing is sold [verified, index.html `cta-sike-modal`; main-BqI5seD_.js `_resolveFlee`] |
| Awards | none found: one search turned up no award entry for this site. A One Page Love listing appeared as a search result title and was not read [unknown] |
| Corpus rating | D 7.3 / U 6.9 / C 8.0 / Co 7.6 → weighted 7.35, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Bogdan Kolomiyets, concept, design, copy and development [verified, index.html `meta[name=author]`, JSON-LD `creator`, credits dialog]; stock paper, pin, photo, stamp and game-sprite assets and Pixabay / Freesound SFX credited by name [verified, index.html `credits-modal`] |
| Stack (evidence level) | **Vite** vanilla build (hashed `/assets/*-[hash].js`, `__vitePreload` wrappers around dynamic imports) [verified, index.html; main-BqI5seD_.js] · **GSAP 3.14.2** + ScrollTrigger, SplitText, Flip, Observer, Draggable, InertiaPlugin in one chunk [verified, gsap-DUAj52go.js `version:"3.14.2"`] · **Three.js r185**, lazy, one transition only [verified, three-PDSP0dbZ.js `__THREE__="185"`] · **html2canvas**, lazy, version unread [verified, main-BqI5seD_.js `import("./html2canvas-DXEQVQnt.js")`] · **Swiper**, lazy, version unread [verified, swiper-B37jsxd9.js] · **Howler**, version unread [verified, howler-EcGChfno.js; sound-CsfXcoUP.js `Howler.mute`] · no smooth-scroll library [verified, no `lenis` in any fetched file] · Vercel [verified, `getent hosts` → vercel-dns] · fonts self-hosted woff2 / woff [verified, index.html preloads; main-DxuZMaGs.css] |
| Palette | hot pink paper ground (cover and alternate slides; also the pre-JS `html,body` background) |
| | `#ff87ab` [verified, index.html inline `<style>`; main-DxuZMaGs.css] |
| | cream paper ground (alternate slides, cards, `theme-color`) |
| | `#f3e6d6` [verified, index.html `meta[name=theme-color]`; main-DxuZMaGs.css] |
| | ink, hard offset shadows, outlines |
| | `#000` [verified, main-DxuZMaGs.css `--shadow:4px 4px 0 0`] |
| | the one accent, highlighter lime (menu button, marker strokes, text highlight) |
| | `#def915` [verified, main-DxuZMaGs.css] |
| | terminal green, crash slide and its focus state only |
| | `#22e34d` [verified, main-DxuZMaGs.css `:focus-visible` on the terminal] |
| | Strategy: **two paper grounds alternated slide by slide, black ink with 4 px hard shadows, one highlighter accent**; photographed stationery props carry the material [verified, CSS; wheel/desktop-s25 to s100.png] |
| Type | **fat cartoon display + geometric grotesque + bitmap DOS face for one slide** — BN Dime Display (headings, all caps), DM Sans Regular / ExtraBold (labels, body, buttons), Web437 IBM VGA 9×16 (crash slide) [verified, index.html font preloads; main-DxuZMaGs.css `font-family`] |
| WebGL dosage | moments — `canvases: 0` at rest; one lazy Three.js scene mounted only for the closing paper transition [verified, manifest.json; main-BqI5seD_.js `paperTransition`] |
| Scroll model | section switcher — `html, body { overflow: hidden }`; wheel delta accumulates into a commit ring, plus prev / next buttons, arrow keys and a thumbnail menu [verified, index.html inline style; main-BqI5seD_.js `_onWheel`] |
| Narrative model | print artefact — the site *is* a numbered ten-slide deck with presenter chrome, and turns on the format it imitates [verified, desktop-s00.png `SLIDE 1/10`; index.html `.statusbar`] |

## 1. Concept and narrative
**One idea:** a presentation that hates presentations. The critique of the pitch-deck habit is delivered as a pitch deck, with slide counter, prev / next controls, a *Presenter notes* drawer and a thumbnail sorter [verified, desktop-s00.png; index.html]. Then the deck breaks its own format. A slide crashes into a boot screen. The order button runs from the mouse. At the close the deck is crumpled and binned [verified, index.html `slide--sitebroken`, `slide--cta`; main-BqI5seD_.js `trash-bg`].

Beats: a sticker-style wordmark between a sticky note and a highlighter on pink [verified, desktop-s00.png]. Slides give a problem and a belief list with footnotes, then three hard-shadowed cream cards on a patterned pink ground [verified, wheel/mobile-s50.png, wheel/desktop-s75.png]. A refusal list, audiences, a manifesto line and a fake BIOS crash follow. Then redacted case studies, a final "order a presentation" dare, and a close that promises this is *the last one you'll ever need* [verified, index.html text]. The copy is deadpan and short, in a sales register turned on itself.

## 2. Structure and components
- **No preloader**: the cover is complete on the first captured frame; pre-JS CSS hides split headings, the status bar and inactive slides, so nothing flashes [verified, desktop-s00.png; index.html inline `<style>`].
- **Slides**: eleven `<section class="slide">` in one `<main>`, only `.is-active` displayed; the counter reads ten, so the crash slide appears to sit outside the count [verified, index.html; desktop-s00.png; count inferred].
- **Bottom control bar**: outlined PREV / NEXT keys with hard shadows, a large lime round menu button, *Presenter notes* at left, sound toggle and `SLIDE n/10` at right; PREV greys out on slide 1 [verified, desktop-s00.png]. On the phone the bar stacks into two rows with larger keys [verified, wheel/mobile-s00.png].
- **Scroll-nav ring**: a centred card labelled *NEXT SLIDE* / *PREV SLIDE* with an SVG ring that fills as the wheel accumulates, `role="progressbar"` with `aria-valuenow` [verified, mobile-s75.png; main-BqI5seD_.js].
- **Transition card**: between slides a curved colour band sweeps the viewport and a *SLIDE n* label plus the next slide's title rise and leave [verified, wheel/desktop-s50.png, wheel/desktop-s100.png; main-BqI5seD_.js `slide-transition-title`].
- **Slides menu**: a dialog-style overlay of slide thumbnails, a Swiper row on desktop and a grid on the phone, with its own prev / next and close [verified, index.html `nav-overlay__desktop`, `nav-overlay__grid`].
- **Presenter notes**: a drawer in the status bar, `aria-controls` / `aria-expanded` [verified, index.html `#nav-notes-btn`].
- **Card rails**: three slides use Swiper rails with labelled prev / next buttons and the a11y module enabled [verified, index.html; swiper-B37jsxd9.js `a11y:{enabled:!0}`].
- **Crash slide**: a boot-screen pastiche in the VGA face, a fake fatal error on a `…FINAL_v3.pptx`, a typed prompt, and `[R]` reboot / `[←]` back as real buttons [verified, index.html `#btnReboot`, `#btnBack`; main-BqI5seD_.js `_onKeydown`].
- **Case studies**: three redacted project panels opened by `aria-controls` buttons, with a backdrop and a close button; black bars stand in for names [verified, index.html `data-project-open`, `.projects`].
- **Runaway CTA**: a big button that flees a mouse cursor and taunts; clicking it (keyboard or touch) opens a *SIKE!* dialog; the phone copy admits it is *way funnier on desktop* [verified, index.html `cta-sike-modal`; main-BqI5seD_.js].
- **Close**: the footer slide with a bin, credits and legal `<dialog>`s, and a *One more slide…* link to `/404` [verified, index.html]. Game sprites and game SFX are credited and wired in the sound bank; the game is presumably at that route, which was not visited [verified, sound-CsfXcoUP.js `gameMusic`; route contents unknown].

## 3. Visual language
- **Grounds**: two flat paper colours, pink and cream, swapped per slide; a tiled square pattern at low alpha on the card slides [verified, wheel/desktop-s75.png; main-BqI5seD_.js `globalAlpha=.2`, `rotate(-8deg)`].
- **Material**: photographed desk props (sticky note, highlighter, eraser) with real soft shadows, dropped onto a flat vector world of 3 px black outlines and 4 px hard offset shadows [verified, desktop-s00.png, wheel/desktop-s25.png; main-DxuZMaGs.css]. Hand-drawn lime marker strokes and a highlighter fill (`--highlight-progress`) mark emphasis [verified, wheel/mobile-s50.png; main-DxuZMaGs.css].
- **Type**: headings in BN Dime Display caps, fluid on `clamp(5rem, 3.2rem + 9vw, 14rem)` at the top of the scale; some slide titles size to container height (`cqh`) [verified, main-DxuZMaGs.css]. Labels are small DM Sans caps. The wordmark is a white sticker with a black keyline, arched [verified, desktop-s00.png].
- **Layout**: centred, one idea per slide, generous empty paper; breakpoints at 992 / 768 / 576 px plus a `max-height: 700px` short-viewport branch [verified, main-DxuZMaGs.css `@media`].
- **Browser surfaces**: `theme-color` cream; focus ring 3 px black at 6 px offset [verified, index.html; main-DxuZMaGs.css].

## 4. Motion and effects (with parameters)
- **Slide transition** (default): a band grows to `height: 300vh`, `y: -100vh`, 1 s `power3.inOut`; the title is SplitText lines + chars with masked lines, chars `yPercent 110 → 0`, .5 s `back.out(1.7)`, stagger .02, entering .45 s in; then out on `back.in(1.7)` after .2 s [verified, main-BqI5seD_.js `transition.run`].
- **Wheel commit**: `deltaY` magnitudes accumulate toward 500; the ring tweens to the fraction (.2 s `power2.out`) and commits at 1 (.12 s); 1000 ms of idle rolls it back; reversing direction resets it; modal open or first / last slide rolls back [verified, main-BqI5seD_.js `hi=500`, `ci=1e3`, `_onWheel`].
- **Paper crumple** (into the close only): the outgoing slide is rasterised with html2canvas at DPR ≤ 2, set as a `CanvasTexture` on a 48 × 36-segment plane, and morphed toward a ball whose radius is `min(vw, vh) × .2` clamped 64–320 px, displaced by three angular sine octaves (3, 7, 13) plus hashed jitter. The ball then gathers, falls, spins and drifts into a bin, with a paper sound [verified, main-BqI5seD_.js `lt`, `Ot`, `Ks`, `_snapshot`, `_state`]. Any failure falls through to the callbacks, so the slide still changes [verified, main-BqI5seD_.js `catch`].
- **Runaway button**: flees when the cursor is within 220 px of its edge, stepping 160 → 280 px by proximity. If the step would still land within 40 px of the cursor, it jumps to the farthest of nine anchor positions. It uses `quickTo` beyond 120 px and a direct set inside it, mouse only, and taunts on a cooldown [verified, main-BqI5seD_.js `At=220`, `Mt=160`, `Os=280`, `Ms=120`].
- **Vocabulary**: `power3.out` and `power2.out` dominate; CSS uses `cubic-bezier(.16,1,.3,1)` and `(.19,1,.22,1)` [verified, main-BqI5seD_.js ease counts; main-DxuZMaGs.css].
- **Sound**: Howler bank of named SFX (typing, eraser, highlighter, whoosh, paper, pops, game), muted by default, choice remembered in `localStorage`, ducking between layers [verified, sound-CsfXcoUP.js].
- **Reduced motion**: one `matchMedia` gate; a helper zeroes `duration`, `delay` and stagger on tween vars; Swiper speed becomes `max(180, 40 %)` of the original; slide changes run instant; the crumple is skipped; wheel navigation is disconnected and its ring hidden [verified, sound-CsfXcoUP.js; main-BqI5seD_.js `if(b())`].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| Build | Vite vanilla, ES modules, `__vitePreload` dynamic imports [verified, main-BqI5seD_.js] |
| Motion | GSAP 3.14.2 with six plugins registered in one chunk [verified, gsap-DUAj52go.js] |
| 3D | Three.js r185, imported with html2canvas in one `Promise.all` only when the crumple first runs, preloaded ahead [verified, main-BqI5seD_.js `It()`, `preload()`] |
| Rails | Swiper behind a `createSwiper` factory that forces a11y on and routes speed through the motion tier [verified, swiper-B37jsxd9.js] |
| Sound | Howler [verified, howler-EcGChfno.js] |

Fetched text weights, raw (not gzipped): main 101.8 KB, GSAP 118 KB, Howler 35 KB, sound 25 KB, CSS 77.5 + 16.9 KB; lazy Three 734 KB, html2canvas 201 KB, Swiper 84 KB [verified, fetched files]. The cover images ship as responsive WebP `srcset` from 96w upward [verified, index.html `imagesrcset`]. Capture CLS was 0.33 on desktop and 1.02 on the phone, 0 under reduced motion [verified, wheel/manifest.json]. No console errors and no failed requests [verified, manifest.json].

## 6. Weaknesses
- Reduced motion: **pass with a gap**. The cover reads at rest [verified, desktop-rm-s00.png], transitions become instant, the crumple is skipped. But the wheel stops working altogether: all five reduced-motion frames are byte-identical after 12 000 px of wheel [verified, wheel/desktop-rm-*.png md5], and no hint says to use the buttons.
- Keyboard: **pass**. Arrow keys, Enter and Escape are handled, every control is a labelled `<button>`, dialogs are native `<dialog>`, focus is a 3 px outline [verified, main-BqI5seD_.js; index.html; main-DxuZMaGs.css]. There is no skip link [verified, index.html].
- DOM behind the canvas: **pass**. All copy is in the served HTML; the only canvas is transient [verified, index.html; manifest.json `canvases: 0`].
- Load gate: **pass**. No preloader; the first frame is the finished cover [verified, desktop-s00.png]. Layout shift is high on both profiles [verified, manifest.json CLS].
- Phone: **designed**. The control bar is re-laid for thumbs, and the dodge is replaced by an honest line [verified, wheel/mobile-s00.png; index.html].
- Wayfinding and conversion: **pass / fail by design**. `SLIDE n/10` and the thumbnail menu always say where you are [verified, desktop-s00.png]. The only conversion is a joke, and the author's contact sits inside the Legal dialog [verified, index.html `legal-modal`].
- Scroll-jacking: the document never scrolls. Every slide costs a deliberate 500 px wheel gesture, a tax on long reads [verified, main-BqI5seD_.js].

What the awards skills do differently: under reduced motion the wheel still advances, only instantly (`[recipe:reduced-motion-switch]`: drop the travel, keep the state change); a skip link and a visible *use ← →* hint beside the ring; heading sizes reserved before the split runs so CLS stays near 0 `[recipe:split-text-masked-reveal]`; and a real contact path beside the joke, not inside a legal notice.

## 7. Principles
1. **Build the critique in the grammar it critiques.** When a site argues against a format, borrowing that format's chrome (counter, controls, notes) makes the argument before any copy is read.
2. **Break the frame once, then restore it.** One slide in a foreign register, with a clear way back, resets attention without losing the visitor.
3. **Show the threshold of a hijacked gesture.** If scroll is converted into discrete steps, a filling ring with rollback turns an invisible cost into a visible, reversible commitment.
4. **End with an action on the artefact itself.** Destroying, closing or filing the thing the visitor has been looking at makes the close an event rather than a footer.
5. **Photograph a few real objects into a flat world.** Soft-shadowed props against hard vector outlines give a place with texture, no 3D needed.
6. **Let the joke survive reduced motion.** The punchline is in the state change, not the travel, so the reduced tier can keep every gag.

## 8. Take / Don't take
- **Take:**
  - A wheel accumulator: sum `|deltaY|` to a threshold (≈ 500), paint progress on an SVG ring with `role="progressbar"`, commit at full, roll back after ≈ 1 s idle or on direction change; block while a dialog is open `[pattern:cursor-and-pointer#hold-gates]`.
  - A DOM-to-GL exit for one moment only: rasterise the leaving section at DPR ≤ 2, texture a segmented plane, deform it in JS, lazy-load the renderer and rasteriser together on first use, and fall through to the plain transition on any error `[pattern:preloaders-and-transitions#transition-archetypes]`.
  - A transition interstitial: a band sweeping over 1 s `power3.inOut` with the next chapter's number and masked title rising on an overshoot ease, instant under reduced motion `[recipe:split-text-masked-reveal]`.
  - Pre-JS CSS that hides only what will animate in and displays only the active section, so there is no flash and no preloader `[pattern:preloaders-and-transitions#the-load-contract]`.
  - Sound muted by default with a remembered choice `[recipe:sound-toggle-opt-in]`.
- **Don't take:**
  - The palette as literal values:
    - `#ff87ab` [verified, main-DxuZMaGs.css]
    - `#f3e6d6` [verified, main-DxuZMaGs.css]
    - `#def915` [verified, main-DxuZMaGs.css]
    - `#22e34d` [verified, main-DxuZMaGs.css]
    - `#000` [verified, main-DxuZMaGs.css]
  - The slide-deck conceit, the presenter-notes drawer, a BIOS crash slide, a runaway order button or a crumple-into-the-bin close: each is this site's signature.
  - Sticker wordmarks, hard 4 px offset shadows and highlighter strokes as a kit; the neo-brutal cartoon register is already a trend.
  - BN Dime Display with DM Sans, and any of the deck-mocking copy lines.
  - Wheel navigation switched off under reduced motion, and CLS left above 0.3: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, main / GSAP / sound / Three / Swiper chunks, both stylesheets |
| Awards | low — one search, no entry found; rating is this corpus's own [inferred] |
| Concept, structure, visual language | high — cover on every profile, slides 2–5 on desktop and 1–4 on the phone; slides 6–10, the crash slide and the close read from markup, not rendered |
| Motion parameters | high — read from the main bundle |
| Weaknesses | high for reduced motion, keyboard, DOM and load; the `/404` route and the crumple itself not observed rendered |

**Live pass 2026-09-23: reachable, `scrollMode: wheel`.** The first capture ran with exit 0, but desktop s25–s100 and phone s00–s50 timed out and the reduced-motion frames never moved. A retry with `--wheel 12000 --wait 6000 --timeout 90000` into `wheel/` produced every frame and reached slide 5 of 10 on desktop. Sources in `.awards/research/nodeck/`: first-run captures + `manifest.json`; `wheel/` 15 captures + `manifest.json`; `index.html`; `main-BqI5seD_.js`, `gsap-DUAj52go.js`, `howler-EcGChfno.js`, `sound-CsfXcoUP.js`, `swiper-B37jsxd9.js`, `swiper-hP8iLu9g.js`, `three-PDSP0dbZ.js`, `html2canvas-DXEQVQnt.js`, `main-DxuZMaGs.css`, `sound-CNYM2cx0.css`. One web search for an award entry.
