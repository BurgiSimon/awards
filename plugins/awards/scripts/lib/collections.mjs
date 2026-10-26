// Open collections that publish a licence per item and need no key: what assets.mjs search queries.
// Each adapter returns the same record shape, already filtered to licences a commercial site may use with a
// credit: public domain, CC0, CC BY, CC BY-SA. NC and ND items never come back. A source that fails or times
// out is reported, never fatal: one slow API must not cost the others' results.
// Base URLs can be pointed elsewhere with AWARDS_COLLECTION_<SOURCE> (the behaviour suite serves fixtures).

const UA = 'awards-plugin asset search (https://github.com/burgisimon/awards)';
const base = (source, url) => process.env[`AWARDS_COLLECTION_${source.toUpperCase()}`] ?? url;
const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function getJson(url, ms) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (!/json/.test(type)) throw new Error(`not JSON (${type.split(';')[0] || 'no type'}); a bot wall or a moved endpoint`);
    return await res.json();
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? `no answer after ${ms / 1000} s` : e.message);
  } finally {
    clearTimeout(timer);
  }
}

// One licence vocabulary for every source; null means the item is refused.
export function licence(raw, version) {
  const s = String(raw ?? '').trim().toLowerCase();
  if (!s || /\bnc\b|non-?commercial|\bnd\b|no-?deriv/.test(s)) return null;
  if (/^(pdm|public ?domain|pd\b|pd-|no known restrictions|nasa)/.test(s)) return /no known/.test(s) ? 'No known restrictions on publication' : 'Public domain';
  if (/^cc0|zero/.test(s)) return 'CC0 1.0';
  const v = version ?? s.match(/(\d\.\d)/)?.[1] ?? '';
  // Anchored: "Copyrighted by the author" is not CC BY.
  if (/^(cc[- ]?)?by[- ]?sa\b/.test(s)) return `CC BY-SA ${v}`.trim();
  if (/^(cc[- ]?)?by\b/.test(s)) return `CC BY ${v}`.trim();
  return null;
}
const licenceUrlFor = (name) => (/^CC0/.test(name) ? 'https://creativecommons.org/publicdomain/zero/1.0/'
  : /^Public domain/.test(name) ? 'https://creativecommons.org/publicdomain/mark/1.0/'
    : /^CC BY-SA ([\d.]+)/.test(name) ? `https://creativecommons.org/licenses/by-sa/${name.match(/([\d.]+)/)[1]}/`
      : /^CC BY ([\d.]+)/.test(name) ? `https://creativecommons.org/licenses/by/${name.match(/([\d.]+)/)[1]}/` : null);
export function creditLine(r) {
  const who = r.creator ? ` by ${r.creator}` : '';
  return `“${r.title}”${who}, ${r.licence}${r.licenceUrl && !/^Public domain|^No known/.test(r.licence) ? ` (${r.licenceUrl})` : ''}, via ${r.collection}`;
}

