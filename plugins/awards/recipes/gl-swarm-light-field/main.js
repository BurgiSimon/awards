import { awards } from '../_shared/awards-hook.js';
import { motionTier, syncMotionTierAttribute } from '../_shared/reduced-motion.js';
import { detectQualityTier, applyRendererBudget } from '../_shared/quality-tiers.js';
import { ticker } from '../_shared/raf.js';

// A footer swarm: CPU-simulated seeds written into float textures, drawn in one instanced call, lit by a
// light that rides the pointer and shadowed through a coarse voxel grid of where the swarm is.
// Three.js is imported only when the footer comes near, so the page above never pays for it.

syncMotionTierAttribute();
const html = document.documentElement;
const footer = document.querySelector('[data-footer]');
const canvas = document.querySelector('[data-gl]');
const readout = document.querySelector('[data-gl-readout]');
const tier = motionTier();
const state = { gl: false, loaded: false, running: false, inView: false, beans: 0, frames: 0, simSteps: 0, pushes: 0, pointerSeen: false, light: [0, 0, 0], error: null, disposed: false };

// The world, in scene units (the footer is about 3.2 × 2 units at 16:10). These are this recipe's own values.
const SEED = 0.022;                        // seed half-length
const CONTACT = SEED * 2 * 0.7;            // seeds may overlap 30 % before the contact pass separates them
const SPIRAL_RADIUS = 0.2, SPIRAL_FREQ = 8;
const CURVE_AMP = 0.1, CURVE_FREQ = 8, CURVE_SPEED = 0.25;
const DRIFT_SPEED = 0.2, DRIFT_RATE = 2, ATTRACTION_RATE = 0.5, DAMPING_RATE = 1;
const POINTER_RADIUS = 0.2, POINTER_PUSH = 0.25, POINTER_CARRY = 6;
const LIGHT_LIFT = 0.3;                    // the light floats this far in front of the swarm plane

const quatVert = /* glsl */ `
  vec3 qrot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }`;

// Shared by the seed shader and the field passes: voxel index space has voxel centres at integers.
const fieldChunk = /* glsl */ `
  uniform sampler2D uField; uniform vec2 uAtlas; uniform float uCols; uniform vec3 uCount; uniform vec3 uVolMin; uniform vec3 uVoxel;
  vec3 worldToGrid(vec3 p) { return (p - uVolMin) / uVoxel; }
  vec2 sliceUv(vec2 xy, float z) { return (xy + vec2(mod(z, uCols), floor(z / uCols)) * uCount.xy + 0.5) / uAtlas; }
  float sampleField(vec3 g) {
    vec3 c = clamp(g, vec3(0.0), uCount - 1.0);
    float z0 = floor(c.z); float z1 = min(z0 + 1.0, uCount.z - 1.0);
    return mix(texture2D(uField, sliceUv(c.xy, z0)).r, texture2D(uField, sliceUv(c.xy, z1)).r, c.z - z0);
  }`;

const seedVert = /* glsl */ `
  attribute vec2 instanceUv;
  uniform sampler2D uPos; uniform sampler2D uRot;
  varying vec3 vNormal; varying vec3 vWorld; varying float vBright; varying float vCrease;
  ${quatVert}
  void main() {
    vec4 p = texture2D(uPos, instanceUv);
    vec4 q = texture2D(uRot, instanceUv);
    vec3 world = p.xyz + qrot(q, position);
    vNormal = normalize(qrot(q, normal));
    vWorld = world; vBright = p.w; vCrease = uv.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }`;

