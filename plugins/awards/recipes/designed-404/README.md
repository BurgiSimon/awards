# designed-404

A not-found page that stays inside the site's world. One sentence in the site's voice says what happened, the way back comes first (the front page, the three routes most visitors want, a search), and a small drawn moment plays once beside it without holding anything up: the zero of 404 is a sun standing on the horizon between two drawn fours, and it sets. The page says what it is in its head (`<title>`, `noindex`), has one `<main>` and one `<h1>`, and keeps every URL root-absolute because it is served at whatever path was mistyped. Below: how to serve it with a real 404 status on each host and framework.

## Why
- **Every route is authored.** The corpus ships designed 404s as often as it ships designed footers: a helmet orbiting in its own scene `[site:lando-norris]`, an animated truck with staggered copy `[site:united-carriers]`, a keyboard-playable runner game `[site:pensatori-irrazionali]`, a goat illustration with outlined code `[site:goats]`, an acetate-blended figure `[site:the-line]`, marquees and scattered words `[site:boc]`, and the plain end of the range, an `h1`, one line and a link home `[site:usavionix]`. The anatomy and the refusals are in `[pattern:components-catalog#designed-404]`; the status rules are in `[pattern:inner-pages#not-found]`.
- **The way out does not wait.** The links are first in the DOM, never animated and readable from the first frame; the scene is `aria-hidden`, needs no WebGL and weighs a few kilobytes of SVG. A 404 that needs a scene to show the way out is the refusal.
- **One gesture from the world, not a game.** Here it is the page's own numerals reacting once. The runner game and the orbiting helmet are other sites' worlds; borrow the job (a moment in your own register), not the props.

## Parameters
Sun travel `translateY(-140)` in viewBox units (top edge `120 → 260`, so the zero ends half set) over `1.8s` `cubic-bezier(.65, 0, .35, 1)` after `.35s` · five glints `scaleX(0 → 1)` over `.9s` expo-out from `1.55s`, `.08s` apart · reduced: opacity `0 → 1` over `.4s` after `.1s`, nothing travels · static: no animation · copy column `5fr`, scene `7fr` above `900px`; below it the scene is a band above the copy · h1 `clamp(2.5rem, 5.2vw, 5.25rem)` in the reading serif · palette: ground `#13223a`, sea `#0e1a2d`, ink `#efe6d5` (12.9:1), sun `#f4a462` (7.8:1).

## Behaviour
- The moment is CSS: it plays without the script and runs exactly once (`animation-iteration-count` 1, `fill: both`, so the first frame is the start pose and nothing jumps when it begins).
- `main.js` mirrors the tier on `<html>` through `_shared/reduced-motion.js`, keeps the demo search on the page, and reports to `__awards`.
- The head carries no canonical link and no Open Graph tags on purpose: a not-found page has no URL of its own to claim or to share, so the audit's S06, S09 and S10 notes are expected here.
- The search form is a plain `GET /search?q=…`. The demo carries `data-demo`, so the script prevents the submit and prints the URL it would open in a `role="status"` line; remove the attribute on a site that has a search route. A site without search swaps the form for an index link ("every page, A to Z").

## Motion tiers
- **Full:** the zero sinks into the horizon, then the glints open across the water. About two seconds, once.
- **Reduced** (`prefers-reduced-motion`, `html[data-motion="reduced"]` or the mirrored `data-motion-tier`): the sun is already set and fades in with the glints where they rest; hover nudges on the arrows are off. `[pattern:accessibility-and-reduced-motion#reduced-motion-tiers]`.
- **Static** (`html[data-motion="static"]`): the last frame immediately. Setting the attribute mid-moment cuts to the last frame too, because the animation is removed rather than paused.

## Accessibility
- `<title>` and the `h1` both say the page is missing; the `h1` says it in the site's voice ("No such page on this chart.").
- Skip link first, visible on focus; through it, the next Tab is the home link. Every control is at least 44 px tall and takes the sun-coloured ring from `:focus-visible` (`[pattern:accessibility-and-reduced-motion#skip-link-landmarks-and-focus-styles]`).
- The routes are a `<nav>` named by its own heading; each link's name is the route alone ("Tide tables"), the description sits beside it as text. The search is a named `search` landmark with a labelled `searchbox`.
- The scene, its caption and the drawn fours are `aria-hidden`; the verifier checks that nothing from them reaches the ARIA snapshot.

