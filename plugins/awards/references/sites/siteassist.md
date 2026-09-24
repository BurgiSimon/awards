# SiteAssist — https://www.siteassist.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

> Identity: SiteAssist sells a Control of Works platform (digital permits, briefings, inspections, registers) to construction, utilities, nuclear and other high-risk industries, from a London office [verified, index.html `<title>`, meta description, footer]. Not siteassist.io, an unrelated website-chatbot product [verified, search result].

| Field | Value |
|---|---|
| Class | B2B product (safety-compliance SaaS) |
| Visitor mode | persuade — one conversion, "Request demo", in the nav bar on every frame [verified, `desktop-s00…s100.png`] |
| Awards | Awwwards **Honorable Mention, 17 Aug 2026**; no jury axis scores and no developer panel published on the entry [verified, entry page https://www.awwwards.com/sites/siteassist read 2026-09-23]. Five community votes shown, overalls 6.50–7.50 [verified, entry page]; they are not jury scores. Entry tags: Business & Corporate, Clean, Scrolling, Photo & Video, UI design, Webflow [verified, entry page] |
| Corpus rating | D 6.4 / U 6.5 / C 5.8 / Co 6.8 → weighted 6.35, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | **Signifly**, who "rebuilt the brand and website", sole credit [verified, entry page]; individuals [unknown] |
| Stack (evidence level) | Webflow (`data-wf-site`, `webflow.schunk.*.js`, `w-` classes) [verified, index.html] · CMS: Webflow CMS collections (`w-dyn-item`) [verified, index.html] · GSAP 3.15.0 + ScrollTrigger, CustomEase, MorphSVGPlugin, SplitText from Webflow's own GSAP CDN [verified, index.html `cdn.prod.website-files.com/gsap/3.15.0/`] · Lenis 1.2.3 [verified, index.html jsdelivr] · Swiper 11 [verified, index.html jsdelivr] · jQuery 3.5.1 [verified, index.html] · 3D none · fonts via Google WebFont Loader 1.6.26 [verified, index.html] · HubSpot, LinkedIn Insight, CookieScript, reCAPTCHA [verified, index.html] |
| Palette | Tokens `--neutral--100:#f9faf9` [verified, site.css] |
| | `--neutral--200:#eff2ef` · `--neutral--300:#e3e7e2` · `--neutral--400:#d9dfd9` [verified, site.css] |
| | `--neutral--500:#d0d7cf` · `--neutral--600:#a2a8a1` · `--neutral--700:#5e615d` [verified, site.css] |
| | `--neutral--800:#303130` · `--neutral--900:#19191a` (body ink) [verified, site.css] |
| | `--primary--violet:#6100fe` on every CTA and eyebrow bullet [verified, site.css + `desktop-s00/s50/s100.png`] |
| | `--primary--black:#0a0017`, a violet-cast near-black [verified, site.css] |
| | Strategy: one green-tinted neutral ramp + one electric accent reserved for conversion; chroma otherwise from photography [verified, captures] |
| Type | **Geist Mono** (19 `font-family` rules) + **Geist** (2), both from Google Fonts at 300–700 [verified, site.css + index.html WebFont.load]. h1 uppercase Geist Mono 3.5em/1, tracking −.0625em; h2 Geist sans 4.5em/1, tracking −.045em; body Geist 1.0625em/1.41 [verified, site.css]. Breakpoints 479 / 767 / 991 plus 1440 / 1920 steps, no `clamp()` in type [verified, site.css] |
| WebGL dosage | none — 0 canvases on every run; the manifest's `webgl:true` is browser capability only [verified, `manifest.json`] |
| Scroll model | native + smooth library: Lenis `autoRaf:true`, `lerp:.6` (close to native), not synced to ScrollTrigger [verified, index.html; no `ScrollTrigger.update` / `lenis.on`]; `scrollMode:"native"` [verified, `manifest.json`] |
| Narrative model | specification — claim, benefits, a numbered solutions list, the platform's modules, sectors, proof, contact |

## 1. Concept and narrative
The one idea is *field control*: the site speaks like a site-safety instrument panel. The first viewport is a drone shot of a viaduct under construction, playing as a looping muted video, with a single uppercase mono claim, "Total Control of High-Risk Work", ruled underneath [verified, `desktop-s00.png`, index.html h1]. Beside the positioning line sits a live coordinate readout, and it moves with the pointer: mouse position is mapped onto a latitude/longitude box west of London [verified, index.html `initCursorCoordinates`]. A client-logo row closes the hero. Seen across the scroll states:
- a video-backed panel of four benefits numbered "01…", one expanded at a time [verified, `desktop-s25.png`];
- a solutions list numbered 01–09, the count printed as a superscript on the heading [verified, `desktop-s50.png`, index.html `sol-item-no`];
- the platform tabs pairing each module with a product-UI card over aerial photography [verified, `desktop-s50.png`];
- an eight-tile sector grid [verified, `desktop-s75.png`];
- a case-study panel [verified, `desktop-s100.png`];
- a "Let's talk" footer [verified, `desktop-s100.png`].
The copy register is operational and plain ("Drive safer, smarter site operations") [verified, `desktop-s25.png`]. Its specificity comes from the product cards, which carry plausible permit data (location, status chip, start and end dates) [verified, `desktop-s50.png`].

## 2. Structure and components
- **Nav:** a floating rounded bar inset from the viewport edges, with the logo, four mono links, a grey "Log in" and a violet "Request demo" [verified, `desktop-s00.png`]. The bar is dark glass over the hero and turns light over light sections, driven by `data-next-theme` sections checked on a passive scroll listener [verified, index.html `initThemeToggle`, `desktop-s25/s50.png`]. Shift+T toggles the theme by hand [verified, same]. On mobile it becomes a hamburger in the same floating bar [verified, `mobile-s00.png`].
- **Hero:** a full-bleed Vimeo MP4 (`autoplay muted loop playsinline`) [verified, index.html], the mono h1, a hairline rule, and the coordinate readout set right in mono [verified, `desktop-s00.png`]. Client logos sit in a marquee whose direction follows the scroll direction [verified, index.html `initMarqueeScrollDirection`].
- **Benefit tabs:** four tabs over one video panel. The active tab opens its paragraph, the others show titles only, and a big "01" counter sits top-right [verified, `desktop-s25.png`]. The tabs autoplay with a progress bar [verified, index.html `initTabSystem`].
- **Solutions list:** nine numbered hairline rows linking to `/solutions#n`; the numbers are zero-padded by script [verified, index.html].
- **Platform tabs:** icon + mono label rows (Permits, … Checklists, … real-time hazard detection), paired with a visual per tab showing a product-UI card over a photo [verified, `desktop-s50.png`, `mobile-s50.png`].
- **Sector grid:** 4 × 2 photo tiles with sentence-case labels top-left [verified, `desktop-s75.png`].
- **Proof:** a case-study panel on a pale ground with a mono client label [verified, `desktop-s100.png`]. There is also a Swiper quote fader, hidden when its collection is empty [verified, index.html].
- **Footer:** an inset pale panel with "Let's talk" in large sans, a violet "Request a demo" button, and an uppercase mono address and link columns. ISO 27001 and Cyber Essentials badges sit bottom-right [verified, `desktop-s100.png`].
- **Other:** no preloader, no custom cursor, no 404 observed [verified, captures; 404 not requested]. A CookieScript banner covers the lower-left corner on desktop and the bottom third on mobile in every frame [verified, all captures].

## 3. Visual language
- **Grounds and panels:** a white ground, with content sitting on rounded panels stepped in from the viewport. At 1440 wide the nav is inset ≈160 px, content panels ≈48 px and the footer panel ≈16 px [verified, measured on `desktop-s00/s25/s100.png`]. The frame reads as layered, not as a card grid.
- **Colour:** neutrals only, tinted slightly green, ending in a near-black body ink. Violet appears only on CTAs and on the small square bullet before eyebrows [verified, `desktop-s50.png` "■ SITEASSIST PLATFORM"]. The chroma comes from the photography: dust, hi-vis, sky.
- **Type:** mono uppercase for the claim, the nav, eyebrows, list rows and the footer, so the mono is the brand voice. Geist sans is used for reading and for one sentence-case section title per chapter, set tight ("Control-of-Works Platform") [verified, `desktop-s50.png`, site.css].
- **Imagery:** documentary site photography and drone video. Product UI appears as floating cards over the photographs rather than in device frames [verified, `desktop-s50.png`].
- **Browser surfaces:** no `theme-color` meta [verified, index.html]. Favicon PNGs at 32 and 256 px [verified, index.html].

## 4. Motion and effects (with parameters)
- **Smooth scroll:** Lenis `lerp:.6`, `wheelMultiplier:1`, `autoRaf:true`. It is stopped when the demo form opens and restarted by the close buttons or Escape [verified, index.html].
- **Parallax:** attribute-driven, built with `gsap.matchMedia` at breakpoints 479 / 767 / 991 and a `data-parallax-disable` switch per breakpoint. Defaults are yPercent 20 → −20 from `top bottom` with `scrub:true`. The one instance on the homepage runs 0 → 20 from `top top` [verified, index.html `initGlobalParallax`].
- **Autoplay tabs:**
  - A GSAP timeline with defaults `duration:.3`, `ease:"power3"` [verified, index.html `initTabSystem`].
  - Outgoing: the progress bar goes to scaleX 0, the visual to autoAlpha 0, and the details to height 0 [verified, same].
  - Incoming: the details go from height 0 to auto, and the visual fades in at a +0.25 s offset [verified, same].
  - Progress: the bar tweens scaleX 0 → 1, `power1.inOut`, over `data-tabs-autoplay-duration` (5000 and 7000 ms on the two sets), then advances [verified, same].
  - The first switch fires once at `top 80%` [verified, same].
  - On mobile the page scrolls ahead of time to offset a collapsing panel above the target, at a 5 rem offset [verified, same].
- **Marquee:** base speed 30, scroll-speed 2, two duplicates; the direction flips with the scroll direction, and speed is multiplied by .25 below 479 px and .5 below 991 px [verified, index.html data attributes + script].
- **Pointer:** the coordinate readout maps pageY / innerHeight onto latitude 51.30–51.70 and pageX / innerWidth onto longitude −0.50 to −0.05, printed to four decimals on every raw `mousemove`, with no damping [verified, index.html].
- **CSS easings:** tab chrome transitions transform over .4 s on `cubic-bezier(.625,.05,0,1)`; buttons use `.2s cubic-bezier(.215,.61,.355,1)` [verified, site.css].
- **Text:** the h1 carries `data-heading="main-load"`, and SplitText and MorphSVGPlugin are registered, but no inline script uses them. Whether Webflow Interactions animate the h1 is [unknown]; the captured frames show it at rest [verified, `desktop-s00.png`].
- **Quotes:** Swiper `effect:"fade"` with crossFade, loop, `a11y:false` [verified, index.html].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Framework / CMS | Webflow + Webflow CMS | [verified, index.html] |
| Motion | GSAP 3.15.0 (ScrollTrigger, CustomEase, MorphSVG, SplitText) from Webflow's CDN | [verified, index.html] |
| Scroll | Lenis 1.2.3, own rAF | [verified, index.html] |
| Slider | Swiper 11 | [verified, index.html] |
| Legacy | jQuery 3.5.1 (Webflow runtime) | [verified, index.html] |
| Fonts | Geist, Geist Mono via Google WebFont Loader (render depends on a script) | [verified, index.html] |
| Video | hero from Vimeo progressive 1080p MP4 | [verified, index.html] |

- **Page weight:** 1,017 DOM nodes on desktop [verified, `manifest.json`]. HTML 289 KB, shared CSS 112 KB [verified, fetched sizes].
- **Layout shift:** CLS 0.045 on desktop and 0.34 on mobile [verified, `manifest.json`].
- **Console:** one SVG `path d` parse error (a `fill` attribute leaked into the path data) [verified, `manifest.json` consoleErrors]. The other errors are tracking and Vimeo requests that failed under headless capture [verified, same].

## 6. Weaknesses
- **Reduced motion — fail on intent, pass on legibility.** Neither the CSS nor the HTML contains a single `prefers-reduced-motion` [verified, site.css + index.html]. The video loops, the tabs autoplay, the marquee runs and Lenis stays on, and the `desktop-rm-*` frames match the motion frames. Text is readable at rest [verified, `desktop-rm-s00/s25.png`].
- **Keyboard — fail.** The tabs are `<a role="tab" href="#">` with click listeners only [verified, index.html]. `aria-selected` never appears and there are no arrow-key handlers. Autoplay never pauses on hover or focus. There is no skip link [verified, index.html].
- **DOM behind the canvas — pass.** There is no canvas and every string is in the markup [verified, index.html].
- **Load gate — pass.** There is no preloader. The hero depends on a third-party 1080p stream, and fonts wait on a loader script [verified, index.html].
- **Phone — mixed.** The layout is a designed stack with a hamburger [verified, `mobile-s00/s50.png`]. Mobile CLS is 0.34 [verified, `manifest.json`], and the consent banner takes the bottom third of every frame [verified, `mobile-*.png`].
- **Wayfinding and conversion — pass.** The demo CTA is persistent, and the numbered tabs and solutions rows show position. No section indicator exists beyond those [verified, captures].
- **What the awards skills do differently:** one reduced-motion switch that swaps the hero video for a poster and freezes the autoplay tabs and the marquee ([recipe:reduced-motion-switch]); a roving-tabindex tablist with `aria-selected` and arrow keys, where autoplay pauses on hover, focus and when off-screen; the pointer readout damped and hidden on coarse pointers; self-hosted fonts with metric fallbacks.

## 7. Principles (3–6, generalisable)
1. **Let the mono carry the register, and let the grotesque read.** In a regulated or technical field, uppercase mono for claims, labels and chrome reads as instrumentation. Keep one sentence-case grotesque title per chapter so the page still has a human voice.
2. **Give the pointer a unit the audience works in.** A readout that turns pointer position into a domain measure (coordinates, chainage, pressure) makes an idle hover argue for precision, at the cost of one listener and no canvas.
3. **Reserve the only saturated colour for the ask.** A tinted neutral ramp plus one electric accent spent only on conversion means the CTA never competes with the photography.
4. **Step the frame, not the cards.** Nav, content panels and footer at three different insets give a layered depth that needs no shadows and no card grid.
5. **An auto-advancing feature set must show its clock and hand over control.** A visible progress bar and click-to-take-over make autoplay legible. Without pause on hover, focus and reduced motion, it is a carousel.

## 8. Take / Don't take
- **Take:**
  - The pointer-to-domain-unit readout as a DOM-only signature, with damping added and a static value on touch.
  - The tab timeline shape: a .3 s `power3` swap, the visual crossfade offset by .25 s, and height 0 → auto on the details; progress drawn as scaleX over 5–7 s.
  - The marquee that reverses with scroll direction, slowed to .25× / .5× on small screens.
  - Three-step frame insets (large for the nav, medium for panels, small for the footer).
  - One accent token that exists only on CTAs.
  - A section count printed as a superscript on the heading.
- **Don't take:**
  - The hexes `#6100fe` [verified, site.css]
  - `#0a0017` [verified, site.css]
  - the `#f9faf9` → `#19191a` green-grey ramp [verified, site.css]
  - Geist + Geist Mono as a pair (already `[site:usavionix]`'s contract).
  - The hero as-is: drone construction video, uppercase mono claim, ruled line, coordinate readout, logo row.
  - The latitude/longitude box west of London as the readout's range.
  - The section order hero → benefit tabs → numbered solutions → platform tabs → sector grid → case study → "Let's talk".
  - The copy lines, the client logos, the product-UI cards and the photography.
  - The accessibility model: `href="#"` tabs with no `aria-selected`, autoplay that never pauses, no reduced-motion branch, no skip link.

## 9. Confidence and sources
- Header, awards and credits: high [verified, entry page]. The award is an Honorable Mention with no jury scores; the community votes are not used as scores.
- §1–§3: high [verified, 15 captures + index.html + site.css].
- §4: exact for the inline scripts, CSS and Lenis options [verified, index.html + site.css]. Webflow Interactions and any SplitText or MorphSVG use are [unknown]: the Webflow chunks were not read.
- §5: high for the signatures; the budget figures come from the manifest and fetched sizes, not throttled runs.
- §6: high [verified, source + captures]. Screen-reader behaviour was not tested.
- **Live pass 2026-09-23:** reachable, capture exit 2 (console errors and failed tracking requests), `scrollMode` native, states reached by native scroll. Sources in `.awards/research/siteassist/`: `desktop-s00…s100.png`, `mobile-s00…s100.png`, `desktop-rm-s00…s100.png`, `manifest.json`, `index.html`, `site.css`. Entry evidence in `entry/` (`desktop-s00/s50/s100.png`, `manifest.json`, `entry.html`).
