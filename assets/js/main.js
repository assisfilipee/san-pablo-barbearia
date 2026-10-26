/* Dados confirmados. Preencha bookingUrl e siteUrl quando disponíveis. */
const SAN_PABLO = Object.freeze({whatsapp: '554830833076', bookingUrl: '', siteUrl: ''});
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const top = document.querySelector('.back-top');
  const hero = document.querySelector('.hero');
  const media = matchMedia('(max-width: 1024px)');
  function setMenu(open, restoreFocus = false) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) nav.querySelector('a')?.focus();
    if (restoreFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') setMenu(false, true);
    if (event.key === 'Tab') {
      const items = [...nav.querySelectorAll('a'), toggle];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  media.addEventListener('change', () => setMenu(false));
  let scheduled = false;
  function updateScroll() {
    header?.classList.toggle('is-scrolled', scrollY > 35);
    if (top && hero) top.hidden = scrollY < hero.offsetHeight - 100;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, {passive:true});
  updateScroll();
  document.querySelectorAll('[data-year]').forEach(item => item.textContent = new Date().getFullYear());
  function setLinkDestination(link, href) {
    link.href = href;
    const destination = new URL(href, document.baseURI);
    const site = new URL(SAN_PABLO.siteUrl || document.baseURI);
    const external = /^https?:$/.test(destination.protocol) && destination.origin !== site.origin;
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
  }
  const whatsappUrl = 'https://wa.me/' + SAN_PABLO.whatsapp;
  document.querySelectorAll('[data-booking]').forEach(link => setLinkDestination(link, SAN_PABLO.bookingUrl || whatsappUrl + '?text=' + encodeURIComponent('Olá! Gostaria de agendar um horário na San Pablo.')));
  document.querySelectorAll('[data-products]').forEach(link => setLinkDestination(link, whatsappUrl + '?text=' + encodeURIComponent('Olá! Gostaria de conhecer os produtos San Pablo.')));
  const wrap = document.querySelector('.whatsapp-wrap');
  const whatsapp = document.querySelector('[data-whatsapp]');
  if (SAN_PABLO.whatsapp && wrap && whatsapp) {
    setLinkDestination(whatsapp, whatsappUrl + '?text=' + encodeURIComponent('Olá! Gostaria de agendar um horário.'));
    wrap.hidden = false;
    const tooltip = wrap.querySelector('.whatsapp-tooltip');
    let cycleTimer = 0, automatic = false, hovered = false, focused = false;
    let running = false, hasShown = false;
    function updateTooltip() {
      const visible = automatic || hovered || focused;
      if (visible && !hasShown) {
        tooltip?.classList.add('has-shown');
        hasShown = true;
      }
      wrap.classList.toggle('show-tip', visible);
      tooltip?.setAttribute('aria-hidden', String(!visible));
    }
    function advanceCycle() {
      if (!running) return;
      automatic = !automatic;
      updateTooltip();
      cycleTimer = setTimeout(advanceCycle, automatic ? 5000 : 12000);
    }
    function startCycle() {
      if (running) return;
      running = true;
      cycleTimer = setTimeout(advanceCycle, 4000);
    }
    function stopCycle() {
      running = false;
      clearTimeout(cycleTimer);
      cycleTimer = 0;
      automatic = hovered = focused = false;
      updateTooltip();
    }
    whatsapp.addEventListener('mouseenter', () => { hovered = true; updateTooltip(); });
    whatsapp.addEventListener('mouseleave', () => { hovered = false; updateTooltip(); });
    whatsapp.addEventListener('focus', () => { focused = true; updateTooltip(); });
    whatsapp.addEventListener('blur', () => { focused = false; updateTooltip(); });
    addEventListener('pagehide', stopCycle);
    addEventListener('pageshow', startCycle);
    startCycle();
  }
  const preview = document.querySelector('#service-image');
  document.querySelectorAll('.service-row').forEach(row => {
    const show = () => {
      if (!preview) return;
      document.querySelector('.service-row.is-active')?.classList.remove('is-active');
      row.classList.add('is-active');
      preview.src = row.dataset.image;
      preview.alt = row.dataset.alt;
    };
    row.addEventListener('mouseenter', show);
    row.addEventListener('focus', show);
  });
})();