// Structure phase: the static tier only; the boot and the registration land with the stack and the motion phases.
import { awards } from './lib/awards-hook.js';

await document.fonts.ready;
awards.addState(() => ({ motion: 'static', register: 'css' }));
awards.ready();
