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
| Serif display + light grotesque | George X + Suisse BP Intl at ultralight, light and regular | [site:floema] | [verified, clone fonts] |
| One superfamily, two cuts | KTF Metro Roman (display) + KTF Metro Blueline (body) | [site:son-daven] | [verified] |
| Variable grotesque + bold display, headlines also in GL | Mona Sans (several instances) + Brier Bold | [site:lando-norris] | [verified] |
| One characterful grotesque at display scale | Suisse BP Int'l, set oversized | [site:lama-lama] | [recalled medium] |
| One variable grotesk, macro/micro | Denim (`DenimVF`, `ss03` throughout) | [site:the-line] | [verified] |
| One family at ≈ 99 % of the type | face unknown | [site:oryzo] | [recalled high for the ratio] |
| Monospace identity | IoskeleyMono Regular + Bold | [site:animejs] | [verified for the example system; the site is recalled medium] |
| Monospace identity as an MSDF atlas | IBM Plex Mono Medium, one weight, no DOM text | [site:igloo] | [verified] |
| Two geometric sans | Century Gothic (regular, bold) + Josefin Sans Light | [site:mont-fort] | [verified] |
| Three layers: display serif + grotesque + script accent | faces unknown | [site:shopify-editions-w26] | [recalled medium-low] |
| Unknown | — | [site:white-desert] [site:why-zero] (a Google-served family) [site:usavionix] [site:seasats] [site:trevor-noah] [site:mindmarket] [site:slosh-seltzer] | [unknown] |

Rules:
- One of: a voice and a silence (expressive display, neutral body), or one voice (a characterful family at every size). A third layer exists only when 150 discrete items need more hierarchy than a craft site does [site:shopify-editions-w26].
- All personality in the display face, none in the body: United Carriers puts every ounce of character into the condensed headlines and none into Helvetica Now [site:united-carriers] [verified].
- A superfamily with two cuts is the quiet version of the two-face contract, and a local foundry extends provenance into the toolchain [site:son-daven] [verified].
- Monospace is an identity only where the world is technical — a library, a research station [site:animejs] [site:igloo]; on any other product it is a costume (`craft-floor.md`).

## Macro and micro

Why: two sizes with nothing between read as a system; five sizes read as a hierarchy someone had to manage. The Line sets 210 px display on a 1728 px artboard against ≈ 9 px uppercase micro-labels, with body at 16 px and buttons at 13 px doing plain work in between — the *design* has two tiers, the *stylesheet* has four [site:the-line] [verified]. Igloo goes further: one face, one weight, one size class per role [site:igloo] [verified].

Rules: pick a display size and a label size first and make them far apart (≈ 20 : 1 at the desktop artboard); body and button sizes are utility, not hierarchy; no "h2 / h3 / h4" ladder — a chapter title is display, a caption is label, and a paragraph is body.

## Fluid scale

Why: a comp is drawn at one width; a scale that locks to that width survives every other width without a breakpoint per size, and a vw-locked layout needs no JavaScript on resize [site:the-line].

The vw-lock [site:the-line] [verified]: every desktop value is `px / artboard × 100`, kept at full precision. On the 1728 artboard: 22 px = `1.27315vw`, 32 px = `1.85185vw`, 126 px = `7.29167vw`, 210 px = `12.15278vw`. Cross-check: at a 1275 px viewport `12.15278vw` is 155 px, and `-0.04em` at 155 px is the −6.2 px tracking the extraction recorded. Below 768 px values become fixed px (the reconstruction sets the display to 72 px) — fixed on small screens, fluid on large [verified]. Lando anchors a single `--fluid-font` clamp to the same 1728 baseline [site:lando-norris] [verified]; Léo Parpeix's clamp scale runs its gutters from 40–120 px down to 20 px [site:leo-parpeix] [verified].

The plugin's token wraps the lock in `clamp()` so the display never outgrows the artboard or collapses on a phone (`recipes/_shared/tokens.css`):

