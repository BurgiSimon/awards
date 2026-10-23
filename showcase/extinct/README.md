# Museum of Extinct Colours — seven colours you can no longer buy

A fictional one-room museum in Antwerp, built end to end with the awards plugin (`plugins/awards`). The page is a paint cross-section under the museum's microscope: seven layers set in a resin block, newest on top, and scrolling moves the microscope's stage down through them, from mummy brown to Egyptian blue, each pigment filling the screen as its own grains beside the reason it ended. At the deepest layer the lights go out and only the Egyptian blue glows, in infrared.

- `npm ci && npm run dev` — the dev server.
- `npm run build` — `dist/`, deployable from any folder (`base: './'`).

Where things live: `src/webgl/field.js` is the one raw WebGL2 shader (the seven grain fields, their wandering boundaries, the infrared view), `src/motion/microscope.js` reads the scroll as a stage position anchored on the plaques and renders only on a dirty frame, `src/data/pigments.js` the layers' depths, colours and grain sizes, `src/ui/` the colours menu and the booking form. The CSS and SVG stills under each plaque are the static tier and the fallback when WebGL2 is missing.

The build contract is `AWARDS.md`, the visual system `DESIGN.md`; jury and ship reports are in `.awards/jury/` and `.awards/ship/`. The museum, its address, its drawer room and its specimen are invented; the pigments' histories are recalled from published sources and labelled as such on the page. No booking is taken.
