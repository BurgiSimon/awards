# pointer-tilt-shine

A field of cards that turn toward a mouse pointer. The corner under the pointer sinks, a shine follows the pointer across the face and a shade gathers on the raised side. Scrolling locks every card in place until the page settles. Where `[recipe:magnetic-button]` moves a target toward the pointer, this recipe rotates the card in place and moves light across it.

## Why
- **The face turns toward the pointer.** The pointer's offset from the centre, normalised to `−1…1`, maps to `rotateY = 7° × nx` and `rotateX = −7° × ny`. At the top-left the angles are `rotateX > 0` and `rotateY < 0`, and the top-left corner recedes. The same pressed-toward-the-pointer convention as the wheel tilt in `[site:areebali]`.
- **Measure the link, rotate the face.** The `<a>` never transforms and carries the `perspective`. Only the inner face rotates, so the hit box and the measured rect do not shift under the tilt.
- **Light moves with the tilt.** The shine and shade layers are twice the face, centred, and moved by `translate` only. A shift of half the face puts the shine's hot spot under the pointer and the shade opposite it. The shade's opacity scales with the tilt's size `[site:okaydev]`.
- **`quickTo`, not a tween per event.** One live tween per property is retargeted on each `pointermove`. The tweens start paused and write nothing until the first aim, so a card that is never armed keeps no inline transform (`[pattern:cursor-and-pointer]`).
- **Lock while scrolling.** When the page scrolls, a card slides under a pointer that has not moved. That is not the visitor aiming. Any scroll locks the field and holds every card where it is. The first pointer move after a `140 ms` quiet period unlocks it and is handled as a normal move `[site:okaydev]`. `pointerleave` is ignored while locked too.
- **Mouse pointers only.** The listeners are attached only under `(hover: hover) and (pointer: fine)` and the full motion tier, and each event must be `pointerType === 'mouse'`. Touch, pen and keyboard get the flat card.

## Parameters
Max tilt `7°` per axis · `perspective: 800px` on the link · `quickTo` `.6 s` `power3.out` for rotation and layers · shine white `.32` alpha in `screen` blend, hot spot to `30 %` · shade black `.5` alpha in `multiply`, opacity `0.6 × min(1, |n|)` · scroll-end quiet period `140 ms`.

## Motion tiers
- **Full:** the tilt, the shine and the shade as above.
- **Reduced:** flat cards and no layers. The listeners are never attached, and the shine and shade are `display: none`.
- **Static** (`data-motion="static"`): the same as reduced.
- **Live change:** if the pointer type or the motion preference changes, the listeners are removed and every card is snapped flat.

## Accessibility
Each card is a real link with a text name (its title) and a `:focus-visible` outline offset clear of the face. The tilt adds no information: the index, title and meta are always visible, so keyboard and touch visitors lose nothing. The shine and shade are `aria-hidden` and `pointer-events: none`.

## Demo content
The three works ("Tidewater", "Low Orbit", "Paper Kiln") and their faces are synthetic demo content. The faces are CSS gradients, so the recipe ships no image or font files. All type uses system font stacks.

## Adapters
- **Single control (areebali):** cap the tilt at `±5°` with `perspective(620px)`, add a `.985` press scale on `pointerdown`, and use two durations: a fast follow (`.12 s`) while hovered and a slow settle (`.5 s` `cubic-bezier(.2,.8,.2,1)`) on leave.
- **Credit reveal (okaydev):** add a caption that scales from `.94` and fades in with the tilt. Show it on `:focus-visible` as well, so the keyboard gets it too.
- **With Lenis:** listen to `lenis.on('scroll', onScroll)` instead of the window `scroll` event, and drive `lenis.raf` from the GSAP ticker as in `[recipe:boot-lenis-gsap]`.
- **React / Vue / Svelte:** create the `quickTo`s in `useGSAP` / `gsap.context()` so they revert on unmount, and remove the window listeners in the cleanup.

Seen in: `[site:okaydev]`, `[site:areebali]`.
