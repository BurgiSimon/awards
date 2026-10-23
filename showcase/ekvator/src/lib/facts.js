// Every number the page prints about the sun, for one borrowed city on one day.
// Used twice: by vite.config.js to write real values into the static HTML at build time,
// and by the page to rewrite them for the day and city it is actually read in.
import { CITIES, TROMSO, sunDay, sunPosition, polarNightSpan, kelvinAt, cardinal, clock, longDate } from './sun.js';

const MIN = 60000;

// The hour each chapter sits at, as a function of the borrowed day.
export function chapterTimes(day) {
  const { rise, noon, set } = day;
  return {
    'first-light': rise + 10 * MIN,
    morning: rise + 0.32 * (noon - rise),
    noon,
    afternoon: noon + 0.6 * (set - noon),
    reserve: set + 35 * MIN,
    end: set + 48 * MIN,
  };
}

export const fmtDuration = (ms) => {
  const m = Math.round(ms / MIN);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
};

export const fmtElevation = (el) => `${Math.abs(el).toFixed(1)}° ${el >= 0 ? 'up' : 'down'}`;
export const fmtAzimuth = (az) => `${Math.round(az)}° ${cardinal(az)}`;
export const fmtKelvin = (k) => `${k.toLocaleString('en-GB')} K`;
const minus = (n) => (n < 0 ? `−${Math.abs(n).toFixed(1)}` : n.toFixed(1));

export function cityById(id) {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}

export function tromsoStatus(now) {
  const d = sunDay(now, TROMSO);
  if (d.polarNight) return { status: 'does not rise today', today: 'no sunrise today; polar night' };
  if (d.midnightSun) return { status: 'does not set today', today: 'up all day; midnight sun' };
  const r = clock(d.rise, TROMSO.tz);
  const s = clock(d.set, TROMSO.tz);
  let status;
  if (now < d.rise) status = `rises at ${r} and sets at ${s}`;
  else if (now < d.set) status = `rose at ${r} and sets at ${s}`;
  else status = `rose at ${r} and set at ${s}`;
  return { status, today: `up at ${r}, down at ${s}` };
}

export function facts(now, city) {
  const day = sunDay(now, city);
  const times = chapterTimes(day);
  const first = sunPosition(times['first-light'], city.lat, city.lon);
  const tromso = sunDay(now, TROMSO);
  const polar = polarNightSpan(now, TROMSO);
  const midwinter = sunDay(polar ? polar.first + (polar.last - polar.first) / 2 : now, TROMSO);
  const ts = tromsoStatus(now);
  const out = {
    'city-name': city.name,
    't-first-light': clock(times['first-light'], city.tz),
    't-morning': clock(times.morning, city.tz),
    't-noon': clock(times.noon, city.tz),
    't-afternoon': clock(times.afternoon, city.tz),
    't-reserve': clock(times.reserve, city.tz),
    'now-time': clock(times['first-light'], city.tz),
    'now-el': fmtElevation(first.elevation),
    'now-az': fmtAzimuth(first.azimuth),
    'now-k': fmtKelvin(kelvinAt(first.elevation)),
    daylen: fmtDuration(day.set - day.rise),
    set: clock(day.set, city.tz),
    'tromso-daylen': tromso.rise ? fmtDuration(tromso.set - tromso.rise) : '0 h 00 min',
    'tromso-midwinter-el': `${minus(midwinter.noonElevation)}°`,
    'tromso-status': ts.status,
    'tromso-today': ts.today,
    'polar-first': polar ? longDate(polar.first, TROMSO.tz) : '—',
    'polar-last': polar ? longDate(polar.last, TROMSO.tz) : '—',
    'polar-days': polar ? String(polar.days) : '0',
    'polar-month': 'December',
  };
  for (const c of CITIES) {
    const d = sunDay(now, c);
    out[`line-${c.id}`] = `${clock(d.rise, c.tz)}–${clock(d.set, c.tz)}`;
  }
  return out;
}
