(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, {threshold: .08});
  document.querySelectorAll('[data-reveal]').forEach(element => {
    if (element.getBoundingClientRect().top >= innerHeight) element.classList.add('reveal-pending');
    observer.observe(element);
  });
  addEventListener('pagehide', () => observer.disconnect(), {once:true});
})();