# Typography

What this file is for: the type decisions the corpus makes before any layout exists — which contract of faces a site holds, how display and label scales relate, how sizes lock to an artboard, where labels become texture, when type becomes a WebGL material and how faces load. Read it while writing `DESIGN.md ## Typography` and `tokens.css`; cite it as `[pattern:typography#section]`. Faces are named with their licence so the choice is made on purpose; `reflex-lists.md` holds the faces to avoid and the open alternatives, and this file does not repeat them.

## Contents
1. [Contracts](#contracts)
2. [Macro and micro](#macro-and-micro)
3. [Fluid scale](#fluid-scale)
4. [Optical hang](#optical-hang)
5. [Labels as texture](#labels-as-texture)
6. [Type as WebGL material](#type-as-webgl-material)
7. [Loading](#loading)
8. [Faces seen](#faces-seen)
9. [Choosing by character class](#choosing-by-character-class)
10. [Verify](#verify) · [Refuse](#refuse)

## Contracts

Why: a site reads as one voice when the number of faces is a decision. The corpus holds four contracts and never a second display face; where a card names no face, the contract is still visible in the ratio of display to body.

| Contract | Faces | Card | Confidence |
|---|---|---|---|
| Expressive display + neutral grotesque | Avantt (variable display) + Monument Grotesk (UI, body) | [site:leo-parpeix] | [verified] |
| Expressive display + neutral grotesque | BT Steinhart (condensed display) + Helvetica Now (body, UI) | [site:united-carriers] | [verified] |
| Serif display + light grotesque | George X + Suisse BP Intl at ultralight, light and regular | [site:floema-jewelry] | [verified, clone fonts] |
| One superfamily, two cuts | KTF Metro Roman (display) + KTF Metro Blueline (body) | [site:son-daven] | [verified] |
| Variable grotesque + bold display, headlines also in GL | Mona Sans (several instances) + Brier Bold | [site:lando-norris] | [verified] |
| One characterful grotesque at display scale | Suisse BP Int'l, set oversized | [site:lama-lama] | [recalled medium] |
| One variable grotesk, macro/micro | Denim (`DenimVF`, `ss03` throughout) | [site:the-line] | [verified] |
| One family at ≈ 99 % of the type | face unknown | [site:oryzo] | [recalled high for the ratio] |
| One grotesque, one family | PP Mori with a metric-matched fallback; system mono only for code | [site:boc] | [verified] |
| Three layers: condensed poster display + light serif text + mono labels, no grotesque | Bigger Display + PP Editorial New + PP Fraktion Mono | [site:wodniack] | [verified] |
| Monospace identity | IoskeleyMono Regular + Bold | [site:animejs] | [verified for the example system; the site is recalled medium] |
| Monospace identity as an MSDF atlas | IBM Plex Mono Medium, one weight, no DOM text | [site:igloo] | [verified] |
| Two geometric sans | Century Gothic (regular, bold) + Josefin Sans Light | [site:mont-fort] | [verified] |
| Three layers: display serif + grotesque + script accent | faces unknown | [site:shopify-editions-w26] | [recalled medium-low] |
| One face, one weight, hierarchy by scale | Suisse Int'l 700 as the only file [site:warmnfuzzy]; an uploaded neo-grotesque at 400 with outline cuts as illustration [site:grids-obys]; ABC Diatype Plus Variable [site:jesperlandberg] | [site:warmnfuzzy] [site:grids-obys] [site:jesperlandberg] | [verified]; the Grids face's retail name [unknown] |
| No web font at all | system sans and Helvetica [site:robbietilton]; system monospace on a device screen [site:areebali] | [site:robbietilton] [site:areebali] | [verified] |
| Expressive display + neutral grotesque | Greed Narrow + Be Vietnam Pro [site:mensch]; PP Formula + TWK Lausanne 300 [site:911rennsport]; Anton + Manrope [site:christoph-nagel]; TikTok Sans wide caps + Geist Mono + Departure Mono for the HUD [site:haoqi] | [site:mensch] [site:911rennsport] [site:christoph-nagel] [site:haoqi] | [verified] |
| A grotesque and its mono sibling, the mono as the voice | Geist Mono for claims and chrome + Geist for reading [site:siteassist]; TT Interphases Pro + Mono, shipped as trial cuts [site:primesec]; Aeonik Pro + Aeonik Mono [site:okaydev]; Helvetica Neue LT Pro + Chivo Mono [site:wearedirect]; PP Neue Montreal + IBM Plex Mono [site:noth] | [site:siteassist] [site:primesec] [site:okaydev] [site:wearedirect] [site:noth] | [verified] |
| Three voices, strict roles: display + reading serif + label face | Love hairline caps + Canela + Adieu extended caps [site:the-boyd]; Sharp Grotesk Black in two widths + Reckless + Roboto Mono [site:gehry-getty]; Lemon-Bold + PP Editorial Old Ultralight + PP Neue Montreal [site:bethebuzz]; Neue Brucke + P22 Parrish Roman + NB International [site:siena]; Thunder + PP Fraktion Mono + Inter [site:serotoninn]; DM Serif Display + Space Grotesk + JetBrains Mono [site:zainabkabira] | [site:the-boyd] [site:gehry-getty] [site:bethebuzz] [site:siena] [site:serotoninn] [site:zainabkabira] | [verified] |
| A rationed accent face as punctuation | UnifrakturCook for 320 ms swaps and three footer words [site:mensch]; Megazoid only in the wordmark and one marquee [site:okaydev]; a handwritten script for one short aside per chapter beside Bon Vivant Serif + Montserrat [site:to-top]; Libre Baskerville only on the guestbook [site:areebali]; a VGA bitmap face for one crash slide beside BN Dime Display + DM Sans [site:nodeck]; a copperplate script for numerals among four voices [site:pensatori-irrazionali] | [site:mensch] [site:okaydev] [site:to-top] [site:areebali] [site:nodeck] [site:pensatori-irrazionali] | [verified]; Ballet as the script [inferred] |
| Segmented display + mono, no proportional face | a dot-matrix face + Akkurat Mono [site:spasoje] | [site:spasoje] | [verified family names; retail faces unknown] |
| Wide grotesque + mono UI, the content as display | Halvar Breitschrift + Vulf Mono under lettering work [site:alectear] | [site:alectear] | [verified] |
| Extended display caps + grotesque subheads + mono body | four `next/font` locals, retail faces [unknown] | [site:runrobrun] | [verified names] |
| One geometric family | Poppins 400–600 [site:goats]; TT Norms Pro at 400 and 450 in caps [site:likova] | [site:goats] [site:likova] | [verified] |
| Unknown | — | [site:white-desert] [site:why-zero] (a Google-served family) [site:usavionix] [site:seasats] [site:trevor-noah] [site:mindmarket] [site:slosh-seltzer] | [unknown] |

Rules:
- One of: a voice and a silence (expressive display, neutral body), or one voice (a characterful family at every size). A third layer exists only when 150 discrete items need more hierarchy than a craft site does [site:shopify-editions-w26].
- All personality in the display face, none in the body: United Carriers puts every ounce of character into the condensed headlines and none into Helvetica Now [site:united-carriers] [verified].
- A superfamily with two cuts is the quiet version of the two-face contract, and a local foundry extends provenance into the toolchain [site:son-daven] [verified].
- Monospace is an identity only where the world is technical — a library, a research station [site:animejs] [site:igloo], a safety-control instrument panel [site:siteassist]; on any other product it is a costume (`craft-floor.md`).
- A third face survives when it is rationed: one timed swap, three words, one line per chapter [site:mensch] [site:to-top]; used across headings it becomes noise [site:okaydev] [site:gehry-getty] (their principles, not a measurement).
- When the work is typographic, the work is the display type and the chrome stays small and lower-case [site:alectear] [verified].

## Macro and micro

Why: a wide display-to-label contrast can give a poster its force while intermediate sizes keep longer reading and specifications clear. The Line sets 210 px display against 10 px micro type on a 1728 px artboard, with a full eight-step ladder between them [site:the-line] [verified, live CSS]. Igloo uses one face, one weight and one size class per role [site:igloo] [verified]. Newer extremes: hairline capitals at 150–200 px against 12 px extended caps, with a reading serif between [site:the-boyd] [verified]; dot-matrix glyphs at ≈ 17–20 vw against ≈ 12 px mono [site:spasoje] [verified]; a hero word at `clamp(4rem, 13vw, 12.8rem)` against .7 rem tracked caps [site:christoph-nagel] [verified]; one weight from 12 px to 320 px, scale doing all the work [site:warmnfuzzy] [verified].

Rules: choose the display and label sizes for the composition; ≈ 20:1 is a poster-oriented example, not a required ratio. Add intermediate headings where reading or specifications need them. Check the hierarchy and leading with the rendered glyphs.

## Fluid scale

Why: a comp is drawn at one width; a scale that locks to that width survives every other width without a breakpoint per size, and a vw-locked layout needs no JavaScript on resize [site:the-line].

The vw-lock [site:the-line] [verified]: every desktop value is `px / artboard × 100`, kept at full precision. On the 1728 artboard: 22 px = `1.27315vw`, 32 px = `1.85185vw`, 126 px = `7.29167vw`, 210 px = `12.15278vw`. Cross-check: at a 1275 px viewport `12.15278vw` is 155 px, and `-0.04em` at 155 px is the −6.2 px tracking the extraction recorded. Below 768 px values become fixed px (the reconstruction sets the display to 72 px) — fixed on small screens, fluid on large [verified]. Lando anchors a single `--fluid-font` clamp to the same 1728 baseline [site:lando-norris] [verified]; Léo Parpeix's clamp scale runs its gutters from 40–120 px down to 20 px [site:leo-parpeix] [verified].

Other locks [verified on each card]: `max(N − N·m + 100vw·N / W·m, N)` with `m = .2` and one `W` per breakpoint (375 / 768 / 1280 / 1600), so sizes grow at a fifth of the viewport rate above their artboard and never drop below it [site:warmnfuzzy]; a root `font-size: clamp(5px, 20px, 10 × 100vw / var(--size))`, with the artboard 390 below 650 px and 1500 above, which lands labels at 9.6 px on a 1440 screen [site:jesperlandberg]; a root unit easing from .7 rem to 1 rem between 980 and 1200 px [site:likova]; titles sized to container height with `cqh` [site:nodeck]. The opposite choice — stepped px tokens per breakpoint and no `clamp()` in type — is common in Webflow builds [site:wearedirect] [site:911rennsport] [site:siteassist]. `text-box: trim-both cap alphabetic` trims a ticker line to its caps [site:warmnfuzzy] [verified].

The plugin's token wraps the lock in `clamp()` so the display never outgrows the artboard or collapses on a phone (`recipes/_shared/tokens.css`):

```css
--artboard: 1728;
--display: clamp(3rem, 12.1528vw, 13.125rem); /* 48 px floor · 210 px at 1728 · locked above */
--label: 0.6875rem;                            /* 11 px */
--gutter: clamp(20px, 4.1667vw, 120px);        /* 72 px at 1728 */
```

How to read it: `13.125rem` is 210 px, so the ceiling is the artboard value itself; the vw term reaches the 48 px floor at ≈ 395 px, which is where phones begin; above 1728 px the display stops growing and the gutters keep growing until 2880 px. `DESIGN.md`'s template floor is `2.75rem` (44 px) — pick one floor per project and keep the two files identical.

Display setting [site:the-line] [verified]: tracking `-0.04em`, weight 500, line-height .8 on its h1. Choose leading from the rendered glyphs and reading task; inspect accents and descenders at every size. The audit's tracking floor is −0.06em (T04) and the DESIGN template asks for ≥ −0.04em. Negative tracking only at display size [site:shopify-editions-w26] [recalled medium-low]. Masked reveals must clear descenders (`[pattern:motion-vocabulary#masked-line-reveals]`). Set `text-rendering: optimizeLegibility` and antialiasing once [site:the-line] [verified].

## Optical hang

Why: at 12 vw a glyph's side bearing is several pixels of visible air, and a display line that starts a few pixels inside the margin reads as misaligned. The Line hangs the first glyph of each display line past its 8 px page margin with per-glyph negative margins [site:the-line] [verified].

Rules: hang only the first glyph of a display line, only at display scale; measure per face and per glyph class (round and diagonal glyphs need more than stems); implement as a negative `margin-left` on the first character span or with `text-indent`, computed in the same vw unit as the margin; re-check after every font swap, since the fallback face has different bearings.

## Labels as texture

Why: small labels are the texture that makes a big-type page feel set rather than empty, and they carry the register — a call sheet, a console, a catalogue.

| Texture | Seen in | Confidence |
|---|---|---|
| Numerals 01 / 02 / 03 on nav links; a numbered label per item | [site:leo-parpeix]; [site:floema-jewelry] `${collection} ${index}` | [recalled medium]; [verified] |
| Numbered chapters and numbered pillars | [site:mont-fort] | [verified] |
| Roman numerals for sections | [site:shopify-editions-w26] | [recalled medium-low] |
| Metadata quartet: name · discipline · year · team of N | [site:leo-parpeix] | [recalled medium] |
| Telemetry slashes: `/ MICRO / LABELS /` as real elements; `///////` heading rules; a `Sound: Off` state label | [site:the-line]; [site:igloo] | [verified]; [verified] |
| 10 px micro type at the 1728 px artboard | [site:the-line] | [verified, live CSS] |
| Mono serials per work (`#…-0015/34`) and binary ticker rules that regenerate | [site:wodniack] | [verified] |
| Bracketed actions and states: `[MENU]`, `[READ MORE]`; `THEME[A]`, `SOUND[/]` | [site:gehry-getty]; [site:haoqi] | [verified]; [verified] |
| Key-value row grammar `YR:` / `CL:` / `TC:` / `DF:` | [site:spasoje] | [verified] |
| A section count as a superscript on its heading | [site:siteassist] | [verified] |
| Numbered mono eyebrows `04 / WE SPECIALISE IN` | [site:wearedirect] | [verified] |
| Labels below the floor: 9.6 px corner chrome, 9 px device labels | [site:jesperlandberg]; [site:areebali] | [verified] — what to beat |

Rules: labels use the body face (or the one family), uppercase, tracked ≈ .08em, at `--label`; 11 px is the floor for a label that carries meaning, and 9 px is allowed only for decorative repeats; decorative marks (a slash, a rule) live in `::before`, and labels that carry meaning live in the DOM as text (`[pattern:components-catalog#metadata-labelled-project-rows]`); numerals are texture only when they also count something — a chapter, an item, a year (audit X07).

## Type as WebGL material

Why: at a punctuation moment — the manifesto, the break between two clusters, the display word through the object — type rendered in the scene inherits depth, parallax and the post stack, which DOM text cannot.

- Igloo renders every glyph from an MSDF atlas (`IBMPlexMono-Medium` as a KTX2 data texture plus a JSON layout, decoded in a worker) and runs its scramble reveals as atlas offsets, so nothing reflows [site:igloo] [verified atlas; recalled high for the scramble]. Lando sets its 3D headlines with `three-msdf-text-utils` 1.5.0 and a word wrapper, crisp at any scale [site:lando-norris] [verified]. Why Zero ships its narrative type as a **KTX2 sprite atlas** (`atlases/texts.ktx2`) with a per-tier render-target scale, and blurs it with a `lensBlur` post pass — not the hexagonal text shader this file used to claim [site:why-zero] [verified, live bundle 2026-09-18]. Léo Parpeix's typographic break fills the viewport in WebGL [site:leo-parpeix] [recalled medium]. The flavour-field family draws one display word through the focal object [site:slosh-seltzer] [family-level].
- **The DOM-mirror rule.** Every GL headline exists in the DOM as the real heading — either the layout element the canvas draws over, or a visually hidden copy — and the canvas is `aria-hidden`. Igloo's 6.6 on accessibility, semantics and markup is the cost of not doing this [site:igloo] [recalled medium]; whether Lando mirrors its MSDF headlines is unknown [site:lando-norris].
- Punctuation only: one or two moments per site. The reduced tier shows the settled glyphs; the no-WebGL tier shows the DOM heading in the same place.
- Cheaper routes to the same effect [verified on each card]: every DOM text element measured and redrawn with `fillText` into a Canvas-2D texture, the DOM glyphs made transparent [site:jesperlandberg]; a knockout SVG headline whose letters are holes onto a GL ground [site:bethebuzz]; a wordmark rasterised onto the base layer of a fluid mask [site:noth]; inflated glass lettering as glTF models [site:haoqi]. Each still needs its DOM heading: the knockout shipped as unnamed path data [site:bethebuzz].
- Recipe: `[recipe:gl-msdf-text]`; the DOM-side effects are `[recipe:split-text-masked-reveal]`, `[recipe:flicker-text]` and `[recipe:scramble-decode-text]`.

## Loading

Why: a display face that swaps late shreds the lines already split, and a Google Fonts link is a third-party round trip the corpus does not make.

- Self-hosted files, seen everywhere the sources show delivery: woff2 [site:lando-norris] [verified] [site:mont-fort] [verified] [site:animejs] [verified] [site:leo-parpeix] [clone, medium]; woff and woff2 across six files for two families [site:floema-jewelry] [verified]; a single variable `DenimVF.woff` [site:the-line] [verified]; five woff2 preloads across three families, one over the file budget [site:wodniack] [verified]; no web font at all, only an atlas [site:igloo] [verified]. Why Zero serves from the Google Fonts API [site:why-zero] [verified] — the family may be right, the CDN link is refused (audit T02): self-host the same files.
- Budget: ≤ 4 files and ≤ 400 KB (audit P05). A variable face covers many instances in one file [site:lando-norris] [site:the-line].
- `@font-face` with `font-display: swap`, plus a fallback face declared with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` so the swap does not move a line (audit T05, T06) — `next/font` generates one, as Boc's `ppMori Fallback` shows [site:boc] [verified]; preload the display face only.
- Split text only after `document.fonts.ready`, and re-split on resize: Lando re-runs its splitter after font load so a fallback cannot shred the lines [site:lando-norris] [verified]; Anime's splitter re-applies effects after a re-split [site:animejs] [verified].
- Stylistic sets are part of the identity, applied universally (`ss03` on every element [site:the-line] [verified]); keep `font-feature-settings` in the token layer, not per component.
- Load what the route uses: ten Google families on a home route for mock-ups seen only inside case studies [site:zainabkabira], Montserrat loaded twice from two hosts [site:to-top], trial cuts in production [site:primesec] and `.ttf` files with no woff2 [site:siena] are the misses of this wave [verified]. `font-display: block` before a reveal [site:alectear] [site:haoqi] trades a flash for a delay; `optional` suits a novelty face that can be skipped [site:okaydev] [verified].

## Faces seen

Why: naming the face with its licence turns "use something like this" into a decision that can be recorded in `DESIGN.md`. Foundry and licence notes are labelled; the cards themselves rarely state either.

| Face | Role in the corpus | Card | Licence note |
|---|---|---|---|
| Monument Grotesk | neutral body, UI | [site:leo-parpeix] | commercial, Dinamo [recalled high] |
| Avantt | variable wide display | [site:leo-parpeix] | commercial, Displaay [recalled medium-high] |
| Suisse BP Int'l | display grotesque; light body | [site:lama-lama] [site:floema-jewelry] | commercial, Swiss Typefaces [recalled medium, from the card] |
| BT Steinhart | condensed display | [site:united-carriers] | commercial, Bitstream/Monotype [verified on the card] |
| Helvetica Now | neutral body, UI | [site:united-carriers] | commercial, Monotype [recalled high] |
| KTF Metro Roman / Blueline | superfamily, two cuts | [site:son-daven] | commercial, Kyiv Type Foundry [verified] |
| George X | serif display | [site:floema-jewelry] | commercial; foundry [unknown] |
| Denim | variable grotesk, `ss03` | [site:the-line] | commercial; foundry not on the card [unknown] |
| Mona Sans | variable grotesque, UI and body | [site:lando-norris] | open, SIL OFL, GitHub [verified as open on the card] |
| Brier | bold display | [site:lando-norris] | commercial [inferred]; foundry [unknown] |
| IoskeleyMono | monospace identity | [site:animejs] | licence [unknown] |
| IBM Plex Mono | monospace identity as MSDF | [site:igloo] | open, SIL OFL [recalled high] |
| Century Gothic | geometric display and body | [site:mont-fort] | commercial, Monotype; desktop bundles do not include web use [recalled medium] |
| Josefin Sans | geometric light | [site:mont-fort] | open, SIL OFL [recalled high] |
| PP Mori | one grotesque at every size | [site:boc] | commercial, Pangram Pangram [recalled high] |
| Bigger Display | condensed poster display, uppercase | [site:wodniack] | licence and foundry [unknown] |
| PP Editorial New | light serif as the text voice | [site:wodniack] | commercial, Pangram Pangram [recalled high] |
| PP Fraktion Mono | mono micro-labels only | [site:wodniack] [site:serotoninn] | commercial, Pangram Pangram [recalled high] |
| ABC Diatype Plus Variable | one variable grotesque for everything | [site:jesperlandberg] | commercial, Dinamo [recalled high] |
| Greed Narrow | narrow display grotesque | [site:mensch] | licence and foundry [unknown] |
| UnifrakturCook | blackletter punctuation | [site:mensch] | open, SIL OFL [recalled high] |
| PP Formula / TWK Lausanne | wide display / light body | [site:911rennsport] | commercial, Pangram Pangram / Weltkern [recalled high] |
| Aeonik Pro / Aeonik Mono | grotesque + mono labels | [site:okaydev] | commercial, CoType [recalled high] |
| TT Interphases Pro / Mono | grotesque + mono sibling | [site:primesec] | commercial, TypeType; trial cuts shipped [verified trial file names] |
| TT Norms Pro | geometric in two near weights | [site:likova] | commercial, TypeType [recalled high] |
| PP Neue Montreal | neutral body and statements | [site:noth] [site:bethebuzz] | commercial, Pangram Pangram [recalled high] |
| PP Editorial Old | ultralight serif kickers | [site:bethebuzz] | commercial, Pangram Pangram [recalled high] |
| Thunder | condensed display caps | [site:serotoninn] | licence and foundry [unknown] |
| Canela / Adieu / Love | reading serif / extended caps / hairline display | [site:the-boyd] | Commercial Type [recalled high] / Good Type Foundry [recalled medium] / [unknown] |
| Reckless / Sharp Grotesk | text serif / black compressed display | [site:gehry-getty] | commercial, Displaay [recalled medium] / Sharp Type [recalled high] |
| Neue Brucke / P22 Parrish / NB International | quirky display / spaced serif caps / body | [site:siena] | [unknown] / P22 [recalled medium] / Neubau [recalled high] |
| Halvar Breitschrift / Vulf Mono | wide grotesque / mono UI | [site:alectear] | commercial, Stawix [recalled medium] / OH no Type [recalled high] |
| TikTok Sans / Departure Mono | wide display caps / pixel mono HUD | [site:haoqi] | open, SIL OFL [recalled medium] |
| Bon Vivant Serif / Nothing You Could Do | high-contrast display serif / script aside | [site:to-top] | [unknown] / open, SIL OFL [recalled medium] |

Two notes on the evidence: IBM Plex Mono sits on the avoid list in `reflex-lists.md` and is also the display face of a Site of the Year — the list is about reflex, not prohibition, and an on-purpose choice is recorded under `AWARDS.md ## Exceptions`. Suisse BP appears twice in the corpus five years apart [site:floema-jewelry] [site:lama-lama], which is exactly why a new build should not make it three.

## Choosing by character class

Why: the face follows the world, then the character, then the licence — never the other way round (`reflex-lists.md`, alternatives by character class).

1. Decide the contract from the world: a voice and a silence, or one voice (`#contracts`).
2. Decide the character the display voice needs — round or sharp, wide or narrow, warm or cold, condensed or extended — from the direction contract's WORLD line, not from a trend.
3. Take the class row in `reflex-lists.md`: open-licence faces first, the corpus's licensed faces only if the budget licenses them, and never the pairing a neighbour card already owns.
4. Check the licence file and the web-embedding terms; record face, foundry and licence in `DESIGN.md`.

| World | Contract that fit it | Card |
|---|---|---|
| Portfolio, art direction | wide expressive display + neutral grotesque | [site:leo-parpeix] |
| Studio, animation, film | one characterful grotesk, macro/micro | [site:the-line] [site:lama-lama] [site:boc] |
| Creative developer's own site | condensed poster display + light text serif + mono labels | [site:wodniack] |
| Freight, industry, hardware | condensed display + neutral body | [site:united-carriers] |
| Heritage corporate group | two geometric sans, institutional | [site:mont-fort] |
| Jewellery, fashion | serif display + light grotesque | [site:floema-jewelry] |
| Property, hospitality with a place | one superfamily, two cuts, local foundry | [site:son-daven] |
| Athlete, personal brand | variable grotesque + bold display | [site:lando-norris] |
| Library, research station, console | monospace identity | [site:animejs] [site:igloo]; readouts [site:usavionix] [inferred] |
| Changelog with 150 items | serif display + grotesque + one accent layer | [site:shopify-editions-w26] |
| Regulated industry, safety tooling | mono as the voice + one sentence-case grotesque title per chapter | [site:siteassist] |
| Gallery, luxury shop | hairline display + reading serif + extended micro caps, one warm ink | [site:the-boyd] |
| Museum exhibition, archive | text serif + black compressed titles + mono captions | [site:gehry-getty] |
| Design system or method explainer | one face, one weight, outline cuts as illustration | [site:grids-obys] |

For a rendered comparison of poster, editorial and technical hierarchy using the same copy, open `[recipe:typography-specimen]` via `[pattern:visual-composition]`; choose the project’s own licensed typeface and measure.

## Verify

- [ ] One contract, recorded in `DESIGN.md` with face, foundry and licence; no second display face.
- [ ] Display, label and intermediate heading sizes serve the reading task; specifications have the hierarchy they need, checked on rendered glyphs.
- [ ] Every desktop measure is `px / artboard × 100`; the display token is a `clamp()` with one agreed floor; fixed px below 768.
- [ ] Tracking no tighter than −0.04em by choice and −0.06em by audit; leading checked on rendered glyphs; the first glyph hung at display scale where the face needs it.
- [ ] Labels at ≥ 11 px when they carry meaning, in the DOM as text; decorative slashes and rules in pseudo-elements.
- [ ] Every GL headline has a DOM heading underneath and the canvas is `aria-hidden`; GL type at one or two moments only.
- [ ] Self-hosted woff2, ≤ 4 files, ≤ 400 KB, `font-display` with a metric-matched fallback; splitting after `document.fonts.ready` and again on resize.

## Refuse

- A reflex face as the voice (`reflex-lists.md`), or a system face as display.
- Two display faces; a third layer without 100+ items to organise.
- A Google Fonts or any CDN `<link>`; more than four files.
- Heading sizes added by habit rather than a reading need; a display size above ≈ 13 vw or below the phone floor.
- Tracking tighter than −0.06em; gradient text; monospace as a costume on a non-technical product.
- GL or split text with no accessible copy; an atlas-only identity with an empty DOM.
- The pairings as packages: Avantt + Monument Grotesk, George X + Suisse BP, KTF Metro, BT Steinhart + Helvetica Now, Mona Sans + Brier, Century Gothic + Josefin Sans, Denim with `ss03`, IoskeleyMono-only, PP Mori alone, Bigger Display + Editorial New + Fraktion Mono, Suisse Int'l 700 alone, Geist + Geist Mono, Love + Canela + Adieu, Thunder + Fraktion Mono + Inter, Reckless + Sharp Grotesk + Roboto Mono, Halvar Breitschrift + Vulf Mono, a dot-matrix face with a mono.
