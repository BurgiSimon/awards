#!/usr/bin/env node
// SessionStart hint after compaction: re-attach a short state card from AWARDS.md. Compaction keeps
// only the most recently invoked skills, so the craft orchestrator is the first to drop out of a long
// build; the card says where the build stands so the session re-reads the record instead of guessing.
// Silent when the project has no AWARDS.md, when every Status line is checked, and with AWARDS_HOOK=0.
// Usage (hook): stdin is the hook JSON (cwd, source); stdout becomes added context; exit 0.
//        node scripts/state-card.mjs --project <dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/report.mjs';

const args = parseArgs(process.argv.slice(2));

export function card(md) {
  const status = md.split(/^## Status/m)[1]?.split(/^## /m)[0] ?? '';
  const lines = [...status.matchAll(/^- \[( |x|X)\] (.+)$/gm)].map((m) => ({ done: m[1] !== ' ', text: m[2].trim() }));
  const next = lines.find((l) => !l.done);
  if (!lines.length || !next) return '';
  // Each Status line names its phase skill in brackets; the two without one belong to craft and jury.
  const skill = /^Jury disposition/i.test(next.text) ? 'jury' : next.text.match(/\((\w+)/)?.[1] ?? 'craft';
  const last = (heading) => (md.split(new RegExp(`^## ${heading}`, 'm'))[1]?.split(/^## /m)[0] ?? '').split('\n').filter((l) => /^- /.test(l)).at(-1);
  const deep = md.match(/^- Deep modes:\s*(.+)$/m)?.[1];
  const out = [
    'awards state card, re-read from AWARDS.md after compaction:',
    `- Status: ${lines.filter((l) => l.done).length} of ${lines.length} done; next "${next.text}" → awards:${skill}`,
  ];
  if (deep && !/gsap\|none/.test(deep)) out.push(`- Deep modes: ${deep}`);
  const jury = last('Jury log');
  if (jury) out.push(`- Last jury: ${jury.slice(2)}`);
  const ship = last('Ship log');
  if (ship) out.push(`- Last ship: ${ship.slice(2)}`);
  out.push('If this session was running the awards build, re-read AWARDS.md and DESIGN.md and continue through the `awards:craft` skill (`resume`) or the next phase skill with the Skill tool, not from memory of the compacted turns. If it was doing other work, ignore this card.');
  return out.join('\n');
}

function main() {
  if (process.env.AWARDS_HOOK === '0') return;
  let dir = args.project ? String(args.project) : null;
  if (!dir) {
    let input = {};
    try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch {}
    dir = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  }
  const file = path.join(path.resolve(dir), 'AWARDS.md');
  if (!fs.existsSync(file)) return;
  const text = card(fs.readFileSync(file, 'utf8'));
  if (text) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }));
}

// Imported (e.g. by a test) it only exports card(); stdin is read only when run as the hook.
const direct = (() => { try { return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (direct) try { main(); } catch { /* a hint never breaks the session */ }
