// The flow's GL renderer: one LineSegments of hairlines, coloured and pulsed in the shader. Lazy chunk (three).
import { WebGLRenderer, Scene, OrthographicCamera, BufferGeometry, BufferAttribute, LineSegments, ShaderMaterial, Color, SRGBColorSpace } from 'three';
import { applyRendererBudget } from '../lib/quality-tiers.js';

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
      uReveal: { value: 1e6 },
    },
  });
  let geometry = null;
  let lines = null;
  let posAttr = null;
  let sepAttr = null;

  return {
    kind: 'webgl',
    // pos (x, y, opacity per point) and sep (per point) are the tracer's arrays; the GPU buffers alias them.
    resize(width, height, pos, sep, lineCount, maxPts) {
      applyRendererBudget(renderer, quality, width, height);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      // A device pixel is the hairline; on dense screens it needs more ink to read at the same weight.
      material.uniforms.uAlpha.value = renderer.getPixelRatio() > 1.4 ? 0.85 : 0.62;
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
    draw({ reveal }) {
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
