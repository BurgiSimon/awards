# Recipe proposals — wave 3, 2026-09-23

Candidates from wave 3's `### Techniques and stacks` (28 added cards) and the synthesis edits, for techniques no recipe in `plugins/awards/recipes/` covers. Rank follows how many added sites show the technique, then how many skills would cite it (motion, component, structure, webgl). Ranks 1–16 go to the maintainer gate; the single-site candidates after them stay here unselected. Not proposed, because an existing recipe covers them: goats' counter-translated rail (`horizontal-rail`), bethebuzz's scroll-drawn follower (`scroll-drawn-svg-path`), wearedirect's colour-wave glyph entry (`flicker-text`), pensatori-irrazionali's scored tier probe (`quality-tiers`), goats' scrubbed footer video (`image-sequence-scrub`).

## 1. `autoplay-tabs-progress` — Auto-advancing tabs with a visible clock
- Seen in: wearedirect, siteassist, 911rennsport, primesec
- Tier: P1 · Deps: gsap 3.15.0 (pinned)
- Overlap: `sticky-stack-cards` steps panels by scroll; this advances a tab set or accordion on a timer whose progress bar is the clock (`scaleX` 0→1 linear), pauses on hover and focus, restarts on click, and starts only once in view. The primesec variant drives the same tabs from scroll progress with a click jump.
- Verify idea: after the delay the active tab index increments and the bar's `scaleX` restarts from 0; hovering holds the index past the delay; a click resets the timer. Reduced motion: no auto-advance, all tabs reachable with arrow keys.

## 2. `scroll-word-fill` — Words fill in one by one on a scrubbed scroll
- Seen in: goats, mensch, primesec
- Tier: P1 · Deps: gsap 3.15.0 (ScrollTrigger, SplitText)
- Overlap: `split-text-masked-reveal` plays a timed entrance; this ties each word's opacity or colour (goats .15→1, mensch grey→ink with a `progress × (N + k) − i` window) or a two-layer clip fill (primesec) to scroll progress across a sticky stage, so the text reads as it is scrolled.
- Verify idea: at 25 % and 75 % of the section the count of words at full opacity rises monotonically and is strictly between 0 and N at 50 %. Reduced motion: every word at full opacity from the start.

## 3. `word-cycle-hero` — Hero word cycle: slot roll, type-and-erase, wheel-stepped
- Seen in: zainabkabira, mensch, christoph-nagel
- Tier: P1 · Deps: gsap 3.15.0
- Overlap: `scramble-decode-text` decodes one string; this rotates one slot in a fixed headline through a word list with three drivers (timed slot roll with spring overshoot, typed and erased per character, stepped by the first wheel inputs before the page moves), the slot width held so the line never reflows, the live word exposed once through an `aria-live="off"` label.
- Verify idea: the slot word changes across two samples 1 s apart in the timed variant; in the wheel variant two wheel inputs change the word while `scrollY` stays 0; the line's width is unchanged between words. Reduced motion: the first word, static.

## 4. `section-switcher-wheel-commit` — Section switcher with a wheel commit ring
- Seen in: nodeck, areebali, christoph-nagel
- Tier: P1 · Deps: gsap 3.15.0 (Observer)
- Overlap: `gl-rtt-composite-transition` switches sections in WebGL; this is a DOM deck where the document never scrolls: wheel delta accumulates into a visible ring that commits at a threshold and rolls back after idle, with a lock between steps, swipe, arrow and Page keys, prev/next buttons and a live-region announcement per panel.
- Verify idea: wheel inputs below the threshold leave the panel index unchanged and fill the ring partly; crossing it increments the index once; after the idle window the ring returns to 0. Reduced motion: panels change instantly; keyboard reaches every panel.

## 5. `persistent-mode-switch` — A persistent mode switch that re-skins the page
- Seen in: alectear, grids-obys, haoqi
- Tier: P1 · Deps: gsap 3.15.0
- Overlap: `theme-swap-tokens` swaps tokens by scroll; this is a user-held control (segmented switch, grid overlay toggle, single-key hotkeys guarded against inputs and modifiers) whose state is stored, shown in its label and survives reloads, with the alectear close where the docked switch cross-scales into a large centred copy.
- Verify idea: toggling sets a root attribute and `localStorage`; a reload restores it; pressing the hotkey inside an input does nothing. Reduced motion: the switch changes state with no tween.

