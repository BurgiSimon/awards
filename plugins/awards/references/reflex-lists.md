# Reflex lists — faces, palettes and effects to avoid, with alternatives

Generated interfaces converge on the same few typefaces, palettes and effects. A juror recognises them in seconds, and the audit flags the faces (rule T01, mirrored in `scripts/data/reflex-fonts.json`). This file is the human-readable version with the alternatives: open-licence faces first, the corpus's licensed faces named as "if you can license".

## Faces to avoid as the first family
**As display:** Inter, Roboto, Arial, Helvetica (the plain one), Space Grotesk, Space Mono, DM Sans, DM Serif Display / Text, Manrope, Geist, Geist Mono, Outfit, Plus Jakarta Sans, Instrument Sans, Instrument Serif, Fraunces, Playfair Display, Cormorant (all cuts), Lora, Crimson Pro / Text, Newsreader, Syne, IBM Plex Sans / Mono / Serif, Poppins, Montserrat, Open Sans, Lato, Raleway, Nunito, Work Sans, Rubik, Sora, Urbanist, Bricolage Grotesque, Clash Display, Satoshi, General Sans, Cabinet Grotesk.
**System faces as display:** Impact, Arial Black, `system-ui`, `-apple-system`, Segoe UI. Fine in a fallback stack after a real face; not as the voice.

Any of these can still be right for a body role in a specific world, and IBM Plex Mono is the display face of a Site of the Year `[site:igloo]`. The rule is about reflex, not prohibition: if you choose one on purpose, record it under `AWARDS.md ## Exceptions` with the reason.

## Alternatives by character class

| Class | Open-licence (verify the licence file) | Corpus faces, if you can license |
|---|---|---|
| Neutral grotesque (body / UI) | Mona Sans, Hubot Sans, Familjen Grotesk, Schibsted Grotesk, Archivo, Public Sans | Monument Grotesk `[site:leo-parpeix]`, Helvetica Now `[site:united-carriers]`, Suisse BP Int'l `[site:lama-lama]` `[site:floema]`, KTF Metro Blueline `[site:son-daven]` |
| Characterful grotesk at display scale | Mona Sans at heavy weights, Hubot Sans, Big Shoulders Display | Denim `[site:the-line]`, Suisse BP Int'l `[site:lama-lama]`, Avantt `[site:leo-parpeix]`, KTF Metro Roman `[site:son-daven]` |
| Condensed display | Anton, Bebas Neue, Big Shoulders Display, Archivo Narrow | BT Steinhart `[site:united-carriers]`, Brier `[site:lando-norris]` |
| Geometric | Jost, Figtree, Red Hat Display, Albert Sans | Century Gothic + Josefin Sans `[site:mont-fort]` (Josefin is open) |
| Serif display | Gloock, Bodoni Moda, Young Serif (Instrument Serif only when it is not the costume) | George X `[site:floema]`; the display serif of `[site:shopify-editions-w26]` [unknown face] |
| Monospace identity | JetBrains Mono, Commit Mono, Martian Mono, Azeret Mono | IoskeleyMono `[site:animejs]`, IBM Plex Mono as MSDF `[site:igloo]` |

Choose by what the world needs (a voice and a silence, or one voice), then by character (round vs sharp, wide vs narrow, warm vs cold), then by licence. Google-served families are checked against the `google/fonts` repository when fonts.google.com is unreachable, and always self-hosted.

## Palettes to avoid
- Six evenly spaced hues at equal saturation (a generated wheel).
- Purple-to-pink or indigo-to-violet gradients; the indigo #6366F1 + violet pair.
- Teal + orange "startup", pastel rainbow, neon on black by reflex.
- Pure #000 ground without a diegetic reason; pure #FFF text on it.
- Gold on black as the luxury costume.

Instead: two to four tokens, a warm or cool near-black, one accent derived from the subject's environment, chroma outsourced to imagery when photography is strong `[pattern:color-and-material]`.

## Effects to avoid by reflex
Blob or mesh-gradient hero · particle network · floating 3D primitives · glassmorphism cards · typewriter hero · fade-and-rise on every section · parallax on everything · logo marquee as the hero · cursor trail glitter · 3D tilt cards · count-up statistics · scroll-jack per section with no exit · neon glow buttons · gradient text · bounce or elastic easing on UI · infinite auto-play carousels · confetti.

Each has an earned version: a fluid wake as one global post-process `[site:leo-parpeix]`, particles pre-baked as geometry inside a spatial world `[site:igloo]`, a marquee driven by rAF with a mask and pause `[site:seasats]`, elastic easing on a logo that squashes because it is a character `[site:animejs]`. The difference is a concept that needs it.

## Copy to avoid
"Get started", "Learn more", "Discover", "Elevate", "Seamless", "Cutting-edge", "World-class", "Unlock", "Empower", "Effortless", "Next-generation", "Immersive experience". Replace with a number, a verb chain, or the outcome of the action.
