  registerFeature({
    id: 'review-mode',
    label: 'Review Mode',
    description: 'Hide solved answers and let you re-check yourself without spoilers',
    scope: 'module',
    default: false,
    hotReload: true,
    cleanup() {
      window._aptReviewActive = false;

      if (window._aptReviewObs) {
        window._aptReviewObs.disconnect();
        delete window._aptReviewObs;
      }

      var state = window._aptReviewState;
      if (state && state.originalValues) {
        state.originalValues.forEach(function (original, input) {
          if (!input || !input.isConnected) return;
          input.value = original;
          input.removeAttribute('data-apt-original-value');
        });
      }

      if (state && Array.isArray(state.entries)) {
        state.entries.forEach(function (entry) {
          if (!entry) return;

          if (entry.input && entry.input.isConnected) {
            entry.input.value = entry.answer || entry.input.getAttribute('data-apt-original-value') || '';
            entry.input.removeAttribute('data-apt-original-value');
          }

          if (entry.formWrapper && entry.formWrapper.isConnected) {
            entry.formWrapper.style.removeProperty('display');
            entry.formWrapper.removeAttribute('data-apt-review');
          }

          if (entry.ui && entry.ui.isConnected) entry.ui.remove();
          if (entry.resultEl && entry.resultEl.isConnected) entry.resultEl.remove();

          if (entry.li && entry.li.isConnected) {
            entry.li.removeAttribute('data-apt-review-wired');
            entry.li.removeAttribute('data-apt-review-answer');
          }
        });
      }
      delete window._aptReviewState;

      var style = document.getElementById('apt-review-mode-style');
      if (style) style.remove();

      // Fallback restore for any remaining marked inputs (if map is stale after rerenders).
      document.querySelectorAll('input[data-apt-original-value]').forEach(function (input) {
        input.value = input.getAttribute('data-apt-original-value') || '';
        input.removeAttribute('data-apt-original-value');
      });

      document.querySelectorAll('[data-apt-review]').forEach(function (wrapper) {
        wrapper.style.removeProperty('display');
        wrapper.removeAttribute('data-apt-review');
      });

      document.querySelectorAll('#questions-list li[data-apt-review-wired]').forEach(function (li) {
        var input = li.querySelector('form input[type="text"][disabled], form input[type="password"][disabled], form textarea[disabled]');
        var answer = li.getAttribute('data-apt-review-answer');
        if (input && answer) {
          input.value = answer;
          input.removeAttribute('data-apt-original-value');
        }
        li.removeAttribute('data-apt-review-wired');
        li.removeAttribute('data-apt-review-answer');
      });

      document.querySelectorAll('.apt-review-ui, .apt-review-result').forEach(function (el) {
        el.remove();
      });
    },
    run() {
      window._aptReviewActive = true;
      if (!window._aptReviewState) {
        window._aptReviewState = {
          originalValues: new Map(),
          entries: [],
        };
      }

      if (!document.getElementById('apt-review-mode-style')) {
        var style = document.createElement('style');
        style.id = 'apt-review-mode-style';
        style.textContent =
          '.apt-review-ui {' +
          '  display: flex; align-items: center; width: 100%; gap: 8px;' +
          '}' +
          '.apt-review-input {' +
          '  flex: 1; min-width: 0;' +
          '  background: #1a2332; border: 1px solid #2a3a4a; border-radius: 6px;' +
          '  padding: 8px 12px; color: #e0e0e0; font-size: 14px;' +
          '  box-sizing: border-box; outline: none;' +
          '}' +
          '.apt-review-input:focus { border-color: #9fef00; }' +
          '.apt-review-btn {' +
          '  padding: 8px 14px; border-radius: 6px; font-size: 13px;' +
          '  font-weight: 600; cursor: pointer; border: none; white-space: nowrap; flex-shrink: 0;' +
          '}' +
          '.apt-review-check { background: #9fef00; color: #1a2332; }' +
          '.apt-review-check:hover { background: #8dd900; }' +
          '.apt-review-result {' +
          '  font-size: 13px; font-weight: 500; padding: 4px 0;' +
          '}' +
          '.apt-review-correct { color: #9fef00; }' +
          '.apt-review-incorrect { color: #ff4a4a; }';
        document.head.appendChild(style);
      }

      function processQuestion(li) {
        if (!window._aptReviewActive) return;
        if (li.querySelector('.apt-review-ui')) return;
        if (li.getAttribute('data-apt-review-wired') === '1') return;

        var collapse = li.querySelector('.collapse');
        if (!collapse) return;

        var content = collapse.querySelector('.collapse-content');
        if (!content) return;

        var input = content.querySelector('form input[type="text"][disabled]');
        if (!input) return;

        var form = input.closest('form');
        if (!form) return;

        var checkmark = form.querySelector('.text-accent');
        if (!checkmark) return;

        var answer = input.value;
        if (!answer || answer.trim().length === 0) return;
        answer = answer.trim();

        var formWrapper = form.parentElement;
        if (!formWrapper) return;

        var state = window._aptReviewState;
        if (!state || !state.originalValues) return;

        input.setAttribute('data-apt-original-value', answer);
        state.originalValues.set(input, answer);
        input.value = '';
        li.setAttribute('data-apt-review-wired', '1');
        li.setAttribute('data-apt-review-answer', answer);
        formWrapper.setAttribute('data-apt-review', '1');
        formWrapper.style.display = 'none';

        var ui = document.createElement('div');
        ui.className = 'apt-review-ui';

        var reviewInput = document.createElement('input');
        reviewInput.type = 'text';
        reviewInput.className = 'apt-review-input';
        reviewInput.placeholder = 'Re-enter your answer...';

        var checkBtn = document.createElement('button');
        checkBtn.type = 'button';
        checkBtn.className = 'apt-review-btn apt-review-check';
        checkBtn.textContent = 'Check';

        ui.appendChild(reviewInput);
        ui.appendChild(checkBtn);

        var resultEl = document.createElement('div');
        resultEl.className = 'apt-review-result';

        formWrapper.parentNode.insertBefore(ui, formWrapper);
        formWrapper.parentNode.insertBefore(resultEl, formWrapper);

        state.entries.push({
          li: li,
          input: input,
          formWrapper: formWrapper,
          ui: ui,
          resultEl: resultEl,
          answer: answer,
        });

        checkBtn.addEventListener('click', function () {
          var val = reviewInput.value.trim();
          if (!val) return;
          if (val.toLowerCase() === answer.toLowerCase()) {
            resultEl.textContent = 'Correct!';
            resultEl.className = 'apt-review-result apt-review-correct';
          } else {
            resultEl.textContent = 'Incorrect \u2014 try again';
            resultEl.className = 'apt-review-result apt-review-incorrect';
          }
        });

        reviewInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            checkBtn.click();
          }
        });

      }

      function processAll() {
        if (!window._aptReviewActive) return;
        var list = document.getElementById('questions-list');
        if (!list) return;
        var items = list.querySelectorAll('li');
        for (var i = 0; i < items.length; i++) {
          processQuestion(items[i]);
        }
      }

      // Set up observer if not already running (idempotent)
      if (!window._aptReviewObs) {
        var target = document.getElementById('questions-list') || document.body;
        var pending = false;
        var obs = new MutationObserver(function () {
          if (!window._aptReviewActive) return;
          if (pending) return;
          pending = true;
          requestAnimationFrame(function () {
            pending = false;
            processAll();
          });
        });
        obs.observe(target, { childList: true, subtree: true });
        window._aptReviewObs = obs;
      }

      processAll();
    },
  });
