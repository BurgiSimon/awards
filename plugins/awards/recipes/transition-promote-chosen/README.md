# transition-promote-chosen

A route exit that promotes what was chosen. Click a row: it rises into the slot under the fixed bar, the other rows fade and drop in order of their distance from it, and the route is pushed only after the rise. The next page puts its heading in that same slot, so the exit works as the first frame of the arrival. The demo has an index page and a case page, both on one module under taxi.

The six projects, their positioning lines and the case page copy are synthetic demonstration content.

## Why
- **The exit explains the navigation.** A full-view wipe (`[recipe:page-transitions]`) hides the change. Promoting the chosen item shows what was picked and where it goes before the next page arrives.
- **Distance stagger.** Each sibling starts at `stagger × |i − chosen|`, so the rows dissolve outward from the one that was clicked. Rows outside the viewport are hidden at once so the timing never runs for rows nobody can see.
- **The push waits for the rise.** taxi calls `history.pushState` right after the transition's `onLeave` calls `done()`, so a `tl.call(done, null, push)` at the end of the timeline is the whole schedule.
- **The slot comes from CSS.** Every view has `padding-top: bar + gap`, and the exit reads that value from the leaving view to aim the rise. Change the bar and both pages follow.

## Parameters
| | desktop | phone (`max-width: 48rem`) |
|---|---|---|
| rise (chosen row, `power2.inOut`) | 1.15 s | 0.8 s |
| push (route change; the chosen row fades between rise and push) | 1.6 s | 1.15 s |
| sibling stagger per step of distance | .09 s | .06 s |
| sibling exit (`opacity 0, y 18`, `power2.in`) | .65 s | .65 s |
| intro block fade | .45 s | .45 s |

The next view fades in over `.45 s`. The back link and history navigation have no chosen row and use a plain `.45 s` fade.

## Accessibility
- One real link per project, so the Tab path has six stops.
- taxi ignores modified clicks (Ctrl and Cmd), so opening a project in a new tab still works.
- Focus moves to the new page's heading after navigation, and the document title names the project.
- Under reduced motion and the static tier the route changes at once with no tween.
- `allowInterruption: false` ignores a second click during the exit.

## Adapters
- **View Transitions (MPA, Astro):** give the chosen row and the case heading the same `view-transition-name` just before navigating, set the sibling stagger through `animation-delay` from the distance, and drop taxi.
- **Next / Nuxt:** run the same timeline in the link's click handler, call `router.push` in `tl.call`, and skip the timeline under `prefers-reduced-motion`.

Seen in: `[site:boc]`.
