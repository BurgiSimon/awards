# autoplay-tabs-progress

A tab set that advances on its own, where the bar under the open tab is the timer: `scaleX` 0 → 1, linear, over the delay, and the set moves on when it fills. It starts only once in view, holds while the pointer is over it or keyboard focus is inside, stops off screen, and restarts from 0 when anyone picks a tab. Where `sticky-stack-cards` steps panels by scroll, this steps them by time.

## Why
- **Show the clock.** Autoplay without a visible timer is a carousel that moves under the reader. One tween owns both the bar and the advance (`onComplete` selects the next tab), so what the bar shows and when the set moves can never drift `[site:wearedirect]` `[site:siteassist]`.
- **Hand over control.** Hover, keyboard focus, a pause button and the page scrolling it away each add a reason to a `holds` set; the tween runs only while the set is empty. A click or arrow key selects the tab and restarts the bar from 0 `[site:911rennsport]`.
- **Only keyboard focus holds.** A mouse click also focuses the button; holding on that would stall the set until the user clicked elsewhere. `focusin` checks `:focus-visible`.
- **Real tabs.** `<button role="tab">` with `aria-selected`, `aria-controls`, roving `tabindex` and arrow / Home / End keys; panels are `role="tabpanel"` and use `hidden`. The sources used `<a href="#">` or `div`s with click handlers `[site:siteassist]` `[site:primesec]`.

## Parameters
Delay `data-delay="5000"` ms (corpus range 4–8 s) · bar `ease: 'none'` (siteassist uses `power1.inOut`; linear reads as a clock) · starts when the set's top passes 75 % of the viewport (`rootMargin: 0 0 -25% 0`) · panel swap `.6 s expo.out`, `y 16 → 0` with a crossfade.

## Motion tiers
- **Full:** autoplay with the bar, pause button shown, panels rise and fade in.
- **Reduced:** no auto-advance, no bar, no pause control (nothing to pause). Panels crossfade in `.3 s` with no movement. All tabs reachable by click and arrow keys.
- **Static:** as reduced, with an instant panel swap. The tier is re-read live through `onMotionTierChange`.

## Accessibility
- WCAG 2.2.2 (Pause, Stop, Hide): content that moves on its own for more than 5 s needs a way to pause it. Hover and focus holds are not enough for a touch or switch user, hence the `aria-pressed` pause button beside the heading.
- Automatic activation (arrow selects) suits short panels with no network fetch; switch to manual activation (arrow moves focus, Enter / Space selects) if a panel loads anything.
- `aria-orientation="vertical"` matches the stacked list; both arrow axes work so the same markup can be laid out in a row.

## Demo content
The window-restoration workshop, its four steps and all copy are synthetic demo text. The coloured plates stand in for images. No media or font files ship.

## Adapters
- **Accordion (wearedirect):** put the bar under each row's heading and open the body in place; the clock logic is unchanged.
- **Scroll-driven (primesec):** drop the timer, map a sticky stage's progress to the index and the bar's `scaleX` to the progress inside the current window; a click jumps the scroll to that tab's window start.
- **React / Vue / Svelte:** create the tween, the listeners and the `IntersectionObserver` in an effect and kill / disconnect them in its cleanup; keep `index` in component state and call `run()` after it changes.

Seen in: `[site:wearedirect]`, `[site:siteassist]`, `[site:911rennsport]`, `[site:primesec]`.
