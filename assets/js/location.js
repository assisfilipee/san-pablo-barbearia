(() => {
  const section = document.querySelector('#localizacao');
  if (!section || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      section.classList.add('location-entered');
      observer.disconnect();
    }
  }, {threshold:.08});
  observer.observe(section);
  section.classList.add('location-motion');
  addEventListener('pagehide', () => observer.disconnect(), {once:true});
})();