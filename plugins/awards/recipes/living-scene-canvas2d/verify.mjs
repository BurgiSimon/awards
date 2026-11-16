// The scene idles only while it is on screen, answers the pointer, keeps what a click leaves, offers the same thing
// to the keyboard, and holds one still frame under reduced motion. page.hover and page.click scroll the canvas into
// view themselves, so the states that use them need no scroll of their own.
const canvas = '.scene canvas';
const pick = (name) => [{ type: 'click', selector: `[data-pick="${name}"]` }, { type: 'wait', ms: 200 }];

export const states = [
  { name: 'top', scroll: 0, settle: 400 },
  { name: 'lawn', settle: 300, actions: [{ type: 'hover', selector: canvas }, { type: 'wait', ms: 700 }] },
  { name: 'plant', settle: 300, frame: true, actions: [{ type: 'click', selector: canvas }, { type: 'wait', ms: 1500 }] },
  { name: 'keys', settle: 300, actions: [{ type: 'focus', selector: '[data-cue]' }, { type: 'press', key: 'Enter' }, { type: 'wait', ms: 300 }] },
  { name: 'sky', settle: 300, actions: [...pick('sky'), { type: 'click', selector: canvas }, { type: 'wait', ms: 400 }] },
  { name: 'pond', settle: 300, actions: [...pick('pond'), { type: 'click', selector: canvas }, { type: 'wait', ms: 150 }] },
  { name: 'rm', reducedMotion: true, settle: 300, actions: [{ type: 'click', selector: canvas }, { type: 'wait', ms: 300 }] },
  { name: 'rm-pond', reducedMotion: true, settle: 300, actions: [...pick('pond'), { type: 'click', selector: canvas }, { type: 'wait', ms: 300 }] },
  { name: 'mobile', viewport: 'mobile', settle: 300, actions: [{ type: 'click', selector: canvas }, { type: 'wait', ms: 400 }] },
];

// Two samples 250 ms apart: frames drawn in between, and whether the fish moved.
export async function probe() {
  const a = window.__awards.state();
  await new Promise((r) => setTimeout(r, 250));
  const b = window.__awards.state();
  const c = document.querySelector('.scene canvas');
  const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let inked = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 8) inked++;
  return {
    frames: b.frames - a.frames,
    swam: JSON.stringify(a.fish ?? null) !== JSON.stringify(b.fish ?? null),
    inked,
    ariaHidden: c.getAttribute('aria-hidden'),
    pressed: [...document.querySelectorAll('[data-pick][aria-pressed="true"]')].map((el) => el.dataset.pick).join(','),
    cue: document.querySelector('[data-cue]').textContent,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
}

export function assert(r) {
  const out = [];
  const s = (k) => r[k]?.state ?? {};
  const p = (k) => r[k]?.probe ?? {};

  out.push({ ok: s('top').scene === 'lawn' && s('top').running === false && p('top').frames === 0 && p('top').inked > 500, message: `off screen: drawn once, no loop, no frames spent (running ${s('top').running}, ${p('top').frames} frames in 250 ms)` });
  out.push({ ok: s('top').blades > 100 && s('top').flowers === 3 && p('top').pressed === 'lawn', message: `the lawn is seeded: ${s('top').blades} blades, ${s('top').flowers} flowers from the start` });

  out.push({ ok: s('lawn').running === true && p('lawn').frames >= 2, message: `on screen the loop runs (${p('lawn').frames} frames in 250 ms)` });
  out.push({ ok: s('top').lean === 0 && s('lawn').lean > 0.1, message: `blades lean away from a resting pointer (lean ${s('top').lean} → ${s('lawn').lean} rad)` });

  out.push({ ok: s('plant').flowers === 4 && /planted/i.test(s('plant').status ?? ''), message: `a click plants a flower and the status says so (${s('plant').flowers} flowers, "${s('plant').status}")` });
  out.push({ ok: s('keys').flowers === 4 && /planted/i.test(s('keys').status ?? ''), message: `the cue button does the same from the keyboard (${s('keys').flowers} flowers after Enter)` });

  const sky = s('sky');
  out.push({ ok: sky.scene === 'sky' && sky.stars > 50 && sky.sets === 1 && sky.edges >= 1 && p('sky').cue === 'Send a shooting star', message: `star chart: ${sky.stars} stars, a click holds one constellation (${sky.sets}) and the pointer joins ${sky.edges} lines` });

  const pond = s('pond');
  out.push({ ok: pond.scene === 'pond' && pond.fish?.length === 3 && pond.ripples >= 1 && p('pond').swam === true && p('pond').cue === 'Feed the koi', message: `koi pond: ${pond.fish?.length} fish swimming, a click leaves ${pond.ripples} ripple(s) and ${pond.pellets} pellet(s)` });

  const rm = s('rm');
  out.push({ ok: rm.motion === 'reduced' && rm.running === false && p('rm').frames === 0 && p('rm').inked > 500, message: `reduced motion: one still frame, no loop (${p('rm').frames} frames in 250 ms)` });
  out.push({ ok: rm.flowers === 4 && rm.lean === 0, message: `reduced motion: a click still plants, fully grown, and nothing leans (${rm.flowers} flowers)` });
  out.push({ ok: s('rm-pond').pellets === 0 && p('rm-pond').swam === false && /reduced motion/i.test(s('rm-pond').status ?? ''), message: `reduced motion: the koi hold their pose and the press says why ("${s('rm-pond').status}")` });

  const mb = s('mobile');
  out.push({ ok: mb.flowers === 4 && mb.running === true && p('mobile').overflow === false, message: `mobile: a tap plants (${mb.flowers} flowers), the breeze runs, no horizontal overflow` });
  out.push({ ok: ['top', 'sky', 'pond', 'rm', 'mobile'].every((k) => p(k).ariaHidden === 'true'), message: 'the canvas is aria-hidden in every scene' });
  return out;
}