```css
--artboard: 1728;
--display: clamp(3rem, 12.1528vw, 13.125rem); /* 48 px floor · 210 px at 1728 · locked above */
--label: 0.6875rem;                            /* 11 px */
--gutter: clamp(20px, 4.1667vw, 120px);        /* 72 px at 1728 */
```

How to read it: `13.125rem` is 210 px, so the ceiling is the artboard value itself; the vw term reaches the 48 px floor at ≈ 395 px, which is where phones begin; above 1728 px the display stops growing and the gutters keep growing until 2880 px. `DESIGN.md`'s template floor is `2.75rem` (44 px) — pick one floor per project and keep the two files identical.

Display setting [site:the-line] [verified]: tracking `-0.04em`, weight 500, line-height .8–.95. The audit's hard floor is −0.06em (T04) and the DESIGN template asks for ≥ −0.04em; treat −0.04em as the corpus value and −0.06em as the last resort. Negative tracking only at display size [site:shopify-editions-w26] [recalled medium-low]. Leading under 1 is why masked reveals travel `150 %` rather than `100 %` — descenders must clear the clip (`[pattern:motion-vocabulary#masked-line-reveals]`). Set `text-rendering: optimizeLegibility` and antialiasing once [site:the-line] [verified].

## Optical hang

Why: at 12 vw a glyph's side bearing is several pixels of visible air, and a display line that starts a few pixels inside the margin reads as misaligned. The Line hangs the first glyph of each display line past its 8 px page margin with per-glyph negative margins [site:the-line] [verified].

Rules: hang only the first glyph of a display line, only at display scale; measure per face and per glyph class (round and diagonal glyphs need more than stems); implement as a negative `margin-left` on the first character span or with `text-indent`, computed in the same vw unit as the margin; re-check after every font swap, since the fallback face has different bearings.

## Labels as texture

Why: small labels are the texture that makes a big-type page feel set rather than empty, and they carry the register — a call sheet, a console, a catalogue.

| Texture | Seen in | Confidence |
|---|---|---|
| Numerals 01 / 02 / 03 on nav links; a numbered label per item | [site:leo-parpeix]; [site:floema] `${collection} ${index}` | [recalled medium]; [verified] |
| Numbered chapters and numbered pillars | [site:mont-fort] | [verified] |
| Roman numerals for the year and for sections | [site:the-line]; [site:shopify-editions-w26] | [verified]; [recalled medium-low] |
| Metadata quartet: name · discipline · year · team of N | [site:leo-parpeix] | [recalled medium] |
| Telemetry slashes: `/ MICRO / LABELS /` as a CSS pseudo-element; `///////` heading rules; a `Sound: Off` state label | [site:the-line]; [site:igloo] | [verified]; [verified] |
| ≈ 9 px uppercase at weight 440 | [site:the-line] | [verified] |

Rules: labels use the body face (or the one family), uppercase, tracked ≈ .08em, at `--label`; 11 px is the floor for a label that carries meaning, and 9 px is allowed only for decorative repeats; decorative marks (a slash, a rule) live in `::before`, and labels that carry meaning live in the DOM as text (`[pattern:components-catalog#metadata-labelled-project-rows]`); numerals are texture only when they also count something — a chapter, an item, a year (audit X07).

## Type as WebGL material

Why: at a punctuation moment — the manifesto, the break between two clusters, the display word through the object — type rendered in the scene inherits depth, parallax and the post stack, which DOM text cannot.

