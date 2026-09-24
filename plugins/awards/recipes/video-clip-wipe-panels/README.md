# video-clip-wipe-panels

A deck of full-bleed media panels that change by a wipe. Two media layers are double-buffered: the hidden one already holds the next panel's clip, and on a change it opens over the visible one from a directional `clip-path: inset()` while a 1 px glowing seam rides the edge on the same tween. `gl-rtt-composite-transition` blends two WebGL render targets in a shader; this does the same job with two DOM media layers and no GL `[recipe:gl-rtt-composite-transition]`. Navigation is the stepped-wheel variant of `[recipe:section-switcher-wheel-commit]`.

## Why
- **Let the medium carry the cut.** When the backgrounds are footage, the transition can be an edit a video editor would sign. A thin light seam on a clip wipe reads as a film gate or a scanner bar, costs one element and needs no WebGL `[site:christoph-nagel]`.
- **Two buffers, never more.** One `<video>` plays and one waits hidden with the next source loaded, so a wipe never waits on the network. After each change the buffers swap roles and the newly hidden one is parked and loaded with the next clip `[site:christoph-nagel]`.
- **One clock for clip and seam.** A single plain-object tween (`p 0 → 1`) writes both the inset and the seam's transform, so the light cannot drift from the edge. GSAP does not round plain-object values, which keeps sub-pixel motion. Tweening CSS `px` values directly would need `autoRound: false`.
- **Copy leaves before the gate opens.** Outgoing copy exits on `power2.in` first, the wipe starts `.12 s` later, and incoming copy rises on `power3.out` over the wipe's last third `[site:christoph-nagel]`.
- **An alternative edge.** Serotoninn cycles its hero with an opposed-origin `scaleY` pair over a greyscale twin: the outgoing layer collapses from the top while the incoming one grows from the bottom `[site:serotoninn]`. It is listed as a variant, and the buffer logic here carries over unchanged.

## Parameters
Wipe `1.0 s expo.inOut` from `.12 s`: forward `inset(0 100% 0 0) → inset(0 0 0 0)` (left to right), backwards `inset(0 0 0 100%) → 0` (right to left) · seam 1 px white at opacity `.76`, glow `0 0 32px 7px`, fades over `.2 s` from `1.0 s` · outgoing copy `y −24, opacity 0`, `.34 s power2.in`, stagger `.025` · incoming copy `y 42 → 0`, `.72 s power3.out`, stagger `.065`, from `.66 s` `[site:christoph-nagel]` · reduced motion: `.2 s` linear cross-fade.

Navigation: stepped wheel (`|deltaY| ≥ 18`, one step, then locked while the change runs and for at least `1 s`, plus `300 ms` after it settles for trackpad inertia) · swipe `> 55 px` · `↓ → PageDown` next, `↑ ← PageUp` previous, `Home` / `End`, `Space` / `Shift+Space` only when the page itself has focus · prev / next buttons. A new request during a wipe completes the running one first.

## Swap in `<video>`
The demo ships no video files: the two layers are canvases that play synthetic clips. Replace them with videos:

```html
<video class="media" data-layer="a" muted playsinline loop preload="auto" poster="/clips/01.jpg" src="/clips/01.mp4"></video>
<video class="media" data-layer="b" muted playsinline loop preload="none"></video>
```

Give each panel `data-src` and `data-poster` in place of `data-clip`, then replace the canvas parts of `main.js`:

```js
// load(): point the hidden buffer at a source and let it buffer. Resolves when a frame can paint.
function load(layer, src, poster) {
  if (layer.src === src) return Promise.resolve(false);
  layer.src = src;
  layer.el.poster = poster;
  layer.el.preload = 'auto';
  layer.el.src = src;
  layer.el.load();
  return new Promise((resolve) => {
    const done = () => resolve(true);
    layer.el.addEventListener('loadeddata', done, { once: true });
    setTimeout(done, 1200);   // ceiling: wipe to the poster rather than stall the gesture
  });
}
// goTo(): if the preload missed, `await load(inc, …)` before building the timeline; then `inc.el.play()` (full tier only).
// settle(): `out.el.pause()` before loading the next source into it.
```

Drop the ticker loop: a `<video>` advances on its own. Under reduced motion, skip `play()` so clips rest on their posters. Keep `muted playsinline`, or mobile browsers will not autoplay.

## Motion tiers
- **Full:** clips play and the wipe runs with the seam.
- **Reduced:** clips rest on their first frame (a `<video>` stays paused on its poster). Panels cross-fade in `.2 s` with no clip and no seam, and the copy swaps in place.
- **Static:** clips rest and panels swap instantly.

## Accessibility
- Without JS the panels are ordinary sections on a scrolling page and the media stage is not shown. `main.js` adds `html.deck`, which stops the document scrolling and reveals the controls.
- The media stage is `aria-hidden`: the clips are atmosphere, and each panel's copy carries the content. Real footage that carries content needs its own text alternative in the panel.
- Inactive panels are `inert`. A polite live region announces "Panel n of 4: title" on each change, not on load. The visible counter is `aria-hidden`.
- Prev / Next use `aria-disabled` at the ends, so focus stays on the key.
- A shade under the copy (a left-to-right gradient plus a bottom one) keeps the text readable over any clip.

## Capture hook
`__awards.scrollTo(p)` is routed to panel `round(p × 3)` with no wipe, so `capture.mjs` and the jury get one deterministic panel per position. `__awards.state()` reports `index`, `front` (which buffer paints), `wipe` progress, `transitioning`, each layer's `src` and playback `frames`, and preload `hits` / `misses`.

## When not to use it
- Long copy per panel: the deck swallows the wheel. Use sticky stages over a native document (`[recipe:sticky-stages-rails]`).
- More than a handful of heavy clips on a phone data plan: every change fetches a clip. Serve poster-only panels when `navigator.connection?.saveData` is set.
- An edge that has to be shaped by a texture or a fluid: composite in WebGL (`[recipe:gl-rtt-composite-transition]`).

## Demo content
The four panels, their copy and the four "clips" are synthetic: each clip is a canvas drawing a graded gradient with drifting light bands and a `SYNTHETIC CLIP nn` label. No video, image or font files ship.

## Adapters
- **Lenis:** not needed; the document never scrolls. If the deck sits inside a Lenis page, `lenis.stop()` while it owns the viewport.
- **React / Vue / Svelte:** keep both `<video>` refs and the buffer bookkeeping (`front`, `src`) in refs, not state, so a change does not re-render mid-wipe. Build the timeline and Observers in one effect (`useGSAP` in React) and `kill()` them in the cleanup.

Seen in: `[site:christoph-nagel]`, `[site:serotoninn]`.