## Serve it with a real 404 status
A designed page answered with `200` is a soft 404: crawlers may index it and monitoring never sees the broken link. Google does not index URLs that answer 4xx. The `noindex` meta is the backstop for hosts that cannot set a status. Check the built site with `curl -sI https://example.com/no-such-page | head -1`: it must print `404`. Build the page with root-absolute assets (Vite `base: '/'`, not the `'./'` the recipe gallery uses), because `/a/b/missing` resolves `./assets/…` against `/a/b/`.

- **Vite on a static host:** add `404.html` as a second `build.rollupOptions.input` so it is emitted at the output root. Netlify, GitHub Pages, Cloudflare Pages, Vercel (static output) and Firebase Hosting serve a root `404.html` with status 404 for unmatched paths. Cloudflare Pages treats a project with no root `404.html` as a single-page app and answers 200. A catch-all rewrite (`/* /index.html 200`) overrides all of this and turns every 404 soft; scope it or drop it. The Vite dev server does not use `404.html`, so check status on the built output.
- **Nginx / Apache / S3:** `error_page 404 /404.html;` · `ErrorDocument 404 /404.html` · the bucket's error document set to `404.html`.
- **Next.js:** App Router `app/not-found.tsx`, which also handles every unmatched URL; Pages Router `pages/404.tsx`, generated at build time. The status is 404 when `notFound()` runs before streaming starts; after a `<Suspense>` boundary or `loading.tsx` has begun streaming it stays 200 and Next adds `noindex`, so check existence before the first `await` that streams.
- **Nuxt:** `error.vue` beside `app.vue` (in `app/` with Nuxt 4's layout), not in `pages/`. Unmatched routes render it with 404; read the status from its `error` prop and use `clearError({ redirect: '/' })` for the home link so the error state clears.
- **Astro:** `src/pages/404.astro` builds to `404.html`, which static hosts pick up; with on-demand rendering Astro answers unmatched routes with it and a 404.
- **SvelteKit:** `src/routes/+error.svelte` renders for any route that does not match, with `page.status` 404, under a server adapter. With `adapter-static`, set `fallback: '404.html'` so the host has a file to serve (the fallback always uses absolute asset paths).
- **Client-side routers:** a route the router cannot match either redirects to a URL that answers 404 or sets `noindex` (`[pattern:seo-and-semantics#client-side-routers]`).

## Adapters
- **React / Next:** the markup is the component; keep the scene as inline SVG in the same file (no image request), keep the `@keyframes` in the global or module CSS, and the links as `<Link href="/">`.
- **Vue / Nuxt:** the same template in `error.vue`; `<NuxtLink to="/">` for the routes; the tier mirror goes in a client plugin.
- **Svelte / SvelteKit:** `+error.svelte` with the CSS in its `<style>`; `syncMotionTierAttribute()` in the root layout's `onMount`.
- **Astro:** a `404.astro` page with no client script at all: the moment is CSS and the demo search interception is not needed on a real site.

## Capture hook
`__awards.state()` reports `motion`, `sunTop` (viewBox units: 120 at rest above the horizon, 260 set), `momentRunning` (running animations in the scene), `focused` (href, id or class), `searches`, `query`, `wouldOpen` and `path`. `scrollTo` is the default document scroll.

## When not to use it
Not as a dead end for a moved page: a page that moved gets a 301 to its new address, and a page that is gone for good can answer 410. The 404 is for addresses that never existed or cannot be mapped. Keep it lighter than the home page; if the moment needs a library the 404 would not otherwise load, draw something smaller.

## Synthetic content
The Salt Almanac, its routes, its tide figures and every sentence on the page are invented demo copy; the routes point at paths that do not exist. No image or font files ship: the fours and the sun are inline SVG, the type is system stacks.

Seen in: `[site:lando-norris]`, `[site:united-carriers]`, `[site:pensatori-irrazionali]`, `[site:goats]`, `[site:the-line]`, `[site:usavionix]`, `[site:boc]`.