## 6. `gl-orbit-model-hotspots` — Explorable model with a clamped orbit and hotspots
- Seen in: likova, gehry-getty
- Tier: P1 · Deps: three 0.186.0; camera damping hand-written (camera-controls would be a new pin)
- Overlap: `gl-hero-object-inertia` turns one object on scroll and pointer; this hands the camera to the visitor inside a modal, clamps polar angle and distance, damps with `1 − k^dt`, flies to named hotspots whose labels are real buttons in the DOM, and gives a keyboard path.
- Verify idea: dragging changes the camera azimuth while the polar angle stays inside its clamp; activating a hotspot button moves the camera target to that hotspot within tolerance. Reduced motion: fly-tos are instant; static: a poster with the hotspot list.

## 7. `sentence-form-enquiry` — An enquiry form written as a sentence
- Seen in: the-boyd, alectear
- Tier: P0 · Deps: none
- Overlap: no form recipe exists; this sets the fields inside running prose where each fragment is the `<label>` of its input or radio group, with real validation, error text tied by `aria-describedby`, and a stacked layout on the phone.
- Verify idea: every input has an accessible name drawn from its prose fragment; submitting empty focuses the first invalid field and shows its error; at 390 px no line overflows. Reduced motion: unchanged (no motion).

## 8. `knockout-wordmark-window` — A wordmark that is a window onto the layer behind
- Seen in: bethebuzz, noth
- Tier: P1 · Deps: none for the SVG mask; three 0.186.0 only for the GL ground variant
- Overlap: `title-mask-tunnel` scales a mask into a tunnel; this cuts the letters out of an SVG mask (`<mask>` with the glyph paths subtracted) so a fixed video or canvas shows only through the wordmark, with a text alternative on the heading.
- Verify idea: a pixel sampled inside a letter's bounds differs from one sampled on the solid band, and both change when the ground layer moves. Reduced motion: the ground is a still frame.

## 9. `docked-media-grow` — Docked media that grows into its section
- Seen in: wearedirect, noth
- Tier: P1 · Deps: gsap 3.15.0 (ScrollTrigger)
- Overlap: `scroll-pin-scrub` pins a stage; this starts a reel as a small fixed card docked in a corner and scrubs its box to viewport minus gutter as the section arrives (transform-based, not width/height), then hands it to the section's flow; noth's reverse is the showreel shrinking into a frame.
- Verify idea: at section start the card's rect is under 30 % of the viewport width and at the end within the gutter of full; the tween touches only transform. Reduced motion: the reel sits full-size in its section with no dock.

## 10. `preloader-aperture-handoff` — Preloader that opens into the hero
- Seen in: goats, areebali
- Tier: P1 · Deps: gsap 3.15.0
- Overlap: `preloader-counter-hold` holds a counter on a real load signal; this adds the hand-off: the curtain lifts while the hero opens from a rounded `clip-path: inset()` aperture and its media scales in, or the intro film is sized to the live element's rect and cut onto it, with a repeat-visit skip.
- Verify idea: mid-handoff the hero's clip inset is between its start and 0; after, it is 0 and scroll is unlocked; a second load in the same session skips straight to the open hero. Reduced motion: a fade only.

## 11. `gl-endless-reel-sheets` — Endless reel of deformable GL sheets
- Seen in: jesperlandberg, siena
- Tier: P2 · Deps: three 0.186.0 (or ogl 1.0.11), gsap 3.15.0
- Overlap: `gl-dom-tethered-planes` bulges planes with velocity on a native scroll; this is a modulo-wrapped virtual reel of segmented planes that twist and wave in transit (a named uniform peaking at `sin(π·p)`), steered by a wheel-burst detector, keys and snap, with an sr-only list of the works.
- Verify idea: after scrolling past the last item the first reappears (wrap); during motion the sampled vertex bend uniform is non-zero, at rest it returns to 0. Reduced motion: flat planes and a snapped step per input.

## 12. `pointer-tilt-shine` — Cards that tilt toward the pointer with a moving shine
- Seen in: okaydev, areebali
- Tier: P1 · Deps: gsap 3.15.0 (quickTo)
- Overlap: `magnetic-button` translates toward the pointer; this rotates a card in X and Y with shine and shade layers tracking the pointer, locked while the page scrolls, mouse pointers only.
- Verify idea: a pointer at the card's top-left gives negative rotateX and rotateY of the expected sign and moves the shine's position; during a scroll the rotation holds. Reduced motion: flat card, no layers.

