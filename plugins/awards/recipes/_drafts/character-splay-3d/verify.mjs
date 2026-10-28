// The splay: at progress 0 every character carries no transform and sits exactly where it was set; part-way, depth and
// turn grow with each character's distance from the headline's centre (monotonic, signed by side and row) and the
// rendered matrices agree with what GSAP wrote; scrolling back lands every letter on its set position and opening it
// again repeats the same values; a narrower heading re-splits without leaking triggers; the heading keeps one
// accessible name; the closing heading shuts on entry; reduced motion fades without any 3D, static does nothing.
const heroAt = (p) => ({ type: 'waitFor', fn: `(() => { const h = document.querySelector('[data-splay-hero]'); const max = document.documentElement.scrollHeight - innerHeight; window.__awards.scrollTo((h.offsetTop + (h.offsetHeight - innerHeight) * ${p}) / max); return true; })()` });
const wait = (ms) => ({ type: 'wait', ms });
// Reduced and static: the hero is one screen tall and not held, so scroll it half-way off.
const heroHalfGone = { type: 'waitFor', fn: "(() => { const h = document.querySelector('[data-splay-hero]'); const max = document.documentElement.scrollHeight - innerHeight; window.__awards.scrollTo((h.offsetTop + h.offsetHeight * 0.5) / max); return true; })()" };

export const states = [
  { name: 'top', scroll: 0, settle: 700 },
  { name: 'open', frame: true, settle: 700, actions: [heroAt(0.6), wait(700)] },
  { name: 'back', settle: 700, actions: [heroAt(0.85), wait(500), heroAt(0), wait(700)] },
  { name: 'reopen', settle: 700, actions: [heroAt(0.85), wait(400), heroAt(0), wait(500), heroAt(0.6), wait(700)] },
  { name: 'resplit', settle: 700, actions: [{ type: 'waitFor', fn: "(() => { document.querySelector('#hero-t').style.maxWidth = '6ch'; return true; })()" }, wait(900), heroAt(0.6), wait(700)] },
  { name: 'end', scroll: 1, settle: 2200 },
  { name: 'rm', reducedMotion: true, settle: 700, actions: [heroHalfGone, wait(600)] },
  { name: 'static', settle: 700, actions: [{ type: 'waitFor', fn: "(document.documentElement.dataset.motion = 'static') === 'static'" }, wait(300), heroHalfGone, wait(600)] },
  { name: 'mobile', viewport: 'mobile', settle: 700, actions: [heroAt(0.6), wait(700)] },
];

