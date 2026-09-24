# Rennsport — https://www.911rennsport.co.uk/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | brand — a Cotswolds workshop building bespoke Porsche 911 restomods to commission [verified, index.html `<title>` and meta description] |
| Visitor mode | persuade — the enquiry lives behind the burger, the explore index and the footer's phone and email; a PDF brochure download in the close [verified, desktop-s50.png, desktop-s100.png] |
| Awards | none found — one search on 2026-09-23 returned no award entry [verified, search]; no ribbon or award link in the served page [verified, index.html] |
| Corpus rating | D 6.6 / U 5.8 / C 6.0 / Co 6.8 → weighted 6.26, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | [unknown] — no credit line in the served page [verified, index.html] |
| Stack (evidence level) | **Webflow** (`data-wf-site`, `w-` classes, IX2 interaction data in an rspack-built chunk, last published 14 May 2026) [verified, index.html; schunk.4cf233830a198d29.js] · **Lenis 1.0.23** from jsDelivr (`studio-freight/lenis@1.0.23`) [verified, index.html] · **GSAP 3.8.0** + ScrollTrigger from cdnjs [verified, index.html] · jQuery 3.5.1 (Webflow) [verified, index.html] · Refokus CMS-tabs and automatic-tabs helpers (the CMS-tabs script is blocked, ORB) [verified, index.html; manifest.json] · GA4, Mailchimp [verified, index.html] · fonts: PP Formula, PP Formula Condensed, TWK Lausanne in 20 weight files [verified, rennsport.shared.css `@font-face`] |
| Palette | ground for hero, testimonials and footer: photographic black and `--black` |
| | `black` [verified, rennsport.shared.css `:root`] |
| | ground for the body sections |
| | `white` [verified, rennsport.shared.css `:root`] |
| | body copy grey `--body` |
| | `#3f424d` [verified, rennsport.shared.css `:root`] |
| | rule and panel grey `--satin-white` |
| | `#e1e1e1` [verified, rennsport.shared.css `:root`] |
| | paint-named tokens used only by `.preloader-bespoke` variants, not seen on the home route: `--amaranth-red` |
| | `#bc220e` [verified, rennsport.shared.css] |
| | `--oslo-blue` |
| | `#2a77b6` [verified, rennsport.shared.css] |
| | `--gold-metallic` |
| | `#d19000` [verified, rennsport.shared.css] |
| | `--amazon-green` |
| | `#0a373c` [verified, rennsport.shared.css] |
| | `--forest-green` (declared, no use found) |
| | `#083b1f` [verified, rennsport.shared.css] |
| | tab progress bar |
| | `#ff4c24` [verified, rennsport.shared.css `.tab-progress`] |
| | Strategy: **black photographic grounds cut against white body sections, no chrome accent; chroma only from the cars**, with a reserve of paint-named tokens for build pages [verified, captures + CSS] |
| Type | **Expressive wide display + light neutral grotesque**: PP Formula for headings, links and quotes (a condensed cut also loaded), TWK Lausanne at 300 for running text [verified, rennsport.shared.css]; the wide width is read from the frames [inferred, desktop-s00.png]. The wordmark is an inline SVG logotype (viewBox 180 × 10), not type [verified, index.html] |
| WebGL dosage | none — `canvases: 0`; `webgl: true` is context availability only [verified, manifest.json] |
| Scroll model | native + Lenis 1.0.23 (`lerp .1`, `wheelMultiplier .7`, `smoothTouch false`) on its own rAF loop; GSAP ScrollTrigger scrubs and Webflow IX2 scroll actions read the same native scroll [verified, index.html; manifest.json `scrollMode: native`] |
| Narrative model | specification — studio-lit car hero, a welcome statement, craft pillars (engine, sourcing, bodyshell), an explore index, owner testimonials tied to build numbers, a model-range tab set, a newsletter close [verified, desktop-s00 to s100.png; index.html] |

## 1. Concept and narrative
**One idea:** the car as the only image, the name as the only graphic. The first viewport is a black 911 photographed in a dark studio with a headlight beam cutting left and a red haze behind, a two-line claim at left and the RENNSPORT logotype stretched across the full width at the bottom [verified, desktop-s00.png]. On scroll the logotype shrinks into the nav, so the brand mark literally leaves the stage and parks top left [verified, index.html inline script; desktop-s25.png].

