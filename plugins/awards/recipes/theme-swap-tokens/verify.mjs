// Chapters are exactly one viewport tall, so 0.3 lands in chapter 2 (dark), 0.6 in chapter 3 (accent), 1 in chapter 4 (default).
export const states = [
  { name: 'top', scroll: 0, settle: 600 },
  { name: 'dark', scroll: 0.3, settle: 1600 },
  { name: 'accent', scroll: 0.6, settle: 1600 },
  { name: 'end', scroll: 1, settle: 1600 },
  { name: 'rm', scroll: 0.3, reducedMotion: true, settle: 500 },
  { name: 'mobile', scroll: 0.3, viewport: 'mobile', settle: 1600 },
];
export function probe() {
  return { bodyBg: getComputedStyle(document.body).backgroundColor, bodyColor: getComputedStyle(document.body).color };
}
export function assert(r) {
  const out = [];
  out.push({ ok: r.top.state?.theme === 'default', message: 'default theme at top' });
  out.push({ ok: r.dark.state?.theme === 'dark' && r.dark.probe?.bodyBg !== r.top.probe?.bodyBg, message: `dark theme applied (${r.top.probe?.bodyBg} → ${r.dark.probe?.bodyBg})` });
  out.push({ ok: r.accent.state?.theme === 'accent' && r.accent.probe?.bodyBg !== r.dark.probe?.bodyBg, message: `accent theme applied (${r.accent.probe?.bodyBg})` });
  out.push({ ok: r.end.state?.theme === 'default' && r.end.probe?.bodyBg === r.top.probe?.bodyBg, message: 'back to default at the end' });
  out.push({ ok: r.dark.state?.canvasPixel === r.dark.probe?.bodyBg, message: `canvas clear colour matches the DOM ground (${r.dark.state?.canvasPixel} vs ${r.dark.probe?.bodyBg})` });
  out.push({ ok: r.dark.state?.themeColor === r.dark.state?.ground && r.dark.state?.themeColor !== '#f4f2ee', message: `theme-color meta follows the ground (${r.dark.state?.themeColor})` });
  out.push({ ok: r.rm.state?.motion === 'reduced' && r.rm.state?.theme === 'dark' && r.rm.state?.tweening === false && r.rm.probe?.bodyBg === r.dark.probe?.bodyBg, message: 'reduced motion: theme swaps instantly to the same values' });
  out.push({ ok: r.mobile.state?.theme === 'dark', message: 'mobile swaps' });
  return out;
}
