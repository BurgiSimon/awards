# Direct Design Agency — https://wearedirect.co/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | studio — a brand and design agency for B2B clients (strategy, design, development, marketing) [verified, index.html meta description; desktop-s50.png] |
| Visitor mode | persuade — a yellow *Contact Us* pill in the header, a copy-email tile and a voice-agent widget on every scroll state [verified, desktop-s00/s25/s100.png] |
| Awards | Awwwards **Honorable Mention, 25 Aug 2026**; no jury axis or developer scores are published on the entry, only 15 of 25 community votes listed individually [verified, entry page, `entry/entry.html` + `entry/desktop-s00.png`] |
| Corpus rating | D 6.8 / U 6.3 / C 6.8 / Co 7.0 → weighted 6.67, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | COSMOFLOW, DirectDesign, Vijay Krishna, Keshika, Dinesh [verified, entry page]; footer line "in partnership with Cosmoflow" [verified, desktop-s100.png] |
| Stack (evidence level) | **Webflow export** served from the agency's own host (relative `css/`, `js/webflow.js`, `data-wf-site`, jQuery 3.5.1) [verified, index.html] · **GSAP 3.12.5** + ScrollTrigger, ScrollToPlugin, Flip [verified, index.html cdnjs/jsdelivr script tags] · **Lenis** as `@studio-freight/lenis@latest`, unpinned [verified, index.html] · **Barba** as `@barba/core`, unpinned [verified, index.html; entry page tags "GSAP, BARBA.js, Webflow"] · **SplitType 0.3.4** [verified, index.html] · **Sanity** content fetched client-side (`projectId`, `cdn.sanity.io`) [verified, inline.js #15] · Vimeo-hosted loop videos [verified, manifest.json failed requests `vimeocdn.com`] · ElevenLabs conversational-AI widget [verified, index.html `@elevenlabs/convai-widget-embed`] · GTM + GA4 [verified, index.html] · fonts: Adobe Fonts + Google Fonts [verified, typekit.css; index.html] |
| Palette | ground white [verified, directdesign.webflow.css `--colors--white: white`] |
| | ink and header pill `#000` [verified, directdesign.webflow.css `--colors--black`] |
| | yellow, the lead accent (CTA, selection, home loader) `#fed76a` [verified, directdesign.webflow.css `--colors--yellow`] |
| | blue `#4c88ff` [verified, directdesign.webflow.css `--colors--blue`] |
| | green `#2ccc5a` [verified, directdesign.webflow.css `--colors--green`] |
| | pink `#ff89f0` [verified, directdesign.webflow.css `--colors--pink`] |
| | orange `#ff6200` [verified, directdesign.webflow.css `--colors--orange`] |
| | red, token only, not seen on screen `#ff4d4d` [verified, directdesign.webflow.css `--colors--red`] |
| | Strategy: **white ground + black ink + five flat named accents rotated across buttons, cards and route loaders**; ink tints by alpha (`black-75`, `-25`, `-10`) [verified, directdesign.webflow.css; inline.js #12 `assignBtnAccents`]. The entry lists only white and black [verified, entry page] |
| Type | **neutral grotesque + mono labels** — Helvetica Neue LT Pro through Adobe Fonts for everything set [verified, typekit.css `helvetica-neue-lt-pro`]; Chivo Mono 300/400/500 from Google Fonts for eyebrows, tags and legal lines [verified, index.html; desktop-s00/s100.png] |
| WebGL dosage | none — no canvas on any profile; the 3D signage is pre-rendered video and stills [verified, manifest.json `canvases: 0`; index.html `<video autoplay muted loop>`] |
| Scroll model | native + Lenis on the GSAP ticker, `lagSmoothing(0)`; Barba curtain between routes [verified, inline.js #23; manifest.json `scrollMode: native`] |
| Narrative model | gallery — hero, a work grid, a statement, services, impact, principles cards, client stories, a contact close [verified, desktop-s00 to s100.png, mobile-s00 to s100.png] |

## 1. Concept and narrative
**One idea:** the agency's name read as road directions. Signage carries the whole world: a traffic light, a direction diamond, street-name plates, a lit box sign reading *go the Direct way*, all as glossy 3D renders on soft gradient cards [verified, desktop-s00.png, desktop-s50.png, desktop-s75.png]. The hero light shows a red lamp with a question mark on desktop and a green smiling lamp on the phone, so the clip plays the change from doubt to go [verified, desktop-s00.png, mobile-s00.png].

Beats: a split hero with the render card on the left and a headline set large in the grotesque on the right, with a small *watch launch video* card docked bottom right [verified, desktop-s00.png]. Next, a two-up work grid with tagged captions [verified, desktop-s25.png], a service list set at display size with a sign illustration beside it [verified, desktop-s50.png], principle cards each carrying its own signpost on a pastel gradient [verified, desktop-s75.png], and a black close under two big action tiles [verified, desktop-s100.png]. The copy is plain agency register ("brands that lead", "clarity"). It gets specific in the principle cards, which take a stance on AI in the design process [verified, desktop-s75.png].

## 2. Structure and components
- **Header**: a black rounded bar with the wordmark, five text links and a yellow *Contact Us* pill with an arrow chip [verified, desktop-s00.png]. On desktop it hides on scroll down and returns on scroll up, locked hidden over the contact close [verified, inline.js #7]. The phone gets a hamburger that grows the bar to `55vh` [verified, mobile-s00.png; inline.js #8].
- **Preloader and route curtain**: one element with three coloured blocks, a route word and the logo; the home page declares `yellow` / `Design` [verified, index.html `data-barba-color`, `data-barba-word`; inline.js #23]. Every same-origin link is fetched in idle time to read the destination's colour and word ahead of the click [verified, inline.js #23 `prefetchAllBarbaMeta`].
- **Docked reel card**: a black thumbnail fixed bottom right that grows into a full-viewport reel as its section arrives (§4) [verified, desktop-s00.png; inline.js #17]. Desktop only; under 1024 px it sits in the flow [verified, inline.js #17 `BREAKPOINT=1024`].
- **Work grid**: two columns, 16:10-ish media with rounded corners, name + grey strapline + mono tag chips (BRANDING / WEBSITE / GRAPHIC) [verified, desktop-s25.png]. A "coming soon" chip marks unfinished cases [verified, mobile-s25.png].
- **Services accordion**: four disciplines at display size with yellow +/− squares; it advances by itself every 8 s with a progress rule filling under the open row [verified, desktop-s50.png; inline.js #21 `AUTO_DELAY = 8000`].
- **Section eyebrows**: numbered mono labels "04 / WE SPECIALISE IN" style [verified, desktop-s50.png].
- **Principle cards**: numbered pastel gradient tiles, each with a signpost render and a two-line claim [verified, desktop-s75.png].
- **Client logo marquee**: rAF loop at 0.6 px/frame, drag with momentum decaying ×0.95 per frame, paused off-screen [verified, inline.js #22].
- **Contact close**: a white *copy mail* tile with the address at display size beside a coloured *more work* tile that points to the next page; the footer is black with three link columns and the wordmark at the bottom left [verified, desktop-s100.png; inline.js #9, #13].
- **Voice agent**: an ElevenLabs "Need help? Start a call" card that appears once the hero leaves view [verified, desktop-s25.png; inline.js #25].
- **Awwwards ribbon**: fixed at the right edge, vertically centred, on every frame [verified, index.html; all captures].
- Not observed: `/projects`, `/services`, `/agency`, *The Zone* (listed on the entry as a gallery element) and the 404 [verified, entry page lists them; not captured].

## 3. Visual language
- **Grounds**: white body, one black footer; colour arrives only in cards, chips and renders [verified, desktop-s00 to s100.png].
- **Accents as a rotating set**: button accent colours are assigned from a five-token list in turn, so no two neighbouring buttons share a hue [verified, inline.js #12]. The same five hues flash through headline characters on entry (§4) and colour the route curtain per page [verified, inline.js #6, #23].
- **Type scale**: stepped px tokens per breakpoint, not fluid: `--h1-font-size` 60 → 62 → 68 px from phone to ≥1024, `--h2` 48 px throughout, captions 12 → 14 px [verified, index.html inline `:root` block]. The root rem is re-stepped too (12 px → 8 px → 7 px) [verified, index.html]. Display lines are tight-leaded and tightly tracked Helvetica; body copy is set justified in places, which opens rivers on the phone [verified, mobile-s00.png].
- **Imagery**: one material family, glossy toy-like 3D signage with gold, black and neon-green parts on pale gradients; client work in the grid is photography and logo lockups [verified, desktop-s00/s25/s75.png].
- **Layout**: a 50/50 split on desktop, with the right column carrying headlines and the left carrying media; heavy white gaps where a column has nothing [verified, desktop-s50.png, desktop-s75.png].
- Browser surfaces: yellow `::selection` with black text [verified, index.html]; light and dark favicons [verified, index.html]; no `theme-color` [verified, index.html].

## 4. Motion and effects (with parameters)
- **Tokens**: durations .2 / .4 / .5 / .6 / 1 / 1.2 / 1.5 / 2 s; eases `power2.out`, `power2.in`, `power2.inOut`, `expo.out` on a global `anim` object [verified, inline.js #4].
- **Lenis**: `duration: 2`, easing `min(1, 1.001 − 2^(−10t))`, `smoothTouch: false`, `touchMultiplier: 2`, driven by `gsap.ticker` with `lagSmoothing(0)`; destroyed and recreated around every route change [verified, inline.js #23].
- **Load gate**: scroll locked at top on `load`; logo fades in .4 s at .2 s, out .4 s after .5 s; the curtain leaves on `y: '300vh'`, 1 s `power2.inOut`, at .9 s; `loader:completed` fires at 1.35 s and only then do reveals initialise [verified, inline.js #23, #6]. It plays on every load; no repeat-visit skip [verified, inline.js #23].
- **Route curtain**: a clone of the loader drops from `-300vh` to `0` in 1 s `power2.inOut`, the new container swaps, and it exits to `200vh` after 1 s [verified, inline.js #23]. Back navigation restores the saved scroll position [verified, inline.js #23 `scrollPositions`].
- **Reveals**: `clip` = `inset(0 0 100% 0)` → `inset(0)`, 1 s `power2.out`, .1 s stagger inside containers; `slide-up` = `y: 48, opacity: 0` → rest, 1 s; `split-text` = SplitType lines from `y: '130%'`, 1 s, stagger amount .15; triggers at `top 80%`, once [verified, inline.js #6].
- **Colour-wave entry**: headline characters start at opacity .15 in ink, then in batches of three and .04 s per char each one fades to one of the five accents in .1 s `sine.out`, holds .05 s and settles back to ink at full opacity; lines start .15 s apart [verified, inline.js #6 `color-wave-entry`]. A single-accent variant replays on hover [verified, inline.js #16].
- **Random alpha**: SplitType characters fade in `from: 'random'` at .02 s each, duration clamped 1–4 s, `expo.out` [verified, inline.js #6].
- **Button hover**: label characters dip to opacity 0 and back, .2 s each, .02 s stagger [verified, inline.js #6].
- **Docked reel growth**: width and height scrub from the docked size to viewport − 2 × 2 rem between `top 85%` and `top 2rem` of the target section, `ease: 'none'`, caption fading to 0; past the end a second trigger pins the reel's fixed rect to the section as it scrolls away. Clicking the dock scrolls to the section over 1.2 s [verified, inline.js #17].
- **Services auto-advance**: 8 s timer, progress fill `scaleX 0 → 1` linear over the same 8 s, paused while the pointer is over a row; a click opens a row [verified, inline.js #21 `mouseenter` / `mouseleave` / `click`].
- Not found: any `prefers-reduced-motion` query in HTML, inline JS or the site CSS [verified, grep of index.html, inline.js, directdesign.webflow.css].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Build | Webflow Designer, exported and self-hosted; custom code in page embeds | [verified, index.html comment "created in Webflow", relative asset paths] |
| Motion | GSAP 3.12.5 (ScrollTrigger, ScrollToPlugin, Flip) + SplitType 0.3.4 | [verified, index.html] |
| Scroll / routes | `@studio-freight/lenis@latest`, `@barba/core` unpinned, both from jsDelivr | [verified, index.html] |
| Content | Sanity queried in the browser and rendered into templates, re-run after each Barba swap | [verified, inline.js #15, #23 `runCMS`] |
| Media | Vimeo-hosted autoplay loops, eight images with non-empty `alt` | [verified, manifest.json, index.html] |

- One `h1`, six `h2`, one `main`, no `nav` element [verified, index.html]. 1,102 DOM nodes on desktop; CLS 0.05 [verified, manifest.json]. The HTML document is 208 KB and the site stylesheet 152 KB uncompressed [verified, local file sizes].
- Console: one 401 and four `%c%d` NaN log lines; no page errors [verified, manifest.json].
- The unpinned `@latest` tags mean the site's behaviour can change without a deploy [inferred].
- `lcpColdSynthetic` is a headless cold-cache artefact, not a performance claim.

## 6. Weaknesses
- Reduced motion: **fail**. No query anywhere; the 1.35 s gate, the curtain, the colour waves and the 8 s auto-advance all run [verified, grep; inline.js]. `desktop-rm-s00` reads at rest only because the reveals had already fired after the gate [verified, desktop-rm-s00.png].
- Keyboard: **fail**. The menu opens on click only, with no Escape handler, no `aria-expanded` and no focus move; the marquee is mouse and touch only; the services rows pause on hover but not on focus; the site stylesheet and page embeds have no `:focus-visible` rule (only Webflow's runtime polyfill mentions it) and there is no skip link [verified, inline.js #8, #21, #22; directdesign.webflow.css; index.html; webflow.js].
- DOM behind the canvas: **pass**, there is no canvas; but case content is rendered from Sanity in the browser, so the served HTML is partly template [verified, inline.js #15].
- Load gate: **fail**. Scroll is locked for 1.35 s on every load and for ≈ 2 s on every route change [verified, inline.js #23].
- Phone: **designed**. Headline first, render below, a hamburger bar [verified, mobile-s00.png]. But the voice-agent card covers about a fifth of the phone viewport, and the Awwwards ribbon overlaps the hero render [verified, mobile-s50.png, mobile-s00.png].
- Wayfinding and conversion: **pass**. The contact pill stays in the header, the email copies in one click, a next-page tile closes every page [verified, desktop-s00/s100.png]. No current-page marker in the nav [verified, desktop-s00.png].

What the awards skills do differently: one motion-tier switch that skips the gate and the colour waves under reduced motion `[recipe:reduced-motion-switch]`, a focus-trapped menu with Escape `[recipe:nav-overlay-fullscreen]`, a keyboard and pause path for any marquee `[recipe:marquee-raf-mask]`, pinned library versions, and floating widgets kept out of the phone's reading column.

## 7. Principles
1. **Make the name the world.** When the brand name suggests one physical system (roads, signs, lights), every illustration, loader and card can come from it, and the site needs no other motif.
2. **Colour the moment, not the ground.** A white page with a small accent set becomes lively when colour is spent on transitions and entries rather than on backgrounds.
3. **Let a small dock earn its full screen.** A media card parked in a corner can grow into the section it belongs to on scroll, so the reel is present from the first frame without taking the hero.
4. **Carry the destination into the transition.** When the curtain already wears the next page's colour and word, the route change tells the visitor where they are going.
5. **Rotate accents mechanically.** Assigning accents from a fixed list in order keeps many hues from clustering and needs no per-element decision.

## 8. Take / Don't take
- **Take:**
  - Idle-time prefetch of each link's destination theme, so a curtain can be coloured before the next page arrives `[pattern:preloaders-and-transitions#transition-archetypes]`.
  - The batched colour-wave: batches of three glyphs, .04 s per glyph, .1 s in, .05 s hold, .1 s out to ink. Run it once, and give it a reduced tier `[pattern:motion-vocabulary#text-effects]`.
  - A docked media card scrubbed to viewport − gutter between `top 85%` and `top <gutter>`, with `ease: 'none'`, then released to its section.
  - An auto-advancing list whose progress rule is the timer, linear over the same duration.
- **Don't take:**
  - The five-accent set as literal values:
    - `#fed76a` [verified, directdesign.webflow.css]
    - `#4c88ff` [verified, directdesign.webflow.css]
    - `#2ccc5a` [verified, directdesign.webflow.css]
    - `#ff89f0` [verified, directdesign.webflow.css]
    - `#ff6200` [verified, directdesign.webflow.css]
  - Traffic lights, road signs or signpost renders for a wayfinding pun; the "go the Direct way" line or any of the headline copy.
  - Helvetica Neue with a mono eyebrow as the whole contract; `[site:united-carriers]` and `[site:lama-lama]` already hold that family of pairings.
  - The section order hero → work → statement → services → principles → stories → contact.
  - A gate that plays on every load, unpinned `@latest` libraries, and a chat widget over the reading column: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, site CSS, Adobe Fonts CSS, inline scripts |
| Award and credits | high — entry page read; no axis scores exist to read |
| Concept, structure, visual language | high — five desktop, five phone and five reduced-motion states |
| Motion parameters | high — read from the inline scripts; Lenis version unknown (unpinned) |
| Weaknesses | high for reduced motion, keyboard, load gate; medium for the inner routes (not captured) |

**Live pass 2026-09-23: reachable, capture exit 2 (aborted Vimeo segments and analytics beacons only), `scrollMode: native`, distinct frames on every profile, no retry needed.** Sources in `.awards/research/wearedirect/`: 15 captures + `manifest.json`; `index.html`; `inline.js` (the page's inline scripts, numbered as cited); `directdesign.webflow.css`; `webflow.js`; `typekit.css`. Award entry `awwwards.com/sites/direct-design-agency`, linked from the site's own ribbon, captured desktop-only into `entry/` (exit 2, a cookie wall over the frames) and its HTML read. Not observed: inner routes, *The Zone*, the 404, the route curtain on screen, the hover states.
