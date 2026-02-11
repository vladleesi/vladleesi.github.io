// Renders reusable header + footer into placeholders:
//   <div id="site-header"></div>
//   <div id="site-footer"></div>
// Also injects the Back-to-top button once per page.

(function () {
  'use strict';

  const site = window.SITE;
  if (!site) return;

  const loc = window.location || {};
  const path = loc.pathname ? loc.pathname.toLowerCase() : '';
  const isHttpLike = loc.protocol === 'http:' || loc.protocol === 'https:';
  const isHome = path.endsWith('/index.html') || path.endsWith('\\index.html') || path === '' || path.endsWith('/');
  const inPosts = path.indexOf('posts') !== -1;

  // When served over HTTP(S), always point home links to the host root ("/"),
  // so the main page is at https://host/ instead of https://host/index.html.
  // When opened from local files (file://), fall back to relative index.html links.
  const rootHref = isHttpLike ? '/' : (inPosts ? '../index.html' : 'index.html');

  const aboutHref = isHome ? '#about' : rootHref + '#about';
  const skillsHref = isHome ? '#skills' : rootHref + '#skills';
  const postsHref = isHome ? '#posts' : rootHref + '#posts';

  // Always use current host + /feed.xml (in http/https),
  // and fall back to a plain "feed.xml" when there is no origin (e.g. file://).
  const rssHref = (loc.origin ? loc.origin + '/feed.xml' : 'feed.xml');

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
          <a href="${rssHref}" class="footer-rss" aria-label="${site.rss.label}">
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
    if (!document.getElementById('back-to-top')) {
      const btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.textContent = '↑';
      document.body.appendChild(btn);
    }

    // Set base title if page left it unchanged
    if (document.title && document.title.includes('Portfolio & Blog')) {
      document.title = site.title;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();

