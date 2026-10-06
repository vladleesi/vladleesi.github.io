const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const samples = require('./fixtures/syntax-samples.json');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function environment(names, failures = new Set()) {
  const loaded = [], warnings = [];
  let highlighted = 0;
  const blocks = names.map(name => ({ className: 'language-' + name, parentElement: null }));
  class Element { matches() { return false; } }
  const context = vm.createContext({ URL, Set, Promise, Element, console: { warn: text => warnings.push(text) } });
  context.window = context;
  context.Prism = { manual: true };
  context.document = {
    currentScript: { src: 'https://portfolio.test/assets/js/syntax.js', getAttribute: () => null, hasAttribute: () => true },
    querySelectorAll: () => blocks,
    querySelector: () => null,
    createElement: () => ({ remove() {} }),
    head: {
      appendChild(script) {
        const filename = new URL(script.src).pathname.slice(1);
        loaded.push(filename);
        queueMicrotask(() => {
          if (failures.has(filename)) return script.onerror();
          vm.runInContext(read(filename), context, { filename });
          script.onload();
        });
      }
    }
  };
  vm.runInContext(read('assets/js/vendor/prism/prism.min.js'), context);
  context.Prism.highlightAllUnder = () => highlighted++;
  vm.runInContext(read('assets/js/syntax.js'), context);
  return { context, blocks, loaded, warnings, get highlighted() { return highlighted; } };
}

function flat(tokens) {
  return tokens.map(token => typeof token === 'string' ? token : Array.isArray(token.content) ? flat(token.content) : token.content).join('');
}

test('all supported languages tokenize real samples without changing source text', async () => {
  const env = environment(Object.keys(samples));
  await env.context.ArticleSyntax.highlight();
  assert.deepEqual(env.warnings, []);
  for (const [language, source] of Object.entries(samples)) {
    const grammar = env.context.Prism.languages[language];
    assert(grammar, language + ' grammar available');
    const tokens = env.context.Prism.tokenize(source, grammar);
    assert(tokens.some(token => typeof token !== 'string'), language + ' has syntax tokens');
    assert.equal(flat(tokens), source, language + ' source preserved');
  }
});

test('only required grammars load; concurrent requests share dependencies', async () => {
  const env = environment(['tsx', 'tsx', 'python']);
  await Promise.all([env.context.ArticleSyntax.highlight(), env.context.ArticleSyntax.highlight()]);
  const names = env.loaded.map(file => path.basename(file)).sort();
  assert.deepEqual(names, ['prism-jsx.min.js', 'prism-python.min.js', 'prism-tsx.min.js', 'prism-typescript.min.js']);
  assert.equal(env.highlighted, 2);
});

test('common aliases and unknown languages work without unrelated downloads', async () => {
  const env = environment(['py', 'ts', 'yml', 'console', 'jsonc', 'unknown-language']);
  await env.context.ArticleSyntax.highlight();
  for (const [alias, canonical] of [['py', 'python'], ['ts', 'typescript'], ['yml', 'yaml'], ['console', 'bash'], ['jsonc', 'json']]) {
    assert.equal(env.context.Prism.languages[alias], env.context.Prism.languages[canonical]);
  }
  assert.equal(env.loaded.length, 5);
  assert.equal(env.highlighted, 1);
});

test('a failed grammar does not block others and can be retried', async () => {
  const failures = new Set(['assets/js/vendor/prism/prism-python.min.js']);
  const env = environment(['python', 'json'], failures);
  await env.context.ArticleSyntax.highlight();
  assert(env.context.Prism.languages.json);
  assert.equal(env.highlighted, 1);
  assert.equal(env.warnings.length, 1);
  failures.clear();
  await env.context.ArticleSyntax.highlight();
  assert(env.context.Prism.languages.python);
});

test('Kotlin keeps Compose calls distinct from types and named values', async () => {
  const env = environment(['kotlin']);
  await env.context.ArticleSyntax.highlight();
  const tokens = env.context.Prism.tokenize(samples.kotlin, env.context.Prism.languages.kotlin);
  for (const name of ['Alignment', 'Arrangement', 'Modifier']) assert(tokens.some(t => t.type === 'class-name' && t.content === name));
  for (const name of ['CenterHorizontally', 'Center']) assert(tokens.some(t => t.type === 'constant' && t.content === name));
  for (const name of ['Column', 'Text', 'remember', 'forEach']) assert(tokens.some(t => t.type === 'function' && t.content === name));
  const controls = env.context.Prism.tokenize('// Alignment.Center\nval text = "Arrangement.Center"\nThing.Call()', env.context.Prism.languages.kotlin);
  assert(!controls.some(t => t.type === 'constant'));
});

test('Python API calls and Java/C-family primitive types have semantic tokens', async () => {
  const env = environment(['python', 'java', 'c', 'cpp', 'csharp']);
  await env.context.ArticleSyntax.highlight();
  const prism = env.context.Prism;
  const python = prism.tokenize(samples.python, prism.languages.python);
  assert(python.some(t => t.type === 'function' && t.content === 'format_title'));
  assert(python.some(t => t.type === 'type-annotation' && t.content === 'Article'));
  for (const language of ['java', 'c', 'cpp']) {
    assert(prism.tokenize('int views = 12;', prism.languages[language]).some(t => t.type === 'builtin' && t.content === 'int'), language);
  }
  assert.match(prism.highlight('List<int> views;', prism.languages.csharp, 'csharp'), /class="token [^"]*builtin[^"]*">int</);
});

test('console commands keep action and task roles; text and flags are preserved', async () => {
  const env = environment(['bash']);
  await env.context.ArticleSyntax.highlight();
  const prism = env.context.Prism;
  const tokens = prism.tokenize(samples.bash, prism.languages.bash);
  assert.equal(tokens.filter(t => t.type === 'gradle-command' && t.alias === 'keyword').length, 2);
  assert(tokens.some(t => t.type === 'gradle-task' && t.content === 'publishToMavenLocal' && t.alias === 'string'));
  const flags = prism.tokenize('./gradlew :webApp:build --info', prism.languages.bash);
  assert(flags.some(t => t.type === 'parameter'));
  assert.equal(flat(flags), './gradlew :webApp:build --info');
});

test('every syntax foreground uses the approved palette with accessible contrast', () => {
  const css = read('assets/css/article.css');
  const colors = [...css.matchAll(/--code-[\w-]+:\s*(#[\da-f]{6})/g)].map(match => match[1]);
  const palette = new Set(['#101010', '#eeece6', '#8a8681', '#f2554a', '#d6b477', '#a9bc7a', '#8fbac6', '#c8c3bc']);
  const luminance = hex => {
    const values = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
  };
  for (const color of colors) {
    assert(palette.has(color), color + ' is in the approved palette');
    if (color !== '#101010') assert((luminance(color) + .05) / (luminance('#101010') + .05) >= 4.5, color);
  }
});
