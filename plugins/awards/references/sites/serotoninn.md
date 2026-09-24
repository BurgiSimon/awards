# Serotoninn — https://serotoninn.com/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | e-commerce — the shop of an independent Ukrainian womenswear label. Products, prices, sizes, a bag, favourites and search sit on the home page [verified, index.html `#all-products-data`; retry/desktop-s25.png "(UA)"; entry page "young womenswear brand"] |
| Visitor mode | persuade — the bag, SHOP ALL and a "see collection" call on every hero look, plus a footer discount sticker [verified, mobile-s25.png, mobile-s100.png] |
| Awards | Awwwards **Site of the Day, 4 Aug 2026, 7.37**: D 7.29 / U 7.24 / C 7.76 / Co 7.30. **Developer Award 7.32**: Semantics/SEO 7.40, Animations 7.60, Accessibility 6.60, WPO 7.40, Responsive 7.40, Markup 7.20 [verified, entry page, `entry/entry.html`, `entry/desktop-s00.png`] |
| Corpus rating | D 7.0 / U 5.8 / C 7.0 / Co 6.6 → weighted 6.60, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | BL/S® PRO, Serhii Polyvanyi, Artycoders, Vladyslav Litovka [verified, entry page, `entry/desktop-s25.png`] |
| Stack (evidence level) | **WordPress** with a custom theme `ref`, PageSpeed-rewritten assets, PixelYourSite, jQuery 3.7.1 [verified, index.html] · one Vite-style ESM bundle `loader.js` holding **GSAP 3.14.2** + ScrollTrigger, SplitText and CustomEase [verified, loader.js `version="3.14.2"`, `registerPlugin(ScrollTrigger,SplitText,CustomEase)`] · **Lenis 1.1.20** [verified, loader.js `version="1.1.20"`] · **lottie-web 5.13.0**, canvas renderer [verified, loader.js `lottie.version="5.13.0"`; footer-anim.js] · Swiper, version unread [verified, loader.js] · Fancybox 5.0.36 [verified, loader.js `data-fancybox`, `"5.0.36"`] · fonts: Thunder (nine weights) and PP Fraktion Mono self-hosted, Inter from Google Fonts [verified, main.css `@font-face`; index.html] |
| Palette | ground, warm off-white |
| | `#fff9f7` [verified, main.css] |
| | ink |
| | `#000` [verified, main.css] |
| | the one accent, red `--Red-Main` (section numbers, keywords inside body copy) |
| | `#ed3833` [verified, main.css; desktop-s50/s75.png] |
| | a cyan offset on the logo's glitch state |
| | `#2ec1c5` [verified, main.css; desktop-s75.png] |
| | strategy: ground + ink + one accent, with colour-against-greyscale photography as a second axis [verified, main.css `.hero-card__img-bw{filter:grayscale(1)}`] |
| Type | condensed display + mono + grotesque: **Thunder** for display and buttons, **PP Fraktion Mono** for nav and labels, **Inter** 600 uppercase for body [verified, main.css]. A horizontally stretched wide cut shows on category labels and the footer SUBSCRIBE line [verified, mobile-s50.png, desktop-s100.png]; its face is [unknown] |
| WebGL dosage | none — 0 canvases at the top; the one canvas at the close is the Lottie sticker [verified, manifest.json, retry/manifest.json; footer-anim.js `renderer:"canvas"`] |
| Scroll model | native + smooth library — Lenis `lerp .1` on its own rAF, `ScrollTrigger.update` on each Lenis scroll, not on the GSAP ticker [verified, loader.js] |
| Narrative model | gallery — looks, rails and films in a row, with no argument between them [verified, index.html section order] |

## 1. Concept and narrative
The name is a mood-chemistry pun, and the site plays it as a switch between flat and alive. Each hero look is split down a torn-paper edge: one half is in full colour, the other in greyscale, and the torn line is where the mood changes [verified, mobile-s25.png; main.css]. A small `[ 5-HT ]` tag, the chemical shorthand for serotonin, stays in the header [verified, desktop-s50.png; index.html]. The copy has one register, uppercase and adjective-led, with red keywords picked out inside the sentences [verified, desktop-s75.png].

Beats seen: a preloader over a model photo counting a percentage, with a "be yourself" chip [verified, mobile-s00.png, retry/desktop-rm-s00.png]. Then the torn hero, a full-bleed campaign film labelled `03. Campaign` [verified, retry/desktop-s25.png], and category cards with their own film loops [verified, mobile-s50.png; manifest failed-request list]. A "creative freedom" statement over a crouching figure, a "vision in motion" film inside a lips-shaped mask [verified, desktop-s75.png, mobile-s75.png], and a torn-paper footer with a giant wordmark cut by a figure [verified, desktop-s100.png].

