/* ═══════════════════════════════════════════════════════════
   glow — Beauty, Nails & More
   Progressive enhancement only. Every feature below degrades
   gracefully: with JS disabled the page still navigates and all
   gallery images still display at full size.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     Current year
     ───────────────────────────────────────────────────────── */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ─────────────────────────────────────────────────────────
     Mobile navigation

     aria-expanded drives both the styling and the screen-reader
     announcement. Escape closes and returns focus to the toggle
     (WCAG 2.1.2 — no keyboard trap).
     ───────────────────────────────────────────────────────── */

  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function setNav(open) {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    primaryNav.classList.toggle('is-open', open);
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a destination.
    primaryNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        navToggle.focus();
      }
    });

    // Reset when resizing up to the desktop layout.
    var desktop = window.matchMedia('(min-width: 901px)');
    desktop.addEventListener('change', function (e) { if (e.matches) setNav(false); });
  }

  /* ─────────────────────────────────────────────────────────
     Sticky header shadow + scroll spy

     aria-current="page" is moved along with the visual highlight
     so screen-reader users get the same orientation cue.
     ───────────────────────────────────────────────────────── */

  var header = document.getElementById('siteHeader');
  var navLinks = primaryNav ? Array.prototype.slice.call(primaryNav.querySelectorAll('a')) : [];
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + id;
          link.classList.toggle('is-current', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ─────────────────────────────────────────────────────────
     Consent-gated Google Map (GDPR)

     The iframe does not exist in the HTML at all. It is only
     created here, after the visitor clicks the button — so no
     request reaches Google, and no cookie is set, unless they
     actively ask for it.

     The consent is deliberately NOT remembered: nothing is written
     to localStorage or cookies, because storing it would itself
     need a legal basis. The cost is one extra click per visit.

     TODO: replace the address in MAP_QUERY with the real one.
     ───────────────────────────────────────────────────────── */

  var MAP_QUERY = 'Thessaloniki, Greece';

  var mapConsent = document.getElementById('mapConsent');
  var mapLoad = document.getElementById('mapLoad');

  if (mapConsent && mapLoad) {
    mapLoad.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.title = 'Χάρτης με τη θέση του glow — Beauty, Nails & More στη Θεσσαλονίκη';
      frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(MAP_QUERY) + '&output=embed';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';

      mapConsent.replaceWith(frame);

      // Move focus to the map so keyboard and screen-reader users
      // land on what they just asked for.
      frame.setAttribute('tabindex', '0');
      frame.focus();
    });
  }

  /* ─────────────────────────────────────────────────────────
     Gallery lightbox

     Built on <dialog showModal()>, which gives us the focus trap,
     Escape-to-close, inert background and correct role for free.
     Focus is returned to the triggering thumbnail on close
     (WCAG 2.4.3 — focus order).
     ───────────────────────────────────────────────────────── */

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastTrigger = null;

  if (lightbox && typeof lightbox.showModal === 'function') {
    document.querySelectorAll('.gallery-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        lastTrigger = btn;
        lightboxImg.src = btn.dataset.src;
        lightboxImg.alt = img ? img.alt : '';
        lightboxCaption.textContent = btn.dataset.caption || '';
        lightbox.showModal();
        lightboxClose.focus();
      });
    });

    lightboxClose.addEventListener('click', function () { lightbox.close(); });

    // Click on the backdrop (outside the image) closes too.
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener('close', function () {
      lightboxImg.removeAttribute('src');
      if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
    });
  }

})();
