// The signature's driver: reads the score each tick and places the cable, the grapnel, the drag and the cut cable
// from the document's own geometry (the drawn strands, the seabed drawing, the cutaway drawing), so the GL lands where
// the static tier already is. Writes the bridge readouts. Without WebGL the same values move the drawn tier.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

const nf = new Intl.NumberFormat('en-GB');
const SEABED = { w: 1200, h: 420 };

export function createCable({ score, awards }) {
  const root = document.documentElement;
  const q = (sel) => document.querySelector(sel);
  const el = {
    faultStrand: q('.strand--fault'),
    bow: q('.bow__drawing'),
    descentStrand: q('.strand--descent'),
    located: q('#located'),
    scale: q('.depthscale'),
    drag: q('#drag'),
    stage: q('.drag__stage'),
    seabed: q('.seabed__drawing'),
    splice: q('#splice'),
    cutaway: q('.cutaway__drawing'),
    laid: q('#laid'),
    depth: q('[data-depth]'),
    wire: q('[data-wire]'),
    tension: q('[data-tension]'),
    reveal: q('.tension__reveal'),
    copy: q('.drag__copy'),
    dot: q('.pulse__dot'),
    svgWire: q('.seabed__wire'),
    svgGrapnel: q('.seabed__grapnel'),
    svgCable: q('.seabed__cable'),
  };
  let m = {};
  let scene = null;
  let shown = {};
  let frameOut = null;

  const docRect = (node) => {
    const r = node.getBoundingClientRect();
    return { top: r.top + scrollY, left: r.left, width: r.width, height: r.height, bottom: r.bottom + scrollY };
  };

  function measure() {
    const vh = innerHeight;
    const fault = docRect(el.faultStrand);
    const bow = docRect(el.bow);
    const unit = bow.width / 480; // the bow drawing's units to CSS pixels
    const descent = docRect(el.descentStrand);
    const located = docRect(el.located);
    const scale = docRect(el.scale);
    const drag = docRect(el.drag);
    const stage = el.stage.getBoundingClientRect();
    const seabed = el.seabed.getBoundingClientRect();
    const splice = docRect(el.splice);
    const cutaway = docRect(el.cutaway);
    const laid = docRect(el.laid);
    m = {
      vw: innerWidth, vh,
      // The cable's path in document pixels: along the deck at y 61, round the sheave (hub 127, 104) at radius 43,
      // down the leading edge at x 84 to the grapnel. The drop lands on the drawn strands' own line.
      path: {
        deckX: Math.max(innerWidth + 40, bow.left + 560 * unit),
        sheaveX: bow.left + 127 * unit,
        sheaveY: bow.top + 104 * unit,
        radius: 43 * unit,
        end: descent.bottom,
        width: fault.width,
      },
      x: fault.left + fault.width / 2,
      top: fault.top,
      end: descent.bottom,
      dragTop: drag.top, dragH: drag.height, stageH: el.stage.offsetHeight,
      seabed: { left: seabed.left, top: seabed.top - stage.top, width: seabed.width, height: seabed.height },
      copyBottom: el.copy.getBoundingClientRect().bottom - stage.top,
      cutaway,
    };
    score.measure([
      [0, 0],
      [located.top - vh * 0.5, 1],
      [located.bottom - vh * 0.5, 2],
      [scale.top - vh * 0.5, 2],
      [scale.bottom - vh * 0.5, 3],
      [drag.top, 3],
      [drag.bottom - vh, 4],
      [splice.top - vh * 0.25, 4.5],
      [cutaway.top - vh * 0.85, 4.5],
      [cutaway.top + cutaway.height / 2 - vh * 0.5, 5.5],
      [laid.top - vh * 0.5, 5.5],
      [laid.top + vh * 0.4, 6.5],
    ]);
    shown = {};
  }

  // Where the held drag stage is on screen: sticky at the top while its chapter passes.
  const stageTop = (y) => {
    const top = m.dragTop - y;
    if (top > 0) return top;
    const last = m.dragTop + m.dragH - m.stageH;
    return y <= last ? 0 : last - y;
  };

  // The seabed drawing's units to screen pixels, for a given stage position.
  const sea = (st) => ({
    x: (u) => m.seabed.left + (u / SEABED.w) * m.seabed.width,
    y: (u) => st + m.seabed.top + (u / SEABED.h) * m.seabed.height,
    s: m.seabed.width / SEABED.w,
  });

  function write(key, node, text) {
    if (shown[key] !== text) node.textContent = shown[key] = text;
  }

  function tick() {
    const y = scrollY;
    const s = score.update(y);
    const still = score.isReduced();
    write('depth', el.depth, `${nf.format(Math.round(s.depth))} m`);
    write('wire', el.wire, s.wire < 10 ? `${s.wire.toFixed(1)} m` : `${nf.format(Math.round(s.wire))} m`);
    write('tension', el.tension, `${s.tension.toFixed(1)} kN`);

    // The lay of the cable runs down the screen at the scroll's speed; the hero adds its 40 cm pay-out.
    const phase = still ? 0 : y + s.payout;
    const phaseKey = Math.round(phase);
    if (shown.phase !== phaseKey) { root.style.setProperty('--payout', `${phaseKey}px`); shown.phase = phaseKey; }

    // The located pulse runs out to the break by half way, and its echo comes home.
    const p = s.pulse < 0.5 ? s.pulse * 2 : (1 - s.pulse) * 2;
    const cx = (20 + 880 * p).toFixed(1);
    if (shown.cx !== cx) { el.dot.setAttribute('cx', cx); shown.cx = cx; }
    const reveal = (s.trace * 1200).toFixed(1);
    if (shown.trace !== reveal) { el.reveal.setAttribute('width', reveal); el.reveal.style.width = `${reveal}px`; shown.trace = reveal; }

    // The drag in seabed units: the grapnel's crown crosses from x 160 to the cable at 806; the wire leads ahead of
    // it to the ship; after the catch the hooked cable and the grapnel rise together.
    const gx = 160 + (806 - 160) * s.drag;
    const rise = 30 * s.lift;
    const dragKey = `${gx.toFixed(1)}|${rise.toFixed(1)}`;
    if (shown.drag !== dragKey) {
      shown.drag = dragKey;
      // Moved to the crown's place, then leaned 50° about the crown so the shank points up toward the wire.
      el.svgGrapnel.setAttribute('transform', `translate(${(gx - 160).toFixed(1)} ${(-rise).toFixed(1)}) rotate(50 160 298)`);
      el.svgCable.setAttribute('transform', `translate(0 ${(-rise).toFixed(1)})`);
      // The wire comes down from the ship, off the stage's top edge and ahead of the hook (the drawing overflows).
      const lead = (-m.seabed.top / m.seabed.height) * SEABED.h;
      el.svgWire.setAttribute('d', `M${(gx + 560).toFixed(1)} ${lead.toFixed(1)} C${(gx + 420).toFixed(1)} 110 ${(gx + 90).toFixed(1)} ${(262 - rise).toFixed(1)} ${(gx + 36).toFixed(1)} ${(264 - rise).toFixed(1)}`);
    }

    if (!scene) return;
    const st = stageTop(y);
    const sb = sea(st);
    const top = m.top - y;
    const end = m.end - y;
    const cut = { left: m.cutaway.left, top: m.cutaway.top - y, width: m.cutaway.width, height: m.cutaway.height };
    frameOut = {
      vw: m.vw, vh: m.vh, phase, scroll: y,
      cable: { visible: end > -80, path: m.path },
      grapnel: { visible: end > -120 && end < m.vh + 20, x: m.x, y: end },
      drag: {
        visible: st < m.vh && st + m.stageH > 0,
        crown: [sb.x(gx), sb.y(300 - rise)],
        // On a phone the copy runs the full width above the seabed, so the wire enters just under the copy instead.
        lead: [sb.x(gx + 560), m.vw < 768 ? st + m.copyBottom + 20 : st - 12],
        c1: [sb.x(gx + 420), sb.y(110)],
        c2: [sb.x(gx + 90), sb.y(262 - rise)],
        scale: Math.max(0.8, Math.min(1.9, sb.s * 1.6)),
      },
      cutaway: { visible: cut.top < m.vh && cut.top + cut.height > 0, ...cut, open: s.open },
    };
    if (scene.update(frameOut) === false) lose();
  }

  function lose() {
    scene = null;
    root.classList.remove('has-gl');
  }

  ScrollTrigger.addEventListener('refresh', measure);
  measure();
  gsap.ticker.add(tick);
  awards.addState(() => {
    const s = score.state;
    return {
      gl: !!scene,
      depth: Math.round(s.depth), wire: Math.round(s.wire), tension: Number(s.tension.toFixed(1)),
      label: score.label(), drag: Number(s.drag.toFixed(3)), open: Number(s.open.toFixed(3)),
    };
  });

  return {
    attach(next) {
      scene = next;
      tick();
      if (!scene) return false;
      root.classList.add('has-gl');
      return true;
    },
    measure,
    destroy() {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', measure);
      scene?.dispose();
      scene = null;
    },
  };
}
