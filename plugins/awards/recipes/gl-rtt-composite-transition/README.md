# gl-rtt-composite-transition

Each section is a scene rendered into its own target; switching blends the two targets on one fullscreen plane with a soft diagonal wipe and a touch of zoom. The change is a transition, not a cut, and only the two scenes involved are rendered per frame.

## Why
- **Compositing is the transition engine.** Blending finished frames lets any two scenes cross without sharing a scene graph, which is how a section switcher stays seamless `[site:slosh-seltzer]` (`[pattern:preloaders-and-transitions#transition-archetypes]`).
- **Scene windows.** Only the incoming and outgoing scenes render during a switch; at rest, one. Targets are half-float where the tier allows, multisampled on high.
- **One duration, one ease.** `1 s` on the theme ease, shared with any DOM colour swap so the page changes in one beat (`[recipe:theme-swap-tokens]`).
- **Keys and a mirror.** Arrows and Page keys switch; a visually hidden list names the sections for assistive technology; reduced motion swaps instantly.

## Parameters
Duration `1 s` · feather `0.18` · zoom `±8 %` · targets sized to the drawing buffer, `samples: 4` on the high tier.

Seen in: `[site:slosh-seltzer]`, `[site:lando-norris]`.
