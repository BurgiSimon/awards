# Layout and composition

What this file is for: the geometry under each chapter — columns, gutters and margins, line length and where the text column sits, how much of the viewport is picture, when a section touches the glass, and how space between chapters is paced. Read it while writing `DESIGN.md ## Layout` and filling the Layout column of `AWARDS.md ## Page map`; cite it as `[pattern:layout-and-composition#section]`. Scaling systems and phone checks are in `[pattern:responsive-strategy#decide-before-build]`, first-viewport anatomy in `[pattern:hero-archetypes#choosing]`, type sizes in `[pattern:typography#fluid-scale]`. A value marked ≈ was computed here from a card's token at 1440 × 900 or 390 × 844, the widths `capture.mjs` records; the label beside it stays the card's. Where one cell cites several cards, its uses are listed in the order the cards are cited.

## Contents
1. [Grid systems seen](#grid-systems-seen)
2. [Gutters, margins and artboards](#gutters-margins-and-artboards)
3. [Measure and text-column placement](#measure-and-text-column-placement)
4. [Asymmetry and offset columns](#asymmetry-and-offset-columns)
5. [Image-area share](#image-area-share)
6. [Full-bleed and contained](#full-bleed-and-contained)
7. [Vertical rhythm and section spacing](#vertical-rhythm-and-section-spacing)
8. [Layout families](#layout-families)
9. [Composition by chapter type](#composition-by-chapter-type)
10. [Desktop, tablet, phone](#desktop-tablet-phone)
11. [Choosing a layout for a chapter](#choosing-a-layout-for-a-chapter)
12. [Fingerprints](#fingerprints)
13. [Verify](#verify) · [Refuse](#refuse)

## Grid systems seen

Why: the column count sets the smallest offset a layout can take. The corpus picks a count for fine placement, then sets content on a few plain spans.

| Columns (desktop → smaller) | What the count is used for | Card | Confidence |
|---|---|---|---|
| 6 | wide modules; paragraphs on indents of `25% + .25rem` | [site:gehry-getty] [site:ascension-pegassi] | [verified] |
| 8, as an overlay | the page's own columns, switched on by the reader | [site:grids-obys] | [verified, count measured from a frame] |
| 12 → 6, 8 or 4 | 8-of-12 and 6-of-12 spans; one count per breakpoint; column rules over photography | [site:lama-lama] [site:trevor-noah] [site:white-desert] | [verified] |
| 12, varied | cards at mixed spans and starts; a masonry wall of 3 / 2 / 1; hairline rows in a 1440 px container | [site:haoqi] [site:alectear] [site:runrobrun] | [verified] |
| 12 → 4, no gutters | equal bays margin to margin, drawn as 6 % hairlines under `difference` blending, every label hung on a bay edge | [site:daikifujita] | [verified] |
| 16 → 6, 8 or 4 | outer columns as margin (`col-start-2 / col-span-14`); the gutter as a fraction of the column (`24/90`, or .15); padding per breakpoint | [site:mindmarket] [site:oryzo] [site:united-carriers] [site:everswap] | [verified] |
| 24 → 8 | fine placement; the `<h1>` in a 24-column row; start columns per breakpoint | [site:seasats] [site:floema] [site:mont-fort] | [verified] |
| 8 / 16 / 24 | media cards at mixed sizes | [site:warmnfuzzy] | [verified counts; which width gets which inferred] |
| 4 or 2 | a one-column sidebar beside three of rows; hairline two-column lists | [site:boc] [site:cyphercapital] | [verified] |
| none | camera framing and HUD anchors | [site:igloo] | [verified] |

Rules:
- Count for the finest offset the page needs, then use few spans. Twelve gives halves, thirds and quarters; sixteen or twenty-four earn their place only where something starts on a sixteenth or a twenty-fourth.
- No card keeps its desktop count on the phone: 4, 6 and 8 all appear; the intermediate counts sit between (6 [site:oryzo]; 8 [site:united-carriers] [site:trevor-noah]).
- A visible grid is art direction only when content sits on it: rules over photography [site:white-desert], a reader-switched overlay [site:grids-obys], crosshairs over every section [site:haoqi], survey hairlines [site:abatable], bay hairlines that every label hangs from [site:daikifujita] [verified on each card]. A dev overlay left in production CSS is the miss [site:seasats] [verified]; lines painted in as texture are audit X09.

## Gutters, margins and artboards

Why: the gutter groups and the margin frames; a juror reads both before any type. Per-card values are in `#fingerprints`.

- Gutters run 8–32 px at 1440 and 10–14 px at 390 where recorded. About half the cards that record one make it fluid — a `clamp()` between two px values [site:floema] [site:agrumeafarm] [site:trevor-noah] [site:bethebuzz] or a fraction of the column [site:oryzo] — and half fix it per breakpoint, from `.5rem` [site:alectear] to 32 px [site:cyphercapital] [verified on each card]. A tight fixed gutter suits a dense index whose tightness is the look [site:boc] [site:alectear].
- Margins run 15–56 px at 1440 and 16–20 px at 390. The Line's 8 px phone margin is the outlier [site:the-line] [verified]; audit L08 asks for the gutter token on both sides of text at every width. Container padding can grow far wider, to 150 px [site:mont-fort] [verified].
- The gutter is at or below the margin in every card that records both. Equal values (15 / 15 px [site:boc], 20 / 20 px [site:bethebuzz]) make the page one sheet of tiles; a margin 1.5 to 3 times the gutter (24 / 40 px [site:lama-lama], 12 / 32 px [site:seasats]) frames the grid as an object [verified on each card].
- Artboards [verified on each card]: 1440 is the commonest desktop width [site:lama-lama] [site:seasats] [site:white-desert] [site:the-boyd] [site:zainabkabira] [site:leo-parpeix]; others are 1500 [site:jesperlandberg], 1688 [site:eugeniagrab], 1728 [site:the-line] [site:lando-norris], 1920 × 1024 [site:oryzo], or one per breakpoint [site:warmnfuzzy]. Phone artboards run 375 to 402 [site:oryzo] [site:seasats] [site:ascension-pegassi].
- Draw the comp at 1440 × 900 and 390 × 844 unless the brief names other devices, and write artboard, columns, gutter and margin as tokens in `DESIGN.md ## Layout`. Height counts: Oryzo's unit takes the smaller of a width and a height ratio, so a short laptop shrinks the composition rather than cropping it [site:oryzo] [verified].

## Measure and text-column placement

Why: the eye has to find the next line on the way back, and past roughly 75 characters it starts to miss. The cards record column widths, not characters, so the ch values below are the plugin's (audit L07 fires above 90; the `awards:system` default is about 60–70).

| Placement | Width | Card | Confidence |
|---|---|---|---|
| Left third over footage, behind a shade | `min(35vw, 42rem)`, 504 px at 1440 | [site:christoph-nagel] | [verified] |
| Left quarter against a full-bleed canvas | ≈ 25 % | [site:animejs] | [verified] |
| Right third, two thirds left empty | ≈ 33 % | [site:911rennsport] | [verified] |
| Centred column for project copy | ≈ 65 % | [site:noth] | [inferred] |
| The grid minus its outer columns; 8-of-12 and 6-of-12 spans | 14 of 16; 67 % and 50 % | [site:mindmarket] [site:lama-lama] | [verified] |
| Stepped indents with side letters in the gutter; hero and statement hung from one hairline rule | `25% + .25rem` steps; — | [site:ascension-pegassi] [site:bleibtgleich] | [verified] |
| A right-aligned ragged mono column; text dropped into the gaps between giant glyphs | — | [site:usavionix] [site:spasoje] | [verified] |

Rules:
- Running prose: 60–70ch as `max-width` on the text element, never on the section (L07). The editorial recipe holds its paragraphs in about 58ch beside the figure [recipe:editorial-image-text].
- Display lines are measured in words. Three-line display headlines are the corpus habit in heroes [site:lama-lama] [site:usavionix] [site:haoqi] and closes [site:leo-parpeix] [verified on each card]; break by sense and check the same breaks at 390.
- Flush left, ragged right by default; centre only short statements. Justified copy in a narrow column opens rivers: centred justified caps [site:serotoninn] and justified body on the phone [site:wearedirect] [verified] are the ones to beat.
- A column over an image needs a quiet zone in the crop or a shade under the column alone: black from .88 to 0 by 72 % of the width [site:christoph-nagel] [verified]; over a busy painted world, a soft `0 0 .12em` shadow at .3 black on every DOM title [site:everswap] [verified]. A fixed header with no scrim over artwork is the miss [site:the-line] [verified].
- Labels, side letters and notes hang in the gutter or margin, outside the measure [site:ascension-pegassi] [site:grids-obys] [verified].

## Asymmetry and offset columns

Why: a symmetric section shows one thing at a time. An offset sets text against the space it leaves, and gives the chapter a direction.

| Device | Card | Confidence |
|---|---|---|
| Work cards at varied spans and starts on 12 columns; media at mixed sizes on 24 | [site:haoqi] [site:warmnfuzzy] | [verified] |
| An 85-item work grid whose spans repeat a twelve-item cycle (`gsap.utils.wrap([5,4,3,3,3,9,4,5,3,3,3,9])` columns, a matching thumbnail-size cycle), so a long index has an authored rhythm with no per-item art direction | [site:the-line] | [verified, 2026-10-28] |
| Uneven two-up tiles hung to the edges | [site:noth] | [inferred] |
| A quarter rail holding the only `<h1>` and the filters; a statement in the right third | [site:boc] [site:911rennsport] | [verified] |
| Headlines and menu items on staggered lines and indents; handwritten asides off the grid at a tilt | [site:the-boyd] [site:aardvarkbookclub] | [verified] |
| Four hairline quadrants meeting at a crosshair, the `<h1>` bottom-left | [site:abatable] | [verified] |
| A 50/50 split with one half blank wherever a column has nothing | [site:wearedirect] | [verified] — the miss |

Rules:
- Offset by whole columns and write the reason in the page map Notes: the empty side holds the picture's quiet zone, the next chapter's entrance or a margin label. An empty side with no job is the miss above.
- An offset holds only at the width it was drawn for. On tablet and phone the column takes the width or the section's own media fills the empty side (audit L10).
- One offset system per page. Varied spans, stepped indents and a tilted row on one page are three systems; keep one.
- Columns that open at very different heights read as an error (`anti-patterns.md`, Layout table); align their tops or first baselines.

## Image-area share

Why: the share of the viewport that is picture decides whether a chapter is looked at or read. The cards rarely measure it, so the bands are the plugin's, judged on a settled 1440 × 900 frame.

| Band | Share of the viewport | Evidence | Confidence |
|---|---|---|---|
| Plate | ≥ 80 %: media to the glass, type on it or at its edges | a reel with the logotype on its bottom edge [site:the-line]; a film hero with the wordmark edge to edge [site:white-desert]; an aerial plate with text in the corners [site:usavionix] | [verified] |
| Led | 50–80 % | imagery right of a 35vw column [site:christoph-nagel]; rows across three quarters of the width [site:boc] | [verified] |
| Shared | 35–50 % | the media half of a 50/50 split [site:wearedirect]; an image beside a half-width spec table [site:grids-obys] | [verified] |
| Accent | 10–35 % | media chips between the words of a manifesto [site:warmnfuzzy]; a product image inside a heading line [site:floema] | [verified] |
| None | < 10 % | centred statements on bare ground [site:goats] [site:nodeck]; two of five desktop frames almost empty [site:oryzo] | [verified] |

How image and type share a viewport [verified on each card]: type on an edge of the plate, a claim over a logotype stretched across the bottom [site:911rennsport] or a wordmark bleeding off the left edge [site:oryzo]; letters cut as holes onto a moving ground [site:bethebuzz] (`[recipe:knockout-wordmark-window]`); a title anchoring a row whose media runs off the far edge [site:lama-lama]; a chapter hue meeting film through a blur band [site:gehry-getty]. The miss: a scribble hiding part of a heading at 390 px [site:lando-norris].

Rules:
- Write the band per row in the page map Notes. Neighbours sit in different bands, and two Plate rows have an Accent or None row between them (`[pattern:narrative-structures#pacing]`).
- On a plate, the type goes where the picture is quiet, chosen when cropping rather than rescued with a scrim.
- Share belongs to the settled frame. Media that grows to the viewport changes band inside its chapter; record where it settles and name the growth in the beat (`[recipe:docked-media-grow]`).

## Full-bleed and contained

Why: whether a section touches the glass or sits inside the margin is the main depth cue on a page with no shadows.

| Move | Card | Confidence |
|---|---|---|
| Full bleed for the emotional chapters, a contained bone ground for the operational ones | [site:white-desert] | [verified] |
| Panels stepped in from the viewport: nav ≈ 160 px, content ≈ 48 px, footer ≈ 16 px at 1440 | [site:siteassist] | [verified, measured] |
| Full-bleed slabs of one hue with a 35–50 px bottom radius, stacked on a beige page | [site:mindmarket] | [verified] |
| Rounded section cards nested in a white page; cards one gutter apart so the ground shows in every seam | [site:aardvarkbookclub] [site:bethebuzz] | [verified] |
| A 1rem border framing the whole viewport | [site:wodniack] | [verified] |
| Inset to full bleed as the arrival: `inset(32% round 10px)` to `inset(0% round 0px)` over 1.4 s; a 4svw square growing to full bleed | [site:goats] [site:stanzza] | [verified] |
| Full bleed to exhibit: a reel shrinking from the full frame into a small window | [site:noth] | [verified] |
| A docked reel growing to the viewport minus 2 × 2rem, desktop only | [site:wearedirect] | [verified] |

Rules:
- Bleed when the picture is the argument; contain when the text is. A change of containment is one of the cheapest ways to make two neighbours differ.
- Bleed with `width: 100%` inside a container that spans the page, never `100vw` (audit L02); Floema measures the scrollbar so its viewport unit never includes it [site:floema] [verified].
- Insets and radii come from the tokens in `DESIGN.md ## Layout`, not a new inset per section. Moving between contained and full bleed is one chapter's authored moment, not every section's transition.

## Vertical rhythm and section spacing

Why: the gap between chapters is a beat. One gap everywhere groups nothing (`anti-patterns.md`, Layout table); a ladder keeps related things close.

| Spacing evidence | Card | Confidence |
|---|---|---|
| Spacing and section scales as `max(rem, vw)` pairs locked to 1440, from 10/20 px up to 160/320 px | [site:lama-lama] | [verified] |
| A fluid ladder topping out at `clamp(8rem, 7.3043rem + 3.4783vw, 10rem)`; stacked stats `10vh` apart | [site:mindmarket] | [verified] |
| Block padding `clamp(24px, 4.167vw, 60px)`: 60 px at 1440, 24 px at 390 | [site:bethebuzz] | [verified token] |
| A separator ladder on a 1.777rem base, from .444rem to 6.666rem | [site:stanzza] | [verified] |
| Scroll runway bought with empty spacer divs, apart from the margin tokens | [site:animejs] | [verified] |
| A pin ending where its content settles, plus a spacer that lets the next section show 25 px | [site:mensch] | [verified] |
| A hairline only where two neighbouring sections share a theme | [site:warmnfuzzy] | [verified] |

Rules:
- One ladder on the type's scale (`[pattern:responsive-strategy#fluid-clamp-from-a-baseline]`), used in three or four steps: inside a component, between components, between chapters, around the interruption.
- Space inside a group is smaller than the space around it; a heading sits nearer its own block than the block above.
- Section padding grows with the viewport and floors in rem, so a phone does not inherit a 320 px gap.
- Scroll runway is not spacing: buy it with section height or a spacer and keep the next chapter's edge in view as the hold ends [site:mensch]. A whole viewport with nothing in it is audit L09.
- The frame, measured beyond the corpus on 97 recent Awwwards Sites of the Day [external, taste-skill `references/layout.md` §4–5, read 2026-10-26]: strong pages hold their left and right margins within a few pixels of each other (audit L12); about one text section in a hundred leaves half the width empty (L13); 82 % of text sections open with a heading (L14); sections sit about 120–240 px apart on desktop (median about 230–250 px) and 72–112 px on a phone, and more than about 40 % of a screen of plain ground between two sections reads as a hole, not a rest (L15). These are the numbers the rendered audit's frame rules are tuned to; the ladder above stays the page's own.

## Layout families

Why: the Page map's Layout cell needs names for geometry rather than content, so a builder can see when two chapters are one layout in different clothes. The families are the plugin's names for compositions the corpus shows; write the world's name first and the family after it.

| Family | Geometry at 1440 | Usual band | On the phone | Card | Confidence |
|---|---|---|---|---|---|
| Plate | media to the glass; type on one edge or in the corners | Plate | its own crop; type above or below | [site:the-line] [site:911rennsport] [site:white-desert] [site:usavionix] [site:siena] | [verified] |
| Column over field | a text column ¼–⅓ wide on one side of a full-bleed scene | Led | copy first, scene under it | [site:christoph-nagel] [site:animejs] [site:shopify-editions-w26] | [verified] |
| Even split | two halves, media in one, type in the other | Shared | stacked in reading order | [site:wearedirect] [site:grids-obys] | [verified] |
| Offset split | unequal columns: ¼ + ¾, ⅓ + ⅔, `1.35fr 1fr` | Led or Accent | stacked, heading column first | [site:boc] [site:911rennsport]; [recipe:editorial-image-text] | [verified] |
| Centred statement | one centred column, few words, large | None | the same, smaller | [site:goats] [site:mensch] [site:nodeck] | [verified] |
| Index rows | full-width rows, often ruled: title, metadata, optional media | Accent | rows stay rows; media below the title | [site:lama-lama] [site:boc] [site:spasoje] [site:leo-parpeix] [site:cyphercapital] | [verified] |
| Uneven grid | tiles at varied spans and starts, or a masonry wall | Led | one or two columns, one offset step | [site:haoqi] [site:warmnfuzzy] [site:alectear] | [verified] |
| Figure and spec | an image or numeral beside a table | Shared | figure, then table | [site:grids-obys] [site:pensatori-irrazionali]; [recipe:product-specification] | [verified] |
| Object stage | one centred object, chrome pinned to corners and edges | Led | object larger, panels below | [site:areebali] [site:a24-raviklaassens] [site:igloo] [site:aqualoqa]; under left-set titles with a bottom-centre card [site:da-san333] | [verified] |
| Edge-to-edge type | a word or title spans the measure | None or Accent | two lines, or scaled to the width | [site:white-desert] [site:gehry-getty] [site:bethebuzz] [site:spasoje] | [verified] |
| Stepped indent | lines or paragraphs on a stair of indents | None | one or two steps | [site:ascension-pegassi] [site:the-boyd] | [verified] |
| Rail | a horizontal track inside the vertical page | Led | native overflow with snap and a peek | [site:goats] [site:leo-parpeix] [site:robbietilton] [site:son-daven] | [verified] |
| Stack | sticky cards or panels piling up, a copy column opposite | Led | a plain vertical sequence | [site:mindmarket] [site:abatable] | [verified] |

Rules:
- A new ground, accent or set of content does not make a new family; repainting one component set per chapter [site:mindmarket] [verified] is a colour system, not layout variety.
- A frame repeated per item is one row: five plants in one chapter frame [site:eugeniagrab], one beat repeated twelve times [site:shopify-editions-w26], one composition held through every chapter while only the machine changes [site:animejs] [verified on each card]. Enter a series as one page-map row and make its neighbours differ from its frame.
- Recipes per family: `[recipe:horizontal-rail]` and `[recipe:sticky-stages-rails]` (Rail), `[recipe:sticky-stack-cards]` (Stack), `[recipe:filmstrip-index-rows]` and `[recipe:hover-preview-list]` (Index rows), `[recipe:responsive-art-directed-hero]` (Plate); rendered pacing examples in `[pattern:visual-composition]`.

## Composition by chapter type

Why: a chapter's job narrows which families fit. Entrance, motion and DOM of the first viewport are in `[pattern:hero-archetypes]`; this table records only geometry.

| Chapter | Composition seen | Card | Confidence |
|---|---|---|---|
| Hero, poster or film | full-bleed media with display type on or across the bottom edge; a pill or card parked in a lower corner | [site:the-line] [site:911rennsport] [site:usavionix] [site:oryzo] | [verified] |
| Hero, type over footage | a three-line headline, the intro paragraph right, a small portrait card top right | [site:lama-lama] | [verified] |
| Hero, split | a render card left and the headline right; a headline split either side of a bust | [site:wearedirect] [site:primesec] | [verified] |
| Hero, object or quadrants | an object at fixed size with panels at three corners; four hairline quadrants, the `<h1>` bottom-left | [site:areebali] [site:abatable] | [verified] |
| Hero, the work itself | tiny labels in the four corners, the work everywhere else | [site:jesperlandberg] | [verified] |
| Statement | one centred column at display size; a display paragraph with media chips between words | [site:goats] [site:mensch] [site:warmnfuzzy] | [verified] |
| Work or index | a quarter rail beside rows; full-width rows with a rail off the right edge; a ruled key-value table; varied spans on 12 columns | [site:boc] [site:lama-lama] [site:spasoje] [site:haoqi] | [verified] |
| Specification | an image beside a half-width hairline table; a huge script numeral beside a spec table; a credit table | [site:grids-obys] [site:pensatori-irrazionali] [site:a24-raviklaassens] | [verified] |
| Long read | full-bleed film, one drop-cap letter, an essay column, mono captions | [site:gehry-getty] | [verified] |
| Series frame | an outline numeral, a caps title and a quotation beside the subject, repeated per object | [site:eugeniagrab] | [verified] |
| Interruption | one saturated panel against the page's ground | [site:bethebuzz] [site:stanzza] | [verified] |
| Close | the wordmark at full width or giant scale | [site:911rennsport] [site:cyphercapital] [site:pensatori-irrazionali] [site:runrobrun] [site:to-top] [site:usavionix] [site:warmnfuzzy] [site:mensch] [site:noth] [site:primesec] [site:seasats] [site:bleibtgleich] | [verified] |

Rules:
- Twelve cards end on a giant or full-width wordmark: it is the corpus's default close. Take it only when the name is the thesis; otherwise end on the next action at the page's own scale (`[pattern:narrative-structures#the-close]`, `[pattern:components-catalog#designed-footer]`, `[recipe:designed-footer]`).
- The hero's family returns at the close only as a named bookend: one thin line grid seen through hero and footer ties open and close [site:okaydev] [verified].
- The interruption is the one row allowed to leave the grid (`[pattern:narrative-structures#the-interruption]`). A read-mode page puts its index in the first viewport (`[pattern:hero-archetypes#choosing]`).

## Desktop, tablet, phone

Why: scaling, pointer swaps and the reflow, zoom and target checks are settled in `[pattern:responsive-strategy#decide-before-build]` and `[pattern:responsive-strategy#checks]`. Here: what changes in the layout itself.

| Desktop → phone | Card | Confidence |
|---|---|---|
| 24 → 8, 16 → 6 → 4, 12 → 8 → 6 → 4 and 16 → 8 → 4 columns | [site:seasats] [site:oryzo] [site:trevor-noah] [site:united-carriers] | [verified] |
| A quarter text column beside a full-bleed machine → headline on two lines, machine centred below, code panel dropped | [site:animejs] | [verified] |
| A staggered hero scaled whole between 640 and 1100 px, then reflowed to a column | [site:zainabkabira] | [verified] |
| Four fixed zones → credits on top, disc centred, nav at the bottom | [site:a24-raviklaassens] | [verified] |
| Masonry 3 → 2 → 1 at 1200 and 580 px; four equal cards → stacked | [site:alectear] [site:mensch] | [verified] |
| A 20 % rail beside two columns → one column with the scene as a cropped band; a quarter sidebar → an inline block above full-bleed rows | [site:shopify-editions-w26] [site:boc] | [verified] |
| Centred cards `min(65vh, 614px)` tall → `74vw` squares below 920 px, the neighbour's peek from 10 % to 14 % | [site:robbietilton] | [verified] |
| One object refitted to 94 % of the width, the bands beside it filled with mirrored ground | [site:aqualoqa] | [verified] |

Rules:
- Phone order is reading order: the figure the prose explains, its caption, then the prose [recipe:editorial-image-text]; no CSS `order` that makes the visual sequence differ from the DOM.
- Splits stack; offsets collapse to the full width inside the margins; an uneven grid keeps one offset step at most.
- Tablet portrait is a layout of its own: give it the grid's middle count where one exists, and check it for lopsided sections (L10). Under a vw-lock that hands off to fixed px at 1024 [site:the-line] [verified], tablets get the phone values; test that width on purpose.
- Each family keeps its identity on the phone: a Plate gets its own crop (`[recipe:responsive-art-directed-hero]`), a Rail becomes native overflow with a peek, a Stack becomes a plain sequence.

## Choosing a layout for a chapter

Why: without a procedure each chapter inherits the layout of the one before. Run these steps per row of `AWARDS.md ## Page map`, top to bottom, after the beats are written and before any markup.

1. **Inventory the row**: words of prose, images or clips, list items, data rows, one object. A twelve-item list cannot be a centred statement; one sentence cannot fill an uneven grid.
2. **Name the dominant**: picture (Plate, Led), type (None, Accent), list (Index rows, Uneven grid, Rail), data (Figure and spec) or object (Object stage). On a tie the beat decides: a hold the visitor watches leans to picture, one they read leans to type.
3. **Pick the family, then the axis, then the band**: family from `#layout-families`; axis left, right, centre or edge; band from `#image-area-share`.
4. **Place it on the grid at 1440**: spans and starts in columns (`copy 4/12 from col 1 · film 8/12 bleeding right`), the measure in ch, the containment (bled, margin or inset).
5. **Write the phone in one line**: order, column count, what drops, what is re-cropped.
6. **Test the adjacency rules** against the rows above and below. When one fails, change the family first, then the axis, then the band — never only the colour.
7. **Fill the cell**: the world's name, then family, axis and band, as in `site-office noticeboard (Index rows · left · Accent)`; spans, measure and the phone line go in Notes.

Adjacency rules (the plugin's; no card states them):
- Two neighbouring rows never share a family. The same family with a new ground, new content or a mirrored axis is still the same layout.
- No three consecutive rows share an axis; a centred row is followed by an off-centre one.
- Neighbouring rows differ in band; two Plate rows have an Accent or None row between them.
- No three consecutive rows share containment, all bled or all inside the margin.
- A page of six or more chapters uses four or more families; the hero's family returns only at the close, as a named bookend.
- A series is one row, and its neighbours differ from its frame. Only the interruption may leave the grid.

A synthetic check, from no card: `Plate · bottom edge · Plate · bled` → `Centred statement · centre · None · margin` → `Index rows · left · Accent · margin` → `Figure and spec · right · Shared · figure bled right` → `Edge-to-edge type · edge · None · margin`. Five families, no axis or band twice running, containment changing within every three rows, and the close does not reuse the hero's family.

## Fingerprints

Why: the numbers each card records, in one place, so a new build can see where its values fall and avoid landing on a neighbour's set. Evidence, not defaults: take a range, never a row. Display is the largest display token at 1440 / 390; where a card gives no root size, 16 px is assumed and the row says so.

| Card | Columns | Gutter 1440 / 390 | Margin 1440 / 390 | Display 1440 / 390 | Image share | Confidence |
|---|---|---|---|---|---|---|
| [site:the-line] | [unknown] | [unknown] | ≈ 18 / 8 px | ≈ 175 / 72 px | Plate hero | [verified] |
| [site:lama-lama] | 12 → 6 | 24 / 10 px | 40 / 16 px | [unknown] | spans 8-of-12, 6-of-12 | [verified] |
| [site:floema] | 24 | ≈ 25.5 / 14 px | ≈ 32 / 16 px | [unknown] | Plate chapters | [verified tokens; phone layout unknown] |
| [site:oryzo] | 16 → 6 → 4 | 24/90 of a column | 45 / ≈ 16.6 px | ≈ 123 px / h1 96 on the 375 artboard | two of five frames almost empty | [verified] |
| [site:seasats] | 24 → 8 | 12 / ≈ 12 px | 32 / ≈ 16 px | [unknown] | renders near full bleed | [verified tokens] |
| [site:mindmarket] | 16 → 6 | 20 px | one column each side | [unknown] | full-bleed slabs | [verified] |
| [site:united-carriers] | 16 → 8 → 4 | [unknown] | 4rem / 1.6rem | [unknown] | [unknown] | [verified; breakpoint mapping inferred] |
| [site:trevor-noah] | 12 → 8 → 6 → 4 | ≈ 30.5 / 10 px | [unknown] | 450 px at the clamp's top, width [unknown] | [unknown] | [verified] |
| [site:white-desert] | 12 → 8 | `.75em`, ≈ 12 px | [unknown] | wordmark edge to edge | Plate chapters | [verified; px inferred] |
| [site:agrumeafarm] | 12 | ≈ 21 / 12 px | [unknown] | ≈ 205 / 89 px | [unknown] | [verified tokens; px inferred, 16 px root] |
| [site:mont-fort] | 24 | [unknown] | 18 → 150 px across breakpoints | 5rem top step | [unknown] | [verified] |
| [site:warmnfuzzy] | 8 / 16 / 24 | 10 or 16 px | 16 px | steps 12 to 320 px | mixed-size media | [verified] |
| [site:runrobrun] | 12 | 24 px | [unknown] | 120 / 48 px | [unknown] | [verified] |
| [site:haoqi] | 12 | [unknown] | 56 / 16 px | [unknown] | varied spans | [verified classes; px inferred] |
| [site:gehry-getty] | 6 | [unknown] | 2rem / 1.2rem | [unknown] | film beside an essay column | [verified; order of the pair inferred] |
| [site:alectear] | 12; masonry 3 → 2 → 1 | `.5rem` | [unknown] | [unknown] | a wall of tiles | [verified] |
| [site:boc] | 4 → 1 | 15 px | 15 / 20 px | [unknown] | rows on three quarters | [verified] |
| [site:bethebuzz] | [unknown] | 20 / 10 px | 20 px | hero word ≈ 300 px tall / [unknown] | [unknown] | [verified tokens; word size inferred] |
| [site:cyphercapital] | 2 | 32 px | [unknown] | 80 px top step | [unknown] | [verified] |
| [site:911rennsport] | a 12-column feel | [unknown] | 40 px | ≈ 64 / 40 px | statement in the right third | [verified; px inferred, 16 px root] |
| [site:christoph-nagel] | one fixed stage | — | — | ≈ 187 / 64 px | 35vw column left, imagery right | [verified] |
| [site:wodniack] | [unknown] | — | 1rem frame | ≈ 216 / 58 px | [unknown] | [verified token] |
| [site:goats] | one centred column | — | — | ≈ 98 / 44 px | [unknown] | [verified token] |
| [site:okaydev] | [unknown] | — | 80 px round the header | ≈ 72 / 48 px | [unknown] | [verified token] |
| [site:grids-obys] | 8, overlay | ≈ 14 px | [unknown] | ≈ 110 px titles, ≈ 280 px wordmark / phone gated | half-page split | [verified overlay; sizes inferred] |
| [site:wearedirect] | 2 | [unknown] | [unknown] | 68 / 60 px | half | [verified] |
| [site:daikifujita] | 12 → 4 bays | none | `clamp(20px, 2.8vw, 48px)`: ≈ 40 / 20 px | works titles ≈ 78 / 46 px; the hero line fitted to the viewport | one object over a type marquee | [verified tokens; px inferred] |
| [site:everswap] | 16 → 8 | .15 of a column | [unknown] | h1 200 / ≈ 102 px, drawn in GL | a painted world to the glass | [verified tokens; px inferred] |

Reading the table:
- Four rows can pass 13 vw (≈ 187 px at 1440): a wordmark clamped up to 450 px [site:trevor-noah], a clamp with no real ceiling [site:agrumeafarm], a 15 vw poster face [site:wodniack] and a knockout word across the width [site:bethebuzz] (size inferred). Audit T03 holds display type near 12–13 vw (`[pattern:typography#fluid-scale]`); a word that spans the measure is an Edge-to-edge type row and is recorded under `AWARDS.md ## Exceptions`.
- No two cards share columns, gutter and margin. Write your three in `DESIGN.md ## Layout`, compare them with the three nearest cards, and change one if they land on a row.
- Not in the table: canvas-first cards whose composition is camera framing (`#grid-systems-seen`), and Slosh, whose layout and composition are [unknown] because the capture was gated [site:slosh-seltzer].

## Verify

- [ ] `DESIGN.md ## Layout` holds artboard, desktop / tablet / phone columns, gutter, margin, prose measure and the spacing ladder as tokens.
- [ ] Every page-map row has a Layout cell (world name, family, axis, band) and Notes with spans at 1440 and the phone order.
- [ ] The adjacency rules pass for every pair of neighbours; four or more families on six or more chapters; each series is one row.
- [ ] Prose at 60–70ch, flush left; display breaks checked at 1440 and 390.
- [ ] Every offset has a written reason and collapses or fills at tablet and phone (L10).
- [ ] Bleeds use `100%` (L02); insets and gaps come from tokens; no blank viewport (L09); text keeps the gutter at 390 (L08).
- [ ] Desktop and phone captures show each chapter's family, in DOM order.

## Refuse

- One layout for every chapter, or one family in two neighbouring rows under a new ground.
- A grid count by habit; twenty-four columns with only halves in use.
- Prose wider than about 75ch, justified narrow columns, centred paragraphs over three lines.
- An offset whose empty side has no job, a 50/50 split with a blank half, asymmetry kept on a phone.
- Grid lines as texture with nothing on them, or a dev overlay shipped by accident (X09).
- `100vw` bleeds, an inset invented per section, one gap everywhere.
- A full-width wordmark close by default; the hero's family reused mid-page.
- Any card's fingerprint as a set: The Line's 1728 artboard with an 8 px phone margin, Lama Lama's 12 columns at 24 / 40 px, Floema's 24-column clamps, Oryzo's ratio gutter, Seasats' 24 / 1.2rem / 3.2rem, Boc's quarter rail at 15 px, Christoph Nagel's 35vw column over footage.
