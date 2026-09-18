// Placeholder behaviour: the mobile menu button does nothing yet.
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
  document.querySelector('.site-nav')?.classList.toggle('is-open');
});
