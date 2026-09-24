// The flow's GL renderer: one LineSegments of hairlines, coloured and pulsed in the shader. Lazy chunk (three).
import { WebGLRenderer, Scene, OrthographicCamera, BufferGeometry, BufferAttribute, LineSegments, ShaderMaterial, Color, SRGBColorSpace } from 'three';
import { applyRendererBudget } from '../lib/quality-tiers.js';

const vertexShader = /* glsl */ `
  attribute float aSep;
  varying float vS;
  varying float vSep;
  varying float vX;
  void main() {
    vS = position.z; // arc length rides in z so the positions buffer is the tracer's own array
    vSep = aSep;
    vX = position.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uAlpha;
  uniform float uPhase;
  uniform float uPulse;
  uniform float uReveal;
  varying float vS;
  varying float vSep;
  varying float vX;
  void main() {
    if (vX > uReveal) discard;
    // A smoke streak travelling downstream: a short rise, a longer tail, one per 260 px of line.
    float p = fract((vS - uPhase) / 260.0);
    float streak = smoothstep(0.0, 0.06, p) * (1.0 - smoothstep(0.06, 0.4, p));
    float sep = smoothstep(0.3, 0.8, vSep);
    vec3 color = mix(uInk, uAccent, sep);
    float alpha = uAlpha * (0.6 + 0.4 * uPulse * streak) + sep * 0.25;
    gl_FragColor = vec4(color, min(alpha, 1.0));
    #include <colorspace_fragment>
  }
`;

export function createGL(canvas, quality) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
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
      uPhase: { value: 0 },
      uPulse: { value: 1 },
      uReveal: { value: 1e6 },
    },
  });
  let geometry = null;
  let lines = null;
  let posAttr = null;
  let sepAttr = null;

  return {
    kind: 'webgl',
    // pos (xyz per point) and sep (per point) are the tracer's arrays; the GPU buffers alias them.
    resize(width, height, pos, sep, lineCount, maxPts) {
      applyRendererBudget(renderer, quality, width, height);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      // A device pixel is the hairline; on dense screens it needs more ink to read at the same weight.
      material.uniforms.uAlpha.value = renderer.getPixelRatio() > 1.4 ? 0.72 : 0.5;
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
    upload() { posAttr.needsUpdate = true; sepAttr.needsUpdate = true; },
    draw({ phase, pulse, reveal }) {
      material.uniforms.uPhase.value = phase;
      material.uniforms.uPulse.value = pulse;
      material.uniforms.uReveal.value = reveal;
      renderer.render(scene, camera);
    },
    dispose() {
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
