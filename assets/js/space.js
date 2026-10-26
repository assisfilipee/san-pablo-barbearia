(() => {
  const section = document.querySelector('#espaco');
  if (!section || !('IntersectionObserver' in window)) return;
  const primary = section.querySelector('.space-primary img');
  const secondary = section.querySelector('.space-secondary img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 681px)');
  let visible = false, listening = false, frame = 0;
  function render() {
    frame = 0;
    if (reduced.matches || !desktop.matches) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    primary?.style.setProperty('--space-shift', ((progress * 2 - 1) * 10).toFixed(2) + 'px');
    secondary?.style.setProperty('--space-shift', ((1 - progress * 2) * 15).toFixed(2) + 'px');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function sync() {
    const enabled = visible && !reduced.matches && desktop.matches;
    if (enabled && !listening) {
      addEventListener('scroll', schedule, {passive:true});
      addEventListener('resize', schedule); listening = true;
    } else if (!enabled && listening) {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      cancelAnimationFrame(frame); frame = 0; listening = false;
    }
    if (enabled) schedule();
    else [primary, secondary].forEach(image => image?.style.removeProperty('--space-shift'));
    if (reduced.matches) section.classList.add('space-entered');
  }
  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting); sync();
  });
  visibility.observe(section);
  let reveal;
  if (!reduced.matches) {
    reveal = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('space-entered'); reveal.disconnect();
      }
    }, {threshold:.08});
    reveal.observe(section);
    section.classList.add('space-motion');
  }
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  addEventListener('pagehide', () => {
    visibility.disconnect(); reveal?.disconnect();
    removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
    reduced.removeEventListener('change', sync); desktop.removeEventListener('change', sync);
    cancelAnimationFrame(frame);
  }, {once:true});
})();