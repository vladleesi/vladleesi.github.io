/**
 * Article page — Reading progress, accessible code copying, syntax highlighting.
 */

(function () {
  'use strict';

  function initProgressBar() {
    const progress = document.getElementById('reading-progress');
    if (!progress) return;

    function updateProgress() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }

    window.addEventListener('scroll', function () {
      requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();
  }

  function initCopyButtons() {
    var body = document.querySelector('.article-body');
    if (!body) return;

    /* Ensure every pre has a wrap and copy button */
    body.querySelectorAll('pre').forEach(function (pre) {
      var wrap = pre.closest('.code-block-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'code-block-wrap';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
      }
      if (!wrap.querySelector('.code-copy')) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-copy';
        btn.setAttribute('aria-label', 'Copy code');
        btn.textContent = 'Copy';
        wrap.insertBefore(btn, wrap.firstChild);
      }
    });

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        if (!document.execCommand('copy')) throw new Error('Copy was not supported');
        return Promise.resolve();
      } finally {
        document.body.removeChild(ta);
      }
    }

    body.querySelectorAll('.code-block-wrap').forEach(function (wrap) {
      var btn = wrap.querySelector('.code-copy');
      var codeEl = wrap.querySelector('pre code');
      if (!btn || !codeEl) return;

      btn.setAttribute('aria-live', 'polite');
      btn.setAttribute('aria-atomic', 'true');
      var feedbackTimer;

      btn.addEventListener('click', function () {
        clearTimeout(feedbackTimer);
        var text = (codeEl.textContent || codeEl.innerText || '').trim();
        copyToClipboard(text).then(function () {
          btn.classList.add('copied');
          btn.textContent = 'Copied';
          btn.setAttribute('aria-label', 'Code copied');
          feedbackTimer = setTimeout(function () {
            btn.classList.remove('copied');
            btn.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy code');
          }, 2000);
        }).catch(function () {
          btn.classList.remove('copied');
          btn.textContent = 'Copy failed';
          btn.setAttribute('aria-label', 'Copy failed; select the code to copy manually');
          feedbackTimer = setTimeout(function () {
            btn.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy code');
          }, 2000);
        });
      });
    });
  }

  function initSyntaxHighlight() {
    if (typeof window.Prism !== 'undefined') {
      // Prism's Kotlin grammar omits class names; identify explicit type contexts
      // without treating capitalized Compose functions as types.
      if (window.Prism.languages.kotlin) {
        window.Prism.languages.insertBefore('kotlin', 'keyword', {
          'class-name': [
            {
              pattern: /(\b(?:class|interface|object|typealias)\s+)[A-Za-z_]\w*/,
              lookbehind: true
            },
            {
              pattern: /((?:^|[^:]):(?!:)\s*|\b(?:as|is)\??\s+)[A-Z]\w*/,
              lookbehind: true
            },
            /\b(?:Any|Nothing|Unit|String|Char|Boolean|Byte|Short|Int|Long|Float|Double|Array|(?:Boolean|Byte|Short|Int|Long|Float|Double|Char)Array)\b/
          ]
        });
      }
      window.Prism.highlightAll();
    }
  }

  function init() {
    initProgressBar();
    initCopyButtons();
    initSyntaxHighlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
