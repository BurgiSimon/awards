// The visitor's own sky, located by time zone only: the zone's namesake city. No geolocation prompt, no request.
export const ZONES = {
  'Europe/Oslo': ['Oslo', 59.91, 10.75], 'Europe/Stockholm': ['Stockholm', 59.33, 18.07], 'Europe/Helsinki': ['Helsinki', 60.17, 24.94],
  'Europe/Copenhagen': ['Copenhagen', 55.68, 12.57], 'Atlantic/Reykjavik': ['Reykjavík', 64.15, -21.94], 'Europe/London': ['London', 51.51, -0.13],
  'Europe/Dublin': ['Dublin', 53.35, -6.26], 'Europe/Lisbon': ['Lisbon', 38.72, -9.14], 'Europe/Madrid': ['Madrid', 40.42, -3.7],
  'Europe/Paris': ['Paris', 48.86, 2.35], 'Europe/Brussels': ['Brussels', 50.85, 4.35], 'Europe/Amsterdam': ['Amsterdam', 52.37, 4.9],
  'Europe/Berlin': ['Berlin', 52.52, 13.4], 'Europe/Zurich': ['Zurich', 47.38, 8.54], 'Europe/Vienna': ['Vienna', 48.21, 16.37],
  'Europe/Rome': ['Rome', 41.9, 12.5], 'Europe/Prague': ['Prague', 50.08, 14.44], 'Europe/Warsaw': ['Warsaw', 52.23, 21.01],
  'Europe/Budapest': ['Budapest', 47.5, 19.04], 'Europe/Athens': ['Athens', 37.98, 23.73], 'Europe/Istanbul': ['Istanbul', 41.01, 28.98],
  'Europe/Kyiv': ['Kyiv', 50.45, 30.52], 'Europe/Kiev': ['Kyiv', 50.45, 30.52], 'Europe/Riga': ['Riga', 56.95, 24.11], 'Europe/Tallinn': ['Tallinn', 59.44, 24.75],
  'Europe/Vilnius': ['Vilnius', 54.69, 25.28], 'Europe/Moscow': ['Moscow', 55.76, 37.62], 'Africa/Casablanca': ['Casablanca', 33.57, -7.59],
  'Africa/Cairo': ['Cairo', 30.04, 31.24], 'Africa/Lagos': ['Lagos', 6.52, 3.38], 'Africa/Nairobi': ['Nairobi', -1.29, 36.82],
  'Africa/Johannesburg': ['Johannesburg', -26.2, 28.05], 'Asia/Dubai': ['Dubai', 25.2, 55.27], 'Asia/Kolkata': ['Kolkata', 22.57, 88.36],
  'Asia/Calcutta': ['Kolkata', 22.57, 88.36], 'Asia/Bangkok': ['Bangkok', 13.76, 100.5], 'Asia/Singapore': ['Singapore', 1.35, 103.82],
  'Asia/Shanghai': ['Shanghai', 31.23, 121.47], 'Asia/Hong_Kong': ['Hong Kong', 22.32, 114.17], 'Asia/Seoul': ['Seoul', 37.57, 126.98],
  'Asia/Tokyo': ['Tokyo', 35.68, 139.69], 'Australia/Sydney': ['Sydney', -33.87, 151.21], 'Australia/Melbourne': ['Melbourne', -37.81, 144.96],
  'Pacific/Auckland': ['Auckland', -36.85, 174.76], 'America/St_Johns': ["St. John's", 47.56, -52.71], 'America/Halifax': ['Halifax', 44.65, -63.58],
  'America/New_York': ['New York', 40.71, -74.01], 'America/Toronto': ['Toronto', 43.65, -79.38], 'America/Chicago': ['Chicago', 41.88, -87.63],
  'America/Denver': ['Denver', 39.74, -104.99], 'America/Edmonton': ['Edmonton', 53.55, -113.49], 'America/Phoenix': ['Phoenix', 33.45, -112.07],
  'America/Los_Angeles': ['Los Angeles', 34.05, -118.24], 'America/Vancouver': ['Vancouver', 49.28, -123.12], 'America/Anchorage': ['Anchorage', 61.22, -149.9],
  'America/Yellowknife': ['Yellowknife', 62.45, -114.37], 'America/Mexico_City': ['Mexico City', 19.43, -99.13], 'America/Bogota': ['Bogotá', 4.71, -74.07],
  'America/Lima': ['Lima', -12.05, -77.04], 'America/Sao_Paulo': ['São Paulo', -23.55, -46.63], 'America/Argentina/Buenos_Aires': ['Buenos Aires', -34.6, -58.38],
  'America/Santiago': ['Santiago', -33.45, -70.67], 'Pacific/Honolulu': ['Honolulu', 21.31, -157.86], 'Arctic/Longyearbyen': ['Longyearbyen', 78.22, 15.65],
};

export function hereByZone() {
  let tz = 'UTC';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch {}
  const z = ZONES[tz];
  return z ? { tz, name: z[0], lat: z[1], lon: z[2] } : null;
}
