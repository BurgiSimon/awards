# case-study-route-kit

The inner page that portfolios and studios are judged on, with the index that opens it. `index.html` lists four works as ruled rows, and one of them opens `case.html`. The case page is one `<article>`. It opens on an edge-to-edge title over a definition list of client, year, role and credits. A run of media follows in which no two neighbours share a layout family, then the result as numbers, and it ends on a next-project close that links back into the set. Both pages are static HTML with system fonts. Every picture is an inline SVG drawing in a box sized by `aspect-ratio`, so the recipe ships no media files and nothing shifts while the page loads.

## Why
- **Juries open inner pages, yet almost no card captures one** (`[pattern:inner-pages#what-the-corpus-shows]`). The cards that record the route show case studies built as a deck with a section pager and a "read next" slide [site:zainabkabira], a production route per film with credits [site:a24-raviklaassens] and route-scoped styles for case pages [site:the-line]. This kit is the plugin's structure for that page (`[pattern:inner-pages#case-study]`): title and metadata, a lead image, context in under 80 words, alternating media and text, the result as numbers with units, credits by role (`[pattern:copy-and-content#credits-pages]`), and the next project as a link the visitor chooses, never an autoplay.
- **The rhythm comes from the adjacency rules** in `[pattern:layout-and-composition#choosing-a-layout-for-a-chapter]`. Each row carries its family in `data-family`, and verify checks both that the families of neighbouring rows differ and that the geometry matches what each family claims.
- **The close is a bookend** (`[pattern:narrative-structures#the-close]`). The title's family returns only at the end. The next project gets its own image, and its title is set at the h1's size.

## The rows
| Row | Family · axis · band · containment | Desktop (12 columns) | Phone |
|---|---|---|---|
| Title block | Edge-to-edge type · left · None · margin | title across the measure; standfirst in 1–5; `<dl>` of client, year, role in 7–12, credits under them as a nested `<dl>` of role and name | title, standfirst, a two-column `<dl>` |
| Opening plate | Plate · full · Plate · bled | `16:9`, to the glass | recropped `4:5` around the central bay (`preserveAspectRatio` slice) |
| The brief | Offset split · right · None · margin | heading in 1–3, prose in 5–11 at about 60ch | heading, then prose |
| Offset pair | Uneven grid · left · Led · margin | `4:5` portrait in 1–6, `1:1` square in 8–11 dropped by one step | stacked, the square keeps one offset step (4–12) |
| Caption-led figure | Offset split · right · Shared · bled right | caption in 1–4 aligned to the figure's foot, `3:2` map from 5 to the right edge | caption, then the map at full width |
| Second plate | Plate · full · Plate · bled | `21:9`, the drawing letterboxed on its own ground | `3:2` |
| What changed | Index rows · left · None · margin | ruled rows, label left, value right at display size | the same |
| Next project | Edge-to-edge type · left · Accent · margin | one link: label, `21:9` image, the next title at the h1's size | image `3:2` |

That makes five families on eight rows, with no family, band or axis repeated by a neighbour, and containment changing within every three rows.

## Parameters
Display size `clamp(3rem, 9vw, 9.5rem)` for both the h1 and the next title. The gap between rows is `clamp(5rem, 11vw, 11rem)`. Reading text is set in a serif stack (`Iowan Old Style`, Charter, Cambria) against the shared grotesque display. Reveals use `[data-reveal]`. Only elements whose top is below the first viewport when the module runs are held back (`.is-pending`), and an IntersectionObserver releases each one at `rootMargin: 0 0 -10% 0`. The full tier rises `32px` and fades over `.9 s` on `--ease-out-expo`. The next-project link's `href` is `./index.html#harbour-almanac`, and the index marks the arriving row with `:target`.

## Motion tiers
- **full**: what starts below the fold rises `32px` and fades in once.
- **reduced**: a `.35 s` fade with no travel (`--reveal-y: 0px` under `prefers-reduced-motion`).
- **static**: nothing is held back; the page is its final frame.
Nothing in the first viewport is ever hidden, so the first paint is complete and a failed script leaves every word readable.

## Accessibility and semantics
- One `<h1>` per page, a skip link, a breadcrumb `<nav>` with `aria-current="page"`, one `<article>` per case, and `<h2>` for the brief and the result.
- Every drawing is a `<figure>` with a `<figcaption>`. Each SVG has `role="img"` and an `aria-label` that describes it. In the caption-led figure, the caption comes first in both the DOM and the reading order.
- The next-project close is one `<a>` inside `<nav aria-label="Next project">`. Its image is `aria-hidden`, because the link text already names the work.
- Each page has its own `<title>` and description. The case page carries `CreativeWork` JSON-LD.
- Hover states on links are also `:focus-visible` states. Touch targets in the bar and footer are 44 px high.

## Verify
Both pages load through real link clicks. The case page must have one h1 in one article, a title block listing Client, Year, Role and Credits, and five credit pairs. Each of the five figures needs a caption, a labelled drawing and a set aspect ratio. Layout shift is summed from buffered `layout-shift` entries in the probe and must stay under `0.05` on the index, the case at desktop and phone, and the index reached from the close. The rows must come in order, no two neighbours may share a family, and the title family may appear only at the two ends. The geometry checks are: both plates at the viewport's width, the pair side by side at two sizes with the second dropped, the caption left of a figure that reaches the right edge, and prose at 30–75 characters a line. The next title must be at the h1's size, and clicking it must land on `index.html` with `#harbour-almanac` present, `:target` and on screen. Reveals must hold back only below the fold, and under reduced motion they must fade with no transform. At 390 px nothing may overflow, the opening plate turns portrait, and the case page still fits with every word 40 % longer and set right-to-left.

## Adapters
- **Astro / Next / Nuxt / SvelteKit**: one route template (`/work/[slug]`) fed by CMS fields. The next project is the following entry in the index order. Its `href` is that route, not an index anchor as in this two-page demo. Emit `<title>`, description, canonical and the JSON-LD from the same entry.
- **Real media**: swap each SVG for `<img>` or `<picture>` with `width` / `height` (or keep the `aspect-ratio` box), `loading="lazy"` below the fold and `fetchpriority="high"` on the opening plate. Art-direct the phone crop with `<source media>`, as the opening plate does with its `4:5` box (`[recipe:responsive-art-directed-hero]`).
- **Into the page**: the index row can rise into the title slot with `[recipe:transition-promote-chosen]`, or use the site's one wipe from `[recipe:page-transitions]`. Under reduced motion the swap is instant and focus moves to the new h1.
- **React / Vue / Svelte**: the reveal is one IntersectionObserver in an effect (`useEffect`, `onMounted`, `onMount`) that adds `.is-pending` only to elements below the fold and disconnects on unmount.

Synthetic content: the studio, Kestrel Yard Market and its trust, the people in the credits, the figures in the result, the other three works and every drawing are invented for this demo.