const seedFrag = /* glsl */ `
  uniform vec3 uLight; uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uLightColor;
  uniform float uFieldStrength; uniform float uAmbient; uniform float uAttK; uniform float uLightPower;
  varying vec3 vNormal; varying vec3 vWorld; varying float vBright; varying float vCrease;
  ${fieldChunk}
  void main() {
    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(cameraPosition - vWorld);
    vec3 L = uLight - vWorld; float d = length(L); L /= d;
    vec3 H = normalize(L + V);
    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 80.0 - 40.0 * vBright);
    float att = uLightPower / (1.0 + uAttK * d * d);
    // Occlusion from the voxel grid: one voxel out along the normal, one and two voxels toward the light.
    float step1 = min(uVoxel.x, min(uVoxel.y, uVoxel.z));
    vec3 g = worldToGrid(vWorld);
    float ao = 1.0 - 0.55 * sampleField(g + N * step1 / uVoxel) * uFieldStrength;
    ao *= ao;
    float block = max(sampleField(g + L * step1 / uVoxel), sampleField(g + 2.0 * L * step1 / uVoxel));
    float shadow = 1.0 - 0.7 * block * uFieldStrength; shadow *= shadow;
    vec3 albedo = mix(uColA, uColB, vBright) * (0.75 + 0.25 * vCrease);
    vec3 col = albedo * uLightColor * diff * att * shadow * ao;
    col += albedo * uAmbient * ao;
    col += uLightColor * spec * att * shadow * ao * 0.35;
    col += albedo * max(-dot(N, L), 0.0) * att * (1.0 - shadow) * 0.04; // a little light through the gaps
    gl_FragColor = vec4(1.0 - exp(-col * 1.6), 1.0);
    #include <colorspace_fragment>
  }`;

// One-pixel points: every seed marks its voxel in the drawn atlas; MAX blending makes the mark binary.
const splatVert = /* glsl */ `
  attribute vec2 instanceUv;
  uniform sampler2D uPos;
  ${fieldChunk}
  void main() {
    vec3 g = clamp(floor(worldToGrid(texture2D(uPos, instanceUv).xyz) + 0.5), vec3(0.0), uCount - 1.0);
    gl_Position = vec4(sliceUv(g.xy, g.z) * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
  }`;
const splatFrag = /* glsl */ `void main() { gl_FragColor = vec4(1.0); }`;

// Blur across a 3 × 3 × 3 neighbourhood (bilinear taps between voxels, slices weighted ¼ ½ ¼) and ease toward it.
const blendVert = /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const blendFrag = /* glsl */ `
  uniform sampler2D uPrev; uniform sampler2D uDrawn; uniform float uRise; uniform float uFall;
  uniform vec2 uAtlas; uniform float uCols; uniform vec3 uCount;
  float tap(vec2 xy, float z) {
    vec2 c = clamp(xy, vec2(0.0), uCount.xy - 1.0);
    float zz = clamp(z, 0.0, uCount.z - 1.0);
    return texture2D(uDrawn, (c + vec2(mod(zz, uCols), floor(zz / uCols)) * uCount.xy + 0.5) / uAtlas).r;
  }
  float slice4(vec2 xy, float z) { return (tap(xy + vec2(-0.5, -0.5), z) + tap(xy + vec2(0.5, -0.5), z) + tap(xy + vec2(-0.5, 0.5), z) + tap(xy + vec2(0.5, 0.5), z)) * 0.25; }
  void main() {
    vec2 px = floor(gl_FragCoord.xy);
    vec2 cr = floor(px / uCount.xy);
    float z = cr.y * uCols + cr.x;
    float prev = texture2D(uPrev, gl_FragCoord.xy / uAtlas).r;
    if (z > uCount.z - 1.0) { gl_FragColor = vec4(0.0); return; }
    vec2 xy = px - cr * uCount.xy;
    float curr = (slice4(xy, z - 1.0) + 2.0 * slice4(xy, z) + slice4(xy, z + 1.0)) * 0.25;
    prev += (curr - prev) * (curr > prev ? uRise : uFall);
    gl_FragColor = vec4(prev, prev, prev, 1.0);
  }`;

function seedGeometry(THREE) {
  // A seed: a squashed ellipsoid with a crease down its flat face. Generated, so there is no model file.
  const g = new THREE.SphereGeometry(1, 12, 8); // about 190 triangles a seed: the swarm is read in aggregate
  const p = g.attributes.position;
  const crease = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i) * 0.62, y = p.getY(i), z = p.getZ(i) * 0.5;
    const groove = z > 0 ? Math.exp(-(x * x) / 0.012) : 0;
    z -= 0.7 * z * groove;
    crease[i] = 1 - groove;
    p.setXYZ(i, x * SEED, y * SEED, z * SEED);
  }
  // uv.y carries the crease shade into the fragment stage.
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setY(i, crease[i]);
  g.computeVertexNormals();
  return g;
}

