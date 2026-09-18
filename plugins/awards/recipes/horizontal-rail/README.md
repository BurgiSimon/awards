# horizontal-rail

A sticky stage whose track moves sideways as the page scrolls: the rail's height is the track's overflow plus one viewport, so vertical travel equals horizontal travel and the scrollbar stays honest. Focus the rail and the arrow keys step a panel at a time. On touch, or under reduced motion, the rail is a native horizontal scroller with snap points and no pin.

## Why
- **Honest scroll distance.** Sizing the rail to the overflow means the browser's scroll position addresses every panel; nothing is hijacked `[site:son-daven]` (`[pattern:motion-vocabulary#scroll-philosophies]`).
- **Touch wants native.** A scrubbed transform on a phone fights inertia and the browser's own gestures; `overflow-x: auto` with `scroll-snap` is what visitors expect (`[pattern:responsive-strategy#coarse-pointer-swaps]`).
- **Keyboard path.** The rail is focusable with a visible ring; arrows scroll the page (or the native scroller) by one panel.

## Parameters
`scrub: 0.3` · rail height `innerHeight + overflow` · panel `min(70vw, 720px)` · key step = one panel + gap.

Seen in: `[site:son-daven]`, `[site:floema]` (as a drag rail).
