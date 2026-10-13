import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { startServer } from './serve.mjs';

const mode = process.argv.includes('--desktop') ? 'desktop' : 'mobile';
const pages = ['/', '/posts/2026-01-26-vertical-text-in-jetpack-compose-without-rotation-width-problems.html'];
const directory = `reports/lighthouse/${mode}`;
const runs = 3;
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const { server, origin } = await startServer();
let chrome;
let failed = false;
const summary = [];

try {
  await mkdir(directory, { recursive: true });
  // Use the installed Chrome; no browser download or public report upload.
  chrome = await launch({ chromeFlags: ['--headless', '--disable-dev-shm-usage'] });
  for (const [index, path] of pages.entries()) {
    const results = [];
    for (let run = 1; run <= runs; run++) {
      console.log(`${mode}: ${index ? 'article' : 'home'}, run ${run}/${runs}`);
      const result = await lighthouse(origin + path, {
        port: chrome.port, logLevel: 'error', output: ['html', 'json'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }, mode === 'desktop' ? desktopConfig : undefined);
      if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message || 'No Lighthouse result');
      const name = `${directory}/${index ? 'article' : 'home'}-${run}`;
      await writeFile(name + '.html', result.report[0]);
      await writeFile(name + '.json', result.report[1]);
      results.push(result.lhr);
    }
    const scores = Object.fromEntries(Object.keys(results[0].categories).map(key => [key,
      Math.round(median(results.map(result => result.categories[key].score)) * 100)]));
    const metrics = Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']
      .map(key => [key, median(results.map(result => result.audits[key].numericValue))]));
    const warnings = [];
    if (scores.performance < 90) warnings.push('Performance score below 90');
    if (metrics['largest-contentful-paint'] > 2500) warnings.push('LCP above 2500 ms');
    if (metrics['cumulative-layout-shift'] > 0.1) warnings.push('CLS above 0.1');
    if (metrics['total-blocking-time'] > 200) warnings.push('TBT above 200 ms');
    if (scores['best-practices'] < 95) warnings.push('Best practices score below 95');
    // Timing is advisory because external resources and runner load vary.
    // Every run must pass the stable accessibility/SEO category gates.
    const gatesPassed = results.every(result => result.categories.accessibility.score === 1 && result.categories.seo.score === 1);
    if (!gatesPassed) failed = true;
    const entry = { path, mode, runs, scores, metrics, gatesPassed, warnings };
    summary.push(entry);
    console.log(JSON.stringify(entry));
    if (!gatesPassed) {
      for (const category of ['accessibility', 'seo']) {
        const audits = new Set(results.flatMap(result => result.categories[category].auditRefs
          .filter(ref => ref.weight > 0 && result.audits[ref.id].score !== 1).map(ref => ref.id)));
        if (audits.size) console.error(`${category} failures: ${[...audits].join(', ')}`);
      }
    }
  }
  await writeFile(`${directory}/summary.json`, JSON.stringify(summary, null, 2) + '\n');
  console.log(`Reports: ${directory}/. Lab measurements; production performance must be verified separately.`);
  if (failed) process.exitCode = 1;
} finally {
  try { if (chrome) await chrome.kill(); }
  finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}