async function start() {
  const THREE = await import('three');
  state.loaded = true;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { state.error = String(e); return false; }
  if (!renderer.capabilities.isWebGL2) { renderer.dispose(); state.error = 'webgl2 required for float data textures and MAX blending'; return false; }
  const profile = await detectQualityTier({ sampleMs: 250 });
  renderer.setClearColor(0x000000, 0);

  const coarse = matchMedia('(pointer: coarse)').matches;
  const side = coarse || innerWidth < 760 || profile.tier === 'low' ? 24 : 32;
  const COUNT = side * side;
  state.beans = COUNT;

  const css = getComputedStyle(html);
  const token = (name, fallback) => new THREE.Color(css.getPropertyValue(name).trim() || fallback);
  const colA = token('--accent', '#ffc800').lerp(new THREE.Color('#5a3a22'), 0.55);
  const colB = token('--ink', '#f4f2ee').lerp(new THREE.Color('#8a5a33'), 0.6);
  const lightColor = token('--accent', '#ffc800').lerp(new THREE.Color('#ffffff'), 0.55);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.set(0, 0, 3.2);

  // Path and voxel volume follow the footer's aspect: a diagonal across a landscape footer, a steep fall on a phone.
  const path = { start: new THREE.Vector3(), end: new THREE.Vector3(), seg: new THREE.Vector3(), tan: new THREE.Vector3(), u: new THREE.Vector3(), v: new THREE.Vector3(), len: 1, time: 0 };
  const field = { count: new THREE.Vector3(), volMin: new THREE.Vector3(), voxel: new THREE.Vector3(), cols: 1, atlas: new THREE.Vector2() };
  function layout(aspect) {
    const portrait = aspect < 1;
    path.start.set(portrait ? -0.45 : -1.1, portrait ? 0.85 : 0.36, 0);
    path.end.set(portrait ? 0.45 : 1.1, portrait ? -0.85 : -0.36, 0);
    path.seg.subVectors(path.end, path.start);
    path.len = path.seg.length();
    path.tan.copy(path.seg).divideScalar(path.len);
    path.u.crossVectors(path.tan, new THREE.Vector3(0, 0, 1)).normalize();
    path.v.crossVectors(path.tan, path.u).normalize();
    const reach = SPIRAL_RADIUS + CURVE_AMP + 0.05;
    const min = new THREE.Vector3(Math.min(path.start.x, path.end.x) - reach, Math.min(path.start.y, path.end.y) - reach, -reach);
    const max = new THREE.Vector3(Math.max(path.start.x, path.end.x) + reach, Math.max(path.start.y, path.end.y) + reach, reach);
    field.count.set(portrait ? 16 : 32, portrait ? 32 : 16, 16);
    field.volMin.copy(min);
    field.voxel.subVectors(max, min).divide(field.count.clone().subScalar(1));
    field.cols = Math.ceil(Math.sqrt(field.count.x * field.count.y * field.count.z) / field.count.x);
    field.atlas.set(field.count.x * field.cols, field.count.y * Math.ceil(field.count.z / field.cols));
  }

  // Per-seed state. Positions, velocities and the path parameters live in typed arrays on the CPU.
  const pos = new Float32Array(COUNT * 3), vel = new Float32Array(COUNT * 3);
  const radius = new Float32Array(COUNT), phase = new Float32Array(COUNT), freq = new Float32Array(COUNT), bright = new Float32Array(COUNT);
  const quat = new Float32Array(COUNT * 4), tumble = new Float32Array(COUNT * 4);
  const posData = new Float32Array(COUNT * 4), rotData = new Float32Array(COUNT * 4);
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), target = new THREE.Vector3(), velV = new THREE.Vector3();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion(), m4 = new THREE.Matrix4();
  const yAxis = new THREE.Vector3(), xAxis = new THREE.Vector3(), zAxis = new THREE.Vector3();

  function pathTarget(t, i, out) {
    const a = CURVE_FREQ * t * path.len + path.time * CURVE_SPEED;
    out.copy(path.start).addScaledVector(path.seg, t);
    out.addScaledVector(path.u, CURVE_AMP * Math.sin(a)).addScaledVector(path.v, CURVE_AMP * Math.cos(a));
    const s = SPIRAL_FREQ * freq[i] * t * path.len + phase[i];
    return out.addScaledVector(path.u, radius[i] * Math.cos(s)).addScaledVector(path.v, radius[i] * Math.sin(s));
  }
  function seed() {
    for (let i = 0; i < COUNT; i++) {
      radius[i] = Math.random() * SPIRAL_RADIUS; phase[i] = Math.random() * Math.PI * 2; freq[i] = Math.random() * 2; bright[i] = Math.random();
      pathTarget(Math.random(), i, target);
      target.toArray(pos, i * 3);
      tmp.copy(path.tan).multiplyScalar(DRIFT_SPEED).toArray(vel, i * 3);
      qa.setFromAxisAngle(tmp.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize(), (Math.random() - 0.5) * Math.PI * 2).toArray(tumble, i * 4);
      orient(i, 1);
    }
  }
  function orient(i, amount) {
    // Long axis along the direction of travel, then a fixed per-seed tumble so the swarm never reads as aligned.
    velV.fromArray(vel, i * 3);
    if (velV.lengthSq() > 1e-8) {
      yAxis.copy(velV).normalize();
      xAxis.set(0, 0, 1); if (Math.abs(yAxis.z) > 0.99) xAxis.set(1, 0, 0);
      xAxis.cross(yAxis).normalize(); zAxis.crossVectors(xAxis, yAxis);
      qb.setFromRotationMatrix(m4.makeBasis(xAxis, yAxis, zAxis));
    } else qb.fromArray(quat, i * 4);
    qa.fromArray(quat, i * 4);
    if (amount >= 1 || qa.lengthSq() < 0.5) qa.copy(qb); else qa.slerp(qb, amount);
    qa.toArray(quat, i * 4);
    qc.copy(qa).multiply(qb.fromArray(tumble, i * 4)).toArray(rotData, i * 4);
  }

  // Pointer: projected onto the swarm plane (z = 0). The light rides it; the swarm is pushed by it.
  const pointer = { has: false, ndc: new THREE.Vector2(), world: new THREE.Vector3(), prev: new THREE.Vector3(), delta: new THREE.Vector3() };
  const light = new THREE.Vector3(0.4, 0.2, LIGHT_LIFT);
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  function onPointer(e) {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) return;
    pointer.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointer.has = true; state.pointerSeen = true;
  }
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerdown', onPointer, { passive: true });

  // Spatial hash for the contact pass: O(n) instead of every pair.
  const cells = new Map();
  function contacts() {
    cells.clear();
    for (let i = 0; i < COUNT; i++) {
      const k = `${Math.floor(pos[i * 3] / CONTACT)},${Math.floor(pos[i * 3 + 1] / CONTACT)},${Math.floor(pos[i * 3 + 2] / CONTACT)}`;
      let c = cells.get(k); if (!c) cells.set(k, (c = [])); c.push(i);
    }
    const c2 = CONTACT * CONTACT;
    for (let i = 0; i < COUNT; i++) {
      const cx = Math.floor(pos[i * 3] / CONTACT), cy = Math.floor(pos[i * 3 + 1] / CONTACT), cz = Math.floor(pos[i * 3 + 2] / CONTACT);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const list = cells.get(`${cx + dx},${cy + dy},${cz + dz}`); if (!list) continue;
        for (const j of list) {
          if (j <= i) continue;
          const ex = pos[j * 3] - pos[i * 3], ey = pos[j * 3 + 1] - pos[i * 3 + 1], ez = pos[j * 3 + 2] - pos[i * 3 + 2];
          const d2 = ex * ex + ey * ey + ez * ez;
          if (d2 >= c2 || d2 < 1e-12) continue;
          const d = Math.sqrt(d2), push = (CONTACT - d) * 0.5 / d;
          pos[i * 3] -= ex * push; pos[i * 3 + 1] -= ey * push; pos[i * 3 + 2] -= ez * push;
          pos[j * 3] += ex * push; pos[j * 3 + 1] += ey * push; pos[j * 3 + 2] += ez * push;
        }
      }
    }
  }

  function step(dt) {
    path.time += dt;
    const pull = 1 - Math.exp(-dt * ATTRACTION_RATE), drift = 1 - Math.exp(-dt * DRIFT_RATE), damp = Math.exp(-dt * DAMPING_RATE);
    const carry = Math.exp(-dt * 10);
    const reach = POINTER_RADIUS + SEED;
    for (let i = 0; i < COUNT; i++) {
      const o = i * 3;
      tmp.fromArray(pos, o); velV.fromArray(vel, o);
      let t = tmp2.subVectors(tmp, path.start).dot(path.seg) / (path.len * path.len);
      pathTarget(t, i, target);
      velV.addScaledVector(tmp2.subVectors(tmp, target), -pull);
      velV.addScaledVector(path.tan, (DRIFT_SPEED - velV.dot(path.tan)) * drift);
      velV.multiplyScalar(damp);
      tmp.addScaledVector(velV, dt);
      t = tmp2.subVectors(tmp, path.start).dot(path.seg) / (path.len * path.len);
      if (t > 1) pathTarget(0, i, tmp); else if (t < 0) pathTarget(1, i, tmp);
      if (pointer.has) {
        tmp2.subVectors(tmp, pointer.world);
        const d = tmp2.length();
        if (d < reach && d > 1e-3) { velV.addScaledVector(tmp2, (POINTER_PUSH * (reach - d)) / d).addScaledVector(pointer.delta, POINTER_CARRY * carry); state.pushes++; }
      }
      tmp.toArray(pos, o); velV.toArray(vel, o);
    }
    contacts();
    for (let i = 0; i < COUNT; i++) orient(i, 0.8);
    state.simSteps++;
  }
  function upload() {
    for (let i = 0; i < COUNT; i++) { posData[i * 4] = pos[i * 3]; posData[i * 4 + 1] = pos[i * 3 + 1]; posData[i * 4 + 2] = pos[i * 3 + 2]; posData[i * 4 + 3] = bright[i]; }
    posTex.needsUpdate = true; rotTex.needsUpdate = true;
  }

  const posTex = new THREE.DataTexture(posData, side, side, THREE.RGBAFormat, THREE.FloatType);
  const rotTex = new THREE.DataTexture(rotData, side, side, THREE.RGBAFormat, THREE.FloatType);
  for (const t of [posTex, rotTex]) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  const instanceUv = new Float32Array(COUNT * 2);
  for (let i = 0; i < COUNT; i++) { instanceUv[i * 2] = ((i % side) + 0.5) / side; instanceUv[i * 2 + 1] = (Math.floor(i / side) + 0.5) / side; }

  // Light field targets: drawn (this frame's marks), prev and curr (the eased field, ping-pong). RGBA8 so tests can read them.
  const rtOpts = { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false };
  let drawnRT, prevRT, currRT;
  const fieldUniforms = { uField: { value: null }, uAtlas: { value: field.atlas }, uCols: { value: 1 }, uCount: { value: field.count }, uVolMin: { value: field.volMin }, uVoxel: { value: field.voxel } };
  function fieldTargets() {
    for (const rt of [drawnRT, prevRT, currRT]) rt?.dispose();
    drawnRT = new THREE.WebGLRenderTarget(field.atlas.x, field.atlas.y, rtOpts);
    prevRT = new THREE.WebGLRenderTarget(field.atlas.x, field.atlas.y, rtOpts);
    currRT = new THREE.WebGLRenderTarget(field.atlas.x, field.atlas.y, rtOpts);
    for (const rt of [prevRT, currRT]) { renderer.setRenderTarget(rt); renderer.clear(); }
    renderer.setRenderTarget(null);
    fieldUniforms.uCols.value = field.cols;
    fieldUniforms.uField.value = currRT.texture;
  }

  const geo = new THREE.InstancedBufferGeometry();
  const base = seedGeometry(THREE);
  for (const name of ['position', 'normal', 'uv']) geo.setAttribute(name, base.attributes[name]);
  geo.setIndex(base.getIndex());
  geo.setAttribute('instanceUv', new THREE.InstancedBufferAttribute(instanceUv, 2));
  geo.instanceCount = COUNT;
  const seedUniforms = { ...fieldUniforms, uPos: { value: posTex }, uRot: { value: rotTex }, uLight: { value: light }, uColA: { value: colA }, uColB: { value: colB }, uLightColor: { value: lightColor }, uFieldStrength: { value: 1 }, uAmbient: { value: 0.05 }, uAttK: { value: 9 }, uLightPower: { value: 2.2 } };
  const seedMat = new THREE.ShaderMaterial({ vertexShader: seedVert, fragmentShader: seedFrag, uniforms: seedUniforms });
  const mesh = new THREE.Mesh(geo, seedMat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const splatGeo = new THREE.BufferGeometry();
  splatGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  splatGeo.setAttribute('instanceUv', new THREE.BufferAttribute(instanceUv, 2));
  const splatMat = new THREE.ShaderMaterial({ vertexShader: splatVert, fragmentShader: splatFrag, uniforms: { ...fieldUniforms, uPos: { value: posTex } }, blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, depthTest: false, depthWrite: false });
  const splat = new THREE.Points(splatGeo, splatMat); splat.frustumCulled = false;
  const splatScene = new THREE.Scene(); splatScene.add(splat);
  const blendMat = new THREE.ShaderMaterial({ vertexShader: blendVert, fragmentShader: blendFrag, depthTest: false, depthWrite: false, uniforms: { uPrev: { value: null }, uDrawn: { value: null }, uRise: { value: 0.15 }, uFall: { value: 0.05 }, uAtlas: { value: field.atlas }, uCols: fieldUniforms.uCols, uCount: { value: field.count } } });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blendMat); quad.frustumCulled = false;
  const quadScene = new THREE.Scene(); quadScene.add(quad);
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function updateField(instant = false) {
    renderer.setRenderTarget(drawnRT); renderer.clear(); renderer.render(splatScene, ortho);
    [prevRT, currRT] = [currRT, prevRT];
    blendMat.uniforms.uPrev.value = prevRT.texture;
    blendMat.uniforms.uDrawn.value = drawnRT.texture;
    blendMat.uniforms.uRise.value = instant ? 1 : 0.15;
    blendMat.uniforms.uFall.value = instant ? 1 : 0.05;
    renderer.setRenderTarget(currRT); renderer.render(quadScene, ortho);
    renderer.setRenderTarget(null);
    fieldUniforms.uField.value = currRT.texture;
  }

  let w = 0, h = 0;
  function resize() {
    const r = footer.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    applyRendererBudget(renderer, profile, w, h);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 1 ? 4.2 : 3.2; // a portrait footer frames the steeper path from further back
    camera.updateProjectionMatrix();
    const before = field.atlas.x;
    layout(camera.aspect);
    if (!drawnRT || before !== field.atlas.x || drawnRT.height !== field.atlas.y) fieldTargets();
  }
  resize();
  seed();
  upload();
  updateField(true);
  addEventListener('resize', () => { resize(); if (tier !== 'full') { upload(); updateField(true); render(); } });

  function render() {
    renderer.render(scene, camera);
    state.frames++;
  }
  let clock = 0;
  function frame(dt) {
    clock += dt;
    if (pointer.has) {
      ray.setFromCamera(pointer.ndc, camera);
      pointer.prev.copy(pointer.world);
      ray.ray.intersectPlane(plane, pointer.world);
      pointer.delta.subVectors(pointer.world, pointer.prev);
      if (pointer.delta.lengthSq() > 0.25) pointer.delta.set(0, 0, 0); // first frame after a jump
      light.lerp(tmp.copy(pointer.world).setZ(LIGHT_LIFT), 1 - Math.exp(-dt * 12));
    } else {
      // No pointer yet (or a touch screen): the light idles on a slow figure-eight so the room is never dark.
      light.lerp(tmp.set(0.55 * Math.sin(clock * 0.3), 0.3 * Math.sin(clock * 0.46), LIGHT_LIFT), 1 - Math.exp(-dt * 2));
    }
    state.light = light.toArray().map((v) => Math.round(v * 1000) / 1000);
    step(Math.min(dt, 1 / 20));
    upload();
    updateField();
    render();
  }

  // The loop runs only while the footer is on screen.
  let unsubscribe = null;
  const io = new IntersectionObserver(([e]) => {
    state.inView = e.isIntersecting;
    if (tier !== 'full') return;
    if (e.isIntersecting && !unsubscribe) { unsubscribe = ticker.add(frame); state.running = true; }
    else if (!e.isIntersecting && unsubscribe) { unsubscribe(); unsubscribe = null; state.running = false; }
  });
  io.observe(footer);

  // Test hooks: read the field's occupancy and the swarm's shading with the field on and off.
  const probeRT = new THREE.WebGLRenderTarget(256, 160, { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: true });
  window.__swarm = {
    occupancy() {
      const px = new Uint8Array(field.atlas.x * field.atlas.y * 4);
      renderer.readRenderTargetPixels(currRT, 0, 0, field.atlas.x, field.atlas.y, px);
      let sum = 0, lit = 0;
      for (let i = 0; i < px.length; i += 4) { sum += px[i]; if (px[i] > 8) lit++; }
      return { mean: sum / (px.length / 4) / 255, voxels: lit };
    },
    shading() {
      const measure = (strength) => {
        seedUniforms.uFieldStrength.value = strength;
        renderer.setRenderTarget(probeRT); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
        const px = new Uint8Array(256 * 160 * 4);
        renderer.readRenderTargetPixels(probeRT, 0, 0, 256, 160, px);
        let sum = 0, n = 0;
        for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 0) { sum += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; n++; }
        return { luma: n ? sum / n : 0, coverage: n / (256 * 160) };
      };
      const on = measure(1), off = measure(0);
      seedUniforms.uFieldStrength.value = 1;
      return { lumaOn: Math.round(on.luma * 100) / 100, lumaOff: Math.round(off.luma * 100) / 100, ratio: off.luma ? Math.round((on.luma / off.luma) * 1000) / 1000 : 1, coverage: Math.round(on.coverage * 10000) / 10000 };
    },
  };

  html.classList.add('gl-active');
  readout.textContent = `webgl · ${profile.tier} · ${COUNT} seeds`;
  state.gl = true;
  if (tier !== 'full') render(); // reduced motion: one settled frame, the light parked

  function dispose() {
    unsubscribe?.(); io.disconnect();
    for (const o of [drawnRT, prevRT, currRT, probeRT, posTex, rotTex, geo, base, splatGeo, seedMat, splatMat, blendMat, quad.geometry]) o?.dispose();
    renderer.dispose();
    html.classList.remove('gl-active');
    state.gl = false; state.running = false; state.disposed = true;
  }
  addEventListener('pagehide', dispose, { once: true });
  return true;
}

const glPossible = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
if (tier === 'static' || !glPossible) {
  readout.textContent = tier === 'static' ? 'dom (static tier)' : 'dom (no webgl2)';
  awards.ready();
} else {
  // Fetch and start the GL only when the footer is within a screen of the viewport.
  let started = false;
  const near = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting || started) return;
    started = true; near.disconnect();
    try { if (!(await start())) readout.textContent = 'dom (webgl failed)'; } catch (err) { state.error = String(err); readout.textContent = 'dom (webgl failed)'; }
  }, { rootMargin: '100% 0px' });
  near.observe(footer);
  awards.ready();
}

awards.addState(() => ({ motion: tier, ...state, canvasAriaHidden: canvas.getAttribute('aria-hidden') === 'true', footerText: !!document.querySelector('.site-footer__head')?.textContent }));
