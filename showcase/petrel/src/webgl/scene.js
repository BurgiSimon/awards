// Lazy WebGL island: one canvas, DPR capped by the quality tier, disposed on teardown. Replace the placeholder mesh with the concept's scene.
import * as THREE from 'three';
import gsap from 'gsap';
import { applyRendererBudget } from '../lib/quality-tiers.js';

export function mountScene(host, quality) {
  const canvas = document.createElement('canvas');
  canvas.className = 'gl-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.tier === 'high', alpha: true, powerPreference: 'high-performance' });
  host.appendChild(canvas);
  const size = () => applyRendererBudget(renderer, quality, host.clientWidth, host.clientHeight);
  size();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.z = 5;
  const geometry = new THREE.IcosahedronGeometry(1, 2);
  const material = new THREE.MeshNormalMaterial({ flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  const loop = (t) => {
    mesh.rotation.y = t * 0.3;
    renderer.render(scene, camera);
  };
  const onVisibility = () => {
    gsap.ticker.remove(loop);
    if (!document.hidden) gsap.ticker.add(loop);
  };
  onVisibility();
  const onResize = () => { size(); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); };
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  return {
    dispose() {
      gsap.ticker.remove(loop);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
