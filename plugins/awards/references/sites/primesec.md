# Prime Security — https://www.primesec.ai/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | B2B product — an agentic product-security platform (design reviews, code reviews, guardrails for coding agents) [verified, index.html `<title>` and meta description] |
| Visitor mode | persuade — *Book a demo* in the nav, the hero, every capability tab and the close [verified, desktop-s00.png; index.html] |
| Awards | none found — one search on 2026-09-23 returned no Awwwards, CSSDA or FWA entry [verified, search 2026-09-23]; official scores none |
| Corpus rating | D 7.4 / U 6.5 / C 7.2 / Co 6.8 → weighted 7.03, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | studio [unknown]; the 3D module and its models are served from the GitHub repository `MilovanovicMatija/prime` through jsDelivr [verified, index.html `<script type="module">` URL]; Webflow project named `p-security` [verified, stylesheet file name] |
| Stack (evidence level) | **Webflow** shell with IX3 [verified, index.html `data-wf-site`, `w-mod-ix3`] · **GSAP 3.15.0** + ScrollTrigger + SplitText from Webflow's CDN [verified, index.html `cdn.prod.website-files.com/gsap/3.15.0/`], and a second GSAP 3.15.0 bundled into the module [verified, main.js `version="3.15.0"`] · **Lenis twice**: 1.0.23 page-level from jsDelivr [verified, index.html `studio-freight/lenis@1.0.23`] and 1.3.23 bundled [verified, main.js `"1.3.23"`] · **Three.js r169** [verified, main.js `REVISION "169"`] with GLTFLoader + DRACOLoader; KTX2Loader and MeshoptDecoder are in the bundle [verified, main.js] · Vite-style hashed module `assets/index-DM4qWrvI.js` [verified, index.html] · **Swiper 11** [verified, index.html] · jQuery 3.5.1 [verified, index.html] · Finsweet cookie consent, GTM, Apollo, LinkedIn [verified, index.html] · fonts self-hosted on the Webflow CDN, plus Montserrat 100–900 via Google WebFont loader [verified, webflow.css `@font-face`; index.html] |
| Palette | ground `--bg` / `--neutral--black`, near-black |
| | `#1a1a1a` [verified, index.html `.three-styles` embed; webflow.css] |
| | ink `--n100` / `--neutral--neutrals-100`, bone off-white |
| | `#f5f5f0` [verified, same] |
| | the one accent `--accent` / `--base--yellow`, acid yellow |
| | `#f9fe2e` [verified, same] |
| | secondary text, warm grey |
| | `#b8b8b5` [verified, webflow.css `--base--light-grey`] |
| | disabled list headings and numbers |
| | `#343434` [verified, index.html inline "why" script] |
| | strategy: near-black ground + bone ink + one acid-yellow accent; marble statuary is the second material [verified, captures] |
| Type | one grotesque and its mono sibling: **TT Interphases Pro** (Regular / Medium / Bold) for display and body, **TT Interphases Pro Mono** variable for labels; every file is a **Trial** cut [verified, webflow.css `@font-face` URLs `TT_Interphases_Pro_Trial_*.woff2`]. Hero lines `min(4.8vw, 78px)`, weight 500, −.02em; end-text lines 130/130 px [verified, index.html `.three-styles`]. A comic-lettering face (CC Legendary Legerdemain) and Montserrat are declared but not used on the home page [verified, webflow.css; `comic` absent from index.html] |
| WebGL dosage | moments — one canvas, one Three.js scene living on a 1480vh sticky stage; everything after the stage is DOM [verified, index.html `.stage-scroll{height:1480vh}`; manifest.json `canvases: 1`] |
| Scroll model | native + smooth library in name only: the stage's Lenis runs at `lerp: 1` with `smoothWheel: false` unless `?smooth` is in the URL; a second, page-level Lenis runs at `lerp: .15`; the 1480vh CSS-sticky stage feeds one progress value to a hand-written state machine [verified, main.js; index.html inline script; manifest.json `scrollMode: native`] |
| Narrative model | specification — an animated mascot introduces the claim, then five capabilities, proof and a numbered rationale [verified, captures] |

