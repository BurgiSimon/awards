// Adaptive quality: probe the device once, measure the first frames, and hand every effect a tier.
// Tiers: high (DPR ≤ 2, full effects) · mid (DPR ≤ 1.5, fewer particles/blur samples) · low (DPR 1, no post-processing, static fallbacks allowed)
export async function detectQualityTier({ sampleMs = 600 } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer = 'unknown';
  let webgl2 = false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    webgl2 = !!c.getContext('webgl2');
    const info = gl && gl.getExtension('WEBGL_debug_renderer_info');
    if (gl && info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    else if (gl) renderer = String(gl.getParameter(gl.RENDERER));
  } catch {}

  // Measure the frame time we actually get before committing heavy effects.
  const fps = await new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = (t) => {
      frames++;
      if (t - start < sampleMs) requestAnimationFrame(tick);
      else resolve(Math.round((frames * 1000) / (t - start)));
    };
    requestAnimationFrame(tick);
  });

  let score = 0;
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += /swiftshader|llvmpipe|software/i.test(renderer) ? -3 : /mali-4|adreno 3|adreno 4|powervr/i.test(renderer) ? -1 : 1;
  score += fps >= 55 ? 2 : fps >= 40 ? 1 : fps >= 25 ? 0 : -2;
  score += webgl2 ? 0 : -1;

  const tier = score >= 5 ? 'high' : score >= 2 ? 'mid' : 'low';
  const profile = {
    tier,
    dpr: tier === 'high' ? Math.min(dpr, 2) : tier === 'mid' ? Math.min(dpr, 1.5) : 1,
    maxPixels: tier === 'high' ? 2560 * 1440 : tier === 'mid' ? 1920 * 1080 : 1280 * 720,
    postprocessing: tier !== 'low',
    particles: tier === 'high' ? 1 : tier === 'mid' ? 0.4 : 0,
    blurSamples: tier === 'high' ? 16 : tier === 'mid' ? 8 : 0,
    reducedMotion: reduced,
    coarsePointer: coarse,
    probe: { dpr, memory, cores, renderer, fps, webgl2, score },
  };
  document.documentElement.setAttribute('data-quality', tier);
  return profile;
}

// Cap a renderer's resolution by both DPR and an absolute pixel budget (mobile GPUs die on pixel count, not DPR).
export function applyRendererBudget(renderer, profile, width = innerWidth, height = innerHeight) {
  const pixels = width * height * profile.dpr * profile.dpr;
  const scale = pixels > profile.maxPixels ? Math.sqrt(profile.maxPixels / pixels) : 1;
  renderer.setPixelRatio(profile.dpr * scale);
  renderer.setSize(width, height, false);
}
