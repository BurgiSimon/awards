import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { ticker } from '../_shared/raf.js';

syncMotionTierAttribute();

const KEY = 'awards:sound';
// pattern:sound#levels-and-layers — the only levels the corpus publishes: ambient .375, one-shots .35.
const AMBIENT = 0.375;
const SFX = 0.35;

const button = document.querySelector('[data-sound]');
const label = button.querySelector('[data-sound-label]');
const meter = button.querySelector('canvas');
const ctx2d = meter.getContext('2d');

// localStorage throws in a private window; a toggle that cannot remember still has to work.
const store = {
  read() { try { return localStorage.getItem(KEY); } catch { return null; } },
  write(v) { try { localStorage.setItem(KEY, v); } catch {} },
};

let audio = null;      // the AudioContext. Null until a gesture, which is the whole point of the recipe.
let analyser = null;
let bins = null;
let unsubscribe = null;
const state = { sound: store.read() === 'on' ? 'armed' : 'off' };

function build() {
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const master = ac.createGain();
  master.gain.value = 1;
  analyser = ac.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.75;
  bins = new Uint8Array(analyser.frequencyBinCount);
  master.connect(analyser).connect(ac.destination);

  // The bed: two detuned sines under a band of noise, swept slowly by an LFO so it never sits still.
  const bed = ac.createGain();
  bed.gain.value = AMBIENT;
  bed.connect(master);
  const lowpass = ac.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 420;
  lowpass.Q.value = 6;
  lowpass.connect(bed);
  for (const hz of [110, 110 * 1.5]) {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;
    osc.detune.value = hz === 110 ? -6 : 5;
    const g = ac.createGain();
    g.gain.value = 0.5;
    osc.connect(g).connect(lowpass);
    osc.start();
  }
  const noise = ac.createBufferSource();
  const buffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  noise.buffer = buffer;
  noise.loop = true;
  const band = ac.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 900;
  band.Q.value = 0.8;
  const noiseGain = ac.createGain();
  noiseGain.gain.value = 0.08;
  noise.connect(band).connect(noiseGain).connect(bed);
  noise.start();

  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ac.createGain();
  lfoDepth.gain.value = 180;
  lfo.connect(lfoDepth).connect(lowpass.frequency);
  lfo.start();

  return { ac, master };
}

function blip(ac, master, hz) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = hz;
  g.gain.setValueAtTime(SFX, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
  osc.connect(g).connect(master);
  osc.start();
  osc.stop(ac.currentTime + 0.14);
}

let master = null;
async function on() {
  if (!audio) ({ ac: audio, master } = build());
  await audio.resume();
  state.sound = 'on';
  store.write('on');
  blip(audio, master, 660);
  paint();
  if (motionTier() === 'full' && !unsubscribe) unsubscribe = ticker.add(paint);
}

async function off() {
  state.sound = 'off';
  store.write('off');
  if (audio) {
    blip(audio, master, 330);
    // Suspended, not closed: the graph survives, so turning it back on costs no rebuild.
    setTimeout(() => { if (state.sound === 'off') audio.suspend().then(paint); }, 160);
  }
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  paint();
}

function paint() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (meter.width !== 24 * dpr) { meter.width = 24 * dpr; meter.height = 24 * dpr; }
  const cs = getComputedStyle(document.documentElement);
  const ink = cs.getPropertyValue('--ink').trim() || '#1a1c1c';
  const accent = cs.getPropertyValue('--accent').trim() || '#0016cb';
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx2d.clearRect(0, 0, 24, 24);
  const live = state.sound === 'on' && analyser && audio?.state === 'running';
  if (live && motionTier() === 'full') analyser.getByteFrequencyData(bins);
  ctx2d.fillStyle = live ? accent : ink;
  ctx2d.globalAlpha = live ? 1 : 0.35;
  for (let i = 0; i < 3; i++) {
    // Reduced and static tiers hold the on pose rather than animating it (pattern:sound#the-control).
    const level = live ? (motionTier() === 'full' ? bins[2 + i * 3] / 255 : [0.5, 0.85, 0.35][i]) : 0.12;
    const h = Math.max(2, Math.round(level * 18));
    ctx2d.fillRect(3 + i * 7, 21 - h, 5, h);
  }
  ctx2d.globalAlpha = 1;
  button.setAttribute('aria-pressed', String(state.sound !== 'off'));
  label.textContent = state.sound === 'on' ? 'Sound on' : state.sound === 'armed' ? 'Sound on — press to start' : 'Sound off';
}

button.addEventListener('click', () => (state.sound === 'on' ? off() : on()));

// A remembered yes still waits for a gesture (pattern:sound#the-control): the first one anywhere
// starts the bed. The button has its own handler, so its own clicks must not arrive here as well.
const armed = (e) => {
  if (state.sound !== 'armed' || button.contains(e.target)) return;
  removeEventListener('pointerdown', armed, true);
  removeEventListener('keydown', armed, true);
  on();
};
addEventListener('pointerdown', armed, true);
addEventListener('keydown', armed, true);

document.addEventListener('visibilitychange', () => {
  if (!audio) return;
  if (document.hidden) audio.suspend().then(paint);
  else if (state.sound === 'on') audio.resume().then(paint);
});

paint();

awards.addState(() => ({
  motion: motionTier(),
  sound: state.sound,
  context: audio ? audio.state : null,
  pressed: button.getAttribute('aria-pressed') === 'true',
  name: label.textContent,
  stored: store.read(),
  meterAnimated: !!unsubscribe,
}));
awards.ready();
