import Matter from 'matter-js';
import { awards } from '../_shared/awards-hook.js';
import { ticker } from '../_shared/raf.js';
import { motionTier, onMotionTierChange, syncMotionTierAttribute } from '../_shared/reduced-motion.js';

const { Engine, Bodies, Body, Composite, Events, Sleeping, Mouse, MouseConstraint } = Matter;
syncMotionTierAttribute();

const STEP = 1000 / 60;          // fixed step, ms: the same pile on a 60 Hz laptop and a 120 Hz phone
const MAX_STEPS = 4;             // per frame; a slow or hidden-then-shown frame drops time instead of spiralling
const GRAVITY = 2.4;             // × Matter's .001 scale
const WALL = 400;                // static walls this thick never let a fast body tunnel out
const MAX_AWAKE = 600;           // steps (10 s) awake with no hand on a body before the pile is put to sleep
const TOSS = { up: -14, side: 9, lift: -6, spin: 0.12 };   // px / step and rad / step at the 60 Hz base step
const BODY = { restitution: 0.12, friction: 0.6, frictionStatic: 0.9, frictionAir: 0.015, density: 0.002, sleepThreshold: 40 };

const box = document.querySelector('[data-pile]');
const list = box.querySelector('[data-pile-list]');
const hint = document.querySelector('[data-pile-hint]');
const items = [...list.children].map((el, index) => ({ el, index, word: el.textContent.trim(), shape: el.dataset.shape || 'pill', body: null, w: 0, h: 0, drawn: '' }));
const fine = matchMedia('(pointer: fine)');
const HINT_FLOW = hint.textContent;

// Seeded so every load drops the same pile: the drop order, x and tilt come from this, never Math.random.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let sim = null;
const stats = { engines: 0, steps: 0, wakes: 0, resizes: 0, forcedSleeps: 0, drag: null, nudges: [] };

// Full tier: build the toy. Reduced and static: leave the list as the CSS lays it out, no engine at all.
function build(tier) {
  sim?.destroy();
  sim = null;
  box.dataset.tier = tier;
  if (tier !== 'full') {
    hint.textContent = tier === 'reduced' ? 'Reduced motion is on, so nothing falls: the drawer is laid out as it would settle.' : HINT_FLOW;
    return;
  }
  sim = createSim();
}