## 1. Concept and narrative
The idea is a pun on the name: a classical marble philosopher, in his prime, fitted with one acid-yellow piece of present-day kit. The first viewport is the bust in yellow smart glasses between a two-part headline split left and right [verified, desktop-s00.png]. Scrolling drives the stage: the headline halves slide apart and the hero copy fades, three counted-up stats take over (a 15-minute review, 100 % coverage, 90 % fewer false positives), the statue dissolves away, and three lines about *before*, *in* and *after* the code fill in one after another, the last closing on a carved stone prompt tile [verified, main.js stage functions; index.html `data-stage` markup]. A second act turns the stage into five capability tabs, each with its own statue and prop; for coding agents the figure wears headphones and holds a yellow game controller [verified, desktop-s50.png]. The page closes on a reclining philosopher with sunglasses, a laptop and a cocktail on a column capital, above an outsized wordmark [verified, desktop-s100.png]. Copy register is short-sentence B2B: "You don't trigger reviews. Prime does." [verified, index.html].

## 2. Structure and components
- **Preloader**: full-screen near-black panel over a grid SVG, a large tabular-numeral counter and a 2 px yellow bar [verified, index.html `#preloader`].
- **Announcement bar**: yellow strip above the nav with a report link and a close button [verified, desktop-s00.png].
- **Nav**: logo, five links with a Use Cases dropdown, *Log in*, a yellow *Book a demo* pill; after 80 px it becomes a rounded glass capsule [verified, desktop-s00/s50.png; inline nav script `end: "+=80"`]. Below 992 px it is a hamburger with a grid-rows reveal, Escape to close, Lenis stopped while open [verified, inline script].
- **The stage** (act 1): split headline → stat trio → dissolve → three-line fill + stone tile; a client-logo marquee shows only between 40 % and 56 % of act 1 [verified, main.js `show-marquee`].
- **Statement**: a scrubbed word-by-word opacity rise from .36 to 1 [verified, main.js].
- **Capability tabs** (act 2): five scroll-driven tabs with a bottom nav of labels and progress fills; clicking a label cross-fades in 700 ms, then jumps the scroll [verified, main.js; desktop-s50.png]. On the phone the same content is an accordion list [verified, mobile-s50.png].
- **Testimonials**: a centred, looping Swiper of yellow quote cards flanked by rotated rock fragments, arrow buttons, pagination and a draggable scrollbar [verified, desktop-s75.png; inline Swiper config].
- **Why list**: a 180svh wrapper with a 100svh sticky panel; scroll progress picks one of the numbered items, which expands while the rest grey out [verified, inline script].
- **Close**: a CTA with a transparent WebM, certification medallions, four link columns, a sliding giant wordmark and a mono copyright line [verified, desktop-s100.png; inline footer script].
- No custom cursor, no page-transition library, no 404 observed [verified, negative, index.html; 404 unknown].

## 3. Visual language
One dark field held from top to bottom, with yellow reserved for actions, the announcement bar and the props the statues wear [verified, captures]. The world's material is photoreal marble — busts, a full figure, a chaise, a column, loose stone fragments, a carved prompt tile — against flat near-black, so the only warm surface is stone and the only saturated one is yellow [verified, desktop-s00/s50/s75/s100.png]. A thin grey line grid sits under the stage and is masked away as act 1 ends [verified, main.js `.grid-bg` mask]. Type is a single grotesque at display scale with a wide gap between the 78 px headline and the 14 px uppercase mono nav labels [verified, index.html]. Buttons are full pills, and a per-character split hover (`button-066`) alternates the direction of each letter [verified, inline script]. Browser surfaces: separate light- and dark-scheme favicons, no `theme-color` [verified, index.html].

