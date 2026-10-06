## vladleesi.dev

[![GitHub Pages Deploy](https://github.com/vladleesi/vladleesi.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/vladleesi/vladleesi.github.io/actions/workflows/pages/pages-build-deployment)

Static site for `https://vladleesi.dev` — personal portfolio and blog about Android, Kotlin, Jetpack Compose, and Kotlin Multiplatform.

### Tech stack

- **Static HTML**: `index.html` + one file per post under `posts/`.
- **Vanilla JS**: small helpers in `assets/js` for layout, theming, article UX.
- **CSS only**: no framework, shared editorial design in `assets/css` and locally bundled Archivo fonts.
- **Hosting**: GitHub Pages on the `main` branch.

### Project structure

- `index.html` – landing page (hero, skills, latest posts, about).
- `posts/` – individual article pages (`*.html`).
- `assets/css/`
  - `styles.css` – global layout, header/footer, homepage sections.
  - `article.css` – article layout, code blocks, reading progress, related posts.
- `assets/js/`
  - `site.config.js` – global site metadata consumed by layout.
  - `layout.js` – renders shared header/footer + back-to-top button.
  - `script.js` – shared theme toggle, navigation, back-to-top, and homepage pagination.
  - `article.js` – article-specific behavior (reading progress, accessible copy buttons, Prism init).
  - `syntax.js` – local grammar loading and semantic syntax mappings shared by articles.
- `assets/fonts/` – local Archivo fonts and their SIL Open Font Licenses.
- `assets/js/vendor/prism/` – existing Prism 1.29.0 syntax highlighter, bundled locally with its MIT license.
- `assets/` – favicons and `resume/` PDF.
- `feed.xml` – RSS feed.
- `sitemap.xml` – XML sitemap for search engines.
- `robots.txt` – basic crawl rules.

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

### Article syntax highlighting

Use `<pre><code class="language-kotlin">...</code></pre>` with the appropriate
language name. Article pages load only the local grammars they need, including
dependencies. No external CDN or build step is required. Unknown languages remain
readable as plain text.

Supported languages include JavaScript, TypeScript, JSX/TSX, Python, Java, Kotlin,
Swift, C, C++, C#, Go, Rust, PHP, Ruby, Groovy, Bash, PowerShell, HTML/XML, CSS/SCSS,
SQL, JSON, YAML, TOML, Markdown, Dockerfiles, GraphQL, and diffs. Common aliases such
as `js`, `ts`, `py`, `kt`, `sh`, `yml`, `md`, and `console` also work.

Syntax uses only the existing article palette: red control syntax, amber types,
sage strings, muted blue numbers/constants, semibold off-white functions, and
neutral variables, operators, and comments. Markdown and diffs use the same colors.
Token extensions follow [Prism's language and alias API](https://prismjs.com/extending.html).

Run the grammar, loader, and palette regression checks with:

```bash
node --test tests/syntax.test.cjs
```

### Deployment

The site is deployed via **GitHub Pages** using the `pages-build-deployment` workflow on `main`.  
Pushes to `main` will trigger a rebuild and redeploy.

### Legacy Jekyll version

The previous Jekyll-based implementation is preserved in the [jekyll repo](https://github.com/vladleesi/jekyll).
