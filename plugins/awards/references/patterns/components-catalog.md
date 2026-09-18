# Components catalog

What this file is for: the components the corpus builds more than once — what job each does, which cards ship it, what it is made of, how it moves, what it owes the keyboard and the reduced tier, which recipe builds it and which literal version is refused. Read it when filling the Components column of `AWARDS.md ## Page map` and when `DESIGN.md ## Components` is written; cite it as `[pattern:components-catalog#component]`. Every entry is a pattern, never a part to lift.

## Contents
1. [How to read an entry](#how-to-read-an-entry)
2. [Arrival and chrome](#arrival-and-chrome): preloader · nav overlay · cursor · sound toggle · chapter jump rail · scrollspy index · edition switcher and search · theme switcher
3. [Scroll set-pieces](#scroll-set-pieces): scrubbed hero object · pinned chapter · horizontal rail · sticky stack cards · scroll-drawn path · compare reveal
4. [Galleries and lists](#galleries-and-lists): draggable plane and arc gallery · hover-preview list · poster case blocks · metadata rows · ticker · wavy text
5. [Evidence blocks](#evidence-blocks): spec and metric blocks · map cards
6. [The close and beyond](#the-close-and-beyond): footer · 404 · easter eggs · living-utility pages
7. [Verify](#verify) · [Refuse](#refuse)

## How to read an entry

Why: a component earns its place by the job it does in the story, not by being seen on a winning site. Each entry lists role · seen in · anatomy · motion · accessibility · recipe · refuse. Motion values come from `[pattern:motion-vocabulary]`; where a card publishes none, the plugin's defaults are named as such. No card in the corpus documents a reduced-motion path for any component below, so the accessibility line is where new work beats the reference set (`craft-floor.md`).

## Arrival and chrome

### Authored preloader
- **Role.** The first beat of the story and the honest gate on the first scene's assets; often the sound-consent gesture (`[pattern:preloaders-and-transitions#the-load-contract]`).
- **Seen in.** Counter with a hold [site:floema] [verified]; circular progress ring plus a sound-consent click [site:leo-parpeix] [verified, live bundle 2026-09-18]; drawn gesture [site:why-zero] [verified]; boot readouts [site:usavionix] [verified]; title card [site:son-daven] [verified feature]; `00/24` frame counter [site:the-line] [verified]; vector animation on `Promise.all` [site:lando-norris] [verified]; two-arc ring [site:mont-fort] [verified]; pure-CSS ASCII [site:igloo] [verified]; intro interaction [site:oryzo] [recalled high].
- **Anatomy.** A number, a leader or a readout in the page's own register; costs nothing before first paint; resolves on `Promise.all([document.fonts.ready, firstSceneAssets])` with a timeout and a visible skip.
- **Motion.** Hold ≈ 1 s at 100; exit ≤ 1.5 s with titles at `y: 150%`, stagger .1, expo-out [site:floema]; ≤ 2.5 s or skipped on repeat visits.
- **Accessibility.** `aria-live="polite"` progress; removed from the tree afterwards; content never waits for the sound gesture; instant under reduced motion.
- **Recipe.** `[recipe:preloader-counter-hold]`.
- **Refuse.** A spinner, a `setTimeout` counter, a click wall, loading every route's assets.

### Fullscreen nav overlay with numbered links
- **Role.** Route choice as a designed screen, themed like the page; the mobile primary nav.
- **Seen in.** Overlay teleported to `<body>` with links numbered 01, 02, 03, closing on Escape and on route change [site:leo-parpeix] [recalled medium]; fullscreen navigation [site:son-daven] [verified]; full-screen Menu beside a persistent division switcher [site:mont-fort] [verified]; stacked large labels on mobile [site:shopify-editions-w26] [recalled medium-low]; a vector-driven hamburger morph [site:lando-norris] [verified].
- **Anatomy.** A `<dialog>` or `role="dialog"` layer in the current theme; four to six links at display scale with numerals as texture; a secondary row (socials, contact, language).
- **Motion.** Links stagger in at .06–.1 s on `--ease-out-expo`; out faster than in; the toggle morphs rather than swaps.
- **Accessibility.** `inert` on the page behind, focus trapped, Escape closes, focus returns to the toggle, smooth scroll locked while open; the toggle is a `<button aria-expanded>`.
- **Recipe.** `[recipe:nav-overlay-fullscreen]`.
- **Refuse.** A hamburger on desktop when four links fit; an overlay hidden with opacity that stays focusable.

### Custom cursor
- **Role.** The affordance system — a pointer that names what a target does (drag, play, view, copy) and gives the page mass.
- **Seen in.** Dot at lerp .75 with a ring at .22; ring 1.35× and dot .7× on hover, ring opacity .35 → .8; contextual pill badges; suppressed on `(hover: none), (pointer: coarse)` [site:leo-parpeix] [recalled medium]; `Cursor` plus a `CursorPlane` for reveals [site:the-line] [verified names]; a custom cursor by tag [site:why-zero] [verified]; none in the Floema source [site:floema] [verified absence].
- **Anatomy.** Two elements at two lerp rates; badge text from a `data-cursor` attribute on the target; hidden on window leave and on coarse pointers.
- **Motion.** Framerate-independent damping (`[pattern:motion-vocabulary#damping-math]`); hover answer ≤ 300 ms on the house curve; magnetic pull only on real targets.
- **Accessibility.** The badge's verb is also in the target's accessible name; the native cursor returns over inputs and text; focus-visible states carry the same information without the cursor (`[pattern:cursor-and-pointer]`).
- **Recipe.** `[recipe:cursor-two-speed]` `[recipe:magnetic-button]`.
- **Refuse.** Trail glitter; a cursor with no affordance job; `cursor: none` with nothing drawn.

### Sound toggle
- **Role.** Opt-in ambience and state-bound SFX, with a control that states what it is doing now.
- **Seen in.** An equaliser-bar toggle, ambient at .375 and SFX at .35 [site:leo-parpeix] [recalled medium]; a `Sound: Off` control drawn in the canvas with rate-limited named SFX [site:igloo] [verified]; a 24 × 24 canvas icon, likely audio-reactive [site:mont-fort] [verified element, inferred behaviour]; Howler with consent handling unknown [site:why-zero] [verified library].
- **Anatomy.** A `<button aria-pressed>` whose label carries the state; a crossfaded bed and named SFX per interaction; preference persisted.
- **Motion.** The icon animates from the audio signal or a fixed loop; nothing else changes.
- **Accessibility.** Default off; focusable with the state in its accessible name; content never waits for consent (`[pattern:sound#opt-in-only]`).
- **Recipe.** `[recipe:sound-toggle-opt-in]`.
- **Refuse.** Autoplay; a toggle with no visible state; audio as a load gate.

### Chapter jump rail
- **Role.** Lets a visitor leave a chaptered sequence for the chapter they came for; the felt progress of a world.
- **Seen in.** Numbered chapters with their own affordance [site:mont-fort] [verified]; a sidebar rail with ordered labels, connecting lines and an active state [site:shopify-editions-w26] [recalled medium-low]; an XP counter that makes progress felt [site:why-zero] [verified].
- **Anatomy.** A `<nav aria-label>` of chapter links with numerals; an active marker; on a virtual scroll it maps to section indices.
- **Motion.** The active state moves on the routine band (≈ .4 s); a jump scrolls with `lenis.scrollTo` or seeks the scalar with a 1.4 s snap.
- **Accessibility.** Real links with `aria-current="true"`; visible focus; works under keyboard and under the virtual float.
- **Recipe.** Built on `[recipe:boot-lenis-gsap]` for the jumps; `[recipe:gl-virtual-scroll-camera]` when the scroll is virtual.
- **Refuse.** Numbered markers that navigate nowhere (audit X07); a rail that vanishes on phones with no replacement.

### Scrollspy side index
- **Role.** A section index that follows reading position; the one eccentric element on an otherwise orderly page.
- **Seen in.** Rotated text pinned to the right edge, highlighting the section nearest viewport centre, jumping on click, hidden below ≈ 900 px [site:seasats] [clone-described, so a description of the pattern rather than of the site's code].
- **Anatomy.** A fixed `<nav>` of links; activation by the section midpoint nearest the viewport centre; rotated with `writing-mode` or a transform.
- **Motion.** The highlight moves on the routine band; no other animation.
- **Accessibility.** Below the collapse width a visible equivalent remains (a sticky select, a menu entry), so the nav model does not change per device; links carry `aria-current`.
- **Recipe.** No dedicated recipe; ScrollTrigger callbacks from `[recipe:boot-lenis-gsap]`.
- **Refuse.** A different navigation model per device — usability was the lowest axis at 7.17 [site:seasats] [verified].

### Edition switcher and local search
- **Role.** Product thinking inside a campaign or read page: switch between releases, search and filter 100+ items without leaving the world.
- **Seen in.** A header edition selector, search and a primary action; update cards with filtering and grouping; a keyboard-navigable local search that closes on Escape [site:shopify-editions-w26] [recalled medium-low]; news with an unread count and persisted read state [site:mont-fort] [verified].
- **Anatomy.** A `<select>` or menu for the edition; a search dialog over a content schema rendered in the DOM; filters as real controls; read state in local storage.
- **Motion.** Results appear on the feedback band; the dialog opens with the overlay vocabulary above.
- **Accessibility.** Combobox or dialog semantics, Escape and focus return, result counts announced; everything searchable exists in the DOM without JS.
- **Recipe.** Focus mechanics from `[recipe:nav-overlay-fullscreen]`; no search recipe.
- **Refuse.** Search over content that only exists after hydration; an iframe shell around it.

### Colour-bound product row and theme switcher
- **Role.** Variant selection that repaints the world; colour as navigation or as section rhythm.
- **Seen in.** A low product row whose underline doubles as an autoplay countdown, each choice repainting ground, panel, button, ink and shadow [site:slosh-seltzer] [verified at family level]; four named themes swapped per section [site:leo-parpeix] [recalled medium]; a theme per route tweened on `<html>` [site:floema] [verified]; nav theme sampled from the section under the header [site:lando-norris] [verified].
- **Anatomy.** `data-theme` on `<html>` as the single source; N token sets; the switcher a radio group; the canvas clear colour read from the same tokens.
- **Motion.** ≈ 1 s on `--ease-theme`, every slot and the clear colour in one tween, restarting from the current value; instant under reduced motion (`[pattern:color-and-material#colour-as-state]`).
- **Accessibility.** Arrow keys move the selection; `aria-pressed` or checked state; the autoplay countdown pauses on hover, focus and reduced motion; contrast holds in every theme.
- **Recipe.** `[recipe:theme-swap-tokens]`.
- **Refuse.** A switcher on a product without variants; the six flavour hexes; tweening elements one by one.

## Scroll set-pieces

### Scroll-scrubbed hero object or scene
- **Role.** The signature object answering scroll — rotation, a camera move, a frame sequence — without owning the scroll.
- **Seen in.** `rotation.y = scrollY × 0.00015` [site:leo-parpeix] [recalled medium]; a scroll-pinned helmet stage [site:lando-norris] [verified]; a camera scrubbed by normalised chapter progress [site:mont-fort] [inferred high]; scene-to-scene freight transitions [site:united-carriers] [verified concept]; pre-rendered sequences scrubbed on scroll [site:seasats] [inferred medium].
- **Anatomy.** One canvas, DOM-tethered or fixed; scroll written to a ref or uniform and read in the render loop; a poster underneath.
- **Motion.** `ease: 'none'` under the scrub; smoothing from Lenis or `scrub: .4`; a plain multiplier is the cheapest scrub (`[pattern:motion-vocabulary#scrub-and-refresh-rules]`).
- **Accessibility.** Native scroll intact so keys work; a still on the reduced tier; a poster `<img>` and real text under an `aria-hidden` canvas.
- **Recipe.** `[recipe:gl-hero-object-inertia]` `[recipe:image-sequence-scrub]` `[recipe:scroll-pin-scrub]`.
- **Refuse.** Floating primitives with no concept; scroll-jacking to make the object move.

### Pinned chapter with scrubbed media
- **Role.** A chapter that holds still while its media plays through — a render across seasons, a painting behind its labels.
- **Seen in.** Scrubbed chapter transitions held by CSS `position: sticky`, 23 scrubbed triggers and no `pin:` at all [site:son-daven] [verified, live source 2026-09-18]; a sticky scene layer per section with static fallback media beneath [site:shopify-editions-w26] [recalled medium-low]; sticky stages with invisible rails, never `pin: true` [site:the-line] [verified]. No corpus card is now known to use `pin: true`.
- **Anatomy.** A tall transparent rail sets the distance; the visual is `position: sticky`; the media is a frame sequence, a video scrubbed by `currentTime`, or a GL scene.
- **Motion.** Scrub with no easing; the chapter's one authored moment lives here; rail height ≈ 200–300 vh, longer only with something to read.
- **Accessibility.** Each chapter is a `<section>` with a heading; the rail never traps focus; one still per chapter under reduced motion.
- **Recipe.** `[recipe:sticky-stages-rails]` `[recipe:scroll-pin-scrub]` `[recipe:image-sequence-scrub]`.
- **Refuse.** `pin: true` where sticky works (audit M06); a pinned chapter with nothing to read.

### Horizontal rail inside a vertical page
- **Role.** A change of axis for one chapter — a collection, a timeline, a row of typologies.
- **Seen in.** Horizontal rails in a long-form page [site:son-daven] [verified]; an arced collections rail in GL with a dial of titles [site:floema] [verified, clone].
- **Anatomy.** A pinned container translating a track on `x`; items as list entries; progress mirrored by a small index.
- **Motion.** `x` scrubbed from scroll on `ease: 'none'`; touch gets native `overflow-x` instead of a pin.
- **Accessibility.** Arrow keys move the track; every item focusable; no wheel hijack; reduced tier is a plain horizontal scroller.
- **Recipe.** `[recipe:horizontal-rail]`.
- **Refuse.** A second rail on the same page; a rail for prose that reads better vertically.

### Sticky stack cards
- **Role.** A sequence of comparable statements stacked in place, each replacing the last.
- **Seen in.** `StackCards` as a homepage block [site:mindmarket] [verified component; parameters unknown].
- **Anatomy.** A pinned container; N cards with increasing offset; the previous card scales down and blurs as the next arrives.
- **Motion.** Scale to ≈ .94 and a slight blur on the outgoing card, scrubbed; no more than five cards.
- **Accessibility.** A flat list under reduced motion; every card readable and reachable; one heading per card.
- **Recipe.** `[recipe:sticky-stack-cards]`.
- **Refuse.** Stacking content that must be compared side by side; card grids re-skinned as a stack.

### Scroll-drawn path
- **Role.** A line that connects beats as the visitor descends — a journey, a network, a process.
- **Seen in.** `ScrollPathSection` [site:mindmarket] [verified component]; `svg.createDrawable` [site:animejs] [verified]; a hand-drawn ellipse stroked on the home link [site:floema] [verified, clone].
- **Anatomy.** An inline SVG path with `stroke-dasharray` and `stroke-dashoffset` bound to scroll progress; markers at the beats.
- **Motion.** Drawn on `ease: 'none'`; a stroke that also draws once on hover for a CTA.
- **Accessibility.** Decorative: `aria-hidden`; fully drawn under reduced motion; the beats it connects are real headings.
- **Recipe.** `[recipe:scroll-drawn-svg-path]`.
- **Refuse.** A path across a world map as the signature.

### Hold or drag to compare
- **Role.** Two conditions of one subject — summer and winter, before and after — in one frame.
- **Seen in.** A drag handle travelling an SVG path, snapping on release and clicking the real buttons underneath at threshold — no mask, no second render [site:son-daven] [verified, live source 2026-09-18].
- **Anatomy.** Two aligned images; a clip driven by pointer position or by a held press; a handle.
- **Motion.** The clip follows the pointer with pointer capture; the release eases back or holds, on the routine band.
- **Accessibility.** Arrow keys or a `<input type="range">` drive the clip; both images carry alt text; the current side is announced.
- **Recipe.** `[recipe:compare-hold-drag]`.
- **Refuse.** A compare where only one condition exists; a compare as decoration on a hero.

## Galleries and lists

### Infinite draggable plane and arc gallery
- **Role.** Physicality instead of navigation: push a field of work around, or drag an arced row.
- **Seen in.** An infinite plane recycling items past 60 % of the viewport with re-randomised rotation; a collections row arced by `mapRange(-0.2, 0.2)` and a cosine offset [site:floema] [verified, clone]; a seamless carousel with `utils.wrap`, auto-speed tweened to 0 on grab and back on release [site:animejs] [verified].
- **Anatomy.** A list of `<a>` items in the DOM; planes or cards mapped from their rects; drag through the same lerp as the scroll.
- **Motion.** Lerp ≈ .1 on the scroll value; velocity into a vertex uniform if GL; 500 ms speed tweens on grab and release.
- **Accessibility.** Tab and arrow keys move the target one item at a time with a visible focus ring; `<img alt>` behind every plane; a grid on the reduced tier.
- **Recipe.** `[recipe:gl-dom-tethered-planes]`.
- **Refuse.** The Floema bulge or its grid-to-detail flight; drag-only galleries with no focusable stops.

### Hover-preview archive list
- **Role.** A long index that stays a list, with the image appearing only when a row is pointed at.
- **Seen in.** Archive rows spawning a preview that chases the cursor at lerp .25 [site:leo-parpeix] [recalled medium]; `ImageRevealList` [site:mindmarket] [verified component]; a cursor-following reveal on the about and work lists [site:the-line] [verified].
- **Anatomy.** A `<ul>` of link rows with metadata; one floating preview element repositioned per frame; lazy image per row.
- **Motion.** The preview follows at a lerp; swaps on the feedback band; a flicker or shift on the row text if the register calls for it.
- **Accessibility.** Focus shows the preview; touch taps expand inline; the row is the link, not the image.
- **Recipe.** `[recipe:hover-preview-list]`.
- **Refuse.** The preview as the only way to see the work; a list with no metadata.

### Poster-scale case blocks
- **Role.** The work as announcements — each piece owns a viewport and arrives with mass.
- **Seen in.** Case studies described as arriving with festival-poster confidence [site:lama-lama] [recalled low-medium; mechanism undocumented].
- **Anatomy.** One block per case, ≈ 100 vh, a display-scale title, a label row (client, year, discipline), one image or clip.
- **Motion.** The plugin's default: a scale from ≈ .94 or a clip-path wipe on `--ease-out-expo` over 1.2–1.5 s, label and title staggered .06–.1 s — not the site's numbers, which are unknown.
- **Accessibility.** Each block is an `<a>` inside a list with `:focus-visible`; images have alt text; opacity-only entrance under reduced motion.
- **Recipe.** `[recipe:split-text-masked-reveal]` for the title; `[recipe:sticky-stages-rails]` if the run holds.
- **Refuse.** The identical card grid (audit L04); posters on a subject that does not justify posters.

### Metadata-labelled project rows
- **Role.** Credibility as structured data: name · discipline · year · team, an award tally, a credit table.
- **Seen in.** A metadata quartet with a "team of N at studio" line and an award count; an about page as a tabular CV [site:leo-parpeix] [recalled medium]; underlined credit tables and `/ MICRO / LABELS /` [site:the-line] [verified]; a numbered label plus collection title per item [site:floema] [verified].
- **Anatomy.** A `<table>` or `<dl>` per row; labels at the `--label` size as texture; numerals as the first column.
- **Motion.** A masked reveal per row on entry; a hover shift on the whole row; nothing on the numbers.
- **Accessibility.** Labels that carry meaning are text, not pseudo-elements (a decorative slash may be `::before`); rows are links or contain one.
- **Recipe.** `[recipe:hover-preview-list]` as the list; `[recipe:flicker-text]` for the row register.
- **Refuse.** Eyebrow labels by habit (audit L05); adjectives where a number belongs.

### Ticker and marquee
- **Role.** A live strip — clients, news, a slogan — that keeps moving without becoming the hero; the fastest B2B trust signal directly after the hero.
- **Seen in.** A rAF translate with wraparound, mask-edge fade, pause on hover and clickable links [site:seasats] [clone-described]; `BrandMarquees` and `MarqueeBlock` [site:mindmarket] [verified component]; a social marquee [site:slosh-seltzer] [inferred].
- **Anatomy.** Children duplicated once; one transform on the track; a CSS mask at the edges.
- **Motion.** Speed from scroll velocity, never a CSS keyframe rate; pause on hover and focus; paused offscreen (audit M08).
- **Accessibility.** The duplicate copy `aria-hidden`; static under reduced motion; links reachable by Tab.
- **Recipe.** `[recipe:marquee-raf-mask]`.
- **Refuse.** The marquee as the hero; a logo wall by reflex.

### Wavy text and the second text system
- **Role.** An accent text effect for a phrase or a label, kept separate from the heading system.
- **Seen in.** `WavyText` for accents beside `TextReveal` for headings [site:mindmarket] [verified components, inferred behaviour]; per-character split effects, hover rolls and scramble in the library examples [site:animejs] [verified].
- **Anatomy.** Characters split by a data attribute; a per-character wave, roll or scramble; used on one phrase per chapter.
- **Motion.** Staggers of 5–30 ms per character; ≤ .6 s total; never on the same element as a masked reveal (`[pattern:motion-vocabulary#text-effects]`).
- **Accessibility.** An accessible copy of the text; static under reduced motion; no wave on body copy.
- **Recipe.** `[recipe:scramble-decode-text]` `[recipe:flicker-text]`; headings stay on `[recipe:split-text-masked-reveal]`.
- **Refuse.** Both systems on one element; a wave on a headline.

## Evidence blocks

### Spec and metric blocks
- **Role.** Numbers as copy — the corpus's replacement for adjectives and for count-up statistics.
- **Seen in.** Specs used as headline rhetoric — months at sea, 8,000 nautical miles, Sea State 6 [site:seasats] [verified fragments]; dual units and scarcity as numbers [site:white-desert] [verified]; spec beats on platform pages [site:usavionix] [verified routes]; numbered ESG pillars with percentages [site:mont-fort] [verified]; investment metric blocks [site:son-daven] [verified inventory].
- **Anatomy.** A `<dl>` of figure and unit pairs, or one figure at display scale with its unit at label scale; dual units side by side.
- **Motion.** None on the numbers; the block enters with the chapter's masked reveal.
- **Accessibility.** Units in the text, not in icons; figures readable in order with CSS off.
- **Recipe.** None — copy work (`[pattern:copy-and-content#numbers-not-adjectives]`).
- **Refuse.** The hero-metric row (audit X08); count-up animation; a figure without a unit.

### Interactive map cards
- **Role.** Reach or place shown rather than claimed — offices, sites, a network, a route.
- **Seen in.** An infrastructure map with interactive location cards [site:son-daven] [verified inventory]; 48 countries as `{ name, x, y }` on a flat projection [site:mindmarket] [verified data; rendering inferred]; a city map with game-style controls [site:why-zero] [verified]; a season calendar as a 3D track with DOM-anchored markers [site:lando-norris] [verified].
- **Anatomy.** An SVG or image map with pins positioned by percentage; a card per pin; if the map is 3D, HTML markers projected from scene coordinates.
- **Motion.** Staggered pin entrance; a card on hover and focus on the feedback band.
- **Accessibility.** Pins are `<button>` or `<a>` elements with names; a list alternative of the same places; arrow keys where the map is a control.
- **Recipe.** `[recipe:gl-dom-tethered-planes]` for DOM-to-scene sync when the map is 3D; otherwise none.
- **Refuse.** A WebGL globe for a flat dataset; pins without names.

## The close and beyond

### Designed footer
- **Role.** The last screen, authored like the first; the conversion in the page's register.
- **Seen in.** A footer tagged by the jury [site:seasats] [verified]; one selected by a footer gallery [site:united-carriers] [verified]; a sticky flare-red footer with a closing logo block, live open/closed timings, back-to-top and a credits link [site:the-line] [verified]; an interactive particle footer [site:oryzo] [recalled high]; a three-line CTA in the last theme [site:leo-parpeix] [recalled medium]; a designed footer in the inventory [site:son-daven] [verified].
- **Anatomy.** A `<footer>` landmark: the CTA, the essential links, credits, the colophon; often the page's last theme or its bookend hue.
- **Motion.** One moment at most — a reveal, a theme change, a magnetic CTA.
- **Accessibility.** Links reachable beneath any particles; contrast in the footer theme; the credits link real.
- **Recipe.** `[recipe:magnetic-button]` for the CTA; `[recipe:theme-swap-tokens]` when the footer is a theme.
- **Refuse.** A sitemap dump; a social-icon row as the ending; the sticky red footer as drawn.

### Designed 404
- **Role.** Proof that every route is authored; a moment in the same world.
- **Seen in.** An orbiting object in its own scene [site:lando-norris] [verified]; a 404 indexed as an inspiration entry in the series [site:shopify-editions-w26] [recalled high]; a custom 404 by tag [site:why-zero] [verified]; the plugin's own starting point in `assets/templates/404.html`.
- **Anatomy.** An `<h1>` that says the page is missing, one gesture from the world, three routes out, a search if the site has one.
- **Motion.** One idle loop that pauses when hidden; nothing that delays the links.
- **Accessibility.** Any scene `aria-hidden`; the links first in DOM order; the page lighter than the home page.
- **Recipe.** `[recipe:page-transitions]` for the route; no dedicated recipe.
- **Refuse.** The host's default 404; a 404 that needs WebGL to show the way out.

### Easter eggs
- **Role.** A reward for curiosity that signals confidence; never a dependency.
- **Seen in.** Tardigrades that appear after dwelling in the zoom section [site:oryzo] [recalled high]; a hint that spawns 3D fruit with one of two sounds [site:leo-parpeix] [recalled medium]; a disco ball and an award-trophy model in the scene manifest, plus a `?debug` panel [site:lando-norris] [verified]; star confetti on click [site:animejs] [verified].
- **Anatomy.** One asset or one behaviour off the main path — dwell-gated, click-spawned or hidden in a scene.
- **Motion.** Anything the world allows; it obeys the reduced tier like everything else.
- **Accessibility.** Never required content; a click-triggered egg is keyboard-triggerable; a dwell-gated egg needs no gesture.
- **Recipe.** None.
- **Refuse.** The specific gags; a debug panel shipped to production.

### Living-utility pages
- **Role.** A reason to return after the story — the site as a destination rather than a leaflet.
- **Seen in.** Dated construction-progress articles and news [site:son-daven] [verified]; a regional trade-news feed and a merch store on a freight site [site:united-carriers] [verified routes]; news with persisted read state and an unread count [site:mont-fort] [verified]; homepage slots for whatever is current [site:trevor-noah] [verified]; a guest library [site:white-desert] [verified route]; live open/closed studio timings [site:the-line] [verified].
- **Anatomy.** Real content routes from the CMS; dated entries in lists; small persistent state (read/unread) that outlasts any effect.
- **Motion.** The routine reveal vocabulary only.
- **Accessibility.** Plain, readable pages; feeds as lists with dates; state persisted with a try/catch around storage.
- **Recipe.** None.
- **Refuse.** A feed or a shop bolted on without a reason [site:united-carriers]; a utility page that breaks the world's register.

## Verify

- [ ] Every component in the page map has a role in the story, a recipe id or "none", and a reduced-motion line.
- [ ] The preloader resolves on real assets with a timeout and skip; the nav overlay traps focus and closes on Escape; the cursor is off on coarse pointers; the sound toggle states its value and defaults off.
- [ ] Rails, stacks, compares and galleries answer arrow keys and Tab; touch gets native overflow; nothing hijacks the wheel.
- [ ] Marquees pause on hover, focus, offscreen and reduced motion; wavy text and masked reveals never share an element.
- [ ] Numbers are copy with units; map pins and archive rows are real links or buttons with names.
- [ ] The footer and the 404 are authored, in the world's register, and lighter than the home page.
- [ ] Easter eggs and utility pages are extras: nothing required lives behind them.

## Refuse

- Any component lifted with its card's values: the counter jumps, the badge set, the rotated index, the `00/24` leader, the 48-country map, the seven-chapter rail, the flavour row.
- A component with no job in the story — a compare with one condition, a stack of unrelated cards, a marquee as a hero.
- Hover-only previews, drag-only galleries, wheel-jacked rails, click walls, autoplaying sound.
- `pin: true` where sticky works; a marquee on a CSS keyframe; count-up numbers.
- Identical card grids, eyebrow labels, numbered markers that navigate nowhere, hero-metric rows.
- A host-default 404, a sitemap footer, a debug panel in production.