## 4. Motion and effects (with parameters)
- **Load**: the counter follows glTF progress capped at 92 (`power1.out`, .5 s steps), runs to 100 in .4 s `power2.out` on ready, then the panel slides up in .85 s `cubic-bezier(.76,0,.24,1)` and is removed at 950 ms; a 12 s timeout forces it [verified, main.js; index.html]. It plays on every visit (no storage calls) [verified, main.js].
- **Stage clock**: one progress value from the sticky stage; beats are windows through a smootherstep (6t⁵ − 15t⁴ + 10t³); act 1 is the first 37.5 % and act 2 starts at 50.5 % on desktop [verified, main.js].
- **Hero exit**: the headline halves translate ±52vw (115vw below 1024 px) over the first 18 % of act 1; entrance on load is ±90 px, 1.1 s `power3.out` [verified, main.js].
- **Camera**: keyframed positions and targets along progress, reached with a framerate-independent `lerp(target, 1 − .001^dt)` [verified, main.js].
- **Statue**: a glTF animation clip is scrubbed by progress (mixer time = start + p × length); the head turns toward the pointer; pointer smoothing .03 per frame; an idle bob of `sin(t × .8) × .012` [verified, main.js].
- **Dissolve**: the mesh erodes along its height; a value-noise edge (×10, amplitude .09) plus a hashed stochastic feather over .08 units above the front discards fragments, so the edge reads as fine burning grain [verified, main.js shader comment and code].
- **Hover ripples**: a raycast against the statue seeds wireframe ripples at the hit point, with a decaying pointer trail (cut-off .004), a spacing test and a cooldown [verified, main.js].
- **End-text fill**: two stacked copies per line; the fill copy's `clip-path: inset()` opens left to right, then leaves from the left; lines enter from 120 % [verified, main.js].
- **Adaptive quality**: every .5 s the measured frame rate steps DPR by .25 — down below 45 fps (floor 1), up above 57 fps (cap `min(DPR,1.5)` phone, `clamp(DPR,1.5,2)` desktop); antialias only at ≥ 992 px [verified, main.js].
- **Idle gate**: the render loop skips drawing 1.5 s after the last scroll or pointer input unless a transition is busy, and stops while the tab is hidden; dt is clamped to .05 s [verified, main.js].
- **DOM text**: SplitText line and word reveals, `yPercent: 115`, 1 s `power3.out`, stagger .01, delay .5; a scrubbed word fade from .3 [verified, inline script].
- **Marquee**: rAF translate, 26 s per set, three copies, dt clamped to .1 s, not started under reduced motion [verified, inline script].

## 5. Tech and pipeline
See the header table. As served: HTML 253 KB, Webflow stylesheet 251 KB, the 3D module 739 KB uncompressed with Three.js, GSAP and Lenis bundled [verified, byte counts of the fetched files]. Models: `scene.glb` 2.39 MB on desktop, `scene-mobile.glb` 1.31 MB below 992 px, Draco-compressed [verified, HEAD `content-length`; main.js viewport switch; `draco_mesh_compression`]. The CTA's transparent WebM is 1.30 MB and was aborted in all three runs [verified, HEAD; manifest.json `failedRequests`]. Tab plates are WebP from the Webflow CDN [verified, main.js]. GSAP loads twice (Webflow CDN and the bundle) and so does Lenis [verified, index.html; main.js]. DOM 1,747 nodes desktop, 1,772 phone; no console errors; CLS .0027 [verified, manifest.json]. The canvas renders at 1440 px only after the page idles, which is why every desktop frame of the first run timed out [verified, manifest-run1.json].

## 6. Weaknesses
- Reduced motion — **partial**. The module reads the query and zeroes pointer parallax, the idle bob and the hero entrance; the marquee stays still [verified, main.js; inline script]. The scrubbed stage, the dissolve and every SplitText reveal still run, and the reduced frames at s00 and s50 match the full ones [verified, desktop-rm-s00/s50.png].
- Keyboard — **fail for the stage**. Tab labels and the accordion rows are `div`s with click handlers; the page has two `<button>` elements in total and no skip link [verified, index.html]. The Swiper carousels do enable arrow keys [verified, inline config].
- DOM behind the canvas — **pass**: the headline, stats, tab titles and copy are real markup [verified, index.html]. The canvas carries no `aria-hidden` and no fallback [verified, index.html].
- Load gate — **fail on repeat**: up to 12 s on a slow link, on every visit [verified, main.js].
- Phone — **designed**: a separate lighter model, the tabs as an accordion, a stacked footer [verified, mobile-s50/s100.png; main.js].
- Wayfinding and conversion — **pass**: the demo pill is on screen throughout and act 2 labels the current tab [verified, captures].
- Content defects: every client logo's alt reads "EON logo"; 51 of 76 images have empty alt; production ships trial font files [verified, index.html; webflow.css].
- Engineering: two Lenis instances and two GSAP copies drive one page; the long title of the third tab slides under the tab bar in both desktop runs [verified, index.html; main.js; desktop-s50.png, desktop-rm-s50.png].

