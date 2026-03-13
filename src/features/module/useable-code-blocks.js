  registerFeature({
    id: 'useable-code-blocks',
    label: 'Readable Code Blocks',
    description: 'Improve code block readability and usability (terminal-style backgrounds, click-to-copy, spacing, and reliable text selection)',
    scope: 'module',
    default: true,
    cleanup() {
      document.getElementById('apt-useable-code-blocks')?.remove();
      if (window._aptReadableCodeBlocksObs) {
        window._aptReadableCodeBlocksObs.disconnect();
        delete window._aptReadableCodeBlocksObs;
      }

      document.querySelectorAll('main.h-full article pre[data-apt-copy-wired="1"]').forEach(pre => {
        const clickHandler = pre._aptCopyClickHandler;
        if (clickHandler) pre.removeEventListener('click', clickHandler);
        delete pre._aptCopyClickHandler;

        const timer = pre._aptCopyStatusTimer;
        if (timer) clearTimeout(timer);
        delete pre._aptCopyStatusTimer;

        const prevTitle = pre.getAttribute('data-apt-prev-title');
        if (prevTitle !== null) {
          if (prevTitle) pre.setAttribute('title', prevTitle);
          else pre.removeAttribute('title');
          pre.removeAttribute('data-apt-prev-title');
        }

        pre.removeAttribute('data-apt-copy-wired');
        pre.removeAttribute('data-apt-terminal');
        pre.removeAttribute('data-apt-bg-kind');
        pre.removeAttribute('data-apt-lang-label');
        pre.classList.remove('apt-copy-success', 'apt-copy-failed');
        pre.querySelector(':scope > .apt-copy-icon')?.remove();
        pre.querySelector(':scope > .apt-copy-status')?.remove();
      });
    },
    run() {
      const styleId = 'apt-useable-code-blocks';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Keep code blocks readable and never clipped */
          main.h-full article pre.shiki,
          main.h-full article pre[class*="language-"] {
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            white-space: pre !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            font-size: 0.95rem !important;
            line-height: 1.55 !important;
            tab-size: 2 !important;
            -moz-tab-size: 2 !important;
            -webkit-overflow-scrolling: touch;
            border-radius: 10px !important;
            border: 1px solid rgba(20, 29, 46, 0.9) !important;
            padding: 0.875rem 1.75rem 0.875rem 1rem !important;
            position: relative !important;
            cursor: copy !important;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }

          /* Terminal styling by language */
          main.h-full article pre[data-apt-terminal="1"] {
            --apt-terminal-bg: #0f111a;
            --apt-terminal-bar-bg: rgba(20, 29, 46, 0.9);
            --apt-terminal-bar-fg: #9eb3ce;
            --shiki-default-bg: var(--apt-terminal-bg) !important;
            background: var(--apt-terminal-bg) !important;
            padding-top: 2.35rem !important;
          }

          main.h-full article pre[data-apt-bg-kind="shell"] {
            --apt-terminal-bg: #0b0c0f;
            --apt-terminal-bar-bg: rgba(19, 28, 43, 0.95);
            --apt-terminal-bar-fg: #9eb3ce;
          }

          main.h-full article pre[data-apt-bg-kind="powershell"] {
            --apt-terminal-bg: #012456;
            --apt-terminal-bar-bg: rgba(19, 28, 43, 0.95);
            --apt-terminal-bar-fg: #9eb3ce;
          }

          main.h-full article pre[data-apt-terminal="1"]::before {
            content: attr(data-apt-lang-label);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.82rem;
            font-weight: 500;
            letter-spacing: 0.2px;
            color: var(--apt-terminal-bar-fg);
            background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.12)), var(--apt-terminal-bar-bg);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            pointer-events: none;
          }

          main.h-full article pre[data-apt-terminal="1"]::after {
            content: '';
            position: absolute;
            top: 0.58rem;
            left: 0.72rem;
            width: 0.54rem;
            height: 0.54rem;
            border-radius: 50%;
            background: #ff5f56;
            box-shadow: 0.9rem 0 0 #ffbd2e, 1.8rem 0 0 #27c93f;
            pointer-events: none;
          }

          main.h-full article pre.apt-copy-success {
            border-color: rgba(159, 239, 0, 0.9) !important;
            box-shadow: 0 0 0 2px rgba(159, 239, 0, 0.25) inset !important;
          }

          main.h-full article pre.apt-copy-failed {
            border-color: rgba(255, 105, 105, 0.9) !important;
            box-shadow: 0 0 0 2px rgba(255, 105, 105, 0.2) inset !important;
          }

          /* Force content width to match longest line so horizontal scroll works */
          main.h-full article pre.shiki > code,
          main.h-full article pre[class*="language-"] > code {
            display: block !important;
            width: max-content !important;
            min-width: 100% !important;
          }

          /* Preserve alignment and enable easy copy */
          main.h-full article pre.shiki .line,
          main.h-full article pre[class*="language-"] .line,
          main.h-full article pre.shiki code,
          main.h-full article pre[class*="language-"] code,
          main.h-full article pre.shiki code *,
          main.h-full article pre[class*="language-"] code * {
            white-space: pre !important;
            user-select: text !important;
            -webkit-user-select: text !important;
            cursor: text !important;
          }

          main.h-full article pre.shiki .line,
          main.h-full article pre[class*="language-"] .line {
            display: block !important;
          }

          /* Keep language badge from blocking selection */
          main.h-full article pre.shiki > .float-end,
          main.h-full article pre[class*="language-"] > .float-end {
            display: none !important;
          }

          main.h-full article pre .apt-copy-status {
            position: absolute;
            top: 0.5rem;
            right: 0.6rem;
            z-index: 4;
            font-size: 11px;
            line-height: 1;
            padding: 0.3rem 0.45rem;
            border-radius: 6px;
            color: #0f111a;
            background: #9fef00;
            opacity: 0;
            transform: translateY(-2px);
            transition: opacity 0.15s ease, transform 0.15s ease;
            pointer-events: none;
          }

          main.h-full article pre .apt-copy-status.show {
            opacity: 1;
            transform: translateY(0);
          }

          main.h-full article pre .apt-copy-status.failed {
            color: #fff;
            background: #d9534f;
          }

          main.h-full article pre .apt-copy-icon {
            position: absolute;
            right: 0.6rem;
            z-index: 3;
            width: 1.22rem;
            height: 1.22rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.92rem;
            font-weight: 700;
            line-height: 1;
            color: #fff;
            background: #0f172a;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
            opacity: 1;
            pointer-events: none;
            transition: opacity 0.15s ease, color 0.15s ease, transform 0.15s ease;
          }

          main.h-full article pre[data-apt-terminal="1"] .apt-copy-icon {
            top: 0.44rem;
          }

          main.h-full article pre:not([data-apt-terminal="1"]) .apt-copy-icon {
            top: 0.5rem;
            background: #111827;
          }

          main.h-full article pre:hover .apt-copy-icon {
            opacity: 1;
            transform: scale(1.06);
          }

          main.h-full article pre.apt-copy-success .apt-copy-icon,
          main.h-full article pre.apt-copy-failed .apt-copy-icon {
            opacity: 0;
          }
        `;
        document.head.appendChild(style);
      }

      const preSelector = 'main.h-full article pre.shiki, main.h-full article pre[class*="language-"]';

      function showStatus(pre, ok) {
        let status = pre.querySelector(':scope > .apt-copy-status');
        if (!status) {
          status = document.createElement('span');
          status.className = 'apt-copy-status';
          pre.appendChild(status);
        }

        status.textContent = ok ? 'Copied' : 'Copy failed';
        status.classList.toggle('failed', !ok);

        pre.classList.remove('apt-copy-success', 'apt-copy-failed');
        pre.classList.add(ok ? 'apt-copy-success' : 'apt-copy-failed');
        status.classList.add('show');

        if (pre._aptCopyStatusTimer) clearTimeout(pre._aptCopyStatusTimer);
        pre._aptCopyStatusTimer = setTimeout(() => {
          status.classList.remove('show');
          pre.classList.remove('apt-copy-success', 'apt-copy-failed');
          delete pre._aptCopyStatusTimer;
        }, 1200);
      }

      function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.style.pointerEvents = 'none';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        let ok = false;
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove();
        return ok;
      }

      function getMarkdownLanguage(language, kind) {
        const lang = String(language || '').toLowerCase();
        if (kind === 'powershell') return 'powershell';
        if (kind === 'shell') {
          const map = {
            cmd: 'cmd',
            'cmd-session': 'cmd',
            cmdsession: 'cmd',
            cmd_session: 'cmd',
            bat: 'cmd',
            batch: 'cmd',
            dos: 'cmd',
            bash: 'bash',
            shellsession: 'bash',
            zsh: 'zsh',
            sh: 'sh',
            shell: 'sh',
            console: 'console',
          };
          return map[lang] || 'bash';
        }
        return lang;
      }

      function escapeHtml(text) {
        return String(text || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function buildHtmlCodeBlock(text, markdownLanguage) {
        const lang = String(markdownLanguage || '').trim();
        const cls = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${cls}>${escapeHtml(text)}</code></pre>`;
      }

      function copyText(text, htmlText) {
        if (!text) return Promise.reject(new Error('empty'));
        if (navigator.clipboard && window.isSecureContext) {
          const canWriteRichClipboard = typeof navigator.clipboard.write === 'function'
            && typeof ClipboardItem === 'function'
            && typeof Blob === 'function'
            && htmlText;
          if (canWriteRichClipboard) {
            const payload = {
              'text/plain': new Blob([text], { type: 'text/plain' }),
            };
            if (htmlText) payload['text/html'] = new Blob([htmlText], { type: 'text/html' });
            const item = new ClipboardItem(payload);
            return navigator.clipboard.write([item]).catch(() => navigator.clipboard.writeText(text));
          }
          return navigator.clipboard.writeText(text);
        }
        return fallbackCopy(text)
          ? Promise.resolve()
          : Promise.reject(new Error('clipboard-unavailable'));
      }

      function getLanguage(pre) {
        const cls = pre.className || '';
        const m = cls.match(/(?:^|\s)language-([a-z0-9_-]+)/i);
        return m ? String(m[1]).toLowerCase() : '';
      }

      function getTerminalKind(language) {
        const lang = String(language || '').toLowerCase();
        const psLanguages = new Set([
          'powershell',
          'powershell-session',
          'powershellsession',
          'powershell_session',
          'pwsh',
          'ps1',
          'ps',
        ]);
        const shellLanguages = new Set([
          'bash',
          'shell',
          'shellsession',
          'sh',
          'zsh',
          'cmd',
          'cmd-session',
          'cmdsession',
          'cmd_session',
          'batch',
          'bat',
          'dos',
          'console',
        ]);
        if (psLanguages.has(lang)) return 'powershell';
        if (shellLanguages.has(lang)) return 'shell';
        return null;
      }

      function getLanguageLabel(language, kind) {
        if (kind === 'powershell') return 'PowerShell';
        if (kind === 'shell') {
          const map = {
            cmd: 'CMD',
            'cmd-session': 'CMD',
            cmdsession: 'CMD',
            cmd_session: 'CMD',
            bat: 'CMD',
            batch: 'CMD',
            dos: 'CMD',
            shellsession: 'Bash',
            sh: 'Shell',
            zsh: 'Zsh',
            bash: 'Bash',
          };
          const label = map[String(language || '').toLowerCase()];
          return label || 'Shell';
        }
        return '';
      }

      function extractCodeText(pre) {
        const code = pre.querySelector('code');
        if (!code) return '';

        // Shiki often renders one span.line per source line; joining these avoids
        // innerText double-newline artifacts when copied.
        const lines = code.querySelectorAll('.line');
        if (lines.length > 0) {
          return [...lines]
            .map(line => String(line.textContent || '')
              .replace(/\r\n?/g, '\n')
              .replace(/\n$/, ''))
            .join('\n')
            .replace(/\n+$/, '');
        }

        return String(code.textContent || '')
          .replace(/\r\n?/g, '\n')
          .replace(/\n+$/, '');
      }

      function wireCopy(pre) {
        if (pre.dataset.aptCopyWired === '1') return;
        pre.dataset.aptCopyWired = '1';

        const language = getLanguage(pre);
        const terminalKind = getTerminalKind(language);
        if (terminalKind) {
          pre.setAttribute('data-apt-terminal', '1');
          pre.setAttribute('data-apt-bg-kind', terminalKind);
          pre.setAttribute('data-apt-lang-label', getLanguageLabel(language, terminalKind));
        }

        if (!pre.querySelector(':scope > .apt-copy-icon')) {
          const icon = document.createElement('span');
          icon.className = 'apt-copy-icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = '⧉';
          pre.appendChild(icon);
        }

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (e.target.closest('a, button, input, textarea, select')) return;
          const selectedText = String(window.getSelection?.() || '').trim();
          if (selectedText) return;

          const text = extractCodeText(pre);
          if (!text) return;
          const markdownLanguage = getMarkdownLanguage(language, terminalKind);
          const htmlText = buildHtmlCodeBlock(text, markdownLanguage);
          copyText(text, htmlText).then(
            () => showStatus(pre, true),
            () => showStatus(pre, false)
          );
        };

        pre.addEventListener('click', onClick);
        pre._aptCopyClickHandler = onClick;
      }

      function wireAllBlocks() {
        document.querySelectorAll(preSelector).forEach(wireCopy);
      }

      wireAllBlocks();

      if (!window._aptReadableCodeBlocksObs) {
        const obs = new MutationObserver(() => { wireAllBlocks(); });
        obs.observe(document.body, { childList: true, subtree: true });
        window._aptReadableCodeBlocksObs = obs;
      }
    },
  });
