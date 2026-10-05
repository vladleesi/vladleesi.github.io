/* Shared theme, navigation, back-to-top, and homepage pagination. */
(function () {
  'use strict';

  const themeKey = 'portfolio-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function savedTheme() {
    try { return localStorage.getItem(themeKey); } catch (_) { return null; }
  }

  function preferredTheme() {
    const saved = savedTheme();
    return saved === 'dark' || saved === 'light' ? saved : systemTheme.matches ? 'dark' : 'light';
  }

  function init() {
    const root = document.documentElement;
    const themeButton = document.getElementById('theme-toggle');
    const header = document.getElementById('header');
    const menuButton = document.getElementById('nav-toggle');
    const nav = header && header.querySelector('.nav');
    const topButton = document.getElementById('back-to-top');

    function applyTheme(theme) {
      const dark = theme === 'dark';
      root.dataset.theme = theme;
      root.style.backgroundColor = dark ? '#080808' : '#edebe5';
      if (themeButton) {
        themeButton.textContent = dark ? 'Light' : 'Dark';
        themeButton.setAttribute('aria-pressed', String(dark));
        themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        themeButton.title = themeButton.getAttribute('aria-label');
      }
    }

    applyTheme(preferredTheme());
    if (themeButton) themeButton.addEventListener('click', function () {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(themeKey, next); } catch (_) {}
    });
    systemTheme.addEventListener('change', function () {
      const saved = savedTheme();
      if (saved !== 'dark' && saved !== 'light') applyTheme(preferredTheme());
    });
    window.addEventListener('pageshow', function () { applyTheme(preferredTheme()); });
    window.addEventListener('storage', function (event) {
      if (event.key === themeKey || event.key === null) applyTheme(preferredTheme());
    });

    function closeMenu(returnFocus) {
      if (!header || !menuButton) return;
      header.classList.remove('nav-open');
      menuButton.setAttribute('aria-expanded', 'false');
      if (returnFocus) menuButton.focus();
    }

    if (menuButton && nav) {
      nav.id = 'main-navigation';
      menuButton.setAttribute('aria-controls', nav.id);
      menuButton.addEventListener('click', function () {
        const open = !header.classList.contains('nav-open');
        header.classList.toggle('nav-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
      });
      header.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && header.classList.contains('nav-open')) closeMenu(true);
      });
      document.addEventListener('click', function (event) {
        if (!header.contains(event.target)) closeMenu(false);
      });
      window.matchMedia('(max-width: 600px)').addEventListener('change', function () { closeMenu(false); });
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          closeMenu(false);
          const href = link.getAttribute('href');
          const section = href.startsWith('#') ? document.querySelector(href) : null;
          if (section) {
            section.setAttribute('tabindex', '-1');
            section.focus({ preventScroll: true });
          }
        });
      });
    }

    if (nav && window.IntersectionObserver) {
      const links = Array.from(nav.querySelectorAll('a'));
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          const link = links.find(function (item) { return item.hash === '#' + entry.target.id; });
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (item) { item.removeAttribute('aria-current'); });
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }, { rootMargin: '-15% 0px -55% 0px' });
      document.querySelectorAll('#skills, #posts, #about').forEach(function (section) { observer.observe(section); });
    }

    if (topButton) {
      function updateTopButton() { topButton.hidden = window.scrollY <= 200; }
      window.addEventListener('scroll', updateTopButton, { passive: true });
      topButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
        const main = document.getElementById('main');
        if (main) main.focus({ preventScroll: true });
      });
      updateTopButton();
    }

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    initPagination();
  }

  function initPagination() {
    const list = document.querySelector('.posts-list');
    const pagination = document.querySelector('.posts-pagination');
    if (!list || !pagination) return;
    const items = Array.from(list.children);
    const totalPages = Math.ceil(items.length / 5);
    if (totalPages <= 1) { pagination.hidden = true; return; }
    pagination.hidden = false;
    const previous = pagination.querySelector('.pagination-prev');
    const next = pagination.querySelector('.pagination-next');
    const pages = pagination.querySelector('.pagination-pages');
    let current = 1;

    function render(page, focusPage) {
      current = page;
      items.forEach(function (item, index) { item.hidden = Math.floor(index / 5) + 1 !== page; });
      previous.disabled = page === 1;
      next.disabled = page === totalPages;
      pages.replaceChildren();
      for (let number = 1; number <= totalPages; number++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pagination-page' + (number === page ? ' is-active' : '');
        button.textContent = String(number);
        button.setAttribute('aria-label', 'Page ' + number);
        if (number === page) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', function () { render(number, true); });
        pages.appendChild(button);
        if (focusPage && number === page) button.focus();
      }
    }

    previous.addEventListener('click', function () { if (current > 1) render(current - 1, true); });
    next.addEventListener('click', function () { if (current < totalPages) render(current + 1, true); });
    render(1, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
