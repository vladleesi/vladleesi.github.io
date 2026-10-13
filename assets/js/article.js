/**
 * Article page — Reading progress bar, copy buttons, and syntax highlighting
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
        document.execCommand('copy');
        return Promise.resolve();
      } finally {
        document.body.removeChild(ta);
      }
    }

    body.querySelectorAll('.code-block-wrap').forEach(function (wrap) {
      var btn = wrap.querySelector('.code-copy');
      var codeEl = wrap.querySelector('pre code');
      if (!btn || !codeEl) return;

      btn.addEventListener('click', function () {
        var text = (codeEl.textContent || codeEl.innerText || '').trim();
        copyToClipboard(text).then(function () {
          btn.classList.add('copied');
          btn.textContent = 'Copied';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.textContent = 'Copy';
          }, 2000);
        }).catch(function () {
          btn.textContent = 'Copy failed';
          setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
        });
      });
      btn.hidden = false;
    });
  }

  function init() {
    initProgressBar();
    initCopyButtons();
    // Deferred Prism scripts highlight once automatically after parsing.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