Beats: hero slider with six segment bars [verified, desktop-s00.png]; a white statement with a detail photograph (a crest on a satin bonnet) and one outlined button [verified, desktop-s25.png]; two headline lines that slide past each other, *Made in Germany* and *Perfected in England* [verified, index.html; desktop-s25.png]; three captioned pillars with photographs [verified, desktop-s50.png; mobile-s50.png]; an EXPLORE index of five pale-grey display links on hairlines [verified, desktop-s50.png]; a black testimonial chapter where each quote is signed with a project number, colour, model and donor chassis [verified, desktop-s75.png]; a model-range tab set; a black footer with a large-field newsletter form and the logotype again at full width [verified, desktop-s100.png]. Register: short confident claims, one dry joke about stingray-skin panels [verified, index.html].

## 2. Structure and components
- **Nav**: logotype top left, a two-line burger top right; the whole bar re-themes per section from `data-section-dark` / `data-section-black` attributes [verified, index.html].
- **Menu overlay**: fixed full-screen wrapper opened by a Webflow interaction; the burger is `<a href="#">` with `data-lenis-toggle`, so it also stops and restarts Lenis [verified, index.html; rennsport.shared.css `.menu-wrapper`]. Not captured open.
- **Hero**: a 100 vh section (90 vh on smaller breakpoints) whose slides are a Webflow tab set; a scaleX progress bar per tab, advanced by an interval script [verified, rennsport.shared.css `.section.is--hero`, `.tab-progress`; index.html]. The phone shows a different photograph (a blue coupe) [verified, mobile-s00.png]; whether that is art direction or a later slide is [unknown].
- **Opposed headline pair**: two `<h1>`s in an overflow-hidden column, moved in opposite directions by section scroll progress [verified, index.html; schunk.4cf233830a198d29.js `a-5`].
- **Pillars**: a three-column grid of photograph, heading and paragraph; one column on the phone [verified, desktop-s50.png; mobile-s50.png].
- **Explore index**: five route links as display-size `<h1>`s in pale grey between hairlines; the same list exists twice in the markup [verified, index.html; desktop-s50.png]. Hover state [unknown].
- **Testimonials**: a quote in the display face at left, three thumbnails as a vertical tab menu at right, the build's card (thumbnail, project number, spec line) underneath [verified, desktop-s75.png].
- **Model range**: tabs for four model lines with a *View model specs* link [verified, index.html]; not in a captured frame.
- **Footer**: newsletter with Name and Email fields at display size and a consent checkbox, a brochure download, socials, phone, email, postal address plus a what3words line, opening hours, legal, then the full-width logotype [verified, desktop-s100.png].
- No preloader on the home route, no cursor, no sound, no page transition [verified, index.html; captures].

