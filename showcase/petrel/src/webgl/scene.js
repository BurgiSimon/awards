// The one rendered material on the page: a procedural armoured cable, its grapnel, the grapnel dragged across the
// seabed, and the cable cut open for the splice. One transparent canvas over the document, an orthographic camera in
// CSS pixels (so every piece lands on the DOM geometry it replaces), lit by a generated room environment; no model
// files, no textures. Renders only when a frame differs from the last one.
import {
  WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, InstancedMesh, Object3D, MeshStandardMaterial,
  CylinderGeometry, TubeGeometry, TorusGeometry, SphereGeometry, RingGeometry, Curve, Vector3, CubicBezierCurve3,
  QuadraticBezierCurve3, Plane, PMREMGenerator, NeutralToneMapping, DoubleSide, DirectionalLight,
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

export function mountScene(canvas, quality) {
  const renderer = new WebGLRenderer({ canvas, antialias: quality.tier !== 'low', alpha: true, powerPreference: 'high-performance' });
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

  // ——— The cable from the sheave to the grapnel: armour wires in a helix over a black core ———
  const cablePlanes = [new Plane(new Vector3(0, -1, 0), 0), new Plane(new Vector3(0, 1, 0), 0)];
  const cableSteel = steel.clone();
  const cableCore = pe.clone();
  cableSteel.clippingPlanes = cablePlanes;
  cableCore.clippingPlanes = cablePlanes;
  cableCore.side = 0;
  owned.push(cableSteel, cableCore);
  const cable = new Group();
  scene.add(cable);
  let built = { width: 0, length: 0, pitch: 1 };
  let cableGeos = [];
  function buildCable(width, length) {
    cable.clear();
    cableGeos.forEach((g) => g.dispose());
    const r = width / 2;
    const n = 14;
    const sn = Math.sin(Math.PI / n);
    const wr = (r * sn) / (1 + sn);
    const R = r - wr;
    // Drawn a little under their pitch circle so the black core shows between the wires.
    const pitch = width * 3.3;
    const wire = new TubeGeometry(new Helix(R, pitch, length), Math.ceil(length / 3), wr * 0.86, 6, false);
    const coreGeo = new CylinderGeometry(R * 0.96, R * 0.96, length, 20, 1, true);
    cableGeos = [wire, coreGeo];
    cable.add(armour(wire, cableSteel, n, 'y'));
    const core = new Mesh(coreGeo, cableCore);
    core.position.y = -length / 2;
    cable.add(core);
    built = { width, length, pitch };
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
  function grapnel() {
    const { ring, shank, crown, fluke, tip } = grapnelParts[0];
    const g = new Group();
    const r = new Mesh(ring, forged); r.position.y = -6; g.add(r);
    const sh = new Mesh(shank, forged); sh.position.y = -34; g.add(sh);
    const c = new Mesh(crown, forged); c.position.y = -58; g.add(c);
    for (let i = 0; i < 4; i++) {
      const arm = new Group();
      arm.rotation.y = (i / 4) * TAU + Math.PI / 4;
      arm.add(new Mesh(fluke, forged));
      const t = new Mesh(tip, forged); t.position.set(21, -42, 0); arm.add(t);
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
    update(f) {
      if (lost) return false;
      const k = JSON.stringify(f);
      if (k === last) return true;
      last = k;
      const s = `${f.vw}x${f.vh}`;
      if (s !== sized) { size(f.vw, f.vh); sized = s; }

      // The cable: fixed to the screen, clipped to the sheave above and the grapnel below; turning it about its axis
      // runs the lay down the screen, which reads as the cable paying out.
      cable.visible = f.cable.visible;
      if (cable.visible) {
        const length = f.vh + 4 * f.cable.width * 3.3 + 200;
        if (built.width !== f.cable.width || built.length < length) buildCable(f.cable.width, Math.max(length, 2400));
        cable.position.set(f.cable.x, 2 * built.pitch, 0);
        cable.rotation.y = (f.phase / built.pitch) * TAU;
        cablePlanes[0].constant = -Math.max(f.cable.top, -built.pitch);
        cablePlanes[1].constant = f.cable.bottom;
      }
      hanging.visible = f.grapnel.visible;
      if (hanging.visible) {
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
      cableGeos.forEach((g) => g.dispose());
      owned.forEach((m) => m.dispose());
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
