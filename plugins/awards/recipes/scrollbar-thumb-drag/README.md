# scrollbar-thumb-drag

A themed scrollbar thumb drawn on the right edge that mirrors scroll progress and can be dragged, while the document keeps scrolling natively and the browser's own scrollbar stays. The source hides its native bar (`scrollbar-width: none`) and leaves a thumb only a pointer can use; this recipe keeps both.

## Why
- **Mirror, don't own.** The thumb reads `scrollY / (scrollHeight − innerHeight)` on the shared ticker and moves by transform. Whatever moved the page (wheel, Page Down, Home / End, an anchor, find-in-page, a screen reader) moves the thumb, because the scroll position never lives anywhere else.
- **Drag writes the scroll.** Pointer down captures the pointer; each move maps the thumb's offset over its free travel (`track − thumb` height) to a scroll position, through `lenis.scrollTo(y, { immediate: true })` when Lenis runs and `window.scrollTo` otherwise. Pressing the track centres the thumb on the pointer and keeps dragging from there.
- **One clock.** Lenis 1.3 defaults to `autoRaf: false`; `lenis.raf(t)` and the thumb update share `_shared/raf.js`'s ticker, so the thumb reads a scroll position Lenis wrote that same frame.
- **Proportional thumb.** Height `max(48 px, track × innerHeight / scrollHeight)`, re-measured by a `ResizeObserver` on `<body>` and on `resize`.

## Parameters
Thumb follow damping `14` (full tier only) · minimum thumb `48 px` · hit area `20 px` wide holding a `3 px` line scaled (`scale`, not `width`) to `7 px` on hover and drag · track inset `16 px` top / bottom, `12 px` from the right · Lenis `lerp: 0.1`.

## Motion tiers
- **Full:** Lenis smooth scroll; the thumb eases towards native jumps (keys, anchors) with framerate-independent `damp()`; during a drag it sits exactly under the pointer.
- **Reduced:** no Lenis, native scrolling; the thumb sits exactly on the scroll position every frame, no easing. The line-width change on hover keeps its short transition (a state change, not movement).
- **Static:** same as reduced. The tier for Lenis is read once at load; the thumb's easing follows `data-motion` live.

## Accessibility
- The native scrollbar is kept (base.css themes it with `scrollbar-color` and `scrollbar-width: thin`) and nothing intercepts keys, so keyboard, switch and assistive-tech scrolling are untouched.
- The drawn track is `aria-hidden="true"` and holds nothing focusable. It is a pointer duplicate of a control that already exists; a second `role="scrollbar"` would need its own focus stop, `aria-controls`, `aria-valuenow` and key handling, and would announce two scrollbars for one scroller. Give it that role only if the native bar is ever hidden, which this recipe argues against.
- Hidden under `(hover: none), (pointer: coarse)`: on touch the platform's overlay bar is easier to hit than a drawn line.

## Demo content
The heading, lede and chapter copy are synthetic demo text. No media or font files ship.

## Adapters
- **No Lenis:** delete the Lenis lines; `scrollToFraction` falls back to `window.scrollTo`. Keep `scroll-behavior` off on `<html>` or drags will lag behind the pointer.
- **Inner scroller:** read `el.scrollTop / (el.scrollHeight − el.clientHeight)` and write `el.scrollTop`; position the track inside the scroller's wrapper.
- **React / Vue / Svelte:** mount the listeners, ticker subscription and `ResizeObserver` in an effect and remove all three in its cleanup.

Seen in: `[site:wodniack]`.
