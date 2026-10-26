(() => {
  const section = document.querySelector('#equipe');
  if (!section || !('IntersectionObserver' in window)) return;
  const image = section.querySelector('.team-portrait img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 681px)');
  let visible = false, listening = false, frame = 0;
  function render() {
    frame = 0;
    if (reduced.matches || !desktop.matches) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    image?.style.setProperty('--team-shift', ((progress * 2 - 1) * 16).toFixed(2) + 'px');
    image?.style.setProperty('--team-scale', (1.04 - progress * .04).toFixed(4));
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
    else { image?.style.removeProperty('--team-shift'); image?.style.removeProperty('--team-scale'); }
    if (reduced.matches) section.classList.add('team-entered');
  }
  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting); sync();
  });
  visibility.observe(section);
  let reveal;
  if (!reduced.matches) {
    reveal = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('team-entered'); reveal.disconnect();
      }
    }, {threshold:.08});
    reveal.observe(section); section.classList.add('team-motion');
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