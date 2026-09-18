# Oryzo AI — https://oryzo.ai/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

<!-- Provenance: oryzo.ai, awwwards.com, blog.lusion.co and tympanus.net were unreachable; awards, scores, hexes and the studio's own statements were read through search-result extraction and are labelled [recalled …] at the report's confidence. Lusion's two GitHub repositories (`lusionltd/ORYZO-1`, `lusionltd/WebGL-Scroll-Sync`) were fetched directly and are [verified]. -->

| Field | Value |
|---|---|
| Class | campaign — a satirical product-launch site for a fictional AI-era product, a cork coaster; a self-initiated Lusion Labs project about a year in the making, doubling as comedy, capability showcase and a complete fake go-to-market campaign [recalled high — Lusion BTS / Codrops via search] |
| Visitor mode | experience (a deadpan parody of persuade) |
| Awards | Awwwards Site of the Day, 14 April 2026 — 7.86: Design 7.9 · Usability 7.51 · Creativity 8.35 [recalled high — awwwards.com via search]; Content [unknown] (≈ 7.77 is implied by the 40/30/20/10 weighting) [inferred — arithmetic] · tags: Art & Illustration, Design Agencies, Web & Interactive, Transitions, Storytelling, 3D, Filters and Effects; technologies WebGL, GSAP, Three.js [recalled high] · four standalone Awwwards inspiration entries: Intro Interaction, Footer Interactive Particles, Desktop, Mobile [recalled high] · CSS Design Awards (49111) and CSS Winner (19168) [recalled high] · Motion Design Awards, "Oryzo Main Promo" (the launch film) [recalled high] · Utsubo's best Three.js sites of 2026; a three.js forum showcase thread [recalled medium] |
| Studio / credits | Lusion — digital production studio, Bristol, UK, founded 2017 by Edan Kwan [recalled high — Codrops / lusion.co via search]; disciplines per their own BTS index: concept and creative direction, 3D, motion graphics, visual systems, UX/UI, illustration, WebGL/Three.js engineering, film [recalled high]; per-person credits [unknown] |
| Stack (evidence level) | framework: [unknown], almost certainly custom with no CMS for a one-off campaign [inferred] · animation: GSAP [recalled high — Awwwards tag] · 3D: vanilla Three.js, not React Three Fiber, chosen for finer control [recalled high — Awwwards tag + Utsubo + Lusion's stated preference] · scroll/canvas: Lusion's published `WebGL-Scroll-Sync` technique (MIT, 367 stars, Vite demo, updated April 2025) [verified — GitHub README; its use on Oryzo specifically is inferred] · other: the open-weight artefact `lusionltd/ORYZO-1` (MIT, six OBJ checkpoints, `paper.pdf`; 90 stars, 9 forks) [verified — GitHub] · hosting: [unknown] · fonts: [unknown] |
| Palette | four values — a cream [hex unknown], a warm near-black #100904, a muted olive [hex unknown], an orange #FF8539 [recalled high — the four-value system from Lusion BTS part 3 via search; the two hexes from Awwwards extraction]; strategy: restrained — everything quiet so that two or three designated moments can be loud |
| Type | one family at roughly 99 % of the type [recalled high — Lusion BTS part 3]; face [unknown]; contract: one characterful family at display scale [inferred] |
| WebGL dosage | canvas-first — hero object, desk scene, extreme-zoom section, interactive particle footer [recalled medium-high] |
| Scroll model | native — no scroll-jacking; the canvas is `position: absolute` and re-offset every rAF to the current scroll position (the house technique) [verified — WebGL-Scroll-Sync README; application to Oryzo inferred] |
| Narrative model | single-object launch [recalled high] |

## 1. Concept and narrative
- **The one idea:** take a deliberately ridiculous object and present it with keynote sincerity. Lusion's own framing: the product was "so mundane that treating it seriously was already funny" [recalled high — BTS part 1 via search]. All the comedy lives in the gap between what the thing is and how seriously it is presented; the site never winks.
- **The world beyond the page:** an "open weight" GitHub release, a Product Hunt launch, a founder video and social content [recalled high]. The GitHub artefact is the sharpest writing: six OBJ checkpoints named like LLM releases — base 26b / 40b / 108b / 145b, instruct 168b, frontier 344b — a fabricated eval suite "WoodenBench" benchmarked "on a single desk and very possibly rigged by us", limitations citing "heavy dependency on gravity, mugs, and human deployment", a `paper.pdf` and an MIT licence [verified — lusionltd/ORYZO-1].
- **Beats on the page [recalled medium]:** an intro interaction → the hero, the object framed as a flagship device → a staged desk scene → an extreme close-up / zoom section → an interactive particle footer.
- **Tone:** deadpan technical-marketing register — AI-launch boilerplate played completely straight. Awwwards' citation: "a cinematic product story that turns an ordinary cork coaster into an immersive digital experience" [recalled high].

## 2. Structure and components
- **Intro interaction** — a gated, interactive entry moment rather than a passive preloader; strong enough to be indexed on its own on Awwwards [recalled high].
- **Hero** — one object with real inertia, physical lighting and reveal-on-interaction; crafted without a full scene [recalled high — BTS part 3].
- **Desk scene** — a staged environment; one of the two or three "loud" moments [recalled high].
- **Extreme-zoom section** — contains the easter egg: tiny tardigrades appear if you linger long enough [recalled high — BTS / Awwwards via search]. The reward is for dwell time, not for a click.
- **Interactive particle footer** — the closing beat, also indexed separately [recalled high].
- **Mobile** — a purpose-built mobile experience, indexed on its own, unusual for a heavy WebGL site [recalled high].
- **Off-site components:** the GitHub "model card", the Product Hunt listing, the founder video, the launch film [recalled high; the repo verified].
- **Nav, cursor, 404:** [unknown].

## 3. Visual language
- **Palette roles:** cream ground, warm near-black ink (#100904), olive as the mid-tone, orange (#FF8539) as the single hot accent [recalled high for the system, hexes from Awwwards]; no pure black — the same warm-shifted neutral logic as [site:lama-lama], [site:floema-jewelry] and [site:shopify-editions-w26].
- **Type:** ~99 % one family; the stated principle is "fewer typefaces, fewer colours, and fewer UI ideas competing for attention" [recalled high — BTS part 3].
- **Illustration** is a major register beside the 3D [recalled high]. AI was allowed into parts of the pipeline without being allowed to define the final look — a boundary the studio states explicitly [recalled high]; the same "AI for the substrate, humans for the finish" line [site:shopify-editions-w26] drew independently.
- **Art-direction rule (in Lusion's words):** the loud parts — the desk scene, the humour, the illustrations — "only work because everything around them stays relatively quiet" [recalled high].
- **Materials:** the hero reads as expensive through weight, inertia and lighting on a single mesh, not through an elaborate environment [recalled high].
- **Layout and browser surfaces:** [unknown] beyond the beat order.

## 4. Motion and effects (with parameters)
- **Libraries:** vanilla Three.js for finer control; GSAP for timelines and the tagged transitions [recalled high].
- **The scroll-sync architecture** [verified — `lusionltd/WebGL-Scroll-Sync` README; applied to Oryzo inferred]: instead of a `position: fixed` canvas, the canvas is `position: absolute` and offset every rAF to match the current scroll. Rationale: native scrolling does not run on the rAF thread, so a fixed canvas drifts when a scroll lands between two frames; an absolute canvas "will physically scroll with the page", keeping 3D attached to its DOM anchors, "no drift". Trade-off: clipping on fast scroll, mitigated by ~25 % vertical padding (rendering extra off-screen pixels) or by rendering to a framebuffer with edge blending/fading; Lusion's verdict is that clipping is more noticeable than the extra render cost. Also the reason for one canvas: "you cannot create infinite WebGL contexts on a single page" and resources cannot be shared across contexts.
- **Hero physics:** momentum on drag, lighting that responds to the object's motion [recalled high]; numeric damping, mass or light parameters [unknown].
- **Dwell-gated easter egg** in the zoom section (tardigrades) [recalled high]; the dwell threshold [unknown].
- **Particle footer** reacting to the pointer [recalled high]; particle counts and fields [unknown].
- **Transitions:** tagged by Awwwards (`#transitions`, `#GSAP`) [recalled high]; type and timing [unknown].
- **Launch film:** a separate motion-design deliverable, awarded on its own [recalled high].
- **Smooth-scroll library, text animation, sound, load sequence details:** [unknown]; no Lenis or Locomotive is consistent with the house technique above [inferred].

## 5. Tech and pipeline
- **Stack:** Three.js + WebGL + GSAP [recalled high]; one DOM-tethered canvas per the house technique [verified technique, inferred use]; framework, CMS, hosting and fonts [unknown].
- **Asset pipeline:** the public OBJ checkpoints show the object's geometry was shipped as an artefact; the site's own model and texture formats, compression and budgets [unknown]. Draco + KTX2 with a poster LCP is the genre default [inferred].
- **Performance posture:** a distinct, separately awarded mobile treatment [recalled high]; frame-rate tiers, DPR caps and reduced-motion handling [unknown].
- **Resize strategy:** [unknown].

## 6. Weaknesses
- **Usability is the lowest scored axis — 7.51 against Creativity 8.35** [recalled high]: consistent with a gated intro interaction and dwell-gated content. Creativity outrunning usability is the Awwwards trade this site makes on purpose.
- **No reduced-motion evidence found** [unknown]; a heavy single-canvas Three.js build with an interactive intro is the profile most likely to run everything for everyone.
- **Undocumented stack** beyond the libraries: fonts, budgets and fallbacks are unknown, so nothing here can be copied as an engineering spec.
- **What the awards skills do differently:** `/awards:motion` gives the intro interaction a skip control and a keyboard trigger (Enter / Space) and, under `prefers-reduced-motion`, completes it instantly — the reduced tier shows a static hero render, no particles, no dwell gate; `/awards:webgl` keeps the DOM mirror — product copy and "specs" as real text, canvas `aria-hidden`, a poster fallback when GL is unavailable — and applies the load gates: GL chunk lazy ≤ 500 KB gz, hero mesh via Draco + KTX2 behind a poster LCP ≤ 2.5 s, tiers high / mid / low; `/awards:structure` never hides required content behind an easter egg — the tardigrades stay a reward, not a dependency; `/awards:ship` walks the whole page by keyboard including the footer particles' underlying links.

## 7. Principles (3–6, generalisable)
1. **Commit to a premise with total sincerity.** The craft is the punchline; the first wink kills the joke.
2. **Extreme reduction buys two or three loud moments.** Four colours, one face, minimal UI — so the desk scene and the illustrations can be maximal.
3. **One object rendered with real weight beats a whole world.** Inertia, lighting and material response on a single hero mesh read as more expensive than a sprawling scene, at a fraction of the cost.
4. **Build the world, not just the page.** A fake model card, benchmark, Product Hunt launch and founder film make the site an artefact of something real.
5. **Reward dwelling.** Hidden detail at extreme zoom turns curiosity into time on site without asking for a click.
6. **Solve scroll sync at the architecture level.** DOM-tethered rendering that never drifts is craft that is systemic, not decorative.

## 8. Take / Don't take
- **Take:**
  - Straight-faced genre adoption as a concept method: pick a category's complete conventions (keynote launch, model card, benchmark table, changelog) and apply them to your subject with zero tonal breaks; the concept skill's THESIS names the sincerity as the constraint.
  - A four-value palette (ground, ink, one mid-tone, one hot accent) plus one family at ~99 % coverage, with loudness rationed to two or three named moments in the page map — quiet everywhere else is what makes them land.
  - The DOM-tethered canvas: `position: absolute`, offset per rAF to the scroll position, ~25 % vertical over-render (or a framebuffer with edge fade) against clipping; one canvas for the page. Take the rationale with it: scroll and rAF are on different threads.
  - A single hero object with inertia and responsive lighting as the technique tier — one mesh, physical materials, drag momentum — instead of an environment.
  - A dwell-gated easter egg inside a zoom section, and an authored interactive footer so the last screen is as designed as the first.
  - Campaign surface area in one voice: site + an open artefact + a launch listing + a founder film; and the making-of (a multi-part BTS series split by discipline) as distribution.
- **Don't take:**
  - The coaster, the "wearable product in the AI era" joke, WoodenBench, the checkpoint naming (26b … 344b) or any of the GitHub copy lines.
  - The cream / #100904 / olive / #FF8539 set or the one-family setting as "the Lusion look".
  - The tardigrades, the desk scene, or the beat order intro → hero → desk → zoom → particle footer as a skin.
  - Lusion's illustrations, 3D assets, launch film or the "-zo.ai" naming pattern.

## 9. Confidence and sources
- **Per section:** awards/scores high; concept, credits and design-system statements high [recalled — via search]; components medium; motion medium-high for the architecture (verified README) and low for on-page parameters; stack beyond Three.js / GSAP medium; §6 high for the score, unknown for reduced motion.
- **Sources used:** https://www.awwwards.com/sites/oryzo-ai · https://www.awwwards.com/inspiration/intro-interaction-oryzo-ai · https://www.awwwards.com/inspiration/footer-interactive-particles-oryzo-ai · https://www.awwwards.com/inspiration/desktop-oryzo-ai · https://www.awwwards.com/inspiration/mobile-oryzo-ai · https://www.cssdesignawards.com/sites/oryzo-ai/49111 · https://www.csswinner.com/details/oryzo-ai/19168 · https://www.motiondesignawards.com/project/2533/oryzo-main-promo · https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction · https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations · https://lusion.co/projects/oryzo_ai/ · https://lusion.co/ · https://github.com/lusionltd/ORYZO-1 · https://github.com/lusionltd/WebGL-Scroll-Sync · https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/ · https://www.utsubo.com/blog/best-threejs-websites-2026 · https://discourse.threejs.org/t/oryzo-ai-a-wearable-product-in-the-ai-era/90696
- **Access note:** GitHub fetched directly; awwwards.com, blog.lusion.co, tympanus.net and oryzo.ai itself read through search extraction only.
