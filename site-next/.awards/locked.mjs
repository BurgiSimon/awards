// Run one browser job under the shared verification lock, so captures and rendered audits never overlap.
// node .awards/locked.mjs <script.mjs> [args...]   (the lock path comes from AWARDS_LOCK)
import { spawnSync } from 'node:child_process';
import { acquireLock } from '../../plugins/awards/scripts/lib/lock.mjs';

const lock = process.env.AWARDS_LOCK;
if (!lock) { console.error('set AWARDS_LOCK to the shared lock path'); process.exit(1); }
await acquireLock(lock, 'verify lock');
const r = spawnSync(process.execPath, process.argv.slice(2), { stdio: 'inherit' });
process.exit(r.status ?? 1);
