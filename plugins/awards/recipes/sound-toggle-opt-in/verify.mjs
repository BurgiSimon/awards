const RUNNING = 'window.__awards.state().context === "running"';
export const states = [
  // Nothing has been pressed: the recipe's central claim is that no AudioContext exists yet.
  { name: 'off', settle: 300 },
  { name: 'on', actions: [{ type: 'click', selector: '[data-sound]' }, { type: 'waitFor', fn: RUNNING }], settle: 100 },
  // Off suspends after the closing blip, so wait for the suspend rather than guessing its length.
  { name: 'again', actions: [
    { type: 'click', selector: '[data-sound]' }, { type: 'waitFor', fn: RUNNING },
    { type: 'click', selector: '[data-sound]' }, { type: 'waitFor', fn: 'window.__awards.state().context === "suspended"' },
  ], settle: 100 },
  // A remembered yes must come back armed, not playing: the reload happens inside this state because
  // every state otherwise gets its own browser context, and with it an empty localStorage.
  { name: 'stored', actions: [
    { type: 'click', selector: '[data-sound]' }, { type: 'waitFor', fn: RUNNING },
    { type: 'reload' },
  ], settle: 300 },
  { name: 'keyboard', actions: [{ type: 'focus', selector: '[data-sound]' }, { type: 'press', key: 'Enter' }, { type: 'waitFor', fn: RUNNING }], settle: 100 },
  { name: 'rm', reducedMotion: true, actions: [{ type: 'click', selector: '[data-sound]' }, { type: 'waitFor', fn: RUNNING }], settle: 200 },
  { name: 'mobile', viewport: 'mobile', actions: [{ type: 'click', selector: '[data-sound]' }, { type: 'waitFor', fn: RUNNING }], settle: 100 },
];
export function probe() {
  const b = document.querySelector('[data-sound]');
  return { pressed: b.getAttribute('aria-pressed'), name: b.textContent.trim(), tag: b.tagName };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.off.state?.sound === 'off' && r.off.state?.context === null, message: `no AudioContext before a gesture (context ${r.off.state?.context})` });
  out.push({ ok: r.off.probe?.pressed === 'false' && r.off.probe?.tag === 'BUTTON' && /off/i.test(r.off.probe?.name || ''), message: `a real button, off, with the state in its name ("${r.off.probe?.name}")` });
  out.push({ ok: r.on.state?.sound === 'on' && r.on.state?.context === 'running' && r.on.probe?.pressed === 'true', message: 'click starts the context and presses the button' });
  out.push({ ok: r.on.state?.stored === 'on' && /on/i.test(r.on.state?.name || ''), message: `the choice is stored and named ("${r.on.state?.name}")` });
  out.push({ ok: r.again.state?.sound === 'off' && r.again.state?.context === 'suspended' && r.again.probe?.pressed === 'false' && r.again.state?.stored === 'off', message: 'a second press suspends, unpresses and stores off' });
  out.push({ ok: r.stored.state?.sound === 'armed' && r.stored.state?.context === null && r.stored.probe?.pressed === 'true', message: `a remembered yes returns armed, still with no context (${r.stored.state?.sound}/${r.stored.state?.context})` });
  out.push({ ok: r.keyboard.state?.sound === 'on' && r.keyboard.state?.context === 'running', message: 'Enter on the focused button works' });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.sound === 'on' && r.rm.state?.meterAnimated === false, message: 'reduced motion: sound still works, the meter is not clocked' });
  out.push({ ok: r.mobile.state?.sound === 'on' && r.mobile.probe?.pressed === 'true', message: 'mobile toggles' });
  return out;
}
