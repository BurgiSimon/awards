# flicker-text

A line that switches on like a tube light: each glyph runs the opacity ladder `[0, 1, 0, 0, 1, 1]` in hard steps with a 40 ms stagger. On hover or focus the ladder replays with a small expo-out shift.

## Why
- **Steps, not a fade.** The ladder is the character; `ease: 'none'` on keyframes keeps the switches hard `[site:the-line]` (`[pattern:motion-vocabulary#text-effects]`).
- **Readable text first.** The original string stays in the element as a visually hidden mirror; the glyph spans are `aria-hidden`, so assistive technology reads a word, not twenty letters.
- **Fonts first.** Splitting waits for `document.fonts.ready` so glyph widths are final.
- **Reduced motion:** glyphs are simply visible; hover does nothing.

## Parameters
Ladder `[0,1,0,0,1,1]` · `50 ms` per step · stagger `40 ms` · hover shift `6 px`, `.8 s`, `expo.out`.

Seen in: `[site:the-line]`.
