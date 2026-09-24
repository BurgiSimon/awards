# Jury report format

The blank report lives at `assets/templates/jury-report.md`; this file explains each section so every jury run produces the same document. Write the report to `.awards/jury/<date>.md` and append the disposition line plus the scores row to `AWARDS.md` under `## Jury log`.

## Disposition line (first line of the report)
`disposition: ship | fix | rebuild | recapture`, derived mechanically:
- **recapture** — the evidence is invalid: a capture is missing, blank, shows a stuck preloader, or console errors prevented rendering. Visual and developer values, visual memory and visual fidelity are `unmeasured`; located source findings remain useful under their own heading.
- **rebuild** — the weighted score is below 6.8, or the specificity test fails (a juror could name the source site), or the memory test yields a mood instead of an object or behaviour, or the THESIS is not visible in the first viewport.
- **fix** — the weighted score is 6.8 or higher but below 7.2, or any axis is below 6.8, or the audit has P0/P1 findings, or a contract block is not kept.
- **ship** — weighted ≥ 7.2, no axis below 6.8, no P0/P1 findings, every contract row kept, usability walk steps 1 and 3 passed.

## Evidence
Name the exact manifest path, applicable Page map chapter/viewport/state coverage and whether each required capture was valid; the audit file and its counts; console and page errors. A report without this section is an opinion.

## Scores
With valid rendered evidence, use the two tables from `rubric.md`: four axes with one-line reasons and the weighted result; five developer criteria with notes. Reasons are mandatory. Without valid rendered evidence, put `unmeasured` in every value cell, including weighted and developer criteria. The report and final reply use adjacent lines: `disposition: recapture` then `Design unmeasured · Usability unmeasured · Creativity unmeasured · Content unmeasured — weighted unmeasured`. Never attach numeric scores to `recapture`. Component reports and replies include Design, Usability and Creativity only: numeric values with their mean when measured, or all three and the mean `unmeasured` when evidence is missing.

## Memory test
One paragraph in the voice of a visitor an hour later. It must name an object or a behaviour ("the helmet that turned into a wireframe as I scrolled"), never an atmosphere ("dark and premium").

## Specificity test
`no` or `yes — <site> — <what to change>`. Compare the first viewport against the three DIVERGENCE cards and the wider index.

## Slop scan
The second direction of the specificity test. It uses the tables in `references/anti-patterns.md#the-slop-scan`: first the audit rules, then the `judge` rows read off the captures. Write `families present: n`, then one line per family naming it and its evidence (capture, `file:line` or rule id), then `generator nameable: yes | no`. Two or more families is a yes, and it caps Creativity at 6. An earned use recorded under `## Exceptions` with its reason is not counted.

## Contract fidelity
One row per direction-contract block with kept / not kept and the rendered evidence (capture name, `file:line`). Missing rendered evidence makes visual fidelity `unmeasured`. Component reports include only WORLD and, for a signature component, SIGNATURE. Fidelity failures are listed before craft failures in the fix list.

## Source findings
For a `recapture` report, list useful located `file:line` observations here without treating them as visual memory, fidelity or numeric scores. Name the capture action separately under Material fixes.

## Material fixes
At most eight, ordered: contract fidelity first, then usability walk failures from steps 1 and 3, then audit P0/P1, then design seams. Each fix supplies `location | change | expected visible result | viewport/state | before evidence | after evidence | resolved/partial/unresolved`; the first report uses `unresolved` with `pending` after evidence. A failed contract block omitted from the batch remains unresolved. No "consider" items: if it is not worth fixing, it is not on the list.

## Keep
One line naming what must not be diluted while fixing, so the ship pass does not sand off the signature.

## Verdict pass
When `awards:ship` has applied the fixes, the jury runs again in verdict mode and replaces the body with:
- `## Verdict` — one row per fix comparing the named viewport/state and before/after manifest evidence, with resolved / partial / unresolved.
- `## Regressions` — explicitly check new defects; list at most three.
- `## Keep` — carry the original line into the verdict and check it against the recapture.
- `## Remaining` — `clear` or the list.
- a recomputed `disposition:` line.

## Refuse
- Praise, softening, or a score without a reason.
- Redesigning inside the report; the jury names the fix, ship makes it.
- Scoring without valid captures.
- Counting effects as creativity.
