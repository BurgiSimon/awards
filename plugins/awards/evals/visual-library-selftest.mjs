#!/usr/bin/env node
// Removing a visual validation branch must make its corresponding fixture fail.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awards-visual-refs-'));
const recipe = path.join(root, 'recipes/example');
try {
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(recipe, 'visuals'), { recursive: true });
  fs.copyFileSync(fileURLToPath(new URL('../scripts/lint-refs.mjs', import.meta.url)), path.join(root, 'scripts/lint-refs.mjs'));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(path.join(recipe, 'visuals/desktop.png'), png);
  fs.writeFileSync(path.join(recipe, 'visuals/mobile.png'), png);
  fs.writeFileSync(path.join(recipe, 'visuals/empty.png'), '');
  fs.writeFileSync(path.join(recipe, 'visuals/text.txt'), 'not an image');
  fs.writeFileSync(path.join(root, 'outside.png'), png);
  fs.symlinkSync(path.join(root, 'outside.png'), path.join(recipe, 'visuals/link.png'));
  fs.writeFileSync(path.join(recipe, 'README.md'), '# Example\n\n## Visual notes\nChecked.\n');
  const valid = { desktop: 'visuals/desktop.png', mobile: 'visuals/mobile.png', notes: 'README.md#visual-notes' };
  const cases = [
    ['valid metadata', valid, true],
    ['absent optional metadata', undefined, true],
    ['missing image', { ...valid, desktop: 'visuals/missing.png' }, false],
    ['empty image', { ...valid, desktop: 'visuals/empty.png' }, false],
    ['traversal', { ...valid, desktop: '../../outside.png' }, false],
    ['absolute path', { ...valid, desktop: path.join(root, 'outside.png') }, false],
    ['symlink escape', { ...valid, desktop: 'visuals/link.png' }, false],
    ['unsupported image', { ...valid, desktop: 'visuals/text.txt' }, false],
    ['missing notes heading', { ...valid, notes: 'README.md#missing' }, false],
    ['missing notes file', { ...valid, notes: 'missing.md#visual-notes' }, false],
    ['notes traversal', { ...valid, notes: '../../README.md#visual-notes' }, false],
    ['malformed metadata', [], false],
    ['null metadata', null, false],
    ['incomplete metadata', { desktop: valid.desktop }, false],
    ['non-string path', { ...valid, desktop: 4 }, false],
  ];
  for (const [name, visuals, pass] of cases) {
    fs.writeFileSync(path.join(recipe, 'recipe.json'), JSON.stringify({ id: 'example', visuals }, null, 2));
    const run = spawnSync(process.execPath, [path.join(root, 'scripts/lint-refs.mjs'), '--json'], { encoding: 'utf8' });
    assert.equal(run.status, pass ? 0 : 1, `${name}: ${run.stdout}${run.stderr}`);
    const { misses } = JSON.parse(run.stdout);
    assert.equal(misses.length === 0, pass, name);
    for (const miss of misses) assert.ok(miss.file === 'recipes/example/recipe.json' && miss.line > 0 && miss.ref.includes('visuals'), `${name}: located diagnostic`);
  }
  fs.writeFileSync(path.join(recipe, 'recipe.json'), 'null\n');
  const rootNull = spawnSync(process.execPath, [path.join(root, 'scripts/lint-refs.mjs'), '--json'], { encoding: 'utf8' });
  assert.equal(rootNull.status, 1, `root null metadata: ${rootNull.stdout}${rootNull.stderr}`);
  assert.deepEqual(JSON.parse(rootNull.stdout).misses, [{ file: 'recipes/example/recipe.json', line: 1, ref: 'recipe.json', why: 'must be a JSON object' }]);
  console.log(`visual references: ${cases.length + 1} fixtures passed`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
