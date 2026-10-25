# vladleesi.dev

Personal portfolio and blog focused on Android and Kotlin.

## Tech stack

- Static HTML, CSS, and vanilla JavaScript.
- Material 3 styling with light/dark themes.
- GitHub Pages from `main`; Node packages static files with automatic asset versions.

## Project structure

- `index.html` — homepage.
- `posts/` — article pages.
- `assets/` — styles, scripts, images, and resume.
- `scripts/` — static packaging, local server, and quality/performance checks.
- `.github/workflows/` — deployment, CI checks, and Lighthouse profiles.
- `feed.xml`, `sitemap.xml`, `robots.txt` — RSS and crawler metadata.

## Local development

Use Node 24 LTS. Chrome is required for Lighthouse.

```bash
npm ci --ignore-scripts
npm run serve
```

Open [localhost:8000](http://localhost:8000).

## Checks

| Command | Purpose |
| --- | --- |
| `npm run build` | Package only public files into `_site/` with content-derived asset URLs |
| `npm run serve:built` | Preview the packaged site on localhost:8000 |
| `npm run check` | Lint, source/site checks, packaging regression tests, and packaged-site checks |
| `npm run profile` | Three Lighthouse mobile runs on the homepage and an article |
| `npm run profile:desktop` | The same checks with the desktop preset |

Reports go to `reports/lighthouse/` and stay out of Git. Lighthouse timings are lab measurements; accessibility and SEO must score 100. Inspect performance warnings.

CI checks pull requests and pushes to `main`. Lighthouse tests the packaged site on relevant pull requests or manually from Actions. `_site/` and reports stay out of Git; only the packaged public files are deployed.

## Deployment

One-time setup: select **Settings → Pages → Build and deployment → Source → GitHub Actions**. After this workflow is pushed, pushes to `main` check, package, and deploy the site automatically.

Asset versions cover CSS, JavaScript, fonts, images, and theme icons. Changed assets get new URLs; unchanged builds retain the same version. Source files need no manual version edits. Article and resume URLs stay stable.

Cloudflare must include query strings in its cache key (Standard caching). Keep the four-hour asset cache. For fresh HTML, bypass its edge cache and require browser revalidation with `Cache-Control: no-cache` using Cloudflare configuration; GitHub Pages cannot set that header from site files. Deployment/propagation and a page reload are still required. Changing Cloudflare settings is separate from this repository.

## Maintenance

- Edit `index.html`, `posts/*.html`, and `assets/` directly.
- Keep static header/footer fallbacks aligned with `assets/js/site.config.js` and `layout.js`.
- New posts need homepage links, RSS, sitemap, and article metadata. Preserve publication dates; update `lastmod` only for significant changes.
- See [AGENTS.md](AGENTS.md) for coding and pre-commit rules.

## License

Website source code (HTML structure, CSS, JavaScript, configuration, and development tooling) is licensed under the [MIT License](LICENSE).

Personal photos, artwork, portfolio descriptions, article text, resume content, logos, favicons, social preview images, and personal branding are excluded, even when embedded in source files or metadata. All Rights Reserved, subject to previously granted rights. Third-party materials retain their own licenses and attribution requirements.
