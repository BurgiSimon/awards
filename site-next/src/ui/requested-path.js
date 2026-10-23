// The 404 (served at any missing path, with <base> set to the site root so its assets resolve at any depth):
// it prints the address that was asked for as edge print under its line ("this address" without script), and it
// points its in-page links back at that address, because under <base> "#main" would otherwise mean the home page.
export function initRequestedPath() {
  const slot = document.querySelector('[data-requested-path]');
  if (slot) {
    try { slot.textContent = decodeURI(location.pathname); } catch { slot.textContent = location.pathname; }
  }
  if (!document.querySelector('base[href]')) return;
  const here = location.pathname + location.search;
  for (const a of document.querySelectorAll('a[href^="#"]')) a.setAttribute('href', here + a.getAttribute('href'));
}
