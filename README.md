## vladleesi.dev

[![GitHub Pages Deploy](https://github.com/vladleesi/vladleesi.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/vladleesi/vladleesi.github.io/actions/workflows/pages/pages-build-deployment)

Static site for `https://vladleesi.dev` — personal portfolio and blog about Android, Kotlin, Jetpack Compose, and Kotlin Multiplatform.

### Tech stack

- **Static HTML**: `index.html` + one file per post under `posts/`.
- **Vanilla JS**: small helpers in `assets/js` for layout, theming, article UX.
- **CSS only**: no framework, custom Material 3–inspired design in `assets/css`.
- **Hosting**: GitHub Pages on the `main` branch.

### Project structure

- `index.html` – landing page (hero, impact, selected work, expertise, selected writing, contact).
- `posts/` – individual article pages (`*.html`).
- `assets/css/`
  - `styles.css` – global layout, header/footer, homepage sections.
  - `article.css` – article layout, code blocks, reading progress, related posts.
- `assets/js/`
  - `site.config.js` – global site metadata consumed by layout.
  - `layout.js` – enhances header/footer fallbacks and adds the back-to-top button.
  - `script.js` – theme controls, accessible mobile navigation, back-to-top behavior, and article return positions.
  - `article.js` – article-specific behavior (reading progress and code copying).
- `assets/` – favicons and `resume/` PDF.
- `feed.xml` – RSS feed.
- `sitemap.xml` – XML sitemap for search engines.
- `robots.txt` – basic crawl rules.

All pages include static navigation and contact links. If navigation or contact details change, update the HTML fallbacks alongside `site.config.js` and `layout.js`. Essential content stays visible without JavaScript; motion preferences apply to scrolling and transitions.

The homepage sharing image is `assets/og-image.png` (1200×630), with its editable source in `assets/og-image.svg`. Article sharing images retain their existing URLs. No image generator or build step is required to serve the site.

### Local development

No build step is required; any static file server will work.

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node (if you have serve)
npx serve .
```

Then open:

- `http://localhost:8000/` – main page.
- `http://localhost:8000/posts/<post-file>.html` – individual posts.

### Deployment

The site is deployed via **GitHub Pages** using the `pages-build-deployment` workflow on `main`.  
Pushes to `main` will trigger a rebuild and redeploy.

### Legacy Jekyll version

The previous Jekyll-based implementation is preserved in the [jekyll repo](https://github.com/vladleesi/jekyll).