const adapters = {
  // Openverse indexes Wikimedia Commons, Flickr and many museums; `commercial` keeps CC0, PDM, BY and BY-SA.
  async openverse(q, { limit, video }) {
    if (video) return [];
    const j = await getJson(`${base('openverse', 'https://api.openverse.org/v1/images/')}?q=${encodeURIComponent(q)}&license_type=commercial&page_size=${limit}`, 40000);
    return (j.results ?? []).map((r) => ({ id: r.id, title: r.title || 'Untitled', creator: r.creator || null, licence: licence(r.license, r.license_version), licenceUrl: r.license_url, page: r.foreign_landing_url, url: r.url, width: r.width ?? null, height: r.height ?? null, collection: `Openverse (${r.provider ?? r.source ?? 'source'})` }));
  },
  // Footage only as WebM: Commons also holds Ogg Theora, which Safari cannot play.
  async commons(q, { limit, video }) {
    const params = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: video ? `${q} filemime:video/webm` : `${q} filetype:bitmap`, gsrnamespace: '6', gsrlimit: String(limit), prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '2400', format: 'json', origin: '*' });
    const j = await getJson(`${base('commons', 'https://commons.wikimedia.org/w/api.php')}?${params}`, 25000);
    return Object.values(j.query?.pages ?? {}).map((p) => {
      const ii = p.imageinfo?.[0] ?? {};
      const m = ii.extmetadata ?? {};
      return { id: String(p.pageid), title: strip(m.ObjectName?.value) || p.title.replace(/^File:|\.[a-z0-9]+$/gi, ''), creator: strip(m.Artist?.value) || null, licence: licence(m.LicenseShortName?.value), licenceUrl: m.LicenseUrl?.value ?? null, page: ii.descriptionurl, url: video ? ii.url : (ii.thumburl ?? ii.url), width: ii.width ?? null, height: ii.height ?? null, collection: 'Wikimedia Commons' };
    });
  },
  // The Met: public-domain objects only (its Open Access images are CC0).
  async met(q, { limit, video }) {
    if (video) return [];
    const root = base('met', 'https://collectionapi.metmuseum.org/public/collection');
    const ids = (await getJson(`${root}/v1.1/search?q=${encodeURIComponent(q)}&hasImages=true&limit=${limit * 2}`, 20000)).objectIDs ?? [];
    const out = [];
    for (const id of ids.slice(0, limit * 2)) {
      if (out.length >= limit) break;
      const o = await getJson(`${root}/v1/objects/${id}`, 15000).catch(() => null);
      if (!o?.isPublicDomain || !o.primaryImage) continue;
      out.push({ id: String(id), title: o.title || 'Untitled', creator: o.artistDisplayName || o.culture || null, licence: 'CC0 1.0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: o.objectURL, url: o.primaryImage, width: null, height: null, collection: 'The Metropolitan Museum of Art', date: o.objectDate || null });
    }
    return out;
  },
  async aic(q, { limit, video }) {
    if (video) return [];
    const j = await getJson(`${base('aic', 'https://api.artic.edu/api/v1/artworks/search')}?q=${encodeURIComponent(q)}&query[term][is_public_domain]=true&limit=${limit}&fields=id,title,image_id,artist_display,date_display,thumbnail`, 20000);
    return (j.data ?? []).filter((d) => d.image_id).map((d) => ({ id: String(d.id), title: d.title || 'Untitled', creator: d.artist_display?.split('\n')[0] ?? null, licence: 'CC0 1.0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: `https://www.artic.edu/artworks/${d.id}`, url: `https://www.artic.edu/iiif/2/${d.image_id}/full/1686,/0/default.jpg`, width: d.thumbnail?.width ?? null, height: d.thumbnail?.height ?? null, collection: 'Art Institute of Chicago', date: d.date_display ?? null }));
  },
  // NASA media is not copyrighted; the file URL is resolved from the asset manifest at download time.
  async nasa(q, { limit, video }) {
    const j = await getJson(`${base('nasa', 'https://images-api.nasa.gov/search')}?q=${encodeURIComponent(q)}&media_type=${video ? 'video' : 'image'}&page_size=${limit}`, 20000);
    return (j.collection?.items ?? []).slice(0, limit).map((it) => {
      const d = it.data?.[0] ?? {};
      const preview = it.links?.find((l) => l.render === 'image') ?? it.links?.[0];
      return { id: d.nasa_id, title: d.title || 'Untitled', creator: d.photographer || d.secondary_creator || (d.center ? `NASA ${d.center}` : 'NASA'), licence: 'Public domain', licenceUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/', page: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`, url: null, manifest: it.href, preview: preview?.href ?? null, width: preview?.width ?? null, height: preview?.height ?? null, collection: 'NASA Image and Video Library', note: 'NASA media may not imply endorsement; credit NASA' };
    });
  },
  // The Library of Congress: only items whose rights advisory says there are no known restrictions.
  async loc(q, { limit, video }) {
    if (video) return [];
    const j = await getJson(`${base('loc', 'https://www.loc.gov/photos/')}?q=${encodeURIComponent(q)}&fo=json&c=${limit * 2}&fa=online-format:image`, 25000);
    const out = [];
    for (const r of (j.results ?? []).slice(0, limit * 2)) {
      if (out.length >= limit || !r.url) continue;
      const item = await getJson(`${r.url}${r.url.includes('?') ? '&' : '?'}fo=json`, 15000).catch(() => null);
      const rights = item?.item?.rights_advisory ?? item?.item?.rights ?? [];
      const advisory = [].concat(rights).join(' ');
      if (!/no known restrictions/i.test(advisory)) continue;
      const images = [].concat(r.image_url ?? []);
      const largest = images.map((u) => ({ u: u.split('#')[0], w: Number(u.match(/#h=\d+&w=(\d+)/)?.[1] ?? 0) })).sort((a, b) => b.w - a.w)[0];
      out.push({ id: r.url.match(/\/item\/([^/?#]+)/)?.[1] ?? r.id ?? r.url, title: r.title || 'Untitled', creator: [].concat(r.contributor ?? [])[0] ?? null, licence: 'No known restrictions on publication', licenceUrl: r.url, page: r.url, url: largest?.u ?? null, width: largest?.w || null, height: null, collection: 'Library of Congress', date: r.date ?? null });
    }
    return out;
  },
  // The Internet Archive's moving images with a public-domain or BY / BY-SA licence; the file comes from metadata.
  async archive(q, { limit, video }) {
    if (!video) return [];
    // The server narrows to Creative Commons URLs (a bare slash would start a regex in its query syntax); the
    // licence itself is read from each URL's own code, so NC and ND items are refused here, not trusted to the query.
    const query = `(${q}) AND mediatype:movies AND licenseurl:*creativecommons.org*`;
    const j = await getJson(`${base('archive', 'https://archive.org/advancedsearch.php')}?q=${encodeURIComponent(query)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&rows=${limit * 4}&output=json`, 25000);
    const code = (u) => (/publicdomain\/zero/.test(u) ? 'cc0' : /publicdomain\/mark/.test(u) ? 'pdm' : u.match(/\/licenses\/([a-z-]+)\//)?.[1] ?? '');
    return (j.response?.docs ?? []).filter((d) => typeof d.licenseurl === 'string')
      .map((d) => ({ id: d.identifier, title: [].concat(d.title ?? 'Untitled')[0], creator: [].concat(d.creator ?? [])[0] ?? null, licence: licence(code(d.licenseurl), d.licenseurl.match(/(\d\.\d)/)?.[1]), licenceUrl: d.licenseurl, page: `https://archive.org/details/${d.identifier}`, url: null, width: null, height: null, collection: 'Internet Archive' }))
      .filter((r) => r.licence).slice(0, limit);
  },
};

export const SOURCES = Object.keys(adapters);
export const IMAGE_SOURCES = ['openverse', 'met', 'aic', 'nasa', 'loc', 'commons'];
export const VIDEO_SOURCES = ['commons', 'archive', 'nasa'];

export async function search(query, { sources, limit = 6, video = false, minWidth = 0 } = {}) {
  const chosen = sources?.length ? sources : video ? VIDEO_SOURCES : IMAGE_SOURCES;
  const settled = await Promise.allSettled(chosen.map((s) => adapters[s](query, { limit, video })));
  const results = [], unreachable = [];
  settled.forEach((r, i) => {
    const source = chosen[i];
    if (r.status === 'rejected') { unreachable.push({ source, reason: r.reason?.message ?? String(r.reason) }); return; }
    for (const item of r.value) {
      if (!item.licence || !item.id) continue;
      if (minWidth && item.width && item.width < minWidth) continue;
      results.push({ ref: `${source}:${item.id}`, source, ...item, licenceUrl: item.licenceUrl ?? licenceUrlFor(item.licence), video });
    }
  });
  return { query, video, sources: chosen, results, unreachable };
}

// The file to download: NASA and the Internet Archive name it only in a per-item manifest.
export async function resolveFile(record) {
  if (record.url) return record.url;
  if (record.source === 'nasa' && record.manifest) {
    const files = await getJson(record.manifest, 20000);
    const list = [].concat(files).map(String);
    const pick = (re) => list.find((u) => re.test(u));
    return (record.video ? pick(/~(medium|large|orig)\.mp4$/i) : pick(/~large\.(jpe?g|png)$/i) ?? pick(/~orig\.(jpe?g|png)$/i) ?? pick(/~medium\.(jpe?g|png)$/i)) ?? null;
  }
  if (record.source === 'archive') {
    const meta = await getJson(`${base('archive_meta', 'https://archive.org/metadata')}/${encodeURIComponent(record.id)}`, 20000);
    const file = (meta.files ?? []).filter((f) => /\.(mp4|webm)$/i.test(f.name)).sort((a, b) => Number(a.size ?? 0) - Number(b.size ?? 0)).find((f) => Number(f.size ?? 0) > 200000) ?? (meta.files ?? []).find((f) => /\.(mp4|webm)$/i.test(f.name));
    return file ? `https://archive.org/download/${encodeURIComponent(record.id)}/${encodeURIComponent(file.name)}` : null;
  }
  return null;
}

export async function download(url, ms = 120000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { bytes: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') ?? '' };
  } finally {
    clearTimeout(timer);
  }
}