## 2. Structure and components
- **Preloader**: a model photo and a counter in condensed display, then a hand-off into the first hero card. Session-gated: `heroIntroDone` in `sessionStorage` skips it on a repeat visit [verified, main.js].
- **Header**: MENU +, SHOP ALL, CATEGORIES +, the `5-HT` tag, the centred SVG wordmark, SEARCH, FAVOURITES.0 and BAG.0 [verified, retry/desktop-s25.png]. Labels scramble in on load [verified, loader.js `HEADER_INTRO_EVENT`]. On desktop, SHOP ALL and CATEGORIES overlap by a line [verified, desktop-s50.png].
- **Hero**: a list of looks, one card each, with a colour layer under a torn-paper image mask over a greyscale twin. It advances every 5 s with vertical scale wipes. The section is pinned from the top until the new-arrivals section reaches the top, with `pinSpacing:false`, so that section slides over it [verified, main.js `I=5`, `pin:r,pinSpacing:!1`].
- **New arrivals**: a product rail, with Swiper on phones [verified, main.js `.arrivals-section__swiper-mob`].
- **Campaign**: a full-bleed film with a ±10 % parallax scrub and `mix-blend-mode:difference` captions [verified, main.js; main.css].
- **Categories**: a draggable row of cards, each with its own film loop, with a cursor badge on desktop [verified, main.css `touch-action:pan-y`; loader.js `window.categoriesDragging`].
- **Bestsellers**: cards behind an image mask. The inner frame opens from `inset(0 15% 0 15%)` to full width over the scroll [verified, main.js; main.css `best_mask_*.webp`].
- **Bold statement**: a cursor-following label in `mix-blend-mode:difference` on desktop ≥ 1024 px, and a Lottie revealed by a clip wipe [verified, main.js; main.css].
- **Film**: a video inside an SVG lips-outline mask, on a section two viewports tall [verified, main.css `mask:url("data:image/svg+xml…")`, `.motion-section{height:calc(var(--inner-vh)*2)}`].
- **Footer**: a torn top edge (image mask), nav links that scramble in, a Lottie **"discount 10%" sticker that peels** halfway on reveal and fully on hover, a subscribe field and the wordmark cut by a photographed figure [verified, footer-anim.js; main.css `footer_bg_*.webp`; mobile-s100.png].
- **Cursor**: a block-scoped cursor with a looping two-line character roll and springy scale steps. It hides itself over iframes and embeds [verified, custom-cursor.js].
- **Route transition**: every internal link is intercepted. The loader panel drops from −150 to −50 vh, then to 0, before a full page load [verified, loader.js `runPageLoaderTransition`].
- **Consent**: a dashed-border cookie card with brush-stroke buttons, covering the lower right on desktop and half the phone screen [verified, desktop-s75.png, mobile-s50.png].
- 404: [unknown], not visited.

## 3. Visual language
- A warm off-white ground carries almost everything. Black is kept for display type and the brush-stroke buttons, and red appears only as numbers and keywords. The photography is studio white or darkened film, so the palette stays out of the pictures' way [verified, captures; main.css].
- **Paper as material.** Torn edges come from raster masks (`mask_img.webp`, `footer_bg_*.webp`), brush strokes back the buttons, and the sticker peels. Paper and ink are the texture, not noise or glow [verified, main.css; desktop-s100.png].
- Type contrast: section heads in Thunder at poster size, tight and uppercase, with a round black dot as the full stop [verified, desktop-s75.png]. Everything small is mono or tracked Inter in capitals. Body copy is set centred and justified in 0.9–1.2 rem caps [verified, main.css; desktop-s75.png].
- Labels are numbered (`05. Categories`, `07. Serotoninn film`), but the numbers are red section markers, not a navigation index [verified, desktop-s50.png, desktop-s75.png].
- Browser surfaces: the scrollbar is hidden (`::-webkit-scrollbar{display:none}`) and there is no `theme-color` or `color-scheme` [verified, main.css; index.html].

