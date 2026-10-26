# gl-grade-pass-scene-cuts

Three scenes share one fixed canvas and one scene target, and the cuts between them live in the last pass of the post chain. There is no second scene to composite and no transition library. The cut is a few uniforms in the pass that already grades the frame.

- **Cut 1, a blur dip.** The frame blurs at full resolution, then at half, then at quarter, and ends in a flat colour. The scene swaps under the flat colour, where no seam can show.
- **Cut 2, a frozen-frame iris.** On its first frame the cut renders the outgoing scene into a cache target once. The new scene then opens inside a growing diamond while the frozen still stays outside. A 2D canvas draws the diamond's edge in CSS pixels from the same numbers.
- **The close.** As the footer arrives the frame zooms and a diamond shuts onto the footer's ground colour, leaving a small window of the world over the last words.

## Why
- **One target, any number of worlds.** Scenes render into the same target in turn. The final pass decides what the visitor sees, so a cut costs a few texture reads, not a second scene. This is how `[site:everswap]` cuts between its three worlds and closes onto its footer [verified, `hoisted.D5QinsOB.js`, 2026-10-26].
- **Freeze, don't render twice.** The outgoing scene is rendered into the cache once, so only one scene renders during cut 2. The source copies its last frame; rendering the outgoing scene instead keeps the still right when the visitor jumps straight into the cut (an anchor link, a restored scroll). The still is released when the visitor scrolls back.
- **The edge belongs to the DOM layer.** Drawing the outline on a 2D canvas keeps it a crisp one-pixel line at any device pixel ratio while the GL mask stays soft. It redraws only when the diamond changes.

## Parameters
| | |
|---|---|
| Cut 1 | `dip = fit(top, 1 → .55) × fit(top, .35 → −.15)` of the second chapter's top in viewport heights; full-res 4-tap blur over 0–.333, half-res 9-tap over .25–.667, quarter-res over .667–1, flat colour over .8–1; the scene swaps at top < .45 |
| Cut 2 | `iris = fit(top, .9 → .1)` of the third chapter; diamond half-diagonal `iris × 1.5` viewport heights, centred .06 above the middle; edge alpha up over 0–.15 and down over .8–1 |
| Close | `close = fit(top, .95 → 0)` of the footer, capped at .925; diamond half-diagonal `(1 − close) × 1.5`; zoom `1 + 2 × ((close − .75)/.25)²`, lift .03 |
| Targets | half-float scene, cache, two half-res and two quarter-res blur targets; DPR and pixel budget from the quality tier |

These are this recipe's own values and palette. Everswap's cuts use their own windows, a lavender dip and a dark-green ground; do not take those.

## Tiers
- **Full:** the cuts as above, with the scene clocks running.
- **Reduced motion:** no clock, no blur dip, no growing iris and no zoom. Each cut is a hard switch at its midpoint, and frames render only on scroll and resize.
- **Static or no WebGL:** no canvas. Each chapter carries its scene as a CSS gradient.

## Accessibility
Both canvases are `aria-hidden` and ignore the pointer. All copy is DOM, with one `h1` and an unbroken outline. The visual cuts never hide text.

## Adapters

### Webflow
- Designer: the chapters as Sections with `data-scene="0|1|2"` and the footer with `data-footer`. Two fixed embeds hold `<canvas class="gl" aria-hidden="true">` and `<canvas class="outline" aria-hidden="true">` behind the content (`pointer-events: none`).
- Inject one module from Footer code. It reads the section rects every frame, so Webflow interactions may animate the copy freely but must not change section heights after load.
- Fallback: give each Section its gradient in the Designer and hide it with `html.gl-active` in Head code.

Seen in: `[site:everswap]`.
