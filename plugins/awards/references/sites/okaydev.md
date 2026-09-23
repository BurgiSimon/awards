# OKAY DEV® — https://okaydev.co/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | B2B product — the marketing home of a paid community platform (social feed, portfolios, directory, jobs, articles) sold to individual creative developers and to studios through a Business tier [verified, index.html meta description; desktop-s00/s75.png; mobile-s50.png] |
| Visitor mode | persuade — a black *Create a profile* pill under the headline, *Sign up* in the header, three priced plans at the close [verified, desktop-s00/s75.png] |
| Awards | none found on the page: no award ribbon or badge in the served HTML [verified, grep of index.html]; no entry was looked up [unknown] |
| Corpus rating | D 7.1 / U 7.2 / C 6.6 / Co 7.4 → weighted 7.06, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | [unknown] — no credit line in the footer or the head; `twitter:creator` is the platform's own account [verified, index.html; desktop-s100.png] |
| Stack (evidence level) | **Craft CMS** (`CRAFT_CSRF_TOKEN`, `/cpresources/`, SEOmatic generator, Freeform forms) hosted on **Servd** with a Bunny CDN [verified, index.html; manifest.json failed requests] · **Vite** build with a legacy bundle and per-route renderer chunks [verified, index.html `modulepreload`, `vite-script-loaded`; app-DcB1ZGDG.js dynamic imports] · **GSAP 3.15.0** with ScrollTrigger, SplitText, Draggable and InertiaPlugin [verified, HeaderLogoLetters-YUlN53xs.js, home-renderer-DnS0bFuM.js] · a **Highway-style PJAX router** (`data-router-wrapper`, `data-router-view`, `data-router-disabled`, a `NAVIGATE_IN` event, `onEnterCompleted`) [verified, index.html; HeaderLogoLetters-YUlN53xs.js]; whether it is Highway itself or an in-house port [inferred: an EventTarget rewrite, since it dispatches `CustomEvent`s] · **htmx 2.0.7** with Sprig for server-rendered partials [verified, HeaderLogoLetters-YUlN53xs.js `version:"2.0.7"`] · Fathom analytics [verified, index.html] · no Lenis, no Three.js [verified, grep of the three JS files] · fonts self-hosted woff2 [verified, index.html preloads] |
| Palette | near-black ink and dark ground, the most-used value |
| | `#0c0c0c` [verified, app-DZ4qmsr3.css, 339 uses] |
| | dark `theme-color` and `bg-current` of dark sections |
| | `#121212` [verified, index.html `theme-color`; app-DZ4qmsr3.css] |
| | violet, social band, *Sign up* hover, PRO plan |
| | `#6d42ed` [verified, app-DZ4qmsr3.css, 231 uses] |
| | green, `.bg-green` and liked counts |
| | `#42ed91` [verified, app-DZ4qmsr3.css] |
| | yellow, inner fill of the logo and the Lifetime plan |
| | `#eee642` [verified, app-DZ4qmsr3.css `--logo-fill-inner`] |
| | red, secondary accent |
| | `#ec4242` [verified, app-DZ4qmsr3.css] |
| | orange, secondary accent |
| | `#ed9442` [verified, app-DZ4qmsr3.css] |
| | Strategy: **theme-per-section, five flat brand hues on a near-black ground**, the header re-themed per section through `data-header-theme` [verified, index.html; desktop-s00 to s100.png]. The accents are built from the same two channel values, 0x42 and 0xed (violet adds 0x6d) [verified, app-DZ4qmsr3.css]. The hero green renders deeper than `.bg-green` in the capture; its exact value was not read [unknown] |
| Type | **variable grotesque + mono labels + a chunky novelty display for the brand voice**: Aeonik Pro variable for headlines and body, Aeonik Mono for nav, buttons and plan eyebrows, Megazoid (plus a Megazoid-Fill layer) for the wordmark and the marquee [verified, index.html font preloads; app-DZ4qmsr3.css `@font-face`; desktop-s00/s100.png] |
| WebGL dosage | none — no canvas on any profile [verified, manifest.json `canvases: 0`] |
| Scroll model | native, no smoothing library; ScrollTrigger scrubs (`scrub: 1`, `scrub: .5`) and a damped scroll-driven curl [verified, manifest.json `scrollMode: native`; home-renderer-DnS0bFuM.js] |
| Narrative model | specification — feature chapters in turn (profile, social, articles and jobs, studio accounts), then pricing and a wordmark close [verified, desktop-s00 to s100.png; mobile-s25/s50.png] |

