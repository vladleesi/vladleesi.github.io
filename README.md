# vladleesi.dev

Personal portfolio and blog focused on Android and Kotlin.

## Tech stack

- Static HTML, CSS, and vanilla JavaScript.
- Material 3 styling with light/dark themes.
- GitHub Pages on `main`; no production build.

## Project structure

- `index.html` — homepage.
- `posts/` — article pages.
- `assets/` — styles, scripts, images, and resume.
- `scripts/` — local server and quality/performance checks.
- `.github/workflows/` — CI checks and Lighthouse profiles.
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
| `npm run check` | HTML/CSS/JS lint, links, metadata, robots, sitemap, RSS, and whitespace |
| `npm run profile` | Three Lighthouse mobile runs on the homepage and an article |
| `npm run profile:desktop` | The same checks with the desktop preset |

Reports go to `reports/lighthouse/` and stay out of Git. Lighthouse timings are lab measurements; accessibility and SEO must score 100. Inspect performance warnings.

CI checks pull requests and pushes to `main`. Lighthouse runs on relevant pull requests or manually from Actions. `_config.yml` excludes development tools and reports from publication.

## Maintenance

- Edit `index.html`, `posts/*.html`, and `assets/` directly.
- Keep static header/footer fallbacks aligned with `assets/js/site.config.js` and `layout.js`.
- New posts need homepage links, RSS, sitemap, and article metadata. Preserve publication dates; update `lastmod` only for significant changes.
- See [AGENTS.md](AGENTS.md) for coding and pre-commit rules.

Known tool issue: Stylelint has an unpatched development-only [glob-parser advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Use only fixed, repository-owned lint patterns.

## License

Website source code (HTML structure, CSS, JavaScript, configuration, and development tooling) is licensed under the [MIT License](LICENSE).

Personal photos, artwork, portfolio descriptions, article text, resume content, logos, favicons, social preview images, and personal branding are excluded, even when embedded in source files or metadata. All Rights Reserved, subject to previously granted rights. Third-party materials retain their own licenses and attribution requirements.