What the awards skills do differently: one ticker and one smooth-scroll instance; a stepped reduced tier that lands each stage beat on its end state; real `<button role="tab">` controls with arrow keys for any scroll-driven tab set; a preloader that is skipped on a repeat visit `[recipe:preloader-counter-hold]`.

## 7. Principles
1. **A mascot beats a metaphor diagram.** One recurring figure with one constant prop colour can carry five abstract capabilities without a single interface screenshot.
2. **Let the accent live on the props.** When the brand colour appears only on objects the character holds or wears, the colour reads as the product entering an old world.
3. **Dissolve the hero to change the subject.** An erosion that removes the object clears the stage for type and marks a chapter break without a cut.
4. **Govern quality by what you measure.** Frame-rate-driven DPR steps and an idle render gate keep a heavy stage viable on weak hardware without a device list.
5. **One clock, many windows.** A single stage progress sliced into eased windows keeps a dozen beats in sync and makes every state reproducible from a number.

## 8. Take / Don't take
- **Take:** the single progress value with smootherstep windows `[pattern:motion-vocabulary#sticky-stages-and-hinges]` `[recipe:sticky-stages-rails]`; the mesh erosion as a narrative shader tied to one beat `[pattern:webgl-architecture#unifier-versus-narrative-shaders]`; runtime frame-rate DPR steps layered on the one-time probe `[recipe:quality-tiers]`; an idle render gate on the shared ticker `[pattern:webgl-architecture#scene-windows-and-disposal]`; a separate lighter model below a breakpoint `[pattern:responsive-strategy#mobile-gl-budget]`; the two-layer clip-path line fill `[pattern:motion-vocabulary#text-effects]`; the counter capped below 100 until a real ready signal `[pattern:preloaders-and-transitions#the-load-contract]`.
- **Don't take:**
  - marble classical statues wearing modern gadgets — the signature as is, and a well-worn internet trope;
  - the pun on the brand name and the headline split around the figure;
  - the before / in / after the code triptych, the stat trio and its numbers;
  - the near-black ground
    `#1a1a1a` [verified, index.html]
  - the bone ink
    `#f5f5f0` [verified, index.html]
  - the acid yellow as the sole accent
    `#f9fe2e` [verified, index.html]
  - TT Interphases Pro and its mono as a pairing, and shipping trial cuts;
  - the two-Lenis, two-GSAP setup and `div` tab controls.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — index.html, webflow.css, main.js, webflow.js |
| Awards and credits | high for "none found" (one search); studio unknown |
| Concept, structure, visual language | high — desktop s00/s50/s75/s100, phone s00–s100, reduced s00/s50/s75/s100 |
| Motion parameters | high — read from main.js and the inline scripts |
| Weaknesses | high for markup and code; the keyboard walk was read from source, not driven |

Live pass 2026-09-23: reachable (Webflow CDN). First capture run: exit 2 with 14 of 15 frames lost to screenshot timeouts (kept as `manifest-run1.json`). One retry with `--wheel 12000 --wait 6000 --timeout 90000`: exit 2, `scrollMode: native`, 13 of 15 frames, `desktop-s25` and `desktop-rm-s25` lost to timeouts. A cookie-consent panel covers the lower right of every desktop frame and the lower half of every phone frame. The manifest's LCP figures are a headless cold-cache artefact and are not reported. Sources: `.awards/research/primesec/` — `index.html`, `webflow.css`, `webflow.js`, `main.js`, `manifest.json`, `manifest-run1.json`, the 13 PNG captures; HEAD requests for the two models and the WebM.