function createSim() {
  const ac = new AbortController();
  const { signal } = ac;
  const random = rng(9);
  const pad = () => parseFloat(getComputedStyle(box).getPropertyValue('--pad')) || 10;
  let W = 0, H = 0, P = 10;
  let engine = null, walls = [], ceiling = null, mouse = null, mc = null;
  let started = false, asleep = false, visible = false, attached = false, acc = 0, awakeSteps = 0;
  let press = null;

  // Each list item gets a real button: the piece is operable, and the label is still the word.
  for (const it of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = it.word;
    b.setAttribute('aria-describedby', 'pile-hint');
    it.el.replaceChildren(b);
  }
  box.dataset.sim = '';
  hint.textContent = fine.matches
    ? 'Drag a piece with the mouse. From the keyboard, Tab to one and press Enter or Space to toss it; the left and right arrows push it sideways.'
    : 'Tap a piece to toss it. From a keyboard, Tab to one and press Enter or Space; the left and right arrows push it sideways.';

  function measure() {
    const r = list.getBoundingClientRect();
    W = r.width; H = r.height; P = pad();
    for (const it of items) { it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; }
  }
  const gap = () => Math.max(...items.map((it) => it.h)) + 24;

  // Before the box is in view every piece waits above it, out of sight behind the clip, in its drop slot.
  function dropSlots() {
    const order = items.map((it) => it.index);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    // Stratified x: the k-th piece to fall aims at the k-th of n bands across the floor, so the pile spreads
    // instead of heaping wherever the dice cluster. Bands are visited in a second shuffled order.
    const bands = items.map((_, k) => k);
    for (let i = bands.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [bands[i], bands[j]] = [bands[j], bands[i]]; }
    const slots = [];
    order.forEach((index, k) => {
      const it = items[index];
      const centre = P + ((bands[k] + 0.2 + random() * 0.6) / items.length) * (W - 2 * P);
      const x = Math.min(W - P - it.w / 2, Math.max(P + it.w / 2, centre));
      slots[index] = { x, y: -(k + 1) * gap(), a: (random() - 0.5) * 0.6 };
    });
    return slots;
  }
  // Where the CSS arrangement puts each piece: centre and tilt, read with the simulation styles off for one layout.
  function flowSlots() {
    for (const it of items) { it.el.style.transform = ''; it.drawn = ''; }
    delete box.dataset.sim;
    const o = list.getBoundingClientRect();
    const slots = items.map((it) => {
      const r = it.el.getBoundingClientRect();
      const tilt = new DOMMatrix(getComputedStyle(it.el).transform);
      return { x: r.left + r.width / 2 - o.left, y: r.top + r.height / 2 - o.top, a: Math.atan2(tilt.b, tilt.a) };
    });
    box.dataset.sim = '';
    return slots;
  }
  function place(it, x, y, a) {
    const t = `translate(${(x - it.w / 2).toFixed(2)}px, ${(y - it.h / 2).toFixed(2)}px) rotate(${a.toFixed(4)}rad)`;
    if (t !== it.drawn) { it.el.style.transform = t; it.drawn = t; }
  }

  function makeBody(it, x, y, a) {
    const opts = { ...BODY, angle: a, label: it.word };
    const b = it.shape === 'circle'
      ? Bodies.circle(x, y, it.w / 2, opts, 40)
      : Bodies.rectangle(x, y, it.w, it.h, { ...opts, chamfer: { radius: it.shape === 'pill' ? Math.min(it.w, it.h) / 2 - 0.5 : 6 } });
    b.plugin.item = it;
    return b;
  }

  // Walls sit P inside the clip edge; the side walls reach far above the box so the waiting pieces fall in between them.
  function buildWalls() {
    if (walls.length) Composite.remove(engine.world, walls);
    const rise = (items.length + 2) * gap();
    const tall = H + WALL + rise;
    const opts = { isStatic: true, friction: 0.6, label: 'wall' };
    walls = [
      Bodies.rectangle(W / 2, H - P + WALL / 2, W + 2 * WALL, WALL, opts),
      Bodies.rectangle(P - WALL / 2, (H + WALL - rise) / 2, WALL, tall, opts),
      Bodies.rectangle(W - P + WALL / 2, (H + WALL - rise) / 2, WALL, tall, opts),
    ];
    if (ceiling) walls.push(ceiling = Bodies.rectangle(W / 2, P - WALL / 2, W + 2 * WALL, WALL, opts));
    Composite.add(engine.world, walls);
  }
  function closeLid() {
    ceiling = Bodies.rectangle(W / 2, P - WALL / 2, W + 2 * WALL, WALL, { isStatic: true, friction: 0.6, label: 'wall' });
    walls.push(ceiling);
    Composite.add(engine.world, ceiling);
  }

  function start(fromFlow = false) {
    if (started) return;
    started = true;
    const flow = fromFlow ? flowSlots() : null;
    measure();
    engine = Engine.create({ gravity: { x: 0, y: GRAVITY }, enableSleeping: true, positionIterations: 8, velocityIterations: 6 });
    stats.engines++;
    buildWalls();
    const slots = flow ?? dropSlots();
    stats.startedFrom = flow ? 'flow' : 'drop';
    for (const it of items) it.body = makeBody(it, slots[it.index].x, slots[it.index].y, slots[it.index].a);
    Composite.add(engine.world, items.map((it) => it.body));
    if (fine.matches) attachMouse();
    Events.on(engine, 'beforeUpdate', clampMouse);
    draw();
    wake('start');
  }

  // Pointer drag on fine pointers only, through a MouseConstraint bound to the list (the box's frame).
  function attachMouse() {
    mouse = Mouse.create(list);
    // Mouse.create also takes the wheel (preventDefault) and touch events: hand both back to the page.
    list.removeEventListener('wheel', mouse.mousewheel);
    list.removeEventListener('touchmove', mouse.mousemove);
    list.removeEventListener('touchstart', mouse.mousedown);
    list.removeEventListener('touchend', mouse.mouseup);
    mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, damping: 0.1, angularStiffness: 0 } });
    Composite.add(engine.world, mc);
    box.dataset.drag = '';
    Events.on(mc, 'startdrag', ({ body }) => {
      const it = body.plugin.item;
      stats.drag = { index: it.index, word: it.word, from: pt(body.position), to: null, maxDist: 0 };
    });
    Events.on(mc, 'enddrag', ({ body }) => { if (stats.drag) stats.drag.to = pt(body.position); });
    // A release or a move outside the box still reaches the constraint, so a piece is never left stuck to the hand.
    window.addEventListener('mouseup', (e) => { if (mouse.button === 0 && !list.contains(e.target)) mouse.mouseup(e); }, { signal });
    window.addEventListener('mousemove', (e) => { if (mc.body && !list.contains(e.target)) mouse.mousemove(e); }, { signal });
    // A button released outside the window never reports; losing focus lets go, so the pile can sleep again.
    window.addEventListener('blur', () => { mouse.button = -1; delete box.dataset.holding; }, { signal });
  }
  function clampMouse() {
    if (!mouse) return;
    mouse.position.x = Math.min(W - P, Math.max(P, mouse.position.x));
    mouse.position.y = Math.min(H - P, Math.max(P, mouse.position.y));
  }

  function wake(reason) {
    if (!engine) return;
    asleep = false;
    awakeSteps = 0;
    stats.wakes++;
    stats.lastWake = reason;
    sync();
  }
  // On the ticker only while there is something to step and someone to see it.
  function sync() {
    const want = started && !asleep && visible;
    if (want && !attached) { acc = 0; ticker.add(tick); attached = true; }
    if (!want && attached) { ticker.remove(tick); attached = false; }
  }

  function tick(dt) {
    acc = Math.min(acc + dt * 1000, STEP * MAX_STEPS);
    while (acc >= STEP) {
      Engine.update(engine, STEP);
      acc -= STEP;
      stats.steps++;
      awakeSteps++;
      afterStep();
    }
    draw();
    const holding = mouse?.button === 0 || !!mc?.body;
    const resting = items.every((it) => it.body.isSleeping);
    if (!holding && !resting && awakeSteps > MAX_AWAKE) {
      // A pile that keeps trading micro-jitters is put to sleep rather than stepped for ever.
      for (const it of items) Sleeping.set(it.body, true);
      stats.forcedSleeps++;
    }
    if (!holding && items.every((it) => it.body.isSleeping)) {
      asleep = true;
      draw();
      sync();
    }
  }

  function afterStep() {
    if (!ceiling && items.every((it) => it.body.bounds.min.y > P + 1)) closeLid();
    if (mc?.body && stats.drag) {
      const p = mc.body.position, f = stats.drag.from;
      stats.drag.maxDist = Math.max(stats.drag.maxDist, Math.hypot(p.x - f.x, p.y - f.y));
    }
    for (const n of stats.nudges) {
      if (n.done) continue;
      const b = items[n.index].body;
      n.minY = Math.min(n.minY, b.position.y);
      n.minX = Math.min(n.minX, b.position.x);
      n.maxX = Math.max(n.maxX, b.position.x);
      if (b.isSleeping) n.done = true;
    }
  }

  function draw() {
    for (const it of items) place(it, it.body.position.x, it.body.position.y, it.body.angle);
  }

  // Keyboard and tap path: Enter / Space (a click) tosses the piece up, the arrows push it sideways.
  function nudge(it, dir, via) {
    const b = it.body;
    Sleeping.set(b, false);
    const s = (random() - 0.5) * 2;
    if (dir === 'up') Body.setVelocity(b, { x: s * 2, y: TOSS.up });
    else Body.setVelocity(b, { x: dir === 'left' ? -TOSS.side : TOSS.side, y: TOSS.lift });
    Body.setAngularVelocity(b, s * TOSS.spin);
    const p = pt(b.position);
    stats.nudges.push({ index: it.index, word: it.word, dir, via, x0: p.x, y0: p.y, minY: p.y, minX: p.x, maxX: p.x, done: false });
    wake('nudge');
  }
  const itemOf = (target) => items.find((it) => it.el.contains(target));

  list.addEventListener('click', (e) => {
    const it = itemOf(e.target);
    if (!it || !it.body) return;
    // A mouse press that travelled was a drag, not a toss; keyboard clicks have detail 0.
    if (e.detail > 0 && press?.moved) return;
    nudge(it, 'up', e.detail === 0 ? 'keyboard' : 'pointer');
  }, { signal });
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const it = itemOf(e.target);
    if (!it || !it.body) return;
    e.preventDefault();
    nudge(it, e.key === 'ArrowLeft' ? 'left' : 'right', 'keyboard');
  }, { signal });
  list.addEventListener('pointerdown', (e) => {
    press = { x: e.clientX, y: e.clientY, moved: false };
    if (e.pointerType === 'mouse' && e.button === 0 && mc) { box.dataset.holding = ''; wake('press'); }
  }, { signal });
  window.addEventListener('pointermove', (e) => { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 5) press.moved = true; }, { signal });
  window.addEventListener('pointerup', () => { delete box.dataset.holding; }, { signal });
  // Tab into the pieces before the drop: they start from the laid-out arrangement inside the box instead. The
  // browser's own focus scroll measured the piece where it waited, above the clip, so bring the piece itself into
  // view (or the box, for a piece still falling in) once it has a place.
  list.addEventListener('focusin', (e) => {
    const fresh = !started;
    if (fresh) start(true);
    const it = itemOf(e.target);
    if (!it?.body) return;
    if (fresh || it.body.position.y < 0) box.scrollIntoView({ block: 'center' });
    it.el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, { signal });

  // Start once 30 % of the box is on screen; pause the steps while it is off screen.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && entry.intersectionRatio >= 0.3) start();
    sync();
  }, { threshold: [0, 0.3] });

  // A change in the box's size rebuilds the walls, re-measures the pieces and wakes the pile.
  const ro = new ResizeObserver(() => {
    const r = list.getBoundingClientRect();
    if (Math.abs(r.width - W) < 1 && Math.abs(r.height - H) < 1) return;
    if (!started) { measure(); return parkAll(); }
    const before = items.map((it) => ({ w: it.w, h: it.h }));
    measure();
    buildWalls();
    for (const it of items) {
      let b = it.body;
      if (Math.abs(before[it.index].w - it.w) > 1 || Math.abs(before[it.index].h - it.h) > 1) {
        Composite.remove(engine.world, b);
        b = it.body = makeBody(it, b.position.x, b.position.y, b.angle);
        Composite.add(engine.world, b);
      }
      const hw = (b.bounds.max.x - b.bounds.min.x) / 2;
      const hh = (b.bounds.max.y - b.bounds.min.y) / 2;
      const x = Math.min(W - P - hw, Math.max(P + hw, b.position.x));
      const y = Math.min(H - P - hh, b.position.y);
      if (x !== b.position.x || y !== b.position.y) Body.setPosition(b, { x, y }, false);
      Sleeping.set(b, false);
    }
    stats.resizes++;
    wake('resize');
  });

  function parkAll() {
    const slots = dropSlots();
    for (const it of items) place(it, slots[it.index].x, slots[it.index].y, slots[it.index].a);
  }

  measure();
  parkAll();
  io.observe(box);
  ro.observe(list);
  if (!('IntersectionObserver' in window)) { visible = true; start(); }

  return {
    state() {
      return {
        mode: 'sim',
        started,
        startedFrom: stats.startedFrom ?? null,
        engine: !!engine,
        sleeping: started && asleep,
        running: attached,
        visible,
        lid: !!ceiling,
        dragEnabled: !!mc,
        box: { w: Math.round(W), h: Math.round(H), pad: P },
        bodies: items.map((it) => it.body ? { ...pt(it.body.position), a: Number(it.body.angle.toFixed(4)), sleeping: it.body.isSleeping } : null),
      };
    },
    destroy() {
      ac.abort();
      io.disconnect();
      ro.disconnect();
      if (attached) ticker.remove(tick);
      if (mouse) for (const [type, fn] of [['mousemove', mouse.mousemove], ['mousedown', mouse.mousedown], ['mouseup', mouse.mouseup]]) list.removeEventListener(type, fn);
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
      for (const it of items) { it.el.textContent = it.word; it.el.style.transform = ''; it.drawn = ''; it.body = null; }
      delete box.dataset.sim;
      delete box.dataset.drag;
      delete box.dataset.holding;
    },
  };
}

const pt = (p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 });

await document.fonts.ready;   // piece sizes depend on the real face
build(motionTier());
onMotionTierChange(build);

awards.addState(() => ({
  motion: motionTier(),
  words: items.map((it) => it.word),
  ...(sim ? sim.state() : { mode: 'flow', started: false, engine: false, sleeping: false, running: false, dragEnabled: false }),
  engines: stats.engines,
  steps: stats.steps,
  wakes: stats.wakes,
  lastWake: stats.lastWake ?? null,
  resizes: stats.resizes,
  forcedSleeps: stats.forcedSleeps,
  drag: stats.drag,
  nudges: stats.nudges,
}));
awards.ready();
