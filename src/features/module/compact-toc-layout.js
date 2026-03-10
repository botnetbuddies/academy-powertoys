  registerFeature({
    id: 'compact-toc-layout',
    label: 'Compact TOC Layout',
    description: 'Slim down TOC rows with aligned one-line entries, interactive cube marker, and right-aligned completion check',
    scope: 'module',
    default: true,
    cleanup() {
      document.getElementById('apt-compact-toc-layout')?.remove();
      if (window._aptCompactTocLayoutObs) {
        window._aptCompactTocLayoutObs.disconnect();
        delete window._aptCompactTocLayoutObs;
      }

      document.querySelectorAll('[data-apt-toc-root]').forEach(root => {
        root.removeAttribute('data-apt-toc-root');
      });

      document.querySelectorAll('.base-row[data-apt-toc-compact]').forEach(row => {
        row.removeAttribute('data-apt-toc-compact');
        row.removeAttribute('data-apt-toc-interactive');
        row.removeAttribute('data-apt-toc-completed');
        row.querySelector(':scope > .apt-toc-cell-left')?.remove();
        row.querySelector(':scope > .apt-toc-cell-name')?.remove();
        row.querySelector(':scope > .apt-toc-cell-right')?.remove();
      });
    },
    run() {
      const styleId = 'apt-compact-toc-layout';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Only target actual TOC cards. */
          [data-apt-toc-root] .syllabus-number {
            display: none !important;
          }

          [data-apt-toc-root] .base-row[page] .row-chevron {
            display: none !important;
          }

          /* Hide section progress/count labels in TOC headers (e.g. "4 / 5 Sections"). */
          [data-apt-toc-root] .collapse-title .syllabus-sections {
            display: none !important;
          }

          /* Hide oversized completion marks in section headers (keep compact row indicators only). */
          [data-apt-toc-root] .collapse-title .syllabus-sections .syllabus-sections-inner svg,
          [data-apt-toc-root] .collapse-title .syllabus-sections .syllabus-sections-inner-text svg,
          [data-apt-toc-root] .collapse-title .syllabus-responsive-completed-icon {
            display: none !important;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] {
            display: grid !important;
            grid-template-columns: 14px minmax(0, 1fr) 14px;
            align-items: center !important;
            column-gap: 10px !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .left-container,
          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .right-container {
            display: none !important;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .apt-toc-cell-left,
          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .apt-toc-cell-right {
            width: 14px;
            height: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .apt-toc-cell-name {
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 0.95rem;
            line-height: 1.3;
            text-align: left;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .apt-toc-cell-left::before {
            content: '';
            width: 0;
            height: 0;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"][data-apt-toc-interactive="1"] > .apt-toc-cell-left::before {
            content: '';
            width: 9px;
            height: 9px;
            border: 1.5px solid #9fef00;
            border-radius: 2px;
            background: linear-gradient(145deg, rgba(159, 239, 0, 0.35), rgba(159, 239, 0, 0.14));
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"] > .apt-toc-cell-right::before {
            content: '';
            width: 0;
            height: 0;
          }

          [data-apt-toc-root] .base-row[page][data-apt-toc-compact="1"][data-apt-toc-completed="1"] > .apt-toc-cell-right::before {
            content: '✅';
            width: 14px;
            height: 14px;
            background: transparent;
            border: none;
            font-size: 12px;
            line-height: 1;
            font-weight: 400;
            text-shadow: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        `;
        document.head.appendChild(style);
      }

      function findTocRoots() {
        const roots = [];
        document.querySelectorAll('h3').forEach(h3 => {
          if ((h3.textContent || '').trim().toLowerCase() !== 'table of contents') return;
          const card = h3.closest('.base-card');
          if (card) roots.push(card);
        });
        return roots;
      }

      function ensureCell(row, className) {
        let el = row.querySelector(`:scope > .${className}`);
        if (!el) {
          el = document.createElement('span');
          el.className = className;
          row.appendChild(el);
        }
        return el;
      }

      function compactRow(row) {
        const mainText = row.querySelector('.main-text');
        if (!mainText) return;

        const titleText = (mainText.getAttribute('title') || mainText.textContent || '').trim();
        if (!titleText) return;

        const titleMeta = (row.querySelector('.title')?.textContent || '').trim().toLowerCase();
        const interactiveAttr = (row.getAttribute('interactive') || '').trim().toLowerCase();
        const completedAttr = (row.getAttribute('is_completed') || '').trim().toLowerCase();
        const isInteractive = interactiveAttr === '1' || interactiveAttr === 'true' || titleMeta === 'interactive';
        const isCompleted = completedAttr === '1' || completedAttr === 'true';

        row.dataset.aptTocCompact = '1';
        row.dataset.aptTocInteractive = isInteractive ? '1' : '0';
        row.dataset.aptTocCompleted = isCompleted ? '1' : '0';

        ensureCell(row, 'apt-toc-cell-left');
        const nameCell = ensureCell(row, 'apt-toc-cell-name');
        if (nameCell.textContent !== titleText) nameCell.textContent = titleText;
        ensureCell(row, 'apt-toc-cell-right');
      }

      function compactToc() {
        const roots = findTocRoots();
        if (roots.length === 0) return false;

        roots.forEach(root => {
          root.setAttribute('data-apt-toc-root', '1');
          root.querySelectorAll('.base-row[page]').forEach(compactRow);
        });
        return true;
      }

      compactToc();

      if (!window._aptCompactTocLayoutObs) {
        const obs = new MutationObserver(() => { compactToc(); });
        obs.observe(document.body, { childList: true, subtree: true });
        window._aptCompactTocLayoutObs = obs;
      }
    },
  });
