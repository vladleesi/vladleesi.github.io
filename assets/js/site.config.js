// Central site configuration (single source of truth)
// Used by layout.js to render header + footer consistently across all pages.
window.SITE = {
  name: '@vladleesi',
  title: 'Vladislav Kochetov | Mobile Software Engineer',
  nav: {
    aboutLabel: 'About',
  },
  socials: {
    email: 'hello@vladleesi.dev',
    github: 'https://github.com/vladleesi',
    linkedin: 'https://www.linkedin.com/in/vladkochetov',
    devto: 'https://dev.to/vladleesi',
    medium: 'https://medium.com/@vladleesi',
    twitter: 'https://twitter.com/vladleesi',
  },
  rss: {
    // Always resolve RSS from the host root, e.g. https://vladleesi.dev/feed.xml
    href: '/feed.xml',
    label: 'Subscribe via RSS',
  },
};

