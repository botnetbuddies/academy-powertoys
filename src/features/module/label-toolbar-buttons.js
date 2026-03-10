  registerFeature({
    id: 'label-toolbar-buttons',
    label: 'Label Toolbar Buttons',
    description: 'Add text labels to the icon-only Cheatsheet, Notes, Help, Resources, and TOC buttons',
    scope: 'module',
    default: true,
    cleanup() {
      document.getElementById('apt-label-toolbar')?.remove();
      document.querySelectorAll('.apt-btn-label').forEach(el => el.remove());
      document.querySelectorAll('[data-apt-label]').forEach(el => el.removeAttribute('data-apt-label'));
    },
    run() {
      const styleId = 'apt-label-toolbar';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          button[data-apt-label] {
            width: auto !important;
            aspect-ratio: unset !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 4px 10px 4px 8px !important;
          }
          .apt-btn-label {
            font-size: 14px;
            line-height: 1;
            white-space: nowrap;
          }
        `;
        document.head.appendChild(style);
      }

      // Known SVG path substrings → label
      const knownButtons = [
        { match: 'M4.75 17C4.54167', label: 'Notes' },
        { match: 'M9.99765 15C10.277', label: 'Help' },
        { match: 'M7.5 15V13.5H17', label: 'TOC' },
      ];

      // Full ordered list — buttons always appear in this order
      const orderedLabels = ['Cheatsheet', 'Notes', 'Help', 'Resources', 'TOC'];

      function addLabel(btn, label) {
        btn.setAttribute('data-apt-label', label.toLowerCase());
        const span = document.createElement('span');
        span.className = 'apt-btn-label';
        span.textContent = label;
        btn.appendChild(span);
      }

      function labelButtons() {
        const toolbar = document.querySelector('.navbar ul.menu-horizontal');
        if (!toolbar) return false;

        const items = [...toolbar.querySelectorAll(':scope > li')];
        if (items.length === 0) return false;

        const buttons = items.map(li => li.querySelector('button.htb-square-button')).filter(Boolean);
        if (buttons.length === 0) return false;
        if (buttons.every(b => b.hasAttribute('data-apt-label'))) return true;

        // First pass: identify buttons by SVG content
        const identified = new Map();
        buttons.forEach((btn, i) => {
          if (btn.hasAttribute('data-apt-label')) {
            identified.set(i, btn.getAttribute('data-apt-label'));
            return;
          }
          const html = btn.innerHTML;
          for (const { match, label } of knownButtons) {
            if (html.includes(match)) {
              identified.set(i, label.toLowerCase());
              addLabel(btn, label);
              return;
            }
          }
        });

        // Second pass: fill in unidentified buttons using known order
        if (buttons.length <= orderedLabels.length) {
          const usedLabels = new Set(identified.values());
          const remainingLabels = orderedLabels.filter(l => !usedLabels.has(l.toLowerCase()));
          const unlabeledIndices = [];
          buttons.forEach((btn, i) => {
            if (!btn.hasAttribute('data-apt-label')) unlabeledIndices.push(i);
          });
          unlabeledIndices.forEach((idx, i) => {
            if (i < remainingLabels.length) {
              addLabel(buttons[idx], remainingLabels[i]);
            }
          });
        }

        return true;
      }

      if (!labelButtons()) {
        const obs = new MutationObserver(() => { if (labelButtons()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
      }
    },
  });
