#!/usr/bin/env node
// Deal N of M candidate directions with a seeded PRNG so concept rounds do not converge on the model's favourite.
// Usage: node roll.mjs --deal 3 --of 7 [--seed <key>] [--reroll <n>]
import { parseArgs } from './lib/report.mjs';

const args = parseArgs(process.argv.slice(2));
const deal = Number(args.deal ?? 3);
const of = Number(args.of ?? 7);
const reroll = Number(args.reroll ?? 0);
if (!(deal > 0 && of >= deal)) {
  console.error('usage: node roll.mjs --deal <n> --of <m> [--seed <key>] [--reroll <n>]');
  process.exit(1);
}
const seed = args.seed ? String(args.seed) : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// xmur3 + mulberry32: tiny, deterministic, good enough for dealing cards.
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(xmur3(`${seed}:${reroll}`)());
const pool = Array.from({ length: of }, (_, i) => i + 1);
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
const dealt = pool.slice(0, deal).sort((a, b) => a - b);
console.log(`SEED ${seed}${reroll ? ` (reroll ${reroll})` : ''}`);
console.log(`DEALT ${dealt.join(' ')} of ${of}`);
console.log(`LEAD ${dealt[0]}`);
console.log('Present the dealt candidates as full cards of equal weight, lead first; keep the others in the re-roll pool.');
