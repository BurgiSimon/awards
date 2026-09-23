#!/usr/bin/env node
// Exercise the last-message jury grader against both evidence branches.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const grader = path.join(path.dirname(fileURLToPath(import.meta.url)), 'jury-generic-saas/graders/scores-present.md');
const fm = fs.readFileSync(grader, 'utf8').split(/^---$/m)[1] ?? '';
const field = (key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();
const unquote = (s) => (s && /^['"].*['"]$/s.test(s) ? s.slice(1, -1) : s);
const matches = (value) => new RegExp(unquote(field('pattern')), field('flags') ?? '').test(value);

const measured = 'disposition: fix\nDesign 7.4 · Usability 7.2 · Creativity 7.0 · Content 7.1 — weighted 7.24';
const missing = 'disposition: recapture\nDesign unmeasured · Usability unmeasured · Creativity unmeasured · Content unmeasured — weighted unmeasured';
assert.equal(matches(measured), true, 'rendered evidence accepts numeric scores');
assert.equal(matches(missing), true, 'missing evidence accepts only unmeasured scores');
assert.equal(matches(measured.replace('disposition: fix', 'disposition: recapture')), false, 'recapture cannot have numeric scores');
assert.equal(matches(missing.replace('disposition: recapture', 'disposition: ship')), false, 'ship cannot have unmeasured scores');
assert.equal(matches(missing.replace('Design unmeasured', 'Design 7.4')), false, 'mixed scores are invalid');
console.log('jury evidence grader: 5 assertions passed');
