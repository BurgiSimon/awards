# C/S Petrel — the ship that mends the internet

A fictional cable repair ship's page built end to end with the awards plugin (`plugins/awards`). When the fibre in Gannet-1 goes dark 4,212 metres down in the North Atlantic, the page is the repair: scrolling pays the cable out over the bow sheave, lowers the grapnel through the depth bands, drags it across the seabed to the catch, lifts both ends and opens the cable on deck for the splice, with the depth, the wire out and the line tension printed in the bridge line the whole way.

- `npm ci && npm run dev` — the dev server.
- `npm run build` — `dist/`, deployable from any folder (`base: './'`).

Where things live: `src/motion/score.js` is the motion score as code (one master timeline, a label per chapter, set from a single scroll map), `src/motion/cable.js` places the cable, the grapnel, the drag and the cut cable from the document's own geometry and writes the readouts, `src/webgl/scene.js` is the Three scene (a procedural armoured cable, grapnel and cutaway, no model files), `src/ui/` the bridge line, the chapter menu, the crossing time and the fault desk. The drawn cable, seabed and cutaway in `index.html` and `src/styles/page.css` are the static tier and the fallback when WebGL2 is missing.

The build contract is `AWARDS.md`, the visual system `DESIGN.md`; jury and ship reports are in `.awards/jury/` and `.awards/ship/`. The Petrel, her crew, Gannet-1 and this fault are invented; the method and the physics are real and the figures rounded. The fault desk sends nothing.
