# Frozen visual-composition benchmark

This comparison uses three synthetic demonstration briefs and identical immutable inputs in both arms. It is separate from routing evals. No benchmark model builds have run at input-freeze time.

## Authorized execution allowance

Recorded before asset generation on 2026-09-22: six build calls at up to USD 35 each, USD 210 total planned build allowance, with a 60-minute timeout per call. Asset-generation usage is separate and authorized. No automatic reruns or paid jury comparisons are included. The six builds run only after both plugin snapshots are fixed (Task 12).

## Fixed cases

| Case | Visitor mode | Required result |
|---|---|---|
| `kiln-nine` | persuade | Three ceramics with cm dimensions, material/care and a usable local enquiry action |
| `tidal-notes` | read | Six categorized entries with reading times, visible index and substantial lead article |
| `form-sound` | experience | Three daily schedules, venue/access details and a usable local booking action |

Each case supplies `prompt.md`, `content.md`, `ASSETS.md`, and two original assets. All brands, specifications, people, places and imagery are synthetic demonstration material. Raster prompts and processing provenance live in each case's `ASSETS.md`. Generated artwork is frozen before builds; no new asset generation or external reference browsing is permitted during a run.

## Input archive and integrity

`inputs.json` stores SHA-256 and byte length for every supplied case file and every source file in the common starter, including hidden files and its generated dependency lockfile. `repository` paths resolve from the repository root; `archive` paths resolve from the external benchmark root. The external root is a local artifact location, not a required permanent machine path: move the archive intact and set `AWARDS_BENCH_ROOT` to its new absolute path.

The baseline is revision `4f348dc5ea850d9657af27ce28c17e11884f02d6`, exported with `git archive` into a fresh empty `baseline/` directory outside this repository. `baseline.tar` preserves those exact plugin bytes and has a recorded SHA-256. The frozen common vanilla Vite starter was created by that baseline's `scripts/new-project.mjs --stack vite`, without WebGL. Its existing pinned dependencies were installed once to produce `package-lock.json`; no npm dependency was added. Generated install products (`node_modules/`) are not source inputs. Each later run must copy the identical starter and execute project-local `npm ci` using this lockfile; never share a mutable installation across runs. The lockfile pins transitive resolution and integrity.

Verify the full inventory with Node's built-in crypto before every run (run from repository root):

```sh
AWARDS_BENCH_ROOT=/absolute/path/to/archive node --input-type=module <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('plugins/awards/evals/visual/inputs.json', 'utf8'));
assert(process.env.AWARDS_BENCH_ROOT, 'Set AWARDS_BENCH_ROOT');
const roots = { repository: process.cwd(), archive: process.env.AWARDS_BENCH_ROOT };
const files = [...manifest.sharedFiles, ...manifest.cases.flatMap(c => c.files), manifest.baseline.archive];
for (const file of files) {
  assert(Object.hasOwn(roots, file.root), `Unknown root: ${file.root}`);
  const bytes = fs.readFileSync(path.join(roots[file.root], file.path));
  assert(bytes.length > 0, `Empty input: ${file.path}`);
  assert.equal(bytes.length, file.bytes, `Size mismatch: ${file.path}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Hash mismatch: ${file.path}`);
}
console.log(`PASS: ${files.length} nonempty files match SHA-256 and byte length`);
NODE
```

Before spending on builds, also decode every supplied asset in the common browser, compare installed dependency versions, make a real Chromium capture, and verify the intended plugin's skills load. A denied skill or missing browser is an environment failure: stop and preserve evidence before another run. Equal hashes establish identical inputs; existence alone does not. Save the copied workspace's input hashes before editing begins and reject any unmatched pair.

## Six-run protocol

Run in six fresh sibling workspaces outside the repository, with only the selected plugin snapshot available. Keep the backend, effort, tools, execution ceilings, source starter, content and asset bytes equal. Record backend identifiers and effective environment only in the private external ledger. Neither arm receives recipe/example imagery as project assets. Candidate implementation is the treatment and does not change this input inventory.

Serial order: kiln-nine baseline/candidate, tidal-notes candidate/baseline, form-sound baseline/candidate. Use one fresh session for each run. Preserve exit status, duration, actual cost, source revision, original input hashes, trace, build output and reports. There are no automatic retries or extra polish runs. Preserve each arm's own reports, but never use their self-scores as the comparison result. Freeze both snapshots before Task 12 launches the first build.

Assess both arms using one common external audit/capture tool revision, fixed before runs and recorded privately. Capture desktop 1440×900 and mobile 390×844 at 0/25/50/75/100% scroll, plus reduced motion and each primary interaction. Use the same settings, browser and fonts; use fresh evidence directories and preserve actual manifest paths. Check all required content and assets. Broken build, missing required content/assets, clipped meaningful text, inaccessible primary action, or missing reduced-motion content fails technical eligibility.

Produce a static A/B presentation of matching screenshots plus local page links. Counterbalance left/right assignments across cases, recording the mapping in an external answer key; keep it out of the human review sheet. Use the frozen `review-template.md` before revealing the mapping or any plugin self-scores. The human supplies Composition, Typography, Imagery, Distinctiveness, Mobile and Overall choices with a visible reason and tie option.

The pilot supports adoption only if the candidate wins Overall on at least two of three cases, is no worse on Mobile in all three, and introduces no new blocking technical failures. Report missing runs, ties, mixed outcomes and pending human review explicitly. Three one-shot pairs do not demonstrate universal superiority. A failed target is an experiment result, not permission to tune repeatedly against the same briefs. Headless captures prove rendering and behavior, not real-device performance.
