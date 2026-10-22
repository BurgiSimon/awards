// One run at a time per lock: mkdir is atomic on every platform, unlike flock (absent on macOS and Windows).
// A lock older than fifteen minutes belongs to a run that died and is taken over; a plain file of that name is
// what flock left behind and holds nothing. The lock is released when the process exits.
import fs from 'node:fs';
import path from 'node:path';

export async function acquireLock(lockPath, label = 'lock') {
  const lock = path.resolve(lockPath);
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  if (fs.existsSync(lock) && !fs.statSync(lock).isDirectory()) fs.rmSync(lock, { force: true });
  for (let waited = 0; ; waited += 250) {
    try {
      fs.mkdirSync(lock);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (Date.now() - fs.statSync(lock).mtimeMs > 15 * 60 * 1000) { fs.rmSync(lock, { recursive: true, force: true }); continue; }
      if (waited > 20 * 60 * 1000) { console.error(`${label} still held after 20 minutes: ${lock}`); process.exit(1); }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  process.on('exit', () => { try { fs.rmSync(lock, { recursive: true, force: true }); } catch {} });
  return lock;
}
