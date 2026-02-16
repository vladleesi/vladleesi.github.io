// Renders reusable header + footer into placeholders:
//   <div id="site-header"></div>
//   <div id="site-footer"></div>
// Also injects the Back-to-top button once per page.

(function () {
  'use strict';

  const site = window.SITE;
  if (!site) return;
  const THEME_KEY = 'portfolio-theme';

  function getPreferredTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch (_) {
      stored = null;
    }
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function syncThemeFromStorage() {
    const theme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  // Use clean root-relative URLs for navigation and RSS.
  // This assumes the site is served from the host root (/, e.g. https://vladleesi.dev/).
  const rootHref = '/';

  const path =
    (window.location && window.location.pathname)
      ? window.location.pathname.toLowerCase()
      : '';
  const isHome =
    path === '' ||
    path === '/' ||
    path.endsWith('/index.html') ||
    path.endsWith('\\index.html');

  const aboutHref = isHome ? '#about' : rootHref + '#about';
  const skillsHref = isHome ? '#skills' : rootHref + '#skills';
  const postsHref = isHome ? '#posts' : rootHref + '#posts';

  const headerHtml = `
    <header class="header" id="header">
      <div class="header-inner">
        <a href="${rootHref}" class="logo">${site.name}</a>
        <div class="nav-wrap">
          <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
            <span class="nav-toggle-line"></span>
            <span class="nav-toggle-line"></span>
          </button>
          <nav class="nav">
            <a href="${skillsHref}" class="nav-link">Skills</a>
            <a href="${postsHref}" class="nav-link">Posts</a>
            <a href="${aboutHref}" class="nav-link">${site.nav.aboutLabel}</a>
          </nav>
          <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
            <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer class="footer">
      <div class="footer-inner">
        <a href="mailto:${site.socials.email}" class="footer-email">${site.socials.email}</a>
        <div class="footer-social">
          <a href="${site.socials.github}" class="footer-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>
          <a href="${site.socials.linkedin}" class="footer-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
          <a href="${site.socials.devto}" class="footer-link" target="_blank" rel="noopener noreferrer" aria-label="dev.to">dev.to</a>
          <a href="${site.socials.medium}" class="footer-link" target="_blank" rel="noopener noreferrer" aria-label="Medium">Medium</a>
          <a href="${site.socials.twitter}" class="footer-link" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
        </div>
        <div class="footer-rss-wrap">
          <a href="${site.rss.href}" class="footer-rss" aria-label="${site.rss.label}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
            </svg>
            ${site.rss.label}
          </a>
        </div>
        <p class="footer-copy">&copy; <span id="year"></span> ${site.name}. All rights reserved.</p>
      </div>
    </footer>
  `;

  function render() {
    const headerMount = document.getElementById('site-header');
    const footerMount = document.getElementById('site-footer');
    if (headerMount) headerMount.innerHTML = headerHtml;
    if (footerMount) footerMount.innerHTML = footerHtml;

    // Back-to-top button (single instance)
    let btn = document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      document.body.appendChild(btn);
    }
    // Always sync structure so old cached DOM still gets latest icon/styling.
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<span class="back-to-top-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg></span>';

    // "Back to home" — simulate browser Back when possible
    // to avoid adding an extra entry to the history stack.
    document.querySelectorAll('.article-back').forEach(function (link) {
      link.addEventListener('click', function (e) {
        // If there is a previous history entry, go back instead of navigating anew.
        if (window.history && window.history.length > 1) {
          e.preventDefault();
          window.history.back();
        } else {
          // Fallback: go to host root (works in production and on local servers).
          link.setAttribute('href', '/');
        }
      });
    });

    // Set base title if page left it unchanged
    if (document.title && document.title.includes('Portfolio & Blog')) {
      document.title = site.title;
    }

    syncThemeFromStorage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  // Keep theme in sync when the page is restored from BFCache
  // (e.g., browser Back/Forward navigation).
  window.addEventListener('pageshow', function () {
    syncThemeFromStorage();
  });
})();

