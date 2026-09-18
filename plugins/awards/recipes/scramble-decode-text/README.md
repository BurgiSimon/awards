# scramble-decode-text

Telemetry readouts that resolve from a character set into their final text: reveal at 60 characters per second, settle at 30, a block cursor at the frontier. The final string is always the source string.

## Why
- **The register is the concept.** Decode reveals belong to expedition and operator worlds `[site:igloo]` `[site:usavionix]` (`[pattern:copy-and-content#telemetry-register]`); they are wrong on a jewellery site.
- **anime.js owns this primitive.** `scrambleText` is a value factory for `innerHTML` with charset, cursor, reveal and settle rates; hand-rolling it is a hundred lines of worse code (`references/stacks/animejs-4.md`).
- **Mirror first.** The source text stays in a visually hidden span; the scramble runs in an `aria-hidden` twin, so a screen reader never hears noise.
- **Reduced motion:** the final text, immediately.

## Parameters
`revealRate 60` · `settleRate 30` · cursor `░▒▓█` · durations `1.4–1.8 s` · stagger `180 ms`.

Seen in: `[site:igloo]`, `[site:usavionix]`, `[site:lando-norris]`.
