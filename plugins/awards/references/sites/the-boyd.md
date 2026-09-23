# BOYD — https://the-boyd.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | e-commerce — an online art gallery in Dubai selling paintings and objects, with prices in AED, a currency switch (AED / USD / SAR / QAR), a cart and Stripe checkout [verified, index.html header markup; DHmUQlsp.js `loadStripe`; entry "Online gallery of visual art and design"] |
| Visitor mode | persuade — SHOP NOW in the hero, CART (0) and CATALOGUE in the header throughout, priced catalogue cards, an enquiry form [verified, gated/desktop-state-entered.png, walk/desktop-s50.png] |
| Awards | Awwwards **Site of the Day, 25 Mar 2025, 7.45**: D 7.63 / U 7.06 / C 7.58 / Co 7.65. **Dev score 7.09**: Semantics/SEO 6.80, Animations 7.80, Accessibility 6.40, WPO 6.80, Responsive 7.40, Markup 7.20 [verified, entry page, `entry/entry.html`, `entry/desktop-s00.png`]. Entry tags: Art & Illustration, Culture & Education [verified, same] |
| Corpus rating | D 7.2 / U 5.4 / C 6.6 / Co 5.8 → weighted 6.40, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | **The First The Last** (PRO) is the only credit on the entry [verified, entry page]; roles [unknown]. A founder is named on the page [verified, walk/desktop-s25.png] |
| Stack (evidence level) | **Nuxt 3.17.5** + Vue [verified, DHmUQlsp.js `versions:{get nuxt(){return"3.17.5"}`; index.html `/_nuxt/`] · **GSAP 3.13.0** + ScrollTrigger, SplitText, CustomEase, Observer, ScrollToPlugin, TextPlugin, DrawSVGPlugin, MorphSVGPlugin [verified, DHmUQlsp.js `version:"3.13.0"`, plugin name strings] · **Lenis 1.3.4** [verified, DHmUQlsp.js `"1.3.4"`] · Strapi-style media on `cdn.boyd.ae` [verified, index.html asset names; entry JS `strapi`] · Stripe [verified, DHmUQlsp.js] · Pinia [verified, DHmUQlsp.js] · Swiper CSS is inlined but no Swiper JS was found in the fetched chunks [verified, index.html; chunks/] · Cloudflare in front [verified, index.html `/cdn-cgi/`] · fonts: Love, Canela Light, Canela Regular, Adieu [verified, entry.NhmQQ4cw.css `@font-face`] |
| Palette | ground `--c-bg`, warm bone (declared on the entry as well) |
| | `#ece6d6` [verified, index.html inline `:root`; entry page] |
| | ink `--c-base-1000`, taupe brown, with 40 / 30 / 20 / 10 % alpha steps |
| | `#66514b` [verified, index.html inline `:root`; entry page] |
| | white `--c-base-0`, for display type over photographs |
| | `#fff` [verified, index.html inline `:root`] |
| | pale yellow `--c-accent`, seen only as the selection text colour |
| | `#f9ef93` [verified, index.html `::selection`] |
| | unused-looking reserves: `--c-yellow`, `--c-light`, `--c-error` |
| | `#c8a417` [verified, index.html inline `:root`] |
| | `#f1ece2` [verified, index.html inline `:root`] |
| | `#fa5959` [verified, index.html inline `:root`] |
| | browser `theme-color`, which contradicts the bone ground |
| | `#0e0e0e` [verified, index.html `<meta name="theme-color">`] |
| | strategy: ground + ink + one hidden accent, a warm light monochrome; all other colour comes from photographic renders (clouds in a colonnade, dunes) and a single hand-drawn orange stroke [verified, walk/desktop-s25.png, walk/desktop-s75.png] |
| Type | hairline art-deco display caps + editorial serif reading face + wide extended grotesque labels: **Love** (`.h3`, headings at poster scale), **Canela Light / Regular** (`.p1` / `.p2`, body, card titles, form sentences), **Adieu** (`.l3`, nav, buttons, labels) [verified, entry.NhmQQ4cw.css; walk captures]. Canela is from Commercial Type [recalled high]; Adieu from Good Type Foundry [recalled medium]; Love's foundry [unknown]. Scale is locked to artboards `--viewport:1440` / `375` [verified, index.html inline `:root`] |
| WebGL dosage | none — no Three.js, OGL or `getContext` signature in the entry bundle or the fetched chunks [verified, DHmUQlsp.js, chunks/]. One full-viewport canvas (1425 × 900, class `inset` in `.canvas-wrapper`) exists on desktop and not on the phone; what draws it is [unknown] [verified, walk script DOM read] |
| Scroll model | native + smooth library — Lenis `duration 1.2`, `smoothWheel`, driven by `gsap.ticker` with `lagSmoothing(0)`; scrubbed parallax; no pin observed [verified, DHmUQlsp.js; chunks/Dq1AkkTS.js] |
| Narrative model | gallery — a gate, a hero, a statement, five priced works, services, an enquiry, questions; no argument runs between them [verified, index.html section order] |

