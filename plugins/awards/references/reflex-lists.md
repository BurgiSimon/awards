# Reflex lists — faces, palettes and effects to avoid, with alternatives

Generated interfaces converge on the same few typefaces, palettes and effects. A juror recognises them in seconds, and the audit flags the faces (rule T01, mirrored in `scripts/data/reflex-fonts.json`). This file is the human-readable version with the alternatives: open-licence faces first, the corpus's licensed faces named as "if you can license".

## Faces to avoid as the first family
**As display:** Inter, Roboto, Arial, Helvetica (the plain one), Space Grotesk, Space Mono, DM Sans, DM Serif Display / Text, Manrope, Geist, Geist Mono, Outfit, Plus Jakarta Sans, Instrument Sans, Instrument Serif, Fraunces, Playfair Display, Cormorant (all cuts), Lora, Crimson Pro / Text, Newsreader, Syne, IBM Plex Sans / Mono / Serif, Poppins, Montserrat, Open Sans, Lato, Raleway, Nunito, Work Sans, Rubik, Sora, Urbanist, Bricolage Grotesque, Clash Display, Satoshi, General Sans, Cabinet Grotesk.
**System faces as display:** Impact, Arial Black, `system-ui`, `-apple-system`, Segoe UI. Fine in a fallback stack after a real face; not as the voice.

Any of these can still be right for a body role in a specific world, and IBM Plex Mono is the display face of a Site of the Year `[site:igloo]`. The 2026-09-23 wave shows the reflex in shipped work: Poppins as the whole contract `[site:goats]`, Montserrat loaded twice `[site:to-top]`, Geist Mono as the voice `[site:siteassist]`, DM Serif Display + Space Grotesk `[site:zainabkabira]`, Manrope under Anton `[site:christoph-nagel]` [verified on each card]. The rule is about reflex, not prohibition: if you choose one on purpose, record it under `AWARDS.md ## Exceptions` with the reason.

## Alternatives by character class

| Class | Open-licence (verify the licence file) | Corpus faces, if you can license |
|---|---|---|
| Neutral grotesque (body / UI) | Mona Sans, Hubot Sans, Familjen Grotesk, Schibsted Grotesk, Archivo, Public Sans | Monument Grotesk `[site:leo-parpeix]`, Helvetica Now `[site:united-carriers]`, Suisse BP Int'l `[site:lama-lama]` `[site:floema-jewelry]`, KTF Metro Blueline `[site:son-daven]`, TWK Lausanne `[site:911rennsport]`, NB International `[site:siena]`, PP Neue Montreal `[site:noth]` `[site:bethebuzz]`, Aeonik Pro `[site:okaydev]` |
| Characterful grotesk at display scale | Mona Sans at heavy weights, Hubot Sans, Big Shoulders Display, TikTok Sans at a wide axis `[site:haoqi]` | Denim `[site:the-line]`, Suisse BP Int'l `[site:lama-lama]` (Suisse Int'l at one weight `[site:warmnfuzzy]`), Avantt `[site:leo-parpeix]`, KTF Metro Roman `[site:son-daven]`, PP Mori `[site:boc]`, ABC Diatype Plus `[site:jesperlandberg]`, PP Formula `[site:911rennsport]`, Halvar Breitschrift `[site:alectear]`, Adieu `[site:the-boyd]` |
| Condensed display | Anton, Bebas Neue, Big Shoulders Display, Archivo Narrow | BT Steinhart `[site:united-carriers]`, Brier `[site:lando-norris]`, Bigger Display `[site:wodniack]`, Thunder `[site:serotoninn]`, Sharp Grotesk Black compressed `[site:gehry-getty]`, Greed Narrow `[site:mensch]` |
| Geometric | Jost, Figtree, Red Hat Display, Albert Sans | Century Gothic + Josefin Sans `[site:mont-fort]` (Josefin is open), TT Norms Pro `[site:likova]` |
| Serif display | Gloock, Bodoni Moda, Young Serif (Instrument Serif only when it is not the costume) | George X `[site:floema-jewelry]`; the display serif of `[site:shopify-editions-w26]` [unknown face]; PP Editorial New as a light text serif `[site:wodniack]`; Canela and a hairline display, Love `[site:the-boyd]`; Reckless `[site:gehry-getty]`; PP Editorial Old Ultralight `[site:bethebuzz]` |
| Accent face for one beat (script, blackletter, bitmap) | UnifrakturCook `[site:mensch]`, Nothing You Could Do `[site:to-top]`, Departure Mono `[site:haoqi]` | Megazoid `[site:okaydev]` — rationed to one or two jobs, never a heading style |
| Monospace identity | JetBrains Mono, Commit Mono, Martian Mono, Azeret Mono | IoskeleyMono `[site:animejs]`, IBM Plex Mono as MSDF `[site:igloo]`, Vulf Mono `[site:alectear]`, Aeonik Mono `[site:okaydev]` |

