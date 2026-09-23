import assert from 'node:assert/strict';
import { assertLayout } from './verify-layout.mjs';

const probe = { overflow: false, h1Count: 1, brokenVisibleImages: [], unresolvedFragments: [], boxes: {} };
const checks = assertLayout({ desktop: { probe } });
assert.equal(checks.length, 4, 'every state checks the four shared layout requirements');
assert(checks.every(check => check.ok), 'a healthy layout passes');
assert.deepEqual(
  assertLayout({ desktop: { probe: { ...probe, overflow: true } } }).filter(check => !check.ok).map(check => check.message),
  ['desktop: no horizontal overflow'],
);
assert.deepEqual(
  assertLayout({ phone: { probe: { ...probe, brokenVisibleImages: ['missing.webp'] } } }).filter(check => !check.ok).map(check => check.message),
  ['phone: visible images loaded'],
);
assert(assertLayout({ desktop: {} }).every(check => !check.ok), 'missing probe fails closed');
console.log('layout assertions: passing, overflow, broken image, and missing probe checks passed');
