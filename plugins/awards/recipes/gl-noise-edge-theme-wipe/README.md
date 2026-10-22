# gl-noise-edge-theme-wipe

A theme change that happens under a cover. Pressing the toggle shows a fixed, full-screen orthographic quad that grows the next theme's ground from the press point, its rim roughened by hash noise. When the cover has passed the farthest corner, the page's tokens flip underneath it; the cover then fades and is hidden again. The choice lasts for the visit through `sessionStorage`. Where `[recipe:theme-swap-tokens]` tweens tokens by scroll and `[recipe:persistent-mode-switch]` swaps them from a visitor-held control, this recipe hides the swap itself behind one shader pass.

## Why
- **The swap is the one frame that flickers.** Tokens on `<html>` change in one style recalc, but every surface that reads them (a canvas, an image filter, a `color-mix`) repaints on its own schedule. A cover that is complete when the attribute changes hides all of it. Visitor-chosen grounds swapped by a liquid WebGL wipe, stored per session, with an ortho quad driven by `uProgress`, `uCenter`, `uColor` and a hash-noise edge `[site:bleibtgleich]`.
- **Exact ends.** The radius runs from `−edge` to the farthest corner `+ edge`, and the noise moves the rim by at most half the edge, so `uProgress 0` covers nothing and `1` covers every pixel. The flip is tied to the tween's `onComplete`, not to a threshold that might fall short (`[pattern:webgl-shaders#noise-and-field-toolbox]`).
- **From where the visitor pressed.** The press point makes the change feel caused. A key press has no point, so it starts from the button's centre.
- **Hidden when idle.** Between swaps the canvas is `display: none` and draws nothing; the shader is compiled at idle after load, so the first press does not stall, and never under reduced motion.
- **Turn around, do not undo.** A second press during the cover reverses the same tween; nothing has flipped yet, so the edge shrinks back to its origin and there is nothing to restore.

## Parameters
Cover `.9 s power2.inOut` · reveal `.3 s power1.out` (opacity) · edge band `56 px` (× DPR), value noise at `edge × 1.6` and `edge × .45` (weights `.7` / `.3`), drifting with tween time · `1 px` smoothstep anti-aliasing · DPR `≤ 2` · `NoBlending`, premultiplied output · storage key `wipe:theme` (`default` | `dark`).

## Uniforms
`uProgress` (0–1) · `uCenter` (drawing-buffer px, origin bottom-left) · `uColor` (the target `--ground`, set through `Color.setStyle`, so sRGB in, linear in the shader, sRGB out through `colorspace_fragment`) · `uResolution`, `uEdge`, `uTime`, `uSeed`.

## Motion tiers
- **Full:** the cover grows, the tokens flip under it, the cover fades.
- **Reduced:** an instant swap. No WebGL context is created and no canvas frame is drawn (`[pattern:accessibility-and-reduced-motion#reduced-motion-tiers]`: theme swap instant).
- **Static:** as reduced.
Without WebGL (or with `?gl=0`), the same proxy drives a CSS `clip-path: circle()` cover in the target ground, without the noise.

## Accessibility
- The toggle is a `<button>` with `aria-pressed` (pressed = dark ground) and a visible filled dot; it changes the moment it is pressed, even though the paint follows the cover.
- The cover is `aria-hidden` and `pointer-events: none`, so a second press reaches the button through it, and focus never moves.
- Contrast holds in both themes (`tokens.css` pairs); the focus ring is the accent on either ground.
- Restore before paint: a classic inline script in `<head>` sets `data-theme` from storage, so a reload neither flashes the default nor wipes into the stored ground.

## Adapters
- **React / Next:** keep the head script as an inline `<script>` in the root layout (with `suppressHydrationWarning` on `<html>`); create the renderer lazily in an effect, keep the tween in a ref and dispose on unmount.
- **Vue / Nuxt:** a client-only component owns the canvas; the head script goes through `useHead` with `tagPriority: 'critical'`.
- **Svelte / SvelteKit:** the restore script in `app.html`; the cover in a component created in `onMount`.
- **Astro:** an `is:inline` head script and a `client:idle` island for the cover.
- **An existing three.js canvas:** do not add a second context; draw the quad last in the scene's own renderer with depth test off.

## Verify
`cover` presses the toggle, holds the wipe at `uProgress .5` and reads the quad's own pixels: the press point is the new ground at full alpha, the far corner is uncovered, so it shows the old page, and the tokens have not flipped; at `1` all four corners are covered and the tokens still wait. `done` checks `data-theme`, the hidden canvas, the body ground against the dark token, `theme-color`, `aria-pressed` and storage. `reverse` presses twice mid-cover and must end with nothing flipped. `keyboard` checks the button-centre origin. `reload` checks the restore with no wipe. `reduced` checks the instant swap with no canvas frame and no context. `nogl` checks the CSS cover. Moving the flip from `onComplete` to the start of the tween fails `cover`.

## Synthetic content
The headline, rules and paragraphs are synthetic demo text. The two grounds are the shared demo tokens. No media or font files ship.

Seen in: `[site:bleibtgleich]`.
