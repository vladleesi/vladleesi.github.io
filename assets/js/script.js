/**
 * Portfolio — Main script
 * Loading, header, parallax, letter animation, Intersection Observer, cursor trail
 */

(function () {
  'use strict';

  const HAS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const PREFERS_REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ——— Loader ———
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    function hideLoader() {
      loader.classList.add('loaded');
    }

    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 300);
    } else {
      window.addEventListener('load', function () {
        setTimeout(hideLoader, 300);
      });
    }
  }

  // ——— Smooth scroll for anchor links ———
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ——— Header scroll (shrink + shadow) ———
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastY = window.scrollY;
    const threshold = 60;

    function updateHeader() {
      const y = window.scrollY;
      if (y > threshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastY = y;
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(updateHeader);
    }, { passive: true });
    updateHeader();
  }

  // ——— Mobile navigation toggle ———
  function initMobileNav() {
    const header = document.getElementById('header');
    const toggle = document.getElementById('nav-toggle');
    if (!header || !toggle) return;

    const nav = header.querySelector('.nav');

    function setOpen(isOpen) {
      if (isOpen) {
        header.classList.add('nav-open');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }

    toggle.addEventListener('click', function () {
      const isOpen = !header.classList.contains('nav-open');
      setOpen(isOpen);
    });

    if (nav) {
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          // Close menu after navigation on mobile
          setOpen(false);
        });
      });
    }
  }

  // ——— Intersection Observer for reveals ———
  function initReveals() {
    const reveals = document.querySelectorAll('.reveal, .post-card, .section-title');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ——— Parallax background ———
  function initParallax() {
    if (PREFERS_REDUCED_MOTION) return;
    const gradients = document.querySelectorAll('.parallax-gradient, .parallax-orb');
    if (!gradients.length) return;

    let ticking = false;
    let scrollY = 0;

    function updateParallax() {
      gradients.forEach(function (el, i) {
        const speed = el.classList.contains('parallax-orb') ? 0.05 : 0.03;
        const offset = scrollY * speed * (i % 2 === 0 ? 1 : -1);
        el.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ——— Letter animation already in CSS; ensure hero letters are visible after load ———
  function initHeroLetters() {
    const letters = document.querySelectorAll('.hero-letter');
    if (!letters.length) return;
    // Letters animate via CSS keyframes; no extra JS needed unless we want to trigger on scroll
  }

  // ——— Cursor trail (desktop only) ———
  function initCursorTrail() {
    if (HAS_TOUCH || PREFERS_REDUCED_MOTION) return;

    const trail = document.getElementById('cursor-trail');
    if (!trail) return;

    let x = 0, y = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function animate() {
      x += (targetX - x) * 0.15;
      y += (targetY - y) * 0.15;
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ——— Footer year ———
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ——— Theme toggle (light/dark) ———
  const THEME_KEY = 'portfolio-theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // Apply theme immediately to avoid flash (before DOMContentLoaded)
  (function applyThemeSync() {
    const stored = localStorage.getItem(THEME_KEY);
    const theme = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  })();

  // ——— Init ———
  function init() {
    initTheme();
    initLoader();
    initSmoothScroll();
    initHeader();
    initMobileNav();
    initReveals();
    initPostsPagination();
    initParallax();
    initHeroLetters();
    initCursorTrail();
    initFooterYear();
    initBackToTop();
  }

  // ——— Back to top button ———
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const threshold = 200;

    function update() {
      if (window.scrollY > threshold) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(update);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
  }

  // ——— Posts pagination (5 per page) ———
  function initPostsPagination() {
    const list = document.querySelector('.posts-list');
    const pagination = document.querySelector('.posts-pagination');
    if (!list || !pagination) return;

    const items = Array.from(list.children);
    const pageSize = 5;
    const totalPages = Math.ceil(items.length / pageSize);
    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    let currentPage = 1;
    const prevBtn = pagination.querySelector('.pagination-prev');
    const nextBtn = pagination.querySelector('.pagination-next');
    const pagesContainer = pagination.querySelector('.pagination-pages');

    function renderPage(page) {
      currentPage = page;
      items.forEach(function (item, index) {
        const pageIndex = Math.floor(index / pageSize) + 1;
        item.style.display = pageIndex === page ? '' : 'none';
      });

      prevBtn.disabled = page === 1;
      nextBtn.disabled = page === totalPages;

      pagesContainer.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pagination-page' + (i === page ? ' is-active' : '');
        btn.textContent = String(i);
        btn.addEventListener('click', function () {
          renderPage(i);
        });
        pagesContainer.appendChild(btn);
      }
    }

    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) renderPage(currentPage - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages) renderPage(currentPage + 1);
    });

    renderPage(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

