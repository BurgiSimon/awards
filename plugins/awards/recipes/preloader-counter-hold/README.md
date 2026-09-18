# preloader-counter-hold

A counter that only counts what is loading: fonts, image decodes and a scene promise. It advances in uneven jumps but never ahead of the truth, holds at 100 for a beat, exits by lines, and is skipped on repeat visits.

## Why
- **Tied to a real signal.** A timer-only preloader is a lie the jury notices; the counter's ceiling is `done / total` of real promises (`[pattern:preloaders-and-transitions#the-load-contract]`).
- **Non-linear on purpose.** Jumps of 3–14 every 90 ms feel like a machine reporting, not a progress bar `[site:leo-parpeix]`; the hold at 100 is the beat before the curtain `[site:floema]`.
- **Repeat visits skip it.** `sessionStorage` remembers; the second load takes no gate at all, which keeps the usability axis intact.
- **Skippable and announced.** A Skip button, `role="status"` with `aria-live`, and `hidden` after exit so the overlay leaves the accessibility tree.

## Parameters
Jump `3–14` every `90 ms` · hold `450 ms` (300 under reduced motion) · exit: count `yPercent −120`, `.8 s`, `expo.in`; panel `yPercent −100`, `.9 s`, `expo.inOut` · hero lines `yPercent 120 → 0`, `1.4 s`, stagger `.09`.

## Variants
- **Boot sequence:** replace the count with telemetry lines that resolve one per signal `[site:usavionix]`.
- **Sound consent:** add an Enter button after 100 that resolves a consent promise and starts audio; never gate content on it `[site:leo-parpeix]`.
- **fps counter:** `00/24` at headline scale, each frame a signal `[site:the-line]`.

Seen in: `[site:floema]`, `[site:leo-parpeix]`, `[site:the-line]`, `[site:son-daven]`, `[site:usavionix]`.
