#!/usr/bin/env node
// Install and discover every skill with the real Codex CLI; no model calls or user config changes.
// Its parser accepts the Claude-specific frontmatter retained by this shared package.
// Usage: node plugins/awards/evals/codex-install.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(plugin, '../..');
const testHome = fs.mkdtempSync(path.join(os.tmpdir(), 'awards codex '));
const env = { ...process.env, CODEX_HOME: testHome };
delete env.CLAUDE_PLUGIN_ROOT;
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: testHome, env, encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, 0, result.error?.message ?? result.stderr + result.stdout);
  return result.stdout;
};

try {
  run('codex', ['plugin', 'marketplace', 'add', repo, '--json']);
  const installed = JSON.parse(run('codex', ['plugin', 'add', 'awards@awards', '--json']));
  assert.equal(installed.pluginId, 'awards@awards');
  const root = installed.installedPath;
  assert.ok(root.startsWith(testHome + path.sep), 'installation must stay inside the temporary home');

  const server = spawn('codex', ['app-server', '--stdio'], { cwd: testHome, env, stdio: ['pipe', 'pipe', 'pipe'] });
  const exited = once(server, 'exit');
  const timeout = setTimeout(() => server.stdin.end(), 30000);
  let stderr = '';
  server.stderr.on('data', (chunk) => { stderr += chunk; });
  let skills;
  try {
    server.stdin.write(JSON.stringify({
      id: 1, method: 'initialize', params: { clientInfo: { name: 'awards-install-check', version: '0.1.0' } },
    }) + '\n');
    for await (const line of createInterface({ input: server.stdout })) {
      const response = JSON.parse(line);
      assert.ok(!response.error, JSON.stringify(response.error));
      if (response.id === 1) {
        for (const request of [
          { method: 'initialized', params: {} },
          { id: 2, method: 'skills/list', params: { cwds: [testHome], forceReload: true } },
        ]) server.stdin.write(JSON.stringify(request) + '\n');
      }
      if (response.id !== 2) continue;
      const entry = response.result.data.find((item) => item.cwd === testHome);
      assert.ok(entry, 'Codex must return skills for the test workspace');
      assert.deepEqual(entry.errors, []);
      skills = entry.skills.filter((skill) => skill.path.startsWith(root + path.sep));
      break;
    }
  } finally {
    clearTimeout(timeout);
    server.stdin.end();
    await exited;
  }
  assert.ok(skills, `Codex did not return skills/list: ${stderr}`);
  const names = fs.readdirSync(path.join(plugin, 'skills')).sort();
  assert.deepEqual(skills.map((skill) => skill.name).sort(), names.map((name) => `awards:${name}`));
  for (const skill of skills) {
    assert.equal(path.resolve(path.dirname(skill.path), '../..'), root);
    assert.ok(fs.existsSync(path.resolve(path.dirname(skill.path), '../../references/codex.md')));
  }

  run(process.execPath, [path.join(root, 'scripts/lint-refs.mjs')]);
  const project = path.join(testHome, 'sample site');
  run(process.execPath, [path.join(root, 'scripts/new-project.mjs'), '--stack', 'vite', '--name', project]);
  assert.ok(fs.existsSync(path.join(project, 'AWARDS.md')));
  assert.ok(fs.existsSync(path.join(project, 'src/main.js')));
  console.log(`Codex install passed: ${skills.length} skills discovered; bundled references and scaffold work.`);
} finally {
  fs.rmSync(testHome, { recursive: true, force: true });
}