- Igloo renders every glyph from an MSDF atlas (`IBMPlexMono-Medium` as a KTX2 data texture plus a JSON layout, decoded in a worker) and runs its scramble reveals as atlas offsets, so nothing reflows [site:igloo] [verified atlas; recalled high for the scramble]. Lando sets its 3D headlines with `three-msdf-text-utils` 1.5.0 and a word wrapper, crisp at any scale [site:lando-norris] [verified]. Why Zero blurs type through a hexagonal shader at key moments [site:why-zero] [verified]. Léo Parpeix's typographic break fills the viewport in WebGL [site:leo-parpeix] [recalled medium]. The flavour-field family draws one display word through the focal object [site:slosh-seltzer] [family-level].
- **The DOM-mirror rule.** Every GL headline exists in the DOM as the real heading — either the layout element the canvas draws over, or a visually hidden copy — and the canvas is `aria-hidden`. Igloo's 6.6 on accessibility, semantics and markup is the cost of not doing this [site:igloo] [recalled medium]; whether Lando mirrors its MSDF headlines is unknown [site:lando-norris].
- Punctuation only: one or two moments per site. The reduced tier shows the settled glyphs; the no-WebGL tier shows the DOM heading in the same place.
- Recipe: `[recipe:gl-msdf-text]`; the DOM-side effects are `[recipe:split-text-masked-reveal]`, `[recipe:flicker-text]` and `[recipe:scramble-decode-text]`.

## Loading

Why: a display face that swaps late shreds the lines already split, and a Google Fonts link is a third-party round trip the corpus does not make.

- Self-hosted files, seen everywhere the sources show delivery: woff2 [site:lando-norris] [verified] [site:mont-fort] [verified] [site:animejs] [verified] [site:leo-parpeix] [clone, medium]; woff and woff2 across six files for two families [site:floema] [verified]; a single variable `DenimVF.woff` [site:the-line] [verified]; no web font at all, only an atlas [site:igloo] [verified]. Why Zero serves from the Google Fonts API [site:why-zero] [verified] — the family may be right, the CDN link is refused (audit T02): self-host the same files.
- Budget: ≤ 4 files and ≤ 400 KB (audit P05). A variable face covers many instances in one file [site:lando-norris] [site:the-line].
- `@font-face` with `font-display: swap`, plus a fallback face declared with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` so the swap does not move a line (audit T05, T06); preload the display face only.
- Split text only after `document.fonts.ready`, and re-split on resize: Lando re-runs its splitter after font load so a fallback cannot shred the lines [site:lando-norris] [verified]; Anime's splitter re-applies effects after a re-split [site:animejs] [verified].
- Stylistic sets are part of the identity, applied universally (`ss03` on every element [site:the-line] [verified]); keep `font-feature-settings` in the token layer, not per component.

## Faces seen

Why: naming the face with its licence turns "use something like this" into a decision that can be recorded in `DESIGN.md`. Foundry and licence notes are labelled; the cards themselves rarely state either.

| Face | Role in the corpus | Card | Licence note |
|---|---|---|---|
| Monument Grotesk | neutral body, UI | [site:leo-parpeix] | commercial, Dinamo [recalled high] |
| Avantt | variable wide display | [site:leo-parpeix] | commercial, Displaay [recalled medium-high] |
| Suisse BP Int'l | display grotesque; light body | [site:lama-lama] [site:floema] | commercial, Swiss Typefaces [recalled medium, from the card] |
| BT Steinhart | condensed display | [site:united-carriers] | commercial, Bitstream/Monotype [verified on the card] |
| Helvetica Now | neutral body, UI | [site:united-carriers] | commercial, Monotype [recalled high] |
| KTF Metro Roman / Blueline | superfamily, two cuts | [site:son-daven] | commercial, Kyiv Type Foundry [verified] |
| George X | serif display | [site:floema] | commercial; foundry [unknown] |
| Denim | variable grotesk, `ss03` | [site:the-line] | commercial; foundry not on the card [unknown] |
| Mona Sans | variable grotesque, UI and body | [site:lando-norris] | open, SIL OFL, GitHub [verified as open on the card] |
| Brier | bold display | [site:lando-norris] | commercial [inferred]; foundry [unknown] |
| IoskeleyMono | monospace identity | [site:animejs] | licence [unknown] |
| IBM Plex Mono | monospace identity as MSDF | [site:igloo] | open, SIL OFL [recalled high] |
| Century Gothic | geometric display and body | [site:mont-fort] | commercial, Monotype; desktop bundles do not include web use [recalled medium] |
| Josefin Sans | geometric light | [site:mont-fort] | open, SIL OFL [recalled high] |

Two notes on the evidence: IBM Plex Mono sits on the avoid list in `reflex-lists.md` and is also the display face of a Site of the Year — the list is about reflex, not prohibition, and an on-purpose choice is recorded under `AWARDS.md ## Exceptions`. Suisse BP appears twice in the corpus five years apart [site:floema] [site:lama-lama], which is exactly why a new build should not make it three.

