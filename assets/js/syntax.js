/** Local, demand-loaded Prism 1.29.0 grammars with the article's semantic palette. */
(function () {
  'use strict';

  var base = new URL('vendor/prism/', document.currentScript.src);
  var pending = Object.create(null);
  var configured = Object.create(null);
  var languages = {
    'typescript': ['javascript'],
    'jsx': ['markup', 'javascript'],
    'tsx': ['jsx', 'typescript'],
    'python': [],
    'java': ['clike'],
    'c': ['clike'],
    'cpp': ['c'],
    'csharp': ['clike'],
    'go': ['clike'],
    'rust': [],
    'php': ['markup-templating'],
    'markup-templating': ['markup'],
    'ruby': ['clike'],
    'sql': [],
    'json': [],
    'yaml': [],
    'toml': [],
    'markdown': ['markup'],
    'diff': [],
    'docker': [],
    'graphql': [],
    'powershell': [],
    'scss': ['css'],
    'kotlin': ['clike'],
    'swift': [],
    'groovy': ['clike'],
    'bash': []
  };
  var aliases = {
    'html': 'markup',
    'xml': 'markup',
    'svg': 'markup',
    'mathml': 'markup',
    'ssml': 'markup',
    'atom': 'markup',
    'rss': 'markup',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'cs': 'csharp',
    'dotnet': 'csharp',
    'rb': 'ruby',
    'webmanifest': 'json',
    'yml': 'yaml',
    'md': 'markdown',
    'dockerfile': 'docker',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'sh': 'bash',
    'shell': 'bash',
    'console': 'bash',
    'shell-session': 'bash',
    'jsonc': 'json'
  };

  function loadLanguage(language) {
    language = aliases[language] || language;
    if (pending[language]) return pending[language];
    if (window.Prism.languages[language]) return Promise.resolve();
    if (!Object.prototype.hasOwnProperty.call(languages, language)) return Promise.resolve();

    pending[language] = Promise.all(languages[language].map(loadLanguage)).then(function () {
      return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = new URL('prism-' + language + '.min.js', base).href;
        script.onload = resolve;
        script.onerror = function () {
          delete pending[language];
          script.remove();
          reject(new Error('Could not load syntax grammar: ' + language));
        };
        document.head.appendChild(script);
      });
    }).catch(function (error) {
      delete pending[language];
      throw error;
    });
    return pending[language];
  }

  function configureLanguages() {
    // Identify Kotlin types, object qualifiers, and named values without
    // treating capitalized Compose function calls as types.
    if (window.Prism.languages.kotlin && !configured.kotlin) {
      configured.kotlin = true;
      window.Prism.languages.insertBefore('kotlin', 'keyword', {
        // Match before qualifiers are tokenized, preserving their context.
        constant: {
          pattern: /(\b[A-Z]\w*\s*\.\s*)[A-Z]\w*\b(?!\s*[.({])/,
          lookbehind: true
        },
        'class-name': [
          {
            pattern: /(\b(?:class|interface|object|typealias)\s+)[A-Za-z_]\w*/,
            lookbehind: true
          },
          {
            pattern: /((?:^|[^:]):(?!:)\s*|\b(?:as|is)\??\s+)[A-Z]\w*/,
            lookbehind: true
          },
          /\b[A-Z]\w*(?=\s*\.)/,
          /\b(?:Any|Nothing|Unit|String|Char|Boolean|Byte|Short|Int|Long|Float|Double|Array|(?:Boolean|Byte|Short|Int|Long|Float|Double|Char)Array)\b/
        ]
      });
    }
    if (window.Prism.languages.bash && !configured.bash) {
      configured.bash = true;
      // Wrapper invocations are absent from Prism's built-in command list.
      window.Prism.languages.insertBefore('bash', 'function', {
        'gradle-task': {
          pattern: /((?:^|[;&|])[ \t]*\.\/gradlew[ \t]+)[A-Za-z_:][\w:.-]*(?:[ \t]+[A-Za-z_:][\w:.-]*)*/m,
          lookbehind: true,
          alias: 'string'
        },
        'gradle-command': {
          pattern: /((?:^|[;&|])[ \t]*)\.\/gradlew(?=[ \t\r\n;&|]|$)/m,
          lookbehind: true,
          alias: 'keyword'
        }
      });
    }
    if (window.Prism.languages.python && !configured.python) {
      configured.python = true;
      var python = window.Prism.languages.python;
      // Upstream Python marks declarations only; include ordinary API calls.
      python.function = [python.function, /\b[a-z_]\w*(?=\s*\()/i];
      window.Prism.languages.insertBefore('python', 'keyword', {
        'type-annotation': {
          pattern: /((?:^|[^:]):\s*|->\s*)[A-Z]\w*/,
          lookbehind: true,
          alias: 'class-name'
        }
      });
    }
    if (window.Prism.languages.graphql && !configured.graphql) {
      configured.graphql = true;
      // GraphQL scalars are types; YAML uses the same token name for strings.
      window.Prism.languages.graphql.scalar = {
        pattern: window.Prism.languages.graphql.scalar,
        alias: 'builtin'
      };
    }
    var primitiveTypes = {
      java: /\b(?:boolean|byte|char|double|float|int|long|short|void)\b/,
      c: /\b(?:char|double|float|int|long|short|signed|unsigned|void|_Bool|_Complex)\b/,
      cpp: /\b(?:bool|char|char8_t|char16_t|char32_t|double|float|int|long|short|signed|unsigned|void|wchar_t)\b/,
      csharp: /\b(?:bool|byte|char|decimal|double|float|int|long|object|sbyte|short|string|uint|ulong|ushort|void)\b/
    };
    Object.keys(primitiveTypes).forEach(function (language) {
      var grammar = window.Prism.languages[language];
      if (!grammar || configured[language]) return;
      configured[language] = true;
      var types = [primitiveTypes[language]].concat(grammar.builtin || []);
      window.Prism.languages.insertBefore(language, 'keyword', { builtin: types });
    });
    if (!configured.typeKeywords) {
      configured.typeKeywords = true;
      // C# also nests primitive keywords inside generic/type expressions.
      window.Prism.hooks.add('wrap', function (token) {
        var types = primitiveTypes[aliases[token.language] || token.language];
        if (token.type === 'keyword' && types && types.test(token.content)) {
          token.classes.push('builtin');
        }
      });
    }
    Object.keys(aliases).forEach(function (alias) {
      var grammar = window.Prism.languages[aliases[alias]];
      if (grammar) window.Prism.languages[alias] = grammar;
    });
  }

  function highlight() {
    if (!window.Prism) return Promise.resolve();
    var needed = new Set();
    document.querySelectorAll('.article-body pre code').forEach(function (code) {
      needed.add(window.Prism.util.getLanguage(code));
    });
    // A missing grammar leaves readable plain text; other blocks still highlight.
    return Promise.allSettled(Array.from(needed, loadLanguage)).then(function (results) {
      results.forEach(function (result) {
        if (result.status === 'rejected') console.warn(result.reason.message);
      });
      configureLanguages();
      window.Prism.highlightAllUnder(document.querySelector('.article-body') || document);
    });
  }

  window.ArticleSyntax = { highlight: highlight };
})();