## 1. Concept and narrative
The idea is a gallery that stands in the sky: a cloud caught inside a classical colonnade, curtains and a parquet floor, over which the display type sits at poster scale in white [verified, gated/desktop-state-entered.png, walk/mobile-s00.png]. The register is quiet luxury: collecting "quietly", pieces that "carry the weight of time" [verified, index.html about copy]. Copy is short and warm; the hero line reads "Balance your Space, and Enter the gallery" [verified, same capture].

Beats seen: a bone-white gate with drifting cloud edges, a serif line "Out of Love for Art", a counter to 100 % and a click-to-enter label [verified, gated/desktop-s00.png]. Then the cloud hero with VISUAL ARTS & DESIGN and SHOP NOW; a "WE ARE" statement split across the width, with a founder credit and a looping orange hand-drawn line [verified, walk/desktop-s25.png]. Five catalogue cards with prices or "price by enquiry" and a giant underlined VIEW CATALOGUE link [verified, walk/desktop-s50.png]. A services band ("Decoration") [verified, walk/mobile-s50.png], "FIND NEW CREATIONS FOR YOUR SPACE" over a dune photograph with the enquiry card, a local clock, FAQ in two tabs (Buyers / Artists), and a newsletter footer [verified, walk/desktop-s75.png, walk/mobile-s75.png, walk/desktop-s100.png].

## 2. Structure and components
- **Gate / preloader**: a GSAP tween counts `0 → 100` over **4 s** with `roundProps`, a timer rather than a load signal. Only then does the whole `.preloader` take a click, with a cursor-following "click to enter" label ("enter" on phones). A repeat visit skips it through `sessionStorage.preloaderPlayed` [verified, DHmUQlsp.js preloader component].
- **Header**: MENU, CATALOGUE, a sound toggle (`/audios/main.mp3`), the signature-plus-caps wordmark, a currency select, CART (0), CONTACT [verified, gated/desktop-state-entered.png; index.html; gated/manifest.json failed-request list].
- **Menu overlay**: five numbered links in display caps, each line offset on its own indent, with e-mail, socials and phone in a bottom row; Escape closes [verified, gated/desktop-state-gate-keyboard.png; DHmUQlsp.js `keydown` `Escape`].
- **Hero**: display title, a drawn SVG arrow, SHOP NOW, and an auto-scrolling drag rail of works behind it [verified, chunks/CzjTch_b.js `HeroSlider`; gated/desktop-state-entered.png].
- **About**: "WE ARE" split across the page, two paragraphs, founder chip, an orange line drawing [verified, walk/desktop-s25.png].
- **Catalogue**: a "Catalogue /" ticker, five cards (title + price in wide caps), a hover label, and the underlined VIEW CATALOGUE link [verified, index.html; chunks/D-mRI1os.js `Card`].
- **Enquiry**: a **sentence-shaped form**. Each fragment ("Hello! My name is", ", this is my email", "i'm the") is the `<label>` wrapping its own input or radio group [verified, index.html `<label class="form__field">`; walk/mobile-s75.png]. Response time and a Dubai clock that rolls its minutes sit beside it [verified, index.html; chunks/CzVZRVPT.js `Clock`].
- **FAQ**: numbered accordion in two audiences [verified, walk/desktop-s100.png; chunks/2IsPbDXD.js].
- **Footer**: contacts, newsletter field, legal links [verified, walk/desktop-s100.png]. 404: [unknown], not visited.

## 3. Visual language
- One warm light world held end to end: the bone ground carries a faint cloud texture on every section, and brown ink replaces black everywhere, including the buttons, which are small solid brown tags with bone caps [verified, walk captures].
- **Type contrast as the main device**: hairline condensed capitals at 150–200 px against small tracked extended caps at about 12 px, with a soft serif for reading between them. Headlines break into staggered lines and indents (the menu, "FREQUENTLY ASKED QUESTIONS") [verified, gated/desktop-state-gate-keyboard.png, walk/desktop-s100.png].
- Imagery: photoreal renders of impossible interiors and one dune photograph; the works themselves were meant to carry colour [verified, walk/desktop-s75.png; inferred for the works, which did not load].
- Browser surfaces: the selection is brown with pale-yellow text [verified, index.html]; the scrollbar is hidden [verified, index.html `::-webkit-scrollbar{display:none}`]; `theme-color` is near-black against a bone page [verified, index.html].

