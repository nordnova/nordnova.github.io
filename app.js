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
