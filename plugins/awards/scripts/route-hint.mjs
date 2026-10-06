#!/usr/bin/env node
// UserPromptSubmit hint: when a prompt carries explicit award framing, print one line pointing at the
// awards skill that owns it. A hint, never a gate: it blocks nothing and is silent on every other
// prompt, including prompts in a project that already has AWARDS.md. AWARDS_HOOK=0 disables it.
// Usage (hook): stdin is the hook JSON with a "prompt" field; stdout becomes added context; exit 0.
//        node scripts/route-hint.mjs --selftest
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AWARD = /awwwards|award[- ]?(worthy|level|winning)|site of the (day|month|year)|immersive (site|website)/i;
const REVIEW = /\b(review|critique|judge|score|rate|evaluate|assess)\b|would (this|it) win|what is missing/i;
const BUILD = /\b(build|make|create)\b/i;
const WEBGL = /\b(webgl|three\.?js|shaders?|glsl|gltf|render targets?)\b/i;
const MOTION = /\b(gsap|scrolltrigger|timelines?|scroll-scrubbed|choreograph\w*)\b/i;
const IDEAS = /\b(directions|big idea|ideas)\b/i;
const NEW_SITE = /\b(a|an|new)\s+(?:[\w-]+\s+){0,3}(site|website|page|portfolio|landing|campaign)\b/i;
const PART = /\b(component|hero|nav|navigation|menu|cursor|footer|preloader|loader|button|gallery|slider|carousel|marquee|transition)\b/i;

export function hint(prompt) {
  if (typeof prompt !== 'string' || !AWARD.test(prompt)) return '';
  // First match wins. A part of an existing site ("the menu of this site") is a component job;
  // a new site that merely lists parts ("a site with a hero and a footer") stays with craft.
  const skill = REVIEW.test(prompt) && !BUILD.test(prompt) ? 'jury'
    : WEBGL.test(prompt) ? 'webgl'
    : MOTION.test(prompt) ? 'motion'
    : PART.test(prompt) && !NEW_SITE.test(prompt) ? 'component'
    : IDEAS.test(prompt) ? 'concept' : 'craft';
  return `awards: this request carries award framing; invoke the \`awards:${skill}\` skill with the Skill tool before planning or writing code, unless another awards skill fits the request better.`;
}

function selftest() {
  const assert = (ok, msg) => { if (!ok) { console.error(`FAIL ${msg}`); process.exitCode = 1; } };
  assert(hint('Build an Awwwards-level site for a ceramics studio').includes('awards:craft'), 'site -> craft');
  assert(hint('an award-worthy nav menu for our app').includes('awards:component'), 'component -> component');
  assert(hint('Is this award winning? Review the landing page').includes('awards:jury'), 'review -> jury');
  assert(hint('Build an award-level site, then judge it and ship it').includes('awards:craft'), 'build then judge -> craft');
  assert(hint('an immersive website with a hero and a footer').includes('awards:craft'), 'site with parts -> craft');
  assert(hint('Fix the state bug in the cart reducer') === '', 'silent without framing');
  assert(hint(undefined) === '', 'silent on missing prompt');
  assert(hint('Review the design of my site: is it award-worthy?').includes('awards:jury'), 'design as noun stays jury');
  assert(hint('Make the menu of this site award-worthy').includes('awards:component'), 'part of a site -> component');
  // The shipped routing cases: negatives stay silent; every award-framed case names a skill its own grader accepts.
  const evals = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'evals');
  const body = (c) => fs.readFileSync(path.join(evals, c, 'prompt.md'), 'utf8').split(/^---$/m).slice(2).join('---');
  for (const c of fs.readdirSync(evals).filter((d) => fs.existsSync(path.join(evals, d, 'prompt.md')))) {
    const line = hint(body(c));
    if (c.startsWith('no-trigger-')) { assert(line === '', `${c} silent`); continue; }
    const named = line.match(/awards:\w+/)?.[0];
    if (!named) continue;
    const gdir = path.join(evals, c, 'graders');
    for (const g of fs.existsSync(gdir) ? fs.readdirSync(gdir) : []) {
      const src = fs.readFileSync(path.join(gdir, g), 'utf8');
      const pat = /^tool: Skill$/m.test(src) && !/^match: not_contains$/m.test(src) && src.match(/^input_match: '(.+)'$/m)?.[1];
      if (pat) assert(new RegExp(pat).test(`"skill": "${named}"`), `${c} -> ${named}, grader ${g} wants another skill`);
    }
  }
  console.log(process.exitCode ? 'route-hint selftest failed' : 'route-hint selftest ok');
}

// Imported (e.g. by a test) it only exports hint(); stdin is read only when run as the hook.
const direct = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct && process.argv.includes('--selftest')) selftest();
else if (direct && process.env.AWARDS_HOOK !== '0') {
  let prompt;
  try { prompt = JSON.parse(fs.readFileSync(0, 'utf8')).prompt; } catch { /* no or bad input: stay silent */ }
  const line = hint(prompt);
  if (line) console.log(line);
}