## 4. Motion and effects (with parameters)
- **Three named curves**: `default-ease (.31,.13,.11,1)`, `arrow-ease (.83,0,.17,1)`, `mask-ease (.65,0,.35,1)` via CustomEase; CSS `--transition .4s` on the default curve [verified, DHmUQlsp.js; index.html `:root`].
- **Gate exit**: `.preloader-anim` to `autoAlpha 0` over `1.5 s`; the ticker rows fly apart, `xPercent ±30` and `yPercent ±100`, each with a random delay up to `.3 s` [verified, DHmUQlsp.js].
- **Character splay**: per word, `perspective 1000`; each character goes to `x = ±200 × distance from the word's centre`, `y = 60 × index`, `rotationY −270`, `rotationZ ±8 × distance`, `1.2 s` default-ease, triggered at `center bottom`. Words fan open from their middle like a deck [verified, chunks/CzjTch_b.js, chunks/Dq1AkkTS.js].
- Hero intro: parts at `autoAlpha 0 → 1`, `.6 s`, stagger `.05`, arrow-ease, then the arrow is drawn `drawSVG 0 → 100 %` in `1.6 s` [verified, chunks/CzjTch_b.js]. Hero photo parallax `yPercent −8.33 → 8.33` [verified, same].
- **Drag rail**: auto-scrolls at `.5` by default, 16 px gaps, wraps with a `modifiers` x; slides scale by `1 + |v| × .001` with velocity clamped to ±100 [verified, chunks/HF9kZAw3.js]. The first slide drops from `yPercent −120, rotate 20`, scrubbed once; auto-scroll stops when the about section reaches centre [verified, chunks/CzjTch_b.js].
- Mask reveal: `maskSize → "220% 220%, 100%"` on mask-ease [verified, chunks/CzjTch_b.js]. Generic parallax: `yPercent −s → s`, `scrub:true`, `ease:"none"` [verified, chunks/Dq1AkkTS.js].
- Cursor labels follow the pointer with a **new `gsap.to` every frame** (`.4 s`, default-ease) instead of a `quickTo` [verified, chunks/BF76eLDg.js `Drag`].
- Clock: the minute digit rolls `yPercent −100` in `.8 s` [verified, chunks/CzVZRVPT.js].
- No reduced-motion branch anywhere in the served CSS or JS [verified, `reduced-motion` absent from all fetched files].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| Nuxt 3.17.5, SSR HTML with content | [verified, DHmUQlsp.js; index.html] |
| GSAP 3.13.0 + eight plugins | [verified, DHmUQlsp.js] |
| Lenis 1.3.4 on the GSAP ticker | [verified, DHmUQlsp.js `ticker.add(e=>{…raf(e*1e3)})`] |
| Stripe, Pinia, CMS media on `cdn.boyd.ae` | [verified, DHmUQlsp.js; index.html] |

- Weight: the entry module is 567 KB uncompressed and holds GSAP, every plugin and Lenis; 30 route chunks and styles are prefetched [verified, `wc -c`; index.html `rel="prefetch"`].
- **The media host is dead**: `cdn.boyd.ae` and `boyd.ae` do not resolve, so every catalogue image, the founder portrait and the OG image fail; 232 failed requests on desktop [verified, `getent hosts`, gated/manifest.json, walk/desktop-s50.png]. The award entry predates this; the works were visible when it was judged [inferred].
- The soundtrack MP3 is requested at boot, before any sound opt-in [verified, gated/manifest.json].
- Responsive: artboard vars 1440 / 375; the phone gets its own stacked hero and form [verified, walk/mobile-s00.png, walk/mobile-s75.png].

## 6. Weaknesses
- Reduced motion: **partial**. There is no branch, but the entered page reads at rest [verified, walk/desktop-rm-s25.png matches walk/desktop-s25.png]. The 4 s gate still runs [verified, gated/desktop-rm-s00.png].
- Keyboard: **fail**. The gate takes a pointer click only. Tab + Enter reaches MENU behind it and opens the overlay while the gate is still up. There is no `:focus-visible` rule, and `outline:none` appears three times [verified, gated/desktop-state-gate-keyboard.png; index.html; walk script DOM read].
- DOM behind the canvas: **pass**. Content, prices and form are server-rendered [verified, index.html]. There is no `<nav>` landmark, and the enquiry form is properly labelled [verified, same].
- Load gate: **fail on first visit**. A fixed 4 s count, then a click; it is skipped on a repeat visit [verified, DHmUQlsp.js].
- Phone: **designed**, stacked hero and a full-width form card [verified, walk/mobile-s00.png, walk/mobile-s75.png].
- Wayfinding and conversion: **fail today**. The catalogue shows titles and prices over empty frames because the image CDN is gone [verified, walk/desktop-s50.png]. Copy has template leftovers: a consent line naming "discover market", `<meta name="title" content="Title">` and a garbled keywords string [verified, index.html].

