// Solar position after the NOAA solar calculator (Meeus, low-precision series).
// Accurate to about a minute for sunrise and sunset and a few hundredths of a degree for
// elevation between 1950 and 2100, which is all the page and the E1 itself need.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export const CITIES = [
  { id: 'lisbon', name: 'Lisbon', lat: 38.7223, lon: -9.1393, tz: 'Europe/Lisbon' },
  { id: 'marrakesh', name: 'Marrakesh', lat: 31.6295, lon: -7.9811, tz: 'Africa/Casablanca' },
  { id: 'nairobi', name: 'Nairobi', lat: -1.2921, lon: 36.8219, tz: 'Africa/Nairobi' },
  { id: 'kyoto', name: 'Kyoto', lat: 35.0116, lon: 135.7681, tz: 'Asia/Tokyo' },
  { id: 'lima', name: 'Lima', lat: -12.0464, lon: -77.0428, tz: 'America/Lima' },
];

export const TROMSO = { id: 'tromso', name: 'Tromsø', lat: 69.6492, lon: 18.9553, tz: 'Europe/Oslo' };

const julianDay = (ms) => ms / 86400000 + 2440587.5;

// Solar declination, equation of time (minutes) and the sun's geometric terms for an instant.
function solarTerms(ms) {
  const T = (julianDay(ms) - 2451545) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T))
    + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T)
    + Math.sin(3 * M * RAD) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) * DEG;
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const eqTime = 4 * DEG * (
    y * Math.sin(2 * L0 * RAD)
    - 2 * e * Math.sin(M * RAD)
    + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD)
    - 0.5 * y * y * Math.sin(4 * L0 * RAD)
    - 1.25 * e * e * Math.sin(2 * M * RAD)
  );
  return { decl, eqTime };
}

// Elevation (with refraction) and azimuth (degrees clockwise from north) at an instant.
export function sunPosition(ms, lat, lon) {
  const { decl, eqTime } = solarTerms(ms);
  const d = new Date(ms);
  const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  let trueSolar = (utcMin + eqTime + 4 * lon) % 1440;
  if (trueSolar < 0) trueSolar += 1440;
  let hourAngle = trueSolar / 4 - 180;
  const cosZen = Math.sin(lat * RAD) * Math.sin(decl * RAD)
    + Math.cos(lat * RAD) * Math.cos(decl * RAD) * Math.cos(hourAngle * RAD);
  const zenith = Math.acos(Math.min(1, Math.max(-1, cosZen))) * DEG;
  let elevation = 90 - zenith;
  elevation += refraction(elevation);
  const az = Math.atan2(
    Math.sin(hourAngle * RAD),
    Math.cos(hourAngle * RAD) * Math.sin(lat * RAD) - Math.tan(decl * RAD) * Math.cos(lat * RAD),
  ) * DEG + 180;
  return { elevation, azimuth: (az + 360) % 360, hourAngle, decl };
}

function refraction(el) {
  if (el > 85) return 0;
  const te = Math.tan(el * RAD);
  let r;
  if (el > 5) r = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
  else if (el > -0.575) r = 1735 + el * (-518.2 + el * (103.4 + el * (-12.79 + el * 0.711)));
  else r = -20.774 / te;
  return r / 3600;
}

// Sunrise, solar noon and sunset (UTC milliseconds) for the civil day that contains `ms`
// in the city's time zone. `rise`/`set` are null in polar night or midnight sun.
export function sunDay(ms, city) {
  const midnight = zonedMidnight(ms, city.tz);
  const noonGuess = midnight + 12 * 3600000;
  const { decl, eqTime } = solarTerms(noonGuess);
  const noonUtcMin = 720 - 4 * city.lon - eqTime;
  const dayStartUtc = Date.UTC(...ymdOf(midnight + 12 * 3600000, 'UTC'));
  const noon = dayStartUtc + noonUtcMin * 60000;
  const cosH = (Math.cos(90.833 * RAD) - Math.sin(city.lat * RAD) * Math.sin(decl * RAD))
    / (Math.cos(city.lat * RAD) * Math.cos(decl * RAD));
  const noonEl = sunPosition(noon, city.lat, city.lon).elevation;
  if (cosH > 1 || cosH < -1) {
    return { noon, rise: null, set: null, noonElevation: noonEl, polarNight: cosH > 1, midnightSun: cosH < -1 };
  }
  const H = Math.acos(cosH) * DEG;
  return {
    noon,
    rise: noon - H * 4 * 60000,
    set: noon + H * 4 * 60000,
    noonElevation: noonEl,
    polarNight: false,
    midnightSun: false,
  };
}

// The run of days with no sunrise around the coming midwinter at a city (northern hemisphere).
export function polarNightSpan(ms, city) {
  const d = new Date(ms);
  const year = d.getUTCMonth() === 0 ? d.getUTCFullYear() - 1 : d.getUTCFullYear();
  const midwinter = Date.UTC(year, 11, 21, 11);
  if (!sunDay(midwinter, city).polarNight) return null;
  let first = midwinter;
  while (sunDay(first - 86400000, city).polarNight) first -= 86400000;
  let last = midwinter;
  while (sunDay(last + 86400000, city).polarNight) last += 86400000;
  return { first, last, days: Math.round((last - first) / 86400000) + 1 };
}

// Approximate correlated colour temperature of direct sunlight at a given elevation.
export function kelvinAt(elevation) {
  if (elevation <= -1) return 1800;
  const t = Math.min(1, Math.max(0, (elevation + 1) / 36));
  const s = t * t * (3 - 2 * t);
  return Math.round(1800 + (5600 - 1800) * Math.sqrt(s));
}

// Tanner Helland's blackbody approximation, returned as linear-ish 0–1 sRGB components.
export function kelvinToRgb(kelvin) {
  const t = kelvin / 100;
  let r; let g; let b;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * (t - 60) ** -0.1332047592;
    g = 288.1221695283 * (t - 60) ** -0.0755148492;
    b = 255;
  }
  const c = (v) => Math.min(255, Math.max(0, v)) / 255;
  return [c(r), c(g), c(b)];
}

export function cardinal(az) {
  const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return names[Math.round(az / 45) % 8];
}

// Local clock text for a UTC instant in a city's zone.
export function clock(ms, tz) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(ms);
}

export function longDate(ms, tz) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: tz }).format(ms);
}

function ymdOf(ms, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz })
    .formatToParts(ms);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return [get('year'), get('month') - 1, get('day')];
}

// UTC milliseconds of local midnight in `tz` for the day containing `ms`.
function zonedMidnight(ms, tz) {
  const [y, m, d] = ymdOf(ms, tz);
  let guess = Date.UTC(y, m, d);
  for (let i = 0; i < 3; i += 1) {
    const offset = zoneOffset(guess, tz);
    guess = Date.UTC(y, m, d) - offset;
  }
  return guess;
}

function zoneOffset(ms, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(ms);
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return asUtc - Math.floor(ms / 1000) * 1000;
}