## 1. Concept and narrative
**One idea:** the members' work is the hero. The first viewport scatters about fifteen thumbnails of community projects and portraits around a three-line headline, so the product is shown as its people before it is explained [verified, desktop-s00.png]. The headline stacks three nouns and puts the last one, *Builders*, in white on a black slab [verified, desktop-s00.png]. A loud grey marquee of the member types in the chunky display face closes the viewport [verified, desktop-s00.png].

Beats: green hero and marquee → a violet band where the brand name runs huge and sideways → a near-black *Make it yours* chapter with a product screenshot → *More than a feed*, where article and job screens lean back on a curve → a white studio chapter with a field of tilted client logos → pricing on near-black with three coloured plan cards → a gridded black footer led by the outlined wordmark [verified, desktop-s00 to s100.png; desktop-rm-s25/s50.png; mobile-s25/s50.png]. The copy register is friendly SaaS: short declaratives ("Make it yours.", "More than a feed.") and a close that asks you to "hang with creative people on the internet" [verified, desktop-s25/s50/s100.png].

## 2. Structure and components
- **Header**: a white pill floating inside a 80 px gutter: wordmark left, six mono links centred, *Login* and a black *Sign up* pill right [verified, desktop-s00.png]. It leaves on scroll down (absent at `desktop-s25`, present at `desktop-rm-s25`) [verified]. Its entrance plays once per tab: an inline script clears it before first paint when `data-header-intro-seen` is set [verified, index.html]. The phone gets the wordmark and a two-bar menu button in the same pill [verified, mobile-s00.png].
- **Scattered hero field**: thumbnails at several sizes around the headline with soft shadows; on mouse hover each tilts toward the pointer with moving shine and shade layers and shows a credit card that scales from .94 [verified, home-renderer-DnS0bFuM.js]. Hovers lock while the page scrolls and unlock on the next pointer move after a 140 ms scroll-end timer [verified, home-renderer-DnS0bFuM.js `is-interaction-locked`].
- **Hero exit**: three timelines (media, copy, CTA) play forward at `timeScale(1.35)` past a scroll threshold and reverse at 1.85 when you scroll back [verified, home-renderer-DnS0bFuM.js `playExitForward` / `playExitReverse`].
- **Phone hero**: the field becomes a five-tile cluster whose slots cycle media on a 2.8 s timeline, portrait and no-preference only; hidden slots are `inert` and `aria-hidden` [verified, mobile-s00.png; home-renderer-DnS0bFuM.js `initMobileCycle`].
- **Member-type marquee**: 60 px tall (52 and 58 px on small screens), slows to `timeScale .35` on hover over .85 s `power2.inOut`, not built under reduced motion [verified, index.html inline style; home-renderer-DnS0bFuM.js].
- **Scripted composer demo**: a post card is typed character by character, including a fenced CSS block with syntax highlighting, as a product walkthrough [verified, home-renderer-DnS0bFuM.js `typeInSeg`]; that it sits in the social chapter [inferred, the social post card at the top of desktop-rm-s25.png].
- **Curved screen stack**: in *More than a feed* the product screens curl back as they pass (§4) [verified, desktop-s50.png; home-renderer-DnS0bFuM.js `applyCylinderProgress`].
- **Draggable carousel** with dots, `tabindex=0`, `role=group`, `aria-roledescription=carousel` and arrow-key handling [verified, home-renderer-DnS0bFuM.js].
- **Pricing**: three cards (grey, violet, yellow) with price, promise, checklist and a full-width pill [verified, desktop-s75.png].
- **Footer**: outlined 3D-extruded wordmark, a two-line invitation, a pill CTA, two link rows, six social icons and a legal row on a faint grid [verified, desktop-s100.png].
- Not observed: the inner routes, the 404, the menu overlay on the phone, the hover states on screen.

## 3. Visual language
- **Grounds as chapters**: green, violet, near-black, white, near-black [verified, desktop-s00 to s100.png]. A thin line grid shows through the hero and the footer, tying the open and the close [verified, desktop-s00/s100.png].
- **Type**: one grotesque carries every headline and paragraph; the mono sets every control in caps with wide tracking; the novelty display face appears only in the wordmark and the marquee, so it reads as the brand's voice and not as a heading style [verified, desktop-s00/s75/s100.png]. Display sizes are fluid clamps such as `clamp(48px,5vw,192px)` and `clamp(63px,6.7vw,146px)` [verified, app-DZ4qmsr3.css].
- **Imagery**: real member work and portraits, and product screenshots shown as objects in space (tilted, curled, dimmed) rather than framed in device mockups [verified, desktop-s00/s50.png; mobile-s50.png].
- **Surfaces**: `theme-color` set to the dark ground; SVG, PNG, ICO and Apple icons; custom `::selection` rules exist [verified, index.html; app-DZ4qmsr3.css].

