# Hero archetypes

What this file is for: the nine first viewports the corpus actually built — what each is made of, how it enters, what it does on a phone, what the DOM says underneath and which recipes build it. Read it after the narrative model is chosen and before the FIRST VIEWPORT line of the direction contract is written; cite it as `[pattern:hero-archetypes#archetype]`. An archetype is a structure with a card attached; the card's signature — its device, its object, its colour — is exactly what is not taken.

## Contents
1. [Common rules](#common-rules)
2. [Two-state typographic](#two-state-typographic) · [Role-casting boot sequence](#role-casting-boot-sequence) · [Poster or video hero](#poster-or-video-hero)
3. [Single object with inertia](#single-object-with-inertia) · [Collage of flat planes](#collage-of-flat-planes) · [Spatial descent](#spatial-descent)
4. [Print artefact with an acetate](#print-artefact-with-an-acetate) · [Headline as string](#headline-as-string) · [Palette field bound to the product](#palette-field-bound-to-the-product)
5. [Choosing](#choosing) · [The first viewport test](#the-first-viewport-test) · [Verify](#verify) · [Refuse](#refuse)

## Common rules

Why: the hero is the entrance beat of chapter one (`[pattern:narrative-structures#how-to-read-a-model]`), and it is where a juror runs the naming test. Whatever the archetype: one signature, arriving once, at hero scale (1.2–1.5 s, `[pattern:motion-vocabulary#durations]`); the primary action visible without scrolling; the largest contentful paint from a poster, a still or the DOM itself, never from the canvas; the canvas `aria-hidden` over real text and images; a static tier that shows the settled composition. No archetype in the corpus documents a reduced-motion path, so each entry below names one.

## Two-state typographic

One display line names the subject, then mutates into a second claim: the type is the hero. Seen in [site:leo-parpeix], where a three-word identity line resolves into a second claim after the preloader's reveal [recalled medium]; the big-type register without the mutation is [site:lama-lama] [recalled medium].

- **Anatomy.** A display line at the `--display` clamp (≈ 12 vw); one or two small labels as texture (a metadata quartet, a location, a year); the ground in the page's first theme; minimal nav; optionally a scene behind the DOM [site:leo-parpeix] is canvas-first.
- **Entrance.** Masked line reveal — `y: 150%` → 0 on expo-out over 1.2–1.5 s, stagger .1, split only after `document.fonts.ready` — then the mutation: a scramble decode or a second masked swap. One hero-scale moment, never re-run on scroll (`[pattern:motion-vocabulary#masked-line-reveals]`).
- **Mobile.** The line wraps to two or three lines at fixed px sizes below 768 (`[pattern:typography#fluid-scale]`); the mutation still plays; any scene behind becomes a still.
- **DOM.** The `<h1>` contains the final claim; the first state lives in an `aria-hidden` span so the accessible name never flickers; split spans carry an accessible copy.
- **Recipes.** `[recipe:split-text-masked-reveal]` `[recipe:scramble-decode-text]`; `[recipe:flicker-text]` as an alternative mutation.
- **Refuse.** The three-word identity device itself; a click-to-enter wall in front of it.

## Role-casting boot sequence

The visitor is cast as the operator: readouts flicker on before any image, then the capability claim [site:usavionix] [verified descriptions] — loading as the product's own console (`[pattern:preloaders-and-transitions#preloader-archetypes]`).

- **Anatomy.** A full-viewport console: a status region of readouts, reticles and coordinate labels as a real layer; the subject in WebGL or photography; one white claim line; pure black only because the world is night vision — recorded as a C02 exception in `AWARDS.md`.
- **Entrance.** The readouts as timed reveal choreography (flicker or scramble at ≈ .04 s per glyph), tied to a real load signal and cut to ≤ 2.5 s on repeat; then the claim; then layered scroll compositing — foreground, subject, background and HUD at different rates [verified descriptor], never per-element fade-ups.
- **Mobile.** Fewer readouts; the layered parallax only on the high tier; the subject as a poster; the status text still reads.
- **DOM.** Readouts are text in an `aria-live="polite"` region that leaves the tree after boot; the `<h1>` is the claim, not a readout; HUD decoration is `aria-hidden`; content never waits for the sequence.
- **Recipes.** `[recipe:preloader-counter-hold]` (boot variant) `[recipe:scramble-decode-text]` `[recipe:flicker-text]` `[recipe:sticky-stages-rails]` for the layers.
- **Refuse.** The thermal, lidar and IR readouts; #000 + #fff by reflex; the scenario content.

## Poster or video hero

A full-bleed moving image sets the energy before any reading and the type arrives second [site:lama-lama] [recalled medium-high]. The cinematic hero of [site:white-desert] is inferred from its IA; [site:seasats] carries a hero video slot that is probed before display and faded in only when it loads [clone-described].

- **Anatomy.** A muted loop with a poster frame; one big grotesque line over or under it; minimal chrome; on a bone-ground site the dark hero is the first tempo change [site:lama-lama] [recalled medium].
- **Entrance.** The poster paints first and is the LCP; the video streams after first paint; the title masked-reveals second. Never a fade-in of the whole viewport.
- **Mobile.** Poster only, or a shorter and smaller encode; `muted playsinline preload="metadata"`; paused offscreen; reduced motion parks on the poster.
- **DOM.** `<video poster>` with a text alternative, or `aria-hidden` when decorative; a real `<h1>`; a probe-then-reveal slot so a missing asset leaves the layout intact [site:seasats].
- **Recipes.** `[recipe:split-text-masked-reveal]`; encoding and weight in `[pattern:asset-pipeline]`.
- **Refuse.** Video as wallpaper under a wall of text; autoplay with sound; festival-poster styling on a subject that does not justify posters.

## Single object with inertia

One object with real weight and lighting that answers its motion, and no scene around it [site:oryzo] [recalled high].

- **Anatomy.** One mesh with physical materials on a quiet ground; the display line beside or through it; tiny chrome; a four-value palette; the canvas DOM-tethered — `position: absolute`, re-offset every frame to the scroll position, ≈ 25 % over-render against clipping [verified technique, use on the site inferred].
- **Entrance.** An intro interaction with a skip and a keyboard trigger; the object settles with momentum; scroll later scrubs its rotation (a plain multiplier, as in `rotation.y = scrollY × 0.00015` [site:leo-parpeix] [recalled medium]); reduced motion completes the intro instantly.
- **Mobile.** A purpose-built mobile treatment earned its own inspiration entry [site:oryzo] [recalled high]: DPR cap, a low-detail mesh, touch drag; a poster still on the low tier.
- **DOM.** Product name, specs and the action as real text; the canvas `aria-hidden` over an `<img>` poster; the drag has arrow-key rotation.
- **Recipes.** `[recipe:gl-hero-object-inertia]` `[recipe:gl-dom-tethered-planes]` `[recipe:quality-tiers]`.
- **Refuse.** The coaster; floating primitives with no concept; a hero glb over 300 KB without a reason.

## Collage of flat planes

Photographs treated as physical objects — a corner that lifts — scattered, then resolving into an index [site:trevor-noah] [verified concept [verified, live source 2026-09-18]; the cards are DOM and the lift is an SVG path, not a plane]. The drag-driven cousin is Floema's drifting field of translucent planes [site:floema-jewelry] [verified, clone].

- **Anatomy.** Five to nine image planes over a two-token ground; one line of type; a featured rail for what is current; the planes are the imagery, so no other 3D exists.
- **Entrance.** Planes settle with a .06–.1 s stagger from slight offsets; sub-degree to few-degree rotations read as hand-placed (`Math.PI * 0.01`, `mapRange(-0.2, 0.2)` [site:floema-jewelry] [verified]); the material answers pointer proximity or scroll; nothing else parallaxes.
- **Mobile.** Fewer planes, scroll-driven only; the revenue module gets the craft attention first [site:trevor-noah] [verified intent].
- **DOM.** Every plane is an `<img>` in a list in the DOM behind an `aria-hidden` canvas, so the collage degrades to a real gallery [site:trevor-noah]; planes are mapped from their rects each frame [site:floema-jewelry].
- **Recipes.** `[recipe:gl-dom-tethered-planes]`.
- **Refuse.** The Polaroid curl and the "snapshots of a mind" framing; the Floema bulge as a signature.

## Spatial descent

An establishing shot of a landscape with one structure; a HUD line invites the scroll; the camera orbits, approaches and flies inside [site:igloo] [recalled high]. 100 % canvas.

- **Anatomy.** A landscape and one structure; in-canvas MSDF type; a HUD scroll prompt; a `Sound: Off` control that states its value; a pure-CSS loader from a 16 KB entry [verified]; a fog gradient with one rim accent [verified hexes].
- **Entrance.** CSS loader → the 3D app streams (≈ 420 KB gz for the scene [verified]) → the camera settles on the shot → the prompt. Scroll is a damped, snapping scalar (`[pattern:motion-vocabulary#scroll-philosophies]`, model d).
- **Mobile.** An engineered path — responsive scored 8.40 [recalled medium]; ≤ ~625 KB of textures per scene; DPR cap; a still per chapter on the low tier.
- **DOM.** The empty DOM scored 6.6 [recalled medium]: ship a visually hidden mirror with landmarks, the `<h1>`, the manifesto sentence and real links; keys advance the scalar; the sound toggle is focusable with its state in its name.
- **Recipes.** `[recipe:gl-virtual-scroll-camera]` `[recipe:gl-msdf-text]` `[recipe:gl-postprocessing-presets]` `[recipe:quality-tiers]`.
- **Refuse.** The arctic world, the igloo, the descent-then-wrap order, the blue-grey monochrome.

## Print artefact with an acetate

A `00/24` frame counter, then the hero sheet: a flat red panel under `mix-blend-mode: multiply` over greyscaled footage, plus the logo layer; the sheet hinges away as you scroll [site:the-line] [verified].

- **Anatomy.** The display line at 12.15278vw (210 px on a 1728 artboard), weight 500, tracking −0.04em, leading .8–.95; ~9 px uppercase labels; slash nav; status dots; an 8 px page margin; a cool silver ground, deliberately not white [verified].
- **Entrance.** The frame counter, tied to a real load → the display line strikes on with a per-letter flicker → the hinge: `transform-origin: bottom left`, x 0 → −10 %, rotate 0 → −15° across the hero's scroll range, the child lagging the parent [verified].
- **Mobile.** Fixed px below 768 (`text-[72px]` in the reconstruction [verified]); the hinge shrinks to a few degrees or becomes a cut; posters instead of live greyscale filters.
- **DOM.** The acetate div is `aria-hidden` [verified]; the `<h1>` is real; the slash is a pseudo-element; native scroll stays under the custom scrollbar.
- **Recipes.** `[recipe:sticky-stages-rails]` `[recipe:flicker-text]` `[recipe:preloader-counter-hold]` (frame-counter variant).
- **Refuse.** Red over greyscale, the `00/24` leader, the hero hinge as drawn, Denim.

## Headline as string

The brand architecture set as one string — four division names run together as the hero headline — over a procedural landscape derived from the company's name [site:mont-fort] [verified string; inferred reading].

- **Anatomy.** The string at display scale; a persistent division switcher (parent plus four children always visible) in the nav; a numbered chapter rail; a landscape lit by a baked lightmap; one slate ink with white at .8 and 1.0 opacity for hierarchy [verified].
- **Entrance.** The two-arc ring loader (`[pattern:preloaders-and-transitions#preloader-archetypes]`) → the landscape → the string, word by word, on a masked reveal; chapters then scrub a camera from 0–1 progress [inferred high].
- **Mobile.** One division per line; the switcher collapses into the menu; the island renders a lower tier or a still.
- **DOM.** The `<h1>` holds the string with each division in a `<span>`; the links live in the switcher `<nav>`, not inside the heading; every division paragraph in static HTML [verified]; the rail is a `<nav>` with `aria-current`.
- **Recipes.** `[recipe:split-text-masked-reveal]` `[recipe:sticky-stages-rails]` or `[recipe:scroll-pin-scrub]` for the chapters; `[recipe:page-transitions]` (View Transitions variant).
- **Refuse.** The mountain, the four names as a string, the slate hex and its P3 twin.

## Palette field bound to the product

One flat, unmodulated colour field bound to the current variant; one focal object; the swap is the transition [site:slosh-seltzer] [verified at family level; recalled medium for the site].

- **Anatomy.** The field owns the screen; chrome pinned tiny to the four edges; a product row whose underline doubles as an autoplay countdown; one display word drawn through the object (family-level, not confirmed for Slosh); shadows tinted to each theme's own darkness at a constant alpha.
- **Entrance.** The field paints at first paint from a CSS token, no JS; the object arrives with inertia; the word masked-reveals; the first swap fires when the countdown runs out — ≈ 1 s on `--ease-theme`, every slot and the canvas clear colour in one tween, restarting from the current value under rapid switching.
- **Mobile.** Heavy WebGL stays viable with a DPR cap, an absolute pixel cap, half-float targets, SMAA and low-detail variants [recalled medium]; otherwise a per-variant still.
- **DOM.** `data-theme` on `<html>` is the single source for tokens and clear colour; the switcher is a radio group with arrow keys and `aria-pressed`; product name, flavour, ingredients and the buy link are semantic; the canvas `aria-hidden`; an instant repaint under reduced motion.
- **Recipes.** `[recipe:theme-swap-tokens]` `[recipe:gl-hero-object-inertia]` `[recipe:gl-rtt-composite-transition]` `[recipe:quality-tiers]`.
- **Refuse.** The can, the six hexes, the edge-pinned layout as-is.

## Choosing

Why: the archetype follows the narrative model and the WebGL dosage the budget allows; dosage is a cost decision, not a quality signal — a Site of the Month was DOM-first [site:the-line], a Site of the Year was 100 % canvas [site:igloo], and a Developer Award went to 3D without WebGL [site:seasats].

| Archetype | Fits these models | Dosage floor → ceiling | Cards |
|---|---|---|---|
| Two-state typographic | collage index, specification, a faceted hub | none → canvas-first (a scene behind the DOM) | [site:leo-parpeix] |
| Role-casting boot sequence | specification (role-casting), chaptered journey | moments → canvas-first | [site:usavionix] |
| Poster or video hero | gallery, specification (place-led), chaptered journey | none → moments | [site:lama-lama] [site:white-desert] [site:seasats] |
| Single object with inertia | single-object launch, a faceted hub | canvas-first | [site:oryzo] |
| Collage of flat planes | collage index, gallery | moments → canvas-first, planes only | [site:trevor-noah] [site:floema-jewelry] |
| Spatial descent | chaptered journey as a world, manifesto with gates | 100 % canvas | [site:igloo]; gesture entry [site:why-zero] |
| Print artefact with an acetate | print artefact, gallery | none → moments | [site:the-line] |
| Headline as string | chaptered journey, faceted world | one canvas-first island in a static page | [site:mont-fort] |
| Palette field bound to the product | single-object launch | canvas-first with a static per-variant tier | [site:slosh-seltzer] |

Rules: decide what the first three seconds must say (who, what, why now), then take the lowest dosage that says it; never stack archetypes — a video under a two-state line under a scene is three heroes; a read-mode page (`[site:shopify-editions-w26]`, `[site:animejs]`) keeps the hero short and puts the index on screen one.

## The first viewport test

Why: visitors and jurors decide in three seconds, and the specificity test in `anti-patterns.md` looks at the first viewport alone.

What a juror sees in three seconds: the ground and its temperature; the character of the type (one glyph is enough); one object or image; where the primary action sits; whether anything moves for a reason. What they do not see yet: the paragraph, the nav labels, the second screen.

1. **Naming test.** Could a juror name the source site from this viewport alone? If yes, restart: change the archetype, the palette strategy or the signature — not the copy.
2. **Generator test.** Dark + neon + glow, a blob or particle field, an oversized grotesque over a logo marquee: two families present means remove them before adding anything.
3. **Strip test.** Remove the copy. Does the composition still say what this is and why it matters?
4. **Action test.** The primary action is visible without scrolling, is a real `<a>` or `<button>`, and its label is the outcome (`[pattern:copy-and-content#conversion-matched-to-stakes]`).
5. **Cost test.** LCP from a poster or the DOM ≤ 2.5 s; the GL chunk lazy; the hero's one moment ≤ 1.5 s and never repeated.
6. **Phone test.** The same idea at 390 px, not a degraded desktop; the archetype's mobile line above is the spec.

Write the result into `AWARDS.md ## Direction contract → FIRST VIEWPORT` as an exact composition: what is where, at what scale, where the action sits.

## Verify

- [ ] One archetype, named in the direction contract with its card and the literal move refused.
- [ ] One signature moment in the hero, 1.2–1.5 s, played once; nothing else animates on load.
- [ ] LCP comes from a poster, a still or the DOM; the canvas is lazy and `aria-hidden`; text and images exist in the DOM.
- [ ] Every gesture in the hero (drag, hold, draw, intro click) has a keyboard equivalent and a skip; the static tier shows the settled composition.
- [ ] The mobile behaviour is designed, not degraded: fewer planes or readouts, posters for video, a still for heavy scenes, no orientation prompt.
- [ ] The six first-viewport tests pass, and the naming test was run against the three nearest cards.

## Refuse

- Two archetypes stacked; a hero that needs the paragraph to make sense.
- A blob, a mesh gradient, a particle field or floating primitives as the hero.
- A boot sequence, intro interaction or preloader that gates the content or replays in full on every visit.
- A video hero that autoplays with sound, or loads before its poster.
- A WebGL headline or object with no DOM mirror and no poster.
- Any card's signature as drawn: the identity-line device, the readouts, the coaster, the Polaroid curl, the igloo, the acetate hinge, the division string, the flavour can.
