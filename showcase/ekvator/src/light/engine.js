// The borrowed day. Scroll position is read as the borrowed city's clock; every frame the clock becomes a real
// solar position, the position becomes light on the wall and shadows under the type, and the page's numbers
// are rewritten for the city and day it is read in. Nothing here writes to the scroll.
import gsap from 'gsap';
import { sunDay, sunPosition, clock, CITIES } from '../lib/sun.js';
import { chapterTimes, facts, fmtElevation, fmtAzimuth, fmtKelvin, cityById } from '../lib/facts.js';
import { lightState, patchPolygons, litFraction, ambient, linearToCss, mix } from './geometry.js';

const MIN = 60000;
const NIGHT_BELOW = -3;
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createDay({ tier: initialTier, wall = null, announce = () => {} }) {
  let tier = initialTier;
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const room = document.querySelector('.room');
  const cast = [...document.querySelectorAll('[data-cast]')];
  const ticks = [...document.querySelectorAll('.hourline__ticks a')];
  const sunMark = document.querySelector('.hourline__sun');
  const cityLabel = document.querySelector('[data-city-clock]');
  const chapters = Object.fromEntries([...document.querySelectorAll('[data-chapter-at]')].map((el) => [el.dataset.chapterAt, el]));
  const panel = document.querySelector('.reserve__panel');

  const params = new URLSearchParams(location.search);
  let city = cityById(params.get('city') || 'lisbon');
  let day;
  let times;
  let anchors = [];
  let tickAnchors = [];
  let vh = innerHeight;
  let vw = innerWidth;
  let theme = root.dataset.theme || 'day';
  const mixes = { night: theme === 'night' ? 1 : 0, on: 0 };
  let last = {};
  let dirty = true;
  let state = {};

  function computeDay() {
    const now = Date.now();
    day = sunDay(now, city);
    times = chapterTimes(day);
    // The minute after sunset at which the wall turns to twilight: the reserve chapter enters there.
    let t = day.set;
    while (sunPosition(t, city.lat, city.lon).elevation > NIGHT_BELOW - 0.2 && t < day.set + 90 * MIN) t += MIN;
    times.dusk = t;
    times.polarIn = times.morning + 0.45 * (times.noon - times.morning);
    times.polarOut = times.morning + 0.7 * (times.noon - times.morning);
    writeFacts(now);
  }

  function writeFacts(now) {
    const f = facts(now, city);
    for (const el of document.querySelectorAll('[data-sun]')) {
      const key = el.dataset.sun;
      if (key.startsWith('now-')) continue; // the readout is the scroll clock, written per frame
      if (key in f && el.textContent !== f[key]) el.textContent = f[key];
    }
    for (const el of document.querySelectorAll('[data-city-name]')) el.textContent = city.name;
    for (const el of document.querySelectorAll('[data-city-line]')) {
      const v = f[`line-${el.dataset.cityLine}`];
      if (v) el.textContent = v;
    }
  }

  const top = (el) => el.getBoundingClientRect().top + scrollY;

  function measure() {
    vh = innerHeight;
    vw = innerWidth;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const c = chapters;
    const pTop = top(c['polar-night']);
    const pBottom = pTop + c['polar-night'].offsetHeight;
    const list = [
      [0, times['first-light'], 'first-light'],
      [top(c.morning) - 0.3 * vh, times.morning, 'morning'],
      [pTop, times.polarIn, 'polar-night'],
      [pBottom - vh, times.polarOut, null],
      [top(c.noon) - 0.3 * vh, times.noon, 'noon'],
      [top(c.afternoon) - 0.3 * vh, times.afternoon, 'afternoon'],
      [top(c.reserve) - vh, times.dusk, null],
      [top(c.reserve) - 0.2 * vh, times.reserve, 'reserve'],
      [max, times.end, null],
    ];
    anchors = [];
    for (const [y, t, name] of list) {
      const prev = anchors[anchors.length - 1];
      const yy = Math.min(max, Math.max(prev ? prev.y + 1 : 0, y));
      anchors.push({ y: yy, t: Math.max(prev ? prev.t : t, t), name });
    }
    tickAnchors = anchors.filter((a) => a.name);
    dirty = true;
  }

  function timeAt(y) {
    if (tier !== 'full') {
      // Reduced and static: the light steps to the hour of the chapter being read.
      let a = anchors[0];
      for (const b of anchors) if (b.name && y + vh * 0.35 >= b.y) a = b;
      return a.t;
    }
    for (let i = 1; i < anchors.length; i += 1) {
      const a = anchors[i - 1];
      const b = anchors[i];
      if (y <= b.y) return a.t + ((y - a.y) / Math.max(1, b.y - a.y)) * (b.t - a.t);
    }
    return anchors[anchors.length - 1].t;
  }

  function polarDark() {
    const r = chapters['polar-night'].getBoundingClientRect();
    if (tier !== 'full') return r.top < vh * 0.5 && r.bottom > vh * 0.5 ? 1 : 0;
    // Dark before the stage's words can be seen, and dark until the last of them has gone.
    const enter = smooth(vh * 0.95, vh * 0.72, r.top);
    const leave = smooth(0, vh * 0.3, r.bottom);
    return Math.min(enter, leave);
  }

  function setTheme(next) {
    if (next === theme) return;
    theme = next;
    root.dataset.theme = next;
    metaTheme?.setAttribute('content', next === 'night' ? '#192030' : '#e7e4dd');
    const dur = tier === 'full' ? 0.42 : 0.2;
    gsap.to(mixes, { night: next === 'night' ? 1 : 0, duration: dur, ease: 'sine.inOut', onUpdate: () => { dirty = true; } });
  }

  function frame() {
    const y = window.lenis ? window.lenis.scroll : scrollY;
    const t = timeAt(y);
    const pos = sunPosition(t, city.lat, city.lon);
    const noonAz = sunPosition(day.noon, city.lat, city.lon).azimuth;
    const dark = polarDark();
    setTheme(pos.elevation < NIGHT_BELOW || dark > 0.5 ? 'night' : 'day');

    const key = `${Math.round(t / 20000)}|${dark.toFixed(3)}|${mixes.night.toFixed(3)}|${mixes.on.toFixed(3)}|${vw}x${vh}|${Math.round(y)}`;
    if (!dirty && key === last.key) return;
    dirty = false;
    last.key = key;

    const sun = { elevation: pos.elevation, azimuth: pos.azimuth, noonAzimuth: noonAz };
    const L = lightState(sun, { w: vw, h: vh }, mixes.on * (1 - dark));
    const amb = ambient(pos.elevation, Math.max(mixes.night, dark));

    // Shadows: cast by the patch where it reaches the letters, faintly by the sky elsewhere.
    const sky = 0.1 * (1 - Math.max(mixes.night, dark));
    for (const el of cast) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      const lit = litFraction(r, L.patch);
      const a = Math.min(0.5, sky + 0.4 * lit * L.intensity);
      el.style.setProperty('--cast', `${L.shadow.x.toFixed(3)}em ${L.shadow.y.toFixed(3)}em ${L.shadow.blur.toFixed(3)}em rgb(21 26 34 / ${a.toFixed(3)})`);
    }

    // The close: the drawn panel glows with its own evening light once the borrowed sun has gone.
    let glow = null;
    if (panel) {
      const r = panel.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) glow = { x: r.left, y: r.top, w: r.width, h: r.height, k: mixes.night * (1 - dark) };
    }

    if (wall && !wall.lost) {
      wall.render({ ambient: amb, light: L, scroll: y, glow, night: Math.max(mixes.night, dark) });
    } else {
      const poly = patchPolygons(L.patch);
      room.style.setProperty('--wall', linearToCss(amb));
      room.style.setProperty('--light', linearToCss(mix(amb, L.colour, 0.85), 0.7 * L.intensity));
      room.style.setProperty('--patch', poly.patch);
      room.style.setProperty('--mullion-v', poly.v);
      room.style.setProperty('--mullion-h', poly.h);
      room.style.setProperty('--patch-soft', `${L.soft.toFixed(1)}px`);
    }

    // The readout prints the clock the light is set to.
    const hm = clock(t, city.tz);
    if (hm !== last.hm || city.id !== last.city) {
      last.hm = hm;
      last.city = city.id;
      write('now-time', hm);
      write('now-el', fmtElevation(pos.elevation));
      write('now-az', fmtAzimuth(pos.azimuth));
      write('now-k', fmtKelvin(L.kelvin));
      if (cityLabel) cityLabel.textContent = hm;
    }

    // The hour line: the sun rides between the chapter ticks; the current chapter is marked.
    placeSun(y);
    state = { city: city.id, clock: hm, elevation: Number(pos.elevation.toFixed(2)), azimuth: Math.round(pos.azimuth), kelvin: L.kelvin, theme, polarDark: Number(dark.toFixed(2)) };
  }

  const readouts = {};
  function write(key, value) {
    readouts[key] ??= [...document.querySelectorAll(`[data-sun="${key}"]`)];
    for (const el of readouts[key]) if (el.textContent !== value) el.textContent = value;
  }

  let tickX = [];
  function measureTicks() {
    const nav = document.querySelector('.hourline__nav');
    if (!nav || !nav.offsetWidth) { tickX = []; return; }
    const n = nav.getBoundingClientRect();
    tickX = ticks.map((a) => {
      const r = a.getBoundingClientRect();
      return ((r.left + r.width / 2 - n.left) / n.width) * 100;
    });
  }

  let current = null;
  function placeSun(y) {
    let idx = 0;
    for (let i = 0; i < tickAnchors.length; i += 1) if (y + vh * 0.35 >= tickAnchors[i].y) idx = i;
    const name = tickAnchors[idx]?.name;
    if (name !== current) {
      current = name;
      for (const a of ticks) a.toggleAttribute('aria-current', false);
      const a = ticks.find((el) => el.dataset.chapter === name);
      if (a) a.setAttribute('aria-current', 'true');
    }
    if (!tickX.length || !sunMark) return;
    const a = tickAnchors[idx];
    const b = tickAnchors[idx + 1];
    const f = b ? Math.min(1, Math.max(0, (y - a.y) / Math.max(1, b.y - a.y))) : 0;
    const x = b ? tickX[idx] + (tickX[idx + 1] - tickX[idx]) * f : tickX[idx];
    sunMark.style.setProperty('--sun-x', `${x.toFixed(2)}%`);
  }

  function setCity(id) {
    const next = cityById(id);
    if (next.id === city.id) return;
    city = next;
    computeDay();
    measure();
    const u = new URL(location.href);
    u.searchParams.set('city', city.id);
    history.replaceState(null, '', u);
    const d = sunDay(Date.now(), city);
    announce(`Now borrowing ${city.name}'s sun: sunrise ${clock(d.rise, city.tz)}, sunset ${clock(d.set, city.tz)}, local time.`);
    dirty = true;
  }

  function switchOn() {
    let seen = false;
    try { seen = sessionStorage.getItem('ekvator-lit') === '1'; sessionStorage.setItem('ekvator-lit', '1'); } catch {}
    const instant = seen || tier !== 'full';
    gsap.to(mixes, { on: 1, duration: instant ? 0 : 1.2, ease: 'power2.out', onUpdate: () => { dirty = true; } });
  }

  computeDay();
  measure();
  measureTicks();
  root.classList.add('is-live');

  const ro = new ResizeObserver(() => { measure(); measureTicks(); });
  ro.observe(document.body);
  gsap.ticker.add(frame);
  frame();

  return {
    get city() { return city; },
    cities: CITIES,
    setCity,
    switchOn,
    refresh() { measure(); measureTicks(); },
    setTier(next) { tier = next; dirty = true; },
    state: () => state,
    destroy() {
      gsap.ticker.remove(frame);
      ro.disconnect();
    },
  };
}
