# Grids (Obys) — https://grids.obys.agency/

<!-- Labels: [verified] (fetched source, named) · [recalled] (memory; high/medium/low) · [inferred] (genre-typical) · [unknown]. No hex, date, score, library or credit without a label. Site copy only in fragments ≤ 25 words. Keep under 200 lines. -->

| Field | Value |
|---|---|
| Class | docs — a studio's educational explainer on layout grids, one of a series after typography and colour [verified, index.html meta description + `desktop-s100.png` "Prev. project" rows] |
| Visitor mode | read — four grid types, tips, worked examples from the studio's own projects and a reading list; no conversion beyond an e-mail line [verified, wait/desktop-s00 to s100.png] |
| Awards | Awwwards **Site of the Day, 1 Sep 2021, 7.83** — D 8.03 / U 7.44 / C 8.02 / Co 7.83 [verified, entry page, `entry/entry.html`] |
| | Developer Award 7.19 — Semantics/SEO 7.40, Animations 8.40, Accessibility 6.00, WPO 6.40, Responsive 7.00, Markup 7.80 [verified, entry page] |
| | Site of the Month September 2021 [unknown — an Awwwards article title in one search result, article not read] |
| Corpus rating | D 7.8 / U 5.8 / C 7.6 / Co 7.6 → weighted 7.14, 2026-09-23 [inferred, from captures against references/jury/rubric.md]; official scores stay in the Awards row |
| Studio / credits | Obys, with Viacheslav Olianishyn and Olha Olianishyna named on the entry [verified, entry page]; the page footer credits Obys Agency [verified, desktop-s100.png] |
| Stack (evidence level) | **Readymag** no-code publishing platform, project 3031437 [verified, index.html `meta generator="Readymag"`, bundles on `st-p.rmcdn1.net`] · all motion is Readymag's native widget animation engine (scroll / load / click steps stored as JSON) [verified, index.html `"animation"` arrays] · no GSAP, Lenis, Three.js, anime.js or page-transition library signature [verified absent, index.html] · one custom CSS rule: a cursor PNG hotlinked from Dropbox [verified, index.html `ci_css`] · Google Tag Manager + GA4 [verified, manifest.json requests] · fonts: an uploaded face named "Grids" (`custom_40538`, weight 400 only) + Google "Mr Bedfort" [verified, index.html font list] |
| Palette | page ground `#F1F1F1` [verified, index.html `bg_color`] |
| | ink and dark chapter ground `#000000` [verified, index.html `bg_color` on 17 shapes] |
| | text style colour `#222222` [verified, index.html `cssProperties.color`] |
| | platform body colour `#282828` [verified, index.html inline Readymag CSS] |
| | selection `#A2A2A2` [verified, index.html `::selection`] |
| | Strategy: **achromatic ground + black ink, one full inversion for the chapter opener, no accent; a user-switched second world floods the page acid yellow** (yellow hex not read) [verified, wait/desktop-s25.png, states/desktop-state-crazy-on.png] |
| Type | one grotesque, one weight, from 14 px labels to full-width caps; outline cuts of the same letters as illustration [verified, captures + font list]; the uploaded face's retail name [unknown], neo-grotesque in the Helvetica family of shapes [inferred, wait/desktop-s00.png]; a Google script face only inside the alternate mode [verified, font list + states/desktop-state-crazy-on.png] |
| WebGL dosage | none — `canvases: 0` on every pass [verified, manifest.json] |
| Scroll model | native, no smoothing library; the four Readymag pages run as one continuous document scroll with the URL rewritten per page; widget transforms keyed to scroll pixels [verified, manifest.json GA `dl`/`dr` pairs / → /columns_vandegraaf/ → /booksandcredits/, `scrollMode: native`] |
| Narrative model | print artefact — an illustrated grid handbook: cover, chapter opener, worked examples with spec tables, margin notes, bibliography and colophon [verified, wait/desktop-s00 to s100.png, states/desktop-state-keyboard-tab.png] |

## 1. Concept and narrative
**One idea:** a site about grids that is visibly built on one, and lets the reader switch the grid on. The page argues its subject by exposing its own construction — sparse vertical rules in the cover, a translucent column overlay on demand, spec tables that name each grid's margins and power lines [verified, wait/desktop-s00.png, states/desktop-state-grid-on.png, wait/desktop-s50.png].

Beats seen across the scroll: a light cover with the intro in two lines and the wordmark set edge to edge, a black square standing in as its first letter [verified, wait/desktop-s00.png] → a black chapter opener for the four grid types with a big light square rotated across the title [verified, wait/desktop-s25.png] → worked examples: a project screenshot with its construction lines drawn over it beside a hairline table of grid name, margins, power lines and paddings [verified, wait/desktop-s50.png] → numbered notes set large with underlined key terms and a "(Notes)" label in the margin, a tilted lattice of rules sliding in beneath [verified, wait/desktop-s75.png] → a reading list drawn as book spines standing among outline letters, then credits [verified, states/desktop-state-keyboard-tab.png, desktop-s100.png].

