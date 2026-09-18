# hover-preview-list

An archive list whose preview chases the pointer (lerp `.25`, framerate-independent) and, on keyboard focus, anchors beside the focused row. Rows carry the metadata quartet as texture.

## Why
- **The list is the archive.** Rows named with discipline, year and team read as a boast without adjectives `[site:leo-parpeix]` (`[pattern:components-catalog]`).
- **Never hover-only.** Focus shows the same preview, anchored, so keyboard users get the affordance; coarse pointers get a plain list with the preview removed (`[pattern:cursor-and-pointer#keyboard-equivalents]`).
- **One ticker, one lerp.** The chase rides the shared ticker; under reduced motion the preview still appears but does not trail.

## Parameters
Lerp `.25` (per 60 fps frame, converted through `damp()`) · preview `22vw`, `4:5` · row shift `.15em` on hover / focus.

Seen in: `[site:leo-parpeix]`, `[site:the-line]`.
