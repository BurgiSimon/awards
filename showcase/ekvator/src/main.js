// Structure phase: the static tier only. The boot (Lenis on GSAP's ticker, the light, the wall) lands with the stack.
import { awards } from './lib/awards-hook.js';

await document.fonts.ready;
awards.addState(() => ({ motion: 'static', gl: false }));
awards.ready();
