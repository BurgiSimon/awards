# Jury report format

The blank report lives at `assets/templates/jury-report.md`; this file explains each section so every jury run produces the same document. Write the report to `.awards/jury/<date>.md` and append the disposition line plus the scores row to `AWARDS.md` under `## Jury log`.

## Disposition line (first line of the report)
`disposition: ship | fix | rebuild | recapture`, derived mechanically:
- **recapture** — the evidence is invalid: a capture is missing, blank, shows a stuck preloader, or console errors prevented rendering. Nothing else is scored.
- **rebuild** — the weighted score is below 6.8, or the specificity test fails (a juror could name the source site), or the memory test yields a mood instead of an object or behaviour, or the THESIS is not visible in the first viewport.
- **fix** — the weighted score is 6.8 or higher but below 7.2, or any axis is below 6.8, or the audit has P0/P1 findings, or a contract block is not kept.
- **ship** — weighted ≥ 7.2, no axis below 6.8, no P0/P1 findings, every contract row kept, usability walk steps 1 and 3 passed.

## Evidence
Name the captures used and whether each was valid; the audit file and its counts; console and page errors. A report without this section is an opinion.

## Scores
The two tables from `rubric.md`: four axes with one-line reasons and the weighted result; five developer criteria with notes. Reasons are mandatory.

## Memory test
One paragraph in the voice of a visitor an hour later. It must name an object or a behaviour ("the helmet that turned into a wireframe as I scrolled"), never an atmosphere ("dark and premium").

## Specificity test
`no` or `yes — <site> — <what to change>`. Compare the first viewport against the three DIVERGENCE cards and the wider index.

## Contract fidelity
One row per direction-contract block with kept / not kept and the evidence (capture name, `file:line`). Fidelity failures are listed before craft failures in the fix list.

## Material fixes
At most eight, ordered: contract fidelity first, then usability walk failures from steps 1 and 3, then audit P0/P1, then design seams. Each fix names the location and the change, in one or two lines. No "consider" items: if it is not worth fixing, it is not on the list.

## Keep
One line naming what must not be diluted while fixing, so the ship pass does not sand off the signature.

## Verdict pass
When `awards:ship` has applied the fixes, the jury runs again in verdict mode and replaces the body with:
- `## Verdict` — one line per fix: resolved / partial / unresolved, with what the recapture shows.
- `## Regressions` — at most three.
- `## Remaining` — `clear` or the list.
- a recomputed `disposition:` line.

## Refuse
- Praise, softening, or a score without a reason.
- Redesigning inside the report; the jury names the fix, ship makes it.
- Scoring without valid captures.
- Counting effects as creativity.