## 3. Visual language
- **Grounds**: black for the hero, testimonials and footer; white for everything between; straight cuts, no gradient bridge [verified, desktop-s25/s75/s100.png].
- **Type scale**: headings are fixed rem steps, not fluid — `h1` 4rem → 2.5rem, `h2` 3rem → 1.75rem; the opposed pair runs 5rem base up to 9rem with `-4px` tracking at the widest breakpoint and 1.75rem on the smallest [verified, rennsport.shared.css; breakpoint mapping inferred from Webflow's cascade order]. Body is 14 px [verified, same].
- **Imagery**: dark-studio car portraits with a hard light source, and macro details (crest, indicator lens, engine) that carry all the colour [verified, desktop-s00/s25.png; mobile-s50.png]. Testimonial thumbnails are owners' snapshots, lighter in craft [verified, desktop-s75.png].
- **Layout**: a 40 px side gutter, left-aligned throughout, a 12-column feel with the statement pushed to the right third [verified, desktop-s25.png].
- **Browser surfaces**: JPEG favicons at 32 and 256 px; no `theme-color`; no custom scrollbar or selection [verified, index.html; rennsport.shared.css].

## 4. Motion and effects (with parameters)
- **Lenis**: `new Lenis({ lerp: .1, wheelMultiplier: .7, gestureOrientation: 'vertical', normalizeWheel: false, smoothTouch: false })`, driven by its own `requestAnimationFrame` loop, not by the GSAP ticker; skipped inside the Webflow editor; `data-lenis-start / stop / toggle` handlers by jQuery delegation [verified, index.html].
- **Wordmark dock**: one GSAP timeline per `.section.is--hero`, `scrollTrigger { start: 'top top', end: 'bottom top', scrub: .4 }`, `from(.nav_logo_home, { y: '-20%', width: '100%' })` into its CSS state, a sticky 180 px link [verified, index.html; rennsport.shared.css `.nav_logo_home`]. It tweens `width`, a layout property [verified, same].
- **Opposed headline pair**: Webflow IX2 `SCROLLING_IN_VIEW` → continuous action `a-5` "Display Carousel" on `SCROLL_PROGRESS`; at 0 the left line sits at `x: -100%` and the right at `x: 100%`, at 100 they have swapped to `100%` and `-100%`, keyframe 100 eased `easeOut` [verified, schunk.4cf233830a198d29.js]. So the two lines cross the viewport once per pass, each wider than the screen at 9rem [verified, desktop-s25.png shows one clipped mid-word].
- **Background parallax**: `.para-item` tiles (2:3, `background-size: 150%`) scrub `background-position` from `50% 0%` to `50% 100%`, `ease: 'none'`, `top bottom` → `bottom top` [verified, index.html; rennsport.shared.css]; the section is in the markup but not identified in a captured frame.
- **Auto tabs**: two copies of one interval script advance every `.tabs-menu-demo` to its next tab, one at 6000 ms and one at 4000 ms; a click resets the timer [verified, index.html]. The progress bar is `scale3d(0,1,1)` from origin 0 [verified, rennsport.shared.css].
- **Nav re-theme**: a perpetual rAF loop reads `getBoundingClientRect()` of every flagged section each frame against half the nav height, priority dark > transparent > black > default [verified, index.html].
- **CSS**: most transitions are `.2s`–`.25s` defaults; one `transform .4s cubic-bezier(.625,.05,0,1)` [verified, rennsport.shared.css]. Webflow IX2 eases in use: `outQuart`, `outQuad`, `outBack`, `inExpo` and others [verified, schunk.4cf233830a198d29.js].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Build / CMS | Webflow, rspack-built runtime chunks (≈ 471 KB for the IX2 engine and data chunk, uncompressed) | [verified, index.html; HTTP content-length] |
| Motion | Webflow IX2 + GSAP 3.8.0 ScrollTrigger + Lenis 1.0.23, three clocks | [verified, index.html] |
| CSS | one 206 KB shared stylesheet | [verified, local file size] |
| Images | AVIF with `srcset` on 25 images; 12 of 29 `<img>` load eagerly | [verified, index.html] |

- 461 DOM nodes on desktop; CLS .007 desktop, .10 phone [verified, manifest.json]. `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.
- Console: four `<svg> width="auto"` attribute errors per profile from the inline logotype [verified, manifest.json; index.html].
- Library versions are old: GSAP 3.8.0 and Lenis 1.0.23 from public CDNs, against 3.15 and 1.3 in `references/stacks/` [verified, index.html].

## 6. Weaknesses
- Reduced motion: **fail**. No `prefers-reduced-motion` anywhere in the HTML or CSS [verified, absent]; frames at s50, s75 and s100 are byte-identical with and without the preference [verified, md5]. Nothing is left hidden, but Lenis, the scrubs and the auto-advancing tabs all run.
- Keyboard: **fail**. No skip link, two `aria-` attributes in the whole page (both `aria-current`), the burger is an unlabelled `<a href="#">`, and the tab carousels rotate with no pause control [verified, index.html].
- Semantics: menu and index links are `<h1>`s, each list duplicated, so the page carries more than a dozen `h1`s; all 29 images have `alt=""` [verified, index.html].
- DOM behind the canvas: **pass** — no canvas; copy and links are in the served HTML [verified, index.html].
- Load gate: **pass** — no preloader on the home route [verified, captures].
- Phone: **mostly designed** — single-column pillars, a phone burger, a portrait hero with the logotype kept full width [verified, mobile-s00/s50.png]; CLS .10 on the phone [verified, manifest.json].
- Wayfinding and conversion: **partial** — the explore index is clear, but there is no persistent enquire action; the contact route is inside the menu or the footer [verified, captures].
- Runtime: three independent rAF loops (Lenis, GSAP, the nav poller) and a `width` tween on scroll [verified, index.html].

What the awards skills do differently: one ticker for Lenis and ScrollTrigger `[recipe:boot-lenis-gsap]`; the logotype docked with `scale` on a transform, not `width`; a static tier that stops the auto tabs and the scrubs `[recipe:reduced-motion-switch]`; a labelled `<button>` burger with a focus-trapped overlay `[recipe:nav-overlay-fullscreen]`; one `h1` and real alt text on the craft photography; a persistent enquire action.

## 7. Principles
1. **Let the name leave the stage.** A full-width logotype that scrubs down into the nav turns the brand mark into the hero's exit, so the first scroll has a subject.
2. **Two claims can cross instead of stacking.** Paired lines moving in opposite directions, mapped to section progress rather than a loop, say "from here, to there" in one gesture.
3. **Put the product's provenance in the testimonial.** A quote signed with build number, colour, model and donor chassis is worth more than any adjective in the section above it.
4. **Keep chroma in the photographs.** Black and white chrome with no accent lets the subject's own paint and light do all the colour work.
5. **Name tokens after the material, not the role.** Paint-finish names make the palette read as part of the craft, and give each commission a colour to carry.

## 8. Take / Don't take
- **Take:**
  - The logotype dock: a full-bleed mark scrubbed across the hero's own height into a sticky nav slot, at a light scrub lag (≈ .4 s), done with a transform `[pattern:hero-archetypes#two-state-typographic]`.
  - Progress-mapped opposed lines: two wide display lines translating `-100% → 100%` and `100% → -100%` across one section's pass, with `ease: 'none'` on a scrub and a static rest state `[pattern:motion-vocabulary#scrub-and-refresh-rules]`.
  - Provenance metadata as a testimonial signature `[pattern:copy-and-content#metadata-as-boast]`.
  - Attribute-flagged sections for nav re-theming, read by one ScrollTrigger per section rather than a polling loop `[recipe:theme-swap-tokens]`.
- **Don't take:**
  - The palette as literal values:
    - `#3f424d` [verified, rennsport.shared.css]
    - `#e1e1e1` [verified, rennsport.shared.css]
    - `#bc220e` [verified, rennsport.shared.css]
    - `#2a77b6` [verified, rennsport.shared.css]
    - `#d19000` [verified, rennsport.shared.css]
    - `#0a373c` [verified, rennsport.shared.css]
    - `#083b1f` [verified, rennsport.shared.css]
    - `#ff4c24` [verified, rennsport.shared.css]
  - The car-in-a-dark-studio hero with a headlight beam, the logotype, the Germany / England line pair, or any copy line.
  - PP Formula + TWK Lausanne as a set.
  - The section order hero slider → statement → pillars → index → testimonials → range → newsletter, which is the specialist-maker default.
  - `<h1>` links, empty alt on every image, an unlabelled burger, auto-rotating tabs without pause, and a `width` tween on scroll: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, shared CSS, the IX2 data chunk |
| Award and credits | none found in one search; credits unknown |
| Concept, structure, visual language | high — five desktop, five reduced-motion frames; phone frames s00 and s50 read |
| Motion parameters | high — inline scripts and IX2 action list read |
| Weaknesses | high for reduced motion, keyboard, semantics; menu open, hover states, inner routes and 404 not observed |

**Live pass 2026-09-23: reachable, capture exit 2 (the ORB-blocked Refokus script and an aborted analytics beacon), `scrollMode: native`, distinct frames, no wheel retry needed.** Sources in `.awards/research/911rennsport/`: 15 captures + `manifest.json`; `index.html`; `rennsport.shared.css`; `wf-ix.js` (Webflow entry); `schunk.36b8fb49256177c8.js`, `schunk.4cf233830a198d29.js` (IX2 engine and interaction data), `schunk.121b0d7ff03e0f4a.js`. Not observed: the menu open, the model-range tabs, inner routes, the 404.
