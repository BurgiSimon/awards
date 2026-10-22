# Host platforms: Webflow, Framer, WordPress, Shopify

<!-- Labels: [verified: webflow-help] = help.webflow.com articles read through its public Help Center API, 2026-10-22: "Interactions with GSAP vs. Classic Interactions" (updated 2026-09-08), "Custom code in head and body tags" and "Custom code embed" (2026-09-02), "Use GSAP in Webflow" and "Troubleshoot smooth scroll and reduced motion" (2026-07-18), "How do I export my Webflow site code?" (2025-10-31), "Semantic HTML5 tags" (2026-10-14), "Code components" (2026-04-30), "Webflow Cloud overview" (2026-05-29) · [verified: webflow-dev] = developers.webflow.com changelog 2026-05-21 (DevLink export of IX3) and Context7 `/websites/developers_webflow` (code components: Shadow DOM decorators, `ssr` option), read 2026-10-22 · [verified: framer-help] = Context7 `/websites/framer_help` and framer.com/help pages (custom code, reduced motion, HTML export; the export pages updated 2026-09-15), read 2026-10-22 · [verified: framer-dev] = Context7 `/websites/framer_developers` (code overrides, RenderTarget, `useIsStaticRenderer`, npm-import FAQ), read 2026-10-22 · [verified: wp-docs] = Context7 `/websites/developer_wordpress_themes` and `/kasparsd/wp-docs-md` (including assets, templates and parts, landmarks and skip link, Script Modules), read 2026-10-22 · [verified: wp-rocket] = docs.wp-rocket.me Delay JavaScript execution articles, via search, 2026-10-22 · [verified: shopify-dev] = Context7 `/websites/shopify_dev_storefronts_themes` (architecture, layouts, limits, theme editor events, defer scripts, Theme Check, Theme Store requirements, CLI), read 2026-10-22 · [verified: npm] = `npm view @shopify/hydrogen`, 2026-10-22 · [verified: plugin] = this plugin's `scripts/audit.mjs` and `scripts/capture.mjs`, read 2026-10-22 · [inferred] · [unverified]. Site facts keep their card's own label. -->

## The shape that travels
Every hosted build keeps the plugin's runtime shape; only the door it comes in by changes.

