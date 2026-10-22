# SEO and semantics

What this file is for: what a crawler, a share sheet and a jury's developer reviewer read on a canvas-first or motion-first page. That means the head of every route, structured data, robots and sitemap, the outline, the text behind the canvas, and what client-side routers and text splitters do to all of it. The accessible DOM itself lives in `[pattern:accessibility-and-reduced-motion#the-dom-mirror]` and `[pattern:accessibility-and-reduced-motion#skip-link-landmarks-and-focus-styles]`, and this file adds only the search and metadata side. Read it when `structure` writes the page map and again before `ship`. Cite it as `[pattern:seo-and-semantics#section]`.

## Contents
1. [What the developer criteria visibly reward](#what-the-developer-criteria-visibly-reward)
2. [The head, per route](#the-head-per-route)
3. [Structured data](#structured-data)
4. [Robots and sitemap](#robots-and-sitemap)
5. [Outline and ids](#outline-and-ids)
6. [Text behind the canvas](#text-behind-the-canvas)
7. [Client-side routers](#client-side-routers)
8. [Lazy and split text](#lazy-and-split-text)
9. [Audit map](#audit-map)
10. [Verify](#verify) · [Refuse](#refuse)

## What the developer criteria visibly reward

Why: Awwwards publishes a Semantics / SEO and a Markup / Meta-data score on every entry. Its evaluation page gives the jury weights and refers Site of the Day winners to developer guidelines, but no per-criterion rubric was found [verified: awwwards.com/about-evaluation, read 2026-10-22]. The rubric itself is [unknown]. What the scores reward can only be read off the corpus.

| Card | Semantics / SEO · Markup | What the card records | Confidence |
|---|---|---|---|
| [site:son-daven] | 8.20 · 8.00 | OG title, description, image and an mp4 OG video; Twitter card; JSON-LD; hreflang en / uk / x-default. Also eight `h1`s and no `<main>` | [verified] |
| [site:united-carriers] | 8.00 · 7.60 | one `h1` that is also the JSON-LD `slogan`; an `OfferCatalog` | [verified] |
| [site:usavionix] | 8.00 · 7.80 | a complete head with a 1200 × 630 share image; no `h1` on the home route, the rest client-rendered | [verified] |
| [site:floema] | 7.80 · 7.60 | canonical, hreflang for four locales plus x-default, a Markdown alternate of the page | [verified] |
| [site:oryzo] | 7.60 · 7.20 | full head and robots; no `<main>` and no `<section>` | [verified] |
| [site:the-line] | 7.40 · 7.40 | the only `h1` is "Highlights"; labels as `h2`, display words as `h3` | [verified] |
| [site:seasats] | 7.00 · 7.20 | `og:image` with a doubled origin; a template's `twitter:creator` | [verified] |
| [site:the-boyd] | 6.80 · 7.20 | `<meta name="title" content="Title">` and a garbled keywords string | [verified] |
| [site:igloo] | 6.60 · 6.40 | a 27-node DOM, the canvas inside a closed shadow root | [verified] |
| [site:why-zero] | 6.60 · 6.80 | narrative type shipped as a texture atlas | [verified] |

Reading [inferred]: the top marks follow a complete head, server-rendered text and structured data more closely than a clean outline, and the floor belongs to canvas-first pages with nothing behind the canvas. "The corpus floor is higher than the award's" [site:son-daven]. The plugin keeps both the head and the outline and trades neither away.

## The head, per route

Why: the head is what a search result and a share preview show. Meta's crawler gathers the title, description and preview image from the shared URL, and Open Graph properties count only within the first 1 MB [verified: developers.facebook.com, web crawlers]. Whether preview crawlers run JavaScript is [unverified], so every route's head ships in its served HTML.

| Element | Rule | Source | Audit |
|---|---|---|---|
| `<title>` | on every page; descriptive and concise; no repeated boilerplate; the site name at the start or end after a delimiter | [verified: developers.google.com, title links] | S07 |
| `meta name="description"` | one sentence per page, unique; Google sometimes uses it for the snippet; no length limit, but snippets are truncated | [verified: developers.google.com, snippets] | S08 |
| `link rel="canonical"` | the deployed absolute URL; a strong signal, not a command; if script sets it, it matches the served HTML | [verified: developers.google.com, consolidate duplicate URLs; JavaScript SEO basics] | S10 |
| Open Graph | `og:title`, `og:type`, `og:image` and `og:url` are required, plus `og:image:width`, `:height` and `:alt` | [verified: ogp.me] | S06, S09 |
| OG position | in the `<head>`, well inside the first 1 MB | [verified: developers.facebook.com, web crawlers] | — |

Corpus misses to beat [verified on each card]: two OG tags and no image [site:mont-fort]; a share image URL with a doubled origin [site:seasats]; an `og:url` pointing at a placeholder domain [site:bleibtgleich]; no meta description in the served HTML [site:to-top]. Corpus details worth keeping [verified on each card]: `og:image:alt` that describes the share image [site:cutobot-byholm]; `og:type` `music.album` with matching JSON-LD [site:ascension-pegassi]. Each route gets its own share image, drawn in the world at 1200 × 630, and never one image for every URL.

## Structured data

Google recommends JSON-LD and says not to mark up information the visitor cannot see [verified: developers.google.com, intro to structured data].

| Type | Where | Corpus |
|---|---|---|
| `Organization` (name, url, logo ≥ 112 px, sameAs) | the home page or one about page, not every page [verified: developers.google.com, Organization] | `Organization` + `WebPage` [site:likova] [verified] |
| `Person`, `WebSite`, `ProfilePage` | a practitioner's portfolio | all three on one page [site:christoph-nagel] [verified] |
| `CreativeWork` and its subtypes (`Movie`, `Photograph`, `VisualArtwork`, `MusicAlbum`) with `creator`, `dateCreated`, `about`, `genre` | each case study, film or release page [verified: schema.org/CreativeWork] | `MusicAlbum` with its tracks [site:ascension-pegassi]; a list of twelve films [site:a24-raviklaassens] [verified] |
| `Product` + `Offer` | product pages: `name` plus one of `offers`, `review` or `aggregateRating`; `price`; `priceCurrency` required for merchant listings [verified: developers.google.com, product snippets] | `[pattern:i18n-and-commerce#product-card-and-price]` |
| `OfferCatalog` | a services list | [site:united-carriers] [verified] |

Refuse claims the page does not show. One card declares its own awards only in JSON-LD [site:bleibtgleich] [verified]. Whether the page also shows them is [unknown].

## Robots and sitemap

- robots.txt "is not a mechanism for keeping a web page out of Google". Use `noindex` or a password instead [verified: developers.google.com, robots.txt intro]. Do not use it for canonicalisation [verified: developers.google.com, consolidate duplicate URLs]. Staging and preview deploys carry `noindex`, and `ship` checks it is gone.
- `sitemap.xml` holds at most 50,000 URLs and 50 MB uncompressed per file. An index file groups several, and its location can be given in robots.txt [verified: sitemaps.org protocol]. List each route and case page, not hash states.
- Seen [verified on each card]: robots `index, follow` with a sitemap link [site:mont-fort]; `max-image-preview:large` [site:floema]; a robots.txt `Content-Signal` line for AI use [site:cyphercapital]; empty robots.txt files [site:aardvarkbookclub] [site:stanzza]; an `llms.txt` link [site:jesperlandberg]; a Markdown alternate per page [site:floema]. Which agents read `llms.txt` or `Content-Signal` is [unverified]. Treat them as cheap extras, never as a substitute for HTML.

## Outline and ids

The outline is the crawler's table of contents. The landmark and heading rules are in the accessibility file (A01, A03, A09), and this list adds what canvas and motion pages get wrong.

- One `h1` that names the subject in text. It is not an SVG lockup: the release title is an `<svg>`, while the `h1` is the header lockup [site:shopify-editions-w26] [verified]. It is not a section label either [site:the-line]. A visually hidden `h1` under a canvas display is acceptable [site:ascension-pegassi] [site:a24-raviklaassens] [site:agrumeafarm] [verified on each card].
- Chapter titles drawn in GL or split into spans are still `h2`s in the DOM, in order. Micro-labels and counters are not headings.
- Marquee and strip clones keep `aria-hidden` and `tabindex="-1"` [site:boc] [verified], and they also drop every `id`. A duplicated `id` breaks labels, `aria-*` references and fragment links, which resolve to the first only (A15).

## Text behind the canvas

Google crawls, renders and indexes JavaScript pages in three phases [verified: developers.google.com, JavaScript SEO basics]. The plugin still serves the words in the HTML, because preview crawlers, find-in-page, translation and the `--no-webgl` capture do not wait for a render.

- Every word the canvas draws is in the served document (`[pattern:webgl-architecture#text-in-webgl]`). Models: full copy in SSR HTML under an `sr-only` `h1` [site:ascension-pegassi]; static HTML under an island [site:mont-fort]; a `<noscript>` rule that turns a fixed stage back into a document [site:christoph-nagel]; a complete `.sr-only` block with headings and project links [site:jesperlandberg] [verified on each card].
- Misses [verified on each card]: a renderer inside a closed shadow root that no tool can reach [site:igloo]; the brand name only inside a video [site:aqualoqa]; chrome that is not in the server-rendered document [site:floema].
- Evidence: `capture.mjs` writes `<viewport>-aria.yml`, and a `--no-webgl` pass must read as a full page.

## Client-side routers

| Router | Title | Rest of the head | Source |
|---|---|---|---|
| Taxi | its `Renderer` sets `document.title` from the fetched page | the project's job [inferred] | [verified: `@unseenco/taxi` `src/Renderer.js`, pinned in `recipes/`] |
| Barba 2 | updated automatically | `@barba/head` is still marked "Coming soon!" | [verified: barba.js.org FAQ and plugins/head] |
| Cross-document View Transitions | each route is a real document | per page | `@view-transition` is not Baseline [verified: MDN @view-transition] |
| Framework routers (Next, Nuxt, SvelteKit, Astro) | the framework's head API, rendered on the server | same | `references/stacks/` |

Rules:
- Every URL hard-loads with its own head and content. `[recipe:page-transitions]` ships the full markup contract on every page.
- On a swap, update the title, description, canonical and `og:url` together from the fetched document, then move focus (`[pattern:preloaders-and-transitions#route-transition-mechanics]`).
- Routes use the History API, never fragments, and links are `<a href>` [verified: developers.google.com, JavaScript SEO basics].
- A client-routed 404 either redirects to a URL that answers 404 or adds `noindex` [verified: same] (`[pattern:inner-pages#not-found]`).

## Lazy and split text

- Google Search does not scroll or click. Load content when it is visible in the viewport, never lazy-load what shows on first load, and give each chunk of an infinite archive its own URL [verified: developers.google.com, lazy-loading]. A reveal that holds text at opacity 0 still serves it. Text inserted only when a scroll event fires is not served [inferred].
- Text is visible before scripts run, and the reveal hides it only once the tier allows (`[recipe:split-text-masked-reveal]`).
- SplitText's default `aria: "auto"` puts the element's text in an `aria-label` and hides the line, word and char elements. It does not surface nested links, and the docs recommend disabling the default for nested content [verified: gsap.com SplitText docs]. ARIA 1.2 prohibits naming `generic` and `paragraph` roles [verified: W3C WAI-ARIA 1.2, roles which cannot be named], so on a `<p>` or `<div>` the label may be dropped while the children stay hidden [inferred].
- Plugin rules: `auto` on headings only. Paragraphs split to lines or words take `aria: "none"`. Character splits take `aria: "hidden"` beside a visually hidden original. Text that contains links is split around the links, never through them. One-shot reveals `revert()` when done, and the reduced tier never splits. Check the result in `<viewport>-aria.yml` (`[pattern:motion-vocabulary#masked-line-reveals]`).

## Audit map

| Rule | Severity | What `audit.mjs` checks |
|---|---|---|
| S07 | P2 | a page with no non-empty `<title>` |
| S08 | P3 | no `meta name="description"` with content |
| S09 | P3 | `og:title` or `og:description` missing (S06 for `og:image`) |
| S10 | P3 | no `link rel="canonical"` with an `href` |
| A13 | P2 | a page with `<nav>` and no same-page link that says it skips, first in the tab order |
| A15 | P2 | a duplicate `id` in `.html` markup; ids written inside scripts and templates are ignored |
| A16 | P1 / P2 | axe-core WCAG 2.2 A/AA violations on the rendered desktop page, contrast and target size excluded (C01, A14 measure those); serious and critical are P1; `axe: unmeasured` when axe-core is not installed |

These rules read the HTML the audit is given. For a client-rendered app, audit the built output or the deployed URL of each route, not the source shell.

## Verify

- [ ] Every route's served HTML has its own title, description, canonical, OG set and share image; no template leftovers.
- [ ] JSON-LD describes visible content only: Organization once, a CreativeWork per case page, Product and Offer on product pages.
- [ ] robots.txt and the sitemap list real routes; preview deploys are `noindex` and production is not.
- [ ] One textual `h1`; chapter titles are DOM headings in order; clones carry no ids (A15 clean).
- [ ] The `--no-webgl` capture and `<viewport>-aria.yml` contain every word the canvas draws.
- [ ] Route swaps update the head and move focus; hard loads work on every URL; the 404 answers 404.
- [ ] Split text follows the aria rules above and reads as whole sentences in the ARIA snapshot.
- [ ] `audit.mjs --render` shows no S07–S10, A13, A15 or A16 findings, or each is recorded under `AWARDS.md ## Exceptions`.

## Refuse

- A head written only by client script; one share image and one description for every route.
- An `h1` that is an SVG, an image or a canvas with no text; several `h1`s.
- Structured data for content the page does not show.
- robots.txt used to hide or canonicalise pages; a production `noindex` left over from staging.
- A canvas or shadow root holding the only copy of the words.
- Fragment routing; `div` links; a client-side 404 that answers 200 and stays indexable.
- SplitText's `auto` labels on paragraphs or around links; character splits with no readable original.
