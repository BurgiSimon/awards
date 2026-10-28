# Inner pages

What this file is for: the routes behind the home page. It covers the case study, the project or product detail, the article, about, contact and enquiry, the index or archive, and the 404. For each it gives the job, a structure that suits it, and how the home page's world carries in without repeating the hero, plus the transitions between home and inner routes. Read it when `structure` writes the page map for more than one route. Cite it as `[pattern:inner-pages#section]`.

The evidence is thin, and this file says so first. No card captures a case-study, product, article, about or 404 route of its site. One card reads a `/work` index rather than a home page [site:boc], and one 404 is seen only in the award entry's own images [site:pensatori-irrazionali]. 49 of the 62 cards record their inner routes or their 404 as not observed or unknown [verified: search of the cards, 2026-10-22]. What the corpus knows comes from route lists, route-scoped CSS and bundle code. Juries do open inner pages; one entry's highlighted elements include its vessel pages and case studies [site:seasats] [verified]. Most rules below are therefore plugin rules, cited to a card only where one shows the mechanism.

## Contents
1. [What the corpus shows](#what-the-corpus-shows)
2. [Carrying the world in](#carrying-the-world-in)
3. [Case study](#case-study)
4. [Project or product detail](#project-or-product-detail)
5. [Article](#article)
6. [About](#about)
7. [Contact and enquiry](#contact-and-enquiry)
8. [Index and archive](#index-and-archive)
9. [Not found](#not-found)
10. [Transitions between home and inner pages](#transitions-between-home-and-inner-pages)
11. [Verify](#verify) · [Refuse](#refuse)

## What the corpus shows

| Card | Inner routes and what is known | Confidence |
|---|---|---|
| [site:the-line] | `/work/<slug>`, `/blog/<slug>`, `/about`, `/contact`, `/shop`; route-scoped CSS for case pages, the work layout, a filter panel and a director's note; a designed 404. Rendered 2026-10-28: `/work` (a filterable grid or a sortable list) and one case (an overprinted hero with a call-sheet row, a crew panel, credits as one run of role / name pairs, and a close that is the next case's hero, handed over node by node) | [verified, served markup and captures] |
| [site:zainabkabira] | case studies entered by a tile-to-hero shared-element morph, then a cover-slide deck with a section pager, looping recordings and an 8 s auto-advancing "read next" slide; plain scroll at ≤ 820 px | [verified] |
| [site:boc] | each still links "Open case study: …"; the chosen row rises under the bar before the route is pushed | [verified] |
| [site:a24-raviklaassens] | `/production/<slug>`; the disc flies into its route | [verified]; routes [unknown] on screen |
| [site:agrumeafarm] | `/dispensa/<slug>` per product; the jar is cloned and flown into its page | [verified]; product pages [unknown] |
| [site:lama-lama] | modules for case items, highlighted cases, case filters, a post grid, a team list, contact and a 404 | [verified, module graph] |
| [site:united-carriers] | route chunks for article, career, contact, merchandise and checkout; a 404 with an animated truck | [verified] |
| [site:son-daven] | article scenes in dark and light and an error scene in the bundle | [verified]; progress articles [recalled medium] |
| [site:nodeck] | three redacted case studies as panels opened by `aria-controls` buttons | [verified] |
| [site:areebali] | a case study that expands into an overlay with *esc to close* and a 44 px close button | [verified, code]; not captured |
| [site:jesperlandberg] | a `/full` index beside the reel, and `/projects/<slug>` | [verified]; not visited |
| [site:siena] | `/films/<slug>`, entered by an EXPLORE ticket on each frame | [verified]; not visited |
| [site:gehry-getty] | an `/accessibility` route with its own layout, linked first in the header | [verified]; not visited |
| [site:mont-fort] | a news link with an unread-count badge and a visited-news chunk | [verified] |

## Carrying the world in

Why: an inner page that restarts the home page's opening tells the visitor nothing new. One that drops the world reads like a different site.

- **The hero is not repeated.** An inner page opens on its own subject: a title one step below the home display size, its own image or film, and its metadata. The home page's signature (the object, the scene, the big set-piece) is not restaged.
- **What carries.** Tokens, the type contract, the cursor, the sound state, the nav and the footer carry over. So does the unifier pass (grain, a material, the ground) at a lower dose (`[pattern:webgl-architecture#unifier-versus-narrative-shaders]`). A theme per route is the cheapest carrier: a template declares its ground and ink and `<html>` tweens to them (`[recipe:theme-swap-tokens]`, `[pattern:preloaders-and-transitions#theme-swap-as-a-transition]`).
- **The transition is the bridge.** The element clicked on the home page becomes the inner page's first frame (see the last section).
- **No second preloader.** After the first load, inner routes enter through the transition. A hard load of an inner route gets the CSS loader at most, never the home page's sequence. A click gate and a hold on every visit to two routes is the miss [site:ascension-pegassi] [verified].
- **Assets per route.** Fonts and scenes load where they are used. Ten families on the home route for mock-ups seen only inside case studies [site:zainabkabira] [verified] is the miss. Scenes are disposed on route change (P07, `[pattern:webgl-architecture#scene-windows-and-disposal]`).
- **Own head.** Every inner route has its own title, description, canonical, share image and structured data (`[pattern:seo-and-semantics#the-head-per-route]`).

## Case study

- **Job.** Prove the home page's claim with one piece of work: what was asked, what was made, what changed, and who made it.
- **Structure.** Title with a metadata row (client · year · discipline · team) → one lead image or film → context in ≤ 80 words → three to five chapters alternating media and text → the result as numbers with units → credits by role (`[pattern:copy-and-content#credits-pages]`) → the next project as a real link.
- **World.** The still the visitor clicked becomes the lead image. Chapters use the home page's reveal vocabulary at routine durations, and the set-pieces stay on the home page.
- **Corpus.** A deck with a section pager and a "read next" slide that advances after 8 s [site:zainabkabira] [verified]; a director's note and a crew panel on case pages, the credits as one justified run of role / name pairs, and a close that is the next case's hero, hinged, which becomes the next page's hero when followed [site:the-line] [verified]; case blocks with poster confidence [site:lama-lama] [recalled low-medium] (`[pattern:components-catalog#poster-scale-case-blocks]`).
- **Rules.** Text in the DOM, with `CreativeWork` JSON-LD; a deck keeps native scroll in sync and turns into plain scroll on phones; "next" is a link the visitor chooses, never an autoplay.

## Project or product detail

- **Job.** Answer what it is, what it costs or how to get it, and what it is made of.
- **Structure.** Name, price or "price by enquiry", and the action above the fold → a media sequence with dimensions reserved → a specification `<dl>` with units as text (`[recipe:product-specification]`) → details in native `<details>` → related items.
- **World.** The object from the home page appears at rest here: the jar that flew in [site:agrumeafarm] [verified], a model with hotspots (`[recipe:gl-orbit-model-hotspots]`), or a still under the same grade.
- **Corpus.** A spec-sheet PDF per configuration as the primary action [site:seasats] [verified]. Product routes exist on several shops and none was captured (`[pattern:i18n-and-commerce#shops-in-the-corpus]`).
- **Rules.** Price, variants and the add or enquire action follow `[pattern:i18n-and-commerce#product-card-and-price]`. No motion sits between the visitor and the action.

## Article

- **Job.** Reading.
- **Structure.** Title → standfirst → `<time datetime>`, author → body at a measure of ≈ 60–75 characters (the audit flags 90, L07) and ≥ 16 px (T07) → figures with captions → related articles.
- **World.** Type contract, ground and one lead image reveal. The body never splits, scrubs or pins.
- **Corpus.** Blog and insights routes exist [site:the-line] [site:united-carriers], and so do article scenes [site:son-daven] [verified on each]. None was analysed.
- **Rules.** `Article` JSON-LD, a subtype of `CreativeWork` [verified: schema.org/CreativeWork]; native scroll; anchors that land on visible text (`[pattern:accessibility-and-reduced-motion#refuse]`).

## About

- **Job.** Show that real people with a method stand behind the work.
- **Structure.** One statement → people with names, roles and faces → the method or services → clients and recognition, verified only → credits → contact.
- **World.** The home page's voice and one moment at most, such as a portrait reveal or the theme of the about route.
- **Corpus.** An about page set as a tabular CV [site:leo-parpeix] [recalled medium]; about, clients, services and contact in a dialog whose text is server-rendered on the index route [site:boc] [verified]; about as one channel of a click wheel [site:areebali] [verified].
- **Rules.** Real names and real images (`[pattern:copy-and-content#content-at-full-fidelity]`). A team of identical cards is refused (L04).

## Contact and enquiry

- **Job.** Start one conversation at a cost that matches the decision (`[pattern:copy-and-content#conversion-matched-to-stakes]`).
- **Structure.** The address as text with a copy control → one form of ≤ 5 fields, or a sentence the visitor completes (`[recipe:sentence-form-enquiry]`) → response time, location, hours.
- **World.** The form speaks in the site's voice and type. The background stays still.
- **Corpus.** Prose fragments as labels, with a response time and a local clock beside them [site:the-boyd] [verified]; pill inputs inside a full-screen sheet [site:alectear] [verified class names]; a callback form with two separate consent checkboxes in the menu [site:likova] [verified]; the e-mail copied in one click [site:warmnfuzzy] [site:wearedirect] [verified]; a meetings embed [site:stanzza] [verified].
- **Rules.** Real `<label>`s and `autocomplete` values, `type="email"`, errors next to the field and in one polite region. Marketing consent is a separate, unticked checkbox. A contact overlay still has its own URL, so `/contact` hard-loads and can be shared. A captcha badge never sits over the form or the reading column (`[pattern:consent-and-banners#placement-and-size]`).

## Index and archive

- **Job.** Help the visitor find one item among many.
- **Structure.** Names as links in a list first → a grid/list toggle → filters as `<button aria-pressed>` with counts → sort → pages or "load more" with their own URLs.
- **World.** The home page's preview behaviour (hover stills, filmstrips) applies here, and every hover preview also appears on `:focus-visible`.
- **Corpus.** A fixed "Work / All / Filter +" sidebar [site:boc]; a filter panel styled for its route, a Grid / List toggle and a list sortable by year, title, director and type with one marker cut between rows [site:the-line]; a grid/list toggle over key-value rows [site:spasoje]; an "index" pill that toggles a list view [site:alectear]; a full index route beside a GL reel [site:jesperlandberg]; collections with live counts [site:floema] [verified on each card].
- **Rules.** Each chunk of an infinite archive has a persistent URL [verified: developers.google.com, lazy-loading]. Recipes: `[recipe:hover-preview-list]`, `[recipe:filmstrip-index-rows]`, `[recipe:overprint-marker-index]`. A reel or plane gallery has the list beside it (`[pattern:components-catalog#hover-preview-archive-list]`).

## Not found

- **Job.** Get the visitor back in one move, without leaving the world. The anatomy is in `[pattern:components-catalog#designed-404]`, and `assets/templates/404.html` is the starting point.
- **Corpus.** A not-found boundary with an `h1` "404", an `h2`, one line and a link home [site:usavionix]; an animated truck [site:united-carriers]; a helmet orbiting in its own scene [site:lando-norris]; a keyboard-playable runner game [site:pensatori-irrazionali] [verified on each card].
- **Status.** The route answers HTTP 404. Google does not index 4xx URLs, and an error message served as a normal page shows up as a soft 404 [verified: developers.google.com, HTTP and network errors]. A client-routed 404 redirects to a URL that answers 404, or adds `noindex` [verified: developers.google.com, JavaScript SEO basics].
- **Rules.** Links come first in DOM order, the scene is `aria-hidden` and paused when hidden, and the page is lighter than the home page.

## Transitions between home and inner pages

| Move | Pattern | Recipe or card |
|---|---|---|
| Index row or tile → case study | promote the chosen: the clicked item rises into the slot where the next page's title will sit, and the rest dissolve by distance | `[recipe:transition-promote-chosen]` [site:boc] [verified] |
| Item → its own route | the item is cloned and flown into the destination | [site:a24-raviklaassens] [site:agrumeafarm] [verified] |
| Tile → case hero | a shared-element morph | [site:zainabkabira] [verified]; `[pattern:preloaders-and-transitions#transition-archetypes]` |
| Inner → next inner | the site's one wipe or curtain | `[recipe:page-transitions]` |
| Case → next case | the close is the next hero in the same geometry; it lifts to the top, its card unwinds, and its media node moves into the next page | `[recipe:next-case-handoff]` [site:the-line] [verified] |
| Back to the index | scroll restored to the row that was opened | saved scroll restored on back navigation [site:wearedirect] [verified] |
| Hard load of an inner route | the CSS loader at most, no home sequence | `[pattern:preloaders-and-transitions#the-load-contract]` |

Rules: one transition vocabulary across every route. The click paints feedback in its own frame (`[pattern:performance-cwv#keeping-interactions-under-200-ms]`). After the swap, scroll resets, focus moves to the new `<h1>`, the head updates, and triggers and scenes are torn down (`[pattern:preloaders-and-transitions#route-transition-mechanics]`). Under reduced motion the swap is instant and focus still moves.

## Verify

- [ ] The page map lists every inner template with its job, structure and the element that carries the world in.
- [ ] No inner route repeats the home hero or its preloader; hard loads of inner routes work.
- [ ] Fonts, scenes and data load per route; scenes are disposed on leave.
- [ ] Case studies end in credits and a chosen "next"; articles keep a reading measure and native scroll.
- [ ] Contact works as a URL, with labelled fields and no captcha over the form.
- [ ] Archives have list views, keyboard-reachable previews, filters as buttons and URLs per chunk.
- [ ] The 404 answers 404 and offers three ways out.
- [ ] One transition vocabulary; focus and head update on every swap; instant under reduced motion.
- [ ] Captures include at least one inner route per template at desktop and phone, with the route listed in `AWARDS.md ## Page map`.

## Refuse

- The home hero restaged on every route; a preloader on every route.
- A case study with no text, no result and no credits; "next" that advances by itself.
- Scroll-jacking, splits or pins in an article body.
- An overlay-only contact or case study with no URL.
- An archive available only as a WebGL reel or a drag plane.
- A 404 that answers 200, needs WebGL to show the way out, or is the host's default.
- A second transition vocabulary for inner routes.
