// The visitor's own crossing time: from where their clock says they are, overland to the nearer end of Gannet-1, then
// the length of the cable, at five microseconds a kilometre of glass. The HTML carries 32 ms (Lisbon) for no-JS.
// Gannet-1 is fictional; its landings and length are the story's, the arithmetic is light's.
const SINES = [37.95, -8.87];
const FAR_END = [36.85, -75.98]; // the far landing, on the Virginia coast
const CABLE_KM = 6290;
const US_PER_KM = 5;
const ROUTE = 1.3; // land routes are never great circles

// Time zones to a representative city; anything else falls back to the UTC offset's meridian at 40° N.
const ZONES = {
  'Europe/Lisbon': [38.72, -9.14], 'Atlantic/Azores': [37.74, -25.67], 'Europe/Madrid': [40.42, -3.7],
  'Europe/London': [51.51, -0.13], 'Europe/Dublin': [53.35, -6.26], 'Europe/Paris': [48.86, 2.35],
  'Europe/Brussels': [50.85, 4.35], 'Europe/Amsterdam': [52.37, 4.9], 'Europe/Zurich': [47.37, 8.54],
  'Europe/Berlin': [52.52, 13.4], 'Europe/Rome': [41.9, 12.5], 'Europe/Vienna': [48.21, 16.37],
  'Europe/Stockholm': [59.33, 18.07], 'Europe/Warsaw': [52.23, 21.01], 'Europe/Athens': [37.98, 23.73],
  'Europe/Istanbul': [41.01, 28.98], 'Africa/Lagos': [6.52, 3.38], 'Africa/Johannesburg': [-26.2, 28.05],
  'Africa/Cairo': [30.04, 31.24], 'Asia/Dubai': [25.2, 55.27], 'Asia/Kolkata': [19.08, 72.88],
  'Asia/Singapore': [1.35, 103.82], 'Asia/Shanghai': [31.23, 121.47], 'Asia/Tokyo': [35.68, 139.69],
  'Australia/Sydney': [-33.87, 151.21], 'America/New_York': [40.71, -74.01], 'America/Toronto': [43.65, -79.38],
  'America/Chicago': [41.88, -87.63], 'America/Denver': [39.74, -104.99], 'America/Los_Angeles': [34.05, -118.24],
  'America/Mexico_City': [19.43, -99.13], 'America/Sao_Paulo': [-23.55, -46.63], 'America/Halifax': [44.65, -63.58],
};

const rad = (d) => (d * Math.PI) / 180;
function km([la1, lo1], [la2, lo2]) {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

export function crossingTime() {
  let zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  const here = ZONES[zone] || [40, (-new Date().getTimezoneOffset() / 60) * 15];
  const land = Math.min(km(here, SINES), km(here, FAR_END)) * ROUTE;
  return { zone: zone || 'unknown', ms: Math.round(((land + CABLE_KM) * US_PER_KM) / 1000) };
}

export function writeCrossing(el) {
  if (!el) return null;
  const c = crossingTime();
  el.textContent = `${c.ms} ms`;
  return c;
}
