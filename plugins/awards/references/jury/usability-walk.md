# Usability walk

Usability is the lowest of the four axes on nineteen of the twenty verified corpus entries (range 7.00–7.90; `[site:white-desert]` is the one exception) [verified, twenty Awwwards entries read 2026-09-18], which makes it the axis where new work can beat the reference set instead of copying it. This walk is a fixed sequence the jury runs against the captures, the DOM and, when a page is reachable, the live page. Each step ends with a pass / fail and a one-line note; the failing steps become fix items and cap the Usability score as noted.

## 1. Keyboard only (caps Usability at 6 if any item fails)
- Tab from the top: a skip link appears first and lands on `<main>`.
- Every interactive element is reachable in a sensible order; focus is visible in the world's own style, never `outline:none` without a replacement.
- The fullscreen menu traps focus while open, closes on Escape, returns focus to the trigger, and the page behind it is `inert`.
- Every pointer gesture has a key path: hold gates accept Enter or Space; drags and compare sliders accept arrow keys; horizontal rails scroll with arrows; hover previews appear on focus.
- A virtual scroll still moves on PageDown, Space and arrow keys, and a chapter rail is focusable.
- The preloader can be skipped with a key on repeat visits.

## 2. Coarse pointer (caps at 7)
- Custom cursor and magnetic effects are off under `(hover: none), (pointer: coarse)`.
- Nothing is hover-only: previews, badges, tooltips and reveals have a tap or focus path.
- Touch targets are at least 44 × 44 px; the eccentric desktop nav (a rotated side index, a hidden rail) has a visible mobile equivalent.
- Horizontal rails become native overflow scrolling; drag surfaces declare `touch-action` and do not swallow page scroll.

## 3. Reduced motion (caps at 6 if absent, 7 if crude)
- Emulate `prefers-reduced-motion: reduce` (the `desktop-rm-s00` capture). The page is fully readable at rest; no line is left translated, masked or at opacity 0.
- State changes survive: the menu still opens, the theme still swaps, the compare slider still compares, only the choreography is shortened.
- Loops (marquee, fluid wake, particles) are static or paused; scrubbed scenes show a chosen frame per chapter.
- No global `animation: none !important` kill that erases useful feedback.

## 4. The load gate (caps at 7)
- First visit: the preloader is tied to a real signal (fonts, assets), holds at 100 briefly and exits; it announces progress through `aria-live`.
- Repeat visit: the whole gate takes at most 2.5 s or is skipped through `sessionStorage`.
- Sound consent may ride the gesture, but content never waits for sound.

## 5. Copy clarity in ten seconds (caps at 7)
From the first viewport alone, answer: what is this, who is it for, what can I do here? If any answer needs a scroll, note which.

## 6. Wayfinding (caps at 7)
- Where am I: the current chapter or route is indicated (rail, index, nav state, title).
- How deep: a progress cue exists on long scrolls, or chapter counts are visible.
- How back: the logo goes home, the browser back button works after a virtual-scroll or SPA transition, and the 404 is authored with a way out.

## 7. Conversion path (caps at 7 for persuade sites)
- One primary action, matched to the stakes (enquire, book a call, join the waitlist, download the spec sheet, buy tickets), reachable from every chapter without hunting.
- The action is not "Get started"; it names the outcome.

## 8. Resilience (caps at 8)
- `--no-webgl` capture: images and text remain (the DOM mirror), the canvas is `aria-hidden`.
- A 320 px viewport has no horizontal overflow; 200 % zoom keeps text readable.
- Long strings (a 40-character name, a three-line headline) do not break the layout.
- A slow network shows a poster or a still, never a blank stage.

## Recording the walk
Write one line per step in the report under Usability's reason column or the fixes list, in this shape: `walk 3 — fail — hero lines stay at opacity 0 under reduced motion (src/main.js:42)`. Fixes from steps 1 and 3 come first in the ordered list because they are cheap and they are where the corpus lost its points.