## 4. Motion and effects (with parameters)
- **One ease for everything**: `cubic-bezier(.75,0,.25,1)` registered under seven names (hero, arrivals, campaign, bestsellers, bold, film, loader) [verified, main.js; loader.js]. The cursor has its own: `cursorEase (.20,0,.10,1)` and `textEase (.75,0,.25,1)` [verified, custom-cursor.js].
- **Stretch-up reveals.** Titles, subtitles, SplitText lines and icons enter as `scaleY: 0 → 1` from `transformOrigin: bottom`, `.7 s`, line stagger `.06`, started at `top 75–95%`. This replaces the usual translate-in-a-mask reveal [verified, main.js]. Mid-tween, the text reads as flattened bars [verified, retry/desktop-rm-s00.png, mobile-s50.png].
- **Hero cycle**: the outgoing card goes `scaleY → 0` (origin top) while the incoming goes `scaleY → 1` (origin bottom), `1.5 s`, a second layer offset `.8 s`, a new look every `5 s` [verified, main.js].
- **Alphabet-ladder scramble** in the footer and header: each letter counts up from `a` to itself, `.18 s` per character, `.04 s` stagger [verified, footer-anim.js `durationPerChar:.18, stagger:.04`; loader.js `ALPHABET`].
- **Lottie scrubbed by intent**: on reveal the sticker plays frames 0 → 50 % over `.9 s` ease-out-cubic, on hover to 100 % over `.6 s`, and back to 50 % on leave. Fine pointers only; touch plays it through [verified, footer-anim.js].
- Footer entrance: logo `yPercent 300 → 0` and image `100 → 0`, `1.2 s power3.out`; title `scaleY` `.8 s` at `+.4 s` [verified, footer-anim.js].
- Scrubs: the campaign video `y 10% → −10%`, and the bestseller clip opens `inset 15% → 0` — both `ease:"none"`, `scrub:true` [verified, main.js].
- Cursor: enters at `scale .4 → 1.05 → .9 → 1` (`.167 / .133 / .167 s`) and shrinks to `.8` on press. Its label rolls characters `yPercent ±105`, `.35 s`, stagger `.1`, with a 2 s hold [verified, custom-cursor.js].
- Route curtain: `.8 s` to half, `.8 s` to full, then `location.assign` [verified, loader.js].
- Lenis: `lerp .1`, with legacy `smooth` / `smoothTouch:false` options [verified, loader.js]. No reduced-motion branch anywhere in the served CSS or JS [verified, `prefers-reduced-motion` absent from all fetched files].

## 5. Tech and pipeline
| Layer | Evidence |
|---|---|
| WordPress theme `ref`, PageSpeed module | [verified, index.html `wp-content/themes/ref`, `pagespeed` rewritten URLs] |
| GSAP 3.14.2 + ScrollTrigger + SplitText + CustomEase | [verified, loader.js] |
| Lenis 1.1.20 on its own rAF | [verified, loader.js] |
| lottie-web 5.13.0 (canvas renderer) | [verified, loader.js; footer-anim.js] |
| Swiper (version unread), Fancybox 5.0.36 | [verified, loader.js; loader.css] |
| jQuery 3.7.1 + migrate, PixelYourSite | [verified, index.html] |

- Weight: `loader.js` is 802 KB uncompressed and holds every library. `main.css` is 106 KB. The HTML is 928 KB, because the whole product catalogue with every image variant is inlined as JSON [verified, `wc -c` on the fetched files].
- About a dozen per-category and campaign MP4s are requested up front on desktop [verified, manifest.json failedRequests, aborted on navigation]. The desktop first-viewport screenshot timed out twice, including once with a 6 s wait and a 90 s timeout [verified, manifest.json, retry/manifest.json]. The cold `lcpColdSynthetic` of 43–115 s is a headless artefact, not a performance claim.
- First-run CLS was 1.07 on desktop and 1.01 on mobile; 0.08 on the retry [verified, manifest.json, retry/manifest.json].
- Responsive: one breakpoint set (768 / 1024). `--inner-vh` is set from JS, `lvh` is used on phones, and the cursor label and category cursor are dropped below 1024 px [verified, main.css; main.js].

## 6. Weaknesses
- Reduced motion: **fail**. There is no branch. The loader still counts and squashes its text, and a mid-page frame came back as a blank off-white screen [verified, retry/desktop-rm-s00.png, desktop-rm-s50.png; no `prefers-reduced-motion` in source].
- Keyboard: **fail**. There are no key handlers in the theme scripts, `outline:none` appears once and `:focus-visible` never. The draggable categories row and the cursor labels are pointer-only [verified, main.js, add-to-cart.js, main.css].
- DOM behind the canvas: **pass**. There is no canvas, and products, prices and links are all in the served HTML. But 308 of 366 images have `alt=""` on a shop, and there is no `<nav>` landmark and no skip link [verified, index.html].
- Load gate: **partial**. The preloader is skipped on a repeat visit through `sessionStorage` [verified, main.js]. Every internal click still runs a 1.6 s curtain before a full reload [verified, loader.js].
- Phone: **designed**. It has its own header, a snap rail and a vertical torn split [verified, mobile-s25.png, mobile-s50.png]. The consent card covers half of every phone frame [verified, mobile-s50/s75/s100.png].
- Wayfinding and conversion: **partial**. The bag and SHOP ALL are always visible, but the numbered labels skip (03, 05, 07) and do not navigate. The desktop header collides at SHOP ALL / CATEGORIES [verified, desktop-s50.png, retry/desktop-s25.png].