What the awards skills do differently: a gate that counts a real signal and holds at 100, with a focusable enter button, an Enter key path and a skip on repeat `[recipe:preloader-counter-hold]`; sound fetched only after the visitor opts in `[recipe:sound-toggle-opt-in]`; `quickTo` for cursor followers `[recipe:cursor-two-speed]`; a static tier that turns off the splay `[recipe:reduced-motion-switch]`; media on the site's own origin, so it cannot outlive its host.

## 7. Principles
1. **Let the type contract carry the luxury.** A hairline display cut at poster scale, a soft reading serif and tiny extended caps give three distinct voices from one warm ink, with no second colour needed.
2. **Make the enquiry a sentence the visitor completes.** When each fragment of prose is the label for its field, the form keeps the site's voice and stays accessible.
3. **Animate letters from the word's own centre.** Tying offsets to distance from the middle makes a reveal read as the word opening, not as a stagger.
4. **Tint the whole world, including the chrome.** Brown instead of black on buttons, selection and rules keeps one temperature from the first viewport to the footer.
5. **An impossible interior sells the space the work will live in.** Staging the product's future setting can set the mood before any product appears; it only works if the products then load.

## 8. Take / Don't take
- **Take:**
  - The sentence-form enquiry: prose fragments as `<label>`s wrapping inputs and a radio group, set in the reading serif, with the "type…" placeholder as the blank. No recipe covers it yet.
  - The splay parameters as a starting point: offsets scaled by distance from the word centre, a deep `rotationY`, about 1.2 s on an expo-like out curve, with a static tier and SplitText run after fonts `[recipe:split-text-masked-reveal]`.
  - Three named curves for three jobs: the default out curve, a symmetric in-out for drawn arrows, and a softer in-out for masks.
  - An auto-drifting drag rail that pauses when the next chapter takes the centre `[recipe:horizontal-rail]`.
- **Don't take:**
  - The palette as literal values:
    - `#ece6d6` [verified, index.html]
    - `#66514b` [verified, index.html]
    - `#f9ef93` [verified, index.html]
    - `#0e0e0e` [verified, index.html]
  - The cloud-in-a-colonnade hero, the dune backdrop, the looping orange line, and Love + Canela + Adieu as a set.
  - The lines "Out of Love for Art" and "Balance your Space", and the order gate → hero → statement → catalogue → services → enquiry → FAQ.
  - A timer-based click-to-enter wall, a hidden scrollbar, `outline:none`, a boot-time soundtrack request and a third-party media host: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, entry bundle, CSS, 16 route chunks |
| Award and credits | high — entry page text and capture |
| Concept, structure, visual language | high for the entered page (desktop, phone and reduced-motion frames); catalogue images not seen |
| Motion parameters | high — read from the bundle and chunks; the splay and rail were not observed in motion |
| Weaknesses | high for gate, keyboard, reduced motion, dead CDN; 404, product, cart and catalogue routes not visited |

**Live pass 2026-09-23: reachable, gated.** The first `capture.mjs` run (scroll 0–100, mobile, reduced motion) returned only gate frames (`desktop-s00`, `mobile-s00/s25/s75/s100`) and hung on the desktop wheel pass; it was stopped. A second run into `gated/` with a click-then-scroll state plan exited 0. It kept `desktop-s00`, `desktop-state-entered`, `desktop-state-gate-keyboard` and their reduced-motion twins; the scroll states timed out on page load. The five scroll states were then taken by a scripted walk with the same Playwright and Chromium. It clicked `.preloader`, then called `window.scrollTo` at 0/25/50/75/100 % into `walk/`, for desktop 1440 × 900, phone 390 × 844 and desktop with reduced motion. Sources in `.awards/research/the-boyd/`: `index.html`, `DHmUQlsp.js`, three CSS files, `chunks/` (16 JS files), `states.json`, `gated/manifest.json`. The award entry `awwwards.com/sites/boyd` was found with one search, captured desktop-only into `entry/` (exit 2), and its HTML was read as `entry/entry.html`.
