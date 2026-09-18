import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Every section fades up the same way.
document.querySelectorAll('[data-animate]').forEach((el) => {
  gsap.from(el, { opacity: 0, y: 60, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
  gsap.from(el.querySelectorAll('h1, h2, p, img'), { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', stagger: 0.2, scrollTrigger: { trigger: el, start: 'top 80%' } });
});

// The pinned frame rotates with an eased scrub.
gsap.to('.frame-stage img', { rotation: 360, scale: 1.2, ease: 'power2.out', scrollTrigger: { trigger: '[data-pin]', start: 'top top', end: 'bottom bottom', scrub: true } });

// Hero parallax on mouse move.
window.addEventListener('mousemove', (e) => {
  gsap.to('.hero h1', { x: (e.clientX - innerWidth / 2) * 0.05, y: (e.clientY - innerHeight / 2) * 0.05, duration: 0.5 });
});