## Choosing by character class

Why: the face follows the world, then the character, then the licence — never the other way round (`reflex-lists.md`, alternatives by character class).

1. Decide the contract from the world: a voice and a silence, or one voice (`#contracts`).
2. Decide the character the display voice needs — round or sharp, wide or narrow, warm or cold, condensed or extended — from the direction contract's WORLD line, not from a trend.
3. Take the class row in `reflex-lists.md`: open-licence faces first, the corpus's licensed faces only if the budget licenses them, and never the pairing a neighbour card already owns.
4. Check the licence file and the web-embedding terms; record face, foundry and licence in `DESIGN.md`.

| World | Contract that fit it | Card |
|---|---|---|
| Portfolio, art direction | wide expressive display + neutral grotesque | [site:leo-parpeix] |
| Studio, animation, film | one characterful grotesk, macro/micro | [site:the-line] [site:lama-lama] |
| Freight, industry, hardware | condensed display + neutral body | [site:united-carriers] |
| Heritage corporate group | two geometric sans, institutional | [site:mont-fort] |
| Jewellery, fashion | serif display + light grotesque | [site:floema] |
| Property, hospitality with a place | one superfamily, two cuts, local foundry | [site:son-daven] |
| Athlete, personal brand | variable grotesque + bold display | [site:lando-norris] |
| Library, research station, console | monospace identity | [site:animejs] [site:igloo]; readouts [site:usavionix] [inferred] |
| Changelog with 150 items | serif display + grotesque + one accent layer | [site:shopify-editions-w26] |

## Verify

- [ ] One contract, recorded in `DESIGN.md` with face, foundry and licence; no second display face.
- [ ] Display and label sizes far apart; body and button sizes are utility, not a heading ladder.
- [ ] Every desktop measure is `px / artboard × 100`; the display token is a `clamp()` with one agreed floor; fixed px below 768.
- [ ] Tracking no tighter than −0.04em by choice and −0.06em by audit; display leading .8–.95; the first glyph hung at display scale.
- [ ] Labels at ≥ 11 px when they carry meaning, in the DOM as text; decorative slashes and rules in pseudo-elements.
- [ ] Every GL headline has a DOM heading underneath and the canvas is `aria-hidden`; GL type at one or two moments only.
- [ ] Self-hosted woff2, ≤ 4 files, ≤ 400 KB, `font-display` with a metric-matched fallback; splitting after `document.fonts.ready` and again on resize.

## Refuse

- A reflex face as the voice (`reflex-lists.md`), or a system face as display.
- Two display faces; a third layer without 100+ items to organise.
- A Google Fonts or any CDN `<link>`; more than four files.
- A heading ladder of five sizes; a display size above ≈ 13 vw or below the phone floor.
- Tracking tighter than −0.06em; gradient text; monospace as a costume on a non-technical product.
- GL or split text with no accessible copy; an atlas-only identity with an empty DOM.
- The pairings as packages: Avantt + Monument Grotesk, George X + Suisse BP, KTF Metro, BT Steinhart + Helvetica Now, Mona Sans + Brier, Century Gothic + Josefin Sans, Denim with `ss03`, IoskeleyMono-only.
