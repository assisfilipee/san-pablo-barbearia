(() => {
  const section = document.querySelector('#servicos');
  if (!section) return;
  const buttons = [...section.querySelectorAll('.service-choice')];
  const photos = [...section.querySelectorAll('.services-photo')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 681px)');
  let current = 0, request = 0, selected = buttons[0], pending = null;
  async function select(button) {
    if (button === selected && !pending || button === pending) return;
    const token = ++request;
    pending = button;
    const incoming = photos[1 - current];
    if (!incoming) return;
    try {
      const loaded = new Image();
      loaded.src = button.dataset.serviceImage;
      await loaded.decode();
      if (token !== request) return;
      incoming.style.transition = "none";
      incoming.classList.remove("is-current");
      incoming.src = loaded.src;
      incoming.alt = button.dataset.serviceAlt;
      incoming.style.objectPosition = button.dataset.servicePosition;
      void incoming.offsetWidth;
      incoming.style.removeProperty('transition');
      incoming.removeAttribute('aria-hidden');
      photos[current].setAttribute('aria-hidden', 'true');
      photos[current].classList.remove('is-current');
      incoming.classList.add('is-current');
      current = 1 - current;
      selected = button;
      buttons.forEach(item => {
        item.classList.toggle('is-active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
    } catch {
      // Mantém a última imagem válida se o carregamento falhar.
    } finally { if (token === request) pending = null; }
  }
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => select(button));
    button.addEventListener('focus', () => select(button));
    button.addEventListener('click', () => select(button));
  });
  if (!('IntersectionObserver' in window)) return;
  let visible = false, listening = false, frame = 0;
  function render() {
    frame = 0;
    if (reduced.matches || !desktop.matches) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    section.style.setProperty('--services-shift', ((progress * 2 - 1) * 12).toFixed(2) + 'px');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function sync() {
    const enabled = visible && !reduced.matches && desktop.matches;
    if (enabled && !listening) {
      addEventListener('scroll', schedule, {passive:true});
      addEventListener('resize', schedule);
      listening = true;
    } else if (!enabled && listening) {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      listening = false;
      cancelAnimationFrame(frame); frame = 0;
    }
    if (enabled) schedule();
    else section.style.removeProperty('--services-shift');
    if (reduced.matches) section.classList.add('services-entered');
  }
  const visibility = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    sync();
  });
  visibility.observe(section);
  let reveal;
  if (!reduced.matches) {
    reveal = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('services-entered');
        reveal.disconnect();
      }
    }, {threshold:.08});
    reveal.observe(section);
    section.classList.add('services-motion');
  }
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  addEventListener('pagehide', () => {
    request++;
    visibility.disconnect();
    reveal?.disconnect();
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    reduced.removeEventListener('change', sync);
    desktop.removeEventListener('change', sync);
    cancelAnimationFrame(frame);
  }, {once:true});
})();