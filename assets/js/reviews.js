(() => {
  const section = document.querySelector('#avaliacoes');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const score = section.querySelector('[data-rating-value]');
  let visible = false, counted = false, counterFrame = 0, rotationTimer = 0, changeTimer = 0;
  let reviews = [];
  try {
    const data = JSON.parse(section.querySelector('#reviews-data')?.textContent || '[]');
    if (Array.isArray(data)) reviews = data.filter(item => {
      if (!item || typeof item.text !== 'string' || typeof item.author !== 'string' || !item.text.trim() || !item.author.trim()) return false;
      try { const url = new URL(item.source); return url.protocol === 'https:' && /(^|\.)(google\.[a-z.]+|goo\.gl)$/.test(url.hostname); } catch { return false; }
    });
  } catch { /* Sem dados válidos, preserva a apresentação editorial. */ }
  const rotator = section.querySelector('.reviews-rotator');
  const slide = section.querySelector('.reviews-slide');
  const quote = section.querySelector('.reviews-quote');
  const author = section.querySelector('.reviews-author');
  const position = section.querySelector('[data-review-position]');
  const pause = section.querySelector('[data-review-pause]');
  let index = 0, paused = false, hovering = false, focused = false;
  function paint() {
    quote.textContent = reviews[index].text;
    author.textContent = reviews[index].author;
    position.textContent = (index + 1) + ' / ' + reviews.length;
  }
  function stopRotation() { clearTimeout(rotationTimer); rotationTimer = 0; }
  function scheduleRotation() {
    stopRotation();
    if (reviews.length > 1 && visible && !paused && !hovering && !focused && !document.hidden && !reduced.matches) rotationTimer = setTimeout(() => change(1), 6000);
  }
  function change(direction) {
    if (reviews.length < 2) return;
    stopRotation(); clearTimeout(changeTimer);
    slide.classList.add('is-changing');
    changeTimer = setTimeout(() => {
      index = (index + direction + reviews.length) % reviews.length;
      paint(); slide.classList.remove('is-changing'); scheduleRotation();
    }, reduced.matches ? 0 : 350);
  }
  if (reviews.length && rotator && slide && quote && author && position) {
    section.querySelector('.reviews-fallback').hidden = true;
    rotator.hidden = false; paint();
    section.querySelector('.reviews-controls').hidden = reviews.length < 2;
    section.querySelector('[data-review-prev]').addEventListener('click', () => change(-1));
    section.querySelector('[data-review-next]').addEventListener('click', () => change(1));
    pause.addEventListener('click', () => {
      paused = !paused;
      pause.textContent = paused ? '▶' : 'Ⅱ';
      pause.setAttribute('aria-label', paused ? 'Retomar alternância automática' : 'Pausar alternância automática');
      scheduleRotation();
    });
    rotator.addEventListener('mouseenter', () => { hovering = true; stopRotation(); });
    rotator.addEventListener('mouseleave', () => { hovering = false; scheduleRotation(); });
    rotator.addEventListener('focusin', () => { focused = true; stopRotation(); });
    rotator.addEventListener('focusout', event => { if (!rotator.contains(event.relatedTarget)) { focused = false; scheduleRotation(); } });
    document.addEventListener('visibilitychange', scheduleRotation);
  }
  function finishCounter() { cancelAnimationFrame(counterFrame); counterFrame = 0; if (score) score.textContent = '4,9'; }
  function count() {
    if (counted || !score) return;
    counted = true;
    if (reduced.matches) { finishCounter(); return; }
    let started;
    function tick(time) {
      started ??= time;
      const progress = Math.min(1, (time - started) / 1200);
      const value = 4.9 * (1 - Math.pow(1 - progress, 3));
      score.textContent = value.toFixed(1).replace('.', ',');
      if (progress < 1) counterFrame = requestAnimationFrame(tick);
      else finishCounter();
    }
    counterFrame = requestAnimationFrame(tick);
  }
  let observer;
  if ('IntersectionObserver' in window) {
    if (!reduced.matches) section.classList.add('reviews-motion');
    observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) { section.classList.add('reviews-entered'); count(); }
      scheduleRotation();
    }, {threshold:.08});
    observer.observe(section);
  } else { section.classList.add('reviews-entered'); }
  function motionChange() {
    if (reduced.matches) { section.classList.add('reviews-entered'); finishCounter(); }
    scheduleRotation();
  }
  reduced.addEventListener('change', motionChange);
  addEventListener('pagehide', () => {
    observer?.disconnect(); stopRotation(); clearTimeout(changeTimer); finishCounter();
    reduced.removeEventListener('change', motionChange);
    document.removeEventListener('visibilitychange', scheduleRotation);
  }, {once:true});
})();