// Select the theme and its icons before the browser renders the page.
(function () {
  'use strict';

  const root = document.documentElement;
  const assets = new URL('../', document.currentScript.src);
  let stored = null;
  try { stored = localStorage.getItem('portfolio-theme'); } catch (_) { /* private browsing */ }
  const dark = stored === 'dark' || (stored !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.style.backgroundColor = dark ? '#141218' : '#fef7ff';

  const icons = [
    { rel: 'apple-touch-icon', sizes: '180x180', light: 'apple-touch-icon.png', dark: 'apple-touch-icon-dark.png' },
    { rel: 'icon', type: 'image/x-icon', light: 'favicon.ico', dark: 'favicon-dark.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', light: 'favicon-16x16.png', dark: 'favicon-16x16-dark.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', light: 'favicon-32x32.png', dark: 'favicon-32x32-dark.png' },
    { rel: 'icon', type: 'image/svg+xml', sizes: 'any', light: 'favicon-light.svg', dark: 'favicon-dark.svg' }
  ];

  window.syncThemeIcons = function () {
    const theme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    document.querySelectorAll('link[data-light-href][data-dark-href]').forEach(function (icon) {
      const href = icon.getAttribute(`data-${theme}-href`);
      if (icon.href === href) return;
      // Reinsert changed links so browsers reconsider their cached favicon.
      icon.remove();
      icon.href = href;
      document.head.appendChild(icon);
    });
  };

  icons.forEach(function (definition) {
    const icon = document.createElement('link');
    icon.rel = definition.rel;
    if (definition.type) icon.type = definition.type;
    if (definition.sizes) icon.sizes = definition.sizes;
    icon.setAttribute('data-light-href', new URL(definition.light, assets).href);
    icon.setAttribute('data-dark-href', new URL(definition.dark, assets).href);
    icon.href = icon.getAttribute(dark ? 'data-dark-href' : 'data-light-href');
    document.head.appendChild(icon);
  });
})();