| Piece | Lives in | Never |
|---|---|---|
| one ticker: Lenis on `gsap.ticker`, `lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)` [recipe:boot-lenis-gsap] | the engine bundle, built and versioned in its own repo | a second Lenis or GSAP from the platform |
| `window.__awards = { ready, scrollTo, state }` | the engine, `awards.ready()` after fonts, the gate and the first frame | inline in the platform's code box |
| `motionTier()` full / reduced / static [recipe:reduced-motion-switch] | the engine, read by every module | left to the platform's own reduced-motion switch alone |
| canvas `aria-hidden`, a DOM twin for everything it draws [pattern:accessibility-and-reduced-motion#the-dom-mirror] | the platform's markup (that is the twin) plus one engine-owned canvas | text that exists only in GL or Rive |

The engine is a Vite library build with a stable `main.js` and hashed chunks, served with CORS from your own origin or the platform's asset store; the platform page carries one module script. The full Webflow version of that scaffold, boot file, CORS headers and deploy order is `stacks/webflow-export.md`; it applies to the other three with the injection points below.

## Capability at a glance
| | Webflow | Framer | WordPress (block theme) | Shopify theme | Shopify Hydrogen |
|---|---|---|---|---|---|
| Who owns the markup | Designer + CMS | Framer canvas (React output [inferred]) | templates and blocks in the theme repo | Liquid sections in the theme repo | your React app |
| Own JS | Site/page custom code, Code Embed, 50,000 characters each [verified: webflow-help] | Site/page Custom Code, start or end of `<head>` / `<body>`, "Once" or "every page visit" [verified: framer-help] | enqueued scripts and script modules | `assets/` files via `asset_url` | everything |
| Landmarks | per-element Tag: Header, Footer, Nav, Main, Section, Article, Aside, Address, Figure [verified: webflow-help] | Framer's output [unverified] | `tagName` on template parts and groups; a `main` gives a skip link [verified: wp-docs] | the layout file (Horizon wraps content in `<main id="MainContent">`) [verified: shopify-dev] | yours |
| Static export to audit | Code export on Workspace plans, without CMS content [verified: webflow-help] | none for self-hosting [verified: framer-help] | the theme source; pages need a running site [inferred] | the theme source; pages need `shopify theme dev` [verified: shopify-dev] | the build output |
| Corpus cards | 16; up to Site of the Day at 8.18 [site:lando-norris] [verified] | none [verified: grep of `references/sites/`] | 3: [site:lama-lama], [site:goats], [site:serotoninn] | 1: [site:aqualoqa] | 1, as Remix on Oxygen: [site:shopify-editions-w26] |

## Webflow
The most common shell in the corpus: 16 of 62 cards [verified: grep of `references/sites/`, 2026-10-22]. The injected-engine pattern, its boot file, CORS and deploy rules are in `stacks/webflow-export.md`; this section adds what changed and what the cards show.

**Interactions.** Webflow's official name for the new engine is **Interactions with GSAP**; the developer changelog calls it "GSAP-powered Interactions (IX3)" beside **Classic Interactions** (IX2) [verified: webflow-dev]. It launched in summer 2025, is the default on new sites, adds SplitText, staggers, ScrollTrigger, a horizontal timeline and **prefers-reduced-motion settings** that Classic lacks [verified: webflow-help]. Both engines can run on one site, each loading its own resources; Webflow ranks "GSAP only" best and "both" worst [verified: webflow-help]. DevLink exports IX3 as a per-site GSAP bundle plus an IX3 runtime loaded when a component using `useIX3Interactions` mounts [verified: webflow-dev]. Corpus: Stanzza runs 18 IX3 scroll interactions, 15 at `scrub .8` [site:stanzza] [verified]; PrimeSec carries `w-mod-ix3` [site:primesec] [verified]; Rennsport still runs IX2 scroll actions [site:911rennsport] [verified].

**What it can and cannot do.**
- Can: everything in `webflow-export.md` (six-scene WebGL [site:lando-norris], CMS-fed WebGL [site:trevor-noah], route transitions with taxi or Barba [site:united-carriers] [site:aardvarkbookclub]), Webflow Localization [site:son-daven], Ecommerce [site:united-carriers].
- GSAP from Webflow: Settings → GSAP integration loads the library and every plugin from Webflow's CDN, auto-registered [verified: webflow-help]. Use it **or** bundle GSAP, never both: Abatable and PrimeSec ship two GSAP cores [site:abatable] [site:primesec] [verified]. Bundling keeps the version pinned with the engine [inferred].
- Code components are React rendered inside a **Shadow DOM** (CSS-in-JS needs Webflow's decorators) and server-rendered unless `ssr: false` [verified: webflow-dev]. An engine's `document.querySelectorAll('[data-module]')` does not reach into shadow roots [inferred]: mount canvas modules on light-DOM wrappers.
- Webflow Cloud hosts a Next.js or Astro app beside a Webflow site [verified: webflow-help]; then the framework notes (`stacks/next.md`, `stacks/astro.md`) apply, not this one.
- Custom code on Workspace or Site plans only [verified: webflow-help].

**Injection.** Site settings → Custom code → Footer code (before `</body>`), one module loader, as in `webflow-export.md`. Custom code hosts outside your origin appear in the corpus: Slater serves Aardvark's and Bleibt Gleich's single module [site:aardvarkbookclub] [site:bleibtgleich] [verified]; a Netlify-hosted Vite engine with a `?dev` switch to localhost serves Noth [site:noth] [verified]; Siena's comes from Vercel [site:siena] [verified].

## Framer
Framer publishes on its own hosting with pre-rendering and server-side rendering, and offers no HTML export for self-hosting [verified: framer-help]; the published layers are React output with client-side navigation [inferred, from code components being React and the per-visit script option]. (A second Framer help page says the published files can be downloaded and moved, without naming a menu [verified: framer-help]; the two pages disagree, so treat export as unavailable [inferred].) No corpus card was built on Framer [verified: grep of `references/sites/`].

| Can | Cannot, or not cleanly |
|---|---|
| a site-wide module script: Site Settings → Custom Code, placement End of `<body>`, all pages, Run **Once**; module scripts are "already optimized" [verified: framer-help] | own the markup: layers are React output; classes are generated [inferred] |
| per-route work with a second snippet set to Run on every page visit [verified: framer-help] that calls the engine's `mount()` | import arbitrary npm packages into code components: experimental, most do not work [verified: framer-dev] |
| a canvas as a **code component**; `useIsStaticRenderer()` keeps WebGL still on the canvas and in exports [verified: framer-dev] | rely on the Framer canvas to preview the engine: overrides run only in preview and on the published site [verified: framer-dev] |
| behaviour on any layer through a **code override** (a React higher-order component; React 18 code, `forwardRef`) [verified: framer-dev] | GSAP scrub on a layer that also has a Framer effect: two writers on one transform [inferred] |

- Framer's own Reduced Motion setting (Site settings → General → Accessibility) cuts Framer's effects to opacity when the visitor prefers reduced motion [verified: framer-help]. It does not reach the engine; the engine still reads `motionTier()` [inferred].
- The whole Motion for React API is importable in every code component [verified: framer-dev]. Use it for UI presence, never for scrub (`versions.md`: Motion is for micro-interactions only).
- Smooth scroll: give the engine's Lenis the page and leave Framer's scroll effects off [inferred]; whether Framer ships its own smooth-scroll layer is [unverified].

## WordPress (block themes)
The theme is a repo you own: `templates/*.html` and `parts/*.html` in block markup, `theme.json` for tokens, PHP for enqueueing. Lama Lama runs a hashed ESM entry with ~62 lazy chunks from its theme [site:lama-lama] [verified]; Goats bundles GSAP 3.15 and Lenis 1.3.25 into one theme script, Lenis on the GSAP ticker and never created under reduced motion [site:goats] [verified]; Serotoninn ships a Vite-style `loader.js` [site:serotoninn] [verified].

```php
// functions.php: the engine as a script module (WordPress 6.5+) [verified: wp-docs]
add_action( 'wp_enqueue_scripts', function () {
  wp_register_script_module( 'awards-engine', get_parent_theme_file_uri( 'dist/main.js' ), array(), wp_get_theme()->get( 'Version' ) );
  wp_enqueue_script_module( 'awards-engine' );
} );
```
```html
<!-- templates/front-page.html: landmarks come from tagName [verified: wp-docs] -->
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group"><!-- wp:pattern {"slug":"theme/hero"} /--></main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```
- A `main` landmark on a Group, Template Part or Query block generates the Skip to Content link [verified: wp-docs]. Lama Lama has no `<nav>`, no list markup and a 1,626-`<div>` tree [site:lama-lama] [verified]; Serotoninn has no `<nav>` landmark and no skip link [site:serotoninn] [verified]. The template is where that is decided, not the CSS.
- Engine hooks: custom blocks (`block.json` `viewScriptModule`, enqueued only on the front end) [verified: wp-docs] or ACF blocks as Goats does [site:goats] [verified]. Core blocks take classes in the editor; `data-module` attributes need a custom block or a pattern [inferred].
- `wp_enqueue_script` takes a `strategy` of `defer` or `async` since 6.3 [verified: wp-docs]. The block metadata reference says classic scripts and script modules are not compatible yet [verified: wp-docs]; whether a 2026 release changed that is [unverified]. Either way the engine bundles its own GSAP and Lenis and depends on no WordPress handle [inferred].

## Shopify
### Themes (Liquid)
Aqualoqa is a Horizon 4.1.5 theme with a custom Liquid splash section and hand-written WebGL [site:aqualoqa] [verified].
```liquid
{%- # layout/theme.liquid, above content_for_header: Horizon's own pattern is an import map + module script [verified: shopify-dev] -%}
<script type="importmap">{ "imports": { "awards/engine": "{{ 'awards-engine.js' | asset_url }}" } }</script>
<link rel="modulepreload" href="{{ 'awards-engine.js' | asset_url }}">
<script type="module">import('awards/engine');</script>
{{ content_for_header }}
```
- `assets/` takes no subfolders [verified: shopify-dev]: build with flat output (no `chunks/` directory) and map any chunk the entry imports by name through the import map [inferred].
- `content_for_header` is required in `<head>`, defines `window.Shopify` and loads app scripts; never parse or move it [verified: shopify-dev].
- The theme editor re-renders sections in place without re-running page scripts: re-mount on `shopify:section:load`, revert on `shopify:section:unload`, and keep a selected section in view on `shopify:section:select` [verified: shopify-dev]. Skip Lenis and scrubs when `Shopify.designMode` is true [verified: shopify-dev, flag] [inferred: skip], as Rennsport skips Lenis inside the Webflow editor [site:911rennsport] [verified].
- Theme Store bars: average Lighthouse performance ≥ 60 and accessibility ≥ 90 across home, product and collection, desktop and mobile [verified: shopify-dev]. Theme Check's optional `AssetSizeJavaScript` is shown with a 10,000-byte threshold [verified: shopify-dev]: a WebGL engine is a custom-theme decision, not a Theme Store one [inferred].

### Hydrogen
Hydrogen is a separate React storefront on Shopify's Oxygen hosting: Shopify Editions runs Remix on Oxygen as one document, chunks under `cdn.shopify.com/oxygen-v2/` [site:shopify-editions-w26] [verified]. Current lines: the 2026.4 releases peer on React Router `~7.16` [verified: npm]; **2026.10.0** (2026-10-09) is described as a framework-agnostic storefront SDK with React and Vue entry points [verified: npm]. The plugin shape is then the React one (`stacks/next.md` pattern: the engine mounts in a client effect, disposes on unmount); the 2026.10 integration details are [unverified]. Hydrogen sets a Content Security Policy through `createContentSecurityPolicy` [verified: shopify-dev, page written for the Remix-era releases]: the engine origin, the Rive WASM and the Draco/Basis decoders must be allowed in it [inferred].

## How captures and the audit reach the page
| Target | Command | Notes |
|---|---|---|
| engine repo, theme repo | `node scripts/audit.mjs <dir>` | static rules on source you own; the `Edit\|Write` hook audits these files as you edit [inferred, from `hooks/hooks.json`] |
| Webflow code export (ZIP) | `node scripts/audit.mjs <unzipped dir>` | CMS, code components and localized pages are **not** in the export; Collection lists show their empty state [verified: webflow-help]. Fine for the shell's CSS and landmarks, not for content |
| any live or staging URL | `node scripts/audit.mjs <url> --render --json > .awards/audit-live.json` | URL audits require `--render` and do not write `.awards/audit.json` themselves [verified: plugin] |
| jury evidence | `node scripts/capture.mjs <url> --out .awards/captures` | waits up to 8 s for `window.__awards.ready`, then drives `__awards.scrollTo`; without the hook it falls back to `window.scrollTo` [verified: plugin]. A relative `--out` resolves to the folder with `AWARDS.md` [verified: plugin] |
| Shopify theme in development | `shopify theme dev` → `http://127.0.0.1:9292`, then the two rows above | a password-protected store answers every route with its password page, as Aqualoqa's splash does [site:aqualoqa] [verified]; the local preview avoids it [verified: shopify-dev] |
| WordPress | a local or staging URL with `--render` | block templates are comment-delimited markup; only the rendered page shows landmarks and contrast [inferred] |

Exclude the engine from "delay until interaction" optimisers before capturing: WP Rocket's Delay JavaScript execution holds scripts until a user interacts, and excludes a script by the `nowprocket` attribute or the Excluded JavaScript Files list [verified: wp-rocket]. A delayed engine never calls `awards.ready()`, so captures run on the 8-second fallback [inferred].

## Pitfalls
| Pitfall | Seen in | Do instead |
|---|---|---|
| Two smooth scrollers, or Lenis on its own clock while the platform's ScrollTriggers read native scroll | Stanzza: Lenis on a bare rAF, not wired to `ScrollTrigger.update`, under 18 IX3 scrubs [site:stanzza] [verified]; PrimeSec: two Lenis instances [site:primesec] [verified]; SiteAssist: `autoRaf: true`, unsynced [site:siteassist] [verified] | one Lenis on `gsap.ticker`, `lenis.on('scroll', ScrollTrigger.update)` |
| The platform's own anchor smooth scroll beside Lenis | Webflow's built-in smooth scroll animates in-page links and jumps under reduced motion [verified: webflow-help] | one owner for in-page links: Lenis with `anchors: true`, as Aardvark runs it [site:aardvarkbookclub] [verified], or the platform's scroll; how to switch Webflow's off is [unverified] |
| Platform interactions and the engine writing the same transform | Rennsport mixes IX2 scroll actions with ScrollTrigger scrubs [site:911rennsport] [verified] | give IX or Framer effects only elements the engine never touches |
| Interactions not re-initialised after a Barba, Swup or taxi swap | no documented IX3 re-init call [unverified]; Webflow-JS components need the same care (`webflow-export.md`) | no platform interactions on transitioned pages, or hard navigation |
| Unpinned CDN libraries | Lenis `@latest` and an unversioned Barba on Direct [site:wearedirect] [verified]; three r128 from a CDN on Bleibt Gleich [site:bleibtgleich] [verified] | bundle pinned versions (`versions.md`) |
| CMS markup without landmarks or alt text | 8 of 29 images with empty `alt` on Noth [site:noth] [verified]; 308 of 366 on Serotoninn [site:serotoninn] [verified] | landmarks in the template or Tag setting; required alt fields in the collection schema [inferred] |
| Optimisation plugins rewriting assets | PageSpeed-rewritten URLs on Serotoninn [site:serotoninn] [verified]; W3 Total Cache lazyload on Goats [site:goats] [verified] | exclude the engine and the hero image; set the hero eager |
| A platform jQuery nobody uses | jQuery 3.7.1 loaded by WordPress, unused by Goats' bundle [site:goats] [verified]; Webflow includes jQuery 3.5.1 on sites published since August 2020 [verified: webflow-help] | do not depend on it; do not load a second copy, which Webflow warns can conflict [verified: webflow-help] |
| Zoom disabled by the theme | `user-scalable=0` on Lama Lama [site:lama-lama] [verified] | never ship it. The audit's own rules do not check it [verified: `scripts/data/rules.json`]; whether axe-core under `--render` reports it is [unverified]: check the viewport meta by hand |
| Editor surfaces running the engine | Shopify theme editor re-renders sections [verified: shopify-dev]; Framer canvas | `Shopify.designMode`, `useIsStaticRenderer()`, Webflow's `wf-design-mode` guards as on A24 [site:a24-raviklaassens] [verified] |

## Where the corpus used it
Webflow (16): [site:911rennsport], [site:a24-raviklaassens] (Astro serving a Webflow export), [site:aardvarkbookclub], [site:abatable], [site:bleibtgleich], [site:lando-norris], [site:noth], [site:primesec], [site:siena], [site:siteassist], [site:son-daven], [site:stanzza], [site:to-top], [site:trevor-noah], [site:united-carriers], [site:wearedirect] (an export on the agency's own host). WordPress: [site:goats], [site:lama-lama], [site:serotoninn]. Shopify: [site:aqualoqa] (Horizon theme), [site:shopify-editions-w26] (Remix on Oxygen). Framer: none.