## 4. Motion and effects (with parameters)
- **Easing tokens in CSS**: `cubic-bezier(.19,1,.22,1)` (89 uses), `(.215,.61,.355,1)` (80), `(.23,1,.32,1)` (57) [verified, app-DZ4qmsr3.css].
- **GSAP durations on a .12 s grid**: .12, .36, .48, .72, .96 are the common values; `power2.out` leads the eases (21 uses), `back.out(2.5)` for pops [verified, home-renderer-DnS0bFuM.js].
- **Curl on scroll**: each screen's progress drives `rotationX = 48° × power1.in(p)` and `z = −900 × (1 − cos θ)`, with brightness falling from 1 to .35 past p = .55. Progress is damped at `current += .18 × (target − current)` on `gsap.ticker`, and the ticker is removed once settled within .001 [verified, home-renderer-DnS0bFuM.js `initCylinder`].
- **Column parallax**: four columns move `y` from +s to −s with s = 46 / 12 / 20 / 40 px, `ease: 'none'`, `scrub: 1`, from `top bottom+=70%` to `center top` [verified, home-renderer-DnS0bFuM.js `initParallax`].
- **Sideways brand word**: the violet band's giant word translates by its overflow, `scrub: .5`, with different start and end on screens ≤ 1023 px [verified, home-renderer-DnS0bFuM.js; desktop-s25.png, mobile-s25.png].
- **Grid reveal**: one `autoAlpha` fade, .6 s `power1.out`, once at `top 88%`, after `img.decode()` has been asked for [verified, home-renderer-DnS0bFuM.js `initGridReveal`]. The *Make it yours* visual was caught blurred mid-reveal at `desktop-s25` and crisp at `desktop-rm-s25`; the blur's mechanism was not found [unknown].
- **Reduced motion**: the marquee, the social scrub, the phone cycle and the carousel entrance are skipped under `isReducedMotion`; hover cards start at scale 1 [verified, home-renderer-DnS0bFuM.js]. The CSS has 30 `prefers-reduced-motion` blocks [verified, app-DZ4qmsr3.css].
- No preloader, no custom cursor, no smooth scroll, no sound [verified, desktop-s00.png; manifest.json; grep of the JS].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| CMS and host | Craft CMS on Servd; images through a signed resize host (`images.okaydev.co`, `?w=…&s=…`), imgix-style [inferred from the query shape] | [verified, index.html] |
| Build | Vite, modern + legacy bundles, one renderer chunk per route type (about 35) | [verified, app-DcB1ZGDG.js] |
| Routing | Highway-style PJAX with renderers; htmx 2.0.7 + Sprig for partials | [verified, index.html; HeaderLogoLetters-YUlN53xs.js] |
| Motion | GSAP 3.15.0: ScrollTrigger, SplitText, Draggable, InertiaPlugin | [verified, HeaderLogoLetters-YUlN53xs.js; home-renderer-DnS0bFuM.js] |
| Fonts | Aeonik Pro VF (`swap`), Aeonik Mono (`swap`), Megazoid (`optional` in the critical CSS) | [verified, index.html] |

