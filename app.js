// Scroll reveal + logo marquee. No dependencies.
(function () {
  var row = document.querySelector('.logo-row');
  if (row) row.innerHTML += row.innerHTML; // duplicate once so the -50% loop is seamless

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sel = 'section:not(.hero) .eyebrow, section:not(.hero) h2, section:not(.hero) .lead, .why li, .chips li, .card, .step, .flow li, .band blockquote, .principles li, .case, .about > *, .past img, .built li, .contact-grid > *';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  els.forEach(function (el) {
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.classList.add('reveal');
    el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
  });

  function show(el) {
    el.classList.add('in');
    els = els.filter(function (e) { return e !== el; });
  }

  // Primary: IntersectionObserver. Fallback: rect check on scroll/resize, so nothing can stay hidden.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  var ticking = false;
  function check() {
    ticking = false;
    var limit = innerHeight * 0.92;
    els.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < limit && r.bottom > 0) show(el);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  addEventListener('load', check);
  check();
})();

// Results carousel: crossfade, autoplay with progress, pause on hover/focus, swipe, keys.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rtl = document.documentElement.dir === 'rtl';

  // square grids are generated from data-n so the markup stays short
  Array.prototype.forEach.call(document.querySelectorAll('.sq[data-n]'), function (g) {
    var html = '';
    for (var k = 0; k < +g.dataset.n; k++) html += '<i style="--k:' + k + '"></i>';
    g.innerHTML = html;
  });

  Array.prototype.forEach.call(document.querySelectorAll('.carousel'), function (c) {
    var slides = Array.prototype.slice.call(c.querySelectorAll('.slide'));
    var dotsWrap = c.querySelector('.dots-nav'), count = c.querySelector('.count');
    var dur = parseFloat(getComputedStyle(c).getPropertyValue('--dur')) * 1000 || 7000;
    var i = 0, timer = null, paused = false;
    if (slides.length < 2) return;

    slides.forEach(function (s, k) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', (k + 1) + ' / ' + slides.length);
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (c.dataset.dotLabel || 'Result') + ' ' + (k + 1));
      b.addEventListener('click', function () { go(k); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.children;
    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function go(n) {
      slides[i].classList.remove('is-active'); slides[i].setAttribute('aria-hidden', 'true');
      dots[i].removeAttribute('aria-current');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active'); slides[i].removeAttribute('aria-hidden');
      dots[i].setAttribute('aria-current', 'true');
      count.textContent = pad(i + 1) + ' / ' + pad(slides.length);
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      c.classList.remove('run');
      void c.offsetWidth; // restart the progress bar animation
      if (reduce || paused) return;
      c.classList.add('run');
      timer = setTimeout(function () { go(i + 1); }, dur);
    }
    function pause() { paused = true; clearTimeout(timer); c.classList.add('paused'); }
    function resume() { if (!paused) return; paused = false; c.classList.remove('paused'); schedule(); }

    c.querySelector('.prev').addEventListener('click', function () { go(i - 1); });
    c.querySelector('.next').addEventListener('click', function () { go(i + 1); });
    c.addEventListener('mouseenter', pause);
    c.addEventListener('mouseleave', resume);
    c.addEventListener('focusin', pause);
    c.addEventListener('focusout', function (e) { if (!c.contains(e.relatedTarget)) resume(); });
    document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });
    c.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var fwd = (e.key === 'ArrowRight') !== rtl;
      go(i + (fwd ? 1 : -1));
    });

    var x0 = null;
    var area = c.querySelector('.slides');
    area.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    area.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      var fwd = (dx < 0) !== rtl;
      go(i + (fwd ? 1 : -1));
    });

    slides.forEach(function (s) { s.setAttribute('aria-hidden', 'true'); s.classList.remove('is-active'); });
    i = 0; slides[0].classList.add('is-active'); slides[0].removeAttribute('aria-hidden');
    dots[0].setAttribute('aria-current', 'true');
    count.textContent = pad(1) + ' / ' + pad(slides.length);
    schedule();
  });
})();

// Work-sample galleries: native <dialog>, closes on Esc, the close button or a backdrop click.
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (btn) {
    var dlg = document.getElementById(btn.dataset.gallery);
    if (!dlg || !dlg.showModal) return;
    var track = dlg.querySelector('.g-track');
    btn.addEventListener('click', function () { dlg.showModal(); track.scrollLeft = 0; cur = 0; });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('.g-close').addEventListener('click', function () { dlg.close(); });
    var figs = track.querySelectorAll('figure'), cur = 0;
    function step(dir) {
      cur = Math.max(0, Math.min(figs.length - 1, cur + dir));
      figs[cur].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    // keep the index in sync when people swipe or drag the scrollbar
    track.addEventListener('scroll', function () {
      var mid = track.getBoundingClientRect().left + track.clientWidth / 2, best = 0, bd = Infinity;
      Array.prototype.forEach.call(figs, function (f, k) {
        var r = f.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bd) { bd = d; best = k; }
      });
      cur = best;
    }, { passive: true });
    dlg.querySelector('.g-prev').addEventListener('click', function () { step(-1); });
    dlg.querySelector('.g-next').addEventListener('click', function () { step(1); });
  });
})();
