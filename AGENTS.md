# Working on vladleesi.dev

Static HTML, CSS, and vanilla browser JavaScript; GitHub Pages serves `main`.
Development tools use Node 24 LTS (`npm ci --ignore-scripts`); no production build or runtime npm dependencies.

## Work efficiently

- Start with `git status --short`, then targeted `rg` searches. Read only relevant files/ranges; reuse findings instead of rescanning the repository.
- Keep tool output short. Never dump lockfiles, minified libraries, binary assets, base64, or full performance traces into context.
- Batch independent reads. Make the smallest complete change; reuse components and tokens. Avoid speculative refactoring, new frameworks, and dependencies without a concrete benefit.
- Complete the whole requested task, including follow-up changes, before running the full check suite. Do not run it after individual edits. During implementation, use targeted checks only to resolve specific concerns; after validation fixes, rerun only affected checks. Do not trade correctness or required validation for token savings.
- Summarize the result, validation, and limitations briefly. Do not generate review documents unless requested.
- Keep README.md and other project documentation short and clean: essential descriptions, setup, commands, and material limitations. Preserve the README’s Tech stack and Project structure sections. Do not shorten AGENTS.md or omit its detailed instructions.

## Site conventions

- Preserve the minimalist Material 3 design, both themes, responsive layout, and visible keyboard focus. Respect reduced motion; essential content and navigation must work without JavaScript.
- Keep Android/Kotlin Senior individual-contributor positioning. Verify career facts; never invent scope, metrics, dates, or security guarantees.
- Maintain static header/footer fallbacks alongside `assets/js/site.config.js` and `layout.js`. Keep the pre-paint theme script small; defer other scripts.
- Keep article URLs and the resume PDF URL stable. Sort writing newest first. Preserve RSS, original publication dates, and article return-scroll behavior.
- Use semantic HTML, descriptive links, one H1, unique IDs, accessible names, and decorative SVGs with `aria-hidden="true"`. Reserve image dimensions; lazy-load images below the fold.
- Optimize measured bottlenecks. Avoid unnecessary animation work, duplicate listeners, third-party requests, and large images. Lighthouse is lab data, not proof of production Core Web Vitals.
- Keep unique titles/descriptions, absolute HTTPS canonicals, social images, and factual JSON-LD aligned with visible content. New posts need homepage links, RSS, sitemap entries, and article metadata.
- Keep robots crawlable, including CSS/JS. Update sitemap `lastmod` only for real significant content/metadata changes. Do not add fake freshness, keyword stuffing, or crawler-specific content.

## Before preparing a commit

1. After all requested changes are complete, run `npm run check` once (HTML/CSS/JS lint, local links/assets, metadata, structured data, sitemap/RSS, and whitespace).
2. For changes affecting rendering, assets, scripts, or SEO, run `npm run profile` and `npm run profile:desktop`. Inspect warnings and compare reports; fix regressions without hiding audits or relaxing budgets just to pass.
3. For UI changes, check mobile/desktop, light/dark, keyboard navigation, reduced motion, and no-JS behavior in a browser. For article/navigation changes, check both browser Back and Back to home restore the reading position.
4. Review `git diff --stat` and the relevant diff. Stage explicit files only. Never include local reports, `.DS_Store` or secrets.
5. Commit/push only when requested. Report checks actually run; explain unavailable checks rather than claiming success.