Register: plain, teacherly, first-person plural; notes read like a lecturer's margin comments [verified, captures].

## 2. Structure and components
- **Routes:** four Readymag pages — Main, Columns & Van De Graaf, Rectangular & Others, Books and Credits [verified, index.html `uri`/`title`], chained by `rel="next"` [verified, index.html] and read as one scroll.
- **Preloader:** a black square turning in 90° steps at the centre, "Loading..." bottom-left, a numeric counter bottom-right, and the header rule growing left to right as the progress bar — at 20 it spans ≈ 340 px, at 70 ≈ 860 px [verified, desktop-s00.png, desktop-rm-s00.png]. The rule then stays as the nav baseline [verified, wait/desktop-s00.png].
- **Top bar:** logo square + GRIDS, an Intro / Grids / Books breadcrumb-style nav, two pill toggles (Grid: On/Off, Crazy Mode: On/Off), studio credit and year at the right [verified, wait/desktop-s00.png]. Widgets are named "Grid trigger" and "Crazy trigger" in the page JSON [verified, index.html].
- **Grid toggle:** On lays eight translucent grey columns with ≈ 14 px gutters over the entire page, content included [verified, states/desktop-state-grid-on.png; column count and gutter measured from the frame].
- **Crazy mode:** On floods the ground yellow and releases script-face flourishes that loop over the wordmark [verified, states/desktop-state-crazy-on.png]. Obys describes it as a shift from clean to floating shapes [verified, one search-result summary of the entry; not re-read].
- **Spec table:** hairline rows, label left, value right, on a half-width column beside the example image [verified, wait/desktop-s50.png].
- **Bibliography:** six grid books as outlined spines of different heights, one leaning, between outline letters [verified, states/desktop-state-keyboard-tab.png].
- **Colophon:** hairline table with credits, an e-mail and links to the two previous projects in the series; a huge outline letter cropped off the left edge [verified, desktop-s100.png].
- **Phone:** a portrait gate — wordmark, a rotate-your-device line, a black rectangle turning in steps, then "wait a few seconds" [verified, mobile-s00.png, mobile-s75.png]; no portrait content in any of the five frames [verified, mobile-s00 to s100.png].
- **Cursor:** a custom PNG cursor by CSS [verified, index.html]; it failed to load headless [verified, manifest.json `ERR_CERT_AUTHORITY_INVALID`].

## 3. Visual language
- **Grounds:** light grey paper with black ink; one full inversion to black for the chapter opener; project screenshots sit on charcoal plates [verified, wait/desktop-s25.png, s50.png].
- **Type:** one grotesque at one weight carries everything — 14 px table labels, ≈ 18 px intro, ≈ 44 px notes, ≈ 110 px caps titles, a wordmark ≈ 280 px tall [inferred sizes, measured from 1440-wide frames]. Hierarchy is scale and case only. Outline versions of the same letters become illustration (the Books letters, the cropped S) [verified, captures].
- **Imagery:** the studio's own project screenshots with grid construction overlaid, plus flat geometric shapes — squares, rules, lattices [verified, wait/desktop-s50.png, s75.png].
- **Layout:** a strict column system with hairline rules as the main ornament; tables align to the same half-page split as the header [verified, wait/desktop-s50.png, desktop-s100.png].
- **Browser surfaces:** a grey selection colour from platform CSS [verified, index.html]; no `lang` [verified, manifest.json `lang: null`]; no `theme-color` [verified absent, index.html].

## 4. Motion and effects (with parameters)
All numbers are read from the Readymag animation JSON in index.html [verified].
- **Preloader square:** five load steps, each `duration 0.8 s` after `delay 1.2 s`, rotating to 90 / 180 / 270 / 360 / 450°, `ease-out` then `ease-both`.
- **Arrival:** cover elements enter on load at `delay 3.8 s`, `duration 0.6 s`, `ease-out` or `ease-both`, moving `dy -224 px` and settling from `-7°` to `0°` — so the gate holds about 4 s by script.
- **Scroll choreography:** steps keyed to scroll distance, `start_point: bottom`, e.g. a shape that waits `delay_px 1174`, then moves `dx 70 / dy -241` while turning to 90°, then 180° (`ease-in`), later 270° after `delay_px 1730`; another tilts to `-7°` over `delay_px 330` with `dy 300` [verified]. Squares tumble between positions in quarter turns as the reader scrolls.
- **Crazy-mode shapes:** load loops of `duration 3 s`, `loop: swing`, travel up to `dx 1814 px`, rotating to 1080° [verified values; which widgets belong to the mode inferred].
- **Transitions:** none between routes; the next page is already below in the scroll [verified, manifest.json].
- **Reduced motion:** no branch — the preloader, arrival and scroll rotations run the same [verified, desktop-rm-s00.png, desktop-rm-s75.png, manifest `reducedMotion: true`].

