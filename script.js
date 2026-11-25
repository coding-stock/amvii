(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = 'https://wa.me/250780927705?text=';

  // WhatsApp links with prefilled messages
  $$('[data-wa]').forEach(function (a) {
    a.href = WA + encodeURIComponent(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $('#yr').textContent = new Date().getFullYear();

  // Lightbox (works with or without motion)
  var lb = $('.lb'), lbImg = $('img', lb), lastFocus;
  function openLb(src, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.hidden = false; $('button', lb).focus();
  }
  function closeLb() { lb.hidden = true; if (lastFocus) lastFocus.focus(); }
  $$('[data-lb]').forEach(function (i) { i.addEventListener('click', function () { openLb(i.src, i.alt); }); });
  $$('[data-lb-src]').forEach(function (t) {
    t.addEventListener('click', function () { openLb(t.dataset.lbSrc, $('img', t).alt); });
    t.tabIndex = 0; t.setAttribute('role', 'button');
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter') t.click(); });
  });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  if (rm || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll (desktop only), synced with ScrollTrigger
  var lenis = null;
  if (innerWidth >= 768 && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Scroll progress + nav hide/show
  gsap.to('.bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  var nav = $('.nav');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { nav.classList.toggle('hide', s.direction === 1 && s.scroll() > 240); } });

  // Kinetic headlines: masked line rise (hero plays on load, others on scroll)
  gsap.set('.ln>span', { yPercent: 112, y: 0 });
  $$('.ln').forEach(function (ln, i) {
    var inHero = !!ln.closest('.hero');
    var cfg = { yPercent: 0, y: 0, duration: 1.3, ease: 'expo.out', delay: inHero ? 0.2 + i * 0.12 : 0 };
    if (inHero) gsap.to($('span', ln), cfg);
    else ScrollTrigger.create({ trigger: ln, start: 'top 88%', once: true, onEnter: function () { gsap.to($('span', ln), { yPercent: 0, duration: 1.3, ease: 'expo.out' }); } });
  });

  // Fade-up for supporting copy
  $$('.rv').forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }); } });
  });

  // Image wipe reveals
  $$('.wipe').forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.out' });
      var img = $('img', el); if (img) gsap.to(img, { scale: 1.12, duration: 1.8, ease: 'expo.out' });
    } });
  });

  // Mission statement: word-by-word scrub
  var st = $('#statement');
  if (st) {
    st.innerHTML = st.textContent.split(' ').map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
    gsap.to('#statement span', { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  }

  // Count-up
  $$('[data-count]').forEach(function (b) {
    var n = +b.dataset.count, o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: function () { b.textContent = Math.round(o.v); } });
    } });
  });

  // Parallax + desktop-only effects
  var mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', function () {
    $$('[data-p]').forEach(function (el) {
      var p = +el.dataset.p;
      gsap.fromTo(el, { yPercent: -p }, { yPercent: p, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Pinned horizontal gallery
    var track = $('.track'), sec = $('.hg-in');
    gsap.to(track, { x: function () { return -(track.scrollWidth - innerWidth); }, ease: 'none',
      scrollTrigger: { trigger: '.hg', pin: sec, scrub: 1, start: 'top top', end: function () { return '+=' + (track.scrollWidth - innerWidth); }, invalidateOnRefresh: true } });
  });
  mm.add('(max-width: 767px)', function () {
    $$('[data-p]').forEach(function (el) {
      var p = +el.dataset.p / 2;
      gsap.fromTo(el, { yPercent: -p }, { yPercent: p, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  // Cursor, magnetic buttons, pillar image preview (fine pointers only)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cur = $('.cur'), pv = $('.pv'), pvImg = $('img', pv);
    var cx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    var px = gsap.quickTo(pv, 'x', { duration: 0.6, ease: 'power3' }), py = gsap.quickTo(pv, 'y', { duration: 0.6, ease: 'power3' });
    addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); px(e.clientX + 28); py(e.clientY - 150); });
    $$('a, button, [data-lb]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('on'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    });
    $$('.pil').forEach(function (p) {
      p.addEventListener('mouseenter', function () { pvImg.src = p.dataset.img; pv.classList.add('on'); });
      p.addEventListener('mouseleave', function () { pv.classList.remove('on'); });
    });
    $$('.mag').forEach(function (b) {
      var bx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.2); by((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener('mouseleave', function () { bx(0); by(0); });
    });
  }

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
