# awards — public site

The plugin's own site: home, install, docs and a 404. It was built with the plugin's craft flow; `AWARDS.md` and `DESIGN.md` are the build record.

Every count and list on the pages (skills, recipes, audit rules, site cards, patterns, the version) is read from `../plugins/awards` at build time by `facts.js`, so a rebuild picks up plugin changes. The readout on the home page comes from `jury.json`, copied from the latest jury report.

## Build

```sh
npm ci
npm run build        # writes dist/
npm run preview      # serves dist/ on localhost to check it
```

Node 20.19+ or 22.12+. The build needs the rest of this repository next to it (`../plugins/awards`).

## Self-host

`dist/` is plain static files with relative paths, so it works from a domain root or a subfolder. Copy it to any static server.

The 404 page needs to know the site root to find its stylesheet from any depth. It defaults to `/`; for a subfolder build with `SITE_ROOT=/awards/ npm run build`. Then point the server's 404 at it:

```nginx
error_page 404 /404.html;          # nginx (use /awards/404.html in a subfolder)
```

```caddy
handle_errors {
	rewrite * /404.html
	file_server
}
```

The Open Graph tags use a relative image path; crawlers resolve it best as an absolute URL, so replace `./og.png` in `partials/head.html` with your full URL if link previews matter.

## Checks

```sh
node ../plugins/awards/scripts/audit.mjs .              # source audit
node ../plugins/awards/scripts/audit.mjs dist --render  # rendered audit (needs Playwright)
node ../plugins/awards/scripts/capture.mjs dist --reduced-motion --states .awards/capture-states.json
```