## 5. Tech and pipeline
| Layer | Choice | Evidence |
|---|---|---|
| Platform | Readymag, dozens of hashed module chunks from its CDN | index.html `modulepreload` list [verified] |
| Motion | Readymag widget animation (scroll / load / click triggers) | index.html JSON [verified] |
| Fonts | uploaded "Grids" face via `/api/fonts/…/css`; Google Mr Bedfort | index.html [verified] |
| Analytics | GTM + GA4 | manifest.json requests [verified] |

- Served HTML 120 KB with the page JSON inlined [verified, `wc -c` index.html]. DOM 5,348 nodes on desktop, 465 on the phone gate [verified, manifest.json].
- The manifest reports CLS 4.41 across the desktop run [verified, manifest.json], probably inflated as later pages mount below [inferred].
- Phone pass logs four `TypeError … imgSrc` page errors [verified, manifest.json].
- Resize strategy: fixed-width desktop artboard with separate tablet-portrait and phone-portrait variants in the JSON [verified, index.html `viewport_*` keys]; the phone-portrait variant is the gate [inferred].

## 6. Weaknesses
- Reduced motion: **fail** — identical motion and the same scripted gate [verified, desktop-rm-s00.png, wait/desktop-rm-s00.png].
- Keyboard: **fail** — three Tabs jump the view to the bibliography with no visible focus ring [verified, states/desktop-state-keyboard-tab.png]; the toggles are pointer-built widgets [inferred from the JSON widget types].
- DOM behind the canvas: **n/a** — no canvas; but the DOM is absolutely positioned platform widgets with no `lang` [verified, manifest.json].
- Load gate: **fail** — ≈ 4 s scripted hold on every visit, no repeat-visit skip [verified, index.html delays; captures].
- Phone: **fail** — portrait refused outright; the reader must rotate and wait [verified, mobile-s00 to s100.png].
- Wayfinding and conversion: **partial** — the breadcrumb nav names the three parts but does not mark the current one [verified, captures]; the e-mail lives only in the colophon.
- The official Accessibility 6.00 and WPO 6.40 agree [verified, entry page].

What the awards skills do differently: build the grid overlay as a real `<button aria-pressed>` with a focus ring [pattern:accessibility-and-reduced-motion#keyboard-paths-for-gates], lay the phone out instead of gating it [pattern:responsive-strategy#dedicated-mobile-versus-graceful-degrade], hold the loader on a real signal and skip it on repeat [recipe:preloader-counter-hold], and give the tumbling shapes a static tier [recipe:reduced-motion-switch].

## 7. Principles
1. **Make the subject the interface.** When a site teaches a method, let the reader switch the method on over the page itself; exposing the construction is the argument.
2. **One face, one weight, many scales.** A single grotesque can carry cover, tables and notes when hierarchy comes from size, case and outline alone.
3. **Let a progress bar become chrome.** A loader rule that grows into the nav baseline makes the wait part of the layout instead of a curtain.
4. **Give a sober system one sanctioned escape.** An opt-in alternate mode lets a rigorous design show range without breaking its default register.
5. **Draw references as objects.** A reading list set as standing spines is remembered where a bulleted list is skipped.

## 8. Take / Don't take
- **Take:**
  - A toggleable construction overlay that reveals the page's real columns, with its state named in the control.
  - Spec tables with hairline rows that quantify a design decision (margins in px, number of power lines).
  - Shapes that change in quarter turns keyed to scroll distance, with ease-out in and ease-in out.
  - A loader whose progress element persists as a structural line.
  - Margin labels hung outside the text block for notes.
- **Don't take:**
  - The light-grey paper ground `#F1F1F1` as a look [verified, index.html]
  - Pure black `#000000` for ink and the inverted chapter [verified, index.html]
  - The text grey `#222222` [verified, index.html]
  - The yellow flood and script flourishes of the alternate mode, the black square as wordmark letter, the book-spine bibliography, the outline-letter crops.
  - The part order (cover → types → examples → notes → books) and the copy lines.
  - The rotate-your-device gate, a scripted 4 s hold and a motion path with no reduced tier — the things to beat.

## 9. Confidence and sources
| Section | Confidence |
|---|---|
| Header, stack, palette, type | high — served HTML with the page JSON; face retail name unknown |
| Award | high — scores read on the entry page; SOTM from a search title only |
| Concept, structure, visual language | high — desktop, reduced-motion, post-loader and three interaction states |
| Motion parameters | high — read from the animation JSON |
| Weaknesses | high for gate, phone, reduced motion; medium for keyboard (one Tab state) |

**Live pass 2026-09-23: reachable, capture exit 2 (hotlinked cursor, blocked GTM, phone TypeErrors), scroll mode native, no wheel retry needed.** desktop-s00 caught the loader at 20, so the site was recaptured once with `--wait 6000` into `wait/`; three desktop states (Grid on, Crazy mode on, three Tabs) into `states/` via pointer coordinates and key presses. Sources in `.awards/research/grids-obys/`: 15 captures + `manifest.json`, `wait/`, `states/`, `index.html`. Award entry `awwwards.com/sites/grids` captured desktop-only into `entry/` with `entry.html`. Not observed: the Rectangular & Others page on its own, phone landscape, a real GPU or a repeat visit.