- Weights as fetched, uncompressed: HTML 600 KB, app CSS 1.44 MB, app JS 200 KB, shared chunk 408 KB, home renderer 111 KB [verified, curl sizes]. The one stylesheet carries every route's styles [inferred from its size and selectors].
- An inline style block reserves each home section's height (`100svh` hero, `clamp(720px,63.9vw,920px)` work) to hold layout while scripts load [verified, index.html `okaydev-home-height-reserve`]. Desktop CLS 0.0002 [verified, manifest.json].
- The phone profile hit three HTTP 429 responses and timed out at s75 and s100; its CLS of 0.91 was measured under that throttling and is not a clean figure [verified, manifest.json].
- 3,226 DOM nodes on desktop; one `h1`, one `main`, six `nav`; 9 of 175 `<img>` have empty `alt` [verified, manifest.json; index.html]. `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.

## 6. Weaknesses
- Reduced motion: **pass**. `desktop-rm-s00` to `s100` read at rest with the marquee still, and the scroll modules are gated in code [verified, desktop-rm-*.png; home-renderer-DnS0bFuM.js].
- Keyboard: **partial**. The carousel has arrow keys and roles, and the CSS has many `:focus-visible` rules [verified, home-renderer-DnS0bFuM.js; app-DZ4qmsr3.css]. But the hero credit cards answer only `pointerType === 'mouse'`, and there is no skip link [verified, home-renderer-DnS0bFuM.js; index.html].
- DOM behind the canvas: **pass**, no canvas; the headline, copy and pricing are server-rendered HTML [verified, index.html].
- Load gate: **pass**. No preloader; the header entrance is skipped on repeat within a tab [verified, index.html].
- Phone: **designed**. A reflowed hero with a cycling cluster, centred chapters, full-width CTAs [verified, mobile-s00/s25/s50.png]. The layout-shift figure is unreliable (§5).
- Wayfinding and conversion: **pass**. *Sign up* in the header, a CTA in the hero, per chapter and in the footer, and prices in plain numbers [verified, desktop-s00/s75/s100.png]. The header hides on scroll down, so the CTA leaves with it until you scroll up [verified, desktop-s25.png].

What the awards skills do differently: a keyboard and focus path for every hover reveal (`[pattern:cursor-and-pointer#keyboard-equivalents]`), a skip link, one stylesheet split per route, and a concept that makes the feature chapters one argument rather than a list.

## 7. Principles
1. **Let the users be the hero.** When the product is a community or a marketplace, a field of real members' work says more in the first viewport than any interface screenshot.
2. **Show the interface as an object, not a device.** Screens that tilt, curl and dim in space read as product without the cliché of a laptop frame.
3. **Build the accents from one rule.** Deriving every brand hue from the same channel values keeps five loud colours in one family.
4. **Keep the novelty face for the voice.** A chunky display face used only for the name and one marquee stays a signature; spread across headings it becomes noise.
5. **Put the timing on a grid.** Durations stepped on one base unit make many small tweens feel like one system.
6. **Lock hover while scrolling.** Pausing pointer reveals until the scroll settles stops a field of hover targets from flickering under a moving page.

## 8. Take / Don't take
- **Take:**
  - The damped scroll curl: `rotationX` up to 48° on an eased progress, `z = −R(1 − cos θ)`, brightness to .35 on exit, lerp .18 on the ticker, removed when settled.
  - A 140 ms scroll-end lock on pointer effects, released by the next pointer move.
  - A duration grid (.12 s base) and one lead ease per register.
  - Exit timelines that play past a threshold and reverse faster (1.35 vs 1.85) instead of a scrub.
  - Reserving section heights in the critical CSS before scripts run.
- **Don't take:**
  - The five-accent set and the ink as literal values:
    - `#6d42ed` [verified, app-DZ4qmsr3.css]
    - `#42ed91` [verified, app-DZ4qmsr3.css]
    - `#eee642` [verified, app-DZ4qmsr3.css]
    - `#ec4242` [verified, app-DZ4qmsr3.css]
    - `#ed9442` [verified, app-DZ4qmsr3.css]
    - `#0c0c0c` [verified, app-DZ4qmsr3.css]
  - The three-noun stacked headline with the last word on a black slab, and the member-type marquee.
  - A chunky retro display face with an extruded outline as the wordmark.
  - The chapter order hero → sideways brand band → profile → feed → studios → pricing → footer.
  - A 1.4 MB single stylesheet and mouse-only hover credits: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, site CSS and three JS chunks read |
| Awards and credits | low — none on the page; no entry looked up |
| Concept, structure, visual language | high — five desktop, three phone and five reduced-motion states |
| Motion parameters | high — read from the home renderer chunk |
| Weaknesses | high for reduced motion, load gate and keyboard; medium for the phone (rate-limited profile) |

**Live pass 2026-09-23: reachable, capture exit 2 (aborted video loads; HTTP 429 and screenshot timeouts on the phone profile at s75 and s100), `scrollMode: native`, distinct frames on every captured state, no retry needed.** Sources in `.awards/research/okaydev/`: 13 captures + `manifest.json`; `index.html`; `app-DZ4qmsr3.css`; `app-DcB1ZGDG.js`; `HeaderLogoLetters-YUlN53xs.js` and `.css`; `home-renderer-DnS0bFuM.js`. Not observed: inner routes, the 404, the menu overlay, hover states, the composer demo on screen.
