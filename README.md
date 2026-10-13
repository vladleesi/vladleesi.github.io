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

No build step is required; any static file server will work. Development checks use **Node 24 LTS** (`.nvmrc`) and locked, development-only npm dependencies.

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node 24, serving only public site files
npm ci --ignore-scripts
npm run serve
```

Then open:

- `http://localhost:8000/` – main page.
- `http://localhost:8000/posts/<post-file>.html` – individual posts.

### Quality checks

```bash
npm run check
```

Runs HTML-Validate, Stylelint, and ESLint, then checks all six pages for local links/assets, anchor targets, unique titles/descriptions, canonical URLs, social metadata, factual article JSON-LD, crawl access, sitemap coverage, RSS publication dates, and newest-first writing. The page count grows automatically when posts are added. Whitespace errors also fail the command.

The `Static site checks` GitHub Action runs on pull requests and pushes to `main`. Lint rules focus on correctness and accessibility rather than imposing a new formatter. Existing CSS theme/state grouping and intentional semantic roles have narrow, documented exceptions: named, keyboard-scrollable `<pre role="region">` blocks keep their code semantics, and the impact list retains `role="list"` for Safari when bullets are hidden.

### Performance profiling

Install Chrome, then run:

```bash
npm run profile          # Lighthouse mobile emulation
npm run profile:desktop  # Lighthouse desktop preset
```

Each command starts a temporary local server, audits the homepage and a representative article three times, saves HTML/JSON reports under `reports/lighthouse/`, and prints median scores, LCP, CLS, and total blocking time. It closes Chrome and the server when finished. Set `CHROME_PATH` if Chrome is not detected automatically.

Accessibility and SEO must score 100 in every run. Performance below 90, LCP above 2.5 seconds, CLS above 0.1, TBT above 200 ms, and best practices below 95 produce warnings to investigate. Timing varies with external resources and machine load; warnings are not hidden or automatically treated as production regressions. Lighthouse uses lab conditions and cannot certify field Core Web Vitals or search ranking.

The `Lighthouse profiles` Action runs for pull requests that change relevant site/tooling files and can be started manually from Actions. It stores report artifacts for 14 days. Production deployment stays with the existing GitHub Pages workflow; `_config.yml` excludes development tooling and reports from publication.

Dependency audit: the current Stylelint dependency tree reports six high-severity entries stemming from one unpatched `braces` glob-pattern denial-of-service advisory ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). Lint commands use fixed, repository-owned patterns; the tools are not shipped to the browser. Do not pass untrusted glob patterns. Recheck with `npm audit` when updating dependencies; no audit findings are suppressed.

### Search and crawler maintenance

All meaningful content and links are present in HTML without JavaScript. `robots.txt` permits crawling and advertises the sitemap; CSS/JS are not blocked. Every page has a canonical URL and social metadata. Articles include `BlogPosting` JSON-LD with the visible headline, original publication date, author profile, and sharing image. The homepage defines the same author identity as `Person`.

When adding an article, update its metadata, homepage writing list, RSS, and sitemap together. Use real publication dates and update sitemap `lastmod` only when significant content or metadata changes. The article metadata was updated on 2026-10-12; original publication dates remain intact. Search engines ignore sitemap `priority` and `changefreq`, so these are not ranking controls.

After deployment, submit `https://vladleesi.dev/sitemap.xml` in Google Search Console and inspect indexing and field performance there. This requires owner access and cannot be verified by local tools. Crawlability and valid structured data help discovery; they do not guarantee indexing, rich results, or higher ranking. See [Google's article guidance](https://developers.google.com/search/docs/appearance/structured-data/article) and [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Agent guidelines and required checks before committing are in [AGENTS.md](AGENTS.md). Keep generated reports and the local portfolio review out of commits.

### Deployment

The site is deployed via **GitHub Pages** using the `pages-build-deployment` workflow on `main`.  
Pushes to `main` will trigger a rebuild and redeploy.

### Legacy Jekyll version

The previous Jekyll-based implementation is preserved in the [jekyll repo](https://github.com/vladleesi/jekyll).