Choose by what the world needs (a voice and a silence, or one voice), then by character (round vs sharp, wide vs narrow, warm vs cold), then by licence. Google-served families are checked against the `google/fonts` repository when fonts.google.com is unreachable, and always self-hosted.

## Palettes to avoid
- Six evenly spaced hues at equal saturation (a generated wheel).
- Purple-to-pink or indigo-to-violet gradients; the indigo #6366F1 + violet pair.
- Teal + orange "startup", pastel rainbow, neon on black by reflex.
- Pure #000 ground without a diegetic reason; pure #FFF text on it.
- Gold on black as the luxury costume.
- A national flag as a colour rule `[site:pensatori-irrazionali]`; an electric blue on a pastel as "the lettering look" `[site:alectear]`; acid yellow or lime as the one accent on near-black `[site:primesec]` `[site:haoqi]` (neon on black by another name).

Instead: two to four tokens, a warm or cool near-black, one accent derived from the subject's environment, chroma outsourced to imagery when photography is strong `[pattern:color-and-material]`.

## Effects to avoid by reflex
Blob or mesh-gradient hero · particle network · floating 3D primitives · glassmorphism cards · typewriter hero · fade-and-rise on every section · parallax on everything · logo marquee as the hero · cursor trail glitter `[site:mensch]` · 3D tilt cards · count-up statistics `[site:primesec]` · scroll-jack per section with no exit · neon glow buttons · gradient text · bounce or elastic easing on UI · infinite auto-play carousels `[site:911rennsport]` · confetti · a classical marble statue wearing a modern gadget `[site:primesec]` · the neo-brutal kit of sticker wordmarks, 4 px hard offset shadows and highlighter strokes `[site:nodeck]` · a scripted "loading" percentage `[site:spasoje]` · a CRT boot screen `[site:mensch]` · sound on by default `[site:haoqi]` · a chat or voice widget over the reading column `[site:wearedirect]` · a rotate-your-device gate `[site:grids-obys]`.

Each has an earned version: a fluid wake as one global post-process `[site:leo-parpeix]`, particles pre-baked as geometry inside a spatial world `[site:igloo]`, a marquee driven by rAF with a mask and pause `[site:seasats]`, marquee rows whose duration comes from their measured width so every row shares one speed `[site:boc]`, elastic easing on a logo that squashes because it is a character `[site:animejs]`, a typed title that opens on a full phrase and shows its first word under reduced motion `[site:mensch]`, a tilt capped at ± 5° on the one control that is a physical object `[site:areebali]`, auto-advancing tabs whose progress bar is the timer and which pause on hover `[site:wearedirect]`. The difference is a concept that needs it.

## Copy to avoid
"Get started", "Learn more" (the only mid-page action on `[site:pensatori-irrazionali]`, a button per service on `[site:bethebuzz]`), "Discover", "Elevate", "Seamless", "Cutting-edge", "World-class", "Unlock", "Empower", "Effortless", "Next-generation", "Immersive experience", "Supercharge", "Revolutionize", "Game-changer", "Best-in-class", calling a rival practice "theater", "Let's talk" as the close `[site:siteassist]`. Two sentence shapes as well: the slogan antithesis ("Not a tool. A platform.") repeated down the page, and a dash in every other sentence. Replace with a number, a verb chain, or the outcome of the action. The audit reads its lists from `scripts/data/reflex-copy.json` (X01, X16–X18); keep the two in step.
