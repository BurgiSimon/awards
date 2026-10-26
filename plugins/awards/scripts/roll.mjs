#!/usr/bin/env node
// Deal N of M candidate directions with a seeded PRNG so concept rounds do not converge on the model's favourite.
// Usage: node roll.mjs --deal 3 --of 7 [--seed <key>] [--reroll <n>] [--engines e1,…,e7] [--avoid e,…]
//        node roll.mjs --stimulus 2 [--seed <key>]           two outside stimuli for worlds 6 and 7
//        node roll.mjs --choose a,b,c --label <name> [--seed <key>] [--avoid a,…]   one seeded pick among options
//        node roll.mjs --list engines|stimuli
// --engines tags each of the M worlds, in order, with an id from data/engines.json; the deal then takes its N
// worlds from N different engines when the tags allow it, preferring engines not named in --avoid.
// Every stream is keyed by the seed and its own name, so the deal, the stimuli and each choice never move
// one another, and a seed run without the new flags prints what earlier versions printed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/report.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(fs.readFileSync(path.join(here, 'data', `${name}.json`), 'utf8'));
const args = parseArgs(process.argv.slice(2));
const list = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const fail = (msg) => { console.error(msg); process.exit(1); };

if (args.list) {
  if (args.list === 'engines') for (const e of load('engines').engines) console.log(`${e.id.padEnd(18)} ${e.name} — ${e.gist}`);
  else if (args.list === 'stimuli') for (const s of load('stimuli').stimuli) console.log(`${s.id.padEnd(20)} ${s.family.padEnd(19)} ${s.name}`);
  else fail('usage: node roll.mjs --list engines|stimuli');
  process.exit(0);
}

const seed = args.seed && args.seed !== true ? String(args.seed) : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

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
const stream = (key) => mulberry32(xmur3(key)());
const shuffle = (items, rand) => {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};
const avoid = new Set(list(args.avoid));

// Outside stimuli: drawn on their own stream, so asking for them before the worlds exist changes no deal.
if (args.stimulus !== undefined) {
  const n = args.stimulus === true ? 2 : Number(args.stimulus);
  const deck = load('stimuli').stimuli;
  if (!(n > 0 && n <= deck.length)) fail(`--stimulus takes 1–${deck.length}`);
  // Two stimuli from one family would push worlds 6 and 7 towards the same material; prefer distinct families.
  const picked = [];
  for (const s of shuffle(deck, stream(`${seed}:stimulus:${Number(args.reroll ?? 0)}`))) {
    if (picked.length < n && !picked.some((p) => p.family === s.family)) picked.push(s);
  }
  console.log(`SEED ${seed}`);
  console.log(`STIMULI ${picked.map((s) => s.id).join(' ')}`);
  for (const s of picked) console.log(`  ${s.id}: ${s.name}`);
  console.log('Fuse each stimulus with one item of the subject inventory into world 6 and world 7; record the ids on the Seed line.');
  process.exit(0);
}

// One seeded pick among options the contract allows (a colour strategy, a hero archetype), away from --avoid.
if (args.choose !== undefined) {
  const options = list(args.choose);
  if (options.length < 2) fail('--choose needs at least two comma-separated options');
  const label = args.label && args.label !== true ? String(args.label) : 'choice';
  const open = options.filter((o) => !avoid.has(o));
  const pool = open.length ? open : options;
  const pick = pool[Math.floor(stream(`${seed}:choose:${label}:${Number(args.reroll ?? 0)}`)() * pool.length)];
  console.log(`SEED ${seed}`);
  console.log(`CHOSEN ${label} ${pick}`);
  if (open.length < options.length) console.log(`AVOIDED ${options.filter((o) => avoid.has(o)).join(' ')}${open.length ? '' : ' (every option was avoided, so all stayed in the pool)'}`);
  process.exit(0);
}

const deal = Number(args.deal ?? 3);
const of = Number(args.of ?? 7);
const reroll = Number(args.reroll ?? 0);
if (!(deal > 0 && of >= deal)) fail('usage: node roll.mjs --deal <n> --of <m> [--seed <key>] [--reroll <n>] [--engines e1,…] [--avoid e,…]');

const tags = list(args.engines);
if (tags.length) {
  const known = new Set(load('engines').engines.map((e) => e.id));
  const unknown = tags.filter((t) => !known.has(t));
  if (unknown.length) fail(`unknown engine(s): ${unknown.join(', ')} — node roll.mjs --list engines`);
  if (tags.length !== of) fail(`--engines needs one engine per world: ${of} expected, ${tags.length} given`);
}

const rand = mulberry32(xmur3(`${seed}:${reroll}`)());
const pool = Array.from({ length: of }, (_, i) => i + 1);
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
let dealt = pool.slice(0, deal);
if (tags.length) {
  // Walk the shuffled order three times: first new engines that are not avoided, then new engines that are,
  // then whatever is left. With enough distinct tags no two dealt worlds share an engine.
  const picked = [];
  const engines = new Set();
  const engineOf = (i) => tags[i - 1];
  for (const pass of [(i) => !engines.has(engineOf(i)) && !avoid.has(engineOf(i)), (i) => !engines.has(engineOf(i)), () => true]) {
    for (const i of pool) {
      if (picked.length < deal && !picked.includes(i) && pass(i)) { picked.push(i); engines.add(engineOf(i)); }
    }
  }
  dealt = picked;
}
dealt = dealt.sort((a, b) => a - b);
console.log(`SEED ${seed}${reroll ? ` (reroll ${reroll})` : ''}`);
console.log(`DEALT ${dealt.join(' ')} of ${of}`);
// Drawn after the shuffle, so DEALT stays what earlier versions printed for the same seed.
const lead = dealt[Math.floor(rand() * deal)];
console.log(`LEAD ${lead}`);
if (tags.length) {
  console.log(`ENGINES ${dealt.map((i) => tags[i - 1]).join(' ')}`);
  const span = new Set(tags).size;
  if (span < 4) console.log(`NOTE the ${of} worlds span ${span} engine(s); concept asks for at least four, so rewrite worlds before presenting.`);
  if (new Set(dealt.map((i) => tags[i - 1])).size < deal) console.log('NOTE two dealt worlds share an engine because the tags allowed no other deal.');
  const spent = dealt.filter((i) => avoid.has(tags[i - 1]));
  if (spent.length) console.log(`NOTE world(s) ${spent.join(', ')} use an avoided engine; their card says why this subject earns it.`);
}
console.log('Present the dealt candidates as full cards of equal weight in DEALT order, the lead marked; keep the others in the re-roll pool.');