export function probe() {
  const h1 = document.querySelector('#hero-t');
  const box = h1.getBoundingClientRect();
  const chars = [...h1.querySelectorAll('.splay-char')];
  const closeChars = [...document.querySelectorAll('#close-t .splay-char')];
  const mat = (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform);
  const ident = (m) => [m.m11 - 1, m.m12, m.m13, m.m14, m.m21, m.m22 - 1, m.m23, m.m24, m.m31, m.m32, m.m33 - 1, m.m34, m.m41, m.m42, m.m43, m.m44 - 1].every((v) => Math.abs(v) < 1e-6);
  const ms = chars.map(mat);
  const line = h1.querySelector('.splay-line');
  return {
    chars: chars.length,
    identity: ms.filter(ident).length,
    inline: chars.filter((c) => c.style.transform).length,
    z: ms.map((m) => Number(m.m43.toFixed(2))),
    pos: chars.map((c) => { const r = c.getBoundingClientRect(); return [Number((r.left - box.left).toFixed(2)), Number((r.top - box.top).toFixed(2))]; }),
    // Any element of the hero carrying a 3D transform (reduced and static must have none).
    threeD: [...document.querySelectorAll('[data-splay-hero], [data-splay-hero] *')].filter((el) => !mat(el).is2D).length,
    stageOpacity: Number(getComputedStyle(document.querySelector('[data-splay-stage]')).opacity),
    heroHeight: Math.round(document.querySelector('[data-splay-hero]').getBoundingClientRect().height),
    stagePosition: getComputedStyle(document.querySelector('[data-splay-stage]')).position,
    text: h1.textContent.replace(/\s+/g, ' ').trim(),
    parts: h1.querySelectorAll('.splay-line, .splay-word, .splay-char').length,
    hiddenParts: h1.querySelectorAll('.splay-line[aria-hidden="true"], .splay-word[aria-hidden="true"], .splay-char[aria-hidden="true"]').length,
    linePerspective: line ? getComputedStyle(line).perspective : null,
    closeChars: closeChars.length,
    closeIdentity: closeChars.filter((c) => ident(mat(c))).length,
    closeInline: closeChars.filter((c) => c.style.transform).length,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

// Node side: the accessibility tree of <main>, to count how the heading is named.
export async function inspect(page, st) {
  if (!['top', 'open', 'resplit', 'rm', 'mobile'].includes(st.name)) return null;
  return { snap: await page.locator('main').ariaSnapshot() };
}

const SENTENCE = 'Every fan opens from its centre.';

export function assert(r) {
  const s = (n) => r[n]?.state ?? {};
  const p = (n) => r[n]?.probe ?? {};
  const out = [];

  // Distance → depth and turn, monotonic; signs by side and row; rendered depth = written depth.
  const fan = (n) => {
    const smp = [...(s(n).samples ?? [])].sort((a, b) => a.d - b.d);
    const mono = (k) => smp.every((c, i) => i === 0 || Math.abs(c[k]) >= Math.abs(smp[i - 1][k]) - 0.05);
    const mean = (arr, k) => arr.reduce((t, c) => t + Math.abs(c[k]), 0) / Math.max(1, arr.length);
    const centre = smp.filter((c) => c.d < 0.2), outer = smp.filter((c) => c.d > 0.6);
    const signs = smp.filter((c) => c.d > 0.05).every((c) => Math.sign(c.x) === c.s && Math.sign(c.ry) === c.s && (c.v === 0 ? c.rx === 0 : Math.sign(c.rx) === -Math.sign(c.v)));
    const zs = p(n).z ?? [];
    const rendered = (s(n).samples ?? []).every((c, i) => Math.abs(zs[i] - c.z) < 0.5);
    return { n: smp.length, mono: mono('z') && mono('ry'), cz: mean(centre, 'z'), oz: mean(outer, 'z'), cry: mean(centre, 'ry'), ory: mean(outer, 'ry'), signs, rendered, centre: centre.length, outer: outer.length };
  };
  // The hero section is labelled by its heading, so its region line repeats the name; every other line must not.
  const named = (n) => {
    const lines = (r[n]?.inspect?.snap ?? '').split('\n').filter((l) => !/^\s*- region /.test(l)).join('\n');
    return lines.split(SENTENCE).length - 1 === 1 && lines.includes(`heading "${SENTENCE}" [level=1]`);
  };

  const t = s('top'), tp = p('top');
  out.push({ ok: t.motion === 'full' && t.chars > 20 && t.lines >= 2 && tp.identity === tp.chars && tp.inline === 0 && t.rest === true && t.progress === 0, message: `top: ${t.chars} characters on ${t.lines} lines, every transform identity (${tp.identity}/${tp.chars}), none written inline (${tp.inline}), progress ${t.progress}` });
  out.push({ ok: named('top') && t.label === SENTENCE && tp.text === SENTENCE && tp.hiddenParts === tp.parts && tp.parts > t.chars, message: `top: the h1 is named once by the full sentence (aria-label "${t.label}"), its ${tp.parts} split parts all aria-hidden (${tp.hiddenParts})` });
  out.push({ ok: tp.linePerspective === t.perspective && /^\d+px$/.test(t.perspective ?? ''), message: `top: each line carries the perspective set from the headline's width (${tp.linePerspective} = ${t.perspective})` });

  const o = s('open'), of = fan('open');
  out.push({ ok: o.progress > 0.5 && o.progress < 0.7 && o.rest === false && p('open').identity < 3, message: `open: part-way through the hero (progress ${o.progress}), ${p('open').chars - p('open').identity} of ${p('open').chars} characters transformed` });
  out.push({ ok: of.mono && of.centre > 0 && of.outer > 0, message: `open: |translateZ| and |rotateY| never fall as distance from the centre grows (${of.n} characters, ${of.centre} central, ${of.outer} outer)` });
  out.push({ ok: of.oz > 5 * of.cz && of.oz > 40 && of.ory > 5 * of.cry, message: `open: outer characters come ${of.oz.toFixed(1)} px forward and turn ${of.ory.toFixed(1)}°, central ones ${of.cz.toFixed(1)} px and ${of.cry.toFixed(1)}°` });
  out.push({ ok: of.signs, message: 'open: each character spreads and turns towards its own side (x and rotateY signed by side), rows tip by their place above or below the middle (rotateX)' });
  out.push({ ok: of.rendered, message: 'open: the rendered matrices carry the depth GSAP wrote (m43 = z within 0.5 px for every character)' });
  out.push({ ok: named('open'), message: 'open: mid-splay, the heading is still named once by the full sentence' });

  const b = s('back'), bp = p('back');
  const laid = (b.samples ?? []).map((c) => c.laid);
  const dev = Math.max(...(bp.pos ?? []).map((q, i) => Math.hypot(q[0] - (laid[i]?.[0] ?? 1e9), q[1] - (laid[i]?.[1] ?? 1e9))));
  out.push({ ok: b.progress === 0 && bp.identity === bp.chars && bp.inline === 0 && dev < 0.5, message: `back: after opening to 0.85 and scrolling back, every transform is identity (${bp.identity}/${bp.chars}), cleared inline, and every letter within ${dev.toFixed(3)} px of its set position` });

  const ro = s('reopen').samples ?? [], os = o.samples ?? [];
  const reDiff = Math.max(...ro.map((c, i) => Math.max(Math.abs(c.z - (os[i]?.z ?? 1e9)), Math.abs(c.ry - (os[i]?.ry ?? 1e9)))));
  out.push({ ok: ro.length === os.length && reDiff < 0.5, message: `reopen: opening again after a full close repeats the same values (max difference ${reDiff.toFixed(3)})` });

  const rs = s('resplit'), rf = fan('resplit');
  out.push({ ok: rs.splits > t.splits && rs.lines > t.lines && rs.chars === t.chars && rs.triggers === t.triggers && rs.label === SENTENCE && named('resplit'), message: `resplit: a narrower heading re-splits (${t.splits} → ${rs.splits} splits, ${t.lines} → ${rs.lines} lines, ${rs.chars} characters), triggers unchanged (${t.triggers} → ${rs.triggers}), one accessible name` });
  out.push({ ok: rf.mono && rf.oz > 5 * rf.cz && rf.rendered, message: `resplit: the new lines splay from the same rule (outer ${rf.oz.toFixed(1)} px vs centre ${rf.cz.toFixed(1)} px, monotonic)` });

  const e = s('end'), ep = p('end');
  out.push({ ok: e.progress === 1 && e.enterDone === true && ep.closeChars > 10 && ep.closeIdentity === ep.closeChars && ep.closeInline === 0, message: `end: the hero is fully open (progress ${e.progress}); the closing heading has played shut (${ep.closeIdentity}/${ep.closeChars} identity, ${ep.closeInline} inline)` });

  const rm = s('rm'), rmp = p('rm');
  out.push({ ok: rm.motion === 'reduced' && rmp.chars === 0 && rmp.threeD === 0 && rm.progress > 0.3 && rm.progress < 0.7 && rmp.stageOpacity > 0.2 && rmp.stageOpacity < 0.8 && named('rm'), message: `reduced motion: no split (${rmp.chars} characters), no 3D transform anywhere in the hero (${rmp.threeD}), the stage fades as the hero leaves (opacity ${rmp.stageOpacity?.toFixed(2)} at ${rm.progress}), heading named once` });
  out.push({ ok: rmp.stagePosition === 'relative' && rmp.heroHeight <= 900 && (p('top').heroHeight ?? 0) > 2000, message: `reduced motion: nothing holds the scroll (hero ${rmp.heroHeight} px tall, stage ${rmp.stagePosition}; ${p('top').heroHeight} px with a sticky stage in the full tier)` });
  const st = s('static'), stp = p('static');
  out.push({ ok: st.motion === 'static' && stp.chars === 0 && stp.threeD === 0 && stp.stageOpacity === 1 && stp.stagePosition === 'relative', message: `static: switched live, the split is reverted (${stp.chars} characters), no 3D, no fade (opacity ${stp.stageOpacity}), the stage released (${stp.stagePosition})` });

  const m = s('mobile'), mf = fan('mobile');
  out.push({ ok: m.chars > 20 && mf.mono && mf.oz > 5 * mf.cz && (p('mobile').overflowX ?? 1) <= 0 && named('mobile'), message: `mobile: ${m.chars} characters on ${m.lines} lines splay by the same rule (outer ${mf.oz.toFixed(1)} px vs centre ${mf.cz.toFixed(1)} px), no sideways overflow (${p('mobile').overflowX})` });
  out.push({ ok: ['top', 'open', 'end', 'rm'].every((n) => (p(n).overflowX ?? 1) <= 0), message: 'desktop and reduced motion: no sideways overflow while open, closed or fading' });
  return out;
}
