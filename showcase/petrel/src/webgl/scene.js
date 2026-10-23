// The one rendered material on the page: a procedural armoured cable, its grapnel, the grapnel dragged across the
// seabed, and the cable cut open for the splice. One transparent canvas over the document, an orthographic camera in
// CSS pixels (so every piece lands on the DOM geometry it replaces), lit by a generated room environment; no model
// files, no textures. Renders only when a frame differs from the last one.
import {
  WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, InstancedMesh, Object3D, MeshStandardMaterial,
  CylinderGeometry, TubeGeometry, TorusGeometry, SphereGeometry, RingGeometry, Curve, CurvePath, LineCurve3, Vector3,
  CubicBezierCurve3, QuadraticBezierCurve3, Plane, PMREMGenerator, NeutralToneMapping, DoubleSide, DirectionalLight,
  DataTexture, MeshBasicMaterial, BackSide,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;

// A helix along y (downwards from 0) or along x (rightwards from 0).
class Helix extends Curve {
  constructor(radius, pitch, length, axis = 'y') {
    super();
    Object.assign(this, { radius, pitch, length, axis });
  }
  getPoint(t, target = new Vector3()) {
    const s = t * this.length;
    const a = (s / this.pitch) * TAU;
    const c = Math.cos(a) * this.radius;
    const d = Math.sin(a) * this.radius;
    return this.axis === 'y' ? target.set(c, -s, d) : target.set(s, c, d);
  }
}

// N copies of one helical wire, each turned 1/N about the axis: one draw call for a whole armour layer.
function armour(geometry, material, count, axis) {
  const mesh = new InstancedMesh(geometry, material, count);
  const o = new Object3D();
  for (let i = 0; i < count; i++) {
    o.rotation.set(0, 0, 0);
    if (axis === 'y') o.rotation.y = (i / count) * TAU;
    else o.rotation.x = (i / count) * TAU;
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  return mesh;
}

// The TIA fibre colours, as the static cutaway draws them.
const FIBRES = ['#1f5fbf', '#e07a1f', '#2e8b3e', '#7a4a24', '#7d8790', '#f2f2f2', '#c8261d', '#111417'];

export function mountScene(canvas, quality, context) {
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.localClippingEnabled = true;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.38;
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-1, 0.55, 0.75); // from the upper left, so every round thing has a lit and a dark side
  scene.add(key);

  const camera = new OrthographicCamera(0, 1, 0, -1, -4000, 4000);
  camera.position.z = 1000;

  const steel = new MeshStandardMaterial({ color: 0x737d84, metalness: 0.75, roughness: 0.36 });
  const forged = new MeshStandardMaterial({ color: 0x4f585e, metalness: 0.75, roughness: 0.5 });
  const pe = new MeshStandardMaterial({ color: 0x101416, metalness: 0, roughness: 0.48, side: DoubleSide });
  const owned = [steel, forged, pe];
  const geos = [];
  const keep = (g) => { geos.push(g); return g; };

  // ——— The cable: one tube from the deck, over the sheave and down to the grapnel ———
  // The armour is a procedural lay in the material: N wires wound at one lay length, each a crown with a groove on
  // either side, bump-mapped from screen-space derivatives (so it stays crisp at any pixel ratio) and darkened in the
  // grooves where the black core shows. Paying out moves the lay along the tube: one uniform, no geometry rebuilt.
  const lay = { uLength: { value: 1 }, uPitch: { value: 60 }, uPhase: { value: 0 }, uWires: { value: 8 } };
  const flat = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  flat.needsUpdate = true;
  const cableSteel = new MeshStandardMaterial({ color: 0x8a949a, metalness: 0.72, roughness: 0.34, bumpMap: flat, bumpScale: 1.6 });
  cableSteel.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, lay);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <bumpmap_pars_fragment>', `
#ifdef USE_BUMPMAP
  uniform sampler2D bumpMap;
  uniform float bumpScale;
  uniform float uLength;
  uniform float uPitch;
  uniform float uPhase;
  uniform float uWires;
  // 1 on a wire's crown, 0 in the groove between two wires.
  float layH(vec2 uv) {
    float w = uv.y * uWires + (uv.x * uLength - uPhase) / uPitch * uWires;
    return cos((fract(w) - 0.5) * 3.14159265);
  }
  vec2 dHdxy_fwd() {
    float h = layH(vBumpMapUv);
    return bumpScale * vec2(dFdx(h), dFdy(h));
  }
  vec3 perturbNormalArb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection) {
    vec3 vSigmaX = normalize(dFdx(surf_pos.xyz));
    vec3 vSigmaY = normalize(dFdy(surf_pos.xyz));
    vec3 vN = surf_norm;
    vec3 R1 = cross(vSigmaY, vN);
    vec3 R2 = cross(vN, vSigmaX);
    float fDet = dot(vSigmaX, R1) * faceDirection;
    vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
    return normalize(abs(fDet) * surf_norm - vGrad);
  }