## 13. `blur-peek-snap-carousel` — Centred carousel with blur-peek neighbours and velocity-graded snap
- Seen in: robbietilton, zainabkabira
- Tier: P1 · Deps: gsap 3.15.0 (Draggable, InertiaPlugin ship with it)
- Overlap: `horizontal-rail` scrubs a rail by vertical scroll; this is a snapping carousel where neighbours blur and dim, spacing comes from a fixed peek fraction, release velocity picks the snap duration and curve, and overscroll resists with a rubber band and a critically damped return (robbietilton); zainabkabira's coverflow ring is the 3D variant.
- Verify idea: a fast drag release snaps in less time than a slow one; the centred item has blur 0 and its neighbours a blur above 0; arrow keys step one item. Reduced motion: no blur transition, instant snap.

## 14. `idle-settle-snap` — Settle-snap once the scroll goes quiet
- Seen in: mensch, goats
- Tier: P2 · Deps: lenis 1.3.26
- Overlap: `gl-virtual-scroll-camera` snaps a virtual scroll; this watches a smoothed native scroll and, after a quiet window, eases to the nearer end of one boundary (for example the first viewport), held while a pointer or touch is down, re-armed after a guard, off on coarse pointers and under reduced motion.
- Verify idea: stop scrolling at 40 % of the first viewport and after the quiet window `scrollY` reaches 0; at 60 % it reaches one viewport; with the pointer held it stays. Reduced motion: no snap.

## 15. `video-clip-wipe-panels` — Panels that change by a clip-path wipe between two videos
- Seen in: christoph-nagel, serotoninn
- Tier: P1 · Deps: gsap 3.15.0
- Overlap: `gl-rtt-composite-transition` composites in WebGL; this double-buffers two `<video>` (or image) layers and wipes the incoming one in with a directional `clip-path: inset()` and a glowing seam, or an opposed-origin `scaleY` pair over a greyscale twin (serotoninn), preloading the next source before the wipe.
- Verify idea: mid-wipe the incoming layer's inset is between 100 % and 0 and the seam's left tracks it; after, only one layer is visible and the other has the next source loaded. Reduced motion: a crossfade of .2 s.

## 16. `gl-fps-governor-idle-gate` — Frame-rate DPR governor and an idle render gate
- Seen in: primesec, pensatori-irrazionali
- Tier: P1 · Deps: three 0.186.0
- Overlap: `quality-tiers` probes the device once; this keeps adjusting at runtime (sample every .5 s, step DPR down below a floor fps and up above a ceiling, within a clamp) and stops rendering a set time after the last scroll or pointer input unless a transition runs, also on hidden tabs.
- Verify idea: with a throttled frame rate the renderer's pixel ratio drops by a step; after the idle window the render counter stops increasing, and a pointer move restarts it. Reduced motion: unchanged; static: one frame.

## Single-site candidates (not sent to the gate)

- `pointer-repel-field` — pointer pushes, rotates and scales items by falloff, elastic return — noth
- `canvas-source-in-media-mask` — a turning 3D silhouette clips a video via canvas `source-in` — warmnfuzzy
- `prism-flip-label` — nav cells turn a clone face into view as a 3D prism — warmnfuzzy
- `homography-screen-warp` — a screen recording warped into a device photo by `matrix3d` — zainabkabira
- `layered-plane-parallax` — six DOM cut-out planes scrubbed at different rates — to-top
- `gl-erosion-dissolve` — noise-feathered dissolve of a glTF mesh on scroll — primesec
- `pixel-cell-wipe` — one DOM cell grid reused for loader, menu and section wipes — runrobrun
- `music-reactive-analyser` — AnalyserNode bands and onsets drive a mesh — runrobrun
- `character-splay-3d` — per-character 3D splay scaled by distance from centre — the-boyd
- `paper-crumple-exit` — html2canvas snapshot crumpled on a GL plane — nodeck (html2canvas would be a new pin)
- `runaway-cta` — a button that dodges the cursor — nodeck
- `scroll-curl-screens` — screens curl back in rotationX with damped scroll — okaydev
- `stepped-zero-duration-reveals` — shuffled opacity flips with no easing — spasoje
- `intent-scrubbed-lottie` — a Lottie parked, finished and returned by hover — serotoninn (lottie-web would be a new pin)
- `gl-baked-frame-trail` — a pointer trail selects between baked frames in a KTX2 array — pensatori-irrazionali
- `gl-cloth-ground` — a noise-folded cloth plane as a fixed page ground — bethebuzz
- `pointer-coordinate-readout` — pointer mapped onto a lat/lon readout in the chrome — siteassist, haoqi (two sites, cheap; folded out of the gate as it needs no recipe beyond a few lines)
