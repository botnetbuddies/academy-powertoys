  registerFeature({
    id: 'aen-blind-mode',
    label: 'AEN Blind Mode',
    description: 'For module Attacking Enterprise Networks sections: hide content except Connect to HTB and Target(s)/Spawn target blocks. Good Luck, Have Fun! Don\'t stop until you have Domain Admin!',
    scope: 'module',
    default: false,
    hotReload: true,
    cleanup() {
      if (window._aptAenBlindModeObs) {
        window._aptAenBlindModeObs.disconnect();
        delete window._aptAenBlindModeObs;
      }
      document.getElementById('apt-aen-blind-mode-style')?.remove();
      document.getElementById('apt-aen-blind-mode-notice')?.remove();
      document.querySelectorAll('[data-apt-aen-hidden="1"]').forEach((el) => {
        el.removeAttribute('data-apt-aen-hidden');
      });
    },
    run() {
      const STYLE_ID = 'apt-aen-blind-mode-style';
      const TARGET_PATH_RE = /^\/app\/module\/163\/section\/\d+(?:\/|$)/;
      const CONNECT_PHRASES = ['connect to htb', 'conenct to htb'];
      const TARGET_PHRASES = ['target(s)', 'spawn the target system'];

      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
          [data-apt-aen-hidden="1"] {
            display: none !important;
          }
          #apt-aen-blind-mode-notice {
            display: block;
            margin: 0 0 12px 0;
            background: #1a1a2e;
            color: #9fef00;
            border: 2px solid #9fef00;
            border-radius: 10px;
            padding: 10px 14px;
            font-size: 22px;
            font-weight: 900;
            line-height: 1.25;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            text-align: center;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          }
        `;
        document.head.appendChild(style);
      }

      function normalize(text) {
        return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
      }

      function findTextNode(root, patterns) {
        if (!root) return null;
        const all = root.querySelectorAll('*');
        for (const el of all) {
          const text = normalize(el.textContent);
          if (!text) continue;
          if (patterns.some((p) => text.includes(p))) return el;
        }
        return null;
      }

      function lca(a, b) {
        if (!a || !b) return null;
        const seen = new Set();
        let cur = a;
        while (cur) {
          seen.add(cur);
          cur = cur.parentElement;
        }
        cur = b;
        while (cur) {
          if (seen.has(cur)) return cur;
          cur = cur.parentElement;
        }
        return null;
      }

      function clearHidden() {
        document.querySelectorAll('[data-apt-aen-hidden="1"]').forEach((el) => {
          el.removeAttribute('data-apt-aen-hidden');
        });
        document.getElementById('apt-aen-blind-mode-notice')?.remove();
      }

      function closestDirectChild(root, node) {
        if (!root || !node) return null;
        let cur = node;
        while (cur && cur.parentElement && cur.parentElement !== root) {
          cur = cur.parentElement;
        }
        return (cur && cur.parentElement === root) ? cur : null;
      }

      function textHasAny(el, phrases) {
        const text = normalize(el?.textContent || '');
        return phrases.some((p) => text.includes(p));
      }

      function hideQuestions(pageRoot, contentRoot) {
        const list = pageRoot.querySelector('#questions-list');
        if (!list) return;

        // Fallback: only hide the questions row itself; never a broad section/card.
        const wrapper = list.closest('#questions-list, [class*="question-list"], [class*="questions-list"], .col-span-full') || list;
        // Safety: never hide containers that include connection/target panels.
        if (wrapper.querySelector?.('#connection-panel, .target-container')) return;
        wrapper.setAttribute('data-apt-aen-hidden', '1');
      }

      function hideQuestionsInside(container) {
        if (!container) return;
        const list = container.querySelector('#questions-list');
        if (!list) return;
        const wrapper = list.closest('#questions-list, [class*="question-list"], [class*="questions-list"], .col-span-full') || list;
        if (wrapper.querySelector?.('#connection-panel, .target-container')) return;
        wrapper.setAttribute('data-apt-aen-hidden', '1');
      }

      function unhideImportantInfoBlocks(root) {
        if (!root) return;
        const needles = ['vhosts needed for these questions', 'vhost needed for these questions'];
        root.querySelectorAll('*').forEach((el) => {
          const text = normalize(el.textContent || '');
          if (!needles.some((n) => text.includes(n))) return;
          const row = el.closest('.col-span-full, .notification, .alert, section, div') || el;
          row.removeAttribute('data-apt-aen-hidden');
        });
      }

      function ensureModeNotice(connectionPanel, connectEl, keepPanel) {
        let el = document.getElementById('apt-aen-blind-mode-notice');
        if (!el) {
          el = document.createElement('div');
          el.id = 'apt-aen-blind-mode-notice';
          el.textContent = 'Academy PowerToys AEN Blind Mode is enabled.';
        }

        // Preferred: place above the "Connect to HTB" block title/content.
        const connectBlock = connectEl?.closest('.col-span-full, .grid, section, .base-card, div');
        if (connectBlock?.parentElement) {
          connectBlock.parentElement.insertBefore(el, connectBlock);
          return;
        }

        if (connectionPanel?.parentElement) {
          connectionPanel.parentElement.insertBefore(el, connectionPanel);
          return;
        }

        if (keepPanel && el.parentElement !== keepPanel) {
          keepPanel.insertBefore(el, keepPanel.firstChild);
        }
      }

      function applyBlindMode() {
        const isTargetPage = TARGET_PATH_RE.test(location.pathname);
        const moduleContent = document.querySelector('.module-content');
        const pageRoot = moduleContent || document.querySelector('main.h-full') || document.body;

        if (!isTargetPage || !pageRoot) {
          clearHidden();
          return;
        }

        const connectionPanel = pageRoot.querySelector('#connection-panel');
        const targetPanel = pageRoot.querySelector('.target-container');
        const connectEl = findTextNode(pageRoot, CONNECT_PHRASES);
        const targetEl = findTextNode(pageRoot, TARGET_PHRASES);

        // Prefer stable structural anchors over phrase matching.
        const keepPanel = lca(connectionPanel, targetPanel)
          || connectionPanel?.closest('.grid.grid-cols-12')
          || targetPanel?.closest('.grid.grid-cols-12')
          || connectEl?.closest('.grid.grid-cols-12')
          || lca(connectEl, targetEl || connectEl);
        if (!keepPanel) {
          clearHidden();
          return;
        }

        const contentRoot = moduleContent || keepPanel.parentElement;

        // Do not hide broad siblings (too risky). Hide only lesson article content.
        const lessonArticle = contentRoot?.querySelector('article');
        if (lessonArticle) {
          lessonArticle.setAttribute('data-apt-aen-hidden', '1');
        }

        // Keep the full Connect/Target grid intact. Only remove questions from it.
        hideQuestionsInside(keepPanel);

        // Blind mode should also suppress solved/practice questions on these sections.
        hideQuestions(pageRoot, contentRoot);

        // Keep critical helper notices visible (e.g. vHosts hint block).
        unhideImportantInfoBlocks(keepPanel);
        ensureModeNotice(connectionPanel, connectEl, keepPanel);
      }

      applyBlindMode();

      if (!window._aptAenBlindModeObs) {
        let rafPending = false;
        const obs = new MutationObserver(() => {
          if (rafPending) return;
          rafPending = true;
          requestAnimationFrame(() => {
            rafPending = false;
            applyBlindMode();
          });
        });
        obs.observe(document.body, { childList: true, subtree: true });
        window._aptAenBlindModeObs = obs;
      }
    },
  });
