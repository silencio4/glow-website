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

  /* ─────────────────────────────────────────────────────────
     Accessibility widget (ΕΣΠΑ)

     Native reading aids: text size, high contrast, link highlight,
     readable font, grayscale, large cursor. Each preference is a
     class on <html>; the CSS does the rest.

     Preferences are saved to localStorage so a low-vision visitor
     does not have to re-enable them on every page load. This is a
     functional store of a setting the user actively chose — no
     tracking, no personal data, no third party.
     ───────────────────────────────────────────────────────── */

  var a11y = document.getElementById('a11y');

  if (a11y) {
    var a11yToggle = document.getElementById('a11yToggle');
    var a11yPanel = document.getElementById('a11yPanel');
    var a11yClose = document.getElementById('a11yClose');
    var a11yReset = document.getElementById('a11yReset');
    var fsPlus = document.getElementById('fsPlus');
    var fsMinus = document.getElementById('fsMinus');
    var fsLevel = document.getElementById('fsLevel');
    var STORE = 'glow_a11y';
    var FS_NAMES = ['Κανονικό', 'Μεγάλο', 'Μεγαλύτερο', 'Μέγιστο'];
    var TOGGLES = ['contrast', 'links', 'readable', 'grayscale', 'bigcursor'];

    var state = { fs: 0, contrast: false, links: false, readable: false, grayscale: false, bigcursor: false };

    // JS is running, so it is safe to show the control.
    a11y.hidden = false;

    function load() {
      try {
        var saved = JSON.parse(localStorage.getItem(STORE) || '{}');
        Object.keys(state).forEach(function (k) {
          if (typeof saved[k] === typeof state[k]) state[k] = saved[k];
        });
      } catch (e) { /* corrupt or unavailable — fall back to defaults */ }
    }

    function save() {
      try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode */ }
    }

    function apply() {
      var root = document.documentElement;
      root.classList.remove('a11y-fs-1', 'a11y-fs-2', 'a11y-fs-3');
      if (state.fs > 0) root.classList.add('a11y-fs-' + state.fs);

      TOGGLES.forEach(function (name) {
        root.classList.toggle('a11y-' + name, state[name]);
        var btn = a11y.querySelector('[data-a11y="' + name + '"]');
        if (btn) btn.setAttribute('aria-pressed', String(state[name]));
      });

      fsLevel.textContent = FS_NAMES[state.fs];
      fsMinus.setAttribute('aria-disabled', String(state.fs === 0));
      fsPlus.setAttribute('aria-disabled', String(state.fs === 3));
    }

    function setPanel(open) {
      a11yToggle.setAttribute('aria-expanded', String(open));
      a11yPanel.hidden = !open;
      if (open) a11yClose.focus();
    }

    a11yToggle.addEventListener('click', function () {
      setPanel(a11yToggle.getAttribute('aria-expanded') !== 'true');
    });
    a11yClose.addEventListener('click', function () {
      setPanel(false);
      a11yToggle.focus();
    });

    // Escape closes; click outside closes. Non-modal, so no focus trap.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && a11yToggle.getAttribute('aria-expanded') === 'true') {
        setPanel(false);
        a11yToggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (a11yToggle.getAttribute('aria-expanded') === 'true' && !a11y.contains(e.target)) {
        setPanel(false);
      }
    });

    TOGGLES.forEach(function (name) {
      var btn = a11y.querySelector('[data-a11y="' + name + '"]');
      btn.addEventListener('click', function () {
        state[name] = !state[name];
        apply(); save();
      });
    });

    fsPlus.addEventListener('click', function () {
      if (state.fs < 3) { state.fs++; apply(); save(); }
    });
    fsMinus.addEventListener('click', function () {
      if (state.fs > 0) { state.fs--; apply(); save(); }
    });

    a11yReset.addEventListener('click', function () {
      state = { fs: 0, contrast: false, links: false, readable: false, grayscale: false, bigcursor: false };
      apply();
      try { localStorage.removeItem(STORE); } catch (e) { /* ignore */ }
      a11yReset.focus();
    });

    load();
    apply();
  }

})();
