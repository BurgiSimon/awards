#!/usr/bin/env node
// SubagentStop for the forked juror: craft routes on the reply's literal `disposition:` line, so a reply that
// lost it (a summary, a table, a cut-off turn) is sent back once with the reason instead of reaching craft.
// Silent for every other subagent, on the second stop (stop_hook_active), with AWARDS_HOOK=0 and with the
// plugin's `hooks_enabled` setting off.
// Usage (hook): stdin is the SubagentStop JSON; stdout is a block decision or nothing; exit 0.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export function check(input) {
  if (!input || !/(^|:)awards-jury$/.test(String(input.agent_type ?? ''))) return null;
  if (input.stop_hook_active) return null;
  const reply = String(input.last_assistant_message ?? '');
  if (/^disposition: (ship|fix|rebuild|recapture)$/m.test(reply)) return null;
  return {
    decision: 'block',
    reason: 'Your reply has no `disposition: ship|fix|rebuild|recapture` line, and the build routes on it. End with the verbatim block from your report: the disposition line, then the score line (numeric with rendered evidence, all `unmeasured` with `recapture`), then the floor and craft fixes. Do not re-score or re-capture; restate what the report already says.',
  };
}

const direct = (() => { try { return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (direct && process.env.AWARDS_HOOK !== '0' && !/^(false|0)$/.test(process.env.CLAUDE_PLUGIN_OPTION_HOOKS_ENABLED ?? '')) {
  let input = null;
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { /* no input: stay silent */ }
  const out = check(input);
  if (out) console.log(JSON.stringify(out));
}
