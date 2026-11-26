/* ==========================================================================
   AMVII — Scripts
   ========================================================================== */

(function () {
  // ---------- Helpers ----------
  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATSAPP_URL = 'https://wa.me/250780927705?text=';


  // ---------- WhatsApp links with prefilled messages ----------
  $$('[data-wa]').forEach(function (link) {
    link.href = WHATSAPP_URL + encodeURIComponent(link.dataset.wa);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  $('#yr').textContent = new Date().getFullYear();


  // ---------- Lightbox (works with or without motion) ----------
  var lightbox = $('.lb');
  var lightboxImg = $('img', lightbox);
  var lastFocus;

  function openLightbox(src, alt) {
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    $('button', lightbox).focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  // Gallery images open themselves
  $$('[data-lb]').forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img.src, img.alt);
    });
  });

  // Tiles open a different (full-size) image
  $$('[data-lb-src]').forEach(function (tile) {
    tile.tabIndex = 0;
    tile.setAttribute('role', 'button');

    tile.addEventListener('click', function () {
      openLightbox(tile.dataset.lbSrc, $('img', tile).alt);
    });

    tile.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tile.click();
    });
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target !== lightboxImg) closeLightbox();
  });

  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });


  // ---------- Stop here if motion is off or libraries failed to load ----------
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove('js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);


  // ---------- Smooth scroll (desktop only), synced with ScrollTrigger ----------
  var lenis = null;

  if (innerWidth >= 768 && window.Lenis) {
    lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      }
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // In-page anchor links scroll smoothly
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = $(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: -80 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // ---------- Scroll progress bar + nav hide/show ----------
  gsap.to('.bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
  });

  var nav = $('.nav');

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) {
      var scrollingDown = self.direction === 1;
      nav.classList.toggle('hide', scrollingDown && self.scroll() > 240);
    }
  });


  // ---------- Kinetic headlines: masked line rise ----------
  // Hero plays on load, everything else plays when scrolled into view
  gsap.set('.ln>span', { yPercent: 112, y: 0 });

  $$('.ln').forEach(function (line, i) {
    var inHero = !!line.closest('.hero');
    var text = $('span', line);

    if (inHero) {
      gsap.to(text, {
        yPercent: 0,
        y: 0,
        duration: 1.3,
        ease: 'expo.out',
        delay: 0.2 + i * 0.12
      });
    } else {
      ScrollTrigger.create({
        trigger: line,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(text, { yPercent: 0, duration: 1.3, ease: 'expo.out' });
        }
      });
    }
  });


  // ---------- Fade-up for supporting copy ----------
  $$('.rv').forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: function () {
        gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      }
    });
  });


  // ---------- Image wipe reveals ----------
  $$('.wipe').forEach(function (el) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.out' });

        var img = $('img', el);
        if (img) gsap.to(img, { scale: 1.12, duration: 1.8, ease: 'expo.out' });
      }
    });
  });


  // ---------- Mission statement: word-by-word scrub ----------
  var statement = $('#statement');

  if (statement) {
    statement.innerHTML = statement.textContent
      .split(' ')
      .map(function (word) { return '<span>' + word + '</span>'; })
      .join(' ');

    gsap.to('#statement span', {
      opacity: 1,
      stagger: 0.12,
      ease: 'none',
      scrollTrigger: {
        trigger: statement,
        start: 'top 80%',
        end: 'bottom 45%',
        scrub: true
      }
    });
  }


  // ---------- Count-up numbers ----------
  $$('[data-count]').forEach(function (el) {
    var target = +el.dataset.count;
    var counter = { v: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: function () {
        gsap.to(counter, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(counter.v);
          }
        });
      }
    });
  });


  // ---------- Parallax + breakpoint-specific effects ----------
  function addParallax(strength) {
    $$('[data-p]').forEach(function (el) {
      var p = +el.dataset.p * strength;

      gsap.fromTo(el,
        { yPercent: -p },
        {
          yPercent: p,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });
  }

  // ---------- Gallery progress bar + swipe hint ----------
  // The bar behaves like a scrollbar thumb: it starts at the share of the
  // gallery that is visible and fills up as the visitor moves through it.
  var hint = $('.hint');
  var hintFill = $('.hint-bar i');

  function setGalleryProgress(progress, visibleShare) {
    if (!hint) return;
    var fill = visibleShare + progress * (1 - visibleShare);
    hintFill.style.transform = 'scaleX(' + fill + ')';
    hint.classList.toggle('done', progress > 0.03);
  }

  var mm = gsap.matchMedia();

  // Desktop: full parallax + pinned horizontal gallery
  mm.add('(min-width: 768px)', function () {
    addParallax(1);

    var track = $('.track');
    var pinned = $('.hg-in');

    gsap.to(track, {
      x: function () { return -(track.scrollWidth - innerWidth); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.hg',
        pin: pinned,
        scrub: 1,
        start: 'top top',
        end: function () { return '+=' + (track.scrollWidth - innerWidth); },
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          setGalleryProgress(self.progress, innerWidth / track.scrollWidth);
        }
      }
    });
  });

  // Mobile: gentler parallax (gallery is a native swipe row)
  mm.add('(max-width: 767px)', function () {
    addParallax(0.5);

    var swipeTrack = $('.track');

    function onSwipe() {
      var maxScroll = swipeTrack.scrollWidth - swipeTrack.clientWidth;
      var progress = maxScroll > 0 ? swipeTrack.scrollLeft / maxScroll : 0;
      setGalleryProgress(progress, swipeTrack.clientWidth / swipeTrack.scrollWidth);
    }

    onSwipe();
    swipeTrack.addEventListener('scroll', onSwipe, { passive: true });

    return function () {
      swipeTrack.removeEventListener('scroll', onSwipe);
    };
  });


  // ---------- Cursor, magnetic buttons, service image preview ----------
  // Fine pointers only (mouse / trackpad)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cursor = $('.cur');
    var preview = $('.pv');
    var previewImg = $('img', preview);

    // Smooth cursor + preview following the mouse
    var cursorX = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
    var cursorY = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    var previewX = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
    var previewY = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });

    addEventListener('mousemove', function (e) {
      cursorX(e.clientX);
      cursorY(e.clientY);
      previewX(e.clientX + 28);
      previewY(e.clientY - 150);
    });

    // Cursor grows over interactive elements
    $$('a, button, [data-lb]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('on'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('on'); });
    });

    // Image preview on the services list
    $$('.pil').forEach(function (pillar) {
      pillar.addEventListener('mouseenter', function () {
        previewImg.src = pillar.dataset.img;
        preview.classList.add('on');
      });
      pillar.addEventListener('mouseleave', function () {
        preview.classList.remove('on');
      });
    });

    // Magnetic buttons
    $$('.mag').forEach(function (btn) {
      var moveX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      var moveY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        moveX((e.clientX - rect.left - rect.width / 2) * 0.2);
        moveY((e.clientY - rect.top - rect.height / 2) * 0.3);
      });

      btn.addEventListener('mouseleave', function () {
        moveX(0);
        moveY(0);
      });
    });
  }


  // ---------- Recalculate trigger positions once all images are loaded ----------
  addEventListener('load', function () {
    ScrollTrigger.refresh();
  });
})();