#endif`)
      .replace('#include <map_fragment>', '#include <map_fragment>\n  float layCrown = layH(vBumpMapUv);\n  diffuseColor.rgb *= mix(0.16, 1.0, smoothstep(0.0, 0.75, layCrown));')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n  roughnessFactor = mix(0.85, roughnessFactor, layCrown);');
  };
  owned.push(cableSteel, flat);
  const cable = new Mesh(undefined, cableSteel);
  cable.frustumCulled = false;
  scene.add(cable);
  let built = { key: '', pitch: 60 };
  // A quarter turn around the sheave, in the cable's own path.
  class Arc extends Curve {
    constructor(cx, cy, r, a0, a1) { super(); Object.assign(this, { cx, cy, r, a0, a1 }); }
    getPoint(t, target = new Vector3()) {
      const a = this.a0 + (this.a1 - this.a0) * t;
      return target.set(this.cx + Math.cos(a) * this.r, this.cy + Math.sin(a) * this.r, 0);
    }
  }
  function buildCable(c) {
    const key = JSON.stringify(c);
    if (key === built.key) return;
    cable.geometry.dispose();
    const path = new CurvePath();
    const r = c.radius; // the wrap's centreline radius around the sheave
    // World y is minus document y; the path is fixed to the document and the mesh follows the scroll.
    path.add(new LineCurve3(new Vector3(c.deckX, -(c.sheaveY - r), 0), new Vector3(c.sheaveX, -(c.sheaveY - r), 0)));
    path.add(new Arc(c.sheaveX, -c.sheaveY, r, Math.PI / 2, Math.PI));
    path.add(new LineCurve3(new Vector3(c.sheaveX - r, -c.sheaveY, 0), new Vector3(c.sheaveX - r, -c.end, 0)));
    const length = path.getLength();
    cable.geometry = new TubeGeometry(path, Math.ceil(length / 4), c.width / 2, 20, false);
    lay.uLength.value = length;
    lay.uPitch.value = c.width * 3.4;
    built = { key, pitch: lay.uPitch.value };
  }

  // ——— The grapnel: a forged shank, a ring, a crown and four flukes; origin at the ring, pointing down ———
  const grapnelParts = [];
  {
    const ring = keep(new TorusGeometry(5, 1.7, 8, 20));
    const shank = keep(new CylinderGeometry(2.6, 3.4, 46, 10));
    const crown = keep(new SphereGeometry(5.2, 14, 10));
    const fluke = keep(new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0, -58, 0), new Vector3(17, -67, 0), new Vector3(21, -42, 0)), 18, 2.3, 6, false));
    const tip = keep(new SphereGeometry(2.6, 8, 6));
    grapnelParts.push({ ring, shank, crown, fluke, tip });
  }
  // A light-ink hull behind each part (back faces only, scaled out a touch), so the forged steel keeps an edge on the
  // near-black band at 4,212 m.
  const edge = new MeshBasicMaterial({ color: 0x9aa5ab, side: BackSide });
  owned.push(edge);
  function withEdge(geo, mat) {
    const g = new Group();
    g.add(new Mesh(geo, mat));
    const hull = new Mesh(geo, edge);
    // Scaled about the part's own centre, not its origin (a fluke's geometry sits away from the origin).
    if (!geo.boundingBox) geo.computeBoundingBox();
    hull.position.copy(geo.boundingBox.getCenter(new Vector3())).multiplyScalar(1 - 1.12);
    hull.scale.setScalar(1.12);
    g.add(hull);
    return g;
  }
  function grapnel() {
    const { ring, shank, crown, fluke, tip } = grapnelParts[0];
    const g = new Group();
    const r = withEdge(ring, forged); r.position.y = -6; g.add(r);
    const sh = withEdge(shank, forged); sh.position.y = -34; g.add(sh);
    const c = withEdge(crown, forged); c.position.y = -58; g.add(c);
    for (let i = 0; i < 4; i++) {
      const arm = new Group();
      arm.rotation.y = (i / 4) * TAU + Math.PI / 4;
      arm.add(withEdge(fluke, forged));
      const t = withEdge(tip, forged); t.position.set(21, -42, 0); arm.add(t);
      g.add(arm);
    }
    return g;
  }
  const hanging = grapnel();
  scene.add(hanging);
  const dragged = grapnel();
  dragged.rotation.z = -1.05; // lying on the ooze, the shank leaning toward the wire, the flukes trailing in
  scene.add(dragged);
  const crownLocal = new Vector3(0, -58, 0).applyAxisAngle(new Vector3(0, 0, 1), -1.05);

  // The drag wire: rebuilt when its curve moves.
  const dragWire = new Mesh(undefined, steel);
  dragWire.frustumCulled = false;
  scene.add(dragWire);

  // ——— The cut cable for the splice, in the cutaway drawing's own units (640 × 220, axis at y 110) ———
  const cut = new Group();
  cut.rotation.y = -0.35; // the cut faces turn toward the viewer
  scene.add(cut);
  const clip = { sheath: new Plane(), armour: new Plane(), copper: new Plane(), tube: new Plane() };
  const mats = {
    sheath: Object.assign(pe.clone(), { clippingPlanes: [clip.sheath] }),
    armour: Object.assign(steel.clone(), { clippingPlanes: [clip.armour] }),
    copper: Object.assign(new MeshStandardMaterial({ color: 0xb8703f, metalness: 1, roughness: 0.32, side: DoubleSide }), { clippingPlanes: [clip.copper] }),
    tube: Object.assign(new MeshStandardMaterial({ color: 0xc6cdd1, metalness: 0.9, roughness: 0.24, side: DoubleSide }), { clippingPlanes: [clip.tube] }),
    face: new MeshStandardMaterial({ color: 0x23292d, metalness: 0, roughness: 0.6, side: DoubleSide }),
    copperFace: new MeshStandardMaterial({ color: 0xc98552, metalness: 1, roughness: 0.4, side: DoubleSide }),
  };
  owned.push(...Object.values(mats));
  const fibreMats = FIBRES.map((c) => new MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0 }));
  owned.push(...fibreMats);
  const X0 = 60;
  const X1 = 600;
  const along = (geo) => { geo.rotateZ(-Math.PI / 2); geo.translate((X0 + X1) / 2 - 320, 0, 0); return keep(geo); };
  const sheath = new Mesh(along(new CylinderGeometry(40, 40, X1 - X0, 48, 1, true)), mats.sheath);
  const cap = new Mesh(keep(new SphereGeometry(40, 32, 16, Math.PI, Math.PI)), mats.sheath);
  cap.rotation.y = Math.PI / 2; cap.position.x = X0 - 320;
  const sheathFace = new Mesh(keep(new RingGeometry(31, 40, 48)), mats.face);
  const wireGeo = keep(new TubeGeometry(new Helix(27, 150, X1 - X0, 'x'), 180, 4.1, 8, false));
  wireGeo.translate(X0 - 320, 0, 0);
  const armourMesh = armour(wireGeo, mats.armour, 18, 'x');
  const copper = new Mesh(along(new CylinderGeometry(20, 20, X1 - X0, 40, 1, true)), mats.copper);
  const copperFace = new Mesh(keep(new RingGeometry(15, 20, 40)), mats.copperFace);
  const tube = new Mesh(along(new CylinderGeometry(14, 14, X1 - X0, 32, 1, true)), mats.tube);
  const tubeFace = new Mesh(keep(new RingGeometry(11.5, 14, 32)), mats.face);
  for (const f of [sheathFace, copperFace, tubeFace]) f.rotation.y = Math.PI / 2;
  const fibres = new Group();
  cut.add(sheath, cap, sheathFace, armourMesh, copper, copperFace, tube, tubeFace, fibres);
  const ease = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const tmpN = new Vector3();
  const tmpP = new Vector3();
  function setClip(plane, x) {
    tmpN.set(-1, 0, 0).applyQuaternion(cut.quaternion);
    tmpP.set(x - 320, 0, 0);
    cut.localToWorld(tmpP);
    plane.setFromNormalAndCoplanarPoint(tmpN, tmpP);
  }
  let fibreKey = '';
  function buildFibres(x4, fan) {
    const k = `${x4.toFixed(1)}|${fan.toFixed(3)}`;
    if (k === fibreKey) return;
    fibreKey = k;
    for (const m of fibres.children) m.geometry.dispose();
    fibres.clear();
    if (x4 > X1 - 2) return;
    const reach = 620 - (1 - fan) * 40;
    FIBRES.forEach((_, i) => {
      const a = (i / FIBRES.length) * TAU;
      const by = Math.cos(a) * 6;
      const bz = Math.sin(a) * 6;
      const fy = (-50 + i * 14) * fan + by * (1 - fan);
      const fz = bz * (1 - fan);
      const curve = new CubicBezierCurve3(
        new Vector3(x4 - 40 - 320, by, bz),
        new Vector3(x4 + 10 - 320, by, bz),
        new Vector3(x4 + 30 - 320, fy * 0.9, fz),
        new Vector3(reach - 320, fy, fz),
      );
      fibres.add(new Mesh(new TubeGeometry(curve, 28, 1.5, 6, false), fibreMats[i]));
    });
  }

  // Compile every program off the main thread where the driver can (KHR_parallel_shader_compile) before the first
  // frame, so the GL never lands as one long task.
  const ready = renderer.compileAsync(scene, camera).catch(() => {});

  let last = '';
  let lost = false;
  const onLost = (e) => { e.preventDefault(); lost = true; };
  canvas.addEventListener('webglcontextlost', onLost);

  function size(vw, vh) {
    const pixels = vw * vh;
    const ratio = Math.min(quality.dpr, Math.sqrt(quality.maxPixels / pixels));
    renderer.setPixelRatio(ratio);
    renderer.setSize(vw, vh, false);
    camera.right = vw;
    camera.bottom = -vh;
    camera.updateProjectionMatrix();
  }
  let sized = '';

  return {
    ready,
    update(f) {
      if (lost) return false;
      const k = JSON.stringify(f);
      if (k === last) return true;
      last = k;
      const s = `${f.vw}x${f.vh}`;
      if (s !== sized) { size(f.vw, f.vh); sized = s; }

      // The cable: one tube in document space from the deck to the grapnel; the mesh follows the scroll and the lay
      // runs along it by the pay-out phase.
      cable.visible = f.cable.visible;
      if (cable.visible) {
        buildCable(f.cable.path);
        cable.position.set(0, f.scroll, 0);
        lay.uPhase.value = f.phase;
      }
      hanging.visible = f.grapnel.visible;
      if (hanging.visible) {
        // The arrival at 4,212 m reads at the cable's scale on desktop and tablet; on a phone the cable runs in the
        // margin beside the copy, so the grapnel keeps its own size there and never reaches the text.
        hanging.scale.setScalar(f.vw >= 768 ? 1.7 : 1);
        hanging.position.set(f.grapnel.x, -f.grapnel.y + 2, 30);
        hanging.rotation.y = f.phase * 0.004;
      }

      // The drag: the crown on the ooze, the wire from the ring up and ahead to the ship.
      dragged.visible = dragWire.visible = f.drag.visible;
      if (f.drag.visible) {
        const sc = f.drag.scale;
        dragged.scale.setScalar(sc);
        const [cx, cy] = f.drag.crown;
        const ringX = cx - crownLocal.x * sc;
        const ringY = -cy - crownLocal.y * sc;
        dragged.position.set(ringX, ringY, 30);
        const curve = new CubicBezierCurve3(
          new Vector3(f.drag.lead[0], -f.drag.lead[1], 30),
          new Vector3(f.drag.c1[0], -f.drag.c1[1], 30),
          new Vector3(f.drag.c2[0], -f.drag.c2[1], 30),
          new Vector3(ringX, ringY - 5 * sc, 30),
        );
        dragWire.geometry?.dispose();
        dragWire.geometry = new TubeGeometry(curve, 48, 1.6, 6, false);
      }

      // The splice: the drawing's box sets the scale; the layers step back in turn and the fibres fan out.
      cut.visible = f.cutaway.visible;
      if (cut.visible) {
        const sc = f.cutaway.width / 640;
        cut.scale.setScalar(sc);
        cut.position.set(f.cutaway.left + 320 * sc, -(f.cutaway.top + 110 * (f.cutaway.height / 220)), 0);
        cut.updateMatrixWorld(true);
        const p = f.cutaway.open;
        const x1 = X1 - 280 * ease(p, 0, 0.4);
        const x2 = X1 - 180 * ease(p, 0.15, 0.55);
        const x3 = X1 - 110 * ease(p, 0.3, 0.7);
        const x4 = X1 - 60 * ease(p, 0.45, 0.85);
        setClip(clip.sheath, x1); setClip(clip.armour, x2); setClip(clip.copper, x3); setClip(clip.tube, x4);
        sheathFace.position.x = x1 - 320;
        copperFace.position.x = x3 - 320;
        tubeFace.position.x = x4 - 320;
        armourMesh.rotation.x = (f.phase / 150) * TAU * 0.25;
        buildFibres(x4, ease(p, 0.6, 1));
      }

      renderer.render(scene, camera);
      return true;
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost);
      dragWire.geometry?.dispose();
      for (const m of fibres.children) m.geometry.dispose();
      geos.forEach((g) => g.dispose());
      cable.geometry.dispose();
      owned.forEach((m) => m.dispose());
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