What the awards skills do differently: a static tier where every stretch-up reveal simply rests at `scaleY:1` `[recipe:reduced-motion-switch]`; a keyboard path and visible focus for the drag row and every card `[recipe:horizontal-rail]`; product imagery with real alt text; films loaded when their section nears, not at boot; route curtains that are skipped when motion is reduced `[recipe:page-transitions]`.

## 7. Principles
1. **Split the subject along the brand's idea.** One image in two states, divided by an edge that carries the material (here, paper), makes the thesis visible before a word is read.
2. **One curve, many names.** Registering a single cubic under per-section names lets each section be tuned later while the whole page moves in one accent today.
3. **Reveal on the axis the type is built on.** A condensed face revealed by vertical scale from its baseline reads as the letters standing up. The reveal belongs to the face, not to a generic mask.
4. **Scrub a vector animation with intent, not time.** Parking a Lottie at half on arrival and finishing it on hover turns a decoration into an invitation that still reads on touch.
5. **Keep the texture physical and the palette spare.** Torn edges, brush strokes and a peeling sticker give a shop its hand when the colour is only ground, ink and one accent.

## 8. Take / Don't take
- **Take:**
  - The two-state hero: a colour layer under an organic raster mask over a filtered twin of the same image, advanced by opposed-origin `scaleY` wipes (≈ 1.5 s, one shared in-out cubic), with a static single-state fallback. The nearest interactive cousin is a compare divider `[recipe:compare-hold-drag]`; here the edge is authored and the cycle is automatic.
  - Baseline-anchored `scaleY` reveals for condensed display type, ≈ .7 s, line stagger ≈ .06, and resting at 1 when motion is reduced `[recipe:split-text-masked-reveal]`.
  - An alphabet-ladder scramble for short uppercase labels (≈ .18 s per character, ≈ .04 s stagger), with the final text in the DOM from the start `[recipe:scramble-decode-text]`.
  - Hover-progress Lottie: park at a fraction on reveal, finish on hover, return on leave, and play through on coarse pointers.
  - A pinned hero with `pinSpacing:false` so the next section slides over it `[recipe:sticky-stages-rails]`.
- **Don't take:**
  - The palette as literal values:
    - `#fff9f7` [verified, main.css]
    - `#ed3833` [verified, main.css]
    - `#000` [verified, main.css]
    - `#2ec1c5` [verified, main.css]
  - The torn colour-and-greyscale split as-is, the lips-shaped film mask, the peeling discount sticker or the brush-stroke buttons. Together they are the signature.
  - The `5-HT` pun, the "be yourself" or "creative freedom" lines, and the red keywords inside justified uppercase body copy.
  - Thunder + PP Fraktion Mono + Inter as a set, and the section order hero → arrivals → campaign → categories → bestsellers → statement → film → footer.
  - A hidden scrollbar, `outline:none`, empty alt on products, and a full-page curtain on every click: these are what to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML, theme bundle, theme CSS |
| Award and credits | high — entry page text and captures (SOTD date, axis and developer scores, credits) |
| Concept, structure, visual language | medium-high — five phone frames and four desktop frames; the desktop first viewport was never captured |
| Motion parameters | high — read from main.js, loader.js, footer-anim.js, custom-cursor.js |
| Weaknesses | high for reduced motion, keyboard, alt and load gate; 404, product pages and menu-open state not observed |

**Live pass 2026-09-23: reachable, capture exit 2.** The aborted MP4 requests and screenshot timeouts are in the manifest, and `scrollMode: native` held. The desktop `s00` and `s25` frames timed out. One retry with `--wait 6000 --timeout 90000` into `retry/` recovered `desktop-s25`, `desktop-rm-s00` and `desktop-rm-s25`; `desktop-s00` timed out again. Sources in `.awards/research/serotoninn/`: 11 + 3 captures with two `manifest.json` files, `index.html`, and `src/` (loader.js, main.js, footer-anim.js, custom-cursor.js, arrivals-anim.js, video-load.js, add-to-cart.js, main.css, loader.css, arrivals-anim.css). The award entry `awwwards.com/sites/serotoninn` was found with one search, captured desktop-only into `entry/` (exit 2, a cookie wall over the frames), and its HTML read as `entry/entry.html`. Not observed: the desktop first viewport after the loader, the open menu and categories, product and cart routes, and the 404.
