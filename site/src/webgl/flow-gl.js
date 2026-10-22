// The flow's GL renderer (lazy chunk, three). One WebGL context, and one canvas, serve every flow on the page. The
// canvas lives inside whichever flow section is near the screen (hero or close) and scrolls with it natively, so the
// lines never drift against the letters; the sections are thousands of pixels apart, and the canvas changes hands
// half a viewport before the next one arrives, so it is never seen moving.
import { WebGLRenderer, Scene, OrthographicCamera, BufferGeometry, BufferAttribute, LineSegments, ShaderMaterial, Color, SRGBColorSpace } from 'three';

const vertexShader = /* glsl */ `
  attribute float aSep;
  varying float vA;
  varying float vSep;
  varying float vX;
  void main() {
    vA = position.z; // the tracer's opacity rides in z so the positions buffer is its own array
    vSep = aSep;
    vX = position.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uAlpha;
  uniform float uReveal;
  varying float vA;
  varying float vSep;
  varying float vX;
  void main() {
    if (vX > uReveal || vA < 0.004) discard;
    float sep = smoothstep(0.15, 0.7, vSep);
    vec3 color = mix(uInk, uAccent, sep);
    gl_FragColor = vec4(color, min(1.0, uAlpha * vA * (1.0 + 0.6 * sep)));
    #include <colorspace_fragment>
  }
`;

// ---------- the one context ----------
let host = null;

function getHost() {
  if (host) return host;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-flow-canvas', 'gl');
  canvas.setAttribute('aria-hidden', 'true');
  // No MSAA: the hairlines are one device pixel and the multisample resolve is the dearest pass on a weak GPU.
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  host = { canvas, renderer, views: new Set(), owner: null, size: '', lost: false };
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    host.lost = true;
    for (const view of host.views) view.onLost?.(); // each flow falls back to its settled 2D frame
  });
  return host;
}

// Pixel ratio from the quality tier and an absolute pixel budget, never raw devicePixelRatio.
function budgetRatio(quality, width, height) {
  const pixels = width * height * quality.dpr * quality.dpr;
  return quality.dpr * (pixels > quality.maxPixels ? Math.sqrt(quality.maxPixels / pixels) : 1);
}

export function createGL(section, quality) {
  const h = getHost();
  if (h.lost) throw new Error('webgl context lost');
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, 1, -1, 1); // CSS px, y down
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uInk: { value: new Color() },
      uAccent: { value: new Color() },
      uAlpha: { value: 0.5 },
      uReveal: { value: 1e6 },
    },
  });
  let geometry = null, lines = null, posAttr = null, sepAttr = null;
  let width = 0, height = 0, pr = 1;

  // Size the drawing buffer for this view (only when it changes hands or the section resizes).
  const render = () => {
    const key = `${width}x${height}@${pr}`;
    if (h.size !== key) {
      h.size = key;
      h.renderer.setPixelRatio(pr);
      h.renderer.setSize(width, height, false);
    }
    h.renderer.render(scene, camera);
  };

  const view = {
    kind: 'webgl',
    visible: true,
    onLost: null,
    // A view may animate when it holds the canvas, or when whoever holds it is away from the screen.
    active: () => !h.owner || h.owner === view || !h.owner.visible,
    // pos (x, y, opacity per point) and sep (per point) are the tracer's arrays; the GPU buffers alias them.
    resize(w, hh, pos, sep, lineCount, maxPts) {
      width = w; height = hh;
      pr = budgetRatio(quality, w, hh);
      camera.right = w;
      camera.bottom = hh;
      camera.updateProjectionMatrix();
      // A device pixel is the hairline; on dense screens it needs more ink to read at the same weight.
      material.uniforms.uAlpha.value = pr > 1.4 ? 0.85 : 0.62;
      if (lines) { scene.remove(lines); geometry.dispose(); }
      geometry = new BufferGeometry();
      posAttr = new BufferAttribute(pos, 3);
      sepAttr = new BufferAttribute(sep, 1);
      geometry.setAttribute('position', posAttr);
      geometry.setAttribute('aSep', sepAttr);
      const index = new Uint32Array(lineCount * (maxPts - 1) * 2);
      let j = 0;
      for (let l = 0; l < lineCount; l++) {
        for (let k = 0; k < maxPts - 1; k++) { index[j++] = l * maxPts + k; index[j++] = l * maxPts + k + 1; }
      }
      geometry.setIndex(new BufferAttribute(index, 1));
      lines = new LineSegments(geometry, material);
      lines.frustumCulled = false;
      scene.add(lines);
    },
    colors(ink, accent) {
      material.uniforms.uInk.value.setRGB(...ink, SRGBColorSpace);
      material.uniforms.uAccent.value.setRGB(...accent, SRGBColorSpace);
    },
    // Called after the tracer rewrote the arrays.
    upload() { if (posAttr) { posAttr.needsUpdate = true; sepAttr.needsUpdate = true; } },
    draw({ reveal }) {
      if (!lines || h.lost) return;
      material.uniforms.uReveal.value = reveal;
      if (h.owner !== view) {
        // Someone near the screen holds the canvas, or this section is away from it: nothing to draw yet.
        if (!view.visible || !view.active()) return;
        h.owner = view;
        section.prepend(h.canvas);
      }
      render();
    },
    info: () => ({ pixelRatio: Number(pr.toFixed(2)), contexts: 1, views: h.views.size, owner: h.owner === view, lost: h.lost }),
    dispose() {
      geometry?.dispose();
      material.dispose();
      h.views.delete(view);
      if (h.owner === view) { h.owner = null; h.canvas.remove(); }
      if (!h.views.size) {
        h.renderer.dispose();
        h.renderer.forceContextLoss();
        h.canvas.remove();
        host = null;
      }
    },
  };
  h.views.add(view);
  return view;
}
