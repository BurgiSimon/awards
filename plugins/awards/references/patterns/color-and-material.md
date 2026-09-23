# Colour and material

What this file is for: how the corpus decides colour — how few tokens, which near-black, which ground, where the accent comes from, when colour is page state — and which material policy each world commits to. Read it while writing `DESIGN.md ## Colors` and `## Elevation & Depth` and generating `tokens.css`; cite it as `[pattern:color-and-material#section]`. Every hex here is a card's hex with its label; none is a value to reuse.

## Contents
1. [Token counts](#token-counts) · [Warm near-blacks](#warm-near-blacks) · [Light grounds](#light-grounds)
2. [Accent from the environment](#accent-from-the-environment) · [Chroma outsourced to imagery](#chroma-outsourced-to-imagery)
3. [Colour as state](#colour-as-state) · [Tinted ramps](#tinted-ramps) · [Wide gamut](#wide-gamut)
4. [Material policies](#material-policies) · [Contrast](#contrast) · [Browser surfaces](#browser-surfaces)
5. [Colour strategies](#colour-strategies) · [Verify](#verify) · [Refuse](#refuse)

## Token counts

Why: a palette is a system only when it is small enough to hold in the head; the corpus runs on two to four live tokens, and a site with more keeps them as themes or variants, never all on screen.

| Card | Live tokens | Values | Confidence |
|---|---|---|---|
| [site:white-desert] | 2 | a light ice ground + one deep ink; chroma from photography | [inferred from the colour count] |
| [site:why-zero] | 2 | #FFFFFF + #01C654 | [verified] |
| [site:usavionix] | 2 | #000000 + #FFFFFF | [verified] |
| [site:seasats] | 2 | #619785 + #BF5114; ground [unknown] | [verified hexes] |
| [site:trevor-noah] | 2 | #FF9BB4 + #1D2440 | [verified] |
| [site:son-daven] | 2 | #A89474 + #2C2824 on a light ground | [verified] |
| [site:lama-lama] | 2 | #F9F4EB + #1A1C1C | [recalled medium-high] |
| [site:united-carriers] | 2 | a near-black + #0016CB with glow | [verified hex] |
| [site:boc] | 2 + greys | #181d21 + #ff4421; #f3f3f3 ink on the slate | [verified] |
| [site:wodniack] | 2 swapped + 1 shadow | #f40c3f + #160000; #540000 for letter extrusions | [verified] |
| [site:mont-fort] | 1 + opacity steps | #2D628C, white at .8 and 1.0, over a rendered ground | [verified] |
| [site:oryzo] | 4 | a cream, #100904, an olive, #FF8539 | [recalled high; two hexes only] |
| [site:the-line] | 4 + one overprint | #DDDEE2, #F8F8F8, #0B0B0B, #FF391E; #FF0000 under multiply | [verified] |
| [site:leo-parpeix] | 5 across 4 themes | #FFFFFF / #F7F7F7, #083D2A, #008841, #F6E016, #EED6C8 | [recalled medium, clone] |
| [site:floema-jewelry] | 5 named + 1 CTA, 2 live at a time | #f9f1e7, #c97164, #bc978c, #b2b8c3, #37384c; #FFC400 on one stroke | [verified, clone] |
| [site:igloo] | 6 sampled, one temperature | #6A6F7D → #E1E6F1 fog, #383e4e, #b6bac5, #A0A5B1, #83A1C5 rim | [verified, sampled] |
| [site:shopify-editions-w26] | stage + paper + ink + panels + focus + one accent per chapter | #000000, #f7f7ee, #292919, #dcdcd0 / #e2e2d9, #739bff | [recalled medium-low] |
| [site:slosh-seltzer] | 6 hues, one at a time | #FFC1FF #00A165 #FF0837 #0069D8 #FF5F00 #FFC800 | [verified, sampled] |
| [site:animejs] | 5 grounds + 5 foregrounds + 17 × 6 ramps | #252423 → #3a3938; #dddcda → #33332e | [verified tokens] |
| [site:jesperlandberg] [site:noth] | 2 | #000 + #fff; every other hue from the work or the renders | [verified] |
| [site:siena] | 2 + one alpha | #000 + #faf7ef, #faf7ef4d; gold and red declared, unseen | [verified] |
| [site:alectear] | 2 + one darker step | #0000DC + #D6D0FF, #C7BFFF, on white | [verified] |
| [site:the-boyd] | 2 + alpha steps | #ece6d6 + #66514b at 40 / 30 / 20 / 10 % | [verified] |
| [site:christoph-nagel] | 2 + one meter red | #080808 + #f4f4f1; #ff4b3e only in the loader's red zone | [verified] |
| [site:grids-obys] | 2, one inversion | #F1F1F1 + #000000; an opt-in mode floods yellow | [verified] |
| [site:robbietilton] | ground + graphite + greys, no accent | #fff, #272727, #9B9B9B; yellow only in `::selection` | [verified] |
| [site:likova] | ground + white + cool greys, no accent | #070b20 → #e3e6eb; #ce1d20 for form errors only | [verified] |
| [site:runrobrun] | 2 grounds + one ink at stepped alphas | #ff641c, #dbdbda, #050505 | [verified] |
| [site:goats] | 3 | #ebebeb, #111, #ff005c | [verified] |
| [site:primesec] | 3 | #1a1a1a, #f5f5f0, #f9fe2e | [verified] |
| [site:serotoninn] | 3 | #fff9f7, #000, #ed3833 | [verified] |
| [site:spasoje] | 3 + greys | #f5f5f5, #1a1a1a, #ff611b | [verified] |
| [site:mensch] | 4 | #2A0800, #EBE9D9, #FFFFFF rationed to display, #FB3F0C | [verified] |
| [site:areebali] | the object's materials | #c9ced5 stage, #e6e9ed aluminium, #0a0b0d screen, #e8461c controls | [verified] |
| [site:to-top] | 3 + a cream for warm beats | #0d352e, #fff, #efb300; #e5d5a3 | [verified] |
| [site:zainabkabira] | 4 flat tokens + painted scenery | #fff9f1, #060606, #ffda3f, #fc9073; night #0a0a0f / #111c36 | [verified] |
| [site:haoqi] | 2 themes + 1 accent | #fbfaf4 / #0f1111 grounds, #c0fe04 | [verified] |
| [site:siteassist] | a tinted ramp + 1 accent | #f9faf9 → #19191a, #6100fe on actions only | [verified] |
| [site:nodeck] | 2 paper grounds + ink + 1 accent | #ff87ab, #f3e6d6, #000, #def915 | [verified] |
| [site:bethebuzz] | ink + accent + a hue per route | #010561, #5e29f9; #fe9421 panels | [verified] |
| [site:911rennsport] | black + white + greys; paint-named reserve | #3f424d, #e1e1e1; #bc220e, #2a77b6, #d19000 unused on the home route | [verified] |
| [site:pensatori-irrazionali] | 2 + a flag pair + one hue per discipline | #f5f5f5, #434343; #009246, #CE2B37; #f669e4 | [verified] |
| [site:warmnfuzzy] | 5 grounds, one per section | #000, #190bb6, #f7dd47, #e74a27, #fff | [verified] |
| [site:okaydev] | ink + 5 accents | #0c0c0c; #6d42ed, #42ed91, #eee642, #ec4242, #ed9442 | [verified] |
| [site:wearedirect] | white + black + 5 rotated accents | #000; #fed76a, #4c88ff, #2ccc5a, #ff89f0, #ff6200 | [verified] |
| [site:gehry-getty] | 4 chapter floods + black and white | #ffa441, #ff6359, #4596ff, #16a147 | [verified] |
| [site:lando-norris] [site:mindmarket] | [unknown] | — | [unknown] |

Rules: two to four tokens under a named strategy (`#colour-strategies`); at most six hues in the token file (audit C03); a fifth and sixth value exist only as a theme or a variant set that is never live at the same time; `--muted` and `--line` are mixed from ground and ink (`tokens.css`), not new hues.

## Warm near-blacks

Why: pure #000 has no temperature and flattens every material on it; the corpus shifts its darkest value toward the world's temperature, and the "warm" in the batch-wide rule is a direction, not a hue.

| Hex | Card | Reads as | Confidence |
|---|---|---|---|
| #100904 | [site:oryzo] | warm, red-brown | [recalled high] |
| #160000 | [site:wodniack] | warm, oxblood; also its `theme-color` | [verified] |
| #292919 | [site:shopify-editions-w26] content black | warm olive | [recalled medium-low] |
| #2C2824 | [site:son-daven] | warm brown | [verified] |
| #252423 | [site:animejs] `--bg-1` | warm, brown-shifted charcoal | [verified] |
| #1A1C1C | [site:lama-lama] | neutral, a hair cool — the card calls it warm | [recalled medium-high] |
| #0B0B0B | [site:the-line] | neutral, under a cool grey ground | [verified] |
| #37384C | [site:floema-jewelry] | cool navy | [verified, clone] |
| #1D2440 | [site:trevor-noah] | cool navy | [verified] |
| #383E4E | [site:igloo] darkest ink | cool slate | [verified, sampled] |
| #181d21 | [site:boc] canvas | cool slate, used as the ground | [verified] |
| #083D2A | [site:leo-parpeix] | a chromatic ink: forest green | [recalled medium] |
| #2A0800 | [site:mensch] | warm rust, used as the ground | [verified] |
| #66514b | [site:the-boyd] | taupe brown replacing black everywhere, buttons and selection included | [verified] |
| #0a0017 | [site:siteassist] | violet-cast near-black | [verified] |
| #070b20 | [site:likova] | cool blue-black ground, also `theme-color` | [verified] |
| #010561 | [site:bethebuzz] | a chromatic ink: dark blue | [verified] |
| #0f1111 | [site:haoqi] dark theme | cool, a hair green | [verified] |

When pure #000 is allowed: as a diegetic black — night vision and cockpits [site:usavionix] [verified] — or as a stage behind scenes while the content black stays warm (#000000 stage, #292919 ink [site:shopify-editions-w26] [recalled medium-low]); as a cinema's dark behind a warm paper ink [site:siena] [verified]; or as the second half of one inversion, a white hero cut to a black body [site:noth] [verified]. Either way it is recorded as a C02 exception in `AWARDS.md` with the reason.

## Light grounds

Why: the Awwwards default is dark, and the corpus is not. Of the 19 cards whose ground is known or inferable, ten are light-dominant — [site:leo-parpeix] [recalled medium], [site:white-desert] [inferred], [site:why-zero] [verified], [site:son-daven] [verified], [site:lama-lama] with dark sections as tempo changes [recalled medium], [site:floema-jewelry] [verified], [site:oryzo] [recalled high], [site:the-line] [verified], [site:mont-fort] [inferred, high-key], [site:igloo] as a pale fog [verified hexes] — five are dark ([site:united-carriers] [verified tags], [site:usavionix] [verified], [site:animejs] [verified tokens], [site:trevor-noah] [inferred navy ground], [site:boc] slate [verified]) and four are dual or contested ([site:lando-norris] flips by scroll position [verified]; [site:shopify-editions-w26] paper on a black stage; [site:slosh-seltzer] contested; [site:wodniack] a red ground that inverts to oxblood for the work reel [verified]). Grounds for [site:seasats] and [site:mindmarket] are unknown. The 2026-09-23 wave keeps the balance [verified, captures on each card]: fourteen light-dominant ([site:robbietilton] [site:pensatori-irrazionali] [site:zainabkabira] [site:wearedirect] [site:goats] [site:siteassist] [site:serotoninn] [site:areebali] [site:grids-obys] [site:alectear] [site:spasoje] [site:the-boyd] [site:nodeck] [site:haoqi]), seven dark ([site:jesperlandberg] [site:mensch] [site:likova] [site:primesec] [site:siena] [site:christoph-nagel] [site:to-top]) and seven dual or per-section ([site:warmnfuzzy] [site:okaydev] [site:911rennsport] [site:noth] [site:gehry-getty] [site:runrobrun] [site:bethebuzz]).

Rules: the use scene chooses — reading, photography and daylight products want a light ground; dark is earned by a diegetic reason, a stage, or one chapter's tempo change. Light grounds are rarely white: bone #F9F4EB, warm bone #f9f1e7, paper #f7f7ee, cool silver #DDDEE2, off-white #F7F7F7 [cards above].

## Accent from the environment

Why: an accent chosen from a trend deck says "website"; one taken from the subject's real scene says the subject.

| Accent | Card | Where it comes from | Confidence |
|---|---|---|---|
| Freight blue #0016CB with glow | [site:united-carriers] | the one saturated hue on a near-black operator's world | [verified hex] |
| Marine rust #BF5114 + sea-green #619785 | [site:seasats] | oxidised hulls, safety gear, ocean | [verified] |
| Brass #A89474 | [site:son-daven] | wood, wool, brass, smoke — used as surface and accent | [verified] |
| Pop pink #FF9BB4 on navy | [site:trevor-noah] | a refusal of the black-and-neon comedy register | [verified] |
| Signal green #01C654 on white | [site:why-zero] | one signal in a CGI world that would otherwise read as a render demo | [verified] |
| Orange #FF8539 | [site:oryzo] | the single hot value in a four-value set | [recalled high] |
| Flare red #FF391E | [site:the-line] | active nav, selection, loading placeholder, footer and other interface roles | [verified] |
| Rim blue #83A1C5 | [site:igloo] | one rim light in a near-monochrome | [verified] |
| Slate #2D628C | [site:mont-fort] | the one ink over snow and rock | [verified] |
| Acid yellow #f9fe2e | [site:primesec] | only on the props the marble figure wears, and on actions: the product entering an old world | [verified] |
| Power-key orange #e8461c | [site:areebali] | the device's own control colour: key, LED, selected channel | [verified] |
| Signal orange #ff611b | [site:spasoje] | LEDs, the toggle, the second hand, selection: live and interactive states only | [verified] |
| Mark orange #FB3F0C | [site:mensch] | the mark, the typed caret, selection and the focus ring | [verified] |
| Violet #6100fe | [site:siteassist] | CTAs and eyebrow bullets only: the one saturated colour is spent on the ask | [verified] |
| Paint-named reserve | [site:911rennsport] | tokens named after paint finishes (`--amaranth-red`, `--oslo-blue`) for build pages | [verified] |

Rules: one accent live; name its job in `DESIGN.md` — emphasis, bookend, state, surface — and let it do only that; a second accent is a theme, not a token (`#colour-as-state`).

## Chroma outsourced to imagery

Why: when photography is strong, UI colour competes with it. White Desert locks the interface to a ground and an ink and lets ice, dusk, penguins and jets carry every ounce of colour — Content was its highest axis at 7.74 [site:white-desert] [recalled medium]. Lama Lama runs people photography and a hero video on bone and near-black [site:lama-lama] [recalled medium]; Son Daven's renders across seasons carry the chroma over a duotone [site:son-daven]. Boc keeps its chrome to a slate ground and one orange bar and lets the clients' campaign stills carry every other hue [site:boc] [verified]; Wodniack holds its line work to two tokens and lets only the project videos bring outside colour [site:wodniack] [verified]. The Line inverts the rule **locally, not globally**: `filter: grayscale()` sits on exactly two selectors, and the acetate is a hero-and-highlights device over otherwise full-colour work [verified, live source 2026-09-18]. What generalises is the ink, not the desaturation — its one red does ten jobs, from `::selection` to the loading placeholder to the sticky footer [site:the-line] [verified, live source 2026-09-18].

Rules: choose a treatment from the subject and the supplied images. Preserve useful color differences; selective desaturation or overprint is an optional unifying treatment. The Line's acetate is local, not a site-wide greyscale policy. With no imagery, let the accent and material carry the world (`[site:igloo]`, `[site:mont-fort]`).

Newer cases [verified on each card]: hardware photographed on one pale backdrop under white and grey chrome [site:robbietilton]; client sites mapped onto cards over a black field [site:jesperlandberg]; a cool accentless navy system so the amber of dusk renders is the only warmth [site:likova]; black and white chrome with the cars' paint as all the colour [site:911rennsport]; two tokens, and saturated foil and putty renders as material [site:noth]. Three push the other way and grade the imagery instead: every clip forced to `grayscale(1) contrast(1.04) brightness(.62)` in CSS so mixed footage reads as one shoot [site:christoph-nagel]; one shader warming and vignetting every film still [site:siena]; every client's lettering re-inked in the house blue on lilac, with the original colourway only on hover [site:alectear].

## Colour as state

Why: when ground and ink change together, navigation and rhythm become art direction, and the page needs no other transition (`[pattern:preloaders-and-transitions#theme-swap-as-a-transition]`).

- Per route: `data-background` and `data-color` on each template; a singleton tweens `document.documentElement` over 1.5 s; exactly two values live at a time [site:floema-jewelry] [verified, clone].
- Per section: four named themes swapped as the page scrolls, so scrolling reads like turning printed pages [site:leo-parpeix] [recalled medium]; a nav that samples the section under the header and flips light or dark [site:lando-norris] [verified]; one product accent per chapter on a constant stage [site:shopify-editions-w26] [recalled medium-low]; two tokens that trade roles per section — red ground with oxblood ink, then the reverse for the work reel — plus a header toggle that re-points the primary and shadow tokens [site:wodniack] [verified].
- Per variant: every slot repainted in ≈ 1 s on `cubic-bezier(.645,.045,.355,1)`, the WebGL clear colour RGBA-lerped in the same tween, restarting from the current value under rapid switching; one hue on screen at a time [site:slosh-seltzer] [verified at family level].
- One palette for DOM and scene: the Three adapter resolves CSS custom properties into scene colours, so `var(--bg-1)` sets a clear colour [site:animejs] [verified].
- One attribute per section: `[data-theme=…]` sets ground, ink and border together, and a hairline appears only between two sections of the same theme [site:warmnfuzzy] [verified]; four hues each flood a whole chapter, bleeding into full-bleed film through a blurred band [site:gehry-getty] [verified]; the header re-themed per section [site:okaydev] [verified].
- Per route on the ground only: the route's hue colours one GL surface under the DOM rather than every component [site:bethebuzz] [verified]; a route curtain already wearing the next page's colour, prefetched from each link in idle time [site:wearedirect] [verified].
- Colour as wayfinding: each discipline owns one accent shared by its status dot and its marquee band [site:pensatori-irrazionali] [verified]; five accents assigned to buttons in turn so neighbours never share a hue [site:wearedirect] [verified].
- A theme as a scene: day and night each play one event of their own, once, so switching feels like changing the hour [site:zainabkabira] [verified].

Rules: `data-theme` on `<html>` is the single source for the CSS tokens and the renderer's clear colour; tween the tokens on `documentElement`, never elements one by one; use `--ease-theme`, symmetric because a repaint has no arrival; instant or ≤ 300 ms under reduced motion; every theme passes `#contrast` on its own `[recipe:theme-swap-tokens]`.

## Tinted ramps

Why: on a dark UI, accents go muddy at low steps unless the ramp converges on the ground. Anime.js defines 17 hues × 6 steps where step 6 is the ground tinted with that hue — a red that ends at #322523, a lime at #2d3123, a cyan at #23302d — so any accent stays coherent at any intensity [site:animejs] [verified]. Take the rule for a dark system with many accents; never the 17 hues or their values. Two lighter versions of the idea: a neutral ramp tinted slightly green from #f9faf9 to #19191a [site:siteassist] [verified]; five accents built from the same two channel values, 0x42 and 0xed [site:okaydev] [verified].

## Wide gamut

Why: P3 displays show a wider range than sRGB, and a duplicated declaration costs nothing. Montfort ships its ink as `#2D628C` and again as `color(display-p3 0.1765 0.3843 0.5490)` [site:mont-fort] [verified]. Rules: duplicate the accent only (the ink and ground stay sRGB so contrast maths hold); the second declaration wins where supported and is ignored elsewhere; record both values in `DESIGN.md`.

## Material policies

Why: material is what makes a colour read as a surface, and one policy per world is what keeps a site from looking assembled.

| Policy | Card | Mechanism | Confidence |
|---|---|---|---|
| Sharp and shadowless; depth by luminance | [site:the-line] | radius 0, shadow 0; a luminance ladder near-white .973 → grey .871 → red .444 → near-black .043 | [verified] |
| Local multiply acetate | [site:the-line] | an `aria-hidden` flat red div with `mix-blend-mode: multiply` over selected full-colour work. Applied to the hero, the active work row, the reel frame, the mobile nav figure and the 404; grayscale filters occur on only two other selectors | [verified, live source 2026-09-18] |
| Fog gradient + one rim accent + saturation ≈ 0 | [site:igloo] | cheap-ice optics in effort order: bevel every edge → light from inside or below → Fresnel rim → bloom with a high threshold → depth of field → fog → fine grain; transmission only on the one object that earns it; a 3D LUT grade | [recalled high; LUT verified] |
| Glow on one hue | [site:united-carriers] | bloom in GL or a CSS glow around the ultramarine only, never on text | [inferred] |
| Fixed bloom presets | [site:lando-norris] | 1.5 / .5 / .25 chosen per scene; PBR sets, matcaps and an HDRI | [verified] |
| Flat, unmodulated field | [site:slosh-seltzer] | no gradient, noise or photographic ground; shadows tinted to the theme's own darkness at a constant .15 alpha | [verified, family level] |
| Matte surfaces with a baked lightmap | [site:mont-fort] | procedural noise textures, rock and snow diffuse and normal maps, one baked lightmap, one EXR environment | [verified files] |
| Translucent planes | [site:floema-jewelry] | image planes at alpha .4, never opaque — atmosphere at the cost of contrast | [verified, clone] |
| 2.5D depth-map parallax | **no corpus source** — `[site:shopify-editions-w26]` was the citation and its scenes are real Blender glTF geometry with KTX2 textures, no depth-map signature at all [verified, live source 2026-09-18] | image + grayscale depth, ray-marched parallax, bloom and dust | technique only |
| Narrative materials | [site:why-zero] | frost, glass, paper and currency as the argument's own substances | [verified] |
| Hairline line work | [site:wodniack] | every surface drawn at one line weight — noise fields, a perspective corridor, grids, hatching — plus stepped letter shadows in a shadow token; no photography of its own | [verified] |
| Paper and ink | [site:serotoninn] | torn edges from raster masks, brush strokes behind buttons, a sticker that peels; no noise or glow | [verified] |
| Real props in a flat world | [site:nodeck] | photographed desk objects with soft shadows over 3 px outlines and 4 px hard offset shadows | [verified]; the hard-shadow kit is a trend |
| Skeuomorphic object in CSS | [site:areebali] [site:spasoje] | brushed metal, a radial-gradient dish, pill keys; moulded knobs with stacked soft drop-shadows | [verified] |
| One silhouette from the product | [site:likova] | the building's stepped, notched massing reused as loader, panels, cookie box and 18 buttons | [verified] |
| One object in two materials | [site:mensch] | the same mark bare and glossy, then overgrown with moss and flowers | [verified] |
| Film-gate ritual | [site:siena] | grain, rounded gate corners, tear lines and punched notches on every control | [verified] |
| Stepped grain | [site:warmnfuzzy] [site:runrobrun] [site:christoph-nagel] | a 32 px tile on `steps(2)` [site:warmnfuzzy]; canvas frames of random pixels at 12 fps [site:runrobrun]; a PNG tile jittered through six positions [site:christoph-nagel]; each frozen under reduced motion | [verified] |

Rules: choose one policy and name it under `DESIGN.md ## Elevation & Depth`; sharp and shadowless is the default when nothing argues otherwise; grain goes last in the post stack and never over text (`[recipe:gl-postprocessing-presets]`); glass, glow and gradient are policies a world can choose, never defaults (`craft-floor.md`).

## Contrast

Why: a duotone that clears AA is the creditable detail, not the obvious one — usability is the lowest axis on nineteen of the twenty verified entries [verified, twenty Awwwards entries read 2026-09-18].

- Worked example [site:son-daven] [verified hexes; ratio computed]: ink #2C2824 on brass #A89474 gives a relative luminance of .022 against .308, so `(.308 + .05) / (.022 + .05)` ≈ 5.0:1 — body text passes on the brass surface. The same brass as *text* on a light ground lands near 2.7:1 and fails: the accent is a surface and an ink, never a body colour.
- Counter-example [site:floema-jewelry] [verified hexes; ratio computed]: terracotta #c97164 on bone #f9f1e7 is ≈ 3.1:1 — large type only. The card does not say so; the number does.
- White at .8 opacity over rendered snow [site:mont-fort] is flagged unknown on its card; treat any ink over imagery as a check per frame, not per token.
- Counter-examples [verified on the cards]: a statement resting in white on a light grey before its scroll fill, ≈ 1.2:1, a 12 %-white heading on near-black and a white focus ring on the light page [site:goats]; 9 px grey chrome labels on a grey device [site:areebali].

Rules: body ≥ 4.5:1 (audit C01), large text ≥ 3:1, focus ring ≥ 3:1 against its neighbours; check every theme of a theme-per-section site separately; write the ratios into `DESIGN.md ## Colors`.

## Browser surfaces

Why: the surfaces the browser paints are part of the page a juror sees first — a blue selection on a bone-and-brass site breaks the world.

Seen: selection in flare red with off-white text and a custom scrollbar whose handle is the ink [site:the-line] [verified]; `theme-color` set to the ink [site:mont-fort] [verified]; a logo that follows `prefers-color-scheme` through `<picture>` [site:animejs] [verified]; the accent as focus outline and skip-link ground, and a `blur(20px) saturate(160%)` glass on chrome with an opaque fallback [site:boc] [verified]; `::selection` inverting the two tokens, `theme-color` in the oxblood and a thin red scroll thumb [site:wodniack] [verified]; `theme-color` rewritten per theme and a pinned-tab mask colour [site:alectear] [verified]; the accent on selection, caret and a 2 px focus ring [site:mensch] [verified]; light and dark favicons by `prefers-color-scheme` [site:noth] [site:wearedirect] [verified]. Misses to avoid: a near-black `theme-color` on a bone page [site:the-boyd] [verified]; a white `theme-color` on a grey ground [site:pensatori-irrazionali] [verified]; a hidden scrollbar [site:serotoninn] [site:the-boyd] [verified].

Rules (audit S01–S06): theme every surface from the tokens — `::selection` (accent ground, ink text), `caret-color`, a thin scrollbar with native scrolling kept underneath, a `:focus-visible` ring in the accent at ≥ 3:1, `color-scheme` on `:root`, `<meta name="theme-color">` updated when the theme swaps, a favicon in the ink, an Open Graph image drawn in the world.

## Colour strategies

Why: the strategy is the sentence that explains every token; `DESIGN.md ## Overview` asks for it by name.

| Strategy | Rule | Cards |
|---|---|---|
| Restrained duotone | ground + ink; chroma from imagery or from none; the accent, if any, is a surface or a bookend | [site:white-desert] [site:lama-lama] [site:son-daven] [site:usavionix] [site:mont-fort] [site:igloo] [site:boc] [site:jesperlandberg] [site:noth] [site:siena] [site:robbietilton] [site:likova] [site:911rennsport] [site:the-boyd] [site:christoph-nagel] [site:alectear] [site:grids-obys] [site:zainabkabira] |
| Committed accent | one environment-derived hue does all emphasis on a near-black or a light ground | [site:united-carriers] [site:why-zero] [site:trevor-noah] [site:oryzo] [site:seasats] [site:the-line] [site:goats] [site:mensch] [site:primesec] [site:spasoje] [site:siteassist] [site:serotoninn] [site:to-top] [site:areebali] [site:haoqi] |
| Theme-per-section | token sets swapped per section or route as narrative rhythm; two values live at a time | [site:leo-parpeix] [site:floema-jewelry] [site:shopify-editions-w26] [site:lando-norris]; two tokens trading roles [site:wodniack]; five flat grounds [site:warmnfuzzy]; five hues on near-black [site:okaydev]; chapter floods [site:gehry-getty]; one hue per route on the ground [site:bethebuzz]; one hot ground against one neutral [site:runrobrun]; two paper grounds per slide [site:nodeck] |
| Palette-as-navigation (the template's "drenched") | a hand-picked set of four to ten hues, one on screen at a time; the swap is the transition | [site:slosh-seltzer]; the ramp system of [site:animejs] as its dark-UI cousin; accents rotated through buttons, entries and route curtains [site:wearedirect]; one hue per discipline [site:pensatori-irrazionali] |

Rules: pick one; write it and the reason the use scene forces light or dark into `DESIGN.md ## Overview`; a restrained duotone can hold a bookend accent, a committed accent cannot hold a second; theme-per-section and palette-as-navigation share `[recipe:theme-swap-tokens]` and differ only in what triggers the swap.

## Verify

- [ ] Two to four live tokens under one named strategy; no more than six hues in `tokens.css`; muted and line values mixed, not added.
- [ ] The darkest value is shifted toward the world's temperature; pure #000 only with a C02 exception and its reason.
- [ ] The ground follows the use scene; a dark ground has a diegetic reason, a stage or a tempo-change role.
- [ ] One accent, derived from the subject's scene, with its job named; chroma policy decided (duotone under imagery, or overprint).
- [ ] Theme swaps tween `<html>` tokens and the canvas clear colour together on `--ease-theme`; instant under reduced motion; every theme passes contrast.
- [ ] One material policy named in `DESIGN.md`; grain last and never over text; P3 duplicates on the accent only.
- [ ] Ratios written down: body ≥ 4.5:1, large ≥ 3:1, focus ring ≥ 3:1; every browser surface themed from the tokens.

## Refuse

- A generated six-hue palette, the indigo-violet pair, teal + orange, pastel rainbow, gold on black (`reflex-lists.md`).
- Gradient text; glass panels by default; dark + neon + glow by reflex; pure #000 under pure #FFF text with no diegetic reason.
- A second accent as a token; an accent used as body text; a theme that fails contrast because "it is only one section".
- Theme swaps that tween elements one by one or leave the canvas clear colour behind.
- Any card's set as a package: bone + #1A1C1C, cream + #100904 + #FF8539, the five Floema colours, the four Léo themes, the Igloo fog and rim, the six Slosh hues, the Anime ramps, silver + flare red, #2D628C and its P3 twin, pink + navy, sea-green + rust, #0016CB on black, #ff4421 over #181d21, #f40c3f with #160000, the five grounds #190bb6 / #f7dd47 / #e74a27, the five accents from #fed76a to #ff6200, #2A0800 with #FB3F0C, #ff641c against #dbdbda, #ff005c on #ebebeb, #f9fe2e on #1a1a1a, #0000DC on #D6D0FF, #ece6d6 with #66514b, a national tricolore as a rule.
