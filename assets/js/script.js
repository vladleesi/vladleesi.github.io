/**
 * Portfolio — Main script
 * Progressive navigation, theme controls, and motion enhancements
 */

(function () {
  'use strict';

  // ——— Header scroll (shrink + shadow) ———
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const threshold = 60;

    function updateHeader() {
      const y = window.scrollY;
      if (y > threshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(updateHeader);
    }, { passive: true });
    updateHeader();
  }

  // Enhance the otherwise visible mobile navigation only after controls work.
  function initMobileNav() {
    const header = document.getElementById('header');
    const toggle = document.getElementById('nav-toggle');
    if (!header || !toggle) return;
    const nav = header.querySelector('.nav');
    if (!nav) return;
    const mobile = window.matchMedia('(max-width: 640px)');

    function setOpen(isOpen) {
      header.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      nav.inert = mobile.matches && !isOpen;
    }

    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('nav-open'));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    header.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('nav-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    header.addEventListener('focusout', function (event) {
      if (!header.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) setOpen(false);
    });
    mobile.addEventListener('change', function () { setOpen(false); });
    toggle.hidden = false;
    header.classList.add('js-navigation');
    setOpen(false);
  }

  // ——— Footer year ———
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // Preserve the reading position for browser Back and the article's home link.
  function initReadingReturn() {
    const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
    const returnKey = 'portfolio-article-return';
    const pendingKey = 'portfolio-pending-return';

    function readSaved(key) {
      try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return null; }
    }

    function save(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* native Back still works */ }
    }

    function snapshot() {
      const archive = document.querySelector('.writing-archive');
      return { y: window.scrollY, archiveOpen: Boolean(archive && archive.open) };
    }

    function restore(position) {
      if (!position || !Number.isFinite(position.y) || position.y < 0) return;
      const archive = document.querySelector('.writing-archive');
      if (archive) archive.open = Boolean(position.archiveOpen);
      const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
      fontsReady.then(function () {
        requestAnimationFrame(function () {
          window.scrollTo({ top: position.y, behavior: 'instant' });
        });
      });
    }

    if (isHome) {
      function savePosition() {
        const position = snapshot();
        try { history.replaceState(Object.assign({}, history.state, { portfolioReading: position }), ''); } catch (_) { /* optional enhancement */ }
        return position;
      }

      document.querySelectorAll('a[href^="posts/"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          save(returnKey, { article: new URL(link.href).pathname, home: window.location.href, position: savePosition() });
        });
      });
      window.addEventListener('pagehide', savePosition);
      window.addEventListener('pageshow', function (event) {
        const pending = readSaved(pendingKey);
        if (pending && pending.home === window.location.href) {
          try { sessionStorage.removeItem(pendingKey); } catch (_) { /* storage unavailable */ }
          restore(pending.position);
          return;
        }
        const navigation = performance.getEntriesByType('navigation')[0];
        if (event.persisted || (navigation && navigation.type === 'back_forward')) {
          restore(history.state && history.state.portfolioReading);
        }
      });
      return;
    }

    const link = document.querySelector('.article-back');
    const saved = readSaved(returnKey);
    if (!link || !saved || saved.article !== window.location.pathname) return;
    let home;
    try { home = new URL(saved.home); } catch (_) { return; }
    if (home.origin !== window.location.origin || !['/', '/index.html'].includes(home.pathname)) return;
    link.href = home.href;
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      save(pendingKey, saved);
    });
  }

  // ——— Theme toggle (light/dark) ———
  const THEME_KEY = 'portfolio-theme';
  const THEME_SWITCHING_CLASS = 'theme-switching';

  function getPreferredTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (_) { /* private browsing */ }
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function syncThemeFavicon() {
    if (window.syncThemeIcons) window.syncThemeIcons();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    document.documentElement.style.backgroundColor = '';
    syncThemeFavicon();
  }

  function syncThemeToggleState(btn, theme) {
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function initTheme() {
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);
    const btn = document.getElementById('theme-toggle');
    window.addEventListener('pageshow', syncThemeFavicon);
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        const theme = getPreferredTheme();
        applyTheme(theme);
        syncThemeToggleState(btn, theme);
      });
    }
    if (!btn) return;
    syncThemeToggleState(btn, initialTheme);
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.add(THEME_SWITCHING_CLASS);
      applyTheme(next);
      syncThemeToggleState(btn, next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* private browsing */ }
      window.setTimeout(function () {
        document.documentElement.classList.remove(THEME_SWITCHING_CLASS);
      }, 360);
    });
    btn.hidden = false;
  }

  // Apply theme immediately to avoid flash (before DOMContentLoaded)
  (function applyThemeSync() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (_) { /* private browsing */ }
    const theme = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  })();

  // ——— Init ———
  function init() {
    initTheme();
    initHeader();
    initMobileNav();
    initFooterYear();
    initBackToTop();
    initReadingReturn();
    initContentReveals();
    initCursorTrail();
  }

  // Animate on entry without hiding content in CSS or depending on JS to reveal it.
  function initContentReveals() {
    if (!window.IntersectionObserver || !Element.prototype.animate) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = document.querySelectorAll('.hero-content, .section-title, .work-item, .skill-card, .workflow-note, .impact-card, .post-card, .about-panel, .article-body .reveal-item');
    const seen = new WeakSet();
    const active = new Set();
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || reducedMotion.matches) return;
        const element = entry.target;
        observer.unobserve(element);
        seen.add(element);
        const article = element.classList.contains('reveal-item');
        const siblings = Array.from(element.parentElement.children).filter(function (sibling) {
          return sibling.matches('.skill-card, .work-item, .impact-card, .post-card, .reveal-item');
        });
        const delay = Math.min(Math.max(0, siblings.indexOf(element)) * (article ? 20 : 50), 150);
        const animation = element.animate([
          { opacity: 0, transform: 'translateY(' + (article ? 12 : 20) + 'px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: article ? 220 : 450, delay: delay, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' });
        active.add(animation);
        animation.finished.then(function () { active.delete(animation); }, function () { active.delete(animation); });
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    function cancelActive() {
      active.forEach(function (animation) { animation.cancel(); });
      active.clear();
    }

    function update() {
      observer.disconnect();
      cancelActive();
      if (!reducedMotion.matches) {
        targets.forEach(function (element) { if (!seen.has(element)) observer.observe(element); });
      }
    }

    reducedMotion.addEventListener('change', update);
    window.addEventListener('pagehide', cancelActive);
    update();
  }

  // Restore the small pointer accent, scheduling frames only while it catches up.
  function initCursorTrail() {
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let circle = null;
    let frame = null;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      if (circle) circle.classList.remove('visible');
    }

    function update() {
      stop();
      if (pointer.matches && !reducedMotion.matches) {
        if (!circle) {
          circle = document.createElement('div');
          circle.id = 'cursor-trail';
          circle.className = 'cursor-trail';
          circle.setAttribute('aria-hidden', 'true');
          document.body.appendChild(circle);
        }
      } else if (circle) {
        circle.remove();
        circle = null;
      }
    }

    function draw() {
      const settled = Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1;
      x = settled ? targetX : x + (targetX - x) * 0.15;
      y = settled ? targetY : y + (targetY - y) * 0.15;
      circle.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      frame = settled ? null : requestAnimationFrame(draw);
    }

    document.addEventListener('pointermove', function (event) {
      if (!circle || event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!circle.classList.contains('visible')) {
        x = targetX;
        y = targetY;
        circle.classList.add('visible');
      }
      if (frame === null) frame = requestAnimationFrame(draw);
    }, { passive: true });
    document.addEventListener('pointerleave', stop);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
    pointer.addEventListener('change', update);
    reducedMotion.addEventListener('change', update);
    update();
  }

  // ——— Back to top button ———
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const threshold = 200;

    function update() {
      const visible = window.scrollY > threshold;
      btn.classList.toggle('visible', visible);
      btn.tabIndex = visible ? 0 : -1;
      btn.setAttribute('aria-hidden', String(!visible));
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });

    btn.addEventListener('click', function () {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
      const logo = document.querySelector('.logo');
      if (logo) logo.focus({ preventScroll: true });
    });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

