(() => {
  const section = document.querySelector('#experiencia');
  if (!section || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 681px)');
  const image = section.querySelector('.experience-portrait img');
  let visible = false, listening = false, frame = 0;
  function render() {
    frame = 0;
    if (!image || reduced.matches || !desktop.matches) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    image.style.setProperty('--experience-shift', ((progress * 2 - 1) * 12).toFixed(2) + 'px');
    image.style.setProperty('--experience-scale', (1.04 - progress * .04).toFixed(4));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function sync() {
    const enabled = visible && !reduced.matches && desktop.matches;
    if (enabled && !listening) { addEventListener('scroll', schedule, {passive:true}); addEventListener('resize', schedule); listening = true; }
    if (!enabled && listening) { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); listening = false; cancelAnimationFrame(frame); frame = 0; }
    if (enabled) schedule();
    else { image?.style.removeProperty('--experience-shift'); image?.style.removeProperty('--experience-scale'); }
    if (reduced.matches) section.classList.add('experience-entered');
  }
  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    sync();
  });
  visibility.observe(section);
  if (!reduced.matches) {
    const reveal = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { section.classList.add('experience-entered'); reveal.disconnect(); }
    }, {threshold:.08});
    reveal.observe(section);
    section.classList.add('experience-motion');
    addEventListener('pagehide', () => reveal.disconnect(), {once:true});
  }
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  addEventListener('pagehide', () => {
    visibility.disconnect();
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    reduced.removeEventListener('change', sync);
    desktop.removeEventListener('change', sync);
    cancelAnimationFrame(frame);
  }, {once:true});
})();