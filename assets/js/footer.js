(() => {
  const footer = document.querySelector('#site-footer');
  if (!footer) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { footer.classList.add('footer-entered'); observer.disconnect(); }
  }, {threshold:.06});
  observer.observe(footer); footer.classList.add('footer-motion');
  addEventListener('pagehide', () => observer.disconnect(), {once:true});
})();